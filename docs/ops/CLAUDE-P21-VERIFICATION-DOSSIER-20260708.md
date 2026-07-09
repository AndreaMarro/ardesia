<!-- Provenance: produced by a 21-agent adversarial verification fleet (Workflow "p21-verification-fleet", run wf_16356577-fa9, 2026-07-08), certified by Claude Code. Machine-generated; every claim cites file:line and is human-reviewable. Method: 1 build gate + 12 read-only dimension audits (try-to-falsify) + 7 refutation attempts + 1 high-effort synthesis. No source files modified. -->

# P+21 Scientific Verification Dossier — "Full Excalidraw Embeddable Shape For Plugin Board Scenes"

**Worktree:** `/Users/andreamarro/ardesia-wt/tutor-ux` · **App:** `apps/studio` · **Branch:** `docs/simulation-plugin-v2-contract-20260707` @ `ab91e476`
**Verdict:** `p21-gap-found` (production-scoped functionality correct and tests green; two adversarial refutations succeeded on broader claims; all gaps low-severity/latent; Playwright-class real-browser risk remains open)
**Method:** Adversarial synthesis of one build gate + 12 dimension audits + 7 refutation attempts. Every fact below is cited `file:line` from those audits. No files were modified.

---

## 1. Executive summary (honest)

P+21 is **implemented** in the working tree with a **full Excalidraw embeddable element shape**, not the "minimal fields" the 18:42 handoff described. The focused test file passes **9/9 in isolation** (independently re-run in multiple audits with vitest v4.1.8). The build gate is green (`✓ built in 26.62s`, NPM_EXIT=0), solver drift is empty, and no private simulator/solver internals are imported. The stale-handoff premise is falsified by firsthand file reads.

However, this is **not** a clean-complete result. Two adversarial refutations returned `refuted:true`, and two dimension audits returned `gap-found`:

1. **Render-vs-hydrate DOM-id divergence** (EXECUTED probe, high confidence) — the render path can emit **duplicate DOM/control ids** for a scene the hydration path rejects.
2. **Non-finite-number `.lesson` round-trip hard-fail** (EXECUTED repro, medium confidence) — a type-valid `Infinity`/`NaN` current survives `structuredClone` but is coerced to `null` by JSON and then **throws** at restore.

Both are **low-severity and latent** — the production helper `createMultiPostitWorkbenchPostits()` never produces the triggering inputs, so the happy path is correct — but per the verdict rule ("if any adversarial refutation succeeded ... it is p21-gap-found"), they preclude a `complete-verified` or `complete-with-residual-risks` verdict.

On top of the gaps, a genuine **coverage residual** stands: no test drives these elements through a real `<Excalidraw>` mount; real-browser correctness is inferred from field-parity with the e2e-proven `createToolEmbedElement`, not observed.

---

## 2. Build gate & drift (independently re-captured)

| Gate | Result | Evidence |
|---|---|---|
| Build | **PASS** | `npm --prefix .../apps/studio run build` → "✓ built in 26.62s"; re-run TRUE npm exit `NPM_EXIT=0`; build.log grep `error|exception|failed|ERR!` → no match (grep exit 1). Only advisory: rolldown/vite ">500 kB chunk" warning (non-fatal). |
| Solver drift | **ZERO (scoped)** | `git diff --name-only -- apps/studio/sim/solver` → empty, exit 0. Path verified to EXIST (catalog.ts, elabSolver.ts, engine/, pinVocabulary.ts) and `git status --porcelain -- apps/studio/sim/solver` → empty. Not a false-negative. `touchedSolver=false`. |
| Typecheck | `tsc -b --noEmit: 0 errors` (established evidence) | NOT independently re-run in the unit-vs-real audit (build exceeded local 2-min limit); vitest uses esbuild which strips types, so type-level correctness rests on the established evidence, a known false-green risk per project memory. |
| Whitespace | `git diff --check` clean (established) | — |

**Honest scope caveat (from build gate):** the worktree has OTHER uncommitted tracked changes under `apps/studio/sim/` but NOT under `sim/solver` (sim/core/simulationScene.ts, wokwiDiagramAdapter.ts, elab/bookConstraints.ts, elab/elabScene.ts, a fixtures JSON, providers/simulationProviders.ts, plus SimulationPluginWorkbench.tsx and two Simulation*.test files). These are a **separate ElabScene/simulation batch, not P+21 and not solver files** — the tree is not globally pristine, but they had no effect on solver-drift or the build.

---

## 3. Provenance & handoff reconciliation (scientific honesty)

**The stale-handoff premise is confirmed as a stale-not-fabricated discrepancy.**

- The three P+21 files are **UNTRACKED (`??`)** and exist on **no git ref**: `git log --all --oneline -- multiPostitBoardPersistence.ts` and `-- BoardPluginPostitPersistence.test.ts` both EMPTY; `git stash list` EMPTY; `git ls-files` returns empty for the two production files. Implemented in the working tree, never committed.
- File mtimes place the full-shape work **AFTER** the handoff: `multiPostitBoardPersistence.ts` mtime `18:50:03`, `BoardPluginPostitPersistence.test.ts` `19:04:51`, `multiPostitWorkbenchModel.ts` `19:06:06` — all strictly after the `18:42 CEST` handoff (which itself was written when the helper still emitted minimal fields).
- The **same runbook** already carries a later self-dated `19:20 CEST` "Session P+21 Checkpoint - Full Excalidraw Embeddable Shape" (runbook line 7537-7539) documenting completion; the earlier 18:42 handoff section was never edited — which is exactly what makes it **stale**.

**Factual statement (no speculation about causes):** The runbook Handoff (18:42) statement "Codex did not start P+21 code changes" and "helper emits minimal embeddable-like objects" is **contradicted by the current working-tree files**, which contain the full Excalidraw shape (`multiPostitBoardPersistence.ts:33-63, 167-208`). Per mtimes and the runbook's own later checkpoint, the work was performed after the handoff was written; the premise was stale, not a fabrication. Authorship is not attributable from git (all untracked); the runbook self-attributes to "Codex" but that is not independently verifiable.

---

## 4. Dimension-by-dimension results (12 audits)

| # | Dimension | Verdict | Severity |
|---|---|---|---|
| 1 | Excalidraw embeddable element-schema completeness | confirmed | none |
| 2 | normalizeDuplicatedToolEmbeds safety for the 3 production postits | confirmed | none |
| 3 | link/embedId/elementId contract | confirmed | none |
| 4 | restore backward-compat + fail-closed | **gap-found** | low |
| 5 | .lesson export/import + room-path normalization | confirmed | none |
| 6 | render path + DOM id uniqueness | **gap-found** | low |
| 7 | no private simulator/ELABTutor imports (canon) | confirmed | none |
| 8 | no second ELABTutor simulator (ELAB-AS-PLUGIN-CANON) | confirmed | none |
| 9 | instanceId identity preservation end-to-end | confirmed | none |
| 10 | unit-test vs real-@excalidraw render divergence | confirmed (residual) | low |
| 11 | handoff-vs-reality reconciliation | confirmed | low |
| 12 | coverage completeness critic | confirmed | low |

### 4.1 Element-schema completeness (CONFIRMED)
`createPluginPostitBoardElement` (`multiPostitBoardPersistence.ts:173-207`) emits all 25 `_ExcalidrawElementBase` required fields + `type` + `customData`, field-for-field against `node_modules/@excalidraw/excalidraw/dist/types/excalidraw/element/types.d.ts:27-72`. `ExcalidrawEmbeddableElement` adds zero required fields (`types.d.ts:85-87`). Every "suspicious" constant is within the declared domain: `roughness:0`=ROUGHNESS.architect, `roundness:{type:3}`=ROUNDNESS.ADAPTIVE_RADIUS (value optional), `index:null` explicitly permitted for new elements (`types.d.ts:55-59`), `updated:0`/`seed`/`versionNonce`/`version` all type-valid numbers used only for roughjs RNG and collab reconciliation (irrelevant to an iframe/embeddable surface). Live wiring present: `Room.tsx:908` `validateEmbeddable={/^maestro-tool:\/\//}` + `Room.tsx:913-924` `renderEmbeddable`.

### 4.2 normalize safety (CONFIRMED)
For all three production postits `element.id === parseToolLink(link).embedId`, so `normalizeDuplicatedToolEmbeds` returns `changed===false` (`ToolCanvasEmbeddable.tsx:494-511`; `multiPostitBoardPersistence.ts:167-208`). `instanceId` is gated by `INSTANCE_ID_RE=/^[a-z0-9][a-z0-9-]{0,63}$/` (`caps/instance.ts:7`) and `pluginId` whitelisted to two clean dotted constants by `assertWorkbenchPostit` (`multiPostitWorkbenchModel.ts:188-198`), so both id and link path are always the identical URL-safe string. Empirical URL round-trip: sim-a/sim-b/elab-consumer all `WOULD_REWRITE=false`. Asserted at `BoardPluginPostitPersistence.test.ts:182-188`.

### 4.3 link/embedId/elementId contract (CONFIRMED)
`elementId = plugin-postit-<instanceId>-board` (`multiPostitBoardPersistence.ts:98-100`, `postitObject.ts:184-196`); `link = maestro-tool://<pluginId>/<elementId>` (`:291-293`); `element.id === elementId` by construction (`:174,198`). Empirical `new URL()` parses both reverse-DNS pluginIds as hostname with `embedId === element.id`. Restore recomputes `expectedElementId`/`expectedLink` and throws on mismatch (`:249-257`).

### 4.4 restore backward-compat + fail-closed (**GAP-FOUND, low**)
Fail-closed behavior is solid and empirically confirmed: owner/id/link mismatch and non-finite bounds all throw (`multiPostitBoardPersistence.ts:245-257,278-289`); malformed ids and non-string owners throw; duplicate identities rejected downstream (probe I: 'duplicate plugin post-it instance'). **But** the advertised legacy-link backward-compat is internally inconsistent: line 252 accepts a legacy link, yet line 255 unconditionally demands the NEW `-board` id. The canonical legacy element (id = bare instanceId) is REJECTED with 'id mismatch' (probe C, confirmed); the only shape the legacy branch uniquely accepts {legacy link + new `-board` id} violates the normalizer invariant (`ToolCanvasEmbeddable.tsx:500`) and no writer emits it. The legacyLink branch is effectively dead; the test file never constructs a legacy-link element (untested). Latent because the file was never shipped, so no real legacy scene exists.

### 4.5 .lesson round-trip + room-path normalization (CONFIRMED for realistic states)
`importLessonBlobForRoom` writes `raw/<room>/board.excalidraw` (P+20 fix; `WorkspaceStore.ts:211-216`), the current room's scene is injected verbatim as flat `raw/board.excalidraw` (`lessonBundle.ts:90-98`), and customData/state survive the real JSZip round-trip byte-for-byte (`:118-193`). Round-trip test asserts providerOutput.solverOutput.currents.led===0.0153, bounds, providerId, runtimeApi (`BoardPluginPostitPersistence.test.ts:203-266`). Bounds re-read authoritatively from element geometry (`:259,278-289`). **See §5.2 for the non-finite-number failure that this dimension's happy-path scope did not exercise.**

### 4.6 render path + DOM id uniqueness (**GAP-FOUND, low**) — see §5.1.

### 4.7 no private simulator imports (CONFIRMED)
Full transitive import audit of the P+21 closure (`pluginPostitBoardRender.tsx`, `multiPostitBoardPersistence.ts`, `multiPostitWorkbenchModel.ts`, `postitObject.ts`, `caps/board.ts`, `caps/instance.ts`) shows only react + local plugin-postit modules. grep for `CircuitSolver|AVRBridge|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|simulationProviders|sim/solver|components/simulator` → zero import matches. Test-enforced ban passes (`BoardPluginPostitPersistence.test.ts:385-397,537-540`).

### 4.8 no second ELABTutor simulator (CONFIRMED)
`elab-consumer` is built with the GENERIC `createPluginPostitObject`, `pluginState={activeFunction:'simulatore', simulationInstanceId:'sim-a', runtimeApi:'simulation-runtime/1'}` (`multiPostitWorkbenchModel.ts:56-67`). `ElabTutorPostitState` has NO sceneId/providerOutput/solver — structurally a pointer. Render emits only `data-elabtutor-*` and 'consumer of sim-a' (`pluginPostitBoardRender.tsx:204-212`). Test asserts `elabTutor.providerOutput` undefined (`:468-472`). The real simulator engine mounts only in ElabLab as the single entry (`ElabLab.tsx:2,249`), never for elab-consumer.

### 4.9 instanceId identity preservation (CONFIRMED)
`state.instanceId` is the single authoritative carrier; element.id, link, owner, providerOutput.instanceId are all DERIVED at creation and CROSS-CHECKED (throw-on-mismatch) at restore (`multiPostitBoardPersistence.ts:167-207,239-260`). Object spreads/structuredClone preserve the string; `.lesson` is verbatim JSON text; restore reconstructs instanceId solely from `marker.state` (never re-parsed from id/link). elab-consumer's own identity ('elab-consumer') is kept distinct from its pointer (simulationInstanceId='sim-a').

### 4.10 unit vs real render (CONFIRMED, RESIDUAL) — see §6.

### 4.11 handoff reconciliation (CONFIRMED) — see §3.

### 4.12 coverage completeness (CONFIRMED, with count correction)
Every enumerated "Required tests" and "Suggested RED assertion shape" item (runbook 7400-7411, 7518-7528) is covered by a passing test (full-fields `:145-180`, link coherence `:160`, normalize no-rewrite `:182-188`, restore 3 owners `:190-194`, render 3 postits `:478-523`, .lesson raw-path `:355-375` + `Room.integration.test.tsx:1283-1313`, uniqueness `:264-265,351-352,474-475,525-526`). Two non-blocking holes: (a) `type:"embeddable"` never asserted at runtime (tsc-only); (b) no Playwright acceptance for a production-helper `.lesson` imported via the Room file picker. One audit's shared-run of the exact focused command yielded **2 failed / 56 passed (58 total)** — both failures pre-existing flaky Room.integration mount/loading tests (`:176,:193`), NOT P+21 (the P+21 Room test `:1283` passed); no `it.skip/only` present, so 58 is the true denominator.

---

## 5. Adversarial refutation results (7 attempts, 2 succeeded)

| # | Claim | Refuted? | Confidence |
|---|---|---|---|
| 1 | Full Excalidraw elements render in real Excalidraw | no | high |
| 2 | normalize does NOT rewrite production scenes | no | high |
| 3 | restore returns exactly 3 owners in order | no | high |
| 4 | **.lesson round-trip preserves ALL state, no loss** | **YES** | medium |
| 5 | render 3 postits, unique ids, no private imports | no | high |
| 6 | legacy-link branch is effectively dead (finding) | no (confirms finding) | high |
| 7 | **render path emits UNIQUE DOM ids** | **YES** | high |

### 5.1 Refutation #7 SUCCEEDED — duplicate DOM ids (executed, high confidence)
Executed jsdom probe (since deleted; tree clean): (1) production sim-a element `id=plugin-postit-sim-a-board`, `state.instanceId=sim-a`; (2) simulate Excalidraw copy/paste → new element id, cloned link+customData; (3) `normalizeDuplicatedToolEmbeds([orig,dup])` as `Room.handleChange` does (`Room.tsx:332`) → `changed=true`, dup **link** rewritten but dup `state.instanceId` STAYS `sim-a`; (4) render both via `renderPluginPostitBoardEmbeddable` → **14 DOM ids, only 7 unique**; `id=plugin-postit-sim-a` appears twice + 6 duplicated control ids; (5) `restorePluginPostitsFromBoardScene` on the same scene **THREW** 'plugin post-it board link mismatch for sim-a'. **Render accepts, hydration rejects — the two consumers disagree.** Root cause: `createRenderModelFromElement` (`pluginPostitBoardRender.tsx:42-53`) guards only on owner (recomputed from the cloned instanceId, always passes) and never calls `assertUniquePostitInstances`. *Reachability caveat:* no live UI flow inserts `createPluginPostitBoardScene` output into an editable Room canvas today (only the standalone non-Excalidraw `MultiPostitWorkbench` view + tests), so current blast radius requires a `board.excalidraw` scene loaded as a Room scene (e.g. via `.lesson` import). Untested: no test duplicates then renders (`:182-188` only checks the non-duplicated original).

### 5.2 Refutation #4 SUCCEEDED — non-finite round-trip hard-fail (executed, medium confidence)
Type-valid input `currents = { led: Infinity }` (or NaN): `structuredClone` in `serializePluginPostitObject` (`postitObject.ts:318-320`) PRESERVES Infinity/NaN → stored in `customData.maestroTool.state` → `JSON.stringify` in export/save (`WorkspaceStore.ts:98-99`, `lessonBundle.ts:91-97`) converts to `null` → import `JSON.parse` yields `led=null` → `isNumberRecord({led:null})` returns false → `assertSimulationPostit` **THROWS** 'invalid Simulation state for sim-a' (`multiPostitWorkbenchModel.ts:202,235-241`). Node repro confirmed: `Infinity→null`, `NaN→null`, `isNumberRecord true→false`. The serialize path has **no non-finite guard**. *Honest caveat:* `createMultiPostitWorkbenchPostits` via `scopePluginPostitProviderOutput` only ever emits finite values, so for every state the app CURRENTLY produces the round-trip is lossless (matches the passing test `:203-266`). The refutation exploits the gap between the TS `number` type and JSON's inability to represent non-finite values, plus restore validators that reject the degraded value.

### 5.3 Refutations that FAILED (claims survived)
- **#1** could not refute "renders in real Excalidraw": field-identical to the e2e-proven `createToolEmbedElement` (`ToolCanvasEmbeddable.tsx:444-478`); `updated:0` retained (restore uses `?? Date.now()`, null/undefined only); 0.18.1 dist validator returns `t.test(link)` for a RegExp so `maestro-tool://` links validate; `renderToolCanvasEmbeddable` dispatches FIRST to the board renderer on `customData.maestroTool.schema==='plugin-postit-board-state/1'`. **Honest caveat carried:** no test drives the output through an actual `<Excalidraw>` mount — the "real Excalidraw will render" leg is static inspection + field parity, not an e2e assertion.
- **#2, #3, #5** could not refute (production-scoped): normalize no-op, restore returns `[io.ardesia.simulation:sim-a, sim-b, io.elab.tutor:elab-consumer]` in order via flatMap/map (no sort/async), 3 postits with unique ids and zero private imports — all executed/empirical, all green.
- **#6** could not refute — it CONFIRMS the §4.4 legacy-branch finding.

---

## 6. Residual real-browser risk (the honest, unavoidable coverage gap)

The entire real-`@excalidraw/excalidraw` render path for P+21 is **unexercised**. All three cited test files either fully mock Excalidraw (`Room.integration.test.tsx:20`) or render the card into a bare React div. There is **no e2e/Playwright spec** for the board (`grep` of e2e/ empty; existing sim e2e only covers `createToolEmbedElement`). Four behaviors only a real browser can confirm are unproven **for the board element specifically**:

1. Excalidraw 0.18.1 `updateScene({elements})` at `Room.tsx:561` accepting `index:null` via the direct lesson-import path (no `restore()`).
2. `validateEmbeddable` actually admitting the `maestro-tool://` board links and invoking `renderEmbeddable` (the `link:null` unit assertion at `:543` is a path real Excalidraw rejects at `validateEmbeddable`).
3. Excalidraw's `restore()`/reconciliation not mutating/dropping `customData`/`link`/`index` (initialData path `:899`).
4. The embeddable container's pointer-event/selection gating around the returned card.

Mitigation is strong but **inferential**: the board element is field-identical to the e2e-proven `createToolEmbedElement`. This risk is what forces the verdict away from `complete-verified` even absent the two gaps. `appState` emitted by `createPluginPostitBoardScene` is `{}` (`:110`); a raw board scene is only loadable because Room merges `newRoomAppState` defaults (`Room.tsx:554,903`) — that merge is not exercised against real Excalidraw either.

---

## 7. Verdict rationale

Per the evidence rule: **two adversarial refutations returned `refuted:true`** (§5.1 render/hydrate DOM-id divergence, high confidence, executed; §5.2 non-finite `.lesson` hard-fail, medium confidence, executed) and **two dimension audits returned `gap-found`** (§4.4, §4.6). Even though every gap is **low-severity and latent** (the production helper never generates the triggering inputs, so the shipped happy path is correct and 9/9 green), the rule states "if any adversarial refutation succeeded ... it is `p21-gap-found`." I therefore return **`p21-gap-found`**, and separately note that the Playwright-class real-browser risk (§6) is independently unclosed. `complete-verified` is not defensible; `complete-with-residual-risks` would ignore the two succeeded refutations.

---

## 8. Unknowns & things NOT verified

- `tsc -b --noEmit` was NOT independently re-run in the unit-vs-real audit (build exceeded local 2-min limit); typecheck rests on established evidence. vitest esbuild strips types (known false-green risk).
- Whether the 2 flaky Room.integration failures are non-deterministic vs a real environment regression was not isolated (they pass in isolation; the P+21 Room test passed).
- Authorship of the P+21 edits is unknowable from git; the runbook's 19:20 Playwright-evidence claims were not independently reproduced.
- `restorePluginPostitFromBoardElement` is not exported; probing was via `restorePluginPostitsFromBoardScene` — the inner function's null-return skip paths were verified by reading, not direct call.
- Whether a user can actually place-and-duplicate a plugin-postit board embeddable in a live Room is undemonstrated (the §5.1 blast radius is conditional on that reachability).
---

## Live-browser observation (added post-synthesis, 2026-07-08 ~20:20 — partial closure of residual-risk #1)

**Setup:** dev server started on `http://localhost:5190` (ARDESIA studio, real `<Excalidraw>` 0.18.1 mount). Firsthand, via the preview harness — not inferred.

**Observed:** clicking the studio's "sim" button (`aria-label="Inserisci Simulation Plugin sulla lavagna"`) inserted a `maestro-tool://io.ardesia.simulation` embeddable that **rendered live inside the real Excalidraw board**: the Simulation Plugin card ("Accendi il tuo primo LED", publisher `io.ardesia.simulation`), a full breadboard (470 Ω + LED + 9 V), a manual reference panel (Vol.1 pag.29-31), a step-by-step panel, and **"DIAGNOSTICA LIVE: batteria 9.00 V — LED ON, corrente 15.3 mA — R=470 Ω"**. The element is selectable (Excalidraw selection handles + style panel appeared). **Console errors: zero.**

**What this closes (real-browser, observed):**
- `validateEmbeddable={/^maestro-tool:\/\//}` (Room.tsx:908) DOES admit `maestro-tool://` links in the live editor → confirmed (the embeddable rendered, not the default iframe).
- `renderEmbeddable` overlay IS invoked and paints the app card → confirmed.
- The embeddable participates in real Excalidraw selection/pointer gating → confirmed.
- The solver value `0.0153 A` (15.3 mA) that the P+21 unit test asserts is real and rendered live.

**What this does NOT close (still P+22, stated honestly):** this exercises the **e2e-proven `createToolEmbedElement`** insert path, NOT the P+21 helper `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())` output arriving via **`.lesson` file-picker import → `updateScene`** (Room.tsx:561, no `restore()`). The four inferred behaviors specific to the P+21 helper's full-shape element (`index:null` tolerance through `updateScene`; `restore()` preserving `customData`/`link`/`index`; the `-board` element-id + state marker surviving import) remain unverified by observation. The residual risk is **reduced from "the whole render mechanism is inferred" to "the P+21-helper-specific element through the import path is inferred"** — a materially smaller, well-scoped gap for the P+22 Playwright test.
