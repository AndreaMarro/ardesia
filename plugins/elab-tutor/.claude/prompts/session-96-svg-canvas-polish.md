# SESSION 96 — SVG COMPONENTS + CANVAS POLISH (FASE 1.3 della roadmap S94-S108)
## Color Token Purge su 22 SVG · Aria Labels · Canvas Background · Hover/Selected States · ZERO REGRESSIONI

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 3 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati) — 40+ hex → var(), 7 nuovi token
  ✅ S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati) — 5 nuovi token, 17 edits, 6 file
  → S96 — SVG Components + Canvas Polish  ← SEI QUI

FASE 2: FISICA + LOGICA (3 sessioni)
     S97 — Capacitor + Transient Analysis
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
**Dettaglio questa sessione**: `docs/roadmap/FASE-1-ESTETICA.md` → sezione "S96 — SVG Components + Canvas Polish"

---

## ═══ CONTESTO S94+S95 (sessioni precedenti) ═══════════════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. Token totali da 84 → 91.
>
> **S95 ha fatto**:
> - **5 nuovi token**: `--space-1-5: 6px`, `--space-2-5: 10px`, `--shadow-accent-xs/sm/md`
> - **17 edits in 6 file**: design-system.css, ElabSimulator.css, overlays.module.css, NewElabSimulator.jsx, CodeEditorCM6.jsx, ComponentDrawer.jsx
> - **Tokenizzati**: 2 border-radius, 3 box-shadow, 5 transition (60ms→150ms), 1 gap (5px→4px), 10 inline styles JSX
> - **Build**: 2× PASS (0 errori)
> - **Chrome Control**: 12/12 token resolution PASS
> - **Scratch Gate**: SG1-SG10 PASS (code-verified)
> - Token totali da 91 → 96
>
> **Cosa manca per completare FASE 1**: I 22 file SVG dei componenti hardware contengono **387 hex hardcoded** e **0 aria-label/role**. Il canvas non ha hover/selected states tokenizzati. Questo è l'ultimo step di FASE 1.

### Score attuali (fine S95)
| Area | Score | Target S96 |
|------|-------|------------|
| Estetica | 7.5/10 | **8.5-9.0** (SVG puliti + canvas polished) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.8/10 | **9.8** (ZERO regressioni) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| iPad | 7.0/10 | **7.0** (non toccare layout iPad in questa sessione) |
| Responsive/A11y | 7.5/10 | **8.0** (+0.5 da aria-label su 21 SVG) |

---

## ═══ ANALISI GIÀ FATTA ═══════════════════════════════════════════

### 22 file SVG componenti (tutti in `src/components/simulator/components/`)
```
Annotation.jsx       (13 hex)    LCD16x2.jsx          (12 hex)
Battery9V.jsx        (27 hex)    Led.jsx              (15 hex)
BreadboardFull.jsx   (14 hex)    MosfetN.jsx          (19 hex)
BreadboardHalf.jsx   (15 hex)    MotorDC.jsx          (15 hex)
BuzzerPiezo.jsx      (14 hex)    Multimeter.jsx       (28 hex)
Capacitor.jsx        (24 hex)    NanoR4Board.jsx      (41 hex — più grosso)
Diode.jsx            (15 hex)    PhotoResistor.jsx    (9 hex)
Phototransistor.jsx  (15 hex)    Potentiometer.jsx    (12 hex)
PushButton.jsx       (15 hex)    ReedSwitch.jsx       (21 hex)
Resistor.jsx         (18 hex)    RgbLed.jsx           (10 hex)
Servo.jsx            (21 hex)    Wire.jsx             (14 hex)
                                 registry.js          (0 hex — solo export)
```
**Totale**: 387 hex hardcoded, 0 aria-label/role="img"

### Colori da classificare prima di sostituire
**IMPORTANTE**: Molti hex nei componenti SVG sono colori realistici del componente hardware (es. corpo resistore = beige, banda colore = rosso). Questi NON vanno tokenizzati — sono colori fisici, non di tema.

La strategia è:
1. **Tokenizzare**: colori che rappresentano UI state (selected, hover, pin color, text labels)
2. **NON tokenizzare**: colori fisici del componente (corpo, bande, packaging)
3. **Aggiungere**: aria-label + role su tutti i 21 componenti (escluso Wire)

---

## ═══ COSA FARE IN S96 (6 task) ═══════════════════════════════════

### Task 1: Classificare hex in TUTTI i 22 SVG
Per ogni file, leggere e classificare ogni hex in:
- **UI** (pin colors, selection highlight, hover state, text labels) → tokenizzare con `var(--color-*)`
- **Physical** (corpo componente, bande resistore, packaging) → LASCIARE come hex (sono colori fisici)
- **Shadow/effect** (drop-shadow, glow) → tokenizzare se possibile

Output: tabella con decisione per ogni file.

### Task 2: Tokenizzare hex UI nei componenti SVG
Dopo la classificazione, sostituire SOLO gli hex classificati come "UI" con i token appropriati.
**Max 3 file per batch**, build dopo ogni batch.

Probabili token candidati:
- Pin color → `var(--color-wire-endpoint, #A89878)` (già esiste in design-system.css)
- Text labels → `var(--color-text, #1A1A2E)` o `var(--color-text-inverse, #FFFFFF)`
- Selected highlight → `var(--color-accent, #7CB342)` (già esiste)
- Borders generici → `var(--color-sim-border, #E8E4DB)` (già esiste)

### Task 3: Aggiungere aria-label + role="img" a tutti i 21 SVG componenti
Su ogni componente aggiungere al `<g>` root:
```jsx
<g role="img" aria-label="Resistore 470Ω">
```
Il label deve essere descrittivo e in italiano (target: bambini scuola media).

### Task 4: Canvas hover/selected states
Verificare che i componenti SVG abbiano:
- Hover: outline leggera o opacity change
- Selected: highlight accent `#7CB342` (token `--color-accent`)
- Dragging: opacity 0.8 + leggero scale

Se mancano, aggiungerli.

### Task 5: Build + Chrome Control Verification
- `npm run build` → 0 errori
- Dev server → preview_eval su SVG component → aria-label presente
- preview_eval → hex count ridotto nei file SVG
- 0 errori console

### Task 6: Scratch Gate SG1-SG10
- Code-verified: i file Scratch non sono toccati
- Build PASS

---

## ═══ COSA NON TOCCARE ═══════════════════════════════════════════

1. **Colori fisici dei componenti**: il corpo di un resistore è beige, la banda rossa è rossa. Non tokenizzare.
2. **Layout/posizioni**: Non cambiare dimensioni SVG, posizioni pin, aree cliccabili
3. **Funzionalità**: Zero cambiamenti alla logica di piazzamento/drag/wire
4. **iPad breakpoints**: Non toccare media queries — S100 è dedicata
5. **Scratch/Blockly**: Non toccare nulla relativo a Blockly workspace

---

## ═══ CONTEXT FILES ═══════════════════════════════════════════════

### Tier 1: LEGGERE SUBITO
```
src/styles/design-system.css                          # Token reference (tutti i token S94+S95)
src/components/simulator/components/registry.js       # Component registry
src/components/simulator/components/Resistor.jsx      # Esempio componente (per capire pattern)
src/components/simulator/components/Led.jsx           # Altro esempio
```

### Tier 2: LEGGERE PER TASK 2-3 (tutti i 22 SVG, letti uno per uno)
```
src/components/simulator/components/*.jsx             # Tutti i componenti
```

### Tier 3: CANVAS (Task 4)
```
src/components/simulator/canvas/SimulatorCanvas.jsx   # Canvas rendering + hover/select logic
src/components/simulator/NewElabSimulator.jsx         # Component placement + drag logic
```

### Tier 4: REFERENCE
```
docs/roadmap/FASE-1-ESTETICA.md                       # Roadmap FASE 1 dettaglio
docs/roadmap/01-PIANO-MAESTRO.md                      # Roadmap completo + Scratch Gate
```

---

## ═══ REGOLE INVIOLABILI ═══════════════════════════════════════════

1. **ZERO REGRESSIONI**: Se funzionava in S95, DEVE funzionare in S96. Se rotto → REVERT IMMEDIATO.
2. **MAI agenti paralleli**: Tutto sequenziale, verificato passo passo.
3. **Chrome Control per validazione**: Senza `preview_inspect` / `preview_eval` / `preview_screenshot` = non puoi dire PASS.
4. **Max 3 file per batch edit**: Fix su 4+ file → spezza in sub-batch. Build dopo OGNI batch.
5. **Colori fisici INTOCCABILI**: Il corpo di un LED rosso è rosso. Non tokenizzarlo.
6. **Scratch Gate SG1-SG10 obbligatorio**: Anche se non tocchiamo Scratch, verificare che non abbiamo rotto nulla.
7. **Commit solo su richiesta**: NON commit automatici.
8. **CoV obbligatorio**: Chain of Verification su OGNI modifica — verificare che il colore originale sia preservato dove è fisico, e tokenizzato dove è UI.

---

## ═══ DELIVERABLES S96 ═══════════════════════════════════════════

1. ✅ Classificazione hex per tutti 22 SVG (tabella UI vs Physical)
2. ✅ Hex UI tokenizzati nei componenti SVG
3. ✅ aria-label + role="img" su 21 componenti (escluso Wire)
4. ✅ Hover/selected states verificati/migliorati sul canvas
5. ✅ Build 0 errori
6. ✅ Chrome Control verification (aria-label, hex count, visual)
7. ✅ Scratch Gate SG10 PASS

### Score card attesa post-S96
| Area | Score | Delta |
|------|-------|-------|
| Estetica | 8.5-9.0/10 | +1.0-1.5 (SVG coerenti, canvas polished) |
| Responsive/A11y | 8.0/10 | +0.5 (21 aria-label aggiunti) |
| Code Quality | 9.8/10 | = |
| Regressioni | **ZERO** | — |

---

## ═══ HANDOFF OBBLIGATORIO ═══════════════════════════════════════════

**A fine sessione DEVI**:

1. **Stringa di handoff** — Riassunto completo di cosa è stato fatto, file modificati, token aggiunti, score aggiornati, e cosa resta da fare per FASE 2.
2. **Prompt S97** — Scrivi e salva il prompt per la sessione successiva in `.claude/prompts/session-97-capacitor-transient.md`. Il prompt deve:
   - Includere la mappa roadmap 15 sessioni con `← SEI QUI` aggiornato su S97
   - Riassumere cosa ha fatto S94, S95, S96 (contesto per S97)
   - Contenere l'analisi pre-fatta per S97 (capacitor physics, transient analysis, CircuitSolver gaps)
   - Seguire lo stesso formato di questo prompt (sezioni ═══, task numerati, regole, Chrome Control, deliverables)
   - Riferirsi a `docs/roadmap/FASE-2-FISICA.md` per dettaglio S97

### Catena obbligatoria
```
✅ S95 produce → .claude/prompts/session-96-svg-canvas-polish.md
S96 produce → .claude/prompts/session-97-capacitor-transient.md
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
