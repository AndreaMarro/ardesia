# Session 116 Prompt — iPad Usability + Final Integration

## Contesto (Piano 5 Sessioni Simulatore)
Questa e la **sessione 5 di 5** (FINALE) del piano "Simulatore Core Fix" (vedi `docs/sessions/piano-5-sessioni-simulatore/PIANO-MASTER.md`). Le 5 sessioni risolvono: fori breadboard saltati, fili batteria attorcigliati, componenti che si staccano, drag & drop + iPad usability.

**Sessione precedente**: S115 — Drag & Drop Polish (`1dcbaf2`)
- Fix: dead-zone touch-aware (5px mouse / 10px touch)
- Fix: hit area ≥44px WCAG su 8 componenti
- Fix: snap preview per-pin (lime libero, rosso occupato)
- Fix: cursor grab → grabbing → default
- COV 6/6 PASS

**Chain completa**:
- S112: Breadboard snap fix (pin-registry, `828e7ed`)
- S113: Battery wire routing V6 (L-shape lanes, `c8ee45b`)
- S114: Parent-child attachment (geometric bounding box, `8a5a2ab`)
- S115: Drag & drop polish (dead-zone, hit areas, snap preview, `1dcbaf2`)

## Problema
Sessione finale di integrazione. Due obiettivi:
1. **iPad touch usability** — pinch-zoom limiti, palm rejection, gesture fluide
2. **Test integrato** — tutti i fix S112-S115 verificati insieme su un esperimento complesso

## File da Analizzare

1. **`src/components/simulator/canvas/SimulatorCanvas.jsx`**
   - Pinch-zoom: `MIN_ZOOM`, `MAX_ZOOM`, `handlePinchZoom`
   - Palm rejection: `activeTouchesRef`, filtro multi-touch
   - Touch events: `touch-action: none` su canvas

2. **`src/components/simulator/ElabSimulator.css`**
   - `touch-action` rules per iPad
   - Responsive breakpoints per toolbar/panels

3. **`src/components/simulator/layout.module.css`**
   - iPad landscape/portrait layout
   - Panel collapse behavior

## Fasi

### FASE 1 — Audit iPad Touch (max 20 min)
Analizza i 3 file e cataloga:
- [ ] Pinch-zoom: limiti attuali MIN_ZOOM/MAX_ZOOM, centro zoom, smoothing
- [ ] Palm rejection: come vengono filtrati i touch accidentali con il palmo
- [ ] Multi-touch conflicts: drag vs pinch vs pan — come si distinguono
- [ ] Touch-action CSS: `none` vs `manipulation` vs `pan-x pan-y` su ogni container
- [ ] iPad-specific breakpoints: 768px, 1024px, 1180px

### FASE 2 — Fix iPad Touch (max 40 min)
- [ ] Pinch-zoom: MIN_ZOOM ≥ 0.3, MAX_ZOOM ≤ 3.0, zoom center = pinch midpoint
- [ ] Palm rejection: ignora touch con `radiusX > 20` o `force > 0.5` (indicatori di palmo)
- [ ] Debounce pinch → drag transition: delay 200ms dopo fine pinch prima di consentire drag
- [ ] Double-tap zoom: 1.0 → 1.5 → 1.0 toggle (se non gia implementato)

### FASE 3 — Test Integrato S112-S116 (max 30 min)
Test end-to-end su un esperimento complesso (Vol2 o Vol3 con 5+ componenti):
- [ ] **S112 Snap**: componente snap su ogni foro della breadboard (angoli + centro)
- [ ] **S113 Wires**: fili batteria non si sovrappongono, routing pulito
- [ ] **S114 Parent-Child**: drag breadboard → tutti i componenti seguono
- [ ] **S115 Drag & Drop**: snap preview lime/rosso, cursor grab/grabbing, dead-zone
- [ ] **S116 iPad**: pinch-zoom fluido, no palm false-drag, touch targets funzionanti

### FASE 4 — Skill Creator (max 5 min)
Crea `ipad-integration-test.md` nella cartella sessione:
- Checklist combinata iPad + integration
- Riproducibile per future regressioni

### FASE 5 — COV (Chain of Verification)
12 test points — 2-3 per ognuna delle 5 sessioni:

| # | Test | Expected |
|---|------|----------|
| 1 | Snap LED su foro angolo breadboard (S112) | LED si posiziona esattamente sul foro |
| 2 | Snap resistore su foro centro breadboard (S112) | Entrambi i pin allineati ai fori |
| 3 | Fili batteria su esperimento LED (S113) | Filo + e - separati ≥14px, no overlap |
| 4 | Fili batteria su esperimento diverso (S113) | Routing adattivo alla posizione |
| 5 | Drag breadboard con 3 componenti (S114) | Tutti e 3 seguono la breadboard |
| 6 | Aggiungere componente dopo drag breadboard (S114) | Nuovo componente si attacca |
| 7 | Snap preview lime su foro libero (S115) | Cerchio verde visibile durante drag |
| 8 | Snap preview rosso su foro occupato (S115) | Cerchio rosso come warning |
| 9 | Cursor grab su hover componente (S115) | Cursore cambia a mano aperta |
| 10 | Pinch-zoom su iPad (S116) | Zoom fluido, no jitter, limiti rispettati |
| 11 | Palm rejection su iPad (S116) | Tocco palmo non inizia drag |
| 12 | Sequenza completa: load + drag BB + add comp + wire + play (ALL) | Tutto funziona senza crash |

### FASE 6 — Deploy + GitHub
- `npm run build` → 0 errors
- Regression test: S112 snap + S113 wires + S114 parent-child + S115 drag + S116 iPad
- `git add` + `git commit` con messaggio descrittivo
- `git push origin main`
- `npx vercel --prod --yes`
- Genera `SESSION-116-REPORT.md` — report finale con scorecard completo delle 5 sessioni
- Genera piano NEXT STEPS per oltre le 5 sessioni (se necessario)
