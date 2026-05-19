# TMUX Workflow — ELAB iter 69+

Iter 69 A-AUTOMATION-3 — tmux session orchestrator per parallel BG agents qualità migliorata Pattern S r3.

## Setup

```bash
# Verify tmux installed
brew install tmux  # if missing
tmux -V            # expect 3.6a+

# Base config installed: ~/.tmux.conf
# Iter 69 setup: scripts/tmux/elab-orchestrator.sh
```

Base config features:
- Mouse support (scroll/resize/click pane)
- History 100k lines per pane
- Vim-style pane navigation (`Ctrl-b h/j/k/l`)
- Window numbering from 1
- Status bar host + session + clock
- Reload config `Ctrl-b r`

## 4 patterns canonical Pattern S r3

### Pattern 1: parallel BG agents qualità migliorata

```bash
bash scripts/tmux/elab-orchestrator.sh elab-iter69
tmux attach -t elab-iter69
```

Layout 4 panes:
- **Pane 1 (top-left)**: orchestrator main worktree
- **Pane 2 (top-right)**: BG-1 worktree isolato per subagent dispatch
- **Pane 3 (bottom-left)**: BG-2 worktree isolato per second BG agent
- **Pane 4 (bottom-right)**: monitor logs + Mac Mini health refresh 60s

Pattern S r3 race-cond fix: BG agents OPERATE su worktree disjoint (NO write conflict mainwt). Each pane Ctrl-b c per nuova window se sequenza tasks.

### Pattern 2: persistent resume

```bash
# Avvia long-running task
tmux new-session -d -s elab-bench "node scripts/bench/run-1000-matrix.py"

# Detach (anche close terminal):
# Ctrl-b d

# Resume dopo ore:
tmux attach -t elab-bench
```

Sopravvive close terminal + SSH disconnect. Resume da qualsiasi sessione successiva.

### Pattern 3: remote Mac Mini SSH

```bash
# Window dedicato Mac Mini control
tmux new-window -n macmini "ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59"

# Inside Mac Mini session, tmux nested se needed:
tmux new-session -t macmini-loop -d "tail -f ~/Library/Logs/elab/autonomous-loop-v2-*.log"
```

Mac Mini autonomous loop launchctl supervised (iter 69 A-AUTOMATION-2). SSH window per ad-hoc tasks delegation + log tail.

### Pattern 4: monitor matrix BG

```bash
# Setup tmux session per long-running matrix bench
tmux new-session -d -s elab-matrix
tmux send-keys -t elab-matrix "source ~/.elab-credentials/elab-keys.env" C-m
tmux send-keys -t elab-matrix "python3 scripts/bench/run-1000-matrix.py 2>&1 | tee matrix-iter69-$(date +%Y%m%d-%H%M%S).log" C-m

# Detach
# Ctrl-b d

# Check progress later
tmux attach -t elab-matrix
```

Matrix 1000q dura ~30-45min. Run in tmux session permette detach + resume + monitor da pane separato.

## Pattern S r3 race-cond mitigation tmux

5-pronged fix applied:
1. **Single-agent serial per file ownership cluster**: 1 pane per agent + worktree disjoint
2. **Git worktree isolation per BG**: `git worktree add ../elab-builder-iter<N>-<task>` prima dispatch
3. **Quick-regression delta scope**: post-merge pane vitest run target tests scope
4. **Filesystem implicit lock per worktree**: tmux pane = working dir distinct
5. **Process cleanup post-agent termination**: tmux kill-pane on agent done

## Cheatsheet

| Action | Keybinding |
|---|---|
| New window | `Ctrl-b c` |
| Next window | `Ctrl-b n` |
| Previous window | `Ctrl-b p` |
| Split horizontal | `Ctrl-b |` |
| Split vertical | `Ctrl-b -` |
| Navigate pane (vim) | `Ctrl-b h/j/k/l` |
| Resize pane | `Ctrl-b` + arrow |
| Zoom pane | `Ctrl-b z` |
| Kill pane | `Ctrl-b x` |
| Detach session | `Ctrl-b d` |
| Reload config | `Ctrl-b r` |
| List sessions | `tmux ls` |
| Attach session | `tmux attach -t NAME` |
| Kill session | `tmux kill-session -t NAME` |

## Cross-link

- Base config: `~/.tmux.conf` (iter 69 A-AUTOMATION-3 39 LOC)
- Orchestrator launcher: `scripts/tmux/elab-orchestrator.sh`
- Mac Mini launchctl: `~/Library/LaunchAgents/com.elab.mac-mini-autonomous-loop.plist` (iter 69 A-AUTOMATION-2)
- Pattern S r3: CLAUDE.md "Pattern S r3 race-cond fix VALIDATED Nx consecutive" sections
