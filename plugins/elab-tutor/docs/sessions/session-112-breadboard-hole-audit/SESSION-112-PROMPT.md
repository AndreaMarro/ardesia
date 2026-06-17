# Session 112 Prompt — Breadboard Hole Grid Audit

## Contesto (Piano 5 Sessioni Simulatore)
Questa è la **sessione 1 di 5** del piano "Simulatore Core Fix" (vedi `docs/sessions/piano-5-sessioni-simulatore/PIANO-MASTER.md`). Le 5 sessioni risolvono: fori breadboard saltati, fili batteria attorcigliati, componenti che si staccano, drag & drop + iPad usability.

**Sessione precedente**: S111 — LCD Blockly Blocks + fix Scratch crash (`69a2747`)

## Problema
Alcuni fori della breadboard vengono saltati: i componenti non si agganciano correttamente a tutti i fori. La griglia è 63 righe × 10 colonne (a-e + f-j) + bus power (+ e −). Il sistema di snap usa un raggio troppo generoso (30px) e un moltiplicatore 2.5x sulla threshold, causando aggancio al foro sbagliato o mancato aggancio.

## File da Analizzare

1. **`src/components/simulator/utils/breadboardSnap.js`**
   - `BB_PITCH = 7.5` (riga 29) — deve corrispondere esattamente a BreadboardFull
   - `BB_SNAP_RADIUS = BB_PITCH * 4 = 30` (riga 31) — troppo generoso?
   - `findNearestHole()` (righe 44-76) — loop di ricerca, validare che copra tutti i 63 fori
   - `computeAutoPinAssignment()` (righe 188-227) — assegnazione pin automatica

2. **`src/components/simulator/components/BreadboardFull.jsx`**
   - ROWS = 63, COLS_PER_SIDE = 5, HOLE_SPACING = 7px (righe 15-30)
   - `getHolePosition()` (righe 308-340) — coordinate di ogni foro
   - `getInternalConnections()` (righe 342-369) — reti elettriche

3. **`src/components/simulator/canvas/SimulatorCanvas.jsx`**
   - `snapComponentToHole()` (righe 206-238) — snap basato su pin
   - Riga 213: `SNAP_THRESHOLD * 2.5` — perché 2.5x?
   - Righe 1262-1270: snap durante drag

## Cosa Fare

### FASE 1 — Audit Griglia
1. Leggere `BreadboardFull.jsx` e mappare ESATTAMENTE la geometria: quanti fori, coordinate, spaziatura
2. Leggere `breadboardSnap.js` e verificare che `findNearestHole()` copra TUTTI i fori della griglia
3. Confrontare BB_PITCH (snap) con HOLE_SPACING (render) — devono coincidere
4. Identificare fori "orfani" che non vengono trovati dal snap

### FASE 2 — Fix Snap
1. Aggiustare `BB_SNAP_RADIUS` se troppo generoso (target: preciso ma iPad-friendly)
2. Rimuovere o giustificare il moltiplicatore 2.5x in SimulatorCanvas.jsx
3. Aggiungere validazione: log warning se un foro della griglia non è raggiungibile
4. Verificare che bus power (colonne + e −) siano inclusi nel snap

### FASE 3 — Skill Creator
Creare skill `breadboard-hole-test.md` che possa essere riutilizzata nelle sessioni successive per verificare che lo snap funzioni. La skill deve:
- Caricare un esperimento
- Posizionare un componente su fori specifici (angoli, centro, bus)
- Verificare che il componente si agganci al foro corretto
- Restituire PASS/FAIL per ogni foro testato

### FASE 4 — COV (Chain of Verification)

| # | Test | Criterio PASS |
|---|------|---------------|
| 1 | Foro A1 (primo in alto a sinistra) | Componente si aggancia, coordinate corrette |
| 2 | Foro E63 (ultimo colonna e, riga 63) | Componente si aggancia |
| 3 | Foro F1 (prima colonna sezione destra) | Snap alla sezione f-j, non a-e |
| 4 | Foro J63 (ultimo in basso a destra) | Componente si aggancia |
| 5 | Bus + riga 1 | LED power rail funziona |
| 6 | Bus − riga 63 | GND rail funziona |
| 7 | Foro al centro (E32 circa) | Snap preciso, non ambiguo |
| 8 | Due componenti adiacenti (A1 + A2) | Non si sovrappongono, fori distinti |
| 9 | Componente tra due fori (posizione ambigua) | Snap al foro più vicino, non skip |
| 10 | Esperimento v1-cap6-esp1 caricato | Tutti i componenti sui fori corretti |

### FASE 5 — Deploy + GitHub
1. `npm run build` → 0 errori
2. Test regressione: caricare 2 esperimenti diversi, verificare funzionamento
3. `git add` + `git commit` con messaggio descrittivo
4. `git push origin main`
5. `npx vercel --prod --yes`
6. Generare prompt Session 113

## Output Atteso
- [ ] Audit completo griglia (mappa fori → snap)
- [ ] Fix snap applicati
- [ ] Skill `breadboard-hole-test.md` creata
- [ ] COV 10/10 PASS
- [ ] Build: 0 errori
- [ ] Deploy: Vercel production
- [ ] GitHub: commit pushed
- [ ] Report: SESSION-112-REPORT.md
- [ ] Prompt: SESSION-113-PROMPT.md nella cartella session-113

## Regole
- **NO agenti paralleli**
- **COV obbligatorio** prima di commit
- **Zero regressioni** — testare esperimenti esistenti
- **Skill creator** per test riutilizzabili
- **Prompt successivo** alla fine
