#!/usr/bin/env python3
"""Lossless, private intake envelope for the delivered QuestionBank v1.

This adapter preserves the complete authoring record and immutable source pins.
It does not expose an HTTP route, write to LessonOS, grade a question, advance
scientific approval or adapt the record to the incompatible Exam v1 contract.
"""

import argparse
from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess


CONTRACT = "ardesia.question-inbox.v1"


def content_hash(record):
    encoded = json.dumps(record, ensure_ascii=False, sort_keys=True,
                         separators=(",", ":"), allow_nan=False).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def verify_committed_bytes(root, commit, path, raw):
    relative = path.relative_to(root).as_posix()
    committed = subprocess.check_output(
        ["git", "-C", str(root), "show", f"{commit}:{relative}"],
        stderr=subprocess.DEVNULL,
    )
    if raw != committed:
        raise ValueError("Working-tree bytes do not match source commit: " + relative)


def from_question_bank(record, source):
    """Return a private intake record; unknown fields are preserved verbatim.

    Keep this envelope on the trusted authoring/intake side. It intentionally
    contains answer keys and full explanations and is NOT a student projection.
    """
    if (record.get("bankId") != source["bankId"]
            or not isinstance(record.get("id"), str)
            or not record["id"]
            or type(record.get("version")) is not int
            or record["version"] < 1):
        raise ValueError("Invalid question identity at intake")
    return {
        "contract": CONTRACT,
        "identity": {"bankId": record["bankId"], "questionId": record["id"],
                     "questionRevision": record["version"]},
        "source": deepcopy(source),
        "recordSHA256": content_hash(record),
        "sourceRecord": deepcopy(record),
        "state": "QUESTION_INBOX",
        "publicationEligible": False,
        "humanScientificApproval": "NOT_RUN",
    }


def to_source_record(envelope):
    """Recover every source field and reject accidental mutation of a snapshot."""
    if envelope.get("contract") != CONTRACT:
        raise ValueError("Unsupported inbox contract")
    record = envelope["sourceRecord"]
    identity = envelope["identity"]
    if (content_hash(record) != envelope["recordSHA256"]
            or identity != {"bankId": record["bankId"], "questionId": record["id"],
                            "questionRevision": record["version"]}):
        raise ValueError("Inbox snapshot or identity changed")
    return deepcopy(record)


def resolve_commit(root, ref):
    if not isinstance(ref, str) or not ref or ref.startswith("-") or len(ref) > 256:
        raise ValueError("An explicit Git commit reference is required")
    result = subprocess.run(
        ["git", "-C", str(root), "rev-parse", "--verify", "--end-of-options", ref + "^{commit}"],
        capture_output=True, text=True,
    )
    commit = result.stdout.strip()
    if result.returncode or not re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", commit):
        raise ValueError("Reference does not resolve to a Git commit")
    return commit


def committed_bytes(root, commit, relative):
    result = subprocess.run(
        ["git", "-C", str(root), "show", f"{commit}:{relative}"],
        capture_output=True,
    )
    if result.returncode:
        raise ValueError("Committed bank file is unavailable: " + relative)
    return result.stdout


def shard_relative_path(value):
    if not isinstance(value, str) or not value or len(value) > 512 or "\x00" in value:
        raise ValueError("Invalid shard path")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or "\\" in value or path.as_posix() == ".":
        raise ValueError("Shard escapes the bank")
    return path.as_posix()


def inspect_delivery(repo, output, ref=None, expected_manifest_sha256=None):
    """Check intake without importing or approving any question.

    The CLI always supplies an explicit ref and reads immutable Git blobs. The
    ref=None Python compatibility call retains the original verified-worktree
    behavior, including rejection of dirty source bytes, for existing callers.
    Neither path claims to validate the runtime exam contract.
    """
    root = repo.resolve(strict=True)
    relative_base = "packages/engine/lessonos/study/content/physics-semestre-2026-bank"
    base = root / relative_base
    commit = resolve_commit(root, "HEAD" if ref is None else ref)
    read_mode = "VERIFIED_WORKTREE_COMPAT" if ref is None else "GIT_COMMITTED_BLOBS"

    def read(relative):
        if ref is not None:
            return committed_bytes(root, commit, relative_base + "/" + relative)
        path = (base / relative).resolve(strict=True)
        if not path.is_relative_to(base.resolve()):
            raise ValueError("Shard escapes the bank")
        raw = path.read_bytes()
        verify_committed_bytes(root, commit, path, raw)
        return raw

    manifest_bytes = read("manifest.json")
    manifest = json.loads(manifest_bytes)
    manifest_sha = hashlib.sha256(manifest_bytes).hexdigest()
    if expected_manifest_sha256 is not None:
        if not re.fullmatch(r"[0-9a-f]{64}", expected_manifest_sha256):
            raise ValueError("Expected manifest SHA-256 must contain 64 lowercase hexadecimal characters")
        if manifest_sha != expected_manifest_sha256:
            raise ValueError("Manifest checksum does not match the expected revision")
    records = 0
    ids = set()
    levels = Counter()
    errors = []
    for shard in manifest["shards"]:
        relative = shard_relative_path(shard["path"])
        raw = read(relative)
        observed_sha = hashlib.sha256(raw).hexdigest()
        if observed_sha != shard["sha256"]:
            raise ValueError("Shard checksum mismatch: " + shard["path"])
        questions = json.loads(raw)
        if len(questions) != shard["count"]:
            raise ValueError("Shard count mismatch")
        for question in questions:
            source = {"repositoryCommit": commit, "bankId": manifest["id"],
                      "bankVersion": manifest["version"], "schemaVersion": manifest["schemaVersion"],
                      "manifestSHA256": manifest_sha, "shard": shard["path"],
                      "shardSHA256": observed_sha}
            envelope = from_question_bank(question, source)
            restored = to_source_record(envelope)
            if restored != question:
                errors.append(question["id"] + ": lossy round trip")
            key = (question["id"], question["version"])
            if key in ids:
                errors.append(question["id"] + ": duplicate revision identity")
            ids.add(key)
            records += 1
            levels[question["difficulty"]["level"]] += 1
    if records != manifest["questionCount"]:
        errors.append("Manifest count mismatch")
    receipt = {
        "contract": CONTRACT,
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "sourceCommit": commit,
        "requestedRef": ref,
        "sourceReadMode": read_mode,
        "manifestSHA256": manifest_sha,
        "sourceBytesMatchCommit": True,
        "shardsVerified": len(manifest["shards"]),
        "receivedRecords": records,
        "uniqueRevisionIdentities": len(ids),
        "losslessRoundTrips": records - sum("lossy round trip" in error for error in errors),
        "levels": dict(levels),
        "errors": errors,
        "status": "PASS" if not errors else "FAIL",
        "scope": "Lossless private intake only; this is not a canonical database import or publication",
        "pipelineStateCreatedInMemory": "QUESTION_INBOX",
        "scientificApprovalsIssued": 0,
        "editorialApprovalsIssued": 0,
        "canonicalDatabaseImports": 0,
        "publications": 0,
        "sourceRecordsWritten": 0,
        "runtimeCompatibility": {
            "status": "NOT_CHECKED",
            "reason": "This QA intake checks source identity and lossless private envelopes, not runtime exam schemas, scientific correctness or publication authority",
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 1 if errors else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--ref", required=True, help="Git commit/ref to resolve once and read as immutable blobs")
    parser.add_argument("--expected-manifest-sha256", help="Optional exact editorial bank revision pin")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    return inspect_delivery(args.repo, args.output, args.ref, args.expected_manifest_sha256)


if __name__ == "__main__":
    raise SystemExit(main())
