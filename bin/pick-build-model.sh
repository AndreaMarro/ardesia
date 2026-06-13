#!/bin/bash
# MAESTRO — pick-build-model.sh <token>  (13/06)
# Echoes the first BUILD model accessible on this token, from the quality ladder.
# fable-5 risulta inaccessibile via token headless sugli account Max (13/06) ->
# scala automaticamente a opus-4-8, poi sonnet-4-6. Vuoto = nessuno (caller -> Hermes).
TOK="$1"
[ -n "$TOK" ] || { echo ""; exit 0; }
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
for m in claude-fable-5 claude-opus-4-8 claude-sonnet-4-6; do
  out=$(timeout 45 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" \
        claude -p --model "$m" "ok" 2>&1)
  # modello inaccessibile -> prova il prossimo
  printf '%s' "$out" | grep -qiE "may not exist|may not have access|selected model|invalid model|unknown model" && continue
  # quota/auth -> non e' colpa del modello, restituiscilo comunque (il driver gestira il fallback Hermes)
  echo "$m"; exit 0
done
echo ""
