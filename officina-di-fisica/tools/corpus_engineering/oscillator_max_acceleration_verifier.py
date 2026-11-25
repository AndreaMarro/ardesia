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
CANDIDATE_REF='9a9671e8f6958c89a792706ad3da97cc44f56899'
REVIEWED_PACKAGE_SHA256='4ae2419393d2e42ce6d3078a3442811514c0eb7c9d81a04d03df7bbce222a0ee'
REVIEWED_BINDINGS_SHA256='8cd1ca95b2b0603a06b126b0a11579358939119ec05e5387fbd4696bf8dbec9a'
BATCH='oscillator-max-acceleration-134'
ASSET_NAME='oscillator-max-acceleration-progressive.svg'
FALSE_PROOF='L’accelerazione massima al centro è nulla perché il punto si muove più rapidamente, quindi il massimo del modulo coincide con zero durante tutto il ciclo.'
SVG_MUTATION=(b'M220 800L420 1000', b'M220 1000L420 800')
EXPECTED_SKILL='C5-L01'
EXPECTED_PREREQUISITES=['C1-L003', 'C5-L01']
EXPECTED_IDS={f"AR-u4-oscillator-max-acceleration-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-oscillator-max-acceleration-01": "b9dc3a44016c75668539501d770b561d7592098458f5826847789f47eb6cbb25",
    "AR-u4-oscillator-max-acceleration-02": "3e6760758b1f16bdeb6028074165ba44017a7516d01b8a5a4ac6c94866f2c30d",
    "AR-u4-oscillator-max-acceleration-03": "9712cbaa5ec95a2fd490f266e504a3df0d7937881b72e1cab31ae3b0fbe6e18f",
    "AR-u4-oscillator-max-acceleration-04": "02b40e8f8b40ecf17fce8e0881959ada201a1636db69359500dc767b41fb4c2e",
    "AR-u4-oscillator-max-acceleration-05": "d422f87ed6aacfb1174f220181f4dccf4526f18c3c6194654ba13175fdfb7813",
    "AR-u4-oscillator-max-acceleration-06": "74aa3ecae278b991838ddfa37c68cc5064d08d3832e584f640bf31b5026b2d91",
    "AR-u4-oscillator-max-acceleration-07": "0b268d957e7ca01d17803b9025e0f08761199d136b74e41026e20a817e91b05a",
    "AR-u4-oscillator-max-acceleration-08": "6a60bb1109c2893ab991fb3c852819875ebe7ae7ab1bb158fd12d013ccbef3c5",
    "AR-u4-oscillator-max-acceleration-09": "8680345d90c052516b4651962291633542abdc9596094a10e87ff549b922de2f",
    "AR-u4-oscillator-max-acceleration-10": "eefd07c49598bc643bc8c04d5288a7e6b8a08a009637d2f4c0df60460a868ab2",
    "AR-u4-oscillator-max-acceleration-11": "f4790dc374f4665f3602f8f1f0a6a7bcc0d7af5323a275dc6fff53db8ffad2dd",
    "AR-u4-oscillator-max-acceleration-12": "58ec581dd1cdcf5385abbe816160c932168ed8dc8e4f8c0b7cdc5b8235b83dc2",
    "AR-u4-oscillator-max-acceleration-13": "8613eb5385c2fb49769e805dc603aef63dcfdbf8ba1c32b7b043821f79105e4e",
    "AR-u4-oscillator-max-acceleration-14": "2804990c7d8ff467655e287d280bb66118f8099e61407feee992213c4f0a2442",
    "AR-u4-oscillator-max-acceleration-15": "3a60b3f696f3be04a7b525685db0a67a06cc445ba7440e9cc60c511ea8108fde",
    "AR-u4-oscillator-max-acceleration-16": "c69767d520da8f104d10a85d6bd5f8548d0102e6cf2bbffb9d1606043762b1f0"
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

def physical_max_acceleration(amplitude,omega):
    amplitude,omega=map(Fraction,(amplitude,omega))
    if min(amplitude,omega)<=0:raise ValueError("Positive displacement amplitude and angular frequency required")
    return amplitude*omega**2

def constrained_omega(acceleration,coefficient):
    acceleration,coefficient=map(Fraction,(acceleration,coefficient))
    if min(acceleration,coefficient)<=0:raise ValueError("Positive maximum acceleration and cross-trial amplitude coefficient required")
    return sp.real_root(sp.Rational(acceleration)/sp.Rational(coefficient),3)

def oracle():
    A,w,t,phi,M,a,b,c=sp.symbols("A w t phi M a b c",positive=True)
    x=A*sp.cos(w*t+phi);oriented=sp.diff(x,t,2)
    assert sp.simplify(oriented+w**2*x)==0
    law=A*w**2;inv=sp.solve(sp.Eq(M,law),A)[0]
    assert inv==M/w**2
    assert sp.simplify(sp.solve(sp.Eq(M,law),w)[0]-sp.sqrt(M/A))==0
    assert sp.cancel(law.subs({A:a*A,w:b*w},simultaneous=True)/law)==a*b**2
    first=sp.Rational(physical_max_acceleration(1,2));second=sp.Rational(physical_max_acceleration(2,3))
    assert (SI.Quantity(1,"meter")*SI.Quantity(2,"radian/second")**2).to("meter/second**2").magnitude==4
    mean=(first+second)/2;assert mean-physical_max_acceleration(Fraction(3,2),Fraction(5,2))==sp.Rational(13,8)
    q,z,decoded,affine=calibrate(first,second,12,54,9,37,25,"meter/second**2");assert(q,z,decoded,affine)==(3,1,18,12)
    assert law.subs(A,c*w)==c*w**3 and constrained_omega(4,Fraction(1,2))==2
    return [first,"m/s²","a_max = ω² A","Da 4 a 12 m/s²",inv.subs({M:4,w:2}),sp.sqrt(sp.Rational(4,1)),sp.Rational(1,4),8-first,"A = a_max / ω²","κ₁ κ₂²",second/first,mean,sp.Rational(3,2),inv.subs({M:decoded,w:3}),inv.subs({M:affine,w:2}),constrained_omega(4,Fraction(1,2))]

MANUAL=['The second derivative gives a=−ω²x. Maximum modulus is Aω²=1 m times 4 s⁻², or 4 m/s²; the two endpoint components have opposite signs.', 'Angular frequency squared has inverse-time-squared dimensions. Multiply by displacement amplitude to obtain m/s².', 'Two time derivatives introduce two angular-frequency factors. Since maximum |x| is A, maximum |a| is Aω².', 'Amplitude 3 m at angular frequency 2 rad/s gives maximum acceleration 12 m/s². The amplitude factor enters linearly.', 'Divide maximum acceleration 4 m/s² by angular-frequency square 4 s⁻² to obtain amplitude 1 m.', 'First isolate angular-frequency square 4 s⁻². The positive square root is 2 rad/s.', 'Angular frequency 1 rad/s and amplitude 1 m give maximum acceleration 1 m/s². Ratio to initial 4 m/s² is 1/4.', 'Proposed 8 m/s² minus correct 4 m/s² is +4 m/s². Both terms are maximum moduli.', 'Amplitude appears linearly in the acceleration maximum. The inverse is A=M/ω², with meters as its resulting unit.', 'Positive scaling substitutions give maximum-acceleration ratio κ₁κ₂². Only angular frequency is squared.', 'Trial B gives 2 m times (3 s⁻¹)², or 18 m/s². Ratio to 4 m/s² is 9/2.', 'Output mean (4+18)/2 is 11 m/s². Mean inputs 3/2 m and 5/2 rad/s give 75/8 m/s², lower by 13/8 m/s².', 'After removing the amplitude factor 2, target acceleration factor 9/2 leaves angular-frequency ratio squared 9/4. Its positive root is 3/2.', 'Gain 12/(4 m/s²)=3 s²/m decodes reading 54 as maximum acceleration 18 m/s². Divide by 9 s⁻² to obtain amplitude 2 m.', 'Gain (37−9)/(18−4)=2 s²/m and offset 1 decode reading 25 as maximum acceleration 12 m/s². Divide by angular-frequency square 4 s⁻² to obtain amplitude 3 m.', 'Constraint A=cω with c=1/2 m·s makes maximum acceleration cω³. Acceleration 4 m/s² gives cube 8 s⁻³, the unique positive angular frequency 2 rad/s and amplitude 1 m.']
DISTRACTORS=['2 uses a single angular-frequency factor and is a speed.8 doubles the answer,0 applies at equilibrium rather than at endpoints. Oriented accelerations at the two endpoints are opposite, while the maximum modulus is positive 4 m/s².', 'm/s is velocity,m amplitude,rad/s angular frequency andN force. Converting acceleration to force also requires mass, absent from the requested quantity.', 'Aω is maximum speed,A/ω² has length-time squared dimension andω²/A inverse length-time squared. Extra 2 confuses amplitude with separation between endpoints.', '36 squares the amplitude factor 3 instead of multiplying it once;4/3 reverses it,4 ignores it and 6 does not apply the assigned factor. The square belongs toω.', 'Dividing byω only gives speed 2 m/s. The separation 2 m is not amplitude A. Taking a square root of A is not the algebraic inverse of a linear dependence.', '4 rad/s would predict 16 m/s²;1/2 rad/s predicts 1/4 m/s². Negativeω violates convention. Ordinary frequency is 1/π Hz, not 2 Hz.', '1/2 is speed scaling,4 reciprocal acceleration ratio,2 reciprocal speed ratio and 1 ignores changed angular frequency. No oriented sign enters the ratio of maxima.', '−4 reverses subtraction,8 keeps proposed value,12 sums and 0 accepts the double. Subtracting a negative instantaneous component would compare different quantities.', 'M/ω has velocity units,Mω² gives m/s⁴,ω²/M reciprocal length and√(M/ω²) square-root length. Only division byω² gives amplitude.', 'κ₁κ₂ misses one angular-frequency factor;κ₁²κ₂ squares amplitude instead. Quotients reverse direct dependencies in the positive maximum modulus.', '2/9 reverses states,3 keeps both factors only linearly,2 amplitude alone and 9/4 angular-frequency square alone. Both effects give 18/4.', '22 is sum,7 semidifference and 18 only B.75/8 is the response at mean inputs, lower by 13/8 than the mean of outputs. Cycle-mean oriented acceleration would instead be zero.', '9/4 is the squared frequency ratio,2/3 reciprocal result,9/2 target acceleration factor and 3 final angular-frequency number. The physical frequency ratio is positive.', '54 is raw reading,18 acceleration number and 3 angular-frequency number. Raw-reading substitution predicts amplitude 6 m instead of 2 and fails display reconstruction.', '6 divides decoded acceleration byω once rather thanω²;12 copies acceleration,2 generates reading 17 and 25 copies display.3 m alone reproduces 25.', '8 isω³,notω;√8 solves a different quadratic. The real cubic is increasing on positiveω, so one physical root exists, with no extra negative root. Coefficientc has m·s dimensions and constrains distinct trials.']
ASSUMPTIONS=['A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.', 'A material point follows harmonic displacement in an inertial frame with positive constant amplitude and angular frequency within each trial, no damping or driving, radian dimensionless. Acceleration is restoring and oriented opposite displacement; a_max is a positive cycle maximum of the modulus, not a component at a selected endpoint. Cross-trial constraints and display gains have explicit physical dimensions.']
UNITS={1: 'meter/second**2', 2: 'meter/second**2', 3: 'meter/second**2', 4: 'meter/second**2', 5: 'meter', 6: 'radian/second', 7: 'dimensionless', 8: 'meter/second**2', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second**2', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'radian/second'}
NUMERIC_UNITS={1: 'm/s²', 5: 'm', 6: 'rad/s', 14: 'm', 16: 'rad/s'}
OPTION_SUFFIX={7: '', 8: ' m/s²', 11: '', 12: ' m/s²', 13: '', 15: ' m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M220 800L420 1000', 'M220 440H320', 'M220 900V800H320M420 900V1000H320', 'M180 900H490', 'M220 175V470M320 175V470M420 175V470', 'M320 1040V750', 'M420 220H320'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M220 440H320', 'M420 220H320', 'M180 900H490', 'M320 1040V750'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1500, 360, 35), (100, 1370, 80, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(420, 220, 12), (320, 330, 12), (220, 440, 12)}<=circles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Position origin x 320 at 100 px/m gives endpoints x 220 and 420, representing−1 and+1 m. Separate 100 px restoring arrows at 25 px/(m/s²) represent+4 and−4 m/s² at opposite endpoints; the central instant has zero acceleration. In the a_x(x) graph origin(320,900),100 px/m and 25 px/(m/s²), line(220,800) to(420,1000) represents slope−4 s⁻², not a spatial trajectory. Comparison bars 80 and 360 px use the separately declared 20 px/(m/s²), giving maxima 4 and 18. Complete XML and full native image read; arrowheads, graph axes, label separation and positive zero-based bars checked.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-oscillator-max-acceleration-{n:02}"
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
      "title":"Maximum acceleration from the restoring second derivative","reference":"Differentiate harmonic displacement twice, prove a_x=−ω²x, and maximize its modulus over a cycle. Keep maximum modulus, oriented acceleration, maximum velocity, amplitude and endpoint separation distinct."}}



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
