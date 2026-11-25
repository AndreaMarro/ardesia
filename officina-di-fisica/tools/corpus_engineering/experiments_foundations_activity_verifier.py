"""Independent original six C1-L001 experiments: source and actual generated tasks.

All numeric physics is correct; original manuality fails for generated95degree
transfer. Two separate actual formatted-answer roundtrip defects are retained.
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
BATCH='experiments-foundations-037'
READ_SOURCE_SHA256={'SIM-C1-L001-01': '95be0791df31f0b0e38b8055a618719112a1b0f0f32b1c76db2eed1664581211', 'SIM-C1-L001-02': 'c170530c1f7116c9574fe3af3a1065bd61500761afb652e79f985d71a5c708de', 'SIM-C1-L001-03': '29dc5d3c82f32dd484b34ecd5be9ae998fce5b57e91596b4e9b63a08e415472c', 'SIM-C1-L001-04': '5040595c576e6ba26e06a372bb12f9e3f8dd69e7e6bc5c5549a5a26c73358d1b', 'SIM-C1-L001-05': '6ebf5c65c1f32d8f6708e2c9e88963abfa842bef3d3882b60c9e408f46b28f91', 'SIM-C1-L001-06': 'e988e5038ec9bd4dbe127ed85df5eb1f6ce5a08a076add82b378ecf146f87bd0'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'fce66f301918483fe79d0f8dbf84c280268e48e615e9c016f2bbd32f699f5075', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '4ee391c0841fed7e1888d2c57cfb2494f8e0be0581a6211d50d410bd172602b9', 'static/js/banchi/voci/legende.js': '2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': 'dc005819f8f12ec48722d32b1d236328ecab75e0734c9ecd0a147751c6bb8fd7', 'static/js/banchi/banco.js': '682ba25fcf97b67821b8c9bb6c73a571c87559f94bbda3f64cfad65fab63cdb8', 'static/js/banchi/misure.js': '8d631c65b0266ece6447da07aff7a43ee61b66d0767ddc24ace3f59b31fac186', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'
READ_BROWSER_PROOF_SHA256='6d927c7f9634a719d3f782a7e7dbb037ed2046de391366019030b7894073b437'
READ_BROWSER_PROTOCOL_SHA256='e11b73cff2eece775a5504fb3fe8bb4c5dbe7d5540ba914217be61173b1e6f20'
SOURCE_ISSUES={'SIM-C1-L001-06':'P2 generated numeric transfer95deg: exact4cos95=-4sin(pi/36) is not a notable-angle manual result; no supplied manual approximation procedure. Actual Number-only assessment rejects exact symbolic expression and requires numeric within0.5percent. First90deg task is valid. Simulator numericalphysics correct; source/consumer-selected task violates calculator-free manual requirement.'}
CONSUMER_ISSUES={'SIM-C1-L001-01':'P2 displayed/input number inconsistency: actual reading2.000µm means2000 in it-IT formatting, but copying numeric literal2.000 is interpreted2 and rejected. Ungrouped2000 accepted. Source physics/units correct.',
'SIM-C1-L001-04':'P2 displayed/input number inconsistency: actual reading8.000kg means8000 in it-IT formatting, but copying numeric literal8.000 is interpreted8 and rejected. Ungrouped8000 accepted. Source physics/units correct.'}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L001-01':(-6,-2,1,-6,-3,-4,'µm'),
'SIM-C1-L001-02':(1,5,1,2,3,4,'cm³'),
'SIM-C1-L001-03':(0,50,1,10,25,26,'cm'),
'SIM-C1-L001-04':(1,5,1,1,2,4,'kg'),
'SIM-C1-L001-05':(1,5,1,2,4,3,'g'),
'SIM-C1-L001-06':(0,180,5,0,90,95,'m/s')}


def exact_value(key,x):
    R=sp.Rational(str(x));i=int(key[-2:])
    if i==1:return 2*10**(R+6)
    if i==2:return R**3
    if i==3:return R/10
    if i==4:return 1000*R**3
    if i==5:return 60*R
    return 4*sp.cos(R*sp.pi/180)


def check(claim,actual,expected,unit='',scope='actual_source_assigned_manual_calculation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    Q=SI.Quantity;R=sp.Rational;x,N,theta=sp.symbols('x N theta',positive=True)
    result={key:[] for key in SPECS}
    manually_solved=[(2,2000,200),(8,27,64),(1,R(5,2),R(13,5)),(1000,8000,64000),(120,240,180),(4,0,-4*sp.sin(sp.pi/36))]
    for key,(_min,_max,step,x0,x1,transfer,unit) in SPECS.items():
        for (label,value),expected in zip((('first reference',x0),('source comparison input',x1),('actual generated transfer',transfer)),manually_solved[int(key[-2:])-1]):
            result[key].append(check(label+' independent exactvalue',exact_value(key,value),expected,unit,
                'unsupported_manual_generated_assignment' if key in SOURCE_ISSUES and label=='actual generated transfer' else 'actual_source_assigned_manual_calculation'))
    result['SIM-C1-L001-01'] += [
        check('micrometre conversion2times10minus6metres',Q(2,'um'),R(2,10**6),'m'),
        check('integer exponents stepone multipliesbyten',sp.simplify((2*10**(x+1+6))/(2*10**(x+6))),10,''),
        check('actual transfer exponentminus4 is200micrometres',Q(R(1,5000),'m'),200,'um'),
    ]
    result['SIM-C1-L001-02'] += [
        check('cubiccentimetre is millionthcubicmetre',Q(1,'cm')**3,R(1,10**6),'m^3'),
        check('doubling everyedge multipliesvolume8',sp.simplify((2*x)**3/x**3),8),
        check('actual comparison3cubed27',sp.Integer(3)**3,27,'cm^3'),
        check('actual transfer4cubed64',sp.Integer(4)**3,64,'cm^3'),
    ]
    result['SIM-C1-L001-03'] += [
        check('actual25millimetres2point5centimetres',Q(25,'mm'),R(5,2),'cm'),
        check('actual26millimetres2point6centimetres',Q(26,'mm'),R(13,5),'cm'),
        check('zeroaperturezeroonbothscales',Q(0,'mm'),0,'cm'),
    ]
    result['SIM-C1-L001-04'] += [
        check('one metre watercube1000kilograms',Q(1000,'kg/m^3')*Q(1,'m')**3,1000,'kg'),
        check('two metre watercube8tonnes',Q(1000,'kg/m^3')*Q(2,'m')**3,8,'metric_ton'),
        check('actual generated4metre cube64tonnes',Q(1000,'kg/m^3')*Q(4,'m')**3,64,'metric_ton'),
    ]
    result['SIM-C1-L001-05'] += [
        check('density60gramsper30cubiccentimetres',Q(60,'g')/Q(30,'cm^3'),2,'g/cm^3'),
        check('sum identicalsamplemassandvolume preservesdensity',sp.simplify(60*N/(30*N)),2,'g/cm^3'),
        check('actual generated3samples180grams',Q(60,'g')*3,180,'g'),
    ]
    result['SIM-C1-L001-06'] += [
        check('projectionfromdotproductalongx',sp.Matrix([4*sp.cos(theta),4*sp.sin(theta)]).dot(sp.Matrix([1,0])),4*sp.cos(theta),'m/s','independent_symbolic_model'),
        check('rotationpreserves squaredspeed16',sp.trigsimp((4*sp.cos(theta))**2+(4*sp.sin(theta))**2),16,'m^2/s^2','independent_symbolic_model'),
        check('actual firstnumericassignment90deg0',4*sp.cos(sp.pi/2),0,'m/s'),
        check('actual transfer95deg exactnegative4sin5deg',sp.trigsimp(4*sp.cos(19*sp.pi/36)),-4*sp.sin(sp.pi/36),'m/s','unsupported_manual_generated_assignment'),
        check('beyond90degree projectionnegative',sp.Integer(int(bool(-4*sp.sin(sp.pi/36)<0))),1,'','independent_symbolic_model'),
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
        if len(cases)!=expected_count:errors.append('Incomplete actual slidergrid')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(field)!=value for field,value in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual parameter domain/default differs')
        for index,case in enumerate(cases):
            x=lo+index*step
            if case.get('x')!=x or not near(case.get('output',{}).get('y'),exact_value(key,x)):errors.append('Actual law differs at control'+str(x))
            elements=case.get('elements',[])
            if not elements:errors.append('Actual apparatus missing')
            if key.endswith('05'):
                boxes=[e for e in elements if e.get('kind')=='box' and e.get('size')==[.77,.88,.77]]
                if len(boxes)!=x:errors.append('Actual identicalsample count differs')
            elif key.endswith(('02','04')):
                boxes=[e for e in elements if e.get('kind')=='box']
                cube=next((e for e in boxes if e.get('alpha')==.66),None)
                if not cube or not all(near(side,sp.Rational(41,100)*x) for side in cube['size']):errors.append('Actual cubegeometry notisotropic/proportionaltoside')
            elif key.endswith(('01','03')):
                jaws=[e for e in elements if e.get('kind')=='box' and e.get('size')==[.1,.72,.22]]
                expected=4*exact_value(key,x)/20000 if key.endswith('01') else sp.Rational(4,50)*x
                if len(jaws)!=2 or not near(jaws[-1]['p'][0]-jaws[0]['p'][0],expected):errors.append('Actual jawspacing differs')
            else:
                arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0x147979]
                if len(arrows)!=1:errors.append('Actual velocityvector missing')
                else:
                    a=arrows[0];dx=a['b'][0]-a['a'][0];dz=a['b'][2]-a['a'][2]
                    if not near(dx,2*sp.cos(sp.Rational(x)*sp.pi/180)) or not near(dz,-2*sp.sin(sp.Rational(x)*sp.pi/180)) or not near(dx*dx+dz*dz,4):errors.append('Actual vectorangle/norm differs')
        assignments=item.get('assessment',[])
        if len(assignments)!=2:errors.append('Actual generated assignments incomplete')
        else:
            for assignment,x in zip(assignments,(x1,transfer)):
                if not near(assignment.get('value'),exact_value(key,x)) or assignment.get('unit')!=unit:errors.append('Actual assigned answer/unit differs from independent law')
        expected_prediction=0 if key.endswith('06') else 2
        if item.get('prediction',{}).get('correct')!=expected_prediction:errors.append('Actual prediction differs')
        if item.get('clock') is not None:errors.append('Unexpected clock/time-dependent model')
        graphs=item.get('graph',[])
        if len(graphs)!=1:errors.append('Actual graph missing')
        else:
            points=graphs[0]['series'][0]['points']
            for x,y in points:
                if not near(y,exact_value(key,x)):errors.append('Actual graph differs from independent law');break
            if key.endswith('05') and (len(points)!=5 or not graphs[0]['series'][0].get('markers')):errors.append('Discrete samplecount incorrectly continuous')
        summaries[key]={'ok':not errors,'caseCount':len(cases),'plannedCaseCount':expected_count,'errors':errors,
                        'firstAssessmentInput':x1,'transferInput':transfer,'manualityIssue':key in SOURCE_ISSUES,
                        'numericPhysicsMatches':not errors,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return summaries

MANUAL={
'SIM-C1-L001-01':'Physical/manual sourcecorrect:2*10^n metres becomes2*10^(n+6)micrometres. Integergrid-6,-5,-4,-3,-2gives2,20,200,2000,20000um; advancingoneexponent multiplies10. Actualgeneratedfirsttaskn-3=>2000um,transfern-4=>200um. No calculator. SeparateconsumerFAIL: displays2.000meaning2000butparserreads2ifcopied.',
'SIM-C1-L001-02':'Physical/manual sourcecorrect:volumeell³withellincm givescm³. References2³8/3³27, generatedtransfer4³64. Countcellsinthreedirections,faceareaell²;doublingsidegives8volume,not2or4.1cm³=1e-6m³becausecubedprefix. Finiteintegerproducts,notcalculatorreadoutonly.',
'SIM-C1-L001-03':'Physical/manual sourcecorrect:1cm10mm, sothenumberincm=x_mm/10. Reference10=>1,25=>5/2=2.5cm; generatedtransfer26=>13/5=2.6cm;zeroaperturezero. Samejawpositions/readingsconvertunits,notphysicalsize. Finitedecimalsmanual.',
'SIM-C1-L001-04':'Physical/manual sourcecorrect:rho1000kg/m³andinnercubeellmetresgives1000ell³kg. References1=>1000kg1t,2=>8000kg8t;generatedtransfer4=>64000kg64t. Rhoisassignedroundedconstant;waterstate/realstructuralcapacitynotinferred. SeparateconsumerFAIL:8.000kgdisplaycopiedisparsed8ratherthan8000.',
'SIM-C1-L001-05':'Physical/manual sourcecorrect:60gpersample,30cm³peridenticalsample. Npiecesmass60N,volume30N,density60N/(30N)=2g/cm³invariantforpositiveintegerN. References2=>120g/4=>240g,generatedtransfer3=>180g. No extensivedensityadditionorclaimarbitrarymixesaddvolumes. N1..5onlyactualcontrol,discretegraphmarkers.',
'SIM-C1-L001-06':'Physicalprojectioncorrect:vx=4cos(theta),vy=4sin(theta),norm²16, rotatingdoesnotchangemagnitude. References0=>4m/s and90=>0, componentnegativebeyond90,180=>-4. FIRSTactualassessment90manual. GeneratedSECONDassessmentis95becausemidpointofthe37point5degreegridafterexcluding0and90is95. Exactanswer4cos(19pi/36)=-4sin(pi/36) is legitimate symbolicbutactualNumbergraderrejectsitandrequiresnumericabout-.34862297within.5percent;no manualtrigapproximationproceduregiven. Simulatorreadout/cosinephysicscorrect;unsupportedmanualassignmentisoriginalFAIL,notbanonalltrigoutputs.'}
ASSUMPTIONS={
'SIM-C1-L001-01':'Idealcaliperdemonstratesdecimalpowers/units, ninteger-6..-2, d2*10^nm,notempiricalpaperthickness/metrologyclaim. Verysmallgapsuseexplicitlabelledzoomdetail;scalarconversionssamephysicalthickness.',
'SIM-C1-L001-02':'Cubeedgepositive1..5cm,Euclideanvolume/facearea,unitcubescm³,constantcommonmetricgeometry. Surfacegriddrawingshowspartitions;nounseenmaterialdensityorprecisioninferred.',
'SIM-C1-L001-03':'Samephysicalcaliperopening0..50mm,linearunitconversioncm/mm,noerrors/offsetassigned. Closingjaws0isvalid;rendererillustrationnotrealcalibrationclaim.',
'SIM-C1-L001-04':'Cubeinnerside1..5mfilledhomogeneouswateratassignedworkingrho1000kg/m³, massesinKg/tonnes,notweightsinnewtons. No realreservoirthermalexpansion/compressibility/structuralengineeringcapacityassertion.',
'SIM-C1-L001-05':'NpositiveintegeridenticalsamplesN1..5,each60g/30cm³,samematerialstate. Addsamematerialmassesandvolumes;densitynotextensive. Pesa60gisordinarymassreadinglanguagewithgunit,notforceunitclaim.',
'SIM-C1-L001-06':'Fixedspeed4m/s,Euclidean2Dvelocityrotation,anglefrom+x0..180degrees,scalarcomponentmeasurementalongx. Arbitrarysin/cosoutputsareinstrumentvalues;onlyactuallyassignednumericgraderquestionscounttowardmanuality. Nonnotable95transferhasno suppliedmanualmethod.'}
PEDAGOGY={key:'Fullsourceandactualadapter/consumerread. Actualgeneratedfirst/transferquestions,prediction,explanation,graph,readingsandapparatuschecked,notjustsource.references. Numericalmodelcorrectnessandmanualtask/consumerinputproblemsareseparate. No source.metadataapprovalorstudentcalibrationclaim.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L001-01':'Readcalibro/meccanicaandgeometria3D/fallback. Mainjawgap4*(d_um/20000),sameµmscale;whenfraction<.06explicitDettagliozoomlabeluses10powerandgapmultipliedconsistently. Idealnotactualmetrologyresolution. Actual3D/fallbackrenderandminzoomviewreviewed;inputgroupingdefectrecordedseparately.',
'SIM-C1-L001-02':'Read3Dcubeconstructionat2.05*x/5sceneunitsisotropically,cellcountxperedgeandthreefamiliesoffacelines. Exactvolumechangesx³,faceareaextra-readingx²;no arbitraryvolumeperpixel. Fallbackobliqueprojectionpreservessame3Dgeometry,notisometricmeasurementfromscreenpixels.',
'SIM-C1-L001-03':'Readsamecaliperlinearjawopening4*x/50,ticks50equalintervals,10mmpercmreadingconsistent. Zerojawgapallowed,notnegativegap. 3D/fallbackrendersactuallyseen.',
'SIM-C1-L001-04':'Readisotropicwatercubegeometryproportionaltox,scaledillustration,notclaimingmetresperrenderunit. x2/x1sidefactor2supportsvolumefactor8. No quantitativeunitcubegridassignedwhenonlyouterboxshown. Actualrenderlabels/readingsshow8000kg;groupingroundtripbugrecordedseparately.',
'SIM-C1-L001-05':'ReadNconstant-sizeboxesatnonoverlappingpositions,eachsamegeometry,correctN1..5count. Extraactualreadingdensity2g/cm³invariant. Diagramnotnumeric30cm³-per-pixelcalibration;no color/opacitymassinference.',
'SIM-C1-L001-06':'Readactualvelocityarroworigin(-.8,.28,0),endpointoffset(2cosθ,0,-2sinθ),fixednorm2sceneunitsfor4m/s;purpleprojectionhasxoffset2cosθandz0. ypositiveisnegativezindrawingplane,matchingylabel. Zero-sizeprojectionomittedat90ratherthanfakearrow. Arrowtipcircularlocusmathematicallytruewithoutclaimingadrawncircle;3D/fallbackreviewed.'}


def runtime_hashes():
    return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    file=APP/'editorial/reviews/experiments-foundations-037-browser-originals.json'
    protocol=APP/'tests/corpus/browser-experiments-foundations.mjs'
    if not file.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed diagnostic consumer evidence missing'}
    actual=sha(file.read_bytes());tool=sha(protocol.read_bytes())
    if actual!=READ_BROWSER_PROOF_SHA256 or tool!=READ_BROWSER_PROTOCOL_SHA256:return {'ok':False,'error':'Observed diagnostic evidence/protocol changed'}
    proof=json.loads(file.read_text())
    ok=(proof.get('terminalStatus')=='PASS' and not proof.get('errors') and proof.get('scientificApproval') is False
        and len(proof.get('cases',[]))==18 and proof.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
        and proof.get('protocolSha256')==tool and proof.get('expectedSourceIssueIds')==sorted(SOURCE_ISSUES)
        and proof.get('expectedConsumerIssueIds')==sorted(CONSUMER_ISSUES))
    for key in SPECS:
        rows=[r for r in proof.get('cases',[]) if r.get('id')==key]
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
                ok=near(echo.get('parsed'),exact_value(key,x))
                # Non-notable04digitformattedtranscendental displays may round;
                # compare readback using the actual grader's .5percent/1e-6bound.
                if key not in CONSUMER_ISSUES:
                    want=float(exact_value(key,x));got=echo.get('parsed');ok=type(got) in (int,float) and abs(got-want)<=max(.000001,abs(want)*.005)
                checks.append({'claim':'displayed numeric literal roundtrip'+str(i),'ok':ok,'actual':echo,'independentExact':str(exact_value(key,x)),'dimension':{},'mode':'OBSERVED_INPUT_FORMAT_CONFORMANCE'})
                if not ok and key not in CONSUMER_ISSUES:errors.append('New unreviewed formatted-answer roundtrip failure')
        elif not runtime_error:errors.append('Fresh actual consumer comparison missing')
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
