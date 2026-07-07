"""Store astratto + FileStore (KV file-based sotto var/data)."""

from __future__ import annotations

import pytest

from entitlement_service.store import FileStore, Store, read_json, write_json


def test_filestore_is_a_store(tmp_path) -> None:
    assert isinstance(FileStore(tmp_path), Store)


def test_write_then_read_roundtrip(tmp_path) -> None:
    store = FileStore(tmp_path)
    store.write("entitlements/licenses/abc.json", b'{"v":1}')
    assert store.read("entitlements/licenses/abc.json") == b'{"v":1}'


def test_read_missing_returns_none(tmp_path) -> None:
    store = FileStore(tmp_path)
    assert store.read("entitlements/licenses/missing.json") is None


def test_delete_removes_key(tmp_path) -> None:
    store = FileStore(tmp_path)
    store.write("a/b.json", b"x")
    store.delete("a/b.json")
    assert store.read("a/b.json") is None
    # delete è idempotente
    store.delete("a/b.json")


def test_path_traversal_rejected(tmp_path) -> None:
    store = FileStore(tmp_path / "root")
    for bad in ("../escape.json", "a/../../escape.json", "/etc/passwd"):
        with pytest.raises(ValueError):
            store.write(bad, b"x")
        with pytest.raises(ValueError):
            store.read(bad)


def test_json_helpers_roundtrip_and_corruption(tmp_path) -> None:
    store = FileStore(tmp_path)
    write_json(store, "x.json", {"a": 1})
    assert read_json(store, "x.json") == {"a": 1}
    store.write("bad.json", b"{not json")
    assert read_json(store, "bad.json") is None  # corrotto -> None, mai eccezione
