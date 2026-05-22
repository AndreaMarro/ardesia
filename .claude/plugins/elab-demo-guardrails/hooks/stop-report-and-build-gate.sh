#!/bin/bash
# elab-demo-guardrails: Stop hook
# Build gate smoke + report template reminder.

# Only on demo branch
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25" 2>/dev/null || exit 0
branch=$(git branch --show-current 2>/dev/null || echo "")
if [[ "$branch" != "feat/demo-25may" && "$branch" != feat/demo-25may-* ]]; then
  exit 0
fi

# Build gate smoke (only if package.json or vite.config touched recently)
if git diff HEAD --name-only 2>/dev/null | grep -qE "package\.json|vite\.config|tsconfig"; then
  build_output=$(npm run build 2>&1 | tail -5)
  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "BLOCKED: npm run build failed on demo branch" >&2
    echo "$build_output" >&2
    exit 2
  fi
fi

# Report template reminder
cat >&2 <<'EOF'
═══════════════════════════════════════════════════════════════
 ELAB DEMO GUARDRAILS — STOP REPORT TEMPLATE
═══════════════════════════════════════════════════════════════
 Before ending session, ensure response covers:

 ## Cosa ho cambiato
 ## File toccati
 ## Test eseguiti (vitest + playwright se applicabile)
 ## Screenshot/artifact prodotti
 ## Rischi rimasti
 ## Cosa NON ho verificato
 ## Prossimo task consigliato
═══════════════════════════════════════════════════════════════
EOF

exit 0
