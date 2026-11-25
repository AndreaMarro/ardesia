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
CANDIDATE_REF='04b3f6e9586469ebea94c2cb0315bfc15152da45'
REVIEWED_PACKAGE_SHA256='a963867672786acb018dfac317abf7c77099742ae078f131762c353faaa3a3db'
REVIEWED_BINDINGS_SHA256='d4dc6531910482c11977065f5940d918c4e083fa9e154dd2c0d3e7254a79b509'
BATCH='hydraulic-parallel-111'
ASSET_NAME='hydraulic-parallel-steps.svg'
FALSE_PROOF='Chiudere il secondo ramo a differenza di pressione invariata obbliga il primo ramo a ricevere tutta la portata totale iniziale, quindi Q1 aumenta.'
SVG_MUTATION=(b'width="80"', b'width="120"')
EXPECTED_SKILL='C2-L009'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L008', 'C2-L009']
EXPECTED_IDS={f"AR-u3-hydraulic-parallel-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-hydraulic-parallel-01": "484019586cb5ed646c25e43673a5a332baaaa18ae8b8dafb6c851d16958951cd",
    "AR-u3-hydraulic-parallel-02": "93f1f385efd31da853ff14eeb2a6a58e2c3a5f4d4e007deb90b2aa705e4a876f",
    "AR-u3-hydraulic-parallel-03": "5c9ef9510b23a4410bb5d422efb58842ec6fecf542696f4ce4411364ccb5b5ba",
    "AR-u3-hydraulic-parallel-04": "089cbe29b969b6e3aef4bdc70d10f6de390bcb1522797daf3b2250812f70af74",
    "AR-u3-hydraulic-parallel-05": "47a968a67cab9bd00552f8129c00322cdc357e8938d84920719b2e8f3d59f2ee",
    "AR-u3-hydraulic-parallel-06": "b7511fca84916dff62ee487a303efbfdb739e1b66704ccd6f1a9d4a98afb1677",
    "AR-u3-hydraulic-parallel-07": "2a1d942239443b77562108da4d8d73a6385e8e805a9dc8ad6c4d3768324921df",
    "AR-u3-hydraulic-parallel-08": "713c7e15a25513944ef77736016cf2f050723e441d43f003844a0d5e7026e4b8",
    "AR-u3-hydraulic-parallel-09": "11747eae6745fb72b4fb0d6c082c79f0c7df334804aa7639b2222461ab7f7a6a",
    "AR-u3-hydraulic-parallel-10": "9ceab696ae68278240ddef45fff1b074f97a3382c66572999425eadefbfb76c2",
    "AR-u3-hydraulic-parallel-11": "81ef5b64853b94556290e7096ba9c75423546211833178b7c0e837649efc4fe7",
    "AR-u3-hydraulic-parallel-12": "762977374744be2120e827a73167353a6beb56946a211b6f46d842a657147961",
    "AR-u3-hydraulic-parallel-13": "521a749aa38b7084753145750892b3aadeeab6aaadfe56d9bf9acf05b9b579a5",
    "AR-u3-hydraulic-parallel-14": "5094a8627dffb44d660f28f90465061debb0e95f2cf753a15b13345d7728a602",
    "AR-u3-hydraulic-parallel-15": "818256f44ebc7db32e06af9f7b250cc4b194ee52881283c066095a845159ac83",
    "AR-u3-hydraulic-parallel-16": "7ca12cc4252927b6c7c0bd1ebbd478eeb24e91568a8cde118bdf340aaa6d50fa"
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

def physical_parallel(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Two finite positive continuous passive branch resistances required")
    return first*second/(first+second)

def physical_first(equivalent,known_second):
    equivalent,known_second=map(Fraction,(equivalent,known_second))
    if not 0<equivalent<known_second:raise ValueError("Parallel inverse needs zero < equivalent < known finite resistance")
    return equivalent*known_second/(known_second-equivalent)

def oracle():
    R1,R2,E,dp,a,b,c=sp.symbols("R1 R2 E dp a b c",positive=True)
    total_flow=dp/R1+dp/R2;law=sp.cancel(dp/total_flow)
    inverse=sp.solve(sp.Eq(E,law),R1)[0]
    assert sp.cancel(inverse-E*R2/(R2-E))==0
    assert sp.cancel(law.subs({R1:a*R1,R2:b*R2},simultaneous=True)/law-a*b*(R1+R2)/(a*R1+b*R2))==0
    first=law.subs({R1:2,R2:2});second=law.subs({R1:3,R2:6});mean=(first+second)/2
    assert mean-law.subs({R1:sp.Rational(5,2),R2:4})==-sp.Rational(1,26)
    quantity=(SI.Quantity(6,"kilopascal")/(SI.Quantity(6,"kilopascal")/SI.Quantity(2,"kilopascal*second/liter")+SI.Quantity(6,"kilopascal")/SI.Quantity(2,"kilopascal*second/liter"))).to("kilopascal*second/liter");assert quantity.magnitude==1
    assert sp.limit(total_flow,R2,sp.oo)==dp/R1
    q,z,decoded,affine=calibrate(first,second,3,6,3,5,sp.Rational(17,5),"kilopascal*second/liter");assert(q,z,decoded,affine)==(3,1,2,sp.Rational(6,5))
    equal=sp.solve(sp.Eq(law.subs(R1,R2),1),R2)[0];assert equal==2
    return [first,"kPa·s/L","R_eq = R₁ R₂ / (R₁ + R₂)","Da 1 a 6/5 kPa·s/L",inverse.subs({E:1,R2:2}),"Q₁ resta uguale; Q_T diminuisce",sp.Rational(3,2),2-first,"R₁ = R_eq R₂ / (R₂ − R_eq)","κ₁ κ₂ (R₁ + R₂) / (κ₁ R₁ + κ₂ R₂)",second/first,mean,sp.Integer(3),inverse.subs({E:decoded,R2:6}),inverse.subs({E:affine,R2:2}),equal]

MANUAL=['At equal resistances 2 each, total conductance is 1/2+1/2 = 1 in reciprocal resistance units. Thus R_eq = 1 kPa·s/L, half either branch.', 'Pressure divided by total volume rate gives kPa·s/L, with dimensions M L⁻⁴ T⁻¹ independent of connection topology.', 'At common dp, Q_T = dp(1/R₁+1/R₂). Divide dp by Q_T and invert the reciprocal sum to obtain product over sum.', 'R₁ = 3,R₂ = 2 gives product 6 over sum 5, R_eq = 6/5 kPa·s/L rather than initial 1.', 'R₁ = R_eq R₂/(R₂−R_eq) = (1·2)/(2−1) = 2 kPa·s/L. The strict inverse bound 0 < R_eq < R₂ holds.', 'At unchanged dp and R₁, Q₁ = dp/R₁ is unchanged. Closing branch 2 removes its positive Q₂, so Q_T decreases. A half reduction is only the separately drawn equal-branch example, not a universal claim.', 'R₁ = 2,R₂ = 6 gives equivalent 12/8 = 3/2 kPa·s/L; ratio to initial 1 is 3/2.', 'Proposal minus correct is 2 − 1 = +1 kPa·s/L. A single branch value ignores extra conductance.', 'Multiply E = R₁R₂/(R₁+R₂) by the denominator and collect R₁: ER₂ = R₁(R₂−E). Division by its positive coefficient gives the finite passive inverse.', 'New product gains ab and new sum is aR₁+bR₂. The equivalent ratio is ab(R₁+R₂)/(aR₁+bR₂); common factor a=b=k gives ratio k.', 'B at 3 and 6 kPa·s/L has equivalent 18/9 = 2, twice A. It remains below the smaller branch resistance 3.', 'Mean equivalents (1+2)/2 = 3/2 kPa·s/L. Mean branch inputs 5/2 and 4 give 20/13, larger by 1/26.', 'Target equivalent 2 below known first branch 3 requires second branch (2·3)/(3−2) = 6 kPa·s/L; ratio to original 2 is 3.', 'Gain 3/(1 kPa·s/L) = 3 L/(kPa·s). Reading 6 decodes equivalent 2, then known R₂ = 6 gives R₁ = 3 kPa·s/L.', 'Gain (5−3)/(2−1) = 2 L/(kPa·s), offset 1. Reading 17/5 gives equivalent 6/5; known second branch 2 then yields first branch (12/5)/(4/5) = 3.', 'Equal positive branches R give equivalent R/2. Measuring 1 kPa·s/L fixes R = 2 uniquely. These are continuous resistances, and the absolute equivalent value fixes the scale left free by equality alone.']
DISTRACTORS=['4 adds series resistances; 2 copies one branch. Numerical 1/2 is one branch conductance, not equivalent resistance. Positive parallel equivalent is below both finite branches.', 'kPa is pressure, L/s flow, Pa·s viscosity and L/(kPa·s) conductance. Only pressure divided by volume rate has the resistance dimension.', 'Sum is series, difference can cancel passive branches, half-sum ignores increased total flow and reciprocal sum is conductance that must still be inverted.', '3/2 directly scales the equivalent by only R₁, unchanged ignores it, 5 sums series elements and 2/3 reverses the monotonic effect.', '3 adds and 1 subtracts as though series. Reversed denominator gives a negative passive resistance, not a valid second branch.', 'Compensating with larger Q₁ would require another pump control. Total cannot stay fixed after removal of positive Q₂ when Q₁ is unchanged. Closure is infinite resistance, not zero resistance.', '2/3 is reciprocal, 3 copies only the second-resistance factor, 1 ignores it and 2 is the closed-second-branch limit rather than a finite R₂ = 6.', '−1 reverses subtraction, 2 repeats proposal, zero endorses it and 1/2 is not the discrepancy. At fixed dp the proposal halves the true total-flow prediction.', 'Reversed denominator is negative; addition and subtraction invert another topology. The final reciprocal has conductance units. Equality E = R₂ would require first-branch closure rather than finite positive R₁.', 'ab ignores the new denominator; weighted sum ratio is series, its normalized reciprocal swaps states, and a+b gives 2 for unchanged trials.', '9 is the sum, 18 the product, 1/2 the reciprocal result and 3 follows only the second branch scaling.', '20/13 uses mean inputs, 3 is sum, 3/4 halves twice and 2 retains B alone. Equal statistical weights do not imply a nonlinear input averaging rule.', '6 copies new branch resistance rather than ratio, 1/3 reverses states and doubling R₂ alone misses the target. The strict equivalent bound is needed before inversion.', 'Raw reading 6 is not resistance; equivalent 2 is not the branch, 4 subtracts as series and 12 omits the inverse denominator.', 'At R₂ = 2, alternative first branches 4,2,6,3/2 give equivalents 4/3,1,3/2,6/7 and readings 11/3,3,4,19/7. Only first branch 3 gives 17/5.', '1 copies equivalent, 1/2 halves again, 4 would give equivalent 2 and zero violates positivity. Equality plus measured absolute equivalent is not redundant and admits one positive pair.']
ASSUMPTIONS=['Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.', 'Two passive finite positive continuous branch resistances across common-pressure nodes in a horizontal steady incompressible network. No leakage, storage, additional path, machine or junction losses; taps have equal elevation and kinetic contributions. Q_T is the sum of outgoing branch rates. The closure task explicitly fixes positive node pressure, not total flow; branch closure is a separate infinite-resistance limit.']
UNITS={1: 'kilopascal*second/liter', 2: 'kilopascal*second/liter', 3: 'kilopascal*second/liter', 4: 'kilopascal*second/liter', 5: 'kilopascal*second/liter', 6: 'liter/second', 7: 'dimensionless', 8: 'kilopascal*second/liter', 9: 'kilopascal*second/liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal*second/liter', 13: 'dimensionless', 14: 'kilopascal*second/liter', 15: 'kilopascal*second/liter', 16: 'kilopascal*second/liter'}
NUMERIC_UNITS={1: 'kPa·s/L', 5: 'kPa·s/L', 11: '1', 13: '1', 14: 'kPa·s/L', 16: 'kPa·s/L'}
OPTION_SUFFIX={7: '', 8: ' kPa·s/L', 12: ' kPa·s/L', 15: ' kPa·s/L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M480 320H600', 'M175 410H235', 'M35 320H155', 'M175 230H235'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M480 320H600', 'M175 410H235', 'M35 320H155', 'M175 230H235'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 835, 120, 30), (245, 205, 100, 50), (100, 1570, 120, 30), (100, 1460, 120, 30), (220, 1460, 120, 30), (220, 835, 120, 30), (100, 995, 80, 30), (245, 385, 100, 50), (180, 995, 40, 30)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Top network has common absolute pressure drop 106−100 = 6 kPa. Branch flow arrows each 60 px at 20 px/(L/s) give 3 and 3; inlet/outlet arrows 120 px give total 6. Blocks are schematic. At common dp = 6 kPa, flow bars use 40 px/(L/s): A widths 120+120 give 6 L/s; B widths 80+40 give 3 L/s at resistances 3 and 6. The closure panel starts specifically from equal branches A: its first 120 px bar is unchanged while the second is removed, total 6 to 3 L/s. All marker definitions, independent arrow paths, XML and full native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-hydraulic-parallel-{n:02}"
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
      "title":"Common pressure drop and additive conductance in parallel","reference":"Independently sum positive branch volume rates at common pressure. Invert conductance, retain strict inverse bounds and distinguish a closed branch at fixed pressure from fixed-total-flow control."}}



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
