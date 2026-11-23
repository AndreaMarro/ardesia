"""Independent catalogue expectations from the distributed editions and their reuse declarations."""
import json
import unittest
from pathlib import Path

from server.adapters.contracts import schema, validate
from server.domain.catalog_search import search_catalog
from server.domain.errors import Problem

ROOT = Path(__file__).resolve().parents[1]


class Search(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = []
        for file in sorted((ROOT / "content").glob("*.json")):
            records = json.loads(file.read_text())
            if file.name == "catalog.json":
                records = [dict(r, kind="course", course=r["id"], version=1, order=i + 1) for i, r in enumerate(records)]
            cls.rows.extend(records)

    def test_complete_inventory_by_course_kind_and_page(self):
        catalog = {r["id"]: r for r in self.rows if not r.get("exam")}
        courses = {r["id"]: r for r in catalog.values() if r["kind"] == "course"}
        self.assertEqual((len(self.rows), len(catalog)), (991, 898))
        for course in ["", *courses]:
            included = {course, *courses.get(course, {}).get("includes", [])}
            expected = {key: r for key, r in catalog.items() if not course or
                        (key == course if r["kind"] == "course" else
                         bool(included.intersection([r["course"], *r.get("reuse", [])])))}
            for kind in ["", *{r["kind"] for r in catalog.values()}]:
                remaining = {key for key, r in expected.items() if not kind or r["kind"] == kind}
                seen = []
                for page in range(1, max(1, (len(remaining) + 11) // 12) + 1):
                    params = {"course": course, "kind": kind, "page": str(page)}
                    data = search_catalog(self.rows, params)
                    validate(data, schema("catalog-search-v1"))
                    self.assertEqual((data["page"], data["total"]), (page, len(remaining)))
                    self.assertLessEqual(len(json.dumps(data, ensure_ascii=False).encode()), 12 * 1024)
                    seen.extend(row["id"] for row in data["items"])
                self.assertEqual(sorted(seen), sorted(remaining), (course, kind))

    def test_ranking_normalization_and_private_fields(self):
        def ids(q, rows=None):
            return [r["id"] for r in search_catalog(self.rows if rows is None else rows, {"q": q})["items"]]
        self.assertEqual(ids("c1-q027")[0], "C1-Q027")
        self.assertEqual(ids("VELOCITÀ"), ids("velocita"))
        self.assertTrue(ids("lente sottile"))
        self.assertEqual(ids("lente sottile"), ids("lente sottile", list(reversed(self.rows))))
        self.assertEqual(ids("~"), [])
        poisoned = [dict(r, prompt="neutrinoesclusivo", blocks=[{"type":"text","text":"neutrinoesclusivo"}],
                         answer={"value":"neutrinoesclusivo"}) for r in self.rows]
        self.assertEqual(ids("neutrinoesclusivo", poisoned), [])
        for row in self.rows:
            if row.get("exam"):
                self.assertNotIn(row["id"], ids(row["id"]))
        for params in [{"q":"a" * 97}, {"page":"-1"}, {"page":"1.0"}, {"page":"10000"},
                       {"course":"X"}, {"kind":"answer"}, {"unknown":"a"}]:
            with self.assertRaises(Problem):
                search_catalog(self.rows, params)
        self.assertFalse(search_catalog(self.rows, {"page":"9999"})["items"])
