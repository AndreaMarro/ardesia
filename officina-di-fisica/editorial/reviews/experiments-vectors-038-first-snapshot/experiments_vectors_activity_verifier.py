"""Independent original four C1-L002 experiments: source and actual generated tasks.

Numeric physics and simple radical manual bounds are checked separately from
the unsupported nonnotable95degree generated numerical transfer.
No experiment authoring import, human approval or publication.
"""
from fractions import Fraction
from pathlib import Path
import json
import math
import subprocess
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C1.json'
SOURCE_FILE_SHA256='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3'
BATCH='experiments-vectors-038'
READ_SOURCE_SHA256={'SIM-C1-L002-01':'256f3fa7716a412ca99fcea5ce7cf887afc0692784d0c882c341298b89d53e30','SIM-C1-L002-02':'7c818614c4453b022ade14d6d966aa1cee663391bb89747217cb3eb253da824e','SIM-C1-L002-03':'05348eae34b1bbdb55997da094229a707d39015915f8e8e77b47497667c79100','SIM-C1-L002-04':'fdf6f4118b32662950c450dbe557abd7299fe0758e31783fad3a7da88b66643e'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'fce66f301918483fe79d0f8dbf84c280268e48e615e9c016f2bbd32f699f5075', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '4ee391c0841fed7e1888d2c57cfb2494f8e0be0581a6211d50d410bd172602b9', 'static/js/banchi/voci/legende.js': '2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': 'dc005819f8f12ec48722d32b1d236328ecab75e0734c9ecd0a147751c6bb8fd7', 'static/js/banchi/banco.js': '682ba25fcf97b67821b8c9bb6c73a571c87559f94bbda3f64cfad65fab63cdb8', 'static/js/banchi/misure.js': '8d631c65b0266ece6447da07aff7a43ee61b66d0767ddc24ace3f59b31fac186', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'
READ_BROWSER_PROOF_SHA256='beacabf39ce668084d77caf263835c91e7d4aeffae65718905948dcc8b7ee95d'
READ_BROWSER_PROTOCOL_SHA256='dba461def4739e16d1a2a0c7f15d01b64293dd192f1d2d16840c6ada239996cf'
SOURCE_ISSUES={'SIM-C1-L002-04':'P2 actual generated numerical transfer95degrees requires -6sin(pi/36), no notable-angle value or supplied manual approximation procedure. The exact symbolic response is rejected by Number-only input; simulator dot/cross numerical physics remains correct.'}
CONSUMER_ISSUES={'SIM-C1-L002-04':'P3 antiparallel180degrees actual normal-component display is positive7.348e-16m² instead of zero, even though the normal arrow is correctly absent. Raw6sin(pi) binary residual is presented as a nonzero physical component; no source physics error.'}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L002-01':(0,90,5,30,90,45,'cm'),
'SIM-C1-L002-02':(0,8,1,0,4,5,'m'),
'SIM-C1-L002-03':(-4,4,1,-2,3,0,'m'),
'SIM-C1-L002-04':(0,180,5,0,90,95,'m²')}


def exact_value(key,x):
    x=sp.Rational(str(x));i=int(key[-2:])
    if i==1:return 10*sp.sin(x*sp.pi/180)
    if i==2:return sp.sqrt(9+x*x)
    if i==3:return 3+x
    return 6*sp.cos(x*sp.pi/180)


def check(claim,actual,expected,unit='',scope='actual_assigned_exact_or_manual_relation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    actual=sp.sympify(actual);expected=sp.sympify(expected)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    R=sp.Rational;theta,y=sp.symbols('theta y',real=True)
    result={key:[] for key in SPECS}
    solved=[(5,10,5*sp.sqrt(2)),(3,5,sp.sqrt(34)),(1,6,3),(6,0,-6*sp.sin(sp.pi/36))]
    for key,(_,_,_,x0,x1,transfer,unit) in SPECS.items():
        for label,x,expected in zip(('first reference','comparison assessment','actual generated transfer'),(x0,x1,transfer),solved[int(key[-2:])-1]):
            result[key].append(check(label,exact_value(key,x),expected,unit))
    def truth(claim,expression,scope='reviewer_manual_feasibility_not_claimed_as_supplied_student_instruction'):
        return check(claim,sp.Integer(int(bool(expression))),1,'',scope)
    result['SIM-C1-L002-01'] += [
        check('vertical30degrees half10',10*sp.sin(sp.pi/6),5,'cm'),
        check('horizontal30degrees',10*sp.cos(sp.pi/6),5*sp.sqrt(3),'cm'),
        check('fixed squared length100',sp.trigsimp((10*sp.sin(theta))**2+(10*sp.cos(theta))**2),100,'cm^2','independent_symbolic_model'),
        truth('7.07squared49.9849 below50',R(707,100)**2<50),
        truth('7.08squared50.1264 above50',R(708,100)**2>50),
        truth('manual7.07relativeerror bound belowhalfpercent',(R(708,100)-R(707,100))/R(707,100)<R(1,200)),
    ]
    result['SIM-C1-L002-02'] += [
        check('Pythagoras squared norm',sp.Matrix([3,y]).dot(sp.Matrix([3,y])),9+y*y,'m^2','independent_symbolic_model'),
        truth('5.83squared33.9889 below34',R(583,100)**2<34),
        truth('5.84squared34.1056 above34',R(584,100)**2>34),
        truth('manual5.83relativeerror bound belowhalfpercent',(R(584,100)-R(583,100))/R(583,100)<R(1,200)),
    ]
    result['SIM-C1-L002-03'] += [
        check('return4after3 signed displacement',3-4,-1,'m'),
        check('return4after3 path length',abs(sp.Integer(3))+abs(sp.Integer(-4)),7,'m'),
        check('zero resultant at return3',3-3,0,'m'),
        check('zero resultant still nonzero path length',abs(sp.Integer(3))+abs(sp.Integer(-3)),6,'m'),
    ]
    A=sp.Matrix([3,0,0]);B=sp.Matrix([2*sp.cos(theta),2*sp.sin(theta),0])
    result['SIM-C1-L002-04'] += [
        check('dot and cross squared magnitudes sum36',sp.trigsimp(A.dot(B)**2+A.cross(B).dot(A.cross(B))),36,'m^4','independent_symbolic_model'),
        check('cross90positivez6',A.cross(B)[2].subs(theta,sp.pi/2),6,'m^2'),
        check('cross180zero',A.cross(B)[2].subs(theta,sp.pi),0,'m^2'),
        check('dot180negative6',A.dot(B).subs(theta,sp.pi),-6,'m^2'),
        check('reversing order gives negativez',B.cross(A)[2].subs(theta,sp.pi/2),-6,'m^2'),
        check('input lengths product has area units',SI.Quantity(3,'m')*SI.Quantity(2,'m'),6,'m^2'),
    ]
    return result


def runtime_values(sources):
    code="import {esperienza} from './static/js/banchi/voci/esperimento.js';import {n} from './static/js/banchi/misure.js'; const records="+canonical([sources[k] for k in sorted(SPECS)])+";\n"+r"""
const out={};
for(const source of records){
 const a=await esperienza(source),c=source.control;
 const cases=[];
 for(let x=c.min;x<=c.max+1e-9;x+=c.step){
  const p={x},s=a.model.solve(p);
  cases.push({x,output:s,readings:a.model.readings(p,s),elements:a.elements(x,2),calculation:a.measurement(x).calculation});
 }
 out[source.id]={cases,params:a.model.params,prediction:a.record.prediction,assessment:a.record.assessment,
   clock:a.clock,graph:a.model.graphs({x:source.references[0][0]},a.model.solve({x:source.references[0][0]})),
   formatRoundtrip:a.record.assessment.map(v=>({display:n(v.value),parsed:Number(n(v.value).replace(',','.'))}))};
}
console.log(JSON.stringify(out,(_k,v)=>Number.isNaN(v)?'NaN':v));
"""
    run=subprocess.run(['node','--input-type=module','-'],cwd=APP,input=code,text=True,capture_output=True,timeout=30)
    if run.returncode:raise ValueError('Actual experiment consumer failed: '+run.stderr[:500])
    return json.loads(run.stdout)


def near(actual,expected):
    return type(actual) in (int,float) and math.isfinite(actual) and math.isclose(actual,float(expected),rel_tol=1e-10,abs_tol=1e-11)


def compare_runtime(actual):
    summaries={}
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];expected_count=(hi-lo)//step+1
        if len(cases)!=expected_count:errors.append('Incomplete actual slider grid')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=v for f,v in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual parameter domain/default differs')
        for index,case in enumerate(cases):
            x=lo+index*step
            if case.get('x')!=x or not near(case.get('output',{}).get('y'),exact_value(key,x)):errors.append('Actual law differs at control '+str(x))
            elements=case.get('elements',[])
            arrows=[e for e in elements if e.get('kind')=='arrow']
            def vector(color,expected,start=None):
                matches=[e for e in arrows if e.get('c')==color]
                length=sum(v*v for v in expected)
                if float(length)<.015**2:return not matches
                if len(matches)!=1:return False
                a=matches[0]
                return all(near(a['b'][i]-a['a'][i],expected[i]) for i in range(3)) and (start is None or all(near(a['a'][i],start[i]) for i in range(3)))
            th=sp.Rational(x)*sp.pi/180;G=0x147979;P=0x7350b0;O=0xd49332
            if key.endswith('01'):
                if not vector(G,[sp.Rational(5,2)*sp.cos(th),0,-sp.Rational(5,2)*sp.sin(th)],[-.8,.28,0]) or not vector(P,[0,0,-sp.Rational(5,2)*sp.sin(th)]):errors.append('Rod/projection geometry differs')
                readings=case.get('readings',[])
                if len(readings)!=3 or not near(readings[2][1],10*sp.cos(th)):errors.append('Horizontal comparison reading differs')
            elif key.endswith('02'):
                if not vector(G,[1,0,-sp.Rational(x,3)]) or not vector(P,[1,0,0]):errors.append('Pythagorean vector geometry differs')
            elif key.endswith('03'):
                if not vector(G,[sp.Rational(6,5),0,0]) or not vector(O,[sp.Rational(2,5)*x,0,0],[.4,.4,0]) or not vector(P,[sp.Rational(2,5)*(3+x),0,0],[-.8,.7,0]):errors.append('Head-to-tail/resultant geometry differs')
            else:
                if not vector(G,[sp.Rational(3,2),0,0]) or not vector(O,[sp.cos(th),0,-sp.sin(th)]) or not vector(P,[0,sp.Rational(31,20)*sp.sin(th),0]):errors.append('Dot/cross geometry orientation differs')
                readings=case.get('readings',[])
                if len(readings)!=3 or not near(readings[2][1],6*sp.sin(th)):errors.append('Cross product normal comparison reading differs')
        assignments=item.get('assessment',[])
        if len(assignments)!=2:errors.append('Actual generated assignments incomplete')
        else:
            for assignment,x in zip(assignments,(x1,transfer)):
                if not near(assignment.get('value'),exact_value(key,x)) or assignment.get('unit')!=unit:errors.append('Actual assigned answer/unit differs')
        if item.get('prediction',{}).get('correct')!=(0 if key.endswith('04') else 2):errors.append('Actual prediction differs')
        if item.get('clock') is not None:errors.append('Unexpected clock/time-dependent model')
        graphs=item.get('graph',[])
        if len(graphs)!=1 or not graphs[0].get('series'):errors.append('Actual graph missing')
        else:
            points=graphs[0]['series'][0].get('points',[])
            if len(points)!=101:errors.append('Actual graph sample completeness differs')
            for x,y in points:
                if not near(y,exact_value(key,x)):errors.append('Actual graph differs from independent law');break
        summaries[key]={'ok':not errors,'caseCount':len(cases),'plannedCaseCount':expected_count,'errors':errors,
                        'firstAssessmentInput':x1,'transferInput':transfer,'manualityIssue':key in SOURCE_ISSUES,
                        'numericPhysicsMatches':not errors,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return summaries

MANUAL={
'SIM-C1-L002-01':'A10cm rod has height10sin(theta). At30deg height5cm and horizontal5sqrt3cm; at90deg height10cm. Actual transfer45deg has exact5sqrt2cm. Numeric7.07cm is feasible manually by squaring707/100 and708/100 to bracket sqrt50:49.9849<50<50.1264; relativeerror<1/707<0.005. This is reviewer-documented manual feasibility, not a claim that the source supplies these squaring instructions or that an exact symbolic string is accepted by Number. Arbitrary intermediate instrumentangles are not extra student tasks.',
'SIM-C1-L002-02':'Orthogonal3m horizontal and ym vertical give sqrt(9+y²)m. References0=>3m and4=>5m; actual transfer5=>sqrt34m. Numeric5.83m is manually bounded:5.83²33.9889<34<34.1056=5.84², relativeerror<1/583<0.005. Reviewer manual root-bracketing, distinct from actual source worked approximation sqrt34≈5.831. No false exact decimal identity or requirement to evaluate inverse trig.',
'SIM-C1-L002-03':'Signed one-dimensional addition3m+b. References b-2=>1m/b3=>6m, generated b0=>3m. Boundaryb-4=>-1m versus7m path length; b-3=>0displacement versus6m path. Finite signed integer arithmetic; a negative second displacement is not a negative path length.',
'SIM-C1-L002-04':'3m and2m vectors give dot6cos(theta)m², zcross6sin(theta)m² for right-handed frame. References0=>6/90=>0; actual transfer95=>-6sin(pi/36) is nonnotable and numeric≈-.522934456. Number rejects exact symbolic form; no supplied manual small-angle/trig approximation procedure. This actual assigned numeric transfer fails manuality while physical numeric model, cross signs and first90deg task remain correct.'}
ASSUMPTIONS={
'SIM-C1-L002-01':'Rigid10cm segment in a Euclidean right triangle, inclinationfromhorizontal0..90deg, positiveheight;degenerateflat/upright limits allowed. Idealinstrumentoutputs atallangles not automatically assigned numeric work.',
'SIM-C1-L002-02':'Perpendicular axes; fixed3m east component, nonnegative0..8m north. The magnitude is displacement norm, not path length3+y. Positive root only; zerovertical still3m.',
'SIM-C1-L002-03':'Two collinear displacements on same oriented axis; +3m first and signedb-4..4m second. Result can be negative orzero; path distance always3+abs(b). Small scene-height offsets separate overlapping arrows, not new physical out-of-plane components.',
'SIM-C1-L002-04':'Common-tail vectors3m and2m in oriented right-handedxyplane, angle0..180deg froma to b. Dot signed; cross normal+z forinteriorangles, zeroatparallel/antiparallel; reversingorder reversesnormal. Cross unitsm², notlength. Scene normal scale distinct from vectorlength scale.'}
PEDAGOGY={key:'Full original and actual generated tasks/prediction/worked solution/graph/apparatus read. Distinguish exact symbolic roots, short feasible manual square bounds and unsupported nonnotable numeric trig. Reviewer proof tasks are not claimed as supplied student instructions. No source approval flag, empirical student calibration or human approval inferred.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L002-01':'Read actual green segment2.5(cosθ,0,-sinθ), purpleverticalprojection(0,0,-2.5sinθ), ypositive=-z consistent. Scale1sceneunit=4cm for this rod. Zeroheight at0 does not manufacture a nonzero arrow.',
'SIM-C1-L002-02':'Green (1,0,-y/3), horizontalprojection(1,0,0), common1sceneunit=3m. Orthogonal dashed projections and Pythagorean norm; inputzero gives coincidenthorizontalvector/projection, not missing displacement.',
'SIM-C1-L002-03':'Green offset1.2for3m, orangeoffset.4b from firsttip, purpleresultoffset.4(3+b) fromoriginalorigin. Originslifted by.12/.42sceneunits for readability; logicalxcomponentsand head-to-tail construction remain correct. Atb-3zeroresultarrowomitted; atb-4resultpointsleft.',
'SIM-C1-L002-04':'Green+1.5x represents3m, orange(cosθ,0,-sinθ)represents2m atcommonscale. Mapped logical ex cross ey(-ez) gives+physicaley: purplevertical+1.55sinθ is correct+logicalz normal. It has a separate area scale; no invalid equality of metre vectors and squaremetre normal lengths. Both collinear endpoints havezero cross.'}


def runtime_hashes():
    return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    file=APP/'editorial/reviews/experiments-vectors-038-browser-originals.json'
    protocol=APP/'tests/corpus/browser-experiments-vectors.mjs'
    if not file.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed diagnostic consumer evidence missing'}
    actual=sha(file.read_bytes());tool=sha(protocol.read_bytes())
    if actual!=READ_BROWSER_PROOF_SHA256 or tool!=READ_BROWSER_PROTOCOL_SHA256:return {'ok':False,'error':'Observed diagnostic evidence/protocol changed'}
    proof=json.loads(file.read_text())
    ok=(proof.get('terminalStatus')=='PASS' and not proof.get('errors') and proof.get('scientificApproval') is False
        and len(proof.get('cases',[]))==26 and proof.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
        and proof.get('protocolSha256')==tool and proof.get('expectedSourceIssueIds')==sorted(SOURCE_ISSUES)
        and proof.get('expectedConsumerIssueIds')==sorted(CONSUMER_ISSUES))
    for key in SPECS:
        rows=[r for r in proof.get('cases',[]) if r.get('id')==key and r.get('kind') is None]
        ok=ok and sum(r.get('noWebGL') is False for r in rows)==1 and sum(r.get('noWebGL') is True for r in rows)==1
    return {'ok':bool(ok),'proofSha256':actual,'protocolSha256':tool,'runtimeProfileSha256':proof.get('runtimeProfileSha256'),
            'observedCaseCount':len(proof.get('cases',[])),'scientificApproval':False,
            'meaning':'Observed original defects and working states, not automatic scientific approval; exact runtime identity required, fresh engine oracle replay per report.'}

def verify(sources):
    missing=set(READ_SOURCE_SHA256)-set(sources)
    if missing:raise ValueError('Missing actually read experiments: '+','.join(sorted(missing)))
    physics=independent_checks();hashes=runtime_hashes();consumer=consumer_evidence();profile=runtime_fingerprint(APP)['sha256'];actual=None;summaries={};runtime_error=None
    sourcevalid=all(sources[k].get('kind')=='experiment' and digest(sources[k])==pin for k,pin in READ_SOURCE_SHA256.items())
    if not sourcevalid:runtime_error='Unreviewed source supplied; no engine execution'
    elif hashes!=READ_RUNTIME or profile!=READ_RUNTIME_PROFILE_SHA256:runtime_error='Actual consumer/runtime differs from read snapshot; no cached approval'
    else:
        try:
            actual=runtime_values(sources);summaries=compare_runtime(actual)
            if runtime_hashes()!=hashes or runtime_fingerprint(APP)['sha256']!=profile:runtime_error='Runtime changed during check; discard evidence'
        except (ValueError,OSError,subprocess.TimeoutExpired,KeyError,TypeError) as exc:runtime_error=str(exc)
    records=[]
    for key in sorted(SPECS):
        row=sources[key];errors=[]
        if not consumer['ok']:errors.append('Observed actual consumer evidence missing, altered or stale')
        checks=list(physics.get(key,[]));sourceissues=[];consumerissues=[]
        if row.get('kind')!='experiment' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Experiment source differs from independent full reading')
        if not checks or not all(c['ok'] for c in checks):errors.append('Independent experiment physics missing or failed')
        if key in SOURCE_ISSUES:sourceissues.append(SOURCE_ISSUES[key]);errors.extend(sourceissues)
        if key in CONSUMER_ISSUES:consumerissues.append(CONSUMER_ISSUES[key]);errors.extend(consumerissues)
        if runtime_error:errors.append(runtime_error)
        comparison=summaries.get(key)
        if comparison:
            checks.append({'claim':'fresh actual adapter/law/apparatus/graph/generated-assessment comparison','ok':comparison['ok'],'mode':'INDEPENDENT_ORACLE_VS_CONSUMER','dimension':{},'caseCount':comparison['caseCount'],'errors':comparison['errors']})
            if not comparison['ok']:errors.append('Independent oracle vs actual experiment consumer failed')
            for i,(echo,x) in enumerate(zip(comparison['formatRoundtrip'],SPECS[key][4:6])):
                want=float(exact_value(key,x));got=echo.get('parsed')
                ok=type(got) in (int,float) and abs(got-want)<=max(.000001,abs(want)*.005)
                checks.append({'claim':'displayed numeric literal roundtrip'+str(i),'ok':ok,'actual':echo,'independentExact':str(exact_value(key,x)),'dimension':{},'mode':'OBSERVED_INPUT_FORMAT_CONFORMANCE'})
                if not ok:errors.append('New unreviewed formatted-answer roundtrip failure')
        elif not runtime_error:errors.append('Fresh actual consumer comparison missing')
        if actual and key=='SIM-C1-L002-04':
            edge=next((c for c in actual[key]['cases'] if c['x']==180),None)
            normal=edge['readings'][2][1] if edge else None
            checks.append({'claim':'antiparallel normal-component display must be exactly zero','ok':normal==0,'actual':normal,'independentExact':'0','dimension':{},'mode':'OBSERVED_ZERO_BOUNDARY_DISPLAY_CONFORMANCE'})

        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
            'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
            'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},
            'sourceScientificReview':{'ok':digest(row)==READ_SOURCE_SHA256[key] and row.get('kind')=='experiment' and not sourceissues and bool(physics.get(key)) and all(c['ok'] for c in physics.get(key,[])),'errors':sourceissues},
            'consumerReview':{'ok':consumer['ok'] and not consumerissues and not runtime_error and bool(comparison and comparison['ok']),'errors':consumerissues},
            'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':MANUAL[key],
            'manualFeasibility':'FAIL_GENERATED_MANUAL_TASK' if key in SOURCE_ISSUES else 'SOURCE_MANUAL_PASS_CONSUMER_FAIL' if key in CONSUMER_ISSUES else 'PASS_AI_EXACT',
            'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],'assetChecksums':{},'figureReview':VISUAL_REVIEW[key],
            'runtimeSha256':hashes,'reviewedRuntimeSha256':READ_RUNTIME,'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,
            'runtimeComparison':comparison,'consumerEvidence':consumer,'verificationMode':'INDEPENDENT_EXISTING_EDITION',
            'failedPublishedEdition':key in SOURCE_ISSUES or key in CONSUMER_ISSUES,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),'draftReviewedCount':0,
        'failedPublishedEditionIds':sorted(set(SOURCE_ISSUES)|set(CONSUMER_ISSUES)),
        'sourceManualityIssueIds':sorted(SOURCE_ISSUES),'consumerInterfaceIssueIds':sorted(CONSUMER_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
