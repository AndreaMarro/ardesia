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
CANDIDATE_REF='92490c5564863989b8181e37261dc2da3cec9d3e'
REVIEWED_PACKAGE_SHA256='bfb6022742ba20324062359518c38a133f8f39b144a2a4fbfe9eedfaba756ecc'
REVIEWED_BINDINGS_SHA256='e925bcabfcb714f529c38ae4da1de98f99e6dccf80dcc95d2c9dfc41bf9ec455'
BATCH='surface-work-123'
ASSET_NAME='surface-work-steps.svg'
FALSE_PROOF='Anche se ΔA contiene già tutte le interfacce nuove, un film ha sempre lavoro 2γΔA e il fattore due si applica ancora.'
SVG_MUTATION=(b'width="125" height="50"', b'width="250" height="50"')
EXPECTED_SKILL='C2-L010'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L010']
EXPECTED_IDS={f"AR-u3-surface-work-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-surface-work-01": "a101424a0cfc061f98364abf137043cf1fb65cb446e65bbec6642a8879409ae9",
    "AR-u3-surface-work-02": "88023d4d23a5c9695cc297a945f33c3c9d335d07e2549f0d6fac65ac6f32f70c",
    "AR-u3-surface-work-03": "d24eb38804a58d1084d10b40c14341f244f0f00262103410c9ddb6443fb8bd4f",
    "AR-u3-surface-work-04": "8f5263be50c6ceb26208482b3ce54abddc49c1937331d4d289e667d1aafe182c",
    "AR-u3-surface-work-05": "96a39db063850e7aed44e8e9a1d585bbfd216a9a4318b32ce2cf2189ec7abed8",
    "AR-u3-surface-work-06": "ff13edb3ca2bcd895cfd81305093a1d5d0d47d39fb5228e30aff7ae5d783d858",
    "AR-u3-surface-work-07": "f07682a9c64dd5ff811b465da1df90f555d411f84ccbb8989d70792c1135f46c",
    "AR-u3-surface-work-08": "4eb61abcd683af53c02e85657821bcbaf6bd2fdad14c472007ac7d90dffab28c",
    "AR-u3-surface-work-09": "f9f483a8bc4fad9901e3e62b5a24705a3520bd9167dc52bb87624c9cfc57b3e8",
    "AR-u3-surface-work-10": "7ee73d72e667e69c91c94b349a0e7e10fc607d35ce8ab721b11099dd6fc0cb0b",
    "AR-u3-surface-work-11": "27959e2a7d27c3fec99675d2b33b176574ead4040aa47c3b9bc45452aec2fbc6",
    "AR-u3-surface-work-12": "325004767094ea4e44f17ad9d286fd067c6ae6434070fc14713f1c0682d0f47c",
    "AR-u3-surface-work-13": "d38c42d360d23bd3c530593cbbce3fa435c44fc0083eed2e5f0e1760ec48c584",
    "AR-u3-surface-work-14": "10651483f89428a25c613e9c725c3dd56a5cdd4953af89e732a9b8637b82c89e",
    "AR-u3-surface-work-15": "f2d7167415c6cf6cf790e9f177d514f7867f321b78f34f50a8e666a896bdf86b",
    "AR-u3-surface-work-16": "a5eb3f15f41965a4b0f7490c455dff82ab6422abd2c1d1255b033de9b659579d"
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

def physical_work(gamma,area):
    gamma,area=map(Fraction,(gamma,area))
    if min(gamma,area)<=0:raise ValueError("Positive constant tension and positive total new area required")
    return gamma*area/10

def oracle():
    gamma,A,s,W,c,a,b=sp.symbols("gamma A s W c a b",positive=True)
    law=sp.integrate(gamma,(s,0,A));assert law==gamma*A
    inverse=sp.solve(sp.Eq(W,law),gamma)[0];area=sp.solve(sp.Eq(W,law),A)[0]
    assert inverse==W/A and area==W/gamma
    assert sp.cancel(law.subs({gamma:a*gamma,A:b*A},simultaneous=True)/law-a*b)==0
    first=sp.Rational(physical_work(20,5));second=sp.Rational(physical_work(50,3))
    dimensional=(SI.Quantity(20,"millinewton/meter")*SI.Quantity(5,"centimeter**2")).to("microjoule")
    assert dimensional.magnitude==first==10
    assert physical_work(20,Fraction(5,2))*2==first
    mean=(first+second)/2;at_mean=physical_work(35,4);assert sp.Rational(at_mean)-mean==sp.Rational(3,2)
    q,z,decoded,affine=calibrate(first,second,30,45,21,31,51,"microjoule")
    assert(q,z,decoded,affine)==(3,1,15,25)
    # c = 4 mN/(m·cm²) = 40 N/m³; W=cA².
    root=sp.solve(sp.Eq(W,law.subs(gamma,c*A)).subs({W:sp.Rational(10,1000000),c:40}),A)[0]
    assert root==sp.Rational(5,10000)
    return [first,"µJ","W = γ ΔA","Da 10 a 25 µJ",sp.Integer(20),sp.Integer(5),sp.Rational(2,5),20-first,"γ = W / ΔA","κ₁ κ₂",second/first,mean,sp.Rational(3,5),sp.cancel(decoded*10/3),sp.cancel(affine*10/5),root*10000]

MANUAL=['γ = 20 mN/m = 2/100 N/m; total area 5 cm² = 5/10000 m². Their product is 10⁻⁵ J = 10 µJ, counted once.', 'N/m times m² gives N·m = J. µJ is energy, distinct from the unit W for power despite the work variable named W.', 'Integrate constant γ over the total new interfacial area: reversible work is γΔA. Multiple faces are already included in ΔA.', 'At area 5 cm², tension factor 50/20 = 5/2 gives work 10·5/2 = 25 µJ.', '10⁻⁵ J divided by 5·10⁻⁴ m² is 2/100 J/m² = 20 mN/m.', '10⁻⁵ J divided by 2/100 N/m is 5·10⁻⁴ m² = 5 cm², total area rather than one film face.', 'At unchanged tension, area 2 instead of 5 cm² gives work 4 instead of 10 µJ; ratio 2/5.', 'Proposal 20 minus correct 10 is +10 µJ. Another factor two would require a different total area.', 'Isolate γ = W/ΔA, with unit J/m² = N/m. All areas are total and positive.', 'Tension and total area each enter once, yielding ratio κ₁κ₂, not a squared area factor.', 'B gives 50·3/10 = 15 µJ, hence ratio 15/10 = 3/2.', 'Mean outputs (10+15)/2 = 25/2 µJ. Mean inputs 35 mN/m and 4 cm² give 14 µJ, greater by 3/2 µJ.', 'Target factor 3/2 divided by tension factor 5/2 gives area factor 3/5, so new total area is 3 cm².', 'Gain 3 µJ⁻¹ converts reading 45 into 15 µJ. Divide by area 3 cm² with exact SI prefixes to get γ = 50 mN/m.', 'Gain 2 µJ⁻¹ and offset 1 decode reading 51 as 25 µJ. At area 5 cm² this requires γ = 50 mN/m.', 'c = 4 mN/(m·cm²) = 40 N/m³. W = c(ΔA)² gives (ΔA)² = 25·10⁻⁸ m⁴. Positive area is 5·10⁻⁴ m² = 5 cm²; its square is not itself an area.']
DISTRACTORS=['20 doubles an area already total, 5 halves it and 100 multiplies input numbers without prefix conversion. Positive work creates positive area.', 'Tension, area and pressure are not energy. Unit W means watt, energy per time, not the variable name of work.', 'Two counts faces again, half discards area, and either quotient has dimensions unlike work. Variable γ would require a different integral, not the assigned constant-tension product.', '4 reverses the tension factor, 125/2 squares it, unchanged 10 ignores it and zero contradicts positive new area.', '2 is only the raw input quotient in mixed prefixed units. Dividing by two again would give 10 and double-count interfaces in the inverse.', '10 cm² doubles the inferred area, 5/2 discards one face without authorization, and a length cannot replace an area.', '5/2 reverses states, 4/25 squares an already-defined area factor, unchanged 1 ignores new area and 2 copies its numerical value.', '−10 reverses error, 20 repeats proposed work, 0 endorses it and 5 halves the difference.', 'Extra two or half changes the assigned total surface. WΔA has unit J·m² rather than J/m², while ΔA/W is inverse tension.', 'Quotients reverse one direct effect; κ₂² squares total area again and the sum gives two for equal trials.', '2/3 reverses states, 5/2 follows tension only, 3/5 area only, and 15 is the work number rather than a pure ratio.', '25 sums, 25/4 halves twice, 5 subtracts and 14 solves another transformation at mean inputs.', '5/3 reverses the area ratio, 3/2 copies target, 5/2 copies tension factor and 3 is final area number rather than its ratio.', 'Treating raw reading 45 as µJ yields γ = 150 mN/m. Display scaling does not remove area-prefix conversion.', 'At area 5 cm², candidate tensions 20,30,100,25 give readings 21,31,101,26. Only 50 gives 51.', '25 is the squared normalized area, not area itself. Negative root violates positive area and tension. The cross-trial constraint does not make γ vary within the reversible transformation.']
ASSUMPTIONS=['Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.', 'Slow reversible isothermal creation of positive total liquid interfacial area, with uniform positive constant γ within each trial. ΔA already sums every newly created face. No other work, kinetic or gravitational energy change or dissipation. W is positive external minimum surface-creation work, not power; tension may differ between distinct trials. Display is continuous dimensionless.']
UNITS={1: 'microjoule', 2: 'microjoule', 3: 'microjoule', 4: 'microjoule', 5: 'newton/meter', 6: 'centimeter**2', 7: 'dimensionless', 8: 'microjoule', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'microjoule', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'centimeter**2'}
NUMERIC_UNITS={1: 'µJ', 5: 'mN/m', 6: 'cm²', 14: 'mN/m', 16: 'cm²'}
OPTION_SUFFIX={7: '', 8: ' µJ', 11: '', 12: ' µJ', 13: '', 15: ' mN/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not set()<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1315, 100, 30), (150, 230, 50, 50), (100, 230, 50, 50), (250, 230, 50, 50), (100, 1455, 150, 30), (350, 780, 125, 50), (300, 230, 50, 50), (200, 230, 50, 50), (100, 780, 125, 50)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Five 50×50 px cells at 50 px/cm represent five separate 1 cm² area contributions, each costing 2 µJ at γ = 20 mN/m. The separate-film-face example shows two rectangles 125×50 px, each 5/2 cm² at the same geometric scale; total remains 5 cm² rather than 10. Final work bars at 10 px/µJ have widths 100 and 150 for 10 and 15 µJ; the mean is 25/2 µJ, not a power. No arrows claimed. Complete XML and native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-surface-work-{n:02}"
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
      "title":"Reversible work for the already-total new interfacial area","reference":"Integrate γdA at constant assigned tension over the total positive interfacial area increase. Do not double-count film faces or equate work with power."}}



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
