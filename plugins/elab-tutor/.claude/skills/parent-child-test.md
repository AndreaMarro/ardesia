# Skill: parent-child-test

## Scopo
Verifica che il sistema parent-child (S114) funzioni: componenti sulla breadboard seguono il suo drag, parentId preservato in customLayout, singolo componente si stacca, batteria non segue.

## COV Checklist (6 punti)

### Test 1: Load Experiment + Drag Breadboard (v1-cap6-esp1)
1. Carica esperimento "Accendi il primo LED" (v1-cap6-esp1)
2. Trascina la breadboard di ~50px a destra
3. **PASS se**: LED, resistore e fili seguono la breadboard senza salti

### Test 2: Load Experiment + Drag Breadboard (v1-cap6-esp2)
1. Carica esperimento v1-cap6-esp2
2. Trascina la breadboard di ~50px in basso
3. **PASS se**: tutti i componenti seguono senza salti o jitter

### Test 3: Load Experiment + Drag Breadboard (v1-cap7-esp1)
1. Carica esperimento v1-cap7-esp1 (altro capitolo)
2. Trascina la breadboard in alto-sinistra
3. **PASS se**: componenti seguono (conferma generalizzazione)

### Test 4: Drag Singolo Componente = Stacco
1. Con un esperimento caricato, trascina un singolo LED lontano dalla breadboard
2. Poi trascina la breadboard
3. **PASS se**: il LED NON segue la breadboard (si e' staccato)

### Test 5: Snap Componente su Breadboard = parentId Settato
1. Droppa un componente dalla palette sulla breadboard
2. Trascina la breadboard
3. **PASS se**: il componente segue (parentId settato da snap-on-drop)

### Test 6: Batteria NON Segue Breadboard
1. Con v1-cap6-esp1 caricato, trascina la breadboard
2. **PASS se**: la batteria 9V rimane nella sua posizione originale

## Meccanismo Tecnico
- **Load**: `inferParentFromPinAssignments()` setta parentId da pinAssignments
- **Drag**: `handleLayoutChange()` usa geometric bounding box detection per cascata
- **Drop su breadboard**: `computeAutoPinAssignment()` setta `parentId: bb.id` in customLayout
- **Drop fuori**: `parentId` rimosso da customLayout
- **parentId preservato**: customLayout mantiene parentId tramite spread in posUpdate

## File Coinvolti
- `src/components/simulator/NewElabSimulator.jsx` — handleLayoutChange geometric cascade
- `src/components/simulator/utils/parentChild.js` — inferParentFromPinAssignments
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — drag (cascade rimossa in S114)
- `src/components/simulator/utils/breadboardSnap.js` — snap-to-hole
