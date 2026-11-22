from collections import Counter
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from server import editor, store

ROOT = Path(__file__).resolve().parents[1]


class BanchiEditoriali(TestCase):
    def setUp(self):
        self.rows = {r["id"]: r for r in store.catalog_seed()}
        self.benches = [r for r in self.rows.values() if r["kind"] == "bench"]

    def test_catalogo_lezioni_e_collegamenti(self):
        self.assertEqual(Counter(b["course"] for b in self.benches),
                         {f"C{i}": 2 for i in range(1, 6)})
        topics = set()
        for bench in self.benches:
            self.assertTrue(editor.validate(None, bench, self.rows))
            self.assertEqual({self.rows[k]["kind"] for k in bench["related"]},
                             {"lesson", "example", "question"})
            for topic in bench["topics"]:
                lesson = self.rows[topic["lesson"]]
                self.assertIn(topic["topic"], lesson["coverage"])
                self.assertTrue(any(b["type"] == "text" and b["text"].startswith(topic["anchor"])
                                    for b in lesson["blocks"]))
                topics.add((lesson["id"], topic["topic"]))
        table = (ROOT / "docs/laboratori-3d/voci.md").read_text()
        experiences = {(r["skill"], r["topic"]): r for r in self.rows.values() if r["kind"] == "experiment"}
        for lesson in self.rows.values():
            if lesson["kind"] == "lesson":
                section = table.split("## " + lesson["id"] + " · ")[1].split("\n## ")[0]
                for topic in lesson["coverage"]:
                    row = next(line for line in section.splitlines() if line.startswith("| " + topic + " |"))
                    key = (lesson["id"], topic)
                    self.assertIn(experiences[key]["id"], row)
                    if key in topics:
                        self.assertIn("LAB3D-", row)
        catalog = (ROOT / "docs/laboratori-3d/catalogo.md").read_text()
        self.assertEqual(catalog.count("| Progettato |"), 30)
        self.assertEqual(catalog.count("| Disponibile · LAB3D-"), 10)

    def test_edizione_rifiuta_chiavi_o_modelli_incoerenti(self):
        base = self.benches[0]
        for field, bad in [("model", "../inesistente"), ("related", ["C6-Q9999"]),
                           ("prediction", "manca"), ("assessment", [])]:
            with self.subTest(field=field), self.assertRaises(store.Problem):
                editor.validate(None, dict(base, **{field: bad}), self.rows)
        copy = deepcopy(base)
        copy["prediction"]["correct"] = len(copy["prediction"]["options"])
        with self.assertRaises(store.Problem):
            editor.validate(None, copy, self.rows)

    def test_aggiornamento_su_installazione_esistente_e_permessi(self):
        original = [r for r in self.rows.values() if r["kind"] != "bench"]
        with TemporaryDirectory() as tmp, patch.object(store, "DATA", Path(tmp)):
            with patch.object(store, "catalog_seed", return_value=original):
                store.initialize()
            store.initialize()
            store.initialize()
            with store.connect() as db:
                rows = store.published(db)
                acquired = [r for r in rows if r["kind"] == "bench"]
                self.assertEqual(len(acquired), 10)
                for b in acquired:
                    self.assertEqual(store.can_read(db, None, rows, b), b["course"] == "C2")
                    self.assertEqual(db.execute("SELECT count(*) FROM versions WHERE id=?",
                                                (b["id"],)).fetchone()[0], 1)
                self.assertEqual(len([r for r in rows if r["kind"] == "lab"]), 5)
