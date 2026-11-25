"""Separate source-first review of wave intensity, logarithmic levels and independent versus coherent superposition.
No candidate authoring imports. Literal signatures freeze only individually read editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-02.json"
CANDIDATE_REF='004276f35dccdf6d0577cd0d5aa6171cfc7c6c98'
REVIEWED_PACKAGE_SHA256='54947814247828ec7a72a7cc0764f9d918e5971f4c1bd81da9fb1db3e16d4b17'
REVIEWED_BINDINGS_SHA256='6efd5cbf480e75de85a3afef6ac9b0c623d3cade41f0372a3ce2f935aa9e4332'
BATCH='coherent-constructive-144'
ASSET_NAME='coherent-constructive-progressive.svg'
FALSE_PROOF='Due onde contropropaganti possono essere sostituite da una sola onda progressiva usando sempre I=C(A₁+A₂)² nel punto, senza considerare il flusso netto.'
SVG_MUTATION=(b'M90 1340H150', b'M90 1340H210')
EXPECTED_SKILL='C5-L03'
EXPECTED_PREREQUISITES=['C5-L01', 'C5-L02', 'C5-L03', 'C5-L04']
EXPECTED_IDS={f"AR-u4-coherent-constructive-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-coherent-constructive-01": "fa58af68fef30bbad776d7216cd6236bb3f6d9d84e394fe2a286471c2a09ca29",
    "AR-u4-coherent-constructive-02": "0a90230a2194fff908239d154c1ba16078337857d054ff994ab970249f9d4b04",
    "AR-u4-coherent-constructive-03": "d5a2bc7118b8b37f908d7c37d9b4c383d2b43830f57fb6770c98ef73fbb22794",
    "AR-u4-coherent-constructive-04": "9e5b52c228b32d5979293d2b456e8d18e805ad62af6d0728d4c854ed053ff820",
    "AR-u4-coherent-constructive-05": "f028acf0615cb80258003506c16c6c48b2f772f00852c0a99a3ff572be6233c3",
    "AR-u4-coherent-constructive-06": "19cfa773f47e98b9066cec7e62321a4daf3a27abcd80c1c3d3578c0d45f6a727",
    "AR-u4-coherent-constructive-07": "2bbb784e869b0a56335a096d0f50134638107b0d7d6667403baf3c47efaf5cde",
    "AR-u4-coherent-constructive-08": "408662a485a1c34b4638c035ab780f1e16dc111dd51449857d3bbb90bbedc3c0",
    "AR-u4-coherent-constructive-09": "34a4da412c371623ab10a2ebb9867334c84647ed9cb1253256bb0092b6bbb034",
    "AR-u4-coherent-constructive-10": "78eccea19925ebbba2a53ecee14860f61cad22a111d3c6dbb4d6c3e10cd5d0a1",
    "AR-u4-coherent-constructive-11": "28bf1ca40b25b4957d2a0ebfaacc6eba01ecc67737e435b91d4529aec1b2fad7",
    "AR-u4-coherent-constructive-12": "1db6d4f46b62ce526f8fc62b63b913ed7b79da32902bc428e7f756c7388b7b3c",
    "AR-u4-coherent-constructive-13": "9edb84afd660d8e74af839d7cadac716625b87802e34af96b350a462e4d758ae",
    "AR-u4-coherent-constructive-14": "4d8587b024367450120af191f24a0b9c4471e7eb3bd36600aebfbe935dd289f4",
    "AR-u4-coherent-constructive-15": "c0491d56c588ebd8c3b2dfc148318de5094637f7418ba6ff663b8631bf8e4187",
    "AR-u4-coherent-constructive-16": "d5777018384cdb211e0d6fa5ae99a2182fd67043461ba687fd111848e94d3cad"
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    """Only rational/decimal literals or one bounded pi/radical monomial; no eval."""
    if not isinstance(raw,str) or len(raw)>80:raise ValueError("Bounded exact literal required")
    if re.fullmatch(r"[+-]?(?:[0-9]+(?:/[0-9]+)?|[0-9]+\.[0-9]+)",raw):
        try:value=sp.Rational(raw)
        except (ValueError,TypeError,ZeroDivisionError) as e:raise ValueError("Invalid rational literal") from e
    else:
        match=re.fullmatch(r"([+-]?[0-9]*)(π|√[0-9]{1,4})(?:/([0-9]{1,8}))?",raw)
        if not match:raise ValueError("Outside reviewed literal grammar")
        coefficient,factor,denominator=match.groups()
        coefficient={"":"1","+":"1","-":"-1"}.get(coefficient,coefficient)
        denominator=int(denominator or 1)
        if denominator==0:raise ValueError("Zero literal denominator")
        number=sp.pi if factor=="π" else sp.sqrt(int(factor[1:]))
        value=sp.Rational(coefficient)*number/denominator
    if value.is_finite is not True or value.is_real is not True:raise ValueError("Finite real exact literal required")
    return value

def equivalent_literal(wanted):
    if wanted.has(sp.pi):
        ratio=sp.cancel(wanted/sp.pi)
        if not ratio.is_Rational:raise ValueError("Unexpected pi literal")
        return f"{2*ratio.p}π/{2*ratio.q}"
    ratio=sp.Rational(wanted)
    return f"{2*ratio.p}/{2*ratio.q}"

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    gain=sp.cancel(reference_reading/first)
    decoded=sp.cancel(new_reading/gain)
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and fit[q]>0 and first!=second
    physical_gain=(SI.Quantity(reference_reading,"")/SI.Quantity(first,unit)).to("1/("+unit+")")
    assert sp.simplify(physical_gain.magnitude-gain)==0
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])

def physical_amplitude(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Two positive coherent amplitudes required")
    return first+second

def inverse_first(total,second):
    total,second=map(Fraction,(total,second))
    if second<=0 or total<=second:raise ValueError("Total amplitude strictly above known positive amplitude required")
    return total-second

def phase_flip_ratio(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Two positive coherent amplitudes required")
    return (first-second)**2/(first+second)**2

def opposite_wave_mean_flux(first,second):
    """Normalized mean flux for equal-frequency waves on a string in opposite directions."""
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Positive incoming amplitudes required")
    return first**2-second**2

def oracle():
    A,B,total,a,b,theta=sp.symbols("A B total a b theta",positive=True)
    x=A*sp.cos(theta)+B*sp.cos(theta)
    assert sp.simplify(x-(A+B)*sp.cos(theta))==0
    initial=sp.integrate(x**2,(theta,0,2*sp.pi))/(2*sp.pi)
    final=sp.integrate((A*sp.cos(theta)-B*sp.cos(theta))**2,(theta,0,2*sp.pi))/(2*sp.pi)
    assert sp.cancel(final/initial-(A-B)**2/(A+B)**2)==0
    inv=sp.solve(sp.Eq(total,A+B),A)[0];assert inv==total-B
    assert sp.cancel((a*A+b*B)/(A+B))==(a*A+b*B)/(A+B)
    first=sp.Rational(physical_amplitude(1,2));second=sp.Rational(physical_amplitude(2,3))
    assert (SI.Quantity(1,"millimeter")+SI.Quantity(2,"millimeter")).to("millimeter").magnitude==3
    mean=(first+second)/2;assert mean==physical_amplitude(Fraction(3,2),Fraction(5,2))==4
    q,z,decoded,affine=calibrate(first,second,9,15,7,11,17,"millimeter");assert(q,z,decoded,affine)==(3,1,5,8)
    assert phase_flip_ratio(3,4)==Fraction(1,49)
    assert opposite_wave_mean_flux(1,1)==0 and physical_amplitude(1,1)==2
    return [first,"mm","Raccogliere lo stesso cosφ dalle due coordinate locali","Da 3 a 4 mm",inv.subs({total:3,B:2}),sp.Rational(phase_flip_ratio(3,4)),sp.Rational(2,3),6-first,"A₁ = Aₜ − A₂","V / U",second/first,mean,sp.Rational(3,2),inv.subs({total:decoded,B:3}),inv.subs({total:affine,B:5}),sp.Integer(2)]

MANUAL=['Factor the common cosine: x₁+x₂=(A₁+A₂)cosφ. Positive amplitudes 1 and 2 mm therefore give total amplitude 3 mm, though the instantaneous coordinate changes sign.', 'Sum of displacement amplitudes retains length units mm. Intensity, logarithmic level, area and frequency are different physical quantities.', 'Common stable phase at the same frequency and polarization permits factoring the same cosφ. Frequency equality alone would not establish constructive relative phase.', 'New first amplitude 2 mm plus unchanged second amplitude 2 mm gives total 4 mm, compared with initial 3. Only one component changes.', 'Total 3 mm minus second amplitude 2 mm gives first amplitude 1 mm. Positive inversion requires the total exceed the known positive contribution.', 'The standalone data are amplitudes 3 and 4 mm, not the common base pair. Initially their sum is 7 mm; after phase flip the signed coefficient is −1 mm and its modulus 1 mm. With explicitly codirectional progressive waves and common intensity coefficient, the intensity ratio is 1²/7²=1/49.', 'New positive amplitudes 1 and 1 mm give total 2 mm. Divide by initial total 3 to obtain amplitude ratio 2/3, without squaring it.', 'Proposed total amplitude 6 mm minus correct 3 mm gives signed discrepancy +3 mm.', 'Constructive fixed phase gives inverse A₁=Aₜ−A₂, with strict Aₜ>A₂>0. Without that phase condition the same inverse is not justified.', 'The prompt aliases initial amplitude sum as U and scaled sum as V. Their ratio is V/U. An intensity ratio would require the separate progressive codirectional common-coefficient assumption, not merely a local coordinate sum.', 'Trial B amplitude 2+3=5 mm divided by trial A amplitude 3 mm gives 5/3. Its square 25/9 applies only to the explicitly qualified progressive codirectional common-intensity-coefficient model.', 'Output mean (3+5)/2 is 4 mm. Input means 3/2 and 5/2 mm give the same result because the fixed constructive-phase amplitude sum is linear. This is a mean across trials, not another physical superposition.', 'Target total 5 mm minus new first component 2 mm leaves second component 3 mm. Relative to its original 2 mm the required factor is 3/2.', 'Gain 9/(3 mm)=3 mm⁻¹ decodes display 15 as total amplitude 5 mm. Subtract second component 3 mm to obtain first component 2 mm.', 'Reference totals 3 and 5 mm with readings 7 and 11 give gain 2 mm⁻¹ and offset 1. Reading 17 decodes total 8 mm; subtract known second component 5 mm to recover first component 3 mm.', 'Constraint A₁=A₂/2 makes total three halves of A₂. Measured total 3 mm determines A₂=2 mm and A₁=1 mm uniquely in the positive constructive branch.']
DISTRACTORS=['1 subtracts opposite-phase rather than same-phase contributions, 2 copies the second alone and 6 doubles an already complete sum. √5 adds amplitude squares and is not the common-phase sum.', 'mm² measures area, W/m² mean energy flux, dB a logarithmic ratio and Hz frequency. None is the requested displacement amplitude.', 'Phase π gives an oriented difference, a mean halves without justification, and summing unrelated frequencies does not preserve the same common harmonic factor. Incoherent intensity addition is a different cross-term condition.', '6 doubles both components, 5 adds the whole new first amplitude while retaining its old copy, 3 ignores the change and 2 loses a contribution.', '5 adds instead of subtracting, −1 reverses the subtraction and 3 copies total. No root appears because the unknown amplitude enters linearly.', '1/7 is amplitude ratio before squaring; 49 reverses intensity states, 7 reverses only amplitude ratio and 1 ignores the phase change. Unequal component amplitudes prevent complete cancellation.', '1/2 follows only second component, 3/2 reverses totals, 1 ignores change and 1/3 retains constant first component alone. Squaring the correct amplitude ratio would answer another question.', '−3 reverses subtraction, 6 copies proposal, 9 sums and 0 accepts unjustified doubling. Error is a length rather than an energetic ratio.', 'Adding the second contribution counts it twice, reverse subtraction is negative, quotient is dimensionless and square root of a length is not a length.', 'U/V reverses trials, sum and product of unweighted factors omit initial component weights, and the squared ratio changes from amplitudes to intensities only with the separately stated common progressive-wave coefficient.', '3/5 reverses states, 2 and 3/2 follow single components and 25/9 is a different energetic ratio under the author-corrected additional propagation assumptions.', '8 omits division by two, 2 halves twice and 3 or 5 copies one trial. Equal statistical weights preserve equality of mean sums and sum of means.', '5/3 copies total factor, 5/2 forgets subtracting the known first contribution, 2/3 reverses the second-component ratio and 1 would produce total 4 mm rather than 5.', '12 mixes raw display with physical length before decoding, 5 is the decoded total and gain itself has inverse-length units rather than being an amplitude.', '8 is decoded total, 6 comes from subtracting the component before decoding gain, 7/2 omits offset and 2 copies trial B. Only 3 mm reconstructs display 17.', '1 exchanges first and second components, 3 copies total and 6 drops the existing second-component term from the sum. A root would invert a different nonlinear law.']
ASSUMPTIONS=['Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.', 'Linear local harmonic displacements at the same point, frequency and polarization with stable zero relative phase and positive component amplitudes. Their amplitude sum is not an intensity sum. Phase-flip06 separately specifies codirectional progressive waves and a common positive intensity coefficient. Energy comments10/11 are signed only after the author explicitly qualifies the same additional condition; counterpropagating local sums do not determine net energy flux. Displays are continuous dimensionless readings.']
UNITS={1: 'millimeter', 2: 'millimeter', 3: 'millimeter', 4: 'millimeter', 5: 'millimeter', 6: 'dimensionless', 7: 'dimensionless', 8: 'millimeter', 9: 'millimeter', 10: 'dimensionless', 11: 'dimensionless', 12: 'millimeter', 13: 'dimensionless', 14: 'millimeter', 15: 'millimeter', 16: 'millimeter'}
NUMERIC_UNITS={1: 'mm', 5: 'mm', 14: 'mm', 16: 'mm'}
OPTION_SUFFIX={6: '', 7: '', 8: ' mm', 11: '', 12: ' mm', 13: '', 15: ' mm'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 460H400', 'M90 1230H510', 'M100 355H300', 'M90 1340H150', 'M100 250H200'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not set()<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'First three separate segments start at x100 and measure 100,200,300 px at 100 px/mm, representing positive displacement coefficients 1,2,3 mm at a common positive maximum, not forces. The common cosine factor is written separately. The standalone phase-flip panel starts at x90 and declares a different 60 px/mm scale: segments 420 and60 px represent amplitude moduli 7 and1 mm. The signed coefficient after phase flip is negative, but the segment is its positive modulus. Squaring their ratio gives 1/49 under task06 assumptions. Complete XML and full native image read; all labels, origins, lengths and declared scale changes coherent.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-coherent-constructive-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        if row.get("course")!="C5" or row.get("skill")!=EXPECTED_SKILL or row.get("prerequisites")!=EXPECTED_PREREQUISITES or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or lesson mapping mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent intensity and superposition conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These individually read intensity and amplitude choices use exact literal unit suffixes.
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
          "methods":["source_prompt_only_primary_period_averaged_energy_log_ratio_and_cross_term_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_quantity_ratios_and_normalized_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Coherent same-phase local displacement amplitudes","reference":"Factor the common phase of two signed local harmonic coordinates to obtain the sum of their positive amplitudes. Independently handle the codirectional phase-flip task by comparing squared moduli; local displacement alone does not determine net flux for counterpropagating waves."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U4-02","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
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
                if "physical scale" not in str(e):raise
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
