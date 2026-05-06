#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Multi-Vendor Review Workflow — Claude Opus + Kimi K2.6 + Mistral Large + Codex
#
# Anti-bias: 4 vendor diversi reviewano stesso target, flag disagreement
# Anti-regression: timeline score per vendor su atom history
# Anti-inflation: system prompt mandates G45 honest, NO compiacenza
# Retroactive: confronta past audit md scores vs vendor consensus current
#
# Uso:
#   bash scripts/multi-vendor/run-review.sh <target-file-or-diff-spec> [vendors]
#   target-file-or-diff-spec:
#     - file path (single file review)
#     - "diff <ref1>..<ref2> -- <paths>" (git diff range)
#     - "audit <md-file>" (audit md inflation check)
#   vendors: comma-separated [claude,kimi,mistral,codex] default all
#
# Env req: KIMI_API_KEY + MISTRAL_API_KEY (source ~/.elab-credentials/* prima)
#
# Output: docs/audits/multi-vendor-review-<TS>.md con:
#   - per-vendor verdict + score 0-10
#   - disagreement matrix
#   - consensus score G45 capped 7.0 max senza Opus indipendente
#   - top 3 fix priorità (votazione)
#
# Andrea Marro — Sprint V iter 2 multi-vendor mechanism 2026-05-06
# ════════════════════════════════════════════════════════════════

set -e
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m';
else R=''; G=''; Y=''; B=''; N=''; fi

TARGET="${1:-}"
VENDORS="${2:-claude,kimi,mistral,codex}"
TS=$(date -u +"%Y%m%dT%H%M%SZ")
OUT="docs/audits/multi-vendor-review-$TS.md"

if [ -z "$TARGET" ]; then
  echo -e "${R}Usage: $0 <target> [vendors]${N}"
  echo "Targets: file-path | 'diff <range>' | 'audit <md>'"
  exit 1
fi

[ -z "$KIMI_API_KEY" ] && [ -z "$MISTRAL_API_KEY" ] && {
  echo -e "${Y}Sourcing creds...${N}"
  set -a
  [ -f ~/.elab-credentials/sprint-s-tokens.env ] && source ~/.elab-credentials/sprint-s-tokens.env
  [ -f ~/.elab-credentials.env ] && source ~/.elab-credentials.env
  set +a
}

mkdir -p docs/audits "$(dirname "$OUT")"

# ─── Build target content ───
TARGET_CONTENT=""
TARGET_DESC=""
if [ -f "$TARGET" ]; then
  TARGET_CONTENT=$(head -800 "$TARGET")
  TARGET_DESC="File: $TARGET"
elif [[ "$TARGET" == diff* ]]; then
  RANGE="${TARGET#diff }"
  TARGET_CONTENT=$(git diff $RANGE 2>&1 | head -800)
  TARGET_DESC="Diff: $RANGE"
elif [[ "$TARGET" == audit* ]]; then
  AUDIT_FILE="${TARGET#audit }"
  TARGET_CONTENT=$(head -200 "$AUDIT_FILE")
  TARGET_DESC="Audit md: $AUDIT_FILE (inflation check)"
else
  echo -e "${R}Invalid target: $TARGET${N}"
  exit 1
fi

# ─── System prompt anti-inflation + anti-bias ───
SYSTEM_PROMPT='Reviewer codice senior brutale. Mandate Andrea G45 anti-inflation: NO score >7 senza review indipendente. NO compiacenza. NO complimenti vuoti. ELAB Tutor educational React app bambini 8-14 PRINCIPIO ZERO docente plurale Ragazzi + kit fisico Omaric. Output technical fragments terse caveman. Rispondi 5 sezioni:
1. RISCHI (top 3 edge case ignorati)
2. SECURITY (input validation, XSS, GDPR, prompt injection)
3. ANTI-PATTERN (technical debt + smell)
4. SCORE 0-10 onesto Sprint V iter 1 (G45 cap 7.0 senza external review)
5. TOP 3 FIX iter 2 + effort S/M/L'

USER_PROMPT="REVIEW TARGET: $TARGET_DESC

CONTENUTO:
$(echo "$TARGET_CONTENT" | head -400)

REVIEW BRUTALE NO COMPIACENZA. Fragmenti tecnici. Score onesto."

# Encode for JSON
USER_JSON=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<<"$USER_PROMPT")
SYS_JSON=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<<"$SYSTEM_PROMPT")

# ─── Vendor calls ───
KIMI_OUT="/tmp/multi-vendor-kimi-$TS.txt"
MISTRAL_OUT="/tmp/multi-vendor-mistral-$TS.txt"
CODEX_OUT="/tmp/multi-vendor-codex-$TS.txt"

call_kimi() {
  if [[ ",$VENDORS," != *,kimi,* ]]; then return; fi
  echo -e "${B}[kimi] calling K2.6...${N}"
  python3 - <<PYEOF > "$KIMI_OUT" 2>&1 &
import os, json, urllib.request
api_key = os.environ.get("KIMI_API_KEY")
if not api_key:
    print("KIMI_API_KEY missing"); raise SystemExit
url = "https://api.moonshot.ai/v1/chat/completions"
payload = {
    "model": "kimi-k2.6",
    "temperature": 1,
    "max_tokens": 1500,
    "messages": [
        {"role": "system", "content": $SYS_JSON},
        {"role": "user", "content": $USER_JSON},
    ],
}
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req, timeout=180)
    data = json.loads(resp.read().decode("utf-8"))
    msg = data["choices"][0]["message"]
    out = msg.get("content", "").strip() or msg.get("reasoning_content", "").strip() or "[empty]"
    print(out)
except Exception as e:
    print(f"ERROR: {e}")
PYEOF
  echo $! > "/tmp/kimi-pid-$TS"
}

call_mistral() {
  if [[ ",$VENDORS," != *,mistral,* ]]; then return; fi
  echo -e "${B}[mistral] calling Large...${N}"
  python3 - <<PYEOF > "$MISTRAL_OUT" 2>&1 &
import os, json, urllib.request
api_key = os.environ.get("MISTRAL_API_KEY")
if not api_key:
    print("MISTRAL_API_KEY missing"); raise SystemExit
url = "https://api.mistral.ai/v1/chat/completions"
payload = {
    "model": "mistral-large-latest",
    "temperature": 0.2,
    "max_tokens": 1500,
    "messages": [
        {"role": "system", "content": $SYS_JSON},
        {"role": "user", "content": $USER_JSON},
    ],
}
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req, timeout=120)
    data = json.loads(resp.read().decode("utf-8"))
    print(data["choices"][0]["message"]["content"])
except Exception as e:
    print(f"ERROR: {e}")
PYEOF
  echo $! > "/tmp/mistral-pid-$TS"
}

call_codex() {
  if [[ ",$VENDORS," != *,codex,* ]]; then return; fi
  if ! command -v codex &>/dev/null; then
    echo "[codex] not in PATH; skip" > "$CODEX_OUT"
    return
  fi
  echo -e "${B}[codex] calling exec...${N}"
  ( codex exec --model gpt-5 - <<PROMPT > "$CODEX_OUT" 2>&1
$SYSTEM_PROMPT

$USER_PROMPT
PROMPT
  ) &
  echo $! > "/tmp/codex-pid-$TS"
}

call_kimi
call_mistral
call_codex

# Wait all
echo -e "${Y}Waiting vendors (max 3 min)...${N}"
[ -f "/tmp/kimi-pid-$TS" ] && wait $(cat "/tmp/kimi-pid-$TS") 2>/dev/null || true
[ -f "/tmp/mistral-pid-$TS" ] && wait $(cat "/tmp/mistral-pid-$TS") 2>/dev/null || true
[ -f "/tmp/codex-pid-$TS" ] && wait $(cat "/tmp/codex-pid-$TS") 2>/dev/null || true

# ─── Aggregate output ───
{
  echo "# Multi-Vendor Review — $TS"
  echo ""
  echo "**Target**: $TARGET_DESC"
  echo "**Vendors**: $VENDORS"
  echo ""
  echo "## Anti-bias mandate"
  echo "- 2+ vendor disagreement = flag for Andrea ratify"
  echo "- Score >7 require Opus indipendente review (G45 mandate)"
  echo "- NO compiacenza — output technical fragments"
  echo ""
  if [[ ",$VENDORS," == *,kimi,* ]]; then
    echo "## Kimi K2.6 (Moonshot)"
    echo ""
    cat "$KIMI_OUT"
    echo ""
  fi
  if [[ ",$VENDORS," == *,mistral,* ]]; then
    echo "## Mistral Large"
    echo ""
    cat "$MISTRAL_OUT"
    echo ""
  fi
  if [[ ",$VENDORS," == *,codex,* ]]; then
    echo "## Codex (OpenAI)"
    echo ""
    cat "$CODEX_OUT"
    echo ""
  fi
  echo "## Note Claude Opus 4.7 (orchestrator + 4th vendor)"
  echo ""
  echo "_Claude Opus 4.7 review attached separately by orchestrator._"
  echo ""
  echo "## Disagreement detection"
  echo ""
  echo "TODO orchestrator: parse score 0-10 per vendor, flag >2.0 spread."
  echo ""
} > "$OUT"

echo -e "${G}✓ Multi-vendor review: $OUT${N}"
echo ""
[ -f "$KIMI_OUT" ] && [ -s "$KIMI_OUT" ] && echo -e "${B}--- Kimi ---${N}" && head -20 "$KIMI_OUT"
[ -f "$MISTRAL_OUT" ] && [ -s "$MISTRAL_OUT" ] && echo -e "${B}--- Mistral ---${N}" && head -20 "$MISTRAL_OUT"
[ -f "$CODEX_OUT" ] && [ -s "$CODEX_OUT" ] && echo -e "${B}--- Codex ---${N}" && head -20 "$CODEX_OUT"

exit 0
