# Prompt Prossima Sessione ELAB — 2026-04-20 (o quando Andrea riprende)

> **IMPORTANTE**: Leggi questo prompt INTERO prima di qualsiasi azione. Rileggi `supabase/functions/_shared/system-prompt.ts` 3 volte. Pre-flight obbligatorio.

---

## 🎯 Obiettivo sessione

Recuperare gap dalla sessione 19/04 PM (vedi `AUDIT-ONESTO-2026-04-19-PM.md`) e avanzare masterplan Fase 2.5 + Fase 3.

**Target primario**: Fumetto Report WIRED-UP in LavagnaShell + verificato live + TRES JOLIE photos importate.

**Target secondario**: Watchdog PR #5 merged + secrets added + workflow verified active.

**Target terziario**: Feature 3 Brand Alignment UI iniziata.

---

## 📋 Pre-flight obbligatorio (15 min)

Read in ordine:

1. **`supabase/functions/_shared/system-prompt.ts`** × 3 — Principio Zero v3 BASE_PROMPT immutabile
2. **`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-watchdog-staging/AUDIT-ONESTO-2026-04-19-PM.md`** — stato reale onesto + errori commessi
3. **`CLAUDE.md`** — regole progetto + file critici + bug aperti
4. **`docs/GOVERNANCE.md`** — 8-step + 5 regole ferree
5. **`docs/audits/2026-04-19-postmortem-caveman-session.md`** — 10 errori sessione mattina
6. **`docs/audits/errors-log-2026-04.md`** — 7 anomalie tracked (merge da PR #5)
7. **`docs/superpowers/plans/2026-04-19-recovery-phase2.md`** — master plan originale
8. **`docs/plans/2026-04-19-pdr-fumetto-report.md`** — PDR Fumetto (già implementato MVP, serve Phase 1.5)
9. **`CHANGELOG.md`** — entries ultime feature

**Conferma pre-flight**:
```
"Pre-flight completo. Principio Zero v3 re-read 3x. Audit onesto letto. Gap identificati: Phase 1.5 wire-up, TRES JOLIE assets, Feature 3 Brand, Routines Orchestrator disable, live verify. Tools: git worktree isolamento, Playwright MCP live, Supabase MCP secrets."
```

---

## 🔒 Stato sistema (19/04/2026 fine sessione PM)

### PRs GitHub

| # | Branch | State | Note |
|---|--------|-------|------|
| 4 | feature/vision-e2e-live | MERGED 06:26Z | Vision E2E live CLI #1 |
| 5 | feature/watchdog-monitor | **OPEN CLEAN** | Watchdog ops, ALL CI GREEN, attesa Andrea merge |
| 6 | feature/fumetto-report-mvp | **MERGED** dbd4cca | Fumetto MVP standalone (NON wired) |

### Main HEAD

**SHA**: `dbd4cca feat(lavagna): Fumetto Report MVP — 6 vignette + Principio Zero v3 narrations (#6)`

### Baseline test

- Locale: **12098** (post Fumetto merge)
- CI file: `.test-count-baseline.json` → `total: 11958 | localTotal: 12081` (ma outdated post fumetto merge — andrà aggiornato a 12098)

### Production status

- https://www.elabtutor.school → HTTP 200 ✅
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat OPTIONS → 204 ✅
- Edge functions 5 deployed (unlim-chat/hints/diagnose/tts/gdpr)

### Worktrees attive (current Mac)

```bash
git worktree list
# /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder                [feature/vision-e2e-live]  — CLI #1
# /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-watchdog       [feature/watchdog-monitor] — PR #5
# /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-fumetto        [feature/fumetto-report-mvp] — PR #6 merged, cleanup
```

**Cleanup consigliato dopo merge**:
```bash
git worktree remove "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-fumetto"
# Dopo PR #5 merge:
git worktree remove "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-watchdog"
```

### Secret GitHub state

Verificato `gh secret list -R AndreaMarro/elab-tutor`:
- ✅ VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN
- ❌ ELAB_ANON_KEY (watchdog degrades to CORS-only)
- ❌ ANTHROPIC_API_KEY (Routines Orchestrator fail loop)

### CLI #1 process

- PID 31857, started 11:13AM, etime ~6h
- Stato monitorato: alive ma idle/active oscillante
- Ha completato PR #4 vision-e2e + fix CI infra (lightningcss + coverage-comment)

---

## 🎯 Tasks prioritized (Fase 2.5)

### T1 — Live verify produzione post-merge (30 min, PRIORITÀ ALTA)

```bash
# Usa Playwright MCP
mcp__plugin_playwright_playwright__browser_navigate https://www.elabtutor.school
# Verifica:
# - Lavagna tab → nuovi componenti (VisionButton, potenzialmente Fumetto trigger)
# - Click "Guarda il mio circuito" → vision flow UNLIM
# - Verifica Principio Zero v3 tono response chat
# - Console errors (mcp__Claude_Preview__preview_console_logs)
# - Network failures (mcp__Claude_Preview__preview_network)
```

Deliverable: `docs/audits/2026-04-20-live-verify-post-fumetto-merge.md` con screenshot.

### T2 — Phase 1.5 LavagnaShell wire-up Fumetto (60-90 min, PRIORITÀ ALTA)

**Problema**: PR #6 ha shipped component standalone. NO bottone "Fine sessione" in LavagnaShell.

**Implementation**:
1. Aggiungi button "Fine sessione — Fumetto Report" in `src/components/lavagna/LavagnaShell.jsx` (toolbar o menu)
2. On click: raccogli `experimentsCompleted` da session tracker (verificare se esiste `studentService.getSession()` o simile)
3. Invoca UNLIM per generare narrations per ogni experimentId completato (batch call o sequential)
4. Rendi `SessionReportComic` in overlay/modal o sezione dedicata
5. Test E2E Playwright: click fine sessione → report visibile → scarica PDF

**Branch**: `feature/fumetto-wire-up`
**Governance**: 8-step standard

### T3 — TRES JOLIE asset import script (45 min, PRIORITÀ MEDIA)

**Source**: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/FOTO/{1 FOTO VOL 1,2 FOTO VOL 2,3 FOTO VOL. 3}/`

Script `scripts/import-tres-jolie-photos.js`:
1. Recursive scan source folders
2. Convert JPG/PNG → WebP 80% quality via `sips` (macOS built-in) or `sharp` (se installato)
3. Destination `public/brand/foto-esperimenti/volN/{name}.webp`
4. Update `src/data/experiment-photo-map.js` con mapping esperimento → foto (basato su filename pattern)
5. Verify `public/brand/` < 10MB totale (Vercel deploy budget)
6. Se > 10MB: alternative Vercel Blob storage (richiede Andrea approval)

Commit: `feat(assets): import TRES JOLIE foto esperimenti (N photos vol1+vol2+vol3)`

**Branch**: `feature/tres-jolie-assets`

### T4 — Watchdog PR #5 merge + setup (15 min, PRIORITÀ MEDIA-ALTA)

Se PR #5 ancora open post-Andrea-login:
1. Verifica CI final state: `gh pr checks 5 -R AndreaMarro/elab-tutor`
2. Andrea: `gh pr ready 5 -R AndreaMarro/elab-tutor && gh pr merge 5 --squash --delete-branch -R AndreaMarro/elab-tutor`
3. Post-merge: `gh secret set ELAB_ANON_KEY -R AndreaMarro/elab-tutor` (paste valore, NON in chat)
4. Verifica primo cron entro 15 min: `gh run list --workflow=watchdog.yml -R AndreaMarro/elab-tutor`
5. Se fail primo run: `gh run view [id] --log-failed` e fix

### T5 — Routines Orchestrator disable (5 min, PRIORITÀ MEDIA)

CI wastage: ~48 run/giorno, tutti fail ANTHROPIC_API_KEY missing. Andrea decide:

**Opzione A (rapida)**:
```bash
git mv .github/workflows/routines-orchestrator.yml .github/workflows/routines-orchestrator.yml.disabled
git commit -m "chore(ops): disable routines-orchestrator workflow (ANTHROPIC_API_KEY secret missing — re-enable when ready)"
```

**Opzione B (quando ready)**:
```bash
gh secret set ANTHROPIC_API_KEY -R AndreaMarro/elab-tutor
# Verifica primo run success
```

### T6 — Feature 3 Brand Alignment UI (2-3h, PRIORITÀ MEDIA)

Master plan Fase 2 terza feature. SKIPPED sessione 19/04 PM.

**Scope**:
1. Logo ELAB in `src/components/lavagna/AppHeader.jsx` (da `public/brand/logo-elab.svg` post T3)
2. Palette ELAB CSS vars in `src/styles/design-system.css` (Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D)
3. Kit preview scatola in top capitolo `LessonReader.jsx`
4. Font Oswald + Open Sans verified in use
5. WCAG AA contrast check (4.5:1 text / 3:1 graphics)

**PDR**: vedi `docs/superpowers/plans/2026-04-19-recovery-phase2.md` Feature 3 Task 3.1-3.5.

**Branch**: `feature/brand-alignment-ui`

### T7 — claude-mem plugin installation (5 min, PRIORITÀ ALTA per persistence)

Andrea richiesto. Install comando:
```
/plugin marketplace add thedotmack/claude-mem && /plugin install claude-mem
```

Dopo install:
- Plugin capture decisioni/bug/architecture automatically
- Contesto searchable in sessioni future
- Verify via documentation: https://docs.claude-mem.ai/introduction

**Nota**: verifica se plugin funziona in Claude Code CLI e/o Desktop App (Andrea usa entrambi).

---

## 🛑 Anti-pattern da NON ripetere

1. **NO caveman mode per audit/handoff** — regola di Andrea override caveman quando richiede onestà brutale
2. **NO skipping live verify** — dopo ogni merge, aprire browser e verificare, non fidarsi del CI
3. **NO new feature prima di wire-up vecchia** — Fumetto MVP standalone è codice morto, priorità wire-up
4. **NO CI iteration senza leggere postmortem** — errori pre-existing sono documentati, evitare re-investigation
5. **NO branch naming generico** — controllare pre-existence con `git branch -a | grep pattern`
6. **NO pre-commit hook bypass** — symlink node_modules, non `--no-verify`
7. **NO assumption "tutto OK"** — se non hai verificato live, dichiaralo esplicitamente
8. **NO secret in chat** — usare MCP Supabase tools o `gh secret set` interattivo
9. **NO ignore governance override giustificato** — ops-only PR merita `[GOVERNANCE-OVERRIDE: ops-only, no src]`
10. **NO force-push senza --force-with-lease** — safety first

---

## 🛠️ Tool stack da usare (non solo installato)

Min 4 per sessione:

- **`mcp__plugin_playwright_playwright__*`** — browser live obbligatorio per verify (T1)
- **`mcp__supabase__*`** — secrets + deploy edge functions
- **`superpowers:systematic-debugging`** — bug live produzione
- **`superpowers:verification-before-completion`** — pre-PR checklist
- **`elab-rag-builder` / `quality-audit` / `volume-replication`** — built-in skills
- **`anthropic-skills:xlsx`** / **`anthropic-skills:pdf`** — TRES JOLIE docs
- **`.claude/external-agents/wshobson-agents/plugins/comprehensive-review/`** — secondary audit
- **`.claude/external-agents/agency-agents/design/design-inclusive-visuals-specialist`** — Feature 3 a11y

---

## 📊 Metriche successo sessione

Target deliverable:
- [ ] PR #5 watchdog merged + secrets added + primo cron run PASS
- [ ] Fumetto wire-up in LavagnaShell (PR nuovo, CI green)
- [ ] TRES JOLIE import script + foto deployate
- [ ] Live verify produzione screenshot + report
- [ ] claude-mem installed + functional
- [ ] Almeno Feature 3 branch creato + pre-audit + TDD fail-first commit

Baseline preservato: **12098 minimum** (altrimenti revert).
Bundle size: **< 90MB** (bundle_max_kb in baseline).
Lighthouse score elabtutor.school: **≥ 95 a11y**.

---

## 🚨 Critical reminders

- **Principio Zero v3 immutabile** — NON toccare `supabase/functions/_shared/system-prompt.ts` senza ADR documento
- **Regola 0 Governance** — riuso prima di rewrite, documenta se rewrite (REWRITE-XXX.md)
- **5 regole ferree** governance-gate CI bloccano merge
- **MAI dati finti** (CLAUDE.md regola 12) — Fumetto narrations DEVE usare UNLIM real, non mock
- **MAI "Galileo" in user-facing code** (CLAUDE.md regola 14) — nome è **UNLIM**

---

## 📝 Context persistence setup

Andrea vuole **context not lost between sessions**. Steps obbligatori fine sessione:

1. Update `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` con riferimenti a questo audit
2. Commit final state in git (handoff doc)
3. Se claude-mem installed: verificare plugin ha capturato decisioni
4. Write `docs/handoff/2026-04-20-session-end.md` con SHA + open PRs + pending tasks

---

## 🎬 Start sequence

```bash
# 1. Ambiente pulito
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git fetch origin
git checkout main && git pull origin main
git log -3 --oneline  # verifica main HEAD = dbd4cca o più recente

# 2. Claude CLI with bypass permissions + opus
claude --permission-mode bypassPermissions --model opus

# 3. Incolla questo prompt intero + Andrea comando specifico task (es. "T1 live verify" o "T2 wire-up")
```

**Opus 4.7 xhigh, no shortcut, massima rigorosità.**

---

## 📁 Files reference

Tutti relativi a `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`:

- Pre-flight reads: vedi sezione sopra
- Staging files (not in git yet): `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-watchdog-staging/`
- Handoff docs: `docs/handoff/`
- Audits: `docs/audits/`
- Plans: `docs/plans/`, `docs/superpowers/plans/`
- Features: `docs/features/`
- Tasks: `docs/tasks/`
- Reports CoV: `docs/reports/`

---

**Generato**: 2026-04-19 PM
**Autore**: Watchdog Session (Claude Desktop App)
**Review status**: da leggere inizio prossima sessione
