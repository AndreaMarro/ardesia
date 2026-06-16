#!/bin/bash
# ARDESIA dead-man's-switch — proof-of-work monitor, INDEPENDENT of the loop.
# Own launchd (StartInterval 600s). Alerts Telegram (notify-telegram.sh) on:
#  (1) LIVENESS   : hourly.log stale (tick=300s) -> launchd/tick dead.
#  (2) DURABILITY : local auto/main ahead of github/auto/main -> GitHub mirror broke (regression guard).
#  (3) PRODUCTIVITY: zero commits in N hours, no STOP -> queue dry / builder dead.
# Non-blocking, de-duped per-condition (re-arm every 6h). Read-only on repos (only fetch).
# State in ~/maestro-logs/deadman (OUTSIDE repos -> survives driver `git reset --hard`/`git clean`).
set -uo pipefail
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
NOTIFY="$HOME/maestro-tools/notify-telegram.sh"
STATE="$HOME/maestro-logs/deadman"
mkdir -p "$STATE"
now=$(date +%s)
REARM=21600   # 6h re-alert window

alert(){  # $1=cond-key  $2=message
  local mk="$STATE/$1"; local last=0
  [ -f "$mk" ] && last=$(cat "$mk" 2>/dev/null || echo 0)
  if [ $((now-last)) -ge "$REARM" ]; then
    bash "$NOTIFY" "DEADMAN[$1]: $2" || true
    echo "$now" > "$mk"
    echo "$(date -u +%FT%TZ) ALERT $1 :: $2"
  fi
}
clear_cond(){ rm -f "$STATE/$1" 2>/dev/null || true; }

# (1) LIVENESS
LOG="$HOME/lessonos/hourly.log"
age=NA
if [ -f "$LOG" ]; then
  age=$(( now - $(stat -f %m "$LOG") ))
  if [ "$age" -gt 1200 ]; then alert liveness "tick fermo: hourly.log non scritto da ${age}s (>1200) - launchd/tick morto?"; else clear_cond liveness; fi
else
  alert liveness "hourly.log assente"
fi

# (2) DURABILITY — guards today's fix
for pair in "lessonos:$HOME/lessonos" "studio:$HOME/maestro-studio"; do
  name="${pair%%:*}"; dir="${pair#*:}"
  if ! git -C "$dir" fetch github --quiet 2>/dev/null; then
    alert "durfetch-$name" "fetch github fallito ($name) - auth/rete?"; continue
  fi
  ahead=$(git -C "$dir" rev-list --count github/auto/main..auto/main 2>/dev/null || echo 0)
  if [ "${ahead:-0}" -gt 3 ]; then
    alert "dur-$name" "$name: auto/main avanti di $ahead su github - mirror GitHub ROTTO (durabilita)"
  else
    clear_cond "dur-$name"; clear_cond "durfetch-$name"
  fi
done

# (3) PRODUCTIVITY
if [ -f "$HOME/lessonos/STOP" ]; then
  clear_cond productivity
else
  lc=$(git -C "$HOME/lessonos" log -1 --format=%ct auto/main 2>/dev/null || echo 0)
  sc=$(git -C "$HOME/maestro-studio" log -1 --format=%ct auto/main 2>/dev/null || echo 0)
  newest=$lc; [ "$sc" -gt "$newest" ] && newest=$sc
  stall=$(( now - newest ))
  if [ "$stall" -gt 43200 ]; then
    alert productivity "nessun commit lessonos/studio da $((stall/3600))h, no STOP - coda secca / builder morto?"
  else
    clear_cond productivity
  fi
fi
echo "$(date -u +%FT%TZ) deadman ok (liveness age=${age}s)"
