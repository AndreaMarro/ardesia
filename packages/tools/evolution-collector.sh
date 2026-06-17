#!/bin/bash
# MAESTRO — EVOLUTION collector (deterministico, ZERO LLM). Gira a ogni tick.
# Appende UNO snapshot a ~/maestro-logs/evolution.jsonl: la base MISURABILE
# dell'auto-evoluzione (ordine Andrea 11/06). Niente parse LLM: solo conteggi
# verificabili. L'analisi semantica la fa STRATEGOS leggendo questo ledger.
set -u
OUT="$HOME/maestro-logs/evolution.jsonl"
mkdir -p "$HOME/maestro-logs"

g() { git -C "$1" "${@:2}" 2>/dev/null; }
n() { printf '%s' "${1:-0}" | tr -dc '0-9'; }

TS=$(date -u +%FT%TZ)
L="$HOME/lessonos"; S="$HOME/maestro-studio"

# Teste + commit nelle ultime 24h (volume di lavoro)
LH=$(g "$L" rev-parse --short HEAD); SH=$(g "$S" rev-parse --short HEAD)
LC24=$(g "$L" rev-list --count --since=24hours HEAD); SC24=$(g "$S" rev-list --count --since=24hours HEAD)

# SKILL: quante esistono, quante toccate negli ultimi 7g (auto-miglioramento)
LSK=$(ls "$L/skills/"*.md 2>/dev/null | wc -l | tr -d ' ')
SSK=$(ls "$S/skills/"*.md 2>/dev/null | wc -l | tr -d ' ')
LSK7=$(g "$L" log --since=7days --name-only --pretty=format: -- skills/ | grep -c '\.md$')
SSK7=$(g "$S" log --since=7days --name-only --pretty=format: -- skills/ | grep -c '\.md$')

# HERMES-2: report e CRITICI nelle ultime 24h (trend errori trovati dal red-team).
# "CRITICO:" col due-punti = marker per-finding del formato kimi — NON matcha "CRITICI: 0".
ADV24=$(find "$HOME/maestro-logs/adversarial" -name "2*.md" -mtime -1 2>/dev/null | wc -l | tr -d ' ')
CRIT24=$(find "$HOME/maestro-logs/adversarial" -name "2*.md" -mtime -1 -exec grep -l "CRITICO:" {} \; 2>/dev/null | wc -l | tr -d ' ')

# RICERCA: report deep-research prodotti (apprendimento dall'esterno)
RES7=$(find "$HOME/maestro-logs/research" -name "*.md" -mtime -7 2>/dev/null | wc -l | tr -d ' ')

# TRIAGE: voci di calibrazione del red-team (apprendimento del reviewer)
TRI=$(grep -c "^- " "$HOME/maestro-logs/adversarial/TRIAGE-FEEDBACK.md" 2>/dev/null || echo 0)

# GATE: ultimo esito noto PER REPO (hourly.log mescola entrambi: filtra per tag).
# Review #5: NON usare ${x:-0} — un log ruotato darebbe 0 = falso crollo -1400
# nel trend. Se non trovato ora, RIPORTA L'ULTIMO VALORE NOTO dal ledger (carry-
# forward) così il numero resta onesto e stantio anziché crollare a zero.
last_gate() { # $1 = chiave json (lessonos|studio)
  python3 - "$OUT" "$1" <<'PY' 2>/dev/null
import json, sys
try:
    rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
except Exception:
    print(""); raise SystemExit
for r in reversed(rows):
    v = (r.get(sys.argv[2]) or {}).get("gate_passed")
    if isinstance(v, int) and v > 0:
        print(v); raise SystemExit
print("")
PY
}
LGATE=$(grep '^\[orch\]' "$L/hourly.log" 2>/dev/null | grep -oE 'passed=[0-9]+' | tail -1 | grep -oE '[0-9]+')
SGATE=$(grep '^\[studio\]' "$L/hourly.log" 2>/dev/null | grep -oE 'passed=[0-9]+' | tail -1 | grep -oE '[0-9]+')
[ -n "$LGATE" ] || LGATE=$(last_gate lessonos)
[ -n "$SGATE" ] || SGATE=$(last_gate studio)

# gate_passed: numero se noto, altrimenti null (mai 0 falso). gate_stale=1 se
# carry-forward (il valore non viene dall'ultimo tick di QUEL repo).
LGV=$([ -n "$LGATE" ] && printf '%s' "$(n "$LGATE")" || printf 'null')
SGV=$([ -n "$SGATE" ] && printf '%s' "$(n "$SGATE")" || printf 'null')
printf '{"ts":"%s","lessonos":{"head":"%s","commits_24h":%s,"skills":%s,"skills_touched_7d":%s,"gate_passed":%s},"studio":{"head":"%s","commits_24h":%s,"skills":%s,"skills_touched_7d":%s,"gate_passed":%s},"hermes2":{"reports_24h":%s,"with_criticals_24h":%s},"research_reports_7d":%s,"triage_entries":%s}\n' \
  "$TS" "${LH:-?}" "$(n "$LC24")" "$(n "$LSK")" "$(n "$LSK7")" "$LGV" \
  "${SH:-?}" "$(n "$SC24")" "$(n "$SSK")" "$(n "$SSK7")" "$SGV" \
  "$(n "$ADV24")" "$(n "$CRIT24")" "$(n "$RES7")" "$(n "$TRI")" >> "$OUT"
