# FACTORY-STATE
last-verified: 2026-06-25 (lessonos@b368438, served pid 3797)
verified-by: ssh macmini firsthand (ps/lsof/git/curl/sqlite) + bash eval/gate.sh

## Served API
- :8200 = uvicorn lessonos.api.app:app, cwd ~/lessonos. HEAD auto/main 781a02b (pushed github; F2a b368438 -> F2b 410562c -> graph-lint 781a02b).
- [DONE F2a] /health exposes git_sha (frozen at import). Live proven: /health git_sha == HEAD after restart (b368438 -> 410562c -> 781a02b). Served-SHA done-gate now HAS its data source.
- served.db (gitignored runtime, mtime stable): 1224 seg, 37 concept, 54 depends_on (0 evidence = GAP), 37 explains (37 evidence). lessonos.db = near-empty demo.

## Loop / done-detection
- STOP active (~/lessonos/STOP). Loop quiesced. hourly-tick STOP-aware (digest-only), kimi-exhaustion guarded.
- done-detection = driver-orch.sh commit + gate-count (driver-orch.sh:115/144). NOT yet served-SHA-gated.
- [DONE, flag-gated, NOT armed] served-SHA guard: bin/served_sha_gate.sh (fail-closed, 4 hermetic + live tests) + driver-orch.sh wiring behind SERVED_SHA_GATE (default 0 = inert, bash -n OK, A2-approve). Arming SERVED_SHA_GATE=1 in driver env = GATE-ANDREA (ADR-ARDESIA-P0 ADR-2).
- gate = bash eval/gate.sh -> {"passed":N,...}. baseline 3743 (3737 + 2 F2a + 4 F2b tests). FROZEN evaluator. NEVER commit gate-red.

## Budget
- litellm gateway :4000 alive. budget-guard 24h=$0.07. cap EUR3-5/g. Builder=Opus (EUR0).

Deep: ~/ardesia-vault/ADR-FACTORY-SERVED-SHA-GATE-2026-06-25, FACTORY-REPAIR-2026-06-24, PLAN-OPMODEL-24jun.
