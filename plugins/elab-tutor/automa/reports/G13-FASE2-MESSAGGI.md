# G13 FASE 2+3 — Messaggi Contestuali Posizionati

**Data**: 28/03/2026
**Stato**: COMPLETATO

## Cosa è cambiato

### PRIMA
- `UnlimOverlay.jsx`: 3 posizioni fisse hardcoded (top-center, bottom-left, center)
- Tutti i messaggi apparivano in top-center come toast
- Nessun collegamento visivo con i componenti del circuito
- Nessun fumetto/freccia

### DOPO
- `UnlimOverlay.jsx`: sistema di posizionamento contestuale completo
  - `getComponentScreenPosition(componentId)` — trova l'elemento SVG via `data-component-id`
  - `computeBubblePosition(targetPos, containerRect)` — calcola posizione fumetto
  - Preferenza: destra > sinistra > sopra il componente
  - Fallback: centro schermo se componente non trovato
  - `BubbleArrow` — freccia SVG che punta verso il componente
  - Auto-reposition con ResizeObserver
- `useOverlayMessages()` — accetta `targetComponentId` e `position: 'contextual'`
- `SimulatorCanvas.jsx` — aggiunto `data-component-id={comp.id}` al `<g>` wrapper
- `UnlimWrapper.jsx`:
  - Estrae componentId da `[azione:highlight:xxx]` nella risposta AI
  - Passa `targetComponentId` a `showMessage`
  - Listener `unlim-contextual-message` per messaggi da ElabTutorV4
- `ElabTutorV4.jsx`:
  - Dispatch `unlim-contextual-message` quando esegue highlight action
  - Il fumetto appare accanto al componente evidenziato

### Flusso completo
1. Utente chiede "mostrami il LED" → Galileo risponde con `[azione:highlight:led1]`
2. ElabTutorV4 parsa il tag, chiama `highlightComponent(['led1'])`
3. ElabTutorV4 dispatcha `unlim-contextual-message` con `targetComponentId: 'led1'`
4. UnlimWrapper riceve l'evento, chiama `showMessage` con `position: 'contextual'`
5. UnlimOverlay trova `[data-component-id="led1"]` nel DOM
6. Calcola posizione via `getBoundingClientRect()`, mostra fumetto con freccia

### File modificati
- `src/components/unlim/UnlimOverlay.jsx` — riscrittura completa
- `src/components/unlim/UnlimWrapper.jsx` — 2 modifiche (event listener + targetComponentId)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — 1 riga (data-component-id)
- `src/components/tutor/ElabTutorV4.jsx` — 8 righe (dispatch event su highlight)

### Build
- PASSA (28s, 19 entries PWA)
