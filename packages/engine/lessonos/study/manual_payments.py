"""Append-only manual test annotations, never a verified payment/provider ledger."""
import json
import unicodedata
from .admin_ledger import CommercialAccess, command, member, revision, reason_text, record_id, page, cursor, MAX_REVISION, read_snapshot, bounded_text, student_identifier
from .models import StudyError
from .store import canonical, identifier


def _amount(value):
    if type(value) is not int or not 1<=value<=1_000_000:raise StudyError('invalid_manual_amount')
    return value


def _reference(value):
    if not bounded_text(value,1,128):raise StudyError('invalid_manual_reference')
    normalized=unicodedata.normalize('NFC',value.strip())
    if not 1<=len(normalized)<=128:raise StudyError('invalid_manual_reference')
    return normalized


def _dto(row):
    snapshot=read_snapshot(row['offer_snapshot'],('priceMinor','currency','managementRevision','editionState','mode'))
    return {'recordId':row['id'],'entryId':row['entry_id'],'editionId':row['edition_id'],'studentId':row['student_id'],
        'revision':row['revision'],'supersedesRecordId':row['supersedes_record_id'],'status':row['status'],
        'amountMinor':row['amount_minor'],'currency':row['currency'],'externalReference':row['external_reference'],
        'recordedBy':row['recorded_by'],'recordedAt':row['recorded_at'],'reason':row['reason'],
        'offerSnapshot':snapshot,'priceDiscrepancy':row['amount_minor']!=snapshot['priceMinor'],
        'receiptId':row['receipt_id'],'mode':'test','verification':'MANUAL_DECLARATION_ONLY'}


def _insert(c,principal,edition_id,student_id,rid,entry_id,rev,target,status,amount,reference,reference_key,snapshot,reason,now):
    receipt=identifier()
    c.execute('''INSERT INTO study_manual_payment_records(id,entry_id,edition_id,student_id,revision,supersedes_record_id,
        previous_revision,status,amount_minor,currency,external_reference,external_reference_key,recorded_by,recorded_at,reason,offer_snapshot,receipt_id)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (rid,entry_id,edition_id,student_id,rev,target,rev-1,status,amount,'EUR',reference,reference_key,principal.id,now,reason,snapshot,receipt))
    return {'receiptId':receipt,'recordId':rid,'entryId':entry_id,'editionId':edition_id,'revision':rev,'status':status,'mode':'test'}


def record(store,principal,edition_id,key,*,student_id,amount_minor,currency,external_reference):
    _amount(amount_minor);reference_key=_reference(external_reference);student_identifier(student_id)
    if currency!='EUR':raise StudyError('invalid_manual_currency')
    def apply(c):
        edition=CommercialAccess.require_owner(store,principal,edition_id,c)
        member(c,edition_id,student_id)
        # The reference namespace spans this owner's editions. The second lock
        # plus the partial unique index serialize cross-edition duplicate keys.
        store.lock_aggregate(c,'manual.reference',[principal.id,reference_key])
        if c.execute('SELECT id FROM study_manual_payment_records WHERE recorded_by=? AND external_reference_key=? AND revision=1',
                     (principal.id,reference_key)).fetchone():raise StudyError('duplicate_reference',409)
        snapshot=canonical({'priceMinor':edition['price_minor'],'currency':'EUR','managementRevision':edition['management_revision'],
                            'editionState':edition['state'],'mode':'test'})
        rid=identifier()
        return _insert(c,principal,edition_id,student_id,rid,rid,1,None,'RECORDED_MANUALLY',amount_minor,
                       external_reference,reference_key,snapshot,'',store.clock())
    return command(store,principal,edition_id,'admin.manual-payment.recorded',key,
        {'editionId':edition_id,'studentId':student_id,'amountMinor':amount_minor,'currency':currency,
         'externalReference':external_reference},apply,CommercialAccess)


def correct(store,principal,edition_id,entry_id,key,*,expected_revision,target_record_id,status,reason,amount_minor=None):
    revision(expected_revision);record_id(entry_id);record_id(target_record_id);reason_text(reason,required=True)
    if expected_revision<1:raise StudyError('invalid_revision')
    if status not in ('RECORDED_MANUALLY','VOIDED'):raise StudyError('invalid_manual_status')
    if status=='RECORDED_MANUALLY':_amount(amount_minor)
    elif amount_minor is not None:raise StudyError('void_amount_not_allowed')
    def apply(c):
        previous=c.execute('SELECT * FROM study_manual_payment_records WHERE edition_id=? AND entry_id=? ORDER BY revision DESC LIMIT 1',
                           (edition_id,entry_id)).fetchone()
        if not previous or previous['revision']!=expected_revision or previous['id']!=target_record_id:raise StudyError('stale_admin_record',409)
        if expected_revision>=MAX_REVISION:raise StudyError('record_revision_exhausted',409)
        return _insert(c,principal,edition_id,previous['student_id'],identifier(),entry_id,expected_revision+1,target_record_id,
            status,previous['amount_minor'] if status=='VOIDED' else amount_minor,previous['external_reference'],
            previous['external_reference_key'],previous['offer_snapshot'],reason,store.clock())
    return command(store,principal,edition_id,'admin.manual-payment.revised',key,
        {'editionId':edition_id,'entryId':entry_id,'expectedRevision':expected_revision,'targetRecordId':target_record_id,
         'status':status,'amountMinor':amount_minor,'reason':reason},apply,CommercialAccess)


def listing(store,principal,edition_id,*,limit=20,after=None):
    CommercialAccess.require_owner(store,principal,edition_id,store.connection)
    position=page(limit,after,'payments',[edition_id])
    # One statement gives page and aggregate the same SQLite/PostgreSQL read
    # snapshot. Only the bounded page selects snapshots/JSON; heads are scalars.
    result=store.connection.execute('''WITH heads AS (
        SELECT r.id,r.entry_id,r.status,r.amount_minor FROM study_manual_payment_records r
        WHERE r.edition_id=? AND NOT EXISTS (SELECT 1 FROM study_manual_payment_records n
          WHERE n.entry_id=r.entry_id AND n.revision>r.revision)
        ), summary AS (
        SELECT COALESCE(SUM(CASE WHEN status='RECORDED_MANUALLY' THEN amount_minor ELSE 0 END),0) AS total,
          COALESCE(SUM(CASE WHEN status='RECORDED_MANUALLY' THEN 1 ELSE 0 END),0) AS recorded,
          COALESCE(SUM(CASE WHEN status='VOIDED' THEN 1 ELSE 0 END),0) AS voided FROM heads
        ), bounded_page AS (
        SELECT r.* FROM study_manual_payment_records r JOIN heads h ON h.id=r.id
        WHERE h.entry_id>? ORDER BY h.entry_id LIMIT ?
        ) SELECT p.*,s.total,s.recorded,s.voided FROM summary s
        LEFT JOIN bounded_page p ON 1=1 ORDER BY p.entry_id''',(edition_id,position or '',limit+1)).fetchall()
    summary=result[0]
    rows=[row for row in result if row['id'] is not None]
    items=[_dto(row) for row in rows[:limit]]
    return {'items':items,'nextCursor':cursor('payments',[edition_id],items[-1]['entryId']) if len(rows)>limit else None,
        'summary':{'totalMinor':summary['total'],'recordedCount':summary['recorded'],'voidedCount':summary['voided'],
                   'currency':'EUR','mode':'test','verification':'MANUAL_DECLARATIONS_ONLY'}}


def history(store,principal,edition_id,entry_id,*,limit=20,after=None):
    CommercialAccess.require_owner(store,principal,edition_id,store.connection)
    record_id(entry_id);scope=[edition_id,entry_id];position=page(limit,after,'payment-history',scope)
    rows=store.connection.execute('''SELECT * FROM study_manual_payment_records WHERE edition_id=? AND entry_id=?
        AND revision<? ORDER BY revision DESC LIMIT ?''',(edition_id,entry_id,position or MAX_REVISION+1,limit+1)).fetchall()
    items=[_dto(row) for row in rows[:limit]]
    return {'items':items,'nextCursor':cursor('payment-history',scope,items[-1]['revision']) if len(rows)>limit else None}
