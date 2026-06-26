# SECURITY-STATE — ARDESIA / ELAB (2026-06-26)

Wrote `/Users/andreamarro/VOLUME 3/docs/SECURITY-STATE.md`. Read-only audit, every claim backed by a firsthand command (Claim → Evidence). Secret values never printed.

**Bottom line: no active holes in the audited surfaces.** Served API auth-gated, AgentMemory localhost-only, egress sandbox proven, untrusted GUI rejected, headline secrets rotated/deleted. Remaining items are hardening/defense-in-depth, gated on Andrea.

## Verified firsthand
- **Auth-strict ARMED** — `/v1/saved-lessons` returns **401** on junk Bearer AND on no-auth. Important nuance found: `/health` is a **public 200 probe** (returns 200 even with junk), so it is NOT a valid auth test — I re-confirmed auth against a protected route. Served `git_sha=98ac0f4 == auto/main`; `STOP` present; token file mode `600`, 65B.
- **Ports** — `:3111` AgentMemory binds `127.0.0.1` (localhost-only, not on tailnet); `:8200` lessonos binds `*:8200` (tailnet-reachable but auth-gated).
- **Egress sandbox PROVEN** — `egress-verify.sh selftest` → PASS (baseline REACHABLE, strict deny BLOCKED, exit 0); valid because it includes a positive control.
- **llm_wiki REJECTED** — caught opening many external TCP/443 connections at launch (AWS/Google/FCM/GitHub/Cloudflare), SIGKILLed by `gui-egress-guard.sh`; verdict REJECT. TencentDB-Agent-Memory PASSED the same gate (egress-clean keeper).
- **Secrets** — `VITE_ADMIN_PWD_HASH` rotated (24h ago); `VITE_SESSION_SECRET` + `VITE_ACCESS_HASH` deleted (absent from prod env); `VITE_ELAB_API_KEY` = theater, code gate removed in PR #201 (MERGED 4760e2be) but the Vercel var still exists (deletion is migration phase 1-3, pending).
- **Prepared, not applied** — Tailscale ACL (`tailscale-acl-ardesia.jsonc`, apply via admin console), `rotate-served-token.sh` (bootout+bootstrap reload, self-verifies junk=401/new=200).

## Honest nuances flagged
1. `/health` public-200 means the bare "junk=401" claim only holds for **protected** routes — recorded explicitly.
2. Supabase `unlim-chat` edge fix is merged to `main` but **not redeployed** (no auto-deploy) → prod edge still pre-#201 until manual deploy.
3. `VITE_ELAB_API_KEY` neutralized in code but still present in Vercel prod (cleanup pending, not an active hole — the value gated nothing).

## Top-3 follow-ups (gate-Andrea)
- **F1** Redeploy Supabase `unlim-chat` + delete `VITE_ELAB_API_KEY`/`ELAB_API_KEY` (migration phases 1-3).
- **F2** Apply Tailscale ACL (network-layer default-deny over auth).
- **F3** Per-client tokens on `:8200` (today one shared token; rotation is all-or-nothing).