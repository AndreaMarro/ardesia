# R-03 independent review

Candidate: `ba9c3bdfe1b3218273dcf286e3c56723d204b707`
Base: `c54fa42c1bb34ac37374a5bb228d838b2b4409ec`
Reviewer runtime model/effort: `inherited/unknown`

## Verdict: REQUEST_CHANGES

### [P1] Do not treat an unavailable IndexedDB backend as an authoritative empty live log

`apps/studio/src/RecapView.tsx:99-102@ba9c3bd` unconditionally supplies the
result of `createEventLogStore()` to the canonical exporter. That factory returns
a fresh, empty in-memory envelope log when IndexedDB is missing or cannot open
(`apps/studio/src/lessonos/indexedDbEventLog.ts:885-895@ba9c3bd`). The exporter
correctly treats any supplied envelope log as authoritative: an empty one removes
the stored LessonOS snapshot (`apps/studio/src/store/lessonBundle.ts:178-195@ba9c3bd`).

This changes the recap export from the base behavior (no supplied log, so the
stored snapshot remains eligible) into a successful download with no
`raw/lessonos-events.jsonl`, no error alert, and only a manifest warning. An
unavailable persistence backend is not evidence of a genuinely current empty
canonical log. This breaks export/history compatibility at exactly the failure
boundary that the action is meant to protect.

Reproduction is preserved in `R03ReviewerFallbackLifecycle.test.tsx.txt` and
executed in `focused-recap-causal.stdout.log`: it writes a valid archived
canonical snapshot containing `PRESERVED-ARCHIVE`, verifies the historical
no-live-log exporter retains it, disables IndexedDB, then exports through the
real RecapView and ZIP path. The final assertion fails because the successful
candidate download has neither the LessonOS entry nor a visible error. The five
candidate R-03 tests pass in the same command because they cover factory
rejection but not the factory's documented non-rejecting fallback.

The remediation may preserve explicitly available historical bytes or surface a
local acquisition error. It must not silently export a no-memory bundle merely
because the factory supplied an in-memory fallback; a real empty persistent log
can retain the existing authoritative-empty behavior.

## Checks and limits

- Focused deterministic Vitest command: candidate tests 5 passed; independent
  lifecycle probe failed as above.
- `npm run typecheck` passed.
- `npm run build` could not complete in this deliberately sparse checkout:
  three pre-existing `@elab-pack` files are absent. The raw build log records
  the exact unresolved paths; this is an evidence limitation, not a finding on
  the one changed product file.
- I did not run the full suite, gate, browser, external tools, or any remote
  write. No production code was changed.
