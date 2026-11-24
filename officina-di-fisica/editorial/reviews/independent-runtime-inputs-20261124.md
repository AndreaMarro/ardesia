# Independent AI review of private-preview runtime inputs — 2026-11-24

Reviewer: AI reviewer separate from the runtime patch author and integrator. This is a technical evidence review, not a human approval, scientific approval of additional records, or publication authorization. No candidate, application runtime, policy, engine, registry, or test file was modified by this reviewer. Only this note is reviewer-owned.

## Scope and result

Read `runtime_fingerprint.py`, `integration.py`, the relevant registry tests, `browser-drafts.mjs`, and the actual exam-policy and engine adapters. The added bundled `policies` and `extensions` directories close the identified dependency omission: `/api/state` reads `policies/exams.json`; engine initialization reads installed manifests and JavaScript. The existing recursive `static` coverage includes vendor files. The existing exclusion remains limited to offline `contracts/corpus-*` schemas; the actual `engine-v1` runtime contract remains included.

The fingerprint includes the bytes of its own protocol module. Changing this module invalidates previous browser proofs when `validate_browser_preview` recomputes and compares the complete runtime fingerprint. Fresh rendering of the registered batches is required; this review does not attest completion of that rendering.

## Findings and verification

1. **P2 external engine override: resolved in fingerprint and browser proof entry.** The application engine adapter supports `ASTRA_EXTENSIONS`, but previously the fingerprint covered only `app/extensions` while the proof harness inherited the environment. A temporary counterexample changed external engine bytes without changing the runtime fingerprint. The new `assert_bundled_runtime` rejects a nondefault configured root before fingerprint reads. Browser proof generation executes that fingerprint with the same environment and working directory as its server, before boot/import. The proof is explicitly scoped to bundled engines; custom installations are not certified by silently omitting their inputs.

2. **P2 relative override across integration working directories: resolved.** Previously `exercise_package` checked `ASTRA_EXTENSIONS` in the caller's working directory, then launched its child with `cwd=APP` and the unchanged relative environment value. From the repository root, `ASTRA_EXTENSIONS=officina-di-fisica/extensions` passed the check, but the child resolved it under `APP/officina-di-fisica/extensions`, rather than the fingerprinted `APP/extensions`. Independently reproduced using temporary directories and a mocked subprocess, without creating a DB: guard accepted, effective child engine root differed. Reread the final fix: after checking the supported configuration, integration explicitly passes `str(APP/"extensions")` to its child; the browser also explicitly passes `path.join(root,'extensions')`. Repeated the same independent temporary-directory counterexample: the child path is now absolute and resolves exactly to the fingerprinted bundled root. The new regression test also covers the changed caller/child working directories. No remaining actionable finding was identified in this scoped patch review.

Executed with `/private/tmp/cric-recovery-venv/bin/python`, bytecode writes disabled and scratch cache outside the workspace:

- Four targeted registry tests passed after the final fix: relative override converted to an absolute import-child root, external override rejection before package/DB access, bundled policy and engine byte invalidation, offline corpus schema versus actual reader contract invalidation (4/4, 0.156 s). The earlier three-test snapshot also passed before the relative-path regression was added; it did not establish closure of that finding.
- Independent stronger engine check: created a temporary `extensions/sample/1.0.0` with a valid `engine-v1` identity-law manifest (`m` to `m`), two exact reference pairs, and matching JavaScript hash. The real `load_registry` accepted both successive script/manifest versions after clearing its process-local cache; their runtime fingerprints differed. This supplements the simple file-enumeration fixture, which does not itself construct a valid installed engine.
- No full registry browser run or production DB operation was performed by this reviewer. Two blocked reviewer Git reads were terminated and are not reported as passing checks; direct file reads and the targeted recovery-runtime checks completed.

## Reviewed snapshot (SHA-256)

| File | SHA-256 |
|---|---|
| `tools/corpus_engineering/runtime_fingerprint.py` | `c23abf00cb3665ac9d5b90c1f8256852045a7582fa5e8bae5acf31462b619ab8` |
| `tools/corpus_engineering/integration.py` | `7a2bc8a636a3f54e6f4663ffa580d24c7cb2272ac188752e19b8b9d3208b991b` |
| `tests/corpus/test_batch_registry.py` | `4a7fc9a745385b598b8aaf2e3b3bf818bae26b65d87a7dda0f95993bc3da67a7` |
| `tests/corpus/browser-drafts.mjs` | `48321c32b2aa5f783bfb9099db3551bd5e4450e52ea1aa7769e5c45877b6f88c` |
| `server/adapters/engines.py` | `c1bd1a5eb81f568fd86b22195ffb27ca633758b2282d46bed492d13275aca936` |
| `server/adapters/exam_policies.py` | `137fa066420195e32d010a41d820c38b5cc10ce7d32722b23ed8babcda5ec0c0` |
