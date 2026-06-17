# Sprint U iter 4 MANDATE — Complete deferred items (Andrea NO debito tecnico)

**ANDREA EXPLICIT**: PR #57 NON MERGE finché iter 4-5 completa deferred. NO compiacenza.

## Iter 4 deferred items P0 (BLOCK PR merge se non risolti)

### Cat A.1 — "Ragazzi," opener 91/94 teacher_messages (RIMASTI 91/94)

Per ogni `src/data/lesson-paths/v[123]-*.json`, in ogni `teacher_messages` phase
(PREPARA, CHIEDI, OSSERVA, COSTRUISCI, VERIFICA), aggiungere prefisso "Ragazzi," ALL'INIZIO se mancante.

Pattern AWK/sed:
```bash
# Per ogni file lesson-path che ha teacher_messages senza "Ragazzi,"
# Trasforma il primo string del messages array in "Ragazzi, <originale>"
# DOVE originale NON inizia già con "Ragazzi"
```

Verify post-fix: `grep -rE '"messages":\s*\[\s*"' src/data/lesson-paths/ | grep -v "Ragazzi" | wc -l` deve essere ≤3.

### Cat C — Palette hex 833 violations (RIMASTE 766 hex non fixed)

1. Scan completo: `grep -rE "#[0-9a-fA-F]{6}\b" src/components/ src/styles/ | grep -vE "(\\/\\*|//|--elab-)" | wc -l` deve scendere da 833 → ≤50.
2. Replace pattern automatico:
   - `#1E4D8C` → `var(--elab-navy)`
   - `#4A7A25` → `var(--elab-lime)`
   - `#E8941C` → `var(--elab-orange)`
   - `#E54B3D` → `var(--elab-red)`
3. Per hex non-canonical (custom): keep se in `:root` definition O documenta come exception
4. Audit doc: `docs/audits/sprint-u-cycle1-iter1-design-fix-iter4.md` con replacement matrix per file

### Cat C — Lighthouse perf 43 → ≥90

1. Re-bench Lighthouse:
   ```bash
   npx lighthouse https://www.elabtutor.school/#chatbot-only \
     --output=json \
     --output-path=docs/audits/sprint-u-cycle1-iter4-lighthouse-post-fix-chatbot.json \
     --only-categories=performance,accessibility,best-practices,seo --quiet
   ```
2. Apply optimization sequence (PDR §7 Cat C):
   - Lazy-load `react-pdf` + `mammoth` in `src/components/lavagna/VolumeViewer.jsx`
   - Defer non-critical chunks `vite.config.js`
   - Image optim PNG `dist-test/volumes/*.pdf` thumbnails (compress)
   - Font preload `<link rel="preload">` in `index.html`
3. Re-bench DOPO ogni optimization, target perf ≥90 cumulativo
4. Document: `docs/audits/sprint-u-cycle1-iter4-lighthouse-progression.md` con before/after each optimization

### Cycle 2 P0 — Playwright 94/94 full sweep

```bash
cd ~/Projects/elab-sprint-u-20260501T0815
npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js \
  --config tests/e2e/sprint-u.config.js \
  --reporter=line,json \
  --output docs/audits/sprint-u-cycle1-iter4-full-vol1-vol2/
npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol3-full.spec.js \
  --config tests/e2e/sprint-u.config.js \
  --reporter=line,json \
  --output docs/audits/sprint-u-cycle1-iter4-full-vol3/
```

Acceptance:
- 65/65 vol1+vol2 PASS LIVE prod
- 29/29 vol3 PASS LIVE prod
- 94 × 4 modalità = **376 PNG screenshots**
- 94 esperimenti × clearCircuit test = **94/94 lavagna pulita verify**
- Document: `docs/audits/sprint-u-cycle1-iter4-livetest-full-94.md`

### Audit docs MISSING — create iter 4

1. `docs/audits/sprint-u-cycle1-iter4-fix-verifier.md` — verify post-fix matrix Cat A-F
2. `docs/audits/sprint-u-cycle1-iter4-design-fix.md` — design overhaul progress

## Vincoli iter 4

- vitest 13474 PASS preserve
- NO --no-verify (pre-commit hook obbligatorio)
- Push origin same branch `mac-mini/sprint-u-cycle1-iter1-20260501T0815`
- AMEND existing PR #57 con `git push origin <branch>` (force push NON necessario, append commits)
- NO close PR #57 — Andrea decision merge dopo iter 4-5 success
- Heartbeat update post ogni step

## Skill mapping iter 4 (use Skill tool MANDATORY)

- `superpowers:systematic-debugging` per Lighthouse perf root cause
- `superpowers:executing-plans` per fix sequence Cat A-F
- `impeccable:critique` + `impeccable:colorize` + `impeccable:typeset` + `impeccable:audit` + `impeccable:optimize`
- `superpowers:verification-before-completion` per ogni Cat post-fix
- `superpowers:dispatching-parallel-agents` per Lighthouse + Playwright + palette in parallel

## Stop conditions

- File `/tmp/elab-sprint-u-stop` → STOP
- Cat A.1 + Cat C + Lighthouse + Playwright tutti DONE → close iter 4 + amend PR + handoff iter 5
- Anthropic org limit hit → graceful pause + heartbeat segnala

## Commit pattern iter 4

Atomic commits per Cat:
- `feat(sprint-u-iter4): Cat A.1 Ragazzi opener 91/94 teacher_messages`
- `feat(sprint-u-iter4): Cat C palette 766 hex → CSS var (Navy/Lime/Orange/Red)`
- `perf(sprint-u-iter4): Cat C Lighthouse perf 43→XX (lazy-load + defer + image optim + font preload)`
- `test(sprint-u-iter4): Playwright 94/94 full sweep + 376 screenshots + clearCircuit verify`
- `docs(sprint-u-iter4): fix-verifier + design-fix audit docs`
- `docs(sprint-u-iter4): close iter 4 + handoff iter 5`

