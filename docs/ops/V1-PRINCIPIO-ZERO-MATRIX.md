# ARDESIA V1 - Principio Zero Matrix

Snapshot: `2026-07-10T15:52:44+0200 CEST`
Evidence base: `82bf629d0d73e837b4c58bed370b7f1d24509316`

Allowed claim labels: `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`, `RED`,
`DEFERRED`.

## Release Ruling

Principio Zero authentic recovery is VERIFIED. Runtime compliance is RED.
Precedence questions are UNKNOWN until Andrea ratifies them.

## Requirement Matrix

| Requirement | Canon source | Current evidence | Status | Acceptance gate |
|---|---|---|---|---|
| Anyone can teach without prior electronics knowledge | `project-history.md:21-23`; `CLAUDE.md:14` | Prompt text contains the claim only in optional Socratic instruction; no novice-teacher flow was tested | RED | First-use teacher scenario from cold start on deployed SHA |
| Teacher is enabled, not replaced | `project-history.md:25-31`; `CLAUDE.md:7-11` | Runtime says UNLIM may ask the class directly (`api.js:121-123`); exact speaking role is not ratified | UNKNOWN | Andrea-ratified role contract plus route tests |
| Students work on physical kits | `CLAUDE.md:7,13,92-99` | Kit wording exists inside optional prompt; no always-on route proof | RED | Every lesson-driving response references physical kit action or grounded exception |
| Projected Italian class voice is plural | `CLAUDE.md:12,32-33` | Static policy exists; complete route proof not present | RED | Text, vision, fallback, action and TTS tests reject student-direct singular |
| Book source is cited with volume/page | `CLAUDE.md:12,81-84` | Runtime repeatedly makes citation optional | RED | Missing/wrong source mutation test fails |
| Book wording is not silently paraphrased as source | `CLAUDE.md:15,81-84` | `api.js:126` says "parole tue"; citation helper is no-op | RED | Ratified quote channel and source-exact quote tests |
| Tutor name is UNLIM | `CLAUDE.md:7` | Product canon says UNLIM; older Galileo naming appears in lineage and API names | UNKNOWN | Naming audit across visible UI, prompts, logs and exports |
| Actions are grounded in current circuit state | Current V1 mandate | Simulator context can be injected, but route coverage was not proven here | UNKNOWN | Live circuit mutation tests with target/user/valid diff |
| No silent correction of student work | Current V1 mandate | Typed operations exist in parts, but no end-to-end approval receipt was verified | UNKNOWN | Preview-confirm-apply receipt before mutation |
| Save/reopen/tutor context preserves P0 evidence | Current V1 mandate | LessonOS primitives exist; no full deployed round-trip was verified here | UNKNOWN | Reopen scenario carries quote/action/provenance receipts |

## Route Matrix

| Route | Current evidence | P0 status | Required test |
|---|---|---|---|
| `sendChat()` text | `SOCRATIC_INSTRUCTION` optional; default `socraticMode=false` | RED | Lesson-driving text call must include P0 instruction and provenance |
| Vision/image chat | Shares `sendChat()` surface but no current route proof in this slice | UNKNOWN | Image diagnosis keeps teacher voice, kit primacy, citation when book-bound |
| Simulator diagnosis | Context injection exists; no full route proof in this slice | UNKNOWN | Diagnosis distinguishes book target, user circuit and valid alternative |
| Tool action tags | Action tags exist, but no no-silent-correction proof in this slice | UNKNOWN | Action preview and explicit approval before applying circuit mutation |
| Book reading/TTS | Policy says verbatim; runtime citation policy conflicts | RED | Exact quote, volume/page/revision and source hash receipt |
| Moderation/fallback | `MODERATION_RESPONSE` is generic electronics help | RED | Fallback remains class-safe, teacher-mediated and non-generic |
| Lesson event / graph | Local materializer tests exist elsewhere; no P0 proof here | UNKNOWN | Event stores source refs, action IDs, and P0 channel classification |

## Non-Negotiable Negative Tests

| Mutation | Expected result |
|---|---|
| Remove `Ragazzi,` from a class-facing Italian answer | Test fails |
| Replace exact book quote with paraphrase in quote channel | Test fails |
| Omit volume/page from book-bound answer | Test fails |
| Say "do this" directly to the teacher in a projected instruction | Test fails unless ratified channel allows it |
| Give a simulator-only instruction while a physical kit action is required | Test fails |
| Apply a circuit correction without a preview/approval receipt | Test fails |

## Current Allowed Claims

| Claim | Status |
|---|---|
| The authentic Principle Zero has been recovered | VERIFIED |
| The current runtime is Principle-Zero-compliant | RED |
| The exact delivery rule is fully ratified | UNKNOWN |
| A V1 lesson can be declared pilot-ready on Principle Zero | RED |
