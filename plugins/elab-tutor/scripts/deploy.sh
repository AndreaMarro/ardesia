#!/bin/bash
# ELAB Auto-Deploy to Vercel
# Runs after git push — call manually or via post-push hook
# Usage: ./scripts/deploy.sh

set -e
cd "$(dirname "$0")/.."

echo "🔨 Building..."
npm run build

echo "🚀 Deploying to Vercel..."
VERCEL_ORG_ID=team_23uD0RgdInaTaOPEL0EGltup \
VERCEL_PROJECT_ID=prj_Sm9JGt80Ivec3sMFAQ8abfz4UdnV \
npx vercel --prod --yes

echo "✅ Deploy complete!"
