# LAVAGNA PERSISTENCE — Fix Design iter 25 (caveman)

**Date**: 2026-04-29
**Source**: investigation `2026-04-29-iter-25-LAVAGNA-PERSISTENCE-investigation.md`
**Mandato**: contenuto sparisce SOLO con cancellazione esplicita.

## Strategia in 5 punti (allineata al task)

### 1. Save strategy — debounced localStorage 500ms durante draw

Attualmente save sincrono ad ogni pointer-up (`DrawingOverlay.jsx:154`). E' OK — ogni stroke completo va su disco. Ma in caso di stroke MOLTO lungo (10s+), se l'utente esce mid-stroke senza ESC, `handleClose` flush copre solo path corrente in memoria React.

**Proposta**:
- Mantenere save su pointer-up (semantica chiara, una stroke = una transazione storage).
- Aggiungere **debounce 500ms** durante `handlePointerMove` per persistere parziale stroke su localStorage in chiave temporanea `elab-drawing-<expId>-inflight` (singolo path in corso).
- Su pointer-up, scrivere paths consolidati e cancellare `-inflight`.
- Su mount, se `-inflight` esiste, ricostruire come ultimo path completato (recovery da crash).

**Costo implementazione**: ~30 righe useEffect + setTimeout, +5 unit test.

### 2. Supabase sync — visibility-hidden + navigation

Attualmente: ZERO. Solo localStorage.

**Proposta**:
- Tabella nuova `lavagna_drawing_state`:
  ```sql
  CREATE TABLE lavagna_drawing_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_key TEXT NOT NULL,
    user_uuid TEXT NOT NULL,
    experiment_id TEXT,  -- nullable per sandbox
    paths_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_key, user_uuid, experiment_id)
  );
  CREATE INDEX idx_lavagna_lookup ON lavagna_drawing_state(class_key, user_uuid, experiment_id);
  ```
- RLS: stesso pattern di `S1-supabase-dashboard-04apr2026.md` — RLS aperte per classe virtuale via `class_key` localStorage + `elab_anon_uuid`.
- Sync trigger:
  - `document.visibilitychange === 'hidden'` → upsert paths.
  - `beforeunload` → upsert (best-effort, navigator.sendBeacon se possibile).
  - Toggle drawing OFF → upsert.
  - **NON** sync su ogni stroke (rate limit Supabase free tier).
- Restore on mount: prima localStorage (immediato), poi fetch Supabase async; se Supabase ha timestamp piu' recente → applica + salva su localStorage.

**Costo**: ~80 righe service + 1 migration SQL + integration test.

### 3. Restore on mount — multi-source

```
on mount:
  paths_local = loadDrawingPaths(expId)
  setPaths(paths_local)            // immediato
  fetch_supabase_async(class_key, user_uuid, expId).then(remote => {
    if (remote && remote.updated_at > local_timestamp) {
      setPaths(remote.paths)
      saveDrawingPaths(remote.paths, expId)  // riconcilia local
    }
  })
```

**Bonus**: se `expId === null` (sandbox), e localStorage `elab-drawing-paths` ha contenuto, mostra modal una-tantum: "Hai un disegno non assegnato a esperimento. Vuoi mantenerlo?" → se SI, sposta su bucket dell'esperimento corrente quando ne carica uno.

### 4. Conflict resolution — latest timestamp wins

Conflitti possibili: stesso utente, due tab, sync Supabase.

**Regola**: `updated_at` server-side wins. Quando un client riceve un timestamp remoto piu' recente, sovrascrive locale. Quando upserta, manda timestamp client; trigger Supabase verifica e rifiuta se piu' vecchio (`UPDATE ... WHERE updated_at < EXCLUDED.updated_at`).

**No CRDT**: scope troppo grande, non serve per single-user single-class.

### 5. Cleanup — esplicita "Cancella" only

Attualmente `handleClearAll` (`DrawingOverlay.jsx:177-186`) e' l'unica via di cancellazione e gia' rispetta il principio Andrea — l'utente clicca "Cancella tutto", paths a `[]`, save scrive `[]` su storage.

**MAI cancellare implicitamente** su:
- expId switch (BUG 1 da fixare — vedi sotto)
- exit hash navigation (`window.location.hash = '#tutor'` — `LavagnaShell.jsx:650`)
- unmount Lavagna
- tab close
- visibility hidden

## Fix Bug 1 (BUCKET MISMATCH) — IL PIU' URGENTE

**File**: `src/components/simulator/canvas/DrawingOverlay.jsx:103-108`

**Diff proposto**:

```jsx
// PRIMA (linee 103-108):
useEffect(() => {
  setPaths(loadDrawingPaths(experimentId));
  undoStackRef.current = [];
  redoStackRef.current = [];
}, [experimentId]);

// DOPO:
const prevExpIdRef = useRef(experimentId);
useEffect(() => {
  const prevId = prevExpIdRef.current;
  const newId = experimentId;

  // Migration null → real expId: NON azzerare paths.
  // Se paths attivi sono in bucket "paths" (sandbox) e ora abbiamo un expId,
  // migra i paths nel nuovo bucket invece che resettare.
  if (prevId === null && newId && paths.length > 0) {
    saveDrawingPaths(paths, newId);  // copia nel bucket nuovo
    saveDrawingPaths([], null);      // svuota bucket sandbox
    // paths state resta invariato — utente continua a vedere quello che aveva
  } else {
    setPaths(loadDrawingPaths(newId));
    undoStackRef.current = [];
    redoStackRef.current = [];
  }
  prevExpIdRef.current = newId;
}, [experimentId, paths]);
```

**Costo**: 15 righe. **Risolve direttamente** il caso utente "disegno in sandbox poi seleziono esperimento → sparisce".

## Fix Bug 2 (EXIT HASH NAVIGATION) — coordinata con Bug 1

**Stato attuale**: `handleMenuOpen` (`LavagnaShell.jsx:648-652`) esce senza notificare DrawingOverlay. Ma DrawingOverlay save su ogni stroke → dato gia' su localStorage. Re-entry con `expId === null` carica bucket sandbox vuoto → utente non vede il disegno. **Stesso meccanismo del Bug 1 dal lato opposto.**

**Soluzione**:
- Persistere ULTIMO `expId` attivo: `localStorage.setItem('elab-lavagna-last-expId', expId)` su ogni cambio.
- Su mount Lavagna, se `currentExperiment === null`, controllare last-expId e auto-caricare quell'esperimento (chiama `__ELAB_API.loadExperiment(lastId)`).
- Cosi' utente che esce e rientra trova lo stesso esperimento + gli stessi disegni.

**Alternativa minima**: lasciare experiment null ma fare DrawingOverlay scegliere bucket "ultimo non-null usato" come fallback prima del default `paths`.

## Fix Bug 3 (Supabase) — defer iter 26

Implementazione completa Supabase sync e' ~3-4h work + migration + RLS test + integration test. Fuori scope iter 25 (50min budget).

**Patch minima iter 25**: scrivere anche su `sessionStorage` come secondary cache (ridondanza no-cost in caso localStorage venga corrotto).

## Sequenza implementazione raccomandata iter 25

1. **Spec Playwright** che riproduce Bug 1 + Bug 2 (PRE-fix → FAIL).
2. **Fix Bug 1** in DrawingOverlay (15 righe).
3. **Run spec** post-fix → expect Bug 1 PASS, Bug 2 ancora FAIL.
4. **Fix Bug 2** (last-expId restore) — ~25 righe in LavagnaShell.
5. **Run spec** → entrambi PASS.
6. **Vitest no-regression** — baseline 12290 deve restare.

Se spec PRE-fix fallisce (cioe' bug NON riproducibile come ipotizzato), STOP e chiedere a Tea repro steps esatti.

## Defer iter 26+

- Supabase sync `lavagna_drawing_state` table.
- Conflict resolution UI (rare, single-user prevalente).
- Inflight stroke recovery (debounce 500ms su pointer-move).
- Modal "hai un disegno non assegnato" su sandbox→experiment.
- Migration WhiteboardOverlay con stesso pattern.

## Anti-inflation

NON dichiaro alcun fix verificato senza Playwright pass. Score iter 25:
- Investigation done: solido (2 doc + cite file:line precise).
- Spec ready: shipped.
- Fix implemented: solo se scope di tempo lo permette dopo spec.
- Verify pre+post: solo se spec eseguibile contro preview Vercel SSO-disabled.
