# Programmatic Tool Calling (PTC) — Guida ELAB

**Versione**: 1.1
**Data**: 2026-04-20
**Owner**: Andrea Marro
**Goal**: -37% token su batch operations + scalabilità ELAB
**NB**: Tutti agenti Opus 4 (Max subscription Andrea, no per-token cost concern)

---

## 0. TL;DR

Programmatic Tool Calling = Claude scrive codice Python che orchestra tool calls dentro container `code_execution`. Risultati intermedi NON entrano in context window — solo summary finale.

**Numeri ufficiali Anthropic**:
- Token: 43,588 → 27,297 = **-37%** complex research
- Tool Search beta: -**85%** token, Opus 4 accuracy 49% → 74%
- Tool examples: accuracy 72% → 90% complex parameters
- Effort `medium`: -76% token mantenendo Sonnet 4.5 accuracy

**ELAB use case**:
1. Batch UNLIM narrations (92 esperimenti)
2. TRES JOLIE photo convert (92 foto HEIC→WebP)
3. Test multiplication (3604 test generate)
4. RAG re-embed (549+6000 chunk)
5. CoV 3x vitest run aggregation
6. PDF text extraction Vol 1+2+3 parallel
7. Lighthouse audit 27 lezioni parallel
8. Playwright E2E 36 voice command parallel

---

## 1. Quando usare PTC vs tool call diretto

### USE PTC quando:
- Batch >10 item
- Operazioni indipendenti
- Parallelizzabili (asyncio gather safe)
- Risultati intermedi inutili (solo summary serve)
- Idempotent (re-run safe)
- Output aggregabile

### NON usare PTC quando:
- Single tool call (overhead container > savings)
- Sequential dependent (step N usa output step N-1)
- Need user feedback mid-task
- Output enorme da inspezionare singolarmente
- Stateful operations (container ephemeral)

---

## 2. Setup `.claude/tools-config.json`

```json
{
  "code_execution_enabled": true,
  "code_execution_eligible_tools": [
    "Bash", "Read", "Glob", "Grep", "Write", "Edit",
    "mcp__supabase__execute_sql",
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_screenshot",
    "mcp__plugin_serena_serena__find_symbol"
  ],
  "max_parallel_subprocesses": 8,
  "timeout_seconds": 300,
  "memory_limit_mb": 2048,
  "allowed_packages": [
    "anthropic", "asyncio", "aiohttp", "playwright",
    "supabase", "openai", "google-generativeai",
    "pillow", "pdfplumber", "sentence-transformers"
  ]
}
```

API headers:
```
anthropic-version: 2023-06-01
anthropic-beta: code-execution-2024-12-09,programmatic-tool-calling-2024-12-15
```

---

## 3. Pattern PTC — 8 use case ELAB

### Use case 1: Batch 92 UNLIM narrations

```python
import asyncio
import json
from pathlib import Path
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

PRINCIPIO_ZERO = """REGOLE PRINCIPIO ZERO v3:
- "Ragazzi," plurale
- Max 3 frasi + 1 analogia
- Max 60 parole
- FORBIDDEN: "Docente, leggi", "Insegnante, leggi"
"""

async def gen_narration(exp_id, book_text, page):
    resp = await client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=300,
        messages=[{"role": "user", "content": 
            f"Narrazione UNLIM per {exp_id} (pag.{page}).\n"
            f"Testo: {book_text[:2000]}\n{PRINCIPIO_ZERO}"
        }]
    )
    text = resp.content[0].text
    return {
        "exp_id": exp_id,
        "narration": text,
        "words": len(text.split()),
        "violates_pz": "Docente, leggi" in text or "Insegnante, leggi" in text
    }

async def main():
    exp_data = json.loads(Path("/tmp/exp-data.json").read_text())
    sem = asyncio.Semaphore(5)
    
    async def bounded(e):
        async with sem:
            return await gen_narration(e["id"], e["bookText"], e["page"])
    
    results = await asyncio.gather(*[bounded(e) for e in exp_data])
    
    for r in results:
        out = Path(f"/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/narrations/{r['exp_id']}.json")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(r, indent=2))
    
    return {
        "total": len(results),
        "avg_words": sum(r["words"] for r in results) / len(results),
        "violations": [r["exp_id"] for r in results if r["violates_pz"]],
        "max_words": max(r["words"] for r in results)
    }

print(asyncio.run(main()))
```

**Token saving**: 92 narrations × ~1K context = 92K → ~200 token summary = -99.8%.

---

### Use case 2: 92 foto TRES JOLIE convert (HEIC→WebP)

```python
import asyncio
import subprocess
from pathlib import Path

src = Path("/Users/andreamarro/VOLUME 3/MATERIALE/TRES_JOLIE_PHOTOS")
dst = Path("/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/public/tres-jolie")
dst.mkdir(parents=True, exist_ok=True)

def convert_one(src_path):
    out = dst / f"{src_path.stem}.webp"
    res = subprocess.run(
        ["sips", "-s", "format", "webp", "-Z", "1200", str(src_path), "--out", str(out)],
        capture_output=True, text=True, timeout=60
    )
    return {
        "name": src_path.name,
        "ok": res.returncode == 0 and out.exists(),
        "size_kb": out.stat().st_size // 1024 if out.exists() else 0
    }

async def main():
    photos = list(src.glob("*.HEIC")) + list(src.glob("*.jpg"))
    sem = asyncio.Semaphore(8)
    
    async def bounded(p):
        async with sem:
            return await asyncio.to_thread(convert_one, p)
    
    results = await asyncio.gather(*[bounded(p) for p in photos])
    success = [r for r in results if r["ok"]]
    failed = [r for r in results if not r["ok"]]
    
    return {
        "input": len(photos),
        "converted": len(success),
        "failed": len(failed),
        "total_mb": sum(r["size_kb"] for r in success) / 1024,
        "failed_files": [r["name"] for r in failed][:10]
    }

print(asyncio.run(main()))
```

**Token saving**: 92 tool call seq = ~46K → ~150 token summary = -99.7%.

---

### Use case 3: CoV 3x vitest aggregation

```python
import asyncio
import subprocess
import re

def run_vitest():
    res = subprocess.run(
        "cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx vitest run --reporter=dot 2>&1 | tail -5",
        shell=True, capture_output=True, text=True, timeout=600
    )
    out = res.stdout
    pm = re.search(r'Tests\s+(\d+)\s+passed', out)
    fm = re.search(r'(\d+)\s+failed', out)
    return {
        "passed": int(pm.group(1)) if pm else 0,
        "failed": int(fm.group(1)) if fm else 0
    }

async def main():
    runs = await asyncio.gather(
        asyncio.to_thread(run_vitest),
        asyncio.to_thread(run_vitest),
        asyncio.to_thread(run_vitest)
    )
    counts = [r["passed"] for r in runs]
    return {
        "runs": runs,
        "cov_3x_pass": all(r["passed"] >= 12056 for r in runs),
        "consistent": len(set(counts)) == 1,
        "min": min(counts), "max": max(counts)
    }

print(asyncio.run(main()))
```

---

### Use case 4: PDF Vol 1+2+3 parallel extraction

```python
import asyncio
import subprocess
from pathlib import Path

VOLS = {
    "vol1": "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Vol1.pdf",
    "vol2": "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Vol2.pdf",
    "vol3": "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Vol3.pdf"
}

def extract_pdf(vid, pdf_path):
    out = f"/tmp/{vid}.txt"
    subprocess.run(["pdftotext", pdf_path, out], capture_output=True, timeout=120)
    text = Path(out).read_text() if Path(out).exists() else ""
    return {
        "vol": vid,
        "chars": len(text),
        "words": len(text.split()),
        "pages_est": len(text) // 3500
    }

async def main():
    results = await asyncio.gather(*[
        asyncio.to_thread(extract_pdf, vid, p) for vid, p in VOLS.items()
    ])
    return {
        "total_chars": sum(r["chars"] for r in results),
        "total_words": sum(r["words"] for r in results),
        "vols": results
    }

print(asyncio.run(main()))
```

---

### Use case 5: 549 RAG chunk re-embed BGE-M3

```python
import asyncio
import json
from pathlib import Path
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key="dummy", base_url="http://72.60.129.50:8001/v1")
rag_path = Path("/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/rag-chunks.json")

async def embed(chunk):
    resp = await client.embeddings.create(model="bge-m3", input=chunk["text"])
    chunk["embedding"] = resp.data[0].embedding
    chunk["model"] = "bge-m3"
    return chunk

async def main():
    chunks = json.loads(rag_path.read_text())
    sem = asyncio.Semaphore(16)
    
    async def bounded(c):
        async with sem:
            return await embed(c)
    
    results = await asyncio.gather(*[bounded(c) for c in chunks])
    rag_path.write_text(json.dumps(results, indent=2))
    
    return {
        "total": len(results),
        "embedding_dim": len(results[0]["embedding"]),
        "file_mb": rag_path.stat().st_size / 1024 / 1024
    }

print(asyncio.run(main()))
```

---

### Use case 6: 6000+ RAG chunk generation

```python
import asyncio
import json
from pathlib import Path

VOLS = {"vol1": "/tmp/vol1.txt", "vol2": "/tmp/vol2.txt", "vol3": "/tmp/vol3.txt"}

def split_chunks(text, max_size=500):
    paras = text.split("\n\n")
    chunks, cur = [], ""
    for p in paras:
        if len(cur) + len(p) > max_size:
            if cur: chunks.append(cur.strip())
            cur = p
        else:
            cur += "\n\n" + p
    if cur: chunks.append(cur.strip())
    return chunks

def process_vol(vid, path):
    text = Path(path).read_text()
    chunks = split_chunks(text)
    return {
        "vol": vid,
        "count": len(chunks),
        "chunks": [{"id": f"{vid}-{i:04d}", "text": c, "source": vid, "len": len(c)}
                   for i, c in enumerate(chunks)]
    }

async def main():
    results = await asyncio.gather(*[
        asyncio.to_thread(process_vol, v, p) for v, p in VOLS.items()
    ])
    all_chunks = [c for r in results for c in r["chunks"]]
    
    out = Path("/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/rag-chunks-v2.json")
    out.write_text(json.dumps(all_chunks, indent=2))
    
    return {
        "total": len(all_chunks),
        "by_vol": {r["vol"]: r["count"] for r in results},
        "avg_size": sum(c["len"] for c in all_chunks) / len(all_chunks)
    }

print(asyncio.run(main()))
```

---

### Use case 7: Lighthouse 27 lezioni audit

```python
import asyncio
import subprocess
import json
from pathlib import Path

URLS = [f"https://www.elabtutor.school/lezione/{i}" for i in range(1, 28)]

def audit(url):
    out = "/tmp/lh.json"
    res = subprocess.run([
        "lighthouse", url, "--output=json", f"--output-path={out}",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--chrome-flags=--headless", "--quiet"
    ], capture_output=True, timeout=120)
    
    if res.returncode == 0 and Path(out).exists():
        data = json.loads(Path(out).read_text())
        return {
            "url": url,
            "perf": data["categories"]["performance"]["score"] * 100,
            "a11y": data["categories"]["accessibility"]["score"] * 100,
            "best": data["categories"]["best-practices"]["score"] * 100,
            "seo": data["categories"]["seo"]["score"] * 100
        }
    return {"url": url, "error": True}

async def main():
    sem = asyncio.Semaphore(4)
    async def bounded(u):
        async with sem:
            return await asyncio.to_thread(audit, u)
    
    results = await asyncio.gather(*[bounded(u) for u in URLS])
    valid = [r for r in results if not r.get("error")]
    
    return {
        "audited": len(valid),
        "failed": len(results) - len(valid),
        "avg_perf": sum(r["perf"] for r in valid) / len(valid),
        "avg_a11y": sum(r["a11y"] for r in valid) / len(valid),
        "worst_perf_url": min(valid, key=lambda r: r["perf"])["url"]
    }

print(asyncio.run(main()))
```

---

### Use case 8: 36 voice command Playwright E2E

```python
import asyncio
from playwright.async_api import async_playwright

VOICE_CMDS = [
    "ehi unlim aiutami", "ehi unlim spiegami questo",
    "ehi unlim accendi led", "ehi unlim collega resistore",
    # ... 36 totali
]

async def test_cmd(cmd, browser):
    page = await browser.new_page()
    try:
        await page.goto("https://www.elabtutor.school")
        await page.click("text=#tutor")
        await page.wait_for_selector("[data-testid=voice-mic]", timeout=10000)
        
        await page.evaluate(f"""
            window.dispatchEvent(new CustomEvent('elab-voice-result', {{
                detail: {{ transcript: '{cmd}' }}
            }}));
        """)
        
        await page.wait_for_selector("[data-testid=unlim-response]", timeout=8000)
        text = await page.text_content("[data-testid=unlim-response]")
        
        return {
            "cmd": cmd,
            "ok": True,
            "words": len(text.split()),
            "violates_pz": any(f in text for f in ["Docente, leggi", "Insegnante, leggi"]),
            "max60": len(text.split()) <= 60
        }
    except Exception as e:
        return {"cmd": cmd, "ok": False, "err": str(e)[:100]}
    finally:
        await page.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        sem = asyncio.Semaphore(6)
        async def bounded(c):
            async with sem:
                return await test_cmd(c, browser)
        
        results = await asyncio.gather(*[bounded(c) for c in VOICE_CMDS])
        await browser.close()
    
    success = [r for r in results if r["ok"]]
    return {
        "total": len(VOICE_CMDS),
        "ok": len(success),
        "failed": len(results) - len(success),
        "pz_violations": sum(1 for r in success if r.get("violates_pz")),
        "over_60w": sum(1 for r in success if not r.get("max60"))
    }

print(asyncio.run(main()))
```

---

## 4. Tool Search beta — load tools on-demand

Numeri: -85% token, Opus 4 accuracy 49% → 74%.

Setup: `anthropic-beta: tool-search-2024-12-15` header.

Use case: con 200+ tool MCP, Tool Search filtra solo rilevanti per query.

Esempio: "Test E2E lavagna" → carica solo playwright/vitest/Bash, NON Supabase/Sentry/Notion = -97% token tool defs.

---

## 5. Tool examples (accuracy 72% → 90%)

```json
{
  "name": "compile_arduino",
  "description": "Compile Arduino C++ to HEX",
  "input_schema": {...},
  "examples": [
    {
      "input": {"code": "void setup(){}", "board": "nano"},
      "output": {"hex": "...", "size_bytes": 444, "errors": []}
    },
    {
      "input": {"code": "int x = badcode;", "board": "uno"},
      "output": {"hex": null, "errors": ["expected ';'"]}
    }
  ]
}
```

ELAB tool da ridefinire con examples:
- `compile_arduino` (n8n)
- `unlim_chat`, `unlim_diagnose`, `unlim_tts` (Edge Functions)
- `simulator_api` (window.__ELAB_API)

---

## 6. Effort parameter — speed vs thoroughness

**Direttiva user 20/04**: tutti agenti **Opus 4 only** (Max subscription Andrea, no per-token concern).

Effort parameter mantenuto come quality knob (NON cost optimization):

| Agente | Effort | Razionale |
|--------|--------|-----------|
| TPM | `low` | Coordination semplice |
| ARCHITECT | **`high`** | Decisioni critiche |
| DEV | `medium` | Implementation routinaria |
| TESTER | `medium` | Test routinari |
| REVIEWER | **`high`** | Quality gate critico |
| AUDITOR | **`high`** | Massima onestà |

Override Opus rate limit:
- Max plan ha quota Opus generosa
- Monitor weekly: `claude usage --period week`
- Se 80% quota a metà settimana → spread task su giorni

---

## 7. Best practices PTC — rules ferree

### Rule 1: Idempotent operations only
Container può crash + retry. Operazioni safe a re-run obbligatorie.

### Rule 2: Clear return format
Output dict strutturato + finito. Mai `return all_92_results` (too big). Sempre summary aggregated.

### Rule 3: Error handling robusto
```python
async def safe_op(item):
    try:
        return await do_work(item)
    except Exception as e:
        return {"item": item, "error": str(e)[:200], "ok": False}

results = await asyncio.gather(*[safe_op(i) for i in items], return_exceptions=True)
```

### Rule 4: Rate limit respect
- Anthropic API: Semaphore(5)
- Local services: Semaphore(16)
- Browser ops: Semaphore(4)

### Rule 5: Timeout always
```python
res = subprocess.run([...], timeout=60, capture_output=True)
```

### Rule 6: Logging persistent
```python
import logging
logging.basicConfig(filename="/tmp/ptc-run.log", level=logging.INFO)
```

### Rule 7: State file persistence
Save progress incremental per resume su crash:
```python
state = json.loads(state_path.read_text()) if state_path.exists() else {"done": [], "fail": []}
# ... process ...
state_path.write_text(json.dumps(state))
```

---

## 8. Integrazione PTC con Team Agenti (tutti Opus)

| Agente | Quando PTC | Use case |
|--------|-----------|----------|
| TPM | Mai | — |
| ARCHITECT | Raramente | Audit codebase 100+ file |
| **DEV** | **Spesso** | Batch import 92 foto, 3604 test, 549 chunk re-embed |
| **TESTER** | **Spesso** | CoV 3x vitest, 27 Lighthouse, 36 voice E2E |
| REVIEWER | Raramente | Multi-PR review parallelo |
| **AUDITOR** | **Spesso** | Live verify 27 URL, score benchmark fast |

Pattern dispatch DEV con PTC:
```
@team-dev "Task T2-005: Batch re-embed 549 RAG chunk con BGE-M3.
USE PROGRAMMATIC TOOL CALLING (allowed_callers: code_execution).
Acceptance:
- Container Python asyncio.gather, Semaphore(16)
- Output summary JSON in context (~200 token)
- File salvati src/data/rag-chunks-v2.json
- State /tmp/ptc-state.json resume-safe
- Log /tmp/ptc-run.log
Constraints: max 5 min runtime, retry single fail 1x."
```

---

## 9. Costi PTC — Max subscription assorbe tutto

**Andrea Claude Code Max**: Opus quota generosa, no per-token billing per uso normale.

**Senza PTC** (sequenziale): ~2.3M token I/O × 8 sett = consuma quota Max veloce, rischio rate limit.

**Con PTC** (-99% summary in context): ~10K context × 8 sett = quota Max mai vicina al limit.

**Vantaggio reale PTC con Max**:
- Non cost saving ($)
- Ma **headroom** quota Max preservato per altre tasks
- Latenza: container parallel = -90% wall-clock time
- Quality: meno context = meno "context anxiety" model

---

## 10. Setup pratico — Lunedì 21/04 mattina

1. Create `.claude/tools-config.json` con `code_execution_enabled: true`
2. Verifica beta header attivo (sessione Claude CLI Max)
3. Test PTC con use case semplice (CoV 3x vitest):
   ```
   "Run vitest 3x in parallel via PTC, return only summary"
   ```
4. Verifica output context ~200 token (no flooding)
5. Documenta in handoff: PTC OK, primi use case operativi
6. Train DEV/TESTER/AUDITOR: prompt template con PTC instruction esplicita

---

## 11. Sources

- [Programmatic tool calling — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Code execution tool — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)
- [Cookbook PTC](https://platform.claude.com/cookbook/tool-use-programmatic-tool-calling-ptc)
- [Introducing advanced tool use — Anthropic](https://www.anthropic.com/engineering/advanced-tool-use)
- [PTC dev guide — ikangai](https://www.ikangai.com/programmatic-tool-calling-with-claude-code-the-developers-guide-to-agent-scale-automation/)
- [Issue claude-code #12836 — Tool Search + PTC](https://github.com/anthropics/claude-code/issues/12836)

---

## 12. Forza ELAB. PTC operativo da sett 1.
