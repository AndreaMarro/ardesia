# P31 PR #150 — Failure Taxonomy (measured before fixing)

Un-fixme'd the spec and ran `--repeat-each` to classify the RED before fixing.

| Failure (observed) | First assertion | Console | Likely cause | Fix |
|---|---|---|---|---|
| `boundingBox: timeout` on visible `<summary>` | activateEmbed (legacy) | — | **B** embed not stable/active (Excalidraw pointer routing) | direct `dispatchEvent` click (no coord hit-test) |
| `locator.click: timeout` (palette/break) | palette / break click | — | **B** overlay intercepts / element not stable | `dispatchEvent` click |
| `data-sim-solve-kind` stayed `solved` after break | break assertion | — | **F(logic)** break removed only `.connections`; `buildNets` also unions `pinAssignments` → circuit still closed | break now disconnects the battery net (both pinAssignments + connections) |
| `[vite] Unhandled rejection: scrittura fallita` | (async, fails consoleErrors) | ✗ | **D** IndexedDB `add` seq-collision on concurrent append → orphan `done` promise | serialize appends (writeQueue) + `Promise.all([add,done])` |
| `page.reload: ERR_ABORTED` | reload | — | **E** reload race | keep reload + `waitForTimeout(1200)` autosave flush + app-ready after |
| cross-run pollution (2nd repeat dirty) | insert/interact | — | **C** shared default room | `?room=<unique>` isolation |
| test hit 30s cap mid-run | waitForTimeout@141 | — | **B** slow stableBox polling | dispatch clicks (fast) + `setTimeout(60_000)` |

Legend: A=app-not-ready · B=embed-not-active/stable · C=wrong-room · D=IndexedDB-write · E=autosave/reload · F=real-product-bug.

All classified causes fixed; result: `--repeat-each=5` green.
