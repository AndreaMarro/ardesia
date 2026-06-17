# PROMPT S71 — Bugfix Residui + Quality Audit Brutale

> Copia-incolla questo intero prompt nella nuova sessione Claude Code.

---

## CONTESTO

Progetto ELAB Tutor — simulatore di circuiti per studenti 8-14 anni.
Root: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`

**Sessione precedente (S70)**: 12 bugfix completati (B1-B12) nel simulatore iPad + Apple Pencil. Build passa con 0 errori. Score da 7.8/10 a 9.0/10. Quality audit ha identificato bug residui da fixare.

**LEGGI PRIMA DI TUTTO** (in parallelo):
1. `docs/context/ipad-libero/02-INVARIANTS.md` — regole inviolabili
2. `docs/context/ipad-libero/05-TASK-TRACKER.md` — stato sprint
3. `.team-status/QUALITY-AUDIT.md` — audit S70 con tutti i dettagli

---

## BUG DA FIXARE (13 bug — ordinati per priorita')

### P2 — Touch Targets sotto 44px (target: bambini 8-14 su iPad)

| ID | File | Riga | Valore attuale | Fix | Note |
|----|------|------|----------------|-----|------|
| T1 | `src/components/simulator/panels/ComponentPalette.jsx` | 189 | `minHeight: 36` | `minHeight: 44` | Elemento piu' usato su iPad: tocco per tap-to-place |
| T2 | `src/components/simulator/panels/ShortcutsPanel.jsx` | 224 | `minHeight: 36` | `minHeight: 44` | Shortcut items |
| T3 | `src/components/simulator/panels/ExperimentPicker.jsx` | 420 | `minHeight: 40` | `minHeight: 44` | Lista esperimenti |
| T4 | `src/components/simulator/panels/GalileoResponsePanel.jsx` | 243 | `minHeight: 40` | `minHeight: 44` | Pulsante pannello AI |
| T5 | `src/components/simulator/panels/SerialMonitor.jsx` | 299 | `minHeight: 40` | `minHeight: 44` | Input field seriale |
| T6 | `src/components/simulator/NewElabSimulator.jsx` | 3161 | `minHeight: 32` | `minHeight: 44` | Tab modalita' build |

### P2 — Font sotto 14px (non user-facing ESCLUSI, solo quelli letti dagli studenti)

| ID | File | Riga | Valore attuale | Fix | Note |
|----|------|------|----------------|-----|------|
| F1 | `src/components/simulator/panels/ComponentPalette.jsx` | 226 | `fontSize: 10` | `fontSize: 12` | Sublabel componente (es. "220 Ohm") — letto dagli studenti |
| F2 | `src/components/simulator/panels/ComponentPalette.jsx` | 202 | `fontSize: 11` | `fontSize: 12` | Category label |
| F3 | `src/components/simulator/panels/ComponentPalette.jsx` | 250 | `fontSize: 11` | `fontSize: 12` | Search result count |
| F4 | `src/components/simulator/panels/ComponentPalette.jsx` | 264 | `fontSize: 11` | `fontSize: 12` | Availability label |

### P3 — Font minori (code editor — NON fixare, sono corretti per un editor codice)

> CodeEditorCM6.jsx: fontSize 9-11px nelle status bar e badge. Sono standard per code editor UI.
> Annotation.jsx: fontSize 8px su annotazioni SVG. Non interattivo.
> ElabSimulator.css riga 118: font-size 10px watermark. Decorativo.
> **QUESTI NON VANNO TOCCATI** — sono scelte di design giustificate.

### P3 — ShortcutsPanel badge

| ID | File | Riga | Valore attuale | Fix | Note |
|----|------|------|----------------|-----|------|
| T7 | `src/components/simulator/panels/ShortcutsPanel.jsx` | 246 | `minHeight: 28` | Lasciare 28 | E' un badge dentro un item gia' 44px, non un target indipendente. NON fixare. |

---

## ORDINE DI ESECUZIONE

1. LEGGI `02-INVARIANTS.md` e `05-TASK-TRACKER.md` e `.team-status/QUALITY-AUDIT.md`
2. LEGGI ogni file che devi modificare (prima di editare)
3. Fixa T1 (`ComponentPalette.jsx:189` — minHeight 36 -> 44)
4. Fixa F1-F4 (4 fontSize in `ComponentPalette.jsx` — 10/11 -> 12)
5. Fixa T2 (`ShortcutsPanel.jsx:224` — minHeight 36 -> 44)
6. Fixa T3 (`ExperimentPicker.jsx:420` — minHeight 40 -> 44)
7. Fixa T4 (`GalileoResponsePanel.jsx:243` — minHeight 40 -> 44)
8. Fixa T5 (`SerialMonitor.jsx:299` — minHeight 40 -> 44)
9. Fixa T6 (`NewElabSimulator.jsx:3161` — minHeight 32 -> 44)
10. `npm run build` — DEVE passare con 0 errori
11. Aggiorna `05-TASK-TRACKER.md` — aggiungi task 6c con tutti i fix
12. **RE-AUDIT con skill `quality-audit`** — stessa brutale onesta'

---

## REGOLE CRITICHE

- **ZERO emoji** nei file sorgente
- **NON toccare** handler: `handleWheel`, `handleKeyDown`, `handleBackgroundClick`
- **NON toccare** CodeEditorCM6.jsx, Annotation.jsx, ElabSimulator.css:118 (watermark) — sono design-justified
- **NON toccare** ShortcutsPanel.jsx:246 (badge minHeight 28) — e' un child, non un tap target
- Build DEVE passare con 0 errori
- Palette: Navy `#1E4D8C`, Lime `#7CB342`
- `touch-action: none` deve restare su SVG canvas
- I numeri di riga sono riferiti alla versione post-S70 — **VERIFICA** leggendo il file prima di editare

---

## SKILL DA USARE

1. `tinkercad-simulator` — per qualsiasi dubbio sui componenti simulatore
2. `quality-audit` — per il re-audit finale (step 12)

---

## SCORE ATTUALE (post-S70)

| Area | Score | Target |
|------|-------|--------|
| iPad Touch | 9.2/10 | 9.5+ |
| Apple Pencil | 9.0/10 | 9.0 (gia' target) |
| Accessibility | 8.8/10 | 9.0+ |
| Performance | 8.5/10 | 8.5 (non toccare) |
| Code Hygiene | 9.5/10 | 9.8+ |
| **Overall** | **9.0/10** | **9.3+** |

Il quality audit deve essere BRUTALMENTE ONESTO: se qualcosa non passa, scrivi FAIL. Non arrotondare per eccesso. Non giustificare problemi. Conta le occorrenze esatte.

---

*Prompt generato automaticamente — S70 — 2026-03-05*
