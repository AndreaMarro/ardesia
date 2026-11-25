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
CANDIDATE_REF='7888239c4f9742cbb383d78d3d90f3b38e1dbd80'
REVIEWED_PACKAGE_SHA256='293ce59004871a85e4f423e00d191632d580c8f6b637058b0b8e44d4dc74232d'
REVIEWED_BINDINGS_SHA256='13d13018c537af443fafb6b46d551e4a19ef1b22b75085050ca33a138fe56df8'
BATCH='wave-amplitude-energy-141'
ASSET_NAME='wave-amplitude-energy-progressive.svg'
FALSE_PROOF='Poiché l’ampiezza resta uguale nel quesito06, la potenza deve restare uguale anche quando cambia la frequenza della legge I=Kf²A².'
SVG_MUTATION=(b'width="225"', b'width="150"')
EXPECTED_SKILL='C5-L04'
EXPECTED_PREREQUISITES=['C5-L01', 'C5-L02', 'C5-L04']
EXPECTED_IDS={f"AR-u4-wave-amplitude-energy-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u4-wave-amplitude-energy-01": "c316ba60f6cca32347b490599192702d71c567883c6c6c52a10dcf856ab998aa",
    "AR-u4-wave-amplitude-energy-02": "c29d0c0b45267521bf3ceaae6699cd09dd5be465100a0de12af6d7f73007604b",
    "AR-u4-wave-amplitude-energy-03": "f930039f7ee1ce8831e87b6aeafe7a0aaf5ab7c182e0dc15aaa4eb3085d8b50c",
    "AR-u4-wave-amplitude-energy-04": "ea4a17867fc6420f90c11b90da7a75bd997bf70883b236468fd50a0b50f9b9ee",
    "AR-u4-wave-amplitude-energy-05": "dbcbc48e3f4a78631345743c7bb8c3de40467d1c635db04bb995311d4e873bea",
    "AR-u4-wave-amplitude-energy-06": "47b856c8b5747154919105e50723c8b8a6b44e94d138b45982bf27fefa3e776c",
    "AR-u4-wave-amplitude-energy-07": "b83690d8a159bcb606b0405a35ebbbb37217567c492145667ff25b18cd3ea5b1",
    "AR-u4-wave-amplitude-energy-08": "3f9989437071e4688b476462e1bca91ad3fb0d0d0a6b41e12561156c5fa8f967",
    "AR-u4-wave-amplitude-energy-09": "9586761d072bbcfaf5633b11e50b6dca1cc967929aa3f072eac4645fa49c43c7",
    "AR-u4-wave-amplitude-energy-10": "7d1b0599c99ebb24f0dba86aee0a16ac9c678cffe5031640250466a5b764a293",
    "AR-u4-wave-amplitude-energy-11": "16be9857b13f730212c3c0b0167e3fd025ee4c1bcd668b99d75196f93c3bf676",
    "AR-u4-wave-amplitude-energy-12": "9fc5024217c05aa269f851c9bd6e2978bcf68b4ad2b13fc9d3ca97e9243fcc86",
    "AR-u4-wave-amplitude-energy-13": "3782b7aa53bbe58ee2907118a18b97f3893850f17c5d85cbf2c09256ee24c250",
    "AR-u4-wave-amplitude-energy-14": "2a843332e70ef4357bb1d20a114d0f9bde73900160c0d5ada5a015fc0766003f",
    "AR-u4-wave-amplitude-energy-15": "b11097aba69f17f47e70af9b43d368bb1c773ea0534e00684c15981d85ae6639",
    "AR-u4-wave-amplitude-energy-16": "db4a35f671d1d4a306838356761ee24baa7eb3986ae66b696a2809f3e36560e4"
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

def physical_intensity(reference,amplitude_ratio):
    reference,amplitude_ratio=map(Fraction,(reference,amplitude_ratio))
    if min(reference,amplitude_ratio)<=0:raise ValueError("Positive reference intensity and displacement-amplitude ratio required")
    return reference*amplitude_ratio**2

def constrained_ratio(intensity,coefficient):
    intensity,coefficient=map(Fraction,(intensity,coefficient))
    if min(intensity,coefficient)<=0:raise ValueError("Positive intensity and cross-trial reference coefficient required")
    return sp.real_root(sp.Rational(intensity)/sp.Rational(coefficient),3)

def frequency_power_ratio(frequency_ratio):
    frequency_ratio=Fraction(frequency_ratio)
    if frequency_ratio<=0:raise ValueError("Positive frequency ratio required")
    return frequency_ratio**2

def oracle():
    C,A,A0,w,theta,s,I0,I,a,b=sp.symbols("C A A0 w theta s I0 I a b",positive=True)
    average=sp.integrate((A*w*sp.sin(theta))**2,(theta,0,2*sp.pi))/(2*sp.pi)
    assert sp.simplify(average-A**2*w**2/2)==0
    amplitude_law=sp.cancel((C*A**2)/(C*A0**2)).subs(A,s*A0)
    assert amplitude_law==s**2
    law=I0*s**2;inv=sp.solve(sp.Eq(I,law),I0)[0]
    assert inv==I/s**2 and sp.cancel(law.subs({I0:a*I0,s:b*s},simultaneous=True)/law)==a*b**2
    first=sp.Rational(physical_intensity(1,2));second=sp.Rational(physical_intensity(2,3))
    assert (SI.Quantity(1,"watt/meter**2")*2**2).to("watt/meter**2").magnitude==4
    mean=(first+second)/2;assert mean-physical_intensity(Fraction(3,2),Fraction(5,2))==sp.Rational(13,8)
    q,z,decoded,affine=calibrate(first,second,12,54,9,37,33,"watt/meter**2");assert(q,z,decoded,affine)==(3,1,18,16)
    assert frequency_power_ratio(Fraction(3,2))==Fraction(9,4)
    assert constrained_ratio(4,Fraction(1,2))==2
    return [first,"W/m²","I = I₀ s²","Da 4 a 16 W/m²",inv.subs({I:4,s:2}),sp.Rational(frequency_power_ratio(Fraction(3,2))),sp.Rational(1,4),8-first,"I₀ = I / s²","κ₁ κ₂²",second/first,mean,sp.Rational(3,2),inv.subs({I:decoded,s:3}),inv.subs({I:affine,s:2}),constrained_ratio(4,Fraction(1,2))]

MANUAL=['At fixed medium and frequency, doubling material displacement amplitude multiplies mean intensity by four: 1 W/m² becomes 4 W/m².', 'The amplitude ratio and its square are dimensionless. Intensity retains power per normal area, W/m², with dimensions M T⁻³.', 'Both waves separately obey I=CA² with the same fixed positive coefficient. Divide the modified relation by its reference and substitute A=sA₀ to obtain I=I₀s².', 'New reference intensity 4 W/m² with amplitude factor 2 gives modified intensity 4·4=16 W/m². At fixed coefficient C the reference amplitude itself also changes.', 'Invert I=I₀s² by dividing 4 W/m² by 2². The recovered reference is 1 W/m².', 'This standalone task changes frequency, with I=Kf²A². Equal positive K, displacement amplitude and normal area cancel from P₂/P₁, leaving (3/2)²=9/4.', 'At reference 1 W/m², factor 1 gives modified intensity 1 W/m². Compared with initial 4 W/m² the ratio is 1/4.', 'Proposed 8 W/m² minus correct 4 W/m² is the signed discrepancy +4 W/m².', 'Positive s allows inverse I₀=I/s²; the unknown intensity appears linearly, so no root of intensity is taken.', 'Substituting I₀,B=κ₁I₀,A and s_B=κ₂s_A gives modified-intensity ratio κ₁κ₂². The original awkward ratio notation has been explicitly clarified in the candidate prompt.', 'Trial B reference 2 W/m² times factor 3 squared gives 18 W/m². Divide by initial 4 to obtain ratio 9/2.', 'Output mean (4+18)/2 is 11 W/m². Average inputs 3/2 W/m² and 5/2 give 75/8 W/m², lower by 13/8.', 'Target modified intensity 18 W/m² at reference 2 requires s_B²=9 and positive s_B=3. Relative to initial factor 2 the ratio is 3/2.', 'Gain 12/(4 W/m²)=3 m²/W decodes reading 54 as intensity 18 W/m². Divide by factor 3 squared to recover reference 2 W/m².', 'Gain (37−9)/(18−4)=2 m²/W and offset 1 decode reading 33 as intensity 16 W/m². Factor 2 then gives reference 4 W/m².', 'The cross-trial constraint I₀=cs with c=1/2 W/m² gives I=cs³. Measured intensity 4 W/m² fixes s³=8 and the unique positive factor 2; reference intensity is 1 W/m².']
DISTRACTORS=['2 follows amplitude linearly, 8 assigns its cube, 1/4 inverts the square effect and 1 ignores the change. This comparison is not simultaneous superposition.', 'W is power, J energy, m displacement and W/m power per length. Recovering total power would additionally require a normal area.', 'A single factor s omits a power, division reverses dependence, squaring I₀ changes its dimensions and an extra two has no origin in the cancelled coefficient.', '8 treats a fourfold reference change as twofold, 64 squares that reference-intensity factor, 4 ignores it and 1 reverses it. The square belongs only to amplitude ratio.', '2 divides by s once, 16 multiplies by s² rather than dividing. Substitution of the recovered reference must reproduce modified intensity 4.', '3/2 follows frequency linearly, 4/9 reverses states, 1 wrongly relies on unchanged amplitude alone and 27/8 cubes the ratio. The assigned full law distinguishes the varying-frequency case.', '1/2 omits the square, 4 reverses trials, 2 reverses only the linear ratio and 1 ignores the changed material amplitude.', '−4 reverses subtraction, 8 copies proposal, 12 sums and 0 accepts the superfluous doubling. Signed error is not the wave propagation direction.', 'I s² does not invert the product, I/s drops a power, s²/I is inverse intensity and √I/s has square-root-intensity dimension. A root is needed only for a different unknown.', 'κ₁κ₂ loses a power of amplitude, κ₁²κ₂ squares reference intensity instead, and quotient choices reverse direct dependencies.', '2 follows reference alone, 9/4 amplitude ratio squared alone, 2/9 reverses trials and 18 copies the final intensity rather than the dimensionless ratio.', '22 is sum, 11/2 halves again, 14 is difference and 75/8 is response at input means. The last has correct units but is not the requested output mean.', '9/4 is the squared factor ratio, 2/3 reciprocal result, 9/2 target intensity ratio and 3 the final factor rather than its ratio to the initial value.', 'Raw reading 54 as intensity would infer reference 6 W/m² and reconstruct threefold excessive display. Calibration precedes division by the new amplitude square.', '8 divides decoded intensity by s once, 16 copies modified intensity and 2 reference B. Alternative reference 33/4 W/m² gives modified intensity 33 and display 67 rather than 33.', '8 is the cube rather than its root; √8 solves another equation. Positive s excludes negative branches, and the dimensioned coefficient links different reference/modified pairs across trials.']
ASSUMPTIONS=['Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.', 'Linear small-perturbation harmonic propagation with the same medium and fixed frequency within the common model, positive constant coefficient C and positive reference amplitude, reference intensity and amplitude ratio. References can differ between trials consistently with I₀=CA₀². Task06 separately changes frequency in the assigned plane-wave law, retaining equal material amplitude and normal area. The display is a continuous dimensionless signal.']
UNITS={1: 'watt/meter**2', 2: 'watt/meter**2', 3: 'watt/meter**2', 4: 'watt/meter**2', 5: 'watt/meter**2', 6: 'dimensionless', 7: 'dimensionless', 8: 'watt/meter**2', 9: 'watt/meter**2', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt/meter**2', 13: 'dimensionless', 14: 'watt/meter**2', 15: 'watt/meter**2', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'W/m²', 5: 'W/m²', 14: 'W/m²', 16: '1'}
OPTION_SUFFIX={6: '', 7: '', 8: ' W/m²', 11: '', 12: ' W/m²', 13: '', 15: ' W/m²'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 640V705M100 780V845', 'M200 1210V1380', 'M190 250H210M420 200H440', 'M95 300H550', 'M200 300V250M430 300V200'}<=paths:raise ValueError("Independently reviewed physical scale or graph curve changed")
    arrows=set()
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(200, 1225, 100, 35), (100, 795, 400, 35), (200, 1325, 225, 35), (100, 655, 100, 35)}<=rectangles:raise ValueError("Independently reviewed physical scale or graph curve changed")
    return 'Displacement origin y300, 50 px/mm: vertical segments 50 and 100 px represent amplitudes 1 and 2 mm, explicitly not forces. At the same frequency, intensity bars 100 and 400 px at 100 px/(W/m²) represent reference 1 and modified 4. The separate task06 panel uses pure power-ratio bars 100 and 225 px at 100 px per unit for 1 and 9/4; amplitude, area and medium are fixed while frequency changes. Full XML and native image read; every bar starts at its explicit zero origin and no false arrow or force scale is implied.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u4-wave-amplitude-energy-{n:02}"
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
      "title":"Period-averaged wave intensity with separate frequency transfer","reference":"Integrate the squared material oscillation velocity over a cycle to obtain the amplitude square at fixed medium and frequency. Keep reference intensity distinct from amplitude ratio and separately retain frequency dependence in task06."}}



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
