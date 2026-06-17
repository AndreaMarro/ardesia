# harness-2.0 iter 19 DRAFT report

Generated: 2026-04-28T14:01:11.084Z
Total: 87 | Pass: 87 | Fail: 0 | Pass rate: 100.0%

## Honesty caveats
- Iter 19 = STUB simulate/tutor/diagnose/screenshot. NO real avr8js exec, NO Edge Function call, NO Playwright.
- Golden directory `tests/fixtures/harness-2.0-golden/` referenced but NOT created here (deferred iter 21+).
- "pass" iter 19 = basic shape validation + missing golden treated as no_golden (not failure).

## Broken experiments
_none_

## All results
| # | id | ok | stage | latency_ms |
|---|----|----|-------|-----------|
| 1 | `v1-cap10-esp1` | PASS | complete | 2 |
| 2 | `v1-cap10-esp2` | PASS | complete | 1 |
| 3 | `v1-cap10-esp3` | PASS | complete | 2 |
| 4 | `v1-cap10-esp4` | PASS | complete | 1 |
| 5 | `v1-cap10-esp5` | PASS | complete | 0 |
| 6 | `v1-cap10-esp6` | PASS | complete | 1 |
| 7 | `v1-cap11-esp1` | PASS | complete | 2 |
| 8 | `v1-cap11-esp2` | PASS | complete | 3 |
| 9 | `v1-cap12-esp1` | PASS | complete | 2 |
| 10 | `v1-cap12-esp2` | PASS | complete | 1 |
| 11 | `v1-cap12-esp3` | PASS | complete | 2 |
| 12 | `v1-cap12-esp4` | PASS | complete | 0 |
| 13 | `v1-cap13-esp1` | PASS | complete | 1 |
| 14 | `v1-cap13-esp2` | PASS | complete | 1 |
| 15 | `v1-cap14-esp1` | PASS | complete | 1 |
| 16 | `v1-cap6-esp1` | PASS | complete | 0 |
| 17 | `v1-cap6-esp2` | PASS | complete | 1 |
| 18 | `v1-cap6-esp3` | PASS | complete | 1 |
| 19 | `v1-cap7-esp1` | PASS | complete | 1 |
| 20 | `v1-cap7-esp2` | PASS | complete | 1 |
| 21 | `v1-cap7-esp3` | PASS | complete | 0 |
| 22 | `v1-cap7-esp4` | PASS | complete | 1 |
| 23 | `v1-cap7-esp5` | PASS | complete | 1 |
| 24 | `v1-cap7-esp6` | PASS | complete | 1 |
| 25 | `v1-cap8-esp1` | PASS | complete | 4 |
| 26 | `v1-cap8-esp2` | PASS | complete | 1 |
| 27 | `v1-cap8-esp3` | PASS | complete | 1 |
| 28 | `v1-cap8-esp4` | PASS | complete | 1 |
| 29 | `v1-cap8-esp5` | PASS | complete | 1 |
| 30 | `v1-cap9-esp1` | PASS | complete | 1 |
| 31 | `v1-cap9-esp2` | PASS | complete | 1 |
| 32 | `v1-cap9-esp3` | PASS | complete | 1 |
| 33 | `v1-cap9-esp4` | PASS | complete | 0 |
| 34 | `v1-cap9-esp5` | PASS | complete | 1 |
| 35 | `v1-cap9-esp6` | PASS | complete | 1 |
| 36 | `v1-cap9-esp7` | PASS | complete | 0 |
| 37 | `v1-cap9-esp8` | PASS | complete | 1 |
| 38 | `v1-cap9-esp9` | PASS | complete | 0 |
| 39 | `v2-cap10-esp1` | PASS | complete | 1 |
| 40 | `v2-cap10-esp2` | PASS | complete | 2 |
| 41 | `v2-cap10-esp3` | PASS | complete | 0 |
| 42 | `v2-cap10-esp4` | PASS | complete | 1 |
| 43 | `v2-cap12-esp1` | PASS | complete | 0 |
| 44 | `v2-cap3-esp1` | PASS | complete | 1 |
| 45 | `v2-cap3-esp2` | PASS | complete | 1 |
| 46 | `v2-cap3-esp3` | PASS | complete | 1 |
| 47 | `v2-cap3-esp4` | PASS | complete | 1 |
| 48 | `v2-cap4-esp1` | PASS | complete | 1 |
| 49 | `v2-cap4-esp2` | PASS | complete | 1 |
| 50 | `v2-cap4-esp3` | PASS | complete | 2 |
| 51 | `v2-cap5-esp1` | PASS | complete | 0 |
| 52 | `v2-cap5-esp2` | PASS | complete | 1 |
| 53 | `v2-cap6-esp1` | PASS | complete | 0 |
| 54 | `v2-cap6-esp2` | PASS | complete | 1 |
| 55 | `v2-cap6-esp3` | PASS | complete | 0 |
| 56 | `v2-cap6-esp4` | PASS | complete | 1 |
| 57 | `v2-cap7-esp1` | PASS | complete | 0 |
| 58 | `v2-cap7-esp2` | PASS | complete | 1 |
| 59 | `v2-cap7-esp3` | PASS | complete | 0 |
| 60 | `v2-cap7-esp4` | PASS | complete | 1 |
| 61 | `v2-cap8-esp1` | PASS | complete | 0 |
| 62 | `v2-cap8-esp2` | PASS | complete | 1 |
| 63 | `v2-cap8-esp3` | PASS | complete | 0 |
| 64 | `v2-cap9-esp1` | PASS | complete | 1 |
| 65 | `v2-cap9-esp2` | PASS | complete | 0 |
| 66 | `v3-cap5-esp1` | PASS | complete | 1 |
| 67 | `v3-cap5-esp2` | PASS | complete | 0 |
| 68 | `v3-cap6-esp1` | PASS | complete | 1 |
| 69 | `v3-cap6-esp2` | PASS | complete | 0 |
| 70 | `v3-cap6-esp3` | PASS | complete | 1 |
| 71 | `v3-cap6-esp4` | PASS | complete | 1 |
| 72 | `v3-cap6-esp5` | PASS | complete | 2 |
| 73 | `v3-cap6-esp6` | PASS | complete | 3 |
| 74 | `v3-cap6-esp7` | PASS | complete | 3 |
| 75 | `v3-cap7-esp1` | PASS | complete | 1 |
| 76 | `v3-cap7-esp2` | PASS | complete | 2 |
| 77 | `v3-cap7-esp3` | PASS | complete | 0 |
| 78 | `v3-cap7-esp4` | PASS | complete | 1 |
| 79 | `v3-cap7-esp5` | PASS | complete | 0 |
| 80 | `v3-cap7-esp6` | PASS | complete | 0 |
| 81 | `v3-cap7-esp7` | PASS | complete | 1 |
| 82 | `v3-cap7-esp8` | PASS | complete | 1 |
| 83 | `v3-cap8-esp1` | PASS | complete | 1 |
| 84 | `v3-cap8-esp2` | PASS | complete | 0 |
| 85 | `v3-cap8-esp3` | PASS | complete | 1 |
| 86 | `v3-cap8-esp4` | PASS | complete | 0 |
| 87 | `v3-cap8-esp5` | PASS | complete | 0 |
