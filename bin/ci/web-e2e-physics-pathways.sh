#!/usr/bin/env bash
# Teacher physics-pathway browser proof against the real Study API on disposable
# SQLite. Reuses the existing synthetic fixture, Vite proxy and Playwright spec.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON="${ARDESIA_STUDY_PYTHON:-$ROOT/services/study-api/.venv/bin/python}"
if [ ! -x "$PYTHON" ]; then
  PYTHON="$(command -v python3 || true)"
fi
if [ -z "$PYTHON" ] || ! "$PYTHON" -c 'import pypdf, uvicorn' >/dev/null 2>&1; then
  echo "BLOCCO  serve un Python con pypdf e uvicorn (ARDESIA_STUDY_PYTHON)." >&2
  exit 2
fi

API_PORT=5321
WEB_PORT=5320
ARTIFACTS="${ARDESIA_E2E_ARTIFACTS:-$ROOT/apps/web/test-results/physics-pathways}"
rm -rf "$ARTIFACTS"
mkdir -p "$ARTIFACTS"

CREATED_QA=0
if [ -n "${ARDESIA_E2E_DATA_DIR:-}" ]; then
  QA_DIR="$ARDESIA_E2E_DATA_DIR"
  mkdir -p "$QA_DIR"
else
  QA_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ardesia-physics-pathways.XXXXXX")"
  CREATED_QA=1
fi
chmod 700 "$QA_DIR"

API_LOG="$ARTIFACTS/api.log"
WEB_LOG="$ARTIFACTS/web.log"
SEED_LOG="$ARTIFACTS/seed.log"
API_PID=""
WEB_PID=""

stop_pid() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  kill -0 "$pid" 2>/dev/null || return 0
  kill "$pid" 2>/dev/null || true
  for _ in $(seq 1 50); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.1
  done
  kill -9 "$pid" 2>/dev/null || true
}

cleanup() {
  local rc=$?
  trap - EXIT INT TERM
  stop_pid "$WEB_PID"
  stop_pid "$API_PID"
  if [ "$CREATED_QA" -eq 1 ]; then
    rm -rf "$QA_DIR"
  fi
  exit "$rc"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# A fixed API port is part of the reused Vite proxy. Refuse an occupied socket
# instead of silently testing somebody else's process.
if ! "$PYTHON" - "$API_PORT" "$WEB_PORT" <<'PY'
import socket, sys
for port in sys.argv[1:]:
    with socket.socket() as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        probe.bind(("127.0.0.1", int(port)))
PY
then
  echo "BLOCCO  porta $API_PORT o $WEB_PORT gia' occupata." >&2
  exit 2
fi

export PYTHONPATH="$ROOT/packages/engine:$ROOT/services/study-api${PYTHONPATH:+:$PYTHONPATH}"
export PYTHONUNBUFFERED=1

"$PYTHON" "$ROOT/bin/study-demo/seed_course_capabilities.py" \
  --data-dir "$QA_DIR" >"$SEED_LOG" 2>&1
if [ ! -s "$QA_DIR/study.sqlite" ] || [ ! -s "$QA_DIR/demo-access.json" ]; then
  echo "BLOCCO  fixture sintetica incompleta." >&2
  exit 1
fi

"$PYTHON" "$ROOT/bin/study-demo/serve.py" \
  --data-dir "$QA_DIR" --no-seed --no-frontend --port "$API_PORT" \
  >"$API_LOG" 2>&1 &
API_PID=$!
disown "$API_PID" 2>/dev/null || true

wait_for_api() {
  for _ in $(seq 1 100); do
    if curl -fsS "http://127.0.0.1:$API_PORT/study/health" \
      -o "$ARTIFACTS/health-api.json" 2>/dev/null &&
      "$PYTHON" -c 'import json,sys; h=json.load(open(sys.argv[1])); sys.exit(0 if h.get("ok") is True and h.get("synthetic") is True and h.get("persistence")=="sqlite" and h.get("authentication")=="synthetic_session" and h.get("processId")==int(sys.argv[2]) else 1)' \
        "$ARTIFACTS/health-api.json" "$API_PID"; then
      return 0
    fi
    if ! kill -0 "$API_PID" 2>/dev/null; then
      echo "BLOCCO  il servizio Study API e' uscito durante l'avvio." >&2
      return 1
    fi
    sleep 0.2
  done
  echo "BLOCCO  Study API non pronto su 127.0.0.1:$API_PORT." >&2
  return 1
}
wait_for_api || exit 1

node "$ROOT/node_modules/vite/bin/vite.js" "$ROOT/apps/web" \
  --host 127.0.0.1 --port "$WEB_PORT" --strictPort >"$WEB_LOG" 2>&1 &
WEB_PID=$!
disown "$WEB_PID" 2>/dev/null || true

wait_for_web() {
  for _ in $(seq 1 100); do
    if curl -fsS "http://127.0.0.1:$WEB_PORT/" -o /dev/null 2>/dev/null &&
      curl -fsS "http://127.0.0.1:$WEB_PORT/study/health" \
        -o "$ARTIFACTS/health-web.json" 2>/dev/null &&
      "$PYTHON" -c 'import json,sys; h=json.load(open(sys.argv[1])); sys.exit(0 if h.get("processId")==int(sys.argv[2]) else 1)' \
        "$ARTIFACTS/health-web.json" "$API_PID"; then
      return 0
    fi
    if ! kill -0 "$WEB_PID" 2>/dev/null; then
      echo "BLOCCO  Vite e' uscito durante l'avvio." >&2
      return 1
    fi
    sleep 0.2
  done
  echo "BLOCCO  anteprima Web non pronta su 127.0.0.1:$WEB_PORT." >&2
  return 1
}
wait_for_web || exit 1

set +e
(
  cd "$ROOT"
  ARDESIA_WEB_URL="http://127.0.0.1:$WEB_PORT" \
  ARDESIA_DEMO_ACCESS="$QA_DIR/demo-access.json" \
  node node_modules/playwright/cli.js test \
    --config apps/web/playwright.config.ts \
    apps/web/e2e/physics-pathways.spec.ts \
    --reporter=line --workers=1 --output "$ARTIFACTS/playwright"
)
RC=$?
set -e

if [ "$RC" -ne 0 ]; then
  echo "ROSSO  physics-pathways.spec.ts (exit $RC). Evidenze: $ARTIFACTS" >&2
  tail -n 40 "$API_LOG" >&2 || true
  tail -n 40 "$WEB_LOG" >&2 || true
else
  echo "VERDE  physics-pathways.spec.ts contro API reale e SQLite temporaneo. Evidenze: $ARTIFACTS"
fi
exit "$RC"
