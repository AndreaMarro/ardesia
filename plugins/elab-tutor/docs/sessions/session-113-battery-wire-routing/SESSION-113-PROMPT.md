# Session 113 Prompt — Battery Wire Routing v3

## Contesto (Piano 5 Sessioni Simulatore)
Questa è la **sessione 2 di 5** del piano "Simulatore Core Fix" (vedi `docs/sessions/piano-5-sessioni-simulatore/PIANO-MASTER.md`). Le 5 sessioni risolvono: fori breadboard saltati, fili batteria attorcigliati, componenti che si staccano, drag & drop + iPad usability.

**Sessione precedente**: S112 — Breadboard Hole Grid Audit (`828e7ed`)
- Fix: snap-to-hole ora usa pin registry (source of truth) anziché costanti hardcoded
- BreadboardFull (63×10 + bus) completamente supportato
- COV 10/10 PASS

## Problema
I fili della batteria 9V si attorcigliano e sovrappongono quando la batteria è in posizioni diverse rispetto alla breadboard. Il routing è basato su posizioni hardcoded che non si adattano alla geometria reale. I fili positivo (+) e negativo (-) devono avere separazione visiva chiara (≥10px) e non devono mai incrociarsi.

## File da Analizzare

1. **`src/components/simulator/components/Battery9V.jsx`**
   - Terminali SVG: dove escono i fili dal componente
   - Pin positions: positive/negative offsets
   - Wire attachment points

2. **`src/components/simulator/canvas/WireRenderer.jsx`**
   - Rendering fili: path SVG, curve di Bezier
   - Wire routing logic: come decide il percorso del filo
   - Battery wire special cases (se presenti)
   - Sag/gravity simulation

3. **`src/components/simulator/canvas/SimulatorCanvas.jsx`**
   - Wire generation: come vengono calcolati i path
   - Battery-to-breadboard connection logic

4. **`src/data/experiments-vol1.js`** (e vol2/vol3)
   - Layout positions per batteria nei vari esperimenti
   - Connection definitions (from/to) per fili batteria

## Cosa Fare

### FASE 1 — Audit Wire Routing
1. Leggere `Battery9V.jsx` — mappare terminali, dimensioni, pin offset
2. Leggere `WireRenderer.jsx` — capire come genera i path SVG
3. Leggere wire connections in almeno 3 esperimenti diversi
4. Identificare: routing hardcoded, incroci, sovrapposizioni

### FASE 2 — Fix Wire Routing
1. Implementare routing dinamico: il path del filo si adatta alla posizione relativa batteria/breadboard
2. Garantire separazione ≥10px tra filo + e filo -
3. Evitare incroci: filo + sempre sopra, filo - sempre sotto (o schema simile)
4. Smooth curves: Bezier control points calcolati dalla distanza effettiva
5. Testare con batteria a sinistra, sopra, a destra della breadboard

### FASE 3 — Skill Creator
Aggiornare o creare skill `wire-routing-test.md` che verifichi:
- Fili batteria non si sovrappongono
- Separazione visiva ≥10px
- No incroci in 3+ posizioni diverse
- Curve smooth, no angoli bruschi

### FASE 4 — COV (Chain of Verification)

| # | Test | Criterio PASS |
|---|------|---------------|
| 1 | v1-cap6-esp1 (batteria a sinistra) | Fili non si incrociano, separazione ≥10px |
| 2 | v1-cap6-esp2 (secondo esperimento) | Routing pulito, no sovrapposizione |
| 3 | v1-cap7-esp1 (altro capitolo) | Fili adattivi alla posizione |
| 4 | Batteria spostata manualmente a destra | Fili si riadattano in tempo reale |
| 5 | Batteria spostata sopra la breadboard | Routing gestisce bene la verticalità |
| 6 | Zoom 50% e 200% | Fili mantengono qualità visiva |

### FASE 5 — Deploy + GitHub
1. `npm run build` → 0 errori
2. Test regressione: caricare 2 esperimenti, verificare fili + snap (no regressione S112)
3. `git add` + `git commit` con messaggio descrittivo
4. `git push origin main`
5. `npx vercel --prod --yes`
6. Generare prompt Session 114

## Output Atteso
- [ ] Audit wire routing completo
- [ ] Fix routing dinamico applicato
- [ ] Skill `wire-routing-test.md` creata/aggiornata
- [ ] COV 6/6 PASS
- [ ] Build: 0 errori
- [ ] Deploy: Vercel production
- [ ] GitHub: commit pushed
- [ ] Report: SESSION-113-REPORT.md
- [ ] Prompt: SESSION-114-PROMPT.md nella cartella session-114

## Regole
- **NO agenti paralleli**
- **COV obbligatorio** prima di commit
- **Zero regressioni** — testare snap fori (S112) + esperimenti esistenti
- **Skill creator** per test riutilizzabili
- **Prompt successivo** alla fine
