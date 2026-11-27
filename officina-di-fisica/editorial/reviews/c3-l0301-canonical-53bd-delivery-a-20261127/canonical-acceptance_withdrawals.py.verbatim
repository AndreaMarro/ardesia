"""Explicit withdrawals within the existing corpus acceptance pipeline.

A changed edition or runtime never closes a withdrawal. Closure pins a current
positive scientific report, but ordinary fresh scientific validation still runs.
"""
from datetime import datetime
import json
from pathlib import Path,PurePosixPath
from jsonschema import Draft202012Validator,FormatChecker,ValidationError
from .pipeline import digest,sha
from .runtime_fingerprint import runtime_fingerprint

CONTRACT=Path(__file__).resolve().parents[2]/'contracts/corpus-acceptance-withdrawals-v1.schema.json'



def _json(raw,label):
    def unique(pairs):
        result={}
        for key,value in pairs:
            if key in result:raise ValueError('Duplicate acceptance field: '+key)
            result[key]=value
        return result
    try:return json.loads(raw,object_pairs_hook=unique)
    except (ValueError,TypeError,UnicodeDecodeError) as error:raise ValueError('Invalid acceptance '+label) from error


def _pinned_file(app,reference):
    schema=_json(CONTRACT.read_bytes(),'contract')
    reference_schema={'$ref':'#/$defs/file','$defs':schema['$defs']}
    try:Draft202012Validator(reference_schema).validate(reference)
    except ValidationError as error:raise ValueError('Invalid acceptance file reference') from error
    name=reference['path'];relative=PurePosixPath(name);root=app.resolve()
    if relative.is_absolute() or any(p in ('.','..') for p in relative.parts) or str(relative)!=name:
        raise ValueError('Acceptance file must remain inside APP')
    file=root/relative
    try:
        resolved=file.resolve(strict=True)
        if not resolved.is_relative_to(root) or not resolved.is_file():raise ValueError('Acceptance file outside APP or not a regular file')
        raw=resolved.read_bytes()
    except OSError as error:raise ValueError('Missing or unreadable acceptance file: '+name) from error
    if sha(raw)!=reference['sha256']:raise ValueError('Acceptance file checksum mismatch: '+name)
    return raw


def load_ledger(app,registry=None):
    """No configuration means no new fields or change to historic evidence."""
    app=Path(app)
    if registry is None:
        try:registry=_json((app/'editorial/batches/registry.json').read_bytes(),'registry')
        except OSError as error:raise ValueError('Missing acceptance registry') from error
    if not isinstance(registry,dict):raise ValueError('Invalid acceptance registry object')
    if 'acceptanceWithdrawals' not in registry:return None
    reference=registry['acceptanceWithdrawals'];raw=_pinned_file(app,reference)
    ledger=_json(raw,'withdrawal ledger')
    try:Draft202012Validator(_json(CONTRACT.read_bytes(),'contract'),format_checker=FormatChecker()).validate(ledger)
    except ValidationError as error:raise ValueError('Invalid acceptance withdrawal ledger: '+error.message) from error
    seen=set()
    for row in ledger['withdrawals']:
        if row['withdrawalId'] in seen:raise ValueError('Duplicate acceptance withdrawal identity')
        seen.add(row['withdrawalId']);_pinned_file(app,row['evidence'])
        closure=row.get('closure')
        if closure:
            if (closure['recordId']!=row['recordId'] or closure['batchId']!=row['batchId']
                or datetime.fromisoformat(closure['closedAt'])<datetime.fromisoformat(row['withdrawnAt'])):
                raise ValueError('Acceptance closure has wrong identity or precedes withdrawal')
    return {'ledger':dict(reference),'contractSha256':sha(CONTRACT.read_bytes()),'schemaVersion':ledger['schemaVersion'],'withdrawals':ledger['withdrawals']}


def acceptance_audit(spec,record_ids,app):
    """Reject an open ID before scientific approval; verify explicit closures."""
    loaded=load_ledger(app)
    if loaded is None:return None
    selected=[r for r in loaded['withdrawals'] if r['recordId'] in record_ids]
    if not selected:return None
    result=[];runtime=None
    for row in selected:
        closure=row.get('closure')
        if closure is None:raise ValueError('Acceptance withdrawn: '+row['recordId']+' ('+row['withdrawalId']+')')
        if row['batchId']!=spec['id']:raise ValueError('Acceptance closure belongs to a different batch: '+row['recordId'])
        expected='editorial/reviews/'+spec['id']+'.json'
        if closure['scientificReport']['path']!=expected:raise ValueError('Acceptance closure requires the same batch scientific report')
        if runtime is None:runtime=runtime_fingerprint(app)['sha256']
        if closure['runtimeSha256']!=runtime:raise ValueError('Acceptance closure runtime is stale')
        report=_json(_pinned_file(app,closure['scientificReport']),'positive scientific report')
        if not isinstance(report,dict):raise ValueError('Invalid acceptance scientific report object')
        records=report.get('records')
        if not isinstance(records,list):raise ValueError('Acceptance closure has no scientific records')
        matches=[r for r in records if isinstance(r,dict) and r.get('id')==row['recordId']]
        if len(matches)!=1 or matches[0].get('ok') is not True:raise ValueError('Acceptance closure requires a positive report for the same ID')
        withdrawal={k:v for k,v in row.items() if k!='closure'}
        result.append({**withdrawal,'withdrawalSha256':digest(withdrawal),'closure':closure,'closureSha256':digest(closure)})
    return {'schemaVersion':'1.0.0','ledger':loaded['ledger'],'contractSha256':loaded['contractSha256'],'withdrawals':result,'humanApproval':'NOT_RUN','publicationAction':'NONE'}


def assert_unchanged_acceptance(before,spec,record_ids,app):
    # Fresh scientific identity is checked by the caller before this final read.
    if acceptance_audit(spec,record_ids,app)!=before:raise ValueError('Acceptance withdrawal evidence changed during validation')


def attach_withdrawal_audit(entry,batch,result):
    """Preserve immutable withdrawal and closure provenance in compiled evidence."""
    audit=batch.get('acceptanceWithdrawals')
    if audit:
        selected=[r for r in audit['withdrawals'] if r['recordId']==result['id']]
        if selected:entry['evidence'][0]['acceptanceWithdrawals']={**audit,'withdrawals':selected}
