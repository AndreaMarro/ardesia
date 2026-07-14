#!/usr/bin/env python3
"""Require immutable references for every root GitHub Actions dependency."""
from __future__ import annotations

import re
import shlex
import sys
from pathlib import Path


USES_LINE = re.compile(
    r"^\s*(?:-\s*)?(?:(?:&|!{1,2})\S+\s*)*"
    r"(?:uses|[\"']uses[\"'])\s*:\s*(?P<raw>.*)$"
)
EXPLICIT_USES_KEY = re.compile(
    r"^\s*(?:-\s*)?\?\s*(?:(?:&|!{1,2})\S+\s*)*"
    r"(?:uses|[\"']uses[\"'])\s*(?:#.*)?$"
)
EXPLICIT_VALUE = re.compile(r"^\s*:\s*(?P<raw>.*)$")
FLOW_CONTAINER = re.compile(
    r"^\s*(?:-\s*)?(?:[^:#\[\]{}]+:\s*)?"
    r"(?:(?:&|!{1,2})\S+\s*)*[\[{].*[\]}]\s*(?:#.*)?$"
)
FLOW_USES = re.compile(
    r"(?:^|[\[,{])\s*(?:\?\s*)?(?:(?:&|!{1,2})\S+\s*)*"
    r"(?:uses|[\"']uses[\"'])\s*:\s*(?P<raw>[^,}\]]*)"
)
ESCAPED_MAPPING_KEY = re.compile(
    r'(?:^|[\[,{])\s*(?:-\s*)?(?:\?\s*)?"(?:[^"\\]|\\.)*\\'
    r'(?:[^"\\]|\\.)*"\s*:'
)
KEY_ANCHOR_OR_ALIAS = re.compile(
    r"(?:^|[\[,{])\s*(?:-\s*)?(?:[^:#{}\[\],]+:\s*|\?\s*)"
    r"[&*][A-Za-z0-9_.-]+"
)
DIRECT_ANCHOR_OR_ALIAS = re.compile(
    r"(?:^|[\[,{])\s*(?:-\s*)?[&*][A-Za-z0-9_.-]+(?:\s|:)"
)
EXPLICIT_BLOCK_KEY = re.compile(
    r"^\s*(?:-\s*)?\?\s*(?:(?:&|!{1,2})\S+\s*)*[>|][^#\s]*\s*(?:#.*)?$"
)
QUOTED_KEY_CONTINUATION = re.compile(
    r'(?:^|[\[,{])\s*(?:-\s*)?(?:\?\s*)?'
    r'(?:(?:&|!{1,2})\S+\s*)?"(?:[^"\\]|\\.)*\\\s*$'
)
REMOTE_ACTION = re.compile(r"^[^@\s]+@[0-9a-f]{40}$")
DOCKER_ACTION = re.compile(r"^docker://[^@\s]+@sha256:[0-9a-f]{64}$")


def workflow_paths(root: Path) -> list[Path]:
    directory = root / ".github" / "workflows"
    return sorted(
        path
        for path in directory.glob("*")
        if path.is_file() and path.suffix in {".yml", ".yaml"}
    )


def parse_reference(raw: str) -> str | None:
    try:
        tokens = shlex.split(raw, comments=True, posix=True)
    except ValueError:
        return None
    if not tokens:
        return None
    if len(tokens) == 1:
        return tokens[0]
    return raw.split("#", 1)[0].strip()


def immutable_reference(reference: str) -> bool:
    if reference.startswith("docker://"):
        return bool(DOCKER_ACTION.fullmatch(reference))
    return bool(REMOTE_ACTION.fullmatch(reference))


def uses_values(line: str) -> list[str]:
    if line.lstrip().startswith("#"):
        return []
    match = USES_LINE.match(line)
    if match:
        return [match.group("raw")]
    if not FLOW_CONTAINER.match(line):
        return []
    return [match.group("raw") for match in FLOW_USES.finditer(line)]


def unsupported_yaml_key_syntax(line: str) -> list[str]:
    if line.lstrip().startswith("#"):
        return []
    errors: list[str] = []
    if ESCAPED_MAPPING_KEY.search(line):
        errors.append("escaped mapping keys are not supported")
    if KEY_ANCHOR_OR_ALIAS.search(line):
        errors.append("mapping-key anchors and aliases are not supported")
    if DIRECT_ANCHOR_OR_ALIAS.search(line):
        errors.append("flow anchors and aliases are not supported")
    if EXPLICIT_BLOCK_KEY.match(line):
        errors.append("explicit block-scalar mapping keys are not supported")
    if QUOTED_KEY_CONTINUATION.search(line):
        errors.append("continued quoted mapping keys are not supported")
    return errors


def local_manifest(root: Path, reference: str) -> tuple[Path | None, str | None]:
    root = root.resolve()
    target = (root / reference[2:]).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        return None, "local action resolves outside repository"
    if target.is_file() and target.suffix in {".yml", ".yaml"}:
        return target, None
    if not target.is_dir():
        return None, "local action target is missing"
    manifests = [
        candidate
        for name in ("action.yml", "action.yaml")
        if (candidate := target / name).is_file()
    ]
    if len(manifests) != 1:
        return None, "local action must contain exactly one action.yml or action.yaml"
    return manifests[0], None


def scan_file(root: Path, path: Path, visited: set[Path], errors: list[str]) -> None:
    resolved_path = path.resolve()
    if resolved_path in visited:
        return
    visited.add(resolved_path)

    relative_path = resolved_path.relative_to(root.resolve())
    lines = resolved_path.read_text(encoding="utf-8").splitlines()
    references: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        location = f"{relative_path}:{index + 1}"
        errors.extend(
            f"{location}: {reason}" for reason in unsupported_yaml_key_syntax(line)
        )
        references.extend((index + 1, raw) for raw in uses_values(line))
        if not EXPLICIT_USES_KEY.match(line):
            continue
        if index + 1 >= len(lines):
            references.append((index + 1, ""))
            continue
        explicit_value = EXPLICIT_VALUE.match(lines[index + 1])
        references.append(
            (index + 2, explicit_value.group("raw") if explicit_value else "")
        )

    for line_number, raw_reference in references:
        reference = parse_reference(raw_reference)
        location = f"{relative_path}:{line_number}"
        if reference is None:
            errors.append(f"{location}: missing action reference")
        elif reference.startswith("./"):
            manifest, local_error = local_manifest(root, reference)
            if local_error:
                errors.append(f"{location}: {local_error}: {reference}")
            elif manifest is not None:
                scan_file(root, manifest, visited, errors)
        elif not immutable_reference(reference):
            errors.append(
                f"{location}: action reference must be immutable: {reference}"
            )


def check_workflows(root: Path) -> list[str]:
    paths = workflow_paths(root)
    if not paths:
        return ["no root GitHub Actions workflows found"]

    errors: list[str] = []
    visited: set[Path] = set()
    for path in paths:
        scan_file(root, path, visited, errors)
    return errors


def main() -> int:
    errors = check_workflows(Path.cwd())
    if errors:
        print("action_pin_gate: FAILED", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("action_pin_gate: OK (all external actions use immutable references)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
