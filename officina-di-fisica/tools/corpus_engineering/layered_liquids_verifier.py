"""Independent source-prompt-first hydrostatic review; no candidate authoring imports.
Literal edition signatures frozen only after every source/candidate and final SVG were read.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json"
CANDIDATE_REF='63b872e11da5358bfaf01d87f3a1d50f5d874c3d'
REVIEWED_PACKAGE_SHA256='9046c907b62de568113420699515e55f0bdf81a1e3200175b7fc3ed1fcd4fe44'
REVIEWED_BINDINGS_SHA256='bbd8338d00ed30d0afa84c9d7da21d9c1c6fbf19f091547ec55c96a6cef3aa29'
BATCH='layered-liquids-078'
ASSET_NAME='layered-liquids-steps.svg'
EXPECTED_SKILL='C2-L002'
EXPECTED_PREREQUISITES=['C2-L001', 'C2-L002']
FALSE_PROOF='Attraversando l’interfaccia olio-acqua la pressione relativa riparte da zero, quindi al fondo conta soltanto la colonna d’acqua.'
SVG_MUTATION=(b'M220 1370L320 1470', b'M140 1370L320 1470')
EXPECTED_IDS={f"AR-u3-layered-liquids-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-layered-liquids-01": "4075717feda6b93127b6b637d906d26d4056bd3b03df12f70dd034d3b8d7d598",
    "AR-u3-layered-liquids-02": "668473fdf855d40c5946f259f500c11d913871634d1eaaddc5bce481e3449ccd",
    "AR-u3-layered-liquids-03": "7bbf1f468bc4d25deef43d78278a02949b37af39a9e0a6ab04d918d388958321",
    "AR-u3-layered-liquids-04": "9c8a2d7a4f0a96b26a3b718292d6e8846f8e3c2acd0a26830ea2c1a536ce88a8",
    "AR-u3-layered-liquids-05": "7fe176d17dab66e70424210e7fec9cb3b7b2b811cfd12b60e670e00798cbb1cf",
    "AR-u3-layered-liquids-06": "06dc40afa05ede87481781815f961ca50e18b80b1a78f6711ea198a91198bfa3",
    "AR-u3-layered-liquids-07": "0c36daca63ba474f7d28815834f1c0adeb783c62bb2b3c4c27e090abc9bc3484",
    "AR-u3-layered-liquids-08": "4a42b5e3255abb1c3950cf0c7aee76b0cd8395596d601dffd60ef3ae116941f6",
    "AR-u3-layered-liquids-09": "cbddc07a031cee993b47442166ed2e4517279e975670902699467d37852994ee",
    "AR-u3-layered-liquids-10": "142679e8996527a398ed435db926da2b9f6dc366256e7760b2aeb762bab8ea71",
    "AR-u3-layered-liquids-11": "12ccc172553b4aa9a9a1eeafe59dde2f8590fedc9a9f781425568ed333944ac0",
    "AR-u3-layered-liquids-12": "cc90af559af35f946b2f26739f7ef3500bbdd279cc517af2151435bc87375e16",
    "AR-u3-layered-liquids-13": "fc9c9b7329960a6ddf814fedf6a77b1214346dbd2662ff5cd46197f5dc1c968d",
    "AR-u3-layered-liquids-14": "dcc41c58c8e53cfe26ac1801b31ec804ce5892ef0a8bb491b1f905e48acc89dc",
    "AR-u3-layered-liquids-15": "91dfa2538cfcdbab7c853d82a5fedb9bf3aa4703caa0fc0dc1621e4bc245b021",
    "AR-u3-layered-liquids-16": "67c00314409e33c2c50d80c5b1878ce9b2d8f5e7ae2a23d6a64499ab1b25f62a"
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

def physical_layered(water_height,oil_height,water_density=1000,oil_density=800,g=10):
    water_height,oil_height,water_density,oil_density,g=map(Fraction,(water_height,oil_height,water_density,oil_density,g))
    if min(water_height,oil_height,water_density,oil_density,g)<=0 or oil_density>=water_density:
        raise ValueError("Positive layers and stable lighter oil above denser water required")
    return g*(water_density*water_height+oil_density*oil_height)/1000

def positive_water_height(pressure_kpa,oil_height):
    pressure_kpa,oil_height=map(Fraction,(pressure_kpa,oil_height))
    if oil_height<=0 or pressure_kpa<=8*oil_height:raise ValueError("Total pressure must strictly exceed oil head")
    return (pressure_kpa-8*oil_height)/10

def oracle():
    ha,ho,ga,go,p,a,b=sp.symbols("ha ho ga go p a b",positive=True)
    surface=sp.symbols("surface",positive=True);interface=surface+go*ho;bottom=interface+ga*ha
    law=sp.expand(bottom-surface);assert law==ga*ha+go*ho
    inverse=sp.solve(sp.Eq(p,law),ha)[0];invo=sp.solve(sp.Eq(p,law),ho)[0]
    assert inverse==(p-go*ho)/ga and invo==(p-ga*ha)/go
    ratio=sp.cancel(law.subs({ha:a*ha,ho:b*ho},simultaneous=True)/law)
    assert sp.simplify(ratio-(a*ga*ha+b*go*ho)/(ga*ha+go*ho))==0
    g=SI.Quantity(10,"meter/second**2");heads=[(SI.Quantity(r,"kg/meter**3")*g*SI.Quantity(1,"meter")).to("kilopascal").magnitude for r in (1000,800)];assert heads==[10,8]
    first=law.subs({ga:10,go:8,ha:1,ho:1});second=law.subs({ga:10,go:8,ha:2,ho:2});mean=(first+second)/2
    assert mean==law.subs({ga:10,go:8,ha:sp.Rational(3,2),ho:sp.Rational(3,2)})==27
    q,z,decoded,affine=calibrate(first,second,54,108,37,73,57,"kilopascal");assert(q,z,decoded,affine)==(3,1,36,28)
    positiveh=sp.solve(sp.Eq(law.subs({ha:ho,ga:10,go:8}),18),ho);assert positiveh==[1]
    return [first,"kPa","p_r = γ_o h_o + γ_a h_a","Da 18 a 28 kPa",inverse.subs({p:18,go:8,ho:1,ga:10}),invo.subs({p:18,ga:10,ha:1,go:8}),sp.Rational(13,9),36-first,"h_a = (p_r − γ_o h_o) / γ_a","(κ₁ W + κ₂ O) / (W + O)",second/first,mean,invo.subs({p:36,ga:10,ha:2,go:8}),inverse.subs({p:decoded,go:8,ho:2,ga:10}),inverse.subs({p:affine,go:8,ho:1,ga:10}),"Una"]

MANUAL=['Oilhead800·10·1=8 kPa and waterhead1000·10·1=10 kPa add to18 kPa relative to atmosphere. Interface pressure is notreset.', 'Eachrho gh ispressure, so sum can be in kPa. Atmospheric pressure cancels inrelativep_r.', 'From top to bottom, p_r=gamma_o ho+gamma_a ha. Different densities have separate vertical increments.', 'At ho1 m,ha1→2 m givesp18→28 kPa, oilcontribution8unchanged.', 'ha=(18−8·1)/10=1 m>0; p_r>oilhead8kPa.', 'ho=(18−10·1)/8=1 m>0; p_r>waterhead10kPa.', 'ha1,ho1→2 m makes18→26 kPa; ratio26/18=13/9.', 'Proposal36−correct18=+18 kPa. Bothlayersarepositivecontributions, notopposedforces.', 'ha=(p_r−gamma_o ho)/gamma_a, positiveonlyifp_r>gamma_o ho. Mustsubtractpreexistinginterfacehead.', 'W=gamma_a ha,O=gamma_o ho arepressures. Ratio=(κ₁W+κ₂O)/(W+O), notproductoffactors.', 'Bothheightsdouble gives36 kPa compared18,ratio2.', 'Mean(18+36)/2=27 kPa. Bothmeanheights3/2 m give15+12=27 kPa bylinearity, a validcoincidencehere.', 'Target36kPa,ha2m leavesoilhead16kPa,ho2m. ho_B/ho_A=2.', 'q54/(18kPa)=3kPa^−1. S108→p_r36,ho2→ha(36−16)/10=2m.', 'q=(73−37)/(36−18)=2kPa^−1,z1. S57→p_r28,ho1→ha(28−8)/10=2m.', 'ha=ho=h makesp_r=(10+8)h kPa/m. 18kPa→h1m, exactlyonepositivepair. Equalheightconstraintdoesnotimplyequaldensityorhead.']
DISTRACTORS=['10 drops oil,8 drops water,20 treats oilasdenseaswater,36 doubles both. Addingatmospherereferencewouldanswerabsoluteinstead.', 'kg/m³ density,N force,m depth,kg/m² massperarea; onlykPa ispressure.', 'Subtractingwaterhead gives−2 kPa instead18;usingwaterdensityforboth gives20;usingoildensityforboth16;halvingthesum9 introducesanabsentaverage. Addactualheadswithoutresetatinterface.', '36 doublestwocontributionsalthoughonlywaterheightchanged;unchanged18 ignoresnewwater;26 doublesoilheadinsteadofwater;9 halvesoldtotalwithoutphysicalbasis.', '18/10 gives1.8m byforgettingoilhead;plus8 gives2.6m;inversemustreturndepthpositive.', '18/8 omitswaterhead;divideby10useswrongdensity;zeroheightincompatiblewithassignedpositivelayers.', '2 treatswholepressureasoilonly;9/13 inverse;14/9 correspondsdoublingwaternot oil;1ignoresextraoil.', '−18 reversesorder;+36 proposal;0 accepts;+9 halveserror.', 'Adding oilhead doublecountsit;p_r/gamma_a omitsit;divisionbygamma_o useswronglayergradient;gamma_a/(remaininghead) isinverselength. Positiveheightrequiresp_r>oilhead.', 'Productassumesbilinear;swappingfactorsscaleswronglayers;denominatorW dropsinitialoilhead;sumoffactorsignoresweightsandfailsboth1identity.', '4 multipliesdoublingsalthoughlawissum;1/2 inverse;1 ignores;3/2 onlypartialincrease.', '54 sum;27/2 halvesagain;18/36 useoneinputtrial. Equalmean-inputvaluefollowsaffinelinearity,notphysicalmixingoflayers.', '4 doublesnewheightagain;1/2 inverse;1 leavespressure28not36;3 produces44kPa.', 'Raw108aspressurewouldha46/5m; calibratedpressure36mustbeusedbeforeoilheadsubtraction.', 'ha1,3/2,5/2,3m at ho1 givesS37,47,67,77; only2m gives57.', 'Infiniteignoresindependentequalheightrelation;tworootsrequiresanabsentquadratic;zeroheightcannotproduce18kPa. Densityordering800<1000ensuresstablelayering.']
ASSUMPTIONS=['Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.', 'Static immiscible homogeneous oil800 kg/m³ above water1000 kg/m³, stable lighter-above ordering, uniformg10 m/s², bothverticalheightspositive. Atmosphericreferencecommon; p_r isgauge. Negligiblecapillaryjump makespressurecontinuous atinterface; inverses requiretotalheadstrictlygreaterthanotherlayerhead.']
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'kilopascal', 4: 'kilopascal', 5: 'meter', 6: 'meter', 7: 'dimensionless', 8: 'kilopascal', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'dimensionless'}
NUMERIC_UNITS={5: 'm', 6: 'm', 14: 'm'}
OPTION_SUFFIX={1: ' kPa', 7: '', 8: ' kPa', 11: '', 12: ' kPa', 13: '', 15: ' m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M140 1270L220 1370', 'M85 180H315M85 280H315', 'M140 1270H500', 'M220 1370L320 1470', 'M100 160V380H300V160', 'M140 1270V1530'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M140 1270H500', 'M140 1270V1530'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100, 730, 80, 50), (101, 280, 198, 100), (101, 180, 198, 100), (180, 730, 100, 50)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Layerheights100pxeach at100px/m: oil1m abovewater1m. Pressurebars80+100px at10px/kPa yield8+10=18kPa. Graphx10px/kPa,y100px/m: (140,1270)→(220,1370)→(320,1470), so interface8kPa iscontinuousandgradientchanges800to1000kg/m³. Neitherresetnorjump;fullXMLandnativefigurelabelsread.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-layered-liquids-{n:02}"
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
            if value!=wanted:errors.append("Independent hydrostatic conceptual key mismatch")
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
          "methods":["source_prompt_only_primary_normal_force_density_or_hydrostatic_column_balance","SymPy_exact_physical_balance_inverse_scaling_calibration_and_positive_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Layered hydrostatics with continuous interface pressure","reference":"Independently integrate each positive density head through the interface without resetting pressure; enforce stable oil above water and positive inverse layer heights."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U3-01","U2-01")
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
