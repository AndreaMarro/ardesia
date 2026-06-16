#!/bin/bash
# MAESTRO — EVOLUTION report (deterministico): trend leggibili dal ledger.
# Usato dal comando Telegram `evoluzione` e da STRATEGOS come input.
set -u
LED="$HOME/maestro-logs/evolution.jsonl"
[ -s "$LED" ] || { echo "Ledger evoluzione vuoto (parte col prossimo tick)."; exit 0; }

python3 - "$LED" <<'PY'
import json, sys
rows = []
for line in open(sys.argv[1], encoding="utf-8"):
    try:
        rows.append(json.loads(line))
    except Exception:
        continue
if not rows:
    print("Ledger evoluzione illeggibile."); raise SystemExit
last = rows[-1]
day_ago = [r for r in rows[-72:]]  # ~24h di tick (ogni 20min) come finestra
first = day_ago[0]

def d(path, row):
    cur = row
    for k in path.split("."):
        cur = cur.get(k, {}) if isinstance(cur, dict) else 0
    return cur if isinstance(cur, int) else 0

print("📈 EVOLUZIONE MISURABILE (ledger: %d snapshot)" % len(rows))
print("— lessonos: gate %d test · %d commit/24h · skill %d (%d toccate/7g)" % (
    d("lessonos.gate_passed", last), d("lessonos.commits_24h", last),
    d("lessonos.skills", last), d("lessonos.skills_touched_7d", last)))
print("— studio:   gate %d test · %d commit/24h · skill %d (%d toccate/7g)" % (
    d("studio.gate_passed", last), d("studio.commits_24h", last),
    d("studio.skills", last), d("studio.skills_touched_7d", last)))
print("— red-team: %d report/24h, %d con CRITICI · calibrazione triage: %d voci" % (
    d("hermes2.reports_24h", last), d("hermes2.with_criticals_24h", last), d("triage_entries", last)))
print("— ricerca:  %d report deep-research/7g" % d("research_reports_7d", last))
dg = d("lessonos.gate_passed", last) - d("lessonos.gate_passed", first)
dc = d("hermes2.with_criticals_24h", last) - d("hermes2.with_criticals_24h", first)
print("— delta finestra: gate %+d test · critici/24h %+d (critici in calo = il sistema impara)" % (dg, dc))
PY
