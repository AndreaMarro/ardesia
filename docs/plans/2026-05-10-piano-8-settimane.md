# Piano 8 Settimane ELAB Tutor — 2026-05-10

> Strategia onesta brutale post iter 11+12 ralph loop. Andrea mandate "andiamo per piani settimanali".

## Date chiave

- **Oggi**: 2026-05-10
- **Lego SPIKE Prime ritiro mercato**: 30/06/2026 (finestra opportunità 50 giorni)
- **Fine anno scolastico IT**: 8-15 giugno 2026
- **Finestra acquisto scuole pilota**: 1 luglio - 30 settembre 2026

## Stato corrente iter 11+12 close

### Iter 11 deliverables shipped (commit `8b864135` + `c072ddcb` pushed origin)
- Backend audit Edge Function: score 4.0/10 brutale (vs claim 8.5 iter 31-37)
- 6 quick wins backend deployed prod (strip RAG/wiki tags + word cap 60→120 unified + checkContentSafety post-LLM wired + isConceptIntro dynamic + prompt_class surface always + L3_glossario enable + totalExperiments 94)
- Sprint U Cycle 2 fixes: Fix #1 L2 routing per-experiment 6/94 templates + Fix #2 70/94 lesson-paths plurale codemod + Fix #4 MINOR 5/5 vol1.js docente-framing
- PATCH B: pre-LLM voltage_danger detector + offtopic detector + CONTESTO generic strip
- R5 50-prompt bench post-deploy: **90.2% PASS** (12 PZ rules scorer ≥85% gate MET)
- Live smoke prod V1 69.8% → V2 67.4% (regressione) → V3 PATCH B 3-query verify PASS

### Iter 12 work (uncommitted — Andrea decide GO/STOP)
- Memoria Q10 fix #1: history injection `loadRecentHistory(sessionId, 5)` in Onniscenza
- Memoria Q10 fix #2: extractVolCapFromMessage regex parse "Vol.X cap.Y"
- Live verify post-deploy iter 12: Q10b "Continuiamo" → recall PASS (`[AZIONE:loadexp:led_circuits]`)
- 81 insertions, 6 deletions su 2 file (memory.ts + unlim-chat/index.ts)

### BG agents iter 11+12 DONE
- Backend audit (4.0/10 brutale)
- RAG-volumi audit (matcher BROKEN 0/1000 match dry-run)
- Live smoke V1+V2+V3 (69.8% / 67.4% / 69.8%)
- Memoria Q10 diagnosi (V1 PASS era LUCK + LLM inference, memoria mai esistita)
- Competitive landscape (ELAB moat sottile-medio 5/10)
- Product brainstorm (17 idee Tier 1/2/3 + 5 fruizione + 6 metodi EU)
- WebFetch elab.school positioning Giovanni

### BG agent iter 12 in flight
- RAG matcher source→volume rewrite (ad5c4bf92da6135ba) **DONE** — **830/1000 match (vs 0/1000 pre-fix)**
  - TOPIC_TO_VOLUME lookup 99 entries da `docs/unlim-wiki/concepts/*.md` frontmatter
  - 3-path resolver (Path A legacy `vol1/2/3` + Path C NEW topic-IDs + fallback null)
  - 16 NEW tests PASS, vitest 13974 preserved ZERO regression
  - Sample 10 match esempi: `blink-led`→Vol.3 pag.47, `corrente-continua`→Vol.1 pag.9, `voltmetro`→Vol.1 pag.22, ecc.
  - 78 distinct UPDATE SQL groups awaiting Andrea ratify (ADR-020 + ADR-021)
  - Path B re-ingest pdfplumber paragraph-level pages defer iter 13+ (4h)
  - 170 skipped: ~160 fuzzy scores 0.06-0.45 + ~10 wiki `volume_ref: null` (intentional)

## 3 priorità intersezione brainstorm + competitive (ROI brutale)

| # | Priorità | Effort | Moat | Costo | ROI |
|---|---|---|---|---|---|
| 1 | AR/CV dataset proprietary 5000 foto kit Omaric | 4-6 settimane Andrea+Tea | 9/10 | €500-2000 | TOP |
| 2 | Teacher Dashboard reale + reportistica PDF genitori | 300h dev (~6-8 settimane) | 6/10 | €0 dev interno | PNRR mandatory |
| 3 | Anti-Lego SPIKE positioning materiale Davide | 2 settimane Andrea+Davide | N/A | €0 | URGENTE finestra 50gg |

## Settimana 1 (10-17 mag) — Foundation

**Andrea**:
- Decisione GO/STOP iter 12 memoria fix uncommitted
- Verifica RAG matcher BG agent output → COMMIT + dry-run staging
- Decisione: pivot Web Component+MCP ABBANDONATO (Andrea iter 11 rifiutato, bundle Giovanni reality)

**Andrea + Tea**:
- Setup filming kit Omaric (smartphone iPhone Pro + light box + tripod €200)
- Filming 5 esperimenti pilota Vol.1 cap.6 (LED): 4 angoli × 3 stati = 60 foto pilota
- Edge Impulse free tier setup + first annotation pass

**Davide**:
- Outreach 3 docenti pilota Strambino/Torino zona Andrea
- Verifica CampuStore listing process + DURC documentation

**Deliverable**: 60 foto annotated + Edge Impulse model POC + RAG matcher fixed dry-run

## Settimana 2 (18-24 mag) — Dataset expand + Dashboard wireframe

**Andrea**:
- Teacher Dashboard wireframe + Supabase schema finalize (`teacher_dashboard_classes` + `teacher_reports`)
- Citation Vol/pag fix (RAG matcher post-staging COMMIT prod) → live verify lift 1/10 → 5+/10
- Live smoke V4 10-query post-fix (target ≥80%)

**Andrea + Tea**:
- Filming 10 esperimenti totali Vol.1 (40 foto/exp × 10 = 400 foto)
- Annotation Edge Impulse + sample model train

**Davide**:
- CampuStore listing application submission
- Pitch Lego SPIKE alternative draft (1-page A4 comparison)

**Deliverable**: 400 foto annotated + Dashboard wireframe + V4 ≥80% PASS + CampuStore in queue

## Settimana 3 (25-31 mag) — Vol.2 + Dashboard MVP backend

**Andrea**:
- Teacher Dashboard MVP backend (Supabase RLS + Edge Function `teacher-report-pdf`)
- AR/CV phone POC integration (Gemini Vision API + Edge Impulse model)

**Andrea + Tea**:
- Filming Vol.2 (10 esperimenti × 40 foto = 400 foto)
- Total dataset: 800 foto annotated

**Davide + Giovanni**:
- Pitch deck final "ELAB vs Lego SPIKE alternative" (10 slide PDF)
- Outreach 10 docenti pilota addizionali (network PNRR + ex-Arduino contacts)

**Deliverable**: 800 foto + Dashboard backend + AR phone POC 3 esperimenti + 10 docenti contact

## Settimana 4 (1-7 giu) — Vol.3 + Dashboard frontend

**Andrea**:
- Teacher Dashboard MVP frontend React (4 view: classi, studenti, esperimenti, report PDF export)
- AR/CV phone expand 10 esperimenti

**Andrea + Tea**:
- Filming Vol.3 (10 esperimenti × 40 foto = 400 foto)
- Total dataset: 1200 foto annotated (target 5000)

**Davide**:
- 5 docenti pilota commit testing 4 settimane
- Outreach scuole post-Lego SPIKE budget liberato

**Deliverable**: 1200 foto + Dashboard frontend MVP + AR 10 esperimenti + 5 docenti pilota commit

## Settimana 5 (8-14 giu) — Pilota 3 scuole + 50 esperimenti

**Andrea**:
- Pilota 3 scuole testing AR + Dashboard (Andrea presente onsite 1-2 giorni)
- Iterate feedback docenti

**Andrea + Tea**:
- Filming continuativo 50 esperimenti totali (50/94)
- Annotation parallel

**Davide + Giovanni**:
- Materiale Lego SPIKE alternative consegnato 10 docenti
- Press release draft "ELAB v2 AR-powered Italian K-12 STEM"

**Deliverable**: 3 scuole pilota live + 50 esperimenti annotated + materiale anti-Lego consegnato

## Settimana 6 (15-21 giu) — Pre-deadline closure

**Andrea**:
- Bug fix iterazione pilota
- Production hardening Dashboard + AR

**Andrea + Tea**:
- 80 esperimenti annotated
- Family bridge feature draft (DEFER se tempo insufficiente)

**Davide + Giovanni**:
- Outreach 5 contratti scuole pre-deadline 30/06
- Demo PNRR-eligible pitch

**Deliverable**: 5 scuole pilota + 80 esperimenti + 3-5 contratti in pipeline

## Settimana 7 (22-28 giu) — Lego SPIKE momentum capture

**Andrea**:
- Production deploy Dashboard + AR
- 94 esperimenti annotated COMPLETE (target raggiunto)

**Davide + Giovanni**:
- Closure 3-5 contratti scuole → Davide MePA
- CampuStore listing live (se approvato)

**Deliverable**: ELAB v2 production live + 94 esperimenti + 3-5 contratti firmati

## Settimana 8 (29 giu - 5 lug) — Public launch + Lego retire capture

**Tutto team**:
- Lego SPIKE retired 30/06 → ELAB pitch capture momentum
- Public launch ELAB v2 con AR/CV + Teacher Dashboard
- Press release Italian EdTech (Tuttoscuola, La Tecnica della Scuola, Orizzonte Scuola)

**Deliverable**: Public launch + 5+ contratti firmati + media coverage IT EdTech

## DEFER iter 16+ (post settimana 8)

- Multiplayer 4-squadre cooperative (richiede 50+ scuole base)
- Family bridge weekend home mode
- Stop-motion creator
- Knowledge graph kit-specifico esteso
- Memoria persistente long-term cross-classe
- Voice clone Davide narratore alternative

## CARTONI BOCCIATI (Andrea explicit 2026-05-10)

**Andrea decision**: 94 cartoni custom Tea protagonist BOCCIATI per raggiungere visione finale.

**Razionale onesto**:
- €25-40k effort 60-90 giorni distrazione da priorità reali (AR/CV + Dashboard + filiera)
- AI generic 2027 (Sora 2 / Veo 3.1) farà cartoni belli — moat 7/10 NON inattaccabile vs AR/CV moat 9/10
- Cartoni = "cosa facciamo PER ragazzi passivi" — Andrea visione: "kit fisico = ragazzi protagonisti hands-on"
- Mascotte UNLIM invisibile (Principio Zero) — NON protagonista visivo cartoon

**Sostituzione engagement medie 8-14 senza cartoni**:

| Bisogno | Soluzione cartoon (BOCCIATA) | Soluzione adottata |
|---|---|---|
| Briefing 5 min | Cartone Tea protagonista | UNLIM voce narrante (Voxtral Andrea voice clone già LIVE) + simulator demo proiettato LIM (kit-anchored) |
| Storytelling | Cartone narrativo | Docente legge volume cartaceo voce (Principio Zero — cit. verbatim Vol/pag) |
| Engagement visivo | Animazione personaggi | Kit fisico tattile (colors LED/resistor reali) + badge fisici stickers Pokemon-style + AR cellulare CV diagnostica live |
| Wow factor | "Tea attraversa strada al buio" | Cellulare inquadra breadboard → AR overlay schematic + UNLIM voce diagnose live |
| Brand asset emotivo | Mascotte cartoon | Volumi cartacei narrativi italiani (esistenti, scritti da Davide Fagherazzi) |

**Vincoli rispettati**:
- Kit fisico = star del show (NON cartoon)
- Software ESSENZIALE ma DIETRO LE QUINTE
- Engagement deriva DA fare hands-on (NO guardare cartoon passivo)
- Principio Zero + Morfismo preservati
- 40 min lezione: 5 min UNLIM voice briefing + 25 min build kit + 10 min verify+badge sticker

## SCARTARE definitivo

- Pivot Web Component+MCP standalone (Andrea iter 11 ha rifiutato, bundle Giovanni)
- Multi-lang UNLIM (Italia è moat)
- Blockchain badge gimmick
- Custom voice clone genitori
- RAG generic improvements (valore in volumi NON retrieval)
- Marketplace user-generated experiments
- Custom Gem + Teams Tab scaffold (Andrea iter 10 rifiutato)
- Anthropic Apps SDK + Claude Desktop MCP integration (premature)

## Decisioni Andrea PRE settimana 1 (BLOCKING)

1. **Iter 12 memoria fix uncommitted** (verified live PASS): GO commit/push o DEFER?
2. **Tea disponibilità** 4-6 settimane filming kit Omaric (~30-50h tot) + co-dev Dashboard?
3. **Budget €500-2000** per dataset CV setup (smartphone + light box + cloud annotation)?
4. **Davide bandwidth** 5-10 outreach docenti/settimana + pitch Lego SPIKE alternative?
5. **CampuStore listing** Andrea firma DURC + paperwork + Davide owner?

Senza decisioni 1-5 = piano 8 settimane resta scaffold inutilizzato.

## Honest gap residual non-iter-12

- vol_pag_citation 1/10 strutturale (RAG matcher BROKEN, Path A max 15% coverage post-fix, Path B re-ingest pdfplumber 4h Vol/pag verbatim ~95%)
- 88/94 esperimenti senza template L2 dedicato (Morfismo Sense 2 partial)
- Sprint U Cycle 1 iter 4 work uncommitted (App.jsx + index.html + public/_headers + design-system.css)
- 200 violations linguaggio singolare→plurale codemod Andrea iter 21+ carryover
- 92→94 esperimenti audit Playwright UNO PER UNO Andrea iter 21+ carryover
- Latency p50 +947ms post PATCH B (1741→2688ms) — overhead path LLM principale

NO compiacenza. NO inflate. Tua chiamata.
