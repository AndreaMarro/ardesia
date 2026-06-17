#!/usr/bin/env bash
# deploy-preview.sh — Deploy preview con gate enforcement
# Input: --dry-run flag optional
# Output: docs/deploy/preview-YYYY-MM-DD.md con URL + HTTP status
# Exit: 0 = deployed + 200, 1 = fail
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: deploy-preview.sh [--dry-run]"
  echo ""
  echo "Build and deploy to Vercel preview, then verify HTTP 200."
  echo "Output: docs/deploy/preview-YYYY-MM-DD.md"
  echo "Exit: 0 = deployed + 200, 1 = fail."
  exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

TODAY=$(date +"%Y-%m-%d")
DEPLOY_FILE="docs/deploy/preview-${TODAY}.md"
mkdir -p docs/deploy

echo "# Preview Deploy - $TODAY" > "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY-RUN] Would run: npm run build" | tee -a "$DEPLOY_FILE"
  echo "[DRY-RUN] Would run: npx vercel --target=preview --yes" | tee -a "$DEPLOY_FILE"
  echo "[DRY-RUN] Would verify HTTP 200 on preview URL" | tee -a "$DEPLOY_FILE"
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

# Deploy
echo "## Deploy" >> "$DEPLOY_FILE"
echo "Deploying to preview..." >&2
DEPLOY_OUTPUT=$(npx vercel --target=preview --yes 2>&1)
PREVIEW_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^ ]+\.vercel\.app' | head -1 || echo "")

if [[ -z "$PREVIEW_URL" ]]; then
  echo "Deploy: FAIL (no URL returned)" >> "$DEPLOY_FILE"
  echo "$DEPLOY_OUTPUT" >> "$DEPLOY_FILE"
  echo "ERROR: Deploy failed" >&2
  exit 1
fi

echo "URL: $PREVIEW_URL" >> "$DEPLOY_FILE"
echo "" >> "$DEPLOY_FILE"

# Verify
echo "## Verification" >> "$DEPLOY_FILE"
echo "Verifying HTTP status..." >&2
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" || echo "000")
echo "HTTP Status: $HTTP_STATUS" >> "$DEPLOY_FILE"

if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "Verification: PASS" >> "$DEPLOY_FILE"
  echo "Preview deployed: $PREVIEW_URL (HTTP $HTTP_STATUS)" >&2
  exit 0
else
  echo "Verification: FAIL (expected 200, got $HTTP_STATUS)" >> "$DEPLOY_FILE"
  echo "ERROR: Preview verification failed (HTTP $HTTP_STATUS)" >&2
  exit 1
fi
