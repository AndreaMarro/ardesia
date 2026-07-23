#!/usr/bin/env python3
"""ARDESIA Convergence — generatore di stato del control plane (Action 1).

Deriva lo stato corrente da Git in SOLA LETTURA. Non cancella worktree, non
chiude PR, non applica label, non tocca il remoto. Emette una fotografia
machine-readable con una PROPOSTA di disposizione per ogni worktree, e rifiuta
di marcare auto-rimovibile qualunque worktree con lavoro non committato,
non tracciato o non raggiungibile.

Uso:
    python3 bin/convergence/state.py                 # stampa lo stato JSON
    python3 bin/convergence/state.py --out FILE       # scrive lo stato su FILE
    python3 bin/convergence/state.py --check FILE     # valida un documento esistente

Standard library soltanto. GitHub non viene interrogato in questa prima
implementazione: `open_work` resta una lista vuota finche' un input read-only
esplicito non viene passato, e questo mantiene il generatore offline e
deterministico rispetto al solo stato Git locale.
"""
from __future__ import annotations

import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import state_schema  # noqa: E402

ACCEPTED_BASE_REF = "origin/main"

# Tetti sticky (Action 1). Non sono verita' assolute: sono soglie che, superate,
# obbligano a una decisione umana invece di lasciar crescere l'entropia.
CEILINGS = {
    "active_programs_max": state_schema.MAX_ACTIVE_PROGRAMS,
    "worktrees_max": 40,
    "state_freshness_hours": state_schema.FRESHNESS_MAX_HOURS,
}


def _git(args: list[str], cwd: str | None = None) -> str:
    return subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    ).stdout.strip()


def _repo_root() -> str:
    root = _git(["rev-parse", "--show-toplevel"])
    if not root:
        raise SystemExit("state.py: non dentro un repository Git")
    return root


def _worktrees(root: str) -> list[dict]:
    """Parser porcelain che NON spezza i path con spazi (lezione E-7)."""
    raw = _git(["worktree", "list", "--porcelain"], cwd=root)
    entries: list[dict] = []
    cur: dict = {}
    for line in raw.splitlines():
        if line.startswith("worktree "):
            if cur:
                entries.append(cur)
            cur = {"path": line[len("worktree "):]}
        elif line.startswith("branch "):
            cur["branch"] = line[len("branch "):].replace("refs/heads/", "")
        elif line == "detached":
            cur["branch"] = "(detached)"
    if cur:
        entries.append(cur)
    return entries


def _classify(path: str, base_sha: str) -> dict:
    """Stato read-only di una worktree + proposta di disposizione."""
    if not Path(path).is_dir():
        return {
            "path": path, "exists": False, "dirty": False,
            "untracked": False, "ahead": None, "behind": None,
            "disposition_proposal": "unknown", "auto_removable": False,
        }
    status = _git(["status", "--porcelain"], cwd=path)
    dirty = bool(status)
    untracked = any(line.startswith("??") for line in status.splitlines())
    counts = _git(
        ["rev-list", "--left-right", "--count", f"{base_sha}...HEAD"], cwd=path
    ).split()
    behind, ahead = (int(counts[0]), int(counts[1])) if len(counts) == 2 else (None, None)

    if dirty:
        disposition = "preserve-uncommitted"
    elif ahead == 0:
        disposition = "prunable"
    elif ahead and ahead > 0:
        disposition = "bundle-then-prune"
    else:
        disposition = "unknown"

    # Auto-rimovibile SOLO se pulita, senza commit propri e senza untracked.
    auto_removable = (
        not dirty and not untracked and ahead == 0 and disposition == "prunable"
    )
    return {
        "path": path, "exists": True, "dirty": dirty, "untracked": untracked,
        "ahead": ahead, "behind": behind,
        "disposition_proposal": disposition, "auto_removable": auto_removable,
    }


def generate(root: str) -> dict:
    base_sha = _git(["rev-parse", ACCEPTED_BASE_REF], cwd=root)
    head_sha = _git(["rev-parse", "HEAD"], cwd=root)
    branch = _git(["rev-parse", "--abbrev-ref", "HEAD"], cwd=root)
    dirty_files = len(_git(["status", "--porcelain"], cwd=root).splitlines())
    worktrees = [_classify(wt["path"], base_sha) for wt in _worktrees(root)]

    dirty_n = sum(1 for w in worktrees if w["dirty"])
    prunable_n = sum(1 for w in worktrees if w["disposition_proposal"] == "prunable")

    violations: list[str] = []
    if len(worktrees) > CEILINGS["worktrees_max"]:
        violations.append(
            f"worktrees {len(worktrees)} > tetto {CEILINGS['worktrees_max']}"
        )

    return {
        "schema_version": state_schema.SCHEMA_VERSION,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "generator": "bin/convergence/state.py",
        "accepted_base": {"ref": ACCEPTED_BASE_REF, "sha": base_sha},
        "active_branch": {"name": branch, "sha": head_sha, "dirty_files": dirty_files},
        "active_programs": [branch] if branch.startswith("codex/convergence-") else [],
        "worktrees": worktrees,
        "entropy": {
            "worktrees_total": len(worktrees),
            "worktrees_dirty": dirty_n,
            "worktrees_prunable": prunable_n,
            "open_prs": None,  # read-only GitHub non interrogato in questa slice
        },
        "ceilings": CEILINGS,
        "open_work": [],  # popolato solo da input GitHub read-only esplicito
        "violations": violations,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA convergence state (read-only)")
    parser.add_argument("--out", help="scrive lo stato JSON su questo file")
    parser.add_argument("--check", help="valida un documento di stato esistente")
    args = parser.parse_args(argv)

    if args.check:
        doc = json.loads(Path(args.check).read_text())
        try:
            state_schema.validate(doc)
        except state_schema.StateValidationError as exc:
            print(f"state: INVALID — {exc}", file=sys.stderr)
            return 1
        print("state: VALID")
        return 0

    doc = generate(_repo_root())
    state_schema.validate(doc)  # non emettere mai uno stato che non si valida
    rendered = json.dumps(doc, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(rendered + "\n")
        print(f"state: scritto {args.out}")
    else:
        print(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
