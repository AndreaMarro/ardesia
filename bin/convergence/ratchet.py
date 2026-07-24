#!/usr/bin/env python3
"""ARDESIA Convergence — ratchet sticky su debito misurabile (Action 2).

Impedisce che il debito cresca in SILENZIO, senza obbligare a ripagarlo subito.
Due tetti:

- LOC dei monoliti: calcolata direttamente dallo script (nessun toolchain).
  Il tetto e' il valore alla baseline; il file non puo' crescere oltre. Ridurre
  e' permesso e puo' abbassare il tetto con --update-baseline.
- errori di lint: il conteggio viene FORNITO dalla CI (--lint-errors N); lo
  script non esegue eslint, resta standard-library e veloce. Il tetto e' sticky.

Nessuna dipendenza nuova. Sola lettura sul codice.

Uso:
    python3 bin/convergence/ratchet.py --lint-errors 237     # gate completo
    python3 bin/convergence/ratchet.py                       # solo tetti LOC
    python3 bin/convergence/ratchet.py --update-baseline --lint-errors 237
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BASELINE_PATH = "bin/convergence/ratchet_baseline.json"

# File monolitici sorvegliati. LOC come tetto sticky e segnale secondario:
# il vero obiettivo (design Action 8) e' ridurre accoppiamento e responsabilita',
# non la sola lunghezza. Il tetto serve a impedire la crescita mentre si decompone.
MONOLITHS = (
    "apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx",
    "apps/studio/src/Room.tsx",
)


def _loc(path: Path) -> int:
    return len(path.read_text(encoding="utf-8", errors="replace").splitlines())


def current_metrics(root: Path) -> dict:
    monoliths = {}
    for rel in MONOLITHS:
        p = root / rel
        if p.is_file():
            monoliths[rel] = _loc(p)
    return {"monoliths": monoliths}


def load_baseline(root: Path) -> dict:
    p = root / BASELINE_PATH
    if not p.is_file():
        return {}
    return json.loads(p.read_text())


def check(root: Path, lint_errors: int | None) -> list[str]:
    baseline = load_baseline(root)
    failures: list[str] = []

    base_mono = baseline.get("monoliths", {})
    cur = current_metrics(root)["monoliths"]
    for rel, loc in cur.items():
        ceiling = base_mono.get(rel)
        if ceiling is None:
            failures.append(f"{rel}: nessun tetto in baseline (rigenera con --update-baseline)")
        elif loc > ceiling:
            failures.append(f"{rel}: LOC {loc} > tetto {ceiling} (+{loc - ceiling})")

    if lint_errors is not None:
        lint_ceiling = baseline.get("lint_errors_max")
        if lint_ceiling is None:
            failures.append("lint: nessun tetto in baseline")
        elif lint_errors > lint_ceiling:
            failures.append(f"lint: {lint_errors} errori > tetto {lint_ceiling} (+{lint_errors - lint_ceiling})")

    return failures


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA sticky debt ratchet")
    parser.add_argument("--root", default=None)
    parser.add_argument("--lint-errors", type=int, default=None,
                        help="conteggio errori eslint fornito dalla CI")
    parser.add_argument("--update-baseline", action="store_true")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]

    if args.update_baseline:
        base = current_metrics(root)
        if args.lint_errors is not None:
            base["lint_errors_max"] = args.lint_errors
        base["schema_version"] = 1
        (root / BASELINE_PATH).write_text(
            json.dumps(base, indent=2, ensure_ascii=False) + "\n")
        print(f"ratchet: baseline aggiornata -> {BASELINE_PATH}")
        return 0

    failures = check(root, args.lint_errors)
    if failures:
        print("ratchet: debito CRESCIUTO oltre il tetto sticky:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        return 1
    print("ratchet: OK — nessun tetto superato")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
