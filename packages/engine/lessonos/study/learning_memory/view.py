"""Explicit personal graph presentation, in the existing Study ledger.

Coordinates are not evidence and cannot grant access to a node or source.
"""
import json
import math
from ..models import StudyError
from ..transactions import execute_command

LAYOUTS=frozenset(('grid','breadthfirst','circle'))
MAX_POSITIONS=1024


def _latest(store,principal):
    store._principal(principal)
    row=store.connection.execute("SELECT payload FROM study_events WHERE actor_id=? AND kind='memory.view.saved.v1' ORDER BY seq DESC LIMIT 1",(principal.id,)).fetchone()
    return json.loads(row['payload']) if row else {'version':0,'layout':'grid','positions':[],'zoom':1,'pan':{'x':0,'y':0}}


def read_view(store,principal,allowed_ids):
    value=_latest(store,principal)
    return {**value,'positions':[point for point in value['positions'] if point['id'] in allowed_ids]}


def get_view(store,principal):
    from . import get_memory
    return get_memory(store,principal)['view']


def _coordinate(value,low=-1_000_000,high=1_000_000):
    if type(value) not in (int,float) or not low<=value<=high or not math.isfinite(value):
        raise StudyError('invalid_memory_view')
    return value


def _point(value,*,node=False):
    if not isinstance(value,dict) or set(value)!=({'id','x','y'} if node else {'x','y'}):
        raise StudyError('invalid_memory_view')
    result={'x':_coordinate(value['x']),'y':_coordinate(value['y'])}
    if node:
        if not isinstance(value['id'],str) or not 1<=len(value['id'])<=200:raise StudyError('invalid_memory_view')
        result={'id':value['id'],**result}
    return result


def save_view(store,principal,body,key):
    # Validate JSON numerics before the command's strict canonical JSON hashing.
    if not isinstance(body,dict) or set(body)!={'expectedVersion','layout','positions','zoom','pan'}:
        raise StudyError('invalid_memory_view')
    version=body['expectedVersion']
    if type(version) is not int or version<0 or not isinstance(body['layout'],str) or body['layout'] not in LAYOUTS:
        raise StudyError('invalid_memory_view')
    if not isinstance(body['positions'],list) or len(body['positions'])>MAX_POSITIONS:raise StudyError('invalid_memory_view')
    positions=[_point(point,node=True) for point in body['positions']]
    if len({point['id'] for point in positions})!=len(positions):raise StudyError('invalid_memory_view')
    validated={'expectedVersion':version,'layout':body['layout'],'positions':positions,
        'zoom':_coordinate(body['zoom'],.2,4),'pan':_point(body['pan'])}
    def apply(connection):
        from . import get_memory
        store.lock_aggregate(connection,'memory.actor',principal.id)
        if _latest(store,principal)['version']!=version:raise StudyError('stale_revision',409)
        allowed={node['id'] for node in get_memory(store,principal)['nodes']}
        if any(point['id'] not in allowed for point in positions):raise StudyError('forbidden',403)
        state={name:value for name,value in validated.items() if name!='expectedVersion'}
        store._event(connection,principal,'memory.view.saved.v1',None,{**state,'version':version+1})
        return {'version':version+1}
    receipt=execute_command(store,principal,'memory.view.save.v1',key,validated,apply)
    current=get_view(store,principal)  # Replay always rechecks current node access.
    if current['version']!=receipt['version']:
        raise StudyError('stale_revision',409)
    return current
