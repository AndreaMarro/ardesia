"""Reproducible independent145–147 superposition, beating and projection audits, never importing candidate authoring."""
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
FAMILIES=[('coherent_destructive','coherent-destructive-145'),('beats_envelope','beats-envelope-146'),('wave_displacement_projection','wave-displacement-projection-147')]
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
    false_proof='Il coseno di una fase reale può valere due; una differenza positiva ha sempre la somma come ampiezza e il Doppler è la differenza fra due sorgenti ferme.'
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
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['course']='C3';rebind(row,links)
    results=verify_with_replaced_tokens(module,changed,links)
    errors=next(r['errors'] for r in results if r['id']==row['id'])
    if not any('real course' in e for e in errors):raise AssertionError('Wrong course escaped real lesson mapping')
    cases.append({'case':'wrong_course_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':['independent real course and lesson mapping']})
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


class CrossReviewSuperpositionBeatsProjectionTests(unittest.TestCase):
    def test_all_forty_eight_reports_satisfy_canonical_record_identity(self):
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
        self.assertEqual(48,count)

    def test_independent_oracles_and_edition_integrity(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                result=audit(module,package,bindings)
                self.assertEqual(25,result['passed'])



from fractions import Fraction
from hypothesis import given,settings,strategies as st
import math
import re
import sympy as sp
import xml.etree.ElementTree as ET


class SuperpositionBeatsProjectionProperties(unittest.TestCase):
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,10))
    def test_destructive_branch_and_inverse(self,small,residual,scale):
        large=small+residual
        self.assertEqual(large-small,residual)
        self.assertEqual(residual+small,large)
        self.assertEqual(large-residual,small)
        self.assertEqual((large*scale-small*scale)/residual,scale)
        self.assertGreater(large,small)
        # Cancellation is of the signed coordinate, not of two positive moduli.
        self.assertEqual(Fraction(large,2)-Fraction(small,2),Fraction(residual,2))
        other_small=small+1;other_large=other_small+2*residual
        mean_residual=Fraction(residual+2*residual,2)
        self.assertEqual(Fraction(large+other_large,2)-Fraction(small+other_small,2),mean_residual)
        # A universal commutation with absolute value is false across branches.
        self.assertNotEqual((abs(large-small)+abs(small-large))/2,abs((large-small+small-large)/2))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,8),st.integers(300,900),st.integers(1,4))
    def test_beating_difference_modulus_period_and_common_shift(self,difference,lower,scale):
        higher=lower+difference
        self.assertLess(Fraction(difference,lower),Fraction(1,10))
        self.assertEqual(higher-lower,difference)
        self.assertEqual((higher+77)-(lower+77),difference)
        beat_period=Fraction(1,difference)
        slow_signed_period=Fraction(2,difference)
        self.assertEqual(2*beat_period,slow_signed_period)
        # The slow cosine changes sign over one modulus period.
        self.assertAlmostEqual(math.cos(math.pi*difference*float(beat_period)),-1.0)
        self.assertAlmostEqual(abs(math.cos(math.pi*difference*float(beat_period))),1.0)
        self.assertEqual((higher*scale-lower*scale),difference*scale)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,1000),st.integers(1,8),st.integers(1,10))
    def test_doppler_harmonic_inverse_and_subsonic_domain(self,emitted,numerator,extra):
        speed_ratio=Fraction(numerator,numerator+extra)
        self.assertGreater(speed_ratio,0);self.assertLess(speed_ratio,1)
        approach=Fraction(emitted,1-speed_ratio);recede=Fraction(emitted,1+speed_ratio)
        recovered=2*approach*recede/(approach+recede)
        self.assertEqual(recovered,emitted)
        self.assertEqual((approach-recede)/(approach+recede),speed_ratio)
        self.assertLess(recede,emitted);self.assertGreater(approach,emitted)
        self.assertGreater((approach+recede)/2,emitted)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,20),st.integers(1,20),st.integers(1,10))
    def test_projection_product_inverse_and_domain(self,amplitude,p,q,scale):
        cosine=Fraction(p,p+q);displacement=amplitude*cosine
        self.assertGreater(displacement,0);self.assertLess(displacement,amplitude)
        self.assertEqual(displacement/cosine,amplitude)
        self.assertEqual(displacement/amplitude,cosine)
        self.assertEqual((amplitude*scale)*cosine/displacement,scale)
        self.assertEqual(Fraction(amplitude*scale,amplitude),scale)
        # Choosing a greater target than A would demand a nonphysical cosine.
        self.assertGreater(Fraction(amplitude+1,amplitude),1)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_projection_mean_covariance_and_quadratic_constraint(self,A,B,p,q):
        c=Fraction(p,p+q);d=Fraction(q,p+q)
        mean_outputs=(A*c+B*d)/2
        output_at_means=Fraction(A+B,2)*(c+d)/2
        self.assertEqual(mean_outputs-output_at_means,Fraction(A-B,4)*(c-d))
        coefficient=Fraction(8)
        self.assertEqual(coefficient*Fraction(1,2)**2,2)
        self.assertEqual(coefficient*Fraction(-1,2)**2,2)
        # Both roots satisfy the algebra, only the positive root is in the task domain.
        physical=[x for x in [Fraction(-1,2),Fraction(1,2)] if 0<x<=1]
        self.assertEqual(physical,[Fraction(1,2)])

    def test_symbolic_proofs_and_dimensional_models(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            result=module.oracle()
            self.assertEqual(16,len(result))
            for value in result:
                if not isinstance(value,str):
                    self.assertIs(value.is_real,True)
                    self.assertIs(value.is_finite,True)
            self.assertEqual(module.SI.Quantity(1,'mm').to('m').magnitude,Fraction(1,1000))
            self.assertEqual(module.SI.Unit('Hz').dimensionality,{'[time]':-1})

    def test_safe_literal_parser_rejects_code_and_excessive_trees(self):
        module=importlib.import_module('tools.corpus_engineering.wave_displacement_projection_verifier')
        for raw in ['__import__("os").system("true")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1']:
            with self.subTest(raw=raw):
                with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):
                    module.exact_literal(raw)
        self.assertEqual(module.exact_literal('1/2'),sp.Rational(1,2))
        self.assertEqual(module.exact_literal('-1/2'),-sp.Rational(1,2))
        self.assertEqual(module.exact_literal('0.5'),sp.Rational(1,2))

    def test_scientific_svg_coordinates_and_scale(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        root=ET.parse(APP/'editorial/assets/coherent-destructive-progressive.svg').getroot()
        curves=[e for e in root.findall('.//s:path',ns) if len(e.attrib.get('d',''))>1000]
        self.assertEqual(len(curves),3)
        for curve,zero,coefficient in zip(curves,[270,580,870],[100,-25,75]):
            points=[tuple(map(float,p)) for p in re.findall(r'[ML]\s*([\d.]+)[ ,]([\d.]+)',curve.attrib['d'])]
            self.assertEqual(len(points),241)
            for x,y in points:
                theta=(x-100)*math.pi/200
                self.assertAlmostEqual(y,zero-coefficient*math.cos(theta),delta=0.002)
        bars=[e for e in root.findall('.//s:rect',ns) if 'y' in e.attrib]
        self.assertEqual([int(e.attrib['width']) for e in bars],[160,40,120,240,160,80])
        root=ET.parse(APP/'editorial/assets/beats-envelope-progressive.svg').getroot()
        curve=next(e for e in root.findall('.//s:path',ns) if len(e.attrib.get('d',''))>1000)
        points=[tuple(map(float,p)) for p in re.findall(r'[ML]\s*([\d.]+)[ ,]([\d.]+)',curve.attrib['d'])]
        self.assertEqual(len(points),241)
        for x,y in points:
            t=(x-100)/400
            self.assertAlmostEqual(y,950-120*abs(math.cos(2*math.pi*t)),delta=0.002)
        # Never put multiple intended arrowheads in one path with marker-end.
        for path in root.findall('.//s:path',ns):
            if 'marker-end' in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
        root=ET.parse(APP/'editorial/assets/wave-displacement-projection-progressive.svg').getroot()
        circle=next(e for e in root.findall('.//s:circle',ns) if e.attrib.get('r')=='160')
        self.assertEqual((circle.attrib['cx'],circle.attrib['cy']),('260','350'))
        radius=next(e for e in root.findall('.//s:path',ns) if e.attrib.get('d')=='M260 350L340 211.436')
        self.assertAlmostEqual(math.hypot(80,350-211.436),160,delta=0.001)
        self.assertIn('M100 1000L420 800',[e.attrib.get('d') for e in root.findall('.//s:path',ns)])
        bars=[e for e in root.findall('.//s:rect',ns) if 'y' in e.attrib]
        self.assertEqual([int(e.attrib['width']) for e in bars],[120,180])


if __name__=='__main__':unittest.main()
