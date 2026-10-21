# Exam autosave regression probe

The actual `Exam.tsx` and `apiClient.ts` run in React/jsdom against the actual
loopback FastAPI service and a fresh SQLite database. The transport adapter holds
the first answer PUT while waiting for the newer PUT or a window longer than the
debounce. If the newer request is concurrent it commits first; if it is queued,
the first request is released and the queued request may finish. Backend responses and
persistence are not mocked. The test expects the newer choice to survive both a
GET and reopening the UI. An unfixed regression exits nonzero; a RED result is
never relabelled PASS.

This is not a browser/layout test, a PostgreSQL test, or a production Auth test.

## Dependencies

Use Python 3.12+ with the dependencies declared by
`services/study-api/pyproject.toml` and the engine dependencies required by Study.
In particular, the runner needs FastAPI and uvicorn in the chosen Python
environment. No model, external database, credential, or paid service is used.

Node dependencies are pinned to the inspected repository lockfile:
React/react-dom 19.2.6, Vitest 4.1.8, Vite 8.0.12, jsdom 29.1.1,
Testing Library React 16.3.2/DOM 10.4.2 and plugin-react 6.0.1.
Use Node satisfying those packages' engine requirements (Node 22.12+ or 24+).

From this probe directory, install the lockfile once:

```sh
npm ci --ignore-scripts --no-audit --no-fund
```

## Run

```sh
python run_probe.py \
  --repo-root /absolute/path/to/ardesia \
  --output-dir /absolute/path/to/probe-results
```

Alternatively set `ARDESIA_REPO_ROOT`. `--python` selects an existing Python
environment; `--node-modules` reuses an already installed dependency directory.
No dependencies are installed automatically. `--port` defaults to zero, so the
operating system assigns a free loopback port; a specific port may be requested.

The runner copies only the test harness into a temporary directory, starts the
real API with synthetic identities, runs Vitest, and always terminates the server.
It removes the temporary database and synthetic session cookie. Repository source
files are read only. Results contain source SHA and per-file hashes, the observed
request ordering and persisted value, the raw Vitest log, and the actual exit code.
Do not commit `node_modules`, databases, runtime/session JSON, or cookies.

## Scenario and fix acceptance

The first PUT carries choice 0; the next carries choice 1. Choice 1 commits first,
then choice 0 arrives in the inspected concurrent implementation. A corrected UI
may serialize the requests instead; the probe records which path it observes and
does not require concurrent requests as an acceptance condition.
The inspected implementation says "Risposte salvate" while
the database contains 0 and reopening loses choice 1. The assertions require 1.
The source hash binds each result to the files actually used, including uncommitted
changes; the Git SHA alone does not prove a clean working tree.
