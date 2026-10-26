"""S18 typed sources on Study Core resources/assets. No new schema or authority."""
import base64
from io import BytesIO
import json
import math
import re
from ..models import StudyError
from ..store import canonical, digest, identifier
from ..blobs import repository
from ..assets import upload_asset
from ..transactions import execute_command

COORDINATES = 'pdf-normalized-unrotated-top-left-v1'
TEXT_MODEL = 'native-pdfjs-items-concat-utf16-v1'
SHA = re.compile(r'[a-f0-9]{64}')

def fail(code='invalid_living_source', status=400):
    raise StudyError(code, status)

def string(v, limit=200, blank=False):
    if not isinstance(v, str) or len(v)>limit or '\x00' in v or (not blank and not v.strip()): fail()
    try: v.encode('utf8')
    except UnicodeError: fail()
    return v

def fields(v, required, optional=()):
    if not isinstance(v,dict) or not set(required)<=set(v) or set(v)-set(required)-set(optional): fail()
    return v

def original_for(store, resource, document, blob_dir):
    """Resource ACL already passed. Only its owner's bound immutable upload is shared."""
    row=store.connection.execute('SELECT * FROM study_assets WHERE id=? AND deleted=0',(document['assetId'],)).fetchone()
    if row is None: fail('source_original_unavailable',404)
    if (row['owner_id']!=resource['ownerId'] or row['edition_id']!=resource['editionId']
            or row['sha256']!=document['sha256'] or row['mime']!='application/pdf'): fail('source_original_mismatch',409)
    try: data=repository(store,blob_dir).get(row['blob_ref'])
    except OSError: fail('source_original_unavailable',503)
    if len(data)!=row['bytes'] or digest(data)!=row['sha256']: fail('asset_integrity_failure',503)
    return data, {'id':row['id'],'editionId':row['edition_id'],'kind':'immutable-upload','mime':row['mime'],
                  'bytes':row['bytes'],'sha256':row['sha256'],'extractionStatus':row['extraction_status']}

def document_value(v):
    fields(v,['assetId','sha256','title','version'],['pageCount','coordinates','origin'])
    string(v['assetId'],64); string(v['title']); string(v['version'],80)
    if not isinstance(v['sha256'],str) or not SHA.fullmatch(v['sha256']): fail()
    if 'origin' in v: reference(v['origin'])
    return {k:v[k] for k in ['assetId','sha256','title','version']} | ({'origin':v['origin']} if 'origin' in v else {})

def decode(resource,kind):
    if resource['kind']!=kind: fail('source_kind_mismatch')
    try: value=json.loads(resource['text'])
    except (ValueError,TypeError): fail()
    return value

def read_source(store,principal,rid,revision,blob_dir):
    resource=store.get_resource_revision(principal,rid,revision)
    raw=decode(resource,'living-source'); doc=document_value(raw)
    data,_=original_for(store,resource,doc,blob_dir)
    from pypdf import PdfReader
    try: count=len(PdfReader(BytesIO(data),strict=True).pages)
    except Exception: fail('asset_integrity_failure',503)
    if type(raw.get('pageCount')) is not int or not 1<=count<=20 or raw['pageCount']!=count or raw.get('coordinates')!=COORDINATES: fail()
    return {**resource,'document':{**doc,'pageCount':count,'coordinates':COORDINATES}}

def read_original(store,principal,rid,revision,blob_dir):
    source=read_source(store,principal,rid,revision,blob_dir)
    return original_for(store,source,source['document'],blob_dir)

def write(store,principal,edition,kind,value,visibility,key,authorize,*,resource_id=None,expected_revision=None):
    """One existing ledger transaction, CAS and replay under current authorization."""
    text=canonical(value)
    if len(text)>20000: fail('source_text_too_large',413)
    store._edition_access(principal,edition)
    if visibility not in ('private','group') or visibility=='group' and principal.role!='teacher': fail('forbidden',403)
    def check(c):
        store._edition_access(principal,edition)
        if resource_id:
            store.lock_aggregate(c,'resource',resource_id)
            r=store.get_resource(principal,resource_id)
            if r['ownerId']!=principal.id or r['editionId']!=edition or r['kind']!=kind or r['visibility']!=visibility: fail('forbidden',403)
        authorize()
    def apply(c):
        rid,rev=resource_id or identifier(),identifier()
        if resource_id:
            current=c.execute('SELECT current_revision FROM study_resources WHERE id=? AND deleted=0',(rid,)).fetchone()
            if current is None or current[0]!=expected_revision: fail('stale_revision',409)
            c.execute('UPDATE study_resources SET current_revision=? WHERE id=? AND current_revision=?',(rev,rid,expected_revision))
            from ..context import _invalidate_projection
            _invalidate_projection(c,rid)
        else:
            c.execute('INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)',
                      (rid,edition,principal.id,kind,visibility,identifier(),rev))
        c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)',(rev,rid,text,digest(text),store.clock()))
        store._event(c,principal,kind+'.saved',rid,{'revisionId':rev})
        return store.get_resource_revision(principal,rid,rev)
    r=execute_command(store,principal,kind+'.saved',key,{'editionId':edition,'value':value,'visibility':visibility,
        'resourceId':resource_id,'expectedRevision':expected_revision},apply,before_lookup=check)
    # A saved receipt cannot resurrect an erased resource.
    store.get_resource_revision(principal,r['id'],r['revisionId'])
    return r

def save_source(store,principal,edition,document,visibility,key,blob_dir,*,resource_id=None,expected_revision=None):
    doc=document_value(document)
    identity={'ownerId':principal.id,'editionId':edition}
    data,_=original_for(store,identity,doc,blob_dir)
    from pypdf import PdfReader
    try: pages=len(PdfReader(BytesIO(data),strict=True).pages)
    except Exception: fail('asset_integrity_failure',503)
    if not 1<=pages<=20: fail()
    doc={**doc,'pageCount':pages,'coordinates':COORDINATES}
    r=write(store,principal,edition,'living-source',doc,visibility,key,
        lambda: original_for(store,identity,doc,blob_dir),resource_id=resource_id,expected_revision=expected_revision)
    return read_source(store,principal,r['id'],r['revisionId'],blob_dir)

def reference(v):
    fields(v,['resourceId','revisionId','contextId'])
    for x in v.values(): string(x,128)
    return v

def validate_target(v,source):
    fields(v,['resourceId','revisionId','contextId','documentSha256','page','rects','text'])
    if any(v[k]!=source[{'resourceId':'id'}.get(k,k)] for k in ['resourceId','revisionId','contextId']): fail('source_identity_mismatch',409)
    if v['documentSha256']!=source['document']['sha256']: fail('source_original_mismatch',409)
    if type(v['page']) is not int or not 1<=v['page']<=source['document']['pageCount']: fail()
    if not isinstance(v['rects'],list) or not 1<=len(v['rects'])<=50: fail()
    for r in v['rects']:
        if not isinstance(r,list) or len(r)!=4 or any(type(n) not in (int,float) or not math.isfinite(n) or not 0<=n<=1 for n in r): fail()
        x,y,w,h=r
        if w<=0 or h<=0 or x+w>1+1e-9 or y+h>1+1e-9: fail()
    if v['text'] is not None:
        t=fields(v['text'],['model','start','end','exact','prefix','suffix'])
        if t['model']!=TEXT_MODEL or type(t['start']) is not int or type(t['end']) is not int or not 0<=t['start']<t['end']<=400000: fail()
        string(t['exact'],5000);string(t['prefix'],80,True);string(t['suffix'],80,True)
        if len(t['exact'].encode('utf-16-le'))//2!=t['end']-t['start']: fail()
    return v

def annotation_value(v):
    fields(v,['target','blocks','lesson'],['origin','resume'])
    if not isinstance(v['target'],dict): fail()
    if not isinstance(v['blocks'],list) or not 1<=len(v['blocks'])<=30: fail()
    for block in v['blocks']:
        fields(block,['kind','text'])
        if block['kind'] not in ['explanation','formula','exercise']: fail()
        string(block['text'],5000)
    if v['lesson'] is not None:
        fields(v['lesson'],['lessonId','activityId'])
        string(v['lesson']['lessonId'],128);string(v['lesson']['activityId'],128)
    if 'origin' in v: reference(v['origin'])
    if 'resume' in v:
        fields(v['resume'],['scale','left','top'])
        for k,limit in [('scale',5),('left',100000),('top',100000)]:
            n=v['resume'][k]
            if type(n) not in (int,float) or not math.isfinite(n) or n<0 or n>limit: fail()
        if v['resume']['scale']<.1: fail()
    return v

def source_for_annotation(store,principal,edition,v,visibility,blob_dir):
    t=v['target']; fields(t,['resourceId','revisionId','contextId','documentSha256','page','rects','text'])
    reference({k:t[k] for k in ['resourceId','revisionId','contextId']})
    source=read_source(store,principal,t['resourceId'],t['revisionId'],blob_dir)
    if source['editionId']!=edition or visibility=='group' and source['visibility']!='group': fail('forbidden',403)
    validate_target(t,source)
    return source

def save_annotation(store,principal,edition,value,visibility,key,blob_dir,*,resource_id=None,expected_revision=None):
    value=json.loads(canonical(annotation_value(value)))
    def authorize(): source_for_annotation(store,principal,edition,value,visibility,blob_dir)
    r=write(store,principal,edition,'living-annotation',value,visibility,key,authorize,resource_id=resource_id,expected_revision=expected_revision)
    return read_annotation(store,principal,r['id'],r['revisionId'],blob_dir)

def read_annotation(store,principal,rid,revision,blob_dir):
    r=store.get_resource_revision(principal,rid,revision)
    value=annotation_value(decode(r,'living-annotation'))
    source_for_annotation(store,principal,r['editionId'],value,r['visibility'],blob_dir)
    return {**r,'annotation':value}

def export_bundle(store,principal,rid,revision,blob_dir):
    r=read_annotation(store,principal,rid,revision,blob_dir);t=r['annotation']['target']
    source=read_source(store,principal,t['resourceId'],t['revisionId'],blob_dir)
    data,descriptor=read_original(store,principal,source['id'],source['revisionId'],blob_dir)
    return {'format':'ardesia-living-source-v1','source':source,'annotation':r,
            'original':{**descriptor,'base64':base64.b64encode(data).decode('ascii')}}

def import_bundle(store,principal,edition,bundle,key,blob_dir):
    """Explicit portable copy: preserve provenance, mint private local identities; no imported ACL."""
    fields(bundle,['format','source','annotation','original'])
    if bundle['format']!='ardesia-living-source-v1': fail()
    if len(canonical(bundle))>30*1024*1024: fail('source_bundle_too_large',413)
    doc=document_value(bundle['source']['document'])
    if 'base64' in bundle['original']:
        # Domain helper also accepts a complete local portable artifact.
        try: data=base64.b64decode(bundle['original']['base64'],validate=True)
        except (ValueError,KeyError,TypeError): fail()
        if digest(data)!=doc['sha256']: fail('source_original_mismatch',409)
        asset=upload_asset(store,principal,edition,data,'application/pdf',blob_dir,key=key+':pdf')
    else:
        # HTTP imports use the existing admitted binary upload and a small manifest.
        asset_id=string(bundle['original'].get('assetId'),64)
        original_for(store,{'ownerId':principal.id,'editionId':edition},{'assetId':asset_id,'sha256':doc['sha256']},blob_dir)
        asset={'id':asset_id}
    if bundle['original'].get('sha256')!=doc['sha256']: fail('source_original_mismatch',409)
    old=bundle['annotation']; value=annotation_value(old['annotation'])
    validate_target(value['target'],bundle['source'])
    origin={k:bundle['source'][{'resourceId':'id'}.get(k,k)] for k in ['resourceId','revisionId','contextId']}
    source=save_source(store,principal,edition,{**doc,'assetId':asset['id'],'origin':origin},'private',key+':source',blob_dir)
    target={**value['target'],'resourceId':source['id'],'revisionId':source['revisionId'],'contextId':source['contextId']}
    imported={**value,'target':target,'origin':{k:old[{'resourceId':'id'}.get(k,k)] for k in ['resourceId','revisionId','contextId']}}
    return save_annotation(store,principal,edition,imported,'private',key+':annotation',blob_dir)
