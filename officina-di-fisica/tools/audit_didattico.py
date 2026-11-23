#!/usr/bin/env python3
"""Audit editoriale ripetibile della banca Officina.

L'audit identifica PRIORITÀ DI REVISIONE. Non valuta automaticamente la
correttezza scientifica, la leggibilità pedagogica o la frequenza in esame.
"""

import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
MATRIX = ROOT / "docs" / "inventario-copertura.csv"


def audit():
    findings = []
    courses = {}
    all_rows = []

    for course in ("C1", "C2", "C3", "C4", "C5", "C6"):
        src = json.loads((CONTENT / f"{course}.json").read_text(encoding="utf-8"))
        rows = src if isinstance(src, list) else src["records"]
        kinds = Counter(row["kind"] for row in rows)
        shallow = 0
        very_short = 0
        without_figures = 0
        without_formulas = 0
        for row in rows:
            if row["kind"] not in ("question", "example", "lesson"):
                continue
            all_rows.append(row)
            if row["kind"] != "question":
                continue
            blocks = row.get("blocks", [])
            words = " ".join(b.get("text", "") for b in blocks if b.get("type") == "text")
            prose = len(words)
            figure_in_solution = any(b.get("type") == "figure" for b in blocks)
            formula_in_solution = any(b.get("type") == "formula" for b in blocks)
            if prose < 100:
                shallow += 1
            if len(blocks) < 3:
                very_short += 1
            if not figure_in_solution:
                without_figures += 1
            if not formula_in_solution:
                without_formulas += 1
            # Criticità osservabili; la priorità non è un verdetto scientifico.
            if prose < 100 or len(blocks) < 3:
                findings.append({
                    "course": course,
                    "id": row["id"],
                    "title": row["title"],
                    "skill": row.get("skill", ""),
                    "prose_chars": prose,
                    "block_count": len(blocks),
                    "has_solution_figure": figure_in_solution,
                    "has_solution_formula": formula_in_solution,
                    "prompt": row.get("prompt", ""),
                })
        courses[course] = {
            "lessons": kinds["lesson"],
            "examples": kinds["example"],
            "questions": kinds["question"],
            "questions_under_100_prose_chars": shallow,
            "questions_under_3_blocks": very_short,
            "questions_without_solution_figure": without_figures,
            "questions_without_solution_formula": without_formulas,
        }

    with MATRIX.open(encoding="utf-8-sig", newline="") as handle:
        matrix = list(csv.DictReader(handle))
    unit_counts = defaultdict(lambda: {
        "objectives": 0, "missing_lesson_link": 0,
        "missing_example_link": 0, "missing_question_link": 0,
        "not_sampled_in_exam_simulations": 0,
    })
    for obj in matrix:
        row = unit_counts[obj["unità_MUR"]]
        row["objectives"] += 1
        if not obj["lezioni"]:
            row["missing_lesson_link"] += 1
        if not obj["esempi_guidati_autonomi"]:
            row["missing_example_link"] += 1
        if not obj["quesiti_pertinenti"]:
            row["missing_question_link"] += 1
        if not obj["quesiti_specifici_delle_simulazioni"]:
            row["not_sampled_in_exam_simulations"] += 1

    return {
        "about": "Audit automatico editoriale, non revisione scientifica umana",
        "courses": courses,
        "total_objectives_in_matrix": len(matrix),
        "units": dict(sorted(unit_counts.items())),
        "review_queue": sorted(findings, key=lambda r: (
            r["course"] == "C6",
            r["prose_chars"],
            r["block_count"],
            r["course"],
            r["id"],
        )),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Emetti tutto in JSON")
    args = parser.parse_args()
    result = audit()
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print("OFFICINA · Audit didattico (soglie indicative, nessun giudizio di correttezza)")
    print("Modulo | Lezioni | Esempi | Quesiti | Soluzioni con prosa <100 car. | Soluzioni con <3 blocchi")
    for code, data in result["courses"].items():
        print(f"{code} | {data['lessons']} | {data['examples']} | {data['questions']} | "
              f"{data['questions_under_100_prose_chars']} | {data['questions_under_3_blocks']}")
    print(f"\nObiettivi nella matrice MUR: {result['total_objectives_in_matrix']}")
    for unit, row in result["units"].items():
        print(f"{unit}: {row['objectives']} obiettivi, "
              f"collegamenti lezione mancanti {row['missing_lesson_link']}, "
              f"esempi mancanti {row['missing_example_link']}, "
              f"quesiti mancanti {row['missing_question_link']}, "
              f"non campionati nei tre fascicoli C6 {row['not_sampled_in_exam_simulations']}")
    print(f"\nSchede da sottoporre a revisione prioritaria: {len(result['review_queue'])}")
    print("Nota: poche parole o poche figure non provano un errore. La revisione richiede un docente.")


if __name__ == "__main__":
    main()
