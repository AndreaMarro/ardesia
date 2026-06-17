# Observation Store — Cross-iteration memory

`lessonos/observations.py` — structured observation store for cross-iteration memory.

## Why file-based JSONL

- Hermes `memory` tool disabled in config (`memory.memory_enabled: false` in `~/.hermes/config.yaml`)
- agentmemory hub at `localhost:3111` uses a non-standard protocol (iii-engine) not reachable via HTTP from Hermes tools (all endpoints return 404)
- JSONL file is **committed to the repo** → survives `git reset --hard`
- Append-only → no corruption, easy git diff

## Protocol (codified in `skill:lessonos-observation`)

### End of every iteration

Option A — manual (fine grain):
```python
from lessonos.observations import save_observation
save_observation(...)
```

Option B — one-shot (writes both observations.jsonl + log.jsonl):
```python
from lessonos.observations import log_iteration
log_iteration(
    task='one-line task description',
    hypothesis='hypothesis tested',
    gate_passed=N,
    cost_usd=0.00,
    status='pass',
    files=['module.py:start-end'],
)
```

### ORIENT phase
```python
from lessonos.observations import load_recent_observations, search_observations

recent = load_recent_observations(n=5)  # newest first
found = search_observations('keyword')
```

## Fields

- `ts` — ISO 8601 UTC (auto)
- `commit` — git short SHA (auto, `subprocess.run` mocked in tests)
- `task` — task description (required)
- `hypothesis` — what was being tested
- `file_line` — files changed summary
- `gate_passed` — pytest passing count
- `cost_usd` — estimated LLM cost
- `status` — pass/blocked/invest/revert
- `note` — optional context

## Files

- `lessonos/observations.py` — module (`file:line 1-185`)
- `tests/test_observations.py` — 15 test non-tautologici (`file:line 1-325`)
- `observations.jsonl` — data file (committed, at project root)
- `STATUS.md:37` — STATUS entry
