from pathlib import Path
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');old=(A/'tests/corpus/test_cross_review_nuclei_optics_255_259.py').read_text();prefix=old[:old.index('from fractions import Fraction\nfrom hypothesis')];prefix=prefix.replace("FAMILIES=[('beta_minus_atomic_number','beta-minus-atomic-number-255'),('gamma_transition_energy','gamma-transition-energy-256'),('snell_refracted_sine','snell-refracted-sine-257'),('critical_angle_sine','critical-angle-sine-258'),('thin_lens_real_image','thin-lens-real-image-259')]","FAMILIES=[('plane_mirror_ray_direction','plane-mirror-ray-direction-261'),('projected_image_height','projected-image-height-262')]").replace('u7-nuclei-optics-255-259','u7-reflection-image-height-261-262').replace('Reproducible independent U7 nuclei and optics audits','Reproducible independent U7 reflection and image-height audits').replace('Un gamma aumenta sempre Z e un beta meno emette quattro nucleoni. Gli angoli di Snell si misurano dalla superficie e ogni lente forma immagini reali anche con p minore di f.','La direzione del riflesso coincide sempre con quella incidente rispetto a ogni asse; ruotare lo specchio non cambia il raggio. Il modulo di una altezza reale è sempre negativo e millimetri e centimetri hanno identico valore numerico.')
common=old[old.index('from fractions import Fraction\nfrom hypothesis'):old.index('    @settings')];common=common.replace('class CrossReviewNucleiOptics255259','class CrossReviewReflectionImageHeight261262').replace('test_fresh_saved_eighty_identity','test_fresh_saved_thirty_two_identity').replace('nuclei_optics_review_models.py','reflection_image_height_review_models.py').replace('test_135_retokenized_packet_mutations','test_54_retokenized_packet_mutations')
start=common.index('    def test_source_primary_valid_prekey_model_and_git_fixtures');end=common.index('    def test_actual_catalog',start)
common=common[:start]+'''    def test_blind_primary_model_history_specific_exposure_and_git_fixtures(self):
        first=module(FAMILIES[0][0]);raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO);self.assertEqual(hashlib.sha256(raw).hexdigest(),model().SOURCE_SHA256);sources={r['id']:r for r in json.loads(raw)}
        primary=APP/'editorial/reviews/primary-reflection-image-height-261-262-before-candidates-20261126.md';self.assertEqual(hashlib.sha256(primary.read_bytes()).hexdigest(),first.PRIMARY_SHA256);self.assertEqual(primary.read_text().count('### Derivazione indipendente'),32)
        D=APP/'editorial/reviews/u7-reflection-image-height-261-262-primary-models-20261126';receipt=json.loads((D/'model-execution-before-candidate-files.json').read_text());self.assertEqual(receipt['sourceOnlyDerivationsExecuted'],32);self.assertEqual(receipt['observedChildExit'],0);self.assertTrue(receipt['primaryFullyBlindBeforeAnyExposure']);self.assertTrue(receipt['modelWrittenBeforeIncidentalExposure']);self.assertFalse(receipt['modelGitFrozenBeforeIncidentalExposure']);self.assertTrue(receipt['modelExecutionAfterIncidentalExposure']);self.assertEqual(receipt['incidentalExposure']['fragment'],'beta60');self.assertFalse(receipt['incidentalExposure']['mathematicalModelModifiedFromFragment'])
        before=subprocess.check_output(['git','show','bbda8bd4:officina-di-fisica/tools/corpus_engineering/reflection_image_height_review_models.py'],cwd=REPO);self.assertEqual(hashlib.sha256(before).hexdigest(),receipt['modelSha256']);self.assertEqual(before,Path(model().__file__).read_bytes());self.assertEqual(before,(D/'model-written-before-incidental-argv-exposure.py.txt').read_bytes());self.assertEqual(hashlib.sha256((D/'actual-model-execution-output.txt').read_bytes()).hexdigest(),receipt['outputSha256'])
        for name,batch in FAMILIES:
            m=module(name);self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            for suffix in['.json','-bindings.json']:
                raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+suffix],cwd=REPO);self.assertEqual(raw,(FIXTURES/(batch+suffix)).read_bytes())

''' + common[end:]
rest=r'''
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
'''
(A/'tests/corpus/test_cross_review_reflection_image_height_261_262.py').write_text((prefix+common+rest).rstrip()+'\n')
