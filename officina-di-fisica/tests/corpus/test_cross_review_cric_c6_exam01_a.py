"""Independent protected-exam regressions; no candidate-authoring imports."""
import ast,base64,copy,hashlib,importlib,inspect,json,shutil,subprocess,tempfile,unittest
from pathlib import Path
from unittest import mock
from fractions import Fraction
import sympy as s
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c6_exam01_review_common_a as c
m=importlib.import_module('tools.corpus_engineering.cric_c6_protected_exam_01_verifier')
APP=Path(__file__).resolve().parents[2];D=APP/'editorial/reviews/cric-c6-exam01-independent-proof-a-20261127';F=D/'fixtures';ASSETS=F/'assets';BATCH='cric-c6-protected-exam-01'
def packet():return json.loads((F/(BATCH+'.json')).read_text()),json.loads((F/(BATCH+'-bindings.json')).read_text())
def rebound(p,b):
    by={x['id']:x for x in b};pins={}
    for row in p['records']:
        x=by[row['id']];x['candidateSha256']=digest(row);pins[row['id']]=digest({'record':row,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class SeparateC6Exam01(unittest.TestCase):
    stats={'packetWrongKeys':0,'metadata':0,'unitTolerance':0,'mathFaults':0,'finiteExact':0,'domainBackslides':0,'accessibleAssets':0,'hypothesis':0,'equivalentDuplicates':0}
    def test_01_fresh_saved_identity_original_versions_and_git(self):
        p,b=packet();fresh=m.report(p,b,ASSETS);saved=json.loads((APP/f'editorial/reviews/{BATCH}.json').read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
        assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(p['records']),31);self.assertEqual(len({r['family']for r in p['records']}),31)
        source={r['id']:r for r in json.loads((APP/'editorial/reviews/cric-c6-exam01-source-reading-a-20261127/C6-original-verbatim.json').read_text())}
        for row in p['records']:
            old=source[row['id']]
            for key in ['id','section','exam','family','difficulty','course','skill','prerequisites','order']:self.assertEqual(row.get(key),old.get(key))
            self.assertEqual(row['version'],old['version']+1);self.assertEqual(row['baseVersion'],old['version']);self.assertIs(type(row['exam']),int);self.assertEqual(row['exam'],1)
        self.assertEqual(subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+BATCH+'.json'],cwd=APP),(F/(BATCH+'.json')).read_bytes())
        for folder in [D,APP/'editorial/reviews/cric-c6-exam01-source-reading-a-20261127']:
            for x in json.loads((folder/'git-inputs.json').read_text())['inputs']:
                raw=subprocess.check_output(['git','show',x['commit']+':'+x['path']],cwd=APP);self.assertEqual(len(x['commit']),40);self.assertEqual(raw,(folder/x['snapshot']).read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),x['sha256'])
    def test_02_wrong_keys_with_all_integrity_pins_rebound(self):
        original,bindings=packet()
        for i,row in enumerate(original['records']):
            wrong=[o for o in row['answer']['options']if o!=row['answer']['value']]if row['answer']['type']=='choice'else[row['answer']['value']+1,row['answer']['value']-1]
            for key in wrong:
                p,b=copy.deepcopy(original),copy.deepcopy(bindings);p['records'][i]['answer']['value']=key
                with rebound(p,b):result=m.verify(p,b,ASSETS)[i]
                self.assertFalse(result['ok'],(row['id'],key));self.assertTrue(any('physical'in e or 'specific physics conceptual key mismatch'in e or 'alternatives'in e for e in result['errors']),result['errors']);self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in result['errors']));self.stats['packetWrongKeys']+=1
    def test_03_every_section_and_protected_exam_metadata_rebound(self):
        op,ob=packet()
        for i,row in enumerate(op['records']):
            for field,value in [('section','Collapsed exam cohort'),('exam',None),('exam',True),('exam',False),('exam',1.0)]:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i][field]=value
                with rebound(p,b):result=m.verify(p,b,ASSETS)[i]
                self.assertFalse(result['ok']);self.assertTrue(any('identity/taxonomy'in e for e in result['errors']));self.stats['metadata']+=1
        for field,value in [('family','collapsed'),('course','C1'),('skill','C6-L999'),('prerequisites',['FAKE']),('difficulty',99),('version',99),('baseVersion',99),('review','APPROVED')]:
            p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0][field]=value
            with rebound(p,b):self.assertFalse(m.verify(p,b,ASSETS)[0]['ok'])
            self.stats['metadata']+=1
    def test_04_numeric_units_and_tolerance(self):
        op,ob=packet()
        for i,row in enumerate(op['records']):
            if row['answer']['type']!='numeric':continue
            for field,value in [('unit','WRONG'),('tolerance',1)]:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer'][field]=value
                with rebound(p,b):r=m.verify(p,b,ASSETS)[i]
                self.assertFalse(r['ok']);self.assertTrue(any('unit or tolerance'in e for e in r['errors']));self.stats['unitTolerance']+=1
    def test_05_constitutive_faults_reject_without_edition_change(self):
        p,b=packet();faults=[('average_velocity',lambda a,b,c,d:(a+b)/(c+d)),('internal_change',lambda q,w:q-w),('perpendicular_force',lambda a,b:a+b),('tether_upward_force',lambda a,b:a-b),('parallel_series',lambda a,b,c:a+b+c),('half_life',lambda a,b,t:t),('arrival_speed',lambda g,h:g*h),('tendon_tension',lambda p,a,b:p*b/a),('carnot',lambda h,c:c/h),('triangle_impulse',lambda f,t:f*t),('mixing_temperature',lambda a,b,t,u:t+u)]
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows),name);self.assertTrue(any('constitutive oracle'in e for e in rows[0]['errors']));self.stats['mathFaults']+=1
    def test_06_finite_real_exact_before_all_casts(self):
        cases=[(c.model.average_velocity,[12,4,3,1]),(c.model.internal_change,[60,25]),(c.model.perpendicular_force,[5,12]),(c.model.tether_upward_force,[9,6]),(c.model.parallel_series,[6,3,3]),(c.model.half_life,[960,120,15]),(c.model.arrival_speed,[10,s.Rational(9,5)]),(c.model.tendon_tension,[18,30,3]),(c.model.carnot,[500,300]),(c.model.triangle_impulse,[12,s.Rational(1,2)]),(c.model.mixing_temperature,[1,1,15,45])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in [True,False,0.25,s.Float('0.25'),s.I,s.oo,-s.oo,s.nan,'2',s.Symbol('x',positive=True),1+2j]:
                    values=args.copy();values[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*values)
                    self.stats['finiteExact']+=1
        for fn,args in [(c.model.average_velocity,[1,1,0,1]),(c.model.half_life,[1,2,1]),(c.model.half_life,[1,1,1]),(c.model.carnot,[300,500]),(c.model.mixing_temperature,[0,1,10,20]),(c.model.parallel_series,[1,-1,1])]:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.internal_change(-60,25),-35);self.assertEqual(c.model.tether_upward_force(9,6),-3)
    def test_07_domain_backslides_rebound(self):
        op,ob=packet();cases=[(14,'ferma','in moto'),(17,'uguali ampiezze non nulle','ampiezze qualunque'),(19,'fissato sotto','fissato sopra'),(21,'pressione costante','pressione variabile'),(24,'positiva e costante','qualunque'),(25,'fissa e lineare','in moto'),(26,'interamente','parzialmente'),(29,'lavoro d’albero',''),(30,'carica non nulla','carica qualunque'),(33,'stessa capacità termica totale positiva e costante','stessa massa'),(39,'sola interfaccia','doppia interfaccia')]
        for n,old,new in cases:
            i=next(i for i,r in enumerate(op['records'])if r['id']==f'C6-Q{n:03}');p,b=copy.deepcopy(op),copy.deepcopy(ob);self.assertIn(old,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(old,new)
            with rebound(p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('domain not explicit'in e for e in r['errors']));self.stats['domainBackslides']+=1
    def test_08_exact_lexemes_phases_and_si_equivalence(self):
        for raw,want,dim in [('0,90 m',s.Rational(9,10),'length'),('90 cm',s.Rational(9,10),'length'),('0 °C',s.Rational(27315,100),'temperature'),('300 K',300,'temperature'),('0,085 kJ',85,'energy')]:
            got,d=c.quantity(raw);self.assertEqual(s.simplify(got-want),0);self.assertEqual(d,dim)
        for raw in ['__import__("os")','True','nan','oo','1/0','1e999','[1]','10**999']:
            with self.assertRaises((ValueError,TypeError,SyntaxError)):c.quantity(raw)
        op,ob=packet();i=4
        for equivalent in ['90 cm','0,30 m','1,50 m']:
            p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer']['options'][1]=equivalent
            with rebound(p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('alternatives not unique'in e for e in r['errors']));self.stats['equivalentDuplicates']+=1
    def test_09_identity_rejects_ok_key_and_false_human(self):
        p,b=packet();rows=m.verify(p,b,ASSETS)
        for key,value in [('id','FAKE'),('candidateSha256','0'*64),('ok',False),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
            bad=copy.deepcopy(rows);bad[0][key]=value
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
        text=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(text).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(text,node)
        self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
    def test_10_accessible_assets_rebound(self):
        import xml.etree.ElementTree as ET
        op,ob=packet()
        for tag in ['title','desc']:
            p,b=copy.deepcopy(op),copy.deepcopy(ob);asset=p['assets'][0];old=asset['id'];root=ET.fromstring(base64.b64decode(asset['data']));next(e for e in root if e.tag.rsplit('}',1)[-1]==tag).text='';raw=ET.tostring(root,encoding='utf-8');new=hashlib.sha256(raw).hexdigest();asset.update(id=new,data=base64.b64encode(raw).decode())
            for row in p['records']:
                for block in row['blocks']:
                    if block.get('type')=='figure'and block.get('src')=='/asset/'+old:block['src']='/asset/'+new
            for x in b:
                for name,checksum in x['assetChecksums'].items():
                    if checksum==old:x['assetChecksums'][name]=new
            with tempfile.TemporaryDirectory(prefix='cric-c6-a11y-')as folder:
                temp=Path(folder)
                for src in ASSETS.iterdir():shutil.copyfile(src,temp/src.name)
                (temp/(BATCH+'-progressive.svg')).write_bytes(raw)
                with rebound(p,b):rows=m.verify(p,b,temp)
            linked=[r for r in rows if r['assetChecksums']];self.assertTrue(linked);self.assertTrue(all(not r['ok']for r in linked));self.assertTrue(all(any('accessible SVG'in e for e in r['errors'])for r in linked));self.stats['accessibleAssets']+=1
    def test_11_actual_native_and_geometric_dimensions(self):
        D=APP/'editorial/reviews/cric-c6-exam01-asset-review-a-20261127';report=json.loads((D/BATCH/'actual-render.json').read_text());self.assertEqual((report['pngWidth'],report['pngHeight']),(640,1740));self.assertEqual(report['clipping'],[]);self.assertIn('CHILD_EXIT 0',(D/'actual-terminal.txt').read_text());self.assertEqual(report['sourceSvgSha256'],hashlib.sha256((ASSETS/(BATCH+'-progressive.svg')).read_bytes()).hexdigest())
        self.assertEqual((500-140)/(500-380),3);self.assertEqual(s.Rational(12,1)*s.Rational(1,2)/2,3)
    def test_12_pint_and_symbolic_source_models(self):
        self.assertEqual(len(c.model.pint_checks()),8);self.assertTrue(all(c.model.symbolic_checks().values()));self.assertEqual(len(c.physical_oracle()),11)
    def test_13_default_deny_reading_and_dependencies(self):
        p,b=packet()
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c6_exam01_prompt_only_models_a.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(-1000,1000),st.integers(-1000,1000))
    def test_14_hyp_signed_energy(self,q,w):self.assertEqual(c.model.internal_change(q,w),q+w);self.stats['hypothesis']+=1
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,1000))
    def test_15_hyp_passive_network(self,a,b,d):
        value=c.model.parallel_series(a,b,d);self.assertGreater(value,0);self.assertLess(value,a);self.assertLess(value,b+d);self.stats['hypothesis']+=1
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(-100,100),st.integers(-100,100),st.integers(1,100),st.integers(1,100))
    def test_16_hyp_affine_temperature(self,t,u,a,b):
        shift=s.Rational(27315,100);value=c.model.mixing_temperature(a,b,t,u);self.assertEqual(c.model.mixing_temperature(a,b,t+shift,u+shift),value+shift);self.assertLessEqual(min(t,u),value);self.assertGreaterEqual(max(t,u),value);self.stats['hypothesis']+=1
