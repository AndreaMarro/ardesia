"""Separate source-first review of Archimedes and floating equilibria.
No candidate authoring imports; signatures cover only exact individually read editions.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json"
EXPECTED_SKILL="C2-L004"
EXPECTED_PREREQUISITES=["C2-L001","C2-L002","C2-L004"]
CANDIDATE_REF='6d9fecbb4f34f50708d8134bba9c068ae6c931e3'
REVIEWED_PACKAGE_SHA256='1826a7d025eace8a99d492d1990d7acec147b6aadbc87d102669079396991ff0'
REVIEWED_BINDINGS_SHA256='0c17e55b39cfd7bb5c92a08c61a84c976498dfc690748288a746b419fe357917'
BATCH='apparent-weight-086'
ASSET_NAME='apparent-weight-steps.svg'
FALSE_PROOF='Il peso del corpo diminuisce fisicamente in acqua, perciò la massa reale diventa T/g e la spinta non va aggiunta nel ricostruire m.'
SVG_MUTATION=(b'M100 850V770', b'M100 850V810')
EXPECTED_IDS={f"AR-u3-apparent-weight-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-apparent-weight-01": "2a667c02d60f12cc5c77cdbc205452af4b32bca6fa9241f4900bff4e88f10d90",
    "AR-u3-apparent-weight-02": "083a9d2afff88b2178ca2938dbbc02e31e1ea81328206fe512a630045aaf280c",
    "AR-u3-apparent-weight-03": "0f2cad2b62feee1c4c04fe4b96b0321c20a27b17c2465ee149d6192e0bd42194",
    "AR-u3-apparent-weight-04": "62e7e2905512f0bd93445eda200fa39d7d93e8aceb776b92694e70af5a5aa0ff",
    "AR-u3-apparent-weight-05": "9e6ab02e276158804de1435f5b0c27db247a21bb0289793852bd550991fbb761",
    "AR-u3-apparent-weight-06": "bb4f9cd4a5887bb879d495205378ee2be0aa1e7132138193149c7c6f5f388c92",
    "AR-u3-apparent-weight-07": "1b5d49faf202d3878fd0d05cf8f3b670c93077fd14beb6c286f143b476ef444b",
    "AR-u3-apparent-weight-08": "f40d69978d3056ecdb6f4dc0da8f78ede2c22df804a150f1fb5e0858580cfcb2",
    "AR-u3-apparent-weight-09": "6efb2eb8912b106e806df1f1e2a4358007860c4d37410650084c2742e57cd323",
    "AR-u3-apparent-weight-10": "8ee807470983572fa5f6015fd7d960dcda966c9faba2b6185ab0e1b8035f9eb6",
    "AR-u3-apparent-weight-11": "19d8d7a33e1c56f7e38087acc1b6c7c8d0668416bd979c77ea19ee26a991a752",
    "AR-u3-apparent-weight-12": "a92fd6338db5e9d800fbd547da7ef733d83263e6baa646423cb6411bd3539714",
    "AR-u3-apparent-weight-13": "55eb62c5297647da1a6b8145195b3fa3a9990025074e90a9b2641b84b3e6b9e9",
    "AR-u3-apparent-weight-14": "f9bdda62e91b676bccf19eaa22674fcd96a766a1d530c1bb7494184b7d80599e",
    "AR-u3-apparent-weight-15": "57de8aeadc63b1c5be5dc4a059a77be120c0b5551d7e0aaea993a71c75f06501",
    "AR-u3-apparent-weight-16": "876cac8d14c3ed9d2ce8b5438b04c7dd81c519d92c68e98d0550c7e3d490b166"
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
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and fit[q]>0 and first!=second
    quantity=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert quantity.magnitude==Fraction(gain)
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])

def physical_tension(mass,volume,density=1,g=10):
    mass,volume,density,g=map(Fraction,(mass,volume,density,g))
    if min(volume,density,g)<=0 or mass<=density*volume:raise ValueError("Suspension from above requires m>rho V>0")
    return (mass-density*volume)*g

def oracle():
    m,V,rho,g,T,a,b,c=sp.symbols("m V rho g T a b c",positive=True)
    law=sp.solve(sp.Eq(T+rho*V*g-m*g,0),T)[0];inverse=sp.solve(sp.Eq(T,law),m)[0];volume=sp.solve(sp.Eq(T,law),V)[0]
    assert sp.simplify(law-g*(m-rho*V))==0
    ratio=sp.cancel(law.subs({m:a*m,V:b*V},simultaneous=True)/law);assert sp.simplify(ratio-(a*m-b*rho*V)/(m-rho*V))==0
    first=law.subs({m:3,V:1,rho:1,g:10});second=law.subs({m:4,V:3,rho:1,g:10})
    weight=(SI.Quantity(3,"kg")*SI.Quantity(10,"meter/second**2")).to("newton");buoyancy=(SI.Quantity(1,"kg/liter")*SI.Quantity(1,"liter")*SI.Quantity(10,"meter/second**2")).to("newton");assert (weight-buoyancy).magnitude==20
    assert (first+second)/2==law.subs({m:sp.Rational(7,2),V:2,rho:1,g:10})==15
    q,z,decoded,affine=calibrate(first,second,60,30,41,21,61,"newton");assert(q,z,decoded,affine)==(3,1,10,30)
    constrained=sp.solve(sp.Eq(law.subs(m,c*V).subs({c:3,rho:1,g:10}),20),V);assert constrained==[1]
    return [first,"N","T = (m − ρV) g","Da 20 a 30 N",inverse.subs({T:20,V:1,rho:1,g:10}),volume.subs({T:20,m:3,rho:1,g:10}),sp.Rational(1,2),40-first,"m = T/g + ρV","(κ₁ U − κ₂ W) / (U − W)",second/first,(first+second)/2,volume.subs({T:10,m:4,rho:1,g:10}),inverse.subs({T:decoded,V:3,rho:1,g:10}),inverse.subs({T:affine,V:1,rho:1,g:10}),constrained[0]]

MANUAL=['Weight is 3 kg×10 m/s²=30 N; buoyancy is 1 kg/L×1 L×10=10 N upward. Equilibrium T+10−30=0 gives T=20 N.', 'Tension is a force, in N. Both mg and rho Vg have dimension ML/T².', 'Positive upward: T+rho Vg−mg=0. Thus T=(m−rho V)g, positive only when m>rho V.', 'At V = 1 L buoyancy stays 10 N. Mass 3→4 kg gives weight 30→40 N and tension 20→30 N.', 'm=T/g+rho V=2 kg+1 kg=3 kg, not apparent mass T/g alone.', 'V=(mg−T)/(rho g)=(30−20)/(10 N/L)=1 L. Positive volume and tension require 0<T<mg.', 'At fixed mass 3 kg, V = 1→2 L changes buoyancy 10→20 N and tension 20→10 N, ratio 1/2.', 'Proposal 40 N minus correct 20 N=+20 N. The proposed sum of weight and buoyancy has the wrong sign.', 'm=T/g+rho V is a sum of masses, not force plus mass.', 'With U=m and W=rho V, the ratio is (aU−bW)/(U−W), both differences strictly positive.', 'B has weight 40 N, buoyancy 30 N and tension 10 N; compared with 20 N gives 1/2, despite greater body mass.', 'Mean tension (20+10)/2=15 N. Mean m 7/2 kg,V 2 L also give 15 N because fixed rho and g make the law linear.', 'Target tension 10 N for mass 4 kg requires buoyancy 30 N, V_B 3 L; V_B/V_A=3. Also 4 kg>3 kg displaced.', 'Gain 3 N^−1 converts reading 30 into 10 N. At V 3 L true mass=T/g+rho V=1+3=4 kg.', 'Gain(21−41)/(10−20)=2 N^−1, offset 1. Reading 61 means 30 N; at V = 1 L mass 4 kg.', 'Constraint m=cV,c 3 kg/L gives T=(c−rho)gV=(20 N/L)V. Reading 20 N uniquely fixesV = 1 L,m 3 kg.']
DISTRACTORS=['30 N is true weight,10 N buoyancy;40 N adds opposite supports incorrectly. Mass is unchanged by immersion.', 'kg mass,L volume,Pa pressure,kg/L density; none is tension.', 'Plus reverses buoyancy,mg omits it,rho Vg is buoyancy alone,extra 2 doubles without basis. A top string cannot supply a negative tension.', '40 N omits buoyancy;80/3 N scales a difference as if proportional to mass alone;20 ignores new mass;10 reverses the mass effect.', 'T/g=2 kg omits displaced mass; subtracting it again gives 1 kg and zero tension, incompatible with 20 N.', 'Using T as buoyancy gives 2 L and does not reproduce T = 20 N; reversing mg−T gives negative volume.', '2 follows buoyancy rather than tension;1/3 is not 10/20;1 ignores change;negative ratio violates taut-string domain.', '−20 reverses error,40 repeats proposal,zero accepts,10 is buoyancy rather than error.', 'Minus removes support twice;gT is not mass;T+rho V adds unlike units;extra 2 fails substitution.', 'Factor quotient/product lose the subtraction; swapped factors change the wrong input; reciprocal reverses B/A.', '2 is inverse;4/3 follows mass only;3 follows volume only;1 ignores different net support demand.', '30 is sum,15/2 halves twice,10 or 20 is a single trial. Mean-input equality follows linearity here only.', '1/3 reverses;2 L would giveT = 20 N;1/2 follows wrong direct trend;4 L reaches excludedT = 0.', 'Raw reading 30 is not 30 N. T/g alone loses 3 kg displaced; reconstructed mass 4 kg returns reading 30.', 'Masses 3,5,2,6 kg at 1 L give tensions 20,40,10,50 N and readings 41,81,21,101, not 61.', 'No quadratic root is present. c ≤ rho would invalidate positive support for any positive V; here coefficient 20 N/L is strictly positive.']
ASSUMPTIONS=['Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.', 'Rigid closed impermeable body completely immersed in static homogeneous water rho = 1 kg/L, g = 10 m/s², suspended by an ideal vertical string from above. No contact, capillary, air or string-volume effects. Domain V>0,m>rho V implies 0<T<mg. The gravitational mass and weight remain unchanged; tension is not the resultant.']
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'kg', 6: 'liter', 7: 'dimensionless', 8: 'newton', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'liter'}
NUMERIC_UNITS={1: 'N', 5: 'kg', 6: 'L', 14: 'kg', 16: 'L'}
OPTION_SUFFIX={7: '', 8: ' N', 11: '', 12: ' N', 13: '', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 850V770', 'M300 850V810', 'M65 235H555', 'M500 770V890'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M100 850V770', 'M300 850V810', 'M500 770V890'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(230, 1180, 40, 40), (180, 280, 40, 40), (150, 1180, 80, 40), (150, 1260, 120, 40)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'The 10×10×10 cm cube has volume 1 L and front 40×40 px at 4 px/cm. It lies fully below surface y235: top y280, bottom y320. Three separate force paths share 4 px/N: tension 20 N has length 80 px upward; buoyancy 10 N has length 40 px upward; weight 30 N has length 120 px downward. Stacked bars 80 + 40 = 120 px equal the separate 120 px weight bar. Complete XML, independent marker paths and full native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-apparent-weight-{n:02}"
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
          "methods":["source_prompt_only_primary_Archimedes_Newton_and_geometric_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Positive supporting tension of a completely immersed body","reference":"Independently sum upward tension and buoyancy against downward weight, and enforce 0<T<mg plus m>rho V in every inverse and comparison."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-02","U2-01")
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
