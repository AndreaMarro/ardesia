# ADR-001: CLI Autonomous Paradigm -- 6 Peer Opus Agents via Shared State

**Date**: 2026-04-20
**Status**: Accepted
**Deciders**: Andrea Marro (lead dev)

## Context

ELAB Tutor PDR 8 settimane richiede esecuzione autonoma multi-task giornaliera con quality gate rigorosi. Il vecchio modello subagent gerarchico (Opus lead + Sonnet/Haiku workers) presentava: context scratch per subagent, lead come bottleneck seriale, decisioni meno robuste ai tier inferiori. Anthropic harness research (Nov 2025, Apr 2026) dimostra che team peer specializzati con file-based handoff e context reset superano gerarchie rigide (+90.2% performance in multi-agent research).

## Decision

Adottiamo 6 agenti Opus peer (TPM, Architect, Dev, Tester, Reviewer, Auditor) coordinati via shared state files in `automa/team-state/`. Nessuna gerarchia. Andrea dispatcha, agenti comunicano via `tasks-board.json` status transitions. 5-gate hard system (pre-commit, pre-push, pre-merge, pre-deploy, post-deploy) come safety net anti-regressione. State recovery cross-session via `automa/state/claude-progress.txt` + daily handoff docs.

## Consequences

**Positive**: decisioni omogenee (tutti Opus), no single bottleneck, stato persistente cross-session, quality gate oggettivi, AUDITOR indipendente previene inflation bias.

**Negative**: +30% token consumption vs single agent (Max subscription absorbs), +20% wall-clock per task (coordination overhead), 8 script bash da creare e mantenere, rischio tasks-board.json corruption da write concorrenti (mitigato da dispatch seriale).

**Neutral**: richiede disciplina rigorosa da Andrea nel dispatch sequence e handoff completeness.
