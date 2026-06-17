# Masterplan ELAB v2 — Multi-Agent Orchestrated

**Versione**: 2.0 — 2026-04-20
**Trigger**: Andrea richiede team di agenti orchestrati + plugin research approfondita
**Source**: Anthropic multi-agent research, superpowers framework, claudemarketplaces, cc-marketplace, claude-context, batsov tools, composio CLI tools

---

## 🧠 Architettura multi-agent (orchestrator + workers)

Pattern Anthropic ufficiale: **lead agent (Opus) + parallel subagents (Sonnet)**.

Performance studiata: "**multi-agent system Opus 4 lead + Sonnet 4 subagents +90.2%** vs single Opus". Tempo riduzione **fino 90%** per query complesse parallelizzabili.

### Topology proposta ELAB

```
┌─────────────────────────────────────────────────┐
│ LEAD AGENT (Opus 4.7)                           │
│ - Read masterplan + state                       │
│ - Dispatch parallel subagents                   │
│ - Aggregate results + decisions                 │
│ - Commit governance 8-step                      │
└────────┬────────────────────────────────────────┘
         │ parallel dispatch
         ├─────────────┬──────────────┬───────────────┬──────────────┐
         ▼             ▼              ▼               ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐
   │ frontend │  │ backend  │  │ test     │   │ audit    │  │ research │
   │ (Sonnet) │  │ (Sonnet) │  │ (Sonnet) │   │ (Haiku)  │  │ (Sonnet) │
   │ React+CSS│  │ Edge fns │  │ TDD/E2E  │   │ scetic   │  │ web/docs │
   └──────────┘  └──────────┘  └──────────┘   └──────────┘  └──────────┘
         │             │              │               │              │
         └─────────────┴──────────────┴───────────────┴──────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ WATCHDOG (always-on) │
                     │ Production monitor   │
                     │ Anomaly detection    │
                     │ Errors-log learning  │
                     └─────────────────────┘
```

### Roles definition (file `.claude/agents/`)

#### `lead-orchestrator.md` (Opus, primary)

```yaml
name: lead-orchestrator
model: opus
role: Read masterplan + state, decompose tasks, dispatch parallel subagents, aggregate + decide.
context: full session, no compression
allow_tools: [Bash, Read, Write, Edit, Agent (dispatch), TodoWrite, Skill]
```

#### `frontend-react.md` (Sonnet)

```yaml
name: frontend-react
model: sonnet
role: Implementa React 19 components in src/components/, CSS modules, palette ELAB.
context: scoped to specific component + adjacent files
constraints:
  - Regola 0 RIUSO obbligatorio (grep prima)
  - WCAG AA + 44px touch + focus ring
  - Principio Zero v3 enforce in user-facing strings
  - ZERO npm install (regola 13)
allow_tools: [Read, Write, Edit, Grep, Glob, Bash (npm/vitest only)]
```

#### `backend-edge.md` (Sonnet)

```yaml
name: backend-edge
model: sonnet
role: Supabase Edge Functions Deno + Gemini routing + RAG queries.
context: supabase/ folder + system-prompt.ts (immutabile reference)
constraints:
  - NEVER modify system-prompt.ts senza ADR
  - Principio Zero v3 immutable
  - secrets via mcp__supabase__* never chat
allow_tools: [Read, Write, Edit, Bash, mcp__supabase__*]
```

#### `test-writer.md` (Sonnet)

```yaml
name: test-writer
model: sonnet
role: Scrive vitest unit + Playwright E2E. MAI codice applicativo.
context: tests/ folder + spec target file
constraints:
  - TDD fail-first SEMPRE
  - assertion PZ v3 enforce (Ragazzi present, Docente leggi forbidden)
  - WCAG AA touch/contrast tests
  - Smoke + integration + property-based + visual + a11y
allow_tools: [Read, Write, Edit, Bash (vitest/playwright only)]
```

#### `auditor-skeptic.md` (Haiku)

```yaml
name: auditor-skeptic
model: haiku
role: Review HEAD/PR with calibrated skepticism. Verdict APPROVE/CHANGES/BLOCK.
context: diff + audit checklist
constraints:
  - Bias-free (no self-eval)
  - Critical files require explicit security review
  - Baseline test must NOT regress
  - Honesty mandatory: dichiarare "non verificato" se non testato live
allow_tools: [Read, Bash (git/gh read-only)]
```

#### `research-scout.md` (Sonnet)

```yaml
name: research-scout
model: sonnet
role: Web search docs/plugins/best-practices. Synthesize findings.
context: external (web)
constraints:
  - Pre-filter URL via domain reputation
  - Limit 5 URL per session (postmortem antipattern #1)
  - Cite sources con summary <200 parole
allow_tools: [WebFetch, WebSearch, Read, Write]
```

#### `watchdog.md` (Haiku, always-on background)

```yaml
name: watchdog
model: haiku
role: Production monitor 24/7 via GH Actions cron */15. Anomaly detection + errors-log.
context: minimal (just config + recent state)
allow_tools: [Bash (curl/gh/git read-only), Write (errors-log only)]
```

### Lancio orchestrato

Invece di:
```
Andrea → CLI singolo → make Vision E2E
```

Diventa:
```
Andrea → lead-orchestrator
    └─ "implement Vision E2E end-to-end"
        ├─ frontend-react: VisionButton.jsx + .module.css (parallel)
        ├─ test-writer: unit + E2E specs (parallel)
        ├─ backend-edge: verifica unlim-chat images support (parallel)
        └─ research-scout: best practices Gemini Vision (parallel)
        ↓ aggregate
        ↓ commit governance 8-step
        ↓ dispatch auditor-skeptic
        ↓ if APPROVE → push + PR
```

**Tempo stima**: 3-4h Vision E2E con orchestrazione vs 8-12h sequential.

---

## 🛠️ Plugin stack ELAB raccomandato (post research)

### Categoria: Context persistence

| Plugin | Install | Use case | Priority |
|--------|---------|----------|----------|
| **claude-mem** | `/plugin marketplace add thedotmack/claude-mem && /plugin install claude-mem` | Auto-capture decisioni cross-session | **CRITICAL** |
| **claude-context** (zilliztech) | MCP setup + Zilliz Cloud free | Semantic codebase search, **-40% token** vs full file load | **HIGH** |
| **Memory MCP** | MCP standard | Persistent context KV store | MEDIUM |

### Categoria: Multi-agent orchestration

| Plugin | Install | Use case | Priority |
|--------|---------|----------|----------|
| **superpowers** (obra) | `/plugin install superpowers` (137k stars) | Subagent-driven development RED-GREEN-REFACTOR + git worktree | **CRITICAL** |
| **cc-marketplace** (ananddtyagi) | `/plugin marketplace add ananddtyagi/cc-marketplace` | Lyra prompt opt + Documentation Generator + Refractor | HIGH |
| **anthropic-cookbook** | github clone | Prompt patterns reference | MEDIUM |

### Categoria: Code review automation

| Plugin | Install | Use case | Priority |
|--------|---------|----------|----------|
| **CodeRabbit** | github.com/coderabbitai (GH App install) | AI review automatic ogni PR | **HIGH** |
| **anthropics/skills** | github | 3 plugin agent instructions sets | MEDIUM |
| **qodo** | qodo CLI | PR feedback resolver + coding rules | MEDIUM |

### Categoria: Production monitoring

| Plugin | Install | Use case | Priority |
|--------|---------|----------|----------|
| **Watchdog ELAB** (PR #5) | merge PR #5 | Cron */15 monitor production + PZ v3 + CI | **DONE** ready merge |
| **Sentry** | `npm install @sentry/react` (regola 13) + MCP | Error monitoring frontend + replay | HIGH |
| **PostHog** | snippet + MCP already | Feature flags + session replay bambini | MEDIUM |
| **Lighthouse CI** | github action | Core Web Vitals + a11y on PR | HIGH |

### Categoria: CLI productivity

| Tool | Install | Use case |
|------|---------|----------|
| **tmux** | `brew install tmux` | Sessione resilience post crash CLI |
| **ripgrep** | `brew install ripgrep` | Fast code search (Grep tool internal usa già) |
| **Lazygit** | `brew install lazygit` | Terminal UI git ops |
| **GitHub CLI** | `brew install gh` | PR/issues/runs (già usato) |
| **fzf** | `brew install fzf` | Fuzzy finder file/history |
| **delta** | `brew install git-delta` | Syntax-highlighted diffs |
| **ast-grep** | `brew install ast-grep` | AST-based code search 20+ langs |
| **shellcheck** | `brew install shellcheck` | Validate bash pre-execution |
| **difftastic** | `brew install difftastic` | Syntax-aware diff |
| **Composio Universal CLI** | composio.dev/cli | 1000+ SaaS integration |

### Categoria: Performance + security

| Tool | Use case |
|------|----------|
| **axe-core** | WCAG AA automation (regola 13 blocker per npm install) |
| **Percy / Chromatic** | Visual regression test |
| **Renovate Bot** | Auto deps update (no install needed, GH App) |
| **Semgrep** | SAST security scanning (plugin already installed) |
| **CodeRabbit** (dup) | Security insights su PR |

### Categoria: ELAB-specifici (Andrea approval needed regola 13)

| Library | Use case | Status |
|---------|----------|--------|
| `html2pdf.js` | Quality PDF Fumetto export | BLOCKER |
| `sharp` | TRES JOLIE photo batch convert | OK Node script (non frontend dep) |
| `f5-tts-node` | Italiano TTS + voice cloning Fase 3 | TBD |
| `@axe-core/react` | WCAG automation tests | BLOCKER |
| `@sentry/react` | Production error monitoring | TBD |

---

## 📋 Masterplan v2 — Fase rivista

### Fase 1 ✅ DONE — Foundation

OpenClaw + RunPod GPU infrastruttura (di pertinenza Andrea, separato da prodotto)

### Fase 2 — Feature Core (~70%)

| Feature | State | PR | Note |
|---------|-------|-----|------|
| Vision E2E | ✅ MERGED | #4 | Live in prod |
| Fumetto MVP | ✅ MERGED (Regola 0 violata, da deprecare) | #6 | Code in prod ma duplicate |
| Fumetto wire-up Phase 1.5 | ✅ READY MERGE | #7 | All CI GREEN |
| Brand Alignment UI | ❌ TBD | — | Logo + palette + kit preview |
| Lavagna UX bugs | ❌ TBD | — | Empty selectable + persistenza Esci |

### Fase 2.5 — Quality Bridge (NEW)

| Task | Owner subagent | Time |
|------|---------------|------|
| Live verify Playwright MCP smoke | watchdog + frontend | 30 min |
| TRES JOLIE asset import script | backend-edge (Node) | 45 min |
| Tea autoflow (CODEOWNERS + auto-merge GH Action) | backend-edge | 60 min |
| html2pdf.js upgrade (post Andrea OK) | frontend-react | 30 min |
| SessionReportComic deprecation decision | Andrea + auditor | 10 min |

### Fase 3 — Voice Premium

| Task | Owner | Time |
|------|-------|------|
| Wake word "Ehi UNLIM" prod test | frontend + backend | 1h |
| F5-TTS italiano integration | backend-edge + research | 3h |
| Voice cloning 3s sample | research-scout + backend | 2h |
| Whisper Turbo STT | backend | 2h |

### Fase 4 — Qualità

| Task | Owner | Time |
|------|-------|------|
| Audit 92 esperimenti vs kit fisico Omaric | research + frontend | 4h |
| Test multiplication 3604 non-triviali | test-writer (parallel batch) | 8h |
| axe-core a11y automation integration | test-writer | 2h |
| Visual regression Percy/Chromatic | test-writer | 3h |
| Lighthouse CI on PR | watchdog | 1h |

### Fase 5 — Finalizzazione

Multilingue 7 lingue + Onniscienza RAG 5000+ + Stress test + Docs v1.0.

---

## 🚀 Concrete next session start

### Pre-startup (terminale Andrea)

```bash
# 1. Install CLI tools mancanti (one-time)
brew install tmux ripgrep lazygit fzf git-delta ast-grep shellcheck difftastic 2>/dev/null

# 2. Open tmux session resilient
tmux new -s elab
# (se crash: tmux attach -t elab)

# 3. Naviga repo
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

# 4. Avvia Claude CLI Opus
claude --permission-mode bypassPermissions --model opus
```

### Step 1 in Claude CLI — Install plugins

```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
/plugin marketplace add ananddtyagi/cc-marketplace
/plugin install lyra
/plugin install ultrathink
/plugin marketplace add obra/superpowers
/plugin install superpowers
```

(Se /plugin commands diversi in versione attuale Claude Code, usa `/help` per scoprirli)

### Step 2 — Paste master prompt

(File completo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-watchdog-staging/PROMPT-NEXT-SESSION-2026-04-20.md`)

Sintesi tasks T1-T7:
1. **T0** Install plugins + verify claude-mem capture
2. **T1** Live verify Playwright MCP (browser test elabtutor.school)
3. **T2** UX bugs lavagna (empty selectable + persistenza Esci)
4. **T3** Tea autoflow (CODEOWNERS + auto-merge.yml)
5. **T4** TRES JOLIE photos import script
6. **T5** Merge PR #5 watchdog + PR #7 wire-up + ELAB_ANON_KEY secret
7. **T6** Routines Orchestrator decision (disable o ANTHROPIC_API_KEY)
8. **T7** Feature 3 Brand Alignment

### Step 3 — Dispatch orchestrated (advanced)

Dopo T0-T2 done, prova multi-agent:

```
Sei lead-orchestrator. Decomponi T7 Feature 3 Brand Alignment in subtasks parallelizzabili e dispatch:

Agent({subagent_type: "frontend-react", prompt: "Implementa logo ELAB in AppHeader.jsx + CSS module"})
Agent({subagent_type: "frontend-react", prompt: "Update src/styles/design-system.css con CSS vars Navy/Lime/Orange/Red"})
Agent({subagent_type: "frontend-react", prompt: "Aggiungi kit preview component LessonReader top capitolo"})
Agent({subagent_type: "test-writer", prompt: "Write WCAG AA contrast tests + visual regression for new brand"})

Aspetta tutti, poi dispatch:
Agent({subagent_type: "auditor-skeptic", prompt: "Review aggregated changes"})

Se APPROVE → commit governance 8-step + push + PR draft.
```

---

## ✅ State finale + raccomandazione

**PR ready merge**: #5 watchdog + #7 fumetto wire-up (entrambi ALL CI GREEN, mergeable CLEAN).

**Andrea decisioni pending (5 min)**:
1. Merge #5 + #7
2. Add `ELAB_ANON_KEY` secret (post #5 merge)
3. Decidere Routines Orchestrator (disable consigliato)
4. Decidere SessionReportComic destiny (deprecate consigliato post wire-up live verify)

**Tea collaboration unlocked**:
- File design `TEA-AUTOFLOW-DESIGN.md` (staging)
- Implementare in T3 next session
- Tea ottiene autorità su `glossario/`, `data/experiments-vol*`, `docs/tea/`
- Auto-merge se safe paths + CI green + size <500 LoC

**Plugin stack pronto**:
- claude-mem (context persistence)
- claude-context (semantic search)
- superpowers (subagent orchestration)
- cc-marketplace (Lyra/Refractor/Ultrathink)
- CodeRabbit (auto PR review)

**CLI tools install one-time**:
- tmux + ripgrep + lazygit + fzf + delta + ast-grep + shellcheck + difftastic

**Score sessione (auto-stima onesta)**: **6.5/10** (sopra 5 per 4 PR delivered + 22 test added + research approfondito; sotto 8 per Regola 0 violation PR #6 + zero live verify + UX bugs solo documented).
