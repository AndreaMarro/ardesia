#!/usr/bin/env bash
# T6R — regenerate ONLY the summary for a lesson whose capsule is already in the
# DB (no re-ingest, no re-capsule). Used after a summarizer fix. Self-gates on
# 1-indexed seg_ids; writes derived/wiki/<lesson>.md.
# Usage: bin/run_summary_only.sh <lesson_id> [<lesson_id> ...]
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo "$(dirname "$0")/..")"
[ "$#" -ge 1 ] || { echo "uso: $0 <lesson_id>..."; exit 1; }
# DB/WIKI overridabili via env (rigenerazione su DB A/B separato)
DB="${DB_PATH:-${HOME}/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
WIKI="${WIKI_DIR:-${HOME}/maestro-data/teoria-segnali-2021/derived/wiki}"; mkdir -p "$WIKI"
if [ -f .env ]; then export "$(grep '^DEEPSEEK_API_KEY=' .env)"; fi
[ -n "${DEEPSEEK_API_KEY:-}" ] || { echo "ERROR: DEEPSEEK_API_KEY not set."; exit 1; }
export DB WIKI LESSONS="$*"

uv run python3 -c "
import os, sys, re
from lessonos.capsule.assembly import load_capsule
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.router import Router
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import generate_lesson_summary

store = SQLiteStore(os.environ['DB'])
router = Router(); router.register(DeepSeekProvider(model='deepseek-chat'))
wiki = os.environ['WIKI']
rc = 0
for L in os.environ['LESSONS'].split():
    cap = load_capsule(store, L)
    if cap is None:
        print(f'  ❌ {L}: nessuna capsule nel DB'); rc = 1; continue
    n = len(cap.content.concepts)
    try:
        pack = generate_lesson_summary(store, cap, router, output_dir=wiki, provider='deepseek', model='deepseek-chat')
    except ValueError as exc:
        # gate fail-closed del summarizer (zero/troppo-unverified): FAIL della
        # lezione, ma le altre vengono comunque tentate (deepreview B1)
        print(f'  ❌ {L}: summary RIFIUTATO dal gate grounding: {exc}'); rc = 1; continue
    txt = pack.files.get(f'{L}.md', '')
    if re.findall(rf'{L}#s0\b', txt):
        print(f'  ❌ {L}: summary contiene citazione 0-indexed'); rc = 1; continue
    cites = len(re.findall(rf'\]\({L}#s\d+\)', txt))
    if cites == 0:
        print(f'  ❌ {L}: 0 citazioni risolte nel markdown — non accettabile'); rc = 1; continue
    print(f'  ✅ {L}: summary {len(txt)} byte, {cites} citazioni risolte, {n} concetti nel grafo -> {wiki}/{L}.md')
sys.exit(rc)
" 2>&1
