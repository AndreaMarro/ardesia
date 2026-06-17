# TASK Lesson Reader MVP — Start

**Date**: 2026-04-18
**Branch**: feature/lesson-reader-mvp
**Baseline pre-task**: 12056 test PASS (da verificare post vitest run)
**Commit SHA start**: TBD dopo first commit
**Goal**: implementare componente React LessonReader MVP v0 per narrativa capitolo Principio Zero v3.

## Scope

- Componente `src/components/lavagna/LessonReader.jsx` + CSS module
- Hook `src/hooks/useLessonReader.js`
- Test unit in `tests/unit/lavagna/LessonReader.test.jsx` (TDD first)
- Riuso: `src/data/lesson-groups.js` + `src/data/volume-references.js` (NO duplicazione)
- Integrazione minimale in `src/components/lavagna/LavagnaShell.jsx`

## Non-goals (esclusi da MVP v0)

- Animazioni complesse
- 27 Lezioni complete (solo v1-accendi-led come demo)
- Sync simulator via __ELAB_API (prossimo step)
- Multilingue (sempre IT per MVP)
- Playwright E2E (separate task)

## Governance

Segue `docs/GOVERNANCE.md` pattern 8-step.
