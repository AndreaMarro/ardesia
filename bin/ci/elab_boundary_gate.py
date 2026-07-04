#!/usr/bin/env python3
"""Ratchet gate: the ELAB standalone surface must never grow.

plugins/elab-tutor is being extracted from a full standalone app into a
Simulation Plugin + ELABTutor Pack (data + method only). Until the
extraction lands, the standalone files that already exist are recorded in
the committed baseline. This gate fails when:

  1. a standalone-shaped file appears in plugins/elab-tutor that is NOT in
     the baseline (regression while extracting), or
  2. any standalone-shaped file appears under packs/ (the extracted Pack
     must carry only data + method, zero tolerance).

Regenerate the baseline (only to REMOVE entries, never to add) with:
    python3 bin/ci/elab_boundary_gate.py --write-baseline
"""
from __future__ import annotations

import re
import subprocess
import sys

BASELINE_PATH = "bin/ci/elab-standalone-baseline.txt"

STANDALONE_RULES = [
    re.compile(r"(^|/)App\.jsx$"),
    re.compile(r"(^|/)main\.jsx$"),
    re.compile(r"/supabase/functions/"),
    re.compile(r"auth", re.IGNORECASE),
    re.compile(r"dashboard", re.IGNORECASE),
]


def tracked(prefix: str) -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z", "--", prefix],
        check=True,
        capture_output=True,
    ).stdout
    return [p.decode() for p in out.split(b"\x00") if p]


def offenders(prefix: str) -> list[str]:
    return sorted(
        path
        for path in tracked(prefix)
        if any(rule.search(path) for rule in STANDALONE_RULES)
    )


def main() -> int:
    current = offenders("plugins/elab-tutor")

    if "--write-baseline" in sys.argv:
        with open(BASELINE_PATH, "w") as fh:
            fh.write("\n".join(current) + "\n")
        print(f"baseline written: {len(current)} entries")
        return 0

    try:
        with open(BASELINE_PATH) as fh:
            baseline = {line.strip() for line in fh if line.strip()}
    except FileNotFoundError:
        print(f"missing baseline {BASELINE_PATH}; run --write-baseline once")
        return 1

    new_offenders = [path for path in current if path not in baseline]
    pack_offenders = offenders("packs")

    if new_offenders:
        print("NEW standalone-shaped files in plugins/elab-tutor (gate: ratchet only shrinks):")
        for path in new_offenders:
            print(f"  {path}")
    if pack_offenders:
        print("Standalone-shaped files under packs/ (zero tolerance — Pack = data + method only):")
        for path in pack_offenders:
            print(f"  {path}")
    if new_offenders or pack_offenders:
        return 1

    print(
        f"elab_boundary_gate: OK ({len(current)} baseline offenders remain, "
        "none added; packs/ clean)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
