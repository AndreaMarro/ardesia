"""C2 exact JSON identity bridge. No record rewrite or scientific approval."""
from decimal import Decimal
import hashlib,json,math,re

def digest(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()

def compare(prepared,canonical,path='',changes=None):
    if changes is None:changes=[]
    if type(prepared)is dict and type(canonical)is dict:
        if set(prepared)!=set(canonical)or not all(type(k)is str for k in prepared):raise ValueError('Exact JSON object fields required:'+path)
        for key in sorted(prepared):compare(prepared[key],canonical[key],path+'/'+key,changes)
    elif type(prepared)is list and type(canonical)is list:
        if len(prepared)!=len(canonical):raise ValueError('Exact JSON array size required:'+path)
        for i,(a,b)in enumerate(zip(prepared,canonical,strict=True)):compare(a,b,path+'/'+str(i),changes)
    elif type(prepared)is type(canonical):
        if type(prepared)not in(int,float,str,bool,type(None)):raise ValueError('Only JSON scalars permitted:'+path)
        if type(prepared)is float and(not math.isfinite(prepared)or not math.isfinite(canonical)):raise ValueError('Finite JSON numbers required:'+path)
        if prepared!=canonical:raise ValueError('Exact value differs:'+path)
    elif {type(prepared),type(canonical)}=={int,float}:
        f=prepared if type(prepared)is float else canonical
        n=prepared if type(prepared)is int else canonical
        allowed=path in('/control/min','/control/max','/control/step')or bool(re.fullmatch(r'/references/[0-9]+/[0-9]+',path))
        if not allowed or not math.isfinite(f)or not f.is_integer()or abs(n)>2**53-1 or Decimal(json.dumps(f,allow_nan=False))!=Decimal(n):raise ValueError('Not an allowed exact safe-integer representation:'+path)
        changes.append(dict(path=path,preparedLexeme=json.dumps(prepared,allow_nan=False),canonicalLexeme=json.dumps(canonical,allow_nan=False)))
    else:raise ValueError('Type or nonnumeric field differs:'+path)
    return changes
