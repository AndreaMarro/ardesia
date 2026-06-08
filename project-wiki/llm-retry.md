# LLM Provider Retry Helper (`lessonos/llm/_retry.py`)

Helper condiviso per retry su timeout di rete nelle chiamate LLM (FM2, COORDINATION.md § CLAUDE-SAYS 2026-06-08).

## Funzione principale

`retry_on_timeout(fn, max_attempts=3, backoff_base=1.0)`
- Wrapper che ritenta *fn* su `urllib.error.URLError` (timeout, DNS failure, connection reset) con backoff esponenziale: 1s, 2s, 4s.
- **NON** ritenta `urllib.error.HTTPError` (4xx/5xx) — applica `_is_retryable()` come guardia.

File: `lessonos/llm/_retry.py:28-63`

## Provider modificati

### DeepSeekProvider
- Timeout default: 120s (era 30s) — `lessonos/llm/deepseek.py:181`
- `urlopen` wrapped con `retry_on_timeout(urlopen, max_attempts=3, backoff_base=1.0)` — `lessonos/llm/deepseek.py:230`

### KimiProvider
- Timeout default: 120s (era 30s) — `lessonos/llm/kimi.py:74`
- `urlopen` wrapped con retry — `lessonos/llm/kimi.py:105`
- Error handling aggiunto: HTTPError → RuntimeError (mancante prima), KeyError/IndexError su risposta malformata — `lessonos/llm/kimi.py:108-120`

## Test

- `tests/test_retry.py` — 7 test del wrapper puro (success, retry-then-succeed, exhaust, httperror-not-retried)
- `tests/test_deepseek_provider.py` — 3 test di timeout retry integrati
- `tests/test_kimi_provider.py` — 10 test di wiring + timeout retry + error handling
