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
CANDIDATE_REF='b8a613d3e8205cf08ddca35f290d61e757afc9ec'
REVIEWED_PACKAGE_SHA256='3aa4ef006a8fd0fd9ba833ea7c61e6d5030d60bb24c47cfd023f41bf10c6f2d4'
REVIEWED_BINDINGS_SHA256='75c3f15fdad4a8804994de3215c82333573d1ed35108d51f309e6e61db277d86'
BATCH='impulse-055'
ASSET_NAME='impulse-steps.svg'
FALSE_PROOF='L’impulso della risultante coincide sempre con la quantità di moto finale anche se la quantità di moto iniziale è diversa da zero.'
SVG_MUTATION=(b'width="120" height="120"', b'width="60" height="120"')
EXPECTED_IDS={f"AR-u2-impulse-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-impulse-01": "1c35779767ce44518ac84efdf38116b003ecc713c09c2d4f30b7e0caa03e995a",
    "AR-u2-impulse-02": "4f887008d70efe25e8a6767ecd17164820d771220d26122199a0631ef59dcc93",
    "AR-u2-impulse-03": "ec0a5ee6700883c43f1d3c52adee269a8f34999aee0ec926ae47014a0702a810",
    "AR-u2-impulse-04": "4604a5040f5f8b37158ce875b522a31a08965652f27f29b20ea64df420be6862",
    "AR-u2-impulse-05": "8ff8ee33ff1e294f7cadd83c8ef66c73332b32f786e8edb12c4a4da097931697",
    "AR-u2-impulse-06": "b703102f068df5a0b45da8ca6670c3d49bf82233d49f57609034be24ecbefdc3",
    "AR-u2-impulse-07": "3d8b48f352e93dc5eea5b18cb29135505682661b00d0339a297381cb2c3f2dc5",
    "AR-u2-impulse-08": "630e884f177f5ef6826c91f3b230052ffe6fbf11f34c8ad4671fdf5e2c7afbda",
    "AR-u2-impulse-09": "e00f9cb5cd37218e7f9127aa06f9e3da5dcc9827fef6a238f116245ea2fcc87b",
    "AR-u2-impulse-10": "76362738baff125545dddb2eb78a2cfa9e0ed84d827b9763b45d170496476501",
    "AR-u2-impulse-11": "7c4eaaf6960639de488b553dd8c0c355df95dffcdffa41f361759124c69cbd95",
    "AR-u2-impulse-12": "8941a989315c9e0442dbffa5de310436ab34b4cfa76ea5346a41d6503df4715b",
    "AR-u2-impulse-13": "d80c38104020c86f2890e4d86f211c0f367cf56a06009d7abe93ac35aa82d390",
    "AR-u2-impulse-14": "e7a1010a76628faf736865e2fb58411adbb85596cedb62c401e6f1caac246c60",
    "AR-u2-impulse-15": "65e8d444b564813d228a1d88bbc22badd0fb59bd77e5941dfadca66b34e55847",
    "AR-u2-impulse-16": "7f16bac809ef5df444e31cd81b44cc37f34fd71c825848abf6de0082aefd3977"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    F,T,t,J,a,b,q,z,c=sp.symbols("F T t J a b q z c",positive=True)
    law=sp.integrate(F,(t,0,T));assert law==F*T
    invF=sp.solve(sp.Eq(J,law),F)[0];invT=sp.solve(sp.Eq(J,law),T)[0]
    ratio=sp.cancel(law.subs({F:a*F,T:b*T},simultaneous=True)/law);assert ratio==a*b
    first=law.subs({F:2,T:2});second=law.subs({F:4,T:4})
    exact=(SI.Quantity(2,"newton")*SI.Quantity(2,"second")).to("kg*meter/second");assert exact.magnitude==4
    same=invF.subs({J:6*2,T:3});assert same==4
    mean=(first+second)/2;assert mean==10 and law.subs({F:3,T:3})==9
    gain=(SI.Quantity(12,"")/SI.Quantity(4,"newton*second")).to("1/(newton*second)")
    decoded=(SI.Quantity(48,"")/gain).to("newton*second").magnitude;assert gain.magnitude==3 and decoded==16
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,33)],(q,z));assert cal=={q:2,z:1}
    affine=(17-cal[z])/cal[q];assert affine==8
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq(law.subs(F,c*T).subs({T:real,c:1}),4),real)
    assert roots==[-2,2];physical=[r for r in roots if r>0];assert physical==[2]
    square=(SI.Quantity(4,"newton*second")/SI.Quantity(1,"newton/second")).to("second**2");assert square.magnitude==4
    return [first,"N·s",same,"Da 4 a 8 N·s",invF.subs({J:4,T:2}),invT.subs({J:4,F:2}),2,8-first,
      "F=J/Δt","κ₁ κ₂",second/first,mean,invT.subs({J:4*first,F:4})/2,invF.subs({J:sp.Rational(decoded),T:4}),invF.subs({J:affine,T:2}),physical[0]]

MANUAL=['J_x=integral F_x dt=F_x T. With constant +2 N for 2 s, J_x=+4 N·s; its modulus is 4 N·s.', 'N·s=(kg·m/s²)s=kg·m/s, momentum change dimensions M L/T.', 'First impulse 6 N·2 s=12 N·s. Same vector impulse over 3 s in the same direction requires 12/3=4 N.', 'With T=2 s unchanged, F:2→4 N gives J:4→8 N·s.', 'F=J/T=4 N·s/(2 s)=2 N.', 'T=J/F=4 N·s/(2 N)=2 s, positive interval.', 'T stays fixed and F doubles: J_B/J_A=8/4=2.', 'Proposed minus correct is 8−4=+4 N·s, not −4.', 'J=F Δt, divide by Δt>0: F=J/Δt; unit N·s/s=N.', 'F_B=a F_A, T_B=b T_A yields J_B/J_A=a b. Both positive; identity and common-factor checks hold.', 'J_A=2·2=4 and J_B=4·4=16 N·s; ratio 16/4=4.', 'Equal-weight mean (4+16)/2=10 N·s. Mean-input trial has 3 N·3 s=9 N·s, difference 1 N·s.', 'Target J_B=4 J_A=16 N·s with F_B=4 N requires T_B=4 s; T_B/T_A=4/2=2.', 'Gain q=12/(4 N·s)=3 (N·s)^−1. S=48 decodes J=16 N·s; divide by T=4 s gives F=4 N.', 'q=(33−9)/(16−4)=2 (N·s)^−1, z=1. S=17 gives J=(17−1)/2=8 N·s and F=8/2=4 N.', 'Between trials F=c T with c=1 N/s; within each trial F is constant. J=c T², so T²=4 s². Roots −2,+2 s; T>0 selects 2 s and F=2 N. No ramp integral factor 1/2.']
DISTRACTORS=['J is the change Δp, not automatically final p; final momentum also needs initial p. Force 2 N and time 2 s alone are not impulse.', 'N is force, J energy, kg mass, m/s velocity; N·s alone matches the required impulse unit among these choices.', '2 or 3 N copies unrelated input numbers; 6 N holds force despite longer interval; 9 N scales force directly with time. Products with 3 s fail 12 N·s.', '4→4 ignores doubled force; 4→16 counts force twice; decreasing or zero values violate the same positive interval.', 'Multiplying by time gives N·s² rather than force; reciprocal T/J has inverse-force dimensions.', 'Multiplying force and impulse has wrong dimensions; F/J is reciprocal time. Positive division J/F is unique.', '1 ignores change; 1/2 reverses; 4 squares a single change. T remains 2 s in both trials.', '−4 reverses subtraction; +8 repeats proposal; zero accepts incorrect proposal; +2 halves the discrepancy.', 'J Δt has wrong units, Δt/J is inverse force, negative or extra factors fail positive constant-resultant integration.', 'Ratio of factors loses one direct dependence; sum fails unchanged-trial identity; extra denominator 2 invents a ramp not stated.', '2 counts one factor only; 16 is the dimensional output number rather than its ratio; reciprocal reverses comparison.', '20 is sum, 5 halves the mean again, 9 belongs to mean inputs, 12 is neither equal-weight mean nor correct trial result.', 'Keeping T=2 s at F=4 N gives only J=8, below target 16. New time 4 s is not pure ratio 4.', 'Raw display 48 is dimensionless and must be divided by q before physical inversion; using it as impulse retains gain 3.', 'At T=2 s, F=2,3,5,8 N gives S=9,13,21,33. Only F=4 N gives S=17. Raw display ratios do not remove offset.', 'Integrating a ramp F(t)=ct would change the experiment and insert 1/2. Negative time is not an allowed interval; zero cannot yield positive impulse.']
ASSUMPTIONS=['Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials. Same vector impulse includes unchanged direction.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials. Equal statistical weights on outputs, not a time average across trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials. Continuous dimensionless display with zero offset and positive gain.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials. Continuous affine display; two distinct impulse standards identify gain and offset.', 'Inertial laboratory, constant resultant vector during each finite interval T>0, fixed direction; positive axis along it. J denotes impulse modulus when scalar, signed J_x=Δp_x when component. Momentum change rather than final momentum; force amplitudes may differ between trials. F=cT is a relation between trial parameters; F remains constant in internal time within each trial.']
UNITS={1: 'newton*second', 2: 'newton*second', 3: 'newton', 4: 'newton*second', 5: 'newton', 6: 'second', 7: 'dimensionless', 8: 'newton*second', 9: 'newton', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton*second', 13: 'dimensionless', 14: 'newton', 15: 'newton', 16: 'second'}
NUMERIC_UNITS={1: 'N·s', 5: 'N', 6: 's', 11: '1', 13: '1', 14: 'N', 16: 's'}
OPTION_SUFFIX={3: ' N', 8: ' N·s', 12: ' N·s', 15: ' N'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M80 1000V760M60 970H240M350 1000V760M330 970H560', 'M100 410V180M75 380H410'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(350, 890, 180, 80), (100, 300, 160, 80), (80, 850, 120, 120)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'First F–t rectangle 160×80 px at 80 px/s and 40 px/N gives T2 s,F2 N,J4 N·s. Comparison rectangles120×120 and180×80 px at shared60 px/s and20 px/N give6N·2s=4N·3s=12 N·s. Separate panel scales explicit, origin and Δp/final-p distinction read in full rendering.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-impulse-{n:02}"
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
      "title":"Impulse of a constant resultant and momentum change","reference":"First integrate constant resultant over its positive interval, then solve inverse/scaling/display constraints; distinguish change of momentum from final momentum and between-trial coupling from time ramp."}}



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
