"""Read-only teacher consumer over existing edition permissions and review gate."""
from fastapi import Depends, Query, Request
from ..models import StudyError
from ..question_bank import bank_access_for_edition
from ..question_bank_approvals import ApprovalGate
from .audit import audit_bank
from .families import batch_dossiers


def install_assessment_quality_routes(app,store_dependency,authenticate):
    @app.get('/study/editions/{edition_id}/question-banks/{bank_id}/review/quality')
    def quality(edition_id:str,bank_id:str,request:Request,
                scope:str=Query('quarantined',pattern='^(quarantined|unverified|all)$'),
                after:str|None=Query(None,min_length=1,max_length=128),
                limit:int=Query(20,ge=1,le=100),store=Depends(store_dependency)):
        principal=authenticate(request,store)
        store._edition_access(principal,edition_id,teacher_only=True)
        _,bank=bank_access_for_edition(store,principal,edition_id,bank_id)
        report=audit_bank(bank)
        rows=[row for row in report.pop('items') if scope=='all'
              or (scope=='quarantined' and row['quarantined'])
              or (scope=='unverified' and row['numericStatus']=='NOT_VERIFIED')]
        total=len(rows)
        if after is not None:
            if not any(row['id']==after for row in rows):raise StudyError('invalid_question_cursor')
            rows=[row for row in rows if row['id']>after]
        page=rows[:limit]
        return {**report,'dossiers':batch_dossiers(bank),'publishedRecords':len(ApprovalGate(store,bank,edition_id).servable_ids()),
                'total':total,'items':page,'nextCursor':page[-1]['id'] if len(rows)>limit else None}
