"""Owner-only manual registers over the same authenticated request store."""
from typing import Annotated,Literal
from itertools import chain
import math
from fastapi import Depends,Path,Query,Request
from pydantic import Field,model_validator
from fastapi.exceptions import RequestValidationError
from .admin_routes import StrictBody,EditionIdentifier
from lessonos.study import attendance,manual_payments
from lessonos.study.admin_ledger import MAX_REVISION

RecordId=Annotated[str,Path(pattern='^[0-9a-f]{32}$')]
Limit=Annotated[int,Query(ge=1,le=50)]
After=Annotated[str|None,Query(min_length=1,max_length=512)]


class RegisterBody(StrictBody):
    @model_validator(mode='before')
    @classmethod
    def unicode_scalars(cls,value):
        # Pydantic's normal string_unicode error includes the invalid input;
        # reflecting a lone surrogate in Starlette's UTF-8 response is a 500.
        # Include unknown keys and wrong-type/nested values: validation errors
        # may echo any of them. Iterators avoid a second body-sized work list.
        pending=[iter((value,))];visited=0
        while pending:
            try:item=next(pending[-1])
            except StopIteration:pending.pop();continue
            visited+=1
            if (visited>262144 or (isinstance(item,str) and any(0xd800<=ord(char)<=0xdfff for char in item))
                or (isinstance(item,float) and not math.isfinite(item))):
                raise RequestValidationError([{'type':'value_error','loc':('body',),
                    'msg':'Input must contain bounded Unicode scalar values and finite numbers'}])
            if isinstance(item,dict):pending.append(chain(item.keys(),item.values()))
            elif isinstance(item,list):pending.append(iter(item))
        return value


class AttendanceBody(RegisterBody):
    sessionId:str=Field(strict=True,pattern='^[0-9a-f]{32}$')
    studentId:str=Field(strict=True,min_length=1,max_length=128)
    status:Literal['PRESENT','ABSENT','UNRECORDED']
    expectedRevision:int=Field(strict=True,ge=0,le=MAX_REVISION)
    expectedManagementRevision:int=Field(strict=True,ge=0,le=MAX_REVISION)
    targetRecordId:str|None=Field(default=None,strict=True,pattern='^[0-9a-f]{32}$')
    reason:str=Field(default='',strict=True,max_length=1000)


class ManualPaymentBody(RegisterBody):
    studentId:str=Field(strict=True,min_length=1,max_length=128)
    amountMinor:int=Field(strict=True,ge=1,le=1000000)
    currency:Literal['EUR']
    externalReference:str=Field(strict=True,min_length=1,max_length=128)


class ManualRevisionBody(RegisterBody):
    expectedRevision:int=Field(strict=True,ge=1,le=MAX_REVISION)
    targetRecordId:str=Field(strict=True,pattern='^[0-9a-f]{32}$')
    status:Literal['RECORDED_MANUALLY','VOIDED']
    amountMinor:int|None=Field(default=None,strict=True,ge=1,le=1000000)
    reason:str=Field(strict=True,min_length=1,max_length=1000)


def install_register_routes(app,store_dependency,authenticate):
    @app.get('/study/admin/editions/{edition_id}/attendance')
    def get_attendance(edition_id:EditionIdentifier,request:Request,store=Depends(store_dependency)):
        return attendance.register(store,authenticate(request,store),edition_id)

    @app.post('/study/admin/editions/{edition_id}/attendance')
    def post_attendance(edition_id:EditionIdentifier,body:AttendanceBody,request:Request,store=Depends(store_dependency)):
        return attendance.record(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),
            session_id=body.sessionId,student_id=body.studentId,status=body.status,expected_revision=body.expectedRevision,
            expected_management_revision=body.expectedManagementRevision,target_record_id=body.targetRecordId,reason=body.reason)

    @app.get('/study/admin/editions/{edition_id}/attendance/history')
    def attendance_history(edition_id:EditionIdentifier,request:Request,
        sessionId:Annotated[str,Query(pattern='^[0-9a-f]{32}$')],
        studentId:Annotated[str,Query(min_length=1,max_length=128)],limit:Limit=20,after:After=None,store=Depends(store_dependency)):
        return attendance.history(store,authenticate(request,store),edition_id,
            session_id=sessionId,student_id=studentId,limit=limit,after=after)

    @app.get('/study/admin/editions/{edition_id}/manual-payments')
    def payments(edition_id:EditionIdentifier,request:Request,limit:Limit=20,after:After=None,store=Depends(store_dependency)):
        return manual_payments.listing(store,authenticate(request,store),edition_id,limit=limit,after=after)

    @app.post('/study/admin/editions/{edition_id}/manual-payments')
    def post_payment(edition_id:EditionIdentifier,body:ManualPaymentBody,request:Request,store=Depends(store_dependency)):
        return manual_payments.record(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),
            student_id=body.studentId,amount_minor=body.amountMinor,currency=body.currency,external_reference=body.externalReference)

    @app.post('/study/admin/editions/{edition_id}/manual-payments/{entry_id}/revisions')
    def payment_revision(edition_id:EditionIdentifier,entry_id:RecordId,body:ManualRevisionBody,request:Request,store=Depends(store_dependency)):
        return manual_payments.correct(store,authenticate(request,store),edition_id,entry_id,request.headers.get('Idempotency-Key',''),
            expected_revision=body.expectedRevision,target_record_id=body.targetRecordId,status=body.status,
            amount_minor=body.amountMinor,reason=body.reason)

    @app.get('/study/admin/editions/{edition_id}/manual-payments/{entry_id}/history')
    def payment_history(edition_id:EditionIdentifier,entry_id:RecordId,request:Request,limit:Limit=20,after:After=None,store=Depends(store_dependency)):
        return manual_payments.history(store,authenticate(request,store),edition_id,entry_id,limit=limit,after=after)
