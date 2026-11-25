"""Separate source-first review of emptying, transport and viscous hydraulic networks.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-04.json"
CANDIDATE_REF='78a16d09cab16082f966be1dfdb8fafec3a43080'
REVIEWED_PACKAGE_SHA256='23967257a87eea1476ab7cff2383923ac34e324ebc1dc0c2ba8ae9a8e5a4f46a'
REVIEWED_BINDINGS_SHA256='40b45db165b1d698866b4a26ceada61dc0bd5d2862a12911143bd58fb0709094'
BATCH='reservoir-emptying-107'
ASSET_NAME='reservoir-emptying-steps.svg'
FALSE_PROOF='Durante lo svuotamento la portata resta uguale a quella iniziale, quindi il tempo totale è esattamente AH diviso la portata iniziale.'
SVG_MUTATION=(b'M110 1520Q260 1770 410 1770', b'M110 1520Q260 1520 410 1770')
EXPECTED_SKILL='C2-L006'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L006']
EXPECTED_IDS={f"AR-u3-reservoir-emptying-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-reservoir-emptying-01": "88406ee9d615eba1d323a571c1506a2e1920f5453992e03ec825e1525963083c",
    "AR-u3-reservoir-emptying-02": "10c550f24ecff0d22f01801f263451c85558e7310cfd2229567608853ef17a13",
    "AR-u3-reservoir-emptying-03": "2c4f5e830b4ef2fcea2f453597ac64264a72e987adf0d68e74115501a802e0e4",
    "AR-u3-reservoir-emptying-04": "549e68652604c0dd763a4c04175bfa7c86cd4f053687b4b578db42ffbc5a8072",
    "AR-u3-reservoir-emptying-05": "4529e6da48aee7c4c99cecebe8d94a81ce56a3438a121ba42c8101d29c166784",
    "AR-u3-reservoir-emptying-06": "3e984aba81578aca8928c7b6d2e354ee62aab44cfe1e364738ca97603e3a3a70",
    "AR-u3-reservoir-emptying-07": "ac7f4c1819a7d37d0b649463354a6c5461e481c979fdee44883e983edb3c3f7a",
    "AR-u3-reservoir-emptying-08": "08d72e3a65245558ff156def52f80f2efed95715a49772f0c5abe2f8f250ccfb",
    "AR-u3-reservoir-emptying-09": "b85527a88f3464915fc0ab4fd20daf53b35bec78d4068b6c00cba8363d184a1f",
    "AR-u3-reservoir-emptying-10": "e5b138d1dc83acc88b59b4472185f1d0b107be38b9b5602cf2020157753e4cf0",
    "AR-u3-reservoir-emptying-11": "9657b19b3a6da049017b8c2a00e018f736ace69936b0cd635aa1c4ef02f0fd4f",
    "AR-u3-reservoir-emptying-12": "bef1c09bb8ead0ce7b4bb951ba917772d3c8426b391169c2639534cf16fd56b2",
    "AR-u3-reservoir-emptying-13": "975f5d7abba5c6d4aebd21d5192c97b800a6dc1a9c1d9028064e6815e9d47ce3",
    "AR-u3-reservoir-emptying-14": "b6cdb8dbd013dc81c118f1913b238b371164b8af37c6ea95b6187521c89ade88",
    "AR-u3-reservoir-emptying-15": "006c2b1a8f3f0e0077b80c506101116cbe5cc04ba6679389e4b22c53b07071e2",
    "AR-u3-reservoir-emptying-16": "3bc7f2864ca1f33e61671e47a84359196c63097f18f2ed17b2fbda33d7cc94b3"
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

def physical_time(ratio,height,g=10):
    ratio,height,g=map(Fraction,(ratio,height,g))
    if ratio<=10 or min(height,g)<=0:raise ValueError("Assigned small-hole ratio above ten, positive height and gravity required")
    return sp.Rational(ratio)*sp.sqrt(2*sp.Rational(height)/sp.Rational(g))

def physical_level(height,fraction_elapsed):
    height,fraction_elapsed=map(Fraction,(height,fraction_elapsed))
    if height<=0 or not 0<=fraction_elapsed<=1:raise ValueError("Positive initial head and elapsed fraction between zero and first emptying required")
    return height*(1-fraction_elapsed)**2

def oracle():
    r,H,g,t,c,a,b=sp.symbols("r H g t c a b",positive=True)
    h=sp.symbols("h",positive=True)
    # Integrate dt = r dh/sqrt(2gh) over declining head, before any candidate key is inspected.
    law=sp.integrate(r/sp.sqrt(2*g*h),(h,0,H))
    assert sp.simplify(law-r*sp.sqrt(2*H/g))==0
    inv=sp.solve(sp.Eq(t,law),r)[0];height=sp.solve(sp.Eq(t,law),H)[0]
    assert sp.simplify(law.subs({r:a*r,H:b*H},simultaneous=True)/law-a*sp.sqrt(b))==0
    first=law.subs({r:100,H:5,g:10});second=law.subs({r:200,H:20,g:10})
    initial_flow_time=r*H/sp.sqrt(2*g*H);assert sp.simplify(law-2*initial_flow_time)==0
    quantity=(SI.Quantity(2*5,"meter")/SI.Quantity(10,"meter/second**2")).to("second**2");assert quantity.magnitude==1
    mean=(first+second)/2;at_mean=law.subs({r:150,H:sp.Rational(25,2),g:10});assert at_mean==75*sp.sqrt(10) and mean**2-at_mean**2==6250
    q,z,decoded,affine=calibrate(first,second,300,1200,201,801,401,"second");assert(q,z,decoded,affine)==(3,1,400,200)
    root=sp.solve(sp.Eq(t**2,2*c**2*H**3/g).subs({t:100,c:20,g:10}),H)[0];assert root==5
    return [first,"s","La portata diminuisce, quindi t_const sottostima il tempo totale","Da 100 a 200 s",inv.subs({t:100,H:5,g:10}),height.subs({t:100,r:100,g:10}),sp.Integer(2),200-first,"r = t √[g / (2H)]","κ₁ √κ₂",second/first,mean,sp.Integer(4),inv.subs({t:decoded,H:20,g:10}),inv.subs({t:affine,H:5,g:10}),root]

MANUAL=['At H = 5 m and g = 10 m/s², 2H/g = 1 s². Its positive root is 1 s and ratio r = 100 gives t = 100 s.', 'r = A/a is pure; H/g has dimension T², so its root has dimension time. The requested unit is s.', 'Independent volume balance gives t = r√(2H/g). Initial-volume over initial-rate is rH/√(2gH) = t/2. Declining head makes the initial-rate estimate too short; this candidate diagnostic is derived after reading its new wording, not assumed from its key.', 'Keeping H = 5 m fixes the root at 1 s. Doubling r from 100 to 200 doubles t from 100 to 200 s.', 'r = t/√(2H/g) = 100 s/(1 s) = 100, dimensionless and above 10.', 'H = (g/2)(t/r)² = (5 m/s²)(1 s²) = 5 m, the initial head rather than a mean level.', 'At fixed r, H grows by factor 4. Its square root grows by factor 2, giving t_B/t_A = 2.', 'Proposal minus correct is 200 s − 100 s = +100 s.', 'Isolate r by multiplying t by √[g/(2H)], of dimension inverse time. The ratio must still obey the small-hole domain.', 'Substitution gives t_B/t_A = a√b. The ratio of areas stays outside the root.', 'B has r = 200 and √(2H/g) = 2 s, hence t_B = 400 s and ratio 4 to 100 s.', 'Statistical mean is (100 + 400)/2 = 250 s. Mean inputs give 75√10 s; squares 62500 and 56250 distinguish them without decimal evaluation.', 'Target t_B = 400 s with r_B = 200 requires root 2 s, so H_B = 20 m and H_B/H_A = 4.', 'Gain 300/(100 s) = 3 s⁻¹. Reading 1200 gives t_B = 400 s; H_B = 20 m gives r_B = 200.', 'Gain (801 − 201)/(400 − 100) = 2 s⁻¹ and offset 1. Reading 401 means t_C = 200 s; H_C = 5 m gives r_C = 200.', 'With r = cH, c = 20 m⁻¹, t² = (2c²/g)H³. Thus H³ = 125 m³ and the unique positive root is H = 5 m, giving r = 100. The added domain H > 1/2 m is satisfied.']
DISTRACTORS=['50 s keeps the initial maximum outflow constant; 200 s adds a second factor two to a law already integrated. Area ratio is not an area or a count of seconds.', 'm/s is speed, m length, s² the radicand unit and 1 the ratio unit. None describes total time.', 'Constant flow would require another control such as maintained head. Emptying does not raise the head or double density, and positive factors cannot yield a negative total time.', '50 reverses the area-ratio effect; 400 squares it; unchanged 100 ignores it and zero contradicts positive initial head.', 'Units cancel in the inverse. Doubling the answer counts a factor two again, and a positive ratio outside the approximation domain would not validate this model.', '10 m omits the half. Leaving t/r un-squared has the wrong length dimension after multiplication by g.', '4 follows volume alone without increased initial outflow; 1/2 and 1/4 reverse the states; 1 ignores the larger head.', '−100 reverses the error, 200 repeats proposal, zero endorses it and 50 halves it.', 'Multiplying by the original root gives time squared; dividing the inverse root by t gives inverse time squared. Extra double or half does not preserve the equation.', 'a b omits the head root; √(a b) roots the area ratio incorrectly; a/√b reverses head dependence and a²√b doubles its area-ratio degree.', '2 follows one change, 8 treats head linearly, 1/4 reverses trials and 400 is the final time number rather than a pure ratio.', '500 is sum, 125 halves twice, 300 is the difference and 75√10 is the response at mean inputs, not the mean of outputs.', '2 is a ratio of roots rather than heads; 1/4 reverses states, 20 copies the new head number and 8 repeats the area-ratio change.', 'Using raw reading 1200 as seconds gives r = 600 and a reconstructed display three times too large.', 'At H = 5 m, r = 100,400,199,201 give readings 201,801,399,403 respectively. Only 200 gives 401.', 'The coefficient has inverse-length units. A positive cube has one positive root, not a pair of roots from a square equation; alternate heads 10 or 5/2 do not reconstruct t = 100 s.']
ASSUMPTIONS=['Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.', 'Rigid cylindrical reservoir, fixed positive A/a > 10 and a much smaller than A, homogeneous incompressible liquid, common boundary pressure, g = 10 m/s², ideal unit efflux coefficient and no machine or losses. Quasi-steady outflow neglects surface speed while head declines. The given integrated approximation ends at the first emptying time; no continuation beyond it is allowed. The area ratio may vary between apparatuses, not during a single emptying.']
UNITS={1: 'second', 2: 'second', 3: 'second', 4: 'second', 5: 'dimensionless', 6: 'meter', 7: 'dimensionless', 8: 'second', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'second', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'meter'}
NUMERIC_UNITS={1: 's', 5: '1', 6: 'm', 11: '1', 13: '1', 14: '1', 16: 'm'}
OPTION_SUFFIX={7: '', 8: ' s', 12: ' s', 15: ''}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M110 1520Q260 1770 410 1770', 'M150 400V500', 'M110 1060V860L410 1060Z', 'M445 400V450'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M150 400V500', 'M445 400V450'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(70, 200, 160, 200), (365, 350, 160, 50)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(260, 1707.5), (110, 1520), (410, 1770)}<=points:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'First tank uses vertical scale 40 px/m: initial 5 m is 200 px and half-time 5/4 m is 50 px. Widths and hole symbols are explicitly schematic. Separate speed arrows 100 and 50 px at 10 px/(m/s) give 10 and 5 m/s. Flow graph origin (110,1060), 3 px/s and 2000 px/(m³/s): triangle to (110,860),(410,1060) represents 1/10 m³/s initially, 100 s duration and 5 m³ area. Head graph uses 3 px/s and 50 px/m, origin (110,1770); quadratic Bezier (110,1520), control (260,1770), endpoint (410,1770) is 5(1−τ/100)². The midpoint (260,1707.5) gives 50 s and 5/4 m; the curve stops at 100 s. Complete XML, markers and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-reservoir-emptying-{n:02}"
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
        # Check all its numeric alternatives with the bounded exact literal grammar;
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
          "methods":["source_prompt_only_primary_continuity_viscous_profile_and_pressure_node_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Ideal reservoir emptying with explicitly varying head","reference":"Independently integrate the assigned quasi-steady volume balance until the first zero level. Distinguish the supplied large-reservoir approximation from finite-surface-speed corrections and constant initial outflow."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-04","U2-01")
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
