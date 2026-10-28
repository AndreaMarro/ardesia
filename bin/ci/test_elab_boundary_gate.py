"""Adversarial fixtures for the removed-product import boundary."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('boundary', Path(__file__).with_name('elab_boundary_gate.py'))
boundary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(boundary)


class RemovedProductBoundaryTests(unittest.TestCase):
    def check_source(self, relative, source):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(source)
            return boundary.violations(root)

    def test_removed_directories_fail_even_when_empty(self):
        for relative in boundary.REMOVED_ROOTS:
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                (root / relative).mkdir(parents=True)
                self.assertTrue(boundary.violations(root))

    def test_static_dynamic_require_css_and_disguised_sim_imports_fail(self):
        for source in (
            'import Canvas from "@elab-tutor-plugin/components/Canvas"',
            'const pack = import("@elab-pack/data/volume.js")',
            'const scene = require("../../sim/elab/elabScene")',
            '@import "../../plugins/elab-tutor/src/styles.css";',
            'import Legacy from "./design/ElabLab"',
            'const load = import(\n"./design/ElabLab"\n)',
            'const id = "io.elab.tutor"',
            '<div data-elab-core-canvas="mounted" />',
        ):
            with self.subTest(source=source):
                self.assertTrue(self.check_source('apps/studio/src/DisguisedSim.tsx', source))

    def test_build_aliases_and_root_commands_fail(self):
        for relative in ('apps/studio/vite.config.ts', 'package.json', 'bin/monorepo.sh'):
            self.assertTrue(self.check_source(relative, '"plugins/elab-tutor/package.json"'))

    def test_sdk_and_independent_science_imports_pass(self):
        self.assertEqual(self.check_source('apps/studio/src/Science.ts', 'import { ToolHost } from "./toolhost/host"'), [])


if __name__ == '__main__':
    unittest.main()
