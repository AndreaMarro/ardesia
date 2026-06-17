# Audit - ELAB live QA hourly session

Run: 2026-05-08T06:08:58Z

## P0 Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Three homepage buttons/cards | partial | Unit test verifies Lavagna, Tutor, Videolezioni and no Glossario. Live screenshot blocked. |
| Lavagna libera no circuits | partial | Unit test verifies free mode hides simulator, modalita switch, manuale, video, capitoli, fumetto. Live screenshot blocked. |
| Homepage video in existing card | partial | Unit test verifies two local MP4 videos inside `home-card-videolezioni`. Live screenshot blocked. |
| No Glossario | partial | Unit test verifies no `home-card-glossario` and no Glossario title. Live screenshot blocked. |
| Scratch Blockly | partial | Existing unit suites for Scratch XML/Blockly passed in post-fix quick gate. Live Vol3 product flow blocked. |
| Arduino compile feedback | partial | Compiler and compile-cache related unit suites passed in post-fix quick gate. Live compile before/after blocked. |
| UNLIM Principle Zero V3 and morfismo | partial | Existing `PrincipioZero`, `SessionReportComic`, and related unit suites passed. Real UNLIM conversation blocked. |
| Visual beauty/simplicity/ELAB consistency | blocked | Browser screenshots unavailable. |
| iPad/Apple Pencil usability | blocked | Browser screenshots and pointer drawing checks unavailable. |
| Fumetto/report fusion | partial | Existing fumetto tests passed; no Leonardo/Cloudflare image path was exercised. |
| Leonardo Cloudflare fumetto | blocked | No available connector/network route; no generated image evidence used. |
| Deploy preview | blocked | `blocked_no_deploy`: `vercel` CLI unavailable and npm registry DNS failed. |
| Production alias | blocked | `blocked_no_alias`: no preview URL and all P0 gates are not green. |

## Deployment Decision

- Preview deploy: blocked.
- Production alias: blocked.
- Reason: build is green, but deploy tooling/network is unavailable and live P0 browser evidence is blocked.

