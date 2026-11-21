import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import store
from server.method import validate_method


class MethodEditions(unittest.TestCase):
    def test_batch_upgrade_preserves_attempts_and_private_edits(self):
        fixture = Path(__file__).parent / "fixtures/c1-solutions-v1.json"
        old_blocks = json.loads(fixture.read_text())
        current = [r for r in store.catalog_seed() if r["id"] in old_blocks]
        self.assertEqual(len(current), 10)
        with tempfile.TemporaryDirectory() as tmp, patch.object(store, "DATA", Path(tmp)):
            first = [dict(r, version=1, blocks=old_blocks[r["id"]]) for r in current]
            with patch.object(store, "catalog_seed", return_value=first):
                store.initialize()
            with store.connect() as db:
                for r in first:
                    db.execute("INSERT INTO attempts VALUES(?,0,'student',?,1,?,?,1,0,100)",
                               (r["id"], r["id"], r["skill"], r["family"]))
            store.initialize()
            store.initialize()
            with store.connect() as db:
                for r in current:
                    key = r["id"]
                    self.assertEqual(store.record(db, key)["blocks"], r["blocks"])
                    old = db.execute("SELECT versions.payload FROM attempts JOIN versions USING(id,v) WHERE run=?", (key,)).fetchone()
                    self.assertEqual(json.loads(old[0])["blocks"], old_blocks[key])
                key = current[0]["id"]
                db.execute("UPDATE heads SET live=1 WHERE id=?", (key,))
                db.execute("DELETE FROM versions WHERE id=? AND v=2", (key,))
                custom = dict(store.record(db,key), title="Una versione personale")
                db.execute("UPDATE versions SET payload=? WHERE id=? AND v=1", (store.encode(custom),key))
            store.initialize()
            with store.connect() as db:
                self.assertEqual(store.record(db,key),custom)

    def test_graph_phase_and_scale_validation(self):
        chart = next(r for r in store.catalog_seed() if r.get("format")=="graph")
        with self.assertRaises(store.Problem):
            validate_method(dict(chart, diagram=dict(chart["diagram"], xmax=0)))
        with self.assertRaises(store.Problem):
            validate_method(dict(chart, steps=list(reversed(chart["steps"]))))
