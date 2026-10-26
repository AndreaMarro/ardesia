"""Compose ONLY the candidate installer in memory. Shared app.py remains untouched."""
import types
from pathlib import Path
import study_api.app as original

def composed_factory():
    source=Path(original.__file__).read_text()
    seam='    if studio_frontend:\n'
    install="    from .living_sources import install_living_sources\n    install_living_sources(app, authenticate, store_dependency, Path(db_path).parent/'blobs')\n\n"
    assert source.count(seam)==1
    module=types.ModuleType('study_api.s18_composed');module.__package__='study_api';module.__file__=original.__file__
    exec(compile(source.replace(seam,install+seam),original.__file__,'exec'),module.__dict__)
    return module.create_app
