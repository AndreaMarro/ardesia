# FACTORY-STATE
last-verified: 2026-06-25 (lessonos@b368438, served pid 3797)
verified-by: ssh macmini firsthand (ps/lsof/git/curl/sqlite) + bash eval/gate.sh

## Served API
- :8200 = uvicorn lessonos.api.app:app, cwd ~/lessonos. HEAD auto/main b368438 (pushed github).
- [DONE F2a] /health exposes git_sha (frozen at import). Live proven: /health git_sha=b368438 == HEAD after restart. Served-SHA done-gate now HAS its data source.
- served.db (gitignored runtime, mtime stable): 1224 seg, 37 concept, 54 depends_on (0 evidence = GAP), 37 explains (37 evidence). lessonos.db = near-empty demo.

## Loop / done-detection
- STOP active (~/lessonos/STOP). Loop quiesced. hourly-tick STOP-aware (digest-only), kimi-exhaustion guarded.
- done-detection = driver-orch.sh commit + gate-count (driver-orch.sh:115/144). NOT yet served-SHA-gated.
- [PREPARED, not armed] served-SHA guard (part b, driver-orch.sh status=pass branch) = GATE-ANDREA (ADR-ARDESIA-P0 ADR-2; arming touches live loop). Test-on-quiesced first.
- gate = bash eval/gate.sh -> {"passed":N,...}. baseline 3739 (3737 + 2 F2a tests). FROZEN evaluator. NEVER commit gate-red.

## Budget
- litellm gateway :4000 alive. budget-guard 24h=$0.07. cap EUR3-5/g. Builder=Opus (EUR0).

Deep: ~/ardesia-vault/ADR-FACTORY-SERVED-SHA-GATE-2026-06-25, FACTORY-REPAIR-2026-06-24, PLAN-OPMODEL-24jun.
