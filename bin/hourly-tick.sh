#!/bin/bash
# MAESTRO/LessonOS — TICK (StartInterval launchd). Build Hermes bounded + digest SEMPRE (visibilità).
# v3 (10/06, Claude supervisore): routing repo attivo via ~/.maestro_active_repo (studio|lessonos|alternate).
# "alternate" = un tick studio, un tick lessonos (flip su ~/.maestro_last_repo) — per M0 con T0-T3 e T4 in parallelo.
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
if [ "$repo" = "alternate" ]; then
  last=$(cat "$HOME/.maestro_last_repo" 2>/dev/null || echo lessonos)
  if [ "$last" = "studio" ]; then repo=lessonos; else repo=studio; fi
fi
if [ -f STOP ]; then echo "[tick] STOP — solo digest"
elif [ "$kimi" = exhausted ]; then echo "[tick] Kimi TPD esausto (breaker) — salto build, solo digest"
elif [ "$bt" -ge "$CAP" ]; then echo "[tick] cap $CAP/giorno raggiunto — solo digest"
else
  echo "[tick] build $((bt+1))/$CAP (repo=$repo)"
  echo "$repo" > "$HOME/.maestro_last_repo"
  if [ "$repo" = "both" ]; then
    # DUAL-LANE (ordine Andrea 11/06): entrambe le corsie in parallelo — repo e gate
    # indipendenti (pytest lessonos + vitest studio reggono insieme su M4).
    ~/lessonos/driver-orch.sh 1 >> ~/lessonos/hourly.log 2>&1 &
    P_ORCH=$!
    ~/lessonos/driver-studio.sh 1 >> ~/lessonos/hourly-studio.log 2>&1 &
    P_STUDIO=$!
    wait "$P_ORCH" 2>/dev/null; wait "$P_STUDIO" 2>/dev/null
  elif [ "$repo" = "studio" ]; then
    ~/lessonos/driver-studio.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
  else
    ~/lessonos/driver-orch.sh 1 >> ~/lessonos/hourly.log 2>&1 || true
  fi
  inc=1; [ "$repo" = "both" ] && inc=2
  printf '%s\n%s\n' "$day" "$((bt+inc))" > "$cf"
fi
# FABLE-CATCHUP (ordine Andrea 11/06 "fable a massima potenza"): quota appena
# riaperta -> burst fable = strategos audita la finestra quota-out e propone.
if [ -f "$HOME/.fable_catchup_pending" ] && bash "$HOME/lessonos/bin/acct.sh" pick >/dev/null 2>&1; then
  rm -f "$HOME/.fable_catchup_pending"
  echo "[tick] quota riaperta -> fable-catchup (skill-coach + retro-review + strategos)"
  # SINCRONO sotto lock: skill-coach scrive in skills/ e committa; strategos parte async da dentro.
  bash "$HOME/maestro-tools/fable-catchup.sh" >> ~/lessonos/hourly.log 2>&1 || true
fi
~/lessonos/bin/hourly-digest.sh >> ~/lessonos/hourly.log 2>&1 || true
# HERMES-2 (red-team kimi, idempotente per commit): rivede l'ultimo commit KEPT del repo del tick. Mai bloccante.
if [ "$repo" = "both" ]; then
  ~/lessonos/bin/adversarial.sh lessonos >> ~/lessonos/hourly.log 2>&1 || true
  ~/lessonos/bin/adversarial.sh studio >> ~/lessonos/hourly.log 2>&1 || true
else
  ~/lessonos/bin/adversarial.sh "$repo" >> ~/lessonos/hourly.log 2>&1 || true
fi
~/maestro-tools/evolution-collector.sh >> ~/lessonos/hourly.log 2>&1 || true
