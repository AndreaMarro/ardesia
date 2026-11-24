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
REVIEWED_PACKAGE_SHA256='1e640ed7e10f6b2157a2ec91d5720dd211cfcff601b564e674fd4b6799a14888'
REVIEWED_BINDINGS_SHA256='5d691a086b985e34896c36731055426c1b2f803646d7b08811fb45bad93b957a'
BATCH='incline-normal-037'
ASSET_NAME='incline-normal-steps.svg'
FALSE_PROOF='La normale annulla tutto il peso; l’equilibrio perpendicolare dimostra quindi che il corpo non può accelerare lungo il piano.'
SVG_MUTATION=(b'M280 545V645', b'M280 545V595')
EXPECTED_IDS={f"AR-u2-incline-normal-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-incline-normal-01": "18d98e81516751921c5c6e9e626b2e2799c519ceca4e0a88dbdfd891c769176a",
    "AR-u2-incline-normal-02": "69e9a0aa2459f4982cdd0220d74cb772314bc112be626b959ad2dab19d84b9fa",
    "AR-u2-incline-normal-03": "4232b92874ea29c5328c42b76b6bc2b0e12c39b66adab1dd93495f97271dd0dc",
    "AR-u2-incline-normal-04": "a8110c884042ce970bcb1d5235d6c5fff744761977cf8f7af97875d89ef30854",
    "AR-u2-incline-normal-05": "e6ff1cfcd146ce710de0dc632eff0eb1727635b36f75ac34dbc33627087e298f",
    "AR-u2-incline-normal-06": "2f2e2e8ac4ee5870a8f496094d8919466f20798ddf1083e116ef007fa937e067",
    "AR-u2-incline-normal-07": "4d0340e0cb6bd6e93390ec8229055eaabf64646e0a8409f4568e3542d30e7f2f",
    "AR-u2-incline-normal-08": "ebdc1e4f8088c56f257c274dba1df68eb406d783570222d799aa9faead57d91f",
    "AR-u2-incline-normal-09": "28a0212140396e0585e25700f7c17c17d1b79831361f5a0955e78effa949a822",
    "AR-u2-incline-normal-10": "2aa54464121897e7e73963e1dce02918584c1734ce3698d5368d43e19c31d2e8",
    "AR-u2-incline-normal-11": "a6e015cdc4a2b9ddad3265aa136475d1884b2a1692d15bf10b271e8eb193ab1d",
    "AR-u2-incline-normal-12": "5902ab21d74e417f895077ec3334e46fcdbfeaf023d796cba2ef819ac4aec88e",
    "AR-u2-incline-normal-13": "f33a23297b458a3e7f1c81b6055d0bd4b118d5c9824bd523c0be76d59744e3fe",
    "AR-u2-incline-normal-14": "5e2a9cba21bfcf3cd6b6750b45a44bb2f087eb244c62b355410e75812dd792dc",
    "AR-u2-incline-normal-15": "0a929d72c330fe664d4f260c8bd0c12d0c8b640eb2f1b1108ad5ca1d0b17e323",
    "AR-u2-incline-normal-16": "6371989372bfb6756e2e31f64715894fb3a33af9d3202df2af75b612acd3cbd9"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,g,c,N,k1,k2,q,b=sp.symbols("m g c N k1 k2 q b",positive=True)
    law=sp.solve(sp.Eq(N-m*g*c,m*0),N)[0]
    inverse_m=sp.solve(sp.Eq(N,law),m)[0];inverse_c=sp.solve(sp.Eq(N,law),c)[0]
    assert sp.simplify(law-m*g*c)==0
    assert sp.cancel(law.subs({m:k1*m,c:k2*c},simultaneous=True)/law)==k1*k2
    u=sp.symbols("u",positive=True)
    assert law.subs(c,u/(1+u)).is_positive and sp.factor((m*g-law).subs(c,u/(1+u))).is_positive
    first=law.subs({m:2,g:10,c:sp.Rational(1,2)})
    second=law.subs({m:4,g:10,c:sp.Rational(4,5)})
    mean_inputs=law.subs({m:3,g:10,c:sp.Rational(13,20)})
    assert mean_inputs==sp.Rational(39,2) and (first+second)/2-mean_inputs==sp.Rational(3,2)
    quantity=(SI.Quantity(2,"kg")*SI.Quantity(10,"meter/second**2")*Fraction(1,2)).to("newton")
    gain=(SI.Quantity(30,"")/quantity).to("1/newton")
    decoded=(SI.Quantity(96,"")/gain).to("newton")
    assert quantity.magnitude==10 and gain.magnitude==3 and decoded.magnitude==32
    calibration=sp.solve([sp.Eq(q*first+b,21),sp.Eq(q*second+b,65)],(q,b))
    assert calibration=={q:2,b:1}
    decoded_affine=(41-calibration[b])/calibration[q]
    z=sp.symbols("z",real=True)
    roots=sp.solve(sp.Eq(40*z*z,10),z)
    assert roots==[-sp.Rational(1,2),sp.Rational(1,2)]
    physical=[r for r in roots if 0<r<1]
    assert physical==[sp.Rational(1,2)] and 4*physical[0]==2
    return [first,"N","N=mgc","Da 10 a 20 N",inverse_m.subs({N:10,g:10,c:sp.Rational(1,2)}),
      inverse_c.subs({N:10,m:2,g:10}),law.subs({m:2,g:10,c:sp.Rational(4,5)})/first,20-first,"m=N/(gc)","κ₁κ₂",
      second/first,(first+second)/2,inverse_c.subs({N:second,m:4,g:10})/sp.Rational(1,2),
      inverse_m.subs({N:sp.Rational(decoded.magnitude),g:10,c:sp.Rational(4,5)}),
      inverse_m.subs({N:decoded_affine,g:10,c:sp.Rational(1,2)}),physical[0]]

MANUAL=['Outward normal positive: N−mgc=m·0, so N=2·10·1/2=10 N. This cancels only the normal component of the20 N weight.', 'kg·(m/s²) times a pure cosine gives kg m/s²=N. It is a force, not an acceleration.', 'The fixed-plane constraint enforces a_perp=0. Project Newton perpendicularly: N−mgc=0, hence N=mgc.', 'With g10,c1/2 fixed, m2→4 kg gives N10→20 N, exactly proportional.', 'm=N/(gc)=10/[10·(1/2)]=2 kg; g and c are positive.', 'c=N/(mg)=10/(2·10)=1/2. It lies in(0,1), so the normal remains positive below the weight.', 'N1=10 N; N2=2·10·4/5=16 N. Ratio N2/N1=16/10=8/5.', 'Proposed20 N minus correct10 N gives +10 N; using the whole weight ignores the projection.', 'N=mgc; divide by g c>0 to obtain m=N/(gc). Substitution recovers N.', 'At fixed g, Nnew=(κ1m)g(κ2c)=κ1κ2N; positive scales must preserve0<κ2c<1.', 'N2=4·10·4/5=32 N; N1=10 N, so ratio16/5.', 'Output mean(10+32)/2=21 N. Mean mass3kg and mean cosine13/20 give39/2 N, which is3/2 N smaller.', 'Target N2=(16/5)10=32 N at m2=4kg gives c2=32/40=4/5; c2/c1=8/5.', 'Gain q=30/(10 N)=3 N^-1. S96 gives N32 N; m=32/[10·4/5]=4kg.', 'q=(65−21)/(32−10)=2 N^-1 and offset1. S41 gives N20 N; m=20/[10·1/2]=4kg.', 'Across trials m=(4kg)c, so N=(40N)c²=10N. c²=1/4; acute branch c1/2 yields m2kg. Negative cosine would also give negative linked mass, both excluded.']
DISTRACTORS=['20 N uses the entire weight, not its normal component. A force balance on a constrained axis does not imply full rest.', 'kg is mass, m/s² acceleration, m length and s duration. Only N has force dimensions.', 'mg/c exceeds the weight; mg assumes a horizontal plane;zero loses contact;mgc² projects twice.', 'Unchanged ignores doubling mass;40 N quadruples;5 N uses inverse proportionality;zero contradicts positive contact.', 'Multiplication by gc cannot undo N=mgc and has wrong units. A reciprocal cannot be a positive mass with the required dimensions.', '1/4 squares;−1/2 is outside acute geometry;2 is the reciprocal and exceeds1;1 gives horizontal geometry outside the specified open domain.', '5/8 reverses;4/5 is just the new cosine;16/5 doubles;3/5 is the relative increment, not N2/N1.', '+20 repeats the proposal;−10 reverses subtraction;zero accepts the incorrect whole weight;+5 halves the error.', 'Ngc multiplies instead of divides;gc/N has inverse-mass units;extra factors2 and1/2 fail substitution.', 'The ratio choices assign an inverse response;the sum fails unchanged scales;κ1κ2² counts the cosine change twice.', '5/16 is reciprocal;2 changes mass only;8/5 changes cosine only;32/5 doubles the required ratio.', '42 is sum;21/2 divides twice;22 is difference.39/2 is the force at mean inputs, not the mean of the outputs.', '5/8 is reciprocal;16/5 doubles;4/5 is c2 itself;2 omits the target change when compensating mass.', '96 is a display reading and not a force; remove calibrated gain before using the mass inverse.', '5 and3 kg add or subtract1 to the correct4 without decoding.8 doubles and2 halves.4 reproduces S41.', '1/4 misses the square root;−1/2 violates geometry and linked positive mass;1 and3/2 fail the equation, with3/2 also beyond the cosine range.']
ASSUMPTIONS=['Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero. Positive changes preserve0<κ2c<1.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero. Equal-weight arithmetic mean of outputs; average inputs define a different trial.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero. Continuous dimensionless display with positive gain and no offset.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero. Two distinct normal-force standards determine gain and fixed offset.', 'Smooth fixed plane in an inertial frame; mass m>0; only gravity and normal; exact uniform g=10m/s². Acute inclination0<c=cosθ<1 and maintained contact. The constraint sets only perpendicular acceleration to zero: N=mgc is positive and less than mg. Tangential acceleration may be nonzero. Positive masses are constant within each separate trial; between trials m=(4kg)c, and only the acute cosine branch is physical.']
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'kg', 6: 'dimensionless', 7: 'dimensionless', 8: 'newton', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'N', 5: 'kg', 14: 'kg'}
OPTION_SUFFIX={8: ' N', 12: ' N', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M280 545L232 609', 'M280 545V645', 'M280 545L328 481'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or arrow direction changed")
    for e in root.iter():
        if e.get("d") in needed and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return '3–4–5 triangle160×120px and(.8,.6) plane tangent. m2kg,g10,c4/5: P20N100px vertically down, N16N80px outward(.6,−.8), Pperp16N80px inward. A common5px/N scale gives opposite equal normal vectors; Pperp replaces part of P rather than adding a physical force. All arrowheads defined and referenced.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-incline-normal-{n:02}"
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
      "title":"Inclined-plane normal reaction from the perpendicular constraint","reference":"Source-prompt-only derivation preceded keys: zero perpendicular acceleration gives N=mgc, while parallel motion may accelerate. Positive contact and acute cosine branch separately checked."}}



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
