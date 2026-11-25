"""Separate source-first review of integer hydraulic networks, liquid inertia and interfacial force or energy.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-05.json"
CANDIDATE_REF='735da3c3331f856994af5bc0741a49877569b98d'
REVIEWED_PACKAGE_SHA256='eb0bf24ffa5c38b9daee03b9279d7752ae9ab8c83019a558da4f1f455ab24ca0'
REVIEWED_BINDINGS_SHA256='af5a93fd1fd3a601cf3b248b210c8bbf1984c0dd6789ad8e449d7c9e20ac2041'
BATCH='accelerating-liquid-column-121'
ASSET_NAME='accelerating-liquid-column-steps.svg'
FALSE_PROOF='La risultante sul liquido è la sola spinta sinistra di 11 N; la pressione sulla sezione destra non contribuisce al bilancio.'
SVG_MUTATION=(b'M540 325H440', b'M540 325H430')
EXPECTED_SKILL='C2-L001'
EXPECTED_PREREQUISITES=['C2-L001', 'C1-L005']
EXPECTED_IDS={f"AR-u3-accelerating-liquid-column-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-accelerating-liquid-column-01": "260c78e58fb9523639a0e0c34821270367b1b2d6bfebd4144769faf82a1e6fba",
    "AR-u3-accelerating-liquid-column-02": "7510cd0ff6d3bcdae493a1dedffea6ffb5bbeaf4a6fd161429bf25f7dc559076",
    "AR-u3-accelerating-liquid-column-03": "5186aee1cc57d3510b5cb1d09a379560d32af3e3c322d50ff9eac2dca1584118",
    "AR-u3-accelerating-liquid-column-04": "23fe8275731bc2b55943bc05e41fc7df9f28cd5e0cae85b31b437922f7982867",
    "AR-u3-accelerating-liquid-column-05": "bab14ebd1d705e60f078336bdb072dd72a3ebb9162b1e67b1ec54a6b37dff5e8",
    "AR-u3-accelerating-liquid-column-06": "245fb722ecb895f4a63979a0534c2120645a8543216505c5620f359a4dc57d04",
    "AR-u3-accelerating-liquid-column-07": "b92f08698a97a2adb066d2e72a4bbbbd1543f0c83ef24e2c03108ae3ec86c851",
    "AR-u3-accelerating-liquid-column-08": "1301611644f78bdf850286ccb7a42d8b51d2749f7965af0a30b3eb84815c59b4",
    "AR-u3-accelerating-liquid-column-09": "285985fcb94d98a759797ec49fa2911e483cefe4e99026e779f95f2065e09e22",
    "AR-u3-accelerating-liquid-column-10": "ec21f9aebb85e714bcc612bc4ebde5007145caa9509ecf23b649a3a707a98947",
    "AR-u3-accelerating-liquid-column-11": "5ebc8be65590ed7d70a3b125256a9c508a123f59a14681c69fafc3bac11d1d43",
    "AR-u3-accelerating-liquid-column-12": "064b5810bc5bec929d3ed94d684b3595f7433d58df78a0728d31afc851f7f6d9",
    "AR-u3-accelerating-liquid-column-13": "416c3b058732933f7b6cfdc762d07c372bd319c154e66940c7d43460560fda89",
    "AR-u3-accelerating-liquid-column-14": "a16aef7040a86945bee8b52761297f70f1da38f832af108fc03bb532e01e0593",
    "AR-u3-accelerating-liquid-column-15": "a0e3f5946bb2a5ccdef35673a0723ac1e183d80baf15891364e5f4c8b22c8b9b",
    "AR-u3-accelerating-liquid-column-16": "34e722da0e6f3e35c564c7318ae019b2079f9db0ece4a0aef300094378832b8e"
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

def physical_force(length,acceleration,rho=1000,area=Fraction(1,10000)):
    length,acceleration,rho,area=map(Fraction,(length,acceleration,rho,area))
    if min(length,acceleration,rho,area)<=0:raise ValueError("Positive column length, assigned axial acceleration, density and area required")
    return rho*area*length*acceleration

def oracle():
    rho,A,L,a,F,c,k1,k2=sp.symbols("rho A L a F c k1 k2",positive=True)
    mass=rho*A*L;law=mass*a
    length=sp.solve(sp.Eq(F,law),L)[0];acceleration=sp.solve(sp.Eq(F,law),a)[0]
    assert length==F/(rho*A*a) and acceleration==F/(rho*A*L)
    assert sp.cancel(law.subs({L:k1*L,a:k2*a},simultaneous=True)/law-k1*k2)==0
    fixed={rho:1000,A:sp.Rational(1,10000)}
    first=law.subs(fixed|{L:2,a:5});second=law.subs(fixed|{L:4,a:2})
    assert first==physical_force(2,5)==1 and second==physical_force(4,2)==sp.Rational(4,5)
    area=SI.Quantity(1,"centimeter**2").to("meter**2");assert area.magnitude==Fraction(1,10000)
    mass_si=(SI.Quantity(1000,"kilogram/meter**3")*area*SI.Quantity(2,"meter")).to("kilogram")
    assert mass_si.magnitude==Fraction(1,5)
    assert (mass_si*SI.Quantity(5,"meter/second**2")).to("newton").magnitude==1
    assert ((SI.Quantity(110,"kilopascal")-SI.Quantity(100,"kilopascal"))*area).to("newton").magnitude==1
    mean=(first+second)/2;at_mean=law.subs(fixed|{L:3,a:sp.Rational(7,2)})
    assert mean==sp.Rational(9,10) and at_mean-mean==sp.Rational(3,20)
    q,z,decoded,affine=calibrate(first,second,3,sp.Rational(12,5),3,sp.Rational(13,5),5,"newton")
    assert(q,z,decoded,affine)==(3,1,sp.Rational(4,5),2)
    root=sp.solve(sp.Eq(F,law.subs(L,c*a)).subs(fixed|{c:sp.Rational(2,5),F:1}),a)[0];assert root==5
    return [first,"N","F = ρ A L a","Da 1 a 2 N",length.subs(fixed|{F:1,a:5}),acceleration.subs(fixed|{F:1,L:2}),sp.Rational(2,5),2-first,"L = F / (ρ A a)","κ₁ κ₂",second/first,mean,sp.Rational(2,5),length.subs(fixed|{F:decoded,a:2}),length.subs(fixed|{F:affine,a:5}),root]

MANUAL=['1 cm² = 1/10000 m², so ρA = 1/10 kg/m. Length 2 m gives mass 1/5 kg and axial resultant (1/5)·5 = 1 N along +x.', 'Density times area times length gives kg; multiply by m/s² to obtain N. Pressure difference times area independently has the same force dimension.', 'Isolate the material liquid. The opposed pressure forces give (p₁−p₂)A = ma = ρALa; vertical weight and wall forces balance. F is not one pressure force or the weight.', 'Doubling L at fixed density, section and acceleration doubles mass and resultant: 1 N becomes 2 N.', 'F/a = 1/5 kg; dividing by ρA = 1/10 kg/m gives L = 2 m.', 'Mass 1/5 kg gives a = 1 N/(1/5 kg) = 5 m/s² along +x.', 'At unchanged mass the acceleration ratio 2/5 is the force ratio. B gives 2/5 N.', 'Proposal 2 N minus correct 1 N is +1 N. At the same mass the proposal would instead produce acceleration 10 m/s².', 'F = ρALa gives L = F/(ρAa). The denominator has unit N/m and must be positive; gravity is not the axial acceleration.', 'The length factor scales mass and the acceleration factor scales force per mass: F_B/F_A = κ₁κ₂.', 'B has mass 2/5 kg and acceleration 2 m/s², hence force 4/5 N and ratio 4/5 to A.', 'The equal-weight mean is (1 + 4/5)/2 = 9/10 N. Mean inputs 3 m and 7/2 m/s² give 21/20 N, greater by 3/20 N.', 'The target ratio 4/5 divided by mass ratio 2 gives acceleration ratio 2/5, so a_B = 2 m/s².', 'Gain 3 N⁻¹ converts reading 12/5 to force 4/5 N. Divide by acceleration 2 and by mass per length 1/10 to obtain 4 m.', 'Reference force difference 1/5 N and reading difference 2/5 give gain 2 N⁻¹, offset 1. Reading 5 means force 2 N and length 4 m at acceleration 5.', 'L = ca with c = 2/5 s² gives F = (1/25 kg·s²/m)a². Thus a² = 25 m²/s⁴ and the positive root is 5 m/s², giving L = 2 m.']
DISTRACTORS=['5 copies acceleration and 2 length, omitting mass. Using 10⁻² for the square-centimeter conversion makes mass one hundred times too large. Weight acts vertically.', 'Pa, kg, m/s² and N/m measure pressure, mass, acceleration and force per length rather than force.', 'Division by acceleration or length reverses the law or the mass dependence. Omitting A changes dimensions; replacing a with g gives vertical weight.', '1/2 makes longer liquid less massive, 4 squares a linear change, unchanged 1 ignores extra mass and zero cannot accelerate positive mass.', '1/5 is mass in kg, not length; multiplying mass by ρA produces kg²/m instead of m.', '1/5 copies mass, 1 copies force number and g would describe a different acceleration. Multiplying by mass does not isolate a.', '5/2 reverses states, 2 copies acceleration, 1 ignores change and 4/25 squares its linear factor.', '−1 reverses subtraction, 2 copies proposed force, 0 accepts it and 1/2 halves the error.', 'FρA/a repeats density conversion in the wrong direction; ρAa/F has inverse length, Fa/(ρA) changes dimensions and g substitutes weight for the net axial force.', 'Ratios reverse a direct dependence; acceleration squared is absent in Newton with independent inputs. Sum yields two for identical trials.', '5/4 reverses states, 2 uses mass only, 2/5 acceleration only, and 4/25 squares acceleration while omitting doubled mass.', '9/5 sums, 9/20 halves the mean again, 1/5 subtracts the two forces. 21/20 is a different response at mean inputs.', '5/2 reverses the sought ratio; 4/5 omits doubled mass, 2 copies a_B number and 1/5 would produce force ratio 2/5.', 'Raw reading used as newtons yields length 12 m and a display triple the required value.', 'At a = 5, lengths 2,5,6,8 m produce readings 3,6,7,9; only 4 m gives 5. Offset belongs to the display, not the physical force unit.', '25 is a² in the declared units; a negative root also implies negative L under the constraint. The relation compares distinct fixed-length trials, not stretching a material column.']
ASSUMPTIONS=['Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.', 'Inertial frame, homogeneous incompressible material column of fixed mass and length within a trial, straight horizontal tube of area 1 cm², common instantaneous positive axial acceleration along +x. No axial wall friction or deformation. Opposed end-section mean pressures generate axial resultant; vertical wall support balances gravity. F denotes positive resultant magnitude, not a single pressure force. No steady-motion assumption.']
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'meter', 6: 'meter/second**2', 7: 'dimensionless', 8: 'newton', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'meter/second**2'}
NUMERIC_UNITS={1: 'N', 5: 'm', 6: 'm/s²', 14: 'm', 16: 'm/s²'}
OPTION_SUFFIX={7: '', 8: ' N', 11: '', 12: ' N', 13: '', 15: ' m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 325H210', 'M320 305V325', 'M220 875H320', 'M220 1010H320', 'M320 380V360', 'M540 325H440'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M100 325H210', 'M320 305V325', 'M220 875H320', 'M220 1010H320', 'M320 380V360', 'M540 325H440'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1455, 80, 30), (220, 250, 200, 150), (100, 1330, 100, 30)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Column length 2 m is 200 px at 100 px/m; transverse section is explicitly enlarged schematically. Mean absolute end pressures 110 and 100 kPa over 1 cm² yield opposed forces +11 and −10 N, arrows 110 and 100 px at 10 px/N. At separately assigned illustrative g = 10 m/s², mass 1/5 kg has weight and vertical wall support 2 N, opposite arrows 20 px. Isolated net force panel changes scale to 100 px/N: 1 N is 100 px. Acceleration uses a separate 20 px/(m/s²): 5 is 100 px without equating the physical quantities. Final force bars 100 and 80 px give 1 and 4/5 N. All markers and full native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-accelerating-liquid-column-{n:02}"
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
            if value!=wanted:errors.append("Independent surface and network conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These individually reviewed interface and network choices extend the common unit table.
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
          "methods":["source_prompt_only_primary_network_balance_Newton_and_surface_force_or_energy","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Newton resultant of a material accelerating liquid column","reference":"Compute mass from SI density and volume, then apply the inertial-frame vector resultant to a fixed material column. Separate net axial force, individual pressure forces and vertical support."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-05","U2-01")
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
