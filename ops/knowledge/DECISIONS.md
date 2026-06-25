# DECISIONS (append-only)

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output)
Rule: append only. Never edit/delete prior entries; supersede with a new dated entry.

---

## 2026-06-25 — D1: llm_wiki = SANDBOX-ADOPT (P1)
Adopt nashsu/llm_wiki in a sandbox, not production, as the visual graph/cluster/gap layer over the vault. Gated on a firsthand egress audit (sniffer during ingest) + provider=Ollama + MinerU-off before any real/PII data. Basis: WF1 llm_wiki eval. Eval doc: `~/ardesia-vault/LLM-WIKI-EVAL-2026-06-25.md`.

## 2026-06-25 — D2: knowledge-fabric layering
ardesia-vault + `ops/knowledge/` = durable SoT; llm_wiki = visual layer; AgentMemory = operational recall holding a POINTER (URL :19828 + path + last-ingest SHA), not a duplicate. Worker flow: recall → wiki → GSD packet → files → result back to AgentMemory. Basis: WF1 integration-roles.

## 2026-06-25 — D3: ELAB CI unblock order = #198 first
#198 is the keystone (unit suite 470 green; gov/ratchet/security green; only red = jsdom E2E flake). Land #198, then rebase #196 (consent/GDPR) and #199 (lint gate) onto it + add CHANGELOG (Rule 5). HOLD #200/#197; split #194; close #154–#158/#161/#171. Merge actions = gate-Andrea. Basis: WF1 ELAB triage.

## 2026-06-25 — D4: ELAB #195 → plugin-port-to-Ardesia
CircuitScene model + ELAB domain graph (#195, draft, additive) to be ported into the ARDESIA plugin host, NOT landed as ELAB core. Basis: WF1 ELAB triage + canon.

## 2026-06-25 — D5: api-vercel T1-web path
Prefer attaching a custom/exempt domain to ardesia-api-vercel (SSO exempts custom domains → public, no token/proxy) over the proxy-with-bypass-token option. The vercel.json on-disk fix is correct; clearing prod 404 needs an authorized `vercel --prod` (gate-Andrea). Basis: WF1 Vercel deep.

## 2026-06-25 — D6: GitHub lag is by design (lineage trap)
lessonos & maestro-studio origin = local bare repos; GitHub is a secondary push remote → GitHub lags unless explicitly pushed. Always reconcile served-SHA against the local bare HEAD. ardesia is the only mini code repo with origin=GitHub. Basis: WF1 GitHub deep.

## 2026-06-25 — D7: served-SHA pin
Session served-SHA = **lessonos auto/main `20560ec`** (GitHub HEAD; mini has 5 unpushed vs local bare). All STATE files keyed to this. Basis: WF1 GitHub deep.

## 2026-06-25 — D8: ops/knowledge overlaps ardesia PR#1
This ops/knowledge layer overlaps the ardesia PR #1 (Knowledge Fabric draft, head `session/long-2026-06-25`, CLEAN). Reconciliation at merge = gate-Andrea (do not double-land; PR#1 is the canonical merge target).
