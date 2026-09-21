#!/usr/bin/env python3
"""Run the approved R-03 supplemental build with a sanitized environment."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/andreamarro/VOLUME 3/ardesia-codex-r03-review-20260921")
OUT = ROOT / "artifacts/review-r03"
REMOVED = [
    "KIMI_API_KEY",
    "DEEPSEEK_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "ARDESIA_CHROMIUM_NO_SANDBOX",
]

env = os.environ.copy()
present = [key for key in REMOVED if key in env]
for key in REMOVED:
    env.pop(key, None)

args = ["npm", "run", "build"]
started = time.time()
process = subprocess.run(args, cwd=ROOT / "apps/studio", env=env, text=True, capture_output=True)
duration_seconds = time.time() - started
(OUT / "build-supplement.stdout.log").write_text(process.stdout)
(OUT / "build-supplement.stderr.log").write_text(process.stderr)
(OUT / "build-supplement-command-manifest.json").write_text(json.dumps({
    "candidate": "ba9c3bdfe1b3218273dcf286e3c56723d204b707",
    "cwd": str(ROOT / "apps/studio"),
    "args": args,
    "exit_code": process.returncode,
    "duration_seconds": round(duration_seconds, 3),
    "stdout": "build-supplement.stdout.log",
    "stderr": "build-supplement.stderr.log",
    "environment_changes": {
        "removed_before_subprocess": REMOVED,
        "removed_keys_present_without_values": present,
    },
    "sparse_checkout_addition": "packs/elab-tutor",
}, indent=2) + "\n")
raise SystemExit(process.returncode)
