# Quality Audit — ELAB Tutor (iter 103 prep)

**Data:** 2026-05-21 · **Tipo:** /quality-audit read-only · **Regola:** G45 anti-inflazione, conteggi onesti.
**Repo:** `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder` · 76 CSS, 190 JSX, 135 JS in `src/`.

## Score card

| # | Dimensione | Conteggio | Baseline memoria | Verdetto |
|---|------------|-----------|------------------|----------|
| 1 | Font size < minimo | 80 CSS + ~97 JSX reali | ~435 / ~1326 | ✅ **PASS** (molto migliorato) |
| 2 | Touch target < 44px | ~1 reale | ~103 | ✅ **PASS** |
| 3 | Hex hardcoded fuori palette | 2157 raw + 1095 token | ~833 | 🔴 **FAIL** (regredito) |
| 4 | Bundle JS totale | 8546 KiB / 27 precache | ~1968 KiB | 🔴 **FAIL** (peso) |
| 5 | console.* in produzione | 22 | — | ✅ **PASS** |
| 6 | Dead code | 2/2 confermati morti | — | 🔴 **FAIL** (minore) |
| 7 | Emoji-as-icons (regola 11) | 134 (43 non decorativi) | — | 🔴 **FAIL** |
| 8 | Clickable inaccessibili | ~65 reali (73 raw) | — | 🔴 **FAIL** |

**Totale: 3 PASS / 5 FAIL.**

## Dettagli

**1. Font sizes — PASS.** CSS: 80 dichiarazioni <14px (11px×11, 12px×15, 13px×54). JSX:
195 `fontSize`<14 totali, ma ~98 dentro documenti react-pdf (`SessionReportPDF.jsx`,
`ReportService.jsx` — sizing pt per PDF, legittimamente esenti). UI reale <14: ~97.
Peggiori: `lavagna/GalileoAdapter.jsx`, `lavagna/UnlimAdapter.jsx` (19 ciascuno),
`HomeCronologia.jsx` (8). Grande miglioramento vs baseline — sweep passati hanno funzionato.

**2. Touch targets — PASS.** Unico hit: `tutor/VisionButton.module.css:43-44` `width/height:20px`
ma è l'icona SVG *dentro* un bottone correttamente dimensionato (min 44px). Nessun
selettore interattivo sotto 44px reale.

**3. Palette — 🔴 FAIL (peggio del baseline).** 3012 letterali `#hex` raw totali; **2157
non-palette** (escluse le 4 brand + bianco/nero) + 1095 `var(--elab-hex-XXXX)`. Peggiori:
- `src/styles/design-system.css` — 620 (file di definizione token; 478 `--elab-hex-` def — atteso ma gonfio)
- `src/components/lavagna/LavagnaShell.jsx` — 67
- `src/components/common/ElabIcons.jsx` — 59
Tokenizzazione esiste (1095 ref) ma 2157 letterali raw passano ancora.

**4. Bundle — 🔴 FAIL (peso).** JS totale **8546 KiB**. 27 precache (ok). Chunk più
grandi: `react-pdf` 1911 KB, `ScratchEditor` 740 KB, `LavagnaShell` 639 KB, `index`
554 KB, `NewElabSimulator` 509 KB, `mammoth` 500 KB, `codemirror` 474 KB, `recharts`
461 KB. Code-split presente ma payload pesante. → Sprint E: lazy-load `react-pdf`/`mammoth`/`recharts`.

**5. console.* — PASS.** 22 totali (9 log, 7 warn, 6 error), test esclusi. Top:
`services/elab-agent/cli.js` 8 (CLI tool, accettabile), `utils/logger.js` 5 (il logger stesso).

**6. Dead code — 🔴 FAIL (minore, 2/2 confermati).**
- `src/services/experimentNarrativeService.js` (8347 B) — **MORTO**, zero import.
- `src/styles/elab-blockly-theme.css` (2679 B) — **morto come import**. `ScratchEditor.jsx:9`
  commenta esplicitamente che NON è importato; `:366` lo inietta a runtime come `<style>`
  dinamico. Il file su disco è fuori dal build graph (contenuto duplicato inline in JS).

**7. Emoji-as-icons — 🔴 FAIL.** 134 emoji in 49 file JSX su righe non-commento; **solo 6
con `aria-hidden`, 43 senza** (resto in SVG `<text>`/stringhe). Regola 11 violata. Peggiori:
`tutor/ElabTutorV4.jsx` (9), `HomePage.jsx` (8), `SimulatorCanvas.jsx` (8, es. `✗`/`✓`),
`home/HomeCompileEntry.jsx` (6), `common/ElabIcons.jsx` (6 — emoji *nella libreria icone stessa*).

**8. Accessibilità — 🔴 FAIL.** 91 `div/span/li` con `onClick`; 73 senza role/tabIndex/keyboard.
~8 falsi positivi (`modalOverlay`/`modalBox` backdrop, non-focusable by design) → **~65
clickable genuinamente inaccessibili**. Concentrati in admin: `admin/tabs/AdminWaitlist.jsx`
(8), `admin/tabs/AdminEventi.jsx` (6), `admin/gestionale/modules/FatturazioneModule.jsx`
(6), `admin/gestionale/shared/GlobalSearch.jsx` (4), `social/Navbar.jsx` (3),
`teacher/TeacherDashboard.jsx` (3).

## Priorità fix (→ Sprint E)

1. **Bundle** — lazy-load `react-pdf`/`mammoth`/`recharts` (E4).
2. **Emoji** — sostituire 43 emoji non-decorative con SVG `ElabIcons` (E-emoji).
3. **A11y** — `role="button"`+`tabIndex`+`onKeyDown` sui div clickable admin (E-a11y).
4. **Dead code** — eliminare i 2 file morti (E5).
5. **Palette** — migrare hex raw a `var(--elab-hex-*)` esistenti (E3).

## Nota onesta

Font + touch sono migliorati drasticamente vs baseline memoria — i sweep di
remediation passati hanno funzionato. Palette è regredita (o il baseline era
sottostimato). Bundle, emoji, a11y restano debito reale → Sprint E.
