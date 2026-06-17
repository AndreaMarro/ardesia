#!/usr/bin/env bash
#
# scripts/run-build-smoke.sh
#
# Iter 79 Atom 79.0 — Built-bundle smoke test orchestrator.
#
# 1. Frees port 4173 (kills lingering vite preview if any)
# 2. Starts `vite preview --port 4173` in background, captures PID
# 3. Polls HTTP 200 on http://localhost:4173 for up to 30s
# 4. Runs Playwright spec against the preview server
# 5. Tears down: kills preview PID + frees port
#
# Wrapper exists because @playwright/test webServer config has flaky detection
# with vite preview 7.x — manual lifecycle is reliable.
#
# Usage:
#   bash scripts/run-build-smoke.sh
#
# Exit code:
#   0 = all routes PASS
#   non-zero = build OR preview OR playwright failure (see stderr)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=4173
PREVIEW_LOG="/tmp/elab-build-smoke-preview.log"
PREVIEW_PID=""

cleanup() {
  local exit_code=$?
  if [ -n "${PREVIEW_PID}" ] && kill -0 "${PREVIEW_PID}" 2>/dev/null; then
    echo "[build-smoke] killing vite preview PID ${PREVIEW_PID}"
    kill -9 "${PREVIEW_PID}" 2>/dev/null || true
  fi
  lsof -ti:${PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
  exit "${exit_code}"
}
trap cleanup EXIT INT TERM

cd "${REPO_ROOT}"

echo "[build-smoke] freeing port ${PORT}"
lsof -ti:${PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

if [ ! -f "${REPO_ROOT}/dist/index.html" ]; then
  echo "[build-smoke] dist/ missing — run 'npm run build' first" >&2
  exit 2
fi

echo "[build-smoke] starting vite preview on port ${PORT} (log: ${PREVIEW_LOG})"
npx vite preview --port ${PORT} --strictPort > "${PREVIEW_LOG}" 2>&1 &
PREVIEW_PID=$!
echo "[build-smoke] preview PID: ${PREVIEW_PID}"

echo "[build-smoke] polling http://localhost:${PORT} (max 30s)"
for i in $(seq 1 30); do
  if curl -sf -o /dev/null "http://localhost:${PORT}/"; then
    echo "[build-smoke] ready after ${i}s"
    break
  fi
  if ! kill -0 "${PREVIEW_PID}" 2>/dev/null; then
    echo "[build-smoke] preview process died — log:" >&2
    cat "${PREVIEW_LOG}" >&2
    exit 3
  fi
  sleep 1
  if [ "${i}" -eq 30 ]; then
    echo "[build-smoke] timeout waiting for preview" >&2
    cat "${PREVIEW_LOG}" >&2
    exit 4
  fi
done

echo "[build-smoke] running playwright spec"
npx playwright test --config tests/e2e/playwright.build-smoke.config.js
