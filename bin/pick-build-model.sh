#!/bin/bash
# Ardesia — pick-build-model.sh <token> [role]   (13/06)
# Echoes the first model accessible on this token, from the role ladder (route.sh).
# role default = builder. Scala da routes.env/override (Telegram/malfunzione).
# fable-5 attualmente inaccessibile via token headless (lato Anthropic) -> scala a opus-4-8.
# Vuoto = nessuno accessibile (il caller -> Hermes-DeepSeek).
# Recovery: quando fable-5 torna, una notifica Telegram e azzera il marker.
TOK="$1"; ROLE="${2:-builder}"
[ -n "$TOK" ] || { echo ""; exit 0; }
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
MARK="$HOME/.fable5_down"
LADDER="$(bash "$HOME/lessonos/bin/route.sh" "$ROLE" 2>/dev/null)"
[ -n "$LADDER" ] || LADDER="claude-opus-4-8 claude-sonnet-4-6"
for m in $LADDER; do
  case "$m" in claude-*) ;; *) continue;; esac   # solo modelli claude qui (kimi/codex/gemini gestiti altrove)
  out=$(timeout 45 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" \
        claude -p --model "$m" "ok" 2>&1)
  if printf '%s' "$out" | grep -qiE "may not exist|may not have access|selected model|invalid model|unknown model"; then
    [ "$m" = "claude-fable-5" ] && : > "$MARK"
    continue
  fi
  if [ "$m" = "claude-fable-5" ] && [ -f "$MARK" ]; then
    bash "$HOME/maestro-tools/notify-telegram.sh" "Ardesia: fable-5 di nuovo accessibile via token headless (rollout Anthropic completato). Il routing torna a usarlo dove previsto." >/dev/null 2>&1 || true
    rm -f "$MARK"
  fi
  echo "$m"; exit 0
done
echo ""
