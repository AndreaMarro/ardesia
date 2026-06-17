# G53 — GIOCHI: DA TESTO A VISUALE + OFFLINE FALLBACK

## Contesto
Fase 4 del piano sanamento: giochi e Scratch. Tutti i 4 giochi sono text-based — nessuna visualizzazione circuiti. Aggiungere miniature SVG e fallback offline per CircuitReview.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`

## STATO PRE-SESSIONE (da verificare)
- Test PASS count: ___  | Build time: ___s | Bundle: ___KB | Console errors: ___
- Deploy: https://www.elabtutor.school
- 62 esperimenti, 62 lesson paths, HEX precompilati (da G52)

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Budget: €50/mese (Claude escluso). Niente servizi costosi.

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors

---

## TASK 1 — CircuitMiniature.jsx: miniatura SVG dei circuiti (~150 righe) (2h)

### File da leggere PRIMA
- `src/data/broken-circuits.js` — struttura dati circuiti rotti (Circuit Detective)
- `src/data/mystery-circuits.js` — struttura dati circuiti misteriosi
- `src/components/games/CircuitDetective.jsx` — dove aggiungere la miniatura

### Creare `src/components/games/CircuitMiniature.jsx`
```jsx
/**
 * Miniatura SVG di un circuito per i giochi.
 * Renderizza componenti e connessioni in un mini-SVG 250x180.
 *
 * Props:
 * - components: [{ type: 'battery'|'led'|'resistor'|'wire'|..., x, y, value }]
 * - connections: [{ from, to }]
 * - highlightFault: string|null — ID del componente guasto (evidenziato in rosso)
 * - width: number (default 250)
 * - height: number (default 180)
 */
import React from 'react';

// Palette del progetto
const COLORS = {
  battery: '#1E4D8C',   // Navy
  led: '#E54B3D',       // Vol3 red
  resistor: '#4A7A25',  // Lime
  wire: '#333333',
  fault: '#E54B3D',     // Evidenzia guasto
  background: '#F8F9FA'
};

// Componenti SVG semplificati
function BatteryIcon({ x, y, highlighted }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-12} y={-8} width={24} height={16} rx={2}
        fill="none" stroke={highlighted ? COLORS.fault : COLORS.battery} strokeWidth={2} />
      <line x1={-6} y1={-4} x2={-6} y2={4} stroke={COLORS.battery} strokeWidth={2} />
      <line x1={-2} y1={-6} x2={-2} y2={6} stroke={COLORS.battery} strokeWidth={3} />
      <text x={8} y={4} fontSize={8} fill={COLORS.battery}>+</text>
    </g>
  );
}

function LedIcon({ x, y, highlighted }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-8 8,4 -8,4"
        fill={highlighted ? COLORS.fault : COLORS.led} opacity={0.8} />
      <line x1={-8} y1={6} x2={8} y2={6}
        stroke={highlighted ? COLORS.fault : COLORS.led} strokeWidth={2} />
    </g>
  );
}

function ResistorIcon({ x, y, highlighted }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polyline points="-12,0 -8,-6 -4,6 0,-6 4,6 8,-6 12,0"
        fill="none" stroke={highlighted ? COLORS.fault : COLORS.resistor} strokeWidth={2} />
    </g>
  );
}

// ... aggiungere altri componenti secondo i type usati nei dati

export default function CircuitMiniature({
  components = [], connections = [], highlightFault = null,
  width = 250, height = 180
}) {
  // Mappa type -> componente SVG
  const componentMap = { battery: BatteryIcon, led: LedIcon, resistor: ResistorIcon };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      style={{ background: COLORS.background, borderRadius: 8, border: '1px solid #ddd' }}
      role="img" aria-label="Miniatura del circuito">
      {/* Connessioni (wires) */}
      {connections.map((conn, i) => {
        const from = components.find(c => c.id === conn.from);
        const to = components.find(c => c.id === conn.to);
        if (!from || !to) return null;
        return (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={COLORS.wire} strokeWidth={1.5} />
        );
      })}
      {/* Componenti */}
      {components.map((comp) => {
        const Icon = componentMap[comp.type];
        if (!Icon) return null;
        return <Icon key={comp.id} x={comp.x} y={comp.y}
          highlighted={comp.id === highlightFault} />;
      })}
    </svg>
  );
}
```

### Integrare in CircuitDetective.jsx
- Importare `CircuitMiniature`
- Accanto alla descrizione testuale del circuito rotto, aggiungere:
```jsx
<CircuitMiniature
  components={currentCircuit.components}
  connections={currentCircuit.connections}
  highlightFault={showAnswer ? currentCircuit.faultComponentId : null}
/>
```

### NOTA
I dati in `broken-circuits.js` potrebbero NON avere coordinate x/y. In quel caso:
- Aggiungere un layout automatico semplice (griglia o cerchio)
- Oppure aggiungere coordinate ai dati (preferibile, piu controllo)

### Verifica browser
- Aprire gioco Circuit Detective
- Deve apparire miniatura SVG accanto al testo
- Quando si rivela la risposta, il componente guasto deve essere evidenziato in rosso

---

## TASK 2 — Reverse Engineering Lab: SVG con test point funzionali (1h)

### File da leggere PRIMA
- `src/components/games/ReverseEngineeringLab.jsx` — cercare il mini-SVG decorativo
- `src/data/mystery-circuits.js` — cercare `expectedValues` o struttura simile

### Implementazione
Il mini-SVG in ReverseEngineeringLab.jsx ha gia test point — renderli cliccabili:

1. Ogni test point deve avere un handler `onClick`:
```jsx
<circle cx={point.x} cy={point.y} r={6}
  fill="transparent" stroke="#1E4D8C" strokeWidth={2}
  style={{ cursor: 'pointer' }}
  onClick={() => handleProbeClick(point)}
  role="button" tabIndex={0} aria-label={`Punto di test ${point.label}`}
/>
```

2. Al click, mostrare il valore reale in un tooltip/popup:
```jsx
{probeResult && (
  <div style={{
    position: 'absolute', background: '#1E4D8C', color: 'white',
    padding: '4px 8px', borderRadius: 4, fontSize: 13
  }}>
    {probeResult.type === 'voltage'
      ? `Tensione: ${probeResult.value}V`
      : `Corrente: ${probeResult.value}mA`}
  </div>
)}
```

3. I valori vengono da `mystery-circuits.js`:
```javascript
// Usare i dati gia presenti nel circuito corrente
const probeValue = currentCircuit.expectedValues?.[point.id];
```

### Verifica
- Aprire gioco Reverse Engineering
- Cliccare sui test point del mini-SVG
- Deve mostrare valori reali (tensione o corrente)

---

## TASK 3 — CircuitReview offline fallback (1h)

### Problema
CircuitReview genera domande via AI (Galileo/nanobot). Quando l'AI non risponde, il gioco non funziona. Servono domande pre-generate come fallback.

### Creare `src/data/review-circuits.js`
```javascript
/**
 * 10 circuiti pre-generati per CircuitReview offline fallback.
 * Struttura identica a quella generata dall'AI.
 */
export const offlineReviewCircuits = [
  {
    id: 'review-offline-1',
    description: 'Un circuito con un LED rosso collegato a una batteria da 9V tramite una resistenza da 330 ohm.',
    components: ['Batteria 9V', 'Resistenza 330Ω', 'LED rosso'],
    questions: [
      {
        text: 'Perche serve la resistenza in questo circuito?',
        correctAnswer: 'Limita la corrente per non bruciare il LED',
        options: [
          'Limita la corrente per non bruciare il LED',
          'Aumenta la luminosita del LED',
          'Serve per accendere il LED',
          'Non serve, e opzionale'
        ],
        explanation: 'Senza la resistenza, la corrente sarebbe troppo alta e il LED si brucerebbe. La resistenza limita la corrente a un valore sicuro.'
      },
      // ... 2-3 domande per circuito
    ]
  },
  // ... altri 9 circuiti con temi diversi:
  // Circuito con potenziometro, con buzzer, con motore DC,
  // con 2 LED in serie, con 2 LED in parallelo, con LDR,
  // con servo, con LCD, con bottone pull-up, con divisore di tensione
];
```

### Modificare CircuitReview per usare il fallback
- File: `src/components/games/CircuitReview.jsx` (o nome simile)
- Dove chiama l'AI per generare domande:
```javascript
import { offlineReviewCircuits } from '../../data/review-circuits';

async function getReviewCircuit() {
  try {
    // Tenta AI
    const result = await fetchFromAI(/* ... */);
    if (result) return result;
  } catch { /* AI non disponibile */ }

  // Fallback: circuito random pre-generato
  const idx = Math.floor(Math.random() * offlineReviewCircuits.length);
  return offlineReviewCircuits[idx];
}
```

### Verifica
- Offline -> aprire CircuitReview -> deve funzionare con domande pre-generate
- Online -> aprire CircuitReview -> deve usare AI (se disponibile)
- Lo studente non deve notare differenza nell'interfaccia

---

## TASK 4 — "Prova nel simulatore" senza navigare via (1h)

### File da leggere PRIMA
- `src/components/games/CircuitDetective.jsx` — cercare "Prova nel simulatore" o "onOpenSimulator"

### Problema
Quando lo studente clicca "Prova nel simulatore" dal gioco, viene navigato al simulatore e perde il contesto del gioco.

### Implementazione
Invece di navigare via, caricare l'esperimento nel simulatore E tenere aperto il pannello gioco:

```javascript
// PRIMA (probabilmente):
// onClick={() => navigate(`#prova/${experimentId}`)}

// DOPO:
onClick={() => {
  // Carica l'esperimento nel simulatore
  onOpenSimulator(experimentId);
  // NON chiudere il pannello gioco — lasciarlo aperto
  // Lo studente vede circuito E gioco contemporaneamente
}}
```

Se il layout non supporta la vista affiancata:
- Opzione A: Aprire il simulatore in un pannello laterale (split view)
- Opzione B: Mostrare un bottone "Torna al gioco" nel simulatore per navigare indietro
- Opzione C: Aprire in una nuova tab del browser `window.open('#prova/' + experimentId, '_blank')`

**Scegliere l'opzione piu semplice che funziona.** Non fare overengineering.

### Verifica
- Nel gioco Circuit Detective, cliccare "Prova nel simulatore"
- Il simulatore deve aprirsi con l'esperimento corretto
- Lo studente deve poter tornare al gioco facilmente

---

## TASK 5 — Test per CircuitMiniature (30min)

### Creare `tests/unit/CircuitMiniature.test.jsx`
```javascript
import { render, screen } from '@testing-library/react';
import CircuitMiniature from '../../src/components/games/CircuitMiniature';
import { describe, it, expect } from 'vitest';

describe('CircuitMiniature', () => {
  const mockComponents = [
    { id: 'bat1', type: 'battery', x: 50, y: 90 },
    { id: 'led1', type: 'led', x: 200, y: 90 },
    { id: 'res1', type: 'resistor', x: 125, y: 40 }
  ];
  const mockConnections = [
    { from: 'bat1', to: 'res1' },
    { from: 'res1', to: 'led1' }
  ];

  it('renderizza SVG con dimensioni corrette', () => {
    const { container } = render(
      <CircuitMiniature components={mockComponents} connections={mockConnections} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('250');
    expect(svg.getAttribute('height')).toBe('180');
  });

  it('renderizza tutti i componenti', () => {
    const { container } = render(
      <CircuitMiniature components={mockComponents} connections={mockConnections} />
    );
    // Ci devono essere 3 gruppi (g) per i componenti
    const groups = container.querySelectorAll('svg > g');
    expect(groups.length).toBeGreaterThanOrEqual(3);
  });

  it('renderizza le connessioni come linee', () => {
    const { container } = render(
      <CircuitMiniature components={mockComponents} connections={mockConnections} />
    );
    const lines = container.querySelectorAll('svg > line');
    expect(lines.length).toBe(2);
  });

  it('evidenzia il componente guasto', () => {
    const { container } = render(
      <CircuitMiniature
        components={mockComponents}
        connections={mockConnections}
        highlightFault="led1"
      />
    );
    // Il LED guasto deve avere colore rosso di evidenziazione
    // Verificare che almeno un elemento abbia il colore fault
    const svg = container.querySelector('svg');
    expect(svg.innerHTML).toContain('#E54B3D');
  });

  it('gestisce componenti vuoti senza crash', () => {
    const { container } = render(<CircuitMiniature />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('ha aria-label per accessibilita', () => {
    const { container } = render(
      <CircuitMiniature components={mockComponents} connections={mockConnections} />
    );
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toContain('circuito');
  });
});
```

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (test count >= baseline + nuovi test)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale

## Anti-regressione specifica G53
- [ ] CircuitMiniature renderizza SVG con battery, LED, resistor
- [ ] Circuit Detective mostra miniatura accanto al testo
- [ ] Componente guasto evidenziato in rosso quando risposta rivelata
- [ ] Reverse Engineering: test point cliccabili mostrano valori reali
- [ ] CircuitReview funziona offline con domande pre-generate
- [ ] CircuitReview funziona online con AI (quando disponibile)
- [ ] "Prova nel simulatore" non fa perdere il contesto del gioco
- [ ] Test CircuitMiniature.test.jsx tutti PASS
- [ ] 0 console errors in production build
- [ ] Build passa, tutti i test passano

## Score atteso dopo G53: **7.7/10**
