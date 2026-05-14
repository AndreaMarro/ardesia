# EPIC 1 A3 — MASTER book-faithfulness verdict

> **Synthesis of the 3 per-volume verdicts.** Source files (full per-experiment tables + proof quotes):
> `2026-05-14-epic1-a3-vol1-verdict.md` · `vol2-verdict.md` · `vol3-verdict.md`.
> Method: each of the 94 experiments verified against the physical volume text
> (`CONTENUTI/volumi-pdf/vol{1,2,3-v0.8.1}.txt`) — the volume text is the sole ground truth.
> READ-ONLY audit. No `src/data/` mutation. Gate for EPIC 1 A4.

## Headline — the iter-54 working assumption is overturned

A2 and ADR-047 D1 assumed **Tea's `narrative_map` is the single source of truth** and the
repo's `lesson-paths/` was the divergent/auto-generated approximation to be migrated *to* Tea.

A3 verified against the actual printed volumes. **The opposite is true:**

- The repo's `lesson-paths/` titles are **book-faithful for 74 of 94 experiments** (all 38 of
  Vol 1, all 27 of Vol 2, 9 of 29 of Vol 3).
- Tea's `narrative_map` titles are the sole-faithful source for **0 of 94**. Where Tea diverges
  from the repo, Tea is wrong — it pastes topics absent from the volume (relays, transistors,
  debouncing, logic gates, Ohm's law).
- Tea's chapter titles are **wrong for 16 of 22 chapters**.
- Tea's `nextId` chains are unreliable (jump cross-volume, skip chapters). The repo chains are
  sequential and match the printed book order.
- Tea's `bookText` is genuinely verbatim for Vol 1 + Vol 2, but **fabricated for all 29 of Vol 3**
  (the "ESERCIZIO 7.1 / 8.1" passages Tea quotes do not exist in V0.8.1).

This is exactly the outcome Andrea's "verifica tutto, non omettere" mandate was designed to
catch. **ADR-047 D1 must be reversed** (see Task 8 / ADR addendum).

## Summary counts

| Volume | Experiments | repo-faithful | tea-faithful (sole) | neither / no volume counterpart | Tea chapter titles wrong |
|---|---|---|---|---|---|
| Vol 1 | 38 | **38** | 0 | 0 | 4 / 9 |
| Vol 2 | 27 | **27** | 0 | 0 | 8 / 9 |
| Vol 3 | 29 | 9 | 0 | **20** (11 have NO printed counterpart) | 4 / 4 + "extra" section is pure invention |
| **Total** | **94** | **74** | **0** | **20** | **16 / 22** |

Confidence: Vol 1 + Vol 2 = all 65 verdicts `high`. Vol 3 = 21 `high` (often "high confidence
that no volume counterpart exists"), 8 `medium`.

## Tooling artifact — correct the A2/Task-4 signal

The `alignment-records.json` `teaBookTextVerified` count of **50/94 is a tooling artifact**, not
a finding. `norm()` in `scripts/epic1/build-alignment-records.mjs` collapses whitespace + lowercases
but does **not** normalize curly quotes / apostrophe variants (`'` vs `'` vs `` ` ``) — pervasive in
Italian volume text (`l'anodo`, `Cos'è`). Verified directly against the volume text:

- Vol 1: ~34-37 / 38 Tea `bookText`s are genuinely verbatim (record flagged far fewer).
- Vol 2: **27 / 27** genuinely verbatim (record flagged only 17 — 10 false negatives).
- Vol 3: **0 / 29** genuinely verbatim — these are *real* fabrications, not artifacts.

So the real signal is sharper than 50/94: Tea's `bookText` is reliable for Vol 1 + Vol 2 and
**fabricated for the whole of Vol 3**. (Fix for the script: extend `norm()` to fold quote/apostrophe
variants — deferred, not blocking; the subagents verified directly.)

## Chapter-titles master verdict (22 chapters)

| Chapter | Tea-inferred title | Volume-text verdict |
|---|---|---|
| v1-cap6 | Il diodo LED | ✅ confirmed ("Cos'è il diodo LED?") |
| v1-cap7 | Il LED RGB | ✅ confirmed ("Cos'è il LED RGB?") |
| v1-cap8 | Il pulsante e il controllo del LED | ✅ confirmed ("Cos'è un pulsante?") |
| v1-cap9 | Sensori, transistor e relay | ❌ → **"Cos'è un potenziometro?"** |
| v1-cap10 | La fotoresistenza | ✅ confirmed ("Cos'è un fotoresistore?") |
| v1-cap11 | Porte logiche con relè (AND, OR) | ❌ → **"Cos'è un cicalino?"** |
| v1-cap12 | Il pulsante: comportamento reale e debouncing | ❌ → **"L'interruttore magnetico"** |
| v1-cap13 | L'elettropongo conduttivo | ✅ confirmed ("Cos'è l'elettropongo?") |
| v1-cap14 | Capstone: sensore di luce intelligente | ❌ → **"Costruiamo il nostro primo robot"** |
| v2-cap3 | Il multimetro | ✅ confirmed |
| v2-cap4 | Le resistenze in serie e parallelo | ❌ → **"Approfondiamo le resistenze"** |
| v2-cap5 | Le batterie in serie e antiserie | ❌ → **"Approfondiamo le Batterie"** |
| v2-cap6 | Serie e parallelo: primi contatti | ❌ → **"Approfondiamo i Led"** |
| v2-cap7 | Circuiti misti e misurazioni | ❌ → **"Cosa sono i condensatori?"** |
| v2-cap8 | Serie e parallelo con LED multipli | ❌ → **"Cosa sono i Transistor?"** |
| v2-cap9 | Pulsanti e logica AND | ❌ → **"Cosa sono i fototransistor?"** |
| v2-cap10 | Porte logiche complete (NOT, NAND, NOR, XOR) | ❌ → **"Il motore a corrente continua"** |
| v2-cap12 | Capstone: l'addizionatore binario | ❌ → **"Robot segui luce"** (body) / "Robot marciante!" (TOC) |
| v3-cap5 | Primi contatti con Arduino e gli interruttori | ❌ → **"Come è fatto un programma Arduino?"** |
| v3-cap6 | Programmare le luci: dalle porte logiche al codice morse | ❌ → **"I pin digitali: le dita di Arduino"** |
| v3-cap7 | Sensori analogici e attuatori (PWM, potenziometro, TMP36) | ❌ → **"I pin di input: Arduino ascolta e decide"** |
| v3-cap8 | Legge di Ohm, potenza, comunicazione seriale | ❌ → **"I pin analogici: Arduino impara a sentire le quantità"** |
| v3-extra | Progetti capstone Vol.3 (LCD, servo, Simon) | ❌ → **section does not exist in V0.8.1** |

**6 confirmed, 16 corrected.** All corrections are sourced to the volume TOC + chapter body headers
(proof quotes in the per-volume files).

## Coverage gaps + structural problems

- **Vol 2 Cap.11 "I diodi"** has printed experiments — but there are **zero `v2-cap11-*` records**
  in either the repo dataset or Tea's map. Missing entirely.
- **Vol 3 is structurally inflated.** V0.8.1 has real content only for Ch5-8 (~14 printed
  experiment blocks). Both the repo (29 `v3-*`) and Tea (29) declare roughly double. **~15 Vol 3
  software experiments have no printed counterpart** (all PWM/Fade/Knight-Rider/debounce/contatore
  experiments, the standalone Ch8 "Serial message", all 3 `v3-extra-*` capstones).
- **Vol 3 has duplicate ids** in the repo: `v3-cap6-morse` + `v3-cap6-esp3` both map to the volume's
  "SOS in codice Morse"; `v3-cap6-semaforo` + `v3-cap6-esp5` both map to "Il semaforo".

## A4 recommendation — REVISED scope

The pre-A3 A4 plan ("additive `steps` migration adopting Tea's content") is wrong. Revised:

| Segment | Count | A4 action |
|---|---|---|
| Vol 1 + Vol 2 repo-faithful | 65 | Adopt the **repo** `lesson-paths` title/page/order as canonical. Add the 7-step `steps` block using Tea's `bookText` + `success_citation` + `analogy` from `narrative_metadata_94` — these ARE verbatim/reliable for Vol 1+2. `misura` step still needs authoring. |
| Vol 3 with a real volume counterpart | 9 (+ ~5 "neither" that map to a real block but need a corrected title) | Adopt the repo title where faithful, the corrected title otherwise. Do NOT use Tea's `bookText` (fabricated for all of Vol 3) — author from the volume text directly. |
| Vol 3 with NO printed counterpart | ~15 | **BLOCKED on Andrea decision** (see below). Do not migrate until ratified. |
| Tea's `narrative_map` itself | — | Regenerate chapter titles (16 wrong), experiment titles, and `nextId` chains from the volumes. The repo's `chapter-map.js` / `lesson-groups.js` / `next_experiment` chains are the better starting point. |

Net: A4 is **smaller** for the 65 Vol1+Vol2 experiments (adopt repo, don't re-author), and **gated**
for ~15 Vol3 experiments. Tea's deliverables are still useful — `bookText`/`citation`/`analogy`
metadata for Vol1+Vol2, and the *structure* of the 7-step schema — but `narrative_map` is not canon.

## Open decisions for Andrea (A3 ratification gate)

1. **Vol 3 — ~15 experiments with no printed counterpart.** PWM/Fade/Knight-Rider/debounce/contatore,
   the standalone Ch8 "Serial message", the 3 `v3-extra-*` capstones (LCD/servo/Simon). Are these
   (a) legitimate software additions awaiting a future Vol 3 edition, or (b) drift to remove for the
   volume↔kit↔software moat? The volume V0.8.1 is silent — this is a product decision, not a verdict.
2. **Vol 3 — duplicate id consolidation.** `v3-cap6-morse`/`v3-cap6-esp3` and
   `v3-cap6-semaforo`/`v3-cap6-esp5` are duplicates. Which id set survives?
3. **Vol 3 — Ch7/Ch8 collapse.** The repo splits Ch7 into 8 ids + `mini` and Ch8 into 5 ids +
   `serial`, but the volume has ~1 mini-progetto in Ch7 and ~1 analog-read program in Ch8. Which repo
   ids to keep / merge?
4. **Vol 2 Cap.12 page** — repo value is 103; A3 confirms **103 is correct** against `vol2.txt`, but a
   stale `volume-references.js` comment + a Tea-external file say 109. Ratify 103 and delete the stale
   comment.
5. **Vol 2 Cap.12 title wording** — TOC "Robot marciante!" vs body header "Robot segui luce" vs repo
   "Robot Segui Luce". Pick the canonical phrasing.
6. **Vol 2 Cap.11 "I diodi" coverage gap** — add `v2-cap11-*` experiments (book has them, software
   has none)?

Items 4-6 are low-stakes ratifications. Items 1-3 are the real Vol 3 product decisions and **block
A4 for the ~15-20 affected experiments** (the 65 Vol1+Vol2 experiments are not blocked).

## Per-experiment detail

Full per-experiment tables, proof quotes, and divergence notes are in the 3 per-volume verdict
files. They are not duplicated here (DRY) — the action-relevant synthesis is above. Vol 3's table
in particular flags every "no volume counterpart" experiment individually.

---
_EPIC 1 A3 · iter 54 · 2026-05-14 · gate: Andrea ratifies this verdict + the 6 decisions before A4._
