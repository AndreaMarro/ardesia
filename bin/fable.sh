#!/bin/bash
# MAESTRO worker — escalation di Hermes a Claude (ladder fable-5 -> opus-4-8), login Max OAuth headless.
# Hermes lo chiama DA PROTAGONISTA per: decisioni architetturali dure, 2 tentativi falliti, design review.
# Usage: ./bin/fable.sh "domanda/spec con contesto (file:line, cosa hai provato, output gate)"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
out=""
for m in claude-fable-5 claude-opus-4-8; do
  for try in 1 2 3; do
    out=$(timeout 300 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$@" 2>&1); rc=$?
    if [ "$rc" = 124 ] || printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded"; then
      sleep $((try*5)); continue
    fi
    printf '%s\n' "$out"; exit 0
  done
done
printf '%s\n' "$out"
exit 1
