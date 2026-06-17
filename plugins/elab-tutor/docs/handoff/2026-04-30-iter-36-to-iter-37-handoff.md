# Handoff iter 36 → iter 37 — Sprint T close finale

**Date**: 2026-04-30 PM
**Branch**: `e2e-bypass-preview`
**HEAD pre-Phase-3**: `91cbdf6`
**Iter 36 score ONESTO**: **8.5/10** (G45 cap)
**Iter 37 target**: **9.0/10** cascade lift
**Pattern**: Pattern S r3 (race-cond fix VALIDATED 8th iter consecutive)

---

## §1 ACTIVATION STRING iter 37 paste-ready

```
Esegui PDR-B iter 37 in `docs/pdr/PDR-ITER-37-*.md` (creare prossima sessione).
Spawn Pattern S r3 4-agent OPUS (planner+architect+gen-app+gen-test+scribe Phase 2 sequential).
Pre-flight CoV: vitest 13268+ baseline preserve + build PASS + Mac Mini cron mapping log delta.
P0.1 Andrea ratify ADR-028 + deploy Edge Function unlim-chat.
P0.2 Andrea ratify Vision Gemini Flash deploy.
P0 atoms preview: ADR-028 §14 amend + ToolSpec count verify + 5 missing lesson-paths + wake word "Ragazzi" + HomePage A13b chatbot-only route.
Anti-inflation G45 cap 9.0 (lift target). Anti-regressione vitest 13268+ NEVER scendere.
Mac Mini cron LIVE 4 entries — verify L1 ≥98% PASS, L2 ≥90% PASS, L3 ≥80% PASS.
Activation iter 38 in audit close §7.
```

---

## §2 Setup steps Andrea (5-10 min)

### Ratify queue iter 37 entrance (in ordine):

1. **ADR-028 ratify** (~3 min):
   - Apri `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md`
   - Verifica §3 architecture decision + §7 rollout schedule + §14 implementation block (NOTA: §14 obsoleto post Maker-1 surface-to-browser pivot, iter 37 Maker-2 amend OBBLIGATORIO)
   - Conferma "PROPOSED → ACCEPTED" status oppure "REJECT con razionale"

2. **Vision Gemini Flash deploy ratify** (~5 min):
   - SUPABASE_ACCESS_TOKEN env required
   - Comando: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb`
   - Verify: Pixtral 12B Italian K-12 evaluation framework live

3. **ToolSpec count verify** (~2 min):
   - Comando: `grep -c "^  name:" /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/scripts/openclaw/tools-registry.ts`
   - Compara con doc claim 57 (Maker-1 agent) vs 62 (CLAUDE.md iter 29 audit)
   - Aggiorna CLAUDE.md sezione iter 29 con count definitivo

4. **Vercel deploy verify** (~3 min):
   - Apri https://www.elabtutor.school in browser
   - Verifica HomePage A13 partial visibile (mascotte SVG inline + 4-card grid + footer 5 strong tags credits)
   - Hard refresh CMD+Shift+R per bypass PWA SW cache se necessario

---

## §3 Iter 37 priorities P0

| # | Priorità | Owner | Time est. | Score impact |
|---|----------|-------|-----------|--------------|
| P0.1 | Andrea ratify ADR-028 + deploy Edge Function unlim-chat | Andrea + Maker-1 | 5-10 min | +0.10 |
| P0.2 | Andrea ratify Vision Gemini Flash deploy | Andrea | 5 min | +0.10 (Box 7 0.75→0.85) |
| P0.3 | ADR-028 §14 surface-to-browser implementation block update | Maker-2 iter 37 | 1h | +0.05 doc coherence |
| P0.4 | ToolSpec count definitive verify 57 vs 62 | Documenter Phase 2 iter 37 | 15 min | +0.02 doc accuracy |
| P0.5 | 5 missing lesson-paths reali (Mac Mini D3 finding) audit + create JSON | Maker-1 / Documenter | 2-3h | +0.10 (Sprint T 92 esperimenti completion) |
| P0.6 | Wake word "Ragazzi" plurale prepend (`src/services/wakeWord.js:141` + uncomment test) | Maker-1 iter 37 | 5 min | +0.02 PZ V3 compliance |
| P0.7 | HomePage A13b full: Chatbot-only route + Cronologia + Easter modal + Voice greeting | WebDesigner-1 iter 37 | 8h | +0.15 (A13 full scope) |
| P0.8 | Iter 37 entrance pre-flight CoV: vitest 13268+ + build PASS | Orchestrator | 30 min | gate, 0 |
| P0.9 | 50-prompt R7 fixture exec post-deploy (Onnipotenza ≥80% target) | Tester-1 iter 37 | 1h | +0.05 (gate quality) |
| P0.10 | PWA SW Workbox cache invalidation prompt-update pattern | Maker-1 iter 37 | 2h | +0.05 (Andrea cache issue mitigation) |

**Subtotal P0 lift potential**: +0.64 → iter 37 cap target **9.0/10** ONESTO conditional execution complete chain.

---

## §4 Andrea ratify queue (12 voci dedup from Sprint T accumulated)

| # | Voce | Iter origin | Deadline | Time | Note |
|---|------|-------------|----------|------|------|
| 1 | ADR-025 Modalità 4 simplification | iter 19 PROPOSED | iter 22 (carryover) | ~3 min | iter 26 implementato canonical, ratify formale pending |
| 2 | ADR-026 content-safety-guard runtime | iter 19 PROPOSED | iter 22 (carryover) | ~3 min | 10 rules runtime, ENABLE_CONTENT_SAFETY_GUARD env flag |
| 3 | ADR-027 volumi narrative refactor schema | iter 19 PROPOSED | iter 25 (carryover) | ~5 min | Davide co-author + ratify |
| 4 | **ADR-028 INTENT dispatcher** | **iter 36 NEW** | **iter 37 entrance** | ~6 min | Maker-2 iter 37 §14 amend post Maker-1 pivot |
| 5 | Vision Gemini Flash deploy (Atom A2) | iter 36 NEW | iter 37 entrance | ~5 min | SUPABASE_ACCESS_TOKEN required |
| 6 | 5 missing lesson-paths audit (Mac Mini D3) | iter 36 NEW | iter 37 P0.5 | 2-3h | Documenter / Maker-1 |
| 7 | HomePage A13b chatbot-only route + Cronologia + Easter modal | iter 36 NEW | iter 37 P0.7 | 8h | WebDesigner-1 |
| 8 | Wake word "Ragazzi" plurale prepend | iter 36 NEW | iter 37 P0.6 | 5 min | Maker-1 |
| 9 | **Marketing PDF compile + PowerPoint Giovanni Fagherazzi** | **iter 32 carryover** | **DEADLINE 30/04 manuale Andrea** | ~2h | Caso B Hybrid Mistral primary scelto |
| 10 | Vercel frontend deploy verify post key rotation | iter 32 carryover | iter 37 entrance | ~5 min | --archive=tgz retry in flight |
| 11 | PWA SW Workbox prompt-update pattern decision (autoUpdate vs prompt) | iter 36 research §3 | iter 37 P0.10 | ~10 min | Andrea decision required |
| 12 | 92 esperimenti audit completion (Andrea iter 21+ mandate) | iter 21 carryover | Sprint T close iter 38 | C+D combo iter 29 partial | broken Playwright UNO PER UNO sweep |

---

## §5 Mac Mini status + iter 37 dispatch suggestions

### Stato cron iter 36 LIVE (verified SSH probe)

- 4 crontab entries running healthy ✓
- 17 L1 cycles + 3 L2 cycles + 0 L3 cycles + 5 aggregator commits
- L1 latest 5/5 PASS 0 console errors 0 regression flags ✓
- branch pattern `mac-mini/iter36-user-sim-lN-YYYYMMDDTHHmm00Z`

### Iter 37 dispatch suggestions

- **D1 wiki batch retry** (iter 13 deferred SSH block, iter 36 NEW): 30 concepts kebab-case overnight cron batch
- **D2 ToolSpec L2 expand** (iter 13 deferred, iter 36 audit drift +2 templates orphan): 20→52→80 templates Deno-compat inline
- **D3 5 missing lesson-paths reali audit** (iter 36 NEW, P0.5): identify gap + create JSON files in `src/data/lesson-paths/`
- **NEW D4 92 esperimenti audit completion** (iter 21+ carryover, Sprint T close gate): broken Playwright UNO PER UNO sweep — kit fisico mismatch + componenti mal disposti + non-funzionanti

### Comandi utili Mac Mini

```bash
# Probe stato cron
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter36-cron.log | wc -l'

# Tail log iter 36
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'tail -50 /Users/progettibelli/Library/Logs/elab/iter36-cron.log'

# Latest L1 cycle
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'ls -t ~/Library/Logs/elab/user-sim-l1-*.json | head -1 | xargs cat'
```

---

## §6 Files refs iter 36 (file-system verified)

### NEW (8 files)

- `supabase/functions/_shared/intent-parser.ts` (270 LOC, Maker-1)
- `tests/unit/intent-parser.test.js` (259 LOC, Maker-1)
- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` (257 LOC, Maker-2)
- `src/components/common/FloatingWindow.jsx` (225 LOC, WebDesigner-2)
- `src/components/common/FloatingWindow.module.css` (137 LOC, WebDesigner-2)
- `tests/e2e/03-fumetto-flow.spec.js` (56 LOC, Tester-1)
- `tests/e2e/04-lavagna-persistence.spec.js` (75 LOC, Tester-1)
- `tests/unit/services/wakeWord.test.js` (134 LOC, Tester-2)

### MODIFIED (6 files)

- `supabase/functions/unlim-chat/index.ts` (+45 -4, Maker-1)
- `src/components/HomePage.jsx` (281 → 591 LOC, WebDesigner-1 REWRITE A13 partial)
- `src/components/lavagna/ModalitaSwitch.jsx` (87 → 103 LOC, WebDesigner-1)
- `src/components/lavagna/ModalitaSwitch.module.css` (93 → 110 LOC, WebDesigner-1)
- `src/components/lavagna/LavagnaShell.jsx` (1341 → 1391 LOC, WebDesigner-1 +12 modalita migration + WebDesigner-2 +52 FloatingWindow wrap)
- `src/components/lavagna/GalileoAdapter.jsx` (701 → 709 LOC, WebDesigner-2 +8 -1 responsive width)

### DOC (3 Phase 2)

- `docs/audits/2026-04-30-iter-36-PHASE3-CLOSE-audit.md` (~470 LOC, this Documenter)
- `docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md` (this file, ~280 LOC)
- `docs/research/2026-04-30-iter-36-RICERCA-2-SESSIONI.md` (102 LOC, orchestrator scribe Phase 1 prep)

### 6 completion messages

`automa/team-state/messages/{maker1,maker2,webdesigner1,webdesigner2,tester1,tester2}-iter36-phase1-completed.md` (467 LOC totale, file-system barrier verified Pattern S r3)

---

## §7 Honesty caveats critical (5 bullets max)

1. **Maker-1 server-side dispatch pivot a surface-to-browser**: ADR-028 §14 obsoleto, iter 37 Maker-2 amend OBBLIGATORIO. Browser-side wire-up `useGalileoChat.js` deferred iter 37 P0.1.

2. **A2 Vision deploy + Edge Function unlim-chat redeploy DEFERRED**: Andrea ratify queue iter 37 entrance — code shipped repo MA NON deployato prod.

3. **HomePage A13 partial only (4h scope iter 36 vs 8h full)**: Chatbot-only route + Cronologia ChatGPT-style sidebar 50 sessioni + Easter modal full 4 GIF + Voice greeting Andrea audio DEFERRED iter 37 atom A13b P0.7.

4. **ToolSpec count discrepanza 57 vs 62**: Maker-1 agent 57, CLAUDE.md iter 29 62, Mac Mini D2 grep pattern wrong. Definitive verify iter 37 P0.4.

5. **Build NOT re-run iter 36 Phase 1+2** (~14min heavy): defer Phase 3 orchestrator pre-flight CoV iter 37 entrance gate. Vitest baseline 13229 → 13256 expected post Phase 3 full run (24 NEW intent-parser + 3 NEW wake word).

---

## §8 Ratify queue ordering (Andrea action priority)

**Quick wins ≤5 min** (in ordine):
1. ADR-028 ratify (~3 min)
2. Vision deploy ratify (~5 min)
3. Wake word "Ragazzi" prepend fix (~5 min, line 141)
4. ToolSpec count grep verify (~2 min)
5. Vercel deploy verify post key rotation (~5 min)

**Decision needed >10 min**:
1. ADR-025+026+027 batch ratify (Sprint T iter 19 carryover, ~15 min)
2. PWA SW autoUpdate vs prompt pattern (~10 min decision)
3. Marketing PDF deadline 30/04 compile + PowerPoint (~2h, manual)

**Iter 37 dev mandate**:
1. HomePage A13b full implementation (8h scope WebDesigner-1)
2. 5 missing lesson-paths audit + create JSON (2-3h Maker-1/Documenter)
3. ADR-028 §14 amend (1h Maker-2)
4. PWA SW prompt-update pattern (2h Maker-1)
5. 50-prompt R7 fixture exec (1h Tester-1)

---

## §9 Iter 37 Pattern S r3 spawn instructions

### Phase 1 (4-agent OPUS parallel, ~4-5h time budget)

**Agent assignments**:

| Agent | Atomi iter 37 | File ownership | Time |
|-------|---------------|----------------|------|
| **Maker-1 backend-architect** | P0.1 deploy unlim-chat + P0.6 wake word "Ragazzi" + P0.10 PWA SW pattern | `supabase/functions/unlim-chat/index.ts` deploy + `src/services/wakeWord.js:141` + `vite.config.js` VitePWA | 3h |
| **Maker-2 code-architect** | P0.3 ADR-028 §14 amend + P0.4 ToolSpec count verify | `docs/adrs/ADR-028-*.md` UPDATE §14 + grep `scripts/openclaw/tools-registry.ts` | 1.5h |
| **WebDesigner-1 frontend-developer** | P0.7 HomePage A13b full | `src/components/ChatbotOnly.jsx` NEW + `src/components/HomePage.jsx` MODIFY + Cronologia + Easter modal | 8h (MAJOR atom) |
| **Tester-1 team-debugger** | P0.9 R7 50-prompt fixture exec + P0.5 5 missing lesson-paths E2E | `scripts/bench/r7-fixture.jsonl` exec + `tests/e2e/05-lesson-paths-coverage.spec.js` NEW | 2h |

### Phase 2 sequential (Documenter post barrier 4/4)

After 4/4 `automa/team-state/messages/{maker1,maker2,webdesigner1,tester1}-iter37-phase1-completed.md` filesystem confirmed:

- audit `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` (~400 LOC)
- handoff `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` (~250 LOC)
- CLAUDE.md append `## Sprint T iter 37 close (2026-04-30 PM/sera)` (~150 LOC)
- Mac Mini status verify

### Phase 3 (orchestrator)

- vitest full run baseline preserve verify (target 13256+ post iter 36 Phase 3 + iter 37 NEW tests)
- build PASS (~14min heavy, gate iter 38 entrance)
- commit (NO push main, NO --no-verify)
- push origin e2e-bypass-preview
- Mac Mini fresh screenshots cron next tick (L1+L2+L3 mapping)

---

## §10 Sprint T close projection iter 38

| Iter | Score target | Lift | Activation gate |
|------|--------------|------|-----------------|
| 36 | 8.5/10 | +0.5 vs iter 35 | this audit (G45 cap) |
| 37 | 9.0/10 | +0.5 P0 chain execute | Andrea ratify + deploy + R7 + A13b |
| 38 | 9.5/10 | +0.5 Sprint T close ONESTO | Deno port 62-tool + intent_dispatch_log migration + canary 5%→100% rollout |

**Sprint T close mandate** (post iter 38):
1. Onnipotenza full prod (server-side dispatch + INTENT shadow→canary→full)
2. Vision Gemini deploy + smoke prod
3. ADR-028 wire-up complete server+browser
4. 5 missing lesson-paths fixed + 92/92 esperimenti audit completion
5. Linguaggio codemod 200 violations Andrea iter 21 mandate (singolare→plurale)
6. Grafica overhaul `/colorize` + `/typeset` + `/arrange`
7. Vol3 narrative 92→140 lesson-paths refactor (Davide co-author iter 33+ deferred Sprint U)

**G45 mandate**: NO claim 9.5 senza Opus-indipendente review.

---

## §11 Anti-regression preserve mandate iter 37

- vitest 13229 + 27 NEW iter 36 = **13256 expected** baseline NEVER scendere
- composite-handler.test.ts 10/10 PASS (NEVER regress, file-ownership disjoint)
- clawbot-template-router.test.ts 19/19 PASS
- lavagna full sweep 180/180 PASS
- ModalitaSwitch 6/6 PASS
- Build NEVER skip pre-commit (14min OK)
- Pre-push hook NEVER bypass `--no-verify`
- guard-critical-files.sh blocca CircuitSolver/AVRBridge/PlacementEngine senza marker

---

**Activation iter 37**: see §1 ACTIVATION STRING (paste-ready) + §2 setup steps Andrea (5-10 min) + §3 priorities P0 (cascade target 9.0/10).

**Pattern S r3 race-cond fix**: validated 8th iter consecutive. Apply mandate iter 37+ standard (filesystem barrier 4-6 completion msgs PRE Phase 2 spawn).

**Sprint T iter 38 close target**: 9.5/10 ONESTO conditional Onniscenza full prod + Onnipotenza Deno port + ADR-028 wire-up complete + Vision Gemini deploy + 92 esperimenti audit completion + linguaggio codemod + Vol3 refactor.
