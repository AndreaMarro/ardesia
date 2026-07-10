#!/usr/bin/env python3
"""Fail if any tracked text file adds a high-confidence secret pattern.

Deliberately narrow patterns: this is a tripwire for real credentials,
not a linter. Legacy findings are counted in the allowlist as SECURITY_RED
debt; new or increased findings fail CI without printing secret values.
"""
from __future__ import annotations

import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

PATTERNS = [
    ("private-key-block", re.compile(rb"-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----")),
    ("aws-access-key", re.compile(rb"\bAKIA[0-9A-Z]{16}\b")),
    ("github-token", re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{36,}\b")),
    ("slack-token", re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("openai-key", re.compile(rb"\bsk-[A-Za-z0-9_-]{32,}\b")),
    ("stripe-live-key", re.compile(rb"\bsk_live_[A-Za-z0-9]{16,}\b")),
    ("supabase-service-role", re.compile(rb"\bservice_role['\"]?\s*[:=]\s*['\"]eyJ")),
    ("google-api-key", re.compile(rb"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("generic-jwt", re.compile(rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ("named-hex-secret", re.compile(rb"\b[A-Za-z0-9_]*(?:API_KEY|TOKEN|SECRET|KEY)[A-Za-z0-9_]*[^\n]{0,120}['\"][0-9a-fA-F]{32,}['\"]")),
    ("hardcoded-creds-object", re.compile(rb"\bCREDS\s*=\s*\{[^}\n]*email\s*:\s*['\"][^'\"]+@[^'\"]+['\"][^}\n]*password\s*:\s*['\"][^'\"]{4,}['\"][^}\n]*\}")),
]

ALLOWLIST_PATH = Path("bin/ci/secret_scan_allowlist.tsv")

SKIP_DIR_PARTS = ("node_modules/", "dist/", "dist-test/", ".git/")

TEXT_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".md", ".json",
    ".yml", ".yaml", ".html", ".css", ".sh", ".sql", ".txt", ".env",
    ".toml", ".cfg", ".ini", ".xml", ".csv",
}


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z"], check=True, capture_output=True
    ).stdout
    return [p.decode() for p in out.split(b"\x00") if p]


def should_scan(path: str) -> bool:
    if any(part in path for part in SKIP_DIR_PARTS):
        return False
    dot = path.rfind(".")
    return dot != -1 and path[dot:].lower() in TEXT_EXTENSIONS


def scan_file(path: str) -> list[tuple[str, str]]:
    try:
        content = Path(path).read_bytes()
    except FileNotFoundError:
        return []
    findings = []
    for name, pattern in PATTERNS:
        for _ in pattern.finditer(content):
            findings.append((path, name))
    return findings


def load_allowlist(path: Path = ALLOWLIST_PATH) -> Counter[tuple[str, str]]:
    allowed: Counter[tuple[str, str]] = Counter()
    if not path.exists():
        return allowed
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = raw_line.split("\t")
        if len(parts) < 3:
            raise ValueError(f"{path}:{lineno}: expected path<TAB>pattern<TAB>count")
        file_path, pattern_name, count_text = parts[:3]
        try:
            count = int(count_text)
        except ValueError as exc:
            raise ValueError(f"{path}:{lineno}: count must be an integer") from exc
        if count < 1:
            raise ValueError(f"{path}:{lineno}: count must be positive")
        allowed[(file_path, pattern_name)] += count
    return allowed


def unexpected_findings(
    findings: list[tuple[str, str]],
    allowlist: Counter[tuple[str, str]],
) -> tuple[Counter[tuple[str, str]], Counter[tuple[str, str]]]:
    observed = Counter(findings)
    unexpected: Counter[tuple[str, str]] = Counter()
    allowed_seen: Counter[tuple[str, str]] = Counter()
    for key, count in observed.items():
        allowed = allowlist.get(key, 0)
        if count > allowed:
            unexpected[key] = count - allowed
        if allowed:
            allowed_seen[key] = min(count, allowed)
    return unexpected, allowed_seen


def main() -> int:
    findings = []
    for path in tracked_files():
        if not should_scan(path):
            continue
        findings.extend(scan_file(path))
    try:
        allowlist = load_allowlist()
    except ValueError as exc:
        print(f"secret_scan: invalid allowlist: {exc}", file=sys.stderr)
        return 1
    unexpected, allowed_seen = unexpected_findings(findings, allowlist)
    if unexpected:
        print("Potential secrets in tracked files:")
        for (path, name), count in sorted(unexpected.items()):
            suffix = f" x{count}" if count > 1 else ""
            print(f"  {path}: {name}{suffix}")
        return 1
    if allowed_seen:
        print(f"secret_scan: OK ({sum(allowed_seen.values())} legacy findings allowlisted; no new high-confidence patterns)")
        return 0
    print("secret_scan: OK (no high-confidence secret patterns)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
