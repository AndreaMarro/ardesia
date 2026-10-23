#!/bin/sh
# Run from the repository root. No production changes.
# Usage: sh apps/marketing-01/tests/performance.sh URL OUTPUT_DIRECTORY
set -eu
AUDIT_URL=${1:-http://127.0.0.1:5391/}
AUDIT_OUTPUT=${2:-/tmp/ardesia-performance}
mkdir -p "$AUDIT_OUTPUT"
for RUN in 1 2 3; do
 npm exec --yes --package=lighthouse@12.8.2 -- lighthouse "$AUDIT_URL" --chrome-flags='--headless --no-sandbox' --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --screenEmulation.width=390 --screenEmulation.height=844 --screenEmulation.deviceScaleFactor=1 --throttling-method=simulate --throttling.rttMs=150 --throttling.throughputKbps=1638.4 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path="$AUDIT_OUTPUT/lighthouse-$RUN.json" --quiet
done
