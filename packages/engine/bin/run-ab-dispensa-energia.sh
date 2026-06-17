#!/bin/bash
# MAESTRO — M2-2b A/B: generate and compare v1 (spoken-only) vs v2 (spoken+written)
# Usage: bash bin/run-ab-dispensa-energia.sh [--model deepseek-chat]
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"
MODEL="${1:-deepseek-chat}"
echo "=== M2-2b A/B: Andrea Dispensa Energia ==="
echo "Model: $MODEL"
echo ""
uv run python bin/ab-dispensa-energia.py --model "$MODEL"
