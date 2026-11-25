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
FAMILIES=[('wire_stretched_fixed_volume','wire-stretched-fixed-volume-205'),('two_series_resistors','two-series-resistors-206'),('two_parallel_resistors','two-parallel-resistors-207'),('series_parallel_resistor_network','series-parallel-resistor-network-208'),('identical_series_resistors','identical-series-resistors-209')]
AUDIT_RESULTS={}


FIXTURES=APP/'editorial/reviews/u6-independent-205-209-fixtures-20261125'

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
    false_proof='Ogni rete di resistori passivi ha sempre resistenza equivalente uguale al prodotto dei resistori, indipendentemente dalla topologia.'
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



class CrossReviewCircuits205209(unittest.TestCase):
    def test_eighty_fresh_saved_reports_identity_dependency(self):
        from tools.corpus_engineering.batches import assert_record_identity
        total=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            self.assertTrue(all(r['verificationMode']in ['EXACT_ORACLE','AI_CONCEPTUAL']for r in fresh['records']))
            self.assertTrue(all(r['reviewDependencySha256']['electric_exact_literals.py']==m.REVIEWED_LITERAL_CODEC_SHA256 for r in fresh['records']));total+=16
        self.assertEqual(total,80)

    def test_source_primary_and_git_frozen_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d')
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
    @given(st.integers(1,50),st.integers(1,8),st.integers(1,8))
    def test_volume_conservation_and_inverse(self,R0,s,k):
        m=module('wire_stretched_fixed_volume');R0,s,k=map(sp.Integer,(R0,s,k))
        R=m.stretched(R0,s);self.assertEqual(R,R0*s*s)
        self.assertEqual(m.inverse_initial(R,s),R0);self.assertEqual(m.inverse_scale(R,R0),s)
        self.assertEqual(m.stretched(k*R0,2*s)/R,4*k)
        self.assertEqual((s*3)*(sp.Rational(5,1)/s),15)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_series_kirchhoff_and_bypass(self,a,b,k):
        m=module('two_series_resistors');a,b,k=map(sp.Integer,(a,b,k))
        self.assertEqual(m.series(a,b),a+b);self.assertEqual(m.inverse_first(m.series(a,b),b),a)
        self.assertEqual(m.series(k*a,k*b),k*m.series(a,b));self.assertEqual(m.bypassed(a,b),a)
        I=sp.Rational(3,7);self.assertEqual(I*m.series(a,b),I*a+I*b)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_parallel_current_balance_and_inverse(self,a,b,k):
        m=module('two_parallel_resistors');a,b,k=map(sp.Integer,(a,b,k));R=m.parallel(a,b)
        self.assertLess(R,min(a,b));self.assertEqual(1/R,1/a+1/b)
        self.assertEqual(m.inverse_branch(R,b),a);self.assertEqual(m.parallel(k*a,k*b),k*R)
        self.assertEqual(m.opening_ratio(a,b,k),a/(a+b))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,50),st.integers(1,8))
    def test_network_two_occurrences_and_inverse(self,r,R,k):
        m=module('series_parallel_resistor_network');r,R,k=map(sp.Integer,(r,R,k));T=m.network(r,R)
        self.assertLess(r,T);self.assertLess(T,2*r)
        self.assertEqual(sp.simplify(m.inverse_shared(T,R)-r),0);self.assertEqual(m.inverse_other(T,r),R)
        self.assertEqual(m.network(k*r,k*R),k*T)
        # Only changing the external occurrence is a different physical preparation.
        self.assertNotEqual(m.network(2*r,R),2*r+r*R/(r+R))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,8))
    def test_identical_chain_integer_domain_and_inverse(self,r,N,k):
        m=module('identical_series_resistors');r,N,k=map(sp.Integer,(r,N,k));R=m.chain(r,N)
        self.assertEqual(m.inverse_element(R,N),r);self.assertEqual(m.inverse_count(R,r),N)
        self.assertEqual(m.chain(k*r,N)/R,k);self.assertEqual(m.chain(r,k*N)/R,k)
        self.assertEqual(m.chain(r,1),r)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_calibrations_with_signed_display_offset(self,gain,offset):
        for name,_ in FAMILIES:
            m=module(name);self.assertEqual(m.calibrate(2,5,2*gain+offset,5*gain+offset),(gain,offset))
            self.assertEqual((gain*sp.Integer(7)+offset-offset)/gain,7)

    def test_finite_real_domain_and_passive_inverse_boundaries(self):
        functions=[('wire_stretched_fixed_volume','stretched'),('wire_stretched_fixed_volume','inverse_initial'),('wire_stretched_fixed_volume','inverse_scale'),('two_series_resistors','series'),('two_series_resistors','inverse_first'),('two_series_resistors','bypassed'),('two_parallel_resistors','parallel'),('two_parallel_resistors','inverse_branch'),('series_parallel_resistor_network','network'),('series_parallel_resistor_network','inverse_shared'),('series_parallel_resistor_network','inverse_other'),('identical_series_resistors','chain'),('identical_series_resistors','inverse_element'),('identical_series_resistors','inverse_count')]
        for name,func in functions:
            for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5]:
                for args in [(bad,3),(6,bad)]:
                    with self.assertRaises(ValueError):getattr(module(name),func)(*args)
        for name,_ in FAMILIES:
            m=module(name)
            for args in [(1,1,2,3),(1,2,2,2),(1,2,3,2),(sp.oo,2,3,4)]:
                with self.assertRaises(ValueError):m.calibrate(*args)
        with self.assertRaises(ValueError):module('wire_stretched_fixed_volume').stretched(1,sp.Rational(1,2))
        with self.assertRaises(ValueError):module('wire_stretched_fixed_volume').inverse_scale(1,2)
        for args in [(1,1),(2,1)]:
            with self.assertRaises(ValueError):module('two_parallel_resistors').inverse_branch(*args)
        for total in [2,4,1,5]:
            with self.assertRaises(ValueError):module('series_parallel_resistor_network').inverse_other(total,2)
        for args in [(3,2),(4,3)]:
            with self.assertRaises(ValueError):module('identical_series_resistors').inverse_count(*args)
        with self.assertRaises(ValueError):module('identical_series_resistors').chain(2,sp.Rational(7,2))
        self.assertEqual(module('identical_series_resistors').chain(2,sp.Rational(4,3)*3),8)
        with self.assertRaises(ValueError):module('two_parallel_resistors').opening_ratio(3,6,0)

    def test_means_exact_roots_units_and_constitutive_faults(self):
        self.assertEqual(11-sp.Rational(75,8),sp.Rational(13,8))
        self.assertEqual(sp.Rational(3,2)-sp.Rational(20,13),-sp.Rational(1,26))
        self.assertEqual(sp.Rational(105,26)-4,sp.Rational(1,26));self.assertEqual(9-sp.Rational(35,4),sp.Rational(1,4))
        n=module('series_parallel_resistor_network')
        self.assertEqual([n.inverse_shared(3,2),n.inverse_shared(5,6),n.inverse_shared(6,4)],[2,3,4])
        Q=n.SI.Quantity;self.assertEqual((Q(2,'volt')/Q(2,'ampere')).to('ohm').magnitude,1)
        self.assertEqual((1/Q(Fraction(2),'ohm')+1/Q(Fraction(3),'ohm')).to('siemens').magnitude,Fraction(5,6))
        for name,func in [('wire_stretched_fixed_volume','stretched'),('two_series_resistors','series'),('two_parallel_resistors','parallel'),('series_parallel_resistor_network','network'),('identical_series_resistors','chain')]:
            m=module(name);m.oracle.cache_clear();original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *a,_f=original:_f(*a)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_five_inverse_faults_are_independently_detected(self):
        for name,func in [('wire_stretched_fixed_volume','inverse_initial'),('two_series_resistors','inverse_first'),('two_parallel_resistors','inverse_branch'),('series_parallel_resistor_network','inverse_shared'),('identical_series_resistors','inverse_count')]:
            m=module(name);m.oracle.cache_clear();original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *a,_f=original:_f(*a)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_exact_lexical_codec_and_dependency_drift(self):
        m=module('wire_stretched_fixed_volume')
        self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10))
        for bad in ['__import__("os")','x','1/0','[1]','1e3']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            with patch.object(m,'REVIEWED_LITERAL_CODEC_SHA256','0'*64):
                result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result))
                self.assertTrue(all('Independent exact literal codec dependency changed'in r['errors']for r in result))

    def test_native_svg_exact_scales_and_topology(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        expected={'205':[80,360,220],'206':[200,320,260],'207':[160,320,240],'208':[180,300,240],'209':[180,360,270]}
        roots={}
        for name,batch in FAMILIES:
            m=module(name);D=FIXTURES/batch;manifest=json.loads((D/'manifest.json').read_text())
            for f,h in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),h)
            self.assertTrue((D/'full-native.png').read_bytes().startswith(b'\x89PNG'));self.assertIn('OBSERVED_EXIT=0',(D/'native-render.txt').read_text())
            root=ET.parse(D/(m.FAMILY+'-progressive.svg')).getroot();roots[batch[-3:]]=root
            bars=[Fraction(e.attrib['width'])for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='34']
            self.assertEqual(bars,expected[batch[-3:]])
            for path in root.findall('.//s:path',ns):
                if 'marker-end'in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        u=sp.symbols('u',real=True);x=220+240*u;y=840-80*u-80*u*u
        self.assertEqual(sp.expand((860-y)/20-((x-100)/120)**2),0)
        paths={p.attrib.get('d')for p in roots['205'].findall('.//s:path',ns)};self.assertIn('M220 840Q340 800 460 680',paths)
        rects=roots['205'].findall('.//s:rect',ns)
        self.assertTrue(any(e.attrib.get('width')=='120'and e.attrib.get('height')=='80'for e in rects));self.assertTrue(any(e.attrib.get('width')=='240'and e.attrib.get('height')=='40'for e in rects))
        all207=' '.join(roots['207'].itertext());self.assertIn('V_AB>0',all207.replace(' ',''))
        paths207={p.attrib.get('d')for p in roots['207'].findall('.//s:path',ns)};self.assertIn('M180 655L220 620',paths207)
        widths208=[int(e.attrib['width'])for e in roots['208'].findall('.//s:rect',ns)if e.attrib.get('height')=='40' and e.attrib.get('y')in ['610','720']];self.assertEqual(widths208,[80,40,120,80])
        symbols208=[int(e.attrib['width'])for e in roots['208'].findall('.//s:rect',ns)if e.attrib.get('height')=='40' and e.attrib.get('y')in ['145','220','295']];self.assertEqual(symbols208,[100,100,100])

if __name__=='__main__':unittest.main()
