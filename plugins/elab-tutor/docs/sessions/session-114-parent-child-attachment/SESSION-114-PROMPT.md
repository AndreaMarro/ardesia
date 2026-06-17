# Session 114 Prompt — Parent-Child Attachment

## Contesto (Piano 5 Sessioni Simulatore)
Questa e la **sessione 3 di 5** del piano "Simulatore Core Fix" (vedi `docs/sessions/piano-5-sessioni-simulatore/PIANO-MASTER.md`). Le 5 sessioni risolvono: fori breadboard saltati, fili batteria attorcigliati, componenti che si staccano, drag & drop + iPad usability.

**Sessione precedente**: S113 — Battery Wire Routing V6 (`c8ee45b`)
- Fix: routing dinamico L-shape con lane ancorate a bbX/bbY
- Separazione garantita 14px tra filo + e filo -
- COV 6/6 PASS

**Sessione ancora prima**: S112 — Breadboard Hole Grid Audit (`828e7ed`)
- Fix: snap-to-hole usa pin registry (source of truth)
- BreadboardFull 63x10 + bus completamente supportato

## Problema
Quando si trascina la breadboard, i componenti inseriti nei suoi fori NON seguono il movimento. Si "staccano" e rimangono nella posizione originale. Questo perche il `parentId` non viene settato correttamente quando si carica un esperimento (solo su snap manuale), e la logica di drag non propaga il delta ai figli.

## File da Analizzare

1. **`src/components/simulator/canvas/SimulatorCanvas.jsx`**
   - `handlePointerDown` / `handlePointerMove` / `handlePointerUp` — drag logic
   - Come viene gestito il multi-select quando si trascina un parent
   - Riga ~1299: possibile bug nella logica multi-select
   - Come viene calcolato il delta al primo frame di drag
   - `loadExperiment()` o equivalente — dove vengono piazzati i componenti

2. **`src/components/simulator/utils/parentChild.js`**
   - `getChildComponents()` — come identifica i figli di un parent
   - `inferParent()` — come determina il parentId di un componente
   - Logica di snap: quando viene assegnato parentId

3. **`src/components/simulator/utils/breadboardSnap.js`**
   - `findNearestHole()` — snap logic (gia fixata in S112)
   - Come comunica il parentId dopo lo snap

4. **`src/data/experiments-vol1.js`** (e vol2/vol3)
   - Come vengono definiti i componenti negli esperimenti
   - Verificare se `parentId` e presente nei dati o viene inferito a runtime

## Cosa Fare

### FASE 1 — Audit Parent-Child
1. Leggere `parentChild.js` — capire `getChildComponents()` e `inferParent()`
2. Leggere la drag logic in `SimulatorCanvas.jsx` — come propaga il movimento ai figli
3. Leggere il load experiment flow — dove/come vengono piazzati i componenti
4. Identificare: quando parentId viene settato, quando non viene settato, bug nella propagazione

### FASE 2 — Fix Parent-Child Attachment
1. **parentId su load**: quando si carica un esperimento, ogni componente posizionato su un foro della breadboard deve avere `parentId` settato alla breadboard
2. **Multi-select drag**: quando si trascina un parent (breadboard), TUTTI i figli devono muoversi insieme
3. **Delta calculation**: il delta al primo frame di drag deve essere calcolato correttamente per evitare "salti"
4. **Snap parentId**: verificare che lo snap manuale (S112) setta correttamente il parentId
5. **Testare**: drag breadboard con 3+ componenti → tutti seguono

### FASE 3 — Skill Creator
Creare skill `parent-child-test.md` che verifichi:
- Componenti seguono la breadboard quando trascinata
- parentId settato su load esperimento
- Delta corretto (no salti al primo frame)
- Componenti si staccano solo se trascinati individualmente

### FASE 4 — COV (Chain of Verification)

| # | Test | Criterio PASS |
|---|------|---------------|
| 1 | Load v1-cap6-esp1, drag breadboard | Tutti i componenti (LED, resistore, fili) seguono |
| 2 | Load v1-cap6-esp2, drag breadboard | Componenti seguono senza salti |
| 3 | Load v1-cap7-esp1, drag breadboard | Componenti seguono (altro capitolo) |
| 4 | Drag singolo componente | Si stacca dalla breadboard, si muove indipendentemente |
| 5 | Snap componente su breadboard | parentId settato, componente segue la breadboard |
| 6 | Drag breadboard con batteria esterna | Batteria NON segue (non e figlia della breadboard) |

### FASE 5 — Deploy + GitHub
1. `npm run build` → 0 errori
2. Test regressione: caricare 2 esperimenti, verificare fili (S113) + snap (S112) + attachment (S114)
3. `git add` + `git commit` con messaggio descrittivo
4. `git push origin main`
5. `npx vercel --prod --yes`
6. Generare prompt Session 115

## Output Atteso
- [ ] Audit parent-child completo
- [ ] Fix parentId su load + drag propagation
- [ ] Skill `parent-child-test.md` creata
- [ ] COV 6/6 PASS
- [ ] Build: 0 errori
- [ ] Deploy: Vercel production
- [ ] GitHub: commit pushed
- [ ] Report: SESSION-114-REPORT.md
- [ ] Prompt: SESSION-115-PROMPT.md nella cartella session-115

## Regole
- **NO agenti paralleli**
- **COV obbligatorio** prima di commit
- **Zero regressioni** — testare snap fori (S112) + wire routing (S113) + esperimenti esistenti
- **Skill creator** per test riutilizzabili
- **Prompt successivo** alla fine
