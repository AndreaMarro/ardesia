#!/usr/bin/env python3
"""ARDESIA Convergence — inventario componenti/licenze (Action 10, porzione).

NON sceglie ne' scrive la licenza: quella e' una decisione umana. Prepara e
verifica l'inventario che deve accompagnarla, rendendo bloccanti l'assenza
del LICENSE root e le dipendenze la cui licenza resta ignota.

Che cosa fa, in sola lettura, standard library:
- classifica i package.json propri per ruolo (Core studio, guest/legacy, tools);
- verifica se il repo ha LICENSE/NOTICE root;
- aggrega le licenze SPDX dichiarate dalle dipendenze installate;
- elenca le dipendenze SENZA campo license (classificazione ignota = bloccante).

Esce 1 se esistono rilievi bloccanti (LICENSE root assente o dipendenze senza
licenza). Le eccezioni sono ammesse solo se un file di licenza installato
corrisponde a un'evidenza versionata e verificata per nome, versione e SHA-256.
--report-only elenca senza bloccare.

Uso:
    python3 bin/convergence/license_inventory.py
    python3 bin/convergence/license_inventory.py --report-only
    python3 bin/convergence/license_inventory.py --json
"""
from __future__ import annotations

import argparse
import hashlib
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
EVIDENCE_PATH = "bin/convergence/license_evidence.json"


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


def _verified_evidence(
    package_dir: Path,
    name: str,
    version: object,
    evidence: dict,
) -> str | None:
    if not isinstance(version, str) or not version.strip():
        return None
    packages = evidence.get("packages")
    if not isinstance(packages, dict):
        return None
    record = packages.get(f"{name}@{version}")
    if not isinstance(record, dict):
        return None
    license_name = record.get("license")
    evidence_path = record.get("evidence_path")
    expected_hash = record.get("sha256")
    if not all(
        isinstance(value, str) and value.strip()
        for value in (license_name, evidence_path, expected_hash)
    ):
        return None
    try:
        package_root = package_dir.resolve()
        source = (package_root / evidence_path).resolve()
        source.relative_to(package_root)
        actual_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    except (OSError, ValueError):
        return None
    if actual_hash != expected_hash.lower():
        return None
    return license_name.strip()


def build_inventory(root: Path) -> dict:
    own = {}
    for rel, role in OWN_PACKAGES.items():
        pkg = _read_json(root / rel)
        if pkg is not None:
            own[rel] = {"role": role, "name": pkg.get("name"),
                        "license": _license_of(pkg)}

    has_license = any((root / f).is_file() for f in ("LICENSE", "LICENSE.md", "LICENSE.txt"))
    has_notice = any((root / f).is_file() for f in ("NOTICE", "NOTICE.md", "NOTICE.txt"))

    evidence = _read_json(root / EVIDENCE_PATH)
    if not isinstance(evidence, dict) or evidence.get("schema_version") != 1:
        evidence = {}

    spdx = Counter()
    unlicensed: list[str] = []
    evidence_verified: dict[str, str] = {}
    seen: set[str] = set()
    for nm_rel in NODE_MODULES_ROOTS:
        for name, j in _iter_installed(root / nm_rel):
            pkg = _read_json(j)
            lic = _license_of(pkg) if pkg else None
            version = pkg.get("version") if pkg else None
            package_key = (
                f"{name}@{version}"
                if isinstance(version, str) and version.strip()
                else name
            )
            if package_key in seen:
                continue
            seen.add(package_key)
            if not lic and pkg:
                lic = _verified_evidence(
                    j.parent,
                    name,
                    version,
                    evidence,
                )
                if lic:
                    evidence_verified[package_key] = lic
            if lic:
                spdx[lic] += 1
            else:
                unlicensed.append(package_key)

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
        "evidence_verified": dict(sorted(evidence_verified.items())),
        "unlicensed": sorted(unlicensed),
        "blocking": blocking,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA license/component inventory")
    parser.add_argument("--root", default=None)
    parser.add_argument("--report-only", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    inv = build_inventory(root)

    if args.json:
        print(json.dumps(inv, indent=2, ensure_ascii=False))
    else:
        print("license-inventory:")
        for rel, meta in inv["own_packages"].items():
            print(f"  [{meta['role']}] {rel}: license={meta['license']}")
        print(f"  LICENSE root: {inv['root_license_present']} | NOTICE: {inv['root_notice_present']}")
        print(f"  dipendenze installate: {inv['installed_total']} | senza license: {len(inv['unlicensed'])}")
        print(f"  evidenze licenza verificate: {inv['evidence_verified']}")
        print(f"  SPDX piu' frequenti: {inv['spdx_top']}")

    if inv["blocking"] and not args.report_only:
        print("license-inventory: RILIEVI BLOCCANTI (D-2 umana richiesta):", file=sys.stderr)
        for b in inv["blocking"]:
            print(f"  {b}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
