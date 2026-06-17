# CONTESTO SESSIONE: iPad + Apple Pencil + Libero Guidato

> **Cartella**: `docs/context/ipad-libero/`
> **Scopo**: Contesto completo e auto-contenuto per eseguire il piano in sessioni successive.
> **Creato**: 2026-03-04 — Session S69 (continuazione)
> **Stato**: 0/11 task completati. Nessun codice modificato.

---

## INDICE FILE

| # | File | Contenuto | Quando leggere |
|---|------|-----------|----------------|
| 00 | `00-INDEX.md` | Questo file — mappa della cartella | Sempre |
| 01 | `01-SESSION-START.md` | Prompt di avvio sessione (copia-incolla) | Inizio sessione |
| 02 | `02-INVARIANTS.md` | Regole inviolabili, pin naming, palette | Inizio sessione |
| 03 | `03-CURRENT-STATE.md` | Stato attuale del codice — righe, handler, file | Inizio sessione |
| 04 | `04-ARCHITECTURE.md` | Architettura del progetto — deploy, stack, env | Quando serve |
| 05 | `05-TASK-TRACKER.md` | Stato avanzamento 11 task (aggiornare live) | Ogni task |

## PIANI TECNICI (GIA' ESISTENTI — NON DUPLICATI)

| File | Righe | Contenuto |
|------|-------|-----------|
| `docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md` | 1125 | Mappa operativa 6 sessioni con istruzioni task-by-task |
| `docs/plans/2026-03-04-ipad-pencil-libero-guidato.md` | 1114 | Piano tecnico dettagliato con codice per ogni handler |

## ANALISI (GIA' ESISTENTE — NON DUPLICATA)

| File | Righe | Contenuto |
|------|-------|-----------|
| `.team-status/CTO-ANALYSIS-S69-v3.md` | 1333 | Analisi CTO con Part 8 (simulatore) + Part 9 (iPad/Pencil/Libero) |

## FILE SORGENTE TARGET (da leggere all'inizio di ogni Sprint)

### Sprint 1 — iPad + Apple Pencil (Tasks 1-6)
| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | 2629 | CENTRALE — 7 handler da convertire a 3 Pointer Events |
| `src/components/simulator/panels/ComponentPalette.jsx` | 292 | Drag HTML5 rotto su iOS — serve tap-to-place |
| `src/components/simulator/panels/ComponentDrawer.jsx` | 528 | DraggableChip — drag touch da aggiornare |
| `src/components/simulator/panels/ControlBar.jsx` | 850 | Aggiungere pulsante Elimina |
| `src/components/tutor/CanvasTab.jsx` | 315 | Apple Pencil pressure per tratto disegno |
| `src/components/simulator/ElabSimulator.css` | — | CSS :active states, touch-action |

### Sprint 2 — Libero Guidato (Tasks 7-11)
| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/simulator/panels/ExperimentGuide.jsx` | 304 | Aggiungere progress tracking |
| `src/components/simulator/NewElabSimulator.jsx` | 3582 | Passare circuitState a ExperimentGuide |
| `src/components/tutor/ElabTutorV4.jsx` | 2152 | Integrare useGalileoCoach hook |
| `src/data/experiments-vol1.js` | — | Struttura buildSteps di riferimento |
| `src/components/simulator/utils/circuitComparator.js` | DA CREARE | Utility confronto circuito vs target |
| `src/components/simulator/hooks/useGalileoCoach.js` | DA CREARE | Hook coach proattivo (30s interval) |

## COMANDI ESSENZIALI

```bash
# Dev server
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run dev

# Build (OBBLIGATORIO prima di ogni deploy)
npm run build

# Deploy Vercel
npm run build && npx vercel --prod --yes

# Test
npm test
```

## NOTA IMPORTANTE: NO GIT

Il progetto elab-builder **NON ha un repository git** (solo `nanobot/` ha git per Render).
I commit menzionati nei piani sono ideali — in pratica si lavora direttamente sui file.
Strategia backup: copiare i file prima di modifiche critiche.
