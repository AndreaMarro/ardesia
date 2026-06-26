# ARDESIA — Product State (2026-06-26)

State-of-the-product doc written to `/Users/andreamarro/VOLUME 3/docs/PRODUCT-STATE.md`. All claims backed by firsthand checks (Claim → Evidence). Read-only; nothing mutated. The `PostToolUse` semgrep error on write is the known innocuous `SEMGREP_APP_TOKEN`-absent warning (per project memory) — the file wrote successfully.

## TL;DR status table (in the doc)

| Component | State | Verdict |
|---|---|---|
| lessonos `:8200` | 🟢 Live, auth-strict | 1224 segs served, `git_sha=98ac0f4`, junk-Bearer→401 |
| elab-tutor web/sim/Galileo | 🟢 Prod live | `www.elabtutor.school`=200; #201 merged→`main` HEAD `4760e2be` |
| Web moat API (Vercel) | 🟡 **Live but near-empty** | `/health`=200 public, **corpus.segments=4** (the GAP) |
| TencentDB memory | 🟢 A/B-proven, local | recall@10 **0.475** ≥ AgentMemory 0.442, egress-clean |
| Obsidian view layer | 🟢 Installed | Obsidian.app over 156-file vault |
| Egress-guard | 🟢 Proven | selftest PASS; llm_wiki caught+killed+REJECTED |

## Honest core finding (web corpus gap)
The public Vercel moat (`ardesia-api-vercel.vercel.app`) is **served-but-nearly-empty**: `/health` reports `segments: 4`, while the deploy source bundles 161 segments and the real served engine holds 1224. Infra works (deploys, public, edge `fra1`), data does not flow through. Highest-value fix is corpus population on the mirror, not infra.

## Other honest gaps flagged in the doc
- elab Supabase edge unlim-chat not redeployed (no auto-deploy).
- 6 elab PRs open (incl. #196 consent, #199 lint gate).
- `/v1/packages` + `/health/ready` = 404 on the Vercel deploy.
- TencentDB L1/L2/L3 synthesis configured but async idle-gated (unproven extraction quality).

## Notable nuance vs. F0 facts
F0 listed served `git_sha=98ac0f4` and web corpus=4. Confirmed both firsthand, and additionally found the served-engine corpus is **1224 segments** (name=`served`), so the doc distinguishes the rich served engine (§1) from the empty public mirror (§3) — the gap is sharper than "corpus=4" alone conveys (4 deployed vs 1224 served vs 161 bundled).