"""Independent original C5 source/math/installed-code review; never UI credit.

Primary d6c1... was persisted before this reviewer opened the new C5.js or keys.
Prior wave/optics lesson/bench and shared-clock exposure is explicitly disclosed in the primary.
No authoring imports, candidate edits, source rewriting or human approval.
"""
from pathlib import Path
from fractions import Fraction as F
from functools import lru_cache
import hashlib,json,math,subprocess

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE='officina-di-fisica/content/esperienze-C5.json'
SOURCE_SHA='7fff6e6703886003c45695e95b3361f8e09875da4b080ae17e6aa26d33f9bd84'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PRIMARY='editorial/reviews/C5-27-source-only-primary-20261125.json'
PRIMARY_SHA='d6c1c7cc43c0fb06360f5ef6636352f4f09719c881e9f145d3a492ee1ce0b1bb'
PROTOCOL='tests/corpus/collect-C5-bounded-code-only.mjs'
WRAPPER='tools/corpus_engineering/collect_C5_code_partial.py'
MESH_PROOF='editorial/reviews/C5-27-code-partial-20261125/mesh-halfspace-negatives.json'
MESH_PROTOCOL='tests/corpus/check-C5-contained-geometry.mjs'
MESH_SHA='db9b1524a2c3c091adea62be1e7d706131e234f7f0ea210be2dd33d3e9bce359'
PROOFS={'oscillation-waves': 'cb1f499e396756ba0d6fbff9c88d4b6582eab463afa7afe8e3e1457d72b90245', 'energy-sound': '84c801bd6f88cc6eb8c714e6afc450f48dde5b2693eb64a443c3e2b6e6fed1c9', 'fields-photons': '8aa96a13d0f70e683befacb56ab7e12dfca1d1042cbacd0513f2e4c657e8a81a', 'nuclear-optics': '77b5b2ec737562d0c5727eae416efd3d3ac662f5861fa6ff893447c8e742ba0f'}
DATA={'L01-01': (0, 4, '.125', 0, 1, '2.125', 'cm', 0), 'L01-02': ('.5', 4, '.25', '.5', 2, '2.5', 'Hz', 0), 'L02-01': (0, 3, '.125', '.5', 2, '1.5', 'm', 2), 'L02-02': (1, 5, '.5', 2, 4, 3, 'm', 0), 'L02-03': (0, 2, '.125', '.25', '.75', '1.125', 'cm', 0), 'L02-04': (0, 360, 15, 90, 270, 180, 'mm', 0), 'L03-01': (-3, 3, '.5', -2, 2, 0, 'cm', 2), 'L03-02': (0, 1, '.05', 0, '.5', '.55', 'cm', 0), 'L04-01': (0, 3, '.25', '.5', 2, '1.5', '1', 2), 'L04-02': ('.5', 5, '.5', 1, 4, 3, 'mJ', 2), 'L04-03': (1, 5, '.25', 2, 4, 3, 'W/m²', 0), 'L05-01': (1, 3, 1, 2, 3, 1, 'ms', 0), 'L05-02': (0, 8, 1, 2, 6, 4, 'dB', 2), 'L05-03': (-40, 40, 5, 0, 30, -5, 'Hz', 2), 'L06-01': (0, 360, 15, 90, 270, 180, 'nT', 0), 'L06-02': (0, 6, '.5', 2, 4, 3, '1', 2), 'L06-03': (1, 7, 1, 1, 4, 5, '1', 0), 'L07-01': (100, 1000, 50, 250, 750, 550, 'eV', 2), 'L07-02': (0, 5, '.25', 1, 3, '2.5', '%', 0), 'L07-03': (5, 25, 1, 8, 20, 15, 'eV', 2), 'L08-01': (6, 8, 1, 6, 8, 7, '1', 2), 'L08-02': (0, 5, '.25', 1, 3, '2.5', '1', 0), 'L08-03': (1, 3, 1, 1, 2, 3, '1', 2), 'L09-01': (0, 75, 5, 20, 50, 40, '°', 2), 'L09-02': (0, 80, 5, 0, 30, 45, '°', 2), 'L10-01': (5, 20, 1, 5, 20, 13, 'm⁻¹', 0), 'L10-02': (5, 25, 1, 5, 20, 15, 'diottrie', 2)}
INPUTS={'L01-01': ('-4', '3.696'), 'L01-02': ('.5', '.4'), 'L02-01': ('4', '3'), 'L02-02': ('1.5', '2'), 'L02-03': ('-3', '2.12'), 'L02-04': ('-2', '0'), 'L03-01': ('4', '2'), 'L03-02': ('0', '.626'), 'L04-01': ('4', '2.25'), 'L04-02': ('8', '6'), 'L04-03': ('.0625', '.1111'), 'L05-01': ('30', '441.2'), 'L05-02': ('60', '40'), 'L05-03': ('333.3', '295.1'), 'L06-01': ('-10', '0'), 'L06-02': ('4', '2.25'), 'L06-03': ('-6.3', '-7.3'), 'L07-01': ('3.102', '2.2748'), 'L07-02': ('12.5', '17.68'), 'L07-03': ('6', '1'), 'L08-01': ('14', '13'), 'L08-02': ('8', '11.31'), 'L08-03': ('1', '0'), 'L09-01': ('100', '80'), 'L09-02': ('19.47', '28.13'), 'L10-01': ('5', '7.692'), 'L10-02': ('5', '3.333')}
MANUAL={'L01-01': 'At1s,4cosπ=−4. At2.125s phase17π/8, x=2sqrt(2+sqrt2). Reviewer bound:1.414²<2<1.415², then1.847²=3.411409<2+sqrt2<3.415<1.849²=3.418801; x3.694..3.698, literal3.696. Nestedroot/halfangle/bounds notassignedinsource; supportgap, notinabilityproof.', 'L01-02': 'Frequency1/T:1/2=.5;1/2.5=.4Hz. ω2π/Tis secondarydisplay, notassignednumericωquestion.', 'L02-01': '2m/s*2s=4m;2*1.5=3m. Pulsecentre differsfrommaterialparticle.', 'L02-02': '6m/s/4Hz=1.5m;6/3=2m. Oscillationamplitude1cm isassignedclocksetup.', 'L02-03': '3sin(3π/2)=−3. At1.125,3sin(9π/4)=3sqrt2/2. Reviewer1.414²=1.999396<2<2.002225=1.415² gives2.121<answer<2.1225, literal2.12accepted. Familiarangle/rootbound absentasprocedureinsource; readinessunverified, notmathematicalfailure.', 'L02-04': '2sin270=−2;2sin180=0mm; axisparallel/normal dependsmedium, identicalscalaroscillation.', 'L03-01': '2+2=4;2+0=2cm, instantaneous signeddisplacements.', 'L03-02': 'At.5λ,4abs(cosπ/2)=0. At.55λ answer4sin(π/20)≈.62573786. Sourceassignsnostandardangle/table/series. Literal.626accepted butmanualsupportFAIL. Reviewer route π∈(3.1415,3.1416),θπ/20;θ−θ³/6<sinθ<θ gives.6257<answer<.62832, enoughfor.626±.00313. This inequality/πbound isnotstudentmaterial.', 'L04-01': '(.5)^2 reference.25; comparison2²=4, transfer1.5²=2.25. Samecordfrequency/tension/μ.', 'L04-02': '10W/m²*2s*Acm²*1e−4m²/cm²=2AmJ:8;6mJ.', 'L04-03': '4π/(4πr²)=1/r²:1/16=.0625;1/9=.1111... literal.1111W/m².', 'L05-01': 'Actualstudentformula explicitly assignsair340,water1500,steel5000m/s. Comparisonsteel150000/5000=30ms; transferair150000/340=7500/17, longdivide441.17647, enter441.2. Noecho doubling.', 'L05-02': '10log10(10^6)=60;10log10(10^4)=40dB, exactlogpowercancellation.', 'L05-03': '300*300/(300−30)=1000/3, enter333.3Hz; u−5 gives90000/305=18000/61, longdivide295.081967, enter295.1Hz.', 'L06-01': 'cwork3e8m/s,E3sinφ⇒B10sinφnT. sin270=−1 gives−10;sin180=0, localbothfields0, noassignedorientationforzerovector.', 'L06-02': '(4/2)^2=4;(3/2)^2=9/4=2.25;λ3m remainsfixed.', 'L06-03': 'Sourceexplicitlyprovidespowersinworkedsubstitution:visible10^(−6.3),UV10^(−7.3). log10(10^p)=p:−6.3;−7.3. Notnumericallytakinglogofroundedreadout5.012e−7. Unicode exponentmiddle-dotnotation ispresentationrisk tocheckUI.', 'L07-01': '4.136e−15*1e12=.004136eV/THz:750*.004136=3.102;550*.004136=2.2748eV.', 'L07-02': 'At3half-layers100/8=12.5%. At2.5layers100/(4sqrt2)=25sqrt2/2. Reviewer1.414<sqrt2<1.415 implies17.675..17.6875, literal17.68. Fractionalhalflayerroot procedureisnotprovided; supportgap/readinessunverified, noexponentialcalculator claim.', 'L07-03': 'max(0,20−14)=6;max(0,15−14)=1eV. Atthreshold14electronmayleavewithzeroK, as sourceexplicit.', 'L08-01': 'CarbonZ6:6+8=14;6+7=13. Onlycarbon14radioactive; nofictionallinearstabilityrule.', 'L08-02': 'At3halflives64/8=8mean. At2.5:64/(4sqrt2)=8sqrt2. Reviewer1.414..1.415⇒11.312..11.32, literal11.31accepted. Boundnotassigned; supportgap/readinessunverified. Expectedvalue not deterministicinteger.', 'L08-03': 'β−neutron→proton givesΔZ+1;γgives0, neitherchangesA. αwouldgiveZ−2,A−4, notsameparentrequired.', 'L09-01': 'Outgoinggeometricraysseparated2θ:comparison50→100;transfer40→80°. Incidentpropagationvectorangle wouldbesupplement, notasked.', 'L09-02': 'Snellcomparison30→asin(1/3)*180/π≈19.47122°,transfer45→asin(sqrt2/3)*180/π≈28.12551°. ExactinverseanglesinvalidNumberinput. Literals19.47/28.13fitgrader,butsourceprovidesnonumericinverse-trigmethod/bounds. OriginalmanualsupportFAIL; onlynumericmathverified, nofabricatedcalculator-free usability.', 'L10-01': 'D=1/f_m=100/f_cm:100/20=5m−1;100/13=7.692307..., enter7.692.', 'L10-02': '1/q=10−100/p_cm:at20 gives5diopters;at15 gives10−20/3=10/3, enter3.333. p10gives0vergence/parallelrays, noinfinitydivision.'}
ASSUMPTIONS={'L01': 'Linearundampedoscillator; period2/A4cm vs separateperiodcontrolA3cm sourcev2; microscopic speednotpulsepropagation. Sourceonlynumericmethods assessed separately.', 'L02': 'Linearwaves; phaseωt−kx moves+x; markedparticle isfixedmaterialcoordinate, transversevsparallelaxis. Timeunitseconds, wavelengthspositive. Same6mcord whereexplicit.', 'L03': 'Signedsuperposition; coherent equal-localamplitudeinphase sources, amplitudeabsolutevalue ofsumphasors; localwaveamplitude2cm each, pathdifference inλunits.', 'L04': 'Progressivewavesamecord/μ/tension/frequency linearregime; detectornormaltoflux; isotropicsourceP4πW,noabsorption/reflection, r>0.', 'L05': 'Assignedillustrativesoundspeeds340/1500/5000m/s;150mone-way, notecho. Decibelintensityratio10n, notamplituderatio20log. Dopplersubsonic±40,stationaryreceiver,mediumspeed300,sourcef300,steadytrainwithpreexistingfronts.', 'L06': 'VacuumtransverseE/Binphase,E×B+x, signedlocalcomponentsnotmagnitudes; cwork3e8; localzeroat180doesnotmeanwholewavezero. Intensity∝amplitude²; spectrumscenecrestcount explicitlyschematic, sourcepowersprovided.', 'L07': 'Workingh4.136e−15eVs, singlephotonenergy; monochromaticexponential attenuationhalflayers excludes scatteredlight; threshold14eVsinglephoton, atthresholdK0ionizationpossible.', 'L08': 'IsotopesfixedZ6, correctstable12/13radioactive14; decayexpectation64*2^−t, renderroundingdisclosed, notdeterministic. SecondaryactivityassumesT_half1s explicitlabel. αβ−γbookkeepingseparatetransitions.', 'L09': 'Incident/reflectedanglesfromnormal; outgoingrays2θ. Refractionair1→glass1.5,noTIR; Snellinverseanglesnumericmanualsupportmissing. Nativeglassinterface/refractionpath vsopaqueglobalbasechecked separately.', 'L10': 'Thinparaxialconverginglens; f10cmorpositivevariablef, cm→m; p=f yieldsparallelq∞butvergence0, virtualqnegative whenp<f. Raysandextensions mustmatchsignedvergence.'}
CHOICES={'L05-01': ['Aria', 'Acqua', 'Acciaio'], 'L06-03': ['Radio', 'Microonde', 'Infrarosso', 'Visibile', 'UV', 'X', 'Gamma'], 'L08-03': ['Alfa', 'Beta meno', 'Gamma']}
GROUPS={'oscillation-waves':list(DATA)[:8],'energy-sound':list(DATA)[8:14],'fields-photons':list(DATA)[14:20],'nuclear-optics':list(DATA)[20:]}
MANUALITY_FAILURES={'L01-01','L03-02','L09-02'}
MANUAL_SUPPORT_GAPS={'L01-01','L02-03','L03-02','L07-02','L08-02','L09-02'}

def sha(b):return hashlib.sha256(b).hexdigest()
def digest(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def rat(v):return F(str(v))
def close(v,w):return type(v) in (int,float) and math.isfinite(v) and math.isclose(v,float(w),rel_tol=1e-10,abs_tol=1e-10 if float(w)==0 else 0)
@lru_cache(maxsize=30000)
def exact(key,x):
    import sympy as S
    x=S.Rational(str(x))
    f={'L01-01':lambda:4*S.cos(S.pi*x),'L01-02':lambda:1/x,'L02-01':lambda:2*x,'L02-02':lambda:6/x,
    'L02-03':lambda:3*S.sin(2*S.pi*x),'L02-04':lambda:2*S.sin(S.pi*x/180),'L03-01':lambda:2+x,
    'L03-02':lambda:4*S.Abs(S.cos(S.pi*x)),'L04-01':lambda:x*x,'L04-02':lambda:2*x,'L04-03':lambda:1/x**2,
    'L05-01':lambda:S.Rational(150000,[340,1500,5000][int(x)-1]),'L05-02':lambda:10*x,'L05-03':lambda:90000/(300-x),
    'L06-01':lambda:10*S.sin(S.pi*x/180),'L06-02':lambda:x*x/4,
    'L06-03':lambda:[S.Integer(2),S.Integer(-2),S.Integer(-5),-S.Rational(63,10),-S.Rational(73,10),S.Integer(-10),S.Integer(-12)][int(x)-1],
    'L07-01':lambda:S.Rational(517,125000)*x,'L07-02':lambda:100*2**(-x),'L07-03':lambda:S.Max(0,x-14),
    'L08-01':lambda:6+x,'L08-02':lambda:64*2**(-x),'L08-03':lambda:S.Integer([-2,1,0][int(x)-1]),
    'L09-01':lambda:2*x,'L09-02':lambda:180/S.pi*S.asin(S.Rational(2,3)*S.sin(S.pi*x/180)),
    'L10-01':lambda:100/x,'L10-02':lambda:10-100/x}
    return f[key]()
DISCRETE={'L08-01'}
DRIVEN=set()
INPUT_CLOCKS={'L01-01','L02-01','L02-03','L08-02'}
CLOCKS=INPUT_CLOCKS|{'L01-02','L02-02','L05-01','L05-03','L06-02','L07-01'}
def clock(key,x,t):
    x,t=rat(x),float(t);xf=float(x)
    if key in INPUT_CLOCKS:return {'L01-01':4,'L02-01':3,'L02-03':2,'L08-02':5}[key],rat(t),None
    if key=='L01-02':return 2*x,x,3*math.cos(2*math.pi*t/xf)
    if key=='L02-02':return 3,x,math.sin(2*math.pi*xf*t)
    if key=='L05-01':
        end=float(exact(key,x));return end,x,150*t/end
    if key=='L05-03':
        emitted=(.3*t-3)/(.3-xf/1000);return 20,x,math.cos(2*math.pi*.3*emitted)
    if key=='L06-02':return 20,x,xf*math.sin(2*math.pi*t/10)
    if key=='L07-01':return 2000/x,x,math.sin(2*math.pi*xf*t/1000)
    raise ValueError('UnknownC5clock')
def secondary(key,x,y,x0,unit):
    import sympy as S
    x=S.Rational(str(x))
    f={'L01-02':lambda:('Pulsazione',2*S.pi/x,'rad/s'),'L03-02':lambda:('Sfasamento',360*x,'°'),
    'L05-02':lambda:('Intensità rispetto a I₀',10**x,''),'L06-01':lambda:('Campo elettrico in P',3*y/10,'V/m'),
    'L06-02':lambda:('Lunghezza d’onda',3,'m'),'L06-03':lambda:('Lunghezza d’onda',10**y,'m'),
    'L07-03':lambda:('Elettrone libero','Sì' if x>=14 else 'No',''),
    'L08-02':lambda:('Attività per T½ = 1 s',S.log(2)*y,'Bq'),
    'L08-03':lambda:('Variazione del numero di massa',-4 if x==1 else 0,''),
    'L10-02':lambda:('Immagine','All’infinito' if y==0 else 'Virtuale' if y<0 else 'Reale','')}
    return f[key]() if key in f else ('Variazione dal riferimento',y-exact(key,x0),'' if unit=='1' else unit)

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
    ids=['SIM-C5-'+k for k in keys]
    if len(rows)!=len(ids) or {r.get('id') for r in rows}!=set(ids):raise ValueError('Missing/duplicate/foreignC5IDs')
    result=[]
    for row in rows:
        key=row['id'][7:];src=sources[row['id']];lo,hi,step,x0,x1,tr,unit,pred=DATA[key]
        lo,hi,step,x0,x1,tr=map(rat,(lo,hi,step,x0,x1,tr))
        errors=[];observations=[];count=int((hi-lo)/step)+1
        if row.get('sourceRecord')!=src or row.get('sourceVersion')!=(2 if key in {'L01-02','L06-01'} else 1):errors.append('Source/versionidentitydrift')
        params=row.get('params',[]);choices=CHOICES.get(key)
        if choices:
            if len(params)!=1 or params[0].get('options')!=[[str(int(lo)+i),value] for i,value in enumerate(choices)] or params[0].get('value')!=str(int(x0)):errors.append('Control/default/gridchanged')
        elif len(params)!=1 or params[0].get('key')!='x' or params[0].get('label')!=src['control']['label'] or params[0].get('unit')!=('' if src['control']['unit']=='1' else src['control']['unit']) or any(not close(params[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Control/default/gridchanged')
        if row.get('prediction',{}).get('correct')!=pred or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction/distractorchanged')
        cl=row.get('clock')
        if key in CLOCKS and cl:
            expected={
            'L01-01':('s',None,None,True),'L02-01':('s',None,None,True),'L02-03':('s',None,None,True),'L08-02':('T½',None,None,True),
            'L01-02':('s','Posizione della sorgente','cm',False),'L02-02':('s','Spostamento alla sorgente','cm',False),
            'L05-01':('ms','Cammino del suono','m',False),'L05-03':('ms','Pressione relativa al ricevitore','',False),
            'L06-02':('ns','Campo elettrico alla sorgente','V/m',False),'L07-01':('fs','Campo relativo alla sorgente','',False)}[key]
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
            if len(gs)!=1+int(key in CLOCKS-INPUT_CLOCKS and dur>0):errors.append('Graphcountwrong')
            points=gs[0]['series'][0]['points']
            if len(points)!=(count if key in DISCRETE or choices else 101) or any(not close(v,exact(key,u)) for u,v in points):errors.append('Controlgraphwrong')
            if gs[0]['x']!=src['control']['label']+(' ('+src['control']['unit']+')' if src['control']['unit']!='1' else ''):errors.append('Graphinputunitwrong')
            if gs[0]['y']!=src['measure']['label']+(' ('+unit+')' if unit!='1' else ''):errors.append('Graphunitwrong')
            samples=c.get('clockSamples',[])
            if key not in CLOCKS:
                if samples or c.get('duration') is not None:errors.append('Unexpectedclock')
            else:
                if len(samples)!=5 or not close(c.get('duration'),dur):errors.append('Clockcoveragewrong')
                for n,frame in enumerate(samples):
                    t=dur*F(n,4);_,u,sig=clock(key,x,t)
                    # Twoopticalperiodsduration;quartersareexactphase n*pi.
                    # This isnot a global epsilon/rounding rule forsmallvalues.
                    if key=='L07-01':sig=0
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
        result.append({'id':row['id'],'sourceVersion':2 if key in {'L01-02','L06-01'} else 1,'sourceSha256':digest(src),
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
    if group not in GROUPS:raise ValueError('Unbounded/unknownC5group')
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Runtimeepochchanged')
    if sha((APP/PRIMARY).read_bytes())!=PRIMARY_SHA:raise ValueError('Primarychanged')
    raw=subprocess.check_output(['git','show',REF+':'+SOURCE],cwd=APP)
    if sha(raw)!=SOURCE_SHA:raise ValueError('Sourcechanged')
    sources={r['id']:r for r in json.loads(raw)}
    if len(sources)!=27 or set(sources)!={'SIM-C5-'+k for k in DATA}:raise ValueError('C5sourceidentitysetchanged')
    path='editorial/reviews/C5-'+group+'-installed-code-1a35-20261125.json'
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
      'disclosure':'PriorrelatedC5wave/opticslessons/examples/benchesandsharedclocks/secondaryreading;notblind.27sourceonlyprimaryfrozenbeforeNEWC5model/solutionreading.',
      'records':records,'sourceMathPassCount':sum(r['sourceMathAndActualTasksOk'] for r in records),
      'sourceManualSupportGapIds':[r['id'] for r in records if r['ManualSupportGap']],
      'sourceManualityFailureIds':[r['id'] for r in records if r['ManualityFailure']],
      'consumerCodeFailIds':[r['id'] for r in records if not r['consumerCodeGeometryOk']],
      'UI':'NOT_RUN','overallComplete':False,'ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','localOnly':True,'remoteDispatch':False}


def dimensional_checks():
    import pint
    u=pint.UnitRegistry()
    tests=[('frequency',1/(2.5*u.second),u.hertz),('wave',6*u.meter/u.second/(3*u.hertz),u.meter),
    ('energy',10*u.watt/u.meter**2*3*u.centimeter**2*2*u.second,u.millijoule),
    ('sound',150*u.meter/(340*u.meter/u.second),u.millisecond),
    ('EM',3*u.volt/u.meter/(3e8*u.meter/u.second),u.nanotesla),
    ('Planck',4.136e-15*u.electron_volt*u.second*550*u.terahertz,u.electron_volt),
    ('lens',1/(13*u.centimeter),1/u.meter)]
    return [{'name':n,'magnitude':q.to(target).magnitude,'unit':str(target),'ok':True} for n,q,target in tests]
