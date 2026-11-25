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
CANDIDATE_REF='590aa26f2ff3d9f71eae85147814f9c58c1a31ff'
REVIEWED_PACKAGE_SHA256='38e49da3bed691ed765f82d1b998117e00b1068898dccca33ecaf62c629af2c2'
REVIEWED_BINDINGS_SHA256='ead29532b7ad72c7e14dba0c7b71ac7ea440b425d0292112c0a82f222a44b497'
BATCH='transport-time-108'
ASSET_NAME='transport-time-steps.svg'
FALSE_PROOF='Raddoppiare la portata costante raddoppia il tempo necessario a trasferire lo stesso volume, perché il fluido percorre il tubo più rapidamente.'
SVG_MUTATION=(b'M100 1280L340 1100', b'M100 1280L280 1100')
EXPECTED_SKILL='C2-L005'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005']
EXPECTED_IDS={f"AR-u3-transport-time-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-transport-time-01": "de5b4c509ee222cbc9b201fd016233974cd21c947a2f77d2ea34044de427772a",
    "AR-u3-transport-time-02": "84d73a1e8a9c616fff6d54052560b9b10e2fcf7d3f7fd8d761f09966b44062af",
    "AR-u3-transport-time-03": "15b6c810e634fe20fe74c8e8b416e2c474d97fcc13f74fe843ffbc885ef2e5e3",
    "AR-u3-transport-time-04": "14b8c5f1776d40ecfc79ebe547ad3bca89bf40215c87274a9e83235fac1bf94f",
    "AR-u3-transport-time-05": "9612367a82e9953394b8cca2583413b46e8d2af6dda8236c02580a96e3765bdf",
    "AR-u3-transport-time-06": "601ed2853d7bcac7e20b989e01c8c7b9b6937f65460c41cc67f97206ca2a7a1e",
    "AR-u3-transport-time-07": "afde0602e84119efc9a43a7628d50747e521541304e3e008a45da330de5d80e8",
    "AR-u3-transport-time-08": "c0ec09a7d2fcc03e913278e2c9424ce1e87719b12d7a59543fbaddaad0c6e365",
    "AR-u3-transport-time-09": "382fe52d5d4885007d768910964d64a050b9c5b8eb30994b5f856df2554cd56f",
    "AR-u3-transport-time-10": "cbb34f1c5201b46f6a61a09030c828254bdf05d626383ccab60251a5b7c6158c",
    "AR-u3-transport-time-11": "f72b338da0f173abcc1e4b17f56dd73fbe26a1e9d3b0e8716be2a8a384a260f7",
    "AR-u3-transport-time-12": "99bbca6995d89d054d6680dcdb91512ca61ebf1ec536edc305ee49509f4bc639",
    "AR-u3-transport-time-13": "5b1cfc61292a82504a2d97f6a609cc9b033edb3cf2f7b97a83fdf9e78e2f9573",
    "AR-u3-transport-time-14": "627a98897756d6258c9b0d973488073f677f2faf9ccf2285adc4e75f934f38bc",
    "AR-u3-transport-time-15": "0b133dea5caa9ff67023b39911adaf223e9e6d28832d6053afd5f5abb83460f0",
    "AR-u3-transport-time-16": "642881c747d1e27a26d54a34313bde6bd29f623cf19ddf1105a5e1b8924fa4c5"
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

def physical_time(volume,flow):
    volume,flow=map(Fraction,(volume,flow))
    if min(volume,flow)<=0:raise ValueError("Positive delivered volume and constant flow required")
    return volume/flow

def oracle():
    V,Q,t,a,b,c=sp.symbols("V Q t a b c",positive=True)
    law=sp.solve(sp.Eq(V,Q*t),t)[0];inv=sp.solve(sp.Eq(t,law),V)[0];flow=sp.solve(sp.Eq(t,law),Q)[0]
    assert sp.cancel(law.subs({V:a*V,Q:b*Q},simultaneous=True)/law)==a/b
    first=law.subs({V:12,Q:3});second=law.subs({V:20,Q:4});mean=(first+second)/2
    assert (SI.Quantity(12,"liter")/SI.Quantity(3,"liter/second")).to("second").magnitude==4
    assert mean-law.subs({V:16,Q:sp.Rational(7,2)})==-sp.Rational(1,14)
    q,z,decoded,affine=calibrate(first,second,12,15,9,11,sp.Rational(43,3),"second");assert(q,z,decoded,affine)==(3,1,5,sp.Rational(20,3))
    assert sp.cancel(law.subs(V,c*Q))==c
    return [first,"s","t = V / Q","Da 4 a 20/3 s",inv.subs({t:4,Q:3}),flow.subs({V:12,t:4}),sp.Rational(3,4),8-first,"V = Q t","κ₁ / κ₂",second/first,mean,flow.subs({V:20,t:5})/3,inv.subs({t:decoded,Q:4}),inv.subs({t:affine,Q:3}),"Infinite"]

MANUAL=['Delivered volume obeys V = Qt. At 12 L and 3 L/s, t = 12/3 = 4 s.', 'L divided by L/s is seconds. The litre symbol and dimensional length symbol have distinct roles.', 'Constant positive Q over the interval makes V linear in time; t = V/Q follows division by Q. An initial rate cannot replace a variable rate.', 'At Q = 3 L/s, V = 12 and 20 L require 4 and 20/3 s respectively, with exact ratio 5/3.', 'V = Qt = (3 L/s)(4 s) = 12 L. Density is unnecessary for a volume question.', 'Q = V/t = 12 L/(4 s) = 3 L/s, constant by assumption rather than merely an interval mean.', 'At unchanged 12 L, Q = 4 L/s gives 3 s. Ratio to 4 s is 3/4; the relative reduction is instead 1/4.', 'Proposal minus correct is 8 − 4 = +4 s. At 3 L/s, an 8 s run would deliver 24 L.', 'Multiply t = V/Q by positive Q to recover V = Qt. Units reduce to volume.', 'The time ratio is (aV/(bQ))/(V/Q) = a/b.', 'B delivers 20 L at 4 L/s in 5 s, versus 4 s for A; t_B/t_A = 5/4.', 'Mean times are (4 + 5)/2 = 9/2 s. Mean inputs give 16/(7/2) = 32/7 s, larger by 1/14 s.', 'Target t_B = (5/4)·4 = 5 s at V_B = 20 L requires Q_B = 4 L/s and ratio 4/3.', 'Gain 12/(4 s) = 3 s⁻¹. Reading 15 gives 5 s; Q_B = 4 L/s delivers V_B = 20 L.', 'Gain (11 − 9)/(5 − 4) = 2 s⁻¹ and offset 1. Reading 43/3 gives (43/3 − 1)/2 = 20/3 s; multiplying by 3 L/s gives 20 L.', 'V = cQ with c = 4 s cancels Q in t = V/Q. Every Q > 0 yields t = 4 s; examples (12,3) and (20,5) in L and L/s show a continuous infinite family.']
DISTRACTORS=['36 multiplies volume by flow and has the wrong dimensions; 3 copies flow, 12 copies volume. The inverse check 3·4 = 12 reconstructs the delivered amount.', 'L is volume, L/s rate, s/L inverse rate and L²/s volume times rate. Only s is time.', 'VQ is not time, Q/V is inverse time, and double or half adds an unassigned transfer or a false ramp-up interval.', '12/5 uses the reciprocal volume factor; unchanged 4 ignores more volume, 20 copies litres and 8 would deliver 24 L.', 't/Q has time squared over volume; no density-free conversion from litres to kilograms is justified.', '48 multiplies instead of divides; 12 omits the duration. The reciprocal numerical result 1/3 has different rate units.', '4/3 reverses the time ratio, 1/4 is reduction rather than remaining fraction, 1 ignores changed flow and 3 is the new duration number.', '−4 reverses subtraction, 8 repeats proposal, zero accepts it and 2 halves the error.', 'Q/t has volume over time squared and t/Q is not volume. Double or half modifies the delivered quantity without justification.', 'a b reverses the flow dependence; b/a reverses both effects; a²/b duplicates volume scaling and a+b fails identical-trial ratio 1.', '4/5 is reciprocal, 5/3 follows only volume, 3/4 only flow and 5 copies the new duration number.', '9 is sum, 9/4 halves twice, 32/7 is the mean-input response and 1 is the output difference.', '3/4 reverses the rate ratio, 5/4 copies time target, 5/3 copies volume scaling and 4 is the new flow number rather than ratio.', 'Raw reading 15 used as seconds gives 60 L rather than 20. Neither duration 5 nor flow 4 alone is a volume.', 'At Q = 3 L/s, V = 21,19,40,10 L gives readings 15,41/3,83/3,23/3. Only 20 L gives 43/3; the continuous reading need not be rounded.', 'Two examples do not exhaust the solutions; uniqueness requires V or Q separately. Both zero is excluded and would make V/Q undefined.']
ASSUMPTIONS=['Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.', 'Constant positive net volumetric rate measured at the receiving vessel, through an already filled line, with enough supply and receiving capacity. No leakage, evaporation or uncounted storage. Timing starts in established regime and neglects startup and shutdown. V,Q may vary across independent trials but not during one transfer; no integer count constraint exists.']
UNITS={1: 'second', 2: 'second', 3: 'second', 4: 'second', 5: 'liter', 6: 'liter/second', 7: 'dimensionless', 8: 'second', 9: 'liter', 10: 'dimensionless', 11: 'dimensionless', 12: 'second', 13: 'dimensionless', 14: 'liter', 15: 'liter', 16: 'dimensionless'}
NUMERIC_UNITS={1: 's', 5: 'L', 6: 'L/s', 14: 'L'}
OPTION_SUFFIX={7: '', 8: ' s', 11: '', 12: ' s', 13: '', 15: ' L'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 1280L340 1100', 'M100 1100H340', 'M100 1280L280 1100'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(310, 150, 20, 40), (180, 150, 20, 40), (330, 150, 20, 40), (420, 150, 20, 40), (70, 150, 20, 40), (400, 150, 20, 40), (200, 150, 20, 40), (90, 150, 20, 40), (120, 510, 90, 28), (440, 150, 20, 40), (220, 150, 20, 40), (290, 150, 20, 40), (120, 580, 120, 28), (110, 150, 20, 40)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(280, 1100), (340, 1100)}<=points:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Twelve symbolic 1 L cells form four groups of three, labeled successive 1 s intervals, without claiming intermittent flow. Flow bars 90 and 120 px at 30 px/(L/s) represent 3 and 4 L/s. Cumulative-volume graph origin (100,1280), time scale 60 px/s and volume scale 15 px/L: endpoints (340,1100) and (280,1100) give 12 L after 4 or 3 s. Both lines terminate at the required delivered volume. Full XML and native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-transport-time-{n:02}"
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
      "title":"Net volume delivered at a constant positive volume rate","reference":"Conserve delivered volume over a timed steady interval: V=Qt. Separate output averages, display calibration and the redundant proportional-volume constraint."}}



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
