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
CANDIDATE_REF='dd50a0d31f5b7c291905703badf62d3cd23da68d'
REVIEWED_PACKAGE_SHA256='110e2e9ac6a4aa757c2eaaace3b545519ab2ecb1a73696351a7c033bd9ee31f5'
REVIEWED_BINDINGS_SHA256='e06bcba8946961fb5883e0c7335045978e3638eb34629066d6e843040c165466'
BATCH='maximum-payload-087'
ASSET_NAME='maximum-payload-steps.svg'
FALSE_PROOF='La massima massa aggiuntiva è rho V perché tutta la spinta massima può essere assegnata al carico, senza sottrarre la massa della piattaforma.'
SVG_MUTATION=(b'width="100" height="46"', b'width="200" height="46"')
EXPECTED_IDS={f"AR-u3-maximum-payload-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-maximum-payload-01": "698832e39e9e654048178bf3259783b34e7812058d6ca7e1401801092bf0c809",
    "AR-u3-maximum-payload-02": "5e094929ff8f259424efd44db476fca234b5544a209a67864ab47f5053ea634e",
    "AR-u3-maximum-payload-03": "a968b716567b08f198c727e7ba5617df06774ef7931968b6f9bebaa76b0cb12d",
    "AR-u3-maximum-payload-04": "9fd8f7968186d8c96b0dab7b6f99ac7c9705943a060e4f55e82cfd667146a55d",
    "AR-u3-maximum-payload-05": "0e5b702b39dfd2d256815c406294f4a73b01ccac4894e59415fac806fe46bcbb",
    "AR-u3-maximum-payload-06": "3427beeed05f1864b97f2089f59c686d737b8663cb92325c3cff9102549c8baa",
    "AR-u3-maximum-payload-07": "b2ec3abca89025e929b2d8a1f54f69287e041256542ffdc674d4466b7354abc4",
    "AR-u3-maximum-payload-08": "254f0e66b1f111c10220dbf63956e57c407a1d62ecf4601a1951909812ac9253",
    "AR-u3-maximum-payload-09": "f9f9a4a7cd9c9314a61f66828f192396cd734d113e6a53dd504612cc02fc557f",
    "AR-u3-maximum-payload-10": "bea5ec4767320ee72f098a7214a3e2b401a0863f61f0214a9a305b7d098e0905",
    "AR-u3-maximum-payload-11": "61ed9c8c1846011e83242d80d91068d05377ecac5f29b06b895996a131dd6163",
    "AR-u3-maximum-payload-12": "d831f185fb53164fbd490d158cdef510d0b39ad766c93dc97fbdee1f6799167a",
    "AR-u3-maximum-payload-13": "4f37775fe22deac1d37692b31abe78307054bd30b4acf125c8f2f3e1594309a6",
    "AR-u3-maximum-payload-14": "60f71459a038464baf82f70ec3fc1927406860b8a81b8c459a71b90ec67ae316",
    "AR-u3-maximum-payload-15": "8f6ce68cc888e914b374e094da2164a39a66b48f8b1253032ec0b46bc900da1f",
    "AR-u3-maximum-payload-16": "a551bea444dcb4c27bdea44b515405c9bb9d848c1de280ddf77806ab3d2d996d"
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

def physical_payload(platform_density,volume,liquid_density=1):
    platform_density,volume,liquid_density=map(Fraction,(platform_density,volume,liquid_density))
    if volume<=0 or not 0<platform_density<liquid_density:raise ValueError("Positive residual load requires 0<rho_p<rho and V>0")
    return (liquid_density-platform_density)*volume

def oracle():
    rp,rho,V,g,M,a,b,c=sp.symbols("rp rho V g M a b c",positive=True)
    law=sp.solve(sp.Eq(rho*g*V,(rp*V+M)*g),M)[0];assert law==V*(rho-rp)
    inverse=sp.solve(sp.Eq(M,law),rp)[0];volume=sp.solve(sp.Eq(M,law),V)[0]
    ratio=sp.cancel(law.subs({rp:a*rp,V:b*V},simultaneous=True)/law);assert sp.simplify(ratio-b*(rho-a*rp)/(rho-rp))==0
    first=law.subs({rp:sp.Rational(1,2),rho:1,V:20});second=law.subs({rp:sp.Rational(4,5),rho:1,V:40})
    displaced=(SI.Quantity(1,"kg/liter")*SI.Quantity(20,"liter")).to("kg");own=(SI.Quantity(Fraction(1,2),"kg/liter")*SI.Quantity(20,"liter")).to("kg");assert(displaced-own).magnitude==10
    assert (first+second)/2-law.subs({rp:sp.Rational(13,20),rho:1,V:30})==-sp.Rational(3,2)
    q,z,decoded,affine=calibrate(first,second,30,24,21,17,9,"kg");assert(q,z,decoded,affine)==(3,1,8,4)
    x=sp.symbols("x",real=True);poly=x-x**2/40;roots=sp.solve(sp.Eq(poly,10),x);assert roots==[20]
    assert sp.factor(poly-10)==-(x-20)**2/40 and sp.diff(poly,x).subs(x,20)==0
    assert 0<roots[0]<40 and sp.Rational(1,40)*roots[0]==sp.Rational(1,2)
    return [first,"kg","m_lim = (ρ − ρ_p) V","Da 10 a 4 kg",inverse.subs({M:10,V:20,rho:1}),volume.subs({M:10,rho:1,rp:sp.Rational(1,2)}),sp.Rational(5,2),20-first,"ρ_p = ρ − m_lim/V","κ₂ D_B / D_A",second/first,(first+second)/2,volume.subs({M:8,rho:1,rp:sp.Rational(4,5)})/20,inverse.subs({M:decoded,V:40,rho:1}),inverse.subs({M:affine,V:20,rho:1}),roots[0]]

MANUAL=['Full displacement supports rhoV=20 kg total. Platform mass is(1/2)(20)=10 kg, leaving 10 kg additional theoretical load.', 'Density contrast times volume has mass unit kg. Gravity cancels from vertical force balance.', 'rho gV=(rho_p V+m_lim)g gives m_lim=(rho−rho_p)V. Own weight must be sustained before extra load.', 'At 20 L maximum total mass stays 20 kg. Platform density 4/5 gives own mass 16 kg and residual capacity 4 kg, down from 10.', 'rho_p=rho−m_lim/V=1−10/20=1/2 kg/L, with 0<m_lim<rhoV.', 'Volume=10 kg/(1/2 kg/L)=20 L, positive because density contrast positive.', 'At density 1/2 kg/L, V 20→50 L gives capacity 10→25 kg, ratio 5/2.', 'Proposal 20 kg minus correct 10 kg=+10 kg. Proposal allocates no buoyancy to platform mass.', 'rho_p=rho−m_lim/V, subtracting density from density. Domain 0<m_lim<rhoV enforces 0<rho_p<rho.', 'With density contrasts D_A=rho−rho_p and D_B=rho−a rho_p, new/old capacity is bD_B/D_A.', 'B density 4/5 and volume 40 L gives 8 kg capacity. Relative to 10 kg the ratio is 4/5.', 'Mean capacities(10+8)/2=9 kg. Mean inputs density 13/20 kg/L, volume 30 L give 21/2 kg, greater by 3/2 kg.', 'Target 8 kg at residual density 1/5 kg/L requires 40 L, twice the reference 20 L.', 'Gain 30/(10 kg)=3 kg^−1. Reading 24 means 8 kg capacity; at 40 L rho_p=1−8/40=4/5 kg/L.', 'Gain(17−21)/(8−10)=2 kg^−1, offset 1. Reading 9 means 4 kg; at 20 L rho_p=4/5 kg/L.', 'Constraint rho_p=cV,c 1/40 kg/L². With x=V/L, capacity/kg=x−x²/40. Setting 10 gives(x−20)²=0: one distinct double root 20, inside 0<x<40. The maximum along this family is 10 kg.']
DISTRACTORS=['20 kg is total supported mass, not additional load. 10 N would confuse mass and weight. Dry cargo contributes no extra displacement.', 'N is weight, L volume, Pa pressure and kg/L density. Only kg expresses the requested mass.', 'Adding densities counts platform mass as extra capacity. rho V is total mass, rho_p V own mass. Dividing density contrast by volume has the wrong dimension. Their numerical coincidences at rho_p = rho/2 do not make different symbolic laws equivalent.', '16 kg is own mass, 20 kg total mass. Unchanged 10 kg ignores the heavier platform; 25 kg applies inverse proportionality without the density difference.', 'm_lim/V happens to equal rho_p only when both equal half the liquid density. Generally it is the residual density. Negative density or density above water is invalid.', 'Using liquid density alone omits own mass. 10 L would offer only 5 kg extra. The volume inverse requires no cube root.', '2/5 reverses the comparison; 5 loses the reference scale; 1/2 repeats the density number; 1 ignores larger volume.', '−10 reverses subtraction; 20 repeats the proposal; zero accepts it; 5 halves the error. Extra 20 kg plus own 10 kg would require 30 L, exceeding available 20 L.', 'Addition gives a platform denser than water. V/M has inverse density units and cannot be subtracted from density. M/V is residual density, not generally rho_p. Doubling fails substitution.', 'The product treats own density as direct capacity. The quotient reverses the volume effect. The reciprocal swaps trials; swapping density contrasts reverses their change.', '5/4 is reciprocal; 2 tracks volume alone; 8/5 tracks own density alone; 8 is a capacity number, not a pure ratio.', '18 is the sum; 9/2 halves twice; 21/2 is the mean-input trial; 2 is the difference.', '1/2 is reciprocal; 4/5 repeats the capacity target; 8/5 repeats the own-density factor; 40 is a volume number.', 'At 40 L, densities 1/2 and 1/5 kg/L give readings 60 and 96. Density 1 kg/L leaves zero capacity; 6/5 kg/L lies outside the floating domain.', 'At 20 L, densities 1/2 and 1/5 kg/L give readings 21 and 33. Density 1 kg/L leaves zero capacity; 6/5 kg/L is invalid. Only 4/5 kg/L gives reading 9.', 'A repeated algebraic root is not two different volumes. Every other x in (0,40) has lower capacity by (x−20)²/40 kg. The dry-load limit is theoretical and supplies no operational reserve.']
ASSUMPTIONS=['Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.', 'Rigid homogeneous impermeable platform with 0 < rho_p < rho in quiet homogeneous water of density 1 kg/L. Centered dry load adds weight and displaces no water. Stable vertical equilibrium has no other support. Full external platform volume V is the maximum displacement. m_lim is additional mass at zero freeboard: a theoretical limit, distinct from total mass and a guaranteed operational rating.']
UNITS={1: 'kg', 2: 'kg', 3: 'kg', 4: 'kg', 5: 'kg/liter', 6: 'liter', 7: 'dimensionless', 8: 'kg', 9: 'kg/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'kg', 13: 'dimensionless', 14: 'kg/liter', 15: 'kg/liter', 16: 'liter'}
NUMERIC_UNITS={1: 'kg', 5: 'kg/L', 6: 'L', 16: 'L'}
OPTION_SUFFIX={7: '', 8: ' kg', 11: '', 12: ' kg', 13: '', 14: ' kg/L', 15: ' kg/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M45 300H315M340 300H610'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(210, 775, 100, 46), (110, 775, 100, 46), (75, 280, 200, 40), (430, 250, 60, 50), (370, 300, 200, 40)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'A 5×4×1 dm platform has 20 L volume and 10 kg own mass. At 40 px/dm its front is 200×40 px. The unloaded front has top y280, bottom y320 and waterline y300: depth 20 px, or 1/2 dm. At the loaded limit the front top reaches y300, bottom y340: depth 40 px, or 1 dm. Cargo bottom y300 remains at the surface with no immersed cargo volume. Mass bars 100+100=200 px at 10 px/kg separate own 10 kg from additional 10 kg. Full XML and native rendering confirm the dry load and zero freeboard.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-maximum-payload-{n:02}"
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
      "title":"Ideal dry payload limit from maximum displaced volume","reference":"Independently subtract platform weight from full-volume buoyancy; distinguish additional mass from total supported mass and preserve the zero-freeboard theoretical limit and density domain."}}



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
