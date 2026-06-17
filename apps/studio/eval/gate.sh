#!/bin/bash
# MAESTRO-Studio — GATE FROZEN (autorità del ratchet, come eval/gate.sh di LessonOS).
# Contratto: ultima riga stdout = {"passed":N,"failed":N,"exit":E}. Il driver legge SOLO quella.
# Hermes NON tocca questo file (regola COORDINATION). typecheck pulito = precondizione; vitest conta.
set -uo pipefail
cd "$(dirname "$0")/.." || { echo '{"passed":0,"failed":1,"exit":1}'; exit 1; }
# homebrew PRIMA: node-local è v22.10 < 22.12 richiesto da vitest 4 (rompeva la discovery dei test — bug T0 attempt-2)
export PATH="/opt/homebrew/bin:$HOME/node-local/bin:$PATH"

tsc_out=$(npx tsc -b --noEmit 2>&1); tsc_rc=$?
if [ "$tsc_rc" -ne 0 ]; then
  printf '%s\n' "$tsc_out" | head -20
  echo '{"passed":0,"failed":1,"exit":1}'
  exit 1
fi

vout=$(npx vitest run --passWithNoTests --reporter=json 2>/dev/null); vrc=$?
passed=$(printf '%s' "$vout" | grep -oE '"numPassedTests":[0-9]+' | grep -oE '[0-9]+' | head -1)
failed=$(printf '%s' "$vout" | grep -oE '"numFailedTests":[0-9]+' | grep -oE '[0-9]+' | head -1)
passed=${passed:-0}; failed=${failed:-0}

# KILL-TEST T1 nel gate (aggiunto dal supervisore 10/06 dopo regressione replay sfuggita al solo vitest):
# il replay deterministico è l'invariante di prodotto — se esiste lo script, DEVE essere verde.
if [ "$vrc" -eq 0 ] && [ -x eval/replay-check.sh ] && [ "${SKIP_REPLAY:-0}" != "1" ]; then
  if bash eval/replay-check.sh >/tmp/replay-gate.log 2>&1; then
    passed=$((passed+1))
  else
    failed=$((failed+1)); vrc=1
    tail -5 /tmp/replay-gate.log >&2
  fi
fi

echo "{\"passed\":${passed},\"failed\":${failed},\"exit\":${vrc}}"
exit "$vrc"
