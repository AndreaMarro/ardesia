#!/usr/bin/env bash
# MAESTRO — routing quota-aware (quota Max CONDIVISA fable/opus/sonnet via OAuth).
# La finestra di reset e' NEL testo di errore: "You're out of extra usage · resets 10:50am".
# Uso:
#   ... | bash bin/quota.sh mark   # legge STDIN, estrae "resets HH:MM(am|pm)", scrive epoch
#                                  # in ~/.fable_quota_until (senza orario: now+60min conservativo)
#   bash bin/quota.sh check        # exit 0 = quota disponibile; exit 1 = quota-out (stampa minuti)
set -euo pipefail
# Account-aware (multi-account 11/06): A1 = file legacy, A2 = suffisso .A2.
ACC="${2:-A1}"
case "$ACC" in
  A2) F="$HOME/.fable_quota_until.A2" ;;
  A3) F="$HOME/.fable_quota_until.A3" ;;
  *)  F="$HOME/.fable_quota_until" ;;
esac
case "${1:-}" in
  mark)
    QTXT="$(tail -c 4000 || true)" F="$F" python3 - <<'PY'
import datetime as dt
import os
import re

f = os.environ["F"]
text = os.environ.get("QTXT", "")
m = re.search(r"resets\s+(\d{1,2}):(\d{2})\s*(am|pm)", text, re.I)
now = dt.datetime.now()
if m:
    h, mnt, ap = int(m.group(1)), int(m.group(2)), m.group(3).lower()
    if ap == "pm" and h != 12:
        h += 12
    if ap == "am" and h == 12:
        h = 0
    t = now.replace(hour=h, minute=mnt, second=0, microsecond=0)
    if t <= now:
        t += dt.timedelta(days=1)
else:
    t = now + dt.timedelta(hours=1)
with open(f, "w") as fh:
    fh.write(str(int(t.timestamp())))
print(f"[quota] out fino alle {t:%H:%M}")
PY
    touch "$HOME/.fable_catchup_pending"
    ;;
  check)
    [ -f "$F" ] || exit 0
    u=$(cat "$F" 2>/dev/null || echo 0)
    case "$u" in
      ''|*[!0-9]*) rm -f "$F"; exit 0;;
    esac
    n=$(date +%s)
    if [ "$n" -ge "$u" ]; then rm -f "$F"; exit 0; fi
    echo "[quota] out, $(( (u - n) / 60 ))min al reset"
    exit 1
    ;;
  *)
    echo "uso: quota.sh mark [A1|A2] (testo su stdin) | check [A1|A2]" >&2
    exit 2
    ;;
esac
