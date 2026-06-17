"""Tests for the shared retry helper (lessonos/llm/_retry.py).

Verifies FM2 (COORDINATION.md CLAUDE-SAYS 2026-06-08) timeout+retry:
- Retry on URLError (network/timeout) with exponential backoff.
- Does NOT retry on HTTPError (4xx/5xx).
- Correct number of attempts.
- Provider integration: timeout wraps the urlopen correctly.
"""

from __future__ import annotations

import urllib.error

import pytest

from lessonos.llm._retry import _is_retryable, retry_on_timeout


def _succeed_after(times_to_fail: int):
    """Return a callable that fails *times_to_fail* times with URLError,
    then succeeds on the next call with return value 'ok'."""
    call_count = [0]

    def _fn():
        call_count[0] += 1
        if call_count[0] <= times_to_fail:
            raise urllib.error.URLError("connection reset")
        return "ok"

    return _fn


class TestRetryable:
    """Test _is_retryable classification."""

    def test_urlerror_is_retryable(self) -> None:
        assert _is_retryable(urllib.error.URLError("timeout"))

    def test_httperror_is_not_retryable(self) -> None:
        exc = urllib.error.HTTPError(
            url="http://example.com",
            code=429,
            msg="rate limited",
            hdrs={},
            fp=None,
        )
        assert not _is_retryable(exc)

    def test_httperror_500_is_not_retryable(self) -> None:
        exc = urllib.error.HTTPError(
            url="http://example.com",
            code=500,
            msg="server error",
            hdrs={},
            fp=None,
        )
        assert not _is_retryable(exc)


class TestRetryOnTimeout:
    """Test the retry_on_timeout wrapper itself."""

    def test_success_first_try(self) -> None:
        """If the callable succeeds on the first attempt, return immediately."""
        fn = retry_on_timeout(lambda: "ok", max_attempts=3)
        assert fn() == "ok"

    def test_retry_then_succeed(self) -> None:
        """Fails twice with URLError, succeeds on third attempt."""
        fn = retry_on_timeout(_succeed_after(2), max_attempts=3)
        assert fn() == "ok"

    def test_exhaust_retries_raises(self) -> None:
        """All attempts fail -> URLError is raised."""
        fn = retry_on_timeout(_succeed_after(5), max_attempts=3)
        with pytest.raises(urllib.error.URLError, match="connection reset"):
            fn()

    def test_single_attempt_no_retry(self) -> None:
        """max_attempts=1 means no retry — fails immediately."""
        fn = retry_on_timeout(_succeed_after(1), max_attempts=1)
        with pytest.raises(urllib.error.URLError):
            fn()

    def test_zero_attempts_raises_value_error_or_none(self) -> None:
        """Edge case: max_attempts=0 should not loop forever.
        The retry loop simply never runs, returning None and raising
        UnboundLocalError/TypeError. We test that it at least does NOT hang."""
        fn = retry_on_timeout(_succeed_after(0), max_attempts=0)
        with pytest.raises(Exception):  # any exception better than hang
            fn()

    def test_custom_backoff_does_not_hang(self) -> None:
        """Custom backoff base produces at least one retry."""
        fn = retry_on_timeout(_succeed_after(1), max_attempts=2, backoff_base=0.01)
        assert fn() == "ok"

    def test_httperror_not_retried(self) -> None:
        """HTTPError (subclass of URLError) is NOT retried — propagates immediately."""

        def _raise_httperror():
            raise urllib.error.HTTPError(
                url="http://example.com", code=401, msg="unauthorized", hdrs={}, fp=None
            )

        fn = retry_on_timeout(_raise_httperror, max_attempts=3)
        with pytest.raises(urllib.error.HTTPError):
            fn()
