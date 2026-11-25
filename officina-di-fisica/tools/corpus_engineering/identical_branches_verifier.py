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
CANDIDATE_REF='039e3c328f6a1a4482a5e5b4e8815842fbfb8b3b'
REVIEWED_PACKAGE_SHA256='8660384a9558065017822c4456417d9085957e2c16e2e45a24504e3a4e9640c6'
REVIEWED_BINDINGS_SHA256='e4d268ccf47b265e7eff0840f9f15c3cfafd9925c55689a4f736e7bc008810f0'
BATCH='identical-branches-095'
ASSET_NAME='identical-branches-steps.svg'
FALSE_PROOF='A parità di portata totale, tre rami ricevono più volume ciascuno di due rami, perché il numero di vie disponibili aumenta.'
SVG_MUTATION=(b'M130 755H250', b'M130 755H210')
EXPECTED_SKILL='C2-L005'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005']
EXPECTED_IDS={f"AR-u3-identical-branches-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-identical-branches-01": "6ac66cfab9abdc7e4c0adb6f89f3244e8a1ebe6aa5c15690915f37bc7554b4d1",
    "AR-u3-identical-branches-02": "8f3b5c35c9790e2c9f42dbdb1e8d8e91228dd427b0bee626115c97d2beb39c26",
    "AR-u3-identical-branches-03": "d477dac5d42853c1dd321f7a36e0d0cd5c0498f6588948303b2a4fed650ec3db",
    "AR-u3-identical-branches-04": "70afebd00827990a9b5170baab2a8377d70ca778e601497ce9e0a4b30c7d2b7b",
    "AR-u3-identical-branches-05": "b8f249a7cd31e335e6a8ac5e4e10a1b68cfcc707ec1812bc0a0ca492fb0eefd7",
    "AR-u3-identical-branches-06": "a3be9d9b38bc3c66ccb5f6e3fc872486b7c139197efa89bda803328817d5a348",
    "AR-u3-identical-branches-07": "1d8dfe9b4d39780a638ec35caad2fdb8ba1716c3ed9661b134bc1bd3d7177fb6",
    "AR-u3-identical-branches-08": "511bd0e0d5d94e253c94f18304307c1c32ba6bf42d198cefc137e67d3255c800",
    "AR-u3-identical-branches-09": "748517700522b384f41fdeb50780d1df041b5acdfd45ba199b437593808ec1aa",
    "AR-u3-identical-branches-10": "81ef6ab8c59700e93cc78f362c6ecf6f18707e57801c8c60bdcb603d402d3fd7",
    "AR-u3-identical-branches-11": "86dc87a2983fc4cb0e6622f0b26d341372da7fd1cbc9127c90c33903e720c2bd",
    "AR-u3-identical-branches-12": "8ee1f0a0878ce0c145f9ed4d58e335a65a9156b120b9bdc88bd498577434efad",
    "AR-u3-identical-branches-13": "e5c8ea9ae9c4e35bfc44b5cdfc8fb56347c0d8b3a78519a08512d5090849da0a",
    "AR-u3-identical-branches-14": "ac834ec97be1ffcaa013505e85d1337ae176d793692c84afa22cfe0f2243bdbe",
    "AR-u3-identical-branches-15": "4b25f9ddfe8fd19781476d1d946fe360b4a1322d894cc6966c21329b7b138b03",
    "AR-u3-identical-branches-16": "793f36f3c3721bb1f0774b1786e221abc78638ef1981ad63ecb146ddf2b0b58d"
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

def physical_speed(total,count,area):
    total,count,area=map(Fraction,(total,count,area))
    if min(total,count,area)<=0 or count.denominator!=1:raise ValueError("Positive total, positive integer count and positive area required")
    return total/(count*area)

def oracle():
    Q,N,A,v,c,a,b=sp.symbols("Q N A v c a b",positive=True)
    branch=sp.solve(sp.Eq(N*sp.Symbol("q"),Q),sp.Symbol("q"))[0]
    law=sp.solve(sp.Eq(A*v,branch),v)[0]
    inverse=sp.solve(sp.Eq(v,law),N)[0];area=sp.solve(sp.Eq(v,law),A)[0]
    assert sp.cancel(law.subs({N:a*N,A:b*A},simultaneous=True)/law)==1/(a*b)
    first=law.subs({Q:24,N:2,A:2});second=law.subs({Q:24,N:3,A:3})
    assert (SI.Quantity(24,"cm**3/second")/(2*SI.Quantity(2,"cm**2"))).to("cm/second").magnitude==6
    mean=(first+second)/2;formal=law.subs({Q:24,N:sp.Rational(5,2),A:sp.Rational(5,2)})
    assert mean==sp.Rational(13,3) and formal==sp.Rational(96,25)
    try:physical_speed(24,sp.Rational(5,2),sp.Rational(5,2))
    except ValueError:pass
    else:raise AssertionError("Mean count was silently continuous")
    q,z,decoded,affine=calibrate(first,second,18,8,13,sp.Rational(19,3),9,"cm/second")
    assert(q,z,decoded,affine)==(3,1,sp.Rational(8,3),4)
    roots=sp.solve(sp.Eq(24/(c*A**2),6).subs(c,1),A);assert roots==[2]
    assert sp.solve(sp.Eq(sp.Symbol("x",real=True)**2,4),sp.Symbol("x",real=True))==[-2,2]
    return [first,"cm/s","v = Q_T / (N A)","Da 6 a 4 cm/s",inverse.subs({Q:24,A:2,v:6}),area.subs({Q:24,N:2,v:6}),sp.Rational(2,3),12-first,"N = Q_T / (A v)","1 / (κ₁ κ₂)",second/first,mean,area.subs({Q:24,N:3,v:second})/2,inverse.subs({Q:24,A:3,v:decoded}),inverse.subs({Q:24,A:2,v:affine}),roots[0]]

MANUAL=['Each of two branches receives 24/2 = 12 cm³/s. Dividing by 2 cm² gives the area-mean normal speed 6 cm/s.', 'Volume per time divided by area has dimension length per time: cm³/(s cm²) = cm/s.', 'Conservation gives N q = Q_T. With q = A v and explicitly equal division, v = Q_T/(N A).', 'At A = 2 cm², N = 2 gives 6 cm/s and N = 3 gives 4 cm/s. Both counts are admissible integers.', 'N = Q_T/(A v) = 24/(2·6) = 2. Units cancel and the inferred count is an integer.', 'A = Q_T/(N v) = 24/(2·6) = 2 cm². This is area, not a side length.', 'At N = 2, increasing A from 2 to 3 cm² makes v fall from 6 to 4 cm/s; B/A = 2/3.', 'Proposal minus correct is 12 − 6 = +6 cm/s. The signed error is separate from the positive speed.', 'Dividing the total rate by A v isolates N. A physical inverse must yield a positive integer, not any positive real number.', 'At fixed Q_T, the new product N_B A_B is κ₁ κ₂ times the old product. Hence v_B/v_A = 1/(κ₁ κ₂), with κ₁ N integer.', 'With N = 3 and A = 3 cm², v_B = 24/9 = 8/3 cm/s; dividing by 6 gives 4/9.', 'The statistical mean is (6 + 8/3)/2 = 13/3 cm/s. Mean count 5/2 is not a physical apparatus. The formal extension gives 96/25 cm/s and is explicitly nonphysical.', 'Target speed (4/9)·6 = 8/3 cm/s at N = 3 requires A_B = 3 cm². Area ratio is 3/2.', 'Gain is 18/(6 cm/s) = 3 s/cm. Reading 8 means v = 8/3 cm/s; A = 3 cm² gives N = 3.', 'Gain is [(19/3) − 13]/[(8/3) − 6] = 2 s/cm and offset is 1. Reading 9 gives v = 4 cm/s and N = 3.', 'With N = c A and c = 1 cm⁻², v = Q_T/(c A²). Thus A² = 4 cm⁴; roots are ±2 cm². Positive A = 2 cm² gives the admissible integer N = 2.']
DISTRACTORS=['12 is branch flow as a number, not speed; 24 omits both divisions. A reciprocal reverses the physical dependence.', 'cm³/s is flow, cm² area, s/cm inverse speed and kg/s mass flow. Only cm/s has the requested speed dimension.', 'Q_T/A omits division among N branches; N Q_T/A reverses it. Q_T A/N multiplies by area, and N A/Q_T is inverse speed. None equals Q_T/(N A).', '9 cm/s reverses the 3/2 count factor; unchanged ignores the extra branch; 3 cm/s halves without basis and zero is impossible for positive finite total flow and area.', 'A noninteger positive ratio would not be an allowed count. Ignoring area gives the wrong count and units.', 'Multiplying by N or speed has the wrong area dependence. Copying 6 mistakes speed for area.', '3/2 reverses states; 1/3 is the fractional decrease rather than the remaining fraction; 4/3 uses a spurious numerator and 1 ignores the larger area.', '−6 reverses subtraction, 12 copies proposal, zero endorses it and 3 halves the error.', 'Q_T v/A has dimensions inverse time squared, A v/Q_T is the reciprocal count, Q_T/v is an area and the extra factor 2 doubles the valid count. The inverse must also be an integer.', 'κ₁ κ₂ reverses both inverse dependences, κ₁/κ₂ and κ₂/κ₁ reverse one. 1/κ₂ ignores changed count. Both the old and new count must be integers.', '9/4 reverses states, 2/3 changes only one input, 8/3 is the new speed number and 1 ignores both changes.', '26/3 is sum, 13/6 halves twice, 96/25 belongs only to a formal noninteger-count model and 10/3 differs from the exact semisum 13/3.', '2/3 reverses the area ratio, 4/9 copies the speed target, 3 is the new area number rather than its ratio and 1 would leave the speed too large.', 'Using raw reading as speed loses the dimensionful gain and can produce a noninteger count; the decoded value reconstructs 24 cm³/s.', 'For N = 2,4,6,3/2 at A = 2 cm², the display gives 13,7,5,17 respectively, not 9. The last count is also inadmissible.', 'Negative area is excluded even if its square fits. The root is an area in cm²; taking another square root would seek an unasked length.']
ASSUMPTIONS=['Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.', 'Steady incompressible homogeneous flow with fixed Q_T = 24 cm³/s, no leakage or storage. Equal division is explicitly assigned among N identical branches, not inferred from geometry alone. N is a positive integer, area A > 0, and v is positive area-mean normal speed. Averages are statistical comparisons of separate trials.']
UNITS={1: 'cm/second', 2: 'cm/second', 3: 'cm/second', 4: 'cm/second', 5: 'dimensionless', 6: 'cm**2', 7: 'dimensionless', 8: 'cm/second', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'cm/second', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'cm**2'}
NUMERIC_UNITS={1: 'cm/s', 5: '1', 6: 'cm²', 14: '1', 16: 'cm²'}
OPTION_SUFFIX={7: '', 8: ' cm/s', 11: '', 12: ' cm/s', 13: '', 15: ''}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M130 835H210', 'M90 235H210', 'M405 305H465', 'M405 185H465', 'M130 755H250'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M130 835H210', 'M90 235H210', 'M405 305H465', 'M405 185H465', 'M130 755H250'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(90, 1135, 120, 22), (90, 1520, 80, 20), (90, 1470, 120, 20), (90, 1225, 180, 22), (90, 1420, 180, 20), (90, 1315, 270, 22)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Flow arrows have lengths 120, 60, 60 px at 5 px/(cm³/s), giving 24 = 12 + 12. Speed arrows 120 and 80 px use 20 px/(cm/s), giving 6 and 4. Total-area bars 120, 180, 270 px use 30 px/cm², giving 4, 6, 9. Speed bars 180, 120, 80 px use 30 px/(cm/s), giving 6, 4, 8/3. Connection geometry is explicitly schematic. Each arrow has its own path with an effective inherited marker. Full XML and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-identical-branches-{n:02}"
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
      "title":"Fixed total flow divided among an integer count of equal branches","reference":"Conserve volume at steady constant density, apply the assigned equal division, then divide branch flow by its area. Preserve the positive integer branch count in inverses and scaling."}}



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
