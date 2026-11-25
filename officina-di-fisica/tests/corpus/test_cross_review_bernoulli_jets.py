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
FAMILIES=[('bernoulli_height_speed','bernoulli-height-speed-100'),('venturi_area_ratio','venturi-area-ratio-101'),('torricelli_speed','torricelli-speed-102'),('torricelli_flow','torricelli-flow-103'),('horizontal_jet_range','horizontal-jet-range-104')]
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
    false_proof='Nel modello ideale il calo di pressione statica dimostra sempre una dissipazione; il battente coincide sempre con la quota del foro e una stessa gittata impone la stessa velocità iniziale.'
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


class CrossReviewBernoulliJetsTests(unittest.TestCase):
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

import sympy as sp

class BernoulliJetPhysicalProperties(unittest.TestCase):
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,10),st.integers(1,8),st.integers(1,8))
    def test_height_pressure_adds_quota_and_kinetic_cost(self,height,speed,scale_h,scale_v):
        hydro=10*height;kinetic=Fraction(speed*speed,2)
        pressure=hydro+kinetic
        self.assertGreater(pressure,hydro);self.assertGreater(pressure,kinetic)
        self.assertEqual(Fraction(pressure-kinetic,10),height)
        self.assertEqual(2*(pressure-hydro),speed*speed)
        changed=10*height*scale_h+Fraction((speed*scale_v)**2,2)
        self.assertEqual(changed,scale_h*hydro+scale_v*scale_v*kinetic)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(2,5),st.integers(1,8),st.integers(1,5))
    def test_venturi_static_change_retains_total_and_continuity(self,ratio,speed,small_area):
        large_area=ratio*small_area
        speed_two=ratio*speed
        self.assertEqual(large_area*speed,small_area*speed_two)
        kinetic_one=Fraction(speed*speed,2);kinetic_two=Fraction(speed_two*speed_two,2)
        drop=kinetic_two-kinetic_one
        pressure_two=100;pressure_one=pressure_two+drop
        self.assertGreater(drop,0);self.assertGreater(pressure_one,pressure_two)
        self.assertEqual(pressure_one+kinetic_one,pressure_two+kinetic_two)
        self.assertEqual(1+2*drop/Fraction(speed*speed),ratio*ratio)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,25),st.integers(1,25),st.integers(1,8))
    def test_torricelli_positive_root_and_inverse(self,gravity,head,scale):
        speed=sp.sqrt(2*gravity*head)
        self.assertGreater(speed,0)
        self.assertEqual(speed**2/2,gravity*head)
        self.assertEqual(speed**2/(2*head),gravity)
        self.assertEqual(speed**2/(2*gravity),head)
        changed=sp.sqrt(2*gravity*head*scale*scale)
        self.assertEqual(sp.simplify(changed-speed*scale),0)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,25),st.integers(1,12),st.integers(1,8))
    def test_orifice_flow_units_and_linear_area(self,area,head_root,area_scale):
        # mm² and mL each carry the same exact 10^-6 factor in SI.
        head=5*head_root*head_root
        speed=10*head_root
        flow=area*speed
        si_flow=Fraction(area,10**6)*speed
        self.assertEqual(si_flow*10**6,flow)
        self.assertEqual(Fraction(flow,speed),area)
        self.assertEqual(Fraction(speed*speed,20),head)
        self.assertEqual(area_scale*flow,(area_scale*area)*speed)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20),st.integers(1,10))
    def test_jet_complementary_heights_and_upper_range(self,total,numerator,extra,gravity):
        height=Fraction(total*numerator,numerator+extra)
        head=total-height
        range_square=4*head*height
        self.assertGreater(head,0);self.assertGreater(height,0)
        self.assertLessEqual(range_square,total*total)
        self.assertEqual(total*total-range_square,(2*height-total)**2)
        self.assertEqual(range_square,4*height*head)
        # Same gravity acts in efflux and ballistic fall; neither factor alone
        # is independent of gravity, while their product squared is.
        speed_square=2*gravity*head;time_square=Fraction(2*height,gravity)
        self.assertEqual(speed_square*time_square,range_square)
        self.assertEqual(Fraction(total,2)*Fraction(total,2)*4,total*total)

    def test_bounded_numeric_radicals_never_evaluate_code(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            with self.subTest(batch=batch):
                self.assertEqual(module.exact_literal('2√5/5'),2*sp.sqrt(5)/5)
                self.assertEqual(module.exact_literal('(5+2√5)/2'),sp.Rational(5,2)+sp.sqrt(5))
                self.assertEqual(module.exact_literal('1/(2√2)'),sp.sqrt(2)/4)
                for raw in ['1/0','r(-1)','10**1000000','__import__(1)','r(1,2)','[1,2]']:
                    with self.assertRaises((ValueError,SyntaxError)):
                        module.exact_literal(raw)

if __name__=='__main__':
    unittest.main()
