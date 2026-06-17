# Architecture Review — ELAB Tutor
> Data: 2026-04-12 | Auditor: Claude Opus 4.6 (Explore agent)

## Numeri Chiave

| Metrica | Valore |
|---------|--------|
| Total LOC (src/) | 106.866 |
| File JSX | 146 |
| File JS | 88 |
| File CSS | 41 (32 modules, 9 globali) |
| Servizi (src/services/) | 25 |
| Fetch calls | 26 (centralizzati in api.js) |
| localStorage keys | 18 (tutti elab_ prefissati) |
| console.log in prod | 4 (basso rischio) |
| useState occorrenze | 780 |
| Context (createContext) | 5 |
| useReducer | 0 |
| Lazy-loaded pages | 12 |
| Max render depth | 6-8 livelli |

## Top 10 File per LOC

| # | File | LOC |
|---|------|-----|
| 1 | experiments-vol1.js | 6892 |
| 2 | experiments-vol3.js | 5665 |
| 3 | experiments-vol2.js | 4294 |
| 4 | TeacherDashboard.jsx | 3437 |
| 5 | SimulatorCanvas.jsx | 3149 |
| 6 | ElabTutorV4.jsx | 2762 |
| 7 | CircuitSolver.js | 2486 |
| 8 | PrivacyPolicy.jsx | 1506 |
| 9 | WireRenderer.jsx | 1414 |
| 10 | AdminEventi.jsx | 1409 |

## Duplicato Trovato

**ExperimentPicker.jsx** esiste in DUE cartelle:
- `src/components/simulator/panels/ExperimentPicker.jsx` (legacy)
- `src/components/lavagna/ExperimentPicker.jsx` (nuovo)

Rischio: import sbagliato. Fix: rinominare il legacy o rimuoverlo se non usato.

## Naming Inconsistency

localStorage keys: mix di `elab-` (9 keys) e `elab_` (9 keys). Standardizzare a `elab_`.

## Valutazione per Vendita

- State management (useState + Context): adeguato per 100K LOC, non serve Redux
- API layer centralizzato: buono, retry + fallback chain
- CSS Modules al 78%: buono, inline legacy da migrare
- Dead code stimato ~5%: accettabile
- 4 console.log: pulito
