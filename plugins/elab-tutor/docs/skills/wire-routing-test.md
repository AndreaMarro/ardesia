# Skill: Wire Routing Test

**Scopo**: Verificare che i fili della batteria 9V siano correttamente instradati senza sovrapposizioni, incroci, o attorcigliamenti.

## Prerequisiti
- Dev server attivo (`npm run dev`)
- Simulatore accessibile su `/#tutor`
- Almeno 1 esperimento con batteria caricato

## Test Procedure

### T1 — Separazione fili batteria (PASS: separazione >= 10px)
1. Caricare esperimento `v1-cap6-esp1` (batteria a sinistra)
2. Estrarre i path SVG dei fili batteria (rosso `#DC2626` e nero `#1A1A1A`)
3. Identificare le coordinate dei "riser" verticali (punto di svolta L-shape)
4. Calcolare `|riserX_positivo - riserX_negativo|`
5. **PASS**: separazione >= 10px (target: 14px con LANE_SEP)

### T2 — Nessun incrocio (PASS: fili non si intersecano)
1. Verificare che il riser del filo positivo sia SEMPRE piu vicino alla breadboard
2. Verificare che il riser del filo negativo sia SEMPRE piu vicino alla batteria
3. Tracciare i segmenti: nessun segmento del filo + deve attraversare un segmento del filo -
4. **PASS**: zero incroci

### T3 — Routing adattivo posizione (PASS: L-shape si adatta)
1. Testare con batteria a sinistra (x < breadboardX): routing orizzontale-dominante
2. Testare con batteria sopra (y < breadboardY): routing verticale-dominante
3. Testare con batteria a destra (x > breadboardX + breadboardW): routing orizzontale inverso
4. **PASS**: ogni posizione produce un L-shape con riser separati

### T4 — Curve smooth (PASS: angoli arrotondati, no spigoli)
1. Verificare che i path SVG usino curve Q (Bezier quadratiche) agli angoli
2. Il raggio di curvatura deve essere R=15 (da buildRoutedPath)
3. **PASS**: ogni angolo ha una curva Q, non un segmento L diretto

### T5 — Multi-esperimento (PASS: routing pulito su 3+ esperimenti)
1. Caricare `v1-cap6-esp1` — verificare T1+T2
2. Caricare `v1-cap6-esp2` — verificare T1+T2
3. Caricare `v1-cap7-esp1` — verificare T1+T2
4. **PASS**: tutti e 3 gli esperimenti hanno fili puliti e separati

### T6 — Zoom resilience (PASS: qualita visiva a zoom diversi)
1. Testare a zoom 100% — fili visibili e separati
2. Testare a zoom 50% — fili ancora distinguibili
3. Testare a zoom 200% — curve smooth, no pixelation
4. **PASS**: qualita visiva mantenuta a tutti i livelli di zoom

## Verifica Automatica (JavaScript Console)

```javascript
// Estrarre separazione riser dai path SVG
(function() {
  const paths = document.querySelectorAll('svg path');
  const batteryWires = Array.from(paths).filter(p => {
    const s = p.getAttribute('stroke');
    const d = p.getAttribute('d') || '';
    return (s === '#DC2626' || s === '#1A1A1A') && d.length > 50;
  });

  const risers = batteryWires.map(p => {
    const d = p.getAttribute('d');
    // Extract Q control points to find riser X position
    const qMatches = [...d.matchAll(/Q\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g)];
    return {
      stroke: p.getAttribute('stroke'),
      qPoints: qMatches.map(m => ({ cx: +m[1], cy: +m[2], x: +m[3], y: +m[4] }))
    };
  });

  console.log('Battery wire risers:', JSON.stringify(risers, null, 2));

  if (risers.length >= 2) {
    const redRiser = risers.find(r => r.stroke === '#DC2626');
    const blackRiser = risers.find(r => r.stroke === '#1A1A1A');
    if (redRiser && blackRiser) {
      // Find the vertical riser X (where wire turns from horizontal to vertical)
      const redX = redRiser.qPoints[1]?.x || 0;
      const blackX = blackRiser.qPoints[1]?.x || 0;
      const sep = Math.abs(redX - blackX);
      console.log(`Separation: ${sep}px (need >= 10px)`);
      console.log(sep >= 10 ? 'PASS' : 'FAIL');
    }
  }
})();
```

## Criteri PASS/FAIL Globali

| Test | Criterio | Weight |
|------|----------|--------|
| T1 | Separazione >= 10px | Critico |
| T2 | Zero incroci | Critico |
| T3 | L-shape adattivo 3 posizioni | Importante |
| T4 | Curve Q smooth | Importante |
| T5 | 3+ esperimenti puliti | Critico |
| T6 | Zoom 50%/100%/200% OK | Minore |

**PASS globale**: T1 + T2 + T5 tutti PASS (critici). T3, T4, T6 sono bonus.

## File Coinvolti
- `src/components/simulator/canvas/WireRenderer.jsx` — `routeToBreadboardPin()` (L-shape routing)
- `src/components/simulator/components/Battery9V.jsx` — pin positions
- `src/data/experiments-vol1.js` — layout positions esperimenti
