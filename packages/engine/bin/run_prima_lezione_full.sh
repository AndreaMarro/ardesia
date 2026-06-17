#!/usr/bin/env bash
# ===========================================================================
# T6R-1a — Ingest prima_lezione segments + capsule + summary in persistent DB
#
# Extends run_capsule.sh pattern with summary generation:
#   1. Ingest ASR segments → persistent DB (1-indexed)
#   2. Build capsule (DeepSeek LIVE, save=True)
#   3. Generate summary via summarizer (DeepSeek LIVE) → derived/wiki/
#   4. Verify 2+ citations with 1-indexed seg_ids (no #s0)
# ===========================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"

LESSON_ID="prima_lezione"
BASENAME="Prima_lezione_teoria_dei_segnali"
PATH_ID="teoria_segnali_2021"
SOURCE_ID="teoria_segnali_source"
ORDER=1
MAX_SEGMENTS=100

TRANSCRIPT="${HOME}/maestro-data/teoria-segnali-2021/derived/asr/${BASENAME}.speech.segment.jsonl"
DB_DIR="${HOME}/maestro-data/teoria-segnali-2021/derived/db"
mkdir -p "$DB_DIR"
DB_PATH="${DB_DIR}/lessonos.db"
WIKI_DIR="${HOME}/maestro-data/teoria-segnali-2021/derived/wiki"
mkdir -p "$WIKI_DIR"

# Pre-flight
if [ ! -f "$TRANSCRIPT" ]; then
  echo "ERROR: transcript not found: $TRANSCRIPT"
  exit 1
fi
LINE_COUNT=$(wc -l < "$TRANSCRIPT")
echo "=== T6R-1a — PRIMA LEZIONE FULL INGEST ==="
echo "Transcript:     $TRANSCRIPT"
echo "Total segments: $LINE_COUNT"
echo "Max to ingest:  $MAX_SEGMENTS"
echo "DB:             $DB_PATH"
echo ""

# DeepSeek key
if [ -f .env ]; then
  export "$(grep '^DEEPSEEK_API_KEY=' .env)"
fi
if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "ERROR: DEEPSEEK_API_KEY not set."
  exit 1
fi
echo "DeepSeek API key: ${DEEPSEEK_API_KEY:0:8}... (present)"
echo ""

export LESSON_ID PATH_ID SOURCE_ID TRANSCRIPT MAX_SEGMENTS ORDER DB_PATH WIKI_DIR

uv run python3 -c "
import os, sys
from lessonos.asr.adapter import ingest_asr_jsonl
from lessonos.capsule.assembly import assemble_lesson_capsule, load_capsule
from lessonos.graph.writer import write_capsule_graph, GraphWriter
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import generate_lesson_summary

LESSON_ID = os.environ['LESSON_ID']
PATH_ID = os.environ['PATH_ID']
SOURCE_ID = os.environ['SOURCE_ID']
TRANSCRIPT = os.environ['TRANSCRIPT']
MAX_SEG = int(os.environ['MAX_SEGMENTS'])
ORDER = int(os.environ['ORDER'])
DB_PATH = os.environ['DB_PATH']
WIKI_DIR = os.environ['WIKI_DIR']

# -- Step 0: Check if prima_lezione already exists in DB --
store = SQLiteStore(DB_PATH)

existing_segs = store.segments_for_lesson(LESSON_ID)
existing_capsule = load_capsule(store, LESSON_ID)
print(f'Existing segments for {LESSON_ID}: {len(existing_segs)}')
print(f'Existing capsule: {\"yes\" if existing_capsule else \"no\"}')

# -- Step 1: Ingest ASR segments --
print()
print('=== STEP 1: INGEST ASR SEGMENTS ===')
# Remove old segments if re-ingesting
if existing_segs:
    print(f'Removing {len(existing_segs)} old segments before re-ingest...')
    for seg in existing_segs:
        store.delete_segment(seg.seg_id)

segments = ingest_asr_jsonl(store, TRANSCRIPT, LESSON_ID, max_segments=MAX_SEG)
seg_count = len(segments)
last_seg = segments[-1]
print(f'  Ingested {seg_count} segments (1-indexed: {segments[0].seg_id} – {last_seg.seg_id})')
print(f'  Range: {segments[0].start}s — {last_seg.end}s')
print(f'  First segment: [{segments[0].seg_id}] {segments[0].text[:100]}...')
print(f'  Last segment:  [{last_seg.seg_id}] {last_seg.text[:100]}...')

# Verify: first seg_id MUST be #s1 (1-indexed), NOT #s0
assert segments[0].seg_id == f'{LESSON_ID}#s1', f'CONTRACT BROKEN: first seg_id is {segments[0].seg_id}, expected {LESSON_ID}#s1'
print(f'  ✅ seg_id contract verified: first segment is {segments[0].seg_id} (1-indexed)')

# -- Step 2: Build router with DeepSeek --
print()
print('=== STEP 2: BUILD ROUTER ===')
router = Router()
provider = DeepSeekProvider(model='deepseek-chat')
router.register(provider)
print(f'  Provider registered: {provider.name} ({provider._model})')

# -- Step 3: Assemble capsule --
print()
print('=== STEP 3: ASSEMBLE CAPSULE (DeepSeek LIVE) ===')
# Save path/source/lesson entities if not exist
if store.get_path(PATH_ID) is None:
    path = Path(path_id=PATH_ID, title='Teoria dei Segnali 2021', subject='Teoria dei Segnali',
                lesson_ids=(LESSON_ID,), source_ids=(SOURCE_ID,))
    store.save_path(path)
    print('  Path created')
if store.get_source(SOURCE_ID) is None:
    source = Source(source_id=SOURCE_ID, title=f'Trascrizione {LESSON_ID}', kind='asr')
    store.save_source(source)
    print('  Source created')
lesson_title = 'Prima lezione — Teoria dei Segnali'
if store.get_lesson(LESSON_ID) is None:
    lesson = Lesson(lesson_id=LESSON_ID, path_id=PATH_ID, title=lesson_title, order=ORDER, source_id=SOURCE_ID)
    store.save_lesson(lesson)
    print('  Lesson created')

capsule = assemble_lesson_capsule(
    store, LESSON_ID, router,
    provider='deepseek',
    model='deepseek-chat',
    defensive=True,
    save=True,
)
print(f'  Capsule assembled: lesson_id={capsule.lesson_id}, dropped={len(capsule.dropped)}')

# Report capsule
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
if capsule.content.exercises:
    print(f'Exercises: {len(capsule.content.exercises)}')
if capsule.content.student_questions:
    print(f'Student questions: {len(capsule.content.student_questions)}')
if capsule.content.homework:
    print(f'Homework: {len(capsule.content.homework)}')

# Verify ALL capsule citations have 1-indexed seg_ids (no #s0)
print()
print('=== CITATION seg_id AUDIT ===')
bad = 0
for c in capsule.content.concepts:
    for cite in c.citations:
        if cite.seg_id.endswith('#s0'):
            print(f'  ❌ BAD: concept \"{c.name}\" cites {cite.seg_id} (0-indexed!)')
            bad += 1
for ex in capsule.content.exercises:
    for cite in ex.citations:
        if cite.seg_id.endswith('#s0'):
            print(f'  ❌ BAD: exercise cites {cite.seg_id} (0-indexed!)')
            bad += 1
for q in capsule.content.student_questions:
    for cite in q.citations:
        if cite.seg_id.endswith('#s0'):
            print(f'  ❌ BAD: question cites {cite.seg_id} (0-indexed!)')
            bad += 1
for h in capsule.content.homework:
    for cite in h.citations:
        if cite.seg_id.endswith('#s0'):
            print(f'  ❌ BAD: homework cites {cite.seg_id} (0-indexed!)')
            bad += 1

if bad > 0:
    print(f'  ❌ {bad} 0-indexed citation(s) found in capsule! Fix required.')
    sys.exit(1)
else:
    print(f'  ✅ All capsule seg_ids are 1-indexed (no #s0 found)')

# -- Step 4: Write graph --
print()
print('=== STEP 4: WRITE GRAPH (GraphWriter) ===')
writer = GraphWriter(store)
edges_written = writer.write_capsule_graph(capsule)
print(f'  Edges written: {edges_written}')

nodes = store.get_graph_nodes_for_lesson(LESSON_ID)
all_edges = store.get_graph_edges_for_lesson(LESSON_ID)
evidences = store.get_all_evidence_for_lesson(LESSON_ID)
print(f'  Nodes: {len(nodes)}')
print(f'  Edges: {len(all_edges)}')
print(f'  Evidences: {len(evidences)}')

# -- Step 5: Generate summary --
print()
print('=== STEP 5: GENERATE SUMMARY (DeepSeek LIVE) ===')
pack = generate_lesson_summary(
    store, capsule, router,
    output_dir=WIKI_DIR,
    provider='deepseek',
    model='deepseek-chat',
)
summary_path = os.path.join(WIKI_DIR, f'{LESSON_ID}.md')
summary_text = pack.files.get(f'{LESSON_ID}.md', '')
print(f'  Summary generated: {len(summary_text)} bytes')
print(f'  Written to: {summary_path}')

# -- Step 6: Verify summary citations are 1-indexed --
print()
print('=== STEP 6: VERIFY SUMMARY CITATIONS ===')
import re
found_s0 = re.findall(rf'{LESSON_ID}#s0\\b', summary_text)
if found_s0:
    print(f'  ❌ BAD: summary contains {len(found_s0)} 0-indexed citation(s): {LESSON_ID}#s0')
    print(f'  Summary has wrong seg_id numbering — contract violated!')
    for line in summary_text.split('\\n'):
        if f'{LESSON_ID}#s0' in line:
            print(f'    LINE: {line.strip()[:120]}')
    sys.exit(1)
else:
    print(f'  ✅ NO {LESSON_ID}#s0 citations in summary (all 1-indexed)')

# Verify at least some #s1 citations exist
found_s1 = re.findall(rf'{LESSON_ID}#s1\\b', summary_text)
print(f'  Found {len(found_s1)} citations to {LESSON_ID}#s1 in summary')
if found_s1 == 0:
    print(f'  ⚠️  Warning: no citations to {LESSON_ID}#s1 found — check if LLM used 0-indexed numbering')

# Print 3 example citations for reviewer inspection
print()
print('=== 3 CITATIONS FOR REVIEWER (per direttiva Claude 10:35) ===')
cites_found = re.findall(rf'\\[([^\\]]+)\\]\\({LESSON_ID}#s(\\d+)\\)', summary_text)
seen = set()
count = 0
for excerpt_text, s_num in cites_found:
    key = f'{LESSON_ID}#s{s_num}'
    if key not in seen and count < 3:
        seen.add(key)
        count += 1
        print(f'{count}. \"{excerpt_text[:80]}...\" → {key}')

if count == 0:
    print('  (no markdown link citations found — check format)')

# -- Step 7: Acceptance: 2+ citations with resolved seg_ids --
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
    print(f'{i}. {ctx} → seg_id={cite.seg_id}')
    print(f'   Excerpt: {cite.excerpt!r}')
    print(f'   Source segment: {seg.text!r}')
    print()

# -- Step 8: Log cost --
est_cost_input = (MAX_SEG * 20 * 3 * 0.14) / 1_000_000  # 3 calls (seg, ext, summary)
est_cost_output = (500 * 3 * 0.28) / 1_000_000
est_total = round(est_cost_input + est_cost_output, 6)
entry = CostLedgerEntry(
    entry_id='t6r-1a-prima-lezione-full',
    lesson_id=LESSON_ID,
    model='deepseek-chat',
    provider='deepseek',
    prompt_tokens=0,
    completion_tokens=0,
    cost_usd=est_total,
    label=f'T6R-1a {LESSON_ID} full ingest+capsule+summary ({MAX_SEG} segments, deepseek-chat) — estimated \${est_total}',
)
store.save_ledger_entry(entry)
print(f'Estimated cost: \${est_total}')
print()
print('=== T6R-1a PRIMA LEZIONE FULL COMPLETE ===')
" 2>&1
