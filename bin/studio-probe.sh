#!/usr/bin/env bash
# studio-probe.sh — esegue uno script Playwright ONE-SHOT contro il dev server
# di apps/studio (screenshot di evidenza, probe di stato UI, diagnostica).
#
# Uso: bin/studio-probe.sh <script.mjs> [porta]
#
# Perché esiste (pattern ricorso 3+ volte nelle sessioni, gotcha codificati):
#   1. ESM risolve i package dal path del FILE, non dalla cwd → lo script viene
#      COPIATO dentro apps/studio prima di girare (node_modules risolvibili).
#   2. MAI pipe sull'output del dev server (SIGPIPE ammazza vite) → stdout su
#      file temporaneo, mai in pipe.
#   3. Cleanup SEMPRE (trap): la copia dello script viene rimossa e il vite
#      avviato da noi viene spento anche se il probe fallisce.
#
# Fail-closed: script mancante = exit 2; probe fallito = exit 1 (con cleanup).
set -euo pipefail

SCRIPT_SRC="${1:-}"
PORT="${2:-5199}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STUDIO_DIR="$REPO_ROOT/apps/studio"

if [[ -z "$SCRIPT_SRC" || ! -f "$SCRIPT_SRC" ]]; then
  echo "uso: bin/studio-probe.sh <script.mjs> [porta]" >&2
  echo "script non trovato: '${SCRIPT_SRC}'" >&2
  exit 2
fi

PROBE_COPY="$STUDIO_DIR/.studio-probe-$$.mjs"
VITE_PID=""
VITE_LOG="$(mktemp)"

cleanup() {
  rm -f "$PROBE_COPY"
  if [[ -n "$VITE_PID" ]]; then
    kill "$VITE_PID" 2>/dev/null || true
    wait "$VITE_PID" 2>/dev/null || true
  fi
  rm -f "$VITE_LOG"
}
trap cleanup EXIT

# Dev server: riusa quello già su, altrimenti avviane uno (output su FILE, mai pipe).
if ! curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then
  (cd "$STUDIO_DIR" && npx vite --port "$PORT" --strictPort > "$VITE_LOG" 2>&1) &
  VITE_PID=$!
  for _ in $(seq 1 30); do
    if curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then break; fi
    sleep 0.5
  done
  if ! curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then
    echo "dev server non partito sulla porta $PORT (log: $VITE_LOG)" >&2
    cat "$VITE_LOG" >&2 || true
    exit 1
  fi
fi

cp "$SCRIPT_SRC" "$PROBE_COPY"
STUDIO_PROBE_BASE_URL="http://localhost:$PORT" node "$PROBE_COPY"
