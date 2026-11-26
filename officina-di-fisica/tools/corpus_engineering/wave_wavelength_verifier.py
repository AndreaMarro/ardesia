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
CANDIDATE_REF='f66bbc524fb5fb9bf0b651ca6f594d1e41bcf078'
REVIEWED_PACKAGE_SHA256='17596a00f5b13878be538fc84f43c08e773b788fe7e02851161dd9d87bb1bc63'
REVIEWED_BINDINGS_SHA256='4d5a4dff647e8598a5db4cb3e5a728edc83240a5d9084c4aa94a0bdd0a2a5362'
BATCH='wave-wavelength-130'
ASSET_NAME='wave-wavelength-progressive.svg'
FALSE_PROOF='Nel medesimo mezzo, raddoppiare soltanto la frequenza raddoppia la lunghezza d’onda perché ogni cresta deve percorrere più spazio.'
SVG_MUTATION=(b'width="220"', b'width="110"')
EXPECTED_SKILL='C5-L02'
EXPECTED_PREREQUISITES=['C5-L01', 'C5-L02']
EXPECTED_IDS={f"AR-u4-wave-wavelength-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-wave-wavelength-01": "c426b65da84a882cf7923735a0973e2fbf5bd8b673b91b97bb43d8a5e85080f2",
    "AR-u4-wave-wavelength-02": "398b31c715c112fb38ed3407ff052a040743e143f49c0734b4b13ae301a7ba38",
    "AR-u4-wave-wavelength-03": "a029b039e0792edb6bfebd20ac3cf8e5423b11eed4e432ccf7571ced9169a2c7",
    "AR-u4-wave-wavelength-04": "7fa6b1224c3c1891011b5b53b2cd366e215c13afcb8ba90ba8c63f911414b7e5",
    "AR-u4-wave-wavelength-05": "6209384c8ce4ea51ea84bedf3268d3ed417bfe0dee1303fdda7d0b5aea1b25c9",
    "AR-u4-wave-wavelength-06": "1ef8156f065ff428bdce87070fafedf248561f53a49a7c7d879f4e82ff20c9be",
    "AR-u4-wave-wavelength-07": "7615336f31a90f35a3e0436ea355838c56df12474d0a827879dccc6d3d287070",
    "AR-u4-wave-wavelength-08": "42c059d2069e8ab92429a2d555148480609af2f419e1d42f2236de6c9a9b095e",
    "AR-u4-wave-wavelength-09": "0b2fe8bcfc2ac19e7145c0e629c52cb87d1b5ee6a3fda9c49a2a7d31d04abb8c",
    "AR-u4-wave-wavelength-10": "a4f14355ea3852fc01049573d1b36089d7bf56ab10dc8a8927725028de8c674f",
    "AR-u4-wave-wavelength-11": "48211ee286a9a8e1232ec4a59601fd1719155bc52b1f89f94fe20b427c5bcd22",
    "AR-u4-wave-wavelength-12": "a01f121d5ab0a7d8d07bb0d1663210be0888b16e95844508c6d4f1fe8a92e3d2",
    "AR-u4-wave-wavelength-13": "5f2e101fa310d2b90916abd0325b31905875f21dd4ab0949a7c2c9c1a51c475e",
    "AR-u4-wave-wavelength-14": "9118bd31045a2b46c6bd47595b800b555e9ecb684593c653e97595faad0d4707",
    "AR-u4-wave-wavelength-15": "6eed04fa6c8b15cb2dee19219645e788b4acc2970ad918a6dcd1cb465aaf5b37",
    "AR-u4-wave-wavelength-16": "d85206f22c5e0b0f3090eb0e2a6f43c8c83a0b8a06aef437b11f2b8f52c1672b"
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

def physical_wavelength(speed,frequency):
    speed,frequency=map(Fraction,(speed,frequency))
    if min(speed,frequency)<=0:raise ValueError("Positive shape speed and source frequency required")
    return speed/frequency

def oracle():
    v,f,L,a,b,c=sp.symbols("v f L a b c",positive=True)
    law=sp.solve(sp.Eq(L,v/f),L)[0]
    inv=sp.solve(sp.Eq(L,law),v)[0];freq=sp.solve(sp.Eq(L,law),f)[0]
    assert inv==L*f and freq==v/L
    assert sp.cancel(law.subs({v:a*v,f:b*f},simultaneous=True)/law)==a/b
    first=sp.Rational(physical_wavelength(12,3));second=sp.Rational(physical_wavelength(30,6))
    assert (SI.Quantity(12,"meter/second")/SI.Quantity(3,"hertz")).to("meter").magnitude==4
    mean=(first+second)/2;assert sp.Rational(physical_wavelength(21,Fraction(9,2)))-mean==sp.Rational(1,6)
    q,z,decoded,affine=calibrate(first,second,12,15,9,11,3,"meter");assert(q,z,decoded,affine)==(3,1,5,1)
    assert sp.cancel(law.subs(v,c*f))==c
    return [first,"m","Oscillano parallelamente alla propagazione","Da 4 a 1/3 m",inv.subs({L:4,f:3}),freq.subs({v:12,L:4}),sp.Integer(3),8-first,"v = λ f","κ₁ / κ₂",second/first,mean,sp.Integer(2),inv.subs({L:decoded,f:6}),inv.subs({L:affine,f:1}),"Infinite coppie"]

MANUAL=['One period is 1/3 s. Shape speed 12 m/s multiplied by that period gives wavelength 4 m.', 'Length per time divided by inverse time gives length: (m/s)/Hz = m.', 'In ordinary small-amplitude sound in still air, local particle displacement is parallel to propagation. The disturbance propagates while particles oscillate locally.', 'At speed 1 m/s and frequency 3 Hz, wavelength is 1/3 m, compared with 4 m initially.', 'Isolate speed v=λf. Wavelength 4 m times frequency 3 Hz gives 12 m/s.', 'Isolate frequency f=v/λ. Speed 12 m/s divided by wavelength 4 m gives 3 Hz.', 'At the same speed 12 m/s, frequency 1 Hz gives wavelength 12 m. The ratio to 4 m is 3.', 'Proposed 8 m minus correct 4 m is the signed discrepancy +4 m.', 'Multiply λ=v/f by positive f to obtain v=λf. Both factors retain their physical units.', 'After scaling speed by κ₁ and frequency by κ₂, the wavelength ratio is κ₁/κ₂.', 'Trial B gives 30/6=5 m. Its ratio to trial A wavelength 4 m is 5/4.', 'First evaluate both outputs, then average: (4+5)/2=9/2 m. Average inputs give 21/(9/2)=14/3 m, higher by 1/6 m.', 'Target wavelength 5 m at speed 30 m/s requires frequency 6 Hz. Relative to 3 Hz the required frequency factor is 2.', 'Gain 12/(4 m)=3 m⁻¹ decodes reading 15 as wavelength 5 m. Multiplication by frequency 6 Hz gives speed 30 m/s.', 'Gain (11−9)/(5−4)=2 m⁻¹ and offset 1 decode reading 3 as wavelength 1 m. Frequency 1 Hz then gives speed 1 m/s.', 'The dimensioned constraint v=(4 m)f makes wavelength 4 m for every positive frequency. The measured wavelength repeats the constraint, leaving infinitely many continuous positive pairs.']
DISTRACTORS=['36 multiplies speed and frequency and has wrong dimensions; 1/4 inverts the length number, 9 subtracts incompatible inputs and 3 repeats frequency.', 'Hertz is frequency, m/s speed, seconds period and reciprocal meters wave number; none has length dimension.', 'Transverse local motion is not the ordinary small-amplitude longitudinal sound mode in still air. Particles do not travel one wavelength along with each crest.', '12 ignores the slower shape speed, 48 reverses its factor, 1 treats frequency as dimensionless and unchanged 4 drops the new speed.', 'λf is speed, λ/f has length-time dimension. Reversing the inverse gives reciprocal speed; the supplied frequency is cycles per second.', 'v/λ gives inverse seconds; λ/v gives time. Multiplying produces length squared per time rather than frequency.', '1/3 reverses the frequency effect, 1 ignores it, 9 squares the factor and 2 is not either assigned frequency ratio.', '−4 reverses proposed-minus-correct, 8 repeats proposal, 12 sums and 0 endorses the doubled length.', 'Dividing λ by f produces length-time, and v inferred as f/λ would be inverse length-time. Dimensional agreement also requires the correct product.', 'Product makes wavelength increase with source frequency at fixed speed. Reciprocal exchanges states; squares invent a nonlinear propagation law.', '2 follows frequency alone, 5/2 follows speed alone and 4/5 reverses trials. The output ratio is (30/6)/(12/3).', '9 sums outputs, 9/4 halves again, 1 is their difference and 14/3 uses average inputs. These two means differ by exactly 1/6 m.', '1/2 reverses the required frequency change, 5/2 retains speed change alone and 5/4 repeats the target wavelength factor.', '15 is a dimensionless reading, not meters. Decode gain first; a speed from raw reading would reconstruct a threefold excessive display.', 'Ignoring the offset or using a reference speed directly fails S=2λ+1; the new frequency is 1 Hz after decoding wavelength 1 m.', 'One or two examples do not exhaust a continuous positive family. Zero makes f inadmissible, and v=4 f with measured λ=4 m adds no independent scale.']
ASSUMPTIONS=['A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.', 'A periodic shape in a homogeneous stationary nondispersive medium, v>0 and f>0 constant within each trial. Distinct trial speeds may represent distinct media or propagation parameters. Longitudinal small-amplitude sound in still air is a separate conceptual task; transverse graph displacement is explicitly illustrative, not a diagram of the air-particle mode. Display is continuous dimensionless signal.']
UNITS={1: 'meter', 2: 'meter', 3: 'dimensionless', 4: 'meter', 5: 'meter/second', 6: 'hertz', 7: 'dimensionless', 8: 'meter', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter', 13: 'dimensionless', 14: 'meter/second', 15: 'meter/second', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'm', 5: 'm/s', 6: 'Hz', 14: 'm/s'}
OPTION_SUFFIX={7: '', 8: ' m', 11: '', 12: ' m', 13: '', 15: ' m/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 325V175', 'M100 810V660', 'M75 740H575', 'M100 845H240M100 835V855M240 835V855', 'M100 355H320M100 345V365M320 345V365', 'M75 255H575'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M100 325V175', 'M100 810V660', 'M75 255H575', 'M75 740H575'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1320, 275, 35), (100, 1190, 220, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")

    plots=[]
    for e in root.iter():
        raw=e.get("d","")
        if raw.startswith("M100.000"):
            pts=[tuple(map(float,p)) for p in re.findall(r"[ML]([0-9.]+) ([0-9.]+)",raw)]
            if len(pts)>20:plots.append(pts)
    specs=[(100, 440, 255, 45, 2), (100, 420, 740, 45, 3)]
    if len(plots)!=len(specs):raise ValueError("Independently reviewed physical scale or graph curve changed")
    for pts,(origin,span,baseline,amp,cycles) in zip(plots,specs):
        if len(pts)!=241:raise ValueError("Independently reviewed physical scale or graph curve changed")
        for j,(x,y) in enumerate(pts):
            # Only drawn coordinates are rounded to three decimal pixels; exact answers never are.
            if abs(x-(origin+span*j/240))>0.00051 or abs(y-(baseline-amp*math.cos(2*math.pi*cycles*j/240)))>0.00051:
                raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Spatial origin (100,255), 55 px/m and 45 px/cm: crests x=100,320,540 represent wavelengths 4 m and amplitude 1 cm. Temporal origin (100,740), 420 px/s: crests at 100,240,380,520 represent f=3 Hz and T=1/3 s. All 241 samples of each cosine were read in XML, with complete full native image. Brackets are 220 px =4 m and 140 px =1/3 s; comparison bars 220 and 275 px at 55 px/m represent 4 and 5 m. Axis arrows have separate effective markers; graph is illustrative transverse displacement and is explicitly distinct from longitudinal sound task 03.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-wave-wavelength-{n:02}"
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
      "title":"Wave shape advances one wavelength per source period","reference":"From constant shape speed in a stationary homogeneous nondispersive medium derive λ=vT=v/f. Distinguish longitudinal air-particle motion, nonlinear input means and positive continuous scale freedom."}}



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
