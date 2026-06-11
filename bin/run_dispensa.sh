#!/bin/bash
# MAESTRO runner — dispense stilizzate LIVE (M1-6 Fase F).
#
# Routing per docente (UNA fonte, lezione H2-1011):
#   prof_*  -> DB fisica1-sim,        output fisica1-sim/derived/dispense/
#   andrea  -> DB teoria-segnali-2021 (reale) + mapping globale M1-1c,
#              output teoria-segnali-2021/derived/dispense/
#
# Usage:
#   bash bin/run_dispensa.sh                      # default: 3 sim + andrea
#   bash bin/run_dispensa.sh prof_pratico         # singolo docente
#
# Environment (override):
#   SIM_DB / SIM_OUT       — DB e output dir per i docenti sim
#   REAL_DB / REAL_OUT     — DB e output dir per andrea
#   GLOBAL_RES             — mapping globale M1-1c per andrea (JSON)
#   MODEL                  — modello DeepSeek (default deepseek-chat)
#
# Requires: uv, DEEPSEEK_API_KEY in env o .env nella repo root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"

DATA_ROOT="$HOME/maestro-data"
SIM_DB="${SIM_DB:-$DATA_ROOT/fisica1-sim/derived/db/fisica1.db}"
SIM_OUT="${SIM_OUT:-$DATA_ROOT/fisica1-sim/derived/dispense}"
REAL_DB="${REAL_DB:-$DATA_ROOT/teoria-segnali-2021/derived/db/lessonos.db}"
REAL_OUT="${REAL_OUT:-$DATA_ROOT/teoria-segnali-2021/derived/dispense}"
GLOBAL_RES="${GLOBAL_RES:-$DATA_ROOT/teoria-segnali-2021/derived/global_resolution/andrea.json}"
MODEL="${MODEL:-deepseek-chat}"

if [ $# -ge 1 ]; then
    TEACHERS=("$@")
else
    TEACHERS=("prof_pratico" "prof_socratico" "prof_rigoroso" "andrea")
fi

mkdir -p "$SIM_OUT" "$REAL_OUT"

echo "=== M1-6 Fase F — Dispense LIVE ==="
echo "Sim DB:   $SIM_DB -> $SIM_OUT"
echo "Real DB:  $REAL_DB -> $REAL_OUT (mapping: $GLOBAL_RES)"
echo "Model:    $MODEL"
echo "Teachers: ${TEACHERS[*]}"
echo ""

FAILED=0
for TID in "${TEACHERS[@]}"; do
    echo "--- $TID"
    if [ "$TID" = "andrea" ]; then
        ARGS=(--db "$REAL_DB" --teacher "$TID" --out "$REAL_OUT/$TID.md" --resolution "$GLOBAL_RES")
    else
        ARGS=(--db "$SIM_DB" --teacher "$TID" --out "$SIM_OUT/$TID.md")
    fi
    if ! uv run python bin/run_dispensa.py "${ARGS[@]}" --model "$MODEL"; then
        echo "  [FAIL] dispensa per $TID" >&2
        FAILED=1
    fi
    echo ""
done

exit "$FAILED"
