# Prompt Sessione 41 — UX Minimal + Performance + Nanobot + Whiteboard HD

**Data prevista**: 25/02/2026
**Priorita**: P0-P1 (user-facing improvements richiesti dal boss)
**Prerequisiti**: Sessione 40B deployata con successo (Galileo Pervasivo + Wire V7)

---

## CONTESTO

ELAB Tutor (https://www.elabtutor.school) e' un simulatore di circuiti con tutor AI (Galileo) per studenti 8-14 anni. Nella sessione 40B abbiamo completato:
- **Wire V7**: fili flessibili con Catmull-Rom spline (WireRenderer.jsx)
- **Galileo Pervasivo**: il tutor vede lo stato circuito in tempo reale e interviene proattivamente (3 eventi: LED bruciato, corrente alta, circuito funzionante)
- **System prompt arricchito** con istruzioni per analisi circuito

Il boss (Franzoso Riccardo) ha ora 4 richieste per la prossima sessione:

---

## TASK 1: Frontend Minimal e User-Friendly

### Problema
L'interfaccia ha troppi elementi visibili. Per un bambino di 8-14 anni deve essere pulita, essenziale, senza sovraccaricare.

### Cosa fare
1. **Ridurre la tab bar**: raggruppare le 9 tab attuali (manual, simulator, detective, poe, reverse, review, canvas, notebooks, videos) in massimo 4-5 categorie visibili. Suggerimento:
   - **Simulatore** (principale)
   - **Manuale** (PDF viewer)
   - **Giochi** (detective + poe + reverse + review in un sotto-menu)
   - **Lavagna** (canvas/whiteboard)
   - **Video** (opzionale, nascondibile)

2. **Semplificare la toolbar del simulatore**: troppi bottoni. Nascondere quelli avanzati dietro un menu "..." (kebab). Mantenere visibili solo: play/pause, reset, undo, zoom, build mode.

3. **Chat overlay minimal**: su mobile la chat copre troppo. Renderla un bottone flottante che si espande, stile WhatsApp web. Dimensione default: 40% viewport, non 60%.

4. **Onboarding gentile**: prima volta che l'utente apre → breve tooltip animato su "come iniziare" (3 step max). Non un modal bloccante.

### File coinvolti
- `src/components/tutor/TutorLayout.jsx` — layout principale e tab bar
- `src/components/tutor/ElabTutorV4.jsx` — stato tab + chat overlay
- `src/components/tutor/ElabTutorV4.css` — stili chat, tab, responsive
- `src/components/simulator/NewElabSimulator.jsx` — toolbar simulatore

### Metriche di successo
- Tab visibili: ≤ 5
- Bottoni toolbar simulatore visibili: ≤ 8
- Chat overlay mobile: ≤ 40vh
- Zero modal bloccanti

---

## TASK 2: Rendere ELAB Tutor Piu Veloce e Reattivo

### Problema
- ElabTutorV4 chunk e' 984KB (quasi al limite 1000KB)
- Galileo risponde in 2-4s (latenza n8n webhook)
- Circuit bridge debounce 800ms puo essere ridotto

### Cosa fare
1. **Code-splitting aggressivo**: estrarre i giochi (CircuitDetective, PredictObserveExplain, ReverseEngineeringLab, CircuitReview) in chunk lazy-loaded. Sono ~50KB totali che si caricano solo se l'utente apre la tab giochi.
   ```jsx
   const CircuitDetective = React.lazy(() => import('./CircuitDetective'));
   ```

2. **Ridurre debounce bridge**: da 800ms a 400ms. Lo stato circuito si aggiorna piu rapidamente per Galileo.

3. **Streaming response** (se fattibile): verificare se n8n supporta Server-Sent Events (SSE) o chunked responses. Se si, mostrare la risposta di Galileo token per token come ChatGPT. Se no, almeno mostrare "Galileo sta pensando..." con animazione typing.

4. **Preload critico**: caricare il font Oswald + Open Sans con `<link rel="preload">` nell'HTML per evitare FOUT (Flash of Unstyled Text).

5. **Memoizzazione pesante**: verificare che `ExperimentPicker`, `ComponentPalette`, `BreadboardRenderer` usino `React.memo()` o `useMemo()` dove serve.

### File coinvolti
- `src/components/tutor/ElabTutorV4.jsx` — lazy imports
- `src/components/simulator/NewElabSimulator.jsx` — debounce bridge
- `src/services/api.js` — streaming/SSE se possibile
- `index.html` — preload fonts
- Tutti i componenti pesanti — React.memo audit

### Metriche di successo
- ElabTutorV4 chunk: < 900KB (post code-split)
- First Contentful Paint: < 2s
- Circuit bridge latenza: 400ms
- Risposta Galileo percepita: < 1s (streaming) o typing indicator immediato

---

## TASK 3: Usare Nanobot per Vero Tool-Use di Galileo

### Problema
Galileo attualmente "vede" il circuito ma non puo "toccarlo". Nanobot (github.com/HKUDS/nanobot, 24.3k stars, MIT) permette un vero agent loop con MCP tools.

### Stato sicurezza
- Vulnerabilita (shell injection, path traversal, RCE) **tutte fixate in v0.1.3.post7+**
- Versione attuale: v0.1.4.post1 (sicura)
- DEVE girare in Docker isolato

### Cosa fare (Fase incrementale)

**Fase A — Setup Docker (questa sessione)**:
1. Creare `docker-compose.yml` in root elab-builder con nanobot container
2. Configurare nanobot con Claude/GPT-4 come LLM backend
3. Esporre endpoint API locale (es: `http://localhost:8100/chat`)
4. Test: inviare messaggio e ricevere risposta

**Fase B — MCP Tools custom**:
1. Creare tool `readCircuitState()` — legge `window.__ELAB_API__.getComponentStates()`
2. Creare tool `diagnoseCircuit()` — analizza lo stato e ritorna suggerimenti
3. Creare tool `suggestFix(componentId, action)` — suggerisce azione specifica

**Fase C — Integrazione con Galileo**:
1. Aggiungere `nanobot` come backend alternativo in `api.js` (fallback: n8n)
2. Quando Galileo riceve `[STATO CIRCUITO]`, usa nanobot per analisi tool-use
3. Risultato: Galileo che non solo dice "il LED e' spento", ma spiega PERCHE e propone il fix esatto

### File coinvolti
- `docker-compose.yml` (NUOVO)
- `nanobot-config/` (NUOVO) — configurazione nanobot + tools MCP
- `src/services/api.js` — aggiungere backend nanobot
- `src/components/simulator/NewElabSimulator.jsx` — esporre API globale `window.__ELAB_API__`

### Metriche di successo
- Nanobot container running in Docker
- Almeno 1 MCP tool funzionante (`readCircuitState`)
- Galileo usa nanobot per almeno 1 tipo di diagnosi
- Fallback a n8n se nanobot non disponibile

---

## TASK 4: Whiteboard HD (Non Pixelosa)

### Problema
Sia `CanvasTab.jsx` (tab lavagna nel tutor) che `WhiteboardOverlay.jsx` (overlay nel simulatore) usano HTML5 Canvas 2D **senza gestire `window.devicePixelRatio`**. Su schermi Retina/HiDPI il risultato e' pixelato e poco preciso.

### Root cause tecnica
```javascript
// ATTUALE (pixelato):
canvas.width = parent.clientWidth;  // es: 800
canvas.height = parent.clientHeight;  // es: 600
// Su Retina (dpr=2), il canvas ha 800 pixel fisici per 1600 CSS pixels → sfocato

// FIX:
const dpr = window.devicePixelRatio || 1;
canvas.width = parent.clientWidth * dpr;
canvas.height = parent.clientHeight * dpr;
canvas.style.width = parent.clientWidth + 'px';
canvas.style.height = parent.clientHeight + 'px';
ctx.scale(dpr, dpr);
```

### Cosa fare
1. **Fix immediato DPI** in entrambi i file:
   - `CanvasTab.jsx` riga 51-52: applicare DPI scaling
   - `WhiteboardOverlay.jsx`: stesso fix nel setup canvas

2. **Migliorare precisione tratto**:
   - Aggiungere anti-aliasing (gia attivo di default in Canvas 2D)
   - Smoothing del tratto con algoritmo catmull-rom (come i fili!) per disegno a mano libera
   - Pressure sensitivity se disponibile (`PointerEvent.pressure`)

3. **Opzionale: migrare a SVG** (piu ambizioso):
   - Usare una libreria come Excalidraw o tldraw per la whiteboard
   - Vantaggio: vettoriale, zoom infinito, esportazione pulita
   - Svantaggio: peso bundle, complessita integrazione
   - **Consiglio**: iniziare col fix DPI (veloce), valutare migrazione SVG in sessione futura

### File coinvolti
- `src/components/tutor/CanvasTab.jsx` — whiteboard tab nel tutor
- `src/components/simulator/panels/WhiteboardOverlay.jsx` — overlay nel simulatore

### Metriche di successo
- Tratto nitido su schermi Retina (dpr=2)
- Nessuna perdita di funzionalita (undo, redo, shapes, text, export)
- Coordinate mouse corrette dopo DPI scaling
- Zoom whiteboard funzionante con tratto nitido

---

## TASK 5: Codice Super Criptato e Incopiabile

### Problema
Il codice sorgente di ELAB Tutor e' visibile nei DevTools del browser. Chiunque puo aprire F12, leggere i sorgenti React, copiare la logica del simulatore, gli esperimenti, il CircuitSolver. Per un prodotto commerciale questo e' inaccettabile.

### Cosa fare (5 livelli di protezione)

**Livello 1 — Obfuscation del build (CRITICO)**:
1. Installare `vite-plugin-javascript-obfuscator` (usa javascript-obfuscator sotto)
2. Configurare in `vite.config.js` con opzioni aggressive:
   - `stringArray: true` + `stringArrayEncoding: ['rc4']` → tutte le stringhe criptate
   - `controlFlowFlattening: true` → logica illeggibile
   - `deadCodeInjection: true` → codice finto iniettato
   - `identifierNamesGenerator: 'hexadecimal'` → variabili tipo `_0x3a2b1c`
   - `selfDefending: true` → il codice si rompe se formattato/beautified
   - `debugProtection: true` → blocca DevTools debugger
   - `disableConsoleOutput: true` → nessun console.* in produzione
3. ATTENZIONE: NON offuscare i chunk di librerie esterne (codemirror, react-vendor, mammoth, avr) — solo il codice ELAB

**Livello 2 — Zero Source Maps**:
1. In `vite.config.js` aggiungere `build: { sourcemap: false }` (verificare che non sia gia presente — attualmente non e' esplicito)
2. Verificare che Vercel non generi source maps automaticamente
3. Controllare che nessun `.map` file venga deployato

**Livello 3 — Anti-DevTools Runtime**:
1. Creare `src/utils/codeProtection.js` con:
   - Rilevamento apertura DevTools (misura dimensione finestra vs viewport)
   - Blocco right-click su tutta l'app (`contextmenu` event)
   - Blocco Ctrl+U (view-source), Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console)
   - Blocco F12
   - Se DevTools rilevati: mostrare warning "Contenuto protetto — ELAB Tutor"
2. Importare in `main.jsx` o `App.jsx` — si attiva solo in production (`import.meta.env.PROD`)

**Livello 4 — Content Protection (parzialmente gia fatto)**:
1. Verificare e rafforzare la protezione copy gia presente in ElabTutorV4.jsx (righe 160-179)
2. Estendere a TUTTA l'app: blocco selezione testo su componenti sensibili (esperimenti, CircuitSolver output, quiz questions)
3. CSS: `user-select: none` su `.simulator-container`, `.experiment-data`, `.quiz-panel`
4. Disabilitare drag&drop di immagini SVG (componenti elettronici)

**Livello 5 — Protezione Dati Esperimenti**:
1. I dati esperimenti (connections, buildSteps, quiz) sono in chiaro nei JS bundle
2. Opzione A: criptarli con AES a build-time, decriptarli a runtime con chiave derivata da sessione utente
3. Opzione B (piu semplice): offuscare le stringhe con l'obfuscator (Livello 1 copre gia questo)
4. **Consiglio**: Livello 1 e' sufficiente per la maggior parte dei casi. Livello 5A solo se serve protezione anti-competitor seria.

### File coinvolti
- `vite.config.js` — obfuscation plugin + sourcemap: false
- `package.json` — nuova dipendenza dev
- `src/utils/codeProtection.js` (NUOVO) — anti-DevTools + anti-copy runtime
- `src/main.jsx` o `src/App.jsx` — import protezione
- `src/components/tutor/ElabTutorV4.jsx` — rafforzare content protection
- CSS vari — user-select: none su aree sensibili

### Metriche di successo
- Source maps: 0 file `.map` nel deploy
- DevTools: warning quando aperti, debugger bloccato
- Right-click: disabilitato su tutta l'app
- View-source: Ctrl+U bloccato
- Codice nel bundle: illeggibile (variabili hex, stringhe criptate, control flow appiattito)
- Nessun impatto su performance (<5% overhead runtime)
- Funzionalita app: IDENTICA (l'obfuscation non rompe nulla)

---

## ORDINE DI ESECUZIONE SUGGERITO

1. **Task 5 (Code Protection)** — obfuscation build + anti-DevTools (30 min, protegge tutto il resto)
2. **Task 4 (Whiteboard HD)** — fix veloce (15 min), impatto visivo immediato
3. **Task 2 (Performance)** — code-splitting + debounce ridotto (30 min)
4. **Task 1 (UI Minimal)** — refactoring tab + toolbar + chat (1-2h)
5. **Task 3 (Nanobot)** — setup Docker + primo tool (1-2h)

**Totale stimato**: ~5h di lavoro

---

## FILE CRITICI DA LEGGERE ALL'INIZIO SESSIONE

```
vite.config.js                               (42 righe — build config, QUI va obfuscation)
src/components/tutor/ElabTutorV4.jsx        (1204 righe — layout, state, chat)
src/components/tutor/TutorLayout.jsx         (layout wrapper, tab rendering)
src/components/tutor/ElabTutorV4.css         (stili responsive)
src/components/tutor/CanvasTab.jsx           (whiteboard tutor)
src/components/simulator/panels/WhiteboardOverlay.jsx (whiteboard simulatore)
src/components/simulator/NewElabSimulator.jsx (3125 righe — simulatore)
src/services/api.js                          (739 righe — backend Galileo)
```

---

## VINCOLI

- **Palette ELAB**: Navy #1E4D8C, Lime #7CB342, Vol1 #7CB342, Vol2 #E8941C, Vol3 #E54B3D
- **Font**: Oswald + Open Sans + Fira Code
- **Target**: bambini 8-14 anni → UI semplice, testi grandi (≥14px), touch target ≥44px
- **0 console.log** in produzione
- **Build < 1000KB** per ElabTutorV4 chunk
- **Deploy**: `npm run build && npx vercel --prod --yes`
- **Watermark**: Andrea Marro — DD/MM/YYYY

---

## STRINGA DI LANCIO (copia-incolla per avviare la sessione)

```
Sessione 41 — ELAB Tutor. Leggi PRODOTTO/elab-builder/sessioni/PROMPT-SESSIONE-41.md e MEMORY.md, poi esegui i 5 task in ordine:

1. **Code Protection** — obfuscare il codice con vite-plugin-javascript-obfuscator (stringhe RC4, control flow flattening, dead code injection, self-defending, debug protection), sourcemap: false, creare src/utils/codeProtection.js con anti-DevTools + anti-right-click + anti-F12 + anti-Ctrl+U (solo in produzione), CSS user-select:none su aree sensibili. Il codice DEVE essere illeggibile nei DevTools.
2. **Whiteboard HD** — fix devicePixelRatio in CanvasTab.jsx + WhiteboardOverlay.jsx (tratto pixelato su Retina)
3. **Performance** — code-split giochi con React.lazy, debounce bridge da 800→400ms, font preload, React.memo audit
4. **UI Minimal** — ridurre tab da 9 a max 5, toolbar simulatore pulita (kebab menu per avanzate), chat overlay 40vh su mobile, onboarding tooltip
5. **Nanobot** — Docker setup con nanobot v0.1.4.post1, primo MCP tool readCircuitState(), integrazione in api.js con fallback n8n

Vincoli: palette ELAB, font Oswald+OpenSans+FiraCode, target bambini 8-14, 0 console.log, build <1000KB, deploy Vercel. Chain of Verification dopo ogni task. Deploy finale. Il codice nel bundle deve essere COMPLETAMENTE illeggibile — variabili hex, stringhe criptate, debugger bloccato.
```

---

*Prompt generato — Session 40B, 24/02/2026*
