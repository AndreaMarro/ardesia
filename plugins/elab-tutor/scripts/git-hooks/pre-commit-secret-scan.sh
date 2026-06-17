#!/bin/bash
# Pre-commit secret scanner — blocks commit if staged diff contains secret patterns.
#
# Install: ln -s ../../scripts/git-hooks/pre-commit-secret-scan.sh .git/hooks/pre-commit
# Or chain after existing husky hook:
#   echo "bash scripts/git-hooks/pre-commit-secret-scan.sh" >> .husky/pre-commit
#
# Patterns blocked:
#   sbp_[40+ chars]        — Supabase Personal Access Token
#   sk-ant-[20+ chars]     — Anthropic API key
#   eyJhbGciOiJ[40+ chars] — JWT (probably service_role)
#   sk-proj-[20+ chars]    — OpenAI project key
#   AKIA[A-Z0-9]{16}       — AWS access key
#   ghp_[30+ chars]        — GitHub personal token
#
# Override (emergency only, document reason in commit message):
#   SKIP_SECRET_SCAN=1 git commit ...

set -e

if [ "${SKIP_SECRET_SCAN:-0}" = "1" ]; then
  echo "[secret-scan] SKIPPED via SKIP_SECRET_SCAN=1"
  exit 0
fi

DIFF=$(git diff --cached --unified=0)

# Patterns to block (POSIX ERE compatible)
PATTERNS=(
  'sbp_[a-zA-Z0-9_-]{30,}'
  'sk-ant-[a-zA-Z0-9_-]{20,}'
  'sk-proj-[a-zA-Z0-9_-]{20,}'
  'eyJhbGciOiJ[A-Za-z0-9_-]{40,}'
  'AKIA[A-Z0-9]{16}'
  'ghp_[a-zA-Z0-9]{30,}'
)

FOUND=0
for p in "${PATTERNS[@]}"; do
  MATCHES=$(echo "$DIFF" | grep -oE "$p" | grep -v "REVOKED\|REDACTED\|PLACEHOLDER\|example\|EXAMPLE" || true)
  if [ -n "$MATCHES" ]; then
    echo "[secret-scan] BLOCKED: pattern '$p' in staged diff"
    echo "$MATCHES" | head -3 | sed 's/./*/g'
    FOUND=1
  fi
done

if [ "$FOUND" = "1" ]; then
  echo ""
  echo "[secret-scan] ABORT — secrets detected in staged changes"
  echo "Options:"
  echo "  1. Remove the secret from the file and re-stage"
  echo "  2. Replace with 'sbp_REDACTED' or similar placeholder"
  echo "  3. Rotate the secret upstream and add to .gitignore"
  echo "  4. Emergency override: SKIP_SECRET_SCAN=1 git commit ... (NOT RECOMMENDED)"
  exit 1
fi

echo "[secret-scan] OK — no secrets in staged diff"
exit 0
