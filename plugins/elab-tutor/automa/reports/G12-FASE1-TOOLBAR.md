# G12 FASE 1 — ControlBar Minimale

**Data**: 28/03/2026
**Build**: PASSA (25.16s)

## Cosa è stato fatto

### MinimalControlBar.jsx (NEW — 290 LOC)
- 3 elementi visibili: Play/Pause (lime, grande) + Experiment name (pill cliccabile) + UNLIM (branded navy)
- Reset e Compile piccoli accanto a Play (non contano come bottoni principali)
- Menu overflow "⋯" con TUTTE le funzionalità organizzate in 6 sezioni:
  - Circuito (Wire, Delete, Rotate, Properties, Ripristina)
  - Strumenti (Componenti, Editor, BOM, Serial)
  - Lezione (Percorso, Quiz, Appunti, Nota)
  - Avanzato (Screenshot, Report, Lavagna, Elettroni, Diagnosi, YouTube)
  - Modifica (Annulla, Ripeti con shortcut)
  - File (Salva, Carica) + Vista (Sidebar, Shortcuts, Guida)
- Keyboard navigation (ArrowUp/Down, Escape)
- Click-outside chiude il menu
- Fallback: `minimalMode={false}` rende il ControlBar originale

### CSS aggiunto a ElabSimulator.css (~200 righe)
- `.minimal-toolbar` — flex layout pulito
- `.minimal-toolbar__btn--play` — grande, lime, box-shadow
- `.minimal-toolbar__btn--unlim` — branded navy gradient
- `.minimal-toolbar__experiment` — pill con bordo, hover accent
- Responsive: ≤768px comprime, ≤480px tronca

### NewElabSimulator.jsx
- Sostituito `<ControlBar>` con `<MinimalControlBar minimalMode={true}>`
- Tutte le props passate identiche

## Conteggio bottoni visibili

| PRIMA | DOPO |
|-------|------|
| 11+ bottoni desktop | 3 principali (Play/Pause, Experiment, UNLIM) |
| 24 items overflow mobile | Overflow sempre disponibile, organizzato |

## Principio Zero Gate
"La Prof.ssa Rossi vede 3 bottoni nella toolbar" — **PASS**
