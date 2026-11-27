"""Rerun the upstream 199-ID verifier, without importing/copying its implementation."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from .pipeline import canonical, git_bytes, sha

VERIFIER = "bin/content/physics_bank/verify_fluid_thermal_selection.py"
BANK = "packages/engine/lessonos/study/content/physics-semestre-2026-bank"
REPORT = "docs/ops/closure1-20261028/selection-validation.json"


def recover(repo, commit):
    manifest = json.loads(git_bytes(repo, commit, BANK + "/manifest.json"))
    paths = [VERIFIER, "packs/semestre-filtro-2026-27/data/models_fluids_thermal.json",
             "packages/engine/lessonos/study/content/sf-fluidi-termodinamica-v1.json"]
    paths += [BANK + "/" + s["path"] for s in manifest["shards"] if s["path"].startswith(("questions/U3", "questions/U5"))]
    checksums = {}
    with tempfile.TemporaryDirectory(prefix="cric-recovery-") as home:
        root = Path(home)
        for path in paths:
            raw = git_bytes(repo, commit, path)
            checksums[path] = sha(raw)
            target = root / path; target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(raw)
        (root / REPORT).parent.mkdir(parents=True, exist_ok=True)
        run = subprocess.run([sys.executable, str(root / VERIFIER), "--write"], capture_output=True, text=True, timeout=120)
        if run.returncode: raise ValueError("Recovered verifier failed: " + run.stderr + run.stdout)
        report = json.loads((root / REPORT).read_text())
    if not report["ok"] or report["validatedCount"] != 199: raise ValueError("Recovered selection did not pass")
    return {"schemaVersion": "1.0.0", "upstreamCommit": commit, "upstreamVerifier": VERIFIER,
            "inputFileChecksums": checksums, "execution": "RERUN", "report": report,
            "requestedPro100": {"status": "NOT_IDENTIFIED", "reason": "No verified artifact identifying the requested 100 revisions; this is a distinct upstream 199-ID selection."}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--source-ref", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = recover(args.repo, args.source_ref)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(report) + "\n")
    print(canonical({"recovered": report["report"]["validatedCount"], "humanReview": "NOT_RUN", "sha256": sha(args.output.read_bytes())}))
