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
CANDIDATE_REF='fffacb8a2523e334247c73deec760b49dec9befe'
REVIEWED_PACKAGE_SHA256='7e4b5e948880805ee41ed916f67b7da7e30e6da1c4199a0700ae560248df5375'
REVIEWED_BINDINGS_SHA256='8b0de3cf9689a82ebdc2bb6b3e42aaf570aa7ad7bee19ac7d3ccd62075e5c708'
BATCH='momentum-056'
ASSET_NAME='momentum-steps.svg'
FALSE_PROOF='La quantità di moto di ciascun corpo resta sempre costante perché p=mv, anche se una forza esterna cambia la sua velocità.'
SVG_MUTATION=(b'M100 700H340', b'M100 700H220')
EXPECTED_IDS={f"AR-u2-momentum-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-momentum-01": "a9561f5dcae86b5eb75d09aa8739c3c61d73e8f7eeebc99543d70ffe391bf335",
    "AR-u2-momentum-02": "5153ed1770d8e0b9f9f85d8a7fd438ff8e34e9fe2f4755311c6bf75c1742c6d1",
    "AR-u2-momentum-03": "2a2d72030f8a43178f7fb4af723378f605b1f8ea063ca658998411c381f380e4",
    "AR-u2-momentum-04": "61c90998ede98643fe36a09fa093093836e7fbd54c952923ff8021a985cef25c",
    "AR-u2-momentum-05": "13a75cd4f70ce5ce43619e45e209e93a2b89183b281c5390e9858ddb3fbdb652",
    "AR-u2-momentum-06": "3a157b9d2e2b0a6a9b1064ec900dedb323b3de07fb23da4043b32fa061e92385",
    "AR-u2-momentum-07": "95ef8be2e99d4699d47f61fefa7103c422960a08a988bf6f88ade7f35f1812b2",
    "AR-u2-momentum-08": "c1b99ddd1ff66ed58e8afc0f3ccb4469610137a697c756fe41c59fbacc19d29c",
    "AR-u2-momentum-09": "d857550cf1c995831303613e2222a63a00e5a1cd8ab2a12ac0d737a08b2c4749",
    "AR-u2-momentum-10": "caa26732bc6dc18565c5af3c5414cc2d067b848866a3608f33aab2f4f3ae2aba",
    "AR-u2-momentum-11": "194c796aac0617b7cb4bf53df2cb2ae100257de4f61d745144f1c955d4f6a862",
    "AR-u2-momentum-12": "0a4045c9a8e2e79f8b95960a8c4fec005aa07fd97cf6629f3fe72fa65f26cb20",
    "AR-u2-momentum-13": "45eb901e3199ddb55e5542ddcef81b7b5af7cd4b095ecf6e9f13febe8bed3aab",
    "AR-u2-momentum-14": "5b86509757cb06e71d304d7b05f09465cae3869891beb585053ac6ef2d8e4a37",
    "AR-u2-momentum-15": "92485a8238bb75cdfd7844e5f37657e4391b276d349958dde90fe9f4a098d700",
    "AR-u2-momentum-16": "09758279af5827abb365d851dfcb64b21782bdda0c19b43c838c26496f946673"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,v,p,a,b,q,z,c=sp.symbols("m v p a b q z c",positive=True)
    law=m*v;invM=sp.solve(sp.Eq(p,law),m)[0];invV=sp.solve(sp.Eq(p,law),v)[0]
    ratio=sp.cancel(law.subs({m:a*m,v:b*v},simultaneous=True)/law);assert ratio==a*b
    first=law.subs({m:2,v:2});second=law.subs({m:4,v:4})
    quantity=(SI.Quantity(2,"kg")*SI.Quantity(2,"meter/second")).to("newton*second");assert quantity.magnitude==4
    assert law.subs({m:2,v:-2})==-4
    mean=(first+second)/2;assert mean==10 and law.subs({m:3,v:3})==9
    gain=(SI.Quantity(12,"")/SI.Quantity(4,"kg*meter/second")).to("second/(kg*meter)")
    decoded=(SI.Quantity(48,"")/gain).to("kg*meter/second").magnitude;assert gain.magnitude==3 and decoded==16
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,33)],(q,z));assert cal=={q:2,z:1}
    affine=(17-cal[z])/cal[q];assert affine==8
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq((c*v*v).subs({c:1,v:real}),4),real);assert roots==[-2,2]
    physical=[r for r in roots if r>0];assert physical==[2]
    square=(SI.Quantity(4,"kg*meter/second")/SI.Quantity(1,"kg*second/meter")).to("meter**2/second**2");assert square.magnitude==4
    return [first,"kg·m/s","p=mv","Da 4 a 8 kg·m/s",invM.subs({p:4,v:2}),invV.subs({p:4,m:2}),2,8-first,
      "m=p/v","κ₁ κ₂",second/first,mean,invV.subs({p:4*first,m:4})/2,invM.subs({p:sp.Rational(decoded),v:4}),invM.subs({p:affine,v:2}),physical[0]]

MANUAL=['Classical particle momentum vector p=m vector v. For m2 kg and speed2 m/s its magnitude is4 kg·m/s.', 'kg·m/s has dimensions M L/T and equals N·s because N=kg·m/s².', 'The definition p=m v for magnitudes follows from positive mass and p vector=m v vector; it is not an energy formula.', 'Fixed speed2 m/s, mass2→4 kg gives momentum4→8 kg·m/s.', 'm=p/v=4/(2)=2 kg.', 'v=p/m=4/(2)=2 m/s, a positive speed.', 'Same speed and doubled mass: p_B/p_A=8/4=2.', 'Proposed−correct=8−4=+4 kg·m/s.', 'p=m v gives m=p/v for v>0; momentum divided by speed has mass dimensions.', 'Between trials m_B=a m_A,v_B=b v_A gives ratio a b, since the definition is bilinear.', 'p_A=2·2=4,p_B=4·4=16 kg·m/s;16/4=4.', 'Mean outputs(4+16)/2=10 kg·m/s; mean inputs3 kg,3 m/s yield9, difference1 kg·m/s.', 'Target p16 kg·m/s at mass4 kg requires speed4 m/s; ratio4/2=2.', 'q=12/(4 kg·m/s)=3 s/(kg·m);S48→p16 kg·m/s;divide by4 m/s gives mass4 kg.', 'q=(33−9)/(16−4)=2 s/(kg·m), offset1. S17→p8 kg·m/s;v2→m4 kg.', 'm=c v, c1 kg·s/m yields p=c v². v²=4 m²/s²; algebraic±2, positive speed2 m/s and mass2 kg. Negative branch would also make m negative under the coupling.']
DISTRACTORS=['Kinetic energy m v²/2 is different despite equal numerical value here; positive magnitude must not be confused with signed component.', 'kg is mass, m/s velocity, N force, J energy; none has M L/T. Equivalent N·s is explained but not offered as a duplicate choice.', 'mv²/2 is energy; m/v has dimensions M T/L; v/m is inverse mass times speed; mv² differs from momentum dimensions.', '4→16 wrongly squares mass change;4→4 ignores it;decrease or zero contradict fixed positive speed.', 'pv has energy dimensions;v/p reciprocal mass;p/v² has different dimensions. Division by nonzero speed uniquely gives positive mass.', 'pm has wrong dimensions;m/p inverse velocity;negative value is not speed. Signed px may instead be negative at negative vx.', '1 ignores mass;1/2 reverses comparison;4 squares a single factor.', '−4 reverses error order;+8 repeats proposal;0 accepts it;+2 halves discrepancy.', 'p v is energy,p/v² not mass,v/p inverse mass,and factors2 fail the defining linear law.', 'Product required: quotient choices reverse one dependence, sum fails identity, a²b introduces spurious mass square.', '2 follows only one input;16 is output with units,not pure ratio;1/4 inverse.', '20 is sum,5 halves again,9 is momentum at mean inputs,12 is neither mean. The bilinear map does not generally commute with averages.', 'New speed4 m/s is not ratio4; unchanged speed2 gives only8 kg·m/s below16.', 'Display48 is dimensionless, not momentum48;divide gain before solving mass.', 'At v2, masses2,3,5,8 kg give display9,13,21,33;only4 gives17. Removing offset precedes division.', 'Signed negative velocity is possible for a particle, but this candidate asks positive speed and positive coupled mass. Roots are filtered by those physical domains, not blindly retained.']
ASSUMPTIONS=['Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x. Equal statistical weights on separately prepared trials.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x. Continuous dimensionless zero-offset display.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x. Two distinct momentum standards fix positive gain and offset.', 'Classical particle with positive mass constant within each trial, inertial laboratory. p vector=m v vector; scalar p and v are nonnegative magnitudes and selected cases strictly positive. Definition does not assert conservation or an isolated system. Signed component p_x may be negative for negative v_x. m=c v relates different trials with positive speed and mass, not time-varying mass within a trial.']
UNITS={1: 'kg*meter/second', 2: 'kg*meter/second', 3: 'kg*meter/second', 4: 'kg*meter/second', 5: 'kg', 6: 'meter/second', 7: 'dimensionless', 8: 'kg*meter/second', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'kg*meter/second', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'meter/second'}
NUMERIC_UNITS={1: 'kg·m/s', 5: 'kg', 6: 'm/s', 11: '1', 13: '1', 14: 'kg', 16: 'm/s'}
OPTION_SUFFIX={8: ' kg·m/s', 12: ' kg·m/s', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M100 700H340', 'M300 1020H180', 'M180 200H260', 'M100 580H220'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M100 700H340', 'M300 1020H180', 'M180 200H260', 'M100 580H220'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'Velocity2 m/s uses80 px at40 px/(m/s). Positive p4 and8 kg·m/s use120 and240 px at common30 px/(kg·m/s); negative px−4 uses120 px left on unchanged +x-right axis. Modulus remains4. Velocity and momentum scales dimensionally distinct; all marker-end definitions read separately from native preview.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-momentum-{n:02}"
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
      "title":"Classical momentum, signed component and magnitude","reference":"Source-only p vector=m v vector precedes key reading; no conservation inferred without external-impulse information, signed component distinguished from magnitude."}}



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
