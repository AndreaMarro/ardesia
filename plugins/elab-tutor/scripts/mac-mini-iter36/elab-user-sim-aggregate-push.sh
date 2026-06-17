#!/bin/bash
# ELAB iter 36 user-simulation aggregator + branch push (Cron 15min)
# Aggregates JSON logs, compresses, optionally pushes to elab-tutor-school repo
set -u
TS=$(date -u +%Y%m%dT%H%M%SZ)
LOGDIR=/Users/progettibelli/Library/Logs/elab
AGG="$LOGDIR/iter36-aggregate-$TS.jsonl"

mkdir -p "$LOGDIR"

# Aggregate all user-sim JSON last 15min
find "$LOGDIR" -name "user-sim-l*.json" -mmin -15 -type f 2>/dev/null | while read f; do
  cat "$f" | tr -d '\n' >> "$AGG"
  echo "" >> "$AGG"
done

COUNT=$(wc -l < "$AGG" 2>/dev/null || echo 0)

# Cleanup logs older than 7 days
find "$LOGDIR" -name "user-sim-*.json" -mtime +7 -type f -delete 2>/dev/null
find "$LOGDIR" -name "user-sim-*.log" -mtime +7 -type f -delete 2>/dev/null

# Heartbeat
echo "$TS aggregate cycles=$COUNT" >> "$LOGDIR/iter36-aggregate.log"

# Optional: push to git branch (only if elab-tutor repo cloned + git configured)
REPO=/Users/progettibelli/Projects/elab-tutor
if [ -d "$REPO/.git" ]; then
  cd "$REPO"
  BRANCH="mac-mini/iter36-user-sim-$(date -u +%Y%m%d-%H%M)"
  git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH" 2>/dev/null
  mkdir -p mac-mini-logs/iter36
  cp "$AGG" "mac-mini-logs/iter36/" 2>/dev/null
  git add mac-mini-logs/iter36/ 2>/dev/null
  git commit -m "chore(mac-mini): iter36 aggregate $TS cycles=$COUNT" 2>/dev/null && \
    git push origin "$BRANCH" 2>/dev/null || true
fi

exit 0
