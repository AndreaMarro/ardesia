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
CANDIDATE_REF='1496adc746769f01502925ae89ad7b6f9ba9a8dd'
REVIEWED_PACKAGE_SHA256='0c36d79a50e0386e26af8e4f35eb1391f8d4975076713a901a46afa558e586ba'
REVIEWED_BINDINGS_SHA256='15e8fe44b86aa60f204981974707ba231ceb527e89ca48fe9cd2b6ea744177cf'
BATCH='oscillator-max-speed-133'
ASSET_NAME='oscillator-max-speed-progressive.svg'
FALSE_PROOF='La velocità massima si raggiunge agli estremi della traiettoria perché la distanza dall’equilibrio è massima; al centro la velocità è nulla.'
SVG_MUTATION=(b'M320 330H440', b'M320 330H500')
EXPECTED_SKILL='C5-L01'
EXPECTED_PREREQUISITES=['C1-L003', 'C5-L01']
EXPECTED_IDS={f"AR-u4-oscillator-max-speed-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-oscillator-max-speed-01": "b188c54da3cc9970c81ebba6633cd8a14d0809e32abb361c39dcfc07cb988a3e",
    "AR-u4-oscillator-max-speed-02": "5e27cc9e9ffef108690e18620bd46a57e40dd275b7b7a5d8bda9c18f7c82d26a",
    "AR-u4-oscillator-max-speed-03": "23e9504a221cec74b73ed5e9fad9fceca62ade8dd075e109c6f6bebf269840af",
    "AR-u4-oscillator-max-speed-04": "f68253aad9f802c8c658d8787a0ecd6bf010d80a15797de1fa4d6aee8993f484",
    "AR-u4-oscillator-max-speed-05": "72b5ba22e6a91a2beee9353f42b64b542069acd908494a34ad0263a3fa1d75d0",
    "AR-u4-oscillator-max-speed-06": "36eeac18e56084bff647084fac9111c1237171d399bc71b6053690cc8cb3dd5c",
    "AR-u4-oscillator-max-speed-07": "6ece6e49b2d2c465e01f60220eb3c7d6576d65ffdd31e12a6484877675eba645",
    "AR-u4-oscillator-max-speed-08": "7d4073189528b1362d5897c2ef065420b41a9fc60b376d7c4b4e465b50c8e224",
    "AR-u4-oscillator-max-speed-09": "d4303f170318e4466201ea54a2e82f9eb2561a05b283975451aeee05846e7b79",
    "AR-u4-oscillator-max-speed-10": "73f5ab11338dc85a3f8dede7515169e3191a8a21d8c82b20c0ec5e5c3dfa3656",
    "AR-u4-oscillator-max-speed-11": "465e9359c915f401d481b49626457eff411b4ff69c11ce31ec9fdb2f63e56463",
    "AR-u4-oscillator-max-speed-12": "4f212c54cae17f603a4d4972a6197178950c43382deedb1193244c33b60fa83d",
    "AR-u4-oscillator-max-speed-13": "9d40d2fc0e21a6dfc0f9327752137522d6b2b024fa6cf6f5d26ee3242eb96840",
    "AR-u4-oscillator-max-speed-14": "723c75554d00ccafa4433cab004fe90c5ac4d555e8ad8a9f5282ca91a512fa4e",
    "AR-u4-oscillator-max-speed-15": "0fc17fab373a357dea5c97bde68f66976b9df9efdc715ef17d6eb788fb151b8e",
    "AR-u4-oscillator-max-speed-16": "bf7b4fc780c04c1a731aac968f0aaab48122ffdce2186a0400ba9c40568d6ec8"
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

def physical_max_speed(amplitude,omega):
    amplitude,omega=map(Fraction,(amplitude,omega))
    if min(amplitude,omega)<=0:raise ValueError("Positive displacement amplitude and angular frequency required")
    return amplitude*omega

def constrained_omega(speed,coefficient):
    speed,coefficient=map(Fraction,(speed,coefficient))
    if min(speed,coefficient)<=0:raise ValueError("Positive maximum speed and cross-trial amplitude coefficient required")
    return sp.sqrt(sp.Rational(speed)/sp.Rational(coefficient))

def oracle():
    A,w,t,phi,V,a,b,c=sp.symbols("A w t phi V a b c",positive=True)
    x=A*sp.cos(w*t+phi);v=sp.diff(x,t)
    assert v==-A*w*sp.sin(w*t+phi)
    law=A*w;inv=sp.solve(sp.Eq(V,law),A)[0];ang=sp.solve(sp.Eq(V,law),w)[0]
    assert inv==V/w and ang==V/A
    assert sp.cancel(law.subs({A:a*A,w:b*w},simultaneous=True)/law)==a*b
    first=sp.Rational(physical_max_speed(2,3));second=sp.Rational(physical_max_speed(1,4))
    assert (SI.Quantity(2,"meter")*SI.Quantity(3,"radian/second")).to("meter/second").magnitude==6
    mean=(first+second)/2;assert physical_max_speed(Fraction(3,2),Fraction(7,2))-mean==sp.Rational(1,4)
    q,z,decoded,affine=calibrate(first,second,18,12,13,9,41,"meter/second");assert(q,z,decoded,affine)==(3,1,4,20)
    assert law.subs(A,c*w)==c*w**2 and constrained_omega(6,Fraction(2,3))==3
    return [first,"m/s","v_max = ω A","Da 6 a 3 m/s",inv.subs({V:6,w:3}),ang.subs({V:6,A:2}),sp.Rational(1,3),12-first,"A = v_max / ω","κ₁ κ₂",second/first,mean,sp.Rational(4,3),inv.subs({V:decoded,w:4}),inv.subs({V:affine,w:5}),constrained_omega(6,Fraction(2,3))]

MANUAL=['Differentiate displacement: v=−Aω sin(ωt+φ). Maximum sine modulus one gives speed maximum 2 m times 3 s⁻¹, or 6 m/s.', 'An amplitude in meters multiplied by angular frequency in inverse seconds gives m/s. Radians are dimensionless.', 'The first time derivative introduces one angular-frequency factor. Maximal velocity modulus is Aω, attained at equilibrium.', 'Amplitude 1 m at angular frequency 3 rad/s gives maximum speed 3 m/s, half the initial 6 m/s.', 'Amplitude equals maximum speed divided by angular frequency: 6 m/s divided by 3 s⁻¹ gives 2 m.', 'Angular frequency equals maximum speed divided by amplitude: 6 m/s divided by 2 m gives 3 rad/s. Ordinary frequency would be 3/(2π) Hz.', 'At amplitude 2 m and angular frequency 1 rad/s, maximum speed is 2 m/s. Ratio to 6 m/s is 1/3.', 'Proposed 12 m/s minus correct 6 m/s is the signed error +6 m/s.', 'Dividing maximum speed by positive angular frequency isolates amplitude A=V/ω, with units meters.', 'Both amplitude and angular frequency enter once. Positive scaling factors give maximum-speed ratio κ₁κ₂.', 'Trial II gives 1 m times 4 s⁻¹, or 4 m/s. Ratio to trial I maximum 6 m/s is 2/3.', 'Output mean (6+4)/2 is 5 m/s. Input means 3/2 m and 7/2 rad/s give 21/4 m/s, higher by 1/4 m/s.', 'Target maximum speed 4 m/s at amplitude 1 m requires angular frequency 4 rad/s. Relative to initial 3 rad/s the factor is 4/3.', 'Gain 18/(6 m/s)=3 s/m decodes reading 12 as maximum speed 4 m/s. Divide by angular frequency 4 rad/s to obtain amplitude 1 m.', 'Gain (13−9)/(6−4)=2 s/m and offset 1 decode reading 41 as maximum speed 20 m/s. Division by angular frequency 5 rad/s gives amplitude 4 m.', 'With A=cω and c=2/3 m·s, maximum speed is cω². Speed 6 m/s fixes angular-frequency square 9 s⁻², positive ω=3 rad/s and amplitude 2 m.']
DISTRACTORS=['12 uses the full endpoint separation 2 A instead of amplitude A; 3 copies angular frequency. Maximum modulus occurs at equilibrium, while the oriented velocity reaches both +6 and −6 m/s.', 'Meters express amplitude, m/s² acceleration, rad/s angular frequency and seconds duration. Neither maximum nor modulus changes velocity dimensions.', 'Aω² is acceleration amplitude, A/ω has length-time dimensions and ω/A inverse length-time dimensions. Another 2π double-counts conversion from f to ω.', '12 reverses the amplitude effect, 3/2 squares the amplitude factor, 6 ignores it and 1 copies an amplitude value as speed. The ideal period remains unchanged.', '4 is endpoint separation rather than amplitude. Multiplication by ω gives acceleration; division by ω twice introduces an extra time.', '3 Hz differs from 3 rad/s. Multiplication by amplitude gives 12 with the wrong dimension. Reciprocal angular frequency is a characteristic time rather than angular frequency.', '3 reverses states, 1/9 imports the acceleration square dependence, 1 ignores the change and 2 copies the final speed value instead of its ratio.', '−6 reverses subtraction, 12 repeats the proposal, 18 sums and 0 endorses the doubled speed. Signed error is distinct from the positive maximum modulus.', 'Vω has acceleration units, ω/V inverse length and V/ω² length-time. An extra factor two returns the endpoint separation.', 'Quotients reverse direct dependences. The squared angular-frequency factor belongs to acceleration, while adding factors gives two for unchanged trials.', '3/2 reverses states, 1/2 follows amplitude alone, 4/3 follows angular frequency alone and 4 copies the final speed value.', '10 is the sum, 1 the semidifference, 4 only the second trial and 21/4 the response at input means. Mean trial maxima differ from the zero oriented velocity mean during one full cycle.', '3/4 reverses states, 2/3 copies the target speed ratio, 2 compensates amplitude alone and 4 copies the final angular-frequency number.', 'Raw reading 12 is dimensionless. Gain 3 s/m decodes speed 4 m/s and amplitude 1 m. Using the raw reading triples amplitude and fails reconstruction.', 'At ω=5 rad/s, alternative amplitudes 20, 5, 10 and 41 m give readings 201, 51, 101 and 411. Only 4 m reconstructs reading 41 after gain 2 and offset 1.', '9 is the angular-frequency square. Its negative square root violates both ω>0 and A>0. The dimensioned coefficient relates different trials rather than a time-varying amplitude during a cycle.']
ASSUMPTIONS=['A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.', 'A material point follows ideal harmonic displacement in an inertial frame, positive constant amplitude and angular frequency within each trial, arbitrary constant initial phase, no damping. The requested maximum is a positive modulus, with both oriented velocity signs during each cycle. This is material motion, not wave-shape propagation. Cross-trial amplitude-frequency constraints have explicit dimensioned coefficients; display is continuous and dimensionless.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'meter', 6: 'radian/second', 7: 'dimensionless', 8: 'meter/second', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'radian/second'}
NUMERIC_UNITS={1: 'm/s', 5: 'm', 6: 'rad/s', 14: 'm', 16: 'rad/s'}
OPTION_SUFFIX={7: '', 8: ' m/s', 11: '', 12: ' m/s', 13: '', 15: ' m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M80 900H555', 'M100 1050V750', 'M100 780H400M100 1020H200', 'M200 175V470M320 175V470M440 175V470', 'M320 330H440', 'M320 440H200'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M320 330H440', 'M80 900H555', 'M320 440H200', 'M100 1050V750'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1370, 240, 35), (100, 1500, 160, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(320, 440, 12), (440, 220, 12), (320, 330, 12)}<=circles:raise ValueError("Independently reviewed physical scale or graph curve changed")

    plots=[]
    for e in root.iter():
        raw=e.get("d","")
        if raw.startswith("M100.000"):
            pts=[tuple(map(float,p)) for p in re.findall(r"[ML]([0-9.]+) ([0-9.]+)",raw)]
            if len(pts)>20:plots.append(pts)
    specs=[(100, 400, 900, -120, 1)]
    if len(plots)!=len(specs):raise ValueError("Independently reviewed physical scale or graph curve changed")
    for pts,(origin,span,baseline,amp,cycles) in zip(plots,specs):
        if len(pts)!=241:raise ValueError("Independently reviewed physical scale or graph curve changed")
        for j,(x,y) in enumerate(pts):
            # Only drawn coordinates are rounded to three decimal pixels; exact answers never are.
            if abs(x-(origin+span*j/240))>0.00051 or abs(y-(baseline-amp*math.sin(2*math.pi*cycles*j/240)))>0.00051:
                raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Position origin x=320 at 60 px/m gives endpoints x=200 and x=440 for −2 and +2 m. Three distinct instants show rest at the right endpoint and two separate passages through equilibrium. Each velocity arrow is 120 px at 20 px/(m/s), giving oriented velocities ±6 m/s. Phase graph origin (100,900), 200/π px/rad and 20 px/(m/s): the −6 sinθ curve has minimum (200,1020), zero (300,900), maximum (400,780) and final zero (500,900). All 241 samples, complete XML and full native image were read. Positive bars 240 and 160 px at 40 px/(m/s) give 6 and 4 m/s, ratio 2/3. Effective markers on each separate arrow were checked.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-oscillator-max-speed-{n:02}"
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
      "title":"Maximum speed from the first harmonic time derivative","reference":"Differentiate x=A cos(ωt+φ) once to obtain oriented velocity, then maximize its modulus over a full cycle. Distinguish source frequency, angular frequency, endpoint separation and shape propagation speed."}}



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
