"""Independent source-prompt-first hydrostatic review; no candidate authoring imports.
Literal edition signatures frozen only after every source/candidate and final SVG were read.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json"
CANDIDATE_REF='5f8a59700c4fb0fd27fe14951b4816965e297fde'
REVIEWED_PACKAGE_SHA256='8ea68ab594c9506caebe801ff2289a607608086b349c309941c68ef7fd260012'
REVIEWED_BINDINGS_SHA256='938aabeee56727d69c381cb3c2de47d7c54a9afe572bc3a95cb3377faa76afaa'
BATCH='pressure-area-074'
ASSET_NAME='pressure-area-steps.svg'
EXPECTED_SKILL='C2-L001'
EXPECTED_PREREQUISITES=['C2-L001']
FALSE_PROOF='A forza normale invariata, raddoppiare l’area raddoppia la pressione perché entrambe sono grandezze estensive.'
SVG_MUTATION=(b'M160 650V690', b'M160 650V670')
EXPECTED_IDS={f"AR-u3-pressure-area-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-pressure-area-01": "e4bb0467ff758bd5a2d6b11430cac0cab419c1123fd5ef15bfdea11e13b71276",
    "AR-u3-pressure-area-02": "34a93aedd70768bb059f9947cf2b6d109454028653423b3470771710a0bf540e",
    "AR-u3-pressure-area-03": "afa24bcac63bfe62c282f5386c5ee2117a4e2d92eedfe2b0af8e7e864729c5bb",
    "AR-u3-pressure-area-04": "a1fdce51ab5e14693f219a0ed22a11afe4c08fc097136d89ffbc3764b49fb6e5",
    "AR-u3-pressure-area-05": "6cc5763a8c25d7a3595b8bba41c8d2799fc8f3486db7080214857cb5a01704bd",
    "AR-u3-pressure-area-06": "86765e861eb9f23ffe9098984be7aed5ec4e9d8774428ce6ebafb75f8f3122b7",
    "AR-u3-pressure-area-07": "845242eb4857318b474d13704715518fdc1194fb40c2842478a2673942b8f45d",
    "AR-u3-pressure-area-08": "291980bdc44f766ffc5460b94f1872fee1fd49cf7ba83e688769b9ce9b9faa21",
    "AR-u3-pressure-area-09": "42ce9e2be421ebb7f1c8b9a4f6acb6a511e8907587c7549d435dc1be8271e945",
    "AR-u3-pressure-area-10": "ecf1156bf6a2edbe63b530a13d33868cad0afb54ef990f3f863b50a03cdb4400",
    "AR-u3-pressure-area-11": "c69f900ff9049390f47d0be93d13ac46cd93987578057642f690bb08f62fff1b",
    "AR-u3-pressure-area-12": "cbb631998792f26075f41a431ee44c94cc66d9546ab7cb4fdc9c6831c0a0b7ea",
    "AR-u3-pressure-area-13": "3843f41081a945415e26bd4094e9fea3907a3c54173ef2c80f8c9a55c860f83e",
    "AR-u3-pressure-area-14": "ad960222e32977ec5abf7f33cb800b1927aa28a0670cf3fec67f5e6ae8cfb869",
    "AR-u3-pressure-area-15": "80660a5966c6dc224f77ddb3d11e6de085dafae47c08095ae483f8821bc7c222",
    "AR-u3-pressure-area-16": "8d33da04b2db2b0c8e0e3f88277943d2cae48dcfe2dc9260414b14dfd58e0f54"
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    return sp.Rational(raw)

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    gain=sp.Rational(reference_reading)/first
    decoded=sp.Rational(new_reading)/gain
    affine=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and affine[q]>0 and first!=second
    physical_gain=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert physical_gain.magnitude==Fraction(gain)
    return gain,affine[z],decoded,sp.cancel((third_reading-affine[z])/affine[q])

def physical_pressure(force,area):
    force,area=map(Fraction,(force,area))
    if force<=0 or area<=0:raise ValueError("Positive normal load and area required")
    return force/area

def oracle():
    F,A,p,a,b,c=sp.symbols("F A p a b c",positive=True)
    law=sp.solve(sp.Eq(F,p*A),p)[0];inverse=sp.solve(sp.Eq(p,law),F)[0];area=sp.solve(sp.Eq(p,law),A)[0]
    assert sp.cancel(law.subs({F:a*F,A:b*A},simultaneous=True)/law)==a/b
    first=law.subs({F:12,A:3});second=law.subs({F:20,A:4})
    assert (SI.Quantity(12,"newton")/SI.Quantity(3,"meter**2")).to("pascal").magnitude==4
    mean=(first+second)/2;assert mean-law.subs({F:16,A:sp.Rational(7,2)})==-sp.Rational(1,14)
    q,z,decoded,affine=calibrate(first,second,12,15,9,11,sp.Rational(43,3),"pascal")
    assert (q,z,decoded,affine)==(3,1,5,sp.Rational(20,3))
    assert sp.simplify(law.subs(F,c*A))==c
    return [first,"Pa","La sovrapressione si dimezza","Da 4 a 20/3 Pa",inverse.subs({p:4,A:3}),area.subs({F:12,p:4}),sp.Rational(3,4),8-first,"F=pA","κ₁ / κ₂",second/first,mean,area.subs({F:20,p:5})/3,inverse.subs({p:decoded,A:4}),inverse.subs({p:affine,A:3}),"Infinite"]

MANUAL=['Uniform normal load obeys F=pA. 12 N/(3 m²)=4 Pa; no atmospheric term belongs to this added load.', 'Pa=N/m² from normal force divided by area. It is not the unit of total force.', 'At fixed F>0, p_new=F/(2A)=p/2. Uniform load and positive finite area are required.', 'A=3 m²; F12→20 N gives p4→20/3 Pa exactly, without rounding.', 'F=pA=(4 Pa)(3 m²)=12 N; substituting gives 12/3=4 Pa.', 'A=F/p=12/4=3 m². Both measured load and pressure are positive.', 'p_A=4 Pa; p_B=12/4=3 Pa; p_B/p_A=3/4, pure.', 'Proposal minus correct is 8−4=+4 Pa. Error sign is not the sign of the pressure.', 'F=pA follows multiplication by A>0. Pa·m²=N.', 'p_B/p_A=(κ₁F/(κ₂A))/(F/A)=κ₁/κ₂; both factors positive.', 'p_B=20/4=5 Pa; compared to4 Pa gives5/4.', 'Mean outputs=(4+5)/2=9/2 Pa. Average inputs give16/(7/2)=32/7 Pa, larger by1/14 Pa; no universal interchange of mean and quotient.', 'Target p_B=(5/4)4=5 Pa with F_B20 N gives A_B4 m²; ratio4/3.', 'q=12/(4 Pa)=3 Pa^−1. S15 means p5 Pa; A4 m² gives F20 N.', 'q=(11−9)/(5−4)=2 Pa^−1, z=1. S43/3 gives p=(43/3−1)/2=20/3 Pa; A3 gives F20 N.', 'Across trials F=cA with c4 Pa gives p=c for every A>0. For example A1,F4 and A3,F12 both qualify; infinitely many positive pairs.']
DISTRACTORS=['12 copies force;3 copies area;36 multiplies instead of divides;1/4 is reciprocal pressure number with wrong physical inverse.', 'N is force, N/m linear stiffness, kg mass and m² area. Only Pa has pressure dimension N/m².', 'Doubling pressure reverses inverse-area dependence; doubling total force violates fixedF; unchanged ignores larger area; zero requireszeroF, excluded.', '8 Pa doubles the old pressure although forcefactor is5/3; unchanged4 ignoresnewforce;12/5 applies inversefactor3/5;zerocannotfollowfrompositiveF20,A3.', 'p/A has N/m⁴, F/p returns area; any extra factor fails pA=12 N.', 'F p is not area; p/F inverse area. Candidate area3 alone reconstructs4 Pa.', '4/3 reverses ratio;1/4 is absolute decrease relative to original, not remaining pressure;3 retains pressure unit numerically.', '−4 reverses error subtraction;+8 repeats proposal;0 endorses wrong doubled pressure;+2 halves error.', 'F=p/A would have N/m⁴; A/p reciprocal pressure-volume dimension. No factor2 arises from uniform pressure.', 'κ₁κ₂ turns area into a direct factor;κ₂/κ₁ reversesboth;κ₁²/κ₂ spuriouslysquaresforce;sumfailsidentitywhenbothfactors1.', '4/5 inverse;5/3 changes area incorrectly;3/4 corresponds fixed initial force;5 is output pressure number, not comparison.', '9 is sum;9/4 halves twice;32/7 belongs to mean-input trial;1 is neither requested output average nor pressure difference.', '3/4 reverses area ratio;5/4 is pressure target factor;4 is new area number, not ratio;5/3 ignores increased force.', 'Raw S15 used as pressure would F60 N; gain is dimensionful and must be removed before inversion.', 'F12,16,24,30 at area3 give S9,35/3,17,21; none43/3. Correct F20 gives S43/3 exactly.', 'One solution would require an independent area datum. Zero area excluded; redundant pressure does not constrain the free scale.']
ASSUMPTIONS=['Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.', 'Positive normal compressive additional force F uniformly distributed on positive flat area A. Gauge increment p=F/A, not absolute atmospheric pressure. Different trials may vary F and A; no shear traction or nonuniform local field is inferred.']
UNITS={1: 'pascal', 2: 'pascal', 3: 'pascal', 4: 'pascal', 5: 'newton', 6: 'meter**2', 7: 'dimensionless', 8: 'pascal', 9: 'newton', 10: 'dimensionless', 11: 'dimensionless', 12: 'pascal', 13: 'dimensionless', 14: 'newton', 15: 'newton', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'Pa', 5: 'N', 6: 'm²', 8: 'Pa', 14: 'N'}
OPTION_SUFFIX={7: '', 11: '', 12: ' Pa', 13: '', 15: ' N'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M440 650V690', 'M250 170V270M350 170V270', 'M250 1020V1220M350 1020V1220M150 1120H450', 'M160 650V690', 'M300 650V690'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M440 650V690', 'M160 650V690', 'M300 650V690'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(240, 1420, 80, 35), (240, 1350, 160, 35), (150, 170, 300, 100), (150, 1020, 300, 200)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Shared length scale100 px/m: first loaded rectangle3×1 m gives3 m² and three square1 m² cells; second3×2 m gives6 m² and six cells. Three separate4 N arrows40 px at10 px/N sum12 N. Pressure bars160/80 px at40 px/Pa show4/2 Pa. All labels, grids and arrow markers read in full XML/native rendering.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-pressure-area-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        if row.get("course")!="C2" or row.get("skill")!=EXPECTED_SKILL or row.get("prerequisites")!=EXPECTED_PREREQUISITES or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or lesson mapping mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent hydrostatic conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These reviewed pressure/density choices extend the common unit table.
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
          "methods":["source_prompt_only_primary_normal_force_density_or_hydrostatic_column_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Uniform pressure from normal force and positive area","reference":"Independently integrate uniform normal traction over the loaded area: F=pA. Distinguish added gauge load from absolute pressure and average outputs from a third trial at average inputs."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-01","U2-01")
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
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
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
