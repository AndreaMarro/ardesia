# PRO delta 2026-10-26 — integration seams, not a second product strategy

Status: **DELIVERED_IN_DRAFT / NOT_MERGED**. Observations captured from GitHub on 2026-10-26, approximately 06:02–06:25 Europe/Rome. This dated handoff supplements `docs/CANON-INDEX.md`, `docs/PRODUCT-CANON.md`, `docs/ARCHITECTURE-CANON.md` and `docs/ops/AGENTMEMORY-SEMANTIC-PROTOCOL.md`; it does **not** replace the generated state or transfer common-file ownership away from the root integrator. Historical chat exports were **NOT ACCESSIBLE** during this cycle. No writes to private `ardesia-knowledge`, whose `00-CURRENT.md` remains an explicit **DEGRADED July 25 snapshot**, were made.

## Observed anchors

- `main` at **`992d1a0b5cdf40d94259d3be698a4d6c5dcc1231`**, confirmed through GitHub branch API. PR #304, #306, #307 and #308 have merged; #306's public five original examples are not the 200 accepted objectives. The dated `docs/ops/NEXT-SESSION-PROMPT.md` still says the increment lives only in PR #306 and is **STALE** with respect to the October 26 branch state. Do not edit its generated counterpart; let the designated root writer reconcile it.
- **12 open PRs** (#309–#320), all based on `main` but not necessarily standalone in semantics. PR #315 explicitly requires #316's route contract; #314's private shell is not a remote Study API. #318 and #319 include Room integration patches not yet applied by S00. A file-level overlap census cannot detect these logical dependencies.
- #314 head `c55d7902d7ef8e89627c9a44a5c805101f6c7c4b`: CI, marketing-static, studio-preview-readiness and pr-contract returned **SUCCESS** for their own run `40255167655` family; the PR itself says backend `/study` responds 503 when unconfigured. These checks do not demonstrate authenticated remotely persistent teacher↔student continuity.
- #315 head `b6cba73dfec35a243da3e4c322ba58546b1ca3fb`, #309 head `2401f4c9f22c375a8a9c4541c5b7e8f1f48a8716`: their CI suites reported **SUCCESS** at those SHAs, not on a combined merge tree. Both remain open.
- Kirchhoff README describes DC/AC/Laplace lessons with differing verification coverage and a standalone MCP App. `ELABTutor` ownership and redistribution conditions need explicit human/legal clearance, not a bulk manual rewrite.

## Micro-goal delivered: reproducible collision inventory

New `bin/ci/pr_overlap_report.py` is a read-only, non-mutating instrument for the S00 integrator. It uses the `gh api` already assumed by `project_state.py`, requires no runtime dependency, never prints auth tokens, snapshots `main` before/after, and lists path-level overlaps with a small seam classification. A fixture option allows offline replay. It **refuses** malformed PR inventories.

**Validation:** three focused Python unit tests **PASS** locally on the corresponding logic. Code and test file committed on this separate branch; runner against live GitHub on a developer host: **NOT_RUN** (no remote execution device in this automation). Exact integration into `main`, general CI, and actual combined-branch compatibility: **NOT_RUN**. No claim of deployment or successful REA runtime capture.

This tool is deliberately **not another state generator**. `CURRENT.md` remains solely the output of `bin/state/project_state.py`. This tool only provides a time-pinned review hint. A warning-free output **never** means compatible contracts, safe auth, green merge-tree CI, or a product that works.

Run on a connected checkout:

```bash
python3 -m unittest discover -s bin/tests -p test_pr_overlap_report.py
python3 bin/ci/pr_overlap_report.py --repo AndreaMarro/ardesia --base main --format json > /tmp/ardesia-pr-overlaps.json
```

Compare the result against the exact PR heads, and record it alongside the composed-test SHA; do not commit transient JSON as current truth.

## Three strategic corrections required

1. **Misleading surface area:** public marketing examples, 43 DRAFT lessons, 200 target cards, scientific modules and a private preview are different maturity levels. The accepted-coverage denominator (52/57/33/58) remains unresolved absent complete educational and human editorial gates. Do not advertise four completed courses.
2. **False-green integration:** S00 and multiple specialist PRs pass different slices independently. `main` does not yet contain the parallel #309–#320 work. UX routing, cross-student isolation, persistence and reviewer workflow must be verified on a *single identified composition*, not by adding check counts or screenshots from isolated branches.
3. **REA scope drift:** recent useful acquisitions (Yjs, FullCalendar, MathLive, JSXGraph, Cytoscape, FSRS) are implementation primitives, not proof of a complete lesson operating system. REA's browser observation is opt-in and evidence-based, and transfer needs permitted scenario, source/version/rights, behavior contract, RED/GREEN and real browser comparison. No REA capture was run from this session. No software rights are inferred from visible source; especially note tldraw production licensing.

Official REA references consulted: https://github.com/morluto/rea ; https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md ; https://github.com/morluto/rea/blob/main/docs/browser-observation.md ; https://github.com/morluto/rea/blob/main/docs/reconstruction-readiness.md ; https://tldraw.dev/sdk-features/license-key .

## Architecture decisions (proposed, not ratified)

- Do not replace the current Core with a fresh backend because a donor UI appears more polished. Choose REUSE / ADAPTER / REWRITE from measured consumer behavior, migrations, licenses and rollback.
- MCP first write: authorized **private correction proposal** on an existing Study submission using existing feedback candidate/review use cases. Bind tenant, actor, submission, source digest, optimistic version and idempotency key; log action, require distinct teacher approval for publication. No arbitrary database writer. **SPECIFIED / NOT_RUN**, not an existing public write endpoint.
- LessonOS differentiated slice remains audio consent → timed scene/event → exact evidence → teacher-reviewed recap → distinct transfer problem → subsequent lesson. A plugin cannot be the second owner of student identity, billing or session authority.
- Tutor business value must be validated first with owned courses/editions, attendance, manual payments and material review. Hosting/transcription/AI unit economics and independent tutor demand: **UNKNOWN**, not proven profitable.

## NEXT PRIORITY TASKS

1. **P0 — S00 integrator: one composed pilot candidate.** Input: latest #309–#320 heads and `main`. First: run the PR overlap tool, read per-PR handoffs, choose an explicit merge-tree candidate. Accept only with one SHA, required CI, owner/student 401/403, source revision, real browser 390/820/1440, cold restart and rollback. No auto-merge.
2. **P0 — Delivery/backend truth.** Verify remote Study API/Auth/Storage instead of inferring them from static Vercel/Render assets. Accept: authentic two-browser teacher→student→review→reopen→revoke, with receipts and no DRAFT visibility.
3. **P0 — Editorial coverage of 4 Physics courses.** Preserve the 52/57/33/58 acceptance denominators; assess one objective end-to-end with explanation, independent practice, personalized recovery and distinct transfer. Do not approve the remaining objectives by bulk metadata.
4. **P1 — LessonOS audio+whiteboard provenance, REA deep donor.** With a connected authorized runner, capture one complete, legal scenario (e.g. existing local Studio and open-source BigBlueButton event semantics) and compare event timestamps, reload and teacher-reviewed artifact. RED/GREEN and side-by-side evidence, otherwise BLOCKED.
5. **P1 — MCP authorized correction draft.** Reuse existing Study Core review/candidate services, first RED test on wrong tenant, stale digest, duplicate idempotency and revoked teacher; draft persistence only, publish separate.
6. **P1 — Kirchhoff adapter contract.** Inventory ownership, approved code and solver claim levels; use existing VerificationProvider/Simulation Plugin, no imported ELAB application shell or questionable manuals.
7. **P2 — External tutor ROI and visual quality.** Time one real tutor workflow, measure clicks/time saved and costs, compare motion/mobile and accessibility in a real browser before recommending SaaS pricing.

**Next recommended single mission:** #314/S00 integration rehearsal using the collision inventory plus server-authenticated replay. It offers a stronger falsifier for the November 2 beta than another new donor component.

**Date gates:** October 25 public marketing was a demo milestone, not a certification of four courses. October 26 invited pilot requires authentic persisted teacher/student replay. November 2 wider beta is **AT RISK** while private composition, remote backend and editorial coverage remain unverified. Reduce scope rather than falsely promoting draft content.

No private student data, recordings, deployment, DNS, costs, settings, merge or publication were touched.


## Addendum sulla candidata PR #321 — 26 ottobre

- La prima esecuzione `pr-contract` sul body originale è stata **FAIL** per metadata `dependencies` anziché il campo previsto `depends_on`. Corretto il body corrente senza cambiare il contratto applicativo; la verifica successiva è una nuova run, non una riscrittura retroattiva del fallimento.
- Il census ora controlla anche la SHA di **ciascuna** head PR *dopo* il fetch dei file. Se una head muta durante l'osservazione, restituisce `STALE_SNAPSHOT_RETRY` e la lista degli ID instabili, anziché un falso report MEASURED.
- **4 test unitari locali PASS** dopo la modifica, incluso il caso avversariale head `old`→`new` senza cambio di `main`. CLI GitHub live, CI finale e composizione su merge tree: da leggere sulle run della head finale; nessun PASS ereditato.

## Secondo controllo del 26 ottobre — 06:30 Europe/Rome

- **Closed this microtask:** independent source-anchored code review of PR #321, head `4702776f82dec2142edefc1c9b2df9f1f786fe53`, published as GitHub review `5647800975`. One P1 finding: the live census checks `main` and each PR head SHA, but not concurrent changes in the *membership* of the open-PR list or base retargeting with unchanged head SHA. Exact suggested tests: retarget `main→other` without a new head commit and PR addition/closure between two collection reads. These are static counterexamples; actual live race **NOT_RUN**, and the existing four offline tests do not cover them.
- **CI snapshots, not a combined proof:** PR #314 head `c55d7902d7ef8e89627c9a44a5c805101f6c7c4b` has CI, `pr-contract`, `marketing-static` and `studio-preview-readiness` workflows SUCCESS on that head, but the stated private preview still has no configured remote Study API (`/study` → 503). PR #309 head `2401f4c9f22c375a8a9c4541c5b7e8f1f48a8716` shows its own CI SUCCESS, not combined integration. At the time checked, PR #321 head `4702776f...` had `pr-contract` SUCCESS and main CI still IN_PROGRESS. No post-merge evidence for any of these open PRs.
- **Provenance/REA:** primary `morluto/rea` browser-scenario contract confirms deterministic declared Playwright actions with explicit screenshot/DOM/accessibility captures; passive CDP observation is a different surface and cannot establish prior actions or backend equivalence. Reconstruction-readiness verification explicitly separates real static observations from synthetic evaluator conformance. No authorized connected Desktop Commander device was found for this run: live REA capture **BLOCKED**, not simulated. Source: https://github.com/morluto/rea/blob/main/docs/browser-scenario-contract.md and https://github.com/morluto/rea/blob/main/docs/reconstruction-readiness.md .
- **Memory fallback:** private `ardesia-knowledge/00-CURRENT.md` was read and self-labels `DEGRADED` with July 25 freshness; it is not the October truth. Root `AGENTS.md` and next-session instructions were read; common memory files remain owned by S00, and `docs/ops/ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md` plus `NEXT-AUTOMATION-PACKET.md` could not be resolved on the current main. AgentMemory REST unavailable without connected device. This addendum and the GitHub review preserve the finding without rewriting shared history. **DO NOT merge** merely on the strength of the file overlap report.
- **Next action:** root integrator S00 should decide whether to patch the census race under the existing PR #321 and then compose the actual consumer/backend pilot; maintain the previous seven-item `NEXT PRIORITY TASKS` ordering above, especially P0 remote teacher/student data continuity. The 26 October pilot is **BLOCKED** for an independently verified remote end-to-end round trip, not merely delayed by a static preview check.
