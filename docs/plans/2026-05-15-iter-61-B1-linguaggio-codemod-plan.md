# Plan B1 codemod linguaggio teacher_tip iter 61

> 2026-05-15 iter 61 entrance — Workstream B P0 PRIMARIO Andrea iter 21+ mandate carryover (`feedback_iter21_mandate_critical.md`).
> Andrea ratify Q-CODEMOD-1=a (PLURALE imperativo uniforme) + Q-CODEMOD-3=a (per-file Codex C-V). Q-CODEMOD-2 teacher_messages DISMISSED iter 61 → OUT-OF-SCOPE.
> Scope reale teacher_tip: 154 violations / 63 file (38 v1 + 14 v2 + 11 v3), NOT audit estimate 200/73.

## Phase 0: Documentation Discovery — COMPLETED

Findings:
- `scripts/dev/codex-prompts/verify-lesson-path-edit.txt` EXISTS but verifies CHAIN integrity only (next_experiment + capitoli + a3-corrections + validator). NOT linguaggio scope. **NEED NEW template** `verify-linguaggio-codemod.txt` Phase 3.
- Vitest convention: `tests/unit/*.test.js` flat (NO per-feature subfolders standard). Related existing: `lessonPathsValidation.test.js`, `lessonPaths.test.js`, `lessonPathsCompleteness.test.js`. NEW file: `tests/unit/sprint-u-linguaggio-codemod.test.js` (kebab-case, single-level).
- Sprint U Cycle 1 audit 10 docs preexisting. Linguaggio codemod prep doc iter 60: `docs/audits/2026-05-15-iter-60-linguaggio-codemod-prep.md`.
- Scope reale teacher_tip iter 61: 154 violations / 63 file.
- Vol1 patterns: heavy SINGOLARE (Dai/Chiedi/Mostra/Evidenzia/Spiega/Non dare/Usa).
- Vol2 patterns: MIXED (Mostrate/Fate plurale OK + Stimola/Lascia/Evidenzia singolare violations).
- Vol3 patterns: MIXED (Chiedi/Mostra/Aiuta singolare + Mostrare/Coprire infinito + Fate/Mostrate plurale).
- **CRITICAL**: already-plurale forms (Mostrate/Fate/Chiedete) NON transform. Student speech inside `''` quotes NON transform.

## Phase 1: TDD RED — Test FIRST

**File**: `tests/unit/sprint-u-linguaggio-codemod.test.js` NEW (~280 LOC)

Test cases (~45 tests):
- Verb map exact 40 entries (test each singolare→plurale transform)
- Already-plurale unchanged (`Mostrate il motore` → `Mostrate il motore`)
- Already-plurale "Fate notare" composite unchanged
- Student speech `''` quotes preserved verbatim (`Chiedi: 'Cosa premi?'` → `Chiedete: 'Cosa premi?'` MA inside quote `premi` resta)
- False positive guards: `(quando |se |dopo |prima |perché |mentre )Verbo` skip transform
- Composite negation "Non dare" → "Non date", "Non correre" → "Non correte"
- Enclitic pronoun "Mostralo" → "Mostratelo", "Spiegalo" → "Spiegatelo"
- Infinito → plurale optional: "Mostrare/Coprire/Usare" → "Mostrate/Coprite/Usate" (per Q-CODEMOD-1=a "uniforme")
- JSON path scope strict: ONLY `phases[].teacher_tip` (NOT `teacher_messages`, `objective`, `chapter_title`, `unlimPrompt`)
- Edge cases: empty string, missing field, multiple violations per tip, newline-separated
- Verb word-boundary `\bVerbo\b` (NOT "Premi" inside "Premiazione")

Run: `npx vitest run tests/unit/sprint-u-linguaggio-codemod.test.js` → ~45 FAIL (script absent) = RED ✓

## Phase 2: TDD GREEN — Codemod script

**File**: `scripts/sprint-u/linguaggio-codemod.mjs` NEW (~250 LOC)

Exports (consumed by tests):
- `transformText(input: string): string`
- `transformTeacherTip(input: string): { output: string, changes: Array<{from:string,to:string,line:number}> }`
- `transformLessonPath(json: object): { json: object, changesCount: number, diff: string[] }`
- `applyCodemod(filePath: string, options: { dryRun: boolean }): Result`
- `VERB_MAP: Record<string, string>` (40 entries)
- `FALSE_POSITIVE_PRECEDED_BY: RegExp` (`/\b(quando|se|dopo|prima|perché|mentre|finché|appena)\s+$/i`)

CLI modes:
- `--scope-report` → JSON list 63 file + 154 violations + per-volume breakdown
- `--dry-run --file=v1-cap6-esp1` → unified diff preview single file
- `--dry-run --sample=5` → 5 representative file diff (v1-cap6-esp1, v1-cap10-esp1, v2-cap10-esp1, v2-cap12-esp1, v3-cap6-morse)
- `--apply --file=v1-cap6-esp1` → apply single file + write back
- `--apply --all` → bulk apply all 63 file (Phase 5 ONLY post-ratify)

Internal logic:
1. Load JSON via `fs.readFileSync` + `JSON.parse`
2. Traverse `phases[].teacher_tip` strictly (scope guard mandatory)
3. Extract `''`-quoted student speech regions, preserve verbatim
4. Apply VERB_MAP regex `\b(Verbo)\b` → Plurale outside quote regions
5. False positive guard preceded-by skip transform
6. Reassemble string, write back via `JSON.stringify(..., null, 2)` (preserve indentation)
7. Newline at EOF preserved

Run: `npx vitest run tests/unit/sprint-u-linguaggio-codemod.test.js` → ~45 PASS = GREEN ✓

## Phase 3: Dry-run sample 5 file + Codex C-V

**Sample selection rationale**:
- `v1-cap6-esp1.json` — template + 4 violations
- `v1-cap10-esp1.json` — 3 violations Vol1 pattern
- `v2-cap10-esp1.json` — 3 violations Vol2 MIXED pattern
- `v2-cap12-esp1.json` — 3 violations Vol2 mostly already-plurale (no-op verify)
- `v3-cap6-morse.json` — 1 violation Vol3 short pattern

**NEW Codex template `scripts/dev/codex-prompts/verify-linguaggio-codemod.txt`** (~50 LOC):
- GOAL: verify B1 codemod single file PASS — transform correctness + JSON parse + violation count delta + chain integrity preserved
- CONTEXT: ELAB lesson-path teacher_tip PLURALE imperativo (Andrea ratify Q-CODEMOD-1=a)
- CONSTRAINTS: NO SKILL.md, NO heredoc, ERE regex, cap 50 lines, cite file:line
- 5-section DONE: 1) violation count pre/post 2) verb transform applied list 3) student speech preserved (`''` regions sample) 4) JSON parse valid 5) `jq '.experiment_id, .phases[0].teacher_tip'` snapshot

Run: `node scripts/sprint-u/linguaggio-codemod.mjs --dry-run --sample=5` → 5 diff files saved `docs/audits/2026-05-15-iter-61-B1-dryrun-sample/{file}.diff`.

Codex BG verify per file (5 parallel) → 5 verdict reports saved `docs/audits/2026-05-15-iter-61-B1-dryrun-sample/{file}-codex-cv.txt`.

## Phase 4: Andrea ratify sample diff

**Deliverable**: 5 diff files + 5 Codex C-V reports. Andrea inspect + ratify PROCEED.

GO → Phase 5 bulk apply. REJECT → revise verb map / guards / scope iter 62.

## Phase 5: Per-file C-V bulk apply 63 file

Process per file:
1. `node scripts/sprint-u/linguaggio-codemod.mjs --apply --file=$FILE`
2. Codex BG `verify-linguaggio-codemod.txt` template, save report
3. Anti-regression batch gate every 10 file: `npx vitest run tests/unit/lessonPathsValidation.test.js tests/unit/lessonPaths.test.js tests/unit/lessonPathsCompleteness.test.js` + Codex aggregate

Sequence (~63 file × ~1 min Andrea per-file ratify = ~1h aggregate, target iter 61 ~4-6h Andrea time):
- Batch 1 (v1 cap6-7): 7 file
- Batch 2 (v1 cap8-9): 16 file
- Batch 3 (v1 cap10-14): 15 file
- Batch 4 (v2 cap3-5): 6 file
- Batch 5 (v2 cap7-12): 8 file
- Batch 6 (v3): 11 file
Total 63 file.

## Phase 6: Final verification + commit + close

Verify aggregate:
- `node scripts/sprint-u/linguaggio-codemod.mjs --scope-report` → 0 violations / 63 file post-codemod
- `npx vitest run` → 13118 PRESERVED + 45 new sprint-u tests = 13163 expected
- `npm run build` PASS exit 0
- `node scripts/epic1/validate-lesson-paths.mjs` → 94/94 PASS (validator score preserved)
- Codex BG `verify-anti-regression.txt` aggregate 63 file

Commit message:
```
feat(iter-61-B1): linguaggio codemod 63 lesson-paths teacher_tip PLURALE imperativo

- Andrea ratify Q-CODEMOD-1=a (PLURALE imperativo) + Q-CODEMOD-3=a (per-file Codex C-V)
- Scope reale teacher_tip: 154 violations → 0 across 38 v1 + 14 v2 + 11 v3
- teacher_messages OUT-OF-SCOPE iter 61 (Q-CODEMOD-2 dismissed)
- 40-entry verb map + false positive guards (quando|se|dopo|prima|perché|mentre|finché|appena) + enclitic Mostralo→Mostratelo + student speech '' quote preservation
- tests/unit/sprint-u-linguaggio-codemod.test.js NEW ~45 tests
- scripts/sprint-u/linguaggio-codemod.mjs NEW ~250 LOC
- scripts/dev/codex-prompts/verify-linguaggio-codemod.txt NEW template Pattern C-V
- Codex Pattern C-V per-file: 63/63 CONFIRM
- Anti-regression 4-gate FERREO PASS: vitest 13118 PRESERVED + 45 new = 13163 + build PASS + validator 94/94 + Codex CONFIRM
- Iter 60 review P0/P2 carryover RESOLVED — Workstream B1 PRIMARIO ratify CLOSED
```

Pre-push hook gate: vitest baseline preserved + 45 NEW = arithmetic proof.

**`automa/baseline-tests.txt` 13106 stale fix**: update 13106→13118 SEPARATE commit `chore(iter-61): sync automa/baseline-tests.txt canonical 13118` (P2-1 iter 60 review carryover).

## Phase 7 OPTIONAL: post-iter-61 carryover (if time)

- B2 92 esperimenti Playwright UNO PER UNO entry 5-10 esp (`elab-harness-real-runner` skill)
- B3 HomePage test guard 4 DOM-text + Playwright toHaveScreenshot baseline

## Anti-pattern guards (NON FARE)

- `git add -A` (always specific file paths)
- `--no-verify` (pre-commit hook mandatory pass)
- `git stash` with loop (lose state)
- push main (NEVER, always feat branch)
- Codex 1-line prompt (4-element template mandatory)
- BRE regex `\|` (use ERE `(a|b|c)`)
- heredoc Codex (file dump dispatch via `cat /tmp/file.txt`)
- skip Codex Pattern C-V per claim (mandatory)
- score inflation (G45 cap 8.7-8.9/10 ONESTO, NO 9.0+ senza Opus indipendente)
- numeri inventati (cite file:line or vitest output)

## Score target iter 61

8.7-8.9/10 ONESTO G45 cap conditional:
- B1 codemod 63 file 0/154 violations PROVEN (this plan execution)
- Vitest 13163 (baseline preserved + 45 new arithmetic proof)
- Codex Pattern C-V 63/63 PASS per-file
- Build + validator + 4-gate FERREO PASS
- automa/baseline-tests.txt sync 13118

NO claim 9.0+ senza Opus indipendente re-review.

## Files iter 61 entrance

- NEW: `tests/unit/sprint-u-linguaggio-codemod.test.js` (~280 LOC, ~45 tests)
- NEW: `scripts/sprint-u/linguaggio-codemod.mjs` (~250 LOC)
- NEW: `scripts/dev/codex-prompts/verify-linguaggio-codemod.txt` (~50 LOC)
- NEW: `docs/audits/2026-05-15-iter-61-B1-dryrun-sample/{file}.diff` (5 file)
- NEW: `docs/audits/2026-05-15-iter-61-B1-dryrun-sample/{file}-codex-cv.txt` (5 file)
- NEW: `docs/plans/2026-05-15-iter-61-B1-linguaggio-codemod-plan.md` (this file)
- MODIFIED: 63 `src/data/lesson-paths/v{1,2,3}-*.json` (Phase 5 bulk apply post-ratify)
- MODIFIED: `automa/baseline-tests.txt` 13106→13118 (separate commit Phase 6)
