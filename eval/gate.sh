#!/bin/bash
# MAESTRO-Studio — GATE FROZEN (autorità del ratchet, come eval/gate.sh di LessonOS).
# Contratto: ultima riga stdout = {"passed":N,"failed":N,"exit":E}. Il driver legge SOLO quella.
# Hermes NON tocca questo file (regola COORDINATION). typecheck pulito = precondizione; vitest conta.
set -uo pipefail
cd "$(dirname "$0")/.." || { echo '{"passed":0,"failed":1,"exit":1}'; exit 1; }
export PATH="$HOME/node-local/bin:/opt/homebrew/bin:$PATH"

tsc_out=$(npx tsc -b --noEmit 2>&1); tsc_rc=$?
if [ "$tsc_rc" -ne 0 ]; then
  printf '%s\n' "$tsc_out" | head -20
  echo '{"passed":0,"failed":1,"exit":1}'
  exit 1
fi

vout=$(npx vitest run --passWithNoTests --reporter=json 2>/dev/null); vrc=$?
passed=$(printf '%s' "$vout" | grep -oE '"numPassedTests":[0-9]+' | grep -oE '[0-9]+' | head -1)
failed=$(printf '%s' "$vout" | grep -oE '"numFailedTests":[0-9]+' | grep -oE '[0-9]+' | head -1)
echo "{\"passed\":${passed:-0},\"failed\":${failed:-0},\"exit\":${vrc}}"
exit "$vrc"
