# Mac Mini Activation Prompt — Sprint U Ralph Loop 94 Esperimenti

**Andrea**: copia il testo dentro il riquadro `═══════` qui sotto e incollalo come PRIMO MESSAGGIO nella sessione Claude Mac Mini (via SSH `progettibelli@100.124.198.59`). Domani vediamo il risultato.

═══════════════════════════════════════════════════════════════════

# Sprint U Ralph Loop — 94 Esperimenti UNO PER UNO + Parità Narrativa Volumi

Sei il **Mac Mini autonomous orchestrator** di ELAB Tutor (Italian K-12 educational Arduino/electronics tutor for children 8-14). Esegui ralph loop H24 multi-cycle 8 agents → 4 → 2 → 1 (consolidation funnel) per auditare + fixare TUTTI 94 esperimenti UNO PER UNO. Ogni cycle re-sweeps tutti 94 esperimenti.

## Phase 0a — SETUP MAC MINI ENVIRONMENT (MANDATORY pre-Cycle 1)

**Tutti i comandi shell DEVONO essere wrappati `bash -lc "..."` OPPURE prefissati `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH` — SSH non-login shell NON sourcia `~/.zshrc` per node/npm/claude.**

```bash
# 1. Verify tools presenti
bash -lc "node -v && npm -v && claude --version"
# Expected: v25.9.0 + 11.12.1 + 2.1.119

# 2. Vai al repo
cd ~/Projects/elab-tutor

# 3. Stash any pending Mac Mini cron iter36 changes (NON rimuove autonomous loop)
git stash push -m "sprint-u-pre-setup-stash"

# 4. Fetch latest origin
git fetch origin

# 5. Create isolated worktree per Sprint U (NON disturba cron iter36 corrente)
git worktree add ../elab-sprint-u-cycle1-iter1 -b mac-mini/sprint-u-cycle1-iter1-$(date +%Y%m%dT%H%M%S) origin/e2e-bypass-preview
cd ../elab-sprint-u-cycle1-iter1

# 6. Verify Sprint U files presenti post-pull
ls docs/plans/PDR-SPRINT-U-*.md docs/plans/MACMINI-ACTIVATION-PROMPT-*.md

# 7. node_modules condiviso? Se mancano, installa (richiede ~14min):
ls node_modules 2>/dev/null && echo "node_modules OK" || bash -lc "npm install"

# 8. Verify vitest baseline GREEN entry gate
bash -lc "npx vitest run --reporter=basic 2>&1 | tail -5"
# Expected: Tests 13474 passed | 15 skipped | 8 todo

# 9. Update heartbeat
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) sprint-u cycle1 iter1 phase0a-setup-complete" >> automa/state/heartbeat
```

## Contesto critico (leggi PRIMA)

1. **PDR master**: `/Users/progettibelli/Projects/elab-tutor/docs/plans/PDR-SPRINT-U-PARITA-NARRATIVA-94-ESPERIMENTI-RALPH-LOOP.md` — leggi tutto §1-§14
2. **CLAUDE.md project**: `/Users/progettibelli/Projects/elab-tutor/CLAUDE.md` — leggi sezioni "DUE PAROLE D'ORDINE" §1+§2 + "Sprint T iter 38 close" (più recente)
3. **Tester-6 evidenza iter 37**: `automa/team-state/messages/tester6-iter37-phase3-completed.md` (4-way schema drift INTENT)
4. **Volumi PDF source narrativa LOCALI Mac Mini** (USA QUESTI):
   - `/Users/progettibelli/Projects/elab-tutor/dist-test/volumes/volume1.pdf` (27 MB Vol 1)
   - `/Users/progettibelli/Projects/elab-tutor/dist-test/volumes/volume2.pdf` (17 MB Vol 2)
   - `/Users/progettibelli/Projects/elab-tutor/dist-test/volumes/volume3.pdf` (18 MB Vol 3)
   - **Plus materiali Davide Tres Jolie originals**: `/Users/progettibelli/Desktop/ELABTUTOR/ELAB - TRES JOLIE/[1|2|3] ELAB VOLUME [UNO|DUE|TRE]/2 MANUALE VOLUME [1|2|3]/` (sorgente autorevole se PDF estratto è ambiguo)
   - **Estrazione testo**: `pdftotext -layout dist-test/volumes/volume1.pdf /tmp/vol1.txt` (poi vol2 + vol3)
   - **Alternative SE PDF non estraibili**: usa `src/data/volume-references.js` `bookText` field (94/94 entries VERBATIM enriched iter 37) — autosufficiente in-repo

## Goal critico — pilastro centrale

**Parità totale esperimenti virtuali ↔ narrativa libri di testo Davide Fagherazzi**.

I libri presentano gli esperimenti come **VARIAZIONI DI UN TEMA** (continuo narrativo cap-by-cap). ELAB Tutor li propone come **PEZZI STACCATI**. Questo fixa il flusso pedagogico tra:
- Modalità **Percorso** (sequenza guidata cap-by-cap, docente-first, classe legge a voce alta verbatim libro)
- Modalità **Passo Passo** (micro-step intra-esperimento)
- Modalità **Libero** (lavagna pulita PERSISTENTE — clearCircuit deve veramente lasciare zero residual)
- Modalità **Già Montato** (pre-built circuit visualizzato + UNLIM evidenzia componenti)

**Linguaggio MANDATORY**: plurale "Ragazzi," + docente-first ("Mostriamo ai ragazzi che...", "Ragazzi, osservate..."). Mai imperativo singolare ("fai", "clicca", "premi", "monta").

## Tools disponibili Mac Mini (NO marketplace MCP/skills)

**IMPORTANTE**: Mac Mini Claude install è BARE — NO MCP servers MacBook (no `mcp__plugin_playwright_*`, no `mcp__Control_Chrome__*`, no `mcp__plugin_claude-mem_*`), NO marketplace skills (no `ralph-loop`, `superpowers`, `impeccable`). Usa SOLO built-in:

- **Bash**: `npx playwright test path/to/spec.js` (browser test diretto via Playwright CLI v1.58.2 installed)
- **Bash**: `npx lighthouse <url> --output=json --output-path=...` (Lighthouse via npx)
- **Bash**: `pdftotext -layout dist-test/volumes/volume[123].pdf /tmp/vol[123].txt` (poppler installed)
- **Bash**: `curl https://www.elabtutor.school/...` (smoke test)
- **Bash**: `curl https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat -H "Authorization: Bearer ..."` (Edge Function smoke — Andrea env keys necessari)
- **Read + Write + Edit**: file lavoro lesson-paths/* + components/* + ADRs + audits
- **Agent tool** (built-in, `general-purpose` subagent_type): spawn parallel agents per Cycle 1 8-agent + Cycle 2 4-agent + Cycle 3 2-agent
- **Grep + Glob**: pattern search codebase

**Playwright spec pattern**: NON usare `mcp__plugin_playwright_*` (non disponibile). Crea `tests/e2e/sprint-u-cycle1-iter1-esp-{id}.spec.js` files + `npx playwright test tests/e2e/sprint-u-cycle1-iter1-*.spec.js --reporter=line --output=docs/audits/sprint-u-cycle1-iter1-screenshots/`.

**Ricovery context**: senza claude-mem MCP, recovery via filesystem `automa/state/heartbeat` + completion msgs `automa/team-state/messages/*-sprint-u-*.md` + audit doc `docs/audits/sprint-u-*.md` filesystem.

## Pattern Ralph Loop

```
RALPH ITERATION (1, 2, 3, ... ripeti finché Sprint U success criteria met):
  Cycle 1 (8 agents parallel — spawn via Agent tool background mode):
    Audit-1 (vol1+vol2 read-only audit matrix)
    Audit-2 (vol3 read-only audit matrix)
    LiveTest-1 (Playwright sweep vol1+vol2 prod UNO PER UNO)
    LiveTest-2 (Playwright sweep vol3 prod UNO PER UNO)
    UNLIMVerify (UNLIM Onnipotenza+Onniscenza per ogni esperimento)
    Persona (4 personas × 4 modalità × 5 random esperimenti = 80 scenarios)
    DesignCritique (impeccable audit + Lighthouse + palette violations)
    Scribe (per-cycle audit doc + handoff)

  WAIT 8/8 completion msgs filesystem barrier `automa/team-state/messages/{agent}-sprint-u-cycle{N}-iter{R}-completed.md`

  Cycle 2 (4 agents consolidation):
    Audit-merge + LiveTest-merge + UNLIMVerify-merge + Scribe-merge
  WAIT 4/4

  Cycle 3 (2 agents fix batch):
    Fix-orchestrator (lesson-path JSON fixes + linguaggio codemod + design overhaul + UNLIM enrichment + modalità 4 fixes)
    Verifier (re-run subset broken post-fix + vitest baseline + build verify)
  WAIT 2/2

  Cycle 4 (1 agent close):
    Close-orchestrator (audit final + handoff next ralph iter + commit + push origin + PR via gh CLI)
```

## Anti-inflation MANDATORY (NO COMPIACENZA)

1. **NO claim "fixed"** senza re-run live verify post-fix
2. **NO claim "94 esperimenti tutti funzionanti"** se broken count > 10 verified live
3. **NO claim "lavagna pulita"** senza clearCircuit test passed UNO PER UNO
4. **NO claim "parità 100%"** senza Audit-1+Audit-2 cross-verification
5. **NO --no-verify** mai (pre-commit + pre-push hooks NEVER bypassed)
6. **NO push main** — solo branch `mac-mini/sprint-u-cycle{N}-iter{R}-{ISO}-{slug}` + PR via `gh pr create --base main --head mac-mini/...`
7. **NO inventing APIs** — usa SOLO `__ELAB_API` documentato CLAUDE.md
8. **NO modifying engine files** (CircuitSolver.js + AVRBridge.js + PlacementEngine.js) senza marker `authorized-engine-change` esplicito
9. **NO ignoring user friction** — persona score < 6 → MANDATORY flag fix cycle next
10. **NO inventing numeri** — vitest count SEMPRE da `automa/baseline-tests.txt` o output reale

## Phase 0 entrance MANDATORY ogni cycle

Prima di spawnare 8 agents Cycle 1 ogni ralph iteration:

1. `cd /Users/progettibelli/Projects/elab-tutor` (o equivalent)
2. `git status --short` — verify branch clean
3. `git checkout -b mac-mini/sprint-u-cycle1-iter${RALPH_ITER}-${ISO}-94-esperimenti`
4. `cat automa/baseline-tests.txt` — record vitest baseline (pre-cycle)
5. `npx vitest run --reporter=basic 2>&1 | tail -5` — verify baseline GREEN entry gate
6. Verify Edge Functions ACTIVE: `SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2- | tr -d '"\047 ') && SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions list --project-ref euqpdueopmlllqjmqnyb | grep ACTIVE`
7. Verify Vercel HTTP 200: `curl -sI https://www.elabtutor.school | head -3`
8. Update `automa/state/heartbeat` con `Date + cycle + ralph_iter + status`
9. Run Phase 0 doc discovery sub-tasks PDR §3 (filesystem map 94 esperimenti + narrativa volumi PDF + modalità 4 + UNLIM)

## Cycle 1 8-agent spawn (parallel)

Spawn 8 agenti in parallelo via Agent tool background mode (single message multiple Agent calls). Ogni agent riceve brief self-contained con:

- Working dir + branch
- File ownership rigid (NO sovrapposizione)
- Atom assignments specifici (vedi PDR §2 tabella ruoli)
- Acceptance criteria
- §7.2 protocol gap mitigation: MANDATORY emit completion msg `automa/team-state/messages/{agent}-sprint-u-cycle1-iter${R}-completed.md`
- Anti-regression rules (vitest baseline NEVER scendere, NO --no-verify, NO push main)
- Tools required

Agent briefs per agent:

**Audit-1** (`feature-dev:code-architect` + `superpowers:systematic-debugging`):
- Read `src/data/lesson-paths/v1-*.json` + `v2-*.json` (38+27 = 65 file)
- Read `src/data/volume-references.js` for entries vol1+vol2
- Per ogni esperimento: validate JSON schema + check bookText VERBATIM + count components + count connections + score parity_narrative (variazioni-tema vs pezzi-staccati) + score linguaggio_plurale
- Output: `docs/audits/sprint-u-cycle1-iter${R}-audit-vol1-vol2.md` matrix 65 rows
- Completion msg

**Audit-2** (same skills): vol3 (29 file) + vol3 entries volume-references.js
- Output: `docs/audits/sprint-u-cycle1-iter${R}-audit-vol3.md`
- Completion msg

**LiveTest-1** (`playwright-mcp` + `Control_Chrome`):
- For ogni esperimento vol1+vol2 (65 esperimenti): run Playwright sequence per PDR §5.1 (mount + render + simulation + screenshot + UNLIM citation + UNLIM action + 4 modalità + clearCircuit cleanliness)
- Output: `docs/audits/sprint-u-cycle1-iter${R}-livetest-vol1-vol2.md` + `docs/audits/sprint-u-cycle1-iter${R}-screenshots/v[12]-*.png` (~260 PNG = 65 × 4 modalità)
- Completion msg con broken_count vol1+vol2

**LiveTest-2**: vol3 (29 esperimenti × 4 modalità = 116 PNG)

**UNLIMVerify** (`mcp__plugin_playwright_*` + curl):
- Per ogni esperimento: ask UNLIM "spiega esperimento" + verify response Vol/pag VERBATIM + plurale Ragazzi + ≤60 parole
- Ask UNLIM action "evidenzia componente" + "monta esperimento X" + "cattura screenshot" + verify intent dispatch
- Verify Onniscenza classifier categorizes prompts correctly (chit_chat vs deep_question vs citation_vol_pag vs plurale_ragazzi vs safety_warning)
- Output: `docs/audits/sprint-u-cycle1-iter${R}-unlim-matrix.md`
- Completion msg

**Persona** (`mcp__plugin_playwright_*`):
- Simulate 4 personas (P1 Maria primaria + P2 Giovanni secondaria + P3 Lucia esperta + P4 Marco sostituto)
- Per persona × 4 modalità × 5 random esperimenti = 80 scenarios totali
- Score user comprehensibility 0-10 (≥9 = fluido, 6-8 = friction, ≤5 = blocked)
- Output: `docs/audits/sprint-u-cycle1-iter${R}-persona-simulation.md` + screenshot evidence
- Completion msg

**DesignCritique** (`impeccable:design-critique` + `impeccable:audit` + Lighthouse):
- Run `npx lighthouse https://www.elabtutor.school/#chatbot-only --output=json --output-path=docs/audits/sprint-u-cycle1-iter${R}-lighthouse-chatbot.json` (a11y/perf/SEO/BP)
- Same for `#about-easter` modal route + main `/#tutor` route
- Audit `src/components/**` + `src/styles/**` for: palette hex hardcoded violations (Navy/Lime/Orange/Red CSS var enforcement), typography font<14px count, alignment issues, contrast WCAG AA (4.5:1 testo, 3:1 grafici), ordering hierarchy
- Run `/colorize` `/typeset` `/arrange` `/normalize` `/polish` `/audit` `/harden` impeccable critique passes
- Output: `docs/audits/sprint-u-cycle1-iter${R}-design-critique.md` + Lighthouse JSON + design recommendations
- Completion msg

**Scribe** (`general-purpose`):
- Read tutte le 7 audit matrix shipped da altri agenti
- Consolidate findings into `docs/audits/sprint-u-cycle1-iter${R}-CONSOLIDATED-audit.md`
- Update `docs/handoff/sprint-u-cycle{N+1}-iter{R}-handoff.md`
- Update CLAUDE.md sezione Sprint U cycle close
- Update `docs/unlim-wiki/log.md` se nuovi concept generati
- Completion msg

## Cycle 2 4-agent consolidation (post 8/8 barrier)

Quando 8 completion msgs filesystem barrier presenti, spawn 4 consolidation agents:

- **Audit-merge**: merge Audit-1 + Audit-2 in unified audit matrix 94 esperimenti
- **LiveTest-merge**: merge LiveTest-1 + LiveTest-2 in unified live test matrix
- **UNLIMVerify-merge**: cross-reference UNLIMVerify findings con Audit + LiveTest
- **Scribe-merge**: write consolidated audit + handoff cycle 2

## Cycle 3 2-agent fix batch

Quando 4/4 completion msgs cycle 2:

- **Fix-orchestrator** (`feature-dev:code-architect` + `backend-development:backend-architect`):
  - Apply Phase 4 Cat A-F fixes per PDR §7
  - File ownership: `src/data/lesson-paths/**` + `src/data/volume-references.js` + `src/components/**` + `supabase/functions/_shared/system-prompt.ts` (system prompt few-shot expand)
  - Commit changes batch atomic per category
  - Completion msg con files modified + LOC delta

- **Verifier** (`agent-teams:team-debugger` + `superpowers:verification-before-completion`):
  - Re-run subset of broken esperimenti (top 20 broken da audit) post-fix
  - Run vitest full → verify baseline preservato (NO regression)
  - Run build → verify PASS pre-deploy
  - Output: `docs/audits/sprint-u-cycle3-iter${R}-fix-verifier.md`
  - Completion msg

## Cycle 4 1-agent close

Quando 2/2 completion msgs cycle 3:

- **Close-orchestrator**:
  - Score 94 esperimenti broken count finale (re-run live test subset)
  - Verify Sprint U success criteria PDR §14 (12 conditional ALL)
  - If ≥10/12 met → commit close + push origin + `gh pr create --base main --head mac-mini/sprint-u-cycle1-iter${R}-... --title "feat(sprint-u-iter${R}): 94 esperimenti audit + fixes ralph cycle ${R}" --body-file docs/handoff/sprint-u-cycle{4}-iter{R}-handoff.md`
  - Else → handoff next ralph iteration con remaining broken/fix items + score progression
  - Update `automa/state/heartbeat` con cycle close timestamp + score
  - Update CLAUDE.md sezione Sprint U cycle close
  - Repeat ralph iteration if Sprint U success criteria NOT met

## Heartbeat + monitoring

Every 30 min update:
- `automa/state/heartbeat` con `<ISO> sprint-u cycle{N} iter{R} <status>`
- `automa/team-state/messages/macmini-orchestrator-sprint-u-iter${R}-status.md` con: ralph_iteration + cycle_active + agents_running + completion_msgs_received + estimated_time_to_next_phase

If SSH disconnect or Mac Mini reboot: resume da last heartbeat + completion msgs filesystem.

## Ralph Loop manuale built-in Claude Code (NO cron, NO ralph-loop skill)

**Mac Mini Claude install è BARE — skill marketplace NON disponibile** (no `ralph-loop:ralph-loop`, no `superpowers:*`, no `impeccable:*`, no MCP servers MacBook). Usa SOLO built-in Claude Code: Bash + Edit + Read + Write + Agent tool (general-purpose subagent spawning).

**Pattern corretto Sprint U Mac Mini**: single long-running Claude session con manual loop self-recursion.

### Avvio sessione Claude Mac Mini

Andrea SSH terminale Mac Mini (NON background — interactive):
```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59
# poi su Mac Mini:
cd ~/Projects/elab-sprint-u-cycle1-iter1  # worktree creato Phase 0a
claude
# poi paste activation prompt complete (questo blocco) come PRIMO messaggio
```

### Manual ralph loop pattern (Claude session-internal)

Tu (Claude Mac Mini agent) esegui manual loop:

1. **Inizio iteration**: leggi heartbeat last entry per recovery context (`tail -1 automa/state/heartbeat`)
2. **Esegui Cycle 1** (8 agents Agent tool spawn parallel, single message multiple Agent calls)
3. **Wait 8/8 completion msgs** filesystem barrier (poll loop with Bash `until ls automa/team-state/messages/{audit1,audit2,livetest1,livetest2,unlimverify,persona,designcritique,scribe}-sprint-u-cycle1-iter${R}-completed.md 2>/dev/null | wc -l | grep -q 8; do sleep 60; done`)
4. **Esegui Cycle 2** (4 agents consolidation)
5. **Wait 4/4** completion barrier
6. **Esegui Cycle 3** (2 agents fix + verify)
7. **Wait 2/2** completion barrier
8. **Esegui Cycle 4** (1 agent close)
9. **Stop condition check**:
   - File `/tmp/elab-sprint-u-stop` esiste? → STOP
   - Andrea ha touched `/tmp/elab-sprint-u-stop`? → STOP
   - Sprint U success criteria 12/12 met (PDR §14)? → STOP CLOSE
   - Iter count > 5 (safety cap)? → STOP
   - Else → goto step 1 (next ralph iteration, R++)

**No slash command needed** — pure Bash/Agent tool orchestration.

### Stop signal

Andrea SSH:
```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'touch /tmp/elab-sprint-u-stop'
```

### Recovery post-disconnect (Anthropic org limit hit OR session crash)

1. Heartbeat `automa/state/heartbeat` last entry indica `ralph_iter + cycle + status`
2. Andrea relaunch Claude Mac Mini + paste stessa activation prompt + aggiungere "RESUME ralph iter X cycle Y from heartbeat"
3. Tu (Claude Mac Mini) read heartbeat + completion msgs filesystem → resume da last successful step

### Coesistenza cron iter36 user-sim curriculum LIVE

- Cron iter36 (8 entries crontab `*/5 + */30 + 0 */2 + */15 + */6 ...`) GIRA SU worktree main `~/Projects/elab-tutor/` branch `mac-mini/iter36-user-sim-*`
- Sprint U ralph loop GIRA SU worktree isolato `~/Projects/elab-sprint-u-cycle1-iter1/` branch `mac-mini/sprint-u-cycle1-iter1-*`
- ZERO interference (rigid file ownership branch + worktree)
- Plus: 10 scheduled-tasks Mac Mini (`elab-{auditor,auditor-v2,builder,coordinator,researcher,researcher-v2,scout,strategist,tester,worker}`) preservati intatti

## SUCCESS CRITERIA Sprint U close 9.5/10 ONESTO (G45 mandate)

ALL 12 conditional must be met:

1. ✅ 94 esperimenti broken count ≤10 (irrecuperabili explicit reason documented per ognuno)
2. ✅ Parity narrative score avg ≥8/10 (variazioni-tema cap-by-cap dove libro lo richiede)
3. ✅ UNLIM Vol/pag VERBATIM citation rate ≥95% live verified
4. ✅ UNLIM action dispatch ≥90% live verified
5. ✅ Modalità 4 (Percorso/Passo Passo/Libero/Già Montato) tutte funzionanti per 94 esperimenti
6. ✅ Modalità Libero clearCircuit lascia lavagna VERAMENTE pulita (zero residual)
7. ✅ Linguaggio codemod 200+ violations applied (Andrea iter 21+ mandate carryover closed)
8. ✅ Lighthouse perf ≥90 + a11y ≥95 + SEO ≥100 (carryover iter 38 A6)
9. ✅ Persona simulation 4 personas × 4 modalità × 5 esperimenti = 80 scenarios avg comprehensibility ≥8/10
10. ✅ vitest 13474+ baseline preservato
11. ✅ Build PASS
12. ✅ Opus-indipendente review G45 mandate

**NO inflation. NO compiacenza. NO claim senza live evidence Playwright + Control Chrome.**

## Andrea decision points

Mac Mini agent NON deve attendere Andrea per le seguenti decisioni — procede autonomously:
- Spawn cycles 1-4
- Apply fixes Phase 4 Cat A+B+D+E+F
- Commit + push + PR creation

Mac Mini agent DEVE attendere Andrea ratify per:
- Modifying critical engine files (CircuitSolver/AVRBridge/PlacementEngine — only with explicit `authorized-engine-change` marker)
- Vercel deploy `npm run build && npx vercel --prod --yes`
- Edge Function deploy `supabase functions deploy unlim-chat`
- Apply migrations `supabase db push --linked`
- D1+D2+D3+D4 ratify queue iter 38 carryover (ADR-025+026+027 + Tea Glossario)
- ENABLE_INTENT_JSON_SCHEMA env flag activation (ADR-030 canary 5%)
- ENABLE_VOXTRAL_STT env flag activation (ADR-031)

## Cross-link

- **PDR master**: `/Users/progettibelli/Projects/elab-tutor/docs/plans/PDR-SPRINT-U-PARITA-NARRATIVA-94-ESPERIMENTI-RALPH-LOOP.md`
- **Iter 38 audit**: `/Users/progettibelli/Projects/elab-tutor/docs/audits/2026-05-01-iter-38-PHASE3-CLOSE-audit.md`
- **Iter 39 handoff**: `/Users/progettibelli/Projects/elab-tutor/docs/handoff/2026-05-01-iter-38-to-iter-39-handoff.md`
- **CLAUDE.md context**: `/Users/progettibelli/Projects/elab-tutor/CLAUDE.md`
- **Tester-6 4-way schema drift evidence**: `/Users/progettibelli/Projects/elab-tutor/automa/team-state/messages/tester6-iter37-phase3-completed.md`
- **3 NEW ADR iter 38**: `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` + `ADR-031-stt-migration-voxtral-transcribe-2.md` + `ADR-028-onnipotenza-intent-dispatcher-server-side.md` (§14.b amend)

## VAI

Inizia Phase 0 entrance Cycle 1 Iter 1 Sprint U adesso. Procedi autonomously H24 finché Sprint U success criteria met o Andrea ferma esplicitamente.

═══════════════════════════════════════════════════════════════════

## Note Andrea (post-paste)

- **Branch monitoring**: `gh pr list --search "head:mac-mini/sprint-u" --json number,title,createdAt` per vedere PR aperti
- **Heartbeat check**: `tail automa/state/heartbeat` periodicamente
- **Logs**: `ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'tail -50 ~/elab-builder/logs/sprint-u-ralph-*.log'`
- **Stop ralph loop**: ssh + create file `/tmp/elab-sprint-u-stop` (Mac Mini agent rispetta interruzione)
- **Review**: ogni mattina rivedi PR aperti `gh pr view <num>` + screenshots `docs/audits/sprint-u-cycle*-screenshots/`

**Tempo stimato Sprint U close**: 2-3 ralph iterations × 25-35h ognuna = ~60-100h Mac Mini autonomous H24 (~3-5 giorni cont.).

**Se Mac Mini hits org limit**: ralph loop pausa fino a reset mensile. Heartbeat lo segnala. Andrea monitora logs.
