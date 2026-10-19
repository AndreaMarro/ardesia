# SDD ledger — plan: docs/study/10_PIANO_IMPLEMENTAZIONE.md

Goal: M1 Fisica Semestre Filtro, dossier M2; hourly reread of the four user files.
Worktree: /Users/andreamarro/VOLUME 3/ardesia-semestre-m1-20261019
Branch: codex/semestre-filtro-m1-20261019
Base: b124eee04acc8062c27284f23c5d9108e3767c27 (remote main checked via gh API).
Source sections: /Users/andreamarro/VOLUME 3/.ardesia-semestre-control/01a155c1-aa83-7272-a166-e3e7d6b4c391/
Heartbeat: ardesia-riesame-e-prosecuzione-ogni-60-minuti (ACTIVE, hourly, this thread).

## Rulings
- User asks to execute the supplied scope. Documents are specifications, not independent permission to send messages, spend, publish, merge or use private third-party code. No external messaging.
- Native create_worktree cannot address the nested repository (Not a git repository at chat root). Manual linked worktree created from verified remote main; original checkout has unresolved merges and is untouched.
- Preserve existing ZERO-LLM production boundary: deterministic hints and explicitly synthetic candidate provider only. No live AI or student voice capture; synthetic audio upload is a separate private asset.
- Existing entitlement service owns sandbox commerce and uses a JSONL store; it does not provide authenticated transactional study resources. Study domain will live inside LessonOS with a thin HTTP adapter, not another source of domain truth.
- Plan uses T00–T11 headings; keep those IDs in this ledger. Do not silently renumber with skill helper scripts.
- Microdemo exact commit absent (git cat-file), receipt search and named patch/bundle search in Downloads, VOLUME 3 and ardesia-wt found no October demo. Historical July bundles cannot contain the October commit. Rebuild only missing slice; never claim historical recovery.
- Existing local Python environment is reusable for test dependencies; PYTHONPATH must point at this checkout, never another editable install. Dependency changes remain pinned in a new service lock when needed.

## Interface preflight
- T01→T02/T03/T04/T05: server-owned Principal, resource/revision/context IDs; renderer never owns ACL.
- T05→T06: immutable submission revision + receipt; feedback binds exact source versions.
- T06→T07: only human synthetic tutor review yields observation; LessonOS adapter derives projection from review events.
- T07→T08: permission-filtered context and live source versions before hints/cache.
- T01–T08→T09: same production HTTP boundary and built frontend; seed only synthetic identities.
- T09→T10/T11: evidence with SHA and explicit NOT_RUN, no screenshots-only acceptance.

## Task state
- T00: complete — hashes/base/recovery limits recorded; baseline typecheck/build/suites and legacy reader/browser roundtrips run.
- T01: complete — 7 domain+HTTP contracts pass; SQLite backup/restore, session authority, peer/tutor isolation, rollback and additive legacy migration. HTTP tests live with the service so Engine keeps its dependencies.
- T02: implemented and browser-integrated; final candidate replay remains in final verification.
- T03: implemented — original deterministic lab and persisted interest roundtrip, DRAFT editorial status.
- T04: implemented — transactional cap, hold expiry/idempotency, date conflicts and compatibility explanations tested.
- T05: implemented — original media validation/private storage, atomic submission and persistent receipt.
- T06: implemented — actual synthetic-tutor UI review, clarification and linked second attempt.
- T07: implemented — canonical LessonOS projection, permission-filtered context, invalidation and rebuild.
- T08: implemented — zero-spend deterministic hints; live providers remain disabled.
- T09: implemented — previous full built-browser journeys passed; final clean-SHA run is required.
- T10: implemented — private portable notebook, synthetic clips/screens, launch draft and M2 checklist.
- T11: final verification — independent review repair pass complete; await frozen gate and final receipt.

## Checks and evidence
- State generator: python3 bin/state/project_state.py, exit 0; all reported surfaces MEASURED.
- New product API consumption: 0 USD. No live providers enabled.

- Baseline correction: initial Engine run used repository root; 14 failures were missing relative fixtures. Correct package cwd: 2049 passed/7 skipped (includes new T01 tests). Studio: 2149 passed/5 skipped. Build and typecheck pass.
- Review T01: self-review; same DB as SQLiteStore, private resources checked before response; no client identity accepted. Full branch fresh review remains T11.

- T00 legacy browser baseline: saved-lessons export/import passed on production build. Two legacy post-it tests timed out at __MAESTRO_TEST__.ready, a dev-only hook; rerunning those via their intended dev server, keeping the production-build failure log. New study E2E will use visible UI and real API only.
- T02 component and reference tests pass (3); typecheck pass. T03 deterministic physics and interest/domain isolation tests pass (11); service public roundtrip passes. T04 capacity, concurrent last seat, hold expiry, calendar and matching tests pass (6). Browser integration pending.

- T00: baseline recovery checks complete; legacy .lesson cold import/export passes on build, legacy postit tests pass on intended dev server (2). Their build failure is a dev-only hook, retained, not a product regression.
- T05–T08 domain implemented. 54 scoped domain/API contracts pass including multimodal bytes, private blobs, atomic receipts, review, next attempt, LessonOS projection/rebuild, stale invalidation, deterministic zero-spend hints and malformed payloads.
- T09: frontend attached at ?vista=fisica on built Studio; synthetic loopback server running on :5208. Real ten-context browser journey running; do not run overlapping writers or reset its database.
- Dependencies: image/PDF validators isolated as Engine [study] extra (Pillow also dev for default tests), pinned service lock; ffprobe required only for declared audio validation. No live models/ASR run.
- Ruling: new portable .study.json is explicitly read-only, ACL-filtered, with original asset hashes and omissions. Existing .lesson handles historical canvas/journal. Do not claim new notebook format restores enrollment/auth or legacy canvas.

## Fresh-context review and adjudication
Reviewed head b097a4982a1abeb022aa87f785e15ec176201e2c, base b124eee0, independent read-only reviewer.
- P1 commit-response-lost + remount: confirmed with RED component test; persist complete immutable pending payload and original key before sending. Source selection and new attempts cannot change a pending retry.
- P1 source-less accepted submission: confirmed with RED domain test; transaction now creates a private immutable original source and stable student context alongside submission/receipt. No empty-source observation can become unresolvable.
- P2 portable reader metadata: material to requested source/attempt/review readability, fixing in the single review repair pass. Viewer now reads metadata, revisions, receipts, review and original media from the verified file itself.
- P2 stale physical result on network failure: material to the scientific UI contract; RED reproduces old Q result under new fixed-flow label. Invalidate result on every input change.
- Declined to judge M2 production auth/deploy/live AI/ASR/real payments/human pilot/scientific approval: remain explicitly NOT_RUN/NOT_AUTHORIZED; not required to simulate M1.
- Reviewer not_checked: no independent full suites or future clean-SHA run; no physical crash or real full disk. Those claims are not inferred.
- Full Studio first run: two failures — design tokens (new CSS hexes, fixed by moving palette to canonical tokens.css), and provenance (HEAD changed while tests ran, invalid test procedure). Never commit during final test/build verification.
- Frozen gate first run reports 23 failed on Homebrew Node 26; reproducing its exact default runner to inspect failures before choosing any change. Gate script untouched.
- Node 26 diagnosis: exact frozen invocation reproduced 22 legacy failures, caused by undefined native `localStorage` shadowing jsdom storage. Runtime Node 22.14 with documented threads flags had passed baseline. Add an explicit test-environment Storage contract only when storage is absent; preserve native jsdom storage and every assertion/gate. Do not bypass or change frozen gate.
- Ruling: no selected source means an accepted attempt itself becomes a private original resource in the same atomic commit. Export test now expects both the explicitly saved note and that actual original (2), preserving peer isolation and independent hashes.
- Repair-pass tests: pending receipt key/payload survive remount; no-source review context resolves; physics stale result omitted; canonical palette tokens. No extra model/ASR/payment capability enabled.

- Code freeze: all following final checks must run with HEAD unchanged and a clean tracked tree. The generated final receipt in artifacts/study-demo is authoritative for gate execution and final task completion; committed prose records its observation time, not future results.
- Node 26 fix verified on all five affected legacy files: 112 tests pass with explicit missing-Storage setup. No assertions, test inclusion or frozen gate changed.

## M2 local preparation — 2026-10-19
User authorizes autonomous work toward M2, keeping no merge/public deploy/API spend and the hourly reread. Plan: m2-plan.md. M1 receipt remains historical proof.
- Task1 RED→GREEN: 59 scoped domain/API tests. Single-use invitations, concurrent redemption, expiry/revocation, tutor ACL, session self-revocation, HTTPS cookie option, persistent auth/public-interest throttling and bounded bodies. Production startup remains refused. Local synthetic security patterns are not a production approval.
- Task2 RED→GREEN: 64 scoped tests. Cooperative same-host DB/blob barrier, hash-paired backup v2 without sessions, verified staged restore with current erasure ledger, logical study-student erasure of originals/history/receipts/review/projection/blob; interrupted intents replay before HTTP startup and backup. Reject foreign legacy enrollment and teacher deletion. Preserve peers. Health CLI + authenticated integrity endpoint. Study schema additive v2; old M1 code refuses newer schema. Physical SSD/snapshots/downloaded exports and external copies require operator handling; no forensic or GDPR-compliance claim.
- Task3 RED→GREEN: 75 scoped domain/API tests and new UI preview regression pass; typecheck pass. Original DRAFT pack: 24 exercises, 4 models, 2 distinct transfer tests (6 items), proposed solutions, SI/unit domains, rubric and hash export. Public loopback preview + Programma DRAFT tab; previous numerical result clears on failed recalculation. Added usable tutor invite panel, one-use login option and self-revocation UI; no messages sent. Final build browser proof still pending.
- Task4 prep: human decision register remains PENDING; read-only readiness cannot authorize launch, production startup still refused. Runbook includes current erasure ledger, unsupported external copies/contact cleanup, recovery without seed, monitoring and operational owners. New browser spec + cold HTTP restore/erasure proof runner prepared. Final fresh review and clean-SHA verification pending; no claim of completion before receipt.
- Fresh M2 review of da0beb94..ef0f45d7 found 3P1/1P2, all material and reproduced with five RED cases: legacy-only scope deletion, truncated DB false health/backup, blob-directory symlink external deletion, tutor hint derivative receipt residue. Single repair pass: preflight read-only DB validation; reject legacy-only/symlink paths before intent; recursive structured source receipt cleanup. Scoped suite 81 passed. See m2-fresh-review.md for declined-to-judge rulings and CoursePack preview/submission limit. Prior preliminary full-suite/built-browser passes do not supersede the required final frozen-SHA run after repair.
- Verification procedure correction: empty KIMI_API_KEY mistakenly enabled the legacy live test's presence-only guard; it failed before provider creation (zero calls). Correct invocation unsets live keys, 2109 passed/7 explicitly skipped on pre-repair SHA. Test and gate unchanged.
- Repair follow-through: HTTP budgets blocked valid 20k Unicode characters and self-exported notebook framing. Two observed RED 413 cases, then GREEN: ordinary 256 KiB, notebook 96 MiB envelope, existing decoded-asset 50 MiB limit preserved. Oversize-body assertion retained at new documented boundary. Scoped 82 passed. Superseded final-check job stopped before committing this compatibility fix; final evidence must use the next clean SHA.
- Verification record correction: the first stop guard refused because macOS names the wrapper executable Python, not python3. The compatibility commit landed while the superseded gate was still running. Its process identity was then inspected and its own process group terminated. Discard that interrupted gate as final evidence; all acceptance below must run again with HEAD fixed after this journal correction.
- Owner request: publish all work on GitHub. Preparing branch/PR plus complete task evidence archive and four source files; public repository confirmed. Exclude runtime DB/access files and normalize machine paths in evidence text. Archive scanned for repository secret patterns and actual runtime access tokens, hashes verified. Product tested SHA remains d966863e; publishing adds only docs/evidence and per-branch Vercel no-deploy guard. Merge/public deployment/API spending remain unauthorized.
