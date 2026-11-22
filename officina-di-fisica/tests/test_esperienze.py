from collections import Counter
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from server import editor, store


class EsperienzeDiLezione(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = {r["id"]: r for r in store.catalog_seed()}
        cls.experiments = [r for r in cls.records.values() if r["kind"] == "experiment"]

    def test_una_sola_simulazione_per_voce_con_ancora_e_modello_validi(self):
        intended = Counter((r["id"], topic) for r in self.records.values()
                           if r["kind"] == "lesson" for topic in r["coverage"])
        actual = Counter((r["skill"], r["topic"]) for r in self.experiments)
        self.assertEqual(actual, intended)
        self.assertEqual(set(actual.values()), {1})
        for r in self.experiments:
            with self.subTest(id=r["id"]):
                self.assertTrue(editor.validate(None, r, self.records))

    def test_non_pubblicare_dati_o_modelli_incoerenti(self):
        r = self.records["SIM-C1-L001-02"]
        for field, value in (("id", "SIM-C1-L001-99"), ("references", [[2, 4], [3, 9]]),
                             ("measure", {"label": "Area", "unit": "cm²"}), ("anchor", "Altra lezione"),
                             ("anchor", 7), ("substitution", {"errata": 4}), ("transferPrompt", "Dato mancante"), ("skill", "C1-L002"), ("apparatus", "termometro")):
            with self.subTest(field=field), self.assertRaises(store.Problem):
                editor.validate(None, dict(r, **{field: value}), self.records)

    def test_oscillatore_aggiorna_solo_la_spiegazione_originale(self):
        current = self.records["SIM-C5-L01-02"]
        archived = dict(current, version=1, interpretation=(
            "L’ampiezza resta 3 cm. La scena fotografa la sorgente mezzo secondo dopo il massimo. "
            "Distingui l’ampiezza dall’escursione picco-picco, e la frequenza dalla pulsazione in rad/s."
        ))
        for changed in (False, True):
            with self.subTest(personalizzata=changed), TemporaryDirectory() as tmp, patch.object(store, "DATA", Path(tmp)):
                first = dict(archived, interpretation="Nota del docente") if changed else archived
                with patch.object(store, "catalog_seed", return_value=[dict(first)]):
                    store.initialize()
                with patch.object(store, "catalog_seed", return_value=[dict(current)]):
                    store.initialize()
                    store.initialize()
                with store.connect() as db:
                    self.assertEqual(store.record(db, first["id"], 1)["interpretation"], first["interpretation"])
                    live = store.record(db, first["id"])
                    self.assertEqual(live["version"], 1 if changed else 2)
                    self.assertEqual(live["interpretation"], first["interpretation"] if changed else current["interpretation"])

    def test_installazione_esistente_riavvio_permessi_e_ritiro_voce(self):
        previous = [r for r in self.records.values() if r["kind"] != "experiment"]
        with TemporaryDirectory() as tmp, patch.object(store, "DATA", Path(tmp)):
            with patch.object(store, "catalog_seed", return_value=deepcopy(previous)):
                store.initialize()
            store.initialize()
            store.initialize()
            with store.connect() as db:
                live = store.published(db)
                cumulative = store.in_course(live, "C6", "experiment")
                self.assertEqual({r["id"] for r in cumulative}, {r["id"] for r in self.experiments})
                self.assertEqual(sum(r["course"] == "C6" for r in cumulative), 6)
                self.assertEqual(db.execute(
                    "SELECT COUNT(*) FROM versions WHERE id LIKE 'SIM-%'").fetchone()[0], 181)
                for r in self.experiments:
                    lesson = self.records[r["skill"]]
                    self.assertEqual(store.can_read(db, None, live, r), store.can_read(db, None, live, lesson))
                sample = self.records["SIM-C1-L001-02"]
                restricted = self.records["SIM-C2-L010-03"]
                self.assertTrue(store.can_read(db, None, live, sample))
                self.assertFalse(store.can_read(db, None, live, restricted))
                self.assertTrue(store.can_read(db, {"id": "owner", "role": "autore"}, live, restricted))
                lesson = store.record(db, sample["skill"])
                lesson["coverage"].remove(sample["topic"])
                db.execute("UPDATE versions SET payload=? WHERE id=? AND v=?",
                           (store.encode(lesson), lesson["id"], lesson["version"]))
                visible_ids = {r["id"] for r in store.published(db)}
                self.assertNotIn(sample["id"], visible_ids)
                self.assertIn("SIM-C1-L001-03", visible_ids)
