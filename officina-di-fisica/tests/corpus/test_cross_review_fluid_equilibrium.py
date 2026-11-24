"""Reproducible independent079–083 fluid equilibrium audits, never importing candidate authoring."""
import base64
from copy import deepcopy
import importlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
REPO=APP.parent
FAMILIES=[('communicating_columns','communicating-columns-079'),('differential_manometer','differential-manometer-080'),('vertical_wall_force','vertical-wall-force-081'),('hydraulic_force','hydraulic-force-082'),('hydraulic_stroke','hydraulic-stroke-083')]
AUDIT_RESULTS={}


def reviewed_inputs(module,batch):
    # Fingerprints freeze canonical payload bytes already read at the Git commit;
    # runtime replay need not reopen an iCloud-offloaded Git object pack.
    locations=[APP,REPO.parent/'cric-author-b-resident/officina-di-fisica']
    for app in locations:
        try:
            package=json.loads((app/'editorial/batches'/f'{batch}.json').read_text())
            bindings=json.loads((app/'editorial/batches'/f'{batch}-bindings.json').read_text())
        except FileNotFoundError:
            continue
        if digest(package)==module.REVIEWED_PACKAGE_SHA256 and digest(bindings)==module.REVIEWED_BINDINGS_SHA256:
            return package,bindings
    raise AssertionError('Reviewed payload unavailable locally; integrate the author corrections first')


def rebind(row,links):
    next(b for b in links if b['id']==row['id'])['candidateSha256']=digest(row)


def verify_with_replaced_tokens(module,package,links):
    """Test only: deliberately replace every edition guard, retaining math oracle."""
    tokens={r['id']:token for r,b,token,a,e in reviewed_rows(package,links,{},module.EXPECTED_IDS,APP/'editorial/assets')}
    with patch.dict(module.REVIEWED_CANDIDATES,tokens),patch.multiple(module,
          REVIEWED_PACKAGE_SHA256=digest(package),REVIEWED_BINDINGS_SHA256=digest(links)):
        return module.verify(package,links)


def audit(module,package,bindings):
    good=module.verify(package,bindings)
    if len(good)!=16 or not all(r['ok'] for r in good):raise AssertionError('Read original candidate edition failed')
    cases=[]
    for index,original in enumerate(package['records']):
        changed,links=deepcopy(package),deepcopy(bindings)
        row=changed['records'][index];answer=row['answer']
        answer['value']=(answer['value']+1 if answer['type']=='numeric' else
                         next(v for v in answer['options'] if v!=answer['value']))
        rebind(row,links)
        result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
        math_errors=[e for e in result['errors'] if e.startswith('Independent ') and any(q in e for q in ('key mismatch','result mismatch','answer or unit invalid'))]
        if result['ok'] or not math_errors:raise AssertionError('Rebound and retokenized wrong key escaped independent math: '+row['id'])
        cases.append({'case':'wrong_key_with_candidate_binding_and_all_edition_guards_replaced','id':row['id'],'rejectedBy':math_errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][2]
    false_proof='La pressione assoluta è zero su ogni superficie libera e la forza su una parete verticale usa sempre la pressione al fondo su tutta l’area.'
    row['blocks'].append({'type':'text','text':false_proof});rebind(row,links)
    result=next(r for r in module.verify(changed,links) if r['id']==row['id'])
    if result['ok'] or 'Independent reviewed signature mismatch' not in result['errors']:raise AssertionError('False proof escaped frozen individual reading')
    cases.append({'case':'correct_key_but_false_physics_proof_rebound','id':row['id'],'rejectedBy':['frozen independent full-record reading']})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]['sourceSha256']='0'*64
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==links[0]['id'])
    errors=[e for e in result['errors'] if 'pinned' in e and 'source binding' in e]
    if result['ok'] or not errors:raise AssertionError('False source binding escaped independently read Git source')
    cases.append({'case':'false_source_hash_with_all_edition_guards_replaced','id':result['id'],'rejectedBy':errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['answer']['unit']='Hz' if row['answer']['unit']=='m' else 'm';rebind(row,links)
    result=verify_with_replaced_tokens(module,changed,links)[0]
    errors=[e for e in result['errors'] if 'numeric unit mismatch' in e]
    if result['ok'] or not errors:raise AssertionError('Wrong numeric physical unit escaped oracle')
    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})
    for label,transform in [('empty',lambda p:p.update(records=[])),('partial',lambda p:p['records'].pop()),
                             ('duplicate',lambda p:p['records'].__setitem__(1,deepcopy(p['records'][0])))]:
        changed=deepcopy(package);transform(changed)
        try:module.verify(changed,bindings)
        except ValueError:cases.append({'case':label+'_batch','rejectedBy':['complete unique batch boundary']})
        else:raise AssertionError('Invalid batch boundary accepted: '+label)
    changed=deepcopy(package)
    asset=changed['assets'][0]
    asset['data']=base64.b64encode(base64.b64decode(asset['data'])+b' ').decode()
    try:module.verify(changed,bindings)
    except ValueError:cases.append({'case':'embedded_svg_bytes_changed','rejectedBy':['hashed uploaded asset boundary']})
    else:raise AssertionError('Changed embedded SVG bytes accepted')
    with tempfile.TemporaryDirectory(prefix='cric-review-svg-') as directory:
        root=Path(directory)
        for a in package['assets']:(root/a['name']).write_bytes(base64.b64decode(a['data']))
        a=package['assets'][0];file=root/a['name'];file.write_bytes(file.read_bytes()+b' ')
        results=module.verify(package,bindings,root)
        if all(r['ok'] for r in results):raise AssertionError('Changed local scientific SVG accepted')
        cases.append({'case':'local_svg_bytes_changed','rejectedBy':['frozen independently read scientific asset']})
    result={'schemaVersion':'1.0.0','cases':cases,'passed':len(cases),'humanApproval':'NOT_RUN','publication':'DRAFT'}
    AUDIT_RESULTS[module.__name__]=result
    return result


class CrossReviewFluidEquilibriumTests(unittest.TestCase):
    def test_independent_oracles_and_edition_integrity(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                result=audit(module,package,bindings)
                self.assertEqual(24,result['passed'])


from fractions import Fraction
from hypothesis import given, settings, strategies as st

class FluidPhysicalProperties(unittest.TestCase):
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,50),st.integers(1,50))
    def test_positive_stable_columns(self,numerator,increment,scale):
        rho1=Fraction(numerator);rho2=rho1+increment
        height=10*rho1/rho2
        self.assertGreater(height,0);self.assertLessEqual(height,10)
        self.assertEqual(rho1*10,rho2*height)
        self.assertEqual(height,10*(rho1*scale)/(rho2*scale))
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_oriented_manometer(self,pressure_two,height_cm):
        drop=Fraction(height_cm,10);pressure_one=pressure_two+drop
        self.assertEqual(Fraction(pressure_two),pressure_one-drop)
        self.assertGreater(pressure_one,pressure_two)
        self.assertEqual(height_cm,(pressure_one-pressure_two)*10)
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,8))
    def test_triangular_wall_force(self,width,height,scale):
        # Integrating the linear relative pressure profile gives average half bottom.
        total=Fraction(10*width*height*height,2)
        self.assertEqual(total,Fraction(10*height,2)*width*height)
        self.assertEqual(total*scale*scale,Fraction(10*width*(height*scale)**2,2))
        self.assertEqual(Fraction(10*height)*width*height,2*total)
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_pascal_and_local_volume(self,force,area_i,area_o,stroke_o):
        area_o=area_i+area_o
        # Multiples of an infinitesimal displacement at equal contact levels;
        # this does not assert constant forces over a finite vertical stroke.
        force_o=Fraction(force*area_o,area_i)
        stroke_i=Fraction(area_o*stroke_o,area_i)
        self.assertEqual(Fraction(force,area_i),force_o/area_o)
        self.assertEqual(area_i*stroke_i,area_o*stroke_o)
        self.assertEqual(force*stroke_i,force_o*stroke_o)

if __name__=='__main__':
    unittest.main()
