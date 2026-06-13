#!/bin/bash
# MAESTRO — pick-build-model.sh <token>  (13/06)
# Echoes the first BUILD model accessible on this token, from the quality ladder.
# fable-5 risulta inaccessibile via token headless sugli account Max (13/06, lato Anthropic:
# rollout non ancora esteso alla superficie OAuth-token) -> scala a opus-4-8, poi sonnet-4-6.
# Vuoto = nessuno accessibile (il caller -> Hermes-DeepSeek).
# Recovery: quando fable-5 torna, manda UNA notifica Telegram e azzera il marker.
TOK="$1"
[ -n "$TOK" ] || { echo ""; exit 0; }
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
MARK="$HOME/.fable5_down"
for m in claude-fable-5 claude-opus-4-8 claude-sonnet-4-6; do
  out=$(timeout 45 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" \
        claude -p --model "$m" "ok" 2>&1)
  if printf '%s' "$out" | grep -qiE "may not exist|may not have access|selected model|invalid model|unknown model"; then
    [ "$m" = "claude-fable-5" ] && : > "$MARK"   # fable-5 ancora giu' -> marca
    continue
  fi
  # modello accessibile (anche se quota/auth: non e' colpa del modello -> lo restituisco, il driver gestisce)
  if [ "$m" = "claude-fable-5" ] && [ -f "$MARK" ]; then
    bash "$HOME/maestro-tools/notify-telegram.sh" "✅ MAESTRO: fable-5 e' tornato accessibile via token headless (rollout Anthropic completato) — builder torna a fable-5." >/dev/null 2>&1 || true
    rm -f "$MARK"
  fi
  echo "$m"; exit 0
done
echo ""
