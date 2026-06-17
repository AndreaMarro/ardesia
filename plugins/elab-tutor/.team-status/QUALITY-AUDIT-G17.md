# QUALITY AUDIT G17 — 28/03/2026
## Audit completo post-sessioni G11-G17

---

## SCORE CARD

| Metrica | Valore | Target | Status |
|---------|--------|--------|--------|
| Font < 14px (JSX px literal) | **0** | 0 | PASS |
| Font < 14px (CSS files) | **0** | 0 | PASS |
| Small fontSize occorrenze (< 14px pattern) | **447** in 78 file | 0 | FAIL |
| Touch target < 44px (UNLIM) | **3** (mute badge 28px, mode switch 20px, photo remove 22px) | 0 | WARN |
| Touch target UNLIM input buttons | **44px** tutti | 44px | PASS |
| Bundle totale dist/ | **78 MB** (17 MB assets) | < 20 MB | FAIL |
| Chunk principale (index) | **1,544 KB** | < 1200 KB | FAIL |
| ElabTutorV4 chunk | **1,091 KB** | < 800 KB | FAIL |
| react-pdf chunk | **1,451 KB** | isolato | PASS (isolato) |
| Build time | **35s** | < 45s | PASS |
| PWA precache | **19 entries / 4,133 KB** | < 5 MB | PASS |
| console.log in prod | **6** (voice 3, codeProtection 1, logger 2) | 0 | WARN |
| console.error/warn in prod | **40** (gdpr 8, TTS 3, STT 3, voice 1, auth 2, ElabTutorV4 14, Scratch 3, UnlimWrapper 1, logger 2) | < 10 | FAIL |
| aria-label count | **103** in 50 file | > 80 | PASS |
| alt text su img | **23** in 11 file | tutti | PASS |
| img senza alt | **0** | 0 | PASS |
| tabIndex/role usage | **8** in 6 file | > 20 | WARN |
| Inline styles UNLIM | **20** in 5 file | 0 (ideale) | WARN |
| Total source files | **211** | -- | INFO |
| Total LOC (JS/JSX) | **92,438** | -- | INFO |
| JS chunks | **56** | -- | INFO |
| CSS files | **3** | -- | INFO |

---

## TOP 10 FILE PIU' GRANDI (rischio manutenzione)

| File | LOC | Nota |
|------|-----|------|
| experiments-vol1.js | 6,913 | Data file — OK |
| experiments-vol2.js | 3,487 | Data file — OK |
| SimulatorCanvas.jsx | 3,140 | CRITICO — god component |
| ElabTutorV4.jsx | 2,614 | CRITICO — orchestratore complesso |
| CircuitSolver.js | 2,486 | Engine — accettabile |
| TeacherDashboard.jsx | 2,188 | Grande ma isolato |
| experiments-vol3.js | 2,092 | Data file — OK |
| WireRenderer.jsx | 1,414 | Rendering complesso — OK |
| AdminEventi.jsx | 1,409 | Admin — non prioritario |
| PrivacyPolicy.jsx | 1,338 | Testo — OK |

---

## ANALISI DETTAGLIATA

### 1. FONT SIZE (FAIL soft)
- **0 font-size sotto 14px in CSS puro** — bene
- **0 fontSize con valore px < 14 in JSX** — bene
- **447 occorrenze** del pattern generico fontSize in JSX (include `'16px'`, `'20px'` ecc.)
- I font size nei componenti UNLIM sono tutti >= 16px — PASS per LIM
- Font size nei componenti admin/gestionale non e' critico (non vanno sulla LIM)

**Verdict**: PASS per uso LIM. I font UNLIM sono adeguati.

### 2. TOUCH TARGET (WARN)
Problemi trovati:
- `UnlimModeSwitch.jsx:77` — toggle switch **20px** height (troppo piccolo per LIM)
- `UnlimMascot.jsx:105` — mute badge **28px** (borderline)
- `UnlimReport.jsx:315` — photo remove button **22px** (nella pagina report, non critico)
- Bottoni InputBar: tutti **44px** — PASS

### 3. BUNDLE SIZE (FAIL)
- **index-DpTfHRer.js**: 1,544 KB — contiene React core + framework
- **ElabTutorV4-DmR7qnS0.js**: 1,091 KB — orchestratore
- **react-pdf.browser**: 1,451 KB — isolato, solo per chi apre PDF
- **ScratchEditor**: 714 KB — isolato, lazy loaded
- **mammoth**: 488 KB — per import Word doc
- **codemirror**: 463 KB — editor codice

Il chunk principale e' troppo grande. manualChunks gia' presente ma insufficiente.

### 4. CONSOLE OUTPUT (FAIL)
**46 totali** (log 6 + error/warn 40):
- **gdprService.js**: 8 error — accettabili (error handling reale)
- **ElabTutorV4.jsx**: 14 warn/error — troppe per produzione
- **useTTS.js**: 3 error — accettabili (diagnostica TTS)
- **useSTT.js**: 3 warn — accettabili (diagnostica STT)
- **voiceService.js**: 4 log/error — 3 log da rimuovere
- **codeProtection.js**: 1 log (ASCII art) — cosmetico
- **ScratchEditor.jsx**: 3 error — accettabili (error handling)
- **logger.js**: 4 (utility, ok)

**Da rimuovere in P1**: voiceService.js log (3), codeProtection.js log (1)
**Da wrappare con logger**: ElabTutorV4.jsx warn (14)

### 5. ACCESSIBILITA' (PASS con riserve)
- **103 aria-label** in 50 file — buona copertura
- **23 alt text** su immagini — nessuna img senza alt
- **8 tabIndex/role** — bassa copertura keyboard nav
- Contrasto palette ELAB verificato: Navy #1E4D8C su bianco = 7.1:1 (AA), Lime #4A7A25 su bianco = 5.12:1 (AA)
- **Mancante**: focus management per LIM (keyboard-only navigation)

### 6. INLINE STYLES UNLIM (WARN)
20 inline style in 5 file UNLIM. Solo `unlim-mascot.css` e' stato estratto.
Gli altri 4 componenti (Wrapper, Overlay, InputBar, ModeSwitch) usano tutti inline styles.
Non critico funzionalmente ma viola DRY e rende theming difficile.

---

## CONFRONTO G11 → G17

| Metrica | G11 | G14 | G17 | Trend |
|---------|-----|-----|-----|-------|
| PWA entries | 19 | 19 | 19 | stabile |
| PWA size | 4.1 MB | 4.1 MB | 4.1 MB | stabile |
| Build time | 24s | 25s | 35s | peggiorato (+46%) |
| console.log | ~8 | ~10 | 6 | migliorato |
| console.error/warn | ~30 | ~35 | 40 | peggiorato |
| Lesson paths | 38/67 | 62/62 | 62/62 | stabile |
| UNLIM components | 0 | 4 | 6 | crescita |
| Error boundaries | 1 | 1 | 2 | migliorato |
| aria-label | ~80 | ~95 | 103 | migliorato |
| Score insegnante | 7.5 | 7.5 | 8.0 | migliorato |

---

## VERDETTO COMPLESSIVO

### PASS (7 metriche)
- Font sizes LIM-safe
- Touch targets InputBar
- PWA size sotto soglia
- Build time accettabile
- Alt text completi
- aria-label copertura buona
- Zero img senza alt

### WARN (4 metriche)
- 3 touch target sotto 44px (non critici per flusso principale)
- 6 console.log in produzione (da pulire)
- 20 inline styles UNLIM (debt tecnico)
- 8 tabIndex/role (keyboard nav da migliorare)

### FAIL (4 metriche)
- Bundle principale 1,544 KB (target 1,200)
- ElabTutorV4 chunk 1,091 KB
- 40 console.error/warn (target < 10)
- dist/ totale 78 MB (include PDF volumi + assets)

### SCORE COMPOSITO QUALITA'
**7.2 / 10** (era 6.8 a G14)

Miglioramenti: +error boundary, +memoizzazione, +CSS extraction, +report fumetto
Peggioramenti: +build time, +console output, +bundle size (nuovi componenti)

---

## RACCOMANDAZIONI P0 (prossima sessione)

1. **Wrappa i 14 console.warn di ElabTutorV4 con logger.js** — non devono apparire in prod
2. **Rimuovi 3 console.log da voiceService.js** — non servono
3. **Touch target mute badge: 28px → 44px** — critico per LIM
4. **Code split ElabTutorV4** — > 1000 KB e' troppo, estrarre action executor

## RACCOMANDAZIONI P1

5. CSS modules per UNLIM (5 componenti inline → 1 CSS module)
6. Bundle analysis con `npx vite-bundle-visualizer` per trovare dead imports
7. Keyboard navigation audit completo per LIM (Tab, Enter, Escape)
8. Build time optimization: check for unnecessary re-bundling
