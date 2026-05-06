# Sprint V iter 1 — Atom D1 — Wake Word Diagnosis

**Date**: 2026-05-05 PM
**Agent**: agent-teams:team-debugger (a2cd93b)
**Confidence**: HIGH ~75%

## Verdict — Root Cause

**H5 (Safari/iOS unsupported) + browser policy** mediato da `MicPermissionNudge` autodismiss + iOS/Safari unsupported. Probabili scenari:

1. **Safari/iOS** (Andrea iPad/iPhone classe) → `isWakeWordSupported()` ritorna `false` (`src/services/wakeWord.js:37-39`); listener saltato silentemente (`LavagnaShell.jsx:512-516` + `HomePage.jsx:593-595`). Nessun toast docente.
2. **Chrome/Edge desktop** ma route NON-`#lavagna` (es. `#tutor`, `#home`, `#chatbot-only`) → wake word ATTIVO solo dentro `LavagnaShell` mount lifecycle (commento `LavagnaShell.jsx:500-502`). Su HomePage parte SOLO post `MicPermissionNudge.onGrant`, ma se `dismissed='1'` mai più ri-prompt.

## Falsificazione altre hypotheses

- **H1** (Nudge non wired) **FALSIFIED**: wired in `HomePage.jsx:696` + `LavagnaShell.jsx:1096-1109`
- **H2** (startWakeWordListener mai chiamato) **FALSIFIED**: 4 call sites — `LavagnaShell.jsx:533, 557, 1102` + `HomePage.jsx:597`
- **H4** (onCommand non wired) **FALSIFIED**: `LavagnaShell.jsx:569-574` `api.unlim.sendMessage(text)` + HomePage `:604-607` CustomEvent
- **H6** (5000ms breve) NOT TESTED, basso impatto
- **H3** (WAKE_PHRASES regex) **PARTIAL/AMBIGUOUS**: 11 varianti `wakeWord.js:18-22` coprono "ehi unlim" + foneticamente "ehi anelim" + "ehi online". Match `transcript.includes(phrase)` su tutte alternatives. Plausibile, non verificabile senza log prod.

## Evidence chain primaria

1. `wakeWord.js:11` "NON supportato: Firefox, Safari"
2. `wakeWord.js:37-39` `isWakeWordSupported()` ritorna `false` su Safari
3. `LavagnaShell.jsx:512-516` su browser unsupported `logger.warn` only, **nessun toast docente**, `setWakeWordActive(false)` silente
4. `MicPermissionNudge.jsx:43,97-99` flag `elab_mic_nudge_dismissed` localStorage permanente (no TTL). Una volta dismiss/grant, banner mai più mostrato
5. `LavagnaShell.jsx:500-502` PZ V3 mandate wake word ATTIVO SOLO dentro LavagnaShell (HomePage warm-up only, listener mai partito)
6. `wakeWord.js:130-149` su `not-allowed` dispatch `elab-wake-word-error` → `LavagnaShell.jsx:589-599` toast. **HomePage non listener** evento

## Fix proposals

### A1.1 — UX feedback browser unsupported (S, LOW risk)
- **File**: `LavagnaShell.jsx:512-516` + `HomePage.jsx:593-595`
- **Change**: silent `logger.warn` → dispatch `elab-wake-word-error` `code:'unsupported'` + messaggio plurale "Ragazzi, su Safari/Firefox la voce 'Ehi UNLIM' non funziona, usate Chrome o Edge"
- **Impact**: docente vede problema invece silenzio
- **LOC**: ~10
- **Anti-regression**: non tocca MicPermissionNudge iter 36

### A1.2 — TTL 24h dismiss flag (M, MEDIUM risk)
- **File**: `MicPermissionNudge.jsx:152-155, 138`
- **Change**: `dismissed=true` salva timestamp ms, prompt re-shown se >24h. Aggiungere fallback HomePage: se `permState==='granted'` `onGrant` immediato
- **Impact**: utente non rimane bloccato indefinitamente post-dismiss
- **LOC**: ~25
- **Anti-regression**: contract `onGrant`/`onDeny` immutato

### A1.3 — Settings UI diagnostics (L, LOW risk)
- **File**: NEW `src/components/lavagna/WakeWordDiagnosticsPanel.jsx`
- **Show**: stato listening (`isWakeWordListening()`), mic permission state, browser support boolean, ultimo errore
- **Button "Test microfono"**: `getUserMedia` + `recognition.start()` + parla → mostra transcript
- **LOC**: ~150
- **Anti-regression**: read-only

## Anti-regression note

- A1.1+A1.2 non rompono MicPermissionNudge iter 36 (no modifiche `requestMicGrant`/`queryMicPermission`/contract props)
- LavagnaShell `:500-502` PZ V3 invariante NON violato (HomePage warm-up resta cache, callback CustomEvent NON aprono UNLIM da home)
- Test 9/9 wakeWord.test.js + 180/180 lavagna sweep preservati

## Gap evidence (confidence cap HIGH ~75%)

- Nessun log prod accessibile (browser/route Andrea)
- WAKE_PHRASES regex match rate non misurato recognizer italiano
- COMMAND_WINDOW_MS 5s non test empirico

**Andrea verify**: (a) browser usato (Safari iPad? Chrome Mac?), (b) route attiva (`#lavagna` vs `#home`), (c) console DevTools `[WakeWord]` log + `elab-wake-word-error` events.

## File:line citations primarie

- `src/services/wakeWord.js:11,18-22,37-39,49-67,80,127-149,161-167`
- `src/components/lavagna/LavagnaShell.jsx:459-462,500-585,589-599,1096-1109`
- `src/components/HomePage.jsx:59,585-612,696`
- `src/components/common/MicPermissionNudge.jsx:43,87-100,129-150,176-186`
