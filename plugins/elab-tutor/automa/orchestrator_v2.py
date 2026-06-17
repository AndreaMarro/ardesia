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
from queue_manager import get_next_task, claim_task, complete_task, fail_task, stats
from tools import search_papers, gulpease_index, chat_galileo

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
    idx = cycle % len(skills)
    primary = skills[idx]
    others = [s for i, s in enumerate(skills) if i != idx]
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
                    subprocess.run(["git", "checkout", "--", "."],
                                   cwd=str(PROJECT_ROOT), timeout=10)
                    print(f"   Reverted to {git_hash}")
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
    for ctx_file in ["context/teacher-principles.md", "context/volume-path.md"]:
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

## PRINCIPIO ZERO
L'insegnante inesperto e' il vero utente. Galileo e' un libro intelligente, non un professore.
Linguaggio LIM: SEMPRE 10-14 anni.
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

## CHECK RESULTS
{check_summary}

{work_section}

## REGOLE
1. ZERO REGRESSIONI - `npm run build` DEVE passare.
2. CoV obbligatoria alla fine.
3. Massima onesta. FAIL non "parzialmente ok".
4. L'insegnante e' il vero utente.
5. Touch >=56px, font leggibili, no overflow.
6. Severity obbligatoria: blocker/high/medium/low.
7. Evidence level: verified/hypothesis/speculation.

## COV OBBLIGATORIA (alla fine)
1. Claim senza prova? 2. Contraddizioni? 3. Regressioni?
4. Build passa? 5. Principio Zero? 6. Output riusabile?
7. Severity assegnata? NON ammorbidire.

## TOOLS
- DeepSeek R1, Gemini 2.5 Pro, Kimi K2.5, Brain VPS, Playwright, Semantic Scholar

## OUTPUT (JSON sull'ultima riga)
{{"task": "desc", "status": "done|partial|failed", "files_changed": [], "build_pass": true, "cov_verified": true, "severity": "low", "evidence": "verified"}}
"""
    return prompt


def run_claude_headless(prompt, max_time=1500):
    log_file = AUTOMA_ROOT / "logs" / f"claude-{datetime.now().strftime('%H%M%S')}.log"
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--output-format", "text"],
            capture_output=True, text=True, timeout=max_time,
            cwd=str(PROJECT_ROOT),
            env={**os.environ, "CLAUDE_AUTO_ACCEPT": "1"},
        )
        output = result.stdout
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
    """Adaptive mode selection - score-driven, not just cycle%."""
    failed = [r for r in check_results if r["status"] == "fail"]
    if failed:
        return "IMPROVE"
    if state:
        reg = _check_score_regression(state)
        if reg and reg.get("drop_pct", 0) > 5:
            return "IMPROVE"
    if task and task.get("priority") in ("P0", "P1"):
        return "IMPROVE"
    if cycle % 20 == 0 and cycle > 0:
        return "WRITE"
    if cycle % 10 == 0 and cycle > 0:
        return "EVOLVE"
    if cycle % 5 == 0:
        return "AUDIT"
    if cycle % 3 == 0:
        return "RESEARCH"
    return "IMPROVE"


def ai_scoring(state, cycle):
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
        analysis = call_gemini(
            "Analizza il mercato EdTech italiano 2026 per simulatori elettronica scuole medie. "
            "Competitor di ELAB Tutor? Cosa manca? Max 200 parole."
        )
        results.append(f"Gemini market: {analysis[:300]}")
        _persist_ai_feedback(f"[Gemini market] {analysis[:300]}")

    if cycle % 10 == 5:
        kimi_review = call_kimi(
            f"Review EdTech: ELAB Tutor ha 62 esperimenti, AI Galileo, simulatore KVL/KCL+AVR.\n"
            f"Score: {json.dumps(state.get('scores', {}))}\nCosa miglioreresti? Max 200 parole."
        )
        results.append(f"Kimi review: {kimi_review[:300]}")
        _persist_ai_feedback(f"[Kimi review] {kimi_review[:300]}")

    return "\n".join(results) if results else None


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

    print(f"\n{'='*60}")
    print(f" ELAB Automa V2 - Cycle {cycle_num} ({datetime.now().strftime('%H:%M:%S')})")
    print(f"{'='*60}")

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

    # Step 1: Checks
    print("\n  Running 7 checks...")
    check_results = run_all_checks(skip_slow=skip_slow)
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
    ai_result = ai_scoring(state, cycle_num) if not dry_run else None
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
                    max_turns=20, model="claude-sonnet-4-20250514")
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
    parser = argparse.ArgumentParser(description="ELAB Automa V2")
    parser.add_argument("--fast", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--loop", action="store_true")
    args = parser.parse_args()
    if args.loop:
        interval = 3600
        print(f"Loop every {interval//60}min...")
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
