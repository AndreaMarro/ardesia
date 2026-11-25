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
CANDIDATE_REF='261bf7d74fe237fe60de7507428f9ad3d84642f9'
REVIEWED_PACKAGE_SHA256='949c940781a2c1fad005484c76abec584ec2c7b0d500ff77c14dcfa6d88b493b'
REVIEWED_BINDINGS_SHA256='ceff3c6551d23b8b8af45b5bd28a929430cfde26fd1b197063d7ca1ca06ae551'
BATCH='archimedes-force-084'
ASSET_NAME='archimedes-force-steps.svg'
FALSE_PROOF='Scendendo più in profondità la sola pressione sul fondo aumenta, quindi aumenta anche la spinta sul corpo rigido completamente immerso.'
SVG_MUTATION=(b'M100 870V750', b'M100 870V790')
EXPECTED_IDS={f"AR-u3-archimedes-force-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-archimedes-force-01": "adad08e2718224cbbad744b8696fb2882d9db0072c5ecdd504fe21eb889567b1",
    "AR-u3-archimedes-force-02": "3e31bcf52778935a225a03546fbcb24f37fae149c5b1343afbdcd25a6a5697ac",
    "AR-u3-archimedes-force-03": "b34cc0c3176935967b5d6e3f751b9f69fdcc4494e1589b9fef4a35ee1458ca7c",
    "AR-u3-archimedes-force-04": "9b9069a456babb6490c0a2b74d1d7d9a5ba371a965a83827019d02b9984fca30",
    "AR-u3-archimedes-force-05": "557a6c4b867faa97f61726cf4b4384bc3fad1653363c7707c7f0d89578ac0026",
    "AR-u3-archimedes-force-06": "272b2529501159db77b8d335a7de451355bcc722040955c9f4fe1db57b478f2f",
    "AR-u3-archimedes-force-07": "25f45d7e2fb948f1fbb1de05b894cb2c582df876d96de801bfe5577382467c1e",
    "AR-u3-archimedes-force-08": "6589df9f07a10e190c30a6a96d3b96da1fdd8173991436299d34e9b0e7948426",
    "AR-u3-archimedes-force-09": "c04a653d80f985aecd8cfac9fcd1f1a20ab74f6413af4ab0212028753091dc60",
    "AR-u3-archimedes-force-10": "dca8ee29f43b445b4e2b8d28aada5441e2bfeaf2f277f24fd9e19d2772699295",
    "AR-u3-archimedes-force-11": "37dc62a07577de02d01ecae07354101d8913034fb1bffe5bc37ff9c634ffb21b",
    "AR-u3-archimedes-force-12": "c9b7b229044c55f7218ad723a8a89ddd5a1c1ebd605149c3150c2c7e5372cb58",
    "AR-u3-archimedes-force-13": "e07ad2048aa07d12f9265c213ce40bac7040b5f8eae25e51fd9971b61fdaa4a3",
    "AR-u3-archimedes-force-14": "e0034bd2f10839ba124dc15cf42d4452ab4410585631cc68a1af97ba0b4033b2",
    "AR-u3-archimedes-force-15": "085b84ab6601e7ed1ea676feba78c945e1efaf4bcb0c4c4e4392251586dd8e29",
    "AR-u3-archimedes-force-16": "7203dc8b3d496fe6b1b76c3655d02ade152289d849a79693e5b977e379f1fc6a"
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

def physical_buoyancy(density,volume,g=10):
    density,volume,g=map(Fraction,(density,volume,g))
    if min(density,volume,g)<=0:raise ValueError("Positive fluid density, displaced volume and gravity required")
    return density*volume*g

def oracle():
    rho,V,g,S,a,b,c=sp.symbols("rho V g S a b c",positive=True)
    law=sp.solve(sp.Eq(S-rho*V*g,0),S)[0]
    inv=sp.solve(sp.Eq(S,law),rho)[0];volume=sp.solve(sp.Eq(S,law),V)[0]
    assert sp.cancel(law.subs({rho:a*rho,V:b*V},simultaneous=True)/law)==a*b
    first=law.subs({rho:1,V:2,g:10});second=law.subs({rho:sp.Rational(4,5),V:5,g:10})
    mass=(SI.Quantity(1,"kg/liter")*SI.Quantity(2,"liter")).to("kg");force=(mass*SI.Quantity(10,"meter/second**2")).to("newton");assert force.magnitude==20
    mean=(first+second)/2;assert mean-law.subs({rho:sp.Rational(9,10),V:sp.Rational(7,2),g:10})==-sp.Rational(3,2)
    q,z,decoded,affine=calibrate(first,second,60,120,41,81,33,"newton");assert(q,z,decoded,affine)==(3,1,40,16)
    x=sp.symbols("x",real=True);roots=sp.solve(sp.Eq(sp.Rational(1,2)*10*x**2,20),x);assert roots==[-2,2]
    assert (SI.Quantity(20,"newton")/SI.Quantity(5,"newton/liter**2")).to("liter**2").magnitude==4
    return [first,"N","Resta uguale","Da 20 a 16 N",inv.subs({S:20,g:10,V:2}),volume.subs({S:20,rho:1,g:10}),sp.Rational(5,2),40-first,"ρ = F_A / (g V)","κ₁ κ₂",second/first,mean,volume.subs({S:40,rho:sp.Rational(4,5),g:10})/2,inv.subs({S:decoded,g:10,V:5}),inv.subs({S:affine,g:10,V:2}),next(r for r in roots if r>0)]

MANUAL=['The displaced fluid has mass (1 kg/L)(2 L)=2 kg; its weight is 20 N. A static fluid replacement requires an upward pressure resultant of that magnitude.', 'Density times volume gives mass, then gravity gives force in N. This is not local pressure in Pa.', 'Translating the same rigid fully immersed volume deeper changes both opposing face pressures; their difference and rho g V remain unchanged.', 'Density changes to 4/5 kg/L at 2 L: mass displaced 8/5 kg and buoyancy 16 N, compared with 20 N.', 'rho=S/(gV)=20 N/[(10 m/s²)(2 L)]=1 kg/L.', 'V=S/(rho g)=20 N/(10 N/L)=2 L, without a geometric root.', 'S_A=20 N and S_B=50 N; B/A=5/2, not the new volume number 5.', 'Proposal minus correct is 40 N−20 N=+20 N.', 'rho=S/(gV), dividing by both positive factors. Force per volume alone is weight density, not mass density.', 'S_B/S_A=(a rho)(b V)/(rho V)=a b at unchanged g.', 'B displaces (4/5)(5)=4 kg; S_B=40 N, ratio 2 to S_A=20 N.', 'Mean outputs (20+40)/2=30 N. Mean inputs rho=9/10 kg/L and V=7/2 L give 63/2 N, larger by 3/2 N.', 'Target 40 N requires displaced mass 4 kg; at 4/5 kg/L this means V_B=5 L and V_B/V_A=5/2.', 'Gain 60/(20 N)=3 N^−1. Reading 120 means 40 N, and 5 L then require rho=4/5 kg/L.', 'Gain (81−41)/(40−20)=2 N^−1, offset 1. Reading 33 means 16 N; at 2 L rho=4/5 kg/L.', 'rho=cV with c=1/2 kg/L² yields S=cgV². V²=4 L² has roots ±2 L; only positive 2 L gives positive density, rho=1 kg/L.']
DISTRACTORS=['40 N doubles the displaced mass; 2 is the mass number, not force. Body weight is unspecified and need not equal buoyancy.', 'kg is mass, L volume, Pa pressure, kg/L density; none is force.', 'Increasing only the bottom pressure ignores the simultaneous top increase. Zero, decrease and automatic doubling do not follow at fixed rho and V.', '25 N reverses the density factor; unchanged 20 ignores it; 8 N adds an extra half; zero violates positive rho and V.', 'Forgetting g gives force per volume. Confusing 1 kg/L with 1000 kg/L loses the exact litre conversion.', 'Copying 20 as litres ignores 10 N/L. A cube root would seek a length, not the asked volume.', '2/5 reverses; 5 copies the new volume number; 1/2 misses the actual volumes; 1 ignores the change.', '−20 reverses subtraction, 40 copies proposal, zero accepts it, 10 halves the error.', 'Multiplying by gV fails isolation; reciprocal has inverse density units; S/V omits g; factor 2 is absent.', 'Quotients reverse one direct dependence; squaring density repeats an input; sum fails identical-trial factor 1.', '1/2 is reciprocal; 4/5 tracks only density; 5/2 only volume; 40 is the new force number, not a pure ratio.', '60 is sum, 15 halves twice, 63/2 is the mean-input trial, 20 is A alone.', '2/5 is inverse; 2 ignores the density reduction; 4/5 follows only density; 5 is the new litre number.', 'Alternative densities 1,2/5,8/5,2 kg/L at 5 L give readings 150,60,240,300, rather than 120.', 'Alternative densities 1,2/5,8/5,2 kg/L at 2 L give readings 41,17,65,81; only 4/5 gives 33.', '4 is the volume squared number. Negative volume also implies negative coupled density; no admissible negative branch exists.']
ASSUMPTIONS=['Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.', 'Rigid closed impermeable volume fully immersed in homogeneous incompressible fluid at rest, g=10 m/s² uniform, no wall or bottom contact, capillary/air/support-volume effects neglected. Buoyancy alone is upward; body weight and support need not equal it. Different preparations may change fluid or body.']
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'kg/liter', 6: 'liter', 7: 'dimensionless', 8: 'newton', 9: 'kg/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'kg/liter', 15: 'kg/liter', 16: 'liter'}
NUMERIC_UNITS={1: 'N', 5: 'kg/L', 6: 'L', 16: 'L'}
OPTION_SUFFIX={7: '', 8: ' N', 11: '', 12: ' N', 13: '', 14: ' kg/L', 15: ' kg/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M70 230H300M340 230H570', 'M350 790V830', 'M100 870V750', 'M350 1030V1110', 'M160 1570V1490', 'M100 1150V990'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M350 790V830', 'M100 870V750', 'M350 1030V1110', 'M160 1570V1490', 'M100 1150V990'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(165, 270, 40, 80), (435, 310, 40, 80)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Geometry 4 px/cm: 10×20 cm fronts 40×80 px, third dimension 10 cm and horizontal face 1 dm². Surface y230; A faces y270/350 imply 10/30 cm, B faces y310/390 imply 20/40 cm. Relative pressures 1/3 and 2/4 kPa imply 10/30 and 20/40 N. Separate force paths use 4 px/N: lengths 40/120,80/160; both differences are 80 px=20 N. All labels, marker paths and full PNG read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-archimedes-force-{n:02}"
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
      "title":"Archimedes force from displaced homogeneous fluid weight","reference":"Replace the immersed closed volume with static fluid, balance its pressure resultant against weight, then preserve full immersion and density invariance in depth translations."}}



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
