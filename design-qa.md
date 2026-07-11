# ARDESIA Visual Convergence Design QA

- Approved visual truth: `docs/product/ARDESIA-UI-CANON.png` (see `docs/ARDESIA-UI-CANON.md`)
- Live implementation: `http://127.0.0.1:5204/#visual-qa-2`
- Viewports: desktop 1440x900, iPad 768x1024, LIM 1920x1080
- Real state: empty board; three live PluginInstances; expanded Simulation instance; four LessonOS events; four Library assets
- Data policy: no mock, demo, or synthetic evidence was added for visual richness

## Evidence

- Empty board: `output/playwright/01-empty-board-1440x900.png`
- Three post-its and same-instance expand: `output/playwright/02-three-live-plugins-expanded-1440x900.png`
- Knowledge from real LessonOS events: `output/playwright/03-knowledge-real-events-1440x900.png`
- Library from real assets: `output/playwright/04-library-real-assets-1440x900.png`
- Library iPad: `output/playwright/05-library-ipad-768x1024.png`
- Pencil/touch surface iPad: `output/playwright/06-board-ink-ipad-768x1024.png`
- Board LIM: `output/playwright/07-board-lim-1920x1080.png`
- Target/implementation comparison: `output/playwright/compare-target-vs-board.png`

## Verified

- Shared shell exposes four destinations and one searchable launcher. Simulation and ELABTutor are not global pages.
- Every real plugin appears as a compact post-it; expand opens the same PluginInstance and returns focus to it.
- Primary copy uses teacher tasks. IDs, capabilities, FQBN, hashes, MIME and provider state remain in technical details.
- Compact post-its expose real live state for circuit current/LED, Arduino source/compile, and tutor links.
- The annotation layer supports pen, highlighter, arrow, short text, eraser, selection, hide/show, lock, undo/redo and confirmed clear over the live plugin.
- Library opens the requested post-it without the delayed row fit overriding focus. Excalidraw's technical style panel stays out of the primary shell while object handles remain.
- Tablet targets are compensated at 841-1024px and 768-840px. At 1024px the compact annotation toolbar measured `overlaps: false`, remained horizontally scrollable and exposed five controls without collision. No visible clipping was found in the accepted desktop, iPad, or LIM captures.
- Browser interactions exercised launcher, compile, tutor command, expand/collapse, annotation controls, Library focus and Knowledge controls. No runtime error was observed in the final navigation check.
- Targeted gate: 92/92 policy, Room and annotation tests pass; typecheck and production build pass.

## Red

- Full suite: 47 failures, 1609 passes, 5 skipped. Independent review classified 41 as stale full-runtime assertions and 6 as stale shell-contract assertions. The compact post-it test migration is not complete, so the merge gate remains RED.
- Knowledge displays only the two nodes currently materialized from four real LessonOS events. The approved image shows a richer lesson graph, but adding invented nodes would violate the real-data gate.
- The expanded Simulation surface is live and functional, but its above-the-fold visual density is still below the approved composition. It must improve through the real runtime, not a raster preview.
- Physical Apple Pencil hardware was not available. Pointer-type tests cover pen/touch/mouse behavior, but device-level Pencil verification remains UNKNOWN.

## Comparison History

1. Removed the global Simulation/ELABTutor routes and separated technical provenance from teacher copy.
2. Replaced page-sized plugins with three compact, live post-its and a same-instance runtime overlay.
3. Added an actionable empty-canvas orbit, responsive row framing and real-state motion.
4. Replaced the fixed radial Knowledge SVG with the maintained Cytoscape runtime over LessonOS data.
5. Rebuilt Library as real lesson shelves and removed its iPad rail collision.
6. Closed the 841-1024px touch-target gap and the LIM shell-action clip.
7. Prevented Library focus from being overwritten and hid the Excalidraw style panel exposed by selection.
8. Restored token-only colors, visible focus outlines and the zero-emoji source policy.

final result: blocked
