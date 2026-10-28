"""The operator transport is independent of browser auth and leaks counts only."""
from io import BytesIO
import importlib.util
import json
from pathlib import Path

import pytest
from lessonos.study.models import StudyError
from lessonos.study.uploads import recover_uploads
from study_api.upload_recovery import RemoteUploadRecovery,URL

ROOT=Path(__file__).resolve().parents[3]
ID='a'*32
CAP='b'*64


class Response(BytesIO):
    def __enter__(self):return self
    def __exit__(self,*args):self.close()


class Opener:
    def __init__(self,body):self.body=body;self.requests=[]
    def open(self,request,timeout):
        self.requests.append(request)
        assert timeout==30
        value=self.body(json.loads(request.data)) if callable(self.body) else self.body
        return Response(json.dumps(value).encode())


def test_pinned_header_only_private_operator_reuses_bounded_recover_uploads():
    operator=RemoteUploadRecovery({'URL':URL,'CAPABILITY':CAP})
    operator._opener=Opener(lambda body:{'ids':[ID]} if body['action']=='candidates' else {'outcome':'cleaned'})
    assert recover_uploads(operator,operator,limit=1)=={'cleaned':1,'failed':0,'skipped':0}
    for request in operator._opener.requests:
        assert request.full_url==URL
        assert request.get_header('Authorization')=='Bearer '+CAP
        assert CAP not in request.data.decode() and 'bucket' not in request.data.decode()


@pytest.mark.parametrize('config',[{'URL':'https://evil.example/worker','CAPABILITY':CAP},
    {'URL':URL,'CAPABILITY':CAP,'SERVICE_ROLE_KEY':'forbidden'}, {'URL':URL,'CAPABILITY':'short'}])
def test_operator_cannot_target_other_project_or_accept_runtime_credentials(config):
    with pytest.raises(ValueError,match='invalid_upload_recovery_configuration'):RemoteUploadRecovery(config)


def test_operator_file_requires_private_permissions(tmp_path):
    path=tmp_path/'operator.json';path.write_text(json.dumps({'URL':URL,'CAPABILITY':CAP}));path.chmod(0o644)
    with pytest.raises(ValueError,match='private_upload_recovery_file_required'):RemoteUploadRecovery.from_file(path)
    path.chmod(0o600)
    assert RemoteUploadRecovery.from_file(path)._administrative is True


@pytest.mark.parametrize('body',[{'ids':[ID,ID]},{'ids':['../bucket/id']},{'ids':[ID],'key':'forbidden'}, {'ids':[ID]*101}])
def test_malformed_candidates_fail_closed(body):
    operator=RemoteUploadRecovery({'URL':URL,'CAPABILITY':CAP});operator._opener=Opener(body)
    with pytest.raises(StudyError,match='upload_recovery_unavailable'):operator.upload_recovery_candidates(100)


def test_cleanup_failure_is_counted_and_durable_recovery_remains_retryable():
    operator=RemoteUploadRecovery({'URL':URL,'CAPABILITY':CAP})
    operator._opener=Opener(lambda body:{'ids':[ID]} if body['action']=='candidates' else {'outcome':'unsafe'})
    assert recover_uploads(operator,operator)=={'cleaned':0,'failed':1,'skipped':0}
    operator._opener=Opener(lambda body:{'ids':[ID]} if body['action']=='candidates' else {'outcome':'skipped'})
    assert recover_uploads(operator,operator)=={'cleaned':0,'failed':0,'skipped':1}


def test_redirect_handler_never_forwards_capability():
    operator=RemoteUploadRecovery({'URL':URL,'CAPABILITY':CAP})
    from study_api.upload_recovery import _NoRedirect
    assert _NoRedirect().redirect_request(None,None,302,'redirect',{},'https://evil.example') is None


def test_cli_uses_independent_operator_and_emits_counts_only(tmp_path,monkeypatch,capsys):
    config=tmp_path/'operator.json';config.write_text(json.dumps({'URL':URL,'CAPABILITY':CAP}));config.chmod(0o600)
    spec=importlib.util.spec_from_file_location('recover_cli',ROOT/'bin/study-demo/recover-supabase-uploads.py')
    cli=importlib.util.module_from_spec(spec);spec.loader.exec_module(cli)
    monkeypatch.setattr(RemoteUploadRecovery,'_request',lambda self,body:{'ids':[ID]} if body['action']=='candidates' else {'outcome':'cleaned'})
    assert cli.main(['--operator-file',str(config)])==0
    assert json.loads(capsys.readouterr().out)=={'applied':False,'recoverable':1}
    assert cli.main(['--operator-file',str(config),'--apply'])==0
    output=capsys.readouterr().out
    assert CAP not in output and ID not in output
    assert json.loads(output)=={'applied':True,'cleaned':1,'failed':0,'skipped':0}


def test_capability_preparation_keeps_secret_private_and_renders_only_hash(tmp_path):
    import hashlib
    import subprocess
    import sys
    import time
    private=tmp_path/'private'
    result=subprocess.run([sys.executable,str(ROOT/'bin/study-demo/prepare-upload-recovery-operator.py'),
                           '--private-dir',str(private)],capture_output=True,text=True,check=True)
    metadata=json.loads(result.stdout)
    operator=Path(metadata['operatorFile']);configuration=Path(metadata['workerConfigFile'])
    secret=json.loads(operator.read_text())['CAPABILITY']
    assert secret not in result.stdout and secret not in configuration.read_text()
    assert hashlib.sha256(secret.encode()).hexdigest() in configuration.read_text()
    assert 0<metadata['expiresAt']-time.time()<=2700
    assert operator.stat().st_mode&0o777==configuration.stat().st_mode&0o777==0o600
    assert private.stat().st_mode&0o777==0o700
