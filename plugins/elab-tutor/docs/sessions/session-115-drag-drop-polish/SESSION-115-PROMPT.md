# Session 115 Prompt — Drag & Drop Polish

## Contesto (Piano 5 Sessioni Simulatore)
Questa e la **sessione 4 di 5** del piano "Simulatore Core Fix" (vedi `docs/sessions/piano-5-sessioni-simulatore/PIANO-MASTER.md`). Le 5 sessioni risolvono: fori breadboard saltati, fili batteria attorcigliati, componenti che si staccano, drag & drop + iPad usability.

**Sessione precedente**: S114 — Parent-Child Attachment (`8a5a2ab`)
- Fix: double-cascade bug (2 sistemi concorrenti), parentId preservato in customLayout
- Geometric bounding box detection come single source of truth
- COV 6/6 PASS

**Sessione ancora prima**: S113 — Battery Wire Routing V6 (`c8ee45b`)
- Fix: routing dinamico L-shape con lane ancorate a bbX/bbY
- Separazione garantita 14px tra filo + e filo -
- COV 6/6 PASS

## Problema
Il drag & drop dei componenti nel simulatore manca di polish:
1. **Dead-zone troppo piccola** — mouse trembling o tocco impreciso inizia un drag involontario
2. **Hit area componenti piccoli** — resistori, LED, buzzer hanno area cliccabile troppo piccola (sotto 44px WCAG)
3. **Nessun feedback visivo snap** — quando si trascina un componente sopra un foro della breadboard, non c'e indicazione visiva del foro target
4. **Componenti si sovrappongono** — nessuna collision detection o warning visivo

## File da Analizzare

1. **`src/components/simulator/canvas/SimulatorCanvas.jsx`**
   - `handlePointerDown` — inizio drag, dead-zone threshold
   - `handlePointerMove` — drag logic, snap preview
   - `handlePointerUp` — drop logic, snap commit
   - `DRAG_THRESHOLD` — distanza minima prima di iniziare il drag
   - Hit area dei componenti: come vengono calcolate le aree cliccabili

2. **`src/components/simulator/utils/breadboardSnap.js`**
   - `findNearestHole()` / `findNearestHoleFull()` — snap detection
   - `SNAP_RADIUS` — raggio di snap (verificare se adeguato)
   - Possibilita di restituire "candidato snap" durante il drag (non solo al drop)

3. **`src/components/simulator/components/*.jsx`**
   - Dimensioni SVG dei componenti (LED, Resistor, Buzzer, etc.)
   - Event handlers: come catturano il pointer
   - Se hanno `pointerEvents` configurato correttamente

4. **`src/components/simulator/ElabSimulator.css`**
   - `touch-action` settings
   - Cursor styles durante il drag
   - Eventuali media queries per touch

## Cosa Fare

### FASE 1 — Audit Drag & Drop
1. Leggere la drag logic in `SimulatorCanvas.jsx` — threshold, dead-zone, touch handling
2. Misurare le hit area dei componenti SVG — confrontare con 44px WCAG minimum
3. Verificare il comportamento snap attuale — c'e preview durante il drag?
4. Identificare tutti i problemi di UX nel flusso drag-and-drop

### FASE 2 — Fix Dead-Zone + Hit Area
1. **Dead-zone touch-aware**: aumentare `DRAG_THRESHOLD` per touch (piu impreciso del mouse). Usare `event.pointerType === 'touch'` per threshold diversi (mouse: 3px, touch: 8px)
2. **Hit area 44px minimum**: per ogni componente SVG con area < 44px, aggiungere un rettangolo trasparente di hit area. Usare `<rect fill="transparent" pointerEvents="all">` come overlay
3. **Cursor feedback**: `cursor: grab` idle, `cursor: grabbing` durante drag, `cursor: crosshair` durante wiring

### FASE 3 — Snap Preview
1. **Highlight foro target**: durante il drag, se il componente e vicino a un foro, evidenziare il foro con un cerchio colorato (lime `#7CB342`, opacity 0.6)
2. **Snap magnetico**: se dentro SNAP_RADIUS, "tirare" il componente verso il foro (snap preview prima del drop)
3. **No-snap zone**: se sopra un foro gia occupato, mostrare rosso

### FASE 4 — Skill Creator
Creare skill `drag-drop-test.md` che verifichi:
- Dead-zone funzionante (no drag involontari)
- Hit area ≥44px per tutti i componenti
- Snap preview visibile durante drag
- Cursor corretto in ogni stato

### FASE 5 — COV (Chain of Verification)

| # | Test | Criterio PASS |
|---|------|---------------|
| 1 | Drag LED verso foro breadboard | Highlight foro target visibile |
| 2 | Drop LED su foro occupato | Indicatore rosso / warning |
| 3 | Touch drag su iPad/mobile | Dead-zone 8px, no drag involontari |
| 4 | Click su resistore piccolo | Hit area ≥44px, selezionato al primo tocco |
| 5 | Drag componente fuori breadboard | No snap preview, componente libero |
| 6 | Cursor states | grab → grabbing → default corretto |

### FASE 6 — Deploy + GitHub
1. `npm run build` → 0 errori
2. Test regressione: S112 snap + S113 wires + S114 parent-child + S115 drag
3. `git add` + `git commit` con messaggio descrittivo
4. `git push origin main`
5. `npx vercel --prod --yes`
6. Generare prompt Session 116

## Output Atteso
- [ ] Audit drag & drop completo
- [ ] Fix dead-zone touch-aware
- [ ] Fix hit area 44px minimum
- [ ] Snap preview durante drag
- [ ] Skill `drag-drop-test.md` creata
- [ ] COV 6/6 PASS
- [ ] Build: 0 errori
- [ ] Deploy: Vercel production
- [ ] GitHub: commit pushed
- [ ] Report: SESSION-115-REPORT.md
- [ ] Prompt: SESSION-116-PROMPT.md nella cartella session-116

## Regole
- **NO agenti paralleli**
- **COV obbligatorio** prima di commit
- **Zero regressioni** — testare snap fori (S112) + wire routing (S113) + parent-child (S114)
- **Skill creator** per test riutilizzabili
- **Prompt successivo** alla fine
