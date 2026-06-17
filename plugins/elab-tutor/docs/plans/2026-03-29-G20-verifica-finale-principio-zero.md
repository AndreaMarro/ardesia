# G20 — Verifica Finale Principio Zero + Dead Code Purge

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chiudere il piano "30 secondi" con una verifica end-to-end infallibile a 8 strati, eliminare il debito tecnico critico (~17K LOC dead code), e produrre un playground interattivo per demo.

**Architecture:** 3 fasi sequenziali. Fase 1: E2E del flusso Principio Zero nel browser con 8 strati CoV indipendenti. Fase 2: purge dead code + code splitting per ridurre bundle. Fase 3: playground HTML interattivo per demo stakeholder. Ogni fase ha un quality audit gate — se non passa, non si procede.

**Tech Stack:** React 19, Vite 7, preview_* tools per browser verification, vitest, Vercel deploy, Firecrawl per competitive research, Playground per demo artifact.

**Vincoli INVIOLABILI:**
- `npm run build` deve passare dopo ogni modifica
- 911/911 test devono passare
- Nessun file `engine/` (CircuitSolver, AVRBridge) viene toccato
- ZERO DEMO, ZERO DATI FINTI — tutto deve funzionare con dati reali
- Linguaggio 10-14 anni in ogni testo visibile

---

## FASE 1: Verifica End-to-End — 8 Strati CoV

> Principio: ogni strato verifica un aspetto diverso, indipendentemente dagli altri.
> Se anche UN SOLO strato fallisce, il piano si ferma e si fixa prima di procedere.

### Task 1: Strato 1 — Build & Test Gate

**Files:** Nessuna modifica — solo verifica

**Step 1: Build check**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build`
Expected: `built in <60s`, 19 entries, 0 errors

**Step 2: Test suite**

Run: `npx vitest run`
Expected: 911/911 PASS

**Step 3: Bundle size snapshot**

Run: `npm run build 2>&1 | grep -E "ElabTutorV4|index-.*\.js|react-pdf" | head -5`
Record: chunk sizes in report (target: ElabTutorV4 < 1200KB)

**Step 4: Record results**

Annotare in report: build time, test count, bundle sizes.

---

### Task 2: Strato 2 — Browser First-Time Flow (preview_* tools)

**Files:** Nessuna modifica — solo verifica browser

**Step 1: Avviare preview server e navigare a /#prova**

Usare `preview_start` + `preview_eval` per navigare a `/#prova` (simula primo accesso).

**Step 2: Verificare welcome UNLIM**

Usare `preview_snapshot` — cercare testo "Ciao" o "UNLIM" nel contenuto.
Expected: messaggio di benvenuto visibile.

**Step 3: Verificare auto-load esperimento**

Usare `preview_snapshot` — cercare "Cap. 6 Esp. 1" o "Accendi" nel titolo esperimento.
Expected: esperimento v1-cap6-esp1 caricato automaticamente.

**Step 4: Verificare LessonPath aperto**

Usare `preview_snapshot` — cercare "PERCORSO LEZIONE" o "Percorso" visibile.
Expected: pannello percorso lezione aperto.

**Step 5: Verificare progressive disclosure (NO editor)**

Usare `preview_snapshot` — verificare che NON ci sia "Arduino C++" o "Blocchi" o "Monitor Seriale".
Expected: nessun pannello codice/scratch/serial visibile.

**Step 6: Verificare zero errori console**

Usare `preview_console_logs` con level=error.
Expected: 0 errori.

**Step 7: Screenshot prova visiva**

Usare `preview_screenshot` per catturare lo stato.

---

### Task 3: Strato 3 — Browser Return Flow

**Files:** Nessuna modifica — solo verifica browser

**Step 1: Simulare interazione utente**

Usare `preview_eval` per simulare un'interazione:
```javascript
// Simula che l'utente ha gia usato il tutor prima
localStorage.setItem('elab_session_history', JSON.stringify([{
  experimentId: 'v1-cap6-esp1',
  title: 'Accendi il tuo primo LED',
  timestamp: Date.now() - 86400000,
  completed: true
}]));
window.location.reload();
```

**Step 2: Verificare messaggio "Bentornati"**

Usare `preview_snapshot` — cercare "Bentornati" nel contenuto.
Expected: messaggio di ritorno con riferimento all'ultimo esperimento.

**Step 3: Pulire e ripristinare**

```javascript
localStorage.removeItem('elab_session_history');
```

---

### Task 4: Strato 4 — Responsive LIM (1024x768)

**Files:** Nessuna modifica — solo verifica browser

**Step 1: Ridimensionare a 1024x768**

Usare `preview_resize` con width=1024, height=768.

**Step 2: Screenshot LIM**

Usare `preview_screenshot`.
Verificare visivamente: nessun overflow, testo leggibile, layout coerente.

**Step 3: Verificare font sizes**

Usare `preview_inspect` su elementi chiave:
- Titolo esperimento: fontSize >= 14px
- Bottoni toolbar: minHeight >= 44px
- Testo UNLIM: fontSize >= 14px

**Step 4: Ripristinare dimensioni**

Usare `preview_resize` con width=1280, height=800.

---

### Task 5: Strato 5 — Vol3 Progressive Disclosure (editor VISIBILE)

**Files:** Nessuna modifica — solo verifica browser

**Step 1: Caricare un esperimento Vol3**

```javascript
window.__ELAB_API?.loadExperiment('v3-cap6-semaforo');
```

**Step 2: Verificare che editor/serial siano disponibili**

Usare `preview_snapshot` — cercare toolbar buttons per codice o controlli AVR.
I bottoni codice/compile dovrebbero essere PRESENTI per Vol3.

**Step 3: Tornare a Vol1 e verificare che scompaiono**

```javascript
window.__ELAB_API?.loadExperiment('v1-cap6-esp1');
```

Usare `preview_snapshot` — verificare che i bottoni codice/compile NON ci siano.

---

### Task 6: Strato 6 — Code Audit (grep-based)

**Files:** Nessuna modifica — solo verifica codice

**Step 1: Verificare zero broken imports**

```bash
# Cerca import di file cancellati
grep -rn "ElectronView\|Watermark\|LandingScuole\|NarrativeReport\|TTSControls" src/ --include="*.jsx" --include="*.js" | grep -v "node_modules\|\.bak"
```
Expected: 0 risultati (o solo in commenti/export non usati)

**Step 2: Verificare zero font < 14px screen**

```bash
grep -rn "fontSize.*\(1[0-3]\|[0-9]\)[^0-9]" src/components/tutor/ src/components/simulator/ --include="*.jsx" | grep -v "PDF\|pdf\|report\|Report"
```
Expected: 0 risultati

**Step 3: Verificare disclosure level nel contesto AI**

```bash
grep -n "disclosure" src/components/tutor/ElabTutorV4.jsx | head -10
```
Expected: `disclosureLevel` usato in useMemo, passato al simulatore, nel contesto AI

---

### Task 7: Strato 7 — Competitive Benchmark (Firecrawl)

**Files:** Nessuna modifica — solo ricerca

**Step 1: Analizzare landing page competitor**

Usare skill `firecrawl` per scrapare:
- `https://www.tinkercad.com/circuits` — come presentano il simulatore
- `https://wokwi.com` — come presentano il simulatore Arduino

**Step 2: Confrontare con ELAB**

Compilare tabella comparativa:
| Feature | Tinkercad | Wokwi | ELAB |
|---------|-----------|-------|------|
| Tempo a primo circuito | ? | ? | <15s |
| Richiede login | ? | ? | No (prova) |
| Lesson path guidato | ? | ? | Si |
| Progressive disclosure | ? | ? | Si (Vol-based) |
| AI tutor integrato | No | No | Si (UNLIM) |

---

### Task 8: Strato 8 — Prof.ssa Rossi Test (impersonazione)

**Files:** Nessuna modifica — solo analisi

**Step 1: Impersonare la Prof.ssa Rossi**

Scenario: Prof.ssa Rossi, 52 anni, zero esperienza elettronica, 25 ragazzi che la guardano dalla LIM. Apre ELAB per la prima volta.

Verificare mentalmente il flusso dalla screenshot:
1. Vede il messaggio UNLIM? SI/NO
2. L'esperimento e' gia caricato? SI/NO
3. Sa cosa fare dopo? SI/NO (il "PERCORSO UNLIM" la guida?)
4. Vede cose che non capisce? (codice, terminale, blocchi Scratch?) SI/NO
5. Puo iniziare a insegnare in <30 secondi? SI/NO

**Step 2: Documentare risultato**

Pass/Fail con motivazione onesta per ogni punto.

---

## QUALITY AUDIT #1 — Gate Fase 1→2

Compilare score card prima di procedere alla Fase 2:

| Strato | Risultato | Bloccante? |
|--------|-----------|------------|
| 1. Build & Test | PASS/FAIL | SI |
| 2. First-Time Flow | PASS/FAIL | SI |
| 3. Return Flow | PASS/FAIL | SI |
| 4. LIM 1024x768 | PASS/FAIL | SI |
| 5. Vol3 Disclosure | PASS/FAIL | SI |
| 6. Code Audit | PASS/FAIL | SI |
| 7. Competitive | INFO | NO |
| 8. Prof.ssa Rossi | PASS/FAIL | SI |

**Se anche 1 strato bloccante e' FAIL → fixare PRIMA di procedere.**

---

## FASE 2: Dead Code Purge + Bundle Optimization

### Task 9: Rimuovere moduli Gestionale dead code (~17K LOC)

**Files:**
- Modify: `src/App.jsx` (rimuovere lazy imports)
- Delete: `src/components/admin/gestionale/` (intera directory)
- Delete: moduli admin non raggiungibili

**Step 1: Identificare tutti i lazy import non raggiungibili in App.jsx**

Leggere App.jsx e trovare tutti i `React.lazy()` che non hanno un corrispondente route/conditional render.

**Step 2: Rimuovere gli import dead**

Rimuovere le righe `const XYZ = lazy(...)` per i componenti non raggiungibili.

**Step 3: NON cancellare i file fisici (per ora)**

I file restano su disco ma non vengono piu importati = non finiscono nel bundle.
Questo e' piu sicuro di cancellare: se servono in futuro, sono li.

**Step 4: Build + Test**

Run: `npm run build && npx vitest run`
Expected: PASS. Bundle size dovrebbe calare (~800KB in meno).

**Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "perf: remove unreachable lazy imports — ~800KB bundle reduction"
```

---

### Task 10: Lazy-load tab components in ElabTutorV4

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx`

**Step 1: Convertire import statici in lazy**

I tab ManualTab, CanvasTab, NotebooksTab, VideosTab sono gia file separati ma importati staticamente. Convertirli in lazy:

```jsx
// Sostituire:
import ManualTab from './ManualTab';
import CanvasTab from './CanvasTab';
import NotebooksTab from './NotebooksTab';
import VideosTab from './VideosTab';

// Con:
const ManualTab = lazy(() => import('./ManualTab'));
const CanvasTab = lazy(() => import('./CanvasTab'));
const NotebooksTab = lazy(() => import('./NotebooksTab'));
const VideosTab = lazy(() => import('./VideosTab'));
```

**Step 2: Wrappare i render con Suspense**

Aggiungere `<Suspense fallback={<div>Caricamento...</div>}>` dove questi tab vengono renderizzati.

**Step 3: Build + Test**

Run: `npm run build && npx vitest run`
Expected: ElabTutorV4 chunk dovrebbe calare significativamente.

**Step 4: Commit**

```bash
git add src/components/tutor/ElabTutorV4.jsx
git commit -m "perf: lazy-load tab components — reduce ElabTutorV4 chunk"
```

---

## QUALITY AUDIT #2 — Gate Fase 2→3

| Metrica | Prima (G19) | Dopo | Target | Status |
|---------|-------------|------|--------|--------|
| Build | PASS | ? | PASS | ? |
| Test 911/911 | PASS | ? | PASS | ? |
| ElabTutorV4 chunk | 1118 KB | ? | < 900 KB | ? |
| Bundle totale | 4145 KB | ? | < 3500 KB | ? |
| Dead lazy imports | ~15 | ? | 0 | ? |
| Runtime errors | 0 | ? | 0 | ? |

---

## FASE 3: Playground Demo + Report Finale

### Task 11: Competitive Research con Firecrawl

**Step 1: Scrapare pagine competitor**

Usare skill `firecrawl` per raccogliere dati da:
- Tinkercad Circuits (landing + features)
- Wokwi (landing + features)
- Arduino IDE online

**Step 2: Documentare differenziatori**

Compilare tabella: feature, competitor, ELAB, vantaggio/svantaggio.

---

### Task 12: Playground interattivo per demo

**Step 1: Creare playground HTML**

Usare skill `/playground` per creare un playground interattivo che mostra:
- Il flusso "30 secondi" di ELAB (animazione/schema)
- Score card prima/dopo
- Confronto con competitor
- Il percorso Vol1→Vol2→Vol3

Il playground deve essere un singolo file HTML auto-contenuto, apribile in browser.

**Step 2: Salvare il playground**

Salvare in `docs/demo/principio-zero-playground.html`

---

### Task 13: Fix P1 residui dall'audit G19

**Files:**
- Modify: `src/components/simulator/hooks/useExperimentLoader.js`

**Step 1: Fix stale closure in useExperimentLoader**

Leggere il file e identificare il callback con dependency array vuoto `[]` che usa refs.
Valutare se il fix e' necessario o se l'uso di refs (che non diventano stale) rende il problema inesistente.

**Step 2: Documentare decisione**

Se non serve fix: documentare PERCHE' nel report (refs non hanno stale closure).
Se serve fix: applicare e testare.

---

## QUALITY AUDIT #3 — Post-Fix

| Metrica | Valore | Target | Status |
|---------|--------|--------|--------|
| Runtime errors browser | ? | 0 | ? |
| Console errors | ? | 0 | ? |
| useExperimentLoader fix | ? | Resolved | ? |

---

## QUALITY AUDIT #4 — Pre-Deploy

| Check | Risultato |
|-------|-----------|
| `npm run build` | PASS/FAIL |
| `npx vitest run` | 911/911 |
| Preview browser: zero errors | PASS/FAIL |
| Preview browser: Vol1 no editor | PASS/FAIL |
| Preview browser: Vol3 has editor | PASS/FAIL |
| Preview browser: LIM 1024x768 | PASS/FAIL |
| Bundle < target | PASS/FAIL |

---

### Task 14: Deploy finale

**Step 1: Deploy a Vercel**

```bash
npm run build && npx vercel --prod --yes
```

**Step 2: Verificare deploy live**

Navigare all'URL di produzione e verificare che tutto funzioni.

---

## QUALITY AUDIT #5 — Post-Deploy (Firecrawl)

**Step 1: Verificare il sito live con Firecrawl**

Usare `firecrawl` per scrapare la landing page deployata e verificare:
- Title corretto
- Nessun errore nel contenuto
- Meta tags presenti
- Performance: pagina caricata correttamente

**Step 2: Report finale**

Compilare il report finale in `.team-status/QUALITY-AUDIT-G20.md` con:
- Tutti e 8 gli strati CoV con risultato
- 5 quality audit gate con risultati
- Bundle sizes prima/dopo
- Screenshot browser
- Tabella competitiva
- Score composito aggiornato
- Lista onesta di tutto cio che NON funziona ancora

---

## Metriche di Successo G20

| Metrica | Target | Verifica |
|---------|--------|----------|
| 8/8 strati CoV | PASS | Report |
| 5/5 quality audit gate | PASS | Report |
| Bundle reduction | > 500KB | Build output |
| Dead lazy imports | 0 | grep |
| Playground demo | Funzionante | Browser |
| Deploy live | OK | Vercel |
| Prof.ssa Rossi test | PASS | Mentale |
| Competitive research | Documentato | Firecrawl |

---

## Appendice: Stato Pre-G20

### Commit G19 (punto di partenza)
```
d7bb1a9 fix(G19): quality audit — touch targets, font size, focus color
c5eac18 fix: remove dangling electronViewEnabled reference
27f0948 docs: Principio Zero plan, audit reports G9-G17
280b6d3 chore(automa): sprint infra — 130 task, reports G8-G17
21e31a4 feat(G19): Principio Zero — progressive disclosure + automa improvements
```

### Build G19
- 19 entries, 4145 KB
- ElabTutorV4: 1118 KB (target < 900 KB post-optimization)
- Test: 911/911 PASS

### Bug noti residui
- ~17K LOC dead code admin/gestionale (lazy imports non raggiungibili)
- 3 chunk > 1000KB (ElabTutorV4, react-pdf, index)
- useExperimentLoader: possibile stale closure (da verificare)
- 22 task automa pending (8 P0 lesson paths, 3 P1, 3 P2, 3 research)

### Automa Queue Pending (22 task)
- P0: 8 lesson paths mancanti (v1-cap6-esp2/3, v1-cap7-esp1/2/3, v1-cap8-esp1/2, percorso-lezione)
- P0: font-size audit fix, automatic circuit evaluation
- P1: breadboard appunti centrali, identita unica, teacher prep expansion, vol2 language simplification
- P2: lighthouse baseline, backstopjs baseline, netlify URL hardcoded
- Research: ai_tutoring, competitor, ux_children, galileo pattern matching
