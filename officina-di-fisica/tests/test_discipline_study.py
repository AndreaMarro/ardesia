"""Contract, migration, authorization and durable learning evidence, on isolated databases."""
import json
import shutil
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from server import commerce, discipline_study as study, store
from server.adapters import discipline_editions as ed
from server.adapters.discipline_pack import load_pack
from server.domain.errors import Problem

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples" / "discipline"


class Disciplines(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.catalog = root / "edition" / "catalog.json"
        shutil.copytree(SOURCE, self.catalog.parent)
        self.enterContext(patch.object(store, "DATA", root / "notebook"))
        store.initialize()
        self.reader = {"id": "p1", "role": "lettore"}
        self.student = {"id": "p2", "role": "studente"}
        with store.connect() as db:
            for u in (self.reader, self.student):
                db.execute("INSERT INTO users VALUES(?,?, '!', ?,1)", (u["id"], u["id"]+"@example.test", u["role"]))

    def install(self, status="preview", activate=False):
        with store.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            return ed.install(db, self.catalog, status, activate)

    def call(self, tail=(), data=None, user=None, local=True):
        with store.connect() as db:
            db.execute("BEGIN IMMEDIATE" if data is not None else "BEGIN")
            return study.route(db, user, list(tail), data or {}, data is not None, local)

    def event(self, kind, key, activity=None, **more):
        body = dict(kind=kind, requestId=key, unitId="tessere", version="1", **more)
        if activity:
            body["activityId"] = activity
        return self.call(["misure", "events"], body, self.reader)

    def test_additive_install_legacy_rows_retry_reopen_and_rollback(self):
        def legacy():
            with store.connect() as db:
                return ([tuple(r) for r in db.execute("SELECT * FROM heads ORDER BY id")],
                        [tuple(r) for r in db.execute("SELECT * FROM versions ORDER BY id,v")],
                        [tuple(r) for r in db.execute("SELECT * FROM reads")],
                        [tuple(r) for r in db.execute("SELECT * FROM attempts")],
                        db.execute("PRAGMA user_version").fetchone()[0])
        with store.connect() as db:
            db.execute("INSERT INTO reads VALUES('p1','C1-L01',1,99)")
            db.execute("INSERT INTO attempts VALUES('historic',0,'p1','C1-Q01',1,'C1-L01','old',1,0,9)")
        before = legacy()
        self.assertEqual([x["id"] for x in self.call()["disciplines"]], ["fisica"])
        self.assertTrue(self.install()["changed"])
        self.assertFalse(self.install()["changed"])
        self.event("open", "visit")
        store.initialize()
        self.assertEqual(before, legacy())
        # Old code sees the same user_version and tables, even after new evidence was created.
        self.assertEqual(before[-1], 4)
        self.assertEqual([u["unitId"] for u in [self.call(["misure","me"], user=self.reader)["resume"]]], ["tessere"])
        course = self.catalog.parent / "courses" / "rettangoli.json"
        old = course.read_text()
        course.write_text(old.replace("Dalle righe alla superficie", "Area e righe"))
        with self.assertRaisesRegex(Problem, "versione"):
            self.install()
        self.assertEqual(self.call(["misure","units","tessere"], user=self.reader)["title"], "Dalle righe alla superficie")
        data = json.loads(self.catalog.read_text()); data["version"] = "2"; self.catalog.write_text(json.dumps(data))
        self.assertTrue(self.install()["changed"])
        self.assertEqual(self.event("open", "visit")["version"], "1")
        with self.assertRaisesRegex(Problem, "cambiata"):
            self.event("open", "new-id")
        self.assertEqual(self.call(["misure","units","tessere"], user=self.reader)["title"], "Area e righe")
        course.write_text(old); data["version"]="1"; self.catalog.write_text(json.dumps(data))
        with self.assertRaises(Problem):
            self.install()
        self.install(activate=True)
        self.assertEqual(self.call(["misure","me"], user=self.reader)["skills"]["area"]["exposures"],1)

    def test_guest_projection_draft_boundaries_and_revoke(self):
        self.install()
        self.assertEqual(len(self.call(local=False)["disciplines"]), 1)
        with self.assertRaises(Problem):
            self.call(["misure"], user=self.reader, local=False)
        with self.assertRaises(Problem):
            self.call(["misure","units","tessere"])
        unit = self.call(["misure","units","tessere"], user=self.reader)
        for a in unit["activities"]:
            self.assertEqual(set(a), {"id","skillId","kind","prompt","options","hintCount"})
        self.assertNotIn("orderKey", self.call(["misure"])["courses"][0])
        self.install("published", activate=True)
        pack=self.call(["misure"],user=self.student)
        key=pack["courses"][0]["orderKey"]
        self.assertFalse(pack["courses"][0]["accessible"])
        with store.connect() as db:
            rows=ed.sale_courses(db)
            order=commerce.create(db,self.student,rows,{"course":key,"accepted":True})
            commerce.operation(db,{"id":"owner","role":"autore"},order["id"],{"action":"confirm","verified":True,"amount":"1.00"})
            self.assertEqual(order["snapshot"]["courseTitle"], "Area del rettangolo")
        self.assertTrue(self.call(["misure"],user=self.student)["courses"][0]["accessible"])
        with store.connect() as db:
            db.execute("DELETE FROM access WHERE user=?", (self.student["id"],))
        with self.assertRaises(Problem):
            self.call(["misure","units","tessere"], user=self.student)
        self.assertIsNone(self.call(["misure","me"], user=self.student)["next"])

    def test_evidence_concurrent_replays_and_delayed_novel_item(self):
        self.install()
        self.event("open", "open")
        self.event("complete", "finish")
        self.event("hint","h","griglia",hintIndex=0)
        with ThreadPoolExecutor(3) as workers:
            result = list(workers.map(lambda _: self.event("answer","same","griglia", optionId="a"), range(3)))
        self.assertTrue(all(r == result[0] for r in result))
        self.assertTrue(result[0]["assisted"])
        with self.assertRaises(Problem):
            self.event("answer","same","griglia",optionId="b")
        with patch.object(store,"NOW",lambda:100):
            self.event("answer","original","lato",optionId="a")
        with patch.object(store,"NOW",lambda:100 + study.REVIEW_DELAY):
            self.assertIn("ripasso", self.call(["misure","me"], user=self.reader)["next"]["reason"])
            result = self.event("answer","transfer","bordo",optionId="a")
        self.assertEqual(result["evidence"],{"retention":True,"transfer":True})
        model=self.call(["misure","me"], user=self.reader)
        skill=model["skills"]["area"]
        self.assertEqual([skill[k] for k in ("exposures","completions","assisted","independent","transfer","retention")],[1,1,1,2,1,1])
        self.assertEqual(self.call(["misure","me"], user=self.student)["skills"]["area"]["independent"],0)
        with self.assertRaises(Problem):
            self.event("answer","invented","griglia",optionId="z")

    def test_new_discipline_by_configuration_and_broken_graph(self):
        self.install()
        data=json.loads(self.catalog.read_text());data["id"]="geometria-alt"; self.catalog.write_text(json.dumps(data))
        self.install()
        self.assertEqual(len(self.call()["disciplines"]),3)
        data["skills"][0]["prerequisites"]=["area"]; self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(Problem,"Ciclo"):
            load_pack(self.catalog)
        data["skills"][0]["prerequisites"]=[];data["courses"][0]["file"]="../outside.json"; self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(Problem,"Percorso"):
            load_pack(self.catalog)
