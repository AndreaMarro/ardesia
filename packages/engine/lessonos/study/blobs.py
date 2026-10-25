"""Immutable original bytes: a narrow infrastructure port, no domain rules."""
import os
from pathlib import Path
from typing import Protocol


class BlobRepository(Protocol):
    is_local: bool

    def put(self, blob_id: str, data: bytes, mime: str) -> None: ...
    def get(self, blob_id: str) -> bytes: ...
    def remove(self, blob_id: str) -> None: ...


class LocalBlobs:
    is_local = True

    def __init__(self, directory: Path):
        self.directory = directory

    def put(self, blob_id, data, mime):
        self.directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        with (self.directory / blob_id).open('xb') as output:
            os.chmod(output.name, 0o600)
            output.write(data)
            output.flush()
            os.fsync(output.fileno())

    def get(self, blob_id):
        return (self.directory / blob_id).read_bytes()

    def remove(self, blob_id):
        (self.directory / blob_id).unlink(missing_ok=True)


def repository(store, directory) -> BlobRepository:
    return getattr(store, 'blobs', None) or LocalBlobs(directory)
