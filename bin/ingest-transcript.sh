#!/usr/bin/env bash
# Runner GENERALIZZATO (M1, no hardcoding del corso — risolve il LOW deepreview):
# ingerisce una trascrizione ASR JSONL arbitraria → capsule windowed → grafo →
# riepilogo, su DB/wiki indicati. Auto-gate: grounding >20% NULL e seg_id 1-indexed.
# Usage: bin/ingest-transcript.sh <jsonl> <lesson_id> <db_path> <wiki_dir> [title]
# Env:   MIN_CHARS (default 120 = coalescing anti-coriandoli)
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"
TRANSCRIPT="${1:?jsonl}"; LESSON_ID="${2:?lesson_id}"; DB_PATH="${3:?db_path}"; WIKI="${4:?wiki_dir}"
TITLE="${5:-$LESSON_ID}"; MIN_CHARS="${MIN_CHARS:-120}"
[ -f "$TRANSCRIPT" ] || { echo "ERROR: transcript non trovato: $TRANSCRIPT"; exit 1; }
mkdir -p "$(dirname "$DB_PATH")" "$WIKI"
if [ -f .env ]; then export "$(grep '^DEEPSEEK_API_KEY=' .env)"; fi
[ -n "${DEEPSEEK_API_KEY:-}" ] || { echo "ERROR: DEEPSEEK_API_KEY"; exit 1; }
export TRANSCRIPT LESSON_ID DB_PATH WIKI TITLE MIN_CHARS

uv run python3 -c "
import os, sys, re
from lessonos.asr.adapter import ingest_asr_jsonl
from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.graph.writer import GraphWriter
from lessonos.graph.grounding import assert_grounding_threshold, grounding_ratio
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.models.entities import Lesson, Path, Source
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import generate_lesson_summary

T=os.environ['TRANSCRIPT']; L=os.environ['LESSON_ID']; DB=os.environ['DB_PATH']
WIKI=os.environ['WIKI']; TITLE=os.environ['TITLE']; MC=int(os.environ['MIN_CHARS'])
store=SQLiteStore(DB)
PID='fisica1_sim'; SID='fisica1_sim_source'
if store.get_path(PID) is None:
    store.save_path(Path(path_id=PID, title='Fisica 1 — Cinematica (sim 10 docenti)', subject='Fisica 1', lesson_ids=(L,), source_ids=(SID,)))
if store.get_source(SID) is None:
    store.save_source(Source(source_id=SID, title='Trascrizioni sintetiche', kind='asr-sim'))
if store.get_lesson(L) is None:
    store.save_lesson(Lesson(lesson_id=L, path_id=PID, title=TITLE, order=1, source_id=SID))

removed=store.delete_segments_for_lesson(L)
if removed: print(f'  rimossi {removed} segmenti (re-ingest pulito)')
segs=ingest_asr_jsonl(store, T, L, min_chars=MC)
print(f'  {len(segs)} segmenti coalesced ({segs[0].seg_id}–{segs[-1].seg_id})')
router=Router(); router.register(DeepSeekProvider(model='deepseek-chat'))
cap=assemble_lesson_capsule(store, L, router, provider='deepseek', model='deepseek-chat', defensive=True, save=True)
ex=[c.excerpt for grp in (cap.content.concepts,cap.content.exercises,cap.content.student_questions,cap.content.homework) for it in grp for c in it.citations]
tot,nul,ratio=grounding_ratio(ex)
print(f'  capsule: concetti={len(cap.content.concepts)} es={len(cap.content.exercises)} dom={len(cap.content.student_questions)} dropped={len(cap.dropped)} · grounding {nul}/{tot} ({ratio:.0%})')
assert_grounding_threshold(ex, L)
w=GraphWriter(store); e=w.write_capsule_graph(cap)
print(f'  grafo: {len(store.get_graph_nodes_for_lesson(L))} nodi, {e} archi, {len(store.get_all_evidence_for_lesson(L))} evidenze')
try:
    pack=generate_lesson_summary(store, cap, router, output_dir=WIKI, provider='deepseek', model='deepseek-chat')
    txt=pack.files.get(f'{L}.md','')
    assert not re.findall(rf'{L}#s0\b', txt), '0-indexed!'
    print(f'  riepilogo: {len(txt)} byte → {WIKI}/{L}.md')
except ValueError as exc:
    print(f'  riepilogo RIFIUTATO dal gate: {exc}'); sys.exit(1)
print(f'  OK {L}')
" 2>&1
