#!/usr/bin/env python3
"""ARDESIA Convergence — dipendenze dell'ospite che entrano nel bundle (Action 6).

`plugins/elab-tutor` e' l'app standalone ELAB in corso di estrazione verso
Simulation Plugin + ELABTutor Pack. Dichiara **36 dipendenze runtime**, ma solo
una parte e' raggiungibile dalla superficie che lo Studio consuma davvero
(`@elab-tutor-plugin/plugin/renderEmbeddable` e `@elab-tutor-plugin/data/*`).

`bin/ci/elab_boundary_gate.py` ratcheta i **file** di forma standalone. Qui si
ratcheta l'altra meta' del problema: le **dipendenze**. Senza, una nuova
dipendenza standalone puo' entrare nel grafo di produzione senza che nessun gate
se ne accorga — ed e' esattamente il modo in cui uno strangler si inverte.

Il metodo e' una chiusura transitiva degli import a partire dagli entry point
reali dell'host: nessun bundler, nessuna dipendenza nuova, solo lettura.

Limite dichiarato: la risoluzione e' statica e testuale. Import dinamici
calcolati a runtime (`import(variabile)`) non sono seguiti. E' un limite del
metodo, non un'assenza di prova: cio' che il gate afferma e' «questo insieme e'
raggiungibile staticamente», non «questo insieme e' tutto».

Uso:
    python3 bin/convergence/guest_deps.py                 # gate
    python3 bin/convergence/guest_deps.py --json
    python3 bin/convergence/guest_deps.py --update-baseline   # gate umano
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

BASELINE_PATH = "bin/convergence/guest_deps_baseline.json"
GUEST = "plugins/elab-tutor"

# Superficie realmente consumata dall'host (alias @elab-tutor-plugin -> src).
ENTRY_POINTS = (
    "src/plugin/renderEmbeddable",
    "src/data/experiments-vol1",
    "src/data/experiments-index",
    "src/data/experiment-visibility",
)

SUFFIXES = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")
IMPORT_RE = re.compile(
    r"""(?:^|\s)(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]"""
    r"""|(?:^|\s)import\s*['"]([^'"]+)['"]"""
    r"""|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)"""
    r"""|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)""",
    re.MULTILINE,
)


def package_of(specifier: str) -> str | None:
    """Nome del pacchetto npm di uno specifier bare, o None se relativo."""
    if specifier.startswith(".") or specifier.startswith("/"):
        return None
    if specifier.startswith("node:"):
        return None
    parts = specifier.split("/")
    if specifier.startswith("@"):
        return "/".join(parts[:2]) if len(parts) >= 2 else specifier
    return parts[0]


def resolve(base: Path, specifier: str) -> Path | None:
    target = (base.parent / specifier).resolve()
    for suffix in ("",) + SUFFIXES:
        candidate = Path(str(target) + suffix)
        if candidate.is_file():
            return candidate
    for suffix in SUFFIXES:
        candidate = target / f"index{suffix}"
        if candidate.is_file():
            return candidate
    return None


def resolve_entry(guest_root: Path, entry: str) -> Path | None:
    target = guest_root / entry
    for suffix in ("",) + SUFFIXES:
        candidate = Path(str(target) + suffix)
        if candidate.is_file():
            return candidate
    for suffix in SUFFIXES:
        candidate = target / f"index{suffix}"
        if candidate.is_file():
            return candidate
    return None


def specifiers(text: str) -> list[str]:
    out: list[str] = []
    for groups in IMPORT_RE.findall(text):
        for g in groups:
            if g:
                out.append(g)
    return out


def reachable(guest_root: Path) -> tuple[set[str], set[str], list[str]]:
    """(pacchetti raggiungibili, file visitati, entry point non risolti)."""
    missing_entries: list[str] = []
    queue: list[Path] = []
    for entry in ENTRY_POINTS:
        path = resolve_entry(guest_root, entry)
        if path is None:
            missing_entries.append(entry)
        else:
            queue.append(path)

    seen: set[Path] = set()
    packages: set[str] = set()
    while queue:
        path = queue.pop()
        if path in seen:
            continue
        seen.add(path)
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for spec in specifiers(text):
            pkg = package_of(spec)
            if pkg is not None:
                packages.add(pkg)
                continue
            nxt = resolve(path, spec)
            if nxt is not None:
                queue.append(nxt)
    return packages, {str(p) for p in seen}, missing_entries


def declared_dependencies(guest_root: Path) -> set[str]:
    pkg = json.loads((guest_root / "package.json").read_text(encoding="utf-8"))
    return set(pkg.get("dependencies", {}))


def load_baseline(root: Path) -> dict:
    p = root / BASELINE_PATH
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}


def analyse(root: Path) -> dict:
    guest_root = root / GUEST
    declared = declared_dependencies(guest_root)
    packages, files, missing_entries = reachable(guest_root)
    in_bundle = sorted(packages & declared)
    standalone_only = sorted(declared - packages)
    external = sorted(packages - declared)  # deps non dichiarate: peer o transitive
    return {
        "declared": sorted(declared),
        "in_founder_bundle": in_bundle,
        "standalone_only": standalone_only,
        "reachable_not_declared": external,
        "files_walked": len(files),
        "missing_entry_points": missing_entries,
    }


def check(root: Path) -> list[str]:
    baseline = load_baseline(root)
    current = analyse(root)
    failures: list[str] = []

    if current["missing_entry_points"]:
        failures.append(
            "entry point dell'host non risolti (la superficie e' cambiata): "
            + ", ".join(current["missing_entry_points"]))

    base_bundle = set(baseline.get("in_founder_bundle", []))
    base_standalone = set(baseline.get("standalone_only", []))
    base_declared = base_bundle | base_standalone

    # 1. congelamento: nessuna dipendenza NUOVA entra nel grafo di produzione.
    for pkg in current["in_founder_bundle"]:
        if pkg not in base_bundle:
            origin = ("promossa da standalone-only" if pkg in base_standalone
                      else "nuova dipendenza")
            failures.append(
                f"'{pkg}' e' ora raggiungibile dal bundle Founder ({origin}); "
                "lo strangler puo' solo restringere la superficie dell'ospite")

    # 2. nessuna dipendenza non classificata: una dep aggiunta al package.json
    #    senza passare dalla baseline e' invisibile a ogni altro gate.
    for pkg in current["declared"]:
        if pkg not in base_declared:
            failures.append(
                f"'{pkg}' e' dichiarata in {GUEST}/package.json ma non e' "
                "classificata nella baseline (rigenera consapevolmente)")

    return failures


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA guest dependency ratchet")
    parser.add_argument("--root", default=None)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--update-baseline", action="store_true")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    current = analyse(root)

    if args.json:
        print(json.dumps(current, indent=2, ensure_ascii=False))

    if args.update_baseline:
        payload = {
            "schema_version": 1,
            "comment": (
                "Chiusura transitiva statica dagli entry point consumati "
                "dall'host. in_founder_bundle puo' solo restringersi; ogni "
                "dipendenza dichiarata deve comparire in una delle due liste."
            ),
            "entry_points": list(ENTRY_POINTS),
            "in_founder_bundle": current["in_founder_bundle"],
            "standalone_only": current["standalone_only"],
        }
        (root / BASELINE_PATH).write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        print(f"guest-deps: baseline aggiornata -> {BASELINE_PATH} "
              f"({len(current['in_founder_bundle'])} nel bundle, "
              f"{len(current['standalone_only'])} solo standalone)")
        return 0

    failures = check(root)
    if failures:
        print("guest-deps: la superficie dell'ospite e' CRESCIUTA:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        return 1
    print(f"guest-deps: OK — {len(current['in_founder_bundle'])} dipendenze nel "
          f"bundle Founder, {len(current['standalone_only'])} confinate allo "
          f"standalone ({current['files_walked']} file percorsi)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
