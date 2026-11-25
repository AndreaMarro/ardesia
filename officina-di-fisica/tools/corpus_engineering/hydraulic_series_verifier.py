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
CANDIDATE_REF='95ed19cdc9882f5da812a96a98f2030fe99a4a6a'
REVIEWED_PACKAGE_SHA256='4ece0e0ba11a501d11eb9926acff35d62c69e532dc5116ba7cd5c63fe1980593'
REVIEWED_BINDINGS_SHA256='01bd8e657d8bd54279676566dbe5182c7fde40733b216d162c34ae7d5ae0cafe'
BATCH='hydraulic-series-110'
ASSET_NAME='hydraulic-series-steps.svg'
FALSE_PROOF='In due resistenze in serie la portata si divide fra i tratti, quindi la pressione totale deve essere divisa a metà anche se le resistenze sono diverse.'
SVG_MUTATION=(b'width="240"', b'width="180"')
EXPECTED_SKILL='C2-L009'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L008', 'C2-L009']
EXPECTED_IDS={f"AR-u3-hydraulic-series-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-hydraulic-series-01": "aa6ca4c5bf950621105686fbcbb0c78c22061ef016159edb9ef034fd6c747b89",
    "AR-u3-hydraulic-series-02": "f1781477dd999da1bfc66fab674c296426b2309ee7fe96168b5a5f720a7982d7",
    "AR-u3-hydraulic-series-03": "d84afa60778b18d48bff0cc573b53ee6a18f5c42bb7411fccf11a4ecccc6d9d8",
    "AR-u3-hydraulic-series-04": "df7dfd7715652e06f264f8863ce044fb1a9860ed425673e68187e5cc9fa8ff70",
    "AR-u3-hydraulic-series-05": "a3ed29e67425977d23915e0b9458fcb23216656f8e7c8644220ebccec6597d8f",
    "AR-u3-hydraulic-series-06": "b9cb948d54a4fe59e495c98dc2c593fd24786dba0fa19b8e4c0476f4cf7dcf92",
    "AR-u3-hydraulic-series-07": "7248d9051f141d8d2023132ea315c5bdb04776083fd9b9afe969950af72042f8",
    "AR-u3-hydraulic-series-08": "f99013631c99f98647f207cc53b0bb5057765586d8f69308246355d0a2060338",
    "AR-u3-hydraulic-series-09": "08ca72494b9039cad0c789e55ee589782dc7f78568f93352bd0ec84c9bb0c95d",
    "AR-u3-hydraulic-series-10": "cd804b14dabb4e2c335871caba2fa4883195ce7ec7ce329a6e2dd80305720288",
    "AR-u3-hydraulic-series-11": "2f2b10b1968990b601db79b5fb9aee09656c7c040e47dbaa09a46a0810c4ac2c",
    "AR-u3-hydraulic-series-12": "8f1f528252b8b26e6224b13643ac53fa1eec1b1a4e76ce3e700e7cc39a4f6945",
    "AR-u3-hydraulic-series-13": "c288dc45d224c8744b7a637bc62368c4ba11d7fa6d55d0ee35ebb83c1dbd0862",
    "AR-u3-hydraulic-series-14": "d746277e5804a9181d3eeaf35da7b9d990dae832e76ee97550fccb0eaff4983f",
    "AR-u3-hydraulic-series-15": "1651d942bbacba92f88c223bed49208c5f901668cee4d5c303057bf0b167f0e2",
    "AR-u3-hydraulic-series-16": "7d4a1e4fb40ebd77a8d3fadcab5fda2a046882ef34de77626506cb086569eb66"
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

def physical_series(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Two positive continuous passive resistances required")
    return first+second

def physical_first(total,known_second):
    total,known_second=map(Fraction,(total,known_second))
    if not total>known_second>0:raise ValueError("Series inverse needs total greater than known positive component")
    return total-known_second

def pressure_partition(first,second,total_drop):
    first,second,total_drop=map(Fraction,(first,second,total_drop))
    if min(first,second,total_drop)<=0:raise ValueError("Positive pressure drop and passive resistances required")
    flow=total_drop/(first+second)
    return flow,first*flow,second*flow

def oracle():
    R1,R2,E,Q,a,b,c=sp.symbols("R1 R2 E Q a b c",positive=True)
    pa,pb,pc=sp.symbols("pa pb pc",real=True)
    assert sp.expand((pa-pb)+(pb-pc))==pa-pc
    law=sp.cancel((R1*Q+R2*Q)/Q);inverse=sp.solve(sp.Eq(E,law),R1)[0]
    first=law.subs({R1:2,R2:3});second=law.subs({R1:4,R2:6});mean=(first+second)/2
    assert sp.cancel(law.subs({R1:a*R1,R2:b*R2},simultaneous=True)/law)==(a*R1+b*R2)/(R1+R2)
    assert mean==law.subs({R1:3,R2:sp.Rational(9,2)})
    assert SI.Quantity(1,"kilopascal*second/liter").to("pascal*second/meter**3").magnitude==10**6
    flow,drop1,drop2=pressure_partition(2,4,12);assert(flow,drop1,drop2)==(2,4,8)
    assert (SI.Quantity(2,"kilopascal*second/liter")*SI.Quantity(2,"liter/second")).to("kilopascal").magnitude==4
    q,z,decoded,affine=calibrate(first,second,15,30,11,21,15,"kilopascal*second/liter");assert(q,z,decoded,affine)==(3,1,10,7)
    constrained=sp.solve(sp.Eq(law.subs(R1,sp.Rational(2,3)*R2),5),R2)[0];assert constrained==3
    return [first,"kPa·s/L","R_eq = R₁ + R₂","Da 5 a 7 kPa·s/L",inverse.subs({E:5,R2:3}),sp.Rational(drop1),sp.Rational(8,5),10-first,"R₁ = R_eq − R₂","(κ₁ R₁ + κ₂ R₂) / (R₁ + R₂)",second/first,mean,sp.Integer(2),inverse.subs({E:decoded,R2:6}),inverse.subs({E:affine,R2:3}),constrained]

MANUAL=['The common positive flow sees drops R₁Q and R₂Q. Total drop divided by Q gives R_eq = 2 + 3 = 5 kPa·s/L.', 'Resistance is pressure divided by volume flow, with dimensions M L⁻⁴ T⁻¹. kPa·s/L is exactly 10⁶ Pa·s/m³.', '(p_a−p_b)+(p_b−p_c)=p_a−p_c. With common Q and no extra junction losses, R_eq = R₁+R₂.', 'Keeping R₂ = 3, the first resistance 2 to 4 changes total 5 to 7 kPa·s/L.', 'R₁ = R_eq − R₂ = 5 − 3 = 2 kPa·s/L; total must strictly exceed the known passive component.', 'This separate partition case uses R₁ = 2,R₂ = 4 and total drop 12 kPa. Sum resistance 6 gives common Q = 2 L/s; first and second drops are 4 and 8 kPa.', 'At R₁ = 2, raising R₂ from 3 to 6 gives totals 5 and 8 kPa·s/L, ratio 8/5.', 'Proposal minus correct is 10 − 5 = +5 kPa·s/L.', 'Subtract the known second resistance from the total. The inverse requires R_eq > R₂ > 0 to retain a positive first element.', 'Scale each addend first: the total ratio is (aR₁+bR₂)/(R₁+R₂), retaining its initial resistance weights.', 'The two addends both double, so total changes 5 to 10 kPa·s/L and ratio is 2.', 'Mean totals (5+10)/2 = 15/2 kPa·s/L. Mean inputs 3 and 9/2 give the same by linear addition.', 'Target total 10 at known R₁,B = 4 leaves R₂,B = 6 kPa·s/L; ratio to original 3 is 2.', 'Gain 15/(5 kPa·s/L) = 3 L/(kPa·s). Reading 30 decodes total 10, minus R₂ = 6 leaves R₁ = 4.', 'Gain (21−11)/(10−5) = 2 L/(kPa·s), offset 1. Reading 15 decodes total 7; minus known 3 leaves R₁ = 4 kPa·s/L.', 'R₁=(2/3)R₂ makes total (5/3)R₂ = 5 kPa·s/L. Thus R₂ = 3 and R₁ = 2 uniquely; these are continuous material/geometric coefficients, not integer counts.']
DISTRACTORS=['6/5 belongs to a parallel connection; 2 and 3 are individual contributions and 10 repeats the sum twice. Positive series total exceeds either component.', 'kPa is pressure, L/s flow and Pa·s viscosity; L/(kPa·s) is conductance, the inverse resistance.', 'Product over sum is parallel; difference can falsely cancel passive elements; half-sum is an average and product has resistance-squared dimensions.', '10 doubles both elements, unchanged 5 ignores the first change, 1 subtracts elements and 5/2 decreases a total after adding resistance.', '8 adds an already counted component; −2 reverses subtraction and violates passivity. A resistance alone is not a pressure drop without Q.', '8 kPa is the second drop, 6 wrongly halves pressure between unequal resistances, 2 copies the flow number and 12 is total pressure drop.', '5/8 is reciprocal, 2 doubles the unchanged first component, 6/5 compares only the new second resistance to old total and 1 ignores the increase.', '−5 reverses error, 10 copies proposal, zero accepts it and 5/2 halves it. At Q = 1 L/s the components require only 5 kPa, not the proposed 10.', 'Addition counts R₂ again; reversed subtraction is negative; quotient is dimensionless and the parallel inverse is negative in this declared series domain.', 'The product ignores addition; sum of pure factors gives 2 for unchanged trials; reciprocal swaps states and subtraction removes a genuinely positive drop.', '4 multiplies scaling factors acting on separate addends; 1/2 is reciprocal and 10 copies the new total number.', '15 is sum, 15/4 halves twice and 17/2 or 13/2 shifts the exact mean by one resistance unit. Mean-input equivalence is valid here, not a universal error.', '6 is the new second-resistance number rather than ratio, 1/2 reverses states and 4 repeats the doubling. Target must exceed the known first component.', 'Raw display 30 used as a resistance gives first component 24, not 4. Total 10 must still have the known component removed.', 'At second resistance 3, first resistances 8,2,5,3 give readings 23,11,17,13. Only 4 gives 15; display offset is not a physical resistance to subtract directly.', '6 doubles the required second resistance, 3/2 halves it, 2 swaps element roles and 4 does not close total 5. No integrality condition applies.']
ASSUMPTIONS=['Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.', 'Two passive positive linear hydraulic resistances in a horizontal single path. Steady incompressible flow, no branching, leakage or intermediate storage; common Q > 0. Pressure taps have equal elevation and kinetic contributions, ideal junctions and no extra machine or unassigned loss. Component values are constant during each trial and continuous across preparations.']
UNITS={1: 'kilopascal*second/liter', 2: 'kilopascal*second/liter', 3: 'kilopascal*second/liter', 4: 'kilopascal*second/liter', 5: 'kilopascal*second/liter', 6: 'kilopascal', 7: 'dimensionless', 8: 'kilopascal*second/liter', 9: 'kilopascal*second/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal*second/liter', 13: 'dimensionless', 14: 'kilopascal*second/liter', 15: 'kilopascal*second/liter', 16: 'kilopascal*second/liter'}
NUMERIC_UNITS={1: 'kPa·s/L', 5: 'kPa·s/L', 11: '1', 13: '1', 14: 'kPa·s/L', 16: 'kPa·s/L'}
OPTION_SUFFIX={6: ' kPa', 7: '', 8: ' kPa·s/L', 12: ' kPa·s/L', 15: ' kPa·s/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M505 250H585', 'M295 250H375', 'M65 250H145'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M505 250H585', 'M295 250H375', 'M65 250H145'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(390, 225, 100, 50), (160, 575, 90, 30), (220, 1300, 240, 32), (180, 225, 100, 50), (100, 575, 60, 30), (100, 750, 120, 30), (220, 750, 180, 30), (100, 1300, 120, 32)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Three separate common-flow arrows each 80 px at 40 px/(L/s) represent Q = 2 L/s through schematic blocks. Absolute pressures 110,106,100 kPa give drops 4 and 6, total 10. Resistance bars 60+90 px at 30 px/(kPa·s/L) give 2+3=5; pressure bars 120+180 px at 30 px/kPa give 4+6=10. The third separate case R₁=2,R₂=4 uses pressure bars 120+240 px for 4+8=12 kPa. Distinct quantity scales are explicit; all labels, XML, separate markers and full native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-hydraulic-series-{n:02}"
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
      "title":"Common flow and telescoping pressure drops in series","reference":"Independently conserve volume through the single path and eliminate the intermediate node pressure. Resistance is additive; inverse positivity and the separate pressure partition follow from the same common flow."}}



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
