"""Synthetic server using the proposed copy of the actual shared create_app.

All dependencies/auth/admission are the actual factory's; only the reviewed
install patch is added to a private source copy. This does not install shared.
"""
from pathlib import Path
import importlib.util
import sys
import tempfile
import uvicorn
from prepare_integration import prepare
import study_api.app

with tempfile.TemporaryDirectory(prefix='s11-shared-composition-') as temporary:
    root=Path(temporary)
    prepare(copies=root)
    spec=importlib.util.spec_from_file_location('study_api.s11_proposed_app',root/'services/study-api/study_api/app.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    actual_factory=module.create_app
    def create_app(*args,**kwargs):
        return actual_factory(*args,**kwargs,learning_insights_notice={
            'version':'s11-synthetic-usage-v1','purpose':'Osservazioni facoltative per la sola prova sintetica locale','retentionDays':30})
    # Seed with the same public fixture script but remove its alternate installer.
    source=(Path(__file__).with_name('run_demo.py')).read_text()
    source=source[:source.index('\ndef store_dependency():')]
    source=source.replace('from study_api.app import create_app','')
    namespace={'__name__':'__main__','create_app':create_app}
    exec(compile(source,'s11-fixture-seed','exec'),namespace)
    uvicorn.run(namespace['app'],host='127.0.0.1',port=namespace['args'].port,log_level='warning')
