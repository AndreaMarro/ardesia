#!/usr/bin/env python3
"""Deterministic safety tests for the ARDESIA MCP control plane."""

from __future__ import annotations

import copy
import datetime as dt
import importlib.util
import json
import os
import plistlib
import shutil
import subprocess
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("ardesia_control_plane", HERE / "ardesia_control_plane.py")
assert SPEC and SPEC.loader
cp = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cp)


class ControlPlaneTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.runtime = self.root / "runtime"
        self.runtime.mkdir()
        self.git = shutil.which("git") or "/usr/bin/git"
        product_sha = self._repository("repos/ardesia", "main", {"README.md": "# Product\n"})
        knowledge_sha = self._repository(
            "repos/ardesia-knowledge",
            "sync/current",
            {
                "00-INDEX.md": "# Canon\n\n[[20-Decisions/ADR-001]]\n",
                "20-Decisions/ADR-001.md": "---\ntype: decision\nstatus: ACCEPTED\n---\n# Single scheduler\n\nEvidence exact SHA.\n",
            },
        )
        source = json.loads((HERE / "policy.source.json").read_text(encoding="utf-8"))
        source.update(
            {
                "runtime_root": str(self.runtime),
                "expected_product_sha": product_sha,
                "expected_knowledge_sha": knowledge_sha,
            }
        )
        source["tools"] = {
            "python": shutil.which("python3") or "/usr/bin/python3",
            "git": self.git,
            "gh": "/usr/bin/false",
            "codex": "/usr/bin/false",
            "claude": "/usr/bin/false",
        }
        source["tencentdb"]["dsn_reference_file"] = str(self.runtime / "config" / "secrets" / "tencentdb.dsn")
        source["schedules"]["controller_heartbeat_seconds"] = 1
        self.policy = cp.validate_policy(source)
        cp.ensure_runtime(self.runtime)
        self.policy_path = self.runtime / "config" / "policy.json"
        cp.write_json(self.policy_path, self.policy)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def _repository(self, relative: str, branch: str, files: dict[str, str]) -> str:
        repository = self.runtime / relative
        repository.mkdir(parents=True)
        subprocess.run([self.git, "init", "-b", branch], cwd=repository, check=True, capture_output=True)
        for name, body in files.items():
            path = repository / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(body, encoding="utf-8")
        subprocess.run([self.git, "add", *files], cwd=repository, check=True, capture_output=True)
        subprocess.run(
            [
                self.git,
                "-c",
                "user.name=ARDESIA Test",
                "-c",
                "user.email=test@invalid.local",
                "commit",
                "-m",
                "test: fixture",
            ],
            cwd=repository,
            check=True,
            capture_output=True,
        )
        return subprocess.run(
            [self.git, "rev-parse", "HEAD"], cwd=repository, check=True, capture_output=True, text=True
        ).stdout.strip()

    def _directive(self, **updates: object) -> dict[str, object]:
        value: dict[str, object] = {
            "schemaVersion": 1,
            "directiveId": "directive-test-1",
            "idempotencyKey": "directive-test-key-1",
            "runId": cp.RUN_ID,
            "goalId": cp.GOAL_ID,
            "baseSha": self.policy["expected_product_sha"],
            "headSha": self.policy["expected_product_sha"],
            "contextDigest": self.policy["security"]["context_digest"],
            "acceptanceDigest": self.policy["security"]["acceptance_digest"],
            "expiresAt": (cp.utcnow() + dt.timedelta(hours=1)).isoformat().replace("+00:00", "Z"),
            "capability": "run.read",
            "action": "run.status",
            "payload": {},
        }
        value.update(updates)
        return value

    def test_strict_policy_and_mcp_schemas(self) -> None:
        invalid = copy.deepcopy(self.policy)
        invalid["unexpected"] = True
        with self.assertRaisesRegex(ValueError, "additional properties"):
            cp.validate_policy(invalid)
        for tool in cp.MCP_TOOLS:
            self.assertEqual(tool["inputSchema"]["$schema"], "https://json-schema.org/draft/2020-12/schema")
            self.assertFalse(tool["inputSchema"]["additionalProperties"])
        with self.assertRaisesRegex(ValueError, "additional properties"):
            cp.validate_tool_input("run.status", {"write": True})

    def test_path_traversal_and_symlink_escape_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "traversal"):
            cp.safe_path(self.runtime, "../outside")
        outside = self.root / "outside"
        outside.mkdir()
        link = self.runtime / "escape"
        link.symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "symlink escape"):
            cp.safe_path(self.runtime, "escape")

    def test_mailbox_rejects_unauthorized_and_ignores_duplicate(self) -> None:
        directive = self._directive()
        fenced = "```ardesia-directive\n" + json.dumps(directive) + "\n```"
        comments = [
            {"id": 1, "user": {"login": "untrusted"}, "body": fenced},
            {"id": 2, "user": {"login": "AndreaMarro"}, "body": fenced},
            {"id": 3, "user": {"login": "AndreaMarro"}, "body": fenced},
        ]
        answer = {"exit": 0, "stdout": json.dumps(comments), "stderr": "", "argv": []}
        with mock.patch.object(cp, "run_tool", return_value=answer):
            result = cp.mailbox_poll(self.policy, "test")
        statuses = [item["status"] for item in result["directive_results"]]
        self.assertEqual(statuses, ["REJECTED", "VALIDATED_PENDING_SINGLE_SCHEDULER", "DUPLICATE_IGNORED"])

    def test_stale_sha_digest_and_expiry_rejected(self) -> None:
        self.assertFalse(cp.validate_directive(self.policy, self._directive(baseSha="0" * 40))["valid"])
        self.assertFalse(cp.validate_directive(self.policy, self._directive(contextDigest="0" * 64))["valid"])
        expired = (cp.utcnow() - dt.timedelta(seconds=1)).isoformat().replace("+00:00", "Z")
        self.assertFalse(cp.validate_directive(self.policy, self._directive(expiresAt=expired))["valid"])

    def test_optional_mailbox_failure_is_typed(self) -> None:
        answer = {"exit": 1, "stdout": "", "stderr": "offline", "argv": []}
        with mock.patch.object(cp, "run_tool", return_value=answer):
            result = cp.mailbox_poll(self.policy, "test")
        self.assertEqual(result["state"], "OPTIONAL_SERVICE_DEGRADED")
        self.assertEqual(result["reason"], "github_mailbox_unavailable")

    def test_writer_needs_isolated_lease_and_canonical_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "canonical repository"):
            cp.create_writer_lease(self.policy, self.runtime / "repos" / "ardesia")
        with self.assertRaisesRegex(ValueError, "outside allow-list"):
            cp.create_writer_lease(self.policy, self.root / "outside")
        isolated = self.runtime / "worktrees" / "slice"
        isolated.mkdir()
        lease = cp.create_writer_lease(self.policy, isolated, ttl_seconds=30)
        self.assertEqual(cp.validate_writer_lease(self.policy, isolated, lease["lease_id"])["identity"], "writer-claude")

    def test_wikillm_is_real_derived_exact_sha_and_never_canonical_write(self) -> None:
        result = cp.wikillm_ingest(self.policy)
        self.assertEqual(result["state"], "INDEXED_CURRENT")
        self.assertEqual(result["source_sha"], self.policy["expected_knowledge_sha"])
        self.assertFalse(result["canonical_write"])
        hits = cp.wikillm_search(self.policy, "single scheduler")
        self.assertTrue(any(hit["path"] == "20-Decisions/ADR-001.md" for hit in hits))
        self.assertFalse(cp.tencent_state(self.policy)["canonical_write"])
        self.assertEqual(cp.tencent_state(self.policy)["state"], "DEFERRED_NO_CREDENTIAL_REFERENCE")

    def test_exact_sha_evidence_and_blocked_task_keep_controller_alive(self) -> None:
        evidence = cp.doctor(self.policy)
        exact_checks = {item["id"]: item for item in evidence["checks"]}
        self.assertTrue(exact_checks["product_exact_clean"]["pass"])
        self.assertTrue(exact_checks["knowledge_exact_clean"]["pass"])
        process = subprocess.Popen(
            [
                self.policy["tools"]["python"],
                str(HERE / "ardesia_control_plane.py"),
                "--policy",
                str(self.policy_path),
                "controller",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            deadline = time.monotonic() + 8
            state = {}
            while time.monotonic() < deadline:
                state = cp.read_json(self.runtime / "state" / "mcp-controller.json", {}) or {}
                if state.get("heartbeat_count", 0) >= 1:
                    break
                time.sleep(0.1)
            self.assertIsNone(process.poll(), process.stderr.read() if process.poll() is not None else "")
            self.assertIn(state.get("state"), {"SAFE_MAINTENANCE", "PAUSED_SAFETY"})
        finally:
            process.terminate()
            process.wait(timeout=8)
            assert process.stderr is not None
            process.stderr.close()
        (self.runtime / "repos" / "ardesia" / "DIRTY").write_text("dirty\n", encoding="utf-8")
        self.assertEqual(cp.doctor(self.policy)["state"], "PAUSED_SAFETY")

    def test_launchd_schedules_and_required_reports(self) -> None:
        paths = cp.render_plists(self.policy, HERE / "ardesia_control_plane.py", self.policy_path, self.runtime / "launchd")
        payloads = {Path(path).stem: plistlib.loads(Path(path).read_bytes()) for path in paths}
        self.assertTrue(payloads["com.ardesia.mcp.controller"]["KeepAlive"])
        self.assertEqual(payloads["com.ardesia.mcp.mailbox"]["StartInterval"], 300)
        self.assertEqual(payloads["com.ardesia.mcp.watchdog"]["StartInterval"], 900)
        self.assertEqual(payloads["com.ardesia.mcp.review"]["StartCalendarInterval"]["Minute"], 0)
        cp.generate_reports(self.policy)
        required = {
            "MCP_CONTROL_PLANE_REPORT.md",
            "MCP_TOOL_INVENTORY.json",
            "MCP_AUTHZ_MATRIX.json",
            "CODEX_CONTROL_REPORT.md",
            "SCHEDULED_TASKS_REPORT.md",
            "FAILURE_INJECTION_REPORT.md",
            "ROLLBACK.md",
        }
        self.assertEqual(required, {path.name for path in (self.runtime / "reports").iterdir()})

    def test_status_cannot_be_ready_before_true_scheduled_evidence(self) -> None:
        self.assertEqual(cp.status_payload(self.policy)["state"], "PARTIAL_BOOTSTRAP_SAFE")
        cp.write_json(
            self.runtime / "state" / "mcp-controller.json",
            {"state": "SAFE_MAINTENANCE", "heartbeat_count": 3},
        )
        cp.write_json(self.runtime / "state" / "mailbox.json", {"state": "HEALTHY", "trigger": "scheduled"})
        review = self.runtime / "reviews" / "scheduled"
        review.mkdir()
        cp.write_json(review / "completion.json", {"state": "SAFE_MAINTENANCE", "trigger": "scheduled-hourly"})
        verification = {
            key: {"value": "PASS test", "recorded_at": cp.iso_now()}
            for key in {
                "controller_tests",
                "codex_app_server",
                "claude_writer",
                "watchdog_restart",
                "scheduled_hourly_review",
                "scheduled_mailbox",
                "logs_verified",
            }
        }
        cp.write_json(self.runtime / "state" / "verification.json", verification)
        self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")


if __name__ == "__main__":
    unittest.main(verbosity=2)
