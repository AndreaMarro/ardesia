# Team Roster — ELAB PDR Ambizioso 8 settimane

**Attivo da**: 2026-04-21 (sprint START lun mattina 9:00)
**Paradigma**: peer team Opus (NON subagent gerarchici)
**Subscription**: Andrea Claude Code Max (Opus quota generosa, no per-token billing)

## Agenti (6 Opus 4 peer)

| Ruolo | File | Tools primari | Capacity/giorno | Effort |
|-------|------|---------------|-----------------|--------|
| TPM | `.claude/agents/team-tpm.md` | Read, Write, Edit, TodoWrite | 2h coord | low |
| ARCHITECT | `.claude/agents/team-architect.md` | Read, WebFetch, serena, context7 | 4h design | high |
| DEV | `.claude/agents/team-dev.md` | Read/Write/Edit/Bash, serena, supabase | 6h impl | medium |
| TESTER | `.claude/agents/team-tester.md` | Read/Write/Bash, playwright, preview | 4h test | medium |
| REVIEWER | `.claude/agents/team-reviewer.md` | Read/Grep/Bash, WebFetch | 2h review | high |
| AUDITOR | `.claude/agents/team-auditor.md` | Read/Bash/WebFetch, playwright | on-demand | high |

**Totale capacity teorica**: 18h/giorno (vs 8h Andrea solo). Multiplier ~2.25x con overhead coordination (~0.4 efficiency reale).

## Contatti umani

- **Andrea Marro** — lead dev, integratore, merge-gate, Tea sync owner
- **Tea Lea** — volunteer co-developer, onboarding mer 23/04, path safe CODEOWNERS

## Quota monitoring

Weekly (TPM dispatch lunedì):
```bash
claude usage --period week
```
Target: <=70% Max quota usata weekly. Se >80% mid-sett -> spread task giorni.

## Soft escalation

Livello 1: team interno (6 agenti)
Livello 2: subagent pre-built (feature-dev:code-explorer, pr-review-toolkit:silent-failure-hunter)
Livello 3: Andrea + Tea sync call 30min Telegram
Livello 4: esperto esterno (legal/GDPR, budget riserva €200/mese)
