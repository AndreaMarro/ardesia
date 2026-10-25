"""Original draft CoursePack. Numeric checks never issue scientific approval."""
import math
from functools import lru_cache
from .catalog import load_pack, DEFAULT_PACK
from .activities import evaluate_activity
from .store import canonical,digest


def load_coursepack(pack_id=DEFAULT_PACK, version=1):
    return load_pack(pack_id, version)


@lru_cache(maxsize=8)
def base_activity_ids(pack_id=DEFAULT_PACK, version=1):
    """Immutable activity registry for one pinned bundled course pack.

    The edition access check remains in submit(); arbitrary or transfer IDs
    still require an explicit tutor assignment. Pack changes ship with code.
    """
    return frozenset(item['id'] for item in load_coursepack(pack_id, version)['activities'])


def validate_coursepack(pack):
    errors=[];ids=set()
    items=pack['exercises']+[item for group in pack['transferTests'] for item in group['items']]
    for item in items:
        if item['id'] in ids:errors.append(item['id']+': duplicate')
        ids.add(item['id'])
        result=evaluate_activity(item['activityId'],item['parameters'])
        value=result.get('value',result.get('ratio'));answer=item['answer']
        if not math.isclose(value,answer['value'],rel_tol=1e-9,abs_tol=1e-9):errors.append(item['id']+': numerical mismatch')
        if answer['unit']!=result.get('unit','1'):errors.append(item['id']+': unit mismatch')
        for key,expected in item.get('checks',{}).items():
            if result.get(key)!=expected:errors.append(item['id']+': '+key+' mismatch')
        if item['status']!='DRAFT' or item['reviewer'] is not None:errors.append(item['id']+': draft provenance changed')
    return {'ok':not errors,'errors':errors,'exercises':len(pack['exercises']),'activities':len(pack['activities']),'transferTests':len(pack['transferTests'])}


def review_manifest(pack):
    return {'coursepack':pack['id'],'version':pack['version'],'sha256':digest(canonical(pack)),'numericalValidation':validate_coursepack(pack),'scientificApproval':'NOT_RUN','reviewer':None,'decision':None,'reviewRequired':pack['reviewRubric']}
