# Decisions Log — Team ELAB PDR Ambizioso

Format: ADR (Architecture Decision Records) style. Append-only. Mai cancellare.

---

## DECISION-001 — 2026-04-20 — Tier modello agenti team

**Decisore**: Andrea (direttiva user) + TPM paradigma
**Contesto**: PDR 8 settimane richiede team agenti robusti. Direttiva 20/04: "team agenti, non sub agents" + "only opus".
**Decisione**: 6 agenti **Opus 4** peer (TPM, ARCHITECT, DEV, TESTER, REVIEWER, AUDITOR). No fallback Sonnet/Haiku salvo rate limit hard Anthropic.
**Razionale**: Max subscription quota generosa (no per-token bill). Omogeneita decisioni tier. Brain ridondanza 6 pari. Elimina "tier anxiety".
**Conseguenze**: consumo quota Max alto -> monitor weekly `claude usage --period week` obbligatorio. Target <=70% usata.
**Alternative considerate**: Opus+Sonnet mix (rifiutata per quality drop). Solo 3 agenti (rifiutata per scope 8 sett).

---

## DECISION-002 — 2026-04-20 — Paradigma peer team (NO subagent)

**Decisore**: Andrea (direttiva user) + PDR architettura
**Contesto**: Claude Code >=2.1.32 supporta Agent Teams ufficiale (vs legacy subagent gerarchici).
**Decisione**: Agent Teams peer-to-peer via shared state `automa/team-state/`. Andrea = facilitator/integrator, NON lead-bottleneck.
**Razionale**: +90.2% perf Anthropic multi-agent research (Jun 2025). Context indipendente ogni agent. No collo di bottiglia lead.
**Conseguenze**: setup shared state files mandatory. TPM coordina via file non via in-memory chat. File-based handoffs.
**Source**: https://code.claude.com/docs/en/agent-teams

---

## DECISION-003 — 2026-04-20 — Programmatic Tool Calling (PTC) enabled

**Decisore**: Andrea + ARCHITECT paradigma
**Contesto**: Batch ops ELAB (92 foto, 549 chunk, 3604 test, CoV 3x vitest) consumano token massivi seq.
**Decisione**: PTC via `.claude/tools-config.json` con `code_execution_enabled: true`. DEV/TESTER/AUDITOR usano PTC per batch >=10 item.
**Razionale**: -37% token complex research (Anthropic), -99% summary in context per batch, -90% wall-clock time parallel.
**Conseguenze**: setup container `anthropic/claude-code-execution:latest`, Semaphore(5/8/16) per API/local/browser, timeout 300s.
**Source**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling

---

## DECISION-004 — 2026-04-20 — Principio Zero v3 immutabile

**Decisore**: Andrea (PDR GENERALE)
**Contesto**: UNLIM deve restare tramite docente (proiezione LIM ragazzi), mai diretto studente.
**Decisione**: `supabase/functions/_shared/system-prompt.ts` source immutable. Ogni PR sett 1-8 preserva PZ v3 (test E2E regex `/Ragazzi/` PRESENTE, `/Docente,?\s*leggi/i` ASSENTE). Watchdog cron `*/15min` verifica prod live.
**Razionale**: differenziatore competitivo ELAB. Violazione = bug P0 blocca merge.
**Conseguenze**: REVIEWER check mandatory ogni PR UNLIM-related. AUDITOR live verify prod. Docs `docs/audits/principio-zero-v3-*.md`.

---

## DECISION-005 — 2026-04-20 — Cost path testing -> GDPR EU

**Decisore**: Andrea (PDR GENERALE)
**Contesto**: Budget 8 settimane vs GDPR scuole italiane.
**Decisione**: sett 1-3 Together AI testing (US DPA acceptable beta), sett 4-5 parallel RunPod EU setup, sett 6-8 migration 100% self-host EU (Hetzner CX52 + RunPod Amsterdam + Supabase Frankfurt).
**Razionale**: total ~€333 cumulative (vs €5000 originale, -93%). GDPR assoluto production.
**Conseguenze**: Andrea signup actions (Together/Hetzner/RunPod/DALL-E). Budget buffer +30% raccomandato (~€100 extra).

---

## DECISION-006 — 2026-04-20 — File critici locked (engine + api)

**Decisore**: CLAUDE.md project rules
**Contesto**: CircuitSolver/AVRBridge/api.js toccati wrong = regressioni massive.
**Decisione**: file locked MAI modificati senza ADR esplicita Andrea: `src/components/simulator/engine/*`, `src/services/api.js`, `src/services/simulator-api.js`, `src/components/simulator/canvas/SimulatorCanvas.jsx`, `src/components/simulator/NewElabSimulator.jsx`, `vite.config.js`, `package.json` deps.
**Razionale**: stabilita 12056 test baseline. Guard script `scripts/guard-critical-files.sh` blocca modifiche engine senza tag `authorized-engine-change`.
**Conseguenze**: DEV agent tools config rifiuta write su questi path senza override esplicito. REVIEWER check mandatory.

---

## Template nuova decisione

```
## DECISION-NNN — YYYY-MM-DD — <Titolo>

**Decisore**: <Andrea / agente / team>
**Contesto**: <situazione>
**Decisione**: <scelta concreta>
**Razionale**: <perche>
**Conseguenze**: <impatto downstream>
**Alternative considerate**: <optional>
**Source**: <optional URL>
```
