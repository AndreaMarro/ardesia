# Session 114 Report — Parent-Child Attachment

**Data**: 10/03/2026
**Commit**: `8a5a2ab`
**Deploy**: https://www.elabtutor.school

## Problema
Quando si trascinava la breadboard, i componenti inseriti nei suoi fori NON seguivano il movimento. Si "staccavano" e rimanevano nella posizione originale.

## Root Cause
**Double-cascade bug**: due sistemi concorrenti di movimento figli attivi contemporaneamente.

| Meccanismo | File | Metodo |
|-----------|------|--------|
| A (rimosso) | SimulatorCanvas.jsx | parentId-based: `getChildComponents()` in handlePointerMove |
| B (mantenuto) | NewElabSimulator.jsx | geometric bounding box detection in handleLayoutChange |

Entrambi scattavano sullo stesso frame di drag → figli si muovevano 2x il delta. Dopo il primo frame, il `parentId` veniva perso nel customLayout (shallow merge `{x, y}` senza parentId), Mechanism A smetteva di funzionare, ma i figli avevano già "superato" il bounding box geometrico.

## Fix Applicati

### SimulatorCanvas.jsx (-47 righe)
1. **Rimosso** Mechanism A cascade in `handlePointerMove` (righe 1266-1287)
2. **Rimosso** duplicate child commit in `handlePointerUp` (2 blocchi)
3. **Rimosso** import inutilizzato `getChildComponents`

### NewElabSimulator.jsx (+16 righe)
4. **Preserve parentId** in path non-container di `handleLayoutChange`
5. **Preserve parentId** nel batch update cascade per container
6. **Remove parentId** quando componente droppato fuori dalla breadboard

## COV 6/6 PASS

| # | Test | Risultato |
|---|------|-----------|
| 1 | v1-cap6-esp1 drag bb +50px | r1,led1 dx=50 ✅ bat1 dx=0 ✅ |
| 2 | v1-cap6-esp2 drag bb +30,+50 | led1 segue ✅ bat1 fermo ✅ |
| 3 | v1-cap7-esp1 drag bb -20,-30 | r1,rgb1 seguono ✅ bat1 fermo ✅ |
| 4 | Drag singolo → stacco | parentId null, non segue bb ✅ |
| 5 | Snap su bb → parentId set | parentId "bb1" ripristinato, segue ✅ |
| 6 | Batteria NON segue | dx=0, dy=0, no parentId ✅ |

## Regressioni: 0
- S112 snap-to-hole: pinAssignments corretti ✅
- S113 battery wires: 6 connections, red+black presenti ✅
- S114 parentId: r1+led1 → bb1, bat1 → null ✅

## Build
- 0 errori
- Main chunk: 303 KB gzip
- ScratchEditor: 903 KB gzip (lazy-loaded)

## Skill Creata
`.claude/skills/parent-child-test.md` — 6 test COV riutilizzabili

## Meccanismo Finale (Single Source of Truth)
1. **Load**: `inferParentFromPinAssignments()` setta parentId da pinAssignments
2. **Drag breadboard**: `handleLayoutChange()` geometric cascade (bounding box + MARGIN 10px)
3. **Drop su breadboard**: `computeAutoPinAssignment()` setta parentId in customLayout
4. **Drop fuori**: parentId rimosso da customLayout
5. **parentId preservato**: spread in posUpdate mantiene parentId attraverso gli aggiornamenti
