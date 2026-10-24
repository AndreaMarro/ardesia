#!/usr/bin/env python3
"""Run a retained diagnostic through the locked Web runner; restore the source."""
import os
from pathlib import Path
import subprocess

evidence = Path(__file__).resolve().parent
repo = evidence.parents[4]
target = repo / "apps/web/src/__tests__/curriculum-catalog.test.tsx"
component = repo / "apps/web/src/components/PhysicsPathways.tsx"
original = target.read_bytes()
component_original = component.read_bytes()
env = dict(os.environ)
env["PATH"] = "/opt/homebrew/bin:" + env["PATH"]
try:
    target.write_bytes((evidence / "listener-probe.tsx").read_bytes())
    component.write_bytes((evidence / "original-PhysicsPathways.tsx").read_bytes())
    result = subprocess.run([
        "npm", "run", "test", "--workspace", "@ardesia/web", "--", "src/__tests__/curriculum-catalog.test.tsx",
        "-t", "diagnostic:", "--reporter=verbose",
    ], cwd=repo, env=env, capture_output=True)
    (evidence / "listener-probe.log").write_bytes(result.stdout + result.stderr)
    print(result.stdout.decode(errors="replace"))
    print(result.stderr.decode(errors="replace"))
finally:
    target.write_bytes(original)
    component.write_bytes(component_original)
raise SystemExit(result.returncode)
