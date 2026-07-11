# ARDESIA Four-State Literal Visual Convergence

Status: APPROVED BY EXPLICIT USER DIRECTION
Date: 2026-07-11
Reference image: `/Users/andreamarro/.codex/attachments/39858529-ebdb-4a9f-9b22-e5a66d0c1845/image-1.png`
Reference dimensions: 1487 x 1058

## Decision

The reference image is the literal visual acceptance target for all four states:

1. empty whiteboard;
2. whiteboard with three compact plugin post-its and one expanded plugin;
3. Knowledge Explorer;
4. Library.

Literal means matching composition, hierarchy, density, palette, control placement,
spatial rhythm, and perceived polish. Content remains sourced from real workspace,
LessonOS, plugin, and asset state. When real content is absent, the product shows an
honest empty state rather than invented records.

The selected implementation approach is a shared presentation shell and focused
view adapters over the existing canonical entities. A CSS-only reskin cannot satisfy
the target, while a model rewrite would duplicate valid runtime and persistence work.

## Product Model

The visual design does not change the domain model.

- A plugin is a `PluginInstance` presented by a `PostItFrame`; it is never a route or
  product page.
- Compact, expanded, docked, collapsed, moved, resized, rotated, reopened, and
  exported presentations refer to the same instance and state.
- Simulation, Arduino Toolchain, and ElabTutor remain autonomous plugin instances.
  They communicate only through public capabilities and typed `PluginLink` objects.
- The expanded Simulation surface remains an overlay on the whiteboard. It must not
  create a second runtime or rasterize the plugin.
- Knowledge Explorer is a shell view over rebuildable LessonOS projections, not a
  plugin or an independent source of truth.
- Library is an organized view over the same `LessonAsset` and `ContentArtifact`
  records referenced by the whiteboard and graph. It does not duplicate assets.

## Shared Shell

All four states use one recognizable shell:

- ARDESIA Studio identity at top left;
- one centered search-and-create launcher;
- no more than four global destinations: Lavagna, Knowledge, Library, Marketplace;
- no more than three persistent actions;
- no Simulation, Arduino, Tutor, experiment, capability, provider, FQBN, hash, MIME,
  scope, or provenance terminology in primary navigation;
- technical data appears only in an explicit technical-details disclosure.

The shell preserves the reference image's warm near-white field, crisp dark text,
compact navy actions, restrained shadows, blue interaction cues, and green, amber,
coral, and sky object accents. Color marks object meaning and relation rather than
filling the entire interface with one hue family.

## State 1: Empty Whiteboard

The whiteboard occupies the viewport. The left rail and top launcher stay visually
quiet so the canvas is dominant. The center shows a subtle spatial cue and one short
Italian prompt. A radial creation tool sits in the lower-right region and exposes
selection, pen, highlighter, text, media, and the single create launcher. Pan and zoom
controls remain in the lower-left region.

The next action must be understandable within five seconds: create or search for a
note, medium, or plugin. Touch targets are at least 44 px. The radial tool is not a
static illustration: it opens, focuses, collapses, supports keyboard navigation, and
responds to pointer, touch, and Pencil input.

## State 2: Live Plugin Composition

Three compact post-its form the upper composition: Simulation, Arduino Toolchain,
and ElabTutor or another real installed plugin type. Their visible labels describe
human tasks and status. Curved connectors visualize actual `PluginLink` relations.

One Simulation post-it is expanded below them while remaining on the same canvas.
The runtime stays interactive underneath an annotation layer. The layer supports
pen, highlighter, arrow, short text, eraser, and selection. Show/hide and lock are
available without exposing implementation terminology. Clear requires confirmation
and remains undoable.

Annotations use post-it-local coordinates and follow move, resize, rotate, dock,
collapse, expand, reopen, and export. Pencil writes on the annotation layer. Finger
and mouse behavior follows an explicit, predictable interaction mode. Durable strokes
and mutations emit typed LessonOS events with instance ID, author or role, ordering,
and provenance. Expand reuses the same runtime and annotation layer.

The radial tool remains available at canvas level. Object handles appear only on
selection or hover/focus and must not permanently crowd the board.

## State 3: Knowledge Explorer

The reference radial composition is reproduced with an interactive mature graph
renderer already present in the repository, preferring Cytoscape.js. LessonOS remains
the source of truth. Graphify is ingestion or architecture reference only and cannot
become a competing runtime or source of truth.

The graph supports pan, zoom, pinch, search, type filtering, level filtering, focus
neighborhood, back/forward context, and a minimap. The right evidence rail opens the
real event, source, asset, or plugin instance behind a node. Empty or partial graphs
remain honest; the renderer must not fabricate surrounding nodes to fill space.

Nodes, edges, levels, evidence rows, filters, and minimap are interactive and capable
of animated state transitions. Layout motion communicates topology changes and focus;
it does not run continuously without meaning.

## State 4: Library

Library reproduces the reference shelf organization with real records grouped into
lessons, saved post-its, and guides or resources. Search, kind filters, ordering, and
grid/list controls operate on the same asset index. A shelf item opens or focuses its
original asset, graph context, lesson, or plugin instance rather than a copy.

Shelf position, grouping, selection, insertion, focus, and opening are dynamic. Empty
groups collapse cleanly. New-item affordances invoke the shared launcher and do not
create placeholder content.

## Universal Dynamic and Motion Contract

Every visible element is potentially dynamic, animatable, and modifiable where its
entity permits it. This is an interaction capability, not a requirement for constant
motion.

- Elements can expose meaningful states such as entering, focused, selected, moving,
  resizing, linking, expanding, collapsing, updating, and leaving.
- Spatial objects can be directly manipulated when allowed by role and permissions.
- Navigation, search results, filters, graph topology, connectors, plugin status,
  annotation tools, library ordering, and object handles react to real state changes.
- Motion is interruptible and state-driven. Semantic state is persisted; animation
  frames are not written to LessonOS.
- Durable semantic mutations pass through the existing command and event contracts.
  Ephemeral hover, pointer movement, and rendering frames do not pollute the event log.
- `prefers-reduced-motion` removes spatial travel and nonessential interpolation while
  preserving state visibility, focus, and operability.
- Motion must not shift unrelated controls, obscure content, trap focus, or reduce
  pointer and touch accuracy.

Implementation should prefer existing CSS, Web Animations, Excalidraw, and Cytoscape
capabilities. A new animation framework is not justified for this gate.

## Data and Failure Behavior

The shared shell reads current workspace state. The whiteboard uses the existing
board scene and plugin-post-it persistence. Plugin commands and links pass through
ToolHost and LessonOS. Knowledge and Library rebuild from the same events and assets.

Unavailable providers degrade inside the affected post-it with task-oriented copy.
They must not turn global navigation red, erase state, or expose harness diagnostics.
Graph projection failure leaves source events intact. Missing previews leave a clear
asset-type placeholder, never invented educational content.

## Acceptance Evidence

The gate is `VERIFIED` only when all four states meet the following checks:

- browser screenshots at desktop 1440 x 900, iPad 768 x 1024, and LIM 1920 x 1080;
- side-by-side comparison with the reference for composition, density, hierarchy,
  palette, and control placement;
- zero clipping, incoherent overlap, horizontal page overflow, or illegible labels;
- pointer, touch, keyboard, and Pencil/pen-path probes where supported;
- compact-to-expand-to-compact continuity on the same plugin instance;
- annotation draw, select, hide, lock, undo, clear-confirm, persist, and reopen probes;
- graph pan, zoom, pinch-equivalent, search, filter, focus, evidence, and minimap probes;
- Library search, filter, sort, open/focus-origin, and empty-group probes;
- reduced-motion probe;
- no console errors during the four journeys;
- targeted tests, `npm run typecheck`, and production build pass;
- no fake data, no new plugin route, and no regression of persistence or LessonOS.

Visual similarity alone is insufficient if controls are static. Functional correctness
alone is insufficient if any quadrant remains materially different from the literal
reference composition.

## Scope Boundary

This gate converges the four product surfaces and their interaction language. It does
not claim full Tinkercad parity, complete Arduino provider coverage, ElabTutor grounding,
Marketplace readiness, or `FULL_GOAL_GREEN`. Those remain open until their full matrices
have independent evidence.
