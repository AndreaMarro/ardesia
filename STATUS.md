# LessonOS — STATUS (append-only; ultima riga = dove sei)

- 2026-06-06T00:08:45Z — seed. M0 non iniziato. Prossima task: scaffold M0 (pyproject + smoke test + router mock). Vedi MILESTONES.md.
- 2026-06-06T02:15:00Z — BLOCKER: `claude` CLI non autenticato. Tentativi: `claude -p --bare --model claude-opus-4-8` con `ANTHROPIC_API_KEY` esportata → "Not logged in · Please run /login". Anche `CLAUDE_CODE_SIMPLE=1` non risolve. Opus irraggiungibile per BUILD step. Task M0-scaffold sospesa. Domanda per Andrea/supervisore: autorizzare fallback a `codex exec` per BUILD task M0 semplici, o risolvere auth `claude` CLI (login interattivo richiesto)?
