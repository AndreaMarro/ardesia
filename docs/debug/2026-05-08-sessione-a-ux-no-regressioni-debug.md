# Debug - Sessione parallela A UX/no-regressioni

Data: 2026-05-08

## Root cause

1. Pannelli non ridimensionabili su tutti i lati

`FloatingWindow` gestiva solo right/bottom/corner. Il pannello Passo Passo aveva resize limitato al bordo destro/basso e il body poteva intercettare eventi sopra gli handle.

Fix: handle n/e/s/w + angoli, resize con aggiornamento left/top quando si trascina da nord/ovest, z-index handle sopra il body.

2. Gomma che "colora"

La gomma veniva trattata come tratto disegnato con colore/alpha da eraser, quindi poteva apparire come segno invece di cancellazione.

Fix: al pointer up, se tool eraser, si calcolano intersezioni segmento/tratto e si filtrano i path colpiti. Nessun path `isEraser` viene salvato per i nuovi cancellamenti.

3. Disegni spariscono con ESCI

`DrawingOverlay` tornava `null` quando `drawingEnabled=false`, quindi anche i path persistiti sparivano dalla UI.

Fix: overlay visibile se esistono path/currentPath; quando disabilitato usa `pointerEvents:none` e nasconde solo toolbar.

4. UNLIM sparisce dopo load esperimento

`LavagnaStateManager` spegneva `galileo` in stati CLEAN/BUILD/CODE/RUN. Dopo caricamento esperimento, il pannello poteva sparire.

Fix: `galileo:true` in stati principali.

5. Salva no-op o 401 rumorosi

Il tracker sessione non sempre partiva quando l'esperimento arrivava da API race; Supabase sync anonimo provava insert senza `student_id`.

Fix: sync tracker su `currentExperiment.id`; prima di `finaliseSession` parte la sessione se manca. `saveSession` anonima accoda localmente e ritorna senza insert Supabase.

6. Tre pulsanti bloccati su iPad

Layer canvas con stacking piu alto poteva intercettare/occludere la zona modalita.

Fix: canvas z-index basso e slot modalita sopra.

7. Video 404 thumbnail

Curated card caricava thumbnail YouTube esterne con ID non sempre disponibili.

Fix: placeholder locale per thumbnail curated.

## Prove

- Test mirati: 15 file, 478 test passati, 2 todo.
- Build locale: PASS.
- Playwright desktop+iPad proxy: 15 check PASS, 0 console/page errors.
- Deploy preview: READY.

## Decisioni

- Non ho modificato prompt/base prompt/core linguistico UNLIM.
- Ho corretto l'"onnipotenza" solo lato bridge/azioni esposte e permanenza pannello.
- Non ho dichiarato hardware reale verificato: iPad/Pencil e voce richiedono prova fisica.

