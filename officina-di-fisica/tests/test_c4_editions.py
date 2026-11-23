"""Recognized editions, private authoring and immutable practice attempts in C4."""
import csv
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import learning, store

ROOT = Path(__file__).resolve().parents[1]
FIRST = json.loads((ROOT / "tests/fixtures/c4-edizione-v1.json").read_text())
CATALOG = {r["id"]: r for r in store.catalog_seed()}


class ElectricEditions(unittest.TestCase):
    def test_review_register_covers_the_live_course_once(self):
        with (ROOT / "docs/verifica-prodotto/revisione-c4.tsv").open() as source:
            decisions = list(csv.DictReader(source, delimiter="\t"))
        ids = {r["id"] for r in decisions}
        self.assertEqual(len(decisions), len(ids))
        self.assertEqual(ids, {k for k, r in CATALOG.items() if r["course"] == "C4"})
        self.assertEqual({r["id"] for r in decisions if r["esito_editoriale"] != "conserva"}, set(FIRST))
        for key, delta in FIRST.items():
            previous = {**CATALOG[key], **delta}
            previous.setdefault("review", "edizione Astra · controlli automatici")
            self.assertEqual(store.digest(store.encode(previous)), store.BUNDLED_V1_HASHES[key], key)
            self.assertEqual(CATALOG[key]["version"], 2, key)
            self.assertNotIn("answer", delta)
            self.assertNotIn("family", delta)
            if previous["kind"] == "bench":
                grades = lambda row: [(a["value"], a["unit"]) for a in row["assessment"]]
                self.assertEqual(grades(previous), grades(CATALOG[key]))

    def test_two_boots_preserve_old_attempts_and_reopen_the_correct_edition(self):
        student = {"id": "c4-test", "role": "lettore"}
        previous = [dict(r, **FIRST.get(k, {})) for k, r in CATALOG.items()]
        with tempfile.TemporaryDirectory() as staging, patch.object(store, "DATA", Path(staging)):
            with patch.object(store, "catalog_seed", return_value=previous):
                store.initialize()
            with store.connect() as db:
                before = list(db.execute("SELECT id,v,payload,actor,stamp FROM versions ORDER BY id,v"))
                rows = store.published(db)
                def begin(token):
                    return {"course":"C4", "mode":"practice", "item":"C4-Q091", "requestId":token}
                old_run = learning.start(db, student, rows, begin("prima"))["id"]
                old = learning.details(db, student, rows, old_run, {"action":"answer", "idx":0, "value":"3"})
                self.assertTrue(old["items"][0]["correct"])
                historical = list(db.execute("SELECT * FROM attempts ORDER BY rowid"))
            store.initialize()
            store.initialize()
            with store.connect() as db:
                rows = store.published(db)
                entries = list(db.execute("SELECT id,v,payload,actor,stamp FROM versions ORDER BY id,v"))
                self.assertEqual([r for r in entries if not (r["id"] in FIRST and r["v"] == 2)], before)
                self.assertEqual(len(entries) - len(before), len(FIRST))
                for key in FIRST:
                    current = dict(CATALOG[key])
                    current.setdefault("review", "edizione Astra · controlli automatici")
                    self.assertEqual(store.record(db, key), current, key)
                pinned = learning.details(db, student, rows, old_run)["items"][0]
                self.assertEqual(pinned, old["items"][0])
                newer = learning.start(db, student, rows, begin("dopo"))["id"]
                shown = learning.details(db, student, rows, newer, {"action":"reveal", "idx":0})["items"][0]
                self.assertEqual((pinned["version"], shown["version"]), (1, 2))
                self.assertEqual(shown["solution"], CATALOG["C4-Q091"]["blocks"])
                self.assertEqual(list(db.execute("SELECT * FROM attempts ORDER BY rowid")), historical)

    def test_drafts_withdrawals_modified_first_editions_and_private_history_win(self):
        keys = ["C4-Q001","C4-Q003","C4-Q004","C4-Q010"]
        first = [dict(CATALOG[k], **FIRST[k]) for k in keys]
        with tempfile.TemporaryDirectory() as staging, patch.object(store, "DATA", Path(staging)):
            with patch.object(store, "catalog_seed", return_value=first):
                store.initialize()
            with store.connect() as db:
                db.execute("UPDATE heads SET live=NULL WHERE id=?", (keys[0],))
                local = dict(store.record(db, keys[1]), title="Scheda personale del docente")
                db.execute("UPDATE versions SET payload=? WHERE id=?", (store.encode(local), keys[1]))
                for key in keys[2:]:
                    payload = store.encode(dict(store.record(db, key), version=2, title="Seconda edizione privata"))
                    db.execute("INSERT INTO versions VALUES(?,2,?,'owner',7)", (key, payload))
                db.execute("UPDATE heads SET draft=2 WHERE id=?", (keys[2],))
                snapshot = [tuple(r) for key in keys for r in db.execute(
                    "SELECT live,draft,v,payload FROM heads JOIN versions USING(id) WHERE id=? ORDER BY v", (key,))]
            store.initialize()
            with store.connect() as db:
                after = [tuple(r) for key in keys for r in db.execute(
                    "SELECT live,draft,v,payload FROM heads JOIN versions USING(id) WHERE id=? ORDER BY v", (key,))]
            self.assertEqual(after, snapshot)
