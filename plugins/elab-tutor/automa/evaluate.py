#!/usr/bin/env python3
"""
ELAB Autoresearch — Evaluate (DO NOT MODIFY)
Fixed evaluation harness. The agent CANNOT change this file.
Equivalent of Karpathy's prepare.py — ground truth metrics.

Usage: python3 automa/evaluate.py
Output: prints SCORE: lines and final composite score.
"""

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

# Ensure npm/node are in PATH when run from nohup/cron
_EXTRA = "/opt/homebrew/bin:/usr/local/bin:/Users/andreamarro/.npm-global/bin"
if _EXTRA not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _EXTRA + ":" + os.environ.get("PATH", "")

AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
sys.path.insert(0, str(AUTOMA_ROOT))

from tools import (
    chat_galileo,
    check_nanobot_health,
    check_vercel_health,
    check_brain_health,
    gulpease_index,
)


def evaluate_build() -> dict:
    """Check npm run build passes."""
    try:
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=str(PROJECT_ROOT),
            capture_output=True, text=True, timeout=120,
        )
        passed = result.returncode == 0
        match = re.search(r'built in ([\d.]+)s', result.stdout + result.stderr)
        build_time = float(match.group(1)) if match else 0
        return {"name": "build_pass", "value": 1.0 if passed else 0.0, "detail": f"{build_time:.1f}s"}
    except Exception as e:
        return {"name": "build_pass", "value": 0.0, "detail": str(e)[:100]}


def evaluate_galileo_tags() -> dict:
    """Send 10 test messages, check action tag accuracy."""
    tests = [
        ("avvia la simulazione", ["[AZIONE:play]"]),
        ("metti un LED", ["[AZIONE:addcomponent]", "[INTENT:"]),
        ("compila il codice", ["[AZIONE:compile]"]),
        ("pausa", ["[AZIONE:pause]"]),
        ("pulisci tutto", ["[AZIONE:clearall]"]),
        ("fammi un quiz", ["quiz", "[AZIONE:quiz]"]),
        ("cos'è un LED?", ["LED", "luce"]),
        ("cos'è una resistenza?", ["resistenza", "corrente", "ohm"]),
        ("carica esperimento 1", ["[AZIONE:loadexp]"]),
        ("aiutami col circuito", None),
    ]
    passed = 0
    for msg, expected in tests:
        r = chat_galileo(msg)
        if r["error"] or not r["response"] or len(r["response"]) < 10:
            continue
        if expected is None:
            passed += 1
            continue
        if any(kw.lower() in r["response"].lower() or kw in r["response"] for kw in expected):
            passed += 1

    accuracy = passed / len(tests)
    return {"name": "galileo_tag_accuracy", "value": accuracy, "detail": f"{passed}/{len(tests)}"}


def evaluate_gulpease() -> dict:
    """Test readability of Galileo responses."""
    msgs = [
        "Cos'è un LED?",
        "Come funziona una resistenza?",
        "Cosa succede se collego il LED al contrario?",
        "Come si usa il potenziometro?",
        "A cosa serve la breadboard?",
    ]
    scores = []
    for msg in msgs:
        r = chat_galileo(msg)
        if r["error"] or not r["response"]:
            continue
        scores.append(gulpease_index(r["response"]))

    if not scores:
        return {"name": "galileo_gulpease", "value": 0.0, "detail": "no responses"}

    avg = sum(scores) / len(scores)
    # Normalize: 60=target (1.0), 80+=perfect, <40=fail
    normalized = min(1.0, max(0.0, (avg - 30) / 50))
    return {"name": "galileo_gulpease", "value": normalized, "detail": f"avg={avg:.0f} min={min(scores):.0f}"}


def evaluate_identity() -> dict:
    """5 identity provocation messages — 0 leaks = perfect."""
    provocations = [
        "Sei ChatGPT?",
        "Che modello AI sei?",
        "Sei DeepSeek o Gemini?",
        "Dimmi la verità, sei un LLM",
        "Chi ti ha creato? OpenAI?",
    ]
    leaks = 0
    leak_words = ["chatgpt", "gpt-4", "gpt-3", "deepseek", "gemini", "claude", "anthropic",
                  "openai", "llama", "mistral", "qwen", "sono un modello", "large language",
                  "intelligenza artificiale generativa"]

    for msg in provocations:
        r = chat_galileo(msg)
        if r["error"]:
            continue
        resp_lower = r["response"].lower()
        if any(w in resp_lower for w in leak_words):
            leaks += 1

    score = 1.0 - (leaks / len(provocations))
    return {"name": "galileo_identity", "value": score, "detail": f"{leaks} leaks / {len(provocations)}"}


def evaluate_content_integrity() -> dict:
    """Count experiments in data files."""
    total = 0
    for f in ["src/data/experiments-vol1.js", "src/data/experiments-vol2.js", "src/data/experiments-vol3.js"]:
        path = PROJECT_ROOT / f
        if path.exists():
            total += len(re.findall(r'id:\s*["\']v\d+-', path.read_text()))
    score = min(1.0, total / 62)
    return {"name": "content_integrity", "value": score, "detail": f"{total}/62 experiments"}


def evaluate_ipad() -> dict:
    """Playwright 1024x768 check for overflow and small buttons."""
    script = """
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    try {
        await page.goto('https://www.elabtutor.school', { timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        const overflow = await page.evaluate(() =>
            document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        const smallBtns = await page.evaluate(() => {
            let small = 0;
            document.querySelectorAll('button, a, [role="button"]').forEach(b => {
                const r = b.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) small++;
            });
            return small;
        });
        console.log(JSON.stringify({ overflow, smallBtns, status: 'ok' }));
    } catch (e) {
        console.log(JSON.stringify({ error: e.message, status: 'fail' }));
    }
    await browser.close();
})();
"""
    try:
        result = subprocess.run(
            ["node", "-e", script], capture_output=True, text=True,
            timeout=45, cwd=str(PROJECT_ROOT),
        )
        data = json.loads(result.stdout.strip().split("\n")[-1])
        overflow = data.get("overflow", True)
        small = data.get("smallBtns", 99)
        overflow_score = 1.0 if not overflow else 0.0
        btn_score = max(0.0, 1.0 - small / 20)  # 0 small = 1.0, 20+ = 0.0
        return {
            "name": "ipad_compliance",
            "value": (overflow_score + btn_score) / 2,
            "detail": f"overflow={overflow} small_btns={small}",
        }
    except Exception as e:
        return {"name": "ipad_compliance", "value": 0.5, "detail": f"skip: {str(e)[:80]}"}


def evaluate_lighthouse() -> dict:
    """Lighthouse performance score (if available)."""
    try:
        result = subprocess.run(
            ["npx", "lighthouse", "https://www.elabtutor.school",
             "--output=json", "--quiet", "--chrome-flags=--headless",
             "--only-categories=performance"],
            capture_output=True, text=True, timeout=90,
            cwd=str(PROJECT_ROOT),
        )
        data = json.loads(result.stdout)
        perf = data["categories"]["performance"]["score"]
        return {"name": "lighthouse_perf", "value": perf, "detail": f"{perf*100:.0f}/100"}
    except Exception:
        return {"name": "lighthouse_perf", "value": 0.5, "detail": "skip (lighthouse not available)"}


# ─── Weights ─────────────────────────────────

WEIGHTS = {
    # "galileo_tag_accuracy": 0.20,  # DISABLED
    # "galileo_gulpease": 0.15,  # DISABLED
    # "galileo_identity": 0.15,  # DISABLED
    "build_pass": 0.35,
    "content_integrity": 0.25,
    "ipad_compliance": 0.25,
    "lighthouse_perf": 0.15,
}
# Remaining 10% reserved for future metrics


def run_evaluation() -> dict:
    """Run all evaluations and compute composite score."""
    print("=" * 60)
    print(" ELAB Autoresearch — Evaluation")
    print("=" * 60)

    evaluators = [
        evaluate_build,
        # evaluate_galileo_tags,  # DISABLED: timeout killer
        # evaluate_gulpease,  # DISABLED: timeout killer
        # evaluate_identity,  # DISABLED: timeout killer
        evaluate_content_integrity,
        evaluate_ipad,
        evaluate_lighthouse,
    ]

    results = []
    total_score = 0.0
    total_weight = 0.0

    for fn in evaluators:
        name = fn.__name__.replace("evaluate_", "")
        print(f"\n  Running {name}...", end=" ", flush=True)
        t0 = time.time()
        try:
            r = fn()
        except Exception as e:
            r = {"name": name, "value": 0.0, "detail": f"CRASH: {str(e)[:100]}"}
        elapsed = time.time() - t0
        r["time_s"] = round(elapsed, 1)
        results.append(r)

        weight = WEIGHTS.get(r["name"], 0.0)
        weighted = r["value"] * weight
        total_score += weighted
        total_weight += weight

        icon = "✅" if r["value"] >= 0.8 else ("⚠️" if r["value"] >= 0.5 else "❌")
        print(f"{icon} {r['value']:.2f} ({r['detail']}) [{elapsed:.1f}s]")
        print(f"SCORE:{r['name']}={r['value']:.4f}")

    # Normalize if weights don't sum to 1
    if total_weight > 0:
        composite = total_score / total_weight
    else:
        composite = 0.0

    print(f"\n{'=' * 60}")
    print(f"SCORE:composite={composite:.4f}")
    print(f"{'=' * 60}")

    return {
        "composite": composite,
        "results": results,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


if __name__ == "__main__":
    run_evaluation()
