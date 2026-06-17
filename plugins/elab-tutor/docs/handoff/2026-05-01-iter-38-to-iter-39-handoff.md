# Iter 38 → Iter 39 Handoff — Sprint T Carryover

**Date**: 2026-05-01 ~01:15 CEST
**Iter 38 close score**: **8.0/10 ONESTO** (G45 mechanical cap A10 not shipped + Lighthouse perf FAIL + 3/4 BG agents fail)
**Branch**: e2e-bypass-preview
**Anti-regression**: vitest 13474 PRESERVED ✓

---

## §1 ACTIVATION STRING iter 39 paste-ready

```
Esegui Sprint T iter 39 carryover iter 38 in `docs/handoff/2026-05-01-iter-38-to-iter-39-handoff.md` §3.

Path realistico Sprint T close iter 40+ (NON iter 39 single session):

Iter 39 P0 sequenza ottimizzata pre/post org-limit-reset:

PRE-RESET (inline orchestrator):
1. Phase 4 commit + push origin e2e-bypass-preview iter 38 deliverables (build PASS pre-commit hook ~14min)
2. Andrea: supabase db push --linked (apply A5 warmup_cron migration)
3. Andrea: SUPABASE_ACCESS_TOKEN=$TOKEN npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb (deploy v54)
4. Andrea: supabase secrets set ENABLE_INTENT_JSON_SCHEMA=true (canary 5%) — OR keep false canary deferred
5. Andrea: npm run build && npx vercel --prod --yes (Vercel deploy verify A12 PWA prompt LIVE post key rotation iter 32)
6. Smoke prod: curl unlim-chat HTTP 200 + intents_parsed verified Italian "Ragazzi"

POST-RESET (parallel agents quando org limit reset):
7. Spawn Maker-3 retry A14 codemod 200 violations singolare→plurale (4h)
8. Spawn Tester-1 retry A15 94 esperimenti Playwright UNO PER UNO sweep (3h)
9. Spawn Tester-2 R5 50-prompt re-bench post v54 deploy (target avg <3000ms p95 <6000ms PZ V3 ≥85%) + R6 100-prompt fixture v2 + page metadata SQL (target recall@5 ≥0.55) + R7 200-prompt post Mistral function calling (target ≥95% canonical) (3h)
10. Spawn Tester-3 A8 Vision Gemini Flash smoke + A2 Fumetto E2E (1h)
11. Spawn Maker-1 A10 Onnipotenza Deno port 12-tool subset server-safe (highlight + mountExperiment + captureScreenshot + getCircuitState + ...) (6-8h) + A4 streaming SSE (4h coordinate WebDesigner-1) + A9 STT Voxtral migration impl (6h coordinate Tester-4)
12. Spawn WebDesigner-1 A6 Lighthouse perf optimization (lazy load + bundle analysis + image optim + font preload) target ≥90 (2h) + A6.b Cronologia Google-style enhancement (2h)

Iter 39 score target: 8.0 → 8.7+/10 ONESTO conditional Phase 4 deploy verify + Andrea ratify queue close + R7 ≥95% post Mistral function calling deploy.

Sprint T close projection iter 40+: 9.5/10 ONESTO conditional A10 Onnipotenza Deno port + A13 canary rollout + A14 codemod + A15 92→94 esperimenti audit complete — Opus indipendente review G45 mandate.
```

---

## §2 Setup steps Andrea (5-15 min iter 39 entrance)

1. **Verify iter 38 commit pushed origin** (`git log -3 --oneline e2e-bypass-preview`):
   ```bash
   cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
   git log --oneline -3
   # Expected: feat(iter-38) commit at top with iter 38 deliverables
   ```

2. **Apply Supabase migration A5 warmup_cron** (~1 min):
   ```bash
   SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2- | tr -d '"\047 ')
   SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase db push --linked
   # Expected: 20260430220000_unlim_chat_warmup_cron applied, pg_cron extension active
   ```

3. **Deploy Edge Function unlim-chat v54** (~2 min):
   ```bash
   SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
   # Expected: unlim-chat v53 → v54 ACTIVE
   ```

4. **Decision A7 canary 5% rollout** (~1 min):
   - Set `ENABLE_INTENT_JSON_SCHEMA=true` for 5% of sessions OR keep false (rollout iter 40+).
   - Recommend: keep false iter 39 entrance + spawn Tester-2 R7 baseline 200-prompt v54 BEFORE flag enabled to verify regression-free post-deploy.

5. **Verify Vercel deploy A12 PWA prompt** (~3 min):
   ```bash
   npm run build && npx vercel --prod --yes
   # Expected: dist/sw.js + 32 precache + new index.html with UpdatePrompt mounted
   # Open https://www.elabtutor.school in browser → toast "Ragazzi, c'è una nuova versione"
   ```

6. **Smoke prod end-to-end** (~5 min):
   - Curl `unlim-chat` HTTP 200 + Italian "Ragazzi" + Vol/pag verbatim citation
   - Browser test wake word "Ehi UNLIM" + MicPermissionNudge banner appears on first load
   - Browser test PWA UpdatePrompt toast appears post deploy

---

## §3 Priorities iter 39 P0 (carryover iter 38)

### Tier 1 carryover MUST DO iter 39

- **A14 Linguaggio codemod 200 violations singolare→plurale** (Andrea iter 21+ mandate, Maker-3 retry post org reset, ~4h)
- **A15 94 esperimenti Playwright UNO PER UNO sweep audit** (Andrea iter 21+ mandate Sprint T close gate, Tester-1 retry, ~3h)
- **A1.b R5 50-prompt re-bench post-deploy** (Tester-2, target avg <3000ms p95 <6000ms, ~30 min)
- **A1 R6 fixture v2 + page metadata SQL** (Tester-2 + Maker-1, target recall@5 ≥0.55, ~4h)
- **R7 200-prompt re-bench post Mistral function calling deploy** (Tester-2, target ≥95% canonical vs 12.5% iter 37 baseline, ~1h)
- **A8 Vision Gemini Flash smoke + Andrea ratify GOOGLE_API_KEY** (Tester-3 + Andrea, ~1h)
- **A2 Fumetto fix prod regression** (Tester-3 E2E re-verify post Vercel deploy, ~30 min)
- **A6 Lighthouse perf ≥90** (WebDesigner-1 optimization pass, ~2h)

### Tier 2 high-value defer iter 39+

- **A10 Onnipotenza Deno port 12-tool subset** (Maker-1, ~6-8h, Sprint T close gate per PDR §4 cap)
- **A4 Mistral streaming SSE** (Maker-1 + WebDesigner-1 client parsing coordinate, ~4h)
- **A9 STT Voxtral migration impl** (Maker-1 voxtral-stt-client.ts ~250 LOC + Tester-4 9-cell matrix, ~6h)
- **A13 Canary 5%→25%→100% rollout per ADR-028 §7** (Maker-1, depends A10, ~3h)

### Tier 3 polish defer iter 39+

- **A6.b Cronologia Google-style enhancement** (WebDesigner-1, P2 carryover iter 33+, ~2h)
- **A16 Tres Jolie volumi parallelismo audit** (Documenter, P2 carryover, ~3h)

### Andrea ratify queue iter 39+ entrance

- **D1 ADR-025 Modalità 4 simplification** (carryover iter 22, 15 min)
- **D2 ADR-026 content-safety-guard runtime ratify + deploy** (carryover iter 22, 30 min)
- **D3 ADR-027 Davide co-author session** (1h Davide presence required, narrative refactor schema 92→140 lesson-paths)
- **D4 Tea Glossario spec session** (1h Tea presence required, port from elab-tutor-glossario.vercel.app)
- **ADR-030 Mistral function calling INTENT canonical** ratify (NEW iter 38, deadline iter 39 Phase 3 entrance gate per PDR §4 cap)
- **ADR-031 STT migration Voxtral Transcribe 2** ratify (NEW iter 38, deadline iter 39 entrance gate impl approval)

---

## §4 Cross-link docs iter 38

- **Audit Phase 3 close iter 38**: `docs/audits/2026-05-01-iter-38-PHASE3-CLOSE-audit.md`
- **Handoff iter 39**: this file (`docs/handoff/2026-05-01-iter-38-to-iter-39-handoff.md`)
- **CLAUDE.md append iter 38 close**: see "Sprint T iter 38 close" section
- **PDR iter 38**: `docs/pdr/PDR-ITER-38-SPRINT-T-CLOSE-CARRYOVER-COMPLETE.md`
- **Tester-6 iter 37 R7 v53 evidence (4-way schema drift)**: `automa/team-state/messages/tester6-iter37-phase3-completed.md` §3.4 + §4
- **ADR-028 §14.b 4-way schema drift resolution**: `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md`
- **ADR-029 LLM routing 70/20/10**: `docs/adrs/ADR-029-llm-routing-weights-conservative-tune.md`
- **ADR-030 Mistral function calling INTENT canonical**: `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md`
- **ADR-031 STT migration Voxtral Transcribe 2**: `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md`
- **4 completion msgs Phase 1 iter 38**: `automa/team-state/messages/{maker1,maker2,maker3,webdesigner1}-iter38-phase1-completed.md`

---

## §5 Anti-inflation G45 mandate iter 39 entrance

- **Cap iter 38 8.0/10 ONESTO honored** — NO claim Sprint T close achieved (A10 not shipped per PDR §4 cap)
- **vitest 13474 baseline NEVER scendere** iter 39+
- **NO `--no-verify`** ever (pre-commit hook mandatory)
- **NO push main** — branch e2e-bypass-preview only
- **NO debito tecnico inflation** — A14 codemod + A15 esperimenti + R7 deploy verify + Andrea ratify queue ALL explicit defer iter 39+ acknowledged carryover
- **Lighthouse perf 26+23 FAIL ≥90 target acknowledged** — defer iter 39+ optimization pass
- **Build PASS pre-commit hook gate** — iter 39 entrance mandatory verify (~14min)

---

**Status**: iter 38 PHASE 3 close ONESTO **8.0/10 G45 cap**, Sprint T close target 9.5/10 NOT achieved iter 38. Realistic path Sprint T close iter 40+ post org-limit-reset session with parallel agents capable of A10 Deno port + A14 codemod + A15 Playwright sweep + R7 deploy verify ≥95%.
