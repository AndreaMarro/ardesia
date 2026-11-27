"""Bounded, idempotent adapter around the sole canonical editorial importer."""
import json

from server import editor
from server.domain.identity import encode, need_author


def material(row):
    return {k: v for k, v in row.items() if k not in ("version", "baseVersion", "review")}


def import_drafts(db, user, package):
    need_author(user)
    rows = package.get("records", [])
    if package.get("schema") != "astra/1" or not 1 <= len(rows) <= 100:
        raise ValueError("Expected a bounded astra/1 batch of 1–100 records")
    ids = [r["id"] for r in rows]
    if len(set(ids)) != len(ids): raise ValueError("Duplicate batch ID")
    # One savepoint covers the full batch even if the caller catches a failure.
    db.execute("SAVEPOINT corpus_import")
    try:
        changes = []
        for row in rows:
            existing = db.execute("SELECT payload FROM versions WHERE id=? ORDER BY v DESC LIMIT 1", (row["id"],)).fetchone()
            if existing and encode(material(json.loads(existing[0]))) == encode(material(row)):
                continue
            changes.append(row)
        if changes:
            result = editor.imported(db, user, {**package, "records": changes}, True)
            if result["errors"]: raise ValueError("; ".join(result["errors"]))
        db.execute("RELEASE SAVEPOINT corpus_import")
        return {"saved": len(changes), "unchanged": len(rows)-len(changes), "publication": "DRAFT"}
    except Exception:
        db.execute("ROLLBACK TO SAVEPOINT corpus_import")
        db.execute("RELEASE SAVEPOINT corpus_import")
        raise
