#!/usr/bin/env python3
"""Control: the same regression must reject baseline and accept current code."""
import json
import os
from pathlib import Path
import subprocess

evidence = Path(__file__).resolve().parent
repo = evidence.parents[4]
component = repo / "apps/web/src/components/PhysicsPathways.tsx"
current = component.read_bytes()
env = dict(os.environ)
env["PATH"] = "/opt/homebrew/bin:" + env["PATH"]
command = [
    "npm", "run", "test", "--workspace", "@ardesia/web", "--",
    "src/__tests__/curriculum-catalog.test.tsx", "-t", "a popstate at the first visible unit",
    "--reporter=verbose",
]
statuses = {}
try:
    for name, source in [("control-baseline", (evidence / "original-PhysicsPathways.tsx").read_bytes()), ("control-current", current)]:
        component.write_bytes(source)
        result = subprocess.run(command, cwd=repo, env=env, capture_output=True)
        (evidence / f"{name}.log").write_bytes(result.stdout + result.stderr)
        statuses[name] = result.returncode
finally:
    component.write_bytes(current)
(evidence / "control-status.json").write_text(json.dumps(statuses, indent=2) + "\n")
print(json.dumps(statuses))
raise SystemExit(0 if statuses == {"control-baseline": 1, "control-current": 0} else 1)
