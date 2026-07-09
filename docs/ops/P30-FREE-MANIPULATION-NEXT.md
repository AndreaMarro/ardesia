# P30 Free-Manipulation — Next

State: trace logic proven + unit/typecheck/build green; e2e `test.fixme`-quarantined (RED_BLOCKER on reliability).

## Next single input (smallest, in order)
1. **Verify in clean CI**: run `p30-free-manipulation.spec.ts` (un-fixme locally to trigger) on a fresh runner. The one clean 7.5s pass suggests CI may already be green. If green → remove `test.fixme`.
2. If still flaky, **fix the emit unhandled-rejection first** (highest-leverage): in `apps/studio/src/Room.tsx:922` wrap `emitLessonEvent` so a rejected `IndexedDbEventLog.append` (append-only `add` seq-collision) is caught/ignored — no unhandled rejection, no console error. Then re-run.
3. Only after the trace is reliably green: extend to short-circuit / LED-reversed / missing-resistor cases and wire connect/retarget via the Excalidraw drag callbacks (`onConnectionAdd`/`onWireUpdate`).

## Do NOT (until the above is green)
New plugins, GoodNotes lavagna, graph/HTML, Supabase/Vercel deploy, any Tinkercad-parity claim.
