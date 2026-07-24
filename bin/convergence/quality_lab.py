#!/usr/bin/env python3
"""ARDESIA Convergence — Quality Lab limitato (Action 9).

Misura **modello + harness + ambiente** su compiti derivati da fallimenti reali,
senza dare a un agente autorita' sulla semantica del prodotto.

Le due regole che portano il peso:

1. **Nessun task senza controllo negativo osservato rosso.** Un task il cui
   grader non e' mai stato visto respingere il difetto bersaglio non misura
   nulla: e' teatro con un numero attaccato.
2. **Il candidato non puo' toccare il proprio giudice.** `allowed_paths` non
   puo' intersecare i percorsi protetti (gate, workflow, ADR). Un trial che
   modifica l'evaluator e' invalido, non «riuscito».

Il resto sono corollari: classi vietate, diff fuori scope, guardrail regrediti,
esiti non-successo di prima classe (`NOT_RUN`, `BLOCKED`, `NOOP`, `REVERTED`,
`UNAVAILABLE`).

Questo script **non esegue** i task e non chiama modelli: valida il registro dei
task e i risultati dichiarati. Eseguire trial e' un gate umano (budget, tool).

Uso:
    python3 bin/convergence/quality_lab.py                       # valida il registro
    python3 bin/convergence/quality_lab.py --results results.json
    python3 bin/convergence/test_quality_lab.py
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

TASKS_PATH = "bin/convergence/quality_lab_tasks.json"

REQUIRED_TASK_FIELDS = ("id", "title", "class", "derived_from", "grader",
                        "negative_control", "observed_red")

VALID_OUTCOMES = ("PASS", "FAIL", "NOT_RUN", "BLOCKED", "NOOP", "REVERTED",
                  "UNAVAILABLE")

REQUIRED_RESULT_FIELDS = ("task_id", "outcome", "base_sha", "changed_paths",
                          "guardrails")


def load_tasks(root: Path) -> dict:
    return json.loads((root / TASKS_PATH).read_text(encoding="utf-8"))


def validate_registry(registry: dict) -> list[str]:
    problems: list[str] = []
    forbidden = set(registry.get("forbidden_classes", []))
    protected = tuple(registry.get("protected_paths", []))
    if not protected:
        problems.append("registro: nessun percorso protetto — il candidato "
                        "potrebbe modificare il proprio giudice")

    seen: set[str] = set()
    tasks = registry.get("tasks", [])
    if not tasks:
        problems.append("registro: nessun task")

    for task in tasks:
        tid = task.get("id", "<senza id>")
        for field in REQUIRED_TASK_FIELDS:
            if field not in task:
                problems.append(f"{tid}: campo obbligatorio assente: {field}")
        if any(f not in task for f in REQUIRED_TASK_FIELDS):
            continue

        if tid in seen:
            problems.append(f"{tid}: id duplicato")
        seen.add(tid)

        if task["class"] in forbidden:
            problems.append(
                f"{tid}: classe '{task['class']}' e' vietata al lavoro autonomo")
        if not str(task["negative_control"]).strip():
            problems.append(f"{tid}: controllo negativo vuoto")
        if task["observed_red"] is not True:
            problems.append(
                f"{tid}: il controllo negativo non e' mai stato osservato rosso; "
                "un grader mai visto respingere il difetto non misura nulla")
        if not str(task["derived_from"]).strip():
            problems.append(
                f"{tid}: nessun fallimento reale di provenienza (derived_from vuoto)")

        for path in task.get("allowed_paths", []):
            for guard in protected:
                if path.startswith(guard) or guard.startswith(path):
                    problems.append(
                        f"{tid}: allowed_paths tocca il percorso protetto "
                        f"'{guard}': il candidato non puo' modificare il "
                        "proprio evaluator")

    return problems


def validate_results(results: list[dict], registry: dict) -> list[str]:
    problems: list[str] = []
    known = {t["id"] for t in registry.get("tasks", []) if "id" in t}
    by_id = {t["id"]: t for t in registry.get("tasks", []) if "id" in t}
    protected = tuple(registry.get("protected_paths", []))

    for i, result in enumerate(results):
        where = f"result[{result.get('task_id', i)}]"
        for field in REQUIRED_RESULT_FIELDS:
            if field not in result:
                problems.append(f"{where}: campo obbligatorio assente: {field}")
        if any(f not in result for f in REQUIRED_RESULT_FIELDS):
            continue

        tid = result["task_id"]
        if tid not in known:
            problems.append(f"{where}: task sconosciuto")
            continue

        if result["outcome"] not in VALID_OUTCOMES:
            problems.append(
                f"{where}: esito '{result['outcome']}' fuori da {VALID_OUTCOMES}")

        allowed = tuple(by_id[tid].get("allowed_paths", []))
        for path in result["changed_paths"]:
            if any(path.startswith(guard) for guard in protected):
                problems.append(
                    f"{where}: ha modificato '{path}', percorso protetto: il "
                    "trial e' invalido, non riuscito")
            elif allowed and not any(path.startswith(a) for a in allowed):
                problems.append(
                    f"{where}: '{path}' e' fuori dagli allowed_paths del task")

        # Una metrica primaria migliorata con un guardrail regredito e' un
        # peggioramento travestito: si rifiuta.
        regressed = [name for name, ok in (result["guardrails"] or {}).items()
                     if ok is False]
        if regressed and result["outcome"] == "PASS":
            problems.append(
                f"{where}: PASS con guardrail regrediti {sorted(regressed)}")

    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ARDESIA bounded quality lab")
    parser.add_argument("--root", default=None)
    parser.add_argument("--results", default=None)
    args = parser.parse_args(argv)

    root = Path(args.root).resolve() if args.root else Path(
        __file__).resolve().parents[2]
    registry = load_tasks(root)

    problems = validate_registry(registry)
    if args.results:
        results = json.loads(Path(args.results).read_text(encoding="utf-8"))
        problems += validate_results(results, registry)

    if problems:
        print("quality-lab: NON valido:", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        return 1
    print(f"quality-lab: OK — {len(registry['tasks'])} task, tutti derivati da "
          "fallimenti osservati e con controllo negativo visto rosso")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
