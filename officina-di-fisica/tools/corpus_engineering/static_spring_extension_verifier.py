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
CANDIDATE_REF='e1ac2d13c30fdbfa71471621b3a131a183a0e512'
REVIEWED_PACKAGE_SHA256='da162eb9d991b6212957cf99984969fee2f21cdf60c39b86b781ffeeae7d2397'
REVIEWED_BINDINGS_SHA256='076f2730508b447c6470e4ed718c29cdafd47908d923408afce35426ee28fc49'
BATCH='static-spring-extension-046'
ASSET_NAME='static-spring-extension-steps.svg'
FALSE_PROOF='Poiché la massa è ferma basta uguagliare mgell a kell²/2 e quindi l’allungamento statico è2mg/k anche senza altre condizioni.'
SVG_MUTATION=(b'M270 740V840', b'M270 740V790')
EXPECTED_IDS={f"AR-u2-static-spring-extension-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-static-spring-extension-01": "bfad0cf368a42ea9225f406941309cceed23d90af70783a0432233a49f7f5cdd",
    "AR-u2-static-spring-extension-02": "23cad89d8cadb81cb92f48611a23aff14974686b77a2c66cb38a5d26a8b5a8e9",
    "AR-u2-static-spring-extension-03": "a5deaee1e9e153f6c140900a894461606a13a9d918f370a2e0e7a0bcaf13cae7",
    "AR-u2-static-spring-extension-04": "79638c1683537d399ea3fac2aa78fad074e4b1ef9979323dad6b04108fa527d1",
    "AR-u2-static-spring-extension-05": "a029755e88ed8f90a7916f3806682f4ae3430205c9f99e0e934c25c115b7dfe3",
    "AR-u2-static-spring-extension-06": "23e68ff6cfcc0bf96ee616df982794696be34e87c8265afad174fbd3c22425c3",
    "AR-u2-static-spring-extension-07": "61bd4b57823b003c79482e23e5d4cdb01aa8a24ff54656a806612047377324c6",
    "AR-u2-static-spring-extension-08": "7e0416819a6b5bddbc22cf1cf5b45465c05db43417f4aaa6d5fb5dea33ce0f06",
    "AR-u2-static-spring-extension-09": "3d731254d7528a0b4ea21aaec0544b91b21b1c1c4ca67646dacfc71df822c1b6",
    "AR-u2-static-spring-extension-10": "165c49eae8ff8c7404553346fdeeaab34fd039d1b98bcf76289522a5ec855f8f",
    "AR-u2-static-spring-extension-11": "785bffc1023da58590c7d477d5e31149c3c9aefee669997f855579775fc72323",
    "AR-u2-static-spring-extension-12": "a950159a0b5c3162d1194fe85a7c76a26dd7c768ae3f9c46caf5c1ed1d257219",
    "AR-u2-static-spring-extension-13": "162058a2c0d8c6516b002c0edbbd50f12f829795faa12142f9eae56e1377d962",
    "AR-u2-static-spring-extension-14": "54fedb34e2f8e0674cf02e288a7a5b3eb749e2539ef7a809e41983c0249c765d",
    "AR-u2-static-spring-extension-15": "e2074fa11cc3c2be402925d623c7d0274dec6a830b0a16e2f506e54b1ae6e563",
    "AR-u2-static-spring-extension-16": "e817b6cdc4c05d289251b103cb3c74306afda519e9bfa25e17ea5b585576b808"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,g,k,l,a,b,q,z,c=sp.symbols("m g k l a b q z c",positive=True)
    law=sp.solve(sp.Eq(m*g-k*l,0),l)[0];assert law==m*g/k
    inv_m=sp.solve(sp.Eq(l,law),m)[0];inv_k=sp.solve(sp.Eq(l,law),k)[0]
    ratio=sp.cancel(law.subs({m:a*m,k:b*k},simultaneous=True)/law);assert ratio==a/b
    first=law.subs({m:2,g:10,k:2});second=law.subs({m:6,g:10,k:4});changed=law.subs({m:2,g:10,k:4})
    measured=(SI.Quantity(2,"kg")*SI.Quantity(10,"meter/second**2")/SI.Quantity(2,"newton/meter")).to("meter")
    assert measured.magnitude==10
    mean_inputs=law.subs({m:4,g:10,k:3});assert mean_inputs==sp.Rational(40,3) and (first+second)/2-mean_inputs==-sp.Rational(5,6)
    gain=(SI.Quantity(30,"")/measured).to("1/meter")
    decoded=(SI.Quantity(45,"")/gain).to("meter").magnitude;assert gain.magnitude==3 and decoded==15
    cal=sp.solve([sp.Eq(q*first+z,21),sp.Eq(q*second+z,31)],(q,z));assert cal=={q:2,z:1}
    affine=(41-cal[z])/cal[q];assert affine==20
    constrained=sp.simplify(law.subs(m,c*k));assert constrained==c*g and not constrained.has(k)
    physical=(SI.Quantity(1,"kg*meter/newton")*SI.Quantity(10,"meter/second**2")).to("meter");assert physical.magnitude==10
    return [first,"m","ℓ=mg/k","Da 10 a 20 m",inv_m.subs({l:10,k:2,g:10}),inv_k.subs({l:10,m:2,g:10}),changed/first,20-first,
      "m=kℓ/g","κ₁ / κ₂",second/first,(first+second)/2,inv_k.subs({l:sp.Rational(3,2)*first,m:6,g:10})/2,
      inv_m.subs({l:sp.Rational(decoded),k:4,g:10}),inv_m.subs({l:affine,k:2,g:10}),"Infinite"]

MANUAL=['Downwards positive: mg−kell=0. Weight2·10=20 N; extension20 N/(2 N/m)=10 m, distinct from total length.', 'Weight in N divided by stiffness in N/m gives metres, dimension L.', 'Static Newton gives mg−kell=0 and ell=mg/k. This is not the turning point after release from natural length.', 'At fixed k=2 N/m, mass2→4 kg doubles weight20→40 N and extension10→20 m.', 'kell=20 N equals mg. Mass20/(10 m/s²)=2 kg.', 'k=mg/ell=20 N/10 m=2 N/m. The reciprocal1/2 m/N is compliance.', 'Same20 N weight and k2→4 N/m give ell10→5 m, ratio1/2.', 'Proposed minus correct:20−10=+10 m.', 'Multiply ell=mg/k by k and divide by g>0: m=kell/g. Force divided by acceleration gives mass.', 'New ell=(a m)g/(b k); dividing by old ell leaves a/b. Equal positive scaling leaves extension unchanged.', 'ell_A=10 m; ell_B=6·10/4=15 m. Ratio15/10=3/2.', 'Mean(10+15)/2=25/2 m. Mean inputs4 kg,3 N/m give40/3 m; difference−5/6 m. Cross products75 and80 prove inequality.', 'Target extension15 m and new weight60 N require k_B=60/15=4 N/m, ratio4/2=2.', 'q=30/(10 m)=3 m^-1. Reading45 gives ell15 m; stiffness4 N/m implies weight60 N and mass6 kg.', 'q=(31−21)/(15−10)=2 m^-1, offset1. Reading41 gives ell20 m and mass2·20/10=4 kg.', 'm=ck with c=1 kg m/N=1 s² gives ell=ckg/k=cg=10 m for every k>0. Pairs(1 kg,1 N/m),(2 kg,2 N/m) are examples of infinitely many positive scales; zero is excluded.']
DISTRACTORS=['2mg/k belongs to a release turning-point problem.20 N is weight, not extension; static balance requires kell=20 N.', 'N force, kg mass, N/m stiffness and1 pure differ from length.', 'mk/g, mgk and k/(mg) lack length dimension;2mg/k does not satisfy the static force balance.', '5 m reverses the mass effect;40 uses the weight number as length; unchanged or zero ignores increased weight.', '20 N is not20 kg. Substituting mass2 kg into mg/k recovers10 m.', 'ell/(mg)=1/2 m/N is compliance. Division by positive extension ensures positive stiffness.', '2 follows stiffness directly;4 squares the factor;1 ignores it; negative half violates positive extensions. Both equilibrium forces still equal20 N.', '−10 reverses subtraction;+20 repeats the proposal;zero accepts it;+5 halves the discrepancy. A20 m configuration is not this static equilibrium.', 'gell/k has wrong mass dimensions; k/(gell) lacks the required length factor; m=mg/k neither isolates m nor matches dimensions; extra2 fails the balance.', 'The product reverses stiffness dependence; the reciprocal reverses comparison; squared mass counts twice; the sum fails the identity trial.', '3 uses mass alone;2 uses stiffness alone in the wrong direction;6 multiplies factors;2/3 reverses the ratio.', '25 is the sum;25/4 divides twice;5 is the difference;40/3 is the distinct mean-input trial.', 'Unchanged stiffness2 would give30 m; tripling stiffness to6 would keep10 m. Only4 N/m gives15 m with60 N weight.', 'Using raw reading45 as metres would give mass18 kg. Remove instrument gain before the physical inverse.', 'At stiffness2 N/m, masses2,3,6,8 kg give readings21,31,61,81. Only4 kg gives41 after offset removal.', 'One,two or three pairs cannot exhaust continuous positive k. None is false since cg=10 m is consistent. The zero pair is excluded because k=0 invalidates the inverse and positive-mass equilibrium.']
ASSUMPTIONS=['Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption. Factors positive;mass andstiffness eachconstantduringindividualtrial.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption. Equalstatisticalweights onoutputextensions;meaninputsdefineanotherquietequilibrium.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption. Continuousdimensionlesszero-offsetdisplay.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption. Distinctextensionsidentifygainandoffsetbeforemassinverse.', 'Inertial laboratory; positive constant mass on ideal massless vertical linear spring with fixed top; exact uniformg10m/s². Observed final rest equilibrium,onlyweight andelasticrestoringforce. Positive extension from natural length,not total length;allconfigurations declared withinideal linear regime. No released-from-natural dynamic turning-point assumption. Couplingm=ck linksdifferenttrialparameters,notmasschangingwithtime. Measuredell=cgaddsnoindependentabsolute-scaleconstraint;allk>0allowed.']
UNITS={1: 'meter', 2: 'meter', 3: 'meter', 4: 'meter', 5: 'kg', 6: 'newton/meter', 7: 'dimensionless', 8: 'meter', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'm', 5: 'kg', 6: 'N/m', 13: '1', 14: 'kg'}
OPTION_SUFFIX={8: ' m', 12: ' m', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M120 160H490M470 160V360M460 160H480M460 360H480', 'M270 740V640', 'M270 740V840'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M270 740V640', 'M270 740V840'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'Natural length40px(2m)fromy120to160;deformedlength240px(12m)to360;extension200px(10m)at20px/m. Separate5px/N scale:20Nweight100pxdownand20Nrestore100pxup. Finalstaticbalance,notaninstantofzerovelocitywithnonzeroacceleration.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-static-spring-extension-{n:02}"
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
      "title":"Vertical spring equilibrium and nonidentifiable mass scale","reference":"Source-only oriented Newton balance before keys; static extension is distinct from dynamic turning point; coupled m=ck eliminates absolute scale."}}



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
