"""Independent effective experiment review on the final0e208 runtime; original unsupported-angle probes remain historical boundaries, not new student tasks. No authoring imports or human approval."""
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
BATCH='experiments-foundations-revision-118'
READ_SOURCE_SHA256={'SIM-C1-L001-01': '95be0791df31f0b0e38b8055a618719112a1b0f0f32b1c76db2eed1664581211', 'SIM-C1-L001-02': 'c170530c1f7116c9574fe3af3a1065bd61500761afb652e79f985d71a5c708de', 'SIM-C1-L001-03': '29dc5d3c82f32dd484b34ecd5be9ae998fce5b57e91596b4e9b63a08e415472c', 'SIM-C1-L001-04': '5040595c576e6ba26e06a372bb12f9e3f8dd69e7e6bc5c5549a5a26c73358d1b', 'SIM-C1-L001-05': '6ebf5c65c1f32d8f6708e2c9e88963abfa842bef3d3882b60c9e408f46b28f91', 'SIM-C1-L001-06': 'e988e5038ec9bd4dbe127ed85df5eb1f6ce5a08a076add82b378ecf146f87bd0'}
SOURCE_ISSUES={'SIM-C1-L001-06':'P2 generated numeric transfer95deg: exact4cos95=-4sin(pi/36) is not a notable-angle manual result; no supplied manual approximation procedure. Actual Number-only assessment rejects exact symbolic expression and requires numeric within0.5percent. First90deg task is valid. Simulator numericalphysics correct; source/consumer-selected task violates calculator-free manual requirement.'}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L001-01':(-6,-2,1,-6,-3,-4,'µm'),
'SIM-C1-L001-02':(1,5,1,2,3,4,'cm³'),
'SIM-C1-L001-03':(0,50,1,10,25,26,'cm'),
'SIM-C1-L001-04':(1,5,1,1,2,4,'kg'),
'SIM-C1-L001-05':(1,5,1,2,4,3,'g'),
'SIM-C1-L001-06':(0,180,5,0,90,180,'m/s')}


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
    manually_solved=[(2,2000,200),(8,27,64),(1,R(5,2),R(13,5)),(1000,8000,64000),(120,240,180),(4,0,-4)]
    for key,(_min,_max,step,x0,x1,transfer,unit) in SPECS.items():
        for (label,value),expected in zip((('first reference',x0),('source comparison input',x1),('actual generated transfer',transfer)),manually_solved[int(key[-2:])-1]):
            result[key].append(check(label+' independent exactvalue',exact_value(key,value),expected,unit,
                'actual_effective_assigned_manual_calculation'))
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
        check('historical legacy95deg boundary, not a revised assignment',sp.trigsimp(4*sp.cos(19*sp.pi/36)),-4*sp.sin(sp.pi/36),'m/s','historical_boundary_not_a_new_student_task'),
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
'SIM-C1-L001-01':'Physical/manual sourcecorrect:2*10^n metres becomes2*10^(n+6)micrometres. Integergrid-6,-5,-4,-3,-2gives2,20,200,2000,20000um; advancingoneexponent multiplies10. Actualgeneratedfirsttaskn-3=>2000um,transfern-4=>200um. No calculator. Current formatter displays2000 without grouping; actual copied literal is accepted. Historical2.000→2 failure remains in037.',
'SIM-C1-L001-02':'Physical/manual sourcecorrect:volumeell³withellincm givescm³. References2³8/3³27, generatedtransfer4³64. Countcellsinthreedirections,faceareaell²;doublingsidegives8volume,not2or4.1cm³=1e-6m³becausecubedprefix. Finiteintegerproducts,notcalculatorreadoutonly.',
'SIM-C1-L001-03':'Physical/manual sourcecorrect:1cm10mm, sothenumberincm=x_mm/10. Reference10=>1,25=>5/2=2.5cm; generatedtransfer26=>13/5=2.6cm;zeroaperturezero. Samejawpositions/readingsconvertunits,notphysicalsize. Finitedecimalsmanual.',
'SIM-C1-L001-04':'Physical/manual sourcecorrect:rho1000kg/m³andinnercubeellmetresgives1000ell³kg. References1=>1000kg1t,2=>8000kg8t;generatedtransfer4=>64000kg64t. Rhoisassignedroundedconstant;waterstate/realstructuralcapacitynotinferred. Current formatter displays8000/64000 without grouping, and copied values are accepted. Historical grouped display failure remains in037.',
'SIM-C1-L001-05':'Physical/manual sourcecorrect:60gpersample,30cm³peridenticalsample. Npiecesmass60N,volume30N,density60N/(30N)=2g/cm³invariantforpositiveintegerN. References2=>120g/4=>240g,generatedtransfer3=>180g. No extensivedensityadditionorclaimarbitrarymixesaddvolumes. N1..5onlyactualcontrol,discretegraphmarkers.',
'SIM-C1-L001-06':'Physicalprojectioncorrect:vx=4cos(theta),vy=4sin(theta),norm²16, rotatingdoesnotchangemagnitude. References0=>4m/s and90=>0, componentnegativebeyond90,180=>-4. FIRSTactualassessment90manual. GeneratedSECONDassessmentis95becausemidpointofthe37point5degreegridafterexcluding0and90is95. Exactanswer4cos(19pi/36)=-4sin(pi/36) is legitimate symbolicbutactualNumbergraderrejectsitandrequiresnumericabout-.34862297within.5percent;no manualtrigapproximationproceduregiven. Simulatorreadout/cosinephysicscorrect;unsupportedmanualassignmentisoriginalFAIL,notbanonalltrigoutputs.'}
ASSUMPTIONS={
'SIM-C1-L001-01':'Idealcaliperdemonstratesdecimalpowers/units, ninteger-6..-2, d2*10^nm,notempiricalpaperthickness/metrologyclaim. Verysmallgapsuseexplicitlabelledzoomdetail;scalarconversionssamephysicalthickness.',
'SIM-C1-L001-02':'Cubeedgepositive1..5cm,Euclideanvolume/facearea,unitcubescm³,constantcommonmetricgeometry. Surfacegriddrawingshowspartitions;nounseenmaterialdensityorprecisioninferred.',
'SIM-C1-L001-03':'Samephysicalcaliperopening0..50mm,linearunitconversioncm/mm,noerrors/offsetassigned. Closingjaws0isvalid;rendererillustrationnotrealcalibrationclaim.',
'SIM-C1-L001-04':'Cubeinnerside1..5mfilledhomogeneouswateratassignedworkingrho1000kg/m³, massesinKg/tonnes,notweightsinnewtons. No realreservoirthermalexpansion/compressibility/structuralengineeringcapacityassertion.',
'SIM-C1-L001-05':'NpositiveintegeridenticalsamplesN1..5,each60g/30cm³,samematerialstate. Addsamematerialmassesandvolumes;densitynotextensive. Pesa60gisordinarymassreadinglanguagewithgunit,notforceunitclaim.',
'SIM-C1-L001-06':'Fixedspeed4m/s,Euclidean2Dvelocityrotation,anglefrom+x0..180degrees,scalarcomponentmeasurementalongx. Arbitrarysin/cosoutputsareinstrumentvalues;onlyactuallyassignednumericgraderquestionscounttowardmanuality. Original95transfer remains a separate published-edition FAIL; new selected90/180 tasks are exact.'}
PEDAGOGY={key:'Fullsourceandactualadapter/consumerread. Actualgeneratedfirst/transferquestions,prediction,explanation,graph,readingsandapparatuschecked,notjustsource.references. Numericalmodelcorrectnessandmanualtask/consumerinputproblemsareseparate. No source.metadataapprovalorstudentcalibrationclaim.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L001-01':'Readcalibro/meccanicaandgeometria3D/fallback. Mainjawgap4*(d_um/20000),sameµmscale;whenfraction<.06explicitDettagliozoomlabeluses10powerandgapmultipliedconsistently. Idealnotactualmetrologyresolution. Actual3D/fallbackrenderandminzoomviewreviewed;current ungrouped display/input roundtrip separately verified; historical failure retained.',
'SIM-C1-L001-02':'Read3Dcubeconstructionat2.05*x/5sceneunitsisotropically,cellcountxperedgeandthreefamiliesoffacelines. Exactvolumechangesx³,faceareaextra-readingx²;no arbitraryvolumeperpixel. Fallbackobliqueprojectionpreservessame3Dgeometry,notisometricmeasurementfromscreenpixels.',
'SIM-C1-L001-03':'Readsamecaliperlinearjawopening4*x/50,ticks50equalintervals,10mmpercmreadingconsistent. Zerojawgapallowed,notnegativegap. 3D/fallbackrendersactuallyseen.',
'SIM-C1-L001-04':'Readisotropicwatercubegeometryproportionaltox,scaledillustration,notclaimingmetresperrenderunit. x2/x1sidefactor2supportsvolumefactor8. No quantitativeunitcubegridassignedwhenonlyouterboxshown. Actualrenderlabels/readingsshow8000kg;current ungrouped display/input roundtrip verified; historical failure retained.',
'SIM-C1-L001-05':'ReadNconstant-sizeboxesatnonoverlappingpositions,eachsamegeometry,correctN1..5count. Extraactualreadingdensity2g/cm³invariant. Diagramnotnumeric30cm³-per-pixelcalibration;no color/opacitymassinference.',
'SIM-C1-L001-06':'Readactualvelocityarroworigin(-.8,.28,0),endpointoffset(2cosθ,0,-2sinθ),fixednorm2sceneunitsfor4m/s;purpleprojectionhasxoffset2cosθandz0. ypositiveisnegativezindrawingplane,matchingylabel. Zero-sizeprojectionomittedat90ratherthanfakearrow. Arrowtipcircularlocusmathematicallytruewithoutclaimingadrawncircle;3D/fallbackreviewed.'}


# Frozen after independent full reading of final candidate and rendered asset.
PACKAGE_NAME='experiment-projection-revision-118'
REVISION_ID='SIM-C1-L001-06'
REVIEWED_REVISIONS={'SIM-C1-L001-06':'3bf6058331928c048d2fbcb35b38bad2442934c62d0d1020ffe0effdc7ce4a1d'}
MANUAL[REVISION_ID]='NEW DRAFT: v=4m/s; vx=v cos(theta). Orthogonal90deg gives0; antiparallel180deg gives-4m/s. Speed remains4, since16cos²+16sin²=16. Inverse vx/cos(theta) is valid only when cos(theta) is nonzero; at90deg0/0 cannot recover speed. The domain0..180 uniquely gives180deg for vx=-v. Selection is explicitly90/180 in the actual consumer, replacing unsupported numeric95deg. No nonnotable decimal trig task remains.'
VISUAL_REVIEW[REVISION_ID]='Uploaded SVG XML/native render read: three equal72px velocity arrows represent4m/s at0(right),90(up),180(left), common18px per m/s. Components+4/0/-4 are consistent; zero projection omitted. All15 authored blocks delivered through native bench reading panel, with progressive reader and exact formulas.'

def verify(sources, package=None, bindings=None):
    from .experiments_revision_review import verify_family
    import sys
    return verify_family(sys.modules[__name__],sources,package,bindings)


def report(sources, package=None, bindings=None):
    from .experiments_revision_review import family_report
    import sys
    return family_report(sys.modules[__name__],sources,package,bindings)
