#!/usr/bin/env python3
"""
Enhanced micro-research v2: metric-driven, AI-powered, task-generating.

Ogni ciclo:
- Carica last-eval.json per trovare la metrica peggiore
- Sceglie query dinamica basata sui valori metrici reali
- Cerca paper su Semantic Scholar
- Chiama DeepSeek (cicli pari) o Kimi (cicli dispari) per analisi AI
- Se insight score >= 0.7 → crea YAML task in queue/pending/
- Salva tutto in research-log.md e knowledge/daily-findings.md
"""

import json
import re
from datetime import datetime, date
from pathlib import Path
from tools import search_papers, call_deepseek_reasoner, call_kimi

AUTOMA_ROOT = Path(__file__).parent
KNOWLEDGE_DIR = AUTOMA_ROOT / "knowledge"
KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

# Keyword pool for actionability scoring
_INSIGHT_KEYWORDS = [
    "improve", "miglior", "solution", "framework", "method",
    "approach", "implementation", "reduce", "increase", "optimize",
    "accessibility", "performance", "engagement", "usability", "touch",
    "mobile", "responsive", "lighthouse", "readability", "scaffolding",
]


def _load_eval_metrics() -> dict:
    """Load per-metric scores from last-eval.json. Returns {metric_name: float}."""
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    scores = {}
    if eval_path.exists():
        try:
            ev = json.loads(eval_path.read_text())
            for line in ev.get("output", "").split("\n"):
                m = re.match(r"SCORE:(\w+)=([0-9.]+)", line)
                if m and m.group(1) != "composite":
                    scores[m.group(1)] = float(m.group(2))
        except Exception:
            pass
    return scores


def _dynamic_query_from_metrics(metrics: dict) -> str:
    """Choose research query based on worst metric values from last-eval."""
    lh = metrics.get("lighthouse_perf", 1.0)
    ipad = metrics.get("ipad_compliance", 1.0)
    latency = metrics.get("galileo_latency", 1.0)
    tag_acc = metrics.get("galileo_tag_accuracy", 1.0)
    gulpease = metrics.get("galileo_gulpease", 1.0)

    if lh < 0.8:
        return "React SPA Lighthouse LCP optimization code splitting lazy loading"
    if ipad < 0.8:
        return "CSS min-height 44px touch target accessibility WCAG 2.1 mobile"
    if latency < 0.3:
        return "Node.js Render free tier cold start elimination keepalive cron"
    if tag_acc < 0.9:
        return "AI tutor intent classification accuracy educational chatbot"
    if gulpease < 0.8:
        return "readability index Italian children text simplification elementary"
    # Default: general EdTech improvement
    return "educational electronics simulation children interactive learning"


def _score_insight(title: str, abstract: str) -> float:
    """Score actionability of a paper (0.0–1.0). Each keyword adds 0.12, capped at 1.0."""
    text = (title + " " + (abstract or "")).lower()
    score = sum(0.12 for kw in _INSIGHT_KEYWORDS if kw in text)
    return min(score, 1.0)


def _create_task_yaml(insight_text: str, topic: str, metric: str,
                      metric_score: float, cycle: int) -> str:
    """Write a task YAML to queue/pending/ and return its id."""
    queue_dir = AUTOMA_ROOT / "queue" / "pending"
    queue_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y%m%d-%H%M")
    task_id = f"research-insight-{metric}-{ts}"

    # Priority + context files per metric
    _METRIC_META = {
        "ipad_compliance": ("P1", [
            "src/components/simulator/layout.module.css",
            "src/components/simulator/NewElabSimulator.jsx",
        ]),
        "lighthouse_perf": ("P1", [
            "vite.config.js",
            "src/main.jsx",
        ]),
        "galileo_tag_accuracy": ("P1", [
            "src/components/simulator/panels/GalileoResponsePanel.jsx",
        ]),
        "galileo_gulpease": ("P2", [
            "src/components/simulator/panels/ExperimentGuide.jsx",
        ]),
    }
    priority, context_files = _METRIC_META.get(metric, ("P2", []))

    context_block = "\n".join(f"  - {cf}" for cf in context_files)
    yaml_content = (
        f"id: {task_id}\n"
        f"priority: {priority}\n"
        f"title: 'Research-driven fix: {metric} (score={metric_score:.2f})'\n"
        f"description: |\n"
        f"  Insight da ricerca automatica ciclo {cycle} su '{topic}'.\n"
        f"  Metrica target: {metric} (attuale: {metric_score:.3f}, target: 0.90+)\n"
        f"  Fonte: {insight_text[:280]}\n"
        f"success_criteria: |\n"
        f"  python3 automa/evaluate.py | grep 'SCORE:{metric}'\n"
        f"  Valore atteso >= 0.90\n"
        f"context_files:\n"
        f"{context_block}\n"
        f"tags: research-driven,auto-generated,{metric}\n"
        f"created: {datetime.now().isoformat()}\n"
    )

    task_path = queue_dir / f"{task_id}.yaml"
    task_path.write_text(yaml_content)
    return task_id


def enhanced_micro_research(check_results: list, state: dict) -> str:
    """
    Metric-driven, AI-powered micro-research with auto YAML task generation.

    Flusso: metriche → query dinamica → Scholar → AI analysis → task YAML → log
    """
    cycle = state.get("loop", {}).get("cycles_today", 0)
    metrics = _load_eval_metrics()

    # Worst metric
    worst_metric = min(metrics, key=metrics.get) if metrics else "ipad_compliance"
    worst_score = metrics.get(worst_metric, 0.68)

    # Dynamic query
    query = _dynamic_query_from_metrics(metrics)

    results = []

    # ── Semantic Scholar ────────────────────────────────
    papers = search_papers(query, limit=4)
    valid_papers = [p for p in papers if p.get("title") and "error" not in p]

    best_insight_score = 0.0
    best_insight_text = ""

    if valid_papers:
        results.append("Papers:")
        for paper in valid_papers[:3]:
            title = paper.get("title", "")[:100]
            year = paper.get("year", "?")
            cites = paper.get("citationCount", 0)
            abstract = paper.get("abstract", "") or ""
            ins = _score_insight(title, abstract)
            results.append(f"  [{year}] {title} ({cites} cit.) insight={ins:.2f}")
            if ins > best_insight_score:
                best_insight_score = ins
                best_insight_text = f"{title}: {abstract[:200]}"

    # ── AI Analysis — DeepSeek (even cycles) / Kimi (odd cycles) ──
    if cycle % 2 == 0:
        try:
            ai_result = call_deepseek_reasoner(
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
            if ai_result and "[ERROR]" not in ai_result and "[SKIP]" not in ai_result:
                results.append(f"DeepSeek [{worst_metric}]: {ai_result[:450]}")
                # If paper score is low but AI gives actionable content, boost
                if best_insight_score < 0.7:
                    best_insight_score = 0.75
                    best_insight_text = ai_result[:300]
        except Exception as e:
            results.append(f"[DeepSeek error: {e}]")
    else:
        try:
            kimi_result = call_kimi(
                f"Topic: '{query}'. ELAB Tutor = simulatore circuiti bambini 8-12.\n"
                f"Metrica da migliorare: {worst_metric} = {worst_score:.2f}\n"
                f"Dai 3 trend, 1 idea implementabile subito, 1 rischio. Max 150 parole."
            )
            if kimi_result and "[ERROR]" not in kimi_result and "[SKIP]" not in kimi_result:
                results.append(f"Kimi [{worst_metric}]: {kimi_result[:450]}")
        except Exception as e:
            results.append(f"[Kimi error: {e}]")

    # ── Auto-generate YAML task if insight score >= 0.7 ────────
    task_created = None
    if best_insight_score >= 0.7 and best_insight_text:
        try:
            task_id = _create_task_yaml(
                best_insight_text, query, worst_metric, worst_score, cycle
            )
            results.append(f"Task created: {task_id} (insight_score={best_insight_score:.2f})")
            task_created = task_id
        except Exception as e:
            results.append(f"[Task creation error: {e}]")

    # ── Persist to knowledge/daily-findings.md ─────────────────
    ts = datetime.now().strftime("%H:%M")
    header = (
        f"\n\n## {date.today()} {ts} — Cycle {cycle}\n"
        f"**Worst metric**: {worst_metric} = {worst_score:.3f}\n"
        f"**Query**: {query}\n"
    )
    findings_content = header + "\n".join(results)
    findings_file = KNOWLEDGE_DIR / "daily-findings.md"
    with open(findings_file, "a", encoding="utf-8") as f:
        f.write(findings_content + "\n")

    # ── Persist to state/research-log.md ───────────────────────
    log_file = AUTOMA_ROOT / "state" / "research-log.md"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"\n## Cycle {cycle} — {query} [{worst_metric}={worst_score:.3f}]\n")
        for r in results:
            if r.strip():
                f.write(f"{r[:400]}\n")

    # ── Summary for orchestrator print ─────────────────────────
    summary = (
        f"Research: '{query[:60]}' | {len(valid_papers)} papers | "
        f"worst={worst_metric}={worst_score:.3f}"
    )
    if task_created:
        summary += f" | Task: {task_created[:40]}"
    if best_insight_score >= 0.7:
        summary += " | ACTIONABLE"
    return summary
