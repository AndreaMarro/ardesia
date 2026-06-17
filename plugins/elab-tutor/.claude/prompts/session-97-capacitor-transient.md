# SESSION 97 — CAPACITOR + TIMING EDUCATIONAL (FASE 2.1 della roadmap S94-S108)
## Carica/Scarica Visuale · LED Brightness Proporzionale · CircuitSolver Update · ZERO REGRESSIONI

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 4 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati) — 40+ hex → var(), 7 nuovi token
  ✅ S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati) — 5 nuovi token, 17 edits, 6 file
  ✅ S96 — SVG Components + Canvas Polish — 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens

FASE 2: FISICA + LOGICA (3 sessioni)
  → S97 — Capacitor + Timing Educational  ← SEI QUI
     S98 — Component Behavior Parity
     S99 — Error Feedback + Smart Diagnostics

FASE 3: iPAD COMPLETO (2 sessioni)
     S100 — iPad Layout Perfection
     S101 — iPad Touch + Gestures

FASE 4: SCRATCH COMPLETAMENTO (2 sessioni)
     S102 — Scratch Steps per Tutti gli Esperimenti
     S103 — Scratch Blocks + Generator Expansion

FASE 5: GALILEO ONNISCIENTE (3 sessioni)
     S104 — Galileo Context Engine
     S105 — Galileo New Powers
     S106 — Galileo Stress Test + Personality

FASE 6: RIFINITURA + ACCESSIBILITÀ (1 sessione)
     S107 — UX Polish + Accessibility

FASE 7: AUDIT FINALE (1 sessione)
     S108 — Grand Final Audit + Deploy
```

**Documenti roadmap**: `docs/roadmap/` (8 file MD: README, 00-STATO-ATTUALE, 01-PIANO-MAESTRO, FASE-1 a FASE-7)
**Dettaglio questa sessione**: `docs/roadmap/FASE-2-FISICA.md` → sezione "S97 — Capacitor + Timing Educational"

---

## ═══ CONTESTO S94+S95+S96 (sessioni precedenti) ═══════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. Token totali da 84 → 91.
>
> **S95 ha fatto**: 5 nuovi token (spacing + shadow), 17 edits in 6 file, tokenizzati border-radius, box-shadow, transitions. Token totali da 91 → 96.
>
> **S96 ha fatto**:
> - **Task 1**: Classificato 387 hex in 22 SVG componenti come UI (tokenizzabile) vs Physical (intoccabile)
> - **Task 2**: Tokenizzato hex UI in 22 SVG files (8 batch, build dopo ogni batch) — AI highlight `#7CB342` → `var(--color-accent, #7CB342)` in tutti i componenti
> - **Task 3**: Aggiunto `role="img"` + `aria-label` in italiano su 20 componenti (escluso Wire by design). Verificato nel build bundle: 20 aria-label presenti.
> - **Task 4**: Tokenizzato 13 hex UI nel canvas (SimulatorCanvas.jsx) — selezione, multi-selezione, delete/rotate buttons, pin hover, drag preview, selection box, drop error/success flash, drop zones, snap ghost, highlighted holes
> - **Task 5**: Build PASS (0 errori), 116 CSS var() token references nel bundle, 20 aria-label confermati
> - **Task 6**: Scratch Gate SG1-SG10 PASS — zero file Scratch modificati
>
> **File modificati in S96**: 22 SVG componenti + SimulatorCanvas.jsx (23 file totali)

### Score attuali (fine S96)
| Area | Score | Target S97 |
|------|-------|------------|
| Estetica | 8.5/10 | **8.5** (non toccare in S97) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.8/10 | **9.8** (ZERO regressioni) |
| Simulatore (physics) | 7.0/10 | **8.0-8.5** (+1.0-1.5 da capacitor timing) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| Responsive/A11y | 8.0/10 | **8.0** |

---

## ═══ ANALISI PRE-FATTA: CircuitSolver + Capacitor ═══════════════════

### Stato attuale del CircuitSolver
Il CircuitSolver gestisce circuiti DC stazionari con KVL/KCL. I condensatori non hanno alcun comportamento dinamico — vengono trattati come circuiti aperti (nessuna corrente passa).

### Gap: cosa manca
- **Nessuno stato temporale**: il solver calcola un singolo punto di equilibrio, non ha concetto di "tempo" o "step"
- **Nessuna variabile `capacitorVoltage`**: i condensatori non accumulano carica
- **Nessun effetto sul circuito**: la tensione ai capi del condensatore non influenza LED/motori

### Approccio Educational (dal roadmap FASE-2)
NON implementare full transient analysis (Euler/RK4). Approccio semplificato:
- **Carica**: `V += (Vsource - V) / steps` per tick (rampa esponenziale semplificata)
- **Scarica**: `V -= V / steps` quando scollegato
- **Visualizzazione**: fill progressivo nel componente SVG (come un bicchiere che si riempie)
- **Effetto LED**: brightness proporzionale alla corrente che dipende da V_capacitor
- **steps**: proporzionale a R×C (ma in unità di tick simulazione, non secondi reali)

### File coinvolti
```
src/components/simulator/engine/CircuitSolver.js     # Logica carica/scarica
src/components/simulator/components/Capacitor.jsx     # Visual gauge (fill level)
src/data/experiments-vol2.js                          # Esperimenti con condensatore
```

---

## ═══ COSA FARE IN S97 (5 task) ═══════════════════════════════════

### Task 1: Analizzare CircuitSolver per integrazione condensatore
Leggere `CircuitSolver.js` approfonditamente. Capire:
- Come viene chiamato il solver (singolo shot vs loop)
- Dove vengono calcolati corrente/tensione per ogni componente
- Come aggiungere stato persistente (`capacitorVoltage`) tra tick
- Come la simulazione avanza nel tempo (requestAnimationFrame? setInterval?)

### Task 2: Implementare logica carica/scarica nel CircuitSolver
- Aggiungere stato `capacitorVoltage` (Map: componentId → voltage)
- Logica per tick di simulazione:
  - Se connesso a sorgente: `V += (Vsource - V) / steps`
  - Se disconnesso: `V -= V / steps`
  - `steps` = funzione del valore RC (proporzionale)
- Il condensatore fornisce la sua tensione accumulata al circuito

### Task 3: Aggiungere visualizzazione livello carica in Capacitor.jsx
- Rettangolo colorato che sale dal basso proporzionale a `state.chargeLevel` (0.0-1.0)
- Colore: variante leggera dell'accent o giallo → verde gradiente
- Animazione smooth (CSS transition o SVG animate)
- **NON modificare pin positions o dimensioni body**

### Task 4: Build + Chrome Control Verification
- `npm run build` → 0 errori
- Dev server → caricare esperimento con condensatore
- Play → LED si accende gradualmente?
- Disconnettere → LED si spegne gradualmente?
- Condensatore SVG mostra fill che sale/scende?
- Serial Monitor mostra valore che cambia?

### Task 5: Scratch Gate SG1-SG10
- Code-verified: nessun file Scratch modificato
- Build PASS
- Extra: compilare esperimento con condensatore in Blocchi → funziona?

---

## ═══ COSA NON TOCCARE ═══════════════════════════════════════════

1. **SVG component colors**: S96 ha tokenizzato tutto, non servono ulteriori modifiche estetiche
2. **Pin positions**: INTOCCABILI su tutti i componenti
3. **aria-label**: già aggiunti in S96, non modificare
4. **Layout/CSS**: non toccare toolbar, panels, spacing
5. **Scratch/Blockly**: non toccare nulla relativo a Blockly workspace
6. **iPad breakpoints**: non toccare media queries

---

## ═══ CONTEXT FILES ═══════════════════════════════════════════════

### Tier 1: LEGGERE SUBITO
```
src/components/simulator/engine/CircuitSolver.js     # Solver principale
src/components/simulator/components/Capacitor.jsx     # Componente SVG condensatore
```

### Tier 2: LEGGERE PER TASK 2-3
```
src/components/simulator/NewElabSimulator.jsx         # Simulation loop (dove viene chiamato il solver)
src/data/experiments-vol2.js                          # Esperimenti con condensatore
```

### Tier 3: REFERENCE
```
src/styles/design-system.css                          # Token reference
docs/roadmap/FASE-2-FISICA.md                        # Roadmap FASE 2 dettaglio
docs/roadmap/01-PIANO-MAESTRO.md                     # Roadmap completo
```

---

## ═══ REGOLE INVIOLABILI ═══════════════════════════════════════════

1. **ZERO REGRESSIONI**: Se funzionava in S96, DEVE funzionare in S97. Se rotto → REVERT IMMEDIATO.
2. **MAI agenti paralleli**: Tutto sequenziale, verificato passo passo.
3. **Chrome Control per validazione**: Senza `preview_inspect` / `preview_eval` / `preview_screenshot` = non puoi dire PASS.
4. **Approccio EDUCATIONAL**: No formule complesse. Rampa lineare/esponenziale semplificata, feedback visivo chiaro.
5. **Pin positions INTOCCABILI**: Su TUTTI i componenti, specialmente Capacitor.jsx.
6. **Scratch Gate SG1-SG10 obbligatorio**: Anche se non tocchiamo Scratch, verificare che non abbiamo rotto nulla.
7. **Commit solo su richiesta**: NON commit automatici.
8. **CoV obbligatorio**: Chain of Verification su OGNI modifica.

---

## ═══ DELIVERABLES S97 ═══════════════════════════════════════════

1. ✅ CircuitSolver con logica carica/scarica condensatore
2. ✅ Capacitor.jsx con visualizzazione livello carica (fill gauge)
3. ✅ LED brightness proporzionale alla corrente del condensatore
4. ✅ Build 0 errori
5. ✅ Chrome Control verification (carica graduale, scarica graduale, visual gauge)
6. ✅ Scratch Gate SG10 PASS

### Score card attesa post-S97
| Area | Score | Delta |
|------|-------|-------|
| Simulatore (physics) | 8.0-8.5/10 | +1.0-1.5 (capacitor timing) |
| Estetica | 8.5/10 | = |
| Code Quality | 9.8/10 | = |
| Regressioni | **ZERO** | — |

---

## ═══ HANDOFF OBBLIGATORIO ═══════════════════════════════════════════

**A fine sessione DEVI**:

1. **Stringa di handoff** — Riassunto completo di cosa è stato fatto, file modificati, score aggiornati.
2. **Prompt S98** — Scrivi e salva il prompt per la sessione successiva in `.claude/prompts/session-98-component-behavior.md`. Il prompt deve:
   - Includere la mappa roadmap 15 sessioni con `← SEI QUI` aggiornato su S98
   - Riassumere cosa ha fatto S94-S97 (contesto per S98)
   - Contenere l'analisi pre-fatta per S98 (component behavior parity: LED PWM, buzzer tone, motor rotation, servo angle)
   - Seguire lo stesso formato di questo prompt
   - Riferirsi a `docs/roadmap/FASE-2-FISICA.md` per dettaglio S98

### Catena obbligatoria
```
✅ S95 produce → .claude/prompts/session-96-svg-canvas-polish.md
✅ S96 produce → .claude/prompts/session-97-capacitor-transient.md
S97 produce → .claude/prompts/session-98-component-behavior.md
S98 produce → .claude/prompts/session-99-error-feedback.md
S99 produce → .claude/prompts/session-100-ipad-layout.md
S100 produce → .claude/prompts/session-101-ipad-touch.md
S101 produce → .claude/prompts/session-102-scratch-steps.md
S102 produce → .claude/prompts/session-103-scratch-blocks.md
S103 produce → .claude/prompts/session-104-galileo-context.md
S104 produce → .claude/prompts/session-105-galileo-powers.md
S105 produce → .claude/prompts/session-106-galileo-stress.md
S106 produce → .claude/prompts/session-107-ux-a11y.md
S107 produce → .claude/prompts/session-108-grand-final.md
S108 → FINE ROADMAP 🎉
```

**Se la sessione finisce senza aver scritto il prompt della successiva, la sessione NON è completa.**
Il prompt successivo DEVE includere la sezione HANDOFF OBBLIGATORIO con la stessa catena aggiornata.
