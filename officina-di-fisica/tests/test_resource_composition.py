"""The opt-in resource client must reuse, and never overwrite, the native bench.

For an exact scientific candidate, repeat with (comma-separated full Git SHAs):
    CRIC_COMPOSITION_REFS=<canonical>,<scientific> python3 -m unittest tests.test_resource_composition -v
This checks composition and JavaScript syntax, not the scientific validity of a
changed runtime. The resource browser journey is a separate consumer test.
"""

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from multidiscipline import frontend, resource_frontend
from multidiscipline.resource_frontend import compose_resource_bench


ROOT = Path(__file__).resolve().parents[1]
BENCH = ROOT / "static/js/banchi/banco.js"


class ResourceComposition(unittest.TestCase):
    def test_all_entry_points_compile_on_current_and_requested_native_sources(self):
        node = shutil.which("node")
        self.assertIsNotNone(node)
        refs = ["working-tree", *filter(None, os.environ.get("CRIC_COMPOSITION_REFS", "").split(","))]
        native_names = ("index.html", "js/app.js", "js/account.js", "js/banchi/banco.js")
        for ref in refs:
            with self.subTest(ref=ref), tempfile.TemporaryDirectory(prefix="cric-native-hooks-") as folder:
                native = Path(folder)
                for name in native_names:
                    source = ((ROOT / "static" / name).read_bytes() if ref == "working-tree" else
                              subprocess.check_output(["git", "show", ref + ":officina-di-fisica/static/" + name], cwd=ROOT))
                    target = native / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(source)
                try:
                    with patch.object(frontend, "_STATIC", native), patch.object(resource_frontend, "_BENCH", native / "js/banchi/banco.js"):
                        frontend.compose_asset.cache_clear()
                        resource_frontend.resource_bench_asset.cache_clear()
                        for name in frontend.PUBLIC_ASSETS:
                            asset = frontend.public_asset(name)
                            self.assertTrue(asset, name)
                            if name.endswith(".js"):
                                parsed = subprocess.run([node, "--input-type=module", "--check"], input=asset, capture_output=True)
                                self.assertEqual(parsed.returncode, 0, name + ": " + parsed.stderr.decode())
                finally:
                    frontend.compose_asset.cache_clear()
                    resource_frontend.resource_bench_asset.cache_clear()

    def test_opt_in_source_does_not_change_native_files(self):
        paths = [BENCH, ROOT / "static/js/app.js", ROOT / "static/js/banchi/aula.js"]
        before = {p: p.read_bytes() for p in paths}
        generated = compose_resource_bench().decode()
        self.assertEqual({p: p.read_bytes() for p in paths}, before)
        self.assertNotEqual(generated.encode(), before[BENCH])
        self.assertIn("export async function benchPage(id, origin, topicIndex, options = {})", generated)
        # The composed URL must resolve dependencies to their existing singleton
        # modules; serving a second ui.js would split account/application state.
        self.assertIn("from '/js/ui.js'", generated)
        self.assertIn("from '/js/banchi/misure.js'", generated)
        self.assertIn("import('/js/banchi/scene/' + pilot + '.js')", generated)
        self.assertIsNone(re.search(r"(?:from\s+|import\(\s*)['\"]\.\.?/", generated))

    def test_changed_and_ambiguous_native_hooks_fail_closed(self):
        source = BENCH.read_text()
        declaration = "export async function benchPage(id, origin, topicIndex) {"
        for altered in (source.replace(declaration, declaration.replace("id,", "key,"), 1),
                        source + "\n" + declaration):
            with self.subTest(kind="missing" if altered.count(declaration) == 0 else "ambiguous"):
                with self.assertRaisesRegex(ValueError, "hook needs review"):
                    compose_resource_bench(altered)

    def test_native_and_requested_scientific_sources_compile(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "Node is required to verify the generated browser module.")
        sources = [("working-tree", BENCH.read_bytes())]
        requested = os.environ.get("CRIC_COMPOSITION_REFS", "")
        for ref in filter(None, requested.split(",")):
            self.assertRegex(ref, r"^[0-9a-f]{40}$", "Pin full commit SHAs, not moving refs.")
            source = subprocess.check_output(
                ["git", "show", ref + ":officina-di-fisica/static/js/banchi/banco.js"], cwd=ROOT)
            sources.append((ref, source))
        evidence = []
        for ref, native in sources:
            with self.subTest(ref=ref):
                generated = compose_resource_bench(native.decode())
                parsed = subprocess.run([node, "--input-type=module", "--check"],
                                        input=generated, capture_output=True)
                self.assertEqual(parsed.returncode, 0, parsed.stderr.decode())
                evidence.append({"ref": ref, "nativeSha256": hashlib.sha256(native).hexdigest(),
                                 "composedSha256": hashlib.sha256(generated).hexdigest(),
                                 "javascriptSyntax": "PASS"})
        if requested:
            print(json.dumps({"resourceComposition": evidence}, sort_keys=True))


if __name__ == "__main__":
    unittest.main()
