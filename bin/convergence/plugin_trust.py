#!/usr/bin/env python3
"""ARDESIA Convergence — receipt di fiducia dei plugin (Action 5).

ARDESIA ha oggi **due percorsi di acquisizione** con garanzie diverse:

- `builtin-compiled` — il plugin e' compilato dentro il bundle Studio.
  `toolhost/founderBetaPlugin.ts` dice a chiare lettere che `builtin-reviewed`
  e' un'etichetta di *provenienza*, non l'esito di una verifica crittografica al
  mount: nessuna firma del manifest ne' digest del bundle vengono verificati.
- `installed-signed` — `toolhost/installer.ts` verifica davvero la firma ed25519
  del manifest e, quando il manifest firmato impegna `integrity.bundleSha256`,
  confronta il digest del bundle consegnato prima di qualunque scrittura.

La distinzione e' scritta con onesta' nei commenti del sorgente. Il problema e'
che vive **solo** nei commenti: nulla impedisce che un domani un built-in venga
descritto come «verificato», o che un receipt rivendichi un controllo che il suo
percorso non puo' fornire.

Questo script rende la distinzione controllabile a macchina. Non monta plugin,
non installa, non verifica firme a runtime: valida i *receipt* rispetto a cio'
che ciascun percorso puo' onestamente garantire.

Uso:
    python3 bin/convergence/plugin_trust.py --receipts receipts.json
    python3 bin/convergence/plugin_trust.py --check-source     # invarianti sul sorgente
    python3 bin/convergence/test_plugin_trust.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REGISTRY_PATH = "bin/convergence/plugin_trust_registry.json"
FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
BASE64_DIGEST = re.compile(r"^[A-Za-z0-9+/]{43}=$")  # SHA-256 in base64
HEX_DIGEST = re.compile(r"^[0-9a-f]{64}$")

REQUIRED_FIELDS = ("plugin_id", "version", "publisher_id", "acquisition_mode",
                   "trust_tier", "verified_checks")


def load_registry(root: Path) -> dict:
    return json.loads((root / REGISTRY_PATH).read_text(encoding="utf-8"))


def validate_receipts(receipts: list[dict], registry: dict) -> list[str]:
    """Ritorna i motivi di invalidita' (lista vuota = tutti i receipt validi)."""
    problems: list[str] = []
    modes = registry.get("acquisition_modes", {})
    seen: dict[str, int] = {}

    for i, r in enumerate(receipts):
        where = f"receipt[{i}]"
        if not isinstance(r, dict):
            problems.append(f"{where}: non e' un oggetto")
            continue

        for field in REQUIRED_FIELDS:
            if field not in r:
                problems.append(f"{where}: campo obbligatorio assente: {field}")
        if any(f not in r for f in REQUIRED_FIELDS):
            continue

        pid = r["plugin_id"]
        where = f"receipt[{pid}]"
        seen[pid] = seen.get(pid, 0) + 1

        mode_name = r["acquisition_mode"]
        mode = modes.get(mode_name)
        if mode is None:
            problems.append(f"{where}: modo di acquisizione sconosciuto: {mode_name}")
            continue

        # Il cuore del gate: nessun receipt puo' rivendicare un controllo che il
        # suo percorso di acquisizione non esegue. Un built-in che dichiara
        # "manifest-signature-ed25519" sta mentendo sul proprio livello.
        provides = set(mode["provides"])
        for check in r["verified_checks"]:
            if check not in provides:
                problems.append(
                    f"{where}: rivendica '{check}', che '{mode_name}' non esegue "
                    f"(consentiti: {sorted(provides)})")

        if r["trust_tier"] != mode["trust_tier"]:
            problems.append(
                f"{where}: trust_tier '{r['trust_tier']}' != "
                f"'{mode['trust_tier']}' previsto da '{mode_name}'")

        if mode["requires_source_sha"]:
            sha = r.get("source_sha")
            if not isinstance(sha, str) or not FULL_SHA.match(sha):
                problems.append(
                    f"{where}: '{mode_name}' e' legato al build dello Studio e "
                    f"richiede source_sha completo a 40 hex, trovato {sha!r}")

        if mode["requires_bundle_digest"]:
            digest = r.get("bundle_digest")
            if not isinstance(digest, str) or not (
                    BASE64_DIGEST.match(digest) or HEX_DIGEST.match(digest)):
                problems.append(
                    f"{where}: '{mode_name}' impegna il bundle e richiede un "
                    f"digest SHA-256, trovato {digest!r}")

    for pid, count in seen.items():
        if count > 1:
            problems.append(f"plugin '{pid}': {count} receipt per lo stesso id")

    return problems


def check_source_invariants(root: Path, registry: dict) -> list[str]:
    """Il sorgente non deve poter cambiare il tier senza cambiare il modello.

    Se qualcuno riscrive FOUNDER_BETA_PLUGIN_TRUST_TIER in "verified" senza
    introdurre la verifica corrispondente, questo controllo fallisce.
    """
    problems: list[str] = []
    for rel, constants in (registry.get("source_invariants") or {}).items():
        path = root / rel
        if not path.is_file():
            problems.append(f"invariante sorgente: file assente: {rel}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for name, expected in constants.items():
            m = re.search(rf"\b{re.escape(name)}\s*=\s*[\"']([^\"']+)[\"']", text)
            if m is None:
                problems.append(f"{rel}: costante {name} non trovata")
            elif m.group(1) != expected:
                problems.append(
                    f"{rel}: {name} = '{m.group(1)}' != '{expected}' del registro "
                    "(il tier e' cambiato senza cambiare il modello di fiducia)")
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA plugin trust receipts")
    parser.add_argument("--root", default=None)
    parser.add_argument("--receipts", default=None,
                        help="file JSON con la lista dei receipt da validare")
    parser.add_argument("--check-source", action="store_true",
                        help="verifica gli invarianti sul sorgente")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    registry = load_registry(root)

    problems: list[str] = []
    if args.receipts:
        receipts = json.loads(Path(args.receipts).read_text(encoding="utf-8"))
        problems += validate_receipts(receipts, registry)
    if args.check_source or not args.receipts:
        problems += check_source_invariants(root, registry)

    if problems:
        print("plugin-trust: NON valido:", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        return 1
    print("plugin-trust: OK — modello di fiducia coerente col sorgente")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
