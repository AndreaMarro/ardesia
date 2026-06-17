# Piano 5 Sessioni — Simulatore Core Fix

**Data**: 10/03/2026
**Autore**: Andrea Marro + Claude
**Scope**: Fix fondamentali del simulatore Arduino ELAB

## Regole Operative (TUTTE le sessioni)
1. **NO agenti paralleli** — lavoro sequenziale, un fix alla volta
2. **COV obbligatorio** — Chain of Verification punto per punto prima di chiudere
3. **Deploy + GitHub** — ogni sessione finisce con `npm run build` + `npx vercel --prod` + `git push`
4. **Zero regressioni** — test funzionalità esistenti prima di committare
5. **Prompt successivo** — ogni sessione produce il prompt della sessione dopo
6. **Documentazione completa** — report + cartella sessione + contesto mantenuto
7. **Skill creator** — creare skill riutilizzabili per test patterns ricorrenti

## I 4 Problemi

| # | Problema | File Chiave | Impatto |
|---|----------|-------------|---------|
| 1 | Fori breadboard saltati | breadboardSnap.js, BreadboardFull.jsx, SimulatorCanvas.jsx | Componenti su foro sbagliato |
| 2 | Fili batteria attorcigliati | Battery9V.jsx, WireRenderer.jsx | Fili sovrapposti/illeggibili |
| 3 | Componenti si staccano dalla breadboard | SimulatorCanvas.jsx, parentChild.js | Drag breadboard non trascina figli |
| 4 | Drag & drop + iPad usability | SimulatorCanvas.jsx, ElabSimulator.css | Difficile selezionare/spostare su touch |

## Le 5 Sessioni

### Session 112 — Breadboard Hole Grid Audit
**Focus**: Ogni foro della breadboard deve funzionare. Audit completo griglia 63×10 + bus power.
**Deliverables**:
- Audit: mappa ogni foro → verifica snap funzionante
- Fix: snap radius, threshold multiplier, validazione righe
- Skill: `breadboard-hole-test.md` per verificare snap in futuro
- COV: test snap su almeno 10 fori critici (angoli, centro, bus)

### Session 113 — Battery Wire Routing v3
**Focus**: Fili batteria puliti, senza sovrapposizione, adattivi alla posizione.
**Deliverables**:
- Fix: routing dinamico fili batteria (non hardcoded)
- Fix: separazione visiva garantita ≥10px tra + e −
- Skill: `wire-routing-test.md` aggiornata per batteria
- COV: 3 posizioni batteria × 2 esperimenti = 6 test

### Session 114 — Parent-Child Attachment
**Focus**: Componenti restano attaccati alla breadboard quando si trascina.
**Deliverables**:
- Fix: parentId settato su load esperimento (non solo su snap manuale)
- Fix: logica multi-select (bug riga 1299 SimulatorCanvas)
- Fix: delta calculation su primo frame drag
- Skill: `parent-child-test.md` per verificare attachment
- COV: drag breadboard con 3+ componenti, verifica tutti seguono

### Session 115 — Drag & Drop Polish
**Focus**: Drag fluido, snap preciso, feedback visivo chiaro.
**Deliverables**:
- Fix: dead-zone touch-aware (non solo client coords)
- Fix: hit area componenti piccoli → 44px minimo WCAG
- Fix: feedback visivo snap (highlight foro target)
- Skill: `drag-drop-test.md` per verificare interazioni
- COV: drag 5 componenti diversi × 3 posizioni

### Session 116 — iPad Usability + Final Integration
**Focus**: Touch targets, gesture, responsive. Test finale integrato.
**Deliverables**:
- Fix: touch targets ≥44px su tutti i componenti SVG
- Fix: pinch-zoom limiti min/max
- Fix: palm rejection migliorato
- Test integrato: tutti i fix delle 5 sessioni verificati insieme
- COV finale: 12 test points across all 4 issues

## File Principali

```
src/components/simulator/
├── canvas/
│   ├── SimulatorCanvas.jsx    — drag, snap, parent-child, touch
│   └── WireRenderer.jsx       — wire routing, sag, battery skip
├── components/
│   ├── BreadboardFull.jsx     — hole grid, getHolePosition
│   └── Battery9V.jsx          — terminal SVG, wire paths
├── utils/
│   ├── breadboardSnap.js      — findNearestHole, snap radius
│   └── parentChild.js         — getChildComponents, inferParent
└── ElabSimulator.css          — touch-action, responsive
```

## Dipendenze tra Sessioni

```
S112 (Holes) ──→ S114 (Parent-Child) ──→ S116 (Integration)
                                    ↗
S113 (Wires) ──→ S115 (Drag & Drop)
```

S112 e S113 sono indipendenti. S114 dipende da S112 (snap corretto → parentId corretto). S115 dipende da S113 (wire routing → drag polish). S116 integra tutto.
