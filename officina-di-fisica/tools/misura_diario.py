"""Measure authenticated HTTP reads, then reconcile every study question with its actual diary entry."""
import json
import os
import platform
import sqlite3
import statistics
import subprocess
import sys
import tempfile
import time
from http.client import HTTPConnection
from pathlib import Path

from misura_percorso import BOOT, ROOT, request

sys.path.insert(0, str(ROOT))
from server.adapters.study_repository import SQLiteStudy
from server.store import catalog_seed

ROUTE = "/api/v1/courses/C6/error-diary"


def seed(archive, user, questions, first):
    """Store ordinary incorrect practice attempts in the disposable archive only."""
    db = sqlite3.connect(archive)
    try:
        with db:
            repo = SQLiteStudy(db)
            for index, question in enumerate(questions, first):
                rid = f"misura-{index}"
                stamp = 1700000000 + index * 60
                item = {"id": question["id"], "v": question["version"], "answer": "dato di prova",
                        "sent": True, "hints": 0, "aided": False, "changes": 0, "blank": False}
                repo.create_run(rid, user, question["course"], "practice", stamp, None, [item], rid, None)
                repo.expose(user, question["id"], question["version"])
                repo.add_attempt(rid, 0, user, question, False, False, stamp)
                repo.save_run(rid, [item], stamp)
    finally:
        db.close()


def measure(port, cookie):
    samples = []
    for index in range(21):
        connection = HTTPConnection("127.0.0.1", port, timeout=10)
        try:
            start = time.perf_counter()
            connection.request("GET", ROUTE + "?page=1&minutes=5", headers={"Cookie": cookie})
            response = connection.getresponse()
            body = response.read()
            elapsed = 1000 * (time.perf_counter() - start)
            assert response.status == 200, response.status
            diary = json.loads(body)
            assert (diary["total"], len(diary["items"])) == (200, 12)
            if index:
                samples.append(elapsed)
        finally:
            connection.close()
    p95 = sorted(samples)[18]
    assert p95 < 400 and len(body) <= 24 * 1024, (p95, len(body))
    return {"errori": 200, "perPagina": 12, "letture": len(samples), "bytes": len(body),
            "p50ms": round(statistics.median(samples), 2), "p95ms": round(p95, 2)}


def reconcile(port, cookie, questions, rows):
    expected = {q["id"]: q for q in questions}
    visited = set()
    largest = 0
    for page in range(1, 1 + (len(expected) + 11) // 12):
        data, _ = request(port, "GET", ROUTE + "?page=" + str(page), cookie)
        assert data["total"] == len(expected)
        for entry in data["items"]:
            item = entry["question"]
            key = item["id"]
            assert key not in visited
            visited.add(key)
            question = expected[key]
            assert (item["version"], item["prompt"]) == (question["version"], question["prompt"])
            assert item["response"] == "dato di prova"
            for step in ("prerequisite", "explanation", "representation"):
                dest = rows[entry[step]["id"]]
                assert not dest.get("exam") and dest["kind"] == entry[step]["kind"], (key, step)
            assert entry["retryAvailable"] and not entry["retryFresh"], key
            largest = max(largest, len(item["prompt"]))
    assert visited == set(expected)
    return {"quesitiConfrontati": len(visited), "pagine": page, "obiettivi": len({q["skill"] for q in questions}),
            "consegnaPiuLungaCaratteri": largest}


def run():
    rows = {r["id"]: r for r in catalog_seed()}
    questions = sorted((r for r in rows.values() if r["kind"] == "question" and not r.get("exam")),
                       key=lambda q: (q["order"], q["course"], q["id"]))
    assert len(questions) == 513
    with tempfile.TemporaryDirectory() as temp:
        env = {**os.environ, "ASTRA_DATA": temp, "ASTRA_EXTENSIONS": str(Path(temp)/"plugins"), "ASTRA_LOG": "0"}
        with subprocess.Popen([sys.executable, "-uc", BOOT], cwd=ROOT, env=env, stdout=subprocess.PIPE, text=True) as proc:
            try:
                port, count = map(int, proc.stdout.readline().split())
                _, cookie = request(port, "POST", "/api/demo")
                state, _ = request(port, "GET", "/api/state", cookie)
                archive = Path(temp) / "officina.sqlite3"
                seed(archive, state["user"]["id"], questions[:200], 0)
                result = measure(port, cookie)
                seed(archive, state["user"]["id"], questions[200:], 200)
                inventory = reconcile(port, cookie, questions, rows)
                return {"endpoint": ROUTE, "oggettiInArchivio": count, "sistema": platform.system(),
                        "architettura": platform.machine(), "carico": result, "inventario": inventory}
            finally:
                proc.terminate()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
