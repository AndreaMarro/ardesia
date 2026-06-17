# Session 109 Report — Fix Antigravity ParentId

**Data**: 10/03/2026
**Autore**: Andrea Marro + Claude
**Commit**: `52c3671` — "S109: Fix antigravity parentId on palette drop"

## Problema
Quando un componente viene droppato dalla palette sulla breadboard tramite `handleComponentAdd()`, il layout veniva settato come `{ x, y }` **senza `parentId`**. Conseguenza: muovendo la breadboard, quei componenti restavano fermi (si "staccavano").

Il percorso drag-move (`handleLayoutChange` a riga ~2858) settava correttamente `parentId: bb.id`, creando un'asimmetria tra i due path di aggiunta componenti.

## Root Cause
`NewElabSimulator.jsx` riga 3053 (prima del fix):
```javascript
[id]: { x: finalX, y: finalY },  // Mancava parentId
```

## Fix Applicato
1. Aggiunta variabile `let snappedBbId = null;` (riga 3032)
2. Cattura `snappedBbId = bb.id;` nel loop breadboards (riga 3046)
3. Spread condizionale nel layout: `...(snappedBbId ? { parentId: snappedBbId } : {})` (riga 3058)

## COV Results

| # | Test | Risultato | Note |
|---|------|-----------|------|
| 1 | Drop LED palette su BB → parentId | PASS (code verified) | `snappedBbId = bb.id` catturato nel loop |
| 2 | Muovi BB → LED segue | PASS (logic verified) | `getChildComponents()` trova figli via parentId |
| 3 | Drop LED fuori BB → no parentId | PASS (code verified) | `snappedBbId` resta null, spread vuoto |
| 4 | "Gia Montato" → parentId inferito | PASS (existing) | `inferParentFromPinAssignments()` a riga 1795 |
| 5 | Undo dopo drop | PASS (logic verified) | `pushSnapshot()` prima del drop, undo ripristina |
| 6 | Galileo AI addcomponent → parentId | PASS (code verified) | Stessa `handleComponentAdd()` usata da AI |
| 7 | npm run build → 0 errori | PASS | Build OK in 1m 25s |

## File Modificati
- `src/components/simulator/NewElabSimulator.jsx` — 3 righe aggiunte (3032, 3046, 3058)

## Deliverables
- [x] Fix applicato
- [x] Skill creata: `.claude/skills/simulator-antigravity-test.md`
- [x] Build: 0 errori
- [x] Deploy: Vercel production
- [x] GitHub: commit `52c3671` pushed
- [x] Report scritto

## Prossima Sessione
**Session 110 — Fix Battery Wire Routing** (vedi prompt nel piano)
