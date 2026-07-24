#!/usr/bin/env python3
"""ARDESIA Convergence — identita' del candidato di release (Action 10).

Il problema misurato (audit 24-07, rischio R2): i byte serviti non sono
riconducibili ai byte sorgente. Il build **gia'** incide lo SHA sorgente nel
bundle (`__ARDESIA_GIT_SHA__` in `apps/studio/vite.config.ts`), ma non esiste un
documento che leghi in modo verificabile SHA sorgente, digest degli artefatti,
digest dei lockfile e risultato dei gate. Senza quel legame, davanti a un
artefatto servito si puo' solo *indovinare* quale sorgente lo ha prodotto.

Questo script emette e VALIDA quel documento. Non deploya, non pubblica, non
tocca il remoto: produce evidenza o fallisce.

Uso:
    python3 bin/convergence/release_manifest.py --dist apps/studio/dist --out rel.json
    python3 bin/convergence/release_manifest.py --check rel.json --dist apps/studio/dist
    python3 bin/convergence/release_manifest.py --check rel.json          # solo invarianti interni

Regole che il manifest deve soddisfare (`--check`):

1. `source.sha` e' uno SHA completo a 40 hex **raggiungibile** in questo Git;
2. l'albero sorgente non era sporco: un candidato costruito su modifiche non
   committate non e' riconducibile a nessuno SHA;
3. ogni digest di artefatto coincide con il byte su disco;
4. `artifact_tree_digest` si ricalcola dalla lista degli artefatti;
5. i digest dei lockfile coincidono con quelli su disco;
6. la provenance e' vera E i file dichiarati come portatori contengono davvero
   `source.sha` — cioe' i byte serviti dicono da soli da dove vengono.

Il file NON va nominato con lo SHA che attesta (cfr. `evidence_guard.py`): il
nome che cambia a ogni retry e' il punto fisso che non converge mai.
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import platform
import re
import subprocess
import sys
from pathlib import Path

SCHEMA_VERSION = 1
FULL_SHA = re.compile(r"^[0-9a-f]{40}$")

# Lockfile sorvegliati: la loro identita' fa parte dell'identita' del candidato.
LOCKFILES = (
    "apps/studio/package-lock.json",
    "plugins/elab-tutor/package-lock.json",
    "packages/engine/uv.lock",
)

# Estensioni in cui cercare lo SHA sorgente inciso dal build.
CARRIER_SUFFIXES = (".js", ".mjs", ".html", ".json")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def tree_digest(artifacts: dict[str, dict]) -> str:
    """Digest stabile dell'insieme degli artefatti: ordinato, path + digest.

    Non dipende da mtime ne' dall'ordine di enumerazione del filesystem, quindi
    due build della stessa sorgente danno lo stesso valore o divergono per un
    motivo reale.
    """
    h = hashlib.sha256()
    for rel in sorted(artifacts):
        h.update(rel.encode("utf-8"))
        h.update(b"\0")
        h.update(artifacts[rel]["sha256"].encode("ascii"))
        h.update(b"\n")
    return h.hexdigest()


def _git(args: list[str], cwd: Path) -> str:
    return subprocess.run(["git", *args], cwd=cwd, check=True,
                          capture_output=True, text=True).stdout.strip()


def git_sha_reachable(root: Path, sha: str) -> bool:
    try:
        kind = subprocess.run(["git", "cat-file", "-t", sha], cwd=root,
                              capture_output=True, text=True)
        return kind.returncode == 0 and kind.stdout.strip() == "commit"
    except OSError:
        return False


def collect_artifacts(dist: Path) -> dict[str, dict]:
    artifacts: dict[str, dict] = {}
    for path in sorted(dist.rglob("*")):
        if not path.is_file():
            continue
        rel = str(path.relative_to(dist))
        artifacts[rel] = {"sha256": sha256_file(path), "bytes": path.stat().st_size}
    return artifacts


def find_provenance_carriers(dist: Path, sha: str) -> list[str]:
    """File del dist che contengono letteralmente lo SHA sorgente."""
    carriers: list[str] = []
    needle = sha.encode("ascii")
    for path in sorted(dist.rglob("*")):
        if not path.is_file() or path.suffix not in CARRIER_SUFFIXES:
            continue
        try:
            if needle in path.read_bytes():
                carriers.append(str(path.relative_to(dist)))
        except OSError:
            continue
    return carriers


def build(root: Path, dist: Path) -> dict:
    sha = _git(["rev-parse", "HEAD"], root)
    branch = _git(["rev-parse", "--abbrev-ref", "HEAD"], root)
    dirty = bool(_git(["status", "--porcelain"], root))

    artifacts = collect_artifacts(dist)
    carriers = find_provenance_carriers(dist, sha)

    lockfiles = {}
    for rel in LOCKFILES:
        p = root / rel
        if p.is_file():
            lockfiles[rel] = sha256_file(p)

    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": {"sha": sha, "branch": branch, "dirty": dirty},
        "dist_root": str(dist.relative_to(root)) if dist.is_relative_to(root) else str(dist),
        "artifacts": artifacts,
        "artifact_tree_digest": tree_digest(artifacts),
        "lockfiles": lockfiles,
        "provenance": {
            "source_sha_in_bundle": bool(carriers),
            "carriers": carriers,
        },
        "toolchain": {
            "python": platform.python_version(),
            "platform": platform.platform(),
        },
        "gates": [],
    }


def validate(manifest: dict, root: Path | None = None, dist: Path | None = None,
             sha_reachable=None) -> list[str]:
    """Ritorna la lista dei motivi di invalidita' (vuota = manifest valido)."""
    problems: list[str] = []

    if manifest.get("schema_version") != SCHEMA_VERSION:
        problems.append(
            f"schema_version {manifest.get('schema_version')} != {SCHEMA_VERSION}")

    source = manifest.get("source") or {}
    sha = source.get("sha")
    if not isinstance(sha, str) or not FULL_SHA.match(sha):
        problems.append(f"source.sha non e' uno SHA completo a 40 hex: {sha!r}")
        sha = None
    if source.get("dirty"):
        problems.append("source.dirty: il candidato e' stato costruito su un "
                        "albero sporco e non e' riconducibile a nessuno SHA")

    if sha is not None:
        reach = sha_reachable if sha_reachable is not None else (
            (lambda s: git_sha_reachable(root, s)) if root is not None else None)
        if reach is not None and not reach(sha):
            problems.append(f"source.sha {sha} non e' raggiungibile in questo Git")

    artifacts = manifest.get("artifacts") or {}
    if not artifacts:
        problems.append("artifacts: nessun artefatto dichiarato")
    else:
        declared = manifest.get("artifact_tree_digest")
        recomputed = tree_digest(artifacts)
        if declared != recomputed:
            problems.append(
                f"artifact_tree_digest {declared} != ricalcolato {recomputed}")

    if dist is not None:
        on_disk = collect_artifacts(dist)
        for rel, meta in artifacts.items():
            actual = on_disk.get(rel)
            if actual is None:
                problems.append(f"artefatto dichiarato assente su disco: {rel}")
            elif actual["sha256"] != meta.get("sha256"):
                problems.append(
                    f"digest divergente per {rel}: manifest {meta.get('sha256')} "
                    f"!= disco {actual['sha256']}")
        for rel in on_disk:
            if rel not in artifacts:
                problems.append(f"artefatto su disco non dichiarato: {rel}")

    if root is not None:
        for rel, digest in (manifest.get("lockfiles") or {}).items():
            p = root / rel
            if not p.is_file():
                problems.append(f"lockfile dichiarato assente: {rel}")
            elif sha256_file(p) != digest:
                problems.append(f"digest divergente per il lockfile {rel}")

    prov = manifest.get("provenance") or {}
    carriers = prov.get("carriers") or []
    if not prov.get("source_sha_in_bundle"):
        problems.append("provenance: i byte costruiti non contengono lo SHA "
                        "sorgente — l'artefatto servito non dice da dove viene")
    elif not carriers:
        problems.append("provenance: source_sha_in_bundle=true senza portatori")
    elif dist is not None and sha is not None:
        needle = sha.encode("ascii")
        for rel in carriers:
            p = dist / rel
            if not p.is_file() or needle not in p.read_bytes():
                problems.append(
                    f"provenance: {rel} e' dichiarato portatore ma non contiene {sha}")

    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA release manifest")
    parser.add_argument("--root", default=None)
    parser.add_argument("--dist", default=None,
                        help="cartella degli artefatti costruiti")
    parser.add_argument("--out", default=None, help="scrivi il manifest qui")
    parser.add_argument("--check", default=None, help="valida un manifest esistente")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    dist = Path(args.dist).resolve() if args.dist else None

    if args.check:
        manifest = json.loads(Path(args.check).read_text(encoding="utf-8"))
        problems = validate(manifest, root=root, dist=dist)
        if problems:
            print("release: manifest NON valido:", file=sys.stderr)
            for p in problems:
                print(f"  {p}", file=sys.stderr)
            return 1
        print(f"release: manifest valido — sorgente {manifest['source']['sha'][:8]}, "
              f"{len(manifest['artifacts'])} artefatti, "
              f"{len(manifest['provenance']['carriers'])} portatori di provenance")
        return 0

    if dist is None or not dist.is_dir():
        print("release: --dist e' obbligatorio per emettere un manifest "
              "(costruisci prima con `npm run build`)", file=sys.stderr)
        return 1

    manifest = build(root, dist)
    text = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"release: manifest scritto in {args.out}")
    else:
        print(text, end="")

    problems = validate(manifest, root=root, dist=dist)
    if problems:
        print("release: il manifest appena emesso NON e' valido:", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
