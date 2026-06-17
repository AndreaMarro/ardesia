---
atom_id: ATOM-S6-A4
sprint: S
iter: 6
priority: P0
assigned_to: generator-app-opus
depends_on:
  - ATOM-S6-A3
provides:
  - src/services/multimodalRouter.js (UPDATE routeTTS real impl)
acceptance_criteria:
  - replace stub `routeTTS` con real fetch POST `unlim-tts` Edge Function
  - request body { text, voice='it-IT-IsabellaNeural', rate=0, pitch=0, volume=0 }
  - response handling: blob audio MP3 + Audio API playback
  - error fallback: Web Speech API (browser native) se Edge Function down
  - cache LRU last 20 utterances (text hash) → no double request
  - timeout 10s → fallback Web Speech
  - vitest unit ≥8 PASS (real routeTTS + cache hit + cache miss + fallback + timeout + error 5xx + voice override + rate override)
  - integration smoke connected to deployed Edge Function (skipped se ELAB_API_KEY missing)
estimate_hours: 3.0
ownership: generator-app-opus writes ONLY src/ + automa/team-state/messages/gen-app-*.md
---

## Task

multimodalRouter `routeTTS` real implementation post Edge Function `unlim-tts` deploy.

## Deliverables

- `src/services/multimodalRouter.js` UPDATE routeTTS real

## Hard rules

- depend ATOM-S6-A3 (Edge Function must exist first)
- 3x CoV
- NO main push

## Iter 6 link

Box 8 partial complete + UNLIM voice playback functional.
