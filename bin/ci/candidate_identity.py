#!/usr/bin/env python3
"""Fail closed unless a CI checkout is the explicit candidate commit."""

from __future__ import annotations

import argparse
import json
import re
import subprocess


SHA_PATTERN = re.compile(r"[0-9a-f]{40}\Z")
ZERO_SHA = "0" * 40
REPOSITORY_PATTERN = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\Z")
SUPPORTED_EVENTS = frozenset({"pull_request", "push"})


def validate_sha(label: str, value: str) -> str:
    if not SHA_PATTERN.fullmatch(value):
        raise ValueError(f"{label} must be lowercase 40-hex")
    return value


def validate_object_sha(label: str, value: str) -> str:
    result = validate_sha(label, value)
    if result == ZERO_SHA:
        raise ValueError(f"{label} cannot be the zero sentinel")
    return result


def build_receipt(
    *,
    repository: str,
    event: str,
    expected_sha: str,
    actual_sha: str,
    base_sha: str,
    tree_sha: str,
) -> dict[str, str | None]:
    """Validate explicit inputs and return the minimal redacted receipt."""

    if not REPOSITORY_PATTERN.fullmatch(repository) or any(
        part in {".", ".."} for part in repository.split("/")
    ):
        raise ValueError("repository must be owner/name")
    if event not in SUPPORTED_EVENTS:
        raise ValueError("unsupported event")

    candidate = validate_object_sha("expected SHA", expected_sha)
    actual = validate_object_sha("actual SHA", actual_sha)
    base = validate_sha("base SHA", base_sha)
    tree = validate_object_sha("tree SHA", tree_sha)
    if actual != candidate:
        raise ValueError("checkout does not match candidate")
    if event == "pull_request" and base == ZERO_SHA:
        raise ValueError("pull request base cannot be the zero sentinel")
    base_kind = (
        "created"
        if event == "push" and base == ZERO_SHA
        else "push_before"
        if event == "push"
        else "pull_request_base"
    )

    return {
        "base": None if base_kind == "created" else base,
        "base_kind": base_kind,
        "candidate": candidate,
        "event": event,
        "repository": repository,
        "tree": tree,
    }


def serialize_receipt(receipt: dict[str, str | None]) -> str:
    return json.dumps(receipt, sort_keys=True, separators=(",", ":")) + "\n"


def observe_checkout() -> tuple[str, str]:
    """Read commit and tree from Git itself; never trust caller-supplied identity."""

    observed: list[str] = []
    for revision in ("HEAD", "HEAD^{tree}"):
        try:
            completed = subprocess.run(
                ["git", "rev-parse", "--verify", revision],
                check=False,
                capture_output=True,
                text=True,
            )
        except OSError as error:
            raise ValueError("unable to observe Git checkout") from error
        if completed.returncode != 0:
            raise ValueError("unable to observe Git checkout")
        observed.append(validate_sha(f"observed {revision}", completed.stdout.strip()))
    return observed[0], observed[1]


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        description="Verify and receipt an explicit GitHub Actions candidate."
    )
    result.add_argument("--repository", required=True)
    result.add_argument("--event", required=True)
    result.add_argument("--expected-sha", required=True)
    result.add_argument("--base-sha", required=True)
    return result


def main() -> int:
    argument_parser = parser()
    args = argument_parser.parse_args()
    try:
        actual_sha, tree_sha = observe_checkout()
        receipt = build_receipt(
            repository=args.repository,
            event=args.event,
            expected_sha=args.expected_sha,
            actual_sha=actual_sha,
            base_sha=args.base_sha,
            tree_sha=tree_sha,
        )
    except ValueError as error:
        argument_parser.error(str(error))
    print(serialize_receipt(receipt), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
