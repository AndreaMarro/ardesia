#!/bin/bash
# MAESTRO-Studio — T1b KILL-TEST A SCHERMO (Playwright)
# Avvia il dev server Vite, esegue il test Playwright, killa il server.
# Uscita: 0 = replay OK, 1+ = replay fallito.
set -uo pipefail
cd "$(dirname "$0")/.."

cleanup() {
  # Killa SOLO il PID di vite (non il process-group — in shell non-interattiva
  # kill del PGID uccide anche SE STESSA = exit 255 esterno).
  if [ -n "${VITE_PID:-}" ]; then
    kill "$VITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "[replay-check] Avvio Vite dev server..."
npx vite &
VITE_PID=$!

# Aspetta che Vite sia pronto (fino a 30 secondi)
echo "[replay-check] Attesa Vite su :5173..."
VITE_READY=false
for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "[replay-check] Vite pronto (tentativo $i)"
    VITE_READY=true
    break
  fi
  sleep 1
done

if [ "$VITE_READY" = false ]; then
  echo "[replay-check] ERRORE: Vite non si e' avviato in 30s"
  exit 1
fi

echo "[replay-check] Esecuzione test Playwright..."
npx playwright test --config eval/playwright.config.ts
RC=$?

echo "[replay-check] Test completato con codice $RC"
exit "$RC"
