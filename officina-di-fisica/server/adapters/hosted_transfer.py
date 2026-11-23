"""Private, session-bound transport for editorial JSON larger than a function request."""
import base64
import binascii
import hashlib
import json
from pathlib import Path
import re
import secrets
import tempfile
import time

from ..domain.errors import require

PART = 256 * 1024
SCHEMA = """CREATE TABLE IF NOT EXISTS hosted_transfers (
    id TEXT PRIMARY KEY, scope TEXT NOT NULL, action TEXT NOT NULL, size INTEGER NOT NULL,
    sha TEXT NOT NULL, expires INTEGER NOT NULL, result TEXT
)"""


def discard(db, scope):
    db.execute("DELETE FROM hosted_file_parts WHERE name IN (SELECT 'transfer/'||id FROM hosted_transfers WHERE scope=?)", (scope,))
    db.execute("DELETE FROM hosted_transfers WHERE scope=?", (scope,))


def upload(db, scope, data, apply):
    now = int(time.time())
    phase = data.get("phase")
    if phase == "open":
        action, size, sha = (data.get(key) for key in ("action", "size", "sha"))
        require(action in ("import", "upload") and type(size) is int and 0 < size <= 40_000_000
                and isinstance(sha, str) and re.fullmatch(r"[a-f0-9]{64}", sha), "Lotto di trasferimento non valido.")
        db.execute("DELETE FROM hosted_file_parts WHERE name IN (SELECT 'transfer/'||id FROM hosted_transfers WHERE expires<?)", (now,))
        db.execute("DELETE FROM hosted_transfers WHERE expires<?", (now,))
        key = secrets.token_hex(16)
        db.execute("INSERT INTO hosted_transfers VALUES(?,?,?,?,?,?,NULL)", (key, scope, action, size, sha, now + 3600))
        return {"id": key, "partSize": PART}
    key = data.get("id")
    require(isinstance(key, str) and re.fullmatch(r"[a-f0-9]{32}", key), "Trasferimento non valido.")
    row = db.execute("SELECT * FROM hosted_transfers WHERE id=? AND scope=? AND expires>=?", (key, scope, now)).fetchone()
    require(row, "Trasferimento scaduto o non disponibile.", 404)
    name = "transfer/" + key
    if phase == "part":
        i = data.get("part")
        size = row["size"]
        require(row["result"] is None and type(i) is int and 0 <= i < (size + PART - 1) // PART, "Parte inattesa.")
        try:
            raw = base64.b64decode(data["data"], validate=True)
        except (TypeError, ValueError, KeyError, binascii.Error):
            raw = b""
        require(len(raw) == min(PART, size - i * PART), "Lunghezza della parte errata.")
        old = db.execute("SELECT data FROM hosted_file_parts WHERE name=? AND part=?", (name, i)).fetchone()
        if old:
            require(old[0] == raw, "Parte già ricevuta con dati diversi.", 409)
        else:
            db.execute("INSERT INTO hosted_file_parts VALUES(?,?,?)", (name, i, raw))
        return {"part": i}
    require(phase == "complete", "Azione di trasferimento sconosciuta.")
    if row["result"] is not None:
        return json.loads(row["result"])
    raw = b"".join(r[0] for r in db.execute("SELECT data FROM hosted_file_parts WHERE name=? ORDER BY part", (name,)))
    require(len(raw) == row["size"] and hashlib.sha256(raw).hexdigest() == row["sha"], "Trasferimento incompleto.", 409)
    payload = json.loads(raw)
    require(isinstance(payload, dict), "Il lotto deve contenere un oggetto.")
    result = apply(row["action"], payload)
    db.execute("UPDATE hosted_transfers SET result=? WHERE id=?", (json.dumps(result), key))
    db.execute("DELETE FROM hosted_file_parts WHERE name=?", (name,))
    return result


def export_part(db, scope, params, directory, serialize):
    require(set(params) <= {"part", "sha"} and re.fullmatch(r"[0-9]{1,8}", params.get("part", "0")), "Parte non valida.")
    index, sha = int(params.get("part", "0")), params.get("sha")
    require((index == 0 and sha is None) or (isinstance(sha, str) and re.fullmatch(r"[0-9a-f]{64}", sha)),
            "Impronta dell'esportazione non valida.")
    directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    target = directory / (scope + "-" + sha) if sha else None
    if target is None or not target.is_file():
        raw = serialize(db)
        actual = hashlib.sha256(raw).hexdigest()
        require(sha is None or sha == actual, "Il catalogo è cambiato. Ripeti l'esportazione.", 409)
        sha, target = actual, directory / (scope + "-" + actual)
        if not target.is_file():
            with tempfile.NamedTemporaryFile(dir=directory, delete=False) as tmp:
                tmp.write(raw)
            Path(tmp.name).replace(target)
        for item in directory.glob("*-*"):
            try:
                if item != target and item.stat().st_mtime < time.time() - 3600:
                    item.unlink(missing_ok=True)
            except FileNotFoundError:
                pass
    size = target.stat().st_size
    require(index * PART < size, "Parte assente.", 404)
    with target.open("rb") as stream:
        stream.seek(index * PART)
        chunk = base64.b64encode(stream.read(PART)).decode("ascii")
    return {"sha": sha, "size": size, "part": index, "partSize": PART, "data": chunk}
