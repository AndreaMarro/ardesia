---
atom_id: ATOM-S6-B2
sprint: S
iter: 6
priority: P1
assigned_to: generator-test-opus
depends_on:
  - ATOM-S6-A3
provides:
  - tests/unit/edge-tts-isabella.test.js
acceptance_criteria:
  - vitest spec `tests/unit/edge-tts-isabella.test.js` NEW
  - 15 test cases:
    1. synthesizeIsabella default voice
    2. voice override `it-IT-DiegoNeural`
    3. rate +20%
    4. rate -20%
    5. pitch +50Hz
    6. pitch -50Hz
    7. volume +10%
    8. text empty → throw ValidationError
    9. text > 5000 chars → throw LimitError
    10. Microsoft endpoint 5xx → retry 3x then throw
    11. Microsoft endpoint timeout → throw TimeoutError
    12. SSML escape special chars (& < > " ')
    13. multilingual text mixed (italian + english) → uses italian voice
    14. response Content-Type audio/mpeg validation
    15. response byte length > 1000 (non-empty MP3)
  - mock fetch (Microsoft endpoint stub)
  - 15/15 PASS
estimate_hours: 2.5
ownership: generator-test-opus
---

## Task

TTS edge-tts Isabella unit tests — 15 cases voice/rate/pitch.

## Deliverables

- `tests/unit/edge-tts-isabella.test.js` (NEW)

## Hard rules

- depend ATOM-S6-A3 (Edge Function impl first)
- 3x CoV
- NO writes src/, supabase/

## Iter 6 link

Box 8 TTS coverage tested 0.5 → 0.7 (post 15 PASS).
