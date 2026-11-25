"""Separate source-first review of Archimedes and floating equilibria.
No candidate authoring imports; signatures cover only exact individually read editions.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json"
EXPECTED_SKILL="C2-L004"
EXPECTED_PREREQUISITES=["C2-L001","C2-L002","C2-L004"]
CANDIDATE_REF='6c52128c2c2efa4ee4fe754f73179b711c02b4db'
REVIEWED_PACKAGE_SHA256='bd4414dbeaac62fea8db1fed406d9dce0a415c283e9252d220ba7cfbd73ca6e5'
REVIEWED_BINDINGS_SHA256='debfb559e0a01e154086d0960eeb0d753fa05a190f14967b7881fdec45eb34f6'
BATCH='loaded-raft-depth-088'
ASSET_NAME='loaded-raft-depth-steps.svg'
FALSE_PROOF='La massa propria del galleggiante può essere omessa perché non cambia tra le prove, quindi la quota immersa è sempre M/(rho A).'
SVG_MUTATION=(b'M100 1530L400 1380', b'M100 1580L400 1380')
EXPECTED_IDS={f"AR-u3-loaded-raft-depth-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-loaded-raft-depth-01": "98258d1ff1fbb81c427db80f6c390c70f92929238d67e5d3eba49061bd1539c0",
    "AR-u3-loaded-raft-depth-02": "c1ee096aa1b38487f9805531d16b1834eb95ab7391df0935cb34c51ce906fa3c",
    "AR-u3-loaded-raft-depth-03": "a7892bc1f4ec262c5afa12efd0867597b7a2d5bc10a5e04e4ae07231ac21a090",
    "AR-u3-loaded-raft-depth-04": "b8475b6db1ef32d0de15113bd76e2202af9e8973d2d120b0ab3b45f8e9dcfbfa",
    "AR-u3-loaded-raft-depth-05": "80075466ee44cb7c06cdec9c7eb4243d0a3fbe9c5f5946241b845033d6d0f66f",
    "AR-u3-loaded-raft-depth-06": "209785ee3fdab2124d21251cb250d88311c8b9d49c4b4c9bf8122ea0e976b528",
    "AR-u3-loaded-raft-depth-07": "98e765420301211758752ec30e1a0407620851ea7dfd2957ae60782dca3b5fb5",
    "AR-u3-loaded-raft-depth-08": "2524db972d0b24dff7336bc24a6e2ab9b0c02893f7a97017dc1da80773b20f25",
    "AR-u3-loaded-raft-depth-09": "14ce2f7b5939b47b45567fa505cfce329b940afb6c821d20f6a52117d0da583c",
    "AR-u3-loaded-raft-depth-10": "de9231fb293556c96b492576ee83f5d1f73fdf2126dc038435420404e0323546",
    "AR-u3-loaded-raft-depth-11": "72ec8fb74f4574fde66f0c706693be801686f17c0a4dd4a5189a715b4f896a12",
    "AR-u3-loaded-raft-depth-12": "9f879183a933ac159e18ff1e11ea227da434ca7e08566f6167a065a71c544e90",
    "AR-u3-loaded-raft-depth-13": "2a23030bb1df052c056a1885dd21d07e8b47a8ad27b9d289f9f922f25cb025dd",
    "AR-u3-loaded-raft-depth-14": "b983a867a3a54004d836b466997a169b4e72d9517576f2a57dbfce3c96d07494",
    "AR-u3-loaded-raft-depth-15": "3edd3b0b45ee80e2f75dfadd1c4f461d26956e3c1244c6ca220a4ab2fc992282",
    "AR-u3-loaded-raft-depth-16": "a2d8f109162b1a4612b3225c82bef5a097468d31514675ae7dbea8bf784991b9"
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
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and fit[q]>0 and first!=second
    quantity=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert quantity.magnitude==Fraction(gain)
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])

def physical_draft(cargo,area,height=4,density=1,own_mass=2):
    cargo,area,height,density,own_mass=map(Fraction,(cargo,area,height,density,own_mass))
    if min(cargo,area,height,density,own_mass)<=0:raise ValueError("Positive dry masses, base and liquid density required")
    h=(cargo+own_mass)/(density*area)
    if not 0<h<height:raise ValueError("Draft must remain strictly below total height")
    return h

def oracle():
    M,m0,rho,A,h,g,a,b,c=sp.symbols("M m0 rho A h g a b c",positive=True)
    law=sp.solve(sp.Eq(rho*A*h*g,(M+m0)*g),h)[0];inverse=sp.solve(sp.Eq(h,law),M)[0];area=sp.solve(sp.Eq(h,law),A)[0]
    ratio=sp.cancel(law.subs({M:a*M,A:b*A},simultaneous=True)/law);assert sp.simplify(ratio-(a*M+m0)/(b*(M+m0)))==0
    first=law.subs({M:2,m0:2,rho:1,A:2});second=law.subs({M:4,m0:2,rho:1,A:4});assert (first,second)==(2,sp.Rational(3,2))
    unit=(SI.Quantity(4,"kg")/(SI.Quantity(1,"kg/decimeter**3")*SI.Quantity(2,"decimeter**2"))).to("decimeter");assert unit.magnitude==2
    assert (first+second)/2-law.subs({M:3,m0:2,rho:1,A:3})==sp.Rational(1,12)
    q,z,decoded,affine=calibrate(first,second,6,sp.Rational(9,2),5,4,7,"decimeter");assert(q,z,decoded,affine)==(3,1,sp.Rational(3,2),3)
    constraint=sp.solve(sp.Eq(law.subs(M,c*A).subs({c:1,m0:2,rho:1}),2),A);assert constraint==[2]
    assert all(physical_draft(Mv,Av)<4 for Mv,Av in [(2,2),(4,2),(2,3),(4,4),(4,2)])
    return [first,"dm","h_i = (M + m₀) / (ρ A)","Da 2 a 3 dm",inverse.subs({h:2,rho:1,A:2,m0:2}),area.subs({M:2,m0:2,rho:1,h:2}),sp.Rational(2,3),4-first,"M = ρ A h_i − m₀","W / (κ₂ U)",second/first,(first+second)/2,area.subs({M:4,m0:2,rho:1,h:sp.Rational(3,2)})/2,inverse.subs({h:decoded,rho:1,A:4,m0:2}),inverse.subs({h:affine,rho:1,A:2,m0:2}),constraint[0]]

MANUAL=['Total mass is M + m₀ = 4 kg, requiring 4 dm³ displaced water. On a 2 dm² base this gives h = 2 dm, strictly below H = 4 dm.', 'Mass divided by density gives volume; dividing by area gives length. dm³/dm² = dm.', 'The displaced volume of a prism is Ah. Thus rho Ah = M + m₀ and h = (M + m₀)/(rho A). Both weights are included; g cancels.', 'Cargo changes from 2 to 4 kg while own mass stays 2 kg. Total mass changes from 4 to 6 kg; on 2 dm² the draft rises from 2 to 3 dm, both below H = 4 dm.', 'M = rho Ah − m₀ = 1·2·2 − 2 = 2 kg. The inverse also satisfies rho Ah > m₀ and h < H.', 'A = (M + m₀)/(rho h) = 4/(1·2) = 2 dm². No radius or side length is requested.', 'Fixed total mass of 4 kg means fixed displaced volume of 4 dm³. Bases of 2 and 3 dm² give drafts of 2 and 4/3 dm, hence ratio 2/3.', 'Proposal 4 dm minus correct 2 dm is +2 dm. Full-height immersion would displace 8 kg, rather than the required 4 kg.', 'M = rho Ah − m₀. The first term is displaced water mass; subtracting the physical own mass gives cargo. Both rho Ah > m₀ and h < H are required.', 'U = M + m₀ and W = aM + m₀ give h_B/h_A = W/(bU). The own mass does not scale with the cargo.', 'Total mass in B is 6 kg on 4 dm², giving h_B = 3/2 dm. Relative to h_A = 2 dm the ratio is 3/4.', 'Mean draft is (2 + 3/2)/2 = 7/4 dm. Mean inputs M = 3 kg and A = 3 dm² give 5/3 dm, smaller by 1/12 dm.', 'Target draft 3/2 dm with total mass 6 kg requires area 4 dm², twice the initial 2 dm². The target remains below H.', 'Gain 6/(2 dm) = 3 dm^−1. Reading 9/2 gives draft 3/2 dm. Area 4 dm² then displaces 6 kg, leaving 4 kg cargo after subtracting own mass.', 'Gain (4 − 5)/(3/2 − 2) = 2 dm^−1; offset is 1. Reading 7 gives draft 3 dm. Area 2 dm² displaces 6 kg, so cargo is 4 kg.', 'M = cA, with c = 1 kg/dm², gives A(rho h − c) = m₀. At h = 2 dm the coefficient is 1 kg/dm², yielding A = 2 dm² and M = 2 kg. A positive inverse requires rho h > c; fixed m₀ prevents cancellation.']
DISTRACTORS=['1 dm counts cargo alone. 4 dm is complete immersion, excluded here. The guide supplies no vertical support.', 'dm² is area, dm³ volume, kg mass and N force. Only dm is a height unit.', 'Omitting or subtracting own mass fails weight balance. The reciprocal is inverse length; omitting division by A gives volume.', '4 dm doubles own mass as well as cargo. Unchanged 2 dm ignores added cargo; 1 dm reverses its effect; zero cannot support positive mass.', '4 kg is total supported mass, not cargo. Adding own mass again gives 6 kg and full immersion here. Physical own mass is distinct from an instrument offset.', 'Omitting own mass gives 1 dm² and draft 4 dm rather than 2 dm. Volume must be divided by height to recover area.', '3/2 reverses the comparison; 4/3 is the new height number; 1/2 misses the new area of 3 dm²; 1 ignores the change.', '−2 reverses subtraction; 4 repeats the proposal; zero accepts it; 1 halves the error. Proposed 4 dm also violates strict freeboard.', 'Adding own mass counts it twice; no subtraction returns total mass. rho h/A has the wrong dimension; halving is arbitrary.', 'a/b incorrectly scales own mass. The product makes area a direct factor; the reciprocal swaps trials; W/U omits the area factor.', '1 forgets own mass and uses M/A. 4/3 reverses the result; 2 follows cargo alone; 1/2 follows area alone.', '7/2 is the sum, 7/8 halves twice, 5/3 is the mean-input trial, and 1/2 is the difference.', '1/2 reverses the ratio; 3/4 repeats the draft target; 3/2 follows total mass alone; 4 is the new area number.', 'Using raw reading 9/2 as dm exceeds H = 4 dm and available volume. 6 kg is total water-equivalent mass, not cargo.', 'At area 2 dm², cargo values 2, 3, 5 and 1 kg give readings 5, 6, 8 and 4, not 7. Instrument offset 1 is dimensionless, distinct from own mass 2 kg.', 'If rho h = c, positive own mass cannot be balanced. If rho h < c, the inverse area is negative. Here the denominator is positive, and fixed own mass prevents redundancy.']
ASSUMPTIONS=['Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.', 'Prismatic rigid closed impermeable raft, fixed own mass m₀ = 2 kg, positive constant base A, and total height H = 4 dm. Homogeneous quiet water has density 1 kg/dm³. Centered positive dry cargo M has no own buoyancy. An ideal frictionless lateral guide prevents tipping and supplies no vertical force. Vertical equilibrium requires 0 < h < H, equivalently M + m₀ < rho AH. Trials may change base and cargo.']
UNITS={1: 'decimeter', 2: 'decimeter', 3: 'decimeter', 4: 'decimeter', 5: 'kg', 6: 'decimeter**2', 7: 'dimensionless', 8: 'decimeter', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'decimeter', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'decimeter**2'}
NUMERIC_UNITS={1: 'dm', 5: 'kg', 6: 'dm²', 14: 'kg', 16: 'dm²'}
OPTION_SUFFIX={7: '', 8: ' dm', 11: '', 12: ' dm', 13: '', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 1580V1320', 'M100 1380H430', 'M60 340H280M340 340H560', 'M100 1580H500', 'M100 1530L400 1380'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M100 1580H500', 'M100 1580V1320'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 942, 60, 40), (100, 862, 60, 40), (100, 240, 100, 200), (160, 942, 120, 40), (160, 862, 60, 40), (380, 290, 100, 200)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(300, 1430), (400, 1380), (200, 1480), (100, 1530)}<=points:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Geometry uses 50 px/dm: a 2×1 dm base and 4 dm height give a 100×200 px front. Surface y340 crosses bottoms y440 and y490 at depths 100 and 150 px, or 2 and 3 dm. Cargo stays above water. Mass bars 60+60 and 60+120 px at 30 px/kg represent 4 and 6 kg. Graph origin (100,1580), with 50 px/kg horizontally and 50 px/dm vertically: open intercept (100,1530) gives M=0,h=1; solid points (200,1480) and (300,1430) give M=2,h=2 and M=4,h=3; open limit (400,1380) gives M=6,h=4, excluded. Full native rendering and all XML read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-loaded-raft-depth-{n:02}"
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
            if value!=wanted:errors.append("Independent hydrostatic conceptual key mismatch")
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
          "methods":["source_prompt_only_primary_Archimedes_Newton_and_geometric_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Prismatic raft draft with fixed own mass and strict freeboard","reference":"Independently balance displaced water mass against dry cargo plus fixed raft mass; retain positive cargo, geometric height bound and a guide that supplies no vertical force."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-02","U2-01")
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
