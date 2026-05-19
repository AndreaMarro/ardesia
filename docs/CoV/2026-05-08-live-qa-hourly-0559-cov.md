# CoV - ELAB live QA hourly session

Run: 2026-05-08T06:08:58Z
Automation ID: elab-live-qa-hourly-sessions

## Command and Evidence Ledger

| Item | Status | Evidence |
| --- | --- | --- |
| Required memory file | partial | No prior memory existed; created/updated at end of run. |
| Required context docs | blocked | `docs/workflows/elab-automated-live-sessions-README.md`, `docs/context/2026-05-08-automation-plugin-context-pack.md`, `docs/superpowers/plans/2026-05-08-automated-live-unlim-regression-plan.md`, `automa/staging/2026-05-08-live-unlim-session-runbook.md`, `automa/state/no-regression-lock-2026-05-08.json`, and latest `automa/state/*-next.json` were missing from this checkout. |
| Local ELAB skill pack | blocked | Only `docs/skills/wire-routing-test.md` exists; requested local skills were unavailable. Used `/Users/andreamarro/.codex/skills/elab-automated-live-session/SKILL.md` and `/Users/andreamarro/.codex/skills/playwright/SKILL.md`. |
| `npm test -- --run` initial run | fail | Ran before final test fix; failed 2 assertions in `HomePage.test.jsx` and `LavagnaShell-free-home-mode.test.jsx`. |
| Targeted Vitest rerun | pass | `npx vitest run tests/unit/components/HomePage.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx`: 2 files passed, 7 passed, 2 todo. |
| `npm run build` | pass | Built successfully in 21m 9s; emitted chunk-size and CSS minifier warnings only. |
| `npm run gate:quick` initial run | fail | Failed with the same 2 pre-fix test assertions. |
| `npm run gate:quick` post-fix rerun | pass | `[PRE-COMMIT] ✓ 13625 test PASS (baseline 11958)`. |
| Vite dev server | fail | `npm run dev -- --host 127.0.0.1 --port 5173` failed with `listen EPERM`. `localhost:5174` also failed with `listen EPERM ::1`. |
| Vite preview server | pass | `npm run preview -- --host localhost --port 4173` started and served `http://localhost:4173/`. |
| Playwright browser launch | blocked | Chromium and system Chrome launches failed under macOS sandbox (`MachPortRendezvousServer ... Permission denied` / SIGABRT). |
| Playwright CLI fallback | blocked | Wrapper attempted to fetch `@playwright/mcp`; npm registry DNS failed with `ENOTFOUND registry.npmjs.org`. |
| Baseline comparison screenshot | blocked | Could not run browser due Playwright launch block. |
| Local live screenshot sweep | blocked | Could not run browser due Playwright launch block. |
| UNLIM 12-turn product conversation | blocked | Browser automation unavailable; no product chat transcript was generated. |
| 8 adversarial UNLIM prompts | blocked | Browser automation unavailable; prompts documented but not executed in product. |
| Leonardo/Cloudflare fumetto generation | blocked | No Leonardo/Cloudflare worker connector or network path available; no generated image used as evidence. |
| Preview deploy | blocked | No local `vercel` binary. `npx vercel --target=preview --yes` failed with `ENOTFOUND registry.npmjs.org`. |
| Production alias | blocked | `blocked_no_alias`: no preview URL and not every P0 gate was green. |

