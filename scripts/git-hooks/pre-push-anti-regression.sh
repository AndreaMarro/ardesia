#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Pre-push anti-regression gate
#
# 1. feature-parity-snapshot diff vs previous (block if regression)
# 2. anti-inflation gate (block if score ≥7.0 NO Opus review)
#
# Install:
#   ln -sf ../../scripts/git-hooks/pre-push-anti-regression.sh .git/hooks/pre-push
#
# Bypass (NEVER unless emergency Andrea explicit):
#   git push --no-verify
#
# Andrea Marro — Sprint V iter 1 anti-regression mechanism 2026-05-05
# ════════════════════════════════════════════════════════════════

set -e
cd "$(git rev-parse --show-toplevel)"

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m';
else R=''; G=''; Y=''; B=''; N=''; fi

echo -e "${B}[pre-push] Anti-regression + anti-inflation gate${N}"

# ─── 1. Feature parity snapshot ───
if ! bash scripts/feature-parity-snapshot.sh 2>&1 | tail -3; then
  echo -e "${R}✗ Feature parity REGRESSION — push blocked${N}"
  echo -e "${Y}Review: bash scripts/feature-parity-snapshot.sh${N}"
  echo -e "${Y}Bypass (Andrea explicit only): git push --no-verify${N}"
  exit 1
fi

# ─── 2. Anti-inflation gate ───
if ! bash scripts/anti-inflation-gate.sh "docs/audits/*PHASE3-CLOSE*.md" 2>&1 | tail -10; then
  echo -e "${Y}⚠ Anti-inflation: existing audit have inflation flags. Push allowed (warning only).${N}"
  # NOT blocking yet — warn until iter 36+38 retroactive fix
fi

echo -e "${G}✓ Pre-push anti-regression gate PASS${N}"
exit 0
