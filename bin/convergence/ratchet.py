#!/usr/bin/env python3
"""ARDESIA Convergence — ratchet sticky su debito misurabile (Action 2).

Impedisce che il debito cresca in SILENZIO, senza obbligare a ripagarlo subito.
Due tetti:

- LOC dei monoliti: calcolata direttamente dallo script (nessun toolchain).
  Il tetto e' il valore alla baseline; il file non puo' crescere oltre. Ridurre
  e' permesso e puo' abbassare il tetto con --update-baseline.
- errori di lint: il conteggio viene FORNITO dalla CI, o come intero
  (--lint-errors N) o come report eslint gia' prodotto (--lint-json FILE). Lo
  script non esegue mai eslint: resta standard-library e veloce. Tetto sticky.

Nessuna dipendenza nuova. Sola lettura sul codice.

Uso:
    python3 bin/convergence/ratchet.py --lint-errors 237     # gate completo
    python3 bin/convergence/ratchet.py --lint-json eslint.json
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


def lint_errors_from_report(text: str) -> int:
    """Conta gli errori in un report `eslint --format json`.

    La CI produce il report; questo script lo legge soltanto. Un report vuoto
    (`[]`) vale 0 errori — ed e' proprio il caso da NON confondere con "eslint
    non ha girato": se lo step di lint fallisce, la CI non scrive il file e il
    gate resta senza conteggio invece di leggerne uno finto.
    """
    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError("report eslint: atteso un array JSON di file")
    total = 0
    for entry in data:
        if not isinstance(entry, dict) or "errorCount" not in entry:
            raise ValueError("report eslint: voce senza errorCount")
        total += int(entry["errorCount"])
    return total


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


def check(root: Path, lint_errors: int | None, lint_scope: str | None = None) -> list[str]:
    baseline = load_baseline(root)
    failures: list[str] = []

    # Un conteggio lint senza scope dichiarato non e' confrontabile: `eslint .`
    # e `eslint src` misurano alberi diversi (258 vs 237 il 24-07) e scambiarli
    # fa leggere un cambio di perimetro come regressione o come miglioramento.
    if lint_errors is not None:
        base_scope = baseline.get("lint_scope")
        if base_scope is not None and lint_scope != base_scope:
            failures.append(
                f"lint: scope '{lint_scope}' != scope della baseline '{base_scope}' "
                "(conteggi non confrontabili)")

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
    parser.add_argument("--lint-json", default=None,
                        help="report `eslint --format json` da cui contare gli errori")
    parser.add_argument("--lint-scope", default=None,
                        help="comando/albero che ha prodotto il conteggio (deve "
                             "coincidere con quello della baseline)")
    parser.add_argument("--update-baseline", action="store_true")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]

    lint_errors = args.lint_errors
    if args.lint_json is not None:
        report = Path(args.lint_json)
        if not report.is_file():
            print(f"ratchet: report eslint assente: {report}", file=sys.stderr)
            return 1
        try:
            from_report = lint_errors_from_report(report.read_text(encoding="utf-8"))
        except (ValueError, json.JSONDecodeError) as exc:
            print(f"ratchet: report eslint illeggibile: {exc}", file=sys.stderr)
            return 1
        if lint_errors is not None and lint_errors != from_report:
            print(f"ratchet: --lint-errors {lint_errors} contraddice il report "
                  f"({from_report}): due fonti in disaccordo", file=sys.stderr)
            return 1
        lint_errors = from_report
    args.lint_errors = lint_errors

    if args.update_baseline:
        base = current_metrics(root)
        if args.lint_errors is not None:
            base["lint_errors_max"] = args.lint_errors
            if args.lint_scope is None:
                print("ratchet: --update-baseline con un conteggio lint richiede "
                      "--lint-scope", file=sys.stderr)
                return 1
            base["lint_scope"] = args.lint_scope
        base["schema_version"] = 1
        (root / BASELINE_PATH).write_text(
            json.dumps(base, indent=2, ensure_ascii=False) + "\n")
        print(f"ratchet: baseline aggiornata -> {BASELINE_PATH}")
        return 0

    failures = check(root, args.lint_errors, args.lint_scope)
    if failures:
        print("ratchet: debito CRESCIUTO oltre il tetto sticky:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        return 1
    print("ratchet: OK — nessun tetto superato")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
