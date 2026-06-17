#!/usr/bin/env bash
# deploy-prod.sh — Deploy produzione con approval gate
# Input: requires automa/state/APPROVE-DEPLOY-PROD.txt
# Output: docs/deploy/prod-YYYY-MM-DD.md
# Exit: 0 = all good, 1 = fail
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: deploy-prod.sh [--dry-run]"
  echo ""
  echo "Deploy to Vercel production. Requires approval file."
  echo "Prerequisite: automa/state/APPROVE-DEPLOY-PROD.txt must exist."
  echo "Output: docs/deploy/prod-YYYY-MM-DD.md"
  echo "Exit: 0 = all good, 1 = fail."
  exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

TODAY=$(date +"%Y-%m-%d")
DEPLOY_FILE="docs/deploy/prod-${TODAY}.md"
mkdir -p docs/deploy

APPROVAL_FILE="automa/state/APPROVE-DEPLOY-PROD.txt"

echo "# Production Deploy - $TODAY" > "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

# Check approval
if [[ ! -f "$APPROVAL_FILE" ]]; then
  echo "ERROR: Approval file not found: $APPROVAL_FILE" | tee -a "$DEPLOY_FILE"
  echo "" >> "$DEPLOY_FILE"
  echo "To approve prod deploy, create the file:" >> "$DEPLOY_FILE"
  echo "  echo 'Approved by Andrea on $TODAY' > $APPROVAL_FILE" >> "$DEPLOY_FILE"
  exit 1
fi

echo "## Approval" >> "$DEPLOY_FILE"
echo "Approval file found: $(cat "$APPROVAL_FILE")" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY-RUN] Would run: npm run build" | tee -a "$DEPLOY_FILE"
  echo "[DRY-RUN] Would run: npx vercel --prod --yes" | tee -a "$DEPLOY_FILE"
  echo "[DRY-RUN] Would verify HTTP 200 on https://www.elabtutor.school" | tee -a "$DEPLOY_FILE"
  echo "[DRY-RUN] Would deploy Supabase Edge Functions if SUPABASE_ACCESS_TOKEN set" | tee -a "$DEPLOY_FILE"
  echo "" >> "$DEPLOY_FILE"
  echo "Status: DRY-RUN (no actual deploy)" >> "$DEPLOY_FILE"
  exit 0
fi

# Build
echo "## Build" >> "$DEPLOY_FILE"
echo "Running build..." >&2
if npm run build >> "$DEPLOY_FILE" 2>&1; then
  echo "Build: PASS" >> "$DEPLOY_FILE"
else
  echo "Build: FAIL" >> "$DEPLOY_FILE"
  echo "ERROR: Build failed, aborting deploy" >&2
  exit 1
fi
echo "" >> "$DEPLOY_FILE"

# Deploy frontend
echo "## Frontend Deploy" >> "$DEPLOY_FILE"
echo "Deploying to production..." >&2
DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

# Verify frontend
echo "## Frontend Verification" >> "$DEPLOY_FILE"
PROD_URL="https://www.elabtutor.school"
sleep 10
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" || echo "000")
echo "URL: $PROD_URL" >> "$DEPLOY_FILE"
echo "HTTP Status: $HTTP_STATUS" >> "$DEPLOY_FILE"

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "FAIL: Frontend not responding 200" >> "$DEPLOY_FILE"
  echo "" >> "$DEPLOY_FILE"
  echo "## Rollback Instructions" >> "$DEPLOY_FILE"
  echo "Run: npx vercel rollback --yes" >> "$DEPLOY_FILE"
  echo "ERROR: Prod deploy failed verification. Consider rollback." >&2
  exit 1
fi
echo "Frontend: PASS" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

# Deploy Edge Functions (if token available)
echo "## Edge Functions Deploy" >> "$DEPLOY_FILE"
if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Deploying Supabase Edge Functions..." >&2
  if SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb >> "$DEPLOY_FILE" 2>&1; then
    echo "Edge Functions: PASS" >> "$DEPLOY_FILE"
  else
    echo "Edge Functions: FAIL (non-blocking)" >> "$DEPLOY_FILE"
  fi
else
  echo "Skipped: SUPABASE_ACCESS_TOKEN not set" >> "$DEPLOY_FILE"
fi
echo "" >> "$DEPLOY_FILE"

# Cleanup approval file
rm -f "$APPROVAL_FILE"
echo "Approval file removed after successful deploy" >> "$DEPLOY_FILE"

echo "## Summary" >> "$DEPLOY_FILE"
echo "Production deploy: PASS" >> "$DEPLOY_FILE"
echo "Deploy report: $DEPLOY_FILE" >&2
exit 0
