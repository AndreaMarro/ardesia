#!/usr/bin/env python3
"""ARDESIA MCP total-control plane.

Stdlib-only, Python 3.9 compatible, deny-by-default.  This program is both the
runtime for the five LaunchAgents and the read-only MCP stdio access mesh.
Product writes are never scheduled automatically: a Claude writer turn needs a
trusted mailbox directive, an exact-SHA lease and an isolated worktree.
"""

from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
import hashlib
import json
import os
import plistlib
import re
import select
import shutil
import signal
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple


VERSION = "1.0.0"
RUN_ID = "DEVOS-MCP-BOOTSTRAP-001"
GOAL_ID = "DEVOS-CONTROL-PLANE"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
HEX64 = re.compile(r"^[0-9a-f]{64}$")
DIRECTIVE_RE = re.compile(r"```ardesia-directive[ \t]*\n(.*?)\n```", re.DOTALL)
FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
HEADING_RE = re.compile(r"^#{1,6}\s+(.+?)\s*$", re.MULTILINE)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")
POLICY_KEYS = {
    "schema_version",
    "service_version",
    "run_id",
    "goal_id",
    "runtime_root",
    "product_repo",
    "knowledge_repo",
    "expected_product_sha",
    "expected_knowledge_sha",
    "expected_product_branch",
    "expected_knowledge_branch",
    "github",
    "schedules",
    "security",
    "writer",
    "wikillm",
    "tencentdb",
    "tools",
    "required_source_hashes",
}
DIRECTIVE_KEYS = {
    "schemaVersion",
    "directiveId",
    "idempotencyKey",
    "runId",
    "goalId",
    "baseSha",
    "headSha",
    "contextDigest",
    "acceptanceDigest",
    "expiresAt",
    "capability",
    "action",
    "payload",
}
DIRECTIVE_REQUIRED = DIRECTIVE_KEYS - {"payload"}

MCP_TOOLS = [
    {
        "name": "knowledge.search",
        "description": "Search the derived WikiLLM index bound to the canonical Knowledge SHA.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {
                "query": {"type": "string", "minLength": 1, "maxLength": 500},
                "limit": {"type": "integer", "minimum": 1, "maximum": 20},
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "name": "knowledge.compile",
        "description": "Compile a bounded, provenance-bearing context packet.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {
                "query": {"type": "string", "minLength": 1, "maxLength": 500},
                "maxChars": {"type": "integer", "minimum": 1000, "maximum": 50000},
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "name": "code.status",
        "description": "Return exact-SHA, branch and dirty-state probes for isolated repositories.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
    },
    {
        "name": "evidence.latest",
        "description": "Return the latest completed scientific review and its manifest digest.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
    },
    {
        "name": "run.status",
        "description": "Return controller, mailbox, watchdog, WikiLLM and optional-service state.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
    },
    {
        "name": "workflow.validate_directive",
        "description": "Validate a directive without dispatching work.",
        "inputSchema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {"directive": {"type": "object"}},
            "required": ["directive"],
            "additionalProperties": False,
        },
    },
]


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso_now() -> str:
    return utcnow().isoformat().replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def redact_diagnostic(value: str, limit: int = 2000) -> str:
    redacted = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "<redacted-email>", value)
    redacted = re.sub(
        r"\b(?:sk-[A-Za-z0-9_-]+|ghp_[A-Za-z0-9_-]+|github_pat_[A-Za-z0-9_-]+|xox[a-z]-[A-Za-z0-9_-]+)\b",
        "<redacted-secret>",
        redacted,
    )
    return redacted[-limit:]


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def atomic_write(path: Path, data: bytes, mode: int = 0o600) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
        directory = os.open(str(path.parent), os.O_RDONLY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    atomic_write(path, (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode(), mode)


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def append_jsonl(path: Path, value: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = path.with_suffix(path.suffix + ".lock")
    with lock_path.open("a+", encoding="utf-8") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        line = canonical_json(value) + "\n"
        with path.open("a", encoding="utf-8") as handle:
            handle.write(line)
            handle.flush()
            os.fsync(handle.fileno())


def event(runtime: Path, kind: str, **fields: Any) -> None:
    record = {
        "schema_version": 1,
        "service_version": VERSION,
        "event_id": str(uuid.uuid4()),
        "run_id": RUN_ID,
        "kind": kind,
        "ts": iso_now(),
    }
    record.update(fields)
    append_jsonl(runtime / "logs" / "mcp-control-ledger.jsonl", record)


def strict_object(value: Any, allowed: Iterable[str], required: Iterable[str], label: str) -> Dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{label}: expected object")
    extras = set(value) - set(allowed)
    missing = set(required) - set(value)
    if extras:
        raise ValueError(f"{label}: additional properties rejected: {sorted(extras)}")
    if missing:
        raise ValueError(f"{label}: required properties missing: {sorted(missing)}")
    return value


def validate_policy(policy: Dict[str, Any]) -> Dict[str, Any]:
    strict_object(policy, POLICY_KEYS, POLICY_KEYS, "policy")
    if policy["schema_version"] != 1 or policy["service_version"] != VERSION:
        raise ValueError("policy: unsupported schema or service version")
    if policy["run_id"] != RUN_ID or policy["goal_id"] != GOAL_ID:
        raise ValueError("policy: run/goal mismatch")
    if not HEX40.fullmatch(policy["expected_product_sha"]):
        raise ValueError("policy: invalid product SHA")
    if not HEX40.fullmatch(policy["expected_knowledge_sha"]):
        raise ValueError("policy: invalid knowledge SHA")
    root = Path(policy["runtime_root"])
    if not root.is_absolute():
        raise ValueError("policy: runtime_root must be absolute")
    for key in ("product_repo", "knowledge_repo"):
        candidate = Path(policy[key])
        if candidate.is_absolute() or ".." in candidate.parts:
            raise ValueError(f"policy: {key} must be a safe relative path")
    schedules = strict_object(
        policy["schedules"],
        {"controller_heartbeat_seconds", "mailbox_seconds", "watchdog_seconds", "review_minute", "backup_hour", "backup_minute"},
        {"controller_heartbeat_seconds", "mailbox_seconds", "watchdog_seconds", "review_minute", "backup_hour", "backup_minute"},
        "schedules",
    )
    if schedules["mailbox_seconds"] != 300 or schedules["watchdog_seconds"] != 900:
        raise ValueError("policy: mailbox/watchdog schedule mismatch")
    if not 0 <= schedules["review_minute"] <= 59:
        raise ValueError("policy: review minute invalid")
    if not 0 <= schedules["backup_hour"] <= 23 or not 0 <= schedules["backup_minute"] <= 59:
        raise ValueError("policy: backup time invalid")
    github = strict_object(
        policy["github"],
        {"repository", "issue", "trusted_authors"},
        {"repository", "issue", "trusted_authors"},
        "github",
    )
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", github["repository"]):
        raise ValueError("policy: invalid GitHub repository")
    if not isinstance(github["issue"], int) or github["issue"] <= 0:
        raise ValueError("policy: invalid GitHub issue")
    if not isinstance(github["trusted_authors"], list) or not github["trusted_authors"]:
        raise ValueError("policy: trusted authors required")
    security = strict_object(
        policy["security"],
        {"context_digest", "acceptance_digest", "loopback_only", "external_sources_data_only", "append_only_audit"},
        {"context_digest", "acceptance_digest", "loopback_only", "external_sources_data_only", "append_only_audit"},
        "security",
    )
    if not HEX64.fullmatch(security["context_digest"]) or not HEX64.fullmatch(security["acceptance_digest"]):
        raise ValueError("policy: invalid frozen digest")
    if not all(security[key] is True for key in ("loopback_only", "external_sources_data_only", "append_only_audit")):
        raise ValueError("policy: mandatory security boundary disabled")
    writer = strict_object(
        policy["writer"],
        {
            "preferred_identity",
            "capability_state",
            "automatic_dispatch",
            "requires_mailbox_directive",
            "requires_lease",
            "dangerously_skip_permissions",
            "worktree_root",
            "allowed_path_patterns",
            "timeout_seconds",
            "max_output_chars",
        },
        {
            "preferred_identity",
            "capability_state",
            "automatic_dispatch",
            "requires_mailbox_directive",
            "requires_lease",
            "dangerously_skip_permissions",
            "worktree_root",
            "allowed_path_patterns",
            "timeout_seconds",
            "max_output_chars",
        },
        "writer",
    )
    if writer["preferred_identity"] != "writer-claude":
        raise ValueError("policy: Claude must be the primary writer")
    if writer["automatic_dispatch"] is not False:
        raise ValueError("policy: automatic writer dispatch must remain disabled")
    if writer["dangerously_skip_permissions"] is not True:
        raise ValueError("policy: requested Claude writer mode is not recorded")
    worktree_root = Path(writer["worktree_root"])
    if worktree_root.is_absolute() or ".." in worktree_root.parts:
        raise ValueError("policy: writer worktree root must be safe and relative")
    if not isinstance(writer["allowed_path_patterns"], list) or not writer["allowed_path_patterns"]:
        raise ValueError("policy: writer path allow-list required")
    tencent = strict_object(
        policy["tencentdb"],
        {"mode", "capture", "recall_injection", "offload", "persona_generation", "automatic_skill_generation", "canonical_write", "dsn_reference_file"},
        {"mode", "capture", "recall_injection", "offload", "persona_generation", "automatic_skill_generation", "canonical_write", "dsn_reference_file"},
        "tencentdb",
    )
    if any(tencent[key] for key in ("recall_injection", "offload", "persona_generation", "automatic_skill_generation", "canonical_write")):
        raise ValueError("policy: TencentDB shadow boundary violated")
    if tencent["mode"] != "SHADOW" or tencent["capture"] is not True:
        raise ValueError("policy: TencentDB must remain capture-only shadow")
    strict_object(
        policy["wikillm"],
        {"mode", "canonical_source", "derived_index", "canonical_write"},
        {"mode", "canonical_source", "derived_index", "canonical_write"},
        "wikillm",
    )
    if policy["wikillm"]["canonical_source"] != "Markdown/Git" or policy["wikillm"]["canonical_write"] is not False:
        raise ValueError("policy: WikiLLM canonical boundary violated")
    tools = strict_object(policy["tools"], {"python", "git", "gh", "codex", "claude"}, {"python", "git", "gh", "codex", "claude"}, "tools")
    if any(not Path(path).is_absolute() for path in tools.values()):
        raise ValueError("policy: every tool path must be absolute")
    if not isinstance(policy["required_source_hashes"], dict) or not policy["required_source_hashes"]:
        raise ValueError("policy: source hash bindings required")
    if any(not HEX64.fullmatch(value) for value in policy["required_source_hashes"].values()):
        raise ValueError("policy: invalid source hash binding")
    return policy


def load_policy(path: Path) -> Dict[str, Any]:
    return validate_policy(json.loads(path.read_text(encoding="utf-8")))


def runtime_path(policy: Dict[str, Any]) -> Path:
    return Path(policy["runtime_root"]).resolve()


def within(root: Path, candidate: Path) -> bool:
    try:
        return os.path.commonpath([str(root.resolve()), str(candidate.resolve())]) == str(root.resolve())
    except (OSError, ValueError):
        return False


def safe_path(root: Path, requested: str, must_exist: bool = True) -> Path:
    relative = Path(requested)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError("path traversal rejected")
    candidate = root / relative
    resolved_root = root.resolve(strict=True)
    resolved = candidate.resolve(strict=must_exist)
    if os.path.commonpath([str(resolved_root), str(resolved)]) != str(resolved_root):
        raise ValueError("symlink escape rejected")
    return resolved


def ensure_runtime(runtime: Path) -> None:
    for name in (
        "config",
        "logs",
        "state",
        "locks",
        "reports",
        "reviews",
        "backups/mcp",
        "worktrees",
        "knowledge-delta/quarantine",
        "artifacts/contexts",
        "launchd/mcp",
    ):
        (runtime / name).mkdir(parents=True, exist_ok=True)


def command_environment() -> Dict[str, str]:
    allowed_names = {"HOME", "LANG", "LC_ALL", "LOGNAME", "PATH", "SHELL", "SSH_AUTH_SOCK", "TMPDIR", "USER"}
    environment = {key: value for key, value in os.environ.items() if key in allowed_names}
    environment["PATH"] = "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    environment["GIT_TERMINAL_PROMPT"] = "0"
    environment["GIT_CONFIG_NOSYSTEM"] = "1"
    return environment


def run_tool(
    policy: Dict[str, Any],
    tool: str,
    arguments: Sequence[str],
    cwd: Optional[Path] = None,
    timeout: int = 30,
    max_chars: int = 200000,
) -> Dict[str, Any]:
    executable = policy["tools"].get(tool)
    if not executable or not Path(executable).is_absolute():
        raise ValueError(f"tool not allow-listed: {tool}")
    completed = subprocess.run(
        [executable, *arguments],
        cwd=str(cwd) if cwd else None,
        env=command_environment(),
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )
    stdout = completed.stdout[-max_chars:]
    stderr = completed.stderr[-max_chars:]
    return {"exit": completed.returncode, "stdout": stdout, "stderr": stderr, "argv": [executable, *arguments]}


def git_probe(policy: Dict[str, Any], repository: Path, expected_sha: str, expected_branch: str) -> Dict[str, Any]:
    common = [
        "--no-optional-locks",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "core.untrackedCache=false",
        "-C",
        str(repository),
    ]
    head = run_tool(policy, "git", [*common, "rev-parse", "HEAD"])
    branch = run_tool(policy, "git", [*common, "branch", "--show-current"])
    status = run_tool(policy, "git", [*common, "status", "--porcelain=v1", "--untracked-files=all"])
    return {
        "path": str(repository),
        "head": head["stdout"].strip(),
        "branch": branch["stdout"].strip(),
        "dirty_entries": len([line for line in status["stdout"].splitlines() if line]),
        "expected_head": expected_sha,
        "expected_branch": expected_branch,
        "pass": (
            head["exit"] == 0
            and branch["exit"] == 0
            and status["exit"] == 0
            and head["stdout"].strip() == expected_sha
            and branch["stdout"].strip() == expected_branch
            and not status["stdout"].strip()
        ),
    }


def doctor(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    ensure_runtime(runtime)
    product = safe_path(runtime, policy["product_repo"])
    knowledge = safe_path(runtime, policy["knowledge_repo"])
    disk = shutil.disk_usage(runtime)
    product_probe = git_probe(policy, product, policy["expected_product_sha"], policy["expected_product_branch"])
    knowledge_probe = git_probe(policy, knowledge, policy["expected_knowledge_sha"], policy["expected_knowledge_branch"])
    checks = [
        {"id": "free_disk_20gib", "pass": disk.free >= 20 * 1024 ** 3, "observed": disk.free},
        {"id": "product_exact_clean", "pass": product_probe["pass"], "observed": product_probe},
        {"id": "knowledge_exact_clean", "pass": knowledge_probe["pass"], "observed": knowledge_probe},
        {"id": "single_scheduler", "pass": policy["writer"]["automatic_dispatch"] is False, "observed": "controller-only"},
        {"id": "writer_primary", "pass": policy["writer"]["preferred_identity"] == "writer-claude", "observed": policy["writer"]["preferred_identity"]},
        {"id": "canonical_obsidian_write", "pass": policy["tencentdb"]["canonical_write"] is False, "observed": False},
    ]
    state = "SAFE_MAINTENANCE" if all(item["pass"] for item in checks) else "PAUSED_SAFETY"
    return {
        "schema_version": 1,
        "service_version": VERSION,
        "run_id": RUN_ID,
        "state": state,
        "reason": "directive_required_for_writer" if state == "SAFE_MAINTENANCE" else next(item["id"] for item in checks if not item["pass"]),
        "checks": checks,
        "ts": iso_now(),
    }


def read_process_command(pid: int) -> str:
    completed = subprocess.run(
        ["/bin/ps", "-p", str(pid), "-o", "command="],
        capture_output=True,
        text=True,
        check=False,
        timeout=5,
    )
    return completed.stdout.strip() if completed.returncode == 0 else ""


def process_matches_controller(pid: int, script: Path) -> bool:
    command = read_process_command(pid)
    return bool(command and str(script.resolve()) in command and re.search(r"(?:^|\s)controller(?:\s|$)", command))


def controller(policy: Dict[str, Any], script: Path, once: bool = False) -> int:
    runtime = runtime_path(policy)
    ensure_runtime(runtime)
    lock_path = runtime / "locks" / "mcp-controller.lock"
    lock = lock_path.open("a+", encoding="utf-8")
    try:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        event(runtime, "CONTROLLER_DUPLICATE_REFUSED", pid=os.getpid())
        return 3

    state_path = runtime / "state" / "mcp-controller.json"
    previous = read_json(state_path, {}) or {}
    restart_count = int(previous.get("restart_count", 0)) + (1 if previous else 0)
    stop = {"value": False}

    def request_stop(_signum: int, _frame: Any) -> None:
        stop["value"] = True

    signal.signal(signal.SIGTERM, request_stop)
    signal.signal(signal.SIGINT, request_stop)
    heartbeat_count = int(previous.get("heartbeat_count", 0))
    started_at = iso_now()
    event(runtime, "CONTROLLER_STARTED", pid=os.getpid(), restart_count=restart_count)
    while not stop["value"]:
        result = doctor(policy)
        heartbeat_count += 1
        snapshot = {
            "schema_version": 1,
            "service_version": VERSION,
            "run_id": RUN_ID,
            "pid": os.getpid(),
            "script": str(script.resolve()),
            "started_at": started_at,
            "heartbeat_at": iso_now(),
            "heartbeat_count": heartbeat_count,
            "restart_count": restart_count,
            "state": result["state"],
            "reason": result["reason"],
            "clean_exit": False,
            "checks_digest": sha256_text(canonical_json(result["checks"])),
        }
        write_json(state_path, snapshot)
        write_json(runtime / "state" / "mcp-health.json", snapshot)
        event(runtime, "CONTROLLER_HEARTBEAT", state=result["state"], reason=result["reason"], heartbeat_count=heartbeat_count)
        if once:
            break
        for _ in range(int(policy["schedules"]["controller_heartbeat_seconds"])):
            if stop["value"]:
                break
            time.sleep(1)
    snapshot = read_json(state_path, {}) or {}
    snapshot.update({"clean_exit": True, "stopped_at": iso_now()})
    write_json(state_path, snapshot)
    event(runtime, "CONTROLLER_STOPPED", pid=os.getpid())
    return 0


def parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def validate_directive(policy: Dict[str, Any], directive: Any) -> Dict[str, Any]:
    try:
        data = strict_object(directive, DIRECTIVE_KEYS, DIRECTIVE_REQUIRED, "directive")
        if data["schemaVersion"] != 1:
            raise ValueError("unsupported schemaVersion")
        for name in ("directiveId", "idempotencyKey", "runId", "goalId", "capability", "action"):
            if not isinstance(data[name], str) or not data[name] or len(data[name]) > 200:
                raise ValueError(f"{name}: invalid string")
        if data["runId"] != RUN_ID or data["goalId"] != GOAL_ID:
            raise ValueError("runId/goalId mismatch")
        if data["baseSha"] != policy["expected_product_sha"] or data["headSha"] != policy["expected_product_sha"]:
            raise ValueError("stale SHA rejected")
        if data["contextDigest"] != policy["security"]["context_digest"]:
            raise ValueError("stale context digest rejected")
        if data["acceptanceDigest"] != policy["security"]["acceptance_digest"]:
            raise ValueError("stale acceptance digest rejected")
        if not HEX40.fullmatch(data["baseSha"]) or not HEX40.fullmatch(data["headSha"]):
            raise ValueError("invalid SHA")
        if not HEX64.fullmatch(data["contextDigest"]) or not HEX64.fullmatch(data["acceptanceDigest"]):
            raise ValueError("invalid digest")
        if parse_time(data["expiresAt"]) <= utcnow():
            raise ValueError("expired directive rejected")
        if data["capability"] not in {"knowledge.read", "code.read", "evidence.read", "run.read", "writer-claude"}:
            raise ValueError("capability unauthorized")
        allowed_actions = {
            "knowledge.search",
            "knowledge.compile",
            "code.status",
            "evidence.latest",
            "run.status",
            "writer.prepare_slice",
        }
        if data["action"] not in allowed_actions:
            raise ValueError("action unauthorized")
        if data["capability"] == "writer-claude" and data["action"] != "writer.prepare_slice":
            raise ValueError("writer capability/action mismatch")
        return {"valid": True, "directive": data, "reason": "validated_pending_single_scheduler"}
    except (ValueError, TypeError, KeyError) as error:
        return {"valid": False, "reason": str(error)}


def mailbox_poll(policy: Dict[str, Any], trigger: str) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    ensure_runtime(runtime)
    github = policy["github"]
    endpoint = f"repos/{github['repository']}/issues/{github['issue']}/comments?per_page=100"
    response = run_tool(policy, "gh", ["api", endpoint], timeout=45, max_chars=2_000_000)
    state_path = runtime / "state" / "mailbox.json"
    state = read_json(state_path, {}) or {}
    seen_directives = dict(state.get("directives", {}))
    results: List[Dict[str, Any]] = []
    if response["exit"] != 0:
        result = {
            "schema_version": 1,
            "state": "OPTIONAL_SERVICE_DEGRADED",
            "reason": "github_mailbox_unavailable",
            "stderr_digest": sha256_text(response["stderr"]),
            "ts": iso_now(),
            "trigger": trigger,
        }
        write_json(state_path, result)
        event(runtime, "MAILBOX_POLL_DEGRADED", trigger=trigger, stderr_digest=result["stderr_digest"])
        return result
    comments = json.loads(response["stdout"])
    if not isinstance(comments, list):
        raise ValueError("mailbox: GitHub response is not a list")
    trusted = set(github["trusted_authors"])
    for comment in comments:
        body = str(comment.get("body") or "")
        blocks = DIRECTIVE_RE.findall(body)
        if not blocks:
            continue
        comment_id = str(comment.get("id"))
        author = ((comment.get("user") or {}).get("login") or "")
        if author not in trusted:
            results.append({"comment_id": comment_id, "status": "REJECTED", "reason": "unauthorized issue author rejected"})
            continue
        if len(blocks) != 1:
            results.append({"comment_id": comment_id, "status": "REJECTED", "reason": "exactly one directive block required"})
            continue
        try:
            directive = json.loads(blocks[0])
        except json.JSONDecodeError:
            results.append({"comment_id": comment_id, "status": "REJECTED", "reason": "invalid directive JSON"})
            continue
        validation = validate_directive(policy, directive)
        key = str(directive.get("idempotencyKey", ""))
        if validation["valid"] and key in seen_directives:
            results.append({"comment_id": comment_id, "status": "DUPLICATE_IGNORED", "idempotency_key": key})
        elif validation["valid"]:
            record = {
                "comment_id": comment_id,
                "directive_id": directive["directiveId"],
                "idempotency_key": key,
                "capability": directive["capability"],
                "action": directive["action"],
                "state": "VALIDATED_PENDING_SINGLE_SCHEDULER",
                "validated_at": iso_now(),
            }
            seen_directives[key] = record
            results.append({"comment_id": comment_id, "status": record["state"], "idempotency_key": key})
        else:
            results.append({"comment_id": comment_id, "status": "REJECTED", "reason": validation["reason"]})
    result = {
        "schema_version": 1,
        "state": "HEALTHY",
        "trigger": trigger,
        "polled_at": iso_now(),
        "comments_observed": len(comments),
        "directive_results": results,
        "directives": seen_directives,
    }
    write_json(state_path, result)
    event(runtime, "MAILBOX_POLL_COMPLETED", trigger=trigger, comments=len(comments), directive_results=len(results))
    return result


def watchdog(policy: Dict[str, Any], script: Path, trigger: str, allow_kill: bool = True) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    state = read_json(runtime / "state" / "mcp-controller.json", {}) or {}
    heartbeat = state.get("heartbeat_at")
    age = float("inf")
    if heartbeat:
        age = max(0.0, (utcnow() - parse_time(heartbeat)).total_seconds())
    stale_after = max(180, int(policy["schedules"]["controller_heartbeat_seconds"]) * 3)
    recovery = None
    pid = int(state.get("pid", 0) or 0)
    if age > stale_after and pid > 0 and allow_kill:
        if process_matches_controller(pid, script):
            os.kill(pid, signal.SIGTERM)
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                try:
                    os.kill(pid, 0)
                except ProcessLookupError:
                    break
                time.sleep(0.2)
            else:
                if process_matches_controller(pid, script):
                    os.kill(pid, signal.SIGKILL)
            recovery = {"pid": pid, "action": "TERM_THEN_KILL_IF_STILL_EXACT_MATCH"}
        else:
            recovery = {"pid": pid, "action": "REFUSED_PROCESS_MISMATCH"}
    result = {
        "schema_version": 1,
        "state": "HEALTHY" if age <= stale_after else "STALE",
        "trigger": trigger,
        "checked_at": iso_now(),
        "health_age_seconds": None if age == float("inf") else round(age, 3),
        "stale_after_seconds": stale_after,
        "recovery": recovery,
    }
    write_json(runtime / "state" / "watchdog.json", result)
    event(runtime, "WATCHDOG_TICK", trigger=trigger, stale=result["state"] == "STALE", recovery=recovery)
    return result


def classify_note(relative: str, frontmatter: Dict[str, str]) -> str:
    declared = frontmatter.get("type", "").lower()
    if declared:
        return declared
    if relative.startswith("20-Decisions/"):
        return "decision"
    if relative.startswith("30-Evidence-Receipts/"):
        return "evidence-receipt"
    if relative.startswith("40-Capability-Evolution/"):
        return "capability-governance"
    if relative.startswith("50-Research/"):
        return "research"
    if relative.startswith("90-Archive/"):
        return "archive"
    return "knowledge"


def parse_frontmatter(text: str) -> Dict[str, str]:
    match = FRONTMATTER_RE.search(text)
    if not match:
        return {}
    result: Dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line or line.lstrip().startswith("#"):
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip().strip('"').strip("'")
    return result


def wikillm_ingest(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    knowledge = safe_path(runtime, policy["knowledge_repo"])
    database = runtime / "state" / "wikillm.sqlite"
    descriptor, temporary_name = tempfile.mkstemp(prefix=".wikillm.", suffix=".sqlite", dir=str(database.parent))
    os.close(descriptor)
    temporary = Path(temporary_name)
    connection = sqlite3.connect(str(temporary))
    try:
        connection.executescript(
            """
            PRAGMA journal_mode=DELETE;
            CREATE TABLE notes(
              path TEXT PRIMARY KEY,
              sha256 TEXT NOT NULL,
              title TEXT NOT NULL,
              kind TEXT NOT NULL,
              status TEXT NOT NULL,
              headings TEXT NOT NULL,
              supersedes TEXT NOT NULL,
              links TEXT NOT NULL,
              body TEXT NOT NULL,
              source_commit TEXT NOT NULL,
              indexed_at TEXT NOT NULL
            );
            CREATE VIRTUAL TABLE notes_fts USING fts5(path, title, headings, body, content='notes', content_rowid='rowid');
            """
        )
        commit = git_probe(policy, knowledge, policy["expected_knowledge_sha"], policy["expected_knowledge_branch"])
        if not commit["pass"]:
            raise ValueError("WikiLLM source is not the expected clean Knowledge SHA")
        count = 0
        total_bytes = 0
        for path in sorted(knowledge.rglob("*.md")):
            if ".git" in path.parts:
                continue
            relative = path.relative_to(knowledge).as_posix()
            data = path.read_bytes()
            text = data.decode("utf-8", errors="replace")
            frontmatter = parse_frontmatter(text)
            headings = HEADING_RE.findall(text)
            title = frontmatter.get("title") or (headings[0] if headings else path.stem)
            supersedes = frontmatter.get("supersedes", "")
            links = sorted(set(WIKILINK_RE.findall(text)))
            connection.execute(
                """
                INSERT INTO notes(path,sha256,title,kind,status,headings,supersedes,links,body,source_commit,indexed_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    relative,
                    sha256_bytes(data),
                    title,
                    classify_note(relative, frontmatter),
                    frontmatter.get("status", "UNKNOWN"),
                    "\n".join(headings),
                    supersedes,
                    json.dumps(links, ensure_ascii=False),
                    text,
                    policy["expected_knowledge_sha"],
                    iso_now(),
                ),
            )
            count += 1
            total_bytes += len(data)
        connection.execute("INSERT INTO notes_fts(rowid,path,title,headings,body) SELECT rowid,path,title,headings,body FROM notes")
        connection.commit()
    finally:
        connection.close()
    os.replace(temporary, database)
    result = {
        "schema_version": 1,
        "state": "INDEXED_CURRENT",
        "source_sha": policy["expected_knowledge_sha"],
        "notes": count,
        "bytes": total_bytes,
        "database_sha256": sha256_file(database),
        "indexed_at": iso_now(),
        "canonical_write": False,
    }
    write_json(runtime / "state" / "wikillm.json", result)
    event(runtime, "WIKILLM_INGEST_COMPLETED", notes=count, source_sha=policy["expected_knowledge_sha"], database_sha256=result["database_sha256"])
    return result


def fts_query(query: str) -> str:
    tokens = re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9_]{2,}", query)
    if not tokens:
        raise ValueError("query has no searchable terms")
    return " OR ".join(f'"{token}"' for token in tokens[:20])


def wikillm_search(policy: Dict[str, Any], query: str, limit: int = 8, include_body: bool = False) -> List[Dict[str, Any]]:
    runtime = runtime_path(policy)
    database = runtime / "state" / "wikillm.sqlite"
    if not database.exists():
        wikillm_ingest(policy)
    connection = sqlite3.connect(f"file:{database}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    try:
        rows = connection.execute(
            """
            SELECT n.path,n.sha256,n.title,n.kind,n.status,n.headings,n.supersedes,n.source_commit,
                   snippet(notes_fts,3,'<mark>','</mark>',' … ',24) AS snippet,
                   bm25(notes_fts,8.0,12.0,4.0,1.0) AS score,
                   n.body
            FROM notes_fts JOIN notes n ON n.rowid=notes_fts.rowid
            WHERE notes_fts MATCH ?
            ORDER BY score ASC, n.path ASC
            LIMIT ?
            """,
            (fts_query(query), max(1, min(limit, 20))),
        ).fetchall()
    finally:
        connection.close()
    results = []
    for row in rows:
        item = {
            "path": row["path"],
            "sha256": row["sha256"],
            "title": row["title"],
            "kind": row["kind"],
            "status": row["status"],
            "headings": row["headings"].splitlines()[:12],
            "supersedes": row["supersedes"],
            "source_commit": row["source_commit"],
            "snippet": row["snippet"],
            "score": row["score"],
        }
        if include_body:
            item["body"] = row["body"]
        results.append(item)
    return results


def compile_context(policy: Dict[str, Any], query: str, max_chars: int = 16000, persist: bool = True) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    results = wikillm_search(policy, query, limit=20, include_body=True)
    remaining = max(1000, min(max_chars, 50000))
    notes = []
    for item in results:
        header = f"# {item['title']}\nsource={item['path']} sha256={item['sha256']} commit={item['source_commit']}\n"
        body = item.pop("body")
        allocation = min(len(body), max(0, remaining - len(header)))
        if allocation <= 0:
            break
        notes.append({**item, "content": header + body[:allocation]})
        remaining -= len(header) + allocation
    packet = {
        "schema_version": 1,
        "query": query,
        "source_sha": policy["expected_knowledge_sha"],
        "compiled_at": iso_now(),
        "max_chars": max_chars,
        "notes": notes,
    }
    packet["context_digest"] = sha256_text(canonical_json(packet))
    if persist:
        target = runtime / "artifacts" / "contexts" / f"{utcnow().strftime('%Y%m%dT%H%M%SZ')}-{packet['context_digest'][:12]}.json"
        write_json(target, packet)
        packet["path"] = str(target)
    return packet


def tencent_state(policy: Dict[str, Any]) -> Dict[str, Any]:
    reference = Path(policy["tencentdb"]["dsn_reference_file"])
    present = reference.is_file() and reference.stat().st_mode & 0o077 == 0
    return {
        "schema_version": 1,
        "mode": "SHADOW",
        "state": "READY_FOR_BOUNDED_CANARY" if present else "DEFERRED_NO_CREDENTIAL_REFERENCE",
        "credential_reference_present": bool(present),
        "capture": True,
        "recall_injection": False,
        "offload": False,
        "persona_generation": False,
        "automatic_skill_generation": False,
        "canonical_write": False,
        "ts": iso_now(),
    }


def tencent_shadow_capture(policy: Dict[str, Any], kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    minimized = {
        "schema_version": 1,
        "event_id": str(uuid.uuid4()),
        "run_id": RUN_ID,
        "kind": kind,
        "payload_digest": sha256_text(canonical_json(payload)),
        "product_sha": policy["expected_product_sha"],
        "knowledge_sha": policy["expected_knowledge_sha"],
        "ts": iso_now(),
    }
    append_jsonl(runtime / "state" / "tencent-shadow-outbox.jsonl", minimized)
    state = tencent_state(policy)
    state["outbox_event_id"] = minimized["event_id"]
    write_json(runtime / "state" / "tencentdb.json", state)
    return state


def evidence_manifest(directory: Path) -> Dict[str, Any]:
    files = []
    for path in sorted(directory.iterdir()):
        if path.is_file() and path.name not in {"evidence-manifest.json", "completion.json"}:
            files.append({"path": path.name, "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    return {"schema_version": 1, "files": files, "manifest_digest": sha256_text(canonical_json(files))}


def latest_review(runtime: Path) -> Optional[Dict[str, Any]]:
    completed = sorted(runtime.glob("reviews/*/completion.json"))
    if not completed:
        return None
    marker = read_json(completed[-1], {}) or {}
    marker["path"] = str(completed[-1].parent)
    return marker


def generate_reports(policy: Dict[str, Any]) -> None:
    runtime = runtime_path(policy)
    reports = runtime / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    verification = read_json(runtime / "state" / "verification.json", {}) or {}
    inventory = {
        "schema_version": 1,
        "service_version": VERSION,
        "namespaces": {
            "knowledge": ["knowledge.search", "knowledge.compile"],
            "code": ["code.status"],
            "evidence": ["evidence.latest"],
            "run": ["run.status"],
            "workflow": ["workflow.validate_directive"],
        },
        "transport": "stdio",
        "write_tools_exposed": [],
        "schema_dialect": "2020-12",
    }
    authz = {
        "schema_version": 1,
        "identities": {
            "chatgpt-observer": ["knowledge.search", "knowledge.compile", "code.status", "evidence.latest", "run.status"],
            "reviewer-codex": ["read-all-isolated", "review-exact-diff", "interrupt-resume"],
            "reviewer-claude": ["review-non-claude-authored-only"],
            "writer-codex": [],
            "writer-claude": ["leased-worktree-write-after-valid-directive"],
            "andrea-operator": ["human-gates"],
            "scheduler-service": ["validate", "lease", "dispatch-one", "pause"],
        },
        "primary_writer": "writer-claude",
        "independent_reviewer": "reviewer-codex",
        "automatic_dispatch": False,
        "dangerously_skip_permissions": True,
    }
    schedules = {
        "controller": {"mode": "continuous", "keepAlive": True},
        "mailbox": {"intervalSeconds": 300},
        "watchdog": {"intervalSeconds": 900},
        "scientificReview": {"calendarMinute": policy["schedules"]["review_minute"], "period": "hourly"},
        "backup": {"hour": policy["schedules"]["backup_hour"], "minute": policy["schedules"]["backup_minute"], "period": "daily"},
    }
    write_json(reports / "MCP_TOOL_INVENTORY.json", inventory, 0o640)
    write_json(reports / "MCP_AUTHZ_MATRIX.json", authz, 0o640)
    schedule_report = f"""# Scheduled tasks report

| Service | launchd schedule | Runtime trigger |
|---|---|---|
| Controller | continuous, `KeepAlive=true` | heartbeat every {policy['schedules']['controller_heartbeat_seconds']} seconds |
| GitHub mailbox | every 300 seconds | `scheduled` |
| Watchdog | every 900 seconds | `scheduled` |
| Scientific review | hourly at minute {policy['schedules']['review_minute']:02d} | `scheduled-hourly` |
| Daily backup | {policy['schedules']['backup_hour']:02d}:{policy['schedules']['backup_minute']:02d} local time | `scheduled-daily` |

Machine-readable schedule:

```json
{json.dumps(schedules, indent=2, sort_keys=True)}
```
"""
    atomic_write(reports / "SCHEDULED_TASKS_REPORT.md", schedule_report.encode("utf-8"), 0o640)
    control_report = f"""# MCP control-plane report

Version `{VERSION}`, run `{RUN_ID}`, exact product `{policy['expected_product_sha']}`.

- One logical scheduler: `com.ardesia.mcp.controller`.
- MCP access mesh: stdio and read-only; no write tool is exposed.
- Canonical knowledge: Markdown/Git. WikiLLM is a derived SQLite FTS5 projection.
- Primary writer: Claude Code, valid directive + exclusive lease + isolated worktree only.
- Independent reviewer: Codex App Server, Codex CLI fallback.
- Automatic dispatch: disabled.
- Merge/deploy/main/canonical overwrite: forbidden.
"""
    codex_report = f"""# Codex control report

Primary lifecycle adapter: `codex app-server --listen stdio://`.
Fallback: official `codex exec` CLI. No API-key fallback.

Installed probe evidence: `{verification.get('codex_app_server', 'PENDING')}`.
Claude writer probe: `{verification.get('claude_writer', 'PENDING')}`.
"""
    failure_report = f"""# Failure injection report

Controller tests: `{verification.get('controller_tests', 'PENDING')}`.
Watchdog injection: `{verification.get('watchdog_restart', 'PENDING')}`.
Scheduled hourly review: `{verification.get('scheduled_hourly_review', 'PENDING')}`.
Mailbox scheduled poll: `{verification.get('scheduled_mailbox', 'PENDING')}`.
"""
    rollback = """# Rollback

1. `launchctl bootout gui/$(id -u)/com.ardesia.mcp.backup`
2. `launchctl bootout gui/$(id -u)/com.ardesia.mcp.review`
3. `launchctl bootout gui/$(id -u)/com.ardesia.mcp.watchdog`
4. `launchctl bootout gui/$(id -u)/com.ardesia.mcp.mailbox`
5. `launchctl bootout gui/$(id -u)/com.ardesia.mcp.controller`
6. Bootstrap the preserved `com.ardesia.control.plist` and `com.ardesia.watchdog.plist`.

Do not delete runtime state, ledger, bundles or review evidence during rollback.
"""
    for name, body in (
        ("MCP_CONTROL_PLANE_REPORT.md", control_report),
        ("CODEX_CONTROL_REPORT.md", codex_report),
        ("FAILURE_INJECTION_REPORT.md", failure_report),
        ("ROLLBACK.md", rollback),
    ):
        atomic_write(reports / name, body.encode("utf-8"), 0o640)


def record_verification(policy: Dict[str, Any], key: str, value: str) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    path = runtime / "state" / "verification.json"
    state = read_json(path, {}) or {}
    state[key] = {"value": value, "recorded_at": iso_now()}
    write_json(path, state)
    generate_reports(policy)
    event(runtime, "VERIFICATION_RECORDED", key=key, value=value)
    return state


def scientific_review(policy: Dict[str, Any], trigger: str) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    ensure_runtime(runtime)
    checks = doctor(policy)
    wiki = wikillm_ingest(policy)
    mailbox = read_json(runtime / "state" / "mailbox.json", {}) or {"state": "NOT_RUN"}
    tencent = tencent_shadow_capture(
        policy,
        "SCIENTIFIC_REVIEW",
        {
            "checks_digest": sha256_text(canonical_json(checks["checks"])),
            "wikillm_digest": wiki["database_sha256"],
            "mailbox_state": mailbox.get("state"),
        },
    )
    review_id = f"{utcnow().strftime('%Y%m%dT%H%M%SZ')}-{sha256_text(trigger + wiki['database_sha256'])[:12]}"
    directory = runtime / "reviews" / review_id
    directory.mkdir(parents=True, exist_ok=False)
    write_json(directory / "deterministic-checks.json", checks, 0o640)
    write_json(directory / "wikillm.json", wiki, 0o640)
    write_json(directory / "mailbox.json", mailbox, 0o640)
    write_json(directory / "tencentdb-shadow.json", tencent, 0o640)
    receipt = f"""# ARDESIA scientific review

Review `{review_id}`, trigger `{trigger}`, state `{checks['state']}`.
Product `{policy['expected_product_sha']}`, Knowledge `{policy['expected_knowledge_sha']}`.
WikiLLM `{wiki['notes']}` notes, TencentDB `{tencent['state']}`.
Writer `writer-claude`; automatic dispatch disabled; Codex independent reviewer.
"""
    atomic_write(directory / "review-receipt.md", receipt.encode("utf-8"), 0o640)
    manifest = evidence_manifest(directory)
    write_json(directory / "evidence-manifest.json", manifest, 0o640)
    completion = {
        "schema_version": 1,
        "review_id": review_id,
        "state": checks["state"],
        "trigger": trigger,
        "completed_at": iso_now(),
        "manifest_digest": manifest["manifest_digest"],
        "path": str(directory),
    }
    write_json(directory / "completion.json", completion, 0o640)
    write_json(runtime / "state" / "latest-review.json", completion)
    generate_reports(policy)
    event(runtime, "SCIENTIFIC_REVIEW_COMPLETED", review_id=review_id, trigger=trigger, state=checks["state"], manifest_digest=manifest["manifest_digest"])
    return completion


def create_bundle(policy: Dict[str, Any], repository: Path, target: Path) -> Dict[str, Any]:
    if target.exists():
        verify = run_tool(policy, "git", ["bundle", "verify", str(target)], cwd=repository, timeout=120)
        if verify["exit"] != 0:
            raise ValueError(f"existing bundle invalid: {target}")
        return {"path": str(target), "sha256": sha256_file(target), "state": "IDEMPOTENT_REPLAY"}
    temporary = target.with_suffix(".bundle.next")
    result = run_tool(policy, "git", ["-C", str(repository), "bundle", "create", str(temporary), "--all"], timeout=600)
    if result["exit"] != 0:
        raise RuntimeError(f"bundle creation failed: {result['stderr'][-1000:]}")
    verify = run_tool(policy, "git", ["bundle", "verify", str(temporary)], cwd=repository, timeout=120)
    if verify["exit"] != 0:
        raise RuntimeError(f"bundle verification failed: {verify['stderr'][-1000:]}")
    os.replace(temporary, target)
    return {"path": str(target), "sha256": sha256_file(target), "state": "CREATED_VERIFIED"}


def daily_backup(policy: Dict[str, Any], trigger: str) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    day = utcnow().strftime("%Y-%m-%d")
    directory = runtime / "backups" / "mcp" / day
    directory.mkdir(parents=True, exist_ok=True)
    product = safe_path(runtime, policy["product_repo"])
    knowledge = safe_path(runtime, policy["knowledge_repo"])
    product_bundle = create_bundle(policy, product, directory / "product.bundle")
    knowledge_bundle = create_bundle(policy, knowledge, directory / "knowledge.bundle")
    state_archive = directory / "control-state.tar.gz"
    if not state_archive.exists():
        temporary = state_archive.with_suffix(".tar.gz.next")
        with tarfile.open(temporary, "w:gz") as archive:
            for relative in ("config", "reports", "state"):
                source = runtime / relative
                if source.exists():
                    archive.add(source, arcname=relative, recursive=True)
        os.replace(temporary, state_archive)
    result = {
        "schema_version": 1,
        "state": "COMPLETE_VERIFIED",
        "trigger": trigger,
        "day": day,
        "product": product_bundle,
        "knowledge": knowledge_bundle,
        "state_archive": {"path": str(state_archive), "sha256": sha256_file(state_archive)},
        "completed_at": iso_now(),
    }
    write_json(directory / "backup-receipt.json", result, 0o640)
    write_json(runtime / "state" / "latest-backup.json", result)
    event(runtime, "DAILY_BACKUP_COMPLETED", trigger=trigger, day=day)
    return result


def plist_payload(label: str, arguments: List[str], runtime: Path, schedule: Dict[str, Any], keep_alive: bool = False) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "Label": label,
        "ProgramArguments": arguments,
        "WorkingDirectory": str(runtime),
        "ProcessType": "Background",
        "LowPriorityIO": True,
        "ThrottleInterval": 10,
        "StandardOutPath": str(runtime / "logs" / f"{label}.out.log"),
        "StandardErrorPath": str(runtime / "logs" / f"{label}.err.log"),
        "EnvironmentVariables": {
            "PATH": "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
            "PYTHONUNBUFFERED": "1",
        },
    }
    payload.update(schedule)
    if keep_alive:
        payload["KeepAlive"] = True
    return payload


def render_plists(policy: Dict[str, Any], script: Path, policy_path: Path, output: Path) -> List[str]:
    runtime = runtime_path(policy)
    output.mkdir(parents=True, exist_ok=True)
    python = "/usr/bin/python3"
    base = [python, str(script.resolve()), "--policy", str(policy_path.resolve())]
    schedules = policy["schedules"]
    definitions = [
        (
            "com.ardesia.mcp.controller",
            [*base, "controller"],
            {"RunAtLoad": True},
            True,
        ),
        (
            "com.ardesia.mcp.mailbox",
            [*base, "mailbox", "--trigger", "scheduled"],
            {"RunAtLoad": True, "StartInterval": schedules["mailbox_seconds"]},
            False,
        ),
        (
            "com.ardesia.mcp.watchdog",
            [*base, "watchdog", "--trigger", "scheduled"],
            {"RunAtLoad": True, "StartInterval": schedules["watchdog_seconds"]},
            False,
        ),
        (
            "com.ardesia.mcp.review",
            [*base, "review", "--trigger", "scheduled-hourly"],
            {"RunAtLoad": True, "StartCalendarInterval": {"Minute": schedules["review_minute"]}},
            False,
        ),
        (
            "com.ardesia.mcp.backup",
            [*base, "backup", "--trigger", "scheduled-daily"],
            {
                "RunAtLoad": False,
                "StartCalendarInterval": {
                    "Hour": schedules["backup_hour"],
                    "Minute": schedules["backup_minute"],
                },
            },
            False,
        ),
    ]
    paths = []
    for label, arguments, schedule, keep_alive in definitions:
        path = output / f"{label}.plist"
        atomic_write(path, plistlib.dumps(plist_payload(label, arguments, runtime, schedule, keep_alive)), 0o644)
        paths.append(str(path))
    return paths


def read_message(
    process: subprocess.Popen,
    timeout: float,
    predicate: Any,
    backlog: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    pending = backlog if backlog is not None else []
    for index, message in enumerate(pending):
        if predicate(message):
            return pending.pop(index)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        remaining = max(0.0, deadline - time.monotonic())
        readable, _, _ = select.select([process.stdout], [], [], min(remaining, 1.0))
        if not readable:
            if process.poll() is not None:
                raise RuntimeError(f"app-server exited {process.returncode}")
            continue
        line = process.stdout.readline()
        if not line:
            continue
        message = json.loads(line)
        if predicate(message):
            return message
        pending.append(message)
    raise TimeoutError("app-server response timeout")


def send_message(process: subprocess.Popen, message: Dict[str, Any]) -> None:
    process.stdin.write(canonical_json(message) + "\n")
    process.stdin.flush()


def codex_live_probe(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    product = safe_path(runtime, policy["product_repo"])
    executable = policy["tools"]["codex"]
    process = subprocess.Popen(
        [executable, "app-server", "--listen", "stdio://"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        env=command_environment(),
    )
    thread_id = None
    turn_id = None
    backlog: List[Dict[str, Any]] = []
    try:
        send_message(
            process,
            {
                "method": "initialize",
                "id": 0,
                "params": {"clientInfo": {"name": "ardesia_control", "title": "ARDESIA Control", "version": VERSION}},
            },
        )
        initialized = read_message(process, 20, lambda item: item.get("id") == 0, backlog)
        if "error" in initialized:
            raise RuntimeError(f"initialize failed: {initialized['error']}")
        send_message(process, {"method": "initialized", "params": {}})
        send_message(
            process,
            {
                "method": "thread/start",
                "id": 1,
                "params": {
                    "cwd": str(product),
                    "approvalPolicy": "never",
                    "sandbox": "read-only",
                    "ephemeral": False,
                    "serviceName": "ardesia_control",
                    "developerInstructions": (
                        "Read-only lifecycle probe. Do not modify files. "
                        "When the user asks for the interrupt probe, immediately run `/bin/sleep 30` "
                        "with the shell tool and reply only after it completes."
                    ),
                },
            },
        )
        started = read_message(process, 30, lambda item: item.get("id") == 1, backlog)
        if "error" in started:
            raise RuntimeError(f"thread/start failed: {started['error']}")
        thread_id = started["result"]["thread"]["id"]
        send_message(
            process,
            {
                "method": "turn/start",
                "id": 2,
                "params": {
                    "threadId": thread_id,
                    "cwd": str(product),
                    "approvalPolicy": "never",
                    "sandboxPolicy": {"type": "readOnly", "access": {"type": "fullAccess"}},
                    "input": [
                        {
                            "type": "text",
                            "text": "Start the interrupt probe now: run `/bin/sleep 30`, then reply READY_FOR_INTERRUPT.",
                        }
                    ],
                },
            },
        )
        turn_started = read_message(process, 30, lambda item: item.get("id") == 2, backlog)
        if "error" in turn_started:
            raise RuntimeError(f"turn/start failed: {turn_started['error']}")
        turn_id = turn_started["result"]["turn"]["id"]
        read_message(
            process,
            30,
            lambda item: item.get("method") == "turn/started"
            and (item.get("params") or {}).get("turn", {}).get("id") == turn_id
            and (item.get("params") or {}).get("turn", {}).get("status") == "inProgress",
            backlog,
        )
        send_message(process, {"method": "turn/interrupt", "id": 3, "params": {"threadId": thread_id, "turnId": turn_id}})
        interrupted = read_message(process, 30, lambda item: item.get("id") == 3, backlog)
        if "error" in interrupted:
            raise RuntimeError(f"turn/interrupt failed: {interrupted['error']}")
        read_message(
            process,
            60,
            lambda item: item.get("method") == "turn/completed"
            and (item.get("params") or {}).get("turn", {}).get("id") == turn_id,
            backlog,
        )
        send_message(
            process,
            {
                "method": "thread/resume",
                "id": 4,
                "params": {"threadId": thread_id, "cwd": str(product), "approvalPolicy": "never", "sandbox": "read-only"},
            },
        )
        resumed = read_message(process, 30, lambda item: item.get("id") == 4, backlog)
        if "error" in resumed:
            raise RuntimeError(f"thread/resume failed: {resumed['error']}")
        result = {
            "state": "PASS",
            "thread_id": thread_id,
            "turn_id": turn_id,
            "initialize": "PASS",
            "interrupt": "PASS",
            "resume": "PASS",
            "ts": iso_now(),
        }
        event(runtime, "CODEX_APP_SERVER_PROBE_COMPLETED", state="PASS", thread_id=thread_id, turn_id=turn_id)
        return result
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


def writer_lease_path(runtime: Path) -> Path:
    return runtime / "locks" / "writer-claude.lease.json"


def create_writer_lease(policy: Dict[str, Any], worktree: Path, ttl_seconds: int = 600) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    worktree_root = safe_path(runtime, policy["writer"]["worktree_root"])
    if worktree.resolve() in {
        safe_path(runtime, policy["product_repo"]).resolve(),
        safe_path(runtime, policy["knowledge_repo"]).resolve(),
    }:
        raise ValueError("canonical repository lease rejected")
    if not within(worktree_root, worktree):
        raise ValueError("writer worktree outside allow-list")
    lease = {
        "schema_version": 1,
        "lease_id": str(uuid.uuid4()),
        "identity": "writer-claude",
        "worktree": str(worktree.resolve()),
        "created_at": iso_now(),
        "expires_at": (utcnow() + dt.timedelta(seconds=ttl_seconds)).isoformat().replace("+00:00", "Z"),
        "pid": os.getpid(),
    }
    path = writer_lease_path(runtime)
    if path.exists():
        current = read_json(path, {}) or {}
        try:
            if parse_time(current["expires_at"]) > utcnow():
                raise ValueError("live writer lease already exists")
        except KeyError:
            raise ValueError("malformed writer lease exists")
    write_json(path, lease)
    event(runtime, "WRITER_LEASE_CREATED", lease_id=lease["lease_id"], worktree=lease["worktree"])
    return lease


def validate_writer_lease(policy: Dict[str, Any], worktree: Path, lease_id: str) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    lease = read_json(writer_lease_path(runtime), {}) or {}
    if lease.get("lease_id") != lease_id or lease.get("identity") != "writer-claude":
        raise ValueError("writer lease mismatch")
    if Path(lease.get("worktree", "")).resolve() != worktree.resolve():
        raise ValueError("writer lease worktree mismatch")
    if parse_time(lease["expires_at"]) <= utcnow():
        raise ValueError("writer lease expired")
    return lease


def claude_probe(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    fixture = runtime / "worktrees" / "claude-probe"
    fixture.mkdir(parents=True, exist_ok=True)
    if not (fixture / ".git").exists():
        init = run_tool(policy, "git", ["init", "-b", "probe"], cwd=fixture)
        if init["exit"] != 0:
            raise RuntimeError(init["stderr"])
        atomic_write(fixture / "README.md", b"# Isolated Claude writer probe\n", 0o640)
        run_tool(policy, "git", ["add", "README.md"], cwd=fixture)
        commit = run_tool(
            policy,
            "git",
            ["-c", "user.name=ARDESIA Probe", "-c", "user.email=probe@invalid.local", "commit", "-m", "test: initialize writer probe"],
            cwd=fixture,
        )
        if commit["exit"] != 0:
            raise RuntimeError(commit["stderr"])
    before = run_tool(policy, "git", ["status", "--porcelain=v1"], cwd=fixture)
    if before["stdout"].strip():
        raise ValueError("Claude fixture must be clean before probe")
    lease = create_writer_lease(policy, fixture, ttl_seconds=600)
    session_id = str(uuid.uuid4())
    prompt = (
        "This is an isolated ARDESIA writer capability probe. "
        "Create exactly one file named RESULT.txt in the current directory with exactly "
        "ARDESIA_CLAUDE_WRITER_READY followed by a newline. Do not modify any other file."
    )
    arguments = [
        "-p",
        prompt,
        "--dangerously-skip-permissions",
        "--session-id",
        session_id,
        "--output-format",
        "json",
        "--max-budget-usd",
        "1.00",
        "--allowedTools",
        "Read",
        "Write",
    ]
    try:
        validate_writer_lease(policy, fixture, lease["lease_id"])
        response = run_tool(
            policy,
            "claude",
            arguments,
            cwd=fixture,
            timeout=int(policy["writer"]["timeout_seconds"]),
            max_chars=int(policy["writer"]["max_output_chars"]),
        )
        status = run_tool(policy, "git", ["status", "--porcelain=v1"], cwd=fixture)
        changed = [line[3:] for line in status["stdout"].splitlines() if line]
        target = fixture / "RESULT.txt"
        passed = (
            response["exit"] == 0
            and changed == ["RESULT.txt"]
            and target.exists()
            and target.read_text(encoding="utf-8") == "ARDESIA_CLAUDE_WRITER_READY\n"
        )
        result = {
            "state": "PASS" if passed else "FAIL",
            "session_id": session_id,
            "lease_id": lease["lease_id"],
            "dangerously_skip_permissions": True,
            "changed_files": changed,
            "result_sha256": sha256_file(target) if target.exists() else None,
            "response_digest": sha256_text(response["stdout"]),
            "stderr_digest": sha256_text(response["stderr"]),
            "diagnostic": (
                redact_diagnostic(response["stderr"] or response["stdout"])
                if response["exit"] != 0
                else ""
            ),
            "exit": response["exit"],
            "ts": iso_now(),
        }
        event(runtime, "CLAUDE_WRITER_PROBE_COMPLETED", state=result["state"], changed_files=changed, session_id=session_id)
        return result
    finally:
        released = read_json(writer_lease_path(runtime), {}) or {}
        if released.get("lease_id") == lease["lease_id"]:
            released.update({"released_at": iso_now(), "expires_at": iso_now(), "state": "RELEASED"})
            write_json(writer_lease_path(runtime), released)


def latest_evidence(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    latest = latest_review(runtime)
    return latest or {"state": "NO_COMPLETED_REVIEW"}


def run_status(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    return {
        "schema_version": 1,
        "service_version": VERSION,
        "run_id": RUN_ID,
        "controller": read_json(runtime / "state" / "mcp-controller.json", {}),
        "mailbox": read_json(runtime / "state" / "mailbox.json", {}),
        "watchdog": read_json(runtime / "state" / "watchdog.json", {}),
        "wikillm": read_json(runtime / "state" / "wikillm.json", {}),
        "tencentdb": read_json(runtime / "state" / "tencentdb.json", tencent_state(policy)),
        "latest_review": latest_evidence(policy),
        "latest_backup": read_json(runtime / "state" / "latest-backup.json", {}),
        "writer": {
            "primary": "writer-claude",
            "automatic_dispatch": False,
            "dangerously_skip_permissions": True,
            "lease": read_json(writer_lease_path(runtime), None),
        },
        "ts": iso_now(),
    }


def validate_tool_input(name: str, arguments: Any) -> Dict[str, Any]:
    tool = next((item for item in MCP_TOOLS if item["name"] == name), None)
    if tool is None:
        raise ValueError("unknown tool")
    schema = tool["inputSchema"]
    if not isinstance(arguments, dict):
        raise ValueError("arguments must be an object")
    properties = schema.get("properties", {})
    extras = set(arguments) - set(properties)
    missing = set(schema.get("required", [])) - set(arguments)
    if extras:
        raise ValueError(f"additional properties rejected: {sorted(extras)}")
    if missing:
        raise ValueError(f"required properties missing: {sorted(missing)}")
    for key, value in arguments.items():
        specification = properties[key]
        if specification.get("type") == "string":
            if not isinstance(value, str) or len(value) < specification.get("minLength", 0) or len(value) > specification.get("maxLength", 10 ** 9):
                raise ValueError(f"{key}: invalid string")
        if specification.get("type") == "integer":
            if not isinstance(value, int) or not specification.get("minimum", value) <= value <= specification.get("maximum", value):
                raise ValueError(f"{key}: invalid integer")
        if specification.get("type") == "object" and not isinstance(value, dict):
            raise ValueError(f"{key}: invalid object")
    return arguments


def mcp_call(policy: Dict[str, Any], name: str, arguments: Any) -> Any:
    data = validate_tool_input(name, arguments)
    runtime = runtime_path(policy)
    if name == "knowledge.search":
        return wikillm_search(policy, data["query"], data.get("limit", 8))
    if name == "knowledge.compile":
        return compile_context(policy, data["query"], data.get("maxChars", 16000))
    if name == "code.status":
        result = doctor(policy)
        return [item["observed"] for item in result["checks"] if item["id"] in {"product_exact_clean", "knowledge_exact_clean"}]
    if name == "evidence.latest":
        return latest_evidence(policy)
    if name == "run.status":
        return run_status(policy)
    if name == "workflow.validate_directive":
        return validate_directive(policy, data["directive"])
    raise ValueError("unknown tool")


def mcp_server(policy: Dict[str, Any]) -> int:
    initialized = False
    for raw in sys.stdin:
        try:
            message = json.loads(raw)
            method = message.get("method")
            request_id = message.get("id")
            if method == "initialize":
                initialized = True
                response = {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "protocolVersion": "2025-11-25",
                        "capabilities": {"tools": {"listChanged": False}},
                        "serverInfo": {"name": "ardesia-mcp-control", "version": VERSION},
                    },
                }
            elif method == "notifications/initialized":
                continue
            elif not initialized:
                response = {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32002, "message": "Not initialized"}}
            elif method == "tools/list":
                response = {"jsonrpc": "2.0", "id": request_id, "result": {"tools": MCP_TOOLS}}
            elif method == "tools/call":
                params = strict_object(message.get("params"), {"name", "arguments"}, {"name", "arguments"}, "tools/call")
                result = mcp_call(policy, params["name"], params["arguments"])
                response = {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {"content": [{"type": "text", "text": json.dumps(result, ensure_ascii=False)}], "isError": False},
                }
            else:
                response = {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32601, "message": "Method not found"}}
        except Exception as error:
            response = {
                "jsonrpc": "2.0",
                "id": message.get("id") if isinstance(locals().get("message"), dict) else None,
                "error": {"code": -32602, "message": str(error)[:500]},
            }
        sys.stdout.write(canonical_json(response) + "\n")
        sys.stdout.flush()
    return 0


def materialize_policy(source: Path, output: Path, runtime: Path, review_minute: int) -> Dict[str, Any]:
    policy = json.loads(source.read_text(encoding="utf-8"))
    policy["runtime_root"] = str(runtime.resolve())
    policy["schedules"]["review_minute"] = review_minute
    policy["writer"]["worktree_root"] = "worktrees"
    policy = validate_policy(policy)
    write_json(output, policy)
    return policy


def status_payload(policy: Dict[str, Any]) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    status = run_status(policy)
    verification = read_json(runtime / "state" / "verification.json", {}) or {}
    latest = status.get("latest_review") or {}
    required_verifications = {
        "controller_tests",
        "codex_app_server",
        "claude_writer",
        "watchdog_restart",
        "scheduled_hourly_review",
        "scheduled_mailbox",
        "logs_verified",
    }
    verified = all(
        key in verification
        and isinstance(verification[key], dict)
        and str(verification[key].get("value", "")).startswith("PASS")
        for key in required_verifications
    )
    controller_state = (status.get("controller") or {}).get("state")
    scheduled_review = latest.get("trigger") == "scheduled-hourly"
    scheduled_mailbox = (status.get("mailbox") or {}).get("trigger") == "scheduled"
    ready = verified and controller_state == "SAFE_MAINTENANCE" and scheduled_review and scheduled_mailbox
    return {
        "schemaVersion": 1,
        "statusId": f"MCP-ACTIVATION-{utcnow().strftime('%Y%m%dT%H%M%SZ')}",
        "runId": RUN_ID,
        "goalId": GOAL_ID,
        "baseSha": policy["expected_product_sha"],
        "knowledgeSha": policy["expected_knowledge_sha"],
        "state": "READY_FOR_HUMAN_REVIEW" if ready else "PARTIAL_BOOTSTRAP_SAFE",
        "observedAt": iso_now(),
        "controller": {
            "state": (status.get("controller") or {}).get("state"),
            "heartbeatCount": (status.get("controller") or {}).get("heartbeat_count"),
        },
        "scheduledEvidence": {
            "mailbox": verification.get("scheduled_mailbox"),
            "hourlyReview": verification.get("scheduled_hourly_review"),
            "latestReview": latest,
        },
        "verificationGate": {
            "required": sorted(required_verifications),
            "passed": ready,
            "logs": verification.get("logs_verified"),
        },
        "services": {
            "controller": "continuous",
            "mailbox": "300s",
            "watchdog": "900s",
            "review": f"hourly@minute-{policy['schedules']['review_minute']:02d}",
            "backup": f"daily@{policy['schedules']['backup_hour']:02d}:{policy['schedules']['backup_minute']:02d}",
        },
        "writer": {
            "primary": "writer-claude",
            "dangerouslySkipPermissions": True,
            "automaticDispatch": False,
            "probe": verification.get("claude_writer"),
        },
        "reviewer": {"primary": "reviewer-codex", "probe": verification.get("codex_app_server")},
        "wikillm": status.get("wikillm"),
        "tencentdb": status.get("tencentdb"),
        "merge": "DISABLED",
        "deploy": "DISABLED",
        "idempotencyKey": "devos-mcp-bootstrap-001-activation",
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", type=Path)
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("doctor")
    controller_parser = subparsers.add_parser("controller")
    controller_parser.add_argument("--once", action="store_true")
    for command in ("mailbox", "watchdog", "review", "backup"):
        child = subparsers.add_parser(command)
        child.add_argument("--trigger", default="manual")
    subparsers.add_parser("wikillm-ingest")
    search = subparsers.add_parser("wikillm-search")
    search.add_argument("--query", required=True)
    search.add_argument("--limit", type=int, default=8)
    compile_parser = subparsers.add_parser("context-compile")
    compile_parser.add_argument("--query", required=True)
    compile_parser.add_argument("--max-chars", type=int, default=16000)
    subparsers.add_parser("tencent-status")
    subparsers.add_parser("codex-probe")
    subparsers.add_parser("claude-probe")
    render = subparsers.add_parser("render-plists")
    render.add_argument("--output", type=Path, required=True)
    materialize = subparsers.add_parser("materialize-policy")
    materialize.add_argument("--source", type=Path, required=True)
    materialize.add_argument("--output", type=Path, required=True)
    materialize.add_argument("--runtime", type=Path, required=True)
    materialize.add_argument("--review-minute", type=int, required=True)
    verify = subparsers.add_parser("record-verification")
    verify.add_argument("--key", required=True)
    verify.add_argument("--value", required=True)
    subparsers.add_parser("reports")
    subparsers.add_parser("status")
    subparsers.add_parser("status-block")
    subparsers.add_parser("mcp-stdio")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "materialize-policy":
        policy = materialize_policy(args.source, args.output, args.runtime, args.review_minute)
        print(json.dumps(policy, indent=2))
        return 0
    if args.policy is None:
        parser.error("--policy is required")
    policy = load_policy(args.policy)
    runtime = runtime_path(policy)
    ensure_runtime(runtime)
    if args.command == "doctor":
        result = doctor(policy)
    elif args.command == "controller":
        return controller(policy, Path(__file__), args.once)
    elif args.command == "mailbox":
        result = mailbox_poll(policy, args.trigger)
    elif args.command == "watchdog":
        result = watchdog(policy, Path(__file__), args.trigger)
    elif args.command == "review":
        result = scientific_review(policy, args.trigger)
    elif args.command == "backup":
        result = daily_backup(policy, args.trigger)
    elif args.command == "wikillm-ingest":
        result = wikillm_ingest(policy)
    elif args.command == "wikillm-search":
        result = wikillm_search(policy, args.query, args.limit)
    elif args.command == "context-compile":
        result = compile_context(policy, args.query, args.max_chars)
    elif args.command == "tencent-status":
        result = tencent_state(policy)
    elif args.command == "codex-probe":
        result = codex_live_probe(policy)
    elif args.command == "claude-probe":
        result = claude_probe(policy)
    elif args.command == "render-plists":
        result = render_plists(policy, Path(__file__), args.policy, args.output)
    elif args.command == "record-verification":
        result = record_verification(policy, args.key, args.value)
    elif args.command == "reports":
        generate_reports(policy)
        result = {"state": "REPORTS_WRITTEN", "path": str(runtime / "reports")}
    elif args.command == "status":
        result = run_status(policy)
    elif args.command == "status-block":
        result = status_payload(policy)
    elif args.command == "mcp-stdio":
        return mcp_server(policy)
    else:
        parser.error("unknown command")
        return 2
    print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
