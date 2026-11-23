"""Reconcile review decisions with distributed content and actual pinned editions."""
import csv
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import learning, store

APP = Path(__file__).resolve().parents[1]
CATALOG = {r["id"]: r for r in store.catalog_seed()}


class CatalogoEditoriale(unittest.TestCase):
    def test_ogni_decisione_ha_una_voce_e_ogni_prima_edizione_e_riconoscibile(self):
        for fixture in sorted((APP/"tests/fixtures").glob("c?-edizione-v1.json")):
            course = fixture.name.split("-")[0]
            old_fields = json.loads(fixture.read_text())
            register = APP/"docs/verifica-prodotto"/f"revisione-{course}.tsv"
            with register.open() as stream:
                rows = list(csv.DictReader(stream, delimiter="\t"))
            keys = {r["id"] for r in rows}
            self.assertEqual(len(keys),len(rows),course)
            self.assertEqual(keys,{k for k,r in CATALOG.items() if r["course"]==course.upper()})
            self.assertEqual({r["id"] for r in rows if r["esito_editoriale"]!="conserva"},set(old_fields))
            for k, fields in old_fields.items():
                self.assertTrue(set(fields).isdisjoint({"answer","skill","family","control","references","exam"}),k)
                previous = {**CATALOG[k], **fields}
                previous.setdefault("review","edizione Astra · controlli automatici")
                self.assertEqual(store.digest(store.encode(previous)),store.BUNDLED_V1_HASHES[k],k)
                self.assertEqual((previous["version"],CATALOG[k]["version"]),(1,2),k)

    def test_tentativo_sul_sensore_conserva_testo_figura_e_punteggio_della_sua_edizione(self):
        key = "C5-Q039"
        changes = json.loads((APP/"tests/fixtures/c5-edizione-v1.json").read_text())
        initial = [{**r, **changes.get(k,{})} for k,r in CATALOG.items()]
        student = {"id":"quaderno-sintetico","role":"lettore"}
        def start(db,token):
            return learning.start(db,student,store.published(db),
                                  {"course":"C5","item":key,"mode":"practice","requestId":token})["id"]
        def view(db,run,action=None):
            return learning.details(db,student,store.published(db),run,action)
        with tempfile.TemporaryDirectory() as folder, patch.object(store,"DATA",Path(folder)):
            with patch.object(store,"catalog_seed",return_value=initial):
                store.initialize()
            with store.connect() as db:
                run = start(db,"sensore-prima")
                view(db,run,{"action":"answer","idx":0,"value":"10"})
                before = view(db,run,{"action":"finish"})
                self.assertTrue(before["items"][0]["correct"])
                attempts = list(db.execute("SELECT * FROM attempts"))
            store.initialize()
            store.initialize()
            with store.connect() as db:
                old = view(db,run)
                self.assertEqual((old["items"],old["result"]),(before["items"],before["result"]))
                self.assertEqual(old["items"][0]["version"],1)
                for k in changes:
                    self.assertEqual([r[0] for r in db.execute("SELECT v FROM versions WHERE id=? ORDER BY v",(k,))],[1,2],k)
                self.assertEqual(list(db.execute("SELECT * FROM attempts")),attempts)
                new = view(db,start(db,"sensore-dopo"),{"action":"answer","idx":0,"value":"10"})["items"][0]
                self.assertEqual(new["version"],2)
                self.assertTrue(new["correct"])
                self.assertEqual(new["solution"],CATALOG[key]["blocks"])
                self.assertTrue(any(b.get("src") for b in new["solution"]))
