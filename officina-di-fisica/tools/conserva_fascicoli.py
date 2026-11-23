"""Conserva i PDF dell'edizione servita prima di pubblicare una revisione editoriale."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.adapters import hosted
from server.printing import fingerprint
from server.store import connect, published


def conserva(course):
    if not hosted.enabled():
        raise RuntimeError("Seleziona l'archivio distribuito da conservare.")
    with connect(request_snapshot=True) as db:
        db.execute("BEGIN IMMEDIATE")
        rows = published(db)
        books = ("dispensa", "esercizi", "simulazioni") if course == "C6" else ("dispensa", "esercizi")
        editions = []
        for book in books:
            stamp = fingerprint(rows, course, book)
            key = "pdf/" + stamp
            raw = hosted.load_bytes(db, key)
            if not raw:
                source = ROOT / "materials" / (course + "-" + book + ".pdf")
                if source.with_suffix(".stamp").read_text().strip() != stamp:
                    raise RuntimeError(f"Il fascicolo {course} {book} va conservato dal checkout che lo pubblica.")
                raw = source.read_bytes()
                if not raw.startswith(b"%PDF-"):
                    raise ValueError(f"Il fascicolo {course} {book} è privo di intestazione PDF.")
                hosted.save_bytes(db, key, raw)
            editions.append({"book": book, "stamp": stamp, "sha256": hashlib.sha256(raw).hexdigest()})
    with connect(readonly=True) as db:
        for entry in editions:
            saved=hosted.load_bytes(db, "pdf/" + entry["stamp"])
            if hashlib.sha256(saved).hexdigest() != entry["sha256"]:
                raise RuntimeError("Il fascicolo conservato ha un'impronta inattesa.")
    return editions


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("course")
    print(json.dumps(conserva(parser.parse_args().course), ensure_ascii=False, indent=2))
