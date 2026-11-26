"""Rebound corpus mutations for the separate C5 reviewer; no authoring imports."""
import base64
from copy import deepcopy
from pathlib import Path
import tempfile
from unittest.mock import patch
import sympy as sp
from .pipeline import digest,sha

def rebound(module,package,bindings,asset_root,key):
    tokens={r['id']:token for r,b,token,a,e in module.reviewed_rows(package,bindings,{},module.EXPECTED_IDS,asset_root)}
    with patch.dict(module.REVIEWED_CANDIDATES,tokens),patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(package),REVIEWED_BINDINGS_SHA256=digest(bindings)):
        return next(r for r in module.verify(package,bindings,asset_root)if r['id']==key)

def audit(module,package,bindings,asset_root):
    cases=[]
    def changed(i,mutate,reason):
        p,b=deepcopy(package),deepcopy(bindings);row=p['records'][i];mutate(row,b[i]);b[i]['candidateSha256']=digest(row)
        result=rebound(module,p,b,asset_root,row['id'])
        if result['ok'] or not any(reason in e for e in result['errors']):raise AssertionError('Independent adversary escaped: '+reason+' '+row['id'])
        cases.append({'case':reason,'id':row['id'],'rejectedBy':result['errors']})
    for i,row in enumerate(package['records']):
        def wrong(r,b):r['answer']['value']=r['answer']['value']+1 if r['answer']['type']=='numeric' else next(x for x in r['answer']['options']if x!=r['answer']['value'])
        changed(i,wrong,'conceptual key'if isinstance(module.oracle()[i],str)else'exact result mismatch'if row['answer']['type']=='numeric'else'exact ')
    for field,value in [('baseVersion',0),('version',99),('exam',1),('family','invented'),('difficulty',99),('prerequisites',['C1-L001'])]:
        changed(0,lambda r,b:r.__setitem__(field,value),'Cric')
    for i,r in enumerate(package['records']):
        if r['answer']['type']=='numeric':
            changed(i,lambda r,b:r['answer'].__setitem__('unit','kg'),'numeric physical unit');changed(i,lambda r,b:r['answer'].__setitem__('value',float(r['answer']['value'])),'exact integer JSON');break
    changed(0,lambda r,b:b.__setitem__('sourceSha256','0'*64),'pinned Git source')
    def source_path(r,b):b['provenance']['sourcePath']='officina-di-fisica/content/C1.json';b['provenanceSha256']=digest(b['provenance'])
    changed(0,source_path,'source provenance')
    def certify(r,b):b['provenance']['independentReview']='PASS_AI';b['provenanceSha256']=digest(b['provenance'])
    changed(0,certify,'source provenance')
    numeric=next(i for i,v in enumerate(module.oracle())if not isinstance(v,str)and sp.sympify(v).is_Rational and (sp.sympify(v)*10**18).is_Integer)
    n=module.OFFSET+numeric+1;wanted=sp.Rational(module.oracle()[numeric]);suffix=module.OPTION_SUFFIX.get(n,'')
    def duplicate(r,b):
        correct=str(wanted)+suffix;equivalent=module.equivalent_literal(wanted)+suffix
        r['answer']={'type':'choice','value':correct,'options':[correct,equivalent,str(wanted+1)+suffix,str(wanted+2)+suffix,str(wanted+3)+suffix]}
    changed(numeric,duplicate,'Equivalent exact numeric choices')
    def near(r,b):
        scale=10**18;v=abs(wanted)*scale;quotient,rem=divmod(int(v)+1,scale);value=('-'if wanted<0 else'')+f'{quotient}.{rem:018d}'+suffix
        r['answer']={'type':'choice','value':value,'options':[value,str(wanted+1)+suffix,str(wanted+2)+suffix,str(wanted+3)+suffix,str(wanted+4)+suffix]}
    changed(numeric,near,'exact result mismatch')
    p,b=deepcopy(package),deepcopy(bindings);p['records'][0]['blocks'].append({'type':'text','text':'Una frequenza maggiore annulla sempre la lunghezza d’onda anche a velocità non nulla.'});b[0]['candidateSha256']=digest(p['records'][0]);result=module.verify(p,b,asset_root)[0]
    assert not result['ok']and'Independent reviewed signature mismatch'in result['errors'];cases.append({'case':'correct_key_false_proof_not_freshly_read','rejectedBy':result['errors']})
    for name in('empty','partial','duplicate'):
        p=deepcopy(package)
        if name=='empty':p['records']=[]
        elif name=='partial':p['records'].pop()
        else:p['records'][1]=deepcopy(p['records'][0])
        try:module.verify(p,bindings,asset_root)
        except ValueError:cases.append({'case':name+'_batch','rejectedBy':'complete unique boundary'})
        else:raise AssertionError(name)
    for label,old,new in [('geometry',b'width="640"',b'width="641"'),('accessible_title',b'<title id="title">',b'<title id="title">Valore falso999. '),('accessible_description',b'<desc id="desc">',b'<desc id="desc">Quantit\xc3\xa0 falsa999. ')]:
        p,b=deepcopy(package),deepcopy(bindings);asset=next(a for a in p['assets']if a['name']==module.ASSET_NAME);raw=base64.b64decode(asset['data']);assert old in raw;raw=raw.replace(old,new,1);previous=asset['id'];asset.update(id=sha(raw),data=base64.b64encode(raw).decode())
        for row,link in zip(p['records'],b):
            for block in row['blocks']:
                if block.get('src')=='/asset/'+previous:block['src']='/asset/'+asset['id']
            if module.ASSET_NAME in link.get('assetChecksums',{}):link['assetChecksums'][module.ASSET_NAME]=asset['id']
            link['candidateSha256']=digest(row)
        with tempfile.TemporaryDirectory()as folder:
            home=Path(folder)
            for a in p['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
            try:rebound(module,p,b,home,p['records'][0]['id'])
            except ValueError as error:
                assert'physical scale'in str(error);cases.append({'case':label+'_all_pins_rebound','rejectedBy':str(error)})
            else:raise AssertionError(label)
    return {'scope':'separate_independent_rebound_mutations','cases':cases,'caseCount':len(cases),'allRejected':True,'humanApproval':'NOT_RUN','publication':'DRAFT'}
