#!/usr/bin/env python3
"""Controlli negativi del ratchet sulle dipendenze dell'ospite (Action 6).

Due invarianti da provare per controesempio:
  1. una dipendenza che diventa raggiungibile dal bundle Founder fallisce;
  2. una dipendenza aggiunta al package.json senza classificazione fallisce.

E un controllo di metodo che conta quanto i due: se la risoluzione degli import
si rompe in silenzio, la chiusura transitiva si svuota e il gate diventa verde
per il motivo sbagliato.

    python3 bin/convergence/test_guest_deps.py
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import guest_deps as gd  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]


def _write(root: Path, rel: str, content: str) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def _fake_guest(root: Path, deps: dict[str, str], entry_body: str,
                extra: dict[str, str] | None = None) -> None:
    g = f"{gd.GUEST}"
    _write(root, f"{g}/package.json", json.dumps({"dependencies": deps}))
    _write(root, f"{g}/src/plugin/renderEmbeddable.jsx", entry_body)
    for rel in ("src/data/experiments-vol1.js", "src/data/experiments-index.js",
                "src/data/experiment-visibility.js"):
        _write(root, f"{g}/{rel}", "export default {}\n")
    for rel, body in (extra or {}).items():
        _write(root, f"{g}/{rel}", body)


class MethodSanity(unittest.TestCase):
    def test_package_of(self) -> None:
        self.assertEqual(gd.package_of("@codemirror/view"), "@codemirror/view")
        self.assertEqual(gd.package_of("react-dom/client"), "react-dom")
        self.assertIsNone(gd.package_of("./local"))
        self.assertIsNone(gd.package_of("node:fs"))

    def test_specifier_forms(self) -> None:
        text = (
            "import { a } from 'react'\n"
            "import 'side-effect'\n"
            "const b = require('cjs-pkg')\n"
            "const c = await import('dyn-pkg')\n"
            "export { d } from '@scope/pkg'\n"
        )
        found = {gd.package_of(s) for s in gd.specifiers(text)}
        self.assertEqual(found, {"react", "side-effect", "cjs-pkg", "dyn-pkg",
                                 "@scope/pkg"})

    def test_relative_import_is_followed(self) -> None:
        # se questo test fallisce, la chiusura si svuota e ogni altro verde
        # e' un falso negativo
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _fake_guest(
                root,
                deps={"deep-pkg": "^1.0.0"},
                entry_body="import X from '../components/Deep'\n",
                extra={"src/components/Deep.jsx": "import 'deep-pkg'\n"},
            )
            packages, files, missing = gd.reachable(root / gd.GUEST)
            self.assertEqual(missing, [])
            self.assertIn("deep-pkg", packages)
            self.assertEqual(len(files), 5)

    def test_missing_entry_point_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, f"{gd.GUEST}/package.json", json.dumps({"dependencies": {}}))
            _, _, missing = gd.reachable(root / gd.GUEST)
            self.assertEqual(len(missing), len(gd.ENTRY_POINTS))


class RatchetNegativeControls(unittest.TestCase):
    def _root(self, deps: dict[str, str], entry: str,
              baseline: dict, extra: dict[str, str] | None = None) -> Path:
        root = Path(tempfile.mkdtemp())
        _fake_guest(root, deps, entry, extra)
        _write(root, gd.BASELINE_PATH, json.dumps(baseline))
        return root

    def test_stable_surface_passes(self) -> None:
        root = self._root(
            deps={"react": "^19", "express": "^4"},
            entry="import 'react'\n",
            baseline={"in_founder_bundle": ["react"], "standalone_only": ["express"]},
        )
        self.assertEqual(gd.check(root), [])

    def test_dependency_entering_the_bundle_fails(self) -> None:
        # express era confinata allo standalone e ora l'entry la importa
        root = self._root(
            deps={"react": "^19", "express": "^4"},
            entry="import 'react'\nimport 'express'\n",
            baseline={"in_founder_bundle": ["react"], "standalone_only": ["express"]},
        )
        failures = gd.check(root)
        self.assertTrue(any("promossa da standalone-only" in f for f in failures),
                        failures)

    def test_brand_new_dependency_in_bundle_fails(self) -> None:
        root = self._root(
            deps={"react": "^19", "brand-new": "^1"},
            entry="import 'react'\nimport 'brand-new'\n",
            baseline={"in_founder_bundle": ["react"], "standalone_only": []},
        )
        failures = gd.check(root)
        self.assertTrue(any("nuova dipendenza" in f for f in failures), failures)

    def test_unclassified_dependency_fails_even_if_unused(self) -> None:
        # aggiunta al package.json ma mai importata: nessun altro gate la vede
        root = self._root(
            deps={"react": "^19", "silent-newcomer": "^1"},
            entry="import 'react'\n",
            baseline={"in_founder_bundle": ["react"], "standalone_only": []},
        )
        failures = gd.check(root)
        self.assertTrue(any("non e' classificata" in f for f in failures), failures)

    def test_removing_a_dependency_passes(self) -> None:
        # lo strangler deve poter restringere senza attrito
        root = self._root(
            deps={"react": "^19"},
            entry="import 'react'\n",
            baseline={"in_founder_bundle": ["react"], "standalone_only": ["express"]},
        )
        self.assertEqual(gd.check(root), [])

    def test_broken_entry_surface_fails(self) -> None:
        root = Path(tempfile.mkdtemp())
        _write(root, f"{gd.GUEST}/package.json", json.dumps({"dependencies": {}}))
        _write(root, gd.BASELINE_PATH, json.dumps(
            {"in_founder_bundle": [], "standalone_only": []}))
        failures = gd.check(root)
        self.assertTrue(any("entry point" in f for f in failures), failures)


class LiveRepo(unittest.TestCase):
    def test_current_surface_is_clean(self) -> None:
        self.assertEqual(gd.check(ROOT), [])

    def test_measured_surface_is_small_and_declared(self) -> None:
        current = gd.analyse(ROOT)
        # il fatto misurato il 24-07: la superficie ospite nel bundle e' minima
        self.assertEqual(current["in_founder_bundle"], ["react", "react-dom"])
        self.assertEqual(current["reachable_not_declared"], [])
        self.assertEqual(current["missing_entry_points"], [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
