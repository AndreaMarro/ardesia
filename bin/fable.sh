#!/bin/bash
# MAESTRO worker — cervello indiretto di Hermes (16/06).
#   PLAN-CHECK (sanity pre-build, FREQUENTE) -> LiteLLM gateway deepseek-chat->kimi (cheap, ~0$). NIENTE claude.
#   escalation/decisioni dure (RARO)         -> claude -p opus-4-8 ULTRACODE -> sonnet-4-6 (caro ~0.09$/call cold).
# Nota: nome file invariato (fable.sh) perche i driver/TRIG lo chiamano per path.
# Routing automatico sul contenuto: prompt che inizia con "PLAN-CHECK" -> LiteLLM cheap; resto -> claude escalation.
# Prima riga di output = [fable.sh -> <modello>] per l'audit. Login Max OAuth headless.
# Usage: ./bin/fable.sh "domanda/spec con contesto (file:line, cosa hai provato, output gate)"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
PROMPT="$*"

# PLAN-CHECK (frequente) -> LiteLLM gateway cheap (deepseek-chat -> kimi via fallback). NIENTE claude (~0.09$/call).
case "$1" in
  PLAN-CHECK*)
    LK=$(cat "$HOME/litellm/.consumer-key" 2>/dev/null || echo "${LITELLM_MASTER_KEY:-sk-ardesia-litellm-local}")
    pc_out=$(PROMPT="$PROMPT" LK="$LK" python3 - <<'PYEOF'
import os,json,urllib.request
p=os.environ["PROMPT"]; k=os.environ["LK"]
body=json.dumps({"model":"deepseek-chat","messages":[{"role":"user","content":p}],"max_tokens":1200,"temperature":0.2}).encode()
req=urllib.request.Request("http://127.0.0.1:4000/v1/chat/completions",data=body,
    headers={"Authorization":"Bearer "+k,"Content-Type":"application/json"})
try:
    d=json.load(urllib.request.urlopen(req,timeout=90))
    print("[fable.sh -> litellm/deepseek-chat]")
    print(d["choices"][0]["message"]["content"])
except Exception as e:
    print("[fable.sh -> LITELLM-FAIL: %s]" % e); raise SystemExit(7)
PYEOF
)
    rc=$?
    printf '%s\n' "$pc_out"
    exit $rc
    ;;
esac

# MULTI-ACCOUNT: fail-fast SOLO se TUTTI gli account sono in finestra quota-out
# (il chiamante ha gia la regola "se fable.sh fallisce, procedi e annota").
if ! bash "$HOME/lessonos/bin/acct.sh" pick >/dev/null 2>&1; then
  printf '[fable.sh -> QUOTA-OUT su tutti gli account, fail-fast]\n'
  exit 7
fi
# ESCALATION (raro): opus-4-8 ULTRACODE via claude -p. (PLAN-CHECK e' gia uscito sopra via LiteLLM.)
MODELS="claude-opus-4-8 claude-sonnet-4-6"; T=600; TRIES=2
PROMPT="ultracode — se il problema è sostanzioso usa il Workflow tool (agenti paralleli: analisi indipendenti + verifica avversaria + sintesi); se è banale rispondi diretto. $PROMPT"
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
