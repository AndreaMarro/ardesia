#!/usr/bin/env python3
"""Fail if any tracked text file contains a NUL byte (corruption guard)."""
from __future__ import annotations

import subprocess
import sys

# Files that legitimately embed raw control bytes (e.g. property tests
# feeding literal NUL input). Keep this list justified and short.
ALLOWLIST: set[str] = set()

TEXT_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".md", ".json",
    ".yml", ".yaml", ".html", ".css", ".sh", ".sql", ".txt", ".svg", ".env",
    ".toml", ".cfg", ".ini", ".xml", ".csv",
}


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z"], check=True, capture_output=True
    ).stdout
    return [p.decode() for p in out.split(b"\x00") if p]


def main() -> int:
    offenders = []
    for path in tracked_files():
        if path in ALLOWLIST:
            continue
        dot = path.rfind(".")
        if dot == -1 or path[dot:].lower() not in TEXT_EXTENSIONS:
            continue
        try:
            with open(path, "rb") as fh:
                if b"\x00" in fh.read():
                    offenders.append(path)
        except FileNotFoundError:
            continue
    if offenders:
        print("NUL bytes found in tracked text files:")
        for path in offenders:
            print(f"  {path}")
        return 1
    print("nul_scan: OK (no NUL bytes in tracked text files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
