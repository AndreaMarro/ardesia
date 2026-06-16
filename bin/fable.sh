#!/bin/bash
# MAESTRO worker — opus-4-8 come CERVELLO INDIRETTO di Hermes (16/06: fable-5 SOSPESO globalmente -> opus-4-8).
#   PLAN-CHECK (sanity pre-build)  -> ladder opus-4-8 -> sonnet-4-6  (fallback su rate-limit)
#   escalation/decisioni dure       -> opus-4-8 ULTRACODE -> sonnet-4-6
# Nota: nome file invariato (fable.sh) perche i driver/TRIG lo chiamano per path; il modello e' opus-4-8.
# PLAN-CHECK NON e' ultracode (check rapido); ESCALATION e' ultracode (Workflow tool, multi-agente).
# Il routing è automatico sul contenuto: se il prompt inizia con "PLAN-CHECK" usa la ladder PLAN-CHECK.
# Prima riga di output = [fable.sh -> <modello>] per l'audit. Login Max OAuth headless.
# Usage: ./bin/fable.sh "domanda/spec con contesto (file:line, cosa hai provato, output gate)"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
PROMPT="$*"
# MULTI-ACCOUNT: fail-fast SOLO se TUTTI gli account sono in finestra quota-out
# (il chiamante ha gia la regola "se fable.sh fallisce, procedi e annota").
if ! bash "$HOME/lessonos/bin/acct.sh" pick >/dev/null 2>&1; then
  printf '[fable.sh -> QUOTA-OUT su tutti gli account, fail-fast]\n'
  exit 7
fi
case "$1" in
  PLAN-CHECK*) MODELS="claude-opus-4-8 claude-sonnet-4-6"; T=130; TRIES=1;;  # opus-4-8 cervello indiretto; fallback sonnet su rate-limit
  *)
    # ESCALATION = opus-4-8 in modalità ULTRACODE (16/06, ex-fable): orchestrazione multi-agente
    # per le decisioni dure — il keyword attiva l'opt-in del Workflow tool nella sessione headless.
    MODELS="claude-opus-4-8 claude-sonnet-4-6"; T=600; TRIES=2
    PROMPT="ultracode — se il problema è sostanzioso usa il Workflow tool (agenti paralleli: analisi indipendenti + verifica avversaria + sintesi); se è banale rispondi diretto. $PROMPT"
    ;;
esac
ACCS="A1"
bash "$HOME/lessonos/bin/acct.sh" has A2 && ACCS="A1 A2"
bash "$HOME/lessonos/bin/acct.sh" has A3 && ACCS="$ACCS A3"
out=""
for m in $MODELS; do
  for acc in $ACCS; do
    # salta l'account se la sua finestra quota-out e' nota
    bash "$HOME/lessonos/bin/quota.sh" check "$acc" >/dev/null 2>&1 || continue
    TOK="$(bash "$HOME/lessonos/bin/acct.sh" token "$acc" 2>/dev/null || true)"
    [ -n "$TOK" ] || continue
    for try in $(seq 1 $TRIES); do
      out=$(timeout "$T" env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" claude -p --dangerously-skip-permissions --model "$m" "$PROMPT" 2>&1); rc=$?
      if [ "$rc" = 124 ] || printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded|out of (extra )?usage|usage limit|may not exist|may not have access|selected model|invalid model|unknown model"; then
        printf '%s' "$out" | grep -qiE "out of (extra )?usage|usage limit" && printf '%s' "$out" | bash "$HOME/lessonos/bin/quota.sh" mark "$acc" >/dev/null 2>&1 || true
        sleep $((try*5)); continue
      fi
      printf '[fable.sh -> %s@%s]\n%s\n' "$m" "$acc" "$out"; exit 0
    done
  done
done
printf '[fable.sh -> NESSUN MODELLO DISPONIBILE]\n%s\n' "$out"
exit 1
