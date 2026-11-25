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
CANDIDATE_REF='5bc115f86c5285381051d555e691ff4aeb21a8da'
REVIEWED_PACKAGE_SHA256='d6605fda732ef4b7895462347494872b54ef27f5b3556da1d1a1f2052483fde1'
REVIEWED_BINDINGS_SHA256='6d6d94d935b9224e4d699edcddd6c585447e0ac6c31029f4ff3417a75d34c15b'
BATCH='sound-decibel-142'
ASSET_NAME='sound-decibel-progressive.svg'
FALSE_PROOF='Un livello nullo implica intensità nulla perché moltiplicare zero decibel per il riferimento dà zero watt al metro quadrato.'
SVG_MUTATION=(b'M320 625V655', b'M370 625V655')
EXPECTED_SKILL='C5-L05'
EXPECTED_PREREQUISITES=['C5-L02', 'C5-L04', 'C5-L05']
EXPECTED_IDS={f"AR-u4-sound-decibel-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-sound-decibel-01": "9553811e8ca8f8b0a83adb78d43e33698a1e08ca14e0a1c5a5be7fa9b9259c09",
    "AR-u4-sound-decibel-02": "6dfe89d734852087741598afeeabdd63ec5e3e3ac970448c37dcc8d7fc960a9b",
    "AR-u4-sound-decibel-03": "b41ffe8642b8ce6af129eb270589c5e4c5444e5aca2935e0b3313e8ba9787170",
    "AR-u4-sound-decibel-04": "28c5836452f0778833169d64cf73c28f6c826bbb4d8987233f9165e89856a663",
    "AR-u4-sound-decibel-05": "fe23488fbde72a46dcea108a3cae7e4b2b13b05c7cbd587ab3a1c4326a9fc0dd",
    "AR-u4-sound-decibel-06": "00d60a9e0ac7cc3a4f53fcc2d673ecaa2c11e19283076ee139cdda32864d9d74",
    "AR-u4-sound-decibel-07": "67f549313564946c8b9047aab088c8eb5dcf5dc0d3aa5dde93342768dd92db5e",
    "AR-u4-sound-decibel-08": "5cf2a35c018f5d9001c791e62c39a1873d04efb15a11058cd9a524dd4806ad16",
    "AR-u4-sound-decibel-09": "795b859e306b85bf613085cf9dcd585fe49cd2a25b62760321697952f757b875",
    "AR-u4-sound-decibel-10": "af78122d43e9ac81103c123a14c761a9d922ab3fe87651c46e4a51025edbeab1",
    "AR-u4-sound-decibel-11": "3f93c978041fee4e3ef46ee91b7dfa210cae3950622f9a75066945dfb08e0690",
    "AR-u4-sound-decibel-12": "b05111b81de5ac5a48bd2f56264a480839fb0234696f68ab4c4c47353e417117",
    "AR-u4-sound-decibel-13": "9bc17b1279e6904c0381623b54bd1e25c2105bf23ff7ecb82f68ef489b85aacd",
    "AR-u4-sound-decibel-14": "a8187c2340f899d82ad3ff2259cc67ec5d1002e667eac66c5ddee78af9f03ebc",
    "AR-u4-sound-decibel-15": "65aab86b981360b1d93e03189d360e8508c42713d5c156e9ce2837c994511046",
    "AR-u4-sound-decibel-16": "005c2898699662d70d5cd6079b727b08f70be240f86bbcb86c7f4d8b189a8b19"
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

def physical_level(intensity,reference,positive_level=True):
    """Numerical coefficient of dB, not a multiplicative Pint intensity quantity."""
    intensity,reference=map(Fraction,(intensity,reference))
    if min(intensity,reference)<=0:raise ValueError("Positive intensity and positive explicitly assigned reference required")
    if positive_level and intensity<=reference:raise ValueError("This common branch requires strictly positive numerical level")
    return sp.simplify(10*sp.log(sp.Rational(intensity)/sp.Rational(reference))/sp.log(10))

def intensity_from_level(level,reference,positive_level=True):
    reference=Fraction(reference)
    if reference<=0:raise ValueError("Positive reference required")
    if isinstance(level,(int,Fraction,sp.Rational)):level=sp.Rational(level)
    elif not isinstance(level,sp.Expr):raise ValueError("Exact numeric level expression required")
    if level.is_real is not True or level.is_finite is not True:raise ValueError("Finite real numerical level required")
    if positive_level and level<=0:raise ValueError("This common branch requires positive numerical level")
    return sp.simplify(sp.Rational(reference)*10**(level/10))

def oracle():
    I,Ir,R,a,b=sp.symbols("I Ir R a b",positive=True)
    law=10*sp.log(I/Ir)/sp.log(10)
    inverse=Ir*10**(sp.Symbol("ell",real=True)/10)
    assert sp.simplify(sp.log(inverse/Ir)/sp.log(10)-sp.Symbol("ell",real=True)/10)==0
    assert sp.expand_log(sp.log(a*R/b),force=True)==sp.log(a)+sp.log(R)-sp.log(b)
    first=physical_level(1000,10);second=physical_level(10,1)
    assert (first,second)==(20,10)
    assert (SI.Quantity(1000,"picowatt/meter**2")/SI.Quantity(10,"picowatt/meter**2")).to("").magnitude==100
    assert SI.Quantity(1000,"picowatt/meter**2").to("watt/meter**2").magnitude==Fraction(1,10**9)
    assert physical_level(1,1,False)==0 and intensity_from_level(0,10,False)==10
    assert physical_level(1,10,False)==-10
    # Gain acts on ell=L/(1 dB); no multiplicative Pint conversion of a logarithmic dB quantity.
    q,z,decoded,affine=calibrate(first,second,60,30,41,21,61,"dimensionless")
    assert(q,z,decoded,affine)==(3,1,10,30)
    assert intensity_from_level(physical_level(2,1),1)==2  # original non-power-of-ten source, not assumed away
    k=sp.symbols("k",positive=True)
    assert sp.simplify(law.subs({I:100*k,Ir:k}))==20
    mean=(first+second)/2
    assert mean==15 and sp.simplify(mean-physical_level(505,Fraction(11,2)))!=0
    return [first,"Unità logaritmica di un rapporto adimensionale","No: stesso livello fisico non impone uguale sensazione a frequenze diverse","Da 20 a 30 dB, aumentando di 10 dB",intensity_from_level(20,10),sp.Integer(10),sp.Rational(3,2),sp.Integer(1),"I = Iᵣ 10^(ℓ/10)","log₁₀(R_B) / log₁₀(R)",second/first,mean,sp.Rational(1,10),intensity_from_level(decoded,1),intensity_from_level(affine,10),"Infinite coppie: qualunque Iᵣ>0 con I=100 Iᵣ"]

MANUAL=['In the delivered pW/m² parametrization, intensity ratio 1000/10 is exactly 100=10². The numerical level coefficient is 20 and the level label is 20 dB; the common power unit cancels.', 'A decibel is a logarithmic unit for a dimensionless ratio, rather than an SI intensity, pressure, energy or frequency unit. The reference is needed to recover absolute intensity.', 'Equal intensities and equal references give equal physical intensity levels. Unequal frequencies can still produce different perceived loudness; the candidate makes no clinical or weighted-level claim.', 'Increasing intensity from 1000 to 10000 pW/m² at reference 10 changes ratio from 100 to 1000, hence level from 20 to 30 dB, an increment of 10 dB.', 'Exponentiating numerical level 20 divided by ten gives ratio 100. Multiply by reference 10 pW/m² to obtain intensity 1000 pW/m².', 'Level 20 fixes ratio 100, so intensity 1000 pW/m² divided by 100 gives reference 10 pW/m².', 'At fixed intensity 1000 pW/m², reference 10 gives level 20 dB and reference 1 gives 30 dB. Ratio of the nonzero numerical levels is 3/2, not an intensity ratio.', 'The standalone boundary replaces the common strict positive-level condition. Level zero implies ratio 10⁰=1, so intensity equals its positive reference and is not zero.', 'For numerical coefficient ℓ=L/(1 dB), divide by ten, exponentiate base ten, then multiply the pure ratio by the positive reference: I=Iᵣ10^(ℓ/10).', 'At ratios R>1 and R_B>1, both levels have the same factor ten. Their quotient is log₁₀(R_B)/log₁₀(R); the first denominator is nonzero because R>1.', 'The author explicitly changed delivered B from original ratio 2 to ratio 10. Independently evaluated levels are 20 and 10 dB, giving delivered ratio 1/2; the original exact log₂ expression is preserved separately in the pre-key primary record.', 'Delivered levels 20 and 10 dB have arithmetic mean 15 dB. It is a statistic of differently referenced levels, not a sum of simultaneous source intensities. Average input intensities 505 and reference 11/2 pW/m² would give a different logarithmic value.', 'Delivered target is half of 20 dB, hence 10 dB and ratio ten. With delivered intensity 10 pW/m² the reference is 1 pW/m², one tenth of the original reference 10.', 'Gain 60/20=3 acts per numerical dB coefficient and decodes display 30 as level 10 dB. New reference 1 pW/m² then gives intensity 10 pW/m².', 'Delivered level references 20 and 10, display readings 41 and 21, give gain 2 and offset 1. Reading 61 decodes level 30 dB. Reference 10 pW/m² times 10³ gives intensity 10000 pW/m².', 'Constraint I=100Iᵣ already fixes level 20 dB at every positive reference. The additional observation is redundant; a common positive scaling leaves infinitely many continuous pairs, not an absolute intensity measurement.']
DISTRACTORS=['100 is the pure intensity ratio, 2 its logarithm before multiplication by ten and 30 ignores division by the reference. The logarithm must not retain units in its argument.', 'W/m² describes intensity, Pa pressure, J energy and Hz frequency. A logarithmic dimensionless level is not interchangeable with any of those quantities.', 'Equal intensity need not mean identical perceived loudness across frequencies. Logarithms do not flatten auditory response; conversely equal physical intensity and reference do give equal physical levels.', '200 transfers a multiplicative intensity factor to the level, 21 omits the coefficient ten in the increment, 20 ignores the change and 10 reverses it.', '200 multiplies reference by the level number without exponentiating. 100 copies the pure ratio. A below-reference intensity would give negative, not positive, level.', '100000 multiplies by ratio instead of dividing. 50 divides intensity by numerical level rather than its exponential. The reference retains intensity units.', '10 compares inverse references or intensity ratios, 1/10 reverses that comparison, 2/3 reverses levels and 1 ignores the changed reference. None measures relative loudness.', 'Zero intensity is outside the logarithm domain. Ratios 10 and 100 give 10 and 20 dB; 1/10 gives −10 dB, whereas zero level is ratio one.', 'A linear factor ℓ/10 does not invert the logarithm; inverse-reference units are wrong, exponent 10ℓ is wrong and another logarithm is not the inverse operation.', 'R_B/R and κ₁/κ₂ compare ratios before taking logs; the inverse log quotient swaps trials. A log of the ratio gives a difference of logs, not their quotient.', '1/100 follows delivered intensities, 1/10 their reference-normalized ratios, 2 reverses levels and 1 ignores the different exponents.', '30 is the sum, 10 and 20 only one trial, and 3/2 a ratio rather than a mean. The candidate does not claim an energetic average from differently referenced level numbers.', '1/2 treats the reference effect linearly, 10 reverses the required reference ratio, 1/100 follows intensity alone and 2 reverses the target level factor.', '30 is raw display rather than level; using old reference 10 instead of new reference 1 gives intensity 100 pW/m². Gain is interpreted by the stated numerical level convention.', '1000 copies reference-trial intensity, 100 uses ratio ten and 10 copies the reference. 300 multiplies level number by reference without exponentiation; only 10000 reconstructs the displayed level.', 'One pair invents an absolute scale. Zero reference is forbidden, and two examples do not exhaust the continuous positive family. The two given ratio conditions are consistent and redundant.']
ASSUMPTIONS=['Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.', 'Positive physical intensity and explicitly assigned positive reference expressed in the same unit; the logarithm acts on their dimensionless ratio. The common branch is I>Iᵣ, while standalone08 explicitly admits equality. Numerical fixtures are openly reparameterized in pW/m² and exact powers of ten, with symbols and targets retained. Displays are affine in the numerical level coefficient, not in intensity. Perception03 is separately conceptual and does not assert a clinical result.']
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'picowatt/meter**2', 6: 'picowatt/meter**2', 7: 'dimensionless', 8: 'dimensionless', 9: 'picowatt/meter**2', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'picowatt/meter**2', 15: 'picowatt/meter**2', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'dB', 5: 'pW/m²', 6: 'pW/m²', 14: 'pW/m²'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: ' dB', 13: '', 15: ' pW/m²'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M120 640H420', 'M420 625V655', 'M120 625V655', 'M320 625V655', 'M220 625V655'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not set()<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(320, 640, 9)}<=circles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'At origin x120 the level is zero and ratio R is one. Equal 100 px intervals to x220,320,420 represent 10,20,30 dB at 10 px/dB and logarithmic ratio values 10,100,1000. The highlighted point (320,640) is R=100 and level20 dB. Ratio scale is explicitly logarithmic rather than linear intensity; the boundary zero level is not zero intensity. Complete XML and full native image read; all tick positions and both rows of labels match their declared scales.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-sound-decibel-{n:02}"
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
      "title":"Exact numerical logarithmic level with an assigned reference","reference":"Form a dimensionless positive intensity ratio before its logarithm. Derive the inverse by exponentiation and calibrate the numerical level coefficient; treat zero dB and unequal-frequency perception as separate tasks. Independently recompute every changed power-of-ten parameter."}}



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
