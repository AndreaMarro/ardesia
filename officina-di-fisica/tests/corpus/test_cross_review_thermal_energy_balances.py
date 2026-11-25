"""Reproducible independent153–157 thermodynamic heat/work audits, never importing candidate authoring."""
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
FAMILIES=[('isochoric_heat','isochoric-heat-153'),('isobaric_monatomic_heat','isobaric-monatomic-heat-154'),('isobaric_work','isobaric-work-155'),('first_law_expansion','first-law-expansion-156'),('compression_heating','compression-heating-157')]
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
    false_proof='Il calore è una proprietà immagazzinata; un recipiente rigido compie necessariamente lavoro positivo e il lavoro sul sistema si sottrae senza cambiare segno.'
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
    row['answer']['unit']='K' if before_unit=='J' else 'J'
    if row['answer']['unit']==before_unit:raise AssertionError('Unit mutation must actually change dimension')
    rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
    errors=[e for e in result['errors'] if 'numeric unit mismatch' in e]
    if result['ok'] or not errors:raise AssertionError('Wrong numeric physical unit escaped oracle')
    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['course']='C5';rebind(row,links)
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


class CrossReviewThermalEnergyBalanceTests(unittest.TestCase):
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
        self.assertEqual(count,80)

    def test_independent_oracles_and_edition_integrity(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                self.assertEqual(audit(module,package,bindings)['passed'],25)


from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET


class ThermalEnergyBalanceProperties(unittest.TestCase):
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(1,40),st.integers(1,12))
    def test_isochoric_rigid_boundary_and_total_capacity(self,capacity,increment,factor):
        work=0;internal=capacity*increment;heat=internal+work
        self.assertEqual(Fraction(heat,increment),capacity)
        self.assertEqual(Fraction(heat,capacity),increment)
        self.assertEqual(capacity*(factor*increment),factor*heat)
        # Reversing the temperature interval reverses the heat, without a
        # boundary displacement; the assigned heating branch excludes it.
        self.assertEqual(capacity*(-increment),-heat)
        self.assertGreater(heat,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,9))
    def test_monatomic_internal_work_and_heat_are_distinct(self,nR,increment,factor):
        internal=Fraction(3,2)*nR*increment
        work=nR*increment
        heat=internal+work
        self.assertEqual(heat,Fraction(5,2)*nR*increment)
        self.assertEqual(2*heat/(5*increment),nR)
        self.assertEqual(2*heat/(5*nR),increment)
        self.assertEqual(heat/internal,Fraction(5,3))
        self.assertNotEqual(heat,internal)
        self.assertEqual(Fraction(5,2)*(factor*nR)*increment,factor*heat)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,25),st.integers(1,25),st.integers(1,25))
    def test_isobaric_boundary_work_and_reversed_path(self,pressure,initial,increment):
        final=initial+increment
        forward=pressure*(final-initial)
        reverse=pressure*(initial-final)
        self.assertGreater(forward,0);self.assertLess(reverse,0)
        self.assertEqual(reverse,-forward)
        self.assertEqual(forward+reverse,0)
        self.assertEqual(Fraction(forward,increment),pressure)
        self.assertEqual(Fraction(forward,pressure),increment)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,80),st.integers(1,80),st.integers(1,8),st.integers(1,8))
    def test_first_law_positive_transfers_allow_all_internal_signs(self,heat,work,a,b):
        internal=heat-work
        self.assertEqual(internal+work,heat)
        self.assertEqual(heat-internal,work)
        other=a*heat-b*work
        if internal:
            ratio=Fraction(other,internal)
            self.assertEqual(ratio,Fraction(a*heat-b*work,heat-work))
        else:
            self.assertEqual(heat,work)
            with self.assertRaises(ZeroDivisionError):Fraction(other,internal)
        # This is a change of state, not an amount of internal energy assumed
        # positive. A positive incoming Q need not make U increase.
        self.assertEqual((internal>0)-(internal<0),(heat>work)-(heat<work))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,80),st.integers(1,80),st.integers(1,8),st.integers(1,8))
    def test_compression_on_to_by_conversion_and_weighted_scaling(self,heat,on,a,b):
        by=-on;internal=heat-by
        self.assertEqual(internal,heat+on)
        self.assertGreater(internal,heat);self.assertGreater(internal,on)
        self.assertEqual(internal-on,heat)
        self.assertEqual(internal-heat,on)
        ratio=Fraction(a*heat+b*on,internal)
        self.assertGreaterEqual(ratio,min(a,b));self.assertLessEqual(ratio,max(a,b))
        self.assertEqual(Fraction(heat+on,internal),1)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_bilinear_covariance_and_linear_mean_commutation(self,x,y,u,v):
        for coefficient in [Fraction(1),Fraction(5,2)]:
            mean=coefficient*Fraction(x*y+u*v,2)
            at_means=coefficient*Fraction(x+u,2)*Fraction(y+v,2)
            self.assertEqual(mean-at_means,coefficient*Fraction((x-u)*(y-v),4))
        self.assertEqual(Fraction((x-y)+(u-v),2),Fraction(x+u,2)-Fraction(y+v,2))
        self.assertEqual(Fraction((x+y)+(u+v),2),Fraction(x+u,2)+Fraction(y+v,2))

    def test_constraints_physical_roots_and_instrument_inverses(self):
        for coefficient,capacity_factor,energy in [(Fraction(1,5),1,20),(Fraction(1,5),Fraction(5,2),50)]:
            for root in [-10,10]:self.assertEqual(capacity_factor*coefficient*root*root,energy)
            self.assertEqual([r for r in [-10,10] if r>0 and coefficient*r>0],[10])
        for root in [-3,3]:self.assertEqual(Fraction(2,3)*root*root,6)
        self.assertEqual([r for r in [-3,3] if r>0 and Fraction(2,3)*r>0],[3])
        self.assertEqual(Fraction(5,2)*40-40,60)
        self.assertEqual(Fraction(2,3)*30+30,50)
        # Five independently derived references; same affine apparatus law,
        # different physical outputs and inverses in the individual oracles.
        for first,second,s1,s2 in [(20,80,41,161),(50,200,101,401),(6,20,13,41),(60,140,121,281),(50,90,101,181)]:
            gain=Fraction(s2-s1,second-first);offset=s1-gain*first
            self.assertEqual(gain,2);self.assertEqual(offset,1)
            self.assertEqual((s2-offset)/gain,second)

    def test_symbolic_proofs_and_dimensional_models(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            result=module.oracle();self.assertEqual(len(result),16)
            for value in result:
                if not isinstance(value,str):
                    self.assertIs(value.is_real,True);self.assertIs(value.is_finite,True)
            self.assertEqual(module.SI.Quantity(1,'kPa*liter').to('J').magnitude,1)
            self.assertEqual(module.SI.Quantity(1,'J/K').dimensionality,{'[mass]':1,'[length]':2,'[time]':-2,'[temperature]':-1})

    def test_safe_literal_parser_rejects_code_powers_and_unbounded_input(self):
        module=importlib.import_module('tools.corpus_engineering.isochoric_heat_verifier')
        for raw in ['__import__("os").system("true")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1']:
            with self.subTest(raw=raw):
                with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):
                    module.exact_literal(raw)
        self.assertEqual(module.exact_literal('81/20'),sp.Rational(81,20))
        self.assertEqual(module.exact_literal('-10'),-10)
        self.assertEqual(module.exact_literal('0.5'),sp.Rational(1,2))

    def test_scientific_svg_coordinates_scales_and_arrowheads(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        root=ET.parse(APP/'editorial/assets/isochoric-heat-progressive.svg').getroot()
        paths=[e.attrib.get('d') for e in root.findall('.//s:path',ns)]
        self.assertIn('M100 640L400 440',paths)
        points=[(float(e.attrib['cx']),float(e.attrib['cy'])) for e in root.findall('.//s:circle',ns)]
        self.assertEqual(points,[(250,540),(400,440)])
        for x,y in points:
            delta=(x-100)/15;heat=(640-y)/5;self.assertEqual(heat,2*delta)
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='32']
        self.assertEqual([int(e.attrib['width']) for e in bars],[100,400,250])
        root=ET.parse(APP/'editorial/assets/isobaric-monatomic-heat-progressive.svg').getroot()
        bars=[e for e in root.findall('.//s:rect',ns) if 'y' in e.attrib]
        self.assertEqual([int(e.attrib['width']) for e in bars],[150,250,400,240,160,250,150,100])
        root=ET.parse(APP/'editorial/assets/isobaric-work-progressive.svg').getroot()
        areas=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='120']
        self.assertEqual(len(areas),2)
        for rectangle in areas:
            volume=Fraction(int(rectangle.attrib['width']),35)
            pressure=Fraction(int(rectangle.attrib['height']),60)
            self.assertEqual(pressure*volume,6)
        paths=[e.attrib.get('d') for e in root.findall('.//s:path',ns)]
        self.assertIn('M135 180H240',paths);self.assertIn('M240 580H135',paths)
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='32']
        self.assertEqual([Fraction(int(e.attrib['width']),15) for e in bars],[6,20,13])
        root=ET.parse(APP/'editorial/assets/first-law-expansion-progressive.svg').getroot()
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('y') in ['456','536']]
        self.assertEqual([Fraction(int(e.attrib['width']),5) for e in bars],[100,60,40])
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='32']
        self.assertEqual([Fraction(int(e.attrib['width']),3) for e in bars],[60,140,100])
        root=ET.parse(APP/'editorial/assets/compression-heating-progressive.svg').getroot()
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='48']
        self.assertEqual([Fraction(int(e.attrib['width']),6) for e in bars],[20,30,50])
        bars=[e for e in root.findall('.//s:rect',ns) if e.attrib.get('height')=='32']
        self.assertEqual([Fraction(int(e.attrib['width']),5) for e in bars],[50,90,70])
        # Each intended arrow has its own endpoint, preserving the stated sign.
        for _,batch in FAMILIES:
            family=batch.rsplit('-',1)[0]
            root=ET.parse(APP/'editorial/assets'/f'{family}-progressive.svg').getroot()
            for path in root.findall('.//s:path',ns):
                if 'marker-end' in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)


if __name__=='__main__':unittest.main()
