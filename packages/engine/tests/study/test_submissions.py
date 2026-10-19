from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import pytest
from PIL import Image
from pypdf import PdfWriter
from lessonos.study.assets import upload_asset, read_asset
from lessonos.study.submissions import submit, get_receipt, list_submissions
from lessonos.study.models import StudyError
from test_identity_store import setup_store


def png():
    stream=BytesIO();Image.new('RGB',(24,24),'white').save(stream,format='PNG');return stream.getvalue()


def test_private_image_pdf_and_original_bytes_survive_reopen(tmp_path):
    from lessonos.study.store import StudyStore
    store,tutor,first,peer,other=setup_store(tmp_path)
    image=upload_asset(store,first,'fluidi',png(),'image/png',tmp_path/'blobs')
    pdf=BytesIO();writer=PdfWriter();writer.add_blank_page(width=100,height=100);writer.write(pdf)
    document=upload_asset(store,first,'fluidi',pdf.getvalue(),'application/pdf',tmp_path/'blobs')
    reopened=StudyStore(store.path)
    assert read_asset(reopened,first,image['id'],tmp_path/'blobs')[0]==png()
    for principal in (peer,other):
        with pytest.raises(StudyError,match='forbidden'):read_asset(reopened,principal,image['id'],tmp_path/'blobs')
    assert document['nativeText']=='' and document['extractionStatus']=='needs_clarification'


def test_retry_after_commit_returns_one_receipt_and_one_event(tmp_path):
    store,tutor,first,*_=setup_store(tmp_path)
    first_result=submit(store,first,'fluidi','poiseuille-v1',[],'Q cresce di 5,0625','key')
    assert submit(store,first,'fluidi','poiseuille-v1',[],'Q cresce di 5,0625','key')==first_result
    assert get_receipt(store,first,first_result['receiptId'])==first_result
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='submission.received'").fetchone()[0]==1
    with pytest.raises(StudyError,match='idempotency_conflict'):submit(store,first,'fluidi','poiseuille-v1',[],'different','key')


def test_peer_asset_rejected_and_private_submission_is_not_listed(tmp_path):
    store,tutor,first,peer,*_=setup_store(tmp_path)
    asset=upload_asset(store,first,'fluidi',png(),'image/png',tmp_path/'blobs')
    with pytest.raises(StudyError,match='forbidden'):submit(store,peer,'fluidi','poiseuille-v1',[asset['id']],'text','key')
    receipt=submit(store,first,'fluidi','poiseuille-v1',[asset['id']],'text','key')
    assert list_submissions(store,peer,'fluidi')==[]
    assert len(list_submissions(store,tutor,'fluidi'))==1
    with pytest.raises(StudyError,match='forbidden'):get_receipt(store,peer,receipt['receiptId'])


@pytest.mark.parametrize('data,mime',[(b'fake png','image/png'),(b'%PDF-garbage','application/pdf'),(b'<svg/>','image/svg+xml'),(b'MZexe','image/jpeg'),(b'x'*(10*1024*1024+1),'image/png')])
def test_malformed_or_oversize_upload_is_not_accepted(tmp_path,data,mime):
    store,tutor,first,*_=setup_store(tmp_path)
    with pytest.raises(StudyError):upload_asset(store,first,'fluidi',data,mime,tmp_path/'blobs')
    assert store.connection.execute('SELECT COUNT(*) FROM study_assets').fetchone()[0]==0


def test_failure_before_commit_never_returns_receipt(tmp_path):
    store,tutor,first,*_=setup_store(tmp_path)
    store.connection.execute("CREATE TRIGGER fail_commit BEFORE INSERT ON study_receipts BEGIN SELECT RAISE(ABORT,'synthetic storage full'); END")
    store.connection.commit()
    with pytest.raises(Exception):submit(store,first,'fluidi','poiseuille-v1',[],'text','key')
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='submission.received'").fetchone()[0]==0


def test_ten_concurrent_submissions_have_distinct_authority_and_receipts(tmp_path):
    from lessonos.study.store import StudyStore
    store,tutor,*_=setup_store(tmp_path)
    students=[store.create_principal(f'load-{i}','student') for i in range(10)]
    store.create_edition(tutor,'load')
    for student in students:store.add_test_member(tutor,'load',student.id)
    def send(student):
        db=StudyStore(store.path)
        try:return submit(db,student,'load','poiseuille-v1',[],student.id,'same-key')
        finally:db.close()
    with ThreadPoolExecutor(10) as pool:receipts=list(pool.map(send,students))
    assert len({r['receiptId'] for r in receipts})==10
    rows=store.connection.execute('SELECT student_id,text FROM study_submissions').fetchall()
    assert len(rows)==10 and all(row['student_id']==row['text'] for row in rows)
