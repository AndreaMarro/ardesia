#!/bin/bash
# LessonOS — TICK ORARIO (lo lancia launchd). 1 iterazione orchestratore bounded + digest ad Andrea.
# Costi contenuti: il driver ha CAP giornaliero + STOP; se cap raggiunto/STOP, l'iterazione e' no-op (solo digest).
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || exit 0
# evita sovrapposizioni se un tick precedente e' ancora in corso
if [ -f .tick.lock ] && kill -0 "$(cat .tick.lock 2>/dev/null)" 2>/dev/null; then
  echo "[tick] precedente ancora in corso — skip $(date -u +%FT%TZ)"; exit 0
fi
echo $$ > .tick.lock
trap 'rm -f .tick.lock' EXIT
echo "[tick] === $(date -u +%FT%TZ) ==="
~/lessonos/driver-orch.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
~/lessonos/bin/hourly-digest.sh >> ~/lessonos/hourly.log 2>&1 || true
