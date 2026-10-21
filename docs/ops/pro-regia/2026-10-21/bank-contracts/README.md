# Independent bank/exam contract probe — PR #270

Source checked: `e9c87b072913744f6cc6df21217b8856cddfef1f`.
Bank manifest SHA-256: `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`.

## Execution and result

Run from the root of the Pro-Regia checkout, with Python dependencies declared
by the Study API and pytest. `ARDESIA_REPO_ROOT` must point to a separate checkout
of PR #270 at the source SHA above: this Pro-Regia branch is based on #269 and
does not include the bank runtime.

```sh
ARDESIA_REPO_ROOT=/path/to/pr270-checkout \
  ARDESIA_PROBE_OUTPUT=/tmp/ardesia-bank-contract-review \
  /path/to/python -B -m pytest -q bin/pro-regia/test_bank_publication_gate.py --tb=short -rA
```

`ARDESIA_PROBE_OUTPUT` optionally selects the evidence directory. The probe uses
the actual 4,000 bundled records and real API handlers through FastAPI's ASGI
TestClient, with synthetic principals in temporary SQLite. It changes no
repository product files or content. No PostgreSQL, production service, remote
browser, or real student data is involved.

Observed result: **1 failed, 2 passed**, 4.01 seconds. The failing assertion
requires the publication gate from the integration mandate: an ordinary student
must not receive questions that have no human scientific/editorial approval.
The actual response was HTTP 200, total 4,000, with DRAFT IDs
`u1-area-conversion-01` and `u1-area-conversion-02` (revision 1).

Evidence is in `bank-contract-red.log` and `bank-contract-observed.json`.

This is a verified failure of the required publication gate in a local demo API,
not a demonstrated cross-student isolation vulnerability or a claim about the
deployed production service. Anonymous access was 401, an unrelated student was
403, and a mismatched manifest pin was 409. Public question projections excluded
answer/solution keys. The sample U6/difficult/completion filters and the 31-item
21/10, five-option, 3,000-second sampler passed. Declared completion answer aliases
were all accepted by the runtime; that is not independent scientific validation.

The current fixture first exercises the existing 200 responses so that it can
collect all contract evidence. A future fix that denies these DRAFT routes with
403 will require splitting this fixture and using explicitly approved synthetic
content for the positive controls. Do not change the publication assertion to
accept DRAFT content or interpret a setup failure as a successful regression test.

## Cause and release implication

- `packages/engine/lessonos/study/catalog.py:35-37` attaches the bank to every
  physics CoursePack descriptor.
- `packages/engine/lessonos/study/question_bank.py:257` accepts only DRAFT records
  with no reviewer; lines 490-495 enforce membership, with no publication gate.
- The routes consequently serve those drafts to ordinary student members.

Keep this content behind an editorial/reviewer workflow until the required
scientific and editorial evidence exists. The authored source records must remain
unchanged and attributed; authorization does not follow from the DRAFT label or
the warning in the UI.

## Other observed contract boundaries

The bank's `/exams` endpoint returns a deterministic practice list, with no
attempt ID, timer authority, submission state, or persistent receipt. A blank
`/attempts` request returns the answer and full solution immediately and reports
`persisted: false`. The synthetic database retained zero submissions and receipts;
it did not have the PR #269 exam-attempt table. This matches the bank's explicit
practice-only design, but it does not satisfy the persistent exam contract. It
must not be counted as a complete simulation or an answer-confidential exam.

A cold load took 1.9345 seconds; peak RSS of the entire test process was 201,684
KiB. This is a single local measurement, not a memory regression, production load
test, or deployment budget violation.

## Adapter recommendation

Use a versioned inbox envelope with the complete original question, source commit,
manifest and shard SHA, record ID and revision, and a deterministic record digest.
Preserve all taxonomy, descriptors, provenance, verification, hints, solution
steps, answer kind and units. Map only a separate canonical view; keep publication
authorization separate and closed. Avoid creating a second canonical learner DB.

PR #269 accepts four options and explanations of at most 4,000 characters. The
new bank has **2,537 five-option MCQs**, and **709 explanations exceed 4,000
characters**, up to 7,428. `adapter-boundary-observed.json` records those structural
measurements. Never discard option E, truncate explanations, or cast exact rational
answers to floats to force compatibility. The existing exam contract needs an
explicit versioned extension before these questions can become exam snapshots;
the lossless inbox can be implemented independently without publishing them.
