#!/usr/bin/env python3
"""Controlli negativi dei receipt di fiducia (Action 5).

Il controllo che conta e' uno: un percorso di acquisizione non puo' rivendicare
garanzie che non esegue. Tutto il resto sono corollari.

    python3 bin/convergence/test_plugin_trust.py
"""
from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import plugin_trust as pt  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = pt.load_registry(ROOT)

BUILTIN = {
    "plugin_id": "io.ardesia.simulation",
    "version": "1.0.0",
    "publisher_id": "maestro-sdk",
    "acquisition_mode": "builtin-compiled",
    "trust_tier": "builtin-reviewed",
    "verified_checks": ["bundled-in-studio-build", "human-review",
                        "manifest-boundary-assertions", "closed-allowlist"],
    "source_sha": "4d697f5e13ffb28ddb72d86a81e54690c544bd92",
}

INSTALLED = {
    "plugin_id": "com.example.tool",
    "version": "0.2.0",
    "publisher_id": "example",
    "acquisition_mode": "installed-signed",
    "trust_tier": "publisher-signed",
    "verified_checks": ["manifest-signature-ed25519", "bundle-digest-sha256"],
    "bundle_digest": "e" * 64,
}


class TrustReceiptNegativeControls(unittest.TestCase):
    def _v(self, receipts: list[dict]) -> list[str]:
        return pt.validate_receipts(receipts, REGISTRY)

    # --- controllo positivo ---

    def test_honest_receipts_validate(self) -> None:
        self.assertEqual(self._v([BUILTIN, INSTALLED]), [])

    # --- il controllo che porta il peso ---

    def test_builtin_claiming_signature_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        r["verified_checks"].append("manifest-signature-ed25519")
        problems = self._v([r])
        self.assertTrue(any("non esegue" in p for p in problems), problems)

    def test_builtin_claiming_bundle_digest_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        r["verified_checks"].append("bundle-digest-sha256")
        self.assertTrue(any("non esegue" in p for p in self._v([r])))

    # --- corollari ---

    def test_tier_upgrade_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        r["trust_tier"] = "publisher-signed"
        self.assertTrue(any("trust_tier" in p for p in self._v([r])))

    def test_unknown_mode_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        r["acquisition_mode"] = "remote-yolo"
        self.assertTrue(any("sconosciuto" in p for p in self._v([r])))

    def test_missing_receipt_field_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        del r["publisher_id"]
        self.assertTrue(any("obbligatorio" in p for p in self._v([r])))

    def test_builtin_without_source_sha_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        del r["source_sha"]
        self.assertTrue(any("source_sha" in p for p in self._v([r])))

    def test_builtin_with_short_sha_rejected(self) -> None:
        r = copy.deepcopy(BUILTIN)
        r["source_sha"] = "4d697f5e"
        self.assertTrue(any("40 hex" in p for p in self._v([r])))

    def test_installed_without_bundle_digest_rejected(self) -> None:
        r = copy.deepcopy(INSTALLED)
        del r["bundle_digest"]
        self.assertTrue(any("digest" in p for p in self._v([r])))

    def test_installed_accepts_base64_digest(self) -> None:
        r = copy.deepcopy(INSTALLED)
        # l'installer reale produce base64 (btoa sui byte SHA-256)
        r["bundle_digest"] = "A" * 43 + "="
        self.assertEqual(self._v([r]), [])

    def test_duplicate_plugin_id_rejected(self) -> None:
        problems = self._v([BUILTIN, copy.deepcopy(BUILTIN)])
        self.assertTrue(any("stesso id" in p for p in problems), problems)


class SourceInvariants(unittest.TestCase):
    def test_real_source_matches_registry(self) -> None:
        # invariante vivo sul repo: il tier dichiarato nel sorgente e quello del
        # registro devono coincidere
        self.assertEqual(pt.check_source_invariants(ROOT, REGISTRY), [])

    def test_tier_drift_in_source_caught(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            rel = "apps/studio/src/toolhost/founderBetaPlugin.ts"
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            # qualcuno promuove il tier senza introdurre alcuna verifica
            p.write_text('export const FOUNDER_BETA_PLUGIN_TRUST_TIER = "verified"\n',
                         encoding="utf-8")
            problems = pt.check_source_invariants(root, REGISTRY)
            self.assertTrue(any("senza cambiare il modello" in x for x in problems),
                            problems)

    def test_missing_constant_caught(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            rel = "apps/studio/src/toolhost/founderBetaPlugin.ts"
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text("export const SOMETHING_ELSE = 1\n", encoding="utf-8")
            self.assertTrue(pt.check_source_invariants(root, REGISTRY))


class CliSurface(unittest.TestCase):
    def test_cli_rejects_dishonest_receipt_file(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "receipts.json"
            r = copy.deepcopy(BUILTIN)
            r["verified_checks"].append("manifest-signature-ed25519")
            path.write_text(json.dumps([r]), encoding="utf-8")
            self.assertEqual(pt.main(["--receipts", str(path)]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
