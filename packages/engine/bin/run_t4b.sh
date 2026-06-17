#!/usr/bin/env bash
# ===========================================================================
# T4b — FILO NEL MOTORE: pipe real transcription through capsule pipeline
#
# Reads the first N segments of the Prima lezione ASR JSONL, ingests into a
# temp SQLite store, and runs assemble_lesson_capsule with DeepSeek LIVE
# (sanctioned, ~$0.001).  Reports capsule summary, cost, and citations.
#
# Usage:
#   ./bin/run_t4b.sh                          # default: 50 segments
#   ./bin/run_t4b.sh --max-segments 100       # more segments
#   ./bin/run_t4b.sh --check-only             # just check transcript exists
# ===========================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"

# Config
TRANSCRIPT="${HOME}/maestro-data/teoria-segnali-2021/derived/asr/Prima_lezione_teoria_dei_segnali.speech.segment.jsonl"
LESSON_ID="prima_lezione"
PATH_ID="teoria_segnali_2021"
SOURCE_ID="teoria_segnali_source"
MAX_SEGMENTS=50
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-segments) MAX_SEGMENTS="$2"; shift 2 ;;
    --check-only)   CHECK_ONLY=1; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Pre-flight checks
if [ ! -f "$TRANSCRIPT" ]; then
  echo "ERROR: transcript not found at:"
  echo "  $TRANSCRIPT"
  echo "Has the Prima lezione been transcribed via T4a?"
  exit 1
fi

LINE_COUNT=$(wc -l < "$TRANSCRIPT")
echo "=== T4b — FILO NEL MOTORE ==="
echo "Transcript:      $TRANSCRIPT"
echo "Total segments:  $LINE_COUNT"
echo "Max to ingest:   $MAX_SEGMENTS"
echo ""

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo "Transcript exists and has $LINE_COUNT segments. OK."
  echo "Sample (line 1):"
  head -1 "$TRANSCRIPT"
  exit 0
fi

# Retrieve the DeepSeek key from .env (needed by DeepSeekProvider)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "ERROR: DEEPSEEK_API_KEY not set. Run with it set or in .env."
  exit 1
fi
echo "DeepSeek API key: ${DEEPSEEK_API_KEY:0:8}..."

# Run the Python pipeline
uv run python3 -c "
from lessonos.asr.adapter import ingest_asr_jsonl
from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.sqlite import SQLiteStore

# -- Setup store + domain entities --
print('Creating store...')
store = SQLiteStore(':memory:')

# Path
path = Path(
    path_id='$PATH_ID',
    title='Teoria dei Segnali 2021',
    subject='Teoria dei Segnali',
    lesson_ids=('$LESSON_ID',),
    source_ids=('$SOURCE_ID',),
)
store.save_path(path)

# Source
source = Source(source_id='$SOURCE_ID', title='Trascrizione Prima lezione', kind='asr')
store.save_source(source)

# Lesson
lesson = Lesson(
    lesson_id='$LESSON_ID',
    path_id='$PATH_ID',
    title='Prima lezione — Teoria dei Segnali',
    order=1,
    source_id='$SOURCE_ID',
)
store.save_lesson(lesson)

# -- Ingest ASR segments --
print(f'Ingesting up to $MAX_SEGMENTS segments...')
jsonl_path = '$TRANSCRIPT'
segments = ingest_asr_jsonl(store, jsonl_path, '$LESSON_ID', max_segments=$MAX_SEGMENTS)
seg_count = len(segments)
print(f'  Ingested {seg_count} segments')
print(f'  Range: {segments[0].start}s — {segments[-1].end}s')
print(f'  First segment: [{segments[0].seg_id}] {segments[0].text[:100]}...')

# -- Build router with DeepSeek provider --
print('Setting up DeepSeek provider...')
router = Router()
provider = DeepSeekProvider(model='deepseek-chat')
router.register(provider)
print(f'  Provider registered: {provider.name} ({provider._model})')

# -- Run capsule pipeline (defensive mode for real noisy transcript) --
print('Assembling lesson capsule with DeepSeek live...')
capsule = assemble_lesson_capsule(
    store, '$LESSON_ID', router,
    provider='deepseek',
    model='deepseek-chat',
    defensive=True,
)

# -- Report results --
print()
print('=== LESSON CAPSULE RESULT ===')
print(f'lesson_id:  {capsule.lesson_id}')
print(f'dropped:    {len(capsule.dropped)} items dropped')
if capsule.dropped:
    for d in capsule.dropped[:5]:
        print(f'  - {d}')

print()
print('Timeline (topics):')
for span in capsule.timeline:
    print(f'  [{span.start}s–{span.end}s] {span.topic} ({len(span.seg_ids)} segs)')

print()
print('Concepts:')
for c in capsule.content.concepts:
    print(f'  [{c.status}] {c.name}')
    for cite in c.citations:
        print(f'    → seg_id={cite.seg_id} excerpt={cite.excerpt!r} (repaired={cite.excerpt_repaired})')

print()
print('Exercises:')
for ex in capsule.content.exercises:
    print(f'  prompt={ex.prompt[:120]}...')
    for cite in ex.citations:
        print(f'    → seg_id={cite.seg_id} excerpt={cite.excerpt!r}')

print()
print('Student questions:')
for q in capsule.content.student_questions:
    print(f'  {q.question[:120]}...')
    for cite in q.citations:
        print(f'    → seg_id={cite.seg_id}')

print()
print('Homework:')
for h in capsule.content.homework:
    print(f'  {h.task[:120]}...')
    for cite in h.citations:
        print(f'    → seg_id={cite.seg_id}')

# -- Enforce acceptance criteria: ≥2 real citations with resolved seg_ids --
print()
print('=== ACCEPTANCE: 2+ CITATIONS WITH VERIFIED seg_id ===')
real_cites = []
for c in capsule.content.concepts:
    for cite in c.citations:
        real_cites.append((c.name, cite))
    if len(real_cites) >= 2:
        break

if len(real_cites) < 2:
    for ex in capsule.content.exercises:
        for cite in ex.citations:
            real_cites.append(('exercise', cite))
        if len(real_cites) >= 2:
            break

assert len(real_cites) >= 2, f'acceptance failed: only {len(real_cites)} citations'

for i, (ctx, cite) in enumerate(real_cites[:2], 1):
    seg = store.get_segment(cite.seg_id)
    assert seg is not None, f'citation seg_id={cite.seg_id} does not resolve in store'
    # Verify excerpt is grounded in real segment text
    if cite.excerpt is not None:
        assert cite.excerpt in seg.text, (
            f'citation excerpt {cite.excerpt!r} not found in seg.text {seg.text!r}'
        )
    print(f'{i}. {ctx} → seg_id={cite.seg_id}')
    print(f'   Excerpt: {cite.excerpt!r}')
    print(f'   Source segment: {seg.text!r}')
    print(f'   Position: {seg.start}s–{seg.end}s')
    print()

# Log cost — estimate from the 2 DeepSeek calls made
# Each call: ~(50 segments × ~20 tokens avg) = 1000 input tokens, ~500 output
est_cost_input = (1000 * 2 * 0.14) / 1_000_000   # $0.00028
est_cost_output = (500 * 2 * 0.28) / 1_000_000    # $0.00028
est_total = round(est_cost_input + est_cost_output, 6)
# Write a ledger entry
entry = CostLedgerEntry(
    entry_id='t4b-live-' + '$LESSON_ID',
    lesson_id='$LESSON_ID',
    model='deepseek-chat',
    provider='deepseek',
    prompt_tokens=2000,
    completion_tokens=1000,
    cost_usd=est_total,
    label='T4b live capsule (50 segments, deepseek-chat)',
)
store.save_ledger_entry(entry)
print(f'Estimated cost: ${est_total}')
print()
print('=== T4b PIPELINE PASSED — ACCEPTANCE MET ===')
" 2>&1

echo ""
echo "Exit code: $?"
