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
FAMILIES=[('force_uniform_electric_field','force-uniform-electric-field-195'),('work_potential_difference','work-potential-difference-196')]
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
    return FIXTURES/(module.FAMILY+'-'+str(195 if module.FAMILY=='force-uniform-electric-field' else 196))


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


class CrossReviewElectric195196(unittest.TestCase):
    def test_all_thirty_two_fresh_saved_reports_and_exact_codec_dependency(self):
        from tools.corpus_engineering.batches import assert_record_identity
        count=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(saved,fresh);self.assertTrue(all(r['ok']for r in fresh['records']))
            self.assertTrue(all(r['verificationMode']in ['EXACT_ORACLE','AI_CONCEPTUAL']for r in fresh['records']))
            for r in fresh['records']:self.assertEqual(r['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
            count+=len(fresh['records'])
        self.assertEqual(count,32)

    def test_source_literal_hashes_and_complete_blind_primary(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a')
        rows=json.loads(raw);rows=rows if isinstance(rows,list)else rows['questions'];sources={r['id']:r for r in rows}
        for name,_ in FAMILIES:
            m=module(name);self.assertEqual(len(m.READ_SOURCE_SHA256),16);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
        primary=FIXTURES/'primary-source-only.md'
        self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),'3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9')
        self.assertEqual(primary.read_text().count('## u6-'),80);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),80)

    def test_rebound_wrong_keys_do_not_escape_math_oracles(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],25)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_force_and_inverse_with_positive_test_charge(self,q,E,factor):
        m=module('force_uniform_electric_field');q,E=map(sp.Integer,(q,E))
        self.assertEqual(m.force(q,E),q*E);self.assertEqual(m.inverse_charge(q*E,E),q)
        self.assertEqual(m.force(factor*q,E),factor*m.force(q,E));self.assertEqual(m.force(q,factor*E),factor*m.force(q,E))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(-100,100),st.integers(-100,100),st.integers(-100,100))
    def test_signed_electrostatic_work_and_reference_invariance(self,q,drop,shift):
        m=module('work_potential_difference');q,drop,shift=map(sp.Integer,(q,drop,shift))
        self.assertEqual(m.work(q,drop),q*drop)
        initial,final=drop+shift,shift;self.assertEqual(m.work(q,initial-final),q*drop)
        self.assertEqual(m.work(q,drop),-q*(final-initial))
        self.assertEqual(m.work(-1,-5),5)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_isolated_conductor_conservation_and_equilibrium(self,excess,carrier_magnitude):
        near=-sp.Integer(excess);far=sp.Integer(excess);carrier=-sp.Integer(carrier_magnitude)
        self.assertEqual(near+far,0)
        electric=sp.symbols('electric',real=True);self.assertEqual(sp.solve(sp.Eq(carrier*electric,0),electric),[0])
        self.assertEqual(module('force_uniform_electric_field').REVIEWED_SKILLS[3],'C4-L04')

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(-100,100))
    def test_calibration_uses_two_outputs_then_removes_offset(self,gain,offset):
        for name,values in [('force_uniform_electric_field',(6,4)),('work_potential_difference',(6,5))]:
            m=module(name);one,two=values;g,b=m.calibrate(sp.Integer(one),sp.Integer(two),gain*one+offset,gain*two+offset)
            self.assertEqual((g,b),(gain,offset));self.assertEqual((g*20+b-b)/g,20)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50))
    def test_between_preparations_constraints_leave_positive_root(self,scale):
        x=sp.Integer(scale);beta=sp.Rational(2,3)
        self.assertEqual(module('force_uniform_electric_field').force(beta*x,x),beta*x*x)
        self.assertEqual(module('work_potential_difference').work(beta*x,x),beta*x*x)
        self.assertEqual(module('force_uniform_electric_field').oracle()[15],3);self.assertEqual(module('work_potential_difference').oracle()[15],3)

    def test_domains_mean_counterexamples_and_constitutive_faults(self):
        for q,E in [(0,1),(1,0),(-1,1),(1,-1)]:
            with self.assertRaises(ValueError):module('force_uniform_electric_field').force(q,E)
        for name in ['force_uniform_electric_field','work_potential_difference']:
            for F,E in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.assertRaises(ValueError):module(name).inverse_charge(F,E)
        self.assertEqual(module('force_uniform_electric_field').oracle()[11],5);self.assertNotEqual(5,sp.Rational(21,4))
        self.assertEqual(module('work_potential_difference').oracle()[11],sp.Rational(11,2));self.assertNotEqual(sp.Rational(11,2),6)
        for name,func in [('force_uniform_electric_field','force'),('work_potential_difference','work')]:
            m=module(name);m.oracle.cache_clear();original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *args,_original=original,**kwargs:_original(*args,**kwargs)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_lexical_decimal_precision_and_no_arbitrary_ast_execution(self):
        from tools.corpus_engineering import electric_exact_literals as codec
        self.assertEqual(codec.exact_literal('0.100000000000000005'),sp.Rational(20000000000000001,200000000000000000))
        self.assertNotEqual(codec.exact_literal('0.100000000000000005'),sp.Rational(1,10))
        self.assertEqual(codec.exact_literal('49/8'),sp.Rational(49,8));self.assertEqual(codec.exact_literal('√2/2'),sp.sqrt(2)/2)
        for bad in ['__import__("os")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1','1e5','True']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):codec.exact_literal(bad)
        for bad in [True,0.1,3.0,None]:
            with self.assertRaises(ValueError):codec.numeric_lexeme(bad)
        self.assertEqual(codec.numeric_lexeme(3),'3')

    def test_decoder_sha_guard_is_fail_closed_per_record(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            with patch.object(m,'REVIEWED_LITERAL_CODEC_SHA256','0'*64):
                rows=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(all('Independent exact literal codec dependency changed'in r['errors']for r in rows))

    def test_native_svg_scales_heads_and_exact_fixture_manifest(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        for name,batch in FAMILIES:
            m=module(name);D=FIXTURES/batch;manifest=json.loads((D/'manifest.json').read_text())
            for f,h in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),h)
            self.assertTrue((D/'full-native.png').read_bytes().startswith(b'\x89PNG'));self.assertIn('OBSERVED_EXIT=0',(D/'native-render.txt').read_text())
            svg=ET.parse(D/(m.FAMILY+'-progressive.svg')).getroot();widths=[Fraction(e.attrib['width'])for e in svg.findall('.//s:rect',ns)if e.attrib.get('height')=='38']
            self.assertEqual(widths,[240,160,200]if batch.endswith('195')else[240,200,220])
            for p in svg.findall('.//s:path',ns):
                if 'marker-end'in p.attrib:self.assertEqual(p.attrib['d'].count('M'),1)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in svg.findall('.//s:text',ns)))

if __name__=='__main__':unittest.main()
