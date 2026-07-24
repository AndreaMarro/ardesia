#!/usr/bin/env python3
"""Controlli negativi del release manifest (Action 10).

Ogni invariante deve respingere il proprio controesempio. Costruisco un dist
sintetico, emetto il manifest, poi lo manomotto un campo alla volta: se una
manomissione passa, il gate e' teatro.

    python3 bin/convergence/test_release.py
"""
from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import release_manifest as rm  # noqa: E402

SHA = "ad8f0f9f42733bfb95dedd05b4a09734f91947f8"
OTHER_SHA = "b" * 40


def _dist(tmp: Path) -> Path:
    dist = tmp / "dist"
    (dist / "assets").mkdir(parents=True)
    # il bundle porta lo SHA sorgente, come fa il build reale via
    # __ARDESIA_GIT_SHA__ (apps/studio/vite.config.ts)
    (dist / "assets" / "index-abc.js").write_text(
        f'const SHA="{SHA}";export default SHA\n', encoding="utf-8")
    (dist / "index.html").write_text("<!doctype html><html></html>\n", encoding="utf-8")
    return dist


def _manifest(dist: Path) -> dict:
    artifacts = rm.collect_artifacts(dist)
    carriers = rm.find_provenance_carriers(dist, SHA)
    return {
        "schema_version": rm.SCHEMA_VERSION,
        "generated_at": "2026-07-24T00:00:00+00:00",
        "source": {"sha": SHA, "branch": "main", "dirty": False},
        "dist_root": "dist",
        "artifacts": artifacts,
        "artifact_tree_digest": rm.tree_digest(artifacts),
        "lockfiles": {},
        "provenance": {"source_sha_in_bundle": bool(carriers), "carriers": carriers},
        "toolchain": {},
        "gates": [],
    }


class ReleaseManifestNegativeControls(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)
        self.dist = _dist(self.tmp)
        self.manifest = _manifest(self.dist)
        self.reachable = lambda s: s == SHA

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def _validate(self, manifest: dict) -> list[str]:
        return rm.validate(manifest, root=self.tmp, dist=self.dist,
                           sha_reachable=self.reachable)

    # --- il controllo positivo: senza questo i negativi non provano nulla ---

    def test_intact_manifest_is_valid(self) -> None:
        self.assertEqual(self._validate(self.manifest), [])

    def test_carrier_actually_found(self) -> None:
        self.assertEqual(self.manifest["provenance"]["carriers"],
                         ["assets/index-abc.js"])

    # --- controlli negativi ---

    def test_unreachable_sha_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["source"]["sha"] = OTHER_SHA
        problems = self._validate(m)
        self.assertTrue(any("raggiungibile" in p for p in problems), problems)

    def test_short_sha_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["source"]["sha"] = SHA[:8]
        self.assertTrue(any("40 hex" in p for p in self._validate(m)))

    def test_dirty_tree_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["source"]["dirty"] = True
        self.assertTrue(any("sporco" in p for p in self._validate(m)))

    def test_artifact_digest_mismatch_rejected(self) -> None:
        # il byte cambia dopo l'emissione: il manifest non deve piu' validare
        (self.dist / "index.html").write_text("<!doctype html><b>x</b>\n",
                                              encoding="utf-8")
        problems = self._validate(self.manifest)
        self.assertTrue(any("digest divergente" in p for p in problems), problems)

    def test_tampered_tree_digest_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["artifact_tree_digest"] = "0" * 64
        self.assertTrue(any("artifact_tree_digest" in p for p in self._validate(m)))

    def test_undeclared_artifact_rejected(self) -> None:
        # un file comparso nel dist e non dichiarato: l'insieme servito non e'
        # piu' quello attestato
        (self.dist / "sneaky.js").write_text("//\n", encoding="utf-8")
        problems = self._validate(self.manifest)
        self.assertTrue(any("non dichiarato" in p for p in problems), problems)

    def test_missing_artifact_rejected(self) -> None:
        (self.dist / "index.html").unlink()
        problems = self._validate(self.manifest)
        self.assertTrue(any("assente su disco" in p for p in problems), problems)

    def test_provenance_false_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["provenance"] = {"source_sha_in_bundle": False, "carriers": []}
        problems = self._validate(m)
        self.assertTrue(any("da dove viene" in p for p in problems), problems)

    def test_lying_carrier_rejected(self) -> None:
        # dichiara portatore un file che NON contiene lo SHA
        m = copy.deepcopy(self.manifest)
        m["provenance"]["carriers"] = ["index.html"]
        problems = self._validate(m)
        self.assertTrue(any("dichiarato portatore" in p for p in problems), problems)

    def test_provenance_true_without_carriers_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["provenance"]["carriers"] = []
        self.assertTrue(any("senza portatori" in p for p in self._validate(m)))

    def test_lockfile_digest_mismatch_rejected(self) -> None:
        lock = self.tmp / "apps/studio/package-lock.json"
        lock.parent.mkdir(parents=True, exist_ok=True)
        lock.write_text('{"lockfileVersion":3}\n', encoding="utf-8")
        m = copy.deepcopy(self.manifest)
        m["lockfiles"] = {"apps/studio/package-lock.json": "0" * 64}
        self.assertTrue(any("lockfile" in p for p in self._validate(m)))

    def test_wrong_schema_version_rejected(self) -> None:
        m = copy.deepcopy(self.manifest)
        m["schema_version"] = 99
        self.assertTrue(any("schema_version" in p for p in self._validate(m)))

    def test_check_cli_reports_failure(self) -> None:
        path = self.tmp / "rel.json"
        m = copy.deepcopy(self.manifest)
        m["source"]["dirty"] = True
        path.write_text(json.dumps(m), encoding="utf-8")
        self.assertEqual(rm.main(["--root", str(self.tmp), "--check", str(path),
                                  "--dist", str(self.dist)]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
