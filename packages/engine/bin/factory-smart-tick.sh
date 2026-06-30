#!/usr/bin/env bash
set -euo pipefail
CMD="${1:-hook}"
S="$HOME/lessonos/.factory-smart"
L="$HOME/maestro-logs/factory-smart"
BIN="$HOME/lessonos/bin"
ORCH="${ARDESIA_DUAL_ORCH:-$BIN/hermes-dual-orchestrator.sh}"
MEM="$BIN/agentmemory-bridge.sh"
AUTO="${ARDESIA_SMART_AUTO_TICKS:-8}"
CODEX_CAP="${ARDESIA_SMART_CODEX_DAILY_CAP:-2}"
MINIMAX_CAP="${ARDESIA_SMART_MINIMAX_DAILY_CAP:-8}"
FANOUT_EVERY="${ARDESIA_SMART_FANOUT_EVERY:-4}"
mkdir -p "$S" "$L"

num(){ local f="$1" d="${2:-0}" n; n="$(cat "$f" 2>/dev/null || echo "$d")"; case "$n" in ''|*[!0-9]*) n="$d";; esac; echo "$n"; }
put(){ printf '%s\n' "$2" > "$1"; }
log(){ printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" >> "$L/smart-$(date -u +%F).log"; }
reset_day(){ local d old; d="$(date -u +%F)"; old="$(cat "$S/day" 2>/dev/null || true)"; if [ "$d" != "$old" ]; then put "$S/day" "$d"; put "$S/codex" 0; put "$S/minimax" 0; fi; }
seed(){ [ -f "$S/disabled" ] && return 0; [ -f "$S/seeded" ] && return 0; [ -f "$S/rem" ] && return 0; case "$AUTO" in ''|*[!0-9]*) AUTO=8;; esac; put "$S/rem" "$AUTO"; date -u +%FT%TZ > "$S/seeded"; log "auto-armed ticks=$AUTO"; }
repo_name(){ local r; r="$(cat "$HOME/.maestro_active_repo" 2>/dev/null || echo lessonos)"; [ "$r" = alternate ] && r="$(cat "$HOME/.maestro_last_repo" 2>/dev/null || echo lessonos)"; [ "$r" = studio ] && echo studio || echo lessonos; }
repo_path(){ [ "$1" = studio ] && echo "$HOME/maestro-studio" || echo "$HOME/lessonos"; }
task_line(){ local rn="$1" line; line="$(grep -m1 -- "- \*\*$rn\*\*" "$HOME/lessonos/COORDINATION.md" 2>/dev/null || true)"; [ -n "$line" ] && echo "$line" || echo "review factory progress and risks"; }
inc(){ local f="$S/$1"; put "$f" "$(( $(num "$f" 0) + 1 ))"; }
choose(){ local t seq c m; t="$(echo "$1" | tr '[:upper:]' '[:lower:]')"; seq="$2"; c="$(num "$S/codex" 0)"; m="$(num "$S/minimax" 0)"; if echo "$t" | grep -Eq 'driver|gate|ci|deploy|schema|contract|race|regression|critical|bug|failing'; then [ "$c" -lt "$CODEX_CAP" ] && echo codex || echo minimax; elif echo "$t" | grep -Eq 'docs|audit|map|inventory|research|churn|triage'; then [ "$m" -lt "$MINIMAX_CAP" ] && echo minimax || echo codex; elif [ $((seq % 3)) -eq 0 ] && [ "$c" -lt "$CODEX_CAP" ]; then echo codex; else echo minimax; fi; }
run_lane(){ local lane="$1" task="$2" rp="$3"; case "$lane" in codex) bash "$ORCH" codex-review "$task" "$rp";; minimax) bash "$ORCH" minimax-review "$task" "$rp";; fanout) bash "$ORCH" fanout-review "$task" "$rp";; esac; }
hook(){ reset_day; seed; local rem seq rn rp sha base mem lane sig next task rc fan; rem="$(num "$S/rem" 0)"; [ "$rem" -gt 0 ] || exit 0; next=$((rem-1)); put "$S/rem" "$next"; seq="$(( $(num "$S/seq" 0) + 1 ))"; put "$S/seq" "$seq"; rn="$(repo_name)"; rp="$(repo_path "$rn")"; [ -d "$rp/.git" ] || { log "skip no repo $rp"; exit 0; }; sha="$(git -C "$rp" rev-parse --short HEAD 2>/dev/null || echo unknown)"; base="$(task_line "$rn")"; mem="$(bash "$MEM" recall "$rn $sha $base" 2>/dev/null | head -c 1200 || true)"; lane="$(choose "$base" "$seq")"; sig="$rn:$sha:$lane"; if grep -qxF "$sig" "$S/reviewed" 2>/dev/null; then log "skip duplicate $sig remaining=$next"; exit 0; fi; task="repo=$rn sha=$sha lane=$lane memory=${mem:-none} context=$base. Prefer the smallest useful analysis. Do not edit files."; fan=0; [ "$FANOUT_EVERY" -gt 0 ] && [ $((seq % FANOUT_EVERY)) -eq 0 ] && fan=1; rc=0; log "start seq=$seq repo=$rn sha=$sha lane=$lane fanout=$fan remaining=$next"; if [ "$fan" -eq 1 ]; then run_lane fanout "$task" "$rp" || rc=$?; inc codex; inc minimax; else run_lane "$lane" "$task" "$rp" || rc=$?; inc "$lane"; fi; echo "$sig" >> "$S/reviewed"; bash "$MEM" remember "factory-smart seq=$seq repo=$rn sha=$sha lane=$lane exit=$rc" >/dev/null 2>&1 || true; log "done seq=$seq lane=$lane exit=$rc remaining=$next"; }
case "$CMD" in hook) hook;; arm) put "$S/rem" "${1:-8}"; rm -f "$S/disabled"; log "armed ${1:-8}";; disarm) put "$S/rem" 0; date -u +%FT%TZ > "$S/disabled"; log disarmed;; status) echo "remaining=$(num "$S/rem" 0) seq=$(num "$S/seq" 0) codex=$(num "$S/codex" 0) minimax=$(num "$S/minimax" 0)";; *) echo "usage: $0 hook|arm N|disarm|status" >&2; exit 2;; esac
