#!/usr/bin/env bash
# One-time setup: create watchdog labels in repo.
# Idempotent — safe to re-run (gh label create errors on duplicate are ignored).

set -u

REPO="${1:-AndreaMarro/elab-tutor}"

echo "Creating watchdog labels in $REPO..."

gh label create watchdog-alert \
  --color f59e0b \
  --description "Watchdog detected anomaly (auto-created by GH Actions)" \
  --repo "$REPO" 2>&1 | grep -v "already exists" || true

gh label create watchdog-pattern \
  --color 8b5cf6 \
  --description "Recurring anomaly pattern (3+ times in 7d)" \
  --repo "$REPO" 2>&1 | grep -v "already exists" || true

gh label create watchdog-p0-block \
  --color d93f0b \
  --description "Watchdog P0 critical: production down / Principio Zero v3 regression" \
  --repo "$REPO" 2>&1 | grep -v "already exists" || true

echo "Labels ready. Verify: gh label list --repo $REPO"
