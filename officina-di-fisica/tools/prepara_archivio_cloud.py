"""Provision the dedicated hosted archive from the bundled edition without replacing user data."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server.adapters import hosted
from server import store


def fingerprint():
    paths = sorted(store.BASE.glob("*.json")) + sorted((ROOT / "migrations").glob("*"))
    return hashlib.sha256(b"".join(path.name.encode() + path.read_bytes() for path in paths)).hexdigest()


def apply_script(script):
    # Hrana sequence executes each statement on one primary connection and reports any failure.
    url, token = hosted.credentials()
    request = urllib.request.Request("https://" + url.split("://", 1)[1] + "/v2/pipeline",
        data=json.dumps({"requests": [{"type": "sequence", "sql": script}, {"type": "close"}]}).encode(),
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            results = json.load(response)["results"]
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Risposta HTTP {exc.code}: {exc.read(240).decode(errors='replace')}") from None
    if any(result["type"] != "ok" for result in results):
        raise RuntimeError("Migrazione interrotta: " + str(results[0].get("error", {}).get("message", ""))[:180])


def provision():
    signature = fingerprint()
    with hosted.Primary() as db:
        existing = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='heads'").fetchone()
        if not existing:
            # The dump comes only from a new local archive built from the same committed sources.
            with tempfile.TemporaryDirectory() as work:
                env = dict(os.environ, ASTRA_HOSTED="0", ASTRA_DATA=work)
                subprocess.run([sys.executable, "-c", "from server.store import initialize;initialize()"],
                               cwd=ROOT, env=env, check=True)
                with sqlite3.connect(Path(work) / "officina.sqlite3") as seed:
                    script = list(seed.iterdump())
                    schema = seed.execute("PRAGMA user_version").fetchone()[0]
            script.insert(-1, f"INSERT INTO settings VALUES('hosted_schema','{schema}');")
            apply_script("\n".join(script))
        db.execute(hosted.FILES_SCHEMA)
        saved = db.execute("SELECT value FROM settings WHERE key='hosted_seed_sha'").fetchone()
    if existing and (not saved or saved[0] != signature):
        # Canonical migrations preserve changed/draft editions and editions referenced by attempts.
        store.initialize()
    with hosted.Primary() as db:
        db.execute("BEGIN IMMEDIATE")
        db.execute("INSERT OR REPLACE INTO settings VALUES('hosted_seed_sha',?)", (signature,))
        count = db.execute("SELECT count(*) FROM heads WHERE live IS NOT NULL").fetchone()[0]
        version = db.execute("PRAGMA user_version").fetchone()[0]
    return {"live": count, "schema": version, "seed": signature}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--provision", action="store_true", required=True)
    parser.parse_args()
    os.environ["ASTRA_HOSTED"] = "1"
    print(json.dumps(provision()))
