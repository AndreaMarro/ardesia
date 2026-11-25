"""Independent original C4 source/math/installed-code review; never UI credit.

Primary bc79... was persisted before this reviewer opened the new C4.js or keys.
Prior thermal lesson/clock exposure is explicitly disclosed in the primary.
No authoring imports, candidate edits, source rewriting or human approval.
"""
from pathlib import Path
from fractions import Fraction as F
from functools import lru_cache
import hashlib,json,math,subprocess

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE='officina-di-fisica/content/esperienze-C4.json'
SOURCE_SHA='b56b6df61c44009e1508cf0e2cb7992b936db985e37f8c21fc9afd51b811e58d'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PRIMARY='editorial/reviews/C4-29-source-only-primary-20261125.json'
PRIMARY_SHA='bc79ade1d508af29ae85d2660eedef00826100270d1d8a86e6a1277226697740'
PROTOCOL='tests/corpus/collect-C4-bounded-code-only.mjs'
WRAPPER='tools/corpus_engineering/collect_C4_code_partial.py'
MESH_PROOF='editorial/reviews/C4-29-code-partial-20261125/mesh-halfspace-negatives.json'
MESH_PROTOCOL='tests/corpus/check-C4-contained-geometry.mjs'
MESH_SHA='dc45af7cc6acfaa0bea6d79f3371f96bf2e91e5969f871949ffad4fc4c685156'
PROOFS={'electrostatics': 'e00bba28efeb935b147c9e8a4220979179ceb2a93aa840bf2385435348c55516', 'materials-current': '1b184b4a18a2bf3dfc7ef425f8aaa45ce67048e93c60f3c76f238e12f7170824', 'capacitors': '0243eaccba60d26f4f17c7ca98262be0b1d6d9e52825388952372c5bbf3dc30e', 'magnetism': '73d300a7cf22d0821255d9bbfce2c86e85b0898abcba8619d1f0b2bc8805d76a'}
DATA={
'L01-01':(0,8,1,2,6,4,'1',2),'L01-02':(1,6,'.5',2,3,4,'µN',0),
'L02-01':(1,8,'.5',2,3,5,'kN/C',0),'L02-02':(-3,3,'.5',-1,1,0,'kN/C',0),
'L02-03':(0,4,'.25',1,3,2,'mm',2),'L03-01':(-2,3,'.5',-1,2,'.5','µJ',2),
'L03-02':(-4,4,'.5',-2,3,0,'V',0),'L03-03':(0,8,'.5',2,5,4,'µJ',2),
'L04-01':(0,10,1,2,8,5,'kV/m',1),'L04-02':(0,12,1,3,9,6,'kV/m',2),
'L05-01':('.5',5,'.5',1,4,3,'C',2),'L05-02':(2,12,1,3,6,8,'A',0),
'L05-03':(-8,8,1,-4,8,0,'A',2),'L05-04':('.5',4,'.5',1,2,3,'A',0),
'L05-05':('.1',1,'.1','.2','.8','.6','Ω',2),'L06-01':(2,12,1,4,12,7,'Ω',2),
'L06-02':(0,4,'.25',1,3,2,'W',2),'L07-01':(1,8,'.5',2,4,5,'pF',0),
'L07-02':(1,7,1,2,5,4,'nC',2),'L07-03':(0,8,'.5',2,5,4,'µJ',2),
'L08-01':(1,8,1,2,6,5,'µF',2),'L08-02':(0,12,1,3,9,6,'V',2),
'L09-01':(-6,6,'.5',-2,5,0,'µT',2),'L09-02':(0,180,5,30,90,95,'µN',2),
'L09-03':('.5',4,'.25',1,3,'2.25','cm',0),'L10-01':(0,180,5,0,120,90,'mWb',0),
'L10-02':(-4,4,'.5',-2,3,0,'V',0),'L10-03':('.25',4,'.25','.5',2,'2.5','V',2),
'L10-04':(-6,6,1,-4,6,0,'A',0)}
GROUPS={'electrostatics':list(DATA)[:8],'materials-current':list(DATA)[8:15],
        'capacitors':list(DATA)[15:22],'magnetism':list(DATA)[22:]}
INPUTS={'L01-01':('6','4'),'L01-02':('10','5.625'),'L02-01':('10','3.6'),
'L02-02':('0','22.5'),'L02-03':('4.5','2'),'L03-01':('4.5','1.8'),
'L03-02':('-6','0'),'L03-03':('15','12'),'L04-01':('0','0'),'L04-02':('3','2'),
'L05-01':('8','6'),'L05-02':('2','1.5'),'L05-03':('2','0'),'L05-04':('1','.6667'),
'L05-05':('1.6','1.2'),'L06-01':('3','2.545'),'L06-02':('27','12'),'L07-01':('22.135','17.708'),
'L07-02':('10','8'),'L07-03':('25','16'),'L08-01':('1.5','1.429'),'L08-02':('3','2'),
'L09-01':('20','0'),'L09-02':('6','6'),'L09-03':('4','5.333'),'L10-01':('-3','0'),
'L10-02':('-1.5','0'),'L10-03':('-1','-.8'),'L10-04':('-3','0')}
MANUAL={
'L01-01':'RemovingNnegativeelectrons leaves+N elementarycharges onA:6;4, donor/receiver sum0.',
'L01-02':'k(10^-9C)^2/(.01r)^2=90/r²µN;90/9=10;90/16=5.625.',
'L02-01':'E=kq/r²=90/r_cm²kN/C;90/9=10;90/25=3.6.',
'L02-02':'Rightwardleftsource22.5, rightsourcecontribution−22.5q;22.5(1−1)=0;22.5(1−0)=22.5.',
'L02-03':'1000m/s²*(t_ms/1000)^2/2*1000mm/m=t_ms²/2:9/2=4.5;4/2=2mm.',
'L03-01':'Threepairs:.9(1+2q3)µJ; .9(1+4)=4.5; .9(1+1)=1.8.',
'L03-02':'ΔV=−200*.01x=−2x:−6V;0V.',
'L03-03':'ΔK=3µC*potentialdrop:3*5=15;3*4=12µJ.',
'L04-01':'Electrostaticbulkfield exactly0 for8 or5kV/m applied;inducedfield opposite, not resistorwithcurrent.',
'L04-02':'Fixedfreecharge permits E0/εr:9/3=3;6/3=2kV/m; wouldnotapply atfixedplateV.',
'L05-01':'2A*4s=8C;2A*3s=6C. Electronsdrift oppositeconventionalcurrent.',
'L05-02':'12/6=2A;12/8=1.5A.',
'L05-03':'8/4=2A;0/4=0; signreversal physicallyretained.',
'L05-04':'R=2LΩ,I=4/R=2/L:2/2=1;2/3=.6666..., literal.6667A.',
'L05-05':'ρmicroOhmm*1e−6*2m/(1e−6m²)=2ρΩ:1.6;1.2.',
'L06-01':'Parallelreciprocals:4*12/16=3;4*7/11=28/11, longdivision2.54545...enter2.545Ω.',
'L06-02':'P=3I²:3*9=27;3*4=12W.',
'L07-01':'Assignedworkingε0=8.854e−12F/m givesC=88.54/d_mm pF:88.54/4=22.135;88.54/5=17.708.',
'L07-02':'Batteryconnected2V,C=εr*1nF givesQ2εr nC:10;8.',
'L07-03':'IntegralVdq yieldshalfCV², half*2µF=1µF:25;16µJ.',
'L08-01':'Cseries=2C2/(2+C2):12/8=1.5;10/7=1.428571...enter1.429µF.',
'L08-02':'TotalQconserved,Ctotal3µF;9/3=3;6/3=2V. Energyredistribution isnotlossless.',
'L09-01':'Longwireμ0I/(2π*.05m)≈4IµT,workingμ0≈4π1e−7:20;0.',
'L09-02':'First6sin90=6µN. Actualtransfer95° gives6cos5°≈5.977168. Numberrejectssinexpression. Literal6 iswithin.5% but requiresjustifyingapproximation: θ=π/36<11/126,cosθ≥1−θ²/2>.99618; hence5.977<6cos5≤6. This reviewer-provided identity/bound isABSENTfromsource; originalmanualreadinessFAIL, notcuredbygraderacceptance.',
'L09-03':'r=.12/B m=12/Bcm:12/3=4;12/(9/4)=16/3, longdivision5.333...',
'L10-01':'BA=.006Wb=6mWb:cos120=−1/2 gives−3;cos90=0. Exactquadrature expected0, not floatingresidual.',
'L10-02':'−10*.05*dB/dt=−.5rate:−1.5;0V; Nnotmultipliedtwice.',
'L10-03':'ConcatenatedΔflux2Wb includesN:−2/2=−1;−2/2.5=−.8V, meanorlinearinstantaneous.',
'L10-04':'FaradayplusOhm I=−fluxrate/2:−6/2=−3;0A. Opposeschange notfielditself.'}
ASSUMPTIONS={
'L01':'Closed integer-electrontransfer; chargeconservation, workingk≈9e9, pointchargesseparationcenter-to-center notsurface.',
'L02':'Fixedpositivesource+1nC; signedvectorsuperposition; uniformlyacceleratedpositivecharge releasedfromrest, otherforcesneglected. Controltimeinmilliseconds.',
'L03':'Electrostaticpairenergy count3pairs once, zeroatinfinity, constantuniformE, finalminusinitialV, positivepotentialdropforpositivecharge; onlyelectricfieldwork.',
'L04':'Equilibriumbulkconductor(nointernalcavitycharge/current); linearhomogeneousdielectricbetweenlargeplates withfreechargefixed, notvoltagefixed.',
'L05':'Steadyconventionalcurrent, idealvoltagesource, ohmicload/constanttemperature,uniformcrosssectionmaterial; SIρandA conversion factorscancel. Onlylegalslidergridstates.',
'L06':'Parallelshares2nodes, unpoweredohmmeter; seriesforcomparison, JoulePnonnegative; noinductivetransients.',
'L07':'Idealvacuumparallelplates neglectedgefields; workingε0explicit8.854e−12F/m; full dielectricslab/batteryconnectedfixedV; UhalfCV², notQV.',
'L08':'Seriesintermediatenodeneutral, isolated; paralleledcapacitors homologousterminals, totalchargeconserved, energycanbedissipated inchargeequalization.',
'L09':'Longstraightwire negligibleEarthfield, workingμ0approximate; right-handLorentzpositiveq, forceperpendicularv/B; transverseuniformB, vconstant, r=.12/B, elapsedclockq/m1C/kg andv.12m/s specified. Sourceversion2L09-03.',
'L10':'Orientednormalangle, ΦBAcosθ, Nturns/concatenatedfluxdistinguished, femsignedminusfluxderivative; loop2Ωselfinductionneglected. Timeclockfluxlinear, controlsnotreplaceinstanttime.'}

def sha(b):return hashlib.sha256(b).hexdigest()
def digest(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def rat(v):return F(str(v))
def close(v,w):return type(v) in (int,float) and math.isfinite(v) and math.isclose(v,float(w),rel_tol=1e-10,abs_tol=1e-9)
@lru_cache(maxsize=20000)
def exact(key,x):
    import sympy as S
    x=S.Rational(str(x))
    f={'L01-01':lambda:x,'L01-02':lambda:90/x**2,'L02-01':lambda:90/x**2,
       'L02-02':lambda:S.Rational(45,2)*(1-x),'L02-03':lambda:x**2/2,
       'L03-01':lambda:S.Rational(9,10)*(1+2*x),'L03-02':lambda:-2*x,'L03-03':lambda:3*x,
       'L04-01':lambda:S.Integer(0),'L04-02':lambda:x/3,'L05-01':lambda:2*x,'L05-02':lambda:12/x,
       'L05-03':lambda:x/4,'L05-04':lambda:2/x,'L05-05':lambda:2*x,'L06-01':lambda:4*x/(4+x),
       'L06-02':lambda:3*x**2,'L07-01':lambda:S.Rational(4427,50)/x,'L07-02':lambda:2*x,
       'L07-03':lambda:x**2,'L08-01':lambda:2*x/(2+x),'L08-02':lambda:x/3,
       'L09-01':lambda:4*x,'L09-02':lambda:6*S.sin(S.pi*x/180),'L09-03':lambda:12/x,
       'L10-01':lambda:6*S.cos(S.pi*x/180),'L10-02':lambda:-x/2,'L10-03':lambda:-2/x,'L10-04':lambda:-x/2}
    return f[key]()
DISCRETE={'L01-01'}
DRIVEN=set()
CLOCKS={'L02-03','L05-01','L09-03','L10-03'}
def clock(key,x,t):
    x,t=rat(x),float(t)
    if key=='L02-03':return 4,rat(t),None
    if key=='L05-01':return x,x,2*t
    if key=='L09-03':return 2*math.pi/float(x),x,12/float(x)*math.cos(float(x)*t)
    if key=='L10-03':return x,x,2*t/float(x)
    raise ValueError('UnknownC4clock')
def secondary(key,x,y,x0,unit):
    f={'L01-01':('Carica totale A + B',0,'e'),'L04-01':('Campo dovuto alle cariche indotte',-x,'kV/m'),
       'L05-04':('Resistenza del filo',2*x,'Ω'),'L06-01':('Equivalente in serie',4+x,'Ω'),
       'L07-03':('Carica sulle armature',2*x,'µC'),'L08-01':('Equivalente in parallelo',2+x,'µF'),
       'L08-02':('Carica finale sul secondo',2*x/3,'µC'),'L09-02':('Forza sul filo con Iℓ = 6 µA·m',y,'µN')}
    return f.get(key,('Variazione dal riferimento',y-exact(key,x0),'' if unit=='1' else unit))

def fmt(x,unit):
    x=rat(x)
    s=str(x.numerator) if x.denominator==1 else format(float(x),'.12g').replace('.',',')
    return s+(' '+unit if unit!='1' else '')

def geometry_observations(key,elements,x):
    obs=[]
    for a in elements:
        if a['kind']!='arrow':continue
        for e in elements:
            if e.get('alpha',1)!=1:continue
            tip=a['b'];detail=None
            if e['kind']=='ball' and math.dist(tip,e['p'])<e['r']-1e-9:
                detail={'code':'ARROW_TIP_INSIDE_OPAQUE_SPHERE','center':e['p'],'radius':e['r'],'tipDistance':math.dist(tip,e['p'])}
            elif e['kind']=='box' and all(abs(tip[i]-e['p'][i])<e['size'][i]/2-1e-9 for i in range(3)):
                detail={'code':'ARROW_TIP_INSIDE_OPAQUE_BOX','center':e['p'],'size':e['size']}
            elif e['kind']=='rod' and not e.get('openEnded',False):
                delta=[e['b'][i]-e['a'][i] for i in range(3)];norm2=sum(v*v for v in delta)
                if norm2>0:
                    h=sum((tip[i]-e['a'][i])*delta[i] for i in range(3))/norm2
                    distance2=sum((tip[i]-e['a'][i]-h*delta[i])**2 for i in range(3))
                    radius=e['r']+(e.get('r2',e['r'])-e['r'])*h
                    if 0<h<1 and distance2<radius*radius-1e-9:detail={'code':'ARROW_TIP_INSIDE_OPAQUE_CAPPED_ROD','bodyA':e['a'],'bodyB':e['b'],'radiusAtTip':radius,'radialDistance':math.sqrt(distance2)}
            if detail:obs.append(dict(detail,input=x,a=a['a'],tip=tip,limit='AllXYZstrictinterior; noentireconeclaim/UI/nativeRaster/fallbackRaster observed. Actualmeshplane supplementalcheckplanned.'))
    return obs

def compare(group,proof,sources):
    keys=GROUPS[group];rows=proof.get('records',[])
    ids=['SIM-C4-'+k for k in keys]
    if len(rows)!=len(ids) or {r.get('id') for r in rows}!=set(ids):raise ValueError('Missing/duplicate/foreignC4IDs')
    result=[]
    for row in rows:
        key=row['id'][7:];src=sources[row['id']];lo,hi,step,x0,x1,tr,unit,pred=DATA[key]
        lo,hi,step,x0,x1,tr=map(rat,(lo,hi,step,x0,x1,tr))
        errors=[];observations=[];count=int((hi-lo)/step)+1
        if row.get('sourceRecord')!=src or row.get('sourceVersion')!=(2 if key=='L09-03' else 1):errors.append('Source/versionidentitydrift')
        params=row.get('params',[])
        if len(params)!=1 or params[0].get('key')!='x' or params[0].get('label')!=src['control']['label'] or params[0].get('unit')!=('' if src['control']['unit']=='1' else src['control']['unit']) or any(not close(params[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Control/default/gridchanged')
        if row.get('prediction',{}).get('correct')!=pred or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction/distractorchanged')
        cl=row.get('clock')
        if key in CLOCKS and cl:
            expected={'L02-03':('ms',None,None,True),'L05-01':('s','Carica già passata','C',False),'L09-03':('s','Posizione lungo x','cm',False),'L10-03':('s','Variazione del flusso concatenato','Wb',False)}[key]
            if cl.get('clockUnit')!=expected[0] or cl.get('label')!=expected[1] or cl.get('unit')!=expected[2] or cl.get('input',False)!=expected[3]:errors.append('Clocklabels/units/modewrong')
        if bool(cl)!=(key in CLOCKS) or bool(cl and cl.get('finalReading')):errors.append('Clockmodechanged')
        cases=row.get('cases',[])
        if len(cases)!=count:errors.append('Incompletegrid')
        for i,c in enumerate(cases):
            x=lo+i*step;y=exact(key,x)
            if not close(c.get('x'),x) or not close(c.get('solve',{}).get('y'),y):errors.append('Installedscalarwrong')
            def check_readings(rr,t=0):
                label=src['measure']['label']+(' (a fine prova)' if key in DRIVEN else '')
                if len(rr)!=(4 if key in CLOCKS-{'L02-03'} else 3) or rr[0][0]!=src['control']['label'] or not close(rr[0][1],x) or rr[0][2]!=('' if src['control']['unit']=='1' else src['control']['unit']):errors.append('Inputreadingwrong')
                if rr[1][0]!=label or not close(rr[1][1],y) or rr[1][2]!=('' if unit=='1' else unit):errors.append('Outputreading/unitwrong')
                want=secondary(key,x,y,x0,unit)
                valueok=rr[2][1]==want[1] if isinstance(want[1],str) else close(rr[2][1],want[1])
                if rr[2][0]!=want[0] or not valueok or rr[2][2]!=want[2]:errors.append('Secondaryreadingwrong')
                if key in CLOCKS-{'L02-03'} and (not close(rr[-1][1],clock(key,x,t)[2]) or rr[-1][0]!=cl['label'] or rr[-1][2]!=cl['unit']):errors.append('Instantaneoussignalwrong')
            check_readings(c['readings'])
            if len(c.get('steps',[]))!=4:errors.append('Fourstagesmissing')
            gs=c.get('graphs',[]);dur=clock(key,x,0)[0] if key in CLOCKS else None
            if len(gs)!=1+int(key in CLOCKS-{'L02-03'} and dur>0):errors.append('Graphcountwrong')
            points=gs[0]['series'][0]['points']
            if len(points)!=(count if key in DISCRETE else 101) or any(not close(v,exact(key,u)) for u,v in points):errors.append('Controlgraphwrong')
            if gs[0]['x']!=src['control']['label']+(' ('+src['control']['unit']+')' if src['control']['unit']!='1' else ''):errors.append('Graphinputunitwrong')
            if gs[0]['y']!=src['measure']['label']+(' ('+unit+')' if unit!='1' else ''):errors.append('Graphunitwrong')
            samples=c.get('clockSamples',[])
            if key not in CLOCKS:
                if samples or c.get('duration') is not None:errors.append('Unexpectedclock')
            else:
                if len(samples)!=5 or not close(c.get('duration'),dur):errors.append('Clockcoveragewrong')
                for n,frame in enumerate(samples):
                    t=dur*F(n,4);_,u,sig=clock(key,x,t)
                    statex=u if key=='L02-03' else x
                    statey=exact(key,statex)
                    if not close(frame.get('time'),t) or not close(frame.get('input'),statex) or not close(frame.get('instantPhysicalInput'),u) or not close(frame.get('solve',{}).get('y'),statey) or (frame.get('signal') is not None if sig is None else not close(frame.get('signal'),sig)):errors.append('Clockframewrong')
                    if key=='L02-03':
                        savedx,savedy=x,y;x,y=statex,statey
                        check_readings(frame['readings'],t);x,y=savedx,savedy
                    else:check_readings(frame['readings'],t)
                    observations.extend(dict(o,clockTime=float(t),instantPhysicalInput=float(u)) for o in geometry_observations(key,frame['elements'],float(x)))
                if dur>0 and key!='L02-03':
                    points=gs[-1]['series'][0]['points']
                    if len(points)!=161 or any(not close(v,clock(key,x,t)[2]) for t,v in points):errors.append('Timegraphwrong')
            observations.extend(geometry_observations(key,c['elements'],float(x)))
        tasks=row.get('assessment',[]);taskresults=[]
        if len(tasks)!=2:errors.append('Twotasksmissing')
        for i,task in enumerate(tasks[:2]):
            x=(x1,tr)[i];v=exact(key,x);text=fmt(x,src['control']['unit'])
            prompt=src['transferPrompt'].replace('{x}',text) if i else 'Imposta «'+src['control']['label']+'» su '+text+'. Quale valore ottieni per «'+src['measure']['label']+'»?'
            literal=INPUTS[key][i];ans=rat(literal);tol=max(1e-6,abs(float(v))*.005)
            good=close(task.get('value'),v) and task.get('unit')==('numero puro' if unit=='1' else unit) and task.get('prompt')==prompt and abs(float(ans-v))<=tol
            if not good:errors.append('Actualtask/math/unit/prompt/manualinputwrong')
            taskresults.append({'prompt':task.get('prompt'),'input':str(x),'independentExact':str(v),'unit':unit,'manualNumericLiteral':literal,'literalAcceptedByNumericRule':abs(float(ans-v))<=tol,'actualValue':task.get('value'),'ok':good})
        af=row.get('assessmentFormat',[])
        if len(af)!=2 or any(not close(a.get('value'),t.get('value')) or type(a.get('parsed')) not in (float,int) or abs(a['parsed']-a['value'])>max(1e-6,abs(a['value'])*.005) for a,t in zip(af,tasks)):errors.append('Displayroundtripwrong')
        result.append({'id':row['id'],'sourceVersion':2 if key=='L09-03' else 1,'sourceSha256':digest(src),
            'sourceMathAndActualTasksOk':not errors,'errors':sorted(set(errors)),
            'gridCount':count,'clockSampleCount':sum(len(c['clockSamples']) for c in cases),
            'actualTasks':taskresults,'manualProcedure':MANUAL[key],
            'assumptionsAndDomain':ASSUMPTIONS[key[:3]],
            'consumerCodeGeometryOk':not observations,'geometryObservations':observations,
            'checkedGeometryScope':'AllcollectedarrowtipXYZvsopaqueboxes/spheres/cappedrods; materialalpha1 only. Notfullglyphs/meshfacets/camera/raster/labels/fallback. NoUIobserved.',
            'SourceScientificFailure':None if not errors else 'Seeexpliciterrors',
            'CodeGeometryFailure':[o['code'] for o in observations],
            'ManualityFailure':key=='L09-02' or any(not t['literalAcceptedByNumericRule'] for t in taskresults),
            'UI_Observed':False,
            'manualityScope':'Independentreviewerderivedhandprocedureforbothactualtasks;notastudentperformancecalibrationorclaimthesourcealreadyteachesallbounds.',
            'studentTaskScope':'Two actual generated numeric questions; predictiondistractors independently checked; bounds/extraoracles are reviewerprobes not assignedstudenttasks.',
            'sourceJudgment':'PASS_MATH_ONLY' if not errors else 'FAIL_MATH_OR_CODE',
            'consumerJudgment':'FAIL_CODE_GEOMETRY' if observations else 'PARTIAL_NO_FAILURE_FOUND_IN_CHECKED_CODE',
            'UI':'NOT_RUN','visualReview':'NOT_RUN','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return result


def report(group):
    from .runtime_fingerprint import runtime_fingerprint
    if group not in GROUPS:raise ValueError('Unbounded/unknownC4group')
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Runtimeepochchanged')
    if sha((APP/PRIMARY).read_bytes())!=PRIMARY_SHA:raise ValueError('Primarychanged')
    raw=subprocess.check_output(['git','show',REF+':'+SOURCE],cwd=APP)
    if sha(raw)!=SOURCE_SHA:raise ValueError('Sourcechanged')
    sources={r['id']:r for r in json.loads(raw)}
    if len(sources)!=29 or set(sources)!={'SIM-C4-'+k for k in DATA}:raise ValueError('C4sourceidentitysetchanged')
    path='editorial/reviews/C4-'+group+'-installed-code-1a35-20261125.json'
    blob=(APP/path).read_bytes()
    if sha(blob)!=PROOFS[group]:raise ValueError('Installedproofchanged')
    proof=json.loads(blob)
    deps={p:sha((APP/p).read_bytes()) for p in (PROTOCOL,WRAPPER,MESH_PROOF,MESH_PROTOCOL,str(Path(__file__).relative_to(APP)))}
    if deps[MESH_PROOF]!=MESH_SHA:raise ValueError('Meshsupplementchanged')
    mesh=json.loads((APP/MESH_PROOF).read_bytes())
    if mesh.get('runtimeSha256')!=RUNTIME or mesh.get('protocolSha256')!=deps[MESH_PROTOCOL] or any(sha((APP/p).read_bytes())!=h for p,h in mesh.get('dependencies',{}).items()):raise ValueError('Meshprovenancechanged')
    if proof.get('sourceRef')!=REF or proof.get('sourcePath')!=SOURCE or proof.get('sourceFileSha256')!=SOURCE_SHA or proof.get('group')!=group or any(proof.get(k)!=RUNTIME for k in ('runtimeProfileBefore','runtimeProfileAfter')) or proof.get('protocolSha256')!=deps[PROTOCOL] or proof.get('collectorWrapperSha256')!=deps[WRAPPER] or proof.get('UI')!='NOT_RUN' or proof.get('scientificApproval') is not False or proof.get('terminalStatus')!='COMPLETED_CODE_COLLECTION_ONLY':raise ValueError('Provenance/dispositionmismatch')
    if [p['acceptedFinite'] for p in proof.get('numericParserProbes',[])]!=[False,False,False,True,True,False,False,True]:raise ValueError('Numericparserprobesmissing')
    records=compare(group,proof,sources)
    for r in records:
        r['reviewDependencySha256']=deps
        r['nativeMeshCodeSupplement']={'path':MESH_PROOF,'sha256':MESH_SHA,'observations':[o for o in mesh['observations'] if o['id']==r['id']],'nativeRaster':'NOT_RUN','fallbackRaster':'NOT_RUN'}
    return {'phase':'ORIGINAL_SOURCE_MATH_INSTALLED_CODE_PARTIAL_NOT_REGISTRABLE','group':group,
      'sourceRef':REF,'sourcePath':SOURCE,'sourceFileSha256':SOURCE_SHA,'runtimeSha256':RUNTIME,
      'primaryPath':PRIMARY,'primarySha256':PRIMARY_SHA,'proofPath':path,'proofSha256':sha(blob),
      'disclosure':'PriorrelatedC4lessons,fieldsbenchesandsharedclocks/secondaryreading;notblind.29sourceonlyprimaryfrozenbeforeNEWC4model/solutionreading.',
      'records':records,'sourceMathPassCount':sum(r['sourceMathAndActualTasksOk'] for r in records),
      'sourceManualityFailureIds':[r['id'] for r in records if r['ManualityFailure']],
      'consumerCodeFailIds':[r['id'] for r in records if not r['consumerCodeGeometryOk']],
      'UI':'NOT_RUN','overallComplete':False,'ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','localOnly':True,'remoteDispatch':False}


def dimensional_checks():
    import pint
    u=pint.UnitRegistry()
    tests=[('Coulomb',9e9*u.newton*u.meter**2/u.coulomb**2*(1*u.nanocoulomb)**2/(4*u.centimeter)**2,u.micronewton),
      ('field',9e9*u.newton*u.meter**2/u.coulomb**2*1*u.nanocoulomb/(5*u.centimeter)**2,u.kilonewton/u.coulomb),
      ('accelerated',.5*1000*u.meter/u.second**2*(2*u.millisecond)**2,u.millimeter),
      ('energy',3*u.microcoulomb*4*u.volt,u.microjoule),('current',2*u.ampere*3*u.second,u.coulomb),
      ('resistivity',.6*u.microohm*u.meter*2*u.meter/(1*u.millimeter**2),u.ohm),
      ('Joule',3*u.ohm*(2*u.ampere)**2,u.watt),
      ('capacitance',8.854e-12*u.farad/u.meter*.01*u.meter**2/(5*u.millimeter),u.picofarad),
      ('capacitorenergy',.5*2*u.microfarad*(4*u.volt)**2,u.microjoule),
      ('Lorentz',2*u.microcoulomb*3*u.meter/u.second*1*u.tesla,u.micronewton),
      ('flux',.3*u.tesla*.02*u.meter**2,u.milliweber),
      ('Faraday',10*.05*u.meter**2*3*u.tesla/u.second,u.volt)]
    return [{'name':name,'magnitude':q.to(target).magnitude,'unit':str(target),'ok':True} for name,q,target in tests]
