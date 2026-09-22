#!/usr/bin/env python3
"""Verify the publication inventory without extracting or executing evidence."""
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import zipfile


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    here = Path(__file__).resolve().parent
    root = here.parents[3]
    manifest = json.loads((here / "manifest.json").read_text())
    index = json.loads((here.parent / "index.json").read_text())
    require(manifest["schema_version"] == index["schema_version"] == 1,
            "Unsupported schema version")
    require(manifest["snapshot_commit"] == index["source_snapshot"],
            "Snapshot identities differ")
    members = {}
    for archive in manifest["archives"]:
        path = root / archive["path"]
        data = path.read_bytes()
        require(sha256(data) == archive["sha256"], f"Archive hash: {path}")
        require(len(data) == archive["size_bytes"], f"Archive size: {path}")
        with zipfile.ZipFile(path) as bundle:
            expected = {entry["path"]: entry for entry in archive["files"]}
            names = bundle.namelist()
            require(len(expected) == len(archive["files"]), "Duplicate manifest member")
            require(len(names) == len(set(names)), "Duplicate ZIP member")
            require(set(names) == set(expected), "Archive inventory differs")
            for name in names:
                relative = PurePosixPath(name)
                require(not relative.is_absolute() and ".." not in relative.parts,
                        f"Unsafe archive member: {name}")
                require(name not in members, f"Member repeated across archives: {name}")
                raw = bundle.read(name)
                entry = expected[name]
                require(sha256(raw) == entry["sha256"], f"Member hash: {name}")
                require(len(raw) == entry["size_bytes"], f"Member size: {name}")
                require(raw.count(b"\0") == entry["nul_count"], f"Member NUL count: {name}")
                if name.startswith("docs/"):
                    original = subprocess.check_output(
                        ["git", "show", f'{manifest["snapshot_commit"]}:{name}'], cwd=root)
                    require(raw == original, f"Not the Git original: {name}")
                members[name] = raw
    for copy in manifest["reading_copies"]:
        name = copy["path"]
        raw = members[name]
        current = (root / name).read_bytes()
        normalized = b"\n".join(line.rstrip(b" \t\r") for line in raw.split(b"\n"))
        normalized = normalized.rstrip(b"\n") + b"\n"
        require(sha256(raw) == copy["original_sha256"], f"Original hash: {name}")
        require(sha256(current) == copy["reading_copy_sha256"], f"Reading hash: {name}")
        require(current == normalized, f"More than whitespace changed: {name}")
    commands = (here / "commands.jsonl").read_bytes()
    require(commands == members["artifacts/restart/commands.jsonl"], "Command copy differs")
    records = [json.loads(line) for line in commands.splitlines()]
    require(len(records) == manifest["command_records"], "Command count differs")
    require(len({r["name"] for r in records}) == len(records), "Duplicate command name")
    for record in records:
        require(f'artifacts/restart/{record["name"]}.log' in members,
                f'Missing command log: {record["name"]}')
    for key, value in index.items():
        if key.endswith("_path"):
            require((root / value).is_file(), f"Index target absent: {value}")
    for unit in index["units"]:
        require((root / unit["review_path"]).is_file(), f'Review absent: {unit["id"]}')
        subprocess.run(["git", "cat-file", "-e", unit["change_commit"] + "^{commit}"],
                       cwd=root, check=True)
    print(f"PASS: {len(members)} original files, {len(records)} command logs, "
          f'{len(manifest["reading_copies"])} reading copies, {len(index["units"])} units')


if __name__ == "__main__":
    main()
