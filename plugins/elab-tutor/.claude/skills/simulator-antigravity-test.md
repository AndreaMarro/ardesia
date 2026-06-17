# Skill: simulator-antigravity-test

## Scopo
Verifica che il sistema "antigravity" (parent-child) funzioni correttamente: i componenti sulla breadboard devono muoversi con essa.

## COV Checklist (7 punti)

### Test 1: Palette Drop → parentId
1. Apri il simulatore in modalita' "Libero"
2. Aggiungi una breadboard (se non presente)
3. Droppa un LED dalla palette sulla breadboard
4. Verifica: `window.__ELAB_API.getCircuitState().components` deve mostrare il LED con `parentId` uguale all'ID della breadboard

### Test 2: Breadboard Move → Componente Segue
1. Con il LED sulla breadboard dal Test 1
2. Trascina la breadboard in una nuova posizione
3. Verifica: il LED si e' mosso della stessa distanza della breadboard

### Test 3: Drop Fuori Breadboard → No parentId
1. Droppa un resistore in un'area vuota del canvas (lontano dalla breadboard)
2. Verifica: il resistore NON ha `parentId` nel layout

### Test 4: Esperimento "Gia Montato" → parentId Inferito
1. Carica un esperimento in modalita' "Gia Montato" (es. v1-cap6-esp1)
2. Verifica: tutti i componenti che hanno pin sulla breadboard hanno `parentId`
3. Usa: `window.__ELAB_API.getCircuitState()` per ispezionare

### Test 5: Undo dopo Drop
1. Droppa un componente sulla breadboard
2. Premi Ctrl+Z (undo)
3. Verifica: il componente e' stato rimosso, nessun errore in console

### Test 6: Galileo AI → parentId
1. Scrivi a Galileo: "aggiungi un LED al circuito"
2. Verifica: se il LED viene posizionato sulla breadboard, ha parentId

### Test 7: Build
1. `npm run build`
2. Verifica: 0 errori, 0 warning critici

## Come Eseguire
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build
# Poi testa manualmente nel browser o via Claude Preview MCP
```

## File Coinvolti
- `src/components/simulator/NewElabSimulator.jsx` (handleComponentAdd, handleLayoutChange)
- `src/components/simulator/utils/parentChild.js` (getChildComponents, inferParentFromPinAssignments)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (breadboard drag propagation)
