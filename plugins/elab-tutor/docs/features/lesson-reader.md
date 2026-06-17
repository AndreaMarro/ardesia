# Lesson Reader MVP v0

**Status**: MVP implementato
**Component**: `src/components/lavagna/LessonReader.jsx`
**CSS**: `src/components/lavagna/LessonReader.module.css`

## Cosa fa

Mostra la timeline narrativa di una Lezione dal volume fisico ELAB. Ogni step corrisponde a un esperimento del capitolo, con citazione diretta del testo del libro (bookText da `volume-references.js`).

## Principio Zero v3

- Il contenuto usa le stesse parole del libro ("Vol. 1 — Capitolo 6")
- Nessuna meta-istruzione ("Docente, leggi..." non appare mai)
- Il docente vede il testo del libro e lo veicola naturalmente ai ragazzi

## Props

| Prop | Tipo | Descrizione |
|------|------|-------------|
| `lessonId` | `string` | ID lezione da `lesson-groups.js` (es. `"v1-accendi-led"`) |
| `currentExperimentId` | `string` | Esperimento attivo (evidenziato con stile `.active`) |
| `onExperimentSelect` | `function` | Callback `(expId) => void` al click su uno step |

## Dati riusati (Regola 0)

- `src/data/lesson-groups.js` — struttura 27 Lezioni (title, volume, chapter, experiments[])
- `src/data/volume-references.js` — 92 esperimenti con bookText, bookPage, bookInstructions

## Non-goals MVP v0

- Sync con simulatore via `__ELAB_API`
- 27 lezioni complete (solo demo con v1-accendi-led)
- Multilingue
- Playwright E2E
