# Registro: immutable payment anchor follow-up

Base: `2d6002b17bedc567bf3057d6265b459807235bc3`. Follow-up commit: 78696de9c8caa0efa76a94d2ec9409cc7e83a334. This is the UI author's fix, not an independent review. The independent reviewer supplied I13 and positive bad-behavior witness W01 before implementation; the original candidate and witness remain unchanged.

## Change

A single `isPaymentRevisionOf` guard validates the server DTO and exact immutable edition/entry/person/external-reference/currency/original-offer anchor. The offer comparison covers price, currency, management revision, edition state and mode. Amount, correction status, record/revision/receipt identifiers, author, date and reason remain revision fields.

The guard is used for off-page exact-entry reread, adoption from the visible page, and entry history. A crossed response cannot replace the origin correction. In-page mismatch also blocks submit and displays the existing invalid-response notice. Off-page failure hides any adoption action, including a previously retained read slot. The user retains original amount/reason; a valid newer record is still adopted explicitly, and the next POST uses its exact CAS revision/record ID with the user's retained draft.

No Core/API/schema/dependency/lockfile/runtime/Auth/Storage/PG change, new ledger or extra route. No new visual design. Existing actor/epoch/draft-affinity, request keys and ACK validation remain in place.

## Verification and provenance

All network responses in the new component tests are explicit HTTP mocks. They do not demonstrate an ACL bypass or an actual PG/Auth write. Eight regressions cover five crossed off-page anchors (person, reference, offer price/revision/state), in-page mismatch, exact entry history, and valid explicit adoption followed by an ACK and exact CAS payload.

- Independent original I13: RED; W01: bad behavior reproduced before this fix. W01 PASS means observing the bug, not passing acceptance.
- Final test file replayed against a fresh immutable `git archive 2d6002` plus only the new test: five causal failed assertions, two 5s timeouts (person/in-page), one positive CAS PASS. Do not label all seven failures causal. Source archive and complete log retained.
- Same final test file on fixed source: **7 PASS / 1 first cold-case 5s timeout** (person). No timeout increase, test reordering, assertion removal or retag as eight PASS. Reference/offer checks, in-page block, history rejection and valid CAS all passed. Independent I13 recheck is still required on the new commit.
- Typecheck final: PASS (exit 0, final source).
- Production build: PASS (exit 0; Vite 5.17s).
- Full Web / browser / real HTTP/Auth/PG: NOT_RUN for this follow-up, per serialized QA coordination. Prior candidate 2d6002's proofs are not relabelled as tests of this new commit.

Official Vitest 4.1.8 used one worker. Forks repeatedly failed to start before transform/import/test; the official threads pool executed tests with the same assertions and timeouts. Node `/opt/homebrew/bin/node` v26.5.1, dependency cache `/tmp/ardesia-node-qa-local-20261020`, no installation. Allowlist execution supplied only PATH, TMPDIR and LANG; the corrected frozen-baseline and fixed-source threads commands used this allowlist. No provider/network was used by the mocked flows.

## Preserved attempts

- `red.log`: first setup/run, eight failures with resource timeouts; shell then hit zsh's reserved `status` variable after Vitest. The Vitest log is intact. Not counted as causal product RED.
- `first-test-attempt.tsx`: exact first test setup.
- `red-causal.log`: no test executed; forks worker startup timed out (63.44s).
- `green-focused-interrupted.log`: our process was terminated (143) to serialize QA; no verdict.
- `green-focused.log`: four forks startup errors, zero tests (252.32s), even unchanged tests did not start.
- `green-threads.log` and `threads-harness-before.tsx`: one history PASS, seven setup failures; an outer async act batched click and field-query before rendering the fields. Corrected only setup sequencing, not assertions or timeouts.
- `red-frozen-baseline.log`: final setup against immutable old source, 5 causal assertion failures + 2 timeouts + 1 positive control PASS (104.69s).
- `green-threads-corrected.log`: final fixed-source 7 PASS + 1 first cold-case timeout (65.01s).

Cause of host/worker slowdown is not established; no FileProvider cause is asserted. No further broad suite or browser was launched to force a green result. No G0/G1/global certification follows from this follow-up.
