"""Independent source-prompt-first review of steady network and energy balances.
No candidate authoring imports. Frozen signatures apply only to individually read editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json"
CANDIDATE_REF='2fa93ae72f870eac7e6ccf1047994797423c2932'
REVIEWED_PACKAGE_SHA256='34421e27cdc890791403972b455545f27ec29531bcbbe4a9e8ac774eec07848c'
REVIEWED_BINDINGS_SHA256='db82e185db258357d9b1b9e91e6e92eb8dc63b3f5194561891c0d2e318e0176a'
BATCH='bernoulli-horizontal-099'
ASSET_NAME='bernoulli-horizontal-steps.svg'
FALSE_PROOF='La pressione assoluta iniziale scala con il quadrato della velocità in ogni prova, quindi il rapporto finale dipende soltanto dal rapporto fra le velocità.'
SVG_MUTATION=(b'M405 270H565', b'M405 270H485')
EXPECTED_SKILL='C2-L006'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L005', 'C2-L006']
EXPECTED_IDS={f"AR-u3-bernoulli-horizontal-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-bernoulli-horizontal-01": "93248cfa20d3fdc2feb9d0b889e8507ead29316f7d37546196cf464deb5dc878",
    "AR-u3-bernoulli-horizontal-02": "cae22f615420c1be4e489ad07212aad995ee65b0ac71377aae3168cd42aeb675",
    "AR-u3-bernoulli-horizontal-03": "b6cb0ece9cad49e8c668fab1cb8c0d0027ccfa25c1b879cc16c8842a6f9c8c23",
    "AR-u3-bernoulli-horizontal-04": "b5115f35e5de1a05f1aa7f2d0977d46079d9ccef2880076441df3376942122e1",
    "AR-u3-bernoulli-horizontal-05": "4fd4f36bb7380fff5e4ecdbc0a6f1d653364a9ccbd29c2d8cfbe143d4e0f1db5",
    "AR-u3-bernoulli-horizontal-06": "51e50ce637aa5efe34e69a1b6835a5c94272fe73c485b2dfcb00c20ca5f7b636",
    "AR-u3-bernoulli-horizontal-07": "ccfc39b88ffce058df0ae6397afcb4e532c570c595a1ce74f63ce15d45827559",
    "AR-u3-bernoulli-horizontal-08": "8cb4828383f66b8db69ef94586f900d58ce55db51d92914d2132a5e5d677c9b6",
    "AR-u3-bernoulli-horizontal-09": "cfd28ae22f181a1970c84fa7f32e200e86779b950fe31a2c5c1cfe24d8ce1eff",
    "AR-u3-bernoulli-horizontal-10": "f4873e779b82069c35594652d38164a9995403d946cac39d1ac16c724dfe4b71",
    "AR-u3-bernoulli-horizontal-11": "86058e99c09dbe19d89c0fe11a213d9744ea3a271f131bf6e851f5075c8eb638",
    "AR-u3-bernoulli-horizontal-12": "e4adc976fd60ccbc0217aab42bf9303dc1d9b8b765e672dfa67b16ae1fb252ee",
    "AR-u3-bernoulli-horizontal-13": "8966a4da0fa6f55aed892ff4ee22413feaf76fd76fce79e786f84281ecd06473",
    "AR-u3-bernoulli-horizontal-14": "f381877d8bb73158fc504067dc99983166ce3339dd406b8353609df69c6e3525",
    "AR-u3-bernoulli-horizontal-15": "f781e002a07787aaa6c74d1617e10c601acb9504ba616d96680321a8466db920",
    "AR-u3-bernoulli-horizontal-16": "588c06af301b5a6c841295e2c7facd2104e5eded6c93a4e812e0c90962711cef"
}
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    return sp.Rational(raw)

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    gain=sp.Rational(reference_reading)/first
    decoded=sp.Rational(new_reading)/gain
    affine=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert gain>0 and affine[q]>0 and first!=second
    physical_gain=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert physical_gain.magnitude==Fraction(gain)
    return gain,affine[z],decoded,sp.cancel((third_reading-affine[z])/affine[q])

def physical_pressure(v1,v2,p1=100,rho=1000,phase_floor=0):
    v1,v2,p1,rho,phase_floor=map(Fraction,(v1,v2,p1,rho,phase_floor))
    if min(v1,v2,rho)<=0 or not p1>phase_floor>=0:raise ValueError("Positive speeds and density with inlet above assigned phase floor required")
    pressure=p1+rho*(v1*v1-v2*v2)/2000
    if pressure<=phase_floor:raise ValueError("Final absolute pressure outside assigned liquid-phase domain")
    return pressure

def oracle():
    p1,p2,rho,u,v,a,b=sp.symbols("p1 p2 rho u v a b",positive=True)
    law=sp.solve(sp.Eq(p1+rho*u**2/2,p2+rho*v**2/2),p2)[0]
    inv=sp.solve(sp.Eq(p2,law),u)[0];out=sp.solve(sp.Eq(p2,law),v)[0]
    assert inv==sp.sqrt(2*p2-2*p1+rho*v**2)/sp.sqrt(rho)
    fixed={p1:100,rho:1};first=law.subs({**fixed,u:2,v:4});second=law.subs({**fixed,u:4,v:2})
    dynamic=(SI.Quantity(1000,"kg/meter**3")*SI.Quantity(4,"meter/second")**2/2).to("kilopascal");assert dynamic.magnitude==8
    assert (SI.Quantity(100,"kilopascal")+SI.Quantity(1000,"kg/meter**3")*(SI.Quantity(2,"meter/second")**2-SI.Quantity(4,"meter/second")**2)/2).to("kilopascal").magnitude==94
    mean=(first+second)/2;assert mean==law.subs({**fixed,u:3,v:3})==100
    assert (first+law.subs({**fixed,u:4,v:4}))/2==97
    assert law.subs({**fixed,u:3,v:4})==sp.Rational(193,2)
    q,z,decoded,affine=calibrate(first,second,282,318,189,213,201,"kilopascal");assert(q,z,decoded,affine)==(3,1,106,100)
    x=sp.symbols("x",real=True);roots=sp.solve(sp.Eq(100-sp.Rational(3,8)*x*x,94),x);assert roots==[-4,4]
    return [first,"kPa","p₂ = p₁ + ρ(v₁² − v₂²)/2","Da 94 a 100 kPa",inv.subs({**fixed,p2:94,v:4}),out.subs({**fixed,p2:94,u:2}),sp.Rational(50,47),188-first,"v₁ = √[v₂² + 2(p₂ − p₁)/ρ]","(p₁ + κ₁² X − κ₂² Y) / U",second/first,mean,sp.Rational(1,2),inv.subs({**fixed,p2:decoded,v:2}),inv.subs({**fixed,p2:affine,v:4}),next(r for r in roots if r>0)]

MANUAL=['At rho = 1000 kg/m³, the dynamic contributions for 2 and 4 m/s are 2 and 8 kPa. Conservation gives p₂ = 100 + 2 − 8 = 94 kPa.', 'ρ v² has units (kg/m³)(m²/s²) = kg/(m s²) = Pa. Every term is energy per volume; 1 kPa = 1000 Pa.', 'At equal height, gravity terms cancel. Rearranging p₁ + ρv₁²/2 = p₂ + ρv₂²/2 gives p₂ = p₁ + ρ(v₁² − v₂²)/2.', 'At v₂ = 4 m/s, v₁ = 2 gives 94 kPa and v₁ = 4 gives 100 kPa. Different inlet energy means a separate Bernoulli constant in each trial.', 'v₁² = 16 + 2(−6000)/1000 = 4 m²/s². Of roots ±2 m/s, the positive speed is 2.', 'v₂² = 4 + 2(6000)/1000 = 16 m²/s². Positive speed is 4 m/s; the energy check is 100 + 2 = 94 + 8 kPa.', 'With both speeds 2 m/s, B has p₂ = 100 kPa. Its absolute-pressure ratio to 94 kPa is 50/47, not a gauge-pressure ratio.', 'Proposal minus correct is 188 − 94 = +94 kPa. The proposal would also raise static pressure during ideal horizontal acceleration with no machine.', 'v₁² = v₂² + 2(p₂ − p₁)/ρ. A strictly positive radicand has units m²/s²; positive speeds select the positive root.', 'X and Y are initial dynamic pressures. B has p₁ + κ₁² X − κ₂² Y, divided by U = p₂,A. Both states must remain in the explicitly assigned monophase domain.', 'Swapping speeds gives B pressure 100 + 8 − 2 = 106 kPa. Ratio 106/94 = 53/47; A and B have constants 102 and 108 kPa respectively.', 'The equal statistical mean is (94 + 106)/2 = 100 kPa. Mean speeds 3 and 3 give the same only by the swap symmetry. Counterexample: (2,4),(4,4) give mean 97, whereas mean speeds (3,4) give 193/2 kPa.', 'Target pressure (53/47)·94 = 106 kPa at v₁ = 4 m/s leaves final dynamic pressure 2 kPa. Thus v₂,B = 2 m/s and its ratio to 4 is 1/2.', 'Gain 282/(94 kPa) = 3 kPa⁻¹. Reading 318 means p₂ = 106 kPa; with v₂ = 2, the inverse gives v₁² = 16 and v₁ = 4 m/s.', 'Gain (213 − 189)/(106 − 94) = 2 kPa⁻¹ and offset 1. Reading 201 means p₂ = 100 kPa; equal pressures imply equal positive speeds v₁ = v₂ = 4 m/s.', 'With v₁ = v₂/2, p₁ − p₂ = (3ρ/8)v₂². Six kPa yields v₂² = 16 m²/s²; positive v₂ = 4 m/s and v₁ = 2 m/s.']
DISTRACTORS=['106 reverses the kinetic difference, 110 adds both dynamic pressures, and 6 is only the pressure drop. Continuity requires A₁ = 2 A₂ here.', 'J is energy, N force, m/s speed and kg/m³ density. Pa-to-kPa requires a factor thousand.', 'Reversed difference contradicts ideal acceleration; sum fails moving the final term; omitting p₁ gives only a change; unsquared speeds have wrong dimensions.', '88 subtracts the inlet increase again. 106 corresponds to swapping both speeds, not fixing v₂ = 4. Zero violates the conserved sum.', '4 copies the squared-speed number. Negative root violates the positive modulus; SI conversion of −6 kPa must preserve its sign.', '16 is the squared-speed number, 2 keeps the initial speed and reversed pressure drop makes the radicand negative for these data.', '47/50 reverses states, 3/47 is the relative increment and 1 ignores the change. A pressure-ratio offset cannot be silently changed to a gauge reference.', '−94 reverses the error, 188 copies the proposal, zero accepts it and 47 halves it. Positive pressure alone does not establish energy consistency.', 'Reversed jump swaps endpoints; omission of the root mixes speeds and squared speeds; omission of v₂² loses a datum; factor 2 outside the root has no basis.', 'Linear κ factors forget the squares. κ₁²/κ₂² ignores the fixed static term. The plus before Y adds rather than compensates kinetic energy, and the last option reverses trials.', '47/53 is reciprocal, 106 is the output-pressure number, 1 ignores the swap and 2 follows one speed factor rather than energy balance.', '200 is sum, 50 halves twice, 6 is a single pressure-change magnitude and 106 is B alone. The exact counterexample disproves universal interchange with mean speeds.', '2 reverses speeds, 53/47 copies the pressure target, 1 keeps the old speed and 1/4 is the ratio of squared speeds.', '318 is a display value, not kPa. 16 is the squared-speed number; gain decoding and the positive branch reconstruct 318.', 'At v₂ = 4, alternatives v₁ = 2,8,5,3 give pressures 94,124,209/2,193/2 kPa and readings 189,249,210,194, not 201.', '16 is squared final speed, 2 is initial speed and 8 doubles the root. Negative root violates positive moduli; the pure ratio constraint is across states, not a temporal acceleration law.']
ASSUMPTIONS=['Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.', 'Ideal incompressible steady liquid along the same horizontal streamline within each trial, no loss or machine, uniform one-dimensional velocity profiles, explicit monophase liquid assumption. rho = 1000 kg/m³, p₁ = 100 kPa absolute, positive speeds and final absolute pressure. Positive pressure alone is not a universal real-fluid phase criterion; the assigned monophase condition remains additional. Areas obey A₁v₁ = A₂v₂ and may change between separate trials; Bernoulli constants need not match across trials.']
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'kilopascal', 4: 'kilopascal', 5: 'meter/second', 6: 'meter/second', 7: 'dimensionless', 8: 'kilopascal', 9: 'meter/second', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'meter/second', 15: 'meter/second', 16: 'meter/second'}
NUMERIC_UNITS={1: 'kPa', 5: 'm/s', 6: 'm/s', 14: 'm/s', 16: 'm/s'}
OPTION_SUFFIX={7: '', 8: ' kPa', 11: '', 12: ' kPa', 13: '', 15: ' m/s'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M405 270H565', 'M55 220H260L380 245H585V295H380L260 320H55Z', 'M100 270H180'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M405 270H565', 'M100 270H180'}
    def inspect(node,inherited_marker=None):
        effective=node.get("marker-end",inherited_marker)
        if node.get("d") in arrows and (not effective or effective=="none"):raise ValueError("Reviewed vector arrowhead missing")
        for child in node:inspect(child,effective)
    inspect(root)
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 1265, 300, 28), (100, 1370, 318, 28), (100, 735, 300, 28), (100, 840, 282, 28), (418, 1370, 6, 28), (382, 840, 24, 28), (400, 1265, 24, 28), (400, 735, 6, 28)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'A rectangular conduit with fixed 1 cm depth has inlet/outlet heights 2 and 1 cm, drawn 100 and 50 px at 50 px/cm. Areas 2 and 1 cm² give common Q = 0.4 L/s at 2 and 4 m/s. Separate speed arrows 80 and 160 px use 40 px/(m/s). Pressure bars all use 3 px/kPa: A inlet 300 + 6 = 306 px, A outlet 282 + 24 = 306; B inlet 300 + 24 = 324, B outlet 318 + 6 = 324. Constants are conserved within A or B separately, not across the two trials. Complete XML, marker definitions and full native rendering read.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-bernoulli-horizontal-{n:02}"
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
          "methods":["source_prompt_only_primary_mass_tracer_or_mechanical_energy_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_admissible_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Horizontal ideal streamline pressure and positive speed inverses","reference":"Conserve static plus kinetic energy per volume along each horizontal streamline separately. Use coherent absolute pressures, explicit monophase liquid and compatible areas; preserve positive square-root branches."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-03","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=sp.Rational(oracle()[number-1])
    duplicate=f"{wanted.p*2}/{wanted.q*2}"+OPTION_SUFFIX[number]
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
                if "force scale" not in str(e):raise
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
