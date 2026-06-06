#!/bin/bash
# LessonOS build driver — Karpathy autoresearch RATCHET (bounded, side-project ELAB).
# Per iterazione: Hermes fa UNA modifica -> GATE FROZEN (eval/gate.sh) -> tieni se verde & non-regressivo, altrimenti git revert.
# Il DRIVER e' l'autorita del gate (Hermes non puo' barare). Appende la riga autorevole a RESEARCH.md.
# Pausa/stop: touch ~/lessonos/STOP   |   Uso: ~/lessonos/driver.sh [N]   (default 1)
set -uo pipefail
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || { echo "no ~/lessonos"; exit 1; }
N="${1:-1}"; LOG="$HOME/lessonos/driver.log"; RES="$HOME/lessonos/RESEARCH.md"
ITER_PROMPT='Progetto LessonOS in ~/lessonos. Leggi AGENTS.md (ordini), MILESTONES.md, e la CODA di RESEARCH.md + STATUS.md (la tua memoria: cosa gia provato, metrica, next, blocker). Esegui ESATTAMENTE UNA prossima task (la piu piccola verificabile) per AGENTS.md sez.3 e sez.9: PLAN -> BUILD con "./bin/build.sh" (Codex worker) -> REVIEW con "./bin/codex.sh" (Codex read-only) -> "uv run pytest -q" VERDE -> COMMIT locale -> aggiorna STATUS.md. UNA SOLA modifica/ipotesi. NON modificare eval/gate.sh ne i golden test (barare sul gate = fallimento). Se bloccato: scrivi il blocker in STATUS.md e FERMATI. NON COMPIACERE: "fatto" lo decide il gate, non tu.'
jget(){ printf '%s' "$1" | grep -oE "\"$2\":[0-9]+" | grep -oE '[0-9]+'; }
for i in $(seq 1 "$N"); do
  [ -f STOP ] && { echo "[driver] STOP — halt." | tee -a "$LOG"; break; }
  ts=$(date -u +%FT%TZ); bh=$(git rev-parse HEAD)
  bm=$(bash eval/gate.sh 2>/dev/null | tail -1); bp=$(jget "$bm" passed); bp=${bp:-0}
  echo "[driver] === iter $i/$N $ts | baseline passed=$bp ===" | tee -a "$LOG"
  hermes --yolo -z "$ITER_PROMPT" 2>&1 | tee -a "$LOG"
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
