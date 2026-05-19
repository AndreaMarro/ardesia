# EPIC 1 A4.1c — design: consolidate Vol3 duplicate ids + add Vol2 Cap.11

> iter 56. Branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`. Continuation of A4.1b (iter 55, DONE — commit `b0f9efa3`).
> Method: `brainstorming` → `writing-plans` → `subagent-driven-development` (opus subagents). Reuses the A4.1b staging discipline.

## Why (the EPIC 1 mandate — verbatim Andrea, governs the whole epic)

> Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate. Parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine. Questo è Morfismo Sense 2 — il differenziatore non copiabile.

Operating rule: **parità stretta** — the software experiment inventory must exactly equal the *current* printed volume inventory. Over-splits/duplicates collapse to 1:1; what the volume has and the software lacks gets added.

## iter-55 state (entrance)

- A4.1b DONE: 13 Vol3 experiments with no printed counterpart removed (`b0f9efa3`).
- Pre-flight CoV GREEN: `npx vitest run` = **13273 passed / 0 failed**; `npm run build` exit 0.
- `scripts/epic1/a3-corrections.json` (94 entries): 73 `keep`, 6 `correct`, 13 `remove` (done A4.1b), **2 `consolidate`** (this work).
- Codex GPT-5.5 operational (`scripts/dev/codex-bg.sh`, CLI 0.128.0).

## Recon-confirmed facts (Codex CONFIRM + direct file reads)

1. **"Collapse Ch7/Ch8 over-splits" is already 100% complete via A4.1b removals.** `src/data/lesson-paths/` contains exactly `v3-cap7-esp1/esp2/esp3/esp6` and `v3-cap8-esp1/esp2/esp3` — matching the keep/correct contract entries, nothing else. A4.1c has **zero** Ch7/Ch8 work. (The handoff's "collapse" language described work A4.1b already did.)
2. **The 2 consolidations are NOT "merge two copies."** `v3-cap6-esp3` carries repo content *"2 LED alternati"* (not in the volume); `v3-cap6-morse` carries the book-faithful *"SOS in codice Morse"*. Same for `v3-cap6-esp5` *"Sirena con Buzzer"* (not in volume) vs `v3-cap6-semaforo` *"Semaforo 3 LED"* (book-faithful). The named id is the survivor with **its own** content; the numbered id is removed and its **chain slot** is re-threaded. No content is merged in.
3. **Reference surface for the 2 numbered ids = 29 literal hits across 10 files** (Codex-enumerated, file:line):
   - `src/data/experiments-vol3.js` (1529 esp3, 2127 esp5)
   - `src/data/lesson-groups.js` (196 both)
   - `src/data/volume-references.js` (947 esp3, 979 esp5)
   - `src/data/chapter-map.js` (42 esp5)
   - `src/data/lesson-paths/index.js` (82/171 esp3, 84/173 esp5)
   - `src/data/lesson-paths/v3-cap6-esp2.json` (75, 147 → references esp3)
   - `src/data/lesson-paths/v3-cap6-esp4.json` (72 → esp3 prereq; 75, 146 → esp5 next)
   - `src/data/lesson-paths/v3-cap6-esp3.json` (self — file deleted)
   - `src/data/lesson-paths/v3-cap6-esp5.json` (self — file deleted)
   - `src/data/capitoli/v3-cap6.json` (9 lines)
   - plus `scripts/epic1/a3-corrections.json` (the contract).
4. **Vol2 Cap.11 "I diodi"** is a real printed chapter (V2 manual pp.98-102): diodes as one-way current, anodo/catodo, reverse-polarity protection, flyback diodes. Zero `v2-cap11-*` lesson-paths exist in the repo. Net-new addition.

## The A4.1c↔A4.1d boundary — Option B (Andrea-ratified)

The gate's `consolidate` branch currently fires `pending-consolidation` unconditionally. A4.1b's precedent (`36121f8f`): make the pending-state fire **only while the source file still exists**. Mirror it.

**A4.1c does** (consolidation cluster, fully clean):
- delete `v3-cap6-esp3.json` + `v3-cap6-esp5.json`, archive-first;
- re-point every reference *to* esp3/esp5 → morse/semaforo across all 10 files;
- gate fix: `pending-consolidation` fires only while the numbered-id lesson-path file exists;
- update contract `nextId` for the consolidation-adjacent **keep** entries `v3-cap6-esp2` (esp3→morse) and `v3-cap6-esp4` (esp5→semaforo) so the gate's keep-entry check stays green.

**A4.1c does NOT touch** `v3-cap6-morse.nextId` or `v3-cap6-semaforo.nextId` — `morse`'s missing forward link and the pre-existing `semaforo → v3-cap6-esp6` dangling ref are A4.1d "re-thread" items (the latter is already listed in the A4.1b MANIFEST as A4.1d).

Option A (delete + gate-fix only, leave esp2/esp4 re-threading to A4.1d) was rejected: it *creates new dangling refs* — the opposite of the goal.

## Workstreams (2 independent, separate commits)

### WS1 — Consolidation (the strict exit criterion)
1. **Recon** — exact-edit artifact: for each of the 10 files, the precise edit (re-point vs delete). Map every esp3/esp5 occurrence to its replacement (morse/semaforo) or confirm deletion. Codex verifies the recon is exhaustive.
2. **Gate fix** — `scripts/epic1/validate-lesson-paths.mjs` `consolidate` branch: fire `pending-consolidation` only while the numbered-id lesson-path file exists (mirror `36121f8f`). Add a test for the new behaviour.
3. **Archive** — copy `v3-cap6-esp3.json` + `v3-cap6-esp5.json` into a new sibling dir `scripts/epic1/consolidated-into-named-id/` with its own `MANIFEST.md` (these are *consolidated*, not *removed* — distinct from A4.1b's archive). Git-recoverable.
4. **Apply** — delete the 2 files; re-point all 29 refs; update contract `nextId` for esp2/esp4.
5. **CoV gate** (all four, recursive): `npx vitest run` 0-failed · `npm run build` exit 0 · `node scripts/epic1/validate-lesson-paths.mjs` shows **0 pending-consolidation** · Codex diff-review. If any gate fails → fix → re-run all four.
6. **Commit** — honest message, `git diff --cached --stat` verified to contain only authored files (no `AGENTS.md`/`automa/state/*`).

**Exit criterion WS1:** `validate-lesson-paths.mjs` → 0 `pending-consolidation`; vitest 0-failed; build exit 0.

### WS2 — Vol2 Cap.11 "I diodi" (additive, lands after WS1 is gate-green)
1. **Extract** — read `CONTENUTI/volumi-pdf/vol2.txt` pp.98-102; identify the canonical Cap.11 experiment blocks (book-as-ground-truth, same A3 method). Count = N, determined by recon. Codex cross-checks the extraction against the volume text.
2. **Author** — create `src/data/lesson-paths/v2-cap11-espN.json` in the **existing repo lesson-path schema** (same shape as the other 93 — NOT the A4.2 7-step `steps` block; that is A4.2's job). Book-faithful titles/pages.
3. **Register** — add the new ids to `lesson-paths/index.js` and any other data source that enumerates lesson-paths; add `action:keep` contract entries to `a3-corrections.json` with `source:"volume"`.
4. **CoV gate** — same four gates. The validation gate must show the new `v2-cap11-*` entries PASS (keep, contract-matched).
5. **Commit** — separate from WS1.

**Exit criterion WS2:** `v2-cap11-*` lesson-paths exist + PASS the gate; vitest 0-failed; build exit 0.

## Anti-regression (FERREO)

- `npx vitest run` 0-failed before AND after every change. Re-baseline the count **only with an arithmetic proof** (A4.1b method: exactly-N-changed + 0-failed + all-files-collected + no `.skip`/`.todo` added). WS1 deletes 2 lesson-paths → some generated tests legitimately disappear; WS2 adds N → some appear. Each delta carries its own arithmetic proof.
- `npm run build` exit 0 before every commit. Never `--no-verify`, never bypass the pre-commit hook, never push to `main`.
- Never blind `git add -A` — a concurrent autonomous loop modifies `AGENTS.md` + `automa/state/*`; stage specific files, check `git diff --cached --stat` before each commit.
- **Recursive anti-inflation loop** on every claim/score: Claude states claim+evidence → Codex independently re-derives from code/output → disagree → revise → repeat → accepted value = the more skeptical. Codex output saved as auditable artifact.
- **Recursive anti-regression loop** on every change: all four gates (vitest / build / validation gate / Codex diff-review); any gate red → fix → re-run all four.

## Out of scope (explicit)

- **A4.1d** (P1, next): re-thread the 6-file dangling-ref set (incl. `semaforo→esp6`), `morse`'s forward link; apply the 6 `action:correct` per-field title/page/chapter/nextId fixes; survivor-title divergences.
- **A4.1e** (P2): regenerate `narrative_map` / `chapter-map.js` / `lesson-groups.js` from volumes + contract (22 corrected chapter titles).
- **A4.2+**: the 7-step `steps` authoring block per experiment.
- No engine changes, no `simulator/engine/` touches, no test weakening.
