#!/bin/bash
# MAESTRO — replenish.sh : auto-rifornimento backlog ROADMAP-AUTO (risolve la dipendenza-da-pin-manuali).
# Quando il backlog [AUTO-OK] di un repo scende sotto soglia, chiede allo STRATEGIST (gateway cheap
# deepseek-v4-pro, NON opus => zero consumo del credito Anthropic scarso) i prossimi 1-3 task tattici
# in-visione, VALIDA rigorosamente l'output (output LLM = NON fidato: whitelist formato+char+repo+dedup),
# li appende a COORDINATION.md e committa atomico su auto/main. Append-only, capped/giorno, fault-isolato
# (un fallimento qui NON deve mai bloccare il loop). Disattivabile: REPLENISH_ENABLED=0.
# DRY: REPLENISH_DRY=1 => genera+valida+stampa, NON scrive/committa.
set -u
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
[ "${REPLENISH_ENABLED:-1}" = "1" ] || { echo "[replenish] disabilitato (REPLENISH_ENABLED=0)"; exit 0; }

ROOT="$HOME/lessonos"; COORD="$ROOT/COORDINATION.md"
AGENT="$HOME/.claude/agents/roadmap-replenisher.md"
GW="http://127.0.0.1:4000/v1/chat/completions"
THRESHOLD="${REPLENISH_THRESHOLD:-2}"
DAYCAP="${REPLENISH_DAYCAP:-4}"
DRY="${REPLENISH_DRY:-0}"
LOGDIR="$HOME/maestro-logs/replenish"; mkdir -p "$LOGDIR"
# lock PID-file (pattern hourly-tick; macOS-native, niente flock) — serializza replenish-vs-replenish
LCK="$LOGDIR/.lock"
if [ -f "$LCK" ] && kill -0 "$(cat "$LCK" 2>/dev/null)" 2>/dev/null; then echo "[replenish] altro run in corso — skip"; exit 0; fi
echo $$ > "$LCK"; trap 'rm -f "$LCK"' EXIT
TS="$(date -u +%FT%TZ)"; DAY="$(date -u +%F)"; CAPF="$LOGDIR/.cap_$DAY"
cd "$ROOT" 2>/dev/null || { echo "[replenish] no repo"; exit 0; }
[ -f "$COORD" ] || { echo "[replenish] no COORDINATION.md"; exit 0; }

# cap giornaliero
n=0; [ -f "$CAPF" ] && n="$(cat "$CAPF" 2>/dev/null || echo 0)"
case "$n" in ''|*[!0-9]*) n=0 ;; esac
if [ "$DRY" != "1" ] && [ "$n" -ge "$DAYCAP" ]; then echo "[replenish] cap giornaliero $n/$DAYCAP — skip"; exit 0; fi

# backlog vivo SOLO nella sezione ## ROADMAP-AUTO
sec="$(awk '/^## ROADMAP-AUTO/{f=1;next} /^## /{f=0} f' "$COORD")"
nl="$(printf '%s\n' "$sec" | grep -c '^- \[AUTO-OK\] lessonos:')"
ns="$(printf '%s\n' "$sec" | grep -c '^- \[AUTO-OK\] studio:')"
echo "[replenish] $TS backlog vivo: lessonos=$nl studio=$ns (soglia $THRESHOLD, dry=$DRY)"
if [ "$DRY" != "1" ] && [ "$nl" -ge "$THRESHOLD" ] && [ "$ns" -ge "$THRESHOLD" ]; then
  echo "[replenish] backlog sufficiente — niente da fare"; exit 0
fi

# master key gateway (litellm) — serve SOLO al fallback deepseek (opus-first non la usa)
MK="$(grep -rhoE 'LITELLM_MASTER_KEY[=: ]+["'"'"']?sk-[A-Za-z0-9_-]+' "$HOME/.zshenv" "$HOME/.zprofile" "$HOME/.zshrc" "$HOME/litellm/.env" "$HOME/litellm/start.sh" "$HOME/litellm/run-fg.sh" "$HOME/Library/LaunchAgents/com.ardesia.litellm.plist" 2>/dev/null | grep -oE 'sk-[A-Za-z0-9_-]+' | head -1)"

# persona = corpo dell'agent .md (dopo il SECONDO '---')
PERSONA="$(awk 'BEGIN{c=0} /^---[[:space:]]*$/{c++; next} c>=2{print}' "$AGENT" 2>/dev/null)"
[ -n "$PERSONA" ] || { echo "[replenish] persona agent assente ($AGENT) — skip"; exit 0; }

# contesto read-only
ctxrepo() { echo "## $2 — ultimi commit"; git -C "$1" log --oneline -8 2>/dev/null; echo "-- STATUS tail --"; tail -16 "$1/STATUS.md" 2>/dev/null; }
# capability digest: cosa ESISTE GIA (fix root-cause: lo strategist era CIECO al codice -> proponeva task gia-fatte -> gridlock)
builtdigest() {
  d="$1"; nm="$2"
  echo "### $nm — CAPABILITY GIA COSTRUITE (NON riproporle: proponi SOLO lavoro NUOVO non in questa lista)"
  if [ "$nm" = lessonos ]; then
    printf 'MCP tools gia esposti: '; grep -rhoE 'grounded_memory_[a-z]+' "$d/lessonos/mcp/" --include='*.py' 2>/dev/null | sort -u | tr '\n' ' '; echo
    printf 'moduli engine: '; ls "$d/lessonos/" 2>/dev/null | grep -vE '__|[.]pyc' | tr '\n' ' '; echo
    printf 'test gia presenti: '; ls "$d/tests/" 2>/dev/null | grep -E '^test_.*[.]py$' | tr '\n' ' '; echo
  else
    printf 'moduli toolhost: '; ls "$d/src/toolhost" "$d/src/toolhost-protocol" 2>/dev/null | grep -E '[.]ts$' | tr '\n' ' '; echo
    printf 'test gia presenti: '; ls "$d/src/__tests__/" 2>/dev/null | tr '\n' ' '; echo
    printf 'reference plugins: '; ls "$d/plugins/" 2>/dev/null | tr '\n' ' '; echo
  fi
}
LASTSTRAT="$(ls -t "$HOME/maestro-logs/strategos/"*.md 2>/dev/null | head -1)"
CTX="### PIN CORRENTI + ROADMAP-AUTO
$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$COORD" | head -40)

$(ctxrepo "$ROOT" lessonos)

$(ctxrepo "$HOME/maestro-studio" studio)

$(builtdigest "$ROOT" lessonos)

$(builtdigest "$HOME/maestro-studio" studio)

### MILESTONES (visione)
$(head -28 "$ROOT/MILESTONES.md" 2>/dev/null)

### ULTIMO STRATEGOS
$(tail -35 "$LASTSTRAT" 2>/dev/null)

### REPO SOTTO-SOGLIA DA RIFORNIRE: $([ "$nl" -lt "$THRESHOLD" ] && printf 'lessonos ')$([ "$ns" -lt "$THRESHOLD" ] && printf 'studio')"

# STRATEGIST: opus-4-8 ULTRACODE first (quota-gated via acct.sh), fallback deepseek-v4-pro gateway (mai bloccato).
USERMSG="Stato corrente del factory qui sotto. Emetti SOLO le righe [AUTO-OK] per i repo SOTTO-SOGLIA (vedi REPO SOTTO-SOGLIA DA RIFORNIRE), max 3, nel formato esatto, niente altro. VIETATO riproporre capability gia presenti in 'CAPABILITY GIA COSTRUITE' (tool/metodi/test gia esistenti): proponi SOLO lavoro nuovo non ancora costruito.

$CTX"
RAW=""
ACC="$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)"
if [ -n "$ACC" ]; then
  TOK="$(bash "$HOME/lessonos/bin/acct.sh" token "$ACC" 2>/dev/null || true)"
  if [ -n "$TOK" ]; then
    RAW="$(timeout 300 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" claude -p --dangerously-skip-permissions --model claude-opus-4-8 "ultracode — $PERSONA

$USERMSG" 2>/dev/null)"
    if [ "${#RAW}" -ge 20 ]; then echo "[replenish] strategist=opus-4-8 ultracode (account $ACC)"; else RAW=""; fi
  fi
fi
if [ -z "$RAW" ] && [ -n "$MK" ]; then
  echo "[replenish] strategist=deepseek-v4-pro (fallback gateway)"
  REQ="$(PERSONA="$PERSONA" CTX="$CTX" python3 -c 'import json,os
print(json.dumps({"model":"deepseek-chat","temperature":0.2,"max_tokens":3500,"messages":[
 {"role":"system","content":os.environ["PERSONA"]},
 {"role":"user","content":"Stato corrente del factory qui sotto. Emetti SOLO le righe [AUTO-OK] per i repo SOTTO-SOGLIA (vedi REPO SOTTO-SOGLIA DA RIFORNIRE), max 3, nel formato esatto, niente altro. VIETATO riproporre capability gia presenti in 'CAPABILITY GIA COSTRUITE' (tool/metodi/test gia esistenti): proponi SOLO lavoro nuovo non ancora costruito.\n\n"+os.environ["CTX"]}]}))')"
  RESP="$(curl -s -m 120 "$GW" -H "Authorization: Bearer $MK" -H "Content-Type: application/json" -d "$REQ" 2>/dev/null)"
  RAW="$(printf '%s' "$RESP" | python3 -c 'import sys,json
try:
    m=json.load(sys.stdin)["choices"][0]["message"]
    print((m.get("content") or "").strip() or (m.get("reasoning_content") or ""))
except Exception:
    print("")' 2>/dev/null)"
fi
if [ -z "$RAW" ]; then echo "[replenish] nessuna risposta (opus+gateway) — skip (nessuna scrittura)"; exit 0; fi

# VALIDAZIONE RIGOROSA dell'output (NON fidato). process-substitution (NO heredoc => niente espansione/RCE).
VALID=""
while IFS= read -r line; do
  line="$(printf '%s' "$line" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
  case "$line" in
    "- [AUTO-OK] lessonos:"*) r=lessonos ;;
    "- [AUTO-OK] studio:"*)   r=studio   ;;
    *) continue ;;
  esac
  [ "$r" = lessonos ] && [ "$nl" -ge "$THRESHOLD" ] && [ "$DRY" != "1" ] && continue
  [ "$r" = studio ]   && [ "$ns" -ge "$THRESHOLD" ] && [ "$DRY" != "1" ] && continue
  case "$line" in
    *'`'*|*'$'*|*';'*|*'|'*|*'&'*|*'<'*|*'>'*|*'\'*|*'"'*|*"'"*|*'*'*) echo "[replenish] SCARTO (char non sicuri): $line"; continue ;;
  esac
  L=${#line}; { [ "$L" -ge 30 ] && [ "$L" -le 320 ]; } || { echo "[replenish] SCARTO (len $L): $line"; continue; }
  key="$(printf '%s' "$line" | python3 -c 'import sys; print(sys.stdin.read().strip()[:50])' 2>/dev/null)"
  if [ -n "$key" ] && grep -qF -- "$key" "$COORD" 2>/dev/null; then echo "[replenish] SCARTO (dup): $line"; continue; fi
  # staleness-vs-code: auto-drop SOLO caso ad alta confidenza (nuovo tool MCP grounded_memory_X gia esposto = il gridlock dominante); altrimenti WARN, niente drop (un simbolo esistente != task gia fatta, es. nuovo test su simbolo esistente)
  newtool="$(printf '%s' "$line" | grep -oE 'tool MCP grounded_memory_[a-z]+' | grep -oE 'grounded_memory_[a-z]+' | head -1)"
  if [ -n "$newtool" ] && grep -rqF -- "$newtool" "$ROOT/lessonos/mcp/" 2>/dev/null; then echo "[replenish] SCARTO (tool MCP '\''$newtool'\'' GIA esposto nel codice): $line"; continue; fi
  rdir="$ROOT"; [ "$r" = studio ] && rdir="$HOME/maestro-studio"
  bsym="$(printf '%s' "$line" | grep -oE '[a-z][a-z0-9]+(_[a-z0-9]+){2,}' | head -1)"
  if [ -n "$bsym" ] && grep -rqwF -- "$bsym" "$rdir" --include='*.py' --include='*.ts' 2>/dev/null; then echo "[replenish] WARN (simbolo '\''$bsym'\'' gia nel codice — il supervisore verifichi non-gia-fatto): $line"; fi
  # guardrail code-enforced (defense-in-depth, NON solo persona): studio = ZERO-brand-ELAB; criterio falsificabile = deve citare 'gate'
  if [ "$r" = studio ] && printf '%s' "$line" | grep -qiF elab; then echo "[replenish] SCARTO (brand ELAB in studio): $line"; continue; fi
  if ! printf '%s' "$line" | grep -qiF gate; then echo "[replenish] SCARTO (manca criterio gate): $line"; continue; fi
  VALID="${VALID}${line}
"
done < <(printf '%s\n' "$RAW")

cnt="$(printf '%s' "$VALID" | grep -c '^- \[AUTO-OK\]')"
case "$cnt" in ''|*[!0-9]*) cnt=0 ;; esac
if [ "$cnt" -eq 0 ]; then echo "[replenish] zero righe valide dopo validazione — skip"; exit 0; fi
if [ "$cnt" -gt 3 ]; then VALID="$(printf '%s' "$VALID" | head -3)"; cnt=3; fi

if [ "$DRY" = "1" ]; then
  echo "[replenish] DRY-RUN — $cnt righe valide (NON scritte):"; printf '%s\n' "$VALID"; exit 0
fi

# append dopo header ROADMAP-AUTO + commit atomico
VALID="$VALID" python3 - "$COORD" <<'PY'
import os,re,sys
f=sys.argv[1]; s=open(f,encoding="utf-8").read()
add=os.environ["VALID"].strip("\n")
m=re.search(r"^## ROADMAP-AUTO.*$", s, flags=re.M)
if m: s=s[:m.end()]+"\n"+add+s[m.end():]; open(f,"w",encoding="utf-8").write(s)
PY
git add COORDINATION.md 2>/dev/null
git commit -q -m "coord: AUTO-REPLENISH backlog (+$cnt, strategist deepseek-v4-pro) — mai-vuoto autonomo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" 2>/dev/null
crc=$?
firstkey="$(printf '%s' "$VALID" | head -1 | python3 -c 'import sys; print(sys.stdin.read().strip()[:50])' 2>/dev/null)"
if [ "$crc" -eq 0 ] && [ -n "$firstkey" ] && git show HEAD:COORDINATION.md 2>/dev/null | grep -qF -- "$firstkey"; then
  echo "$((n+1))" > "$CAPF"
  { echo "=== $TS (+$cnt) ==="; printf '%s\n' "$VALID"; } >> "$LOGDIR/replenished.log"
  echo "[replenish] OK +$cnt righe (cap $((n+1))/$DAYCAP)"
  bash "$HOME/maestro-tools/notify-telegram.sh" "AUTO-REPLENISH: +$cnt task backlog (strategist) — loop auto-rifornito. Rivedi/pota ROADMAP-AUTO in COORDINATION se off-vision." >/dev/null 2>&1 || true
else
  echo "[replenish] commit/verify fallita (rc=$crc, race?) — revert append, tree pulito, cap intatto"
  git checkout -- COORDINATION.md 2>/dev/null
fi
