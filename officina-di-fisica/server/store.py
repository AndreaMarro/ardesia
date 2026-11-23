"""Versioned content, local installation and access rules."""

import hashlib
import json
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path

from .domain.identity import encode, digest, need_author, need_user, safe_key
from .domain.catalog import courses_for, in_course
from .domain.errors import Problem, require
from .adapters.migrations import migrate
from .adapters.engines import bind_releases

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(os.environ.get("ASTRA_DATA", ROOT / "var")).resolve()
BASE = ROOT / "content"
NOW = lambda: int(time.time())


class ManagedConnection(sqlite3.Connection):
    """Commit or roll back the transaction and release the descriptor on context exit."""

    def __exit__(self, exc_type, exc, tb):
        try:
            return super().__exit__(exc_type, exc, tb)
        finally:
            self.close()


def connect():
    db = sqlite3.connect(
        DATA / "officina.sqlite3", timeout=20, factory=ManagedConnection
    )
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    return db


SCHEMA = (ROOT / "migrations/001_initial.sql").read_text()


def catalog_seed():
    courses = json.loads((BASE / "catalog.json").read_text())
    for i, c in enumerate(courses):
        yield dict(
            kind="course",
            course=c["id"],
            section="",
            order=i + 1,
            skill="",
            prerequisites=[],
            blocks=[],
            version=1,
            **c,
        )
    for path in sorted(BASE.glob("*.json")):
        if path.name == "catalog.json":
            continue
        yield from json.loads(path.read_text())


BUNDLED_V1_HASHES = {
    "SIM-C5-L01-02": "709c9fb7c27b69b981982f3f6552736aaa7b0e92404bb2eabcd14020b7ac2ec8",
    "C1-Q008": "bb71982f9b39eb35450278335b1b5c37a5ebb5de0af790a8a8a68ba07be04d13",
    "C1-Q013": "2475c1f983643a4a88e86e5cbd7a1dce8f5fd62f16688972df1622340092425a",
    "C1-Q023": "641478daeabe3662eac458c584f5bc5139fefe232b4e21da3883531cc854e292",
    "C1-Q027": "8e360aead59a8880a29d6a00a5d6630901c865dbb3753282c8192e0d91c31494",
    "C1-Q034": "d59ffa192959eb4be7af5e2f9b601a78440c319fca35d1d97ee0f1c8b6ff394a",
    "C1-Q044": "918e4df325782611a3ab7de2054f021c7678d4d884b78299a6761d1c40255ff1",
    "C1-Q056": "c58e476ef34b132acaae995d9c4bffb008e77633b1c5ad3a0f8ee5dc3858d0ff",
    "C1-Q064": "f69a7a2844eae7093c2ee20761209ab0eaaabdcac8832cb82d1415d1fd86dd23",
    "C1-Q077": "087bce0f056063798782fc532d17f0ad2f55571dcf4f3c1050cf5e9172328525",
    "C1-Q083": "17e1d6b3ace928d5ad819c82842535cdb725c78976c0c5734e4883058c0546b4",
    "C1-Q095": "afd1deb385084c817a1b5daf5632fb509625ffe8780613d0099ab83af2cbacbb"
}


def update_bundled_solution(db, rec):
    # Only advance the untouched first edition. Earlier attempts retain their version.
    old = db.execute(
        "SELECT payload FROM heads JOIN versions USING(id) WHERE id=? AND live=v "
        "AND live=1 AND draft IS NULL AND NOT EXISTS "
        "(SELECT 1 FROM versions WHERE id=? AND v>1)", (rec["id"], rec["id"])
    ).fetchone()
    if not old or digest(old["payload"]) != BUNDLED_V1_HASHES[rec["id"]]:
        return
    edition = dict(rec, review="edizione Astra · controlli automatici")
    db.execute("INSERT INTO versions VALUES(?,?,?,?,?)",
               (rec["id"], rec["version"], encode(edition), "edizione locale", NOW()))
    db.execute("UPDATE heads SET live=? WHERE id=?", (rec["version"], rec["id"]))


def initialize():
    DATA.mkdir(parents=True, exist_ok=True, mode=0o700)
    for name in ("uploads", "pdf"):
        (DATA / name).mkdir(exist_ok=True)
    with connect() as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("BEGIN IMMEDIATE")
        migrate(db, [path.read_text() for path in sorted((ROOT / "migrations").glob("[0-9][0-9][0-9]_*.sql"))])
        bind_releases(db)
        for rec in catalog_seed():
            if rec["id"] in BUNDLED_V1_HASHES and rec["version"] == 2:
                update_bundled_solution(db, rec)
            if db.execute("SELECT 1 FROM heads WHERE id=?", (rec["id"],)).fetchone():
                continue
            rec.setdefault("review", "edizione Astra · controlli automatici")
            db.execute("INSERT INTO heads VALUES(?,?,NULL)", (rec["id"], rec["version"]))
            db.execute(
                "INSERT INTO versions VALUES(?,?,?,?,?)",
                (rec["id"], rec["version"], encode(rec), "edizione locale", NOW()),
            )
        db.execute("INSERT OR IGNORE INTO settings VALUES('commerce','{}')")
        db.execute(
            "INSERT OR IGNORE INTO users VALUES('owner','autore@localhost','!','autore',?)",
            (NOW(),),
        )


def audit(db, user, event, target, detail=""):
    db.execute(
        "INSERT INTO audit(actor,event,target,detail,stamp) VALUES(?,?,?,?,?)",
        (user, event, target, detail, NOW()),
    )


def released(rec):
    if rec.get("review") == "bozza":
        rec["review"] = "controlli strutturali superati alla pubblicazione"
    return rec


def published(db):
    rows = db.execute(
        "SELECT payload FROM heads JOIN versions ON heads.id=versions.id AND live=v"
    )
    live = {r["id"]: r for r in (released(json.loads(row[0])) for row in rows)}
    # Hide current activities whose course, required skill or embedded resource was withdrawn.
    while True:
        unavailable = []
        for key, r in live.items():
            dependencies = {r["course"], *r.get("prerequisites", [])}
            if r.get("skill"):
                dependencies.add(r["skill"])
            dependencies.update(
                b["ref"]
                for b in r["blocks"] + r.get("promptBlocks", [])
                if b.get("ref")
            )
            removed_topic = (r["kind"] == "experiment"
                             and r["topic"] not in live.get(r["skill"], {}).get("coverage", ()))
            if removed_topic or not dependencies.issubset(live):
                unavailable.append(key)
        if not unavailable:
            return list(live.values())
        for key in unavailable:
            del live[key]


def record(db, key, version=None):
    if version is None:
        row = db.execute(
            "SELECT payload FROM heads JOIN versions USING(id) WHERE heads.id=? AND v=live",
            (key,),
        ).fetchone()
    else:
        row = db.execute(
            "SELECT payload FROM versions WHERE id=? AND v=?", (key, version)
        ).fetchone()
    require(row, "Materiale non disponibile.", 404)
    payload = json.loads(row[0])
    return released(payload) if version is None else payload


def grants(db, user, rows=None):
    if not user:
        return set()
    if user["role"] == "autore" or (
        user["role"] == "lettore" and config(db).get("mode", "verifica") == "verifica"
    ):
        return {
            r["id"]
            for r in (rows if rows is not None else published(db))
            if r["kind"] == "course"
        }
    return {
        row[0]
        for row in db.execute(
            "SELECT course FROM access WHERE user=? AND mode=?",
            (user["id"], config(db).get("mode", "verifica")),
        )
    }


def can_read(db, user, rows, rec):
    if rec["kind"] == "experiment":
        lesson = next((r for r in rows if r["kind"] == "lesson" and r["id"] == rec["skill"]), None)
        return bool(lesson and rec["topic"] in lesson.get("coverage", ())
                    and can_read(db, user, rows, lesson))
    if rec["kind"] == "course":
        return True
    if rec["kind"] in ("lesson", "example", "question") and not rec.get("exam"):
        group = (
            r
            for r in rows
            if r["kind"] == rec["kind"]
            and r["course"] == rec["course"]
            and not r.get("exam")
        )
        first = min(group, key=lambda r: (r.get("order", 0), r["id"]), default=None)
        if first and first["id"] == rec["id"]:
            return True
    if rec["kind"] in ("lab", "bench") and rec["course"] == "C2":
        return True
    return bool(grants(db, user, rows) & courses_for(rows, rec))


def entitled(db, user, rows, key):
    courses = [c for c in rows if c["kind"] == "course" and c["id"] == key]
    if not courses:
        return False
    owned = grants(db, user, rows)
    includes = {key}
    while True:
        parents = {
            c["id"]
            for c in rows
            if c["kind"] == "course" and includes.intersection(c.get("includes", []))
        }
        if parents <= includes:
            break
        includes.update(parents)
    return bool(includes & owned)


def config(db):
    return json.loads(
        db.execute("SELECT value FROM settings WHERE key='commerce'").fetchone()[0]
    )


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    value = hashlib.scrypt(
        password.encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1
    ).hex()
    return salt + "." + value
