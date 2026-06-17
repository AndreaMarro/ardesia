# PROMPT SETUP FONDAZIONI CLI — INCOLLA IN TUA CLI CLAUDE

**Data**: 2026-04-21 (domenica sera sett 1 prep)
**Durata stimata**: 6-8h autonomo
**Team orchestrati**: 6 agenti Opus peer (NO general-purpose subagent)
**Bypass attivo**: SÌ (defaultMode in settings.local.json)
**Credenziali disponibili**: GitHub PAT + Together AI + Supabase Access Token + Vercel login

---

## INCOLLA DA QUI ⬇️

Sono Andrea Marro. Fondazioni infra autonomia CLI per PDR Ambizioso 8 settimane. Credenziali tutte in zshrc (GITHUB_TOKEN, TOGETHER_API_KEY, SUPABASE_ACCESS_TOKEN). Vercel login OK.

## ⚠️ REGOLA SUPREMA — ZERO REGRESSIONE TOLLERATA

**Nessun commit, push, merge, deploy procede se qualsiasi metrica scende vs baseline pre-change.**

### Baseline snapshot pre-change (OBBLIGATORIO prima ogni task)

```bash
# Ogni task inizio salva baseline in /tmp/baseline-$(date +%s).json
cat > /tmp/baseline-start.json <<EOF
{
  "test_count": $(npx vitest run --reporter=dot 2>&1 | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+'),
  "build_pass": "$(npm run build > /dev/null 2>&1 && echo OK || echo FAIL)",
  "build_time_sec": "[tempo]",
  "bundle_kb": $(du -sk dist/ | awk '{print $1}'),
  "pz_v3_violations": $(grep -rcE 'Docente,?\s*leggi|Insegnante,?\s*leggi' supabase/functions/_shared/ 2>/dev/null || echo 0),
  "git_sha": "$(git rev-parse HEAD)",
  "timestamp": "$(date -Iseconds)"
}
EOF
```

### Gate hard 5 fasi — CLI deve passare TUTTI o STOP

#### GATE-1 PRE-COMMIT
Prima di ogni `git commit`:
```bash
TESTS_NOW=$(npx vitest run --reporter=dot 2>&1 | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+')
TESTS_BASE=$(jq -r .test_count /tmp/baseline-start.json)
[ "$TESTS_NOW" -ge "$TESTS_BASE" ] || { echo "REGRESSIONE TEST $TESTS_NOW < $TESTS_BASE — ABORT COMMIT"; exit 1; }
npm run build > /dev/null || { echo "BUILD FAIL — ABORT COMMIT"; exit 1; }
```

#### GATE-2 PRE-PUSH (CoV 3x vitest)
Prima di ogni `git push`:
```bash
for i in 1 2 3; do
  RUN=$(npx vitest run --reporter=dot 2>&1 | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+')
  echo "CoV run $i: $RUN"
  [ "$RUN" -ge "$TESTS_BASE" ] || { echo "CoV FAIL run $i — ABORT PUSH"; exit 1; }
done
```

#### GATE-3 PRE-MERGE (CI green + E2E smoke)
Prima di `gh pr merge`:
```bash
gh pr checks $PR_NUMBER --watch --fail-fast || { echo "CI FAIL — ABORT MERGE"; exit 1; }
BASE_URL=https://preview-url npx playwright test tests/e2e/0{1,2,3,5,12}*.spec.js || { echo "E2E SMOKE FAIL — ABORT MERGE"; exit 1; }
```

#### GATE-4 PRE-DEPLOY PROD (bundle + lighthouse)
Prima di `vercel --prod`:
```bash
BUNDLE_NOW=$(du -sk dist/ | awk '{print $1}')
BUNDLE_BASE=$(jq -r .bundle_kb /tmp/baseline-start.json)
DELTA_PCT=$(( (BUNDLE_NOW - BUNDLE_BASE) * 100 / BUNDLE_BASE ))
[ "$DELTA_PCT" -le 10 ] || { echo "BUNDLE REGRESSIONE +$DELTA_PCT% — ABORT DEPLOY"; exit 1; }
# Lighthouse via Chrome MCP opzionale se disponibile
```

#### GATE-5 POST-DEPLOY (live verify + Sentry)
Dopo `vercel --prod`:
```bash
sleep 60  # attendi propagation
curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school/ | grep -q 200 || { echo "PROD DOWN — ROLLBACK"; bash scripts/cli-autonomous/rollback.sh; exit 1; }
# Sentry last 10 min errors
ERRORS_10MIN=$(# query Sentry MCP search_events last 10 min)
[ "$ERRORS_10MIN" -le 5 ] || { echo "SENTRY ERROR SPIKE $ERRORS_10MIN — ROLLBACK"; bash scripts/cli-autonomous/rollback.sh; exit 1; }
PZ_VIOL=$(# curl Edge Function + grep Docente leggi)
[ "$PZ_VIOL" -eq 0 ] || { echo "PRINCIPIO ZERO V3 VIOLATO PROD — ROLLBACK"; bash scripts/cli-autonomous/rollback.sh; exit 1; }
```

### Script `scripts/cli-autonomous/no-regression-guard.sh` (DEV STEP 2 deve crearlo)

Wrapper singolo chiamabile da CLI prima di ogni azione destructive:
```bash
bash scripts/cli-autonomous/no-regression-guard.sh [commit|push|merge|deploy|post-deploy]
```
Exit 0 = via libera, Exit 1 = ABORT + log dettaglio.

## REGOLE FERREE NON NEGOZIABILI

0. **MAI FERMARSI. MAI CHIEDERE CONFERMA. MAI ASPETTARE ANDREA**. Vai avanti sempre. Decisione ambigua = scegli opzione safer + documenta + continua. Errore = retry 3 volte + log + continua con task successivo. Context full = auto-compact + continua. Quota rate limit = sleep 60s + retry. STOP solo se: (a) fine sett 1 gate PASS, (b) blocker hard strutturale dopo 5 retry fail, (c) quota Opus Max totalmente esaurita con 429 persistente.

1. **NO STOP fino a fine STEP 7 (loop days)**. Esegui tutti step + LOOP giorni successivi senza fermarti. Non chiedere conferma Andrea. Decisione ambigua → scegli opzione più conservativa (no regressione) + documenta scelta + continua.

2. **VERIFICA SEMPRE TUTTO**. Dopo ogni agent dispatch → verifica output reale:
   - Leggi file creato (Read tool)
   - Conta righe (wc -l)
   - Verifica exit code comandi (echo $?)
   - Grep pattern expected in file
   - NO "fatto" senza evidence file

3. **NO SCONTATO**. Ogni claim dev'essere provato:
   - "Playwright installato" → `ls node_modules/@playwright/test/package.json`
   - "Script funziona" → `bash scripts/<name>.sh --dry-run && echo OK`
   - "Test pass" → `npx vitest run --reporter=dot | tail -3` con PASS count
   - "Build PASS" → `npm run build && echo BUILD_OK`
   - "Commit done" → `git log --oneline -1`
   - "Push OK" → `git rev-list origin/<branch>..HEAD | wc -l == 0`
   - "CI pass" → `gh run list --limit 1 --json conclusion -q '.[0].conclusion' == success`
   - "Deploy OK" → `curl -s -o /dev/null -w "%{http_code}" <url> == 200`
   - "PZ v3 intact" → `grep -rE 'Docente,?\s*leggi|Insegnante,?\s*leggi' supabase/functions/_shared/ | wc -l == 0`
   - "MCP usato" → log chiamate MCP nel report

4. **SELF-HEAL loop**. Se agent step FAIL (esempio test regression):
   - Dispatch team-dev fix immediate (max 3 retry)
   - Re-verify post fix
   - Se 3 retry FAIL → auditor determina severity:
     * CRITICO (regressione test) → STOP + handoff blocker
     * NON CRITICO (caveat accettabile) → continua + documenta

5. **OUTPUT EVIDENCE PATH SEMPRE**. Ogni step output referenzia file path reale generato. Zero "ho fatto X" senza path.

6. **MCP CONNECTORS MANDATORY** — usa LIVE durante esecuzione, no skip:
   - `mcp__plugin_playwright_playwright__browser_*` per E2E live test prod (elabtutor.school)
   - `mcp__Claude_Preview__preview_*` per dev server verify (npm run dev + navigate + snapshot + screenshot)
   - `mcp__Control_Chrome__*` per controllo Chrome reale (navigate, execute_javascript, get_page_content) — verify UI prod live
   - `mcp__supabase__*` per Edge Function deploy + logs + SQL execute
   - `mcp__57ae1081-*__*` Vercel MCP per deploy + runtime logs
   - `mcp__plugin_serena_serena__*` per find_symbol + search pattern codebase
   - `mcp__plugin_claude-mem_mcp-search__*` per search history + save observations
   - `mcp__plugin_context7_context7__query-docs` per docs aggiornate librerie (Playwright, Vercel, Supabase, React 19)
   - `mcp__792083c5-*__*` Sentry per error monitoring post-deploy
   
   Ogni step DEVE usare almeno 2 MCP diversi. Log MCP calls fatte in report finale.

7. **CI AUTO-WATCH** dopo ogni push: `gh run watch --exit-status` blocking. Se fail → leggi log + auto-fix + re-push + watch. Max 3 retry.

8. **DEPLOY LIVE REAL** non solo scaffold: ogni day end = deploy preview vercel REALE + curl 200 verify + screenshot Playwright/Chrome snapshot.

9. **TASK BOARD AUTO-UPDATE** automa/team-state/tasks-board.json ogni task done/blocked in real-time via TPM dispatch.

10. **CLAUDE-MEM SAVE** ogni decisione architetturale importante + ogni commit + ogni blocker, per context recovery cross-session.

11. **IPERPROFESSIONALE — standard non negoziabili**:
    - Commit atomici (1 responsabilità per commit), message format `tipo(area): descrizione` + body che spiega WHY + HOW + evidence path
    - Co-Authored-By: Claude Opus 4.7 obbligatorio ogni commit
    - Test coverage minima 80% per codice nuovo (no shortcut, no skip)
    - Doc inline: JSDoc/TSDoc in funzioni pubbliche, README per ogni modulo, ADR per scelte architetturali
    - Naming esplicito (no x/tmp/foo — usa descriptive names)
    - Error handling esplicito: try/catch con log structured, MAI silent failure
    - Logging structured JSON in operazioni critiche (deploy, auth, DB writes)
    - Zero TODO/FIXME senza issue tracker reference
    - Zero `console.log` residui in prod code (usa logger)
    - Zero `any` in TypeScript nuovo
    - Ogni PR body include: goal + evidence + test plan + rollback plan + risks + screenshots

12. **AUTOCRITICA OBBLIGATORIA ogni step**:
    - Ogni team agent output DEVE includere sezione `## COSA NON FUNZIONA / GAP / DEBITO TECNICO`
    - Enumera almeno 3 gap onesti (anche piccoli)
    - TPM aggrega auto-critique cumulative in `docs/audit/autocritica-YYYY-MM-DD.md`
    - AUDITOR finale ri-verifica autocritica reale vs claim (detect inflation, flag omissioni)
    - Se agent omette autocritica → AUDITOR lo segnala come red flag major

13. **STOP INFLATION NUMERICHE — zero tolleranza**:
    - Mai citare numeri senza comando eseguito <30s prima
    - "12116 test" = output fresco `npx vitest run --reporter=dot | tail -3`
    - "Build PASS" = exit code 0 verified + tempo reale
    - "PZ v3 OK" = `grep -c 'Docente,\\s*leggi' ...` zero match
    - "Deploy OK" = `curl -w "%{http_code}"` = 200
    - "Score X/10" = `cat automa/state/benchmark.json`
    - "PASS 18/20" = log verify-llm-switch output reale
    - Qualsiasi claim senza command+output = AUDITOR REJECT

14. **PARANOID LIVE VERIFY post-merge + post-deploy**:
    - Ogni merge main + deploy prod → `test-on-deployed.sh` end-to-end live
    - User journey completo: homepage → simulator → UNLIM chat → PZ v3 verify → cross-session memory test
    - Screenshot documented in `docs/evidence/sett-N/day-NN/`
    - Chrome MCP snapshot UI + Playwright trace
    - Sentry error rate check last 10 min post-deploy
    - Nessun "spero funzioni" → sempre "VERIFICATO con [command + stdout output]"

15. **ANTI-REGRESSIONE HARD GATE**:
    - Test count POST-change >= test count PRE-change (ALWAYS)
    - Build time regression >30% → investiga prima continue
    - Bundle size regression >10% → investiga prima continue
    - Lighthouse performance regression >10 punti → investiga prima continue
    - Zero Sentry new errors post-deploy → altrimenti rollback auto

16. **HANDOFF FINALE stile audit firm**:
    - Max 3000 parole onesto
    - Sezioni obbligatorie: Executive Summary, Evidence Inventory, Risks Identified, Debt Residual, Recommendations, Next Actions
    - Zero language marketing ("rivoluzionario", "completo", "perfetto")
    - Linguaggio clinico audit (Deloitte/PwC style)
    - Score finale 0-10 con giustificazione quantitativa ogni punto

OBIETTIVO: costruire infra CLI autonomia totale (1 settimana PDR alla volta con testing esaustivo + doc rigorosa + onestà brutale) SENZA uscire dal paradigma TEAM ORCHESTRATI (6 agenti peer: team-tpm, team-architect, team-dev, team-tester, team-reviewer, team-auditor). NO general-purpose subagent.

ORDINE DISPATCH (sequenziale con sync check tra step, NO STOP fino STEP 6):

## STEP 0 — RECUPERO CONTESTO + ANALISI CONFLITTI (30 min, Andrea stesso CLI, NO dispatch)

Andrea CLI esegue direttamente (senza dispatch) per capire dove siamo e cosa NON ri-fare:

### 0.1 — Stato git completo

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git branch --show-current
git status --short | head -30
git log --oneline -15
git rev-list origin/feature/pdr-ambizioso-8-settimane..HEAD | wc -l  # commits non pushati (atteso 0)
git rev-list HEAD..origin/feature/pdr-ambizioso-8-settimane | wc -l  # commits remote non locali
git worktree list
git stash list
```

**Evidence obbligatorio**: salva output in scratch mentale + segnala anomalie.

### 0.2 — Commit day 01 gia fatti (NON RI-FARE)

Verifica presenza commits:
```bash
git log --oneline --grep="T1-001\|T1-002\|T1-009" | head -10
```

Commits attesi (dovrebbero esserci):
- `1c753c3` fix(lavagna): T1-001 stable toggleDrawing ref pattern
- `4d512b7` fix(lavagna): T1-002 whiteboard persistenza sandbox
- `129f37c` feat(governance): T1-009 Tea autoflow + Day 01 audit

Se presenti → NON fare nuovi fix per T1-001/002/009. Solo extend edge case T1-002 (penna toggle recall) se rilevante.

### 0.3 — Worktree T1-011 cross-session memory (LOCKED, NO TOCCARE)

Worktree isolato separato:
```bash
git worktree list | grep worktree-agent-a985cce2
```

Branch `worktree-agent-a985cce2` commit `008de97` = T1-011 UNLIM cross-session memory (9 file, +908 line, +25 test, migration Supabase applied remote).

**ATTENZIONE**: questo worktree contiene lavoro non mergiato in feature branch. NON cherry-pickare da solo. Segnala in handoff finale "T1-011 merge pending" con nota conflitto probabile su `supabaseSync.js` + `unlimMemory.js` (toccati T1-002 fix?).

### 0.4 — Handoff + state recovery

```bash
ls -lt docs/handoff/ | head -5
cat docs/handoff/2026-04-20-prep-day-end.md | head -30  # prep day sabato
cat docs/handoff/2026-04-21-*.md 2>/dev/null | head -40  # day 01 se esiste
cat automa/state/claude-progress.txt 2>/dev/null | head -20
cat automa/team-state/tasks-board.json | head -60
cat automa/team-state/daily-standup.md | head -40
cat automa/team-state/blockers.md 2>/dev/null
```

### 0.5 — Audit recenti

```bash
ls -lt docs/audits/ 2>/dev/null | head -5
ls -lt docs/audit/ 2>/dev/null | head -5
cat docs/audits/2026-04-20-live-verify.md 2>/dev/null | head -30  # audit sabato prep
```

### 0.6 — Working tree dirty (carry-over pre-esistente)

```bash
git status --short | wc -l  # conta M/D/? files
git status --short | grep -E "supabaseSync|unlimMemory|unlim-chat|LavagnaShell|WhiteboardOverlay|DrawingOverlay" | head -10
```

**Se molti M file pre-esistenti (60+)**: ignora, carry-over prep day noto. NON toccare.

**Se M file su supabaseSync.js / unlimMemory.js**: ALERT potenziale conflict T1-011 worktree. Documenta.

### 0.7 — PDR cosa fare oggi

```bash
cat docs/pdr-ambizioso/giorni/PDR_GIORNO_01_LUN_21APR.md | head -80  # day 01 già eseguito
cat docs/pdr-ambizioso/giorni/PDR_GIORNO_02_MAR_22APR.md | head -80  # day 02 domani
```

Day 01 era: setup harness + T1-001/002/009 — **GIÀ FATTO**.
Day 02 domani: inizia testing + prosecuzione bug T1. FONDAZIONI autonomia che costruiamo OGGI (sera 21/04) sbloccano day 02 autonomo.

### 0.8 — Credenziali disponibili

```bash
gh auth status | head -5          # GitHub
echo $TOGETHER_API_KEY | head -c 20 && echo "..."  # Together (non echo full)
echo $SUPABASE_ACCESS_TOKEN | head -c 10 && echo "..."  # Supabase
npx vercel whoami 2>&1 | tail -2  # Vercel login
```

Se qualsiasi MISSING → NON iniziare dispatch, segnala Andrea.

### 0.9 — CI status

```bash
gh run list --branch feature/pdr-ambizioso-8-settimane --limit 3
```

Ultimo run success atteso. Se FAIL → leggi log prima di procedere.

### 0.10 — Piano evitare conflitti (OUTPUT STEP 0)

Scrivi file `automa/state/step-0-context-analysis.md` con:

```markdown
# STEP 0 Context Analysis — 2026-04-21 sera
## Git state
- Branch: feature/pdr-ambizioso-8-settimane
- Commits local: [last 15]
- Unpushed: [count]
- Worktrees: [list]
- Dirty M files: [count]
## Day 01 completato (NON RI-FARE)
- T1-001: [hash] ✅
- T1-002: [hash] ✅
- T1-009: [hash] ✅
## Worktree pending
- T1-011 cross-session memory: branch worktree-agent-a985cce2 commit 008de97, NON touched, merge pending
## Conflict risks
- supabaseSync.js: [modificato? da chi?]
- unlimMemory.js: [stesso check]
## Credenziali
- GitHub: ✅
- Together: ✅
- Supabase: ✅
- Vercel: ✅
## CI last run
- Status: [success/fail]
## Gate procedere STEP 1
- [ ] Nessun commit unpushato
- [ ] CI last run success
- [ ] Working tree gestibile (no M su file scope fondazioni)
- [ ] Credenziali tutti OK
→ Se TUTTI ✅ procedi STEP 1. Se qualsiasi ❌ → stop + handoff blocker.
```

Se tutti check passano → procedi STEP 1.
Se qualsiasi fallisce → STOP immediato + crea `automa/state/BLOCKER.md` con dettaglio + handoff.

## STEP 1 — ARCHITECT blueprint fondazioni (1.5h)

Dispatch:
Agent({ subagent_type: "team-architect",
  prompt: "Blueprint infra autonomia CLI per PDR 8 settimane. Leggi prima: CLAUDE.md + docs/pdr-ambizioso/PDR_GENERALE.md + PDR_SETT_1_STABILIZE.md → PDR_SETT_8_RELEASE.md (8 file) + MULTI_AGENT_ORCHESTRATION.md + HARNESS_DESIGN.md + AUDIT_FINALE_PDR.md + .claude/agents/team-*.md + .claude/settings.local.json + automa/team-state/*. Produci docs/architectures/cli-autonomous-foundations.md con: 1) overview paradigma 6 team peer 2) daily loop architettura 3) weekly gate DoD 13 check hard 4) escalation blocker 5) state recovery cross-session 6) deploy strategy (preview daily + prod weekly gate) 7) testing pyramid (unit vitest + integration + E2E Playwright + smoke + regression) 8) documentation rigorosa (handoff + evidence + ADR + CHANGELOG) 9) Gemini→Together switch plan sett 3 10) MCP usage map (Supabase, Playwright, Vercel, Serena, claude-mem, context7, Claude_Preview). Include diagramma mermaid flow daily + weekly. 5 edge cases enumerati + mitigation. 10 rischi tecnici + mitigation. ADR docs/decisions/ADR-001-cli-autonomous-paradigm.md. NO codice, solo blueprint. Max 800 righe." })

## STEP 2 — DEV implementa script autonomia (3h)

Attendi Architect done, poi dispatch:
Agent({ subagent_type: "team-dev",
  prompt: "Implementa infra autonomia da blueprint docs/architectures/cli-autonomous-foundations.md. TDD strict RED-GREEN-REFACTOR. File:

A) Script shell in scripts/cli-autonomous/ (bash, chmod 755):
- daily-preflight.sh (git status + pull + vitest baseline + handoff latest + output JSON ready)
- daily-audit.sh (vitest + build + PZ v3 grep + output docs/audit/daily-YYYY-MM-DD.md)
- push-safe.sh (git push + sleep 10 + gh run watch + exit code)
- deploy-preview.sh (npm run build + npx vercel --target=preview --yes + parse URL + curl 200 verify + log docs/deploy/preview-YYYY-MM-DD.md)
- deploy-prod.sh (require automa/state/APPROVE-DEPLOY-PROD.txt + build + vercel --prod + curl 200 + deploy Edge Function if SUPABASE_ACCESS_TOKEN + log)
- end-week-gate.sh (13 check hard DoD: task done + git synced + CI success + vitest delta + build + deploy preview + PZ v3 prod + E2E smoke + benchmark delta + handoff + zero blocker. Exit 1 se qualsiasi FAIL)
- end-day-handoff.sh (genera docs/handoff/YYYY-MM-DD-end-day.md template precompilato)
- state-update.sh (aggiorna automa/state/claude-progress.txt)

B) Playwright scaffold:
- npm install --save-dev @playwright/test (SOLO questa dep approvata)
- npx playwright install chromium firefox webkit
- tests/e2e/playwright.config.js (5 browser profiles, baseURL https://www.elabtutor.school, retries 2, screenshot on failure)
- tests/e2e/fixtures.js (mock student_uuid, class_key DEMO-2026)
- 20 spec E2E (ognuno self-contained): 01-homepage, 02-simulator-open, 03-lavagna-persist (T1-002), 04-lavagna-stale-closure (T1-001), 05-unlim-principio-zero-v3, 06-unlim-chat-basic, 07-unlim-rag-injection, 08-voice-wake-word, 09-vision-screenshot, 10-dashboard-teacher, 11-offline-pwa, 12-deploy-prod-verify, 13-pz-v3-watchdog (5 scenari), 14-lavagna-nuovo-esperimento, 15-unlim-cross-session-memory, 16-scratch-blockly, 17-compile-hex, 18-simulator-circuit-solve, 19-accessibility-wcag, 20-benchmark-score

C) Package.json scripts (SOLO scripts, NO dep changes):
- test:e2e, test:e2e:smoke, test:integration, test:all

D) Vitest integration tests in tests/integration/:
- edge-function-principio-zero.test.js (curl Edge Function + assert PZ v3)
- supabase-rls.test.js (verify RLS lesson_contexts via mcp_supabase)
- deploy-smoke.test.js (post-deploy curl health)

VINCOLI: zero npm dep nuova SALVO @playwright/test. Zero regressione 12103 vitest. File critici lockati NON toccare (CircuitSolver, AVRBridge, api.js, simulator-api.js, vite.config.js, package.json deps). Commit atomici [FOUNDATIONS-<scope>]. Co-author Claude Opus 4.7." })

## STEP 2.5 — SWITCH GEMINI → TOGETHER AI con rollback sicuro (2h)

Attendi DEV done STEP 2, prima TESTER STEP 3, dispatch ARCHITECT + DEV in sequenza:

### 2.5.1 — ARCHITECT blueprint switch

Agent({ subagent_type: "team-architect",
  prompt: "Blueprint switch Gemini → Together AI in 5 Edge Function Nanobot. Leggi prima:
- supabase/functions/_shared/system-prompt.ts
- supabase/functions/_shared/ (tutti file)
- supabase/functions/unlim-chat/index.ts
- supabase/functions/unlim-diagnose/index.ts
- supabase/functions/unlim-hints/index.ts
- supabase/functions/unlim-tts/index.ts
- supabase/functions/unlim-gdpr/index.ts
- automa/state/step-0-context-analysis.md

Produci docs/architectures/gemini-to-together-switch.md:
1. Stato attuale (routing 70/25/5 Flash-Lite/Flash/Pro, API endpoints, env vars)
2. Target stato Together AI (Llama 3.3 70B principale + Qwen 72B fallback per italiano-quality)
3. Mapping modelli: Gemini Flash-Lite → Llama 3.3 70B Turbo (fast), Gemini Flash → Llama 3.3 70B standard, Gemini Pro → Qwen 2.5 72B (complex)
4. Env vars switch:
   - RIMUOVI: GEMINI_API_KEY (preserve come fallback ENV var)
   - AGGIUNGI: TOGETHER_API_KEY (già in Supabase secrets target)
   - NUOVO: LLM_PROVIDER=together (default), gemini (fallback)
5. Interface unified: crea supabase/functions/_shared/llm-client.ts con function `callLLM(prompt, options)` che routes in base a LLM_PROVIDER
6. File impattati esatti + riga
7. Preserve Principio Zero v3 BASE_PROMPT INTATTO (solo cambio provider chiamata)
8. Test strategy: 20 prompt tipici bambini + verifica output PZ v3 regex match
9. Rollback plan: env var flip LLM_PROVIDER=gemini → revert senza re-deploy se Gemini env ancora set
10. Costi expected: Llama 70B $0.88/M token vs Gemini Flash-Lite free tier 15 RPM. Per Andrea solo testing: <$1/mese atteso
11. Latency expected: Llama Turbo ~400-600ms vs Gemini Flash-Lite ~300-500ms. Accept differenza
12. Italian quality risk: 40% chance Llama inferiore Gemini italiano, se test 20 prompt fail >2 → switch a Qwen 2.5 72B
13. ADR docs/decisions/ADR-002-gemini-to-together-switch.md con decisione + timeline

Max 600 righe blueprint. No codice. Include diagramma mermaid provider routing." })

### 2.5.2 — DEV implementa switch (TDD + feature flag)

Agent({ subagent_type: "team-dev",
  prompt: "Implementa switch Gemini → Together da blueprint docs/architectures/gemini-to-together-switch.md. TDD strict.

Steps:
1. CREA supabase/functions/_shared/llm-client.ts:
   - interface LLMClient { call(prompt, options): Promise<LLMResponse> }
   - class TogetherClient implements LLMClient (using fetch to https://api.together.xyz/v1/chat/completions, modello meta-llama/Llama-3.3-70B-Instruct-Turbo)
   - class GeminiClient implements LLMClient (using existing Gemini code)
   - function callLLM(prompt, options) che legge Deno.env.get('LLM_PROVIDER') || 'gemini' e routes

2. REFACTOR supabase/functions/_shared/system-prompt.ts:
   - Preserve BASE_PROMPT intatto (Principio Zero v3 immutabile)
   - Estrai chiamata modello in callLLM
   - Cross-session context injection preservato

3. UPDATE 5 Edge Function index.ts (unlim-chat, unlim-diagnose, unlim-hints, unlim-tts, unlim-gdpr):
   - Sostituisci chiamate gemini con callLLM()
   - Zero altro cambio logica

4. SUPABASE SECRETS set:
   ```
   SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase secrets set --project-ref vxvqalmxqtezvgiboxyv \\
     TOGETHER_API_KEY=$TOGETHER_API_KEY \\
     LLM_PROVIDER=together
   ```
   (Preserve GEMINI_API_KEY per rollback facile)

5. TEST LOCAL pre-deploy:
   - Scrivi tests/integration/llm-client-provider-switch.test.js
   - Mock fetch Together + Gemini
   - Verifica callLLM() routes correttamente
   - CoV 3x (3 run, PASS identico)

6. DEPLOY Edge Function:
   ```
   SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy unlim-chat --project-ref vxvqalmxqtezvgiboxyv
   ```
   Ripeti per unlim-diagnose, unlim-hints, unlim-tts, unlim-gdpr.
   Output: log deploy status ognuno.

7. LIVE VERIFICATION 20 prompt:
   Scrivi script scripts/cli-autonomous/verify-llm-switch.sh che:
   - Array 20 prompt italiani tipici bambini (esempi: 'Ragazzi, spieghi LED?', 'Vol1 cap6 esp1 resistore', 'come funziona pulsante?', 'errore polarità', 'Arduino setup()', etc)
   - Per ogni prompt: curl Edge Function unlim-chat con payload
   - Verifica response:
     * HTTP 200
     * Contiene 'Ragazzi' (PZ v3 plurale)
     * NON contiene 'Docente,?\\s*leggi|Insegnante,?\\s*leggi'
     * Length <60 parole totali (soft check)
     * Cita libro se esperimento specifico
   - Conta PASS/FAIL ognuno
   - Output docs/audit/llm-switch-verify-YYYY-MM-DD.md con tabella risultati

8. DECISIONE automatica:
   - Se PASS >= 18/20 → commit [SWITCH-OK] + keep Together
   - Se PASS < 18/20 → rollback:
     ```
     SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase secrets set --project-ref vxvqalmxqtezvgiboxyv LLM_PROVIDER=gemini
     ```
     Commit [SWITCH-ROLLBACK: N/20 fail Italian quality insufficient] + documento fail prompt per analisi

9. COMMIT finale:
   - `feat(edge): Gemini→Together switch + llm-client unified interface`
   - Co-author Claude Opus 4.7
   - Reference ADR-002

VINCOLI: NO modifica BASE_PROMPT system-prompt.ts (Principio Zero v3 IMMUTABILE). Zero dep nuova. Zero regressione test existing. Rollback plan testato prima deploy (verifica ENV flip funziona). File critici lockati intatti." })

### 2.5.3 — Output atteso

File `docs/audit/llm-switch-verify-YYYY-MM-DD.md` con:
- 20 prompt tested
- PASS/FAIL count
- Latency media Together vs prev Gemini baseline
- Italian quality subjective score
- Decision: KEEP Together / ROLLBACK Gemini

Commit SPA (Single Purpose Atomic) in branch corrente.

## STEP 3 — TESTER esegue + CoV 3x (1.5h)

Attendi Dev done, poi dispatch:
Agent({ subagent_type: "team-tester",
  prompt: "Esegui test suite completo + CoV 3x per fondazioni autonomia. Steps:
1. npx vitest run --reporter=dot 3 volte consecutive (CoV 3x), PASS count identico
2. npm run build 1 volta (PASS exit 0 + tempo)
3. bash scripts/cli-autonomous/daily-preflight.sh (verifica output JSON)
4. bash scripts/cli-autonomous/daily-audit.sh (verifica output file docs/audit/daily-*.md)
5. bash scripts/cli-autonomous/end-day-handoff.sh (verifica template generato)
6. bash scripts/cli-autonomous/push-safe.sh (dry-run, NO actual push)
7. bash scripts/cli-autonomous/deploy-preview.sh --dry-run
8. bash scripts/cli-autonomous/end-week-gate.sh (simulate sett 1 day 1, expected FAIL perche non fine sett, verifica output rep)
9. npx playwright test tests/e2e/ --list (verifica 20 spec register)
10. npx playwright test tests/e2e/01-homepage-load.spec.js --reporter=list (1 spec real run contro prod)
11. grep 'Docente,\\s*leggi\\|Insegnante,\\s*leggi' supabase/functions/_shared/system-prompt.ts (zero match atteso)
12. DEPLOY PREVIEW REALE: bash scripts/cli-autonomous/deploy-preview.sh (NO dry-run). Attendi output URL preview. Curl URL → 200 OK verify. Log docs/deploy/preview-YYYY-MM-DD.md con URL + HTTP code + response headers.
13. DEPLOY EDGE FUNCTION SUPABASE: se SUPABASE_ACCESS_TOKEN in env → `SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy --project-ref vxvqalmxqtezvgiboxyv` tutti 5 Edge Function (unlim-chat, unlim-diagnose, unlim-hints, unlim-tts, unlim-gdpr). Log per ognuno deploy status.
14. GITHUB STATUS FULL CHECK:
    - `gh pr list --state open` (PR aperte)
    - `gh pr list --state closed --limit 5` (PR recenti chiuse)
    - `gh issue list --state open --limit 10` (issue aperte)
    - `gh run list --branch feature/pdr-ambizioso-8-settimane --limit 5` (CI recenti)
    - `gh api repos/AndreaMarro/elab-tutor/actions/runs?status=failure --jq '.workflow_runs | .[0:3] | .[] | {id, name, conclusion, html_url}'` (ultimi 3 fail se ci sono)
    - Log tutto in docs/audit/github-status-YYYY-MM-DD.md
15. CURL PROD LIVE:
    - `curl -s -o /dev/null -w "HTTP %{http_code} time:%{time_total}s\\n" https://www.elabtutor.school/`
    - `curl -s https://vxvqalmxqtezvgiboxyv.supabase.co/functions/v1/unlim-chat -X POST -H "Content-Type: application/json" -H "apikey: $SUPABASE_ANON_KEY" -d '{"message":"ciao"}' | head -c 500` (verify Edge Function live + PZ v3 in response)
    - Log docs/audit/prod-live-verify-YYYY-MM-DD.md

Output report docs/audit/foundations-tester-report.md con:
- CoV 3x risultato (3 run test count)
- Build time
- Script smoke test results (8 script)
- Playwright list count
- Playwright 1 spec run result
- PZ v3 grep result
- Regressioni (se vitest count scende)
- Red flag + caveat onesti

NO codice applicativo (solo tests/ e reports/)." })

## STEP 4 — REVIEWER pre-merge critique (1h)

Dispatch:
Agent({ subagent_type: "team-reviewer",
  prompt: "Review pre-merge fondazioni autonomia. Leggi:
- Blueprint docs/architectures/cli-autonomous-foundations.md
- Commits worktree + branch
- docs/audit/foundations-tester-report.md
- .claude/settings.local.json (allowlist nuova)
- scripts/cli-autonomous/*.sh
- tests/e2e/*.spec.js

Verifica: silent failures, type design, comments accuracy, security. Punti attenzione: script shell error handling (set -e + exit codes), Playwright config baseURL + retries, allowlist settings non troppo permissiva, hook safety preservati.

Verdict: APPROVE / REQUEST_CHANGES / REJECT.
Output docs/audit/foundations-reviewer-verdict.md max 50 righe: verdict + 5 issue top + 5 strength. NO codice." })

## STEP 5 — AUDITOR audit brutal onesto (1h)

Dispatch:
Agent({ subagent_type: "team-auditor",
  prompt: "Audit finale brutale onesto fondazioni autonomia. Live verify TUTTO (no claim accept):
1. Vitest count: CoV 3x real run npx vitest run --reporter=dot
2. Build real: npm run build (time + exit)
3. Script smoke: ogni scripts/cli-autonomous/*.sh --dry-run exit 0
4. Playwright real 5 spec: npx playwright test tests/e2e/01,02,03,05,12*.spec.js (E2E reali contro prod)
5. Git status: lavoro committato? quante commit? push attuale?
6. Settings allowlist: ragionevole? hook safety intact?
7. PZ v3 grep source code zero violazioni nuove
8. MCP usage verify: claude-mem save obs + context7 query reali fatti?
9. File count: doc generate (word count), test added (count), script added
10. Benchmark: node scripts/benchmark.cjs --fast delta vs baseline 2.77
11. Regression check: test count vs 12103 baseline (ZERO calo permesso)
12. Deploy preview: se deploy-preview.sh runnable, test live?
13. Principio Zero v3 live: curl Edge Function unlim-chat (se SUPABASE_ACCESS_TOKEN OK) + grep response PZ v3 regex

Output docs/audit/foundations-brutal-audit-YYYY-MM-DD.md max 100 righe:
- Progresso REALE vs claim (percentuale accurata)
- Gap identificati (cosa NON funziona)
- Red flag (rischi scoperti)
- Inflation detection (claim troppo ottimistici corretti)
- Caveat onesti
- Score fondazioni (0-10 onesto)
- Go/No-Go per domani mar 22/04 sprint 1 day 02 autonomo

Zero inflation. NO 'looks good'. Brutale come se foste Microsoft security audit." })

## STEP 6 — TPM chiusura + sprint 1 day 02 plan (30 min)

Dispatch:
Agent({ subagent_type: "team-tpm",
  prompt: "Chiusura fondazioni + pianificazione sprint 1 day 02 (mar 22/04). Leggi:
- docs/audit/foundations-brutal-audit-*.md
- docs/audit/foundations-tester-report.md
- docs/audit/foundations-reviewer-verdict.md
- automa/team-state/tasks-board.json

Fai:
1. Update tasks-board.json: tutti FOUNDATIONS-* task status=done con blueprint/report path
2. Aggiungi task T1-002-EXT (edge case penna toggle) + T1-010 (nuovo esperimento) + T1-011-DEPLOY (se Supabase token disponibile) se non presenti
3. Update daily-standup.md: sezione 'Domani mar 22/04' con 3 task P0 day 02 prioritari da PDR_GIORNO_02_MAR_22APR.md
4. Check quota Max: `claude usage --period week` (se esiste) altrimenti nota manuale
5. Scrivi docs/handoff/2026-04-21-fondazioni-end.md con:
   - Ora start/end
   - Task done (lista)
   - Commits worktree (hash)
   - Test count delta
   - Build status
   - Score onesto (da auditor)
   - Blocker aperti
   - Plan domani 09:00 autonomo
   - Energy level Andrea
6. Scrivi automa/state/claude-progress.txt con: last_commit, last_test_count, last_build_tempo, next_task, blockers_open_count

NO codice. Solo TPM cordinazione + documentazione." })

---

## STEP 7 — LOOP DAYS SUCCESSIVI (fino quota/context/fine sett)

Dopo STEP 6 TPM chiusura fondazioni, NO STOP. Continua auto:

### 7.1 — Determina day corrente

```bash
DAY_NUM=$(date +%u)  # 1=lun ... 7=dom
DATE_ITA=$(date +%d%b | tr '[:upper:]' '[:lower:]')
# Sprint day mapping: day 01=lun21apr, day 02=mar22apr ... day 56=dom15giu
START_DATE="2026-04-21"
TODAY=$(date +%Y-%m-%d)
SPRINT_DAY=$(( ($(date -d "$TODAY" +%s) - $(date -d "$START_DATE" +%s)) / 86400 + 1 ))
printf "Sprint day: %02d\\n" $SPRINT_DAY
```

### 7.2 — Leggi PDR day corrente

```bash
PDR_FILE="docs/pdr-ambizioso/giorni/PDR_GIORNO_$(printf %02d $SPRINT_DAY)_*.md"
cat $PDR_FILE | head -80
```

### 7.3 — Dispatch sequenza team per day corrente

Ripeti pattern STEP 1-6 ma per task PDR day corrente:
1. Dispatch `@team-tpm` standup day N (prioritizza task board)
2. Se task >2h blueprint_needed → `@team-architect` prima
3. `@team-dev` implementa (TDD strict)
4. `@team-tester` CoV 3x + smoke E2E
5. `@team-reviewer` verdict
6. Se APPROVE → commit + push + CI watch
7. `@team-auditor` live verify ultimo task user-facing
8. `@team-tpm` end-day-handoff + state update

### 7.4 — Decisione continue/stop

Dopo ogni day completo verifica:

```bash
# A) Fine settimana (day 07, 14, 21, 28, 35, 42, 49, 56)
if (( SPRINT_DAY % 7 == 0 )); then
  bash scripts/cli-autonomous/end-week-gate.sh
  WEEK_N=$(( SPRINT_DAY / 7 ))
  cat docs/audit/week-$WEEK_N-gate-*.md | tail -30
  # STOP per approval Andrea merge main + deploy prod
  echo "SETT $WEEK_N END — STOP per Andrea approval"
  exit 0
fi

# B) Quota Max check (se possibile)
# Claude Code non espone quota via API, ma context auto-compact e segnale
# Se auto-compact triggered 3+ volte in sequenza → STOP + handoff
# Se errore 429 rate limit → sleep 60s retry max 3, poi STOP

# C) Context full
# Se response include "conversation compacted" → scrivi state recovery + STOP

# D) Errore fatale (test regression, build fail)
# Se 3 retry auto-fix fail → crea automa/state/BLOCKER.md + STOP

# E) Default: continua day successivo
SPRINT_DAY=$((SPRINT_DAY + 1))
# Jump back STEP 7.1 loop
```

### 7.5 — Gate sett end hard — CLI AUTONOMA MERGE + DEPLOY

Se `end-week-gate.sh` esci 0 (tutti 13 check PASS) → **CLI procede AUTONOMA**:

```bash
# A) Crea PR feature → main
gh pr create \
  --title "Sprint sett $WEEK_N complete — auto-merge via DoD gate" \
  --body "$(cat docs/audit/week-$WEEK_N-gate-*.md)" \
  --base main \
  --head feature/pdr-ambizioso-8-settimane

# B) Attendi CI green PR
PR_NUMBER=$(gh pr list --head feature/pdr-ambizioso-8-settimane --json number -q '.[0].number')
gh pr checks $PR_NUMBER --watch --fail-fast

# C) Se CI PASS → merge auto
gh pr merge $PR_NUMBER --merge --delete-branch=false

# D) Deploy prod vercel
git checkout main && git pull origin main
npm run build
npx vercel --prod --yes > /tmp/deploy-url.txt
DEPLOY_URL=$(grep -oE 'https://[^ ]*' /tmp/deploy-url.txt | head -1)

# E) Deploy Edge Function Supabase
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy \
  --project-ref vxvqalmxqtezvgiboxyv \
  unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr

# F) POST-DEPLOY TEST REALE SU PROD
bash scripts/cli-autonomous/test-on-deployed.sh $DEPLOY_URL
```

### 7.6 — test-on-deployed.sh (CLI crea questo script, DEV STEP 2)

Test suite mandatory DOPO deploy prod:

1. **Curl homepage prod**: `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school/` → 200
2. **Curl Edge Function 5 endpoints**:
   ```bash
   for fn in unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr; do
     curl -s -o /dev/null -w "$fn HTTP %{http_code}\\n" \
       https://vxvqalmxqtezvgiboxyv.supabase.co/functions/v1/$fn \
       -X POST -H "Content-Type: application/json" \
       -H "apikey: $SUPABASE_ANON_KEY" \
       -d '{"message":"test"}'
   done
   ```
3. **Playwright E2E contro prod** (20 spec già scaffolded STEP 2):
   ```bash
   BASE_URL=https://www.elabtutor.school npx playwright test tests/e2e/ --reporter=list
   ```
4. **Control Chrome MCP** live UI verify:
   - `mcp__Control_Chrome__open_url` homepage
   - `mcp__Control_Chrome__get_page_content` → grep "ELAB"
   - `mcp__Control_Chrome__execute_javascript` verifica window.__ELAB_API presente
   - Screenshot via `mcp__Control_Chrome__get_page_content` ridotto
5. **Principio Zero v3 prod LIVE**:
   - 20 prompt test (scripts/cli-autonomous/verify-llm-switch.sh già creato STEP 2.5)
   - grep response "Ragazzi" presente, "Docente leggi" assente
   - PASS >= 18/20 richiesto
6. **Sentry error rate post-deploy**:
   - `mcp__792083c5-*__search_events` last 10 min → errori nuovi?
   - Se >5 errori nuovi → rollback immediato
7. **Benchmark delta prod**:
   - `node scripts/benchmark.cjs --write` → score delta vs pre-deploy
8. **Performance prod**:
   - Lighthouse via Chrome MCP (se disponibile) OR curl -w time_total

### 7.7 — Rollback auto se test post-deploy fail

Se `test-on-deployed.sh` exit 1 (qualsiasi check fail critical):

```bash
# A) Rollback Vercel (previous deploy)
PREV_DEPLOY=$(npx vercel ls --yes --json | jq -r '.[1].url' | head -1)
npx vercel rollback https://$PREV_DEPLOY --yes

# B) Rollback Edge Function (git revert + re-deploy)
git revert HEAD --no-edit
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy \
  --project-ref vxvqalmxqtezvgiboxyv \
  unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr

# C) Log rollback
echo "ROLLBACK $(date) — test-on-deployed FAIL" >> docs/audit/rollback-log.md

# D) Alert in blockers.md
cat >> automa/team-state/blockers.md <<EOF

## BLOCKER-$(date +%s) — Auto rollback sett $WEEK_N
Deploy prod fallito, rollback eseguito automatico.
Test fail: [lista]
Investigate + fix + re-deploy manual.
EOF

# STOP
exit 1
```

Se rollback anche fail → hard stop + handoff critico.

### 7.8 — Se TUTTO post-deploy PASS → continua sett N+1

```bash
# A) Commit deploy log
git add docs/deploy/prod-*.md docs/audit/post-deploy-*.md
git commit -m "chore(deploy): sett $WEEK_N prod verified live [AUTO-MERGE]"
git push origin main

# B) Merge main → feature branch (sync forward)
git checkout feature/pdr-ambizioso-8-settimane
git merge main --no-edit
git push origin feature/pdr-ambizioso-8-settimane

# C) Claude-mem save observation
# mcp__plugin_claude-mem_mcp-search__* save decision "Sett N deployed + verified"

# D) Continua day successivo (Monday sett N+1)
SPRINT_DAY=$((SPRINT_DAY + 1))
# Jump STEP 7.1
```

### 7.9 — Se end-week-gate.sh FAIL qualsiasi check

```bash
# Scrivi blocker
cat > automa/state/WEEK-$WEEK_N-BLOCKER.md <<EOF
# Blocker sett $WEEK_N
$(cat docs/audit/week-$WEEK_N-gate-*.md | tail -50)

Check failed: [lista]
Retry strategy: [per ogni check]
EOF

# Tenta self-heal max 3 volte
for retry in 1 2 3; do
  bash scripts/cli-autonomous/auto-fix-blockers.sh
  bash scripts/cli-autonomous/end-week-gate.sh && break
  sleep 30
done

# Se 3 retry fail → STOP + handoff critico
if ! bash scripts/cli-autonomous/end-week-gate.sh; then
  echo "HARD BLOCKER sett $WEEK_N after 3 retry — stop" >> docs/handoff/$(date +%Y-%m-%d)-blocker-sett-$WEEK_N.md
  exit 1
fi
```

### 7.6 — Pattern LOOP fino stop naturale

CLI esegue day dopo day fino a una di queste condizioni:
- **Fine settimana** (day 7/14/21/28/35/42/49/56) → approval Andrea
- **Quota Opus Max esaurita** (rate limit) → handoff + STOP
- **Context window full** (auto-compact) → state recovery + STOP
- **3 retry fail consecutivi** → blocker + STOP
- **Push fail ripetuto** (credential lost) → alert + STOP

Pattern realistico: CLI fa 3-5 days consecutivi in 1 run, poi stop naturale per quota/context. Andrea re-launcha `cc` mattina dopo, continua.

## CHIUSURA FINALE

Alla fine (STEP 6 fondazioni + N giorni STEP 7), STOP:
1. Scrivi `docs/handoff/YYYY-MM-DD-final-session-end.md` con:
   - Fondazioni status (score auditor)
   - Days completati (lista sprint day + task done per ogni)
   - Commits totali (count + hash ultimo)
   - Test count final
   - CI status ultima
   - Deploy preview URL
   - Blocker aperti
   - Next action Andrea (merge PR? approve? fix blocker?)
2. Update `automa/state/claude-progress.txt` con state recovery completo
3. Output finale a stdout summary 20 righe

Andrea mattina dopo:
1. `cd elab-builder && cc`
2. CLI riprende auto da state recovery
3. Ripete STEP 7 loop per days successivi

Nessun merge automatic a main, nessun deploy prod senza approval file esplicito.

MASSIMA ONESTA' BRUTALE OGNI STEP. NO INFLATION. ZERO REGRESSIONE TEST. PZ v3 INTOCCABILE.

Forza ELAB. Fondazioni day 01 chiude.

## FINE PROMPT ⬆️

---

## Istruzioni Andrea

1. Apri Terminale macOS (se non aperto)
2. `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`
3. Lancia CLI: `cc` (alias = `claude --continue --dangerously-skip-permissions`) OPPURE `claude --continue`
4. **Copia testo tra ⬇️ e ⬆️** (tra le due linee marker "INCOLLA DA QUI" e "FINE PROMPT")
5. Incolla in CLI + invio
6. CLI dispatcha 6 agent orchestrati sequenziale
7. Monitora output ogni 30 min
8. 6-8h totali stimate
9. Al termine: review handoff + cherry-pick commits + push

## Cosa aspettarti

- Ogni ~1h CLI completa step, output sommario
- Tempo ~6-8h totali autonomo
- Commit multipli atomici su branch corrente
- Report finali in `docs/audit/foundations-*.md`
- Playwright installato + 20 spec scaffold + 1 spec verificata live
- Tutti script chmod 755 in `scripts/cli-autonomous/`
- 8 handoff template settimanali in `docs/handoff/`
- ADR-001 + ADR-002 (Gemini→Together plan)

## Stop auto CLI

CLI stop naturale quando:
- TPM scrive handoff fine
- Blocker grave (test fail, build fail) → report + stop
- Richiesta decisione scope ambigua

Tu ricevi output finale + review + approvi con commit diretto.
