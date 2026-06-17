# PDR Master — Prossimi giorni post Sprint Q

**Data:** 2026-04-25 (close Sprint Q)
**Periodo target:** 2026-04-26 → 2026-05-15 (~3 settimane)
**Scope:** Sprint Q wiring production + Sprint 6 Day 39 + Mac Mini infrastructure

---

## TL;DR sequenza priorità

1. **D+0 (oggi)** review + merge 7 PR Sprint Q
2. **D+1** wire-up Edge Function (Q3 production)
3. **D+2** Q2 UI integration LavagnaShell
4. **D+3** GDPR remediation production (staging-first)
5. **D+4-6** Mac Mini infrastructure setup (livello 1+4+5)
6. **D+7-12** Sprint 6 Day 39 OpenClaw dispatcher (PDR esistente)
7. **D+13-15** Volumi assets import (TRES JOLIE 1.5GB)
8. **D+16-18** Brand alignment + watchdog refine
9. **Weekend** GPU benchmark Hetzner trial €25

---

## Fase 1: Sprint Q merge cascade (D+0)

### Sequenza review/merge

```
PR #34 (Q0 docs) → main
  ↓ rebase
PR #35 (Q1 schema) → main
  ↓ rebase
PR #36 (Q2 UI) → main
  ↓ rebase
PR #37 (Q3 Edge infra) → main
  ↓ rebase
PR #38 (Q4 Wiki) → main
  ↓ rebase
PR #39 (Q5 memory) → main
  ↓ rebase
PR #40 (Q6 generator) → main
```

### Ogni merge:
1. Andrea review draft PR
2. Convert draft → ready for review
3. CI check (auto-trigger)
4. Squash merge (preferito) o merge commit
5. Vercel auto-deploy preview branch
6. Smoke test https://www.elabtutor.school
7. Baseline test verify post-merge (no regression)

### Stima
- 7 PR × 10-15 min review = ~2 ore Andrea side
- Auto-merge sequenziale post review

---

## Fase 2: Wire-up Edge Function (D+1, ~4 ore)

### Scope
Integra Q3 infrastructure in `supabase/functions/unlim-chat/index.ts` production.

### Sotto-task

**Task 2.1** Import capitoli-loader + capitoloPromptBuilder
- Modify `unlim-chat/index.ts`: import `capitoli-loader.ts`
- Use `getCapitoloByExperimentId(experimentId)` to fetch active Cap context
- Inject `buildCapitoloPromptFragment()` in `buildSystemPrompt()` chain

**Task 2.2** Validator middleware
- Wrap response in `validatePrincipioZero(text)` before return
- If violations CRITICAL → log + retry truncate
- If violations HIGH → log + auto-truncate via `capWords()`

**Task 2.3** Test fixtures benchmark
- Run `tutor-q3-fixtures.jsonl` against deployed Edge Function staging
- Measure pass rate target ≥ 85%
- Iterate prompt fragment se < 85%

**Task 2.4** Deploy staging
- `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref ...`
- Smoke test 5 prompt manuali

**Task 2.5** Deploy production
- Solo se staging pass + Andrea OK
- Rollback plan: previous version SHA in deployment history

### Risk
- Rischio MEDIUM: prompt change può degradare qualità risposte
- Mitigation: 20 fixtures benchmark + iterative tuning

---

## Fase 3: Q2 UI integration LavagnaShell (D+2, ~6 ore)

### Scope
Wire Q2 components in production app shell.

### Sotto-task

**Task 3.1** Replace PercorsoPanel
- Modify `src/components/lavagna/LavagnaShell.jsx`:
  - Remove `lazy(() => import('./PercorsoPanel'))`
  - Add `lazy(() => import('./PercorsoCapitoloView'))`
- Update state hooks: capitoloId vs experimentId

**Task 3.2** Add CapitoloPicker trigger
- AppHeader new button "Capitoli"
- Modal/overlay with CapitoloPicker
- onSelectCapitolo → setActiveCapitoloId

**Task 3.3** Wire VolumeCitation onClick
- Handler opens `VolumeViewer.jsx` at specified page
- Lazy load VolumeViewer if not already

**Task 3.4** Wire DocenteSidebar reactive
- Subscribe to phase change events (scroll position OR explicit click)
- Update `activeExpIndex` + `activePhaseIndex` state

**Task 3.5** IncrementalBuildHint integration
- When esp.build_circuit.mode='incremental_from_prev' → render hint above simulator canvas
- BuildModeGuide existing remains for from_scratch mode

**Task 3.6** Browser preview verification
- `npm run dev` → http://localhost:5173
- Test golden path: open Cap 6 → see Percorso → click esp1 → sidebar updates → click VolumeCitation → opens Volume
- Test edge cases: empty Cap, theory Cap, project Cap, bonus tier

### Test
- Aggiornare e2e/03-unlim-chat.spec.js per coprire Capitolo flow
- Vitest baseline +0 (no new tests, but no regression on existing)

---

## Fase 4: GDPR remediation (D+3, ~4 ore)

### Scope
Risolvere CRITICAL/HIGH GDPR risks identified Q3 audit.

### Sotto-task

**Task 4.1** Force Gemini EU endpoint
- `supabase/functions/_shared/gemini.ts:11`:
  - Change `GEMINI_API_BASE` da `https://generativelanguage.googleapis.com/v1beta` a `https://europe-west1-generativelanguage.googleapis.com/v1beta` (verify exact URL Google docs)
- Test: smoke test Gemini call from staging
- Verify response routing through EU region (logs)

**Task 4.2** Wire `canUseTogether` gate in unlim-chat
- Import `together-teacher-mode.ts` `canUseTogether()` function
- Before any Together AI call check: `canUseTogether({payload: { hasStudentData: !context.isTeacher }})`
- If denied: fallback chain Gemini EU → Mistral FR → Qwen self-host

**Task 4.3** Add explicit isStudent role enforcement
- ChatRequest interface: add `userRole: 'student' | 'teacher'`
- Validate at input
- Default: `'student'` (più sicuro)

**Task 4.4** Privacy policy update
- `src/components/common/PrivacyPolicy.jsx`: aggiornare data flow disclosure
- Aggiungere: "Student runtime chat: solo Gemini EU + Mistral FR + Qwen self-host. Together AI esclusivamente per teacher batch + emergency con consenso."

**Task 4.5** Deploy staging + smoke test 24h
- Monitor logs Together AI calls = 0 sopra student runtime
- Verify Gemini EU latency acceptable (vs global)

**Task 4.6** Deploy production
- Solo dopo staging 24h pass + Andrea OK

### Risk HIGH
- Schrems II compliance per minori (8-14 anni)
- Misalignment fix → produzione rapida ma in safety per minori

---

## Fase 5: Mac Mini infrastructure (D+4-6, ~3 giorni)

### Scope
Implementare 3 livelli Mac Mini strategy (loop CLI + GitHub runner + Supabase local).

### Livello 1: Loop CLI H24

**Task 5.1.1** Verifica `caffeinate -i scripts/cli-autonomous/loop-forever.sh` running
**Task 5.1.2** Setup launch agent macOS per persistente post-reboot
**Task 5.1.3** Monitor uptime + restart automatic

### Livello 4: GitHub Actions self-hosted runner

**Task 5.4.1** Install GitHub Runner sul Mac Mini
- Token + URL setup
- Service launchd
- Labels: `self-hosted`, `mac-mini`, `arm64`

**Task 5.4.2** Update `.github/workflows/*.yml`:
- `runs-on: self-hosted` (selective workflows)
- Mantenere fallback `ubuntu-latest` per sicurezza

**Task 5.4.3** Benchmark velocità: GitHub-hosted vs self-hosted (target 3-5x)

### Livello 5: Supabase local staging Docker

**Task 5.5.1** `supabase start` Docker su Mac Mini
**Task 5.5.2** Sync schema + seed minimal data
**Task 5.5.3** Edge Functions local serve (`supabase functions serve unlim-chat`)
**Task 5.5.4** Document setup steps per replicate

### Risk LOW
- Mac Mini hardware singolo punto failure (no HA)
- Mitigation: documentare per replicate facilmente

---

## Fase 6: Sprint 6 Day 39 OpenClaw dispatcher (D+7-12, ~6 giorni)

### Scope
PDR esistente: `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`

### Sotto-fasi (high-level, dettaglio in PDR esistente)
- Day 39: dispatcher core (10 handler initial)
- Day 40-41: 80 tool registry + L1 morphic generator
- Day 42: state-snapshot integration + Wiki retriever Sett-4 wire
- Day 43: tool-memory pgvector cache (4 RPC SQL)
- Day 44: PZ v3 validator middleware production

### Pre-requisiti
- Sprint Q merged (✓ in cascade)
- Capitolo schema available (✓ Q1)
- percorsoGenerator service ready (✓ Q6)

---

## Fase 7: Volumi assets import (D+13-15, ~3 giorni)

### Scope
Import TRES JOLIE 1.5GB asset (immagini, foto, render) in app.

### Sotto-task

**Task 7.1** Inventory assets
- Image processing pipeline (downscale + format)
- Folder structure: `public/assets/volumi/vol{1,2,3}/cap{N}/`

**Task 7.2** Vol1 Cap 6 LED reference (proof)
- Import 5-10 immagini chiave (LED, breadboard montaggio)
- Wire in PercorsoCapitoloView.theory.figure_refs

**Task 7.3** Vol2/Vol3 import iterativo

**Task 7.4** Bundle size audit
- Bundle attuale 4.4MB main + assets
- Target post-import: < 6MB gzipped

### Risk
- Bundle bloat se import naive
- Mitigation: lazy-load per Cap + WebP format

---

## Fase 8: Brand + Watchdog refine (D+16-18, ~3 giorni)

### Brand alignment
- Logo placement consistency
- Typography refresh (Oswald usage audit)
- Color palette WCAG re-audit
- Marketing material consistency

### Watchdog
- Anomaly detection rules tuning
- Error budget tracking
- Alert thresholds adjustment

---

## Fase 9: GPU benchmark weekend (parallel non blocca)

### Scope
€25 weekend Hetzner trial GPU per benchmark Qwen self-host fattibilità.

### Tasks
- Provision Hetzner GPU (RTX 4000 o A100 small)
- Deploy Qwen3.5 2B-7B docker
- Latency benchmark vs Gemini EU
- Cost projection 8 scuole × 40 students × 20 req/week

### Decision criteria
- IF latency Qwen self-host < 800ms p95 + cost < 50€/month → migrate roadmap Sprint 7
- ELSE → keep Gemini EU + Mistral FR fallback

---

## Resources required

### Computer
- MacBook Air Andrea (primary dev)
- Mac Mini Strambino (loop H24 + CI runner + Supabase local)
- Weekend GPU Hetzner (parallelo)

### Claude subscriptions
- Claude Max (Desktop locale + cloud sessions)
- Anthropic API key GitHub Secrets (Sprint Q delivery showed +207 test in single session — Sprint 6 expected similar throughput)

### Skills/Team
- planner-opus, architect-opus, generator-app-sonnet, generator-test-sonnet, evaluator-haiku, scribe-sonnet
- File ownership boundaries: generator-app → src/, generator-test → tests/

---

## Rischi e mitigazioni

| Rischio | Severità | Mitigazione |
|---------|---------|-------------|
| Sprint Q merge conflict cascade | MEDIA | Rebase incrementale, CI catches issues |
| Edge Function wire-up rotura production | ALTA | Staging deploy + smoke test 24h |
| Q2 UI integration regression existing | MEDIA | Vitest + Playwright + browser preview verification |
| GDPR fix latency Gemini EU degrade UX | MEDIA | Benchmark vs global pre-prod |
| Mac Mini single point failure | BASSA | Docs setup replicabile |
| Sprint 6 Day 39 timeline slip | ALTA | PDR esistente robusto, scope già decomposto |
| Bundle bloat assets | MEDIA | Lazy-load + WebP |
| GPU benchmark inconclusive | BASSA | Decision criteria chiari |

---

## Deliverable post sequenza completa

1. **main branch** completamente aggiornato Q0-Q6 + wire-up
2. **Production live** con Capitolo schema + UI Percorso + GDPR fix
3. **Mac Mini** infrastruttura H24 + CI runner
4. **Sprint 6 Day 39** OpenClaw dispatcher delivered
5. **Volumi assets** importati app
6. **Brand consistency** refresh
7. **GPU benchmark** decision document

Stimato: ~3 settimane (Apr 26 → May 15) con team agenti orchestrati.

---

## Branch + PR strategy

Branch naming continuativo:
- `feat/sprint-6-day-39-dispatcher-2026-05-XX`
- `fix/edge-function-wire-up-2026-04-26`
- `feat/q2-ui-integration-2026-04-27`
- `fix/gdpr-eu-routing-2026-04-28`
- `infra/mac-mini-runner-2026-04-29`

Ogni PR: TDD strict + CoV 3x + audit doc.

---

**Verdetto PDR**: piano dettagliato pronto. Ogni fase ha sotto-task specifici + risk + stima. Andrea può procedere sequential o riarrangiare priorità.
