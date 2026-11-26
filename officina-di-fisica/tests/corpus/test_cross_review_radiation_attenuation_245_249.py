"""Reproducible independent U7 radiation audits, separate from authoring, never importing candidate authoring."""
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
FAMILIES=[('photon_packet_wavelength','photon-packet-wavelength-245'),('beer_transmitted_intensity','beer-transmitted-intensity-246'),('optical_depth','optical-depth-247'),('two_layer_transmission','two-layer-transmission-248'),('infer_attenuation_coefficient','infer-attenuation-coefficient-249')]
AUDIT_RESULTS={}
PROPERTY_COUNTS={}
AUX_COUNTS={}


FIXTURES=APP/'editorial/reviews/u7-photons-attenuation-245-249-fixtures-20261126'

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
    false_proof='Ogni fotone trasmesso perde continuamente metà della sua energia. Le intensità trasmesse da strati in successione vanno sommate e un esponente può avere unità di lunghezza.'
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
import hashlib,struct,inspect,ast

def module(name):return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

class CrossReviewRadiationAttenuation245249(unittest.TestCase):
    def test_fresh_saved_eighty_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            for r in fresh['records']:
                self.assertIn(r['verificationMode'],['EXACT_ORACLE','AI_CONCEPTUAL']);self.assertTrue(r['manualArithmetic']and r['physicalAssumptions']and r['distractors'])
                self.assertEqual(r['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
                self.assertEqual(r['reviewDependencySha256']['radiation_attenuation_review_models.py'],m.REVIEWED_MODEL_SHA256)

    def test_frozen_source_primary_prekey_model_and_git_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO);self.assertEqual(hashlib.sha256(raw).hexdigest(),first.model.SOURCE_SHA256);sources={r['id']:r for r in json.loads(raw)}
        primary=APP/'editorial/reviews/primary-radiation-attenuation-245-249-before-candidates-20261126.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),80)
        D=APP/'editorial/reviews/u7-photons-attenuation-245-249-source-only-models-20261126';receipt=json.loads((D/'model-execution-before-keys.json').read_text());self.assertEqual(receipt['sourceOnlyCasesExecuted'],80);self.assertEqual(receipt['childExit'],0);self.assertEqual(receipt['candidateExposureAtFreeze'],'NONE')
        before=subprocess.check_output(['git','show','24cf4060:officina-di-fisica/tools/corpus_engineering/radiation_attenuation_review_models.py'],cwd=REPO);self.assertEqual(hashlib.sha256(before).hexdigest(),receipt['modelSha256']);self.assertEqual(before,(D/'initial-model-before-keys.py.txt').read_bytes())
        refinement=json.loads((D/'post-reading-domain-refinement.json').read_text());self.assertEqual(refinement['initialModelSha256'],receipt['modelSha256']);self.assertEqual(refinement['currentModelSha256'],first.REVIEWED_MODEL_SHA256)
        for name,batch in FAMILIES:
            m=module(name);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            for suffix in['.json','-bindings.json']:
                raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+suffix],cwd=REPO);self.assertEqual(raw,(FIXTURES/(batch+suffix)).read_bytes())

    def test_actual_catalog_and_portable_identity_boundary(self):
        ref='5d1dc8dc7b601aef959d10d564c75462be74708d';lessons={}
        for course in['C1','C5']:
            raw=subprocess.check_output(['git','show',ref+':officina-di-fisica/content/'+course+'.json'],cwd=REPO);lessons.update({r['id']:r for r in json.loads(raw)if r.get('kind')=='lesson'})
        self.assertEqual(lessons['C5-L06']['title'],'Un’onda di campi attraverso lo spazio');self.assertEqual(lessons['C5-L07']['title'],'Quanti di energia e frazione trasmessa')
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for row in p['records']:
                self.assertIn(row['skill'],lessons);self.assertEqual(row['error']['target'],row['skill']);self.assertTrue(set(row['prerequisites'])<=set(lessons))
        source=(APP/'tools/corpus_engineering/batches.py').read_text();nodes=[n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity'];self.assertEqual(len(nodes),1);segment=ast.get_source_segment(source,nodes[0])
        self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca')
        from tools.corpus_engineering.batches import assert_record_identity
        self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=module(FAMILIES[0][0]);p,b=reviewed_inputs(m,FAMILIES[0][1]);good=m.verify(p,b,reviewed_assets(m))
        for k,v in [('id','foreign'),('candidateSha256','0'*64),('sourceSha256','0'*64),('ok',False),('verificationMode','BAD'),('humanApproval','APPROVED'),('publication','PUBLISHED')]:
            bad=deepcopy(good);bad[0][k]=v
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)

    def test_135_retokenized_packet_mutations(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],27)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,8))
    def test_packet_integer_inverses_and_scaling(self,n,x,k):
        PROPERTY_COUNTS['packet']=PROPERTY_COUNTS.get('packet',0)+1;m=module(FAMILIES[0][0]).model;n,x,k=map(sp.Integer,(n,x,k));e=m.packet_energy(n,x)
        self.assertEqual(m.photon_count(e,x),n);self.assertEqual(m.wavelength(e,n),x);self.assertEqual(m.packet_energy(k*n,k*x),e)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,8),st.integers(1,8))
    def test_beer_powers_and_inverse(self,i,x,k):
        PROPERTY_COUNTS['beer']=PROPERTY_COUNTS.get('beer',0)+1;m=module(FAMILIES[0][0]).model;i,x,k=map(sp.Integer,(i,x,k));v=m.beer(i,x)
        self.assertEqual(m.incident_from_transmitted(v,x),i);self.assertEqual(m.beer_depth(i,v),x);self.assertEqual(m.beer(i,x+k),v*2**(-k))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,60),st.integers(1,40),st.integers(1,8))
    def test_optical_product_inverse(self,mu,d,k):
        PROPERTY_COUNTS['optical']=PROPERTY_COUNTS.get('optical',0)+1;m=module(FAMILIES[0][0]).model;mu,d,k=map(sp.Integer,(mu,d,k));tau=m.optical_depth(mu,d)
        self.assertEqual(m.mu_from_depth(tau,d),mu);self.assertEqual(m.thickness(tau,mu),d);self.assertEqual(m.optical_depth(k*mu,k*d),k*k*tau)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,8),st.integers(1,8),st.integers(1,8))
    def test_two_layers_inverse_and_increment(self,x,y,k):
        PROPERTY_COUNTS['layers']=PROPERTY_COUNTS.get('layers',0)+1;m=module(FAMILIES[0][0]).model;x,y,k=map(sp.Integer,(x,y,k));t=m.two_layers(x,y)
        self.assertEqual(m.first_layer(t,y),x);self.assertEqual(m.second_layer(t,x),y);self.assertEqual(m.two_layers(x,y+k)/t,2**(-2*k))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,8),st.integers(1,8),st.integers(1,50))
    def test_attenuation_inverse_and_additive_background(self,a,x,b):
        PROPERTY_COUNTS['attenuation']=PROPERTY_COUNTS.get('attenuation',0)+1;m=module(FAMILIES[0][0]).model;a,x,b=map(sp.Integer,(a,x,b));i=m.intensity_from_a(a,x)
        self.assertEqual(m.attenuation_a(i,x),a);self.assertEqual(m.depth_from_a(a,i),x)
        q=2**(-a);signals=[32*q**j+b for j in [1,2,3]];self.assertEqual(m.background_coefficient(*signals),a)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_calibration_signed_offset(self,g,b):
        PROPERTY_COUNTS['calibration']=PROPERTY_COUNTS.get('calibration',0)+1;m=module(FAMILIES[0][0]).model;self.assertEqual(m.calibrate(2,5,2*g+b,5*g+b),(g,b))

    def test_finite_exact_guards_all_numeric_positions(self):
        m=module(FAMILIES[0][0]).model;names=['packet_energy','photon_count','wavelength','beer','incident_from_transmitted','beer_depth','optical_depth','mu_from_depth','thickness','transparent_index','two_layers','first_layer','second_layer','attenuation_a','intensity_from_a','depth_from_a','background_coefficient'];count=0
        for name in names:
            f=getattr(m,name);n=len(inspect.signature(f).parameters)
            for j in range(n):
                for bad in[sp.I,sp.oo,-sp.oo,sp.nan,0,-1,0.5,sp.Float('0.5'),True,'2',sp.Symbol('x')]:
                    args=[sp.Integer(2)]*n;args[j]=bad
                    with self.assertRaises(ValueError,msg=name+repr(args)):f(*args)
                    count+=1
        AUX_COUNTS['finite_exact_rejections']=count;self.assertGreater(count,400)
        for bad in[sp.Rational(1,2),sp.sqrt(2),sp.pi]:
            with self.assertRaises(ValueError):m.count(bad)
        for j in range(4):
            for bad in[sp.I,sp.oo,-sp.oo,sp.nan,0.5,True,'1']:
                args=[2,5,7,13];args[j]=bad
                with self.assertRaises(ValueError):m.calibrate(*args)
        for args in[(1,1,2,3),(1,2,2,2),(1,2,3,2)]:
            with self.assertRaises(ValueError):m.calibrate(*args)
        self.assertEqual(m.calibrate(1,2,-5,-3),(2,-7))

    def test_domain_residuals_integers_and_background(self):
        m=module(FAMILIES[0][0]).model
        for f,args in[(m.photon_count,(1,660)),(m.beer_depth,(32,32)),(m.beer_depth,(32,64)),(m.first_layer,(sp.Rational(1,4),1)),(m.first_layer,(sp.Rational(1,2),1)),(m.second_layer,(sp.Rational(1,2),1)),(m.attenuation_a,(64,1)),(m.attenuation_a,(128,1)),(m.depth_from_a,(1,64)),(m.background_coefficient,(1,1,1)),(m.background_coefficient,(12,16,24)),(m.background_coefficient,(10,6,3))]:
            with self.assertRaises(ValueError):f(*args)
        self.assertEqual(m.background_coefficient(24,16,12),1)

    def test_constitutive_and_inverse_math_faults(self):
        for name,direct,inverse in [('photon_packet_wavelength','packet_energy','photon_count'),('beer_transmitted_intensity','beer','incident_from_transmitted'),('optical_depth','optical_depth','mu_from_depth'),('two_layer_transmission','two_layers','first_layer'),('infer_attenuation_coefficient','attenuation_a','intensity_from_a')]:
            v=module(name)
            for method in[direct,inverse]:
                v.oracle.cache_clear();f=getattr(v.model,method)
                with patch.object(v.model,method,side_effect=lambda *a,_f=f:_f(*a)+1):
                    # A faulty energy law can reconstruct fractional photons before
                    # reaching the numeric self-consistency assertion. Both are
                    # physical fail-closed rejections, not a successful oracle.
                    with self.assertRaises((AssertionError,ValueError)):v.oracle()
                v.oracle.cache_clear();self.assertEqual(len(v.oracle()),16)
        AUX_COUNTS['constitutive_inverse_faults']=10

    def test_manual_means_radicals_and_domains(self):
        m=module(FAMILIES[0][0]).model
        self.assertEqual(m.packet_energy(1,660),3);self.assertEqual(m.packet_energy(2,330),12)
        self.assertEqual(m.beer(48,sp.Rational(3,2)),12*sp.sqrt(2));self.assertTrue(sp.Integer(400)>288)
        self.assertEqual(m.optical_depth(sp.Rational(3,2),sp.Rational(5,2)),sp.Rational(15,4))
        self.assertEqual(m.two_layers(sp.Rational(3,2),sp.Rational(3,2)),sp.sqrt(2)/32)
        v=m.attenuation_a(10,sp.Rational(3,2));self.assertTrue(v>sp.Rational(4,3));self.assertTrue(v<2);self.assertTrue(2<sp.Rational(5,2))
        for n in[1,2,3,10]:self.assertEqual(m.packet_energy(n,660*n),3)
        self.assertEqual(m.transparent_index(9,1),3)

    def test_exact_si_units(self):
        m=module(FAMILIES[0][0]).model;Q=m.SI.Quantity
        self.assertEqual((Q(Fraction(66,10**35),'joule*second')*Q(3*10**8,'meter/second')/Q(660,'nanometer')).to('joule').magnitude,Fraction(3,10**19))
        self.assertEqual((Q(1,'watt/meter**2')/Q(1,'watt/meter**2')).to('').magnitude,1)
        self.assertEqual((Q(1,'1/centimeter')*Q(2,'centimeter')).to('').magnitude,2)
        self.assertEqual((Q(4,'1/centimeter')/Q(1,'1/centimeter')).to('').magnitude,4)
        self.assertEqual((Q(1,'1/centimeter')).to('1/meter').magnitude,100)
        self.assertEqual((Q(1,'1/meter**2/second')*Q(1,'joule')).to('watt/meter**2').magnitude,1)

    def test_exact_decoder_and_dependency_failclosed(self):
        m=module(FAMILIES[0][0]);self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('12√2'),12*sp.sqrt(2));self.assertEqual(m.decode_numeric('e'),sp.E)
        for bad in['__import__("os")','x','1/0','[1]','1e3','True','nan','oo','1+'*60+'1']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in[True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in[('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    r=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not x['ok']for x in r));self.assertTrue(all(error in x['errors']for x in r))

    def test_native_full_capture_and_physical_scales(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={};heights={245:1600,246:1600,247:1580,248:1600,249:1600};base=APP/'editorial/reviews/u7-photons-attenuation-245-249-asset-review-20261126'
        for name,batch in FAMILIES:
            m=module(name);D=base/batch;render=json.loads((D/'render.json').read_text());proc=json.loads((D/'process-result.json').read_text());self.assertEqual(proc['returncode'],0)
            self.assertEqual(render['assetSha256'],hashlib.sha256((FIXTURES/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest());png=(D/'full-native.png').read_bytes();self.assertEqual(struct.unpack('>II',png[16:24]),(640,heights[int(batch[-3:])]))
            self.assertEqual((render['pngWidth'],render['pngHeight']),(640,heights[int(batch[-3:])]))
            root=ET.parse(FIXTURES/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            for t in render['textBounds']:self.assertGreaterEqual(t['x'],0);self.assertLessEqual(t['x']+t['width'],640);self.assertGreaterEqual(t['y'],0);self.assertLessEqual(t['y']+t['height'],heights[int(batch[-3:])])
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        rects=lambda n,height:[Fraction(e.attrib['width'])for e in roots[n].findall('.//s:rect',ns)if e.attrib.get('height')==str(height)]
        self.assertEqual(rects(245,30),[75,300,Fraction(375,2)]);self.assertEqual(rects(246,28),[320,160,80,40,240,120,180]);self.assertEqual(rects(247,28),[100,300,200]);self.assertEqual(rects(248,25),[400,200,50]);self.assertEqual(rects(248,28),[240,30,135]);self.assertEqual(rects(249,25),[320,160,80,40,20]);self.assertEqual(rects(249,28),[320,80,200]);self.assertEqual(rects(249,35),[240,80,160,80,120,80])
        circles=lambda n:[(Fraction(e.attrib['cx']),Fraction(e.attrib['cy']))for e in roots[n].findall('.//s:circle',ns)]
        self.assertEqual(circles(245),[(270,1400),(390,1320),(510,1240)])
        for x,y in circles(245):self.assertEqual((x-150)*sp.Rational(11,2),660*(1480-y)/80)
        self.assertEqual(circles(246),[(260,850),(370,930),(480,970)])
        for x,y in circles(246):self.assertEqual((1010-y)/5,64*2**(-sp.Rational(x-150,110)))
        self.assertEqual(circles(247),[(150,1460),(390,1320)]);self.assertEqual((1460-1320)/70,2)
        self.assertEqual(circles(248),[(150,1130),(260,1370),(370,1430)])
        for x,y in circles(248):self.assertEqual((1450-y)/640,2**(-1-2*sp.Rational(x-150,110)))

if __name__=='__main__':unittest.main()
