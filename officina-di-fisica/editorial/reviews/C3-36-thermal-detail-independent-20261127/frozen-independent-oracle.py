"""Independent original C3 source/math/installed-code review; never UI credit.

Primary c87e... was persisted before this reviewer opened the new C3.js or keys.
Prior thermal lesson/clock exposure is explicitly disclosed in the primary.
No authoring imports, candidate edits, source rewriting or human approval.
"""
from pathlib import Path
from fractions import Fraction as F
from functools import lru_cache
import hashlib,json,math,subprocess

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE='officina-di-fisica/content/esperienze-C3.json'
SOURCE_SHA='2738799d5195ca5eda77c4dce1cdc79f708237e5660bb9cabcc7fac4f80ea3ff'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PRIMARY='editorial/reviews/C3-36-source-only-primary-20261125.json'
PRIMARY_SHA='c87e8e0db9b84ae2fe58cd1bf0bb81185806521b3e8953aff63d7dd6dc7cbcf2'
PROTOCOL='tests/corpus/collect-C3-bounded-code-only.mjs'
WRAPPER='tools/corpus_engineering/collect_C3_code_partial.py'
MESH_PROOF='editorial/reviews/C3-36-code-partial-20261125/mesh-halfspace-negatives.json'
MESH_PROTOCOL='tests/corpus/check-C3-contained-geometry.mjs'
MESH_SHA='4c079bd5a19b5a69ed0e0416fd1b95a81d99d80def88177ba5bc68355bad789d'
PROOFS={
 'state':'48c4e0f503742352f404c9d57fabaa63889dd9213432e40ebd675bda588c30f5',
 'calorimetry':'ef0f337687937d7769d85ebd516bfeef9780e18092e3d939cc6baf419daefa44',
 'first-law':'089994abdf10586cc9850d97fafc28119abbf739dba28a768535f73fe64d76be',
 'paths':'7f58e098e27413f9c1574d177318e07a1dcaf4e6f34ccc10ab29b0020235fc7d',
 'entropy':'6390ac3eddae423cf30315ce4e414d1518d5c666e74b539942a67993d1b15f3a',
}
# Explicit independently read control grids, reference inputs, actual second task,
# unit, monotonic prediction index. No expected value copied from source keys.
DATA={
 'L01-01':(0,8,'.5',2,6,4,'cm³',2),
 'L01-02':(200,500,10,250,400,350,'kPa',2),
 'L01-03':(1,5,'.25',2,4,3,'kPa',0),
 'L01-04':(-50,100,5,0,50,25,'K',2),
 'L02-01':(1,8,'.5',2,6,'4.5','kPa',0),
 'L02-02':(50,200,10,100,160,130,'K',2),
 'L03-01':(0,12,1,2,8,6,'J',2),
 'L03-02':(50,300,25,100,250,175,'J/K',2),
 'L03-03':(0,20,1,2,10,11,'J',2),
 'L03-04':(50,300,25,100,200,175,'°C',2),
 'L04-01':(0,'33.4','1.67','8.35','16.7','18.37','g',2),
 'L04-02':(-5,5,'.5',-2,3,0,'kJ',2),
 'L04-03':(0,54,1,1,19,28,'g',2),
 'L05-01':(1,8,'.5',2,5,'4.5','W',0),
 'L05-02':(0,5,'.25',1,3,'2.5','W',2),
 'L05-03':(200,500,10,300,400,350,'W/m²',2),
 'L06-01':(-20,50,5,10,30,15,'J',2),
 'L06-02':(-20,30,2,-10,20,6,'J',2),
 'L06-03':(-20,30,5,-10,20,5,'J',2),
 'L06-04':(-1,2,'.25','-.5','1.5','.5','J',2),
 'L07-01':(1,8,1,1,2,6,'J',2),
 'L07-02':(1,4,'.25',1,2,'2.75','kPa',0),
 'L07-03':(200,500,25,250,400,350,'kPa',2),
 'L07-04':(200,500,25,250,400,350,'L',2),
 'L07-05':(1,4,'.25',1,4,'2.5','kPa',0),
 'L08-01':(0,3,'.25',1,2,'1.5','J',2),
 'L08-02':(20,100,5,40,80,60,'J',0),
 'L08-03':(1,6,1,2,5,4,'J',2),
 'L09-01':(0,80,5,20,60,40,'J',2),
 'L09-02':(0,200,10,50,150,100,'J',2),
 'L09-03':(0,50,5,10,40,25,'%',2),
 'L09-04':(250,500,25,250,400,375,'%',0),
 'L10-01':(-60,60,5,-30,60,0,'J/K',2),
 'L10-02':(0,120,10,30,90,60,'J/K',2),
 'L10-03':(0,4,1,1,2,3,'1',2),
 'L10-04':(-60,60,10,-60,30,0,'J/K',2),
}
GROUPS={'state':list(DATA)[:6],'calorimetry':list(DATA)[6:13],
        'first-law':list(DATA)[13:20],'paths':list(DATA)[20:28],'entropy':list(DATA)[28:]}
# Manual operations explicitly solve both ACTUAL questions, not all possible
# unrelated exercises. Ordinary division/multiplication is sufficient; noninteger
# inputs below are literal decimals accepted by the Number-only grader.
MANUAL={
 'L01-01':'20+10·6=80; 20+10·4=60 cm³. A·s has cm³.',
 'L01-02':'(4/10)·400=160; (4/10)·350=140 kPa.',
 'L01-03':'120/4=30; 120/3=40 kPa.',
 'L01-04':'50+273.15=323.15; 25+273.15=298.15 K. Temperature differences use equal K/°C sizes.',
 'L02-01':'240/6=40; 240/(9/2)=160/3=53+1/3. Long division: 53.33 kPa has relative error1/16000.',
 'L02-02':'(5/2)·160=400; (5/2)·130=325 K.',
 'L03-01':'50·8=400; 50·6=300 J.',
 'L03-02':'(4/10)·250=100; (4/10)·175=70 J/K. c=400 J/(kg·K).',
 'L03-03':'8314·10/1000=83.14; 8314·11/1000=91.454 J. These use assigned rounded working R, not an exact SI assertion.',
 'L03-04':'Equal200g masses give(80+20)/2=50; (80·175+4000)/375=18000/375=48°C.',
 'L04-01':'16700/334=50; 18370/334=55g (334·55=18370). Clock1.67kJ/s yields5g/s until100g.',
 'L04-02':'(226/100)·3=6.78; (226/100)·0=0 kJ. Negative mass change means condensation/heat leaving water.',
 'L04-03':'(19000−2000)/340=50; (28000−2000)/340=1300/17g. Long division76.47g, error1/130000.',
 'L05-01':'0.2W·m/(0.05m)=4W; 20/4.5=40/9=4.444...W. Literal4.444 is within0.5%.',
 'L05-02':'42·3=126;42·(5/2)=105W. g/s timesJ/g isJ/s.',
 'L05-03':'Scale T by100K: P/A=5.67[(T/100)^4−81]. 4^4=256 gives5.67·175=992.25. (7/2)^4=2401/16; difference1105/16;567·1105/1600=626535/1600=391.584375. Literal391.6 accepted. All integer products/long division; no log/calculator.',
 'L06-01':'30−10=20;15−10=5J.',
 'L06-02':'12·20=240;12·6=72J. Signs denote gain/loss.',
 'L06-03':'10+20=30;10+5=15J. Work by gas positive.',
 'L06-04':'100·1.5=150;100·0.5=50J sincekPa·L=J.',
 'L07-01':'N2:100/3+100/4=175/3, enter58.33. N6:100(1/7+1/8+1/9+1/10+1/11+1/12)=452675/6930. Long divide each summand to nearest.01:14.29+12.50+11.11+10+9.09+8.33=65.32; six errors ≤.005 bound.03<.005·65.32. No numeric ln is required by either generated task.',
 'L07-02':'100/2=50;100/(11/4)=400/11=36.3636..., enter36.36kPa.',
 'L07-03':'400/2=200;350/2=175kPa.',
 'L07-04':'400/100=4;350/100=3.5L.',
 'L07-05':'100/(4√4)=12.5;100/[(5/2)√(5/2)]=8√10. Manual bound3.16²=9.9856<10<10.0489=3.17² gives25.28<8√10<25.36. Decimal25.3 is within0.06/25.28<0.5%. Exact radical text is NOT accepted by Number; literal25.3 is.',
 'L08-01':'60·2=120;60·1.5=90J. Clockwise work positive.',
 'L08-02':'100−80=20;100−60=40J. ΔUcycle=0.',
 'L08-03':'20·5=100;20·4=80J. Counts discrete integers.',
 'L09-01':'(3/2)·60=90;(3/2)·40=60J. Min work.5Qc; reversible reservoirratio450/300.',
 'L09-02':'3·150/10=45;3·100/10=30J. η.3≤Carnot.5, rejected heat.7Qh.',
 'L09-03':'40/100·100=40;25/100·100=25%. Qh fixed100J.',
 'L09-04':'100(1−400/500)=20;100(1−375/500)=25%. At500K bound0 degenerates.',
 'L10-01':'60/300=1/5=.2;0/300=0J/K. Subsystem may lose entropy.',
 'L10-02':'90(1/300−1/600)=90/600=.15;60/600=.1J/K.',
 'L10-03':'Choose2of4:4·3/2=6; choose3of4=4. No log value is asked.',
 'L10-04':'30/600=.05;0/600=0J/K. Negative control is explicitly hypothetical, not a spontaneous isolated process.',
}
INPUTS={
 'L01-01':('80','60'),'L01-02':('160','140'),'L01-03':('30','40'),
 'L01-04':('323.15','298.15'),'L02-01':('40','53.33'),'L02-02':('400','325'),
 'L03-01':('400','300'),'L03-02':('100','70'),'L03-03':('83.14','91.454'),
 'L03-04':('50','48'),'L04-01':('50','55'),'L04-02':('6.78','0'),
 'L04-03':('50','76.47'),'L05-01':('4','4.444'),'L05-02':('126','105'),
 'L05-03':('992.25','391.6'),'L06-01':('20','5'),'L06-02':('240','72'),
 'L06-03':('30','15'),'L06-04':('150','50'),'L07-01':('58.33','65.32'),
 'L07-02':('50','36.36'),'L07-03':('200','175'),'L07-04':('4','3.5'),
 'L07-05':('12.5','25.3'),'L08-01':('120','90'),'L08-02':('20','40'),
 'L08-03':('100','80'),'L09-01':('90','60'),'L09-02':('45','30'),
 'L09-03':('40','25'),'L09-04':('20','25'),'L10-01':('.2','0'),
 'L10-02':('.15','.1'),'L10-03':('6','4'),'L10-04':('.05','0')}
ASSUMPTIONS={
 'L01':'Closed fixed-mass gas; equilibrium state variables, absolute pressure and absoluteT. Celsius offset273.15 explicitly provided. Constant area; temperatures positive on full grid.',
 'L02':'Fixed amount ideal gas; Tfixed forinversepV, Vfixed forabsoluteT/p; parameters assigned not inferred from scene scaling.',
 'L03':'Constant heatcapacity, no phase changes/work forsolid; common water c, adiabatic negligible-capacity calorimeter; same endpoints forMayer n=1mol, no monatomic assumption required.',
 'L04':'Ice coexists atapproximately0°C atatmosphericpressure. Assigned latent heats334 and340J/g belong toseparate models. L04-03initialwarming2kJ, cap100g at36kJ; after that liquidwarms. Phase volumes schematic explicitly clockL04-01; evaporation masssign determines absorbedheat.',
 'L05':'Steady1Dconduction withfixedboundaryT; c=4.2J/(gK),ΔT10K convection; blacksurface inlarge300Ksurrounding, emissivity1, roundedworkingσ5.67e−8. Signed netflux not emission alone.',
 'L06':'Wpositive bygas;ΔU=Q−W; idealgas fixednCv12J/K; statevariation vsprocessheat/work; p100kPa, volumechange signed, actualvolume stayspositive (schematic startingcoordinate2.1 forcompression).',
 'L07':'L07-01constantT equilibrium endpoints with piecewiseconstant externalpressures; finiteRiemannsum lower than100ln2; integerN. L07-02isothermalfixedn, L07-03constantV, L07-04quasistaticconstantp; L07-05explicitreversibleadiabatic idealgasγ1.5, Q0alone wouldnot suffice. Driven40s ismodelpath not microscopic dynamics.',
 'L08':'Clockwisecyclearea positive, ΔUcycle0; noabsolute reservoirT assigned forL08-02so Carnot feasibility cannotbe inferred beyondenergybalance; counts discrete. Zero-width cycle isdegenerate.',
 'L09':'Reversiblefridge300/450K; engines600/300K withη≤.5; CarnotTh500K,Tc250..500K, equality meansnowork. Zeroheat isdegenerate control, nevercompute0/0measuredηorCOP.',
 'L10':'ΔSstate computed alongreversible300Kpath; reservoirs600/300K; fourdistinguishableindependentparticles twoequiprobablehalves; negative signedheatL10-04 explicitly hypothesis requiringexternalinteraction, notspontaneousisolatedtransfer.',
}

def sha(b):return hashlib.sha256(b).hexdigest()
def digest(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def rat(v):return F(str(v))
def close(v,w):return type(v) in (int,float) and math.isfinite(v) and math.isclose(v,float(w),rel_tol=1e-10,abs_tol=1e-9)
@lru_cache(maxsize=20000)
def exact(key,x):
    import sympy as S
    x=S.Rational(str(x))
    # Derived before engine reading, equivalent fractions retained exactly.
    laws={'L01-01':lambda:20+10*x,'L01-02':lambda:2*x/5,'L01-03':lambda:120/x,
      'L01-04':lambda:x+S.Rational(5463,20),'L02-01':lambda:240/x,'L02-02':lambda:5*x/2,
      'L03-01':lambda:50*x,'L03-02':lambda:2*x/5,'L03-03':lambda:S.Rational(4157,500)*x,
      'L03-04':lambda:(80*x+4000)/(x+200),'L04-01':lambda:500*x/167,
      'L04-02':lambda:113*x/50,'L04-03':lambda:S.Min(100,S.Max(0,50*(x-2)/17)),
      'L05-01':lambda:20/x,'L05-02':lambda:42*x,'L05-03':lambda:S.Rational(567,10**10)*(x**4-300**4),
      'L06-01':lambda:x-10,'L06-02':lambda:12*x,'L06-03':lambda:10+x,'L06-04':lambda:100*x,
      'L07-01':lambda:sum(S.Rational(100,int(x)+j) for j in range(1,int(x)+1)),
      'L07-02':lambda:100/x,'L07-03':lambda:x/2,'L07-04':lambda:x/100,
      'L07-05':lambda:100/(x*S.sqrt(x)),'L08-01':lambda:60*x,'L08-02':lambda:100-x,
      'L08-03':lambda:20*x,'L09-01':lambda:3*x/2,'L09-02':lambda:3*x/10,
      'L09-03':lambda:x,'L09-04':lambda:100-x/5,'L10-01':lambda:x/300,
      'L10-02':lambda:x/600,'L10-03':lambda:S.binomial(4,x),'L10-04':lambda:x/600}
    return laws[key]()

DISCRETE={'L07-01','L08-03','L10-03'}
DRIVEN={'L04-01','L04-03','L07-02','L07-03','L07-04','L07-05'}
CLOCKS=DRIVEN|{'L05-02'}
def clock(key,x,t):
    x,t=rat(x),rat(t)
    if key=='L05-02':return 10,x,x*t
    duration=x*100/167 if key=='L04-01' else x/2 if key=='L04-03' else F(40)
    if key in ('L04-01','L04-03'):u=min(x,t*(F(167,100) if key=='L04-01' else 2))
    else:
        start=300 if key in ('L07-03','L07-04') else 1
        u=start+(x-start)*t/40
    return duration,u,exact(key,u)

def secondary(key,x,y,x0,unit):
    import sympy as S
    x=S.Rational(str(x))
    special={
      'L02-01':lambda:('Prodotto pV',240,'kPa·L'),
      'L04-01':lambda:('Temperatura nella coesistenza',0,'°C'),
      'L04-03':lambda:('Temperatura del campione',-10+5*x if x<2 else 0 if x<=36 else (x-36)*S.Rational(50,21),'°C'),
      'L06-02':lambda:('Lavoro di volume',0,'J'),
      'L07-01':lambda:('Lavoro reversibile limite',100*S.log(2),'J'),
      'L07-05':lambda:('Pressione isoterma di confronto',100/x,'kPa'),
      'L08-02':lambda:('Variazione di U nel ciclo',0,'J'),
      'L09-01':lambda:('Lavoro minimo fornito',x/2,'J'),
      'L09-02':lambda:('Calore ceduto',7*x/10,'J'),
      'L10-03':lambda:('Entropia in unità kB',S.log(y),''),
      'L10-04':lambda:('I due serbatoi isolati','Verso impossibile' if y<0 else 'Verso spontaneo' if y>0 else 'Nessuno scambio',''),
    }
    return special[key]() if key in special else ('Variazione dal riferimento',y-exact(key,x0),'' if unit=='1' else unit)

def fmt(x,unit):
    x=rat(x)
    s=str(x.numerator) if x.denominator==1 else format(float(x),'.12g').replace('.',',')
    return s+(' '+unit if unit!='1' else '')

def geometry_observations(key,elements,x):
    observations=[]
    if key=='L01-04':
        bulbs=[e for e in elements if e['kind']=='ball' and e.get('alpha',1)==1]
        rods=[e for e in elements if e['kind']=='rod' and e.get('alpha',1)==1]
        for bulb in bulbs:
            for rod in rods:
                # Upper planar endcap, not an assumption about whole cone/pixels.
                end=rod['b'];p=bulb['p'];rad=rod['r']
                if end[0]==p[0] and end[2]==p[2] and (end[1]-p[1])**2+rad**2<bulb['r']**2:
                    observations.append({'code':'THERMOMETER_TOP_CAP_CONTAINED','input':x,'tip':end,'rodRadius':rad,'bulbCenter':p,'bulbRadius':bulb['r'],'limit':'Opaque3Dgeometriccontainment; noactualUI/fallbackpixelsobserved.'})
    for a in elements:
        if a['kind']!='arrow':continue
        for e in elements:
            if e['kind']!='box' or e.get('alpha',1)!=1:continue
            if all(abs(a['b'][i]-e['p'][i])<e['size'][i]/2-1e-9 for i in range(3)):
                observations.append({'code':'ARROW_TIP_INSIDE_OPAQUE_BOX','input':x,'a':a['a'],'tip':a['b'],'boxCenter':e['p'],'boxSize':e['size'],'limit':'Tipinsideonly; NOT wholeconecontainment orfallback/nativeUIclaim.'})
    return observations

def compare(group,proof,sources):
    keys=GROUPS[group];rows=proof.get('records',[])
    ids=['SIM-C3-'+k for k in keys]
    if len(rows)!=len(ids) or {r.get('id') for r in rows}!=set(ids):raise ValueError('Missing/duplicate/foreignC3IDs')
    result=[]
    for row in rows:
        key=row['id'][7:];src=sources[row['id']];lo,hi,step,x0,x1,tr,unit,pred=DATA[key]
        lo,hi,step,x0,x1,tr=map(rat,(lo,hi,step,x0,x1,tr))
        errors=[];observations=[];count=int((hi-lo)/step)+1
        if row.get('sourceRecord')!=src or row.get('sourceVersion')!=1:errors.append('Source/versionidentitydrift')
        params=row.get('params',[])
        if len(params)!=1 or params[0].get('key')!='x' or params[0].get('label')!=src['control']['label'] or params[0].get('unit')!=('' if src['control']['unit']=='1' else src['control']['unit']) or any(not close(params[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Control/default/gridchanged')
        if row.get('prediction',{}).get('correct')!=pred or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction/distractorchanged')
        cl=row.get('clock')
        if key in CLOCKS and cl:
            label=('Massa già fusa' if key in ('L04-01','L04-03') else 'Massa passata alla sezione' if key=='L05-02' else 'Volume nell’istante scelto' if key=='L07-04' else 'Pressione nell’istante scelto')
            cu='g' if key in ('L04-01','L04-03','L05-02') else 'L' if key=='L07-04' else 'kPa'
            if cl.get('label')!=label or cl.get('unit')!=cu or cl.get('clockUnit')!='s' or cl.get('input',False) is not False or cl.get('pace')!=(5 if key.startswith('L07') else 1):errors.append('Clocklabels/units/pacewrong')
        if bool(cl)!=(key in CLOCKS) or bool(cl and cl.get('finalReading'))!=(key in DRIVEN):errors.append('Clockmodechanged')
        cases=row.get('cases',[])
        if len(cases)!=count:errors.append('Incompletegrid')
        for i,c in enumerate(cases):
            x=lo+i*step;y=exact(key,x)
            if not close(c.get('x'),x) or not close(c.get('solve',{}).get('y'),y):errors.append('Installedscalarwrong')
            def check_readings(rr,t=0):
                label=src['measure']['label']+(' (a fine prova)' if key in DRIVEN else '')
                if len(rr)!=(4 if key in CLOCKS else 3) or rr[0][0]!=src['control']['label'] or not close(rr[0][1],x) or rr[0][2]!=('' if src['control']['unit']=='1' else src['control']['unit']):errors.append('Inputreadingwrong')
                if rr[1][0]!=label or not close(rr[1][1],y) or rr[1][2]!=('' if unit=='1' else unit):errors.append('Outputreading/unitwrong')
                want=secondary(key,x,y,x0,unit)
                valueok=rr[2][1]==want[1] if isinstance(want[1],str) else close(rr[2][1],want[1])
                if rr[2][0]!=want[0] or not valueok or rr[2][2]!=want[2]:errors.append('Secondaryreadingwrong')
                if key in CLOCKS and (not close(rr[-1][1],clock(key,x,t)[2]) or rr[-1][0]!=cl['label'] or rr[-1][2]!=cl['unit']):errors.append('Instantaneoussignalwrong')
            check_readings(c['readings'])
            if len(c.get('steps',[]))!=4:errors.append('Fourstagesmissing')
            gs=c.get('graphs',[]);dur=clock(key,x,0)[0] if key in CLOCKS else None
            if len(gs)!=1+int(key in CLOCKS and dur>0)+int(key=='L09-04'):errors.append('Graphcountwrong')
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
                    if not close(frame.get('time'),t) or not close(frame.get('input'),x) or not close(frame.get('instantPhysicalInput'),u) or not close(frame.get('solve',{}).get('y'),y) or not close(frame.get('signal'),sig):errors.append('Clockframewrong')
                    check_readings(frame['readings'],t)
                    observations.extend(geometry_observations(key,frame['elements'],float(x)))
                if dur>0:
                    points=gs[-1]['series'][0]['points']
                    if len(points)!=161 or any(not close(v,clock(key,x,t)[2]) for t,v in points):errors.append('Timegraphwrong')
            if key=='L09-04':
                series=gs[1]['series'];ratio=float(x/500);gamma=F(5,3)
                if len(series)!=4:errors.append('Carnotlegswrong')
                else:
                    for j,s in enumerate(series):
                        for v,p in s['points']:
                            const=(p*v if j in (0,2) else p*v**float(gamma))
                            want=(1,1.6**(2/3),ratio,1)[j]
                            if not close(const,want):errors.append('Carnotpathinvariantwrong')
                    for j in range(4):
                        p=series[j]['points'][-1];q=series[(j+1)%4]['points'][0]
                        if any(not close(a,b) for a,b in zip(p,q)):errors.append('Carnotnotclosed')
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
        result.append({'id':row['id'],'sourceVersion':1,'sourceSha256':digest(src),
            'sourceMathAndActualTasksOk':not errors,'errors':sorted(set(errors)),
            'gridCount':count,'clockSampleCount':sum(len(c['clockSamples']) for c in cases),
            'actualTasks':taskresults,'manualProcedure':MANUAL[key],
            'assumptionsAndDomain':ASSUMPTIONS[key[:3]],
            'consumerCodeGeometryOk':not observations,'geometryObservations':observations,
            'checkedGeometryScope':'AllcollectedarrowtipXYZvsopaqueboxes;thermometerupperendcapvsbulb. Notfullglyphs/meshtriangles/camera/raster/labels/fallback. No3DUIobserved.',
            'SourceScientificFailure':None if not errors else 'Seeexpliciterrors',
            'CodeGeometryFailure':[o['code'] for o in observations],
            'ManualityFailure':any(not t['literalAcceptedByNumericRule'] for t in taskresults),
            'UI_Observed':False,
            'manualityScope':'Independentreviewerderivedhandprocedureforbothactualtasks;notastudentperformancecalibrationorclaimthesourcealreadyteachesallbounds.',
            'studentTaskScope':'Two actual generated numeric questions; predictiondistractors independently checked; bounds/extraoracles are reviewerprobes not assignedstudenttasks.',
            'sourceJudgment':'PASS_MATH_ONLY' if not errors else 'FAIL_MATH_OR_CODE',
            'consumerJudgment':'FAIL_CODE_GEOMETRY' if observations else 'PARTIAL_NO_FAILURE_FOUND_IN_CHECKED_CODE',
            'UI':'NOT_RUN','visualReview':'NOT_RUN','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return result


def report(group):
    from .runtime_fingerprint import runtime_fingerprint
    if group not in GROUPS:raise ValueError('Unbounded/unknownC3group')
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Runtimeepochchanged')
    if sha((APP/PRIMARY).read_bytes())!=PRIMARY_SHA:raise ValueError('Primarychanged')
    raw=subprocess.check_output(['git','show',REF+':'+SOURCE],cwd=APP)
    if sha(raw)!=SOURCE_SHA:raise ValueError('Sourcechanged')
    sources={r['id']:r for r in json.loads(raw)}
    if len(sources)!=36 or set(sources)!={'SIM-C3-'+k for k in DATA}:raise ValueError('C3sourceidentitysetchanged')
    path='editorial/reviews/C3-'+group+'-installed-code-1a35-20261125.json'
    blob=(APP/path).read_bytes()
    if sha(blob)!=PROOFS[group]:raise ValueError('Installedproofchanged')
    proof=json.loads(blob)
    deps={p:sha((APP/p).read_bytes()) for p in (PROTOCOL,WRAPPER,MESH_PROOF,MESH_PROTOCOL,str(Path(__file__).relative_to(APP)))}
    if deps[MESH_PROOF]!=MESH_SHA:raise ValueError('Meshsupplementchanged')
    mesh=json.loads((APP/MESH_PROOF).read_bytes())
    if mesh.get('runtimeSha256')!=RUNTIME or mesh.get('protocolSha256')!=deps[MESH_PROTOCOL] or any(sha((APP/p).read_bytes())!=h for p,h in mesh.get('dependencies',{}).items()):raise ValueError('Meshsupplementprovenancechanged')
    if proof.get('sourceRef')!=REF or proof.get('sourcePath')!=SOURCE or proof.get('sourceFileSha256')!=SOURCE_SHA or proof.get('group')!=group or any(proof.get(k)!=RUNTIME for k in ('runtimeProfileBefore','runtimeProfileAfter')) or proof.get('protocolSha256')!=deps[PROTOCOL] or proof.get('collectorWrapperSha256')!=deps[WRAPPER] or proof.get('UI')!='NOT_RUN' or proof.get('scientificApproval') is not False or proof.get('terminalStatus')!='COMPLETED_CODE_COLLECTION_ONLY':raise ValueError('Provenance/dispositionmismatch')
    if [p['acceptedFinite'] for p in proof.get('numericParserProbes',[])]!=[False,False,False,True,True]:raise ValueError('Numericparserprobesmissing')
    records=compare(group,proof,sources)
    for r in records:r['reviewDependencySha256']=deps
    return {'phase':'ORIGINAL_SOURCE_MATH_INSTALLED_CODE_PARTIAL_NOT_REGISTRABLE','group':group,
      'sourceRef':REF,'sourcePath':SOURCE,'sourceFileSha256':SOURCE_SHA,'runtimeSha256':RUNTIME,
      'primaryPath':PRIMARY,'primarySha256':PRIMARY_SHA,'proofPath':path,'proofSha256':sha(blob),
      'disclosure':'Prior thermal lesson/example andsharedclockreading; notfullyblinded.36sourceonlyprimaryfrozenbeforeC3model/newsolutionfields.',
      'records':records,'sourceMathPassCount':sum(r['sourceMathAndActualTasksOk'] for r in records),
      'consumerCodeFailIds':[r['id'] for r in records if not r['consumerCodeGeometryOk']],
      'UI':'NOT_RUN','overallComplete':False,'ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','localOnly':True,'remoteDispatch':False}


def dimensional_checks():
    import pint
    u=pint.UnitRegistry()
    tests=[('pV',1*u.kilopascal*u.liter,u.joule),('heatcapacity',400*u.joule/u.kg/u.kelvin*250*u.gram,u.joule/u.kelvin),
      ('conduction',1*u.watt/u.meter/u.kelvin*.01*u.meter**2*20*u.kelvin/(4.5*u.centimeter),u.watt),
      ('convection',2.5*u.gram/u.second*42*u.joule/u.gram,u.watt),
      ('latent',18.37*u.kilojoule/(334*u.joule/u.gram),u.gram),
      ('Mayer',1*u.mole*8.314*u.joule/u.mole/u.kelvin*11*u.kelvin,u.joule),
      ('entropy',30*u.joule/(600*u.kelvin),u.joule/u.kelvin),
      ('radiation',5.67e-8*u.watt/u.meter**2/u.kelvin**4*((350*u.kelvin)**4-(300*u.kelvin)**4),u.watt/u.meter**2)]
    return [{'name':name,'magnitude':q.to(target).magnitude,'unit':str(target),'ok':True} for name,q,target in tests]
