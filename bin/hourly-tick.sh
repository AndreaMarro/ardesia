#!/bin/bash
# LessonOS — TICK ORARIO (launchd). Build claude -p bounded (cap giornaliero) + digest SEMPRE (visibilità oraria).
# OpenAI-free (worker = claude -p, Claude Max flat-cost). Pausa: touch ~/lessonos/STOP
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || exit 0
# no-overlap lock
if [ -f .tick.lock ] && kill -0 "$(cat .tick.lock 2>/dev/null)" 2>/dev/null; then
  echo "[tick] precedente ancora in corso — skip $(date -u +%FT%TZ)"; exit 0
fi
echo $$ > .tick.lock; trap 'rm -f .tick.lock' EXIT
echo "[tick] === $(date -u +%FT%TZ) ==="
# cap giornaliero build (costi/rate-limit bounded); il digest gira comunque
day=$(date -u +%F); cf="$HOME/lessonos/.builds_today"
[ "$(head -1 "$cf" 2>/dev/null)" = "$day" ] || printf '%s\n0\n' "$day" > "$cf"
bt=$(sed -n 2p "$cf" 2>/dev/null); bt=${bt:-0}; CAP="${LESSONOS_DAILY_CAP:-6}"
if [ ! -f STOP ] && [ "$bt" -lt "$CAP" ]; then
  echo "[tick] build $((bt+1))/$CAP (claude -p)"
  ~/lessonos/driver.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
  printf '%s\n%s\n' "$day" "$((bt+1))" > "$cf"
else
  echo "[tick] build skip (STOP o cap $CAP raggiunto) — solo digest"
fi
~/lessonos/bin/hourly-digest.sh >> ~/lessonos/hourly.log 2>&1 || true
