#!/bin/bash
# MAESTRO/LessonOS — TICK (StartInterval launchd). Build Hermes bounded + digest SEMPRE (visibilità).
# v2 (10/06, Claude supervisore): routing repo attivo via ~/.maestro_active_repo (studio|lessonos) — lo gestisce Claude.
# GESTIONE TOKEN KIMI: NON tenta build se Kimi è esausto (circuit-breaker TPD) o cap raggiunto -> zero spreco. Pausa: touch STOP.
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || exit 0
if [ -f .tick.lock ] && kill -0 "$(cat .tick.lock 2>/dev/null)" 2>/dev/null; then echo "[tick] skip (in corso)"; exit 0; fi
echo $$ > .tick.lock; trap 'rm -f .tick.lock' EXIT
echo "[tick] === $(date -u +%FT%TZ) ==="
day=$(date -u +%F); cf="$HOME/lessonos/.builds_today"
[ "$(head -1 "$cf" 2>/dev/null)" = "$day" ] || printf '%s\n0\n' "$day" > "$cf"
bt=$(sed -n 2p "$cf" 2>/dev/null); bt=${bt:-0}; CAP="${LESSONOS_DAILY_CAP:-6}"
# gate TPD-aware: Kimi esausto (breaker non ancora resettato)? -> niente build (no spreco token/tempo)
kimi=$(python3 -c "import json,os,time;d=json.load(open(os.path.expanduser('~/.hermes/auth.json')));k=(d.get('credential_pool',{}).get('kimi-coding') or [{}])[0];ex=k.get('last_status')=='exhausted';r=k.get('last_error_reset_at') or 0;print('exhausted' if (ex and time.time()<r) else 'ok')" 2>/dev/null)
repo=$(cat "$HOME/.maestro_active_repo" 2>/dev/null || echo lessonos)
if [ -f STOP ]; then echo "[tick] STOP — solo digest"
elif [ "$kimi" = exhausted ]; then echo "[tick] Kimi TPD esausto (breaker) — salto build, solo digest"
elif [ "$bt" -ge "$CAP" ]; then echo "[tick] cap $CAP/giorno raggiunto — solo digest"
else
  echo "[tick] build $((bt+1))/$CAP (repo=$repo)"
  if [ "$repo" = "studio" ]; then
    ~/lessonos/driver-studio.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
  else
    ~/lessonos/driver-orch.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
  fi
  printf '%s\n%s\n' "$day" "$((bt+1))" > "$cf"
fi
~/lessonos/bin/hourly-digest.sh >> ~/lessonos/hourly.log 2>&1 || true
