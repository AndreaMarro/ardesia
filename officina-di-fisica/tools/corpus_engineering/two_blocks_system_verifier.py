"""Independent Newton oracle for sixteen read two-block train problems.

Primary equations were solved from the original prompts before reading either
source keys or candidate keys. No authoring module is imported. Literal reading
signatures are frozen only after the complete candidate and SVG review.
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
CANDIDATE_REF="4ed4654cce858baa08952048b94429dfeba27e56"
REVIEWED_PACKAGE_SHA256="b75ba43df309e1b78df81a26ca4d74409068e1e4992c5da605808e8a04b6cc39"
REVIEWED_BINDINGS_SHA256="7d1fd1bdeb22a08a38fc7383a5c04fb2e3a57e1414b8c717eac649f72c92832d"
EXPECTED_IDS={f"AR-u2-two-blocks-system-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-two-blocks-system-01": "a62b347a3e9322bd7b331bcc377e4b6f847bda17bcd576b4b159ec361720fb94",
    "AR-u2-two-blocks-system-02": "ba331d7c734cb20f1d3d9dac883d24d2555c13db0ec541d69b0f8d2512cb401e",
    "AR-u2-two-blocks-system-03": "671bcf6793e30f426b5dbe2c774595dc62a496e3cd3aa01d914d024536cf51f8",
    "AR-u2-two-blocks-system-04": "22b2f43ff811f12bb84df935106ac7df56fe67a0ca80568e0fa8fb7ca52a2ebb",
    "AR-u2-two-blocks-system-05": "470b4964943ba1a1974d7956703dfb2f2dbf0cf7535cdcc9dbdb4c7b943d65d8",
    "AR-u2-two-blocks-system-06": "ebfd9a41be9f510ca0fcdf555e2c8718a86379f077cfccfa6d6529549c95c426",
    "AR-u2-two-blocks-system-07": "a3c5d81040710fe50c8e5ef1f6883e2e8fd3541bba4af55f94bee8abe023fa19",
    "AR-u2-two-blocks-system-08": "ac16a235b3904887dca6c89d1f0df0c366ba7c84e60e158996444252c6c54308",
    "AR-u2-two-blocks-system-09": "25d4074cb71d634696a7f2e9e757270ded471e6e56bcdf9642e949c1a1547d37",
    "AR-u2-two-blocks-system-10": "32a3db713c54c80b15fca66c384189b89925078553e12204fe723c1c4a4f3eed",
    "AR-u2-two-blocks-system-11": "8ac2481f0b722fb755e56ba8061d0b9438d14672ee882d51fe5497ef5d180354",
    "AR-u2-two-blocks-system-12": "3ea087a4701cf97b3a2397f8e549ba94eda96e9958ab5e4394ac9c2c8c56de3e",
    "AR-u2-two-blocks-system-13": "8a1d306903a8a97a0c3c90452ca6e19eb62e986ec1cf44076979d3209450e658",
    "AR-u2-two-blocks-system-14": "ac7ad3b843a49ab9cecdb46011e3a7ebf3199882e122b0d095bab5212610fe43",
    "AR-u2-two-blocks-system-15": "1471d8585b1a780518b1edcc15c081ca66cccc0ac44c018e057aa12bc4a0a212",
    "AR-u2-two-blocks-system-16": "ee2912d32cac93e847de7cf7444af64286961e91011d469f5bbd94528b8aeda4"
}
BATCH="two-blocks-system-033"
ASSET_NAME="two-blocks-system-steps.svg"


@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}


def oracle():
    force,tension,front,rear,acc,k1,k2,gain,offset=sp.symbols("F T M m A k1 k2 gain offset",positive=True)
    # Force is applied to the leading front block. The string pulls the rear
    # block forward and the front block backwards; it cannot push either block.
    solved=sp.solve([sp.Eq(force-tension,front*acc),sp.Eq(tension,rear*acc)],(acc,tension))
    acceleration=sp.cancel(solved[acc])
    if sp.simplify(acceleration-force/(front+rear))!=0 or sp.simplify(solved[tension]-rear*acceleration)!=0:
        raise ValueError("Independent separate-body Newton derivation failed")
    if not acceleration.is_positive or not solved[tension].is_positive:
        raise ValueError("Positive train force and masses must keep the rope in tension")
    force_inverse=sp.solve(sp.Eq(acc,acceleration),force)[0]
    mass_inverse=sp.solve(sp.Eq(acc,acceleration),rear)[0]
    ratio=sp.cancel(acceleration.subs({force:k1*force,rear:k2*rear},simultaneous=True)/acceleration)
    if sp.simplify(ratio-k1*(front+rear)/(front+k2*rear))!=0:
        raise ValueError("Independent fixed-front-mass scaling failed")
    first=acceleration.subs({force:2,front:2,rear:2})
    second=acceleration.subs({force:4,front:2,rear:4})
    third=acceleration.subs({force:2,front:2,rear:4})
    target=sp.Rational(4,3)*first
    target_mass=mass_inverse.subs({force:4,front:2,acc:target})
    calibration=sp.solve([sp.Eq(gain*first+offset,2),sp.Eq(gain*second+offset,sp.Rational(7,3))],(gain,offset))
    decoded=(3-calibration[offset])/calibration[gain]
    constrained=sp.solve(sp.Eq(acceleration.subs({force:rear,front:2}),sp.Rational(1,2)),rear)[0]
    measured=(SI.Quantity(2,"newton")/(SI.Quantity(2,"kg")+SI.Quantity(2,"kg"))).to("meter/second**2")
    if measured.magnitude!=Fraction(1,2):raise ValueError("Independent force/mass dimensions failed")
    display_gain=SI.Quantity(Fraction(3,2),"")/measured
    decoded_units=(SI.Quantity(2,"")/display_gain).to("meter/second**2")
    recovered_force=(decoded_units*SI.Quantity(6,"kg")).to("newton").magnitude
    if display_gain.to("second**2/meter").magnitude!=3 or recovered_force!=4:
        raise ValueError("Independent display calibration dimensions failed")
    if (first+second)/2==acceleration.subs({force:3,front:2,rear:3}):
        raise ValueError("Distinct mean-output and mean-input experiments collapsed")
    return [first,"m/s²","A=F/(M+m)","Da 1/2 a 1 m/s²",
            force_inverse.subs({front:2,rear:2,acc:first}),mass_inverse.subs({force:2,front:2,acc:first}),
            third/first,1-first,"F=A(M+m)","κ₁(M+m)/(M+κ₂m)",second/first,(first+second)/2,
            target_mass/2,sp.Rational(recovered_force),force_inverse.subs({front:2,rear:2,acc:decoded}),constrained]


MANUAL=[
    "Total mass 2+2=4 kg; A=2/4=1/2 m/s². Rear tension T=mA=1 N; front resultant F−T=1 N=MA.",
    "N/kg=(kg·m/s²)/kg=m/s². Add both masses before dividing the applied force.",
    "Separate Newton equations F−T=MA and T=mA add to F=(M+m)A. T cancels from the sum but remains positive.",
    "Fixed total mass 4 kg: force 2→4 N gives A=1/2→1 m/s². The acceleration doubles; T changes from 1 to 2 N.",
    "F=(M+m)A=(2+2) kg·(1/2 m/s²)=2 N. The internal tension is only 1 N.",
    "F/A=2/(1/2)=4 kg is the total mass. Subtract M=2 kg to obtain m=2 kg; F/A>M is satisfied.",
    "Accelerations 2/(2+2)=1/2 and 2/(2+4)=1/3 m/s² give ratio (1/3)/(1/2)=2/3.",
    "Proposed minus correct: 1−1/2=+1/2 m/s². Reversing subtraction would reverse the sign.",
    "Multiply A=F/(M+m) by the entire positive mass M+m to obtain F=A(M+m).",
    "Only F and rear m scale: [κ₁F/(M+κ₂m)]/[F/(M+m)]=κ₁(M+m)/(M+κ₂m). Front M remains fixed.",
    "A₁=1/2, A₂=4/(2+4)=2/3 m/s². The ratio is (2/3)·2=4/3.",
    "Equal-weight mean: (1/2+2/3)/2=(3+4)/12=7/12 m/s². Mean inputs give 3/5 m/s², a different experiment.",
    "Target A₂=(4/3)(1/2)=2/3 m/s². Total mass 4/(2/3)=6 kg; rear mass 6−2=4 kg; ratio 4/2=2.",
    "Gain q=(3/2)/(1/2 m/s²)=3 s²/m. S=2 gives A=2/3 m/s²; total mass 6 kg gives F=4 N.",
    "ΔS=1/3 and ΔA=1/6 m/s² give q=2 s²/m; offset is 1. S=3 decodes to A=1 m/s², then F=4 N.",
    "With F=km and k=1 m/s², AM=(k−A)m. Hence m=AM/(k−A)=2 kg and F=2 N; finite positive m requires 0<A<k."
]
DISTRACTORS=[
    "1 m/s² uses only one block; 2 repeats the force number; 1/4 halves twice; zero ignores external F.",
    "kg measures mass, s duration, m length and N force; none of those is acceleration.",
    "F/M and F/m omit a block; 2F double-counts the force; 2M+2m doubles the inertia.",
    "2 m/s² uses only the front mass. 1/4 reverses force dependence; unchanged or zero ignores the new resultant.",
    "The applied force accelerates both blocks. T=1 N is the rear horizontal resultant, not the total external force 2 N.",
    "4 kg is the total, not rear mass. The inverse must leave positive m; substituting 2 kg restores the measured A.",
    "1/2 wrongly doubles total inertia; 3/2 is inverse; 4/3 doubles the ratio; the negative option violates two positive accelerations.",
    "−1/2 reverses subtraction; 3/2 is the sum; 1 repeats the proposal; 1/4 halves the error again.",
    "AM and Am are individual resultants; an extra half loses force. A/(M+m) has wrong dimensions.",
    "κ₁/κ₂ incorrectly scales fixed M. Reversing the mass factors reverses the load effect; extra 2 is unsupported; the last option fails identity when m≠M.",
    "3/4 is inverse; 2 considers only force; 1 assumes the total mass doubles; 2/3 merely repeats the second acceleration number.",
    "7/6 is the sum; 7/24 halves again; 1/6 is the difference; 3/5 uses mean inputs instead of mean outputs.",
    "6 kg would be the total mass. Rear mass is 4 kg, positive, and the rope tension remains positive.",
    "The display reading is continuous and dimensionless, not a count of integer cycles or an SI force or acceleration before gain removal.",
    "6 N omits offset subtraction; 2 N repeats the reference; 3 N confuses reading and force; 8 N doubles the result. Only 4 N returns S=3.",
    "m=1,3,4 kg gives A=1/3,3/5,2/3 m/s² respectively. −2 kg violates positivity and makes the total mass zero."
]
ASSUMPTIONS=[
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. The inverse requires F/A>M.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. Positive factors change F and m between trials; M stays fixed and no mass varies during a trial.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. The two outputs have equal statistical weight.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. The dimensionless display is continuous, with fixed positive gain and zero offset.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. Positive gain and constant offset are identified by distinct reference accelerations.",
    "Inertial frame; separated constant masses M=2 kg and m>0; smooth horizontal plane with vertical forces balanced. A massless inextensible taut rope connects them. The sole external horizontal force F>0 pulls leading M rightwards. Both have A>0; T=mA>0. F=km selects trials with k=1 m/s²; finite positive m requires 0<A<k. The unconstrained horizontal problem has no artificial A<g bound."
]
UNITS={n:"meter/second**2" for n in range(1,17)}
UNITS.update({5:"newton",6:"kg",7:"dimensionless",9:"newton",10:"dimensionless",11:"dimensionless",13:"dimensionless",14:"newton",15:"newton",16:"kg"})
NUMERIC_UNITS={5:"N",6:"kg",13:"1",14:"N"}
OPTION_SUFFIX={1:" m/s²",8:" m/s²",12:" m/s²",15:" N",16:" kg"}


def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    # Independent force lengths from Newton, not a scale inferred from labels:
    # F=2N ->80px;T=1N ->40px in every displayed individual-body diagram.
    needed={"M470 167 L550 167","M220 512 L260 512","M380 512 L340 512","M470 512 L550 512","M450 847 L530 847"}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or arrow direction changed")
    for e in root.iter():
        if e.get("d") in needed and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return "M=m2kg,F2N:A1/2m/s²,T1N;40px/N,F80px,T40px;rear left/front right;spatial geometry explicitly schematic"


def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-two-blocks-system-{n:02}"
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
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(wanted):errors.append("Independent separate-body Newton exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        results.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},"manualArithmetic":MANUAL[n-1],
          "physicalAssumptions":ASSUMPTIONS[n-1],"distractors":DISTRACTORS[n-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["independent_two_body_Newton_and_whole_system_sum","SymPy_force_mass_inverses_fixed_mass_scaling_and_display_system","Pint_exact_force_mass_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Two separated blocks pulled by a taut ideal rope","reference":"Primary source-prompt-only Newton derivation preceded candidate keys; fixed front mass and internal tension checked separately"}}



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
    false_proof=("Le tensioni sono forze esterne sul sistema complessivo e quindi F−2T=(M+m)A." if BATCH.startswith("two-") else
                 "Le due tensioni sulle masse sono una coppia di azione e reazione e puntano in versi opposti nello stesso asse verticale.")
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false tension proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_tension_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old=(b"M470 167 L550 167" if BATCH.startswith("two-") else b"M180 660 L180 780")
    new=(b"M470 167 L510 167" if BATCH.startswith("two-") else b"M180 660 L180 720")
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
