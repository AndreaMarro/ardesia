# G41 — SCRATCH PERFETTO + COMPILER POLISH

**Sprint G** — Sesta sessione
**Deadline PNRR**: 30/06/2026 (46 giorni)
**Score attuale**: 9.6/10 | Target G41: 9.6/10 (consolidamento)

---

## CONTESTO

### G40 — Voice + Offline
- Voice shortcuts diretti (play, stop, avanti)
- Auto-TTS toggle
- Offline caching intelligente
- Compiler retry con backoff

### Questa sessione: Scratch "impeccabile" (requisito Andrea)
Blockly e' integrato ma va verificato end-to-end su tutti i 6 esperimenti Vol3.

---

## FILE ESSENZIALI

| File | Perche' |
|------|---------|
| `src/components/simulator/panels/ScratchEditor.jsx` | Editor Blockly |
| `src/components/simulator/panels/scratchBlocks.js` | Definizioni blocchi Arduino |
| `src/components/simulator/panels/scratchGenerator.js` | Generatore C++ da blocchi |
| `src/components/simulator/panels/ScratchCompileBar.jsx` | Barra compilazione Scratch |
| `src/data/lesson-paths/v3-*.json` | 6 esperimenti Vol3 con scratchXml |
| `src/services/compiler.js` | Compilatore con fallback chain |
| `public/hex/` | 12 HEX pre-compilati |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: Verifica End-to-End Scratch per 6 Esperimenti Vol3 (2h)

**Cosa fare** (test manuale in browser):
Per OGNUNO dei 6 esperimenti Vol3:
1. Caricare esperimento in modalita' Scratch
2. Verificare che i blocchi pre-definiti si carichino correttamente
3. Generare codice C++ dai blocchi (visualizzare nell'editor)
4. Compilare (pre-compiled HEX dovrebbe matchare)
5. Avviare simulazione
6. Verificare che la simulazione risponda correttamente

Documentare ogni risultato: PASS/FAIL/PARTIAL con screenshot.

Esperimenti da testare:
- v3-cap6-semaforo (LED RGB con delay)
- v3-cap7-mini (pulsante + LED)
- v3-cap8-serial (Serial.println)
- v3-extra-lcd (LCD 16x2 Hello)
- v3-extra-servo (Servo sweep)
- v3-extra-simon (Simon Says game)

### Task 3: Fix Blocchi Mancanti o Rotti (1.5h)

Basandosi sui risultati del Task 2, fixare:
1. Blocchi che generano codice C++ sbagliato
2. Workspace XML che non si carica
3. Blocchi custom che mancano nel toolbox
4. Generatore che produce codice non compilabile

### Task 4: Scratch UX su LIM (1h)

**Cosa fare**:
1. Testare Scratch a 1024x768 (risoluzione LIM)
2. Verificare che i blocchi siano abbastanza grandi da toccare (min 44px height)
3. Verificare drag-and-drop con touch (gia' `touch-action: none` nel CSS)
4. Se il toolbox e' troppo stretto su LIM, allargarlo
5. Colori blocchi: verificare contrasto su proiettore (colori chiari = invisibili su proiettore)

### Task 5: AUDIT FINALE
### Task 6: Handoff + Prompt G42

---

## DELIVERABLE ATTESI G41

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | 6/6 esperimenti Scratch testati | Tutti caricano + compilano + simulano |
| 2 | Fix blocchi rotti | Ogni fix con test specifico |
| 3 | Scratch su LIM | Touch-friendly, leggibile su proiettore |
| 4 | Score >= 9.6 | Consolidamento simulatore |
