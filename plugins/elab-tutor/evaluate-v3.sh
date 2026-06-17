#!/usr/bin/env bash
# evaluate-v3.sh — ELAB elab-builder quality score (v3)
# Usato dall'automa per misurare il punteggio prima/dopo ogni ciclo.
# Output: un numero decimale su stdout (es. 9.22)
# Exit 0 sempre (non blocca il loop anche se build fallisce).

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

SCORE=0
MAX=10
DETAILS=()

# ── 1. BUILD (2 pt) ──────────────────────────────────────────────────────────
BUILD_SCORE=0
if npm run build --silent > /tmp/elab-build.log 2>&1; then
  BUILD_SCORE=2
  DETAILS+=("build: 2/2 PASS")
else
  DETAILS+=("build: 0/2 FAIL")
fi

# ── 2. UNIT TESTS (2 pt) ─────────────────────────────────────────────────────
TEST_SCORE=0
if npm test -- --run --silent > /tmp/elab-test.log 2>&1; then
  TOTAL=$(grep -oE 'Tests\s+[0-9]+ passed' /tmp/elab-test.log | grep -oE '[0-9]+' | head -1 || echo 0)
  if [ "${TOTAL:-0}" -ge 1462 ]; then
    TEST_SCORE=2
    DETAILS+=("tests: 2/2 PASS (${TOTAL} tests)")
  elif [ "${TOTAL:-0}" -ge 1000 ]; then
    TEST_SCORE=1
    DETAILS+=("tests: 1/2 PARTIAL (${TOTAL} tests)")
  else
    TEST_SCORE=0
    DETAILS+=("tests: 0/2 FAIL (${TOTAL:-0} tests)")
  fi
else
  DETAILS+=("tests: 0/2 FAIL")
fi

# ── 3. SEO — canonical URL corretto (0.5 pt) ─────────────────────────────────
SEO_SCORE=0
if grep -q 'canonical.*elabtutor\.school' index.html && grep -q 'og:url.*elabtutor\.school' index.html; then
  SEO_SCORE=1
  DETAILS+=("seo-canonical: 1/1 PASS")
else
  DETAILS+=("seo-canonical: 0/1 FAIL (vercel url still present)")
fi

# ── 4. WCAG — VetrinaSimulatore colori (#556374 vs soglia) (0.5 pt) ──────────
WCAG_SCORE=0
WCAG_FILE="src/components/VetrinaSimulatore.module.css"
if [ -f "$WCAG_FILE" ]; then
  # Check that old low-contrast colors are gone
  if ! grep -qE '#6B7D94|#6B7A8D|#7A8A9A' "$WCAG_FILE"; then
    WCAG_SCORE=1
    DETAILS+=("wcag-vetrina: 1/1 PASS (no low-contrast colors)")
  else
    DETAILS+=("wcag-vetrina: 0/1 FAIL (low-contrast colors found)")
  fi
else
  DETAILS+=("wcag-vetrina: 0/1 SKIP (file not found)")
fi

# ── 5. UNLIM — beforeunload named handler (0.5 pt) ───────────────────────────
UNLIM_SCORE=0
UNLIM_FILE="src/services/unlimMemory.js"
if [ -f "$UNLIM_FILE" ]; then
  if grep -q '_beforeUnloadHandler' "$UNLIM_FILE"; then
    UNLIM_SCORE=1
    DETAILS+=("unlim-handler: 1/1 PASS")
  else
    DETAILS+=("unlim-handler: 0/1 FAIL (anonymous handler)")
  fi
else
  DETAILS+=("unlim-handler: 0/1 SKIP (file not found)")
fi

# ── 6. CSP — no frame-ancestors in meta tag (0.5 pt) ────────────────────────
CSP_SCORE=0
if ! grep -q 'frame-ancestors' index.html; then
  CSP_SCORE=1
  DETAILS+=("csp-meta: 1/1 PASS (no frame-ancestors in meta)")
else
  DETAILS+=("csp-meta: 0/1 WARNING (frame-ancestors in meta tag is redundant)")
fi

# ── 7. BUNDLE SIZE — precache < 2500 KB (0.5 pt) ────────────────────────────
BUNDLE_SCORE=0
if [ -f /tmp/elab-build.log ]; then
  PRECACHE_KB=$(grep -oE 'precache.*\(([0-9]+\.[0-9]+) KiB\)' /tmp/elab-build.log | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo 9999)
  if [ "$(echo "$PRECACHE_KB < 2500" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
    BUNDLE_SCORE=1
    DETAILS+=("bundle: 1/1 PASS (${PRECACHE_KB} KiB)")
  else
    DETAILS+=("bundle: 0/1 FAIL (${PRECACHE_KB:-?} KiB >= 2500)")
  fi
fi

# ── 8. INFRA — evaluate-v3.sh + AUTOPILOT.md exist (0.5 pt) ─────────────────
INFRA_SCORE=0
if [ -f "evaluate-v3.sh" ] && [ -f "AUTOPILOT.md" ]; then
  INFRA_SCORE=1
  DETAILS+=("infra: 1/1 PASS (evaluate-v3.sh + AUTOPILOT.md present)")
else
  DETAILS+=("infra: 0/1 FAIL (missing evaluate-v3.sh or AUTOPILOT.md)")
fi

# ── TOTAL ────────────────────────────────────────────────────────────────────
TOTAL_RAW=$((BUILD_SCORE*100 + TEST_SCORE*100 + SEO_SCORE*50 + WCAG_SCORE*50 + UNLIM_SCORE*50 + CSP_SCORE*50 + BUNDLE_SCORE*50 + INFRA_SCORE*50))
# Max raw = 200+200+50+50+50+50+50+50 = 700  → map to 10
SCORE=$(echo "scale=2; 5 + ($TOTAL_RAW * 5) / 700" | bc -l 2>/dev/null || echo "?")

# ── OUTPUT ───────────────────────────────────────────────────────────────────
echo "=== ELAB evaluate-v3 ==="
for d in "${DETAILS[@]}"; do echo "  $d"; done
echo "========================"
echo "SCORE: ${SCORE}/10"
