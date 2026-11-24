"""Independent review from source prompts before candidate keys; no authoring imports.
Exact edition signatures are installed only after complete prose and scaled SVG reading.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json"
CANDIDATE_REF='9b44e8492a11b582bd36ac0a03c7fccf6e21aa43'
REVIEWED_PACKAGE_SHA256='4ac32f34d2cab3254db4c0d30fe52439e2b1f26808eb6485a6043992c1a6b54f'
REVIEWED_BINDINGS_SHA256='3fe1f69ca315c4626b88392e234118442b68f33a3a1fbd412068685f920646a2'
BATCH='incline-acceleration-036'
ASSET_NAME='incline-acceleration-steps.svg'
FALSE_PROOF='Sul piano liscio la normale annulla tutto il peso e quindi l’accelerazione è sempre nulla, anche con s>0.'
SVG_MUTATION=(b'M280 580L280 680', b'M280 580L280 630')
EXPECTED_IDS={f"AR-u2-incline-acceleration-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-incline-acceleration-01": "f88b9c871aeac7afa3124f8dac05617476d03c58ade40729f057a542f40b15b7",
    "AR-u2-incline-acceleration-02": "af1169923338876af4d28e45535d1822623abc5bab7a2de5db58a8d9acd29be5",
    "AR-u2-incline-acceleration-03": "8e042bf9ed4d53cab0f6ceced1e541a7a1dc5aa031d53aae1b8d94af9b34830a",
    "AR-u2-incline-acceleration-04": "7d2583b6ecc777a48ccd4aad213246800528513242ea235b733e7238c9689c8a",
    "AR-u2-incline-acceleration-05": "e62b270f6323ef4884614be1b7f73faa2e0c6fd563217efaf6e64cb4a99292a4",
    "AR-u2-incline-acceleration-06": "605ae38fd6e20b4f4f970a3e7be133ea8fbdec968222fdac16038c86b9af9f8e",
    "AR-u2-incline-acceleration-07": "8310a4fd09f615d6d6a5062be9d40d6f09be6c34933fecde4efe2098dec0fd46",
    "AR-u2-incline-acceleration-08": "fbeb78850f21562ad49237a1b9a0f59de16c0d5653aa3f268cafbcb69ccb3364",
    "AR-u2-incline-acceleration-09": "27df7b84dc659d76fbaf27f34d7cd23783f1efb03de69b68269220b85eab6216",
    "AR-u2-incline-acceleration-10": "267633f839e80f4daa13d6d9f4527a3b8e50723ef9bac07ed39d9f6f2c605b6a",
    "AR-u2-incline-acceleration-11": "3f67b7269b67f9b5a259d743ba7548bdc910db7b778b951147bc157270e7ba8c",
    "AR-u2-incline-acceleration-12": "84c698fb7f6c087fc9144953fca1f4b66f2fd398bb3bf5a7027d47ebd55245cf",
    "AR-u2-incline-acceleration-13": "a74841f737d5ed18c70a3ffddd4b404402e65848752a38a1f2b808e4a8ae2ed0",
    "AR-u2-incline-acceleration-14": "bc8bc8d5751d6b1e2515a8e4d384fcb4a815556baeb20105a46a22699b9e129b",
    "AR-u2-incline-acceleration-15": "78aaca63e4fed5a8f883858d177910d47dd8475b2fcf0b11a8e8aa67437821ab",
    "AR-u2-incline-acceleration-16": "51bbdfd8a47ae27c9099ab493784f61e0656d0126ebc0dac2475023c341c1e47"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,g,s,c,A,N,k1,k2,q,b=sp.symbols("m g s c A N k1 k2 q b",positive=True)
    # Positive tangent is downhill, positive normal is outwards. Smooth fixed
    # contact imposes only a_perp=0; it does not impose zero tangential motion.
    solved=sp.solve([sp.Eq(m*A,m*g*s),sp.Eq(N-m*g*c,0)],(A,N))
    law=sp.factor(solved[A])
    assert sp.simplify(law-g*s)==0 and sp.simplify(solved[N]-m*g*c)==0
    inverse_g=sp.solve(sp.Eq(A,law),g)[0];inverse_s=sp.solve(sp.Eq(A,law),s)[0]
    assert sp.cancel(law.subs({g:k1*g,s:k2*s},simultaneous=True)/law)==k1*k2
    # Substitution s=u/(1+u) proves both positive bounds in the acute domain.
    u=sp.symbols("u",positive=True)
    assert law.subs(s,u/(1+u)).is_positive and sp.factor((g-law).subs(s,u/(1+u))).is_positive
    first=law.subs({g:10,s:sp.Rational(1,2)})
    second=law.subs({g:20,s:sp.Rational(3,5)})
    mean_inputs=law.subs({g:15,s:sp.Rational(11,20)})
    assert (first+second)/2-mean_inputs==sp.Rational(1,4)
    quantity=(SI.Quantity(10,"meter/second**2")*Fraction(1,2)).to("meter/second**2")
    gain=(SI.Quantity(15,"")/quantity).to("second**2/meter")
    decoded=(SI.Quantity(36,"")/gain).to("meter/second**2")
    assert quantity.magnitude==5 and gain.magnitude==3 and decoded.magnitude==12
    calibration=sp.solve([sp.Eq(q*first+b,11),sp.Eq(q*second+b,25)],(q,b))
    assert calibration=={q:2,b:1}
    decoded_affine=(21-calibration[b])/calibration[q]
    z=sp.symbols("z",real=True)
    roots=sp.solve(sp.Eq(20*z*z,5),z)
    assert roots==[-sp.Rational(1,2),sp.Rational(1,2)]
    physical=[r for r in roots if 0<r<1]
    assert physical==[sp.Rational(1,2)]
    assert 20*physical[0]==10
    return [first,"m/s²","A=gs","Da 5 a 10 m/s²",inverse_g.subs({A:5,s:sp.Rational(1,2)}),
      inverse_s.subs({A:5,g:10}),law.subs({g:10,s:sp.Rational(3,5)})/first,10-first,"g=A/s","κ₁κ₂",
      second/first,(first+second)/2,inverse_s.subs({A:second,g:20})/sp.Rational(1,2),
      inverse_g.subs({A:sp.Rational(decoded.magnitude),s:sp.Rational(3,5)}),
      inverse_g.subs({A:decoded_affine,s:sp.Rational(1,2)}),physical[0]]

MANUAL=['mA=mgs gives A=10·(1/2)=5 m/s²; normal Newton separately gives N=mg cosθ, so contact remains positive.', 's=sinθ is a ratio of same-unit lengths. A=gs has dimension length/time², unit m/s².', 'The downhill weight component is mgs. Divide its oriented Newton equation by m>0: A=gs.', 'At fixed s=1/2, g=10→20 m/s² gives A=5→10 m/s²: factor2.', 'A=gs implies g=A/s=5/(1/2)=10 m/s². Denominator s is positive.', 's=A/g=5/10=1/2 lies strictly between0 and1; its positive complementary cosine permits contact.', 'A1=10/2=5 and A2=10·3/5=6 m/s², so A2/A1=6/5.', 'Proposed minus correct: 10−5=+5 m/s². The proposed10 ignores projection.', 'A=gs; divide both sides by s>0: g=A/s. Substitute it back to recover A.', 'New A=(κ1g)(κ2s)=κ1κ2 A; κ1,κ2>0 and0<κ2s<1 preserve the acute-plane domain.', 'A2=20·3/5=12 m/s²; A1=5 m/s²; ratio12/5.', 'Equal-weight output mean=(5+12)/2=17/2 m/s². Mean inputs15 and11/20 give33/4, smaller by1/4 m/s².', 'Target A2=(12/5)·5=12 m/s² at g2=20, hence s2=12/20=3/5; s2/s1=(3/5)/(1/2)=6/5.', 'Zero-offset gain q=15/(5 m/s²)=3 s²/m. S36 decodes A=12 m/s²; g=12/(3/5)=20 m/s².', 'q=(25−11)/(12−5)=2 s²/m, offset1. S21 gives A=(21−1)/2=10 m/s²; g=10/(1/2)=20 m/s².', 'Across selected trials g=(20 m/s²)s, hence A=(20 m/s²)s²=5 m/s². s²=1/4; the acute-angle branch is s=1/2, g=10. The negative root is inadmissible.']
DISTRACTORS=['10 m/s² ignores the parallel projection; mgs is a force before division by mass. No mass-dependent acceleration is permitted in this smooth model.', 'm is length, N force, kg mass, s time; none has acceleration dimension.', 'g/s exceeds g in the acute domain; g ignores projection; zero assumes full equilibrium; gs² inserts the sine twice.', 'Unchanged ignores g;20 quadruples instead of doubles;5/2 uses the reciprocal factor;zero removes a nonzero weight component.', 'Multiplying by s gives5/2 instead of undoing the product; a reciprocal has wrong dimensions. The physical inverse must recover A on substitution.', '1/4 squares the ratio;−1/2 has wrong branch;2 is reciprocal and exceeds1;1 gives a vertical plane, outside the acute domain.', '5/6 reverses the ratio;3/5 is only the new sine;12/5 doubles the ratio;1/5 is the change relative to the first output, not the new/old ratio.', '+10 repeats the proposal;−5 reverses subtraction;zero accepts the error;+5/2 halves the signed error.', 'As fails substitution and underestimates g; s/A has inverse acceleration units; the extra factors2 and1/2 cannot solve A=gs.', 'Ratios κ1/κ2 and κ2/κ1 assign an inverse effect to one positive multiplier; addition fails the unchanged trial; κ1κ2² counts the sine change twice.', '5/12 reverses the output ratio;2 changes only g;6/5 changes only s;24/5 doubles the correct ratio.', '17 is a sum;17/4 divides twice;7 is a difference.33/4 is the output of averaged inputs and differs from the requested mean.', '5/6 is reciprocal;12/5 doubles the compensated ratio;3/5 is s2 rather than s2/s1;2 ignores the target-output ratio.', '36 is a dimensionless display reading, not A or g; divide by calibrated gain before the physical inverse.', '21 or19 treat the display as g or merely remove offset;40 doubles and10 halves the recovered field. Only20 reproduces S21 at s1/2.', '−1/2 is algebraic but not an acute sine;1/4 omits the square root;1 and3/2 fail the target equation, and3/2 also exceeds1.']
ASSUMPTIONS=['Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero. Scaling must preserve0<κ2s<1.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero. Equal statistical weights of the two trial outputs, not mean experimental inputs.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero. Continuous dimensionless display, positive gain and zero offset.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero. Two distinct outputs identify positive gain and constant offset; decoded field remains positive.', 'Fixed smooth plane and inertial frame; uniform field g>0; m>0 constant within trial; only gravity and normal reaction; acute inclination 0<s=sinθ<1 with cosθ>0; maintained contact. Positive tangent downhill gives A=gs in (0,g), regardless of instantaneous tangential velocity; only perpendicular acceleration is zero. g and s are linked between separate trials, not a time-varying field during one motion; use positive root in(0,1).']
UNITS={1: 'meter/second**2', 2: 'meter/second**2', 3: 'dimensionless', 4: 'meter/second**2', 5: 'meter/second**2', 6: 'dimensionless', 7: 'dimensionless', 8: 'meter/second**2', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second**2', 13: 'dimensionless', 14: 'meter/second**2', 15: 'meter/second**2', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'm/s²', 5: 'm/s²', 14: 'm/s²'}
OPTION_SUFFIX={8: ' m/s²', 12: ' m/s²', 15: ' m/s²'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M280 580L328 516', 'M280 580L232 644', 'M280 580L328 616', 'M280 580L280 680', 'M180 1000L228 1036'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or arrow direction changed")
    for e in root.iter():
        if e.get("d") in needed and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return '3–4–5 triangle160×120px; plane tangent(.8,.6),outward normal(.6,−.8). At m1kg,g10,s3/5: P10N100px down; N8N80px outward; Pparallel6N60px downhill; Pperp8N80px inward. Components sum to P and replace it. A6m/s²60px in a separate dimensional panel; mass chosen only for force illustration. All arrowheads present in XML.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-incline-acceleration-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent Newton conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(wanted):errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        results.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},"manualArithmetic":MANUAL[n-1],
          "physicalAssumptions":ASSUMPTIONS[n-1],"distractors":DISTRACTORS[n-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_physical_derivation","SymPy_exact_projection_or_constitutive_law_inverse_scaling_calibration_physical_branch","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Smooth inclined-plane acceleration from oriented Newton projections","reference":"Before candidate keys: solve parallel Newton mA=mgs and normal constraint; verify 0<A<g, geometric input domain and positive physical root."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-03","U2-01")
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
