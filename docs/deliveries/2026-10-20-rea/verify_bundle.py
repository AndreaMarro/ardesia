#!/usr/bin/env python3
"""Verify the delivery ZIP without extracting or executing its contents."""
import hashlib
import json
from pathlib import PurePosixPath
import sys
import zipfile


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 verify_bundle.py ARDESIA_REA_2026-10-20_CONSEGNA.zip")
    with zipfile.ZipFile(sys.argv[1]) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise SystemExit("FAIL: duplicate archive members")
        for name in names:
            path = PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts or "\\" in name:
                raise SystemExit("FAIL: unsafe archive path")
        manifest = json.loads(archive.read("MANIFEST.json"))
        expected = {item["path"]: item for item in manifest["files"]}
        if len(expected) != len(manifest["files"]):
            raise SystemExit("FAIL: duplicate manifest paths")
        if set(names) != set(expected) | {"MANIFEST.json"}:
            raise SystemExit("FAIL: archive and manifest inventories differ")
        for name, item in expected.items():
            raw = archive.read(name)
            if len(raw) != item["bytes"] or hashlib.sha256(raw).hexdigest() != item["sha256"]:
                raise SystemExit("FAIL: size or SHA-256 mismatch: " + name)
        print(f"PASS: {len(expected)} files match the manifest.")
        print("Source commit:", manifest["sourceCommit"])
        print("State:", manifest["status"])
        print("Integrity does not certify product correctness or author identity.")


if __name__ == "__main__":
    main()
