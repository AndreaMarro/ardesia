#!/bin/bash
# MAESTRO worker — Claude come CERVELLO INDIRETTO di Hermes. Routing per ruolo (decisione Andrea 10/06):
#   PLAN-CHECK (ogni iterazione, alto volume)  -> ladder opus-4-8 -> sonnet-4-6  (fable-5 NON nel grind: rate-limit Max)
#   escalation/decisioni dure (raro, pesante)  -> ladder fable-5 -> opus-4-8 -> sonnet-4-6
# Il routing è automatico sul contenuto: se il prompt inizia con "PLAN-CHECK" usa la ladder opus.
# Prima riga di output = [fable.sh -> <modello>] per l'audit. Login Max OAuth headless.
# Usage: ./bin/fable.sh "domanda/spec con contesto (file:line, cosa hai provato, output gate)"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
case "$1" in
  PLAN-CHECK*) MODELS="claude-opus-4-8 claude-sonnet-4-6"; T=110; TRIES=1;;  # corsia veloce: sotto il terminal.timeout di hermes
  *)           MODELS="claude-fable-5 claude-opus-4-8 claude-sonnet-4-6"; T=300; TRIES=3;;
esac
out=""
for m in $MODELS; do
  for try in $(seq 1 $TRIES); do
    out=$(timeout "$T" env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$@" 2>&1); rc=$?
    if [ "$rc" = 124 ] || printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded"; then
      sleep $((try*5)); continue
    fi
    printf '[fable.sh -> %s]\n%s\n' "$m" "$out"; exit 0
  done
done
printf '[fable.sh -> NESSUN MODELLO DISPONIBILE]\n%s\n' "$out"
exit 1
