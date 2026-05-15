# Iter 63 → Iter 64 Handoff — 2026-05-15 PM

**Iter 63 close score onesto**: **9.0/10 G45 cap** (single iter close + prep iter 64 entrance singolare per Andrea iter 62 correction).

**Main branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `65d61e5e`  
**Codex branch**: `feat/iter-63-codex-parallel` HEAD `2cfb055c` (worktree `../elab-builder-codex/`)

---

## 1. ACTIVATION STRING ITER 64 ENTRANCE (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 64 ENTRANCE — MULTI-AGENT MACBOOK + CODEX BG + MAC MINI SSH AD-HOC

/ultrathink:ultrathink

Agisci come direttore tecnico + PM operativo + principal engineer + revisore anti-debito + orchestratore multi-agent ELAB Tutor. NON COMPIACERE. NON simulare strumenti inesistenti. NON gonfiare iter cascade fittizi.

==== CONTESTO INGRESSO ITER 64 (post iter 63 close 2026-05-15 PM) ====
- Branch main: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD 65d61e5e (iter 63 entrance close)
- Branch Codex worktree: feat/iter-63-codex-parallel HEAD 2cfb055c (P0.5 ELAB Compile Agent Server HTTP shipped)
- Vitest baseline canonical: 13254 main + 13278 Codex worktree (post entrance B3 +5 + P0.5 +29)
- Build PASS both worktrees exit 0 (Codex 47.48s + main TBD verified iter 63 close)
- Score iter 63 close ONESTO finale: 9.0/10 G45 cap
- Codex plugin-cc installed via terminale (Andrea Cmd+Q restart Claude Code per attivare)
- Mac Mini ALIVE 63ms RTT uptime 4d15h+ PATH C dormant (NOT cron, ad-hoc SSH only)
- ADR-019 ACCEPTED iter 63 + ADR-049 Sense 1.6 PROPOSED skeleton ~600 LOC shipped
- B3 HomePage regression guard 5/5 PASS (anti-iter-41-PM-regression LIVE)
- ELAB Compile Agent: server.js + 29 tests + README LIVE worktree, Real Nano R4 UAT pending Andrea hardware

==== ITER 64 P0 PRIORITIES ====

P0.1 Andrea Real Nano R4 USB UAT (~30 min hardware)
  - Connect Nano R4 USB-C + double-tap reset bootloader
  - Start ELAB Compile Agent: cd elab-builder-codex && export ELAB_AGENT_LOCAL_TOKEN="..." && node -e "import('./src/services/elab-agent/server.js').then(m => m.startServer())"
  - curl smoke: curl -H "Authorization: Bearer $ELAB_AGENT_LOCAL_TOKEN" http://localhost:17852/health
  - Upload Blink: POST /compile-and-upload { code, port: "/dev/cu.usbmodem101" }
  - Verify Flash 39048/262144 + SRAM 3940/32768 EXACT match BoardProfile
  - Box 15 lift 0.85 → 1.0 conditional

P0.2 Codex bg P0.8 verb-map-v2 expand 9 verbi (~2-3h Codex bg via /codex:rescue)
  - File: scripts/sprint-u/linguaggio-codemod.mjs VERB_MAP (42 entries → 51)
  - Verbs STRICT case-sensitive: ripeti/segna/gira/conta/leggi/scrivi/ascolta/calcola/aspetta
  - Tests: tests/unit/sprint-u-linguaggio-codemod.test.js +9 test cases per verbo
  - Dry-run + Andrea sample review 10 file diff gate prima apply 200-file batch

P0.3 Tea T1-T5 iter 58 brief relay Andrea (~10 min relay)
  - T1 ALTA Vol3 narrative arc 60min review
  - T2 MEDIA Cap.8 refactor 90min proposal
  - T3 UX 5 worst components 60min critique
  - T4 BASSA real prod test 30min
  - T5 BONUS Matteo 15min co-design

P0.4 ADR-049 Sense 1.6 Atom 1 dispatch (~2h subagent)
  - 4 Supabase migrations NEW: teacher_history_log + class_session_metadata + voice_movement_log + errore_ricorrente_pattern
  - RLS Pattern S1 open client-side + anon UUID localStorage
  - GDPR sub-processor list update commit
  - Status: PROPOSED → ACCEPTED post Andrea ratify schema + GDPR consent flow design

P0.5 Lighthouse perf optim ChatbotOnly + EasterModal (carryover iter 38)
  - Perf 26+23 FAIL ≥90 target
  - Lazy mount route components + defer non-critical chunks + image optim + font preload
  - Target: ≥90 perf + maintain ≥95 a11y + ≥100 SEO

P0.6 R5 + R6 + R7 re-bench post iter 41 v67 100% regression matrix
  - Verify quality preserved post Vertex Pure Gemini migration + voice clone Andrea
  - Latency p95 measurement vs PDR target

==== ANDREA AZIONE PRE-DISPATCH (5-10 min) ====
1. Cmd+Q + restart Claude Code (attivare codex plugin-cc 7 commands)
2. /codex:setup interactive (config verify)
3. Ratify queue gruppo 2 (4 voci max):
   - ADR-049 Sense 1.6 atomization iter 64-67 cascade ratify
   - Mac Mini PATH C sync strategy (dormant continue OR resync iter-41)
   - Real Nano R4 hardware UAT slot (oggi/domani)
   - Tea T1-T5 dispatch trigger

==== CONNETTORI ITER 64 ====
- Codex plugin-cc: /codex:rescue (BG delegation cleaner tracking) + /codex:adversarial-review (pre-merge challenge)
- Codex CLI v0.128.0: gpt-5.5 high reasoning implement profile (~/.npm-global/bin/codex)
- Mac Mini SSH: ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'cd ~/Projects/elab-tutor && <cmd>'
- Control_Chrome: navigate + get_page_content + execute_javascript (smoke prod)
- Control_your_Mac: osascript shell commands (process check + EDR verify)
- Skills: claude-mem mem-search + smart_outline + smart_search; superpowers brainstorming + verification-before-completion

==== ANTI-PATTERN ITER 64 (13/13 enforced) ====
- NO git add -A · NO --no-verify · NO push main diretto
- NO Codex query 1-line (4-element template obbligatorio)
- NO heredoc Codex (stdin pipe OR $(cat) substitution)
- NO mock/dati finti · NO Galileo naming · NO parafrasi volumi
- NO self-rate score · NO "100% LIVE" claim P0.5 senza Real UAT
- NO 2-agents same file write concurrent (file ownership rigid)
- NO Mac Mini autonomous cron (PATH C dormant + manual SSH ad-hoc)

==== ANTI-INFLATION G45 mandate ====
- Score iter 64 close ONESTO target: 9.0 → 9.2+/10 conditional Real Nano R4 UAT + Codex bg P0.8 + Tea T1-T5 dispatch + ADR-049 Atom 1 ship
- NO claim 9.5+ senza Opus indipendente review G45 mandate
- Honesty delta surface UPFRONT pattern: pre-applied deliverables real vs claimed scope

==== START NOW iter 64 entrance ====
1. /ultrathink:ultrathink (deeper reasoning)
2. /claude-mem:mem-search "iter 63 close ELAB Compile Agent ADR-019 ADR-049 B3 HomePage guard"
3. /claude-mem:make-plan "iter 64 Real Nano R4 UAT + Codex bg P0.8 verb-map + Tea T1-T5 + ADR-049 Atom 1"
4. Read docs/audits/2026-05-15-iter-63-CLOSE-audit.md (this file iter 63 close)
5. Read docs/handoff/2026-05-15-iter-63-to-iter-64-handoff.md (THIS handoff)
6. Verify Mac Mini SSH alive: ping -c 3 100.124.198.59
7. Verify Codex plugin-cc installed: /codex:setup confirm
8. AskUserQuestion ratify gruppo 2 (max 4 voci)
9. Dispatch parallel per file ownership rigid

==== END ATTIVAZIONE iter 64 entrance ====
```

---

## 2. SETUP STEPS ANDREA (5-10 min)

### Cmd+Q + restart Claude Code

After restart, verify codex plugin-cc loaded:
```
/codex:setup
```

Expected: prompt for ChatGPT subscription OR OpenAI API key + Codex CLI path verify.

### Verify install state

```bash
# Marketplace registered
cat ~/.claude/plugins/known_marketplaces.json | python3 -c "import json, sys; print(json.load(sys.stdin).get('openai-codex', 'MISSING'))"

# Plugin enabled
cat ~/.claude/settings.json | python3 -c "import json, sys; d=json.load(sys.stdin); print('codex@openai-codex =', d['enabledPlugins'].get('codex@openai-codex'))"
```

Expected:
- known_marketplaces openai-codex entry with repo `openai/codex-plugin-cc` + installLocation `~/.claude/plugins/marketplaces/openai-codex`
- settings.json `codex@openai-codex = True`

---

## 3. PRIORITIES ITER 64 (P0 → P1)

### P0.1 Real Nano R4 USB upload UAT (Andrea hardware ~30 min)

Pre-reqs:
- Nano R4 board physical
- USB-C cable
- arduino-cli v1.4.1 + renesas core 1.5.3 installed ✅ verified iter 63

Steps:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-codex"
export ELAB_AGENT_LOCAL_TOKEN="$(openssl rand -hex 16)"
export ELAB_AGENT_PORT=17852

# Start server
node -e "import('./src/services/elab-agent/server.js').then(async m => { const s = await m.startServer(); console.log('UP', s.port); })" &
SERVER_PID=$!

# Health
curl -H "Authorization: Bearer $ELAB_AGENT_LOCAL_TOKEN" http://localhost:17852/health

# Boards
curl -H "Authorization: Bearer $ELAB_AGENT_LOCAL_TOKEN" http://localhost:17852/boards

# Connect Nano R4 USB-C + double-tap reset → bootloader mode (DFU)
# Then upload Blink:
curl -X POST http://localhost:17852/compile-and-upload \
  -H "Authorization: Bearer $ELAB_AGENT_LOCAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }",
    "port": "/dev/cu.usbmodem101"
  }'

# Stop server
kill $SERVER_PID
```

Expected: HTTP 200 + jobId + Flash 39048/262144 + SRAM 3940/32768 match. Nano R4 LED D13 blink 1Hz.

**Box 15 lift conditional**: PASS → 0.85 → 1.0.

### P0.2 Codex bg verb-map-v2 expand 9 verbi

Via `/codex:rescue` post plugin-cc install:
```
/codex:rescue
GOAL: extend scripts/sprint-u/linguaggio-codemod.mjs VERB_MAP with 9 STRICT case-sensitive verbs (ripeti/segna/gira/conta/leggi/scrivi/ascolta/calcola/aspetta) singolare→plurale + add 9 unit test cases verifying no false positives.

CONTEXT:
- @scripts/sprint-u/linguaggio-codemod.mjs (VERB_MAP frozen object 42 entries currently lines 33-80)
- @tests/unit/sprint-u-linguaggio-codemod.test.js (472 LOC pattern reference)
- iter 62 commit d2428e9d teacher_message+response extension precedent
- STRICT case-sensitive { caseInsensitive: false } new verbs (iter 61 default caseInsensitive: true preserved per teacher_tip)

CONSTRAINTS:
- Main worktree (cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder)
- Branch feat/iter-41-sprint-u-cycle-2-real-user-fix
- Vitest 13254 baseline PRESERVED + new tests added
- npm run build PASS
- NO --no-verify
- NO push origin

DONE:
1. VERB_MAP extended: 'Ripeti'→'Ripetete', 'Segna'→'Segnate', 'Gira'→'Girate', 'Conta'→'Contate', 'Leggi'→'Leggete', 'Scrivi'→'Scrivete', 'Ascolta'→'Ascoltate', 'Calcola'→'Calcolate', 'Aspetta'→'Aspettate' (longest-first sort if needed)
2. tests/unit/sprint-u-linguaggio-codemod.test.js +9 test cases each verb (transform + no-false-positive)
3. vitest run PASS (13254 + 9 = 13263 expected)
4. Dry-run scope-report on 73 lesson-paths → report ~30-50 new violations count
5. Commit: feat(iter-64-P0.2): verb-map-v2 expand 9 STRICT case-sensitive (NO apply, dry-run sample 10 files for Andrea review)
```

### P0.3 Tea T1-T5 iter 58 brief

Andrea relay verbatim from Tea brief `/VOLUME 3/SETUP-NEXT-SESSION/PROMPT-PER-TEA-ITER-58-*.md` (if exists) OR new brief author.

Scope: parallel Tea worktree work iter 64+ on Vol3 narrative + Cap.8 + UX critique + prod test. Andrea-mediated relay (NOT autonomous spawn).

### P0.4 ADR-049 Sense 1.6 Atom 1 dispatch

Subagent `agent-teams:team-implementer` (Phase 1 parallel safe per file ownership):
- supabase/migrations/<timestamp>_teacher_history_log.sql NEW
- supabase/migrations/<timestamp>_class_session_metadata.sql NEW
- supabase/migrations/<timestamp>_voice_movement_log.sql NEW
- supabase/migrations/<timestamp>_errore_ricorrente_pattern.sql NEW
- public/gdpr-sub-processors.md UPDATE (4 new tables tracked)
- Andrea ratify gate prima apply via `supabase db push --linked`

### P0.5 Lighthouse perf optim (carryover iter 38)

ChatbotOnly perf 26 + EasterModal perf 23 → target ≥90.

Fix candidates:
- Lazy mount components (React.lazy + Suspense)
- Defer non-critical chunks (Workbox precache split)
- Image optimization (PNG → WebP/AVIF)
- Font preload re-check (Oswald + Open Sans + Fira Code)
- Bundle analyzer rollup-plugin-visualizer + manualChunks tune

### P0.6 R5+R6+R7 re-bench post iter 41 v67

Post iter 41 100% PASS regression matrix + iter 43 Flash promote v70:
- R5 50q stress quality verify (≥85% PZ V3 gate)
- R6 100q expanded fixture (post-runner build iter 39+ deferred)
- R7 200q canonical INTENT rate (post Mistral function calling deploy)

---

## 4. ANTI-REGRESSIONE FERREO 4-gate iter 64 entrance

1. Vitest 13254 baseline PRESERVED (main) / 13278 (Codex worktree)
2. npm run build PASS exit 0
3. Validator lesson-paths 94/94 (iter 64 scope verify post 5 missing audit)
4. Codex Pattern C-V 4-element CONFIRM per claim

Pre-commit + pre-push hook NEVER bypass `--no-verify` (SOLO security urgency NordVPN EDR documented).

---

## 5. ANDREA RATIFY QUEUE GRUPPO 2 (4 voci max via AskUserQuestion)

1. ADR-049 Sense 1.6 atomization iter 64-67 cascade ratify? (SI dispatch Atom 1 NOW / DEFER iter 65+ / RICERCA ULTERIORE)
2. Mac Mini PATH C sync strategy? (DORMANT continue / RESYNC iter-41 lose 185 commits / RESYNC merge strategy explore)
3. Real Nano R4 hardware UAT slot? (OGGI ~30 min / DOMANI / DEFER iter 65+)
4. Tea T1-T5 dispatch trigger? (NOW relay / DEFER iter 65+ / Andrea direct contact Tea)

---

## 6. FILES REFS ITER 63 close + ITER 64 entrance

**Iter 63 close docs**:
- `docs/audits/2026-05-15-iter-63-ENTRANCE-PROGRESS-audit.md` (~250 LOC entrance progress)
- `docs/audits/2026-05-15-iter-63-CLOSE-audit.md` (~400 LOC close finale)
- `docs/handoff/2026-05-15-iter-63-to-iter-64-handoff.md` (THIS file)

**Iter 63 ADR deliverables**:
- `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md` (M, status ACCEPTED)
- `docs/adrs/ADR-049-sense-1.6-morfismo-extended-runtime-context.md` (NEW, ~600 LOC PROPOSED)

**Iter 63 test deliverables**:
- `tests/unit/components/HomePage-regression-guard.test.jsx` (NEW, 5/5 PASS)

**Iter 63 Codex worktree deliverables**:
- `../elab-builder-codex/src/services/elab-agent/server.js` (M, native node:http startServer + 6 endpoints)
- `../elab-builder-codex/tests/unit/elab-agent/server.test.js` (NEW, 29/29 PASS)
- `../elab-builder-codex/src/services/elab-agent/README.md` (NEW, startup + curl)

---

## 7. SCORE PROJECTION ITER 64-65 CASCADE

- Iter 63 close (this iter): **9.0/10 G45 cap**
- Iter 64 close target: **9.2/10 ONESTO** conditional Real Nano R4 UAT PASS + Codex bg P0.8 + Tea T1-T5 dispatch + ADR-049 Atom 1 + Lighthouse perf optim + R5+R6+R7 re-bench
- Iter 65 close projection: **9.4/10 ONESTO** conditional ADR-049 Atom 2-4 cascade + verb-map-v2 200-file apply + Vol3 refactor (Davide co-author)
- G45 cap UNCHANGED 9.5/10 — NO claim 9.5+ senza Opus indipendente review

---

**End handoff iter 63 → iter 64. Andrea restart Claude Code + AskUserQuestion ratify gruppo 2 + dispatch parallel per file ownership rigid.**
