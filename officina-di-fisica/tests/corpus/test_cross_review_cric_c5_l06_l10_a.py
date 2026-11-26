"""Separate reviewer regressions for fifty C5 questions, no authoring imports."""
import ast,copy,hashlib,importlib,inspect,json,subprocess,tempfile,base64,shutil
from pathlib import Path
from fractions import Fraction
import unittest
from unittest import mock
import sympy as s
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c5_radiation_optics_review_common_a as c
APP=Path(__file__).resolve().parents[2];PROOF=APP/'editorial/reviews/cric-c5-006-010-independent-proof-20261127';FIX=PROOF/'fixtures';ASSETS=FIX/'assets'
MODULES=[importlib.import_module(f'tools.corpus_engineering.cric_c5_l{n:02}_verifier')for n in range(6,11)]
def packet(m):
    batch=m.__name__.split('.')[-1].removesuffix('_verifier').replace('_','-')
    return batch,json.loads((FIX/(batch+'.json')).read_text()),json.loads((FIX/(batch+'-bindings.json')).read_text())
def rebind(m,p,b):
    by={r['id']:r for r in b};pins={}
    for r in p['records']:
        x=by[r['id']];x['candidateSha256']=digest(r);pins[r['id']]=digest({'record':r,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class IndependentC5Review(unittest.TestCase):
    stats={'wrongKeysRejected':0,'metadataRejected':0,'unitToleranceRejected':0,'constitutiveFaultsRejected':0,'inverseFaultsRejected':0,'finiteExactRejections':0,'hypothesisConfigurations':0,'domainBackslidesRejected':0,'accessibleAssetMutationsRejected':0,'equivalentAlternativeDuplicatesRejected':0}
    def test_01_identity_saved_fresh_and_git_inputs(self):
        source=json.loads((APP/'editorial/reviews/cric-c5-006-010-source-assets-20261127/C5-original-verbatim.json').read_text());source={r['id']:r for r in source if r.get('kind')=='question'};ids=[]
        for m in MODULES:
            batch,p,b=packet(m);fresh=m.report(p,b,ASSETS);saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(p['records']),10);self.assertEqual(len({r['family']for r in p['records']}),10)
            raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+'.json'],cwd=APP);self.assertEqual(raw,(FIX/(batch+'.json')).read_bytes())
            for r,x in zip(p['records'],b):self.assertEqual(x['sourceSha256'],digest(source[r['id']]));self.assertEqual(r['version'],source[r['id']]['version']+1);self.assertEqual(r['baseVersion'],source[r['id']]['version']);ids.append(r['id'])
        self.assertEqual(set(ids),{f'C5-Q{n:03}'for n in range(51,101)})
        for folder in[PROOF,APP/'editorial/reviews/cric-c5-051-100-reviewer-a-prekey-20261127',APP/'editorial/reviews/cric-c5-006-010-source-assets-20261127']:
            for e in json.loads((folder/'git-inputs.json').read_text())['inputs']:
                self.assertEqual(len(e['commit']),40);raw=subprocess.check_output(['git','show',e['commit']+':'+e['path']],cwd=APP);self.assertEqual(raw,(folder/e['snapshot']).read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),e['sha256'])
    def test_02_every_wrong_key_retokenized_rebound(self):
        for m in MODULES:
            _,op,ob=packet(m)
            for i,row in enumerate(op['records']):
                wrong=[v for v in row['answer'].get('options',[])if v!=row['answer']['value']]if row['answer']['type']=='choice'else[row['answer']['value']+1]
                for value in wrong:
                    p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer']['value']=value
                    with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
                    self.assertFalse(r['ok'],(row['id'],value));self.assertTrue(any('Independent physical'in e or 'Independent specific physics'in e or 'Independent exact alternatives'in e for e in r['errors']),r['errors']);self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in r['errors']));self.stats['wrongKeysRejected']+=1
    def test_03_metadata_and_mapping_rebound(self):
        for m in MODULES:
            _,op,ob=packet(m)
            for field,value in[('family','collapsed-cohort-family'),('version',100),('baseVersion',100),('course','C1'),('skill','C1-L001'),('prerequisites',['C5-L999']),('review','APPROVED')]:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0][field]=value;self.assertNotEqual(p['records'][0],op['records'][0])
                with rebind(m,p,b):r=m.verify(p,b,ASSETS)[0]
                self.assertFalse(r['ok']);self.stats['metadataRejected']+=1
            p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0]['error']['target']='lab:C5'
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[0]
            self.assertFalse(r['ok']);self.stats['metadataRejected']+=1
    def test_04_numeric_units_and_tolerance_rebound(self):
        for m in MODULES:
            _,op,ob=packet(m)
            for i,row in enumerate(op['records']):
                if row['answer']['type']!='numeric':continue
                for field,value in[('unit','s'),('tolerance',1)]:
                    p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer'][field]=value
                    with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
                    self.assertFalse(r['ok']);self.assertTrue(any('physical numeric unit or tolerance'in e for e in r['errors']));self.stats['unitToleranceRejected']+=1
    def test_05_constitutive_and_inverse_guards_isolated_from_pins(self):
        faults=[('wave_length',lambda a,b:a*b),('reflected_range',lambda a,b:a*b),('field_intensity_ratio',lambda a:a),('transmission_product',lambda a,b:a+b),('attenuation_slope',lambda a,b,d,e:(e-b)/(d-a)),('photon_power',lambda a,b:a/b),('alpha_daughter',lambda a,z:{'A':a-4,'Z':z-2,'N':a-z-4}),('beta_plus_protons',lambda z,n:z+1),('detector_activity',lambda a,b:a*b),('image_distance',lambda a,b:a*b/(a+b))]
        m=MODULES[0];_,p,b=packet(m)
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows),name);self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['constitutiveFaultsRejected']+=1
        for name,wrong in[('focal_length',lambda p,q:p+q),('object_for_real_magnification',lambda f,m:f*(1+1/m)),('wavelength_index',lambda a,b:b/a)]:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.stats['inverseFaultsRejected']+=1
    def test_06_finite_exact_before_cast_in_every_numeric_helper(self):
        cases=[(c.model.wave_length,[300,20]),(c.model.reflected_range,[300,2]),(c.model.field_intensity_ratio,[3]),(c.model.photon_rate_ratio,[2]),(c.model.wavelength_index,[660,440]),(c.model.threshold_wavelength,[1240,8]),(c.model.transmission_product,[s.Rational(4,5),s.Rational(1,4)]),(c.model.attenuation_slope,[0,0,3,-s.Rational(21,10)]),(c.model.optical_depth,[2,s.Rational(3,10)]),(c.model.photon_power,[3,4]),(c.model.alpha_daughter,[210,84]),(c.model.beta_plus_protons,[7,6]),(c.model.half_life_from_assigned_log,[s.Rational(693,1000),s.Rational(231,1000)]),(c.model.activity,[2,50]),(c.model.decayed_fraction,[4]),(c.model.detector_activity,[180,s.Rational(1,4)]),(c.model.equal_activity_population_ratio,[2,1]),(c.model.reflection_from_surface_angle,[25]),(c.model.refracted_index,[1,s.pi/4,s.pi/6]),(c.model.speed_index,[300,200]),(c.model.ray_segment_angle,[30]),(c.model.reflected_rotation,[4]),(c.model.image_distance,[8,16]),(c.model.focal_length,[24,40]),(c.model.magnification,[-30,12]),(c.model.object_for_real_magnification,[10,-2])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in[True,False,0.25,s.Float('0.25'),s.I,s.oo,-s.oo,s.nan,1+2j,'2',s.Symbol('x',positive=True)]:
                    a=args.copy();a[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*a)
                    self.stats['finiteExactRejections']+=1
        invalid=[(c.model.wave_length,[1,0]),(c.model.transmission_product,[-1,1]),(c.model.transmission_product,[1,2]),(c.model.attenuation_slope,[1,0,1,-2]),(c.model.attenuation_slope,[0,0,1,1]),(c.model.alpha_daughter,[s.Rational(11,2),2]),(c.model.alpha_daughter,[3,2]),(c.model.beta_plus_protons,[0,1]),(c.model.decayed_fraction,[-1]),(c.model.detector_activity,[1,2]),(c.model.reflection_from_surface_angle,[91]),(c.model.refracted_index,[1,0,s.pi/6]),(c.model.image_distance,[2,2]),(c.model.object_for_real_magnification,[2,0]),(c.model.object_for_real_magnification,[2,1])]
        for fn,args in invalid:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.image_distance(6,3),-6);self.assertEqual(c.model.magnification(-30,12),-s.Rational(5,2));self.assertEqual(c.model.reflected_rotation(-4),8);self.assertEqual(c.model.optical_depth(0,2),0)
    def test_07_exact_lexemes_and_equivalent_quantity_duplicates(self):
        for raw,want,dim in[('1,8 m',s.Rational(9,5),'length'),('70 m⁻¹',70,'inverse_length'),('0,70 cm⁻¹',70,'inverse_length'),('1200 μW',s.Rational(3,2500),'power'),('93,75%',s.Rational(15,16),'pure'),('√2',s.sqrt(2),'pure'),('−5/2',-s.Rational(5,2),'pure')]:
            value,dimension=c.quantity(raw);self.assertEqual(s.simplify(value-want),0);self.assertEqual(dimension,dim)
        for raw in['__import__("os")','nan','oo','1e999','r(-1)','[1]','True','10**999','1/0','1;2']:
            with self.assertRaises((ValueError,TypeError,SyntaxError)):c.quantity(raw)
        aliases=[(0,'C5-Q057','180 cm'),(1,'C5-Q065','70 m⁻¹'),(1,'C5-Q068','1200 μW'),(2,'C5-Q077','375/4%'),(3,'C5-Q084','√8/2'),(4,'C5-Q095','−2,5')]
        for index,identifier,alias in aliases:
            m=MODULES[index];_,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);p['records'][i]['answer']['options'][1]=alias
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('exact alternatives not unique'in e for e in r['errors']));self.stats['equivalentAlternativeDuplicatesRejected']+=1
    def test_08_domain_backslides_retokenized_and_rebound(self):
        cases=[(0,'C5-Q053','non nulli','qualunque'),(0,'C5-Q056','E₀>0','E₀≥0'),(0,'C5-Q060','inizialmente positiva','qualunque'),(1,'C5-Q061','stessa potenza positiva','stessa potenza'),(1,'C5-Q062','strettamente maggiore','maggiore o uguale'),(1,'C5-Q065','I₀>0','I₀≥0'),(1,'C5-Q069','positivi ma diversi','positivi'),(2,'C5-Q080','stessa attività positiva','stessa attività'),(3,'C5-Q087','reciproci','generici'),(4,'C5-Q092','singolo punto','intero oggetto'),(4,'C5-Q096','parassiale','generale'),(4,'C5-Q099','p>f','p≥f')]
        for index,identifier,old,new in cases:
            m=MODULES[index];_,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);self.assertIn(old,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(old,new)
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('optical domain'in e for e in r['errors']));self.stats['domainBackslidesRejected']+=1
    def test_09_portable_identity_and_no_false_approval(self):
        source=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(source,node);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=MODULES[0];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
        for field,value in[('id','FAKE'),('ok',False),('candidateSha256','0'*64),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
            bad=copy.deepcopy(rows);bad[0][field]=value
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
    def test_10_reading_and_dependency_fail_closed(self):
        m=MODULES[0];_,p,b=packet(m)
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c5_051_100_root_review_models.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
    def test_11_accessible_title_description_with_rebound_asset(self):
        import xml.etree.ElementTree as ET
        for m in MODULES:
            batch,op,ob=packet(m)
            for tag in['title','desc']:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);asset=p['assets'][0];old=asset['id'];root=ET.fromstring(base64.b64decode(asset['data']));next(e for e in root if e.tag.rsplit('}',1)[-1]==tag).text='';raw=ET.tostring(root,encoding='utf-8');new=hashlib.sha256(raw).hexdigest();asset.update(id=new,data=base64.b64encode(raw).decode())
                for row in p['records']:
                    for block in row['blocks']:
                        if block.get('type')=='figure'and block.get('src')=='/asset/'+old:block['src']='/asset/'+new
                for x in b:
                    for name,checksum in x['assetChecksums'].items():
                        if checksum==old:x['assetChecksums'][name]=new
                with tempfile.TemporaryDirectory(prefix='cric-c5-a-accessible-')as directory:
                    temp=Path(directory)
                    for src in ASSETS.iterdir():shutil.copyfile(src,temp/src.name)
                    (temp/(batch+'-progressive.svg')).write_bytes(raw)
                    with rebind(m,p,b):rows=m.verify(p,b,temp)
                linked=[r for r in rows if r['assetChecksums']];self.assertTrue(linked);self.assertTrue(all(not r['ok']for r in linked));self.assertTrue(all(any('accessible SVG'in e for e in r['errors'])for r in linked));self.stats['accessibleAssetMutationsRejected']+=1
    def test_12_new_whole_native_and_quantitative_geometry(self):
        import xml.etree.ElementTree as ET
        roots={};D=APP/'editorial/reviews/cric-c5-006-010-asset-review-20261127';self.assertIn('CHILD_EXIT 0',(D/'actual-terminal.txt').read_text())
        for n in range(6,11):
            batch=f'cric-c5-l{n:02}';raw=(ASSETS/(batch+'-progressive.svg')).read_bytes();r=json.loads((D/batch/'actual-render.json').read_text());png=(D/batch/'full-native.png').read_bytes();root=ET.fromstring(raw);roots[n]=root;self.assertEqual(r['sourceSvgSha256'],hashlib.sha256(raw).hexdigest());self.assertEqual(r['pngSha256'],hashlib.sha256(png).hexdigest());self.assertEqual(int.from_bytes(png[16:20],'big'),640);self.assertEqual(int.from_bytes(png[20:24],'big'),int(root.attrib['height']));self.assertEqual(r['clipping'],[])
        tags=lambda n,t:[e.attrib for e in roots[n].iter()if e.tag.rsplit('}',1)[-1]==t]
        bars=[e for e in tags(6,'rect')if e.get('height')=='35'];self.assertEqual([int(e['width'])for e in bars],[40,360]);self.assertEqual(s.Rational(360,40),9);self.assertIn('M160 730V690',[e.get('d')for e in tags(6,'path')]);self.assertIn('M420 730V610',[e.get('d')for e in tags(6,'path')]);self.assertEqual(s.Rational(120,40),3)
        bars=[e for e in tags(7,'rect')if e.get('height')=='40'];self.assertEqual([int(e['width'])for e in bars],[400,320,80]);self.assertEqual(s.Rational(80,400),s.Rational(1,5));points=[(s.Rational(e['cx']),s.Rational(e['cy']))for e in tags(7,'circle')];self.assertEqual(points,[(140,650),(260,730),(380,810),(500,890)]);self.assertEqual(s.Rational(240,360),s.Rational(80,120))
        bars=[e for e in tags(8,'rect')if e.get('height')=='25'];self.assertEqual([int(e['width'])for e in bars],[400,200,100,50,25]);bars=[e for e in tags(8,'rect')if e.get('height')=='40'];self.assertEqual([int(e['width'])for e in bars],[360,90]);self.assertEqual(s.Rational(90,360),s.Rational(1,4))
        rotations=[e.get('transform')for e in tags(9,'g')];self.assertIn('translate(320 300) rotate(25)',rotations);self.assertIn('translate(320 300) rotate(-25)',rotations);self.assertIn('translate(320 815) rotate(-45)',rotations);self.assertIn('translate(320 815) rotate(-30)',rotations);self.assertEqual(c.model.refracted_index(1,s.pi/4,s.pi/6),s.sqrt(2))
        paths=[e.get('d')for e in tags(10,'path')];self.assertIn('M160 200H320L480 400',paths);self.assertIn('M160 200L480 400',paths);self.assertEqual(320+s.Rational(300-200,400-200)*(480-320),400);self.assertIn('M240 760H320L560 925',paths);self.assertIn('M240 760L560 980',paths);self.assertEqual(s.Rational(925-760,560-320),s.Rational(980-760,560-240));self.assertEqual(s.Rational(815-760,320-240),s.Rational(925-760,560-320));self.assertIn('M180 1280V1220',paths);self.assertIn('M450 1280V1430',paths);self.assertEqual(s.Rational(-150,60),-s.Rational(5,2))
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_13_lens_object_image_inverse(self,f,extra):
        p=f+extra;q=c.model.image_distance(f,p);self.assertEqual(c.model.focal_length(p,q),f);self.assertEqual(c.model.object_for_real_magnification(f,-q/p),p);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(0,100),st.integers(0,100))
    def test_14_passive_layers(self,a,b):
        x,y=s.Rational(a,100),s.Rational(b,100);product=c.model.transmission_product(x,y);self.assertEqual(product,c.model.transmission_product(y,x));self.assertTrue(0<=product<=min(x,y));self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_15_detector_inverse(self,rate,e):
        efficiency=s.Rational(e,100);activity=c.model.detector_activity(rate,efficiency);self.assertEqual(activity*efficiency,rate);self.assertGreaterEqual(activity,rate);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_16_graded_attenuation(self,coefficient,start,step):
        a=-coefficient*start;b=-coefficient*(start+step);self.assertEqual(c.model.attenuation_slope(start,a,start+step,b),coefficient);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_17_wave_frequency_scaling(self,speed,frequency):
        wavelength=c.model.wave_length(speed,frequency);self.assertEqual(wavelength*frequency,speed);self.assertEqual(c.model.wave_length(speed,2*frequency),wavelength/2);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_18_alpha_and_beta_bookkeeping(self,z,neutrons):
        z+=2;neutrons+=2;daughter=c.model.alpha_daughter(z+neutrons,z);self.assertEqual(daughter['A'],daughter['Z']+daughter['N']);self.assertEqual(daughter['N'],neutrons-2);self.assertEqual(c.model.beta_plus_protons(z,neutrons),z-1);self.stats['hypothesisConfigurations']+=1
    def test_19_threshold_not_answer_table_and_prekey_si(self):
        self.assertEqual(len(c.model.source.si_checks()),15);self.assertEqual(c.model.source.exact_checks()['symbolicInvariants'],11);m=MODULES[1];_,p,b=packet(m);i=next(i for i,r in enumerate(p['records'])if r['id']=='C5-Q062');row=m.verify(p,b,ASSETS)[i];self.assertTrue(row['ok']);self.assertIn('155',row['expectedExact']);self.assertEqual(c.physical_oracle()[62],155)
        # Renew pins after adding an alternative at the same strict-threshold branch.
        p=copy.deepcopy(p);b=copy.deepcopy(b);p['records'][i]['answer']['options'][1]='λ₀=140 nm'
        with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
        self.assertFalse(r['ok']);self.assertTrue(any('strict-threshold alternatives not unique'in e for e in r['errors']))
