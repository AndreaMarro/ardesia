#!/bin/bash
# MAESTRO — deep-research via claude -p (opus-4-8 -> sonnet; 16/06 ex-fable) con WebSearch/WebFetch nativi.
# SOSTITUISCE il browser DR (Gemini/ChatGPT: login bloccato da Google, parcheggiato — decisione Andrea 10/06).
# Usage: research.sh "domanda" [nome-report]
# Output: ~/maestro-logs/research/<data>-<nome>.md  (fuori dai repo: sopravvive ai reset del driver)
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
Q="${1:?Uso: research.sh \"domanda\" [nome-report]}"
NAME="${2:-report}"
OUTDIR="$HOME/maestro-logs/research"; mkdir -p "$OUTDIR"
OUT="$OUTDIR/$(date -u +%Y%m%d-%H%M)-${NAME}.md"

prompt="ultracode — orchestra la ricerca col Workflow tool: agenti paralleli per angolazioni diverse, lettura fonti indipendente, verifica avversaria dei claim chiave, sintesi finale. Sei un ricercatore tecnico rigoroso. Fai una ricerca web APPROFONDITA su questo tema:

$Q

Metodo obbligatorio: (1) esegui 4-8 ricerche web con angolazioni diverse; (2) apri e leggi le fonti migliori; (3) verifica le affermazioni chiave su più fonti indipendenti — se una cosa non è verificabile, dichiaralo; (4) niente claim inventati, niente fonti inventate. Output finale = SOLO un report markdown in italiano: ## Sintesi (max 10 righe) · ## Fatti verificati (con URL) · ## Opzioni e verdetto (ADOPT/TRIAL/IGNORE se applicabile, con costi reali) · ## Incertezze dichiarate."

out=""
for m in claude-opus-4-8 claude-sonnet-4-6; do
  for try in 1 2; do
    out=$(timeout 1500 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$prompt" 2>&1); rc=$?  # ultracode multi-agente = più lento
    if [ "$rc" = 124 ] || printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded"; then
      sleep 10; continue
    fi
    printf '# Deep-research (claude %s) — %s\n\n%s\n' "$m" "$(date -u +%F)" "$out" > "$OUT"
    echo "REPORT: $OUT"
    exit 0
  done
done
printf '%s\n' "$out" >&2
echo "RICERCA FALLITA (nessun report scritto)" >&2
exit 1
