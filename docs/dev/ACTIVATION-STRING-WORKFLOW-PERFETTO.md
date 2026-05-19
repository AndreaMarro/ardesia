# Activation String + Workflow Perfetto — Claude Code + Codex GPT-5.5 + MCP

> Versione 1.0 — 2026-05-15. Synthesis sessione iter 58-60 entrance (5 commit pushed origin, 11/12 Codex Pattern C-V PASS, 5 skill executed).
> Output target: paste-ready activation string + workflow description for future Claude Code sessions on ELAB Tutor (or similar product).

---

## 1. Workflow perfetto — pattern operativo

### 1.1 Pattern matrix Claude ↔ Codex GPT-5.5

| Pattern | Quando usarlo | Risultato atteso |
|---|---|---|
| **C-V (Claude leads, Codex verifies)** — DEFAULT | Ogni claim/score/commit/edit | Anti-inflation independent re-derivation |
| **V-C (Codex leads recon, Claude executes)** | Exhaustive grep enumeration | Codex grep-dump → Claude edits each hit |
| **C-C-V (Claude proposes + self-critiques + Codex arbitrates)** | High-stakes design decision | Triangulated decision (ADR-level) |
| **Sequential subagent + filesystem barrier** | Multi-agent parallel (race-cond fix Pattern S r3) | File ownership rigid + completion msgs barrier |
| **NEW iter 58 SKIP live-terminal Claude↔Codex via control_mac/MCP** | Andrea idea — REJECTED iter 58 verdict | codex-bg.sh sufficient auditable reproducible |

### 1.2 Codex prompt 4-element MANDATORY

```
GOAL: <one-sentence verifiable outcome>
CONTEXT: @file paths + iter context (1-3 lines max)
CONSTRAINTS:
  - Do NOT read any SKILL.md or skill files.
  - Cite file:line for every claim.
  - Run EXACTLY these commands: <numbered list, NO `\|` BRE regex — use ERE `(a|b|c)` instead>
  - Cap output <N> lines.
DONE: <N>-section verdict structure (numbered + line cap)
```

**Anti-failure guards** (bake into every prompt):
- `Do NOT read SKILL.md` (iter 57 burned runs)
- `node -e "..."` one-liners (NO heredoc — sandbox blocks)
- `rg -n PATTERN PATH1 PATH2` explicit paths (Codex ignores wider grep ban otherwise)
- Wait-loop anchor: `tokens used` line, NOT `CONFIRM/REFUTE` (echo matches prompt)
- ERE syntax `(a|b|c)` NOT BRE `\|` (iter 59 stdin failure mode)

### 1.3 Recursive anti-inflation loop

```
LOOP:
  1. Claude.claim = X with evidence E1
  2. Codex.claim = re-derive X from code/output (E2 independent, NOT from Claude's report)
  3. if Claude.claim == Codex.claim: accept = X
     else: Claude.investigate(divergence) → revise → GOTO 1
  4. accept = more_skeptical(Claude.claim, Codex.claim)
  5. cite_in_audit(Codex.output_file_path)
```

### 1.4 Recursive anti-regression loop (4-gate cascade)

```
GATES = [
  npx vitest run             # 0-failed, baseline <N> PRESERVED
  npm run build              # exit 0
  node scripts/epic1/validate-lesson-paths.mjs  # 94/94/0/0/0 (or project-specific gate)
  bash scripts/dev/codex-bg.sh verify-diff      # Pattern C-V CONFIRM
]

for change in proposed_changes:
  for gate in GATES:
    if gate.fails:
      fix() → re-run ALL 4 GATES (cascade: fix can break another)
  commit() with HEREDOC message + Co-Authored-By
```

Re-baseline test count ONLY with arithmetic proof. NEVER `--no-verify`. NEVER bypass pre-commit hook. NEVER push to `main`.

### 1.5 Pattern S r3 race-cond fix (multi-agent parallel)

When spawning 4+ subagent parallel:
1. **Phase 1**: dispatch all agents parallel (rigid file ownership disjoint)
2. **Filesystem barrier**: each agent writes completion msg `automa/team-state/messages/{agent}-iter{N}-phase1-completed.md` PRE-Phase-2 spawn
3. **Phase 2**: scribe/synthesizer sequential AFTER N/N completion msgs confirmed
4. **Phase 3**: orchestrator commit + push post-synthesis

Validated 9× consecutive iter 5 P1+P2, iter 6 P1, iter 8 r2, iter 11, iter 12 r2, iter 19, iter 36, iter 37, iter 58-60.

---

## 2. Plugin essenziali (Claude Code)

### 2.1 Skill organizzativi (process)
- **`superpowers:using-superpowers`** — meta-skill auto-loaded session start
- **`superpowers:writing-plans`** — structured plan before code touch
- **`superpowers:executing-plans`** — review-checkpoint execution
- **`superpowers:verification-before-completion`** — evidence before assertion (MANDATORY)
- **`superpowers:requesting-code-review`** — pre-merge gate
- **`superpowers:dispatching-parallel-agents`** — 2+ independent task dispatch
- **`superpowers:finishing-a-development-branch`** — merge/PR/cleanup decision
- **`superpowers:using-git-worktrees`** — isolated workspace

### 2.2 Skill prodotto (build)
- **`product-management:write-spec`** — PRD authoring (iter 59 used)
- **`product-management:brainstorm`** — pre-implementation exploration
- **`product-management:sprint-planning`** — iter scope decomposition
- **`documentation-generation:openapi-spec-generation`** — API contract (iter 59 used)
- **`documentation-generation:architecture-decision-records`** — ADR template
- **`generate-api-docs:generate-api-docs`** — human-readable API docs (iter 59 used)

### 2.3 Skill QA/audit (gating)
- **`elab-quality-gate`** — ELAB-specific 10 metrics (font/touch/UNLIM/bundle/console/LIM/WCAG)
- **`elab-morfismo-validator`** — palette + ToolSpec + lesson-paths Morfismo Sense 2
- **`elab-principio-zero-validator`** — PZ V3 runtime check
- **`elab-onniscenza-coverage`** — ToolSpec L0/L1/L2 coverage
- **`comprehensive-review:full-review`** — multi-dimensional 5-phase parallel review (heavy, use for big PR)
- **`code-review:code-review`** — single-pass review (lighter alternative)
- **`coderabbit:code-review`** — AI-powered specialized review

### 2.4 Skill orchestrator (coordination)
- **`ultrathink:ultrathink`** — Coordinator + 4-agent (Architect+Research+Coder+Tester) parallel (iter 60 used)
- **`agent-teams:team-spawn`** — preset team composition (review/debug/feature/fullstack/research/security/migration)
- **`agent-teams:team-feature`** — parallel feature build
- **`agent-teams:team-debug`** — hypothesis-driven debug
- **`claude-mem:make-plan`** — multi-phase plan with discovery
- **`claude-mem:do`** — execute plan
- **`claude-mem:mem-search`** — cross-session memory search

### 2.5 Skill design/UX
- **`impeccable:critique`** — UX evaluation quantitative scoring
- **`impeccable:colorize`** + **`impeccable:typeset`** + **`impeccable:arrange`** — design refinement
- **`impeccable:harden`** + **`impeccable:audit`** + **`impeccable:polish`**
- **`frontend-design:frontend-design`** — distinctive frontend code
- **`ui-design:design-review`** + **`accessibility-audit`** + **`create-component`**

### 2.6 Skill research
- **`firecrawl:firecrawl-search`** — web research up-to-date (vs WebSearch built-in)
- **`firecrawl:firecrawl-scrape`** — page content extraction
- **`firecrawl:firecrawl-crawl`** — site-wide crawl
- **`firecrawl:firecrawl-agent`** — research orchestrator
- **`context7:query-docs`** — library docs fetch (live)
- **`context7:resolve-library-id`** — library identifier resolver

### 2.7 Skill deploy/infra
- **`vercel:deploy`** — deploy command
- **`vercel:status`** — project status
- **`vercel:env`** — env var management
- **`supabase:supabase`** — supabase ops
- **`cicd-automation:github-actions-templates`** — CI workflow

---

## 3. Connettori MCP essenziali

### 3.1 Codex CLI (mandatory backbone)
- **Binary**: `~/.npm-global/bin/codex` (codex-cli 0.128.0)
- **Wrapper**: `scripts/dev/codex-bg.sh <task-name> --profile <profile> "<prompt 4-element>"`
- **Output**: `/tmp/codex-<task-name>.txt`
- **Profile**: `verify` (read-only audit) | other profiles available
- **GPT-5.5** model: state-of-art reasoning (reasoning_effort: high for verify, xhigh for hard tasks)

### 3.2 Memory persistence
- **claude-mem MCP** (`mcp__plugin_claude-mem_mcp-search__*`):
  - `search` / `smart_search` / `get_observations` / `timeline`
  - `prime_corpus` / `query_corpus` / `rebuild_corpus`
  - `memory_add` / `observation_add` / `observation_record_event`

### 3.3 Docs live
- **context7 MCP** (`mcp__plugin_context7_context7__*`):
  - `query-docs` / `resolve-library-id`
  - Critical: library docs may have changed since training cutoff
- **firecrawl MCP** (`mcp__firecrawl_*`): web research

### 3.4 Deploy + DB
- **Vercel MCP** (`mcp__57ae1081__*`): deploy_to_vercel + list_deployments + runtime_logs + build_logs
- **Supabase MCP** (`mcp__supabase__*`): db query + edge function deploy + secrets
- **Cloudflare MCP** (`mcp__308d0704__*`): DNS/D1/R2/KV/Workers/Hyperdrive

### 3.5 Live testing
- **Claude_in_Chrome** (`mcp__Claude_in_Chrome__*`): browser_batch + navigate + click + screenshot + javascript_tool + read_console_messages + read_network_requests
- **Control_Chrome** (`mcp__Control_Chrome__*`): execute_javascript + get_page_content
- **Claude_Preview** (`mcp__Claude_Preview__*`): preview_start/click/screenshot/console_logs (dev preview)
- **Macos MCP** (`mcp__Macos__*`): App/Click/Move/Snapshot/Shell/Type — system control
- **computer-use** (`mcp__computer-use__*`): screenshot + left_click + key + type + scroll — Mac desktop full control

### 3.6 IDE-adjacent
- **mermaid MCP** (`mcp__5d80555f__validate_and_render_mermaid_diagram`): diagram validation
- **pdf-viewer MCP**: display_pdf + interact + list_pdfs
- **acrobat MCP**: PDF annotation + extraction + OCR

### 3.7 Team productivity
- **Linear MCP** (`mcp__473f49d2__*`): issue tracking
- **Notion MCP** (`mcp__a3761d95__*`): docs + KB
- **Slack** plugin: channel-digest + summarize-channel
- **Atlassian** plugin: spec-to-backlog + status-report
- **Google Calendar MCP** (`mcp__6f973329__*`)
- **Fireflies MCP** (`mcp__426774f8__*`): call transcripts

---

## 4. Quality gating workflow

### 4.1 Pre-session gate
```bash
cd <project> && \
npx vitest run 2>&1 | tail -5 && \                          # gate baseline
node scripts/epic1/validate-lesson-paths.mjs 2>&1 | tail && \  # project-specific
npm run build 2>&1 | tail -5                                 # build
```

### 4.2 Per-commit gate (4-gate cascade)
```bash
# Pre-commit hook esegue automaticamente
[PRE-COMMIT] Quick regression check (baseline: N)
[PRE-COMMIT] ✓ N test PASS (baseline N)
```

### 4.3 Per-iter close
```bash
# Skill invocation
/elab-quality-gate post  # 10 metrics ELAB-specific
/comprehensive-review:full-review  # multi-dimensional 5-phase parallel (heavy)
# OR
/code-review:code-review  # lighter alternative
```

### 4.4 Pre-deploy gate
```bash
npm run build                                  # exit 0 + bundle size check
npx vercel --yes                               # preview (current branch)
# OR for production:
npx vercel --prod --yes                        # ONLY from main, ONLY post-merge PR
```

### 4.5 /ultrareview gate (user-triggered ONLY)
- `/ultrareview` (no arg) — bundles current branch local diff
- `/ultrareview <PR#>` — review GitHub PR
- Claude CANNOT launch (user-billed cloud review)
- Andrea triggers post Phase complete

---

## 5. Iteration workflow template

### 5.1 Iter entrance (CoV ingresso)
```
1. Read activation handoff (docs/handoff/<DATE>-iter-N-to-iter-N+1-handoff.md)
2. Verify branch + HEAD + Codex version
3. CoV: vitest baseline + build + validator
4. mem-search re-anchor (claude-mem)
5. Read previous close audit (docs/audits/...)
6. Andrea ratify queue review (if pending)
```

### 5.2 Iter execute
```
1. Pattern S r3 dispatch (if multi-agent parallel):
   - Phase 1: 4+ subagent BG (Architect + Research + Coder + Tester)
   - Phase 2: scribe/synthesizer post N/N completion barrier
   - Phase 3: orchestrator commit + push
2. Pattern C-V Codex verify EACH claim
3. 4-gate per commit (vitest + build + validator + Codex CONFIRM)
4. NEVER --no-verify, NEVER push main, NEVER git stash, NEVER git add -A
```

### 5.3 Iter close
```
1. Quality gate skill invocation (elab-quality-gate post)
2. Comprehensive review (5-phase parallel) OR code review (lighter)
3. Write close audit (docs/audits/<DATE>-iter-N-PHASE-X-close-audit.md)
4. Write handoff iter N+1 (docs/handoff/<DATE>-iter-N-to-iter-N+1-handoff.md)
5. Update CLAUDE.md sprint history section
6. Score G45 ONESTO cap (NO inflation)
7. Commit + push origin (NOT main)
8. /ultrareview Andrea-triggered
```

---

## 6. Activation string paste-ready (TEMPLATE)

```
Continua <project> iter <N>. Working dir: <path>, branch <branch>, HEAD <commit>.

━━ PRIMA AZIONE ━━
1. CoV entrance: npx vitest run = <baseline>/0, node scripts/epic1/validate-lesson-paths.mjs = 94/94/0/0/0, npm run build exit 0.
2. Leggi docs/handoff/<DATE>-iter-<N>-to-iter-<N+1>-handoff.md + docs/audits/<DATE>-iter-<N>-close-audit.md.
3. mem-search re-anchor: claude-mem search "<key terms>".
4. Andrea ratify queue (~<X> voci) — chiedi decisioni PRIMA di toccare codice.

━━ MANDATO ANDREA ━━
"<verbatim mandate>"

━━ LAVORO iter <N+1> ━━
P0 PRIMARIO: <workstream B carryover>
P0 QUICK WIN: <Phase 1 R1-R6 cross-compile end>
P2 DEFER: <Phase 2+3 UX overhaul post pilot gate>
P3 DEFER: <Phase 4 future browser-agent + flash protocol>

━━ CODEX GPT-5.5 (mandate) ━━
scripts/dev/codex-bg.sh <task-name> --profile verify "<prompt 4-element GOAL/CONTEXT/CONSTRAINTS/DONE>".
Pattern C-V default OGNI commit + claim + score.
Templates riusabili: scripts/dev/codex-prompts/ (verify-anti-regression + verify-morfismo-compliance + verify-codegen-output + verify-lesson-path-edit).
NEW failure mode iter 59: NO `\|` BRE regex in prompt → use ERE `(a|b|c)`.

━━ /ultrathink:ultrathink (Coordinator + 4-agent) ━━
Spawn Coordinator + Architect + Research + Coder + Tester parallel per task non-trivial.
Pattern S r3 race-cond fix: filesystem barrier completion msgs PRE-Phase-2 scribe spawn.

━━ /firecrawl research ━━
firecrawl-search / firecrawl-scrape / firecrawl-agent — live web research (vs WebSearch built-in cutoff).

━━ /comprehensive-review:full-review + /quality-audit ━━
Pre-close: full-review 5-phase parallel (architect + security + performance + testing + best practices).
Quality gate: elab-quality-gate post (10 metrics).

━━ /ultrareview ━━
USER-TRIGGERED ONLY. Claude CANNOT launch. Andrea must run independently post Phase complete.

━━ ANTI-REGRESSIONE FERREO ━━
Baseline <N>. 4-gate per ogni commit (vitest + build + validator + Codex). MAI --no-verify, MAI push main, MAI git stash, MAI git add -A. Re-baseline test count SOLO con prova aritmetica.

━━ NON COMPIACERE ━━
Onestà sopra comodità. Niente score gonfiati. iter score target <X>/10 ONESTO G45 cap.
Codex Pattern C-V verify each claim — anti-inflation mandate.
File:line citations everywhere.
```

---

## 7. Skill priority matrix per task type

| Task type | Skill primario | Skill complementari | Codex pattern |
|---|---|---|---|
| New feature | `product-management:write-spec` → `ultrathink:ultrathink` | `frontend-design` + `accessibility-audit` | C-V per commit |
| Bug fix | `bug-fix:bug-fix` OR `debugger:debugger` | `superpowers:systematic-debugging` | V-C recon |
| Refactor | `code-architect` OR `simplify` | `code-review:code-review` post | C-V per file |
| Performance | `application-performance:performance-optimization` | `performance-engineer` | C-V benchmark |
| Security | `security-scanning:security-hardening` | `security-auditor` | C-V threat model |
| Docs | `documentation-generation:openapi-spec-generation` + `generate-api-docs` | `docs-architect` | C-V cite check |
| Multi-agent | `ultrathink:ultrathink` OR `agent-teams:team-spawn` | Pattern S r3 | All 3 patterns |
| Audit | `comprehensive-review:full-review` OR `elab-quality-gate` | `coderabbit:code-review` | C-V verify each finding |
| Research | `firecrawl:firecrawl-search` + `context7:query-docs` | `claude-mem:mem-search` | V-C exhaustive |
| Plan | `claude-mem:make-plan` OR `superpowers:writing-plans` | `product-management:brainstorm` | C-C-V high-stakes |

---

## 8. Anti-pattern (NON FARE)

- ❌ `git add -A` — usa solo file specifici
- ❌ `--no-verify` su commit — pre-commit hook è rete sicurezza
- ❌ `git stash` se loop autonomo attivo (`automa/state/*` cambia underneath, pop conflict)
- ❌ Push diretto `main` — sempre branch feat/ + PR
- ❌ Codex prompt singolo-riga — usa sempre 4-element template
- ❌ Codex prompt con `\|` BRE regex — usa ERE `(a|b|c)`
- ❌ Codex prompt con heredoc `<<'NODE'` — usa `node -e "..."`
- ❌ Codex prompt senza `Do NOT read SKILL.md` constraint
- ❌ `/ultrareview` invocation da Claude — USER-TRIGGERED ONLY
- ❌ Claim "done/verified/N test pass/score X" senza Codex Pattern C-V cross-check
- ❌ Re-baseline test count senza arithmetic proof (exactly-N-changed + 0-failed + all-files-collected + no skip/todo added)
- ❌ Inventare numeri test count o score — sempre da terminale output appena visto
- ❌ Inflazione score G45 — onestà cap mandatory
- ❌ Skip Codex BG verify per save tempo — Pattern C-V mandatory backbone
- ❌ Skip 4-gate cascade su commit per "small change" — cascade FERREO

---

## 9. Honest failure modes documented

| Failure | Iter | Mitigation |
|---|---|---|
| Codex sandbox heredoc block | 57 | `node -e "..."` one-liners |
| Codex ignored path restriction → scanned `docs/` | 57 | `EXACTLY these commands: rg -n PATTERN PATH1 PATH2` |
| Codex burned run reading SKILL.md | 57 | `Do NOT read SKILL.md or skill files` |
| Codex stuck stdin BRE regex `\|` parsing | 59 | Use ERE `(a|b|c)` |
| Subagent declared wrong git state | 56 | NEVER trust subagent git state — verify yourself |
| Recon greps id literal instead of tracing chains | 56 | Recon MUST trace, not grep |
| Validator `norm()` whitespace+case insensitive | 57 | Document which check (validator vs Codex exact) |
| TEA narrative_map.json Vol3 unreliable | 54 | a3-corrections.json IS source of truth |
| Multiple OCR variants TEA | 58 | Cross-check; PDF stampato = ground truth |
| Pre-push hook hangs vitest slow | 59 | Wait; verify `git rev-list --left-right --count HEAD...origin/<branch>` |
| Background `git push` empty output | 58 | Re-verify via git log |
| Edit fails "File has not been read yet" | 58+59 | Read file PRIMA Edit in same conversation |
| ADR slug collision | 60 | Renumber to next free slot (032→048) — anti-confabulation |
| Confabulation in research prompt | 60 | Codex/Research subagent catches via Pattern C-V |
| HomePage regression "already fixed" | 60 | Subagent recon catches prior remediation — saves redundant work |

---

## 10. Score progression onesto cap iter 56-60

| Iter | Score G45 ONESTO | Cap rationale |
|---|---|---|
| 56 close | (varies) | Pre-A4.1d |
| 57 close | 9.30/10 | EPIC 1 A4.1d Phase 1-4 complete |
| 58 close | 8.0/10 | A4.1e Phase 1 3 surgical edits + 4 deliverable docs |
| 59 entrance | 8.5/10 | Blockly pivot 12 file (PRD+OpenAPI+API docs+automation+CODEX-WORKFLOW+codex-prompts) |
| 59 addendum | 8.5/10 | Lino+Riccardo WhatsApp synthesis |
| 60 scaffold | 8.8/10 | /ultrathink 4-subagent + Architect+Research+Coder+Tester deliverables |
| 60 entrance addendum | 8.85/10 | Anti-inflation correction + HomePage audit + linguaggio prep |

Cap rationale ogni iter: NO claim "Phase 1 done" senza Andrea ratify, NO claim "score 9.0+" senza Opus indipendente review, ZERO src code shipped Phase 1 finché Andrea ratify Q1-Q3.5.

---

## 11. Conclusione

**Workflow perfetto = Claude leads + Codex GPT-5.5 verifies + MCP connettori + Pattern S r3 race-cond fix + 4-gate cascade + NON COMPIACERE.**

Activation string paste-ready (§6) + skill priority matrix (§7) + anti-pattern checklist (§8) = riusabili future session.

Update questo doc ogni iter close con nuove failure modes + nuove skill emergent + nuovi pattern validati.
