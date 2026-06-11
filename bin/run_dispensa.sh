#!/bin/bash
# MAESTRO runner — genere dispensa stilizzata per uno o piu docenti (M1-4).
# Pattern: run_global_resolution.sh / run_capsule.sh
#
# Usage:
#   bash bin/run_dispensa.sh prof_pratico               # singolo docente
#   bash bin/run_dispensa.sh pratico socratico rigoroso  # piu docenti
#   bash bin/run_dispensa.sh                             # default: 3 sim + andrea
#
# Environment:
#   DB_PATH       — SQLite database (default: ~/maestro-data/teoria-segnali-2021/derived/db/lessonos.db)
#   DERIVED_DIR   — output directory (default: ~/maestro-data/teoria-segnali-2021/derived/dispense/)
#   GLOBAL_RES    — global resolution mapping JSON (optional)
#   PROVIDER      — LLM provider (default: deepseek-chat via provider=deepseek, model=deepseek-chat)
#   MODEL         — LLM model override
#
# Requires: uv run (Python 3.12+), API key in env (DEEPSEEK_API_KEY per DeepSeek)

set -euo pipefail

# ── Paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"

DB_PATH="${DB_PATH:-$HOME/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
DERIVED_DIR="${DERIVED_DIR:-$HOME/maestro-data/teoria-segnali-2021/derived/dispense}"
GLOBAL_RES="${GLOBAL_RES:-}"
PROVIDER="${PROVIDER:-deepseek}"
MODEL="${MODEL:-deepseek-chat}"

# ── Teacher list ──────────────────────────────────────────────────────
if [ $# -ge 1 ]; then
    TEACHERS=("$@")
else
    TEACHERS=("prof_pratico" "prof_socratico" "prof_rigoroso" "andrea")
fi

mkdir -p "$DERIVED_DIR"

echo "=== M1-4 Dispensa Stilizzata ==="
echo "DB:       $DB_PATH"
echo "Output:   $DERIVED_DIR"
echo "Provider: $PROVIDER / $MODEL"
echo "Teachers: ${TEACHERS[*]}"
echo ""

for TID in "${TEACHERS[@]}"; do
    echo "--- Generating dispensa for $TID ..."
    OUTPUT="$DERIVED_DIR/${TID}.md"

    # Build Python command
    PY_CMD="from lessonos.dispensa import generate_dispensa, verify_dispensa, render_dispensa_md; "
    PY_CMD+="from lessonos.store.sqlite import SQLiteStore; "
    PY_CMD+="from lessonos.llm.router import Router; "
    PY_CMD+="from lessonos.llm.deepseek import DeepSeekProvider; "
    PY_CMD+="import os; "
    PY_CMD+="store = SQLiteStore(os.environ.get('DB_PATH', '$DB_PATH')); "
    PY_CMD+="router = Router(); "
    PY_CMD+="router.register(DeepSeekProvider(api_key=os.environ.get('DEEPSEEK_API_KEY', ''), model='$MODEL')); "
    PY_CMD+="doc = generate_dispensa(store, '$TID', router, provider='$PROVIDER', model='$MODEL'); "
    PY_CMD+="report = verify_dispensa(doc, store); "
    PY_CMD+="md = render_dispensa_md(doc, report); "
    PY_CMD+="with open(os.environ.get('OUTPUT', '$OUTPUT'), 'w') as f: f.write(md); "
    PY_CMD+="print(f'Dispensa {report.verified}/{report.total_claims} claims verificati, {report.dropped} scartati, ratio {report.unverified_ratio:.0%}'); "

    DB_PATH="$DB_PATH" OUTPUT="$OUTPUT" uv run python -c "$PY_CMD" 2>&1 || {
        echo "  [WARN] Dispensa for $TID failed — check DB and API key" >&2
        continue
    }

    echo "  -> $OUTPUT"
    echo ""
done

echo "=== Done ==="
echo "Generated ${#TEACHERS[@]} dispense in $DERIVED_DIR"
