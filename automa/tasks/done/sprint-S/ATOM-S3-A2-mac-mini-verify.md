---
id: ATOM-S3-A2
parent_task: A2
sprint: S
iter: 3
priority: P0
assigned_to: scribe-opus
depends_on: []
provides:
  - docs/audits/2026-04-26-mac-mini-heartbeat-iter3.md (NEW)
  - wiki_count_delta vs 59 baseline iter 2
  - launchctl_pid_status verified
est_hours: 1.0
files_owned:
  - docs/audits/2026-04-26-mac-mini-heartbeat-iter3.md
acceptance_criteria:
  - SSH check `launchctl list | grep elab` from Mac Mini → PID present + exit code 0
  - Wiki count delta verified via `ls docs/unlim-wiki/concepts/*.md | wc -l` local + remote
  - Audit doc include: launchctl status, current PID, wiki count delta vs 59 baseline iter 2, last batch result file timestamp, log tail nuovi concept se presenti
  - SCP nuovi concept md (se presenti) da Mac Mini → docs/unlim-wiki/concepts/ local
  - Q4 SCHEMA validation per nuovi concept (kebab-case lowercase no accenti)
  - CoV 3x `npx vitest run` ≥12532 PASS preserved (no test code changes)
  - NO writes outside scribe-opus ownership (docs/audits/ + docs/unlim-wiki/concepts/)
references:
  - docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md §2.2 (SSH command)
  - docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md §6 (overnight loop dispatch)
  - tests/unit/wiki/wiki-concepts.test.js (Q4 SCHEMA validator)
---

## Task

Verifica heartbeat Mac Mini PID 23944 launchctl autonomous H24 + count delta wiki concepts vs 59 baseline iter 2.

## Implementation outline

1. SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab`:
   ```bash
   ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
   ```
2. Check launchctl ATTIVO PID + exit_status
3. Count wiki remote: `ls ~/Projects/elab-tutor/docs/unlim-wiki/concepts/*.md | wc -l`
4. Diff vs 59 baseline (iter 2 close)
5. SCP nuovi concept md se presenti
6. Validate Q4 SCHEMA per nuovi md
7. Generate audit doc `docs/audits/2026-04-26-mac-mini-heartbeat-iter3.md`

## CoV before claim done

- 3x `npx vitest run` ≥12532 PASS preserved
- `npm run build` PASS exit 0
- Audit doc committed
- Q4 SCHEMA test PASS per ogni nuovo concept (no kebab-case violations)
