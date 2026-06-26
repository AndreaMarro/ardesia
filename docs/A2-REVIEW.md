`vercel.json` on disk matches the VERCEL-DEEP-AUDIT claim exactly (`builds` + `@vercel/python` + `includeFiles:{lessonos.db,assets/**,lessonos/**}`). egress-verify.sh exists. All load-bearing claims verified. 

One precision note: VERCEL-DEEP-AUDIT explicitly corrects the project memory's "empty vercel.json/no functions" framing, stating the real error was an unmatched function pattern — this is the doc being *more* honest than the seed facts, which is good adversarial behavior, not a defect.

Here is my A2 review.

---

# A2-REVIEW — ARDESIA Doc Set (2026-06-26)

**Reviewer:** A2 adversarial. **Method:** every load-bearing claim re-verified firsthand (curl tunnels, `gh` API, `git`/branch SHAs, source code grep, `tailscale status`, `ollama list`, on-disk config). **Verdict basis:** FAIL = exposed secret value / claimed-but-untaken mutating action (prod deploy, main-merge, force, destructive delete, PII) / asserted unverified fact. WARN = honest but with a gap, soft spot, or minor imprecision. PASS = evidence-grounded, no holes.

## Bottom line: PASS overall. Zero FAILs.
No doc exposes a secret value. No doc claims a gated mutating action was *performed* — the two `vercel --prod` strings both live inside explicitly-labeled DO-NOT-EXECUTE / GATE-Andrea rollback blocks. Every spot-checkable fact I re-ran matched. This is an unusually disciplined set: two docs (VERCEL, PRODUCT) actively *correct* the project-memory seed rather than parrot it.

## Firsthand re-verification (Claim → my Evidence)
- Served tunnel `/health` → `{"corpus":{"name":"served","segments":1224},"git_sha":"98ac0f4"}`; `/v1/saved-lessons` junk-Bearer → **401**, no-auth → **401**. ✓ (FABBRICA, PRODUCT, DEPLOYMENT, SECURITY all consistent)
- Vercel `/health` → `{"corpus":{"name":"lessonos","segments":4}}`; `/docs` → 200. ✓ (the 4-segment gap is real)
- Bundled `assets/segments.jsonl` = **161 lines** (PRODUCT-STATE's exact "161" claim). ✓
- `gh`: elab-tutor open PRs = **#194 #195 #196 #197 #199 #200** (6); #201 MERGED `4760e2be`; #198 MERGED `d3589ac6`. ✓
- elab-tutor branches = **816 total, 658 `mac-mini/*`**. ✓ (exact)
- ardesia main `02973e0`; lessonos auto/main `98ac0f4`, main `92e393d`; lessonos PR #3 (auto/main→main); ardesia PRs #1/#2 draft+CONFLICTING. ✓
- `guards.ts:66-82` fail-CLOSED-in-prod logic (DENO_DEPLOYMENT_ID gate, `server_misconfigured` 401, `missing X-Elab-Api-Key` 401). ✓ (matches Supabase runbook verbatim)
- `tailscale status`: macbook-air + mac-mini active/direct + iphone-13-pro **offline, last seen 12d**. ✓
- `vercel.json` on disk = `builds`+`@vercel/python`+`includeFiles:{lessonos.db,assets/**,lessonos/**}`. ✓

## Per-doc verdict table

| Doc | Verdict | Note |
|---|---|---|
| REPO-BRANCH-MAP.md | **PASS** | All SHAs/branch counts re-verified exact (816/658, 02973e0, 98ac0f4, 92e393d). |
| PR-MAP-TRIAGE.md | **PASS** | PR states/merge SHAs match `gh`. Triage verdicts are clearly labeled *recommendations*, no merge claimed. |
| VERCEL-DEEP-AUDIT.md | **PASS** | Best doc. Corrects the memory's "empty vercel.json" myth with the precise build error; gates `vercel --prod`/`rm`/`env` as Andrea-only. |
| SECURITY-STATE.md | **PASS** | `Bearer junk-token-12345` is an intentional negative-test token, NOT a secret. Correctly flags `/health` as a non-valid auth probe. |
| FABBRICA-STATE.md | **PASS** | STOP sentinel + quiesced loop + 98ac0f4 + gate 3760/0 all internally consistent with served health. |
| PRODUCT-STATE.md | **PASS (with the one honest caveat below)** | Names the corpus gap loudly (4 vs 1224). |
| DEPLOYMENT-MAP.md | **WARN** | Content correct, but it prints the **live cloudflared quick-tunnel hostname** (`legislature-poetry-financing-approved.trycloudflare.com`). Not a secret, but it's a real reachable ingress to an auth-gated-but-internet-exposed `:8200`. Treat the hostname as semi-sensitive; prefer referencing by role. Minor typo: "`==auth/main`" should read `auto/main` (appears twice). |
| SUPABASE-UNLIM-CHAT-RUNBOOK.md | **PASS** | Prepared/gated; the `vercel --prod` is inside a rollback fence with values pulled "from vault, never printed." Correctly separates the two 401 layers. |
| LOCAL-FIRST-MULTIDEVICE-ARCHITECTURE.md | **WARN** | Honest — it explicitly says the iphone is "last seen 12d ago" and only "enrolled." But the §11-A summary line "Multi-device mesh is **live**" overstates a mesh whose only client node has been offline 12 days. Downgrade "live" to "2 active + 1 enrolled-but-offline." |

## Honest weaknesses flagged (the substance, not theater)
1. **Web corpus = 4 segments — the real gap, well-surfaced.** Every doc that touches it (PRODUCT, DEPLOYMENT, REPO-BRANCH-MAP TL;DR) calls it out instead of hiding it. PRODUCT-STATE goes further and exposes a *second* internal inconsistency in the supply chain: the deploy-source bundle has **161** segments, the served engine has **1224**, yet the deployed mirror serves **4**. So the mirror isn't even serving the 161 it bundles — corpus population is broken at *two* hops, not one. This is the single most important finding in the set and it is stated plainly. Good.
2. **DEPLOYMENT-MAP leaks the tunnel hostname** (see WARN). The tunnel is auth-gated (verified 401), so this is low-severity, but a public-internet ingress hostname in a doc that may be committed is worth scrubbing.
3. **LOCAL-FIRST "mesh is live"** rests on a node offline for 12 days. The body text is honest; only the summary verb oversells.
4. **`==auth/main` typos** in DEPLOYMENT-MAP — cosmetic, but in a Claim→Evidence doc a wrong branch name undercuts trust.

## Adversarial conclusion
Nothing here fabricates a deploy, a merge, a force-push, a deletion, or a secret. The two genuinely risky strings (`vercel --prod`) are both fenced as non-executed/gated. The numbers I could check all held to the digit. Recommended fixes before this set is considered final: (a) scrub the cloudflared hostname in DEPLOYMENT-MAP, (b) fix `auth/main`→`auto/main`, (c) soften LOCAL-FIRST's "mesh is live" to reflect the 12-day-offline client. None are blocking. **Ship after those three cosmetic/hygiene edits.**