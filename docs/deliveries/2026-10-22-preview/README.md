# Ardesia Fisica: protected static preview

Base: PR #277, `eee007d265f89f55b1ba0d08b092f2de1d3603c8`.
Date: 2026-10-22 (Europe/Rome). Preview only; no scientific approval of bank questions.

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
| Real protected Vercel URL | Recorded in draft PR | Deployment metadata and remote verification are added to the PR after deployment |
| Authenticated cloud Study runtime | NOT_RUN | Not part of this static preview |

Browser tests check navigation, keyboard-adjusted radius, Q ratio 16 and pressure ratio 1/16 at r/r0=2, invalidation after input changes, absence of API/external network requests, no page errors, no horizontal overflow, and security headers. Screenshots below are from the final local static build, not a live REA capture or a claim about remote rendering. Chrome for Testing 156.0.8078.47 was used via `ARDESIA_BROWSER`; the Playwright browser download was corrupt in this environment. CI uses the pinned Playwright browser installation.

- [390 px](physics-390.png)
- [820 px](physics-820.png)
- [1440 px](physics-1440.png)

## Deployment separation

The existing root `vercel.json` continues to build Studio; the `pro/ardesia-*` branch prefix is disabled for automatic deployment before creating remote branches. The new project `ardesia-fisica-preview` has no Git link, no production target, no custom domain, no environment variables, and SSO protection for preview deployments. No paid feature is selected. The connector did not expose billing/plan details, so this is not a measurement of hosting cost.

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
