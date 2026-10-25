"""One compact UTF-8 budget for export and portable inspection, no data truncation."""
import io
import pytest
from pypdf import PdfWriter
from lessonos.study import portable
from lessonos.study.assets import upload_asset
from lessonos.study.context import revise_resource
from lessonos.study.models import StudyError
from lessonos.study.store import canonical, digest
from lessonos.study.submissions import submit
from test_identity_store import setup_store


def notebook(padding=''):
    value={'format':'ardesia-study-notebook-v1','schemaVersion':1,'resources':[],
           'resourceRevisions':[],'submissions':[],'assets':[],'layout':[],'omissions':[],
           'padding':padding}
    value['sha256']=digest(canonical(value))
    return value


def test_inspect_exact_compact_utf8_boundary_and_one_byte_over(monkeypatch):
    value=notebook('é🧪')
    encoded=canonical(value).encode('utf-8')
    # A small budget exercises the exact algorithm without allocating96MiB per edge test.
    monkeypatch.setattr(portable,'MAX_ENCODED_BYTES',len(encoded),raising=False)
    assert portable.inspect_notebook(value)['valid'] is True
    monkeypatch.setattr(portable,'MAX_ENCODED_BYTES',len(encoded)-1)
    with pytest.raises(StudyError,match='notebook_budget_exceeded') as error:
        portable.inspect_notebook(value)
    assert error.value.status==413


def test_real96mib_inspection_boundary_is_inclusive_and_next_byte_is_refused():
    empty=notebook()
    padding_bytes=96*1024*1024-len(canonical(empty).encode('utf-8'))
    value=notebook('x'*padding_bytes)
    assert len(canonical(value).encode('utf-8'))==96*1024*1024
    assert portable.inspect_notebook(value)['valid'] is True
    value['padding']+='x'
    with pytest.raises(StudyError,match='notebook_budget_exceeded') as error:
        portable.inspect_notebook(value)
    assert error.value.status==413


def test_encoded_refusal_precedes_attachment_decode(monkeypatch):
    value=notebook()
    value['assets']=[{'base64':'not-valid-base64'}]
    monkeypatch.setattr(portable,'MAX_ENCODED_BYTES',1)
    monkeypatch.setattr(portable.base64,'b64decode',lambda *args,**kwargs:pytest.fail('must refuse before decoding'))
    with pytest.raises(StudyError,match='notebook_budget_exceeded'):
        portable.inspect_notebook(value)


@pytest.fixture(scope='module')
def oversized_store(tmp_path_factory):
    directory=tmp_path_factory.mktemp('notebook-450-snapshots')
    store,tutor,student,*_=setup_store(directory)
    sources=[store.create_resource(student,'fluidi','notes','🧪'*19990+' v0 source') for _ in range(90)]
    first=sources[0]
    assets=[]
    for mib in (19,19,11):
        writer=PdfWriter();writer.add_blank_page(width=10,height=10)
        writer.add_metadata({'/Padding':'x'*(mib*1024*1024-2048)})
        stream=io.BytesIO();writer.write(stream)
        assets.append(upload_asset(store,student,'fluidi',stream.getvalue(),'application/pdf',directory/'blobs'))
    assert sum(asset['bytes'] for asset in assets)<50*1024*1024
    for round_no in range(5):
        for offset in range(0,90,5):
            submit(store,student,'fluidi','poiseuille-v1',
                   [a['id'] for a in assets] if round_no==0 and offset==0 else [],
                   'Synthetic encoded-budget witness',f'round-{round_no}-group-{offset}',
                   source_refs=[{'resourceId':r['id'],'revisionId':r['revisionId']} for r in sources[offset:offset+5]])
        sources=[revise_resource(store,student,r['id'],r['revisionId'],'🧪'*19990+f' v{round_no+1} source') for r in sources]
    yield store,tutor,student,directory,first,sources[0]
    store.close()


@pytest.mark.parametrize('role',['student','tutor'])
def test_export_refuses_legal450_snapshot_49mib_fixture_without_dropping_pins(oversized_store,role):
    store,tutor,student,directory,first,head=oversized_store
    actor=tutor if role=='tutor' else student
    with pytest.raises(StudyError,match='notebook_budget_exceeded') as error:
        portable.export_notebook(store,actor,'fluidi',directory/'blobs')
    assert error.value.status==413
    # Refusal is a read-only outcome: exact submitted history and private head remain intact.
    assert store.get_resource_revision(tutor,first['id'],first['revisionId'])['text']==first['text']
    assert store.get_resource(student,head['id'])['revisionId']==head['revisionId']
    with pytest.raises(StudyError,match='forbidden'):
        store.get_resource(tutor,head['id'])
