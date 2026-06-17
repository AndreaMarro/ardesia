# Simulatore Perfetto — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Portare il simulatore ELAB a parità totale con i libri fisici, Galileo pienamente integrato, testing continuo con Claude in Chrome.

**Architecture:** 4 loop Ralph sequenziali, ognuno con una `<promise>` misurabile. Ogni loop termina solo dopo verifica visiva interattiva in Chrome. Serena per modifiche chirurgiche al codice, claude-mem cattura ogni osservazione.

**Tech Stack:** React 18 + Vite, SVG JSX components, CircuitSolver v4 (MNA), AVR8js, CodeMirror 6, Vercel deploy

---

## Contesto Critico

**File principali:**
- `src/components/simulator/NewElabSimulator.jsx` — shell principale (~2900 righe)
- `src/components/simulator/panels/ExperimentPicker.jsx` — selezione esperimenti + volumi
- `src/components/simulator/panels/ComponentPalette.jsx` — palette componenti con `volumeFilter`
- `src/components/simulator/panels/BuildModeGuide.jsx` — UI passo-passo
- `src/components/simulator/panels/GalileoResponsePanel.jsx` — risposta Galileo
- `src/components/tutor/ElabTutorV4.jsx` — container Galileo + simulator
- `src/data/experiments-index.js` — 69 esperimenti (Vol1: 38, Vol2: 18, Vol3: 13)

**Stato attuale (da MEMORY.md S38):**
- 21 SVG componenti: ✅ tutti Tinkercad-redesigned, 0 glow, 0 filter
- 69 esperimenti: ✅ CoV completa S34/S35, 10 gap wiring bug fixati
- Build modes: ⚠️ implementati ma MAI testati in browser reale
- Volume gating: `volumeFilter` prop in ComponentPalette (0=all, 1/2/3=cumulative)
- Galileo: solo `title + desc + concept`, manca circuitState + stepContext

**Build modes (`buildMode` field):**
- `false` = Già Montato (completo, buildStepIndex=Infinity, tutto visibile)
- `'guided'` = Passo Passo (buildStepIndex parte da -1, avanza con Next)
- `'sandbox'` = Esplora Libero (canvas vuoto, wireMode=true, drag free)

**Regole IMMUTABILI:**
- Pin positions in SVG non si toccano mai (solver-safe)
- 0 glow/shadow/filter nei SVG
- CoV obbligatoria per ogni modifica agli esperimenti
- Build sempre 0 errori prima di deploy

---

## LOOP 1 — Build Modes (Target: 10/10)

### Task 1: Avvia dev server e apri Chrome

**Step 1: Avvia preview server**
```bash
# Usa il tool preview_start con name "elab-builder-dev"
# Poi verifica su http://localhost:5173
```

**Step 2: Monta mock auth in localStorage**
```javascript
// In preview_eval:
localStorage.setItem('elab_user', JSON.stringify({
  email: 'student@elab.test',
  role: 'student',
  token: 'mock-token-session39',
  userKits: ['ELAB-BUNDLE-ALL'],
  licenseVolume: 3
}));
window.location.reload();
```

**Step 3: Screenshot iniziale**
- Usa `preview_screenshot` per proof dello stato iniziale

---

### Task 2: Test "Già Montato" (buildMode=false)

**Step 1: Naviga al simulatore**
```javascript
// In preview_eval — forza navigazione a simulatore
window.location.hash = '#/tutor';
// oppure
window.location.href = 'http://localhost:5173/#/tutor';
```

**Step 2: Testa con Claude in Chrome**
- Apri `http://localhost:5173` in Chrome via `tabs_context_mcp`
- Seleziona esperimento `v1-cap6-esp1` (LED rosso + resistore)
- Verifica che in modalità "Già Montato" tutti i componenti appaiano
- Screenshot con `browser_take_screenshot`

**Step 3: Verifica posizioni**
Componenti attesi per `v1-cap6-esp1`:
- BreadboardHalf in posizione centrale
- Battery9V a sinistra
- LED rosso nel foro corretto del libro
- Resistore nel foro corretto

Se qualcosa è fuori posto → leggi `src/data/vol1/cap6.js` e confronta con PDF Vol1 Cap6

**Step 4: Fix se necessario**
Usa Serena `replace_symbol_body` per modifiche chirurgiche

---

### Task 3: Test "Passo Passo" (buildMode='guided')

**Step 1: Seleziona modalità Passo Passo**
- In Chrome: click sul pulsante "Passo Passo" in ControlBar
- Verifica che canvas sia vuoto (buildStepIndex=-1)

**Step 2: Avanza step by step**
- Click "Avanti" → deve apparire PRIMO componente nella posizione FINALE del libro
- Click "Avanti" → secondo componente
- ... fino alla fine

**Step 3: Verifica BuildModeGuide**
```javascript
// Cerca bug in BuildModeGuide.jsx:
// File: src/components/simulator/panels/BuildModeGuide.jsx
// Cerca: onNext, onPrev, currentStep, totalSteps
```

**Step 4: Verifica che buildStepIndex avanzi correttamente**
```javascript
// In NewElabSimulator.jsx, la logica è:
// buildStepIndex: -1 → 0 → 1 → ... → steps.length-1
// mergedExperiment include solo componenti degli step 0..buildStepIndex
// Line ~593: for (let i = 0; i <= buildStepIndex; i++) {...}
```

**Step 5: Screenshot proof step 0, step 1, step finale**

---

### Task 4: Test "Esplora Libero" (buildMode='sandbox')

**Step 1: Seleziona Esplora Libero**
- Canvas deve essere vuoto, nessun componente
- wireMode deve essere true (fili disegnabili)
- ComponentPalette deve essere visibile

**Step 2: Testa drag & drop**
- In Chrome: trascina un LED dalla palette alla breadboard
- Verifica snapping al foro corretto

**Step 3: Fix se snapping non funziona**
```javascript
// File: src/components/simulator/NewElabSimulator.jsx
// Funzione: handleDragEnd (cerca "snapToGrid")
// Line ~1836: if (mergedExperiment && comp && !isContainer && !noSnapTypes.includes(comp.type))
// Verifica logica breadboard snap
```

---

### Task 5: Commit Loop 1

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add -A
git commit -m "fix: build modes verified and fixed - Già Montato/Passo Passo/Esplora Libero

Session 39 Loop 1: tested all 3 build modes in Chrome.
[lista fix se trovati]

<promise>BUILD_MODES_VERIFIED</promise>"
```

**Deploy:**
```bash
npm run build && npx vercel --prod --yes
```

---

## LOOP 2 — Volume Gating + Drag & Drop (Target: 10/10)

### Task 6: Verifica volume filtering in ComponentPalette

**Contesto:**
- `ComponentPalette` prop: `volumeFilter` (0=all, 1/2/3)
- Logica a line 108: `if (volumeFilter > 0 && item.volumeAvailableFrom > volumeFilter) return false`
- Vol2 cumula Vol1+Vol2: se filter=2, passano items con `volumeAvailableFrom` ≤ 2

**Step 1: Test in Chrome**
- Seleziona "Volume 1" in ExperimentPicker
- Verifica che ComponentPalette mostri SOLO componenti Vol1
- Lista attesa: BreadboardHalf, Battery9V, Led, Resistor, PushButton, Potentiometer, BuzzerPiezo, PhotoResistor

**Step 2: Test Vol2**
- Seleziona "Volume 2"
- Deve mostrare tutto Vol1 + MotorDC, Capacitor, Diode, RgbLed

**Step 3: Verifica prop passata**
```javascript
// In NewElabSimulator.jsx, cerca dove ComponentPalette viene renderizzata
// Verifica che selectedVolume sia passato come volumeFilter
// Pattern atteso: <ComponentPalette volumeFilter={selectedVolume} ... />
```

**Step 4: Fix se prop mancante**
- Usa Serena `find_symbol` per trovare il render di ComponentPalette
- Verifica che `selectedVolume` state sia propagato

---

### Task 7: Audit drag & drop precision

**Step 1: Testa snapping breadboard**
- In Chrome, Esplora Libero mode
- Trascina LED dalla palette
- Il LED deve "snappare" al foro più vicino
- Verifica che i fori evidenziati siano corretti

**Step 2: Testa wire drawing**
- Click su pin del LED → drag → pin del resistore
- Wire deve essere disegnato con colore corretto
- Colore auto: `getAutoWireColor` (line ~importata)

**Step 3: Testa move di componente esistente**
- Sposta LED già piazzato su altro foro
- Le connessioni devono seguire il componente

**Step 4: Fix problemi trovati**
File: `src/components/simulator/canvas/SimulatorCanvas.jsx`
- Cerca: `onDragEnd`, `onWireStart`, `onWireEnd`

---

### Task 8: Commit Loop 2

```bash
git commit -m "fix: volume gating + drag-drop verified and fixed

Session 39 Loop 2: volume filtering correct, drag-drop snapping verified.
Vol1: 8 components, Vol2 cumulative, Vol3 all.

<promise>VOLUME_DRAGDROP_VERIFIED</promise>"
```

---

## LOOP 3 — Galileo ↔ Simulator Full Integration (Target: 10/10)

### Task 9: Analisi contesto Galileo attuale

**Stato attuale** (da `NewElabSimulator.jsx` line ~1683):
```javascript
const galileoPrompt = mergedExperiment.galileoPrompt ||
  `Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento "${mergedExperiment.title}". ` +
  `Descrizione: ${mergedExperiment.desc || 'N/A'}. ` +
  `Concetti chiave: ${mergedExperiment.concept || 'N/A'}. `;
```

**Cosa manca:**
1. Stato circuito live (LED acceso? corrente? tensione?)
2. Modalità corrente (Già Montato / Passo Passo step X / Esplora Libero)
3. Step corrente in Passo Passo (cosa sta facendo lo studente)
4. Errori rilevati (LED non si accende perché...)
5. Contesto quiz (ultima domanda + risposta studente)

---

### Task 10: Aggiungi circuitState al prompt Galileo

**File:** `src/components/simulator/NewElabSimulator.jsx`
**Funzione:** `handleAskGalileo` (line ~1672)

**Step 1: Leggi la funzione completa**
```javascript
// Serena: read_file lines 1672-1745
```

**Step 2: Costruisci circuitStateText**
```javascript
// Dopo la riga: const galileoPrompt = mergedExperiment.galileoPrompt || ...
// Aggiungi PRIMA della costruzione del prompt:

// --- Circuit state context ---
const ledStates = (mergedExperiment.components || [])
  .filter(c => c.type === 'led' || c.type === 'rgb-led')
  .map(c => {
    const state = componentStates[c.id] || {};
    const isOn = state.brightness > 0 || state.glowing;
    return `${c.id}: ${isOn ? 'ACCESO' : 'spento'}`;
  }).join(', ');

const buildModeText = !currentExperiment.buildMode
  ? 'Già Montato (circuito completo)'
  : currentExperiment.buildMode === 'guided'
    ? `Passo Passo (step ${buildStepIndex + 1} di ${mergedExperiment.buildSteps?.length || '?'})`
    : 'Esplora Libero (canvas libero)';

const currentStepText = currentExperiment.buildMode === 'guided' && buildStepIndex >= 0
  ? `Step corrente: ${mergedExperiment.buildSteps?.[buildStepIndex]?.label || 'N/A'}`
  : '';

const circuitContextAddition =
  `\nModalità: ${buildModeText}. ` +
  (ledStates ? `\nStato LED: ${ledStates}. ` : '') +
  (currentStepText ? `\n${currentStepText}. ` : '') +
  `\nSe il circuito non funziona, aiuta lo studente a capire il problema step by step.`;
```

**Step 3: Aggiungi al prompt base**
```javascript
// Modifica la costruzione del prompt finale:
const finalPrompt = (mergedExperiment.galileoPrompt ||
  `Sei Galileo, il tutor AI di ELAB. ...`) + circuitContextAddition;

// Poi usa finalPrompt invece di galileoPrompt nella chiamata API
```

**Step 4: Test in Chrome**
- Monta circuito rotto (LED senza resistore)
- Clicca "Chiedi a Galileo"
- Galileo deve rispondere con diagnosi specifica (cortocircuito, LED a rischio)

---

### Task 11: Integra Galileo con ElabTutorV4 (chat sidebar)

**Contesto:** ElabTutorV4 usa sia ChatOverlay (Galileo chat) che il simulatore embedded
**File:** `src/components/tutor/ElabTutorV4.jsx`

**Step 1: Trova dove il simulatore espone il suo stato**
```javascript
// Cerca: onExperimentChange, simulatorRef, registerSimulatorInstance
// In ElabTutorV4.jsx cerca: useRef, simulator, experiment
```

**Step 2: Passa experiment context alla chat Galileo**
```javascript
// In ElabTutorV4.jsx:
// Aggiungi state: const [currentSimulatorExperiment, setCurrentSimulatorExperiment] = useState(null);
// Passa callback al simulatore: onExperimentChange={setCurrentSimulatorExperiment}
// Usa in buildSystemMessage(): includi experiment info nel system prompt di Galileo
```

**Step 3: Aggiorna buildSystemMessage o equivalente**
```javascript
// Cerca in ElabTutorV4.jsx: systemMessage, buildSystemMessage, SYSTEM_PROMPT
// Aggiungi contesto esperimento se disponibile:
const experimentContext = currentSimulatorExperiment
  ? `\n\nL'utente sta lavorando sull'esperimento: "${currentSimulatorExperiment.title}" ` +
    `(${currentSimulatorExperiment.id}). Capitolo: ${currentSimulatorExperiment.chapter}.`
  : '';
```

**Step 4: Test integrazione**
- In Chrome: apri simulatore, seleziona esperimento, poi apri chat Galileo
- Scrivi: "Non funziona, perché?"
- Galileo deve rispondere sapendo QUALE esperimento è caricato

---

### Task 12: Commit Loop 3

```bash
git commit -m "feat: Galileo full context integration - circuit state + step + experiment

Session 39 Loop 3: Galileo ora vede circuitState (LED on/off), buildMode,
step corrente, experiment title/desc. Chat sidebar sincronizzata.

<promise>GALILEO_INTEGRATED</promise>"
```

---

## LOOP 4 — Polish Finale + Deploy (Target: 10/10)

### Task 13: Quality audit rapido

**Step 1: Usa quality-audit skill**
- Verifica: 0 console.log in prod, font sizes ≥14px, touch targets ≥44px
- Build size: verifica chunk sizes

**Step 2: Build check**
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build 2>&1
# Expected: 0 errors, 0 warnings
```

---

### Task 14: Screenshot proof completo

**Step 1: Screenshot Vol1 esperimento completo**
- Chrome: carica `v1-cap6-esp1`, modo "Già Montato"
- Screenshot → `screenshots/S39-vol1-gia-montato.png`

**Step 2: Screenshot Passo Passo**
- Chrome: `v1-cap6-esp1`, modo "Passo Passo", step 3
- Screenshot → `screenshots/S39-passo-passo-step3.png`

**Step 3: Screenshot Galileo in context**
- Chrome: circuito montato, Galileo risponde
- Screenshot → `screenshots/S39-galileo-context.png`

**Step 4: Screenshot Vol2 esperimento**
- Chrome: carica `v2-cap7-esp2`, modo "Già Montato"
- Screenshot → `screenshots/S39-vol2-gia-montato.png`

---

### Task 15: Deploy finale + commit

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build && npx vercel --prod --yes
```

**Commit finale:**
```bash
git add -A
git commit -m "feat: Simulatore Perfetto S39 - build modes + volume gating + Galileo

ELAB Simulator S39 complete:
- Loop 1: Build modes verified in Chrome (Già Montato/Passo Passo/Esplora Libero)
- Loop 2: Volume gating + drag-drop audited and fixed
- Loop 3: Galileo full context (circuitState + step + experiment)
- Loop 4: Build 0 errors, deployed to Vercel

Score target: 10/10 across all areas.

<promise>SIMULATORE_COMPLETO</promise>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Checklist Finale

- [ ] Loop 1: Già Montato funziona per v1-cap6-esp1 ✓
- [ ] Loop 1: Passo Passo step-by-step funziona ✓
- [ ] Loop 1: Esplora Libero canvas vuoto + drag ✓
- [ ] Loop 2: Vol1 mostra solo 8 componenti ✓
- [ ] Loop 2: Vol2 mostra Vol1+Vol2 cumulativi ✓
- [ ] Loop 2: Drag snapping preciso sulla breadboard ✓
- [ ] Loop 3: Galileo vede LED on/off nel prompt ✓
- [ ] Loop 3: Galileo vede buildMode + step corrente ✓
- [ ] Loop 3: Chat sidebar sa quale esperimento è caricato ✓
- [ ] Loop 4: Build 0 errori ✓
- [ ] Loop 4: 4 screenshot proof ✓
- [ ] Loop 4: Deploy Vercel confermato ✓

---

*Piano generato da superpowers:writing-plans — S39 — 22/02/2026*
