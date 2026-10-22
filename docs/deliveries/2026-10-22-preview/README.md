# Ardesia Fisica: protected static preview

Base: PR #277, `eee007d265f89f55b1ba0d08b092f2de1d3603c8`.
Date: 2026-10-22 (Europe/Rome). Preview only; no scientific approval of bank questions.

**Dated follow-up:** the incident and measurements below describe the original
#278 session. The convergence session on 22 October observed a later deployment
record as READY, but could not verify the current project protections or remote
interaction. See [the current observation](#convergence-observation-22-october-2026)
and the [canonical convergence audit](../../ops/ARDESIA-CONVERGENCE-AUDIT-2026-10-22.md).

## Defect and correction

Before: public entry fetched `/public/course` and PhysicsLab fetched `/public/activities/evaluate`, but the standalone static deployment supplies neither endpoint. The discriminating offline rendering test failed before this change (1 failure).

After: the existing public React entry uses the same pure course description as the public API. PhysicsLab in preview mode selects an exact, generated Core result for one of 31 radius ratios (0.50 to 2.00, step 0.05) and two boundary conditions. All 62 results are produced by `lessonos.study.activities.evaluate_activity`; no physics formula or scoring engine is reimplemented in the browser. Other modes retain the API path. Unsupported inputs throw, without interpolation. The visible limits explain the finite projection, fixed length and viscosity, and ungraded private prediction.

The generated projection is an intentionally bounded deployment artifact, not a second editable scientific source. `build:public` checks exact reproducibility against Core before building. A controlled tamper changed a generated ratio to 999; the check failed, then the original file was restored. All 62 results remain editorial DRAFT. No bank payload, student record, credentials or authenticated API is included.

The student exam is explicitly unavailable. Mini-course dates and sales remain unconfirmed. Contact capture is absent. The laboratory compares equal-length uniform cylinders, with radius changed between the cylinders.

## Verification

| Check | Status | Evidence |
|---|---|---|
| Offline public test before fix | FAIL (expected RED) | Course absent when network rejects |
| Targeted public tests after fix | PASS | 28 tests |
| Full Web suite | PASS | 263 tests, 37 files |
| Web typecheck | PASS | `npm run typecheck:web` |
| Public build | PASS | `npm run build:web:public` |
| Core/public API regressions | PASS | 49 tests |
| Generated artifact drift control | PASS | Tampered artifact rejected; restored artifact accepted |
| Browser static preview | PASS | 4 Playwright tests: 390, 820, 1440 pixels, headers and missing route |
| Real protected Vercel URL | BLOCKED / NOT_DEPLOYED as accepted preview | First deployment received production target; contained by project pause; next preview is BLOCKED |
| Authenticated cloud Study runtime | NOT_RUN | Not part of this static preview |

Browser tests check navigation, keyboard-adjusted radius, Q ratio 16 and pressure ratio 1/16 at r/r0=2, invalidation after input changes, absence of API/external network requests, no page errors, no horizontal overflow, and security headers. Screenshots below are from the final local static build, not a live REA capture or a claim about remote rendering. Chrome for Testing 156.0.8078.47 was used via `ARDESIA_BROWSER`; the Playwright browser download was corrupt in this environment. CI uses the pinned Playwright browser installation.

- [390 px](physics-390.png)
- [820 px](physics-820.png)
- [1440 px](physics-1440.png)

## Deployment separation

The existing root `vercel.json` continues to build Studio; the `pro/ardesia-*` branch prefix is disabled for automatic deployment before creating remote branches. The new project `ardesia-fisica-preview` has no Git link or environment variables, and SSO protection for preview deployments. The intended nonproduction target was not respected by the platform on its first deployment; the incident below records the actual state. No paid feature is selected. The connector did not expose billing/plan details, so this is not a measurement of hosting cost.

`apps/web/vercel.json` documents a future source build rooted at `apps/web`. For the first deployment the already verified `dist-public` files are uploaded through the Vercel API, with a static root configuration: no install/build command, output `.`, the same headers, no catch-all rewrite. This avoids relying on Python availability in Vercel's build image. `gitMetadata.commitSha` records the source commit; deployment ID and exact URL are recorded in the PR. No backend or functions are deployed. The CSP forbids connections and form submissions.

## Reproduce

```sh
npm ci --no-audit --no-fund
npm run test:web
npm run typecheck:web
npm run build:web:public
npx playwright install chromium
npm run e2e:public --workspace @ardesia/web
```

`ARDESIA_BROWSER` can select an installed compatible Chrome executable. The test server is a plain static server with the deployment headers, no API proxy and no SPA fallback. Scientific model limits are unchanged; a passing build is not production authentication certification.

## Deployment incident and current handoff

**Accepted protected preview: NOT_DEPLOYED.** The source build is commit `6d4e149d26ba7885e3e45d320402d060e2987270` in draft PR #278. Subsequent changes to this report do not change the built assets.

The first API call omitted `target`, as the REST reference describes for Preview. Vercel nevertheless created `dpl_3pJhCk6A8EWzKQp44VJGQ1M149qc` with `target: production`. This was an execution error relative to the mandate. The platform's separate [first-deployment rule](https://vercel.com/docs/deployments/environments#first-deployment) explains the exception: every new project's first deployment is Production, even when Preview is requested. I had not accounted for that rule before the call.

The deployment reached READY before cancellation; cancel returned 400. An anonymous read returned HTTP200. Only the tested public static assets were included, with no real data or secrets. An attempted project SSO change to `all_except_custom_domains` was rejected by automatic approval review as a security-weakening change; it was not applied or retried. The project's preview SSO setting remains unchanged.

The new isolated project was then **paused** using the Vercel connector. A fresh anonymous request to the erroneous deployment returned **HTTP503 / DEPLOYMENT_PAUSED**. Studio and its pre-existing domains were not modified. New default project aliases created by that first deployment are part of the paused project; this is not a claim that no production-targeted deployment ever occurred.

A subsequent deployment with `forceNew: 1` and omitted target has the correct Preview representation (`target: null`) but is blocked by the pause:

- Project: `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`.
- Candidate deployment: `dpl_EosAsznY2QX5Wn5rGPwd27kvMSWz`.
- Candidate URL: `https://ardesia-fisica-preview-n9hq62dvb-andreas-projects-6d4e9791.vercel.app`.
- State: `BLOCKED`; source SHA matches the tested build above.
- Protected remote home/CSS/JS/navigation/PhysicsLab acceptance: **NOT_RUN**.

The available connector has no deployment-delete operation, the local Vercel CLI has no credentials, and the dashboard browser is at the login wall. The remaining operation is concrete: remove only the erroneous production deployment, preserve the blocked preview record so the project is not empty, then resume and create a fresh preview from the verified assets. Recheck target, SSO and all remote acceptance conditions before calling it online. Do not resume while the unwanted production deployment is still active; do not delete all deployment records and trigger the first-deployment rule again.

GitHub Actions for the code commit passed: CI run [39688449000](https://github.com/AndreaMarro/ardesia/actions/runs/39688449000), including public build and real browser without API, and Studio readiness [39688448964](https://github.com/AndreaMarro/ardesia/actions/runs/39688448964). These passes do not close the Vercel deployment blocker.

## Convergence observation 22 October 2026

Read-only inspection of the supplied deployment ID
`dpl_6Ee5hXwDuQsDPeAaF9G8pfxAGSiE` returned `READY`, `target: null`, project
`prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`, no aliases, and this recorded URL:
[existing deployment](https://ardesia-fisica-preview-cv49dagv8-andreas-projects-6d4e9791.vercel.app).
The response contained no Git source association, including when Git information
was requested. It does not independently establish the historical source-SHA claim.

Subsequent project inspection and deployment listing under the observed team
scope `team_23uD0RgdInaTaOPEL0EGltup` returned HTTP403, “Not authorized”.
Team authorization operations were not exposed. Consequently the latest
deployment, current pause/SSO settings, build provenance and authenticated remote
home/laboratory acceptance remain **BLOCKED / NOT_RUN**. The incident above is
retained as history; neither an ongoing pause nor its resolution is inferred from
an inaccessible project. No new deployment, protection change, domain change or
backend exposure was attempted in this convergence session.

The combined source was independently rebuilt and its four static-browser tests
passed locally with Playwright 1.60.0 and Chrome for Testing 148.0.7778.96 at
390/820/1440 px. The browser tests exercised navigation, both boundary conditions
at radius ratio 2, same-origin assets, absence of API traffic, the connection
policy and 404s for absent API routes. The separate build gate checked all 62
Core-derived states for reproducibility. This local result does not close remote
acceptance.
