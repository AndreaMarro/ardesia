# PDR Giorno 3 — Mercoledì 23/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea + Tea (ONBOARDING DAY) + Team Opus
**Capacity**: Andrea 8h + Tea 4h (onboarding intensive)

## 0. Goal del giorno

**Tea onboarding completo + setup CODEOWNERS auto-merge + 92 foto TRES JOLIE batch import (PTC) + Bug T1 #3 (Render warmup).**

## 1. Pre-flight (9:00)

```bash
git status                              # clean
git pull
npx vitest run --reporter=dot | tail -3 # ≥12056 + 2 nuovi (bug 1+2)
cat docs/handoff/2026-04-22-end-day.md
```

## 2. Task del giorno

### Task 1 (P0) — Tea onboarding pair-programming (2h Andrea + 2h Tea)
- **Owner**: Andrea + Tea
- **Step**:
  1. Andrea invia GitHub collaborator invite a Tea
  2. Tea accept via email
  3. Tea: `git clone https://github.com/AndreaMarro/elab-tutor.git && cd elab-tutor && npm install`
  4. Tea: `npx vitest run --reporter=dot | tail -3` (verifica 12058+ PASS)
  5. Tea: `npm run dev` → http://localhost:5173 (verifica funziona)
  6. Tea: legge PDR_GENERALE.md + README.md pdr-ambizioso (1h)
  7. Andrea + Tea call Zoom 1h (Q&A + workflow demo)
- **Acceptance**: Tea ha repo locale funzionante + capisce workflow

### Task 2 (P0) — CODEOWNERS + auto-merge GH Action setup (2h)
- **Owner**: DEV agente
- **Files**: `.github/CODEOWNERS`, `.github/workflows/auto-merge-tea.yml`
- **Acceptance**:
  - CODEOWNERS define path safe Tea (`/src/data/glossary*`, `/src/data/experiments-vol*`, `/docs/tea/**`)
  - GH Action auto-merge se: CI verde + size <500 LoC + zero npm deps + path match safe
  - Reviewer: AUDITOR live test scenario (Tea PR mock → auto-merge OR rejected per cause)

### Task 3 (P0) — 92 foto TRES JOLIE batch import (PTC) (2h)
- **Owner**: DEV agente con PTC
- **Files**: `public/tres-jolie/*.webp` (92 foto)
- **Acceptance**: 92/92 convertite, dimensione <2MB total, qualità WebP visivamente OK
- **PTC use case**: vedi PROGRAMMATIC_TOOL_CALLING.md sezione 3 use case 2

### Task 4 (P1) — Bug T1 #3 fix: Render cold start 18s (2h)
- **Owner**: ARCHITECT design + DEV implement
- **Files**: `.github/workflows/render-warmup.yml` (cron ogni 10 min) o Cloudflare Worker scheduled
- **Acceptance**: Render `/health` ping ogni 10 min, cold start <5s in test
- **Test**: 24h monitoring post-deploy (verifica giov 24)

### Task 5 (P2) — Tea primo PR test (glossario)
- **Owner**: Tea
- **Files**: `src/data/glossary.js` (aggiungi 5 termini test)
- **Acceptance**: PR aperta, CI verde, auto-merge scatta (path safe + size + no deps)

## 3. Multi-agent dispatch

### Mattina 10:00 — parallel
```
@team-dev "Setup CODEOWNERS + auto-merge GH Action.
Files: .github/CODEOWNERS + .github/workflows/auto-merge-tea.yml.
Constraints: path safe Tea (glossario, esperimenti, docs/tea), size <500 LoC, no npm deps.
Acceptance: PR Tea path safe → CI verde → auto-merge automatic."

@team-dev "PARALLEL TO ABOVE — Programmatic Tool Calling: batch import 92 foto TRES JOLIE.
Source: /Users/andreamarro/VOLUME 3/MATERIALE/TRES_JOLIE_PHOTOS/*.HEIC
Dest: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/public/tres-jolie/*.webp
Use PTC pattern (see PROGRAMMATIC_TOOL_CALLING.md use case 2).
Output: summary in context (~150 token)."

@team-architect "Design fix Render cold start.
Options: GH Action cron, Cloudflare Worker scheduled, UptimeRobot ping.
Output ADR docs/decisions/ADR-002-render-warmup.md."
```

### Pomeriggio 14:00 — Tea call Zoom 1h
- Andrea screen-share workflow
- Tea Q&A
- Tea primo PR aperta in live

### Tardo 16:00
- @team-reviewer auto-merge GH Action review
- @team-auditor live test Tea PR mock auto-merge

### Sera 17:30
- @team-tpm verifica board
- Andrea handoff

## 4. Programmatic Tool Calling

**Use case primario**: 92 foto TRES JOLIE convert (vedi sezione 3 task 3).

## 5. Comunicazione
- Tea Zoom call 14:00 (1h) — onboarding live
- Andrea + Tea Telegram async post-call

## 6. Definition of Done giorno 3
- [ ] Tea onboarding completo (repo + workflow capito)
- [ ] CODEOWNERS + auto-merge GH Action operativo
- [ ] 92 foto TRES JOLIE in `/public/tres-jolie/`
- [ ] Tea primo PR auto-merged (test scenario)
- [ ] Bug T1 #3 fix deployed (warmup attivo)
- [ ] CoV 3x vitest PASS
- [ ] Handoff doc scritto

## 7. Rischi
- Tea overwhelmed dopo 4h intensive → break + reschedule task minor a giov
- 92 foto sips error (formati misti) → fallback ImageMagick singoli falliti
- Auto-merge Action permission issue (GH token) → manual review fallback sett 1
- Render warmup cron limitato free tier → Cloudflare Worker plan B

## 8. Skills + MCP
- `claude-code-guide` (GH Actions setup)
- `superpowers:brainstorming` (Tea pair programming)
- `cloudflare` MCP (Worker setup se needed)

## 9. Self-critica
[Compilare sera]

## 10. Handoff
`docs/handoff/2026-04-23-end-day.md`

---
**Forza ELAB. Tea ONBOARD + 92 foto importate.**
