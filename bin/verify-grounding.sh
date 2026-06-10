#!/bin/bash
# T6R anti-false-verde GATE on REAL data (graph/grounding.py policy mirror).
# Fails (exit 1) if MORE than 20% of a lesson's persisted evidence excerpts are
# NULL/empty — the structural check that would have caught the Terza-lezione
# false-verde (80/80 NULL passed as genuine). Run before any M0 ratification.
#
# Usage:  bin/verify-grounding.sh <lesson_id> [<lesson_id> ...]
#         bin/verify-grounding.sh --all          # every lesson in the DB
# Env:    DB_PATH (default corpus DB), MAX_UNVERIFIED_RATIO (default 0.20)
# Portable: bash 3.2 (no mapfile), exit 2 on usage/DB error, 1 on threshold.
set -u
DB="${DB_PATH:-$HOME/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
MAX="${MAX_UNVERIFIED_RATIO:-0.20}"

[ -f "$DB" ] || { echo "verify-grounding: DB non trovato: $DB" >&2; exit 2; }

lessons=""
if [ "${1:-}" = "--all" ]; then
  lessons=$(sqlite3 "$DB" "SELECT DISTINCT lesson_id FROM evidence ORDER BY lesson_id;")
elif [ "$#" -ge 1 ]; then
  lessons=$(printf '%s\n' "$@")
else
  echo "uso: verify-grounding.sh <lesson_id>... | --all" >&2; exit 2
fi

rc=0
while IFS= read -r lesson; do
  [ -n "$lesson" ] || continue
  counts=$(sqlite3 -separator ' ' "$DB" \
    "SELECT COUNT(*), COALESCE(SUM(CASE WHEN excerpt IS NULL OR excerpt='' THEN 1 ELSE 0 END),0) \
     FROM evidence WHERE lesson_id='$lesson';")
  total=$(printf '%s' "$counts" | awk '{print $1}'); total=${total:-0}
  nullc=$(printf '%s' "$counts" | awk '{print $2}'); nullc=${nullc:-0}
  if python3 - "$lesson" "$total" "$nullc" "$MAX" <<'PY'
import sys
lesson, total, nullc, mx = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
ratio = (nullc / total) if total else 0.0
ok = ratio <= mx
print("%s %s %d/%d unverified (%.0f%% vs <= %.0f%%)"
      % ("PASS" if ok else "FAIL", lesson, nullc, total, ratio * 100, mx * 100))
sys.exit(0 if ok else 1)
PY
  then :; else rc=1; fi
done <<EOF
$lessons
EOF

if [ "$rc" -ne 0 ]; then
  echo "verify-grounding: ALMENO UNA lezione sotto soglia di grounding — ratifica BLOCCATA" >&2
fi
exit "$rc"
