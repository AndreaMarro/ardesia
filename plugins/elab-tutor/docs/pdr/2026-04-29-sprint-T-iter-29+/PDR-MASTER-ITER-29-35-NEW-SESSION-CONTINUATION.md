# PDR Master iter 29-35 — New Session Continuation

**Date**: 2026-04-29 PM iter 28 close
**Author**: Claude Opus 4.7 (autonomous orchestrator) + Andrea Marro (founder)
**Branch**: e2e-bypass-preview (origin synced HEAD `ca9f15c` post-iter 27 + iter 28 commits pending)
**Score iter 28 close ONESTO target**: 7.5/10 (G45 anti-inflation cap, +0.5 vs iter 27 7.0)
**Pattern**: Single-agent autonomous orchestrator + 4 parallel agents + Mac Mini D1 background
**Sprint T close target**: iter 31 score 8.5/10 ONESTO

## TL;DR

5 commit iter 26-27 LANDED origin. Iter 28 P0 in flight (4 agenti paralleli + Mac Mini). Andrea richiede continuazione iter 29-35 in nuova sessione. Questo PDR fornisce activation prompt + 7-iter roadmap atomica + ground truth tres jolie volumi + Mac Mini autonomous improvements + test count target +1500.

## Context recap iter 1-28

### Commits LANDED iter 1-27 (Sprint T epoch 2026-04-28+)
- `b81a28b` Lavagna Bug 1 BUCKET MISMATCH fix iter 25
- `f3c72af` PDR Master iter 25-32 distribution + System Map
- `d1f7651` Lavagna Bug 2 EXIT HASH NAV fix iter 26
- `e1ad92e` sys-prompt v3.1 design iter 27 P0
- `29f9026` sys-prompt v3.1 KIT MANDATORY + 2 few-shot iter 26
- `54bfb23` Modalità 4 UI canonical + L2 templates runtime loader iter 26 (12 file +1466 LOC, 29/29 PASS)
- `e5f9501` Marketing PDF 21 pages + 4-pass cross-val iter 26
- `ca9f15c` Harness STRINGENT 5-livelli + persona sim + iter 27 close audit (4 file +519 LOC)

### Iter 28 in-flight (this session)
- Agent A (Lavagna Bug 3 Supabase sync drawingPaths) — `a6c4138ab2d39b319`
- Agent B (Voice wake-word "Ehi UNLIM" wire-up) — `a24ae4505eeff2a5a`
- Agent C (Pixtral 12B vision bench script Harness STRINGENT Livello 3) — `a382920977741823f`
- Agent D (test-automator services+utils +200 NEW tests) — `a1764b84e0798652a`
- Mac Mini D1 (ToolSpec L2 expand 20→52, queued `~/.elab-task-queue.jsonl`)

## Ground truth canonical (UPDATED iter 28)

### Volumi tres jolie (PRIMARY source)
```
Vol1: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf
Vol2: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf  (NOTE: 2 spazi prima del 2)
Vol3: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt  (ODT V0.9, 9 cap reali)
```

**Vol3 ODT V0.9 9 cap reali** (NOT 12 phantom Tea PDF outdated bozza). Score correction iter 23: 0.55→0.92.

### Volumi extracted text (SECONDARY)
```
/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/  (Vol1 27MB, Vol2 17MB, Vol3 18MB)
/tmp/vol{1,2,3}.txt  (pdftotext output, ad-hoc)
```

### Tres jolie altre risorse
```
- Foto componenti: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/{1,2,3} ELAB VOLUME .../1 FOTO COMPLESSIVE DEL VOLUME .../
- Kit BOM: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/BOM KIT CON ELENCO COMPONENTI/
- Sketch sources: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/4 SKETCH MANUALE VOLUME 3/
- Logo + brand: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/LOGO/
- Rendering scatole: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/RENDERING SCATOLE/
- Video tutorial: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/Video/
- Giovanni materials: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/Giovanni/
- Volantino vol 1: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/Volantivo per volume 1/
```

## Mac Mini autonomous improvements iter 28+

### Stato corrente verified iter 28
- Hardware: Mac M4 16GB Strambino, uptime 22d, load avg 1.31
- SSH: `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)
- launchctl: `com.elab.mac-mini-autonomous-loop` PID 93383 ATTIVO
- Repo: `~/Projects/elab-tutor` synced HEAD `ca9f15c`
- Queue: `~/.elab-task-queue.jsonl` (1 task queued D1)
- Results: `~/.elab-results/`
- Health: `~/.elab-health.json` (auto-refresh ogni 30min)
- Logs: `~/Library/Logs/elab/autonomous-loop-v2-YYYYMMDD.log`

### Improvements iter 29+
1. **Queue dispatcher robust**: append-only JSONL + FIFO + retry exponential backoff (3 max) + dead letter queue
2. **Health endpoint REST**: Mac Mini server localhost:9101/health → `~/.elab-health.json` exposed via Tailscale (read-only MacBook side)
3. **Slack/Telegram notifications**: task completed/failed → push notify Andrea
4. **Volumi-anchored generation**: every Mac Mini task DEVE leggere `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/...` e citare Vol/pag VERBATIM (Principio Zero V3)
5. **Heartbeat REPO sync**: `git pull` every 1h + abort se conflict (NO auto-merge)
6. **Concurrency limit**: max 1 task active (single-tenant per ora, scale 2-3 iter 30+)
7. **Result audit**: ogni task result deve passare `principio-zero-validator.ts` runtime PRE commit
8. **Cost tracking**: log Claude/Mistral API spend per task in `~/.elab-cost-log.jsonl`

### Mac Mini task queue iter 28-31 (overnight batch)
- D1: ToolSpec L2 expand 20→52 (in flight iter 28)
- D2: Wiki concepts batch 100→150 (50 NEW: stepper, encoder, accelerometro, bluetooth, ir, rfid, gps, oled, lcd, dht11, ds18b20, hc-sr04, mpu6050, mq-2, soil-moisture, raindrop, photoresistor, thermistor, etc.)
- D3: 92 esperimenti audit volumi-anchored (per esperimento check: existe in tres jolie? cita Vol/pag corretto? Componenti coerenti palette Omaric? Cap. titolo libro coincide?)
- D4: Linguaggio codemod plurale singolare 200 violations (find imperative singolare → plurale "Ragazzi,")
- D5: 5 persona simulation Playwright spec generation (decimate gold-set 10 esperimenti × 5 persona)
- D6: Tea documents review (analisi_complessita, riepilogo_correzioni, schema_ux, 10_idee) → action items distillate
- D7: Marketing competitor scan (Tinkercad, Wokwi, LabsLand, Snap Circuits, Code.org pricing 2026)
- D8: ADR-027 Volumi narrative refactor schema → JSON mapping 92 esperimenti vs tres jolie struttura

## Iter 28 close (post-agents) — projected

### P0 deliverables (atomic atoms)
- ATOM-S28-A1: Lavagna Bug 3 Supabase sync drawingPaths (Agent A)
- ATOM-S28-A2: Voice wake-word "Ehi UNLIM" wire-up (Agent B)
- ATOM-S28-A3: Pixtral 12B vision bench script (Agent C)
- ATOM-S28-A4: test-automator +200 NEW tests services+utils (Agent D)
- ATOM-S28-D1: Mac Mini ToolSpec L2 expand 20→52 (overnight)
- ATOM-S28-D5: Mac Mini wiki batch 100→150 (overnight)

### Honest caveats critical iter 28 close
1. **30-bench v3.1 STILL BLOCKED**: ELAB_API_KEY plaintext non retrievable Supabase secrets (digest-only). Workaround: Andrea fornisce secure channel OR run via Vercel preview bypass (E2E_AUTH_BYPASS=true skips ELAB_API_KEY check at proxy level).
2. **Pixtral bench MOCK MODE**: ground truth 92 PNG screenshots non esistono. Iter 28 = framework only, real run iter 29 post-Andrea+Tea ground truth batch.
3. **Voice wake-word**: WebSpeech API browser-dependent, false positive italian phonetic, fallback graceful.
4. **Lavagna Bug 3**: scaffolded sync, NO migration applied iter 28 (Andrea decide deploy).
5. **test-automator**: tests test BUSINESS logic, NO real-DOM, NO real-network. Coverage delta != 100%.
6. **Mac Mini D1**: Claude --print exec depend SSH user $PATH, claude binary present nei PATH del cron user OR fallback API direct.

## Iter 29 priorities P0 (next session FIRST)

### A. Verify iter 28 agent deliverables
1. Read agent reports (`/private/tmp/.../tasks/<agent_id>.output`)
2. Inspect file_system delta (git status pre-commit hook)
3. CoV vitest run isolated NEW test files (target 100% PASS)
4. CoV vitest run FULL suite (target 12827 + delta NEW PASS, ZERO regression)
5. Stage + commit per atom (single commit per agent deliverable)
6. Push origin

### B. Andrea ratify queue (gating actions iter 29-31)
1. ELAB_API_KEY plaintext via secure channel (~5min) → unlock 30-bench v3.1 scale
2. Lavagna Bug 3 SQL migration apply (~3min `supabase db push`)
3. Voice wake-word permission browser test LIM 4K (~10min playtest)
4. ADR-025 Modalità 4 voci 1+2+3 ratify (~6min)
5. ADR-026 content-safety-guard deploy iter 28 P0.3 (~5min `supabase functions deploy`)
6. ADR-027 Volumi narrative refactor schema (Davide co-author dependency, deferred Sprint U se blocker)

### C. Pattern S 5-agent OPUS PHASE-PHASE iter 29
- planner-opus: 12 ATOM-S29 atoms (volumi narrative + harness STRINGENT Livello 1+2 impl + persona sim full + simulator 92 broken sweep + grafica overhaul)
- architect-opus: ADR-029 STRINGENT 5-livelli implementation plan + ADR-030 simulator broken triage methodology
- gen-app-opus: harness STRINGENT Livello 1 TEXT runner LIVE + Livello 2 SEMANTIC scaffold Mistral judge
- gen-test-opus: 92 esperimenti compile+run Playwright spec + persona sim 5 utenti full assertions
- scribe-opus (PHASE 2 sequential): audit + handoff + CLAUDE.md update

## Roadmap iter 29-35 (Sprint T + Sprint U entry)

### Iter 29 — Harness STRINGENT impl + simulator broken sweep
- Livello 1 TEXT runner full impl (regex + bench 30 prompt)
- Livello 2 SEMANTIC Mistral judge scaffold + 30 ground truth K-12 examples
- Simulator Playwright spec 92 esperimenti (compile + run + LED check)
- Persona sim full assertions iter 27 P2 scaffold → impl
- Mac Mini D2+D3 wiki+92 audit results integrate
- Score target: 8.0/10

### Iter 30 — Lingua codemod + ADR-027 ratify gate
- Linguaggio codemod 200 violations imperative singolare → plurale "Ragazzi,"
- ADR-027 Volumi narrative refactor schema (Davide co-author)
- Lesson-paths refactor: variazioni stesso tema (vs pezzi staccati) per Vol1+2+3
- Andrea + Davide playtest in-classroom (ground truth definitivo Sprint U entry)
- Mac Mini D4 codemod batch + D6 Tea action items
- Score target: 8.2/10

### Iter 31 — Sprint T close + Sprint U entry
- Harness STRINGENT v2.0 5-livelli aggregated score (target ≥80% PASS 92 esperimenti OR honest debt list)
- Andrea ratify queue clear (5/5 voci done)
- ADR-026 content-safety-guard LIVE prod
- Modalità 4 UI ratify 12/12 done
- L2 ToolSpec 80/80 (Mac Mini D1 full)
- Wiki 150/150 (Mac Mini D2 full)
- Score target: 8.5/10 ONESTO (Sprint T close ratified)

### Iter 32 — Sprint U entry: grafica overhaul + design system formal
- Frontend grafica overhaul (Andrea iter 18 PM mandate "MIGLIORA LA GRAFICA")
- Design system formal: tokens.json + Storybook + design.md
- Color palette tres jolie audit (palette pages volumi vs CSS)
- Iconografia derivata sketch tres jolie (NO icone material-design generiche)
- WCAG AA pass full sweep
- Score target: 8.7/10

### Iter 33-34 — Backend hardening + scaling test
- Hybrid RAG retriever BM25+dense+RRF k=60 prod tuning (ADR-015)
- ClawBot composite live wire-up multi-step (ADR-013 D4 postToVisionEndpoint full)
- TTS Isabella WS Deno migration deploy (ADR-016)
- Test count target: 14000+ (CLAUDE.md Sprint 8 target)
- Score target: 9.0/10

### Iter 35 — Sprint U close + Sprint V entry: pricing + go-to-market
- Pricing page public (genitore persona unblock)
- Pricing tier: Lavagna+Unlim solo / Tutto / Voce / Videolezioni (Andrea iter 17 mandate)
- B2C entry plan (vs B2B scuole only)
- Giovanni warm intros activation
- Davide MePA listing follow-up
- Score target: 9.2/10 — production-ready close

## Activation prompt new session (iter 29 entrance)

```markdown
# Sprint T iter 29 entrance — Harness STRINGENT impl + simulator broken sweep

ULTRATHINK + caveman mode active.

## Setup steps (5-10 min Andrea)
1. ELAB_API_KEY plaintext via secure channel (Apple Notes encrypted? 1Password? gh secrets?) per unlock 30-bench v3.1 scale
2. `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && git pull origin e2e-bypass-preview` (sync iter 28 commits)
3. `npx vitest run` baseline check (atteso ≥13027 PASS post iter 28 +200 tests)
4. Read `docs/audits/2026-04-29-iter-28-CLOSE-audit.md` per dettagli iter 28 close
5. Read `docs/pdr/2026-04-29-sprint-T-iter-29+/PDR-MASTER-ITER-29-35-NEW-SESSION-CONTINUATION.md` (questo doc)

## Iter 29 P0 priorities
- Harness STRINGENT Livello 1 TEXT runner full impl (regex + 30 prompt bench)
- Harness STRINGENT Livello 2 SEMANTIC Mistral judge scaffold + ground truth 30 K-12 examples
- Simulator Playwright spec 92 esperimenti (compile + run + LED frame check)
- Persona sim full assertions (scaffold → impl 10 decimate gold-set)
- Andrea ratify Modalità 4 voci 1+2+3 (ADR-025 deadline iter 22 already passed)

## Pattern S 5-agent OPUS PHASE-PHASE
- planner-opus: 12 ATOM-S29 atoms
- architect-opus: ADR-029 + ADR-030
- gen-app-opus: Livello 1+2 impl
- gen-test-opus: 92 esperimenti compile+run + persona full
- scribe-opus PHASE 2 sequential: audit + handoff + CLAUDE.md

## Mac Mini autonomous (background overnight)
- D1: ToolSpec L2 52→80 (final batch 28 NEW templates)
- D2: Wiki 150→200 (sensori avanzati batch)
- D3: 92 audit volumi-anchored results integrate
- D6: Tea documents distillate action items

## PRINCIPIO ZERO V3 imperativo
Docente protagonist + kit fisico ELAB + citazione Vol/pag VERBATIM. Mai dimenticare per ogni azione.

## G45 anti-inflation
NO score >7 self-claim senza Opus indipendente audit. Honest debt list mandatory ogni close.

## Volumi tres jolie path (canonical ground truth)
- Vol1: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf
- Vol2: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf  (2 spazi)
- Vol3: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt  (ODT V0.9 9 cap reali, NOT 12)

Score iter 28 close ONESTO: 7.5/10 (G45 cap, target).
Score iter 29 target: 8.0/10 ONESTO.
Sprint T close iter 31 target: 8.5/10 ONESTO.
```

## File ownership matrix iter 28-31 (NO collisions)

| Agent / Owner | Files allowed | Files forbidden |
|---|---|---|
| Lavagna Bug 3 | DrawingOverlay.jsx, drawingSync.js (NEW), tests/unit/services/drawingSync.test.js | LavagnaShell.jsx, simulator core, AVRBridge, CircuitSolver |
| Voice wake-word | LavagnaShell.jsx (lines 50-100 + new useEffect), tests/unit/lavagna/wakeWord-integration.test.jsx | wakeWord.js (read-only), DrawingOverlay.jsx, ModalitaSwitch.jsx |
| Pixtral bench | scripts/bench/pixtral-vision-92-experiments.mjs (NEW), tests/unit/scripts/pixtral-vision-bench.test.js | Edge Fn unlim-vision (read-only) |
| test-automator | tests/unit/services/* (NEW), tests/unit/utils/* (NEW), tests/unit/data/* (NEW) | src/** (NO modify SOURCE) |
| Mac Mini D1 | supabase/functions/_shared/clawbot-templates-batch2.ts (NEW) | clawbot-templates.ts (existing 20, NO modify) |
| iter 29 planner-opus | automa/tasks/pending/ATOM-S29-*.md, automa/team-state/sprint-contracts/sprint-T-iter-29-contract.md | Source files (read-only spec) |
| iter 29 architect-opus | docs/adrs/ADR-029-*.md, docs/adrs/ADR-030-*.md | All other docs/ |
| iter 29 gen-app-opus | scripts/bench/harness-stringent-livello-1-runner.mjs, scripts/bench/harness-stringent-livello-2-mistral-judge.mjs | Edge Fns (need Andrea ratify before deploy) |
| iter 29 gen-test-opus | tests/e2e/03-simulator-92-experiments.spec.js, tests/persona-sim/runner.spec.js (extend) | Other test files (additive only) |
| iter 29 scribe-opus | docs/audits/2026-04-29-iter-29-*.md, docs/handoff/2026-04-29-iter-29-to-iter-30-*.md, CLAUDE.md (append) | All other |

## Cross-reference iter 28+

- iter 27 close audit: `docs/audits/2026-04-29-iter-27-CLOSE-audit.md`
- iter 27 harness STRINGENT design: `docs/audits/2026-04-29-iter-27-HARNESS-STRINGENT-DESIGN.md`
- iter 26 prompt v3.1 design: `docs/audits/2026-04-29-iter-26-PROMPT-V3-1-DESIGN.md`
- iter 25 PDR Master: `docs/pdr/2026-04-29-sprint-T-iter-18+/PDR-MASTER-ITER-25-32-DISTRIBUTION.md`
- iter 25 SYSTEM MAP: `docs/audits/2026-04-29-iter-25-SYSTEM-MAP-COMPLETE.md`
- iter 24 broken experiments: `docs/audits/2026-04-29-iter-24-2-broken-experiments-investigation.md`
- ADR-025 Modalità 4: `docs/adrs/ADR-025-modalita-4-simplification.md`
- ADR-026 content-safety-guard: `docs/adrs/ADR-026-content-safety-guard-runtime.md`
- ADR-027 Volumi narrative refactor: `docs/adrs/ADR-027-volumi-narrative-refactor.md`
- Marketing PDF: `docs/research/2026-04-29-iter-26-MARKETING-COSTI-COMPARATA.pdf`
- Persona sim scaffold: `tests/persona-sim/personas.json` + `runner.spec.js`

## Honest caveats master (G45 anti-inflation iter 1-28 cumulative)

1. Sprint S iter 19 harness 2.0 self-claim 85/87 PASS = falso positivo strutturale (regex permissive, NO topology check)
2. ClawBot composite handler iter 19-25 originally claim 52/80 → reality 20/52 (32 templates ancora DEBT iter 28-29 Mac Mini D1)
3. Iter 23 Vol3 score 0.55 was WRONG (Tea PDF outdated 12-cap structure). User correction: tres jolie ODT V0.9 9 cap reali, score 0.92.
4. Iter 24 4 Edge Functions LIVE claim → reality 10 Edge Fns (multi-modal + chat + tts + stt + vision + imagegen + diagnose + hints + gdpr + memory)
5. Iter 25 Mistral routing 65/25/10 → 84% Mistral hit verified prod 25 calls (NO inflation, real telemetry)
6. Iter 26 v3.1 smoke 5/5 ≠ scale 30 (46.7%/33.3% pre-deploy baseline preserved, post-deploy scale BLOCKED ELAB_API_KEY)
7. Iter 27 harness STRINGENT 5-livelli = DESIGN ONLY, IMPL distribuited iter 28-31
8. Iter 27 persona sim 5 personas scaffold ≠ 92 esperimenti × 5 × all assertions (scope iter 29 = 10 decimate)
9. Iter 28 Lavagna Bug 3 = scaffolded sync, NO migration applied (Andrea ratify required)
10. Iter 28 Pixtral bench = MOCK mode (ground truth 92 PNG DEBT Andrea+Tea iter 29)
11. Iter 28 Voice wake-word = browser-dependent, fallback graceful, NO production validation playtest LIM 4K
12. Iter 28 test-automator +200 tests = business logic ONLY, NO real-DOM, NO integration

## Sprint U+V preview (post-iter 31)

### Sprint U entry (iter 32-35)
- Grafica overhaul + design system formal
- ADR-027 Volumi narrative refactor LIVE (Davide co-author)
- Lingua codemod 200 violations done
- Backend hardening (Hybrid RAG + ClawBot composite + TTS Isabella WS)
- Test count 14000+
- Andrea + Davide playtest in-classroom

### Sprint V entry (iter 36+)
- Pricing public (4 tier: Lavagna+Unlim / Tutto / Voce / Videolezioni)
- B2C unlock (genitore persona)
- Giovanni warm intros + Davide MePA follow-up
- Production-ready 9.2/10 close

## Final note

Iter 28 close score 7.5/10 ONESTO target. Sprint T close iter 31 8.5/10. Sprint U close iter 35 9.2/10 production-ready.

Patrnership Andrea + Tea + Davide + Giovanni + Omaric robust. Andrea único dev critical path. Mac Mini autonomous "secondo cervello" servant. Mai compiacenza, mai inflazione.

PRINCIPIO ZERO V3 imperativo. Mai dimenticare per ogni azione.

Morfismo dual moat: Sense 1 morfico runtime (codice adatta classe/docente/kit/UI) + Sense 2 triplet coerenza (software ↔ kit Omaric ↔ volumi tres jolie). Differenziatore competitivo 2026+ vs LLM-democratizzato.
