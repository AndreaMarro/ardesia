"""Original scientific capabilities; persistence and identity remain in Study Core."""
from hashlib import sha256 as _sha256
from importlib.util import module_from_spec as _module_from_spec, spec_from_file_location as _spec_from_file_location
from pathlib import Path as _Path
import sys as _sys

# Hash and execute the SAME trusted first-party bytes. A second normal import
# can read a changed file or a timestamp-valid stale .pyc. User payloads never
# reach this loader; changing a deployed model requires a process restart.
_path = _Path(__file__).with_name('models.py')
_source = _path.read_bytes()
_MODEL_IMPLEMENTATION_SHA256 = _sha256(_source).hexdigest()
_name = __name__ + '.models'
_spec = _spec_from_file_location(_name, _path)
models = _module_from_spec(_spec)
_sys.modules[_name] = models
try:
    exec(compile(_source, str(_path), 'exec'), models.__dict__)
except BaseException:
    _sys.modules.pop(_name, None)
    raise
evaluate = models.evaluate

__all__ = ['evaluate']
