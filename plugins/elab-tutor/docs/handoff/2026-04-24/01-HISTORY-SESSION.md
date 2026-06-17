# History Progetto ELAB + Sessione 22-24 Aprile 2026

## Parte 1 — Progetto cronologico (sintesi)

### Fase 1 — Fondazione (feb-mar 2026)
- ELAB Tutor = React 19 + Vite 7 + Supabase + Vercel
- Simulatore circuiti proprietario (MNA/KCL + avr8js ATmega328p)
- 92 esperimenti in 3 Volumi fisici (38 V1 + 27 V2 + 27 V3)
- Target: bambini 8-14, scuole Italia, kit fisico + software

### Fase 2 — UNLIM AI (mar 2026)
- Rinominato "Galileo" → "UNLIM"
- RAG 549 chunks (src/data/rag-chunks.json)
- Voice Kokoro + Edge TTS, wake word "Ehi UNLIM", 36 comandi
- Vision Gemini (screenshot circuito → diagnosi)
- Fumetto report session (UnlimReport.jsx)

### Fase 3 — Principio Zero v3 (18 apr 2026)
- Docente = tramite, UNLIM parla ai RAGAZZI plurale
- Cita Vol.X pag.Y, max 60 parole, 3 frasi + 1 analogia
- Mai meta-istruzioni "docente leggi"
- BASE_PROMPT v3 in Edge Function supabase verified live

### Fase 4 — Sprint 1-5 (19-23 apr 2026)
- PR #18 Sprint 3 stabilize
- PR #19 stress test 4 client fixes
- PR #20 PWA P0 stale-precache safety
- PR #21 audit deep 8-week plan
- PR #22 security Supabase primary + X-Elab-Api-Key
- PR #23 CI deploy.yml vercel build env baked
- PR #24 CSP SHA-256 hash inline safety
- PR #25 **OpenClaw Sett 5 Onnipotenza Morfica v4 spec+infra** (grande feat)
  - 42 ToolSpec registry
  - morphic-generator L1+L2+L3-flag
  - pz-v3-validator 5 locale
  - tool-memory pgvector+GC + MIGRATION_SQL
  - state-snapshot-aggregator ibrido
  - together-teacher-mode GDPR gate
  - rag-retriever hybrid MMR + metadata
  - RAG v2 1849 chunks (+237%)
  - Wiki L2 Karpathy seed (3 concept)
  - Plans: Sprint 6 L1 live + GPU weekend + agent team v2
  - Audit onesto 7.2/10

### Fase 5 — Sprint 6 Day 36-38 (23-24 apr)
- PR #26 9 handler unlim implementati (Day 37)
- PR #27 registry expand 42→57 ToolSpec (Day 38)
- Baseline 11958 → 12290 (+332 test)
- Day 39-42 RIMANDATO (scope revision emersa dall'audit live)

### Fase 6 — Audit live + refactor UX (24 apr) — questa sessione
- PR #28 mappa funzionalità deployate 78 feat (R1.S1)
- PR #29 situation report verdetto 6.2/10 (R2.S1)
- PR #30 fix UX primo-accesso (ConsentBanner gating + overlay serialize + emoji→ElabIcons)
- PR #31 wake word + Bentornati auto-2s kill
- PR #32 ConsentBanner extended gating 10 route

## Parte 2 — Sessione 22-24 Aprile dettagliata

### Obiettivi iniziali (Andrea)
1. Strategia: architettura prima, scuole paganti dopo
2. Onnipotenza UNLIM (tool-use 80+)
3. Onniscenza (RAG ibrido + Wiki + memoria + vision)
4. Morficità controllata (L1 safe / L2 template / L3 DEV)
5. GDPR EU-only + Principio Zero v3 always
6. Economia solo-dev + scalabilità Stage 2b (8-10 scuole)
7. Test tanti + ordinati

### Lavoro svolto cronologicamente

**Dag 1 (22/4):** PR #25 OpenClaw architettura completa, 11 file (3.750 righe), 102 test OpenClaw, RAG 1849, Wiki L2 seed, revenue model break-even Stage 2b = 8-10 scuole (corretto da 2).

**Dag 2 (23/4):** 
- Merge PR #25
- PR #26 Day 37 9 handler unlim live (Session A Desktop Cloud)
- PR #27 Day 38 registry 42→57 ToolSpec
- Situation report R2.S1 verdetto 6.2/10 — 5 decisioni critiche
- Scoperta: fix UX primo-accesso PRECEDE Day 39 dispatcher

**Dag 3 (24/4):**
- Fix UX batch 1 (PR #30): ConsentBanner gating + overlay serialize + emoji → ElabIcons
- Fix UX batch 2 (PR #31): wake word + Bentornati auto-2s
- Test Playwright live: identificato GAP 1 (ConsentBanner ancora su #dashboard-v2)
- Fix batch 3 (PR #32): extended gating 10 route
- **Decisione strategica Andrea**: Sprint Q precede Day 39
- **Osservazione critica Andrea (pomeriggio)**: Volumi = esperimenti variazioni tema progressivo / Tutor = esperimenti staccati. Refactor Capitolo necessario
- **Ampliamento**: percorso generato dinamicamente basato su lezioni precedenti + professore + contesto + volumi (= **Wiki LLM Karpathy pattern**)

### Insight strategico finale sessione

Andrea ha identificato 2 gap concettuali fondanti mai emersi negli audit precedenti:

1. **Parallelismo struttura volumi ↔ tutor**:
   - Volumi: 14 Capitoli (Vol1) / 27 (V2) / 27 (V3) — ogni Capitolo tratta 1 tema con 3-9 esperimenti variazioni incrementali
   - Tutor: 94 lesson-paths come file indipendenti
   - **Tutor perde progressione narrativa capitolo**

2. **Percorso dinamico generativo**:
   - Non catalog statico
   - LLM genera PERCORSO DEL MOMENTO basato su:
     - Volumi (fonte)
     - Wiki L2 (memoria compounding lezioni precedenti)
     - Classe specifica (studenti, progresso)
     - Docente (stile, preferenze)
     - Contesto live (dove siamo, cosa abbiamo già fatto)

Questo è **Karpathy Wiki LLM applicato a didattica**.

### Decisioni prese nella sessione

| Decisione | Stato |
|-----------|-------|
| Sprint Q precede Day 39 dispatcher | ✅ confermato |
| Budget GPU trial: weekend benchmark €25 | ✅ piano pronto |
| Mac Mini: Livello 1+4+5 (loop H24 + CI runner + Supabase local) | ✅ strategia |
| Demo esclusa dalla pipeline | ✅ "solo prodotto vero" |
| Refactor Capitolo → precede tutto | ✅ priorità top |
| Wiki LLM Karpathy come pattern canonico | ✅ nuova evidenza |

### Cosa NON è stato fatto in sessione (onesto)

- Sprint 6 Day 39 dispatcher OpenClaw (scope revision)
- Voxtral TTS live (Sprint 7)
- Qwen locale (VPS trial futuro)
- Mac Mini H24 loop (setup pending)
- Test Playwright completo 30 test (R1.S2 non eseguito)
- R1.S3 final report (non eseguito)
- R2.S2/S3 research + 5 piani (skip, situation report sufficiente)
- GPU benchmark weekend €25 (weekend)

### Verdetto sessione (onesto, no compiacenza)

**Lavoro positivo:**
- 10 PR merged su main, 0 rollback
- Baseline test +332 (11958 → 12291)
- Deploy stable 200 OK
- UX primi 10 sec docente migliorato significativamente
- Identificato GAP struttura Capitolo (fondante per prodotto)

**Lavoro negativo/omesso:**
- Day 39 dispatcher rimandato 1 settimana
- Scope Sprint Q triplicato (da 3 task a 7-10)
- Andrea ha dovuto tirare fuori insight strutturale DOPO 10 PR (io non l'avevo visto)
- R1.S2/S3/R2.S2/S3 skippati (shortcut pragmatico)

**Score globale:** 7.5/10 — buon sprint con pivot strategico costruttivo ma non senza frizioni.

## Parte 3 — Tracciabilità

### Commit commits significativi
```bash
git log main --oneline --since="2026-04-22"
```

### File prodotti in sessione (~30 nuovi)
```
docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md
docs/architectures/openclaw-registry-v2-3-layer.md
docs/audits/2026-04-22-openclaw-plan-honest-check.md
docs/audits/2026-04-23-security-secret-rotation-required.md
docs/audit/day-37-audit-2026-04-23.md
docs/audits/2026-04-24-deployed-feature-map.md
docs/audits/2026-04-24-situation-report.md
docs/business/revenue-model-elab-2026.md
docs/business/gpu-vps-decision-framework.md
docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md
docs/superpowers/plans/2026-04-26-gpu-vps-weekend-benchmark.md
docs/superpowers/plans/2026-04-30-agent-team-cli-orchestration.md
docs/sunti/2026-04-23-sunto-sessione-openclaw.md
docs/handoff/2026-04-24-session-handoff-final.md
docs/handoff/2026-04-24-prompts-routines-v2.md
docs/handoff/2026-04-23-day-37-day-38-complete.md
docs/handoff/2026-04-23-day-37-handoff.md
docs/handoff/2026-04-24/00-INDEX.md (this)
docs/test-organization.md
docs/unlim-wiki/SCHEMA.md + index + log + 3 concept
scripts/openclaw/* (7 file TS + 6 test file + __mocks__)
scripts/coherence-check.mjs
scripts/rag-rechunk.mjs
scripts/git-hooks/pre-commit-secret-scan.sh
src/data/rag-chunks-v2.json
src/hooks/useOverlayQueue.js
.github/workflows/sprint-6-autonomous-loop.yml
vitest.openclaw.config.ts
```

### Errori onesti documentati in sessione
- Self-leak token Supabase in security doc (auto-corretto via sanitize)
- Registry handler path unlim.* errato (42/52 bug fix)
- 52 ToolSpec claim inflated → 42 reale
- Multilingue EN/ES/FR/DE "5 lingue" inflated → solo IT testato + stub
- Prompt mega-analisi session cloud ha fallito timeout (decomposto in 6 sessioni v2)
- Path `docs/audit/` vs `docs/audits/` mix (coherence-check corretto)
- Missing Sprint 5 Day 26-35 actual completion percentage (stima dichiarata)
