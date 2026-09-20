#!/usr/bin/env bash
# T8 — GIUNTO CLI: ingerisce un bundle .lesson della lavagna nel motore.
#   .lesson → composition root (segmenti + digest stessa acquisizione →
#   capsule → riepilogo con digest) → grafo. Scrive derived/wiki/<lesson>.md.
# Auto-gate: grounding >20% NULL = FAIL, seg_id 1-indexed.
# Usage: bin/ingest-bundle.sh <file.lesson> <lesson_id>
# Note: richiede DEEPSEEK_API_KEY e un bundle reale; i percorsi derivati
# sotto $HOME sono il contesto operativo del proprietario, non default
# del repository. PDF resta un passo esplicito dopo ispezione (mai qui).
set -euo pipefail
BUNDLE_IN="${1:?uso: ingest-bundle.sh <file.lesson> <lesson_id>}"
LESSON_ID="${2:?lesson_id richiesto}"
# Risolvi rispetto al cwd DEL CHIAMANTE, prima di spostarti (path con spazi OK).
BUNDLE="$(cd "$(dirname "$BUNDLE_IN")" && pwd)/$(basename "$BUNDLE_IN")"
[ -f "$BUNDLE" ] || { echo "ERROR: bundle non trovato: $BUNDLE"; exit 1; }
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"

DB_DIR="${HOME}/maestro-data/teoria-segnali-2021/derived/db"; mkdir -p "$DB_DIR"
DB_PATH="${DB_DIR}/lessonos.db"
WIKI="${HOME}/maestro-data/teoria-segnali-2021/derived/wiki"; mkdir -p "$WIKI"
if [ -f .env ]; then export "$(grep '^DEEPSEEK_API_KEY=' .env)"; fi
[ -n "${DEEPSEEK_API_KEY:-}" ] || { echo "ERROR: DEEPSEEK_API_KEY not set."; exit 1; }
echo "=== T8 INGEST-BUNDLE — $LESSON_ID ==="
echo "Bundle: $BUNDLE"
export BUNDLE LESSON_ID DB_PATH WIKI

uv run python3 -c "
import os, sys, re
from lessonos.compose import compose_lesson_material
from lessonos.graph.writer import GraphWriter
from lessonos.graph.grounding import assert_grounding_threshold, grounding_ratio
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.store.sqlite import SQLiteStore

BUNDLE=os.environ['BUNDLE']; L=os.environ['LESSON_ID']
DB=os.environ['DB_PATH']; WIKI=os.environ['WIKI']
store=SQLiteStore(DB)

# entities
PID='teoria_segnali_2021'; SID='teoria_segnali_source'
if store.get_path(PID) is None:
    store.save_path(Path(path_id=PID, title='Teoria dei Segnali 2021', subject='Teoria dei Segnali', lesson_ids=(L,), source_ids=(SID,)))
if store.get_source(SID) is None:
    store.save_source(Source(source_id=SID, title=f'Lavagna {L}', kind='whiteboard'))
if store.get_lesson(L) is None:
    store.save_lesson(Lesson(lesson_id=L, path_id=PID, title=L, order=99, source_id=SID))

router=Router(); router.register(DeepSeekProvider(model='deepseek-chat'))
material=compose_lesson_material(BUNDLE, L, store=store, router=router,
                                 provider='deepseek', model='deepseek-chat',
                                 output_dir=WIKI)
segments=store.segments_for_lesson(L); capsule=material.capsule
print(f'Segmenti da lavagna: {len(segments)} ({segments[0].seg_id} – {segments[-1].seg_id})')
print(f'Capsule: concepts={len(capsule.content.concepts)} exercises={len(capsule.content.exercises)} dropped={len(capsule.dropped)}')
print(f'Digest: {\"assente\" if material.digest is None else f\"errori={len(material.digest.errors)} concetti={len(material.digest.concepts)}\"}')

# grounding gate
all_ex=[cite.excerpt for grp in (capsule.content.concepts, capsule.content.exercises, capsule.content.student_questions, capsule.content.homework) for item in grp for cite in item.citations]
total,nullc,ratio=grounding_ratio(all_ex)
print(f'Grounding: {nullc}/{total} unverified ({ratio:.0%})')
assert_grounding_threshold(all_ex, L)

# graph
w=GraphWriter(store); edges=w.write_capsule_graph(capsule)
print(f'Grafo: {len(store.get_graph_nodes_for_lesson(L))} nodi, {edges} archi, {len(store.get_all_evidence_for_lesson(L))} evidenze')

# summary (dalla composition root: include gia' il digest stessa acquisizione)
pack=material.pack
txt=pack.files.get(f'{L}.md','')
if re.findall(rf'{L}#s0\b', txt): print('  ❌ summary 0-indexed'); sys.exit(1)
print(f'Riepilogo: {len(txt)} byte 1-indexed -> {WIKI}/{L}.md')
print('=== GIUNTO OK: lavagna .lesson -> segmenti -> capsule -> grafo -> riepilogo grounded ===')
" 2>&1
