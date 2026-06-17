# G14 — Bug Hunter Report (Chain-of-Verification)
**Date:** 2026-03-28
**Agent:** Bug Hunter
**Scope:** G14 TTS/STT voice layer — UnlimWrapper, useTTS, useSTT, UnlimInputBar, UnlimOverlay
**Build status:** PASS (no errors, chunk-size warnings only)

---

## Summary

Build passes cleanly. No TypeScript/ESLint errors. PWA entries unchanged (22 precache entries, sw.js + workbox). The voice layer architecture is sound, but 7 issues were found, ranging from P1 (race condition) to P3 (cosmetic/accessibility).

---

## Findings Table

| ID | File | Severity | Category | Description |
|----|------|----------|----------|-------------|
| BH-01 | `useTTS.js:81` | **P1** | Feature broken | `speak()` silently fails and returns `false` if `selectedVoice` is `null` — on Chrome/Edge voices are loaded asynchronously via `voiceschanged` and may not be ready when the first message fires (e.g. welcome hook 1500ms after mount). User hears nothing with no error shown. |
| BH-02 | `UnlimWrapper.jsx:56-66` | **P1** | Race condition | STT `onResult` callback fires `handleSendRef.current?.(text)` while TTS may be actively speaking. There is **no guard** to stop TTS before sending the voice input. Result: Galileo's voice is interrupted mid-sentence without cleanup, and `isSpeaking` state is left `true` (stale) until the next `speak()` call triggers `cleanup()`. |
| BH-03 | `useTTS.js:80-153` | **P1** | Browser compat | **Firefox**: `window.speechSynthesis` exists but `SpeechSynthesisUtterance` does not fire `onstart`/`onend` reliably in Firefox 120+. The `isSpeaking` state may never be set to `false`, leaving the mascotte permanently in "speaking" animation state. |
| BH-04 | `useSTT.js:31-92` | **P1** | Browser compat | **Safari / Firefox**: `SpeechRecognition` is not supported (`window.SpeechRecognition` is undefined; Safari requires `webkitSpeechRecognition` which is also absent in Firefox). The mic button in `UnlimInputBar` is hidden correctly via `stt.isSupported`, but `stt.toggle` is passed as `undefined` — this is handled by `onMicClick && (...)` in InputBar. **Confirmed safe.** However, Safari 17+ on iOS requires user gesture for mic — calling `recognition.start()` inside a React `useCallback` that fires on button click should be safe, but only if the call chain is synchronous. Currently it IS synchronous. Safe on iOS. |
| BH-05 | `UnlimWrapper.jsx:38-45` | **P2** | UX / stale closure | `toggleMute` captures `tts` from closure. `tts` is the hook object, which is stable (same reference across renders because `useTTS` returns the same `stop` ref via `useCallback`). However, if `tts.stop` identity ever changed (e.g. due to hook re-initialization), the closure would call a stale `stop`. Low risk today but fragile. Consider `tts.stop()` via a ref instead. |
| BH-06 | `UnlimOverlay.jsx:185-199` | **P2** | Memory leak risk | `OverlayMessage` has an `innerDismiss` variable declared with `let` inside `useEffect`, but the cleanup function calls `clearTimeout(innerDismiss)`. The `innerDismiss` variable is scoped to the effect body and **is captured correctly** at cleanup time via closure — this is actually safe in modern JS. However, if `safeDismiss` is called via click (BH-07) AND the auto-fade timer also fires, `safeDismiss` is called twice. The `dismissedRef` guard prevents the double-call to `onDismiss`, but `setFading(true)` is called twice (once on click, once from `fadeTimer`). This is harmless but messy. |
| BH-07 | `UnlimOverlay.jsx:240-243` | **P2** | UX issue | When user clicks to dismiss a message, `tts.stop()` is called in `UnlimWrapper` (`onDismiss={(id) => { dismissMessage(id); tts.stop(); }}`). But the `clickTimerRef` inside `OverlayMessage` waits 300ms before calling `safeDismiss`. During those 300ms the message is `fading` but still mounted. `tts.stop()` fires immediately (before `safeDismiss`). This is intentional but creates an inconsistency: the fade animation plays 300ms after TTS has already been stopped. Minor visual gap but not a real bug. |
| BH-08 | `UnlimInputBar.jsx:101` | **P2** | UX / placeholder duplication | The `placeholder` prop passed from `UnlimWrapper` already handles the listening case (`stt.isListening ? (sttInputText || 'Sto ascoltando...') : ...`). But `UnlimInputBar` ALSO overrides the placeholder internally with `isListening ? 'Sto ascoltando...' : placeholder` (line 101). So when `stt.isListening` is true, the interim text from `sttInputText` (passed as the placeholder from the parent) is **never shown** — the internal `'Sto ascoltando...'` wins. The interim voice transcription feedback is completely invisible to the user. |
| BH-09 | `UnlimMascot.jsx:49` | **P3** | Accessibility | The mascot button `aria-label` is always `"UNLIM — clicca per parlare"` regardless of whether the input bar is open (state=active) or closed (state=idle). When the bar is open, clicking closes it — the label should say "Chiudi UNLIM" to match the actual action. Screen reader users get incorrect affordance. |
| BH-10 | `useTTS.js` | **P3** | Missing cleanup on unmount | `useTTS` does not call `synthRef.current.cancel()` on component unmount. If the component unmounts while speaking (e.g. user navigates away mid-sentence), speech continues in the background until the browser stops it. Should add a `useEffect(() => () => { synthRef.current?.cancel(); }, [])` return. |

---

## Detailed Analysis

### BH-01 — Voice silence on first message (P1)

**Location:** `useTTS.js` line 81, `UnlimWrapper.jsx` line 229

```js
// useTTS.js:81
if (!isSupported || !selectedVoice || !text) {
  console.warn('TTS non supportato o voce non disponibile');
  return false;
}
```

The `selectedVoice` starts as `null` and is only set after `voiceschanged` fires. On Chrome, this event fires ~100-500ms after page load. The welcome message fires at 1500ms (`setTimeout` in UnlimWrapper line 221), so it *usually* works — but on slower machines or cold loads, voices may not yet be ready. On **Safari**, `voiceschanged` never fires at all (voices are populated synchronously on first call to `getVoices()` in older Safari, or asynchronously in newer versions). The `loadVoices()` call at line 55 runs immediately and may return an empty array on Chrome, leaving `selectedVoice` as `null`.

**Fix:** In `speak()`, fall back to `synthRef.current.getVoices()[0]` if `selectedVoice` is null. Or speak without a specific voice (the browser will pick a default).

---

### BH-02 — STT fires into active TTS (P1, race condition)

**Location:** `UnlimWrapper.jsx` lines 58-62

```js
onResult: useCallback((text) => {
  setSttInputText('');
  if (text) handleSendRef.current?.(text);  // <-- fires immediately
}, []),
```

`handleSend` calls `speakIfEnabled(cleanText)` at line 186, which calls `tts.speak(text)`. `tts.speak()` calls `cleanup()` first (line 87), which calls `synthRef.current.cancel()`. This actually cancels any in-progress TTS correctly. **However**, the timing is:

1. TTS is speaking (mascotte in "speaking" state)
2. User taps mic (STT starts)
3. STT does NOT stop TTS before listening — microphone picks up TTS output
4. STT may transcribe the TTS speech as user input
5. That garbage text is then sent to Galileo

There is no `tts.stop()` call before `stt.startListening()`. This is the core race condition.

**Fix:** In `stt.toggle` call path (or in `startListening`), call `tts.stop()` before starting STT.

---

### BH-03 — Firefox TTS state stuck "speaking" (P1)

**Location:** `useTTS.js` lines 116-134

In Firefox, `SpeechSynthesisUtterance.onend` is known to not fire in some versions when `speechSynthesis.cancel()` is called. The `cleanup()` function does call `cancel()` + sets state, so explicit stops are fine. The issue is with **natural end** — if Firefox doesn't fire `onend`, `isSpeaking` remains `true` forever after a message finishes naturally.

This causes the mascotte to stay in `speaking` animation state permanently after the first successful TTS completes.

**Fix:** Add a `window.speechSynthesis.onend` handler at the synth level (not utterance level) as a fallback, or poll `synthRef.current.speaking` every 500ms to sync state.

---

### BH-08 — Interim STT text never shown (P2)

**Location:** `UnlimWrapper.jsx` line 313-314 vs `UnlimInputBar.jsx` line 101

In `UnlimWrapper`:
```jsx
placeholder={stt.isListening
  ? (sttInputText || 'Sto ascoltando...')   // parent tries to show interim text
  : lessonPath ? `...` : 'Chiedi...'}
```

In `UnlimInputBar`:
```jsx
placeholder={isListening ? 'Sto ascoltando...' : placeholder}  // overrides parent!
```

The child unconditionally replaces the placeholder with `'Sto ascoltando...'` when `isListening` is true, so the parent's dynamic interim text (`sttInputText`) is never displayed. The user gets no live feedback of what is being transcribed.

**Fix:** Remove the `isListening ? 'Sto ascoltando...' :` override in `UnlimInputBar` and let the parent-provided `placeholder` prop control the text entirely.

---

### BH-10 — TTS continues after unmount (P3)

**Location:** `useTTS.js`

No unmount cleanup:
```js
// Missing:
useEffect(() => {
  return () => {
    synthRef.current?.cancel();
  };
}, []);
```

If the user navigates away from the tutor while Galileo is speaking, the speech synthesis continues until the utterance ends (could be 10-20 seconds for long responses).

---

## Build Verification

| Check | Result |
|-------|--------|
| `npm run build` | PASS — no errors |
| Build warnings | Chunk size only (pre-existing, not G14-related) |
| PWA precache entries | 22 (unchanged) |
| sw.js generated | YES |
| workbox generated | YES |
| UnlimWrapper chunk | 54.49 kB gzip 28.27 kB (reasonable) |

---

## Browser Compatibility Matrix

| Feature | Chrome 120+ | Firefox 120+ | Safari 17+ | iOS Safari |
|---------|-------------|--------------|------------|------------|
| TTS (`speechSynthesis`) | OK | Partial (BH-03) | OK | OK |
| TTS voices load | OK | OK | OK* | OK* |
| STT (`SpeechRecognition`) | OK | NOT SUPPORTED | NOT SUPPORTED | NOT SUPPORTED |
| STT mic button hidden | OK | OK (hidden) | OK (hidden) | OK (hidden) |
| Voice silence on first msg | Possible (BH-01) | Possible (BH-01) | Likely (BH-01) | Likely (BH-01) |

*Safari populates voices synchronously on first `getVoices()` call.

---

## Priority Fix Order

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | BH-02 Stop TTS before STT start | Low (2 lines) | Prevents mic capturing TTS audio |
| 2 | BH-08 Show interim STT text | Low (1 line delete) | User feedback for voice input |
| 3 | BH-01 Speak without voice guard | Low (5 lines) | TTS works on slow/Safari loads |
| 4 | BH-10 TTS unmount cleanup | Low (3 lines) | Prevents ghost speech after nav |
| 5 | BH-03 Firefox isSpeaking stuck | Medium (10 lines) | Firefox mascot animation |
| 6 | BH-09 Mascot aria-label | Low (2 lines) | Accessibility |
| 7 | BH-05 toggleMute closure | Low (refactor) | Future-proofing |

---

*Report generated by Bug Hunter agent — 2026-03-28*
