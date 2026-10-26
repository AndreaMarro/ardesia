#!/usr/bin/env bash
set -euo pipefail
s19_root=$(cd "$(dirname "$0")/../../.." && pwd)
: "${S19_PYTHON:?Set S19_PYTHON to the prepared Python environment}"
# Each viewport gets a fresh DB/server so 32 synthetic logins do not consume
# the shared default 30-request auth bucket. Product rate limits stay unchanged.
if [ "$#" -eq 0 ] && [ "${S19_PRODUCT:-0}" != 1 ]; then
  "$0" --project=desktop
  "$0" --project=touch
  exit
fi
s19_run=$(mktemp -d "${TMPDIR:-/tmp}/s19-browser.XXXXXX")
cd "$s19_root"
if curl -fsS http://127.0.0.1:5198/study/health >/dev/null 2>&1; then
  printf '%s\n' 'S19 port 5198 is already in use; no other process will be stopped.' >&2
  rm -rf "$s19_run"
  exit 1
fi
"$S19_PYTHON" plugins/s19-circuit-lab/scripts/serve_candidate.py --data "$s19_run/data" --port 5198 > "$s19_run/server.log" 2>&1 &
s19_server=$!
trap 'kill "$s19_server" 2>/dev/null || true; wait "$s19_server" 2>/dev/null || true; rm -rf "$s19_run"' EXIT
for s19_attempt in $(seq 1 100); do
  if [ -f "$s19_run/data/synthetic-sessions.json" ] && curl -fsS http://127.0.0.1:5198/study/health >/dev/null 2>&1; then break; fi
  if ! kill -0 "$s19_server" 2>/dev/null; then cat "$s19_run/server.log"; exit 1; fi
  sleep 0.1
done
export S19_SESSION_FILE="$s19_run/data/synthetic-sessions.json"
npm --prefix plugins/s19-circuit-lab/web test -- "$@"
