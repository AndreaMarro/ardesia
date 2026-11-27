"""Independent original047 science/manual/installed-consumer review. No author imports."""
from pathlib import Path
from fractions import Fraction
import json, math, subprocess
import sympy as sp
import pint
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C2.json'
SOURCE_FILE_SHA256='33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1'
BATCH='experiments-pressure-hydrostatics-047'
READ_SOURCE_SHA256={'SIM-C2-L001-01': '62d5e54b6ef6ab079e8dc48e0772df3349ce0d3c7153a2dd229f3beb8520073b', 'SIM-C2-L001-02': '98fe4067a10e28ae9abd8d94f67a611b6ede0b453fdbdac7414091c595ebbcef', 'SIM-C2-L001-03': '78084f0d65eadcfea0a9b93dd043fbcc25a20a1b39c14bfc15a2c29c0cb4e6ae', 'SIM-C2-L001-04': '9f26f80ffa3441925c41497c73f043baf07d624d5cadcafc2f0e43da17614d0f', 'SIM-C2-L001-05': '4ad7ee8bb05309e37052c43fcdb7a687ef4184d0f2c42e7a64d180b659de8234', 'SIM-C2-L002-01': '39b198952767ed38a2e5fa8dd81fd439fa8a7c0334ae1aaf08054629bb8f4abb', 'SIM-C2-L002-02': 'c1796958ce9c149c706ec657215910a75a615e03c981646a7bedd1121435983b', 'SIM-C2-L002-03': 'c2be7516d571aa319bb70077386c4d915ed29409885a5a9d09aca460a27abf09', 'SIM-C2-L002-04': '6931192982208a0aad15a657d2fbcafa7d40a727a951e25fda05f1ddee372c24', 'SIM-C2-L003-01': '94028905ba7c74aceb6579da0400b5b3f89e923d3ef093d0a897379df752d79a'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/assessment-selection.js': '2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/modelli/C2.js': 'a2bfb8da7c5f2ab29cd5afdd724e62192c7bd3cc5feea46e5b05f3b025561ea2', 'static/js/banchi/voci/apparati/fluidi.js': '02113df5c60acc56c8a75b0c83afd0d9e3dfa39809848df4197ba50e3f823eb5', 'static/js/banchi/voci/apparati/meccanica.js': '9be7ce68847af3d901374e98c7511921d6177d939c547e9b03f2c07a0ebd857d', 'static/js/banchi/voci/confronti.js': '83f1ab0d443dc93eb72c0318e32856179486643257c5bbf136e686464fdc6c39', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/legende.js': 'eb303ca6a6013377462b51c92b541a650ee2686257cd7e4ee39fea5221a521f7', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967'}
READ_RUNTIME_PROFILE_SHA256='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
READ_BROWSER_PROOF_SHA256='1706fbb58be195a147592df01990f9b3e15fc19f92afd4ca25c776547fd0bbb2'
READ_BROWSER_PROTOCOL_SHA256='80dc3aaab13f04631bc8e666edc7bc428e9f488c3ff77140202a84b7264424ef'
READ_VISUAL_MANIFEST_SHA256='52e9a21ce5eeafd29d3e15891ca30382e97622e6639da22b6c0c5a8addd2635d'
SI=pint.UnitRegistry(non_int_type=Fraction)
# min,max,step,first reference,comparison task,actual middle-unused transfer,SI output unit
SPECS={
'SIM-C2-L001-01':(1,3,1,1,3,2,'cm^3'),
'SIM-C2-L001-02':(0,8,1,2,6,4,'Pa'),
'SIM-C2-L001-03':(1,8,1,2,6,5,'g'),
'SIM-C2-L001-04':(1,10,1,2,5,7,'kPa'),
'SIM-C2-L001-05':(70,110,2,80,100,90,'kPa'),
'SIM-C2-L002-01':(0,3,.25,1,2,1.5,'kPa'),
'SIM-C2-L002-02':(0,3,.25,0,2,1.5,'kPa'),
'SIM-C2-L002-03':(68,108.8,1.36,68,102,88.4,'cm'),
'SIM-C2-L002-04':(-2,2,.2,-1,2,0,'cm'),
'SIM-C2-L003-01':(0,10,1,2,6,5,'N')}
SOURCE_ISSUES={'SIM-C2-L002-01':'Original version1 transfer explicitly requires g=10m/s², but substitution/reference/installed law and answer use9.81. At actual transfer1.5m physics requires15kPa; grader rejects15 and accepts14.715. The comparison question itself refers to the9.81-model readout and is not independently claimed to specify g10.'}
VISUAL_ISSUES={
'SIM-C2-L001-02':'At native upper-plate velocity6cm/s, top green shaft/tip lie inside the opaque upper plate: arrowY1.4575, plateY1.3875..1.5275. Cone rims can protrude slightly; no whole-cone containment claim. Actual native PNG shows only the lower four nonzero layer arrows. Fallback comparison retained.',
'SIM-C2-L001-05':'Native320 opaque Sonda sprite completely covers left probe; Superficie also covers atmospheric-force tip at70..100kPa. At110 tip leaves that rectangle; only probe/partial-shaft claim retained there. Scalar absolute/relative pressure model remains correct.',
'SIM-C2-L002-01':'Native320 Sonda sprite completely covers left probe; scalar-pressure conflict is separately a source task inconsistency, not inferred from drawing.',
'SIM-C2-L002-02':'Native320 Sonda sprite completely covers left probe, undermining the delivered equal-quota two-probe comparison. Right probe and equal-level line remain; no claim that the whole tank disappears.',

'SIM-C2-L003-01':'Native320 and1280: at2kPa A1 sprite covers red force tip; at10kPa4A1 sprite covers green tip. Force law2xN remains correct. This finding concerns actual label occlusion, not an unsupported inference of common force-glyph calibration.'}


def exact_value(key,x):
    x=sp.Rational(str(x));return {
    'SIM-C2-L001-01':lambda:sp.Integer(6)/{1:sp.Integer(1),2:sp.Rational(4,5),3:sp.Rational(1,10)}[int(x)],
    'SIM-C2-L001-02':lambda:x/2,'SIM-C2-L001-03':lambda:sp.Rational(5,2)*x,
    'SIM-C2-L001-04':lambda:100/x,'SIM-C2-L001-05':lambda:x+10,
    'SIM-C2-L002-01':lambda:sp.Rational(981,100)*x,
    'SIM-C2-L002-02':lambda:10*(3-x),'SIM-C2-L002-03':lambda:sp.Rational(25,34)*x,
    'SIM-C2-L002-04':lambda:10*x,'SIM-C2-L003-01':lambda:2*x}[key]()


def assigned_value(key,index):
    # Preserve the actual contradiction: requested g10, not model g9.81.
    if key=='SIM-C2-L002-01' and index==1:return sp.Integer(15)
    return exact_value(key,SPECS[key][4+index])


def check(claim,actual,expected,unit='',scope='independent_exact_physics'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},'residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    R=sp.Rational;Q=SI.Quantity;x,h,rho,g,p,A=sp.symbols('x h rho g p A',positive=True);z=sp.Symbol('z',real=True)
    out={}
    literals=[(60,R(15,2)),(3,2),(15,R(25,2)),(20,R(100,7)),(110,100),(R(981,50),15),(10,15),(75,65),(20,0),(12,10)]
    for (key,s),values in zip(SPECS.items(),literals):
        out[key]=[check(label,assigned_value(key,i),want,s[-1],'actual_assigned_manual_calculation') for i,(label,want) in enumerate(zip(('first actual assessment derived independently','generated transfer derived independently'),values))]
    out['SIM-C2-L001-01'] += [check('6g/gasdensity gives60cm3',Q(6,'g')/Q(R(1,10),'g/cm^3'),60,'cm^3'),check('6g/liquiddensity gives15over2cm3',Q(6,'g')/Q(R(4,5),'g/cm^3'),R(15,2),'cm^3'),*[check('phase'+str(i)+'densitytimesvolume preserves6gmass',density*exact_value('SIM-C2-L001-01',i),6,'g') for i,density in enumerate((sp.Integer(1),R(4,5),R(1,10)),1)]]
    out['SIM-C2-L001-02'] += [check('stationary plane Couette derivative',sp.diff(x*z/2,z),x/2,'1/s'),check('viscosity times6cmpersec over2cm',Q(1,'Pa*s')*Q(6,'cm/s')/Q(2,'cm'),3,'Pa'),check('fourcmpersec gives2Pa',Q(1,'Pa*s')*Q(4,'cm/s')/Q(2,'cm'),2,'Pa'),check('zero speed zero stress',sp.Integer(0),0,'Pa')]
    out['SIM-C2-L001-03'] += [check('densitySI conversion',Q(R(5,2),'g/cm^3'),2500,'kg/m^3'),check('6cm3 gives15g',Q(R(5,2),'g/cm^3')*Q(6,'cm^3'),15,'g'),check('5cm3 gives12.5g',Q(R(5,2),'g/cm^3')*Q(5,'cm^3'),R(25,2),'g')]
    out['SIM-C2-L001-04'] += [check('squarecm conversion',Q(1,'cm^2'),R(1,10000),'m^2'),check('10N over5cm2 gives20kPa',Q(10,'N')/Q(5,'cm^2'),20,'kPa'),check('10N over7cm2 exact100over7kPa',Q(10,'N')/Q(7,'cm^2'),R(100,7),'kPa'),check('manual longdivision remainder5',100000-7*14285,5,'','reviewer_manual_feasibility_not_source_supplied_step'),check('14.286 relative error1over50000',abs(R(14286,1000)-R(100,7))/R(100,7),R(1,50000))]
    out['SIM-C2-L001-05'] += [check('assigned waterg10 depth1 increment10kPa',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(1,'m'),10,'kPa'),check('100kPa boundary plus10 gives110',100+10,110,'kPa'),check('90kPa boundary plus10 gives100',90+10,100,'kPa'),check('relative pressure independent atmosphere',sp.diff(x+10-x,x),0)]
    out['SIM-C2-L002-01'] += [check('hydrostatic differential force balance',sp.integrate(rho*g,(h,0,h)),rho*g*h,'Pa'),check('explicit transferg10 at1.5m requires15kPa',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(R(3,2),'m'),15,'kPa'),check('model9.81 at1.5m gives14.715kPa',Q(1000,'kg/m^3')*Q(R(981,100),'m/s^2')*Q(R(3,2),'m'),R(2943,200),'kPa'),check('explicit requested gravity disagrees with installed-key gravity',R(2943,200),15,'kPa','SOURCE_CONTRACT_CONFLICT_EXPECTED_FAIL')]
    out['SIM-C2-L002-02'] += [check('depth fromsurface-minusquota',3-z,3-z,'m'),check('relative pressure decreases upward',sp.diff(10*(3-z),z),-10,'kPa/m'),check('quota2 depth1 gives10kPa',10*(3-2),10,'kPa'),check('quota1.5 gives15kPa',10*(3-R(3,2)),15,'kPa'),check('atfree surface relative zero',10*(3-3),0,'kPa')]
    out['SIM-C2-L002-03'] += [check('column force balance independently solved',sp.solve(sp.Eq(p,rho*g*h),h)[0],p/(rho*g),'m'),check('102kPa mercury13600g10 gives75cm',Q(102,'kPa')/(Q(13600,'kg/m^3')*Q(10,'m/s^2')),75,'cm'),check('88.4kPa gives65cm',Q(R(442,5),'kPa')/(Q(13600,'kg/m^3')*Q(10,'m/s^2')),65,'cm'),check('manual exact1.36step gives1cm',R(34,25)*R(25,34),1,'cm')]
    out['SIM-C2-L002-04'] += [check('1kPa waterg10 gives10cm',Q(1,'kPa')/(Q(1000,'kg/m^3')*Q(10,'m/s^2')),10,'cm'),check('left excess2kPa rightminusleft20cm',2*10,20,'cm'),check('zero difference levels equal',0*10,0,'cm'),check('equal sections eachsurface moveshalf10cm',sp.Rational(20,2),10,'cm'),check('signed negative pressure givesnegativeheight',-1*10,-10,'cm')]
    out['SIM-C2-L003-01'] += [check('20cm2 toSI',Q(20,'cm^2'),R(1,500),'m^2'),check('6kPa times20cm2 gives12N',Q(6,'kPa')*Q(20,'cm^2'),12,'N'),check('5kPa times20cm2 gives10N',Q(5,'kPa')*Q(20,'cm^2'),10,'N'),check('pressureincrement uniform,force proportionalarea',sp.cancel((p*(4*A))/(p*A)),4),check('pistonradiusratio2 meansarearatio4',R(58,100)**2/R(29,100)**2,4)]
    return out


def runtime_hashes():return {k:sha((APP/k).read_bytes()) if (APP/k).is_file() else 'MISSING' for k in READ_RUNTIME}

def runtime_values(sources):
    code="import{esperienza}from'./static/js/banchi/voci/esperimento.js';import{n}from'./static/js/banchi/misure.js';const rows="+canonical([sources[k] for k in SPECS])+";const out={};for(const row of rows){const a=await esperienza(row),c=row.control,count=Math.round((c.max-c.min)/c.step)+1,cases=[];for(let i=0;i<count;i++){const x=c.min+i*c.step,s=a.model.solve({x});cases.push({x,output:s,readings:a.model.readings({x},s),elements:a.elements(x,2),graphs:a.model.graphs({x},s),steps:a.model.steps({x},s)});}out[row.id]={params:a.model.params,clock:a.clock,assessment:a.record.assessment,prediction:a.record.prediction,spec:a.scene.spec,legend:a.legend(),cases,formatRoundtrip:a.record.assessment.map(t=>({display:n(t.value),parsed:Number(n(t.value).replace(',','.'))}))};}console.log(JSON.stringify(out));"
    run=subprocess.run(['node','--input-type=module','-'],cwd=APP,input=code,text=True,capture_output=True,timeout=60)
    if run.returncode:raise ValueError('Installed047adapter failed:'+run.stderr[:300])
    return json.loads(run.stdout)


def near(value,want):return type(value) in (int,float) and math.isfinite(value) and math.isclose(value,float(want),rel_tol=1e-10,abs_tol=1e-10)

def compare_runtime(actual):
    out={}
    predictions=[2,2,2,0,2,2,0,2,2,2]
    for (key,spec),prediction in zip(SPECS.items(),predictions):
        lo,hi,step,x0,x1,transfer,unit=spec;item=actual.get(key,{});cases=item.get('cases',[]);errors=[];tasks=[];count=round((hi-lo)/step)+1
        if len(cases)!=count:errors.append('Complete legal control grid missing')
        params=item.get('params',[])
        if len(params)!=1 or params[0].get('key')!='x':errors.append('Actual parameter missing')
        elif key=='SIM-C2-L001-01':
            if params[0].get('options')!=[['1','Solido'],['2','Liquido'],['3','Gas']] or params[0].get('value')!='1':errors.append('Discrete three-state selector differs')
        elif any(not near(params[0].get(k),v) for k,v in (('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual slider domain/default differs')
        if item.get('clock') is not None:errors.append('Unexpected clock for static-equilibrium/parameter comparison')
        if item.get('prediction',{}).get('correct')!=prediction or item.get('prediction',{}).get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Actual prediction/distractors differ')
        for i,c in enumerate(cases):
            x=sp.Rational(str(lo))+i*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Installed law differs from independently derived model')
            rs=c.get('readings',[])
            displayunit={'cm^3':'cm³'}.get(unit,unit)
            if len(rs)!=3 or not near(rs[1][1],exact_value(key,x)) or rs[1][2]!=displayunit:errors.append('Instrument scalar/unit differs')
            if key=='SIM-C2-L001-05' and (rs[2][1:]!=[10,'kPa']):errors.append('Relative pressure must stay10kPa')
            if key=='SIM-C2-L002-04' and not near(rs[2][1],5*x):errors.append('Single-surface displacement is nothalf total signed difference')
            graphs=c.get('graphs',[])
            if len(graphs)!=1:errors.append('Control graph missing')
            else:
                pts=graphs[0]['series'][0]['points'];expected=3 if key=='SIM-C2-L001-01' else 101
                if len(pts)!=expected or any(not near(y,exact_value(key,z)) for z,y in pts):errors.append('Control graph/model mismatch')
            if len(c.get('steps',[]))!=4:errors.append('Incomplete actual stage reasoning')
            if not geometry_semantics(key,x,c.get('elements',[])):errors.append('Actual apparatus geometric/physical semantics differ')
        assessment=item.get('assessment',[])
        if len(assessment)!=2:errors.append('Two generated tasks missing')
        for i,a in enumerate(assessment[:2]):
            model=exact_value(key,spec[4+i]);required=assigned_value(key,i)
            if not near(a.get('value'),model) or a.get('unit')!={'cm^3':'cm³'}.get(unit,unit):errors.append('Generated answer/unit differs from independently derived installed model')
            tasks.append({'index':i,'input':spec[4+i],'modelExact':str(model),'requiredByDeliveredQuestion':str(required),'agreement':near(a.get('value'),required),'actualPrompt':a.get('prompt'),'actualWorked':a.get('worked')})
        out[key]={'ok':not errors,'errors':errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':0,'tasks':tasks,'requestedTaskAgreement':len(tasks)==2 and all(a['agreement'] for a in tasks),'formatRoundtrip':item.get('formatRoundtrip',[])}
    return out


def consumer_evidence():
    folder=APP/'editorial/reviews/experiments-pressure-hydrostatics-047-1a35-20261125';proof=folder/'browser-raw.json';protocol=folder/'browser-047.mjs';manifest=folder/'manifest.json'
    if not all(p.is_file() for p in (proof,protocol,manifest)):return {'ok':False,'errors':['Current047complete terminal evidence missing']}
    try:
        r=json.loads(proof.read_text());m=json.loads(manifest.read_text());errors=[]
        if sha(proof.read_bytes())!=READ_BROWSER_PROOF_SHA256 or sha(protocol.read_bytes())!=READ_BROWSER_PROTOCOL_SHA256 or r.get('protocolSha256')!=READ_BROWSER_PROTOCOL_SHA256 or sha(manifest.read_bytes())!=READ_VISUAL_MANIFEST_SHA256:errors.append('047proof/protocol/visual bytes changed')
        if r.get('runtimeProfileBefore')!=READ_RUNTIME_PROFILE_SHA256 or r.get('runtimeProfileAfter')!=READ_RUNTIME_PROFILE_SHA256 or r.get('terminalStatus')!='COMPLETED' or r.get('errors') or len(r.get('cases',[]))!=228:errors.append('Incomplete/stale terminal047matrix')
        for key in SPECS:
            observed=[(c.get('width'),c.get('fallback')) for c in r.get('cases',[]) if c.get('kind')=='activity' and c.get('id')==key]
            if len(observed)!=4 or set(observed)!={(320,False),(320,True),(1280,False),(1280,True)}:errors.append('Missing/duplicate actual profile:'+key)
        supplement=json.loads((folder/'gravity-prompt-supplement.json').read_text());observed=[v for v in supplement.get('cases',[]) if v.get('kind')=='activity']
        if supplement.get('runtimeProfileBefore')!=READ_RUNTIME_PROFILE_SHA256 or supplement.get('runtimeProfileAfter')!=READ_RUNTIME_PROFILE_SHA256 or supplement.get('terminalStatus')!='COMPLETED' or supplement.get('errors') or len(observed)!=4 or {(v.get('width'),v.get('fallback')) for v in observed}!={(320,False),(320,True),(1280,False),(1280,True)}:errors.append('Targeted actual question supplement incomplete')
        for v in observed:
            task=v.get('assessments',[{},{}])[1]
            if 'g = 10' not in task.get('prompt','') or task.get('status','').startswith('Corretto') or not task.get('wrongPhysicalKeyStatus','').startswith('Corretto'):errors.append('Actual g10 question/grader conflict not reproduced')
        for name,pin in m.get('files',{}).items():
            f=(folder/name).resolve()
            if not f.is_relative_to(folder.resolve()) or not f.is_file() or sha(f.read_bytes())!=pin:errors.append('Archived047asset changed:'+name)
        return {'ok':not errors,'errors':errors,'proofSha256':sha(proof.read_bytes()),'protocolSha256':sha(protocol.read_bytes()),'visualManifestSha256':sha(manifest.read_bytes()),'observedCases':len(r.get('cases',[])),'scientificApproval':False}
    except (OSError,ValueError,TypeError) as exc:return {'ok':False,'errors':[str(exc)]}


def report(sources):
    if set(sources)!=set(SPECS):raise ValueError('Require exactly10 independently read047originals')
    valid=all(sources[k].get('kind')=='experiment' and digest(sources[k])==READ_SOURCE_SHA256[k] for k in SPECS)
    hashes=runtime_hashes();fp=runtime_fingerprint(APP)['sha256'];evidence=consumer_evidence();actual=None;summary={};runtime_errors=[]
    if not valid:runtime_errors.append('Unreviewed source: no engine execution')
    elif fp!=READ_RUNTIME_PROFILE_SHA256 or hashes!=READ_RUNTIME:runtime_errors.append('Runtime changed: no cached approval')
    else:
        try:
            actual=runtime_values(sources);summary=compare_runtime(actual)
            if runtime_hashes()!=hashes or runtime_fingerprint(APP)['sha256']!=fp:runtime_errors.append('Runtime drift during actual execution')
        except (OSError,ValueError,KeyError,TypeError,subprocess.TimeoutExpired) as exc:runtime_errors.append(str(exc))
    mathchecks=independent_checks();records=[]
    for key in SPECS:
        row=sources[key];checks=mathchecks[key];sourceerrors=[SOURCE_ISSUES[key]] if key in SOURCE_ISSUES else[];visualerrors=[VISUAL_ISSUES[key]] if key in VISUAL_ISSUES else[];errors=list(runtime_errors)+sourceerrors+visualerrors;comparison=summary.get(key)
        if not evidence['ok']:errors.extend(evidence['errors'])
        if not comparison:errors.append('Fresh actual comparison missing')
        else:
            checks.append({'claim':'fresh installed140grid aggregate law/graph/phase/generated-task comparison for thisID','ok':comparison['ok'],'caseCount':comparison['caseCount'],'dimension':{}})
            errors.extend(comparison['errors'])
            if not comparison['requestedTaskAgreement']:checks.append({'claim':'actual task answer matches explicit student physical data','ok':False,'dimension':{},'detail':comparison['tasks']})
        if any(not c['ok'] for c in checks) and key not in SOURCE_ISSUES:errors.append('Independent exact/oracle check failed')
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,'ok':not errors,'errors':errors,'checks':checks,'calculationScope':'EXACT_MANUAL_CALCULATION','dimension':{c['claim']:c.get('dimension',{}) for c in checks},'sourceScientificReview':{'ok':valid and not sourceerrors,'errors':sourceerrors},'consumerReview':{'ok':bool(evidence['ok'] and comparison and comparison['ok'] and not visualerrors and not runtime_errors),'errors':visualerrors},'manualFeasibility':'FAIL_INCONSISTENT_ASSIGNED_GRAVITY' if key in SOURCE_ISSUES else 'PASS_AI_EXACT_ASSIGNED_TASKS' if valid and comparison and comparison['ok'] else 'FAIL_UNVERIFIED','manualArithmetic':MANUAL[key],'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],'figureReview':VISUAL_ISSUES.get(key,VISUAL_NOTES[key]),'runtimeComparison':comparison,'runtimeProfileSha256':fp,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,'runtimeSha256':hashes,'consumerEvidence':evidence,'assetChecksums':{},'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':bool(errors),'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),'draftReviewedCount':0,'failedPublishedEditionIds':[r['id'] for r in records if not r['ok']],'sourceManualityIssueIds':sorted(SOURCE_ISSUES),'consumerInterfaceIssueIds':sorted(VISUAL_ISSUES),'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE','reviewer':'separate_AI_not_source_or_future_revision_author','dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__}}

MANUAL={}
ASSUMPTIONS={}
PEDAGOGY={}
VISUAL_NOTES={}


def geometry_semantics(key,x,items):
    R=sp.Rational;x=R(str(x));G=0x147979;P=0x7350b0;O=0xd49332;M=0x726d81;red=0xb94f48
    def of(kind,color=None):return[e for e in items if e.get('kind')==kind and(color is None or e.get('c')==color)]
    if key=='SIM-C2-L001-01':
        dots=of('ball',G);indicator=[e for e in of('rod',P) if near(e.get('r'),R(88,1000))]
        return len(dots)==24 and all(near(e['r'],R(12,100)) for e in dots) and len(indicator)==1 and near(indicator[0]['b'][1]-indicator[0]['a'][1],R(21,10)*exact_value(key,x)/60)
    if key=='SIM-C2-L001-02':
        arrows=of('arrow',G);h=R(99,80);ys=[R(11,50)+h*i/5 for i in range(1,6)]
        if x==0:return not arrows
        return len(arrows)==5 and all(near(a['a'][1],y) and near(a['b'][1],y) and near(a['b'][0]-a['a'][0],R(3,10)*x*i/5) for i,(a,y) in enumerate(zip(arrows,ys),1))
    if key=='SIM-C2-L001-03':
        cube=of('box',0x68bdcf)
        return len(cube)==1 and all(near(v,cube[0]['size'][0]) for v in cube[0]['size']) and near((cube[0]['size'][0]/2.05)**3,x/8)
    if key=='SIM-C2-L001-04':
        base=of('box',G);arrows=of('arrow',red)
        return len(base)==1 and near(base[0]['size'][0]*base[0]['size'][2],R(361,100)*x/10) and len(arrows)==1 and near(arrows[0]['b'][1]-arrows[0]['a'][1],-R(89,100))
    if key in ('SIM-C2-L001-05','SIM-C2-L002-01','SIM-C2-L002-02'):
        probes=of('ball',P);y=R(61,50) if key=='SIM-C2-L001-05' else R(109,50)-R(16,25)*(x if key=='SIM-C2-L002-01' else 3-x)
        return len(probes)==2 and all(near(e['p'][0],xx) and near(e['p'][1],y) and near(e['p'][2],R(3,10)) for e,xx in zip(probes,(-R(4,5),R(4,5))))
    if key=='SIM-C2-L002-03':
        column=[e for e in of('rod',P) if near(e.get('r'),R(1,8))]
        return len(column)==1 and near(column[0]['b'][1],R(29,50)+R(13,500)*exact_value(key,x)) and column[0]['b'][1]<2.84
    if key=='SIM-C2-L002-04':
        levels=[e for e in of('rod',G) if near(e.get('r'),R(27,200))];arrows=of('arrow',P)
        return len(levels)==2 and near(levels[0]['b'][1],R(34,25)-R(59,200)*x) and near(levels[1]['b'][1],R(34,25)+R(59,200)*x) and (not arrows if x==0 else len(arrows)==1 and near(arrows[0]['b'][1]-arrows[0]['a'][1],R(59,100)*x))
    # Cylinder areas, not radii, determine the hydraulic multiplier. Heights are
    # schematic different baselines, not a claimed pressure-height calibration.
    faces=[e for e in of('rod',M) if near(e.get('b',[0,0])[1]-e.get('a',[0,0])[1],R(11,100))]
    return len(faces)==2 and near(faces[1]['r']**2/faces[0]['r']**2,4)

MANUAL={
'SIM-C2-L001-01':'Assignedm6g and phase densities1,4/5,1/10g/cm³ yield6,15/2,60cm³. Tasks gas60 and liquid7.5. Divide by a fraction:6/(4/5)=6*5/4. The phase-density ordering is toy assigned data, not universalwater expansion.',
'SIM-C2-L001-02':'Stationary Newtonian Couetteτ=ηU/d. Centimetres cancel inU/d;1Pa*s*6cm/s/2cm=3Pa, transfer4 gives2Pa. ZeroU yields0; arbitrarygridinteger speeds divideby2. Studenttext explicitly says a regime, so no unqualified startup assumption is supplied by reviewer.',
'SIM-C2-L001-03':'m=(5/2g/cm³)V. At6cm³15g, transfer5cm³25/2g. Multiply by5 thenhalve, container tare excluded by solo contenuto. Density2500kg/m³. Volumecontrols1..8, same uniform material.',
'SIM-C2-L001-04':'Acm²=A/10000m²;10N/(A/10000)m²=100/AkPa. Task5cm²20kPa; transfer7 gives100/7. Manual100000=7*14285+5 gives14.285..., input14.286 relativeerror1/50000<0.005 actualgrader. Mean normal pressure, no proof of uniformlocalcontact pressure.',
'SIM-C2-L001-05':'Explicitρ1000,g10,h1m gives10kPa relative pressure. Absolute at100kPa110, transfer90→100. Surface variation does not changeρgh. Vacuum is absolutezero; relativezero atsurface. Only arithmeticaddition and elementarySIconversion required.',
'SIM-C2-L002-01':'Model substitution9.81h and first comparisonh2 give19.62kPa. However actual transfer specifically saysg10:ρ1000*10*1.5=15000Pa=15kPa; consumer rejects15 and accepts14.715=(981/100)*(3/2)=2943/200. First task does not independently specifyg10; do not falsely broaden the conflicting transfer to thatquestion. Originalv1FAIL, no silent reinterpretation.',
'SIM-C2-L002-02':'Waterheight3m, quota z abovebottom; h=3-z, assignedcoefficient10kPa/m. Atz2 pressure10kPa, transfer1.5→15; z3→0, z0→30. Subtractbeforemultiply; dp/dz negative. No assumedclock or negativepressures within0..3.',
'SIM-C2-L002-03':'p=ρgh with13600kg/m³,g10; cmoutput=25p_kPa/34.102/34=3 then*25=75cm;88.4/34=2.6 then*25=65cm. Vaporpressure explicitly neglected, topvacuum specified. Step1.36kPa givesexact1cm, no inverse nonlinearcalculator.',
'SIM-C2-L002-04':'Commonbottom balance givespL-pR=ρg(zR-zL); withwater/g10 signedcm=10Δp_kPa. First2→20cm, transfer0→0; negative−1→−10. Equalareameans eachsurface moves halfdislevel, not full. Actualcomparison showsrightsurface5xcm. No kinetic pressure or absolutevacuumbaseline assumed.',
'SIM-C2-L003-01':'Addedpressure, not totalbaseline pressure:20cm²=1/500m²,1kPa=1000Pa, soΔF=2Δp_kPaN. Task6→12N, transfer5→10N. Finite0..10, no hydraulicstroke assigned. Geometricradiusratio2 meansarearatio4; ifoutlet20cm² inletwould5cm². Different glyphgains are not used to infer quantitative force ratios.'}
ASSUMPTIONS={
'SIM-C2-L001-01':'Three discrete illustrative states at same6gmass; densities assigned perstate. No continuousphasepath, equationofstate or universal densityordering inferred.',
'SIM-C2-L001-02':'Atregime, parallelplates, no-slip linear stationary Newtonian profileη1Pa*s,d2cm, lowerplatefixed, no imposedpressuregradient; shear magnitude fornonnegativeU.',
'SIM-C2-L001-03':'Homogeneousmaterial, fixedρ2.5g/cm³, contentmass only, positivediscretevolume1..8cm³; no mass-to-weight conflation.',
'SIM-C2-L001-04':'Fixednormal10N, positivearea1..10cm², averagepressureFnormal/A; shear/localstress distribution not specified.',
'SIM-C2-L001-05':'Staticconstantdensitywaterρ1000,g10, fixed1mdepth, surfacepressure70..110kPa; atmospheric and hydrostatic contributions additive.',
'SIM-C2-L002-01':'Staticwaterρ1000, downwarddepth0..3m, surfacerelativezero. g is contradictory between9.81model and explicitg10 transfer; preserveconflict rather thanchooseone silently.',
'SIM-C2-L002-02':'Water3mdeep, upwardsquotafrombottom, relativepressure10(3-z)kPa. Uniformdensity/g impliedbyassignedlinearcoefficient; no flowdynamicpressure.',
'SIM-C2-L002-03':'Mercury13600kg/m³,g10, topvacuum/negligiblevaporpressure, surfaceopenair. Positiveairpressure68..108.8kPa; idealcolumnfitstube.',
'SIM-C2-L002-04':'Staticwater, g10; Δp leftminusright and Δh rightminusleft signed. Equalcrosssections forhalfdisplacements; zeroΔp equallevels, no pressureloss.',
'SIM-C2-L003-01':'Confinedquiescentliquid; pressureincrement transmitted, not arbitrarytotalforceequality. Assignedlargearea20cm²; pistonareasfixed, no displacement/energy-output demand.'}
PEDAGOGY={k:'Full original record, actual generatedprediction/options/reason, two numeric tasks, four guidephases, substitutions, readouts, graph, parameterdomain and apparatus read. Emptyblocks do not mean no calculation. Reviewer-generatedderivations/meshprobes distinguished from student-suppliedprocedures; no studentcalibration or humanapproval.' for k in SPECS}
VISUAL_NOTES={
'SIM-C2-L001-01':'Same24greenballs; arrangement/statevolume illustrative. Separatevolumeindicatorheight2.1V/60 gives correctcommonvolume scale; do not treat tank boundingboxes or particlehard-spheres as exact6/7.5/60 ratios.',
'SIM-C2-L001-02':'Layer arrows use linearvelocity profile; zeroatbottom omitted. Opaqueupperplate issue separately retained.',
'SIM-C2-L001-03':'Cubeedge2.05*cuberoot(V/8), so graphicalvolumes proportionalphysicalV and allthreeedges equal. Color/boxtransparency schematic; scalar mass readout supplies measurement.',
'SIM-C2-L001-04':'Square contactplateedge1.9sqrt(A/10), area proportionalA; fixedload and same downwardforcearrow. Theloadplate spreadsload tofloor; the constantloadblock itself isnot claimed to havevariablefaces.',
'SIM-C2-L001-05':'Two equal-depth probes and surfaceredpressureglyph, scalarabsolute/relative pressurecorrect; labelocclusion retained.',
'SIM-C2-L002-01':'Depthmapsdownwards y2.18-.64h and same-leveltwoprobes; no horizontalwallpressuredependence. Sourcegconflict and leftprobeocclusion are separate.',
'SIM-C2-L002-02':'Quota mapsupwards y2.18-.64(3-z); same-depthprobe comparison despitewallside. Leftprobeocclusion retained.',
'SIM-C2-L002-03':'Mercurytop .58+.026h_cm belowtube2.84. Reservoirsurfaceat.575 gives .005 displayclearanceoffset; changesinheight use common.026scene/cm. Vacuumlabel indicatesairspace, not a negativeheight. Native/fallback checked.',
'SIM-C2-L002-04':'Levels1.36±.295Δp have signedheightdifference.59Δp, eachsurfacehalf. Atzero signedarrow omitted. Native320 small±.2 has tip-only0.253px entry intoΔhlabel; cone partlyvisible and1280/fallback direction observable. This bounded partial-overlay observation is not asserted as totalglyphinvisibility or used alone as a sourceFAIL.',
'SIM-C2-L003-01':'Radii.29/.58 givearea ratio4. Pistonbaselines differ visually; sourceasksaddedpressure so no constanttotalpressure asserted acrossdifferentheights. Forcearrows are not treated as a calibratedcommon-unit ratio; actuallabel-tipocclusions separately retained.'}
