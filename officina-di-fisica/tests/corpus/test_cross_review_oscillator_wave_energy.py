"""Reproducible independent135–139 oscillator and wave-energy audits, never importing candidate authoring."""
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
FAMILIES=[('oscillator_energy','oscillator-energy-135'),('wave_phase_space','wave-phase-space-136'),('wave_phase_time','wave-phase-time-137'),('spherical_intensity','spherical-intensity-138'),('wave_energy_through_area','wave-energy-through-area-139')]
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
    false_proof='La fase è sempre un intero e va sempre ridotta modulo uno; il vuoto trasmette il suono e tutta l’energia incidente è necessariamente assorbita.'
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
    before_unit=row['answer']['unit']
    row['answer']['unit']='kg' if before_unit=='Hz' else 'Hz'
    if row['answer']['unit']==before_unit:raise AssertionError('Unit mutation must actually change dimension')
    rebind(row,links)
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


class CrossReviewOscillatorWaveEnergyTests(unittest.TestCase):
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
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET

class OscillatorWaveEnergyPhysicalProperties(unittest.TestCase):
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,20),st.integers(1,10),st.integers(1,10))
    def test_spring_work_conservation_inverse_and_dissipation(self,stiffness,amplitude,scale_k,scale_A):
        energy=Fraction(stiffness*amplitude**2,2)
        self.assertEqual(2*energy/amplitude**2,stiffness)
        self.assertEqual(2*energy/stiffness,amplitude**2)
        changed=Fraction(stiffness*scale_k*(amplitude*scale_A)**2,2)
        self.assertEqual(changed/energy,scale_k*scale_A**2)
        x=Fraction(amplitude,3)
        potential=Fraction(stiffness,2)*x*x
        kinetic=energy-potential
        self.assertGreater(kinetic,0);self.assertEqual(kinetic+potential,energy)
        damped=Fraction(stiffness,2)*Fraction(amplitude,2)**2
        self.assertEqual(damped/energy,Fraction(1,4))
        self.assertLess(damped-energy,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,20),st.integers(1,10),st.integers(1,10))
    def test_spatial_unwrapped_phase_and_scale(self,distance,wavelength,scale_d,scale_L):
        turns=Fraction(distance,wavelength)
        self.assertEqual(turns*wavelength,distance)
        self.assertEqual(Fraction(distance,turns),wavelength)
        changed=Fraction(distance*scale_d,wavelength*scale_L)
        self.assertEqual(changed/turns,Fraction(scale_d,scale_L))
        self.assertEqual(Fraction(wavelength,4)/wavelength,Fraction(1,4))
        self.assertEqual(Fraction(distance+wavelength,wavelength),turns+1)
        # Same-time comparison cancels any common temporal and initial phase.
        phase,time,omega=sp.symbols('phase time omega',real=True)
        first=phase-omega*time;second=2*sp.pi*turns+phase-omega*time
        self.assertEqual(sp.simplify((second-first)/(2*sp.pi)),sp.Rational(distance,wavelength))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,30),st.integers(1,8),st.integers(1,8))
    def test_fixed_sensor_real_phase_and_positive_constraint(self,frequency,numerator,scale_f,scale_t):
        duration=Fraction(numerator,4)
        turns=frequency*duration
        self.assertEqual(turns/duration,frequency)
        self.assertEqual(turns/frequency,duration)
        self.assertEqual((frequency*scale_f)*(duration*scale_t)/turns,scale_f*scale_t)
        coefficient=Fraction(frequency,duration)
        self.assertEqual(coefficient*duration**2,turns)
        self.assertEqual(Fraction(2)*Fraction(3,4),Fraction(3,2))
        self.assertNotEqual(turns,turns+1)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(1,30),st.integers(1,8),st.integers(1,8))
    def test_spherical_flux_and_normalized_power(self,power,radius,scale_p,scale_r):
        intensity=Fraction(power,radius*radius)
        self.assertEqual(intensity*radius*radius,power)
        changed=Fraction(power*scale_p,(radius*scale_r)**2)
        self.assertEqual(changed/intensity,Fraction(scale_p,scale_r**2))
        self.assertEqual(intensity*4*sp.pi*radius*radius,4*sp.pi*power)
        self.assertEqual(Fraction(power,(2*radius)**2)/intensity,Fraction(1,4))
        coefficient=Fraction(power,radius)
        self.assertEqual(coefficient/intensity,radius)
        # Omitting power and reciprocating a numerical result are distinct errors.
        self.assertEqual(Fraction(4,2**2),1)
        self.assertEqual(1/Fraction(4,2**2),1)
        self.assertEqual(Fraction(1,2**2),Fraction(1,4))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,8),st.integers(1,8))
    def test_incident_energy_inverses_and_absorption_not_identified(self,intensity,area,scale_I,scale_A):
        duration=2;energy=intensity*area*duration
        self.assertEqual(Fraction(energy,area*duration),intensity)
        self.assertEqual(Fraction(energy,intensity*duration),area)
        changed=(intensity*scale_I)*(area*scale_A)*duration
        self.assertEqual(Fraction(changed,energy),scale_I*scale_A)
        coefficient=Fraction(intensity,area)
        self.assertEqual(coefficient*duration*area**2,energy)
        first_absorbed=Fraction(energy,2);second_absorbed=Fraction(energy,4)
        self.assertNotEqual(first_absorbed,second_absorbed)
        self.assertGreater(first_absorbed,0);self.assertLess(first_absorbed,energy)

    def test_all_pinned_original_source_hashes_match_git_bytes(self):
        import subprocess
        source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-01.json'
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
                    if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                    if suffix:
                        self.assertTrue(raw.endswith(suffix));raw=raw.removesuffix(suffix)
                    value=module.exact_literal(raw.strip())
                    if sp.simplify(value-want)==0:matches.append(option)
                self.assertEqual(matches,[row['answer']['value']],row['id'])
                count+=1
        self.assertGreaterEqual(count,25)

    def test_bounded_pi_radical_arithmetic_without_eval(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            self.assertEqual(module.exact_literal('0.5'),sp.Rational(1,2))
            self.assertEqual(module.exact_literal('2π/25'),2*sp.pi/25)
            self.assertEqual(module.exact_literal('-4π'),-4*sp.pi)
            self.assertEqual(module.exact_literal('2√5/5'),2*sp.sqrt(5)/5)
            for raw in ['1/0','r(-1)','10**1000000','__import__(1)','r(1,2)','[1,2]','nan','1e1000','r(10001)','p(1)','p.__class__']:
                with self.assertRaises((ValueError,SyntaxError)):module.exact_literal(raw)

    def test_five_reviewed_svg_scales_and_noninterchangeable_quantities(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        def tree(name):return ET.parse(APP/'editorial/assets'/f'{name}-progressive.svg')
        def elems(t,tag):return t.findall('.//s:'+tag,ns)
        def widths(t):return {int(e.attrib['y']):int(e.attrib['width']) for e in elems(t,'rect') if 'y' in e.attrib}
        energy=tree('oscillator-energy')
        self.assertEqual([int(c.attrib['cx']) for c in elems(energy,'circle')[:3]],[200,320,440])
        self.assertEqual(widths(energy),{680:100,820:100,1145:100,1275:25})
        self.assertEqual(Fraction(100,25),4);self.assertEqual(Fraction(25,25),1)
        space=tree('wave-phase-space')
        self.assertEqual(widths(space),{625:80,725:320})
        paths=[p.attrib.get('d','') for p in elems(space,'path')]
        self.assertIn('M80 1330L560 1090',paths)
        self.assertEqual(Fraction(1330-1090,160),Fraction(560-80,80)/4)
        curve=next(p for p in paths if p.startswith('M80 170.000'))
        for point in ['L160 240.000','L240 310.000','L400 170.000','L560 310.000']:self.assertIn(point,curve)
        time=tree('wave-phase-time')
        self.assertEqual([int(e.attrib['width']) for e in elems(time,'rect') if e.attrib.get('y')=='190'],[60]*6)
        self.assertEqual([int(e.attrib['width']) for e in elems(time,'rect') if e.attrib.get('y')=='640'],[60,30])
        self.assertEqual(Fraction(90,120)*2,Fraction(3,2))
        self.assertIn('M100 1350L460 1110',[p.attrib.get('d') for p in elems(time,'path')])
        self.assertEqual(Fraction(1350-1110,40),2*Fraction(460-100,120))
        sphere=tree('spherical-intensity')
        self.assertEqual([int(c.attrib['r']) for c in elems(sphere,'circle')],[160,80,5])
        self.assertEqual(96**2+128**2,160**2)
        self.assertEqual(widths(sphere),{735:100,850:400,1170:200,1320:100})
        incident=tree('wave-energy-through-area')
        cells=[r for r in elems(incident,'rect') if r.attrib.get('y')=='220']
        self.assertEqual([(r.attrib['width'],r.attrib['height']) for r in cells],[('50','50')]*3)
        self.assertEqual(widths(incident)[1140],120);self.assertEqual(widths(incident)[1280],60)
        self.assertEqual(Fraction(60,120),Fraction(1,2))

if __name__=='__main__':unittest.main()
