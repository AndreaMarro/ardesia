# Antigravity Phase 4 — Measurement APIs

## Contesto

Stai lavorando su ELAB Tutor, un simulatore di circuiti educativo.
Il `CircuitSolver` (2276 righe, `/src/components/simulator/engine/CircuitSolver.js`) già contiene:
- Capacitor transient model completo (`_solveCapacitor`, L1848-1934)
- MNA con partial pivoting e row scaling (`_solveMNA`, L1186; `_gaussianElimination`, L1466-1542)
- Dati interni: `this._mnaNodeVoltages` (Map: net rep → V), `this._mnaBranchCurrents` (Map: compId → A)
- Per-component state con `voltage`/`current` in `comp.state` per LED, resistor, capacitor, etc.

**Mancano le API pubbliche** per esporre queste misure al resto dell'app (Lab Notebook, Galileo, Multimeter API).

## Task 4.1 — `getNodeVoltages()`

Aggiungere un metodo pubblico a `CircuitSolver` (classe a L74) che restituisce le tensioni ai nodi.

**Dove**: subito dopo `getState()` (L319-325).

**Implementazione**:

```javascript
/**
 * Returns node voltages as a plain object.
 * Keys are pin references (e.g. "bb1:e5"), values are voltages in Volts.
 * Falls back to supply net voltages when MNA hasn't run.
 * @returns {Object} e.g. { "bb1:e5": 5.0, "bb1:a3": 2.1, "nano-r4:GND": 0 }
 */
getNodeVoltages() {
  const voltages = {};

  if (this._mnaNodeVoltages && this._mnaNodeVoltages.size > 0) {
    // MNA results: most accurate (parallel paths resolved)
    this._mnaNodeVoltages.forEach((v, netRep) => {
      voltages[netRep] = Math.round(v * 1000) / 1000; // 3 decimal places
    });
  } else if (this._supplyNets && this._supplyNets.size > 0) {
    // Fallback: supply nets from path-tracer (simple series circuits)
    this._supplyNets.forEach((v, netRep) => {
      voltages[netRep] = Math.round(v * 1000) / 1000;
    });
  }

  return voltages;
}
```

## Task 4.2 — `getComponentCurrents()`

Aggiungere un metodo pubblico che restituisce le correnti per ogni componente.

**Dove**: subito dopo `getNodeVoltages()`.

**Implementazione**:

```javascript
/**
 * Returns component currents as a plain object.
 * Keys are component IDs (e.g. "led1", "r1"), values are currents in Amps.
 * Uses MNA branch currents when available, falls back to per-component state.
 * @returns {Object} e.g. { "led1": 0.015, "r1": 0.015, "cap1": 0.002 }
 */
getComponentCurrents() {
  const currents = {};

  this.components.forEach((comp, id) => {
    // Priority 1: MNA branch current (most accurate for parallel paths)
    if (this._mnaBranchCurrents && this._mnaBranchCurrents.has(id)) {
      currents[id] = Math.round(this._mnaBranchCurrents.get(id) * 10000) / 10000; // 4 decimals
    }
    // Priority 2: per-component state current (from path-tracer solvers)
    else if (comp.state && typeof comp.state.current === 'number' && comp.state.current !== 0) {
      currents[id] = Math.round(comp.state.current * 10000) / 10000;
    }
    // Skip components with no current info (breadboard, nano-r4, etc.)
  });

  return currents;
}
```

## Verifiche

1. `npm run build` — 0 errori
2. Entrambi i metodi devono restituire `{}` vuoto quando nessun esperimento è caricato (nessun crash)
3. Non modificare NIENT'ALTRO nel file — solo aggiungere i 2 metodi dopo `getState()` (L325)
4. Non toccare `_solveMNA`, `_gaussianElimination`, `_solveCapacitor`, o qualsiasi altro metodo esistente

## Output atteso

Al termine, riportare:
- EXIT CODE del build
- Le righe esatte dove sono stati aggiunti i 2 metodi
- Un rapido check: `getNodeVoltages` e `getComponentCurrents` restituiscono `{}` quando chiamati su un solver vuoto
