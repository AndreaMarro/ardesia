# SESSION 102 — SCRATCH STEPS PER TUTTI GLI ESPERIMENTI (FASE 4.1 della roadmap S94-S108)
## Scratch Steps · Progressive Build · XML Templates · Galileo Integration

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 9 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge
  ✅ S95 — Toolbar + Panels Minimal
  ✅ S96 — SVG Components + Canvas Polish

FASE 2: FISICA + LOGICA (3 sessioni)
  ✅ S97 — Capacitor + Timing Educational
  ✅ S98 — Component Behavior Parity
  ✅ S99 — Error Feedback + Smart Diagnostics

FASE 3: iPAD COMPLETO (2 sessioni)
  ✅ S100 — iPad Layout Perfection
  ✅ S101 — iPad Touch + Gestures

FASE 4: SCRATCH COMPLETAMENTO (2 sessioni)
  → S102 — Scratch Steps per Tutti gli Esperimenti  ← SEI QUI
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

**Documenti roadmap**: `docs/roadmap/` (8 file MD)
**Dettaglio questa sessione**: `docs/roadmap/FASE-4-SCRATCH.md` → sezione "S102"

---

## ═══ CONTESTO S101 (sessione precedente) ═══════════════════════════

> **S101 ha fatto**:
> - **Touch drag dead zone**: 5px threshold prima che il drag muova il componente. Evita drag accidentali su tap.
> - **Visual drag feedback**: opacity 0.85, drop-shadow, scale(1.03) durante drag. Transition smooth al rilascio.
> - **Double-tap reset zoom**: Doppio tap sullo sfondo (touch only) resetta lo zoom a fit-to-screen.
> - **Long-press haptic + ripple**: navigator.vibrate(50) + CSS ripple animation (500ms expanding circle).
> - **Context menu "Collega Filo"**: Nuovo menu item che entra in wire mode e auto-seleziona il primo pin.
> - **Context menu riordinato**: Ruota → Elimina → Proprietà → Collega Filo (ordine logico).
> - **Swipe gestures (4 handlers)**: Swipe left da bordo destro canvas → apri editor. Swipe right da bordo sinistro editor → chiudi editor. Swipe down su sidebar → chiudi sidebar (iPad ≤1365px). Swipe up su collapsed bottom panel → espandi serial monitor.
> - **Build PASS**: 0 errori, 3 file modificati (SimulatorCanvas.jsx, NewElabSimulator.jsx, ElabSimulator.css).
> - **ZERO regressioni**: Desktop mouse, Scratch, Physics, breakpoints S100 tutti invariati.

### Score attuali (fine S101)
| Area | Score | Target S102 |
|------|-------|-------------|
| Estetica | 8.5/10 | **8.5** (non toccare) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.9/10 | **9.9** (non toccare) |
| Simulatore (physics) | 9.0/10 | **9.0** (non toccare) |
| Scratch | 10.0/10 | **10.0** (non regredire, estendere) |
| Responsive/A11y | 9.2/10 | **9.2** (non toccare) |
| iPad (landscape) | 9.0/10 | **9.0** (non toccare) |
| iPad (portrait) | 8.5/10 | **8.5** (non toccare) |

---

## ═══ COSA FARE IN S102 (5 task) ═══════════════════════════════════

### Task 1: Audit Scratch Steps Coverage
- Leggere `experiments-vol3.js` e identificare tutti i 12 esperimenti AVR con Scratch tab
- Per ognuno: verificare se ha `scratchSteps[]` (step Passo Passo code)
- Report: quanti hanno steps, quanti ne mancano
- Obiettivo: TUTTI i 12 esperimenti devono avere `scratchSteps[]`

### Task 2: Create Missing scratchSteps
- Per ogni esperimento senza `scratchSteps[]`, creare step progressivi
- Ogni step: `{ type: 'code', description: '...', scratchXml: '...' }`
- Step devono essere progressivi: dal blocco più semplice al circuito completo
- Massimo 5-7 step per esperimento

### Task 3: Create Missing scratchXml Templates
- Per ogni esperimento senza `scratchXml` campo, creare il template Blockly XML
- Il template deve rappresentare il programma Arduino completo dell'esperimento
- Usare SOLO blocchi definiti in `scratchBlocks.js`

### Task 4: Verify Galileo Scratch Integration
- Verificare che `scratch.yml` copra tutti i 12 esperimenti
- Verificare che il nanobot risponda correttamente a domande Scratch per ogni esperimento
- Aggiornare `scratch.yml` se necessario

### Task 5: Build + CoV
- `npm run build` → 0 errori
- CoV per ogni modifica:
  - [ ] Tutti i 12 esperimenti AVR hanno scratchSteps
  - [ ] Tutti i 12 esperimenti AVR hanno scratchXml template
  - [ ] Scratch tab visibile per tutti i 12
  - [ ] Passo Passo mostra code steps con icona 🧩
  - [ ] Desktop: ZERO regressioni
  - [ ] Physics: ZERO regressioni

---

## ═══ VINCOLI E REGOLE ═══════════════════════════════════════════════

1. **ZERO regressioni desktop**: Mouse drag, click, scroll devono funzionare identicamente
2. **ZERO regressioni physics**: Non toccare CircuitSolver
3. **ZERO regressioni iPad**: Non toccare le gesture S101
4. **Scratch blocks only**: Usare SOLO blocchi definiti in scratchBlocks.js — NO nuovi blocchi
5. **Token compliance**: Usare SOLO token CSS da design-system.css
6. **Build MUST pass**: `npm run build` con 0 errori prima di chiudere

---

## ═══ DELIVERABLES S102 ═══════════════════════════════════════════════

1. Tutti i 12 esperimenti AVR con scratchSteps[]
2. Tutti i 12 esperimenti AVR con scratchXml template
3. scratch.yml aggiornato se necessario
4. Build PASS + CoV completa
5. `.claude/prompts/session-103-scratch-blocks.md` — prompt per sessione successiva
