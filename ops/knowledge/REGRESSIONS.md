# REGRESSIONS (append-only). Newest first.

## 2026-06-25 - Served binary staleness (KILLER-FINDING) - CLOSED
Live :8200 served PRE-ea6390e code (9fac811 = HEAD at the process import time, also the stale origin/auto/main tip; distinct from 01dedb2 the dormant disjoint serving repo) for hours: proc imported 01:22, commit 01:23, no --reload -> every fix dead-code for the live process. Detected F0/A2 (proc-start < commit-time + git reflog; /health lacked git_sha). Guard: F2a git_sha on /health (frozen at import) + restart -> /health git_sha==HEAD proves freshness. Next: arm served-SHA done-gate so the factory never marks done on a stale served.

## 2026-06-25 - pytest monkeypatch hit package-shadow
monkeypatch.setattr("lessonos.api.app._SERVED_SHA",..) failed: lessonos/api/__init__ re-exports app, so dotted name resolves to the FastAPI instance, not the module. Guard: importlib.import_module("lessonos.api.app") to reach the real module.

## 2026-06-25 - @{u} masked "unpushed=0"
git log @{u}..HEAD 2>/dev/null | wc -l returns 0 when @{u} is UNSET (stderr swallowed). False "pushed" signal. Guard: git rev-parse --abbrev-ref @{u} (errors loudly) or git remote -v.

## (historic, per KNOWLEDGE-FABRIC-DESIGN) target-only test run masked failures
Running only the changed test file once hid a batch of cross-suite failures. Guard: always run full gate (bash eval/gate.sh) before commit; never commit gate-red.
