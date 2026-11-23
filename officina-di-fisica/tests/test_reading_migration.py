"""The fourth migration can round-trip a version-three notebook without changing previous rows."""
import sqlite3
import unittest
from contextlib import closing
from pathlib import Path

from server.adapters.migrations import migrate
from server.adapters.reading_preferences import read, update

SCRIPTS = [p.read_text() for p in sorted((Path(__file__).resolve().parents[1]/"migrations").glob("*.sql"))]

class ReadingMigration(unittest.TestCase):
    def test_old_reader_and_reupgrade_keep_history_and_settings(self):
        with closing(sqlite3.connect(":memory:")) as db:
            db.execute("BEGIN IMMEDIATE")
            migrate(db, SCRIPTS[:3])
            db.execute("INSERT INTO users VALUES('lettore','test@example.test','!','lettore',7)")
            db.execute("INSERT INTO reads VALUES('lettore','C6-L01',1,13)")
            db.commit()
            historical = list(db.execute("SELECT * FROM reads"))
            db.execute("BEGIN IMMEDIATE")
            migrate(db, SCRIPTS)
            update(db,"lettore",{"contrast":"high"})
            db.commit()
            db.execute("BEGIN IMMEDIATE")
            db.execute("PRAGMA user_version=3")
            migrate(db,SCRIPTS[:3])
            db.commit()
            self.assertEqual(list(db.execute("SELECT * FROM reads")), historical)
            db.execute("BEGIN IMMEDIATE")
            migrate(db, SCRIPTS)
            db.commit()
            self.assertEqual(read(db,"lettore")["contrast"],"high")
            self.assertEqual(list(db.execute("SELECT * FROM reads")), historical)
