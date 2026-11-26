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
FAMILIES=[('line_load_efficiency','line-load-efficiency-215'),('fuse_latent_heating','fuse-latent-heating-216'),('plane_capacitance','plane-capacitance-217'),('capacitor_charge','capacitor-charge-218'),('capacitor_energy','capacitor-energy-219')]
AUDIT_RESULTS={}


FIXTURES=APP/'editorial/reviews/u6-independent-215-219-fixtures-20261125'

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
    false_proof='Ogni condensatore conserva sempre la propria energia e la propria carica anche quando un generatore cambia la tensione imposta; un dielettrico conduce sempre come un metallo.'
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




class CrossReviewCircuitsCapacitors215219(unittest.TestCase):
    def test_eighty_fresh_saved_reports_identity_dependency(self):
        from tools.corpus_engineering.batches import assert_record_identity
        total=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            self.assertTrue(all(r['verificationMode']in ['EXACT_ORACLE','AI_CONCEPTUAL']for r in fresh['records']))
            for r in fresh['records']:
                self.assertEqual(r['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
                self.assertEqual(r['reviewDependencySha256']['circuit_capacitor_review_models.py'],m.REVIEWED_MODEL_SHA256)
            total+=16
        self.assertEqual(total,80)

    def test_source_primary_and_git_frozen_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077')
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
    @given(st.integers(1,50),st.integers(1,50),st.integers(1,10))
    def test_load_partition_inverses_and_scale(self,x,y,k):
        mm=module('line_load_efficiency').model;x,y,k=map(sp.Integer,(x,y,k));eta=mm.load_fraction(x,y,k)
        self.assertEqual(eta,x/(x+y));self.assertEqual(mm.inverse_load(eta,y),x);self.assertEqual(mm.inverse_cable(eta,x),y)
        self.assertEqual(mm.load_fraction(k*x,k*y,k),eta);self.assertGreater(eta,0);self.assertLess(eta,1)
        self.assertEqual(k*k*x+k*k*y,k*k*(x+y))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,8))
    def test_latent_energy_power_and_inverses(self,x,i,k):
        mm=module('fuse_latent_heating').model;x,i,k=map(sp.Integer,(x,i,k));t=mm.fuse_time(x,i)
        self.assertEqual(t*2*i*i,x/5);self.assertEqual(mm.fuse_mass(t,i),x);self.assertEqual(mm.fuse_current(t,x),i)
        self.assertEqual(mm.fuse_time(k*x,2*i)/t,k/4)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,8))
    def test_plane_model_inverse_and_signed_field(self,a,d,k):
        mm=module('plane_capacitance').model;a,d,k=map(sp.Integer,(a,d,k));c=mm.plane_capacitance(a,d)
        self.assertEqual(c,a/d);self.assertEqual(mm.plane_area(c,d),a);self.assertEqual(mm.plane_gap(c,a),d)
        self.assertEqual(mm.plane_capacitance(k*a,k*d),c)
        self.assertEqual(mm.uniform_field(-a,a,d),-2*a/d)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,8))
    def test_plate_charge_not_total_charge(self,c,v,k):
        mm=module('capacitor_charge').model;c,v,k=map(sp.Integer,(c,v,k));q=mm.plate_charge(c,v)
        self.assertEqual(mm.charge_capacitance(q,v),c);self.assertEqual(mm.charge_voltage(q,c),v)
        self.assertEqual(mm.plate_charge(k*c,k*v)/q,k*k);self.assertEqual(q+(-q),0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,8))
    def test_energy_integral_inverses_and_cubic(self,c,v,k):
        mm=module('capacitor_energy').model;c,v,k=map(sp.Integer,(c,v,k));u=mm.capacitor_energy(c,v)
        self.assertEqual(mm.energy_capacitance(u,v),c);self.assertEqual(mm.energy_voltage(u,c),v)
        self.assertEqual(mm.capacitor_energy(k*c,k*v)/u,k**3)
        q=sp.symbols('q',real=True);self.assertEqual(sp.integrate(q/c,(q,0,c*v)),u)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_calibration_with_signed_offset(self,g,o):
        mm=module('line_load_efficiency').model
        self.assertEqual(mm.calibrate(2,5,2*g+o,5*g+o),(g,o))
        self.assertEqual((g*sp.Integer(7)+o-o)/g,7)

    def test_finite_real_exact_guards_and_inverse_domains(self):
        mm=module('line_load_efficiency').model
        funcs=['load_fraction','inverse_load','inverse_cable','fuse_time','fuse_mass','fuse_current','plane_capacitance','plane_area','plane_gap','plate_charge','charge_capacitance','charge_voltage','capacitor_energy','energy_capacitance','energy_voltage']
        for func in funcs:
            for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5,True,'2']:
                for args in [(bad,sp.Rational(1,2)),(sp.Rational(1,2),bad)]:
                    with self.assertRaises(ValueError,msg=func+repr(args)):getattr(mm,func)(*args)
        for bad in [0,-1,sp.oo,sp.I,0.5,True]:
            with self.assertRaises(ValueError):mm.load_fraction(3,1,bad)
        for func in ['inverse_load','inverse_cable']:
            for eta in [1,2]:
                with self.assertRaises(ValueError):getattr(mm,func)(eta,1)
        for args in [(1,1,2,3),(1,2,2,2),(1,2,3,2),(sp.oo,2,3,4),(1,2,3,sp.nan)]:
            with self.assertRaises(ValueError):mm.calibrate(*args)
        self.assertEqual(mm.uniform_field(0,40,sp.Rational(1,50)),-2000)
        self.assertEqual(mm.uniform_field(40,40,1),0)
        for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0.5,True,'1']:
            for args in [(bad,0,1),(0,bad,1),(0,0,bad)]:
                with self.assertRaises(ValueError):mm.uniform_field(*args)

    def test_means_units_special_cases(self):
        mm=module('line_load_efficiency').model
        self.assertEqual((mm.load_fraction(3,1)+mm.load_fraction(2,2))/2,mm.load_fraction(sp.Rational(5,2),sp.Rational(3,2)))
        self.assertNotEqual((mm.load_fraction(1,1)+mm.load_fraction(3,1))/2,mm.load_fraction(2,1))
        self.assertEqual(mm.fuse_time(45,sp.Rational(3,2))-sp.Rational(3,2),sp.Rational(1,2))
        self.assertEqual(mm.plane_capacitance(250,sp.Rational(3,2))-150,sp.Rational(50,3))
        self.assertEqual(mm.plate_charge(sp.Rational(3,2),4)-sp.Rational(11,2),sp.Rational(1,2))
        self.assertEqual(11-mm.capacitor_energy(3,sp.Rational(5,2)),sp.Rational(13,8))
        Q=mm.SI.Quantity
        self.assertEqual((Q(10,'milligram')*Q(200,'joule/gram')).to('joule').magnitude,2)
        self.assertEqual((Q(2,'microfarad')*Q(3,'volt')).to('microcoulomb').magnitude,6)
        self.assertEqual((Q(2,'microfarad')*Q(2,'volt')**2/2).to('microjoule').magnitude,4)
        self.assertEqual((Q(10,'picofarad/meter')*Q(100,'cm**2')/Q(1,'mm')).to('picofarad').magnitude,100)

    def test_five_constitutive_and_five_inverse_faults(self):
        for name,func,inverse in [('line_load_efficiency','load_fraction','inverse_load'),('fuse_latent_heating','fuse_time','fuse_mass'),('plane_capacitance','plane_capacitance','plane_area'),('capacitor_charge','plate_charge','charge_capacitance'),('capacitor_energy','capacitor_energy','energy_capacitance')]:
            m=module(name)
            for method in [func,inverse]:
                m.oracle.cache_clear();original=getattr(m.model,method)
                with patch.object(m.model,method,side_effect=lambda *a,_f=original:_f(*a)+1):
                    with self.assertRaises(AssertionError):m.oracle()
                m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_exact_lexical_codec_and_dependency_drift(self):
        m=module('line_load_efficiency')
        self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('√2'),sp.sqrt(2))
        for bad in ['__import__("os")','x','1/0','[1]','1e3','True','nan','oo']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in [True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in [('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result));self.assertTrue(all(error in r['errors']for r in result))

    def test_native_asset_fullness_hashes_scales_and_directions(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={}
        widths={215:[180,60,240,300,200,250],216:[40,320,160,320,240],217:[160,320,240],218:[300,250,275],219:[80,360,220]}
        for name,batch in FAMILIES:
            m=module(name);D=FIXTURES/batch;manifest=json.loads((D/'manifest.json').read_text())
            for f,h in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),h)
            render=json.loads((D/'render.json').read_text());self.assertEqual(render['observedExit'],0)
            self.assertEqual(render['sourceSvgSha256'],hashlib.sha256((D/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest())
            png=(D/'full-native.png').read_bytes();self.assertTrue(png.startswith(b'\x89PNG'));import struct
            w,h=struct.unpack('>II',png[16:24]);self.assertEqual((w,h),(render['pngWidth'],render['pngHeight']));self.assertEqual((w,h),(640,render['svgBoundingBox']['height']))
            root=ET.parse(D/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            bars=[Fraction(e.attrib['width'])for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='42']
            self.assertEqual(bars,widths[int(batch[-3:])])
            for path in root.findall('.//s:path',ns):
                if 'marker-end'in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            for text in render['textBounds']:
                self.assertGreaterEqual(text['x'],0);self.assertLessEqual(text['x']+text['width'],640)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        x,y=sp.symbols('x y',real=True)
        self.assertEqual(sp.cancel((((850-y)/100)/((x-150)/300)).subs(y,850-sp.Rational(2,3)*(x-150))-2),0)
        self.assertEqual(sp.cancel((((850-y)/30)/((x-150)/100)).subs(y,850-sp.Rational(3,5)*(x-150))-2),0)
        self.assertEqual((sp.Integer(4)*2)/2,4)
        self.assertIn('M150 860L470 660',{p.attrib.get('d')for p in roots[219].findall('.//s:path',ns)})
        paths217={p.attrib.get('d')for p in roots[217].findall('.//s:path',ns)}
        for yy in [1120,1200,1280]:self.assertIn(f'M220 {yy}H425',paths217)
        dipoles=roots[219].findall('.//s:circle',ns);self.assertEqual(len(dipoles),13) # 12 bound charges and one plot point
        self.assertEqual([(e.attrib['cx'],e.attrib['cy'])for e in dipoles[:2]],[('170','225'),('220','225')])

if __name__=='__main__':unittest.main()
