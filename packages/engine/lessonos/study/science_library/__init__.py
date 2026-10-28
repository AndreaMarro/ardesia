"""Original scientific capabilities; persistence and identity remain in Study Core."""
from hashlib import sha256 as _sha256
from importlib.util import module_from_spec as _module_from_spec, spec_from_file_location as _spec_from_file_location
from pathlib import Path as _Path
import sys as _sys

# Hash and execute the SAME trusted first-party bytes. A second normal import
# can read a changed file or a timestamp-valid stale .pyc. User payloads never
# reach this loader; changing a deployed model requires a process restart.
_sources = {name: _Path(__file__).with_name(name).read_bytes()
            for name in ('fluid_catalog.json', 'fluid_catalog.py', 'fluid_models.py', 'models.py')}
_FLUID_CATALOG_BYTES = _sources['fluid_catalog.json']
_identity = _sha256()
for _filename, _source in _sources.items():
    _identity.update(_filename.encode('utf8') + b'\0' + len(_source).to_bytes(8, 'big') + _source)
_MODEL_IMPLEMENTATION_SHA256 = _identity.hexdigest()
for _filename in ('fluid_catalog.py', 'fluid_models.py', 'models.py'):
    _path = _Path(__file__).with_name(_filename)
    _name = __name__ + '.' + _path.stem
    _spec = _spec_from_file_location(_name, _path)
    _module = _module_from_spec(_spec)
    _sys.modules[_name] = _module
    try:
        exec(compile(_sources[_filename], str(_path), 'exec'), _module.__dict__)
    except BaseException:
        _sys.modules.pop(_name, None)
        raise
    if _filename == 'models.py':
        models = _module
evaluate = models.evaluate

__all__ = ['evaluate']
