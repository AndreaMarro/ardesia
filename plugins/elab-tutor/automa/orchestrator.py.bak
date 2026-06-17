#!/usr/bin/env python3
"""
ELAB Automa — Orchestrator
The heart of the autonomous loop.
1. Runs 7 quick checks (~3 min)
2. Composes prompt with results + state + next task
3. Launches `claude -p` headless to WORK (max 25 min)
4. Saves report JSON + updates state.json
5. Manages daily token budget
6. Includes 1 micro-research per cycle
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, date
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
STATE_FILE = AUTOMA_ROOT / "state" / "state.json"
REPORTS_DIR = AUTOMA_ROOT / "reports"
HEARTBEAT_FILE = AUTOMA_ROOT / "state" / "heartbeat"

# Ensure dirs
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "state").mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "logs").mkdir(parents=True, exist_ok=True)

# Import our modules
sys.path.insert(0, str(AUTOMA_ROOT))
from checks import run_all_checks, print_results
from queue_manager import get_next_task, claim_task, complete_task, fail_task, stats
from tools import search_papers, gulpease_index, chat_galileo


def load_state() -> dict:
    """Load current state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"loop": {"cycles_today": 0, "status": "not_started"}, "budget": {"spent_today_eur": 0}}


def save_state(state: dict):
    """Save updated state."""
    state["updated"] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


def write_heartbeat():
    """Write heartbeat for watchdog."""
    HEARTBEAT_FILE.write_text(datetime.now().isoformat())


def compose_prompt(check_results: list, task: dict | None, state: dict,
                   mode: str = "IMPROVE", program: str = "") -> str:
    """Compose the prompt for Claude Code headless."""
    # Check summary
    check_summary = "\n".join(
        f"  {'✅' if r['status']=='pass' else '❌' if r['status']=='fail' else '⚠️'} {r['name']}: {r['detail'][:100]}"
        for r in check_results
    )
    failed_checks = [r for r in check_results if r["status"] == "fail"]

    # Priority: fix failed checks FIRST, then work by mode
    if failed_checks:
        work_section = f"""## PRIORITY: FIX FAILED CHECKS
The following checks FAILED. Fix them BEFORE working on any task.
{chr(10).join(f"- {r['name']}: {r['detail']}" for r in failed_checks)}

Fix these issues. Run `npm run build` after any code changes. Verify the fix works.
"""
    elif mode == "IMPROVE" and task:
        work_section = f"""## MODE: IMPROVE — Migliora il codice
TASK: {task.get('title', 'Unknown')}
Priority: {task.get('priority', '?')}
Description: {task.get('description', 'No description')}

Complete this task. Test. `npm run build`. Verify. Keep/discard.
Dopo il task: `python3 automa/evaluate.py` per misurare l'impatto.
"""
    elif mode == "RESEARCH":
        work_section = """## MODE: RESEARCH — Studia e scopri
Usa i tool AI per ricerca:
1. `python3 -c "from automa.tools import search_papers; print(search_papers('EdTech electronics children', 5))"` per paper
2. `python3 -c "from automa.tools import call_gemini; print(call_gemini('Analizza competitor EdTech simulatori elettronica scuole medie Italia 2026'))"` per market analysis
3. Salva findings in `automa/knowledge/research-cycle-{cycle}.md`
4. Se trovi un problema concreto, crea un task in `automa/queue/pending/`
"""
    elif mode == "WRITE":
        work_section = """## MODE: WRITE — Produci un articolo
Scrivi UN articolo in `automa/articles/`. Formato:
- Frontmatter YAML: title, author (Andrea Marro), date, tags, watermark
- 500-1000 parole. Argomenti: come ELAB cambia la didattica, tutorial insegnanti,
  trend EdTech, confronto competitor, storie di successo.
- Tono: professionale ma accessibile. L'insegnante inesperto è il lettore target.
- Watermark: "© Andrea Marro — ELAB Tutor" in footer.
"""
    elif mode == "AUDIT":
        work_section = """## MODE: AUDIT — Trova bug e problemi
1. Naviga il sito con Playwright come un utente reale
2. Esegui `npx axe https://www.elabtutor.school` per accessibilità
3. Esegui `npx lighthouse https://www.elabtutor.school --quiet --chrome-flags=--headless` per performance
4. Ogni bug trovato → crea task YAML in `automa/queue/pending/`
5. Report in `automa/reports/audit-cycle-{cycle}.md`
"""
    elif mode == "EVOLVE":
        work_section = """## MODE: EVOLVE — Migliora il sistema stesso
1. Rivedi results.tsv — quale metrica è troppo facile? Quale manca?
2. Proponi nuove metriche in `automa/metrics-proposals.md`
3. Rivedi le frequenze tool — DeepSeek/Gemini/Kimi vengono usati abbastanza?
4. Il sistema si auto-migliora: se qualcosa non funziona, fixalo.
"""
    else:
        work_section = """## MODE: IMPROVE — Nessun task specifico
Guarda PDR.md e trova il prossimo miglioramento da fare.
Priorità: esperienza insegnante > UX simulatore > bug > performance.
"""

    # Load context files
    context_parts = []
    for ctx_file in ["context/teacher-principles.md", "context/volume-path.md"]:
        ctx_path = AUTOMA_ROOT / ctx_file
        if ctx_path.exists():
            context_parts.append(ctx_path.read_text()[:2000])

    pdr_path = AUTOMA_ROOT / "PDR.md"
    pdr_summary = ""
    if pdr_path.exists():
        pdr_summary = pdr_path.read_text()[:3000]

    # CONTEXT CONTINUITY: multi-layer memory for inter-cycle awareness
    # Layer 1: results.tsv (experiment history)
    results_tsv = ""
    tsv_path = AUTOMA_ROOT / "results.tsv"
    if tsv_path.exists():
        lines = tsv_path.read_text().strip().splitlines()
        results_tsv = "\n".join(lines[:1] + lines[-20:])

    # Layer 2: last cycle report (what happened immediately before)
    last_report = ""
    report_files = sorted(REPORTS_DIR.glob("2*.json"))  # Only cycle reports (start with date)
    if report_files:
        last_report = report_files[-1].read_text()[:1500]

    # Layer 3: handoff (session-level context)
    handoff = ""
    handoff_path = AUTOMA_ROOT / "handoff.md"
    if handoff_path.exists():
        handoff = handoff_path.read_text()[:1500]

    # Layer 4: git log (what changed in code recently)
    git_log = ""
    try:
        r = subprocess.run(["git", "log", "--oneline", "-10"],
                           capture_output=True, text=True, cwd=str(PROJECT_ROOT), timeout=5)
        git_log = r.stdout.strip()
    except Exception:
        pass

    # Layer 5: knowledge index (what research exists)
    knowledge_index = ""
    knowledge_dir = AUTOMA_ROOT / "knowledge"
    if knowledge_dir.exists():
        files = sorted(knowledge_dir.glob("*.md"))
        knowledge_index = "\n".join(f"  - {f.stem}" for f in files[-15:])

    # Layer 6: AI feedback history (persisted scoring/reviews)
    ai_history = ""
    ai_log_path = AUTOMA_ROOT / "state" / "ai-feedback.log"
    if ai_log_path.exists():
        lines = ai_log_path.read_text().strip().splitlines()
        ai_history = "\n".join(lines[-10:])  # Last 10 AI feedback entries

    # Layer 7: current composite score (if evaluate.py was run)
    eval_score = ""
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    if eval_path.exists():
        eval_score = eval_path.read_text()[:500]

    # Layer 8: SQLite context DB summary (persistent cross-cycle knowledge)
    db_summary = ""
    try:
        from context_db import get_context_summary
        db_summary = get_context_summary()
    except Exception:
        pass

    prompt = f"""Sei l'agente autonomo di ELAB Tutor (ELAB Autoresearch). Lavori in italiano. Project root: {PROJECT_ROOT}
Modo corrente: {mode}

## PROGRAMMA AUTORESEARCH
{program[:3000]}


## PRINCIPIO ZERO
L'insegnante è il vero utente. Galileo è un libro intelligente, non un professore.
Tutti possono insegnare con ELAB Tutor. L'insegnante impara mentre insegna.
Il linguaggio sulla LIM è SEMPRE 10-14 anni. Galileo segue i volumi ELAB — non usa mai termini di capitoli futuri.

## CONTESTO PEDAGOGICO
{chr(10).join(context_parts[:2])}

## PIANO (PDR)
{pdr_summary[:2000]}

## CONTESTO TRA CICLI — 7 LAYER DI MEMORIA

### 1. Esperimenti passati (results.tsv)
{results_tsv if results_tsv else "(primo ciclo — nessun esperimento)"}

### 2. Ultimo ciclo
{last_report[:600] if last_report else "(primo ciclo)"}

### 3. Handoff sessione
{handoff[:600] if handoff else "(nessun handoff)"}

### 4. Ultimi commit
{git_log if git_log else "(git non disponibile)"}

### 5. Ricerche disponibili in knowledge/
{knowledge_index if knowledge_index else "(nessuna ricerca)"}
Per leggere un file: `cat automa/knowledge/NOME.md`

### 6. Feedback AI precedenti
{ai_history if ai_history else "(nessun feedback AI precedente)"}

### 7. Score composito corrente
{eval_score if eval_score else "(evaluate.py non ancora eseguito — ESEGUILO come prima cosa!)"}

### 8. Context Database (SQLite — memoria persistente)
{db_summary if db_summary else "(DB vuoto)"}

## RISULTATI CHECK (appena eseguiti)
{check_summary}

{work_section}

## REGOLE INDEROGABILI
1. ZERO REGRESSIONI — `npm run build` DEVE passare. Se rompi qualcosa, fixalo prima di continuare.
2. CoV (Chain of Verification) su ogni output — verifica punto per punto che funzioni.
3. Massima onestà — se qualcosa non funziona, scrivi FAIL non "parzialmente ok".
4. L'insegnante è il vero utente — ogni modifica deve migliorare la sua esperienza.
5. iPad e LIM sono vincoli centrali — touch ≥56px, font leggibili, no overflow.
6. Dopo il lavoro, fai 1 micro-ricerca: cerca su Semantic Scholar un paper utile al task appena fatto.
7. Scrivi cosa hai fatto in reports/ — brutale onestà sui risultati.

## TOOLS DISPONIBILI
- DeepSeek R1: per scoring/giudizio (API key in automa/.env)
- Gemini 2.5 Pro: per vision screenshot e ricerca
- Kimi K2.5: per review e secondo parere
- Brain VPS (72.60.129.50:11434): per test routing
- Playwright: per test browser reali
- Semantic Scholar API: per ricerca paper

## OUTPUT (OBBLIGATORIO)
Alla FINE del lavoro, scrivi un JSON summary sull'ULTIMA riga:
{{"task": "descrizione", "status": "done|partial|failed", "files_changed": ["file1.js"], "build_pass": true, "cov_verified": true, "research": "1 paper trovato: ..."}}
"""
    return prompt


def run_claude_headless(prompt: str, max_time: int = 1500) -> dict:
    """Launch Claude Code headless with prompt. Returns result dict."""
    log_file = AUTOMA_ROOT / "logs" / f"claude-{datetime.now().strftime('%H%M%S')}.log"

    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=max_time,
            cwd=str(PROJECT_ROOT),
            env={**os.environ, "CLAUDE_AUTO_ACCEPT": "1"},
        )

        output = result.stdout
        log_file.write_text(f"=== PROMPT ===\n{prompt[:500]}\n\n=== OUTPUT ===\n{output}")

        # Try to extract JSON result from last line
        lines = output.strip().splitlines()
        for line in reversed(lines):
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    return json.loads(line)
                except json.JSONDecodeError:
                    pass

        return {
            "task": "unknown",
            "status": "done" if result.returncode == 0 else "failed",
            "output_length": len(output),
            "returncode": result.returncode,
        }

    except subprocess.TimeoutExpired:
        return {"task": "timeout", "status": "failed", "error": f"Timed out after {max_time}s"}
    except FileNotFoundError:
        return {"task": "no_claude", "status": "failed", "error": "claude CLI not found in PATH"}
    except Exception as e:
        return {"task": "error", "status": "failed", "error": str(e)[:300]}


def select_mode(cycle: int, check_results: list, task: dict | None) -> str:
    """Autoresearch mode selection based on cycle number and state.
    Modes: IMPROVE, RESEARCH, WRITE, AUDIT, EVOLVE"""
    failed = [r for r in check_results if r["status"] == "fail"]
    if failed:
        return "IMPROVE"  # Always fix failures first

    # Frequency table from program.md
    if cycle % 20 == 0 and cycle > 0:
        return "WRITE"     # Every 20 cycles: write an article
    if cycle % 10 == 0 and cycle > 0:
        return "EVOLVE"    # Every 10 cycles: review metrics
    if cycle % 5 == 0:
        return "AUDIT"     # Every 5 cycles: find bugs with Playwright
    if cycle % 3 == 0:
        return "RESEARCH"  # Every 3 cycles: Semantic Scholar + Gemini
    return "IMPROVE"       # Default: improve code/prompts


def ai_scoring(state: dict, cycle: int) -> str | None:
    """Use DeepSeek/Gemini/Kimi at scheduled intervals."""
    from tools import call_deepseek_reasoner, call_gemini, call_kimi

    results = []

    # Every 5 cycles: DeepSeek scores Galileo responses
    if cycle % 5 == 0:
        galileo_resp = chat_galileo("Cos'è un LED e come si usa con la breadboard?")
        if not galileo_resp["error"]:
            score = call_deepseek_reasoner(
                f"Valuta questa risposta di un tutor AI per bambini 10 anni su una scala 1-10.\n"
                f"Criteri: chiarezza, età-appropriatezza, correttezza, incoraggiamento.\n"
                f"Risposta da valutare:\n{galileo_resp['response'][:1000]}\n"
                f"Rispondi SOLO con: SCORE:N MOTIVO:breve spiegazione"
            )
            results.append(f"DeepSeek scoring: {score[:200]}")
    # Persist AI feedback
    _persist_ai_feedback(f"[DeepSeek score] {score[:300]}")

    # Every 10 cycles: Gemini competitor analysis
    if cycle % 10 == 0:
        analysis = call_gemini(
            "Analizza brevemente il mercato EdTech italiano 2026 per simulatori di elettronica "
            "nelle scuole medie. Chi sono i competitor di ELAB Tutor? Cosa manca nel mercato? "
            "Max 200 parole, fatti concreti."
        )
        results.append(f"Gemini market: {analysis[:300]}")
    _persist_ai_feedback(f"[Gemini market] {analysis[:300]}")

    # Every 10 cycles: Kimi review
    if cycle % 10 == 5:
        kimi_review = call_kimi(
            f"Sei un reviewer esperto di EdTech. Lo stato del progetto ELAB Tutor:\n"
            f"- 62 esperimenti di elettronica per bambini 8-14\n"
            f"- AI tutor 'Galileo' con 5 specialisti (circuit, code, tutor, vision, teacher)\n"
            f"- Simulatore browser con KVL/KCL solver + AVR emulation\n"
            f"- Score attuale: {json.dumps(state.get('scores', {}))}\n"
            f"Cosa miglioreresti? Max 200 parole, concreto."
        )
        results.append(f"Kimi review: {kimi_review[:300]}")
        _persist_ai_feedback(f"[Kimi review] {kimi_review[:300]}")

    return "\n".join(results) if results else None


def _persist_ai_feedback(entry: str):
    """Append AI feedback to persistent log for inter-cycle context."""
    log_path = AUTOMA_ROOT / "state" / "ai-feedback.log"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    with open(log_path, "a") as f:
        f.write(f"[{timestamp}] {entry}\n")


def micro_research(state: dict) -> str | None:
    """Multi-source research: Semantic Scholar + DeepSeek reasoning.
    Semantic Scholar for papers, DeepSeek for reasoned analysis when papers fail."""
    from tools import call_deepseek_reasoner

    topics = [
        "educational electronics simulation children",
        "Scratch to Arduino C++ block programming",
        "AI tutoring scaffolding real-time",
        "circuit simulation browser WebAssembly",
        "readability index Italian children",
        "iPad touch interface educational",
        "offline progressive web app education",
        "Socratic questioning AI tutor",
        "inexperienced teacher technology adoption barriers",
        "maker education elementary school",
        "gamification STEM learning engagement",
        "EdTech product marketing school adoption",
        "misconceptions electricity children",
        "visual programming Arduino pedagogy",
        "LIM interactive whiteboard classroom electronics",
        "progressive web app offline education developing countries",
    ]

    cycle = state.get("loop", {}).get("cycles_today", 0)
    topic = topics[cycle % len(topics)]
    results = []

    # Source 1: Semantic Scholar (fast, free, sometimes fails)
    papers = search_papers(topic, limit=5)
    valid_papers = [p for p in papers if p.get("title")]
    if valid_papers:
        results.append(f"Semantic Scholar: '{topic}' → {len(valid_papers)} papers")
        for p in valid_papers[:3]:
            results.append(f"  - [{p.get('year','?')}] {p.get('title','?')[:80]} ({p.get('citationCount',0)} cites)")

    # Source 2: Kimi K2.5 (128K context — good for synthesis and review, every 2 cycles)
    if cycle % 2 == 0:
        from tools import call_kimi
        kimi_query = (
            f"Topic di ricerca: '{topic}'. Contesto: ELAB Tutor è un simulatore di circuiti "
            f"per bambini 10-14 anni con AI tutor. Elenca: 1) 3 trend recenti in questo campo, "
            f"2) 1 idea innovativa che nessun competitor ha implementato, "
            f"3) 1 rischio o problema da evitare. Max 150 parole."
        )
        kimi_insight = call_kimi(kimi_query)
        if kimi_insight and "[ERROR]" not in kimi_insight and "[SKIP]" not in kimi_insight:
            results.append(f"Kimi K2.5 insight:")
            results.append(f"  {kimi_insight[:400]}")

    # Source 3: DeepSeek reasoning (when Scholar fails, or every 3 cycles for deep analysis)
    if not valid_papers or cycle % 3 == 0:
        deepseek_query = (
            f"Sei un ricercatore EdTech. Topic: '{topic}'. "
            f"Rispondi con: 1) 2 problemi concreti che questo topic pone per ELAB Tutor "
            f"(simulatore elettronica per bambini 10-14), 2) 1 soluzione tecnica implementabile "
            f"in una settimana, 3) 1 metrica per misurare il miglioramento. Max 150 parole, concreto."
        )
        analysis = call_deepseek_reasoner(deepseek_query)
        if analysis and "[ERROR]" not in analysis and "[SKIP]" not in analysis:
            results.append(f"DeepSeek analysis on '{topic}':")
            results.append(f"  {analysis[:400]}")

    # Persist research findings
    if results:
        summary = "\n".join(results)
        # Save to knowledge file (accumulates research)
        research_log = AUTOMA_ROOT / "state" / "research-log.md"
        with open(research_log, "a") as f:
            f.write(f"\n## Cycle {cycle} — {topic}\n{summary}\n")
        return summary
    return None


def save_report(cycle_num: int, check_results: list, task_result: dict, research: str | None,
                mode: str = "IMPROVE", ai_scoring: str | None = None):
    """Save cycle report as JSON."""
    report = {
        "cycle": cycle_num,
        "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat(),
        "mode": mode,
        "checks": check_results,
        "checks_passed": sum(1 for r in check_results if r["status"] == "pass"),
        "checks_total": sum(1 for r in check_results if r["status"] != "skip"),
        "task_result": task_result,
        "research": research,
        "ai_scoring": ai_scoring,
    }

    filename = f"{date.today().isoformat()}-cycle-{cycle_num}.json"
    report_path = REPORTS_DIR / filename
    report_path.write_text(json.dumps(report, indent=2))
    return str(report_path)


def run_cycle(skip_slow: bool = False, dry_run: bool = False) -> dict:
    """Run one complete orchestrator cycle."""
    cycle_start = time.time()
    state = load_state()

    # Update cycle count
    today = date.today().isoformat()
    if state.get("loop", {}).get("last_date") != today:
        state.setdefault("loop", {})["cycles_today"] = 0
        state["loop"]["last_date"] = today
        state.setdefault("budget", {})["spent_today_eur"] = 0

    cycle_num = state["loop"].get("cycles_today", 0) + 1
    state["loop"]["cycles_today"] = cycle_num
    state["loop"]["status"] = "running"

    print(f"\n{'='*60}")
    print(f" ELAB Automa — Cycle {cycle_num} ({datetime.now().strftime('%H:%M:%S')})")
    print(f"{'='*60}")

    # Step 1: Run checks
    print("\n📋 Running 7 checks...")
    check_results = run_all_checks(skip_slow=skip_slow)
    print_results(check_results)

    # Step 2: Select mode (autoresearch pattern)
    mode = select_mode(cycle_num, check_results, None)
    print(f"\n🎯 Mode: {mode}")

    # Step 2b: Get next task (for IMPROVE mode)
    task = get_next_task()
    if task:
        print(f"📦 Next task: [{task.get('priority', '?')}] {task.get('title', task.get('_file', '?'))}")
        if not dry_run:
            claim_task(task["_file"])
    else:
        print("📦 No pending tasks")

    # Step 2c: AI scoring at scheduled intervals
    print("\n🧠 AI tool calls...")
    ai_result = ai_scoring(state, cycle_num) if not dry_run else None
    if ai_result:
        print(f"   {ai_result[:200]}")
    else:
        print("   (none this cycle)")

    # Step 3: Compose prompt and run Claude
    # Load program.md (autoresearch instructions) for the agent
    program_path = AUTOMA_ROOT / "program.md"
    program_md = program_path.read_text()[:4000] if program_path.exists() else ""

    prompt = compose_prompt(check_results, task, state, mode=mode, program=program_md)

    if dry_run:
        print("\n🔍 DRY RUN — Prompt composed but NOT executing.")
        print(f"   Prompt length: {len(prompt)} chars")
        task_result = {"task": "dry_run", "status": "skipped"}
    else:
        # Try Agent SDK (Anthropic API) first, fall back to claude -p, then prompt-only
        try:
            from agent import run_agent, ANTHROPIC_API_KEY as AGENT_KEY
            if AGENT_KEY:
                print("\n🧠 Launching Agent SDK (Anthropic API + tool calling)...")
                agent_result = run_agent(
                    system_prompt=prompt,
                    user_prompt=f"Modo: {mode}. Esegui il lavoro descritto nel system prompt. Usa i tool disponibili. Documenta tutto.",
                    max_turns=20,
                    model="claude-sonnet-4-20250514",
                )
                task_result = {
                    "task": task.get("title", "?") if task else mode,
                    "status": agent_result.get("status", "unknown"),
                    "turns": agent_result.get("turns", 0),
                    "tool_calls": agent_result.get("tool_calls", 0),
                    "tokens": agent_result.get("tokens", 0),
                    "tools_used": agent_result.get("tools_used", []),
                    "response_preview": agent_result.get("response", "")[:500],
                }
                print(f"   Agent done: {agent_result.get('turns',0)} turns, {agent_result.get('tool_calls',0)} tool calls, {agent_result.get('tokens',0)} tokens")
                print(f"   Tools used: {agent_result.get('tools_used', [])}")
            else:
                raise ImportError("No Anthropic API key")
        except (ImportError, Exception) as e:
            # Fallback: claude -p headless
            import shutil
            if shutil.which("claude"):
                print(f"\n🤖 Agent SDK unavailable ({e}), falling back to claude -p...")
                task_result = run_claude_headless(prompt)
            else:
                print(f"\n📝 No agent available — saving prompt.")
                prompt_file = AUTOMA_ROOT / "state" / "next-prompt.md"
                prompt_file.write_text(prompt)
                task_result = {"task": task.get("title", "?") if task else "none", "status": "pending_interactive"}
        print(f"   Result: {task_result.get('status', '?')}")

        # Update task status
        if task:
            if task_result.get("status") == "done":
                complete_task(task["_file"])
            elif task_result.get("status") == "pending_interactive":
                pass  # Keep in active, will be completed interactively
            else:
                fail_task(task["_file"], task_result.get("error", "unknown"))

    # Step 3b: Run evaluate.py every 5 cycles to track composite score
    if cycle_num % 5 == 1 and not dry_run:
        print("\n📊 Running evaluate.py for composite score...")
        try:
            eval_result = subprocess.run(
                ["python3", str(AUTOMA_ROOT / "evaluate.py")],
                capture_output=True, text=True, timeout=600,
                cwd=str(PROJECT_ROOT),
            )
            # Extract composite score
            for line in eval_result.stdout.splitlines():
                if line.startswith("SCORE:composite="):
                    score_val = line.split("=")[1]
                    print(f"   Composite score: {score_val}")
                    # Persist for next cycle's context
                    eval_json_path = AUTOMA_ROOT / "state" / "last-eval.json"
                    eval_data = {"composite": float(score_val), "timestamp": datetime.now().isoformat(),
                                 "cycle": cycle_num, "output": eval_result.stdout[-500:]}
                    eval_json_path.write_text(json.dumps(eval_data, indent=2))
                    break
            else:
                print("   evaluate.py ran but no composite score found")
        except subprocess.TimeoutExpired:
            print("   evaluate.py timed out (>10min)")
        except Exception as e:
            print(f"   evaluate.py error: {e}")

    # Step 4: Micro-research (every cycle — costante ricerca)
    print("\n🔬 Micro-research...")
    research = micro_research(state)
    if research:
        print(f"   {research[:120]}")
    else:
        print("   No results")

    # Step 5: Update results.tsv (autoresearch log)
    tsv_path = AUTOMA_ROOT / "results.tsv"
    if mode == "IMPROVE" and task_result.get("status") in ("done", "failed"):
        try:
            # Get short git hash
            git_hash = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True, cwd=str(PROJECT_ROOT)
            ).stdout.strip()[:7] or "unknown"
            status_str = "keep" if task_result.get("status") == "done" else "discard"
            desc = task_result.get("task", "unknown")[:80].replace("\t", " ")
            line = f"{git_hash}\t0.0000\t{mode}\t{status_str}\t{desc}\n"
            with open(tsv_path, "a") as f:
                f.write(line)
        except Exception:
            pass

    # Step 5b: Save report
    report_path = save_report(cycle_num, check_results, task_result, research,
                              mode=mode, ai_scoring=ai_result)
    print(f"\n📊 Report saved: {report_path}")

    # Step 6: Update state
    elapsed = time.time() - cycle_start
    state["loop"]["last_cycle"] = datetime.now().isoformat()
    state["loop"]["last_elapsed_s"] = int(elapsed)
    state["build"] = {
        "status": next((r["status"] for r in check_results if r["name"] == "build"), "unknown"),
        "last_check": datetime.now().isoformat(),
    }
    save_state(state)
    write_heartbeat()

    print(f"\n⏱️  Cycle completed in {elapsed:.0f}s")
    print(f"   Queue: {json.dumps(stats())}")

    return {"cycle": cycle_num, "elapsed_s": int(elapsed), "task_result": task_result}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ELAB Automa Orchestrator")
    parser.add_argument("--fast", action="store_true", help="Skip slow checks (browser, iPad)")
    parser.add_argument("--dry-run", action="store_true", help="Run checks but don't launch Claude")
    parser.add_argument("--loop", action="store_true", help="Run continuously every 2h")
    args = parser.parse_args()

    if args.loop:
        interval = 3600  # 1h between cycles (12 tasks/night)
        print(f"🔄 Starting continuous loop (every {interval//60}min)...")
        while True:
            try:
                run_cycle(skip_slow=args.fast)
            except Exception as e:
                print(f"❌ Cycle error: {e}")
                import traceback
                traceback.print_exc()
            print(f"\n💤 Sleeping {interval//60}min until next cycle...")
            time.sleep(interval)
    else:
        run_cycle(skip_slow=args.fast, dry_run=args.dry_run)
