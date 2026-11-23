"""The signed-area revision must preserve pinned attempts and editorial changes."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import store


class SignedAreasUpgrade(unittest.TestCase):
    def test_upgrade_and_reopen(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(store, "DATA", Path(directory)):
            edition = next(r for r in store.catalog_seed() if r["id"] == "C1-Q027")
            first = dict(edition, version=1, blocks=[
                {"type": "formula", "text": r"\Delta x=v_1t_1+v_2t_2=3\cdot4+(-2)\cdot5=12-10=2\,\mathrm m"},
                {"type": "text", "text": "Il punto torna indietro di 10 m, terminando 2 m oltre la posizione di partenza."},
            ])
            with patch.object(store, "catalog_seed", return_value=[first]):
                store.initialize()
            with store.connect() as db:
                original = store.record(db, first["id"], 1)
                # An author's pending draft must win over the bundled revision.
                db.execute("INSERT INTO versions VALUES(?,2,?,?,0)", (first["id"], store.encode(dict(original, version=2)), "owner"))
                db.execute("UPDATE heads SET draft=2 WHERE id=?", (first["id"],))
            store.initialize()
            with store.connect() as db:
                self.assertEqual(tuple(db.execute("SELECT live,draft FROM heads WHERE id=?", (first["id"],)).fetchone()), (1, 2))
                # Restore the untouched fixture to exercise the normal upgrade.
                db.execute("UPDATE heads SET draft=NULL WHERE id=?", (first["id"],))
                db.execute("DELETE FROM versions WHERE id=? AND v=2", (first["id"],))
            store.initialize()
            store.initialize()
            with store.connect() as db:
                self.assertEqual(store.record(db, first["id"], 1), original)
                current = store.record(db, first["id"])
                self.assertEqual(current["version"], 2)
                self.assertEqual(current["blocks"], edition["blocks"])
                self.assertEqual(current["answer"], original["answer"])
