"""Separate reviewer regressions for fifty C4 questions, no authoring imports."""
import ast,copy,hashlib,importlib,inspect,json,subprocess,tempfile,base64,shutil
from pathlib import Path
from fractions import Fraction
import unittest
from unittest import mock
import sympy as s
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c4_electromagnetism_review_common_a as c
APP=Path(__file__).resolve().parents[2];PROOF=APP/'editorial/reviews/cric-c4-006-010-independent-proof-20261126';FIX=PROOF/'fixtures';ASSETS=FIX/'assets'
MODULES=[importlib.import_module(f'tools.corpus_engineering.cric_c4_l{n:02}_verifier')for n in range(6,11)]
def packet(m):
    batch=m.__name__.split('.')[-1].removesuffix('_verifier').replace('_','-')
    return batch,json.loads((FIX/(batch+'.json')).read_text()),json.loads((FIX/(batch+'-bindings.json')).read_text())
def rebind(m,p,b):
    by={r['id']:r for r in b};pins={}
    for r in p['records']:
        x=by[r['id']];x['candidateSha256']=digest(r);pins[r['id']]=digest({'record':r,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class IndependentC4Review(unittest.TestCase):
    stats={'wrongKeysRejected':0,'metadataRejected':0,'unitToleranceRejected':0,'constitutiveFaultsRejected':0,'inverseFaultsRejected':0,'finiteExactRejections':0,'hypothesisConfigurations':0,'domainBackslidesRejected':0,'accessibleAssetMutationsRejected':0,'equivalentAlternativeDuplicatesRejected':0}
    def test_01_identity_saved_fresh_and_git_inputs(self):
        source=json.loads((APP/'editorial/reviews/cric-c4-006-010-source-assets-20261126/C4-original-verbatim.json').read_text());source={r['id']:r for r in source if r.get('kind')=='question'};ids=[]
        for m in MODULES:
            batch,p,b=packet(m);fresh=m.report(p,b,ASSETS);saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(p['records']),10);self.assertEqual(len({r['family']for r in p['records']}),10)
            raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+'.json'],cwd=APP);self.assertEqual(raw,(FIX/(batch+'.json')).read_bytes())
            for r,x in zip(p['records'],b):self.assertEqual(x['sourceSha256'],digest(source[r['id']]));self.assertEqual(r['version'],source[r['id']]['version']+1);self.assertEqual(r['baseVersion'],source[r['id']]['version']);ids.append(r['id'])
        self.assertEqual(set(ids),{f'C4-Q{n:03}'for n in range(51,101)})
        for folder in[PROOF,APP/'editorial/reviews/cric-c4-051-100-reviewer-a-prekey-models-20261126',APP/'editorial/reviews/cric-c4-006-010-source-assets-20261126']:
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
            for field,value in[('family','collapsed-cohort-family'),('version',100),('baseVersion',100),('course','C1'),('skill','C1-L001'),('prerequisites',[]),('review','APPROVED')]:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0][field]=value
                with rebind(m,p,b):r=m.verify(p,b,ASSETS)[0]
                self.assertFalse(r['ok']);self.stats['metadataRejected']+=1
            p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0]['error']['target']='lab:C4'
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
    def test_05_physics_guards_isolated_from_all_packet_pins(self):
        faults=[('parallel_resistance',lambda a,b:a+b),('capacitor_series',lambda a,b:a+b),('capacitor_energy',lambda cap,v:cap*v/2),('sharing_voltage',lambda cs,vs:sum(vs)/len(vs)),('flux',lambda b,a,t:b*a*s.sin(t)),('mean_emf',lambda n,i,f,t:n*(f-i)/t),('lorentz_force',lambda q,v,b:-q*s.Matrix(v).cross(s.Matrix(b)))]
        m=MODULES[0];_,p,b=packet(m)
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['constitutiveFaultsRejected']+=1
        for name,wrong in[('parallel_unknown',lambda e,k:k-e),('series_capacitor_unknown',lambda e,k:k-e)]:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.stats['inverseFaultsRejected']+=1
    def test_06_finite_exact_before_cast_in_all_numeric_boundaries(self):
        cases=[(c.model.parallel_resistance,[30,60]),(c.model.parallel_unknown,[4,12]),(c.model.capacitor_series,[9,s.Rational(9,2)]),(c.model.series_capacitor_unknown,[3,9]),(c.model.capacitor_energy,[5,4]),(lambda a,b:c.model.sharing_voltage([a,2],[b,-3]),[2,3]),(c.model.capacitance_ratio,[4,12]),(c.model.flux,[s.Rational(3,10),s.Rational(1,50),s.pi/3]),(c.model.mean_emf,[1,0,s.Rational(8,1000),s.Rational(8,1000)]),(lambda q,v,b:c.model.lorentz_force(q,[v,0,0],[0,0,b]),[-1,1,-1])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in[True,False,0.25,s.Float('0.25'),s.I,s.oo,-s.oo,s.nan,1+2j,'2',s.Symbol('x',positive=True)]:
                    a=args.copy();a[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*a)
                    self.stats['finiteExactRejections']+=1
        for fn,args in[(c.model.parallel_unknown,[3,3]),(c.model.parallel_unknown,[4,3]),(c.model.series_capacitor_unknown,[4,3]),(c.model.capacitor_energy,[0,3]),(c.model.mean_emf,[s.Rational(3,2),0,1,2]),(c.model.mean_emf,[1,0,1,0]),(c.model.lorentz_force,[1,[1,2],[1,2,3]]),(c.model.sharing_voltage,[[],[]])]:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.capacitor_energy(2,-3),9);self.assertEqual(c.model.sharing_voltage([2,2],[3,-3]),0);self.assertEqual(c.model.flux(-2,3,0),-6)
    def test_07_exact_lexical_quantities_and_SI_duplicate_alternatives(self):
        for raw,want,dim in[('0,30 A',s.Rational(3,10),'current'),('4,5 μF',s.Rational(9,2000000),'capacitance'),('100 cm²',s.Rational(1,100),'area'),('0,020 Wb/s',s.Rational(1,50),'voltage'),('3 mWb',s.Rational(3,1000),'flux'),('16/3',s.Rational(16,3),'pure')]:
            got,d=c.quantity(raw);self.assertEqual(s.simplify(got-want),0);self.assertEqual(d,dim)
        for raw in['__import__("os")','nan','oo','1e999','r(-1)','[1]','True','10**999','1/0','1;2']:
            with self.assertRaises((ValueError,TypeError,SyntaxError)):c.quantity(raw)
        for m,identifier,alias in[(MODULES[0],'C4-Q051','300 mA'),(MODULES[1],'C4-Q063','F'),(MODULES[2],'C4-Q074','4500000 pF'),(MODULES[4],'C4-Q094','0,020 V'),(MODULES[4],'C4-Q096','1/10 V')]:
            _,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);p['records'][i]['answer']['options'][1]=alias
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('exact alternatives not unique'in e for e in r['errors']));self.stats['equivalentAlternativeDuplicatesRejected']+=1
    def test_08_domain_backslides_rebound(self):
        cases=[(0,'C4-Q052','tensione non nulla','tensione'),(1,'C4-Q062','Q>0','Q≥0'),(1,'C4-Q068','resta collegato per l’intero processo','è collegato inizialmente'),(2,'C4-Q071','inizialmente scarichi','preparati'),(2,'C4-Q072','Q>0','Q≥0'),(2,'C4-Q075','resistenza positiva','collegamenti ideali'),(3,'C4-Q087','entrambe non nulle','qualunque'),(4,'C4-Q098','monotonamente','genericamente')]
        for index,identifier,old,new in cases:
            m=MODULES[index];_,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);self.assertIn(old,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(old,new)
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok']);self.assertTrue(any('electromagnetic domain'in e for e in r['errors']));self.stats['domainBackslidesRejected']+=1
    def test_09_portable_identity_and_no_false_approval(self):
        source=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(source,node);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=MODULES[0];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
        for field,value in[('id','FAKE'),('ok',False),('candidateSha256','0'*64),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
            bad=copy.deepcopy(rows);bad[0][field]=value
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
    def test_10_reading_and_dependency_fail_closed(self):
        m=MODULES[0];_,p,b=packet(m)
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c4_051_100_root_review_models.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
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
                with tempfile.TemporaryDirectory(prefix='cric-c4-a-accessible-')as directory:
                    temp=Path(directory)
                    for src in ASSETS.iterdir():shutil.copyfile(src,temp/src.name)
                    (temp/(batch+'-progressive.svg')).write_bytes(raw)
                    with rebind(m,p,b):rows=m.verify(p,b,temp)
                linked=[r for r in rows if r['assetChecksums']];self.assertTrue(linked);self.assertTrue(all(not r['ok']for r in linked));self.assertTrue(all(any('accessible SVG'in e for e in r['errors'])for r in linked));self.stats['accessibleAssetMutationsRejected']+=1
    def test_12_real_full_native_and_geometrical_scales(self):
        import xml.etree.ElementTree as ET
        roots={};D=APP/'editorial/reviews/cric-c4-006-010-asset-review-20261126';self.assertIn('CHILD_EXIT 0',(D/'actual-terminal.txt').read_text())
        for n in range(6,11):
            batch=f'cric-c4-l{n:02}';raw=(ASSETS/(batch+'-progressive.svg')).read_bytes();r=json.loads((D/batch/'actual-render.json').read_text());png=(D/batch/'full-native.png').read_bytes();root=ET.fromstring(raw);roots[n]=root;self.assertEqual(r['sourceSvgSha256'],hashlib.sha256(raw).hexdigest());self.assertEqual(r['pngSha256'],hashlib.sha256(png).hexdigest());self.assertEqual(int.from_bytes(png[16:20],'big'),640);self.assertEqual(int.from_bytes(png[20:24],'big'),int(root.attrib['height']));self.assertEqual(r['clipping'],[])
        tags=lambda n,t:[e.attrib for e in roots[n].iter()if e.tag.rsplit('}',1)[-1]==t]
        bars=[r for r in tags(6,'rect')if r.get('height')=='45'];self.assertEqual([s.Rational(r['width'])for r in bars],[300,150]);self.assertIn('M140 1440L500 1170',[p.get('d')for p in tags(6,'path')]);self.assertEqual(s.Rational(270,360),s.Rational(6,5)/30*s.Rational(225,12))
        self.assertIn('M140 410L440 170',[p.get('d')for p in tags(7,'path')]);self.assertEqual((s.Integer(410)-314)/(260-140),(s.Integer(410)-170)/(440-140));self.assertIn('320,1410 500,1410 500,1130 320,1270',[p.get('points')for p in tags(7,'polygon')]);self.assertEqual(s.Rational(140+280,2)*180/(18*70),30)
        bars=[r for r in tags(8,'rect')if r.get('height')=='42'];self.assertEqual([s.Rational(r['width'])for r in bars],[270,135,90]);bars=[r for r in tags(8,'rect')if r.get('height')=='55'];self.assertEqual([s.Rational(r['width'])for r in bars],[160,240,100,300]);self.assertEqual(160+240,100+300)
        self.assertIn('M250 280V210',[p.get('d')for p in tags(9,'path')]);self.assertIn('M550 280V350',[p.get('d')for p in tags(9,'path')]);self.assertIn('M200 795V920',[p.get('d')for p in tags(9,'path')]);bars=[r for r in tags(9,'rect')if r.get('height')=='55'];self.assertEqual([r['width']for r in bars],['100']*4)
        self.assertIn('M180 440L405.166605 310',[p.get('d')for p in tags(10,'path')]);self.assertEqual(s.Integer(440)-310,130);self.assertLess(abs(s.Rational('225.166605')-130*s.sqrt(3)),s.Rational(1,10**6));self.assertIn('M180 350A90 90 0 0 1 257.942286 395',[p.get('d')for p in tags(10,'path')]);self.assertIn('M140 1430L340 1230H540',[p.get('d')for p in tags(10,'path')]);self.assertIn('M420 805A100 100 0 0 0 320 705',[p.get('d')for p in tags(10,'path')])
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_13_passive_parallel_inverse(self,a,b):
        e=c.model.parallel_resistance(a,b);self.assertTrue(0<e<min(a,b));self.assertEqual(c.model.parallel_unknown(e,a),b);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100))
    def test_14_series_capacitor_inverse(self,a,b):
        e=c.model.capacitor_series(a,b);self.assertTrue(0<e<min(a,b));self.assertEqual(c.model.series_capacitor_unknown(e,a),b);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,50),st.integers(1,50),st.integers(-50,50),st.integers(-50,50))
    def test_15_node_charge_and_energy_loss(self,a,b,x,y):
        v=c.model.sharing_voltage([a,b],[x,y]);self.assertEqual((a+b)*v,a*x+b*y);loss=c.model.capacitor_energy(a,x)+c.model.capacitor_energy(b,y)-c.model.capacitor_energy(a+b,v);self.assertEqual(s.factor(loss-s.Rational(a*b,2*(a+b))*(x-y)**2),0);self.assertGreaterEqual(loss,0);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(-10,10),st.lists(st.integers(-10,10),min_size=3,max_size=3),st.lists(st.integers(-10,10),min_size=3,max_size=3))
    def test_16_lorentz_orthogonality(self,q,v,b):
        f=c.model.lorentz_force(q,v,b);self.assertEqual(f.dot(s.Matrix(v)),0);self.assertEqual(f.dot(s.Matrix(b)),0);self.assertEqual(c.model.lorentz_force(-q,v,b),-f);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50),st.integers(-50,50),st.integers(1,50))
    def test_17_faraday_signed_average(self,n,initial,final,t):
        e=c.model.mean_emf(n,initial,final,t);self.assertEqual(e*t,-n*(final-initial));self.assertEqual(c.model.mean_emf(n,final,initial,t),-e);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_18_energy_sign_and_scaling(self,cap,v):
        u=c.model.capacitor_energy(cap,v);self.assertGreaterEqual(u,0);self.assertEqual(c.model.capacitor_energy(cap,-v),u);self.assertEqual(c.model.capacitor_energy(cap,2*v),4*u);self.stats['hypothesisConfigurations']+=1
    def test_19_prekey_si_and_dual_graph_calibration(self):
        self.assertEqual(len(c.model.source.pint_checks()),15);self.assertTrue(all(c.model.source.symbolic_invariants().values()));self.assertEqual(c.physical_oracle()[80],s.Rational(16,3));self.assertEqual(c.physical_oracle()[91],3)
