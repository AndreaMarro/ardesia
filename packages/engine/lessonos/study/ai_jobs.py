"""Zero-spend progressive help. Runtime never invokes a cloud provider."""
from .activities import HINTS
from .models import StudyError
from .transactions import transact
from .store import identifier


def request_hint(store,principal,resource_id,level,key,*,provider=None,budget=0,price=None):
    resource=store.get_resource(principal,resource_id)
    if type(level) is not int or not 1<=level<=3:raise StudyError('invalid_hint_level')
    from .catalog import edition_pack, load_pack
    binding=edition_pack(store,resource['editionId'])
    hints=load_pack(binding['packId'],binding['packVersion']).get('hints',HINTS)
    # ProviderPort is reserved for a separately authorized benchmark. M1 is
    # deterministic even if a caller supplies a provider object or fake keys.
    def apply(c):
        return {'id':identifier(),'state':'completed','mode':'deterministic','providerState':'budget_blocked' if provider is not None else 'disabled',
                'text':hints[level-1],'level':level,'sourceRef':{'resourceId':resource_id,'revisionId':resource['revisionId'],'contextId':resource['contextId']},'costUsd':0,'liveCalls':0}
    return transact(store,principal,'hint.requested',key,{'resourceId':resource_id,'revisionId':resource['revisionId'],'level':level},apply)
