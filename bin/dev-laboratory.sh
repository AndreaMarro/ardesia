#!/usr/bin/env bash
# Local development: no installs, provider calls or deployments.
set -euo pipefail
ARDESIA_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
KIRCHHOFF_DIR="${KIRCHHOFF_DIR:-$ARDESIA_ROOT/../kirchhoff-takeover-20261002}"
if [[ ! -f "$KIRCHHOFF_DIR/scripts/serve_student.py" ]]; then
  echo 'Set KIRCHHOFF_DIR to the Kirchhoff checkout.' >&2
  exit 1
fi
# Resolve caller-relative paths before any service changes its working directory.
KIRCHHOFF_DIR="$(cd -- "$KIRCHHOFF_DIR" && pwd)"
KIRCHHOFF_PYTHON="${KIRCHHOFF_PYTHON:-$KIRCHHOFF_DIR/.venv/bin/python}"
if [[ "$KIRCHHOFF_PYTHON" != /* ]]; then
  KIRCHHOFF_PYTHON="$PWD/$KIRCHHOFF_PYTHON"
fi
if [[ ! -d "$ARDESIA_ROOT/apps/studio/node_modules" ]]; then
  echo 'Studio dependencies are missing. Follow apps/studio/README.md.' >&2
  exit 1
fi
command -v node >/dev/null
if [[ ! -x "$KIRCHHOFF_PYTHON" ]]; then
  echo 'Set KIRCHHOFF_PYTHON to the existing Kirchhoff Python environment.' >&2
  exit 1
fi
if [[ "${1:-}" == '--check' ]]; then
  echo 'Local prerequisites found. Services: Studio 5199, Kirchhoff 43921, collaboration 4318.'
  exit 0
fi
pids=()
cleanup() {
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait || true
}
trap cleanup EXIT INT TERM
(cd "$KIRCHHOFF_DIR" && KIRCHHOFF_ALLOWED_ORIGINS=http://127.0.0.1:5199 exec "$KIRCHHOFF_PYTHON" scripts/serve_student.py --port 43921) &
pids+=("$!")
(cd "$ARDESIA_ROOT" && exec node services/room-sync/server.mjs) &
pids+=("$!")
(cd "$ARDESIA_ROOT/apps/studio" && KIRCHHOFF_LOCAL_URL=http://127.0.0.1:43921 exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5199 --strictPort) &
pids+=("$!")
echo 'Ardesia: http://127.0.0.1:5199 — CircuitCheck: http://127.0.0.1:43921'
echo 'Keep this terminal open. Ctrl+C stops these three local processes.'
while true; do
  for pid in "${pids[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo 'A local service stopped; shutting down the other processes.' >&2
      exit 1
    fi
  done
  sleep 2
done
