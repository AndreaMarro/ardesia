# ARDESIA Four-State Literal Visual Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the real empty whiteboard, populated plugin whiteboard, Knowledge Explorer, and Library match the approved four-quadrant reference while every element remains potentially dynamic, animatable, and modifiable.

**Architecture:** Keep Excalidraw, PluginInstance/PostItFrame, ToolHost, LessonOS, and LessonAsset as the sources of truth. Add one shared shell presentation, render both whiteboard states through `Room`, remove the technical workbench from product routing, and adapt Knowledge and Library without duplicating data. Use state-driven CSS/Web Animations plus existing Excalidraw interactions; use Cytoscape.js for the graph runtime after a direct dependency/license check.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Excalidraw 0.18, Cytoscape.js 3.33, Vitest, Testing Library, Playwright/browser QA.

## Global Constraints

- The 1487 x 1058 user-supplied image is the literal composition, density, hierarchy, palette, and control-placement target for all four states.
- Every plugin is a `PluginInstance` inside a `PostItFrame`, never a product page; compact and expanded presentations share identity and state.
- Knowledge is a LessonOS projection. Library is a view over the same `LessonAsset` and `ContentArtifact` records.
- Every visible element is potentially dynamic and animatable, but motion must be state-driven, interruptible, and reduced by `prefers-reduced-motion`.
- Do not create fake lesson records, assets, graph nodes, or provider results.
- Primary UI must not expose IDs, capability names, FQBN, hashes, MIME, scopes, raw provenance, or RED provider language.
- Touch targets are at least 44 px. No clipping or incoherent overlap at 1440 x 900, 768 x 1024, or 1920 x 1080.
- No new animation framework. No direct push to main. No auto-merge.
- This visual gate does not claim full Tinkercad parity or `FULL_GOAL_GREEN`.

---

## File Structure

- Create `apps/studio/src/design/StudioShell.tsx`: shared wordmark, launcher/search frame, persistent actions, and four-destination rail.
- Modify `apps/studio/src/design/ViewNav.tsx`: semantic navigation items and accessible glyph metadata; Marketplace no longer aliases the simulator workbench.
- Modify `apps/studio/src/Room.tsx`: real empty/populated whiteboard shell, radial creation control, and visual state hooks around Excalidraw.
- Modify `apps/studio/src/App.tsx`: remove the technical multi-post-it route from product routing.
- Create `apps/studio/src/toolhost/PluginInkOverlay.tsx`: local-coordinate annotation document and interactive overlay shared by live plugin post-its.
- Modify `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`: task-language compact headers/details and visual hooks only; preserve runtime, persistence, and commands.
- Modify `apps/studio/src/lessonos/eventlog.ts`: typed annotation mutation event carried by the existing ordered log.
- Modify `apps/studio/src/design/KnowledgeExplorerView.tsx`: approved graph composition, filters, evidence rail, and shared shell.
- Modify `apps/studio/src/design/LessonGraphCanvas.tsx`: Cytoscape runtime adapter with focus, pan/zoom, keyboard focus, and reduced-motion behavior.
- Modify `apps/studio/src/design/LibraryView.tsx`: real shelf groups, search/filter/sort/view state, and shared shell.
- Modify `apps/studio/src/index.css`: visual tokens, shared shell, radial control, post-it treatment, shelves, responsive rules, and motion states.
- Modify focused tests under `apps/studio/src/__tests__` and add browser evidence under `/tmp/ardesia-slice-h-literal-qa`.

The implementation exceeds five changed source files because the user explicitly requires four independent routed states plus one shared shell to converge in the same gate. Each task has one writer and a disjoint primary surface.

### Task 1: Shared Product Shell and Product Routing

**Files:**
- Create: `apps/studio/src/design/StudioShell.tsx`
- Modify: `apps/studio/src/design/ViewNav.tsx`
- Modify: `apps/studio/src/App.tsx`
- Test: `apps/studio/src/__tests__/ViewNav.test.tsx`
- Test: `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`

**Interfaces:**
- Consumes: `ViewNav`, `ArdesiaViewId`, current URL hash.
- Produces: `StudioShell({ current, searchLabel, children, actions, launcher })` and product routes with no Simulation page.

- [ ] **Step 1: Write failing shell and route tests**

```tsx
expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual([
  "lavagna", "knowledge", "library", "marketplace",
])
expect(viewHref("marketplace", "#room")).toBe("/?vista=marketplace#room")
window.history.replaceState(null, "", "/?vista=simulatore-postit#room")
render(<App />)
expect(await screen.findByTestId("multi-postit-workbench")).not.toBeInTheDocument()
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/ViewNav.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx`

Expected: FAIL because Marketplace still aliases `simulatore-postit` and App still mounts the workbench route.

- [ ] **Step 3: Implement the shared shell**

```tsx
export type StudioShellProps = {
  current: ArdesiaViewId
  searchLabel: string
  launcher?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export default function StudioShell(props: StudioShellProps) {
  return (
    <div className="st-studio-shell" data-studio-shell data-current-view={props.current}>
      <header className="st-shell-topbar">{/* wordmark, search/launcher, actions */}</header>
      <ViewNav current={props.current} />
      <main className="st-shell-stage">{props.children}</main>
    </div>
  )
}
```

Change `viewHref("marketplace")` to `/?vista=marketplace`; remove `MultiPostitWorkbench` lazy import and route predicate from `App.tsx`. The workbench remains directly importable by contract tests but is no longer a product page.

- [ ] **Step 4: Run the focused tests and verify pass**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/ViewNav.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx`

Expected: PASS with four global destinations and no product simulator route.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/src/App.tsx apps/studio/src/design/StudioShell.tsx apps/studio/src/design/ViewNav.tsx apps/studio/src/__tests__/ViewNav.test.tsx apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx
git commit -m "feat(studio): unify the four-state product shell"
```

### Task 2: Literal Empty and Populated Whiteboard

**Files:**
- Modify: `apps/studio/src/Room.tsx`
- Modify: `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- Modify: `apps/studio/src/index.css`
- Test: `apps/studio/src/__tests__/Room.integration.test.tsx`

**Interfaces:**
- Consumes: existing `startTextNote`, file input, `insertSimulationPlugin`, `insertArduinoToolchainPlugin`, `insertElabTutorPlugin`, Excalidraw scene, ToolHost write-back.
- Produces: `data-board-state="empty|populated"`, `data-radial-tools`, task-language post-it surfaces, and no technical primary copy.

- [ ] **Step 1: Write failing interaction and language tests**

```tsx
expect(container.querySelector("[data-radial-tools]")).toBeTruthy()
fireEvent.click(screen.getByRole("button", { name: "Apri strumenti" }))
expect(screen.getByRole("button", { name: "Aggiungi plugin" })).toBeTruthy()
expect(container.textContent).not.toMatch(/FQBN|capability|provider diagnostics|keyboard scope/i)
```

- [ ] **Step 2: Run the Room test and verify failure**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/Room.integration.test.tsx`

Expected: FAIL because the radial tools and literal board-state contract do not exist.

- [ ] **Step 3: Add the real radial creation control and board state hooks**

Use the existing actions rather than duplicate command paths:

```tsx
const radialTools = [
  { id: "select", label: "Seleziona", action: () => apiRef.current?.setActiveTool?.({ type: "selection" }) },
  { id: "pen", label: "Penna", action: () => apiRef.current?.setActiveTool?.({ type: "freedraw" }) },
  { id: "text", label: "Testo", action: startTextNote },
  { id: "media", label: "Media", action: () => fileInputRef.current?.click() },
  { id: "plugin", label: "Aggiungi plugin", action: () => setLauncherOpen(true) },
]
```

Derive empty/populated from live scene elements, place the rail and radial control outside Excalidraw's transform layer, and keep all targets at least 44 px.

- [ ] **Step 4: Simplify plugin primary copy without changing runtime**

Add stable visual hooks to Simulation, Toolchain, and ElabTutor post-it roots. Replace instance IDs and capability/provider strings in primary headers with human task/status labels. Move existing diagnostics/provenance under closed `details` labelled `Dettagli tecnici`. Keep every command handler, instance ID data attribute, ToolHost write-back, and LessonOS event unchanged.

- [ ] **Step 5: Implement literal shell, post-it, connector, and motion CSS**

Define `.st-studio-shell`, `.st-shell-topbar`, `.st-view-nav`, `.st-radial-tools`, `[data-plugin-instance-id]`, `[data-motion-state]`, responsive iPad/LIM rules, and:

```css
@media (prefers-reduced-motion: reduce) {
  .st-studio-shell *, .st-studio-shell *::before, .st-studio-shell *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Run focused tests, typecheck, and build**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/Room.integration.test.tsx src/__tests__/ToolCanvasEmbeddable.test.tsx`

Run: `npm run typecheck`

Run: `npm run build`

Expected: all PASS; no TypeScript errors; Vite production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add apps/studio/src/Room.tsx apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx apps/studio/src/index.css apps/studio/src/__tests__/Room.integration.test.tsx
git commit -m "feat(studio): render the literal live whiteboard states"
```

### Task 3: Persistent Live Plugin Annotation Layer

**Files:**
- Create: `apps/studio/src/toolhost/PluginInkOverlay.tsx`
- Modify: `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- Modify: `apps/studio/src/lessonos/eventlog.ts`
- Test: `apps/studio/src/__tests__/PluginInkOverlay.test.tsx`

**Interfaces:**
- Consumes: `instanceId`, current plugin annotation document, `persistEmbedState`, and `emitLessonEvent`.
- Produces: `PluginAnnotationDocument`, `PluginInkOverlay`, local-coordinate SVG/vector items, and typed `plugin.annotation.changed` events.

- [ ] **Step 1: Write failing annotation document and interaction tests**

```tsx
const onChange = vi.fn()
const emitLessonEvent = vi.fn()
render(<PluginInkOverlay instanceId="sim-a" value={emptyPluginAnnotations()} onChange={onChange} emitLessonEvent={emitLessonEvent} />)
fireEvent.click(screen.getByRole("button", { name: "Penna" }))
fireEvent.pointerDown(screen.getByTestId("plugin-ink-stage"), { pointerId: 4, pointerType: "pen", clientX: 20, clientY: 30 })
fireEvent.pointerMove(screen.getByTestId("plugin-ink-stage"), { pointerId: 4, pointerType: "pen", clientX: 80, clientY: 90 })
fireEvent.pointerUp(screen.getByTestId("plugin-ink-stage"), { pointerId: 4, pointerType: "pen", clientX: 80, clientY: 90 })
expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ items: expect.any(Array) }))
expect(emitLessonEvent).toHaveBeenCalledWith(expect.objectContaining({ kind: "plugin.annotation.changed", instanceId: "sim-a" }))
```

- [ ] **Step 2: Run the new test and verify failure**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/PluginInkOverlay.test.tsx`

Expected: FAIL because the overlay contract does not exist.

- [ ] **Step 3: Define the versioned local-coordinate document**

```ts
export type PluginAnnotationTool = "select" | "pen" | "highlighter" | "arrow" | "text" | "eraser"
export type PluginAnnotationItem =
  | { id: string; kind: "stroke"; tool: "pen" | "highlighter"; points: Array<{ x: number; y: number }>; color: string; width: number; authorRole: "teacher" | "student" }
  | { id: string; kind: "arrow"; from: { x: number; y: number }; to: { x: number; y: number }; color: string; authorRole: "teacher" | "student" }
  | { id: string; kind: "text"; at: { x: number; y: number }; text: string; color: string; alternativeText: string; authorRole: "teacher" | "student" }

export type PluginAnnotationDocument = {
  v: 1
  visible: boolean
  locked: boolean
  items: PluginAnnotationItem[]
  undo: PluginAnnotationItem[][]
  redo: PluginAnnotationItem[][]
}
```

Coordinates are normalized to the overlay bounds (`0..1`) so annotations follow resize, move, rotate, dock, collapse, expand, and reopen without rasterization.

- [ ] **Step 4: Add the typed LessonOS mutation event**

Extend `LessonOsEvent` with:

```ts
| (BaseEvent & {
    kind: "plugin.annotation.changed"
    pluginId: string
    operation: "add" | "update" | "remove" | "clear" | "undo" | "redo" | "visibility" | "lock"
    annotationId?: string
    authorRole: "teacher" | "student"
    labels: Labels
  })
```

Use `provenance.surface = "overlay"`, `evidence = ["plugin:<pluginId>@<instanceId>"]`, and a causation ID derived from instance, operation, and annotation ID. Sequence ordering remains assigned by `EventLogStore.append`.

- [ ] **Step 5: Implement all required tools and state controls**

The overlay toolbar exposes Penna, Evidenziatore, Freccia, Testo, Gomma, Seleziona, Mostra/Nascondi, Blocca/Sblocca, Undo, Redo, and Clear. Clear opens an accessible confirmation dialog. Text requires non-empty short text and optional alternative text. Pointer capture completes strokes outside the starting pixel. Pencil writes; mouse/touch draw only when an annotation tool is explicitly active.

- [ ] **Step 6: Mount the same overlay in each live plugin instance**

Read `marker.state.annotations ?? emptyPluginAnnotations()`. On each durable change call `host.persistEmbedState(toolLink.embedId, { ...marker.state, annotations: next }, toolLink.toolId)` and `host.emitLessonEvent`. Do not recreate the document during compact/expanded transitions.

- [ ] **Step 7: Run annotation, ToolHost, typecheck, and build gates**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/PluginInkOverlay.test.tsx src/__tests__/ToolCanvasEmbeddable.test.tsx src/__tests__/LessonOsEventLog.test.ts`

Run: `npm run typecheck && npm run build`

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/studio/src/toolhost/PluginInkOverlay.tsx apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx apps/studio/src/lessonos/eventlog.ts apps/studio/src/__tests__/PluginInkOverlay.test.tsx
git commit -m "feat(studio): add persistent ink to live plugin post-its"
```

### Task 4: Mature Interactive Knowledge Graph

**Files:**
- Modify: `apps/studio/package.json`
- Modify: `apps/studio/package-lock.json`
- Modify: `apps/studio/src/design/LessonGraphCanvas.tsx`
- Modify: `apps/studio/src/design/KnowledgeExplorerView.tsx`
- Test: `apps/studio/src/__tests__/KnowledgeExplorerView.test.tsx`

**Interfaces:**
- Consumes: `GraphCanvasNode[]`, `GraphCanvasEdge[]`, LessonOS snapshot, focused node ID.
- Produces: the same `LessonGraphCanvasProps`, now backed by Cytoscape with pan/zoom/focus and no competing store.

- [ ] **Step 1: Verify reuse decision before dependency change**

Confirm direct version `3.33.1`, MIT license, no runtime service or paid tier, and no known high/critical production vulnerability from the package manager audit. Record the result in the existing reuse register only if the current entry lacks this direct adoption evidence.

- [ ] **Step 2: Write failing graph control tests**

```tsx
expect(screen.getByRole("searchbox", { name: "Cerca nel grafo" })).toBeTruthy()
expect(screen.getByRole("combobox", { name: "Livelli" })).toBeTruthy()
expect(container.querySelector("[data-knowledge-minimap]")).toBeTruthy()
expect(container.querySelector("[data-cytoscape-graph]")).toBeTruthy()
```

- [ ] **Step 3: Run the test and verify failure**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/KnowledgeExplorerView.test.tsx`

Expected: FAIL because the current fixed SVG has none of these controls.

- [ ] **Step 4: Install the already locked mature renderer directly**

Run: `npm install cytoscape@3.33.1 --save-exact`

Expected: `package.json` declares Cytoscape and lockfile remains internally consistent.

- [ ] **Step 5: Replace fixed SVG rendering behind the existing component API**

Create/destroy one Cytoscape instance in an effect, map existing nodes/edges without altering IDs, call `onFocusNode` from `select`, expose zoom controls, and set `motionBlur: false`. Use `animate: !matchMedia("(prefers-reduced-motion: reduce)").matches` only for focus/layout transitions. Keep an accessible node list synchronized with focus for keyboard users.

- [ ] **Step 6: Recompose Knowledge Explorer to the literal quadrant**

Use `StudioShell`; place title/metrics/filter row above the dominant graph, evidence rail at right, level legend at bottom, and minimap bottom-right. Search/filter only existing `snapshot.nodes`; an empty result remains empty.

- [ ] **Step 7: Run tests, typecheck, and build**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/KnowledgeExplorerView.test.tsx src/__tests__/LessonGraphCanvas.test.tsx`

Run: `npm run typecheck && npm run build`

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/studio/package.json apps/studio/package-lock.json apps/studio/src/design/LessonGraphCanvas.tsx apps/studio/src/design/KnowledgeExplorerView.tsx apps/studio/src/__tests__/KnowledgeExplorerView.test.tsx
git commit -m "feat(studio): make the LessonOS graph fully explorable"
```

### Task 5: Literal Real-Asset Library Shelves

**Files:**
- Modify: `apps/studio/src/design/LibraryView.tsx`
- Test: `apps/studio/src/__tests__/LibraryView.test.tsx`
- Modify: `apps/studio/src/index.css`

**Interfaces:**
- Consumes: `LibrarySnapshot.assets`, real asset kinds, `boardFocusHref`.
- Produces: grouped shelf rows, grid/list view state, and origin-preserving open links.

- [ ] **Step 1: Write failing shelf behavior tests**

```tsx
expect(container.querySelector('[data-library-shelf="lesson"]')).toBeTruthy()
expect(container.querySelector('[data-library-shelf="postit"]')).toBeTruthy()
fireEvent.click(screen.getByRole("button", { name: "Vista elenco" }))
expect(container.querySelector("[data-library-layout]")?.getAttribute("data-library-layout")).toBe("list")
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/LibraryView.test.tsx`

Expected: FAIL because Library currently renders a technical card grid.

- [ ] **Step 3: Group only real indexed assets**

```ts
const shelves = [
  { id: "lesson", label: "Lezioni", assets: filteredAssets.filter((a) => a.kind === "note" || a.kind === "image") },
  { id: "postit", label: "Post-it salvati", assets: filteredAssets.filter((a) => a.kind === "postit") },
  { id: "resource", label: "Guide e risorse", assets: filteredAssets.filter((a) => a.kind === "arduino-artifact") },
].filter((shelf) => shelf.assets.length > 0)
```

Render compact visual tiles on horizontal shelves, preserve search/filter/sort/open behavior, move hashes/MIME/scope/source into `Dettagli tecnici`, and use the shared launcher for creation.

- [ ] **Step 4: Add grid/list and motion states**

Add a two-button segmented control with stable 44 px targets. Set `data-library-layout`, animate shelf insertion/focus through CSS state, and disable travel under reduced motion.

- [ ] **Step 5: Run tests, typecheck, and build**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/LibraryView.test.tsx`

Run: `npm run typecheck && npm run build`

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/src/design/LibraryView.tsx apps/studio/src/__tests__/LibraryView.test.tsx apps/studio/src/index.css
git commit -m "feat(studio): organize real lesson assets on shelves"
```

### Task 6: Browser Acceptance and PR Update

**Files:**
- Modify only if evidence requires a fix: files owned by Tasks 1-4.
- Evidence outside repo: `/tmp/ardesia-slice-h-literal-qa/`.

**Interfaces:**
- Consumes: live Vite preview and all four real states.
- Produces: screenshots and probes supporting only `VERIFIED`, `RED`, or `UNKNOWN` claims.

- [ ] **Step 1: Start or reuse the live server**

Run: `npm run dev -- --host 127.0.0.1 --port 5204`

Expected: preview responds at `http://127.0.0.1:5204/` without taking port 5193.

- [ ] **Step 2: Capture all four states at desktop**

Capture 1440 x 900 screenshots for empty whiteboard, populated real-plugin whiteboard, Knowledge, and Library. Save them as `01-empty-desktop.png` through `04-library-desktop.png`. Inspect every saved file before accepting it.

- [ ] **Step 3: Capture iPad and LIM probes**

Capture 768 x 1024 and 1920 x 1080 for each state. Verify no clip, overlap, horizontal page overflow, or text outside controls.

- [ ] **Step 4: Exercise interaction and motion**

Probe launcher, radial tools, pointer drawing, touch-equivalent pan/zoom, compact/expand continuity, plugin runtime buttons, Knowledge search/filter/focus/zoom/minimap, Library search/filter/sort/layout/open, and reduced-motion media emulation. Record console errors; expected count is zero.

- [ ] **Step 5: Run final proportional gates**

Run: `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism src/__tests__/ViewNav.test.tsx src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/KnowledgeExplorerView.test.tsx src/__tests__/LibraryView.test.tsx`

Run: `npm run typecheck`

Run: `npm run build`

Expected: all PASS.

- [ ] **Step 6: Push branch and update the existing PR**

Run: `git status --short && git log --oneline --decorate -8`

Run: `git push origin codex/slice-h-visual-convergence-orbit-20260711`

Update PR #182 with the literal target, screenshot paths, commands/results, known RED/UNKNOWN items, and no parity or full-goal claim. Do not merge.
