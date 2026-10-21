#!/usr/bin/env python3
"""Run independent exam acceptance probes; never approve or mutate a question.

Exit 1 means a reproduced failure or a review HOLD. Exit 2 means that the
review's source identity is stale or the harness cannot be run. This is a
manually invoked integration check, not a production publication policy.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import unittest


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--quarantine", required=True, type=Path)
    args = parser.parse_args()
    root = args.repo.resolve(strict=True)
    pack_path = root / "packages/engine/lessonos/study/content/fisica-semestre-filtro-v1.json"
    pack = json.loads(pack_path.read_text(encoding="utf-8"))
    quarantine = json.loads(args.quarantine.read_text(encoding="utf-8"))
    head = subprocess.check_output(
        ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
    ).strip()
    source_files = [
        pack_path.relative_to(root).as_posix(),
        "packages/engine/lessonos/study/exam.py",
        "packages/engine/lessonos/study/store.py",
        "apps/web/src/features/Exam.tsx",
        "apps/web/src/api.ts",
        "apps/studio/src/study/apiClient.ts",
        "services/study-api/study_api/app.py",
    ]
    sources = {}
    for path in source_files:
        raw_head = subprocess.check_output(["git", "-C", str(root), "show", f"{head}:{path}"])
        current = digest(root / path)
        sources[path] = {
            "sha256": current,
            "matchesCommittedBytes": current == hashlib.sha256(raw_head).hexdigest(),
        }
    scope_matches = (
        quarantine.get("packId") == pack.get("id")
        and quarantine.get("packVersion") == pack.get("version")
        and quarantine.get("packSHA256") == digest(pack_path)
    )
    report = {
        "schema": "ardesia.pro-regia.exam-review.v1",
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "sourceCommit": head,
        "sources": sources,
        "scope": "independent manual integration check; no production mutation",
        "quarantineSourceMatches": scope_matches,
        "humanScientificApproval": "NOT_RUN",
        "postgres": "NOT_RUN",
        "realBrowser": "NOT_RUN",
        "productionMutation": False,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    if not scope_matches:
        report.update(status="BLOCKED", reason="Question source changed: obtain a fresh review; HOLDs are not auto-cleared.")
        (args.output_dir / "review.json").write_text(json.dumps(report, indent=2) + "\n")
        print(report["reason"], file=sys.stderr)
        return 2

    sys.path.insert(0, str(root / "packages/engine"))
    test_path = Path(__file__).with_name("test_exam_boundaries.py")
    spec = importlib.util.spec_from_file_location("pro_regia_exam_boundaries", test_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    suite = unittest.defaultTestLoader.loadTestsFromModule(module)
    log = io.StringIO()
    result = unittest.TextTestRunner(stream=log, verbosity=2).run(suite)
    held = [q["questionId"] for q in quarantine["items"] if q["state"] == "HOLD"]
    report.update(
        testsRun=result.testsRun,
        failures=[test.id() for test, _ in result.failures],
        errors=[test.id() for test, _ in result.errors],
        skipped=[test.id() for test, _ in result.skipped],
        regressionStatus="PASS" if result.wasSuccessful() else "FAIL",
        heldQuestionIds=held,
        status="FAIL" if not result.wasSuccessful() or held else "PASS",
        releaseCertification="NOT_GRANTED",
    )
    (args.output_dir / "exam-boundaries.log").write_text(log.getvalue(), encoding="utf-8")
    (args.output_dir / "review.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(log.getvalue(), end="")
    print(f"Integration check: {report['status']}; {len(held)} question HOLDs; no scientific approval.")
    return 1 if report["status"] == "FAIL" else 0


if __name__ == "__main__":
    raise SystemExit(main())
