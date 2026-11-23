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


class EditorialTransfer(unittest.TestCase):
    def test_partial_retry_and_scope(self):
        import base64
        import hashlib
        import json
        from server.adapters import hosted_transfer as transport
        from server.domain.errors import Problem
        db = sqlite3.connect(":memory:")
        db.row_factory = sqlite3.Row
        db.execute(hosted.FILES_SCHEMA)
        db.execute(transport.SCHEMA)
        raw = json.dumps({"testo": "à" * 145000}, ensure_ascii=False).encode()
        applied = []
        def receive(action, payload):
            applied.append(action)
            return {"length": len(payload["testo"])}
        def send(data, scope="sessione-a"):
            with db:
                return transport.upload(db, scope, data, receive)
        key = send({"phase": "open", "size": len(raw), "sha": hashlib.sha256(raw).hexdigest(), "action": "import"})["id"]
        finish = {"phase": "complete", "id": key}
        with self.assertRaises(Problem):
            send(finish)
        with self.assertRaises(Problem):
            send(finish, "sessione-b")
        for part in (1, 0, 0):
            chunk = raw[part * transport.PART:(part + 1) * transport.PART]
            send({"phase":"part", "id":key, "part":part, "data":base64.b64encode(chunk).decode()})
        self.assertEqual(send(finish), {"length": 145000})
        self.assertEqual(send(finish), {"length": 145000})
        self.assertEqual(applied, ["import"])
        transport.discard(db, "sessione-a")
        with self.assertRaises(Problem):
            send(finish)
        db.close()
