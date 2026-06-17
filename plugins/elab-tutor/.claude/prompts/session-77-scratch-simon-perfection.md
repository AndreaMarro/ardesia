# Session 77 — Scratch + Simon Perfection

## Activation String
```
Continua il lavoro della Session 76. Attiva il prompt: session-77-scratch-simon-perfection.md
```

## Context
Session 76 ha implementato:
1. **Simon Sounds** via Web Audio (4 frequenze classiche: 262/330/392/523 Hz) legati allo stato LED in `componentStates`
2. **Scratch pre-caricato** in "Già Montato" (fallback `experiment.scratchXml`)
3. **Scratch progressivo** in "Passo Passo" (4 checkpoint: step 4, 16, 28, 30)
4. **Blocco `arduino_random`** in scratchBlocks.js + generator + toolbox
5. **ScratchEditor reload** su `initialCode` change (per Passo Passo)

Deploy: https://www.elabtutor.school — Build 0 errori.

## What Needs Testing & Fixing

### FASE 1: Test Funzionale Simon (Chrome manuale)
1. Login → Vol3 → Extra → Simon Game → "Già Montato"
2. Verificare che l'editor Scratch si apre con workspace COMPLETO (tutti i blocchi visibili)
3. Premere ▶ → verificare che i LED lampeggiano E che si sentono SUONI DISTINTI per ogni colore
4. Se non si sentono suoni: controllare `componentStates` nel console.log per verificare che `led1/led2/led3/led4` hanno `on: true/false`
5. "Passo Passo" → verificare transizioni Scratch:
   - Step 1-3: workspace vuoto (solo arduino_base)
   - Step 4: blink LED rosso (1 pinMode + digitalwrite)
   - Step 16: 4 LED + random
   - Step 28: pulsanti + serial
   - Step 30: workspace completo
6. "Libero" → editor vuoto

### FASE 2: Scratch Universale (P0 from Session 75 audit)
Il gate `simulationMode === 'avr'` impedisce l'editor Scratch su Vol1/Vol2.
Opzioni:
- A) Rimuovere il gate → Scratch disponibile ovunque (anche senza AVR)
- B) Aggiungere un flag `hasScratch: true` sugli esperimenti che lo supportano
- C) Lasciare solo Vol3 (attuale)

Decisione necessaria dall'utente.

### FASE 3: Galileo + Scratch Integration (P0)
Nanobot attualmente NON sa che Scratch esiste. Serve:
1. Aggiungere action tags: `openeditor`, `closeeditor`, `switcheditor:scratch`, `switcheditor:arduino`, `loadblocks`
2. Aggiungere knowledge di Scratch in nanobot.yml (cos'è, come funziona, quando suggerirlo)
3. Galileo dovrebbe poter suggerire "prova a costruire il circuito con i blocchi Scratch" quando appropriato
4. Action handler in ElabTutorV4.jsx per i nuovi tag

### FASE 4: Scratch XML per ALTRI esperimenti
Se il gate viene rimosso (FASE 2), servono `scratchXml` per gli esperimenti più popolari:
- Vol1: LED blink, LED + pulsante, semaforo
- Vol2: potenziometro + LED, sensore luce, motore DC
- Vol3: tutti i 13 esperimenti (attualmente solo Simon ha scratchXml)

### FASE 5: Estetica (from Session 75 audit score 5/10)
- 150+ colori hardcoded → design tokens
- Palette ELAB non rispettata in molti componenti
- iPad layout rotto (P0 da Session 75)

## Key Files
- `src/components/simulator/NewElabSimulator.jsx` — Simon sounds (linee 1036-1093), Scratch load (1551-1552), Passo Passo sync (293-309)
- `src/data/experiments-vol3.js` — Simon scratchXml (linee 43-310), buildSteps con scratchXml
- `src/components/simulator/panels/ScratchEditor.jsx` — Blockly workspace, ELAB theme, toolbox XML, reload logic
- `src/components/simulator/panels/scratchBlocks.js` — Custom Arduino block definitions
- `src/components/simulator/panels/scratchGenerator.js` — C++ code generators

## Scores After Session 76
| Area | Score | Delta |
|------|-------|-------|
| Scratch Universale | **5.5/10** | +1.5 (was 4.0 — Simon now has full Scratch, still Vol3-only gate) |
| Simon Game | **8.5/10** | New (sounds + scratch, needs Chrome verification) |
| AI Integration | **10.0/10** | Unchanged (Galileo-Scratch gap is P0 for next session) |
| Overall | **~8.1/10** | +0.1 |
