"""Independent original C6 source/math/installed-code review; never UI credit.

Primary254b... was persisted before this reviewer opened the new C6.js or keys.
Prior wave/optics lesson/bench and shared-clock exposure is explicitly disclosed in the primary.
No authoring imports, candidate edits, source rewriting or human approval.
"""
from pathlib import Path
from fractions import Fraction as F
from functools import lru_cache
import hashlib,json,math,subprocess

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE='officina-di-fisica/content/esperienze-C6.json'
SOURCE_SHA='6e6877e96bd91712fbcc15e530486c31a4c8087227e1292b9093876b465c292c'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PRIMARY='editorial/reviews/C6-6-source-only-primary-20261125.json'
PRIMARY_SHA='254b754c7cc6ad9f0242fa392c68c1cbf3de3d065e23169fa1bf77b59710e625'
PROTOCOL='tests/corpus/collect-C6-bounded-code-only.mjs'
WRAPPER='tools/corpus_engineering/collect_C6_code_partial.py'
MESH_PROOF='editorial/reviews/C6-6-code-partial-20261125/mesh-halfspace-negatives.json'
MESH_PROTOCOL='tests/corpus/check-C6-contained-geometry.mjs'
MESH_SHA='ce9c702919c58754b9a80295838dbe7079b0d44f777e6946f898363afc4a1da0'
PROOFS={'cross-domain': '82fd9bbd3353a6a32097b67cf347f76d55491338ca75d8d8e812256cb5f31bdd'}
DATA={'L01-01': (0, 20, 1, 2, 10, 11, 'm', 2), 'L02-01': (0, 40, 2, 8, 24, 20, 'cm/s', 2), 'L03-01': (0, 100, 5, 20, 80, 50, 'K', 2), 'L04-01': (0, 5, 1, 1, 3, 4, 'unità', 0), 'L05-01': (0, 4, '.25', 2, 4, '1.75', 'm', 0), 'L06-01': ('.5', 3, '.25', '.5', 2, '1.75', '1', 2)}
INPUTS={'L01-01': ('1.7', '1.87'), 'L02-01': ('3', '2.5'), 'L03-01': ('1.6', '1'), 'L04-01': ('15', '7.5'), 'L05-01': ('2', '3.5'), 'L06-01': ('.5', '.4286')}
MANUAL={'L01-01': '340m/s=.34m/ms;roundtripdivided2 gives.17t:10*.17=1.7m,11*.17=1.87m. Instantdistanceat t is.34min(t,T−t), peakatT/2, zeroatT0 notdividebyzero.', 'L02-01': 'm/ρ=volume incm³;divide4s then2cm² givesv=m/8cm/s:24/8=3;20/8=2.5. Clockcollectedmassm*t/4g, notconstantm fromstart.', 'L03-01': 'Electrical5V*2A=10W,useful.8*10=8W. C400J/K→ΔT8t/400=t/50:80/50=1.6K;50/50=1K.', 'L04-01': 'Integerlayers:120/2³=15;120/2⁴=7.5units. No fractionalroot ornumericlog required byactualtasks.', 'L05-01': 'At4s outgoing4m minus2m return=2m. At1.75s beforeturn:2*1.75=3.5m. Distanceat4s is6m separately. Idealinstantturnat2s hasundefinedvelocity, absentarrowthen doesnotassertphysicaldwell.', 'L06-01': 'Thinlens f/q=1−1/(p/f). At2:1−1/2=.5;at7/4:1−4/7=3/7=.428571..., longdivision enter.4286. At1:0vergence,q∞; insidefocusqnegative.'}
ASSUMPTIONS={'L01': 'Stationaryreflector, emission/receptioncolocated, soundspeed340m/s,roundtriptimeinms. Zeroduration isdegenerate control, no actualtrip. Echo instantaneousdistance triangles, nottravelledpathlength.', 'L02': 'Incompressiblesteadywaterρ1g/cm³, collection4s, section2cm²; totalcollectedmass÷density÷duration÷area, noflushlosses. Tracer12cmtract andmassclockbasedonsamev.', 'L03': 'Assigned5V2A idealheaterconstantpower10W, usefulη.8 gives8W, heatcapacity400J/K constant,no phasechange; ambientlossaccountedbyη, notall10Wheatsample.', 'L04': 'Independentidenticalhalvinglayers, monochromatic/linearattenuation,ninteger0..5; signalrelativearbitraryunits, noadditivedecrement.', 'L05': 'v+2for0..2s,−1for2..4s, instantidealturn; integrate signedarea fordisplacement, absolutesforpath. No finiteacceleration/zero dwell assertion atjump; sourcefunctioncontinuous.', 'L06': 'Thinparaxialconverginglensf>0, ratiox=p/f>0; normalizedvergence1−1/x continuous atx1 thoughq∞. Real/virtualsignandrayextension mustmatch.'}
CHOICES={}
GROUPS={'cross-domain':list(DATA)}
MANUALITY_FAILURES=set()
MANUAL_SUPPORT_GAPS=set()

def sha(b):return hashlib.sha256(b).hexdigest()
def digest(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def rat(v):return F(str(v))
def close(v,w):return type(v) in (int,float) and math.isfinite(v) and math.isclose(v,float(w),rel_tol=1e-10,abs_tol=1e-10 if float(w)==0 else 0)
@lru_cache(maxsize=10000)
def exact(key,x):
    import sympy as S
    x=S.Rational(str(x))
    f={'L01-01':lambda:S.Rational(17,100)*x,'L02-01':lambda:x/8,
       'L03-01':lambda:x/50,'L04-01':lambda:120*2**(-x),
       'L05-01':lambda:2*x if x<=2 else 6-x,'L06-01':lambda:1-1/x}
    return f[key]()
DISCRETE={'L04-01'}
DRIVEN=set()
INPUT_CLOCKS={'L03-01','L05-01'}
CLOCKS=INPUT_CLOCKS|{'L01-01','L02-01'}
def clock(key,x,t):
    x,t=rat(x),rat(t)
    if key in INPUT_CLOCKS:return (100 if key=='L03-01' else 4),t,None
    if key=='L01-01':return x,x,rat('.34')*min(t,x-t)
    if key=='L02-01':return 4,x,x*t/4
    raise ValueError('UnknownC6clock')
def secondary(key,x,y,x0,unit):
    if key=='L05-01':return ('Cammino complessivo',2*x if x<=2 else x+2,'m')
    if key=='L06-01':return ('Immagine','All’infinito' if y==0 else 'Virtuale' if y<0 else 'Reale','')
    return ('Variazione dal riferimento',y-exact(key,x0),'' if unit=='1' else unit)

def fmt(x,unit):
    x=rat(x)
    s=str(x.numerator) if x.denominator==1 else format(float(x),'.12g').replace('.',',')
    return s+(' '+unit if unit!='1' else '')

def geometry_observations(key,elements,x):
    obs=[]
    base={'kind':'box','p':[0,-.11,0],'size':[6.75,.22,3.45],'alpha':1,'globalSceneBase':True}
    elements=[*elements,base]
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
        # Entire ray/arrow path crossing the actual opaque common base, even
        # when a tip emerges below its bottom. Positive interval, not tangency.
        lower=[-.5*v+c for c,v in zip(base['p'],base['size'])]
        upper=[.5*v+c for c,v in zip(base['p'],base['size'])]
        enter,leave=0.,1.;hit=True
        for i in range(3):
            d=a['b'][i]-a['a'][i]
            if abs(d)<1e-15:
                if not lower[i]<a['a'][i]<upper[i]:hit=False;break
            else:
                t0,t1=sorted(((lower[i]-a['a'][i])/d,(upper[i]-a['a'][i])/d))
                enter=max(enter,t0);leave=min(leave,t1)
        if hit and leave-enter>1e-8 and enter<1 and leave>0:
            obs.append({'code':'GLYPH_SEGMENT_INTERSECTS_OPAQUE_GLOBAL_BASE','input':x,'a':a['a'],'tip':a['b'],'baseCenter':base['p'],'baseSize':base['size'],'entryFraction':enter,'exitFraction':leave,'limit':'ActualsourcebaseXYZ/rayintersection; noUI/native/fallbackrasterobserved.'})
    return obs

def compare(group,proof,sources):
    keys=GROUPS[group];rows=proof.get('records',[])
    ids=['SIM-C6-'+k for k in keys]
    if len(rows)!=len(ids) or {r.get('id') for r in rows}!=set(ids):raise ValueError('Missing/duplicate/foreignC6IDs')
    result=[]
    for row in rows:
        key=row['id'][7:];src=sources[row['id']];lo,hi,step,x0,x1,tr,unit,pred=DATA[key]
        lo,hi,step,x0,x1,tr=map(rat,(lo,hi,step,x0,x1,tr))
        errors=[];observations=[];count=int((hi-lo)/step)+1
        if row.get('sourceRecord')!=src or row.get('sourceVersion')!=1:errors.append('Source/versionidentitydrift')
        params=row.get('params',[]);choices=CHOICES.get(key)
        if choices:
            if len(params)!=1 or params[0].get('options')!=[[str(int(lo)+i),value] for i,value in enumerate(choices)] or params[0].get('value')!=str(int(x0)):errors.append('Control/default/gridchanged')
        elif len(params)!=1 or params[0].get('key')!='x' or params[0].get('label')!=src['control']['label'] or params[0].get('unit')!=('' if src['control']['unit']=='1' else src['control']['unit']) or any(not close(params[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Control/default/gridchanged')
        if row.get('prediction',{}).get('correct')!=pred or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction/distractorchanged')
        cl=row.get('clock')
        if key in CLOCKS and cl:
            expected={'L01-01':('ms','Distanza dell’impulso dal microfono','m',False),
            'L02-01':('s','Massa già raccolta','g',False),'L03-01':('s',None,None,True),'L05-01':('s',None,None,True)}[key]
            if cl.get('clockUnit')!=expected[0] or cl.get('label')!=expected[1] or cl.get('unit')!=expected[2] or cl.get('input',False)!=expected[3]:errors.append('Clocklabels/units/modewrong')
        if bool(cl)!=(key in CLOCKS) or bool(cl and cl.get('finalReading')):errors.append('Clockmodechanged')
        cases=row.get('cases',[])
        if len(cases)!=count:errors.append('Incompletegrid')
        for i,c in enumerate(cases):
            x=lo+i*step;y=exact(key,x)
            if not close(c.get('x'),x) or not close(c.get('solve',{}).get('y'),y):errors.append('Installedscalarwrong')
            def check_readings(rr,t=0):
                label=src['measure']['label']+(' (a fine prova)' if key in DRIVEN else '')
                if len(rr)!=(4 if key in CLOCKS-INPUT_CLOCKS else 3) or rr[0][0]!=src['control']['label'] or (rr[0][1]!=choices[int(x-lo)] if choices else not close(rr[0][1],x)) or rr[0][2]!=('' if src['control']['unit']=='1' else src['control']['unit']):errors.append('Inputreadingwrong')
                if rr[1][0]!=label or not close(rr[1][1],y) or rr[1][2]!=('' if unit=='1' else unit):errors.append('Outputreading/unitwrong')
                want=secondary(key,x,y,x0,unit)
                valueok=rr[2][1]==want[1] if isinstance(want[1],str) else close(rr[2][1],want[1])
                if rr[2][0]!=want[0] or not valueok or rr[2][2]!=want[2]:errors.append('Secondaryreadingwrong')
                if key in CLOCKS-INPUT_CLOCKS and (not close(rr[-1][1],0 if abs(float(clock(key,x,t)[2]))<1e-11 else clock(key,x,t)[2]) or rr[-1][0]!=cl['label'] or rr[-1][2]!=cl['unit']):errors.append('Instantaneoussignalwrong')
            check_readings(c['readings'])
            if len(c.get('steps',[]))!=4:errors.append('Fourstagesmissing')
            gs=c.get('graphs',[]);dur=clock(key,x,0)[0] if key in CLOCKS else None
            if len(gs)!=1+int(key in CLOCKS-INPUT_CLOCKS and dur>0)+int(key=='L05-01'):errors.append('Graphcountwrong')
            scalarGraph=gs[1] if key=='L05-01' else gs[0]
            if key=='L05-01':
                area=gs[0];series=area['series'][0]
                if area.get('track')!='area-v' or area.get('x')!='tempo (s)' or area.get('y')!='v (m/s)' or series.get('points')!=[[0,2],[2,2],[2,-1],[4,-1]] or series.get('fillZero') is not True or not close(series.get('shadeUntil'),x):errors.append('Signedvelocityareagraphwrong')
            points=scalarGraph['series'][0]['points']
            if len(points)!=(count if key in DISCRETE or choices else 101) or any(not close(v,exact(key,u)) for u,v in points):errors.append('Controlgraphwrong')
            if scalarGraph['x']!=src['control']['label']+(' ('+src['control']['unit']+')' if src['control']['unit']!='1' else ''):errors.append('Graphinputunitwrong')
            if scalarGraph['y']!=src['measure']['label']+(' ('+unit+')' if unit!='1' else ''):errors.append('Graphunitwrong')
            samples=c.get('clockSamples',[])
            if key not in CLOCKS:
                if samples or c.get('duration') is not None:errors.append('Unexpectedclock')
            else:
                if len(samples)!=5 or not close(c.get('duration'),dur):errors.append('Clockcoveragewrong')
                for n,frame in enumerate(samples):
                    t=dur*F(n,4);_,u,sig=clock(key,x,t)
                    statex=u if key in INPUT_CLOCKS else x
                    statey=exact(key,statex)
                    if not close(frame.get('time'),t) or not close(frame.get('input'),statex) or not close(frame.get('instantPhysicalInput'),u) or not close(frame.get('solve',{}).get('y'),statey) or (frame.get('signal') is not None if sig is None else not close(frame.get('signal'),sig)):errors.append('Clockframewrong')
                    if key in INPUT_CLOCKS:
                        savedx,savedy=x,y;x,y=statex,statey
                        check_readings(frame['readings'],t);x,y=savedx,savedy
                    else:check_readings(frame['readings'],t)
                    observations.extend(dict(o,clockTime=float(t),instantPhysicalInput=float(u)) for o in geometry_observations(key,frame['elements'],float(x)))
                if dur>0 and key not in INPUT_CLOCKS:
                    points=gs[-1]['series'][0]['points']
                    if len(points)!=161 or any(not close(v,clock(key,x,t)[2]) for t,v in points):errors.append('Timegraphwrong')
            observations.extend(geometry_observations(key,c['elements'],float(x)))
        tasks=row.get('assessment',[]);taskresults=[]
        if len(tasks)!=2:errors.append('Twotasksmissing')
        for i,task in enumerate(tasks[:2]):
            x=(x1,tr)[i];v=exact(key,x);text=choices[int(x-lo)] if choices else fmt(x,src['control']['unit'])
            prompt=src['transferPrompt'].replace('{x}',text) if i else 'Imposta «'+src['control']['label']+'» su '+text+'. Quale valore ottieni per «'+src['measure']['label']+'»?'
            literal=INPUTS[key][i];ans=rat(literal);tol=max(1e-6,abs(float(v))*.005)
            good=close(task.get('value'),v) and task.get('unit')==('numero puro' if unit=='1' else unit) and task.get('prompt')==prompt and abs(float(ans-v))<=tol
            if not good:errors.append('Actualtask/math/unit/prompt/manualinputwrong')
            taskresults.append({'prompt':task.get('prompt'),'input':str(x),'independentExact':str(v),'unit':unit,'manualNumericLiteral':literal,'literalAcceptedByNumericRule':abs(float(ans-v))<=tol,'actualValue':task.get('value'),'ok':good})
        af=row.get('assessmentFormat',[])
        if len(af)!=2 or any(not close(a.get('value'),t.get('value')) or type(a.get('parsed')) not in (float,int) or abs(a['parsed']-a['value'])>max(1e-6,abs(a['value'])*.005) for a,t in zip(af,tasks)):errors.append('Displayroundtripwrong')
        result.append({'id':row['id'],'sourceVersion':1,'sourceSha256':digest(src),
            'sourceMathAndActualTasksOk':not errors,'errors':sorted(set(errors)),
            'gridCount':count,'clockSampleCount':sum(len(c['clockSamples']) for c in cases),
            'actualTasks':taskresults,'manualProcedure':MANUAL[key],
            'assumptionsAndDomain':ASSUMPTIONS[key[:3]],
            'consumerCodeGeometryOk':not observations,'geometryObservations':observations,
            'checkedGeometryScope':'AllcollectedarrowtipXYZvsopaqueboxes/spheres/cappedrods plusglobalopaquebase/raysegmentintersections; materialalpha1 only. Notfullglyphs/meshfacets/camera/raster/labels/fallback. NoUIobserved.',
            'SourceScientificFailure':None if not errors else 'Seeexpliciterrors',
            'CodeGeometryFailure':[o['code'] for o in observations],
            'ManualSupportGap':key in MANUAL_SUPPORT_GAPS,
            'ManualityFailure':key in MANUALITY_FAILURES or any(not t['literalAcceptedByNumericRule'] for t in taskresults),
            'UI_Observed':False,
            'manualityScope':'Independentreviewerderivedhandprocedureforbothactualtasks;notastudentperformancecalibrationorclaimthesourcealreadyteachesallbounds.',
            'studentTaskScope':'Two actual generated numeric questions; predictiondistractors independently checked; bounds/extraoracles are reviewerprobes not assignedstudenttasks.',
            'sourceJudgment':'PASS_MATH_ONLY' if not errors else 'FAIL_MATH_OR_CODE',
            'consumerJudgment':'FAIL_CODE_GEOMETRY' if observations else 'PARTIAL_NO_FAILURE_FOUND_IN_CHECKED_CODE',
            'UI':'NOT_RUN','visualReview':'NOT_RUN','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return result


def report(group):
    from .runtime_fingerprint import runtime_fingerprint
    if group not in GROUPS:raise ValueError('Unbounded/unknownC6group')
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Runtimeepochchanged')
    if sha((APP/PRIMARY).read_bytes())!=PRIMARY_SHA:raise ValueError('Primarychanged')
    raw=subprocess.check_output(['git','show',REF+':'+SOURCE],cwd=APP)
    if sha(raw)!=SOURCE_SHA:raise ValueError('Sourcechanged')
    sources={r['id']:r for r in json.loads(raw)}
    if len(sources)!=6 or set(sources)!={'SIM-C6-'+k for k in DATA}:raise ValueError('C6sourceidentitysetchanged')
    path='editorial/reviews/C6-'+group+'-installed-code-1a35-20261125.json'
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
        r['nativeMeshCodeSupplement']={'path':MESH_PROOF,'sha256':MESH_SHA,'sphereObservations':[o for o in mesh['observations'] if o['id']==r['id']],'rodInteriors':[o for o in mesh['rodInteriors'] if o['id']==r['id']],'baseIntersections':[o for o in mesh['baseIntersections'] if o['id']==r['id']],'nativeRaster':'NOT_RUN','fallbackRaster':'NOT_RUN'}
    return {'phase':'ORIGINAL_SOURCE_MATH_INSTALLED_CODE_PARTIAL_NOT_REGISTRABLE','group':group,
      'sourceRef':REF,'sourcePath':SOURCE,'sourceFileSha256':SOURCE_SHA,'runtimeSha256':RUNTIME,
      'primaryPath':PRIMARY,'primarySha256':PRIMARY_SHA,'proofPath':path,'proofSha256':sha(blob),
      'disclosure':'PriorrelatedC6cross-domainexamplesandsharedclocks/apparatusreading;notblind.6sourceonlyprimaryfrozenbeforeNEWC6model/solutionreading.',
      'records':records,'sourceMathPassCount':sum(r['sourceMathAndActualTasksOk'] for r in records),
      'sourceManualSupportGapIds':[r['id'] for r in records if r['ManualSupportGap']],
      'sourceManualityFailureIds':[r['id'] for r in records if r['ManualityFailure']],
      'consumerCodeFailIds':[r['id'] for r in records if not r['consumerCodeGeometryOk']],
      'UI':'NOT_RUN','overallComplete':False,'ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','localOnly':True,'remoteDispatch':False}


def dimensional_checks():
    import pint
    u=pint.UnitRegistry()
    tests=[('echo',340*u.meter/u.second*11*u.millisecond/2,u.meter),
    ('collection',20*u.gram/(1*u.gram/u.centimeter**3)/(4*u.second)/(2*u.centimeter**2),u.centimeter/u.second),
    ('heater',.8*5*u.volt*2*u.ampere*50*u.second/(400*u.joule/u.kelvin),u.kelvin),
    ('signedpath',2*u.meter/u.second*2*u.second-1*u.meter/u.second*2*u.second,u.meter)]
    return [{'name':n,'magnitude':q.to(target).magnitude,'unit':str(target),'ok':True} for n,q,target in tests]
