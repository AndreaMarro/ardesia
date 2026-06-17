# SESSION 101 — iPAD TOUCH + GESTURES (FASE 3.2 della roadmap S94-S108)
## Touch Gestures · Drag Refinement · Pinch-Zoom · Long Press · Swipe · Haptics

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 8 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
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
  → S101 — iPad Touch + Gestures  ← SEI QUI

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

**Documenti roadmap**: `docs/roadmap/` (8 file MD)
**Dettaglio questa sessione**: `docs/roadmap/FASE-3-IPAD.md` → sezione "S101"

---

## ═══ CONTESTO S100 (sessione precedente) ═══════════════════════════

> **S100 ha fatto**:
> - **Breakpoint consolidation**: Rimosso 900px e 1400px standalone. 3 canonical: 768, 1024, 1366. Riferimento in design-system.css.
> - **iPad Landscape**: Hamburger visibile su iPad (hidden solo ≥1366px desktop). Sidebar toggle funzionante.
> - **iPad Portrait**: ALL toolbar labels hidden (icons-only). Slide-in animation per code editor panel.
> - **Panel toggle system**: Edge toggle button (chevron) per aprire editor dal canvas. Close button nell'editor tab bar. localStorage persistence per sidebar preference.
> - **Build PASS**: 0 errori, 4 file modificati (design-system.css, ElabSimulator.css, layout.module.css, NewElabSimulator.jsx).
> - **ZERO regressioni**: Scratch, Physics, Desktop layout tutti invariati.

### Score attuali (fine S100)
| Area | Score | Target S101 |
|------|-------|-------------|
| Estetica | 8.5/10 | **8.5** (non toccare) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.9/10 | **9.9** (non toccare) |
| Simulatore (physics) | 9.0/10 | **9.0** (non toccare) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| Responsive/A11y | 9.0/10 | **9.2+** (+touch gestures) |
| **iPad (landscape 1180×820)** | **8.5/10** | **9.0+** |
| **iPad (portrait 768×1024)** | **8.0/10** | **8.5+** |

---

## ═══ COSA FARE IN S101 (5 task) ═══════════════════════════════════

### Task 1: Touch Drag Refinement
- Drag-to-place componenti: verificare che il drag funzioni perfettamente con touch (non solo mouse)
- Drag threshold: aggiungere 5px dead zone per evitare accidental drags su tap
- Visual feedback durante drag: ombra, opacity, snap-to-grid indicator

### Task 2: Pinch-to-Zoom Polish
- Verificare che il pinch-zoom esistente funzioni su iPad (SimulatorCanvas.jsx)
- Aggiungere zoom level indicator (es. "150%") nell'angolo del canvas
- Double-tap to reset zoom (auto-fit)
- Zoom limits: verificare che MIN_ZOOM e MAX_ZOOM siano ragionevoli per iPad

### Task 3: Long Press Context Menu
- Long press (500ms) su un componente → mostra context menu nativo-like
- Menu azioni: Ruota, Elimina, Proprietà, Collega Filo
- Haptic feedback (navigator.vibrate) se disponibile
- Visual: ripple animation durante long press

### Task 4: Swipe Gestures
- Swipe left on canvas edge → apri editor panel
- Swipe right on editor panel edge → chiudi editor panel
- Swipe down on sidebar → chiudi sidebar (iPad portrait)
- Swipe up on bottom panel → espandi serial monitor

### Task 5: Build + CoV
- `npm run build` → 0 errori
- CoV per ogni modifica:
  - [ ] Touch drag funzionante con threshold
  - [ ] Pinch-zoom con indicator e double-tap reset
  - [ ] Long press context menu funzionante
  - [ ] Swipe gestures funzionanti
  - [ ] Desktop: ZERO regressioni (mouse drag unchanged)
  - [ ] Scratch: ZERO regressioni
  - [ ] Physics: ZERO regressioni

---

## ═══ VINCOLI E REGOLE ═══════════════════════════════════════════════

1. **ZERO regressioni desktop**: Mouse drag, click, scroll devono funzionare identicamente
2. **ZERO regressioni Scratch**: Non toccare ScratchEditor, scratchBlocks, scratchGenerator
3. **ZERO regressioni physics**: Non toccare CircuitSolver
4. **Touch-first**: Usare Pointer Events API (non Touch Events) per compatibilità mouse+touch
5. **Token compliance**: Usare SOLO token CSS da design-system.css
6. **Touch targets**: Minimo 44×44px su tutti gli elementi interattivi
7. **Build MUST pass**: `npm run build` con 0 errori prima di chiudere

---

## ═══ DELIVERABLES S101 ═══════════════════════════════════════════════

1. Touch drag con dead zone e visual feedback
2. Pinch-zoom polished con indicator e double-tap reset
3. Long press context menu per componenti
4. Swipe gestures per pannelli
5. Build PASS + CoV completa
6. `.claude/prompts/session-102-scratch-steps.md` — prompt per sessione successiva
