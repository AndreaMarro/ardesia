"""Independent source-prompt-first hydrostatic review; no candidate authoring imports.
Literal edition signatures frozen only after every source/candidate and final SVG were read.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json"
CANDIDATE_REF='cddfc821aa893b745cec2f3032b36734147a4b71'
REVIEWED_PACKAGE_SHA256='248ddfe23e3f1309160b66a1c8627c645bf077a4f59c2f01447d4e9c10dfc84c'
REVIEWED_BINDINGS_SHA256='9b90705db0bac26e3973e8f0993dd7bf98b718fe9f8c2bf289ecd463149b3c41'
BATCH='stevino-absolute-077'
ASSET_NAME='stevino-absolute-steps.svg'
EXPECTED_SKILL='C2-L002'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L002']
FALSE_PROOF='Alla superficie la pressione assoluta deve annullarsi perché la profondità h vale zero, indipendentemente dal gas che la sovrasta.'
SVG_MUTATION=(b'M390 1270L450 1470', b'M90 1270L450 1470')
EXPECTED_IDS={f"AR-u3-stevino-absolute-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-stevino-absolute-01": "d04f2ea13df7fe141d2096944c5a53f3380b8f370b92b2fefb962b9fb78877b9",
    "AR-u3-stevino-absolute-02": "e6c069c2c73f733f23213e636a13cee9c7ff25e59e19c2752b31dd2ff03ebc4b",
    "AR-u3-stevino-absolute-03": "0b9d38f91be5b78a4c41e3607284f7f2f82d8544c472e7981382e5b9b348900a",
    "AR-u3-stevino-absolute-04": "4b2f299c9deb0c437f10384cc487363e580fd4045bc552f3b94e38ab38e746b6",
    "AR-u3-stevino-absolute-05": "931a80ce88398cf6e8aeafaa10e5343691f114a05ea1a163147a3d64fa6726bd",
    "AR-u3-stevino-absolute-06": "09afd4ea64d6aed3d5a0b99aae5671ab759ad2b3d522a1cc4ba71fc95656b5f0",
    "AR-u3-stevino-absolute-07": "434254be4c603c26ae31a6dea9bc123c610c4344d9351e6a65e4751d5b2ee7fc",
    "AR-u3-stevino-absolute-08": "eb501b38294ab361848ada176a35d447fa57c86cef58c34d940250ad174055fa",
    "AR-u3-stevino-absolute-09": "57826daecb4eca648b3d0d282caa5fce360d5b00d223633c6af06aadbb89502c",
    "AR-u3-stevino-absolute-10": "bb984b44d24f092f6681c82e3d018c6647740750291defd462439eba51f459bc",
    "AR-u3-stevino-absolute-11": "76db99f4d79f9c263ff3cc6d4e7e287c59f46872841f0a9f2cba3cd2fc9d3e76",
    "AR-u3-stevino-absolute-12": "7ebd0b275ec318dacc14cba6c3162ffbb50e77ea00d6229411065734afb27291",
    "AR-u3-stevino-absolute-13": "4b7b8aad41b285afbce4a28c9ab5fc3b13d75bda023429c22cf05f48a4767e42",
    "AR-u3-stevino-absolute-14": "c14e3e637afde93034088211f4884c445407ce901bd44dd5f89fbea383e47770",
    "AR-u3-stevino-absolute-15": "499a12ca4558f84bf3943d7840061106ed42cbb4e4e2f079dd2f6512fecd5b61",
    "AR-u3-stevino-absolute-16": "cf5306c026dc885328473e41133623c9169bbe62d1aefe46a28859293b374ed0"
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    return sp.Rational(raw)

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    gain=sp.Rational(reference_reading)/first
    decoded=sp.Rational(new_reading)/gain
    affine=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and affine[q]>0 and first!=second
    physical_gain=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert physical_gain.magnitude==Fraction(gain)
    return gain,affine[z],decoded,sp.cancel((third_reading-affine[z])/affine[q])

def physical_absolute(surface_kpa,depth_meter,gamma_kpa_meter=10):
    surface_kpa,depth_meter,gamma_kpa_meter=map(Fraction,(surface_kpa,depth_meter,gamma_kpa_meter))
    if surface_kpa<=0 or depth_meter<0 or gamma_kpa_meter<=0:raise ValueError("Positive absolute boundary and gradient; nonnegative observation depth required")
    return surface_kpa+gamma_kpa_meter*depth_meter

def positive_depth(pressure_kpa,surface_kpa,gamma_kpa_meter=10):
    pressure_kpa,surface_kpa,gamma_kpa_meter=map(Fraction,(pressure_kpa,surface_kpa,gamma_kpa_meter))
    if pressure_kpa<=surface_kpa or surface_kpa<=0 or gamma_kpa_meter<=0:raise ValueError("Submerged inverse requires p>p_s>0")
    return (pressure_kpa-surface_kpa)/gamma_kpa_meter

def oracle():
    ps,h,p,gamma,a,b,c=sp.symbols("ps h p gamma a b c",positive=True)
    u=sp.symbols("u",nonnegative=True);law=ps+sp.integrate(gamma,(u,0,h));assert law==ps+gamma*h
    inv=sp.solve(sp.Eq(p,law),ps)[0];depth=sp.solve(sp.Eq(p,law),h)[0];assert inv==p-gamma*h
    assert sp.limit(law,h,0,dir="+")==ps
    ratio=sp.cancel(law.subs({ps:a*ps,h:b*h},simultaneous=True)/law)
    assert sp.simplify(ratio-(a*ps+b*gamma*h)/(ps+gamma*h))==0
    head=(SI.Quantity(1000,"kg/meter**3")*SI.Quantity(10,"meter/second**2")*SI.Quantity(2,"meter")).to("kilopascal");assert head.magnitude==20
    first=law.subs({ps:100,gamma:10,h:2});second=law.subs({ps:80,gamma:10,h:1});mean=(first+second)/2
    assert mean==law.subs({ps:90,gamma:10,h:sp.Rational(3,2)})==105
    q,z,decoded,affine=calibrate(first,second,360,270,241,181,201,"kilopascal");assert(q,z,decoded,affine)==(3,1,90,100)
    coupled=sp.solve(sp.Eq(law.subs(ps,c*h).subs({gamma:10,c:50}),120),h)
    assert coupled==[2] and (SI.Quantity(120,"kilopascal")/SI.Quantity(60,"kilopascal/meter")).to("meter").magnitude==2
    return [first,"kPa","A p_s","Da 120 a 100 kPa",inv.subs({p:120,gamma:10,h:2}),depth.subs({p:120,ps:100,gamma:10}),sp.Rational(7,6),240-first,"p_s = p − γ h","(κ₁ U + κ₂ V) / (U + V)",second/first,mean,depth.subs({p:90,ps:80,gamma:10})/2,inv.subs({p:decoded,gamma:10,h:1}),inv.subs({p:affine,gamma:10,h:2}),"Una"]

MANUAL=['p=ps+rho gh=100+20=120 kPa; reference is vacuum, gas boundary pressure is already absolute.', 'Both ps and rho gh have pressure dimension; kPa valid for their sum.', 'At fixedps, h→0+ removes hydrostatic head only, so p→ps, notzero.', 'At h2 m head20 kPa unchanged; ps100→80 givesp120→100 kPa.', 'ps=p−10h=120−20=100 kPa>0; inverse domain p>gamma h checked.', 'h=(p−ps)/gamma=(120−100)/(10 kPa/m)=2 m>0.', 'At ps100, h2→4 gives120→140 kPa; ratio140/120=7/6, not2 because intercept remains.', 'Proposed240−correct120=+120 kPa. This is signed discrepancy, not gauge pressure.', 'ps=p−gamma h, only ifp>gamma h for positive gas pressure. Plus would double count the head.', 'With U=ps,V=gammah pressures, ratio=(κ₁U+κ₂V)/(U+V). Denominator neverzero, both positive.', 'p_B=80+10·1=90 kPa; comparedto120 gives3/4.', 'Mean=(120+90)/2=105 kPa. Average inputsps90,h3/2 give90+15=105 exactly because law is affine-linear.', 'Targetp_B=(3/4)120=90 kPa,ps80 leaveshead10 kPa, h_B1 m. h_B/h_A=1/2.', 'q360/(120 kPa)=3 kPa^−1; S270→p90,h1 givesps80 kPa.', 'q=(181−241)/(90−120)=2 kPa^−1,z1. S201→p100,h2 givesps80 kPa.', 'ps=c h,c50 kPa/m makesp=(c+gamma)h=60h kPa. 120 kPa givesh2 m,ps100 kPa; exactlyonepositivepair, linear notquadratic.']
DISTRACTORS=['20 is gauge head;100 omits depth;200 adds arbitrary boundary term;240 doubles absolutepressure.', 'kg/m³ isdensity,N force,m²/s² specificenergy,kg·m mass-length. kPa alone ispressure.', 'Zero wouldbesurfacegaugepressure,notabsolute;atmosphereisnotnecessarilytheassignedgas;2ps doublecountsboundary;rho g ispressuregradient,notpressure.', '96 kPa appliesgasfactor4/5 towhole120includingunchangedhead;unchanged120 ignoresboundarychange;80 dropshead;20 dropsgasboundary.', 'Addinghead gives140, not100; dividing p byhead isdimensionless; candidate must retainpositiveps.', 'p/gamma gives12 m by treatingpsaszero; ps/gamma10m is notdepth; p<ps would be outsidepositiveh.', '2 treats wholep asdepthproportional;6/7 reciprocal;4/3 changes referenceincorrectly;1 ignoresheadchange.', '−120 reverses order;+240 proposal;0 endorses;+20 is head noterror.', 'p+gammah doublecountshead;p/(gammah) dimensionless;gammah−p reversesinverse;p−gamma/h subtractsincompatiblepressure-per-length². Positivereconstructedps requiresp>gammah.', 'κ₁κ₂ assumesproductlaw;denominatorU omitsbaselinehydrostatichead;swappedκ₂U+κ₁V scaleswronginputs;sum offactorsignoresweightsandfailsidentity.', '4/3 reciprocal;4/5 gas-pressurefactoralone;1/2 depthfactoralone;3/2 unrelatedtoactualtotal.', '210 sum;105/2 halvesagain;90 meanboundarypressurealone;120 firsttrialalone. Equalitywithmeaninputs isvalidhere,notuniversallyfornonlinearrelations.', '2 reciprocal;3/4 ispressurefactor;3/2 increasesdepthwrongway;1 keepshead20 andgives100 not90.', 'Using270 asphysicalpressure wouldps260kPa; remove gain3 before subtractinghead10.', 'ps60,70,90,100 at h2 produceS161,181,221,241; only80 yields201. Gainpositivefromtwonegativecalibrationdifferences.', 'Infinite ignoresindependentlinearconstraint;zerodoesnotyield120kPa;twosolutionsincorrectlytakeasquare root. No boundary pressure invariant is imposed on h across the column afterauthorfix.']
ASSUMPTIONS=['Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.', 'Static homogeneous incompressible water rho1000 kg/m³, uniformg10 m/s². Absolute gaspressureps>0 is uniform on each horizontal surface. Positive h is vertical observation depth and varies along the column; p=ps+gammah,gamma10kPa/m. No second atmospheric term. Numeric inverse data enforce p>ps and p>gammah; conceptual surface limit h→0+ is explicit.']
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'kilopascal', 4: 'kilopascal', 5: 'kilopascal', 6: 'meter', 7: 'dimensionless', 8: 'kilopascal', 9: 'kilopascal', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'kilopascal', 15: 'kilopascal', 16: 'dimensionless'}
NUMERIC_UNITS={5: 'kPa', 6: 'm', 14: 'kPa'}
OPTION_SUFFIX={1: ' kPa', 7: '', 8: ' kPa', 11: '', 12: ' kPa', 13: '', 15: ' kPa'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M390 1270L450 1470', 'M90 1470H450M450 1270V1470', 'M90 1270H530', 'M90 1270V1535'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M90 1270H530', 'M90 1270V1535'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(90, 706, 300, 54), (390, 706, 60, 54)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(390, 1270), (190, 380), (450, 1470)}<=points:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Water freelevel180 and point380 yield2 m at100 px/m. Pressure stack300+60 px at3 px/kPa represents100+20=120 kPa. Pressure horizontal graphorigin90, depthpositive downward from1270: line startsx390 atp100,h0 and ends450,1470 atp120,h2. Nonzero absoluteintercept is preserved. Full labels and native PNG read; markerpaths separate.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-stevino-absolute-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        if row.get("course")!="C2" or row.get("skill")!=EXPECTED_SKILL or row.get("prerequisites")!=EXPECTED_PREREQUISITES or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or lesson mapping mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent hydrostatic conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These reviewed pressure/density choices extend the common unit table.
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
          "methods":["source_prompt_only_primary_normal_force_density_or_hydrostatic_column_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Absolute hydrostatic pressure with a nonzero boundary value","reference":"Independently integrate dp/dh=rho g from actual gas pressure ps, keeping the nonzero intercept and inverse positivity. Surface depth is a variable observation coordinate."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-01","U2-01")
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
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
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
