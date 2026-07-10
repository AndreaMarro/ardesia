# ARDESIA V1 — Principio Zero Canon

Evidence commit: `cedfa932dc91088e6bd30af49ed0f648157c6e1b`
Snapshot / last verified: `2026-07-10T03:49:35+02:00`
Canon recovery: **VERIFIED**
Operational precedence: **RATIFY_REQUIRED**
Runtime compliance: **RED**
Release terminal: **PRINCIPLE_ZERO_RUNTIME_RED**

Confidence rule: HIGH for quoted tracked text, Git provenance and static call
paths at the evidence commit; UNKNOWN for deployed behavior and human classroom
outcomes. Limits are stated per matrix row and cannot be removed when citing it.

## Authentic core

The oldest tracked source that labels itself the exact definition by Andrea is
`plugins/elab-tutor/automa/context/project-history.md:19-23`:

> “ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e
> non solo. Persone totalmente inesperte possono mettersi alla LIM e poter
> spiegare subito, anche appassionandosi. Apprendimento orizzontale.”

This wording is the semantic core. It must not be replaced by an agent-written
paraphrase. The historical implications at lines 25-32 make the teacher the
mediator/co-learner, keep students primarily on the physical activity, and
reject a passive “click, tutor speaks, students read” model.

Git provenance is direct: blame attributes lines 19-31 to
`7d9ad180b0087b0bc27f72db86f6ab363507dc27`, authored by Andrea Marro on
2026-03-26. The authentic core is therefore **VERIFIED**, not reconstructed
from agent memory.

On the current V1 stack, this finding corrects the earlier provisional wording
in `ARDESIA-V1-LOOP-EXECUTABLE.md:32-36` and claim C-011 in
`V1-CLAIM-REGISTER.md:17`, which cite only the later operational `CLAUDE.md`
formulation as the whole canon. Those earlier audit artifacts remain history,
but must not be cited as complete Principle Zero evidence.

## Evidence classification

| Item | Evidence status |
|---|---|
| Authentic definition and authorship | **VERIFIED** |
| Tracked operational rules in `plugins/elab-tutor/CLAUDE.md` | **VERIFIED as written policy**, not as runtime behavior |
| Precedence across conflicting human-authored sources | **UNKNOWN / RATIFY_REQUIRED** |
| Proposed response-channel split below | **INFERRED** |
| Static runtime non-compliance described below | **VERIFIED at evidence commit** |
| Behavior of any currently deployed ELAB instance | **UNKNOWN**; no live deployment was tested in this slice |

## Current operational extension

The newer tracked operational canon in `plugins/elab-tutor/CLAUDE.md:5-16`
declares constraints intended to operationalize the authentic core:

- the teacher is the conduit and UNLIM is the teacher's instrument;
- students work on physical ELAB kits;
- projected Italian class text uses plural teacher voice, normally
  `Ragazzi,`;
- book anchors use `Vol.N pag.M`;
- where the volume is being read or reproduced, its words are verbatim rather
  than an undisclosed paraphrase;
- a person with no prior knowledge must be able to understand and teach.

`CLAUDE.md:32-43,61-99` further requires adaptation to teacher/class/kit while
keeping language, volume order, physical kit, and editorial identity invariant.
The product tutor name is **UNLIM**. Historical `Galileo` references are
lineage, not current naming authority.

## Unresolved conflict and proposed reconciliation

`project-history.md:30` says the teacher ultimately explains using their own
words. `CLAUDE.md:15,33,81-84` requires verbatim volume wording. Runtime text
authored later by Andrea repeats “parole tue” and makes citation optional
(`plugins/elab-tutor/src/services/api.js:126-127`). No tracked source settles
the precedence. The honest status is **RATIFY_REQUIRED**.

The following channel split is an **INFERRED proposal**, not recovered canon.
It is the smallest testable reconciliation found, and becomes authoritative
only after Andrea ratifies it:

| Channel | Rule |
|---|---|
| `BOOK_QUOTE` / reading | Quote exact source text; include volume, page, revision/source; never present a paraphrase as the book. |
| `TEACHER_SCAFFOLD` / explanation | A clearly labelled explanation may paraphrase to help the teacher understand, but retains the source anchor and never replaces or falsifies the quote. |
| `DOMAIN_ACTION` | Typed action against the current circuit; distinguish target, user circuit and valid alternative; preserve provenance and request confirmation when correction changes student work. |

The proposal does not authorize inventing book text or silently classifying a
response into the convenient channel.

Until ratification, precedence is fail-closed: the exact authentic core and
all non-conflicting constraints remain binding; behavior that depends on either
disputed interpretation cannot be certified. No agent may select “own words”
or “verbatim”, or bypass the teacher, merely because that choice is easier to
implement.

## Principle Zero matrix

| Requirement | Source | Current implementation/evidence | Test/gate required | Severity | State |
|---|---|---|---|---:|---|
| Anyone can teach with no prior knowledge | exact definition; `CLAUDE.md:14` | Prompt contains the claim, but `sendChat` defaults `socraticMode=false` (`api.js:825-826`), adds the instruction only conditionally (`:707`), and production calls omit the flag (`CircuitReview.jsx:87`; `sessionReportService.js:91`) | first-use teacher task with no electronics knowledge, no hidden setup | P0 | **RED** |
| Teacher remains mediator, not replaced | history `:25-32`; `CLAUDE.md:7-11` | Runtime says “UNLIM fa la domanda, i ragazzi rispondono” (`api.js:117-123`). This is interactive, not passive reading, but conflicts with the strict teacher-as-conduit interpretation | Andrea must ratify the speaking role; then test all routes against it | P0 | **UNKNOWN / RATIFY_REQUIRED** |
| Physical kit is protagonist | `CLAUDE.md:7,13,92-99` | Kit wording exists only inside the conditionally injected Socratic prompt (`api.js:123,707,825-826`); validator does not require it | every lesson-driving response links action to available physical kit | P0 | **RED** |
| Class-facing plural voice | `CLAUDE.md:12,33` | Route-specific tests exist, but are fragmented. The conditional prompt has one example; `validatePrincipioZero()` has no production caller and does not require the opening, kit, or source (`principioZeroValidator.js:41-81`) | production route matrix across text, voice, image, fallback and errors | P0 | **RED** |
| Exact book provenance | `CLAUDE.md:12,15,81-84`; current mandate | `shouldAppendBookCitation()` always returns false and `ensureBookCitation()` is a no-op (`bookCitation.js:48-60`); always-on prompt makes citation optional (`api.js:853,919-922`) | source-backed quote plus volume/page/revision; mutation test for wrong page/text | P0 | **RED** |
| No undisclosed paraphrase as source | current mandate; `CLAUDE.md:15` | `api.js:126-127` says use own words and cite only if useful; reference data presents an adapted imperative as a book instruction (`volume-references.js:41-47` vs `VOLUME-1-TESTO.txt:1011-1018`) | fail when source text is paraphrased or citation omitted in the ratified quote channel | P0 | **RED** |
| Correct current step and progression | current mandate; history `:46-49` | Two real didactic step sets exist in Studio; generic coverage is incomplete | prefix-state, resume and wrong-order tests per experiment | P0 | RED for corpus |
| No silent correction | current mandate | Typed operations exist in parts; no complete approval proof across tutor routes | target/user/valid diff plus preview-confirm-apply event receipt | P0 | UNKNOWN |
| Grounded, contextual, non-generic answer | exact core; current mandate | RAG/memory claims exist, but this slice did not re-run live grounding | hermetic source test plus live, redacted Mini acceptance test | P0 | UNKNOWN |
| Provenance for explanation and action | current mandate | Scene provenance exists; tutor-response provenance is fragmented | response carries source refs and typed operation/audit IDs | P0 | UNKNOWN |

No fundamental `RED` or `UNKNOWN` row may be waived by aggregate test count.

## Positive examples under the unratified channel proposal

- `BOOK_QUOTE`: `Ragazzi,` followed by a source-exact excerpt whose
  volume/page/revision is recorded and verified.
- `TEACHER_SCAFFOLD`: a labelled analogy that helps an inexperienced teacher,
  followed by the exact source anchor and a physical-kit action.
- A diagnostic that says what differs between book target and user circuit,
  asks before changing it, and records the typed operation.

## Forbidden examples

- “According to the book” followed by model-generated or paraphrased text.
- A generic electronics answer when a verified volume passage exists.
- Student-direct singular instructions or an autonomous tutor lecture that
  sidelines the teacher.
- Silently moving a component, inventing a pin, skipping a step, or treating a
  solver-valid alternative as editorially identical.
- Naming the current tutor `Galileo`.

## Required acceptance suite

1. Exact authentic-core snapshot and precedence test.
2. Route matrix for plural voice, teacher mediation, physical kit, and no-prior-
   knowledge usability.
3. Book-quote mutation tests: wrong word, page, volume, revision, and missing
   source must fail.
4. Andrea-ratified resolution of “own words” versus “verbatim” and teacher
   conduit versus UNLIM-direct delivery; only then test the selected channels.
5. Typed action preview/confirm/apply with target/user/valid circuit diff.
6. Step, resume, save/reopen, and provenance round-trip.
7. Independent human review on LIM and iPad using a novice teacher.

## Ruling

The authentic Principle Zero is no longer unknown. Its operational precedence
is not fully settled: tracked human-authored sources conflict on “own words”
versus verbatim delivery and on the teacher/UNLIM speaking role. Runtime is
independently non-conformant because key behavior is optional and citation
enforcement is a no-op. Therefore authentic-core recovery is **VERIFIED**,
conflict resolution is **RATIFY_REQUIRED**, implementation is **RED**, and
neither ELAB nor the Simulation Plugin is `PILOT_READY`.
