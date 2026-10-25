import pytest
from lessonos.study.portable import export_notebook,inspect_notebook
from lessonos.study.submissions import submit
from test_identity_store import setup_store


def test_export_is_scoped_and_integrity_checked_with_visible_omissions(tmp_path):
    store,tutor,student,peer,*_=setup_store(tmp_path)
    source=store.create_resource(student,'fluidi','notes','Private student source')
    store.create_resource(peer,'fluidi','notes','PEER-SECRET')
    submit(store,student,'fluidi','poiseuille-v1',[],'student answer','submit')
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    assert 'PEER-SECRET' not in str(bundle)
    assert bundle['format']=='ardesia-study-notebook-v1'
    assert bundle['omissions'] and bundle['resources'][0]['id']==source['id']
    inspected=inspect_notebook(bundle)
    assert inspected['resources']==2 and inspected['submissions']==1
    bundle['resources'][0]['text']='tampered'
    with pytest.raises(ValueError):inspect_notebook(bundle)
