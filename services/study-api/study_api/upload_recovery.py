"""Private CLI transport for the pinned, expiring upload recovery worker.

No app factory or browser route imports this operator identity. Neither a
service key nor a database credential is accepted in this configuration.
"""
import json
import os
from pathlib import Path
import re
import stat
import urllib.error
import urllib.request

from lessonos.study.models import StudyError

URL = 'https://gavfmrynhsdxdqbmdkxq.supabase.co/functions/v1/closure1-upload-recovery'
MAX_LIMIT = 100


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


class RemoteUploadRecovery:
    _administrative = True

    def __init__(self, configuration):
        if (not isinstance(configuration,dict) or set(configuration) != {'URL','CAPABILITY'}
                or configuration['URL'] != URL or not isinstance(configuration['CAPABILITY'],str)
                or not re.fullmatch(r'[a-f0-9]{64}',configuration['CAPABILITY'])):
            raise ValueError('invalid_upload_recovery_configuration')
        self._capability=configuration['CAPABILITY']
        self._opener=urllib.request.build_opener(_NoRedirect())

    @classmethod
    def from_file(cls,path:Path):
        info=path.stat()
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
            raise ValueError('private_upload_recovery_file_required')
        return cls(json.loads(path.read_text()))

    def _request(self,payload):
        request=urllib.request.Request(URL,method='POST',data=json.dumps(payload).encode(),headers={
            'Authorization':'Bearer '+self._capability,'Content-Type':'application/json'})
        try:
            with self._opener.open(request,timeout=30) as response:
                raw=response.read(16385)
                if len(raw)>16384:raise ValueError()
                return json.loads(raw)
        except urllib.error.HTTPError as error:
            if error.code in (401,403):raise StudyError('upload_recovery_denied',403) from None
            raise StudyError('upload_recovery_unavailable',503) from None
        except (OSError,ValueError,TypeError):
            raise StudyError('upload_recovery_unavailable',503) from None

    def upload_recovery_candidates(self,limit):
        if type(limit) is not int or not 1<=limit<=MAX_LIMIT:
            raise StudyError('invalid_recovery_limit')
        body=self._request({'action':'candidates','limit':limit})
        if (not isinstance(body,dict) or set(body)!={'ids'} or not isinstance(body['ids'],list)
                or len(body['ids'])>limit or any(not isinstance(value,str) or not re.fullmatch(r'[a-f0-9]{32}',value) for value in body['ids'])
                or len(set(body['ids']))!=len(body['ids'])):
            raise StudyError('upload_recovery_unavailable',503)
        return [{'id':value} for value in body['ids']]

    def recover_upload_intent(self,asset_id):
        if not isinstance(asset_id,str) or not re.fullmatch(r'[a-f0-9]{32}',asset_id):
            raise StudyError('invalid_upload_recovery_id')
        body=self._request({'action':'recover','id':asset_id})
        if not isinstance(body,dict) or set(body)!={'outcome'} or body['outcome'] not in ('cleaned','skipped'):
            raise StudyError('upload_recovery_unavailable',503)
        return body['outcome']=='cleaned'
