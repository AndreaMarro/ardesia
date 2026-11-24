"""Independent source-prompt-first impulse/momentum review; no authoring imports.
Literal signatures cover only fully read candidate, source/provenance and SVG editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical, digest, git_bytes, sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json"
CANDIDATE_REF='4a429daaba2f9e88a25407baa9e75128e10905b1'
REVIEWED_PACKAGE_SHA256='988e9ad153b5179bcb9c4bb10979c3718a7658bbf55fa1ad3a42d6cb6700db83'
REVIEWED_BINDINGS_SHA256='d4e136fe5bf3c3f6fd2dbdf5f6b260b83c20232db13fd5c1aeb8ee6956049697'
BATCH='inelastic-opposed-058'
ASSET_NAME='inelastic-opposed-steps.svg'
FALSE_PROOF='Nell’urto frontale si sommano sempre i moduli delle quantità di moto, perché entrambe le masse hanno quantità di moto positive.'
SVG_MUTATION=(b'M430 180H390', b'M430 180H350')
EXPECTED_IDS={f"AR-u2-inelastic-opposed-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-inelastic-opposed-01": "15a2f945d2cc051fa1759ca4d8585227729ba5ee901d4dfb171ba8c96cf40b78",
    "AR-u2-inelastic-opposed-02": "596e4da0e156443875ebd85de9bd72e27f6b31c1f5802ac0a4409ac1729d32a7",
    "AR-u2-inelastic-opposed-03": "14e654b1a0253e3058f0122c2b37a0855b760930071fdc3753d506817aba43ec",
    "AR-u2-inelastic-opposed-04": "3a6dd4df4a3cf79d963e0675e41ee496cbc4afbdb5ee6912e9a1a7ced910fcb7",
    "AR-u2-inelastic-opposed-05": "7e3edb580c5c580b0312cc7682ccdd9987a250e7a6f3edcccc8ce78e3d4eafd6",
    "AR-u2-inelastic-opposed-06": "9e3f3b1d4d49d0e23e3d2ed543c302cfe67e8f8fc4967fdbb811ac8cc9c329d1",
    "AR-u2-inelastic-opposed-07": "85bc5095e56941b3ffc96c102c826661f7d004a98927d43e1f029e84559c2f1a",
    "AR-u2-inelastic-opposed-08": "d51a905c8b2571ca187ae3c05420537288feb3f2cf1c21a5259990aa8e9e1881",
    "AR-u2-inelastic-opposed-09": "83c1142e31255d6d644f1a9437b7bc694d3fb875ebfac2fe27fb3666cecdd215",
    "AR-u2-inelastic-opposed-10": "eb64d62f3e20d69f1cee40ff1248c714684a7d7c15a965a43b59f463a8e48a1d",
    "AR-u2-inelastic-opposed-11": "49e27cdabcc08c8b273d34c679df5ffe569c407b27512bd92baac8b3f1b21a58",
    "AR-u2-inelastic-opposed-12": "674ebd44c3eb26632c8770120369b22d7c4f68f09cf771ebefdbcd741bfaef84",
    "AR-u2-inelastic-opposed-13": "f082d6d0b621b23a5b033319f4b8fa01fa4e20357b7af4f634a9dd1240191e7b",
    "AR-u2-inelastic-opposed-14": "2c3ce7470e3441814986d4a1b7ade0bc33eab54f70a2d3274a9f273bc87bd032",
    "AR-u2-inelastic-opposed-15": "eebe211e91f517f4659808cd27c99d1ef75f937d4e55b1c44306f0e4970a106f",
    "AR-u2-inelastic-opposed-16": "35bb3b1df99ca533d3b577ba7bf086f1c4ad6af29d4ae7c65d619835062e6863"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,u,w,V,a,b,q,z=sp.symbols("m u w V a b q z",positive=True)
    law=sp.solve(sp.Eq(m*u-m*w,2*m*V),V)[0];assert law==(u-w)/2
    invU=sp.solve(sp.Eq(V,law),u)[0];invW=sp.solve(sp.Eq(V,law),w)[0]
    ratio=sp.cancel(law.subs({u:a*u,w:b*w},simultaneous=True)/law);assert sp.simplify(ratio-(a*u-b*w)/(u-w))==0
    loss=sp.factor(m*(u*u+w*w)/2-2*m*law**2/2);assert loss==m*(u+w)**2/4 and loss.is_positive
    first=law.subs({u:4,w:1});second=law.subs({u:6,w:2})
    quantity=((SI.Quantity(4,"meter/second")-SI.Quantity(1,"meter/second"))/2).to("meter/second");assert quantity.magnitude==Fraction(3,2)
    mean=(first+second)/2;assert mean==sp.Rational(7,4) and mean==law.subs({u:5,w:sp.Rational(3,2)})
    gain=(SI.Quantity(Fraction(9,2),"")/quantity).to("second/meter")
    decoded=(SI.Quantity(6,"")/gain).to("meter/second").magnitude;assert gain.magnitude==3 and decoded==2
    cal=sp.solve([sp.Eq(q*first+z,4),sp.Eq(q*second+z,5)],(q,z));assert cal=={q:2,z:1}
    affine=(6-cal[z])/cal[q];assert affine==sp.Rational(5,2)
    constrained=sp.solve(sp.Eq(law.subs(u,4*w),sp.Rational(3,2)),w);assert constrained==[1]
    assert loss.subs({m:4,u:4,w:1})==25
    assert (m*(u*u+w*w)/2).subs({m:4,u:4,w:1})==34 and (m*law**2).subs({m:4,u:4,w:1})==9
    return [first,"m/s","V=(u−w)/2","Da 3/2 a 5/2 m/s",invU.subs({V:sp.Rational(3,2),w:1}),invW.subs({V:sp.Rational(3,2),u:4}),
      law.subs({u:4,w:2})/first,3-first,"u=2V+w","(κ₁ u − κ₂ w) / (u − w)",second/first,mean,
      invW.subs({V:2,u:6}),invU.subs({V:sp.Rational(decoded),w:2}),invU.subs({V:affine,w:1}),constrained[0]]

MANUAL=['Right-positive momenta m·4−m·1=2mV. Cancel m>0: V=(4−1)/2=3/2 m/s to the right.', 'Difference of velocities divided by dimensionless2 remains m/s.', 'Each incoming component has its sign: +u and−w. Total initial p=m(u−w), final2mV, so V=(u−w)/2.', 'Change u4→6 with w1 fixed gives V3/2→(6−1)/2=5/2 m/s.', 'u=2V+w=2(3/2)+1=4 m/s.', 'w=u−2V=4−3=1 m/s; the second velocity component is−1 m/s.', 'w doubles1→2 at u4, so V=(4−2)/2=1 m/s;ratio1/(3/2)=2/3.', 'Proposed3−correct3/2=+3/2 m/s.', '2V=u−w; add w: u=2V+w. All terms share velocity dimension.', 'V_B/V_A=(a u−b w)/(u−w). Denominator positive u>w; numerator positive requires a u>b w.', 'TrialB u6,w2 gives V2 m/s; ratio2/(3/2)=4/3.', 'Mean(3/2+2)/2=7/4 m/s. Mean input u5,w3/2 gives(5−3/2)/2=7/4 as well, exactly because the map is linear.', 'TargetV2 at u6 needs w=6−4=2 m/s;w_B/w_A=2/1=2.', 'q=(9/2)/(3/2 m/s)=3 s/m; S6→V2 m/s;w2 implies u=4+2=6 m/s.', 'q=(5−4)/(2−3/2)=2 s/m,z1. S6→V5/2 m/s;w1 gives u=5+1=6 m/s.', 'u=4w gives V=(4w−w)/2=3w/2. V3/2 m/s yields unique w1 m/s,u4;linear equation,not square root.']
DISTRACTORS=['5/2 adds speed magnitudes instead of signed momenta;3 omits doubled final mass;−3/2 reverses axis sign;0 requires equal incoming speeds.', 'kg·m/s would be momentum before division by2m;N force,J energy,m length are different.', '(u+w)/2 loses opposing sign;u−w omits final2m;negative formula reverses right-positive direction;quadratic energy relation contradicts sticking.', 'Unchanged3/2 ignores increased rightward momentum;7/2 adds speeds;5 omits final2m;negative direction violates u>w.', '2V−w would be2 m/s and fail givenV;V+w omits factor2;negative speed violates chosen magnitude.', '−1 is the component,not requested speed w;u+2V=7 m/s would reverse finaldirection;V alone3/2 does not isolate w.', '2 follows changed opposing speed directly;3/2 reverses;1 ignores loss of net rightward momentum;negative ratio conflicts both positiveV.', '−3/2 reverses subtraction;3 repeats proposal;0 accepts it;1/2 uses unrelated speed change.', 'u=2V−w changes sign on isolation;u=V+w omits2;division instead of addition fails dimensions/algebra.', 'a/b ignores subtractive weights;plus loses opposing sign;denominator with sum not difference fails identity;new numerator must retainrightwarddomain.', '2 follows u alone;3/2 inverts;4 counts u and w as independent direct factors,losing subtractive momentum.', '7/2 is sum;7/8 halves twice;1/2 is outcome difference;2 is single trial. Equality with mean-input trial is justified here rather than falsely denied.', 'Keeping w1 at u6 givesV5/2,not2;w2 has units while required multiplicative change is2.', 'RawS6 is dimensionless,not6 m/s. Decode2 before inverse;u6>w2 preserves positivefinaldirection.', 'At w1, incoming u4,5,7,12 m/s yield S4,5,7,12;onlyu6 givesS6. Numerical equality S and u here is due selected offset/units,not directidentity.', 'No arbitrary continuum remains afteru=4w andVfixed;zero cannot matchpositiveV,negativew contradicts speed domain.']
ASSUMPTIONS=['Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Requested w is speed, second velocity component−w.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Positive inverse for w also requires0<V<u/2.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. New trial must satisfy a u>b w>0 to keep stated direction.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Equal statistical weights; velocity formula linear so these means commute.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Continuous dimensionless zero-offset display.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Continuous affine display, two distinct final speeds identify gain and offset.', 'Inertial laboratory, two equal positive constant masses, velocities +u right and−w left withu>w>0. Perfectly inelastic sticking; negligible external impulse and external work. Final common componentV>0. Momentum uses signs, kinetic energy is not conserved and its positive loss appears internally. Across-trial constraint u=4w plus final speed fixes unique positivepair.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'meter/second', 6: 'meter/second', 7: 'dimensionless', 8: 'meter/second', 9: 'meter/second', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'meter/second', 15: 'meter/second', 16: 'meter/second'}
NUMERIC_UNITS={5: 'm/s', 6: 'm/s', 13: '1', 14: 'm/s', 16: 'm/s'}
OPTION_SUFFIX={1: ' m/s', 8: ' m/s', 12: ' m/s', 15: ' m/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M290 520H350', 'M130 180H290', 'M430 180H390'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M290 520H350', 'M130 180H290', 'M430 180H390'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(180, 915, 170, 35), (180, 1010, 45, 35)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'All velocities share40 px/(m/s): +4 uses160 px right,−1 uses40 px left,final+3/2 uses60 px right. Explicit illustrative masses4 kg each give p12 kg·m/s before/after; energy bars170 px and45 px at5 px/J yield34 J and9 J,loss25 J. Equal-mass cancellation holds for any positive common mass. Native full preview and SVG marker references read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-inelastic-opposed-{n:02}"
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
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(wanted):errors.append("Independent primary physical exact result mismatch")
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
                    literals.append(sp.Rational(raw))
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
          "methods":["source_prompt_only_primary_impulse_momentum_and_signed_system_derivation","SymPy_exact_momentum_equation_inverse_scaling_calibration_and_positive_branch","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Opposed equal-mass sticking collision with signed momenta","reference":"First choose a right-positive laboratory axis, solve m u−m w=2m V, check positive inverse domains and kinetic loss, then independently check linear means."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-05","U2-01")
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
