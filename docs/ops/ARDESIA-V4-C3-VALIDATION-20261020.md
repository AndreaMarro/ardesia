# C3 Core verification —2026-10-20

Verified source commit: `0ea23977fdbafa7a1f9a4ccb82549983cd815db6`. Same tree in isolated `/tmp/ardesia-api-dispatch-20261020`; tracked/untracked status empty after both runs. Later R6 documentation does not change product sources. This report is scoped evidence, not a G0/G1 certificate.

## Result

- Shared Study Core plus HTTP: **302 passed,0skipped**,14.86s, one TestClient deprecation warning. `ARDESIA_SUPABASE_ENV_FILE` explicitly enabled against isolated local PostgreSQL/Auth/RLS/Storage. Includes migration9 pack binding and authenticated Taylor receipt, cross-pack refusal, non-owner binding denial and forbidden DataAPI access. No production or cloud endpoint. Log SHA256 `0d1b218a37ffd6e464a70cd8a4f0f88c6df38f021f2f167fcc7a0cf0f36f9948`.302 includes unit/HTTP/provider contracts; it does not mean302 independent live-system journeys.
- Full Engine from its required package cwd: **2281 passed,21skipped**,34.60s, three existing pytest fixture deprecations. Live inference keys and PG opt-in removed from that broad run; PG contracts are exercised separately in the302 run. Log SHA256 `d6c88dd332f3a055ea73cffc28a18d78d2b137b1730d25a71baa1e77b3936679`. Skips are not counted as PASS.
- Independent dispatch review: SHA256 `5b70638e1ada3a07322176929a0cf2359b76729f1646b728287b96bd3b493b7d`. Original six held synchronous boundaries all reproduced loop blockage; worker fix makes health progress before release. Reviewer found slow connection cleanup on event loop after native request cancellation; async dependency with separately shielded worker setup/cleanup corrects it. Nine formal regressions pass. Additional review probes: five cancelled opens explicitly close off-loop, subsequent authenticated request succeeds, ASGI disconnect preserves health and operation ownership, unauthenticated/outsider upload cannot create assets. A small probe with2worker tokens/12requests observed up to12open connections and0remaining: worker limiting is not connection pooling/admission control. No production capacity benchmark.

## Changes and chronology

`19b2e7fb`: edition binding pins course/pack/version/hash; original DRAFT Maclaurin exp model (x in[-1,1], degree0–12, conservative Lagrange remainder including polynomial rounding), reused submission/receipt/review/context/diary lifecycle and pack-specific hints. Receipt preserves legacy transfer activityContext and adds courseContext. SQLite legacy backup restore replays the current erasure ledger after a narrow additive metadata upgrade; canonical table loss still fails validation.

`31c113b3`: bounds checked before float conversion so huge JSON integers cannot turn invalid layout geometry into500. Same regression class corrected in physical activity inputs.

`0ea23977`: blocking API work runs in workers, with sequential ownership of one connection per request and explicit cleanup on cancellation. Direct Core SQLite callers retain default thread affinity. AnyIO was already a transitive dependency; it is now explicit with no newly resolved runtime package.

C2 browser evidence remains pinned to `a6646e7d…`: HTTP349assertions/170requests, browserG0/SourceBoard scenarios and real application-process restart. These are not browser proofs for C3. C2Axe audit found four UI issues, under isolated correction. REA R6 actual export confirmed that historical pin metadata lacked the exact revision body; the next portable revision must correct that loss and be replayed.

## Still pending

UI/browser Analisi, UI audit corrections, complete historical export, Calendar mock/DST/ICS and scoped MCP with text fallback, full original acceptance matrix, PostgreSQL/Storage restore, zero-cost staging eligibility and human scientific/date approval. All Taylor content is DRAFT; scientificApproval NOT_RUN. GlobalG0 NOT_EVALUATED, human pilot NOT_RUN, launchAllowed false. No evaluator weakened, no production deploy/spend or automatic merge.

Private originals stay outside Git. User-facing compact proof/log copies are under `outputs/c3-core-0ea23977` in the calling task. Hashes identify exact local originals; the report does not pretend those private files are committed artifacts.
