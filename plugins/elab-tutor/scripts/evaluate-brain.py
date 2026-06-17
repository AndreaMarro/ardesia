#!/usr/bin/env python3
"""
Galileo Brain — Evaluation Runner
Tests a fine-tuned Brain model against the evaluation suite.

Usage:
    # With Ollama (local)
    python scripts/evaluate-brain.py --backend ollama --model galileo-brain

    # With a JSONL file of model outputs
    python scripts/evaluate-brain.py --predictions datasets/brain-predictions.jsonl

    # Dry run (just show eval suite stats)
    python scripts/evaluate-brain.py --dry-run

(c) Andrea Marro — 06/03/2026
"""

import json
import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

EVAL_PATH = Path(__file__).parent.parent / "datasets" / "evaluation-suite.jsonl"

BRAIN_SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}"""


def load_eval_suite() -> List[Dict]:
    """Load evaluation test cases."""
    tests = []
    with open(EVAL_PATH, encoding="utf-8") as f:
        for line in f:
            tests.append(json.loads(line.strip()))
    return tests


def make_user_message(input_text: str, context: Optional[str] = None) -> str:
    """Create user message with default context."""
    if context is None:
        context = "tab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1"
    return f"[CONTESTO]\n{context}\n\n[MESSAGGIO]\n{input_text}"


def check_intent(predicted: Dict, expected: Dict) -> bool:
    """Check if intent matches."""
    return predicted.get("intent") == expected.get("expected_intent")


def check_actions(predicted: Dict, expected: Dict) -> bool:
    """Check if actions match (supports wildcards)."""
    if "expected_actions" not in expected:
        return True  # No action check needed

    pred_actions = predicted.get("actions", [])
    exp_actions = expected["expected_actions"]

    if not exp_actions:
        return len(pred_actions) == 0

    for exp in exp_actions:
        if exp.endswith("*]"):
            # Wildcard: just check prefix
            prefix = exp[:-2]  # Remove *]
            if not any(a.startswith(prefix) for a in pred_actions):
                return False
        else:
            if exp not in pred_actions:
                return False
    return True


def check_needs_llm(predicted: Dict, expected: Dict) -> bool:
    """Check if needs_llm matches."""
    if "expected_needs_llm" not in expected:
        return True
    return predicted.get("needs_llm") == expected["expected_needs_llm"]


def evaluate_prediction(predicted: Dict, expected: Dict) -> Dict:
    """Evaluate a single prediction against expected values."""
    result = {
        "test_id": expected["test_id"],
        "category": expected["category"],
        "subcategory": expected.get("subcategory", ""),
        "input": expected["input"],
        "intent_correct": check_intent(predicted, expected),
        "actions_correct": check_actions(predicted, expected),
        "needs_llm_correct": check_needs_llm(predicted, expected),
        "json_valid": True,
    }
    result["pass"] = all([
        result["intent_correct"],
        result["actions_correct"],
        result["needs_llm_correct"],
    ])
    return result


def run_ollama(tests: List[Dict], model: str) -> List[Dict]:
    """Run evaluation against Ollama model."""
    try:
        import requests
    except ImportError:
        print("ERROR: requests library required. pip install requests")
        sys.exit(1)

    predictions = []
    url = "http://localhost:11434/api/chat"

    for i, test in enumerate(tests):
        user_msg = make_user_message(test["input"])
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": BRAIN_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 512},
        }

        try:
            resp = requests.post(url, json=payload, timeout=30)
            resp.raise_for_status()
            content = resp.json()["message"]["content"]
            # Parse JSON from response
            try:
                predicted = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from text
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    predicted = json.loads(match.group())
                else:
                    predicted = {"intent": "unknown", "actions": [], "needs_llm": False}
            predictions.append(predicted)
            status = "PASS" if evaluate_prediction(predicted, test)["pass"] else "FAIL"
            print(f"  [{i+1:3d}/{len(tests)}] {test['test_id']} {status}: {test['input'][:50]}")
        except Exception as e:
            print(f"  [{i+1:3d}/{len(tests)}] {test['test_id']} ERROR: {e}")
            predictions.append({"intent": "error", "actions": [], "needs_llm": False})

    return predictions


def print_results(results: List[Dict]):
    """Print evaluation results."""
    total = len(results)
    passed = sum(1 for r in results if r["pass"])
    failed = total - passed

    print("\n" + "=" * 70)
    print("EVALUATION RESULTS — Galileo Brain")
    print("=" * 70)
    print(f"\nTotal: {total} | PASS: {passed} ({passed/total*100:.1f}%) | FAIL: {failed}")

    # By category
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "pass": 0}
        categories[cat]["total"] += 1
        if r["pass"]:
            categories[cat]["pass"] += 1

    print(f"\nBy category:")
    for cat, stats in sorted(categories.items()):
        pct = stats["pass"] / stats["total"] * 100
        bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
        print(f"  {cat:15s} {stats['pass']:3d}/{stats['total']:3d} ({pct:5.1f}%) {bar}")

    # By metric
    intent_correct = sum(1 for r in results if r["intent_correct"])
    actions_correct = sum(1 for r in results if r["actions_correct"])
    needs_llm_correct = sum(1 for r in results if r["needs_llm_correct"])

    print(f"\nBy metric:")
    print(f"  Intent accuracy:    {intent_correct}/{total} ({intent_correct/total*100:.1f}%)")
    print(f"  Action accuracy:    {actions_correct}/{total} ({actions_correct/total*100:.1f}%)")
    print(f"  needs_llm accuracy: {needs_llm_correct}/{total} ({needs_llm_correct/total*100:.1f}%)")

    # Failed tests
    if failed > 0:
        print(f"\nFailed tests ({failed}):")
        for r in results:
            if not r["pass"]:
                reasons = []
                if not r["intent_correct"]:
                    reasons.append("intent")
                if not r["actions_correct"]:
                    reasons.append("actions")
                if not r["needs_llm_correct"]:
                    reasons.append("needs_llm")
                print(f"  {r['test_id']} [{r['category']}/{r['subcategory']}]: {', '.join(reasons)}")
                print(f"    Input: {r['input'][:60]}")


def dry_run():
    """Show evaluation suite statistics."""
    tests = load_eval_suite()
    print(f"\nEvaluation Suite: {len(tests)} test cases")

    categories = {}
    for t in tests:
        cat = t["category"]
        sub = t.get("subcategory", "")
        if cat not in categories:
            categories[cat] = {"total": 0, "subs": {}}
        categories[cat]["total"] += 1
        if sub:
            categories[cat]["subs"][sub] = categories[cat]["subs"].get(sub, 0) + 1

    print(f"\nBy category:")
    for cat, stats in sorted(categories.items()):
        print(f"  {cat:15s} {stats['total']:3d} tests")
        for sub, count in sorted(stats["subs"].items()):
            print(f"    {sub:20s} {count:3d}")

    # Count expected intents
    intents = {}
    for t in tests:
        intent = t.get("expected_intent", "?")
        intents[intent] = intents.get(intent, 0) + 1
    print(f"\nExpected intents:")
    for intent, count in sorted(intents.items(), key=lambda x: -x[1]):
        print(f"  {intent:15s} {count:3d}")

    # Count needs_llm distribution
    needs_llm_true = sum(1 for t in tests if t.get("expected_needs_llm") is True)
    needs_llm_false = sum(1 for t in tests if t.get("expected_needs_llm") is False)
    print(f"\nExpected needs_llm: true={needs_llm_true}, false={needs_llm_false}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Galileo Brain model")
    parser.add_argument("--backend", choices=["ollama"], default="ollama")
    parser.add_argument("--model", default="galileo-brain")
    parser.add_argument("--predictions", help="Path to predictions JSONL")
    parser.add_argument("--dry-run", action="store_true", help="Show eval suite stats")
    args = parser.parse_args()

    if args.dry_run:
        dry_run()
        sys.exit(0)

    tests = load_eval_suite()
    print(f"Loaded {len(tests)} test cases")

    if args.predictions:
        # Load predictions from file
        predictions = []
        with open(args.predictions) as f:
            for line in f:
                predictions.append(json.loads(line.strip()))
        assert len(predictions) == len(tests), f"Predictions ({len(predictions)}) != tests ({len(tests)})"
    elif args.backend == "ollama":
        print(f"Running against Ollama model: {args.model}")
        predictions = run_ollama(tests, args.model)
    else:
        print("ERROR: Specify --backend or --predictions")
        sys.exit(1)

    # Evaluate
    results = []
    for pred, test in zip(predictions, tests):
        results.append(evaluate_prediction(pred, test))

    print_results(results)
