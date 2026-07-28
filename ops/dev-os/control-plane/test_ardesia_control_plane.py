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
        npm = shutil.which("npm") or "/usr/bin/false"
        source["tools"] = {
            "python": shutil.which("python3") or "/usr/bin/python3",
            "git": self.git,
            "gh": "/usr/bin/false",
            "codex": "/usr/bin/false",
            "claude": "/usr/bin/false",
            "npm": npm,
            "ob": "/usr/bin/false",
        }
        source["writer"]["automatic_dispatch"] = False
        source["writer"]["requires_mailbox_directive"] = False
        source["loop"]["enabled"] = False
        for task in source["loop"]["tasks"]:
            task["base_sha"] = product_sha
            for command in task["verification_commands"]:
                command[0] = npm
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
        call = cp.strict_object(
            {"name": "run.status", "arguments": {}, "_meta": {"progressToken": 1}},
            {"name", "arguments", "_meta"},
            {"name", "arguments"},
            "tools/call",
        )
        self.assertEqual(call["name"], "run.status")
        with self.assertRaisesRegex(ValueError, "additional properties"):
            cp.strict_object(
                {"name": "run.status", "arguments": {}, "untrusted": True},
                {"name", "arguments", "_meta"},
                {"name", "arguments"},
                "tools/call",
            )

    def test_github_mcp_reads_only_the_authenticated_monitor_snapshot(self) -> None:
        snapshot = {
            "state": "CLEAR",
            "trigger": "test",
            "open_pr_count": 1,
            "task_overlaps": {"BETA-001-CONTINUITY-RUNTIME": []},
        }
        cp.write_json(self.runtime / "state" / "github-monitor.json", snapshot)
        self.assertEqual(cp.mcp_call(self.policy, "github.status", {}), snapshot)

    def test_command_environment_isolates_node25_experimental_webstorage(self) -> None:
        with mock.patch.dict(os.environ, {"NODE_OPTIONS": "--inspect"}, clear=False):
            environment = cp.command_environment()
        self.assertEqual(environment["NODE_OPTIONS"], "--no-experimental-webstorage")
        self.assertEqual(environment["GIT_TERMINAL_PROMPT"], "0")

    def test_reviewer_cli_version_gate_requires_model_compatible_release(self) -> None:
        self.assertFalse(cp.codex_cli_compatible("codex-cli 0.137.0-alpha.4"))
        self.assertFalse(cp.codex_cli_compatible("codex-cli 0.144.99"))
        self.assertTrue(cp.codex_cli_compatible("codex-cli 0.145.0"))
        self.assertTrue(cp.codex_cli_compatible("codex-cli 1.0.0"))

    def test_blocked_task_recovery_requires_exact_clean_immutable_worktree(self) -> None:
        task = self.policy["loop"]["tasks"][0]
        cp.ensure_productive_state(self.policy)
        cp.update_productive_state(
            self.policy,
            task["task_id"],
            "BLOCKED_CAUSAL",
            reason="baseline verification failed before writer dispatch",
            worker_pid=999999,
        )
        recovered = cp.recover_productive_task(
            self.policy,
            task["task_id"],
            "RECOVERED_AFTER_NODE25_WEBSTORAGE_ISOLATION",
        )
        self.assertEqual(recovered["state"], "PENDING")
        worktree = Path(recovered["worktree"])
        (worktree / "README.md").write_text("# Dirty\n", encoding="utf-8")
        cp.update_productive_state(
            self.policy,
            task["task_id"],
            "BLOCKED_CAUSAL",
            reason="synthetic retry",
            worker_pid=999999,
        )
        with self.assertRaisesRegex(ValueError, "exact clean admitted worktree"):
            cp.recover_productive_task(
                self.policy,
                task["task_id"],
                "RECOVERED_AFTER_SYNTHETIC_FAILURE",
            )

    def test_transient_claude_overload_recovery_is_session_bound_and_bounded(self) -> None:
        task = self.policy["loop"]["tasks"][0]
        run_directory = self.runtime / "artifacts" / "productive-runs" / task["task_id"]
        run_directory.mkdir(parents=True)
        cp.ensure_productive_state(self.policy)
        cp.update_productive_state(
            self.policy,
            task["task_id"],
            "BLOCKED_CAUSAL",
            reason="Claude repair invocation failed",
            session_id="session-a",
            run_directory=str(run_directory),
            repair_transport_retries=0,
        )
        response_path = run_directory / "repair-claude-response.json"
        cp.write_json(
            response_path,
            {
                "is_error": True,
                "result": 'API Error: {"type":"overloaded_error","message":"Overloaded"}',
                "session_id": "session-b",
            },
        )
        record = cp.read_json(cp.productive_state_path(self.runtime), {})["tasks"][task["task_id"]]
        self.assertFalse(cp.transient_repair_overload_is_recoverable(self.policy, task, record))
        cp.write_json(
            response_path,
            {
                "is_error": True,
                "result": 'API Error: {"type":"overloaded_error","message":"Overloaded"}',
                "session_id": "session-a",
            },
        )
        self.assertTrue(cp.transient_repair_overload_is_recoverable(self.policy, task, record))
        record["repair_transport_retries"] = 2
        self.assertFalse(cp.transient_repair_overload_is_recoverable(self.policy, task, record))

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
        comments_answer = {"exit": 0, "stdout": json.dumps(comments), "stderr": "", "argv": []}
        prs_answer = {"exit": 0, "stdout": "[]", "stderr": "", "argv": []}
        with mock.patch.object(cp, "run_tool", side_effect=[comments_answer, prs_answer]):
            result = cp.mailbox_poll(self.policy, "test")
        statuses = [item["status"] for item in result["directive_results"]]
        self.assertEqual(statuses, ["REJECTED", "VALIDATED_PENDING_SINGLE_SCHEDULER", "DUPLICATE_IGNORED"])
        self.assertEqual(result["github_monitor"]["state"], "CLEAR")

    def test_github_monitor_captures_ci_and_blocks_path_overlap(self) -> None:
        task = self.policy["loop"]["tasks"][0]
        pull_requests = [
            {
                "number": 42,
                "headRefName": "other/change",
                "headRefOid": "a" * 40,
                "isDraft": False,
                "updatedAt": "2026-07-28T00:00:00Z",
                "mergeStateStatus": "BLOCKED",
                "files": [{"path": task["allowed_path_patterns"][0]}],
                "statusCheckRollup": [
                    {"__typename": "CheckRun", "status": "COMPLETED", "conclusion": "FAILURE"},
                    {"__typename": "CheckRun", "status": "IN_PROGRESS", "conclusion": ""},
                ],
            }
        ]
        answer = {"exit": 0, "stdout": json.dumps(pull_requests), "stderr": "", "argv": []}
        with mock.patch.object(cp, "run_tool", return_value=answer):
            result = cp.github_monitor_snapshot(self.policy, "test")
        self.assertEqual(result["state"], "BLOCKING_OVERLAP")
        self.assertEqual(result["pull_requests"][0]["checks"]["failing"], 1)
        self.assertEqual(result["pull_requests"][0]["checks"]["pending"], 1)
        self.assertEqual(result["task_overlaps"][task["task_id"]][0]["number"], 42)

    def test_terminal_task_overlap_stays_in_ledger_without_poisoning_later_queue(self) -> None:
        state = cp.ensure_productive_state(self.policy)
        first = self.policy["loop"]["tasks"][0]
        unique_first_path = "apps/studio/src/lessonos/continuityProjection.ts"
        self.assertIn(unique_first_path, first["allowed_path_patterns"])
        cp.update_productive_state(
            self.policy,
            first["task_id"],
            "BLOCKED_CAUSAL",
            reason="independent review falsified the bounded attempt",
        )
        pull_requests = [
            {
                "number": 77,
                "headRefName": "other/terminal-overlap",
                "headRefOid": "b" * 40,
                "isDraft": False,
                "updatedAt": "2026-07-28T00:00:00Z",
                "mergeStateStatus": "CLEAN",
                "files": [{"path": unique_first_path}],
                "statusCheckRollup": [],
            }
        ]
        answer = {"exit": 0, "stdout": json.dumps(pull_requests), "stderr": "", "argv": []}
        with mock.patch.object(cp, "run_tool", return_value=answer):
            result = cp.github_monitor_snapshot(self.policy, "terminal-ledger-test")
        self.assertEqual(result["state"], "CLEAR")
        self.assertNotIn(first["task_id"], result["actionable_task_ids"])
        self.assertNotIn(first["task_id"], result["task_overlaps"])
        self.assertEqual(
            result["actionable_task_ids"],
            [
                task["task_id"]
                for task in self.policy["loop"]["tasks"]
                if state["tasks"][task["task_id"]]["state"] == "PENDING" and task["task_id"] != first["task_id"]
            ],
        )

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
            deadline = time.monotonic() + 30
            state = {}
            while time.monotonic() < deadline:
                state = cp.read_json(self.runtime / "state" / "mcp-controller.json", {}) or {}
                if state.get("heartbeat_count", 0) >= 1:
                    break
                time.sleep(0.1)
            self.assertIsNone(process.poll(), process.stderr.read() if process.poll() is not None else "")
            self.assertIn(state.get("state"), {"DISABLED", "READY_FOR_PRODUCTIVE_LOOP", "PAUSED_SAFETY"})
        finally:
            process.terminate()
            process.wait(timeout=15)
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
        self.assertEqual(
            payloads["com.ardesia.mcp.review"]["StartCalendarInterval"],
            [{"Minute": 0}, {"Minute": 30}],
        )
        self.assertTrue(payloads["com.ardesia.obsidian-sync"]["KeepAlive"])
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
            {"state": "READY_FOR_PRODUCTIVE_LOOP", "heartbeat_count": 3},
        )
        cp.write_json(self.runtime / "state" / "mailbox.json", {"state": "HEALTHY", "trigger": "scheduled"})
        review = self.runtime / "reviews" / "scheduled"
        review.mkdir()
        cp.write_json(review / "completion.json", {"state": "SAFE_MAINTENANCE", "trigger": "scheduled-30m"})
        verification = {
            key: {"value": "PASS test", "recorded_at": cp.iso_now()}
            for key in {
                "controller_tests",
                "codex_app_server",
                "claude_writer",
                "watchdog_restart",
                "scheduled_30m_review",
                "scheduled_mailbox",
                "logs_verified",
            }
        }
        cp.write_json(self.runtime / "state" / "verification.json", verification)
        self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")
        manual = self.runtime / "reviews" / "manual-after-scheduled"
        manual.mkdir()
        cp.write_json(
            manual / "completion.json",
            {"state": "READY_FOR_PRODUCTIVE_LOOP", "trigger": "operator-post-review"},
        )
        self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")

    def test_preapproved_queue_is_frozen_and_writer_diff_is_path_bounded(self) -> None:
        active = copy.deepcopy(self.policy)
        active["writer"]["automatic_dispatch"] = True
        active["loop"]["enabled"] = True
        active = cp.validate_policy(active)
        state = cp.ensure_productive_state(active)
        task = active["loop"]["tasks"][0]
        self.assertEqual(state["tasks"][task["task_id"]]["state"], "PENDING")
        changed = copy.deepcopy(active)
        changed["loop"]["tasks"][0]["title"] += " mutated"
        changed = cp.validate_policy(changed)
        with self.assertRaisesRegex(ValueError, "changed after admission"):
            cp.ensure_productive_state(changed)
        worktree = self.runtime / "worktrees" / "bounded"
        subprocess.run(
            [self.git, "-C", str(self.runtime / "repos" / "ardesia"), "worktree", "add", "-b", task["branch"], str(worktree)],
            check=True,
            capture_output=True,
        )
        dependency_source = self.runtime / "repos" / "ardesia" / cp.WORKTREE_DEPENDENCY_LINK
        dependency_source.mkdir(parents=True)
        dependency_target = worktree / cp.WORKTREE_DEPENDENCY_LINK
        dependency_target.parent.mkdir(parents=True, exist_ok=True)
        dependency_target.symlink_to(dependency_source, target_is_directory=True)
        self.assertTrue(cp.exact_dependency_link(active, worktree))
        self.assertEqual(cp.changed_paths(active, worktree), [])
        allowed = worktree / task["allowed_path_patterns"][0]
        allowed.parent.mkdir(parents=True, exist_ok=True)
        allowed.write_text("bounded\n", encoding="utf-8")
        self.assertEqual(cp.validate_writer_diff(active, task, worktree), [task["allowed_path_patterns"][0]])
        outside = worktree / "UNAUTHORIZED.md"
        outside.write_text("rejected\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "non-admitted"):
            cp.validate_writer_diff(active, task, worktree)

    def test_obsidian_writes_are_append_only_and_protected_paths_are_rejected(self) -> None:
        with mock.patch.object(cp, "obsidian_sync_status", return_value={"state": "NEEDS_AUTH_OR_SETUP"}):
            first = cp.governed_obsidian_write(
                self.policy,
                "91-Auto-Receipts/test.md",
                "---\nproject: ARDESIA\n---\n# Receipt\n",
            )
        self.assertEqual(first["state"], "PENDING_HEADLESS_SYNC")
        with mock.patch.object(cp, "obsidian_sync_status", return_value={"state": "NEEDS_AUTH_OR_SETUP"}):
            repeated = cp.governed_obsidian_write(
                self.policy,
                "91-Auto-Receipts/test.md",
                "---\nproject: ARDESIA\n---\n# Receipt\n",
            )
        self.assertEqual(repeated["sha256"], first["sha256"])
        with mock.patch.object(cp, "obsidian_sync_status", return_value={"state": "NEEDS_AUTH_OR_SETUP"}):
            with self.assertRaisesRegex(ValueError, "conflict"):
                cp.governed_obsidian_write(self.policy, "91-Auto-Receipts/test.md", "changed\n")
        with self.assertRaisesRegex(ValueError, "outside agent-owned"):
            cp.governed_obsidian_write(self.policy, "20-Decisions/ADR.md", "forbidden\n")


if __name__ == "__main__":
    unittest.main(verbosity=2)
