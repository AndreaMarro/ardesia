# ARDESIA V1 - Principio Zero Research

Snapshot: `2026-07-10T15:52:44+0200 CEST`
Evidence base: `82bf629d0d73e837b4c58bed370b7f1d24509316`
Worktree: `/Users/andreamarro/VOLUME 3/ardesia-wt-v1-principle-zero-20260710`
Branch: `codex/v1-principle-zero-book-fidelity-20260710`

Allowed claim labels in this file: `VERIFIED`, `REPORTED`, `INFERRED`,
`UNKNOWN`, `RED`, `DEFERRED`.

## Scope

This is a read-only recovery of the authentic Principle Zero canon and its
current runtime gap. It does not change tutor behavior, simulator behavior,
prompt text, production deploys, or classroom readiness. The purpose is to
prevent future product work from building on invented pedagogy.

## Evidence Map

| Item | Status | Evidence | Limit |
|---|---|---|---|
| Authentic Andrea formulation exists | VERIFIED | `plugins/elab-tutor/automa/context/project-history.md:19-23`; blame commit `7d9ad180b0087b0bc27f72db86f6ab363507dc27` | The quote is exact tracked text; classroom outcome remains UNKNOWN |
| Operational extension exists | VERIFIED | `plugins/elab-tutor/CLAUDE.md:5-16,32-33,81-84,92-99` | Written policy, not runtime proof |
| Current runtime enforces the operational extension | RED | `plugins/elab-tutor/src/services/api.js:126-127,707,825-826,853,915-923`; `plugins/elab-tutor/src/services/bookCitation.js:48-60` | Static audit only; no live prompt call was executed in this slice |
| "Own words" versus verbatim precedence is settled | UNKNOWN | `project-history.md:30` and `api.js:126` conflict with `CLAUDE.md:15,33,81-84` | Needs Andrea ratification before certification |
| Teacher conduit versus UNLIM direct class speech is settled | UNKNOWN | `project-history.md:29-31`, `CLAUDE.md:7-11`, and `api.js:121-123` are not identical | Needs Andrea ratification and route tests |
| Product tutor name | VERIFIED | `CLAUDE.md:7`; runtime strings use lineage names in some APIs but current product canon says UNLIM | Naming audit not completed in this slice |

## Recovered Core

Status: VERIFIED.

The exact core is not an agent summary. It is the tracked Andrea quote in
`project-history.md:19-23`:

> "ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e non solo. Persone totalmente inesperte possono mettersi alla LIM e poter spiegare subito, anche appassionandosi. Apprendimento orizzontale."

The immediate implications in `project-history.md:25-31` make the teacher the
enabled human mediator, keep students focused on the physical activity, and
reject a passive "teacher clicks, tutor talks, students read" mode.

## Operational Extension

Status: VERIFIED as written policy.

`CLAUDE.md:5-16` turns the core into product constraints:

| Constraint | Status | Evidence |
|---|---|---|
| Docente as tramite, UNLIM as instrument | VERIFIED | `CLAUDE.md:7` |
| Students work on physical ELAB kits | VERIFIED | `CLAUDE.md:7,13,92-99` |
| Class-facing Italian text opens in plural teacher voice | VERIFIED | `CLAUDE.md:12,32-33` |
| Book anchors use volume/page | VERIFIED | `CLAUDE.md:12,81-84` |
| Book text must be cited and used with the same words | VERIFIED | `CLAUDE.md:15,81-84` |
| Anyone without prior knowledge must teach with the platform | VERIFIED | `CLAUDE.md:14` |

## Runtime Findings

| ID | Finding | Status | Evidence | Required gate |
|---|---|---|---|---|
| P0-R-001 | The strongest Principle Zero prompt is optional | RED | `buildChatMessage()` adds `SOCRATIC_INSTRUCTION` only when `socraticMode` is truthy (`api.js:705-710`); `sendChat()` defaults `socraticMode=false` (`api.js:825-826`) | Route matrix proving every lesson-driving chat path uses the canon |
| P0-R-002 | Runtime prompt asks for paraphrase and optional citation | RED | `api.js:126-127`, `api.js:853`, `api.js:915-923` | Ratified channel rule plus mutation tests for omitted/wrong citation |
| P0-R-003 | Automatic book citation is disabled | RED | `shouldAppendBookCitation()` returns false and `ensureBookCitation()` returns unchanged (`bookCitation.js:48-60`) | Source-backed response receipt with volume/page/revision |
| P0-R-004 | Physical kit primacy is not always-on | RED | Kit wording exists inside optional Socratic instruction (`api.js:123,707,825-826`) | Every lesson-driving response links action to the physical kit or explicitly says why not |
| P0-R-005 | Plural class voice has no complete route proof | RED | Current evidence is static and fragmented; no route matrix proves text/image/fallback/tool paths | Per-route tests for class-facing language |
| P0-R-006 | Teacher mediation semantics are unresolved | UNKNOWN | `project-history.md:29-31`, `CLAUDE.md:7-11`, `api.js:121-123` | Andrea ratification: what UNLIM may say directly to the class |

## Research Questions

| Question | Answer | Status |
|---|---|---|
| What is the authentic Principle Zero? | The exact Andrea quote in `project-history.md:19-23`. | VERIFIED |
| Is `CLAUDE.md` the whole canon? | No. It is an operational extension of the authentic quote. | VERIFIED |
| Can an agent choose "own words" or "verbatim" now? | No. Precedence is unresolved. | UNKNOWN |
| Does runtime currently satisfy "verbatim + citation"? | No static evidence supports that; direct code conflicts with it. | RED |
| Does runtime currently guarantee novice-teacher usability? | No. The strongest instruction is optional and no novice acceptance test was run. | RED |
| Does production prove Principle Zero? | No production P0 test was run in this slice. | UNKNOWN |
| Can future feature work bypass this as "just pedagogy"? | No. The mandate treats P0 as a release gate. | VERIFIED |

## Required Next Gates

1. Andrea ratifies the channel split or another rule for "own words" versus
   verbatim source quotation.
2. Product code makes the ratified P0 instruction always-on for lesson-driving
   routes, not opt-in.
3. Route tests cover chat, image/vision, simulator diagnosis, action tags,
   fallback/moderation, TTS/reading, and tutor context.
4. Book citation tests fail on wrong volume, page, quote, omitted provenance,
   and paraphrase presented as source.
5. A novice-teacher acceptance scenario is run on a deployed SHA.

Until those gates pass, Principle Zero implementation remains RED.
