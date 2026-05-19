# iter 60 → iter 61 handoff — activation string OPTIMIZED

> Prompt-engineering applied: CoT structure + few-shot Codex examples + constitutional constraints + state priming + anti-pattern negative space.
> Source: docs/dev/ACTIVATION-STRING-WORKFLOW-PERFETTO.md §6 template + iter 60 close audit + ratify queue 15 voci.

---

## Activation string paste-ready (copia tutto)

```
Continua ELAB Tutor iter 61. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix, HEAD 1e141f7e.

━━ §1 STATE PRIMING (verifica PRIMA di tutto) ━━
- Vitest baseline canonical: 13118 (.test-count-baseline.json total=13118 — pre-commit hook reads this. NB automa/baseline-tests.txt 13106 STALE +12 da iter 57 Phase 4 ebc5b620 — investigate Andrea iter 61).
- Build: PASS exit 0 iter 60 close (26 precache 1235 KiB ElabTutorV4 94K).
- Validator: 94/94 pass · 0 unresolved · 0 cyclic.
- Vercel preview LIVE: https://elab-tutor-hkyl2zv1l-andreas-projects-6d4e9791.vercel.app (feat branch, prod main UNCHANGED).
- Codex CLI: ~/.npm-global/bin/codex codex-cli 0.128.0 — wrapper scripts/dev/codex-bg.sh + 4 templates scripts/dev/codex-prompts/.

━━ §2 MANDATO ANDREA verbatim (anchoring — read FIRST) ━━
iter 59 pivot: "postilla non usare mblock → fa sì che elab tutor possa fare cross compilation su nanoR4 tramite c++ e blockly, rendi blockly più facile da usare e autoesplicativo".
iter 60 entrance: "continuando anche il resto dei lavori" + phasing tabella approvata (Workstream B P0 PRIMARIO + Blockly Phase 1 P0 quick win + Phase 2/3 DEFER + Phase 4 DEFER).
Riccardo: "termina prima il resto" → Workstream B carryover iter-21+ = P0 PRIMARIO iter 61.
Lino: "strada più facile + chiudere loop velocemente" → Phase 1 MVP scope (cross-compile end .hex, NO upload web).

━━ §3 ANDREA RATIFY QUEUE 15 voci (BLOCKING — chiedi PRIMA codice) ━━

**Phase 1 entry (5-10 min Andrea, 4 questions)**:
- Q1 Default board iter 61 — `Nano R4` (new direction) OR `Nano classic AVR` (backward compat 13 Vol3)? Recommended: AVR backward compat (Architect ADR-048 Option A).
- Q2 PREREQ SSH verify n8n `arduino-cli core install arduino:renesas_uno` (server srv1022317.hstgr.cloud) — Andrea action.
- Q3 UNO R4 variant — `arduino:renesas_uno:unor4wifi` OR `:minima`? Recommended: unor4wifi single entry.
- Q3.5 NEW Research finding: include 3rd FQBN `arduino:renesas_uno:nanor4`? Andrea + Riccardo Omaric kit hardware decide.

**Phase 2-3 entry (Q4-Q7, ~10-15 min)**:
- Q4 Block label canon source: Vol3 OCR / a3-corrections.json / Davide direct? Recommended: a3-corrections (canonical iter 57).
- Q5 Block icons: emoji vs ElabIcons SVG? Recommended: ElabIcons (CLAUDE.md rule 11).
- Q6 Per-experiment block filter: strict (5/blocco) vs full (23 highlighted)? Recommended: strict (less overwhelm kids 8-14).
- Q7 Walkthrough first-time language: IT only vs IT+icons fallback? Recommended: icons fallback.

**Phase 2+3 BLOCKING gate (Q8, Lino mandate)**:
- Q8 Pilot test gate iter 62 — quale scuola pilot? quando? metric uso Blockly >30% lezioni? Tea T4 first responder. Andrea + Tea + Riccardo decide.

**Carryover iter 58 A4.1e (3 voci)**:
- v3-cap9 orphan: DELETE / PRESERVE / MOVE-to-Bonus? Recommended: MOVE-to-Bonus (preserve Simon Says game UX + honest naming).
- v3-cap6 morse+semaforo page_start/end: apply 5,10→57,58 book-canonical? Recommended: APPLY.
- v3-cap6 morse+semaforo title_classe/title_docente: align lesson-path clean titles "Esperimento 3/5: …"? Recommended: APPLY.

**Workstream B linguaggio codemod (Q-CODEMOD-1/2/3, ~15 min)**:
- Q-CODEMOD-1 teacher_tip target: PLURALE (Chiedete) vs INFINITO (Chiedere) vs HYBRID per Volume? Recommended: PLURALE imperativo uniforme (mandate iter-21+ "Ragazzi,").
- Q-CODEMOD-2 teacher_messages target: PLURALE "Ragazzi, …" verbatim?
- Q-CODEMOD-3 apply mode: per-file ratify (a) / bulk + post-hoc review (b) / manual (c)? Recommended: (a) per-file.

━━ §4 LAVORO iter 61 (post Andrea ratify) ━━

**P0 PRIMARIO Workstream B carryover iter-21+ (~6-12h)**:
- B1 Linguaggio codemod 73 lesson-paths (Sprint U Cycle 1 audit ready) — Q-CODEMOD-1/2/3 ratify → write script scripts/sprint-u/linguaggio-codemod.mjs → dry-run preview 5 file → Andrea ratify sample → bulk apply per-file gate Codex Pattern C-V.
- B2 92 esperimenti Playwright UNO-PER-UNO entry (skill elab-harness-real-runner) — 5-10 esperimenti initial signal iter 61. Multi-iter total scope ~20h.
- B3 HomePage regression test guard (4 DOM-text assertions + Playwright toHaveScreenshot baseline — fix already in main iter 42 commit 0c661467, gap = NO test guard).
- B4 v3-cap9 orphan handling (post ratify carryover voce 1) + v3-cap6 pages+titles fix (post ratify voci 2+3).

**P0 QUICK WIN Blockly Phase 1 R1-R6 (~6-8h post Q1-Q3.5 ratify)**:
- R1 Wire BoardSelector.jsx → ScratchEditor.jsx compile region (disabled=false) — apply security INFO-1 allowlist guard pre-activation
- R2 Apply api.js:61 ALLOWED_COMPILE_BOARDS extend diff (see docs/specs/2026-05-15-iter-60-api-js-annotations.md preview)
- R3 Andrea SSH verify n8n core install completed (Q2 PREREQ)
- R4 OpenAPI yaml validate `npx @apidevtools/swagger-cli validate docs/api/n8n-compile-openapi.yaml` + add missing 429+503 response codes (P2-3 finding)
- R5 API docs md update post Q3+Q3.5 answers
- R6 Anti-regression 4-gate: vitest 13118+10 (R1 BoardSelector tests) + build + validator + Codex Pattern C-V

**P2 DEFER Phase 2 UX overhaul (iter 66+ post Q8 pilot gate PASS)**.
**P3 DEFER Phase 4 browser-agent+dfu-util (iter 70+ post pilot POSITIVO, Lino 5-step #4+#5 — 40-80h Research-flagged DESCOPE strongly recommended)**.

━━ §5 CODEX GPT-5.5 (mandate, Pattern C-V default ogni claim) ━━

**Template prompt 4-element MANDATORY** (single-line = file dump useless):
```
GOAL: <one-sentence verifiable outcome>
CONTEXT: @file paths + iter context (1-3 lines max)
CONSTRAINTS:
  - Do NOT read any SKILL.md or skill files.
  - Cite file:line for every claim.
  - Run EXACTLY these commands: <numbered, NO `\|` BRE — use ERE `(a|b|c)`>
  - Cap output <N> lines.
DONE: <N>-section verdict structure
```

**Few-shot GOOD example**:
```
bash scripts/dev/codex-bg.sh iter61-B1-codemod-dry-run-verify --profile verify "GOAL: verify linguaggio codemod dry-run script handles 'quando premi' false-positive guard correctly.

CONTEXT: scripts/sprint-u/linguaggio-codemod.mjs reads 73 lesson-paths/*.json. Q-CODEMOD-1 ratified PLURALE imperativo uniforme. Guard required: skip transformations if preceded by 'quando |se |dopo |prima '.

CONSTRAINTS:
  - Do NOT read any SKILL.md or skill files.
  - Cite file:line per finding.
  - Run EXACTLY: node scripts/sprint-u/linguaggio-codemod.mjs --dry-run --sample 5
  - Cap output 50 lines.

DONE:
1) False-positive guard hits (count + file:line samples)
2) Transformation count proposed (verbi mapped)
3) CONFIRM/REFUTE guard regex correctness"
```

**Few-shot BAD example** (DON'T do):
```
bash scripts/dev/codex-bg.sh foo --profile verify "Check the codemod script"   # ❌ single line = file dump
bash scripts/dev/codex-bg.sh foo --profile verify "GOAL: ... grep 'Premi\|Fai\|...'"   # ❌ BRE `\|` stuck stdin iter 59
```

**Reusable templates** scripts/dev/codex-prompts/:
- verify-anti-regression.txt — params: $COMMIT_HASH $BASELINE_COUNT
- verify-morfismo-compliance.txt — params: $SCOPE_FILES
- verify-codegen-output.txt — params: $BLOCK_TYPE $BOARD_FQBN
- verify-lesson-path-edit.txt — params: $LESSON_PATH_ID

**Pattern matrix**:
- C-V (Claude leads, Codex verifies) DEFAULT every commit + claim + score
- V-C (Codex enumeration leads, Claude executes) — exhaustive grep dump
- C-C-V (Claude proposes + self-critiques + Codex arbitrates) — high-stakes design
- NEW Pattern SKIPPED iter 58 verdict: live-terminal Claude↔Codex via control_mac/MCP rejected (codex-bg.sh sufficient auditable)

━━ §6 SKILL DISPATCH per task type ━━

| Task | Skill primario | Codex pattern |
|---|---|---|
| Linguaggio codemod B1 | claude-mem:make-plan + own script | C-V dry-run + per-file V-C enumerate |
| 92 esperimenti B2 | elab-harness-real-runner | C-V per esperimento |
| HomePage test guard B3 | test-automator OR test-writer-fixer | C-V verify-anti-regression |
| Blockly Phase 1 R1-R6 | ultrathink:ultrathink Coordinator post ratify | C-V verify-codegen-output per board |
| Audit close | comprehensive-review:full-review condensed 3-agent OR elab-quality-gate | C-V final synthesis |
| Research live | firecrawl:firecrawl-search + context7:query-docs | V-C exhaustive |
| Prompt optimize | llm-application-dev:prompt-optimize + prompt-engineering-patterns | Constitutional AI + CoT + few-shot |

━━ §7 ANTI-REGRESSIONE FERREO (4-gate cascade per commit) ━━

```
GATES = [
  npx vitest run             # 13118 PRESERVED
  npm run build              # exit 0
  node scripts/epic1/validate-lesson-paths.mjs   # 94/94/0/0/0
  bash scripts/dev/codex-bg.sh verify-diff --profile verify "..."   # CONFIRM
]
```

Re-baseline test count SOLO con prova aritmetica (exactly-N-changed + 0-failed + all-files-collected + no skip/todo added).
MAI --no-verify, MAI push main, MAI git stash, MAI git add -A.
Stage file specifici. Commit con HEREDOC + Co-Authored-By Claude Opus 4.7.
Pre-commit hook reads .test-count-baseline.json total=13118 (canonical). automa/baseline-tests.txt 13106 stale +12 → investigate sync.

━━ §8 ANTI-PATTERN (NON FARE — negative space) ━━

- ❌ `git add -A` → file specifici
- ❌ `--no-verify` → pre-commit hook è rete sicurezza
- ❌ `git stash` con loop autonomo attivo (automa/state/* cambia)
- ❌ Push diretto main → sempre branch feat + PR
- ❌ Codex prompt singolo-riga → 4-element template
- ❌ Codex prompt `\|` BRE → ERE `(a|b|c)`
- ❌ Codex prompt heredoc `<<'NODE'` → `node -e "..."`
- ❌ Codex prompt senza `Do NOT read SKILL.md` constraint
- ❌ `/ultrareview` invocation da Claude — USER-TRIGGERED ONLY
- ❌ Claim "done/verified" senza Codex Pattern C-V cross-check
- ❌ Score inflation G45 → onestà cap mandatory
- ❌ Inventare numeri test count/score → sempre da terminale output appena visto

━━ §9 NON COMPIACERE ━━

- Score iter 61 target: 8.7-8.9/10 ONESTO G45 cap (Phase 1 R1-R6 complete + Workstream B item 1 codemod progress + 5-10 esperimenti audit start).
- NO claim "Phase 1 done" senza R6 anti-regression PASS + Codex Pattern C-V CONFIRM.
- NO claim "Workstream B complete" — B1+B2+B3 multi-iter total ~20-30h scope.
- 4 Phase R1-R6 implementations require Andrea Q1-Q3.5 ratify BLOCKING.
- BoardSelector security INFO-1 fix (handleSelect allowlist guard) PRE-wire-up Phase 1.
- BoardSelector 10 unit tests SAME atomic PR as first import — NO coverage debt.
- HomePage regression test guard P2 finding iter 60 — Andrea ratify scope before Phase 1 done.
- Multi-iter Workstream B Phase 2+3+4 DEFERRED per Riccardo "termina prima resto" + Lino "strada più facile" + Q8 pilot gate.

━━ §10 PARALLEL DISPATCH primo turno (5 BG ricommended) ━━

1. mem-search re-anchor: `claude-mem search "iter 60 entrance comprehensive review activation string"`
2. Codex BG verify CoV ingresso: `bash scripts/dev/codex-bg.sh iter61-entrance-cov-verify --profile verify "<4-element prompt>"`
3. Read iter 60 close audit: `docs/audits/2026-05-15-iter-60-ultrathink-brief.md` + `.full-review/05-final-report.md`
4. Read iter 60 entrance addendum: `docs/audits/2026-05-15-iter-60-linguaggio-codemod-prep.md` + `2026-05-15-iter-60-homepage-regression-analysis.md`
5. Andrea ratify queue 15 voci (§3) — chiedi PRIMA di toccare codice

━━ §11 DELIVERABLES iter 61 close target (~6 commits) ━━

- 1 PR linguaggio codemod B1 (post ratify Q-CODEMOD-1/2/3) — 73 file modified + vitest 13118+ preserved
- 1 PR Blockly Phase 1 R1-R6 (post ratify Q1-Q3.5) — BoardSelector wire-up + api.js diff + OpenAPI refine + 10 unit tests + Codex Pattern C-V CONFIRM
- 1 PR HomePage test guard B3 (4 DOM-text + Playwright toHaveScreenshot baseline)
- 1 PR 92 esperimenti B2 entry (5-10 esperimenti Playwright initial) — anti-G45 evidence
- 1 PR carryover iter 58 A4.1e (v3-cap9 + capitoli pages+titles per Andrea ratify)
- 1 close audit + handoff iter 62 + Andrea /ultrareview trigger autonomous

iter 61 score target: 8.7-8.9/10 ONESTO G45.

━━ END ACTIVATION STRING ━━
```

---

## Notes prompt-engineering applied

**Optimizations vs iter-60 entrance handoff** (paste-ready quality lift):

| Technique | Iter-60 entrance | Iter-61 entrance OPTIMIZED |
|---|---|---|
| State priming | §1 mixed with workstream | §1 isolated FIRST (HEAD + vitest + build + validator + preview URL + Codex CLI version) — anchoring |
| Mandate verbatim | Single line | §2 dedicated multi-stakeholder (Andrea + Riccardo + Lino mandate) — chain-of-mandate |
| Ratify queue | 12 voci scattered | §3 numbered Q1-Q8 + 3 carryover + 3 Q-CODEMOD grouped per Phase, each with Recommended fallback — decision-ready |
| Workstream split | Tabella alone | §4 P0/P0/P2/P3 with explicit acceptance criteria per R1-R6 — measurable |
| Codex example | Reference only | §5 few-shot GOOD + BAD examples + reusable templates — constitutional |
| Skill dispatch | None | §6 task-type matrix (linguaggio / 92 esp / HomePage / Blockly / audit / research / prompt) — concrete |
| Anti-regression | Single block | §7 4-gate cascade + baseline 13118 canonical + STALE 13106 flagged — actionable |
| Anti-pattern | Single block | §8 negative-space checklist 12 items — boundary clarity |
| Non compiacere | Inline | §9 dedicated with score target + 4 blocking conditions — anchored honesty |
| Parallel dispatch | Implicit | §10 5 BG concrete commands — execution-ready |
| Deliverables target | Vague | §11 6 PR concrete + score target — measurable success |

**Prompt-engineering techniques applied**:
- **Constitutional AI**: 12-item anti-pattern checklist §8 (boundary delimiters)
- **CoT structure**: §1→§2→§3→§4→§5→§6→§7→§8→§9→§10→§11 phased reasoning
- **Few-shot learning**: §5 GOOD vs BAD Codex prompt examples
- **State priming**: §1 verifiable state FIRST (avoid hallucination on stale assumptions)
- **Negative space**: §8 anti-patterns explicit
- **Decision support**: §3 Recommended per voce (reduce Andrea cognitive load)
- **Measurable success**: §11 6 PR target + score 8.7-8.9/10 cap
- **Hierarchical anchoring**: §-headers + ━━ delimiters for chunking
- **Concrete vs abstract**: file:line cite everywhere + skill matrix per task type

## Usage

1. Andrea apre nuova sessione Claude Code
2. Paste tutto il contenuto §"Activation string paste-ready" (codice blocco singolo)
3. Claude esegue §1 state priming + §10 parallel dispatch primo turno
4. Andrea ratifies 15 voci §3 (~30-45 min)
5. Claude execute §4 workstream prioritized
6. /ultrareview Andrea-trigger autonomous post Phase 1 close
