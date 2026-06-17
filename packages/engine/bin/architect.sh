#!/bin/bash
# MAESTRO — architect.sh <repo> [token] : opus PROGETTA i pin ARCHITETTURALI prima del build.
# Quando il pin attivo e' architetturale (schema/contratti/invarianti/persistenza/API/layer) e non c'e'
# ancora un design per QUESTO pin, opus produce un DESIGN conciso (NO codice) -> <repo>/ARCHITECT-CURRENT.md.
# Il builder (legge AGENTS.md) lo consulta e lo segue. Idempotente per-pin (skip se gia progettato).
# Gated quota + cap + fallback (no doc -> builder progetta inline = comportamento attuale). Fault-isolato:
# mai blocca il build (il chiamante usa || true). Doc gitignored => git clean/reset non lo tocca; rigenerato se perso.
# Disattiva: ARCHITECT_ENABLED=0.  Forza (test): ARCHITECT_FORCE=1.  Cap: ARCHITECT_CAP (def 6/giorno).
set -u
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
[ "${ARCHITECT_ENABLED:-1}" = "1" ] || { echo "[architect] disabilitato"; exit 0; }
REPO="${1:-}"; TOK="${2:-}"
case "$REPO" in lessonos) RDIR="$HOME/lessonos";; studio) RDIR="$HOME/maestro-studio";; *) echo "[architect] repo invalido: $REPO"; exit 0;; esac
COORD="$HOME/lessonos/COORDINATION.md"; DOC="$RDIR/ARCHITECT-CURRENT.md"
LOGD="$HOME/maestro-logs/architect"; mkdir -p "$LOGD"
LCK="$LOGD/.lock_$REPO"
if [ -f "$LCK" ] && kill -0 "$(cat "$LCK" 2>/dev/null)" 2>/dev/null; then exit 0; fi
echo $$ > "$LCK"; trap 'rm -f "$LCK"' EXIT

pin="$(grep -E "^- [*][*]${REPO}[*][*]:" "$COORD" 2>/dev/null | head -1)"
[ -n "$pin" ] || { echo "[architect] nessun pin $REPO"; exit 0; }
if [ "${ARCHITECT_FORCE:-0}" != "1" ]; then
  printf '%s' "$pin" | grep -qiE 'PIN ESAURITO|\[PIN-DONE|NOOP' && { echo "[architect] pin $REPO done/noop — skip"; exit 0; }
  printf '%s' "$pin" | grep -qiE 'schema|contratt|contract|persisten|migrat|invariant|store|API|layer|SDK|lifecycle|depends_on|grafo|graph|protocol|primitiv|endpoint|serving|retrieval' || { echo "[architect] pin $REPO non architetturale — skip (builder inline)"; exit 0; }
fi
sig="$(printf '%s' "$pin" | shasum 2>/dev/null | cut -c1-12)"
if [ "${ARCHITECT_FORCE:-0}" != "1" ] && [ -f "$DOC" ] && grep -qF "PIN-SIG: $sig" "$DOC" 2>/dev/null; then
  echo "[architect] design gia presente per pin $sig — skip"; exit 0
fi
CAP="${ARCHITECT_CAP:-6}"; DAY="$(date -u +%F)"; CAPF="$LOGD/.cap_$DAY"
n=0; [ -f "$CAPF" ] && n="$(cat "$CAPF" 2>/dev/null || echo 0)"; case "$n" in ''|*[!0-9]*) n=0 ;; esac
[ "$n" -ge "$CAP" ] && { echo "[architect] cap $n/$CAP — skip"; exit 0; }
if [ -z "$TOK" ]; then
  ACC="$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)"
  [ -n "$ACC" ] || { echo "[architect] opus quota-out — builder inline (fallback)"; exit 0; }
  TOK="$(bash "$HOME/lessonos/bin/acct.sh" token "$ACC" 2>/dev/null)"
fi
[ -n "$TOK" ] || { echo "[architect] token vuoto — skip"; exit 0; }

DESC="lessonos = motore Python (ingest lezioni -> grafo metodo per-docente, recap grounded ZERO-LLM, store SQLite)"
[ "$REPO" = studio ] && DESC="maestro-studio = lavagna TypeScript/React/Vite (canvas Excalidraw, ToolHost<->plugin SDK Layer-0)"
PROMPT="Sei l'ARCHITECT (opus-4-8) del progetto MAESTRO ($DESC). Un builder sta per costruire la task pinnata; PRIMA tu progetti. NON scrivere codice: produci un DESIGN conciso e azionabile. Leggi (read-only) AGENTS.md, STATUS.md e il codice rilevante nella dir corrente.
TASK PINNATA: $pin
Output in italiano, conciso:
## Approccio (3-6 righe: la strategia e perche')
## Modello dati / contratto (se tocca schema/persistenza/API: modifiche ADDITIVE + migrate-safe)
## Invarianti da preservare (groundedness, replay deterministico, GDPR/local-first, ZERO-LLM in prodotto, additive/migrate-safe; per studio anche ZERO-brand-ELAB)
## Strategia di test (FALSIFICABILE: cosa dimostra il gate; mutation; un risultato errato = RED)
## File da toccare (file:funzione precisi)
## Rischi e trappole (cosa puo' rompersi, edge case)
Onesta: se la task NON e' architetturale o il design e' gia ovvio, dillo in una riga e basta."

OUT="$(cd "$RDIR" && timeout 600 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$PROMPT" 2>&1)"; rc=$?
if [ "$rc" -ne 0 ] || [ "${#OUT}" -lt 80 ]; then echo "[architect] opus fallito (rc=$rc, len=${#OUT}) — builder inline (fallback)"; exit 0; fi

{ echo "# ARCHITECT-CURRENT — design opus pre-build (advisory)"; echo "PIN-SIG: $sig"; echo "GENERATO: $(date -u +%FT%TZ)"; echo "PIN: $pin"; echo ""; echo "> Design opus PRIMA del build. Builder: seguilo; migliora SOLO motivando. STANTIO se PIN-SIG non corrisponde al pin corrente -> ignoralo."; echo ""; printf '%s\n' "$OUT"; } > "$DOC"
echo "$((n+1))" > "$CAPF"
echo "[architect] design scritto $DOC (pin-sig $sig, cap $((n+1))/$CAP)"
bash "$HOME/maestro-tools/notify-telegram.sh" "ARCHITECT opus: design pre-build scritto per pin $REPO (ARCHITECT-CURRENT.md). Il builder lo seguira." >/dev/null 2>&1 || true
