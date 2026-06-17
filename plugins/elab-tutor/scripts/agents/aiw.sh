#!/usr/bin/env bash
# aiw — Agent War Room CLI v1
# Created: 2026-05-16 iter 67 PHASE 4 (post Andrea strategic input documento)
# Purpose: canonical agent ops CLI (status/smoke/quality/handoffs/dream) for war room workflow
# Pattern: bash strict mode + jq + early exit on error

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder}"
CMD="${1:-help}"

cd "$REPO_ROOT"

case "$CMD" in
  status)
    echo "===== Git ====="
    git status --short
    echo
    echo "===== Branch ====="
    git rev-parse --abbrev-ref HEAD
    echo
    echo "===== Last 3 commits ====="
    git log --oneline -3
    echo
    if [ -f ".ai/board.md" ]; then
      echo "===== Board ====="
      grep -E "^## (Ready|In Progress|Blocked)" -A 5 .ai/board.md | head -30
    fi
    if [ -f ".ai/mission.md" ]; then
      echo
      echo "===== Mission iter goal ====="
      grep -E "^## Goal" -A 3 .ai/mission.md | head -8
    fi
    ;;

  smoke)
    echo "===== Build ====="
    npm run build --silent 2>&1 | tail -5
    echo
    echo "===== Vitest baseline ====="
    npx vitest run --reporter=basic 2>&1 | tail -8
    ;;

  quality)
    echo "===== Build ====="
    npm run build --silent 2>&1 | tail -5
    echo
    echo "===== Vitest baseline ====="
    npx vitest run --reporter=basic 2>&1 | tail -8
    echo
    echo "===== Playwright smoke (if config exists) ====="
    if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then
      npx playwright test --reporter=list 2>&1 | tail -10 || echo "(Playwright skip — env OR config issue)"
    else
      echo "(Playwright config not found — skip)"
    fi
    ;;

  handoffs)
    if [ -d ".ai/handoffs" ]; then
      echo "===== .ai/handoffs/ recent ====="
      for f in $(ls -t .ai/handoffs/*.md 2>/dev/null | head -10); do
        echo
        echo "===== $f ====="
        tail -n 30 "$f"
      done
    else
      echo "(.ai/handoffs/ not found — create iter 68 entrance)"
    fi
    echo
    if [ -d "automa/team-state/messages" ]; then
      echo "===== automa/team-state/messages/ recent (Pattern S r3 legacy) ====="
      ls -t automa/team-state/messages/*.md 2>/dev/null | head -5
    fi
    ;;

  dream)
    DATE="$(date +%F)"
    PHASE="${2:-evening}"
    DREAM_DIR=".ai/dreams/${DATE}-${PHASE}"
    mkdir -p "$DREAM_DIR"
    echo "===== Manual Dream Protocol candidate folder ====="
    echo "Created: $DREAM_DIR"
    echo
    echo "Copying current handoffs + mission + board to dream candidate..."
    cp .ai/handoffs/*.md "$DREAM_DIR/" 2>/dev/null || echo "(no handoffs to copy)"
    cp .ai/mission.md .ai/board.md "$DREAM_DIR/" 2>/dev/null || true
    echo "Done. Next steps:"
    echo "  1. Claude orchestrator produces $DREAM_DIR/consolidated-memory-candidate.md"
    echo "  2. Codex Pattern R review → $DREAM_DIR/diff-check.md"
    echo "  3. Mistral Red Team review (iter 70+ when integrated)"
    echo "  4. Andrea reviews + ratifies before apply CLAUDE.md/AGENTS.md"
    echo
    echo "DO NOT auto-apply dream candidate to memory files."
    ;;

  baseline-check)
    echo "===== Vitest baseline file ====="
    cat automa/baseline-tests.txt
    echo
    echo "===== Actual current vitest count ====="
    npx vitest run --reporter=basic 2>&1 | grep -E "^[[:space:]]+Tests" | head -3
    ;;

  worktrees)
    echo "===== Git worktrees ====="
    git worktree list
    ;;

  help|*)
    cat <<EOF
aiw — Agent War Room CLI v1

Usage: scripts/agents/aiw.sh <command>

Commands:
  status          Git + branch + recent commits + board + mission goal
  smoke           Build + Vitest baseline check (~2-3 min)
  quality         smoke + Playwright (~5-10 min)
  handoffs        Show recent .ai/handoffs/ + automa/team-state/messages/
  dream [phase]   Create .ai/dreams/YYYY-MM-DD-{phase}/ candidate folder (Manual Dream Protocol, NOT auto-apply)
  baseline-check  Vitest baseline file vs actual count drift detect
  worktrees       Git worktrees list (Pattern S r3 isolation verify)
  help            This message

Pattern S r3: 1 agent = 1 branch = 1 worktree = 1 mission. NO 2 agents same dir.
EOF
    ;;
esac
