# UI-UX-DESIGN-DIRECTION

Date: 2026-07-01
Status: product direction, not implementation claim

## Product Frame

ARDESIA is a living didactic sheet, not a generic dashboard.

The first screen should feel like the work surface:

- paper/board first;
- pen and annotation first;
- plugin objects placed on the sheet;
- lesson context visible without overwhelming the teacher;
- export/import and student-pack available as natural lesson actions.

The personal/product hub is called **Pagina Personale**. Do not use
"pagina docente", "cruscotto docente", or "teacher dashboard" as user-facing
labels.

## GoodNotes Baseline

ARDESIA must eventually match the expected baseline of a serious note app:

- fluid writing;
- pages;
- pen;
- highlighter;
- eraser;
- selection;
- import PDF/image;
- export;
- organization;
- responsive iPad/desktop/LIM behavior.

Do not claim GoodNotes parity until measured with browser/device checks.

## Differentiation

ARDESIA is not better because it has more buttons. It is better if these are true:

- plugins live on the sheet, not in side panels;
- a Simulation Plugin can be manipulated as a lesson object;
- a manual citation can become a board object;
- student-pack export preserves lesson state;
- LessonOS graph grows from real lessons, mistakes, materials, and plugin use;
- AI suggests method and next actions without replacing the teacher.

## Plugin-On-Paper Rules

Plugin objects should behave like durable objects on the sheet:

- visible object boundary;
- direct manipulation;
- resize/move/pin;
- state snapshot;
- export/import;
- provenance;
- versioned manifest;
- clear affordance for "open details" without turning into a separate app.

Avoid:

- permanent right-panel-only tools;
- hidden plugin state;
- app-within-app shells;
- duplicate auth/dashboard/memory/report inside plugins;
- feature tours explaining the UI.

## Core Layouts

| Surface | Primary UI |
|---|---|
| iPad portrait | focus single sheet, transient drawers |
| iPad landscape | sheet + compact tool drawer |
| LIM | large sheet, oversized touch targets, low text density |
| desktop/laptop | sheet center, collapsible manual/plugin/graph panes |
| mobile | review/student-pack, not heavy authoring |

## Learning Psychology

Design choices should reduce cognitive load:

- keep lesson goal visible;
- make next action obvious;
- distinguish teacher actions from student outputs;
- show provenance for generated/exported material;
- avoid decorative noise;
- preserve spatial memory on the board;
- keep plugin feedback immediate and local to the object.

## Simulation Plugin UX

The Simulation Plugin is the first flagship tool.

MVP interaction:

```text
place circuit object -> inspect/modify -> validate -> save state -> export/import
```

Do not promise image-to-circuit yet. MVP input is confirmed structured scene/netlist.

## ELAB Pack UX

ELAB must appear as content/method above the Simulation Plugin:

- lesson path;
- manual references;
- step-by-step mode;
- already-mounted mode;
- common mistakes;
- validators;
- student-pack export.

ELAB must not bring its own app shell into ARDESIA.

## Electrotechnics Solver Pack UX

MVP:

```text
confirmed circuit/netlist -> choose target -> choose method -> step-by-step solve -> PDF/LaTeX export -> save to LessonOS graph
```

Methods:

- Thevenin;
- Norton;
- superposition;
- nodal analysis;
- mesh analysis;
- Millman;
- source transformation;
- equivalent resistance with test source;
- power;
- DC first, then AC/phasors/transients.

Do not claim arbitrary photo/PDF parsing in MVP.

## ExamForge Pack UX

MVP:

```text
verified materials + program + constraints -> new exercises -> full solutions -> PDF/student-pack
```

Legal/product guardrails:

- do not copy past exams;
- do not use school/teacher logos or names;
- do not create output confusable with official exams;
- generate new exercises;
- show provenance and constraints.

## Accessibility

Baseline:

- touch targets large enough for iPad/LIM;
- keyboard reachable core actions;
- color not sole state signal;
- contrast checked;
- text does not overlap;
- reduced-motion mode for animations.

## COV

- Based on ARDESIA product canon and user directive.
- No UI code changed.
- No claim that current UI satisfies this baseline.
- Must be validated later by Playwright/browser screenshots and device-sized viewports.
