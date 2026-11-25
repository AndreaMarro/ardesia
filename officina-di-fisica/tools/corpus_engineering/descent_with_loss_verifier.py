"""Independent source-prompt-first physical review, no candidate authoring imports.
Exact edition signatures frozen only after every record and final SVG were read.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json"
CANDIDATE_REF='39fe6d280266b5fcedf4c94040207e910c839e6c'
REVIEWED_PACKAGE_SHA256='a64d162efe508dbc57ddd03d1dd1e45753ce0b43b25831040442851c0443c04d'
REVIEWED_BINDINGS_SHA256='0ccadb1723ddecbc0cdfa75d41e74a0d9fc0490cf51aeb76748c167947d7c1c8'
BATCH='descent-with-loss-068'
ASSET_NAME='descent-with-loss-steps.svg'
FALSE_PROOF='La resistenza descritta vale sempre mu volte la normale, quindi su una guida verticale si annulla e non bisogna sottrarre il lavoro mcL.'
SVG_MUTATION=(b'width="60" height="36"', b'width="120" height="36"')
EXPECTED_IDS={f"AR-u2-descent-with-loss-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-descent-with-loss-01": "1d429d13c16b8b374e79ff51eafddfc58aef88f3dfcbf32bbd576ddb91b5cf62",
    "AR-u2-descent-with-loss-02": "f0a87b9523e42f2b4c4381478b7ca8a376e5eb590411b4983b62f24544b06e11",
    "AR-u2-descent-with-loss-03": "a403db9f6344c593bf7074671b936b8ac403a86eaaaec2d2636f1937abd0f6fa",
    "AR-u2-descent-with-loss-04": "40fd0dcaaa8d24669a5dd9a772d9268e5693a5b179d217d6821110358dae4f90",
    "AR-u2-descent-with-loss-05": "a6438072ed97c1c164b57d292413d4b961f3f9077fba47edab2e65d8125c9dfe",
    "AR-u2-descent-with-loss-06": "f34f100dbf5e4af601feadbf107075f8666de650936cfc76f9ab4d71cd89c8af",
    "AR-u2-descent-with-loss-07": "452ba66075b3baee924c5dc348cc94863274fd6de413704b4adb712692c6d338",
    "AR-u2-descent-with-loss-08": "f2ec05af7c96103a1f0207cbd91c362e0dad4d9475e824fc3f7f8b2b5ce1fac1",
    "AR-u2-descent-with-loss-09": "12befe418f58663502f69bdc29adead93a8c8c8c1cabdc6fde1b2bd020a60f1b",
    "AR-u2-descent-with-loss-10": "3718562acfcfca05fc9102e3840a518dd8a78c49cc89a66611b74f2dff00a794",
    "AR-u2-descent-with-loss-11": "14cf239ef73ddfb14d00c9feeb2ad10bf754d0e42b9feea3c5b5170a9924b439",
    "AR-u2-descent-with-loss-12": "8d2ba1eb007914da4ef991e7cd04e126b1845f9ed1f1f94ba36cb416f449f640",
    "AR-u2-descent-with-loss-13": "fcfb0cb26680dea1102b6a83a3a39e8a7078412d8a25783878d12ae5daf24ece",
    "AR-u2-descent-with-loss-14": "f495862d42aa04bd0b0fff28697fc68758b6e31afa22813270ac5af36e304679",
    "AR-u2-descent-with-loss-15": "80c03c54cb4d5f342fa0e41b22aa5f91afbee66ca67f913c4b9604545f86fa1c",
    "AR-u2-descent-with-loss-16": "d0ed5c1b532752fd31cbb17784dd783314be819b790cfed175669e493695305d"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

# Only exact, individually read literal radicals are recognized beyond rationals.
# This is not an evaluator for arbitrary candidate prose or symbolic formulas.
EXACT_LITERALS={"√2/4":sp.sqrt(2)/4,"√2/2":sp.sqrt(2)/2,"2√2":2*sp.sqrt(2),
 "(4+√2)/4":(4+sp.sqrt(2))/4,"(4+√2)/2":(4+sp.sqrt(2))/2,
 "(4+√2)/8":(4+sp.sqrt(2))/8,"√(5/3)":sp.sqrt(sp.Rational(5,3))}
def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    if raw in EXACT_LITERALS:return EXACT_LITERALS[raw]
    return sp.Rational(raw)

def physical_speed(h,L,g=10,c=1):
    h,L,g,c=map(sp.Rational,(h,L,g,c))
    if not(0<h<=L and c>0 and g*h>c*L):raise ValueError("Inadmissible descent geometry or start domain")
    return sp.sqrt(2*(g*h-c*L))

def oracle():
    m,g,c,h,L,V,a,b,q,z=sp.symbols("m g c h L V a b q z",positive=True)
    law2=sp.solve(sp.Eq(m*V**2/2,m*g*h-m*c*L),V**2)[0];assert law2==2*g*h-2*c*L
    invh=sp.solve(sp.Eq(V**2,law2),h)[0];invL=sp.solve(sp.Eq(V**2,law2),L)[0]
    assert sp.simplify(invh-(V**2+2*c*L)/(2*g))==0 and sp.simplify(invL-(2*g*h-V**2)/(2*c))==0
    acceleration=g*h/L-c;assert sp.simplify(law2-2*acceleration*L)==0
    first=physical_speed(1,2);second=physical_speed(4,8);assert first==4 and second==8
    assert physical_speed(2,2)==6 and physical_speed(1,8)==2
    qwork=(SI.Quantity(10,"meter/second**2")*SI.Quantity(1,"meter")-SI.Quantity(1,"newton/kg")*SI.Quantity(2,"meter")).to("joule/kg");assert qwork.magnitude==8
    mean=(first+second)/2;assert mean==6 and physical_speed(Fraction(5,2),5)==2*sp.sqrt(10)
    gain=(SI.Quantity(12,"")/SI.Quantity(4,"meter/second")).to("second/meter")
    decoded=(SI.Quantity(24,"")/gain).to("meter/second").magnitude;assert gain.magnitude==3 and decoded==8
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,17)],(q,z));assert cal=={q:2,z:1}
    affine=(13-cal[z])/cal[q];assert affine==6
    vertical=invh.subs({V:affine,L:2,g:10,c:1});assert vertical==2 and physical_speed(vertical,2)==affine
    constraint=sp.solve(sp.Eq(law2.subs(h,L/2),16).subs({g:10,c:1}),L);assert constraint==[2]
    assert physical_speed(1,2)==4
    return [first,"m/s","V=√(2gh−2cL)","Da 4 a 6 m/s",invh.subs({V:4,L:2,g:10,c:1}),invL.subs({V:4,h:1,g:10,c:1}),sp.Rational(1,2),8-first,
      "h = (V² + 2 c L) / (2 g)","√(e_B/e_A)",second/first,mean,invL.subs({V:8,h:4,g:10,c:1})/2,
      invh.subs({V:sp.Rational(decoded),L:8,g:10,c:1}),vertical,constraint[0]]

MANUAL=['Fromrest totalworkmgh−mcL=mV²/2. Specificnet10−2=8J/kg,V²16m²/s²,V4m/s.', 'ghandcLbothm²/s²becausecN/kg=m/s²; rootm/s.', 'Weightpositivework,resistanceprescribednegative; V=sqrt(2gh−2cL)>0. Constanttangentialaccelerationgh/L−c positiveiffgh>cL.', 'A h1L2→V4;B h2L2→V6,verticalh=Lallowedbecause resistanceisnotmuN.', 'h=(V²+2cL)/(2g)=(16+4)/20=1m. Check0<h≤L2andgh10>cL2.', 'L=(2gh−V²)/(2c)=(20−16)/2=2m;L≥h1andL<gh/c10.', 'A h1L2→V4;B h1L8→V2,ratio1/2. Bacceleration10/8−1=1/4m/s²positive.', 'Proposed8−correct4=+4m/s. ProposedK/m32J/kg exceedsavailablegravity10J/kg.', 'SquareV,move2cLpositive,divide2g:h=(V²+2cL)/(2g). Inversealso must obeyh≤L.', 'V_A²=2e_A,V_B²=2e_B;ratio sqrt(e_B/e_A). Bothnetworkspositiveandbothgeometricratiosvalid.', 'B h4,L8→V²2(40−8)=64,V8;ratio8/4=2. Sameh/L1/2andacceleration4m/s².', 'Mean(4+8)/2=6m/s. Meaninputs h5/2,L5→sqrt40=2sqrt10m/s;40!=36provesdistinctwithoutdecimal.', 'Vtarget8,h4→L=(80−64)/2=8m;ratio8/2=4. h4≤8and40>8.', 'q3s/m,S24→V8,L8→h(64+16)/20=4m. Raw24wouldh148/5>8invalid.', 'q2s/m,z1,S13→V6,L2→h(36+4)/20=2m=L: validverticalboundary. h1givesS9;h3/2gives1+2sqrt26;h3or4exceedL.', 'h=L/2 yieldsV²=(g−2c)L=(8m/s²)L. V4→L16/8=2m,h1. L1and3giveV²8and24m²/s²respectively,explicitseparatevaluesafterfix.']
DISTRACTORS=['Sqrt2ghignoresloss;resistancecannotaddenergy. Specificloss2J/kgpositivebutlessgravity10;notmechanicalconservation.', 'm²/s²isradicand,Jwouldrequiremass,mnotvelocity,1pure. cnotdimensionlessfrictioncoefficient.', 'Pluswouldpropel;missing2losescinetichalf;bare radicandwrongunit;no-lossformulaonlyc0distinctexperiment.', '8linearlyfollowsheight;unchangedignoresgravityincrease;verticalcaseN0doesnotremove independentlyprescribedresistance.', 'Minuslossininversewrong;ignoringresistancegives4/5mnotrequested1. Domaincheckessential.', 'PositiveLaloneinsufficient:mustL≥handL<gh/c;Vcanotherwiseproduceinvalidgeometry.', '1ignorespathloss;2or4wronglossdirection;1/4ratioofsquaresnot speeds. Longerpathreducesslopebutdrivingstillpositive.', '−4reverseorder;8proposal;2halveserror;resistanceworknegativecannotfundproposalenergy.', 'Minusretainslosswrongside;V²/(2g)ignoresloss;V+2cLinhomogeneoussum;divisiongwithout2doublesheight.', 'e_B/e_Aofsquares;reciprocalreverses;a/bcannotcaptureadditivenetwork; sqrtaonlywithadditionalscaleconstraintnotgiven.', '4forgetssquareroot;1/2inverse;longerpathnotweakerforcewhenmc prescribed.', '12sum;3halvesagain;meaninputssqrt40not6provenbyunequalsquares. Statisticalmeannottemporalmeanofsingletrial.', '2followsspeedonly;8isnewLnumbernotratio;anypositiveLnotautomaticallyvalidwithheight4.', 'Rawdisplayasspeed24givesh29.6m=148/5m>L8. Gainremovalneededbeforephysicalsquare.', '3and4mgeometricallyinvalidL2;1mgivesS9;3/2mV²26andS1+2sqrt26!=13because26!=36. Onlyh2verticalvalid.', 'No rootofLneededaftereliminatingVradical;L4notnumericV4convertedtolength. Correct1m/3malternativesproduce8/24m²/s²not16. Constraint preservesgeometry/startforallL>0.']
ASSUMPTIONS=['Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.', 'Classical point mass constantm>0 startsfromrest onfixedstraightdescendingidealguide with0<h≤L; uniformg10m/s². Prescribedtangentialresistance mc,c1N/kg=1m/s²,opposedtodescent,notCoulombmuNandnoextrastaticthreshold. Normalreactiondoesnowork,nootherworkingforces. gh>cL givespositiveconstanttangentialacceleration,realpositiveV;verticalh=Lpermitted. Worksignandpositiveenergylossdistinguished.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'meter', 6: 'meter', 7: 'dimensionless', 8: 'meter/second', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'meter'}
NUMERIC_UNITS={1: 'm/s', 5: 'm', 6: 'm', 8: 'm/s', 11: '1', 12: 'm/s', 13: '1', 14: 'm', 16: 'm'}
OPTION_SUFFIX={7: '', 15: ' m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M150 220V340H357.8460969082653', 'M150 220L357.8460969082653 340'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(260, 615, 300, 36), (260, 815, 240, 36), (260, 1310, 60, 36), (260, 715, 60, 36), (260, 1210, 240, 36), (260, 1110, 300, 36)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    # SVG decimal is a geometric approximation of 120sqrt(3), not a student calculation.
    dx=357.8460969082653-150
    if abs((dx*dx+120*120)**0.5-240)>1e-10:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Guideverticaldrop120px=1m,Euclideanlength240px=2m at120px/m (horizontalprojection120sqrt3px). Per-massenergybarsat30px/(J/kg):gravity10→300px,loss2→60px,kinetic8→240px. SeparateL8mh1mcase hasloss8→240px,kinetic2→60px,samegravity300pxandsamebarscale;doesnotreusefalsepathgeometry. FullnativepreviewandXMLread.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-descent-with-loss-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent momentum conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # This family has literal N/m choices beyond the common unit table.
        # Check all its numeric alternatives with exact bounded rational parsing;
        # do not infer semantic validity for arbitrary prose or formulas.
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            literals=[]
            for option in row["answer"]["options"]:
                raw=option.replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                try:
                    if len(raw)>80 or (suffix and not raw.endswith(suffix)):raise ValueError("literal unit")
                    if suffix:raw=raw.removesuffix(suffix)
                    literals.append(parse_literal(raw))
                except (ValueError,TypeError):errors.append("Independent literal numeric choice or unit invalid")
            if len(literals)!=len(set(literals)):
                errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        results.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},"manualArithmetic":MANUAL[n-1],
          "physicalAssumptions":ASSUMPTIONS[n-1],"distractors":DISTRACTORS[n-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_vector_Newton_gravity_or_work_derivation","SymPy_exact_vector_or_constitutive_equation_inverse_scaling_calibration_and_physical_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Descent with prescribed mass-proportional resistance and geometric domain","reference":"Before keys derive signed total work mgh−mcL from rest, not Coulomb friction; independently require h≤L and gh>cL including every inverse and the allowed vertical boundary."}}



def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-06","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=sp.Rational(oracle()[number-1])
    duplicate=f"{wanted.p*2}/{wanted.q*2}"+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "force scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_force_length_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong force length escaped independent Newton-scale geometry")
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}


if __name__=="__main__":
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument("--directory",type=Path,required=True)
    parser.add_argument("--asset-root",type=Path);parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args();package=json.loads((args.directory/(BATCH+".json")).read_text())
    bindings=json.loads((args.directory/(BATCH+"-bindings.json")).read_text())
    result=report(package,bindings,args.asset_root);args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count":len(result["records"]),"passed":sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
