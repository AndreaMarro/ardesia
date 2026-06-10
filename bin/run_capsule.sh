#!/usr/bin/env bash
# ===========================================================================
# T6-COMPLETAMENTO — Assemble Lesson Capsule for any lecture + write graph
#
# Usage:
#   ./bin/run_capsule.sh seconda_lezione        # default: 100 segments
#   ./bin/run_capsule.sh seconda_lezione --max-segments 200
#   ./bin/run_capsule.sh seconda_lezione --check-only
#
# Capsule is saved to DB + graph written via GraphWriter (T5).
# Summary is NOT generated here — that's a separate step.
# ===========================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"

LESSON_ID="${1:-}"
if [ -z "$LESSON_ID" ]; then
  echo "Usage: $0 <lesson_id> [--max-segments N] [--check-only]"
  echo "  lesson_id: e.g. seconda_lezione, terza_lezione, quarta_lezione"
  exit 1
fi
shift || true

MAX_SEGMENTS=100
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-segments) MAX_SEGMENTS="$2"; shift 2 ;;
    --check-only)   CHECK_ONLY=1; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Map lesson_id → ASR transcript basename (bash 3 compat)
case "$LESSON_ID" in
  prima_lezione)   BASENAME="Prima_lezione_teoria_dei_segnali" ;;
  seconda_lezione) BASENAME="Seconda_lezione_teoria_dei_segnali" ;;
  terza_lezione)   BASENAME="Terza_lezione_teoria_dei_segnali" ;;
  quarta_lezione)  BASENAME="Quarta_lezione_teoria_dei_segnali" ;;
  *)
    echo "ERROR: unknown lesson_id '$LESSON_ID'. Valid: prima_lezione, seconda_lezione, terza_lezione, quarta_lezione"
    exit 1
    ;;
esac

TRANSCRIPT="${HOME}/maestro-data/teoria-segnali-2021/derived/asr/${BASENAME}.speech.segment.jsonl"
PATH_ID="teoria_segnali_2021"
SOURCE_ID="teoria_segnali_source"

# Determine order
case "$LESSON_ID" in
  prima_lezione)   ORDER=1 ;;
  seconda_lezione) ORDER=2 ;;
  terza_lezione)   ORDER=3 ;;
  quarta_lezione)  ORDER=4 ;;
esac

# Pre-flight checks
if [ ! -f "$TRANSCRIPT" ]; then
  echo "ERROR: transcript not found at:"
  echo "  $TRANSCRIPT"
  echo "Has this lecture been transcribed via T4a?"
  exit 1
fi

LINE_COUNT=$(wc -l < "$TRANSCRIPT")
echo "=== T6 — CAPSULE ASSEMBLY ==="
echo "Lesson:         $LESSON_ID"
echo "Transcript:     $TRANSCRIPT"
echo "Total segments: $LINE_COUNT"
echo "Max to ingest:  $MAX_SEGMENTS"
echo ""

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo "Transcript exists and has $LINE_COUNT segments. OK."
  echo "Sample (line 1):"
  head -1 "$TRANSCRIPT"
  exit 0
fi

# Retrieve DeepSeek key from .env
if [ -f .env ]; then
  # Safe export: only lines matching DEEPSEEK_API_KEY=, no shell injection
  export "$(grep '^DEEPSEEK_API_KEY=' .env)"
fi
if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "ERROR: DEEPSEEK_API_KEY not set. Run with it set or in .env."
  exit 1
fi
echo "DeepSeek API key: ${DEEPSEEK_API_KEY:0:8}... (present)"

# Persistent DB in derived/ (NOT in-memory — COORDINATION.md:24 ordina 'SALVALE nel DB')
DB_DIR="${HOME}/maestro-data/teoria-segnali-2021/derived/db"
mkdir -p "$DB_DIR"
DB_PATH="${DB_DIR}/lessonos.db"
echo "DB path: $DB_PATH"

# Export vars for Python subprocess (avoids shell interpolation in inline Python)
MAX_SEG="${MAX_SEGMENTS:-100}"
export LESSON_ID PATH_ID SOURCE_ID TRANSCRIPT MAX_SEG ORDER DB_PATH

# Run the Python pipeline
uv run python3 -c "
import os
from lessonos.asr.adapter import ingest_asr_jsonl
from lessonos.capsule.assembly import assemble_lesson_capsule, load_capsule
from lessonos.graph.writer import write_capsule_graph, GraphWriter
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.sqlite import SQLiteStore

LESSON_ID = os.environ['LESSON_ID']
PATH_ID = os.environ['PATH_ID']
SOURCE_ID = os.environ['SOURCE_ID']
TRANSCRIPT = os.environ['TRANSCRIPT']
MAX_SEG = int(os.environ['MAX_SEG'])
ORDER = int(os.environ['ORDER'])
DB_PATH = os.environ['DB_PATH']

# -- Setup store + domain entities --
print('Creating store (persistent)...')
store = SQLiteStore(DB_PATH)

# Path
path = Path(
    path_id=PATH_ID,
    title='Teoria dei Segnali 2021',
    subject='Teoria dei Segnali',
    lesson_ids=(LESSON_ID,),
    source_ids=(SOURCE_ID,),
)
store.save_path(path)

# Source
source = Source(source_id=SOURCE_ID, title=f'Trascrizione {LESSON_ID}', kind='asr')
store.save_source(source)

# Lesson
lesson_title_map = {
    'prima_lezione': 'Prima lezione — Teoria dei Segnali',
    'seconda_lezione': 'Seconda lezione — Teoria dei Segnali',
    'terza_lezione': 'Terza lezione — Teoria dei Segnali',
    'quarta_lezione': 'Quarta lezione — Teoria dei Segnali',
}
lesson = Lesson(
    lesson_id=LESSON_ID,
    path_id=PATH_ID,
    title=lesson_title_map.get(LESSON_ID, LESSON_ID),
    order=ORDER,
    source_id=SOURCE_ID,
)
store.save_lesson(lesson)

# -- Ingest ASR segments --
print(f'Ingesting up to {MAX_SEG} segments...')
segments = ingest_asr_jsonl(store, TRANSCRIPT, LESSON_ID, max_segments=MAX_SEG)
seg_count = len(segments)
last_seg = segments[-1]
print(f'  Ingested {seg_count} segments')
print(f'  Range: {segments[0].start}s — {last_seg.end}s')
print(f'  First segment: [{segments[0].seg_id}] {segments[0].text[:100]}...')
print(f'  Last segment:  [{last_seg.seg_id}] {last_seg.text[:100]}...')

# -- Build router with DeepSeek provider --
print('Setting up DeepSeek provider...')
router = Router()
provider = DeepSeekProvider(model='deepseek-chat')
router.register(provider)
print(f'  Provider registered: {provider.name} ({provider._model})')

# -- Assemble capsule (defensive mode for real noisy transcript) --
print('Assembling lesson capsule with DeepSeek LIVE...')
capsule = assemble_lesson_capsule(
    store, LESSON_ID, router,
    provider='deepseek',
    model='deepseek-chat',
    defensive=True,
    save=True,
)
print(f'  Capsule assembled: lesson_id={capsule.lesson_id}, dropped={len(capsule.dropped)}')

# -- Report capsule contents --
print()
print('=== CAPSULE RESULT ===')
if capsule.dropped:
    for d in capsule.dropped[:5]:
        print(f'  DROPPED: {d}')

print()
print('Timeline (topics):')
for span in capsule.timeline:
    print(f'  [{span.start}s–{span.end}s] {span.topic} ({len(span.seg_ids)} segs)')

print()
print('Concepts:')
for c in capsule.content.concepts:
    print(f'  [{c.status}] {c.name}')
    for cite in c.citations[:2]:
        print(f'    → seg_id={cite.seg_id} excerpt={cite.excerpt!r} (repaired={cite.excerpt_repaired})')

print()
print('Exercises:')
for ex in capsule.content.exercises:
    print(f'  prompt={ex.prompt[:120]}...')
    for cite in ex.citations[:2]:
        print(f'    → seg_id={cite.seg_id} excerpt={cite.excerpt!r}')

print()
print('Student questions:')
for q in capsule.content.student_questions:
    print(f'  {q.question[:120]}...')

print()
print('Homework:')
for h in capsule.content.homework:
    print(f'  {h.task[:120]}...')

# -- Write graph via GraphWriter (exercises T5 on real data) --
print()
print('=== WRITING GRAPH (GraphWriter) ===')
writer = GraphWriter(store)
edges_written = writer.write_capsule_graph(capsule)
print(f'  Edges written: {edges_written}')

# Verify graph was written
nodes = store.get_graph_nodes_for_lesson(LESSON_ID)
all_edges = store.get_graph_edges_for_lesson(LESSON_ID)
evidences = store.get_all_evidence_for_lesson(LESSON_ID)
print(f'  Nodes: {len(nodes)}')
print(f'  Edges: {len(all_edges)}')
print(f'  Evidences: {len(evidences)}')

# -- Verify 2+ citations with resolved seg_ids --
print()
print('=== ACCEPTANCE: 2+ CITATIONS VERIFIED ===')
real_cites = []
for c in capsule.content.concepts:
    for cite in c.citations:
        real_cites.append((c.name, cite))
for ex in capsule.content.exercises:
    if len(real_cites) >= 2:
        break
    for cite in ex.citations:
        real_cites.append(('exercise', cite))

assert len(real_cites) >= 2, f'acceptance failed: only {len(real_cites)} citations'

for i, (ctx, cite) in enumerate(real_cites[:2], 1):
    seg = store.get_segment(cite.seg_id)
    assert seg is not None, f'citation seg_id={cite.seg_id} does not resolve in store'
    if cite.excerpt is not None:
        assert cite.excerpt in seg.text, (
            f'citation excerpt {cite.excerpt!r} not found in seg.text {seg.text!r}'
        )
    print(f'{i}. {ctx} → seg_id={cite.seg_id}')
    print(f'   Excerpt: {cite.excerpt!r}')
    print(f'   Source segment: {seg.text!r}')
    print(f'   Position: {seg.start}s–{seg.end}s')
    print()

# -- Log cost — estimate from DeepSeek pricing --
# (actual usage not propagated from capsule assembly internals)
est_cost_input = (MAX_SEG * 20 * 2 * 0.14) / 1_000_000
est_cost_output = (500 * 2 * 0.28) / 1_000_000
est_total = round(est_cost_input + est_cost_output, 6)
entry = CostLedgerEntry(
    entry_id='t6-capsule-' + LESSON_ID,
    lesson_id=LESSON_ID,
    model='deepseek-chat',
    provider='deepseek',
    prompt_tokens=0,
    completion_tokens=0,
    cost_usd=est_total,
    label=f'T6 capsule {LESSON_ID} ({MAX_SEG} segments, deepseek-chat) — estimated \${est_total}',
)
store.save_ledger_entry(entry)
print(f'Estimated cost: \${est_total} (ledger: prompt_tokens=0 per review directive — no real usage captured)')
print()
print('=== T6 CAPSULE ASSEMBLY PASSED ===')
" 2>&1
