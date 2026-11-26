"""Independent partial review of eight manual-support DRAFT experiments.

No authoring imports. Original failures/gaps and UI_NOT_RUN are retained. The
candidate text/math/figure result is deliberately not full activity acceptance.
"""
from fractions import Fraction
from pathlib import Path
import json,math,os,re,subprocess
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH='experiments-manual-support-revision-263'
PRIMARY_DIR='editorial/reviews/manual-experiments-eight-primary-20261125'
REVIEW_DIR='editorial/reviews/experiments-manual-support-263-independent-20261125'
PRIMARY_SHA='9c55e3d05dfe1d093f227bb03a142fb1d510d7015aa6bffa55352091c371c1ea'
INPUT_SHA='8fdfbe4be78939411e5e83c0dfc9c82d6e238c68309f2bd501b9ab946e0d41fd'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
# Filled only after the final separate-author correction has been read.
REVIEWED_REVISIONS={'SIM-C3-L07-05': '31a6e90dad133f6a0e102bca1cead75088a8be5bb037277409dd8cafdfbe5888', 'SIM-C4-L09-02': 'a6d23eab75bbdc13209ec3c1b3bd0ab7a6b4973ba5767dffeddaee806212c7ae', 'SIM-C5-L01-01': '7479bf9613c5cece878c1c673b94a785e79d0c7a046f5ee1f350ae63be7d7457', 'SIM-C5-L02-03': 'f96871d2c5f810614ef52ae7c777c883309d1345e51d35c37e541960b81f4cb0', 'SIM-C5-L03-02': '0bf0932bfcaafa1c17d061a7fd435aa7302282f0fea47c2e3574b98292cfbe16', 'SIM-C5-L07-02': '43237df88a7bf77a7ef819d28991c871b299ba86dfaa15c44354294ab2df150c', 'SIM-C5-L08-02': '6a796a3a01c80316bc0ca72d7256d2263083d385ae44a88f372e47c0847d6f33', 'SIM-C5-L09-02': 'de87edc4de84c794dfe18f6ac310a4cb027b053cc70da9f5c64ba3828656b9b2'}
READ_NATIVE_RENDER_SHA='0545e42b04af14c954668e162a4d589db48e3dbb2562d7edb142286e6c8095ea'
SPECS={
 'SIM-C3-L07-05':('C3',(Fraction(9,4),Fraction(4)),'kPa','adiabatic-manual-paths.svg'),
 'SIM-C4-L09-02':('C4',(Fraction(30),Fraction(90)),'µN','lorentz-manual-angles.svg'),
 'SIM-C5-L01-01':('C5',(Fraction(1,2),Fraction(1)),'cm','oscillator-manual-quarter-period.svg'),
 'SIM-C5-L02-03':('C5',(Fraction(1,4),Fraction(3,4)),'cm','travelling-wave-manual-probe.svg'),
 'SIM-C5-L03-02':('C5',(Fraction(1,2),Fraction(1)),'cm','interference-manual-half-full-path.svg'),
 'SIM-C5-L07-02':('C5',(Fraction(2),Fraction(3)),'%','beer-manual-successive-halves.svg'),
 'SIM-C5-L08-02':('C5',(Fraction(2),Fraction(4)),'1','decay-manual-expected-population.svg'),
 'SIM-C5-L09-02':('C5',(Fraction(30),Fraction(45)),'°','snell-manual-bounded-angles.svg')}
IDS=set(SPECS)
SI=pint.UnitRegistry(non_int_type=Fraction)


def primary_inputs():
    raw=(APP/PRIMARY_DIR/'input-projection.json').read_bytes()
    if sha(raw)!=INPUT_SHA:raise ValueError('Frozen independent input projection changed')
    exact=(APP/PRIMARY_DIR/'exact-primary.json').read_bytes()
    if sha(exact)!=PRIMARY_SHA:raise ValueError('Frozen independent primary changed')
    return json.loads(raw),json.loads(exact)


def source_records():
    inputs,_=primary_inputs();out={}
    for path,pin in inputs['sourceFileSha256'].items():
        raw=subprocess.check_output(['git','show',REF+':'+path],cwd=APP,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
        if sha(raw)!=pin:raise ValueError('Immutable source file changed')
        for row in json.loads(raw):
            if row['id'] in IDS:out[row['id']]=row
    if set(out)!=IDS:raise ValueError('Eight complete original sources required')
    return out


def exact_value(key,x):
    x=sp.Rational(str(x))
    if key=='SIM-C3-L07-05':return 100/x**sp.Rational(3,2)
    if key=='SIM-C4-L09-02':return 6*sp.sin(x*sp.pi/180)
    if key=='SIM-C5-L01-01':return 4*sp.cos(sp.pi*x)
    if key=='SIM-C5-L02-03':return 3*sp.sin(2*sp.pi*x)
    if key=='SIM-C5-L03-02':return 4*sp.Abs(sp.cos(sp.pi*x))
    if key=='SIM-C5-L07-02':return 100*2**(-x)
    if key=='SIM-C5-L08-02':return 64*2**(-x)
    if key=='SIM-C5-L09-02':return 180*sp.asin(sp.Rational(2,3)*sp.sin(x*sp.pi/180))/sp.pi
    raise ValueError('Unknown reviewed model')


def check(label,actual,expected):
    residual=sp.simplify(sp.sympify(actual)-sp.sympify(expected))
    return {'claim':label,'actualExact':str(actual),'expectedExact':str(expected),'residual':str(residual),'ok':residual==0}


def truth(label,value):return {'claim':label,'ok':bool(value)}


def independent_checks():
    r=sp.symbols('r',positive=True);theta=sp.symbols('theta',real=True)
    checks={k:[] for k in SPECS}
    expected={
     'SIM-C3-L07-05':(sp.Rational(800,27),sp.Rational(25,2)),
     'SIM-C4-L09-02':(3,6),'SIM-C5-L01-01':(0,-4),
     'SIM-C5-L02-03':(3,-3),'SIM-C5-L03-02':(0,4),
     'SIM-C5-L07-02':(25,sp.Rational(25,2)),'SIM-C5-L08-02':(16,4),
     'SIM-C5-L09-02':(180*sp.asin(sp.Rational(1,3))/sp.pi,180*sp.asin(sp.sqrt(2)/3)/sp.pi)}
    for key,(_,points,_,_) in SPECS.items():
        checks[key]=[check('independent selected point '+str(x),exact_value(key,x),y)for x,y in zip(points,expected[key])]
    checks['SIM-C3-L07-05'] += [
     check('adiabatic pressure-volume invariant',100/r**sp.Rational(3,2)*r**sp.Rational(3,2),100),
     check('temperature ratio at r9/4',(sp.Rational(800,27)/100)*sp.Rational(9,4),sp.Rational(2,3)),
     check('temperature ratio at r4',(sp.Rational(25,2)/100)*4,sp.Rational(1,2)),
     check('inverse positive volume ratio',(100/sp.Rational(25,2))**sp.Rational(2,3),4),
     check('manual decimal rounding error',sp.Rational('29.63')-sp.Rational(800,27),sp.Rational(1,2700)),
     truth('pressure decreases in positive-r expansion',sp.diff(100/r**sp.Rational(3,2),r).is_negative)]
    f=(SI.Quantity(2,'microcoulomb')*SI.Quantity(3,'m/s')*SI.Quantity(1,'tesla')).to('micronewton')
    checks['SIM-C4-L09-02'] += [check('SI Lorentz scale',f.magnitude,6),
     check('positive-charge right-hand direction',sp.Matrix([1,0,0]).cross(sp.Matrix([0,1,0]))[2],1),
     check('inverse field at30deg',sp.Rational(3,10**6)/(sp.Rational(2,10**6)*3*sp.Rational(1,2)),1),
     truth('inverse field undefined atparallel',sp.sin(0)==0),truth('nonzero5deg force',sp.sin(sp.pi/36)>0)]
    checks['SIM-C5-L01-01'] += [check('first opposite extreme inverse period',2*1,2),
     check('initial position',exact_value('SIM-C5-L01-01',0),4),check('return after period',exact_value('SIM-C5-L01-01',2),4)]
    checks['SIM-C5-L02-03'] += [check('inverse period from first positive maximum',4*sp.Rational(1,4),1),
     check('wavelength',2*sp.pi/sp.pi,2),check('positive propagation speed',2*sp.pi/sp.pi,2)]
    checks['SIM-C5-L03-02'] += [check('phasor squared magnitude atpi',2*2**2*(1+sp.cos(sp.pi)),0),
     check('phasor squared magnitude at2pi',2*2**2*(1+sp.cos(2*sp.pi)),16),
     check('second maximum atzero path',exact_value('SIM-C5-L03-02',0),4),
     truth('cancellation inverse unique in0..1',sp.solveset(sp.cos(sp.pi*r),r,domain=sp.Interval(0,1))==sp.FiniteSet(sp.Rational(1,2)))]
    checks['SIM-C5-L07-02'] += [check('25percent isquarter',SI.Quantity(25,'percent').to('').magnitude,sp.Rational(1,4)),
     check('12.5percent iseighth',SI.Quantity(Fraction(25,2),'percent').to('').magnitude,sp.Rational(1,8)),
     check('two successive multiplicative layers',sp.Rational(1,2)**2,sp.Rational(1,4))]
    checks['SIM-C5-L08-02'] += [check('inverse four half-lives',64/sp.Integer(4),2**4),
     check('constant lambda activity ratio',sp.Rational(4,64),sp.Rational(1,16)),
     truth('half-life ratio dimensionless',(SI.Quantity(1,'s')/SI.Quantity(1,'s')).dimensionless)]
    checks['SIM-C5-L09-02'] += [check('first exact target sine',sp.Rational(2,3)*sp.sin(sp.pi/6),sp.Rational(1,3)),
     check('second exact target sine',sp.Rational(2,3)*sp.sin(sp.pi/4),sp.sqrt(2)/3),
     check('inverse index from first sine',sp.Rational(1,2)/sp.Rational(1,3),sp.Rational(3,2)),
     truth('no low-to-high TIR for source range',sp.Rational(2,3)*sp.sin(80*sp.pi/180)<1)]
    return checks


def literal(text):
    text=text.replace('{,}','.').replace(',','.').replace('−','-').strip()
    if len(text)>60:return None
    if re.fullmatch(r'[+-]?\d+(?:\.\d+)?',text):return sp.Rational(text)
    match=re.fullmatch(r'\\frac\{([+-]?\d{1,6})\}\{(\d{1,6})\}',text)
    if match and int(match[2])!=0:return sp.Rational(int(match[1]),int(match[2]))
    if text==r'\frac{\sqrt2}{3}':return sp.sqrt(2)/3
    return None


def terminal_claim(row,prefix,expected):
    found=[]
    for block in row['blocks']:
        if block.get('type')!='formula' or not block['text'].startswith(prefix):continue
        term=block['text'].split('=')[-1]
        term=re.sub(r'\\mathrm(?:\{[^}]+\}|\s+[A-Za-z]+)', '',term).replace(r'\mu','').replace(r'\,','').strip()
        value=literal(term)
        if value is not None:found.append(value)
    return truth('read endpoint claim '+prefix,bool(found) and all(sp.simplify(v-expected)==0 for v in found))


def supplied_support_checks(row):
    key=row['id'];out=[]
    if key=='SIM-C3-L07-05':
        out += [terminal_claim(row,r'p=100\cdot',sp.Rational(800,27)),terminal_claim(row,'p(4)=',sp.Rational(25,2))]
        text=' '.join(b.get('text','')for b in row['blocks'])
        out.append(truth('division/rounding is supplied, not reviewer-only',all(x in text for x in ('27·29=783','resto 17','resto 8','resto 26','29.63'))))
    elif key=='SIM-C4-L09-02':
        out += [terminal_claim(row,r'F(30^\circ)=',sp.Integer(3)),terminal_claim(row,r'F(90^\circ)=',sp.Integer(6))]
    elif key=='SIM-C5-L01-01':
        out += [terminal_claim(row,r'x(0{,}5\,\mathrm s)=',sp.Integer(0)),terminal_claim(row,r'x(1\,\mathrm s)=',sp.Integer(-4))]
        out.append(truth('rotation is not falsely attributed to shown rectilinear figure',not any('Il disegno usa la proiezione' in b.get('text','')for b in row['blocks'])))
    elif key=='SIM-C5-L02-03':out += [terminal_claim(row,'y(0,1/4)=',sp.Integer(3)),terminal_claim(row,'y(0,3/4)=',sp.Integer(-3))]
    elif key=='SIM-C5-L03-02':out += [terminal_claim(row,r'A_{\rm risultante}(1/2)=',sp.Integer(0)),terminal_claim(row,r'A_{\rm risultante}(1)=',sp.Integer(4))]
    elif key=='SIM-C5-L07-02':
        formulas=[b['text']for b in row['blocks']if b['type']=='formula']
        out += [truth('two-layer percentage quantity equality',r'100\%\cdot\frac14=25\%' in formulas),
                truth('three-layer percent quantities are consistently labelled',any(f.startswith(r'100\%\cdot\frac18=') and r'\frac{25}{2}\%' in f and f.endswith(r'12{,}5\%') for f in formulas))]
    elif key=='SIM-C5-L08-02':out += [terminal_claim(row,r'\overline N(2T_{1/2})=',sp.Integer(16)),terminal_claim(row,r'\overline N(4T_{1/2})=',sp.Integer(4))]
    elif key=='SIM-C5-L09-02':out+=snell_support_checks(row)
    return out


def snell_support_checks(row):
    text=' '.join(b.get('text','')for b in row['blocks']);out=[]
    first=re.search(r'sin19,45°<(\d{1,6})/(\d{1,6}) e sin19,5°>(\d{1,6})/(\d{1,6})',text)
    second=re.search(r'(\d,\d{1,6})<√2<(\d,\d{1,6}), sin28,1°<(\d{1,6})/(\d{1,6}) e sin28,15°>(\d{1,6})/(\d{1,6})',text)
    if first is None or second is None:return [truth('complete learner-provided Snell bound data',False)]
    try:
        low=sp.Rational(int(first[1]),int(first[2]));high=sp.Rational(int(first[3]),int(first[4]))
        rootlow=sp.Rational(second[1].replace(',','.'));roothigh=sp.Rational(second[2].replace(',','.'))
        low2=sp.Rational(int(second[3]),int(second[4]));high2=sp.Rational(int(second[5]),int(second[6]))
    except (ValueError,ZeroDivisionError):return [truth('finite rational Snell support',False)]
    def sine_interval(deg):
        x=sp.Rational(deg)*sp.Rational(314159,100000)/180
        y=sp.Rational(deg)*sp.Rational(3927,1250)/180
        return x-x**3/6+x**5/120-x**7/5040,y-y**3/6+y**5/120
    out += [truth('given sin19.45 upper bound true',sine_interval('19.45')[1]<low),
            truth('given sin19.5 lower bound true',sine_interval('19.5')[0]>high),
            truth('first rational bracket contains1/3',low<sp.Rational(1,3)<high),
            truth('given square-root bounds true',0<rootlow and rootlow**2<2<roothigh**2),
            truth('given sin28.1 upper bound true',sine_interval('28.1')[1]<low2),
            truth('given sin28.15 lower bound true',sine_interval('28.15')[0]>high2),
            truth('second supplied rational chain',low2<rootlow/3<sp.sqrt(2)/3<roothigh/3<high2),
            truth('first angle bound ensures accepted0.05degree error',sp.Rational(1,20)<sp.Rational('19.45')/200),
            truth('second angle bound ensures accepted0.05degree error',sp.Rational(1,20)<sp.Rational('28.1')/200)]
    return out


def figure_checks(asset_root):
    result={}
    for key,(_,_,_,name) in SPECS.items():
        root=ET.parse(Path(asset_root)/name).getroot();panels=root.findall('{*}g');checks=[]
        checks.append(truth('three independently read native figure panels',len(panels)==3))
        if len(panels)!=3:result[key]=checks;continue
        def shapes(g,tag,color):return [e for e in g.findall('{*}'+tag)if e.get('fill')==color]
        if key=='SIM-C3-L07-05':
            widths=[sp.Rational(shapes(g,'rect','#dbeafe')[0].get('width'))for g in panels]
            checks += [check('volume widths use common90px perinitialvolume '+str(i),v,90*r)for i,(v,r)in enumerate(zip(widths,(1,sp.Rational(9,4),4)))]
        elif key=='SIM-C4-L09-02':
            for g,deg in zip(panels,(0,30,90)):
                origin=shapes(g,'circle','#ffedd5')[0];ox=float(origin.get('cx'));oy=float(origin.get('cy'))
                for color,length,angle in (('#172033',120,0),('#1d4ed8',140,deg)):
                    tip=shapes(g,'polygon',color)[0].get('points').split()[0];x,y=map(float,tip.split(','))
                    checks.append(truth('v/B constant own gain and direction '+str(deg)+color,abs(x-ox-length*math.cos(math.radians(angle)))<.002 and abs(y-oy+length*math.sin(math.radians(angle)))<.002))
        elif key=='SIM-C5-L01-01':
            for g,value in zip(panels,(4,0,-4)):
                rect=shapes(g,'rect','#ffedd5')[0];center=sp.Rational(rect.get('x'))+sp.Rational(rect.get('width'))/2
                checks.append(check('signed mass coordinate common45px/cm '+str(value),(center-320)/45,value))
        elif key=='SIM-C5-L02-03':
            for g,t in zip(panels,(0,.25,.75)):
                line=g.find('{*}polyline');points=[tuple(map(float,p.split(',')))for p in line.get('points').split()]
                err=max(abs((180-y)/20-3*math.sin(2*math.pi*t-math.pi*(x-155)/220))for x,y in points)
                checks.append(truth('entire travelling profile at time '+str(t),len(points)==101 and err<.000003))
        elif key=='SIM-C5-L03-02':
            for g,values in zip(panels,((2,2,4),(2,-2,0),(2,2,4))):
                for color,value in zip(('#1d4ed8','#9a3412','#047857'),values):
                    rect=shapes(g,'rect',color)
                    if value==0:checks.append(truth('zero resultant is explicitly zero, not nonzero bar',not rect));continue
                    e=rect[0];height=sp.Rational(e.get('height'));y=sp.Rational(e.get('y'))
                    checks.append(check('signed instantaneous bar common30px/cm '+str(value),height/30*(1 if y<190 else -1),value))
        elif key=='SIM-C5-L07-02':
            for g,value in zip(panels,(100,25,sp.Rational(25,2))):
                rect=shapes(g,'rect','#047857')[0]
                checks.append(check('intensity common1.5px perpercentagepoint '+str(value),sp.Rational(rect.get('height'))/sp.Rational(3,2),value))
        elif key=='SIM-C5-L08-02':
            for g,value in zip(panels,(64,16,4)):
                checks.append(check('expected population illustrated '+str(value),len(shapes(g,'circle','#047857')),value))
                checks.append(check('same64 illustrative slots',len(g.findall('{*}circle')),64))
        elif key=='SIM-C5-L09-02':
            for g,deg in zip(panels,(0,30,45)):
                poly=shapes(g,'polygon','#1d4ed8')[0];x,y=map(float,poly.get('points').split()[0].split(','));dx=x-325;dy=y-165
                sine=abs(dx)/math.hypot(dx,dy)
                checks.append(truth('raySnell sine ratio '+str(deg),dy>0 and y<270 and abs(sine-(2/3)*math.sin(math.radians(deg)))<.00001))
        result[key]=checks
    return result


def actual_questions(package):
    script=APP/REVIEW_DIR/'probe-effective-questions.mjs'
    p=subprocess.run(['node',str(script),'-','-'],cwd=APP,input=canonical_json(package),text=True,capture_output=True,timeout=60)
    if p.returncode:raise ValueError('Actual question producer/Number probe failed: '+p.stderr[-800:])
    return json.loads(p.stdout)


def canonical_json(value):return json.dumps(value,sort_keys=True,ensure_ascii=False,separators=(',',':'))


def dependency_hashes():
    names=['tools/corpus_engineering/experiments_manual_support_revision_verifier.py',
      'tools/corpus_engineering/review_contract.py','tools/corpus_engineering/pipeline.py','tools/corpus_engineering/runtime_fingerprint.py',
      PRIMARY_DIR+'/input-projection.json',PRIMARY_DIR+'/exact-primary.json',PRIMARY_DIR+'/derivations.json',
      'tests/corpus/test_experiments_manual_support_263.py',REVIEW_DIR+'/probe-effective-questions.mjs',REVIEW_DIR+'/render-native-assets.mjs',REVIEW_DIR+'/native-render.json']
    return {name:sha((APP/name).read_bytes())for name in names}


def verify(sources,package,bindings,asset_root=None):
    inputs,_=primary_inputs();originals={r['originalInputProjection']['id']:r for r in inputs['records']}
    if not IDS.issubset(sources):raise ValueError('Missing complete eight original sources')
    if package.get('schema')!='astra/1':raise ValueError('Expected astra/1 revision package')
    if any(a.get('mime')!='image/svg+xml' or a.get('name')not in {v[3]for v in SPECS.values()} for a in package.get('assets',[])):raise ValueError('Unreviewed uploaded asset metadata')
    rows=reviewed_rows(package,bindings,REVIEWED_REVISIONS,IDS,Path(asset_root or APP/'editorial/assets'))
    mathchecks=independent_checks();figurechecks=figure_checks(asset_root or APP/'editorial/assets');global_errors=[];profile=runtime_fingerprint(APP)['sha256']
    if profile!=RUNTIME:global_errors.append('Actual runtime differs from independently reviewed1a')
    native_raw=(APP/REVIEW_DIR/'native-render.json').read_bytes();native=json.loads(native_raw)
    if sha(native_raw)!=READ_NATIVE_RENDER_SHA:global_errors.append('Native asset proof differs from actually read images')
    native_by={r['asset'].split('/')[-1]:r for r in native.get('cases',[])}
    if set(native_by)!={v[3]for v in SPECS.values()}:global_errors.append('Incomplete native asset evidence')
    prior_raw=(APP/PRIMARY_DIR/'derivations.json').read_bytes()
    if sha(prior_raw)!='76041919b432f7936491e0593cf6fddf9e113b80ed28d4543a540a093ffcbe02':raise ValueError('Frozen original judgments/manual primary changed')
    prior=json.loads(prior_raw);prior_by={r['id']:r for r in prior['records']}
    all_errors={};checks_by={}
    for row,binding,signature,assets,errors in rows:
        key=row['id'];errors=list(errors)+global_errors;base=sources[key];spec=SPECS[key]
        if digest(base)!=originals[key]['originalRecordSha256']:errors.append('Original record hash differs from pre-candidate primary')
        if binding.get('sourceId')!=key or binding.get('sourceRef')!=REF or binding.get('sourceSha256')!=digest(base):errors.append('Original source provenance rebound')
        if type(row.get('version'))is not int or type(row.get('baseVersion'))is not int or row['version']!=2 or row['baseVersion']!=1:errors.append('Expected additive v2/base1')
        allowed={'title','summary','anchor','blocks','prerequisites','review','version','baseVersion','assessmentSelection','interpretation','transferPrompt'}
        if {k:v for k,v in row.items()if k not in allowed}!={k:v for k,v in base.items()if k not in allowed}:errors.append('Immutable original physics/control/reference changed')
        if not all(type(x)in(int,float)and math.isfinite(x)for x in row.get('assessmentSelection',{}).get('points',[])):errors.append('Finite numeric selection required, no booleans')
        if row.get('assessmentSelection')!={'schemaVersion':'1.0.0','points':[float(x)for x in spec[1]]}:errors.append('Selected pair differs from frozen primary')
        if row.get('kind')!='experiment' or 'answer'in row or row.get('measure',{}).get('unit')!=spec[2]:errors.append('Experiment kind or measured quantity changed')
        if set(assets)!={spec[3]}:errors.append('Wrong individually read asset')
        fig=native_by.get(spec[3],{})
        if fig.get('assetSha256')!=assets.get(spec[3]) or not fig.get('documentInfo',{}).get('complete'):errors.append('Native image not bound to final uploaded asset')
        png=APP/fig.get('png','MISSING')
        if not png.is_file()or sha(png.read_bytes())!=fig.get('pngSha256'):errors.append('Actually read native PNG missing or changed')
        checks=mathchecks[key]+supplied_support_checks(row)+figurechecks[key]
        if not checks or not all(c['ok']for c in checks):errors.append('Independent candidate mathematics/manual support failed')
        all_errors[key]=errors;checks_by[key]=checks
    actual=None
    if not any(all_errors.values()):
        actual=actual_questions(package)
        if actual.get('actualGeneratedQuestions')!=16 or len(actual.get('records',[]))!=8:global_errors.append('Incomplete actual generated questions')
        if runtime_fingerprint(APP)['sha256']!=profile:global_errors.append('Runtime changed during question probe')
    actual_by={r['id']:r for r in (actual or {}).get('records',[])};deps=dependency_hashes();out=[]
    for row,binding,signature,assets,_ in rows:
        key=row['id'];errors=all_errors[key]+global_errors;consumer=actual_by.get(key)
        if consumer:
            if consumer.get('unitsDuplicatedInPrompt'):errors.append('Duplicated input unit in delivered transfer prompt')
            for i,q in enumerate(consumer.get('questions',[])):
                expected=float(exact_value(key,SPECS[key][1][i]));got=q.get('value')
                if type(got)not in(int,float)or not math.isfinite(got)or abs(got-expected)>1e-10*max(1,abs(expected)):errors.append('Actual generated value differs from independent exact law')
                if q.get('unit')!=('numero puro'if SPECS[key][2]=='1'else SPECS[key][2]):errors.append('Actual question unit differs')
                if not all(q.get(k)for k in ('finiteManualEntryAccepted','commaEntryAccepted','displayNumberRoundtripAccepted','blankRejected','infiniteRejected')):errors.append('Actual Number/roundtrip behavior differs')
        else:errors.append('Fresh actual question producer not run because integrity/manual checks failed')
        text_ok=not errors
        out.append({'id':key,'sourceRef':REF,'sourcePath':'officina-di-fisica/content/esperienze-'+SPECS[key][0]+'.json',
         'sourceSha256':digest(sources[key]),'sourceVersion':1,'candidateSha256':digest(row),'candidateVersion':2,'baseVersion':1,
         'reviewedSignature':signature,'assetChecksums':assets,'reviewDependencySha256':deps,'runtimeProfileSha256':profile,
         'mode':'EXACT_ORACLE','candidateTextMathManualReview':{'ok':text_ok,'checks':checks_by[key],'errors':errors},
         'actualGeneratedQuestionReview':consumer,'originalPublishedEditionJudgmentPreserved':prior_by[key]['originalJudgmentPreserved'],
         'nativeFigureRead':{'reader':'AI_SEPARATE_FROM_AUTHOR','proofSha256':sha(native_raw),'assetBytesAndNativeImageUnchanged':not any('asset' in e.lower() or 'png' in e.lower() for e in errors)},'newProductUiReview':'NOT_RUN',
         'original129UiNotRunAreNotPromoted':True,'candidateState':'DRAFT','ok':False,
         'overallAcceptance':'NOT_GRANTED_UI_AND_EXISTING_CONSUMER_GATES_REMAIN_OPEN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return out


def report(sources,package,bindings,asset_root=None):
    records=verify(sources,package,bindings,asset_root)
    return {'schemaVersion':'1.0.0','phase':'DRAFT_TEXT_MATH_MANUAL_AND_FIGURE_REVIEW_ONLY_NOT_ACTIVITY_ACCEPTANCE',
     'records':records,'candidateTextMathManualPassCount':sum(r['candidateTextMathManualReview']['ok']for r in records),
     'sourceRef':REF,'independentPrimarySha256':PRIMARY_SHA,'humanApproval':'NOT_RUN','publicationAction':'NONE',
     'newUiCases':0,'activityCredit':0,'overallAcceptanceGranted':False,
     'limits':'Original failures/gaps remain nested and unchanged. Existing Lorentz/Snell consumer geometry is NOT repaired by these text editions. No product UI was executed; native SVG rasterization is figure reading only. The139-partial inventory and129 UI_NOT_RUN remain uncredited.'}
