"""Recover immutable Git object inputs declared by independently frozen fixtures."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

APP = Path(__file__).resolve().parents[2]
SHA = re.compile(r"[0-9a-f]{40}\Z")


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
    print(json.dumps(ensure_commits(APP.parent, refs) if args.fetch_missing else refs))
