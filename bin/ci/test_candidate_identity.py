#!/usr/bin/env python3
"""Pure tests and workflow assertions for the candidate identity gate."""

from __future__ import annotations

import importlib.util
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("candidate_identity.py")
ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("candidate_identity", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
candidate_identity = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(candidate_identity)

HEAD = "1" * 40
MERGE = "2" * 40
BASE = "3" * 40
TREE = "4" * 40
ZERO = "0" * 40
REPOSITORY = "AndreaMarro/ardesia"


class CandidateIdentityTests(unittest.TestCase):
    def receipt(
        self,
        *,
        event: str = "pull_request",
        expected: str = HEAD,
        actual: str = HEAD,
        base: str = BASE,
        tree: str = TREE,
    ) -> dict[str, str]:
        return candidate_identity.build_receipt(
            repository=REPOSITORY,
            event=event,
            expected_sha=expected,
            actual_sha=actual,
            base_sha=base,
            tree_sha=tree,
        )

    def test_rejects_pull_request_merge_checkout(self) -> None:
        with self.assertRaisesRegex(ValueError, "checkout does not match candidate"):
            self.receipt(actual=MERGE)

    def test_accepts_pull_request_head_checkout(self) -> None:
        self.assertEqual(self.receipt()["candidate"], HEAD)

    def test_accepts_push_checkout(self) -> None:
        receipt = self.receipt(event="push")
        self.assertEqual(receipt["event"], "push")
        self.assertEqual(receipt["base_kind"], "push_before")

    def test_models_branch_creation_without_a_false_base_commit(self) -> None:
        receipt = self.receipt(event="push", base=ZERO)
        self.assertIsNone(receipt["base"])
        self.assertEqual(receipt["base_kind"], "created")
        with self.assertRaisesRegex(ValueError, "zero sentinel"):
            self.receipt(event="pull_request", base=ZERO)

    def test_rejects_missing_invalid_and_uppercase_sha(self) -> None:
        invalid = ("", "abc", "g" * 40, "A" * 40, "1" * 39, "1" * 41)
        for value in invalid:
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, "lowercase 40-hex"):
                    self.receipt(expected=value, actual=value)
        for field in ("expected", "actual", "tree"):
            with self.subTest(field=field, value="zero-sentinel"):
                values = {"expected": HEAD, "actual": HEAD, "tree": TREE}
                values[field] = ZERO
                with self.assertRaisesRegex(ValueError, "zero sentinel"):
                    self.receipt(**values)

    def test_validates_actual_base_and_tree_sha(self) -> None:
        for field in ("actual", "base", "tree"):
            with self.subTest(field=field):
                values = {"actual": HEAD, "base": BASE, "tree": TREE}
                values[field] = "invalid"
                with self.assertRaisesRegex(ValueError, "lowercase 40-hex"):
                    self.receipt(**values)

    def test_rejects_unknown_event_and_repository(self) -> None:
        with self.assertRaisesRegex(ValueError, "unsupported event"):
            self.receipt(event="workflow_dispatch")
        with self.assertRaisesRegex(ValueError, "owner/name"):
            candidate_identity.build_receipt(
                repository="unsafe repository",
                event="push",
                expected_sha=HEAD,
                actual_sha=HEAD,
                base_sha=BASE,
                tree_sha=TREE,
            )
        for repository in ("../..", "./repo", "owner/."):
            with self.subTest(repository=repository):
                with self.assertRaisesRegex(ValueError, "owner/name"):
                    candidate_identity.build_receipt(
                        repository=repository,
                        event="push",
                        expected_sha=HEAD,
                        actual_sha=HEAD,
                        base_sha=BASE,
                        tree_sha=TREE,
                    )

    def test_receipt_is_minimal_deterministic_and_key_ordered(self) -> None:
        receipt = self.receipt()
        self.assertEqual(
            receipt,
            {
                "base": BASE,
                "base_kind": "pull_request_base",
                "candidate": HEAD,
                "event": "pull_request",
                "repository": REPOSITORY,
                "tree": TREE,
            },
        )
        first = candidate_identity.serialize_receipt(receipt)
        second = candidate_identity.serialize_receipt(dict(reversed(receipt.items())))
        self.assertEqual(first, second)
        self.assertEqual(
            first,
            json.dumps(receipt, sort_keys=True, separators=(",", ":")) + "\n",
        )

    def test_cli_emits_only_the_receipt(self) -> None:
        actual = subprocess.run(
            ["git", "rev-parse", "--verify", "HEAD"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        tree = subprocess.run(
            ["git", "rev-parse", "--verify", "HEAD^{tree}"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--repository",
                REPOSITORY,
                "--event",
                "push",
                "--expected-sha",
                actual,
                "--base-sha",
                BASE,
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        expected = candidate_identity.build_receipt(
            repository=REPOSITORY,
            event="push",
            expected_sha=actual,
            actual_sha=actual,
            base_sha=BASE,
            tree_sha=tree,
        )
        self.assertEqual(completed.stdout, candidate_identity.serialize_receipt(expected))
        self.assertEqual(json.loads(completed.stdout), expected)
        self.assertEqual(completed.stderr, "")

    def test_cli_observes_checkout_and_fails_closed_on_mismatch(self) -> None:
        actual = subprocess.run(
            ["git", "rev-parse", "--verify", "HEAD"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        mismatch = HEAD if actual != HEAD else MERGE
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--repository",
                REPOSITORY,
                "--event",
                "push",
                "--expected-sha",
                mismatch,
                "--base-sha",
                BASE,
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(completed.returncode, 0)
        self.assertEqual(completed.stdout, "")
        self.assertIn("checkout does not match candidate", completed.stderr)


class WorkflowIdentityTests(unittest.TestCase):
    @staticmethod
    def jobs(text: str) -> dict[str, str]:
        lines = text.splitlines(keepends=True)
        jobs_start = lines.index("jobs:\n") + 1
        headers = [
            (index, match.group(1))
            for index, line in enumerate(lines[jobs_start:], start=jobs_start)
            if (match := re.fullmatch(r"  ([A-Za-z0-9_-]+):\s*\n", line))
        ]
        return {
            name: "".join(lines[start : headers[position + 1][0]])
            if position + 1 < len(headers)
            else "".join(lines[start:])
            for position, (start, name) in enumerate(headers)
        }

    def assert_job_identity(self, job: str) -> None:
        self.assertEqual(job.count("uses: actions/checkout@"), 1)
        self.assertEqual(job.count("ref: ${{ env.CANDIDATE_SHA }}"), 1)
        self.assertEqual(job.count("persist-credentials: false"), 1)
        self.assertEqual(job.count("name: Candidate identity"), 1)
        self.assertEqual(job.count("python3 bin/ci/candidate_identity.py"), 1)
        checkout = job.index("uses: actions/checkout@")
        identity = job.index("name: Candidate identity")
        self.assertLess(checkout, identity)
        next_step = job.find("\n      - ", identity + 1)
        identity_step = job[identity : next_step if next_step >= 0 else len(job)]
        self.assertIn('--expected-sha "$CANDIDATE_SHA"', identity_step)
        self.assertIn('--base-sha "$BASE_SHA"', identity_step)
        self.assertNotIn("--actual-sha", identity_step)
        self.assertNotIn("--tree-sha", identity_step)
        self.assertNotIn("continue-on-error:", identity_step)
        self.assertNotIn("\n        if:", identity_step)

    def test_every_root_job_checks_out_and_receipts_the_explicit_candidate(self) -> None:
        workflows = (
            ROOT / ".github/workflows/ci.yml",
            ROOT / ".github/workflows/studio-preview-readiness.yml",
        )
        for workflow in workflows:
            with self.subTest(workflow=workflow.name):
                text = workflow.read_text(encoding="utf-8")
                self.assertEqual(
                    text.count(
                        "CANDIDATE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}"
                    ),
                    1,
                )
                self.assertEqual(
                    text.count(
                        "BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.before }}"
                    ),
                    1,
                )
                jobs = self.jobs(text)
                self.assertTrue(jobs)
                for name, job in jobs.items():
                    with self.subTest(workflow=workflow.name, job=name):
                        self.assert_job_identity(job)
                self.assertNotIn("TESTED_SHA: ${{ github.sha }}", text)
                self.assertNotIn("pull_request_target", text)

    def test_structural_guard_rejects_omission_duplication_and_bypass(self) -> None:
        valid = """  sample:
    steps:
      - uses: actions/checkout@0123456789012345678901234567890123456789
        with:
          ref: ${{ env.CANDIDATE_SHA }}
          persist-credentials: false
      - name: Candidate identity
        run: |
          python3 bin/ci/candidate_identity.py \\
            --expected-sha "$CANDIDATE_SHA" \\
            --base-sha "$BASE_SHA"
      - run: true
"""
        self.assert_job_identity(valid)
        mutations = (
            valid.replace("      - name: Candidate identity\n", ""),
            valid.replace("      - name: Candidate identity\n", "      - name: Candidate identity\n      - name: Candidate identity\n"),
            valid.replace("        run: |\n", "        if: false\n        run: |\n"),
            valid.replace("          persist-credentials: false\n", ""),
        )
        for mutation in mutations:
            with self.subTest(mutation=mutation):
                with self.assertRaises((AssertionError, ValueError)):
                    self.assert_job_identity(mutation)

    def test_whitespace_gate_uses_receipted_base_without_live_fetch(self) -> None:
        text = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
        self.assertIn('git cat-file -e "$BASE_SHA^{commit}"', text)
        self.assertIn('git merge-base "$BASE_SHA" HEAD', text)
        self.assertNotIn("git fetch origin", text)


if __name__ == "__main__":
    unittest.main()
