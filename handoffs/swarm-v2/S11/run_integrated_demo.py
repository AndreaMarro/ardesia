"""Compatibility entrypoint for the installed synthetic fixture.

API/App/restore hooks are now installed in this branch. No copied factory or
alternate authentication is needed. Pass --synthetic-notice explicitly for the
optional local test choice; it stays disabled by default.
Historical copy-composition evidence remains at commit9fa0600c.
"""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).with_name('run_demo.py')),run_name='__main__')
