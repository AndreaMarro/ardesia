"""Paid model tests require an explicit invocation, beyond available credentials."""
import pytest


def pytest_addoption(parser):
    parser.addoption('--run-live-models', action='store_true', default=False,
        help='Enable marked live model tests; requires separately authorized provider usage.')


def pytest_configure(config):
    config.addinivalue_line('markers', 'live_model: makes real external model requests, potentially billed')


def pytest_collection_modifyitems(config, items):
    if config.getoption('--run-live-models'):
        return
    skipped = pytest.mark.skip(reason='live model usage requires explicit --run-live-models; credentials alone are not consent')
    for item in items:
        if item.get_closest_marker('live_model') is not None:
            item.add_marker(skipped)
