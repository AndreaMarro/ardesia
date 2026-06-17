# LAVAGNA PERSISTENCE — Investigation iter 25 (caveman onesto)

**Date**: 2026-04-29
**Mandato**: Andrea iter 19 PM — "Bug: lavagna disegni spariscono quando esci sessione. Persistenza violata. Principio: contenuto sparisce SOLO con cancellazione esplicita."
**Conferma Tea**: iter 24 — "presenta bug nel salvataggio dei disegni in uscita"

## TL;DR

Bug REALE confermato statico (senza esecuzione). Causa principale: **bucket-mismatch su switch experimentId** in `DrawingOverlay.jsx`. Drawing NON viene cancellato — viene scritto in un bucket localStorage (`elab-drawing-paths` o `elab-drawing-<id>`) e poi caricato da un bucket diverso quando l'utente rientra. Sembra "sparito" ma e' lì.

NO Supabase sync: il canvas e' 100% local-only. Tab close mantiene dato (localStorage persiste). Exit→Tutor→re-entry NON cancella localStorage MA puo' cambiare l'expId attivo → bucket diverso → apparente perdita.

## DUE canvas distinti — non uno solo

Confusione presente nel codebase. Due overlay drawing differenti, scopi diversi, **chiavi storage diverse**:

| Componente | File | Storage prefix | Chiave |
|---|---|---|---|
| `DrawingOverlay` (SVG, Lavagna penna) | `src/components/simulator/canvas/DrawingOverlay.jsx` | `elab-drawing-` | `elab-drawing-<expId>` o `elab-drawing-paths` |
| `WhiteboardOverlay` (canvas raster + vector) | `src/components/simulator/panels/WhiteboardOverlay.jsx` | `elab_wb_` | `elab_wb_<expId>` o `elab_wb_sandbox` |

Documentazione: `src/utils/drawingStorage.js:12-13` esplicita la separazione.

Tea molto probabilmente parla del **DrawingOverlay** (penna LIM, freehand SVG). E' quello mostrato di default tramite `__ELAB_API.toggleDrawing` e bottone penna. E' il piu' usato.

## Save behaviour ATTUALE (DrawingOverlay)

**File**: `src/components/simulator/canvas/DrawingOverlay.jsx`

- **Mount load**: linea 85 `useState(() => loadDrawingPaths(experimentId))` — primo load.
- **Re-load su expId change**: linee 103-108 `useEffect([experimentId])` — ricarica paths del nuovo expId, **resetta undo/redo**.
- **Save on stroke end**: linea 154 `saveDrawingPaths(updatedPaths, experimentId)` — debounce: NESSUNO. Save sincrono al pointer-up di ogni tratto.
- **Save on undo/redo/clear**: linee 164/173/183 — sincrono.
- **Save on close (`Esci` + `ESC`)**: linee 196-207 `handleClose` — flush corrente stroke se in-progress, poi `onClose()`. **Save fatto**.
- **Save on unmount**: NO useEffect cleanup. Affidato a save-su-ogni-stroke.
- **Supabase sync**: ZERO. `grep -rn supabase` su DrawingOverlay = 0 hit.

## WhiteboardOverlay (per completezza)

**File**: `src/components/simulator/panels/WhiteboardOverlay.jsx`

- Save ad ogni endDraw (linea 660) + auto-save 5s mentre attivo (linee 457-463).
- Chiave fallback `elab_wb_sandbox` se expId null (linee 363, 396).
- Storage cap 10 entries / 500KB (linee 399-451).
- Stesso pattern: NO Supabase sync.

## Failure point identificato

### Bug 1 — Bucket mismatch su null→id transition

**Scenario**:
1. Utente apre Lavagna, NON carica esperimento (expId = `null`).
2. Attiva penna, disegna. → Save su `elab-drawing-paths` (DEFAULT_SUFFIX, `drawingStorage.js:17,22`).
3. Apre picker, sceglie esperimento v1-cap6-esp1. `handleExperimentSelect` (`LavagnaShell.jsx:657`) chiama `api.loadExperiment(exp.id)`.
4. `currentExperiment` aggiornato in NewElabSimulator → `experimentId` prop al DrawingOverlay cambia da `null` a `'v1-cap6-esp1'`.
5. **`DrawingOverlay.jsx:103-108`** firea: `setPaths(loadDrawingPaths('v1-cap6-esp1'))` → bucket nuovo, paths vuoti.
6. **Disegno sparisce dalla vista** (e' ancora in `elab-drawing-paths` ma orfano e invisibile).

### Bug 2 — Exit→re-entry hash route (Tea segnalazione PRINCIPALE)

**Scenario**:
1. Utente in Lavagna con expId attivo, disegna su `elab-drawing-<expId>`. → Save OK.
2. Click "Esci/Menu" → `handleMenuOpen` (`LavagnaShell.jsx:648-652`) imposta `window.location.hash = '#tutor'` → unmount Lavagna.
3. Utente rientra in Lavagna (`#lavagna`). Lavagna remontata.
4. **`currentExperiment` parte `null`** in NewElabSimulator (linea 121).
5. DrawingOverlay monta con `experimentId={null}` → `loadDrawingPaths(null)` → bucket `elab-drawing-paths`.
6. Se utente NON ricarica subito quel preciso esperimento, vede vuoto/altro contenuto.
7. **Lo state CIRCUITO** sopravvive solo se `useCircuitStorage(currentExperiment?.id)` ha bucket per quell'expId — ma su null start non c'e' auto-load.

### Bug 3 — Supabase silent absence

NO sync server-side. Se localStorage viene clearato (browser update, quota, incognito), TUTTO il disegno e' perso. Mandato Andrea "persistenza violata" e' coerente con questa lacuna se docente cambia browser/dispositivo per la stessa session classe.

## Anti-pattern presente

`DrawingOverlay.jsx:103-108` resetta paths senza **conservare lo stato precedente** in caso di transizione `null → expId`. Comportamento corretto: se utente disegna in sandbox (`null`) e poi carica esperimento, dovrebbe MIGRARE i paths verso il bucket dell'esperimento (con conferma utente o automaticamente per "primo disegno della sessione").

## Mandate Andrea — "contenuto sparisce SOLO con cancellazione esplicita"

VIOLATO. Bucket-switch e' cancellazione implicita dal POV utente. Soluzione: vedere fix design doc `2026-04-29-iter-25-LAVAGNA-PERSISTENCE-fix-design.md`.

## Cite file:line

- `src/components/simulator/canvas/DrawingOverlay.jsx:85` — useState load mount
- `src/components/simulator/canvas/DrawingOverlay.jsx:103-108` — useEffect expId switch (BUG 1)
- `src/components/simulator/canvas/DrawingOverlay.jsx:145-157` — handlePointerUp save sincrono
- `src/components/simulator/canvas/DrawingOverlay.jsx:196-207` — handleClose flush stroke
- `src/components/simulator/canvas/DrawingOverlay.jsx:215-218` — ESC binding → handleClose
- `src/components/lavagna/LavagnaShell.jsx:648-652` — handleMenuOpen `#tutor` (exit trigger)
- `src/components/lavagna/LavagnaShell.jsx:621-633` — sync drawingEnabled da `__ELAB_API`
- `src/components/simulator/NewElabSimulator.jsx:121` — `currentExperiment = null` initial
- `src/components/simulator/NewElabSimulator.jsx:896` — DrawingOverlay mount con `experimentId={currentExperiment?.id || null}`
- `src/utils/drawingStorage.js:17,19-24` — DEFAULT_SUFFIX `paths` fallback
- `src/components/simulator/panels/WhiteboardOverlay.jsx:455-463` — auto-save 5s
- `src/components/simulator/panels/WhiteboardOverlay.jsx:363,396` — `elab_wb_sandbox` fallback

## Onesta sui limiti dell'investigation

- **Static analysis only** — non ho eseguito Playwright contro Vercel preview prima della scrittura della spec.
- **Ipotesi Tea** — Tea ha detto "salvataggio in uscita". Posso solo congetturare quale dei due overlay (DrawingOverlay vs WhiteboardOverlay) e quale degli scenari (Bug 1 vs Bug 2 vs Bug 3). Spec Playwright iter 25 dovrebbe coprire **tutti e tre** scenari per identificare quello reale.
- **No Supabase reality check** — non ho query-ato Supabase per vedere se esiste tabella `lavagna_state` o simili. Dato il `grep -L supabase` negativo, e' molto probabile che NON esista.
- **Race condition unmount** — non verificato se save su pointer-up arriva a localStorage PRIMA del page unload. Browser dovrebbe garantirlo (localStorage e' sync), ma se utente disegna mentre clicca "Esci" rapidamente potrebbe esserci uno stroke perso. handleClose flush (linea 196-207) copre il caso ESC ma non `window.location.hash = '#tutor'` puro perche' quel handler NON chiama onClose del DrawingOverlay.
