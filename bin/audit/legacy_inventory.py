#!/usr/bin/env python3
"""Inventory legacy markers in tracked files and an optional built Studio.

P0-A evidence, not an absence certificate or dependency-graph verifier.
Exit 0 means the inventory completed, even when markers are present.
Missing requested artifacts or unreadable tracked files fail with exit 2.
No source snippets, file contents, credentials, or network requests are emitted.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
from io import StringIO
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

MAX_CONTENT_BYTES = 8 * 1024 * 1024
MARKERS = {
    "legacy-token": re.compile(r"(?<![A-Za-z0-9])elab(?=$|[^A-Za-z0-9])", re.I),
    # Camel-case symbols, but not Italian words such as 'Elaborato'.
    "legacy-symbol": re.compile(r"(?<![A-Z])(?:ELAB[A-Za-z0-9_]*|Elab(?=[A-Z])[A-Za-z0-9_]*)"),
    "legacy-brand": re.compile(r"\b(?:ELABTutor|Galileo|UNLIM|Omaric)\b", re.I),
}


class InventoryError(RuntimeError):
    pass


def git(root: Path, *args: str) -> bytes:
    result = subprocess.run(["git", "-C", str(root), *args], capture_output=True)
    if result.returncode:
        # Do not copy stderr, which may contain sensitive local configuration.
        raise InventoryError(f"git {args[0]} failed (exit {result.returncode})")
    return result.stdout


def category(path: str) -> str:
    low = path.lower()
    parts = Path(low).parts
    if re.search(r"(^|/)(licen[cs]e|notice|copying)([./_-]|$)", low):
        return "LICENSE_NOTICE"
    if any(p in {"archive", "_archive", "evidence", "audits"} or p.startswith("evidence-")
           for p in parts):
        return "HISTORIC_EVIDENCE"
    if any(p in {"__tests__", "tests", "test", "fixtures", "e2e", "eval"} for p in parts) \
            or re.search(r"\.(test|spec)\.", low):
        return "TEST_FIXTURE"
    if low.startswith(("plugins/elab-tutor/", "packs/elab-tutor/")):
        return "LEGACY_SOURCE"
    if low.startswith(("docs/", "bin/", "scripts/", "ops/", ".github/")) \
            or low.endswith(".md"):
        return "GOVERNANCE_TOOLING"
    return "SOURCE_CURRENT"


def markers(text: str) -> dict:
    result = {}
    for number, line in enumerate(StringIO(text), 1):
        for name, pattern in MARKERS.items():
            count = sum(1 for _ in pattern.finditer(line))
            if count:
                found = result.setdefault(name, {"count": 0, "lines": []})
                found["count"] += count
                found["lines"].append(number)
    return result


def reject_symlink_path(path: Path) -> Path:
    if ".." in path.parts:
        raise InventoryError("parent traversal is not supported")
    absolute = path.absolute()
    current = Path(absolute.anchor)
    for part in absolute.parts[1:]:
        current /= part
        if current.is_symlink():
            raise InventoryError("symlink in requested path is not supported")
    return absolute


def write_report(path: Path, rendered: str) -> None:
    target = reject_symlink_path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=target.parent,
                                         prefix=".legacy-inventory-", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(rendered)
        reject_symlink_path(target)
        os.replace(temporary, target)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def record(root: Path, relative: str, scope: str, mode: str | None = None,
           blob_sha: str | None = None) -> dict:
    rel = Path(relative)
    if rel.is_absolute() or ".." in rel.parts:
        raise InventoryError("path outside scan root")
    item = {"path": relative, "category": scope, "git_blob_sha": blob_sha,
            "bytes": None, "sha256": None, "content_scan": None,
            "path_markers": markers(relative), "content_markers": {}}
    target = root
    for part in rel.parts:
        target = target / part
        if target.is_symlink():
            item["content_scan"] = "SYMLINK_NOT_FOLLOWED"
            return item
    if mode == "160000":
        item["content_scan"] = "GITLINK_NOT_FOLLOWED"
        return item
    if mode == "120000":
        raise InventoryError(f"tracked symlink is not present as a symlink: {relative}")
    if not target.is_file():
        raise InventoryError(f"missing or non-regular file: {relative}")
    try:
        size = target.stat().st_size
        item["bytes"] = size
        digest = hashlib.sha256()
        content = bytearray()
        with target.open("rb") as stream:
            while chunk := stream.read(1024 * 1024):
                digest.update(chunk)
                if size <= MAX_CONTENT_BYTES:
                    content.extend(chunk)
                    if len(content) > MAX_CONTENT_BYTES:
                        raise InventoryError(f"file changed size during scan: {relative}")
        item["sha256"] = digest.hexdigest()
        if size > MAX_CONTENT_BYTES:
            item["content_scan"] = "SIZE_LIMIT"
            return item
        if len(content) != size:
            raise InventoryError(f"file changed size during scan: {relative}")
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = None
        if text is None or "\x00" in text:
            item["content_scan"] = "BINARY_OR_NON_UTF8"
        else:
            item["content_scan"] = "UTF8_LEXICAL"
            item["content_markers"] = markers(text)
        return item
    except OSError as exc:
        raise InventoryError(f"cannot read file: {relative} ({type(exc).__name__})") from exc


def summary(files: list[dict]) -> dict:
    return {"status": "INVENTORIED", "file_count": len(files),
            "files_with_markers": sum(bool(f["path_markers"] or f["content_markers"])
                                      for f in files),
            "content_not_scanned": sum(f["content_scan"] != "UTF8_LEXICAL" for f in files),
            "categories": dict(sorted(Counter(f["category"] for f in files).items())),
            "files": files}


def inventory(repo: Path, artifact_root: Path | None = None) -> dict:
    root = repo.resolve()
    actual = Path(os.fsdecode(git(root, "rev-parse", "--show-toplevel")).strip()).resolve()
    if root != actual:
        raise InventoryError("--repo must name the full repository root, not a partial subtree")
    head = git(root, "rev-parse", "HEAD").decode("ascii").strip()
    if not re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", head):
        raise InventoryError("invalid checkout SHA")
    tracked = git(root, "ls-files", "--stage", "-z")
    files = []
    for raw in tracked.split(b"\x00"):
        if not raw:
            continue
        meta, path = raw.split(b"\t", 1)
        mode, sha, stage = meta.decode("ascii").split()
        if stage != "0":
            raise InventoryError("unmerged index; resolve the conflict before inventory")
        name = os.fsdecode(path)
        files.append(record(root, name, category(name), mode, sha))
    if not files:
        raise InventoryError("empty tracked source inventory")
    files.sort(key=lambda f: f["path"])
    artifact = {"status": "NOT_RUN", "file_count": None, "files_with_markers": None,
                "content_not_scanned": None, "files": []}
    if artifact_root is not None:
        requested = artifact_root if artifact_root.is_absolute() else root / artifact_root
        artifact_base = reject_symlink_path(requested)
        if not artifact_base.is_relative_to(root):
            raise InventoryError("artifact directory must be within the repository")
        if not artifact_base.is_dir():
            raise InventoryError("requested artifact directory is missing")
        built = []
        def walk_error(error):
            raise InventoryError(f"cannot enumerate artifact ({type(error).__name__})")
        for parent, dirs, names in os.walk(artifact_base, followlinks=False, onerror=walk_error):
            dirs.sort()
            for name in list(dirs):
                target = Path(parent) / name
                if target.is_symlink():
                    names.append(name)
                    dirs.remove(name)
            for name in sorted(names):
                relative = (Path(parent) / name).relative_to(artifact_base).as_posix()
                built.append(record(artifact_base, relative, "RUNTIME_DISTRIBUTION"))
        built.sort(key=lambda f: f["path"])
        scanned = {f["path"] for f in built if f["content_scan"] == "UTF8_LEXICAL"}
        if "index.html" not in scanned or not any(p.endswith((".js", ".mjs")) for p in scanned):
            raise InventoryError("artifact requires readable index.html and at least one JavaScript file")
        artifact = summary(built)
        artifact["root"] = os.path.relpath(artifact_base, root)
    return {"schema_version": 1, "purpose": "LEXICAL_INVENTORY_ONLY",
            "repository": {"checkout_sha": head,
                           "tracked_worktree_dirty": bool(git(root, "status", "--porcelain",
                                                              "--untracked-files=no"))},
            "source": summary(files), "artifact": artifact,
            "limitations": [
                "Source is the tracked worktree, not all Git history or untracked files.",
                "Markers are lexical leads; comments and inactive code may match.",
                "No transitive import graph, alias resolution, licence or ownership verdict.",
                "Binary, oversized, symlink and gitlink content needs separate review.",
                "No OCR, escaped/encoded marker detection or visual brand certification.",
                "Artifact hashes describe observed bytes; the scanner does not prove which source built them.",
                "Artifact prerequisites are readable index.html and one JS file, not entrypoint or dependency closure validation.",
                "Run on a stable checkout; concurrent file or directory replacement is not isolated.",
                "Exit 0 and zero marker matches never certify runtime decoupling."]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--artifact-root", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        report = inventory(args.repo, args.artifact_root)
        rendered = json.dumps(report, indent=2, sort_keys=True, ensure_ascii=True) + "\n"
        if args.output:
            write_report(args.output, rendered)
            print(json.dumps({"output": str(args.output), "checkout_sha": report["repository"]["checkout_sha"],
                              "source_files": report["source"]["file_count"],
                              "source_matches": report["source"]["files_with_markers"],
                              "artifact_status": report["artifact"]["status"],
                              "artifact_matches": report["artifact"]["files_with_markers"],
                              "purpose": report["purpose"]}))
        else:
            print(rendered, end="")
        return 0
    except (InventoryError, OSError) as exc:
        print(f"legacy inventory BLOCKED: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
