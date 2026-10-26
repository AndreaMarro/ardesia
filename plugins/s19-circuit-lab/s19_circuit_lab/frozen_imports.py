"""Esegue i byte del commit verificato, indipendentemente dalle cache .pyc."""

import hashlib
from importlib.abc import MetaPathFinder
from importlib.machinery import PathFinder, SourceFileLoader
from pathlib import Path
import subprocess
import sys
from types import MappingProxyType


class FrozenSourceLoader(SourceFileLoader):
    def __init__(self, name, path, data, revision):
        super().__init__(name, path)
        self._frozen_source = data
        self.revision = revision

    def get_code(self, fullname):
        # SourceFileLoader's default implementation may execute timestamp pyc.
        # Compile the attested bytes directly; never read or write a pyc.
        return compile(self._frozen_source, self.path, "exec", dont_inherit=True)


class FrozenKirchhoffFinder(MetaPathFinder):
    def __init__(self, root, commit):
        self.source_root = (root / "src/kirchhoff").resolve()
        tree = subprocess.check_output(
            [
                "git",
                "-C",
                str(root),
                "ls-tree",
                "-rz",
                "--full-tree",
                commit,
                "--",
                "src/kirchhoff",
            ],
            timeout=10,
        )
        sources = {}
        relative = {}
        for row in tree.split(b"\0"):
            if not row:
                continue
            header, name = row.split(b"\t", 1)
            if not name.endswith(b".py"):
                continue
            mode, kind, oid = header.split()
            if kind != b"blob" or mode not in (b"100644", b"100755"):
                raise ValueError(
                    "Il package richiede sorgenti Python ordinari, non collegamenti esterni."
                )
            path = (root / name.decode("utf8")).resolve()
            if not path.is_relative_to(self.source_root):
                raise ValueError("Sorgente fuori dal package fissato.")
            data = path.read_bytes()
            actual = (
                hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data)
                .hexdigest()
                .encode()
            )
            if actual != oid:
                raise ValueError(
                    "I byte Python non corrispondono al commit Kirchhoff fissato."
                )
            sources[path] = data
            relative[path.relative_to(self.source_root).as_posix()] = data
        if not sources:
            raise ValueError("Sorgenti Kirchhoff assenti.")
        self.sources = MappingProxyType(sources)
        digest = hashlib.sha256()
        for name, data in sorted(relative.items()):
            digest.update(
                name.encode() + b"\0" + str(len(data)).encode() + b"\0" + data
            )
        self.package_revision = digest.hexdigest()

    def find_spec(self, fullname, path=None, target=None):
        if fullname != "kirchhoff" and not fullname.startswith("kirchhoff."):
            return None
        spec = PathFinder.find_spec(fullname, path, target)
        if spec is None or spec.origin is None:
            raise ImportError("Modulo Kirchhoff non presente nel package fissato.")
        origin = Path(spec.origin).resolve()
        if origin not in self.sources:
            raise ImportError("Modulo Kirchhoff non attestato dai byte fissati.")
        spec.loader = FrozenSourceLoader(
            fullname, str(origin), self.sources[origin], self.package_revision
        )
        return spec


_finder = None


def install_frozen_imports(root, commit):
    global _finder
    loaded = [
        module
        for name, module in tuple(sys.modules.items())
        if name == "kirchhoff" or name.startswith("kirchhoff.")
    ]
    for module in loaded:
        loader = getattr(getattr(module, "__spec__", None), "loader", None)
        if (
            _finder is None
            or not isinstance(loader, FrozenSourceLoader)
            or loader.revision != _finder.package_revision
        ):
            raise ValueError(
                "Kirchhoff era già importato senza controllo dei byte: riavvia il processo con S19 prima degli altri consumer."
            )
    if _finder is None:
        candidate = FrozenKirchhoffFinder(root, commit)
        sys.meta_path.insert(0, candidate)
        _finder = candidate
    elif _finder.source_root != (root / "src/kirchhoff").resolve():
        raise ValueError(
            "Il processo non può cambiare checkout Kirchhoff dopo il caricamento."
        )
    return _finder.package_revision
