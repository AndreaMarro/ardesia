#!/usr/bin/env python3
"""Controlli negativi del boundary checker (Action 3).

Ogni regola deve respingere il proprio controesempio. Costruisco alberi
sintetici in una tmpdir con la struttura del repo e verifico che `scan` colga
la violazione iniettata e che un file pulito passi. Questo e' l'oracolo che
prova che il gate MORDE: senza, sarebbe teatro.

    python3 bin/convergence/test_boundary.py
"""
from __future__ import annotations

import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import boundary_check  # noqa: E402


def _write(root: Path, rel: str, content: str) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


class BoundaryNegativeControls(unittest.TestCase):
    def _scan_one(self, rel: str, content: str) -> list[dict]:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, rel, content)
            return boundary_check.scan(root)

    def test_lessonos_readall_caught(self) -> None:
        v = self._scan_one(
            "apps/studio/src/lessonos/continuityLoader.ts",
            "const rows = await store.readAll()\n",
        )
        self.assertTrue(any(x["rule"] == "LESSONOS-NO-READALL" for x in v), v)

    def test_flat_path_caught(self) -> None:
        v = self._scan_one(
            "apps/studio/src/lessonos/continuityReader.ts",
            "const blob = await store.read(PATHS.JOURNAL)\n",
        )
        self.assertTrue(any(x["rule"] == "NO-FLAT-PATH" for x in v), v)

    def test_pack_runtime_import_caught(self) -> None:
        v = self._scan_one(
            "packs/elab-tutor/src/thing.ts",
            'import { createClient } from "@supabase/supabase-js"\n',
        )
        self.assertTrue(any(x["rule"] == "PACK-NO-RUNTIME" for x in v), v)

    def test_view_driver_import_caught(self) -> None:
        v = self._scan_one(
            "apps/studio/src/design/BadView.tsx",
            'import { FsaDriver } from "../store/drivers/fsa"\n',
        )
        self.assertTrue(any(x["rule"] == "VIEW-NO-DRIVER" for x in v), v)

    def test_plugin_storage_caught(self) -> None:
        v = self._scan_one(
            "plugins/rogue/src/index.ts",
            "const log = createEventLogStore()\n",
        )
        self.assertTrue(any(x["rule"] == "PLUGIN-NO-LESSONOS-STORAGE" for x in v), v)

    def test_clean_file_passes(self) -> None:
        v = self._scan_one(
            "apps/studio/src/lessonos/continuityLoader.ts",
            "const rows = await reader.readEnvelopesBySession(lessonId, sessionId)\n",
        )
        self.assertEqual(v, [], v)

    def test_test_files_excluded(self) -> None:
        # una violazione dentro un file .test. non deve essere segnalata
        v = self._scan_one(
            "apps/studio/src/lessonos/continuityLoader.test.ts",
            "const rows = await store.readAll()\n",
        )
        self.assertEqual(v, [], v)

    def test_line_comment_excluded(self) -> None:
        v = self._scan_one(
            "apps/studio/src/lessonos/continuityLoader.ts",
            "// vietato: non usare store.readAll() qui\n",
        )
        self.assertEqual(v, [], v)

    def test_readme_not_scanned(self) -> None:
        # i .md non sono codice: la prosa che nomina supabase non e' una violazione
        v = self._scan_one(
            "packs/elab-tutor/README.md",
            "non importare supabase in un Pack\n",
        )
        self.assertEqual(v, [], v)

    def test_json_mode_emits_one_parseable_document(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(
                root,
                boundary_check.BASELINE_PATH,
                '{"schema_version": 1, "violations": []}\n',
            )
            stdout = io.StringIO()
            with contextlib.redirect_stdout(stdout):
                result = boundary_check.main(["--root", d, "--json"])

        self.assertEqual(0, result)
        self.assertEqual(
            {"total": 0, "baseline": 0, "new": []},
            json.loads(stdout.getvalue()),
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
