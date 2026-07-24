#!/usr/bin/env python3
"""Controlli negativi dell'inventario licenze (Action 10, porzione).

    python3 bin/convergence/test_inventory.py
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import license_inventory  # noqa: E402


def _write(root: Path, rel: str, obj) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj) if not isinstance(obj, str) else obj, encoding="utf-8")


class LicenseFromShippedFile(unittest.TestCase):
    """Campo `license` assente non vuol dire "senza licenza".

    Caso reale (24-07): `khroma@2.1.0` omette il campo e spedisce un file
    `license` con "The MIT License (MIT)". Trattarlo come ignoto produceva un
    blocco legale permanente per un errore di metadati altrui.
    """

    def _pkg(self, root: Path, filename: str, text: str) -> Path:
        d = root / "apps/studio/node_modules/khroma"
        d.mkdir(parents=True, exist_ok=True)
        _write(root, "apps/studio/node_modules/khroma/package.json",
               {"name": "khroma", "version": "2.1.0"})
        (d / filename).write_text(text, encoding="utf-8")
        return d

    def test_mit_text_in_lowercase_license_file_is_recognised(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            pkg = self._pkg(root, "license",
                            "The MIT License (MIT)\n\nPermission is hereby "
                            "granted, free of charge, to any person...\n")
            self.assertTrue(
                license_inventory.license_from_file(pkg).startswith("MIT"))

    def test_recognised_file_removes_the_unlicensed_finding(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            self._pkg(root, "license",
                      "The MIT License (MIT)\n\nPermission is hereby granted, "
                      "free of charge, to any person...\n")
            inv = license_inventory.build_inventory(root)
            self.assertEqual(inv["unlicensed"], [])

    def test_unrecognisable_text_stays_unknown(self) -> None:
        # il fallback non deve inventare: un testo che non dice nulla di
        # riconoscibile resta ignoto e quindi bloccante
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            self._pkg(root, "license", "Tutti i diritti riservati. Chiedere.\n")
            inv = license_inventory.build_inventory(root)
            self.assertEqual(inv["unlicensed"], ["khroma"])

    def test_no_license_file_stays_unknown(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            _write(root, "apps/studio/node_modules/ghost/package.json",
                   {"name": "ghost"})
            inv = license_inventory.build_inventory(root)
            self.assertEqual(inv["unlicensed"], ["ghost"])


class LicenseInventoryNegativeControls(unittest.TestCase):
    def test_missing_root_license_is_blocking(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            inv = license_inventory.build_inventory(root)
            self.assertFalse(inv["root_license_present"])
            self.assertTrue(any("LICENSE root assente" in b for b in inv["blocking"]))

    def test_present_root_license_not_blocking_on_that_ground(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            _write(root, "LICENSE", "MIT ...")
            inv = license_inventory.build_inventory(root)
            self.assertTrue(inv["root_license_present"])
            self.assertFalse(any("LICENSE root assente" in b for b in inv["blocking"]))

    def test_unlicensed_dependency_flagged(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            _write(root, "LICENSE", "MIT")
            _write(root, "apps/studio/node_modules/leftpad/package.json",
                   {"name": "leftpad"})  # nessun campo license
            inv = license_inventory.build_inventory(root)
            self.assertIn("leftpad", inv["unlicensed"])
            self.assertTrue(any("senza campo license" in b for b in inv["blocking"]))

    def test_licensed_dependency_not_flagged(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            _write(root, "LICENSE", "MIT")
            _write(root, "apps/studio/node_modules/react/package.json",
                   {"name": "react", "license": "MIT"})
            inv = license_inventory.build_inventory(root)
            self.assertEqual(inv["unlicensed"], [])
            self.assertEqual(inv["blocking"], [])
            self.assertEqual(inv["spdx_top"].get("MIT"), 1)

    def test_own_package_role_classification(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "package.json", {"name": "ardesia"})
            _write(root, "apps/studio/package.json", {"name": "studio"})
            inv = license_inventory.build_inventory(root)
            self.assertEqual(inv["own_packages"]["apps/studio/package.json"]["role"],
                             "core-studio")


if __name__ == "__main__":
    unittest.main(verbosity=2)
