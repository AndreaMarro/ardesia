#!/usr/bin/env python3
"""Run one R-03 verification command with a redacted environment and raw logs."""
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/andreamarro/VOLUME 3/ardesia-codex-r03-review-20260921")
OUT = ROOT / "artifacts/review-r03"
CANDIDATE = "ba9c3bdfe1b3218273dcf286e3c56723d204b707"
REMOVED = [
    "KIMI_API_KEY",
    "DEEPSEEK_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "ARDESIA_CHROMIUM_NO_SANDBOX",
]

if len(sys.argv) < 3:
    raise SystemExit("usage: run_review_command.py LOG_STEM COMMAND [ARG ...]")

stem, args = sys.argv[1], sys.argv[2:]
env = os.environ.copy()
present = [key for key in REMOVED if key in env]
for key in REMOVED:
    env.pop(key, None)

started = time.time()
process = subprocess.run(args, cwd=ROOT / "apps/studio", env=env, text=True, capture_output=True)
duration_seconds = time.time() - started
(OUT / f"{stem}.stdout.log").write_text(process.stdout)
(OUT / f"{stem}.stderr.log").write_text(process.stderr)

manifest_path = OUT / "command-manifest.json"
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text())
else:
    lock = ROOT / "apps/studio/package-lock.json"
    manifest = {
        "candidate": CANDIDATE,
        "base": "c54fa42c1bb34ac37374a5bb228d838b2b4409ec",
        "reviewer_runtime_model_effort": "inherited/unknown",
        "dependency_sharing": {
            "node_modules": "apps/studio/node_modules is a shared symlink; not modified",
            "package_lock_sha256": hashlib.sha256(lock.read_bytes()).hexdigest(),
        },
        "environment_changes": {
            "removed_before_every_subprocess": REMOVED,
            "removed_keys_present_without_values": present,
        },
        "commands": [],
    }
manifest["commands"].append({
    "cwd": str(ROOT / "apps/studio"),
    "args": args,
    "exit_code": process.returncode,
    "duration_seconds": round(duration_seconds, 3),
    "stdout": f"{stem}.stdout.log",
    "stderr": f"{stem}.stderr.log",
})
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
raise SystemExit(process.returncode)
