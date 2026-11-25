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
CANDIDATE_REF='3089d1d58d17bb642a54b33d95ae5aa2b5f219b2'
REVIEWED_PACKAGE_SHA256='0d750c2132817ebb6f9bac07885bb8dc11567836d535fd0c11b648165dda3c44'
REVIEWED_BINDINGS_SHA256='46dfe8c3d2f137d799b2bd9de49f66baf9e38bfc58f6a5b760ce48ecc35de488'
BATCH='junction-balance-096'
ASSET_NAME='junction-balance-steps.svg'
FALSE_PROOF='Con ingresso invariato, aumentare la prima uscita aumenta anche la seconda, poiché entrambe ricevono la portata entrante.'
SVG_MUTATION=(b'M65 245H265', b'M65 245H165')
EXPECTED_SKILL='C2-L005'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005']
EXPECTED_IDS={f"AR-u3-junction-balance-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-junction-balance-01": "d92aac41acc580c18cca05153f141a1a6affd811c04239563cf33fc9d1e3c325",
    "AR-u3-junction-balance-02": "60f29789afd2660db99619d13f3feff3894a73f0db6f26a95bd65236dfe6e477",
    "AR-u3-junction-balance-03": "a70264e352f210a98e4b4810dc8cfae6cb52dd1c1e0b234d1aa3ef4e1febccfb",
    "AR-u3-junction-balance-04": "f49052ea4d98f48ab0a518f13bd640ea3f1f8cca5b3dd07137024768b37b452a",
    "AR-u3-junction-balance-05": "3be30684ecb7631e361e7823eb33fed5e10cd18e3e343944db12ecd66c936122",
    "AR-u3-junction-balance-06": "9cb639c30a8282e7e2d52904707145093a3175a74482fe18df45afea3759a5b8",
    "AR-u3-junction-balance-07": "bf4bf0096f13c18b57b67c7f3844e1c5dc30c6bef2af3025306544cffa018791",
    "AR-u3-junction-balance-08": "04d8bdbffb0024b8bfecac432f1617d75fa05c9b0448b94e7ea50bac5610f163",
    "AR-u3-junction-balance-09": "bb5b11e4617200aed186e1c6c6106621cb81d4210fa4ecf7fe5b0e7f16ab8bc9",
    "AR-u3-junction-balance-10": "f258c80902ee9a6c3728be6374808e2f42a5d16b5784302b16733ccf739fe919",
    "AR-u3-junction-balance-11": "d605dbba46439f4f56c78389f6254cf970987915bc5ae8f45dd8207b40bdc481",
    "AR-u3-junction-balance-12": "d863579572746b0d6ec3d1d0536dacc6dbcd2f392fd3b63dea2a8b8762a1d816",
    "AR-u3-junction-balance-13": "7568dc5f32786548f727da9e4df4e580974f78d9871edab8924a8f1f8d6048f4",
    "AR-u3-junction-balance-14": "97b628ce7b2942c19fab5b4ce11083b7e804feadde06495c5020fcb7869e5425",
    "AR-u3-junction-balance-15": "4207128157ef5a457b52224931f6e29d057277ae8c28e8aa34a390b71f46365d",
    "AR-u3-junction-balance-16": "cd1faade706bcdb42beae955ea03eaff1608e2a42ee7e6f331f11ebb4c0f5740"
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

def physical_outlet(inlet,first):
    inlet,first=map(Fraction,(inlet,first))
    if not inlet>first>0:raise ValueError("One positive inlet must exceed the first positive outlet")
    return inlet-first

def oracle():
    E,F,S,a,b,c=sp.symbols("E F S a b c",positive=True)
    law=sp.solve(sp.Eq(E,F+S),S)[0];inv=sp.solve(sp.Eq(S,law),E)[0];other=sp.solve(sp.Eq(S,law),F)[0]
    assert sp.cancel(law.subs({E:a*E,F:b*F},simultaneous=True)/law)==(a*E-b*F)/(E-F)
    first=law.subs({E:10,F:4});second=law.subs({E:12,F:5});mean=(first+second)/2
    assert mean==law.subs({E:11,F:sp.Rational(9,2)})
    assert (SI.Quantity(10,"liter/second")-SI.Quantity(4,"liter/second")).to("meter**3/second").magnitude==Fraction(3,500)
    q,z,decoded,affine=calibrate(first,second,18,21,13,15,17,"liter/second")
    assert(q,z,decoded,affine)==(3,1,7,8)
    constrained=sp.solve(sp.Eq(law.subs(E,sp.Rational(5,2)*F),6),F)[0];assert constrained==4
    return [first,"L/s","Q₂ = Q_e − Q₁","Da 6 a 8 L/s",inv.subs({F:4,S:6}),other.subs({E:10,S:6}),sp.Rational(5,6),12-first,"Q_e = Q₁ + Q₂","D / U",second/first,mean,other.subs({E:12,S:7})/4,inv.subs({F:5,S:decoded}),inv.subs({F:4,S:affine}),constrained]

MANUAL=['Steady storage is zero: 10 = 4 + Q₂ in L/s, so Q₂ = 6 L/s.', 'Both terms in Q_e − Q₁ are volume rates. Their difference is in L/s, exactly 10⁻³ m³/s per L/s.', 'From Q_e = Q₁ + Q₂, subtract the first outlet. A negative difference would reverse the assigned second flow, outside this domain.', 'At Q₁ = 4 L/s, inlet 10 gives second outlet 6; inlet 12 gives 8 L/s.', 'The inlet is the sum 4 + 6 = 10 L/s. No storage term is assigned.', 'The first outlet is 10 − 6 = 4 L/s, positive and smaller than the inlet.', 'At inlet 10 and first outlet 5, the second is 5 L/s. Its ratio to 6 L/s is 5/6.', 'Proposal minus correct is 12 − 6 = +6 L/s; both rates themselves are positive.', 'Adding the two outgoing rates reconstructs the inlet, Q_e = Q₁ + Q₂.', 'Let U = Q_e − Q₁ and D = κ₁ Q_e − κ₂ Q₁. The ratio is D/U, with U > 0 and D > 0.', 'At inlet 12 and first outlet 5, the second is 7 L/s and B/A = 7/6.', 'The statistical mean is (6 + 7)/2 = 13/2 L/s. The mean inputs 11 and 9/2 give the same 13/2 by linearity of subtraction.', 'Target second outlet is 7 L/s; inlet 12 then leaves Q₁ = 5 L/s. First-outlet ratio is 5/4.', 'Gain is 18/(6 L/s) = 3 s/L. Reading 21 gives Q₂ = 7 L/s; adding Q₁ = 5 gives inlet 12 L/s.', 'Gain (15 − 13)/(7 − 6) = 2 s/L and offset 1. Reading 17 gives Q₂ = 8 L/s; with Q₁ = 4, inlet is 12 L/s.', 'Substitute Q_e = (5/2)Q₁ into the balance: Q₂ = (3/2)Q₁ = 6 L/s. Thus Q₁ = 4 L/s and inlet 10 L/s.']
DISTRACTORS=['14 adds the first outlet to the inlet; 10 copies inlet; 4 copies the first outlet. Only subtraction leaves mass balance zero.', 'L is volume, kg/s mass flow, L²/s squared-volume per time and s/L inverse volume flow. Only L/s is the requested volume rate.', 'Addition and reversed subtraction violate the assigned inlet balance. The quotient is dimensionless and the extra half has no third outlet or storage term to justify it.', '36/5 wrongly scales the second outlet by the inlet factor 6/5 despite fixed first outlet. Unchanged ignores added inlet, 4 reverses the increment and zero requires inlet equal to the first outlet.', 'Subtracting gives 2 rather than supplying both outlets. The sum is the unique inlet under zero storage.', '16 adds when isolating the first outlet; 6 copies the second. Zero would contradict the positive first outlet.', '6/5 is reciprocal; 1/6 is the relative decrease, 5/4 tracks the first outlet rather than the second and 1 ignores the change.', '−6 reverses the requested error; 12 copies the proposal, zero accepts it and 3 halves the discrepancy.', 'Either difference reconstructs an outlet difference rather than the inlet. Product has squared-flow units and half the sum supplies only half the required incoming rate.', 'κ₁/κ₂ and κ₁κ₂ cannot replace a ratio of differences. U/D reverses states; D/Q_e divides by the inlet instead of the original second outlet U.', '6/7 is reciprocal, 6/5 follows only the inlet change, 5/4 follows only the first outlet and 1 ignores the new second outlet.', '13 is sum, 13/4 halves twice, 11/2 and 15/2 miss the exact subtraction 11 − 9/2 = 13/2. Equality with mean inputs follows from linearity here.', '4/5 reverses the first-outlet ratio, 7/6 copies the target of the second outlet, 6/5 follows inlet scaling and 5 is the new first-outlet number rather than a ratio.', 'Raw 21 is a display value, not L/s. Removing its gain before adding the first outlet reconstructs reading 21.', 'Inlets 10,11,13,24 L/s at Q₁ = 4 give readings 13,15,19,41 respectively. Only 12 L/s gives the specified reading 17.', 'Q₁ = 2 would give Q₂ = 3 L/s; 8 would give 12 L/s, not 6. Inverting division would give 9, so the final feedback correctly avoids that old attribution. The coefficient 5/2 exceeds 1 as required.']
ASSUMPTIONS=['Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.', 'Steady same-density incompressible fluid, no leaks, accumulation or other ports. Q_e is positive inlet and Q₁,Q₂ positive outlets; Q_e > Q₁ > 0. Negative algebraic Q₂ is outside the assigned flow directions. Comparisons are separate steady trials.']
UNITS={1: 'liter/second', 2: 'liter/second', 3: 'liter/second', 4: 'liter/second', 5: 'liter/second', 6: 'liter/second', 7: 'dimensionless', 8: 'liter/second', 9: 'liter/second', 10: 'dimensionless', 11: 'dimensionless', 12: 'liter/second', 13: 'dimensionless', 14: 'liter/second', 15: 'liter/second', 16: 'liter/second'}
NUMERIC_UNITS={1: 'L/s', 5: 'L/s', 6: 'L/s', 14: 'L/s', 16: 'L/s'}
OPTION_SUFFIX={7: '', 8: ' L/s', 11: '', 12: ' L/s', 13: '', 15: ' L/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M65 245H265', 'M420 360H540', 'M420 160H500'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M65 245H265', 'M420 360H540', 'M420 160H500'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(170, 765, 120, 30), (90, 710, 200, 30), (90, 765, 80, 30), (90, 1095, 100, 30), (250, 1300, 20, 25), (150, 1300, 20, 25), (90, 1300, 20, 25), (130, 1300, 20, 25), (270, 1300, 20, 25), (190, 1095, 140, 30), (110, 1300, 20, 25), (290, 1300, 20, 25), (190, 1300, 20, 25), (230, 1300, 20, 25), (90, 1040, 240, 30), (210, 1300, 20, 25), (170, 1300, 20, 25), (310, 1300, 20, 25)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Separate flow arrows 200, 80, 120 px at 20 px/(L/s) show 10 = 4 + 6. Stacked bars use the same scale: A widths 200 = 80 + 120, B widths 240 = 100 + 140. The lower strip has twelve 20 px cells, five green and seven red, giving 12 = 5 + 7. Connections are topological rather than metric. Complete XML, markers and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-junction-balance-{n:02}"
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
      "title":"One inlet and two explicitly outgoing steady flow rates","reference":"Apply steady mass conservation to equal-density flow. Preserve the declared inlet and outlet signs and both strict positive outlet domains before inverting or scaling."}}



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
