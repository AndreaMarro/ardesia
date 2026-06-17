# QUALITY AUDIT — Sessione S84
*Data: 2026-03-24 | Strumento: Claude Code + quality-audit skill*

---

## SCORE CARD

| # | Metrica | S83 (prev) | S84 (now) | Target | Status |
|---|---------|-----------|-----------|--------|--------|
| 1 | Font < 14px (CSS px assoluti) | **1** | **1** | 0 | ⚠️ STABILE |
| 2 | Font < 14px (JSX inline) | **32** | **0** | 0 | ✅ MIGLIORATO |
| 3 | Touch targets < 44px (interattivi) | **~20** | **0** | 0 | ✅ MIGLIORATO |
| 4 | Bundle principale (ElabTutorV4) | **~2010 KB** | **1,102 KB** | < 1200 KB | ✅ PASS |
| 5 | Bundle DashboardGestionale | — | **410 KB** | < 1200 KB | ✅ PASS |
| 6 | Bundle CircuitDetective | — | **117 KB** | < 1200 KB | ✅ PASS |
| 7 | console.log in sorgente | **1** | **20** | 0 | ❌ REGRESSIONE |
| 8 | console.warn in sorgente | **—** | **17** | — | ⚠️ WARN |
| 9 | console.error in sorgente | **—** | **19** | — | ⚠️ WARN |
| 10 | Build errors | **0** | **0** | 0 | ✅ PASS |
| 11 | Build time | **~90s** | **22.1s** | < 30s | ✅ PASS |
| 12 | Dead code (file orfani) | **61** | **3** | 0 | ✅ MIGLIORATO |
| 13 | `<img>` senza `alt` | — | **4** | 0 | ❌ FAIL |
| 14 | `<button>` senza aria-label | — | **467/471** | 0 | ❌ FAIL |
| 15 | onClick non-semantico (div/span) | — | **428** | 0 | ❌ FAIL |
| 16 | WCAG AA contrasto primario | **6.3:1** | **6.3:1** | > 4.5:1 | ✅ PASS |
| 17 | WCAG AA contrasto lime/accent | **3.6:1** | **3.6:1** | > 4.5:1 | ❌ FAIL |
| 18 | WCAG AA contrasto vol2 orange | **2.6:1** | **2.6:1** | > 4.5:1 | ❌ FAIL |
| 19 | WCAG AA contrasto vol3 red | **3.5:1** | **3.5:1** | > 4.5:1 | ❌ FAIL |

**Score globale S84: 7/19 PASS** *(S83: 5/15 PASS)*

---

## DETTAGLIO VIOLAZIONI ATTIVE

### 1. Font-size 12px — ElabSimulator.css:122
```css
/* ElabSimulator.css:122 */
font-size: 12px;  /* → portare a 14px */
```
Unica violazione px assoluta rimasta. Tutti i valori rem/em sono esenti.

### 2. console.log — 20 occorrenze (REGRESSIONE da S83)
Distribuzione per file:
- `ElabTutorV4.jsx` — **27** totali (log + warn + error)
- `gdprService.js` — **8**
- `voiceService.js` — **4**
- `useTTS.js` — **4**
- `logger.js` — **4** *(probabilmente il wrapper legittimo)*
- `ScratchEditor.jsx` — **3**
- `AuthContext.jsx` — **2**
- altri — **4**

> **Nota:** `logger.js` è probabilmente il wrapper di produzione legittimo. I 20 `console.log` puri andrebbero migrati al logger interno.

### 3. Dead code — 3 file orfani (migliorato da 61)
| File | Stato |
|------|-------|
| `src/components/tutor/TTSControls.jsx` | Non importato da nessun file |
| `src/components/report/narrative/NarrativeReportEngine.jsx` | Non importato |
| `src/services/emailService.js` | Non importato |

### 4. Accessibilità — Problemi sistemici
| Issue | Count | Priorità |
|-------|-------|---------|
| `<button>` senza `aria-label` | 467 / 471 | 🔴 ALTA |
| `<img>` senza `alt` | 4 | 🟡 MEDIA |
| `onClick` su div/span (non-semantico) | 428 | 🟡 MEDIA |

> I 428 onClick non-semantici includono probabilmente componenti wrapper legittimi, ma richiedono audit manuale. Il problema `<button>` senza aria è sistematico e impatta screen reader.

### 5. WCAG Contrasto — Colori ELAB (invariato da S83)
| Colore | Rapporto | AA |
|--------|----------|-----|
| Primario (blu scuro) | 6.3:1 | ✅ |
| Lime accent | 3.6:1 | ❌ |
| Vol2 Orange | 2.6:1 | ❌ |
| Vol3 Red | 3.5:1 | ❌ |

---

## MIGLIORAMENTI RILEVATI vs S83

| Area | S83 | S84 | Delta |
|------|-----|-----|-------|
| Font JSX inline | 32 | 0 | **-32** ✅ |
| Dead code files | 61 | 3 | **-58** ✅ |
| Build time | ~90s | 22.1s | **-75%** ✅ |
| Bundle principale | ~2010 KB | 1102 KB | **-908 KB** ✅ |
| Touch targets interattivi | ~20 | 0 | **-20** ✅ |

---

## PRIORITÀ DI FIX CONSIGLIATE (prossima sessione)

| Priorità | Issue | Impatto | Effort |
|----------|-------|---------|--------|
| 🔴 1 | Rimuovere `console.log` (20 occorrenze) → usare logger | Performance prod | Basso |
| 🔴 2 | Aggiungere `aria-label` ai button | Accessibilità screen reader | Medio |
| 🟡 3 | Fix font-size 12px in ElabSimulator.css:122 | WCAG font | Minimo |
| 🟡 4 | Rimuovere/integrare 3 file orfani | Pulizia codebase | Basso |
| 🟡 5 | Aggiungere `alt` alle 4 `<img>` | WCAG immagini | Minimo |
| 🟢 6 | Fix contrasto lime/orange/red | WCAG colori | Alto (design) |

---

## ENVIRONMENT
- Source files: **176 JS/JSX/TS/TSX**, **10 CSS**
- Build: Vite (ESM chunks lazy-loaded)
- Build time: **22.1s** (era 90s in S83)
- Main chunk gzip: **260 KB** (ElabTutorV4)

---

---

## COVERAGE — Risultati `npm run coverage`

**Esecuzione:** 2026-03-24 | Durata: **3.85s**

### Summary

| Metrica | Valore | Status |
|---------|--------|--------|
| Test files | 15 passed / 1 failed | ⚠️ WARN |
| Tests totali | **907 passed / 4 failed** (911 tot) | ⚠️ WARN |
| Pass rate | **99.6%** | ✅ |
| File in errore | `pdr-69-experiments.test.js` | ❌ |

### Test Falliti — pdr-69-experiments.test.js

Tutti e 4 i fallimenti sono **data completeness checks** legati agli esperimenti Vol3:

| Test | Atteso | Ricevuto | Delta |
|------|--------|----------|-------|
| Total experiments | 69 | **62** | −7 |
| Vol3 experiments | 13 | **6** | −7 |
| Total quiz questions | 138 | **126** | −12 |
| v3-extra-simon quiz | 2 | **4** | +2 (duplicati?) |

**Causa root:** `experiments-vol3.js` contiene solo **6 esperimenti** su 13 previsti.
I 7 esperimenti mancanti di Vol3 non sono stati ancora scritti nel data file.
Il test `pdr-69-experiments.test.js` fu scritto *anticipando* il completamento di Vol3 (target: 69 esperimenti totali — CLAUDE.md riporta 67).

### Test Passati per file

| File | Tests | Status |
|------|-------|--------|
| crypto.test.js | 21 | ✅ |
| auth.test.js | 28 | ✅ |
| CircuitSolver.state.test.js | 2 | ✅ |
| CircuitSolver.phase3-4.test.js | 11 | ✅ |
| CircuitSolver.comprehensive.test.js | — | ✅ |
| breaknano.physical.test.js | 4 | ✅ |
| volume3.connections.test.js | 1 | ✅ |
| nanoR4Board.smoke.test.jsx | — | ✅ |
| experiments.smoke.test.jsx | 2 | ✅ |
| components.critical.test.js | 4 | ✅ |
| pinout.verification.test.js | 2 | ✅ |
| whiteboardScreenshot.test.js | 4 | ✅ |
| SessionRecorder.test.js | — | ✅ |
| debug_bb.test.js | 1 | ✅ |
| PlacementEngine.test.js | — | ✅ |

### Azione Richiesta

> **pdr-69-experiments.test.js** va aggiornato (69→62 totali, 13→6 Vol3) **oppure** vanno scritti i 7 esperimenti Vol3 mancanti nel file `experiments-vol3.js`.
> Il CLAUDE.md riporta "67 esperimenti (38+18+11)" → il test dice 69 (38+18+13). Chiarire la fonte di verità prima di fixare.

---

*Quality Audit S84 — Claude Code — 2026-03-24*
