#!/usr/bin/env bash
# ===========================================================================
# T6R — FULL per-lesson runner (generalises run_prima_lezione_full.sh).
# One command per lesson: ingest ALL segments → capsule (windowed, DeepSeek
# LIVE) → graph → summary → self-gates on grounding (>20% NULL = FAIL) and
# 1-indexed seg_ids. Writes capsule+graph to the persistent DB and the summary
# to derived/wiki/<lesson>.md.
#
# Usage:
#   bin/run_lesson_full.sh seconda_lezione            # FULL coverage (all segments)
#   bin/run_lesson_full.sh terza_lezione --max-segments 500
# ===========================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"

LESSON_ID="${1:-}"
if [ -z "$LESSON_ID" ]; then
  echo "Usage: $0 <lesson_id> [--max-segments N]"
  echo "  lesson_id: prima_lezione | seconda_lezione | terza_lezione | quarta_lezione"
  exit 1
fi
shift || true

MAX_SEGMENTS=""   # empty = FULL (all segments)
while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-segments) MAX_SEGMENTS="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

case "$LESSON_ID" in
  prima_lezione)   BASENAME="Prima_lezione_teoria_dei_segnali";   ORDER=1; TITLE="Prima lezione — Teoria dei Segnali" ;;
  seconda_lezione) BASENAME="Seconda_lezione_teoria_dei_segnali"; ORDER=2; TITLE="Seconda lezione — Teoria dei Segnali" ;;
  terza_lezione)   BASENAME="Terza_lezione_teoria_dei_segnali";   ORDER=3; TITLE="Terza lezione — Teoria dei Segnali" ;;
  quarta_lezione)  BASENAME="Quarta_lezione_teoria_dei_segnali";  ORDER=4; TITLE="Quarta lezione — Teoria dei Segnali" ;;
  *) echo "ERROR: unknown lesson_id '$LESSON_ID'"; exit 1 ;;
esac

PATH_ID="teoria_segnali_2021"
SOURCE_ID="teoria_segnali_source"
TRANSCRIPT="${HOME}/maestro-data/teoria-segnali-2021/derived/asr/${BASENAME}.speech.segment.jsonl"
# DB_PATH/WIKI_DIR/MIN_CHARS overridable via env (A/B su DB separato senza
# toccare il deliverable corrente). MIN_CHARS>0 = coalescing anti-coriandoli.
DB_PATH="${DB_PATH:-${HOME}/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
mkdir -p "$(dirname "$DB_PATH")"
WIKI_DIR="${WIKI_DIR:-${HOME}/maestro-data/teoria-segnali-2021/derived/wiki}"; mkdir -p "$WIKI_DIR"
MIN_CHARS="${MIN_CHARS:-0}"

[ -f "$TRANSCRIPT" ] || { echo "ERROR: transcript not found: $TRANSCRIPT"; exit 1; }
LINE_COUNT=$(wc -l < "$TRANSCRIPT" | tr -d ' ')
[ -n "$MAX_SEGMENTS" ] || MAX_SEGMENTS="$LINE_COUNT"   # default FULL

echo "=== T6R FULL — $LESSON_ID ==="
echo "Transcript:     $TRANSCRIPT ($LINE_COUNT segments)"
echo "Ingesting:      $MAX_SEGMENTS segments"
echo "DB:             $DB_PATH"
echo ""

if [ -f .env ]; then export "$(grep '^DEEPSEEK_API_KEY=' .env)"; fi
[ -n "${DEEPSEEK_API_KEY:-}" ] || { echo "ERROR: DEEPSEEK_API_KEY not set."; exit 1; }
echo "DeepSeek key: ${DEEPSEEK_API_KEY:0:8}... (present)"
echo ""

export LESSON_ID PATH_ID SOURCE_ID TRANSCRIPT MAX_SEGMENTS ORDER DB_PATH WIKI_DIR TITLE MIN_CHARS

uv run python3 -c "
import os, sys, re
from lessonos.asr.adapter import ingest_asr_jsonl
from lessonos.capsule.assembly import assemble_lesson_capsule, load_capsule
from lessonos.graph.writer import GraphWriter
from lessonos.graph.grounding import assert_grounding_threshold, grounding_ratio
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import generate_lesson_summary

LESSON_ID = os.environ['LESSON_ID']; PATH_ID = os.environ['PATH_ID']
SOURCE_ID = os.environ['SOURCE_ID']; TRANSCRIPT = os.environ['TRANSCRIPT']
MAX_SEG = int(os.environ['MAX_SEGMENTS']); ORDER = int(os.environ['ORDER'])
DB_PATH = os.environ['DB_PATH']; WIKI_DIR = os.environ['WIKI_DIR']; TITLE = os.environ['TITLE']

store = SQLiteStore(DB_PATH)

# Step 1: ingest. save_segment is INSERT OR REPLACE (upsert by seg_id); the
# macinata only grows coverage (100 -> full), so upsert overwrites #s1..#sK and
# adds the rest with no stale rows. The graph is rebuilt clean by GraphWriter
# (delete_graph_for_lesson) and the capsule is overwritten (save=True).
old = store.segments_for_lesson(LESSON_ID)
if old:
    print(f'Re-ingesting over {len(old)} existing segments (upsert by seg_id)...')
MIN_CHARS = int(os.environ.get('MIN_CHARS', '0'))
if MIN_CHARS:
    print(f'Coalescing attivo: min_chars={MIN_CHARS}')
segments = ingest_asr_jsonl(store, TRANSCRIPT, LESSON_ID, max_segments=MAX_SEG, min_chars=MIN_CHARS)
print(f'Ingested {len(segments)} segments ({segments[0].seg_id} – {segments[-1].seg_id})')
assert segments[0].seg_id == f'{LESSON_ID}#s1', f'CONTRACT: first seg_id {segments[0].seg_id} != {LESSON_ID}#s1'

# Step 2: entities + router
if store.get_path(PATH_ID) is None:
    store.save_path(Path(path_id=PATH_ID, title='Teoria dei Segnali 2021', subject='Teoria dei Segnali', lesson_ids=(LESSON_ID,), source_ids=(SOURCE_ID,)))
if store.get_source(SOURCE_ID) is None:
    store.save_source(Source(source_id=SOURCE_ID, title=f'Trascrizione {LESSON_ID}', kind='asr'))
if store.get_lesson(LESSON_ID) is None:
    store.save_lesson(Lesson(lesson_id=LESSON_ID, path_id=PATH_ID, title=TITLE, order=ORDER, source_id=SOURCE_ID))
router = Router(); router.register(DeepSeekProvider(model='deepseek-chat'))

# Step 3: capsule (windowed)
print('Assembling capsule (windowed, DeepSeek LIVE)...')
capsule = assemble_lesson_capsule(store, LESSON_ID, router, provider='deepseek', model='deepseek-chat', defensive=True, save=True)
print(f'  concepts={len(capsule.content.concepts)} exercises={len(capsule.content.exercises)} '
      f'questions={len(capsule.content.student_questions)} homework={len(capsule.content.homework)} dropped={len(capsule.dropped)}')

# Step 3b: GROUNDING GATE on the capsule (the anti-falso-verde policy)
all_ex = []
for grp in (capsule.content.concepts, capsule.content.exercises, capsule.content.student_questions, capsule.content.homework):
    for item in grp:
        for cite in item.citations:
            all_ex.append(cite.excerpt)
total, nullc, ratio = grounding_ratio(all_ex)
print(f'  grounding: {nullc}/{total} unverified ({ratio:.0%})')
assert_grounding_threshold(all_ex, LESSON_ID)  # raises if >20% NULL

# Step 4: graph
writer = GraphWriter(store); edges = writer.write_capsule_graph(capsule)
print(f'  graph: {len(store.get_graph_nodes_for_lesson(LESSON_ID))} nodes, {edges} edges, '
      f'{len(store.get_all_evidence_for_lesson(LESSON_ID))} evidences')

# Step 5: summary
pack = generate_lesson_summary(store, capsule, router, output_dir=WIKI_DIR, provider='deepseek', model='deepseek-chat')
summary_text = pack.files.get(f'{LESSON_ID}.md', '')
print(f'  summary: {len(summary_text)} bytes -> {WIKI_DIR}/{LESSON_ID}.md')

# Step 6: 1-indexed contract on the summary
if re.findall(rf'{LESSON_ID}#s0\b', summary_text):
    print('  ❌ summary contains 0-indexed citation'); sys.exit(1)
print('  ✅ summary 1-indexed, grounding gate PASS')

# Step 7: cost ledger
est = round((MAX_SEG * 20 * 3 * 0.14) / 1_000_000 + (500 * 3 * 0.28) / 1_000_000, 6)
store.save_ledger_entry(CostLedgerEntry(entry_id=f't6r-full-{LESSON_ID}', lesson_id=LESSON_ID, model='deepseek-chat', provider='deepseek', prompt_tokens=0, completion_tokens=0, cost_usd=est, label=f'T6R full {LESSON_ID} ({MAX_SEG} seg)'))
print(f'  est cost: \${est}')
print(f'=== {LESSON_ID} FULL COMPLETE ===')
" 2>&1
