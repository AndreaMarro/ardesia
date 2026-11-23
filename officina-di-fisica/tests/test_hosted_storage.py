import sqlite3
import unittest
from server.adapters import hosted


class HostedStorage(unittest.TestCase):
    def test_named_rows_remain_positional_and_convert_to_dict(self):
        db = sqlite3.connect(":memory:")
        with db:
            cursor = hosted.Cursor(db.execute("SELECT 12 AS posizione,-2 AS ritorno"))
            row = cursor.fetchone()
            self.assertEqual(tuple(row), (12, -2))
            self.assertEqual(dict(row), {"posizione": 12, "ritorno": -2})
            self.assertEqual(row["ritorno"], row[1])
            self.assertIsNone(cursor.fetchone())
        db.close()

    def test_private_files_are_atomic_ordered_and_immutable(self):
        db = sqlite3.connect(":memory:")
        db.execute(hosted.FILES_SCHEMA)
        raw = bytes(range(256)) * 1800
        with self.assertRaises(RuntimeError), db:
            hosted.save_bytes(db, "asset/test", raw)
            raise RuntimeError("interruzione")
        self.assertEqual(hosted.load_bytes(db, "asset/test"), b"")
        with db:
            hosted.save_bytes(db, "asset/test", raw)
            hosted.save_bytes(db, "asset/test", b"duplicato")
        self.assertEqual(hosted.load_bytes(db, "asset/test"), raw)
        self.assertGreater(db.execute("SELECT count(*) FROM hosted_file_parts").fetchone()[0], 1)
        db.close()
