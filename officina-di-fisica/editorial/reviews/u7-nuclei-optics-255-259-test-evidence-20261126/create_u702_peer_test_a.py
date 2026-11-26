from pathlib import Path
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');old=(A/'tests/corpus/test_cross_review_radiation_attenuation_245_249.py').read_text();prefix=old[:old.index('from fractions import Fraction\nfrom hypothesis')]
prefix=prefix.replace("FAMILIES=[('photon_packet_wavelength','photon-packet-wavelength-245'),('beer_transmitted_intensity','beer-transmitted-intensity-246'),('optical_depth','optical-depth-247'),('two_layer_transmission','two-layer-transmission-248'),('infer_attenuation_coefficient','infer-attenuation-coefficient-249')]","FAMILIES=[('beta_minus_atomic_number','beta-minus-atomic-number-255'),('gamma_transition_energy','gamma-transition-energy-256'),('snell_refracted_sine','snell-refracted-sine-257'),('critical_angle_sine','critical-angle-sine-258'),('thin_lens_real_image','thin-lens-real-image-259')]").replace('u7-photons-attenuation-245-249','u7-nuclei-optics-255-259').replace('Reproducible independent U7 radiation audits','Reproducible independent U7 nuclei and optics audits').replace('Ogni fotone trasmesso perde continuamente metà della sua energia. Le intensità trasmesse da strati in successione vanno sommate e un esponente può avere unità di lunghezza.','Un gamma aumenta sempre Z e un beta meno emette quattro nucleoni. Gli angoli di Snell si misurano dalla superficie e ogni lente forma immagini reali anche con p minore di f.')

_unit_start=prefix.index("    row=next(r for r in changed['records'] if r['answer']['type']=='numeric')")
_unit_end=prefix.index("    changed,links=deepcopy(package),deepcopy(bindings)\n    row=changed['records'][0];row['course']",_unit_start)
prefix=prefix[:_unit_start]+"    row=next((r for r in changed['records'] if r['answer']['type']=='numeric'),None)\n    if row is not None:\n        before_unit=row['answer']['unit'];row['answer']['unit']='K' if before_unit=='J' else 'J'\n        if row['answer']['unit']==before_unit:raise AssertionError('Unit mutation must actually change dimension')\n        required='numeric unit mismatch'\n    else:\n        # The Snell batch has only choices. Attach an energy unit to its pure sine\n        # while retaining the exact correct number and the five-option structure.\n        row=changed['records'][0];answer=row['answer'];correct=answer['value'];index=answer['options'].index(correct)\n        answer['value']=correct+' J';answer['options'][index]=answer['value'];required='answer or unit invalid'\n    rebind(row,links)\n    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])\n    errors=[e for e in result['errors'] if required in e]\n    if result['ok'] or not errors:raise AssertionError('Wrong physical unit escaped independent oracle')\n    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})\n"+prefix[_unit_end:]
rest=r'''
from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET
import hashlib,struct,inspect,ast,re

def module(name):return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

def model():return module(FAMILIES[0][0]).model

class CrossReviewNucleiOptics255259(unittest.TestCase):
    def test_fresh_saved_eighty_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b,reviewed_assets(m));saved=json.loads((APP/f'editorial/reviews/{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            for r in fresh['records']:
                self.assertIn(r['verificationMode'],['EXACT_ORACLE','AI_CONCEPTUAL']);self.assertTrue(r['manualArithmetic']and r['physicalAssumptions']and r['distractors'])
                self.assertEqual(r['reviewDependencySha256']['electric_exact_literals.py'],m.REVIEWED_LITERAL_CODEC_SHA256)
                self.assertEqual(r['reviewDependencySha256']['nuclei_optics_review_models.py'],m.REVIEWED_MODEL_SHA256)

    def test_source_primary_valid_prekey_model_and_git_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO);self.assertEqual(hashlib.sha256(raw).hexdigest(),model().SOURCE_SHA256);sources={r['id']:r for r in json.loads(raw)}
        primary=APP/'editorial/reviews/primary-nuclei-optics-255-259-before-candidates-20261126.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),80)
        D=APP/'editorial/reviews/u7-nuclei-optics-255-259-source-only-models-20261126';receipt=json.loads((D/'model-execution-before-keys.json').read_text());self.assertEqual(receipt['sourceOnlyCasesExecuted'],80);self.assertEqual(receipt['actualSuccessfulExecution']['childExit'],0);self.assertEqual(receipt['candidateExposureAtFreeze'],'NONE');self.assertEqual(receipt['firstActualExecution']['childExit'],1);self.assertEqual(receipt['supersedesInvalidPositiveReceiptCommit'],'5c3af5ea')
        before=subprocess.check_output(['git','show','a114caa9:officina-di-fisica/tools/corpus_engineering/nuclei_optics_review_models.py'],cwd=REPO);self.assertEqual(hashlib.sha256(before).hexdigest(),receipt['modelSha256']);self.assertEqual(before,Path(model().__file__).read_bytes())
        for file,key in [('actual-successful-rerun-output.txt','actualSuccessfulExecution'),('actual-old-model-negative-reproduction.txt','sameOldBytesActualNegativeReproduction')]:self.assertEqual(hashlib.sha256((D/file).read_bytes()).hexdigest(),receipt[key]['outputFileSha256'])
        invalid=json.loads((D/'premature-invalid-positive-receipt.json').read_text());self.assertNotEqual(hashlib.sha256((D/'failed-initial-model.py.txt').read_bytes()).hexdigest(),first.REVIEWED_MODEL_SHA256)
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

    def test_135_retokenized_packet_mutations(self):
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);self.assertEqual(audit(m,p,b)['passed'],27)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,30),st.integers(1,8))
    def test_beta_integer_inverse_and_scaling(self,z,n,k):
        PROPERTY_COUNTS['beta']=PROPERTY_COUNTS.get('beta',0)+1;m=model();z,n,k=map(sp.Integer,(z,n,k));out=m.beta_final(z,n)
        self.assertEqual(m.beta_initial(out,n),z);self.assertEqual(m.beta_events(out,z),n);self.assertEqual(m.beta_final(k*z,k*n),k*out)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,8))
    def test_gamma_inverse_and_zero_shift(self,base,gap,k):
        PROPERTY_COUNTS['gamma']=PROPERTY_COUNTS.get('gamma',0)+1;m=model();base,gap,k=map(sp.Integer,(base,gap,k));out=m.gamma_energy(base+gap,base)
        self.assertEqual(out,gap);self.assertEqual(m.gamma_initial(out,base),base+gap);self.assertEqual(m.gamma_final(out,base+gap),base);self.assertEqual(m.gamma_energy(k*(base+gap),k*base),k*gap);self.assertEqual(m.gamma_energy(base+gap+5,base+5),out)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,40),st.integers(1,8),st.integers(1,8))
    def test_snell_inverse_and_parallel_faces(self,j,n,k):
        PROPERTY_COUNTS['snell']=PROPERTY_COUNTS.get('snell',0)+1;m=model();si=sp.Rational(j,41);n,k=map(sp.Integer,(n,k));sr=m.refracted_sine(si,n)
        self.assertEqual(m.incident_sine(sr,n),si);self.assertEqual(m.index_from_sines(si,sr),n);self.assertEqual(m.parallel_plate_output(si,n),si);self.assertEqual(m.refracted_sine(si,k*n),sr/k)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,50),st.integers(1,8))
    def test_critical_inverse_common_rescaling(self,ne,gap,k):
        PROPERTY_COUNTS['critical']=PROPERTY_COUNTS.get('critical',0)+1;m=model();ne,gap,k=map(sp.Integer,(ne,gap,k));ni=ne+gap;s=m.critical_sine(ne,ni)
        self.assertEqual(m.external_index(s,ni),ne);self.assertEqual(m.internal_index(s,ne),ni);self.assertEqual(m.critical_sine(k*ne,k*ni),s)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,20),st.integers(1,50),st.integers(1,8))
    def test_lens_inverse_scale_and_virtual(self,f,gap,k):
        PROPERTY_COUNTS['lens']=PROPERTY_COUNTS.get('lens',0)+1;m=model();f,gap,k=map(sp.Integer,(f,gap,k));p=f+gap;q=m.real_image(f,p)
        self.assertEqual(m.focal_length(p,q),f);self.assertEqual(m.object_distance(f,q),p);self.assertEqual(m.real_image(k*f,k*p),k*q);self.assertEqual(m.signed_image(f,f/2),-f);self.assertEqual(-m.signed_image(f,f/2)/(f/2),2)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-50,50))
    def test_affine_calibration_signed_offset(self,g,b):
        PROPERTY_COUNTS['calibration']=PROPERTY_COUNTS.get('calibration',0)+1;self.assertEqual(model().calibrate(2,5,2*g+b,5*g+b),(g,b))

    def test_finite_exact_guards_before_cast_all_positions(self):
        m=model();goods={'beta_final':(20,1),'beta_initial':(21,1),'beta_events':(21,20),'gamma_energy':(100,20),'gamma_initial':(80,20),'gamma_final':(80,100),'refracted_sine':(sp.Rational(1,2),2),'incident_sine':(sp.Rational(1,4),2),'index_from_sines':(sp.Rational(1,2),sp.Rational(1,4)),'parallel_plate_output':(sp.Rational(3,5),sp.Rational(3,2)),'critical_sine':(1,2),'external_index':(sp.Rational(1,2),2),'internal_index':(sp.Rational(1,2),1),'real_image':(1,4),'focal_length':(4,sp.Rational(4,3)),'object_distance':(1,sp.Rational(4,3)),'signed_image':(2,1)};count=0
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
        for bad in[sp.Rational(1,2),sp.sqrt(2),sp.pi]:
            for f in[m.beta_final,m.beta_initial,m.beta_events]:
                with self.assertRaises(ValueError):f(21,bad)
        for args in[(1,1,2,3),(1,2,2,2),(1,2,3,2)]:
            with self.assertRaises(ValueError):m.calibrate(*args)
        self.assertEqual(m.calibrate(1,2,-5,-3),(2,-7))

    def test_branch_domains_sines_discrete_counts_and_poles(self):
        m=model()
        for f,args in[(m.beta_initial,(1,1)),(m.beta_events,(20,21)),(m.gamma_energy,(20,100)),(m.gamma_energy,(20,20)),(m.gamma_final,(100,80)),(m.gamma_final,(80,80)),(m.refracted_sine,(sp.Rational(6,5),2)),(m.refracted_sine,(sp.Rational(1,2),sp.Rational(1,2))),(m.incident_sine,(sp.Rational(3,4),2)),(m.index_from_sines,(sp.Rational(1,4),sp.Rational(1,2))),(m.critical_sine,(2,1)),(m.critical_sine,(1,1)),(m.external_index,(1,2)),(m.internal_index,(1,2)),(m.real_image,(2,1)),(m.real_image,(1,1)),(m.object_distance,(2,1)),(m.object_distance,(1,1)),(m.signed_image,(1,1))]:
            with self.assertRaises(ValueError):f(*args)
        self.assertEqual(m.refracted_sine(1,4),sp.Rational(1,4));self.assertEqual(m.critical_sine(sp.Rational(1,2),1),sp.Rational(1,2))
        for n in[1,2,3,4]:self.assertEqual(m.refracted_sine(sp.Rational(n,4),n),sp.Rational(1,4))
        for ni in[1,2,3,sp.Rational(1,2)]:self.assertEqual(m.critical_sine(sp.Rational(ni,2),ni),sp.Rational(1,2))

    def test_constitutive_and_inverse_faults_are_mathematically_rejected(self):
        for name,direct,inverse in [('beta_minus_atomic_number','beta_final','beta_initial'),('gamma_transition_energy','gamma_energy','gamma_initial'),('snell_refracted_sine','refracted_sine','incident_sine'),('critical_angle_sine','critical_sine','internal_index'),('thin_lens_real_image','real_image','focal_length')]:
            v=module(name)
            for method in[direct,inverse]:
                v.oracle.cache_clear();f=getattr(v.model,method)
                with patch.object(v.model,method,side_effect=lambda *a,_f=f:_f(*a)+1):
                    with self.assertRaises((AssertionError,ValueError)):v.oracle()
                v.oracle.cache_clear();self.assertEqual(len(v.oracle()),16)
        AUX_COUNTS['constitutive_inverse_faults']=10

    def test_exact_means_special_cases_and_manual_comparisons(self):
        m=model();self.assertEqual((m.beta_final(20,1)+m.beta_final(24,2))/2,sp.Rational(47,2));self.assertEqual(m.gamma_energy(51,sp.Rational(21,2)),sp.Rational(81,2))
        self.assertEqual(sp.Rational(3,8)-m.refracted_sine(sp.Rational(5,8),sp.Rational(7,4)),sp.Rational(1,56));self.assertEqual(sp.Rational(3,5)-sp.Rational(7,12),sp.Rational(1,60));self.assertEqual(sp.Rational(13,6)-m.real_image(sp.Rational(3,2),5),sp.Rational(1,42));self.assertEqual(m.parallel_plate_output(sp.Rational(3,5),sp.Rational(3,2)),sp.Rational(3,5))
        self.assertEqual(sp.Rational(2,5)<sp.Rational(2,3),True);self.assertEqual(m.signed_image(2,1),-2)

    def test_exact_si_units_and_charge_balance(self):
        m=model();Q=m.SI.Quantity
        self.assertEqual(Q(80,'kiloelectron_volt').to('electron_volt').magnitude,80000);self.assertEqual((Q(1,'centimeter')*Q(4,'centimeter')/Q(3,'centimeter')).to('centimeter').magnitude,Fraction(4,3));self.assertEqual((Q(1)*Q(Fraction(1,2))/Q(2)).to('').magnitude,Fraction(1,4))
        self.assertEqual((Q(1,'joule')/Q(1,'hertz')).dimensionality,Q(1,'joule*second').dimensionality);self.assertEqual((Q(20,'elementary_charge')+Q(1,'elementary_charge')-Q(1,'elementary_charge')).to('elementary_charge').magnitude,20)

    def test_safe_exact_decoder_and_dependency_failclosed(self):
        m=module(FAMILIES[0][0]);self.assertEqual(m.exact_literal('0.1+0.2'),sp.Rational(3,10));self.assertEqual(m.exact_literal('1/2+1/4'),sp.Rational(3,4))
        for bad in['__import__("os")','x','1/0','[1]','1e3','True','nan','oo','1+'*60+'1']:
            with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
        for bad in[True,0.5,None,sp.oo]:
            with self.assertRaises(ValueError):m.numeric_lexeme(bad)
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch)
            for pin,error in[('REVIEWED_LITERAL_CODEC_SHA256','Independent exact literal codec dependency changed'),('REVIEWED_MODEL_SHA256','Independent physical model dependency changed')]:
                with patch.object(m,pin,'0'*64):
                    result=m.verify(p,b,reviewed_assets(m));self.assertTrue(all(not r['ok']for r in result));self.assertTrue(all(error in r['errors']for r in result))

    def test_native_complete_and_quantitative_geometry(self):
        ns={'s':'http://www.w3.org/2000/svg'};roots={};heights={255:1500,256:1500,257:1750,258:1610,259:1740};base=APP/'editorial/reviews/u7-nuclei-optics-255-259-asset-review-20261126'
        for name,batch in FAMILIES:
            m=module(name);D=base/batch;render=json.loads((D/'render.json').read_text());proc=json.loads((D/'process-result.json').read_text());self.assertEqual(proc['returncode'],0);self.assertEqual(render['assetSha256'],hashlib.sha256((FIXTURES/(m.FAMILY+'-progressive.svg')).read_bytes()).hexdigest());png=(D/'full-native.png').read_bytes();self.assertEqual(struct.unpack('>II',png[16:24]),(640,heights[int(batch[-3:])]))
            self.assertEqual((render['pngWidth'],render['pngHeight']),(640,heights[int(batch[-3:])]))
            root=ET.parse(FIXTURES/(m.FAMILY+'-progressive.svg')).getroot();roots[int(batch[-3:])]=root
            for t in render['textBounds']:self.assertGreaterEqual(t['x'],0);self.assertLessEqual(t['x']+t['width'],640);self.assertGreaterEqual(t['y'],0);self.assertLessEqual(t['y']+t['height'],heights[int(batch[-3:])])
            self.assertNotIn('px',' '.join(''.join(t.itertext())for t in root.findall('.//s:text',ns)))
        rects=lambda n:[Fraction(e.attrib['width'])for e in roots[n].findall('.//s:rect',ns)if e.attrib.get('height')=='30']
        for n,values in{255:[252,312,282],256:[320,4,162],257:[160,320,240],258:[240,320,280],259:[120,270,195]}.items():self.assertEqual(rects(n),values)
        self.assertEqual([sp.Rational(x,12)for x in rects(255)],[21,26,sp.Rational(47,2)]);self.assertEqual([sp.Rational(x,4)for x in rects(256)],[80,1,sp.Rational(81,2)]);self.assertEqual([sp.Rational(x,640)for x in rects(257)],[sp.Rational(1,4),sp.Rational(1,2),sp.Rational(3,8)]);self.assertEqual([sp.Rational(x,480)for x in rects(258)],[sp.Rational(1,2),sp.Rational(2,3),sp.Rational(7,12)]);self.assertEqual([sp.Rational(x,90)for x in rects(259)],[sp.Rational(4,3),3,sp.Rational(13,6)])
        # Rounded SVG coordinates checked with exact rational bounds derived from their displayed precision.
        paths=lambda n:[p.attrib['d']for p in roots[n].findall('.//s:path',ns)if 'marker-end'in p.attrib]
        first=paths(257);self.assertEqual(len(first),5)
        for text,expected in[(first[0],sp.Rational(1,4)),(first[1],sp.Rational(1,16)),(first[2],sp.Rational(9,25)),(first[3],sp.Rational(4,25)),(first[4],sp.Rational(9,25))]:
            coords=[sp.Rational(v)for v in re.findall(r'-?\d+(?:\.\d+)?',text)];x,y,xx,yy=coords;ratio=(xx-x)**2/((xx-x)**2+(yy-y)**2);self.assertLess(abs(ratio-expected),sp.Rational(1,10**12))
        critical=paths(258);self.assertEqual(len(critical),4);self.assertEqual(critical[1],'M320 330L550 330');self.assertEqual(critical[2:],["M200 950L320 830","M320 830L440 950"])
        self.assertEqual(sp.Rational(100,300),sp.Rational(24,72));self.assertEqual(sp.Rational(460-360,75),sp.Rational(4,3))
        curve=next(p.attrib['d']for p in roots[259].findall('.//s:path',ns)if p.attrib.get('stroke-width')=='3');xy=[sp.Rational(v)for v in re.findall(r'-?\d+(?:\.\d+)?',curve)]
        for x,y in zip(xy[::2],xy[1::2]):
            p=(x-150)/65;q=p/(p-1);self.assertGreater(p,1);self.assertLessEqual(abs(y-(1570-90*q)),sp.Rational(1,200000))
        self.assertIn('Altezze amplificate',' '.join(''.join(t.itertext())for t in roots[259].findall('.//s:text',ns)))

if __name__=='__main__':unittest.main()
'''
(A/'tests/corpus/test_cross_review_nuclei_optics_255_259.py').write_text((prefix+rest).rstrip()+'\n')
