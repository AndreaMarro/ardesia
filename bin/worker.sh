#!/bin/bash
# LessonOS worker — Claude Code TIERED (gestione token: modello economico per task economici).
# Usage: ./bin/worker.sh <tier> "task"
#   haiku  = task banali (doc, wiring semplice)        — cheapest
#   sonnet = default, la maggior parte delle task      — economico+capace
#   opus   = task dure di ragionamento (M3 grafo, M4 delta) o escalation post-fail
# Il gate frozen pytest garantisce la qualita a prescindere dal modello.
tier="${1:-sonnet}"; shift
case "$tier" in
  haiku) m="claude-haiku-4-5";;
  opus)  m="claude-opus-4-8";;
  *)     m="claude-sonnet-4-5";;
esac
exec env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$@"
