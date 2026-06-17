# Bug List — Antigravity QA Session 5-6 + Session 113 Updates

## P1 — Critical (Fix Immediately)

### BUG-1: "Codice Generato" CM6 Panel Missing in Scratch Mode
- **Where**: `NewElabSimulator.jsx` — Scratch editor section
- **Expected**: Side-by-side layout: Blockly (60%) + CodeMirror6 "Codice Generato" (40%)
- **Actual**: Blockly takes 100% width, no CodeMirror panel visible
- **Impact**: Users can't see generated C++ code in real-time
- **Fix**: Verify `editorMode === 'scratch'` flex layout renders both panels

### BUG-2: "Compila & Carica" Non-Functional in Scratch Mode
- **Where**: `ScratchEditor.jsx` / compile pipeline
- **Expected**: Compile button generates C++ from Blockly workspace and compiles
- **Actual**: compile() API returns undefined, no compilation output
- **Impact**: Scratch mode is useless without compilation
- **Fix**: Trace compile() flow from ScratchEditor → scratchGenerator.js → compile endpoint

### BUG-3: v3-cap6-blink Default C++ Code Broken
- **Where**: `experiments-vol3.js` line with v3-cap6-blink experiment
- **Expected**: Valid Arduino C++ with proper brackets
- **Actual**: Malformed brackets in default code
- **Impact**: Experiment loads with broken code, can't compile
- **Fix**: Verify and correct the `defaultCode` field syntax

## P2 — Important (Fix Soon)

### BUG-4: `setSelectedComponent is not defined` ReferenceError
- **Where**: Multiple locations (x4 occurrences)
- **Expected**: No console errors
- **Actual**: ReferenceError logged 4 times
- **Fix**: Check if `setSelectedComponent` is properly imported/defined

### BUG-5: compile() API Returns Undefined
- **Where**: `window.__ELAB_API.compile()`
- **Expected**: Returns compilation result object
- **Actual**: Returns undefined
- **Fix**: Trace the compile function in API surface

### BUG-6: clearAll() Doesn't Fully Clear Components
- **Where**: `window.__ELAB_API.clearAll()`
- **Expected**: Removes all components from breadboard
- **Actual**: Some state may persist
- **Fix**: Verify clearAll resets both visual and solver state

### BUG-7: patch-blockly.js Case C (Local Only)
- **Where**: `scripts/patch-blockly.js`
- **Expected**: Proper patching of Blockly internals
- **Actual**: Ambiguous Case C detection in patching script
- **Fix**: Review patching logic for edge cases

### BUG-9: Drag & Drop Non-Functional on Some Components in "Libero" Mode
- **Where**: `NewElabSimulator.jsx` drag handlers / `parentChild.js` / `breadboardSnap.js`
- **Expected**: ALL components draggable from palette to breadboard in Libero mode
- **Actual**: Some components can't be dragged or don't snap properly
- **Impact**: Libero mode is broken for some component types
- **Fix**: Test EVERY component type, verify COMP_SIZES entries, check pointer event handlers
- **Status**: NEEDS INVESTIGATION — test with Chrome in production

### BUG-10: Missing Blockly Built-in Variable Generators (FIXED S113)
- **Where**: `scratchGenerator.js`
- **Expected**: `variables_set`/`variables_get` produce valid C++ (`int x = 0;` / `x`)
- **Actual**: No generators → malformed code (`if (x = 3)` instead of `if (x == 3)`)
- **Impact**: Any variable from Blockly's toolbox produces broken C++
- **Fix**: Added 11 new generators (variables, math, flow control, procedures)
- **Status**: FIXED — build passes, needs Chrome verification

## P3 — Minor

### BUG-8: "Esci da schermo intero" Navigates to #teacher
- **Where**: Fullscreen exit handler
- **Expected**: Returns to previous view
- **Actual**: Navigates to #teacher route
- **Fix**: Check fullscreen exit handler routing logic
