# G12 FASE 3 — Sidebar Pulita

**Data**: 28/03/2026
**Build**: PASSA

## Cosa è stato fatto

### NewElabSimulator.jsx
- Sidebar (ExperimentPicker) default: `true` → `false` — nascosta all'apertura
- L'utente può riaprire via overflow menu → Vista → "Mostra Sidebar"
- Auto-show LessonPathPanel quando un esperimento è caricato
- LessonPath diventa il pannello laterale predefinito durante la lezione

## Flusso insegnante
1. Apre il simulatore → breadboard a schermo pieno + MinimalControlBar
2. Seleziona esperimento (dal nome nella toolbar o dalla sidebar se la apre)
3. LessonPathPanel appare automaticamente → guida passo-passo
4. ExperimentPicker disponibile su richiesta (overflow → Vista → Mostra Sidebar)

## Principio Zero Gate
"Sidebar mostra solo LessonPath durante la lezione" — **PASS**
