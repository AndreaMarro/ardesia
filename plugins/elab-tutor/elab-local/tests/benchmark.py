"""Benchmark: compare configurations on same hardware.

Config A: Brain OFF + qwen2.5:1.5b (fast mode, school PCs)
Config B: Brain ON  + qwen2.5:7b   (full mode, powerful hardware)

Run: python3 tests/benchmark.py
"""
import sys
import os
import time
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# We test via TestClient to avoid needing a running server
from fastapi.testclient import TestClient

# Test messages covering all categories
TEST_MESSAGES = [
    # Actions (should be handled by regex, no LLM needed)
    ("avvia la simulazione", "action", "[AZIONE:play]"),
    ("pulisci tutto il circuito", "action", "[AZIONE:clearall]"),
    ("compila il codice", "action", "[AZIONE:compile]"),
    ("fammi un quiz", "action", "[AZIONE:quiz]"),
    ("annulla", "action", "[AZIONE:undo]"),
    # Theory (needs LLM)
    ("cos'e' un LED?", "theory", None),
    ("come funziona un resistore?", "theory", None),
    # Circuit (needs LLM)
    ("come collego un LED alla breadboard?", "circuit", None),
    # Code (needs LLM — this is where 7b shines)
    ("scrivi il codice per il blink del LED", "code", None),
]


def run_config(config_name, brain_model, llm_model):
    """Run benchmark for a specific configuration."""
    # Set env vars BEFORE importing server
    os.environ["ELAB_BRAIN_MODEL"] = brain_model
    os.environ["ELAB_LLM_MODEL"] = llm_model

    # Force reload config
    import importlib
    import config as cfg
    importlib.reload(cfg)

    # Reload server with new config
    import server
    importlib.reload(server)

    client = TestClient(server.app)

    print(f"\n{'='*60}")
    print(f"CONFIG: {config_name}")
    print(f"  Brain: {brain_model or 'DISABLED'}")
    print(f"  LLM:   {llm_model}")
    print(f"{'='*60}")

    results = []
    total_start = time.monotonic()

    for msg, category, expected_tag in TEST_MESSAGES:
        start = time.monotonic()
        resp = client.post("/chat", json={"message": msg})
        elapsed = (time.monotonic() - start) * 1000

        data = resp.json()
        response_text = data.get("response", "")
        source = data.get("source", "?")

        # Check if expected tag is present
        tag_ok = True
        if expected_tag:
            tag_ok = expected_tag.upper() in response_text.upper()

        status = "PASS" if (resp.status_code == 200 and (not expected_tag or tag_ok)) else "FAIL"
        quality = "good" if len(response_text) > 30 else "short"

        results.append({
            "msg": msg,
            "category": category,
            "ms": round(elapsed),
            "source": source,
            "tag_ok": tag_ok,
            "status": status,
            "chars": len(response_text),
        })

        tag_mark = f" {'OK' if tag_ok else 'MISS'}" if expected_tag else ""
        print(f"  [{status}] {elapsed:>7.0f}ms | {category:>7} | {source:>5} | {len(response_text):>4}ch{tag_mark} | {msg[:40]}")

    total_elapsed = (time.monotonic() - total_start) * 1000

    # Summary
    action_times = [r["ms"] for r in results if r["category"] == "action"]
    llm_times = [r["ms"] for r in results if r["category"] != "action"]
    pass_count = sum(1 for r in results if r["status"] == "PASS")

    print(f"\n  SUMMARY:")
    print(f"  Total: {total_elapsed:.0f}ms | {pass_count}/{len(results)} PASS")
    if action_times:
        print(f"  Actions avg: {sum(action_times)/len(action_times):.0f}ms (min={min(action_times)}, max={max(action_times)})")
    if llm_times:
        print(f"  LLM avg:     {sum(llm_times)/len(llm_times):.0f}ms (min={min(llm_times)}, max={max(llm_times)})")

    return results, total_elapsed


if __name__ == "__main__":
    print("ELAB Local Server — Configuration Benchmark")
    print(f"Hardware: {os.uname().machine} / {os.uname().sysname}")

    # Config A: Fast mode (school PCs)
    results_a, time_a = run_config(
        "A: FAST (no Brain, 1.5b)",
        brain_model="",
        llm_model="qwen2.5:1.5b",
    )

    # Config B: Full mode (powerful hardware)
    results_b, time_b = run_config(
        "B: FULL (Brain + 7b)",
        brain_model="galileo-brain",
        llm_model="qwen2.5:7b",
    )

    # Comparison
    print(f"\n{'='*60}")
    print(f"COMPARISON")
    print(f"{'='*60}")
    print(f"  Config A (fast): {time_a:.0f}ms total")
    print(f"  Config B (full): {time_b:.0f}ms total")
    print(f"  Speedup: {time_b/time_a:.1f}x faster with Config A")

    for a, b in zip(results_a, results_b):
        speedup = b["ms"] / max(a["ms"], 1)
        print(f"  {a['msg'][:35]:35} | A={a['ms']:>6}ms | B={b['ms']:>6}ms | {speedup:.1f}x")
