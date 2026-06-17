# Sprint U Mac Mini — Skill + Plugin Mapping per Cycle 3 Fix-orchestrator + Verifier

**ANDREA MANDATO**: ANALISI IMPORTANTE QUANTO FIX. NO debito tecnico. Use plugins + skills enabled Mac Mini.

## Plugins enabled Mac Mini (rsynced ~815MB)

- `claude-plugins-official/ralph-loop/` (1.0.0)
- `claude-plugins-official/superpowers/` (5.0.7)
- `thedotmack/claude-mem/` (603M) + MCP servers
- `impeccable/` (211M)

## Skill mapping mandatory per Cat (use Skill tool in session)

### Pre-fix ANALYSIS (depth)

| Skill | Use case | Cat applicable |
|-------|----------|----------------|
| `superpowers:systematic-debugging` | Hypothesis-driven root cause analysis ogni broken esperimento | Cat A,D,E |
| `superpowers:dispatching-parallel-agents` | Spawn 4+ subagent paralleli per Cat A-F simultanei | Tutti |
| `superpowers:writing-plans` | Plan dettagliato pre-fix per ogni Cat | Pre-Cycle 3 |
| `superpowers:executing-plans` | Esegui plan strict step-by-step | Cycle 3 fix |
| `superpowers:brainstorming` | Pre-design approach (esp. Cat C design + Cat E UNLIM L2 routing) | Cat C, E |
| `superpowers:requesting-code-review` | Pre-commit review | Pre Cycle 4 commit |
| `superpowers:verification-before-completion` | Mandatory verify post ogni fix Cat | Verifier |
| `claude-mem:smart_search` | Recall sprint history past iter (iter 36-38 audits) | Phase 0 + ogni Cat |
| `claude-mem:timeline` | Cross-iter timeline ELAB project | Phase 0 |
| `claude-mem:get_observations` | Specific observation IDs from past iter | Where references needed |

### Cat C design overhaul — impeccable mandatory

| Skill | Comando | Output |
|-------|---------|--------|
| `impeccable:critique` | `/critique` design current state | Critical findings UX |
| `impeccable:audit` | `/audit` accessibility + WCAG + contrast | Violations matrix |
| `impeccable:colorize` | `/colorize` palette violations 833 hex → CSS var | Replacement matrix |
| `impeccable:typeset` | `/typeset` font ≥14px enforcement | Typography fix matrix |
| `impeccable:arrange` | `/arrange` layout alignment + spacing | Layout fix |
| `impeccable:normalize` | `/normalize` design-system compliance | Compliance matrix |
| `impeccable:polish` | `/polish` final pass per ogni view | Final touches |
| `impeccable:harden` | `/harden` interface resilience | Edge cases |
| `impeccable:clarify` | `/clarify` UX copy + microcopy | Copy improvements |
| `impeccable:adapt` | `/adapt` LIM 1080p vs 4K + iPad responsive | Multi-resolution |
| `impeccable:onboard` | `/onboard` onboarding flow improvement | Andrea iter 21 onboarding mandate |
| `impeccable:animate` | `/animate` purposeful motion | UX polish |
| `impeccable:optimize` | `/optimize` performance issues UI | Lighthouse perf fix carryover |
| `impeccable:distill` | `/distill` strip non-essenziale | Reduce cognitive load |
| `impeccable:bolder` | `/bolder` amplify safe designs | Brand boldness |
| `impeccable:quieter` | `/quieter` tone down aggressive UI | Calm UI |
| `impeccable:overdrive` | `/overdrive` push beyond conventional | Distinctive |
| `impeccable:delight` | `/delight` joy + personality | Easter egg + plus |
| `impeccable:extract` | `/extract` reusable components consolidate | DRY |
| `impeccable:frontend-design` | Production-grade frontend | Cat C+D fundamentals |

### Cat A linguaggio + Cat B codemod — superpowers

- `superpowers:test-driven-development` — TDD pattern per ogni cambio src/data/lesson-paths/
- `superpowers:receiving-code-review` — review post-codemod check false positives

### Cat E UNLIM L2 routing fix — claude-mem + superpowers

- `claude-mem:smart_search` — recall L2 templates iter 26 architecture
- `superpowers:systematic-debugging` — root cause: perché ogni query → LED template?
- `superpowers:writing-plans` — ADR-amend per L2 selectTemplate logic refactor

### Cat F modalità 4 — Playwright + impeccable

- `mcp__plugin_playwright_*` (rsynced via plugin) OR `npx playwright test` direct CLI
- `impeccable:critique` per ogni modalità render
- `superpowers:verification-before-completion` per clearCircuit test 94/94

## ELAB ecosystem skills Mac Mini (10 scheduled-tasks pre-existing)

| Skill ELAB | Use case Sprint U |
|------------|------------------|
| `elab-harness-real-runner` | Cat F clearCircuit + modalità test 94/94 |
| `elab-quality-gate` | Cycle entrance + close gate verify ogni iter |
| `elab-principio-zero-validator` | Cat A linguaggio plurale runtime score per esperimento |
| `elab-benchmark` | Score 30 categorie pre/post fix |
| `volume-replication` | Cat A bookText VERBATIM enrichment from PDF |
| `tinkercad-simulator` | Cat D componenti SVG reference |
| `lavagna-benchmark` | Modalità 4 redesign benchmark Cat F |
| `analisi-simulatore` | Cat D investigate v3-cap7-mini + v3-cap8-serial 0 components |
| `elab-cost-monitor` | Mistral Scale tier €18/mese tracking durante deploy Edge |

## MCP servers available

- claude-mem MCP: search, observations, timeline (rsynced + .mcp.json config)
- (futuri) playwright-mcp + control-chrome-mcp se config Mac Mini ~/.claude/settings.json updated

## Pattern enforcement strict

1. **Pre-fix Cat X**: `Skill('superpowers:systematic-debugging')` analysis hypothesis → `Skill('claude-mem:smart_search')` recall past iter findings → `Skill('superpowers:writing-plans')` plan → review hypothesis vs plan
2. **Fix Cat X**: `Skill('superpowers:executing-plans')` strict execution + `Skill('impeccable:<specific>')` per design Cat
3. **Post-fix Cat X**: `Skill('superpowers:verification-before-completion')` mandatory + Playwright re-test + vitest baseline
4. **Cycle 4 close**: `Skill('superpowers:requesting-code-review')` self-review + `Skill('superpowers:finishing-a-development-branch')` close protocol

## Anti-inflation enforcement (G45 mandate)

- ZERO claim "fixed" senza skill `verification-before-completion` invoked + Playwright re-test live evidence
- ZERO claim "design improved" senza impeccable `/audit` post-fix score ≥85
- ZERO claim "L2 routing fixed" senza UNLIM live curl 20+ queries verify NOT all → LED template
- ZERO claim "linguaggio plurale 100%" senza grep src/data/lesson-paths/**/*.json count post-codemod

## Final reminder

ANALISI = FIX. Approfondito. NO superficial sweep. NO accumulating debito tecnico. Skill invocation MANDATORY per ogni Cat. Plugin enabled use case explicit per ogni passaggio.

