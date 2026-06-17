"""Quick test: 10 messaggi al nanobot, misura qualita'."""
import json
import sys
import time
import urllib.request

NANOBOT_URL = sys.argv[1] if len(sys.argv) > 1 else "https://elab-galileo.onrender.com"
REPORT_PATH = sys.argv[2] if len(sys.argv) > 2 else "report.json"

TESTS = [
    # (messaggio, tag atteso o None, categoria)
    ("avvia la simulazione", "[AZIONE:play]", "action"),
    ("ferma la simulazione", "[AZIONE:pause]", "action"),
    ("pulisci tutto il circuito", "[AZIONE:clearall]", "action"),
    ("compila il codice", "[AZIONE:compile]", "action"),
    ("cos'e' un LED?", None, "theory"),
    ("come collego un LED alla breadboard?", None, "circuit"),
    ("metti un LED rosso", "[INTENT:", "placement"),
    ("fammi un quiz", "[AZIONE:quiz]", "action"),
    ("il mio circuito non funziona, cosa sbaglio?", None, "debug"),
    ("scrivi il codice per il blink del LED", None, "code"),
]

results = []
total_score = 0
total_tests = 0

for msg, expected_tag, category in TESTS:
    start = time.time()
    try:
        data = json.dumps({"message": msg, "sessionId": "automa-test"}).encode()
        req = urllib.request.Request(
            f"{NANOBOT_URL}/chat",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode())
    except Exception as e:
        body = {"response": f"ERROR: {e}"}

    elapsed_ms = (time.time() - start) * 1000
    response = body.get("response", "")

    # Score
    score = 0
    tag_ok = True

    # Has response?
    if len(response) > 10:
        score += 1

    # Expected tag?
    if expected_tag:
        if expected_tag.upper() in response.upper():
            score += 2
            tag_ok = True
        else:
            tag_ok = False
    else:
        # Theory/debug: longer = better (rough proxy)
        if len(response) > 100:
            score += 2
        elif len(response) > 30:
            score += 1

    # No identity leak?
    if "specialista" not in response.lower() and "orchestratore" not in response.lower():
        score += 1

    # Kid-friendly language? (rough: no jargon)
    if "implementazione" not in response.lower() and "framework" not in response.lower():
        score += 1

    max_score = 5
    total_score += score
    total_tests += 1

    status = "PASS" if score >= 3 else "WARN" if score >= 2 else "FAIL"
    tag_str = f" tag={'OK' if tag_ok else 'MISS'}" if expected_tag else ""
    print(f"  [{status}] {score}/{max_score} | {elapsed_ms:>6.0f}ms | {category:>9}{tag_str} | {msg[:40]}")

    results.append({
        "message": msg,
        "category": category,
        "score": score,
        "max_score": max_score,
        "status": status,
        "tag_ok": tag_ok if expected_tag else None,
        "response_length": len(response),
        "latency_ms": round(elapsed_ms),
    })

avg = total_score / total_tests if total_tests else 0
pass_count = sum(1 for r in results if r["status"] == "PASS")

print(f"\n  TOTALE: {pass_count}/{total_tests} PASS | Score medio: {avg:.1f}/5")

report = {
    "date": time.strftime("%Y-%m-%dT%H:%M:%S"),
    "nanobot_url": NANOBOT_URL,
    "total_tests": total_tests,
    "pass_count": pass_count,
    "avg_score": round(avg, 2),
    "results": results,
}

with open(REPORT_PATH, "w") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
