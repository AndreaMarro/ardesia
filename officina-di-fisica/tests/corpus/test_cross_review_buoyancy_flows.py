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
FAMILIES=[('two_liquid_floating','two-liquid-floating-089'),('hydrostatic_weighing','hydrostatic-weighing-090'),('volume_flow','volume-flow-091'),('mass_flow','mass-flow-092'),('constriction_velocity','constriction-velocity-093')]
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
    false_proof='La spinta è sempre il peso del corpo anche fuori equilibrio; in un flusso non uniforme la portata usa sempre la velocità massima su tutta la sezione.'
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
    row=next(r for r in changed['records'] if r['answer']['type']=='numeric')
    row['answer']['unit']='Hz';rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
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


class CrossReviewBuoyancyFlowsTests(unittest.TestCase):
    def test_all_eighty_reports_satisfy_canonical_record_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        count=0
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                fresh=module.report(package,bindings)
                saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text())
                count+=len(fresh['records'])
                assert_record_identity(fresh['records'],module.EXPECTED_IDS,package,bindings)
                assert_record_identity(saved['records'],module.EXPECTED_IDS,package,bindings)
                self.assertEqual(saved,fresh)
        self.assertEqual(80,count)

    def test_independent_oracles_and_edition_integrity(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                result=audit(module,package,bindings)
                self.assertEqual(24,result['passed'])


from fractions import Fraction
from hypothesis import given, settings, strategies as st

class BuoyancyAndFlowPhysicalProperties(unittest.TestCase):
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_stratified_buoyancy_convex_density(self,upper,contrast,numerator,extra):
        bottom=Fraction(upper+contrast)
        fraction=Fraction(numerator,numerator+extra)
        body=upper*(1-fraction)+bottom*fraction
        self.assertLess(upper,body);self.assertLess(body,bottom)
        self.assertEqual(fraction,(body-upper)/(bottom-upper))
        self.assertEqual(body,upper+(bottom-upper)*fraction)
        self.assertEqual(body/fraction,upper*(1-fraction)/fraction+bottom)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,25),st.integers(1,25),st.integers(1,25),st.integers(1,8))
    def test_weighing_eliminates_same_volume_and_scale(self,fluid,excess,volume,scale):
        body=Fraction(fluid+excess);gravity=10
        weight=body*gravity*volume
        immersed=weight-fluid*gravity*volume
        inferred=fluid*weight/(weight-immersed)
        self.assertEqual(body,inferred)
        self.assertGreater(weight,immersed);self.assertGreater(immersed,0)
        self.assertEqual(weight,body*immersed/(body-fluid))
        self.assertEqual(body,fluid*(weight*scale)/(weight*scale-immersed*scale))

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_profile_area_weighted_triangle_is_half(self,radius,maximum,bands):
        # u=s²/R² makes equal du correspond to equal ring area.
        # The supplied profile is linear in u, so midpoint quadrature is exact.
        normalized=sum((1-Fraction(2*i+1,2*bands))/bands for i in range(bands))
        self.assertEqual(normalized,Fraction(1,2))
        # All fluxes below are divided by the same symbolic π.
        flux_without_pi=radius*radius*maximum*normalized
        self.assertEqual(flux_without_pi/Fraction(radius*radius),Fraction(maximum,2))
        self.assertEqual(2*flux_without_pi,radius*radius*maximum)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30),st.integers(1,8))
    def test_mass_flow_from_transported_volume(self,density,flow,time,scale):
        volume=Fraction(flow*time);mass=density*volume
        rate=mass/time
        self.assertEqual(rate,density*flow)
        self.assertEqual(density,rate/flow)
        self.assertEqual(rate*scale,density*(flow*scale))
        self.assertEqual(mass,rate*time)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30),st.integers(2,8))
    def test_continuity_and_different_apparatus_are_distinct(self,area_one,area_two,speed_one,scale):
        speed_two=Fraction(area_one*speed_one,area_two)
        self.assertEqual(area_one*speed_one,area_two*speed_two)
        self.assertEqual(Fraction(area_one,area_two),speed_two/speed_one)
        # Enlarging only the first section at fixed inlet speed defines another
        # apparatus. Its volume flow is scaled, not constrained to the old Q.
        new_flow=area_one*scale*speed_one
        new_speed_two=Fraction(new_flow,area_two)
        self.assertEqual(new_speed_two,scale*speed_two)
        self.assertNotEqual(new_flow,area_one*speed_one)

if __name__=='__main__':
    unittest.main()
