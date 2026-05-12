# ELAB Tutor — Component Dependency Map
## Iter 29 Agent D — 2026-05-11

This document provides a dependency map for each major component in
`src/components/`. For each component the map documents: props interface,
internal state ownership, children rendered, hooks consumed, and external
API surface used.

All file paths are absolute from the project root
`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`.

---

## ASCII Component Hierarchy Tree

```
App.jsx (hash-router state)
├── HomePage.jsx                   (#home)
├── LavagnaShell.jsx               (#lavagna) *** MAIN TEACHING WORKSPACE ***
│   ├── AppHeader.jsx
│   ├── ModalitaSwitch.jsx
│   ├── NewElabSimulator.jsx       (lazy)
│   │   ├── SimulatorCanvas.jsx
│   │   │   ├── WireRenderer.jsx
│   │   │   ├── DrawingOverlay.jsx
│   │   │   ├── PinOverlay.jsx
│   │   │   └── [21 component SVGs]
│   │   │       ├── NanoR4Board.jsx
│   │   │       ├── BreadboardFull.jsx / BreadboardHalf.jsx
│   │   │       ├── Led.jsx / RgbLed.jsx
│   │   │       ├── Resistor.jsx
│   │   │       ├── PushButton.jsx
│   │   │       ├── Battery9V.jsx
│   │   │       ├── Potentiometer.jsx
│   │   │       ├── BuzzerPiezo.jsx
│   │   │       ├── LCD16x2.jsx
│   │   │       ├── MosfetN.jsx
│   │   │       ├── MotorDC.jsx
│   │   │       ├── Servo.jsx
│   │   │       ├── PhotoResistor.jsx / Phototransistor.jsx
│   │   │       ├── Capacitor.jsx / Diode.jsx
│   │   │       ├── Multimeter.jsx
│   │   │       ├── ReedSwitch.jsx
│   │   │       └── Annotation.jsx
│   │   └── IncrementalBuildHint.jsx
│   ├── FloatingToolbar.jsx
│   ├── RetractablePanel.jsx       (quick-add components)
│   ├── GalileoAdapter.jsx         (UNLIM chat panel)
│   │   └── FloatingWindow.jsx     (draggable/resizable wrapper)
│   ├── LessonBar.jsx
│   ├── LessonSelector.jsx
│   ├── LessonReader.jsx           (Passo Passo mode)
│   ├── PercorsoPanel.jsx
│   │   └── PercorsoCapitoloView.jsx
│   ├── MascotPresence.jsx
│   ├── DocenteSidebar.jsx
│   ├── ExperimentPicker.jsx
│   ├── CapitoloPicker.jsx
│   ├── VolumeViewer.jsx
│   ├── VideoFloat.jsx
│   ├── SessionReportComic.jsx
│   ├── UnlimBar.jsx
│   ├── UnlimNudgeOverlay.jsx
│   ├── VetrinaV2.jsx
│   ├── ErrorToast.jsx
│   ├── MicPermissionNudge.jsx     (lazy, iter 38)
│   └── UpdatePrompt.jsx           (lazy, iter 38 PWA)
├── ChatbotOnly.jsx                (#chatbot-only, iter 37)
│   └── EasterModal.jsx
├── ElabTutorV4 (legacy)           (#prova)
├── DashboardShell.jsx             (#dashboard)
│   └── TeacherDashboard.jsx       (lazy)
├── AdminPage.jsx                  (#admin, password-gated)
│   └── [admin tabs + gestionale]
├── LoginPage / RegisterPage       (#login / #register)
├── LandingPNRR.jsx                (#landing)
└── Common
    ├── ConfirmModal.jsx
    ├── ConsentBanner.jsx
    ├── ElabIcons.jsx              (24 SVG icons, no emoji)
    ├── ElabMascotte.jsx
    ├── ErrorBoundary.jsx
    ├── FloatingWindow.jsx         (common, iter 36 A5)
    ├── Toast.jsx
    ├── VolumeCitation.jsx
    └── PrivacyPolicy.jsx
```

---

## LavagnaShell

**File**: `src/components/lavagna/LavagnaShell.jsx`  
**Lines**: ~600 (estimated from imports + module css)  
**Purpose**: Root shell for the teaching workspace. Strangler-fig wrapper
that assembles all lavagna sub-components without modifying the underlying
simulator.

### Props Interface
```typescript
// No external props — LavagnaShell is a top-level route component.
// Internal data sourced from:
//   useAuth() context
//   localStorage (modalita, elab_anon_uuid, class_key)
//   Supabase (via service hooks)
```

### Internal State Ownership
```javascript
const [modalita, setModalita]       // 'percorso' | 'passo-passo' | 'gia-montato' | 'libero'
const [isPlaying, setIsPlaying]     // simulator run state
const [activeLesson, setActiveLesson]
const [showLessonSelector, ...]
const [unlimVisible, setUnlimVisible]
const [overlayQueue, ...]           // useOverlayQueue hook
const [micNudgeShown, ...]
const [updateAvailable, ...]
```

### Children Components
AppHeader, ModalitaSwitch, NewElabSimulator (lazy), FloatingToolbar,
RetractablePanel, GalileoAdapter, LessonBar, LessonSelector, LessonReader,
PercorsoPanel, MascotPresence, DocenteSidebar, ExperimentPicker,
CapitoloPicker, VolumeViewer, VideoFloat, SessionReportComic, UnlimBar,
UnlimNudgeOverlay, ErrorToast, MicPermissionNudge (lazy), UpdatePrompt (lazy).

### Hooks Consumed
```javascript
useAuth()                       // src/context/AuthContext.js
useSessionTracker()             // src/hooks/useSessionTracker.js (iter 44 wire-up)
useOverlayQueue(...)            // src/hooks/useOverlayQueue.js
useGalileoChat(...)             // src/components/lavagna/useGalileoChat.js
isWakeWordSupported()           // src/services/wakeWord.js
startWakeWordListener(...)
stopWakeWordListener()
getCapitolo(...)                // src/services/percorsoService.js
listAllCapitoli()
buildClassProfile(...)          // src/services/classProfile.js
getNextLessonSuggestion(...)
startApplicationNarrativeLoop() // src/services/unlimContextCollector.js
stopApplicationNarrativeLoop()
```

### External API Surface
- Reads `window.__ELAB_API` events: `experimentChange`, `stateChange`, `serialOutput`
- Calls `window.__ELAB_API.mountExperiment(id)` on lesson load
- Calls `openReportWindow()` from `src/components/unlim/UnlimReport.jsx`
- Uses `showToast` from `src/components/common/Toast.jsx`

---

## GalileoAdapter

**File**: `src/components/lavagna/GalileoAdapter.jsx`  
**Purpose**: UNLIM chat panel UI adapter. Renders the chat interface inside a
`FloatingWindow`. The "Galileo" name is legacy — this is the UNLIM chat widget.

### Props Interface
```typescript
{
  isVisible: boolean;
  onClose: () => void;
  experimentId: string | null;
  circuitState: object | null;
  simulatorContext: object | null;
}
```

### Internal State Ownership
None — delegates all chat state to `useGalileoChat` hook.

### Hooks Consumed
```javascript
useGalileoChat({
  experimentId,
  circuitState,
  simulatorContext,
  onAction: (action) => void,   // dispatches [AZIONE:...] to __ELAB_API
})
```

### Children
`FloatingWindow` (draggable, resizable, localStorage-persisted position).

---

## useGalileoChat (Hook)

**File**: `src/components/lavagna/useGalileoChat.js`  
**Lines**: ~400 (estimated)  
**Purpose**: Central state manager for UNLIM chat interactions in the Lavagna.

### State Owned
```javascript
messages[]          // {id, role, content, timestamp}
input               // current text input
isLoading           // API call in flight
error               // last error
quickActions[]      // empty (removed, docente uses Percorso)
```

### API Calls
- `sendChat(message, context)` from `src/services/api.js`
- `analyzeImage(base64)` from `src/services/api.js`
- `collectFullContext()` from `src/services/unlimContextCollector.js`

### Post-Response Processing
1. Parses `intents_parsed[]` from API response
2. Calls `executeServerIntents(intents, api)` from `intentsDispatcher.js`
3. Dispatches `[AZIONE:...]` tags to `__ELAB_API`

---

## intentsDispatcher

**File**: `src/components/lavagna/intentsDispatcher.js`  
**Lines**: 151  
**Purpose**: Browser-side dispatch of `intents_parsed` from Edge Function response.
Extracted module for testability. Added iter 37 B-NEW.

### Whitelist (12 allowed actions)
```javascript
ALLOWED_INTENT_ACTIONS = [
  'play', 'pause', 'reset', 'highlight', 'loadexp',
  'addcomponent', 'removecomponent', 'addwire',
  'compile', 'undo', 'redo', 'clearall',
  'interact', 'setvalue', 'screenshot', 'describe', 'video'
]
// BLOCKED: deleteAll, submitForm, fetchExternalUrl (destructive)
```

### API Resolution Priority
1. `api.unlim[action]` (UNLIM-specific methods)
2. `api[action]` (general __ELAB_API methods)
3. `api === null` → logs `api_unavailable`, continues to next intent

### Error Isolation
Per-intent try/catch: if one intent throws, processing continues for the
next intent in the array. Test T5 verifies this.

---

## NewElabSimulator

**File**: `src/components/simulator/NewElabSimulator.jsx`  
**Lines**: 1022  
**Purpose**: Shell component that orchestrates simulator panels, experiment
loading, code compilation, and exposes `__ELAB_API`.

### Props Interface
```typescript
{
  experimentId?: string;       // initial experiment to load
  onStateChange?: (state) => void;
  onSerialOutput?: (output) => void;
  readonly?: boolean;
}
```

### Internal State Ownership
```javascript
circuitState     // components + connections + errors
runState         // 'stopped' | 'running' | 'paused'
compiledHex      // compiled Arduino sketch hex
serialLog[]      // serial monitor output lines
buildMode        // 'guided' | 'free'
activeTab        // 'circuit' | 'code' | 'serial'
```

### Engine Orchestration
```javascript
CircuitSolver.js    // DC MNA/KCL solver (2486 lines)
AVRBridge.js        // avr8js ATmega328p emulation (1242 lines)
PlacementEngine.js  // auto-placement (822 lines)
```

### External API Registration
Calls `registerSimulatorInstance(this)` on mount, which creates
`window.__ELAB_API` via `simulator-api.js`.

---

## SimulatorCanvas

**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`  
**Lines**: 3149  
**Purpose**: SVG canvas rendering all 21 circuit component types. Handles
zoom/pan/drag/snap interactions.

### Key Constants
```javascript
BB_HOLE_PITCH = 7.5    // px distance between breadboard holes
SNAP_THRESHOLD = 4.5   // px snap-to-hole radius
NanoR4Board SCALE = 1.8  // SVG scale multiplier
```

### Children (21 Component Types)
NanoR4Board, BreadboardFull, BreadboardHalf, Led, RgbLed, Resistor,
PushButton, Battery9V, Potentiometer, BuzzerPiezo, LCD16x2, MosfetN,
MotorDC, Servo, PhotoResistor, Phototransistor, Capacitor, Diode,
Multimeter, ReedSwitch, Annotation.

Plus overlay layers: WireRenderer, DrawingOverlay, PinOverlay.

### State
All component positions, wire routing, selection state, zoom/pan transform.

---

## HomePage

**File**: `src/components/HomePage.jsx`  
**Lines**: ~591 (iter 36 A13 partial rewrite)  
**Purpose**: Marketing/landing page for the app. Also serves as the entry
point after auth.

### Key Sections
- Hero with speech bubble ("Ragazzi, costruiamo elettronica insieme!")
- 3 feature cards (kit fisici + volumi + software morfico)
- Team credits: Andrea + Tea + Davide + Omaric + Giovanni
- CTA to `#lavagna`

### Internal State
```javascript
// Hash routing handled by parent App.jsx
// HomePage itself is stateless, receives navigate callback
```

---

## AppHeader

**File**: `src/components/lavagna/AppHeader.jsx`  
**Purpose**: Top navigation bar for the Lavagna. Shows experiment name,
Play/Pause button (connected to simulator), UNLIM toggle, glassmorphism style.

### Props Interface
```typescript
{
  isPlaying: boolean;
  onPlayPause: () => void;
  onUnlimToggle: () => void;
  experimentName: string;
  onNavigate: (route: string) => void;
}
```

---

## FloatingToolbar

**File**: `src/components/lavagna/FloatingToolbar.jsx`  
**Purpose**: 7-icon draggable toolbar. Undo/Redo/Delete execute via
`__ELAB_API`; Select/Wire/Pen update local tool state only (not fully
wired to simulator tool mode as of iter 29).

### Props Interface
```typescript
{
  activeTool: string;
  onToolChange: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
}
```

---

## PercorsoPanel + PercorsoCapitoloView

**File**: `src/components/lavagna/PercorsoPanel.jsx`  
**File**: `src/components/lavagna/PercorsoCapitoloView.jsx`  
**Purpose**: Lesson-path navigation. Shows current chapter/experiment,
progress within the volume structure, and navigation controls.

### Data Sources
- `src/data/lesson-groups.js` (27 lesson groups)
- `src/data/lesson-paths/*.json` (87/92 lesson-paths present as of iter 36 D3 audit)
- `src/services/percorsoService.js` (`getCapitolo`, `listAllCapitoli`)

---

## RetractablePanel

**File**: `src/components/lavagna/RetractablePanel.jsx`  
**Purpose**: Left-side retractable panel with 8 quick-add component buttons.
Components added via `window.__ELAB_API` (`__ELAB_API.addcomponent(type, x, y)`
— currently via `addcomponent` action tag, NOT real drag-and-drop).

---

## SessionReportComic

**File**: `src/components/lavagna/SessionReportComic.jsx`  
**Purpose**: Generates a comic-style session report ("fumetto") summarizing
the lesson activity. Reads from Supabase session history. Opened via
`openReportWindow()`.

---

## DashboardShell

**File**: `src/components/dashboard/DashboardShell.jsx`  
**Purpose**: Teacher progress dashboard shell. Loads class data from
Supabase via `class_key` in localStorage (no Supabase Auth required for
the teacher view — "virtual class" pattern from iter S1).

### Data Source
`supabase-credentials.md`: project `vxvqalmxqtezvgiboxyv` (8 core tables,
51+ real sessions as of S1).

---

## ElabIcons

**File**: `src/components/common/ElabIcons.jsx`  
**Purpose**: 24 SVG icon components. These are the ONLY allowed icons in the
ELAB UI — no emoji in component code, no Material Design icons.

Available icons (partial):
CameraIcon, WrenchIcon, ReportIcon, CircuitIcon, RefreshIcon, SendIcon,
RobotIcon, HandWaveIcon, PartyIcon, FlaskIcon, PlayIcon, PauseIcon,
DeleteIcon, UndoIcon, RedoIcon, SelectIcon, WireIcon, PenIcon, ...

---

## ChatbotOnly

**File**: `src/components/chatbot/ChatbotOnly.jsx` (note: also an older
`src/components/lavagna/ChatbotOnly.jsx` created iter 37)  
**Purpose**: Standalone UNLIM chat interface for `#chatbot-only` route.
3-column layout: Cronologia sidebar (220px) + chat (1fr) + tools palette (64px).

### Layout
```
[Cronologia 220px] [Chat 1fr] [Tools 64px]
responsive: <768px = stacked mobile
≥1280px = LIM-mode (font 16px)
```

### Cronologia Buckets
Oggi / Ieri / Settimana / Più vecchie — sourced from `unlim-session-description`
Edge Function for UNLIM-generated session names.

---

## MicPermissionNudge

**File**: `src/components/common/MicPermissionNudge.jsx`  
**Lines**: 317  
**Purpose**: Pre-emptive microphone permission request. Shown before entering
Lavagna so "Ehi UNLIM" wake word is warm on first use (browser caches
getUserMedia grant for origin).

**Behavior**: Uses Permissions API query first. If denied: shows explanation
panel. If granted: silent. If unknown: shows nudge prompt.

---

## UpdatePrompt

**File**: `src/components/common/UpdatePrompt.jsx`  
**Lines**: 322  
**Purpose**: PWA service-worker update notification toast. Triggered by
`controllerchange` event when vite-plugin-pwa detects a new SW available
(registerType: 'prompt' — no auto-update).

**Text**: "Ragazzi, c'è una nuova versione. Ricaricate la pagina!" with 5s countdown.

---

## Services Summary

| Service | File | Purpose |
|---------|------|---------|
| `api.js` | `src/services/api.js` (1040 lines) | All API calls: sendChat, analyzeImage, compileCode, retry/fallback chain |
| `simulator-api.js` | `src/services/simulator-api.js` (755 lines) | Global `__ELAB_API`, pub/sub events, UNLIM bridge |
| `unlimContextCollector.js` | `src/services/unlimContextCollector.js` (250 lines) | collectFullContext(): circuit + code + compilation + step + errors + pin states |
| `wakeWord.js` | `src/services/wakeWord.js` | SpeechRecognition wake word, "Ehi UNLIM", isWakeWordSupported() |
| `voiceService.js` | `src/services/voiceService.js` | TTS playback, voice toggle state |
| `nudgeService.js` | `src/services/nudgeService.js` | Teacher-to-student nudges, BroadcastChannel |
| `percorsoService.js` | `src/services/percorsoService.js` | getCapitolo(), listAllCapitoli(), lesson path resolution |
| `classProfile.js` | `src/services/classProfile.js` | buildClassProfile(), getNextLessonSuggestion() |
| `projectHistoryService.js` | `src/services/projectHistoryService.js` | localStorage-bounded session history |
| `unlimSharedStateStore.js` | `src/services/unlimSharedStateStore.js` | recordUnlimEvent(), cross-component UNLIM state |
| `unlimLatencyLog.js` | `src/services/unlimLatencyLog.js` | logLatency() for performance telemetry |
| `lessonPrepService.js` | `src/services/lessonPrepService.js` | isLessonPrepCommand(), prepareLesson() Socratic mode |

---

## Data Ownership Map

| Data | Owner | Persistence |
|------|-------|-------------|
| Circuit state | SimulatorCanvas (in-memory) | Not persisted (future: Supabase scribble_paths for drawings) |
| UNLIM messages | useGalileoChat (in-memory) | Session only |
| Session memory | Supabase unlim_session_memory | 7-day TTL |
| Message history | Supabase unlim_message_history | 7-day TTL |
| Anonymous user ID | localStorage `elab_anon_uuid` | Persistent (crypto.randomUUID) |
| Lavagna mode | localStorage `lavagna_modalita` | Persistent |
| Session tracker | Supabase student_sessions | Persistent |
| Class code | localStorage `class_key` | Persistent |
| Drawing paths | Supabase scribble_paths | Per-session |
| RAG chunks | Supabase rag_chunks (pgvector) | Persistent |

---

*Generated by Agent D iter 29, 2026-05-11. Sources: READ-ONLY scan of
`src/components/`, `src/services/`, `src/hooks/` directories.*
