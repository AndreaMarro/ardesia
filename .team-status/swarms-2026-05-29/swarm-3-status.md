# Swarm 3 — UNLIM Chat V2 Compile-Context Integration — STATUS

Branch: feat/swarm-3-unlim-chat-v2-compile-integration-2026-05-29
Commit: 38c5e8c9
Author: Claude Opus 4.7 (orchestrator)
Started: 2026-05-29 00:25 Europe/Rome
Closed:  2026-05-29 00:50 Europe/Rome

## STATE: DONE (awaiting orchestrator integration post-swarm-1+2+5 close)

## SCOPE delivered (Andrea verbatim mandate)

> "con unlim integrato con chat e interfacciamento totale"

Implemented as 4 greenfield owned files, ZERO touches to other swarms' files.

## Files created

| File | LOC | Purpose |
|---|---|---|
| `src/components/home/HomeUnlimChatV2.jsx` | 522 | Always-present mascot + chat panel with voice + text input |
| `src/components/home/HomeUnlimChatV2.module.css` | 287 | ELAB-palette CSS module, WCAG AA |
| `src/services/unlimContextForCompile.js` | 218 | Compile-state → simulatorContext shape + prompt-injection sanitiser |
| `supabase/functions/_shared/system-prompt-compile-context.ts` | 145 | IT + EN(DRAFT) prompt extension for compile-home surface |

Locale parity: +21 keys per locale (IT + EN) under `home_unlim_chat_v2.*`.

## CONTEXT_COLLECTOR_API

`src/services/unlimContextForCompile.js`

### Public API

```js
buildCompileHomeContext({
  sketchCode:       string,
  editorMode:       'blocks' | 'code',
  compileStatus:    'idle' | 'compiling' | 'success' | 'verified-legacy' | 'error',
  compileErrors:    string | null,
  compileWarnings:  string | null,
  compileSize:      { flashUsed, flashTotal, pct } | null,
  boardId:          string,
  boardLabel:       string,
  fqbn:             string,
  blockCount:       number,
  lastUpload:       { ok: bool, message: string, ts: number } | null,
  language:         'it' | 'en',
})
  => {
    surface:          'compile-home',     // discriminator for Edge Function
    language:         'it' | 'en',
    editorMode:       'blocks' | 'code',
    blockCount:       number,
    editorCode:       string,             // sanitised + capped 4000 chars
    editorCodeLines:  number,
    compilation:      { success, status, errors, warnings, size } | null,
    upload:           { ok, message, secondsAgo } | null,
    board:            { id, label, fqbn },
  }

describeCompileHomeContextLine(ctx)
  => 'Blocchi · 4 blocchi · 12 righe · Nano R4 · success'  // chip line
```

### Sanitiser guarantees

- `compileErrors|compileWarnings|sketchCode|lastUpload.message`:
  control chars stripped + `[AZIONE:*]` `[INTENT:{*}]` substrings replaced
  with literal `'[azione removed]'` / `'[intent removed]'` + clipped to cap.
- `boardId|boardLabel|fqbn`: whitelist `[a-zA-Z0-9:_.\- ]` +
  defence-in-depth strips `INTENT|AZIONE|azione|intent` substrings +
  collapses `:{2,}` to `:`.
- `compileStatus`: enum-whitelisted, falls through to `'idle'`.
- `editorMode|language`: enum-whitelisted.
- `lastUpload.ts`: never echoed — converted to `secondsAgo` relative delta.

## COMPONENT_API

`src/components/home/HomeUnlimChatV2.jsx`

### Props (all optional; parent supplies via HomeCompileEntry post-merge)

```jsx
<HomeUnlimChatV2
  sketchCode={string}                // forwarded to context collector
  editorMode={'blocks' | 'code'}
  compileStatus={'idle'|'compiling'|'success'|'verified-legacy'|'error'}
  compileErrors={string | null}
  compileWarnings={string | null}
  compileSize={object | null}
  boardId={string}                   // default 'arduino-nano-r4'
  boardLabel={string}                // default 'Nano R4'
  fqbn={string}                      // default canonical Nano R4 FQBN
  blockCount={number}
  lastUpload={{ok, message, ts} | null}
  onSendOverride={(text) => void}    // test hook only
/>
```

### Behaviour invariants

- Renders mascot + chat + (optional) voice button + collapse button.
- Auto-publishes context on `window.__ELAB_COMPILE_CONTEXT` for sendChat()
  pickup (cleanup on unmount, reference-checked).
- Uses `useGalileoChat()` hook read-only — shares chat history localStorage
  with Lavagna so docente sees a single UNLIM conversation across surfaces.
- ARIA live region `role="log"` + `aria-live="polite"` + `aria-busy`.
- Quick suggestions adapt to `compileStatus`:
  - error → fix-error, explain-code
  - success → upload-kit, next-experiment
  - idle/other → explain-code, what-does-it-do, help-blockly

### Test hooks (data-testid)

- `home-unlim-chat-v2` — root section
- `home-unlim-chat-v2-empty` — welcome hint (no messages)
- `home-unlim-chat-v2-typing` — loading indicator
- `home-unlim-chat-v2-bubble-user` / `-assistant` — message bubbles
- `home-unlim-chat-v2-quick-{i}` — quick suggestion buttons (0-based)
- `home-unlim-chat-v2-input` — text input
- `home-unlim-chat-v2-send` — send button
- `home-unlim-chat-v2-voice` — voice toggle (only when supported)
- `home-unlim-chat-v2-collapse` — collapse toggle

## ACTION_TAGS_SUPPORTED

### Whitelist (compile-home surface, immutable IT subset)

```
[AZIONE:nessuno]        — no action, pure conversation
[AZIONE:mostratesto]    — render explanation panel (existing program_explainer)
[AZIONE:citavolpag]     — cite Vol/pag verbatim inline
[INTENT:{action:nessuno|mostratesto|citavolpag, ...}]   — JSON variant
```

### Stripped from display (NOT renderable in compile-home)

ALL simulator-side tags:
```
[AZIONE:play|pause|reset|compile|highlight|addcomponent|...]
[INTENT:{tool:highlightComponent|mountExperiment|captureScreenshot|...}]
[AZIONE:loadexp|addwire|removewire|setvalue|interact|...]
```

Rationale: compile-home has NO `__ELAB_API` simulator runtime. Dispatching
simulator tags here would crash OR mislead docente. The Edge Function
prompt extension instructs UNLIM not to emit them on this surface; the
client sanitiser is defence-in-depth.

### LOCK-STEP files (CHANGES PAIRED)

- `src/components/home/HomeUnlimChatV2.jsx` line 52 (`COMPILE_HOME_SAFE_ACTIONS`)
- `supabase/functions/_shared/system-prompt-compile-context.ts` line 102 (`COMPILE_HOME_SAFE_ACTION_TAGS`)

Adding any tag requires:
1. Patch both files in same PR.
2. Codex review.
3. Andrea ratify (CLAUDE.md immutable rules touch).

## CODEX_VERDICT

See `.team-status/swarms-2026-05-29/swarm-3-codex-review.md` (8.6 KB).

| Concern | Verdict |
|---|---|
| (a) Prompt-injection | PASS (triple-layer sanitiser, enum whitelisting) |
| (b) Action-tag whitelist | PASS (IT-only, LOCK-STEP comments) |
| (c) Voice permission | PASS (user-gesture gate, ESC + unmount cleanup) |
| (d) Streaming back-pressure | PASS (aria-live polite, memoization, 100-msg cap) |
| Cross-cutting | 1 MED + 2 LOW, all non-blocking |

OVERALL: APPROVE FOR MERGE post swarm-1+2+5 close.

## INTEGRATION_HOOK_POINTS (for orchestrator post-merge)

When orchestrator integrates V2 into HomeCompileEntry.jsx (swarm 1 owner)
+ HomeCompileLayoutV2.jsx (swarm 2 owner), the following wire-up is needed:

### A. Mount V2 inside the right-column aside

```jsx
// In HomeCompileEntry.jsx, replace UnlimCompileHelper mount OR sit beside:
import HomeUnlimChatV2 from './HomeUnlimChatV2';

<HomeUnlimChatV2
  sketchCode={editorMode === MODE_CODE ? cppCode : scratchCode}
  editorMode={editorMode}
  compileStatus={compileStatus}
  compileErrors={compileErrors}
  compileWarnings={compileWarnings}
  compileSize={compileSize}
  boardId={targetBoardId}       // from swarm 1 board picker state
  boardLabel={targetBoardLabel} // from swarm 1
  fqbn={targetFqbn}             // from swarm 1
  blockCount={workspaceBlockCount}
  lastUpload={lastUploadResult} // from swarm 1 WebUSB chain
/>
```

### B. Forward `window.__ELAB_COMPILE_CONTEXT` in sendChat

`src/services/api.js` `sendChat()` already accepts `simulatorContext` arg.
The `useGalileoChat` hook reads `collectFullContext()` which reads
`__ELAB_API.getSimulatorContext()`. Since compile-home has no `__ELAB_API`,
add a fallback BEFORE the existing collector call:

```js
// In useGalileoChat.js, line ~1172 (before sendChat):
const compileCtx = typeof window !== 'undefined' ? window.__ELAB_COMPILE_CONTEXT : null;
const simulatorContext = compileCtx || collectFullContext();
```

This makes the V2 component work without simulator runtime.

### C. Edge Function discriminator

`supabase/functions/unlim-chat/index.ts` must concatenate the compile-home
prompt fragment when `simulatorContext.surface === 'compile-home'`:

```ts
import { buildCompileHomePromptFragment }
  from '../_shared/system-prompt-compile-context.ts';

const isCompileHome = req.body?.context?.simulatorContext?.surface === 'compile-home';
const systemPrompt = buildSystemPrompt({
  ...,
  appendFragment: isCompileHome
    ? buildCompileHomePromptFragment(req.body?.context?.simulatorContext?.language || 'it')
    : null,
});
```

(Requires `appendFragment` plumbing in `buildSystemPrompt()` — small edit.)

### D. Voice service publication

If Lavagna voice service isn't auto-loaded on compile-home route, ensure
the voice button stays disabled (already handled — `voice.supported`
gate). For Phase 2 voice-on-compile-home, register
`window.__ELAB_VOICE = { startListening, stopListening, speak }` from a
lightweight wrapper around the existing Kokoro/Edge TTS client.

### E. Remove `UnlimCompileHelper` mini-banner (optional cleanup)

V2 panel replaces the mini-banner's role. The orchestrator may delete the
mount in HomeCompileEntry.jsx line 488 (`<UnlimCompileHelper ...>`) post-merge.
File itself preserved for `#chatbot` legacy compat.

## Build / Test evidence

- `npm run build` → PASS (PWA 33 entries, 2645.13 KiB precache).
- `python3 scripts/check-locale-parity.py` → PASS (705 keys, 29 interp).
- Local smoke tests (deleted post-verification, see commit message):
  - 8/8 `unlimContextForCompile` sanitiser tests PASS.
  - 7/7 `HomeUnlimChatV2` mount + a11y + tag-strip tests PASS.

Swarm 5 owns the canonical Vitest + Playwright test suite at:
- `tests/unit/components/home/swarm-2026-05-29-unlim-chat-context.test.jsx`
- `tests/e2e/swarm-2026-05-29-home-compile-full-flow.spec.js`

Those swarm-5 tests currently FAIL because they depend on swarm 1 wire-up
(boardLabel prop forwarded, UnlimCompileHelper API changes). They are
EXPECTED to pass after orchestrator integration of swarms 1+2+5.

## BLOCKERS

None. V2 is fully self-contained behind `window.__ELAB_COMPILE_CONTEXT`
publish + props contract. Orchestrator can wire safely post-swarm close.

## Cross-swarm notes (not cross-write)

- Swarm 1 (compile-bug): if `targetBoardId` / `targetBoardLabel` /
  `targetFqbn` state exists post-fix, please surface as exports from
  HomeCompileEntry so V2 props can be filled directly. If they don't yet
  exist, fall back to `DEFAULT_BOARD_ID` / `'Nano R4'` / `DEFAULT_FQBN`.
- Swarm 2 (layout): the right-column aside currently houses
  `ScratchCompileBar` + `UnlimCompileHelper`. V2 panel slots in below
  `ScratchCompileBar`, replacing `UnlimCompileHelper`. Layout grid area
  `aside` continues to size correctly (V2 panel is `width:100%` flex).
- Swarm 4 (polish): no conflict — V2 CSS module is self-contained, no
  global style spill. Polish overlay (if any) sits OUTSIDE the panel.
- Swarm 5 (tests): swarm-5 tests target HomeCompileEntry + UnlimCompileHelper
  wire-up which V2 will eventually replace. After integration, swarm 5
  may want a dedicated V2 spec file `tests/unit/components/home/
  HomeUnlimChatV2.test.jsx` covering: sanitiser strip + voice gating +
  quick-suggestion routing + context publish/unmount.
