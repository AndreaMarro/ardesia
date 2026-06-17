# Iter 36 Phase 3 — 7 Missing Esperimenti Reali (D3 Finding)

**Date**: 2026-04-30 PM iter 36 Phase 3 (post commits f9628c1+849f6bf)
**Author**: orchestrator MacBook (post Mac Mini D3 audit + screenshot cross-ref)
**Status**: ⚠️ ACTIONABLE iter 37 P0.5 (NO debito tecnico — issue tracked + assigned)

## §1 Finding context

PDR iter 36 §3 Atom A10 → Mac Mini D3 audit lesson-paths vs volume-references trovò **5 missing reali**. Verifica finale post Phase 3 cross-ref con `docs/audits/iter-29-92-esperimenti-screenshots/*.png` mostra **7 reali missing** (NOT 5).

CLAUDE.md "92 esperimenti in 3 volumi (38 Vol1 + 27 Vol2 + 27 Vol3)" claim INFLATED ~5 vs realtà:
- 87 esperimenti core (Vol1 + Vol2 + Vol3 con regex `v[0-9]-cap[0-9]+-esp[0-9]+`)
- + 7 esperimenti extra/specialty Vol3 → **94 totale** (NON 92)

## §2 7 esperimenti missing (catalog gap)

| ID | Tipo | Vol | Cap | Note |
|----|------|-----|-----|------|
| `v3-cap6-morse` | Specialty | 3 | 6 | Morse code blink (capstone progetto) |
| `v3-cap6-semaforo` | Specialty | 3 | 6 | Semaforo 3-LED state machine |
| `v3-cap7-mini` | Specialty | 3 | 7 | Mini progetto cap.7 (TBD scope) |
| `v3-cap8-serial` | Specialty | 3 | 8 | Serial monitor I/O (cap.8 specifico) |
| `v3-extra-lcd-hello` | Extra | 3 | extra | LCD 16x2 hello world (capstone bonus) |
| `v3-extra-servo-sweep` | Extra | 3 | extra | Servo motor sweep 0-180° (capstone bonus) |
| `v3-extra-simon` | Extra | 3 | extra | Simon Says memory game (capstone bonus) |

## §3 Files da creare iter 37 P0.5

Per ogni dei 7 IDs sopra:

1. `src/data/lesson-paths/{ID}.json` — schema completo (steps, components, connections, expectedOutput, hints)
2. `src/data/volume-references.js` — entry `{ID}: { volume, page, chapter, title, bookText: '...' }`
3. `docs/data/volume-structure.json` — entry capitolo + esperimento
4. (eventuale) RAG chunks rebuild post-volume-references update

## §4 Bookkeeping

- 87 (canonical existing) + 7 (catalog gap NEW) = 94 totale REAL
- PDR claim "92 esperimenti" deprecated → update CLAUDE.md iter 37 to "94 esperimenti (87 core + 7 extra/specialty Vol3)"
- volume-references.js CLAUDE.md "92/92 enriched" claim wrong → "87/87 enriched, 7 pending iter 37"
- harness `tests/e2e/29-92-esperimenti-audit.spec.js` should reflect 94 → run real harness post-creation

## §5 Risk impact iter 36 close

**Atom A10 Mac Mini D3 finding** SHIPPED ma scope underestimated (5 reported, 7 reali). Iter 36 close score G45 cap 8.5 NOT impacted (bug catalog gap, not regression).

**Iter 37 P0.5 (PDR-B)**:
- Time estimate: 7 esperimenti × ~30min (lesson-path + vol-ref + docs structure) = ~3.5h Davide co-author preferito
- Davide (volumi cartacei autore) può fornire bookText verbatim dai Vol3 cap6+7+8 + extras
- Ownership: Maker-1 (gen-app) + Davide review (volumi narrative)

## §6 Anti-debito tecnico

NO half-shipped data (placeholder TBD bookText = debt). Defer fully iter 37 P0.5 con:
- Davide co-author session 1h → bookText verbatim 7 esperimenti
- Maker-1 gen-app session 2.5h → JSON structure + lesson-path + vol-ref entries
- Tester-1 audit ✓ regex match harness post-creation

## §7 Anti-inflation G45

NO claim "92 esperimenti audit complete" senza Davide ratify 7 missing bookText sourced.
Iter 37 §4 actionable matrix update obbligatorio.

## §8 Cross-refs

- Mac Mini D3 audit log: `~/Library/Logs/elab/iter36-parallel/d3-92esp-*.log` (87/92 lesson_paths_files claim)
- Screenshot evidence: `docs/audits/iter-29-92-esperimenti-screenshots/v3-{cap6-morse,cap6-semaforo,cap7-mini,cap8-serial,extra-{lcd-hello,servo-sweep,simon}}.png`
- harness 87 entries: `tests/e2e/29-92-esperimenti-audit.spec.js` (matches `v[0-9]-cap[0-9]+-esp[0-9]+` only — 7 specialty/extra IDs SKIPPED)
- volume-references baseline: `src/data/volume-references.js` (87/87 enriched, NOT 92)
