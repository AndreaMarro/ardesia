# P31 PR #150 — Next

State: **trace v0 green affidabile** (repeat-each=5) + full suite + regression green. `test.fixme` removed. PR #150 body updated.

## Immediate (Andrea)
- Let CI run the un-fixme'd spec on a fresh runner; if green, **un-Draft** PR #150 and merge → clean base for the real palette/wiring/inspector work.

## Follow-ups (small, in order)
1. **Real-pointer reachability of the free-mode strip** (adversarial-review gap): add ONE raw-mouse activation + reachability assertion (e.g. `elementFromPoint` on `[data-sim-break]`) so a regression that makes the strip unreachable by a real pointer fails a test — without reintroducing the flaky click path.
2. Optional: propose `fake-indexeddb` as devDep for higher-fidelity event-log concurrency tests (the in-file fake is sufficient for now).

## Then (real free-manipulation, separate runs)
- Wide palette (battery9v/wire first-class), free wire connect/retarget driven via the Excalidraw drag callbacks (`onConnectionAdd`/`onWireUpdate`), short-circuit / LED-reversed / missing-resistor error cases.

## Do NOT (until above)
New plugins, GoodNotes lavagna, graph/HTML, deploy, any Tinkercad-parity claim.
