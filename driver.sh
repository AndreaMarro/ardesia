#!/bin/bash
# LessonOS build driver — Karpathy autoresearch RATCHET (bounded, side-project ELAB).
# Per iterazione: Hermes fa UNA modifica -> GATE FROZEN (eval/gate.sh) -> tieni se verde & non-regressivo, altrimenti git revert.
# Il DRIVER e' l'autorita del gate (Hermes non puo' barare). Appende la riga autorevole a RESEARCH.md.
# Pausa/stop: touch ~/lessonos/STOP   |   Uso: ~/lessonos/driver.sh [N]   (default 1)
set -uo pipefail
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || { echo "no ~/lessonos"; exit 1; }
N="${1:-1}"; LOG="$HOME/lessonos/driver.log"; RES="$HOME/lessonos/RESEARCH.md"
ITER_PROMPT='Stai costruendo LessonOS (motore didattico Python headless) nella dir corrente. Leggi AGENTS.md (ordini+vincoli+regole autoresearch sez.9), MILESTONES.md, la CODA di RESEARCH.md e STATUS.md (memoria: cosa gia provato, metrica, next, blocker). Fai ESATTAMENTE UNA prossima task (la piu piccola verificabile): implementala + il suo test pytest. Auto-rivediti criticamente PRIMA di committare (bug? test fasulli/tautologici? scope creep oltre il motore headless? piu di 1 ipotesi?). Lancia "uv run pytest -q": DEVE essere VERDE. Poi commit locale (messaggio chiaro) + appendi la tua narrativa a STATUS.md. UNA SOLA task/ipotesi. NON modificare eval/gate.sh ne indebolire i test per far passare il gate. Se bloccato scrivi il blocker in STATUS.md e fermati. NON COMPIACERE: "fatto" = pytest VERDE, non dichiarato.'
jget(){ printf '%s' "$1" | grep -oE "\"$2\":[0-9]+" | grep -oE '[0-9]+'; }
for i in $(seq 1 "$N"); do
  [ -f STOP ] && { echo "[driver] STOP — halt." | tee -a "$LOG"; break; }
  ts=$(date -u +%FT%TZ); bh=$(git rev-parse HEAD)
  bm=$(bash eval/gate.sh 2>/dev/null | tail -1); bp=$(jget "$bm" passed); bp=${bp:-0}
  echo "[driver] === iter $i/$N $ts | baseline passed=$bp ===" | tee -a "$LOG"
  ./bin/opus.sh "$ITER_PROMPT" 2>&1 | tee -a "$LOG"
  ah=$(git rev-parse HEAD); am=$(bash eval/gate.sh 2>/dev/null | tail -1)
  ap=$(jget "$am" passed); ap=${ap:-0}; ae=$(jget "$am" exit); ae=${ae:-1}
  if [ "$ah" = "$bh" ]; then status="blocked/noop"; note="HEAD invariato — vedi STATUS.md"
  elif [ "$ae" = 0 ] && [ "$ap" -ge 1 ] && [ "$ap" -ge "$bp" ]; then
    status="pass"; note="kept; gate verde (passed=$ap)"; git push -q origin main 2>/dev/null || true
  else
    status="REVERT"; note="gate rosso/regresso (exit=$ae passed $bp->$ap) -> reset"; git reset --hard "$bh" >/dev/null 2>&1 || true
  fi
  printf '| %s | %s | %s | %s | %s | %s | %s |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$ap" "$([ "${ae:-1}" = 0 ] && echo y || echo n)" "$status" "$note" >> "$RES"
  echo "[driver] --- iter $i: $status ($note) ---" | tee -a "$LOG"
done
echo "[driver] done $(date -u +%FT%TZ)." | tee -a "$LOG"
