#!/usr/bin/env python3
"""ARDESIA Convergence — inventario componenti/licenze (Action 10, porzione).

NON sceglie ne' scrive la licenza: quella e' la decisione umana D-2. Prepara
l'inventario che DEVE precederla, e rende visibile e bloccante lo stato legale
attuale: il repository non ha LICENSE ne' NOTICE, quindi nessuna distribuzione a
terzi ha base legale.

Che cosa fa, in sola lettura, standard library:
- classifica i package.json propri per ruolo (Core studio, guest/legacy, tools);
- verifica se il repo ha LICENSE/NOTICE root;
- aggrega le licenze SPDX dichiarate dalle dipendenze installate;
- elenca le dipendenze SENZA campo license (classificazione ignota = bloccante).

Esce 1 se esistono rilievi bloccanti (LICENSE root assente o dipendenze senza
licenza). --report-only elenca senza bloccare.

Uso:
    python3 bin/convergence/license_inventory.py
    python3 bin/convergence/license_inventory.py --report-only
    python3 bin/convergence/license_inventory.py --json
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

# package.json propri e il ruolo che il design assegna a ciascuno.
OWN_PACKAGES = {
    "package.json": "root",
    "apps/studio/package.json": "core-studio",
    "plugins/elab-tutor/package.json": "guest-legacy",
    "ops/tools/package.json": "tools",
}

# node_modules da inventariare per le licenze delle dipendenze installate.
NODE_MODULES_ROOTS = ("apps/studio/node_modules", "node_modules")


def _read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8", errors="replace"))
    except (OSError, json.JSONDecodeError):
        return None


def _license_of(pkg: dict) -> str | None:
    lic = pkg.get("license")
    if isinstance(lic, str) and lic.strip():
        return lic.strip()
    if isinstance(lic, dict) and lic.get("type"):
        return str(lic["type"])
    lics = pkg.get("licenses")
    if isinstance(lics, list) and lics:
        first = lics[0]
        if isinstance(first, dict) and first.get("type"):
            return str(first["type"])
    return None


# Un package.json senza campo `license` non significa "senza licenza": molti
# pacchetti spediscono il testo in un file e omettono il campo. `khroma@2.1.0`
# e' il caso reale trovato il 24-07 — campo assente, file `license` con "The MIT
# License (MIT)". Trattarlo come ignoto produce un blocco legale permanente per
# un errore di metadati. Si legge il file, e se non dice nulla di riconoscibile
# allora si', resta ignoto.
# Glob e non lista fissa: `fuzzy@0.1.3` spedisce `LICENSE-MIT`, e una lista di
# nomi esatti lo avrebbe mancato.
LICENSE_FILE_GLOBS = ("LICENSE*", "license*", "LICENCE*", "licence*",
                      "COPYING*", "copying*")

_SPDX_FROM_TEXT = (
    ("MIT", ("the mit license", "permission is hereby granted, free of charge")),
    ("Apache-2.0", ("apache license", "version 2.0, january 2004")),
    ("BSD-3-Clause", ("neither the name of", "redistribution and use in source")),
    ("BSD-2-Clause", ("redistribution and use in source and binary forms",)),
    ("ISC", ("permission to use, copy, modify, and/or distribute this software",)),
    ("MPL-2.0", ("mozilla public license",)),
    ("GPL-3.0", ("gnu general public license", "version 3")),
)


def license_from_package_dir(pkg_dir: Path) -> str | None:
    """Licenza dedotta dal pacchetto quando il campo canonico manca.

    Due sorgenti, in ordine: il `licenses` legacy nel package.json del pacchetto
    (`fuzzy@0.1.3` lo usa ancora) e il testo di licenza spedito, se riconoscibile.
    """
    own = _read_json(pkg_dir / "package.json")
    if own:
        declared = _license_of(own)
        if declared:
            # Etichetta neutra: qui non si sa se il campo canonico mancava nel
            # lockfile o se il pacchetto usa il `licenses` legacy. Dire quale
            # sarebbe inventare.
            return f"{declared} (dal package.json del pacchetto)"

    for glob in LICENSE_FILE_GLOBS:
        for path in sorted(pkg_dir.glob(glob)):
            if not path.is_file():
                continue
            try:
                head = path.read_text(encoding="utf-8",
                                      errors="replace")[:4000].lower()
            except OSError:
                continue
            for spdx, needles in _SPDX_FROM_TEXT:
                if all(needle in head for needle in needles):
                    return f"{spdx} (dal file, campo assente)"
    return None


# Nome storico mantenuto: i test e il resto dello script lo usano.
license_from_file = license_from_package_dir


def _iter_installed(nm: Path):
    if not nm.is_dir():
        return
    for entry in nm.iterdir():
        if entry.name.startswith(".") or not entry.is_dir():
            continue
        if entry.name.startswith("@"):
            for sub in entry.iterdir():
                j = sub / "package.json"
                if j.is_file():
                    yield f"{entry.name}/{sub.name}", j
        else:
            j = entry / "package.json"
            if j.is_file():
                yield entry.name, j


# Il NOTICE deve coprire cio' che viene SPEDITO, non tutto cio' che e'
# installato. Il lockfile marca `dev: true` sui pacchetti di sviluppo: e' la
# fonte giusta, ed e' versionata. Misurato il 24-07 su apps/studio: 527 voci,
# 277 di produzione e 249 di sviluppo.
PRODUCTION_LOCKFILE = "apps/studio/package-lock.json"


def production_dependencies(root: Path) -> list[dict]:
    """Pacchetti di produzione dal lockfile, con licenza risolta."""
    lock = _read_json(root / PRODUCTION_LOCKFILE)
    if not lock or "packages" not in lock:
        return []
    node_modules = root / PRODUCTION_LOCKFILE.replace(
        "package-lock.json", "node_modules")
    out: list[dict] = []
    for key, meta in lock["packages"].items():
        if not key.startswith("node_modules/") or meta.get("dev"):
            continue
        name = key.split("node_modules/")[-1]
        lic = meta.get("license")
        if isinstance(lic, list):
            lic = " OR ".join(str(x) for x in lic)
        if not lic:
            lic = license_from_file(node_modules / name)
        out.append({"name": name, "version": meta.get("version"),
                    "license": lic or "UNKNOWN"})
    out.sort(key=lambda p: p["name"])
    return out


def render_notice(root: Path, deps: list[dict]) -> str:
    by_license: dict[str, list[str]] = {}
    for dep in deps:
        by_license.setdefault(dep["license"], []).append(
            f"{dep['name']}@{dep['version']}")

    lines = [
        "NOTICE — componenti di terze parti",
        "",
        "ARDESIA Studio include i pacchetti elencati qui sotto, ciascuno",
        "distribuito dai rispettivi autori sotto la licenza indicata. Le",
        "licenze originali restano quelle dei rispettivi progetti; questo",
        "elenco non le sostituisce e non le modifica.",
        "",
        "Generato da `python3 bin/convergence/license_inventory.py --emit-notice`",
        f"dalle dipendenze **di produzione** di `{PRODUCTION_LOCKFILE}`",
        "(le dipendenze di sviluppo non vengono spedite e non sono elencate).",
        "Rigenerare dopo ogni modifica del lockfile.",
        "",
        f"Totale pacchetti di produzione: {len(deps)}",
        "",
    ]
    for lic in sorted(by_license):
        names = sorted(by_license[lic])
        lines.append(f"## {lic} ({len(names)})")
        lines.append("")
        lines.extend(f"- {n}" for n in names)
        lines.append("")
    return "\n".join(lines) + "\n"


def build_inventory(root: Path) -> dict:
    own = {}
    for rel, role in OWN_PACKAGES.items():
        pkg = _read_json(root / rel)
        if pkg is not None:
            own[rel] = {"role": role, "name": pkg.get("name"),
                        "license": _license_of(pkg)}

    has_license = any((root / f).is_file() for f in ("LICENSE", "LICENSE.md", "LICENSE.txt"))
    has_notice = any((root / f).is_file() for f in ("NOTICE", "NOTICE.md", "NOTICE.txt"))

    spdx = Counter()
    unlicensed: list[str] = []
    seen: set[str] = set()
    for nm_rel in NODE_MODULES_ROOTS:
        for name, j in _iter_installed(root / nm_rel):
            if name in seen:
                continue
            seen.add(name)
            pkg = _read_json(j)
            lic = _license_of(pkg) if pkg else None
            if not lic:
                lic = license_from_file(j.parent)
            if lic:
                spdx[lic] += 1
            else:
                unlicensed.append(name)

    blocking: list[str] = []
    if not has_license:
        blocking.append("LICENSE root assente: nessuna distribuzione a terzi ha base legale (D-2 umana)")
    if unlicensed:
        blocking.append(f"{len(unlicensed)} dipendenze senza campo license (classificazione ignota)")

    return {
        "schema_version": 1,
        "own_packages": own,
        "root_license_present": has_license,
        "root_notice_present": has_notice,
        "installed_total": len(seen),
        "spdx_top": dict(spdx.most_common(12)),
        "unlicensed": sorted(unlicensed),
        "blocking": blocking,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA license/component inventory")
    parser.add_argument("--root", default=None)
    parser.add_argument("--report-only", action="store_true")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--emit-notice", default=None, metavar="FILE",
                        help="genera il NOTICE dalle dipendenze di produzione")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]

    if args.emit_notice:
        deps = production_dependencies(root)
        if not deps:
            print(f"license-inventory: {PRODUCTION_LOCKFILE} illeggibile o vuoto",
                  file=sys.stderr)
            return 1
        unknown = [d["name"] for d in deps if d["license"] == "UNKNOWN"]
        Path(args.emit_notice).write_text(render_notice(root, deps),
                                          encoding="utf-8")
        print(f"license-inventory: NOTICE generato ({len(deps)} pacchetti di "
              f"produzione) -> {args.emit_notice}")
        if unknown:
            print(f"license-inventory: {len(unknown)} pacchetti con licenza "
                  f"ignota nel NOTICE: {unknown}", file=sys.stderr)
            return 1
        return 0

    inv = build_inventory(root)

    if args.json:
        print(json.dumps(inv, indent=2, ensure_ascii=False))
    else:
        print("license-inventory:")
        for rel, meta in inv["own_packages"].items():
            print(f"  [{meta['role']}] {rel}: license={meta['license']}")
        print(f"  LICENSE root: {inv['root_license_present']} | NOTICE: {inv['root_notice_present']}")
        print(f"  dipendenze installate: {inv['installed_total']} | senza license: {len(inv['unlicensed'])}")
        print(f"  SPDX piu' frequenti: {inv['spdx_top']}")

    if inv["blocking"] and not args.report_only:
        print("license-inventory: RILIEVI BLOCCANTI (D-2 umana richiesta):", file=sys.stderr)
        for b in inv["blocking"]:
            print(f"  {b}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
