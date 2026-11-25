"""Reproducible independent U6 electric audits, separate from authoring, never importing candidate authoring."""
import base64
from copy import deepcopy
import importlib
import json
from pathlib import Path
import tempfile
import subprocess
import unittest
from unittest.mock import patch

from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
REPO=APP.parent
FAMILIES=[('charge_accelerating_voltage','charge-accelerating-voltage-197'),('electric_transverse_displacement','electric-transverse-displacement-198'),('electric_gravity_balance','electric-gravity-balance-199')]
AUDIT_RESULTS={}


FIXTURES=APP/'editorial/reviews/u6-independent-195-199-fixtures-20261125'

def reviewed_inputs(module,batch):
    for package_file,binding_file in [(APP/'editorial/batches'/f'{batch}.json',APP/'editorial/batches'/f'{batch}-bindings.json'),(FIXTURES/batch/'package.json',FIXTURES/batch/'bindings.json')]:
        try:package=json.loads(package_file.read_text());bindings=json.loads(binding_file.read_text())
        except FileNotFoundError:continue
        if digest(package)==module.REVIEWED_PACKAGE_SHA256 and digest(bindings)==module.REVIEWED_BINDINGS_SHA256:return package,bindings
    raise AssertionError('Exact independently read package fixture unavailable')

def reviewed_assets(module):
    canonical=APP/'editorial/assets'
    if (canonical/(module.FAMILY+'-progressive.svg')).exists():return canonical
    return FIXTURES/next(batch for _,batch in FAMILIES if batch.startswith(module.FAMILY+'-'))


def rebind(row,links):
    next(b for b in links if b['id']==row['id'])['candidateSha256']=digest(row)


def verify_with_replaced_tokens(module,package,links):
    """Test only: deliberately replace every edition guard, retaining math oracle."""
    tokens={r['id']:token for r,b,token,a,e in reviewed_rows(package,links,{},module.EXPECTED_IDS,reviewed_assets(module))}
    with patch.dict(module.REVIEWED_CANDIDATES,tokens),patch.multiple(module,
          REVIEWED_PACKAGE_SHA256=digest(package),REVIEWED_BINDINGS_SHA256=digest(links)):
        return module.verify(package,links,reviewed_assets(module))


def audit(module,package,bindings):
    good=module.verify(package,bindings,reviewed_assets(module))
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
    false_proof='Il campo elettrico ha unità newton e il lavoro del campo è sempre uguale alla variazione di energia cinetica anche con altri lavori presenti.'
    row['blocks'].append({'type':'text','text':false_proof});rebind(row,links)
    result=next(r for r in module.verify(changed,links,reviewed_assets(module)) if r['id']==row['id'])
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
        try:module.verify(changed,bindings,reviewed_assets(module))
        except ValueError:cases.append({'case':label+'_batch','rejectedBy':['complete unique batch boundary']})
        else:raise AssertionError('Invalid batch boundary accepted: '+label)
    changed=deepcopy(package)
    asset=changed['assets'][0]
    asset['data']=base64.b64encode(base64.b64decode(asset['data'])+b' ').decode()
    try:module.verify(changed,bindings,reviewed_assets(module))
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



class CrossReviewElectric197199(unittest.TestCase):
    def test_forty_eight_fresh_saved_reports_identity_dependency(self):
        from tools.corpus_engineering.batches import assert_record_identity
        total=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            self.assertTrue(all(r['verificationMode']in ['EXACT_ORACLE','AI_CONCEPTUAL']for r in fresh['records']))
            self.assertTrue(all(r['reviewDependencySha256']['electric_exact_literals.py']==m.REVIEWED_LITERAL_CODEC_SHA256 for r in fresh['records']));total+=16
        self.assertEqual(total,48)

    def test_source_primary_and_git_frozen_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a')
        sources=json.loads(raw);sources=sources if isinstance(sources,list)else sources['questions'];sources={r['id']:r for r in sources}
        primary=FIXTURES/'primary-source-only.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256)
        self.assertEqual(primary.read_text().count('### Derivazione indipendente'),80)
        for name,batch in FAMILIES:
            m=module(name);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            for suffix,local in [('.json','package.json'),('-bindings.json','bindings.json')]:
                expected=subprocess.check_output(['git','show',m.CANDIDATE_REF+f':officina-di-fisica/editorial/batches/{batch}{suffix}'],cwd=REPO)
                self.assertEqual(expected,(FIXTURES/batch/local).read_bytes())

    def test_retokenized_wrong_keys_binding_and_package_faults(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],25)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_speed_energy_and_inverse(self,U,mass,k):
        m=module('charge_accelerating_voltage');U,mass,k=map(sp.Integer,(U,mass,k));v=m.speed(U,mass)
        self.assertEqual(sp.simplify(mass*v**2/2),U);self.assertEqual(m.inverse_voltage(v,mass),U)
        self.assertEqual(sp.simplify(m.speed(k**2*U,mass)/v),k)
        self.assertEqual(sp.simplify(m.speed(U,k**2*mass)/v),1/k)
        self.assertLess(v/sp.Integer(299792458),sp.Rational(1,10**6)) # actual bounded property grid, not arbitrary model-domain claim

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_transverse_newton_and_quadratic_time(self,E,t,k):
        m=module('electric_transverse_displacement');E,t,k=map(sp.Integer,(E,t,k));s=m.displacement(E,t)
        self.assertEqual(s,E*t*t/2);self.assertEqual(m.inverse_field(s,t),E)
        self.assertEqual(m.displacement(E,k*t),k*k*s);self.assertEqual(m.displacement(k*E,t),k*s)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_equilibrium_force_and_inverse(self,mass,q,k):
        m=module('electric_gravity_balance');mass,q,k=map(sp.Integer,(mass,q,k));E=m.field(mass,q)
        self.assertEqual(q*E-10*mass,0);self.assertEqual(m.inverse_mass(E,q),mass)
        self.assertEqual(m.field(k*mass,q),k*E);self.assertEqual(m.field(mass,k*q),E/k)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_affine_calibration_before_inverse(self,gain,offset):
        for name,one,two in [('charge_accelerating_voltage',2,3),('electric_transverse_displacement',1,2),('electric_gravity_balance',5,20)]:
            m=module(name);self.assertEqual(m.calibrate(sp.Integer(one),sp.Integer(two),gain*one+offset,gain*two+offset),(gain,offset))
            self.assertEqual(sp.cancel((gain*7+offset-offset)/sp.Integer(gain)),7)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50))
    def test_preparation_constraints_do_not_change_in_time(self,scale):
        x=sp.Integer(scale);self.assertEqual(module('charge_accelerating_voltage').speed(2*x,x),2)
        self.assertEqual(module('electric_gravity_balance').field(x/2,x),5)
        self.assertEqual(module('electric_transverse_displacement').displacement(2*x,x),x**3)
        tau,T=sp.symbols('tau T',positive=True)
        prepared=sp.integrate((T-tau)*2*T,(tau,0,T));ramp=sp.integrate((T-tau)*2*tau,(tau,0,T))
        self.assertEqual(prepared,T**3);self.assertEqual(ramp,T**3/3)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50))
    def test_exact_SI_prefactors_and_force_balance_units(self,scale):
        m=module('electric_gravity_balance');Q=m.SI.Quantity
        self.assertEqual((Q(scale,'milligram')*Q(10,'meter/second**2')/Q(2,'microcoulomb')).to('newton/coulomb').magnitude,Fraction(5*scale))
        self.assertEqual((Q(scale,'microcoulomb')*Q(2,'kilovolt')).to('millijoule').magnitude,2*scale)

    def test_nonfinite_nonreal_and_nonpositive_domains(self):
        for name,functions in [('charge_accelerating_voltage',['speed','inverse_voltage']),('electric_transverse_displacement',['displacement','inverse_field']),('electric_gravity_balance',['field','inverse_mass'])]:
            m=module(name)
            for function in functions:
                for invalid in [sp.I,sp.oo,-sp.oo,sp.nan,0,-1]:
                    for args in [(invalid,3),(6,invalid)]:
                        with self.assertRaises(ValueError):getattr(m,function)(*args)
        m=module('charge_accelerating_voltage')
        with self.assertRaises(ValueError):m.speed(sp.Integer(299792458)**2,1)
        with self.assertRaises(ValueError):m.inverse_voltage(299792458,1)
        self.assertEqual(m.speed(2,1),2)

    def test_exact_radicals_means_and_constitutive_faults(self):
        m=module('charge_accelerating_voltage');self.assertEqual(m.decode_read_quantity('√(22/3)'),sp.sqrt(sp.Rational(22,3)))
        for bad in ['√(__import__("os"))','√(x)','r(-1)','1e3','0.1+__import__("os")']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.decode_read_quantity(bad)
        self.assertNotEqual(sp.Rational(5,2),sp.sqrt(sp.Rational(22,3)))
        self.assertNotEqual(sp.Rational(3,2),sp.Rational(27,16));self.assertNotEqual(sp.Rational(25,2),10)
        for name,func in [('charge_accelerating_voltage','speed'),('electric_transverse_displacement','displacement'),('electric_gravity_balance','field')]:
            m=module(name);m.oracle.cache_clear();original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *args,_original=original,**kwargs:_original(*args,**kwargs)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_codec_dependency_drift_rejected_per_record(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            with patch.object(m,'REVIEWED_LITERAL_CODEC_SHA256','0'*64):
                result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result))
                self.assertTrue(all('Independent exact literal codec dependency changed'in r['errors']for r in result))

    def test_native_assets_scales_exact_quadratic_and_unhidden_heads(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        expected_widths={'197':[200,300,250],'198':[160,320,240],'199':[80,320,200]}
        for name,batch in FAMILIES:
            m=module(name);D=FIXTURES/batch;manifest=json.loads((D/'manifest.json').read_text())
            for f,h in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),h)
            self.assertTrue((D/'full-native.png').read_bytes().startswith(b'\x89PNG'));self.assertIn('OBSERVED_EXIT=0',(D/'native-render.txt').read_text())
            svg=ET.parse(D/(m.FAMILY+'-progressive.svg')).getroot();bars=[Fraction(e.attrib['width'])for e in svg.findall('.//s:rect',ns)if e.attrib.get('height')=='38']
            self.assertEqual(bars,expected_widths[batch[-3:]])
            for p in svg.findall('.//s:path',ns):
                if 'marker-end'in p.attrib:self.assertEqual(p.attrib['d'].count('M'),1)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in svg.findall('.//s:text',ns)))
            if batch.endswith(('197','198')):
                self.assertTrue(any(p.attrib.get('d')=='M100 830Q300 830 500 590'for p in svg.findall('.//s:path',ns)))
        t=sp.symbols('t',real=True);x=(1-t)**2*100+2*(1-t)*t*300+t*t*500;y=(1-t)**2*830+2*(1-t)*t*830+t*t*590
        self.assertEqual(sp.expand((830-y)/30-(x-100)**2/20000),0) # 197 K=m v^2/2 in mJ
        self.assertEqual(sp.expand((830-y)/60-((x-100)/200)**2),0) # 198 y=t^2
        D=FIXTURES/'electric-gravity-balance-199';svg=ET.parse(D/'electric-gravity-balance-progressive.svg').getroot();paths={p.attrib.get('d')for p in svg.findall('.//s:path',ns)}
        self.assertIn('M320 232V120',paths);self.assertIn('M320 288V400',paths)
        self.assertEqual(260-232,288-260);self.assertEqual(232-120,400-288)

if __name__=='__main__':unittest.main()
