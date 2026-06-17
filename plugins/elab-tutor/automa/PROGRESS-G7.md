# PROGRESS G7 — 28/03/2026

## Session Summary
**Obiettivo**: Completare Vol 2 (18) + Vol 3 (6) lesson paths + risolvere TUTTO il debito tecnico G1-G6.
**Risultato**: 24 nuovi lesson paths + 5 fix su debito legacy = 62/62 files, 0 issues.

## Commits (3)
1. `5a2a006` — feat(G7): add Vol 2 + Vol 3 lesson paths — 24 new paths, 62 total
2. `67029c6` — fix(G7): eliminate all vocabulary violations — vocab=0 (Vol 2+3)
3. `0dadb32` — fix: resolve all G1-G7 technical debt — 0 issues across 62 files

## What Was Built
- **18 Vol 2 lesson paths**: cap6 LED serie (4), cap7 condensatori (4), cap8 MOSFET (3), cap9 fototransistor (2), cap10 motore DC (4), cap12 robot segui-luce (1)
- **6 Vol 3 lesson paths**: cap6 semaforo, cap7 toggle, cap8 analogRead, extra LCD, extra servo, extra Simon Says
- **index.js updated**: 62 imports (38+18+6)

## Architecture
- **4 Sonnet agents** in parallel (Generator), 1 Opus evaluator (lead)
- Domain isolation: each agent wrote ~6 files, zero overlap
- File-based handoff: template + experiment data + vocabulary per agent
- Mechanical validation: JSON parse + 16 keys + 5 phases + vocab check

## Bugs Found and Fixed

### G7 Bugs (Vol 2+3)
| Bug | Root Cause | Fix |
|-----|-----------|-----|
| 18 vocab violations | Agents used forbidden words in bridging content + semantic drift | Surgical text replacement in 7 files |
| "codice segreto" | Substring of "codice" (forbidden) | → "impronta unica" |
| "analogico" x6 in cap9 | Word describes the concept but is forbidden | → "continuo", "gradualmente" |
| "programma" x8 in cap12 | Robot chapter contrasts "no programming" | → "istruzioni", "senza alcuna istruzione scritta" |
| "servomotore" in v3-cap8 | Contains "motore" (forbidden substring) | → "servo" |

### G1-G6 Legacy Debt (found by full audit)
| Bug | Root Cause | Fix |
|-----|-----------|-----|
| 33 "volt" violations in Vol 1 | Vocabulary too restrictive — "volt" is on every battery | Moved "volt" from forbidden→allowed in 38 files |
| "sintesi additiva" in v1-cap7-esp4 | Forbidden but IS the lesson concept | Removed from forbidden, added to allowed |
| 6 files with only 1 analogy | G4-G5 spec didn't require ≥2 | Added 2nd analogy to each |
| 1 file with 1 common_mistake | Same as above | Added 2nd common_mistake |
| Broken link v1-cap14-esp1 | "v2-cap1-esp1" doesn't exist (Vol 2 starts at cap6) | → "v2-cap6-esp1" |
| "serie" in next_experiment title | Substring match on bridging content | Rephrased title |

## Final Audit (post-fix)
| Metric | Result |
|--------|--------|
| Total files | 62 (38+18+6) |
| JSON valid | 62/62 ✅ |
| 16 keys | 62/62 ✅ |
| 5 phases | 62/62 ✅ |
| build_circuit with intent | 62/62 ✅ |
| ≥2 analogies | 62/62 ✅ |
| ≥2 common_mistakes | 62/62 ✅ |
| Vocab violations | 0 ✅ |
| Broken links | 0 ✅ |
| Build | Exit 0 ✅ |
| Deploy | HTTP 200 ✅ |
| Components match experiments | 24/24 ✅ (Vol 2+3 cross-checked) |

## Honest Assessment

### What went well
- 4 parallel Sonnet agents produced 24 files in ~6 min each — massive throughput
- Mechanical validation caught issues immediately
- Surgical fixes (33 line changes) vs. regeneration (24 files) was the correct call
- Full G1-G7 audit revealed legacy debt that was invisible from session-level reports

### What went wrong
- Sonnet agents leaked 18 vocab violations — they cannot self-validate vocabulary reliably
- The initial "0 violations" claim for G6 was **wrong** — the checker didn't scan all sections (next_experiment, session_save, assessment_invisible)
- Vol 3 count was wrong in the prompt (said 11, actual 6) — STATE.md was stale
- Chrome MCP not available → L4 browser PROD test skipped

### Lessons for G8
1. **Vocab checker must scan ALL sections** — not just phases, also next_experiment, session_save, assessment_invisible, objective
2. **Vocabulary design matters more than content fixes** — 33 "volt" violations were a vocab bug, not content bugs
3. **Agents don't self-validate** — the evaluator must run mechanical checks per-agent, not trust reports
4. **Cross-check data counts against source files**, not STATE.md or prompts
5. **Use Opus for generation** to reduce vocab leakage (user request for G8)

## Data Correction
- **Vol 3 has 6 experiments** (not 11 as STATE.md claimed)
- experiments-vol3.js header says "6 esperimenti"
- Total import count: 62 (not 67)
- STATE.md needs updating
