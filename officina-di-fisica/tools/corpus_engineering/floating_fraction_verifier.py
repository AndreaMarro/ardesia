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
REVIEWED_PACKAGE_SHA256='9e5c7d6c3542d44f73aee03604e33e10c79de7e380acf55cd043190c705799b1'
REVIEWED_BINDINGS_SHA256='1b231e6e3d08bbbd21f673890929d8ba9cdedc550f2726934456937c883127ba'
BATCH='floating-fraction-085'
ASSET_NAME='floating-fraction-steps.svg'
FALSE_PROOF='Tagliando il blocco omogeneo in due parti, ogni pezzo deve dimezzare anche la frazione immersa perché pesa la metà.'
SVG_MUTATION=(b'width="100" height="50"', b'width="200" height="50"')
EXPECTED_IDS={f"AR-u3-floating-fraction-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-floating-fraction-01": "f7dc4b06d3019a3372fad1ddb334c1180b9d192cbd2a27eae803ba0edded102a",
    "AR-u3-floating-fraction-02": "9cec713d759b371bc4555414754369faf2daec57e595b05a00c125f8fac3b67f",
    "AR-u3-floating-fraction-03": "c4c6bd6065ef2ae581b949da6071452a1c34af424268e15035dc56e103d5f383",
    "AR-u3-floating-fraction-04": "0ad627334a01963a4e0409c4858e22cda558aef7e68854df8e09f1c69139cce8",
    "AR-u3-floating-fraction-05": "7300a9e98d8e12ba9c35f6e1538c901dc456dec1feb505bf48f5647289a0db7a",
    "AR-u3-floating-fraction-06": "886ee3fd9a860c113ae6ab52d723de6f4fe9a57f73af8a94e355a326f69b42bf",
    "AR-u3-floating-fraction-07": "6c4262751ad4dfbf8098a16ba976769f1c7069d99001a47138298c86c00fc19e",
    "AR-u3-floating-fraction-08": "34d1e11ca582a06670d0aac0158b9896d5ce50de8872529e3289ad23b8b9b571",
    "AR-u3-floating-fraction-09": "0439df1055fe41710df96e961c210e3aed44ddfeb969c69c85af2d2c8e2f15b1",
    "AR-u3-floating-fraction-10": "4df22c7b369d4f4dfad1e5ce27299dfe2dee5cd21cc5a00d8375011218a64516",
    "AR-u3-floating-fraction-11": "df44a67ca926b21f9d9879742fecd73f1844ccdde29eb19d1c8ef363b472b53e",
    "AR-u3-floating-fraction-12": "ae4b121bab2862ad94c434206571f8d3bef612aa5ca4b38d50e94a65019aa12c",
    "AR-u3-floating-fraction-13": "ddb128bea0e2118448cb9b44522cd6826e059d8e69aefb643f9f002a38626c69",
    "AR-u3-floating-fraction-14": "b8c9d58d7bf5a92b741c71b712d2529567650bd439e513d691e86a3af50b1989",
    "AR-u3-floating-fraction-15": "f3683105e35f019d4cb239c56e55a2adc1b4c0d836b366e9e0f434d1d2def6f9",
    "AR-u3-floating-fraction-16": "299842015d2cd6c77e657a10589c71275b6da24eaaf58c1be8f3c6f4a8171e97"
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

def physical_fraction(body_density,liquid_density):
    body_density,liquid_density=map(Fraction,(body_density,liquid_density))
    if not 0<body_density<liquid_density:raise ValueError("Partial free floating requires 0<rho_c<rho_l")
    return body_density/liquid_density

def oracle():
    rc,rl,g,V,Vi,f,a,b,c=sp.symbols("rc rl g V Vi f a b c",positive=True)
    immersed=sp.solve(sp.Eq(rl*Vi*g,rc*V*g),Vi)[0];law=sp.cancel(immersed/V);assert law==rc/rl
    inverse=sp.solve(sp.Eq(f,law),rc)[0];liquid=sp.solve(sp.Eq(f,law),rl)[0]
    assert sp.cancel(law.subs({rc:a*rc,rl:b*rl},simultaneous=True)/law)==a/b
    first=law.subs({rc:sp.Rational(1,2),rl:1});second=law.subs({rc:sp.Rational(4,5),rl:2})
    mass=(SI.Quantity(Fraction(1,2),"kg/liter")*SI.Quantity(16,"liter")).to("kg");assert mass.magnitude==8
    volume=(mass/SI.Quantity(1,"kg/liter")).to("liter");assert volume.magnitude==8
    assert (first+second)/2-law.subs({rc:sp.Rational(13,20),rl:sp.Rational(3,2)})==sp.Rational(1,60)
    q,z,decoded,affine=calibrate(first,second,sp.Rational(3,2),sp.Rational(6,5),2,sp.Rational(9,5),sp.Rational(13,5),"dimensionless");assert(q,z,decoded,affine)==(3,1,sp.Rational(2,5),sp.Rational(4,5))
    assert sp.simplify(law.subs(rc,c*rl))==c
    return [first,"1","La frazione di volume immerso","Da 1/2 a 4/5",inverse.subs({f:first,rl:1}),liquid.subs({rc:sp.Rational(1,2),f:first}),sp.Rational(1,2),1-first,"ρ_c = f ρ_l","κ₁ / κ₂",second/first,(first+second)/2,liquid.subs({rc:sp.Rational(4,5),f:second}),inverse.subs({f:decoded,rl:2}),inverse.subs({f:affine,rl:1}),"Infinite"]

MANUAL=['rho_l g V_i=rho_c g V gives f=rho_c/rho_l. At 1/2 kg/L over 1 kg/L, f=1/2.', 'V_i/V and rho_c/rho_l are ratios of equal dimensions, so f has unit 1.', 'Each homogeneous impermeable piece retains rho_c in the same liquid. Its f is unchanged although its mass, weight and absolute displaced volume are smaller.', 'At rho_l=1 kg/L, changing rho_c from 1/2 to 4/5 kg/L makes f rise from 1/2 to 4/5, still below 1.', 'rho_c=f rho_l=(1/2)(1 kg/L)=1/2 kg/L, inside the strict floating domain.', 'rho_l=rho_c/f=(1/2)/(1/2) kg/L=1 kg/L.', 'At rho_c=1/2 kg/L, rho_l=2 kg/L gives f_B=1/4; divided by f_A=1/2 this is 1/2.', 'Proposal 1 minus correct 1/2 gives +1/2, a pure fraction difference.', 'rho_c=f rho_l follows multiplication by the positive liquid density. f<1 ensures rho_c<rho_l.', 'f_B/f_A=(a rc/(b rl))/(rc/rl)=a/b, with both density orders respected.', 'f_B=(4/5)/2=2/5; relative to 1/2 gives 4/5.', 'Mean (1/2+2/5)/2=9/20. Mean input densities 13/20 and 3/2 kg/L give 13/30; difference is 1/60.', 'Target f_B=(4/5)(1/2)=2/5 with rho_c=4/5 requires rho_l=2 kg/L, twice the reference.', 'Gain (3/2)/(1/2)=3; reading 6/5 means f=2/5. At rho_l=2 kg/L the body density is 4/5 kg/L.', 'Gain [(9/5)−2]/[(2/5)−(1/2)]=2 and offset 1. Reading 13/5 means f=4/5, and rho_l=1 gives rho_c=4/5 kg/L.', 'rho_c=rho_l/2 makes the measured f=1/2 redundant. Every rho_l>0 gives a valid positive body density below it; infinitely many pairs.']
DISTRACTORS=['2 is reciprocal and exceeds available volume; 1 is full immersion; 1/4 squares the ratio; zero cannot support positive weight.', 'L is volume, kg/L density, kg mass, N force. A percentage rescales a pure fraction, not its dimension.', 'Each cut piece has less absolute immersed volume, mass, weight and total volume; only the ratio remains unchanged.', '5/4 exceeds the volume; unchanged 1/2 ignores the new density; 2/5 halves without a new factor; 1 is the excluded equal-density boundary.', 'Dividing rho_l by f gives a body denser than the liquid and loses the stated free equilibrium.', 'Multiplying rho_c by f gives 1/4 kg/L, below the body density, contradicting f<1.', '2 reverses density effect; 1/4 is f_B, not B/A; 1 ignores change; a negative ratio is impossible.', '−1/2 reverses subtraction, 1 copies proposal, zero endorses it, 1/4 halves error.', 'rho_l/f exceeds liquid density; f/rho_l has inverse density units; double and half fail substitution.', 'Product reverses liquid effect; reciprocal swaps trials; square repeats body-density scaling; sum fails identity.', '5/4 is reciprocal; 8/5 tracks only body density; 1/2 only liquid density; 2/5 is f_B itself.', '9/10 is sum, 9/40 halves twice, 13/30 is mean-input trial, 1/10 is difference.', '1/2 inverts; 4/5 repeats fraction target; 8/5 repeats body-density factor; 1 would give f_B=4/5, not 2/5.', 'Densities 1/2,2/5,1,8/5 kg/L in liquid 2 kg/L give readings 3/4,3/5,3/2,12/5, not 6/5.', '1/2 and 2/5 kg/L give readings 2 and 9/5. Body density 1 is the no-emergence boundary; 8/5 exceeds the liquid density and invalidates the model.', 'One or two pairs confuse a fixed ratio with absolute densities. Zero pair is excluded and its density ratio undefined.']
ASSUMPTIONS=['Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.', 'Free rigid homogeneous impermeable body in homogeneous static liquid, no support, load, contact, air or surface tension. Positive densities satisfy rho_c<rho_l so 0<f<1. V_i is displaced external volume, not height unless geometry is also assigned. Separate pieces float independently.']
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'kg/liter', 6: 'kg/liter', 7: 'dimensionless', 8: 'dimensionless', 9: 'kg/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'kg/liter', 15: 'kg/liter', 16: 'dimensionless'}
NUMERIC_UNITS={5: 'kg/L', 6: 'kg/L'}
OPTION_SUFFIX={1: '', 7: '', 8: '', 11: '', 12: '', 13: '', 14: ' kg/L', 15: ' kg/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M150 770V690', 'M150 770V850', 'M45 1195H615', 'M65 275H575'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M150 770V690', 'M150 770V850'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(180, 250, 200, 50), (490, 1170, 100, 50), (70, 1170, 200, 50), (350, 1170, 100, 50)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Geometry uses 50 px/dm: the 4×1 dm front measures 200×50 px; the third dimension is 4 dm, giving 16 L total volume. Surface y275 crosses the body halfway, so depth 25 px = 1/2 dm and displaced volume is 8 L. Weight and buoyancy of 80 N have separate opposite paths of 80 px at 1 px/N. Each cut front is 100×50 px, representing a 2×4×1 dm piece: total volume 8 L, immersed volume 4 L, mass 4 kg. The common surface y1195 crosses every piece at half height. All XML and full native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-floating-fraction-{n:02}"
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
      "title":"Free floating volume fraction from two density values","reference":"Independently equate weight and buoyancy for each free body or homogeneous cut piece; preserve 0<rho_c<rho_l and separate volume fractions from absolute displaced volume."}}



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
