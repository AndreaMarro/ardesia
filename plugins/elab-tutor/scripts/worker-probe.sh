#!/usr/bin/env bash
# worker-probe.sh — ELAB Tutor remote workers uptime probe.
#
# Scope (sett-3 Day 05, T1-003 carryover): smoke-check 3 critical workers
# and emit JSON-per-worker status to stdout + persist last run to
# automa/state/worker-probe-latest.json.
#
# Usage:
#   bash scripts/worker-probe.sh           # human summary + writes state
#   bash scripts/worker-probe.sh --json    # pure JSON array stdout
#   bash scripts/worker-probe.sh --timeout 10   # per-probe timeout seconds
#
# Exit code: 0 all 200, 1 any non-200 / timeout.
#
# Zero new deps — pure bash + curl (Option B constraint).

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="$REPO_ROOT/automa/state/worker-probe-latest.json"
TIMEOUT=8
JSON_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_ONLY=1; shift ;;
    --timeout) TIMEOUT="${2:-8}"; shift 2 ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
done

now_ms() {
  python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null \
    || date +%s000
}

probe() {
  local name="$1" url="$2" method="${3:-GET}" body="${4:-}" extra_header="${5:-}"
  local start_ms end_ms latency code
  start_ms=$(now_ms)
  local curl_opts=(-s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT")
  [[ -n "$extra_header" ]] && curl_opts+=(-H "$extra_header")
  if [[ "$method" == "POST" ]]; then
    code=$(curl "${curl_opts[@]}" -X POST "$url" \
      -H 'Content-Type: application/json' \
      -d "$body" 2>/dev/null || echo "000")
  else
    code=$(curl "${curl_opts[@]}" "$url" 2>/dev/null || echo "000")
  fi
  end_ms=$(now_ms)
  latency=$((end_ms - start_ms))
  local ok="false"
  [[ "$code" =~ ^2[0-9][0-9]$ ]] && ok="true"
  printf '{"worker":"%s","url":"%s","status_code":"%s","latency_ms":%d,"ok":%s,"timestamp":"%s"}' \
    "$name" "$url" "$code" "$latency" "$ok" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

# Supabase ANON key optional — picked from env if present (BLOCKER-ADR-003 CLI carry-over)
SB_AUTH=""
if [[ -n "${SUPABASE_ANON_KEY:-}" ]]; then
  SB_AUTH="apikey: ${SUPABASE_ANON_KEY}"
fi

results=()
results+=("$(probe 'nanobot-render' 'https://elab-galileo.onrender.com/health' 'GET')")
results+=("$(probe 'edge-tts-vps' 'http://72.60.129.50:8880/health' 'GET')")
results+=("$(probe 'supabase-unlim-chat' 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat' 'POST' '{"message":"probe"}' "$SB_AUTH")")

# Build JSON array
json="["
for i in "${!results[@]}"; do
  [[ $i -gt 0 ]] && json+=","
  json+="${results[$i]}"
done
json+="]"

# Exit code: 1 if any worker not ok
exit_code=0
echo "$json" | grep -q '"ok":false' && exit_code=1

if [[ "$JSON_ONLY" -eq 1 ]]; then
  echo "$json"
else
  echo "$json" > "$STATE_FILE" 2>/dev/null || true
  echo "=== worker-probe $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  for r in "${results[@]}"; do
    name=$(echo "$r" | sed -n 's/.*"worker":"\([^"]*\)".*/\1/p')
    code=$(echo "$r" | sed -n 's/.*"status_code":"\([^"]*\)".*/\1/p')
    lat=$(echo "$r" | sed -n 's/.*"latency_ms":\([0-9]*\).*/\1/p')
    ok=$(echo "$r" | grep -oE '"ok":(true|false)' | sed -n 's/.*:\(.*\)/\1/p')
    printf "%-22s %s  %6sms  ok=%s\n" "$name" "$code" "$lat" "$ok"
  done
  echo "persisted: $STATE_FILE"
  echo "exit=$exit_code"
fi

exit "$exit_code"
