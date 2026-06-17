#!/bin/bash
# MAESTRO — HERMES-2.5: opus AGGIUDICA i CRITICI trovati da kimi (red-team decorrelato).
# kimi resta il FINDER cross-family (decorrelazione builder=deepseek/reviewer=opus/finder=kimi intatta);
# opus, gated+capped, conferma REAL o refuta FP con PROVA file:line, e ANNOTA il report (advisory: NON
# auto-chiude, il supervisore ratifica). Scrive SOLO nel report (~/maestro-logs, fuori dal repo) + Telegram:
# zero scritture/commit nel repo => zero rischio git. Fault-isolato: mai blocca il tick.
# Disattiva: HERMES2_OPUS_ADJUDICATE=0.  Cap: HERMES2_OPUS_CAP (default 8/giorno).
set -u
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
REPO="${1:-lessonos}"
case "$REPO" in lessonos) RDIR="$HOME/lessonos";; studio) RDIR="$HOME/maestro-studio";; *) exit 0;; esac
OUTDIR="$HOME/maestro-logs/adversarial"
LOGD="$HOME/maestro-logs/hermes2-adjudicate"; mkdir -p "$LOGD"
LCK="$LOGD/.lock"
if [ -f "$LCK" ] && kill -0 "$(cat "$LCK" 2>/dev/null)" 2>/dev/null; then exit 0; fi
echo $$ > "$LCK"; trap 'rm -f "$LCK"' EXIT
CAP="${HERMES2_OPUS_CAP:-8}"; DAY="$(date -u +%F)"; CAPF="$LOGD/.cap_$DAY"
n=0; [ -f "$CAPF" ] && n="$(cat "$CAPF" 2>/dev/null || echo 0)"; case "$n" in ''|*[!0-9]*) n=0 ;; esac
[ "$n" -ge "$CAP" ] && { echo "[adjud] cap $n/$CAP raggiunto — skip"; exit 0; }

REP="$(ls -t "$OUTDIR"/*-"$REPO"-*.md 2>/dev/null | head -1)"
[ -n "$REP" ] || { echo "[adjud] nessun report per $REPO"; exit 0; }
grep -qE '^CRITICO:' "$REP" || { echo "[adjud] ultimo report $REPO senza CRITICO — skip"; exit 0; }
grep -qF '## OPUS-VERDICT' "$REP" && { echo "[adjud] gia aggiudicato — skip"; exit 0; }

ACC="$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)"
[ -n "$ACC" ] || { echo "[adjud] opus quota-out — finding kimi resta per il supervisore (fallback graceful)"; exit 0; }
TOK="$(bash "$HOME/lessonos/bin/acct.sh" token "$ACC" 2>/dev/null)"
[ -n "$TOK" ] || { echo "[adjud] token vuoto — skip"; exit 0; }

sha="$(basename "$REP" .md | sed -E "s/^[0-9]+-[0-9]+-${REPO}-//")"
diff="$(git -C "$RDIR" diff "${sha}~1..${sha}" 2>/dev/null | head -c 30000)"
[ -n "$diff" ] || diff="$(git -C "$RDIR" show "$sha" 2>/dev/null | head -c 30000)"
report="$(cat "$REP")"

PROMPT="Sei l'AGGIUDICATORE (opus-4-8) del red-team MAESTRO. Un red-team DIVERSO (kimi, modello altro per decorrelazione) ha trovato dei CRITICI sul commit ${REPO}@${sha}, dopo che il gate era verde. NON difendere il codice: sii DEFAULT-SCETTICO verso il CODICE. Per OGNI riga che inizia con 'CRITICO:' nel report kimi, emetti un verdetto con PROVA:
- REAL: conferma il bug citando file:line + l'input reale che lo innesca (repro) + il fix preciso.
- FALSO POSITIVO: refutalo con PROVA (perche' il codice e' corretto, o la garanzia e' di una dipendenza matura, o lo scenario e' impossibile).
Un verdetto senza prova non vale. Onesta brutale, zero compiacenza, italiano, conciso.
FORMATO:
RIEPILOGO: <X REAL, Y FP su N critici>
poi per ogni critico una riga: [REAL|FP] <titolo> — <prova file:line/repro oppure confutazione>.

=== REPORT KIMI ===
${report}

=== DIFF ${REPO}@${sha} (troncato) ===
${diff}"

VERDICT="$(timeout 900 env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$PROMPT" 2>&1)"; rc=$?
if [ "$rc" -ne 0 ] || [ "${#VERDICT}" -lt 40 ]; then echo "[adjud] opus fallito (rc=$rc, len=${#VERDICT}) — finding kimi resta (fallback)"; exit 0; fi

{ echo ""; echo "## OPUS-VERDICT (aggiudicazione $(date -u +%FT%TZ), account $ACC)"; echo ""; echo "> kimi=finder decorrelato (cross-family); opus=aggiudicatore. ADVISORY: il supervisore ratifica. Limite noto: opus ha costruito il codice => possibile bias; la PROVA file:line richiesta rende il verdetto falsificabile."; echo ""; printf '%s\n' "$VERDICT"; } >> "$REP"
echo "$((n+1))" > "$CAPF"
summary="$(printf '%s' "$VERDICT" | grep -iE '^RIEPILOGO' | head -1)"
bash "$HOME/maestro-tools/notify-telegram.sh" "HERMES-2.5: opus ha aggiudicato i critici di ${REPO}@${sha} — ${summary:-vedi report}. Prove file:line nel report, gia pre-triagiato: ratifica tu." >/dev/null 2>&1 || true
echo "[adjud] OK ${REPO}@${sha} (cap $((n+1))/$CAP) — ${summary}"
