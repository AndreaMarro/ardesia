# Prompt nuova sessione CLI — Fase 2 Feature Core Execution

**Data**: 2026-04-19 PM
**Obiettivo sessione**: Implementare Vision E2E + Fumetto Report + Brand alignment su `feature/*` branches con governance 8-step ferrea. Deploy Supabase via MCP. Test live elabtutor.school via Playwright MCP. Nessuno scope creep.
**Durata stimata**: 10-14h autonome (3 feature paralleli o sequenziali)
**Model**: Opus 4.7 xhigh
**Permission mode**: bypassPermissions

---

## 🚀 Come lanciare

Nel terminale ELAB-builder pulito:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
claude --permission-mode bypassPermissions --model opus
```

Attendi prompt `❯`, poi copia/incolla TUTTO il blocco "PROMPT DA INCOLLARE" sotto.

---

## 📝 PROMPT DA INCOLLARE (integrale, zero modifiche)

```
# REGOLE FERREE (non derivare mai)

## Pre-flight obbligatorio (ESEGUI PER PRIMA COSA)

1. Read `docs/audits/2026-04-19-postmortem-caveman-session.md` — 10 errori commessi stamattina, contromisure
2. Read `docs/superpowers/plans/2026-04-19-recovery-phase2.md` — master plan con task dettagliati
3. Read `docs/plans/2026-04-19-pdr-vision-e2e.md` — PDR Feature 1
4. Read `docs/plans/2026-04-19-pdr-fumetto-report.md` — PDR Feature 2
5. Read `supabase/functions/_shared/system-prompt.ts` — Principio Zero v3 BASE_PROMPT (rileggi 3 volte)
6. Read `CLAUDE.md` — regole progetto + file critici
7. Read `docs/GOVERNANCE.md` — 8-step + 5 regole ferree
8. Read `docs/external-principles/karpathy-claude.md` — Think/Simple/Surgical/Goal

DOPO aver riletto: conferma nel chat output "Pre-flight completo. Principio Zero v3 re-read 3 volte. Plan caricato."

## Governance 8-step per OGNI task (no eccezioni)

1. **Pre-audit**: git SHA + baseline test count + build OK → `docs/tasks/TASK-XXX-start.md` → commit `chore(task): start TASK-XXX`
2. **TDD fail-first**: test completo scritto → run → verify FAIL → commit `test(area): TDD fail per TASK-XXX`
3. **Implementation**: codice minimale per passare test → commit `feat/fix(area): implementa TASK-XXX`
4. **CoV 3x**: `npx vitest run` 3 volte consecutive → `docs/reports/TASK-XXX-cov.md` con tabella 3/3 PASS → commit
5. **Audit indipendente**: dispatch sub-agent (coderabbit/wshobson/comprehensive-review) → `docs/audits/TASK-XXX-audit.md` verdict APPROVE/CHANGES/BLOCK → commit
6. **Doc-as-code**: `docs/features/X.md` nuovo/update + `CHANGELOG.md` entry + se REWRITE `docs/decisions/REWRITE-X.md` → commit
7. **Post-audit**: baseline count ≥ pre-task, benchmark ≥ pre-task, build OK → `docs/audits/TASK-XXX-post.md` → commit
8. **Merge prep**: push branch + `gh pr create --draft` con body completo (CoV/audit/governance checkbox)

## Regole ferree sempre

- **CoV 3x always**: anche commit 1-carattere, anche docs-only. Zero eccezioni. Violazione = PR reject.
- **NO secret in chat**: use `mcp__supabase__*` MCP tools, env vars, `.env.local`
- **NO scope creep**: 1 feature = 1 branch = 1 PR. Se trovi bug off-scope → documento `docs/backlog/` + skip
- **Principio Zero v3 preserved**: `supabase/functions/_shared/system-prompt.ts` NON toccare senza ADR
- **Baseline preserve**: se `npx vitest run` scende < baseline pre-task → revert immediato
- **`npm run build` pass**: prima di ogni commit
- **Budget token 80%**: commit partial + `docs/reports/TASK-XXX-partial.md` + STOP pulito (no rush)
- **Atomic commits**: 1 commit = 1 concetto (feat, test, docs, chore separati)
- **NO --no-verify, --no-gpg-sign**: pre-commit hook è protezione
- **NO force push main**: sempre PR + CI pass

## Stop moments (discipline anti scope-creep)

Ogni 3 commit:
1. Pausa 60s
2. Re-read obiettivo task corrente (PDR)
3. Ask "sto executing il PDR o ho derivato in sidequest?"
4. Se sidequest → documento + torna PDR

Ogni 1h:
1. Verifica baseline via `npx vitest run --reporter=dot | tail -3`
2. Verifica git status pulito (noise auto-signatures dichiarato se presente)
3. Post status PR con comment progress

## Tool stack ATTIVAMENTE da usare (non solo installato)

Minimo 3 di questi devono apparire in prompt steps:

**Built-in ELAB skills**:
- `anthropic-skills:xlsx` — leggi BOM kit TRES JOLIE
- `anthropic-skills:pdf` — leggi manuali volumi TRES JOLIE
- `elab-rag-builder` — costruisci RAG da PDF
- `quality-audit` — audit end-to-end
- `volume-replication` — parallelismo volumi
- `elab-benchmark` — 30 metriche score

**Superpowers**:
- `superpowers:test-driven-development` — TDD enforced
- `superpowers:systematic-debugging` — root cause obbligatorio
- `superpowers:verification-before-completion` — pre-complete check

**MCP tools**:
- `mcp__plugin_playwright_playwright__*` — browser live elabtutor.school
- `mcp__supabase__*` — edge deploy senza secrets

**Agent pool**:
- `.claude/external-agents/wshobson-agents/plugins/accessibility-compliance/`
- `.claude/external-agents/wshobson-agents/plugins/comprehensive-review/`
- `.claude/external-agents/agency-agents/design/design-whimsy-injector.md`
- `.claude/external-agents/agency-agents/design/design-inclusive-visuals-specialist.md`
- `.claude/external-agents/agency-agents/design/design-visual-storyteller.md`

## GitHub workflow obbligatorio

- `gh pr view <n>` per status
- `gh pr checks <n>` per CI
- `gh pr comment <n>` per update
- `gh pr create --draft` per apertura
- `gh run view <id>` per log
- Screenshot + incolla in PR comment come evidence quando utile

## Elabtutor live verify obbligatorio

Ogni feature che tocca UI/UX:
1. Deploy via MCP (se Edge Function)
2. `mcp__plugin_playwright_playwright__browser_navigate` elabtutor.school
3. Test flusso user (click, fill form, verify response)
4. Screenshot stato post-feature
5. Documenta live-verify in `docs/audits/TASK-XXX-live-verify.md`

---

# TASK ORDINATI

## PREREQUISITE CHECK

Prima di iniziare feature task:

1. Verifica PR #3 stato (merged o aperto?)
   ```bash
   gh pr view 3 --json state,mergeable
   ```
2. Se PR #3 NOT MERGED: blocca feature work finché Andrea risolve (override governance o fix CI)
3. Verifica produzione elabtutor.school funzionante via Playwright MCP:
   ```
   mcp__plugin_playwright_playwright__browser_navigate https://www.elabtutor.school
   ```
   Se UNLIM chat produce "non ha risposto" → verifica `unlim-chat` deploy post P0-B
4. Verifica main baseline test:
   ```bash
   git checkout main && git pull
   npx vitest run --reporter=dot | tail -5
   ```
   Expected: 12081+ PASS.

Se qualsiasi prerequisite fallisce: scrivi `docs/handoff/2026-04-19-blocker.md` con stato + stop. Andrea interverrà.

---

## FEATURE 1: Vision E2E live

Segui esattamente `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → "Feature 1" → Task 1.1-1.7.

Branch: `feature/vision-e2e-live`
Durata: 3-4h
Exit criteria vedi `docs/plans/2026-04-19-pdr-vision-e2e.md`

Post-PR: aspetta CI green. Se CI red (lightningcss gap pre-existing), commenta PR #3 pattern. Andrea decide override.

---

## FEATURE 2: Fumetto Report MVP

Segui `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → "Feature 2" → Task 2.1-2.7.

Branch: `feature/fumetto-report-mvp`
Durata: 4-5h
Exit criteria vedi `docs/plans/2026-04-19-pdr-fumetto-report.md`

**Attenzione**:
- Asset foto TRES JOLIE import richiede `sips` macOS per webp conversion
- `html2pdf.js` npm install richiede Andrea approval (hook block)
- Se hook block install: fallback `window.print()` MVP, html2pdf Phase 2

---

## FEATURE 3: Brand alignment UI

Segui `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → "Feature 3" → Task 3.x.

Branch: `feature/brand-alignment-ui`
Durata: 2-3h
Pattern simile ma minimale: aggiorna AppHeader + LessonReader con logo + palette da public/brand/.

---

# EXECUTION MODE

## Ordine consigliato

Sequenziale (se solo 1 Max account):
1. Prerequisite check (30 min)
2. Feature 1 Vision E2E (3-4h)
3. Feature 2 Fumetto (4-5h)
4. Feature 3 Brand (2-3h)

Totale: 10-13h. 1 Max account sufficiente con budget 220k token/5h → forse cap a 2 feature per sessione.

Parallelo (se 2 Max account su 2 CLI separate):
- Max #1: Feature 1 → Feature 3
- Max #2: Feature 2

Parallel possibile ma coordinazione merge conflict su LavagnaShell.jsx. Preferibile sequenziale.

## Budget token management

Se 80% budget consumato a metà di un Task step:

1. Completa lo step corrente
2. `git add` + `git commit` con label `[PARTIAL]` in message
3. Write `docs/reports/TASK-XXX-partial.md`:
   ```
   # TASK-XXX partial state
   - Task completed: [Task N.M]
   - Task in progress: [Task N.M+1]
   - Next step: [concrete description]
   - Budget remaining: ~N% (X token)
   - Stop reason: budget cap
   ```
4. Push branch (anche se PR non ancora)
5. STOP pulito. NO rush last commit.

## Emergency rollback

Se qualsiasi step causa:
- Baseline test scende > 50 da pre-task
- Build fail
- Production regression (live test rivela rottura)

→ `git reset --soft HEAD~N` (conserva work), `git stash`, investigate root cause, NO push.

---

# FINAL DELIVERABLES (prima di stop sessione)

1. PR #4 draft aperta per Feature 1 (link in chat output)
2. PR #5 draft aperta per Feature 2 (se completata)
3. PR #6 draft aperta per Feature 3 (se completata)
4. `CLAUDE.md` aggiornato con "Bug aperti" status post feature
5. `CHANGELOG.md` entries 3 feature
6. `docs/features/vision-e2e.md` + `docs/features/fumetto-report.md` + `docs/features/brand-alignment.md` complete
7. Post-audit finale `docs/audits/2026-04-19-PM-session-final.md` con:
   - Feature completate
   - Baseline delta
   - Live verify screenshot elabtutor.school
   - Token budget usato
   - Next session handoff
8. Telegram/notification Andrea quando stop

---

# Comandi rapidi riferimento

```bash
# Verifica stato
git status
git log --oneline -10
gh pr list
gh pr checks [N]

# Test
npx vitest run --reporter=dot | tail -5
npx vitest run --reporter=verbose path/to/test.spec.js
npx playwright test tests/e2e/22-vision-flow.spec.js

# Build
npm run build

# Deploy Edge (tramite MCP, non CLI):
# Usa mcp__supabase__deploy_edge_function tool

# Playwright live
# Usa mcp__plugin_playwright_playwright__browser_navigate
# Usa mcp__plugin_playwright_playwright__browser_evaluate
```

---

START. RIGOROSO. OPUS 4.7 FULL EFFORT. NO SHORTCUT. PRINCIPIO ZERO V3 PRESERVED.
```

---

## 📋 Note per Andrea (prima di lanciare)

1. **Pre-requisite P0-B completato?** unlim-chat deploy via `npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb` → verifica live CORS OK
2. **Pre-requisite P0-C completato?** 3 secret rotati (anon, service_role, PAT)
3. **PR #3 stato**: merge con override `[GOVERNANCE-OVERRIDE]` o abbandono branch
4. **Budget Max**: verifica minimo 150k token disponibili per nuova session (check in Anthropic dashboard)
5. **Terminale**: chiudi 2 dei 3 chaos, apri nuova clean window

## 🎯 Se vuoi SOLO Feature 1 (Vision E2E) come test

Sostituisci sezione "TASK ORDINATI" → "FEATURE 1 Vision E2E" con commento:

```
DOPO Feature 1 completata: STOP sessione. Non continuare Feature 2/3.
Commit `docs/reports/2026-04-19-vision-only-complete.md` con stato.
```

Così verifichi che execution workflow funziona prima di ambitious 3-feature.

---

## ⚡ Cheat sheet monitoraggio (per te Andrea)

Mentre Claude CLI lavora in autonomia, ogni 30-60 min:

1. **Check progress**: `tail -f automa/state/session.log` (se esiste)
2. **Check commits**: `git log --oneline origin/feature/vision-e2e-live`
3. **Check PR**: `gh pr list --author @me`
4. **Live elabtutor**: aprimi browser su https://www.elabtutor.school e verifica stato
5. **CI status**: `gh pr checks [N]`

Se vedi stuck > 2h senza commit: check `ps aux | grep vitest` → se hung, kill + Andrea restart session.
