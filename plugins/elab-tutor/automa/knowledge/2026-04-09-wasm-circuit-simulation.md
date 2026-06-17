# Research: WebAssembly Circuit Simulation

Data: 2026-04-09

## Fonti
- [EEcircuit: Browser SPICE via WASM](https://github.com/eelab-dev/EEcircuit)
- [ngspiceX: ngspice compiled to WASM](https://shishir-dey.github.io/ngspiceX/)
- [EEsim: Open.Ed SPICE simulator](https://open.ed.ac.uk/eesim-a-circuit-simulator/)
- [Rust + WASM 2025: SIMD changes](https://dev.to/dataformathub/rust-webassembly-2025-why-wasmgc-and-simd-change-everything-3ldh)

## Key Findings

1. **WASM SPICE esiste gia'**: EEcircuit e ngspiceX compilano ngspice in WASM con Emscripten. Funzionano nel browser senza server.

2. **WASM + SIMD = 10-15x piu' veloce di JS**: per operazioni numeriche (come MNA matrix solving). Il CircuitSolver di ELAB fa esattamente questo.

3. **Approccio ibrido**: JS per UI, WASM per calcolo pesante. Figma, Adobe, Google usano questo pattern. ELAB potrebbe fare lo stesso.

4. **WasmGC supportato ovunque**: Chrome 119+, Firefox 120+, Safari 18.2+. Non serve polyfill.

5. **Ma**: il CircuitSolver di ELAB e' 2486 righe JS. Riscriverlo in Rust/C per WASM e' un progetto ENORME (settimane, non ore).

## Applicabilita' ELAB

**NON prioritario ora.** Il CircuitSolver JS funziona e gestisce fino a 15 componenti senza problemi. WASM sarebbe utile per:
- Simulazioni > 50 componenti (ELAB ne usa max 15)
- SPICE-level accuracy (ELAB usa MNA semplificato, sufficiente per K-12)
- Competizione con EEcircuit/ngspiceX (che sono per ingegneri, non bambini)

**Quando considerare WASM**: se ELAB espande a circuiti piu' complessi (filtri, amplificatori, PCB design) — non per il target attuale 8-14 anni.

## Action Items

1. [P4] Bookmarkare EEcircuit come reference per futuro WASM port
2. [P4] Se performance diventa un problema con circuiti complessi, valutare WASM per CircuitSolver
3. [SKIP] Non investire tempo WASM ora — JS basta per il target
