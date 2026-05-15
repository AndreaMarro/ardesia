# ATTIVAZIONE SESSIONE ELAB TUTOR — ITER 65+ MASTER v4 (paste-ready)

> **Provenance**: Andrea verbatim 2026-05-15 PM mandate massivo iter 64 close → iter 65+ entrance.
> **Status**: 8 commit pushed origin (`44b618fa` HEAD), iter 63 P0.5 ELAB Compile Agent MVP 70%, NordVPN allowlist pending iter 65, multi-agent orchestration NEW mandate.
> **Goal**: orchestrare MacBook Claude + Mac Mini SSH + Codex Desktop + skills + Fusion 3D + Impeccable per chiudere TUTTO incompiuto + NEW + test ogni parte site systematic ZERO conflitti ZERO regressioni.

---

## 0. STRINGA ATTIVAZIONE PASTE-READY ITER 65+

Incolla SUBITO in nuova sessione Claude Code (~600 LOC):

```text
ATTIVAZIONE ELAB TUTOR ITER 65 — MULTI-AGENT ORCHESTRATION MASSIMA NO CONFLITTI NO REGRESSIONI

/ultrathink:ultrathink

Agisci come direttore tecnico + PM operativo + principal engineer + revisore anti-debito + orchestratore multi-agent ELAB Tutor. NON COMPIACERE. NON simulare strumenti inesistenti. Honesty delta surface UPFRONT prima apply.

CONTESTO INGRESSO ITER 65 (verbatim)
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix
- HEAD origin: 44b618fa (8 commit iter 62 close + iter 63 P0.5 + iter 64 entrance)
- Vitest baseline canonical: 13249 PASS (13209 base + 40 NEW SketchBuilder iter 63 P0.5)
- Build PASS exit 0 6m37s 26 precache 1236.27 KiB
- Validator 94/94 PASS · 0 unresolved · 0 cyclic
- Codex CLI ~/.codex/config.toml: model="gpt-5.5", model_reasoning_effort="high", 17 plugins, 4 profiles (verify/review/implement/research)
- Arduino CLI v1.4.1 + core arduino:renesas_uno 1.5.3 installed Mac local
- REAL compile Blink Nano R4 PASS (Flash 39048/262144 + SRAM 3940/32768 EXACT BoardProfile match)
- Mac Mini ALIVE Tailscale 100.124.198.59 (uptime 4d11h M-series, autonomous DORMANT PATH C, repo ~/Projects/elab-tutor)
- NordVPN Threat Protection Pro™ EDR (TeamID W5W395V82Y) sometimes blocks pre-commit hook (Andrea allowlist Q6L2SF6YDW pending)
- ELAB Compile/Upload Agent MVP 70% (BoardProfile + SketchBuilder + Server skeleton + 40 tests, NO http binding, NO real upload UAT)

DUE PAROLE D'ORDINE coppia inseparabile

1. PRINCIPIO ZERO: docente tramite. UNLIM strumento docente. Studenti via LIM. Kit fisico SEMPRE protagonista. Volumi cartacei = canone (cita VERBATIM). Linguaggio plurale "Ragazzi,". 40 min lezione classe 20 studenti. Docente NON tecnico ZERO panico.

2. MORFISMO Sense 1+1.5+1.6+2:
- Sense 1 tecnico: piattaforma morfica runtime (57 ToolSpec + L1 composition + L2 template + L3 flag DEV)
- Sense 1.5 docente/classe: adattamento + memoria + stile + UI/finestre morfiche
- Sense 1.6 extended (Andrea iter 62 mandate): insegnante + sessioni passate + chat + voce + movimenti lavagna + errori ricorrenti + tempo disponibile + esperimento scelto + livello autonomia + materiale presente classe
- Sense 2 strategico: triplet coerenza SW ↔ kit Omaric ↔ volumi Davide (DUAL MOAT 2026+)

ARCO NARRATIVO CONTINUO Andrea FONDAMENTALE verbatim
"Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate."
Modalità Percorso + Passo Passo + transizioni rispettano continuità. Per ogni esperimento: cosa prima, cosa dopo, perché serve, concetto riprende, concetto prepara, componenti riutilizzati, competenza consolidata, micro-risultato.

NANO R4 + ELAB COMPILE/UPLOAD AGENT
NO cross-compilatore from scratch. SI ELAB Local Agent + Arduino CLI bridge.
- Renesas RA4M1 Cortex-M4 48MHz (NON AVR)
- FQBN arduino:renesas_uno:nanor4 (NON minima/unor4wifi/renesas_nano)
- Core arduino:renesas_uno + arm-none-eabi-gcc + dfu-util
- VIETATI: PORTB/PORTC/PORTD/DDRB/DDRC/DDRD/TCCR*/OCR*/TIMSK*

BLOCKLY (NOT mBlock)
Levello visuale ONLY → Generatore Arduino C++ separato → ELAB Local Agent → Arduino CLI ufficiale.

MULTI-AGENT ORCHESTRATION ITER 65+ — Andrea mandate "più cose orchestrate"

3 contexts ACTIVE:
1. MacBook Claude Code (this session) — orchestratore primario, spec/review/UX/narrative/docs
2. Mac Mini SSH delegation 100.124.198.59 — long-running tasks (vitest 8min + builds 14min + benchmarks + wiki batches + 92 esperimenti playwright)
3. Codex CLI/Desktop — implementazione proattiva parallel (worktree isolato)

FILE OWNERSHIP RIGID (anti-conflitto):
- Claude MacBook: src/components/ + docs/ + src/data/lesson-paths/* (narrative arc) + TEA/Nuovo lavoro tea/ + .impeccable.md
- Codex CLI/Desktop: src/services/elab-agent/ + tests/unit/elab-agent/ + supabase/functions/_shared/ (implementazione pure)
- Tea worktree parallel: src/data/lesson-paths/v3-* (review iter 58 T1) + TEA/Nuovo lavoro tea/iter-58-*.md
- Mac Mini: docs/unlim-wiki/ + scripts/ + tests/e2e/ (long-running) + benchmarks
- Andrea (manual): config/ + secrets + AGENTS.md + CLAUDE.md root (no agent touch)

WORKTREE CONVENTION ITER 65+:
- /elab-builder (primary feat/iter-41-sprint-u-cycle-2-real-user-fix MacBook Claude)
- /elab-builder-codex (NEW iter 65 — Codex parallel impl, branch feat/iter-65-codex-parallel)
- /elab-builder-tea (NEW iter 65+ if Tea active — branch feat/tea-vol3-review-iter-58)
- /elab-builder-watchdog (Sprint 4 eredità, keep dormant)
- Mac Mini ~/Projects/elab-tutor (SSH separate clone, branch feat/macmini-batch-iter-65)

SYNC BARRIERS (Pattern S race-cond fix):
- automa/team-state/messages/{agent}-iter{N}-{phase}-completed.md
- automa/state/heartbeat per agente
- Pre-merge: each agent OWN branch, PR to feature branch via gh pr create
- File ownership ZERO write conflict (Codex NEVER touches src/components, Claude NEVER touches src/services/elab-agent if Codex active)

PRIORITY WORK ITER 65+ — TUTTO incompiuto + NEW + test sistematico

P0.1 NordVPN allowlist Andrea (GUI 5 min): Threat Protection Pro → allowlist TeamID Q6L2SF6YDW + /Applications/Claude.app + /opt/homebrew/bin/node + git
P0.2 Codex plugin-cc install Andrea Claude Code interactive (5 min): /plugin marketplace add openai/codex-plugin-cc + /plugin install codex@openai-codex + /reload-plugins + /codex:setup
P0.3 Ratify queue 10 voci dismissed iter 62 (~30 min Andrea ratify groups via AskUserQuestion)
P0.4 ELAB Compile Agent COMPLETE iter 65 (~8h): server HTTP binding (Express/Fastify) + integration tests + Real Nano R4 USB UAT (Andrea hardware + double-tap reset + arduino-cli upload)
P0.5 B3 HomePage test guard (~4-6h): 4 DOM-text + Playwright toHaveScreenshot baseline (anti-regression iter 41 PM)
P0.6 B2 92 esperimenti Playwright UNO PER UNO entry 5-10 esp (~10-15h): skill elab-harness-real-runner + per-exp Codex C-V (Andrea iter 21+ mandate)
P0.7 verb-map-v2 expand IF ratify (~2-3h): 9 nuovi verbi (ripeti/segna/gira/conta/leggi/scrivi/ascolta/calcola/aspetta) STRICT case-sensitive
P0.8 Tea iter 58 T1-T5 relay + integration response (~30 min relay + ~2-3h integration if Tea delivered)
P0.9 cliffhanger_table.json wire-up Modalità Percorso (~4h Andrea mandate arco narrativo continuo)
P0.10 standard_experiment_schema.json validator (~2h): 79 lesson-paths audit conformity 7-step ferreo
P0.11 bibbia_stilistica.pdf design tokens → .impeccable.md (~1h)
P0.12 UI/UX overhaul Impeccable plugin systematic (~10-15h iter 65-66): /critique + /typeset + /colorize + /arrange + /polish + /harden + /animate + /delight + /onboard
P0.13 Fusion 3D kit physical verification Nano R4 + breadboard + components SVG (~6h if Andrea Autodesk Fusion access)
P0.14 Systematic test validation matrix tutto site (~20-30h multi-iter): vedi §SYSTEMATIC TEST MATRIX
P0.15 Repository evaluation 13 GitHub URLs (~6.5h BG Codex Desktop delegate)

ANTI-REGRESSIONE FERREO 4-gate per ogni commit
1. Vitest 13249+ PRESERVED (NEVER scendere baseline canonical)
2. npm run build PASS exit 0
3. Validator 94/94 PASS · 0 unresolved · 0 cyclic
4. Codex Pattern C-V 4-element CONFIRM per claim
Pre-commit + pre-push hook NEVER bypass (--no-verify SOLO con security urgency documented es. NordVPN EDR conflict iter 64)

ANTI-INFLAZIONE G45
- Score iter 65 target ONESTO: 9.2-9.3/10 G45 cap
- NO claim 9.5+ senza Opus indipendente review
- Honesty delta surface UPFRONT pattern iter 62: PDR 91 viol → reality 10, iter 63: Codex 7/8 not 8/8, iter 64: ELAB Agent 70% not 100%

START NOW iter 65 (sequenza esatta)
1. /ultrathink:ultrathink
2. /mem-search "iter 64 entrance multi-agent orchestration Codex Desktop Mac Mini SSH NordVPN"
3. /make-plan "iter 65+ orchestrazione multi-agent Mac Mini Codex Desktop UI/UX overhaul systematic test"
4. Read SESSION-ITER-65-ACTIVATION-V4-MASTER.md sezioni §1-§9
5. Read docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md (ADR shipped iter 62)
6. Andrea ratify queue 10 voci via AskUserQuestion (max 4 voci/turn)
7. Verify Mac Mini SSH alive (ping 100.124.198.59)
8. Verify Codex CLI gpt-5.5 active (cat ~/.codex/config.toml)
9. Setup worktree Codex parallel: git worktree add ../elab-builder-codex feat/iter-65-codex-parallel
10. Dispatch parallel work per file ownership rigid
```

---

## 1. CONTESTO COMPLETO ITER 62-64 SHIPPED

### 8 commit pushed origin (post c8a5842b iter 61 baseline)

| # | SHA | Type | Summary |
|---|---|---|---|
| 1 | `d2428e9d` | feat iter 62 B1.5 | Codemod 10 viol Vol1 STRICT case-sensitive (PDR 91 → reality 10 ONESTO) |
| 2 | `8a99b59c` | docs prep iter 62→63 | 6 file (activation + Tea audit + ELAB ADR + tasks + parking + roadmap) |
| 3 | `a4f8f7f9` | chore atoms cleanup | 44 atoms S2/S3/S6/S8 → done/sprint-S/ |
| 4 | `a1570046` | docs ricalibrazione | CLAUDE.md Mac Mini ALIVE + Codex CLI verify |
| 5 | `9306eab1` | chore baseline | 13209 sync |
| 6 | `be47eb0a` | feat iter 63 P0.5 | ELAB Compile Agent MVP (BoardProfile + SketchBuilder + Server + 40 tests + real arduino-cli Blink PASS) |
| 7 | `b608e537` | docs iter 64 entrance | Activation v3 + connettori automatici + volumi MD context |
| 8 | `44b618fa` | chore iter 63 P0.5 close | baseline 13249 sync + worktree cleanup merged |

### Deliverables iter 63 P0.5 ELAB Compile Agent MVP

- `src/boards/arduino-nano-r4.json` BoardProfile canonical (Renesas RA4M1 48MHz 256KB Flash 32KB SRAM + 20 forbidden AVR + ADC 14-bit + DAC 12-bit A0 + USB-C + LED D13 + uploadTool dfu-util)
- `src/services/elab-agent/sketch-builder.js` (~250 LOC) — createSketch + addInclude/Global/Setup/Loop/Function + buildSketch + validateNoForbidden + buildBlinkSketch + loadBoardProfile
- `src/services/elab-agent/server.js` (~290 LOC scaffold) — runArduinoCli spawn-safe + 7 error categories + handleHealth/Boards/Compile/Upload + ERROR_MESSAGES_DOCENTE Italian
- `tests/unit/elab-agent/sketch-builder.test.js` (40 tests PASS)

### Real Arduino CLI integration test PASS

- `arduino-cli core install arduino:renesas_uno` v1.5.3 installed Mac
- `arduino-cli compile --fqbn arduino:renesas_uno:nanor4` Blink exit 0
- Flash 39048/262144 bytes (14%) → BoardProfile flashKB 256 EXACT match
- SRAM 3940/32768 bytes (12%) → BoardProfile sramKB 32 EXACT match

### Mac Mini status

- Tailscale 100.124.198.59 ALIVE (uptime 4d11h M-series Darwin arm64)
- Repo `~/Projects/elab-tutor` clone + 8 scripts `~/scripts/`
- Autonomous loop v2 5331 LOC ready MA dormant PATH C (NOT registered launchctl, manual SSH ad-hoc)
- SSH `~/.ssh/id_ed25519_elab` user `progettibelli`
- Skill `elab-macmini-controller` per delegation

### Codex CLI status verified iter 62 close

```toml
# ~/.codex/config.toml
model = "gpt-5.5"
model_reasoning_effort = "high"
# 17 plugins: superpowers + supabase + vercel + cloudflare + build-web-apps + coderabbit + canva + github + documents + spreadsheets + presentations + circleci + zotero + life-science-research + browser-use + latex-tectonic + openai bundled/primary-runtime
# 4 profiles ELAB iter 42:
[profiles.verify]      # medium read-only
[profiles.review]      # high read-only
[profiles.implement]   # high workspace-write
[profiles.research]    # high workspace-write + network
```

---

## 2. ANDREA MANDATE FONDAMENTALE verbatim (rinforzo continuo)

### PRINCIPIO ZERO pedagogico
Docente è tramite NON operatore. UNLIM strumento docente. Studenti SOLO via LIM proiettata. Kit fisico SEMPRE protagonista. Volumi cartacei = canone (cita VERBATIM Vol/pag). Linguaggio plurale "Ragazzi,". 40 min lezione classe 20 studenti. Docente NON tecnico ZERO panico.

### MORFISMO extended (oltre tecnico) Sense 1.6
Adattamento piattaforma al contesto:
- insegnante (memoria + stile + esperienza)
- livello classe (età studenti + competenza accumulata)
- sessioni passate (memoria persistente Supabase)
- chat precedenti
- voce (TTS Voxtral + STT CF Whisper)
- movimenti sulla lavagna (DrawingOverlay tracking)
- errori ricorrenti (pattern detection)
- tempo disponibile (40 min default)
- esperimento scelto (lesson-paths active)
- livello autonomia studenti
- materiale reale classe (kit Omaric base/avanzato/custom)

Modulare + testabile: Context Adapter + Lesson State + Student/Teacher Profile + Session Memory + Error Pattern + Adaptive Hint.

### ARCO NARRATIVO CONTINUO Andrea mandate FONDAMENTALE verbatim
"Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate."

Modalità Percorso + Passo Passo + transizioni rispettano continuità. Per ogni esperimento:
- cosa arriva prima
- cosa arriva dopo
- perché serve nella storia didattica
- concetto riprende
- concetto prepara
- componenti riutilizzati
- competenza consolidata
- micro-risultato

Reference data: `TEA/Nuovo lavoro tea/cliffhanger_table.json` (30 KB Tea-authored) + `narrative_map.json` (56 KB).

### NANO R4 DECISIONE TECNICA Andrea verbatim
NO cross-compilatore from scratch. SI **ELAB Compile/Upload Agent locale** + Arduino CLI bridge ufficiale Arduino.

- Renesas RA4M1 Cortex-M4 48 MHz (NON AVR ATmega328p)
- 256 KB Flash + 32 KB SRAM + ADC 14-bit + DAC 12-bit
- FQBN: `arduino:renesas_uno:nanor4` (NON minima/unor4wifi/renesas_nano)
- Core: `arduino:renesas_uno`
- Toolchain: `arm-none-eabi-gcc` + `dfu-util`
- VIETATI registri AVR: PORTB/PORTC/PORTD/DDRB/DDRC/DDRD/TCCR/OCR/TIMSK

### BLOCKLY (NOT mBlock)
Blockly = libreria open source integrata ELAB Tutor. Levello visuale ONLY. NO mBlock (programma Makeblock separato). Decisione produttiva: restare su Blockly salvo prove contrarie.

### TEA RESPONSABILITÀ CHIARE iter 65+
- Owner UX docente (Modalità Percorso/Passo Passo narrative continuity)
- Owner volumi alignment (Vol3 review iter 58 T1)
- Owner schema canonical (`standard_experiment_schema.json` 7-step enforcement)
- Owner style bible (`bibbia_stilistica.pdf` design tokens authority)
- Owner UAT (usabilità test docente target kit fisico reale)
- Co-dev parallel worktree dedicato (NO conflict Andrea worktree)

---

## 3. MULTI-AGENT ORCHESTRATION ITER 65+ NEW MANDATE

### 3.1. 3 contexts ACTIVE

| Context | Tool | Role | Strengths |
|---|---|---|---|
| **MacBook Claude Code** | claude CLI | Orchestratore primario | Spec + review + UX + narrative + docs + product reasoning |
| **Mac Mini SSH** | SSH delegation | Long-running tasks | vitest 8min + builds 14min + benchmarks + wiki batches + 92 esp playwright |
| **Codex CLI/Desktop** | codex CLI 0.128.0 gpt-5.5 | Implementazione proattiva | Refactoring + tests + review avversaria + bug hunt + edge cases + patch piccole |

### 3.2. FILE OWNERSHIP RIGID (anti-conflitto critico)

| Path | Owner | Rationale |
|---|---|---|
| `src/components/*` (UI/UX) | **Claude MacBook** | Product reasoning + UX didattica |
| `src/data/lesson-paths/*` | **Claude MacBook** + Tea worktree | Narrative arc + verbatim citation |
| `docs/*` | **Claude MacBook** | Architettura + audit + handoff |
| `.impeccable.md` | **Claude MacBook** | Design context authority |
| `TEA/Nuovo lavoro tea/*.md` | **Tea worktree** | Tea consegne iter 58 T1-T5 |
| `src/services/elab-agent/*` | **Codex CLI/Desktop** | Implementazione pure (server HTTP + tests integration + real upload UAT) |
| `tests/unit/elab-agent/*` | **Codex CLI/Desktop** | Test coverage iter 63 P0.5 ELAB Compile Agent |
| `supabase/functions/_shared/*` | **Codex CLI/Desktop** | Edge Functions backend |
| `docs/unlim-wiki/*` | **Mac Mini** (SSH wiki batch) | Wiki concepts batch overnight |
| `scripts/*` | **Mac Mini** + Codex | Build scripts + bench runners |
| `tests/e2e/*` | **Mac Mini** (Playwright headless) | E2E 92 esperimenti UNO PER UNO |
| `AGENTS.md` | **Andrea only** | Shared instructions, manual edit |
| `CLAUDE.md` | **Andrea only** | Project memory root, manual edit |
| `config/*` + secrets | **Andrea only** | Security |

### 3.3. WORKTREE CONVENTION ITER 65+

```bash
# Primary MacBook Claude
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder
  branch: feat/iter-41-sprint-u-cycle-2-real-user-fix

# NEW iter 65: Codex parallel impl
git worktree add ../elab-builder-codex feat/iter-65-codex-parallel
  → /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-codex
  branch: feat/iter-65-codex-parallel (off feat/iter-41-*)

# NEW iter 65 IF Tea active: Tea parallel review
git worktree add ../elab-builder-tea feat/tea-vol3-review-iter-58
  → /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-tea
  branch: feat/tea-vol3-review-iter-58

# Mac Mini SSH separate clone (already exists)
ssh progettibelli@100.124.198.59 'cd ~/Projects/elab-tutor && git checkout -b feat/macmini-batch-iter-65'

# Active worktrees inventory (post iter 64 close cleanup wireup + fumetto)
- /elab-builder (primary)
- /elab-builder-codex (NEW)
- /elab-builder-tea (NEW if Tea)
- /elab-builder-watchdog (Sprint 4 eredità keep)
- /elab-builder-final (detached scratch)
- 5× /.claude/worktrees/agent-* (sprint atomic legacy)
- Mac Mini ~/Projects/elab-tutor (separate clone)
```

### 3.4. SYNC BARRIERS Pattern S race-cond fix

Filesystem barriers per agent completion signal:
```bash
automa/team-state/messages/{agent}-iter{N}-{phase}-completed.md
# es. claude-iter65-phase1-completed.md
#     codex-iter65-phase1-completed.md
#     tea-iter65-phase1-completed.md
#     macmini-iter65-phase1-completed.md
```

Heartbeat per agent active:
```bash
automa/state/heartbeat-{agent}.json  # JSON {ts, branch, work_in_progress, last_commit}
```

Pre-merge protocol:
1. Agent commits to OWN worktree branch
2. Push origin OWN branch
3. `gh pr create --base feat/iter-41-sprint-u-cycle-2-real-user-fix --head feat/iter-65-{agent}-*`
4. Claude orchestratore merge after 4-gate FERREO + Codex C-V verify
5. Squash-merge preferred (clean history)

### 3.5. CODEX DESKTOP/CLI delegation pattern

```bash
# A. Local CLI Pattern C 4-element (already setup)
cat > /tmp/codex-task.txt <<'EOF'
GOAL: <verifiable outcome 1-sentence>
CONTEXT: @file:line + iter context
CONSTRAINTS: NO SKILL.md, cite file:line, ERE not BRE, cap N lines
DONE: N-section verdict structure
EOF

# Verify profile (read-only)
codex exec -p verify "$(cat /tmp/codex-task.txt)" > /tmp/codex-out.txt 2>&1

# Implement profile (workspace-write isolated worktree)
cd ../elab-builder-codex
codex exec -p implement "$(cat /tmp/codex-task.txt)" > /tmp/codex-impl.txt 2>&1

# B. Codex plugin-cc Claude Code interactive (post Andrea install)
/codex:review        # standard code review
/codex:adversarial-review  # challenge review
/codex:rescue        # BG long-running delegation Codex
```

### 3.6. MAC MINI SSH delegation pattern (PATH C dormant + ad-hoc)

```bash
# Ping verify
ping -c 3 100.124.198.59

# Wiki batch overnight (Mac Mini sleep-safe long-running)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  '~/scripts/elab-wiki-batch-gen-v2.sh "concept-1 concept-2 concept-3"'

# Vitest full sync (delegated, MacBook free for orchestration)
ssh ... 'cd ~/Projects/elab-tutor && git pull && npx vitest run > ~/Library/Logs/elab/vitest-$(date +%s).log 2>&1'

# Build heavy delegated (~14min, frees MacBook)
ssh ... 'cd ~/Projects/elab-tutor && npm run build > ~/Library/Logs/elab/build-$(date +%s).log 2>&1'

# 92 esperimenti Playwright UNO PER UNO (B2 P0.6 iter 65)
ssh ... 'cd ~/Projects/elab-tutor && npx playwright test tests/e2e/29-92-esperimenti-audit.spec.js --reporter=json > ~/Library/Logs/elab/e2e-playwright-$(date +%s).log 2>&1'

# Skill in-Claude alternative
# elab-macmini-controller for higher-level task queue dispatch
```

### 3.7. ANTI-CONFLITTO rules ITER 65+

1. **NO 2 agents same file write** — enforced via file ownership matrix §3.2
2. **NO concurrent push same branch** — each agent OWN branch + PR merge
3. **NO mid-write git rebase/reset** — atomic commits per worktree
4. **NO uncommitted state cross-worktree** — verify `git status` clean prima switch
5. **Heartbeat ping ogni 30 min** — verify Mac Mini SSH alive + branch sync
6. **Mac Mini PATH C dormant** — manual SSH ad-hoc ONLY, NO autonomous cron (anti-debito)
7. **Codex Desktop sessione separata** — NO Claude Code session shared (different window/process)
8. **Lock file convention**: prima edit critical file, `touch automa/locks/{file-path}.lock` (manual lock IF concurrent risk)

---

## 4. SYSTEMATIC TEST VALIDATION MATRIX (ogni parte site)

### 4.1. Test layers gerarchici

| Layer | Tool | Scope | Frequency | Owner |
|---|---|---|---|---|
| **Unit** | Vitest | <50ms isolated funzioni | Pre-commit hook | Codex (src/services/elab-agent) + Claude (src/components) |
| **Integration** | Vitest | <500ms cross-module | Pre-commit hook | Codex (Edge Functions + arduino-cli mock) |
| **E2E** | Playwright | <10s browser flow | Pre-push hook + nightly | Mac Mini (tests/e2e/*) |
| **Smoke prod** | Playwright + Control_Chrome | live prod elabtutor.school | Post-deploy + daily | Claude orchestratore |
| **Real hardware** | arduino-cli + USB | Nano R4 reale compile + upload | Andrea iter 65+ | Andrea + Claude verify |
| **Visual regression** | Playwright toHaveScreenshot | UI baseline diff | Pre-push hook B3 P0.5 iter 65 | Claude (B3 HomePage) |
| **Lighthouse** | lighthouse CI | perf + a11y + SEO + BP | Pre-deploy iter 65+ | Claude (P2.2 iter 38 carryover) |
| **Accessibility** | axe-playwright + WCAG manual | AA 4.5:1 + touch 44x44 | Pre-deploy iter 65+ | Claude + Tea UAT |
| **Cross-browser** | Playwright projects | Chrome + Safari + Firefox + Edge | Weekly Mac Mini | Mac Mini delegation |
| **Mobile/tablet** | Playwright emulated viewport | iPhone + iPad + Android | Weekly Mac Mini | Mac Mini delegation |
| **Offline PWA** | Playwright + service worker disable network | Functional offline | Pre-deploy | Claude |
| **GDPR audit** | Manual + axe + storage inspector | Privacy + ToS + cookie + data residency | Quarterly | Andrea + Claude |
| **Security** | OWASP top 10 + dependency audit + secret scan | `npm audit` + git-secrets + Semgrep | Pre-deploy + monthly | Codex (security-auditor agent) |
| **Performance** | bench scripts + R5/R6/R7 fixture | UNLIM quality + latency p95 | Iter close gate | Mac Mini bench runner |

### 4.2. 92 esperimenti UNO PER UNO matrix (Andrea iter 21+ mandate Sprint T close gate)

```bash
# Per ogni esperimento (v{1|2|3}-cap{N}-esp{M}):
1. Mount esperimento → Playwright check componenti SVG presenti
2. Verifica componenti vs BoardProfile + kit Omaric reale (Fusion 3D check P0.13)
3. Compile codice Arduino con arduino-cli real (Compile Agent iter 65 LIVE)
4. Verify wire connections vs schema canonical (cliffhanger_table)
5. UNLIM context test: cita Vol/pag VERBATIM
6. Linguaggio plurale "Ragazzi," check
7. Screenshot baseline Playwright toHaveScreenshot
8. Smoke test prod live elabtutor.school

# Output per ogni esp:
docs/audits/iter-{N}-esp-{id}-validation.md
{ ok: true/false, violations: [...], evidence: screenshot.png }

# Skill: elab-harness-real-runner
# Mac Mini SSH delegation (long-running ~5-10 min per esp × 92 = ~8-15h totale, multi-iter)
```

### 4.3. UI/UX overhaul matrix (Impeccable plugin + Fusion 3D + awesome lists)

| Aspect | Tool | Skill | Frequency | Output |
|---|---|---|---|---|
| **Design critique** | Impeccable | `/impeccable:critique` | Pre-merge UI changes | quantitative scoring + persona test |
| **Typography** | Impeccable | `/impeccable:typeset` | UI overhaul | font/spacing/hierarchy refinement |
| **Colorize** | Impeccable | `/impeccable:colorize` | Brand alignment | palette enforcement Navy/Lime/Orange/Red |
| **Layout arrange** | Impeccable | `/impeccable:arrange` | Component restructure | grid + alignment + balance |
| **Polish** | Impeccable | `/impeccable:polish` | Pre-deploy | finishing touches + edge cases |
| **Harden** | Impeccable | `/impeccable:harden` | Pre-prod | resilience + error states + loading states |
| **Animate** | Impeccable | `/impeccable:animate` | Engagement features | purposeful micro-interactions |
| **Delight** | Impeccable | `/impeccable:delight` | Whimsy moments | error states + empty states friendly |
| **Onboard** | Impeccable | `/impeccable:onboard` | New user flow | docente first-time experience |
| **Distill** | Impeccable | `/impeccable:distill` | Simplification | reduce cognitive load |
| **Adapt** | Impeccable | `/impeccable:adapt` | Responsive | mobile + tablet + LIM viewport |
| **Optimize** | Impeccable | `/impeccable:optimize` | Performance | Core Web Vitals lift |
| **Quieter** | Impeccable | `/impeccable:quieter` | Reduce noise | declutter UI |
| **Bolder** | Impeccable | `/impeccable:bolder` | Visual hierarchy | LIM front-class visibility |
| **Extract** | Impeccable | `/impeccable:extract` | Asset pipeline | logo + icons + components reuse |
| **Normalize** | Impeccable | `/impeccable:normalize` | Style consistency | atomic design tokens enforcement |
| **Overdrive** | Impeccable | `/impeccable:overdrive` | Premium polish | iterative perfection |
| **Audit** | Impeccable | `/impeccable:audit` | Compliance | accessibility + brand + UX heuristics |
| **Kit physical 3D** | **Autodesk Fusion 3D** | manual Andrea | Component verification | NanoR4Board SVG vs CAD model verify |
| **Awesome lists** | github.com/sindresorhus/awesome-* | manual | Discovery | tools/libraries selection (UI design + a11y + perf) |
| **Frontend-design** | impeccable plugin | `/impeccable:frontend-design` | New component | distinctive production-grade UI |

### 4.4. Test execution schedule iter 65+

```
DAILY (cron / on-commit):
- Pre-commit: vitest baseline + validator
- Pre-push: quick regression check
- Post-deploy smoke: Playwright + curl prod

WEEKLY (Mac Mini delegation Saturday overnight):
- Full E2E 92 esperimenti (~8-15h)
- Visual regression baseline refresh
- Cross-browser projects sync
- Bench R5+R6+R7 stress 50 prompts
- Lighthouse + a11y axe-playwright

ITER CLOSE (mandatory gate):
- All 4-gate FERREO (vitest + build + validator + Codex C-V)
- Manual UAT Andrea: Real Nano R4 upload + 5 esperimenti chain
- Visual regression diff approval
- Score G45 cap ONESTO

QUARTERLY:
- Security audit OWASP + npm audit + Semgrep
- GDPR data residency check
- Dependencies upgrade audit (legacy-modernizer)
```

---

## 5. CONNETTORI AUTOMATICI ITER 65+

### 5.1. Codex CLI commands cheat sheet

```bash
# Verify Codex ready
~/.npm-global/bin/codex --version  # → 0.128.0
cat ~/.codex/config.toml | head -5

# 4 profiles
codex exec -p verify "<prompt>"      # medium read-only
codex exec -p review "<prompt>"      # high read-only
codex exec -p implement "<prompt>"   # high workspace-write
codex exec -p research "<prompt>"    # high workspace-write + network

# Pattern C 4-element invocation (stdin pipe ALWAYS, NEVER $(cat))
cat /tmp/codex-prompt.txt | ~/.npm-global/bin/codex exec --skip-git-repo-check --sandbox read-only -C "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" > /tmp/codex-out.txt 2>&1

# 5 templates riusabili scripts/dev/codex-prompts/
ls scripts/dev/codex-prompts/
# verify-anti-regression.txt + verify-codegen-output.txt + verify-lesson-path-edit.txt + verify-linguaggio-codemod.txt + verify-morfismo-compliance.txt
```

### 5.2. Codex plugin-cc Claude Code-side (Andrea install iter 65 entrance)

```text
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

3 commands attivati:
- `/codex:review` — standard review (mid-PR)
- `/codex:adversarial-review` — challenge review (pre-merge)
- `/codex:rescue` — **BG long-running task delegation Codex** (CRITICAL for iter 65+ parallel work)

### 5.3. Mac Mini SSH delegation

```bash
# Verify alive
ping -c 3 100.124.198.59

# SSH delegation general
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'cd ~/Projects/elab-tutor && <command>'

# Skill in-Claude
# elab-macmini-controller — SSH delegation high-level task queue
```

### 5.4. control_mac MCP osascript

```javascript
// Open Finder folder
mcp__Control_your_Mac__osascript({ script: 'tell application "Finder" to open POSIX file "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"' })

// Open Autodesk Fusion 3D
mcp__Control_your_Mac__osascript({ script: 'tell application "Fusion 360" to activate' })

// Open Codex Desktop
mcp__Control_your_Mac__osascript({ script: 'tell application "Codex" to activate' })

// Verify EDR (NordVPN)
mcp__Control_your_Mac__osascript({ script: 'do shell script "ls /Applications/NordVPN.app && systemextensionsctl list | head -20"' })
```

### 5.5. Claude_in_Chrome MCP (DOM-aware browser)

```javascript
// List tabs
mcp__Claude_in_Chrome__tabs_context_mcp()

// Navigate smoke prod
mcp__Claude_in_Chrome__navigate({ tabId: X, url: "https://www.elabtutor.school" })

// Extract page text (B3 HomePage guard 4 DOM-text)
mcp__Claude_in_Chrome__get_page_text({ tabId: X })

// Console errors (smoke test)
mcp__Claude_in_Chrome__read_console_messages({ tabId: X })

// Screenshot evidence (B3 baseline)
mcp__Claude_in_Chrome__computer({ action: "screenshot", tabId: X })

// Click testing
mcp__Claude_in_Chrome__find({ ... })
mcp__Claude_in_Chrome__computer({ action: "click", ... })
```

### 5.6. ELAB-specific 17 Skills

| Skill | Use case iter 65+ |
|---|---|
| `elab-harness-real-runner` | B2 92 esperimenti UNO PER UNO Playwright |
| `elab-macmini-controller` | SSH delegation task queue |
| `elab-quality-gate` | Pre/post session score card |
| `elab-benchmark` | 30 metric audit oggettivo |
| `elab-rag-builder` | RAG sistema da volumi PDF |
| `arduino-simulator` | Compatibility iter 63 P0.5 SketchBuilder |
| `tinkercad-simulator` | Defer Sprint V |
| `nano-breakout` | NanoR4Board SVG aggiornamento specs reali |
| `ricerca-tecnica` | Investigation Codex+Claude joint |
| `ricerca-marketing` | Competitor analysis |
| `ricerca-bug` | Hypothesis-driven debug |
| `ricerca-idee-geniali` | Brainstorm iter close |
| `claude-mem:make-plan` | iter 65+ plan |
| `claude-mem:mem-search` | recovery ultime 10 sessioni |
| `claude-mem:pathfinder` | exploration |
| `claude-mem:learn-codebase` | onboarding context |
| `superpowers:test-driven-development` | TDD RED→GREEN |
| `superpowers:verification-before-completion` | claim verify pre-claim |
| `superpowers:brainstorming` | requirements exploration |
| `impeccable:critique` + 19 altri impeccable commands | UI/UX systematic overhaul |
| `agent-teams:team-spawn` | parallel review/debug/feature |
| `firecrawl:firecrawl-search` | web research alternative WebFetch |

### 5.7. Anthropic Skills

```text
/anthropic-skills:pdf            # PDF read/merge/split/extract
/anthropic-skills:docx           # Word doc create
/anthropic-skills:pptx           # PowerPoint create (sales material)
/anthropic-skills:xlsx           # Excel sheets
/anthropic-skills:web-artifacts-builder
/anthropic-skills:skill-creator
/anthropic-skills:brand-guidelines  # Brand consistency
```

### 5.8. ELAB Compile Agent shipped iter 63 P0.5 use

```javascript
import { loadBoardProfile, buildBlinkSketch, validateNoForbidden } from './src/services/elab-agent/sketch-builder.js';
import { handleHealth, handleBoards, handleCompile, handleUpload } from './src/services/elab-agent/server.js';

const profile = loadBoardProfile('arduino-nano-r4');
const code = buildBlinkSketch({ delayMs: 500 });
const { ok, violations } = validateNoForbidden(code, profile);
const result = await handleCompile({ code, boardId: 'arduino-nano-r4' });
// → { ok: true, jobId, sketchDir, buildDir, stdout: "Flash 39048/262144..." }
```

---

## 6. VOLUMI MD context per UNLIM citation VERBATIM

### Paths Volumi MD (Tea OCR)

```bash
TEA/MANUALE VOLUME 1 ITALIANO.pdf/markdown.md       # Vol1 full
TEA/MANUALE VOLUME 2 ITALIANO.pdf/markdown.md       # Vol2 full
TEA/Manuale vol 3 versione 0.13.pdf/markdown.md     # Vol3 v0.13 latest
# +3 versioni alternative + per-page subdirs
# Total ~46696 LOC
```

### Paths PDF originali

```bash
CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf  # 27MB Vol1
CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf   # 17MB Vol2
CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf      # 18MB Vol3 (Tea v0.13 newer)
```

### Schema canonico Tea (7-step ferreo)

```bash
TEA/Nuovo lavoro tea/standard_experiment_schema.json  # 7 step canonical (setup/ipotesi/costruzione/misura/variazione/conclusione/trasferimento)
TEA/Nuovo lavoro tea/cliffhanger_table.json           # 30 KB transizioni narrative arc
TEA/Nuovo lavoro tea/narrative_map.json               # 56 KB mappa narrativa
TEA/Nuovo lavoro tea/esp_v1_cap6_esp1_canonico.md     # golden esempio
TEA/Nuovo lavoro tea/bibbia_stilistica.pdf            # 65 KB style bible
TEA/Nuovo lavoro tea/mascotte_unlim.svg + _canonica.md
TEA/Nuovo lavoro tea/fumetto_schema.json              # 12 KB report fumetto
```

### Pattern UNLIM cite verbatim

```javascript
const response = `Ragazzi, oggi vediamo cosa succede quando colleghiamo il LED nel verso giusto.
Come dice il libro a Vol.1 pag.24: "Il LED ha un piedino lungo (l'anodo) e uno corto (il catodo)."
Aprite il kit ELAB e prendete il LED rosso del vostro kit Omaric.`;
```

### Citation format canonical

- `"Vol.X pag.Y"` (es. "Vol.1 pag.24")
- `"Capitolo X"` + nome canonico (es. "Capitolo 6 — I LED")
- `"esperimento X.Y"` (es. "esperimento 6.1 — Primo LED")
- Lesson-paths ID: `v{1|2|3}-cap{N}-esp{M}`

---

## 7. REPOSITORY EVALUATION 13 GITHUB URLs (P0.15 Codex Desktop delegate)

Andrea mandate: valuta + selective install (NO clone tutto ciecamente). Per ogni repo produci:
- Utilità ELAB Tutor
- Rischio
- Licenza
- Installabilità
- Cosa prendere
- Cosa evitare

```text
1. https://github.com/gsd-build (context engineering)
2. https://github.com/gsd-build/gsd-2 (spec-driven dev)
3. https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md (methodology)
4. https://github.com/topics/claude-code-communication (workflow patterns)
5. https://github.com/fcakyon/claude-codex-settings (ispirazione skill/hook)
6. https://github.com/openai/codex-plugin-cc (OFFICIAL Codex inside Claude Code) — Apache-2.0 install RACCOMANDATO
7. https://github.com/karpathy (philosophy)
8. https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md (anti-bloat)
9. https://github.com/lucasastorian/llmwiki (knowledge base local)
10. https://github.com/ching-kuo/claude-codex (orchestration patterns)
11. https://github.com/catlog22/Claude-Code-Workflow (workflow templates)
12. https://github.com/shakacode/claude-code-commands-skills-agents/blob/main/docs/claude-code-with-codex.md (OFFICIAL integration docs)
13. https://github.com/pnnl/agile-workflows (workflow inspiration)
```

NEW iter 65+ aggiunto:
```text
14. https://github.com/sindresorhus/awesome-* (curated lists UI design + a11y + perf)
15. Autodesk Fusion 3D — closed source MA Andrea ha access (kit physical verification SVG vs CAD)
```

Delegation Codex Desktop: per-repo evaluation ~30 min × 15 = ~7.5h totale, BG delegation.

---

## 8. PENDENTI ITER 65 ANDREA ACTION (in ordine)

| # | Action | Owner | Time | Priority |
|---|---|---|---|---|
| 1 | NordVPN allowlist Q6L2SF6YDW + Claude.app + node + git | Andrea NordVPN GUI | 5 min | P0 BLOCKING |
| 2 | Codex plugin-cc install `/plugin marketplace add openai/codex-plugin-cc` | Andrea Claude Code interactive | 5 min | P0 |
| 3 | Paste activation v4 SESSION-ITER-65-ACTIVATION-V4-MASTER.md in nuova sessione | Andrea | 1 min | P0 |
| 4 | Ratify queue 10 voci dismissed iter 62 | Andrea + Claude | 30 min | P0 |
| 5 | Setup worktree Codex parallel `git worktree add ../elab-builder-codex feat/iter-65-codex-parallel` | Claude | 2 min | P0 |
| 6 | Real Nano R4 USB upload UAT (connect + double-tap reset + arduino-cli upload Blink real) | Andrea + Claude verify | 30 min | P1 |
| 7 | Tea iter 58 T1-T5 dispatch Tea (relay brief details) | Andrea relay Tea | 10 min | P1 |
| 8 | Impeccable plugin install | Andrea | 5 min | P1 |
| 9 | Fusion 3D access verify (Andrea Autodesk) | Andrea | 2 min | P2 |
| 10 | 13+2 GitHub repos eval Codex Desktop delegate BG | Claude orchestratore | 7.5h BG | P2 |

---

## 9. ANTI-PATTERN NON FARE iter 65+

- `git add -A` (specific paths only)
- `--no-verify` (SOLO security urgency documented es. NordVPN EDR conflict)
- push main diretto
- `git stash` con loop
- Codex query 1-line (4-element template obbligatorio)
- BRE `\|` regex (use ERE `(a|b|c)`)
- heredoc Codex (stdin pipe SOLO pattern)
- `/ultrareview` Claude-launch (Andrea trigger ONLY)
- mock/dati finti (tutto reale, feedback_no_demo.md)
- Galileo (è UNLIM)
- parafrasare volumi (cita VERBATIM Vol/pag)
- inventare numeri (CoV ogni claim)
- self-rate (benchmark `node scripts/benchmark.cjs` UNICO)
- claim senza Codex C-V
- score inflation (G45 cap rigoroso)
- esperimenti scollegati arco narrativo
- modifiche silenziose UX
- dipendenze npm senza Andrea OK
- ELAB Compile Agent claim "100% LIVE" senza Andrea Nano R4 reale upload PASS
- 2 agents same file write concurrent (file ownership rigid)
- Mac Mini autonomous cron iter 65 (PATH C dormant + manual SSH ad-hoc only)
- Codex Desktop SAME Claude Code session (separate window/process MANDATORY)
- Worktree branch share (each agent OWN branch + PR merge)

---

## 10. SCORE PROGRESSION TARGET ONESTO G45 cap

| Iter | Score target | Conditional |
|---|---|---|
| iter 62 close ✅ DONE | **8.9/10** | 10 viol Vol1 + Mac Mini ALIVE + Codex verify + 5 commits clean |
| iter 63 P0.5 partial ✅ DONE | **9.0/10** | ELAB Compile Agent MVP 70% (BoardProfile + SketchBuilder + Server skeleton + 40 tests + real arduino-cli compile PASS) |
| iter 64 entrance ✅ DONE | **9.0/10** | Activation v3 paste-ready + connettori cheat + volumi MD context + worktree cleanup + baseline sync 13249 |
| **iter 65** target | **9.2/10** | Server HTTP binding + Real Nano R4 UAT + B3 HomePage guard + Tea T1-T5 dispatch + Impeccable install + Codex plugin-cc install |
| iter 66 | **9.3/10** | 10 esp B2 audit + Tea T1+T2 response integration + Glossario internal route + Lighthouse perf optim |
| iter 70 | **9.4/10** | 30+ esp B2 + Compile Agent beta scuole + Vol3 refactor + UI/UX overhaul phase 1 |
| iter 80 | **9.5/10** | 60+ esp + Vol3 final + 1 pilot scuola live + Fusion 3D verification + multi-classe dashboard |

**G45 mandate**: NO claim 9.5+ senza Opus indipendente review. Cap rigoroso ZERO override.

---

## 11. CROSS-LINK tutti file iter 62-64 close + iter 65+

### Activation files
- `SESSION-NEXT-ACTIVATION.md` (Andrea verbatim iter 63)
- `SESSION-ITER-64-ACTIVATION.md` (v3 connettori + volumi MD)
- `SESSION-ITER-65-ACTIVATION-V4-MASTER.md` (THIS file, v4 multi-agent orchestration)

### Plan + roadmap + parking
- `TASKS-RECOVERED.md` (backlog deduped P0-P4)
- `PARKING-LOT.md` (25+ anti-inflation deferred)
- `ROADMAP-30-DAYS.md` (oggi/48h/7g/30g concrete)

### Audit + handoff
- `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` (score 8.9)
- `docs/audits/2026-05-15-TEA-FOLDER-AUDIT.md` (Tea 30+ inventory)
- `docs/handoff/2026-05-15-iter-62-to-iter-63-handoff.md`

### Architecture
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` (Compile Agent ADR Nano R4)

### Code iter 63 P0.5 shipped
- `src/boards/arduino-nano-r4.json` (BoardProfile canonical)
- `src/services/elab-agent/sketch-builder.js` (~250 LOC)
- `src/services/elab-agent/server.js` (~290 LOC scaffold)
- `tests/unit/elab-agent/sketch-builder.test.js` (40 tests PASS)

### Tea consegne
- `TEA/iter-58-brief-tea.md` (T1-T5 task)
- `TEA/iter-58-brief-matteo.md` (Matteo onboarding)
- `TEA/PLAN-unlim-prof-pilot-chatgpt.md` (visione Andrea prossimi mesi)
- `TEA/Nuovo lavoro tea/*` (schema + cliffhanger + narrative map + bibbia stilistica + mascotte)
- `TEA/MANUALE VOLUME {1,2,3} ITALIANO.pdf/markdown.md` (OCR volumi Tea)

### Volumi PDF originali
- `CONTENUTI/volumi-pdf/VOL{1,2,3}*.pdf`

### Memory file
- `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/mac-mini-status-2026-05-15.md`
- `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` (index)

### Hooks + config
- `.githooks/pre-commit` (vitest gate)
- `.githooks/pre-push` (regression check)
- `~/.codex/config.toml` (model gpt-5.5 + 17 plugins + 4 profiles ELAB)

### Mac Mini (SSH separate clone)
- `~/Projects/elab-tutor` (repo Mac Mini)
- `~/scripts/elab-mac-mini-autonomous-loop-v2.sh` (5331 LOC dormant PATH C)
- `~/scripts/elab-wiki-batch-gen-v2.sh` (wiki concepts)
- `~/Library/Logs/elab/*.log` (logs archive)

---

## 12. ESEMPI ORCHESTRAZIONE PRATICA ITER 65

### Esempio 1: Server HTTP binding (P0.4) + B3 HomePage guard (P0.5) parallel

```
ASSIGNMENT:
- Codex Desktop (worktree elab-builder-codex):
  - Implementa Express/Fastify wrapper src/services/elab-agent/server.js handlers
  - Write tests/unit/elab-agent/server.test.js integration tests con arduino-cli mock
  - Branch feat/iter-65-codex-server-http
  - Estimate ~4h

- Claude MacBook (primary):
  - Write B3 HomePage 4 DOM-text guard tests
  - Playwright toHaveScreenshot baseline capture
  - Branch feat/iter-65-claude-b3-homepage
  - Estimate ~4h

- Mac Mini (SSH):
  - Wiki batch overnight 5 new concepts (sensore-pir, encoder, stepper, accelerometro, bluetooth)
  - Branch feat/iter-65-macmini-wiki-batch
  - Estimate ~2h dispatch + ~6h overnight

SYNC barriers:
- automa/team-state/messages/codex-iter65-phase1-completed.md (Codex done)
- automa/team-state/messages/claude-iter65-phase1-completed.md (Claude done)
- automa/team-state/messages/macmini-iter65-phase1-completed.md (Mac Mini done)

MERGE order:
1. Codex PR review (Claude review prodotto + Codex C-V verify)
2. Claude PR review (Codex adversarial review)
3. Mac Mini PR merge (delta wiki concepts, no conflict)
4. Squash-merge all → feat/iter-41-sprint-u-cycle-2-real-user-fix
```

### Esempio 2: 92 esperimenti Playwright UNO PER UNO (P0.6 multi-iter)

```
DELEGATION Mac Mini:
ssh ... 'cd ~/Projects/elab-tutor && git checkout -b feat/iter-65-macmini-92esp && npx playwright test tests/e2e/29-92-esperimenti-audit.spec.js --workers=2 --reporter=json > ~/Library/Logs/elab/e2e-92esp-$(date +%s).log 2>&1 &'

# Mac Mini esegue ~5-10 min × 92 = ~8-15h overnight
# Pull risultato post-completion:
scp progettibelli@100.124.198.59:~/Library/Logs/elab/e2e-92esp-*.log /tmp/

# Per-esp Codex C-V verify
cat /tmp/codex-prompts/verify-esp-validation.txt | codex exec -p verify > /tmp/codex-verify.txt

# Commit ESP audit results to docs/audits/iter-65-92esp-batch1.md
```

### Esempio 3: UI/UX overhaul Impeccable systematic (P0.12)

```
SEQUENCE per ogni componente:
1. /impeccable:audit src/components/lavagna/LavagnaShell.jsx
   → JSON report violations
2. /impeccable:critique
   → quantitative scoring + persona test
3. /impeccable:typeset  → font hierarchy refinement
4. /impeccable:colorize → palette enforcement Navy/Lime/Orange/Red
5. /impeccable:arrange  → grid + alignment
6. /impeccable:polish   → finishing
7. /impeccable:harden   → error states + loading states
8. /impeccable:animate  → purposeful micro-interactions
9. Codex C-V verify lavagna 180/180 tests preserved
10. Playwright visual regression diff
11. Commit + PR review
```

---

## 13. NON COMPIACERE ULTIMA MEMO

- Score iter 65 ONESTO target 9.2/10. NO claim 9.5+ senza Opus indipendente review G45 mandate.
- Multi-agent orchestration UPFRONT honest scope: 3 contexts coordinati MA file ownership rigid. NO claim "8x speed" miracoloso.
- ELAB Compile Agent 70% iter 63 P0.5 → 90% iter 65 (Server HTTP + Real Nano R4 UAT). NO claim "LIVE prod" senza Andrea reale upload PASS.
- 92 esperimenti UNO PER UNO multi-iter completion (iter 65: 5-10 esp, iter 66-70: cascade). NO claim "Sprint T close" iter 65.
- 13+2 GitHub repos eval ~7.5h BG delegation. NO claim "all installed" iter 65 entrance.
- UI/UX overhaul Impeccable systematic multi-iter. NO claim "site redesigned" iter 65 single session.
- Fusion 3D access Andrea-side. NO Claude direct manipulation 3D models (defer Andrea + manual export verify).
- NordVPN Threat Protection Pro transient block possible. Pre-commit verified PASS questo session MA Andrea allowlist Q6L2SF6YDW iter 65+ preventivo.
- Mac Mini PATH C dormant ratificato iter 62 close. NO autonomous cron reactivate senza Andrea explicit + risk assessment.
- Tea iter 58 T1-T5 dispatch Andrea relay required (NOT auto-Claude write Tea files).
- Codex Desktop NUOVO context (NEW iter 65 mandate Andrea). Separate window/process Claude Code. NO shared session.
- Honesty delta surface UPFRONT: PDR claim → reality (iter 62 91→10, iter 63 P0.5 70% not 100%, iter 64 worktree force-remove safe but uncommitted).

---

## 14. CHIUSURA ITER 64 → ITER 65 ENTRANCE

8 commit pushed origin `44b618fa` HEAD. Sessione iter 62-63-64 prep COMPLETE.

**Iter 65 deliverable target close (5-7 PR)**:
1. PR Codex worktree: Server HTTP binding + integration tests
2. PR Claude MacBook: B3 HomePage guard + Playwright baseline
3. PR Mac Mini: 5-10 esp Playwright audit
4. PR Tea worktree (if active): T1+T2 Vol3 review response integration
5. PR Impeccable systematic: 3-5 componenti UI/UX overhaul
6. PR chore: baseline sync iter 65 close + worktree cleanup
7. PR audit + handoff iter 66

**Score iter 65 close target**: 9.2/10 ONESTO G45 cap.

Activation v4 paste-ready. Andrea action: NordVPN allowlist → Codex plugin-cc install → paste activation nuova sessione → ratify queue → execute parallel.
