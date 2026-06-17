#!/usr/bin/env python3
"""
ELAB Automa — Synthesizer Agent
Reads all nightly agent reports and produces a unified nightly-report.json.
Output: automa/reports/nightly/nightly-report-YYYY-MM-DD.json
"""

import json
from datetime import datetime
from pathlib import Path

REPORT_DIR = Path(__file__).parent.parent / "reports" / "nightly"
SHARED_DIR = Path(__file__).parent.parent / "shared"
SHARED_DIR.mkdir(parents=True, exist_ok=True)


def load_latest(prefix: str) -> dict | None:
    """Load the most recent report matching the prefix."""
    files = sorted(REPORT_DIR.glob(f"{prefix}-*.json"), reverse=True)
    if not files:
        return None
    with open(files[0], "r", encoding="utf-8") as f:
        return json.load(f)


def extract_bugs(judge_report: dict) -> list[dict]:
    """Extract potential bugs from judge scores (any dimension < 3)."""
    bugs = []
    for item in judge_report.get("details", []):
        scores = item.get("scores", {})
        for dim, score in scores.items():
            if dim == "note":
                continue
            if isinstance(score, (int, float)) and score < 3:
                bugs.append({
                    "source": "galileo-judge",
                    "question": item.get("question", "")[:100],
                    "dimension": dim,
                    "score": score,
                    "note": scores.get("note", ""),
                    "severity": "P1" if score == 1 else "P2",
                    "auto_fixable": dim in ("action_tags", "linguaggio"),
                })
    return bugs


def synthesize() -> dict:
    """Read all reports and produce unified nightly report."""
    date_str = datetime.now().strftime("%Y-%m-%d")

    # Load reports
    test_report = load_latest("galileo-test")
    judge_report = load_latest("galileo-judge")
    sim_report = load_latest("pedagogy-sim")

    # Extract metrics
    galileo_avg = 0
    action_compliance = 0
    completion_rate = 0

    if judge_report and "scorecard" in judge_report:
        galileo_avg = judge_report["scorecard"].get("overall_avg", 0)

    if test_report and "summary" in test_report:
        action_compliance = test_report["summary"].get("tag_compliance_pct", 0)

    if sim_report and "summary" in sim_report:
        completion_rate = sim_report["summary"].get("completion_rate", 0)

    # Extract bugs
    bugs = extract_bugs(judge_report) if judge_report else []
    auto_fixable = [b for b in bugs if b.get("auto_fixable")]
    needs_human = [b for b in bugs if not b.get("auto_fixable")]

    # Build report
    report = {
        "date": date_str,
        "timestamp": datetime.now().isoformat(),
        "scores": {
            "galileo_avg": galileo_avg,
            "action_compliance": action_compliance,
            "completion_rate": completion_rate,
        },
        "sources": {
            "galileo_test": bool(test_report),
            "galileo_judge": bool(judge_report),
            "pedagogy_sim": bool(sim_report),
        },
        "test_summary": test_report.get("summary", {}) if test_report else {},
        "judge_scorecard": judge_report.get("scorecard", {}) if judge_report else {},
        "sim_summary": sim_report.get("summary", {}) if sim_report else {},
        "bugs_found": bugs,
        "auto_fixable": auto_fixable,
        "needs_human_decision": needs_human,
        "trend": {
            "galileo_avg_delta": 0,  # Will compare with yesterday once we have history
            "vs_yesterday": "baseline",
        },
    }

    # Try to compute trend vs yesterday
    yesterday_reports = sorted(REPORT_DIR.glob("nightly-report-*.json"), reverse=True)
    if yesterday_reports:
        try:
            with open(yesterday_reports[0], "r", encoding="utf-8") as f:
                yesterday = json.load(f)
            old_avg = yesterday.get("scores", {}).get("galileo_avg", 0)
            if old_avg > 0:
                delta = round(galileo_avg - old_avg, 2)
                report["trend"]["galileo_avg_delta"] = delta
                report["trend"]["vs_yesterday"] = "improved" if delta > 0 else "declined" if delta < 0 else "stable"
        except Exception:
            pass

    return report


def format_whatsapp_message(report: dict) -> str:
    """Format report as WhatsApp-friendly text."""
    scores = report["scores"]
    bugs = report["bugs_found"]
    auto = report["auto_fixable"]
    human = report["needs_human_decision"]

    trend_emoji = "📈" if report["trend"]["vs_yesterday"] == "improved" else \
                  "📉" if report["trend"]["vs_yesterday"] == "declined" else "➡️"

    msg = f"""ELAB Automa — Report {report['date']}

{trend_emoji} Galileo score: {scores['galileo_avg']}/5 (delta: {report['trend']['galileo_avg_delta']:+.2f})
🏷 Action compliance: {scores['action_compliance']}%
✅ Completion rate: {scores['completion_rate']}%

🐛 Bug trovati: {len(bugs)} ({len(auto)} auto-fixabili, {len(human)} serve decisione)"""

    if human:
        msg += "\n\n⚠️ Serve decisione:"
        for b in human[:3]:
            msg += f"\n  - {b['dimension']} score {b['score']}: {b['question'][:50]}"

    msg += """

Azioni:
1️⃣ Approva fix e deploya
2️⃣ Rivedi prima del deploy
3️⃣ Ignora per oggi"""

    return msg


def main():
    print("[synthesizer] Reading nightly reports...")
    report = synthesize()

    # Save report
    date_str = datetime.now().strftime("%Y-%m-%d")
    out_path = REPORT_DIR / f"nightly-report-{date_str}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Save to shared for Docker/n8n access
    shared_path = SHARED_DIR / "latest-report.json"
    with open(shared_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Also save WhatsApp message
    wa_msg = format_whatsapp_message(report)
    wa_path = SHARED_DIR / "latest-whatsapp.txt"
    with open(wa_path, "w", encoding="utf-8") as f:
        f.write(wa_msg)

    print(f"\n[synthesizer] === NIGHTLY SUMMARY ===")
    print(f"  Galileo avg: {report['scores']['galileo_avg']}/5")
    print(f"  Action compliance: {report['scores']['action_compliance']}%")
    print(f"  Completion rate: {report['scores']['completion_rate']}%")
    print(f"  Bugs: {len(report['bugs_found'])} ({len(report['auto_fixable'])} auto-fixable)")
    print(f"  Trend: {report['trend']['vs_yesterday']}")
    print(f"\n[synthesizer] Report: {out_path}")
    print(f"[synthesizer] WhatsApp: {wa_path}")


if __name__ == "__main__":
    main()
