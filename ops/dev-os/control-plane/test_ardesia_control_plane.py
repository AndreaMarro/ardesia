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


class ImmediateProcess:
    def __init__(self) -> None:
        self.pid = 9876
        self.returncode = 0
        self.stdin = mock.Mock()
        self.stdout = mock.Mock()
        self.stderr = mock.Mock()

    def poll(self) -> int:
        return 0

    def terminate(self) -> None:
        return None

    def kill(self) -> None:
        return None

    def wait(self, timeout: object = None) -> int:
        return 0


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
            "headroom": "/usr/bin/false",
            "sandbox_exec": "/usr/bin/sandbox-exec",
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

    def _codex_probe_messages(
        self,
        *,
        command: str = "/bin/sleep 30",
        thread_binding: dict[str, str] | None = None,
        completion_status: str = "interrupted",
        resume_binding: dict[str, str] | None = None,
    ) -> list[dict[str, object]]:
        expected_binding = {
            "model": "gpt-5.6-sol",
            "modelProvider": "headroom",
            "reasoningEffort": "xhigh",
        }
        return [
            {"id": 0, "result": {}},
            {
                "id": 1,
                "result": {
                    "thread": {"id": "thread"},
                    **(thread_binding or expected_binding),
                },
            },
            {"id": 2, "result": {"turn": {"id": "turn"}}},
            {
                "method": "turn/started",
                "params": {"turn": {"id": "turn", "status": "inProgress"}},
            },
            {
                "method": "item/started",
                "params": {
                    "threadId": "thread",
                    "turnId": "turn",
                    "item": {
                        "id": "command",
                        "type": "commandExecution",
                        "command": command,
                        "status": "inProgress",
                    },
                },
            },
            {"id": 3, "result": {}},
            {
                "method": "turn/completed",
                "params": {
                    "threadId": "thread",
                    "turn": {"id": "turn", "status": completion_status},
                },
            },
            {
                "id": 4,
                "result": {
                    "thread": {"id": "thread"},
                    **(resume_binding or expected_binding),
                },
            },
        ]

    def test_strict_policy_and_mcp_schemas(self) -> None:
        invalid = copy.deepcopy(self.policy)
        invalid["unexpected"] = True
        with self.assertRaisesRegex(ValueError, "additional properties"):
            cp.validate_policy(invalid)
        invalid = copy.deepcopy(self.policy)
        invalid["context"]["writer_max_chars"] = 29_999
        with self.assertRaisesRegex(ValueError, "frozen writer and supervisor ceilings"):
            cp.validate_policy(invalid)
        invalid = copy.deepcopy(self.policy)
        invalid["context"]["unexpected"] = True
        with self.assertRaisesRegex(ValueError, "additional properties"):
            cp.validate_policy(invalid)
        for tool in cp.MCP_TOOLS:
            self.assertEqual(tool["inputSchema"]["$schema"], "https://json-schema.org/draft/2020-12/schema")
            self.assertFalse(tool["inputSchema"]["additionalProperties"])
        compile_schema = next(
            tool["inputSchema"]
            for tool in cp.MCP_TOOLS
            if tool["name"] == "knowledge.compile"
        )
        self.assertEqual(
            compile_schema["properties"]["maxChars"]["maximum"],
            30_000,
        )
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

    def test_headroom_policy_and_direct_ai_invocations_are_fail_closed(self) -> None:
        invalid = copy.deepcopy(self.policy)
        invalid["headroom"]["required"] = False
        with self.assertRaisesRegex(ValueError, "Headroom must remain required"):
            cp.validate_policy(invalid)
        invalid = copy.deepcopy(self.policy)
        invalid["hermes"]["enabled"] = True
        with self.assertRaisesRegex(ValueError, "Hermes must remain gated"):
            cp.validate_policy(invalid)
        with self.assertRaisesRegex(ValueError, "Headroom gateway binding missing"):
            cp.run_tool(self.policy, "claude", ["-p", "bypass"])
        with (
            mock.patch.object(
                cp,
                "headroom_status",
                return_value={
                    "state": "BLOCKED_REQUIRED_GATEWAY",
                    "failures": ["runtime_readiness"],
                    "diagnostic": "",
                },
            ),
            self.assertRaisesRegex(
                RuntimeError,
                "required Headroom gateway unavailable",
            ),
        ):
            cp.prepare_ai_invocation(
                self.policy,
                "codex",
                [
                    self.policy["tools"]["codex"],
                    "exec",
                    "--sandbox",
                    "read-only",
                    "bypass",
                ],
            )
        with self.assertRaisesRegex(ValueError, "required Headroom gateway adapter"):
            cp.run_command(["/usr/bin/claude", "-p", "bypass"])
        self.assertEqual(self.policy["headroom"]["retry_max_attempts"], 1)
        self.assertEqual(self.policy["headroom"]["request_timeout_seconds"], 10800)
        self.assertFalse(self.policy["headroom"]["rate_limit"])
        self.assertFalse(self.policy["headroom"]["subscription_tracking"])
        self.assertFalse(self.policy["headroom"]["read_lifecycle"])
        self.assertEqual(
            self.policy["headroom"]["client_network_boundaries"],
            {
                "claude": "SANDBOX_EXEC_HEADROOM_ONLY",
                "codex": "CODEX_NATIVE_READ_ONLY_ATTESTED_HEADROOM",
            },
        )
        self.assertEqual(
            cp.ai_network_sandbox_profile(self.policy),
            (
                "(version 1) (allow default) (deny network-outbound) "
                '(allow network-outbound (remote ip "localhost:8787"))'
            ),
        )
        with mock.patch.object(cp, "_completed_command") as command:
            with self.assertRaisesRegex(ValueError, "direct AI command rejected"):
                cp.run_command(
                    ["/usr/bin/env", "/opt/homebrew/bin/claude", "-p", "bypass"]
                )
            command.assert_not_called()

    def test_headroom_health_contract_is_exact_and_bounded(self) -> None:
        payload = {
            "service": "headroom-proxy",
            "status": "healthy",
            "ready": True,
            "version": "0.32.1",
            "checks": {
                "cache": {"enabled": False},
                "rate_limiter": {"enabled": False},
                "memory": {"enabled": False},
                "kompress": {"enabled": False},
            },
            "config": {
                "cache": False,
                "rate_limit": False,
                "memory": False,
                "learn": False,
                "disable_kompress": True,
                "disable_kompress_fallback": True,
                "disable_kompress_anthropic": True,
                "disable_kompress_openai": True,
                "runtime_env": {
                    "HEADROOM_OUTPUT_SHAPER": "0",
                    "HEADROOM_EFFORT_ROUTER": "0",
                    "HEADROOM_VERBOSITY_AUTOTUNE": "0",
                },
            },
        }
        frozen_arguments = [
            self.policy["tools"]["headroom"],
            "proxy",
            "--host",
            "127.0.0.1",
            "--port",
            "8787",
            "--workers",
            "1",
            "--mode",
            "token",
            "--stateless",
            "--lossless",
            "--no-cache",
            "--no-rate-limit",
            "--no-subscription-tracking",
            "--retry-max-attempts",
            "1",
            "--request-timeout-seconds",
            "10800",
            "--anthropic-buffered-request-timeout-seconds",
            "10800",
            "--no-memory-tools",
            "--no-memory-context",
            "--no-learn",
            "--no-telemetry",
            "--disable-kompress",
            "--disable-kompress-fallback",
            "--disable-kompress-anthropic",
            "--disable-kompress-openai",
            "--no-code-aware",
            "--no-read-lifecycle",
        ]
        frozen_environment = {
            "HEADROOM_STATELESS": "true",
            "HEADROOM_LOSSLESS": "1",
            "HEADROOM_TELEMETRY": "off",
            "HEADROOM_OUTPUT_SHAPER": "0",
            "HEADROOM_EFFORT_ROUTER": "0",
            "HEADROOM_VERBOSITY_AUTOTUNE": "0",
            "HEADROOM_MEMORY_INJECTION_MODE": "disabled",
            "HEADROOM_DISABLE_KOMPRESS": "1",
            "HEADROOM_DISABLE_KOMPRESS_FALLBACK": "1",
            "HEADROOM_DISABLE_KOMPRESS_ANTHROPIC": "1",
            "HEADROOM_DISABLE_KOMPRESS_OPENAI": "1",
        }
        self.assertEqual(
            [self.policy["tools"]["headroom"], *cp.headroom_proxy_arguments(self.policy)],
            frozen_arguments,
        )
        self.assertEqual(cp.headroom_gateway_environment(self.policy), frozen_environment)
        process_command = " ".join(frozen_arguments)
        self.assertEqual(
            cp.validate_headroom_health(
                self.policy,
                payload,
                process_command,
                "headroom, version 0.32.1",
            ),
            [],
        )
        payload["config"]["runtime_env"]["HEADROOM_OUTPUT_SHAPER"] = None
        self.assertIn(
            "runtime_headroom_output_shaper",
            cp.validate_headroom_health(
                self.policy,
                payload,
                process_command,
                "headroom, version 0.32.1",
            ),
        )
        first = copy.deepcopy(payload)
        first.update({"timestamp": "2026-07-28T10:00:00Z", "uptime_seconds": 1.0})
        first["config"]["pid"] = 100
        second = copy.deepcopy(first)
        second.update({"timestamp": "2026-07-28T10:30:00Z", "uptime_seconds": 1801.0})
        second["config"]["pid"] = 200
        self.assertEqual(
            cp.sha256_text(cp.canonical_json(cp.headroom_semantic_health(first))),
            cp.sha256_text(cp.canonical_json(cp.headroom_semantic_health(second))),
        )

    def test_headroom_stats_reject_boolean_and_negative_efficiency_values(self) -> None:
        payload = {
            "requests": {
                "total": 1,
                "by_provider": {},
                "by_model": {},
                "by_stack": {},
            },
            "cost": {"cost_with_headroom_usd": True},
            "request_logs": [
                {
                    "request_id": "bad-metrics",
                    "provider": "openai",
                    "model": "gpt-5.6-sol",
                    "tags": {
                        "stack": "ardesia-codex-route",
                        "client": "codex",
                    },
                    "input_tokens_original": True,
                    "input_tokens_optimized": -1,
                    "output_tokens": 10,
                    "tokens_saved": 0,
                    "optimization_latency_ms": 10**400,
                    "total_latency_ms": -5,
                    "prompt": "must-not-be-retained",
                    "headers": {"authorization": "must-not-be-retained"},
                    "messages": [{"content": "must-not-be-retained"}],
                }
            ],
        }
        response = mock.MagicMock()
        response.__enter__.return_value.read.return_value = json.dumps(payload).encode()
        with mock.patch.object(
            cp.urllib.request,
            "urlopen",
            return_value=response,
        ):
            stats = cp.headroom_request_stats(self.policy)
        route = stats["route_logs"][0]
        self.assertNotIn("input_tokens_original", route)
        self.assertNotIn("input_tokens_optimized", route)
        self.assertNotIn("optimization_latency_ms", route)
        self.assertNotIn("total_latency_ms", route)
        self.assertEqual(route["output_tokens"], 10)
        self.assertEqual(route["tokens_saved"], 0)
        self.assertNotIn("prompt", route)
        self.assertNotIn("headers", route)
        self.assertNotIn("messages", route)
        self.assertIsNone(stats["cost_with_headroom_usd"])

    def test_route_efficiency_aggregation_rejects_nonfinite_receipt(self) -> None:
        route_id = "ardesia-codex-overflow"
        binding = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "gateway_pid": 4321,
            "health_digest": "a" * 64,
            "route_id": route_id,
            "expected_client": "codex",
            "expected_provider": "openai",
            "requests_before": 0,
            "stats_before_digest": "b" * 64,
            "started_monotonic": time.monotonic(),
            "cost_before_usd": 0.0,
            "base_url": self.policy["headroom"]["openai_base_url"],
        }
        routes = [
            {
                "stack": route_id,
                "client": "codex",
                "provider": "openai",
                "request_id": f"overflow-{index}",
                "model": "gpt-5.6-sol",
                "failed": False,
                "input_tokens_original": 1e308,
            }
            for index in range(2)
        ]
        active = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "pid": 4321,
            "health_digest": "a" * 64,
            "failures": [],
        }
        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(
                cp,
                "headroom_request_stats",
                return_value={
                    "total": 2,
                    "digest": "c" * 64,
                    "route_logs": routes,
                    "cost_with_headroom_usd": 0.0,
                },
            ),
            self.assertRaisesRegex(RuntimeError, "non-finite route aggregate"),
        ):
            cp.attest_headroom_route(self.policy, "codex", binding)
        receipt_path = (
            self.runtime
            / "artifacts"
            / "headroom-routes"
            / f"{route_id}.json"
        )
        self.assertFalse(receipt_path.exists())

    def test_codex_route_attestation_rejects_wrong_bound_model(self) -> None:
        route_id = "ardesia-codex-wrong-model"
        binding = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "gateway_pid": 4321,
            "health_digest": "a" * 64,
            "route_id": route_id,
            "expected_client": "codex",
            "expected_provider": "openai",
            "expected_model": "gpt-5.6-sol",
            "requests_before": 0,
            "stats_before_digest": "b" * 64,
            "started_monotonic": time.monotonic(),
            "cost_before_usd": 0.0,
            "base_url": self.policy["headroom"]["openai_base_url"],
        }
        active = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "pid": 4321,
            "health_digest": "a" * 64,
            "failures": [],
        }
        stats = {
            "total": 1,
            "digest": "c" * 64,
            "route_logs": [
                {
                    "stack": route_id,
                    "client": "codex",
                    "provider": "openai",
                    "model": "gpt-5.6-sol",
                    "request_id": "right-model",
                    "failed": False,
                },
                {
                    "stack": route_id,
                    "client": "codex",
                    "provider": "openai",
                    "model": "gpt-5.5",
                    "request_id": "wrong-model",
                    "failed": False,
                }
            ],
            "cost_with_headroom_usd": 0.0,
        }
        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(cp, "headroom_request_stats", return_value=stats),
            mock.patch.object(cp.time, "sleep"),
            self.assertRaisesRegex(RuntimeError, "route correlation"),
        ):
            cp.attest_headroom_route(self.policy, "codex", binding)
        self.assertFalse(
            (
                self.runtime
                / "artifacts"
                / "headroom-routes"
                / f"{route_id}.json"
            ).exists()
        )
        stats["route_logs"][1]["model"] = "gpt-5.6-sol"
        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(cp, "headroom_request_stats", return_value=stats),
        ):
            attested = cp.attest_headroom_route(self.policy, "codex", binding)
        self.assertEqual(attested["expected_model"], "gpt-5.6-sol")
        receipt = cp.read_json(Path(attested["receipt_path"]), {})
        self.assertEqual(receipt["expected_model"], "gpt-5.6-sol")
        self.assertTrue(
            all(
                route["model"] == "gpt-5.6-sol"
                for route in receipt["route_requests"]
            )
        )

    def test_every_ai_command_requires_observed_headroom_request_delta(self) -> None:
        active = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "pid": 4321,
            "health_digest": "a" * 64,
            "failures": [],
        }
        completed = {
            "exit": 0,
            "stdout": "ok",
            "stderr": "",
            "argv": [],
        }
        captured_environments: list[dict[str, str]] = []

        def complete(
            arguments: object,
            *,
            cwd: object,
            timeout: int,
            max_chars: int,
            input_text: object,
            environment: dict[str, str],
        ) -> dict[str, object]:
            captured_environments.append(environment)
            return {**completed, "argv": list(arguments)}

        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(
                cp.uuid,
                "uuid4",
                return_value=mock.Mock(hex="clauderoute"),
            ),
            mock.patch.object(
                cp,
                "headroom_request_stats",
                side_effect=[
                    {
                        "total": 7,
                        "digest": "b" * 64,
                        "route_logs": [],
                        "cost_with_headroom_usd": 1.0,
                    },
                    RuntimeError("transient stats timeout"),
                    {
                        "total": 8,
                        "digest": "c" * 64,
                        "cost_with_headroom_usd": 1.48,
                        "route_logs": [
                            {
                                "stack": "ardesia-claude-clauderoute",
                                "client": "claude-code",
                                "provider": "anthropic",
                                "request_id": "hr-1",
                                "model": "claude-opus",
                                "failed": False,
                                "input_tokens_original": 25000,
                                "input_tokens_optimized": 25000,
                                "output_tokens": 900,
                                "tokens_saved": 0,
                                "savings_percent": 0.0,
                                "optimization_latency_ms": 1.5,
                                "total_latency_ms": 24000.0,
                            }
                        ],
                    },
                ],
            ),
            mock.patch.object(cp, "_completed_command", side_effect=complete),
        ):
            result = cp.run_ai_command(
                self.policy,
                "claude",
                [self.policy["tools"]["claude"], "-p", "probe"],
            )
        self.assertEqual(
            captured_environments[0]["ANTHROPIC_BASE_URL"],
            self.policy["headroom"]["base_url"],
        )
        self.assertEqual(
            captured_environments[0]["ANTHROPIC_CUSTOM_HEADERS"],
            "X-Headroom-Stack: ardesia-claude-clauderoute",
        )
        self.assertEqual(
            result["argv"][:3],
            [
                self.policy["tools"]["sandbox_exec"],
                "-p",
                cp.ai_network_sandbox_profile(self.policy),
            ],
        )
        self.assertTrue(result["headroom_binding"]["route_attested"])
        self.assertIsNone(result["headroom_binding"]["expected_model"])
        self.assertEqual(result["headroom_binding"]["request_delta"], 1)
        self.assertTrue(Path(result["headroom_binding"]["receipt_path"]).is_file())
        metrics = result["headroom_binding"]["efficiency_metrics"]
        self.assertEqual(metrics["request_count"], 1)
        self.assertEqual(metrics["input_tokens_original"], 25000)
        self.assertEqual(metrics["input_tokens_optimized"], 25000)
        self.assertEqual(metrics["output_tokens"], 900)
        self.assertEqual(metrics["tokens_saved"], 0)
        self.assertEqual(metrics["total_latency_ms"], 24000.0)
        self.assertGreaterEqual(metrics["controller_wall_ms"], 0.0)
        self.assertEqual(metrics["cost_attribution"], "GLOBAL_WINDOW_UPPER_BOUND")
        self.assertAlmostEqual(metrics["cost_window_delta_usd"], 0.48)
        receipt = cp.read_json(
            Path(result["headroom_binding"]["receipt_path"]),
            {},
        )
        self.assertIsNone(receipt["expected_model"])
        self.assertEqual(receipt["efficiency_metrics"], metrics)

        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(
                cp,
                "headroom_request_stats",
                side_effect=[
                    {"total": 9, "digest": "d" * 64, "route_logs": []},
                    *[
                        {"total": 9, "digest": "e" * 64, "route_logs": []}
                        for _ in range(5)
                    ],
                ],
            ),
            mock.patch.object(cp, "_completed_command", return_value=completed),
        ):
            with self.assertRaisesRegex(RuntimeError, "no proxied AI request observed"):
                cp.run_ai_command(
                    self.policy,
                    "codex",
                    [
                        self.policy["tools"]["codex"],
                        "exec",
                        "--sandbox",
                        "read-only",
                        "probe",
                    ],
                )

    def test_codex_routing_is_controller_owned_and_conflicts_are_rejected(self) -> None:
        active = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "pid": 4321,
            "health_digest": "a" * 64,
            "failures": [],
        }
        with (
            mock.patch.object(cp, "headroom_status", return_value=active),
            mock.patch.object(
                cp,
                "headroom_request_stats",
                return_value={"total": 1, "digest": "b" * 64, "route_logs": []},
            ),
        ):
            claude_arguments, _, claude_binding = cp.prepare_ai_invocation(
                self.policy,
                "claude",
                [self.policy["tools"]["claude"], "-p", "probe"],
            )
            self.assertEqual(
                claude_arguments[0],
                self.policy["tools"]["sandbox_exec"],
            )
            self.assertTrue(claude_binding["outer_sandbox"])
            self.assertEqual(
                claude_binding["network_boundary"],
                "SANDBOX_EXEC_HEADROOM_ONLY",
            )

            codex_arguments, _, codex_binding = cp.prepare_ai_invocation(
                self.policy,
                "codex",
                [
                    self.policy["tools"]["codex"],
                    "exec",
                    "--sandbox",
                    "read-only",
                    "probe",
                ],
            )
            self.assertEqual(
                codex_arguments[0],
                self.policy["tools"]["codex"],
            )
            self.assertNotIn(
                self.policy["tools"]["sandbox_exec"],
                codex_arguments,
            )
            self.assertFalse(codex_binding["outer_sandbox"])
            self.assertEqual(codex_binding["native_sandbox"], "read-only")
            self.assertIsNone(codex_binding["sandbox_profile_sha256"])
            self.assertIn('model_provider="headroom"', codex_arguments)
            self.assertEqual(
                codex_arguments.count('model="gpt-5.6-sol"'),
                1,
            )
            self.assertEqual(
                codex_arguments.count('model_reasoning_effort="xhigh"'),
                1,
            )
            self.assertEqual(codex_binding["expected_model"], "gpt-5.6-sol")
            self.assertFalse(
                any(
                    "allowProviderModelFallback" in item
                    for item in codex_arguments
                )
            )
            self.assertTrue(
                any(
                    item.startswith("model_providers.headroom.http_headers=")
                    and codex_binding["route_id"] in item
                    for item in codex_arguments
                )
            )
            app_server_arguments, _, app_server_binding = (
                cp.prepare_ai_invocation(
                    self.policy,
                    "codex",
                    [
                        self.policy["tools"]["codex"],
                        "app-server",
                        "--listen",
                        "stdio://",
                    ],
                )
            )
            self.assertEqual(
                app_server_arguments.count('model="gpt-5.6-sol"'),
                1,
            )
            self.assertEqual(
                app_server_arguments.count(
                    'model_reasoning_effort="xhigh"'
                ),
                1,
            )
            self.assertEqual(
                app_server_binding["expected_model"],
                "gpt-5.6-sol",
            )
            with self.assertRaisesRegex(ValueError, "native read-only sandbox"):
                cp.prepare_ai_invocation(
                    self.policy,
                    "codex",
                    [self.policy["tools"]["codex"], "exec", "probe"],
                )

            with self.assertRaisesRegex(ValueError, "stdio-only"):
                cp.prepare_ai_invocation(
                    self.policy,
                    "codex",
                    [
                        self.policy["tools"]["codex"],
                        "app-server",
                        "--listen",
                        "tcp://127.0.0.1:9999",
                    ],
                )

            for conflicting in (
                'model_provider="openai"',
                'model_providers.headroom.base_url="https://api.openai.com/v1"',
                'model="gpt-5.6-sol"',
                'model_reasoning_effort="xhigh"',
            ):
                with self.assertRaisesRegex(
                    ValueError,
                    "routing config is controller-owned",
                ):
                    cp.prepare_ai_invocation(
                        self.policy,
                        "codex",
                        [
                            self.policy["tools"]["codex"],
                            "exec",
                            "--sandbox",
                            "read-only",
                            "--config",
                            conflicting,
                            "probe",
                        ],
                    )
            with self.assertRaisesRegex(
                ValueError,
                "routing config is controller-owned",
            ):
                cp.prepare_ai_invocation(
                    self.policy,
                    "codex",
                    [
                        self.policy["tools"]["codex"],
                        "exec",
                        "--sandbox",
                        "read-only",
                        '-c=model_provider="openai"',
                        "probe",
                    ],
                )
            for flag in (
                "--oss",
                "--local-provider=ollama",
                "--profile=direct",
                "-p",
                "-p=direct",
                "-pdirect",
                "--remote",
                "--remote-auth-token-env=TOKEN",
                "--model=gpt-5.6-sol",
                "-m",
                "-m=gpt-5.6-sol",
            ):
                with self.assertRaisesRegex(
                    ValueError,
                    "routing flag is controller-owned",
                ):
                    cp.prepare_ai_invocation(
                        self.policy,
                        "codex",
                        [
                            self.policy["tools"]["codex"],
                            "exec",
                            "--sandbox",
                            "read-only",
                            flag,
                            "probe",
                        ],
                    )

    def test_codex_routing_rejects_ambiguous_native_sandbox_flags(self) -> None:
        codex = self.policy["tools"]["codex"]
        self.assertEqual(
            cp.codex_native_read_only_contract(
                [codex, "exec", "--sandbox=read-only", "probe"]
            ),
            "read-only",
        )
        for sandbox_arguments in (
            ["--sandbox", "read-only", "--sandbox", "read-only"],
            ["--sandbox=read-only", "--sandbox=read-only"],
            ["--sandbox", "read-only", "--sandbox", "workspace-write"],
            ["--sandbox=read-only", "--sandbox=workspace-write"],
            ["--sandbox", "read-only", "--sandbox=workspace-write"],
            ["--sandbox=workspace-write"],
        ):
            with self.subTest(sandbox_arguments=sandbox_arguments):
                with self.assertRaisesRegex(
                    ValueError,
                    "native read-only sandbox",
                ):
                    cp.codex_native_read_only_contract(
                        [codex, "exec", *sandbox_arguments, "probe"]
                    )

    def test_long_lived_claude_and_codex_paths_require_route_attestation(self) -> None:
        task = self.policy["loop"]["tasks"][0]
        worktree = self.runtime / "worktrees" / "long-lived"
        worktree.mkdir(parents=True)
        run_directory = self.runtime / "artifacts" / "productive-runs" / "long-lived"
        run_directory.mkdir(parents=True)
        binding = {"route_id": "route"}
        attested = {
            "route_id": "route",
            "route_attested": True,
            "receipt_path": str(self.runtime / "artifacts" / "headroom-routes" / "route.json"),
            "receipt_sha256": "a" * 64,
        }
        with (
            mock.patch.object(
                cp,
                "spawn_ai_process",
                return_value=(ImmediateProcess(), binding),
            ),
            mock.patch.object(
                cp,
                "attest_headroom_route",
                return_value=attested,
            ) as attester,
        ):
            writer = cp.invoke_claude_writer(
                self.policy,
                task,
                worktree,
                "bounded prompt",
                "session-id",
                run_directory,
                "implement",
                "lease-id",
            )
        self.assertEqual(writer["state"], "PASS")
        attester.assert_called_once_with(self.policy, "claude", binding)

        messages = self._codex_probe_messages()

        def read_fixture(
            _process: object,
            _timeout: float,
            predicate: object,
            _backlog: object = None,
        ) -> dict[str, object]:
            message = messages.pop(0)
            self.assertTrue(predicate(message))
            return message

        with (
            mock.patch.object(
                cp,
                "spawn_ai_process",
                return_value=(ImmediateProcess(), binding),
            ),
            mock.patch.object(cp, "read_message", side_effect=read_fixture),
            mock.patch.object(cp, "send_message"),
            mock.patch.object(
                cp,
                "attest_headroom_route",
                return_value=attested,
            ) as attester,
        ):
            probe = cp.codex_live_probe(self.policy)
        self.assertEqual(probe["state"], "PASS")
        attester.assert_called_once_with(self.policy, "codex", binding)
        self.assertEqual(messages, [])

    def test_codex_live_probe_interrupts_only_after_matching_sleep_command_started(self) -> None:
        binding = {"route_id": "route"}
        attested = {
            "route_id": "route",
            "route_attested": True,
            "receipt_path": str(self.runtime / "artifacts" / "headroom-routes" / "route.json"),
            "receipt_sha256": "a" * 64,
        }
        allowed_commands = (
            "/bin/sleep 30",
            "/bin/zsh -lc '/bin/sleep 30'",
        )
        for allowed_command in allowed_commands:
            with self.subTest(command=allowed_command):
                messages = self._codex_probe_messages(command=allowed_command)
                command_started = messages[4]
                command_start_observed = False
                sent_messages: list[dict[str, object]] = []

                def ordered_read_message(
                    _process: object,
                    _timeout: float,
                    predicate: object,
                    _backlog: object = None,
                ) -> dict[str, object]:
                    nonlocal command_start_observed
                    message = messages.pop(0)
                    if message is command_started:
                        invalid_messages = [
                            {**command_started, "method": "item/completed"},
                            {
                                **command_started,
                                "params": {**command_started["params"], "threadId": "other-thread"},
                            },
                            {
                                **command_started,
                                "params": {**command_started["params"], "turnId": "other-turn"},
                            },
                            {
                                **command_started,
                                "params": {
                                    **command_started["params"],
                                    "item": {
                                        **command_started["params"]["item"],
                                        "type": "reasoning",
                                    },
                                },
                            },
                            {
                                **command_started,
                                "params": {
                                    **command_started["params"],
                                    "item": {
                                        **command_started["params"]["item"],
                                        "command": "/bin/zsh -lc '/bin/sleep 30' extra",
                                    },
                                },
                            },
                            {
                                **command_started,
                                "params": {
                                    **command_started["params"],
                                    "item": {
                                        **command_started["params"]["item"],
                                        "status": "completed",
                                    },
                                },
                            },
                        ]
                        for invalid_message in invalid_messages:
                            self.assertFalse(predicate(invalid_message))
                        command_start_observed = True
                    self.assertTrue(predicate(message))
                    return message

                def ordered_send_message(
                    _process: object,
                    message: dict[str, object],
                ) -> None:
                    if message.get("method") == "turn/interrupt":
                        self.assertTrue(command_start_observed)
                    sent_messages.append(message)

                with (
                    mock.patch.object(
                        cp,
                        "spawn_ai_process",
                        return_value=(ImmediateProcess(), binding),
                    ),
                    mock.patch.object(cp, "read_message", side_effect=ordered_read_message),
                    mock.patch.object(cp, "send_message", side_effect=ordered_send_message),
                    mock.patch.object(
                        cp,
                        "attest_headroom_route",
                        return_value=attested,
                    ),
                ):
                    probe = cp.codex_live_probe(self.policy)

                self.assertEqual(probe["state"], "PASS")
                self.assertTrue(command_start_observed)
                self.assertEqual(messages, [])
                by_method = {
                    message["method"]: message
                    for message in sent_messages
                    if "method" in message
                }
                thread_params = by_method["thread/start"]["params"]
                self.assertEqual(thread_params["model"], "gpt-5.6-sol")
                self.assertEqual(thread_params["modelProvider"], "headroom")
                self.assertNotIn("allowProviderModelFallback", thread_params)
                turn_params = by_method["turn/start"]["params"]
                self.assertEqual(turn_params["model"], "gpt-5.6-sol")
                self.assertEqual(turn_params["effort"], "xhigh")
                self.assertNotIn("allowProviderModelFallback", turn_params)
                resume_params = by_method["thread/resume"]["params"]
                self.assertEqual(resume_params["model"], "gpt-5.6-sol")
                self.assertEqual(resume_params["modelProvider"], "headroom")
                self.assertEqual(resume_params["sandbox"], "read-only")
                self.assertNotIn("allowProviderModelFallback", resume_params)

    def test_codex_live_probe_rejects_wrong_thread_and_resume_bindings(self) -> None:
        binding = {"route_id": "route"}
        attested = {
            "route_id": "route",
            "route_attested": True,
            "receipt_path": str(self.runtime / "artifacts" / "headroom-routes" / "route.json"),
            "receipt_sha256": "a" * 64,
        }
        wrong_bindings = (
            (
                "thread-model",
                {"model": "gpt-5.5", "modelProvider": "headroom", "reasoningEffort": "xhigh"},
                None,
            ),
            (
                "thread-provider",
                {"model": "gpt-5.6-sol", "modelProvider": "openai", "reasoningEffort": "xhigh"},
                None,
            ),
            (
                "thread-effort",
                {"model": "gpt-5.6-sol", "modelProvider": "headroom", "reasoningEffort": "high"},
                None,
            ),
            (
                "resume-model",
                None,
                {"model": "gpt-5.5", "modelProvider": "headroom", "reasoningEffort": "xhigh"},
            ),
            (
                "resume-provider",
                None,
                {"model": "gpt-5.6-sol", "modelProvider": "openai", "reasoningEffort": "xhigh"},
            ),
            (
                "resume-effort",
                None,
                {"model": "gpt-5.6-sol", "modelProvider": "headroom", "reasoningEffort": "high"},
            ),
        )
        for label, thread_binding, resume_binding in wrong_bindings:
            with self.subTest(binding=label):
                messages = self._codex_probe_messages(
                    thread_binding=thread_binding,
                    resume_binding=resume_binding,
                )

                def read_fixture(
                    _process: object,
                    _timeout: float,
                    predicate: object,
                    _backlog: object = None,
                ) -> dict[str, object]:
                    message = messages.pop(0)
                    self.assertTrue(predicate(message))
                    return message

                with (
                    mock.patch.object(
                        cp,
                        "spawn_ai_process",
                        return_value=(ImmediateProcess(), binding),
                    ),
                    mock.patch.object(cp, "read_message", side_effect=read_fixture),
                    mock.patch.object(cp, "send_message"),
                    mock.patch.object(
                        cp,
                        "attest_headroom_route",
                        return_value=attested,
                    ),
                    self.assertRaisesRegex(RuntimeError, "binding mismatch"),
                ):
                    cp.codex_live_probe(self.policy)

    def test_codex_live_probe_requires_interrupted_turn_completion(self) -> None:
        messages = self._codex_probe_messages(completion_status="completed")

        def read_fixture(
            _process: object,
            _timeout: float,
            predicate: object,
            _backlog: object = None,
        ) -> dict[str, object]:
            message = messages.pop(0)
            if not predicate(message):
                raise TimeoutError("fixture message did not satisfy predicate")
            return message

        with (
            mock.patch.object(
                cp,
                "spawn_ai_process",
                return_value=(ImmediateProcess(), {"route_id": "route"}),
            ),
            mock.patch.object(cp, "read_message", side_effect=read_fixture),
            mock.patch.object(cp, "send_message"),
            self.assertRaisesRegex(TimeoutError, "did not satisfy predicate"),
        ):
            cp.codex_live_probe(self.policy)

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
        isolated = copy.deepcopy(self.policy)
        unique_first_path = "apps/studio/src/lessonos/terminalOnly.ts"
        isolated["loop"]["tasks"][0]["allowed_path_patterns"][0] = unique_first_path
        isolated = cp.validate_policy(isolated)
        state = cp.ensure_productive_state(isolated)
        first = isolated["loop"]["tasks"][0]
        cp.update_productive_state(
            isolated,
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
            result = cp.github_monitor_snapshot(isolated, "terminal-ledger-test")
        self.assertEqual(result["state"], "CLEAR")
        self.assertNotIn(first["task_id"], result["actionable_task_ids"])
        self.assertNotIn(first["task_id"], result["task_overlaps"])
        self.assertEqual(
            result["actionable_task_ids"],
            [
                task["task_id"]
                for task in isolated["loop"]["tasks"]
                if state["tasks"][task["task_id"]]["state"] == "PENDING" and task["task_id"] != first["task_id"]
            ],
        )

    def test_later_task_overlap_does_not_stall_current_nonoverlapping_task(self) -> None:
        active = copy.deepcopy(self.policy)
        active["writer"]["automatic_dispatch"] = True
        active["loop"]["enabled"] = True
        for index, task in enumerate(active["loop"]["tasks"]):
            task["allowed_path_patterns"] = [f"isolated/task-{index}.ts"]
            task["max_files"] = 1
        active = cp.validate_policy(active)
        cp.ensure_productive_state(active)
        first, second = active["loop"]["tasks"][:2]
        pull_requests = [
            {
                "number": 88,
                "headRefName": "other/later-task-only",
                "headRefOid": "c" * 40,
                "isDraft": False,
                "updatedAt": "2026-07-28T00:00:00Z",
                "mergeStateStatus": "CLEAN",
                "files": [{"path": second["allowed_path_patterns"][0]}],
                "statusCheckRollup": [],
            }
        ]
        answer = {
            "exit": 0,
            "stdout": json.dumps(pull_requests),
            "stderr": "",
            "argv": [],
        }
        with mock.patch.object(cp, "run_tool", return_value=answer):
            snapshot = cp.github_monitor_snapshot(active, "later-overlap")
        self.assertEqual(snapshot["state"], "BLOCKING_OVERLAP")
        self.assertEqual(snapshot["task_overlaps"][first["task_id"]], [])
        self.assertTrue(snapshot["task_overlaps"][second["task_id"]])
        cp.write_json(
            self.runtime / "state" / "obsidian.json",
            {"state": "ACTIVE_CONTINUOUS"},
        )
        clean_probe = {"pass": True}
        disk = shutil._ntuple_diskusage(
            total=200 * 1024**3,
            used=20 * 1024**3,
            free=180 * 1024**3,
        )
        version = {
            "exit": 0,
            "stdout": "codex-cli 0.145.0",
            "stderr": "",
            "argv": [],
        }
        with (
            mock.patch.object(cp, "git_probe", return_value=clean_probe),
            mock.patch.object(cp, "run_tool", return_value=version),
            mock.patch.object(cp.shutil, "disk_usage", return_value=disk),
        ):
            health = cp.doctor(active)
        github_check = next(
            item for item in health["checks"] if item["id"] == "github_continuous_monitor"
        )
        self.assertTrue(github_check["pass"])
        run_directory = self.runtime / "artifacts" / "later-overlap-gate"
        run_directory.mkdir(parents=True)
        with mock.patch.object(cp, "github_monitor_snapshot", return_value=snapshot):
            cp.github_phase_gate(active, first, run_directory, "first")
            with self.assertRaisesRegex(ValueError, "open PR path overlap"):
                cp.github_phase_gate(active, second, run_directory, "second")

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
        renewed = cp.renew_writer_lease(
            self.policy,
            isolated,
            lease["lease_id"],
            ttl_seconds=30,
        )
        self.assertEqual(renewed["renewal_count"], 1)
        lease_path = cp.writer_lease_path(self.runtime)
        valid_lease = cp.read_json(lease_path)
        wrong_identity = dict(valid_lease)
        wrong_identity["identity"] = "reviewer-codex"
        cp.write_json(lease_path, wrong_identity)
        with self.assertRaisesRegex(ValueError, "lease mismatch"):
            cp.release_writer_lease(self.policy, isolated, lease["lease_id"])
        wrong_pid = dict(valid_lease)
        wrong_pid["pid"] = os.getpid() + 1
        cp.write_json(lease_path, wrong_pid)
        with self.assertRaisesRegex(ValueError, "owner mismatch"):
            cp.release_writer_lease(self.policy, isolated, lease["lease_id"])
        inactive = dict(valid_lease)
        inactive["state"] = "RELEASED_STALE"
        cp.write_json(lease_path, inactive)
        with self.assertRaisesRegex(ValueError, "owner mismatch"):
            cp.release_writer_lease(self.policy, isolated, lease["lease_id"])
        cp.write_json(lease_path, valid_lease)
        released = cp.release_writer_lease(
            self.policy,
            isolated,
            lease["lease_id"],
            "RELEASED_TEST",
        )
        self.assertEqual(released["state"], "RELEASED_TEST")
        with self.assertRaisesRegex(ValueError, "not active"):
            cp.validate_writer_lease(self.policy, isolated, lease["lease_id"])

    def test_wikillm_is_real_derived_exact_sha_and_never_canonical_write(self) -> None:
        result = cp.wikillm_ingest(self.policy)
        self.assertEqual(result["state"], "INDEXED_CURRENT")
        self.assertEqual(result["source_sha"], self.policy["expected_knowledge_sha"])
        self.assertFalse(result["canonical_write"])
        hits = cp.wikillm_search(self.policy, "single scheduler")
        self.assertTrue(any(hit["path"] == "20-Decisions/ADR-001.md" for hit in hits))
        self.assertFalse(cp.hermes_state(self.policy)["canonical_write"])
        self.assertFalse(cp.hermes_state(self.policy)["enabled"])
        self.assertFalse(cp.hermes_state(self.policy)["scheduler_enabled"])
        self.assertTrue(cp.hermes_state(self.policy)["headroom_required"])
        self.assertEqual(cp.hermes_state(self.policy)["provider"], "openai-codex")
        self.assertEqual(
            cp.hermes_state(self.policy)["state"],
            "DISABLED_HERMES_HEADROOM_BYPASS_5875",
        )
        self.assertTrue(
            cp.hermes_state(self.policy)["upstream_blocker"].endswith("/5875")
        )

    def test_wikillm_slug_rerank_is_pure_stable_and_conservative(self) -> None:
        self.assertEqual(
            cp.wikillm_significant_tokens("Per la Continuità del docente"),
            ("continuita", "docente"),
        )
        self.assertEqual(
            cp.wikillm_significant_tokens("Perché già più Continuità"),
            ("continuita",),
        )
        self.assertEqual(
            cp.wikillm_significant_tokens(
                "Quando ARDESIA teacher dashboard 2026 07 21"
            ),
            ("ardesia", "teacher", "dashboard"),
        )
        self.assertEqual(
            cp.wikillm_slug_tokens(
                "ardesia/2026-07-21-teacher-dashboard.md"
            ),
            {"teacher", "dashboard"},
        )
        self.assertEqual(
            cp.wikillm_path_slug_score(
                ("teacher", "dashboard"),
                "ardesia/2026-07-21-teacher-dashboard.md",
            ),
            1.0,
        )
        self.assertGreater(
            cp.wikillm_path_slug_score(
                ("teacher", "dashboard"),
                "very/deep/directory/teacher-dashboard.md",
            ),
            cp.wikillm_path_slug_score(
                ("teacher", "dashboard"),
                "dashboard.md",
            ),
        )
        candidates = [
            {"path": "20-Decisions/ADR-001.md", "sha256": "a" * 64},
            {"path": "dashboard.md", "sha256": "b" * 64},
            {
                "path": "deep/irrelevant/directories/Teacher-Dashboard.md",
                "sha256": "c" * 64,
            },
        ]
        original = copy.deepcopy(candidates)
        untouched = cp.wikillm_stable_slug_rerank("unmatched phrase", candidates)
        self.assertEqual(untouched, original)
        self.assertEqual([id(item) for item in untouched], [id(item) for item in candidates])

        reranked = cp.wikillm_stable_slug_rerank("teacher dashboard", candidates)
        self.assertEqual(reranked[0]["path"], candidates[2]["path"])
        self.assertCountEqual(
            [item["sha256"] for item in reranked],
            [item["sha256"] for item in candidates],
        )
        self.assertEqual(candidates, original)
        accent_match = cp.wikillm_stable_slug_rerank(
            "continuità",
            [
                {"path": "continual.md"},
                {"path": "deep/path/continuita.md"},
            ],
        )
        self.assertEqual(accent_match[0]["path"], "deep/path/continuita.md")

    def test_wikillm_search_fetches_twenty_then_reranks_and_slices(self) -> None:
        database = self.runtime / "state" / "wikillm.sqlite"
        database.touch()
        rows_without_body = [
            {
                "path": "20-Decisions/general-note.md",
                "sha256": "a" * 64,
                "title": "General note",
                "kind": "DECISION",
                "status": "ACCEPTED",
                "headings": "General",
                "supersedes": "",
                "source_commit": self.policy["expected_knowledge_sha"],
                "snippet": "teacher dashboard",
                "score": -9.0,
            },
            {
                "path": "40-Product-Canon/teacher-dashboard.md",
                "sha256": "b" * 64,
                "title": "Product surface",
                "kind": "CANON",
                "status": "ACCEPTED",
                "headings": "Surface",
                "supersedes": "",
                "source_commit": self.policy["expected_knowledge_sha"],
                "snippet": "teacher dashboard",
                "score": -1.0,
            },
        ]
        cursor = mock.Mock()
        cursor.fetchall.return_value = rows_without_body
        connection = mock.Mock()
        connection.execute.return_value = cursor
        with mock.patch.object(cp.sqlite3, "connect", return_value=connection):
            hits = cp.wikillm_search(
                self.policy,
                "teacher dashboard",
                limit=1,
                include_body=False,
            )
        sql = connection.execute.call_args.args[0]
        sql_parameters = connection.execute.call_args.args[1]
        self.assertNotIn("n.body", sql)
        self.assertEqual(sql_parameters[1], 20)
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0]["path"], rows_without_body[1]["path"])
        self.assertEqual(hits[0]["sha256"], rows_without_body[1]["sha256"])
        self.assertNotIn("body", hits[0])
        self.assertEqual(hits[0]["score"], rows_without_body[1]["score"])
        connection.close.assert_called_once_with()

        rows_with_body = [
            {**row, "body": f"body-{index}"}
            for index, row in enumerate(rows_without_body)
        ]
        body_cursor = mock.Mock()
        body_cursor.fetchall.return_value = rows_with_body
        body_connection = mock.Mock()
        body_connection.execute.return_value = body_cursor
        with mock.patch.object(
            cp.sqlite3,
            "connect",
            return_value=body_connection,
        ):
            body_hits = cp.wikillm_search(
                self.policy,
                "teacher dashboard",
                limit=1,
                include_body=True,
            )
        self.assertIn("n.body", body_connection.execute.call_args.args[0])
        self.assertEqual(body_hits[0]["body"], rows_with_body[1]["body"])
        body_connection.close.assert_called_once_with()

        for invalid_limit in (0, 21, True):
            with self.subTest(invalid_limit=invalid_limit), self.assertRaisesRegex(
                ValueError,
                "limit must be an integer from 1 to 20",
            ):
                cp.wikillm_search(self.policy, "teacher dashboard", limit=invalid_limit)

    def test_wikillm_does_not_publish_a_moving_source_snapshot(self) -> None:
        initial = cp.wikillm_ingest(self.policy)
        database = self.runtime / "state" / "wikillm.sqlite"
        original_database_sha = cp.sha256_file(database)
        source = cp.wikillm_source(self.policy)
        changed = dict(source)
        changed["source_sha"] = "f" * 64
        with mock.patch.object(cp, "wikillm_source", side_effect=[source, changed]):
            with self.assertRaisesRegex(ValueError, "changed during two-phase ingest"):
                cp.wikillm_ingest(self.policy)
        self.assertEqual(cp.sha256_file(database), original_database_sha)
        self.assertEqual(initial["database_sha256"], original_database_sha)
        self.assertFalse(list((self.runtime / "state").glob(".wikillm.*.sqlite")))

    def test_agent_receipts_remain_searchable_without_self_exciting_material_digest(self) -> None:
        vault = self.runtime / self.policy["obsidian"]["vault_path"]
        canonical = vault / "20-Decisions" / "ADR-TEST.md"
        generated = vault / "92-Evidence" / "CYCLE.md"
        canonical.parent.mkdir(parents=True, exist_ok=True)
        generated.parent.mkdir(parents=True, exist_ok=True)
        canonical.write_text("# Canonical decision\n", encoding="utf-8")
        generated.write_text("# Generated cycle one\n", encoding="utf-8")
        cp.write_json(
            self.runtime / "state" / "obsidian.json",
            {"state": "ACTIVE_CONTINUOUS"},
        )
        first = cp.wikillm_source(self.policy)
        generated.write_text("# Generated cycle two\n", encoding="utf-8")
        second = cp.wikillm_source(self.policy)
        self.assertNotEqual(first["source_sha"], second["source_sha"])
        self.assertEqual(
            first["material_source_sha"],
            second["material_source_sha"],
        )
        canonical.write_text("# Canonical decision changed\n", encoding="utf-8")
        third = cp.wikillm_source(self.policy)
        self.assertNotEqual(
            second["material_source_sha"],
            third["material_source_sha"],
        )

        checks = {"state": "READY", "reason": "stable"}
        github = {
            "inventory_digest": "a" * 64,
            "state": "CLEAR",
            "task_overlaps": {},
        }
        mailbox = {"directives": {}}
        headroom = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "health_digest": "b" * 64,
            "launch_contract_digest": "c" * 64,
        }
        hermes = {"state": "DISABLED_HERMES_HEADROOM_BYPASS_5875"}
        obsidian = {"state": "ACTIVE_CONTINUOUS"}
        productive = {"tasks": {}}
        context = {
            "content_digest": "d" * 64,
            "required_sources": {"manifest_digest": "e" * 64},
        }
        wiki = {
            "source_mode": "OBSIDIAN_HEADLESS_LIVE",
            "source_sha": first["source_sha"],
            "material_source_sha": first["material_source_sha"],
        }
        digest_one = cp.scientific_material_digest(
            checks,
            github,
            wiki,
            mailbox,
            headroom,
            hermes,
            obsidian,
            productive,
            context,
            "8" * 64,
        )
        wiki["source_sha"] = second["source_sha"]
        context["content_digest"] = "f" * 64
        digest_two = cp.scientific_material_digest(
            checks,
            github,
            wiki,
            mailbox,
            headroom,
            hermes,
            obsidian,
            productive,
            context,
            "8" * 64,
        )
        self.assertEqual(digest_one, digest_two)
        self.assertNotEqual(
            digest_one,
            cp.scientific_material_digest(
                checks,
                github,
                wiki,
                mailbox,
                headroom,
                hermes,
                obsidian,
                productive,
                context,
                "9" * 64,
            ),
        )
        wiki["material_source_sha"] = third["material_source_sha"]
        self.assertNotEqual(
            digest_two,
            cp.scientific_material_digest(
                checks,
                github,
                wiki,
                mailbox,
                headroom,
                hermes,
                obsidian,
                productive,
                context,
                "8" * 64,
            ),
        )

    def test_unchanged_scientific_material_skips_all_ai_and_obsidian(self) -> None:
        material_digest = "a" * 64
        cp.write_json(
            self.runtime / "state" / "latest-review.json",
            {
                "review_id": "prior-scheduled-audit",
                "trigger": "scheduled-30m",
                "state": "READY_FOR_PRODUCTIVE_LOOP",
                "audit_execution_state": "PASS",
                "material_digest": material_digest,
                "completed_at": "2026-07-28T18:32:10Z",
                "manifest_digest": "b" * 64,
            },
        )
        cp.write_json(
            self.runtime / "state" / "obsidian.json",
            {"state": "ACTIVE_CONTINUOUS"},
        )
        deterministic_checks = {
            "state": "READY_FOR_PRODUCTIVE_LOOP",
            "reason": "stable",
            "checks": [],
        }
        with (
            mock.patch.object(
                cp,
                "github_monitor_snapshot",
                return_value={"state": "CLEAR", "inventory_digest": "c" * 64},
            ),
            mock.patch.object(cp, "doctor", return_value=deterministic_checks),
            mock.patch.object(
                cp,
                "wikillm_ingest",
                return_value={
                    "state": "INDEXED_CURRENT",
                    "source_mode": "OBSIDIAN_HEADLESS_LIVE",
                    "notes": 1,
                    "material_source_sha": "d" * 64,
                },
            ),
            mock.patch.object(
                cp,
                "headroom_status",
                return_value={
                    "state": "ACTIVE_REQUIRED_GATEWAY",
                    "health_digest": "e" * 64,
                    "launch_contract_digest": "f" * 64,
                },
            ),
            mock.patch.object(
                cp,
                "compile_context",
                return_value={
                    "schema_version": 1,
                    "required_sources": {"manifest_digest": "1" * 64},
                    "context_digest": "2" * 64,
                },
            ),
            mock.patch.object(
                cp,
                "scientific_material_digest",
                return_value=material_digest,
            ),
            mock.patch.object(cp, "build_scientific_audit_input") as build_input,
            mock.patch.object(cp, "codex_scientific_audit") as audit,
            mock.patch.object(cp, "run_ai_command") as ai_command,
            mock.patch.object(cp, "governed_obsidian_write") as obsidian_write,
        ):
            result = cp.scientific_review(self.policy, "scheduled-30m")

        self.assertEqual(result["state"], "SKIP_NO_AI")
        self.assertEqual(result["audit_execution_state"], "SKIPPED_NO_AI")
        self.assertEqual(result["efficiency_metrics"]["ai_calls"], 0)
        self.assertEqual(
            result["last_successful_scheduled_audit"]["review_id"],
            "prior-scheduled-audit",
        )
        self.assertEqual(
            result["last_successful_scheduled_audit"]["state"],
            "READY_FOR_PRODUCTIVE_LOOP",
        )
        build_input.assert_not_called()
        audit.assert_not_called()
        ai_command.assert_not_called()
        obsidian_write.assert_not_called()
        directory = Path(result["path"])
        self.assertTrue((directory / "skip.json").is_file())
        self.assertFalse((directory / "scientific-audit.json").exists())

    def test_changed_scientific_cycle_surfaces_bounded_efficiency_metrics(self) -> None:
        directory = self.runtime / "reviews" / "changed-efficiency"
        directory.mkdir(parents=True)
        audit_input = {"bounded": "audit-input"}
        supervisor_context = {"bounded": "supervisor-context"}
        route_metrics = {
            "request_count": 1,
            "input_tokens_original": 25000.0,
            "input_tokens_optimized": 25000.0,
            "output_tokens": 900.0,
            "tokens_saved": 0.0,
            "optimization_latency_ms": 1.5,
            "total_latency_ms": 24000.0,
            "controller_wall_ms": 24001.0,
            "cost_attribution": "GLOBAL_WINDOW_UPPER_BOUND",
            "cost_window_delta_usd": 0.48,
        }
        audit = {
            "classification": "VERIFIED_STABLE",
            "hypothesis": "the changed material remains governed",
            "summary": "the bounded audit completed",
            "observations": [],
            "falsifiers": ["the route receipt is absent"],
            "next_action": "retain the evidence boundary",
            "queue_proposal": None,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "headroom_route_receipt": {
                "route_id": "route-test",
                "path": "headroom-route.json",
                "sha256": "f" * 64,
                "efficiency_metrics": route_metrics,
            },
        }

        def complete_audit(
            policy: dict[str, object],
            audit_directory: Path,
            bounded_input: dict[str, object],
        ) -> dict[str, object]:
            self.assertEqual(policy, self.policy)
            self.assertEqual(audit_directory, directory)
            self.assertEqual(bounded_input, audit_input)
            cp.write_json(directory / "scientific-audit.json", audit, 0o640)
            return audit

        with (
            mock.patch.object(
                cp,
                "github_monitor_snapshot",
                return_value={"state": "CLEAR", "inventory_digest": "a" * 64},
            ),
            mock.patch.object(
                cp,
                "doctor",
                return_value={
                    "state": "READY_FOR_PRODUCTIVE_LOOP",
                    "reason": "test",
                    "checks": [],
                },
            ),
            mock.patch.object(
                cp,
                "wikillm_ingest",
                return_value={
                    "state": "INDEXED_CURRENT",
                    "source_mode": "OBSIDIAN_HEADLESS_LIVE",
                    "notes": 1,
                },
            ),
            mock.patch.object(
                cp,
                "headroom_status",
                return_value={"state": "ACTIVE_REQUIRED_GATEWAY"},
            ),
            mock.patch.object(cp, "compile_context", return_value=supervisor_context),
            mock.patch.object(
                cp,
                "scientific_material_digest",
                return_value="a" * 64,
            ),
            mock.patch.object(
                cp,
                "build_scientific_audit_input",
                return_value=audit_input,
            ),
            mock.patch.object(cp, "codex_scientific_audit", side_effect=complete_audit),
            mock.patch.object(cp, "generate_reports"),
        ):
            result = cp._scientific_review(
                self.policy,
                "scheduled-30m",
                "changed-efficiency",
                directory,
            )
        self.assertEqual(
            result["efficiency_metrics"],
            {
                "ai_calls": 1,
                "audit_input_chars": len(cp.canonical_json(audit_input)),
                "supervisor_context_chars": len(
                    cp.canonical_json(supervisor_context)
                ),
                "route": route_metrics,
            },
        )

    def test_blocked_scheduled_pass_is_not_preserved_by_scientific_skip(self) -> None:
        directory = self.runtime / "reviews" / "blocked-pass-skip"
        directory.mkdir(parents=True)
        result = cp.complete_scientific_skip(
            self.policy,
            "scheduled-30m",
            "blocked-pass-skip",
            directory,
            "a" * 64,
            {
                "review_id": "blocked-scheduled-audit",
                "trigger": "scheduled-30m",
                "state": "BLOCKED_CAUSAL",
                "audit_execution_state": "PASS",
                "completed_at": "2026-07-28T18:32:10Z",
                "manifest_digest": "b" * 64,
            },
            {"context_digest": "c" * 64},
        )
        self.assertIsNone(result["last_successful_scheduled_audit"])

    def test_wikillm_ingest_ignores_an_outer_handled_exception(self) -> None:
        try:
            raise RuntimeError("outer handled exception")
        except RuntimeError:
            result = cp.wikillm_ingest(self.policy)
        database = self.runtime / "state" / "wikillm.sqlite"
        self.assertEqual(result["state"], "INDEXED_CURRENT")
        self.assertTrue(database.is_file())
        self.assertEqual(result["database_sha256"], cp.sha256_file(database))
        self.assertFalse(list((self.runtime / "state").glob(".wikillm.*.sqlite")))

    def test_required_source_budget_cannot_starve_scientific_history(self) -> None:
        contents = {
            "bootstrap": "b" * 4_000,
            "autopilot_nonstop": "a" * 1_000,
            "prior_findings": "p" * 12_000,
            "scientific_analysis": "s" * 50_000,
            "coordination": "c" * 100_000,
            "root_agents": "r" * 8_000,
        }
        allocations = cp.allocate_required_source_content(contents, 20_000)
        self.assertEqual(sum(allocations.values()), 20_000)
        self.assertTrue(all(allocations[source_id] > 0 for source_id in contents))
        self.assertGreater(allocations["scientific_analysis"], 0)
        self.assertGreater(
            allocations["prior_findings"],
            allocations["coordination"],
        )

    def test_context_packet_ceiling_bounds_every_rich_section(self) -> None:
        oversized_notes = [
            {
                "title": f"Note {index}",
                "path": f"20-Decisions/ADR-{index:03d}.md",
                "sha256": f"{index:064x}"[-64:],
                "source_commit": "obsidian:" + "a" * 64,
                "body": "knowledge-" * 10_000,
            }
            for index in range(20)
        ]
        oversized_sources = {
            "schema_version": 1,
            "entries": [
                {
                    "source_id": source_id,
                    "root": "runtime",
                    "path": f"sources/{source_id}.md",
                    "authority": "EXTERNAL_OPERATOR_SOURCE",
                    "sha256": "b" * 64,
                    "bytes": 100_000,
                    "content": "source-" * 20_000,
                    "content_included_chars": 140_000,
                    "content_omitted_chars": 0,
                    "content_truncated": False,
                }
                for source_id in cp.REQUIRED_SOURCE_CONTENT_PRIORITY
            ],
            "manifest_digest": "c" * 64,
            "content_budget_chars": 1_000_000,
            "content_used_chars": 1_000_000,
            "content_priority": list(cp.REQUIRED_SOURCE_CONTENT_PRIORITY),
        }
        with (
            mock.patch.object(cp, "wikillm_search", return_value=oversized_notes),
            mock.patch.object(
                cp,
                "required_source_context",
                return_value=oversized_sources,
            ),
            mock.patch.object(
                cp,
                "prior_run_context",
                return_value=[{"summary": "prior-" * 20_000}],
            ),
            mock.patch.object(
                cp,
                "external_directive_context",
                return_value=[{"directive": {"payload": "directive-" * 20_000}}],
            ),
            mock.patch.object(
                cp,
                "git_history_context",
                return_value={"entries": ["history-" * 20_000]},
            ),
        ):
            packet = cp.compile_context(
                self.policy,
                "bounded scientific context",
                max_chars=30_000,
                persist=False,
                task=None,
            )
        self.assertLessEqual(len(cp.canonical_json(packet)), 30_000)
        self.assertEqual(packet["budget"]["limit_chars"], 30_000)
        self.assertEqual(
            packet["budget"]["serialized_chars"],
            len(cp.canonical_json(packet)),
        )
        self.assertTrue(packet["budget"]["truncated"])
        self.assertEqual(
            packet["required_sources"]["manifest_digest"],
            "c" * 64,
        )
        self.assertTrue(
            all("sha256" in entry for entry in packet["required_sources"]["entries"])
        )
        for entry in packet["required_sources"]["entries"]:
            self.assertGreater(
                len(entry["content"]),
                0,
                msg=f"required source starved: {entry['source_id']}",
            )
            self.assertEqual(
                entry["content_included_chars"],
                len(entry["content"]),
            )
            self.assertEqual(
                entry["content_omitted_chars"],
                140_000 - len(entry["content"]),
            )
            self.assertEqual(
                entry["content_truncated"],
                entry["content_omitted_chars"] > 0,
            )
        self.assertEqual(
            packet["required_sources"]["content_used_chars"],
            sum(
                len(entry["content"])
                for entry in packet["required_sources"]["entries"]
            ),
        )
        content_by_source = {
            entry["source_id"]: entry["content"]
            for entry in packet["required_sources"]["entries"]
        }
        self.assertGreater(
            len(content_by_source["bootstrap"]),
            len(content_by_source["scientific_analysis"]),
        )
        stable_for_digest = {
            key: value
            for key, value in packet.items()
            if key not in {"compiled_at", "content_digest", "context_digest"}
        }
        self.assertEqual(
            packet["content_digest"],
            cp.sha256_text(cp.canonical_json(stable_for_digest)),
        )
        context_for_digest = {
            key: value for key, value in packet.items() if key != "context_digest"
        }
        self.assertEqual(
            packet["context_digest"],
            cp.sha256_text(cp.canonical_json(context_for_digest)),
        )
        writer_prompt = cp.build_writer_prompt(
            self.policy,
            self.policy["loop"]["tasks"][0],
            packet,
            {"state": "CLEAR", "overlaps": []},
        )
        context_marker = (
            "VERIFIED sources over proposed/reference material and preserve "
            "provenance.\n"
        )
        embedded_context = writer_prompt.split(context_marker, 1)[1].split(
            "\n\nBefore editing,",
            1,
        )[0]
        self.assertEqual(embedded_context, cp.canonical_json(packet))
        self.assertLessEqual(
            len(embedded_context),
            self.policy["context"]["writer_max_chars"],
        )

    def test_final_context_trimming_keeps_section_metadata_truthful(self) -> None:
        source_content = "required-" * 1_000
        supplemental = cp.bounded_json_section(
            {"text": "supplemental-" * 1_000},
            5_000,
        )
        packet = cp.finalize_context_packet(
            {
                "schema_version": 1,
                "supplemental": supplemental,
                "notes": [{"content": "note-" * 1_000}],
                "required_sources": {
                    "schema_version": 1,
                    "entries": [
                        {
                            "source_id": source_id,
                            "root": "runtime",
                            "path": f"sources/{source_id}.md",
                            "authority": "EXTERNAL_OPERATOR_SOURCE",
                            "sha256": character * 64,
                            "bytes": len(source_content),
                            "content": source_content,
                            "content_included_chars": len(source_content),
                            "content_omitted_chars": 0,
                            "content_truncated": False,
                        }
                        for source_id, character in (
                            ("bootstrap", "a"),
                            ("autopilot_nonstop", "b"),
                            ("prior_findings", "c"),
                            ("scientific_analysis", "d"),
                        )
                    ],
                    "manifest_digest": "e" * 64,
                },
            },
            3_000,
            compiled_at="2026-07-28T18:00:00Z",
        )
        bounded = packet["supplemental"]
        self.assertEqual(bounded["included"], "")
        self.assertEqual(packet["notes"][0]["content"], "")
        self.assertEqual(bounded["included_chars"], len(bounded["included"]))
        self.assertEqual(
            bounded["included_chars"] + bounded["omitted_chars"],
            supplemental["included_chars"] + supplemental["omitted_chars"],
        )
        self.assertEqual(bounded["truncated"], bounded["omitted_chars"] > 0)
        for entry in packet["required_sources"]["entries"]:
            self.assertGreater(len(entry["content"]), 0)
            self.assertEqual(
                entry["content_included_chars"],
                len(entry["content"]),
            )
            self.assertEqual(
                entry["content_included_chars"]
                + entry["content_omitted_chars"],
                len(source_content),
            )
            self.assertEqual(
                entry["content_truncated"],
                entry["content_omitted_chars"] > 0,
            )

    def test_prior_run_context_reads_review_artifacts_not_only_state_cache(self) -> None:
        task = self.policy["loop"]["tasks"][0]
        run_directory = (
            self.runtime
            / "artifacts"
            / "productive-runs"
            / task["task_id"]
        )
        run_directory.mkdir(parents=True)
        review_path = run_directory / "second-codex-review.json"
        cp.write_json(
            review_path,
            {
                "verdict": "REPAIR_REQUIRED",
                "summary": "later artifact survives a stale state cache",
                "findings": [
                    {
                        "severity": "major",
                        "file": "README.md",
                        "line": 1,
                        "message": "artifact-backed finding",
                    }
                ],
            },
        )
        context = cp.prior_run_context(self.policy, None)
        first = next(item for item in context if item["task_id"] == task["task_id"])
        reviews = first["artifact_evidence"]["reviews"]
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0]["state"], "VALIDATED")
        self.assertEqual(reviews[0]["sha256"], cp.sha256_file(review_path))
        self.assertEqual(reviews[0]["findings"][0]["message"], "artifact-backed finding")

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
        self.assertEqual(
            set(payloads),
            {
                "com.ardesia.headroom-gateway",
                "com.ardesia.mcp.controller",
                "com.ardesia.mcp.mailbox",
                "com.ardesia.mcp.watchdog",
                "com.ardesia.mcp.review",
                "com.ardesia.mcp.backup",
                "com.ardesia.obsidian-sync",
            },
        )
        self.assertTrue(payloads["com.ardesia.headroom-gateway"]["KeepAlive"])
        self.assertTrue(payloads["com.ardesia.headroom-gateway"]["RunAtLoad"])
        self.assertEqual(
            payloads["com.ardesia.headroom-gateway"]["ProgramArguments"][-1],
            "headroom-gateway",
        )
        self.assertTrue(payloads["com.ardesia.mcp.controller"]["KeepAlive"])
        self.assertEqual(payloads["com.ardesia.mcp.mailbox"]["StartInterval"], 300)
        self.assertEqual(payloads["com.ardesia.mcp.watchdog"]["StartInterval"], 900)
        self.assertEqual(
            payloads["com.ardesia.mcp.review"]["StartCalendarInterval"],
            [{"Minute": 0}, {"Minute": 30}],
        )
        self.assertFalse(payloads["com.ardesia.mcp.review"]["RunAtLoad"])
        self.assertEqual(
            payloads["com.ardesia.mcp.backup"]["StartCalendarInterval"],
            {"Hour": 3, "Minute": 17},
        )
        self.assertFalse(payloads["com.ardesia.mcp.backup"]["RunAtLoad"])
        self.assertTrue(payloads["com.ardesia.obsidian-sync"]["KeepAlive"])
        self.assertNotIn("com.ardesia.hermes", payloads)
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
        active_headroom = {
            "state": "ACTIVE_REQUIRED_GATEWAY",
            "version": "0.32.1",
            "pid": 4321,
            "health_digest": "a" * 64,
            "failures": [],
        }
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(cp.status_payload(self.policy)["state"], "PARTIAL_BOOTSTRAP_SAFE")
        cp.write_json(
            self.runtime / "state" / "mcp-controller.json",
            {"state": "READY_FOR_PRODUCTIVE_LOOP", "heartbeat_count": 3},
        )
        cp.write_json(self.runtime / "state" / "mailbox.json", {"state": "HEALTHY", "trigger": "scheduled"})
        review = self.runtime / "reviews" / "scheduled"
        review.mkdir()
        cp.write_json(
            review / "completion.json",
            {
                "state": "SAFE_MAINTENANCE",
                "trigger": "scheduled-30m",
                "audit_execution_state": "PASS",
            },
        )
        verification = {
            key: {"value": "PASS test", "recorded_at": cp.iso_now()}
            for key in {
                "controller_tests",
                "headroom_gateway",
                "codex_app_server",
                "claude_writer",
                "watchdog_restart",
                "scheduled_30m_review",
                "scheduled_mailbox",
                "logs_verified",
            }
        }
        cp.write_json(self.runtime / "state" / "verification.json", verification)
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")
        cp.write_json(
            self.runtime / "state" / "mcp-controller.json",
            {"state": "RUNNING", "heartbeat_count": 4},
        )
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")
        manual = self.runtime / "reviews" / "manual-after-scheduled"
        manual.mkdir()
        cp.write_json(
            manual / "completion.json",
            {"state": "READY_FOR_PRODUCTIVE_LOOP", "trigger": "operator-post-review"},
        )
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(cp.status_payload(self.policy)["state"], "READY_FOR_HUMAN_REVIEW")
        skip = self.runtime / "reviews" / "zz-skip-after-scheduled"
        skip.mkdir()
        cp.write_json(
            skip / "completion.json",
            {
                "state": "SKIP_NO_AI",
                "trigger": "scheduled-30m",
                "audit_execution_state": "SKIPPED_NO_AI",
                "last_successful_scheduled_audit": {
                    "review_id": "scheduled",
                    "trigger": "scheduled-30m",
                    "state": "SAFE_MAINTENANCE",
                    "audit_execution_state": "PASS",
                },
            },
        )
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(
                cp.status_payload(self.policy)["state"],
                "READY_FOR_HUMAN_REVIEW",
            )
        cp.write_json(
            skip / "completion.json",
            {
                "state": "SKIP_NO_AI",
                "trigger": "scheduled-30m",
                "audit_execution_state": "SKIPPED_NO_AI",
                "last_successful_scheduled_audit": {
                    "review_id": "scheduled",
                    "trigger": "scheduled-30m",
                    "state": "BLOCKED_CAUSAL",
                    "audit_execution_state": "PASS",
                },
            },
        )
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(
                cp.status_payload(self.policy)["state"],
                "PARTIAL_BOOTSTRAP_SAFE",
            )
        cp.write_json(
            skip / "completion.json",
            {
                "state": "SKIP_NO_AI",
                "trigger": "scheduled-30m",
                "audit_execution_state": "SKIPPED_NO_AI",
                "last_successful_scheduled_audit": {
                    "review_id": "scheduled",
                    "trigger": "scheduled-30m",
                    "audit_execution_state": "PASS",
                },
            },
        )
        with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
            self.assertEqual(
                cp.status_payload(self.policy)["state"],
                "PARTIAL_BOOTSTRAP_SAFE",
            )

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
        appended = copy.deepcopy(active)
        successor = copy.deepcopy(appended["loop"]["tasks"][-1])
        successor["task_id"] = "BETA-APPENDED-TEST"
        successor["branch"] = "agent/beta-appended-test"
        appended["loop"]["tasks"].append(successor)
        appended = cp.validate_policy(appended)
        appended_state = cp.ensure_productive_state(appended)
        self.assertEqual(
            appended_state["admitted_task_order"],
            [task["task_id"] for task in appended["loop"]["tasks"]],
        )
        self.assertEqual(appended_state["tasks"]["BETA-APPENDED-TEST"]["state"], "PENDING")
        removed = copy.deepcopy(appended)
        removed["loop"]["tasks"].pop(1)
        removed = cp.validate_policy(removed)
        with self.assertRaisesRegex(ValueError, "queue admission violation"):
            cp.ensure_productive_state(removed)
        reordered = copy.deepcopy(appended)
        reordered["loop"]["tasks"][0], reordered["loop"]["tasks"][1] = (
            reordered["loop"]["tasks"][1],
            reordered["loop"]["tasks"][0],
        )
        reordered = cp.validate_policy(reordered)
        with self.assertRaisesRegex(ValueError, "queue admission violation"):
            cp.ensure_productive_state(reordered)
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

    def test_falsified_candidate_seed_is_content_addressed_and_applied_after_clean_base(self) -> None:
        active = copy.deepcopy(self.policy)
        active["writer"]["automatic_dispatch"] = True
        active["loop"]["enabled"] = True
        active = cp.validate_policy(active)
        source = active["loop"]["tasks"][0]
        source_worktree = cp.ensure_task_worktree(active, source)
        seeded_paths = source["allowed_path_patterns"][:2]
        for index, seeded_path in enumerate(seeded_paths):
            source_file = source_worktree / seeded_path
            source_file.parent.mkdir(parents=True, exist_ok=True)
            source_file.write_text(
                f"falsified candidate {index}\n",
                encoding="utf-8",
            )
        review_relative = (
            f"artifacts/productive-runs/{source['task_id']}/second-codex-review.json"
        )
        review_path = self.runtime / review_relative
        verification = {
            "schema_version": 1,
            "state": "PASS",
            "commands": [],
        }
        binding = cp.writer_candidate_binding(
            active,
            source,
            source_worktree,
            verification,
            "second",
        )
        cp.write_json(
            review_path,
            {
                "verdict": "REPAIR_REQUIRED",
                "summary": "frozen falsifier",
                "findings": [
                    {
                        "severity": "major",
                        "file": seeded_paths[0],
                        "line": 1,
                        "message": "repair",
                    }
                ],
                "binding": binding,
            },
        )
        cp.ensure_productive_state(active)
        cp.update_productive_state(
            active,
            source["task_id"],
            "BLOCKED_CAUSAL",
            worktree=str(source_worktree),
            worker_pid=0,
            reason="independent review did not pass: REPAIR_REQUIRED",
        )
        fake_relative = (
            f"artifacts/productive-runs/{source['task_id']}/fake-codex-review.json"
        )
        cp.write_json(
            self.runtime / fake_relative,
            {
                "verdict": "REPAIR_REQUIRED",
                "summary": "unbound fake",
                "findings": [
                    {
                        "severity": "major",
                        "file": seeded_paths[0],
                        "line": 1,
                        "message": "not cryptographically bound",
                    }
                ],
            },
        )
        with self.assertRaisesRegex(ValueError, "binding"):
            cp.freeze_falsified_candidate(
                active,
                source["task_id"],
                fake_relative,
            )
        frozen = cp.freeze_falsified_candidate(active, source["task_id"], review_relative)
        self.assertEqual(frozen["state"], "FALSIFIED_UNTRUSTED_SEED")
        successor_policy = copy.deepcopy(active)
        successor = copy.deepcopy(source)
        successor["task_id"] = "BETA-SEED-SUCCESSOR"
        successor["branch"] = "agent/beta-seed-successor"
        successor["seed_candidate"] = {
            "source_task_id": source["task_id"],
            "manifest_relative_path": frozen["manifest_relative_path"],
            "manifest_sha256": frozen["manifest_sha256"],
        }
        successor_policy["loop"]["tasks"].append(successor)
        successor_policy = cp.validate_policy(successor_policy)
        successor_state = cp.ensure_productive_state(successor_policy)
        self.assertEqual(successor_state["tasks"][successor["task_id"]]["state"], "PENDING")
        successor_worktree = cp.ensure_task_worktree(successor_policy, successor)
        descriptor = cp.load_candidate_seed(successor_policy, successor)
        self.assertIsNotNone(descriptor)
        assert descriptor is not None
        run_directory = self.runtime / "artifacts" / "productive-runs" / successor["task_id"]
        run_directory.mkdir(parents=True)
        original_atomic_write = cp.atomic_write
        second_target = successor_worktree / seeded_paths[1]

        def fail_second_target(path: Path, data: bytes, mode: int = 0o600) -> None:
            if Path(path) == second_target:
                raise OSError("injected second-file failure")
            original_atomic_write(Path(path), data, mode)

        with mock.patch.object(cp, "atomic_write", side_effect=fail_second_target):
            with self.assertRaisesRegex(OSError, "second-file failure"):
                cp.apply_candidate_seed(
                    successor_policy,
                    successor,
                    successor_worktree,
                    run_directory,
                    descriptor,
                )
        self.assertEqual(cp.changed_paths(successor_policy, successor_worktree), [])
        receipt = cp.apply_candidate_seed(
            successor_policy,
            successor,
            successor_worktree,
            run_directory,
            descriptor,
        )
        self.assertEqual(receipt["state"], "FALSIFIED_UNTRUSTED_SEED_APPLIED")
        for index, seeded_path in enumerate(seeded_paths):
            self.assertEqual(
                (successor_worktree / seeded_path).read_text(encoding="utf-8"),
                f"falsified candidate {index}\n",
            )
        base_context = cp.finalize_context_packet(
            {"schema_version": 1, "notes": []},
            30_000,
            compiled_at="2026-07-28T18:00:00Z",
        )
        context = cp.context_with_candidate_seed(base_context, descriptor)
        self.assertEqual(context["falsified_untrusted_seed"]["review_sha256"], frozen["review_sha256"])
        self.assertNotEqual(context["context_digest"], "0" * 64)
        self.assertLessEqual(
            len(cp.canonical_json(context)),
            context["budget"]["limit_chars"],
        )

    def test_queue_admission_rejects_missing_record_and_mutated_digest(self) -> None:
        active = copy.deepcopy(self.policy)
        active["writer"]["automatic_dispatch"] = True
        active["loop"]["enabled"] = True
        active = cp.validate_policy(active)
        state = cp.ensure_productive_state(active)
        missing = copy.deepcopy(state)
        missing["tasks"].pop(active["loop"]["tasks"][0]["task_id"])
        cp.write_json(cp.productive_state_path(self.runtime), missing)
        with self.assertRaisesRegex(ValueError, "records are missing"):
            cp.ensure_productive_state(active)
        cp.write_json(cp.productive_state_path(self.runtime), state)
        mutated = copy.deepcopy(active)
        mutated["loop"]["tasks"][0]["title"] += " mutated"
        mutated = cp.validate_policy(mutated)
        with self.assertRaisesRegex(ValueError, "changed after admission"):
            cp.ensure_productive_state(mutated)

    def test_local_coordination_blocks_canonical_rename_touching_task_path(self) -> None:
        task = copy.deepcopy(self.policy["loop"]["tasks"][0])
        task["allowed_path_patterns"] = ["README.md"]
        task["max_files"] = 1
        product = self.runtime / "repos" / "ardesia"
        subprocess.run(
            [self.git, "-C", str(product), "mv", "README.md", "MOVED.md"],
            check=True,
            capture_output=True,
        )
        snapshot = cp.local_coordination_snapshot(
            self.policy,
            task,
            current_worktree=self.runtime / "worktrees" / "current-task",
        )
        self.assertEqual(snapshot["state"], "BLOCKING_LOCAL_OVERLAP")
        self.assertTrue(snapshot["blockers"])
        self.assertIn("README.md", snapshot["blockers"][0]["overlap_paths"])

    def test_scientific_audit_rejects_proposal_while_queue_is_nonterminal(self) -> None:
        directory = self.runtime / "reviews" / "proposal-guard"
        directory.mkdir(parents=True)
        cp.write_json(
            directory / "scientific-audit.json",
            {
                "classification": "VERIFIED_STABLE",
                "hypothesis": "queue remains bounded",
                "summary": "proposal must not bypass admission",
                "observations": [],
                "falsifiers": ["a pending task remains"],
                "next_action": "finish the admitted task",
                "queue_proposal": {
                    "title": "premature proposal",
                    "hypothesis": "not admissible yet",
                    "allowed_paths": ["README.md"],
                    "acceptance": ["one bounded change"],
                    "falsifiers": ["queue is not terminal"],
                },
            },
        )
        audit_input = {"queue_nonterminal": True}
        completed = {
            "exit": 0,
            "stdout": "",
            "stderr": "",
            "argv": [],
        }
        with mock.patch.object(cp, "run_ai_command", return_value=completed) as runner:
            with self.assertRaisesRegex(ValueError, "before the queue was terminal"):
                cp.codex_scientific_audit(self.policy, directory, audit_input)
        arguments = runner.call_args.args[2]
        self.assertNotIn("--model", arguments)
        self.assertNotIn('model_reasoning_effort="xhigh"', arguments)
        self.assertIn("read-only", arguments)
        self.assertIn("--skip-git-repo-check", arguments)

    def test_complete_scientific_audit_input_respects_supervisor_ceiling(self) -> None:
        large = {"records": [{"text": "evidence-" * 20_000} for _ in range(20)]}
        packet = cp.build_scientific_audit_input(
            self.policy,
            review_id="review-bound",
            trigger="scheduled-30m",
            previous=large,
            checks=large,
            github=large,
            wiki=large,
            mailbox=large,
            headroom=large,
            hermes=large,
            productive={"tasks": {"ACTIVE": {"state": "IMPLEMENT"}}, **large},
            supervisor_context=large,
            material_digest="d" * 64,
        )
        self.assertLessEqual(len(cp.canonical_json(packet)), 24_000)
        self.assertEqual(packet["budget"]["limit_chars"], 24_000)
        self.assertTrue(packet["queue_nonterminal"])
        self.assertTrue(packet["previous_review"]["truncated"])
        self.assertTrue(packet["supervisor_context"]["truncated"])

    def test_scientific_audit_compact_snapshots_survive_verbose_trimming(self) -> None:
        huge = "unbounded-evidence-" * 20_000
        task_ids = [f"TASK-{index}" for index in range(1, 6)]
        states = [
            "READY_FOR_HUMAN",
            "BLOCKED_CAUSAL",
            "READY_FOR_HUMAN",
            "BLOCKED_CAUSAL",
            "READY_FOR_HUMAN",
        ]
        verdicts = ["PASS", "BLOCKED", "PASS", "REPAIR_REQUIRED", "PASS"]
        tasks = {}
        for index, (task_id, state, verdict) in enumerate(
            zip(task_ids, states, verdicts),
            start=1,
        ):
            tasks[task_id] = {
                "state": state,
                "reason": f"terminal-reason-{index}: {huge}",
                "task_digest": str(index) * 64,
                "base_sha": str(index) * 40,
                "acceptance_digest": "a" * 64,
                "artifact_sha256": "b" * 64,
                "verification_digest": "c" * 64,
                "candidate_digest": "d" * 64,
                "context_digest": "e" * 64,
                "changed_files": [
                    f"src/task-{index}/file-{file_index}-{'x' * 300}.py"
                    for file_index in range(100)
                ],
                "writer_phase": f"terminal-phase-{index}",
                "writer_heartbeat_at": f"2026-07-29T10:0{index}:00Z",
                "heartbeat_count": index,
                "writer_lease_renewals": index + 5,
                "writer_elapsed_seconds": index * 10,
                "updated_at": f"2026-07-29T11:0{index}:00Z",
                "completed_at": f"2026-07-29T12:0{index}:00Z",
                "committed_at": f"2026-07-29T13:0{index}:00Z",
                "review": {
                    "verdict": verdict,
                    "summary": f"review-summary-{index}: {huge}",
                    "review_sha256": "f" * 64,
                    "findings": [
                        {
                            "severity": severity,
                            "file": huge,
                            "line": index,
                            "message": huge,
                        }
                        for severity in ("critical", "major", "minor")
                    ],
                },
                "logs": huge,
                "artifacts": [{"path": huge, "body": huge}],
            }
        tasks[task_ids[0]]["review_verdict"] = verdicts[0]
        tasks[task_ids[0]]["review"].pop("verdict")
        tasks[task_ids[0]]["review"].pop("findings")
        tasks[task_ids[0]]["review_findings_count"] = 3
        tasks[task_ids[0]]["review_findings_severity_counts"] = {
            "critical": 1,
            "major": 1,
            "minor": 1,
        }
        productive = {
            "schema_version": 1,
            "service_version": "1.8.2",
            "run_id": "run-compact-audit",
            "goal_id": "goal-compact-audit",
            "queue_mode": "finite",
            "enabled": True,
            "admitted_task_order": task_ids,
            "updated_at": "2026-07-29T14:00:00Z",
            "tasks": dict(reversed(list(tasks.items()))),
            "large_queue_blob": huge,
        }
        wiki = {
            "state": "INDEXED_CURRENT",
            "source_mode": "git-worktree",
            "material_source_sha": "1" * 64,
            "source_sha": "2" * 64,
            "canonical_git_sha": "3" * 40,
            "notes": 1_881,
            "database_sha256": "4" * 64,
            "indexed_at": "2026-07-29T09:00:00Z",
            "large_index_blob": huge,
        }
        verbose = {"records": [{"text": huge} for _ in range(5)]}
        bounded_status = {"state": "PASS", "summary": "bounded evidence"}
        arguments = {
            "review_id": "review-compact-snapshots",
            "trigger": "scheduled-30m",
            "previous": verbose,
            "checks": bounded_status,
            "github": bounded_status,
            "wiki": wiki,
            "mailbox": verbose,
            "headroom": bounded_status,
            "hermes": bounded_status,
            "productive": productive,
            "supervisor_context": verbose,
            "material_digest": "9" * 64,
        }
        with mock.patch.object(
            cp,
            "iso_now",
            return_value="2026-07-29T15:00:00Z",
        ):
            packet = cp.build_scientific_audit_input(self.policy, **arguments)
            repeated = cp.build_scientific_audit_input(
                self.policy,
                **{
                    **arguments,
                    "productive": {
                        **productive,
                        "tasks": dict(tasks),
                    },
                },
            )

        serialized = cp.canonical_json(packet)
        self.assertLessEqual(len(serialized), 24_000)
        self.assertEqual(serialized, cp.canonical_json(repeated))
        self.assertEqual(
            packet["wikillm_snapshot"],
            cp.compact_wikillm_snapshot(wiki),
        )
        self.assertEqual(
            packet["productive_loop_snapshot"],
            cp.compact_productive_loop_snapshot(productive),
        )
        self.assertNotIn("encoding", packet["wikillm_snapshot"])
        self.assertNotIn("encoding", packet["productive_loop_snapshot"])
        self.assertNotIn("wikillm", packet)
        self.assertNotIn("productive_loop", packet)
        self.assertLessEqual(packet["previous_review"]["included_chars"], 1_000)
        self.assertLessEqual(packet["mailbox"]["included_chars"], 200)
        self.assertGreaterEqual(
            packet["supervisor_context"]["included_chars"],
            7_000,
        )
        for key in (
            "state",
            "source_mode",
            "material_source_sha",
            "source_sha",
            "canonical_git_sha",
            "notes",
            "database_sha256",
            "indexed_at",
        ):
            self.assertEqual(packet["wikillm_snapshot"][key], wiki[key])

        compact_tasks = packet["productive_loop_snapshot"]["tasks"]
        self.assertEqual(
            [task["task_id"] for task in compact_tasks],
            task_ids,
        )
        for index, (task, state, verdict) in enumerate(
            zip(compact_tasks, states, verdicts),
            start=1,
        ):
            self.assertEqual(task["state"], state)
            self.assertEqual(task["review_verdict"], verdict)
            self.assertIn(f"terminal-reason-{index}", task["reason"])
            self.assertIn(f"review-summary-{index}", task["review_summary"])
            self.assertLessEqual(len(task["reason"]), 150)
            self.assertLessEqual(len(task["review_summary"]), 180)
            self.assertLessEqual(len(task["changed_files"]), 5)
            self.assertTrue(
                all(len(path) <= 120 for path in task["changed_files"])
            )
            self.assertEqual(task["review_findings_count"], 3)
            self.assertEqual(
                task["review_findings_severity_counts"],
                {"critical": 1, "major": 1, "minor": 1},
            )
            self.assertNotIn("findings", task)
            for key in (
                "acceptance_digest",
                "artifact_sha256",
                "verification_digest",
                "candidate_digest",
                "context_digest",
                "review_sha256",
                "writer_phase",
                "writer_heartbeat_at",
                "heartbeat_count",
                "writer_lease_renewals",
                "writer_elapsed_seconds",
                "updated_at",
                "completed_at",
                "committed_at",
            ):
                self.assertIn(key, task)
        self.assertNotIn(huge, serialized)
        with self.assertRaisesRegex(ValueError, "task ids must be strings"):
            cp.compact_productive_loop_snapshot({"tasks": {1: {"state": "DONE"}}})

    def test_scientific_audit_task_limit_is_ceiling_bound(self) -> None:
        maximum_policy = copy.deepcopy(self.policy)
        while len(maximum_policy["loop"]["tasks"]) < cp.MAX_SCIENTIFIC_AUDIT_TASKS:
            index = len(maximum_policy["loop"]["tasks"]) + 1
            task = copy.deepcopy(maximum_policy["loop"]["tasks"][0])
            task["task_id"] = f"BETA-{index:03d}-AUDIT-BOUND"
            task["branch"] = f"agent/beta-{index:03d}-audit-bound"
            maximum_policy["loop"]["tasks"].append(task)
        cp.validate_policy(maximum_policy)

        for queue_size in (9, 125):
            oversized_policy = copy.deepcopy(maximum_policy)
            while len(oversized_policy["loop"]["tasks"]) < queue_size:
                index = len(oversized_policy["loop"]["tasks"]) + 1
                task = copy.deepcopy(oversized_policy["loop"]["tasks"][0])
                task["task_id"] = f"BETA-{index:03d}-AUDIT-BOUND"
                task["branch"] = f"agent/beta-{index:03d}-audit-bound"
                oversized_policy["loop"]["tasks"].append(task)
            with self.assertRaisesRegex(
                ValueError,
                "scientific audit limit",
            ):
                cp.validate_policy(oversized_policy)

        tasks = {}
        for index in range(cp.MAX_SCIENTIFIC_AUDIT_TASKS):
            task_id = f"TASK-{index + 1}"
            tasks[task_id] = {
                "state": "BLOCKED_CAUSAL",
                "reason": f"bounded reason {index} " + "r" * 500,
                "task_digest": str(index + 1) * 64,
                "base_sha": str(index + 1) * 40,
                "artifact_sha": "a" * 40,
                "changed_files": [
                    f"src/task-{index}/file-{path_index}-{'p' * 200}.py"
                    for path_index in range(8)
                ],
                "context_digest": "c" * 64,
                "review": {
                    "verdict": "REPAIR_REQUIRED",
                    "summary": f"bounded review {index} " + "s" * 500,
                    "review_sha256": "d" * 64,
                    "binding": {
                        "candidate_digest": "e" * 64,
                        "verification_digest": "f" * 64,
                    },
                    "findings": [
                        {"severity": severity, "message": "not copied"}
                        for severity in ("critical", "major", "minor")
                    ],
                },
                "writer_phase": "repair",
                "writer_heartbeat_at": "2026-07-29T10:00:00Z",
                "writer_lease_renewals": index,
                "updated_at": "2026-07-29T11:00:00Z",
                **{
                    f"arbitrary_{digest_index}_review_digest": "9" * 64
                    for digest_index in range(100)
                },
            }
        productive = {
            "schema_version": 1,
            "service_version": "1.8.2",
            "queue_mode": "PREAPPROVED_IMMUTABLE",
            "admitted_task_order": list(tasks),
            "tasks": tasks,
        }
        packet = cp.build_scientific_audit_input(
            self.policy,
            review_id="review-eight-task-ceiling",
            trigger="scheduled-30m",
            previous={"state": "PASS"},
            checks={"state": "PASS"},
            github={"state": "PASS"},
            wiki={"state": "INDEXED_CURRENT"},
            mailbox={"state": "PASS"},
            headroom={"state": "PASS"},
            hermes={"state": "DISABLED"},
            productive=productive,
            supervisor_context={"state": "PASS"},
            material_digest="8" * 64,
        )
        self.assertLessEqual(len(cp.canonical_json(packet)), 24_000)
        compact_tasks = packet["productive_loop_snapshot"]["tasks"]
        self.assertEqual(len(compact_tasks), cp.MAX_SCIENTIFIC_AUDIT_TASKS)
        self.assertTrue(
            all(task["artifact_sha"] == "a" * 40 for task in compact_tasks)
        )
        self.assertFalse(
            any(
                key.startswith("arbitrary_")
                for task in compact_tasks
                for key in task
            )
        )
        for queue_size in (9, 125):
            with self.assertRaisesRegex(
                ValueError,
                "scientific audit limit",
            ):
                cp.compact_productive_loop_snapshot(
                    {
                        "tasks": {
                            f"TASK-{index}": {"state": "PENDING"}
                            for index in range(queue_size)
                        }
                    }
                )

    def test_scientific_audit_writes_exact_canonical_packet_within_ceiling(self) -> None:
        large = {"records": [{"text": "evidence-" * 20_000} for _ in range(20)]}
        packet = cp.build_scientific_audit_input(
            self.policy,
            review_id="review-file-bound",
            trigger="scheduled-30m",
            previous=large,
            checks=large,
            github=large,
            wiki=large,
            mailbox=large,
            headroom=large,
            hermes=large,
            productive={"tasks": {}, **large},
            supervisor_context=large,
            material_digest="d" * 64,
        )
        directory = self.runtime / "reviews" / "canonical-audit-input"
        directory.mkdir(parents=True)
        cp.write_json(
            directory / "scientific-audit.json",
            {
                "classification": "VERIFIED_STABLE",
                "hypothesis": "the complete Codex input is bounded",
                "summary": "the canonical audit input respects its ceiling",
                "observations": [],
                "falsifiers": ["the exact input file exceeds its ceiling"],
                "next_action": "retain the frozen context boundary",
                "queue_proposal": None,
            },
        )
        completed = {
            "exit": 0,
            "stdout": "",
            "stderr": "",
            "argv": [],
            "headroom_binding": {
                "route_id": "route-test",
                "receipt_path": "headroom-route.json",
                "receipt_sha256": "f" * 64,
                "efficiency_metrics": {
                    "request_count": 1,
                    "cost_attribution": "UNAVAILABLE",
                    "cost_window_delta_usd": None,
                },
            },
        }
        with mock.patch.object(cp, "run_ai_command", return_value=completed):
            audit = cp.codex_scientific_audit(self.policy, directory, packet)
        self.assertEqual(
            audit["headroom_route_receipt"]["efficiency_metrics"],
            completed["headroom_binding"]["efficiency_metrics"],
        )
        input_path = directory / "scientific-audit-input.json"
        exact_input = input_path.read_text(encoding="utf-8")
        self.assertEqual(exact_input, cp.canonical_json(packet))
        self.assertLessEqual(
            len(exact_input),
            self.policy["context"]["supervisor_max_chars"],
        )
        self.assertEqual(input_path.stat().st_mode & 0o777, 0o640)

    def test_scheduled_scientific_review_records_early_failure_instead_of_stopping(self) -> None:
        with (
            mock.patch.object(
                cp,
                "github_monitor_snapshot",
                return_value={"state": "CLEAR", "inventory_digest": "a" * 64},
            ),
            mock.patch.object(
                cp,
                "doctor",
                return_value={
                    "state": "READY_FOR_PRODUCTIVE_LOOP",
                    "reason": "test",
                    "checks": [],
                },
            ),
            mock.patch.object(
                cp,
                "wikillm_ingest",
                side_effect=ValueError("moving source injected"),
            ),
        ):
            result = cp.scientific_review(self.policy, "scheduled-30m")
        self.assertEqual(result["state"], "BLOCKED_CAUSAL")
        self.assertEqual(result["audit_execution_state"], "FAIL")
        self.assertIn("moving source injected", result["reason"])
        directory = Path(result["path"])
        self.assertTrue((directory / "failure.json").is_file())
        self.assertTrue((directory / "completion.json").is_file())
        self.assertTrue((directory / "evidence-manifest.json").is_file())
        latest = cp.read_json(self.runtime / "state" / "latest-review.json", {})
        self.assertEqual(latest["review_id"], result["review_id"])

    def test_watchdog_records_malformed_heartbeat_as_stale(self) -> None:
        cp.write_json(
            self.runtime / "state" / "mcp-controller.json",
            {
                "pid": 0,
                "heartbeat_at": "not-a-timestamp",
            },
        )
        result = cp.watchdog(
            self.policy,
            HERE / "ardesia_control_plane.py",
            "scheduled",
            allow_kill=False,
        )
        self.assertEqual(result["state"], "STALE")
        self.assertIn("malformed controller heartbeat", result["diagnostic"])

    def test_daily_backup_records_bundle_failure_instead_of_stopping(self) -> None:
        with mock.patch.object(
            cp,
            "create_bundle",
            side_effect=RuntimeError("bundle failure injected"),
        ):
            result = cp.daily_backup(self.policy, "scheduled-daily")
        self.assertEqual(result["state"], "BLOCKED_CAUSAL")
        self.assertIn("bundle failure injected", result["reason"])
        self.assertTrue(Path(result["failure_path"]).is_file())
        latest = cp.read_json(self.runtime / "state" / "latest-backup.json", {})
        self.assertEqual(latest["state"], "BLOCKED_CAUSAL")

    def test_controller_pauses_instead_of_crashing_on_queue_admission_violation(self) -> None:
        active = copy.deepcopy(self.policy)
        active["writer"]["automatic_dispatch"] = True
        active["loop"]["enabled"] = True
        active = cp.validate_policy(active)
        cp.ensure_productive_state(active)
        reordered = copy.deepcopy(active)
        reordered["loop"]["tasks"][0], reordered["loop"]["tasks"][1] = (
            reordered["loop"]["tasks"][1],
            reordered["loop"]["tasks"][0],
        )
        reordered = cp.validate_policy(reordered)
        with mock.patch.object(
            cp,
            "doctor",
            return_value={"state": "READY_FOR_PRODUCTIVE_LOOP", "reason": "test", "checks": []},
        ):
            self.assertEqual(
                cp.controller(
                    reordered,
                    HERE / "ardesia_control_plane.py",
                    self.policy_path,
                    once=True,
                ),
                0,
            )
        snapshot = cp.read_json(self.runtime / "state" / "mcp-controller.json", {})
        self.assertEqual(snapshot["state"], "PAUSED_SAFETY")
        self.assertEqual(snapshot["reason"], "queue_admission_violation")

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
