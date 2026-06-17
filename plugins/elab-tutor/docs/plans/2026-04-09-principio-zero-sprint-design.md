# Principio Zero Sprint — Design Document

> Data: 2026-04-09
> Approvato da: Andrea Marro
> Durata: 10 sessioni da 1 ora ciascuna (scheduled tasks)

## Obiettivo

Portare ELAB Tutor alla parità con i volumi fisici. Il docente arriva alla LIM e insegna senza preparazione. Tutto funziona.

## Principio Zero (definizione Andrea)

"Rendere facilissimo per CHIUNQUE spiegare i concetti dei manuali ELAB e spiegarne gli esperimenti SENZA ALCUNA CONOSCENZA PREGRESSA. Arrivi e magicamente insegni."

ELAB Tutor e UNLIM sono gli STRUMENTI con cui l'insegnante diventa immediatamente in grado di spiegare, divertendosi. NON è ELAB che insegna — è il DOCENTE che insegna GRAZIE a ELAB.

## Stato Attuale (brutalmente onesto)

| Metrica | Valore | Target |
|---------|--------|--------|
| BuildSteps | 62/577 entries (11%) | 100% |
| ScratchXml | 11/577 entries (2%) | Vol3 100% |
| Lesson Paths | 84/92 esperimenti (91%) | 100% |
| Alias Mapping Tea | 0% | 100% |
| UNLIM onniscienza | ~40% | 100% |
| Score Principio Zero | 3/10 | 8/10 |

## Decisioni di Design

### Alias Mapping (non rinumerazione)
Gli ID interni (`v1-cap6-esp1`) restano invariati. Un file `chapter-map.js` mappa ogni ID al capitolo/titolo proposto da Tea. L'interfaccia mostra la numerazione nuova (da Cap 1).

### Riorganizzazione Tea (Vol 3)
- Cap 6 originale → diviso in Cap 2 (OUTPUT) e Cap 3 (INPUT)
- Esperimenti cap 7 dentro cap 6 → spostati nel display a Cap 3
- Sezione EXTRA → Cap 6 "Progetti e Sfide Finali"
- Tutto via alias, zero cambio ID

### Worktree Isolation
Ogni Worker opera in un git worktree isolato. Merge solo dopo CI verde. File partizionati per evitare conflitti.

## Architettura 10 Agenti

```
L1: ORCHESTRATORE (1) — coordina, verifica, blocca se gate fallisce
L2: AUDITOR (3) — Parità, UNLIM, UX (Chrome reale)
L3: WORKER (3) — BuildSteps, UNLIM, Scratch (worktree isolati)
L4: DEBUGGER (2) — Regression (CI), Live (Playwright/Chrome)
L5: DESIGNER (1) — Alias mapping, estetica, montaggio grafico
```

## Piano 10 Sessioni

| S# | Focus | Output Verificabile |
|----|-------|---------------------|
| S1 | Setup + Alias Mapping | chapter-map.js + test 92 mapping |
| S2 | BuildSteps Vol1 Cap 6-8 | 14 buildSteps funzionanti |
| S3 | BuildSteps Vol1 Cap 9-14 | 38/38 Vol1 completo |
| S4 | BuildSteps Vol2 completo | 27/27 Vol2 completo |
| S5 | BuildSteps Vol3 + riorg | 27/27 Vol3 completo |
| S6 | Scratch Vol3 Arduino | scratchXml per tutti Vol3 |
| S7 | UNLIM Onniscienza | risponde su ogni esperimento |
| S8 | UNLIM Onnipotenza + Voce | comandi vocali su ogni esp |
| S9 | Polish + Principio Zero E2E | flusso completo docente |
| S10 | Deploy + Verifica Finale | prod live, benchmark |

## Anti-Conflitto (partizione file)

| Agente | File ESCLUSIVI | Mai tocca |
|--------|---------------|-----------|
| Worker-BuildSteps | experiments-vol*.js (buildSteps) | lesson-paths, components |
| Worker-UNLIM | lesson-paths/*.json, unlim-knowledge-base.js | experiments, components |
| Worker-Scratch | experiments-vol3.js (scratchXml) | vol1, vol2, lesson-paths |
| Designer | chapter-map.js (NUOVO), UI components | experiments data |

## Contesto Condiviso

Ogni agente DEVE leggere prima di agire:
1. `docs/sprint/HANDOFF.md` — stato corrente, cosa manca
2. `docs/plans/2026-04-09-principio-zero-sprint-design.md` — questo documento
3. `CLAUDE.md` — regole immutabili
4. `.claude/projects/.../memory/feedback_priorities_09apr2026.md` — priorità Andrea

## Verifica Oggettiva

Nessun task dichiara "finito" senza:
- BuildSteps: `node -e` conta → numero deve aumentare
- Scratch: `grep -c scratchXml` → numero deve aumentare
- UNLIM: test 20 domande su nanobot reale
- UX: screenshot Chrome piattaforma reale
- CI: `gh run list` verde
- Test: `npx vitest run` → 0 fail
