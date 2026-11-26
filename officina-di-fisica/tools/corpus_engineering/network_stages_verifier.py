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
CANDIDATE_REF='e676ba36fa9817733ac6a4bc0b4fb1dd23f3c57b'
REVIEWED_PACKAGE_SHA256='4a6347ae796bcb46e169fd9555a7295ba50ef0db49c234f7d5b52258c134f893'
REVIEWED_BINDINGS_SHA256='b05f9588badb87189cbbaed1268df1512caf61a8088d20aac19ad91259d4f67c'
BATCH='network-stages-120'
ASSET_NAME='network-stages-steps.svg'
FALSE_PROOF='Tutti gli otto canali della prima rete hanno la stessa caduta totale e sono quindi tutti in parallelo, con resistenza equivalente R₀/8.'
SVG_MUTATION=(b'M145 240h20', b'M145 240h40')
EXPECTED_SKILL='C2-L009'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L008', 'C2-L009']
EXPECTED_IDS={f"AR-u3-network-stages-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-network-stages-01": "3722970a676af50971932fbf4efe91a470a77fec94b7e29dfc3bcbf8f916ae9e",
    "AR-u3-network-stages-02": "0a8f47d72b41a43fe2357c8c84621bdcd89754ee8939d61d3cb07acd5446b4cd",
    "AR-u3-network-stages-03": "4073b7d9acc93857881ad2f3cf68d1b720e51b5e9ac9e01abc422acfc7920765",
    "AR-u3-network-stages-04": "0c8097d6ddb1e6e09c975b0b48feeeee75396de8fc876fd05bcc21617085c92d",
    "AR-u3-network-stages-05": "2f5b35a85ee99fb0238e21593f8603dfb632e2990a9c321d9f7b14b3dc75354c",
    "AR-u3-network-stages-06": "2c12b3d82c9a1a325bee61c8b5319f69be22109f7e21c611e9ac1a272b72be5f",
    "AR-u3-network-stages-07": "75639a39b0b9804449199b361a511207644b2e85cb84af4842feba56076b2eb4",
    "AR-u3-network-stages-08": "e0199a5a136d72fa8c3d343743e5df28624d308d02e1102aacc6d62db8b05566",
    "AR-u3-network-stages-09": "e71dd67f7e57663739496f2761ba213ad083a4e909862b045b460f8a44550407",
    "AR-u3-network-stages-10": "25fdf17fe3f3814f1f6516503299cf7bd658752b6b938a44442a3c18ba328228",
    "AR-u3-network-stages-11": "e729dbfdc0f93f7f815e8c502c14c9974c9fd61a15773cb50179dbd96a9a136f",
    "AR-u3-network-stages-12": "98441c3f86007e399971f62d080ad145456f762e46ac72a302ddc715074ab226",
    "AR-u3-network-stages-13": "a7f5a291ac0b287ab4e8e991749365dbc773e75bef4fa9d253228339d0fb8a12",
    "AR-u3-network-stages-14": "9658dfaccbcd1fbc68b7085ec58e37c4d0b3164d5ba3b1ddd5e3a1edd17ad4a6",
    "AR-u3-network-stages-15": "dc42e587ffb20802f05bca1786c3ae80d8cb6b8c2948ce42637bda637e503b67",
    "AR-u3-network-stages-16": "39701b5617f801aebe27a92c32edaff61ac25fe00a5f6c88b5109fb804f94dd3"
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

def physical_resistance(stages,branches,r0=2):
    stages,branches,r0=map(Fraction,(stages,branches,r0))
    if stages.denominator!=1 or branches.denominator!=1 or min(stages,branches,r0)<=0:raise ValueError("Positive integer stages and channels, positive channel resistance required")
    return r0*stages/branches

def inverse_stages(equivalent,branches,r0=2):
    equivalent,branches,r0=map(Fraction,(equivalent,branches,r0))
    if equivalent<=0 or r0<=0:raise ValueError("Positive resistance required")
    result=equivalent*branches/r0
    physical_resistance(result,branches,r0)
    return result

def oracle():
    ns,np,r0,Q,dp,R,a,b=sp.symbols("ns np r0 Q dp R a b",positive=True)
    stage_drop=sp.solve(sp.Eq(Q,np*dp/r0),dp)[0]
    law=sp.cancel(ns*stage_drop/Q)
    assert law==ns*r0/np
    inverse=sp.solve(sp.Eq(R,law),ns)[0]
    assert inverse==R*np/r0
    assert sp.cancel(law.subs({ns:a*ns,np:b*np},simultaneous=True)/law-a/b)==0
    first=law.subs({ns:2,np:4,r0:2});second=law.subs({ns:3,np:2,r0:2})
    assert physical_resistance(2,4)==first==1 and physical_resistance(3,2)==second==3
    # Unit oracle derives pressure from total rate times resistance, not from the key.
    pressure=(SI.Quantity(2,"kilopascal*second/liter")/4*SI.Quantity(4,"liter/second")).to("kilopascal")
    assert pressure.magnitude==2
    q,z,decoded,affine=calibrate(first,second,3,9,3,7,4,"kilopascal*second/liter")
    assert(q,z,decoded,affine)==(3,1,3,sp.Rational(3,2))
    k=sp.symbols("k",integer=True,positive=True)
    assert law.subs({ns:k,np:2*k,r0:2})==1
    assert [physical_resistance(k,2*k) for k in (1,2,9)]==[1,1,1]
    return [first,"kPa·s/L","R_eq = R₀ N_s / N_p","Da 1 a 3/2 kPa·s/L",inverse_stages(1,4),sp.Integer(4),sp.Integer(2),2-first,"N_s = R_eq N_p / R₀","κ₁ / κ₂",second/first,(first+second)/2,sp.Rational(1,2),inverse_stages(decoded,2),inverse_stages(affine,4),"Infinite"]

MANUAL=['Four equal parallel channels give one stage resistance 2/4 = 1/2 kPa·s/L. Two stages add to 1 kPa·s/L; eight physical channels are not eight series resistances.', 'Pressure divided by volume rate has unit kPa·s/L. Both counts are dimensionless positive integers.', 'At common stage pressure, branch rates add: Q = N_p Δp/R₀. At common total rate, N_s stage drops add. Eliminate Δp to obtain R_eq = R₀ N_s/N_p.', 'Three stages each of resistance 1/2 give 3/2 kPa·s/L, compared with 1 for two stages.', 'N_s = R_eq N_p/R₀ = 1·4/2 = 2, and 2 is an admissible integer.', 'N_p = N_s R₀/R_eq = 2·2/1 = 4, an integer number per stage rather than eight total channels.', 'Two parallel channels per stage give stage resistance 1, hence total 2 and ratio 2 to A.', 'Proposal 2 minus correct 1 is +1 kPa·s/L.', 'Isolate N_s = R_eq N_p/R₀. Resistance units cancel and the result must still be integral; positivity alone is insufficient.', 'The ratio is κ₁/κ₂. Each new count, rather than necessarily each factor, must be a positive integer.', 'B has three stages of resistance 1 each, total 3. The ratio to A total 1 is 3.', 'Output mean is (1 + 3)/2 = 2 kPa·s/L. The input mean N_s = 5/2 is outside the count domain; a formal 5/3 is not the requested mean or a realizable average-count network.', 'Target 3 with N_s = 3 requires N_p = 3·2/3 = 2. Relative to 4 the factor is 1/2, with integral final count.', 'Gain is 3 L/(kPa·s). Reading 9 gives total resistance 3; two channels per stage give one per stage and N_s = 3.', 'Gain (7−3)/(3−1) = 2 L/(kPa·s), offset 1. Reading 4 gives resistance 3/2; divide by stage 1/2 to obtain N_s = 3.', 'All integer pairs (N_s,N_p) = (k,2k), k ≥ 1, give resistance 1. There are countably infinitely many; zero counts are excluded.']
DISTRACTORS=['All channels in series would give 16; all in parallel would give 1/4; 2 is a single-channel resistance. Neither alternative respects the network nodes.', 'Pressure, rate and pure counts are not resistance; L/(kPa·s) is conductance.', 'The product counts parallel channels as series. Exchanging counts reverses both effects, inverse product treats stages as parallel, and the sum of counts has no such topology.', '2/3 reverses the stage factor; 3 copies a count; unchanged or zero ignores an added positive series stage.', '4 copies the branch count and 1/2 inverts the calculation. Fractional stage values cannot be rescued by rounding exact data.', '2 copies the stage count, 1/4 inverts the branch count and 8 counts total channels rather than channels per stage.', '1/2 reverses the branch effect, 4 doubles the factor twice, 1 ignores it and 2/3 is not the assigned count ratio.', '−1 reverses subtraction, 2 copies proposal, 0 accepts it and 1/2 halves the error.', 'R₀ N_p/R_eq reverses the physical resistance ratio; R_eq R₀/N_p has resistance squared, division by N_p repeats the inverse effect, and R_eq + N_p adds incompatible dimensions.', 'The product makes extra parallel channels impede flow; reciprocal swaps trials. Squared count factors have no basis in the linear network reduction.', '3/2 follows stages only, 2 follows channels only and 1/3 reverses trials. Six is a total channel count in B, not a resistance ratio.', '4 sums outputs; 1 halves the mean again or copies A; 3 copies B. 5/3 comes from a formal continuation to a noninteger stage count, not a physical average network.', '2 is both the final branch count and the reciprocal of the asked ratio; 3/2 follows stages only; 3 copies target, and 1/3 ignores changed stages.', 'Treating reading 9 as resistance gives nine stages and reconstructs a display three times too large.', 'With N_p = 4, candidate counts 1,2,4,6 produce readings 2,3,5,7. Only 3 produces 4.', 'One or two finite examples do not exhaust k ≥ 1. No solutions is contradicted by (1,2); the zero pair violates domain and makes the rational law undefined.']
ASSUMPTIONS=['Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.', 'Horizontal incompressible steady network, linear positive identical channel resistances, ideal nodes without accumulation or extra losses, no bypass between nonconsecutive stages. Positive total rate is common to stages and branches share each stage pressure. N_s and N_p are positive integer counts, fixed within a trial. Display readings are continuous dimensionless signals, not physical channel counts.']
UNITS={1: 'kilopascal*second/liter', 2: 'kilopascal*second/liter', 3: 'kilopascal*second/liter', 4: 'kilopascal*second/liter', 5: 'dimensionless', 6: 'dimensionless', 7: 'dimensionless', 8: 'kilopascal*second/liter', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal*second/liter', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'kPa·s/L', 5: '1', 6: '1', 11: '1', 14: '1'}
OPTION_SUFFIX={7: '', 8: ' kPa·s/L', 12: ' kPa·s/L', 13: '', 15: ''}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M60 307.5h80', 'M280 307.5h80', 'M500 307.5h80', 'M365 375h20', 'M365 955h40', 'M145 865h40', 'M60 910h80', 'M145 240h20'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M60 307.5h80', 'M280 307.5h80', 'M500 307.5h80', 'M365 375h20', 'M365 955h40', 'M145 865h40', 'M60 910h80', 'M145 240h20'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(130, 1400, 30, 30), (220, 1510, 60, 30), (160, 1510, 60, 30), (100, 1400, 30, 30), (100, 1510, 60, 30)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'First schematic network has two stages, four branches each. Total 4 L/s is 80 px and each branch 1 L/s is 20 px at common 20 px/(L/s). Absolute nodes 104,102,100 kPa give two 2 kPa drops. Second network retains two stages and total rate but two branches: each 2 L/s is 40 px, nodes 108,104,100 give stage drops 4 kPa. Last comparison is a separately labeled B with three stages and two branches: bars at 60 px/(kPa·s/L) sum 30+30 = 60 and 60+60+60 = 180. All separate arrow markers and full native image read; network geometry is explicitly schematic.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-network-stages-{n:02}"
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
      "title":"Positive integer stages and parallel channels","reference":"Solve common-rate series pressure addition and equal-pressure branch flow conservation before considering candidate choices. Keep both counts in positive integers, including inverses, calibration and redundancy."}}



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
