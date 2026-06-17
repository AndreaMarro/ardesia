# Sprint V iter 1 — Atom D2 — Lavagna Stroke Persistence Diagnosis

**Date**: 2026-05-05 PM
**Agent**: agent-teams:team-debugger (a46e205)
**Confidence**: HIGH (>85%) on H1-H6 falsification, MEDIUM (60%) on secondary root cause

## Verdict

**H1-H6 TUTTE FALSIFICATE** dal codice corrente. Bug "scritti spariscono su Esci" NON riproducibile dal solo codice — `handleClose` è wipe-free (consistent con observation difensiva iter 36 `ModalitaSwitch` analoga).

**Root cause secondario architetturale** identificato che probabilmente spiega persistenza fragile reportata Andrea.

## Falsificazione hypotheses

- **H1** "Esci chiama clearStrokes" FALSE — `DrawingOverlay.jsx:317-329` `handleClose` esegue solo flush mid-stroke + `onClose?.()`. NESSUN `setPaths([])`. Solo `handleClearAll:297-307` (cestino distinto) wipa
- **H2** "toggleDrawing(false) implicit clear" FALSE — `NewElabSimulator.jsx:175-177` toggle puro setState boolean
- **H3** "localStorage non scritto" FALSE — `saveDrawingPaths` chiamato in 5 path (handlePointerUp:271, handleUndo:282, handleRedo:292, handleClearAll:303, handleClose:322 mid-stroke flush)
- **H4** "cleared on mount per exp switch" FALSE — `DrawingOverlay.jsx:138-154` effect su experimentId migra paths sandbox→bucket nuovo (iter 25 fix esplicito mandate "contenuto sparisce SOLO con cancellazione esplicita")
- **H5** "schema Supabase non esiste" FALSE per file scaffold (`scribble_paths.sql:25`), TRUE per applied state (header NOT deployed)
- **H6** "DrawingOverlay rerender clear" FALSE — re-mount re-idrata via `loadDrawingPaths(experimentId):109`

## Root cause secondario (probabile)

### 1. Remote-empty hydration race (Bug 2 fix iter 34 parziale)
- `DrawingOverlay.jsx:161-191` `loadPathsRemote` hydration effect
- Comment iter 34 (line 167-172) documenta storia identica: "premi Esci scritti spariscono" attribuito a remote empty array sovrascrive cache locale
- Fix iter 35 (`lastLocalSaveAtRef` line 272) parziale
- **Gap**: `localTs=0` quando user non ha ancora disegnato in questa sessione → remote empty NON skip

### 2. Sandbox bucket collision
- `experimentId=null` (sandbox / pre-pick) → `_normalizeExpId` (`drawingSync.js:89-94`) collassa in bucket `'paths'`
- Multi-esperimento sandbox = collisione, **last-write-wins wipa precedente** (caveat dichiarato `drawingSync.js:34-35`)

### 3. **CRITICAL**: syncEnabled mai passato `true` in NESSUN caller
- Grep `syncEnabled src/` → solo `DrawingOverlay.jsx`. Default `false` (line 106)
- `NewElabSimulator.jsx:896` NON passa `syncEnabled`
- **Supabase sync NON attivo, neanche in Lavagna mode**, contrariamente doc-claim CLAUDE.md "Lavagna Bug 3 sync 25/25 PASS LIVE iter 28"
- **ANTI-INFLATION**: questo è inflation iter 28 doc — claim falso vs reality

### 4. Migration scribble_paths NOT applied
- `supabase/migrations/20260429120000_scribble_paths.sql:25-36` schema definito
- Header migration line 20-21 NOT deployed
- Tabella mai presente prod

## Schema Supabase proposal

Schema scaffolded già allineato. Estensione per multi-save mandate (sessione, esperimento):

```sql
ALTER TABLE scribble_paths
  ADD COLUMN session_id TEXT,
  DROP CONSTRAINT scribble_paths_exp_user_unique,
  ADD CONSTRAINT scribble_paths_session_exp_user_unique
    UNIQUE (session_id, experiment_id, user_id);
CREATE INDEX idx_scribble_paths_session_exp ON scribble_paths(session_id, experiment_id);
```

Permette stessa sessione + esperimenti diversi annotazioni preservate, e stesso esperimento + sessioni diverse storia distinta.

## Fix proposals

### A2.1 — Skip remote hydration when local has paths (S, LOW risk)
- **File**: `DrawingOverlay.jsx:161-191`
- **Change**: shorten condition `if (remoteIsEmpty && localHasPaths) return` (rimuove `!remoteIsNewer`)
- **Effort**: 30 min
- **Anti-regression**: localPaths sempre prevalgono se non vuoti

### A2.2 — Apply Supabase migration + enable syncEnabled Lavagna (M, MEDIUM risk)
- **Steps**:
  1. `npx supabase db push --linked` migration 20260429120000 (Andrea OK gate)
  2. `NewElabSimulator.jsx:896` accept prop `enableDrawingSync` propagato da LavagnaShell mount only
  3. `LavagnaShell.jsx` mount pass `syncEnabled={true}` via context o prop drill
- **Effort**: 2-3h
- **Anti-regression**: simulator standalone resta `syncEnabled=false` (PZ V3 enforce)
- **NOTA**: questo close anti-inflation gate (claim iter 28 reality)

### A2.3 — Session-scoped bucket key + multi-save preservation (L, HIGH value)
- **Changes**:
  1. `drawingStorage.js:19-24` chiave `elab-drawing-<sessionId>-<expId>`
  2. `drawingSync.js:89-94` aggiungere session_id arg
  3. Migration ALTER schema sopra
  4. Migrazione one-shot legacy keys `elab-drawing-<expId>` → `elab-drawing-default-<expId>`
- **Effort**: 4-6h
- **Anti-regression**: `loadDrawingPaths` fallback chain locale: session→legacy→empty (mai overwrite legacy)

## Anti-regression mandate

1. NESSUN fix deve cancellare `localStorage.elab-drawing-*` keys esistenti senza migrazione esplicita
2. `handleClose` deve rimanere wipe-free (preserve mandate iter 21+ Andrea)
3. Fix A2.1 verificare localStorage seeded → remote 401/empty → reload → strokes presenti
4. Test E2E `tests/e2e/04-lavagna-persistence.spec.js` (iter 36) DEVE continuare PASS
5. `tests/unit/drawingStorage*.test.js` baseline preservare

## File:line citations chiave

- `src/components/simulator/canvas/DrawingOverlay.jsx:109` initial state localStorage
- `src/components/simulator/canvas/DrawingOverlay.jsx:138-154` exp-switch migration
- `src/components/simulator/canvas/DrawingOverlay.jsx:161-191` remote hydration race
- `src/components/simulator/canvas/DrawingOverlay.jsx:262-275` handlePointerUp persiste
- `src/components/simulator/canvas/DrawingOverlay.jsx:297-307` handleClearAll esplicito wipe
- `src/components/simulator/canvas/DrawingOverlay.jsx:317-329` handleClose flush mid-stroke, **NO wipe**
- `src/components/simulator/canvas/DrawingOverlay.jsx:354` early return on !drawingEnabled
- `src/components/simulator/canvas/DrawingOverlay.jsx:523-547` Esci button → handleClose
- `src/components/simulator/NewElabSimulator.jsx:174-191` __ELAB_API.toggleDrawing register
- `src/components/simulator/NewElabSimulator.jsx:896` DrawingOverlay mount, **syncEnabled NOT passed**
- `src/components/lavagna/LavagnaShell.jsx:771-775` syncDrawing wrapper
- `src/utils/drawingStorage.js:19-46` storage helpers
- `src/services/drawingSync.js:42` TABLE_NAME='scribble_paths'
- `src/services/drawingSync.js:89-94` _normalizeExpId sandbox bucket collision
- `src/services/drawingSync.js:166-176` upsert onConflict (experiment_id, user_id) — **manca session_id**
- `supabase/migrations/20260429120000_scribble_paths.sql:25-36` schema NOT applied

## Andrea verify gate

Raccomandazione: Playwright `04-lavagna-persistence.spec.js` exec con `syncEnabled=true` toggle scenario per conferma definitiva remote hydration race.

## Anti-inflation note

Doc-claim CLAUDE.md iter 28 close "Lavagna Bug 3 Supabase sync 25/25 PASS (drawing paths persistence cross-session)" è **inflation reality**: syncEnabled mai passato true → Supabase sync mai attivo prod. Anti-inflation gate validato retroattivamente.
