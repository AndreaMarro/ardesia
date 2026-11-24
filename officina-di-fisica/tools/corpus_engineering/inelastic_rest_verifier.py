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
CANDIDATE_REF='73d7ba91ccb1de8051e33017b7dc6f6d85d7e8ec'
REVIEWED_PACKAGE_SHA256='3ea90526a1d98966adeed8492e046541669c0ebedf0d82c01fa473fef7d2f920'
REVIEWED_BINDINGS_SHA256='15e3e4925b63d8da490977fbb77335a0f2a066b819818a816b4b0631e4fa215e'
BATCH='inelastic-rest-057'
ASSET_NAME='inelastic-rest-steps.svg'
FALSE_PROOF='Poiché durante un urto non vi è impulso esterno, anche l’energia cinetica totale deve conservarsi quando i due corpi rimangono uniti.'
SVG_MUTATION=(b'M290 570H340', b'M290 570H390')
EXPECTED_IDS={f"AR-u2-inelastic-rest-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-inelastic-rest-01": "47f00ab3727698ba5dd835c172c3197185aaea7f0fcb644b6658efcb6e28c955",
    "AR-u2-inelastic-rest-02": "d3fd6aea5ec843bc8feaae55125b67d748f16f5c206af342b56d4736c5f586c5",
    "AR-u2-inelastic-rest-03": "5dfba7dfe2c1edbbe0760234534d0b5c0c33bd01385ea55058ccfe84803abc27",
    "AR-u2-inelastic-rest-04": "0f3365f35fda5a9df6c957f7f2fc14f03f1408bd50fc76db8087a75e0d872471",
    "AR-u2-inelastic-rest-05": "92195935b9f9430f8ed9617845a13af180a3e21bb17c16220105849a00847f2c",
    "AR-u2-inelastic-rest-06": "7e81fdc9a464e1e34e36d2a8dbb5d6ab1ae54baa5bb5831e7e654be2961ea5ab",
    "AR-u2-inelastic-rest-07": "5366dff9f81c0e65f42360ac1091e491704f315508c0ec68d3e6076a1b99c324",
    "AR-u2-inelastic-rest-08": "d7b7451273530cfdba55c10d72767f3b8669823e51bc5c82de1a525093741db2",
    "AR-u2-inelastic-rest-09": "4ac3dba1e861611c9bb6bf477c7c45150712ad3d107ab046ffe54847f772bb59",
    "AR-u2-inelastic-rest-10": "61968c0bb5a042a3ea092b4733d311f32121ab3ec8796d96b29d0f7806b6aa23",
    "AR-u2-inelastic-rest-11": "1555dd2456e7b6c408ebc6b395e3791ca9cec2d20e6353e0870e3688cbc3bfae",
    "AR-u2-inelastic-rest-12": "617faab2ea8e1267d8f7d5cd0f403e0daaa2cc2c5f8c8a167cfac672657a0af9",
    "AR-u2-inelastic-rest-13": "21011a536b0670bd4ea8483eeab483c64e2962e5abd41dcef92abb64761c2bdb",
    "AR-u2-inelastic-rest-14": "d40c3430b93ec61159247ef5f74828fc8fa652f378eb13469c7dd39577bb392b",
    "AR-u2-inelastic-rest-15": "5f6884470d233e38a50c2ddafd1c22def720215583cd61a304c18da4c4604842",
    "AR-u2-inelastic-rest-16": "85023df40641c7d8be7701afec749d8935e6f0440439978e7ca91f608a16fd07"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,M,v,V,a,b,q,z,c=sp.symbols("m M v V a b q z c",positive=True)
    law=sp.solve(sp.Eq(m*v,(m+M)*V),V)[0];assert law==m*v/(m+M)
    assert sp.factor(v-law).is_positive
    invM=sp.solve(sp.Eq(V,law),m)[0];invV=sp.solve(sp.Eq(V,law),v)[0];assert invM==M*V/(v-V)
    ratio=sp.cancel(law.subs({m:a*m,v:b*v},simultaneous=True)/law);assert sp.simplify(ratio-a*b*(m+M)/(a*m+M))==0
    loss=sp.factor(m*v*v/2-(m+M)*law**2/2);assert sp.simplify(loss-M*m*v*v/(2*(M+m)))==0 and loss.is_positive
    first=law.subs({m:2,M:2,v:2});second=law.subs({m:4,M:2,v:4})
    quantity=(SI.Quantity(2,"kg")*SI.Quantity(2,"meter/second")/(SI.Quantity(2,"kg")+SI.Quantity(2,"kg"))).to("meter/second");assert quantity.magnitude==1
    mean=(first+second)/2;assert mean==sp.Rational(11,6) and mean-law.subs({m:3,M:2,v:3})==sp.Rational(1,30)
    gain=(SI.Quantity(3,"")/quantity).to("second/meter")
    decoded=(SI.Quantity(8,"")/gain).to("meter/second").magnitude;assert gain.magnitude==3 and decoded==Fraction(8,3)
    cal=sp.solve([sp.Eq(q*first+z,3),sp.Eq(q*second+z,sp.Rational(19,3))],(q,z));assert cal=={q:2,z:1}
    affine=(sp.Rational(11,3)-cal[z])/cal[q];assert affine==sp.Rational(4,3) and 0<affine<2
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq(law.subs({m:c*v,M:2},simultaneous=True).subs({c:1,v:real}),1),real)
    assert roots==[-1,2];physical=[r for r in roots if r>0];assert physical==[2]
    assert loss.subs({m:2,M:2,v:2})==2
    return [first,"m/s","La quantità di moto totale vettoriale","Da 1 a 4/3 m/s",invM.subs({V:1,v:2,M:2}),invV.subs({V:1,m:2,M:2}),2,2-first,
      "m=MV/(v−V)","κ₁ κ₂ S / S_B",second/first,mean,invV.subs({V:sp.Rational(8,3),m:4,M:2})/2,
      invM.subs({V:sp.Rational(decoded),v:4,M:2}),invM.subs({V:affine,v:2,M:2}),physical[0]]

MANUAL=['System momentum mv=(m+M)V, with target initially at laboratory rest. m2,M2 kg,v2 m/s gives V=4/4=1 m/s.', 'Total momentum divided by total mass has unit(kg·m/s)/kg=m/s.', 'Negligible external impulse preserves total vector momentum of both bodies. They stick; individual momenta change and kinetic energy decreases.', 'm4,M2 kg,v2 gives V=8/6=4/3 m/s, larger than1 but smaller than incident2.', 'm(v−V)=M V; m=2·1/(2−1)=2 kg; requires0<V<v.', 'v=V(m+M)/m=1·4/2=2 m/s.', 'With masses fixed and incident v doubled2→4, V1→2; ratio2.', 'Proposed2−correct1=+1 m/s.', 'm=MV/(v−V), finite positive only for0<V<v with M>0. V→v below requires unbounded moving mass.', 'New V=a b m v/(a m+M);ratio a b(m+M)/(a m+M)=a b S/S_B. Fixed target mass must remain in the new denominator.', 'V_A1,V_B4·4/(4+2)=8/3 m/s;ratio8/3.', 'Mean(1+8/3)/2=11/6 m/s. Mean inputs m3,v3 with M2 give9/5; difference(55−54)/30=1/30 m/s.', 'Target V8/3 at m4,M2 gives v=(8/3)·6/4=4 m/s;ratio4/2=2.', 'q=3/(1 m/s)=3 s/m;S8→V8/3 m/s. v4 gives m=2(8/3)/(4−8/3)=4 kg.', 'q=(19/3−3)/(8/3−1)=2 s/m,z1. S11/3→V4/3 m/s; m=(8/3)/(2/3)=4 kg.', 'm=c v, c1 kg·s/m; V=c v²/(c v+M). At V1 m/s,M2 kg, dimensionless u=v/(1 m/s) obeys(u−2)(u+1)=0. Roots2,−1; only v2 m/s,m2 kg. This is not a symmetric ±2 pair.']
DISTRACTORS=['V2 m/s ignores stationary target inertia; total mass is4 kg not2. Base kinetic energies4 J→2 J, loss2 J.', 'N·s is momentum rather than velocity; kg mass,J energy,m length.', 'Individual p is transferred between bodies; kinetic energy becomes internal; neither speed nor velocity of each body is conserved.', '2 is only limiting value as moving mass grows without bound;8/3 would also change incident speed;decreased/unchanged values miss increased mass share.', 'Minus denominator swapped gives negative mass;adding v+V fails original momentum equation;dividing by V alone loses incident speed.', 'V1 is final common speed,not incident speed; multiplying by m/(m+M) reverses inverse;zero cannot supply positive initial momentum.', '1 ignores incident-speed change;1/2 reverses;4 squares speed though momentum is linear.', '−1 reverses order;+2 repeats proposal;zero accepts it;+1/2 halves discrepancy.', 'MV/(v+V) does not isolate m;V−v yields negative mass;m=MV/v neglects final momentum of incident mass.', 'Pure a b omits denominator change; reciprocal denominator reverses mass effect;scaling target M as well changes the specified experiment.', '4 assumes total mass scales with incident mass;2 follows incident speed only;3/8 reverses.', '11/3 is sum;11/12 halves twice;9/5 is mean-input experiment;5/3 is not the output mean. Fractions11/6 and9/5 are distinct.', 'Keeping incident speed2 at new m4 gives4/3,not8/3. New speed4 has units and differs from pure ratio2.', 'S8 is dimensionless,not8 m/s;after gain removal V8/3 stays below v4 and inverse positive.', 'At v2,M2, candidate masses2,3,6,8 kg give S3,17/5,4,21/5, distinct from11/3; mass4 gives11/3.', 'Negative root−1 m/s makes coupled mass negative and lies outside assumed incident-right motion;zero gives no positive V. Using m independent of v loses the quadratic constraint.']
ASSUMPTIONS=['Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v. M remains fixed across scaling trials; both new masses stay positive.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v. Equal-weight averages of distinct outcomes, not replacing inputs by means.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v. Continuous dimensionless zero-offset display;decoded V must remain below incident v.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v. Two distinct final speeds identify gain and offset.', 'Inertial laboratory; two positive constant masses, target M=2 kg initially at rest in that laboratory, incident mass m moving +x at v>0. Perfectly inelastic sticking gives a common final velocity. External impulse and work neglected during collision; kinetic loss appears internally. V is positive with0<V<v. Coupling m=c v relates different constant-mass trials;positive mass and speed exclude negative algebraic root.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'kg', 6: 'meter/second', 7: 'dimensionless', 8: 'meter/second', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'meter/second'}
NUMERIC_UNITS={1: 'm/s', 5: 'kg', 6: 'm/s', 13: '1', 14: 'kg', 16: 'm/s'}
OPTION_SUFFIX={8: ' m/s', 12: ' m/s', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M160 190H260', 'M290 570H340'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M160 190H260', 'M290 570H340'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(180, 935, 160, 35), (180, 1030, 80, 35)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Initial2 m/s100 px and final1 m/s50 px use common50 px/(m/s). Masses2 kg each shown before and after sticking; total p4 kg·m/s. Energy bars4 J160 px and2 J80 px at40 px/J; external work excluded and internal gain2 J explicit. Body geometry schematic, dimensional velocity/energy scales distinct.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-inelastic-rest-{n:02}"
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
      "title":"Perfectly inelastic collision against a laboratory-rest target","reference":"First solve signed two-body momentum conservation and positive inverse; external work also excluded to justify kinetic-to-internal conversion, not kinetic conservation."}}



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
