# SPEC — EPIC 1 A4: Total parity between software lesson-paths and the paper volumes

**Date:** 2026-05-14 · **Iter:** 54 · **Status:** DRAFT — blocking question RESOLVED 2026-05-14 (Andrea: *parità stretta*). Gated on ratifying the rest of the A3 master verdict + factual ratifications #4/#5.
**Governing rule (Andrea):** *parità totale / parità stretta con i volumi cartacei* — the software experiment inventory must exactly equal the **current** printed volume inventory. No experiment ships that is not in the printed volume.
**Inputs:** `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` + the 3 per-volume verdicts · `docs/adrs/ADR-047-*.md` (A3 addendum, D1 reversed) · prior `docs/data/volume-structure.json` + `docs/audits/2026-04-24-tresjolie-vs-tutor-mapping.md`

---

## Problem Statement

The 94 software `lesson-paths/` diverge from the 3 paper volumes. A3 verified every experiment against the printed volume text: 74/94 repo titles are book-faithful, but 20 diverge or have **no printed counterpart**; Tea's `narrative_map` is unreliable (16/22 chapter titles wrong, `nextId` chains jump cross-volume, Vol 3 `bookText` fabricated 0/29); Vol 2 Cap.11 "I diodi" exists in the book with experiments but has **zero** software lesson-paths; Vol 3 ships ~15 experiments with no printed counterpart, plus duplicate ids and chapters over-split relative to the ~14 real experiment blocks. This breaks **Morfismo Sense 2** — the volume↔kit↔software triplet coherence that is ELAB's non-copyable competitive moat — and it breaks **Principio Zero** (a teacher holding the book cannot trust the screen to match it).

## Goals

1. **1:1 inventory parity.** Every printed experiment block has exactly one lesson-path; every lesson-path maps to exactly one printed experiment block. *Measure:* a re-run of the A3 alignment audit reports 0 "neither / no-counterpart" and 0 duplicate ids.
2. **Per-field volume fidelity.** Every lesson-path's title, page, chapter, order, and `next_experiment` chain matches the volume (A3 master verdict is the source of truth). *Measure:* alignment audit reports 0 title/page/chapter/nextId divergences vs volume.
3. **Canonical narrative structure.** `narrative_map` (and the reconciled `chapter-map.js` / `lesson-groups.js`) regenerated from the volumes. *Measure:* 22/22 chapter titles match the volume TOC + body headers.
4. **Additive 7-step `steps` block** on every parità-corrected lesson-path (ADR-047 D2 — additive, `phases` untouched). *Measure:* every lesson-path has a `steps` object with all 7 keys; `phases` byte-identical to pre-A4.
5. **Zero regression.** *Measure:* `npx vitest run` ≥ baseline, `npm run build` exit 0, all 8 lesson-path consumers still function.

## Non-Goals

- **A5 (PZ-V3 validator) and A6 (Modalità Percorso UI)** — separate EPIC 1 atoms, not this spec.
- **Authoring content beyond the volumes.** Parità totale means *match* the volumes, not extend them. No invented experiments.
- **Correcting the volumes.** If a volume has an error (e.g. Vol 3 duplicate exercise numbering, Vol 3 Ch9-12 empty), A4 *flags it for Davide* — it does not "fix" it in software, which would re-break parity.
- **Removing `phases`.** Additive only. `phases` removal is a later ADR after all 8 consumers migrate to `steps`.
- **Deciding the fate of the ~15 Vol 3 no-counterpart experiments.** That is Andrea's call (blocking open question) — this spec defines the *mechanism* (quarantine) but not the *verdict*.

## User Stories

**Docente (primary)**
- As a docente, I want every software experiment to be the *same* experiment — same name, same page, same order — as the volume in my hands, so I can teach from book + screen with zero friction.
- As a docente, when I follow a chapter on screen, the experiment sequence matches the book's printed order so the narrative arc stays continuous.

**Andrea (owner/dev)**
- As Andrea, I want the software experiment inventory to *provably* equal the volume inventory, so the Morfismo Sense 2 moat is real and auditable, not asserted.
- As Andrea, I want experiments with no printed counterpart **quarantined and visibly flagged**, not silently shipped as "volume experiments", so parity claims stay honest.

**Davide (volume author)**
- As Davide, I want A4 to surface where the volumes have gaps or errors (Vol 3 Ch9-12 empty, Vol 3 duplicate exercise 6.4, Vol 2 Cap.11 needs an experiment list) so the next volume edition can close them.

## Requirements

### Must-Have (P0)

**R1 — Inventory reconciliation to 1:1.**
For each volume, the set of lesson-paths must equal the set of printed experiment blocks (A3 master verdict).
- Add the missing: Vol 2 Cap.11 "I diodi" lesson-paths.
- Quarantine (R5) the no-counterpart: the ~15 Vol 3 experiments (PWM/Fade/Knight-Rider/debounce/contatore, the standalone Ch8 "Serial", the 3 `v3-extra-*`).
- Consolidate duplicates: Vol 3 `v3-cap6-morse`/`v3-cap6-esp3`, `v3-cap6-semaforo`/`v3-cap6-esp5` → one id each.
- Collapse over-splits: Vol 3 Ch7 (8 ids + `mini` → the volume's ~1 mini-progetto + 1 "cambia un numero" exercise) and Ch8 (5 ids + `serial` → the volume's ~1 analog-read program).
- **AC:** `node scripts/epic1/build-alignment-records.mjs` + a verdict re-check → 0 records flagged "neither / no volume counterpart", 0 duplicate ids, lesson-path count == printed-block count per volume.

**R2 — Per-field volume fidelity.**
Apply the A3 master verdict per experiment: book-faithful title, canonical page, chapter, and `next_experiment` chain.
- **AC:** alignment audit re-run → `titleAgree`, `pageAgree`, `chapterAgree`, `nextIdAgree` all = corrected count; the cross-volume `nextId` jumps from Tea's map are gone (chain follows printed order).

**R3 — Regenerate the narrative structure from the volumes.**
Rebuild `narrative_map` chapter titles, experiment titles, and `nextId` chains from the volume TOC + body headers. Reconcile `chapter-map.js` and `lesson-groups.js` to it (or retire them — see open question).
- **AC:** all 22 chapter titles match the volume verbatim (A3 chapter-titles master table = 22/22 confirmed).

**R4 — Additive 7-step `steps` block.**
Every parità-corrected lesson-path gains a `steps` object (Tea's `standard_experiment_schema.json` 7-step shape), authored from: the existing repo `phases` content (mapped) + the volume text + Tea's `bookText`/`success_citation`/`analogy` metadata **for Vol 1 + Vol 2 only** (A3: verbatim-verified there). **Vol 3 `steps` authored from the volume text directly** — Tea's Vol 3 metadata is fabricated (A3: 0/29 verbatim). The `misura` step has no `phases` antecedent and is authored fresh.
- **AC:** every lesson-path has `steps` with all 7 keys (`setup, ipotesi, costruzione, misura, variazione, conclusione, trasferimento`); `git diff` shows `phases` blocks unchanged.

**R5 — Staged removal of no-counterpart experiments (strict parity).**
The ~15 Vol 3 no-counterpart experiments are **removed** (Andrea: *parità stretta*). Staged for auditability, not deleted blind: (1) move the lesson-path JSONs to `scripts/epic1/removed-no-volume-counterpart/` + write a removal manifest listing each id and the A3 evidence; (2) update every reference — the 8 consumers, `lesson-paths/index.js`, `lesson-groups.js`, `chapter-map.js`, the regenerated `narrative_map`; (3) CoV green; (4) commit the move; (5) commit the delete. Git history keeps them recoverable if Andrea reverses.
- **AC:** the ~15 are gone from `src/data/lesson-paths/`; **zero dangling references**; canonical inventory count == exactly the printed-block total; alignment-audit re-run shows 0 no-counterpart records.

**R6 — Zero regression.**
- **AC:** `npx vitest run` ≥ baseline (currently 14353); `npm run build` exit 0; the 8 consumers (`UnlimWrapper`, `UnlimReport`, `LessonPathPanel`, `useExperimentLoader`, `GalileoAdapter`, `TeacherDashboard`, `classProfile`, `lessonPrepService`) still load and render.

### Nice-to-Have (P1)

**R7 — Volume gap/error report for Davide.** A doc listing what A4 found the volumes lack or get wrong: Vol 3 Ch9-12 empty shells, Vol 3 duplicate exercise 6.4 numbering, Vol 2 Cap.11 needs a defined experiment list, any title TOC-vs-body mismatches.

**R8 — Canonical integer index.** A stable 1-N integer experiment index ↔ string-id (`v1-cap6-esp1`) mapping — the `album_studente` spec assumes integer ids; establishing it now avoids downstream rework.

### Future Considerations (P2)

- If a future complete Vol 3 edition adds PWM/servo/LCD/Simon/etc. content, those experiments are authored fresh from that edition (strict parity — NOT resurrected from the removed set).
- `phases` removal once all 8 consumers are migrated to `steps` (separate ADR).

## Success Metrics

**Leading (measurable the moment A4 lands):**
- A3 alignment audit re-run: **0** divergences, **0** no-counterpart, **0** duplicate ids. (The audit script `scripts/epic1/build-alignment-records.mjs` is the measurement instrument.)
- 100% of canonical lesson-paths carry a complete `steps` block (grep).
- 22/22 chapter titles volume-verified.

**Lagging:**
- Morfismo Sense 2 test passes: a random volume page next to a random software screen reads as "the same product".
- Docente friction reports (Principio Zero) on "the app doesn't match my book" → 0.

## Open Questions

- **[RESOLVED 2026-05-14 — Andrea: "VOGLIO LA PARITÀ STRETTA"]** The ~15 Vol 3 no-counterpart experiments are **removed** (R5), not quarantined-pending-edition. Strict parity: the software inventory == the *current* printed volume, full stop. Vol 3 V0.8.1's empty Ch9-12 do not earn placeholder software experiments. If a future complete Vol 3 edition adds the content, those experiments are authored fresh from that edition — not resurrected. **A4.2 for Vol 3 is unblocked.**
- **[Andrea]** Vol 2 Cap.12 page: A3 confirms **103** against `vol2.txt`; a stale `volume-references.js` comment says 109 — ratify 103 and delete the comment.
- **[Andrea]** Vol 2 Cap.12 title wording: "Robot segui luce" (body header, A3-preferred) vs "Robot marciante!" (TOC).
- **[Davide / Andrea]** Vol 2 Cap.11 "I diodi": does Davide supply the canonical experiment list, or does A4 extract it from the volume text?
- **[Engineering]** Do `chapter-map.js` + `lesson-groups.js` become *derived views* of the regenerated narrative structure, or are they retired? Affects the 8 consumers.

## Timeline Considerations

- **Hard gate:** A4 does not start until Andrea ratifies the A3 master verdict and answers the blocking open question.
- **Suggested phasing:**
  - **A4.1 — Structure** (data, not content): inventory reconciliation (R1), per-field fidelity (R2), narrative_map regeneration (R3), quarantine mechanism (R5). Read-mostly + structural JSON edits. One iteration, checkpointable.
  - **A4.2 — `steps` authoring** (R4): the genuine multi-iteration content lift — 94-ish experiments × 7 steps, `misura` authored fresh. Vol 1 + Vol 2 first (Tea metadata reliable); Vol 3 only after the blocking open question resolves.
  - **A4.3 — Consumer verification** (R6): confirm the 8 consumers + P1 items.
- **Dependency:** R4's Vol 1 + Vol 2 path depends on Tea's `narrative_metadata_94.json` being usable for those volumes (A3 confirmed: verbatim there). No external dependency for the Vol 1 + Vol 2 structural work.

---
_EPIC 1 A4 spec · iter 54 · governed by "parità totale con i volumi cartacei" · gate: Andrea ratification._
