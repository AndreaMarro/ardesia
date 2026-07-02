# SIMULATION PLUGIN ELAB V1 CAP6 ESP1 CONTEXT PACKET

Status: prepared context packet, no runtime change
Date: 2026-07-02
Scope: next product micro-slice after PR #8, PR #11, and PR #12.

## Guardrails

- No deploy.
- No AgentMemory action.
- No PR #6.
- No new ELAB app.
- Maximum 5 files in the next implementation slice.
- Do not import `plugins/elab-tutor` as an app into ARDESIA Studio.
- Do not add capabilities to the simulator manifest unless the test proves a
  capability is required.
- If UI is touched in the next slice, capture desktop and mobile screenshots.

## Read Before Work

Read in this order:

1. `AGENTS.md`
2. `apps/studio/AGENTS.md`
3. `apps/studio/CLAUDE.md`
4. `plugins/elab-tutor/AGENTS.md`
5. `plugins/elab-tutor/CLAUDE.md`
6. `docs/ELAB-AS-PLUGIN-CANON.md`
7. `docs/vault/14-ELAB-PLUGIN-LAVAGNA-spec-competitive-2026-06-16.md`
8. `packages/engine/docs/TOOLHOST-SPEC-v0.md`
9. `apps/studio/src/toolhost-protocol/manifest.ts`
10. `apps/studio/src/toolhost-protocol/capabilities.ts`

Key constraints from those files:

- Studio owns shell, board, ToolHost, sandbox, auth, memory, and reporting.
- ELAB owns only simulator/canvas content for this slice.
- ToolHost tool = static web app in a sandboxed iframe, JSON-RPC over
  MessageChannel, manifest validated by Zod.
- `board.write` must stay scoped to `own-embeds`.
- The Volume text and physical kit are canonical. The simulator verifies and
  explains the kit; it does not replace it.

## Source Files Studied

- Volume 1 PDF: `plugins/elab-tutor/public/volumes/volume1.pdf`
- Extracted PDF text: `/tmp/ardesia-vol1-cap6-pages29-33.txt`
- Lesson path: `plugins/elab-tutor/src/data/lesson-paths/v1-cap6-esp1.json`
- Experiment data: `plugins/elab-tutor/src/data/experiments-vol1.js`
- Existing Studio sim: `apps/studio/sim/entry.html`
- Existing Studio manifest: `apps/studio/sim/manifest-source.json`
- Existing Studio tests:
  - `apps/studio/src/__tests__/ReferenceBlinkDemo.test.tsx`
  - `apps/studio/src/__tests__/ToolReferenceSim.test.ts`

## Volume 1 Evidence

PDF pages 29-31 are the source for this experiment.

Page 29 lists the required parts:

- LED
- breadboard
- 9V battery
- 9V battery clip
- 470 Ohm resistor

Page 30 gives the build sequence:

- connect the battery clip to the battery;
- connect battery positive to the upper red breadboard strip;
- connect the 470 Ohm resistor between any point on the red strip and any
  point in the lower area;
- connect the long LED leg toward the resistor and the short leg in the lower
  area after the center gap.

Page 31 closes the circuit:

- connect battery negative in any point of the same column as the short LED
  leg;
- the LED turns on;
- try another LED color.

Important reading: the book gives a physical relation and polarity rule, not a
fixed breadboard coordinate system.

## Data Comparison

Automated comparison result:

```json
{
  "experimentId": "v1-cap6-esp1",
  "sameComponents": true,
  "sameWires": true,
  "lessonHasPinAssignments": false,
  "bookReference": { "volume": 1, "page": 29, "label": "Vol.1 pag.29" },
  "pdfPagesNeeded": [29, 30, 31],
  "experimentStepsCount": 6,
  "buildStepsCount": 10,
  "fixedHoleRefs": [
    "bb1:a2",
    "bb1:a9",
    "bb1:b2",
    "bb1:e9",
    "bb1:f10",
    "bb1:f9",
    "bb1:j10"
  ]
}
```

Observed alignment:

- Lesson path and `experiments-vol1.js` agree on components:
  `battery9v`, `breadboard-half`, `resistor 470`, `led red`.
- Lesson path and `experiments-vol1.js` agree on the six wires.
- `experiments-vol1.js` adds fixed pins and layout for the canonical simulator
  scene.

Observed drift:

1. The PDF spans pages 29-31, but `book_reference` only records page 29.
2. The PDF says "un punto qualsiasi" for placement; `experiments-vol1.js` fixes
   A2/A9/F9/F10 and related wires.
3. Lesson path has build intent components/wires but no `pinAssignments`, so a
   drift test cannot rely on the lesson path alone.
4. Lesson path has icon emoji in `components_needed` and phases. Do not move
   those icons into Studio UI.
5. Existing Studio `Reference Sim` is a generic Blink LED tool, not yet bound to
   ELAB Vol.1 cap.6 esp.1.

## Implementation Decision

Do not implement UI in this pass.

Reason: a testable implementation needs an explicit canonical circuit fixture
for ELAB Vol.1 cap.6 esp.1 first. Without that fixture, editing `entry.html`
would create a visual claim with weak provenance and no durable drift gate.

This pass therefore prepares a context packet only.

## Next Slice

Target: make the existing Simulation Plugin show ELAB Vol.1 cap.6 esp.1 as a
manual-aligned circuit, still as a board-hosted ToolHost plugin.

Maximum touch set: 5 files.

Recommended files:

1. `apps/studio/sim/entry.html`
2. `apps/studio/sim/manifest-source.json`
3. `apps/studio/src/design/ReferenceBlinkDemo.tsx`
4. `apps/studio/src/__tests__/ReferenceBlinkDemo.test.tsx`
5. `docs/ops/SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-COV.md`

Do not touch in the first implementation slice:

- `plugins/elab-tutor/src/data/experiments-vol1.js`
- `plugins/elab-tutor/src/data/lesson-paths/v1-cap6-esp1.json`
- `plugins/elab-tutor/src/App.jsx`
- `plugins/elab-tutor/src/main.jsx`
- ELAB auth, dashboard, memory, AI, Supabase functions, or reports.

## Required Drift Test

The next implementation must include a manual/circuit drift test with these
assertions:

1. the rendered simulator names the source as `Vol.1 pag.29-31`;
2. required parts match the PDF and ELAB data:
   - LED;
   - breadboard;
   - 9V battery plus clip;
   - 470 Ohm resistor;
3. the canonical circuit preserves the `experiments-vol1.js` fixed pins:
   - `r1:pin1 -> bb1:a2`;
   - `r1:pin2 -> bb1:a9`;
   - `led1:anode -> bb1:f9`;
   - `led1:cathode -> bb1:f10`;
4. wire endpoints match the current lesson-path intent;
5. ToolHost capability remains only `board.read` and `board.write` with
   `scope: own-embeds`;
6. export/import restores the simulator embed;
7. the copy says this is a manual-aligned simulator slice, not a full product
   readiness claim.

## Browser COV For Next Slice

If the next slice touches UI:

1. run the Studio locally;
2. capture desktop screenshot after mounting the simulator;
3. capture mobile screenshot after mounting the simulator;
4. verify board -> plugin -> interaction -> export/import;
5. do not deploy.

## Rollback

Rollback for this packet: close the branch or revert the single docs commit.

Rollback for the next implementation slice: revert the implementation PR. It
must not change production deploys, AgentMemory, launchd, or ELAB standalone
runtime.

## COV

Commands/probes used for this packet:

- `gh pr view 8 --json ...`
- `gh pr edit 8 --title "docs(demo): record live Vercel vertical-slice evidence"`
- `gh pr ready 8`
- `pdftotext -f 29 -l 33 plugins/elab-tutor/public/volumes/volume1.pdf /tmp/ardesia-vol1-cap6-pages29-33.txt`
- `node --input-type=module` drift comparison between `experiments-vol1.js` and
  `lesson-paths/v1-cap6-esp1.json`
- `rg --files` and `rg -n` for source discovery

Not done:

- no deploy;
- no runtime change;
- no AgentMemory mutation;
- no PR #6 action;
- no screenshots, because no UI was touched;
- no implementation, because the drift fixture must come first.
