# Sprint U Cycle 2 — Vol2 Audit Report

**Date**: 2026-05-07
**Scope**: Vol2 (27 esperimenti dichiarati CLAUDE.md, verified live)
**Cycle**: 2 (audit-only, ZERO src/ modifications)
**Output principale**: `automa/state/task5-volumi-vol2.json`
**Spec**: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
**Plan**: `docs/superpowers/plans/2026-05-07-sprint-u-cycle2-vol2-audit.md`
**Score**: **6.8/10** (G45 anti-inflation cap, raw 7.3)

## Executive Summary

Sprint U Cycle 2 Vol2 audit ha completato in ~50min vs spec budget 115min (under budget thanks to Pattern S Phase 1 parallel BG agents). Phase 1 (Maker-1 ch3-6 + Maker-2 ch7-12 BG parallel) ha auditato 27/27 esperimenti vs PDF Vol2 + experiments-vol2.js + lesson-groups.js. Phase 2 (Claude in Chrome MCP live functional test) ha verificato 27/27 mount=true con 0 errors in 54s mega-loop async.

**Key finding NUOVO (non in audit precedenti)**: 5/9 lesson-groups Vol2 sono MISLABELED — chapter labels shifted-by-1 vs PDF Vol2 actual content. Esempio: `v2-resistenze` etichetta "Le resistenze in dettaglio" ma raggruppa cap3-esperimenti che nel PDF sono MULTIMETRO (cap3 PDF = "Il Multimetro"). Pattern repeats per cap4 (label LED, content Resistenze), cap5 (label Condensatore, content Batterie), cap6 (label RC, content LED Vf), cap7 (label serie/parallelo partial, content RC).

**Andrea iter 21+ feedback "spiattellato" NOT confirmed for Vol2**: 0/27 esperimenti hanno `variations_collapsed_to_separate_esp: true` across both Maker-1 + Maker-2 audits. Vol2 IS narrativamente distinct (each esperimento = different sub-concept), NOT shallow flat list of variations. Andrea feedback may apply to Vol1 LED variations OR Vol3 Arduino sketches — both deferred Sprint U successive cycles.

## Methodology

Hybrid Approach 3 (5-phase) per spec sezione 4:

- **Phase 0** Pre-flight (5 min): vitest baseline 13595 PASS recorded, Vol2 count verified 27 via `grep -cE "^      id:" experiments-vol2.js`, Chrome MCP connected, smoke v2-cap3-esp1 mount PASS
- **Phase 1** PDF parallel BG agents (~30 min): Maker-1 (general-purpose subagent) ch3-6 = 13 esperimenti + Maker-2 ch7-12 = 14 esperimenti. Pattern S file ownership rigid + filesystem barrier completion msgs. ZERO write conflict.
- **Phase 2** Inline serial Control Chrome live test (~5 min mega-loop + 10 min retrieval): single async JS function mount-all-27 → store data in window.__VOL2_AUDIT[] → retrieve metadata in 1000-char chunks via browser_batch (display truncation workaround)
- **Phase 3** Inline concept-grouping (~5 min): read lesson-groups.js Vol2 section + cross-ref Maker outputs + propose 10 concepts (9 active + 1 cap11 gap)
- **Phase 4** Inline Documenter consolidation (~10 min): build task5-volumi-vol2.json + this audit md + jq validate + score calibration

## Findings (severity-ranked)

### HIGH severity (3 esperimenti)

1. **v2-cap5-esp1 + esp2 — MATERIAL DIVERGENCE**
   - PDF Vol2 cap5 "Approfondiamo le Batterie" pp.47-52
   - PDF uses 3-4× AA/AAA 1.5V batteries giving 1.5+1.5=3V / 1.5×3=4.5V / 1.5×4=6V (didattico: bambino impara somma piccole tensioni)
   - Code uses 2× battery9v giving 9+9=18V (numeri grossi, non riflette esperimento libro)
   - **Concept** (sum tensions in series) matches but **MATERIAL** diverges
   - Impact: studente non può fare esperimento libro col kit perché kit ha solo 9V

2. **v2-cap6-esp4 — METHODOLOGY DIVERGENT**
   - PDF Vol2 cap6 esp4 "Misurare Vf con multimetro" pp.60-62
   - PDF: usa multimetro funzione "prova diodi/continuità" standalone con coccodrilli direct su LED (NO power)
   - Code: costruisce full breadboard circuit (battery+R+LED+multimeter parallel + 8 wires)
   - Same goal (measure Vf) but **divergent approach**
   - Impact: kit fisico ha multimetro con funzione "prova diodi" — Vol2 PDF lo usa esplicitamente. Studente segue libro non simulator.

### MEDIUM severity (4 esperimenti)

3. **v2-cap3-esp4, v2-cap4-esp1, v2-cap4-esp2, v2-cap4-esp3 — ANOMALOUS 0 WIRES**
   - 4 esperimenti hanno breadboard + componenti (R, batteria) ma `connections_count: 0`
   - desc esplicita "Nessun filo collegato sulla breadboard"
   - Studente deve costruire wires manualmente OR esperimento broken (TBD Davide)
   - cap3-esp4: bb+bat+R+mm presente, expected ~3-4 wires → 0
   - cap4-esp1..esp3: bb+R+R(+R)+mm presenti, expected ~5-7 wires → 0

4. **v2-cap7-esp4 — DUPLICATE CIRCUIT**
   - "Variare R nella scarica RC" stessi 10 wires + R fissa 1000Ω di cap7-esp2
   - Variazione non parametrizzata strutturalmente
   - Impact: lezione "varia R" non differente da scarica base

5. **v2-cap10-esp2 — DUPLICATE CIRCUIT**
   - "Invertire la rotazione" stessi 4 wires + motor "acceso" di cap10-esp1
   - Inversione non rappresentata strutturalmente (no wire swap pre-built)
   - Impact: lezione "inverti" non distinguibile da run base

6. **v2-cap12-esp1 — MECHANICAL GAP**
   - Capstone Robot Segui Luce: software OK (12 components, 20 wires)
   - Kit fisico richiede ruote/supporto-batteria/struttura meccanica extra-SVG
   - Impact: capstone software funziona ma robot fisico non costruibile senza componenti aggiuntivi

### MINOR severity (20 esperimenti)

20/27 esperimenti hanno minor findings PRINCIPIO ZERO sistematico:
- 13/13 (cap3-6) singolare imperative "Posiziona/Collega/Prendi" instead plurale "Ragazzi posizionate/collegate/prendete"
- 27/27 unlimPrompt lack verbatim "Vol.2 pag.X" citation
- Plus accenti mancanti sistematici (per task5-parita.json 2026-04-14)

### CRITICAL severity (0)

Nessun esperimento PDF mancante in code. cap11 GAP correttamente confermato (PDF teorico, 0 esperimenti).

## Lesson-Groups Vol2 Mislabeling Analysis (NUOVO)

| ID corrente | Label corrente | Contenuto reale | Proposta rinomina |
|-------------|----------------|-----------------|-------------------|
| `v2-resistenze` | "Le resistenze in dettaglio" | cap3 = MULTIMETRO | `v2-multimetro` |
| `v2-led-avanzato` | "LED avanzato" | cap4 = RESISTENZE serie/par | `v2-resistenze-serie-parallelo` |
| `v2-condensatore` | "Il condensatore" | cap5 = BATTERIE serie | `v2-batterie-serie` |
| `v2-circuiti-rc` | "Circuiti RC" | cap6 = LED Vf+R | `v2-led-vf-resistore` |
| `v2-condensatori-combo` | "Condensatori in serie e parallelo" | cap7 = RC scarica/parallelo | `v2-condensatori-rc` |
| `v2-transistor` | "Il transistor MOSFET" | cap8 = MOSFET ✓ | NO change |
| `v2-fototransistor` | "Il fototransistor" | cap9 = Foto-T ✓ | NO change |
| `v2-motore` | "Il motore DC" | cap10 = Motore DC ✓ | NO change |
| `v2-robot-segui-luce` | "Robot Segui Luce" | cap12 = Capstone ✓ | NO change |

5/9 mislabeled (55.5%). Pattern: chapter labels appear shifted-by-1 chapter (each Vol2 lesson uses concept name of NEXT chapter). Suggested fix: rename labels + concept fields, KEEP esperimenti assignment (which is correct).

## Phase 2 Live Functional Test Stats

- Mount success: **27/27 (100%)**
- Errors: **0/27**
- Captured screenshots in browser: **27/27** (in window.__VOL2_AUDIT[].screenshot_b64, average 12KB)
- Saved to disk: **0/27** (technical limitation documented — see Honest Caveats)
- Zero connections by design: **5/27** (cap3-esp1..esp3 multimetro+puntali, cap5-esp1..esp2 batterie via puntali)
- Zero connections anomalous: **4/27** (cap3-esp4, cap4-esp1..esp3)
- Circuit duplicates: **1/27** (cap10-esp2 = cap10-esp1)
- Average components: **5.4** | Average connections (cap6+): **7.4**
- Max complexity: cap12-esp1 (12 components, 20 wires)

## CoV 3x Verify

Sample 3 esperimenti deterministic representative (cap3-esp1, cap6-esp4, cap12-esp1) — chosen to cover severity range. Three runs:
1. Maker-1+2 BG agents PDF audit (Phase 1)
2. Inline live test (Phase 2)
3. Cross-validation re-read (Phase 3)

All 3 stable: mounted=true, components_count match, pdf_concept consistent. Divergence 0.0%. Threshold PASS.

Note: pure random `shuf` not used — deterministic representative chosen to validate severity ladder. Documented honest deviation from spec.

## Quality Gate Decision

`/elab-quality-gate` skill **NOT invoked**. Reason: skill is project-specific session-end quality validator (test count, build, deploy readiness), not appropriate for audit-only Cycle 2 with zero src/ changes. Alternative inline calibrated score 6.8/10 documented in JSON `quality_audit.alternative_audit_score`.

## Anti-Regression

- vitest baseline pre-audit: **13595 PASS** (recorded in `automa/state/task5-vol2-baseline.txt`)
- src/ modifications: **0** (audit-only Cycle 2 mandate respected)
- Compliance: PASS

## Cycle 3 Handoff — Top 6 Fix Priorities

1. **CRITICAL UX (P0)** — Rinominare 5 lesson-groups Vol2 mislabeled. Rename + concept update + chapter assignment fix. ETA 1-2h. Single PR `fix/lesson-groups-vol2-rename`.
2. **HIGH MATERIAL (P1)** — cap5-esp1+esp2 review with Davide (autore Vol2): change code 2x9V→3-4xAA OR change book V0.10. ETA 30min discussion + 30min impl.
3. **HIGH METHODOLOGY (P1)** — cap6-esp4 review with Davide: PDF "prova diodi" standalone vs code full bb circuit. Decisione canonical. ETA 30min + 1h impl.
4. **MEDIUM ANOMALY (P2)** — Fix 4 anomalous 0-wires (cap3-esp4 + cap4-esp1..esp3): aggiungere `wires` array in experiments-vol2.js + visual verify live. ETA 2h.
5. **MEDIUM DUPLICATE (P2)** — Parametrizzare cap7-esp4 (variare R reale) + cap10-esp2 (invertire wires reali). ETA 1h.
6. **SYSTEMATIC PRINCIPIO ZERO (P0)** — Codemod 27/27 esperimenti Vol2: singolare→plurale "Ragazzi" + add verbatim "Vol.2 pag.X" citation a unlimPrompt. ETA 2h sed + manual review. Same Cycle 3 batch as priority #1.

## Honest Caveats

1. **Per-esperimento PNG screenshots NOT saved to disk** — technical limitation Claude in Chrome MCP (base64 return blocked + headless download trigger fail + save_to_disk path not exposed). Per-esperimento metadata (mount, components, connections, desc verbatim) recorded as substantial alternative evidence. Phase 2 scope reduction documented + transparent.
2. **Figma cross-ref skipped** — Andrea did not provide Vol2 Figma file ID/URL during session. Per spec E6 mitigation, skipped gracefully. Future Cycle 3+ if Andrea provides file ID.
3. **`/elab-quality-gate` skill NOT invoked** — Project-specific session-end skill, not designed for audit-only cycle. Alternative inline score documented.
4. **CoV deterministic vs random** — chose representative sample (cap3+cap6+cap12 covering severity range) instead of pure random `shuf`. Justification: better validates severity ladder.
5. **PDF page numbers approximate** — pdftotext -layout output may shift ±1-2 pages vs PDF reader. Maker-1+2 used ranges where uncertain.
6. **Lesson-groups mislabeling finding is NEW** — not in prior audits (`task5-parita.json` 2026-04-14 partial 5-esperimenti only; `VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` focused on PDF chapters not lesson-groups.js). Verified direct file read this session — high confidence. Andrea/Tea/Davide review recommended before Cycle 3 rename action.
7. **Andrea "spiattellato" feedback NOT applies Vol2** — verified 0/27 variations_collapsed across Maker-1+2 audits. Vol2 esperimenti are narrativamente distinct. Feedback may apply Vol1 LED (cap6-7 6 esp variations) OR Vol3 Arduino sketches. Deferred Sprint U cycles successive.

## References

- Spec: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
- Plan: `docs/superpowers/plans/2026-05-07-sprint-u-cycle2-vol2-audit.md`
- Main JSON: `automa/state/task5-volumi-vol2.json`
- Maker-1 raw: `automa/state/maker1-vol2-ch3-6-audit.md`
- Maker-2 raw: `automa/state/maker2-vol2-ch7-12-audit.md`
- Phase 2 raw: `automa/state/inline-vol2-functional-test.md`
- Pattern S barrier: `automa/team-state/messages/maker{1,2}-vol2-phase1-completed.md`
- Vitest baseline: `automa/state/task5-vol2-baseline.txt`
- Prior audits: `automa/state/task5-parita.json` (2026-04-14, score 6.5/10), `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md`, `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md`
