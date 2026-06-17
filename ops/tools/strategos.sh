#!/bin/bash
# MAESTRO — STRATEGOS: fable-5 ULTRACODE proattivo (capo-ingegnere del progetto).
# Audita il lavoro recente di ENTRAMBI i repo e PROPONE ordini/coaching/ricerche.
# NON decide: le proposte le ratifica il supervisore (Claude) prima di diventare pin.
# Schedulato 3×/giorno (launchd com.maestro.strategos) + on-demand. Output: ~/maestro-logs/strategos/
# Uso: strategos.sh ["finestra git --since", default "10 hours ago"]
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
SINCE="${1:-10 hours ago}"
# MULTI-ACCOUNT: usa il primo account con quota libera; skip pulito se nessuno.
SACC=$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)
if [ -z "$SACC" ]; then
  echo "STRATEGOS: skip — quota-out su tutti gli account (riprovo al prossimo slot)"
  exit 0
fi
export CLAUDE_CODE_OAUTH_TOKEN="$(bash "$HOME/lessonos/bin/acct.sh" token "$SACC")"
echo "STRATEGOS: account $SACC"
OUTDIR="$HOME/maestro-logs/strategos"; mkdir -p "$OUTDIR"
OUT="$OUTDIR/$(date -u +%Y%m%d-%H%M)-strategos.md"

ctx_repo() { # $1=dir $2=nome
  echo "### REPO $2 — commit da '$SINCE'"
  git -C "$1" log --since="$SINCE" --oneline 2>/dev/null | head -30
  echo "--- diffstat aggregato ---"
  git -C "$1" diff --stat "@{${SINCE}}" 2>/dev/null | tail -12
  echo "--- STATUS tail ---"
  tail -25 "$1/STATUS.md" 2>/dev/null
}

CTX="$(ctx_repo "$HOME/lessonos" lessonos)

$(ctx_repo "$HOME/maestro-studio" maestro-studio)

### PIN CORRENTI (PROSSIMA TASK)
$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | head -30)

### ULTIMI REPORT HERMES-2 (red-team)
$(ls -t "$HOME/maestro-logs/adversarial/"*.md 2>/dev/null | head -5)
$(for f in $(ls -t "$HOME/maestro-logs/adversarial/"*.md 2>/dev/null | head -3); do echo "— $(basename "$f"):"; head -4 "$f" | tail -2; done)

### CONTATORI
iterazioni oggi: $(sed -n 2p "$HOME/lessonos/.iters_today" 2>/dev/null)"

PROMPT="ultracode — Sei lo STRATEGOS del progetto MAESTRO: il capo-ingegnere proattivo (fable-5 multi-agente).
STRETTAMENTE READ-ONLY: NON modificare file, NON eseguire comandi che scrivono/installano/cambiano configurazione,
NON toccare ~/.zshenv/worker/claude-mem/agentmemory: il tuo UNICO output e' il report di proposte (le ratifica il
supervisore). Leggere per ispezionare e' ok; scrivere/applicare no — qualunque modifica al sistema = errore grave.
Usa il Workflow tool: agenti paralleli per dimensione (qualità-vera-del-lavoro · rischi/blind-spot: test-power,
debito, invarianti groundedness/replay/GDPR/local-first, architettura · traiettoria vs obiettivi M0-M4) + verifica
avversaria delle conclusioni. Onestà brutale, zero compiacenza. NON sei il decisore: il supervisore ratifica.
Contesto progetto: piattaforma docenti local-first — lavagna-che-registra → grafo per-docente → riepiloghi/libri
nello stile, gate per fase; ora in chiusura M0 (filo verticale su 4 lezioni reali trascritte).

EVOLUZIONE MISURABILE (ordine Andrea 11/06): leggi ~/maestro-logs/evolution.jsonl (ledger deterministico,
uno snapshot per tick) e gli ultimi report in ~/maestro-logs/research/. Valuta CON NUMERI: (a) classi di
errore RIPETUTE nei report adversarial — una classe che riappare DOPO che una skill la copriva = skill
inefficace, proponi la riscrittura; (b) skill create/toccate vs errori della stessa classe prima/dopo
(efficacia reale, non dichiarata); (c) coaching adottati da Hermes vs ignorati; (d) scoperte dalle ricerche
NON ancora applicate al codice/processo — proponi dove applicarle. L'evoluzione che non si misura non esiste.

Produci un report markdown CONCISO:
## Audit del periodo (cosa regge davvero, cosa è fragile — con file/commit precisi)
## Evoluzione misurata (numeri dal ledger: errori ripetuti per classe, efficacia skill, ricerche applicate/ignorate)
## Blind-spot (ciò che NESSUNO sta guardando: max 5, ordinati per morso)
## Proposte (max 5: pin/coaching/skill-da-scrivere/ricerca/refactor — ciascuna con perché, costo, e cosa rischia se ignorata)
## Una domanda scomoda (la cosa che il team non si sta chiedendo)

=== CONTESTO RACCOLTO ===
$CTX

=== EVOLUTION LEDGER (ultimi 10 snapshot) ===
$(tail -10 "$HOME/maestro-logs/evolution.jsonl" 2>/dev/null)

=== REPORT EVOLUZIONE ===
$(bash "$HOME/maestro-tools/evolution-report.sh" 2>/dev/null)"

out=$(timeout 2400 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$PROMPT" 2>&1); rc=$?
if [ "$rc" -ne 0 ] || [ -z "$out" ]; then
  out=$(timeout 1200 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-sonnet-4-6 "$PROMPT" 2>&1); rc=$?
fi
printf '# STRATEGOS — %s (finestra: %s)\n\n%s\n' "$(date -u +%FT%TZ)" "$SINCE" "$out" > "$OUT"
echo "STRATEGOS: $OUT (rc=$rc)"
bash "$HOME/maestro-tools/notify-telegram.sh" "🧠 STRATEGOS: nuovo report pronto ($(basename "$OUT")) — il supervisore lo triagerà al prossimo ciclo." 2>/dev/null || true
exit "$rc"
