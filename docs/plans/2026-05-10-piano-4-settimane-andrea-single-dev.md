# Piano 4 Settimane ELAB Tutor — Andrea single-dev

> Andrea mandate 2026-05-10: "andiamo per piani settimanali. cartoni bocciati. settimane totali 4. piani considerali solo per me".
>
> Scope ristretto: SOLO Andrea single-dev. NO Tea co-dev / NO Davide outreach / NO Giovanni network in questo piano. Quelle attività sono separate, gestite altrove.
>
> Date: 2026-05-10 → 2026-06-07 (4 settimane = 28 giorni = 20 working days × 6-8h = 120-160h Andrea totali).

## Date chiave

- **Inizio piano**: 2026-05-10
- **Fine piano**: 2026-06-07
- **Lego SPIKE Prime ritiro mercato**: 30/06/2026 (3 settimane post-piano-end)
- **Fine anno scolastico IT**: 8-15 giugno 2026

## Visione finale Andrea (deduzione iter 11+12 feedback)

ELAB v2 = doposcuola STEM 40 min, parallelo a kit fisico Arduino Omaric + 3 volumi cartacei Davide Fagherazzi, AI tutor UNLIM specializzato 8-14 anni italiano, indispensabile + difficile da battere + non-aging.

**Anti-pattern da evitare**:
- Cartoni custom Tea protagonist (BOCCIATI Andrea explicit, €25-40k troppo presto)
- Web Component+MCP standalone fully extracted (Andrea: "inizialmente parallelo e completamente connesso ai kit", quindi bundle commercial reality Giovanni)
- Software-only commodity entro 18 mesi (Tinkercad/Khanmigo coperture 70%)

**Da raggiungere**:
- AR/CV dataset proprietary kit Omaric (moat 9/10 vs AI generic 2027)
- Teacher Dashboard reale + reportistica PDF genitori (PNRR rendicontazione compliance)
- Memoria UNLIM cross-sessione (iter 12 fix shipped uncommitted)
- Citation Vol/pag verbatim ≥85% (RAG matcher 830/1000 match shipped uncommitted)
- Knowledge graph kit-specifico componente→Vol/pag (Morfismo Sense 2 strict)

## Stato baseline pre-settimana 1 (2026-05-10)

### Branch attuale: `feat/unlim-parallel-agent-deploy-2026-05-10`

### Iter 11+12 close shipped + uncommitted

**Pushed origin (2 commit)**:
- `8b864135` iter 11 ralph loop (98 file: backend QW1-6 + Sprint U Cycle 2 fix #1+#2+#4 + 4 audit reports)
- `c072ddcb` iter 11 PATCH B (3 file: pre-LLM voltage + offtopic + CONTESTO strip)

**Uncommitted iter 12 (Andrea decisione GO/COMMIT pendente)**:
- Memoria fix #1+#2 (`memory.ts` + `unlim-chat/index.ts`, ~81 LOC)
- RAG matcher rewrite (`scripts/backfill/match-chunks-to-lessons.mjs` + `rag-metadata-backfill-iter14.mjs` + 16 NEW tests)
- Plus 200+ altri file uncommitted (Sprint U Cycle 1 iter 4 carryover + iter 9-10 work + scaffold marketing)

### Edge Function unlim-chat stato prod
- Deployed iter 11 V1 + PATCH B + iter 12 memoria fix (3 deploy successivi)
- Quindi PROD ha già il fix MA repo no (inconsistenza commit)

### Quality benchmark

| Bench | Score | Scope |
|---|---|---|
| Iter 8 R5 v57 | 91.70% | 5 cherry-pick |
| Iter 11 R5 post-deploy | **90.2% PASS** | 30 successful 12 PZ scorer ≥85% gate MET |
| Live smoke V1 pre-fix | 69.8% | 10 query |
| Live smoke V2 V1-deploy | 67.4% | regressione -2.4pp |
| Live smoke V3 PATCH B | 69.8% | recupero V2 dip ZERO lift NET |
| Live smoke V4 iter 12 memoria | TBD | BG agent in flight |
| Memoria Q10 fix verify | PASS | curl test live (Q10b "Continuiamo" → recall PASS) |

### Vitest baseline
- 13974 PASS post RAG matcher iter 12 (vs 13473 baseline pre-iter-11)
- ZERO regression cumulative

### BG agents in flight (DA NON DUPLICARE)
- afacbad369d7f5bfa: Live smoke V4 FULL 10 query verify memoria fix iter 12
- [research deep agent settimana 1]: Metodi educativi EU + AR phone + video formati + PNRR successori + Web Component MCP

## Settimana 1 (10-17 maggio 2026) — Foundation tactical iter 12-13

### Goal settimana 1
1. Iter 12 close definitivo (memoria + RAG matcher commits)
2. Live smoke V4 verifica lift atteso ≥80% PASS
3. Citation Vol/pag fix prod + V5 verify
4. Research deep aggiuntiva consolidata
5. Spec Teacher Dashboard backend MVP + AR/CV dataset minimo

### Lunedì-Martedì (11-12 maggio) — Iter 12 commits + V4 verify

**Andrea task** (~8-10h totali):
- [Att 1h] Wait BG agent live smoke V4 results → analyze lift vs V3
- [Att 30min] Wait BG research agent deep results
- [Att 1h] Verify iter 12 memoria fix + RAG matcher fix con vitest full + linter
- [Att 1h] Pre-commit dry-run + fix se test break
- [Att 30min] Commit iter 12 batch (memoria + RAG + tests + audit reports)
- [Att 30min] Push origin + verify pre-push hook PASS
- [Att 1h] Post-commit deploy verify Edge Function unlim-chat (re-deploy NON necessario, già LIVE)
- [Att 1h] Live smoke V4 results read + analyze gap residual vs target ≥80%
- [Att 2h] Citation Vol/pag fix prod (ANDREA_RATIFY=1 staging COMMIT staging Supabase test, NON prod)

**Deliverable lunedì-martedì**:
- Iter 12 batch commit pushed origin
- Edge Function ratified deployed iter 12
- Live smoke V4 results documented
- Staging RAG backfill ratified (sample 10 review pass)

**Risk**: Live smoke V4 sotto target ≥80% → diagnostic + fix iter 13

### Mercoledì-Giovedì (13-14 maggio) — Citation prod + Knowledge graph kit-specifico

**Andrea task** (~8-10h totali):
- [Att 2h] Citation prod COMMIT: `ANDREA_RATIFY=1` su staging → verify hybrid-RAG bench citation lift 1/10 → ≥5/10 → poi staging promote prod
- [Att 1h] Live smoke V5 post-citation-fix verify lift Vol/pag
- [Att 3h] Knowledge graph kit-specifico draft: file `src/data/kit-knowledge-graph.json` per ogni componente kit Omaric (LED, resistore 220Ω, breadboard, fotoresistore, ecc.) → mapping `{componente_id, kit_omaric_part, vol_ref[], pag_ref[], errori_comuni[3], soluzione_visuale_3step}`
- [Att 2h] Wire knowledge graph in `unlim-chat/index.ts` → response include "Vol.X pag.Y fig.Z" verbatim quando query include componente
- [Att 2h] Re-deploy Edge Function + live smoke V6 verify

**Deliverable mercoledì-giovedì**:
- Citation Vol/pag prod ≥5/10 misurato
- Knowledge graph kit-specifico v1 (15-20 componenti core)
- Live smoke V6 documented

**Risk**: Knowledge graph richiede tempo Andrea per schema design

### Venerdì (15 maggio) — Spec Teacher Dashboard backend + AR/CV dataset minimo

**Andrea task** (~6-8h):
- [Att 1h] Read deep research agent results → consolidate findings
- [Att 3h] Spec Teacher Dashboard backend MVP markdown:
  - Schema Supabase: `teacher_dashboard_classes` + `teacher_reports` + `student_progress_aggregated`
  - Edge Function `teacher-report-pdf` design (input: class_key, output: PDF)
  - Authentication flow: class_key + `teachers_password` (no auth full per ora)
  - GDPR: anonimizzazione studenti, consenso parentale check
- [Att 2h] AR/CV dataset minimo: Andrea filming 5 esperimenti pilota Vol.1 cap.6 LED su SUO kit (smartphone, no Tea)
  - Setup: smartphone iPhone Pro + scrivania luminosa + tripod €0 (esistente)
  - 5 esperimenti × 4 angoli × 3 stati = 60 foto
  - Edge Impulse free tier setup + first annotation pass
- [Att 1h] Spec AR/CV phone POC: documentazione integrazione Gemini Vision API + Edge Impulse model

**Deliverable venerdì**:
- Spec Teacher Dashboard MVP ready
- 60 foto kit Andrea + Edge Impulse setup
- Spec AR/CV phone POC ready

### Sabato-Domenica (16-17 maggio) — Audit + CoV settimana 1 close

**Andrea task** (~4-6h):
- [Att 1h] Run vitest full + benchmark CoV
- [Att 1h] Live smoke V7 stress 30+ query (estensione bench R5)
- [Att 1h] Audit close settimana 1 markdown
- [Att 1h] Plan settimana 2 dettagliato (basato su V7 results + research feedback)

### Settimana 1 close score target: **8.5/10 onesto** (G45 cap)

## Settimana 2 (18-24 maggio 2026) — Teacher Dashboard backend + AR/CV expand

### Goal settimana 2
1. Teacher Dashboard backend MVP DEPLOYED prod
2. AR/CV dataset 200 foto (Andrea solo) + Edge Impulse model train
3. Citation Vol/pag prod ≥85% misurato
4. Memoria UNLIM cross-sessione canary 25% rollout

### Lunedì-Martedì (18-19 maggio) — Dashboard backend

**Andrea task** (~10-12h):
- [Att 4h] SQL migration `teacher_dashboard_classes` + `teacher_reports` + `student_progress_aggregated` + RLS policies
- [Att 2h] Test SQL migration su staging Supabase
- [Att 4h] Edge Function `teacher-report-pdf` impl (input class_key, output base64 PDF)
- [Att 2h] Edge Function `teacher-classes-list` (read-only RLS-gated)
- [Att 1h] Test Edge Functions con curl
- [Att 1h] Apply migration prod (Andrea decision GO)

**Deliverable lunedì-martedì**:
- Teacher Dashboard backend MVP deployed prod
- 3 Edge Functions live (`teacher-report-pdf`, `teacher-classes-list`, `teacher-class-state`)

### Mercoledì-Giovedì (20-21 maggio) — AR/CV dataset Andrea single

**Andrea task** (~10-12h):
- [Att 3h] Filming Andrea solo Vol.1 esperimenti 1-15: 4 angoli × 3 stati = 180 foto Vol.1
- [Att 2h] Annotation Edge Impulse: bbox componenti + labels (LED, resistore, breadboard pin, GND, VCC, ecc.)
- [Att 3h] Train modello CV Edge Impulse (transfer learning MobileNetV2 + Italian K-12 lex)
- [Att 2h] Test inferenza phone (Gemini Vision API + Edge Impulse model)
- [Att 2h] PWA camera UI POC: studente inquadra breadboard → response phone screen overlay

**Deliverable mercoledì-giovedì**:
- 180 foto Vol.1 annotated
- Modello CV trained (precision target ≥85% su test set)
- PWA camera POC funzionante 3 esperimenti

### Venerdì (22 maggio) — Citation prod ≥85%

**Andrea task** (~6-8h):
- [Att 2h] Bench hybrid-RAG citation Vol/pag verbatim 30 query
- [Att 2h] Tuning prompt LLM per citation strict format `Vol.X pag.Y "frase verbatim"`
- [Att 2h] Re-deploy + live smoke V8 verify lift ≥85%
- [Att 2h] Stress test bench R6 esteso (50 query)

**Deliverable venerdì**:
- Citation Vol/pag prod ≥85% misurato
- Bench R6 50-query results

### Sabato-Domenica (23-24 maggio) — Memoria canary + audit close

**Andrea task** (~4-6h):
- [Att 2h] Memoria canary 25% rollout (env flag `MEMORIA_CANARY_RATE=0.25`) + monitor
- [Att 1h] Audit close settimana 2
- [Att 1h] Plan settimana 3 dettagliato

### Settimana 2 close score target: **9.0/10 onesto**

## Settimana 3 (25-31 maggio 2026) — Teacher Dashboard frontend + AR/CV expand 50 esperimenti

### Goal settimana 3
1. Teacher Dashboard frontend MVP deployed prod (4 view)
2. AR/CV dataset 500 foto (Vol.1 + Vol.2)
3. Web Component `<elab-simulator>` POC parallel (Andrea explicit OK iter 12 brief: "inizialmente parallelo e completamente connesso ai kit")

### Lunedì-Martedì (25-26 maggio) — Dashboard frontend

**Andrea task** (~10-12h):
- [Att 2h] React component `TeacherDashboard.jsx` (4 view: Classi / Studenti / Esperimenti / Report)
- [Att 2h] React component `TeacherClassDetail.jsx` (per classe: progress aggregato, common mistakes, ranking)
- [Att 2h] React component `TeacherStudentDetail.jsx` (anonymous ID, progress, achievements)
- [Att 2h] React component `TeacherReportPDFExport.jsx` (chiama Edge Function, download PDF)
- [Att 2h] Routing `#dashboard` hash + auth gate `class_key` localStorage
- [Att 2h] Test E2E Playwright Dashboard flow

**Deliverable lunedì-martedì**:
- Teacher Dashboard frontend MVP deployed Vercel prod
- E2E specs ready

### Mercoledì-Giovedì (27-28 maggio) — AR/CV Vol.2 expand

**Andrea task** (~10-12h):
- [Att 4h] Filming Andrea solo Vol.2 esperimenti 1-15: 4 angoli × 3 stati = 180 foto Vol.2
- [Att 2h] Annotation Edge Impulse Vol.2 (componenti nuovi: multimetro, transistor, motore, condensatore)
- [Att 2h] Re-train modello CV con dataset 360 foto totali (Vol.1 + Vol.2)
- [Att 2h] Test inferenza phone esteso 10 esperimenti
- [Att 2h] PWA camera UI integration unlim-chat (vision flow end-to-end)

**Deliverable mercoledì-giovedì**:
- 360 foto totali (Vol.1 + Vol.2 partial)
- Modello CV retrained
- AR vision flow end-to-end LIVE prod

### Venerdì (29 maggio) — Web Component POC

**Andrea task** (~6-8h):
- [Att 4h] Web Component `<elab-simulator>` POC LitElement standalone:
  - Wrap esistente `NewElabSimulator.jsx` come Web Component
  - Attribute API: `volume="1" capitolo="6" esperimento="1"`
  - Embeddable via `<script src=".../elab-simulator.js"></script><elab-simulator volume="1"></elab-simulator>`
  - Bundle size target ≤500KB (gzipped)
- [Att 2h] Test embed in pagina HTML standalone (NO React app esterno)
- [Att 2h] Documentation embed Teams Tab / Custom Gem / sito esterno (Andrea iter 10 brief)

**Deliverable venerdì**:
- Web Component `<elab-simulator>` v1 POC
- Standalone embed working

### Sabato-Domenica (30-31 maggio) — Pilota personale Andrea

**Andrea task** (~6-8h):
- [Att 4h] Pilota personale Andrea kit Omaric a casa: 10 esperimenti completi end-to-end con UNLIM
- [Att 2h] Document feedback + bug list
- [Att 2h] Audit close settimana 3 + plan settimana 4

### Settimana 3 close score target: **9.5/10 onesto** (G45 cap)

## Settimana 4 (1-7 giugno 2026) — Public consolidation + Lego momentum prep

### Goal settimana 4
1. Bug fix iterazione + production hardening
2. AR/CV dataset 750 foto (Vol.1 + Vol.2 + Vol.3 partial)
3. Bench R6 finale 50-query stress + R7 NEW 200-query target ≥85%
4. Web Component v1 production deploy CDN
5. Audit close 4-week + roadmap iter 16+ post Lego SPIKE retire

### Lunedì-Martedì (1-2 giugno) — Bug fix + AR Vol.3

**Andrea task** (~10-12h):
- [Att 4h] Bug fix da pilota personale settimana 3
- [Att 2h] Production hardening Dashboard + AR (rate limit, error retry, telemetry)
- [Att 4h] Filming Vol.3 esperimenti 1-10: 180 foto Vol.3 (60 foto/esperimento)
- [Att 2h] Annotation + retrain modello CV con dataset 540 foto

**Deliverable lunedì-martedì**:
- Bug-free Dashboard + AR
- 540 foto totali

### Mercoledì-Giovedì (3-4 giugno) — Bench R6 + R7 + Web Component CDN

**Andrea task** (~10-12h):
- [Att 3h] Bench R6 50-query stress final
- [Att 3h] R7 NEW 200-query target ≥85% (categorie balanced V1+V2+V3 + safety + offtopic + memoria)
- [Att 3h] Web Component v1 CDN deploy (Vercel static + npm package)
- [Att 3h] Web Component MCP server `mcp.elab.app` POC scaffold (defer iter 16+ se tempo insufficiente)

**Deliverable mercoledì-giovedì**:
- R6 PASS ≥90% + R7 PASS ≥85% bench
- Web Component v1 CDN live
- MCP server POC scaffolded (NOT production)

### Venerdì (5 giugno) — Audit close 4-week

**Andrea task** (~6-8h):
- [Att 3h] Audit close 4-week dettagliato (vitest + benchmark + live smoke + AR + Dashboard)
- [Att 2h] Roadmap iter 16+ post Lego SPIKE retire (Davide outreach scope re-attivare)
- [Att 2h] Documentation public README + CHANGELOG.md
- [Att 1h] Tag release `v2.0-pre-lego-retire`

**Deliverable venerdì**:
- 4-week audit ufficiale
- Roadmap iter 16+ ready
- v2.0-pre-lego-retire git tag

### Sabato-Domenica (6-7 giugno) — Buffer + start handoff

**Andrea task** (~4-6h):
- [Att 2h] Buffer per slip task settimana precedenti
- [Att 2h] Handoff Davide + Giovanni: pitch deck Lego SPIKE alternative finale + materiale outreach
- [Att 1h] Plan settimane 5-8 (post-piano-attuale Davide+Giovanni outreach + filiera + Tea co-dev se disponibile)

### Settimana 4 close score target: **9.7/10 onesto**

## Riepilogo deliverable 4 settimane Andrea single-dev

| # | Deliverable | Status target |
|---|---|---|
| 1 | Iter 12 commits memoria + RAG matcher pushed origin | ✅ settimana 1 |
| 2 | Citation Vol/pag prod ≥85% misurato bench R6 | ✅ settimana 2 |
| 3 | Teacher Dashboard MVP backend + frontend deployed prod | ✅ settimana 2-3 |
| 4 | AR/CV dataset 540-750 foto kit Andrea + modello CV trained | ✅ settimana 4 |
| 5 | PWA camera UI vision end-to-end live prod | ✅ settimana 3-4 |
| 6 | Knowledge graph kit-specifico v1 (15-20 componenti) | ✅ settimana 1 |
| 7 | Memoria UNLIM cross-sessione canary 25% rollout | ✅ settimana 2 |
| 8 | Web Component `<elab-simulator>` v1 CDN live | ✅ settimana 3-4 |
| 9 | Bench R7 200-query stress ≥85% PASS | ✅ settimana 4 |
| 10 | 4-week audit + roadmap iter 16+ ready | ✅ settimana 4 |

## Cosa NON include questo piano (defer scope esterni)

**Scope Davide + Giovanni separato** (NON Andrea single-dev):
- Outreach 10+ docenti pilota
- Pitch deck Lego SPIKE alternative consegna scuole
- CampuStore listing application
- Press release Italian EdTech
- Contratti scuole pre-deadline 30/06/2026
- Bandi PNRR successivi

**Scope Tea co-dev separato** (NON Andrea single-dev):
- Filming kit Omaric Vol.1+Vol.2+Vol.3 completi (Andrea fa Vol.1 partial + Vol.2 partial + Vol.3 partial = 540 foto, NON 5000 stretch goal)
- Annotation parallel
- Tea Volumes UX iteration (Andrea iter 21+ carryover)

**Scope DEFER iter 16+**:
- 94 cartoni custom Tea protagonist (BOCCIATI Andrea explicit)
- Multiplayer 4-squadre cooperative (richiede 50+ scuole base)
- Family bridge weekend home mode
- Stop-motion creator
- Knowledge graph esteso (>20 componenti)
- Memoria long-term cross-classe
- MCP server `mcp.elab.app` production
- Multi-lang UNLIM
- 92→94 esperimenti Playwright UNO PER UNO Andrea iter 21+

## Honest gap residual 4-week single-dev limits

- AR/CV dataset 540-750 foto vs target 5000 stretch (Andrea solo, NO Tea)
- Modello CV precision realistic ≥75% (NOT 95% richiede dataset 5000+)
- Teacher Dashboard MVP solo (NO admin avanzato, NO multi-tenancy)
- Web Component v1 POC (NO production CDN scale + 99.9 SLA)
- Memoria canary 25% (NOT 100% rollout, defer iter 16+)
- Knowledge graph 15-20 componenti vs ~80 totali kit Omaric
- 88/94 esperimenti senza template L2 dedicato (Morfismo Sense 2 partial)
- 4-week scope NON include outreach commerciale (Davide + Giovanni separato)

## Risk register 4 settimane

| # | Risk | Probabilità | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Live smoke V4-V8 sotto target ≥80% | Media | Alto | Iter 13 PATCH C citation + memoria fix tuning |
| 2 | Modello CV precision <70% (dataset insufficiente) | Alta | Medio | Defer AR live deploy iter 16+ se precision fail |
| 3 | Andrea malato/imprevisto | Bassa | Critico | Buffer 2 giorni weekend |
| 4 | Pre-commit hook break (vitest 13974+ regression) | Media | Alto | CoV obbligatorio prima ogni commit |
| 5 | Teacher Dashboard schema migrations break prod | Media | Critico | Staging test PRIMA di prod migration |
| 6 | Web Component bundle size >500KB | Media | Medio | Dynamic import + tree-shake aggressive |
| 7 | RAG matcher 170 skipped chunks edge case | Bassa | Basso | Defer iter 13 manual review |
| 8 | Edge Function timeout >12s prod | Media | Medio | Promise.all parallelize + timeout race |

## Decision points blocking 4 settimane

1. **GO commit iter 12 batch?** (memoria + RAG matcher) → richiesto settimana 1 lunedì
2. **GO ANDREA_RATIFY=1 RAG backfill staging?** → richiesto settimana 1 mercoledì
3. **GO Teacher Dashboard schema migration prod?** → richiesto settimana 2 lunedì
4. **GO Memoria canary 25%?** → richiesto settimana 2 venerdì
5. **GO Web Component CDN deploy?** → richiesto settimana 4 mercoledì
6. **GO release tag v2.0-pre-lego-retire?** → richiesto settimana 4 venerdì

## Misurazione successo

**Quantitative**:
- Vitest baseline 13974 → ≥14000 (+25 NEW tests minimo)
- R5 bench post-deploy 90.2% → ≥92% target settimana 4
- Citation Vol/pag 1/10 → ≥9/10 settimana 2
- AR/CV precision modello ≥75% test set settimana 4
- Live smoke V8 ≥80% PASS settimana 4
- Teacher Dashboard 4 view live + 3 Edge Functions

**Qualitative**:
- Iter 12-15 commits batch pushed origin (NO uncommitted residue)
- Edge Function deployed con git tag v2.0-pre-lego-retire
- Web Component v1 CDN live + standalone embed working
- Andrea pilota personale 10 esperimenti completati end-to-end senza bug
- 4-week audit Opus indipendente review G45 cap

## Anti-pattern da evitare

- `--no-verify` su commit (CLAUDE.md mandate FERREA)
- `git add -A` (CLAUDE.md FERREA)
- Cartoni custom Tea protagonist (Andrea BOCCIATI 2026-05-10)
- Pivot Web Component standalone fully extracted (Andrea iter 12: parallelo + ancorato kit)
- Outreach commerciale Andrea (scope Davide + Giovanni separato)
- Multi-lang UNLIM Italia first
- Engagement passivo (cartoon watching), engagement HANDS-ON

## Filosofia finale onesta brutale

**ELAB v2 4 settimane Andrea single-dev** = software backend solido + AR/CV moat foundation + Teacher Dashboard PNRR-ready + Web Component primitive parallel.

NON include outreach commerciale (Davide + Giovanni). NON include filming completo 5000 foto (Tea separate). NON include cartoni (BOCCIATI).

Senza outreach Davide + Giovanni post-piano-4-settimane, deliverable Andrea = scaffold tecnico ready ma INVISIBILE alle scuole italiane. Andrea ha responsabilità SOFTWARE, NON SALES.

Lego SPIKE retire 30/06/2026 = 3 settimane post-piano-end. Davide + Giovanni hanno 3 settimane per outreach scuole budget liberato. Senza piano commerciale parallelo Andrea-piano = opportunità persa.

**Andrea solo single-dev 4 settimane = focus tecnico**. Sales separato. NO compiacenza.
