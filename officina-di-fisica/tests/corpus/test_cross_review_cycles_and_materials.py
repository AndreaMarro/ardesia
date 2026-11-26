"""Reproducible independent163–167 thermodynamic heat/work audits, never importing candidate authoring."""
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
FAMILIES=[('reversible_refrigerator','reversible-refrigerator-163'),('carnot_work_temperature_gap','carnot-work-temperature-gap-164'),('adiabatic_monatomic','adiabatic-monatomic-165'),('free_expansion_pressure','free-expansion-pressure-166'),('sensible_heat','sensible-heat-167')]
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
    false_proof='Una trasformazione adiabatica mantiene sempre la temperatura e l’entropia costanti; il rendimento e il COP frigorifero sono sempre uguali e minori di uno.'
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



from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET
import hashlib

def module(name):
    return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

class CrossReviewCyclesAndMaterials(unittest.TestCase):
    def test_all_eighty_fresh_saved_reports_obey_canonical_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        count=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b)
            saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b)
            assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(saved,fresh)
            self.assertTrue(all(r['ok'] for r in fresh['records']))
            self.assertTrue(all(r['verificationMode'] in ['EXACT_ORACLE','AI_CONCEPTUAL'] for r in fresh['records']))
            count+=len(fresh['records'])
        self.assertEqual(count,80)

    def test_math_oracles_survive_deliberately_replaced_binding_and_edition_guards(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                m=module(name);p,b=reviewed_inputs(m,batch)
                self.assertEqual(audit(m,p,b)['passed'],25)

    def test_primary_eighty_predates_candidates_and_has_immutable_content(self):
        file=APP/'editorial/reviews/primary-thermal-cycles-163-167-before-candidates-20261125.md'
        self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),'8fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65')
        text=file.read_text()
        self.assertEqual(text.count('### u5-'),80)
        self.assertEqual(text.count('Derivazione indipendente prima delle chiavi:'),80)
        self.assertFalse(text.endswith('\n\n'))
        self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,500),st.integers(1,500),st.integers(1,9))
    def test_reversible_fridge_entropy_first_law_and_inverses(self,cold,gap,factor):
        m=module('reversible_refrigerator');cold=sp.Integer(cold);hot=cold+gap
        coefficient=m.refrigerator(hot,cold)
        self.assertEqual(coefficient,sp.Rational(cold,gap))
        self.assertEqual(m.hot_inverse(coefficient,cold),hot)
        self.assertEqual(coefficient*hot/(1+coefficient),cold)
        self.assertEqual(m.refrigerator(factor*hot,factor*cold),coefficient)
        qc=sp.Integer(7);qh=qc*hot/cold;work=qh-qc
        self.assertEqual(qh/hot,qc/cold)
        self.assertEqual(qc/work,coefficient)
        self.assertGreater(work,0)
        self.assertGreater(coefficient,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,500),st.integers(1,500),st.integers(1,15),st.integers(1,8))
    def test_carnot_dimensional_work_and_temperature_scale(self,cold,gap,k,factor):
        m=module('carnot_work_temperature_gap');hot=cold+gap
        work=m.cycle_work(sp.Integer(hot),sp.Integer(cold),sp.Integer(k))
        self.assertEqual(work,k*gap)
        self.assertEqual(m.cold_inverse(work,sp.Integer(hot),sp.Integer(k)),cold)
        self.assertEqual(m.cycle_work(sp.Integer(factor*hot),sp.Integer(factor*cold),sp.Integer(k)),factor*work)
        self.assertEqual(Fraction(cold,hot),Fraction(factor*cold,factor*hot))
        self.assertEqual(work+k*cold,k*hot)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,200),st.integers(1,12),st.integers(1,12))
    def test_adiabatic_exact_compression_expansion_and_work(self,initial,cube_root,nR):
        m=module('adiabatic_monatomic');initial=sp.Integer(initial);ratio=sp.Integer(cube_root)**3
        final=m.adiabatic(initial,ratio)
        self.assertEqual(final,initial*cube_root*cube_root)
        self.assertEqual(m.initial_inverse(final,ratio),initial)
        self.assertEqual(m.ratio_inverse(initial,final),ratio)
        self.assertEqual(m.adiabatic(final,1/ratio),initial)
        internal=sp.Rational(3,2)*nR*(final-initial);work_by=-internal
        self.assertGreaterEqual(internal,0);self.assertLessEqual(work_by,0)
        self.assertEqual(0-work_by,internal)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,200),st.integers(1,15),st.integers(1,8),st.integers(1,8))
    def test_free_expansion_fixed_offset_scaling_and_inverse(self,initial,vacuum,a,b):
        m=module('free_expansion_pressure');initial=sp.Integer(initial);vacuum=sp.Integer(vacuum)
        final=m.final_pressure(initial,vacuum)
        self.assertTrue(0<final<initial)
        self.assertEqual(m.vacuum_inverse(initial,final),vacuum)
        other=m.final_pressure(a*initial,b*vacuum)
        self.assertEqual(other/final,a*(1+vacuum)/(1+b*vacuum))
        self.assertEqual(sp.simplify(final*(1+vacuum)),initial)
        # Irreversibility: entropy derivative nR/(V0+Vv)>0 even with Q=W=0.
        entropy=sp.log(1+vacuum)
        self.assertGreater(entropy,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,10),st.integers(1,10))
    def test_sensible_heat_specific_capacity_mass_and_increment(self,mass,increment,a,b):
        m=module('sensible_heat');mass=sp.Integer(mass);increment=sp.Integer(increment)
        heat=m.sensible_heat(mass,increment)
        self.assertEqual(heat,2*mass*increment)
        self.assertEqual(m.mass_inverse(heat,increment),mass)
        self.assertEqual(m.sensible_heat(a*mass,b*increment),a*b*heat)
        self.assertEqual(m.SI.Quantity(2,'J/g/K').to('J/kg/K').magnitude,2000)
        self.assertEqual(m.SI.Quantity(mass,'g').to('kg').magnitude,Fraction(int(mass),1000))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_mean_coincidences_and_bilinear_counterexamples(self,x,y,u,v):
        self.assertEqual(Fraction((x-y)+(u-v),2),Fraction(x+u,2)-Fraction(y+v,2))
        gap=sp.Integer(7);cold1=sp.Integer(x);cold2=sp.Integer(y)
        m=module('reversible_refrigerator')
        self.assertEqual((m.refrigerator(cold1+gap,cold1)+m.refrigerator(cold2+gap,cold2))/2,
          m.refrigerator((cold1+cold2)/2+gap,(cold1+cold2)/2))
        mean=Fraction(2*x*y+2*u*v,2);atmeans=2*Fraction(x+u,2)*Fraction(y+v,2)
        self.assertEqual(mean-atmeans,Fraction((x-u)*(y-v),2))

    def test_physical_domain_boundaries_and_constraints(self):
        fridge=module('reversible_refrigerator');work=module('carnot_work_temperature_gap')
        adiabatic=module('adiabatic_monatomic');free=module('free_expansion_pressure');heat=module('sensible_heat')
        for h,c in [(0,0),(400,400),(200,400),(400,0),(400,-1)]:
            with self.assertRaises(ValueError):fridge.refrigerator(h,c)
        for coefficient,cold in [(0,200),(-1,200),(1,0)]:
            with self.assertRaises(ValueError):fridge.hot_inverse(coefficient,cold)
        for e,h in [(400,400),(401,400),(0,400),(-1,400)]:
            with self.assertRaises(ValueError):work.cold_inverse(e,h)
        for t,r in [(0,8),(-1,8),(100,0),(100,-8)]:
            with self.assertRaises(ValueError):adiabatic.adiabatic(t,r)
        for p,v in [(0,1),(100,0),(100,-1)]:
            with self.assertRaises(ValueError):free.final_pressure(p,v)
        for p,f in [(100,100),(100,101),(100,0)]:
            with self.assertRaises(ValueError):free.vacuum_inverse(p,f)
        for f in [0,100,101,-1]:
            with self.assertRaises(ValueError):free.constrained_vacuum(f)
        self.assertEqual(free.constrained_vacuum(sp.Integer(50)),1)
        self.assertEqual(adiabatic.adiabatic(sp.Rational(25,2)*8,sp.Integer(8)),400)
        for root in [-10,10]:self.assertEqual(sp.Rational(2,5)*root**2,40)
        self.assertEqual([r for r in [-10,10] if r>0 and Fraction(r,5)>0],[10])
        for m,t in [(0,10),(2,0),(-2,10),(2,-10)]:
            with self.assertRaises(ValueError):heat.sensible_heat(m,t)
        self.assertEqual(heat.classify_boundary(False,True),'Chiuso e non isolato termicamente')
        self.assertNotEqual(heat.classify_boundary(False,True),heat.classify_boundary(True,True))

    def test_safe_bounded_ast_and_dimensional_models(self):
        for name,_ in FAMILIES:
            m=module(name)
            self.assertEqual(len(m.oracle()),16)
            for bad in ['__import__("os")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1']:
                with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
            for good,want in [('1/150',sp.Rational(1,150)),('1601/8',sp.Rational(1601,8)),('−10'.replace('−','-'),sp.Integer(-10))]:
                self.assertEqual(m.exact_literal(good),want)
            self.assertEqual(m.SI.Quantity(1,'kPa*liter').to('J').magnitude,1)
        self.assertEqual(module('sensible_heat').SI.Quantity(2,'J/g/K').dimensionality,
          {'[length]':2,'[time]':-2,'[temperature]':-1})

    def test_read_scientific_svg_geometry_scales_and_distinct_arrowheads(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        def xml(f):return ET.parse(APP/'editorial/assets'/f'{f}-progressive.svg').getroot()
        root=xml('reversible-refrigerator')
        bars=root.findall('.//s:rect',ns)
        self.assertEqual([int(b.attrib['width']) for b in bars if b.attrib.get('height')=='32'],[100,100,200,200,300,250])
        self.assertEqual([int(b.attrib['width']) for b in xml('carnot-work-temperature-gap').findall('.//s:rect',ns) if b.attrib.get('height')=='34'],[400,200,400,200,200])
        self.assertEqual([int(b.attrib['width']) for b in xml('carnot-work-temperature-gap').findall('.//s:rect',ns) if b.attrib.get('height')=='32'],[200,300,250])
        root=xml('adiabatic-monatomic')
        volumes=[int(b.attrib['width']) for b in root.findall('.//s:rect',ns) if b.attrib.get('height')=='100']
        self.assertEqual(volumes,[320,40]);self.assertEqual(Fraction(*volumes),8)
        self.assertEqual([int(b.attrib['width']) for b in root.findall('.//s:rect',ns) if b.attrib.get('height')=='36'],[100,400])
        root=xml('free-expansion-pressure')
        self.assertEqual([int(b.attrib['width']) for b in root.findall('.//s:rect',ns) if b.attrib.get('height')=='140'],[400,400])
        self.assertIn('M305 98V232',[p.attrib.get('d') for p in root.findall('.//s:path',ns)])
        self.assertEqual(305,105+400/2)
        self.assertEqual([int(b.attrib['width']) for b in root.findall('.//s:rect',ns) if b.attrib.get('height')=='34'],[300,150])
        root=xml('sensible-heat')
        points=[(int(b.attrib['cx']),int(b.attrib['cy'])) for b in root.findall('.//s:circle',ns)]
        self.assertEqual(points,[(260,570),(410,450)])
        for x,y in points:self.assertEqual(Fraction(690-y,3),4*Fraction(x-110,15))
        self.assertEqual([int(b.attrib['width']) for b in root.findall('.//s:rect',ns) if b.attrib.get('height')=='30'],[80,320,200])
        for _,batch in FAMILIES:
            for p in xml(batch.rsplit('-',1)[0]).findall('.//s:path',ns):
                if 'marker-end' in p.attrib:self.assertEqual(p.attrib['d'].count('M'),1)

if __name__=='__main__':unittest.main()
