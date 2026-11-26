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
FAMILIES=[('dielectric_isolated_voltage','dielectric-isolated-voltage-225'),('dielectric_connected_charge','dielectric-connected-charge-226'),('isolated_plate_separation_energy','isolated-plate-separation-energy-227'),('connected_plate_separation_charge','connected-plate-separation-charge-228'),('lorentz_force','lorentz-force-229')]
AUDIT_RESULTS={}


FIXTURES=APP/'editorial/reviews/u6-independent-225-229-fixtures-20261125'

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
    false_proof='La carica su una armatura resta sempre fissata anche se un generatore mantiene la tensione durante un cambiamento di capacità. La forza magnetica cambia sempre la rapidità della particella.'
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
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['skill']='C4-L08';rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links)if r['id']==row['id'])
    if result['ok']or not any('primary skill mismatch'in e for e in result['errors']):raise AssertionError('Wrong lesson escaped real catalog mapping')
    cases.append({'case':'wrong_primary_skill_with_all_edition_guards_replaced','rejectedBy':['independent actual lesson mapping']})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=next(r for r in changed['records']if r['answer']['type']=='choice'and not isinstance(module.oracle()[int(r['id'][-2:])-1],str))
    index=next(i for i,x in enumerate(row['answer']['options'])if x!=row['answer']['value']);row['answer']['options'][index]=row['answer']['value'];rebind(row,links)
    try:
        result=module.verify(changed,links,reviewed_assets(module))
    except ValueError:pass
    else:
        if all(r['ok']for r in result):raise AssertionError('Duplicate equivalent alternative accepted')
    cases.append({'case':'duplicate_correct_alternative_with_all_edition_guards_replaced','rejectedBy':['numeric alternatives uniqueness or package choice contract']})
    result={'schemaVersion' :'1.0.0','cases':cases,'passed':len(cases),'humanApproval':'NOT_RUN','publication':'DRAFT'}
    AUDIT_RESULTS[module.__name__]=result
    return result



from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET
import hashlib

def module(name):
    return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')



class CrossReviewDielectricLorentz225229(unittest.TestCase):
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
                self.assertEqual(r['reviewDependencySha256']['dielectric_lorentz_review_models.py'],m.REVIEWED_MODEL_SHA256)
            total+=16
        self.assertEqual(total,80)

    def test_source_primary_and_git_frozen_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf')
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
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],27)


    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,20),st.integers(1,8))
    def test_isolated_charge_voltage_and_inverse(self,v,k,h):
        m=module(FAMILIES[0][0]).model;v,k,h=map(sp.Integer,(v,k,h));out=m.isolated_voltage(v,k)
        self.assertEqual(m.initial_voltage(out,k),v);self.assertEqual(m.dielectric_ratio(v,out),k)
        self.assertEqual(m.isolated_voltage(h*v,h*k),out);self.assertLessEqual(out,v)
        c=sp.Integer(3);self.assertEqual(c*v,(k*c)*out)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,20),st.integers(1,8))
    def test_connected_source_charge_and_inverse(self,c,k,h):
        m=module(FAMILIES[0][0]).model;c,k,h=map(sp.Integer,(c,k,h));q=m.connected_charge(c,k)
        self.assertEqual(m.initial_capacitance(q,k),c);self.assertEqual(m.connected_dielectric_ratio(q,c),k)
        self.assertEqual(m.connected_charge(h*c,h*k)/q,h*h)
        self.assertEqual(q/(k*c),2)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,20),st.integers(1,8))
    def test_isolated_energy_geometry_and_inverse(self,u,s,h):
        m=module(FAMILIES[0][0]).model;u,s,h=map(sp.Integer,(u,s,h));out=m.isolated_energy(u,s)
        self.assertEqual(m.initial_energy(out,s),u);self.assertEqual(m.energy_separation(out,u),s)
        self.assertEqual(m.isolated_energy(h*u,h*s)/out,h*h)
        q,c=sp.symbols('q c',positive=True);self.assertEqual(sp.cancel(q*q/(2*(c/s))/(q*q/(2*c))),s)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,20),st.integers(1,8))
    def test_connected_separation_charge_and_inverse(self,q,s,h):
        m=module(FAMILIES[0][0]).model;q,s,h=map(sp.Integer,(q,s,h));out=m.separated_charge(q,s)
        self.assertEqual(m.initial_charge(out,s),q);self.assertEqual(m.charge_separation(q,out),s)
        self.assertEqual(m.separated_charge(h*q,h*s),out);self.assertLessEqual(out,q)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,20),st.integers(1,8))
    def test_lorentz_force_inverse_perpendicular_power(self,v,b,h):
        m=module(FAMILIES[0][0]).model;v,b,h=map(sp.Integer,(v,b,h));out=m.magnetic_force(v,b)
        self.assertEqual(m.speed_from_force(out,b),v);self.assertEqual(m.field_from_force(out,v),b)
        self.assertEqual(m.magnetic_force(h*v,h*b)/out,h*h)
        vel=sp.Matrix([v,2*v,3*v]);field=sp.Matrix([b,-b,2*b]);self.assertEqual(vel.cross(field).dot(vel),0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_calibration_signed_offset(self,g,o):
        m=module(FAMILIES[0][0]).model;self.assertEqual(m.calibrate(2,5,2*g+o,5*g+o),(g,o))
        self.assertEqual((g*sp.Integer(7)+o-o)/g,7)

    def test_exact_finite_guards_all_helper_positions(self):
        m=module(FAMILIES[0][0]).model
        funcs=['isolated_voltage','initial_voltage','dielectric_ratio','connected_charge','initial_capacitance','connected_dielectric_ratio','isolated_energy','initial_energy','energy_separation','separated_charge','initial_charge','charge_separation','magnetic_force','speed_from_force','field_from_force']
        count=0
        for func in funcs:
            for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5,sp.Float('0.5'),True,'2',sp.Symbol('x')]:
                for args in [(bad,2),(2,bad)]:
                    with self.assertRaises(ValueError,msg=func+repr(args)):getattr(m,func)(*args)
                    count+=1
        self.assertEqual(count,330)
        for func in ['isolated_voltage','initial_voltage','connected_charge','initial_capacitance','isolated_energy','initial_energy','separated_charge','initial_charge']:
            with self.assertRaises(ValueError):getattr(m,func)(2,sp.Rational(1,2))
            self.assertGreater(getattr(m,func)(2,1),0)
        for func,args in [('dielectric_ratio',(1,2)),('connected_dielectric_ratio',(1,1)),('energy_separation',(1,2)),('charge_separation',(1,2))]:
            with self.assertRaises(ValueError):getattr(m,func)(*args)
        for bad in [m.C_KM_PER_S,2*m.C_KM_PER_S,sp.I,sp.oo,sp.nan,True,0.5]:
            with self.assertRaises(ValueError):m.physical_speed(bad)
        with self.assertRaises(ValueError):m.speed_from_force(m.C_KM_PER_S,1)
        # A necessary subluminal guard is not claimed as a sufficient nonrelativistic certificate.
        self.assertEqual(m.physical_speed(2),2)
        for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0.5,True,'1']:
            for i in range(4):
                args=[2,5,7,13];args[i]=bad
                with self.assertRaises(ValueError):m.calibrate(*args)
        for args in[(1,1,2,3),(1,2,2,2),(1,2,3,2)]:
            with self.assertRaises(ValueError):m.calibrate(*args)

    def test_five_constitutive_and_five_inverse_faults(self):
        for name,func,inverse in [('dielectric_isolated_voltage','isolated_voltage','initial_voltage'),('dielectric_connected_charge','connected_charge','initial_capacitance'),('isolated_plate_separation_energy','isolated_energy','initial_energy'),('connected_plate_separation_charge','separated_charge','initial_charge'),('lorentz_force','magnetic_force','speed_from_force')]:
            m=module(name)
            for method in[func,inverse]:
                m.oracle.cache_clear();original=getattr(m.model,method)
                with patch.object(m.model,method,side_effect=lambda *a,_f=original:_f(*a)+1):
                    with self.assertRaises(AssertionError):m.oracle()
                m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_means_units_redundancy_roots_and_field_direction(self):
        m=module(FAMILIES[0][0]).model;Q=m.SI.Quantity
        self.assertEqual(sp.Rational(9,2)-m.isolated_voltage(sp.Rational(21,2),sp.Rational(5,2)),sp.Rational(3,10))
        self.assertEqual(m.connected_charge(sp.Rational(3,2),sp.Rational(5,2))-7,sp.Rational(1,2))
        self.assertEqual(sp.Rational(13,2)-m.isolated_energy(sp.Rational(5,2),sp.Rational(5,2)),sp.Rational(1,4))
        self.assertEqual(sp.Rational(9,2)-m.separated_charge(sp.Rational(21,2),sp.Rational(5,2)),sp.Rational(3,10))
        self.assertEqual(m.magnetic_force(sp.Rational(3,2),sp.Rational(7,2))-5,sp.Rational(1,4))
        for k in[sp.Integer(1),sp.Rational(3,2),sp.Integer(2)]:
            self.assertEqual(m.isolated_voltage(6*k,k),6);self.assertEqual(m.separated_charge(6*k,k),6)
        x=sp.symbols('x',real=True)
        self.assertEqual(sp.solve(sp.Eq(2*x*x,8),x),[-2,2]);self.assertEqual(sp.solve(sp.Eq(x*x,4),x),[-2,2]);self.assertEqual(sp.solve(sp.Eq(sp.Rational(2,3)*x*x,6),x),[-3,3])
        self.assertEqual((Q(1,'microcoulomb')*Q(2,'kilometer/second')*Q(3,'millitesla')).to('micronewton').magnitude,6)
        self.assertEqual((Q(1,'coulomb')**2/Q(1,'farad')).to('joule').magnitude,1)
        self.assertEqual((Q(2,'microfarad')*Q(2,'volt')*2).to('microcoulomb').magnitude,8)
        self.assertEqual(sp.Matrix([1,0,0]).cross(sp.Matrix([0,0,-1])),sp.Matrix([0,1,0]))

    def test_exact_codec_and_both_dependency_drift(self):
        m=module(FAMILIES[0][0])
        self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('√2'),sp.sqrt(2))
        for bad in ['__import__("os")','x','1/0','[1]','1e3','True','nan','oo']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in[True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in [('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result));self.assertTrue(all(error in r['errors']for r in result))

    def test_native_asset_fullness_hashes_scales_and_directions(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={}
        widths={225:[240,120,180],226:[320,240,280],227:[128,288,208],228:[240,120,180],229:[300,200,250]}
        for name,batch in FAMILIES:
            m=module(name);D=FIXTURES/batch;manifest=json.loads((D/'manifest.json').read_text())
            for f,h in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),h)
            render=json.loads((D/'render.json').read_text());self.assertEqual(render['observedExit'],0)
            self.assertEqual(render['sourceSvgSha256'],hashlib.sha256((D/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest())
            png=(D/'full-native.png').read_bytes();self.assertTrue(png.startswith(b'\x89PNG'));import struct
            w,h=struct.unpack('>II',png[16:24]);self.assertEqual((w,h),(640,1480));self.assertEqual((w,h),(render['pngWidth'],render['pngHeight']))
            root=ET.parse(D/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            bars=[Fraction(e.attrib['width'])for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='27'];self.assertEqual(bars,widths[int(batch[-3:])])
            self.assertEqual({e.attrib['x']for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='27'},{'150'})
            for path in root.findall('.//s:path',ns):
                if 'marker-end'in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            for text in render['textBounds']:
                self.assertGreaterEqual(text['x'],0);self.assertLessEqual(text['x']+text['width'],640)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        lines=lambda n:[(e.attrib['x1'],e.attrib['y1'],e.attrib['x2'],e.attrib['y2'])for e in roots[n].findall('.//s:line',ns)]
        self.assertIn(('150','1300','470','1140'),lines(225));self.assertEqual((sp.Integer(160)/sp.Rational(80,3))/(sp.Integer(320)/sp.Rational(80,3)),sp.Rational(1,2))
        self.assertIn(('150','1300','470','1140'),lines(226));self.assertEqual(sp.Rational(160,20)/sp.Rational(320,160),4)
        self.assertIn(('250','1260','450','1180'),lines(227));self.assertEqual(sp.Rational(120,20)/sp.Rational(300,100),2)
        coords={(e.attrib['cx'],e.attrib['cy'])for e in roots[228].findall('.//s:circle',ns)}
        self.assertEqual(coords,{('250','1080'),('350','1200'),('450','1240')})
        for s,q in [(1,12),(2,6),(3,4)]:self.assertEqual(sp.Integer(q)*s,12)
        self.assertIn(('300','300','470','300'),lines(229));self.assertIn(('300','300','300','160'),lines(229))
        self.assertIn(('150','1310','470','1130'),lines(229));self.assertEqual(sp.Rational(180,30)/sp.Rational(320,160),3)
        origin=next(e for e in roots[229].findall('.//s:circle',ns)if e.attrib['cx']=='150');self.assertEqual(origin.attrib['fill'],'#f7fafc')

if __name__=='__main__':unittest.main()
