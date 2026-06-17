# ELAB Tutor — Quality Audit Report (G1-G9)

**Data**: 28/03/2026
**Sessioni analizzate**: G1-G9 (9 sessioni)
**Metodo**: quality-audit + code-review + firecrawl WCAG + frontend-design + systematic-debugging
**Assessor**: Claude Opus 4.6 (4 agenti paralleli + analisi diretta)

---

## SCORE CARD

| Metrica | Valore | Target | Status |
|---------|--------|--------|--------|
| **Build** | Exit 0, 30.76s | Exit 0 | PASS |
| **Deploy** | HTTP 200 | HTTP 200 | PASS |
| **LOC totali** | 97,962 (193 JS/JSX, 11 CSS, 62 JSON) | — | INFO |
| **Component files** | 154 | — | INFO |
| **Lesson paths** | 62/62 JSON valid | 62 | PASS |
| **Bundle main chunk** | 1,589 KB (730 KB gzip) | <1,200 KB | FAIL |
| **Bundle total dist** | 78 MB | — | WARN |
| **Largest file** | SimulatorCanvas.jsx: 3,139 LOC | <2,000 | FAIL |
| **God components (>2000 LOC)** | 3 (SimulatorCanvas, ElabTutorV4, CircuitSolver) | 0 | FAIL |
| **Font <14px (screen UI)** | 73 occurrences in 6 files | 0 | FAIL |
| **Font <14px (PDF generators)** | ~30 (NarrativeReport, SessionReport) | N/A | OK |
| **Touch targets <44px** | 6 occurrences in 3 files | 0 | FAIL |
| **console.log in prod code** | 19 in 4 files | 0 | FAIL |
| **console.error/warn** | 36 (via logger.js — intentional) | — | OK |
| **Backup files (.bak)** | 3 files | 0 | WARN |
| **TODO/FIXME/HACK** | 19 in 8 files | 0 | WARN |
| **Dead code files** | Under investigation (agent running) | 0 | PENDING |
| **aria-label coverage** | 91 across 47 files | >80 | PASS |
| **alt text on images** | 8 in 5 files | — | WARN (low) |
| **WCAG AA (normal text)** | 3/8 colors pass | 8/8 | FAIL |
| **WCAG AA (large text)** | 5/8 colors pass | 8/8 | FAIL |
| **Regressioni G9** | ZERO | 0 | PASS |

---

## WCAG CONTRAST AUDIT (Precise Ratios)

| Colore | Hex | Ratio | Normal (4.5:1) | Large (3:1) |
|--------|-----|-------|----------------|-------------|
| Navy | #1E4D8C | **8.42:1** | PASS | PASS |
| Text | #1a1a2e | **17.06:1** | PASS | PASS |
| TextMuted | #64748B | **4.76:1** | PASS | PASS |
| Lime | #558B2F | **4.10:1** | FAIL (close!) | PASS |
| Vol3 Red | #E54B3D | **3.88:1** | FAIL | PASS |
| Vol2 Orange | #E8941C | **2.42:1** | FAIL | FAIL |
| Orange | #F5A623 | **2.03:1** | FAIL | FAIL |
| Cyan | #00B4D8 | **2.46:1** | FAIL | FAIL |

**Verdict**: I 3 colori principali per testo (Navy, Text, TextMuted) passano. Lime quasi passa (4.10 vs 4.5). Orange e Cyan sono decorativi/icone ma vanno verificati dove usati per testo.

---

## FONT SIZE AUDIT (dettaglio)

### File con fontSize <14 su SCREEN UI:
| File | Count | Note |
|------|-------|------|
| TeacherDashboard.jsx (PNRR tab) | 9 | Matrice densa 62 colonne — fontSize 10-13 necessario |
| LessonPathPanel.jsx | 7 | Badge e metadata — fontSize 11-12 |
| ChatOverlay.jsx | 1 | Timestamp |
| NarrativeReportEngine.jsx | 26 | PDF generator — NON screen |
| SessionReportPDF.jsx | 21 | PDF generator — NON screen |
| ReportService.jsx | 9 | PDF generator — NON screen |

**Onesto**: 17 fontSize <14 su screen UI reale. 56 in PDF generators (corretto per PDF).
La matrice PNRR (62 colonne) RICHIEDE fontSize piccoli — non è un bug, è un trade-off di densità dati.

---

## BUNDLE ANALYSIS

### Top 10 chunks (gzip):
| Chunk | Size (gzip) | Note |
|-------|-------------|------|
| index | 730 KB | Core app + React |
| react-pdf.browser | 497 KB | PDF rendering library |
| ElabTutorV4 | 258 KB | Tutor principale |
| ScratchEditor | 191 KB | Blockly/Scratch |
| codemirror | 156 KB | Code editor |
| mammoth | 130 KB | DOCX parsing |
| DashboardGestionale | 119 KB | Admin gestionale |
| TeacherDashboard | 82 KB | Dashboard docente + PNRR |
| CircuitDetective | 60 KB | Game |
| ReverseEngineering | 58 KB | Game |

**3 chunks >1000 KB pre-gzip** (index, react-pdf, ElabTutorV4). Code splitting is working — lazy loading per route.

---

## CONSOLE.LOG RESIDUI

| File | Count | Verdict |
|------|-------|---------|
| ElabTutorV4.jsx | 13 | HEAVY — debugging residuo |
| voiceService.js | 3 | Diagnostica TTS |
| logger.js | 2 | Il logger stesso |
| codeProtection.js | 1 | Anti-tampering |

**Fix consigliato**: Rimuovere i 13 console.log in ElabTutorV4.jsx — sono debugging dimenticato.

---

## TOP 5 GOD COMPONENTS

| File | LOC | Complessità |
|------|-----|-------------|
| SimulatorCanvas.jsx | 3,139 | HIGH — drag/drop/zoom/pan/SVG |
| ElabTutorV4.jsx | 2,560 | HIGH — orchestratore tutor |
| CircuitSolver.js | 2,486 | OK — engine matematico puro |
| TeacherDashboard.jsx | 2,090 | MEDIUM — 8 tab inline |
| WireRenderer.jsx | 1,414 | OK — rendering specializzato |

**SimulatorCanvas e ElabTutorV4** sono i candidati principali per refactoring. CircuitSolver è un engine — LOC alto è normale.

---

## TODO/FIXME DISTRIBUTION

| File | Count | Sample |
|------|-------|--------|
| emailService.js | 6 | Template email da completare |
| NarrativeStoryDatabase.js | 4 | Storie da aggiungere |
| authService.js | 2 | Edge case auth |
| FatturaElettronicaService.js | 2 | Fatturazione elettronica |
| PlacementEngine.js | 2 | Auto-placement |
| Remaining (3 files) | 3 | Misc |

---

## SINTESI ONESTA — 9 SESSIONI

### Cosa è andato BENE (G1-G9):
1. **62 lesson paths** — schema validated, DAG verified, 8-layer CoV
2. **Zero regressioni** — ogni sessione ha aggiunto senza rompere
3. **Build always passes** — disciplina build-before-deploy rispettata
4. **Code splitting funziona** — chunks lazy-loaded per route
5. **Teacher Dashboard MVP** — 4 requisiti PNRR coperti
6. **aria-label coverage** buona (91 istanze su 47 file)

### Cosa va MALE:
1. **WCAG contrasto** — 5/8 colori falliscono per testo normale. Orange e Cyan non vanno per testo.
2. **Bundle bloat** — react-pdf (497KB gzip) e mammoth (130KB gzip) sono enormi per feature minori
3. **God components** — SimulatorCanvas (3.1K LOC) e ElabTutorV4 (2.5K LOC) sono ingestibili
4. **console.log** — 19 residui di debug, 13 solo in ElabTutorV4
5. **Font size** — 17 istanze <14px su screen UI (alcune giustificate dalla densità dati)
6. **Touch targets** — 6 elementi interattivi sotto 44px (bottoni simulator)
7. **Backup files** — 3 .bak files nel repo (dead weight)

### Priorità fix (P0-P2):
| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Rimuovere 19 console.log | 5 min |
| P0 | WCAG: Lime #558B2F → #4A7A28 (pass 4.5:1) | 5 min |
| P1 | Eliminare 3 .bak files | 1 min |
| P1 | WCAG: Orange/Cyan — usare solo per decorazioni, non testo | 30 min |
| P1 | Touch targets <44px in simulator | 15 min |
| P2 | Refactor SimulatorCanvas (3.1K LOC) | 2-4h |
| P2 | Lazy-load react-pdf (solo se Report tab aperto) | 30 min |
| P2 | Split ElabTutorV4 (2.5K LOC) | 2-4h |

---

## COMPOSITE SCORE

| Area | Score | Max | Note |
|------|-------|-----|------|
| Build & Deploy | 10 | 10 | Always pass |
| Content (62 paths) | 10 | 10 | CoV 8 layers |
| Accessibility | 5 | 10 | WCAG contrasto weak |
| Performance | 6 | 10 | Bundle big, code splitting ok |
| Code Quality | 6 | 10 | God components, console.log |
| Teacher Dashboard | 7 | 10 | MVP done, demo data weak |
| Regressioni | 10 | 10 | Zero across 9 sessions |
| **TOTALE** | **54** | **70** | **77%** |

---

*Report generato con: quality-audit + code-review + WCAG calculator + frontend-design audit*
*4 agenti Opus paralleli + analisi diretta*
