#!/usr/bin/env bash
# M1-1c — Risoluzione concetti GLOBALE per-docente su dati REALI.
#
# Esegue la pass di risoluzione (DeepSeek) per un docente, scrive il mapping
# in derived/global_resolution/<teacher>.json, riaggrega (ZERO-LLM) e
# rigenera il TeacherBook. Stampa il report: ricorrenza cross-lezione
# prima/dopo, lista COMPLETA dei merge, dropped, costo.
#
# Uso:
#   bin/run_global_resolution.sh [teacher_id]
#
# Env:
#   DB_PATH      (default: ~/maestro-data/teoria-segnali-2021/derived/db/lessonos.db)
#   DERIVED_DIR  (default: ~/maestro-data/teoria-segnali-2021/derived)
#   DEEPSEEK_API_KEY  da env o .env nella root del repo.
set -euo pipefail

cd "$(dirname "$0")/.."

TEACHER_ID="${1:-andrea}"
DB_PATH="${DB_PATH:-${HOME}/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
DERIVED_DIR="${DERIVED_DIR:-${HOME}/maestro-data/teoria-segnali-2021/derived}"

if [[ ! -f "$DB_PATH" ]]; then
  echo "ERRORE: DB non trovato: $DB_PATH" >&2
  exit 1
fi

if [[ -z "${DEEPSEEK_API_KEY:-}" && -f .env ]]; then
  DEEPSEEK_API_KEY="$(grep -E '^DEEPSEEK_API_KEY=' .env | head -1 | cut -d= -f2- | tr -d '"' || true)"
  export DEEPSEEK_API_KEY
fi

export TEACHER_ID DB_PATH DERIVED_DIR

uv run python3 - <<'PYEOF'
import json
import os
from dataclasses import asdict
from pathlib import Path

from lessonos.graph.aggregator import aggregate_teacher_graph
from lessonos.graph.resolution import (
    resolve_concepts_globally,
    save_resolution,
)
from lessonos.llm.deepseek import DeepSeekProvider, estimate_deepseek_api_cost
from lessonos.llm.router import Router
from lessonos.store import SQLiteStore
from lessonos.teacher_book import build_teacher_book

teacher_id = os.environ["TEACHER_ID"]
db_path = os.environ["DB_PATH"]
derived = Path(os.environ["DERIVED_DIR"])

store = SQLiteStore(db_path)


def recurrence(graph):
    multi = [n for n in graph.merged_nodes if len(n.lesson_ids) > 1]
    return multi, len(graph.merged_nodes)


# --- baseline (senza mapping) ------------------------------------------
before = aggregate_teacher_graph(store, teacher_id)
multi_before, total_before = recurrence(before)
print(f"=== BASELINE (senza risoluzione) — docente {teacher_id} ===")
print(f"concetti aggregati: {total_before}")
print(f"ricorrenza cross-lezione: {len(multi_before)}/{total_before}")
for n in multi_before:
    print(f"  - {n.label!r} in {list(n.lesson_ids)}")

# --- pass di risoluzione (LLM, una chiamata) ---------------------------
# temperatura 0: la risoluzione è una classificazione, serve riproducibilità
router = Router()
router.register(DeepSeekProvider(temperature=0.0))
resolution = resolve_concepts_globally(
    store, teacher_id, router, provider="deepseek"
)

out_path = derived / "global_resolution" / f"{teacher_id}.json"
save_resolution(resolution, out_path)
print(f"\n=== RISOLUZIONE ({resolution.provider}/{resolution.model}) ===")
print(f"mapping scritto: {out_path}")
merged = resolution.merged_entries()
print(f"entries totali: {len(resolution.entries)} — gruppi multi-alias: {len(merged)}")
print("\nLISTA COMPLETA DEI MERGE (per spot-check):")
for e in sorted(merged, key=lambda e: (-len(e.aliases), e.canonical)):
    print(f"  * {e.canonical!r} <- {len(e.aliases)} menzioni in {e.lesson_count} lezioni")
    for a in e.aliases:
        print(f"      - [{a.lesson_id}] {a.original_name!r} (canonical-lezione: {a.original_canonical!r})")
if resolution.dropped:
    print("\nDROPPED (membri rifiutati dal validatore):")
    for d in resolution.dropped:
        print(f"  ! {d}")
else:
    print("\nDROPPED: nessuno")
if resolution.usage:
    cost = estimate_deepseek_api_cost(resolution.usage, model=resolution.model)
    print(f"\nusage: {resolution.usage} — costo stimato: ${cost:.6f}")

# --- riaggregazione (ZERO-LLM) con il mapping --------------------------
after = aggregate_teacher_graph(store, teacher_id, resolution=resolution)
multi_after, total_after = recurrence(after)
print(f"\n=== DOPO (con risoluzione, aggregazione ZERO-LLM) ===")
print(f"concetti aggregati: {total_after}")
print(f"ricorrenza cross-lezione: {len(multi_after)}/{total_after}")
for n in sorted(multi_after, key=lambda n: (-len(n.lesson_ids), n.dedup_key)):
    print(f"  - {n.dedup_key!r} ({n.label!r}) in {list(n.lesson_ids)} status={n.status}")

# --- TeacherBook rigenerato --------------------------------------------
book = build_teacher_book(store, teacher_id, resolution=resolution)
book_path = derived / "teacher_book" / f"{teacher_id}.json"
book_path.parent.mkdir(parents=True, exist_ok=True)
book_path.write_text(
    json.dumps(asdict(book), ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
multi_prog = [p for p in book.progression if len(p.lesson_sequence) > 1]
print(f"\n=== TEACHER BOOK rigenerato: {book_path} ===")
print(f"concetti: {book.total_concepts}  lezioni: {book.total_lessons}  "
      f"edge: {book.total_edges}  evidenze: {book.total_evidence}")
print(f"progression entries: {len(book.progression)} — multi-lezione: {len(multi_prog)}")
for p in multi_prog:
    print(f"  - {p.canonical!r}: {list(p.status_sequence)} in {list(p.lesson_sequence)}")
print(f"prerequisite chains: {len(book.prerequisites)}")
for c in book.prerequisites:
    print(f"  - {c.concept!r} <- {list(c.prerequisites)}")

store.close()
PYEOF
