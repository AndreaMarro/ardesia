"""Separate source-first review of wave propagation, reciprocal ranging and ideal harmonic oscillators.
No candidate authoring imports. Literal signatures freeze only individually read editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
import math
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-01.json"
CANDIDATE_REF='96d39e776f776373c5d620d9f1120da48b7a407c'
REVIEWED_PACKAGE_SHA256='15dc76724a4b7d1738e20188b902740b828a13203b6ddee379e2e0446cf17ea9'
REVIEWED_BINDINGS_SHA256='4e14e9a611cd8fd85cdf040d4db6edf2d3bd4e0c2431643352467c5ff0c28c45'
BATCH='oscillator-period-132'
ASSET_NAME='oscillator-period-progressive.svg'
FALSE_PROOF='Il periodo completo termina già quando t=τ, perché una fase di un radiante rappresenta un ciclo intero.'
SVG_MUTATION=(b'width="60"', b'width="120"')
EXPECTED_SKILL='C5-L01'
EXPECTED_PREREQUISITES=['C1-L005', 'C1-L006', 'C5-L01']
EXPECTED_IDS={f"AR-u4-oscillator-period-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-oscillator-period-01": "3c3636a93fcfedf93d354536411a28b93e8096ea00243af2f903ab8d9bfb5bd8",
    "AR-u4-oscillator-period-02": "001f827f6847ad19a7a9f2ff5f7ef038450ad8e28af6f343b7989d3b1fca3fff",
    "AR-u4-oscillator-period-03": "86dc99b1776c40f4430bc6b49559e1a5e73ae1ef07d53809df5d1aa2145a6f51",
    "AR-u4-oscillator-period-04": "32dd306cc81aff09d456040ea889271148d07b24169b2ba5e0cc80de716a8598",
    "AR-u4-oscillator-period-05": "0ba5f277f043cfbc2b2709f845e0536965d972076d1f6786ba4675b73c5bb76e",
    "AR-u4-oscillator-period-06": "60a483a395fb879f070f2c1c86cca58e73932df2ffec6e8d98d9557f2ea4b412",
    "AR-u4-oscillator-period-07": "fac4fbb004bbb5dd2a5fe09512571e79a5def22e13ed5483c695233cf26b64bf",
    "AR-u4-oscillator-period-08": "c07c63e8f8afc1380a13c2a3efa0b12d2335bc08c064343acce761df5bcf7777",
    "AR-u4-oscillator-period-09": "d58f55e0661d7fda99173ddd0dca4d29b179a2623f6b5c52c693668f6b0babfe",
    "AR-u4-oscillator-period-10": "115f5658f2e67ed974443dea2c1bcb7681832ba3f3c53ae2bfa84b66e23075c4",
    "AR-u4-oscillator-period-11": "57fe4cb2c96752f37477740a149316f4555ea6f32375fd1d2847d374c4fd9b32",
    "AR-u4-oscillator-period-12": "859d2c93d41c6beb733308279bc8b1c31340696aaf4e169fd7cd0d3d09acfe55",
    "AR-u4-oscillator-period-13": "5cc5755e6e2af80a65d6524bd4990b9eee636142010ef630f46c486865a8b16a",
    "AR-u4-oscillator-period-14": "e93fbea7e394fb6b741826363d940a6cf39d0c9ab5bcaedcaf2315605d96e5ca",
    "AR-u4-oscillator-period-15": "1d778425df08f4b4750ea89a57590281f1db55ea49b3368347cb87a9c490a422",
    "AR-u4-oscillator-period-16": "f16260d283aeb41b7ca1e698ed28d384756941a8b76ef744c03d6f587a843f99"
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

def physical_reduced_period(mass,stiffness):
    mass,stiffness=map(Fraction,(mass,stiffness))
    if min(mass,stiffness)<=0:raise ValueError("Positive inertial mass and stable linear stiffness required")
    return sp.sqrt(sp.Rational(mass)/sp.Rational(stiffness))

def oracle():
    m,k,tau,a,b,c=sp.symbols("m k tau a b c",positive=True)
    t=sp.symbols("t",real=True);A=sp.symbols("A",positive=True)
    motion=A*sp.cos(sp.sqrt(k/m)*t)
    assert sp.simplify(m*sp.diff(motion,t,2)+k*motion)==0
    law=sp.sqrt(m/k);inv=sp.solve(sp.Eq(tau**2,m/k),m)[0];spring=sp.solve(sp.Eq(tau**2,m/k),k)[0]
    assert inv==k*tau**2 and spring==m/tau**2
    assert sp.simplify(law.subs({m:a*m,k:b*k},simultaneous=True)/law-sp.sqrt(a/b))==0
    first=physical_reduced_period(1,4);second=physical_reduced_period(4,1)
    quantity=(SI.Quantity(1,"kilogram")/SI.Quantity(4,"newton/meter")).to("second**2");assert quantity.magnitude==Fraction(1,4)
    mean=(first+second)/2;assert mean-physical_reduced_period(Fraction(5,2),Fraction(5,2))==sp.Rational(1,4)
    q,z,decoded,affine=calibrate(first,second,sp.Rational(3,2),6,2,5,7,"second");assert(q,z,decoded,affine)==(3,1,2,3)
    assert sp.simplify(law.subs(m,c*k))==sp.sqrt(c)
    assert physical_reduced_period(2,4)==sp.sqrt(2)/2
    return [first,"s","τ = √(m/k)","Da 1/2 a √2/2 s",inv.subs({k:4,tau:first}),spring.subs({m:1,tau:first}),sp.Integer(2),1-first,"m = k τ²","√(κ₁/κ₂)",second/first,mean,sp.Rational(1,4),inv.subs({k:1,tau:decoded}),inv.subs({k:1,tau:affine}),"Infinite coppie"]

MANUAL=['Mass 1 kg divided by stiffness 4 N/m is 1/4 s². Its positive root is τ=1/2 s; the complete period is T=π s.', 'The pure factor 2π does not change time dimensions. The reduced period retains seconds.', 'Newton gives angular-frequency square k/m. Therefore τ=1/ω=√(m/k), while full period is 2π times τ.', 'Mass 2 kg and stiffness 4 N/m give τ=√(1/2) s=√2/2 s. The exact radical needs no decimal evaluation.', 'Isolate m=kτ². Stiffness 4 kg/s² times (1/2 s)² gives mass 1 kg.', 'Isolate k=m/τ². One kg divided by 1/4 s² gives stiffness 4 N/m.', 'At mass 1 kg and stiffness 1 N/m, τ=1 s. Divide by initial 1/2 s to obtain ratio 2.', 'Proposed 1 s minus correct 1/2 s is +1/2 s. Both terms refer to τ, not full T.', 'Square τ=√(m/k), then multiply by stiffness to obtain m=kτ². The gain in stiffness cancels inverse-time-squared units.', 'Positive factor substitutions give the reduced-period ratio √(κ₁/κ₂). Both the inverse stiffness dependence and the square root remain.', 'Trial B mass 4 kg and stiffness 1 N/m give τ=2 s. Ratio to initial 1/2 s is 4.', 'Output mean (1/2+2)/2 is 5/4 s. Mean inputs both 5/2 in their respective units give τ=1 s, lower by 1/4 s.', 'Target τ=2 s with mass 4 kg requires stiffness 1 N/m. Relative to 4 N/m the stiffness factor is 1/4.', 'Gain (3/2)/(1/2 s)=3 s⁻¹ decodes reading 6 as τ=2 s. Stiffness 1 N/m then gives mass 4 kg.', 'Gain (5−2)/(2−1/2)=2 s⁻¹ and offset 1 decode reading 7 as τ=3 s. Stiffness 1 N/m gives mass 9 kg.', 'Constraint m=(1/4 s²)k fixes τ=1/2 s for every positive stiffness. Measured τ repeats that ratio, so infinitely many continuous positive pairs remain.']
DISTRACTORS=['1/4 s confuses τ² with duration;2 s inverts the mass-to-stiffness ratio. π s is full T, not τ. The negative root is not a physical duration.', 'Hertz is inverse time, seconds squared are pre-root units, stiffness and mass are parameters rather than the requested time.', '2π√(m/k) is full T, √(k/m) angular frequency, m/k time squared and 1/[2π√(m/k)] ordinary frequency. Reduced does not mean dimensionless.', '1 s treats mass linearly rather than its square root;1/4 s reverses monotonicity, unchanged ignores the new mass and 2 s has no valid ratio. √2/2 s is exact without a calculator.', 'kτ has mass/time dimensions. The reduced period is already divided by 2π, so adding that factor again would change the measured quantity.', '1/4 multiplies mass byτ² rather than dividing;2 divides byτ once and yields kg/s. Stable equilibrium requires positive k.', '4 omits the square root;1/2 and 1/4 reverse the effect of reduced stiffness;1 ignores it. Complete periods have the same ratio because 2π cancels.', '−1/2 reverses subtraction,1 repeats proposed duration,3/2 sums and 0 accepts it. T andτ cannot be interchanged during subtraction.', 'kτ, k/τ² andτ²/k respectively have kg/s,kg/s⁴,s⁴/kg.4π²kτ² has the mass dimension but the wrong coefficient.', 'κ₁/κ₂ omits the root, reversed ratio swaps roles of mass and stiffness, and products incorrectly increase period with stiffness.', '2 captures only one of the two changes,16 is the ratio of squared times,1/4 reverses states and 8 is not√16.', '5/2 is sum,3/4 semidifference and 2 only B.1 s is the response at mean inputs, which differs from the mean of the outputs by 1/4 s.', '4 reverses target stiffness change,1/2 loses the time square,1 accounts only for mass and 1/16 omits the increased mass.', '6 is raw display reading and 2 is decoded τ in seconds, not mass. Decode then square; treating τ as T would wrongly introduce 4π².', '3 copies decoded duration,7 raw reading and 4 reference B mass.36 is (S−b)² without dividing byq²; dividing once would instead give 18, not 36. Only author-corrected final prose will be signed.', 'Two examples do not exhaust the continuous positive scale family. Zero is excluded and makes m/k undefined. The measured τ repeats√b and adds no independent scale.']
ASSUMPTIONS=['Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.', 'Horizontal ideal massless spring and constant positive inertial mass, frictionless support, vertical weight and normal balanced. Linear elastic regime around stable equilibrium, no damping or driving. τ is T/(2π), never full T, with positive duration and positive stiffness. Parameters may vary between trials, remain constant during each oscillation. Display readings are continuous dimensionless values.']
UNITS={1: 'second', 2: 'second', 3: 'second', 4: 'second', 5: 'kilogram', 6: 'newton/meter', 7: 'dimensionless', 8: 'second', 9: 'kilogram', 10: 'dimensionless', 11: 'dimensionless', 12: 'second', 13: 'dimensionless', 14: 'kilogram', 15: 'kilogram', 16: 'dimensionless'}
NUMERIC_UNITS={1: 's', 5: 'kg', 6: 'N/m', 14: 'kg'}
OPTION_SUFFIX={7: '', 8: ' s', 11: '', 12: ' s', 13: '', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 925H500M100 915V935M500 915V935', 'M405 215H305', 'M80 800H555', 'M100 890V710'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M405 215H305', 'M80 800H555', 'M100 890V710'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1370, 240, 35), (365, 240, 85, 80), (100, 1250, 60, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")

    plots=[]
    for e in root.iter():
        raw=e.get("d","")
        if raw.startswith("M100.000"):
            pts=[tuple(map(float,p)) for p in re.findall(r"[ML]([0-9.]+) ([0-9.]+)",raw)]
            if len(pts)>20:plots.append(pts)
    specs=[(100, 400, 800, 50, 1)]
    if len(plots)!=len(specs):raise ValueError("Independently reviewed physical scale or graph curve changed")
    for pts,(origin,span,baseline,amp,cycles) in zip(plots,specs):
        if len(pts)!=241:raise ValueError("Independently reviewed physical scale or graph curve changed")
        for j,(x,y) in enumerate(pts):
            # Only drawn coordinates are rounded to three decimal pixels; exact answers never are.
            if abs(x-(origin+span*j/240))>0.00051 or abs(y-(baseline-amp*math.cos(2*math.pi*cycles*j/240)))>0.00051:
                raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'First schematic spring has no force or metric scale and restoring arrow points left for x>0. Phase graph origin(100,800), scale 200/π px/rad and 50 px/cm shows 1 cm cosine from phase 0 to 2π; crest(100,750),trough(300,850),crest(500,750) with zero crossings(200,800),(400,800). Full cycle spans 400 px andT=2πτ, notτ. All 241 XML samples and full native image read. Bars 60 and 240 px at 120 px/s areτ=1/2 and 2 s, ratio 4; corresponding full periodsπ and 4π s share that ratio. Separate effective arrow markers checked in XML.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-oscillator-period-{n:02}"
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
            if value!=wanted:errors.append("Independent wave and oscillator conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These individually read wave and oscillator choices use exact literal unit suffixes.
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
          "methods":["source_prompt_only_primary_shape_advance_reciprocal_path_and_Newton_harmonic_derivatives","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Reduced period from inertial mass and linear restoring force","reference":"Apply Newton to a horizontal ideal linear spring: x″+(k/m)x=0. Derive ω²=k/m and τ=1/ω=T/(2π), keeping full period, reduced period, frequency and positive roots distinct."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U4-01","U2-01")
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
