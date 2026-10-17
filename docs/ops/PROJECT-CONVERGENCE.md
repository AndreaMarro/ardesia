# Project convergence — decision register

This register records decisions and evidence pointers. It is not generated
repository state. Run `python3 bin/state/project_state.py` for CURRENT; verify
GitHub and the actual checkout before starting another slice.

## Scope of P0-A

Issue [#263](https://github.com/AndreaMarro/ardesia/issues/263) requires the
distributed product to stop depending on the suspended vertical, with history,
notices and old documents preserved. The existing `elab_boundary_gate.py`
ratchets standalone-shaped filenames. It does not inspect Studio imports or
built bundles. These are different checks and both are kept.

The added scanner inventories tracked worktree files and, when explicitly
provided, a built Studio directory. It records SHA-256, index blob IDs, marker
counts and locations, and separates current-source candidates, legacy source,
test fixtures, historical evidence, tooling and licence notices. No excerpts
or student data are exported. Existing product code and gates are unchanged.

**Exit 0 means inventory completed, not decoupling completed.** The report
declares skipped binary/oversized content, symlinks and gitlinks. It is lexical
triage: comments may match; encoded strings, transitive imports, licences,
rights and visual brands require other evidence. Never delete required notices
to obtain zero matches. No source category proves runtime reachability.

```sh
python3 bin/audit/test_legacy_inventory.py
python3 bin/audit/legacy_inventory.py --output artifacts/audit/source.json
python3 bin/audit/legacy_inventory.py --artifact-root apps/studio/dist \
  --output artifacts/audit/legacy-inventory.json
```

An omitted artifact is `NOT_RUN`. A requested artifact must be inside the
repository, without symlinks in its root path, and contain readable `index.html`
and at least one JavaScript file. Entrypoints and dependency closure are not
validated. Output symlinks and linked ancestors are rejected; a regular previous
report may be replaced atomically. Use a stable checkout, since concurrent
directory replacement is not isolated. The CI inventory lane checks out the exact
PR head, builds with matching Vite provenance and uploads the observed byte
inventory. Existing integration CI continues to use its normal checkout.
The inventory lane does not certify the golden path or become a required
protection check through this PR.

## Snapshot reviewed on 17 October 2026

Main was `b124eee04acc8062c27284f23c5d9108e3767c27` (23 August). GitHub listed
three required check contexts. The integration token could not read the full
branch-protection endpoint (403); no claim is made here about current approval
counts, last-push review or admin exceptions. CodeRabbit's green status on #264
is accompanied by a "Draft PR not reviewed" comment and is not an approval.

| Work | Source / last observed head | Decision | Next action / risk |
|---|---|---|---|
| Main | `b124eee04acc8062c27284f23c5d9108e3767c27` | KEEP baseline | Re-read before a write; no merge/deploy mandate. |
| #264 | `b41380e32dee962599dc0bc02ac7cd1d8342590f` | KEEP DRAFT | Reconcile regulation and canon; RFC/manifest are not runtime. |
| #256 | `705284acc4322db4d241032de071437ab0473cc1` | SELECTIVE RECOVERY | Review material/ingest slice against main before reuse. |
| #257 | `1c3f546a709d1004e291d5938073d6a5b7ecf8db` | SELECTIVE RECOVERY | Isolate lesson identity and recorder v2 fixes; base is #256. |
| #258 | `f155d37fbd587cdfb3ce8b8e33f5352f77d37c10` | SELECTIVE RECOVERY | Persist-before-navigation and export; base is #257. |
| #259 | `50aed925d44542f923687c186fde7034b1dba1fd` | ARCHIVE REFERENCE | Preserve room/PDF prototype; no whole-stack merge; base is #258. |
| archive/codex-finalization-20261015 | tag `5b1f65779701ba680a9b4d7d0841dc9c021422ff` | PRESERVE | A tag, not an active implementation branch. |
| archive/codex-finalization-20261015-closed | tag `dd6c5da456b0581f2aaf5ce03a5da9033e0df35b` | PRESERVE | Compare only bounded recoverable fixes. |

PRs #256–259 are closed without merge. A non-null synthetic merge SHA does not
mean the PR was merged. Source: each PR's current `merged=false`/`merged_at=null`.
The owner for acceptance is Andrea Marro. An implementing agent may propose a
slice; it cannot supply the human approval or replace a professional licence
review. Other historical branches remain UNASSESSED, not implicitly abandoned.

## Decisions and bounded next slices

| ID | Decision | Acceptance before the next slice |
|---|---|---|
| ADR-P0A | Add repeatable source/artifact evidence before removal. | Scanner contract, exact-head build and readable inventory; explicit unchecked areas. |
| ADR-P0B | Keep old log bytes immutable; neutral pack identity for new observations. | Positive two-pack isolation and negative legacy replay tests; no invented provenance. |
| ADR-P0C | Separate raw exam score, career grade and rank score. | Integral normative sources, boundary cases and human syllabus review. |
| ADR-AI | New intent allows optional proposed feedback; current ZERO-LLM canon needs explicit reconciliation. | No inference enabled by this PR; proposer cannot approve work or certify physics. |
| ADR-UX | Keep Lezione / Continuita / Materiali and test a contextual review queue. | Real captures and human task timings before selecting a redesigned interface. |

Limit implementation to one next PR: P0-B after inventory review. Then P0-C as
a separate exam-profile contract. The manual upload/review loop follows those
boundaries. Do not open a parallel marketplace, a second login/CRM, a new canvas
framework or a generic AI orchestrator while the first useful journey is open.

## Evidence and remaining gates

- The author ran synthetic contract tests locally; no Mac or student pilot is
  claimed. The first RED was the absent inventory module; disabling marker
  detection in a disposable control copy made positive fixtures fail. Review
  then reproduced artifact/output symlink defects; regression tests failed
  before their correction. Dense-marker scanning also has a bounded-run check.
- Read the new PR's exact-head inventory workflow result and artifact. Do not
  substitute an older branch's green check or an uninspected Vercel preview.
- Independent review must record findings plus `not_checked`. Human approval,
  full protection details, mobile/iPad/Pencil/LIM, access across two identities,
  data migration, transitive imports and licence provenance remain distinct gates.
- Update this register after decisions, preserving prior reasons and linking
  actual evidence. Do not hard-code a future PR number, SHA or test outcome.
