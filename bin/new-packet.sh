#!/usr/bin/env bash
set -euo pipefail
LANE="${1:?usage: new-packet.sh <lane>}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
D="$(date +%Y-%m-%d)"
DEST="$ROOT/ops/packets/${D}-${LANE}-in.md"
sed "s/<lane>/${LANE}/g; s/<date>/${D}/g" "$ROOT/ops/packets/packet-in.template.md" > "$DEST"
echo "$DEST"
