#!/bin/bash
# LessonOS autonomous build driver — runs Hermes for N BOUNDED iterations.
# Each iteration = ONE task (plan -> Opus -> Codex -> pytest -> commit -> log) per AGENTS.md sez.3.
# Pause/stop anytime:  touch ~/lessonos/STOP
# Usage:  ~/lessonos/driver.sh [N]      (default N=1)
set -uo pipefail
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || { echo "no ~/lessonos"; exit 1; }
N="${1:-1}"
LOG="$HOME/lessonos/driver.log"
ITER_PROMPT='Progetto LessonOS in ~/lessonos. Leggi AGENTS.md (i tuoi ordini), MILESTONES.md, STATUS.md. Esegui ESATTAMENTE UNA prossima task seguendo la pipeline AGENTS.md sez.3: PLAN -> delega BUILD a "claude -p --model claude-opus-4-8" -> REVIEW con "codex exec --model gpt-5.5 -c model_reasoning_effort=high" -> VERIFY "uv run pytest -q" VERDE -> COMMIT locale -> LOG (STATUS.md + log.jsonl) -> "git push origin main". UNA SOLA task, la piu piccola. Se bloccato, scrivi il blocker in STATUS.md e FERMATI. NON COMPIACERE: nessun claim non verificato, "fatto" solo se pytest e verde.'
for i in $(seq 1 "$N"); do
  if [ -f STOP ]; then echo "[driver] STOP presente — halt." | tee -a "$LOG"; break; fi
  ts=$(date -u +%FT%TZ)
  echo "[driver] === iter $i/$N $ts ===" | tee -a "$LOG"
  hermes --yolo -z "$ITER_PROMPT" 2>&1 | tee -a "$LOG"
  echo "[driver] --- end iter $i ---" | tee -a "$LOG"
done
echo "[driver] done $(date -u +%FT%TZ)." | tee -a "$LOG"
