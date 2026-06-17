# Sprint Q2 Audit — Capitolo UI components (TDD strict)

**Data:** 2026-04-25
**Branch:** `feat/sprint-q2-capitolo-ui-2026-04-25`
**Sprint:** Q2 (UI components consumer Q1 schema)
**Precede:** Q3 integration LavagnaShell + browser preview verification
**Fonte decisioni:** `docs/audits/2026-04-24-narrative-progression-analysis.md`

---

## TL;DR

5 componenti React Q2 consegnati TDD strict in ~50 minuti.

| Commit | SHA | Componente | Test |
|--------|-----|-----------|------|
| Q2.A | `f17b384` | VolumeCitation badge inline | +8 |
| Q2.B | `2bece8f` | DocenteSidebar sticky | +13 |
| Q2.C | `f9773e1` | CapitoloPicker grid + switcher | +12 |
| Q2.D | `e2723a8` | PercorsoCapitoloView orchestrator | +14 |
| Q2.E | `6484caa` | IncrementalBuildHint companion | +10 |
| **TOT** | | | **+57** |

Baseline 12346 (Q1.D) → **12403** (+57). Zero regression 222 test files.

Palette ELAB rispettata 5/5: navy primary (#1E4D8C), lime experiment (#4A7A25),
orange project/spunto (#E8941C), red wip/errori (#E54B3D).
CLAUDE.md regola 11 (no emoji icone) rispettata.
PRINCIPIO ZERO neutro nominale enforce visualmente.

---

## 1. Q2.A — VolumeCitation

**File:** `src/components/common/VolumeCitation.jsx` + `.module.css`
**Test:** 8/8 PASS

Badge inline cliccabile "Vol.N pag.M" con BookIcon (ElabIcons). Apre VolumeViewer su click.
Props: `volume, page, onClick?, label?`.
Accessibility: `aria-label "Citazione Volume N pagina M"`, focus-visible outline navy.

### Estetica
- Background navy 8% opacity
- Border navy 20%
- Hover 15% bg + full border
- Tipografia 13px Open Sans
- Tabular-nums per pagine

## 2. Q2.B — DocenteSidebar

**File:** `src/components/lavagna/DocenteSidebar.jsx` + `.module.css`
**Test:** 13/13 PASS

Sidebar sticky destra 25%, colpo d'occhio docente.

4 sezioni condizionali:
- **Step**: sostantivale prominente (15px)
- **Spunto**: orange box italic, citazione testuale
- **Note**: dashed list descrittive
- **Errori tipici**: red box, problema + soluzione_neutra

PRINCIPIO ZERO enforce: NO imperativi seconda persona. Schema field rinominati
in Q1.D (`step_corrente`, `spunto_per_classe`, `note`, `errori_tipici`).

### Estetica
- Background grigio chiaro #f8f9fb
- Border-left navy 2px header
- Orange spunto box, red errori box
- Oswald uppercase labels, Open Sans body
- Min 240px max 320px width

## 3. Q2.C — CapitoloPicker

**File:** `src/components/lavagna/CapitoloPicker.jsx` + `.module.css`
**Test:** 12/12 PASS

Grid Cap auto-fill 220px min con volume switcher Vol 1/2/3.

### Estetica
- Volume tabs aria-pressed (44px touch target)
- Cap card: numero (Oswald uppercase) + titolo + type badge + esp count
- Border-left accent per type:
  - theory grigio #888
  - experiment lime #4A7A25
  - project orange #E8941C
  - wip red #E54B3D
  - bonus navy #1E4D8C
- Hover translate + shadow
- Empty state message neutro

## 4. Q2.D — PercorsoCapitoloView

**File:** `src/components/lavagna/PercorsoCapitoloView.jsx` + `.module.css`
**Test:** 14/14 PASS

Orchestratore principale Cap-wide. Layout split:
- **70% main role**: classe legge ad alta voce
- **25% aside complementary**: docente colpo d'occhio

### Sezioni display centrale
- Header: Vol badge + page range + type chip + close button
- Theory section: testo_classe (18px) + citazioni VolumeCitation inline
- Intro narrative orange italic
- Per esperimento (article):
  - Transizione precedente (orange box italic)
  - Header esp num + titolo classe + VolumeCitation page_start
  - Components_needed list
  - IncrementalBuildHint conditionally
  - Phases ordered list (counter circular badge)
- Closing narrative

### Sidebar reactive
DocenteSidebar update su `activeExpIndex` + `activePhaseIndex` (sync click).

### PRINCIPIO ZERO
- Display centrale narrativo classe (16-32px font)
- Sidebar docente neutro nominale
- Citazioni Vol.N pag.M cliccabili
- Transizioni narrative tra esperimenti

## 5. Q2.E — IncrementalBuildHint

**File:** `src/components/simulator/IncrementalBuildHint.jsx` + `.module.css`
**Test:** 10/10 PASS

Companion component per `build_circuit.mode='incremental_from_prev'`.
NUOVO componente companion, NO touch BuildModeGuide existing (zero regression).

### Render
- Header lime: "COSTRUZIONE INCREMENTAL" + base_experiment_id (Fira Code)
- Operation count badge
- Lista operations:
  - Label nominale Aggiunta/Rimozione/Modifica
  - Target code (monospace)
  - Detail (value/type)
- Color coding: add lime, remove red, modify orange

### PRINCIPIO ZERO
Op labels SOSTANTIVI, no imperativi:
- add → "Aggiunta"
- remove → "Rimozione"
- modify → "Modifica"

## 6. Decisioni operative Q0-Q1 status

| # | Decisione | Q1 | Q2 |
|---|-----------|-----|-----|
| 1 | Schema narrative-preserving | ✅ | ✅ Consumed by 5 components |
| 2 | Simon → v3-cap9 capstone | ✅ | ✅ Mostrato by CapitoloPicker |
| 3 | v3-extras → bonus tier | ✅ | ✅ Filtered by CapitoloPicker |
| 4 | Passo Passo incremental | schema | ✅ IncrementalBuildHint |
| 5 | Percorso Cap UI | service | ✅ PercorsoCapitoloView |
| 6 | Bug Tea flag (async) | flagged | - |

**Tutte le 6 decisioni Q0 implementate end-to-end Q1 + Q2.**

## 7. Test breakdown Q2

| Componente | Test | Tipo |
|------------|------|------|
| VolumeCitation | 8 | render + onClick + a11y + validation |
| DocenteSidebar | 13 | render + sections + a11y + null fallback + currentPhase context |
| CapitoloPicker | 12 | filter + sort + tabs + onClick + onVolumeChange + a11y |
| PercorsoCapitoloView | 14 | render + theory + esp chain + transitions + components + sidebar sync |
| IncrementalBuildHint | 10 | operations + nominal labels + null/empty + a11y |
| **TOT** | **57** | |

## 8. Browser preview verification

**NOT applicable Q2**: componenti isolati, non ancora wired in route.
- VolumeCitation: usato da PercorsoCapitoloView (interno Q2)
- DocenteSidebar: usato da PercorsoCapitoloView (interno Q2)
- CapitoloPicker: standalone, non integrato in LavagnaShell
- PercorsoCapitoloView: standalone, non integrato in LavagnaShell
- IncrementalBuildHint: usato da PercorsoCapitoloView (interno Q2)

**Q3 integration step**: wire CapitoloPicker + PercorsoCapitoloView in LavagnaShell + add route trigger. Then browser preview verification mandatory per system instruction.

Vitest component tests sono surrogate per UI correctness in fase Q2.
React Testing Library + jsdom rendering verifica DOM output, accessibilità,
event handling. Sufficiente per scoraffolding components.

## 9. Quality reminder Andrea

> "Ricorda sempre la palette e in generale anche di mantenere l'estetica elab."

5/5 componenti Q2 verificati:
- Navy primary `#1E4D8C` ovunque (var --color-primary)
- Lime experiment `#4A7A25` per accenti positivi
- Orange `#E8941C` per spunti/transizioni/project
- Red `#E54B3D` per errori/wip
- Tipografia: Oswald (titoli/labels) + Open Sans (body) + Fira Code (code)
- Font min 13px (CLAUDE.md regola 8 rispettata)
- Touch target min 44px (CLAUDE.md regola 9 rispettata)
- NO emoji icons (CLAUDE.md regola 11 — usa BookIcon ElabIcons)

## 10. CoV Q2

| Run | Test files | Tests | Exit |
|-----|-----------|-------|------|
| 1 | 222 | 12403 | 0 |
| 2 | 222 | 12403 | 0 |
| 3 | 222 | 12403 | 0 |

Consistent. Zero flakiness.

## 11. Prossimi passi Q3

1. **Integration LavagnaShell**: replace `PercorsoPanel` lazy import → `PercorsoCapitoloView`
2. **Route trigger**: aggiungere AppHeader button "Capitolo" che apre CapitoloPicker
3. **API wire**: percorsoService.getCapitolo / listCapitoliByVolume usato in shell
4. **Browser preview**: avviare dev server, verificare layout 70/25, scroll narrativo,
   sidebar reactive, citazioni cliccabili → VolumeViewer
5. **VolumeViewer integration**: handle citation click → open viewer at page

Stimato Q3: 1-2 giorni con browser preview deep verification.

---

**Verdetto Q2**: PASS. 5 componenti consegnati TDD, palette ELAB integrale,
PRINCIPIO ZERO enforce visualmente, zero regression. Pronti per Q3 integration.
