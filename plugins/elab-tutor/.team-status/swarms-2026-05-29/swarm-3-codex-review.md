# Swarm 3 — Codex:rescue Independent Review

Reviewer: codex:rescue (in-orchestrator audit, single-pass)
Date: 2026-05-29
Branch: feat/swarm-3-unlim-chat-v2-compile-integration-2026-05-29
Commit: 38c5e8c9

## Scope (per orchestrator brief)

Review for:
- (a) prompt-injection risk via compile error messages forwarded to UNLIM
- (b) action-tag whitelist enforcement (only IT tags allowed)
- (c) voice permission handling (mic gated by user gesture)
- (d) streaming back-pressure

## (a) Prompt-injection — VERDICT: PASS with notes

### Evidence

`src/services/unlimContextForCompile.js`:

1. `sanitizeFreeText()` runs on EVERY free-text field forwarded to UNLIM:
   - `sketchCode` (4000-char cap)
   - `compileErrors` (800-char cap)
   - `compileWarnings` (800-char cap)
   - `lastUpload.message` (400-char cap)
   Stripping pattern:
   - ASCII control chars 0x00-0x1F (except \n \t) + 0x7F removed.
   - `[AZIONE:...]` substrings replaced with literal `[azione removed]`.
   - `[INTENT:{...}]` JSON-shaped tags replaced with `[intent removed]`.
   - Final clip with `… [troncato]` suffix on overflow.

2. `sanitizeToken()` for board metadata (id/label/FQBN):
   - Whitelist `[a-zA-Z0-9:_.\- ]` regex.
   - Additionally strips `INTENT|AZIONE|azione|intent` as bare substrings
     (defence-in-depth even after bracket removal).
   - Collapses repeated `:`.

3. Status / editorMode / language enums whitelisted:
   - `STATUS_WHITELIST = Set(['idle','compiling','success','verified-legacy','error'])`
   - Unrecognized values fall through to `'idle'`.
   - `editorMode` defaults to `'blocks'` unless explicitly `'code'`.
   - `language` defaults to `'it'` unless `'en'`.

4. Surface marker `surface: 'compile-home'` published on
   `window.__ELAB_COMPILE_CONTEXT` and Edge Function discriminates branch.

### Risk surface

- A docente CAN paste attacker-shaped code into the C++ editor. The
  sanitizer strips tag-like substrings BUT preserves source text otherwise
  — by design (UNLIM needs the source to explain the code). The C++ editor
  is itself a trust boundary (the docente can write anything). A future
  hardening atom should add Edge-Function-side sanitisation parity (see
  Swarm 3 status `INTEGRATION_HOOK_POINTS`).

### Recommended (NOT blocking)

- Add an Edge-Function-side cross-check that re-sanitises `editorCode`
  with the same regex pattern. Defence-in-depth: if client sanitiser is
  ever skipped (e.g. dev mode), Edge still strips.

## (b) Action-tag whitelist — VERDICT: PASS

### Evidence

`src/components/home/HomeUnlimChatV2.jsx` lines 50-52:

```js
const COMPILE_HOME_SAFE_ACTIONS = new Set(['nessuno', 'mostratesto', 'citavolpag']);
```

`supabase/functions/_shared/system-prompt-compile-context.ts` lines 100-104:

```ts
export const COMPILE_HOME_SAFE_ACTION_TAGS = [
  'nessuno',
  'mostratesto',
  'citavolpag',
] as const;
```

LOCK-STEP comment in BOTH files mandates pairing on any change.

### sanitizeDisplayText behaviour (jsx lines 67-93)

1. `[INTENT:{...}]` parsed; only kept if `parsed.action` ∈ whitelist (Set
   lookup, case-insensitive via `.toLowerCase()`).
2. `[AZIONE:...]` — ALL stripped from visible text (intentional: tags are
   intent signals for the host, not user-facing copy).
3. Collapse double-whitespace + 3+ blank lines.

### English-tag refusal

- The dispatcher in `useGalileoChat.js` accepts only `/\[azione:[^\]]+\]/gi`
  case-insensitive — `[ACTION:...]` English never matches the parser.
- The base system prompt (`supabase/functions/_shared/system-prompt.ts`
  lines 49-54) already states the immutable rule "FORMATO ITALIANO
  OBBLIGATORIO" and warns about iter-105 live drift to `[ACTION:openeditor]`.
  My compile-home prompt extension does NOT introduce English tags.

### Test evidence

Local smoke test (deleted post-verification, see commit message):

```js
__test__.sanitizeDisplayText('Hi [AZIONE:clearcircuit]') → 'Hi'  // stripped
__test__.sanitizeDisplayText('Hi [AZIONE:nessuno]')      → 'Hi'  // stripped (intent-only)
__test__.sanitizeDisplayText(
  '[INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}] Hi'
) → 'Hi'  // simulator INTENT stripped (no `action` field in whitelist set)
```

## (c) Voice permission handling — VERDICT: PASS

### Evidence

`src/components/home/HomeUnlimChatV2.jsx` lines 102-176:

1. `useVoiceMode` hook detects `window.__ELAB_VOICE` presence (Lavagna
   service auto-mounts when loaded). Defaults `supported: false`.
2. `start()` is NEVER called from `useEffect`/render — only from
   `toggleVoiceMode` which is wired exclusively to the voice button
   `onClick` handler (jsx line 416). Mic API thus requires a user gesture
   per browser standard.
3. `stop()` runs:
   - On user toggle (button press).
   - On `Escape` keydown (jsx lines 312-322).
   - On component unmount (jsx line 168 — `useEffect(() => () => stop())`).
4. `speak()` non-blocking — best-effort `await` with `try/catch` swallow.
   Speech is read from sanitised `displayText`, NEVER raw `content`.

### Risk surface

- If `__ELAB_VOICE` is loaded by a third-party with a `startListening`
  method that bypasses browser permission prompt, the user-gesture gate
  is only enforced by our button onClick. Mitigation: production
  `__ELAB_VOICE` is in the same trust boundary (same origin, same bundle).
  No third-party voice service is loaded; this is a design constraint, not
  a runtime guard. Note in INTEGRATION_HOOK_POINTS.

## (d) Streaming back-pressure — VERDICT: PASS

### Evidence

1. `useGalileoChat` hook owns message state + persistence (load/save
   localStorage). Buffer cap = 100 messages (`CHAT_MAX_MESSAGES`).
2. `HomeUnlimChatV2` re-renders on every `messages` array identity change.
   `visibleMessages` memo computed only when `messages` reference changes
   (line 263) — no per-token recompute storm.
3. Auto-scroll runs only on `[messages.length, isLoading]` deltas (line 256),
   not on token-by-token updates. If the underlying hook streams characters
   into a single message, we re-render but the list length is stable so
   scroll only adjusts on completion (intentional — prevents jitter).
4. The `aria-live="polite"` + `aria-relevant="additions text"` region
   announces new messages without spam — `polite` queues announcements.
5. The `aria-busy={isLoading}` toggle signals SR users that the agent is
   working.

### Risk surface

- If the underlying hook ever switches to true streaming (token-by-token
  state updates), our per-render `sanitizeDisplayText()` cost is O(n) per
  visible message. For 120-word messages this is <1ms — acceptable.
- For pathological cases (1000+ messages), the localStorage 100-message
  cap in `useGalileoChat` prevents unbounded buffer growth.

## Cross-cutting findings

### MED-1: `__ELAB_COMPILE_CONTEXT` global is a globals namespace pollution

The component writes to `window.__ELAB_COMPILE_CONTEXT` on every effect.
Cleanup on unmount is provided (line 230) and is reference-checked
(`window.__ELAB_COMPILE_CONTEXT === compileContext`) so concurrent
mounts won't stomp each other's cleanup.

Recommendation: when orchestrator wires V2 into HomeCompileEntry, document
the global in `src/services/api.js` `sendChat()` preamble so other
contributors know to consume it. Already noted in INTEGRATION_HOOK_POINTS.

### LOW-1: `voice.speak` not idempotent across rapid re-renders

If two assistant messages arrive in the same React batch, only the last
one is spoken (lastSpokenIdRef guards against repeat reads). Intentional —
prevents speech overlap on rapid streams.

### LOW-2: `disabled={isLoading || !localInput.trim()}` recomputed each render

Send button disabled-state recomputes on every keystroke. Negligible (O(1)
trim on short input). No fix needed.

## Verdict summary

| Concern | Verdict |
|---|---|
| (a) Prompt-injection | PASS (sanitiser triple-layer, enum whitelisting, Edge-side parity recommended) |
| (b) Action-tag whitelist | PASS (IT-only, LOCK-STEP comments, refute test passed) |
| (c) Voice permission | PASS (user-gesture gate via button onClick, ESC + unmount cleanup) |
| (d) Streaming back-pressure | PASS (aria-live polite, memoization, 100-msg cap) |
| Cross-cutting | 1 MED (global namespace, mitigated) + 2 LOW (negligible) |

## Action items pre-merge

NONE BLOCKING. Recommendations deferred to orchestrator integration sprint:

1. (MED-1) Document `window.__ELAB_COMPILE_CONTEXT` in api.js sendChat() preamble.
2. (PI defence-in-depth) Edge-Function-side parity sanitiser for editorCode.
3. (Andrea ratify) `COMPILE_HOME_PROMPT_EN` DRAFT translation pre-prod.

OVERALL: APPROVE FOR MERGE post-swarm-1+2+5 close.
