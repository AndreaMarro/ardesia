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

---

## Addendum 27 ottobre — G0 merged, controlled-preview provenance check

**Micro-goal closed:** independently reconcile the **actual GitHub main** against the **actual Vercel deployment file manifest**; publish an actionable mismatch warning on the merged integration PR. This is a read-only delivery audit, **not** a new product canon, merged code or remote beta test. Observation date: 2026-10-27, Europe/Rome (early morning).

### Evidence, exact sources, and dispositions

| Claim | Observation | Outcome |
| --- | --- | --- |
| Integrated G0 on GitHub | `main=dc353639739baf556154b16386561b4213f641a5`, merged #313 at 2026-10-26 23:05 UTC | **PASS — MERGED** |
| Post-merge required/protective CI | GitHub `/commits/dc353.../check-runs`: Web, Studio, Engine, API, MCP, S19, hygiene, advisory golden, no-deploy-check all `completed/success`; push run 40417272080 | **PASS on exact SHA**; does not certify hosted clients |
| Latest *canonical* Vercel private preview | Project `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`, newest deployment `dpl_DC99opdh3H2jtAtf1d1Zwt2na5tV` READY created 2026-10-26 17:38:28 UTC | **PASS — provider record read**, earlier than merge |
| Source of deployed preview | Read `src/public/release-manifest.json` from the deployment's Vercel files API: `sourceProduct=b701e531e62037da2acd0f75a75e50659b0f682b`, `mainObserved=a00f2f40091aecf69e58ebaba42cf70d748e4066`; `backend=NOT_CONFIGURED`, `remoteReady=false` | **NOT_G0_EXACT_MAIN / BLOCKED_REMOTE**; byte-level G0 deployment certification **NOT_RUN** |
| Backend status provenance | Same deployment file `src/public/_integration/backend-unavailable.json` = `backend_not_configured` and `remoteReady=false` | **PASS — backend intentionally absent in current static artifact**; no HTTP-authority test inferred |
| Production separation | Deployment `dpl_7BQB2RrpkNdAsFgQ4MktHgfdnS1z` READY, target production, Git source `05d2bc9911aff3862906ac5a71769bc726dfbcea`; preview SSO enabled | **PASS — current provider metadata**, no mutation |
| Seven remaining concurrent PRs | GitHub open pull list at check: #310, #311, #312, #315, #319, #320, #321 | **OBSERVED**, not branch integration |
| Knowledge plane | `ardesia-knowledge/00-CURRENT.md` still says `DEGRADED`, observed 2026-07-25 09:57Z; `00-INDEX.md` is dated July 24 | **STALE_HISTORICAL**; no edits because Obsidian/truth-plane owns the source |
| REA available on this runner | No connected authorized REA host or executable/CLI access; primary source `morluto/rea` docs consulted | **BLOCKED_RUNTIME**, zero new captures/transfer; no software copying |
| Editable corrections through Study MCP | `services/study-mcp/README.md` documents four GET, stdio and loopback-only session; no MCP Apps UI or write actions | **READ_ONLY**; draft-only write remains **SPECIFIED, NOT_RUN** |

This observation does not claim a live HTTP/browser probe of SSO; the deployed **file contents** are independently read from Vercel, and that is sufficient for the source mismatch. The #313 thread now holds the delta as [independent post-merge comment](https://github.com/AndreaMarro/ardesia/pull/313#issuecomment-6434276841), so S00 can act without reading this PR branch.

### The three most consequential corrections today

1. **Do not call G0 published at its merged SHA.** The exact integrated journey is now real on `main` with green post-merge CI, a major advance over October 26. But the newest Vercel private client belongs to source `b701e531`. The existing SSO preview and local Golden are not proof of remote multiuser persistence or deployed G0 at `dc3536`.
2. **Avoid doing more UI acquisitions instead of exposing a durable Core.** A static preview with `/study=503` makes the new LessonOS/audio→whiteboard→feedback pathway unusable as an invited remote tutor/student pilot, however polished. Backend/Auth/Storage/revoke/cold-restoration is now the dominant G1 dependency, without removing local-first.
3. **Do not turn REA playback environments into production evidence.** REA's newly documented `environment-build` and replay-oriented MCP server can accelerate **agent training, behavioral contracts and offline donor comparisons** from approved captures, including simulated state changes based on observed effects. They do not establish application authorization, durable backend writes, unobserved feature completeness or distribution rights. Reference: https://github.com/morluto/rea/blob/main/docs/agent-environments.md ; browser CDP inspection is passive and origin-bounded: https://github.com/morluto/rea/blob/main/docs/browser-observation.md .

### Recommendation and gates through 2 November

Keep the smallest merchantable product as **one exact G0 Physics teacher→student journey plus four honest, not-yet-complete course offers**; no claim of full mastery, broad SaaS readiness or 200 editorial approvals. Preserve single Core, existing CoursePack/Kirchhoff contracts and optional ZERO-LLM runtime. Do not start an MCP remote writer, plugin marketplace or new course-wide authoring shell before the canonical backend and identity boundaries are tested.

**Next single mission for S00:** freeze current main (or newer exact SHA); prepare existing `bin/build_teaching_candidate.py` → `bin/web/prepare_vercel_preview.py --private-integrated` → `bin/web/prepare_vercel_upload.py --protected-integrated-preview` pipeline, and, within already-authorized preview-only policy, prove a fresh *protected* deployment matches `sourceProduct`, manifest digests, all assets and SSO anonymous deny using `handoffs/swarm-v2/S00/verify-preview.mjs`. `/study=503` must remain explicit until a real backend is provisioned and verified. Do not touch production, DNS, payments or DRAFT approval.

### NEXT PRIORITY TASKS

1. **P0 / S00 / exact G0 Preview.** Input `main@dc3536`, existing candidate pipeline and provider project; accept **only** new protected Preview, immutable deployment ID, source+asset digest match, SSO denied anonymous, four viewports, 503 honest; no new cost, no production. Before this, deployment source **BLOCKED**.
2. **P0 / S10+S00 / hosted Study Auth+Storage authority.** First derive config and threat model from current loopback guards; no ELAB services. Accept two real synthetic remote browsers across server restart with tutor/student isolation (401/403), review receipt and revocation. Current state **NOT_RUN/BLOCKED**.
3. **P0 / editorial / one approved objective.** Select a single lesson from denominators 52/57/33/58; require correct conceptual explanation, scientifically validated simulation, authentic new transfer problem and human approval. Remaining **0/200** by last canonical snapshot.
4. **P1 / S00 / outstanding PR integration.** Rebase and review #310/#311/#312/#315/#319/#320/#321 only at their current heads; first resolve post-G0 ownership/scene writer and semantic dependency rather than trusting file overlap counts. Test merged SHA/rollback for each.
5. **P1 / Core MCP / draft-only safe WRITE.** Reuse feedback candidates and teacher-reviewed correction service; require tenant+actor, submission/source version, idempotency, CAS, durable audit, revocation, 403 and 409 negatives; never publish without distinct human approval. No claim ChatGPT Pro host supports writes before an official live capability test.

**CLOSED this cycle:** exact provider-source provenance comparison and notification to the #313 integration owner. **NOT_CLOSED:** deployment of G0, remote pilot/G1, physical audio, REA capture, MCP write, scientific course approvals. No production write, merge, REA capture, students/PII, expense or policy mutation was performed.
