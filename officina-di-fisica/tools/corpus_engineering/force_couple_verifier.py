"""Independent source-prompt-first physical review, no candidate authoring imports.
Exact edition signatures frozen only after every record and final SVG were read.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json"
CANDIDATE_REF='39fe6d280266b5fcedf4c94040207e910c839e6c'
REVIEWED_PACKAGE_SHA256='4eed2a8389edee7f34d3bfbdaa74bc3988e838a4f7520127fe7dfb737883a602'
REVIEWED_BINDINGS_SHA256='31c1e1bcfc4ded1ee548bda8f8a4597a26f20725509e03df94e3aebc8f29cfd4'
BATCH='force-couple-065'
ASSET_NAME='force-couple-steps.svg'
FALSE_PROOF='Poiché le due forze si annullano, anche il momento totale deve essere nullo per qualunque distanza tra le rette.'
SVG_MUTATION=(b'M160 250V310', b'M160 250V280')
EXPECTED_IDS={f"AR-u2-force-couple-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-force-couple-01": "365dbf68bd5499bdad4d0eb429a47f4c78502da5d4236d92e50d741f1ebcd9d2",
    "AR-u2-force-couple-02": "a8f8a7f63b91d807b4e74fa89959f4861f96f2ec7c3329f92b50c37ce749d357",
    "AR-u2-force-couple-03": "281916004636afa97cb2f35bf40bf2ab48a56832fd021d30b310dbc2a33ce73c",
    "AR-u2-force-couple-04": "6d38ca36a77682f0d91ab9502db10caa8fa1022a0599fd2165561f3fd1b62290",
    "AR-u2-force-couple-05": "196e2a3a90ae013efb53afe20acf18cd8689da6342af35a4c6bfdb015d832d1a",
    "AR-u2-force-couple-06": "67e656bff4ed16c75b418bb1791420b15dc1bdead49f39c427712e3ed9b0f4df",
    "AR-u2-force-couple-07": "2f3988adefd9887f1a2937e51431cd425162a5446fa74ab8b0a72f93b544d89c",
    "AR-u2-force-couple-08": "4c796d05d225def66414f5cb4f4c9fc51b22f4062e9f47ef715433d5aa447985",
    "AR-u2-force-couple-09": "8f1e97d2bf42c22fd7f6a550364446e4c5a380495315bcfacc4051fff7176508",
    "AR-u2-force-couple-10": "7abfe448f65bf4f045b0f1080c5d60248e3abc64c9fdff0647101f91c35b19f2",
    "AR-u2-force-couple-11": "1c37f1bf7cdea2c55ef57dd92ae9347ef3b2d1a5f88e33b89b9cf9ecffa0f532",
    "AR-u2-force-couple-12": "872935a30c095190e9027c8347b63854363a4c85be1aa476078933b3675e5988",
    "AR-u2-force-couple-13": "e9e531dffe35ee549858b87ce76b1c86957a6e612538f356f5c29bfd584abf78",
    "AR-u2-force-couple-14": "406a1c4c116fb9179da90d33cdb37a731c9e3fd0198a6b685a6853e951c3f536",
    "AR-u2-force-couple-15": "17849d216558bdef77f902a8a2220ba395aa532c1ace26a329fbd85a17d8886e",
    "AR-u2-force-couple-16": "1351418e0b1c9139313cbb4c6b3fd6f86863d7cbd9653dba53d691de2bb2f96b"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

# Only exact, individually read literal radicals are recognized beyond rationals.
# This is not an evaluator for arbitrary candidate prose or symbolic formulas.
EXACT_LITERALS={"√2/4":sp.sqrt(2)/4,"√2/2":sp.sqrt(2)/2,"2√2":2*sp.sqrt(2),
 "(4+√2)/4":(4+sp.sqrt(2))/4,"(4+√2)/2":(4+sp.sqrt(2))/2,
 "(4+√2)/8":(4+sp.sqrt(2))/8,"√(5/3)":sp.sqrt(sp.Rational(5,3))}
def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    if raw in EXACT_LITERALS:return EXACT_LITERALS[raw]
    return sp.Rational(raw)

def oracle():
    F,d,M,c,a,b,q,z=sp.symbols("F d M c a b q z",positive=True)
    x,y=sp.symbols("x y",real=True)
    left=sp.Matrix([-d/2-x,-y,0]);right=sp.Matrix([d/2-x,-y,0])
    fl=sp.Matrix([0,-F,0]);fr=sp.Matrix([0,F,0]);assert fl+fr==sp.zeros(3,1)
    torque=sp.simplify(left.cross(fl)+right.cross(fr));assert torque==sp.Matrix([0,0,F*d])
    law=torque[2];assert not law.has(x,y)
    invF=sp.solve(sp.Eq(M,law),F)[0];invD=sp.solve(sp.Eq(M,law),d)[0]
    ratio=sp.cancel(law.subs({F:a*F,d:b*d},simultaneous=True)/law);assert ratio==a*b
    first=law.subs({F:2,d:2});second=law.subs({F:4,d:4})
    Q=(SI.Quantity(2,"newton")*SI.Quantity(2,"meter")).to("newton*meter");assert Q.magnitude==4
    gain=(SI.Quantity(12,"")/Q).to("1/(newton*meter)");decoded=(SI.Quantity(48,"")/gain).to("newton*meter").magnitude
    assert gain.magnitude==3 and decoded==16
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,33)],(q,z));assert cal=={q:2,z:1}
    affine=(17-cal[z])/cal[q];assert affine==8
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq(c*real**2,4).subs(c,1),real);assert roots==[-2,2]
    square=(SI.Quantity(4,"newton*meter")/SI.Quantity(1,"newton/meter")).to("meter**2");assert square.magnitude==4
    return [first,"N·m","0 N; 10 N·m","Da 4 a 8 N·m",invF.subs({M:4,d:2}),invD.subs({M:4,F:2}),2,8-first,
      "F=M/d","κ₁ κ₂",second/first,(first+second)/2,invD.subs({M:4*first,F:4})/2,
      invF.subs({M:sp.Rational(decoded),d:4}),invF.subs({M:affine,d:2}),next(r for r in roots if r>0)]

MANUAL=['About the first force line only the other contributes: M=Fd=2 N·2 m=4 N·m. About midpoint each gives2 N·m with same CCW sign.', 'Force×distance has dimensions ML²/T², N·m. Same dimension as joule does not make torque equal work; no duplicate J option is offered.', 'Opposite5 N forces sum0 N, but torque modulus5·2=10 N·m. Both act on same rigid body, not action/reaction on two bodies.', 'Each force2→4 N at separation2 m gives torque4→8 N·m, resultant remainszero.', 'F=M/d=4 N·m/(2 m)=2 N for each force, not resultant.', 'd=M/F=4 N·m/(2 N)=2 m perpendicular between lines.', 'M_A4,M_B8 N·m; ratio2 when d2→4 m at fixedF2.', 'Proposed8−correct4=+4 N·m. Using full d for both forces double-counts lever arms.', 'F=M/d, d>0; N·m/m=N. Md instead has N·m².', 'M_B=(aF)(bd)=a b M_A. Both forces scaled equally within each trial to retain resultantzero.', 'M_A4,M_B16 N·m; ratio4.', 'Mean(4+16)/2=10 N·m; meaninputs3 N,3 m give9 N·m, distinct thirdtrial.', 'Target16 N·m at F4 N givesd4 m; d_B/d_A=4/2=2.', 'q=12/(4 N·m)=3(N·m)^−1; S48→M16 N·m;d4 m→F4 N.', 'q=(33−9)/(16−4)=2(N·m)^−1,z1;S17→M8 N·m;d2→F4 N.', 'F=c d,c1 N/m across configurations givesM=c d². d²4 m²; roots±2 m, onlypositive2 allowed;F2 N. No Hooke energyhalf belongs to torque.']
DISTRACTORS=['2Fd counts whole separation twice;zero conflates resultant and moment. Translation of origin changes torque by −a×sumF=0.', 'N force,N/m stiffness,kg mass,m distance. N·m correct; no angular displacement given to define work.', 'Zero moment ignores separation;10 N adds magnitudes instead of vectors;5 N ignores one force;20 N·m doubles full separation.', '16 N·m changes separation as well;2 assigns inverseforceeffect;unchanged/zero ignores stronger couple.', '1 N halves the required each-force modulus;4 copies torque number;Md dimensions notforce.', '1 m divides by sum of magnitudes,not F;4 copies moment;coincident lineszero cannot giveM4.', '1/2 reverses;4 squares geometricfactor;1 treats resultant invariance as torque invariance;negative compares signed quantities instead of moduli.', '−4 reverses subtraction;8 repeats proposal;2 halveserror;midpoint leverarms d/2 each addtoFd.', 'Md has N·m²,d/M inverseforce;extra2 orhalf fail Fd=M.', 'Quotients reverse one directdependence;sumfailsidentity; b² introduces nonexistentlengthsquare.', '2 followsonechange;8 adds a spuriousfactor;16 isnew momentnumberwithunit,not purecomparison;1/4inverse.', '20 sum;5 dividesagain;9 mean-inputproduct;11 notsemisum. Separate trials do not specify simultaneoussignedsum.', 'Fixed d givesonlymoment8;quadrupled d at doubledF gives32;newd4m differs from pure ratio2.', 'Rawdisplay48asSI torque yieldsF12N;gain mustberemovedbefore inverse.', 'At d2 m,forces2,3,5,8 N giveS9,13,21,33;only4 N yields17. Offsetnotremovedbyrawratios.', 'Negative d invalidandnegativecoupledmodulusF;1m gives1Nm,3m9Nm,4confusessquarewithlength. Constraintbetweenconfigurationsnotwork integral.']
ASSUMPTIONS=['One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.', 'One rigid body, two equal positive parallel forces on distinct lines, opposite directions, separation d>0 measured perpendicularly. Both forces act on same body; sumF=0 but torque nonzero. No other forces/couples assigned. Inertial reference; torque modulus M positive and signedCCW example explicitly distinct. Origin translation does not alter couple torque.']
UNITS={1: 'newton*meter', 2: 'newton*meter', 3: 'newton*meter', 4: 'newton*meter', 5: 'newton', 6: 'meter', 7: 'dimensionless', 8: 'newton*meter', 9: 'newton', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton*meter', 13: 'dimensionless', 14: 'newton', 15: 'newton', 16: 'meter'}
NUMERIC_UNITS={1: 'N·m', 5: 'N', 6: 'm', 8: 'N·m', 11: '1', 12: 'N·m', 13: '1', 14: 'N', 16: 'm'}
OPTION_SUFFIX={7: '', 15: ' N'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M160 1300V1450', 'M360 1300V1150', 'M160 250V310', 'M160 770H360', 'M160 770V830', 'M160 1300H360', 'M360 770V710', 'M160 250H360', 'M360 250V190'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M160 1300V1450', 'M360 1300V1150', 'M160 250V310', 'M160 770V830', 'M360 770V710', 'M360 250V190'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    return 'Separation200 px=2 m at100 px/m in all three panels. Forces2 N60 px oppositevertical and5 N150 px atshared30 px/N. Midpoint100 px=1 m fromleftpole; signedtorques2+2=4 N·m. Final5 Ncase gives10 N·m. Allsixforces now separate paths with marker-end, finalXMLandrender reread; forceandlengthscalesdistinct.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-force-couple-{n:02}"
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
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
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
                    literals.append(parse_literal(raw))
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
          "methods":["source_prompt_only_primary_vector_Newton_gravity_or_work_derivation","SymPy_exact_vector_or_constitutive_equation_inverse_scaling_calibration_and_physical_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Force couple: zero resultant and origin-independent torque","reference":"Before candidate keys sum two opposite force vectors and their signed cross products about an arbitrary translated origin; torque and resultant are distinct balances."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-06","U2-01")
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
