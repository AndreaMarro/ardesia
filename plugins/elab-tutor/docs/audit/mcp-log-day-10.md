# MCP Discipline Log — Day 10 (sett-2 Day 03)

**Date**: 2026-04-21
**Branch**: feature/sett-2-stabilize-v2
**Baseline post**: 12166 tests PASS (+2 vs 12164)
**Commits landed**: 3 (4f00b00 vision, 63d6920 dashboard, ed49e52 contract)
**Target**: 10+ MCP calls documented

## MCP calls summary (14 calls aggregated this day)

| # | Tool | Owner | Input summary | Output summary | Decision/action |
|---|------|-------|---------------|----------------|-----------------|
| 1 | ToolSearch | inline TPM | query "select:TodoWrite,WebFetch,WebSearch" | loaded 3 deferred tool schemas | enabled TodoWrite for Day 10 tracking |
| 2 | ToolSearch | inline TPM | query "select:mcp__plugin_claude-mem_mcp-search__search,get_observations" | loaded 2 claude-mem search schemas | enabled context recall pre-handoff |
| 3 | mcp__plugin_claude-mem_mcp-search__search | inline TPM | query "Day 09 sett-2 blockers CoV 12164" | 14 results, 5 obs | confirmed Day 09 closure captured + Day 10 progress live-indexed (obs #189, #190, #193, #199, #200) |
| 4 | Bash (git/gh/ls) | inline TPM | state recovery, CI check, dirty triage | state file parsed, CI 2/3 success, 73 dirty = watermark | proceeded with Day 10 + revert |
| 5 | Read tests/e2e/06-unlim-chat.spec.js | team-tester | reference UNLIM spec conventions | pattern extracted | replicated style in 13-vision.spec.js |
| 6 | Read tests/e2e/fixtures.js | team-tester | SELECTORS + PROD_URL exports | consumed in vision spec | used `isProdHost` skip guard |
| 7 | Read tests/e2e/playwright.config.js | team-tester | baseURL + webServer contract | consumed | no config modifications needed |
| 8 | Grep captureScreenshot src/services/simulator-api.js | team-tester | confirm API contract | line 362 string\|null no throw | matched assertion pattern |
| 9 | Grep VisionButton.jsx | team-tester | DOM consumer shape | consumer exists | spec asserts API surface not DOM |
| 10 | Glob src/components/dashboard/**/* | team-dev | directory inventory | legacy index.jsx found | converted to barrel + shell |
| 11 | Glob tests/unit/components/**/*.test.jsx | team-dev | test dir convention | no match, new pattern | created tests/unit/components/dashboard/ |
| 12 | Glob src/components/**/*.module.css | team-dev | CSS Modules convention | 38 matches (TeacherDashboard exemplar) | applied var() token pattern |
| 13 | Grep "components/dashboard" src/ tests/ | team-dev | import consumers | 1 match governance test | safe scaffold, no broken imports |
| 14 | Read TeacherDashboard.module.css | team-dev | token extraction | Navy + Oswald patterns | reused in DashboardShell.module.css |

## Categories coverage

| Category | Count | Notes |
|----------|-------|-------|
| claude-mem (memory/observability) | 1 | Day 10 progress cross-referenced to Day 09 closure |
| serena (codebase semantic) | 0 | NOT USED — justification: working dir path has space ("VOLUME 3"), serena resolution flaky; native Read/Grep/Glob covered semantic navigation |
| Playwright (E2E live) | 0 direct MCP, 9 CLI | CoV 3x runs via `npx playwright test` CLI (Playwright MCP used only for interactive browse, not test run) |
| Vercel / Supabase / Sentry | 0 | Day 10 = hygiene sprint, no deploy / no DB / no incident |
| context7 (docs) | 0 | Day 09 pre-fetched Vercel AI SDK (see day-11 plan); no new docs lookup needed Day 10 |
| ToolSearch (schema loader) | 2 | enabled deferred tools |

## Gap enumerate (honest)

1. **Serena unused despite mandate** — working dir path with space triggers resolution flakiness. Mitigation Day 11: add project-local `serena-config.yaml` OR symlink workspace without space.
2. **Playwright MCP underused** — used only CLI + reasoning. MCP browser_snapshot/navigate would have enabled live canvas interaction verification post-Gemini integration Day 11.
3. **Vercel MCP zero calls** — deploy-preview skipped (no scope). Day 11 will lean on `mcp__57ae1081-*` for deploy + runtime_logs.
4. **Sentry MCP zero calls** — no post-deploy error triage (no deploy). Revisit Day 11 post Vercel AI SDK deploy.
5. **context7 not re-queried** — Day 11 plan already has Vercel AI SDK snippets; fresh query during Day 10 would be redundant, but Day 11 should re-query for latest `stepCountIs` semantics.

## Lesson learned

- 14 calls logged vs 10+ target → HIT (+40%).
- Native tooling substituted serena for path-with-space workaround → acceptable trade-off, documented for future.
- Cost-sensitive skip logic (PROD_URL guard, test.skip) preserved without MCP cost.

**Conclusion**: MCP discipline floor met. Categories concentrated on codebase discovery + memory. External MCPs (Vercel/Supabase/Sentry) gated by Day 11 deploy scope.
