# iPad Integration Test Checklist — S116

Checklist combinata iPad + Integration per verificare tutti i fix S112-S116.
Riproducibile per future regressioni.

## Pre-requisiti
- iPad (o simulatore) con Safari/Chrome
- Esperimento complesso caricato (Vol2 o Vol3, 5+ componenti)
- Breadboard + Battery + almeno 3 componenti

---

## S112 — Breadboard Snap (Pin Registry)

- [ ] **SNAP-1**: Piazzare LED su foro angolo breadboard → si posiziona esattamente sul foro
- [ ] **SNAP-2**: Piazzare resistore su foro centro breadboard → entrambi i pin allineati
- [ ] **SNAP-3**: Spostare componente da un foro all'altro → snap preciso senza offset

## S113 — Battery Wire Routing

- [ ] **WIRE-1**: Caricare esperimento LED → fili + e - separati ≥14px, no overlap
- [ ] **WIRE-2**: Caricare esperimento diverso → routing adattivo alla posizione
- [ ] **WIRE-3**: Verificare visivamente L-shape routing (no sovrapposizione)

## S114 — Parent-Child Attachment

- [ ] **PARENT-1**: Drag breadboard con 3+ componenti → tutti seguono la breadboard
- [ ] **PARENT-2**: Dopo il drag, aggiungere nuovo componente → si attacca correttamente
- [ ] **PARENT-3**: Drag breadboard 2+ volte → componenti rimangono attaccati

## S115 — Drag & Drop Polish

- [ ] **DRAG-1**: Snap preview lime su foro libero → cerchio verde visibile durante drag
- [ ] **DRAG-2**: Snap preview rosso su foro occupato → cerchio rosso come warning
- [ ] **DRAG-3**: Cursor grab su hover componente → mano aperta
- [ ] **DRAG-4**: Cursor grabbing durante drag → mano chiusa
- [ ] **DRAG-5**: Dead-zone touch → tap non inizia drag accidentale (10px threshold)

## S116 — iPad Touch Usability

- [ ] **IPAD-1**: Pinch-zoom → zoom fluido, no jitter, limiti 0.3-3.0 rispettati
- [ ] **IPAD-2**: Palm rejection → tocco palmo non inizia drag (radiusX > 20 ignorato)
- [ ] **IPAD-3**: Debounce pinch→drag → dopo pinch, 200ms di grazia prima di consentire drag
- [ ] **IPAD-4**: Double-tap zoom → toggle 1.0 ↔ 1.5, centrato sulla posizione tap
- [ ] **IPAD-5**: Touch targets ≥44px su toolbar e controlli

## Integrazione End-to-End

- [ ] **E2E-1**: Sequenza completa: load experiment → drag breadboard → add component → wire → play → no crash
- [ ] **E2E-2**: Zoom in/out con pinch → pan con single finger → drag componente → tutti funzionano senza conflitto
- [ ] **E2E-3**: Build 0 errors, nessun warning nel console browser

---

## Criteri di Successo
- **PASS**: Tutti i test superati senza regressioni
- **PARTIAL**: 1-2 test falliti con workaround disponibile
- **FAIL**: 3+ test falliti o crash bloccante
