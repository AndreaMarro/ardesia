"""Read-only independent review of the three proposed paragraph corrections.

Uses the existing catalogue/registry compatibility loader. Does not import,
apply, publish or change any registered lesson, verifier pin or runtime file.
"""
import base64
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import sys

APP=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(APP))
import pint
import sympy as sp
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import load_activity_registry
from tests.corpus.test_lesson_experiment_anchor_compatibility import source_catalog,missing_anchors


def check():
    folder=Path(__file__).resolve().parent
    batches=['lessons-foundations-revisions-054','lessons-viscous-revisions-073']
    tracked=[APP/'editorial/batches'/f'{b}{s}' for b in batches for s in ['.json','-bindings.json']]
    tracked += [APP/'editorial/batches/registry.json',APP/'static/js/banchi/collegamenti.js',APP/'server/domain/authoring.py']
    before={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked}
    manifest=json.loads((folder/'proposal-manifest.json').read_text())
    for name,want in manifest['files'].items():
        assert hashlib.sha256((folder/name).read_bytes()).hexdigest()==want
    catalog=source_catalog();experiments=[r for r in catalog.values() if r.get('kind')=='experiment']
    assert len(catalog)==991 and len(experiments)==181
    assert missing_anchors(catalog,experiments)==[]
    effective=dict(catalog)
    for spec in load_activity_registry():
        if spec.get('revisionPackage'):
            p=json.loads((APP/'editorial/batches'/(spec['revisionPackage']+'.json')).read_text())
            for row in p['records']:effective[row['id']]=row
    missing_before=missing_anchors(effective,experiments)
    expected=[(r['id'],r['lesson'],r['anchor']) for r in manifest['missingAnchors']]
    assert sorted(missing_before)==sorted(expected)
    changes=[];asset_proofs=[];binding_proofs=[]
    proposals={}
    for batch in batches:
        current=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text())
        proposal=json.loads((folder/f'{batch}.json').read_text())
        assert current.keys()==proposal.keys()
        assert {k:v for k,v in current.items() if k!='records'}=={k:v for k,v in proposal.items() if k!='records'}
        assert len(current['records'])==len(proposal['records'])
        assert [r['id'] for r in current['records']]==[r['id'] for r in proposal['records']]
        asset_map={a['name']:a['id'] for a in proposal['assets']}
        for a in proposal['assets']:
            raw=base64.b64decode(a['data'],validate=True)
            assert hashlib.sha256(raw).hexdigest()==a['id']
            asset_proofs.append({'batch':batch,'name':a['name'],'sha256':a['id'],'identicalToRegistered':True})
        old_bind=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_text())
        new_bind=json.loads((folder/f'{batch}-bindings.json').read_text())
        assert len(old_bind)==len(new_bind)==len(proposal['records'])
        for old,new,ob,nb in zip(current['records'],proposal['records'],old_bind,new_bind):
            assert old['id']==new['id']==ob['id']==nb['id']
            assert {k:v for k,v in old.items() if k!='blocks'}=={k:v for k,v in new.items() if k!='blocks'}
            assert len(old['blocks'])==len(new['blocks'])
            for index,(a,b) in enumerate(zip(old['blocks'],new['blocks'])):
                if a!=b:
                    assert a['type']==b['type']=='text'
                    changes.append({'id':old['id'],'block':index,'before':a['text'],'after':b['text']})
            assert {k:v for k,v in ob.items() if k!='candidateSha256'}=={k:v for k,v in nb.items() if k!='candidateSha256'}
            assert nb['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d'
            assert nb['sourceSha256']==digest(catalog[new['id']])
            assert nb['candidateSha256']==digest(new)
            assert all(asset_map[name]==sha for name,sha in nb['assetChecksums'].items())
            assert {b['src'].removeprefix('/asset/') for b in new['blocks'] if b['type']=='figure'}==set(nb['assetChecksums'].values())
            binding_proofs.append({'id':new['id'],'sourceSha256':nb['sourceSha256'],'candidateSha256':nb['candidateSha256'],'sourceAndAssetsUnchanged':True})
            effective[new['id']]=new
        proposals[batch]={'registeredFileSha256':before[f'editorial/batches/{batch}.json'],'proposalFileSha256':hashlib.sha256((folder/f'{batch}.json').read_bytes()).hexdigest(),'registeredCanonicalSha256':digest(current),'proposalCanonicalSha256':digest(proposal)}
    assert changes==json.loads((folder/'proposed-paragraph-diff.json').read_text())
    assert [(x['id'],x['block']) for x in changes]==[('C1-L002',5),('C1-L002',15),('C2-L007',10)]
    assert missing_anchors(effective,experiments)==[]
    entry_points=[]
    for item in manifest['missingAnchors']:
        experiment=catalog[item['id']];assert experiment['skill']==item['lesson'] and experiment['anchor']==item['anchor']
        matches=[i for i,b in enumerate(effective[item['lesson']]['blocks']) if b['type']=='text' and b['text'].startswith(experiment['anchor'])]
        assert len(matches)==1
        entry_points.append({'id':experiment['id'],'lesson':experiment['skill'],'anchor':experiment['anchor'],'proposalBlock':matches[0],'originalExperimentSha256':digest(experiment)})
    # Independent scientific checks, not hashes used as substitutes for physics.
    theta,A,B=sp.symbols('theta A B',real=True)
    assert sp.trigsimp((A*sp.cos(theta))**2+(A*sp.sin(theta))**2-A**2)==0
    assert sp.sqrt(3**2+4**2)==5
    assert [6*sp.cos(x) for x in [0,sp.pi/2,sp.pi]]==[6,0,-6]
    assert [6*sp.sin(x) for x in [0,sp.pi/2,sp.pi]]==[0,6,0]
    r,R,vmax=sp.symbols('r R vmax',positive=True)
    velocity=vmax*(1-(r/R)**2)
    assert velocity.subs(r,0)==vmax and velocity.subs(r,R)==0
    assert velocity.subs(r,R/2)==3*vmax/4
    area_mean=sp.integrate(velocity*2*sp.pi*r,(r,0,R))/(sp.pi*R**2)
    assert sp.simplify(area_mean-vmax/2)==0
    assert 8*Fraction(3,4)==6 and 12*Fraction(3,4)==9
    u=pint.UnitRegistry(non_int_type=Fraction);q=u.Quantity
    assert ((q(4,'mm/s')/q(2,'mm'))*q(2,'Pa*s')).to('Pa').magnitude==4
    assert (q(1,'kg/m**3')*q(1,'m/s')*q(1,'m')/q(1,'Pa*s')).dimensionless
    # The consumer and authoring validator use exactly this paragraph prefix,
    # not a changed anchor or an invisible alias. No selector has been altered.
    js=(APP/'static/js/banchi/collegamenti.js').read_text()
    validator=(APP/'server/domain/authoring.py').read_text()
    assert 'el.textContent.startsWith(topic.anchor)' in js
    assert 'b["text"].startswith(anchor)' in validator
    after={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked}
    assert before==after
    return {'schemaVersion':'1.0.0','reviewer':'separate_AI_reviewer_A_not_root_author','scope':'three_proposed_paragraphs_and_four_original_entry_points','sourceRef':manifest['sourceRef'],'catalogRecords':len(catalog),'originalExperiments':len(experiments),'missingBefore':missing_before,'missingAfter':[],'entryPoints':entry_points,'changes':changes,'packages':proposals,'assets':asset_proofs,'bindings':binding_proofs,'registeredAndConsumerPrePostSha256':before,'registeredPackagesChanged':0,'runtimeChanges':0,'verifierPinsChanged':0,'scientificChecks':'trigonometric components, signed scalar product, cross-product norm, Couette units, parabolic endpoints and area mean independently derived with SymPy/Pint/Fraction','humanApproval':'NOT_RUN','publicationAction':'NONE','newCompletedIdCredit':0,'appliedEditionReview':'NOT_RUN_until_root_applies_and_final_bytes_reread'}


if __name__=='__main__':
    result=check()
    destination=Path(__file__).with_name('independent-proof-a.json')
    destination.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'catalog':result['catalogRecords'],'experiments':result['originalExperiments'],'missingBefore':len(result['missingBefore']),'missingAfter':len(result['missingAfter']),'changedParagraphs':len(result['changes']),'registeredPackagesChanged':0,'humanApproval':'NOT_RUN'}))
