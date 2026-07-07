"""Shared fixtures.

Il servizio è sandbox-only: la API key qui sotto è un DUMMY di test
(mai un segreto reale); in produzione arriva SOLO da env ENTITLEMENT_API_KEY.
"""

from __future__ import annotations

import pytest

from entitlement_service.settings import Settings

TEST_API_KEY = "test-dummy-key-not-a-secret"


class FakeClock:
    """Clock iniettabile in millisecondi epoch (come entitlementCore.ts)."""

    def __init__(self, start_ms: int = 1_760_000_000_000) -> None:
        self.value_ms = start_ms

    def now_ms(self) -> int:
        return self.value_ms

    def advance(self, delta_ms: int) -> None:
        self.value_ms += delta_ms


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def settings(tmp_path, clock: FakeClock) -> Settings:
    return Settings(
        data_dir=tmp_path / "var" / "data",
        outbox_dir=tmp_path / "var" / "outbox",
        api_key=TEST_API_KEY,
        retention_days=30,
        clock_ms=clock.now_ms,
    )


@pytest.fixture
def client(settings: Settings):
    from fastapi.testclient import TestClient

    from entitlement_service.app import create_app

    return TestClient(create_app(settings))
