# Watchdog ELAB

Cron-driven health monitor + anomaly detector + learning-from-errors layer.

## Architecture

```
GitHub Actions (.github/workflows/watchdog.yml)
  └── cron: */15 * * * * (regular) + 0 22 * * 0 (weekly aggregation)
       │
       ▼
  scripts/watchdog-run.sh (portable orchestrator)
       │  Reads .watchdog-config.json
       │  Exports log_anomaly() / log_ok() helpers
       │  Writes /tmp/watchdog-report.md (per-run)
       │  Appends to docs/audits/errors-log-YYYY-MM.md (persistent)
       │
       ▼
  scripts/watchdog-checks.sh (ELAB-specific)
    1. curl production root → expect 200
    2. Edge Functions CORS preflight (unlim-chat / hints / diagnose)
    3. Edge Function content + Principio Zero v3 tone (if ELAB_ANON_KEY available)
    4. GitHub PR draft stuck > 2h
    5. GitHub CI failures > 3 in 2h
    6. Monitored branch idle minutes
       │
       ▼
  Anomalies → docs/audits/errors-log-2026-04.md
            → GitHub issue (rate-limited via existing-issue check)
            → Workflow summary (visible in Actions UI)
```

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/watchdog.yml` | Schedule + permissions + checkout + commit log |
| `scripts/watchdog-run.sh` | Generic orchestrator (project-portable) |
| `scripts/watchdog-checks.sh` | ELAB-specific checks (production URLs, PZ v3 patterns) |
| `.watchdog-config.json` | Config (URLs, edge functions, thresholds, monitored branches) |
| `docs/audits/errors-log-YYYY-MM.md` | Persistent errors log (committed via workflow) |
| `docs/reports/watchdog-README.md` | This file |

## Setup

1. Add labels (one-time):
   ```bash
   gh label create watchdog-alert --color f59e0b --description "Watchdog detected anomaly"
   gh label create watchdog-pattern --color 8b5cf6 --description "Recurring anomaly pattern (3+ times in 7d)"
   ```

2. Add secrets (one-time, NOT pasted in chat):
   ```bash
   gh secret set ELAB_ANON_KEY --repo AndreaMarro/elab-tutor
   ```
   `GITHUB_TOKEN` is auto-provided by Actions runtime.

3. Trigger initial run for validation:
   ```bash
   gh workflow run watchdog.yml --ref feature/watchdog-monitor -f mode=test
   gh run watch
   ```

## Output examples

### Regular run report (`/tmp/watchdog-report.md`)

```markdown
## Watchdog run 2026-04-19T12:00:00Z (regular)

**Project**: ELAB Tutor

- ✅ **production_root**: https://www.elabtutor.school → 200
- ✅ **edge_unlim-chat_cors**: preflight 204
- ✅ **edge_unlim-chat_content**: success=true, response present
- ✅ **principio_zero_v3_unlim-chat**: tone compliant
- ✅ **pr_draft_age**: No draft PRs older than 2h
- ✅ **ci_failures_2h**: 1 failures (threshold 3)

**Summary**: 6 OK, 0 anomaly
```

### Anomaly entry (`docs/audits/errors-log-2026-04.md`)

```markdown
### 2026-04-19T12:30:00Z — principio_zero_v3_forbidden_found

**Detail**: unlim-chat response contains forbidden pattern: Docente, leggi

**Pattern hint**: BASE_PROMPT regression — verify deploy of system-prompt.ts

**Run**: regular | **Source**: watchdog-elab
```

## Portability

To reuse on another project:
1. Copy `scripts/watchdog-run.sh` (no project assumptions)
2. Replace `scripts/watchdog-checks.sh` with project-specific checks (calling exported `log_anomaly` / `log_ok`)
3. Edit `.watchdog-config.json` for new project
4. Adjust `.github/workflows/watchdog.yml` permissions if needed

## Honest limits

- **Cannot detect frontend visual regression** — needs Lighthouse CI or Playwright snapshot in separate workflow
- **Cannot fix issues** — only alerts. Andrea decides remediation
- **Rate-limit on issue creation** — only checks open issues by title contains `type`. Closed issues with same type may re-open
- **CORS preflight only** without anon key — content + tone check requires `ELAB_ANON_KEY` secret
- **Monitored branches list is static** — must be manually updated in `.watchdog-config.json` when new feature branches added
- **Github API rate**: gh CLI uses 5000 req/h per token. At `*/15` cron with ~5 gh calls per run, ~1500/day, well under limit
- **Anthropic API NOT used**: all checks are stdlib (curl/jq/git/gh). No model calls. No cost beyond GH Actions minutes

## Pattern recognition (weekly run)

Sunday 22:00 UTC: aggregates errors-log entries by `TYPE`, identifies recurring patterns (>3 same type in 7 days), tags issues with `watchdog-pattern` label, creates investigation branch suggestion in summary.

(Pattern recognition logic in TODO; v1 = log only.)
