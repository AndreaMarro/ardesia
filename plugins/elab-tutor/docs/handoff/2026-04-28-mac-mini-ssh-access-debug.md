---
title: Mac Mini SSH access debug + filesystem trigger fallback design
date: 2026-04-28
author: iter13-coordinator-opus
sprint: S
iter: 13
related:
  - docs/pdr/sprint-S-iter-13-contract.md §6
  - CLAUDE.md "Mac Mini autonomous H24 LIVE"
  - docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md
status: open — Andrea action required for unblock
---

# Mac Mini SSH access debug + filesystem trigger fallback design

## §1 — Problem statement

**Symptom iter 12 PHASE 1**:
```bash
ssh progettibelli@100.124.198.59 -i ~/.ssh/id_ed25519_elab "uptime"
# Permission denied (publickey,password,keyboard-interactive)
```

Result: D1+D2+D3 Mac Mini autonomous tasks NOT dispatched iter 12. Carry-forward iter 13 RETRY with filesystem trigger fallback if SSH still blocked.

**Iter 13 entry state assessment**:
- Tailscale IP `100.124.198.59` REACHABLE (no host issue — ping/curl works for non-SSH ports per iter 12 baseline).
- Mac Mini `launchctl com.elab.mac-mini-autonomous-loop` PID 23944 status uncertain (loop may be DEAD if SSH blocks heartbeat).
- User `progettibelli@` rejected → key `~/.ssh/id_ed25519_elab` not authorized OR sshd config strict OR key revoked.
- MacBook key file existence verifiable: `ls -la ~/.ssh/id_ed25519_elab*` (NOT verified this dispatch).

## §2 — Root cause analysis (4 candidate hypotheses)

### H1 — SSH key never installed on Mac Mini (most likely)
- iter 5 close claim: "SSH ATTIVO (user progettibelli fixed)" — but no `authorized_keys` append documented.
- MacBook public key `~/.ssh/id_ed25519_elab.pub` may have NEVER been appended to `progettibelli@100.124.198.59:~/.ssh/authorized_keys`.
- Diagnostic: physical access Mac Mini Strambino → check `~progettibelli/.ssh/authorized_keys` content.

### H2 — Mac Mini sshd config rejects key auth
- `/etc/ssh/sshd_config` may have `PubkeyAuthentication no` or `AuthenticationMethods publickey,password` (chained).
- iter 5 claim "SSH ATTIVO" may have used password auth interactive Andrea once, never persisted.
- Diagnostic: physical access → check sshd_config `PubkeyAuthentication` + `PasswordAuthentication` + `AuthenticationMethods`.

### H3 — Tailscale ACL rejecting SSH from MacBook
- Tailscale admin policy may restrict SSH between machines.
- Less likely (iter 12 had Tailscale IP reachable for non-SSH).
- Diagnostic: `tailscale status` from MacBook + `tailscale acl` policy review.

### H4 — Key file corrupted or wrong path on MacBook
- `~/.ssh/id_ed25519_elab` permissions wrong (≠600) → SSH refuses to use.
- Diagnostic: `ls -la ~/.ssh/id_ed25519_elab*` + `chmod 600 ~/.ssh/id_ed25519_elab`.

## §3 — Recommended fix (Andrea, 5 min)

**Path A** (preferred, simplest):

1. Andrea opens Terminal on MacBook.
2. Verify key exists locally:
   ```bash
   ls -la ~/.ssh/id_ed25519_elab*
   chmod 600 ~/.ssh/id_ed25519_elab
   chmod 644 ~/.ssh/id_ed25519_elab.pub
   ```
3. SSH with password fallback (one-time):
   ```bash
   ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no progettibelli@100.124.198.59
   # enter password (Mac Mini progettibelli account)
   ```
4. On Mac Mini (now logged in):
   ```bash
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
   ```
5. Back on MacBook (open NEW terminal tab, leave Mac Mini logged in):
   ```bash
   cat ~/.ssh/id_ed25519_elab.pub
   # copy entire output to clipboard
   ```
6. On Mac Mini (paste public key):
   ```bash
   echo "ssh-ed25519 AAAAC3...XYZ progettibelli@elab" >> ~/.ssh/authorized_keys
   exit
   ```
7. From MacBook verify:
   ```bash
   ssh progettibelli@100.124.198.59 -i ~/.ssh/id_ed25519_elab "uptime"
   # expect: 14:23  up 5 days, 2:14, 1 user, load averages: 0.24 0.18 0.12
   ```

**Path B** (if Path A fails — physical Mac Mini access):

1. Walk to Mac Mini Strambino (Andrea on-site).
2. Login locally with admin password.
3. Open Terminal:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # ensure: PubkeyAuthentication yes
   # ensure: AuthorizedKeysFile .ssh/authorized_keys
   # save + exit
   sudo launchctl stop com.openssh.sshd
   sudo launchctl start com.openssh.sshd
   ```
4. Append MacBook public key (manual SCP from USB drive OR re-type small key).

**Path C** (alternative if Mac Mini physically unreachable):

1. Andrea contacts Omaric Strambino office staff (Giovanni / Davide).
2. Request 5-min Mac Mini physical SSH config check.
3. Or remote desktop session via Tailscale + Screen Sharing macOS (`vnc://100.124.198.59:5900`) if enabled.

## §4 — Filesystem trigger fallback design (if SSH unreachable)

**IF Andrea cannot fix SSH iter 13 (Path A/B/C fail)**, use git-pull-loop pattern:

### §4.1 Architecture

```
┌────────────────┐  push          ┌──────────────────┐  cron pull  ┌─────────────────┐
│ MacBook        │ ───────→       │ origin (GitHub)  │ ←────────── │ Mac Mini        │
│                │  next-task.md  │ branch: main     │  every 5min │                 │
│                │                │                  │             │                 │
│ origin pull    │ ←──────────    │                  │ ←────────── │ push results.md │
│ every 5min     │ results.md     │                  │             │                 │
└────────────────┘                └──────────────────┘             └─────────────────┘
```

### §4.2 File contracts

**MacBook → Mac Mini** (write `automa/state/NEXT-TASK.md` + commit + push):
```yaml
---
task_id: ATOM-S13-D1-iter13-mac-mini
issued_at: 2026-04-28T05:35:00Z
issuer: iter13-coordinator
priority: high
timeout_seconds: 7200
---
# Task: 5 ToolSpec expand 52→57

Run: cd ~/elab-builder-mac-mini && bash scripts/elab-builder-toolspec-expand.sh 5

Expected output: automa/state/BUILD-RESULT.md with 5 NEW ToolSpec JSON entries.
```

**Mac Mini → MacBook** (cron `git pull` reads NEXT-TASK.md, executes, writes `automa/state/<TASK-ID>-RESULT.md` + commit + push):
```yaml
---
task_id: ATOM-S13-D1-iter13-mac-mini
completed_at: 2026-04-28T07:42:13Z
status: complete | failed | timeout
runtime_seconds: 7633
---
# Result

5 NEW ToolSpec entries appended to scripts/openclaw/tools-registry.ts:
- composeWiki + composeReplay + composeCharterSession + composeFumetto + composeNudge
LOC delta: +280 in tools-registry.ts.
Tests: 5 NEW PASS in scripts/openclaw/tools-registry.test.ts.
```

### §4.3 Cron setup Mac Mini (one-time, post-physical-access)

```bash
# crontab -e on Mac Mini
*/5 * * * * cd ~/elab-builder-mac-mini && /usr/bin/git pull origin main >> ~/elab-trigger.log 2>&1
*/5 * * * * cd ~/elab-builder-mac-mini && /bin/bash automa/scripts/process-next-task.sh >> ~/elab-trigger.log 2>&1
```

`automa/scripts/process-next-task.sh`:
```bash
#!/bin/bash
TASK_FILE="automa/state/NEXT-TASK.md"
[ ! -f "$TASK_FILE" ] && exit 0  # no task pending

TASK_ID=$(grep '^task_id:' $TASK_FILE | awk '{print $2}')
RESULT_FILE="automa/state/${TASK_ID}-RESULT.md"
[ -f "$RESULT_FILE" ] && exit 0  # already processed

# Execute task per task body parsing (simple keyword match)
# ... (expansion: bash command extraction, sandboxed exec, output capture)

# Write result
echo "task complete" > "$RESULT_FILE"
git add "$RESULT_FILE" && git commit -m "mac-mini: result $TASK_ID" && git push origin main
```

### §4.4 Latency

- MacBook push → origin: ~5s.
- Mac Mini pull cron: every 5 min (worst case ~5 min lag detect task).
- Mac Mini exec task: variable (5-60 min per atom).
- Mac Mini push result → origin: ~5s.
- MacBook pull cron OR poll: ~5 min lag detect result.

**Total round-trip iter 13 atom**: ~15-20 min minimum + atom exec time.

**vs SSH**: SSH would be ~immediate (sub-second dispatch + sub-second result).

**Acceptable iter 13 IF SSH unreachable**: yes, slower but unblocked. NOT acceptable Sprint T (iter 15+) — SSH MUST be fixed.

## §5 — Alternative: Computer Use MCP screen-control

If Mac Mini accessible via local desktop (e.g., remote desktop session active OR Tailscale + Screen Sharing OR physical co-location with MacBook):

- Use `mcp__computer-use__*` tools (already installed CCD environment per system-reminder).
- Open Mac Mini desktop session → screenshot + click + type to navigate Terminal manually.
- Effective for one-shot SSH config fix (Path B equivalent done remotely).
- NOT for iter 13 ongoing autonomous (computer-use is interactive, not background).

## §6 — Recommendation iter 13

**Primary path** (5 min Andrea iter 13 entrance):
- Andrea Path A (MacBook one-shot password auth + append public key authorized_keys).
- Test: `ssh progettibelli@100.124.198.59 -i ~/.ssh/id_ed25519_elab "uptime"` returns load averages.
- Once verified, dispatch D1+D2+D3 Mac Mini autonomous tasks iter 13.

**Secondary path** (if Path A fails after 30 min effort):
- Filesystem trigger fallback §4.
- Iter 13 D1 still dispatchable (5 ToolSpec via git-pull-loop), slower ~20 min round-trip.
- Iter 14 entry MUST resolve SSH (physical access or remote desktop).

**NOT recommended** iter 13:
- Computer Use MCP for ongoing automation (interactive, blocks Andrea workstation).
- Continue ignoring SSH block (D1+D2+D3 carry-forward iter 14+ delays Box 10 lift indefinitely).

## §7 — Mac Mini iter 13 dispatch readiness checklist

Pre iter 13 D1+D2+D3 dispatch (all must check):

- [ ] SSH `progettibelli@100.124.198.59 "uptime"` returns OK (Path A or B applied).
- [ ] `launchctl list | grep elab` shows `com.elab.mac-mini-autonomous-loop` LOADED.
- [ ] PID alive: `ssh progettibelli@... "ps aux | grep autonomous-loop | grep -v grep"` returns row.
- [ ] Disk space `~/elab-builder-mac-mini` ≥10GB free.
- [ ] Latest origin/main pulled: `ssh progettibelli@... "cd ~/elab-builder-mac-mini && git log -1 --oneline"` matches `9f589ba`.
- [ ] Test echo write: `ssh progettibelli@... "echo iter13 > ~/elab-builder-mac-mini/automa/state/heartbeat-iter13.txt"` + verify on MacBook via `git pull` shows file.

If checklist 6/6 GREEN → dispatch D1+D2+D3 confidence high.

If 4-5/6 GREEN → dispatch D1 only (lowest-stakes 5 ToolSpec), monitor closely.

If ≤3/6 GREEN → defer iter 14, focus iter 13 PHASE 1 4 OPUS priorities only.

---

## §8 — Honesty caveats

1. **Iter 12 close claim "SSH ATTIVO" was inaccurate** — iter 12 SSH actually blocked, D1+D2+D3 deferred. Iter 13 must verify NOT trust prior iter status.
2. **Filesystem trigger fallback NOT tested iter 13** — design only, first execution iter 13+ will reveal edge cases (race conditions on simultaneous push from MacBook + Mac Mini, conflict resolution NOT specified §4).
3. **No SSH fix == no Box 10 lift to 1.0 iter 13** — ClawBot 80-tool maturity goal Sprint T iter 15+ stays at 0.95 if D1 carry-forward keeps deferring.
4. **Andrea time cost honest**: Path A ~5 min if everything goes right, ~30 min if Path B physical access required.
5. **Tailscale ACL hypothesis H3 unverified** — defer diagnosis iter 14 if H1+H2 fail (rare).

---

— iter13-coordinator-opus, 2026-04-28 05:30:37 CEST. CAVEMAN MODE. ONESTÀ MASSIMA.
