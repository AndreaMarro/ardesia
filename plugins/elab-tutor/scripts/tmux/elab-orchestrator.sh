#!/bin/bash
# ELAB tmux orchestrator session — iter 69 A-AUTOMATION-3
# Spawns 4-pane tmux session for parallel BG agents qualità migliorata Pattern S r3
#
# Layout:
#   ┌──────────────┬──────────────┐
#   │ orchestrator │   BG-1       │
#   │  (main)      │  (worktree)  │
#   ├──────────────┼──────────────┤
#   │   BG-2       │  monitor     │
#   │  (worktree)  │  (logs+health│
#   └──────────────┴──────────────┘
#
# Usage:
#   bash scripts/tmux/elab-orchestrator.sh [session-name]
#   Default session name: elab-iter<N>
#
# Attach later: tmux attach -t <session-name>
# Detach inside: Ctrl-b d

set -euo pipefail

SESSION="${1:-elab-orchestrator}"
ROOT="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

# Kill if exists (reset)
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Create new session with first window
tmux new-session -d -s "$SESSION" -n main -c "$ROOT"

# Pane 1 (top-left): orchestrator main
tmux send-keys -t "$SESSION:main.1" "echo 'orchestrator pane — main worktree'" C-m
tmux send-keys -t "$SESSION:main.1" "git status -sb && git log --oneline -3" C-m

# Split right: BG-1 worktree placeholder
tmux split-window -h -t "$SESSION:main" -c "$ROOT"
tmux send-keys -t "$SESSION:main.2" "echo 'BG-1 pane — worktree isolato per subagent dispatch'" C-m
tmux send-keys -t "$SESSION:main.2" "git worktree list 2>&1 | head -5" C-m

# Split bottom-left
tmux select-pane -t "$SESSION:main.1"
tmux split-window -v -t "$SESSION:main.1" -c "$ROOT"
tmux send-keys -t "$SESSION:main.3" "echo 'BG-2 pane — worktree isolato per second BG agent'" C-m

# Split bottom-right (monitor)
tmux select-pane -t "$SESSION:main.2"
tmux split-window -v -t "$SESSION:main.2" -c "$ROOT"
tmux send-keys -t "$SESSION:main.4" "echo 'monitor pane — logs + Mac Mini health'" C-m
tmux send-keys -t "$SESSION:main.4" "while true; do clear; date; echo '---vitest baseline---'; cat automa/baseline-tests.txt 2>/dev/null | head -2; echo '---Mac Mini health---'; ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'cat ~/.elab-health.json 2>/dev/null' 2>&1 | head -10; sleep 60; done" C-m

# Focus orchestrator pane
tmux select-pane -t "$SESSION:main.1"

echo "tmux session '$SESSION' created with 4 panes"
echo "Attach: tmux attach -t $SESSION"
echo "Detach inside: Ctrl-b d"
echo "Kill: tmux kill-session -t $SESSION"
