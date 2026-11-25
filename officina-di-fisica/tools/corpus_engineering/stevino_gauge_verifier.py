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
CANDIDATE_REF='1ade8258d77a4f365f85d9bacb44d938a699475a'
REVIEWED_PACKAGE_SHA256='f6ab9cc31feaa4eeb7ff6c8fc1d794e5459309aed69bb91a93abb30019146acd'
REVIEWED_BINDINGS_SHA256='141f2077043dc03467e22ed1c350ca557d8c6d07f1478a7e2949290e22ba0b7e'
BATCH='stevino-gauge-076'
ASSET_NAME='stevino-gauge-steps.svg'
EXPECTED_SKILL='C2-L002'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L002']
FALSE_PROOF='La pressione alla stessa profondità deve essere maggiore nel recipiente largo perché contiene una massa totale di liquido maggiore.'
SVG_MUTATION=(b'width="240"', b'width="160"')
EXPECTED_IDS={f"AR-u3-stevino-gauge-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-stevino-gauge-01": "7bfcb44f6569337a3bd5a98f1454834473e1c9195d9a582962c2b21860a3ed26",
    "AR-u3-stevino-gauge-02": "5d74cd0607b99b35c29ccf979e429ed16fb6be4d370edbd16a32856064d2b1a9",
    "AR-u3-stevino-gauge-03": "8d23906ee7eb4dc1bee1132a7dbd067bc191c6849fce97292f1f0db42fa3c9fc",
    "AR-u3-stevino-gauge-04": "c9c20cbc1555e4cfea5f031812b252f6ef389944b14794d4cd52b039bba5ad03",
    "AR-u3-stevino-gauge-05": "9eded0922b3b310afbacc00957a9de7ee01706d959608c4a902c1c78420dc267",
    "AR-u3-stevino-gauge-06": "432c5432195e3bee907b596c216d053cd6b30829e8ca90914f222d471571c25a",
    "AR-u3-stevino-gauge-07": "586953577184e3ecac13562ea91b429890559ab0fda03417ecac28f9402497ed",
    "AR-u3-stevino-gauge-08": "45ae6837c8ed06bae4a9dd62c08b69696af542a5654120f23a10b11a76a2d634",
    "AR-u3-stevino-gauge-09": "6a09b0f44903e6784081f156cc90b36dd1df85eff46910af550306868d9af6f7",
    "AR-u3-stevino-gauge-10": "6794dd3a4f4576735964e9488ac988aaeadc1ba30a9b8bdf5b11a699df30cdb2",
    "AR-u3-stevino-gauge-11": "8317600d4fa65c7d5d2da44a99e7fdd3bfe5c31537cc11b9fa6f8afa5081648e",
    "AR-u3-stevino-gauge-12": "b2c5feda0adbaa9560b3f76aa0fa7246cdabee80d5d636401da05ec28082c748",
    "AR-u3-stevino-gauge-13": "ff43db8c29d41d424c97b38d09e7dd2f910577e49de0f3f029ed79a82ed52990",
    "AR-u3-stevino-gauge-14": "94ce739e437edddc988a15c07155b38482c0c46a4ee41dc403f03497e08d9f4e",
    "AR-u3-stevino-gauge-15": "5341f77df35c635ac06388bbbb288dd99528626278d34550e27e6b96fc948fac",
    "AR-u3-stevino-gauge-16": "6119baa86d8c5790b6541f5e641a3bab5a6d14f9cb0be3ae14fb32f269f1c7b4"
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

def physical_gauge(density_kg_liter,depth_meter,g=10):
    density_kg_liter,depth_meter,g=map(Fraction,(density_kg_liter,depth_meter,g))
    if min(density_kg_liter,depth_meter,g)<=0:raise ValueError("Positive homogeneous density, depth and g required")
    # kg/L to kg/m³ and Pa to kPa cancel their exact1000 factors.
    return density_kg_liter*g*depth_meter

def oracle():
    rho,h,dp,A,g,a,b,c=sp.symbols("rho h dp A g a b c",positive=True)
    law=sp.solve(sp.Eq(dp*A,rho*A*h*g),dp)[0];assert law==rho*g*h
    inverse=sp.solve(sp.Eq(dp,law),rho)[0];depth=sp.solve(sp.Eq(dp,law),h)[0]
    assert sp.cancel(law.subs({rho:a*rho,h:b*h},simultaneous=True)/law)==a*b
    pressure=lambda r,d:(SI.Quantity(Fraction(r),"kg/liter")*SI.Quantity(10,"meter/second**2")*SI.Quantity(Fraction(d),"meter")).to("kilopascal").magnitude
    first=sp.Rational(pressure(1,2));second=sp.Rational(pressure(2,3));assert (first,second)==(20,60)
    mean=(first+second)/2;assert mean-sp.Rational(pressure(Fraction(3,2),Fraction(5,2)))==sp.Rational(5,2)
    q,z,decoded,affine=calibrate(first,second,60,180,41,121,81,"kilopascal");assert(q,z,decoded,affine)==(3,1,60,40)
    x=sp.symbols("x",real=True);roots=sp.solve(sp.Eq(500*10*x**2,20000),x);assert roots==[-2,2]
    accepted=[r for r in roots if r>0];assert accepted==[2]
    coupled=(SI.Quantity(20000,"pascal")/(SI.Quantity(500,"kg/meter**4")*SI.Quantity(10,"meter/second**2"))).to("meter**2");assert coupled.magnitude==4
    return [first,"kPa","Sono uguali","Da 20 a 40 kPa",inverse.subs({dp:20000,g:10,h:2})/1000,depth.subs({dp:20000,rho:1000,g:10}),sp.Rational(3,2),40-first,"ρ = Δp / (g h)","κ₁ κ₂",second/first,mean,depth.subs({dp:60000,rho:2000,g:10})/2,inverse.subs({dp:decoded*1000,g:10,h:3})/1000,inverse.subs({dp:affine*1000,g:10,h:2})/1000,"Una"]

MANUAL=['A vertical prism balance gives dp A=rho A h g. A cancels:1000 kg/m³·10 m/s²·2 m=20000 Pa=20 kPa.', 'rho gh has kg m^−3·m s^−2·m=N/m²; kPa is a valid pressure unit.', 'Same homogeneous fluid, vertical depth, g and common surface pressure imply equal gauge and absolute pressures despite different vessel widths.', 'Changing density from1 to2 kg/L at2 m doubles dp from20 to40 kPa; each trial is homogeneous separately.', 'rho=dp/(gh)=20000/(10·2)=1000 kg/m³=1 kg/L.', 'h=dp/(rho g)=20000/(1000·10)=2 m, vertical depth.', 'Depths2→3 m at same fluid give20→30 kPa; ratio3/2.', 'Proposal40−correct20=+20 kPa. No atmospheric pressure is added to gauge pressure.', 'rho=dp/(gh), with all positive divisors. SI gives kg/m³; convert if answer requested kg/L.', 'Both density and depth enter directly: dp_B/dp_A=κ₁κ₂, independent of vessel width.', 'rho_B2 kg/L,h_B3 m gives60 kPa; ratio60/20=3.', 'Mean(20+60)/2=40 kPa; mean inputsrho3/2 kg/L,h5/2 m give75/2 kPa, lower by5/2.', 'Targetdp60 kPa,rho2 kg/L givesh3 m; relative depth3/2.', 'q60/(20 kPa)=3 kPa^−1; S180→dp60 kPa; h3 m givesrho2 kg/L.', 'q=(121−41)/(60−20)=2 kPa^−1,z1. S81→dp40 kPa at h2 m givesrho2 kg/L.', 'Across uniform-column trials rho=c h,c500 kg/m⁴. dp=cgh² givesh²4 m²; roots±2 m, onlypositive2, rho1 kg/L. Exactly one positive pair; not a spatially stratified density profile.']
DISTRACTORS=['2 kPa loses g10;200 adds extra10;10 drops depthfactor;40 doubles pressure. Density1 kg/L is1000 kg/m³, not1.', 'kg/L isdensity,N force,m/s velocity,kg·m mass-length. kPa alone ispressure.', 'Wider/narrowercontainerchanges totalfluidweightandbottomforcebutnotpressureatequalverticaldepth. Bothzero incompatiblepositivehead;totalvolumedoesnotenterlocalpressure.', '10 kPa invertsdensityfactor;unchanged20 ignoresnewdensity;80 squaresdensityfactor2;zero excludedpositivecolumn.', 'dp g h has wrong units; dp/(g alone) lacks depth; converting Pa to kPa and kg/m³ to kg/L must not be repeated.', 'dp/rho lacks g and is specific energy; length along wall exceeds vertical depth if inclined.', '2/3 reciprocal;3 is new depth number;1/2 is fractional increase, not remaining ratio;1 ignores extra head.', '−20 reverses subtraction;+40 proposal;0 endorses doubling;+10 halves error.', 'dp gh haswrongdimension;gh/dp reciprocaldensity;dp/h lacksdivisionbyg;dp/(g h²) addsanextrameter atdenominator. Onlydp/(gh) yieldsdensity.', 'Quotients invert one directinput;κ₁²κ₂ squaresdensitywithoutbasis;sum failsfactors1identity.', '2 follows density alone;3/2 follows depth alone;1/3 reverses;6 adds anotherfactor2.', '80 sum;20 halves twice;75/2 is pressure at average inputs;50 is neither semisum nor hydrostatic mean of assigned values.', '3 is h_B number;2/3 reciprocal;1/2 keeps initialdensity change but wrong target;6 confuses pressurefactor3 withdepthfactor.', 'Rawdisplay180kPa wouldrho6 kg/L; remove gain3 first. Atmosphere would be an absent datum.', 'rho1,3/2,3,4 kg/L at2 m yieldS41,61,121,161; only2 gives81.', 'Zero andnegative h/rho excluded; two algebraic roots are not two physical pairs. No infinite freedom remains after a genuine quadratic relation and positive-domain pressure datum.']
ASSUMPTIONS=['Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.', 'Homogeneous incompressible static liquid of positive density, uniform g=10 m/s², positive vertical depth below a common reference free surface. dp=p−p_s is gauge relative to that surface, not absolute. Density may differ between trials but is uniform within each; no capillary or container-width pressure term.']
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'kilopascal', 4: 'kilopascal', 5: 'kg/liter', 6: 'meter', 7: 'dimensionless', 8: 'kilopascal', 9: 'kg/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'kg/liter', 15: 'kg/liter', 16: 'dimensionless'}
NUMERIC_UNITS={5: 'kg/L', 6: 'm', 14: 'kg/L'}
OPTION_SUFFIX={1: ' kPa', 7: '', 8: ' kPa', 11: '', 12: ' kPa', 13: '', 15: ' kg/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M170 730V930M440 730V1030', 'M90 150V440H290V150M420 150V440H500V150'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(90, 1375, 160, 40), (91, 190, 198, 250), (421, 190, 78, 250), (90, 1455, 240, 40)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(190, 390), (460, 390), (170, 930), (440, 1030)}<=points:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'First two differently wide vessels share freelevely190 and observationy390, depth200 px=2 m at100 px/m. Comparison freelevel730 with point930/1030 gives2/3 m on one scale. Pressure bars160/240 px at8 px/kPa give20/30 kPa. Full XML/native render show width independence and consistent depth zero.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-stevino-gauge-{n:02}"
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
      "title":"Gauge hydrostatic pressure from a static column balance","reference":"Independently balance pressure forces and weight of an arbitrary vertical liquid prism: delta p=rho g h. Width cancels, density converts exactly, positive coupled roots are filtered."}}



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
