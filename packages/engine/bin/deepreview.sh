#!/bin/bash
# MAESTRO — DEEPREVIEW: review di MILESTONE in modalità opus-4-8 ULTRACODE (multi-agente; 16/06 ex-fable).
# Strumento del SUPERVISORE (ratifiche, merge auto/main→main) — NON gira nel loop per-iterazione
# (costo/rate-limit: la review per-iterazione resta bin/review.sh).
# Uso: ./bin/deepreview.sh [studio|lessonos] [range-git]   es: deepreview.sh studio main..auto/main
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
repo="${1:-lessonos}"
case "$repo" in studio) DIR="$HOME/maestro-studio";; *) DIR="$HOME/lessonos";; esac
RANGE="${2:-HEAD~12..HEAD}"
OUTDIR="$HOME/maestro-logs/deepreview"; mkdir -p "$OUTDIR"
OUT="$OUTDIR/$(date -u +%Y%m%d-%H%M)-$repo.md"

commits=$(git -C "$DIR" log --oneline "$RANGE" 2>/dev/null)
diff=$(git -C "$DIR" diff "$RANGE" 2>/dev/null | head -c 150000)
[ -z "$diff" ] && { echo "range vuoto: $RANGE"; exit 1; }

PROMPT="ultracode — review di MILESTONE del progetto MAESTRO (repo $repo). Usa il Workflow tool: dimensioni
PARALLELE (correttezza · sicurezza · invarianti di prodotto: groundedness/replay/GDPR-ModeA/local-first ·
potere reale dei test: possono fallire? · manutenibilità/debito), poi VERIFICA AVVERSARIA di ogni finding
(un agente che prova a confutarlo), poi sintesi. Onestà brutale, zero compiacenza. Output finale: verdetto
MERGE-OK oppure NO con i blockers, lista finding confermati (file:line, perché, fix), rischi residui.

COMMITS:
$commits

DIFF (troncato 150k):
$diff"

out=$(timeout 2400 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$PROMPT" 2>&1); rc=$?
printf '# DEEPREVIEW %s %s — %s\n\n%s\n' "$repo" "$RANGE" "$(date -u +%FT%TZ)" "$out" > "$OUT"
echo "DEEPREVIEW: $OUT (rc=$rc)"
exit "$rc"
