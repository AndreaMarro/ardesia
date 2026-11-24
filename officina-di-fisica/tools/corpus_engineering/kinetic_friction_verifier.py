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
CANDIDATE_REF='4c0679e860b24e7c57a8f1c82a70b9a2969be4f2'
REVIEWED_PACKAGE_SHA256='8b1c016b4518ff41b15ab13c532dbf7fb8605efd40a8c6509037223c4fac5dd4'
REVIEWED_BINDINGS_SHA256='759d6d42b6a5e96c7cb5e30577df91f13bbef83838a9918387edc928c45d9d2b'
BATCH='kinetic-friction-038'
ASSET_NAME='kinetic-friction-steps.svg'
FALSE_PROOF='L’attrito dinamico vale sempre il peso mg e il suo verso si sceglie opposto all’accelerazione anche quando il verso dello scorrimento relativo è diverso.'
SVG_MUTATION=(b'M285 822H205', b'M285 822H245')
EXPECTED_IDS={f"AR-u2-kinetic-friction-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-kinetic-friction-01": "0258851557acef670db245f326f529c985c409355cf70291f562291c3fbf7815",
    "AR-u2-kinetic-friction-02": "71780febe6d0cb9e6180379716c5824de74c6761b3e7d592fe105f4c271a37f3",
    "AR-u2-kinetic-friction-03": "5a0fee4e085558a432c6d33590e7297fdbd444a556569407bb2d2727003d31a9",
    "AR-u2-kinetic-friction-04": "5fee6e05f3a65defba0b9c42b38e377b5cdef6852089e00fda54bdd986f453bb",
    "AR-u2-kinetic-friction-05": "4ce397d946384b27da60fe15ced97f7feb95df3ca625bd66c5441dbf89f15d66",
    "AR-u2-kinetic-friction-06": "9b4bcade6adcf54cc634ff09fc3001d6dbc16794993d2c32163cfe51df00fda3",
    "AR-u2-kinetic-friction-07": "f4636c2f98ca22f592c15dd679e3fa55b779cad41b604fa2d4d2cc474f22b78c",
    "AR-u2-kinetic-friction-08": "75bf7e578f8b966f28fe3a464555f7bfb37baf87c1d554e5d79f29ca458e8880",
    "AR-u2-kinetic-friction-09": "fcd61b26aabe21a62e8a14e4a68564c20a4d42ddfcee2d724726ab7d77f22b6d",
    "AR-u2-kinetic-friction-10": "0deab3e62e20c638a5ceae2d2a13cc61310722f0558803adb056666f3eb92650",
    "AR-u2-kinetic-friction-11": "dfdbae6fed1e9e96546e22b57cdd42b0260187721af002d4d29f307d6f7e3ae8",
    "AR-u2-kinetic-friction-12": "3f0afd5447d24aab31d27e76d1014fcb93d9db657cddaf6b777c677b8dda5fd6",
    "AR-u2-kinetic-friction-13": "30b31024be9b70401ec15b5915e2e5607dcb67444ccaa2c2272e30e17b412fbb",
    "AR-u2-kinetic-friction-14": "2f3f180d17a35017a5d49440029e585996f6a8ac419a7bdb0a4df53c29cf0f1f",
    "AR-u2-kinetic-friction-15": "a146fa549dbbbcef0e97e83803b0048589a4f64dedde8f73200b7f3b6c11f490",
    "AR-u2-kinetic-friction-16": "c4c35e13312c011556c01f09b722692c8f5d96ec41369c8798b3d2affccb47b8"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    mu,N,F,k1,k2,q,b=sp.symbols("mu N F k1 k2 q b",positive=True)
    # Constitutive law in the slipping Coulomb regime. Newton would require all
    # other forces to determine acceleration: this force is not the net force.
    law=sp.solve(sp.Eq(F,mu*N),F)[0]
    inverse_mu=sp.solve(sp.Eq(F,law),mu)[0];inverse_N=sp.solve(sp.Eq(F,law),N)[0]
    assert law.is_positive and sp.cancel(law.subs({mu:k1*mu,N:k2*N},simultaneous=True)/law)==k1*k2
    v=sp.symbols("v",nonzero=True,real=True)
    signed=-law*sp.sign(v)
    assert signed.subs(v,1)==-law and signed.subs(v,-1)==law
    first=law.subs({mu:sp.Rational(1,2),N:4});second=law.subs({mu:1,N:1})
    mean_inputs=law.subs({mu:sp.Rational(3,4),N:sp.Rational(5,2)})
    assert mean_inputs==sp.Rational(15,8) and (first+second)/2-mean_inputs==-sp.Rational(3,8)
    quantity=(SI.Quantity(Fraction(1,2),"")*SI.Quantity(4,"newton")).to("newton")
    gain=(SI.Quantity(6,"")/quantity).to("1/newton")
    decoded=(SI.Quantity(3,"")/gain).to("newton")
    assert quantity.magnitude==2 and gain.magnitude==3 and decoded.magnitude==1
    calibration=sp.solve([sp.Eq(q*first+b,5),sp.Eq(q*second+b,3)],(q,b))
    assert calibration=={q:2,b:1}
    decoded_affine=(7-calibration[b])/calibration[q]
    z=sp.symbols("z",real=True)
    roots=sp.solve(sp.Eq(z*z/8,2),z)
    assert roots==[-4,4]
    physical=[r for r in roots if r>0]
    assert physical==[4]
    coupled=(SI.Quantity(Fraction(1,8),"1/newton")*SI.Quantity(4,"newton")).to("")
    assert coupled.magnitude==Fraction(1,2)
    return [first,"N","F=μ_d N","Da 2 a 1 N",inverse_mu.subs({F:2,N:4}),
      inverse_N.subs({F:2,mu:sp.Rational(1,2)}),law.subs({mu:sp.Rational(1,2),N:8})/first,4-first,"μ_d=F/N","κ₁κ₂",
      second/first,(first+second)/2,inverse_N.subs({F:second,mu:1})/4,
      inverse_mu.subs({F:sp.Rational(decoded.magnitude),N:1}),inverse_mu.subs({F:decoded_affine,N:3}),physical[0]]

MANUAL=['In maintained sliding contact Coulomb gives modulus F=μdN=(1/2)4=2 N. On a right-positive axis with rightward relative slip, Fx=−2 N.', 'The coefficient is dimensionless; multiplying the supplied normal force in newtons gives newtons.', 'The stated dynamical regime selects F=μdN. Direction is assigned separately opposite relative slip, not by a negative force modulus.', 'N4 fixed, coefficient1/2→1/4 gives F2→1 N: one half. Each material has its own constant coefficient within a trial.', 'μd=F/N=2N/4N=1/2, dimensionless and positive.', 'N=F/μd=2N/(1/2)=4N. This is the given normal load, not automatically a weight.', 'Normal load4→8N at μ1/2 gives F2→4N; ratio2.', 'Proposed4N minus actual2N gives +2N. The proposal equates the normal and friction magnitudes.', 'F=μdN and N>0 imply μd=F/N. The force units cancel.', 'New coefficientκ1μ and normalκ2N give Fnew=κ1κ2F, for positive scales and maintained sliding contact.', 'FirstF=(1/2)4=2N; secondF=1·1=1N. Ratio1/2: increased coefficient does not offset smaller load.', 'Mean outputs(2+1)/2=3/2N. Mean inputs3/4 and5/2N give15/8N, exceeding the requested mean by3/8N.', 'TargetF2=(1/2)2=1N, coefficient2=1, hence N2=1N; N2/N1=1/4.', 'Zero-offset display q=6/(2N)=3N^-1. S3 gives F1N; with N1N, μd=1.', 'q=(3−5)/(1−2)=2N^-1, offset1. S7 decodes F3N; at N3N, μd=1.', 'Across trials μd=kN with k=(1/8)N^-1. F=kN²=2N gives load squared16N²; positive contact selects load4N and coefficient1/2. Negative load is not a physical branch.']
DISTRACTORS=['4N assumes μ=1 or uses normal as friction;1/2 alone is a coefficient without force units. A signed component must be distinguished from the positive modulus.', 'kg mass,m/s² acceleration,m length,s time all differ from force. N is force.', 'N/μ assigns inverse coefficient dependence;N assumes μ1;zero ignores sliding with positive load and coefficient;μ²N counts coefficient twice.', 'Unchanged ignores coefficient change;4N reverses it;1/2N quarters instead of halves;zero would require zero coefficient or lost contact.', '1/4 squares the ratio;−1/2 is an invalid modulus coefficient;2 is reciprocal;1 would require equal friction and normal magnitudes.', 'Multiplication by μ would produce1N rather than undo the product. A reciprocal or treating F as load fails substitution; normal must be positive.', '1/2 reverses the ratio;4 squares the scale;1 ignores changed load;−2 cannot be the ratio of positive moduli.', '+4 repeats the proposal;−2 reverses subtraction;zero accepts the error;+1 halves the signed discrepancy.', 'FN has force-squared dimensions;N/F is reciprocal;extra2 or1/2 fail the original product.', 'The quotient choices invert one dependence;addition fails unchanged trial;κ1κ2² applies the load multiplier twice.', '2 is reciprocal;1/4 accounts only for load;1 ignores both changed inputs;−1/2 violates positive moduli.', '3 is the sum;3/4 divides twice;1 is difference (and the second output).15/8 is a separate trial at mean inputs, not the required mean.', '4 reverses the load ratio;1/2 changes load in the desired output ratio but ignores doubled coefficient;2 and1 fail target F1N.', '3 is a dimensionless display value and not force;gain removal precedes coefficient inversion. μ=1 is physically allowed: there is no universal upper bound of1.', '0 or−1 mis-handle offset or signs and violate positive coefficient;2 doubles and1/2 halves.1 reproduces S7 at load3N.', '8 omits square root;2 confuses measured friction with normal;3 and5 fail kN²=2N. Positive4N alone gives μ1/2 and the requested force.']
ASSUMPTIONS=['Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Different coefficients select separate materials/trials; constant within each trial.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Positive scale factors preserve slip and contact; only the two stated inputs are scaled.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Equal statistical weights of output forces, not a trial made from mean inputs.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Dimensionless continuous display, positive gain and zero offset; μ=1 is admissible.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Distinct positive force standards determine gain and offset; decoded μ=1 is admissible.', 'Coulomb kinetic regime with nonzero relative sliding on a fixed surface and maintained positive normal load N>0. Positive coefficient μd is constant within a given trial; no universal bound μd≤1. F=μdN is the positive friction modulus; its vector opposes relative slip and is not necessarily the resultant. Normal load is supplied independently and is not replaced by mg. Coupling μd=(1/8N^-1)N selects different contacts between trials, not an unannounced normal-dependent coefficient within one trial; only positive load branch is physical.']
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'dimensionless', 6: 'newton', 7: 'dimensionless', 8: 'newton', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'newton'}
NUMERIC_UNITS={1: 'N', 6: 'N', 14: '1'}
OPTION_SUFFIX={8: ' N', 12: ' N', 16: ' N'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M255 115H335', 'M285 822H205'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or arrow direction changed")
    for e in root.iter():
        if e.get("d") in needed and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'Illustrative rightward vrel1m/s:80px at80px/(m/s). Separately μ1/2,N4N gives F2N and leftward Fx−2N:80px at40px/N. Different dimensions/scales are explicitly separated. Normal is supplied, other forces deliberately omitted; no resultant or acceleration inferred. Slip selects dynamic rather than static regime; vector arrowheads present.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-kinetic-friction-{n:02}"
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
      "title":"Sliding Coulomb friction modulus and relative-velocity direction","reference":"Primary source-prompt-only Coulomb law derivation and positive contact domain preceded keys; distinguish force modulus, signed component and net force; no automatic N=mg or coefficient upper bound."}}



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
