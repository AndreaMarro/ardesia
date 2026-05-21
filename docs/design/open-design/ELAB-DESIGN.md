# ELAB DESIGN.md

Portable design system for Open Design experiments on ELAB Tutor. Use this file as the active `DESIGN.md` when generating prototypes for Modalita Percorso, Regia docente, LIM, report, debug, and end-of-session artifacts.

## 1. Color

Core palette:

- Navy `#1E4D8C`: primary structure, headers, active states, dense tool surfaces.
- Lime `#4A7A25`: positive progress, active Percorso state, teacher-safe confirmation.
- Orange `#E8941C`: attention, timing, construction phase, "check this next".
- Red `#E54B3D`: real risk, blocked hardware, destructive or failed action only.
- White `#FFFFFF`: main canvas and manual-reading backgrounds.
- Light surface `#F7FAFC`: quiet panels, not decorative cards.
- Ink `#1B2430`: body copy.
- Muted ink `#5A6675`: secondary metadata.

Rules:

- Prefer light, LIM-readable surfaces. Dark UI is allowed only for code/editor areas.
- Do not create purple, beige, dark-slate, or espresso-dominant palettes.
- Do not use gradient blobs, bokeh, or generic AI neon.
- Red is reserved for safety or failed state. Do not use it for normal emphasis.
- Lime is an accent, not a full-page wash.

## 2. Typography

Fonts:

- Display and compact headings: Oswald.
- Body, controls, teacher-facing guidance: Open Sans.
- Code, pins, Arduino snippets, IDs: Fira Code.

Scale:

- LIM hero heading: 40-56 px only when the screen is a real class-facing moment.
- Work-surface heading: 22-30 px.
- Panel heading: 16-20 px.
- Body: 15-18 px.
- Metadata: 12-14 px.

Rules:

- Letter spacing is `0`.
- Do not scale type with viewport width.
- Avoid long all-caps labels except hardware IDs.
- Class-facing copy must be short enough to read from a LIM.

## 3. Spacing

Base grid:

- 4 px micro spacing.
- 8 px default rhythm.
- 16 px grouped controls.
- 24 px panel separation.
- 32 px section separation.

Touch and LIM:

- Minimum touch target: 44 x 44 px.
- Coarse pointer target: 48 x 48 px minimum, 56 x 56 px preferred for primary controls.
- Leave room around controls for standing teacher use.

Rules:

- Avoid nested cards.
- Do not use floating decorative page sections.
- Use full-width bands or unframed constrained layouts.

## 4. Layout

Primary ELAB surfaces:

- Modalita Percorso: structured path, canonical volume and experiment flow.
- Regia docente: private control layer, dense but calm, no student-facing spectacle.
- LIM: public read-only layer, high contrast, minimal controls, no backstage text.
- Debug: component-level checks, expected vs observed, physical kit first.
- Report: summary, errors observed, next experiment, teacher memory.

Responsive modes:

- LIM 1080p: two-zone layout, large class text, stable controls.
- LIM 4K: same hierarchy, more breathing room, not more content.
- Tablet docente: bottom-safe controls, compressed metadata, sticky current step.
- Mouse desktop: denser scan layout, hover affordances allowed.

Rules:

- The physical kit remains the protagonist: `kit fisico ELAB`, breadboard, LED, resistor, jumper, Arduino Nano.
- The simulator supports explanation; it does not replace the real build.
- Vol/pag references must stay visible when a generated screen explains a canonical step.
- Same experiment may morph presentation by teacher, class, kit, phase, and device; it must not change the canonical order.

## 5. Components

Preferred components:

- Segmented controls for mode and phase.
- Icon buttons for tool actions, with clear tooltips.
- Toggle or checkbox for binary state.
- Stepper or compact input for numeric state.
- Tabs for teacher-private subviews.
- Compact cards only for repeated items, not for entire page sections.
- Status chips for session phase, kit level, and confidence.
- Diff/check rows for expected vs observed circuit state.

ELAB-specific components:

- Current canonical reference: `Vol.N pag.M`.
- Physical kit strip: components needed and visible subset.
- Session phase rail: intro, costruzione, verifica, report.
- Teacher cue: short phrase the teacher may adapt, never an order.
- LIM prompt: class-facing line beginning with `Ragazzi,`.
- Debug highlight: component/landmark based, not fragile coordinates.

Rules:

- Use ELAB-style icons or lucide-style simple strokes; no emoji icons.
- Cards use radius 8 px or less.
- Text must never overflow buttons, chips, cards, or panels.

## 6. Motion

Allowed:

- 120-180 ms state transition for hover, active, focus.
- 180-240 ms panel reveal for teacher-private surfaces.
- Progress movement that reflects real lesson phase.
- Gentle highlight pulse for a component being checked.

Forbidden:

- Decorative floating orbs.
- Constant background motion.
- Animation that distracts from the physical kit.
- Confetti-like reward during operational debugging.

## 7. Voice

Principio Zero:

- The docente is the guide.
- UNLIM is the teacher's instrument.
- Students work on the physical ELAB kit.
- Student-facing text is collective and begins with `Ragazzi,`.
- Never use individual student addressing.

Copy rules:

- Class-facing: max 3 short sentences, one analogy at most.
- Teacher-facing: actionable but not imperative. Avoid "Ora fai", "Ora di'", "Docente, leggi", "Insegnante, leggi".
- Always keep the canonical volume/page when the manual is the source.
- Do not invent components or steps not present in the current ELAB volume/kit.

Preferred tone:

- Calm, precise, Italian school context.
- The AI prepares, suggests, highlights, remembers, verifies.
- The AI does not take over the lesson.

## 8. Brand

ELAB is a physical-digital laboratory, not a generic electronics kit with a chatbot.

Strategic promise:

- Manuale canonico.
- Kit fisico reale.
- ELAB Tutor as operational body.
- AI as live didactic direction.
- Teacher remains central.

Differentiator:

- Exact coherence between software, Omaric physical kit, and printed volumes.
- Same names, same order, same pages, same expected outcomes.

Do:

- Show the actual experiment, component, page, phase, or class state.
- Make the product feel school-ready, Italian, sturdy, and practical.
- Design for a tired teacher in a real classroom, not for a design portfolio.

Do not:

- Make it look like a SaaS landing page.
- Use generic AI assistant tropes.
- Hide the kit behind abstract dashboards.

## 9. Anti-patterns

Hard no:

- AI chat as the main experience for Percorso.
- Student-facing direct AI conversation.
- Missing `Ragazzi,` in class-facing generated text.
- Missing `Vol.N pag.M` where a manual reference exists.
- "Docente, leggi" or "Insegnante, leggi".
- Imperative backstage copy projected to the LIM.
- Raw experiment IDs shown to the class, such as `v1-cap7-esp1`.
- Components not present in the current kit.
- Screens that explain electronics without referencing the physical build.
- Fake metrics, fake completion percentages, or invented class analytics.
- Decorative cards inside cards.
- Purple AI gradients, bokeh, or generic futuristic styling.

Quality gate:

- If a prototype can be mistaken for a generic chatbot product, reject it.
- If a teacher cannot tell what to do in 5 seconds, simplify it.
- If the physical kit is not visible or named, fix it.
- If canonical volume order changes, reject it.
