---
id: ATOM-S3-B2
parent_task: B2
sprint: S
iter: 3
priority: P1
assigned_to: generator-app-opus
depends_on: []
provides:
  - supabase/migrations/2026-04-26_openclaw_tool_memory.sql (NEW or verify existing)
  - supabase/migrations/2026-04-26_together_audit_log.sql (NEW or verify existing)
  - migrations applied to Supabase project euqpdueopmlllqjmqnyb
est_hours: 2.0
files_owned:
  - supabase/migrations/2026-04-26_openclaw_tool_memory.sql
  - supabase/migrations/2026-04-26_together_audit_log.sql
acceptance_criteria:
  - `openclaw_tool_memory` table create (id uuid PK, tool_name text, args jsonb, result jsonb, created_at timestamptz, embedding vector(384) if pgvector)
  - `together_audit_log` table create (id uuid PK, request_id text, mode text, anonymized_payload_hash text, response_id text, providers_down jsonb, created_at timestamptz)
  - RLS policies: open read for service_role, restricted for anon
  - GRANT statements appropriate
  - Migration applied via `npx supabase db push --linked` OR documented manual apply via dashboard
  - Verify via `npx supabase db query --linked "SELECT to_regclass('public.openclaw_tool_memory'), to_regclass('public.together_audit_log');"`
  - CoV 3x `npx vitest run` ≥12532 PASS preserved (no test code changes)
  - `npm run build` PASS exit 0
references:
  - scripts/openclaw/tool-memory.ts (MIGRATION_SQL constants, riusa schema)
  - scripts/openclaw/together-teacher-mode.ts (audit log writes pattern)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §5.2 (audit log table mention)
  - existing supabase/migrations/ for naming convention
---

## Task

Apply 2 Supabase migrations pending: `openclaw_tool_memory` + `together_audit_log` tables. Required by ATOM-S3-B1 wire-up.

## Implementation outline

1. Check `scripts/openclaw/tool-memory.ts` for `MIGRATION_SQL` constants
2. Check `scripts/openclaw/together-teacher-mode.ts` for audit log schema
3. Generate migration files in `supabase/migrations/` con naming `YYYY-MM-DD_<table>.sql`
4. Apply migrations:
   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked --project-ref euqpdueopmlllqjmqnyb
   ```
5. Verify tables exist via SQL query
6. Document apply log in commit message

## CoV before claim done

- 3x `npx vitest run` ≥12532 PASS preserved
- `npm run build` PASS exit 0
- `to_regclass()` returns non-NULL per entrambe le tables
- Migration files committed to repo
