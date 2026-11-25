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
REVIEWED_PACKAGE_SHA256='c827739b498d8bc83d8424013be7b2c08334ba5dcb0c2923639812345a707cc7'
REVIEWED_BINDINGS_SHA256='0bdd26dde74db17eadc62ce89b4b03c3a238319d463f56caf92b139ba6bc4d19'
BATCH='laplace-droplet-124'
ASSET_NAME='laplace-droplet-steps.svg'
FALSE_PROOF='Per raggi positivi la sovrapressione è la pressione interna assoluta, indipendentemente dal valore della pressione esterna.'
SVG_MUTATION=(b'cx="450" cy="975" r="160"', b'cx="450" cy="975" r="80"')
EXPECTED_SKILL='C2-L010'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L010']
EXPECTED_IDS={f"AR-u3-laplace-droplet-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-laplace-droplet-01": "33bcfbfc1ac9d5f282fee303f857c95cfe8ad74b0fbb398b1ee70d20a51ac4d2",
    "AR-u3-laplace-droplet-02": "7d54e5c328f3f09293b00f884fd85f0d9f7e31c72d564dc899ef1e9ad0d5b88a",
    "AR-u3-laplace-droplet-03": "2a667103a7966e9aafc56fe8051cd1d8c61b015e9592de96937da94fd1ed307a",
    "AR-u3-laplace-droplet-04": "947b5b7cbeb231ccdfc4f6e6a82ebe84bc963e764cb6beed31b3cfcc02bf9a88",
    "AR-u3-laplace-droplet-05": "2539625411becaf6b56684bdf1c73ce8111c95d619375ab08bf2621c6bffd970",
    "AR-u3-laplace-droplet-06": "82fe77e6ba05fbdaa2526b5dc979a71d2bac74ec369301aebf616f9e469bb6ca",
    "AR-u3-laplace-droplet-07": "0ae904ec721114ffc9aaab1197958b966838e8e9cd4fce500839d91884ddc442",
    "AR-u3-laplace-droplet-08": "c9600f2bbe771f9aa9555b81a4bce753f3915e7b5df71be38f2a6114ee0740e9",
    "AR-u3-laplace-droplet-09": "e587e7ccac927048657342b38d40476a57bfe5a33960fbf3d442499b95ba4650",
    "AR-u3-laplace-droplet-10": "6b7532cbaeb4979e2f60aaf108ad4f3aae5258f3402ddc3d0eac915f00bb35b5",
    "AR-u3-laplace-droplet-11": "0585653ea7cb75cb89e5fcca0fca343ca4963e97509b430c76514d76c79af450",
    "AR-u3-laplace-droplet-12": "379f6f43664d5ee8338603cd67f2eb9cdd7a56fb29ce5a8da877f09d31df9190",
    "AR-u3-laplace-droplet-13": "7b4d2df6c2163eb1234c67edc3e4167f846ac5f3961fbc1ea2632501fff7c551",
    "AR-u3-laplace-droplet-14": "2e6abf99b6f28d635af05fa4b85f7229b253bb8e8250f18b072e38f35f57c13c",
    "AR-u3-laplace-droplet-15": "afe1256a0b1896f17f64e30791d9bf05358732a79b97e843420afec65da6aba8",
    "AR-u3-laplace-droplet-16": "4e43514a566a597cab7a55ff351a46a355e0ab690be2ee29fe5013d193a1549b"
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

def physical_jump(gamma,radius):
    gamma,radius=map(Fraction,(gamma,radius))
    if min(gamma,radius)<=0:raise ValueError("Positive uniform tension and spherical radius required")
    return 2*gamma/radius

def oracle():
    gamma,r,p,c,a,b=sp.symbols("gamma r p c a b",positive=True)
    law=sp.solve(sp.Eq(p*sp.pi*r**2,gamma*2*sp.pi*r),p)[0]
    assert law==2*gamma/r
    inverse=sp.solve(sp.Eq(p,law),gamma)[0];radius=sp.solve(sp.Eq(p,law),r)[0]
    assert inverse==p*r/2 and radius==2*gamma/p
    assert sp.cancel(law.subs({gamma:a*gamma,r:b*r},simultaneous=True)/law-a/b)==0
    first=sp.Rational(physical_jump(20,2));second=sp.Rational(physical_jump(30,4))
    dimensional=(2*SI.Quantity(20,"millinewton/meter")/SI.Quantity(2,"millimeter")).to("pascal")
    assert dimensional.magnitude==first==20
    assert (SI.Quantity(1,"pascal")*SI.Quantity(1,"millimeter")).to("millinewton/meter").magnitude==1
    # Explicitly refute the reviewed distractor dimensions, not just its numeric value.
    assert SI.Unit("meter/pascal").dimensionality!=SI.Unit("1/(pascal*meter)").dimensionality
    mean=(first+second)/2;at_mean=physical_jump(25,3);assert mean-sp.Rational(at_mean)==sp.Rational(5,6)
    q,z,decoded,affine=calibrate(first,second,60,45,41,31,61,"pascal")
    assert(q,z,decoded,affine)==(3,1,15,30)
    assert law.subs(gamma,c*r)==2*c
    assert [physical_jump(10*r,r) for r in (1,2,Fraction(1,3))]==[20,20,20]
    return [first,"Pa","Δp_B > Δp_A","Da 20 a 30 Pa",sp.Integer(20),sp.Integer(2),sp.Rational(2,3),40-first,"γ = Δp r / 2","κ₁ / κ₂",second/first,mean,sp.Integer(2),sp.cancel(decoded*4/2),sp.cancel(affine*2/2),"Infinite"]

MANUAL=['20 mN/m divided by 2 mm and multiplied by the spherical factor 2 gives 20 Pa; the milli prefixes cancel. This is p_in − p_ext, not absolute internal pressure.', '(N/m)/m = N/m² = Pa. In assigned prefixes (mN/m)/mm is exactly Pa.', 'The hemisphere balance Δpπr² = γ2πr gives Δp = 2γ/r for one interface. At common γ, r_B < r_A implies Δp_B/Δp_A = r_A/r_B > 1.', 'At r = 2 mm the tension factor 30/20 = 3/2 changes pressure jump from 20 to 30 Pa.', 'γ = Δp r/2 = 20 Pa·mm = 20 mN/m. Pa·mm and mN/m are exactly equivalent.', 'r = 2γ/Δp = 40/20 mm = 2 mm; the diameter would be 4 mm.', 'At common γ = 20, radius 3 gives Δp = 40/3 Pa. Divide by A jump 20 to obtain 2/3.', 'Proposal 40 minus correct 20 gives +20 Pa. The doubled proposal corresponds to the thin soap-bubble two-interface expression, not the droplet.', 'Multiply Δp = 2γ/r by r and divide by 2: γ = Δp r/2. Dimension is Pa·m = N/m.', 'Tension contributes direct factor κ₁ and radius inverse factor κ₂, giving jump ratio κ₁/κ₂.', 'B has jump 2·30/4 = 15 Pa. Ratio to A jump 20 is 3/4.', 'The output mean is (20+15)/2 = 35/2 Pa. At mean inputs 25 and 3 the jump is 50/3 Pa, lower by 5/6 Pa.', 'Target 15 Pa at γ = 30 requires radius 2·30/15 = 4 mm, twice the initial 2 mm.', 'Gain 3 Pa⁻¹ decodes reading 45 as jump 15 Pa. At radius 4 mm, γ = 15·4/2 = 30 mN/m.', 'Gain 2 Pa⁻¹ and offset 1 decode reading 61 as jump 30 Pa. At radius 2 mm the inferred tension is 30 mN/m.', 'c = 10 mN/(m·mm) = 10 Pa = 10 N/m². Substitution γ = cr gives Δp = 2c = 20 Pa independently of positive r; infinitely many continuous positive pairs remain.']
DISTRACTORS=['40 Pa counts another interface; 10 omits the spherical factor two. Absolute pressures such as 100000 and 100020 are separate from their jump 20.', 'mN/m measures tension, mm radius and N force. Pa·m has an extra length compared with pressure.', 'Treating smaller r as a smaller jump reverses reciprocal curvature. Equality contradicts distinct radii at fixed positive γ; zero needs zero tension or curvature and signs stay positive.', '40/3 reverses tension factor, 45 squares it, unchanged 20 ignores it and zero contradicts positive tension and radius.', '40 omits the divisor two, 10 applies it twice, and dividing pressure by radius gives Pa/m instead of Pa·m.', '1 loses the spherical factor two and 4 is diameter. No root is required and absolute pressure cannot replace the jump.', '3/2 reverses the radius effect, 4/9 squares it, 1 ignores radius and 3 copies the final numerical millimeters.', '−20 reverses error, 40 copies proposal, 0 accepts it and 10 halves the difference.', '2Δpr quadruples the correct γ. Δp/(2r) has unit Pa/m, two length powers below Pa·m. 2r/Δp has unit m/Pa, not inverse tension 1/(Pa·m); Δpr omits the divisor two.', 'Product makes radius direct, reciprocal swaps states and the squared factors do not occur in the provided spherical law.', '4/3 reverses states; 3/2 follows tension only, 1/2 radius only, and 15 is final pressure number rather than the ratio.', '35 sums, 35/4 halves twice and 5 subtracts. 50/3 solves a separate droplet at mean inputs rather than the requested mean of outputs.', '1/2 reverses sought radius ratio, 3/2 follows tension only, 3/4 copies pressure target and 4 is final radius number.', 'Raw reading 45 used as Pa would infer γ = 90 mN/m. Once jump is decoded, subtracting atmospheric pressure again is incorrect.', 'At radius 2, candidate tensions 20,15,60,40 yield readings 41,31,121,81. Only 30 yields 61.', 'One or two sampled pairs do not identify the continuous family. No pairs is disproved by any positive radius; zero radius makes the law undefined. Another independent scale measurement is required.']
ASSUMPTIONS=['One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.', 'One spherical liquid–gas interface in ideal equilibrium, positive assigned radius and uniform positive tension, gravity and other shape-deforming causes ignored. Uniform internal and external pressures; jump is internal minus external and positive. Radius differs from diameter; no second soap-film interface. Distinct trials compare distinct droplets or conditions. Display is continuous dimensionless, not an absolute pressure reading.']
UNITS={1: 'pascal', 2: 'pascal', 3: 'pascal', 4: 'pascal', 5: 'newton/meter', 6: 'millimeter', 7: 'dimensionless', 8: 'pascal', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'pascal', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'Pa', 5: 'mN/m', 6: 'mm', 14: 'mN/m'}
OPTION_SUFFIX={7: '', 8: ' Pa', 11: '', 12: ' Pa', 13: '', 15: ' mN/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M140 975H220M450 975H610', 'M220 300H300'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1410, 100, 30), (100, 1550, 75, 30)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(450, 975, 160), (220, 300, 80), (140, 975, 80)}<=circles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'First droplet radius 2 mm is 80 px at 40 px/mm, with an unmarked radial dimension line rather than force. Example absolute pressures 100000 and 100020 Pa differ by 20 Pa. Same-γ middle panel has radii 80 and 160 px for 2 and 4 mm, hence jumps 20 and 10 Pa. Final explicitly different pair also changes tension: γ20,r2 gives 20 Pa and γ30,r4 gives 15 Pa. Bars at 5 px/Pa are 100 and 75 px, scalar pressure jumps rather than forces or absolute pressures. Complete XML and native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-laplace-droplet-{n:02}"
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
      "title":"Positive pressure jump over one spherical liquid interface","reference":"Balance pressure traction on a hemisphere against its single circular interfacial rim, distinguishing positive pressure difference from absolute pressure and radius from diameter."}}



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
