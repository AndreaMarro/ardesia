#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Mac Mini iter 9 PROACTIVE setup
# ════════════════════════════════════════════════════════════════
# Run on Mac Mini (progettibelli@100.124.198.59) to:
# 1. Sync ~/Projects/elab-tutor to current HEAD
# 2. Update SKILL.md paths v1 + v2 → ~/Projects/elab-tutor
# 3. Install cron entries for autonomous tasks (R5/R6 stress, wiki Analogia, volumi diff, web research)
# 4. Write iter 9 NEXT-TASK.md for builder agent
# 5. Decommission stale ~/ELAB/elab-builder OR sync it
#
# Usage (from MacBook):
#   scp -i ~/.ssh/id_ed25519_elab "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/mac-mini/iter-9-proactive-setup.sh" \
#     progettibelli@100.124.198.59:~/scripts/iter-9-proactive-setup.sh
#   ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 "bash ~/scripts/iter-9-proactive-setup.sh"
# ════════════════════════════════════════════════════════════════

set -euo pipefail

REPO_CURRENT="$HOME/Projects/elab-tutor"
REPO_STALE="$HOME/ELAB/elab-builder"
SCHEDULED_TASKS_DIR="$HOME/.claude/scheduled-tasks"
LOG_DIR="$HOME/Library/Logs/elab"
mkdir -p "$LOG_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "  Mac Mini iter 9 PROACTIVE setup — $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════════════"

# ─── 1. Sync current repo ────────────────────────────────────────
echo ""
echo "[1/5] Sync ${REPO_CURRENT} to current HEAD"
cd "$REPO_CURRENT"
git stash push -m "iter9-proactive-pre-sync-$(date +%s)" 2>&1 | tail -1
git checkout feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 2>&1 | tail -1
git pull --ff-only origin feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 2>&1 | tail -3
echo "  HEAD: $(git log -1 --oneline)"
echo "  Wiki concepts: $(ls docs/unlim-wiki/concepts/ | wc -l)/100"

# ─── 2. Update SKILL.md paths ─────────────────────────────────────
echo ""
echo "[2/5] Update SKILL.md paths v1 + v2 → ${REPO_CURRENT}"
for skill_dir in "$SCHEDULED_TASKS_DIR"/elab-*; do
  skill_file="$skill_dir/SKILL.md"
  [ -f "$skill_file" ] || continue
  name=$(basename "$skill_dir")

  # Backup once
  [ -f "$skill_file.iter8-backup" ] || cp "$skill_file" "$skill_file.iter8-backup"

  # Replace stale paths
  sed -i '' \
    -e "s|~/ELAB/elabtutor|~/Projects/elab-tutor|g" \
    -e "s|~/ELAB/elab-builder|~/Projects/elab-tutor|g" \
    -e "s|cd ~/ELAB/elab-builder && git pull origin main|cd ~/Projects/elab-tutor \&\& git pull --ff-only origin feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26|g" \
    "$skill_file"
  echo "  ✓ ${name} updated"
done

# ─── 3. Install cron entries ──────────────────────────────────────
echo ""
echo "[3/5] Install cron entries iter 9 autonomous"

CRON_TMP="/tmp/elab-mac-mini-iter9.cron"
crontab -l 2>/dev/null | grep -v "elab-iter9" > "$CRON_TMP" || true

cat >> "$CRON_TMP" << 'EOF'
# ELAB Mac Mini iter 9 autonomous tasks (managed by iter-9-proactive-setup.sh)
# elab-iter9: R5+R6 stress every 6h
0 */6 * * * cd /Users/progettibelli/Projects/elab-tutor && bash /Users/progettibelli/scripts/elab-stress-runner.sh > /Users/progettibelli/Library/Logs/elab/cron-stress-$(date +\%Y\%m\%d).log 2>&1
# elab-iter9: Wiki Analogia enrichment daily 22:30 CEST (20:30 UTC)
30 20 * * * cd /Users/progettibelli/Projects/elab-tutor && bash /Users/progettibelli/scripts/elab-wiki-batch-gen-v2.sh > /Users/progettibelli/Library/Logs/elab/cron-wiki-$(date +\%Y\%m\%d).log 2>&1
# elab-iter9: Volumi PDF diff audit weekly Sun 03:00 UTC
0 3 * * 0 cd /Users/progettibelli/Projects/elab-tutor && bash /Users/progettibelli/scripts/elab-volumi-diff.sh > /Users/progettibelli/Library/Logs/elab/cron-volumi-$(date +\%Y\%m\%d).log 2>&1
# elab-iter9: Heartbeat to Andrea via state file every 30min
*/30 * * * * echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) heartbeat" >> /Users/progettibelli/Library/Logs/elab/heartbeat.log
EOF

crontab "$CRON_TMP"
echo "  ✓ Cron entries installed: $(crontab -l 2>/dev/null | grep -c elab-iter9) iter9 jobs"

# ─── 4. Write iter 9 NEXT-TASK.md (state file) ──────────────────
echo ""
echo "[4/5] Write iter 9 NEXT-TASK.md state file"
mkdir -p "$REPO_CURRENT/automa/state"

cat > "$REPO_CURRENT/automa/state/NEXT-TASK.md" << 'EOF'
# NEXT-TASK Mac Mini iter 9

**Generated**: 2026-04-27 by iter-9-proactive-setup.sh
**Owner**: elab-builder agent OR autonomous loop
**Priority**: P0

## Task A — R5+R6 stress runner cron (every 6h)

Verify cron entry runs:
```bash
0 */6 * * * cd ~/Projects/elab-tutor && bash ~/scripts/elab-stress-runner.sh
```

If `~/scripts/elab-stress-runner.sh` doesn't exist, create:
```bash
#!/bin/bash
source ~/.elab-credentials/sprint-s-tokens.env
cd ~/Projects/elab-tutor
git pull --ff-only origin feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 2>&1 | tail -3
set -a; source ~/.elab-credentials/sprint-s-tokens.env; set +a
FIXTURE=$(pwd)/scripts/bench/r5-fixture.jsonl node scripts/bench/run-sprint-r5-stress.mjs 2>&1 | tail -10
FIXTURE=$(pwd)/scripts/bench/r6-fixture-100-r5-compat.jsonl node scripts/bench/run-sprint-r5-stress.mjs 2>&1 | tail -10
```

## Task B — Wiki Analogia enrichment daily

Use `~/scripts/elab-wiki-batch-gen-v2.sh` (already exists) but:
- Target: identify 30 wiki concepts MISSING `## Analogia` section
- Use Together AI Llama 3.3 70B to generate Analogia plurale "è come..." for each
- Auto-commit batch + push branch `mac-mini/wiki-analogia-iter9-YYYYMMDD`
- Open PR with title "Mac Mini: wiki Analogia iter 9 +30 concepts"

## Task C — Volumi PDF diff audit weekly

Create `~/scripts/elab-volumi-diff.sh`:
```bash
#!/bin/bash
cd ~/Projects/elab-tutor
mkdir -p ~/automa/reports
for vol in vol1 vol2 vol3; do
  pdf="VOLUME 3/CONTENUTI/volumi-pdf/${vol}.pdf"
  txt="/tmp/${vol}-fresh-$(date +%s).txt"
  [ -f "$pdf" ] && pdftotext -layout "$pdf" "$txt"
done
# diff vs previous + report markdown
```

## Task D — Web research queue iter 9

Topics priority order (to investigate via Claude Code Mac Mini scheduled-tasks/elab-researcher-v2):
1. "edge-tts websocket Sec-MS-GEC algorithm verification 2026"
2. "BGE-M3 Apple Silicon M4 Metal performance benchmarks"
3. "Reciprocal Rank Fusion BM25 dense retrieval k=60 Italian language"
4. "Microsoft Edge TTS deprecation alternative Italian voices children"
5. "Hybrid RAG bge-reranker-large vs Voyage rerank-2.5 comparison cost"
6. "Anthropic Contextual API direct ingest pricing 2026"
7. "Together AI Llama 3.3 70B rate limit tier upgrade Italy"
8. "Supabase pgvector ivfflat 1024-dim performance tuning"

Output reports → `automa/research/<topic>/<date>.md`.

## Task E — Decommission stale ~/ELAB/elab-builder

The repo `~/ELAB/elab-builder` is 3 weeks behind (last commit Apr 7 = 7687897).
Options:
- A) Remove entirely (data loss risk: state files automa/state/*.md)
- B) Sync to current HEAD (overwrites stale state files)
- C) Archive `~/ELAB/elab-builder` → `~/ELAB/elab-builder.archived-iter8` (safe)

**Recommended**: Option C archive. Then redirect symlink ~/ELAB/elab-builder → ~/Projects/elab-tutor.

## Task F — Reactivate 10 scheduled-tasks framework

After SKILL.md paths fixed (Task above), verify:
- launchctl list | grep com.claude.scheduled-tasks (likely NOT installed)
- Install scheduled-tasks plugin launchd if missing
- Test fire elab-scout: claude --skill elab-scout (manual once)

## Reporting

After each task complete, write result to:
- `automa/state/BUILD-RESULT.md` (builder)
- `automa/state/AUDIT-REPORT.md` (auditor)
- `automa/state/FINDINGS.md` (scout)
- `automa/state/RESEARCH-FINDINGS.md` (researcher)

Coordinator merges + pushes branch via `gh pr create --base feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26`.

## Constraints

- NO push main, only feat branch OR auto/* branches
- NO --no-verify on commit
- NO modify CLAUDE.md (orchestrator MacBook owns)
- MAX 5 file per PR
- Pre-commit hook validates baseline (12599 PASS preserved)
EOF

echo "  ✓ NEXT-TASK.md written ($(wc -l < $REPO_CURRENT/automa/state/NEXT-TASK.md) lines)"

# ─── 5. Status report ────────────────────────────────────────────
echo ""
echo "[5/5] Status report"
echo "  Repo current HEAD: $(cd $REPO_CURRENT && git log -1 --oneline)"
echo "  Repo current branch: $(cd $REPO_CURRENT && git branch --show-current)"
echo "  Wiki concepts: $(ls $REPO_CURRENT/docs/unlim-wiki/concepts/ | wc -l)/100"
echo "  Cron jobs: $(crontab -l | grep -c elab-iter9)"
echo "  SKILL.md updated: $(grep -l 'Projects/elab-tutor' $SCHEDULED_TASKS_DIR/elab-*/SKILL.md 2>/dev/null | wc -l)/10"
echo "  Stale repo: ~/ELAB/elab-builder ($(cd $REPO_STALE 2>/dev/null && git log -1 --format=%cr || echo 'not found'))"
echo "  Autonomous loop: $(launchctl list | grep -c com.elab.mac-mini-autonomous-loop) instance"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Mac Mini iter 9 PROACTIVE setup COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next manual actions Andrea (optional):"
echo "  1. ssh progettibelli@100.124.198.59 'mv ~/ELAB/elab-builder ~/ELAB/elab-builder.archived-iter8'"
echo "  2. Verify cron firing: tail -f ~/Library/Logs/elab/cron-stress-*.log"
echo "  3. Check NEXT-TASK.md: cat ~/Projects/elab-tutor/automa/state/NEXT-TASK.md"
