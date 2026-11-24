import unittest
from tools.package_release import included


class ReleaseBoundary(unittest.TestCase):
    def test_drafts_and_editorial_sources_are_not_distributed(self):
        for path in ("editorial/batches/units-001.json", "editorial/assets/corpus-area-units.svg",
                     "tools/corpus_engineering/units_authoring.py", "tests/corpus/test_units.py"):
            with self.subTest(path=path): self.assertFalse(included(path))
        for path in ("server/editor.py", "content/C1.json", "tools/validate_bank.py", "app.py"):
            with self.subTest(path=path): self.assertTrue(included(path))
