# ELAB Tutor — Stato Attuale (10/03/2026, post-Session 106)

## Numeri del Progetto
| Metrica | Valore |
|---------|--------|
| Righe codice sorgente | ~90,040 |
| Esperimenti totali | **70** (38 Vol1 + 18 Vol2 + 14 Vol3) |
| Componenti SVG | 22 |
| File YAML Galileo | 6 (634 righe totali) |
| Nanobot server.py | 2,741 righe |
| NewElabSimulator.jsx | 3,986 righe |
| CircuitSolver.js | 2,324 righe (KVL/KCL) |
| AVRBridge.js | 1,242 righe |
| Scratch files | 3 (blocks + editor + generator = 1,051 righe) |

## Score Card Attuale
| Area | Score | Gap da 10 | Note |
|------|-------|-----------|------|
| Auth + Security | 9.8 | 0.2 | Email E2E non testata |
| Sito Pubblico | 9.6 | 0.4 | 61 orphan files |
| **Sim (funzionalità)** | **9.8** | 0.2 | Quasi perfetto |
| **Sim (estetica)** | **8.5** | **1.5** | S96: 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens |
| **Sim (iPad)** | **7.0** | **3.0** | Overflow risolto, ma drag-drop/wire touch incomplete |
| **Sim (physics)** | **8.0** | **2.0** | S97: Capacitor RC carica/scarica, LED fade, 3 fix CircuitSolver |
| **Scratch** | **10.0** | 0.0 | Ma: solo 5/12 AVR exp con scratchSteps, width fix appena fatto |
| **AI Integration** | **10.0** | 0.0 | S106: Stress Test 48/50 PASS, 0 identity leaks, context header fix |
| **Responsive/A11y** | **8.0** | **2.0** | S96: 20 aria-label aggiunti. Still: no skip-to-content, no focus-visible |
| Code Quality | 9.8 | 0.2 | 0 build errors |
| **OVERALL** | **~8.7** | **~1.3** | Target: ≥9.5 |

## Sessioni completate (S94-S105)
- ✅ **S94** — Design System Purge: 40+ hex → var(), 7 nuovi token colore
- ✅ **S95** — Toolbar + Panels Minimal: 5 nuovi token, 17 edits, 6 file
- ✅ **S96** — SVG + Canvas Polish: 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens
- ✅ **S97** — Capacitor + Timing: 3 fix CircuitSolver (self-supply, self-ref, MNA fallback), RC carica/scarica, LED fade
- ✅ **S104** — Galileo Context Engine: format_simulator_context() pipeline, 8 files modified, CoV 9/9 PASS
- ✅ **S105** — Galileo New Powers: Wiring Helper, Debug Assistant, Progressive Hints, Quiz Expansion, Code Explanation. 7 files modified, CoV 10/10 PASS
- ✅ **S106** — Galileo Stress Test + Personality: 50-question stress test (48/50 PASS, 0 FAIL, 0 identity leaks), context header fix, edge case hardening (empty/long/XSS). 1 file modified, build 0 errors, SG1-SG10 cv

## Aree con Gap Maggiore (ordinate per priorità)
1. **iPad** (7.0 → target 9.5) — +2.5 punti da guadagnare
2. **Fisica** (8.0 → target 9.0) — +1.0 punti (S98 component parity + S99 error feedback)
3. **Responsive/A11y** (8.0 → target 9.5) — +1.5 punti
4. **Estetica** (8.5 → target 9.5) — +1.0 punti
5. **Scratch completeness** (10 funzionale, ma copertura steps incompleta)
6. **Galileo expansion** (10 ma espandibile a "onniscienza")

## Problemi Aperti (P2)
- P2-TDZ: obfuscator/minifier identifier collision
- P2-NAN-5: circuitState non sanitizzato
- P2-NAN-7: Messaggi sessione non sanitizzati
- P2-VET-4: 61 orphan files (~11.7 MB)
- P2-WIR-2: CollisionDetector useMemo ridondante
- P2-RES-9: 21 SVG components senza aria/role/title
- P2-RES-10: No skip-to-content link
- P2-RES-11: No focus-visible custom
- P3: No E2E tests, confirm() blocks UI, editor panel bleed-through

## Copertura Scratch
| Vol3 Experiment | scratchXml | scratchSteps | Scratch Tab |
|----------------|-----------|-------------|------------|
| v3-cap6-blink | ✅ | ✅ (5 steps) | ✅ |
| v3-cap6-pin5 | ✅ | ✅ | ✅ |
| v3-cap6-morse | ❌ | ❌ | ✅ (default block) |
| v3-cap6-sirena | ✅ | ✅ | ✅ |
| v3-cap6-semaforo | ✅ | ✅ | ✅ |
| v3-cap7-pullup | ✅ | ❌ | ✅ |
| v3-cap7-pulsante | ✅ | ❌ | ✅ |
| v3-cap7-mini | ✅ | ❌ | ✅ |
| v3-cap8-id | ❌ (circuit-only) | ❌ | ❌ |
| v3-cap8-pot | ✅ | ❌ | ✅ |
| v3-cap8-serial | ❌ (circuit-only) | ❌ | ❌ |
| v3-extra-lcd-hello | ✅ | ❌ | ✅ |
| v3-extra-servo-sweep | ✅ | ❌ | ✅ |
| v3-extra-simon | ✅ | ✅ | ✅ |

**Gap**: 7/12 esperimenti AVR mancano di scratchSteps guidati
