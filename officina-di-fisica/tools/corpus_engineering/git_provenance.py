"""Recover immutable Git object inputs declared by independently frozen fixtures."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess

APP = Path(__file__).resolve().parents[2]
SHA = re.compile(r"[0-9a-f]{40}\Z")


def declared_blob_inputs(reviews_root):
    """Versioned model-only Git inputs complement existing candidate fixtures."""
    inputs = {}
    for manifest in sorted(Path(reviews_root).rglob("git-inputs.json")):
        data = json.loads(manifest.read_bytes())
        if (not isinstance(data, dict) or set(data) != {"schemaVersion", "inputs"}
            or data["schemaVersion"] != "1.0.0" or not isinstance(data["inputs"], list)
            or not 1 <= len(data["inputs"]) <= 100):
            raise ValueError("Expected bounded versioned Git blob inputs")
        for item in data["inputs"]:
            if not isinstance(item, dict) or set(item) != {"commit", "path", "snapshot", "sha256"}:
                raise ValueError("Incomplete Git blob input")
            ref, name, snapshot, pin = (item[k] for k in ("commit", "path", "snapshot", "sha256"))
            if not isinstance(ref, str) or not SHA.fullmatch(ref):
                raise ValueError("Git blob requires an immutable full commit")
            if (not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9_./-]{1,300}", name)
                or PurePosixPath(name).is_absolute() or ".." in PurePosixPath(name).parts):
                raise ValueError("Unsafe Git object path")
            if not isinstance(snapshot, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}", snapshot):
                raise ValueError("Snapshot must be a local filename")
            file = manifest.parent / snapshot
            if (not isinstance(pin, str) or not re.fullmatch(r"[a-f0-9]{64}", pin)
                or file.is_symlink() or not file.is_file() or not 0 < file.stat().st_size <= 4 * 1024**2
                or hashlib.sha256(file.read_bytes()).hexdigest() != pin):
                raise ValueError("Frozen Git blob snapshot changed or is unavailable")
            key = (ref, name)
            if key in inputs and inputs[key]["sha256"] != pin:
                raise ValueError("Conflicting Git blob declarations")
            inputs[key] = {"commit": ref, "path": name, "sha256": pin}
    return [inputs[key] for key in sorted(inputs)]


def verify_declared_blobs(repo, inputs):
    for item in inputs:
        obj = item["commit"] + ":" + item["path"]
        size = int(subprocess.check_output(["git", "cat-file", "-s", obj], cwd=repo))
        if not 0 < size <= 4 * 1024**2:
            raise ValueError("Git blob exceeds bounded snapshot size")
        raw = subprocess.check_output(["git", "show", obj], cwd=repo)
        if hashlib.sha256(raw).hexdigest() != item["sha256"]:
            raise ValueError("Historical Git object differs from frozen snapshot: " + obj)
    return {"verifiedBlobInputs": len(inputs), "publicationAction": "NONE"}


def fixture_commit_refs(reviews_root):
    """Discover actual audit fixtures, not informational historical commit labels."""
    refs = set()
    for path in sorted(Path(reviews_root).rglob("manifest.json")):
        manifest = json.loads(path.read_text())
        if not isinstance(manifest, dict) or "sourceCandidateCommit" not in manifest:
            continue
        ref = manifest["sourceCandidateCommit"]
        if not isinstance(ref, str) or not SHA.fullmatch(ref):
            raise ValueError("Candidate fixture requires an immutable full Git SHA")
        files = manifest.get("files")
        if not isinstance(files, dict):
            raise ValueError("Candidate fixture file checksums are missing")
        for name in ("package.json", "bindings.json"):
            expected = files.get(name)
            if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
                raise ValueError("Candidate fixture package/bindings checksum missing")
            if hashlib.sha256((path.parent / name).read_bytes()).hexdigest() != expected:
                raise ValueError("Candidate fixture package/bindings changed")
        refs.add(ref)
    refs.update(item["commit"] for item in declared_blob_inputs(reviews_root))
    return sorted(refs)


def ensure_commits(repo, refs, batch_size=32):
    if type(batch_size) is not int or not 1 <= batch_size <= 64:
        raise ValueError("Expected bounded fetch size between 1 and 64")
    refs = sorted(set(refs))
    if any(not isinstance(ref, str) or not SHA.fullmatch(ref) for ref in refs):
        raise ValueError("Only immutable full Git SHAs may be fetched")

    def present(ref):
        return subprocess.run(["git", "cat-file", "-e", ref + "^{commit}"], cwd=repo,
                              env={**os.environ, "GIT_NO_LAZY_FETCH": "1"},
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0

    missing = [ref for ref in refs if not present(ref)]
    for start in range(0, len(missing), batch_size):
        subprocess.run(["git", "fetch", "--no-tags", "--depth=1", "--filter=blob:none", "origin",
                        *missing[start:start + batch_size]], cwd=repo, check=True)
    if any(not present(ref) for ref in refs):
        raise ValueError("Required candidate provenance is still unavailable after fetch")
    return {"requiredCommits": len(refs), "fetchedCommits": len(missing),
            "batchSize": batch_size, "publicationAction": "NONE"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--fetch-missing", action="store_true")
    args = parser.parse_args()
    refs = fixture_commit_refs(APP / "editorial/reviews")
    if args.fetch_missing:
        result = ensure_commits(APP.parent, refs)
        result.update(verify_declared_blobs(APP.parent, declared_blob_inputs(APP / "editorial/reviews")))
        print(json.dumps(result))
    else:
        print(json.dumps(refs))
