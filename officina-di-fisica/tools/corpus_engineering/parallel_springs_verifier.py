"""Independent source-prompt-first spring review; no candidate authoring imports.
Edition signatures frozen only after full candidate, provenance and SVG reading.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json"
CANDIDATE_REF='bea16bdd902d6e4c30dc9d130f7a331494dd2e9f'
REVIEWED_PACKAGE_SHA256='a35f9e8de4fd6deaadafdb8b6541c27dae5599d71a2fbf4423cf2a63c93e4df6'
REVIEWED_BINDINGS_SHA256='90eee6da1ecf392d1d2258b99e62bb4220616950e7a08dc9ebc930f3293bbe71'
BATCH='parallel-springs-044'
ASSET_NAME='parallel-springs-steps.svg'
FALSE_PROOF='Nel parallelo le due molle hanno sempre forze uguali e quindi ognuna sostiene metà della forza totale anche se le rigidezze sono diverse.'
SVG_MUTATION=(b'M300 940H220', b'M300 940H260')
EXPECTED_IDS={f"AR-u2-parallel-springs-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-parallel-springs-01": "185d7ff35877595416c29607a5d49728f6f93bc0d4d4569b7870ca816c7f5b50",
    "AR-u2-parallel-springs-02": "5aa4b786b8e3ae4641b8a8665ee3ea24f4eaaa44d39ce2d528a82d70dee8ad32",
    "AR-u2-parallel-springs-03": "786c02b59d76f793851cf85c5d1faabc62e5f68cbd88c1563ced2e6ec0a102e9",
    "AR-u2-parallel-springs-04": "abe120de5004dd1cbdc8952883fc85c42aeba094a0843665641415f8d64f4da5",
    "AR-u2-parallel-springs-05": "9078616513c2346a5e54378311e65129cdabb3d8d78ffe3668b5050b7b67de9d",
    "AR-u2-parallel-springs-06": "b7a89431df443e4040e2b4c62bfd259a6e0c53d54e237e7391b35ba19605167c",
    "AR-u2-parallel-springs-07": "1fa511e81efa53f5914f156d88918ffe151753f38e4124fee5e224ebb54474a2",
    "AR-u2-parallel-springs-08": "fe2b299c4fcfcaa0fbf682adbd03536495bd6212e8c033084b13b4bc4d0c0a18",
    "AR-u2-parallel-springs-09": "70b1d5079f954e2374cee66a5d1c451e959d30b6b673108d1413e2a019b30874",
    "AR-u2-parallel-springs-10": "1ae9c8c0fb36a559f33e3072f2037ecd8d20847fae1efe1387316be81ed86fba",
    "AR-u2-parallel-springs-11": "9e052e90deaa3e2996979a434f934663b30f36fbc9a540c18d3c1e461592c0d9",
    "AR-u2-parallel-springs-12": "f5d8709f8bd120271f24d221260d16428fd069289bf0b3de2aca2f23dbf5982a",
    "AR-u2-parallel-springs-13": "b47021f47765357ffb49fa92d8072c22789ad1bf6681b01aed8d0c1900f6f2d6",
    "AR-u2-parallel-springs-14": "83e0ae177e44f43126b77ba7674d44097d741f2b0415b42a5af8b25e4a35341f",
    "AR-u2-parallel-springs-15": "c5a860de213ea1e50e95cf20d196706b431ffffe7680a754911791fa5c5708f7",
    "AR-u2-parallel-springs-16": "ec7925ecf93203203e3ab0b9e69b9e386cf329abbbc5781c35da91c9a506c0f1"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    k1,k2,l,F,F1,F2,K,a,b,q,z=sp.symbols("k1 k2 l F F1 F2 K a b q z",positive=True)
    solved=sp.solve([sp.Eq(F1,k1*l),sp.Eq(F2,k2*l),sp.Eq(F,F1+F2),sp.Eq(F,K*l)],(F1,F2,F,K))
    law=sp.factor(solved[K]);assert law==k1+k2
    assert (law-k1).is_positive and (law-k2).is_positive
    inv=sp.solve(sp.Eq(K,law),k1)[0];assert inv==K-k2
    ratio=sp.cancel(law.subs({k1:a*k1,k2:b*k2},simultaneous=True)/law)
    assert sp.simplify(ratio-(a*k1+b*k2)/(k1+k2))==0 and sp.simplify(ratio.subs(b,a)-a)==0
    first=law.subs({k1:2,k2:2});second=law.subs({k1:4,k2:4});changed=law.subs({k1:2,k2:4})
    # Independent unequal-branch load sharing, not half of the total force.
    measured_l=(SI.Quantity(6,"newton")/(SI.Quantity(1,"newton/meter")+SI.Quantity(2,"newton/meter"))).to("meter")
    measured_F1=(SI.Quantity(1,"newton/meter")*measured_l).to("newton").magnitude
    assert measured_l.magnitude==2 and measured_F1==2
    assert solved[F1].subs({k1:1,k2:2,l:2})==2 and solved[F2].subs({k1:1,k2:2,l:2})==4
    assert (first+second)/2==law.subs({k1:3,k2:3})==6
    gain=(SI.Quantity(12,"")/SI.Quantity(4,"newton/meter")).to("meter/newton")
    decoded=(SI.Quantity(24,"")/gain).to("newton/meter").magnitude;assert gain.magnitude==3 and decoded==8
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,17)],(q,z));assert cal=={q:2,z:1}
    affine=(13-cal[z])/cal[q];assert affine==6 and affine>2
    constrained=sp.solve(sp.Eq(law.subs(k1,k2),4),k2);assert constrained==[2]
    return [first,"N/m","K=k₁+k₂","Da 4 a 6 N/m",inv.subs({K:4,k2:2}),sp.Rational(measured_F1),changed/first,8-first,
      "k₁=K−k₂","(κ₁ k₁ + κ₂ k₂) / (k₁ + k₂)",second/first,(first+second)/2,
      (2*first-4)/2,inv.subs({K:sp.Rational(decoded),k2:4}),inv.subs({K:affine,k2:2}),constrained[0]]

MANUAL=['Common extension ell gives F=(k1+k2)ell, so K=2+2=4 N/m. At ell1m each branch2N and total4N.', 'K=F/ell has force/length dimension M/T², SI N/m=kg/s².', 'Both positive branch restoring forces act against the same extension; F=k1ell+k2ell. Divide by ell>0: K=k1+k2.', 'Only k1 changes2→4 while k2 stays2 N/m: K4→6 N/m, not8.', 'k1=K−k2=4−2=2 N/m; K>k2 ensures positivity.', 'K=1+2=3 N/m; ell=6N/(3N/m)=2m. F1=1·2=2N,F2=2·2=4N;2+4=6.', 'K_A4,K_B6 N/m give ratio6/4=3/2.', 'Proposed−correct=8−4=+4 N/m. The discrepancy retains stiffness units.', 'K=k1+k2 gives k1=K−k2; finite positive branch requires K>k2>0.', 'New sum a k1+b k2 over old sum k1+k2. Common multiplier a=b gives ratio a, not a².', 'K_A4,K_B8 N/m;8/4=2. A common doubling passes through the sum once.', 'Mean outputs(4+8)/2=6 N/m. Mean inputs3,3 N/m also give6 because averaging distributes over a sum.', 'TargetK8 and imposed k1B4 imply k2B4 N/m; k2B/k2A=4/2=2.', 'Dimensionless gain q=12/(4N/m)=3m/N; S24→K8N/m; k1=8−4=4N/m.', 'q=(17−9)/(8−4)=2m/N;offset1;S13→K6N/m;k1C=6−2=4N/m.', 'k1=k2 makes K=2k2. K4N/m gives unique k2=2N/m and k1=2N/m.']
DISTRACTORS=['A mean2N/m would halve the two positive force contributions; series equivalent1N/m belongs to a different deformation constraint.', 'N is force,m extension,J energy,1 pure. All differ from stiffness N/m.', 'Product/sum is series;mean divides total force by2;difference cancels positive resisting forces;simple product has squared stiffness units.', '8N/m doubles the unchanged branch too;2 decreases a sum with an increased positive addend;unchanged or zero omit the changed force response.', 'Adding k2 gives6 for the branch and8 for the group,contradicting measured4;nonpositive difference cannot be a positive Hooke stiffness.', '1N copies stiffness number;3N wrongly splits total equally;4N is the second branch;6N total. Equal deformation does not imply equal force.', '2 follows only changed k2;2/3 reverses;1/2 assigns an inverse effect;1 ignores increased stiffness.', '−4 reverses subtraction;+8 repeats proposal;0 accepts it;+2 halves discrepancy.', 'K+k2 adds rather than isolates;K/k2 is pure;k2−K negative;K−2k2 removes a term twice.', 'Product or quotient of scale factors loses branch weights;doubling denominator halves without cause;reciprocal reverses. Identity/common-scale trials distinguish all expressions.', '4 multiplies two factors on a sum;8 is K_B number with a unit,not ratio;1/2 reverses.', '12 is sum;3 halves again;4 and8 repeat single outputs. Equality to mean-input output here follows exact linearity,not a false general rule.', 'Leaving k2B2 givesK6,below target8.4N/m is new stiffness,not a pure ratio4.', 'S24 is not K24N/m;reading must be divided by3m/N before subtracting known branch.', 'k1=2,3,5,8 N/m with k2=2 give S9,11,15,21. Only4 gives13;raw reading ratios retain offset.', 'No square/root is needed in a linear sum. Arbitrary positive pairs would remain only without the equality constraint.']
ASSUMPTIONS=['Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Positive inverse requires K>k2.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Unequal branch constants1 and2N/m, total6N: distribute load proportional to stiffness at common extension.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Positive factors act on separate addends; a common factor scales K linearly.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Equal statistical weights; linearity proves equality with output at averaged inputs.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Continuous dimensionless zero-offset display with positive gain.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Distinct standards identify gain and offset; decoded K remains above known k2.', 'Ideal positive linear Hooke springs in parallel; fixed support and rigid guided crossbar without rotation impose identical positive extension from each natural length. Spring/crossbar masses neglected; quasistatic equilibria in inertial laboratory; no other axial forces. Restoring contributions share direction and add; scale of deformation differs from force. Regime declared linear for all configurations. Equality k1=k2 plus measured total determines a unique positive pair.']
UNITS={1: 'newton/meter', 2: 'newton/meter', 3: 'newton/meter', 4: 'newton/meter', 5: 'newton/meter', 6: 'newton', 7: 'dimensionless', 8: 'newton/meter', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton/meter', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'newton/meter'}
NUMERIC_UNITS={1: 'N/m', 5: 'N/m', 11: '1', 13: '1', 14: 'N/m', 16: 'N/m'}
OPTION_SUFFIX={6: ' N', 8: ' N/m', 12: ' N/m', 15: ' N/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M300 860H260', 'M300 940H220', 'M300 1020H420', 'M200 355H300M200 346V364M300 346V364'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M300 860H260', 'M300 940H220', 'M300 1020H420'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'Natural endpoint x200 from supportx100 gives L0=2m at50px/m; common stretched endpointx300 gives L4m and extension2m100px. Separate force scale20px/N:2N40px left,4N80px left,total6N120px right. Guided crossbar,schematic zigzags;equal extension with unequal load shown explicitly.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-parallel-springs-{n:02}"
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
          "methods":["source_prompt_only_primary_Hooke_Newton_or_energy_derivation","SymPy_exact_spring_network_constraint_inverse_scaling_calibration_and_physical_branch","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Parallel springs: common deformation and additive force","reference":"Primary source-prompt-only force balance and shared-deformation derivation preceded keys; separately check load partition, positive inverse and linear means."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-04","U2-01")
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
