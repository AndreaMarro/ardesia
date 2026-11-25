"""Separate source-first review of wave propagation, reciprocal ranging and ideal harmonic oscillators.
No candidate authoring imports. Literal signatures freeze only individually read editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
import math
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-01.json"
CANDIDATE_REF='86603821dae30ea2452c9343c2b670faf4d2f441'
REVIEWED_PACKAGE_SHA256='68a3a2f847e3df7e9c477fcc807e6e437b59d94716427f74f3cf41f9ebe0f809'
REVIEWED_BINDINGS_SHA256='04a5e2d00270e6eea8334e6d4f98341bd4933a166d6c0372fdcd0f71aeaa4a72'
BATCH='echo-ranging-131'
ASSET_NAME='echo-ranging-progressive.svg'
FALSE_PROOF='Il ritardo misurato comprende già la riflessione, quindi la distanza della parete è cΔt senza dividere per le due tratte.'
SVG_MUTATION=(b'M100 930L310 690L520 930', b'M100 930L310 750L520 930')
EXPECTED_SKILL='C5-L05'
EXPECTED_PREREQUISITES=['C5-L01', 'C5-L02', 'C5-L05']
EXPECTED_IDS={f"AR-u4-echo-ranging-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-echo-ranging-01": "eec8cb59317258ef991475b394adf0ca5e4bcd466efe13eb36844d47c5be6f29",
    "AR-u4-echo-ranging-02": "28a2a8df1764d9a3b48f15bde42ae483de68835360495dac4ee725418bb60740",
    "AR-u4-echo-ranging-03": "f1f46e64cb31aa2c059464e1006e6a21807ce4c5a88531eb8c290de4ef64caa0",
    "AR-u4-echo-ranging-04": "28e4c755b87457d99a51cc62b0258aeea5796afc4c3f9dcfc2ca54ad701ba134",
    "AR-u4-echo-ranging-05": "f2e549f783a55f61b855de3cb6285d7f84794f96eec89f0953550b08142a629b",
    "AR-u4-echo-ranging-06": "7f03c158cdbc5ed4e0005e174c4be38d342ff9ba9aaac9c3d115307be1021e01",
    "AR-u4-echo-ranging-07": "e971e6fc8009ca0dc475dfc45cb35c4b390bd1e4d1928ed2864d527a377abf31",
    "AR-u4-echo-ranging-08": "aaecb58edeb60242a61ba63adf58b23afe4ef3784427769244ff32ecafb8374d",
    "AR-u4-echo-ranging-09": "d183cf3949ea78837c5e7932256f56685986a7be74a9d91ed972a0738dcceddc",
    "AR-u4-echo-ranging-10": "4414e717e3fed6c237ce22c47637ba9b4ebfea3025d08a26ce637ab009be60d8",
    "AR-u4-echo-ranging-11": "368e9b8406a6029b4a05ec11f2922ca425ec88bfa96dc00aaa84dfa67f6e7ae8",
    "AR-u4-echo-ranging-12": "ee2d4357ced1d60226d832f3856f428f0ece5d4b5be97f2fb15521c7a8524b80",
    "AR-u4-echo-ranging-13": "4257ce16d2a30eacb644f5150164ef0370d1092fdc23882ee0907b402ebf58f3",
    "AR-u4-echo-ranging-14": "63b50e28a05c5b2529a6c641e3a36739fe593bd2ac518d34788eb56ea23a795d",
    "AR-u4-echo-ranging-15": "14db7dcb5312b78fc7e389acf498d62bdb161fabf39319fe9cc093d378703c47",
    "AR-u4-echo-ranging-16": "078e9e0d8edd5c9ccd4daf33a9462e31b12eef235463005eaa1bf34fe60d43b3"
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

def physical_distance(speed,total_time):
    speed,total_time=map(Fraction,(speed,total_time))
    if min(speed,total_time)<=0:raise ValueError("Positive sound speed and round-trip time required")
    return speed*total_time/2

def constrained_time(distance,coefficient):
    distance,coefficient=map(Fraction,(distance,coefficient))
    if min(distance,coefficient)<=0:raise ValueError("Positive one-way distance and cross-trial coefficient required")
    return sp.sqrt(2*sp.Rational(distance)/sp.Rational(coefficient))

def oracle():
    c,t,d,a,b,B=sp.symbols("c t d a b B",positive=True)
    law=sp.solve(sp.Eq(c*t,2*d),d)[0]
    inv=sp.solve(sp.Eq(d,law),c)[0];time=sp.solve(sp.Eq(d,law),t)[0]
    assert inv==2*d/t and time==2*d/c
    assert sp.cancel(law.subs({c:a*c,t:b*t},simultaneous=True)/law)==a*b
    first=sp.Rational(physical_distance(10,6));second=sp.Rational(physical_distance(20,2))
    assert (SI.Quantity(10,"meter/second")*SI.Quantity(6,"second")/2).to("meter").magnitude==30
    mean=(first+second)/2;assert physical_distance(15,4)-mean==5
    q,z,decoded,affine=calibrate(first,second,90,60,61,41,121,"meter");assert(q,z,decoded,affine)==(3,1,20,60)
    assert constrained_time(30,Fraction(5,3))==6
    assert sp.cancel(law.subs(c,B*t))==B*t**2/2
    return [first,"m","L’onda può trasportare energia senza un flusso netto di massa nel modello","Da 30 a 3 m",inv.subs({d:30,t:6}),time.subs({d:30,c:10}),sp.Rational(1,6),60-first,"c = 2 d / Δt","κ₁ κ₂",second/first,mean,sp.Rational(1,3),inv.subs({d:decoded,t:2}),inv.subs({d:affine,t:3}),constrained_time(30,Fraction(5,3))]

MANUAL=['Total path length is 10 m/s times 6 s, or 60 m. Divide between the two equal legs to obtain one-way distance 30 m.', 'Speed times round-trip time has length units. The pure factor one half preserves meters.', 'A linear acoustic wave can carry energy while air particles oscillate near their equilibrium positions. Net mass flow from the source to the receiver is not required.', 'With speed 1 m/s and total delay 6 s, the one-way distance is 3 m rather than the initial 30 m.', 'Two equal legs imply c=2d/Δt. Substitute 30 m and 6 s to obtain speed 10 m/s.', 'Round-trip time is Δt=2d/c=60 m/(10 m/s)=6 s; a single leg would take 3 s.', 'Total delay 1 s at speed 10 m/s gives distance 5 m. Its ratio to 30 m is 1/6.', 'Proposed 60 m minus correct 30 m is +30 m. The proposal counts total travel length as one-way distance.', 'Isolate c=2d/Δt from cΔt=2d. The return path must remain in the inverse relation.', 'Scaling speed and total delay by positive factors κ₁ and κ₂ scales one-way distance by κ₁κ₂.', 'Trial B distance is 20 m/s times 2 s divided by two, or 20 m. Ratio to 30 m is 2/3.', 'Output mean (30+20)/2 is 25 m. Average inputs 15 m/s and 4 s give 30 m, exceeding that mean by 5 m.', 'Target distance 20 m at speed 20 m/s requires total delay 2 s, one third of initial 6 s.', 'Gain 90/(30 m)=3 m⁻¹ decodes reading 60 as distance 20 m. The total delay 2 s gives c=2d/Δt=20 m/s.', 'Gain (61−41)/(30−20)=2 m⁻¹ and offset 1 decode reading 121 as 60 m. Total delay 3 s then gives speed 40 m/s.', 'Substitute the cross-trial constraint c=bΔt, with b=5/3 m/s². Then d=b(Δt)²/2; distance 30 m gives time squared 36 s² and positive delay 6 s. Speed is 10 m/s.']
DISTRACTORS=['60 m is total path length rather than distance to wall; 15 halves twice and 5 is the speed-time quotient, not a length.', 'Speed-time product is meters; velocity, time, frequency and area units do not express one-way separation.', 'Energy transport does not imply a steady mass stream. In the linear model particles oscillate near equilibrium while the disturbance propagates; a stationary air sample does not arrive with its crest.', '300 reverses speed factor, 30 ignores it, 6 omits speed dimensions and unchanged total time does not mean unchanged range when c changes.', '5 divides distance by total time without counting two equal legs.20 adds another factor two;600 multiplies instead of dividing time.', '3 s is one-way travel time,12 doubles the round-trip factor again and 60 copies total path numerical length.', '6 reverses states,1 ignores the new delay,1/36 squares the time ratio and 1/3 halves the ratio a second time.', '−30 reverses the required subtraction,60 copies the proposal,90 sums and 0 accepts the doubled one-way range.', 'd/Δt misses the return leg, dΔt has length-time dimensions and Δt/(2 d) has reciprocal speed. The physical inverse is c=2 d/Δt.', 'The reciprocal time factor would describe frequency rather than measured delay. Squared factors do not follow the reciprocal path relation.', '2 follows speed alone,1/3 follows time alone and 3/2 reverses states. Both assigned changes are needed.', '50 is sum,30 is the result at input means and 10 is difference. Arithmetic mean of distances is 25 m; it is not the bilinear response at average inputs.', '3 reverses time states,2 retains speed factor alone and 2/3 repeats the target range factor rather than the required total-time factor.', '60 is a raw reading. Decoding distance 20 m before inversion gives c 20 m/s; using reading as distance would triple c.', 'Offset is subtracted before gain; reading 121 represents 60 m and interval 3 s is the complete round trip. Omitting either step fails display reconstruction.', 'Only the positive square root is a duration. Coefficient 5/3 m/s² relates different trials and is not a time-varying sound acceleration during one trip; assuming c changes during the echo would require a different travel integral.']
ASSUMPTIONS=['Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.', 'Stationary co-located transducer and receiver, stationary reflector and medium; identical straight reciprocal legs with the same constant sound speed, negligible electronics and reflection delays. Δt is total echo delay. Assigned speeds are ideal model values, not physiological tissue claims. Source03 is the ordinary linear small-perturbation still-air acoustic model. Continuous cross-trial coefficient is not actual propagation acceleration.']
UNITS={1: 'meter', 2: 'meter', 3: 'dimensionless', 4: 'meter', 5: 'meter/second', 6: 'second', 7: 'dimensionless', 8: 'meter', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter', 13: 'dimensionless', 14: 'meter/second', 15: 'meter/second', 16: 'second'}
NUMERIC_UNITS={1: 'm', 5: 'm/s', 6: 's', 14: 'm/s', 16: 's'}
OPTION_SUFFIX={7: '', 8: ' m', 11: '', 12: ' m', 13: '', 15: ' m/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 690H310V930', 'M80 930H565', 'M100 930L310 690L520 930', 'M500 300H140', 'M500 160V350', 'M100 950V650', 'M140 210H500'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows={'M80 930H565', 'M100 950V650', 'M140 210H500', 'M500 300H140'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(108, 185, 32, 140), (100, 1370, 160, 35), (100, 1250, 240, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    points={tuple(float(e.get(k,"nan")) for k in ("cx","cy")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(310, 690)}<=points:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Two separate 360 px arrows at 12 px/m show 30 m each; their vertical separation is only diagrammatic, explicitly the same physical path. Time-position origin(100,930),70 px/s and 8 px/m: reflection(310,690) is(3 s,30 m), return(520,930) is(6 s,0). Thus slopes are+10 and−10 m/s and total time 6 s. Comparison bars 240 and 160 px at 8 px/m show distances 30 and 20 m. Full native image and XML read, including all separate arrow markers, absolute zero origins and labels.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-echo-ranging-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        if row.get("course")!="C5" or row.get("skill")!=EXPECTED_SKILL or row.get("prerequisites")!=EXPECTED_PREREQUISITES or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or lesson mapping mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent wave and oscillator conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These individually read wave and oscillator choices use exact literal unit suffixes.
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
          "methods":["source_prompt_only_primary_shape_advance_reciprocal_path_and_Newton_harmonic_derivatives","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Echo distance from two equal reciprocal path lengths","reference":"Conserve total travel length cΔt=2d for a stationary source and reflector. Separate round-trip interval, one-way distance, linear acoustic energy transfer and cross-trial constrained speeds."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U4-01","U2-01")
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
