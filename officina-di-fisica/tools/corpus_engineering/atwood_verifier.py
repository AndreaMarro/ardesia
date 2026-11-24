"""Independent Newton oracle for sixteen read ideal Atwood problems.

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
CANDIDATE_REF="1bbd50a99e5b34230cc4291c3e85ac7bee903b93"
REVIEWED_PACKAGE_SHA256="8baec6d343a5a5f05a22b088775c1e3f5fe2e41df9a0043a18fd804cfbf93955"
REVIEWED_BINDINGS_SHA256="9844b2aab12be95498b02d284562c5c2902c3d8c68ceef8aefbaff50988093ce"
EXPECTED_IDS={f"AR-u2-atwood-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-atwood-01": "2d180dcadf77aa691fc846e4881ebff8f19b524eace26a55ca9f7a86bc044c44",
    "AR-u2-atwood-02": "420262a72a0d7e96cdc6d938aaf202d3e6a930521b94cb2c3f6281ad68df149c",
    "AR-u2-atwood-03": "9f2629f0c233fe7d583a8b7d107cdcaf7912fe5f70b5f1b79f88cc1acb802dc0",
    "AR-u2-atwood-04": "9a5637877c3f93ff15a2a7661b23ed82ff041158b3fc3188408ccf4f2985df1b",
    "AR-u2-atwood-05": "b520f201095cf5d1e70815d1f5ef8010f70677858c57d33594f3fd254bf60317",
    "AR-u2-atwood-06": "b162a55e0432888bb57c5dd5804c2968c65597bf26b139a5ae6b9f058340d8e6",
    "AR-u2-atwood-07": "57101a43af25958d0130efb8371e11edaec0940e6412ae909687dd3ba9f8cd64",
    "AR-u2-atwood-08": "2611ce533ff42a12b8c0da21bcba34f5d6ba903d9cf47d289000a89e4888250f",
    "AR-u2-atwood-09": "a715d69a25b12dca0227be0a1a4eec8c9a57a7ed4444a7c3c14534e1f61f4eed",
    "AR-u2-atwood-10": "025eee5057def93cd66cba11d0c7a0c40c6ff87731fa27c9f49b44dd1bcad6ee",
    "AR-u2-atwood-11": "d2361c8ab26f7955f36273681d8a1be268926627cd6c1945976bd43d63ae587f",
    "AR-u2-atwood-12": "fee6b86823d25231baa6566b915d5b763d5624e62e4a569c18255cd20feec4a5",
    "AR-u2-atwood-13": "dbf0c299945b858d05a3360fe462414fd09d878dbef9f0029ef2e6b8067e8003",
    "AR-u2-atwood-14": "ac075f4d689c29b506e0c4435f918720f5a66ca42195a149984c065dbcfdadef",
    "AR-u2-atwood-15": "3158667eea09e4c3d9c0e0cb8c59f8dfeaf8dceef8ef086da65051f0883447af",
    "AR-u2-atwood-16": "4e67d23f44cd6138721668a88511c34bb62bb5de4a7c177cc3183f76eef79bfa"
}
BATCH="atwood-034"
ASSET_NAME="atwood-steps.svg"


@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}


def oracle():
    M,m,g,A,T,k1,k2,delta,gain,offset=sp.symbols("M m g A T k1 k2 delta gain offset",positive=True)
    # Opposite positive coordinate directions follow the single taut-rope
    # constraint. This is not cancellation of two opposite Cartesian tensions:
    # both tensions on the masses actually point upwards.
    solved=sp.solve([sp.Eq(M*g-T,M*A),sp.Eq(T-m*g,m*A)],(A,T))
    acceleration=sp.factor(solved[A]);tension=sp.factor(solved[T])
    if sp.simplify(acceleration-g*(M-m)/(M+m))!=0 or sp.simplify(tension-2*M*m*g/(M+m))!=0:
        raise ValueError("Independent two-body Atwood derivation failed")
    for positive in [acceleration,g-acceleration,tension-m*g,M*g-tension]:
        if not sp.factor(positive.subs(M,m+delta)).is_positive:
            raise ValueError("Independent positive-mass acceleration or tension bound failed")
    heavy_inverse=sp.solve(sp.Eq(A,acceleration),M)[0]
    light_inverse=sp.solve(sp.Eq(A,acceleration),m)[0]
    ratio=sp.cancel(acceleration.subs({M:k1*M,m:k2*m},simultaneous=True)/acceleration)
    wanted_ratio=(k1*M-k2*m)*(M+m)/((k1*M+k2*m)*(M-m))
    if sp.simplify(ratio-wanted_ratio)!=0:
        raise ValueError("Independent constrained Atwood mass scaling failed")
    if sp.simplify(ratio.subs(k2,k1)-1)!=0:
        raise ValueError("Uniform mass scaling must leave acceleration unchanged")
    first=acceleration.subs({M:4,m:1,g:10});second=acceleration.subs({M:6,m:2,g:10})
    changed=acceleration.subs({M:4,m:2,g:10})
    measured_tension=(SI.Quantity(1,"kg")*(SI.Quantity(10,"meter/second**2")+SI.Quantity(5,"meter/second**2"))).to("newton").magnitude
    if measured_tension!=15 or tension.subs({M:3,m:1,g:10})!=15:
        raise ValueError("Measured and coupled-system tensions must both be15N")
    gain_units=SI.Quantity(18,"")/SI.Quantity(6,"meter/second**2")
    decoded_units=(SI.Quantity(15,"")/gain_units).to("meter/second**2")
    if gain_units.to("second**2/meter").magnitude!=3 or decoded_units.magnitude!=5:
        raise ValueError("Independent Atwood display dimensions failed")
    calibration=sp.solve([sp.Eq(gain*first+offset,13),sp.Eq(gain*second+offset,11)],(gain,offset))
    decoded=(sp.Rational(107,7)-calibration[offset])/calibration[gain]
    if not 0<decoded<10:raise ValueError("Decoded acceleration outside physical Atwood domain")
    constrained=sp.simplify(acceleration.subs({M:4*m,g:10}))
    if constrained!=6 or constrained.has(m):raise ValueError("Mass-scale nonidentifiability failed")
    mean_inputs=acceleration.subs({M:5,m:sp.Rational(3,2),g:10})
    if mean_inputs!=sp.Rational(70,13) or (first+second)/2-mean_inputs!=sp.Rational(3,26):
        raise ValueError("Independent trial mean and mean-mass calculation failed")
    return [first,"m/s²","T<P","Aumenta da 6 a 50/7 m/s²",
            heavy_inverse.subs({m:1,g:10,A:6}),sp.Rational(measured_tension),changed/first,12-first,
            "M=m(g+A)/(g−A)","D₂ S / (S₂ D)",second/first,(first+second)/2,
            light_inverse.subs({M:6,g:10,A:sp.Rational(5,6)*first}),
            heavy_inverse.subs({m:2,g:10,A:sp.Rational(decoded_units.magnitude)}),
            heavy_inverse.subs({m:1,g:10,A:decoded}),"Infinite coppie positive"]


MANUAL=[
    "With opposite local positive directions, Mg−T=MA and T−mg=mA. A=10·3/5=6 m/s². T=1(10+6)=4(10−6)=16 N; the individual resultants are 24 and 6 N.",
    "The mass difference/sum ratio is dimensionless, so A has the same unit as g: m/s².",
    "The heavy mass accelerates down: P−T=MA>0, hence 0<T<P. The light side also requires T=m(g+A)>0.",
    "M=4→6 kg at m=1 kg gives A=6→50/7 m/s². 50>42 proves the increase, and 50<70 proves A<g.",
    "(g−A)M=(g+A)m gives M=(1 kg)·16/4=4 kg. Since 0<6<10, the inverse denominator is positive.",
    "Light-body Newton gives T−10 N=5 N, so T=15 N. Heavy check: 30−15=3·5=15 N. The heavy resultant happens to equal T numerically here; the light resultant is only 5 N.",
    "Second acceleration is 10(4−2)/(4+2)=10/3 m/s². Ratio (10/3)/6=5/9.",
    "Proposed minus correct is 12−6=+6 m/s². The proposal 12 m/s² already exceeds g=10 and is outside the physical domain.",
    "Expand A(M+m)=g(M−m), collect (g−A)M=(g+A)m, then M=m(g+A)/(g−A)>m for 0<A<g.",
    "A₁=gD/S and A₂=gD₂/S₂ give ratio D₂S/(S₂D). κ₁M>κ₂m>0; a common scale of both masses cancels.",
    "A₁=6 and A₂=10·4/8=5 m/s² give ratio 5/6. Total inertia grows faster than the weight difference.",
    "Equal-weight mean (6+5)/2=11/2 m/s². Mean masses 5 and 3/2 kg give 70/13 m/s²; the difference is 3/26 m/s².",
    "Target (5/6)·6=5 m/s². Inverting for the light mass: m₂=6(10−5)/(10+5)=2 kg; m₂/m₁=2.",
    "Gain q=18/(6 m/s²)=3 s²/m. S=15 decodes to A=5 m/s²; M=2(10+5)/(10−5)=6 kg.",
    "Gain (11−13)/(5−6)=2 s²/m; offset 1. S=107/7 decodes to A=50/7 m/s². M=(1 kg)(120/7)/(20/7)=6 kg.",
    "M=4m implies A=10(3m)/(5m)=6 m/s² for every m>0. The positive absolute mass scale remains free; the zero pair is forbidden."
]
DISTRACTORS=[
    "Ignoring tension gives g=10. Dividing by only the mass difference would give a different or excessive acceleration; T=16 N is neither an acceleration nor either individual resultant.",
    "N is force, kg mass, m length and s duration; a dimensionless mass ratio leaves acceleration dimensions unchanged.",
    "T=P gives zero heavy acceleration; T>P or T=2P gives upward acceleration; T=0 cannot lift the positive light mass.",
    "30/7 keeps the old difference 3. Unchanged ignores increased imbalance; g requires excluded zero light mass; a negative value is not a modulus.",
    "The reversed inverse would give M<m. A=g makes the inverse denominator zero and is incompatible with finite positive masses.",
    "5 N is the light resultant, 10 N its weight, 30 N the heavy weight. 20 N is the arithmetic mean of weights, not the Newton tension.",
    "9/5 is inverse; 1/2 assumes a naive inverse law in m; 2/3 considers only weight differences; negative violates the selected positive branch.",
    "−6 reverses subtraction; 12 repeats the proposal; zero accepts it; 3 halves the error again.",
    "The reversed fraction and mA/g give M<m. An extra factor 2 or 1/2 fails the original equation; the chosen inverse works throughout 0<A<g.",
    "κ₁/κ₂ ignores coupled difference and sum. D₂/D misses inertia; S₂/S considers only inertia in the wrong direction; extra 2 fails the unchanged-trial check.",
    "6/5 is inverse; 4/3 uses differences alone; 8/5 uses totals alone; 1 wrongly assumes uniform mass scaling.",
    "11 is the sum, 11/4 halves again, 1 is the difference. 70/13 belongs to mean masses, not the mean of two accelerations.",
    "Scaling only the small mass by 5/6 fails while the heavy mass also changes. The found 2 kg lies strictly between zero and 6 kg.",
    "Reading 15 is not an SI acceleration: it exceeds g. Gain removal is necessary before applying the physical inverse.",
    "12 and 3 kg double or halve the correct mass. 7 kg gives S=16; 5 kg gives S=43/3. Only 6 kg reproduces 107/7.",
    "The pairs (4,1) and (8,2) kg are examples, not the only solutions. Every m>0 works; zero is excluded and would zero the denominator."
]
ASSUMPTIONS=[
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. Eliminating T uses oriented scalar equations, not opposite Cartesian tensions: both actual tension vectors point upwards.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. T differs as a physical quantity from the heavy resultant P−T. The two tensions on the masses are not an action/reaction pair.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. Special M=3 kg, m=1 kg, measured A=5 m/s² is consistent with the coupled system; both sides give T=15 N.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. The inverse requires measured 0<A<g to produce finite M>m.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. Positive scale factors must preserve κ₁M>κ₂m.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. The two accelerations have equal statistical weight, rather than separate mean masses.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg.",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. The display is continuous and dimensionless, with positive gain and zero offset; decoded A=5 lies in (0,g).",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. Two distinct references identify positive gain and constant offset; decoded 50/7 lies in (0,10).",
    "Fixed ideal massless frictionless pulley; taut massless inextensible rope; inertial laboratory; uniform exact g=10 m/s². Constant masses satisfy M>m>0. Only weight and tension act, before any end stop. Opposite positive local directions give the same acceleration modulus, 0<A<g, with mg<T<Mg. M=4m selects different apparatuses; masses stay constant during each trial. The free positive mass scale is continuous."
]
UNITS={n:"meter/second**2" for n in range(1,17)}
UNITS.update({3:"newton",5:"kg",6:"newton",7:"dimensionless",9:"kg",10:"dimensionless",11:"dimensionless",13:"dimensionless",14:"kg",15:"kg",16:"dimensionless"})
NUMERIC_UNITS={1:"m/s²",5:"kg",13:"1",14:"kg"}
OPTION_SUFFIX={6:" N",8:" m/s²",12:" m/s²",15:" kg"}


def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={"M180 600 L180 552","M460 600 L460 552","M180 660 L180 780","M460 660 L460 690"}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or arrow direction changed")
    for e in root.iter():
        if e.get("d") in needed and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return "M4kg,m1kg,g10:A6m/s²,T16N;scale3px/N;both tensions48px upwards;weights120/30px downwards;resultants24Ndown/6Nup are distinct;textorientslocalaxesbeforeaddingequations"


def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-atwood-{n:02}"
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
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(wanted):errors.append("Independent coupled Atwood Newton exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        results.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},"manualArithmetic":MANUAL[n-1],
          "physicalAssumptions":ASSUMPTIONS[n-1],"distractors":DISTRACTORS[n-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["independent_oppositely_oriented_Newton_equations_and_rope_constraint","SymPy_acceleration_tension_bounds_inverse_mass_scaling_and_display_system","Pint_exact_acceleration_tension_and_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Ideal Atwood acceleration and distinct tension","reference":"Primary source-prompt-only two-body Newton derivation preceded candidate keys;rope constraint,0<A<g andmg<T<Mg independently checked"}}



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
