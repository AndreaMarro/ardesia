#!/usr/bin/env python3
"""ARDESIA Convergence — guard contro l'evidenza auto-referenziale (Action 2).

Il 23-07 ho misurato la causa meccanica delle "lineage" Chromatic moltiplicate:
i PR #194-#197 differiscono per 2 file su 25, e quei due sono record di evidenza
NOMINATI con lo SHA del commit che li produce. Ogni retry genera un nome nuovo ->
un tree nuovo -> un commit che non puo' essere patch-equivalente al precedente.
E' un punto fisso che non puo' convergere per costruzione.

Questo guard rifiuta i file di evidenza il cui basename e' uno SHA a 40
esadecimali: quel naming e' la fonte della non-convergenza. Rimedi accettati:
- content-addressing per attestazione (nome = digest di CIO' CHE si attesta);
- evidenza fuori dall'albero (artifact di run o release asset).

Standard library soltanto. Sola lettura.

Uso:
    python3 bin/convergence/evidence_guard.py                 # gate su docs/ops/evidence
    python3 bin/convergence/evidence_guard.py --dir PATH
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DEFAULT_DIRS = ("docs/ops/evidence",)
SHA40 = re.compile(r"^[0-9a-f]{40}$")


def find_self_referential(root: Path, dirs: tuple[str, ...]) -> list[str]:
    """File la cui base (senza estensione) e' uno SHA a 40 hex."""
    offenders: list[str] = []
    for d in dirs:
        base = root / d
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            if path.is_file() and SHA40.match(path.stem):
                offenders.append(str(path.relative_to(root)))
    return sorted(offenders)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA evidence self-reference guard")
    parser.add_argument("--root", default=None)
    parser.add_argument("--dir", action="append", default=None,
                        help="directory da controllare (ripetibile)")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    dirs = tuple(args.dir) if args.dir else DEFAULT_DIRS

    offenders = find_self_referential(root, dirs)
    if offenders:
        print(f"evidence-guard: {len(offenders)} file di evidenza SHA-nominati "
              "(punto fisso non-convergente):", file=sys.stderr)
        for o in offenders:
            print(f"  {o}", file=sys.stderr)
        print("  rimedio: nome = digest di cio' che si attesta, oppure "
              "evidenza fuori dall'albero (artifact/release asset).", file=sys.stderr)
        return 1
    print("evidence-guard: OK — nessun file di evidenza SHA-nominato")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
