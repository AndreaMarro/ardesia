---
name: elab-percorso-morfico
description: Use to generate or critique ELAB Tutor Modalita Percorso, Regia docente, LIM, debug, report, and lesson-flow prototypes that must preserve Principio Zero, canonical Vol/pag references, physical kit primacy, and runtime morphism for teacher/class/session/device.
---

# ELAB Percorso Morfico

Use this skill inside Open Design or another artifact-first design agent when the requested artifact concerns ELAB Tutor's Modalita Percorso or live lesson direction.

## Load First

Use the active ELAB `DESIGN.md` before generating. If unavailable, ask for or load `docs/design/open-design/ELAB-DESIGN.md`.

## Non-negotiables

- The docente remains the guide; UNLIM supports the docente.
- Students do not chat with UNLIM.
- The physical ELAB kit is always protagonist; name it as `kit fisico ELAB` when producing Italian class-facing or teacher-facing copy.
- Preserve canonical volume, page, experiment order, components, and next experiment.
- Student-facing text begins with `Ragazzi,`.
- Keep `Vol.N pag.M` visible when the manual is the source.
- Never show raw IDs like `v1-cap7-esp1` as class-facing copy.
- Never use "Docente, leggi", "Insegnante, leggi", "Ora di'", "Ora fai", or "Ora distribuisci".

## Required Inputs

Before producing a prototype, identify or request:

- Surface: `percorso`, `regia`, `lim`, `debug`, `report`, or `handoff`.
- Canonical state: volume, chapter, experiment, page, step, next experiment.
- Session phase: `intro`, `costruzione`, `verifica`, or `report`.
- Teacher profile: expert, first-year, non-specialist, or unknown.
- Class profile: age range, competence, pace, recurring errors if known.
- Kit profile: Omaric base, advanced, or explicit component subset.
- Device context: LIM 1080p, LIM 4K, tablet docente, or desktop.

If any input is missing, use defensive placeholders labelled as unknown. Do not invent canonical facts.

## Output Contract

Produce an artifact with two clearly separated layers when relevant:

- Private regia layer: dense teacher controls, timer, current step, fallback plans, UNLIM cue.
- Public LIM layer: read-only class view, short `Ragazzi,` prompt, visual focus, no backstage text.

Every artifact must include:

- Current canonical reference: `Vol.N pag.M`.
- Physical kit strip or equivalent visible kit reference.
- Session phase indicator.
- Next step or next experiment label using class-friendly title.
- At least one validation note describing what the UI must prove in E2E or review.

## Morphism Rules

Same experiment, different presentation:

- Expert teacher: fewer base examples, denser controls, optional variants visible.
- First-year teacher: micro-steps, ready phrases, more analogies, fewer simultaneous controls.
- Younger or fragile class: simpler language, larger visuals, smaller step count.
- Advanced class: autonomy prompts, prediction checks, optional extension.
- Intro phase: objective, story hook, components.
- Costruzione phase: checklist, component focus, expected build state.
- Verifica phase: expected vs observed, error patterns, proof request.
- Report phase: summary, recurring errors, next experiment.

Morphism may change layout, density, copy length, component visibility, and UI emphasis. It must not change the canonical experiment path.

## Critique Gate

Before final output, score 1-5:

- Pedagogical fidelity.
- Canonical volume parity.
- Physical kit primacy.
- LIM readability.
- Teacher workload reduction.
- Visual restraint.

If any score is below 4, revise once before emitting.

## Rejection Checklist

Reject or revise if:

- The result is mostly a chatbot.
- The class view exposes teacher controls.
- The AI appears to replace the teacher.
- The physical kit is absent.
- Manual page reference is absent where known.
- Copy is too long for a real classroom.
- The design relies on generic AI gradients or decorative spectacle.
- The artifact invents data, components, metrics, or experiment order.
