"""Reproducible independent U7 reflection and image-height audits, separate from authoring, never importing candidate authoring."""
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
FAMILIES=[('plane_mirror_ray_direction','plane-mirror-ray-direction-261'),('projected_image_height','projected-image-height-262')]
AUDIT_RESULTS={}
PROPERTY_COUNTS={}
AUX_COUNTS={}


FIXTURES=APP/'editorial/reviews/u7-reflection-image-height-261-262-fixtures-20261126'

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
    false_proof='La direzione del riflesso coincide sempre con quella incidente rispetto a ogni asse; ruotare lo specchio non cambia il raggio. Il modulo di una altezza reale è sempre negativo e millimetri e centimetri hanno identico valore numerico.'
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
    row=next((r for r in changed['records'] if r['answer']['type']=='numeric'),None)
    if row is not None:
        before_unit=row['answer']['unit'];row['answer']['unit']='K' if before_unit=='J' else 'J'
        if row['answer']['unit']==before_unit:raise AssertionError('Unit mutation must actually change dimension')
        required='numeric unit mismatch'
    else:
        # The Snell batch has only choices. Attach an energy unit to its pure sine
        # while retaining the exact correct number and the five-option structure.
        row=changed['records'][0];answer=row['answer'];correct=answer['value'];index=answer['options'].index(correct)
        answer['value']=correct+' J';answer['options'][index]=answer['value'];required='answer or unit invalid'
    rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
    errors=[e for e in result['errors'] if required in e]
    if result['ok'] or not errors:raise AssertionError('Wrong physical unit escaped independent oracle')
    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['course']='C4';rebind(row,links)
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
import hashlib,struct,inspect,ast,re

def module(name):return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

def model():return module(FAMILIES[0][0]).model

class CrossReviewReflectionImageHeight261262(unittest.TestCase):
    def test_fresh_saved_thirty_two_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            for r in fresh['records']:
                self.assertIn(r['verificationMode'],['EXACT_ORACLE','AI_CONCEPTUAL']);self.assertTrue(r['manualArithmetic']and r['physicalAssumptions']and r['distractors'])
                self.assertEqual(r['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
                self.assertEqual(r['reviewDependencySha256']['reflection_image_height_review_models.py'],m.REVIEWED_MODEL_SHA256)

    def test_blind_primary_model_history_specific_exposure_and_git_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO);self.assertEqual(hashlib.sha256(raw).hexdigest(),model().SOURCE_SHA256);sources={r['id']:r for r in json.loads(raw)}
        primary=APP/'editorial/reviews/primary-reflection-image-height-261-262-before-candidates-20261126.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),32)
        D=APP/'editorial/reviews/u7-reflection-image-height-261-262-primary-models-20261126';receipt=json.loads((D/'model-execution-before-candidate-files.json').read_text());self.assertEqual(receipt['sourceOnlyDerivationsExecuted'],32);self.assertEqual(receipt['observedChildExit'],0);self.assertTrue(receipt['primaryFullyBlindBeforeAnyExposure']);self.assertTrue(receipt['modelWrittenBeforeIncidentalExposure']);self.assertFalse(receipt['modelGitFrozenBeforeIncidentalExposure']);self.assertTrue(receipt['modelExecutionAfterIncidentalExposure']);self.assertEqual(receipt['incidentalExposure']['fragment'],'beta60');self.assertFalse(receipt['incidentalExposure']['mathematicalModelModifiedFromFragment'])
        before=subprocess.check_output(['git','show','bbda8bd4:officina-di-fisica/tools/corpus_engineering/reflection_image_height_review_models.py'],cwd=REPO);self.assertEqual(hashlib.sha256(before).hexdigest(),receipt['modelSha256']);self.assertEqual(before,Path(model().__file__).read_bytes());self.assertEqual(before,(D/'model-written-before-incidental-argv-exposure.py.txt').read_bytes());self.assertEqual(hashlib.sha256((D/'actual-model-execution-output.txt').read_bytes()).hexdigest(),receipt['outputSha256'])
        for name,batch in FAMILIES:
            m=module(name);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            for suffix in['.json','-bindings.json']:
                raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+suffix],cwd=REPO);self.assertEqual(raw,(FIXTURES/(batch+suffix)).read_bytes())

    def test_actual_catalog_and_portable_identity_boundary(self):
        ref='5d1dc8dc7b601aef959d10d564c75462be74708d';lessons={}
        for course in['C1','C5']:
            raw=subprocess.check_output(['git','show',ref+':officina-di-fisica/content/'+course+'.json'],cwd=REPO);lessons.update({r['id']:r for r in json.loads(raw)if r.get('kind')=='lesson'})
        self.assertEqual(lessons['C5-L08']['title'],'Una popolazione di nuclei che cambia nel tempo');self.assertEqual(lessons['C5-L09']['title'],'Seguire la luce quando cambia il mezzo');self.assertEqual(lessons['C5-L10']['title'],'Costruire l’immagine di una lente sottile')
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for row in p['records']:
                self.assertIn(row['skill'],lessons);self.assertEqual(row['error']['target'],row['skill']);self.assertTrue(set(row['prerequisites'])<=set(lessons))
        source=(APP/'tools/corpus_engineering/batches.py').read_text();nodes=[n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity'];self.assertEqual(len(nodes),1);segment=ast.get_source_segment(source,nodes[0]);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca')
        from tools.corpus_engineering.batches import assert_record_identity
        self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=module(FAMILIES[0][0]);p,b=reviewed_inputs(m,FAMILIES[0][1]);good=m.verify(p,b,reviewed_assets(m))
        for k,v in [('id','foreign'),('candidateSha256','0'*64),('sourceSha256','0'*64),('ok',False),('verificationMode','BAD'),('humanApproval','APPROVED'),('publication','PUBLISHED')]:
            bad=deepcopy(good);bad[0][k]=v
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)

    def test_54_retokenized_packet_mutations(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],27)


    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(1,40))
    def test_reflection_direction_inverse_and_sector(self,alpha,gap):
        PROPERTY_COUNTS['reflection']=PROPERTY_COUNTS.get('reflection',0)+1;m=model();alpha,gap=map(sp.Integer,(alpha,gap));phi=alpha+gap;beta=m.mirror_direction(phi,alpha)
        self.assertEqual(m.mirror_plane(beta,alpha),phi);self.assertEqual(m.mirror_incident(beta,phi),alpha);self.assertTrue(alpha<phi<beta<180);self.assertEqual(beta-phi,phi-alpha)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,8))
    def test_height_inverse_same_unit_and_scaling(self,ho,gap,k):
        PROPERTY_COUNTS['height']=PROPERTY_COUNTS.get('height',0)+1;m=model();ho,gap,k=map(sp.Integer,(ho,gap,k));p=2+gap;H=m.height_modulus(ho,p)
        self.assertEqual(m.object_height(H,p),ho);self.assertEqual(m.object_distance(H,ho),p);self.assertEqual(m.height_modulus(k*ho,p),k*H);self.assertEqual(H/ho,m.image_distance(p)/p)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,8))
    def test_mixed_unit_height_and_new_constraint(self,ho,gap,k):
        PROPERTY_COUNTS['mixed_units']=PROPERTY_COUNTS.get('mixed_units',0)+1;m=model();Q=m.SI.Quantity;p=2+gap
        actual=(Q(ho,'millimeter')*Q(2,'centimeter')/Q(gap,'centimeter')).to('millimeter').magnitude
        self.assertEqual(sp.Rational(actual),m.height_modulus(ho,p));self.assertEqual((Q(p,'centimeter')/40).to('millimeter').magnitude,Fraction(p,4))
        self.assertEqual(m.height_modulus(sp.Rational(p,4),p),sp.Rational(p,2*(p-2)))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(-40,40))
    def test_calibration_allows_signed_offset(self,g,b):
        PROPERTY_COUNTS['calibration']=PROPERTY_COUNTS.get('calibration',0)+1;self.assertEqual(model().calibrate(2,5,2*g+b,5*g+b),(g,b))

    def test_finite_exact_guards_before_cast_all_positions(self):
        m=model();goods={'mirror_direction':(45,30),'mirror_plane':(60,30),'mirror_incident':(60,45),'height_modulus':(1,4),'object_height':(1,4),'object_distance':(1,1),'image_distance':(4,)};count=0
        for name,good in goods.items():
            f=getattr(m,name);f(*good)
            for j in range(len(good)):
                for bad in[sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5,sp.Float('0.5'),True,'2',sp.Symbol('x')]:
                    args=list(good);args[j]=bad
                    with self.assertRaises(ValueError,msg=name+repr(args)):f(*args)
                    count+=1
        for j in range(4):
            for bad in[sp.I,sp.oo,-sp.oo,sp.nan,0.5,sp.Float('0.5'),True,'2',sp.Symbol('x')]:
                args=[2,5,7,13];args[j]=bad
                with self.assertRaises(ValueError):m.calibrate(*args)
                count+=1
        AUX_COUNTS['finite_exact_rejections']=count
        for args in[(1,1,2,3),(1,2,2,2),(1,2,3,2)]:
            with self.assertRaises(ValueError):m.calibrate(*args)
        self.assertEqual(m.calibrate(1,2,-5,-3),(2,-7))

    def test_sector_boundaries_and_focus_domain(self):
        m=model()
        for f,args in[(m.mirror_direction,(30,30)),(m.mirror_direction,(30,45)),(m.mirror_direction,(90,30)),(m.mirror_plane,(30,60)),(m.mirror_plane,(150,30)),(m.mirror_incident,(60,30)),(m.mirror_incident,(30,60)),(m.height_modulus,(1,2)),(m.height_modulus,(1,1)),(m.object_height,(1,2)),(m.image_distance,(2,))]:
            with self.assertRaises(ValueError):f(*args)
        self.assertEqual(m.mirror_direction(sp.Rational(179,2),1),178);self.assertEqual(m.object_distance(100,1),sp.Rational(101,50))

    def test_constitutive_and_inverse_faults_mathematically_rejected(self):
        for name,methods in [('plane_mirror_ray_direction',['mirror_direction','mirror_plane','mirror_incident']),('projected_image_height',['height_modulus','object_height','object_distance','image_distance'])]:
            v=module(name)
            for method in methods:
                v.oracle.cache_clear();f=getattr(v.model,method)
                with patch.object(v.model,method,side_effect=lambda *a,_f=f:_f(*a)+1):
                    with self.assertRaises((AssertionError,ValueError)):v.oracle()
                v.oracle.cache_clear();self.assertEqual(len(v.oracle()),16)
        AUX_COUNTS['constitutive_inverse_faults']=7

    def test_manual_means_and_physical_new_parameterization(self):
        m=model();self.assertEqual(m.mirror_direction(sp.Rational(105,2),sp.Rational(45,2)),sp.Rational(165,2));self.assertEqual((m.height_modulus(1,4)+m.height_modulus(2,3))/2,sp.Rational(5,2));self.assertEqual(m.height_modulus(sp.Rational(3,2),sp.Rational(7,2)),2)
        self.assertEqual(m.height_modulus(1,4),1);self.assertEqual(m.height_modulus(2,8),sp.Rational(2,3));self.assertEqual(m.height_modulus(sp.Rational(4,4),4),1)
        # The original p/4 with same units is a physically different coefficient.
        Q=m.SI.Quantity;self.assertEqual((Q(4,'centimeter')/40).to('millimeter').magnitude,1);self.assertEqual((Q(4,'centimeter')/4).to('millimeter').magnitude,10)

    def test_full_reflection_vector_and_both_ray_halfplanes(self):
        v=sp.Matrix([sp.sqrt(3)/2,sp.Rational(1,2)]);n=sp.Matrix([-sp.sqrt(2)/2,sp.sqrt(2)/2]);r=sp.simplify(v-2*v.dot(n)*n);self.assertEqual(r,sp.Matrix([sp.Rational(1,2),sp.sqrt(3)/2]));self.assertEqual(r.dot(r),1)
        self.assertEqual(sp.simplify((-v).dot(n)-r.dot(n)),0);self.assertTrue((-v).dot(n)>0);self.assertTrue(r.dot(n)>0)
        self.assertEqual(sp.simplify(r.dot(n)),sp.cos(5*sp.pi/12));self.assertEqual(model().mirror_direction(45,30),60)

    def test_exact_si_units_and_angular_not_sine(self):
        Q=model().SI.Quantity
        self.assertEqual((Q(60,'degree')/Q(30,'degree')).to('').magnitude,2);self.assertEqual((Q(1,'millimeter')*Q(2,'centimeter')/Q(2,'centimeter')).to('millimeter').magnitude,1);self.assertEqual((Q(4,'millimeter')/Q(1,'millimeter')).to('').magnitude,4)
        self.assertEqual(Q(1,'millimeter').to('centimeter').magnitude,Fraction(1,10));self.assertEqual(Q(3,'1/millimeter').to('1/centimeter').magnitude,30)

    def test_safe_exact_decoder_and_dependency_failclosed(self):
        m=module(FAMILIES[0][0]);self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('165/2'),sp.Rational(165,2))
        for bad in['__import__("os")','x','1/0','[1]','1e3','True','nan','oo','1+'*60+'1']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in[True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in[('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result));self.assertTrue(all(error in r['errors']for r in result))

    def test_actual_native_complete_and_quantitative_geometry(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={};base=APP/'editorial/reviews/u7-reflection-image-height-261-262-asset-review-20261126'
        for name,batch in FAMILIES:
            m=module(name);D=base/batch;render=json.loads((D/'render.json').read_text());proc=json.loads((D/'process-result.json').read_text());self.assertEqual(proc['returncode'],0);self.assertEqual(render['assetSha256'],hashlib.sha256((FIXTURES/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest());png=(D/'full-native.png').read_bytes();self.assertEqual(struct.unpack('>II',png[16:24]),(640,1740));self.assertEqual((render['pngWidth'],render['pngHeight']),(640,1740))
            root=ET.parse(FIXTURES/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            for t in render['textBounds']:self.assertGreaterEqual(t['x'],0);self.assertLessEqual(t['x']+t['width'],640);self.assertGreaterEqual(t['y'],0);self.assertLessEqual(t['y']+t['height'],1740)
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        rects=lambda n:[Fraction(e.attrib['width'])for e in roots[n].findall('.//s:rect',ns)if e.attrib.get('height')=='30']
        self.assertEqual(rects(261),[180,315,Fraction(495,2)]);self.assertEqual(rects(262),[80,320,200]);self.assertEqual([sp.Rational(x,3)for x in rects(261)],[60,105,sp.Rational(165,2)]);self.assertEqual([sp.Rational(x,80)for x in rects(262)],[1,4,sp.Rational(5,2)])
        circles=lambda n:[(sp.Rational(e.attrib['cx']),sp.Rational(e.attrib['cy']))for e in roots[n].findall('.//s:circle',ns)]
        self.assertEqual(circles(261),[(270,1470),(510,1230),(330,1410),(390,1350)])
        for x,y in circles(261):self.assertEqual((1530-y)/2,2*((x-150)/4)-30)
        markers=[e.attrib['d']for e in roots[261].findall('.//s:path',ns)if'marker-end'in e.attrib];self.assertEqual(len(markers),3)
        for path,angle_sin2 in zip(markers[1:],[sp.Rational(1,4),sp.Rational(3,4)]):
            x,y,xx,yy=map(sp.Rational,re.findall(r'-?\d+(?:\.\d+)?',path));self.assertLess(abs((yy-y)**2/((xx-x)**2+(yy-y)**2)-angle_sin2),sp.Rational(1,10**12))
        self.assertEqual(circles(262),[(240,320),(320,320),(400,320),(390,1390)]);self.assertEqual((480-320)/(320-160),1);self.assertEqual((360-320)/(320-280),1)
        curve=next(p.attrib['d']for p in roots[262].findall('.//s:path',ns)if p.attrib.get('stroke-width')=='3');xy=list(map(sp.Rational,re.findall(r'-?\d+(?:\.\d+)?',curve)))
        for x,y in zip(xy[::2],xy[1::2]):
            p=(x-150)/60;self.assertGreater(p,2);self.assertLessEqual(abs(y-(1510-120*2/(p-2))),sp.Rational(1,200000))
        self.assertIn('Altezze amplificate',' '.join(''.join(t.itertext())for t in roots[262].findall('.//s:text',ns)))

if __name__=='__main__':unittest.main()
