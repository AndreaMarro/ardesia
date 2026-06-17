#!/usr/bin/env python3
"""
ELAB Automa — Orchestrator V2
Evolved: skill dispatch, parallel Kimi research, self-exam, score regression,
adaptive mode, structured prompts, CoV, 10-layer context.
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, date
from pathlib import Path

# Ensure npm/node are in PATH (required for build checks, evaluate.py, Playwright)
_EXTRA_PATH = "/opt/homebrew/bin:/usr/local/bin:/Users/andreamarro/.npm-global/bin"
if _EXTRA_PATH not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _EXTRA_PATH + ":" + os.environ.get("PATH", "")

AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
STATE_FILE = AUTOMA_ROOT / "state" / "state.json"
REPORTS_DIR = AUTOMA_ROOT / "reports"
HEARTBEAT_FILE = AUTOMA_ROOT / "state" / "heartbeat"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "state").mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "logs").mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(AUTOMA_ROOT))
from checks import run_all_checks, print_results
from queue_manager import get_next_task, claim_task, complete_task, fail_task, stats, rescue_stale_active
from tools import search_papers, gulpease_index, chat_galileo, call_gemini_cli

try:
    from self_exam import run_self_exam, load_learned_rules
except ImportError:
    run_self_exam = None
    load_learned_rules = lambda: ""

try:
    from parallel_research import run_parallel_research, get_latest_findings, get_actionable_findings
except ImportError:
    run_parallel_research = None
    get_latest_findings = lambda n=5: ""
    get_actionable_findings = lambda: []

# Skill dispatch - maps modes to specialized skill perspectives
SKILL_DISPATCH = {
    "RESEARCH": [
        ("ricerca-tecnica", "Investiga soluzioni tecniche, librerie, architetture"),
        ("ricerca-innovazione", "Esplora trend emergenti EdTech, paper, brevetti"),
        ("ricerca-marketing", "Analizza competitor, target, pricing"),
        ("ricerca-idee-geniali", "Genera idee breakthrough con pensiero laterale"),
        ("ricerca-contesto", "Migliora il mantenimento contesto tra sessioni"),
    ],
    "AUDIT": [
        ("ricerca-bug", "Bug hunting proattivo su edge case e regressioni"),
        ("analisi-simulatore", "Analisi CircuitSolver, AVR, accuratezza, performance"),
        ("analisi-galileo", "Valuta qualita risposte AI, tono pedagogico, contesto"),
        ("lim-simulator", "Verifica usabilita su LIM scolastica"),
        ("impersonatore-utente", "Simula Marco 8y, Sofia 11y, Prof Rossi"),
    ],
    "EVOLVE": [
        ("analisi-statistica-severa", "Analisi rigorosa metriche, trend, significativita"),
        ("ricerca-sviluppo-autonomo", "Nuove idee per auto-improvement del ciclo"),
        ("giudizio-multi-ai", "Valutazione multi-judge DeepSeek+Kimi+Gemini"),
        ("analisi-video-kimi", "Review visuale con Kimi K2 su screenshot"),
    ],
}


def _skill_section_for_mode(mode, cycle):
    skills = SKILL_DISPATCH.get(mode, [])
    if not skills:
        return ""
    # G25: Priority-based dispatch instead of blind rotation.
    # If there are P0 tasks in queue, always pick the skill most relevant to them.
    pending_dir = AUTOMA_ROOT / "queue" / "pending"
    p0_tags = set()
    if pending_dir.exists():
        for f in pending_dir.glob("P0-*.yaml"):
            content = f.read_text()
            for line in content.splitlines():
                if line.startswith("tags:"):
                    p0_tags.update(t.strip() for t in line.split(":", 1)[1].split(","))
    # Match skills to P0 tags
    scored_skills = []
    for i, (name, desc) in enumerate(skills):
        score = sum(1 for tag in p0_tags if tag.lower() in name.lower() or tag.lower() in desc.lower())
        scored_skills.append((score, i, name, desc))
    scored_skills.sort(key=lambda x: (-x[0], x[1]))
    # If no P0 match, fall back to rotation
    if scored_skills[0][0] > 0:
        primary = (scored_skills[0][2], scored_skills[0][3])
    else:
        idx = cycle % len(skills)
        primary = skills[idx]
    others = [s for s in skills if s[0] != primary[0]]
    lines = [
        "\n### Skill Specializzata per questo Ciclo",
        f"Focus primario: **{primary[0]}** - {primary[1]}",
        f"Leggi la skill in .claude/skills/{primary[0]}/SKILL.md e segui la procedura.",
        "",
        "Skill alternative:",
    ]
    for name, desc in others:
        lines.append(f"  - {name}: {desc}")
    return "\n".join(lines)


def _check_score_regression(state):
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    if not eval_path.exists():
        return None
    try:
        current = json.loads(eval_path.read_text())
        current_score = current.get("composite", 0)
        report_files = sorted(REPORTS_DIR.glob("2*.json"))[-10:]
        prev_scores = []
        for rf in report_files:
            try:
                r = json.loads(rf.read_text())
                if "composite_score" in r:
                    prev_scores.append(r["composite_score"])
            except Exception:
                pass
        if len(prev_scores) >= 3:
            avg_prev = sum(prev_scores[-3:]) / 3
            if current_score < avg_prev * 0.95:
                return {"regression": True, "current": current_score,
                        "avg_previous": round(avg_prev, 4),
                        "drop_pct": round((1 - current_score / avg_prev) * 100, 1)}
        return None
    except Exception:
        return None


def _load_executable_rules():
    rules_path = AUTOMA_ROOT / "state" / "learned-rules.json"
    if rules_path.exists():
        try:
            return json.loads(rules_path.read_text())
        except json.JSONDecodeError:
            pass
    text_rules = load_learned_rules()
    return {"text_rules": text_rules, "executable": {}}


def _apply_rules(rules, context):
    actions = []
    exe = rules.get("executable", {})
    if exe.get("skip_deepseek_when_failing"):
        actions.append("Rule: skipping DeepSeek (high failure rate)")
    if exe.get("blocked_topics"):
        actions.append(f"Rule: blocked topics: {exe['blocked_topics']}")
    return actions


# ═══════════════════════════════════════════════════════════════
# LOOP CLOSERS — the 3 functions that make the system actually evolve
# ═══════════════════════════════════════════════════════════════

def _snapshot_before_work():
    """Take a git snapshot + score BEFORE the agent works. For keep/discard."""
    snapshot = {"timestamp": datetime.now().isoformat()}
    try:
        r = subprocess.run(["git", "rev-parse", "--short", "HEAD"],
                           capture_output=True, text=True, cwd=str(PROJECT_ROOT), timeout=5)
        snapshot["git_hash"] = r.stdout.strip()[:7]
    except Exception:
        snapshot["git_hash"] = "unknown"
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    if eval_path.exists():
        try:
            snapshot["score_before"] = json.loads(eval_path.read_text()).get("composite", 0)
        except Exception:
            snapshot["score_before"] = 0
    else:
        snapshot["score_before"] = 0
    # Save snapshot
    snap_path = AUTOMA_ROOT / "state" / "cycle-snapshot.json"
    snap_path.write_text(json.dumps(snapshot, indent=2))
    return snapshot


def _keep_or_discard(task_result, snapshot):
    """After work: measure score, compare with before, keep or revert.
    Returns 'keep', 'discard', or 'no_measurement'."""
    if task_result.get("status") != "done":
        return "no_measurement"
    # Run evaluate.py to get fresh score
    try:
        ev = subprocess.run(
            ["python3", str(AUTOMA_ROOT / "evaluate.py")],
            capture_output=True, text=True, timeout=300, cwd=str(PROJECT_ROOT))
        score_after = None
        for line in ev.stdout.splitlines():
            if line.startswith("SCORE:composite="):
                score_after = float(line.split("=")[1])
                break
        if score_after is None:
            return "no_measurement"
        score_before = snapshot.get("score_before", 0)
        delta = score_after - score_before
        # Keep if score didn't drop
        if delta >= -0.005:  # Allow tiny noise (0.5%)
            print(f"   KEEP: score {score_before:.4f} -> {score_after:.4f} (delta={delta:+.4f})")
            # Update last-eval
            ep = AUTOMA_ROOT / "state" / "last-eval.json"
            ep.write_text(json.dumps({"composite": score_after,
                "timestamp": datetime.now().isoformat()}, indent=2))
            return "keep"
        else:
            print(f"   DISCARD: score {score_before:.4f} -> {score_after:.4f} (delta={delta:+.4f})")
            # Revert to snapshot
            git_hash = snapshot.get("git_hash", "")
            if git_hash and git_hash != "unknown":
                try:
                    # Smart revert: only revert src/, keep nanobot/ and prompt changes
                    subprocess.run(["git", "checkout", "--", "src/"],
                                   cwd=str(PROJECT_ROOT), timeout=10)
                    print(f"   Reverted src/ to {git_hash} (nanobot/ changes preserved)")
                except Exception:
                    print("   Revert failed — manual intervention needed")
            return "discard"
    except Exception as e:
        print(f"   Keep/discard error: {e}")
        return "no_measurement"


def _research_to_tasks():
    """Convert high-severity research findings into task YAML files.
    This closes the Research -> Task loop."""
    actionable = get_actionable_findings()
    created = 0
    pending_dir = AUTOMA_ROOT / "queue" / "pending"
    pending_dir.mkdir(parents=True, exist_ok=True)
    for finding in actionable:
        severity = finding.get("severity", "low")
        if severity not in ("medium", "high", "blocker"):
            continue
        topic_id = finding.get("topic_id", "unknown")
        cycle = finding.get("cycle", 0)
        action = finding.get("raw_response", "")[:200]
        # Create task YAML
        task_id = f"research-{topic_id}-c{cycle}"
        task_path = pending_dir / f"{task_id}.yaml"
        if task_path.exists():
            continue  # Don't duplicate
        priority = "P1" if severity in ("high", "blocker") else "P2"
        task_path.write_text(
            f"id: {task_id}\n"
            f"priority: {priority}\n"
            f"title: '[Research] {topic_id}: finding from cycle {cycle}'\n"
            f"description: |\n"
            f"  Auto-generated from parallel research finding.\n"
            f"  Severity: {severity}\n"
            f"  {action}\n"
            f"tags: research,auto-generated\n"
        )
        finding["actioned"] = True
        created += 1
    # Save back actioned status
    if created > 0:
        from parallel_research import save_findings, load_findings
        data = load_findings()
        for f in data.get("findings", []):
            for af in actionable:
                if f.get("cycle") == af.get("cycle") and f.get("topic_id") == af.get("topic_id"):
                    f["actioned"] = True
        save_findings(data)
        print(f"   Research->Task: {created} new tasks created")
    return created


def _requeue_fixable_failed():
    """Move fixable failed tasks back to pending. Closes the failed->retry loop."""
    failed_dir = AUTOMA_ROOT / "queue" / "failed"
    pending_dir = AUTOMA_ROOT / "queue" / "pending"
    if not failed_dir.exists():
        return 0
    requeued = 0
    # Unfixable patterns — don't retry these
    unfixable = ["csp-invalid", "pedagogy-sim", "classi-simulate", "lighthouse-baseline", "backstopjs"]
    for f in failed_dir.iterdir():
        if not f.name.endswith((".yaml", ".yml")):
            continue
        # Skip if unfixable
        if any(pat in f.name.lower() for pat in unfixable):
            continue
        # Check if already retried (look for retry count)
        content = f.read_text()
        retry_count = content.count("retry:")
        if retry_count >= 2:
            continue  # Max 2 retries
        # Move to pending with retry marker
        new_content = content + f"\nretry: {retry_count + 1}\nrequeued_at: {datetime.now().isoformat()}\n"
        dest = pending_dir / f.name
        if not dest.exists():
            dest.write_text(new_content)
            f.unlink()
            requeued += 1
    if requeued > 0:
        print(f"   Requeued {requeued} failed tasks")
    return requeued


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"loop": {"cycles_today": 0, "status": "not_started"}, "budget": {"spent_today_eur": 0}}


def save_state(state):
    state["updated"] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


def write_heartbeat():
    HEARTBEAT_FILE.write_text(datetime.now().isoformat())


def compose_prompt(check_results, task, state, mode="IMPROVE", program="", cycle_num=1):
    check_summary = "\n".join(
        f"  {'PASS' if r['status']=='pass' else 'FAIL' if r['status']=='fail' else 'WARN'} {r['name']}: {r['detail'][:100]}"
        for r in check_results
    )
    failed_checks = [r for r in check_results if r["status"] == "fail"]
    skill_section = _skill_section_for_mode(mode, cycle_num)

    if failed_checks:
        work_section = f"""## PRIORITY: FIX FAILED CHECKS
{chr(10).join(f"- {r['name']}: {r['detail']}" for r in failed_checks)}
Fix these. Run `npm run build`. Verify."""
    elif mode == "IMPROVE" and task:
        work_section = f"""## MODE: IMPROVE
TASK: {task.get('title', '?')} | Priority: {task.get('priority', '?')}
{task.get('description', '')}
Complete. Test. `npm run build`. Verify. Keep/discard."""
    elif mode == "RESEARCH":
        work_section = f"""## MODE: RESEARCH
{skill_section}
Segui la skill. Usa Semantic Scholar, Gemini, DeepSeek.
Salva in `automa/knowledge/research-cycle-{cycle_num}.md`
Se trovi un problema, crea task in `automa/queue/pending/`"""
    elif mode == "WRITE":
        work_section = """## MODE: WRITE
Scrivi UN articolo in `automa/articles/`. Author: Andrea Marro.
500-1000 parole. Tono: professionale, accessibile."""
    elif mode == "AUDIT":
        work_section = f"""## MODE: AUDIT
{skill_section}
Segui la skill. Ogni bug: severity P0-P3, crea task YAML.
Report in `automa/reports/audit-cycle-{cycle_num}.md`"""
    elif mode == "EVOLVE":
        work_section = f"""## MODE: EVOLVE
{skill_section}
Segui la skill. Rivedi metriche. Auto-migliora il sistema."""
    else:
        work_section = """## MODE: IMPROVE
Guarda PDR.md. Priorita: insegnante > UX > bug > performance."""

    # 10-layer context
    context_parts = []
    for ctx_file in ["MASTER-PLAN.md", "context/PRODUCT-VISION.md", "context/ELAB-COMPLETE-CONTEXT.md", "context/teacher-principles.md", "context/volume-path.md", "context/project-history.md"]:
        ctx_path = AUTOMA_ROOT / ctx_file
        if ctx_path.exists():
            context_parts.append(ctx_path.read_text()[:2000])

    pdr_summary = ""
    pdr_path = AUTOMA_ROOT / "PDR.md"
    if pdr_path.exists():
        pdr_summary = pdr_path.read_text()[:3000]

    results_tsv = ""
    tsv_path = AUTOMA_ROOT / "results.tsv"
    if tsv_path.exists():
        lines = tsv_path.read_text().strip().splitlines()
        results_tsv = "\n".join(lines[:1] + lines[-20:])

    last_report = ""
    report_files = sorted(REPORTS_DIR.glob("2*.json"))
    if report_files:
        last_report = report_files[-1].read_text()[:1500]

    handoff = ""
    handoff_path = AUTOMA_ROOT / "handoff.md"
    if handoff_path.exists():
        handoff = handoff_path.read_text()[:1500]

    git_log = ""
    try:
        r = subprocess.run(["git", "log", "--oneline", "-10"],
                           capture_output=True, text=True, cwd=str(PROJECT_ROOT), timeout=5)
        git_log = r.stdout.strip()
    except Exception:
        pass

    knowledge_index = ""
    knowledge_dir = AUTOMA_ROOT / "knowledge"
    if knowledge_dir.exists():
        files = sorted(knowledge_dir.glob("*.md"))
        knowledge_index = "\n".join(f"  - {f.stem}" for f in files[-15:])

    ai_history = ""
    ai_log_path = AUTOMA_ROOT / "state" / "ai-feedback.log"
    if ai_log_path.exists():
        ai_lines = ai_log_path.read_text().strip().splitlines()
        ai_history = "\n".join(ai_lines[-10:])

    eval_score = ""
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    if eval_path.exists():
        eval_score = eval_path.read_text()[:500]

    db_summary = ""
    try:
        from context_db import get_context_summary
        db_summary = get_context_summary()
    except Exception:
        pass

    # Layer 11: Shared results from scheduled tasks (bidirectional communication)
    shared_results = ""
    sr_path = AUTOMA_ROOT / "state" / "shared-results.md"
    if sr_path.exists():
        sr_lines = sr_path.read_text().strip().splitlines()
        # Last 30 lines = most recent task results
        shared_results = "\n".join(sr_lines[-30:])

    learned_rules = load_learned_rules()
    parallel_findings = get_latest_findings(5)
    actionable = get_actionable_findings()
    actionable_summary = ""
    if actionable:
        actionable_summary = "\n".join(
            f"  [{f.get('severity','?')}] {f.get('topic_id','?')}: {f.get('raw_response','')[:120]}"
            for f in actionable[:3]
        )

    regression = _check_score_regression(state)
    regression_alert = ""
    if regression:
        regression_alert = (
            f"\n## ALERT: SCORE REGRESSION\n"
            f"Current: {regression['current']}, Avg prev: {regression['avg_previous']}, "
            f"Drop: {regression['drop_pct']}%\nFix this FIRST.\n"
        )

    exe_rules = _load_executable_rules()
    rules_applied = _apply_rules(exe_rules, mode)
    rules_section = "\n".join(f"  - {a}" for a in rules_applied) if rules_applied else ""

    prompt = f"""I want to IMPROVE ELAB Tutor so that teachers can teach electronics better.

## IDENTITA
Sei ELAB-TUTOR-ORCHESTRATOR-WORKER. Italiano. Project: {PROJECT_ROOT}
Modo: {mode} | Ciclo: {cycle_num}
Non dichiarare progresso senza evidenza verificabile.

## PRINCIPIO ZERO — EMPATIA OBBLIGATORIA

TU SEI LA PROFESSORESSA ROSSI. 52 anni, insegni tecnologia alle medie.
Non sai NULLA di elettronica. Hai paura di fare brutte figure davanti ai ragazzi.
Hai 25 studenti di 12 anni che ti guardano dalla LIM. Sei sola.

PRIMA di scrivere QUALSIASI riga di codice, RISPONDI a queste 3 domande:
1. La Prof.ssa Rossi capirebbe questa interfaccia nei PRIMI 5 SECONDI?
2. Se un ragazzo di 12 anni vede la LIM, capisce cosa sta succedendo?
3. Se la Prof.ssa Rossi tocca il bottone sbagliato, succede qualcosa di grave?

Se la risposta a (1) e' NO → l'interfaccia e' troppo complessa. SEMPLIFICA.
Se la risposta a (2) e' NO → il linguaggio e' sbagliato. USA 10-14 anni.
Se la risposta a (3) e' SI → manca protezione. AGGIUNGI undo/conferma.

DEFAULT = NOVIZIO (livello 1). La complessita' si sblocca con l'USO, mai subito.
Galileo e' un libro intelligente, non un professore. L'insegnante e' il medium.
L'insegnante impara MENTRE insegna (apprendimento orizzontale).

SCENARIO DI TEST MENTALE (fallo SEMPRE):
"La Prof.ssa Rossi apre UNLIM per la prima volta. Non ha mai visto un simulatore.
Deve spiegare cos'e' un LED alla classe tra 2 minuti. Cosa vede? Cosa fa? Dove clicca?"
Se il tuo codice non supera questo scenario → NON COMMITTARE.
{regression_alert}

## PROGRAMMA
{program[:3000]}

## CONTESTO PEDAGOGICO
{chr(10).join(context_parts[:2])}

## PIANO (PDR)
{pdr_summary[:2000]}

## CONTESTO — 10 LAYER

### 1. results.tsv
{results_tsv if results_tsv else "(primo ciclo)"}

### 2. Ultimo ciclo
{last_report[:600] if last_report else "(primo ciclo)"}

### 3. Handoff
{handoff[:600] if handoff else "(nessuno)"}

### 4. Git log
{git_log if git_log else "(non disponibile)"}

### 5. Knowledge
{knowledge_index if knowledge_index else "(vuoto)"}

### 6. AI feedback
{ai_history if ai_history else "(nessuno)"}

### 7. Score composito
{eval_score if eval_score else "(non eseguito)"}

### 8. Context DB
{db_summary if db_summary else "(vuoto)"}

### 9. Regole Apprese
{learned_rules if learned_rules else "(nessuna)"}
{f"Regole esecutive:{chr(10)}{rules_section}" if rules_section else ""}

### 10. Ricerca Parallela (Kimi K2.5)
{parallel_findings if parallel_findings else "(nessuna)"}
{f"AZIONI URGENTI:{chr(10)}{actionable_summary}" if actionable_summary else ""}

### 11. Risultati Task Paralleli (scheduled tasks comunicano qui)
{shared_results if shared_results else "(nessun risultato dai task paralleli)"}

## CHECK RESULTS
{check_summary}

{work_section}

## REGOLE (INVIOLABILI)
1. TEST PROF.SSA ROSSI — ogni modifica UI deve superare: "La Prof.ssa Rossi
   lo capirebbe in 5 secondi?" Se no, SEMPLIFICA prima di committare.
2. DEFAULT = LIVELLO 1 — mai mostrare tutto subito. disclosureLevel default = 1.
3. ZERO REGRESSIONI — `npm run build` DEVE passare.
4. LINGUAGGIO 10-14 ANNI — sulla LIM gli studenti vedono. "Seriale" → "Monitor Arduino".
   "Deploy" → mai. "Compile" → "Prepara". Niente termini da sviluppatore.
5. TOUCH >=44px, FONT >=16px (>=24px su LIM), no overflow.
6. MAI aggiungere bottoni/menu senza chiederti "serve alla Prof.ssa Rossi?"
7. CoV obbligatoria alla fine. Massima onesta. FAIL non "parzialmente ok".
8. Severity: blocker/high/medium/low. Evidence: verified/hypothesis/speculation.

## COV OBBLIGATORIA (alla fine — OGNI punto)
1. La Prof.ssa Rossi capirebbe questa modifica in 5 secondi?
2. Un ragazzo di 12 anni dalla LIM capisce cosa succede?
3. Ho usato parole da sviluppatore? (Se si: RISCRIVERE)
4. Il default e' livello 1 (novizio)? Mai 2 o 3.
5. Build passa? (esegui npm run build, non assumere)
6. Regressioni? Ho rotto qualcosa che funzionava?
7. Claim senza prova? Contradddizioni?
8. Severity assegnata? Evidence level?
NON ammorbidire. NON dire "parzialmente ok". FAIL e' FAIL.

## TOOLS DISPONIBILI (USALI!)
- **WebSearch** — OBBLIGATORIO per verificare claim, cercare competitor, bandi PNRR, paper.
  Non inventare: CERCA. Ogni ciclo RESEARCH deve fare almeno 2 WebSearch.
- **WebFetch** — per leggere pagine web specifiche (competitor, documentazione, bandi).
- DeepSeek R1, Gemini 2.5 Pro, Kimi K2.5, Brain VPS, Playwright, Semantic Scholar
- Read, Write, Edit, Bash, Glob, Grep — per modificare codice

REGOLA: se fai una affermazione su competitor, mercato, PNRR, GDPR, pedagogia → DEVI
fare WebSearch per verificare. Nessun claim senza fonte.

## OUTPUT (JSON sull'ultima riga)
{{"task": "desc", "status": "done|partial|failed", "files_changed": [], "build_pass": true, "cov_verified": true, "severity": "low", "evidence": "verified"}}
"""
    return prompt


def run_claude_headless(prompt, max_time=1500):
    log_file = AUTOMA_ROOT / "logs" / f"claude-{datetime.now().strftime('%H%M%S')}.log"
    try:
        claude_bin = "/Users/andreamarro/.npm-global/bin/claude"
        result = subprocess.run(
            [claude_bin, "-p", prompt, "--output-format", "text",
             "--dangerously-skip-permissions", "--model", "claude-opus-4-20250514", "--max-turns", "40"],
            capture_output=True, text=True, timeout=max_time,
            cwd=str(PROJECT_ROOT),
            env={**os.environ, "CLAUDE_AUTO_ACCEPT": "1"},
        )
        output = result.stdout
        # Handle max turns error
        if "Reached max turns" in output:
            return {"task": "max_turns", "status": "partial",
                    "lesson": "Raggiunto limite turni. Task troppo complesso — ridurre scope.",
                    "error": "max_turns_reached"}
        log_file.write_text(f"=== PROMPT ===\n{prompt[:500]}\n\n=== OUTPUT ===\n{output}")
        lines = output.strip().splitlines()
        for line in reversed(lines):
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    return json.loads(line)
                except json.JSONDecodeError:
                    pass
        return {"task": "unknown", "status": "done" if result.returncode == 0 else "failed",
                "output_length": len(output), "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"task": "timeout", "status": "failed", "error": f"Timed out after {max_time}s"}
    except FileNotFoundError:
        return {"task": "no_claude", "status": "failed", "error": "claude CLI not found"}
    except Exception as e:
        return {"task": "error", "status": "failed", "error": str(e)[:300]}


def select_mode(cycle, check_results, task, state=None):
    """Adaptive mode selection — SPRINT MODE for 2 weeks (28/03-11/04/2026).
    80% IMPROVE, 15% AUDIT, 5% RESEARCH. No WRITE/EVOLVE.
    Every cycle MUST produce a deliverable aligned with Principio Zero."""
    failed = [r for r in check_results if r["status"] == "fail"]
    if failed:
        return "IMPROVE"
    if state:
        reg = _check_score_regression(state)
        if reg and reg.get("drop_pct", 0) > 5:
            return "IMPROVE"
    # P0/P1 tasks = always IMPROVE
    if task and task.get("priority") in ("P0", "P1"):
        return "IMPROVE"
    # AUDIT every 10 cycles (adversarial review)
    if cycle % 10 == 0 and cycle > 0:
        return "AUDIT"
    # RESEARCH only every 20 cycles (minimal, targeted)
    if cycle % 20 == 0 and cycle > 0:
        return "RESEARCH"
    # Default: IMPROVE — ship code, fix bugs, complete content
    return "IMPROVE"


def run_ai_scoring(state, cycle):
    from tools import call_deepseek_reasoner, call_gemini, call_kimi
    rules = _load_executable_rules()
    skip_ds = rules.get("executable", {}).get("skip_deepseek_when_failing", False)
    results = []

    if cycle % 5 == 0 and not skip_ds:
        galileo_resp = chat_galileo("Cos'e' un LED e come si usa con la breadboard?")
        if not galileo_resp["error"]:
            score = call_deepseek_reasoner(
                f"Valuta questa risposta di un tutor AI per bambini 10 anni (1-10).\n"
                f"Criteri: chiarezza, eta, correttezza, incoraggiamento.\n"
                f"Risposta:\n{galileo_resp['response'][:1000]}\n"
                f"Rispondi SOLO: SCORE:N MOTIVO:breve"
            )
            results.append(f"DeepSeek scoring: {score[:200]}")
            _persist_ai_feedback(f"[DeepSeek score] {score[:300]}")

    if cycle % 10 == 0:
        gemini_prompt = (
            "CONTESTO: ELAB UNLIM — simulatore circuiti + AI tutor per scuole medie italiane. "
            "67 esperimenti, 3 volumi, kit fisico €75, licenza €500-1000/anno. "
            "Committenti: Omaric (Franzoso, produttore Arduino) + Fagherazzi (Raas Impact). "
            "Principio Zero: insegnante inesperto alla LIM deve spiegare subito. "
            "ANALISI: mercato EdTech italiano 2026. Competitor CONCRETI di UNLIM? "
            "Cosa manca per vendere alle scuole? Bandi PNRR? Max 200 parole."
        )
        analysis = call_gemini(gemini_prompt)
        if "[SKIP]" in analysis or "[ERROR]" in analysis:
            analysis = call_gemini_cli(gemini_prompt)  # Fallback OAuth
        results.append(f"Gemini market: {analysis[:300]}")
        _persist_ai_feedback(f"[Gemini market] {analysis[:300]}")

    if cycle % 10 == 5:
        kimi_review = call_kimi(
            f"CONTESTO: ELAB UNLIM — simulatore circuiti + AI tutor per scuole medie italiane. "
            f"67 esperimenti, 3 volumi, kit fisico €75, licenza €500-1000/anno. "
            f"Principio Zero: insegnante inesperto alla LIM deve spiegare subito. "
            f"Committenti: Omaric (Franzoso) + Fagherazzi (Raas Impact). "
            f"Score: {json.dumps(state.get('scores', {}))}\n"
            f"DOMANDA: qual e' il problema PIU' GRAVE che impedisce la vendita alle scuole ORA? "
            f"Suggerisci 1 fix concreto con file e righe. Max 200 parole."
        )
        results.append(f"Kimi review: {kimi_review[:300]}")
        _persist_ai_feedback(f"[Kimi review] {kimi_review[:300]}")

    return "\n".join(results) if results else None




def run_adversarial_review(cycle_num, state):
    """Ogni 5 cicli: 3 critici con RUOLI DIVERSI producono TASK CONCRETI.
    Kimi = ricercatore, Gemini = validatore UX, Claude = architetto critico."""
    from tools import call_kimi, call_gemini, call_gemini_cli
    import subprocess

    print(f"\n⚔️  Adversarial Review — Cycle {cycle_num}")

    # Read last 5 lessons
    lessons_path = AUTOMA_ROOT / "state" / "lessons.jsonl"
    lessons = ""
    if lessons_path.exists():
        lines = lessons_path.read_text().strip().splitlines()[-5:]
        lessons = "\n".join(lines)

    # Read score + files changed
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    score = "?"
    if eval_path.exists():
        score = json.load(open(eval_path)).get("composite", "?")

    # Read recent git changes
    try:
        git_diff = subprocess.run(["git", "diff", "--stat", "HEAD~3"],
            capture_output=True, text=True, timeout=10, cwd=str(PROJECT_ROOT)).stdout[:500]
    except:
        git_diff = "(non disponibile)"

    # Read full context
    ctx_path = AUTOMA_ROOT / "context" / "ELAB-COMPLETE-CONTEXT.md"
    full_ctx = ctx_path.read_text()[:2000] if ctx_path.exists() else ""

    base_context = f"""ELAB UNLIM — Score: {score}
CONTESTO: {full_ctx}

COMMITTENTI: Omaric (Riccardo Franzoso, grande produttore Arduino mondiale) +
Giovanni Fagherazzi (Raas Impact, 8.8K LinkedIn). Andrea Marro = UNICO sviluppatore.
FONDAMENTALE fare un grande lavoro. La reputazione di Andrea dipende da questo.

Git diff ultimi 3 commit: {git_diff}
Lessons recenti: {lessons}

PRINCIPIO ZERO: insegnante inesperto (Prof.ssa Rossi, 52 anni) alla LIM.
DEVE funzionare in 5 secondi senza spiegazioni. Mai mostrare tutto subito."""

    results = []
    all_tasks = []

    # ─── KIMI = RICERCATORE ───
    # Cerca cosa fanno i competitor che noi non facciamo
    try:
        kimi_r = call_kimi(
            f"Sei un RICERCATORE EdTech. Analizza ELAB UNLIM e trova 2 cose CONCRETE "
            f"che i competitor (Tinkercad, Wokwi, PhET) fanno MEGLIO di noi.\n"
            f"Per ogni cosa: (1) cosa fanno loro, (2) cosa manca a noi, "
            f"(3) FILE SPECIFICO da modificare, (4) COME fixarlo in <20 righe.\n"
            f"Contesto: {base_context}\nMax 200 parole, italiano.", max_tokens=400)
        results.append(f"## Kimi (Ricercatore)\n{kimi_r[:600]}")
    except Exception as e:
        results.append(f"## Kimi (Ricercatore)\n[ERROR: {e}]")

    # ─── GEMINI = VALIDATORE UX ───
    # Valuta se la Prof.ssa Rossi sopravvive
    try:
        gemini_prompt = (
            f"Sei un VALIDATORE UX spietato. La Prof.ssa Rossi (52 anni, zero esperienza) "
            f"apre ELAB UNLIM sulla LIM davanti a 25 ragazzi di 12 anni.\n"
            f"Rispondi: (1) Sopravvive i primi 30 secondi? SI/NO e perche.\n"
            f"(2) I ragazzi capiscono cosa vedono sulla LIM? SI/NO.\n"
            f"(3) Il problema UX PIU' GRAVE ora. File e riga da fixare.\n"
            f"(4) Un TASK YAML concreto (id, priority, title, description).\n"
            f"Contesto: {base_context}\nMax 200 parole, italiano.")
        gemini_r = call_gemini(gemini_prompt)
        if "[SKIP]" in gemini_r or "[ERROR]" in gemini_r:
            gemini_r = call_gemini_cli(gemini_prompt)  # Fallback OAuth
        results.append(f"## Gemini (Validatore UX)\n{gemini_r[:600]}")
        # Try to extract task
        if "priority:" in gemini_r.lower() or "P0" in gemini_r or "P1" in gemini_r:
            all_tasks.append(("gemini", gemini_r))
    except Exception as e:
        results.append(f"## Gemini (Validatore UX)\n[ERROR: {e}]")

    # ─── CLAUDE = ARCHITETTO CRITICO ───
    # Giudica la qualita del codice e l'architettura
    try:
        claude_prompt = (
            f"Sei un ARCHITETTO SOFTWARE critico. Analizza ELAB UNLIM.\n"
            f"{base_context}\n\n"
            f"Rispondi con BRUTALE onesta:\n"
            f"1. Il codice prodotto negli ultimi 5 cicli e' BUONO o MEDIOCRE? Perche?\n"
            f"2. C'e' un BUG o DEBT TECNICO che nessuno sta affrontando?\n"
            f"3. Crea 1 TASK YAML concreto per il problema piu' grave:\n"
            f"   id: adv-c{cycle_num}-fix\n"
            f"   priority: P0 o P1\n"
            f"   title: ...\n"
            f"   description: file specifico, cosa cambiare, come verificare\n"
            f"Max 200 parole, italiano."
        )
        claude_bin = "/Users/andreamarro/.npm-global/bin/claude"
        cr = subprocess.run(
            [claude_bin, "-p", claude_prompt, "--output-format", "text",
             "--dangerously-skip-permissions", "--model", "claude-opus-4-20250514",
             "--max-turns", "5"],
            capture_output=True, text=True, timeout=300,
            cwd=str(PROJECT_ROOT), env={**os.environ}
        )
        results.append(f"## Claude (Architetto)\n{cr.stdout[:600]}")
        if "priority:" in cr.stdout.lower() or "P0" in cr.stdout or "P1" in cr.stdout:
            all_tasks.append(("claude", cr.stdout))
    except Exception as e:
        results.append(f"## Claude (Architetto)\n[ERROR: {e}]")

    # ─── SALVA REVIEW ───
    review_path = AUTOMA_ROOT / "state" / "adversarial-review.md"
    review_path.write_text(
        f"# Adversarial Review — Cycle {cycle_num}\n"
        f"Date: {datetime.now().isoformat()}\n"
        f"Score: {score}\n\n" +
        "\n\n---\n\n".join(results) +
        f"\n\n## Tasks Generati: {len(all_tasks)}\n"
    )

    # ─── CREA TASK YAML dalla review ───
    pending = AUTOMA_ROOT / "queue" / "pending"
    for source, text in all_tasks:
        task_id = f"adv-{source}-c{cycle_num}"
        task_path = pending / f"{task_id}.yaml"
        if not task_path.exists():
            # Extract priority and title from text
            priority = "P1"
            if "P0" in text: priority = "P0"
            lines = [l.strip() for l in text.splitlines() if l.strip()]
            title = f"Adversarial finding from {source} (C{cycle_num})"
            for l in lines:
                if l.lower().startswith("title:"):
                    title = l.split(":", 1)[1].strip().strip("'\"")
                    break
            task_path.write_text(
                f"id: {task_id}\n"
                f"priority: {priority}\n"
                f"title: '{title}'\n"
                f"description: |\n"
                f"  From adversarial review cycle {cycle_num} ({source}).\n"
                f"  {text[:300]}\n"
                f"tags: adversarial,auto-generated\n"
            )
            print(f"   Created task: {task_id} [{priority}]")

    # ─── SCRIVI IN SHARED-RESULTS ───
    sr = AUTOMA_ROOT / "state" / "shared-results.md"
    with open(sr, "a") as f:
        f.write(f"\n## [adversarial] {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write(f"- Score: {score}\n")
        f.write(f"- Critici: {len(results)}\n")
        f.write(f"- Tasks creati: {len(all_tasks)}\n")
        for r in results:
            first_line = r.split("\n")[1] if "\n" in r else r[:100]
            f.write(f"- {first_line[:100]}\n")

    print(f"   Saved: adversarial-review.md + shared-results.md ({len(all_tasks)} tasks)")
    return results


def _persist_ai_feedback(entry):
    log_path = AUTOMA_ROOT / "state" / "ai-feedback.log"
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    with open(log_path, "a") as f:
        f.write(f"[{ts}] {entry}\n")


def micro_research(state):
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

    papers = search_papers(topic, limit=5)
    valid = [p for p in papers if p.get("title")]
    if valid:
        results.append(f"Scholar: '{topic}' -> {len(valid)} papers")
        for p in valid[:3]:
            results.append(f"  - [{p.get('year','?')}] {p.get('title','?')[:80]}")

    if cycle % 2 == 0:
        from tools import call_kimi
        kimi = call_kimi(f"Topic: '{topic}'. ELAB Tutor = simulatore circuiti bambini. 3 trend, 1 idea, 1 rischio. 150 parole.")
        if kimi and "[ERROR]" not in kimi and "[SKIP]" not in kimi:
            results.append(f"Kimi: {kimi[:400]}")

    if not valid or cycle % 3 == 0:
        ds = call_deepseek_reasoner(f"EdTech topic: '{topic}'. 2 problemi per ELAB Tutor, 1 soluzione, 1 metrica. 150 parole.")
        if ds and "[ERROR]" not in ds and "[SKIP]" not in ds:
            results.append(f"DeepSeek: {ds[:400]}")

    if results:
        summary = "\n".join(results)
        log = AUTOMA_ROOT / "state" / "research-log.md"
        with open(log, "a") as f:
            f.write(f"\n## Cycle {cycle} - {topic}\n{summary}\n")
        return summary
    return None


def save_report(cycle_num, check_results, task_result, research,
                mode="IMPROVE", ai_scoring=None, self_exam_result=None):
    composite = None
    ep = AUTOMA_ROOT / "state" / "last-eval.json"
    if ep.exists():
        try:
            composite = json.loads(ep.read_text()).get("composite")
        except Exception:
            pass

    report = {
        "cycle": cycle_num, "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat(), "mode": mode,
        "checks": check_results,
        "checks_passed": sum(1 for r in check_results if r["status"] == "pass"),
        "checks_total": sum(1 for r in check_results if r["status"] != "skip"),
        "task_result": task_result, "research": research,
        "ai_scoring": ai_scoring, "composite_score": composite,
        "self_exam": {"patterns": len(self_exam_result.get("patterns", [])),
                      "applied": len(self_exam_result.get("applied", []))} if self_exam_result else None,
    }
    filename = f"{date.today().isoformat()}-cycle-{cycle_num}.json"
    rp = REPORTS_DIR / filename
    rp.write_text(json.dumps(report, indent=2))
    return str(rp)


def run_cycle(skip_slow=False, dry_run=False):
    cycle_start = time.time()
    state = load_state()
    today = date.today().isoformat()
    if state.get("loop", {}).get("last_date") != today:
        state.setdefault("loop", {})["cycles_today"] = 0
        state["loop"]["last_date"] = today
        state.setdefault("budget", {})["spent_today_eur"] = 0

    cycle_num = state["loop"].get("cycles_today", 0) + 1
    state["loop"]["cycles_today"] = cycle_num
    state["loop"]["status"] = "running"

    print(f"\n{'='*60}", flush=True)
    print(f" ELAB Automa V2 - Cycle {cycle_num} ({datetime.now().strftime('%H:%M:%S')})", flush=True)
    print(f"{'='*60}", flush=True)

    # Step 0-pre: Write heartbeat IMMEDIATELY (proves the process is alive)
    write_heartbeat()

    # Step 0-pre: Rescue stale active tasks (crashed previous cycle)
    rescued = rescue_stale_active(max_age_seconds=3600)
    if rescued > 0:
        print(f"\n  Rescued {rescued} stale active task(s) → pending")

    # Step 0a: Snapshot git + score BEFORE work (for keep/discard)
    snapshot = _snapshot_before_work() if not dry_run else {}
    if snapshot.get("git_hash"):
        print(f"\n  Snapshot: {snapshot['git_hash']} score={snapshot.get('score_before', '?')}")

    # Step 0b: Parallel Kimi research (async)
    if run_parallel_research and not dry_run:
        print("  Parallel Kimi research (background)...")
        run_parallel_research(cycle_num, state, blocking=False)

    # Step 0c: Re-queue fixable failed tasks + convert research to tasks
    if cycle_num % 3 == 1 and not dry_run:
        _requeue_fixable_failed()
        _research_to_tasks()

    # Step 1: Checks — fast by default, full every 5 cycles
    # Sprint mode: don't waste 150s on checks every cycle
    do_full_checks = (cycle_num % 5 == 1) and not skip_slow
    print(f"\n  Running checks ({'FULL' if do_full_checks else 'FAST'})...")
    check_results = run_all_checks(skip_slow=not do_full_checks)
    print_results(check_results)

    # Step 2: Adaptive mode
    task = get_next_task()
    mode = select_mode(cycle_num, check_results, task, state)
    print(f"\n  Mode: {mode}")
    if task:
        print(f"  Task: [{task.get('priority','?')}] {task.get('title', task.get('_file','?'))}")
        if not dry_run:
            claim_task(task["_file"])

    # Step 2c: AI scoring
    print("\n  AI scoring...")
    ai_result = run_ai_scoring(state, cycle_num) if not dry_run else None
    if ai_result:
        print(f"   {ai_result[:200]}")

    # Step 3: Compose and run
    prog_path = AUTOMA_ROOT / "program.md"
    prog = prog_path.read_text()[:4000] if prog_path.exists() else ""
    prompt = compose_prompt(check_results, task, state, mode=mode, program=prog, cycle_num=cycle_num)

    if dry_run:
        print(f"\n  DRY RUN - Prompt: {len(prompt)} chars")
        task_result = {"task": "dry_run", "status": "skipped"}
    else:
        try:
            from agent import run_agent, ANTHROPIC_API_KEY as AK
            if AK:
                print("\n  Agent SDK...")
                ar = run_agent(system_prompt=prompt,
                    user_prompt=f"Modo: {mode}. Esegui. Tool. Documenta. CoV.",
                    max_turns=20, model="claude-opus-4-20250514")
                task_result = {"task": task.get("title","?") if task else mode,
                    "status": ar.get("status","unknown"), "turns": ar.get("turns",0),
                    "tool_calls": ar.get("tool_calls",0), "tokens": ar.get("tokens",0),
                    "tools_used": ar.get("tools_used",[]),
                    "response_preview": ar.get("response","")[:500]}
            else:
                raise ImportError("No key")
        except (ImportError, Exception) as e:
            import shutil
            if shutil.which("claude"):
                print(f"\n  Fallback claude -p...")
                task_result = run_claude_headless(prompt)
            else:
                (AUTOMA_ROOT / "state" / "next-prompt.md").write_text(prompt)
                task_result = {"task": task.get("title","?") if task else "none", "status": "pending_interactive"}
        print(f"   Result: {task_result.get('status','?')}")
        if task:
            if task_result.get("status") == "done":
                complete_task(task["_file"])
            elif task_result.get("status") != "pending_interactive":
                fail_task(task["_file"], task_result.get("error","unknown"))

    # Step 3b: Keep/Discard (Karpathy pattern)
    verdict = "no_measurement"
    if not dry_run and task_result.get("status") == "done" and snapshot:
        print("\n  Keep/Discard evaluation...")
        verdict = _keep_or_discard(task_result, snapshot)
        # Log to results.tsv with real score delta
        if verdict in ("keep", "discard"):
            try:
                tsv = AUTOMA_ROOT / "results.tsv"
                gh = snapshot.get("git_hash", "?")
                sb = snapshot.get("score_before", 0)
                with open(tsv, "a") as f:
                    f.write(f"{gh}\t{sb:.4f}\t{mode}\t{verdict}\t{task_result.get('task','?')[:80]}\n")
            except Exception:
                pass

    # Step 3c: Evaluate (if not already done by keep/discard)
    if cycle_num % 5 == 1 and not dry_run and verdict == "no_measurement":
        print("\n  evaluate.py...")
        try:
            ev = subprocess.run(["python3", str(AUTOMA_ROOT / "evaluate.py")],
                capture_output=True, text=True, timeout=600, cwd=str(PROJECT_ROOT))
            for line in ev.stdout.splitlines():
                if line.startswith("SCORE:composite="):
                    sv = line.split("=")[1]
                    print(f"   Composite: {sv}")
                    ep = AUTOMA_ROOT / "state" / "last-eval.json"
                    ep.write_text(json.dumps({"composite": float(sv),
                        "timestamp": datetime.now().isoformat(),
                        "cycle": cycle_num, "output": ev.stdout[-500:]}, indent=2))
                    break
        except Exception as e:
            print(f"   evaluate error: {e}")

    # Step 3d: Save lesson to lessons.jsonl
    try:
        lesson_file = AUTOMA_ROOT / "state" / "lessons.jsonl"
        # Extract lesson from task_result
        lesson_text = task_result.get("lesson", "")
        if not lesson_text:
            # Try to extract from output or status
            output = task_result.get("response_preview", "") or task_result.get("output", "")
            if output:
                lesson_text = output[:200]
            else:
                lesson_text = f"Ciclo completato ({task_result.get('status','?')}). {task_result.get('task','')[:80]}"

        lesson_entry = {
            "cycle": cycle_num,
            "task": task_result.get("task", "unknown"),
            "status": task_result.get("status", "unknown"),
            "verdict": verdict,
            "worst_check": next((r["name"] for r in check_results if r["status"] == "fail"), None),
            "files_changed": task_result.get("files_changed", []),
            "lesson": lesson_text,
            "ts": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        with open(lesson_file, "a") as f:
            f.write(json.dumps(lesson_entry, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"   Lesson save error: {e}")

    # Step 4: Micro-research
    print("\n  Micro-research...")
    research = micro_research(state)
    if research:
        print(f"   {research[:120]}")

    # Step 4b: Self-exam
    se_result = None
    if cycle_num % 5 == 0 and run_self_exam and not dry_run:
        print("\n  Self-exam...")
        try:
            se_result = run_self_exam(state, cycle_num)
            state["loop"]["self_exam_last_run"] = datetime.now().isoformat()
            state["loop"]["self_exam_last_cycle"] = cycle_num
            print(f"   Patterns: {len(se_result.get('patterns',[]))}, Applied: {len(se_result.get('applied',[]))}")
        except Exception as e:
            print(f"   Self-exam error: {e}")

    # Step 4c: Adversarial Review (every 5 cycles)
    if cycle_num % 5 == 0 and cycle_num > 0 and not dry_run:
        try:
            run_adversarial_review(cycle_num, state)
        except Exception as e:
            print(f"   Adversarial error: {e}")

    # Step 5: Report
    rp = save_report(cycle_num, check_results, task_result, research,
                     mode=mode, ai_scoring=ai_result, self_exam_result=se_result)
    print(f"\n  Report: {rp}")

    # Step 6: State
    elapsed = time.time() - cycle_start
    state["loop"]["last_cycle"] = datetime.now().isoformat()
    state["loop"]["last_elapsed_s"] = int(elapsed)
    state["build"] = {"status": next((r["status"] for r in check_results if r["name"]=="build"), "?"),
                      "last_check": datetime.now().isoformat()}
    save_state(state)
    write_heartbeat()
    print(f"\n  Done in {elapsed:.0f}s | Queue: {json.dumps(stats())}")
    return {"cycle": cycle_num, "elapsed_s": int(elapsed), "task_result": task_result}


if __name__ == "__main__":
    import argparse
    # Force line-buffered stdout for nohup/redirect (critical for log visibility)
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(line_buffering=True)
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(line_buffering=True)

    parser = argparse.ArgumentParser(description="ELAB Automa V2")
    parser.add_argument("--fast", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--loop", action="store_true")
    args = parser.parse_args()
    if args.loop:
        interval = 3600
        print(f"Loop every {interval//60}min...", flush=True)
        while True:
            try:
                run_cycle(skip_slow=args.fast)
            except Exception as e:
                print(f"Cycle error: {e}")
                import traceback; traceback.print_exc()
            print(f"\nSleeping {interval//60}min...")
            time.sleep(interval)
    else:
        run_cycle(skip_slow=args.fast, dry_run=args.dry_run)
