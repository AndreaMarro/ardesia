"""Compare the actual search response with the C6 index on one warm, read-only installation."""
import json
import os
import platform
import statistics
import subprocess
import sys
import tempfile
import time
from http.client import HTTPConnection
from pathlib import Path

from misura_percorso import BOOT, ROOT

ROUTES = ("/", "/api/state", "/api/course/C1", "/api/course/C6", "/api/simulazioni", "/api/v1/catalog/search?q=lente")


def measure(port, route):
    durations = []
    for index in range(21):  # Discard the first connection used to warm this route.
        conn = HTTPConnection("127.0.0.1", port, timeout=10)
        try:
            start = time.perf_counter()
            conn.request("GET", route)
            response = conn.getresponse()
            data = response.read()
            elapsed = 1000 * (time.perf_counter() - start)
            assert response.status == 200, route
            if index:
                durations.append(elapsed)
        finally:
            conn.close()
    if route == ROUTES[-1]:
        assert 0 < len(json.loads(data)["items"]) <= 12 and len(data) <= 12 * 1024
    return {"path": route, "n": len(durations), "bytes": len(data),
            "p50ms": round(statistics.median(durations), 2), "p95ms": round(sorted(durations)[18], 2)}


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as temp:
        env = {**os.environ, "ASTRA_DATA": temp, "ASTRA_EXTENSIONS": str(Path(temp) / "plugins"), "ASTRA_LOG":"0"}
        with subprocess.Popen([sys.executable, "-uc", BOOT], cwd=ROOT, env=env, stdout=subprocess.PIPE, text=True) as proc:
            try:
                port, records = map(int, proc.stdout.readline().split())
                readings = [measure(port, route) for route in ROUTES]
                budget = 3 * readings[3]["p95ms"] + 30
                print(json.dumps({"system":platform.system(), "machine":platform.machine(), "records":records,
                                  "misure":readings, "searchBudgetMs":round(budget, 2)}, indent=2))
                assert readings[-1]["p95ms"] <= budget, "Budget p95 superato"
            finally:
                proc.terminate()
