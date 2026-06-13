#!/bin/bash
# Ardesia — ardesia-audit.sh [audit|adversarial|--dry]   (13/06)
# AUDIT (2x/g): fable-ultracode (route audit) rivede stato+codice di ENTRAMBI i repo e PUO applicare
#   modifiche (gate verde + commit). Prende il lock del tick (blocca il loop, come da specifica Andrea).
# ADVERSARIAL (1x/g): red-team del lavoro recente; NON applica, scrive in NEEDS-CLAUDE + Telegram.
# --dry: verifica wiring (modello, lock, report header) senza eseguire l'audit (zero costo LLM).
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
MODE="${1:-audit}"
cd "$HOME/lessonos" || exit 1
OUTDIR="$HOME/maestro-logs/audit"; mkdir -p "$OUTDIR"
TS=$(date -u +%Y%m%d-%H%M)
OUT="$OUTDIR/${TS}-${MODE}.md"
CAP_AUDIT=7200      # 2h
CAP_ADV=3600        # 1h

TOK=$(bash "$HOME/lessonos/bin/acct.sh" token "$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null)" 2>/dev/null)
MODEL=$(bash "$HOME/lessonos/bin/pick-build-model.sh" "$TOK" audit 2>/dev/null)
[ -n "$MODEL" ] || { echo "[audit] nessun modello Claude accessibile, skip"; exit 0; }

if [ "$MODE" = "--dry" ]; then
  echo "[audit] DRY ok: modello=$MODEL token=$([ -n "$TOK" ] && echo si || echo no) out=$OUT"
  printf '# Ardesia audit DRY %s\nmodello: %s\n' "$TS" "$MODEL" > "$OUT"
  exit 0
fi

# prendi il lock del tick (protocollo): l'audit e' esclusivo
deadline=$(( $(date +%s) + 3600 ))
while :; do
  if [ -f .tick.lock ] && kill -0 "$(cat .tick.lock 2>/dev/null)" 2>/dev/null; then
    [ "$(date +%s)" -gt "$deadline" ] && { echo "[audit] lock occupato 1h, skip"; exit 0; }
    sleep 15; continue
  fi
  echo $$ > .tick.lock; sleep 1; [ "$(cat .tick.lock 2>/dev/null)" = "$$" ] && break
done
trap 'rm -f .tick.lock' EXIT

bash "$HOME/maestro-tools/notify-telegram.sh" "Ardesia: avvio $MODE del progetto (modello $MODEL). Il loop e' in pausa finche' finisce." >/dev/null 2>&1 || true

if [ "$MODE" = "adversarial" ]; then
  CAP=$CAP_ADV
  PROMPT='ultracode - Sei il REVISORE AVVERSARIO di Ardesia (corteccia critica). NON modifichi codice. In ~/lessonos (motore Python) e ~/maestro-studio (UI TS/React): leggi STATUS.md, MILESTONES.md, gli ultimi ~20 commit di ENTRAMBI i repo e i report in ~/maestro-logs/adversarial/ e ~/maestro-logs/audit/. Cerca, con verifica reale (repro/lettura codice, non a occhio): regressioni nascoste, test tautologici o indeboliti, falsi-verdi del gate, debito tecnico pericoloso, incoerenze tra STATUS dichiarato e codice reale, rischi GDPR (mai contenuto corpus nei commit). Orchestra subagenti per coprire piu aree in parallelo e per refutare i tuoi stessi sospetti (un sospetto non riprodotto NON e un finding). Output: scrivi un report sintetico e ONESTO (numeri prima delle opinioni, niente emoji) nel file indicato da $AUDIT_OUT, e aggiungi i CRITICI VERI in ~/lessonos/COORDINATION.md sezione NEEDS-CLAUDE (riga - **[AUDIT-ADV <data>] ...**) committando SOLO COORDINATION.md. Niente altri commit. Onesta brutale: se non trovi nulla di vero, dillo.'
else
  CAP=$CAP_AUDIT
  PROMPT='ultracode - Sei il CAPO-INGEGNERE di Ardesia (audit con potere di modifica). In ~/lessonos (motore Python, gate pytest) e ~/maestro-studio (UI TS/React, gate tsc+vitest): (1) leggi AGENTS.md, STATUS.md, MILESTONES.md, COORDINATION.md (kernel + pin), gli ultimi commit e i report adversarial; (2) esegui bash eval/gate.sh in ENTRAMBI i repo per conoscere il baseline VERO; (3) individua i 2-3 miglioramenti a piu alto valore (qualita codice, robustezza, coerenza UX/UI senza emoji, copertura test reale, igiene) e APPLICALI con rigore: scrivi codice+test NON tautologici, orchestra subagenti per parti indipendenti e per la verifica avversaria del tuo stesso diff, mantieni il gate VERDE, COMMITTA solo a gate verde (un commit per miglioramento, messaggio chiaro). VINCOLI ASSOLUTI: NON toccare eval/gate.sh ne indebolire i test; NON cambiare i pin in COORDINATION (li gestisce il supervisore); MAI contenuto del corpus nei commit; nessuna dipendenza nuova ingiustificata; se un cambiamento e rischioso o fuori scope, NON farlo e annotalo. (4) Scrivi un report onesto (numeri, niente emoji, VERIFICATO vs atteso) nel file indicato da $AUDIT_OUT. Onesta brutale: meglio 1 miglioramento vero e verificato che 5 dichiarati.'
fi

export AUDIT_OUT="$OUT"
echo "[audit] $MODE start $(date -u +%FT%TZ) modello=$MODEL cap=${CAP}s" | tee -a "$OUT"
timeout -k 60 -s INT "$CAP" env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$TOK" \
  claude -p --dangerously-skip-permissions --model "$MODEL" "$PROMPT" 2>&1 | tee -a "$OUT" || true
echo "[audit] $MODE done $(date -u +%FT%TZ)" | tee -a "$OUT"

SUMM=$(tail -c 600 "$OUT" | tr -d '\r')
bash "$HOME/maestro-tools/notify-telegram.sh" "Ardesia: $MODE completato (modello $MODEL). Report: maestro-logs/audit/${TS}-${MODE}.md. Loop ripreso." >/dev/null 2>&1 || true
