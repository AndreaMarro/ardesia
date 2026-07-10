#!/usr/bin/env python3
"""Focused tests for the secret scanner ratchet."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from collections import Counter
from pathlib import Path


SCRIPT = Path(__file__).with_name("secret_scan.py")
SPEC = importlib.util.spec_from_file_location("secret_scan", SCRIPT)
assert SPEC and SPEC.loader
secret_scan = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(secret_scan)


class SecretScanTest(unittest.TestCase):
    def test_detects_google_key_and_jwt_without_printing_values(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            sample = Path(tmp) / "sample.js"
            google_key = "AIza" + "SyDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUM"
            jwt = "eyJ" + "aaaaaaaaaaa" + "." + "bbbbbbbbbbbbb" + "." + "ccccccccccccc"
            hex_key = "0123456789abcdef" + "0123456789abcdef"
            creds_line = (
                "const " + "CREDS = { email: 'teacher@example.test', "
                "password: 'not-real-password' };"
            )
            sample.write_text(
                "\n".join(
                    [
                        f"const google = '{google_key}';",
                        f"const jwt = '{jwt}';",
                        f"const ELAB_API_KEY = process.env.ELAB_API_KEY || '{hex_key}';",
                        creds_line,
                    ]
                ),
                encoding="utf-8",
            )

            findings = secret_scan.scan_file(str(sample))

        names = [name for _, name in findings]
        self.assertIn("google-api-key", names)
        self.assertIn("generic-jwt", names)
        self.assertIn("named-hex-secret", names)
        self.assertIn("hardcoded-creds-object", names)

    def test_allowlist_is_a_counted_ratchet_not_a_global_bypass(self) -> None:
        findings = [
            ("legacy.md", "google-api-key"),
            ("legacy.md", "google-api-key"),
            ("new.md", "generic-jwt"),
        ]
        allowlist = Counter({("legacy.md", "google-api-key"): 1})

        unexpected, allowed = secret_scan.unexpected_findings(findings, allowlist)

        self.assertEqual(allowed[("legacy.md", "google-api-key")], 1)
        self.assertEqual(unexpected[("legacy.md", "google-api-key")], 1)
        self.assertEqual(unexpected[("new.md", "generic-jwt")], 1)

    def test_allowlist_parser_rejects_malformed_rows(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            allowlist = Path(tmp) / "allowlist.tsv"
            allowlist.write_text("missing-tabs\n", encoding="utf-8")

            with self.assertRaises(ValueError):
                secret_scan.load_allowlist(allowlist)


if __name__ == "__main__":
    unittest.main()
