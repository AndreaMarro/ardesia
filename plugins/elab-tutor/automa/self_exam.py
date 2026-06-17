#!/usr/bin/env python3
"""
ELAB Automa — Self Exam (Esame di Coscienza)
Meta-improvement module: analizza i cicli recenti, trova pattern di fallimento,
genera proposte di miglioramento e applica quelle sicure automaticamente.

Chiamato ogni 10 cicli dall'orchestratore.
"""

import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

AUTOMA_ROOT = Path(__file__).parent
REPORTS_DIR = AUTOMA_ROOT / "reports"
STATE_FILE = AUTOMA_ROOT / "state" / "state.json"
EXAM_LOG_FILE = AUTOMA_ROOT / "self_exam_log.json"
LEARNED_RULES_FILE = AUTOMA_ROOT / "learned_rules.md"
EXAM_REPORT_FILE = AUTOMA_ROOT / "self_exam_report.md"


# ─────────────────────────────────────────────
# 1. CARICAMENTO REPORT
# ─────────────────────────────────────────────

def load_recent_reports(n: int = 20) -> list[dict]:
    """Carica gli ultimi N report da reports/ (solo file ciclo, es. 2026-03-23-cycle-*.json)."""
    report_files = sorted(REPORTS_DIR.glob("2*-cycle-*.json"))
    selected = report_files[-n:] if len(report_files) >= n else report_files
    reports = []
    for f in selected:
        try:
            reports.append(json.loads(f.read_text()))
        except Exception:
            pass
    return reports


# ─────────────────────────────────────────────
# 2. ANALISI METRICHE
# ─────────────────────────────────────────────

def analyze_cycles(reports: list[dict]) -> dict:
    """
    Calcola metriche aggregate su una lista di report:
    - success_rate, failure_rate, timeout_rate, partial_rate
    - avg_tokens (se disponibili da Agent SDK)
    - mode_distribution
    - tool_usage: Counter dei tool usati
    - tool_failure_correlation: {tool: failure_rate_when_tool_used}
    - checks_failure_frequency: {check_name: fail_count}
    - research_coverage: quanti cicli hanno research non-null
    """
    if not reports:
        return {}

    total = len(reports)
    statuses = Counter(r.get("task_result", {}).get("status", "unknown") for r in reports)
    modes = Counter(r.get("mode", "IMPROVE") for r in reports)

    tokens_list = [r["task_result"].get("tokens", 0) for r in reports if r.get("task_result", {}).get("tokens")]
    avg_tokens = int(sum(tokens_list) / len(tokens_list)) if tokens_list else 0

    # Tool usage e correlazione con fallimento
    tool_usage: Counter = Counter()
    tool_fail: defaultdict = defaultdict(lambda: {"total": 0, "failed": 0})
    for r in reports:
        tr = r.get("task_result", {})
        tools = tr.get("tools_used", [])
        failed = tr.get("status") in ("failed",)
        for t in tools:
            tool_usage[t] += 1
            tool_fail[t]["total"] += 1
            if failed:
                tool_fail[t]["failed"] += 1

    tool_failure_correlation = {
        t: round(v["failed"] / v["total"], 2)
        for t, v in tool_fail.items()
        if v["total"] >= 2
    }

    # Fallimenti per check
    check_fail_count: Counter = Counter()
    for r in reports:
        for c in r.get("checks", []):
            if c.get("status") == "fail":
                check_fail_count[c["name"]] += 1

    research_coverage = sum(1 for r in reports if r.get("research")) / total

    return {
        "total_cycles": total,
        "success_rate": round(statuses.get("done", 0) / total, 2),
        "failure_rate": round(statuses.get("failed", 0) / total, 2),
        "timeout_rate": round(
            sum(1 for r in reports if r.get("task_result", {}).get("error", "").startswith("Timed out")) / total, 2
        ),
        "partial_rate": round(statuses.get("partial", 0) / total, 2),
        "status_distribution": dict(statuses),
        "mode_distribution": dict(modes),
        "avg_tokens": avg_tokens,
        "tool_usage": dict(tool_usage),
        "tool_failure_correlation": tool_failure_correlation,
        "check_fail_frequency": dict(check_fail_count),
        "research_coverage": round(research_coverage, 2),
    }


def compare_windows(reports: list[dict], window_size: int = 10) -> dict:
    """
    Confronta la finestra corrente (ultimi window_size) con quella precedente.
    Ritorna un dict con deltas e giudizio 'improving'/'worsening'/'stable'.
    """
    if len(reports) < window_size:
        return {"verdict": "insufficient_data", "cycles_available": len(reports)}

    current = analyze_cycles(reports[-window_size:])
    previous = analyze_cycles(reports[-2 * window_size:-window_size]) if len(reports) >= 2 * window_size else {}

    if not previous:
        return {"verdict": "no_previous_window", "current": current}

    delta_success = round(current["success_rate"] - previous["success_rate"], 2)
    delta_failure = round(current["failure_rate"] - previous["failure_rate"], 2)

    if delta_success >= 0.1:
        verdict = "improving"
    elif delta_success <= -0.1:
        verdict = "worsening"
    else:
        verdict = "stable"

    return {
        "verdict": verdict,
        "current_window": current,
        "previous_window": previous,
        "delta_success_rate": delta_success,
        "delta_failure_rate": delta_failure,
    }


# ─────────────────────────────────────────────
# 3. PATTERN DETECTION
# ─────────────────────────────────────────────

def detect_patterns(reports: list[dict]) -> list[dict]:
    """
    Rileva pattern problematici nei report recenti.
    Ogni pattern è un dict con: id, name, severity, description, evidence.
    """
    patterns = []
    if not reports:
        return patterns

    recent = reports[-10:] if len(reports) >= 10 else reports

    # ── Pattern 1: Timeout sistematico ──────────────────────────────────
    timeout_count = sum(
        1 for r in recent
        if r.get("task_result", {}).get("error", "").startswith("Timed out")
    )
    if timeout_count >= 3:
        patterns.append({
            "id": "timeout-loop",
            "name": "Timeout sistematico",
            "severity": "high",
            "description": f"{timeout_count}/{len(recent)} cicli recenti hanno fatto timeout",
            "evidence": {"timeout_count": timeout_count, "window": len(recent)},
        })

    # ── Pattern 2: Tool anti-pattern ─────────────────────────────────────
    tool_fail: defaultdict = defaultdict(lambda: {"total": 0, "failed": 0})
    for r in recent:
        tr = r.get("task_result", {})
        tools = tr.get("tools_used", [])
        failed = tr.get("status") == "failed"
        for t in tools:
            tool_fail[t]["total"] += 1
            if failed:
                tool_fail[t]["failed"] += 1

    for tool, counts in tool_fail.items():
        if counts["total"] >= 2:
            fail_rate = counts["failed"] / counts["total"]
            if fail_rate >= 0.7:
                patterns.append({
                    "id": f"tool-antipattern-{tool.replace('_', '-')}",
                    "name": f"Tool anti-pattern: {tool}",
                    "severity": "medium",
                    "description": (
                        f"'{tool}' correla con fallimento nel {int(fail_rate*100)}% dei cicli "
                        f"in cui è usato ({counts['failed']}/{counts['total']})"
                    ),
                    "evidence": {"tool": tool, "fail_rate": round(fail_rate, 2), **counts},
                })

    # ── Pattern 3: Score plateau ─────────────────────────────────────────
    eval_path = AUTOMA_ROOT / "state" / "last-eval.json"
    if eval_path.exists():
        try:
            eval_data = json.loads(eval_path.read_text())
            composite = eval_data.get("composite")
            eval_cycle = eval_data.get("cycle", 0)
            current_cycle = reports[-1].get("cycle", 0) if reports else 0
            cycles_since_eval = current_cycle - eval_cycle
            # FIX: composite is 0-1 scale (was incorrectly checked against 8.0)
            if composite is not None and composite < 0.95 and cycles_since_eval > 8:
                patterns.append({
                    "id": "score-plateau",
                    "name": "Score composito in plateau",
                    "severity": "medium",
                    "description": (
                        f"Score composito fermo a {composite:.4f} da {cycles_since_eval} cicli "
                        f"(target ≥0.95)"
                    ),
                    "evidence": {"composite": composite, "cycles_since_eval": cycles_since_eval},
                })
        except Exception:
            pass

    # ── Pattern 8: Lighthouse persistente sotto target ────────────────────
    eval_path2 = AUTOMA_ROOT / "state" / "last-eval.json"
    if eval_path2.exists():
        try:
            ev = json.loads(eval_path2.read_text())
            output = ev.get("output", "")
            lh_score = None
            for line in output.splitlines():
                if "lighthouse_perf" in line and "=" in line:
                    try:
                        lh_score = float(line.split("=")[-1])
                    except ValueError:
                        pass
            if lh_score is not None and lh_score < 0.80:
                patterns.append({
                    "id": "lighthouse-below-target",
                    "name": "Lighthouse sotto target 80%",
                    "severity": "medium",
                    "description": f"Lighthouse performance {lh_score:.0%} < 0.80 target. Causa probabile: RC4 obfuscation o bundle size.",
                    "evidence": {"lighthouse_score": lh_score, "target": 0.80},
                })
        except Exception:
            pass

    # ── Pattern 4: Cost inefficiency ─────────────────────────────────────
    high_cost_no_output = [
        r for r in recent
        if r.get("task_result", {}).get("tokens", 0) > 200_000
        and r.get("task_result", {}).get("status") != "done"
    ]
    if high_cost_no_output:
        patterns.append({
            "id": "cost-inefficiency",
            "name": "Cost inefficiency",
            "severity": "medium",
            "description": (
                f"{len(high_cost_no_output)} cicli con >200k token senza output completato"
            ),
            "evidence": {"count": len(high_cost_no_output)},
        })

    # ── Pattern 5: Mode mismatch ──────────────────────────────────────────
    research_cycles_without_output = [
        r for r in recent
        if r.get("mode") == "RESEARCH" and not r.get("research")
    ]
    if len(research_cycles_without_output) >= 2:
        patterns.append({
            "id": "mode-mismatch-research",
            "name": "RESEARCH mode senza output",
            "severity": "low",
            "description": (
                f"Modalità RESEARCH attivata {len(research_cycles_without_output)} volte "
                f"senza salvare ricerche nel report"
            ),
            "evidence": {"count": len(research_cycles_without_output)},
        })

    # ── Pattern 6: Check persistente in warn ─────────────────────────────
    check_warn_count: Counter = Counter()
    for r in recent:
        for c in r.get("checks", []):
            if c.get("status") == "warn":
                check_warn_count[c["name"]] += 1
    for check_name, count in check_warn_count.items():
        if count >= 5:
            patterns.append({
                "id": f"persistent-warn-{check_name}",
                "name": f"Check '{check_name}' in warning persistente",
                "severity": "low",
                "description": f"Il check '{check_name}' è in stato 'warn' da {count} cicli consecutivi",
                "evidence": {"check": check_name, "warn_cycles": count},
            })

    # ── Pattern 7: Fallimento galileo persistente ─────────────────────────
    galileo_fail_count = sum(
        1 for r in recent
        if any(
            c.get("name") == "galileo" and c.get("status") == "fail"
            for c in r.get("checks", [])
        )
    )
    if galileo_fail_count >= 3:
        patterns.append({
            "id": "galileo-check-failing",
            "name": "Galileo check in fallimento ripetuto",
            "severity": "high",
            "description": f"Il check Galileo fallisce in {galileo_fail_count}/{len(recent)} cicli",
            "evidence": {"fail_count": galileo_fail_count, "window": len(recent)},
        })

    return patterns


# ─────────────────────────────────────────────
# 4. GENERAZIONE PROPOSTE
# ─────────────────────────────────────────────

def _next_proposal_id(exam_log: dict) -> str:
    proposals = exam_log.get("proposals", [])
    return f"proposal-{len(proposals) + 1:03d}"


def generate_proposals(patterns: list[dict], exam_log: dict) -> list[dict]:
    """
    Per ogni pattern rilevato, genera una proposta strutturata di miglioramento.
    Evita duplicati rispetto alle proposte esistenti nel log.
    """
    proposals = []
    existing_patterns = {p.get("pattern_id") for p in exam_log.get("proposals", [])}

    for pattern in patterns:
        pid = pattern["id"]
        if pid in existing_patterns:
            continue  # già proposto

        proposal: dict = {
            "id": _next_proposal_id({**exam_log, "proposals": exam_log.get("proposals", []) + proposals}),
            "pattern_id": pid,
            "created_at": datetime.now().isoformat(),
            "status": "proposed",
            "effect_measured_at_cycle": None,
            "effect_delta": None,
        }

        if pid == "timeout-loop":
            proposal.update({
                "type": "prompt_rule",
                "description": "Ridurre la complessità dei task per evitare timeout sistematici",
                "action": "Aggiungi regola: 'Se il task richiede più di 5 tool call complesse, spezzalo in sotto-task. Non usare Playwright e compilazione nello stesso ciclo.'",
                "risk": "low",
                "expected_impact": "Riduzione timeout del 50%+ limitando scope per ciclo",
                "auto_apply": True,
            })

        elif pid.startswith("tool-antipattern-"):
            tool = pattern["evidence"]["tool"]
            fail_rate = pattern["evidence"]["fail_rate"]
            proposal.update({
                "type": "tool_restriction",
                "description": f"Limitare uso di '{tool}' che correla con fallimento ({int(fail_rate*100)}%)",
                "action": f"Aggiungi regola: 'Usa {tool} solo se strettamente necessario. Prima verifica con strumenti più leggeri.'",
                "risk": "low",
                "expected_impact": f"Riduzione fallimenti nei cicli che usano {tool}",
                "auto_apply": True,
            })

        elif pid == "score-plateau":
            proposal.update({
                "type": "task_generation",
                "description": "Score composito in stallo — serve task di miglioramento mirato",
                "action": "Crea task YAML: 'Revisione metriche evaluate.py — identificare quale dimensione è bloccata e proporre fix concreto'",
                "risk": "medium",
                "expected_impact": "Sblocco plateau con intervento mirato su metrica specifica",
                "auto_apply": False,
            })

        elif pid == "cost-inefficiency":
            proposal.update({
                "type": "prompt_rule",
                "description": "Cicli ad alto costo senza output completato",
                "action": "Aggiungi regola: 'Se dopo 10 tool call il task non è completato, scrivi un partial report e concludi il ciclo. Non esaurire tutti i token.'",
                "risk": "low",
                "expected_impact": "Riduzione token sprecati, più cicli completati",
                "auto_apply": True,
            })

        elif pid == "mode-mismatch-research":
            proposal.update({
                "type": "mode_adjustment",
                "description": "RESEARCH mode non produce output nel report",
                "action": "Aggiungi regola: 'In modalità RESEARCH, l\\'output finale DEVE includere almeno 1 finding in automa/knowledge/. Se non riesci, scrivi comunque un file vuoto con le domande aperte.'",
                "risk": "low",
                "expected_impact": "Research coverage aumenta al 100% dei cicli RESEARCH",
                "auto_apply": True,
            })

        elif pid.startswith("persistent-warn-"):
            check_name = pattern["evidence"]["check"]
            proposal.update({
                "type": "config_change",
                "description": f"Check '{check_name}' in warning da troppi cicli",
                "action": f"Crea task: 'Fix warning persistente check {check_name} — analizzare causa e risolvere'",
                "risk": "medium",
                "expected_impact": "Riduzione warning cronici che mascherano problemi reali",
                "auto_apply": False,
            })

        elif pid == "galileo-check-failing":
            proposal.update({
                "type": "task_generation",
                "description": "Galileo check fallisce sistematicamente — richiede fix urgente",
                "action": "Crea task P0: 'Fix Galileo check — analizzare perché [[AZIONE:loadexp]] non viene emesso e correggerlo'",
                "risk": "high",
                "expected_impact": "Galileo check torna al 100% — check critico per qualità risposta AI",
                "auto_apply": False,
            })

        else:
            continue  # pattern non mappato

        proposals.append(proposal)

    return proposals


# ─────────────────────────────────────────────
# 5. SELF-IMPROVEMENT REGISTRY
# ─────────────────────────────────────────────

def load_exam_log() -> dict:
    if EXAM_LOG_FILE.exists():
        try:
            return json.loads(EXAM_LOG_FILE.read_text())
        except Exception:
            pass
    return {"proposals": [], "runs": []}


def save_exam_log(log: dict):
    EXAM_LOG_FILE.write_text(json.dumps(log, indent=2))


def apply_low_risk_proposals(proposals: list[dict]) -> list[dict]:
    """
    Applica automaticamente le proposte con risk='low' e auto_apply=True.
    Aggiunge la regola a learned_rules.md con timestamp e confidence iniziale.
    Ritorna le proposte con status aggiornato.
    """
    applied = []
    for p in proposals:
        if p.get("risk") == "low" and p.get("auto_apply") and p.get("status") == "proposed":
            rule_text = p["action"]
            _append_learned_rule(
                rule_id=p["id"],
                proposal_type=p["type"],
                rule_text=rule_text,
                pattern_id=p["pattern_id"],
            )
            p["status"] = "applied"
            p["applied_at"] = datetime.now().isoformat()
            applied.append(p)
    return applied


def _append_learned_rule(rule_id: str, proposal_type: str, rule_text: str, pattern_id: str):
    """Aggiunge una regola appresa a learned_rules.md."""
    if not LEARNED_RULES_FILE.exists():
        LEARNED_RULES_FILE.write_text(_learned_rules_header())

    content = LEARNED_RULES_FILE.read_text()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    entry = (
        f"\n## [{rule_id}] {proposal_type.upper()} — {timestamp}\n"
        f"**Pattern origine**: `{pattern_id}`\n"
        f"**Confidenza**: 0.5 (nuova regola, non ancora validata)\n"
        f"**Regola**: {rule_text}\n"
    )
    LEARNED_RULES_FILE.write_text(content + entry)


def update_pending_human_review(proposals: list[dict], state: dict) -> dict:
    """
    Aggiunge proposte medium/high risk a state.json sotto pending_human_review.
    """
    if "pending_human_review" not in state:
        state["pending_human_review"] = []

    existing_ids = {p.get("id") for p in state["pending_human_review"]}
    for p in proposals:
        if p.get("risk") in ("medium", "high") and p["id"] not in existing_ids:
            state["pending_human_review"].append({
                "id": p["id"],
                "type": p["type"],
                "description": p["description"],
                "action": p["action"],
                "risk": p["risk"],
                "expected_impact": p["expected_impact"],
                "created_at": p.get("created_at"),
            })
    return state


def update_proposal_confidence(exam_log: dict, current_reports: list[dict]) -> dict:
    """
    Per ogni proposta applicata, misura l'effetto dopo N cicli:
    - confronta success_rate prima e dopo l'applicazione
    - aggiorna confidence in learned_rules.md
    """
    if not current_reports:
        return exam_log

    current_cycle = current_reports[-1].get("cycle", 0) if current_reports else 0

    for p in exam_log.get("proposals", []):
        if p.get("status") != "applied":
            continue
        if p.get("effect_measured_at_cycle"):
            continue  # già misurato

        applied_at_str = p.get("applied_at", "")
        if not applied_at_str:
            continue

        # Misura dopo almeno 5 cicli dall'applicazione
        applied_cycle_reports = [
            r for r in current_reports
            if r.get("timestamp", "") >= applied_at_str
        ]
        if len(applied_cycle_reports) < 5:
            continue

        pre = [r for r in current_reports if r.get("timestamp", "") < applied_at_str][-5:]
        post = applied_cycle_reports[:5]

        if not pre or not post:
            continue

        pre_success = sum(1 for r in pre if r.get("task_result", {}).get("status") == "done") / len(pre)
        post_success = sum(1 for r in post if r.get("task_result", {}).get("status") == "done") / len(post)
        delta = round(post_success - pre_success, 2)

        p["effect_delta"] = delta
        p["effect_measured_at_cycle"] = current_cycle
        p["status"] = "validated" if delta > 0 else "rejected"

        # Aggiorna confidence in learned_rules.md
        new_confidence = min(1.0, 0.5 + delta)
        _update_rule_confidence(p["id"], new_confidence, delta)

    return exam_log


def _update_rule_confidence(rule_id: str, new_confidence: float, delta: float):
    """Aggiorna la riga di confidenza in learned_rules.md per una regola specifica."""
    if not LEARNED_RULES_FILE.exists():
        return
    content = LEARNED_RULES_FILE.read_text()
    # Trova il blocco della regola e aggiorna confidence
    pattern = rf"(## \[{re.escape(rule_id)}\][^\n]*\n.*?)\*\*Confidenza\*\*: [0-9.]+ \([^)]+\)"
    replacement = (
        rf"\1**Confidenza**: {new_confidence:.1f} "
        f"(delta={delta:+.2f}, misurato {datetime.now().strftime('%Y-%m-%d')})"
    )
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    if new_content != content:
        LEARNED_RULES_FILE.write_text(new_content)


# ─────────────────────────────────────────────
# 6. DASHBOARD / REPORT MARKDOWN
# ─────────────────────────────────────────────

def generate_exam_report(
    comparison: dict,
    patterns: list[dict],
    new_proposals: list[dict],
    exam_log: dict,
    cycle: int,
) -> str:
    """Genera self_exam_report.md leggibile."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"# Esame di Coscienza — Ciclo {cycle} ({now})",
        "",
        "## Score Trend",
    ]

    verdict = comparison.get("verdict", "unknown")
    verdict_emoji = {"improving": "📈", "worsening": "📉", "stable": "➡️"}.get(verdict, "❓")
    lines.append(f"**Andamento**: {verdict_emoji} {verdict.upper()}")

    curr = comparison.get("current_window", {})
    prev = comparison.get("previous_window", {})
    if curr and prev:
        lines.append(f"- Finestra attuale: success={curr.get('success_rate', '?')} | failure={curr.get('failure_rate', '?')}")
        lines.append(f"- Finestra precedente: success={prev.get('success_rate', '?')} | failure={prev.get('failure_rate', '?')}")
        delta = comparison.get("delta_success_rate", 0)
        lines.append(f"- Delta success rate: {delta:+.2f}")
    elif curr:
        lines.append(f"- Finestra attuale: success={curr.get('success_rate', '?')} | failure={curr.get('failure_rate', '?')}")
        lines.append("- (nessuna finestra precedente disponibile)")

    lines += ["", "## Pattern Rilevati"]
    if patterns:
        for p in patterns:
            sev_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(p["severity"], "⚪")
            lines.append(f"- {sev_emoji} **{p['name']}**: {p['description']}")
    else:
        lines.append("- ✅ Nessun pattern problematico rilevato.")

    lines += ["", "## Proposte Nuove (questo ciclo)"]
    if new_proposals:
        for p in new_proposals:
            status_emoji = "✅" if p["status"] == "applied" else "⏳"
            lines.append(f"- {status_emoji} `{p['id']}` [{p['risk']}] **{p['description']}**")
            lines.append(f"  - Azione: {p['action'][:120]}")
            lines.append(f"  - Impatto atteso: {p['expected_impact']}")
    else:
        lines.append("- (nessuna proposta nuova)")

    lines += ["", "## Storico Proposte Applicate"]
    applied = [p for p in exam_log.get("proposals", []) if p.get("status") in ("applied", "validated", "rejected")]
    if applied:
        for p in applied[-10:]:  # ultime 10
            eff = p.get("effect_delta")
            eff_str = f"→ delta={eff:+.2f}" if eff is not None else "→ effetto non ancora misurato"
            lines.append(f"- `{p['id']}` {p.get('status', '?')} {eff_str}: {p['description'][:80]}")
    else:
        lines.append("- (nessuna proposta applicata finora)")

    lines += ["", "## In Attesa di Review Umana"]
    pending = [p for p in exam_log.get("proposals", []) if p.get("status") == "proposed" and p.get("risk") in ("medium", "high")]
    if pending:
        for p in pending:
            lines.append(f"- ⚠️ `{p['id']}` [{p['risk']}] {p['description']}")
            lines.append(f"  - Azione suggerita: {p['action'][:120]}")
    else:
        lines.append("- (nessuna proposta in attesa)")

    lines += ["", f"---", f"*Generato automaticamente da self_exam.py — ciclo {cycle}*"]

    report_text = "\n".join(lines)
    EXAM_REPORT_FILE.write_text(report_text)
    return report_text


# ─────────────────────────────────────────────
# 6b. STRUCTURAL INSIGHTS (garantisce regole nel file)
# ─────────────────────────────────────────────

def _generate_structural_insights(reports: list[dict], cycle: int, exam_log: dict):
    """Analizza i cicli recenti e produce regole OPERATIVE (non generiche).
    Scrive regole che l'agente può eseguire nel prossimo ciclo.
    Max 3 regole per esecuzione."""

    if not LEARNED_RULES_FILE.exists():
        LEARNED_RULES_FILE.write_text(_learned_rules_header())

    content = LEARNED_RULES_FILE.read_text()
    rule_id_prefix = f"c{cycle}"

    # Non duplicare per lo stesso ciclo
    if rule_id_prefix in content:
        return

    recent = reports[-15:] if len(reports) >= 15 else reports
    if not recent:
        return

    rules_added = 0
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # ── RULE SOURCE 1: Repeated failures on same task type ──
    failed_tasks = [r for r in recent if r.get("task_result", {}).get("status") in ("failed", "partial")]
    task_words = Counter()
    for r in failed_tasks:
        task_name = r.get("task_result", {}).get("task", "").lower()
        for keyword in ["lighthouse", "lazy", "loadexp", "ipad", "font", "build", "deploy", "galileo", "css"]:
            if keyword in task_name:
                task_words[keyword] += 1

    for keyword, count in task_words.most_common(3):
        if count >= 2:
            rule_id = f"{rule_id_prefix}-repeat-{keyword}"
            if rule_id in content:
                continue
            entry = (
                f"\n## [{rule_id}] REGOLA OPERATIVA — {timestamp}\n"
                f"**Fonte**: {count} cicli failed/partial su task '{keyword}' negli ultimi {len(recent)} cicli\n"
                f"**Regola**: Task con '{keyword}' fallisce ripetutamente. "
                f"Prima di ritentare: (1) leggere i report dei cicli falliti, "
                f"(2) cambiare approccio rispetto ai tentativi precedenti, "
                f"(3) se fallisce 3+ volte, escalare a task P0 con analisi root-cause.\n"
                f"**Confidenza**: 0.8 (dato da {count} fallimenti ripetuti)\n"
            )
            content += entry
            rules_added += 1

    # ── RULE SOURCE 2: Score oscillations (keep then discard pattern) ──
    results_tsv = AUTOMA_ROOT / "results.tsv"
    if results_tsv.exists():
        try:
            lines = results_tsv.read_text().strip().split("\n")[1:]  # skip header
            verdicts = [l.split("\t")[3] if len(l.split("\t")) > 3 else "" for l in lines[-10:]]
            discard_count = verdicts.count("discard")
            if discard_count >= 3 and rules_added < 3:
                rule_id = f"{rule_id_prefix}-oscillation"
                if rule_id not in content:
                    content += (
                        f"\n## [{rule_id}] REGOLA OPERATIVA — {timestamp}\n"
                        f"**Fonte**: {discard_count} DISCARD negli ultimi {len(verdicts)} cicli\n"
                        f"**Regola**: Score oscilla troppo. Limitare modifiche a MAX 3 file per ciclo. "
                        f"Preferire modifiche piccole e verificabili. "
                        f"NON toccare CSS globali o vite.config.js senza screenshot comparativi.\n"
                        f"**Confidenza**: 0.85\n"
                    )
                    rules_added += 1
        except Exception:
            pass

    # ── RULE SOURCE 3: Checks that stay in warning ──
    check_warns = Counter()
    for r in recent:
        for c in r.get("checks", []):
            if c.get("status") == "warn":
                check_warns[c["name"]] += 1
    for check_name, count in check_warns.most_common(2):
        if count >= len(recent) * 0.5 and rules_added < 3:
            rule_id = f"{rule_id_prefix}-warn-{check_name}"
            if rule_id in content:
                continue
            content += (
                f"\n## [{rule_id}] REGOLA OPERATIVA — {timestamp}\n"
                f"**Fonte**: Check '{check_name}' in WARNING per {count}/{len(recent)} cicli\n"
                f"**Regola**: Il check '{check_name}' è cronicamente in warning. "
                f"Creare un task P1 dedicato per risolvere la root cause. "
                f"Non ignorare warning cronici — mascherano regressioni.\n"
                f"**Confidenza**: 0.75\n"
            )
            rules_added += 1

    # ── RULE SOURCE 4: Empty cycles (no files changed) ──
    empty_cycles = sum(1 for r in recent
                       if not r.get("task_result", {}).get("files_changed")
                       and r.get("task_result", {}).get("status") == "done")
    if empty_cycles >= 3 and rules_added < 3:
        rule_id = f"{rule_id_prefix}-empty"
        if rule_id not in content:
            content += (
                f"\n## [{rule_id}] REGOLA OPERATIVA — {timestamp}\n"
                f"**Fonte**: {empty_cycles}/{len(recent)} cicli 'done' senza file modificati\n"
                f"**Regola**: Troppi cicli terminano senza modifiche reali. "
                f"Se il task non richiede modifiche a file, cambiare mode a RESEARCH o AUDIT. "
                f"Un ciclo IMPROVE deve sempre produrre un diff verificabile.\n"
                f"**Confidenza**: 0.8\n"
            )
            rules_added += 1

    if rules_added > 0:
        LEARNED_RULES_FILE.write_text(content)
        print(f"   Regole operative aggiunte: {rules_added}")


# ─────────────────────────────────────────────
# 7. ENTRY POINT PRINCIPALE
# ─────────────────────────────────────────────

def run_self_exam(state: dict, cycle: int, n_reports: int = 20) -> dict:
    """
    Esegue l'esame di coscienza completo.
    Chiamare ogni 10 cicli dall'orchestratore.

    Returns:
        dict con: patterns_found, proposals_generated, proposals_applied,
                  verdict, exam_log_path
    """
    print("\n🪞 Self Exam — Analisi auto-miglioramento...")

    # Carica dati
    reports = load_recent_reports(n_reports)
    exam_log = load_exam_log()

    if not reports:
        print("   Nessun report disponibile per l'analisi.")
        return {"patterns_found": 0, "proposals_generated": 0, "proposals_applied": 0}

    # Analisi e pattern
    comparison = compare_windows(reports)
    patterns = detect_patterns(reports)
    print(f"   Pattern rilevati: {len(patterns)} | Trend: {comparison.get('verdict', '?')}")

    # Genera nuove proposte da pattern
    new_proposals = generate_proposals(patterns, exam_log)

    # Se non ci sono pattern bad, genera insight positivi e strutturali (garantisce regole nel file)
    _generate_structural_insights(reports, cycle, exam_log)

    print(f"   Nuove proposte: {len(new_proposals)}")

    # Applica low-risk automaticamente
    applied = apply_low_risk_proposals(new_proposals)
    print(f"   Proposte applicate automaticamente: {len(applied)}")

    # Aggiorna stato per proposte medium/high
    if new_proposals:
        update_pending_human_review(new_proposals, state)
        # Salva state aggiornato
        STATE_FILE.write_text(json.dumps({**state, "updated": datetime.now().isoformat()}, indent=2))

    # Aggiorna exam_log
    exam_log["proposals"] = exam_log.get("proposals", []) + new_proposals
    exam_log = update_proposal_confidence(exam_log, reports)
    exam_log.setdefault("runs", []).append({
        "cycle": cycle,
        "timestamp": datetime.now().isoformat(),
        "patterns_found": len(patterns),
        "proposals_generated": len(new_proposals),
        "proposals_applied": len(applied),
        "verdict": comparison.get("verdict"),
    })
    save_exam_log(exam_log)

    # Genera report markdown
    generate_exam_report(comparison, patterns, new_proposals, exam_log, cycle)
    print(f"   Report: {EXAM_REPORT_FILE}")
    print(f"   Regole apprese: {LEARNED_RULES_FILE}")

    # Update learnings.md with pattern-based insights
    try:
        learnings_path = AUTOMA_ROOT / "state" / "learnings.md"
        if learnings_path.exists():
            content = learnings_path.read_text()
            for p in patterns:
                desc = p.get("description", "")[:100]
                count = p.get("count", 1)
                if desc and desc not in content:
                    if count >= 2:
                        section = "## ACTIVE"
                    else:
                        section = "## PENDING"
                    content = content.replace(section, f"{section}\n- [{datetime.now().strftime('%Y-%m-%d')}] {desc} (x{count})", 1)
            # Cap learnings at 30 entries
            lines = content.splitlines()
            entry_count = sum(1 for l in lines if l.startswith("- ["))
            if entry_count > 30:
                content += "\n\n> ⚠️ 30+ entries — consolidation needed. Promuovi ACTIVE a CLAUDE.md.\n"
            learnings_path.write_text(content)
    except Exception:
        pass

    return {
        "patterns_found": len(patterns),
        "proposals_generated": len(new_proposals),
        "proposals_applied": len(applied),
        "verdict": comparison.get("verdict"),
        "exam_log_path": str(EXAM_LOG_FILE),
    }


def load_learned_rules() -> str:
    """Carica learned_rules.md per iniezione nel prompt dell'agente."""
    if not LEARNED_RULES_FILE.exists():
        return ""
    content = LEARNED_RULES_FILE.read_text().strip()
    # Ritorna solo se c'è contenuto oltre l'header
    if "##" not in content:
        return ""
    return content


def _learned_rules_header() -> str:
    return """# Regole Apprese — ELAB Automa Self Exam

Questo file viene generato automaticamente da `self_exam.py`.
Contiene regole di comportamento apprese dall'analisi dei cicli passati.
Viene iniettato nel prompt dell'agente ad ogni ciclo.

**Non modificare manualmente** — le regole vengono aggiornate automaticamente.

"""
