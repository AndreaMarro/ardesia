#!/usr/bin/env python3
"""ARDESIA Convergence — checker dei confini architetturali (Action 3).

Rende ESECUTIVI i divieti che il design §4.3 e gli audit del 23-07 hanno
enunciato come prosa. Standard library soltanto. Deterministico. Sola lettura.

Il modello e' un ratchet: le violazioni legacy esistenti sono congelate in una
baseline versionata; il gate fallisce SOLO su violazioni nuove. Nessun debito
viene forzato a essere ripagato subito.

Regole (ognuna con un port permesso, non un semplice "vietato"):

- LESSONOS-NO-READALL: i lettori session-scoped della Continuita' non chiamano
  readAll/readAllEnvelopes -> usare la porta readEnvelopesBySession iniettata.
- NO-FLAT-PATH: lessonos e la Continuita' non usano i path flat globali ->
  usare roomPaths(room)/sessionPaths(identity).
- PACK-NO-RUNTIME: i Pack sono dati+metodo, non runtime -> niente supabase,
  auth, analytics, express, blockly, AI SDK.
- VIEW-NO-DRIVER: le viste non possiedono driver di persistenza concreti ->
  usare WorkspaceStore.
- PLUGIN-NO-LESSONOS-STORAGE: i plugin non scrivono lo storage LessonOS ->
  usare la porta eventi dell'host.

Questo checker avrebbe intercettato i due blocker di isolamento del 23-07
(export .lesson flat, Continuita' su journal flat) a compile-time, senza un test.

Uso:
    python3 bin/convergence/boundary_check.py                    # gate: nuove violazioni -> exit 1
    python3 bin/convergence/boundary_check.py --root DIR         # scansiona un albero alternativo
    python3 bin/convergence/boundary_check.py --update-baseline  # rigenera la baseline (gate umano)
    python3 bin/convergence/boundary_check.py --json             # output machine-readable
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

BASELINE_PATH = "bin/convergence/boundary_baseline.json"
CODE_SUFFIXES = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")
EXCLUDE_SUBSTRINGS = (".test.", ".spec.", "/__tests__/", "/node_modules/", "/dist/")


@dataclass(frozen=True)
class Rule:
    name: str
    description: str
    port: str
    path_globs: tuple[str, ...]
    forbidden: tuple[str, ...]


RULES: tuple[Rule, ...] = (
    Rule(
        name="LESSONOS-NO-READALL",
        description="lettore session-scoped che chiama readAll/readAllEnvelopes",
        port="usare readEnvelopesBySession via la porta ContinuityEventReaderV1 iniettata",
        path_globs=(
            "apps/studio/src/lessonos/continuityLoader.ts",
            "apps/studio/src/lessonos/continuity*.ts",
            "apps/studio/src/design/Continuity*.ts",
            "apps/studio/src/design/Continuity*.tsx",
        ),
        forbidden=(r"\breadAll\s*\(", r"\breadAllEnvelopes\s*\("),
    ),
    Rule(
        name="NO-FLAT-PATH",
        description="path flat globale invece del path room/session-scoped",
        port="usare roomPaths(room).journal / sessionPaths(identity).session",
        path_globs=(
            "apps/studio/src/lessonos/continuity*.ts",
            "apps/studio/src/design/Continuity*.ts",
            "apps/studio/src/design/Continuity*.tsx",
        ),
        forbidden=(
            r"PATHS\.JOURNAL", r"PATHS\.SESSION",
            r'"raw/events\.jsonl"', r'"raw/session\.yaml"',
        ),
    ),
    Rule(
        name="PACK-NO-RUNTIME",
        description="un Pack importa runtime standalone (deve essere solo dati+metodo)",
        port="il runtime vive nel plugin; il Pack contiene dati e metodo",
        path_globs=("packs/**",),
        forbidden=(
            r"['\"]@supabase/", r"['\"]@vercel/analytics", r"['\"]express['\"]",
            r"['\"]blockly['\"]", r"['\"]@ai-sdk/", r"from\s+['\"]ai['\"]",
        ),
    ),
    Rule(
        name="VIEW-NO-DRIVER",
        description="una vista importa un driver di persistenza concreto",
        port="le viste usano WorkspaceStore, non i driver concreti",
        path_globs=("apps/studio/src/design/**",),
        forbidden=(r"store/drivers/fsa", r"store/drivers/localStorage"),
    ),
    Rule(
        name="LESSONOS-SINGLE-WRITER",
        description="una vista costruisce lo store degli eventi o vi scrive",
        port="la storia mutabile ha UN solo scrittore (lessonos/ + toolhost/host.ts); "
             "le viste ricevono una porta di lettura e emettono comandi",
        path_globs=(
            "apps/studio/src/design/**",
            "apps/studio/src/RecapView.tsx",
            "apps/studio/src/ReplayView.tsx",
            "apps/studio/src/SavedLessonsPanel.tsx",
        ),
        forbidden=(
            r"\bcreateEventLogStore\s*\(",
            r"\bnew\s+IndexedDbEventLog\b",
            r"\??\.append(?:Envelope)?\s*\(",
        ),
    ),
    Rule(
        name="PROJECTION-NO-MUTATION",
        description="una proiezione scrive invece di ricostruire",
        port="le proiezioni sono pure: leggono il log append-only e ritornano "
             "una vista ricostruibile; la mutazione appartiene allo scrittore",
        path_globs=("apps/studio/src/lessonos/*Projection.ts",),
        forbidden=(
            r"\??\.append(?:Envelope)?\s*\(",
            r"\bcreateEventLogStore\s*\(",
            r"\bnew\s+IndexedDbEventLog\b",
        ),
    ),
    Rule(
        name="PLUGIN-NO-LESSONOS-STORAGE",
        description="un plugin scrive direttamente lo storage LessonOS",
        port="i plugin usano la porta eventi dell'host, non lo store",
        path_globs=("plugins/**",),
        forbidden=(r"\bcreateEventLogStore\b", r"\bIndexedDbEventLog\b"),
    ),
)


def _excluded(rel: str) -> bool:
    return any(sub in rel for sub in EXCLUDE_SUBSTRINGS)


def _iter_files(root: Path, glob: str):
    # Glob con `**` -> rglob su directory; altrimenti match esatto/prefix.
    if glob.endswith("/**"):
        base = root / glob[:-3]
        if base.is_dir():
            yield from (p for p in base.rglob("*") if p.is_file())
    elif "*" in glob:
        # pattern con wildcard nel nome file: risolvi la dir e filtra col fnmatch
        parent = root / str(Path(glob).parent)
        pat = Path(glob).name
        if parent.is_dir():
            yield from (p for p in parent.iterdir()
                        if p.is_file() and fnmatch.fnmatch(p.name, pat))
    else:
        p = root / glob
        if p.is_file():
            yield p


def scan(root: Path) -> list[dict]:
    violations: list[dict] = []
    for rule in RULES:
        patterns = [re.compile(f) for f in rule.forbidden]
        seen: set[Path] = set()
        for glob in rule.path_globs:
            for path in _iter_files(root, glob):
                if path in seen:
                    continue
                seen.add(path)
                rel = str(path.relative_to(root))
                if _excluded(rel) or path.suffix not in CODE_SUFFIXES:
                    continue
                try:
                    text = path.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    continue
                for lineno, line in enumerate(text.splitlines(), start=1):
                    stripped = line.strip()
                    # ignora commenti di riga per ridurre i falsi positivi
                    if stripped.startswith("//") or stripped.startswith("*"):
                        continue
                    for pat in patterns:
                        if pat.search(line):
                            violations.append({
                                "rule": rule.name,
                                "file": rel,
                                "line": lineno,
                                "pattern": pat.pattern,
                                "port": rule.port,
                            })
    return violations


def _key(v: dict) -> str:
    # Chiave stabile rispetto al drift di riga: regola + file + pattern.
    return f"{v['rule']}|{v['file']}|{v['pattern']}"


def load_baseline(root: Path) -> set[str]:
    p = root / BASELINE_PATH
    if not p.is_file():
        return set()
    data = json.loads(p.read_text())
    return {_key(v) for v in data.get("violations", [])}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA architecture boundary checker")
    parser.add_argument("--root", default=None, help="albero da scansionare (default: repo)")
    parser.add_argument("--update-baseline", action="store_true",
                        help="rigenera la baseline (gate umano)")
    parser.add_argument("--json", action="store_true", help="output JSON")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    violations = scan(root)

    if args.update_baseline:
        out = root / BASELINE_PATH
        out.write_text(json.dumps(
            {"schema_version": 1, "violations": sorted(
                violations, key=_key)}, indent=2, ensure_ascii=False) + "\n")
        print(f"boundary: baseline rigenerata con {len(violations)} voci -> {BASELINE_PATH}")
        return 0

    baseline = load_baseline(root)
    new = [v for v in violations if _key(v) not in baseline]

    if args.json:
        print(json.dumps({"total": len(violations), "baseline": len(baseline),
                          "new": new}, indent=2, ensure_ascii=False))
    if new:
        print(f"boundary: {len(new)} NUOVA/E violazione/i di confine:", file=sys.stderr)
        for v in new:
            print(f"  [{v['rule']}] {v['file']}:{v['line']} — {v['pattern']}", file=sys.stderr)
            print(f"      port: {v['port']}", file=sys.stderr)
        return 1
    print(f"boundary: OK — {len(violations)} violazioni note in baseline, 0 nuove")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
