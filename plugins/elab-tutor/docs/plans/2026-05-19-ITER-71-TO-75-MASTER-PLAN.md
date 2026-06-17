# ELAB Tutor Master Plan iter 71 → 75 (Sprint U close + Sprint V begin)

**Date**: 2026-05-19 (post iter 70 close 7.5/10 ONESTO G45 ricalibrato Codex)
**Mandate Andrea**: tutto in funzione + a regime + cicli con piani intermedi + controlli cross-platform + Karpathy/GSD/GSD2 methodology + agile + massive doc + best context maintenance + Canva/ComfyUI/Leonardo fumetti + studia cartella TEA + NO REGRESSIONE + max confronto Codex GPT-5.5 vs Claude Opus 4.7

## Cicli atomization (Karpathy GSD2 small parallel + iterate fast)

### ITER 71 (next, ~6-8h Andrea + orchestrator)

**PHASE 0 — Bootstrap CoV (10min)**
- Verify mainwt HEAD `2d0218af` + 11 commits iter 70 batch
- Vitest baseline 13517 PRESERVED
- Mac Mini health + queue check
- Disk + processes inventory

**PHASE 1 — Andrea P0 actions (~2h parallel)**
- A-SECURITY ELAB_API_KEY rotation iter 32 protocol (~30min)
- A-NEW-3b deploy unlim-chat v241 + matrix re-verify ≥98% (~15min)
- Push origin 11 commits iter 70 batch (~10min)
- Sentry+PostHog OAuth + 3 dashboards seed (~30min)
- Mac Mini install node Homebrew user-dir + re-seed valid task (~20min)

**PHASE 2 — TEAM F runtime wire MED fix (~1h)**
- loadStudentContext memory wire (Codex finding: currentExperimentId only from request body, NOT memory)
- studentContext.currentExperimentId integration unlim-chat/index.ts:389

**PHASE 3 — 15 vitest fail surgical (~30min)**
- Names identified via verbose run (bhuhsrjhl BG)
- Surgical fix ognuno OR document defer iter 72 if non-trivial

**PHASE 4 — TEAM G hook FAIL fix (~1h)**
- Add Edit + MultiEdit matchers .claude/settings.json (currently only Write)
- Fix blockly-blocks/*.js path (use scratchGenerator.js exact path)

**PHASE 5 — TEAM A Vol3 dataset rework (~3h subagent BG)**
- Add missing 15 Vol3 IDs (cap6-esp3 + cap7-mini + cap8-esp4 + capstones + etc)
- Convert cliffhanger-table to Tea-compat array format (94-item)
- Fix experiments-vol3.js header "26" → actual count
- Wire service experimentNarrativeService.js to import schema

**Score iter 71 target**: 7.5 → 8.3+/10 ONESTO

### ITER 72 (~8-10h)

**PHASE 1 — TEAM B 94 esperimenti rework (~2h subagent BG)**
- Rename files 94 → 79 (or add Vol3 15 missing IDs)
- Add P0 assertion throw on broken esperimenti
- Fix 66 hardcoded count mismatches

**PHASE 2 — TEAM D HomePage emoji + Album runtime (~3-4h subagent BG)**
- Remove emoji from CARDS field HomePage (replace with ElabIcons SVG)
- Remove footer 🐒 fallback
- Album studente runtime integration Supabase
- Apply bibbia_stilistica deep (font + spacing + iconografia)

**PHASE 3 — TEAM E Quality Harness hard gates (~2h)**
- Lighthouse fail on ANY route fail (not success on ANY)
- UX probes strict assertions (not soft)
- Promptfoo SUPABASE_ANON_KEY validation

**PHASE 4 — TEAM C re-dispatch fresh (~5-6h subagent BG)**
- Vol3 Blink first-vertical-slice v3-cap5-esp1
- Error translator 7 categories Arduino CLI stderr
- Worktree isolato fresh from mainwt baseline corretto

**Score iter 72 target**: 8.3 → 9.0+/10 ONESTO

### ITER 73 (Fumetti pipeline Canva + ComfyUI + Leonardo ~8h)

**PHASE 1 — Canva MCP integration (~2h)**
- Canva MCP authenticate (Andrea OAuth)
- Create design template fumetto pedagogico end-of-experiment
- API: `mcp__plugin_marketing_canva__authenticate` + `mcp__2368d967-371a-4828-8cf7-4f6952ed958b__generate-design`
- Wire fumettoService.js to invoke Canva template generation

**PHASE 2 — ComfyUI local install + workflow (~3h)**
- Install ComfyUI locale: `git clone https://github.com/comfyanonymous/ComfyUI`
- Workflow JSON: Stable Diffusion XL + ControlNet Pose mascotte UNLIM canonica
- API REST: POST /prompt → polling /history/{prompt_id}

**PHASE 3 — Leonardo.ai API integration (~2h)**
- Andrea API key acquisita https://app.leonardo.ai/account-api
- Image-to-image variations mascotte + scene
- Wire pipeline: UNLIM end-of-experiment → fumetto_payload → ComfyUI gen → Leonardo variations → display Album Studente

**PHASE 4 — End-to-end fumetto Vol3 cap5 esp1 Blink (~1h)**
- Real end-to-end test: complete Blink → trigger fumetto pipeline → URL displayed Lavagna
- Cost stima ~$0.50 per fumetto (Leonardo + Canva storage)

**Score iter 73 target**: 9.0 → 9.3+/10 ONESTO

### ITER 74 (Tea materials 100% recovery + 94 esperimenti audit prod ~6h)

**PHASE 1 — Tea bibbia_stilistica.pdf 65KB deep extraction (~2h)**
- OCR Tea PDF (pdftotext OR Mac Mini Tesseract)
- Extract: palette HEX exact + typography family/sizes + spacing scale + iconografia rules
- Apply to ALL components src/components/ via subagent ui-designer

**PHASE 2 — Album studente runtime LIVE (~2h)**
- Wire Supabase student_album table
- PDF export via @react-pdf/renderer (already in package.json)
- Integration HomePage hash route #album

**PHASE 3 — 94 esperimenti Playwright UNO PER UNO REAL execution prod (~2h)**
- BG agent test-automator Playwright run live prod ELAB Tutor
- Capture screenshots 79 esperimenti (NOT 94 — naming was off)
- REAL broken count REPORT + top 10 P0 fixes

**Score iter 74 target**: 9.3 → 9.6+/10 ONESTO

### ITER 75 (Sprint U close + Sprint V begin ~4h)

**PHASE 1 — Andrea ratify Sprint U close (~30min)**
- Opus indipendente review G45 mandate (defer Sprint V iter 76+ OR accept iter 75 close)
- A-SECURITY second rotation iter 32 protocol cycle 2
- Sprint U close audit comprehensive

**PHASE 2 — Sprint V begin atomization (~3h orchestrator)**
- A12+A13 cross-platform installer + GPL-3.0 legal review scope (40-80h multi-week)
- A14 Mistral Vibe Red Team Mac Mini install
- A15 ELAB Quality Harness Phase 2 (Crawlee + Pa11y + BackstopJS + ZAP + Langfuse + Ragas + DeepEval + Unlighthouse)
- PLAN-unlim-prof-pilot-chatgpt.md 35KB Anthropic Managed Agents Memory + Claude Dreams (multi-week iter 80+)

**Score iter 75 close target**: 9.6 → **9.7-9.9/10 ONESTO** Sprint U CLOSE conditional Opus review

## Cross-platform control loop (intermediate checks)

### Tier 1 — Cycle ogni atom (5-10min)
- Codex Pattern V pre-impl: `bash scripts/dev/codex-bg.sh verify-<atom> --profile verify`
- Codex Pattern C post-impl: `bash scripts/dev/codex-bg.sh verify-<atom>-post --profile verify`
- Vitest delta scope: `npx vitest run tests/unit/<scope>/ --reporter=basic`
- Cross-validation: subagent code-reviewer:code-reviewer per ogni team output

### Tier 2 — Cycle ogni phase (30min)
- Mac Mini health check: `cat ~/.elab-health.json`
- Queue progress: `tail -5 ~/.elab-task-progress.jsonl`
- Disk + processes: `df -h / && ps aux | grep node | wc -l`
- MCP status: `claude mcp list`

### Tier 3 — Cycle ogni iter close (~30min)
- Full vitest baseline preserve: `npx vitest run --reporter=basic`
- Build PASS: `npm run build`
- Matrix re-verify 1000q: `python3 scripts/bench/run-1000-matrix.py`
- Codex Pattern C 6 team outputs cross-check (1.1MB review)
- code-reviewer:code-reviewer Anthropic agent per ogni team output
- Tests/integration Playwright smoke prod
- Audit md + handoff md + CLAUDE.md APPEND

## Methodology Karpathy GSD2 + Agile

### Karpathy "build small + iterate fast"
- Cycle atomico ≤4h ognuno (vs monolithic >24h)
- Pattern S r3 race-cond fix worktree isolato (13× consecutive validated)
- 4-6 BG agents paralleli per phase
- ZERO premature optimization (defer scope opt iter 80+)

### GSD2 "no bias no compiacenza"
- Codex Pattern C cross-check OBBLIGATORIO ogni atom critical
- code-reviewer:code-reviewer Anthropic agent independent security + quality
- G45 anti-inflation cap mechanical (NO override by interpretation)
- Honesty caveats ≥5 ogni audit doc

### Agile sprint contracts
- Sprint contract per atom (`docs/pdr/sprint-{N}-iter-{M}-contract.md`)
- Per-agent completion msg (`automa/team-state/messages/`)
- Audit md per close (`docs/audits/<YYYY-MM-DD>-iter-{N}-CLOSE-audit.md`)
- Handoff md per entrance (`docs/handoff/<YYYY-MM-DD>-iter-{N}-to-iter-{M}-handoff.md`)
- ADR architectural decisions (`docs/adrs/ADR-<NNN>.md`)
- CLAUDE.md sprint history APPEND iter close

### Massive documentation
- 6 doc artifacts per iter close (audit + handoff + ADR + completion msgs + CLAUDE.md + sprint contract)
- Codex Pattern C output preserved disk per traceability
- BG agent report verbatim per cross-validation
- 5+ honesty caveats ogni doc

### Context maintenance best practices
- `.ai/mission.md` iter goal template
- `.ai/board.md` Kanban WIP limit 3
- `.ai/handoffs/` per-cycle
- Pattern S r3 filesystem barrier completion msgs PRE Phase 2 spawn
- Codex Pattern V pre-impl + Pattern C post-impl
- claude-mem cross-session memory (broken iter 69-70, fix iter 71 P1)
- mem-search 3-layer workflow (search → timeline → fetch)
- baseline-tests.txt single source of truth
- pre-commit hook drift gate
- pre-push hook quick-regression
- Stop hook build gate

## Cross-platform tools active

| Tool | Stato | Use |
|---|---|---|
| Codex CLI 0.130.0 GPT-5.5 high | ✓ daemon alive | Pattern V/C verifications cross-check Claude Opus |
| Claude Code Opus 4.7 1M | ✓ active session | Orchestrator inline + BG subagents Anthropic |
| Mac Mini SSH explicit key | ✓ launchctl PID 88901 | Autonomous loop heartbeat + queue (post node install iter 71) |
| tmux orchestrator script | ✓ setup iter 69 | Parallel BG agents workflow (~/.tmux.conf + scripts/tmux/) |
| Playwright Chromium | ✓ playwright.config | 94 esperimenti audit + UX probes + axe a11y |
| MCPs ✓ connected | 5 active (context7 + serena + claude-mem-search + fusion360 + galileo) | Code intel + memory + 3D |
| MCPs ⚠️ auth pending | 14 (vercel + supabase + sentry + posthog + figma + linear + ...) | iter 71 OAuth Andrea |
| MCPs ✗ failed | 6 (claude-mem main + firebase + github + laravel + playwright-mcp + semgrep) | iter 71 troubleshoot |

## Fumetti pipeline (Canva + ComfyUI + Leonardo) iter 73 atomization

### TEA materials canonical (TEAM D iter 70 integrated parziale):
- `fumetto_schema.json` 12.4KB byte-identical Tea (TEAM D verified iter 70)
- `fumetto_payload_esempio.json` 8KB reference
- `mascotte_unlim_canonica.md` + `.svg` 3.5KB
- `elab-fumetti-consegna-v2/` 8 subdirs (00-Pilot + 01-Vol1 + 02-Vol2 + 03-Vol3 + 04-QA-Inventario + 05-Mapping-Narrativo + 06-Album-Studente + 99-Pipeline)
- `bibbia_stilistica.pdf` 65KB style bible

### Pipeline runtime iter 73:
1. UNLIM end-of-experiment → fumettoService.validateFumettoPayload(payload) — already shipped iter 70 TEAM D
2. payload → Canva MCP `mcp__plugin_marketing_canva__create-design-from-brand-template` (template ELAB pre-creato Andrea)
3. payload scenes → ComfyUI local API POST /prompt (ControlNet Pose mascotte + Stable Diffusion XL)
4. ComfyUI output → Leonardo.ai image-to-image variations (mascotte canonical pose match)
5. Final fumetto URLs → display Album Studente (post runtime iter 74)

### Cost stima fumetti:
- Canva: $0.10-0.20 per design (templates)
- ComfyUI: locale (FREE compute)
- Leonardo.ai: $0.10-0.30 per variation
- Total per fumetto: ~$0.30-0.50

## Tea folder studio approfondito (iter 71+)

Top-tier 9 asset critical 70% recovered iter 70 (TEAM A + D), residue 30% iter 71-75:

✅ Iter 70 recovered:
- standard_experiment_schema 7-step (TEAM A)
- narrative_map.json 94 entries (TEAM A — Codex finding 77 unique)
- cliffhanger_table.json transitions (TEAM A — Codex finding wrapper not Tea-compat)
- fumetto_schema + payload (TEAM D byte-identical)
- mascotte_unlim canonica + SVG (TEAM D)
- GLOSSARIO 61 termini route #glossario (TEAM D)

⚠️ Iter 71+ residual:
- bibbia_stilistica.pdf 65KB deep apply (font + spacing + iconografia)
- album_studente_mockup HTML + spec runtime
- elab-fumetti-consegna-v2/ 8 subdirs pipeline runtime
- PLAN-unlim-prof-pilot-chatgpt.md 35KB Anthropic Managed Agents Memory (iter 80+ Sprint V+)
- 5 MANUALE VOLUME PDF Tea nuove versioni (Mac Mini OCR overnight iter 71+ post node install)
- 6 ocr-playground zips (Tea outputs riferimento)

## Anti-regressione safeguards

- Pattern S r3 worktree isolato (NO file ownership conflict 13× validated)
- Pre-commit hook quick-regression delta scope test
- Pre-push hook 13517 baseline gate
- Stop hook build PASS gate
- PreToolUse hook guard-deploy-unlim-chat (blocks deploy senza --no-verify-jwt)
- PreToolUse hook guard-forbidden-avr-patterns iter 70 (currently bypassable Edit/MultiEdit — fix iter 71)
- Codex Pattern C cross-check OBBLIGATORIO ogni atom critical
- code-reviewer:code-reviewer Anthropic agent independent review
- Vitest delta scope per atom prior commit
- G45 anti-inflation cap mechanical NON override

## No conflicts cross-validation

Pattern S r3 race-cond fix:
- Single-agent orchestrator inline default
- BG subagent ONLY worktree isolato (file ownership disjoint)
- Filesystem barrier completion msgs PRE Phase 2 spawn
- Pre-commit hook drift check (sync-experiment-registry + quick-regression)
- Codex Pattern V pre-impl + Pattern C post-impl confronto

## Score progression target

| Iter | Score baseline | Score target | Conditional |
|---|---|---|---|
| 70 close | (iter 69 9.5) | 7.5 ONESTO G45 | Codex 4/6 HIGH findings ricalibrato |
| 71 | 7.5 | 8.3+ | Andrea P0 + TEAM F runtime + TEAM A Vol3 rework + 15 fail surgical |
| 72 | 8.3 | 9.0+ | TEAM B+D+E rework + TEAM C re-dispatch |
| 73 | 9.0 | 9.3+ | Fumetti pipeline Canva+ComfyUI+Leonardo LIVE |
| 74 | 9.3 | 9.6+ | Tea materials 100% recovery + 94 esperimenti audit prod real |
| 75 Sprint U close | 9.6 | **9.7-9.9 ONESTO** | Opus indipendente review G45 mandate |
| Sprint V begin iter 76+ | (9.7-9.9) | 10.0 / extension | Cross-platform installer + Mistral Vibe + Quality Harness Phase 2 + PLAN ChatGPT |

## Files refs iter 70 close + iter 71 start

- iter 70 close audit: `docs/audits/2026-05-19-iter-70-CLOSE-multi-agent-audit.md`
- iter 70 → iter 71 handoff: `docs/handoff/2026-05-19-iter-70-to-iter-71-handoff.md`
- THIS plan: `docs/plans/2026-05-19-ITER-71-TO-75-MASTER-PLAN.md`
- 6 Codex Pattern C outputs: `/tmp/codex-verify-iter70-team-{A,B,D,E,F,G}.txt` (1.1MB totale)
- CLAUDE.md iter 70 close section: line 2672-2830
- Mainwt HEAD: `2d0218af` (post PHASE 5 REAL fix commit)
