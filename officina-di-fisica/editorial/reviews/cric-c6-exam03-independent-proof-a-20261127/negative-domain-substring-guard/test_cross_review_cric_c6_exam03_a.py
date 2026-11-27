"""Independent protected-exam regressions; no candidate-authoring imports."""
import ast,base64,copy,hashlib,importlib,inspect,json,shutil,subprocess,tempfile,unittest
from pathlib import Path
from unittest import mock
from fractions import Fraction
import sympy as s
from hypothesis import given,settings,strategies as st,assume
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c6_exam03_review_common_a as c
m=importlib.import_module('tools.corpus_engineering.cric_c6_protected_exam_03_verifier')
APP=Path(__file__).resolve().parents[2];D=APP/'editorial/reviews/cric-c6-exam03-independent-proof-a-20261127';F=D/'fixtures';ASSETS=F/'assets';BATCH='cric-c6-protected-exam-03'
def packet():return json.loads((F/(BATCH+'.json')).read_text()),json.loads((F/(BATCH+'-bindings.json')).read_text())
def rebound(p,b):
    by={x['id']:x for x in b};pins={}
    for row in p['records']:
        x=by[row['id']];x['candidateSha256']=digest(row);pins[row['id']]=digest({'record':row,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class SeparateC6Exam03(unittest.TestCase):
    stats={'packetWrongKeys':0,'metadata':0,'unitTolerance':0,'mathFaults':0,'finiteExact':0,'domainBackslides':0,'accessibleAssets':0,'hypothesis':0,'equivalentDuplicates':0}
    def test_01_fresh_saved_identity_original_versions_and_git(self):
        p,b=packet();fresh=m.report(p,b,ASSETS);saved=json.loads((APP/f'editorial/reviews/{BATCH}.json').read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
        assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(p['records']),31);self.assertEqual(len({r['family']for r in p['records']}),31)
        source={r['id']:r for r in json.loads((APP/'editorial/reviews/cric-c6-exam03-source-reading-a-20261127/C6-original-verbatim.json').read_text())}
        for row in p['records']:
            old=source[row['id']]
            for key in ['id','section','exam','family','difficulty','course','skill','prerequisites','order']:self.assertEqual(row.get(key),old.get(key))
            self.assertEqual(row['version'],old['version']+1);self.assertEqual(row['baseVersion'],old['version']);self.assertIs(type(row['exam']),int);self.assertEqual(row['exam'],3)
        self.assertEqual(subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+BATCH+'.json'],cwd=APP),(F/(BATCH+'.json')).read_bytes())
        for folder in [D,APP/'editorial/reviews/cric-c6-exam03-source-reading-a-20261127']:
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
            for field,value in [('section','Collapsed exam cohort'),('exam',None),('exam',True),('exam',False),('exam',3.0)]:
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
        p,b=packet();faults=[('conduction',lambda k,a,t,l:k*a*t*l),('millilitres_to_cubic_metres',lambda x:x/1000),('capacitance_geometry_ratio',lambda a,d:a*d),('manometer_gas_excess',lambda rho,g,h:rho*g/h),('double_reflected_direction',lambda x,y:s.Matrix([x,y])),('centre_of_mass',lambda a,b,x,y:(x+y)/2),('series_capacitor_charge',lambda a,b,v:(a+b)*v),('emerged_percent',lambda a,b:100*a/b),('second_apparent_weight',lambda a,f,b:f),('condensation_energy',lambda m,L:m/L),('droplet_jump_ratio',lambda a,b:b/a),('double_transmitted_percent',lambda t:100*(2*t-1)),('actual_static_friction',lambda p,l:l),('average_emf',lambda n,f,t:abs(f)/t),('work',lambda f,d,c:f*d*abs(c)),('balanced_bridge',lambda v,r,b:(1,{'m':v,'n':0}))]
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not row['ok']for row in rows),name);self.assertTrue(any('constitutive oracle'in e for e in rows[0]['errors']));self.stats['mathFaults']+=1
    def test_06_finite_real_exact_before_all_casts(self):
        cases=[(c.model.conduction,[2,3,4,5]),(c.model.conduction_ratio,[2,3,4,5,2]),(c.model.millilitres_to_cubic_metres,[250]),(c.model.capacitance_geometry_ratio,[3,2]),(c.model.manometer_gas_excess,[800,10,s.Rational(1,20)]),(c.model.double_reflected_direction,[3,-4]),(c.model.centre_of_mass,[1,3,0,40]),(c.model.series_capacitor_charge,[3,6,12]),(c.model.emerged_percent,[750,1000]),(c.model.second_apparent_weight,[4,48,6]),(c.model.condensation_energy,[s.Rational(1,250),2000000]),(c.model.droplet_jump_ratio,[3,1]),(c.model.double_transmitted_percent,[s.Rational(7,10)]),(c.model.actual_static_friction,[3,7]),(c.model.average_emf,[20,s.Rational(3,1000),s.Rational(1,10)]),(c.model.work,[10,2,-s.Rational(1,2)]),(c.model.balanced_bridge,[8,4,2])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in [True,False,0.25,s.Float('0.25'),s.I,s.oo,-s.oo,s.nan,'2',s.Symbol('x',positive=True),1+2j]:
                    values=args.copy();values[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*values)
                    self.stats['finiteExact']+=1
        for fn,args in [(c.model.conduction_ratio,[1,1,0,1,2]),(c.model.emerged_percent,[1000,1000]),(c.model.double_transmitted_percent,[2]),(c.model.actual_static_friction,[8,7]),(c.model.average_emf,[s.Rational(3,2),1,1]),(c.model.work,[1,1,2]),(c.model.balanced_bridge,[8,0,2]),(c.model.double_reflected_direction,[0,0])]:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.work(10,2,-s.Rational(1,2)),-10);self.assertEqual(c.model.average_emf(20,-s.Rational(3,1000),s.Rational(1,10)),s.Rational(3,5));self.assertEqual(c.model.conduction(1,1,-2,1),-2)
    def test_07_domain_backslides_rebound(self):
        op,ob=packet();cases=[(75,'differenza positiva','differenza qualunque'),(77,'positive','qualunque'),(79,'Rimane nel piano della sezione','Può uscire dal piano della sezione'),(80,'massa trascurabile','massa significativa'),(81,'L’unico lavoro','Un lavoro'),(82,'neutro e isolato','carico e connesso'),(83,'Agiscono solo peso e spinta','Agiscono altre forze oltre a peso e spinta'),(84,'partono insieme','partono in tempi diversi'),(87,'non relativistico','relativistico'),(88,'singola interfaccia','doppia interfaccia'),(89,'iniziale positiva','iniziale qualunque'),(94,'Si assume','Non si assume'),(101,'k>0','k qualunque')]
        for n,old,new in cases:
            i=next(i for i,r in enumerate(op['records'])if r['id']==f'C6-Q{n:03}');p,b=copy.deepcopy(op),copy.deepcopy(ob);self.assertIn(old,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(old,new)
            with rebound(p,b):row=m.verify(p,b,ASSETS)[i]
            self.assertFalse(row['ok']);self.assertTrue(any('domain not explicit'in e for e in row['errors']));self.stats['domainBackslides']+=1
    def test_08_exact_lexemes_phases_and_si_equivalence(self):
        for raw,want,dim in [('1/4000 m³',s.Rational(1,4000),'volume'),('250 cm³',s.Rational(1,4000),'volume'),('0,60 V',s.Rational(3,5),'voltage'),('600 mV',s.Rational(3,5),'voltage'),('49%',s.Rational(49,100),'pure'),('24 μC',s.Rational(24,10**6),'charge'),('180°',s.pi,'angle')]:
            got,d=c.quantity(raw);self.assertEqual(s.simplify(got-want),0);self.assertEqual(d,dim)
        for raw in ['__import__("os")','True','nan','oo','1/0','1e999','[1]','10**999']:
            with self.assertRaises((ValueError,TypeError,SyntaxError)):c.quantity(raw)
        op,ob=packet()
        for n,alias in [(76,'250 cm³'),(77,'1,5'),(88,'3,0'),(91,'600 mV')]:
            i=next(i for i,r in enumerate(op['records'])if r['id']==f'C6-Q{n:03}');p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer']['options'][1]=alias
            with rebound(p,b):row=m.verify(p,b,ASSETS)[i]
            self.assertFalse(row['ok']);self.assertTrue(any('alternatives not unique'in e for e in row['errors']));self.stats['equivalentDuplicates']+=1
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
        D=APP/'editorial/reviews/cric-c6-exam03-asset-review-a-20261127';report=json.loads((D/BATCH/'actual-render.json').read_text());self.assertEqual((report['pngWidth'],report['pngHeight']),(640,1960));self.assertEqual(report['clipping'],[]);self.assertIn('CHILD_EXIT 0',(D/'actual-terminal.txt').read_text());self.assertEqual(report['sourceSvgSha256'],hashlib.sha256((ASSETS/(BATCH+'-progressive.svg')).read_bytes()).hexdigest())
        import xml.etree.ElementTree as ET
        root=ET.parse(ASSETS/(BATCH+'-progressive.svg')).getroot();rects=[r for r in root.iter()if r.tag.endswith('rect')];first=next(r for r in rects if r.attrib.get('y')=='185');second=next(r for r in rects if r.attrib.get('y')=='408');self.assertEqual(int(second.attrib['width']),2*int(first.attrib['width']));self.assertEqual(first.attrib['height'],second.attrib['height']);current,potentials=c.model.balanced_bridge(8,4,2);self.assertEqual(current,0);self.assertEqual(set(potentials.values()),{4});self.assertEqual(c.model.series_capacitor_charge(3,6,12)/3,8);self.assertEqual(c.model.series_capacitor_charge(3,6,12)/6,4)
    def test_12_pint_and_symbolic_source_models(self):
        self.assertEqual(len(c.model.pint_checks()),9);self.assertTrue(all(c.model.symbolic_checks().values()));self.assertEqual(len(c.physical_oracle()),15)
    def test_13_default_deny_reading_and_dependencies(self):
        p,b=packet()
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c6_exam03_prompt_only_models_a.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_14_hyp_conduction(self,k,a,t,l):self.assertEqual(c.model.conduction_ratio(k,a,t,l,2),s.Rational(1,2));self.stats['hypothesis']+=1
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(-100,100),st.integers(-100,100))
    def test_15_hyp_reflections(self,x,y):
        assume(x*x+y*y>0)
        self.assertEqual(c.model.double_reflected_direction(x,y),s.Matrix([-x,-y]));self.assertEqual(c.model.double_reflected_direction(*c.model.double_reflected_direction(x,y)),s.Matrix([x,y]));self.stats['hypothesis']+=1
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_16_hyp_balanced_bridge(self,v,r,b):
        current,potentials=c.model.balanced_bridge(v,r,b);self.assertEqual(current,0);self.assertEqual(set(potentials.values()),{s.Rational(v,2)});self.stats['hypothesis']+=1
    def test_17_percent_unit_backslide_after_full_rebinding(self):
        op,ob=packet();i=next(i for i,r in enumerate(op['records'])if r['id']=='C6-Q089');self.assertEqual(op['records'][i]['answer']['unit'],'%')
        p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][i]['answer']['unit']='1'
        with rebound(p,b):row=m.verify(p,b,ASSETS)[i]
        self.assertFalse(row['ok']);self.assertTrue(any('unit or tolerance'in e for e in row['errors']))
