# Struttura Repository ELAB Tutor — 2026-04-24

## Directory principali

```
elab-builder/                              ← repo root (worktree primary)
├── CLAUDE.md                              ← regole immutabili Claude
├── CHANGELOG.md                           ← log modifiche
├── README.md                              ← entry point GitHub (TBD migliorare)
├── package.json                           ← deps (Vite 7, React 19, Vitest, Supabase, Playwright)
├── vite.config.js                         ← build config
├── vitest.openclaw.config.ts              ← config test OpenClaw isolato
├── playwright.config.js                   ← config E2E
├── .husky/pre-commit                      ← test baseline delta gate
├── .husky/pre-push                        ← quality gate
│
├── src/                                   ← sorgente frontend
│   ├── main.jsx                          ← entry React
│   ├── App.jsx                           ← routing custom hash (#tutor/#lavagna/#prova/#dashboard/...)
│   ├── components/
│   │   ├── common/                       ← ElabIcons, Toast, ConsentBanner, ErrorBoundary, ConfirmModal
│   │   ├── lavagna/                      ← LavagnaShell + AppHeader + VolumeViewer + useGalileoChat
│   │   ├── simulator/                    ← NewElabSimulator + canvas + panels + engine
│   │   │   ├── engine/                   ← CircuitSolver, AVRBridge, PlacementEngine (critical, guarded)
│   │   │   └── canvas/                   ← SimulatorCanvas SVG
│   │   ├── unlim/                        ← UnlimOverlay, UnlimReport (fumetto), mascotte
│   │   ├── tutor/                        ← tabs didattici, giochi
│   │   ├── dashboard/                    ← (vuoto, feature pending)
│   │   └── (altri)
│   ├── services/
│   │   ├── api.js                        ← tutte API chiamate nanobot/compiler/TTS
│   │   ├── simulator-api.js              ← window.__ELAB_API namespace
│   │   ├── unlimMemory.js                ← 3-tier memory short/mid/long
│   │   ├── unlimContextCollector.js      ← context collection
│   │   ├── voiceService.js               ← wake word + STT + TTS
│   │   ├── nudgeService.js               ← proactive hints
│   │   └── openclaw/                     ← (futuro dispatcher Day 39)
│   ├── hooks/
│   │   ├── useSessionTracker.js          ← sessioni localStorage
│   │   ├── useOverlayQueue.js            ← NEW (F2.B) coda overlay primo-accesso
│   │   └── (altri)
│   └── data/
│       ├── rag-chunks.json               ← RAG v1 (549 chunks) legacy
│       ├── rag-chunks-v2.json            ← RAG v2 (1849 chunks) NEW
│       ├── experiments-vol1.js           ← 38 esperimenti
│       ├── experiments-vol2.js           ← 27 esperimenti
│       ├── experiments-vol3.js           ← 27 esperimenti
│       ├── lesson-paths/                 ← 94 file JSON (refactor Q1 → Capitoli)
│       ├── lesson-groups.js              ← 27 lezioni raggruppate per concetto
│       └── volume-references.js          ← 92/92 enriched bookText
│
├── supabase/
│   └── functions/
│       ├── unlim-chat/                   ← Edge Function UNLIM (Deno) — BASE_PROMPT
│       ├── unlim-diagnose/               ← vision diagnosi
│       ├── unlim-hints/                  ← proactive nudges
│       ├── unlim-tts/                    ← TTS proxy
│       ├── unlim-gdpr/                   ← consent flow
│       └── unlim-wiki-query/             ← Sett-4 POC retriever
│
├── scripts/
│   ├── openclaw/                         ← architettura Sett 5 onnipotenza
│   │   ├── tools-registry.ts             ← 57 ToolSpec (post Day 38)
│   │   ├── morphic-generator.ts          ← L1+L2+L3-flag
│   │   ├── pz-v3-validator.ts            ← multilingue
│   │   ├── tool-memory.ts                ← pgvector+GC
│   │   ├── state-snapshot-aggregator.ts  ← ibrido prompt builder
│   │   ├── together-teacher-mode.ts      ← GDPR gate
│   │   ├── rag-retriever.ts              ← MMR+metadata
│   │   ├── __mocks__/                    ← test fixtures
│   │   └── *.test.ts                     ← 103/103 PASS
│   ├── wiki-query-core.mjs               ← retriever keyword (Sett-4)
│   ├── wiki-corpus-loader.mjs            ← markdown + YAML loader
│   ├── rag-rechunk.mjs                   ← re-chunker dual-pass
│   ├── coherence-check.mjs               ← 8 checks
│   ├── bench/                            ← GPU benchmark workloads + runner
│   ├── cli-autonomous/                   ← loop-forever.sh + tools
│   └── git-hooks/                        ← pre-commit-secret-scan.sh
│
├── tests/
│   ├── unit/                             ← Vitest
│   │   ├── services/                     ← api, unlimMemory, simulator-api
│   │   ├── components/                   ← React components
│   │   ├── engine/                       ← CircuitSolver, AVRBridge
│   │   └── openclaw/                     ← dispatcher (Sprint 6+)
│   ├── integration/
│   │   ├── supabase/                     ← Edge Function contracts
│   │   └── wiki/                         ← Wiki retriever
│   └── e2e/                              ← Playwright (ancora 0 spec, Day 40 target)
│
├── docs/
│   ├── CLAUDE.md (copy per worktree)
│   ├── HISTORY.md                        ← progetto storia full (TBD aggiornare)
│   ├── GOVERNANCE.md                     ← 6 regole gate PR
│   ├── audits/                           ← audit periodici (ordinati per data)
│   ├── architectures/                    ← ADR-001...ADR-008 + master PDR
│   ├── business/                         ← revenue model + GPU decision
│   ├── handoff/                          ← handoff inter-session
│   ├── handoff/2026-04-24/               ← questa cartella (5 doc master)
│   ├── plans/                            ← plan storici
│   ├── prompts/                          ← template prompt (possibile secret legacy)
│   ├── superpowers/
│   │   └── plans/                        ← bite-sized TDD plans
│   ├── sunti/                            ← sunti settimanali
│   ├── test-organization.md              ← strategia test
│   ├── unlim-wiki/                       ← Karpathy L2
│   │   ├── SCHEMA.md                     ← convenzioni
│   │   ├── index.md                      ← catalog
│   │   ├── log.md                        ← audit append-only
│   │   ├── concepts/led.md, resistenza.md, legge-ohm.md (3 seed)
│   │   ├── experiments/                  ← (pending, 92 target)
│   │   ├── lessons/                      ← (pending, 27 target)
│   │   └── errors/                       ← (pending)
│   └── workflows/                        ← autonomous loop specs
│
├── automa/
│   ├── baseline-tests.txt                ← SOT baseline test count
│   ├── state/                            ← heartbeat + progress + claude-mem
│   ├── tasks/pending/                    ← ATOM-*.md task queue
│   ├── tasks/done/                       ← archivio
│   ├── evals/                            ← verdict agent
│   └── retros/                           ← retrospective sprint
│
└── .github/
    └── workflows/
        ├── deploy.yml                    ← vercel build + deploy
        ├── quality-gate.yml              ← quality-ratchet
        ├── governance-gate.yml           ← 6 regole block
        ├── e2e.yml                       ← Playwright E2E
        ├── render-warmup.yml             ← cron warmup Render
        └── sprint-6-autonomous-loop.yml  ← cron loop (dry-run oggi)
```

## Directory esterne rilevanti

```
/Users/andreamarro/VOLUME 3/
├── PRODOTTO/
│   ├── elab-builder/                     ← primary repo (main)
│   ├── elab-builder-*/                   ← worktree per feature (da pulire merged)
│   └── TEA/                              ← doc Tea collaboratrice (4 file apr)
├── CONTENUTI/
│   └── volumi-pdf/                       ← PDF volumi 1-2-3 (sorgente RAG)
├── ELAB - TRES JOLIE/                   ← asset completi fisici
│   ├── 1 ELAB VOLUME UNO/               ← 46M asset Vol 1
│   ├── 2 ELAB VOLUME DUE/               ← 35M asset Vol 2
│   ├── 3 ELAB VOLUME TRE/               ← 93M asset Vol 3
│   ├── BOM KIT CON ELENCO COMPONENTI/
│   ├── FOTO/                            ← 1GB foto kit reali
│   ├── LOGO/
│   ├── RENDERING SCATOLE/
│   ├── Video/
│   └── Volantivo per volume 1/
└── [altri]
```

## File critici (coordinamento OBBLIGATORIO prima modifica)

| File                                                | Righe | Ruolo                              |
|-----------------------------------------------------|-------|-----------------------------------|
| `src/components/simulator/engine/CircuitSolver.js`  | 2486  | Solver DC MNA/KCL                 |
| `src/components/simulator/engine/AVRBridge.js`      | 1242  | CPU emulation avr8js              |
| `src/components/simulator/engine/PlacementEngine.js`| 822   | Posizionamento componenti          |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | 3149 | Canvas SVG principale            |
| `src/services/api.js`                               | 1040  | Tutte API calls                   |
| `src/services/simulator-api.js`                     | 768   | __ELAB_API namespace              |
| `src/data/rag-chunks-v2.json`                       | ~18k  | RAG 1849 chunks                   |
| `scripts/openclaw/tools-registry.ts`                | ~670  | 57 ToolSpec                       |

## Aree libere (modifica OK)

- `src/components/lavagna/` — redesign lavagna
- `src/components/unlim/` — UI chat/mascotte/voice
- `src/components/tutor/` — tab/giochi didattici
- `src/components/common/` — shared components
- `src/components/dashboard/` — dashboard docente (vuoto)
- `src/styles/` — CSS globali
- `src/data/lesson-paths/` — lesson JSON (refactor Q1)
- `src/data/volume-references.js` — mapping pagine (da completare)
- `docs/`, `tests/` — docs + test

## Convenzioni file naming

- **Audit**: `docs/audits/YYYY-MM-DD-<topic>.md`
- **Handoff**: `docs/handoff/YYYY-MM-DD-<topic>.md` o `docs/handoff/YYYY-MM-DD/NN-...md` per raggruppare
- **Sunti**: `docs/sunti/YYYY-MM-DD-<topic>.md` o `docs/sunti/YYYY-Www-<topic>.md`
- **Plans**: `docs/superpowers/plans/YYYY-MM-DD-<slug>.md`
- **ADR**: `docs/architectures/ADR-NNN-<slug>.md`
- **Branch**: `feature/<slug>-YYYY-MM-DD`, `fix/<slug>-YYYY-MM-DD`, `docs/<slug>-YYYY-MM-DD`
- **Commit**: `tipo(area): descrizione [TEST N]` (es. `fix(ux): ConsentBanner gating [TEST 12291]`)

## README master necessari (TBD creare in sessione next)

- `README.md` root — overview + quick start + link docs
- `src/components/README.md` — mappa componenti
- `scripts/openclaw/README.md` — architettura OpenClaw L1-L2-L3
- `docs/unlim-wiki/README.md` — spiegazione Karpathy L2 pattern
- `automa/README.md` — agent team + task queue
- `tests/README.md` — strategia test + run commands
