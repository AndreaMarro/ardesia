#!/bin/bash
# MAESTRO worker — FABLE-5 come CERVELLO INDIRETTO di Hermes (ordine Andrea 11/06: "fable cervello indiretto su macmini").
#   PLAN-CHECK (sanity pre-build)  -> ladder fable-5 -> opus-4-8 -> sonnet-4-6  (fable PRIMO; fallback su rate-limit)
#   escalation/decisioni dure       -> fable-5 ULTRACODE -> opus-4-8 -> sonnet-4-6
# Nota: ora che fable e' il BUILDER di default, PLAN-CHECK serve solo nelle iterazioni Hermes ([GRIND]/fallback),
# quindi volume basso -> fable-first e sostenibile. PLAN-CHECK NON e' ultracode (check rapido, non multi-agente).
# Il routing è automatico sul contenuto: se il prompt inizia con "PLAN-CHECK" usa la ladder PLAN-CHECK.
# Prima riga di output = [fable.sh -> <modello>] per l'audit. Login Max OAuth headless.
# Usage: ./bin/fable.sh "domanda/spec con contesto (file:line, cosa hai provato, output gate)"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
PROMPT="$*"
# QUOTA-AWARE: finestra quota-out nota -> fail-fast (il chiamante ha gia la regola "se fable.sh fallisce, procedi e annota")
if ! bash "$HOME/lessonos/bin/quota.sh" check >/dev/null 2>&1; then
  printf '[fable.sh -> QUOTA-OUT fail-fast] %s\n' "$(bash "$HOME/lessonos/bin/quota.sh" check 2>&1 || true)"
  exit 7
fi
case "$1" in
  PLAN-CHECK*) MODELS="claude-fable-5 claude-opus-4-8 claude-sonnet-4-6"; T=130; TRIES=1;;  # fable cervello indiretto; fallback opus/sonnet su rate-limit
  *)
    # ESCALATION = fable-5 in modalità ULTRACODE (ordine Andrea 10/06): orchestrazione multi-agente
    # per le decisioni dure — il keyword attiva l'opt-in del Workflow tool nella sessione headless.
    MODELS="claude-fable-5 claude-opus-4-8 claude-sonnet-4-6"; T=600; TRIES=2
    PROMPT="ultracode — se il problema è sostanzioso usa il Workflow tool (agenti paralleli: analisi indipendenti + verifica avversaria + sintesi); se è banale rispondi diretto. $PROMPT"
    ;;
esac
out=""
for m in $MODELS; do
  for try in $(seq 1 $TRIES); do
    out=$(timeout "$T" env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$PROMPT" 2>&1); rc=$?
    if [ "$rc" = 124 ] || printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded|out of (extra )?usage|usage limit"; then
      printf '%s' "$out" | grep -qiE "out of (extra )?usage|usage limit" && printf '%s' "$out" | bash "$HOME/lessonos/bin/quota.sh" mark >/dev/null 2>&1 || true
      sleep $((try*5)); continue
    fi
    printf '[fable.sh -> %s]\n%s\n' "$m" "$out"; exit 0
  done
done
printf '[fable.sh -> NESSUN MODELLO DISPONIBILE]\n%s\n' "$out"
exit 1
