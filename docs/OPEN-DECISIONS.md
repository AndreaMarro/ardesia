# OPEN-DECISIONS (awaiting Andrea)

Source: WF1 audit (2026-06-25). Decisions — not just mechanical actions — that need an explicit Andrea call. Each lists the question, the options the audit surfaced, and the evidence basis.

## 1. Arm prod auth / publish the moat API

**Question:** how to make `ardesia-api-vercel` publicly reachable.
**Options (audit Vercel area):**
- (a) Attach a **custom/exempt domain** — ssoProtection exempts custom domains → public, no token, no proxy (cleanest).
- (b) Thin **same-origin server-side proxy** injecting a Vercel protection-bypass token — keeps `AI_GATEWAY_API_KEY`/`TURSO_*` server-side.
**Also required:** an authorized `vercel --prod` redeploy to clear the current Error/404 (on-disk vercel.json fix is correct).

## 2. Prod redeploy of ardesia-api-vercel

**Question:** trigger the `vercel --prod` redeploy now (from the intact on-disk tree) to clear the 404?
**Basis:** prod deploy `ct10aohku` failed build; the working build only exists as the SSO-gated preview `neaicikfq`. Only Andrea triggers prod.

## 3. Merge the ratifica PRs

**Question:** merge lessonos #3 (BLOCKED) and ardesia-studio #2 (CLEAN)?
**Open sub-question:** lessonos #3 is BLOCKED despite no protection on its base `auto/main` — the block is on the base/`main` side or an uninspected check; needs a decision on how to clear it.

## 4. Studio lineage swap

**Question:** reconcile ardesia-studio mini `auto/main` `899a350` vs GitHub `auto/main` `f881a78`.
**Options:** force-push the mini head onto GitHub `auto/main`, OR merge `studio/consolidate-2026-06-25` (`899a350`) into it. The `899a350` SHA already exists on GitHub via `studio/consolidate-*`, so the work is durable; this is a tidy-up/lineage call, not a data-loss risk.

## 5. The 22-file reimport (local-only tech work durability)

**Question:** push the local-only tech branches / commits so factory work is durable on GitHub.
**Basis:** the 3 confirmed local-only tech branches (`lessonos/fix/auth-validator-flag-gated`, `lessonos/feat/mcp-stdio-transport`, `ardesia/ci/engine-sync-guard`) plus the broader set of `claude/*`, `t6r/*`, `merge/serving-backport` branches and ~332 unpushed studio commits exist only on the mini due to the local-bare-origin lineage trap. Decide which to push.

> Note: "22-file reimport" tracks the broader reconcile-local-to-GitHub decision; the audit confirmed the 3 named tech branches firsthand and the lineage trap mechanism. The exact file/branch reimport set is an Andrea-curated subset.

## 6. Branch protection

**Question:** add protection to the 5 unprotected default branches, starting with canonical `lessonos/auto/main` and `ardesia/main`?
**Basis:** only `ardesia-studio/main` (gate) and `elab-tutor/main` (weak) are protected; the canonical factory lines can be force-pushed by anything.

## 7. ELAB cleanup

**Question:** prune the elab-tutor branch explosion (~700 `mac-mini/iter36-user-sim-*` + ~33 `auto/test-*`) and triage/close the 14 stale PRs?
**Basis:** 815 branches; 14 stale PRs (graveyard). Recommended order: merge #198 keystone → close #161/#171/#154–#158 → rebase #196/#199 onto #198 → bulk-prune noise branches. Verify #154–#158 don't drop still-valid compile-home fixes before closing (audit unknown).

## 8. llm_wiki install + ingest

**Question:** adopt nashsu/llm_wiki (GPLv3) in sandbox?
**Audit decision:** SANDBOX-ADOPT (P1), gated on a firsthand egress audit before any real/PII data. Sub-decisions: install via prebuilt `.dmg` (Rust toolchain absent → no build-from-source); pre-configure provider=Ollama + MinerU-off + web-search-off; choose Ollama model (qwen2.5:7b vs qwen3:4b) for generation. Reject only if Ollama-mode still phones home (must be tested, not assumed).

## Cross-cutting note

None of these are blocked by code. Every item is a human gate (write to GitHub/Vercel, merge/close, prod deploy, secret rotation, new-system install). The audit was strictly read-only.
