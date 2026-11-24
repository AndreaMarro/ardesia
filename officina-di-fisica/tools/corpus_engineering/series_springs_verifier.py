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
CANDIDATE_REF='a4b397f15f08a1ccc3698c4d30340605ac9db4ae'
REVIEWED_PACKAGE_SHA256='24cf9f9a3a577479bbbc979b0eee2ba917a0780365f32f0883b91159735f3362'
REVIEWED_BINDINGS_SHA256='ab8d773b73d8200c3a3c1862fefc038b8190d3a7b4e16ea5fc09e42c341d6445'
BATCH='series-springs-045'
ASSET_NAME='series-springs-steps.svg'
FALSE_PROOF='Nel collegamento in serie la forza totale si divide a metà tra le molle;ciascuna trasmetteF/2 indipendentemente dal raccordo ideale.'
SVG_MUTATION=(b'M300 710H220', b'M300 710H260')
EXPECTED_IDS={f"AR-u2-series-springs-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-series-springs-01": "9e600d8e6e39daa7ac564046465bae408f99b42a039dfdf90c40ed0ad1ff96fe",
    "AR-u2-series-springs-02": "48f1d80b596d4416633b6ffeb8bda0a8eef50bc201b39112707d48530ac338ce",
    "AR-u2-series-springs-03": "3af69d3597d16da2a52d5b6a55ec0a6f923d7a7dad794f4ea08ee294d1a6bf83",
    "AR-u2-series-springs-04": "5ed537471b16fb0392a811467e60021ff198a81fe1c1a31764022437ca52ecbe",
    "AR-u2-series-springs-05": "6310a32a554784c0fb4a3d8717b77a0fbbb60b57cfee15fdfebb98fcd1b6828c",
    "AR-u2-series-springs-06": "2884838706ae8e6e94bd1b86d6f4d29e23c834c58f100119c5bdae95a482b9eb",
    "AR-u2-series-springs-07": "23fe10a6d5634ff597b366f411797965b9d52d679344ce97efe3877aea8dfad0",
    "AR-u2-series-springs-08": "94b17771b9e14837ef35ad6ddb1ec0534d17ab0c44db9c1e7436fd458b2a7890",
    "AR-u2-series-springs-09": "e9d325001c544c03e203b636b77a955a0cdd206fb0adb192ffc4221569fd18c4",
    "AR-u2-series-springs-10": "b30970f2932ca2d754c4a3581b06fe487a49d577f8ffcf9898f14076542b0332",
    "AR-u2-series-springs-11": "9bb0c31d8ef05412c525aabf10c14ee841aedbc0c6fe7af31db8b4aa6d6f1ddc",
    "AR-u2-series-springs-12": "dfb211c8aef0469039a9b7c9049f0b3c90f386afe4149c94e0dfdddf352dd658",
    "AR-u2-series-springs-13": "bcd445f196a03ad7679663129ff4c253cfcc168fbf1839b5d527d12aefeac31b",
    "AR-u2-series-springs-14": "ecc95e172d11608787dae31958ec83d1007e8351d816ed6243558a0fd58657a9",
    "AR-u2-series-springs-15": "d35ceb24b86e609ce2bf60219c68c3a059869bb0628845065537c3677a6b74f2",
    "AR-u2-series-springs-16": "292cc74bf8229189ffb78f00293e85a23f3ebf43f8d307f01987a0ef9e20a8ea"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    k1,k2,l,l1,l2,F,K,a,b,q,z=sp.symbols("k1 k2 l l1 l2 F K a b q z",positive=True)
    extension=F/k1+F/k2
    law=sp.solve(sp.Eq(F,K*extension),K)[0]
    assert sp.simplify(law-k1*k2/(k1+k2))==0 and law.is_positive
    assert sp.factor(k1-law).is_positive and sp.factor(k2-law).is_positive
    inv=sp.solve(sp.Eq(K,law),k1)[0];inv2=sp.solve(sp.Eq(K,law),k2)[0]
    assert sp.simplify(inv-K*k2/(k2-K))==0
    ratio=sp.cancel(law.subs({k1:a*k1,k2:b*k2},simultaneous=True)/law)
    assert sp.simplify(ratio-a*b*(k1+k2)/(a*k1+b*k2))==0 and sp.simplify(ratio.subs(b,a)-a)==0
    first=law.subs({k1:2,k2:2});second=law.subs({k1:4,k2:4});changed=law.subs({k1:2,k2:4})
    ell1=(SI.Quantity(4,"newton")/SI.Quantity(2,"newton/meter")).to("meter")
    ell2=(SI.Quantity(4,"newton")/SI.Quantity(4,"newton/meter")).to("meter")
    assert ell1.magnitude==2 and ell2.magnitude==1
    mean=(first+second)/2;assert mean==law.subs({k1:3,k2:3})==sp.Rational(3,2)
    counter_mean=(law.subs({k1:1,k2:3})+law.subs({k1:3,k2:1}))/2
    assert counter_mean==sp.Rational(3,4) and law.subs({k1:2,k2:2})==1
    gain=(SI.Quantity(3,"")/SI.Quantity(1,"newton/meter")).to("meter/newton")
    decoded=(SI.Quantity(6,"")/gain).to("newton/meter").magnitude;assert decoded==2
    cal=sp.solve([sp.Eq(q*first+z,3),sp.Eq(q*second+z,5)],(q,z));assert cal=={q:2,z:1}
    affine=(sp.Rational(11,3)-cal[z])/cal[q];assert affine==sp.Rational(4,3) and 0<affine<2
    constrained=sp.solve(sp.Eq(law.subs(k1,k2),1),k2);assert constrained==[2]
    return [first,"N/m","K=k₁k₂/(k₁+k₂)","Da 1 a 4/3 N/m",inv.subs({K:1,k2:2}),sp.Rational(ell1.magnitude/ell2.magnitude),
      changed/first,2-first,"k₁=Kk₂/(k₂−K)","κ₁ κ₂ S / S_B",second/first,mean,
      inv2.subs({K:2*first,k1:4})/2,inv.subs({K:sp.Rational(decoded),k2:4}),inv.subs({K:affine,k2:2}),constrained[0]]

MANUAL=['At common force F, ell=F/2+F/2. Thus 1/K=1 m/N and K=1 N/m.', 'K is force divided by length, N/m. Its reciprocal compliance has unit m/N.', 'An unloaded massless connector balances opposite equal forces. Add F/k1 and F/k2, then invert: K=k1k2/(k1+k2).', 'At k1=4,k2=2 N/m, K=8/6=4/3 N/m, above the original1 and below each input.', 'K(k1+k2)=k1k2 gives Kk2=k1(k2−K). Hence k1=1·2/(2−1)=2 N/m.', 'F=4 N gives ell1=4/2=2 m and ell2=4/4=1 m. Ratio ell1/ell2=2.', 'K_A=1 and K_B=4/3 N/m give K_B/K_A=4/3.', 'Proposed minus correct is2−1=+1 N/m. The proposal retained a single spring stiffness.', 'k1=Kk2/(k2−K). The positive finite inverse requires0<K<k2; approaching k2 from below makes k1 unbounded.', 'K_B=ab k1k2/(a k1+b k2). Divide by K_A: ratio ab S/S_B. Equal factors a=b reduce this to a.', 'K_A=1,K_B=2 N/m: ratio2. Product quadruples while sum doubles.', 'Mean(1+2)/2=3/2 N/m equals K(3,3) on this proportional input ray. Counterexample(1,3),(3,1) gives mean3/4, while mean inputs(2,2) give1.', 'Target K_B=2 N/m and k1B=4 N/m give k2B=2·4/(4−2)=4 N/m, ratio4/2=2.', 'q=3 m/N; reading6 gives K=2 N/m. Then k1=2·4/(4−2)=4 N/m.', 'q=2 m/N, offset1. Reading11/3 gives K=(8/3)/2=4/3 N/m; k1=(8/3)/(2/3)=4 N/m.', 'k1=k2 gives K=k2²/(2k2)=k2/2 since k2>0. K=1 N/m determines the unique positive k2=2 N/m.']
DISTRACTORS=['4 N/m is the parallel sum and violates K below each input;2 N/m omits the second extension.', 'm/N is compliance, N force, m extension,1 pure. Only N/m is stiffness.', 'Sum is the parallel law; mean is not an extension balance; difference vanishes for identical springs; the reciprocal sum gives1/K, with reciprocal units.', '2 N/m is the limiting value for infinite k1;6 is a parallel sum;3/4 reverses the fraction; unchanged ignores reduced compliance.', 'K=k2 makes the denominator zero. K>k2 makes the inferred branch negative; neither is a finite positive Hooke spring.', '1/2 follows k1/k2 instead of its reciprocal;1 assumes equal extensions;4 copies the force number;−2 violates positive extensions.', '2 doubles the entire network though only one branch changed;3/4 reverses the comparison;1/2 assigns an inverse effect;1 ignores the change.', '−1 reverses subtraction;+2 repeats the proposal;zero accepts it;+1/2 halves the discrepancy.', 'K−k2 is negative here; a plus denominator fails substitution; the opposite denominator changes the sign; K/k2 is pure.', 'S_B/S reverses the denominator effect. A scale quotient loses branch weights; adding scale factors fails the identity trial; the extra denominator2 halves without cause.', '4 retains only the product scaling;1/2 reverses the ratio;1 ignores both changes.', '3 is the sum;3/4 halves twice;1 and2 repeat single outputs. Equality to the mean-input trial is justified only for these proportional pairs.', 'Unchanged k2 gives4/3 below the target2.4 N/m is a new stiffness, not a ratio4. The target below k1B allows a positive finite solution.', 'Using raw reading6 as K=6 N/m exceeds known k2=4 and produces an invalid negative inverse. Calibration restores the physical domain.', 'k1 values2,3,6,8 N/m give K1,6/5,3/2,8/5 and readings3,17/5,4,21/5. None equals11/3: cross products51 and55 distinguish17/5.', 'No square root is needed because positive k2 cancels. Dividing K by2 again reverses the series relation.']
ASSUMPTIONS=['Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Inverse requires0<K<knownk2.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Force4N common;extensions2m and1m need not be equal.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. MeasuredK mustlie strictlybelowknownk2 to yield finitepositivek1.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Positive factors act in both product and sum;overallhomogeneity degreeone.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Proportional assignedinputpairs make this particular mean coincide;nonproportionalcounterexample separates the general case.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Continuous dimensionless zero-offset display.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Fractional reading11/3 is admissible;after calibration0<K4/3<k2=2.', 'Ideal positive linear springs in series between fixed support and pulled endpoint. Spring and connector masses neglected; no other load on connector; quasistatic equilibrium in inertial laboratory. Same positive axial force is transmitted; individual positive extensions from respective natural lengths add. K is below each finite positive input; all deformations within declared linear regime. Equality of inputconstants plus measuredK selectsonepositivepair;zeroexcludedfromdenominator.']
UNITS={1: 'newton/meter', 2: 'newton/meter', 3: 'newton/meter', 4: 'newton/meter', 5: 'newton/meter', 6: 'dimensionless', 7: 'dimensionless', 8: 'newton/meter', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton/meter', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'newton/meter'}
NUMERIC_UNITS={1: 'N/m', 5: 'N/m', 11: '1', 13: '1', 14: 'N/m', 16: 'N/m'}
OPTION_SUFFIX={8: ' N/m', 12: ' N/m', 15: ' N/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M300 710H380', 'M300 710H220'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M300 710H380', 'M300 710H220'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'At60px/m,natural spring endpoints80→140→200 give1m each;deformed80→260→380 give3m and2m,extensions2m and1m,total3m. Separate20px/N force scale:masslessconnector receives two opposite4N forces,each80px. K4/3N/m and bothinputbounds correctly annotated.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-series-springs-{n:02}"
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
      "title":"Series springs: common force and additive compliance","reference":"Source-prompt-only massless-junction equilibrium and extension sum preceded keys; independently check inverse positive domain and proportional-ray averaging exception."}}



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
