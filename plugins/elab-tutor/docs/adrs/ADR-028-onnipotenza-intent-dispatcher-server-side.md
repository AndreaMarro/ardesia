# ADR-028 — Onnipotenza-INTENT-Dispatcher Server-Side

**Status**: PROPOSED
**Date**: 2026-04-30 (iter 36 PHASE 1)
**Authors**: Maker-2 architect (blueprint) + orchestrator scribe (persistence)
**Andrea ratify deadline**: iter 37 entrance gate
**Related ADRs**: ADR-010 (Together fallback gated) · ADR-013 (ClawBot composite L1 morphic) · ADR-019 (Sense 1.5 morfismo runtime) · ADR-026 (content-safety-guard runtime)

---

## §1 Context

Browser-side **AZIONE legacy** dispatcher (~46 cases in `src/services/simulator-api.js`) had limited domain coverage and security exposure (eval-like patterns). The 57-tool ClawBot dispatcher (`scripts/openclaw/dispatcher.ts`, 386 LOC) is implemented but **NOT in production hot path** — only L2 template router (`_shared/clawbot-template-router.ts`) wired pre-LLM (iter 26). [Iter 37 Documenter definitive count: 57 entries via `grep -cE "name: ['\\\"]" scripts/openclaw/tools-registry.ts` strict pattern — supersedes older 52/62 doc claims]

LLM responses produce `[INTENT:{tool:"...", args:{...}}]` tags inline within prosa text. These tags are **NOT currently parsed server-side**. Frontend `useGalileoChat.js` can interpret some `[AZIONE:...]` tags but the surface is incomplete and security-sensitive (eval risk).

**Onniscenza+Onnipotenza audit iter 29** (`docs/audits/2026-04-30-iter-29-ONNISCENZA-ONNIPOTENZA-AUDIT.md` 525 LOC) flagged: "Dispatcher 57-tool path NOT wired post-LLM" as P0 iter 30 carryover, deferred to iter 36.

## §2 Decision

Implement server-side **INTENT parser + dispatcher** post-LLM in `unlim-chat` Edge Function with:

1. `_shared/intent-parser.ts` (NEW ~120 LOC) — non-greedy regex parse + defensive JSON.parse + strip helper
2. `_shared/clawbot-dispatcher.ts` (Deno port of `scripts/openclaw/dispatcher.ts` 57-tool registry) — invoke server-side execution
3. `intent_dispatch_log` Supabase table (NEW migration) — append-only audit trail
4. Env flag `ENABLE_INTENT_DISPATCHER=true|false` — single rollback lever
5. Surface `intents_executed: DispatchResult[]` in chat response payload — frontend uses for UI feedback

## §3 Context dispatcher 62-tool

**File**: `scripts/openclaw/dispatcher.ts` (386 LOC, iter 4 + iter 6 composite extension)

**Architecture layers**:
- **L0 registry**: `OPENCLAW_TOOLS_REGISTRY` Map<string, ToolSpec> with 62 tools across 11 categories (file system grep verifies 62 entries; CLAUDE.md iter 29 audit confirms count REAL = 62 vs older 52/57 docs)
- **L1 composite handler**: `composite-handler.ts` (492→634 LOC iter 19) executes sequenced multi-tool dispatch with `executeComposite(handlerName, args)`. 5/5 unit tests PASS iter 6+19
- **L2 template router**: `_shared/clawbot-templates.ts` (424 LOC, 22 templates iter 28 mac-mini D2 audit verify, NOT 20 PDR claim) + `clawbot-template-router.ts` (300 LOC) `selectTemplate` + `executeTemplate` pre-LLM short-circuit. 19/19 unit tests PASS
- **L3 dynamic JS generation**: DEV-only Web Worker sandbox flagged `VITE_ENABLE_MORPHIC_L3=true`. NOT production.
- **`auditDispatcher`**: each dispatch logged with status code (`ok` / `parse_error` / `tool_not_found` / `args_invalid` / `dispatcher_throw` / `timeout`)

**Iter 36 ADR-028 wires L0+L1 server-side post-LLM** parallel to existing L2 pre-LLM short-circuit. L3 remains DEV-only.

## §4 Schema regex stricter

```typescript
// _shared/intent-parser.ts
export interface IntentTag {
  raw: string;          // exact "[INTENT:{...}]" substring
  tool: string;
  args: Record<string, unknown>;
  startIdx: number;
  endIdx: number;
}

const INTENT_RE = /\[INTENT:(\{[\s\S]*?\})\]/g;

export function parseIntentTags(text: string): IntentTag[] {
  const tags: IntentTag[] = [];
  for (const match of text.matchAll(INTENT_RE)) {
    try {
      const payload = JSON.parse(match[1]);
      if (typeof payload?.tool !== 'string') continue;
      tags.push({
        raw: match[0],
        tool: payload.tool,
        args: payload.args || {},
        startIdx: match.index!,
        endIdx: match.index! + match[0].length,
      });
    } catch (_) {
      // malformed JSON — skip + log later via audit
      continue;
    }
  }
  return tags;
}

export function stripIntentTags(text: string): string {
  return text.replace(INTENT_RE, '').replace(/\s+/g, ' ').trim();
}
```

**Non-greedy `\{[\s\S]*?\}`** prevents catastrophic backtrack on malformed nested JSON. Defensive `JSON.parse` try/catch handles malformed args gracefully.

**Edge cases tested 15+** (Maker-1 `tests/unit/intent-parser.test.js` ownership):
- single intent simple
- multiple intents (2-3) per response
- malformed JSON (skip, do not throw)
- nested braces in args (`args:{filter:{type:"led"}}`)
- Italian text mixed with intent (Vol.6 pag.45 «testo verbatim»)
- special chars unicode (é, à, ò, "Ragazzi,")
- empty text / no intent / whitespace
- intent at start vs middle vs end of response
- regex non-greedy verify
- args with array values
- very long args (>500 char)

## §5 Failure modes

| Mode | Description | Mitigation | Audit status |
|------|-------------|------------|--------------|
| `parse_error` | malformed JSON in args | try/catch JSON.parse, skip tag, log raw | `parse_error` |
| `tool_not_found` | tool name typo or removed from registry | `dispatchTool` rejects, log requested name | `tool_not_found` |
| `args_invalid` | args don't match ToolSpec schema | ToolSpec validator pre-execute, reject | `args_invalid` |
| `dispatcher_throw` | runtime error during tool execution | catch + log error message + stack | `dispatcher_throw` |
| `timeout` | tool execution >3s | `Promise.race(tool, timeout)` reject 3000ms | `timeout` |

## §6 Audit table schema

```sql
-- supabase/migrations/20260430120000_intent_dispatch_log.sql
CREATE TABLE intent_dispatch_log (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  experiment_id TEXT,
  tool_name TEXT NOT NULL,
  args_json JSONB NOT NULL,
  result_status TEXT NOT NULL CHECK (
    result_status IN ('ok','parse_error','tool_not_found','args_invalid','dispatcher_throw','timeout')
  ),
  result_payload JSONB,
  error_message TEXT,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  intent_dispatcher_enabled BOOLEAN NOT NULL DEFAULT true,
  llm_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_intent_dispatch_session ON intent_dispatch_log(session_id, created_at DESC);
CREATE INDEX idx_intent_dispatch_tool_status ON intent_dispatch_log(tool_name, result_status, created_at DESC);

-- RLS: append-only via service role
ALTER TABLE intent_dispatch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_insert" ON intent_dispatch_log
  FOR INSERT TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_own_session" ON intent_dispatch_log
  FOR SELECT TO authenticated USING (session_id = current_setting('app.session_id', true));
```

**Mirror pattern**: identical structure to `together_audit_log` (ADR-010) — append-only, service-role INSERT, 2 indexes for session+tool query patterns.

## §7 Rollout strategy

| Phase | % traffic | Duration | Gate |
|-------|-----------|----------|------|
| Shadow | 0% (logging only, no execution) | 24h | Audit log integrity 100% |
| Canary | 5% | 48h | Latency p95 overhead <200ms vs baseline |
| Limited | 25% | 72h | INTENT exec rate ≥80% R7 fixture (200 prompts) |
| Half | 50% | 72h | No regression PZ V3 score (≥91.45% R5) |
| Full | 100% | — | Latency p95 overall <4s warm |

**Rollback**: `ENABLE_INTENT_DISPATCHER=false` env var → fallback browser-side AZIONE legacy. Single env redeploy <5min.

## §8 PRINCIPIO ZERO compliance

- **kit fisico mention preserved** post tool exec — `stripIntentTags` removes only `[INTENT:{...}]` tags. Vol/pag verbatim citations + `Ragazzi,` plurale + analogie ≤60 parole UNCHANGED.
- **PZ V3 12-rule scorer** applied to `cleanText` post-strip (validator pipeline order: LLM → strip → PZ V3 validate → save). Existing `_shared/principio-zero-validator.ts` `stripTags` already handles INTENT pattern at lines 48-53 (Maker-2 read-verified) — ADR-028 deduplicates the strip into shared helper.
- **Vol/pag verbatim** never altered by tag strip (regex matches `[INTENT:{...}]` exactly, NOT `«Vol.6 pag.45 testo»` patterns).

## §9 MORFISMO compliance Sense 1

- **57-tool registry morphic runtime**: per-classe + per-docente + per-kit ToolSpec selection still applies (kitFilter, levelFilter, modeFilter). Dispatcher resolves tool dynamically via Map lookup — NO static if/else cascade.
- **L1 composite invokable from INTENT**: `[INTENT:{tool:"composite-mostra-circuito-led", args:{...}}]` triggers `executeComposite` chain (highlight → mountExperiment → narrate). Composite branches grow without dispatcher core change.
- **L2 template router still pre-LLM short-circuit primary path**: 22 templates iter 28 (D2 audit verify) handle 80% common requests <500ms latency. INTENT dispatcher post-LLM handles long-tail edge cases the LLM produces.
- **L3 dynamic JS DEV-only** unchanged — production uses L0+L1+L2 only.

## §10 Anti-inflation G45 acceptance

| Metric | Target ONESTO | Measurement |
|--------|---------------|-------------|
| 50-prompt R7 fixture | ≥80% INTENT executed correttamente | `scripts/bench/run-sprint-r7-stress.mjs` |
| Latency overhead p95 | <200ms vs no-dispatcher baseline | Mac Mini Cron L3 measure |
| Audit log integrity | 100% (every dispatch logged) | SQL count match dispatch count |
| Regex parse failures | <1% prod (defensive try/catch) | `intent_dispatch_log` parse_error count |
| Rollback latency | <5min env redeploy | Manual drill |

**NO claim "Onnipotenza LIVE"** without 50-prompt R7 fixture ≥80% PASS prod measured.

## §11 Alternatives considered

1. **Browser-side eval** (rejected) — XSS surface unacceptable for K-12 minors GDPR compliance (ADR-026 content-safety-guard).
2. **Mistral tool-call native API** (deferred iter 38) — Mistral Large supports native tool-calling. Limits prosa output to <200 char per response, conflicts with PZ V3 ≤60 parole + analogia + Vol/pag verbatim. Defer evaluation iter 38 with R7 fixture A/B.
3. **JSON-mode strict** (rejected) — same prosa limitation as tool-call. Loses cite verbatim formatting.
4. **Frontend-only INTENT parse** (rejected) — security exposure + audit trail loss.

## §12 Consequences

**Positive**:
- Full 62-tool surface accessible from LLM responses
- Server-side audit trail (compliance + forensics)
- Rollback flag granular (env redeploy, no code revert)
- Composites invokable end-to-end from natural language

**Negative**:
- Regex parse fragility (mitigated 15+ edge case tests Maker-1 ownership)
- Latency overhead expected ~50-200ms p95 (mitigated Promise.all parallel dispatch + 3s timeout)
- Audit log volume growth (mitigated 90-day retention partition iter 38)

**Mitigated**:
- defensive JSON.parse try/catch
- dispatcher try/catch per intent
- audit log forensics for regex failure debugging
- env flag instant rollback

## §13 Cross-refs verified read-only

- `scripts/openclaw/dispatcher.ts` — 386 LOC, 57-tool registry dispatch L0 Map lookup + L1 composite opt-in + `auditDispatcher`
- `scripts/openclaw/composite-handler.ts` — 634 LOC iter 19, L1 morphic, `executeComposite`, `CompositeAuditWriter` pattern (referenced for `intent_dispatch_log` schema design)
- `supabase/functions/_shared/clawbot-template-router.ts` — L2 template router, pre-LLM short-circuit, AZIONE tag emission pattern
- `supabase/functions/_shared/principio-zero-validator.ts` — `stripTags` already strips `[INTENT:{...}]` lines 48-53 (PZ V3 pipeline integration confirmed; ADR-028 deduplicates)
- `supabase/functions/unlim-chat/index.ts` — post-LLM pipeline `callLLM → capWords → validatePrincipioZero → saveInteraction → return`; L2 short-circuit lines 395-446; INTENT dispatcher insertion point identified post-`callLLM` pre-`stripTags`
- `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` — audit table pattern source
- `docs/adrs/ADR-013-clawbot-composite-l1-morphic-2026-04-26.md` — L1 composite reference
- `docs/adrs/ADR-019-*.md` — Sense 1.5 morfismo runtime per-docente per-classe
- `CLAUDE.md` "DUE PAROLE D'ORDINE" §1 (PRINCIPIO ZERO) + §2 (MORFISMO Sense 1+1.5+2)

## §14 Implementation reference (Atom A1 Maker-1 iter 36, AMENDED iter 37)

**Server-side INTENT parser shipped iter 36** (`supabase/functions/_shared/intent-parser.ts` 270 LOC):
- Non-greedy regex `/\[INTENT:(\{[\s\S]*?\})\]/g` → estrae JSON tag post-LLM response
- 6 export helpers: `parseIntentTags` + `stripIntentTags` + `IntentTag` TypeScript type + `validate` + `categorize`
- 24/24 unit tests PASS (`tests/unit/intent-parser.test.js`)

**Pivot iter 36 → surface-to-browser** (NON server-side dispatchTool execution):
- Server-side parse + surface `intents_parsed: IntentTag[]` array nella response JSON unlim-chat
- Browser `useGalileoChat.js` itera + dispatch via `__ELAB_API`
- Rationale: 57-tool registry ToolSpec resolves `__ELAB_API` browser context only (window.__ELAB_API). Deno port heavy work (mock browser context Deno-side, ricostruire CircuitSolver state, ecc.) → DEFERRED iter 38.
- Iter 36 compromise: server parses, browser dispatches. Riduce latenza percepita parser senza bloccare su Deno port.

**Wire-up `unlim-chat/index.ts` (line 228-330)**:
1. Post-LLM response received → block 6a tra `capWords` e `validatePrincipioZero`
2. `try { intents_parsed = parseIntentTags(rawText) } catch` → defensive fallback `cappedText`, NEVER break chat flow
3. Response JSON shape esteso: `{ text, debug_retrieval, intents_parsed: IntentTag[] }`

**Iter 37 frontend wire-up Atom B-NEW** (defer Maker-1 successivo):
- `src/components/lavagna/useGalileoChat.js` consume `intents_parsed`
- Itera array, ogni intent `{ action, params }` → dispatch via `window.__ELAB_API[action](params)`
- Validation pre-dispatch: filtra action non in 57-tool registry (security gate)

**Future iter 38 server-side dispatchTool**:
- Deno port 62-tool subset (highlight, mountExperiment, captureScreenshot — server-safe)
- Restanti tool browser-side (CircuitSolver state, drag, drop)
- Canary 5%→25%→100% rollout per §7

---

**Status**: ACCEPTED iter 37 (Andrea ratify Phase 1 post-amend 2026-04-30 + Atom B-NEW browser wire-up scope added per "no debito tecnico" mandate)
**Andrea ratify**: CONFIRMED iter 37 Phase 1 — see `automa/team-state/messages/andrea-ratify-adr028-CONFIRMED.md`
**Implementation**: iter 36 Phase 1 Atom A1 Maker-1 (intent-parser.ts 270 LOC + tests 259 LOC + unlim-chat wire-up +45 LOC)
**Migration apply**: iter 37 P0 (Andrea `supabase db push --linked` post ratify)
**Rollout**: iter 37 Shadow → iter 38 Canary 5% → ramp per §7 schedule
**ADR-029 cross-ref**: LLM_ROUTING_WEIGHTS 70/20/10 conservative tune (latency companion decision)

---

## §14.b 4-way schema drift resolution — iter 38 (ADR-030 supersedes)

**Added**: iter 38 Phase 1 by Maker-2 (ATOM-S38-A7 deliverable per PDR iter 38 §3)
**Evidence source**: `automa/team-state/messages/tester6-iter37-phase3-completed.md` §3.4 + §4

### Finding summary

Tester-6 iter 37 Phase 3 R7 bench (200 prompts, v53 ACTIVE) confirmed **17/200 params_fail** traced to a 4-way key-name mismatch across the INTENT pipeline:

| Source | Tool | Key | Literal |
|--------|------|-----|---------|
| Bench scorer `scripts/bench/run-sprint-r7-stress.mjs:92` | `mountExperiment` | `experimentId` | `typeof args?.experimentId === 'string'` |
| System-prompt few-shot `_shared/system-prompt.ts:78` | `mountExperiment` | `id` | `[INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]` |
| ADR-028 §14 contract (pre-amend) | `mountExperiment` | `id` | (aligned with system-prompt) |
| Browser API `src/services/simulator-api.js:264` | `mountExperiment` | positional string | `mountExperiment(experimentId)` |

Secondary drifts confirmed by Tester-6 §4 (same params_fail bucket):

| Bench scorer expects | System-prompt emits | Tool |
|---------------------|---------------------|------|
| `args.pins` (array) | `args.ids` (array) | `highlightPin` |
| `args.param` (string) | `args.field` (string) | `setComponentValue` |
| `args.enabled` (boolean) | `args.on` (boolean) | `toggleDrawing` |

### Resolution — ADR-030 as single source of truth

**ADR-030 (iter 38) defines the canonical params schema** resolving all 4-way drift. The canonical table (ADR-030 §3) uses:

- `mountExperiment.args.id` — aligned with system-prompt few-shot (LLM was correct; bench was wrong)
- `highlightPin.args.ids` — array, aligned with system-prompt
- `setComponentValue.args.field` — aligned with system-prompt
- `toggleDrawing.args.on` — aligned with system-prompt

ADR-030 also replaces prompt-teaching entirely with Mistral `response_format: json_schema` — eliminating the regex-parse approach and making params shape validation moot for the primary Mistral path.

### Action items iter 38

1. **Bench scorer rules update** (Tester-2, ATOM-S38-A1.b sub-task):
   - `scripts/bench/run-sprint-r7-stress.mjs:92`: change `mountExperiment` rule from `args?.experimentId` to `args?.id`
   - `:91`: change `highlightPin` from `args?.pins` to `args?.ids`
   - `:94`: change `setComponentValue` from `args?.param` to `args?.field`
   - `:96`: change `toggleDrawing` from `args?.enabled` to `args?.on`

2. **Browser dispatcher object accept** (Maker-1 OR WebDesigner-1):
   - `src/components/lavagna/intentsDispatcher.js`: update `mountExperiment` dispatch to destructure `args.id` → call `api.mountExperiment(args.id)` (positional string as required by browser API)
   - Similar fixes for `highlightPin` (pass `args.ids`) and `setComponentValue` (pass `args.id`, `args.field`, `args.value`)

3. **System-prompt [INTENT:...] block drop** (Maker-1, ADR-030 §4.2):
   - `_shared/system-prompt.ts:68-109`: remove MANDATORY INTENT block post-ADR-030 json_schema implementation
   - Preserves `[AZIONE:...]` legacy tags (play/pause/compile)

4. **Validate end-to-end via R7 re-bench post-deploy**:
   - Tester-2 Phase 3 re-run `scripts/bench/run-sprint-r7-stress.mjs` post-v54 deploy
   - Acceptance: ≥95% canonical rate (ADR-030 §6 target) vs 12.5% pre-ADR-030

### Honesty note

The §14 implementation block (iter 36) and B-NEW browser wire-up (iter 37) were correct in using `args.id` (aligned with system-prompt). The bench scorer was using `args.experimentId` — a divergence introduced when the scorer was authored in iter 12 before the system-prompt was aligned. This ADR-028 §14.b amendment closes the documentation gap and directs the authoritative resolution to ADR-030.
