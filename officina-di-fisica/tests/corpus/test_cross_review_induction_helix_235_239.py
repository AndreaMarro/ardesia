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
FAMILIES=[('faraday_average_emf','faraday-average-emf-235'),('motional_emf','motional-emf-236'),('motional_induced_current','motional-induced-current-237'),('induced_transferred_charge','induced-transferred-charge-238'),('magnetic_helix_pitch','magnetic-helix-pitch-239')]
AUDIT_RESULTS={}
PROPERTY_COUNTS={}
AUX_COUNTS={}


FIXTURES=APP/'editorial/reviews/u6-induction-helix-235-239-fixtures-20261126'

def reviewed_inputs(module,batch):
    for package_file,binding_file in [(APP/'editorial/batches'/f'{batch}.json',APP/'editorial/batches'/f'{batch}-bindings.json'),(FIXTURES/(batch+'.json'),FIXTURES/(batch+'-bindings.json'))]:
        try:package=json.loads(package_file.read_text());bindings=json.loads(binding_file.read_text())
        except FileNotFoundError:continue
        if digest(package)==module.REVIEWED_PACKAGE_SHA256 and digest(bindings)==module.REVIEWED_BINDINGS_SHA256:return package,bindings
    raise AssertionError('Exact independently read package fixture unavailable')

def reviewed_assets(module):
    canonical=APP/'editorial/assets'
    if (canonical/(module.FAMILY+'-progressive.svg')).exists():return canonical
    return FIXTURES


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
    false_proof='Un campo esterno fermo e un circuito fermo generano sempre corrente non nulla. La forza magnetica cambia sempre la rapidità della particella e il passo è identico al raggio.'
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
import hashlib,struct,inspect

def module(name):return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

class CrossReviewInductionHelix235239(unittest.TestCase):
    def test_fresh_saved_eighty_identity_and_dependencies(self):
        from tools.corpus_engineering.batches import assert_record_identity
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            for row in fresh['records']:
                self.assertIn(row['verificationMode'],['EXACT_ORACLE','AI_CONCEPTUAL'])
                self.assertEqual(row['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
                self.assertEqual(row['reviewDependencySha256']['induction_helix_review_models.py'],m.REVIEWED_MODEL_SHA256)
                self.assertTrue(row['manualArithmetic']and row['physicalAssumptions']and row['distractors'])

    def test_source_primary_model_before_keys_and_exact_git(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe')
        sources={r['id']:r for r in json.loads(raw)}
        primary=APP/'editorial/reviews/primary-induction-helix-235-239-before-candidates-20261126.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),80)
        receipt=json.loads((APP/'editorial/reviews/u6-induction-helix-235-239-model-before-keys-20261126.json').read_text());self.assertEqual(receipt['sourceRowsIndividuallyDerived'],80);self.assertEqual(receipt['modelSha256'],first.REVIEWED_MODEL_SHA256)
        for name,batch in FAMILIES:
            m=module(name);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            for suffix in['.json','-bindings.json']:
                expected=subprocess.check_output(['git','show',m.CANDIDATE_REF+f':officina-di-fisica/editorial/batches/{batch}{suffix}'],cwd=REPO);self.assertEqual(expected,(FIXTURES/(batch+suffix)).read_bytes())

    def test_actual_catalog_and_canonical_identity_contract(self):
        import ast
        ref='5d1dc8dc7b601aef959d10d564c75462be74708d';all_lessons={}
        for course in['C1','C4']:
            raw=subprocess.check_output(['git','show',ref+':officina-di-fisica/content/'+course+'.json'],cwd=REPO)
            all_lessons.update({r['id']:r for r in json.loads(raw)if r.get('kind')=='lesson'})
            if course=='C4':self.assertEqual(hashlib.sha256(raw).hexdigest(),'19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c')
        self.assertEqual(all_lessons['C4-L10']['title'],'Indurre una tensione cambiando il flusso')
        self.assertEqual(all_lessons['C4-L09']['title'],'Correnti, bussole e traiettorie curve')
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for row in p['records']:
                self.assertIn(row['skill'],all_lessons);self.assertEqual(row['error']['target'],row['skill'])
                self.assertTrue(set(row['prerequisites'])<=set(all_lessons))
        # Pin the exact reviewed function text, independently of ast.dump's
        # optional empty-field formatting across Python releases. Registry
        # imports outside this pure boundary may evolve; this function may not.
        source=(APP/'tools/corpus_engineering/batches.py').read_text()
        nodes=[n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity']
        self.assertEqual(len(nodes),1)
        node=nodes[0];segment=ast.get_source_segment(source,node)
        self.assertEqual(hashlib.sha256(segment.encode('utf-8')).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca')
        from tools.corpus_engineering.batches import assert_record_identity
        runtime_source=inspect.getsource(assert_record_identity).rstrip('\n')
        self.assertEqual(runtime_source,segment)
        # Compare ASTs within the current interpreter, not hashes serialized
        # by a different interpreter. Exact-source pin remains the authority.
        self.assertEqual(ast.dump(ast.parse(runtime_source),include_attributes=False),
                         ast.dump(ast.parse(segment),include_attributes=False))
        self.assertNotEqual(hashlib.sha256(segment.replace('is not True','is False').encode('utf-8')).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca')
        m=module(FAMILIES[0][0]);p,b=reviewed_inputs(m,FAMILIES[0][1]);good=m.verify(p,b,reviewed_assets(m))
        assert_record_identity(good,m.EXPECTED_IDS,p,b)
        for field,bad in [('id','foreign-id'),('candidateSha256','0'*64),('sourceSha256','0'*64),
                          ('ok',False),('verificationMode','UNREVIEWED'),('humanApproval','APPROVED'),('publication','PUBLISHED')]:
            changed=deepcopy(good);changed[0][field]=bad
            with self.assertRaises(ValueError):assert_record_identity(changed,m.EXPECTED_IDS,p,b)
        changed,links=deepcopy(p),deepcopy(b)
        changed['records'][0]['answer']['value']+=1;rebind(changed['records'][0],links)
        with self.assertRaises(ValueError):assert_record_identity(good,m.EXPECTED_IDS,changed,links)

    def test_135_retokenized_wrongkeys_and_integrity_faults(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],27)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_faraday_inverse_and_scaling(self,f,t,k):
        PROPERTY_COUNTS['faraday_inverse_and_scaling']=PROPERTY_COUNTS.get('faraday_inverse_and_scaling',0)+1
        m=module(FAMILIES[0][0]).model;f,t,k=map(sp.Integer,(f,t,k));e=m.average_emf(f,t)
        self.assertEqual(m.flux_from_emf(e,t),f);self.assertEqual(m.time_from_emf(e,f),t)
        self.assertEqual(m.average_emf(k*f,k*t),e);self.assertEqual(m.average_emf(f,t,20),2*e)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_rod_emf_inverse_product(self,b,v,k):
        PROPERTY_COUNTS['rod_emf_inverse_product']=PROPERTY_COUNTS.get('rod_emf_inverse_product',0)+1
        m=module(FAMILIES[0][0]).model;b,v,k=map(sp.Integer,(b,v,k));e=m.rod_emf(b,v)
        self.assertEqual(m.field_from_rod(e,v),b);self.assertEqual(m.speed_from_rod(e,b),v);self.assertEqual(m.rod_emf(k*b,k*v)/e,k*k)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_rod_current_inverse_and_maintained_power(self,v,r,k):
        PROPERTY_COUNTS['rod_current_inverse_and_maintained_power']=PROPERTY_COUNTS.get('rod_current_inverse_and_maintained_power',0)+1
        m=module(FAMILIES[0][0]).model;v,r,k=map(sp.Integer,(v,r,k));i=m.rod_current(v,r)
        self.assertEqual(m.speed_from_current(i,r),v);self.assertEqual(m.resistance_from_current(i,v),r);self.assertEqual(m.rod_current(k*v,k*r),i)
        braking=2*i;self.assertEqual(braking*v,i*i*r)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_integrated_charge_inverse(self,f,r,k):
        PROPERTY_COUNTS['integrated_charge_inverse']=PROPERTY_COUNTS.get('integrated_charge_inverse',0)+1
        m=module(FAMILIES[0][0]).model;f,r,k=map(sp.Integer,(f,r,k));q=m.transferred_charge(f,r)
        self.assertEqual(m.flux_from_charge(q,r),f);self.assertEqual(m.resistance_from_charge(q,f),r);self.assertEqual(m.transferred_charge(k*f,k*r),q)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_helix_inverse_period_pitch(self,v,b,k):
        PROPERTY_COUNTS['helix_inverse_period_pitch']=PROPERTY_COUNTS.get('helix_inverse_period_pitch',0)+1
        m=module(FAMILIES[0][0]).model;v,b,k=map(sp.Integer,(v,b,k));h=m.reduced_pitch(v,b)
        self.assertEqual(m.parallel_speed_from_pitch(h,b),v);self.assertEqual(m.field_from_pitch(h,v),b);self.assertEqual(m.reduced_pitch(k*v,k*b),h)
        self.assertEqual(sp.simplify(v*m.helix_period(b)/(2*sp.pi)),h)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_signed_offset_calibration(self,g,o):
        PROPERTY_COUNTS['signed_offset_calibration']=PROPERTY_COUNTS.get('signed_offset_calibration',0)+1
        m=module(FAMILIES[0][0]).model;self.assertEqual(m.calibrate(2,5,2*g+o,5*g+o),(g,o))
        self.assertEqual((g*sp.Integer(7)+o-o)/g,7)

    def test_finite_exact_guards_before_conversion_all_positions(self):
        m=module(FAMILIES[0][0]).model;funcs=['average_emf','flux_from_emf','time_from_emf','rod_emf','field_from_rod','speed_from_rod','rod_current','speed_from_current','resistance_from_current','transferred_charge','flux_from_charge','resistance_from_charge','reduced_pitch','parallel_speed_from_pitch','field_from_pitch','helix_period']
        failures=0
        for func in funcs:
            parameters=list(inspect.signature(getattr(m,func)).parameters)
            for index in range(len(parameters)):
                for bad in [sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5,sp.Float('0.5'),True,'2',sp.Symbol('x')]:
                    args=[sp.Integer(2)]*len(parameters);args[index]=bad
                    with self.assertRaises(ValueError,msg=func+repr(args)):getattr(m,func)(*args)
                    failures+=1
        self.assertEqual(failures,484)
        AUX_COUNTS["finite_exact_rejections_all_positions"]=failures
        for bad in[sp.Rational(1,2),sp.sqrt(2),sp.pi]:
            with self.assertRaises(ValueError):m.turns(bad)
        self.assertEqual(m.turns(10),10)
        for bad in[m.C_M_PER_S,2*m.C_M_PER_S]:
            with self.assertRaises(ValueError):m.speed(bad)
        for func,args in [('speed_from_rod',(m.C_M_PER_S,1,1)),('speed_from_current',(m.C_M_PER_S,1,1)),('parallel_speed_from_pitch',(m.C_M_PER_S,1,1))]:
            with self.assertRaises(ValueError):getattr(m,func)(*args)
        # These bounds are necessary, not a sufficient numerical nonrelativistic certificate.
        self.assertEqual(m.speed(2),2)
        for bad in[sp.I,sp.oo,-sp.oo,sp.nan,0.5,True,'1']:
            for index in range(4):
                args=[2,5,7,13];args[index]=bad
                with self.assertRaises(ValueError):m.calibrate(*args)
        for args in[(1,1,2,3),(1,2,2,2),(1,2,3,2)]:
            with self.assertRaises(ValueError):m.calibrate(*args)
        self.assertEqual(m.calibrate(1,2,-5,-3),(2,-7))

    def test_five_constitutive_and_five_inverse_math_faults(self):
        for name,func,inverse in [('faraday_average_emf','average_emf','flux_from_emf'),('motional_emf','rod_emf','field_from_rod'),('motional_induced_current','rod_current','speed_from_current'),('induced_transferred_charge','transferred_charge','flux_from_charge'),('magnetic_helix_pitch','reduced_pitch','parallel_speed_from_pitch')]:
            m=module(name)
            for method in[func,inverse]:
                m.oracle.cache_clear();original=getattr(m.model,method)
                with patch.object(m.model,method,side_effect=lambda *a,_f=original:_f(*a)+1):
                    with self.assertRaises(AssertionError):m.oracle()
                m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_nonmonotone_contrast_mean_offsets_roots_and_units(self):
        m=module(FAMILIES[0][0]).model;Q=m.SI.Quantity
        self.assertEqual(sp.Integer(35)-m.average_emf(9,sp.Rational(5,2)),-1)
        self.assertEqual(sp.Rational(5,2)-m.rod_emf(sp.Rational(3,2),sp.Rational(7,2)),-sp.Rational(1,8))
        self.assertEqual(sp.Rational(5,2)-m.rod_current(sp.Rational(3,2),sp.Rational(3,2)),sp.Rational(1,2))
        self.assertEqual(sp.Rational(7,2)-m.transferred_charge(9,sp.Rational(5,2)),-sp.Rational(1,10))
        self.assertEqual(sp.Rational(5,4)-m.reduced_pitch(sp.Rational(3,2),sp.Rational(3,2)),sp.Rational(1,4))
        for k in[sp.Rational(1,2),sp.Integer(1),sp.Rational(3,2),sp.Integer(2)]:
            self.assertEqual(m.average_emf(3*k,k),30);self.assertEqual(m.rod_current(2*k,k),4);self.assertEqual(m.transferred_charge(3*k,k),3);self.assertEqual(m.reduced_pitch(2*k,k),2)
        x=sp.symbols('x',real=True);self.assertEqual(sp.solve(sp.Eq(x*x/3,3),x),[-3,3])
        t=sp.symbols('t',real=True);flux=sp.Piecewise((t,t<=1),(2-t,True));left=sp.diff(flux.args[0][0],t);right=sp.diff(flux.args[1][0],t)
        self.assertEqual((left+right)/2,0);self.assertEqual((abs(left)+abs(right))/2,1)
        self.assertEqual((Q(6,'milliweber')/Q(2,'ohm')).to('millicoulomb').magnitude,3)
        self.assertEqual((Q(1,'weber')/Q(1,'second')).to('volt').magnitude,1)
        self.assertEqual((Q(1,'tesla')*Q(1,'meter')*Q(1,'meter/second')).to('volt').magnitude,1)
        self.assertEqual((Q(1,'volt')/Q(1,'ohm')).to('ampere').magnitude,1)

    def test_helix_ode_and_motion_emf_directions(self):
        alpha,b,vp,vz,t=sp.symbols('alpha b vp vz t',positive=True);w=alpha*b;r=vp/w
        position=sp.Matrix([r*sp.cos(w*t),-r*sp.sin(w*t),vz*t]);velocity=sp.diff(position,t);acc=sp.diff(velocity,t);field=sp.Matrix([0,0,b])
        self.assertEqual(sp.simplify(acc-alpha*velocity.cross(field)),sp.zeros(3,1));self.assertEqual(sp.simplify(velocity.cross(field).dot(velocity)),0)
        self.assertEqual(sp.simplify(position[2].subs(t,2*sp.pi/w)/(2*sp.pi)),vz/(alpha*b))
        self.assertEqual(sp.Matrix([1,0,0]).cross(sp.Matrix([0,0,-1])),sp.Matrix([0,1,0]))
        self.assertEqual(sp.Matrix([0,1,0]).cross(sp.Matrix([0,0,-1])),sp.Matrix([-1,0,0]))

    def test_exact_codec_and_model_dependency_drift(self):
        m=module(FAMILIES[0][0]);self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('√2'),sp.sqrt(2))
        for bad in['__import__("os")','x','1/0','[1]','1e3','True','nan','oo','1+'*60+'1']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in[True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in[('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result));self.assertTrue(all(error in r['errors']for r in result))

    def test_full_native_hashes_scales_and_arrows(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={};widths={235:[240,320,280],236:[300,200,250],237:[320,80,200],238:[240,320,280],239:[320,80,200]};heights={235:1500,236:1500,237:1520,238:1720,239:1560}
        base=APP/'editorial/reviews/u6-induction-helix-235-239-asset-review-20261126'
        for name,batch in FAMILIES:
            m=module(name);D=base/batch;render=json.loads((D/'render.json').read_text());proc=json.loads((D/'process-result.json').read_text());self.assertEqual(proc['returncode'],0)
            self.assertEqual(render['assetSha256'],hashlib.sha256((FIXTURES/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest());png=(D/'full-native.png').read_bytes();self.assertEqual(struct.unpack('>II',png[16:24]),(640,heights[int(batch[-3:])]))
            self.assertEqual((render['pngWidth'],render['pngHeight']),(640,heights[int(batch[-3:])]))
            root=ET.parse(FIXTURES/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            bars=[Fraction(e.attrib['width'])for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='44'];self.assertEqual(bars,widths[int(batch[-3:])]);self.assertEqual({e.attrib['x']for e in root.findall('.//s:rect',ns)if e.attrib.get('height')=='44'},{'150'})
            for path in root.findall('.//s:path',ns):
                if 'marker-end'in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            for text in render['textBounds']:self.assertGreaterEqual(text['x'],0);self.assertLessEqual(text['x']+text['width'],640)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        paths=lambda n:[e.attrib.get('d')for e in roots[n].findall('.//s:path',ns)]
        self.assertIn('M450 150A70 70 0 0 1 520 220',paths(235))
        self.assertIn('M130 860L370 680',paths(235));self.assertIn('M130 860L490 500',paths(235));self.assertEqual(sp.Rational(180,30)/sp.Rational(240,120)*10,30);self.assertEqual(sp.Rational(360,30)/sp.Rational(360,120)*10,40)
        self.assertIn('M130 880L530 560',paths(236));self.assertIn('M400 255H515',paths(236));self.assertEqual(sp.Rational(320,80)/sp.Rational(400,100),1)
        self.assertIn('M450 305V195',paths(237));self.assertIn('M380 150H240',paths(237));self.assertIn('M190 350H325',paths(237));self.assertEqual(sp.Rational(300,50)/sp.Rational(360,120),2)
        rects=[e for e in roots[238].findall('.//s:rect',ns)if e.attrib.get('height')in['120','60']];self.assertEqual([Fraction(e.attrib['width'])*Fraction(e.attrib['height'])for e in rects],[14400,14400]);self.assertEqual(sp.Rational(14400,120*40),3)
        self.assertIn('M320 155A75 75 0 0 1 395 230',paths(239));self.assertIn('M130 870L490 630',paths(239));self.assertIn('M130 870L490 810',paths(239));self.assertEqual(sp.Rational(240,120),2);self.assertEqual(sp.Rational(60,120),sp.Rational(1,2))

if __name__=='__main__':unittest.main()
