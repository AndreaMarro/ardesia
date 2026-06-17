# Sprint T iter 38 PHASE 3 CLOSE Audit — ONESTO G45 Anti-Inflation

**Date**: 2026-05-01 ~01:15 CEST
**Branch**: e2e-bypass-preview
**Sprint**: T iter 38 (Sprint T close target was 9.5/10 ONESTO conditional Onnipotenza Deno port)
**Pattern**: Pattern S r3 4-agent OPUS PHASE-PHASE r2 (DEGRADED — 3/4 BG agents hit org monthly usage limit pre-completion-msg) + Documenter Phase 2 sequential (orchestrator inline) + Phase 3 Tester atoms DEFERRED iter 39+ (env req + bench scripts)

---

## §1 Score iter 38 close ONESTO ricalibrato G45

### Raw box subtotal post iter 38 close

| Box | Status iter 37 | iter 38 delta | Score iter 38 |
|-----|----------------|---------------|---------------|
| 1 VPS GPU | 0.4 | UNCHANGED Path A | 0.4 |
| 2 stack | 0.7 | UNCHANGED | 0.7 |
| 3 RAG | 0.7 | UNCHANGED (no re-ingest) | 0.7 |
| 4 Wiki | 1.0 | MAINTAIN (126/100) | 1.0 |
| 5 R0 91.80% | 1.0 | MAINTAIN | 1.0 |
| 6 Hybrid RAG | 0.85 | UNCHANGED (B2 bench not re-run) | 0.85 |
| 7 Vision | 0.75 | UNCHANGED (A8 smoke deferred) | 0.75 |
| 8 TTS | 0.95 | UNCHANGED (A9 design only ADR-031, impl iter 39+) | 0.95 |
| 9 R5 91.80% | 1.0 | UNCHANGED (A1.b R5 re-run deferred) | 1.0 |
| 10 ClawBot | 1.0 | UNCHANGED ceiling | 1.0 |
| 11 Onniscenza | 0.8 | +0.05 Cron warmup SQL shipped (apply pending Andrea) | 0.85 |
| 12 GDPR | 0.75 | UNCHANGED | 0.75 |
| 13 UI/UX | 0.7 | +0.05 wake word UX live + PWA prompt-update wired | 0.75 |
| 14 INTENT exec end-to-end | 0.85 | +0.05 ADR-030 design + Mistral function calling wire-up shipped (deploy + R7 verify pending) | 0.90 |

**Box subtotal iter 38**: 11.65/14 → normalizzato **8.32/10** + bonus cumulative iter 38 (+0.30 ADR-030+031+028§14 amend doc + intent-tools-schema.ts canonical + Cron warmup SQL + MicPermissionNudge UX + UpdatePrompt PWA + Lighthouse measured) = raw **8.62**.

### G45 anti-inflation cap

PDR §4 cap conditions evaluated:
- ✅ vitest 13474 PRESERVED (post hotfix MicPermissionNudge Rules of Hooks orchestrator inline) — NO regression cap trigger
- ❌ Build NOT re-run Phase 1 (deferred Phase 4 entrance gate — heavy ~14min)
- ❌ A10 Onnipotenza Deno port NOT shipped (Path B explicit defer iter 39+) → **mechanical cap 8.5**
- ❌ R5 latency re-bench post-A3+A5 NOT executed (bench env req + Phase 3 deferred iter 39) → cap 8.5 (preserve)
- ❌ R7 INTENT canonical post-A7 deploy NOT verified (deploy deferred Phase 4) → cap 8.5 if R7 unverified
- ❌ Carryover closed: 13/24 ≈ 54% → cap 9.0 (above 50% threshold)
- ❌ A6 Lighthouse perf 26+23 FAIL ≥90 target → -0.10 onesto
- ⚠️ Maker-3 A14 codemod ZERO deliverables (BG agent failed pre-exec) → -0.10 onesto
- ⚠️ Tester-1 A15 94 esperimenti NOT spawned (org limit) → -0.10 onesto

**Mechanical G45 cap**: **8.0/10 ONESTO** (PDR §4 cap A10 not shipped 8.5 ceiling - 0.30 onesti penalties Lighthouse perf + A14 zero + A15 not spawned + Maker/WebDesigner BG agents failed pre-completion-msg).

### Sprint T close projection

**Iter 38 NOT achieves Sprint T close 9.5/10 ONESTO target** per PDR §4 cap conditions. Realistic Sprint T close path moves to iter 40+ OR new session post org limit reset with parallel agents capable of A10 Deno port + A14 codemod + A15 Playwright sweep + R7 deploy verify.

---

## §2 Atoms delivery matrix (file-system verified)

### Shipped iter 38 (10 atoms)

| Atom | Owner | Files | LOC | Status |
|------|-------|-------|-----|--------|
| A3 Promise.all parallelize | Maker-1 BG | `unlim-chat/index.ts:266-283` | within +221 | ✅ shipped |
| A5 Cron warmup SQL + classifier doc | Maker-1 BG | `migrations/20260430220000_unlim_chat_warmup_cron.sql` NEW + `onniscenza-classifier.ts` M | NEW + 31 | ✅ shipped (apply pending) |
| A7 ADR-030 design | Maker-2 → orchestrator inline write | `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` | NEW ~280 LOC | ✅ shipped |
| A7 Mistral function calling wire-up | Maker-1 BG | `intent-tools-schema.ts` NEW + `llm-client.ts` M + `mistral-client.ts` M + `system-prompt.ts` M + `unlim-chat/index.ts` M | NEW + 291 | ✅ shipped (deploy pending) |
| A9 ADR-031 design (Voxtral STT migration) | Maker-2 → orchestrator inline write | `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md` | NEW ~270 LOC | ✅ design only iter 38 (impl iter 39+) |
| ADR-028 §14.b amend (4-way schema canonical) | Maker-2 → orchestrator inline write | `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` | +58 LOC | ✅ shipped |
| A6 Lighthouse measured | WebDesigner-1 BG | `docs/audits/iter-38-lighthouse-{chatbot-only,easter-modal}.json` | 2 reports ~411+434KB | ⚠️ partial — perf 26+23 FAIL ≥90 target, a11y/BP/SEO PASS |
| A11 Wake word UX flow | WebDesigner-1 BG (+ orchestrator hotfix) | `MicPermissionNudge.jsx` NEW (317) + `LavagnaShell.jsx` M (+37) + `HomePage.jsx` M (+42) | NEW + 79 | ✅ shipped (post Rules of Hooks hotfix) |
| A12 PWA SW prompt-update | WebDesigner-1 BG | `UpdatePrompt.jsx` NEW (322) + `vite.config.js` M (+23) | NEW + 23 | ✅ shipped (Vercel deploy verify pending) |
| Test coverage NEW | WebDesigner-1 BG | `tests/unit/components/{chatbot,easter,lavagna}/*.{jsx,js}` 6 files | +989 LOC tests | ✅ shipped |

### Not shipped iter 38 (9 atoms — defer iter 39+)

| Atom | Reason |
|------|--------|
| A1 R6 fixture v2 + page metadata SQL | Phase 3 Tester-2 NOT spawned (org limit cascade) |
| A1.b R5 re-run | Phase 3 Tester-2 NOT spawned + bench env req |
| A2 Fumetto fix | No Edge Function exists; src/components/lavagna/Fumetto.jsx defer iter 39+ |
| A4 Mistral streaming SSE | Path B explicit defer (breaks client parsing) |
| A8 Vision Gemini smoke | Phase 3 Tester-3 NOT spawned (org limit cascade) |
| A9 STT Voxtral migration impl | Path B explicit defer (design only iter 38) |
| A10 Onnipotenza Deno port 12-tool | Path B explicit defer (complex 6-8h) |
| A13 Canary 5%→25%→100% | Depends A10 |
| A14 Linguaggio codemod 200 violations | Maker-3 BG agent ZERO deliverables (org limit pre-exec) |
| A15 94 esperimenti Playwright UNO PER UNO | Tester-1 NOT spawned (org limit cascade) |
| A16 Tres Jolie volumi audit | P2 explicit defer iter 39+ |
| A6.b Cronologia Google-style | P2 explicit defer iter 39+ |
| D1 ADR-025 ratify | Path B explicit defer (Andrea decision required) |
| D2 ADR-026 deploy | Path B explicit defer |
| D3 ADR-027 Davide co-author | Davide presence required |
| D4 Tea Glossario session | Tea presence required |

---

## §3 CoV anti-regression iter 38

| Metric | Pre iter 38 | Post Phase 1 hotfix | Verdict |
|--------|-------------|---------------------|---------|
| vitest PASS | 13474 | **13474 PRESERVED** | ✅ no regression |
| Test files | 269 passed + 1 skipped | 269 passed + 1 skipped | ✅ stable |
| Build | NOT re-run | NOT re-run iter 38 (heavy ~14min, Phase 4 gate) | ⚠️ deferred |
| Edge Functions ACTIVE | unlim-chat v53 + unlim-stt v12 + unlim-vision v8 | UNCHANGED (no deploy iter 38 yet) | ⚠️ deploy pending |
| Vercel HTTP 200 | LIVE | UNCHANGED | ✅ stable |
| Mac Mini cron | 7 entries | UNCHANGED | ✅ stable |

**Hotfix orchestrator inline iter 38**: `MicPermissionNudge.jsx:254` `handleDeniedClick` useCallback was AFTER 3 early returns line 158-160 → React Rules of Hooks violation broke `tests/unit/lavagna/wakeWord-integration.test.jsx` "respects 'off' preference" 1/9 case (vitest -1 = 13473 pre-fix). Orchestrator moved declaration BEFORE early returns. 9/9 wakeWord PASS post-fix + full suite 13474 PASS preserved.

---

## §4 5 Honesty caveats critical

1. **3/4 BG agents hit org monthly usage limit pre-completion-msg**: Maker-1, Maker-3, WebDesigner-1 returned `"You've hit your org's monthly usage limit"` ~27 min into execution. Maker-1 + WebDesigner-1 had shipped substantial work (intent-tools-schema.ts NEW + llm-client+mistral-client+system-prompt+unlim-chat M + warmup_cron.sql NEW + onniscenza-classifier M for Maker-1; MicPermissionNudge NEW + UpdatePrompt NEW + LavagnaShell+HomePage M + vite.config.js M + Lighthouse JSON + 6 tests NEW for WebDesigner-1). Maker-3 ZERO deliverables — codemod scan never started. Orchestrator inline file-system verified all and authored 3 completion msgs on behalf.
2. **A10 Onnipotenza Deno port NOT shipped → cap 8.5/10 mechanical**: PDR §4 explicit cap. Sprint T close 9.5/10 ONESTO target NOT achievable iter 38 without A10. Defer iter 40+ or post org-limit-reset session with parallel agents.
3. **No bench re-run executed**: R5 + R6 + R7 post-A3/A5/A7-deploy verification deferred. Tester-2 + Tester-3 + Tester-4 NOT spawned (org limit cascade). R7 ≥95% canonical projection per ADR-030 §6 UNVERIFIED — current canonical rate 12.5% (Tester-6 iter 37 v53 baseline). Mistral function calling impl shipped but not deployed prod yet.
4. **Lighthouse perf 26+23 FAIL ≥90 target**: A6 acceptance gate iter 38 P0.10 perf gate FAILED both routes. a11y 100, SEO 100, BP 96 PASS. Defer iter 39+ optimization pass: lazy mount route components, defer non-critical chunks, image optimization, font preload. -0.10 onesto cap.
5. **A14 Linguaggio codemod + A15 94 esperimenti NOT addressed**: Andrea iter 21+ mandate carryover NOT closed iter 38. Maker-3 ZERO deliverables (BG fail pre-exec). Tester-1 NOT spawned. Both deferred iter 39+ entrance — explicit acknowledged technical debt. -0.10 onesto cap each.

---

## §5 Iter 39 priorities P0 preview

1. **A14 Maker-3 codemod 200 violations** — retry post org limit reset (4h)
2. **A15 Tester-1 94 esperimenti Playwright UNO PER UNO** — retry post org limit reset (3h)
3. **Phase 4 commit + push + Vercel deploy + Edge Function deploy unlim-chat v54** — Andrea ratify ENABLE_INTENT_JSON_SCHEMA env flag + supabase db push migrations (15 min)
4. **R5 + R6 + R7 re-bench post-deploy** — Tester-2 spawn 50-prompt R5 (avg <3000ms p95 <6000ms target) + 100-prompt R6 (recall@5 ≥0.55 target) + 200-prompt R7 (canonical ≥95% target post-A7) (3h)
5. **A10 Onnipotenza Deno port 12-tool subset** — Maker-1 spawn (6-8h)
6. **A4 Mistral streaming SSE** — Maker-1 (4h, breaks client parsing risk — coordinate WebDesigner-1)
7. **A9 STT Voxtral migration impl** — Maker-1 + Tester-4 9-cell matrix (6h)
8. **A13 Canary rollout** — depends A10 ready (3h)
9. **A6 Lighthouse perf optimization** — WebDesigner-1 lazy load + bundle analysis + image optim (2h)
10. **D1+D2+D3+D4 Andrea ratify queue** — entrance gate iter 39+

**Iter 39 score target**: 8.0 → **8.7+/10 ONESTO** conditional Phase 4 deploy verify + Andrea ratify queue close + R7 re-bench ≥95%.

---

## §6 Files refs iter 38 close (Phase 4 commit batch)

### NEW Maker-1 BG (file-system verified)
- `supabase/functions/_shared/intent-tools-schema.ts` (canonical INTENT_TOOLS_SCHEMA)
- `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql` (A5 pg_cron 30s warmup)

### NEW Maker-2 (orchestrator inline write)
- `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md`
- `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md`

### NEW WebDesigner-1 BG (file-system verified)
- `src/components/common/MicPermissionNudge.jsx` (post-hotfix)
- `src/components/common/UpdatePrompt.jsx`
- `tests/unit/components/chatbot/ChatbotOnly.test.jsx`
- `tests/unit/components/easter/EasterModal.test.jsx`
- `tests/unit/components/lavagna/CapitoloPicker.test.jsx`
- `tests/unit/components/lavagna/DocenteSidebar.test.jsx`
- `tests/unit/components/lavagna/PercorsoCapitoloView.test.jsx`
- `tests/unit/components/lavagna/useGalileoChat-intents-parsed.test.js`
- `docs/audits/iter-38-lighthouse-chatbot-only.json`
- `docs/audits/iter-38-lighthouse-easter-modal.json`

### MODIFIED (file-system verified diff stat)
- `supabase/functions/_shared/llm-client.ts` (+12 -X)
- `supabase/functions/_shared/mistral-client.ts` (+28)
- `supabase/functions/_shared/onniscenza-classifier.ts` (+31)
- `supabase/functions/_shared/system-prompt.ts` (+30)
- `supabase/functions/unlim-chat/index.ts` (+221)
- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` (+58 §14.b)
- `src/components/HomePage.jsx` (+42)
- `src/components/chatbot/ChatbotOnly.module.css` (+12)
- `src/components/easter/EasterModal.jsx` (+4)
- `src/components/lavagna/LavagnaShell.jsx` (+37)
- `vite.config.js` (+23)
- `src/components/common/MicPermissionNudge.jsx` (post hotfix Rules of Hooks)
- `tests/unit/pwa-stale-precache-hotfix.test.js` (+15)

### Completion msgs Phase 1
- `automa/team-state/messages/maker1-iter38-phase1-completed.md` (orchestrator inline on Maker-1's behalf)
- `automa/team-state/messages/maker2-iter38-phase1-completed.md` (Maker-2 returned text, orchestrator wrote)
- `automa/team-state/messages/maker3-iter38-phase1-completed.md` (orchestrator inline — Maker-3 ZERO deliverables)
- `automa/team-state/messages/webdesigner1-iter38-phase1-completed.md` (orchestrator inline on WebDesigner-1's behalf)

### Phase 2 Documenter docs (this turn)
- `docs/audits/2026-05-01-iter-38-PHASE3-CLOSE-audit.md` (this file)
- `docs/handoff/2026-05-01-iter-38-to-iter-39-handoff.md`
- `CLAUDE.md` append iter 38 close section

---

## §7 PRINCIPIO ZERO + MORFISMO compliance gate iter 38

1. ✅ Linguaggio plurale "Ragazzi" preserved (`MicPermissionNudge.jsx:73` "Ragazzi, autorizza il microfono..." + `UpdatePrompt.jsx` "Ragazzi, c'è una nuova versione" + `system-prompt.ts` rules retained + ADR-030 schema description)
2. ✅ Kit fisico mention (HomePage hero + LavagnaShell empty preserved iter 36-37)
3. ✅ Palette CSS var Navy/Lime/Orange/Red usage MicPermissionNudge + UpdatePrompt
4. ✅ Iconografia ElabIcons SVG (per UpdatePrompt refresh icon import; MicPermissionNudge inline SVG mic icon)
5. ✅ Morphic runtime (MicPermissionNudge `navigator.permissions.query` adaptive + UpdatePrompt `controllerchange` event runtime + ADR-030 json_schema runtime validation + A5 classifier regex runtime)
6. ✅ Cross-pollination Onniscenza L1+L4+L7 (A2 classifier preserved iter 37 + A3 Promise.all parallelize)
7. ✅ Triplet coerenza (no deviation from iter 37 baseline; ADR-031 design preserves Sense 2 "stack 100% Mistral EU FR" mandate completing audio I/O)
8. ✅ Multimodale (A11 wake word UX flow auto-warm-up + Voxtral primary preserved + Vision Pixtral preserved)

---

**Anti-inflation G45 mandate iter 38 enforced**: cap 8.0/10 ONESTO. NO claim "Sprint T close achieved" (A10 Onnipotenza Deno port pending). NO claim "INTENT canonical ≥95%" (R7 re-bench post-A7 deploy pending). NO claim "Lighthouse perf ≥90" (26+23 FAIL admitted). NO claim "Vercel deploy LIVE" (deferred Phase 4 pending env+migration apply). NO claim "Andrea ratify D1+D2+D3+D4 closed" (Path B explicit defer iter 39+).
