# R01 independent review receipt

- Review target: canonical study-digest identity and recap lifecycle only.
- Base: `705284acc4322db4d241032de071437ab0473cc1`
- Head reviewed: `d8e360389addb8a4339290a38763cd6dea58358b`
- Requested reviewer routing: `gpt-5.6-terra/high`.
- Actual reviewer runtime identity: `inherited/unknown` (not asserted from the requested route).
- Independence: isolated detached worktree `ardesia-codex-r01-review-20260921`; reviewed the base/head diff and local producers, callers, and contracts before any builder conclusion or receipt. No product source, committed tests, lockfile, commit, push, merge, deploy, credential, external LLM, or real-input action was taken.
- Scope incident: before the parent clarified the current mandate, these paths outside the authorized worktree were read: `/Users/andreamarro/.codex/skills/persistent-capability-evolution/SKILL.md` and `/Users/andreamarro/ARDESIA-KNOWLEDGE/40-Capability-Evolution/00-INDEX.md`. Their contents were not used as review evidence; no further external-vault or outside-worktree reads were made. `INDEX_SYNC_DEFERRED`.

## Reviewed invariants and attempted counterexamples

1. Identity is envelope `lessonId`, never timestamp window: `RecapView.tsx:62-65@d8e360389addb8a4339290a38763cd6dea58358b` calls `readEnvelopesByLesson(room)`, whose returned rows are exact-equality filtered at `indexedDbEventLog.ts:607-609@d8e360389addb8a4339290a38763cd6dea58358b`.
2. Missing `lesson.started` does not widen scope. The reader filters by `lessonId`; no start/end event contributes to selection.
3. Legacy rows are projected as `unassigned` by the existing log contract, so a named lesson query does not assign them. The patch's own UI test covers this.
4. Only factual envelopes enter the graph: `studyDigest.ts:71-77@d8e360389addb8a4339290a38763cd6dea58358b` uses `toLegacyLessonOsEvent`, which returns `null` for advisory/unknown kinds. Materialized facts preserve their evidence refs; preview and HTML download share the same memoized `recapHtml` at `RecapView.tsx:86-89@d8e360389addb8a4339290a38763cd6dea58358b`.
5. Navigation and WorkspaceStore transitions cannot expose a previous result: state is reset at `RecapView.tsx:51-56@d8e360389addb8a4339290a38763cd6dea58358b`; the rendered value is additionally keyed by the same store reference and room at lines 44-49; the effect cancellation prevents late publication at line 65.
6. A successfully opened log is closed on either successful or rejected read through the `finally` at lines 63-68. A rejected reader remains fail-soft.
7. Concrete falsification beyond the committed suite: I installed a temporary UI probe that acquired lesson A's log, held `readEnvelopesByLesson(A)` pending, navigated to B, waited for B's digest, then released A. It asserted A content never appeared after navigation and both opened log handles closed exactly once. It passed. The temporary test was removed byte-for-byte from product/test paths; preserved source and exact command/exit output are `R01DigestDelayedReadProbe.test.tsx.txt` and `R01DigestDelayedReadProbe.log.txt` in this directory.

## Executed checks

All subprocesses used Node `v22.14.0` and removed `KIMI_API_KEY`, `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and `ARDESIA_CHROMIUM_NO_SANDBOX` from the environment.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci --no-audit --no-fund` | 0 | lockfile dependencies installed; no lockfile update |
| `npx vitest run src/__tests__/R01DigestDelayedReadProbe.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000` | 0 | 1 file, 1 test passed |
| `npx vitest run src/__tests__/studyDigest.test.ts src/__tests__/PostLessonDigest.test.tsx src/__tests__/RecapView.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000` | 0 | 3 files, 25 tests passed |
| `npx tsc -b --noEmit` | 0 | passed |
| `npx vitest run src/__tests__/IndexedDbEventLog.test.ts src/__tests__/recapHtml.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000` | 0 | 2 files, 56 tests passed |
| `npm run build` | 0 | passed; only existing large-chunk warnings |
| `git diff --check base..head` | 0 | passed |
| reviewer worktree tracked diff after probe cleanup | 0 | clean |

## Findings

### Introduced findings

None found. The patch removes the timestamp-window fallback, uses the existing canonical lesson reader, rejects stale state by store-and-room identity, and makes the opened log lifetime exception-safe. The new tests exercise overlapping lessons with and without a start event, unassigned legacy rows, rejected reads, late open, and preview rendering.

### Inherited/out-of-scope observations (not reclassified as introduced)

- `apps/studio/src/store/lessonRecap.ts:43@d8e360389addb8a4339290a38763cd6dea58358b` still reads `PATHS.JOURNAL`; its journal-path/v2 parsing behavior is unchanged by this diff. The patch reset prevents stale digest reuse if that independent recap load fails, but does not repair it.
- `apps/studio/src/RecapView.tsx:97@d8e360389addb8a4339290a38763cd6dea58358b` still delegates `.lesson` export to `store.exportLesson(room)`; no live LessonOS export was added at this caller. This pre-dates the patch and no interaction that corrupts digest selection was found.

## Coverage limits

- No full suite, browser E2E, physical-device run, pilot, release, deployment, remote PR mutation, or real student input was run.
- The existing production implementation of `readEnvelopesByLesson` currently reads the canonical snapshot then exact-filters it (`indexedDbEventLog.ts:607-609`); this review verified the returned scope and the existing IndexedDB contract tests, but did not turn this bounded fix into an index/query redesign.

## Verdict

**APPROVE — patch scope only.** This is not approval of the wider product, pilot, release, or inherited journal/export behavior.
