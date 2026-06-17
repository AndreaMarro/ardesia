# PDR Giorno 4 — Giovedì 24/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea + Tea + Team Opus
**Capacity**: Andrea 8h + Tea 4h

## 0. Goal del giorno

**Vol 3 P0 parity (cap 6-8 bookText) via PTC parallel + Bug T1 #4 (Vision live test) + Tea PR #1 glossario.**

## 1. Pre-flight (9:00)

```bash
git status
git pull
npx vitest run --reporter=dot | tail -3  # ≥12060
ls public/tres-jolie/ | wc -l            # ≥92 (verifica ieri)
gh workflow list                          # auto-merge attivo
```

## 2. Task del giorno

### Task 1 (P0) — Vol 3 cap 6-8 bookText 100% (4h)
- **Owner**: ARCHITECT design + DEV PTC + TESTER verify
- **Files**: `src/data/volume-references.js` (update bookText vol3-cap6-8)
- **Acceptance**: 100% esperimenti vol3 cap 6-8 con bookText (~2000 char ognuno)
- **PTC**: vedi PROGRAMMATIC_TOOL_CALLING.md sezione 3 use case 4 (parallel grep PDF)

### Task 2 (P0) — Bug T1 #4 fix: Vision non testata live (3h)
- **Owner**: DEV + TESTER
- **Files**: `tests/e2e/vision-diagnose.spec.js`, `src/services/api.js` (vision endpoint)
- **Acceptance**: trigger "guarda mio circuito" → screenshot → Gemini Vision → diagnosi response E2E PASS
- **Test**: Playwright E2E + live verify produzione

### Task 3 (P1) — Tea PR #1 glossario primo flow auto-merge (1h Tea)
- **Owner**: Tea
- **Files**: `src/data/glossary.js` (aggiungi 10 termini elettrotecnica)
- **Acceptance**: PR aperta, CI verde, auto-merge scatta, deploy preview verde

### Task 4 (P1) — Render warmup verify 24h (Andrea check)
- **Owner**: Andrea
- **Acceptance**: Render `/health` cold start ≤5s in 5/5 random check

### Task 5 (P2) — Update tasks-board + decisions-log
- **Owner**: TPM agente

## 3. Multi-agent dispatch

### Mattina 10:00 — parallel triade Vol 3
```
@team-architect "Design pattern PTC per estrazione bookText Vol3 cap 6-8.
27 esperimenti totali in cap 6-8. PDF: /Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Vol3.pdf.
Output: docs/architectures/vol3-bookText-extraction-ptc.md."

@team-dev "ASPETTA blueprint Architect.
Implementa PTC use case 4 (parallel grep PDF).
Output: src/data/volume-references.js updated.
Verify: tutti 27 esperimenti cap 6-8 con bookText non-empty."

@team-tester "Scrivi test verifica bookText Vol3.
File: tests/unit/data/volume-references-vol3.test.js.
Acceptance: 27/27 esperimenti cap 6-8 con bookText.length >100."

@team-dev "PARALLEL TASK: Bug T1 #4 Vision live test.
Files: tests/e2e/vision-diagnose.spec.js + src/services/api.js verify endpoint.
Acceptance: trigger 'guarda mio circuito' → screenshot → Gemini Vision response."
```

### Pomeriggio 14:00 — Tea PR #1 monitoring
- Tea apre PR glossario
- Andrea live verify auto-merge scatta
- Se non scatta → debug + fix workflow

### Tardo 16:00
- @team-reviewer review tutti PR aperti oggi
- @team-auditor live verify Vol3 bookText + Vision

### Sera 17:30
- Handoff doc

## 4. Programmatic Tool Calling

**Use case principale**: PTC use case 4 (PDF Vol3 parallel grep)

```python
import asyncio
import re
from pathlib import Path

vol3_text = Path("/tmp/vol3.txt").read_text()
EXP_IDS = [f"v3-cap{c}-esp{e}" for c in [6,7,8] for e in range(1, 10)]

def find_book_text(exp_id):
    chap = re.search(r'cap(\d+)', exp_id).group(1)
    esp = re.search(r'esp(\d+)', exp_id).group(1)
    pattern = rf"Esperimento {esp}.*?(?=Esperimento {int(esp)+1}|Capitolo|\Z)"
    m = re.search(pattern, vol3_text, re.DOTALL)
    return exp_id, m.group(0)[:2000] if m else None

async def main():
    results = await asyncio.gather(*[asyncio.to_thread(find_book_text, e) for e in EXP_IDS])
    found = [(eid, txt) for eid, txt in results if txt]
    missing = [eid for eid, txt in results if not txt]
    return {"found": len(found), "missing": missing}

print(asyncio.run(main()))
```

## 5. Comunicazione
- Tea PR #1 GH async
- Andrea Telegram check-in Tea pomeriggio

## 6. Definition of Done giorno 4
- [ ] Vol 3 cap 6-8 bookText 100% (27/27)
- [ ] Bug T1 #4 Vision E2E PASS
- [ ] Tea PR #1 auto-merged green
- [ ] Render warmup verified 24h
- [ ] Test count ≥12090
- [ ] Handoff doc

## 7. Rischi
- PDF Vol3 OCR errori → fallback Tesseract per pages problematiche
- Vision endpoint Gemini API rate limit → mock test partial
- Auto-merge Action prima esecuzione fail (GH workflow latency) → retry manual

## 8. Skills + MCP
- `feature-dev:code-architect` (Vol3 pattern design)
- `acrobat` MCP (PDF Vol3 manipulation se needed)
- `playwright` (Vision E2E)

## 9. Self-critica
[Compilare]

## 10. Handoff
`docs/handoff/2026-04-24-end-day.md`

---
**Forza ELAB. Vol3 cap 6-8 + Vision live + Tea PR #1.**
