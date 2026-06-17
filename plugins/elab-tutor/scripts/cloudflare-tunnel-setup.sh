#!/bin/bash
# ELAB Cloudflare Tunnel Setup — gpu.elabtutor.school production routing
# Sprint S iter 3+ — 2026-04-26
#
# Strategy A confirmed by Andrea (2026-04-26):
#   - Vercel DNS resta primario (no migration)
#   - Cloudflare gestisce SOLO Tunnel (named tunnel via API)
#   - Vercel DNS aggiunge CNAME gpu.elabtutor.school -> <tunnel-id>.cfargotunnel.com
#   - Production unlim-chat punta a https://gpu.elabtutor.school via auth header X-Elab-Api-Key
#
# Pre-conditions:
#   - CLOUDFLARE_API_TOKEN with Tunnel:Edit + Account:Edit (verified 2026-04-26)
#   - CLOUDFLARE_ACCOUNT_ID = 31b0f72ef02445f6a9987c994fe17b56
#   - VERCEL_API_TOKEN (NOT YET PROVIDED — defer until ready)
#   - RunPod pod RUNNING with all services on localhost:8000 nginx gateway
#
# Steps:
#   1. Cloudflare: create named tunnel via API → get tunnel-id + tunnel-token
#   2. Inside pod: install cloudflared + configure tunnel + start service
#   3. Vercel: add CNAME gpu -> <tunnel-id>.cfargotunnel.com (manual via console OR API)
#   4. Verify https://gpu.elabtutor.school responds with 401 (auth required)
#   5. Edge Function: add VPS_GPU_URL=https://gpu.elabtutor.school + ELAB_GPU_API_KEY env
#
# Usage:
#   POD_SSH_HOST="195.26.233.61"
#   POD_SSH_PORT="25693"
#   POD_ID="3w1qzszkgkzcz3"
#   bash scripts/cloudflare-tunnel-setup.sh
#
# (c) Andrea Marro — Sprint S iter 3+

set -euo pipefail

[ -z "${CLOUDFLARE_API_TOKEN:-}" ] && source ~/.elab-credentials/sprint-s-tokens.env
[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] && CLOUDFLARE_ACCOUNT_ID="31b0f72ef02445f6a9987c994fe17b56"
TUNNEL_NAME="elab-gpu-${TUNNEL_ENV:-prod}"
TUNNEL_HOST="${TUNNEL_HOST:-gpu.elabtutor.school}"
POD_SSH_HOST="${POD_SSH_HOST:?need POD_SSH_HOST}"
POD_SSH_PORT="${POD_SSH_PORT:?need POD_SSH_PORT}"

echo "════════════════════════════════════════════════════════════"
echo "ELAB Cloudflare Tunnel Setup"
echo "  Tunnel name:   $TUNNEL_NAME"
echo "  Hostname:      $TUNNEL_HOST"
echo "  Pod SSH:       ${POD_SSH_HOST}:${POD_SSH_PORT}"
echo "════════════════════════════════════════════════════════════"

# ── Step 1: Create tunnel via Cloudflare API ──
echo ""
echo "[1] Cloudflare: create named tunnel"

TUNNEL_SECRET=$(openssl rand -base64 32)
CREATE_RESP=$(curl -sS -X POST \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/tunnels" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg name "$TUNNEL_NAME" --arg secret "$TUNNEL_SECRET" \
        '{name:$name, tunnel_secret:$secret, config_src:"cloudflare"}')")

echo "$CREATE_RESP" | jq .

TUNNEL_ID=$(echo "$CREATE_RESP" | jq -r '.result.id')
[ "$TUNNEL_ID" = "null" ] && { echo "ERROR: tunnel creation failed"; exit 1; }
TUNNEL_TOKEN=$(echo "$CREATE_RESP" | jq -r '.result.token // empty')

# Get tunnel token (separate call needed for token retrieval)
TUNNEL_TOKEN=$(curl -sS \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/tunnels/${TUNNEL_ID}/token" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq -r '.result')

echo ""
echo "Tunnel created:"
echo "  ID:       $TUNNEL_ID"
echo "  Token:    [REDACTED — saved to ~/.elab-credentials/cloudflare-tunnel.env]"
echo "  CNAME:    ${TUNNEL_ID}.cfargotunnel.com"
echo ""

# Save tunnel info
cat > ~/.elab-credentials/cloudflare-tunnel.env << EOF
TUNNEL_ID=$TUNNEL_ID
TUNNEL_TOKEN=$TUNNEL_TOKEN
TUNNEL_NAME=$TUNNEL_NAME
TUNNEL_HOSTNAME=$TUNNEL_HOST
TUNNEL_CNAME_TARGET=${TUNNEL_ID}.cfargotunnel.com
EOF
chmod 600 ~/.elab-credentials/cloudflare-tunnel.env

# ── Step 2: Configure tunnel ingress (route hostname → service) ──
echo "[2] Cloudflare: configure tunnel ingress"

curl -sS -X PUT \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/tunnels/${TUNNEL_ID}/configurations" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg host "$TUNNEL_HOST" '{
        config: {
            ingress: [
                { hostname: $host, service: "http://localhost:8000" },
                { service: "http_status:404" }
            ]
        }
    }')" | jq '.success, .errors'

# ── Step 3: Install + start cloudflared inside pod ──
echo ""
echo "[3] Pod: install cloudflared + start tunnel service"

ssh -i ~/.ssh/id_ed25519_runpod -o BatchMode=yes \
    "root@${POD_SSH_HOST}" -p "${POD_SSH_PORT}" \
    "bash -c '
        set -e
        echo \"Installing cloudflared...\"
        curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
            -o /usr/local/bin/cloudflared
        chmod +x /usr/local/bin/cloudflared
        echo \"Starting tunnel...\"
        nohup /usr/local/bin/cloudflared tunnel --no-autoupdate run --token $TUNNEL_TOKEN > /workspace/cloudflared.log 2>&1 &
        sleep 5
        echo \"Tunnel status:\"
        ps aux | grep cloudflared | grep -v grep | head -2
    '"

# ── Step 4: Vercel DNS — manual step (no Vercel API token yet) ──
echo ""
echo "[4] Vercel DNS: ADD CNAME (manual step required)"
echo ""
echo "    Andrea: open https://vercel.com/dashboard"
echo "    -> elabtutor.school project -> Settings -> Domains"
echo "    -> Add CNAME:"
echo "       Name:   gpu"
echo "       Value:  ${TUNNEL_ID}.cfargotunnel.com"
echo "       TTL:    Auto (60 default)"
echo ""
echo "    OR via Vercel API (if VERCEL_API_TOKEN provided):"
echo "    bash scripts/vercel-dns-add-cname.sh gpu ${TUNNEL_ID}.cfargotunnel.com"
echo ""

# ── Step 5: Verification ──
echo "[5] Verify (after DNS propagation ~60s)"
echo ""
echo "    Wait 60s then test:"
echo "    curl -sSI https://gpu.elabtutor.school/health"
echo "    Expected: HTTP/2 401 (auth required, gateway active)"
echo ""
echo "    With auth:"
echo "    curl -sS https://gpu.elabtutor.school/health -H 'X-Elab-Api-Key: <key>'"
echo "    Expected: {\"status\":\"ok\",\"stack\":\"elab-vps-gpu\"}"
echo ""

# ── Step 6: Edge Function env update ──
echo "[6] Supabase Edge Function env (production wire-up):"
echo ""
echo "    SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set \\"
echo "        VPS_GPU_URL=https://gpu.elabtutor.school \\"
echo "        ELAB_GPU_API_KEY=<from-pod-bootstrap>"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "Tunnel setup COMPLETE"
echo "Logs (pod): ssh ... 'tail -f /workspace/cloudflared.log'"
echo "Tunnel info: ~/.elab-credentials/cloudflare-tunnel.env"
echo "════════════════════════════════════════════════════════════"
