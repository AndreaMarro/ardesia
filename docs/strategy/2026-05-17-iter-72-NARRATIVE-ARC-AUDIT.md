# Iter 72.5 NARRATIVE ARC audit — Andrea principio richiamato 2026-05-17

## Andrea quote verbatim (principio guida)

> "Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate. Significa che ogni esperimento del software deve agganciarsi al precedente e al successivo nella stessa sequenza del libro stampato. Se ti capita di lavorare su qualcosa che riguarda la modalità Percorso o la Modalità Passo Passo o le transizioni fra esperimenti, questo è il principio guida."

## Empirical state audit 2026-05-17 09:55 CEST

### Schema layer ✅ CHE COSA ESISTE

`src/data/cliffhanger-table.json`:
- 14 Vol3 entries con `cliffhanger` text + `next_id` per-esp populated
- Tea-authored + iter-70-A Vol3 parity stretta
- Format wrapper `{experiments: [...]}` (NOT Tea canonical flat array per Codex iter 70 TEAM A HIGH)

`src/data/narrative-map-94.json`:
- `_meta` + `volumes` structured per-volume
- Codex parsed 77 unique IDs (claim 94 stale)

`src/data/lesson-paths/v*.json` (79 files = 38 Vol1 + 27 Vol2 + 14 Vol3):
- Per-esperimento schema: `experiment_id + volume + chapter + title + difficulty + objective + components_needed + vocabulary + steps`
- **MANCANO**: `prev_id` + `next_id` + `cliffhanger_in` + `cliffhanger_out` fields

`src/data/experiments-vol{1,2,3}.js`:
- 38 + 27 + 14 = 79 experiments hardcoded
- Vol3 Tea narrative-map references 29 → **gap 15 esperimenti narrativi non implementati** (BG-A5 iter 72 tentativo skeleton-first ABANDONED 453 fail regression)

### UI layer ❌ CHE COSA MANCA

`src/components/simulator/panels/ScratchCompileBar.jsx`:
- ZERO `next_id|cliffhanger|nextExperiment` consume
- Compile success → NO next-exp preview cliffhanger CTA
- iter 72 BG-A7 wire-up ScratchCompileBar a CompileUploadButton MA NON narrative continuity

`src/components/lavagna/CompileUploadButton.jsx`:
- ZERO narrative wire
- Upload success → NO cliffhanger "Pronto per il prossimo?"
- iter 70 implementation focused hardware UAT, narrative deferred

`src/components/album/AlbumStudente.jsx`:
- ZERO narrative wire
- Album save (fumetto END-OF-EXP artifact) → NO link to next experiment
- iter 72 BG-A6 Supabase wire-up MA next-exp navigation mancante

`src/components/lavagna/PercorsoCapitoloView`:
- ZERO `cliffhanger|next_id` consume
- Renders flat list per-chapter
- **Andrea anti-pattern violato**: "card flat scollegate"

`src/components/lavagna/BuildModeGuide` (Passo Passo modalità):
- Iter 36 PM regression report: passo-passo wrongly uses LessonReader
- Should: step preview NEXT + recap PREVIOUS
- Status: ROTTO + narrative MISSING

## Iter 72 deliverables narrative-lens review (honest)

| Atom | Tipo | Narrative impact | Gap |
|---|---|---|---|
| ORCH-A4 PZ V3 fix | language | NEUTRAL | none |
| BG-A6 HomePage emoji | cosmetic | NEUTRAL | none |
| BG-A6 Album Supabase | END-OF-EXP artifact | **CRITICAL** | save → NO next-exp link |
| BG-A6 2 NEW ElabIcons | cosmetic | NEUTRAL | none |
| BG-A7 api.js Nano R4 | backend | NEUTRAL | none |
| BG-A7 ScratchCompileBar wire | END-OF-CODE artifact | **CRITICAL** | compile success → NO cliffhanger |

**Iter 72 ha shipped infrastructure tecnica MA NON ha rinforzato arco narrativo continuo**. BG-A6 Album + BG-A7 ScratchCompileBar = punti transizione esperimento dove cliffhanger DEVE apparire — mancante.

## Iter 73 P0 RESTRUCTURE narrative-first

### P0.1 schema unification cliffhanger + lesson-paths (~1.5h orchestrator inline)

- Cliffhanger-table.json → Tea canonical flat array format (drop wrapper `{experiments: [...]}`, codex TEAM A HIGH)
- Lesson-paths v*.json (79 files): ADD `prev_id` + `next_id` + `cliffhanger_in` + `cliffhanger_out` OR runtime-join with cliffhanger-table
- Update consumers (narrative-map-94 + experiments-vol{1,2,3}.js) for consistency
- Sync `automa/baseline-tests.txt` 13517 → 14357 (drift iter 72 close)

### P0.2 PercorsoCapitoloView cliffhanger render (~2h)

- Tra ogni esperimento card render cliffhanger text (Tea-authored)
- Pattern "Hai fatto X → Prossimo Y perché Z" continuità narrativa
- Anti-pattern KILL: NO flat card list

### P0.3 BuildModeGuide passo-passo regression fix (~2h)

- Iter 36 PM regression: passo-passo wrongly uses LessonReader (per feedback `feedback_passo_passo_regression_06may2026.md`)
- Wire BuildModeGuide legacy + activeLessonId real (NOT hardcoded)
- Step preview NEXT + recap PREVIOUS narrative

### P0.4 Narrative wire 3 components iter 72 follow-up (~2h)

- `ScratchCompileBar.jsx`: on compile success render cliffhanger CTA "Ragazzi, pronto per [next_exp.title]? [→ Apri]"
- `CompileUploadButton.jsx`: on upload success render "Hai caricato! Vol/pag prossimo: [next_exp.cliffhanger]"
- `AlbumStudente.jsx`: on save render "Vai al prossimo esperimento [→]"
- Source: import cliffhanger-table runtime join experiment_id → next_id + cliffhanger text

### P0.5 Vol3 Davide co-author 14→29 WITH cliffhangers (~6-8h Davide direct)

- 15 missing experiments MUST include cliffhanger_in (from prev) + cliffhanger_out (to next)
- Skeleton VIETATO (BG-A5 abandon iter 72 lesson + Andrea narrativa mandate)
- Tea + Davide co-author simultaneous content + narrative + test counters update
- Mandate: NO commit fino a narrative arc completo (entry + exit per ogni nuovo esperimento)

### P0.6 92 esperimenti Playwright NARRATIVE audit (~10h subagent test-automator)

- Each esperimento spec verify entry from previous (state continuity) + exit to next (cliffhanger CTA present)
- Document broken arcs honestly (NO mock)
- Sprint U close gate: ALL experiments verify narrative continuity

### P0.7 Codex iter 70 TEAM A HIGH rework (~2-3h orchestrator inline)

- cliffhanger-table Tea canonical flat array (drop wrapper)
- narrative-map cleanup 77 → 79 (current registry) OR 94 (post Vol3 Davide P0.5)
- 4 vol3 title/ID mismatches fix
- v3-cap6-esp4 content mismatch fix (semaforo prompt vs effetto polizia title)

## Modalità mapping → narrative requirement

| Modalità | Source | Narrative requirement |
|---|---|---|
| Percorso (default) | PercorsoCapitoloView | Card sequenziali + cliffhanger render TRA ogni card |
| Libero | LavagnaShell free mode | Quick-access tutti esperimenti, narrative optional |
| Passo Passo | BuildModeGuide (rotto iter 36 PM) | Step preview NEXT + recap PREVIOUS, intra-esperimento narrative |
| Guida (legacy?) | TBD audit | Narrative + on-error redirect |

## Anti-pattern verbatim Andrea

> "card flat scollegate"

= flat list rendering senza:
- Cliffhanger preview NEXT
- Recap micro PREVIOUS
- Continuous navigation (NO esci-rientra fra esperimenti)
- Page number visibile (volume/capitolo/pagina libro stampato — Morfismo Sense 2)

## Sprint U close gate narrative

- ALL 79 esperimenti correnti hanno cliffhanger consumed UI ✓
- Vol3 14→29 expanded con cliffhangers ✓ (Davide co-author iter 73-74)
- PercorsoCapitoloView renders narrative continuity (NO flat) ✓
- Passo Passo fix iter 36 regression ✓
- 3 transition components wired (ScratchCompileBar + CompileUploadButton + AlbumStudente) ✓
- Playwright 79-94 esperimenti narrative spec PASS ✓

## Honesty caveats

1. Iter 72 ha shipped infrastructure tecnica (ORCH-A4 + BG-A6 + BG-A7) MA NON narrative wire — Andrea richiamo principio applies retroactively iter 73 P0.4 follow-up.
2. Cliffhanger-table.json shipped 14 Vol3 entries Tea-authored MA UI consume mancante — schema-UI mismatch silent iter 70+.
3. Vol3 14→29 expansion gating Sprint U close — Davide co-author mandatory (BG-A5 skeleton-first abandon proves).
4. Passo Passo regression iter 36 PM NOT addressed iter 36-72 — 9+ iter carryover.
5. PercorsoCapitoloView audit deeper required (file non aperto questo turn, presumed flat per anti-pattern Andrea) — verify iter 73 P0.2 entrance.
6. Iter 73 priorities restructure mandate Andrea ratify (non orchestrator autonomous — narrative principle is product-level decision).

## Action this turn

- Documento principio + audit empirico + restructure iter 73 (questo file)
- NON shippare code (Andrea away + Davide co-author needed + Andrea ratify mandate)
- Update handoff doc iter 73 narrative-first
- APPEND CLAUDE.md narrative arc principle section con Andrea verbatim quote

## /ultrareview note

Andrea invocato `/ultrareview` — NON azione mia (multi-agent cloud review user-triggered + billed per system prompt). Andrea: launch da CLI interactive `/ultrareview` per cloud review branch corrente (commits iter 72 batch local-only ottimo target review).
