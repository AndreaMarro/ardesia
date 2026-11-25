"""Reproducible independent112–116 hydraulic and viscous audits, never importing candidate authoring."""
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
FAMILIES=[('parallel_flow_divider','parallel-flow-divider-112'),('viscous_dissipation','viscous-dissipation-113'),('parabolic_profile','parabolic-profile-114'),('couette_force','couette-force-115'),('pressure_gradient_fixed_speed','pressure-gradient-fixed-speed-116')]
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
    false_proof='Il gradiente orientato è positivo lungo il flusso e incomprimibile significa viscosità nulla; il fluido newtoniano equilibra uno sforzo tangenziale non nullo con deformazione statica finita.'
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


class CrossReviewViscosityNetworksTests(unittest.TestCase):
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
import xml.etree.ElementTree as ET

class ViscosityNetworkPhysicalProperties(unittest.TestCase):
    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(1,40),st.integers(1,40),st.integers(1,10))
    def test_total_flow_constraint_and_common_pressure(self,total,first,second,scale):
        q1=Fraction(total*second,first+second);q2=Fraction(total*first,first+second)
        self.assertEqual(q1+q2,total)
        self.assertEqual(first*q1,second*q2)
        self.assertGreater(q1,0);self.assertLess(q1,total)
        self.assertEqual(Fraction(total*second*scale,(first+second)*scale),q1)
        self.assertEqual(Fraction(second*(total-q1),q1),first)
        self.assertEqual(Fraction(first*q1,total-q1),second)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,8),st.integers(1,8))
    def test_pressure_work_linear_resistor_and_cubic_constraint(self,resistance,flow,scale_r,scale_q):
        pressure=resistance*flow;power=pressure*flow
        self.assertEqual(power,resistance*flow*flow)
        self.assertEqual(Fraction(power,flow*flow),resistance)
        self.assertEqual(Fraction(power,resistance),flow*flow)
        changed=(scale_r*resistance)*(scale_q*flow)**2
        self.assertEqual(Fraction(changed,power),scale_r*scale_q*scale_q)
        coefficient=Fraction(resistance,flow)
        self.assertEqual(coefficient*flow**3,power)
        self.assertGreater(power,0)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_local_profile_range_inverse_and_area_average(self,maximum,numerator,extra):
        relative=Fraction(numerator,numerator+extra)
        local=maximum*(1-relative*relative)
        self.assertGreater(local,0);self.assertLess(local,maximum)
        self.assertEqual(local/(1-relative*relative),maximum)
        self.assertEqual(1-local/maximum,relative*relative)
        u=sp.Symbol('u',real=True)
        self.assertEqual(2*sp.integrate(maximum*(1-u*u)*u,(u,0,1)),sp.Rational(maximum,2))
        self.assertEqual(maximum*(1-0),maximum)
        self.assertEqual(maximum*(1-1),0)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,10),st.integers(1,10))
    def test_couette_force_sign_and_bilinear_mean(self,viscosity,speed,delta_eta,delta_v):
        first=10*viscosity*speed
        second=10*(viscosity+delta_eta)*(speed+delta_v)
        applied=first;liquid=-first
        self.assertEqual(applied+liquid,0)
        mean=Fraction(first+second,2)
        input_mean=10*(viscosity+Fraction(delta_eta,2))*(speed+Fraction(delta_v,2))
        self.assertEqual(mean-input_mean,Fraction(10*delta_eta*delta_v,4))
        self.assertEqual(Fraction(first,10*speed),viscosity)
        # Newtonian fluid strain grows linearly under constant nonzero stress;
        # ideal elastic equilibrium strain is finite and independent of time.
        stress,modulus,time=sp.symbols('stress modulus time',positive=True)
        self.assertEqual(sp.diff(stress*time/viscosity,time),stress/viscosity)
        self.assertEqual(sp.diff(stress/modulus,time),0)

    @settings(max_examples=35,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,8),st.integers(1,8))
    def test_fixed_mean_speed_changes_flow_and_gradient(self,viscosity,radius,scale_eta,scale_r):
        gradient=Fraction(80*viscosity,radius*radius)
        changed=Fraction(80*viscosity*scale_eta,(radius*scale_r)**2)
        self.assertEqual(changed/gradient,Fraction(scale_eta,scale_r*scale_r))
        # pi and mean speed cancel from the ratio of volumetric flows.
        self.assertEqual(Fraction((radius*scale_r)**2,radius*radius),scale_r*scale_r)
        self.assertEqual(gradient*radius*radius/80,viscosity)
        pressure_in=100000;length=Fraction(1,10)
        pressure_out=pressure_in-gradient*length
        self.assertLess(pressure_out,pressure_in)
        self.assertEqual((pressure_out-pressure_in)/length,-gradient)

    def test_all_pinned_original_source_hashes_match_git_bytes(self):
        import subprocess
        source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-04.json'
        ref='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
        originals=json.loads(subprocess.check_output(['git','show',ref+':'+source_path],cwd=REPO))
        original_hashes={row['id']:digest(row) for row in originals}
        count=0
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            self.assertEqual(len(module.READ_SOURCE_SHA256),16)
            for source_id,frozen in module.READ_SOURCE_SHA256.items():
                self.assertEqual(original_hashes[source_id],frozen)
                count+=1
        self.assertEqual(count,80)

    def test_numeric_choice_alternatives_have_one_exact_solution(self):
        count=0
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            package,bindings=reviewed_inputs(module,batch)
            expected=module.oracle()
            for row in package['records']:
                n=int(row['id'].rsplit('-',1)[1]);want=expected[n-1]
                if row['answer']['type']!='choice' or isinstance(want,str):continue
                suffix=module.SUFFIX.get(n,'')
                matches=[]
                for option in row['answer']['options']:
                    raw=option.replace('−','-')
                    if suffix:
                        self.assertTrue(raw.endswith(suffix));raw=raw.removesuffix(suffix)
                    value=module.exact_literal(raw.strip())
                    if sp.simplify(value-want)==0:matches.append(option)
                self.assertEqual(matches,[row['answer']['value']],row['id'])
                count+=1
        self.assertGreaterEqual(count,25)

    def test_bounded_arithmetic_ast_for_rational_and_radical_choices(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            with self.subTest(batch=batch):
                self.assertEqual(module.exact_literal('0.5'),sp.Rational(1,2))
                self.assertEqual(module.exact_literal('2√5/5'),2*sp.sqrt(5)/5)
                self.assertEqual(module.exact_literal('(√13-1)/4'),(sp.sqrt(13)-1)/4)
                for raw in ['1/0','r(-1)','10**1000000','__import__(1)','r(1,2)','[1,2]','nan','1e1000','r(10001)']:
                    with self.assertRaises((ValueError,SyntaxError)):
                        module.exact_literal(raw)

    def test_svg_exact_curves_and_units_are_the_reviewed_geometry(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        diss=ET.parse(APP/'editorial/assets/viscous-dissipation-progressive.svg')
        profile=ET.parse(APP/'editorial/assets/parabolic-profile-progressive.svg')
        couette=ET.parse(APP/'editorial/assets/couette-force-progressive.svg')
        pressure=ET.parse(APP/'editorial/assets/pressure-gradient-fixed-speed-progressive.svg')
        def paths(tree):return [p.attrib.get('d') for p in tree.findall('.//s:path',ns)]
        self.assertIn('M100 1500Q200 1500 300 1180',paths(diss))
        self.assertIn('M100 290Q250 290 400 530',paths(profile))
        t=sp.Symbol('t',real=True)
        x=100*(1-t)**2+2*200*(1-t)*t+300*t*t
        y=1500*(1-t)**2+2*1500*(1-t)*t+1180*t*t
        self.assertEqual(sp.simplify((1500-y)/10-2*((x-100)/50)**2),0)
        x=100*(1-t)**2+2*250*(1-t)*t+400*t*t
        y=290*(1-t)**2+2*290*(1-t)*t+530*t*t
        self.assertEqual(sp.simplify((530-y)/60-4*(1-((x-100)/300)**2)),0)
        self.assertIn('M200 420L300 240',paths(couette))
        self.assertIn('M100 1510L300 1310',paths(couette))
        self.assertIn('M100 1240L400 1480',paths(pressure))
        self.assertIn('M100 1240L400 1300',paths(pressure))
        self.assertEqual(Fraction(1240-1480,3)/Fraction(400-100,300),-80)
        self.assertEqual(Fraction(1240-1300,3)/Fraction(400-100,300),-20)

if __name__=='__main__':unittest.main()
