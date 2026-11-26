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
CANDIDATE_REF='90d317dc6cd6756b14d92dc3d3fd22d1a54e5b13'
REVIEWED_PACKAGE_SHA256='8f9a1aa99ab49b8f580af7ce00bd943c2880b25cbab3c857e4e2629518f5e778'
REVIEWED_BINDINGS_SHA256='bdbfcdeae72f7cbdb2756e4b3f6b8bd49b9b0dc3f99b9bf6c49a0b10a4673382'
BATCH='soap-film-force-122'
ASSET_NAME='soap-film-force-steps.svg'
FALSE_PROOF='Le due interfacce tirano il lato mobile in versi opposti, quindi la forza totale del film è nulla anche con γ e ℓ positivi.'
SVG_MUTATION=(b'M250 935H200', b'M250 935H300')
EXPECTED_SKILL='C2-L010'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L010']
EXPECTED_IDS={f"AR-u3-soap-film-force-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-soap-film-force-01": "e26d3d9c2acd8ea531e28e1b8d21d553da6b5d2a31989030092ad8b11a3a37a4",
    "AR-u3-soap-film-force-02": "03db77cf07b5dee45df5180fa6197065c5b3f51d9292178aedd1d06ba60e3e17",
    "AR-u3-soap-film-force-03": "8147d90a31d1bea552796c8e58a4309023b6ece272d9f7fabd4445cda3a0eaec",
    "AR-u3-soap-film-force-04": "b146777eafa74dc0971eaa2be1ffd370cdb8e419539595f717da9e9073fe9d2b",
    "AR-u3-soap-film-force-05": "a9fffc8905796573fea8bae14a502efe58a4e7472adf2cb3e7c977851a38350b",
    "AR-u3-soap-film-force-06": "7fbe631da2a0b9d373fa57fd71c61f48d7e19594a992eaac62b6cbedc06bdd63",
    "AR-u3-soap-film-force-07": "ac46b39f58209669cdb8d0eba0ae8447ef1e151ec2dcc4f2b95d9ccac7b634c5",
    "AR-u3-soap-film-force-08": "be105bba065d97cf06ef85489a85fb3113d59ce7663d368f13b447d00773eaa1",
    "AR-u3-soap-film-force-09": "3b32cde4111d28876af524186e1d2c81234f5bff014e4c2ff95ec150306c3c3c",
    "AR-u3-soap-film-force-10": "8ae7184c1ac7230bed2314226afe449a2be0188bda4960d0f059c169b0d28e3e",
    "AR-u3-soap-film-force-11": "ec8c60b275f3d1da3f639f3824f729d0746bf2f02fd426c221af8340990f3c05",
    "AR-u3-soap-film-force-12": "34517292f645c137701e482875016a3c186d14e3c4d905394ad6c41a9385dfad",
    "AR-u3-soap-film-force-13": "c6d0d44ef28e687dc37edfa6f36d9b6412202bf7c6fbf1c0f50c7a3794f9379f",
    "AR-u3-soap-film-force-14": "7e55995b37ebb11ff09e098720bf7c1a712be22f223e312d127409b488e3eae1",
    "AR-u3-soap-film-force-15": "574cdaae2e3664cab9356162cf084cedd38b1d286a9184163d85c2642c8d7018",
    "AR-u3-soap-film-force-16": "caa6c6882f5ab2eeb4299d8b0764fd0fae2b890bc13a8acc15e184e921e41dc4"
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

def physical_force(gamma,length,interfaces=2):
    gamma,length=map(Fraction,(gamma,length))
    if min(gamma,length)<=0 or type(interfaces) is not int or interfaces!=2:raise ValueError("Positive uniform tension, positive edge and exactly two film interfaces required")
    return gamma*length/50

def oracle():
    gamma,ell,x,F,c,a,b=sp.symbols("gamma ell x F c a b",positive=True)
    energy=gamma*(2*ell*x)
    law=sp.diff(energy,x)
    assert law==gamma*ell+gamma*ell==2*gamma*ell
    inverse=sp.solve(sp.Eq(F,law),gamma)[0];edge=sp.solve(sp.Eq(F,law),ell)[0]
    assert sp.cancel(law.subs({gamma:a*gamma,ell:b*ell},simultaneous=True)/law-a*b)==0
    first=sp.Rational(physical_force(50,2));second=sp.Rational(physical_force(25,5))
    dimensional=(2*SI.Quantity(50,"millinewton/meter")*SI.Quantity(2,"centimeter")).to("millinewton")
    assert dimensional.magnitude==first==2
    mean=(first+second)/2;at_mean=physical_force(Fraction(75,2),Fraction(7,2));assert sp.Rational(at_mean)-mean==sp.Rational(3,8)
    q,z,decoded,affine=calibrate(first,second,6,sp.Rational(15,2),5,6,3,"millinewton")
    assert(q,z,decoded,affine)==(3,1,sp.Rational(5,2),1)
    # Use SI for the coupled inverse; c is 5/2 N/m².
    root=sp.solve(sp.Eq(F,law.subs(gamma,c*ell)).subs({F:sp.Rational(2,1000),c:sp.Rational(5,2)}),ell)[0]
    assert root==sp.Rational(1,50)
    return [first,"mN","F = 2 γ ℓ","Da 2 a 1 mN",sp.Integer(50),sp.Integer(2),sp.Integer(2),4-first,"γ = F / (2 ℓ)","κ₁ κ₂",second/first,mean,sp.Rational(5,2),sp.cancel(decoded/(2*sp.Rational(5,100))),sp.cancel(affine/(2*sp.Rational(2,100))),root*100]

MANUAL=['2 cm = 2/100 m. Each interface gives 50·2/100 = 1 mN; two same-direction contributions sum to 2 mN.', 'Tension in N/m times edge length in m gives N; milli changes scale only.', 'The one film has two interfaces, each γℓ. Their sum is 2γℓ; equivalently d[γ(2ℓx)]/dx = 2γℓ. For numerical cm and mN/m, divide their product by 50 to get mN.', 'γ halves at fixed edge and interface count, so 2 mN becomes 1 mN.', 'γ = F/(2ℓ) = 2 mN/(4/100 m) = 50 mN/m.', 'ℓ = F/(2γ) = 2/100 m = 2 cm. Milli cancels between force and tension, not the meter-to-cm conversion.', 'Doubled edge gives doubled force, from 2 to 4 mN; ratio 2.', 'Proposal 4 minus correct 2 gives +2 mN. Two interfaces were already included once.', 'Divide F by the whole positive product 2ℓ to isolate γ. The result has unit N/m.', 'The ratio of forces is the product κ₁κ₂ because tension and length each enter once.', 'B force is 25·5/50 = 5/2 mN, so ratio to 2 is 5/4.', 'Output mean (2 + 5/2)/2 = 9/4 mN. At mean inputs the force is 21/8 mN, greater by 3/8 mN.', 'Target factor 5/4 divided by the tension factor 1/2 yields edge ratio 5/2 and final edge 5 cm.', 'Gain 3 mN⁻¹ converts reading 15/2 into force 5/2 mN. Divide by two edges each 5/100 m to obtain γ = 25 mN/m.', 'Gain (6−5)/(5/2−2) = 2 mN⁻¹ and offset 1. Reading 3 is force 1 mN; at 2 cm this requires γ = 25 mN/m.', 'c = 25 mN/(m·cm) = 2500 mN/m² = 5/2 N/m². F = 2cℓ² gives ℓ² = 1/2500 m²; positive root 1/50 m is 2 cm and γ = 50 mN/m.']
DISTRACTORS=['1 mN omits an interface, 4 counts two twice, 100 omits cm conversion. Holding-force balance does not erase the film force itself.', 'mN/m and J/m² both measure tension; cm length and mN·m energy. Neither is a force unit.', 'One contribution omits a face; four counts four faces, division by length reverses the direct edge effect, and length/tension is not force.', '4 reverses tension dependence; 1/2 squares its factor; unchanged 2 ignores new tension and zero requires absent positive tension or contact.', '100 mN/m attributes all force to one interface. 1/2 mN/m uses cm as meters and is one hundred times too small.', '4 cm omits two interfaces; 2/100 is a meter value, not a centimeter value. No area is inferred.', '1/2 reverses trials, 4 squares the edge factor, 8 adds a nonexistent factor and 1 ignores changed contact length.', '−2 reverses error, 4 repeats proposal, 0 accepts it and 1 is only one-interface force rather than the required difference.', 'F/ℓ doubles γ; 2F/ℓ quadruples it; 2ℓ/F is inverse tension and Fℓ/2 energy.', 'Fractions reverse one direct effect. Squared edge factors would treat a length as area, and a sum gives two for identical trials.', '4/5 reverses trials, 1/2 follows tension only, 5/2 follows edge only, and 5/8 halves an already combined factor.', '9/2 sums, 9/8 halves twice and 1/2 subtracts the forces. 21/8 belongs to another proof at mean inputs.', '2/5 reverses the sought ratio, 5/4 copies force target, 1/2 copies tension factor and 5 is the edge in cm rather than its ratio.', 'Using reading 15/2 as mN would produce γ = 75 mN/m and a triple display. Calibration and face count are separate.', 'At edge 2 cm, γ = 50,75,100,125 mN/m generates readings 5,7,9,11. Only 25 generates 3.', '4 is the squared edge in cm² rather than edge. Negative root gives negative edge and tension. The constraint is between trials, not variable tension during one film measurement.']
ASSUMPTIONS=['One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.', 'One thin planar liquid film with two identical uniform positive-tension air–liquid interfaces. Both pull the straight mobile edge in the same contraction direction, perpendicular to the edge in the film plane. Positive edge length; edge weight, friction and end effects ignored. The optional holding force is opposite on the same edge; F remains the film-force magnitude. Tension is constant within a trial and may differ across trials.']
UNITS={1: 'millinewton', 2: 'millinewton', 3: 'millinewton', 4: 'millinewton', 5: 'newton/meter', 6: 'centimeter', 7: 'dimensionless', 8: 'millinewton', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'millinewton', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'centimeter'}
NUMERIC_UNITS={1: 'mN', 5: 'mN/m', 6: 'cm', 14: 'mN/m', 16: 'cm'}
OPTION_SUFFIX={7: '', 8: ' mN', 11: '', 12: ' mN', 13: '', 15: ' mN/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M470 330H570', 'M450 1445H350', 'M250 935H200', 'M250 1020H150', 'M470 230V430', 'M450 1615H325', 'M470 330H370', 'M250 850H200'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M470 330H570', 'M450 1445H350', 'M250 935H200', 'M250 1020H150', 'M450 1615H325', 'M470 330H370', 'M250 850H200'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1395, 80, 20), (170, 230, 300, 200), (100, 1565, 200, 20)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Mobile edge 200 px represents 2 cm at 100 px/cm; film width is schematic. Same-edge film and holding arrows are opposite, both 100 px at 50 px/mN for 2 mN. Second panel has two same-direction face arrows 50 px for 1 mN each and sum 100 px for 2 mN. Last panel separates length scale 40 px/cm, bars 80 and 200 px for 2 and 5 cm, from force scale 50 px/mN, arrows 100 and 125 px for 2 and 5/2 mN. All arrow paths have independent markers; full XML and native image read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-soap-film-force-{n:02}"
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
      "title":"Two interfaces pulling one mobile film edge","reference":"Add the two same-direction interfacial forces or differentiate surface work with total area 2ℓx. Keep applied holding force distinct from film force and convert centimeters before multiplication."}}



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
