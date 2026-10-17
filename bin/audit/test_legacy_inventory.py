#!/usr/bin/env python3
"""Contract tests on disposable repositories; no product/student data."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from legacy_inventory import InventoryError, inventory


class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git("init", "-q")
        self.put("README.md", "neutral fixture\n")
        self.commit()

    def git(self, *args):
        return subprocess.run(["git", "-C", str(self.root), *args],
                              check=True, capture_output=True).stdout

    def put(self, path, content):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, bytes):
            target.write_bytes(content)
        else:
            target.write_text(content, encoding="utf-8")

    def commit(self):
        self.git("add", ".")
        self.git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                 "commit", "-qm", "synthetic fixture")

    def build(self, content="console.log('neutral')"):
        self.put("dist/index.html", '<script src="/assets/app.js"></script>')
        self.put("dist/assets/app.js", content)
        return self.root / "dist"

    def test_finds_runtime_alias_route_and_pack_without_path_match(self):
        self.put("apps/studio/src/App.tsx",
                 'import "@elab-tutor-plugin";\nconst load = () => import("./ElabLab");\n')
        self.put("apps/studio/src/memory.ts", 'const evidence = "pack:io.elab.tutor:x";\n')
        self.put("apps/studio/src/route.ts", 'const route = "elab-lab";\n')
        self.commit()
        report = inventory(self.root)
        hits = {f["path"]: f for f in report["source"]["files"] if f["content_markers"]}
        self.assertEqual(set(hits), {"apps/studio/src/App.tsx", "apps/studio/src/memory.ts",
                                     "apps/studio/src/route.ts"})
        self.assertTrue(all(f["category"] == "SOURCE_CURRENT" for f in hits.values()))

    def test_does_not_treat_italian_elaborato_as_brand(self):
        self.put("apps/studio/src/form.ts", 'const label = "Elaborato elaborazione elaborati";\n')
        self.commit()
        report = inventory(self.root)
        self.assertEqual(report["source"]["files_with_markers"], 0)

    def test_separates_history_licence_and_runtime(self):
        self.put("docs/ops/evidence-2026-01/a.md", "ELAB historic evidence")
        self.put("plugins/elab-tutor/LICENSE", "ELAB attribution")
        self.commit()
        dist = self.build('const pack = "io.elab.tutor";')
        report = inventory(self.root, dist)
        cats = {f["path"]: f["category"] for f in report["source"]["files"]}
        self.assertEqual(cats["docs/ops/evidence-2026-01/a.md"], "HISTORIC_EVIDENCE")
        self.assertEqual(cats["plugins/elab-tutor/LICENSE"], "LICENSE_NOTICE")
        self.assertEqual(report["artifact"]["files_with_markers"], 1)
        self.assertEqual(report["artifact"]["status"], "INVENTORIED")

    def test_absent_artifact_is_not_reported_clean(self):
        report = inventory(self.root)
        self.assertEqual(report["artifact"]["status"], "NOT_RUN")
        self.assertIsNone(report["artifact"]["files_with_markers"])
        with self.assertRaises(InventoryError):
            inventory(self.root, self.root / "missing-dist")

    def test_empty_or_html_only_build_is_rejected(self):
        (self.root / "dist").mkdir()
        with self.assertRaises(InventoryError):
            inventory(self.root, self.root / "dist")
        self.put("dist/index.html", "empty shell")
        with self.assertRaises(InventoryError):
            inventory(self.root, self.root / "dist")

    def test_binary_assets_are_inventoried_with_unchecked_content(self):
        dist = self.build()
        self.put("dist/assets/elab-logo.png", b"\x89PNG\x00\xff")
        report = inventory(self.root, dist)
        file = next(f for f in report["artifact"]["files"] if f["path"].endswith(".png"))
        self.assertEqual(file["content_scan"], "BINARY_OR_NON_UTF8")
        self.assertTrue(file["path_markers"])
        self.assertEqual(len(file["sha256"]), 64)
        self.assertGreater(report["artifact"]["content_not_scanned"], 0)

    def test_never_follows_source_or_artifact_symlinks(self):
        self.put("outside.txt", "ELAB PRIVATE SENTINEL")
        (self.root / "linked.txt").symlink_to(self.root / "outside.txt")
        self.commit()
        dist = self.build()
        (dist / "linked-dir").symlink_to(self.root, target_is_directory=True)
        report = inventory(self.root, dist)
        source = next(f for f in report["source"]["files"] if f["path"] == "linked.txt")
        self.assertEqual(source["content_scan"], "SYMLINK_NOT_FOLLOWED")
        self.assertIsNone(source["sha256"])
        self.assertTrue(any(f["content_scan"] == "SYMLINK_NOT_FOLLOWED"
                            for f in report["artifact"]["files"]))

    def test_reports_dirty_checkout_and_byte_digests(self):
        clean = inventory(self.root)
        self.assertFalse(clean["repository"]["tracked_worktree_dirty"])
        self.put("README.md", "modified ELAB")
        dirty = inventory(self.root)
        self.assertTrue(dirty["repository"]["tracked_worktree_dirty"])
        self.assertNotEqual(clean["source"]["files"][0]["sha256"],
                            dirty["source"]["files"][0]["sha256"])

    def test_rejects_artifact_ancestor_symlink(self):
        self.build()
        (self.root / "linked-parent").symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(InventoryError):
            inventory(self.root, self.root / "linked-parent" / "dist")

    def test_output_symlink_and_linked_parent_cannot_overwrite_sentinel(self):
        self.put("outside/sentinel.json", "PRESERVE SYNTHETIC SENTINEL")
        (self.root / "report.json").symlink_to(self.root / "outside/sentinel.json")
        (self.root / "linked-output").symlink_to(self.root / "outside", target_is_directory=True)
        script = str(Path(__file__).with_name("legacy_inventory.py"))
        for output in ("report.json", "linked-output/sentinel.json"):
            with self.subTest(output=output):
                result = subprocess.run([sys.executable, script, "--repo", str(self.root),
                                         "--output", str(self.root / output)],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 2)
                self.assertEqual((self.root / "outside/sentinel.json").read_text(),
                                 "PRESERVE SYNTHETIC SENTINEL")

    def test_output_can_atomically_replace_regular_report(self):
        self.put("artifacts/report.json", "previous synthetic report")
        result = subprocess.run([sys.executable, str(Path(__file__).with_name("legacy_inventory.py")),
                                 "--repo", str(self.root), "--output",
                                 str(self.root / "artifacts/report.json")],
                                check=True, capture_output=True, text=True)
        report = json.loads((self.root / "artifacts/report.json").read_text())
        self.assertEqual(report["source"]["file_count"], 1)
        self.assertEqual(json.loads(result.stdout)["artifact_status"], "NOT_RUN")

    def test_dense_megabyte_finishes_and_preserves_counts_and_lines(self):
        # A generous process deadline detects the former quadratic prefix scans,
        # without asserting a machine-specific latency or a product benchmark.
        code = ("from legacy_inventory import markers; "
                "m=markers('ELAB\\n'*200000)['legacy-token']; "
                "assert m['count']==200000 and m['lines'][0]==1 "
                "and m['lines'][-1]==200000")
        subprocess.run([sys.executable, "-c", code], check=True, capture_output=True,
                       cwd=Path(__file__).parent, timeout=15)

    def test_missing_tracked_file_fails_instead_of_silent_omission(self):
        (self.root / "README.md").unlink()
        with self.assertRaises(InventoryError):
            inventory(self.root)

    def test_nested_partial_snapshot_cannot_impersonate_repository(self):
        (self.root / "nested").mkdir()
        with self.assertRaises(InventoryError):
            inventory(self.root / "nested")

    def test_cli_report_is_parseable_and_no_source_snippets_are_exported(self):
        self.put("apps/studio/src/config.ts", 'const ELAB = "PRIVATE SENTINEL";')
        self.commit()
        out = subprocess.run([sys.executable, str(Path(__file__).with_name("legacy_inventory.py")),
                              "--repo", str(self.root)], check=True, capture_output=True, text=True)
        report = json.loads(out.stdout)
        self.assertEqual(report["purpose"], "LEXICAL_INVENTORY_ONLY")
        self.assertNotIn("PRIVATE SENTINEL", out.stdout)
        self.assertTrue(report["limitations"])


if __name__ == "__main__":
    unittest.main()
