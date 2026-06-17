"""Shared retry helper for LLM provider HTTP calls (FM2 timeout+retry).

Provides ``retry_on_timeout`` — a decorator/wrapper that retries a callable
on network/connection errors with exponential backoff.

Design (FM2, COORDINATION.md CLAUDE-SAYS 2026-06-08):
- Retry on urllib.error.URLError that is NOT an HTTPError (covers
  timeout, DNS failure, connection reset).
- Does NOT retry on HTTPError (4xx/5xx) — those are application-level
  errors that should propagate immediately.
- Default: 3 attempts, backoff 1s -> 2s -> 4s.
- Each provider's complete() method wraps its urlopen call with this.
- No new dependencies — uses stdlib time and functools.
"""

from __future__ import annotations

import time
import urllib.error
from functools import wraps
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

DEFAULT_MAX_ATTEMPTS = 3
DEFAULT_BACKOFF_BASE = 1.0  # seconds


def _is_retryable(exc: urllib.error.URLError) -> bool:
    """Return True if exc is a network/timeout error (NOT an HTTPError).

    urllib.error.HTTPError is a subclass of URLError, but 4xx/5xx
    responses should NEVER be retried — they are application-level errors
    (bad request, auth failure, rate limit, server error).
    """
    return not isinstance(exc, urllib.error.HTTPError)


def retry_on_timeout(
    fn: F,
    max_attempts: int = DEFAULT_MAX_ATTEMPTS,
    backoff_base: float = DEFAULT_BACKOFF_BASE,
) -> F:
    """Wrap fn to retry on network/timeout errors with exponential backoff.

    Args:
        fn: The callable to wrap (typically a urlopen call).
        max_attempts: Max number of attempts (including the first). Default 3.
        backoff_base: Base delay in seconds for exponential backoff.
            Actual delay = backoff_base * 2 ** (attempt - 1).

    Returns:
        The wrapped callable with the same signature.

    Raises:
        urllib.error.URLError: If all attempts fail (network error).
        urllib.error.HTTPError: Propagated immediately (no retry).
        Any other exception: Propagated immediately (no retry).
    """

    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        last_exc: Exception | None = None
        for attempt in range(1, max_attempts + 1):
            try:
                return fn(*args, **kwargs)
            except urllib.error.URLError as exc:
                if not _is_retryable(exc):
                    raise  # HTTPError — propagate immediately
                last_exc = exc
                if attempt < max_attempts:
                    delay = backoff_base * 2.0 ** (attempt - 1)
                    time.sleep(delay)
        # All attempts exhausted
        raise last_exc  # type: ignore[misc]

    return wrapper  # type: ignore[return-value]
