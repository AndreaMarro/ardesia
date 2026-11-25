"""Independent source-prompt-first review of steady network and energy balances.
No candidate authoring imports. Frozen signatures apply only to individually read editions.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json"
CANDIDATE_REF='c412ae723a1cbf7bbcdfab724bd06b1d5e8e3992'
REVIEWED_PACKAGE_SHA256='cb15df122e6cf27e76cc7f23f0e81520ecee67f74d1c44b866a33317f8d776c5'
REVIEWED_BINDINGS_SHA256='fa96462e930b923fad354d0c894cf542ff583c6b9284747579bb4677c7a5258b'
BATCH='hydraulic-power-098'
ASSET_NAME='hydraulic-power-steps.svg'
FALSE_PROOF='La potenza della pompa è la somma del salto di pressione e della portata, perché entrambi contribuiscono all’energia trasferita.'
SVG_MUTATION=(b'M100 1470L400 1170', b'M100 1470L400 1320')
EXPECTED_SKILL='C2-L006'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L006']
EXPECTED_IDS={f"AR-u3-hydraulic-power-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-hydraulic-power-01": "9bcd869972fb68a81a893ec2fb46fa75b80ae1cc0f54bf40ce409435a1239c4e",
    "AR-u3-hydraulic-power-02": "8f0745efc93991b4e9d8b2ce24a31899453430b84016b5f4c8d063a42efca666",
    "AR-u3-hydraulic-power-03": "8247f52adb6d1900231795b23433b31005ecf89245ff0d268a8f215cf182553a",
    "AR-u3-hydraulic-power-04": "ed91427566cfaab4b12015d89864cf9cf2e52c548c689bfd07f69d5a414e457f",
    "AR-u3-hydraulic-power-05": "0212cb72062097dd0291e9aa022e565682ddbadf7833a98e172b018e21af6c64",
    "AR-u3-hydraulic-power-06": "4e731f154fe650e8240b927642746b992d12eb11a9c73f3c7869649f01c4118b",
    "AR-u3-hydraulic-power-07": "9a90ae05a4365c10d69c80f6d94eea47f939f5c2082997149a791d49700b8fde",
    "AR-u3-hydraulic-power-08": "6a24b2bd7b229cfcd22df330606c839a5ad78e47e2423941cc98a0acdd46f8e6",
    "AR-u3-hydraulic-power-09": "668e797a199c4277d9a9ddedfe4f9fcb43d374e3fbb7c5287a8f7bc2ed64cabb",
    "AR-u3-hydraulic-power-10": "139210528b673abc1e02ba173cd7907bf46e55c85919e1cd4141fbc758559bc5",
    "AR-u3-hydraulic-power-11": "d72a73d3a68f58a3bc5f2af47bb6acce6e0740d28d70e2982d66eb8ff05e29cf",
    "AR-u3-hydraulic-power-12": "c562d47907df76405db17793310fba94ef57af4cd0c80ff2e696184b386a13bc",
    "AR-u3-hydraulic-power-13": "ad0acfb92bd5abfba03d9976b5b2989d238f8b080377b77a81305f112996e433",
    "AR-u3-hydraulic-power-14": "f3a62f0d4a2aa8b909102199fbe552d0626360524ab9ddf1e20c6f109223b784",
    "AR-u3-hydraulic-power-15": "d4d307ce21a4571f9ea64f1ccfcf729ad5e505eae1c1a9a29eb7a71590002f5e",
    "AR-u3-hydraulic-power-16": "696398766d175ef8022dd7b21152c7ddd225359b401648b8287043797c842853"
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

def physical_power(pressure_increase,flow):
    pressure_increase,flow=map(Fraction,(pressure_increase,flow))
    if min(pressure_increase,flow)<=0:raise ValueError("Positive pump pressure increase and positive flow required")
    return pressure_increase*flow

def oracle():
    dp,Q,P,c,a,b=sp.symbols("dp Q P c a b",positive=True)
    V,t=sp.symbols("V t",positive=True);law=sp.cancel(dp*V/t).subs(V,Q*t)
    inv=sp.solve(sp.Eq(P,law),dp)[0];flow=sp.solve(sp.Eq(P,law),Q)[0]
    assert sp.cancel(law.subs({dp:a*dp,Q:b*Q},simultaneous=True)/law)==a*b
    first=law.subs({dp:2,Q:3});second=law.subs({dp:4,Q:5})
    assert (SI.Quantity(2,"kilopascal")*SI.Quantity(3,"liter/second")).to("watt").magnitude==6
    mean=(first+second)/2;assert mean-law.subs({dp:3,Q:4})==1
    q,z,decoded,affine=calibrate(first,second,18,60,13,41,25,"watt");assert(q,z,decoded,affine)==(3,1,20,12)
    x=sp.symbols("x",real=True);roots=sp.solve(sp.Eq(sp.Rational(2,3)*x**2,6),x);assert roots==[-3,3]
    assert (SI.Quantity(6,"watt")/SI.Quantity(Fraction(2,3),"kilopascal*second/liter")).to("liter**2/second**2").magnitude==9
    return [first,"W","P = Δp Q","Da 6 a 12 W",inv.subs({P:6,Q:3}),flow.subs({P:6,dp:2}),sp.Rational(5,3),12-first,"Δp = P / Q","κ₁ κ₂",second/first,mean,flow.subs({P:20,dp:4})/3,inv.subs({P:decoded,Q:5}),inv.subs({P:affine,Q:3}),next(r for r in roots if r>0)]

MANUAL=['Pressure work per volume is 2 kPa. At 3 L/s this transfers 6 kPa·L/s = 6 W to the fluid.', '1 kPa·L/s = (1000 Pa)(10⁻³ m³/s) = 1 Pa·m³/s = 1 W exactly.', 'dW = Δp dV, so dividing by dt gives P = Δp Q. Ideal mechanical input equals transferred fluid power under the assigned efficiency.', 'At Q = 3 L/s, changing Δp from 2 to 4 kPa makes P change from 6 to 12 W.', 'Pressure increase is P/Q = 6 W/(3 L/s) = 2 kPa.', 'Flow is P/Δp = 6 W/(2 kPa) = 3 L/s.', 'At Δp = 2 kPa, Q = 5 gives P = 10 W; compared to 6 W this is 5/3.', 'Proposal minus correct is 12 − 6 = +6 W, distinct from the pressure rise.', 'Dividing P = Δp Q by positive Q isolates Δp = P/Q, with W/(L/s) giving kPa.', 'Both positive direct factors scale power: P_B/P_A = κ₁ κ₂.', 'With Δp = 4 kPa and Q = 5 L/s, P_B = 20 W; B/A = 20/6 = 10/3.', 'The equal statistical mean is (6 + 20)/2 = 13 W. Mean inputs 3 kPa and 4 L/s give 12 W, smaller by 1 W.', 'Target 20 W at Δp = 4 kPa requires Q_B = 5 L/s. Relative to the original 3 L/s the ratio is 5/3.', 'Gain 18/(6 W) = 3 W⁻¹. Reading 60 means P = 20 W; Q = 5 L/s then requires Δp = 4 kPa.', 'Gain (41 − 13)/(20 − 6) = 2 W⁻¹ and offset 1. Reading 25 means P = 12 W; Q = 3 L/s requires Δp = 4 kPa.', 'With Δp = c Q and c = 2/3 kPa·s/L, P = c Q². P = 6 W gives Q² = 9 L²/s², roots ±3 L/s. Positive flow selects 3 L/s and Δp = 2 kPa.']
DISTRACTORS=['2 copies pressure increase, 3 copies flow, 5 adds incompatible dimensions and 12 doubles the required product.', 'J is energy, Pa pressure, L/s volume flow and N force; the requested rate is W.', 'The two quotients have pressure-per-flow or inverse-pressure dimensions. Multiplying the correct product by 2 or 1/2 lacks a pressure-work basis; no kinetic half-factor belongs here.', '3 W reverses pressure scaling, unchanged ignores it, 24 W squares the factor and zero violates the positive pressure rise and flow.', 'Multiplying P by Q does not isolate pressure; the reciprocal has inverse pressure units.', 'Multiplying by Δp does not isolate volume flow. Inconsistent Pa/L and kPa/m³ conversions would add a factor thousand.', '3/5 reverses states, 2/3 uses the flow increment instead of remaining flow, 10 is the new power number and 1 ignores increased flow.', '−6 reverses error, 12 copies proposal, zero accepts it and 3 halves the discrepancy.', 'P Q has power times flow rather than pressure, Q/P is inverse pressure, and the extra factors 2 or 1/2 fail the exact pressure-work equation.', 'κ₁/κ₂ reverses flow dependence; its inverse reverses pressure. Sum fails identical-trial check and square repeats a factor.', '3/10 inverts, 2 follows only pressure change and 5/3 follows only flow change. 20 is a power number, not the comparison.', '26 is sum, 13/2 halves twice, 12 belongs to mean inputs and 14 is the output difference rather than the semisum.', '3/5 reverses flow ratio, 10/3 copies the power target, 2 follows only pressure scaling and 5 is the new flow number rather than a ratio.', 'Raw reading 60 is not watts. Decoding first prevents an erroneous pressure rise of 12 kPa.', 'At Q = 3 L/s, pressure increases 2,5,3,8 kPa give readings 13,31,19,49 respectively. Only 4 kPa reconstructs reading 25.', 'Negative root reverses the assigned pump flow and pressure-rise sign, outside the model. 9 is a squared-flow number, not L/s; 6 copies the power.']
ASSUMPTIONS=['Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.', 'Ideal pump transfers mechanical energy to steady incompressible fluid. Positive Δp = p_out − p_in and Q > 0; no height or kinetic energy change, no dissipation, mechanical efficiency 1. This is transferred fluid power and ideal mechanical input, not an unspecified electrical input. Comparisons are separate steady states.']
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'kilopascal', 6: 'liter/second', 7: 'dimensionless', 8: 'watt', 9: 'kilopascal', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'kilopascal', 15: 'kilopascal', 16: 'liter/second'}
NUMERIC_UNITS={1: 'W', 5: 'kPa', 6: 'L/s', 14: 'kPa', 16: 'L/s'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' kPa'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 1470V1110', 'M405 220H525', 'M100 1470H460', 'M75 220H195', 'M100 1470L400 1170'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M75 220H195', 'M405 220H525'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(130, 665, 30, 35), (160, 665, 30, 35), (220, 665, 30, 35), (100, 665, 30, 35), (250, 665, 30, 35), (190, 665, 30, 35)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(350, 1220), (250, 1320)}<=points:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Flow arrows both 120 px at 40 px/(L/s) represent Q = 3 L/s through the schematic pump. Absolute pressures 100 and 102 kPa define Δp = 2 kPa. Six adjacent 30 px energy cells each represent 1 J, giving 6 J in 1 s = 6 W. Graph origin (100,1470), horizontal scale 50 px/(L/s), vertical scale 25 px/W. Line to (400,1170) is P = 2Q; points (250,1320) and (350,1220) give (3,6) and (5,10). Full XML, marker definitions, scales and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-hydraulic-power-{n:02}"
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
            if value!=wanted:errors.append("Independent fluid-flow conceptual key mismatch")
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
          "methods":["source_prompt_only_primary_mass_tracer_or_mechanical_energy_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_admissible_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Ideal mechanical pump power from positive pressure increase and volume flow","reference":"Pressure work on an infinitesimal transported volume is Δp dV. Its rate is Δp Q, with no assigned elevation or kinetic change and explicit unit ideal efficiency."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-03","U2-01")
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
