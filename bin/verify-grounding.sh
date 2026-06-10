#!/bin/bash
# T6R anti-false-verde GATE on REAL data (graph/grounding.py policy mirror).
# FAIL-CLOSED (deepreview B3): una lezione fallisce se
#   (a) >20% delle evidence ha excerpt NULL/vuoto O NON-VERBATIM (excerpt che
#       non e' piu' sottostringa del testo del segmento citato — JOIN INSTR);
#   (b) la lezione ha ZERO evidence (niente da verificare = FAIL, non PASS);
#   (c) sqlite restituisce errore (mai PASS su errore).
#
# Usage:  bin/verify-grounding.sh <lesson_id> [<lesson_id> ...]
#         bin/verify-grounding.sh --all          # every lesson in the DB
# Env:    DB_PATH (default corpus DB), MAX_UNVERIFIED_RATIO (default 0.20)
# Portable: bash 3.2 (no mapfile). Exit: 0 ok, 1 sotto soglia/zero/errore, 2 uso.
set -u
DB="${DB_PATH:-$HOME/maestro-data/teoria-segnali-2021/derived/db/lessonos.db}"
MAX="${MAX_UNVERIFIED_RATIO:-0.20}"

[ -f "$DB" ] || { echo "verify-grounding: DB non trovato: $DB" >&2; exit 2; }

lessons=""
if [ "${1:-}" = "--all" ]; then
  lessons=$(sqlite3 "$DB" "SELECT DISTINCT lesson_id FROM evidence ORDER BY lesson_id;") || {
    echo "verify-grounding: errore sqlite nel listare le lezioni — FAIL-CLOSED" >&2; exit 1; }
elif [ "$#" -ge 1 ]; then
  lessons=$(printf '%s\n' "$@")
else
  echo "uso: verify-grounding.sh <lesson_id>... | --all" >&2; exit 2
fi

rc=0
while IFS= read -r lesson; do
  [ -n "$lesson" ] || continue
  # total | null/empty | non-verbatim (excerpt presente ma NON sottostringa del
  # testo del segmento citato; seg mancante = non-verbatim). INSTR e' literal.
  counts=$(sqlite3 -separator ' ' "$DB" "
    SELECT COUNT(*),
           COALESCE(SUM(CASE WHEN e.excerpt IS NULL OR e.excerpt='' THEN 1 ELSE 0 END),0),
           COALESCE(SUM(CASE WHEN e.excerpt IS NOT NULL AND e.excerpt!=''
                              AND (s.seg_id IS NULL OR INSTR(s.text, e.excerpt)=0)
                         THEN 1 ELSE 0 END),0)
    FROM evidence e LEFT JOIN segments s ON s.seg_id = e.seg_id
    WHERE e.lesson_id='$lesson';") || {
    echo "FAIL $lesson — errore sqlite (fail-closed)"; rc=1; continue; }
  total=$(printf '%s' "$counts" | awk '{print $1}'); total=${total:-0}
  nullc=$(printf '%s' "$counts" | awk '{print $2}'); nullc=${nullc:-0}
  nonverb=$(printf '%s' "$counts" | awk '{print $3}'); nonverb=${nonverb:-0}
  if python3 - "$lesson" "$total" "$nullc" "$nonverb" "$MAX" <<'PY'
import sys
lesson, total, nullc, nonverb, mx = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5])
if total == 0:
    print(f"FAIL {lesson} 0 evidence — niente da verificare NON è un PASS (fail-closed)")
    sys.exit(1)
unv = nullc + nonverb
ratio = unv / total
ok = ratio <= mx
print("%s %s %d/%d unverified (%d null + %d non-verbatim, %.0f%% vs <= %.0f%%)"
      % ("PASS" if ok else "FAIL", lesson, unv, total, nullc, nonverb, ratio * 100, mx * 100))
sys.exit(0 if ok else 1)
PY
  then :; else rc=1; fi
done <<EOF
$lessons
EOF

if [ "$rc" -ne 0 ]; then
  echo "verify-grounding: ALMENO UNA lezione sotto soglia/zero/errore — ratifica BLOCCATA" >&2
fi
exit "$rc"
