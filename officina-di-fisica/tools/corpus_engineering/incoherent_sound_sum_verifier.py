"""Separate source-first review of wave intensity, logarithmic levels and independent versus coherent superposition.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-02.json"
CANDIDATE_REF='afdbd90b4d5a119c09ec7a9781602b8dffebdf30'
REVIEWED_PACKAGE_SHA256='c557f500e5aa3b63ab7e4d4a3523efb41714f38a0530c94558f839c219acd8bd'
REVIEWED_BINDINGS_SHA256='99126b98530b7aa86942d44a0cf8ea4f14b069f703905fba846c0723253ae4d7'
BATCH='incoherent-sound-sum-143'
ASSET_NAME='incoherent-sound-sum-progressive.svg'
FALSE_PROOF='Spegnere la seconda sorgente obbliga la prima a fornire la stessa potenza totale iniziale, quindi la sua intensità quadruplica per compensazione.'
SVG_MUTATION=(b'x="260" y="660" width="300"', b'x="260" y="660" width="200"')
EXPECTED_SKILL='C5-L04'
EXPECTED_PREREQUISITES=['C5-L02', 'C5-L03', 'C5-L04', 'C5-L05']
EXPECTED_IDS={f"AR-u4-incoherent-sound-sum-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-incoherent-sound-sum-01": "c8d4423a88711631993e69b3089e0ae2e71a858d3c4488cb2d832cf6c7fd22ab",
    "AR-u4-incoherent-sound-sum-02": "9e6e84190f1f1f70d06f7b54fcdde3595be24ccc67020534128c750d8679df41",
    "AR-u4-incoherent-sound-sum-03": "d951637b799dede1e6fa17c83d28e3e7e5286e0666421a8c636bab0c0fc64327",
    "AR-u4-incoherent-sound-sum-04": "420adb715c838748537585e5d323ccaea2d8cd65ddf9c0de8587b0df896686f4",
    "AR-u4-incoherent-sound-sum-05": "8dd5ca72fa09f14c0987d43d769bf116d8f81e9cf3fa6785d6ad3721f9821e65",
    "AR-u4-incoherent-sound-sum-06": "a2bdd68c32abd77b8411f88ce9ac3e357deac3b83300dc53537796d8dff91228",
    "AR-u4-incoherent-sound-sum-07": "28ed931d89f47034594e7167c415176755bf099b1d8f86289ec73d5f22e85a04",
    "AR-u4-incoherent-sound-sum-08": "e8dffa13418ae6e526ed126b394e5803839e70f11ac989e8b2b8dd4c58e288eb",
    "AR-u4-incoherent-sound-sum-09": "b740b7d7f2a008625d2f0552727217d9bc3c4924974e3117120e5abf464033bd",
    "AR-u4-incoherent-sound-sum-10": "456d3361c6a5dfb23129b90f83bf8cfe471d9bc785e4b532ac646e7be52beeab",
    "AR-u4-incoherent-sound-sum-11": "ff9a312a06fa689cfe039889e0a5954cf4a2315eea79761e2b561890a7d98161",
    "AR-u4-incoherent-sound-sum-12": "1e3267dd26fd23e2fdfa402e47524f5d26730a6bbb7759fbac297a47550e13cc",
    "AR-u4-incoherent-sound-sum-13": "4ddda081b16fbbb8a90e987cd9880d730f8bf775d44a9680bc3946349c24e743",
    "AR-u4-incoherent-sound-sum-14": "df338c974811ab7c6166f8a838b423c2192612921e62f0ba21b2c884698a957e",
    "AR-u4-incoherent-sound-sum-15": "4986e7dd1bb86b7ab3f0bee8685e86b8200b01aa6a81bbf2e4b98c853eb3b451",
    "AR-u4-incoherent-sound-sum-16": "c37b4fa32fd8f1faf2351abb891b06f8c219e6104f5da18ee8fb298cd216450f"
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

def physical_total(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Two positive incoherent mean contributions required")
    return first+second

def inverse_first(total,second):
    total,second=map(Fraction,(total,second))
    if second<=0 or total<=second:raise ValueError("Total strictly above the known positive contribution required")
    return total-second

def source_ratio_after_fraction_removed(removed):
    removed=Fraction(removed)
    if not 0<removed<1:raise ValueError("Fraction strictly between zero and one required")
    return (1-removed)/removed


def oracle():
    x,y,total,a,b,theta=sp.symbols("x y total a b theta",positive=True)
    # The assigned observation mean is zero; uniform phase averaging is a separate exact example.
    cross=2*sp.sqrt(x*y)*sp.integrate(sp.cos(theta),(theta,0,2*sp.pi))/(2*sp.pi)
    assert cross==0
    law=x+y;inv=sp.solve(sp.Eq(total,law),x)[0];assert inv==total-y
    scaled=sp.cancel(law.subs({x:a*x,y:b*y},simultaneous=True)/law)
    assert scaled==(a*x+b*y)/(x+y)
    first=sp.Rational(physical_total(1,2));second=sp.Rational(physical_total(2,3))
    assert (SI.Quantity(1,"watt/meter**2")+SI.Quantity(2,"watt/meter**2")).to("watt/meter**2").magnitude==3
    mean=(first+second)/2;assert mean==physical_total(Fraction(3,2),Fraction(5,2))==4
    q,z,decoded,affine=calibrate(first,second,9,15,7,11,17,"watt/meter**2");assert(q,z,decoded,affine)==(3,1,5,8)
    off=source_ratio_after_fraction_removed(Fraction(3,4));assert off==Fraction(1,3)
    assert sp.solve(sp.Eq(3,y/2+y),y)==[2]
    return [first,"W/m²","La media temporale del termine incrociato è nulla","Da 3 a 4 W/m²",inv.subs({total:3,y:2}),sp.Rational(off),sp.Rational(2,3),6-first,"I₁ = Iₜ − I₂","V / U",second/first,mean,sp.Rational(3,2),inv.subs({total:decoded,y:3}),inv.subs({total:affine,y:5}),sp.Integer(2)]

MANUAL=['At the read same-direction normal-area convention and zero mean cross term, contributions 1 and 2 W/m² give average total 3 W/m².', 'Sum of homogeneous intensities retains W/m². A total power would additionally require multiplying by the common normal area.', 'Instantaneous perturbations add, but their quadratic mean flux includes a cross term. The stated zero time average of that term leaves I₁+I₂; this does not mean energy vanishes.', 'Replace only the first contribution 1 by 2 W/m² while the second stays 2. New total is 4 W/m² rather than initial 3.', 'Total 3 W/m² minus known second contribution 2 W/m² gives first contribution 1 W/m². The total strictly exceeds the known positive contribution.', 'The remaining source is unchanged after switching off the other. A 75% reduction leaves the first at one quarter of the initial total and the second originally at three quarters, so the original source ratio is 1/3.', 'New positive contributions 1 and 1 W/m² sum to 2 W/m². Divide by initial total 3 to obtain ratio 2/3.', 'Proposed total 6 W/m² minus correct total 3 is the signed discrepancy +3 W/m².', 'Isolate I₁=Iₜ−I₂ by subtraction, with strict Iₜ>I₂>0 to keep the remaining intensity positive.', 'The prompt defines U as initial sum and V as the scaled sum. Weighted scaling gives ratio (κ₁I₁+κ₂I₂)/(I₁+I₂)=V/U.', 'Trial B contributions 2 and 3 W/m² give total 5. Its ratio to initial total 3 is 5/3.', 'Output mean (3+5)/2 is 4 W/m². Input means 3/2 and 5/2 sum to the same value because this zero-cross-term law is linear with equal statistical weights.', 'Target total 5 W/m² minus new first contribution 2 leaves second contribution 3. Its ratio to initial second contribution 2 is 3/2.', 'Gain 9/(3 W/m²)=3 m²/W decodes display 15 as total 5 W/m². Subtract known second contribution 3 to obtain first contribution 2 W/m².', 'Reference totals 3 and 5 with readings 7 and 11 give gain 2 m²/W and offset 1. Reading 17 decodes total 8; known second contribution 5 gives first contribution 3 W/m².', 'With first contribution half the second, total is three halves of the second. Measured total 3 W/m² gives second contribution 2 and first 1 W/m²; this independent scale measurement selects one positive pair.']
DISTRACTORS=['1 subtracts flux contributions despite the same direction, 2 copies only the second and 6 doubles a sum already containing both. Squaring intensities would change units and import a different law.', 'W²/m⁴ is product-intensity units, W requires area, J area and time, while dB requires a reference and a logarithm. These are not the given intensity sum.', 'Constant zero relative phase is coherent constructive interference and retains a cross term. Positive amplitudes cannot simply be summed here; dB are logarithmic and incoherence does not annihilate energy.', '6 doubles both sources, 5 adds the entire new first contribution without removing its old value, 3 ignores it and 2 removes one contribution or copies the increment.', '5 adds rather than inverting the sum, 3 copies total and −1 reverses subtraction. Negative single-source intensity contradicts positive codirectional contributions.', '1/4 is first-to-total rather than first-to-second, 3/4 is the removed fraction, 3 reverses the requested source ratio and 1 would imply a half reduction instead of three quarters.', '1/2 follows the second contribution alone, 3/2 reverses totals, 1 ignores the change and 1/3 compares the constant first contribution to the initial total.', '−3 reverses subtraction, 6 copies proposal, 9 sums and 0 accepts unjustified doubling. The signed error retains intensity units.', 'Adding the known contribution counts it twice, reversed subtraction is negative, quotient is pure and square root has square-root-intensity dimension.', 'U/V reverses trials, an unweighted sum or product of factors loses the initial intensity weights, and (V−U)/U is the relative increment rather than the ratio of totals.', '3/5 reverses trials, 2 and 3/2 follow individual sources only, and 5 copies final total. Distinct initial contributions supply distinct weights.', '8 omits division by two, 2 halves again and 3 or 5 selects only one trial. Coincidence with sum of means follows linearity, not positivity alone.', '5/3 copies the total ratio, 5/2 uses all the new total over the old second contribution, 2/3 reverses the source-trial ratio and 1 predicts total 4 instead of 5.', '12 subtracts physical contribution from raw dimensionless display, 5 leaves the known contribution in the decoded total. Gain is not itself an intensity.', '8 is decoded total, 6 comes from (17−5)/2 and mixes source contribution with display before decoding, 7/2 omits offset and 2 copies trial B. Only 3 reconstructs display 17.', '1 exchanges the source labels, 3 copies total and 6 ignores the existing second-contribution term in the sum. A square root is not an inverse of this linear constraint.']
ASSUMPTIONS=['Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.', 'Same local direction, medium and normal receiver area for the two progressive sound contributions. Both individual mean intensities are positive and their mean cross term is explicitly zero over the observation interval; linear superposition and unchanged source operation are stated. Switching-off06 refers to original positive contributions while only the final second source becomes zero. Displays are continuous dimensionless signals.']
UNITS={1: 'watt/meter**2', 2: 'watt/meter**2', 3: 'watt/meter**2', 4: 'watt/meter**2', 5: 'watt/meter**2', 6: 'dimensionless', 7: 'dimensionless', 8: 'watt/meter**2', 9: 'watt/meter**2', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt/meter**2', 13: 'dimensionless', 14: 'watt/meter**2', 15: 'watt/meter**2', 16: 'watt/meter**2'}
NUMERIC_UNITS={1: 'W/m²', 5: 'W/m²', 14: 'W/m²', 16: 'W/m²'}
OPTION_SUFFIX={6: '', 7: '', 8: ' W/m²', 11: '', 12: ' W/m²', 13: '', 15: ' W/m²'}

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
    if not {(60, 660, 200, 48), (180, 1220, 300, 42), (80, 1360, 100, 42), (80, 290, 100, 48), (60, 820, 400, 48), (260, 660, 300, 48), (180, 290, 200, 48), (80, 1220, 100, 42)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'All normal-intensity bars use 100 px/(W/m²): trial A is stacked 100+200=300 px, trial B 200+300=500 px, and the mean total is a separate 400 px bar. The final standalone switching-off diagram declares 100 px per normalized intensity unit: initial segments 100+300=400 px become an unchanged first segment 100 px. Thus removed fraction is 3/4 and original first-to-second ratio 1/3. Full XML and native image read; each stack has its own clear zero origin, equal scales within the compared group, and labels distinguish intensity from amplitudes or dB.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-incoherent-sound-sum-{n:02}"
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
            if value!=wanted:errors.append("Independent intensity and superposition conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # These individually read intensity and amplitude choices use exact literal unit suffixes.
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
          "methods":["source_prompt_only_primary_period_averaged_energy_log_ratio_and_cross_term_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_quantity_ratios_and_normalized_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Incoherent period-averaged local codirectional energy flux","reference":"Expand the quadratic energy-flux expression and use the explicitly zero averaged cross term. Sum scalar intensities only under the read common normal-area and propagation-direction convention; distinguish switched-off fractions and unchanged remaining source."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U4-02","U2-01")
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
