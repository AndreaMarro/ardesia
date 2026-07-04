#!/usr/bin/env python3
"""Fail if any tracked text file matches a high-confidence secret pattern.

Deliberately narrow patterns: this is a tripwire for real credentials,
not a linter. Widen only with a matching allowlist entry review.
"""
from __future__ import annotations

import re
import subprocess
import sys

PATTERNS = [
    ("private-key-block", re.compile(rb"-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----")),
    ("aws-access-key", re.compile(rb"\bAKIA[0-9A-Z]{16}\b")),
    ("github-token", re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{36,}\b")),
    ("slack-token", re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("openai-key", re.compile(rb"\bsk-[A-Za-z0-9_-]{32,}\b")),
    ("stripe-live-key", re.compile(rb"\bsk_live_[A-Za-z0-9]{16,}\b")),
    ("supabase-service-role", re.compile(rb"\bservice_role['\"]?\s*[:=]\s*['\"]eyJ")),
]

SKIP_DIR_PARTS = ("node_modules/", "dist/", "dist-test/", ".git/")

TEXT_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".md", ".json",
    ".yml", ".yaml", ".html", ".css", ".sh", ".sql", ".txt", ".env",
    ".toml", ".cfg", ".ini", ".xml", ".csv",
}


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z"], check=True, capture_output=True
    ).stdout
    return [p.decode() for p in out.split(b"\x00") if p]


def main() -> int:
    findings = []
    for path in tracked_files():
        if any(part in path for part in SKIP_DIR_PARTS):
            continue
        dot = path.rfind(".")
        if dot == -1 or path[dot:].lower() not in TEXT_EXTENSIONS:
            continue
        try:
            with open(path, "rb") as fh:
                content = fh.read()
        except FileNotFoundError:
            continue
        for name, pattern in PATTERNS:
            if pattern.search(content):
                findings.append((path, name))
    if findings:
        print("Potential secrets in tracked files:")
        for path, name in findings:
            print(f"  {path}: {name}")
        return 1
    print("secret_scan: OK (no high-confidence secret patterns)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
