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

# master key gateway (litellm)
MK="$(grep -rhoE 'LITELLM_MASTER_KEY[=: ]+["'"'"']?sk-[A-Za-z0-9_-]+' "$HOME/.zshenv" "$HOME/.zprofile" "$HOME/.zshrc" "$HOME/litellm/.env" "$HOME/litellm/start.sh" "$HOME/litellm/run-fg.sh" "$HOME/Library/LaunchAgents/com.ardesia.litellm.plist" 2>/dev/null | grep -oE 'sk-[A-Za-z0-9_-]+' | head -1)"
[ -n "$MK" ] || { echo "[replenish] master key non trovata — skip"; exit 0; }

# persona = corpo dell'agent .md (dopo il SECONDO '---')
PERSONA="$(awk 'BEGIN{c=0} /^---[[:space:]]*$/{c++; next} c>=2{print}' "$AGENT" 2>/dev/null)"
[ -n "$PERSONA" ] || { echo "[replenish] persona agent assente ($AGENT) — skip"; exit 0; }

# contesto read-only
ctxrepo() { echo "## $2 — ultimi commit"; git -C "$1" log --oneline -8 2>/dev/null; echo "-- STATUS tail --"; tail -16 "$1/STATUS.md" 2>/dev/null; }
LASTSTRAT="$(ls -t "$HOME/maestro-logs/strategos/"*.md 2>/dev/null | head -1)"
CTX="### PIN CORRENTI + ROADMAP-AUTO
$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$COORD" | head -40)

$(ctxrepo "$ROOT" lessonos)

$(ctxrepo "$HOME/maestro-studio" studio)

### MILESTONES (visione)
$(head -28 "$ROOT/MILESTONES.md" 2>/dev/null)

### ULTIMO STRATEGOS
$(tail -35 "$LASTSTRAT" 2>/dev/null)

### REPO SOTTO-SOGLIA DA RIFORNIRE: $([ "$nl" -lt "$THRESHOLD" ] && printf 'lessonos ')$([ "$ns" -lt "$THRESHOLD" ] && printf 'studio')"

# richiesta gateway (deepseek-v4-pro via alias deepseek-chat; cheap+capped). JSON via python (escaping sicuro).
REQ="$(PERSONA="$PERSONA" CTX="$CTX" python3 -c 'import json,os
print(json.dumps({"model":"deepseek-chat","temperature":0.2,"max_tokens":3500,"messages":[
 {"role":"system","content":os.environ["PERSONA"]},
 {"role":"user","content":"Stato corrente del factory qui sotto. Emetti SOLO le righe [AUTO-OK] per i repo SOTTO-SOGLIA (vedi REPO SOTTO-SOGLIA DA RIFORNIRE), max 3, nel formato esatto, niente altro.\n\n"+os.environ["CTX"]}]}))')"
RESP="$(curl -s -m 120 "$GW" -H "Authorization: Bearer $MK" -H "Content-Type: application/json" -d "$REQ" 2>/dev/null)"
RAW="$(printf '%s' "$RESP" | python3 -c 'import sys,json
try:
    d=json.load(sys.stdin); print(d["choices"][0]["message"]["content"])
except Exception:
    print("")' 2>/dev/null)"
if [ -z "$RAW" ]; then echo "[replenish] gateway: risposta vuota/errore — skip (nessuna scrittura)"; printf '%s' "$RESP" | head -c 300; echo; exit 0; fi

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
    *'`'*|*'$'*|*';'*|*'|'*|*'&'*|*'<'*|*'>'*|*'\'*|*'"'*) echo "[replenish] SCARTO (char non sicuri): $line"; continue ;;
  esac
  L=${#line}; { [ "$L" -ge 30 ] && [ "$L" -le 320 ]; } || { echo "[replenish] SCARTO (len $L): $line"; continue; }
  key="$(printf '%s' "$line" | python3 -c 'import sys; print(sys.stdin.read().strip()[:50])' 2>/dev/null)"
  if [ -n "$key" ] && grep -qF -- "$key" "$COORD" 2>/dev/null; then echo "[replenish] SCARTO (dup): $line"; continue; fi
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
git add COORDINATION.md
git commit -q -m "coord: AUTO-REPLENISH backlog (+$cnt, strategist deepseek-v4-pro) — mai-vuoto autonomo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" 2>/dev/null
firstkey="$(printf '%s' "$VALID" | head -1 | cut -c1-50)"
if git show HEAD:COORDINATION.md 2>/dev/null | grep -qF -- "$firstkey"; then
  echo "$((n+1))" > "$CAPF"
  { echo "=== $TS (+$cnt) ==="; printf '%s\n' "$VALID"; } >> "$LOGDIR/replenished.log"
  echo "[replenish] OK +$cnt righe (cap $((n+1))/$DAYCAP)"
  bash "$HOME/maestro-tools/notify-telegram.sh" "AUTO-REPLENISH: +$cnt task backlog (strategist) — loop auto-rifornito. Rivedi/pota ROADMAP-AUTO in COORDINATION se off-vision." >/dev/null 2>&1 || true
else
  echo "[replenish] verify post-commit fallita (race?) — cap non incrementato"
fi
