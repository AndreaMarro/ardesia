#!/usr/bin/env bash
# ELAB-specific watchdog checks. Sourced helpers from watchdog-run.sh:
#   log_anomaly TYPE DETAIL [PATTERN_HINT]
#   log_ok CHECK [DETAIL]

set -uo pipefail

CONFIG_FILE=".watchdog-config.json"
RUN_TYPE="${1:-regular}"

PROD_URL=$(jq -r '.prod_url' "$CONFIG_FILE")
EDGE_BASE=$(jq -r '.supabase_edge_base' "$CONFIG_FILE")
RESPONSE_MAX=$(jq -r '.thresholds.response_time_max_seconds // 10' "$CONFIG_FILE")
PR_STUCK_HOURS=$(jq -r '.thresholds.pr_draft_stuck_hours // 2' "$CONFIG_FILE")
CI_FAIL_HOURS=$(jq -r '.thresholds.ci_fail_lookback_hours // 2' "$CONFIG_FILE")
CLI_IDLE_MIN=$(jq -r '.thresholds.cli_idle_minutes // 60' "$CONFIG_FILE")
GH_REPO=$(jq -r '.github_repo' "$CONFIG_FILE")

REQUIRED_ANY=$(jq -r '.principio_zero_v3_patterns.required_any_of[]?' "$CONFIG_FILE")
FORBIDDEN=$(jq -r '.principio_zero_v3_patterns.forbidden[]?' "$CONFIG_FILE")

# === CHECK 1: production root HTTP 200 ===
HTTP_CODE=$(curl -s -m "$RESPONSE_MAX" -o /dev/null -w '%{http_code}' "$PROD_URL")
if [ "$HTTP_CODE" = "200" ]; then
  log_ok "production_root" "$PROD_URL → 200"
else
  log_anomaly "production_down" "$PROD_URL returned $HTTP_CODE (expected 200)" \
    "Check Vercel deploys + service worker precache"
fi

# === CHECK 2: Edge Functions CORS + content + Principio Zero v3 ===
EDGE_FUNCS=$(jq -c '.edge_functions[]?' "$CONFIG_FILE")
while IFS= read -r fn_json; do
  [ -z "$fn_json" ] && continue
  FN_NAME=$(echo "$fn_json" | jq -r '.name')
  PAYLOAD=$(echo "$fn_json" | jq -r '.payload // empty')
  CHECK_TONE=$(echo "$fn_json" | jq -r '.check_tone // false')

  URL="${EDGE_BASE}/${FN_NAME}"

  # CORS preflight
  CORS_CODE=$(curl -s -m "$RESPONSE_MAX" -o /dev/null -w '%{http_code}' \
    -X OPTIONS "$URL" \
    -H "Origin: $PROD_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: apikey,content-type")
  if [ "$CORS_CODE" = "204" ] || [ "$CORS_CODE" = "200" ]; then
    log_ok "edge_${FN_NAME}_cors" "preflight $CORS_CODE"
  else
    log_anomaly "edge_cors_broken" "${FN_NAME} preflight returned $CORS_CODE" \
      "Verify guards.ts Allow-Headers contains apikey + content-type"
  fi

  # POST content (only if anon key + payload available)
  if [ -n "${ELAB_ANON_KEY:-}" ] && [ -n "$PAYLOAD" ]; then
    RESP=$(curl -s -m "$((RESPONSE_MAX + 5))" -X POST "$URL" \
      -H "Content-Type: application/json" \
      -H "apikey: $ELAB_ANON_KEY" \
      -H "Authorization: Bearer $ELAB_ANON_KEY" \
      -H "Origin: $PROD_URL" \
      -d "$PAYLOAD" 2>/dev/null || echo '{"error":"curl_failed"}')

    SUCCESS=$(echo "$RESP" | jq -r '.success // false' 2>/dev/null)
    RESPONSE_TEXT=$(echo "$RESP" | jq -r '.response // .text // empty' 2>/dev/null)

    if [ "$SUCCESS" = "true" ] && [ -n "$RESPONSE_TEXT" ]; then
      log_ok "edge_${FN_NAME}_content" "success=true, response present"

      if [ "$CHECK_TONE" = "true" ]; then
        # Required: at least one of the patterns present
        FOUND_REQUIRED=false
        while IFS= read -r req; do
          [ -z "$req" ] && continue
          if echo "$RESPONSE_TEXT" | grep -qiE "$req"; then
            FOUND_REQUIRED=true
            break
          fi
        done <<< "$REQUIRED_ANY"

        if [ "$FOUND_REQUIRED" = "false" ]; then
          log_anomaly "principio_zero_v3_required_missing" \
            "${FN_NAME} response missing all required patterns (Ragazzi/ragazzi)" \
            "Re-read supabase/functions/_shared/system-prompt.ts BASE_PROMPT"
        fi

        # Forbidden patterns
        while IFS= read -r forb; do
          [ -z "$forb" ] && continue
          if echo "$RESPONSE_TEXT" | grep -qiE "$forb"; then
            log_anomaly "principio_zero_v3_forbidden_found" \
              "${FN_NAME} response contains forbidden pattern: $forb" \
              "BASE_PROMPT regression — verify deploy of system-prompt.ts"
          fi
        done <<< "$FORBIDDEN"

        if [ "$FOUND_REQUIRED" = "true" ]; then
          log_ok "principio_zero_v3_${FN_NAME}" "tone compliant"
        fi
      fi
    elif [ -n "$PAYLOAD" ]; then
      log_anomaly "edge_${FN_NAME}_content_failed" \
        "Response success=false or empty. Raw: $(echo "$RESP" | head -c 200)" \
        "Check Edge Function logs in Supabase dashboard"
    fi
  fi
done <<< "$EDGE_FUNCS"

# === CHECK 3: PR draft stuck > threshold ===
if command -v gh >/dev/null 2>&1; then
  STUCK_PRS=$(gh pr list --repo "$GH_REPO" --draft --json number,title,createdAt --limit 20 2>/dev/null \
    | jq -r --argjson hours "$PR_STUCK_HOURS" '.[] | select(
        ((now - (.createdAt | fromdateiso8601)) / 3600) > $hours
      ) | "#\(.number) \(.title)"')
  if [ -n "$STUCK_PRS" ]; then
    log_anomaly "pr_draft_stuck" "Draft PRs older than ${PR_STUCK_HOURS}h: $STUCK_PRS" \
      "Review and either ready-for-review or close"
  else
    log_ok "pr_draft_age" "No draft PRs older than ${PR_STUCK_HOURS}h"
  fi

  # === CHECK 4: CI failures lookback ===
  CI_FAILS=$(gh run list --repo "$GH_REPO" --limit 30 \
    --json conclusion,createdAt,name 2>/dev/null \
    | jq --argjson hours "$CI_FAIL_HOURS" '[.[] | select(
        .conclusion == "failure" and
        ((now - (.createdAt | fromdateiso8601)) / 3600) < $hours
      )] | length')
  if [ "$CI_FAILS" -gt 3 ]; then
    log_anomaly "ci_failure_burst" "$CI_FAILS CI failures in last ${CI_FAIL_HOURS}h" \
      "Check workflow logs for common root cause (missing secret, dep change)"
  else
    log_ok "ci_failures_${CI_FAIL_HOURS}h" "$CI_FAILS failures (threshold 3)"
  fi
fi

# === CHECK 5: Monitored branches idle (no commits in window) ===
MONITORED=$(jq -r '.monitored_branches[]?' "$CONFIG_FILE")
git fetch --quiet origin 2>/dev/null || true
while IFS= read -r BRANCH; do
  [ -z "$BRANCH" ] && continue
  if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
    LAST_COMMIT_TS=$(git log -1 --format=%ct "origin/$BRANCH" 2>/dev/null || echo 0)
    NOW=$(date -u +%s)
    IDLE_MIN=$(( (NOW - LAST_COMMIT_TS) / 60 ))
    if [ "$IDLE_MIN" -gt "$CLI_IDLE_MIN" ]; then
      log_ok "branch_${BRANCH//\//_}_idle" "${IDLE_MIN}m since last commit"
    else
      log_ok "branch_${BRANCH//\//_}_active" "${IDLE_MIN}m since last commit"
    fi
  fi
done <<< "$MONITORED"

exit 0
