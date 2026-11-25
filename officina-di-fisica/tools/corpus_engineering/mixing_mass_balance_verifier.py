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
CANDIDATE_REF='4768bc8a4552bfc22f3a310662a430171a0c6bd2'
REVIEWED_PACKAGE_SHA256='fc96986e4e20db564445448a1b290029cfba427ff77bc7c80042fa22f28e611c'
REVIEWED_BINDINGS_SHA256='b9f8c83896d125c00eedb675b15fc137fa5c8cd1916bf7ed67434183f2cdf710'
BATCH='mixing-mass-balance-097'
ASSET_NAME='mixing-mass-balance-steps.svg'
FALSE_PROOF='La concentrazione in uscita si trova sommando le due concentrazioni iniziali, perché la massa del tracciante si conserva.'
SVG_MUTATION=(b'width="180"', b'width="120"')
EXPECTED_SKILL='C2-L005'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005']
EXPECTED_IDS={f"AR-u3-mixing-mass-balance-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-mixing-mass-balance-01": "01c73238393a4ff5a1ad45fbcee44b22ae712972b239ff3c5be0f6c1701c0619",
    "AR-u3-mixing-mass-balance-02": "7123500f2f1cb9b270565409bec4ef0744537531df66e8c381e3dfd5041bbf54",
    "AR-u3-mixing-mass-balance-03": "0e1ba51e61b90971b46462602c659675169afcc0f8dea213e2a18d804e4d0dfe",
    "AR-u3-mixing-mass-balance-04": "a8df01101b94076d748f99623b7fc976a9bf6db5af85a80191b8e5827922f959",
    "AR-u3-mixing-mass-balance-05": "e6ea492e73d3ec18e2706bc09041e097c74dc2d8acd64d00aa4a14ca83313806",
    "AR-u3-mixing-mass-balance-06": "0359eec91cabbf150a637de6473a5d76f776d0033cee09f04ad73ea05360391b",
    "AR-u3-mixing-mass-balance-07": "34b8561f1ab71117b5c9cbb342007c4d90d1a8a016bcf55871d9c86f3be63ad2",
    "AR-u3-mixing-mass-balance-08": "41770fed75757d587872d25e2338d44d9c83ead70bc0892a131fce809a1f2d8a",
    "AR-u3-mixing-mass-balance-09": "571eba70a957af7a61c6aeaec5ac751a0d6f461b2d3a1dc36281482a97aa5ba0",
    "AR-u3-mixing-mass-balance-10": "974a259b4238cf7b5c1c17fa45f16685ef301c9e32c30e405f7b62ae0d3956a2",
    "AR-u3-mixing-mass-balance-11": "b8830c0471f174e5abdfae7ee90f637219f9695728f511ed8db502f7b547a710",
    "AR-u3-mixing-mass-balance-12": "8c58065def0cdaa42fdb3c14d67e60d661c7d84cf387806a65c7f97cd24ddf56",
    "AR-u3-mixing-mass-balance-13": "53e34a8b433f2e02ae43c8170492ed6d926e67a4e75233ea08b694955a080d37",
    "AR-u3-mixing-mass-balance-14": "3b06295722319e6d80874101cd56d725c15c221d5085324915c912ae731b3ca7",
    "AR-u3-mixing-mass-balance-15": "f7bf8d372574cc05e875669463862f915133d645afcf02e4edf3ee7bc9736bb3",
    "AR-u3-mixing-mass-balance-16": "0ff1ef724278945f408ab8eff5380fa94af5991bb97cb2d3fd9e0dfc4f4bb3ab"
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

def physical_concentration(first_flow,second_flow,c1=1,c2=3):
    first_flow,second_flow,c1,c2=map(Fraction,(first_flow,second_flow,c1,c2))
    if min(first_flow,second_flow,c1)<=0 or c2<=c1:raise ValueError("Positive rates and ordered positive input concentrations required")
    return (c1*first_flow+c2*second_flow)/(first_flow+second_flow)

def oracle():
    F,G,C,c1,c2,a,b=sp.symbols("F G C c1 c2 a b",positive=True)
    law=sp.solve(sp.Eq(C*(F+G),c1*F+c2*G),C)[0]
    inv=sp.solve(sp.Eq(C,law),F)[0];other=sp.solve(sp.Eq(C,law),G)[0]
    assert sp.cancel(inv-G*(C-c2)/(-C+c1))==0
    assert sp.cancel(law.subs({F:a*F,G:a*G},simultaneous=True)-law)==0
    fixed={c1:1,c2:3};first=law.subs({**fixed,F:1,G:1});second=law.subs({**fixed,F:2,G:3})
    rate=(SI.Quantity(1,"g/liter")*SI.Quantity(1,"liter/second")+SI.Quantity(3,"g/liter")*SI.Quantity(1,"liter/second"))
    assert (rate/SI.Quantity(2,"liter/second")).to("g/liter").magnitude==2
    mean=(first+second)/2;mean_input=law.subs({**fixed,F:sp.Rational(3,2),G:2});assert mean-mean_input==-sp.Rational(3,70)
    q,z,decoded,affine=calibrate(first,second,6,sp.Rational(33,5),5,sp.Rational(27,5),4,"g/liter")
    assert(q,z,decoded,affine)==(3,1,sp.Rational(11,5),sp.Rational(3,2))
    assert sp.cancel(law.subs({**fixed,G:F}))==2
    return [first,"g/L","c = (c₁ Q₁ + c₂ Q₂) / (Q₁ + Q₂)","Da 2 a 3/2 g/L",inv.subs({**fixed,C:2,G:1}),other.subs({**fixed,C:2,F:1}),sp.Rational(5,4),4-first,"Q₁ = Q₂ (c₂ − c) / (c − c₁)","J_B U / (U_B J)",second/first,mean,other.subs({**fixed,C:second,F:2}),inv.subs({**fixed,C:decoded,G:3}),inv.subs({**fixed,C:affine,G:1}),"Infinite"]

MANUAL=['In one second, 1 L at 1 g/L carries 1 g and 1 L at 3 g/L carries 3 g. Four grams in two litres give c = 2 g/L.', 'Tracer mass per mixture volume is g/L. It is not a tracer flow rate in g/s.', 'Tracer balance c(Q₁ + Q₂) = c₁Q₁ + c₂Q₂ combines with assigned volume additivity. Division gives the flow-weighted concentration.', 'Changing Q₁ from 1 to 3 L/s at Q₂ = 1 gives c = (3 + 3)/4 = 3/2 g/L, compared with 2 g/L.', 'Q₁ = Q₂(c₂ − c)/(c − c₁). With c = 2 and Q₂ = 1, both concentration differences equal 1 g/L and Q₁ = 1 L/s.', 'Q₂ = Q₁(c − c₁)/(c₂ − c). The same data give Q₂ = 1 L/s; the target lies strictly between 1 and 3.', 'With Q₁ = 1 and Q₂ = 3, tracer flow is 10 g/s and total volume flow 4 L/s. Concentration 5/2 divided by 2 is 5/4.', 'Proposal 4 minus correct 2 is +2 g/L. The proposal also exceeds the maximum input concentration 3 g/L.', 'Isolating Q₁ gives Q₂(c₂ − c)/(c − c₁). Strict c₁ < c < c₂ makes both differences positive and excludes zero or infinite endpoint cases.', 'Let J be tracer flow and U volume flow. Then c_B/c_A = (J_B/U_B)/(J/U) = J_B U/(U_B J). Common scaling of both inputs cancels.', 'At Q₁ = 2 and Q₂ = 3, c = (2 + 9)/5 = 11/5 g/L. Compared to 2, the ratio is 11/10.', 'The equal statistical mean is (2 + 11/5)/2 = 21/10 g/L. Mean input rates give 15/7, larger by 3/70. Equal-duration pooled fluid would also have the volume-weighted 15/7, a different question.', 'Target concentration is 11/5 g/L. At Q₁ = 2, solving gives Q₂ = 3 L/s; its ratio to the initial 1 is 3.', 'Gain 6/(2 g/L) = 3 L/g. Reading 33/5 gives c = 11/5; with Q₂ = 3, the inverse gives Q₁ = 2 L/s.', 'Gain [(27/5) − 5]/[(11/5) − 2] = 2 L/g and offset 1. Reading 4 gives c = 3/2, requiring Q₁ = 3 L/s at Q₂ = 1.', 'If Q₁ = Q₂ = q > 0, concentration is (1 + 3)/2 = 2 g/L independently of q. For example q = 1 and q = 2 both work, so infinitely many pairs satisfy the redundant measurement.']
DISTRACTORS=['4 adds concentrations without dividing by total volume. 1 or 3 copies an inlet. A simple arithmetic mean happens to work only for these equal rates.', 'g/s is tracer flow, L/s volume flow, g mass and L/g inverse concentration. None is concentration g/L.', 'c₁+c₂ omits volume weighting; an unweighted half-sum works only at equal input rates. Dividing tracer flow by Q₁ alone omits the second volume input, and keeping only c₂Q₂ omits incoming tracer from stream 1.', '3 g/L moves toward the more concentrated stream despite increasing the dilute stream; unchanged ignores the new weight. 6 and zero violate the strict interval between 1 and 3.', 'Reversing either difference can give a negative flow. Copying the target concentration as L/s is dimensionally invalid.', 'An endpoint concentration would require a missing stream or an infinite limiting ratio; both assigned rates are finite positive.', '4/5 is reciprocal, 3 follows only the input-rate factor, 5/2 copies the new concentration number and 1/4 is the relative increase rather than the remaining concentration ratio.', '−2 reverses subtraction, 4 copies the proposal, zero accepts it and 1 halves the discrepancy. A 4 g/L output violates convexity.', 'The reversed concentration differences give the reciprocal flow factor. Q₂c₂/c omits the tracer entering stream 1; Q₂(c₂−c₁)/c is not the rearranged balance. The extra factor 2 fails substitution.', 'κ₁/κ₂ ignores baseline weights, J_B/J omits changed volume rate, U_B/U omits tracer flow and U_BJ/(J_BU) reverses the concentration ratio.', '10/11 inverts, 11/5 is the new concentration number and 3/2 follows only a rate change. 1 ignores reweighting.', '21/5 is sum, 21/20 halves twice, 15/7 belongs to pooled fluid or mean input rates and 1/5 is the difference between outputs, not their mean.', '1/3 reverses the rate ratio, 11/10 copies the concentration target, 2 ignores the required stronger weighting and 3/2 fails the exact mixture equation. Q₂ = 3 reconstructs the target.', 'The display is dimensionless, not g/L. Decoding its dimensionful gain first preserves the strict concentration interval.', 'Candidate Q₁ = 2,4,6,3/2 L/s gives S = 13/3,19/5,25/7,23/5 respectively, not 4. Q₁ = 3 gives exactly 4.', 'One or two pairs would need another independent datum. None is false because every equal positive pair works. Both rates zero is excluded and would make the concentration quotient undefined.']
ASSUMPTIONS=['Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.', 'Steady fully mixed uniform outlet, same assigned bulk density, no leakage, tracer reaction or accumulation. Solution volumes are explicitly additive. Positive Q₁,Q₂, c₁ = 1 g/L and c₂ = 3 g/L imply strict 1 < c < 3 g/L. Tracer conservation is distinct from bulk-fluid conservation; concentration averages use the requested statistical weights.']
UNITS={1: 'gram/liter', 2: 'gram/liter', 3: 'gram/liter', 4: 'gram/liter', 5: 'liter/second', 6: 'liter/second', 7: 'dimensionless', 8: 'gram/liter', 9: 'liter/second', 10: 'dimensionless', 11: 'dimensionless', 12: 'gram/liter', 13: 'dimensionless', 14: 'liter/second', 15: 'liter/second', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'g/L', 5: 'L/s', 6: 'L/s', 14: 'L/s'}
OPTION_SUFFIX={7: '', 8: ' g/L', 11: '', 12: ' g/L', 13: '', 15: ' L/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not set()<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(255, 515, 100, 100), (130, 1120, 120, 28), (95, 140, 100, 100), (90, 1005, 20, 28), (90, 1120, 40, 28), (110, 1005, 180, 28), (375, 140, 100, 100), (155, 515, 100, 100)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(455, 190), (145, 190), (425, 190), (395, 190), (325, 565), (225, 565), (285, 565), (185, 565)}<=points:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Each 100 px square cell represents 1 L and each dot 1 g of tracer. Inputs have one and three dots; the two output cells contain two dots each, conserving four grams in two litres. These are counts, not molecular geometry. New tracer-flow bars 20 + 180 px at 20 px/(g/s) give 1 + 9 = 10 g/s; volume-flow bars 40 + 120 px at 40 px/(L/s) give 1 + 3 = 4 L/s. Thus 10/4 = 5/2 g/L. Full XML, all eight dots and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-mixing-mass-balance-{n:02}"
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
      "title":"Conserved tracer in two fully mixed additive-volume input streams","reference":"Conserve tracer mass flow independently from bulk volume. Divide the total tracer input by the assigned additive total volume rate, and distinguish statistical averaging from pooled-effluent concentration."}}



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
