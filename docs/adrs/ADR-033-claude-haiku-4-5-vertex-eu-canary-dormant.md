# ADR-033 — Claude Haiku 4.5 Vertex EU canary — DORMANT pending quota grant + priority redirect

**Status**: PROPOSED (NOT ACCEPTED — bench never executed)
**Date**: 2026-05-13 | **Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Iter**: 49 | **Score Sprint U cycle**: 7.0/10 ONESTO

---

## 1. Context

Iter 47 shipped Claude Haiku 4.5 Vertex AI EU multi-region canary code (~210 LOC across
`vertex-claude-client.ts`, `router.ts`, `llm-client.ts`, `types.ts`, `unlim-chat/index.ts`).
Iter 48 enabled Anthropic Model Garden + accepted ToS via Chrome MCP + submitted 16 quota
mod requests across 5 endpoint paths (EU multi-region + global + europe-west1 + us-east5 +
US multi-region).

Iter 49 entrance: Google Cloud Support response 2026-05-13 17:09-17:10 CEST:

> "Unfortunately, we are unable to grant you additional quota at this time. If this is a new
> project please wait 48h until you resubmit the request or until your Billing account has
> additional history."

Hard fail. Project `gen-lang-client-0481225485` has Vertex Gemini history (iter 39+) but
zero Anthropic billing history. Anthropic gatekeeping prevents canary bench execution.

Andrea iter 49 mandate: "prendi la decisione che non escluda evoluzioni future, ma che porti
massima qualità e beneficio. no compiacenza. usa codex gpt 5.5."

---

## 2. Decision

**Adopt DORMANT RETENTION** with explicit reactivation criteria + sunset criteria.

Rationale (Karpathy + GSD-2 no-complacency, Codex gpt-5.5 verified):

1. **iter 46 v78 Flash plain ALREADY meets Andrea iter 46 mandate** "9681ms troppo lungo".
   Live empirical 4.6s avg deep-thinking p50 (3-run bench LIVE prod). Adding Claude is
   marginal speculative optimization, NOT problem-driven.

2. **ELAB business gates NOT chat latency <4s**. Higher-leverage iter 49+ priorities:
   - 92 esperimenti audit Playwright UNO PER UNO (Andrea iter 21 mandate, ~3h)
   - Linguaggio codemod 200 violations singolare→plurale (Andrea iter 21 mandate, ~4h)
   - Vol3 narrative refactor (Davide co-author iter 25+, ~8h)
   - 1000-q regression matrix full re-run post iter 46 (~30 min)
   - R5 50q quality re-bench v78 Flash (~30 min)
   These directly move product forward; Haiku marginal latency does not.

3. **Provider lock-in risk**: current 3-provider chain (Gemini + Mistral + Brain) robust.
   4° provider Anthropic = ops surface doubled + Anthropic future quota/pricing exposure.

4. **Codex gpt-5.5 audit found**: code production-safe DORMANT state (8 low findings),
   1 medium fix shipped iter 49 (`vertex-claude-client.ts:142` empty content throw).

5. **Door OPEN future**: code retained repo, env flag default false, ADR criteria for
   reactivation explicit. Sales Rep / billing maturation paths preserved.

**REJECTED alternatives**:

- ❌ Permanent decommission (loses optionality, sunk cost ~25 min Console + 210 LOC code)
- ❌ Sales Rep escalation iter 49 (premature commitment without bench data)
- ❌ AWS Bedrock alternative (~4h impl, same quota blocker pattern likely)
- ❌ Idle wait without protocol (no recovery path defined = drift risk)

---

## 3. Dormant state production-safe (Codex gpt-5.5 verified iter 49)

| File:line | Finding | Severity | Action |
|-----------|---------|----------|--------|
| `router.ts:69-76` | Dormant default safe — Claude route requires Deno env `true` exact match | low | Keep as-is |
| `llm-client.ts:399-424` | Claude failures caught, fall-through to Vertex Gemini works | low | Keep as-is |
| `llm-client.ts:427-445` | Fall-through requires `ENABLE_VERTEX_EU=true` (currently true prod) | low | Keep as-is |
| `llm-client.ts:437-444` | Vertex Gemini defensive collapse to `gemini-2.5-flash-lite` if upstream non-Gemini | low | Keep as-is |
| `types.ts:126-134` | `GeminiModel` union extension runtime-safe, naming misleading | low | Rename to `ProviderModel` iter 60+ if dormancy lifts |
| `vertex-claude-client.ts:113-118` | Fetch network failures → `API_ERROR`, llm-client fallback OK | low | Keep as-is |
| `vertex-claude-client.ts:122-127` | HTTP error mapping correct (401/403 = AUTH, others = API) | low | Keep as-is |
| `vertex-claude-client.ts:133-142` | **Empty content[] returned empty text silently** — bypass fallback | **medium** | **FIXED iter 49**: throw API_ERROR on empty |
| `router.ts:116-124` | `routeThinkingLevel` returns 'medium' only for explicit Pro | low | Keep as-is |

**Iter 49 surgical fix**: `vertex-claude-client.ts:142` empty content throw added (+8 LOC).

---

## 4. Reactivation criteria (ALL required)

Claude path reactivation gated on these criteria being met TOGETHER:

a. **Quota grant confirmed** — Anthropic approves quota increase via Console
   `Richieste di aumento` tab. Email cloudquota@google.com confirmation OR Sales Rep notif.

b. **Live probe Status 200** — `/tmp/probe-vertex-claude-v2.ts` Deno test against
   chosen endpoint (EU multi-region default, europe-west1 fallback) returns 200 with
   valid Anthropic Messages API response body.

c. **Quality bench A/B parity OR superior** — R5-style 10 prompt × 3 run bench Haiku vs
   Flash plain v78 measured via 12-rule scorer (plurale "Ragazzi", Vol/pag verbatim, kit
   fisico mention, ≤120 word, analogia optional, no JSON leak). Haiku must score ≥ Flash
   on aggregate. If Haiku quality < Flash on any single rule → REJECT.

d. **Latency p95 ≤ Flash equivalent** — 3-run avg ≤ 5.0s (iter 46 v78 baseline 4.6s).
   If p95 > 5.0s → REJECT.

e. **Cost analysis acceptable** — Haiku Vertex regional/multi-region $1.10/$5.50 per 1M
   tok (+10% premium vs global). For ELAB <5% deep-thinking traffic, monthly cost
   projection ≤ €5/scuola @ 45k req/mese. If projected > €10/scuola → REJECT.

f. **Andrea explicit ratify** — Andrea reviews bench results audit doc + signs off
   activation via `supabase secrets set ENABLE_VERTEX_CLAUDE_THINKING=true`.

g. **PRINCIPIO ZERO + MORFISMO compliance** — bench responses verified Italian
   educational tone narratore volumi style (Sense 2 morphic alignment). Anthropic safety
   alignment compatible K-12 minor mediation context.

---

## 5. Sunset criteria (ANY triggers garbage-collect)

If ANY of these conditions materialize → remove Claude code from repo iter N:

- 3 consecutive quota denial cycles (iter 49 + 7d + 14d + 21d → all denied)
- Anthropic pricing increase >2x current Haiku rate ($2.20/$11 per 1M)
- Anthropic Vertex EU regional/multi-region availability removed
- Mistral or future provider demonstrates Haiku-equivalent latency + quality at lower cost
- Andrea explicit decision after 90 days dormancy

Garbage-collect actions:
1. Delete `supabase/functions/_shared/vertex-claude-client.ts`
2. Revert `llm-client.ts` Claude branch (~33 LOC)
3. Revert `router.ts` Claude gate (~18 LOC)
4. Revert `types.ts` GeminiModel Claude entry
5. Revert `unlim-chat/index.ts` source field branch
6. Mark ADR-033 status DEPRECATED + sunset audit doc

---

## 6. Passive retry protocol

**Cron retry schedule**:
- T+7d (2026-05-20): re-probe Deno + check quota Console
- T+14d (2026-05-27): if denied, escalate via Sales Rep contact form
- T+30d (2026-06-12): if denied, evaluate sunset criteria #1 trigger

**Manual triggers Andrea**:
- Billing account matures + Andrea wants retry → resubmit Console request
- Sales Rep contacts Andrea unsolicited → evaluate offer
- Anthropic public announcement of EU billing changes → re-evaluate

---

## 7. Priority redirect iter 49+ (honest no-compiacenza)

While Claude path dormant, Andrea dev hours iter 49+ allocated:

| Priority | Task | Cost | Business impact |
|----------|------|------|-----------------|
| P0 | 1000-q regression matrix full re-run post iter 46 v78 | 30 min | Verify iter 41 v67 100% PASS preserved |
| P0 | R5 50q quality re-bench v78 Flash | 30 min | Empirical quality baseline |
| P0 | 92 esperimenti audit Playwright (Andrea iter 21 mandate) | 3h | Teacher product gate |
| P1 | Linguaggio codemod 200 violations singolare→plurale | 4h | PRINCIPIO ZERO compliance |
| P1 | Vol3 narrative refactor (Davide co-author) | 8h | MORFISMO Sense 2 alignment |
| P2 | Off-topic "storia" envelope deep fix (api.js:783 iter 45 carryover) | 1h | False-positive reduction |
| P2 | R7 canonical INTENT rate post Mistral function calling (iter 45 carryover) | 2h | Onnipotenza measurement |
| P3 | Lighthouse perf optim ChatbotOnly + EasterModal (iter 38 carryover) | 4h | UX polish |

Total focus iter 49-52: ~23h Andrea dev → ~5x more product impact than speculative
Claude bench (~2h iter + 48h block + 50% denial risk).

---

## 8. Cost analysis (sunk vs go-forward)

**Sunk cost iter 47-48 (NOT recoverable, NOT reason to continue)**:
- ~25 min Chrome MCP Console actions
- ~210 LOC code shipped
- 16 quota mod requests submitted
- 2 audit docs (iter 47 + iter 48)

**Go-forward dormant cost**:
- ~150 LOC code maintained repo (~5 min/month attention)
- Minimal — Codex audit confirms production-safe

**Go-forward decommission cost**:
- ~30 min code revert + 1 audit doc
- Loses optionality + 48h+ wait next reopen if needed

**Conclusione**: Dormant retention dominates decommission (preserves optionality at negligible
cost) AND dominates immediate retry (avoids 48h block + 50% denial + unverified bench).

---

## 9. Connettori + tools verification iter 49 decision

- **Codex CLI 0.128.0 gpt-5.5 high reasoning**: `scripts/dev/codex-bg.sh verify-claude-canary-code` ran 4-file audit, returned 1 medium finding (`vertex-claude-client.ts:142` empty content) → fixed iter 49.
- **Deno probe `/tmp/probe-vertex-claude-v2.ts`**: confirms 429 quota=0 ALL 4 endpoint paths post-enable + post-quota-submit.
- **Email cloudquota@google.com**: 17:10 CEST denial confirmed manual review needed billing maturation.

---

## 10. Decision authority

Andrea iter 49 directive ("prendi la decisione") delegates authority. Decision per Karpathy
Goal-driven + GSD-2 no-complacency + Codex verified.

**Activated**: 2026-05-13 PM iter 49 close
**Next review**: 2026-05-20 (T+7d Cron retry)
**Owner**: Andrea Marro (revocable via direct override)

---

(c) Andrea Marro 2026-05-13 — ELAB Tutor
