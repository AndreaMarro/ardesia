#!/usr/bin/env python3
"""
ELAB Automa — Research Loop (Subprocess)

Unified research subprocess that consolidates:
  - parallel_research.py (Kimi K2.5 topic rotation)
  - micro_research.py (Semantic Scholar integration)
  - enhanced_research.py (metric-driven AI analysis + auto task YAML)
  - orchestrator.py inline micro_research() (lines 831-968)

Architecture:
  orchestrator.py ──> subprocess.Popen("python3 research_loop.py --cycle N")
       │                          │
       │  reads state files   writes research-output.json (atomic)
       │                          │
       └── state/ <───────────────┘

Communication protocol:
  INPUT:  state/last-eval.json, state/state.json (read-only)
  OUTPUT: state/research-output.json (atomic write via tmp+rename)
  TASKS:  queue/pending/*.yaml (auto-created when insight score >= 0.7)
  LOGS:   state/research-log.md, knowledge/daily-findings.md

Usage:
  python3 research_loop.py --cycle 7              # single run for cycle 7
  python3 research_loop.py --cycle 7 --sources kimi,scholar  # specific sources
  python3 research_loop.py --daemon --interval 1800  # run every 30min independently
"""

import json
import os
import re
import sys
import tempfile
import time
from datetime import datetime, date
from pathlib import Path
from typing import Optional

AUTOMA_ROOT = Path(__file__).parent
STATE_DIR = AUTOMA_ROOT / "state"
KNOWLEDGE_DIR = AUTOMA_ROOT / "knowledge"
QUEUE_PENDING = AUTOMA_ROOT / "queue" / "pending"
OUTPUT_FILE = STATE_DIR / "research-output.json"
FINDINGS_FILE = STATE_DIR / "parallel-research.json"
LOG_FILE = STATE_DIR / "research-log.md"
PID_FILE = STATE_DIR / "research-loop.pid"

# Ensure dirs exist
STATE_DIR.mkdir(parents=True, exist_ok=True)
KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)
QUEUE_PENDING.mkdir(parents=True, exist_ok=True)

# Import tools (same directory)
sys.path.insert(0, str(AUTOMA_ROOT))
from tools import search_papers, call_deepseek_reasoner, call_kimi, KIMI_API_KEY, DEEPSEEK_API_KEY


# ═══════════════════════════════════════════════════════════════
# RESEARCH AGENDA (topic rotation for diverse coverage)
# ═══════════════════════════════════════════════════════════════

RESEARCH_AGENDA = [
    {
        "id": "pedagogy",
        "topic": "pedagogia docenti inesperti elettronica scuola media Italia",
        "prompt": (
            "SEI ELAB-RESEARCH-LOOP. Ricerca: pedagogia docenti inesperti elettronica scuola media Italia.\n"
            "Contesto ELAB: tutor elettronica per bambini 8-12, simulatore circuiti browser, AI Galileo.\n"
            "Trova 3 insight utili e 1 proposta concreta di miglioramento.\n"
            "Rispondi in italiano. Max 300 parole. Formato:\n"
            "INSIGHT-1: ...\nINSIGHT-2: ...\nINSIGHT-3: ...\nPROPOSTA: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "competitor",
        "topic": "competitor EdTech simulatori elettronica 2026 Tinkercad Wokwi Arduino",
        "prompt": (
            "Analizza brevemente i competitor di ELAB Tutor nel mercato EdTech simulatori elettronica 2026.\n"
            "Focus: Tinkercad Circuits, Wokwi, Falstad, PhET.\n"
            "Cosa fanno meglio? Cosa manca a tutti? Dove ELAB puo' differenziarsi?\n"
            "Max 300 parole. Formato:\n"
            "COMPETITOR-1: [nome] — forza/debolezza\n...\nGAP-MERCATO: ...\nOPPORTUNITA-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "ux_children",
        "topic": "UX design bambini 8-12 anni interfaccia educativa touch tablet",
        "prompt": (
            "Quali sono le best practice UX per interfacce educative per bambini 8-12 anni?\n"
            "Focus: touch target, font, colori, feedback, gamification, attenzione, carico cognitivo.\n"
            "Contestualizza per un simulatore di circuiti elettronici su tablet scolastico.\n"
            "Max 300 parole. Formato:\n"
            "BEST-PRACTICE-1: ...\n...\nAPPLICAZIONE-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "ai_tutoring",
        "topic": "AI tutoring adattivo per STEM education scaffolding ZPD",
        "prompt": (
            "Come dovrebbe comportarsi un AI tutor per bambini che imparano elettronica?\n"
            "Concetti: scaffolding, ZPD (Vygotsky), metodo socratico, feedback formativo.\n"
            "Galileo (il tutor AI di ELAB) deve essere un libro intelligente, NON un professore.\n"
            "Max 300 parole. Formato:\n"
            "PRINCIPIO-1: ...\n...\nERRORE-COMUNE: ...\nRACCOMANDAZIONE-GALILEO: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "lim_classroom",
        "topic": "LIM lavagna interattiva aula tecnologia scuola media lezione tipo",
        "prompt": (
            "Come si svolge una lezione tipo di tecnologia in una scuola media italiana con LIM?\n"
            "Focus: flusso lezione, uso della LIM, interazione docente-studenti, tempi.\n"
            "ELAB Tutor deve funzionare in questo contesto. Cosa serve per essere usabile su LIM?\n"
            "Max 300 parole. Formato:\n"
            "FLUSSO-LEZIONE: ...\nVINCOLI-LIM: ...\nREQUISITI-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "circuit_accuracy",
        "topic": "accuratezza simulatore circuiti educativo KCL KVL MNA errori comuni",
        "prompt": (
            "Quali sono gli errori piu' comuni nei simulatori di circuiti educativi?\n"
            "Focus: accuratezza solver (KCL/KVL/MNA), LED modeling, paralleli, cortocircuiti.\n"
            "ELAB usa un MNA solver proprio (~1700 LOC). Quali edge case testare?\n"
            "Max 300 parole. Formato:\n"
            "EDGE-CASE-1: ...\n...\nTEST-SUGGERITO: ...\nSEVERITY: low/medium/high"
        ),
    },
]

# Actionability keywords for scoring papers
_INSIGHT_KEYWORDS = [
    "improve", "miglior", "solution", "framework", "method",
    "approach", "implementation", "reduce", "increase", "optimize",
    "accessibility", "performance", "engagement", "usability", "touch",
    "mobile", "responsive", "lighthouse", "readability", "scaffolding",
]

# Metric-to-query mapping for Semantic Scholar
_METRIC_QUERIES = {
    "lighthouse_perf": "React SPA Lighthouse LCP optimization code splitting lazy loading",
    "ipad_compliance": "CSS min-height 44px touch target accessibility WCAG 2.1 mobile",
    "galileo_latency": "Node.js Render free tier cold start elimination keepalive cron",
    "galileo_tag_accuracy": "AI tutor intent classification accuracy educational chatbot",
    "galileo_gulpease": "readability index Italian children text simplification elementary",
}

_METRIC_TASK_META = {
    "ipad_compliance": ("P1", ["src/components/simulator/layout.module.css"]),
    "lighthouse_perf": ("P1", ["vite.config.js", "src/main.jsx"]),
    "galileo_tag_accuracy": ("P1", ["src/components/simulator/panels/GalileoResponsePanel.jsx"]),
    "galileo_gulpease": ("P2", ["src/components/simulator/panels/ExperimentGuide.jsx"]),
}


# ═══════════════════════════════════════════════════════════════
# STATE I/O
# ═══════════════════════════════════════════════════════════════

def _load_eval_metrics() -> dict:
    """Load per-metric scores from last-eval.json."""
    eval_path = STATE_DIR / "last-eval.json"
    if not eval_path.exists():
        return {}
    try:
        ev = json.loads(eval_path.read_text())
        scores = {}
        # Try structured format first
        for key in ("lighthouse_perf", "ipad_compliance", "galileo_latency",
                    "galileo_tag_accuracy", "galileo_gulpease", "composite"):
            if key in ev and isinstance(ev[key], (int, float)):
                scores[key] = float(ev[key])
        if scores:
            return scores
        # Fallback: parse SCORE: lines from output field
        for line in ev.get("output", "").split("\n"):
            m = re.match(r"SCORE:(\w+)=([0-9.]+)", line)
            if m and m.group(1) != "composite":
                scores[m.group(1)] = float(m.group(2))
        return scores
    except Exception:
        return {}


def _load_state() -> dict:
    """Load orchestrator state."""
    state_path = STATE_DIR / "state.json"
    if state_path.exists():
        try:
            return json.loads(state_path.read_text())
        except Exception:
            pass
    return {}


def _atomic_write_json(path: Path, data: dict):
    """Write JSON atomically via tmp file + rename (prevents partial reads)."""
    tmp_fd, tmp_path = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.rename(tmp_path, str(path))
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def _load_findings() -> dict:
    """Load existing parallel research findings."""
    if FINDINGS_FILE.exists():
        try:
            return json.loads(FINDINGS_FILE.read_text())
        except Exception:
            pass
    return {"findings": [], "last_cycle": 0, "total_insights": 0}


# ═══════════════════════════════════════════════════════════════
# RESEARCH SOURCES
# ═══════════════════════════════════════════════════════════════

def _source_semantic_scholar(query: str, limit: int = 5) -> dict:
    """Search Semantic Scholar for papers. Returns structured result."""
    try:
        papers = search_papers(query, limit=limit)
        valid = [p for p in papers if p.get("title") and "error" not in p]
        scored = []
        for p in valid:
            title = p.get("title", "")
            abstract = p.get("abstract", "") or ""
            text = (title + " " + abstract).lower()
            score = min(sum(0.12 for kw in _INSIGHT_KEYWORDS if kw in text), 1.0)
            scored.append({
                "title": title[:120],
                "year": p.get("year", 0),
                "citations": p.get("citationCount", 0),
                "insight_score": round(score, 2),
                "abstract_preview": abstract[:250],
            })
        scored.sort(key=lambda x: x["insight_score"], reverse=True)
        return {
            "source": "semantic_scholar",
            "query": query[:120],
            "papers_found": len(valid),
            "top_papers": scored[:3],
            "best_score": scored[0]["insight_score"] if scored else 0,
            "best_insight": scored[0]["title"] if scored else "",
        }
    except Exception as e:
        return {"source": "semantic_scholar", "error": str(e)[:200], "papers_found": 0, "top_papers": []}


def _source_kimi(prompt: str, topic_id: str, cycle: int) -> dict:
    """Call Kimi K2.5 for contextual research."""
    if not KIMI_API_KEY or "placeholder" in KIMI_API_KEY:
        return {"source": "kimi", "status": "skip", "reason": "API key not configured"}
    try:
        start = time.time()
        result = call_kimi(prompt, max_tokens=1500)
        elapsed = time.time() - start
        if result.startswith("[ERROR]") or result.startswith("[SKIP]"):
            return {"source": "kimi", "status": "error", "error": result[:200]}
        severity = "low"
        for line in result.splitlines():
            if line.strip().upper().startswith("SEVERITY:"):
                severity = line.split(":", 1)[1].strip().lower()
                break
        # Save to knowledge dir
        knowledge_file = KNOWLEDGE_DIR / f"kimi-research-cycle-{cycle}.md"
        knowledge_file.write_text(
            f"# Kimi Research — Cycle {cycle}\n"
            f"Topic: {topic_id}\nDate: {datetime.now().isoformat()}\n\n{result}\n"
        )
        return {
            "source": "kimi",
            "status": "ok",
            "topic_id": topic_id,
            "severity": severity,
            "response": result[:2000],
            "elapsed_s": round(elapsed, 1),
        }
    except Exception as e:
        return {"source": "kimi", "status": "error", "error": str(e)[:200]}


def _source_deepseek(worst_metric: str, worst_score: float, query: str) -> dict:
    """Call DeepSeek R1 for root-cause analysis on worst metric."""
    if not DEEPSEEK_API_KEY or "placeholder" in DEEPSEEK_API_KEY:
        return {"source": "deepseek", "status": "skip", "reason": "API key not configured"}
    try:
        start = time.time()
        result = call_deepseek_reasoner(
            f"ELAB Tutor: simulatore circuiti per bambini 8-12 anni.\n"
            f"Topic ricerca: '{query}'\n"
            f"Metrica da migliorare: {worst_metric} (attuale {worst_score:.2f}, target 0.90)\n\n"
            f"Fornisci:\n"
            f"1. 2 problemi concreti ELAB ha su questo topic\n"
            f"2. 1 soluzione tecnica specifica (file + cosa fare)\n"
            f"3. 1 metrica di verifica\n"
            f"Max 150 parole. Solo azioni concrete.",
            max_tokens=400,
        )
        elapsed = time.time() - start
        if result.startswith("[ERROR]") or result.startswith("[SKIP]"):
            return {"source": "deepseek", "status": "error", "error": result[:200]}
        return {
            "source": "deepseek",
            "status": "ok",
            "response": result[:1500],
            "elapsed_s": round(elapsed, 1),
        }
    except Exception as e:
        return {"source": "deepseek", "status": "error", "error": str(e)[:200]}


# ═══════════════════════════════════════════════════════════════
# TASK AUTO-CREATION
# ═══════════════════════════════════════════════════════════════

def _maybe_create_task(scholar_result: dict, kimi_result: dict, worst_metric: str,
                       worst_score: float, cycle: int) -> Optional[str]:
    """Auto-create a queue task YAML if insight score is high enough (>= 0.7)."""
    best_score = scholar_result.get("best_score", 0)
    best_insight = scholar_result.get("best_insight", "")

    # Boost score if Kimi provided actionable content
    if kimi_result.get("status") == "ok" and kimi_result.get("severity") in ("medium", "high"):
        if best_score < 0.7:
            best_score = 0.75
            best_insight = kimi_result.get("response", "")[:300]

    if best_score < 0.7:
        return None

    ts = datetime.now().strftime("%Y%m%d-%H%M")
    task_id = f"research-insight-{worst_metric}-{ts}"
    priority, context_files = _METRIC_TASK_META.get(worst_metric, ("P2", []))
    context_block = "\n".join(f"  - {cf}" for cf in context_files)

    yaml_content = (
        f"id: {task_id}\n"
        f"priority: {priority}\n"
        f"title: 'Research-driven fix: {worst_metric} (score={worst_score:.2f})'\n"
        f"description: |\n"
        f"  Insight da ricerca automatica ciclo {cycle}.\n"
        f"  Metrica target: {worst_metric} (attuale: {worst_score:.3f}, target: 0.90+)\n"
        f"  Fonte: {best_insight[:280]}\n"
        f"success_criteria: |\n"
        f"  python3 automa/evaluate.py | grep 'SCORE:{worst_metric}'\n"
        f"  Valore atteso >= 0.90\n"
        f"context_files:\n"
        f"{context_block}\n"
        f"tags: research-driven,auto-generated,{worst_metric}\n"
        f"created: {datetime.now().isoformat()}\n"
    )

    task_path = QUEUE_PENDING / f"{task_id}.yaml"
    if not task_path.exists():
        task_path.write_text(yaml_content)
        return task_id
    return None


def _convert_findings_to_tasks(cycle: int):
    """Convert high-severity Kimi findings into task YAMLs."""
    data = _load_findings()
    created = 0
    for finding in data.get("findings", []):
        if finding.get("actioned"):
            continue
        severity = finding.get("severity", "low")
        if severity not in ("medium", "high", "blocker"):
            continue
        topic_id = finding.get("topic_id", "unknown")
        f_cycle = finding.get("cycle", 0)
        action = finding.get("raw_response", "")[:200]
        task_id = f"research-{topic_id}-c{f_cycle}"
        task_path = QUEUE_PENDING / f"{task_id}.yaml"
        if task_path.exists():
            finding["actioned"] = True
            continue
        priority = "P1" if severity in ("high", "blocker") else "P2"
        task_path.write_text(
            f"id: {task_id}\n"
            f"priority: {priority}\n"
            f"title: '[Research] {topic_id}: finding from cycle {f_cycle}'\n"
            f"description: |\n"
            f"  Auto-generated from parallel research finding.\n"
            f"  Severity: {severity}\n"
            f"  {action}\n"
            f"tags: research,auto-generated\n"
        )
        finding["actioned"] = True
        created += 1
    if created > 0:
        _atomic_write_json(FINDINGS_FILE, data)
    return created


# ═══════════════════════════════════════════════════════════════
# MAIN RESEARCH CYCLE
# ═══════════════════════════════════════════════════════════════

def run_research(cycle: int, sources: Optional[list] = None) -> dict:
    """Run one complete research cycle.

    Args:
        cycle: current orchestrator cycle number
        sources: list of sources to use (default: all available)
                 Options: "scholar", "kimi", "deepseek"

    Returns:
        Research output dict (also written to state/research-output.json)
    """
    start = time.time()
    if sources is None:
        sources = ["scholar", "kimi", "deepseek"]

    print(f"[research_loop] Cycle {cycle} — sources: {', '.join(sources)}")

    # 1. Load metrics to find worst gap
    metrics = _load_eval_metrics()
    if metrics:
        worst_metric = min(
            (k for k in metrics if k != "composite"),
            key=lambda k: metrics.get(k, 1.0),
            default="composite"
        )
        worst_score = metrics.get(worst_metric, 0)
    else:
        worst_metric = "composite"
        worst_score = 0

    print(f"[research_loop] Worst metric: {worst_metric}={worst_score:.3f}")

    # 2. Build query for Semantic Scholar
    scholar_query = _METRIC_QUERIES.get(
        worst_metric,
        "educational electronics simulation children interactive learning"
    )

    # 3. Select Kimi topic by rotation
    topic_idx = cycle % len(RESEARCH_AGENDA)
    agenda = RESEARCH_AGENDA[topic_idx]

    # 4. Run sources
    results = {
        "cycle": cycle,
        "timestamp": datetime.now().isoformat(),
        "worst_metric": worst_metric,
        "worst_score": worst_score,
        "sources": {},
    }

    if "scholar" in sources:
        print(f"[research_loop] Semantic Scholar: '{scholar_query[:60]}...'")
        results["sources"]["scholar"] = _source_semantic_scholar(scholar_query)

    if "kimi" in sources:
        print(f"[research_loop] Kimi K2.5: topic={agenda['id']}")
        kimi_result = _source_kimi(agenda["prompt"], agenda["id"], cycle)
        results["sources"]["kimi"] = kimi_result
        # Save to parallel-research.json for backward compat
        if kimi_result.get("status") == "ok":
            findings_data = _load_findings()
            finding = {
                "cycle": cycle,
                "topic_id": agenda["id"],
                "topic": agenda["topic"],
                "timestamp": datetime.now().isoformat(),
                "elapsed_s": kimi_result.get("elapsed_s", 0),
                "raw_response": kimi_result.get("response", "")[:2000],
                "status": "ok",
                "severity": kimi_result.get("severity", "low"),
            }
            findings_data["findings"].append(finding)
            findings_data["last_cycle"] = cycle
            findings_data["total_insights"] = len(findings_data["findings"])
            if len(findings_data["findings"]) > 50:
                findings_data["findings"] = findings_data["findings"][-50:]
            _atomic_write_json(FINDINGS_FILE, findings_data)

    if "deepseek" in sources and cycle % 3 == 0:
        print(f"[research_loop] DeepSeek R1: {worst_metric}")
        results["sources"]["deepseek"] = _source_deepseek(worst_metric, worst_score, scholar_query)

    # 5. Auto-create tasks
    scholar_res = results["sources"].get("scholar", {})
    kimi_res = results["sources"].get("kimi", {})
    new_task = _maybe_create_task(scholar_res, kimi_res, worst_metric, worst_score, cycle)
    if new_task:
        results["task_created"] = new_task
        print(f"[research_loop] Task created: {new_task}")

    # Convert existing high-severity findings to tasks
    converted = _convert_findings_to_tasks(cycle)
    if converted:
        results["findings_converted"] = converted

    # 6. Build summary for orchestrator prompt injection
    summary_lines = []
    if scholar_res.get("papers_found", 0) > 0:
        summary_lines.append(f"Scholar: {scholar_res['papers_found']} papers, best_score={scholar_res.get('best_score', 0):.2f}")
        for p in scholar_res.get("top_papers", [])[:2]:
            summary_lines.append(f"  [{p['year']}] {p['title'][:80]}")
    if kimi_res.get("status") == "ok":
        resp_preview = kimi_res.get("response", "")[:150]
        summary_lines.append(f"Kimi [{agenda['id']}] (severity={kimi_res.get('severity','?')}): {resp_preview}")
    ds_res = results["sources"].get("deepseek", {})
    if ds_res.get("status") == "ok":
        summary_lines.append(f"DeepSeek: {ds_res.get('response', '')[:150]}")

    results["summary"] = "\n".join(summary_lines) if summary_lines else "(no results)"

    elapsed = time.time() - start
    results["elapsed_s"] = round(elapsed, 1)
    results["status"] = "ok"

    # 7. Write output atomically
    _atomic_write_json(OUTPUT_FILE, results)

    # 8. Append to research log
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n### [{datetime.now().strftime('%Y-%m-%d %H:%M')}] Cycle {cycle} | {worst_metric}\n")
            f.write(results["summary"] + "\n")
    except Exception:
        pass

    # 9. Save to daily-findings.md
    try:
        daily_path = KNOWLEDGE_DIR / "daily-findings.md"
        with open(daily_path, "a", encoding="utf-8") as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M')} — Cycle {cycle}\n")
            f.write(f"Query: {scholar_query[:80]}\n")
            f.write(f"Papers: {scholar_res.get('papers_found', 0)} | Worst: {worst_metric}={worst_score:.2f}\n")
            if new_task:
                f.write(f"Task created: {new_task}\n")
            f.write("---\n")
    except Exception:
        pass

    print(f"[research_loop] Done in {elapsed:.1f}s — {results['summary'][:100]}")
    return results


# ═══════════════════════════════════════════════════════════════
# ORCHESTRATOR INTEGRATION API (importable functions)
# ═══════════════════════════════════════════════════════════════

def read_research_output() -> Optional[dict]:
    """Read the latest research output (called by orchestrator at step 10).

    Returns None if no output file or if it's stale (> 2 hours old).
    """
    if not OUTPUT_FILE.exists():
        return None
    try:
        data = json.loads(OUTPUT_FILE.read_text())
        ts = data.get("timestamp", "")
        if ts:
            age_s = (datetime.now() - datetime.fromisoformat(ts)).total_seconds()
            if age_s > 7200:  # stale after 2 hours
                return None
        return data
    except Exception:
        return None


def get_research_summary(max_chars: int = 2000) -> str:
    """Get research summary for prompt injection (backward-compatible with get_latest_findings)."""
    data = read_research_output()
    if data and data.get("summary"):
        return data["summary"][:max_chars]
    # Fallback to parallel-research.json format
    findings_data = _load_findings()
    findings = findings_data.get("findings", [])[-5:]
    if not findings:
        return ""
    lines = []
    for f in findings:
        status = "OK" if f.get("status") == "ok" else "ERR"
        severity = f.get("severity", "?")
        lines.append(
            f"  [{status}] Cycle {f['cycle']} — {f['topic_id']} "
            f"(severity={severity}): {f.get('raw_response', '')[:150]}"
        )
    return "\n".join(lines)


def is_research_running() -> bool:
    """Check if a research subprocess is currently running."""
    if not PID_FILE.exists():
        return False
    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, 0)  # signal 0 = check if process exists
        return True
    except (ValueError, ProcessLookupError, PermissionError):
        PID_FILE.unlink(missing_ok=True)
        return False


# ═══════════════════════════════════════════════════════════════
# CLI ENTRYPOINT
# ═══════════════════════════════════════════════════════════════

def main():
    import argparse
    parser = argparse.ArgumentParser(description="ELAB Research Loop (subprocess)")
    parser.add_argument("--cycle", type=int, default=1, help="Current cycle number")
    parser.add_argument("--sources", type=str, default="scholar,kimi,deepseek",
                        help="Comma-separated sources: scholar,kimi,deepseek")
    parser.add_argument("--daemon", action="store_true",
                        help="Run continuously at --interval seconds")
    parser.add_argument("--interval", type=int, default=1800,
                        help="Daemon interval in seconds (default: 1800 = 30min)")
    args = parser.parse_args()

    sources = [s.strip() for s in args.sources.split(",") if s.strip()]

    # Write PID file
    PID_FILE.write_text(str(os.getpid()))

    try:
        if args.daemon:
            print(f"[research_loop] Daemon mode — interval={args.interval}s, PID={os.getpid()}")
            cycle = args.cycle
            while True:
                try:
                    run_research(cycle, sources=sources)
                except Exception as e:
                    print(f"[research_loop] Error in cycle {cycle}: {e}")
                cycle += 1
                time.sleep(args.interval)
        else:
            result = run_research(args.cycle, sources=sources)
            # Print JSON to stdout for subprocess capture
            print(json.dumps({"research_status": result.get("status", "error"),
                              "elapsed_s": result.get("elapsed_s", 0),
                              "summary_preview": result.get("summary", "")[:200]}))
    finally:
        PID_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
