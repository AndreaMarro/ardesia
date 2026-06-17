# AUTOPILOT — ELAB elab-builder Worker Context

> Contesto per il worker autonomo. Aggiornato a ogni run.
> Ultima modifica: 2026-04-06 (G44)

## Directory corretta
```
~/ELAB/elab-builder    ← QUESTA (NON ~/ELAB/elabtutor che non esiste)
```

## Comandi essenziali
```bash
export PATH="/opt/homebrew/bin:$PATH"   # node/npm non in PATH di default
npm test -- --run                        # unit tests (target: 1462 pass)
npm run build                            # vite build (target: PASS, ~17s)
bash evaluate-v3.sh                      # score composito /10
git push origin <branch> && gh pr create # push + PR (gh auth OK)
```

## Score target
- Build: PASS
- Tests: >= 1462 passati
- Score composito: >= 9.2/10

## Score baseline (G43, 2026-04-06)
| Area | Score |
|------|-------|
| Build/Test | 10/10 |
| Simulatore | 9/10 |
| UNLIM | 9.5/10 |
| Teacher Dashboard | 9.5/10 |
| GDPR | 9/10 |
| UX/Principio Zero | 9/10 |
| Voice Control | 8/10 |
| Resilienza Offline | 8.5/10 |
| Landing/Conversione | 8/10 |
| SEO | 7.5/10 |
| WCAG/A11y | 9.3/10 |
| **COMPOSITO** | **9.22/10** |

## Issues aperti (priorità worker)

| # | Issue | Severità | Note |
|---|-------|----------|------|
| 1 | canonical URL puntava a vercel.app | P2 → CHIUSO G44 | fix in index.html |
| 2 | og:url e og:image puntavano a vercel.app | P2 → CHIUSO G44 | fix in index.html |
| 3 | 21/27 esp Vol3 senza buildSteps | P1 | mancano 3 modalità |
| 4 | Scratch non configurato | P1 | solo 10/92 esp con scratchXml |
| 5 | Dashboard senza Supabase | P1 | solo localStorage |
| 6 | Lavagna — no persistenza pagine | P2 → CHIUSO G44 | volume, page, buildMode, panelSizes ora salvati |
| 7 | Componenti touch difficili iPad | P2 | 44px touch target |
| 8 | AdminPage #999 colori testo | P3 | contrasto basso |
| 9 | 65 file date-stamp uncommitted | P3 | rumore, gestire separatamente |
| 10 | Kimi provider senza modello | P2 | sul server Render |

## ORDINI DA ANDREA (PRIORITA' MASSIMA)
Leggi SEMPRE `automa/ORDERS/` a inizio sessione. Se ci sono file, eseguili PRIMA di tutto.
Ordini hanno priorita' su qualsiasi altro lavoro.
Se non ci sono ordini, segui il lavoro normale sotto.

**ADESSO**: Leggi `automa/ORDERS/MEGA-ORDERS-PRE-VOLO.md` — contiene 8 ordini urgenti.

## Pattern Karpathy (OBBLIGATORIO)
```
1. bash automa/evaluate-v3.sh → score PRIMA
2. Lavora (max 5 file)
3. npm test -- --run && npm run build
4. bash automa/evaluate-v3.sh → score DOPO
5. DOPO >= PRIMA? → commit + PR
6. DOPO < PRIMA? → git checkout -- . (revert)
```
OGNI PR deve avere nel body: "Score PRIMA: X → Score DOPO: Y"

## Regole di lavoro

1. **Mai pushare su main** — sempre branch + PR
2. **Max 5 file per ciclo** — non fare cambiamenti troppo ampi
3. **npm test -- --run prima di commit** — nessun test rotto
4. **npm run build prima di commit** — build deve passare
5. **Revert se score non migliora** — `git checkout -- .`
6. **Commit format**: `tipo(area): descrizione`

## Git workflow
```bash
# Crea worktree per sessione
git worktree add /tmp/elab-session-<date> -b fix/<desc>
cd /tmp/elab-session-<date>

# Oppure lavora su branch già esistente
git checkout -b fix/<desc>
# ... modifica ...
git add <files>
git commit -m "fix(area): descrizione"
git push origin fix/<desc>
gh pr create --title "..." --body "..."
```

## File critici (non toccare senza analisi)
- `src/components/simulator/engine/CircuitSolver.js` (2486 righe)
- `src/components/simulator/engine/AVRBridge.js` (1242 righe)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (3149 righe)
- `src/services/api.js` (1040 righe)
- `package.json` (no nuove dipendenze)
- `vite.config.js`

## File liberi da modificare
- `src/components/lavagna/` — Redesign lavagna
- `src/components/unlim/` — UNLIM mode UI
- `src/components/common/` — Componenti condivisi
- `src/styles/` — CSS globali
- `src/data/lesson-paths/` — Percorsi lezione JSON
- `docs/` — Documentazione
- `tests/` — Test
- `index.html` — SEO, meta, CSP
- `automa/handoff.md` — Handoff sessions

## Stack
- React 19 + Vite 7
- Vitest (1442 test)
- Deploy: Vercel (frontend) + Supabase (backend)
- Node: v25.9.0 @ /opt/homebrew/bin/node

## Infrastruttura automa
```
automa/handoff.md          ← handoff tra sessioni
automa/knowledge/          ← knowledge base
automa/reports/            ← audit reports
evaluate-v3.sh             ← score script
AUTOPILOT.md               ← questo file
```
