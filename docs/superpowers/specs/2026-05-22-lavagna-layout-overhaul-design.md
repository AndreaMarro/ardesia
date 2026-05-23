# Lavagna Layout Overhaul — Design Spec

- **Data:** 2026-05-22
- **Autore:** Andrea Marro (con Claude Code)
- **Stato:** Design approvato — spec v1.1 (corretta dopo lettura del codice reale)
- **Topic:** Redesign layout Lavagna — da pannelli flottanti a ibrido a colonne
- **Sprint:** B "Code Kit" — UX/UI overhaul

---

## 1. Problema

La Lavagna (`#lavagna`) è uno stack di pannelli `position:absolute` / `fixed` flottanti,
ognuno con z-index scelto a mano e scollegato dagli altri (visti in codice: 30, 50, 920,
950, 955, 960, 999, 9001, 11500).

Conseguenze osservate (segnalazione Andrea 2026-05-22 + screenshot):

- I pannelli si sovrappongono: ModalitaSwitch (slot flottante ~720px, z960) copre l'editor;
  AppHeader e pannello sinistro coprono i tasti dell'editor; in fullscreen l'editor è
  coperto dal chrome della Lavagna.
- Tasti non visibili / non cliccabili.
- Numeri e testi illeggibili perché coperti da altri pannelli.

### Causa radice

Il problema NON è dentro `NewElabSimulator`: lì canvas-area ed editor codice sono **già**
colonne flex affiancate (`.elab-simulator__layout` contiene `.elab-simulator__main` +
`.codeEditorPanel`, quest'ultimo con `flex-shrink:0.5`). La causa è a livello di
`LavagnaShell`:

- `LavagnaShell` non è una griglia: `.shell` impila i figli e i pannelli flottano.
- `.modalitaSwitchSlot` (ModalitaSwitch, `position:absolute`, z960, ~720px) e il
  `RetractablePanel` sinistro (`position:absolute`) **flottano sopra** il `<main>` che
  ospita il simulatore. Il `<main>` riceve hack `marginLeft` / `marginBottom` inline
  (LavagnaShell righe ~1713-1714) per fare spazio — fragile, spesso disallineato.
- L'editor a schermo intero (`.codeEditorPanelScratchFullscreen`, `position:fixed`,
  z999) viene coperto da quella stessa cromatura flottante (ModalitaSwitch z960,
  AppHeader) — è il bug A4, solo in parte tamponato dal gating `!editorFullscreen`.
- Gli z-index sono scelti a mano e scollegati → confronti tra stacking context
  inaffidabili.

A3 (drawing toolbar) ha già risolto un caso identico spostando il pannello fuori dal
contesto con un React Portal.

`edukit.co/code` (riferimento UX di Andrea) non ha questo problema: è un IDE a **colonne
affiancate** — ogni zona ha il suo spazio riservato, zero overlap per costruzione.

---

## 2. Obiettivo

Lavagna senza sovrapposizioni, leggibile, "davvero simile a edukit e funzionante"
(verbatim Andrea), con UX/UI **perfetta e bella** — non solo funzionante (verbatim Andrea:
"se è perfetto e ... ha ux e ui perfette e belle vai").

### Criteri di successo

1. Zero overlap tra pannelli strutturali a 1366×768, 1440×900, 1920×1080.
2. Tutti i tasti visibili e cliccabili in tutte e 3 le modalità.
3. Numeri/testi leggibili — font ≥10px label, ≥13px testo (regola CLAUDE.md 8).
4. Touch target ≥44px (regola 9), contrasto WCAG AA (regola 10).
5. Estetica: palette ELAB (Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D),
   font Oswald/Open Sans/Fira Code, coerente con `.impeccable.md`. Bella, non solo ordinata.
6. Baseline test non cala (anti-regressione FERREA).

---

## 3. Approccio scelto: Ibrido a colonne

Tre approcci valutati:

| Approccio | Pro | Contro | Esito |
|---|---|---|---|
| **Ibrido a colonne** | IDE a colonne dove conta; overlay solo per pannelli davvero transitori; rischio gestibile in atomi piccoli | richiede refactor layout di `LavagnaShell` | **SCELTO** |
| Colonne piene | IDE puro | chat UNLIM occuperebbe sempre una colonna → meno spazio canvas su LIM; rewrite ampia e rischiosa | scartato |
| Fix z-index | rapido, basso rischio | architettura flottante resta rotta; non diventa "come edukit" | scartato |

**Perché ibrido.** Canvas (circuito) ed editor (codice) sono i due elementi sempre
presenti → colonne fisse. Chat UNLIM e drawing toolbar sono strumenti **contestuali**
(il docente li evoca quando serve) → overlay. Costringere la chat in una colonna fissa
ruberebbe spazio canvas sulla LIM proiettata: peggio per l'uso reale. Ibrido = scelta di
qualità, non compromesso al ribasso.

---

## 4. Layout target

```
┌───────────────────────────────────────────────────────────┐
│ TOP BAR · Capitolo · [Percorso|Passo Passo|Già Montato]    │  ≤52px
│           · Play · UNLIM                                    │
├──────┬────────────────────────────┬────────────────────────┤
│ TOOL │                            │                        │
│ RAIL │   CANVAS                   │   EDITOR CODICE         │
│      │   (circuito · breadboard)  │   (Arduino C++/Blocchi) │
│ Pen  │                            │                        │
│ Wire │                            │                        │
│ Sel  │                            │                        │
│ Del  │                            │                        │
├──────┴────────────────────────────┴────────────────────────┤
│ .overlayRoot (portal · z 1000) — Chat UNLIM · Drawing ·     │
│              hint · vision — SOPRA tutto, mai intrappolato   │
└───────────────────────────────────────────────────────────┘
```

### Ossatura

`LavagnaShell` rende una griglia a 2 righe:

- **Riga 1 — Top bar** (`auto`, altezza ≤52px): nome capitolo, ModalitaSwitch come
  segmented control, Play, toggle UNLIM.
- **Riga 2 — Work area** (`1fr`): griglia a colonne `[tool rail 58px | simulatore]`.
- **`.overlayRoot`**: `div` fuori dalla griglia, target dei portal.

Il simulatore (`NewElabSimulator`) **dispone già** canvas-area ed editor codice come
colonne flex affiancate (`.elab-simulator__layout`) — il suo layout interno NON va
toccato. L'overhaul agisce **sopra** il simulatore: trasforma `LavagnaShell` in griglia
così che rail, simulatore e top-bar siano celle reali e nessun pannello flottante copra
più il `<main>` che ospita il simulatore. Risultato visivo: 3 colonne (rail, canvas,
editor).

### Disciplina z-index

Un solo file token (`src/styles/z-index.css`) con la scala completa:

```
--z-base:     0     /* canvas, editor, contenuto griglia */
--z-rail:     10
--z-topbar:   20
--z-overlay:  1000  /* chat UNLIM, drawing toolbar, hint, vision */
--z-modal:    2000  /* welcome modal, dialog */
```

Tutti i pannelli overlay vivono in `.overlayRoot` via `createPortal` e usano
`--z-overlay`. Sparisce il caos 30/50/920/950/955/960/999/9001/11500.

### Morfismo — contenuto, non struttura

L'ossatura griglia è IDENTICA per le 3 modalità (Percorso / Passo Passo / Già Montato).
Cambia solo il CONTENUTO delle colonne (es. editor mostra card lesson-path in Percorso,
step guide in Passo Passo). Soddisfa Morfismo Sense 1.5 (finestre morfiche) SENZA overlap:
struttura fissa, adattamento nei contenuti.

---

## 5. Cosa assorbe

- **A6** (AppHeader compatta ≤52px) = la nuova top-bar. Assorbito da L3.
- **A4** (editor fullscreen coperto dalla cromatura flottante): risolto di conseguenza.
  Con `LavagnaShell` a griglia e ModalitaSwitch/header dentro la top-bar (non più
  flottanti), niente copre più l'editor fullscreen. L'A4 z-bump in pausa
  (`.codeEditorPanelScratchFullscreen` z 900→999 in `layout.module.css`) va **revertito**;
  la macchina CustomEvent `elab-editor-fullscreen` di A4 (gating `!editorFullscreen`)
  diventa superflua → semplificata o rimossa. Assorbito da L4.

---

## 6. Decomposizione in atomi

5 atomi incrementali. Ognuno: branch da `origin/main`, TDD dove c'è comportamento, CoV
(vitest ×3 + `npm run build`), Codex Pattern V, voce CHANGELOG, commit `tipo(area):`,
PR via `gh`, NO auto-merge (Andrea ratifica), browser-verified 1366/1440/1920.

| Atomo | Scope | File principali | Rischio |
|---|---|---|---|
| **L1** | File token z-index (`src/styles/z-index.css`) + `.shell` → griglia 2 righe `[auto header][1fr body]`. AppHeader già in cima, body riempie il resto. Puro layout, nessuno spostamento di contenuti | `src/styles/z-index.css` (nuovo), `LavagnaShell.module.css` | Basso |
| **L2** | `LavagnaShell` work-area → griglia a colonne `[zona sinistra | simulatore]`; pannello sinistro da `position:absolute` a colonna della griglia; rimozione hack `marginLeft`/`marginBottom` inline su `<main>` | `LavagnaShell.jsx` + `LavagnaShell.module.css` | Medio |
| **L3** | ModalitaSwitch → segmented control nella top-bar compatta ≤52px; eliminazione `.modalitaSwitchSlot` flottante | `AppHeader.jsx` + css, `LavagnaShell.jsx`, `ModalitaSwitch.jsx` + css | Medio |
| **L4** | `.overlayRoot` + portal per chat UNLIM, drawing toolbar, hint, vision; revert hack A4 | `LavagnaShell.jsx`, componenti overlay, `layout.module.css`, `NewElabSimulator.jsx` (solo rimozione A4) | Medio |
| **L5** | Wiring contenuto per-modalità, pulizia z-index morti, pass leggibilità "numeri illeggibili", polish estetico finale | vari | Basso |

**Tutto il lavoro pesante è in `LavagnaShell` + componenti `src/components/lavagna/`,
area "lavoro libero" (CLAUDE.md) — NON file critici.** `NewElabSimulator.jsx` (file
critico) è toccato solo da L4, e solo per rimuovere il codice A4 (poche righe). Verifica
browser obbligatoria su ogni atomo; revert immediato se la baseline cala.

Ogni atomo è verde da solo → spedibile senza rompere niente. ~5 sessioni-atomo.

---

## 7. Verifica

- **Test:** Vitest ×3 (CoV), baseline non cala. TDD su helper puri dove c'è logica di
  selezione (es. classe/`grid-template` per modalità o fullscreen). I CSS puri si
  verificano nel browser, non con unit test finti (onestà G45).
- **Browser:** Playwright/preview a 1366×768, 1440×900, 1920×1080. Per ogni breakpoint ×
  3 modalità: zero overlap, tasti raggiungibili, numeri leggibili, touch 44px.
- **Estetica:** screenshot a ogni breakpoint, confronto con palette/font ELAB e
  `.impeccable.md`. "Bella" è criterio di accettazione, non opzionale.

---

## 8. Fuori scope

- Engine simulatore (`CircuitSolver`, `AVRBridge`, `PlacementEngine`) — non toccati.
- Layout interno di `NewElabSimulator` (canvas-area + editor) — già a colonne flex,
  non va ristrutturato.
- `SimulatorCanvas.jsx` interni (3149 righe) — non toccati.
- Pedagogia delle 3 modalità — invariata.
- Rebranding visivo — palette/font già fissati.
- Chat UNLIM logica/AI — solo il suo contenitore (portal), non il comportamento.

---

## 9. Rischi

| Rischio | Mitigazione |
|---|---|
| L2 cambia il layout di `LavagnaShell` (1966 righe) | Atomo isolato, browser-verified 3 breakpoint, CoV ×3, revert immediato se baseline cala. Area "work freely", non file critico |
| `.lavagnaView` usa `display:contents` — la griglia deve tenerne conto | L1 verifica il comportamento di `display:contents` dentro la griglia prima di spostare contenuti in L2 |
| Refactor griglia rompe il responsive esistente (media query iter-103) | L1 introduce la griglia senza spostare contenuto; media query riviste atomo per atomo |
| Editor remount perde stato | Editor resta nell'albero React, cambia solo il CSS layout — niente unmount |
| 5 PR aggiuntive su backlog Andrea già pieno (#154-158) | Atomi piccoli, review veloce; Andrea ratifica al suo ritmo |

---

## 10. Riferimenti

- Diagnosi + proposta visiva: companion brainstorm `01-diagnosi.html` / `02-proposta.html`
- A3 (portal pattern già provato): PR #156
- A4 (in pausa): branch fullscreen editor, z-bump da revertire
- Causa radice: `LavagnaShell.jsx` → `.modalitaSwitchSlot` + hack margin su `<main>`
  (righe ~1683-1714); `layout.module.css` → `.codeEditorPanelScratchFullscreen`
- Design context: `.impeccable.md`
- Riferimento UX: `edukit.co/code` (solo riferimento, NON clonare)
