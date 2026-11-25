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
CANDIDATE_REF='bb1cbc913d605f8838cdeb96766074a570084519'
REVIEWED_PACKAGE_SHA256='06d538dd3b5458dda52c37e0bd55efff4bd554162ffcdb6302cfadfa24176c81'
REVIEWED_BINDINGS_SHA256='3a76ac7129d0e020e317a2f920375edbc228ce6d5e8604ea1faef490ea8ed3ef'
BATCH='poiseuille-flow-109'
ASSET_NAME='poiseuille-flow-steps.svg'
FALSE_PROOF='A salto di pressione e viscosità fissi la portata cresce soltanto come l’area del tubo, perché la velocità media resta invariata quando cambia il raggio.'
SVG_MUTATION=(b'r="60"', b'r="45"')
EXPECTED_SKILL='C2-L008'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L007', 'C2-L008']
EXPECTED_IDS={f"AR-u3-poiseuille-flow-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-poiseuille-flow-01": "5feb7b7e7d652c8ea4977c536bf40f5f2d5792610df013ae2e2eff1a002dc353",
    "AR-u3-poiseuille-flow-02": "ae5d2d48dbac7a2eb04e138ae9aa0618e2c06ca0ac5de9eb027ccfc28ccad0e6",
    "AR-u3-poiseuille-flow-03": "c827fcbefdd45605abdddb79d6cd1f2d4c600f741c6011ee728b57de2ee371bf",
    "AR-u3-poiseuille-flow-04": "875eb9332da6d16b0dcef406ab77e77e8244eae31812252d1c30cb5e4f4509bf",
    "AR-u3-poiseuille-flow-05": "d0896bd2622f990b8063f765fd7948397ef7d20281b4c8dded36b1df57e35453",
    "AR-u3-poiseuille-flow-06": "d01b543b4601cd8ba56dc2c175d8ce2d3ac43e34ad3777b5e90d7cc7568faf15",
    "AR-u3-poiseuille-flow-07": "f8d9136bb975b7c7ab4f62a1219fc1563f9cf7160ea696212d163377b24c6b00",
    "AR-u3-poiseuille-flow-08": "af53a7f951f0237a9bf25cb110ca0bf12d73d3b9cb977f8ca63be91817538c2e",
    "AR-u3-poiseuille-flow-09": "434d8da9a848dd409c14e3918c30f1a66ebad1b2caeba8a3e3ab8d2994d44190",
    "AR-u3-poiseuille-flow-10": "ba8d934d4c25e417709f1175a0c943814e1c5439928f0d828b726b2b66397489",
    "AR-u3-poiseuille-flow-11": "9906abd0262757163bc6cc530368c488841a48123c3735625ccb91e0c2e64275",
    "AR-u3-poiseuille-flow-12": "9007b6aa57c467be7a7a4c7d6cd5b6591c44f6adde0cacfd01a3344671b2dc24",
    "AR-u3-poiseuille-flow-13": "49256dc7fdbd4b355079b1fea715582cb3e5bc771d1f3792eb3278404b320085",
    "AR-u3-poiseuille-flow-14": "e55f0695b50ef1b1a094f0fe2894e38e3b80572c241c219cc40534a1a82b8455",
    "AR-u3-poiseuille-flow-15": "1ee3ef844b8bfae24ca41fc5e34668ace29dfd48a88d101cd5f176ea7d1021ce",
    "AR-u3-poiseuille-flow-16": "4d990805bb24005071bfa7801850c4e6e088370c73b12dcee9cf80b7567e668a"
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

def physical_flow(radius_cm,viscosity_mPas,pressure_drop=Fraction(2,25),length=1):
    r,eta,dp,L=map(Fraction,(radius_cm,viscosity_mPas,pressure_drop,length))
    if min(r,eta,dp,L)<=0:raise ValueError("Positive radius, viscosity, pressure drop and length required within the assigned laminar no-slip model")
    return sp.cancel(sp.pi*sp.Rational(r/100)**4*sp.Rational(dp)/(8*sp.Rational(eta/1000)*sp.Rational(L))*10**6)

def oracle():
    r,eta,dp,L,s,Q,x,z,a,b=sp.symbols("r eta dp L s Q x z a b",positive=True)
    profile=dp*(r*r-s*s)/(4*eta*L)
    physical_law=sp.integrate(2*sp.pi*s*profile,(s,0,r))
    assert sp.simplify(physical_law-sp.pi*r**4*dp/(8*eta*L))==0
    law=sp.cancel(physical_law.subs({r:x/100,eta:z/1000,dp:sp.Rational(2,25),L:1})*10**6)
    assert law==sp.pi*x**4/(10*z)
    inverse=sp.solve(sp.Eq(Q,law),x)[0];viscosity=sp.solve(sp.Eq(Q,law),z)[0]
    assert sp.cancel(law.subs({x:a*x,z:b*z},simultaneous=True)/law)==a**4/b
    first=law.subs({x:1,z:1});second=law.subs({x:2,z:2});mean=(first+second)/2
    exact_quantity=(SI.Quantity(sp.pi,"")*SI.Quantity(Fraction(1,100),"meter")**4*SI.Quantity(Fraction(2,25),"pascal")/(8*SI.Quantity(Fraction(1,1000),"pascal*second")*SI.Quantity(1,"meter"))).to("cm**3/second")
    assert sp.simplify(exact_quantity.magnitude-first)==0
    assert sp.simplify(mean-law.subs({x:sp.Rational(3,2),z:sp.Rational(3,2)}))==9*sp.pi/80
    q,offset,decoded,affine=calibrate(first,second,3*sp.pi/10,12*sp.pi/5,1+sp.pi/5,1+8*sp.pi/5,1+16*sp.pi/5,"cm**3/second")
    assert (q,offset,decoded,affine)==(3,1,4*sp.pi/5,8*sp.pi/5)
    coupled=sp.solve(sp.Eq(law.subs(x,z),sp.pi/10),z)[0];assert coupled==1
    return [first,"cm³/s","Fluido newtoniano incomprimibile, moto laminare stazionario sviluppato, tubo rigido circolare e aderenza alle pareti","Da π/10 a 8π/5 cm³/s",inverse.subs({Q:first,z:1}),viscosity.subs({Q:first,x:1}),sp.Rational(1,2),sp.Rational(4,16),"r = ⁴√[8ηLQ / (πΔp)]","κ₁⁴ / κ₂",second/first,mean,sp.Integer(2),inverse.subs({Q:decoded,z:2}),inverse.subs({Q:affine,z:1}),coupled]

MANUAL=['SI conversion gives r⁴ = 10⁻⁸ m⁴, eta = 10⁻³ Pa·s and dp = 2/25 Pa. Thus Q = pi·10⁻⁷ m³/s = pi/10 cm³/s, without approximating pi.', 'dp/eta has dimension inverse time and r⁴/L has dimension volume, giving cm³/s.', 'The parabolic no-slip profile in a straight rigid circular pipe requires a Newtonian incompressible fluid with uniform viscosity, steady fully developed laminar flow. The algebraic formula alone does not establish these conditions.', 'At fixed eta, dp and L, doubling radius gives a factor 2⁴ = 16: pi/10 becomes 8pi/5 cm³/s.', 'From r⁴ = 8eta LQ/(pi dp), exact pi cancels and r⁴ = 10⁻⁸ m⁴. Positive fourth root gives 1 cm.', 'eta = pi r⁴ dp/(8LQ). The numerical factors 8·10⁻¹⁰ over 8·10⁻⁷ give 10⁻³ Pa·s = 1 mPa·s after pi cancels.', 'At fixed radius, viscosity factor 2 divides Q by 2, giving pi/20 cm³/s and ratio 1/2.', 'This standalone trial fixes Q rather than dp. In dp = 8eta LQ/(pi r⁴), length factor 4 divided by radius factor 16 gives dp_B/dp_A = 1/4.', 'Isolate r⁴ then take the positive fourth root of the entire ratio. The radicand has length⁴ units and all supplied physical factors are positive.', 'At fixed dp,L, the joint ratio is a⁴/b for radius factor a and viscosity factor b. Both trials retain the assigned regime.', 'B at radius 2 cm and viscosity 2 mPa·s gives 4pi/5 cm³/s, ratio 8 to pi/10.', 'Mean outputs are (pi/10 + 4pi/5)/2 = 9pi/20 cm³/s. Mean inputs give 27pi/80, smaller by 9pi/80.', 'Radius factor 2 offers flow factor 16; target flow factor 8 requires viscosity factor 2.', 'Gain is (3pi/10)/(pi/10 cm³/s) = 3 s/cm³. Reading 12pi/5 decodes 4pi/5 cm³/s; at viscosity 2 the positive fourth-root radius is 2 cm.', 'Gain from reference differences is (7pi/5)/(7pi/10 cm³/s) = 2 s/cm³ and offset 1. Reading 1+16pi/5 decodes 8pi/5 cm³/s; at eta = 1 this gives r = 2 cm.', 'Normalize x = eta/(1 mPa·s); the dimensionful coupling gives r/(1 cm) = x. Then Q = (pi/10 cm³/s)x³. Target pi/10 fixes x³ = 1, the unique positive x = 1.']
DISTRACTORS=['pi/5 doubles, pi/20 halves; pi and 10pi lose unit-conversion factors. All values retain flow units but only pi/10 reconstructs the SI law.', 'cm/s is speed, mPa·s viscosity, cm² area and kg/s mass flow requiring a density. Constants pi and 8 are pure.', 'Turbulence, zero viscosity, varying tube radius or an arbitrary nonzero viscous flow at zero pressure drop do not satisfy the declared direct law.', 'pi/5 follows radius alone, 2pi/5 follows area alone, unchanged ignores geometry and pi/160 reverses the fourth-power effect.', 'The fourth-power number is not the radius. Negative real radius is outside geometry even if its fourth power matches.', 'Viscosity is inverse to Q at fixed dp and geometry; Pa alone omits time and density is not the requested material coefficient.', '2 reverses the viscosity effect, 1/4 spuriously squares eta, 1 ignores it and −1/2 violates positive flow under positive drop.', '4 follows only length; 16 reverses the radius dependence; 1/16 omits longer length and 1 falsely balances unequal factors.', 'Square root returns area, no root returns length⁴, reciprocal returns inverse length and an extra factor 2 outside the fourth root changes Q by 16.', 'First or second degree loses radius dependence; multiplying by viscosity reverses its effect, and the reciprocal swaps trials.', '16 ignores viscosity, 2 would treat viscosity as a direct factor and 1/8 reverses the result. Pressure drop is unchanged across these two trials.', '9pi/10 is sum, 9pi/40 halves twice, 7pi/10 is difference and 27pi/80 is the response at mean inputs.', 'Viscosity factor 1/2 would give flow factor 32; factor 8 would give factor 2 instead of 8. The geometric factor 16 is not itself the required viscosity factor.', 'Raw display contains a gain and is not Q. pi cancels exactly; radius 4 would mistake the square root of 16 for the fourth root.', 'At eta = 1, candidate radii 1,3,4 cm give readings 1+pi/5, 1+81pi/5, 1+256pi/5. Radius −2 is excluded even though its fourth power equals the positive answer.', 'Zero viscosity makes the law singular. A coupling between different dimensions needs c = 1 cm/(mPa·s); after substitution the dependence is cubic rather than quartic.']
ASSUMPTIONS=['Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.', 'Straight horizontal rigid circular pipe, uniform positive radius and Newtonian viscosity, incompressible monophase liquid, steady laminar fully developed flow and no slip. L = 1 m and dp = 0.08 Pa except the explicitly separate fixed-Q geometry comparison in 08. Entrance and fitting effects neglected; every compared state must preserve regime assumptions. Radius and viscosity are continuous positive quantities, not counts.']
UNITS={1: 'cm**3/second', 2: 'cm**3/second', 3: 'cm**3/second', 4: 'cm**3/second', 5: 'centimeter', 6: 'millipascal*second', 7: 'dimensionless', 8: 'dimensionless', 9: 'centimeter', 10: 'dimensionless', 11: 'dimensionless', 12: 'cm**3/second', 13: 'dimensionless', 14: 'centimeter', 15: 'centimeter', 16: 'millipascal*second'}
NUMERIC_UNITS={5: 'cm', 6: 'mPa·s', 11: '1', 13: '1', 14: 'cm', 16: 'mPa·s'}
OPTION_SUFFIX={1: ' cm³/s', 7: '', 8: '', 12: ' cm³/s', 15: ' cm'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M445 215H505', 'M160 215H190'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(120, 1185, 160, 30), (120, 1060, 20, 30)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(160, 215, 30), (445, 215, 60)}<=circles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Cross-section circles have radii 30 and 60 px at 30 px/cm, representing 1 and 2 cm and areas pi and 4pi cm². With fixed eta,L,dp, mean speed also gains factor 4, giving flow factor 16. SI conversions are printed exactly and pi is retained. Final normalized-flow bars 20 and 160 px at 20 px per unit Q/Q0 show the separate joint radius-and-viscosity comparison, factor 8. Bars are not radii. Full XML and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-poiseuille-flow-{n:02}"
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
      "title":"Developed laminar pipe flow with exact radius and viscosity conversions","reference":"Independently integrate the no-slip Newtonian parabolic profile over circular annuli to obtain Hagen–Poiseuille. Distinguish fixed pressure from the separate fixed-flow geometry comparison; preserve positive radius and viscosity."}}



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
