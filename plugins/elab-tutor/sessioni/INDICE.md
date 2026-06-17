# INDICE SESSIONI ELAB

> &copy; Andrea Marro — 09/03/2026 — ELAB Tutor — Tutti i diritti riservati / All rights reserved

[Home](../../../README.md) > [PRODOTTO](../../README.md) > [elab-builder](../README.md) > **sessioni**

## Come leggere questo indice
- Le sessioni sono in ordine cronologico (la più recente per prima)
- Ogni sessione ha UN prompt (PRD) e UNO o più report
- Il report FINALE è quello definitivo — i report sprint sono intermedi
- Il **REPORT-ONESTO-STATO-PROGETTO.md** è la fotografia reale al 21/02/2026

---

## STATO ATTUALE (25/02/2026)
- **Deploy Tutor**: https://www.elabtutor.school (Vercel)
- **Deploy Sito**: https://funny-pika-3d1029.netlify.app (Netlify)
- **Score attuale**: ~8.2/10 (Session 45 — onesto)
- **Obfuscation**: RC4 strings, hex IDs, control flow flattening, domainLock, selfDefending (debugProtection OFF — conflitto con codeProtection)
- **69/69 esperimenti validati**, 138 quiz, 53 sfide giochi

---

## Sessione 45 (25/02/2026) — Vetrina Visual Audit + Hero Fix + PDR Update
- **PDR aggiornato**: `PDR-ATTUALE-25-02-2026.md`
- **Task**: Hero flash-of-invisible-content fix (CSS override per IntersectionObserver), redirect /vetrina in netlify.toml, full visual audit 14 sezioni in Chrome, analisi 66 immagini, identificazione stock/duplicati, deploy Netlify
- **Score**: 8.1 → 8.2/10 (vetrina verificata +0.5)

## Sessione 44B (25/02/2026) — Nanobot Deploy + Chat Widget + Vetrina Creation
- **Report**: `report/report-sessione44B-nanobot-vetrina.md`
- **Task**: Chat widget su 4 pagine, nanobot Render deploy, vetrina.html creata, site-prompt.yml v2
- **Score**: 8.3 → 8.1/10 (nanobot instabile, vetrina non verificata)

## Sessione 44 (24/02/2026) — Full Ecosystem Audit
- **Report**: `report/report-sessione44-audit.md`
- **Task**: CoV audit 18 aree, scoperta P0 auth HTTP 500, volume gating client-only, LIM 14→16px needed
- **Score**: 8.0 → 8.3/10

## Sessione 43 (24/02/2026) — Crash Fix + n8n Removal + Vetrina Redesign
- **Report finale**: `report/report-sessione43-finale.md`
- **Task**: P0 crash fix (codeProtection vs obfuscator conflict), rimozione n8n (~75 refs, 18 file), VetrinaSimulatore redesign (hero, gallery, features), debug pass 10/10, deploy
- **Score**: 8.7 -> 8.0/10 (honest downgrade: AI non deployata, teacher-student DB mancante)

## Sessione 42 (24/02/2026) — Cryptazione Massima + Firma + Teacher + Mobile
- **PRD**: `PROMPT-SESSIONE-42.md`
- **Task**: Hardening obfuscation (soglie max), firma copyright, teacher dashboard, mobile audit, nanobot produzione

## Sessione 41 (24/02/2026) — Obfuscation + UI Minimal + Nanobot + HiDPI
- **PRD**: `PROMPT-SESSIONE-41.md`
- **Risultato**: Custom obfuscation plugin (RC4+CFG), anti-DevTools runtime, UI 5 tab, nanobot Docker, HiDPI fix, VideosTab cleanup (-100KB), deploy Vercel
- **Score**: 8.6 → 8.9/10

## Sessioni 33-40B (21-24/02/2026) — Quiz UI, Tinkercad Redesign, Wire V7, Galileo Pervasivo
- Quiz UI (QuizPanel.jsx), 69/69 Chrome-validated, 21 SVG redesigned Tinkercad-style
- Wire V7 Catmull-Rom, Galileo Pervasivo (circuit state bridge), buildSteps fix (9 experiments)

## Sessione 31 (20/02/2026) — Audit + Volume Gating
- **PRD**: `prompt/prompt-sessione31.md`
- **Report finale**: `report/report-sessione31-finale.md`
- **Sprint 1**: `report/report-sessione31-sprint1-audit.md` — 24 screenshots, 21 SVG audit
- **Sprint 2**: `report/report-sessione31-sprint2-fixes.md` — accent fixes
- **Sprint 3**: `report/report-sessione31-sprint3-gating.md` — volume gating
- **Sprint 4**: `report/report-sessione31-sprint4-ux.md` — vetrina gallery
- **Risultato**: Volume gating, 7 accent fixes, SVG audit completo

## Sessione 30 (19/02/2026) — Classi + Games + Whiteboard + AI
- **PRD**: `prompt/prompt-sessione30.md`
- **Report finale**: `report/report-sessione30-finale.md`
- **Sprint 1**: `report/report-sessione30-sprint1.md`
- **Sprint 2**: `report/report-sessione30-sprint2.md`
- **Sprint 3**: `report/report-sessione30-sprint3.md` — teacher-gated games
- **Sprint 4**: `report/report-sessione30-sprint4.md` — whiteboard V3
- **Risultato**: Classi, game toggles, Whiteboard V3, VetrinaSimulatore rebuild, AI live

## Sessione 29 (18/02/2026) — Onboarding rimosso + Font
- **Report**: `report/report-sessione29.md`
- **Risultato**: -1400 LOC, font consolidamento, onboarding wizard rimosso

## Sessioni 3-28
- Riassunti in `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/session-summaries.md`
- Report individuali non più disponibili in questa cartella

---

## ISSUES ATTIVI PER PRIORITÀ (24/02/2026 — Aggiornato S43)

### P0 — CRITICO
- **Nessuno** (crash risolto in S43)

### P1 — IMPORTANTE
1. `auth-list-classes` / `auth-create-class`: Notion CLASSES DB 503 graceful
2. STUDENT_TRACKING Notion DB non condiviso con integration
3. Email E2E non verificata
4. Nanobot server non deployato (render.yaml pronto, serve deploy manuale)
5. Screenshot Vetrina vecchi (pre-Tinkercad redesign)

### P2 — MEDIO
6. DashboardGestionale 410KB (recharts)
7. ElabTutorV4 chunk ~3500KB dopo obfuscation (~1600KB gzip)
8. Mobile responsive non auditato sistematicamente
9. 11 env var names contengono ancora "N8N" (VITE_N8N_*)

### P3 — MINORE
10. No test automatizzati E2E
11. Editor Arduino panel z-index bleed-through
12. Admin font-sizes 12px (deliberato per tabelle dense)

### RISOLTI (S43)
- ~~App crasha ovunque (ErrorBoundary)~~ → codeProtection.js conflittava con obfuscator. Rimossi check aggressivi, disabilitato debugProtection/disableConsoleOutput
- ~~Riferimenti "n8n" nel codebase~~ → ~75 refs rimossi in 18 file, solo env var names restano
- ~~VetrinaSimulatore design piatto~~ → Redesign completo con hero, gallery, features, animations

### RISOLTI (S33-S42)
- ~~Vol2 quiz 0/18~~ → 18/18 (P0 era dato stale)
- ~~Student cards UUID~~ → UUID->nome cascade (S42)
- ~~MobileBottomTabs giochi~~ → allowedGames filtering (S42)
- ~~Touch targets <44px~~ → Tutti >=44px (S42)
- ~~Chat overlay 60vh~~ → 40vh (S42)
- ~~Whiteboard pixelata~~ → HiDPI fix (S41)
- ~~UI troppe tab~~ → 5 tab con gruppi (S41)
- ~~Obfuscation non al massimo~~ → RC4 100%, CFG 75%, deadCode, selfDefending, domainLock (S42, debugProtection OFF per conflitto S43)
- ~~diagnoseCircuit/getExperimentHints dead code~~ → Wired in ElabTutorV4 (S42)
- ~~Tutti 21 componenti volumeAvailableFrom~~ → Verificati vs PDF (S34)
- ~~Volume bypass~~ → Guard in NewElabSimulator (S33)
