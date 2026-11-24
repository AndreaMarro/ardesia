import unittest
import tempfile
from pathlib import Path
import zipfile
from tools.package_release import included
from tools.corpus_engineering.release_check import check


class ReleaseBoundary(unittest.TestCase):
    def test_drafts_and_editorial_sources_are_not_distributed(self):
        for path in ("editorial/batches/units-001.json", "editorial/assets/corpus-area-units.svg",
                     "tools/corpus_engineering/units_authoring.py", "tests/corpus/test_units.py"):
            with self.subTest(path=path): self.assertFalse(included(path))
        for path in ("server/editor.py", "content/C1.json", "tools/validate_bank.py", "app.py"):
            with self.subTest(path=path): self.assertTrue(included(path))

    def test_real_release_keeps_the_existing_editorial_runtime(self):
        with tempfile.TemporaryDirectory() as home:
            file = Path(home)/"release.zip"
            with zipfile.ZipFile(file, "w") as package:
                package.writestr("officina-di-fisica/content/C1.json", "[]")
                package.writestr("officina-di-fisica/server/editorial/service.py", "# Canonical runtime")
            self.assertEqual(check(file)["draftSourcesInRelease"], 0)
