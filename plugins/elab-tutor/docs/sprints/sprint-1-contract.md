# Sprint 1 Contract — sett-1-stabilize (retroattivo Harness 2.0)

**Sprint**: sett-1-stabilize
**Period**: lun 21/04/2026 — dom 27/04/2026 (7 giorni, Day 1-7/56)
**Owner**: Andrea Marro (+ Tea Lea volunteer da mer 23/04)
**Pattern**: Harness 2.0 Anthropic Apr 2026 (Sprint Contract + 4 grading criteria + Brain/Hands decoupling)
**Status**: retroattivo — contract ratificato Day 02 (mar 22/04) su scope Day 01 già chiuso + Day 02-07 plan
**Baseline ratificata Day 01**: 12149 test, build PASS 77s, benchmark 4.06/10, PZ v3 0 violazioni
**Reference**: `docs/pdr-ambizioso/HARNESS_DESIGN.md` sez. 10 (Sprint Contract Pattern), sez. 4 grading criteria, sez. Brain/Hands

---

## 1. Brief

Stabilizzare ELAB Tutor su 3 assi convergenti in 7 giorni:

1. **Bug fix T1**: 6 bug user-visible critici chiusi (T1-001 lavagna, T1-002 whiteboard persist, T1-003 Render cold start, T1-004 Vision E2E, T1-005 dashboard Supabase, T1-006 Voice 36 comandi).
2. **Foundations CLI autonomous**: 9 CLI scripts + 12 E2E specs + llm-client.ts dispatcher Together AI → baseline operativa per sett 2-8 autonomia.
3. **Contenuto + Collaborazione**: 92 foto TRES JOLIE, Vol 3 cap 6-8 bookText parity 100%, Tea autoflow CODEOWNERS + auto-merge, Tea onboarding mer 23/04.

**Target quantitativi sett 1 fine dom 27/04**:
- test count ≥ 12149 (no regression)
- benchmark score ≥ 6.0/10 (baseline pre-sprint 2.77 → target +3.2)
- 6/6 bug T1 chiusi o documentati carry-over con ADR
- 0 violazioni Principio Zero v3
- CI green ultimi 3 run
- Tea: 1 PR mergiata con auto-merge (validation autoflow)

**Non-goal sett 1**: Dashboard docente MVP (sett 3), Playwright 20 spec full (sett 4), Brain/Hands decoupling infra (sett 4+), RAG scaling (sett 5+).

---

## 2. Acceptance criteria (4 soggettivi — Harness 2.0 grading)

Per task **soggettivi** senza metrica immediata, AUDITOR valuta secondo 4 criteri skeptical-tuned (ref HARNESS_DESIGN.md sez. "4 Grading Criteria Subjective"):

### Criterio A — Design quality (coerenza visiva e logica)
- **UNLIM response**: identità "voce UNLIM" riconoscibile turn-to-turn (tono, lessico bambini 8-14, analogie ricorrenti)
- **Lavagna UX**: palette Navy/Lime/Orange rispettata, font Oswald/Open Sans/Fira Code consistente, zero inline style drift
- **Scoring**: 1 (incoherent) — 2 (template) — 3 (coherent) — 4 (distinct identity)
- **Pass threshold**: ≥ 3

### Criterio B — Originality (decisioni custom vs template)
- **RAG retrieval**: short-phrase fallback ("non va") + volume-grounded citation (no parafrasi generiche)
- **Scratch blocks**: block custom ELAB vs import Blockly default
- **Scoring**: 1 (copy) — 2 (template remix) — 3 (some custom) — 4 (distinctive custom)
- **Pass threshold**: ≥ 3

### Criterio C — Craft (dettaglio tecnico, spacing, typography, error handling)
- **Edge function**: AbortController timeout, 429 retry, fallback cascade Together → Gemini, GDPR dataProcessing
- **CSS**: 13px min body, 10px min label, touch-target 44x44px, contrast WCAG AA 4.5:1
- **Scoring**: 1 (sloppy) — 2 (functional) — 3 (careful) — 4 (polished)
- **Pass threshold**: ≥ 3

### Criterio D — Functionality (task completion, usability end-to-end)
- **E2E Playwright**: 5/5 smoke critical path PASS contro prod (homepage, simulatore, esperimento, chat UNLIM, cambio esperimento)
- **UNLIM chat**: "Ragazzi" presente, "Docente leggi"/"Insegnante leggi" assente (PZ v3)
- **Scoring**: 1 (broken) — 2 (partial) — 3 (works) — 4 (works + polished errors)
- **Pass threshold**: ≥ 3

**Verdetto sprint 1**: PASS se avg 4 criteri ≥ 3.0 + hard gates (test count, build, PZ v3) tutti verdi. AUDITOR firma in `docs/audits/2026-04-27-sprint-1-retro-onesto.md`.

---

## 3. Hard gates (oggettivi non-negoziabili)

| Gate | Verifica | Pass | Owner |
|------|----------|------|-------|
| G1 test count | `npx vitest run` CoV 3x | ≥ 12149 tutti 3 run | TESTER |
| G2 build | `npm run build` | exit 0 | DEV |
| G3 CI | `gh run list --limit 3` branch | 3/3 SUCCESS | TPM |
| G4 PZ v3 | grep "Docente,?\s*leggi\|Insegnante,?\s*leggi" src/ + prod live | 0 match reali | AUDITOR |
| G5 benchmark | `node scripts/benchmark.cjs --write` | score ≥ 6.0 | DEV+AUDITOR |
| G6 prod live | `curl https://www.elabtutor.school` | 200, TTFB < 3s | TESTER |
| G7 E2E smoke | Playwright 5 critical path | 5/5 PASS | TESTER |

---

## 4. Brain / Hands decoupling (posizionamento sett 1)

**Scope sett 1**: solo **preparatorio** (infra decoupling piena sett 4+).

**Brain = Claude + Harness** (sett 1 already in place):
- `.claude/agents/team-*.md` (6 agenti Opus peer)
- `automa/team-state/` (tasks-board.json, daily-standup.md, decisions-log.md, blockers.md, team-roster.md)
- `automa/state/claude-progress.txt` (runtime recovery)
- `docs/handoff/*-end-day.md` (strutturato append)

**Hands = Sandbox + Tools** (sett 1 parzialmente decoupled):
- ✅ Edge Function Supabase (stateless, container-interchangeable) — **è già Brain partial**
- ✅ Together AI + Gemini fallback (credential isolation via Supabase secrets, MAI in code)
- ⬜ Cloudflare Worker (sett 6+)
- ⬜ Hetzner container (sett 6+)

**Principio immutabile**: credentials MAI nel Brain (Claude prompt/code). Tutte via Supabase secrets / Vercel env.

**Validation sett 1 end**: grep `sk_\|api_key\|token_secret` in src/ + supabase/functions/ → 0 match.

---

## 5. Budget sprint 1

| Risorsa | Budget | Speso Day 01 | Residuo |
|---------|--------|--------------|---------|
| Dispatch Opus | 35 (5/gg x 7gg) | 7 (stima Day 01) | 28 |
| Ore Andrea | 56h (8h/gg x 7gg) | 8h (Day 01) | 48h |
| Commits target | 40-60 | 12 | 28-48 residui |
| Test delta target | +200 | +33 | +167 residui |

---

## 6. Carry-over tolerato → sett 2

Massimo 2 task T1 possono slittare a sett 2 se rimangono ≥ 4 chiusi. Carry-over > 2 = sprint FAIL, retrospettiva obbligatoria ragione radicale.

---

## 7. Ratifica

- **Drafted**: 2026-04-22 09:00 TPM (retroattivo Day 01 + forward Day 02-07)
- **Signed**: DEV ✅ (implicito via commit Day 01) | TESTER ✅ (CoV 3x report) | REVIEWER ✅ (APPROVE verdict) | AUDITOR ✅ (6.5/10 GO)
- **Andrea**: governance owner, può override con `[GOVERNANCE-OVERRIDE: motivo]`

**Next review**: Day 04 gio 24/04 mid-sprint check. Final: dom 27/04 retrospettiva + `docs/audits/2026-04-27-sprint-1-retro-onesto.md`.
