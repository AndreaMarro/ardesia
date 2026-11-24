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
CANDIDATE_REF='c51637018e1e77241c7795b6ac6bbe24ebb37ff7'
REVIEWED_PACKAGE_SHA256='cae7276b3b5fac1c8d838aa5dc67a460a92e9f1d85d35719733c2ef572d899d6'
REVIEWED_BINDINGS_SHA256='9bb2d183c26f06bdec1b75ff4b198a649f67fd4f85028e6e5380501edd10ae11'
BATCH='density-075'
ASSET_NAME='density-steps.svg'
EXPECTED_SKILL='C2-L001'
EXPECTED_PREREQUISITES=['C2-L001']
FALSE_PROOF='Poiché il volume aumenta, la densità aumenta nello stesso rapporto anche quando la massa totale è invariata.'
SVG_MUTATION=(b'width="64"', b'width="128"')
EXPECTED_IDS={f"AR-u3-density-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u3-density-01": "34d024ca7bb2348ca255dac6011f6a18a056a257d0e474a45b0f6cb9a7754217",
    "AR-u3-density-02": "725d9c830d560e3adc4088091e004feadb07ec4cab1b6beeeebcd2566e4a1440",
    "AR-u3-density-03": "ee576449907881aa4f83292cf7994fe7ed12842c68a65ed8911a8cf6ddfd75bb",
    "AR-u3-density-04": "af66ec9225a68e20151aad6672142c51e685228d5911b39e108ec27650db505f",
    "AR-u3-density-05": "fd758b204b5f1a1895747c7523fb2f839d25c7772c4804e902a5387fb84f5490",
    "AR-u3-density-06": "d5733f40bc68694cb7ad5962bcbc67704f0b3f068411c7178f85c91fb00ec5cd",
    "AR-u3-density-07": "6e783ec4e663917a5c3e4f1e4e75ed60350fe5261880b749576dfb95232afd1a",
    "AR-u3-density-08": "0718b03e836e5ad2f41f4b509d4c6a41d64efc613b2a8de003716d17220ab09e",
    "AR-u3-density-09": "7f0742531c479e5a6763db11f6b8ee0139cb26b47afa6829260fba33cf0c131c",
    "AR-u3-density-10": "b48721d738a47f212fc232a7fc12211ac2c46f327630ef34df55386998348adb",
    "AR-u3-density-11": "a0807c5fc2eaab1447580e0d117124cdc0419cd7e607321babaf4d686b37820a",
    "AR-u3-density-12": "ac3840680a95e610fc59ca428b5ecd7756c853ae8336a92afc68a4eb34a35a63",
    "AR-u3-density-13": "373034901a7cff479b362f76db9556c5c85446ca8a7e29013f66ce7c23ac2510",
    "AR-u3-density-14": "b753927dc29dce21699fc2ea8f79e8c2e676c4ec817f098335e388b59b610aad",
    "AR-u3-density-15": "15f4926ed9c5620546ddbf4eb39ffac5f5193e598946ab7d1e47569db9053c14",
    "AR-u3-density-16": "38b328059f63ac6767c6a5d69403bfe708044425b5bd1f0d883d460e22026815"
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

def physical_density(mass,volume_liter):
    mass,volume_liter=map(Fraction,(mass,volume_liter))
    if mass<=0 or volume_liter<=0:raise ValueError("Positive net mass and occupied volume required")
    return mass/volume_liter

def oracle():
    m,V,rho,a,b,c=sp.symbols("m V rho a b c",positive=True)
    law=sp.solve(sp.Eq(m,rho*V),rho)[0];inverse=sp.solve(sp.Eq(rho,law),m)[0];volume=sp.solve(sp.Eq(rho,law),V)[0]
    assert sp.cancel(law.subs({m:a*m,V:b*V},simultaneous=True)/law)==a/b
    first=law.subs({m:3,V:2});second=law.subs({m:4,V:5})
    quantity=(SI.Quantity(3,"kg")/SI.Quantity(2,"liter")).to("kg/meter**3");assert quantity.magnitude==1500
    assert quantity.to("kg/liter").magnitude==Fraction(3,2)
    mean=(first+second)/2;assert mean-law.subs({m:sp.Rational(7,2),V:sp.Rational(7,2)})==sp.Rational(3,20)
    q,z,decoded,affine=calibrate(first,second,sp.Rational(9,2),sp.Rational(12,5),4,sp.Rational(13,5),5,"kg/liter")
    assert (q,z,decoded,affine)==(3,1,sp.Rational(4,5),2)
    assert sp.simplify(law.subs(m,c*V))==c
    return [first,"kg/L","ρ=m/V","Da 3/2 a 2 kg/L",inverse.subs({rho:first,V:2}),volume.subs({m:3,rho:first}),sp.Rational(2,5),3-first,"m=ρV","κ₁ / κ₂",second/first,mean,volume.subs({m:4,rho:second})/2,inverse.subs({rho:decoded,V:5}),inverse.subs({rho:affine,V:2}),"Infinite"]

MANUAL=['Net fluid mass3 kg divided by occupied volume2 L gives3/2 kg/L=1500 kg/m³; recipient mass is excluded.', 'Density dimension M/L³ can be expressed in kg/L since1 L=10^−3 m³.', 'For a homogeneous sample m=rho V, hence rho=m/V. No force, gravity or density gradient is involved.', 'At fixed2 L, different samples with3 and4 kg have densities3/2 and2 kg/L; this is not spontaneous compression of one fixed sample.', 'm=rho V=(3/2 kg/L)(2 L)=3 kg, net.', 'V=m/rho=3/(3/2)=2 L, positive.', 'At m3 kg,V2→5 L, densities3/2→3/5 kg/L; ratio(3/5)/(3/2)=2/5.', 'Proposed3 minus correct3/2 equals+3/2 kg/L.', 'm=rho V, with kg/L times L giving kg. Inverting rho instead would fail dimensions.', 'Ratio of densities for m_B=a m,V_B=b V is a/b, for positive factors.', 'rho_B4/5 kg/L divided by rho_A3/2 gives8/15.', 'Mean outputs=(3/2+4/5)/2=23/20 kg/L. Mean inputs m7/2,V7/2 yield1 kg/L, a difference3/20.', 'Target rho_B=(8/15)(3/2)=4/5 kg/L at m4 kg gives V_B5 L; ratio5/2.', 'q=(9/2)/(3/2 kg/L)=3 L/kg; S12/5 givesrho4/5 kg/L, V5 L thenm4 kg.', 'q=[13/5−4]/[4/5−3/2]=2 L/kg, z1. S5 givesrho2 kg/L, V2 L givesm4 kg.', 'Constraint m=cV,c3/2 kg/L makes density identical for every V>0. V2,m3 and V4,m6 show scale freedom, infinitely many pairs.']
DISTRACTORS=['2/3 reciprocates density;6 multiplies;3 ignores volume;1/2 divides volume scale but loses mass factor.', 'kg·L multiplies mass byvolume;L/kg isreciprocaldensity;kg ismass,L volume. Onlykg/L ismasspervolume.', 'V/m isreciprocaldensity;mV wrongdimension;2m/V doubles andm/(2V) halves a density notmodifiedbyanygivenfactor.', '3 kg/L doublesoldrho despite massfactor4/3;unchangedrho ignoresnewmass;9/8 appliesinversefactor3/4;zero excludedpositiveinput.', 'rho/V has kg/L²,V/rho reciprocal unit; only3 kg passes m/V=3/2 kg/L.', 'm rho has kg²/L,rho/m inverse volume; a negative volume is excluded.', '5/2 reciprocal;3/5 is new density number;1/5 loses first volume;1 assumes identical density despite allowed different states.', '−3/2 reverses requested sign;+3 repeats proposal;0 accepts error;+3/4 divides difference twice.', 'rho/V haskg/L²,V/rho notmass;2rhoV andrhoV/2 inventfactor2. Onlym=rhoV recoversbothcalibrationstates.', 'Product reversesvolume effect;reciprocal swapsinputs;κ₁² squaresmasswithoutbasis;sum failsunchanged-factoridentity.', '15/8 reverses;4/3 tracks mass alone;2/5 tracks volume alone;4/5 is final density number, not pure relative factor.', '23/10 is sum;23/40 halves twice;1 is density at mean inputs;7/10 is unrelated to the actual semisum.', '2/5 inverse;8/15 is density factor;5 is final volume number;4/3 ignores target density.', 'Using rawdisplay as density would m12 kg; exact gain3 L/kg must first be removed.', 'Masses2,3,5,8 kg at2 L produce S3,4,6,9; only4 kg produces5.', 'One pair would need separate mass or volume; neitherzero nor negative inputs are physical. The relation is between samples, not an unannounced time evolution.']
ASSUMPTIONS=['Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.', 'Homogeneous sample, positive net fluid mass m and occupied volume V in each trial, recipient tare removed. Samples or thermodynamic states may differ between trials; no claim of changing the mass at fixed volume while keeping one incompressible material unchanged. Density positive, exact1 L=10^−3 m³.']
UNITS={1: 'kg/liter', 2: 'kg/liter', 3: 'kg/liter', 4: 'kg/liter', 5: 'kg', 6: 'liter', 7: 'dimensionless', 8: 'kg/liter', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'kg/liter', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'dimensionless'}
NUMERIC_UNITS={5: 'kg', 6: 'L', 14: 'kg'}
OPTION_SUFFIX={1: ' kg/L', 7: '', 8: ' kg/L', 11: '', 12: ' kg/L', 13: '', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M100 160V390H240V160M370 160V390H510V160'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    rectangles={tuple(float(e.get(k,"nan")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(372, 190, 136, 200), (100, 755, 80, 42), (102, 310, 136, 80), (100, 1093, 64, 42), (100, 1013, 120, 42), (100, 675, 60, 42)}<=rectangles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Equal container section gives fill heights80/200 px at40 px/L for2/5 L. Mass bars60/80 px at20 px/kg for3/4 kg. Density bars120/64 px at80 px/(kg/L) for3/2 and4/5 kg/L. Identical vessel cross-section and distinct dimensional scales explicitly read in XML and complete native render.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u3-density-{n:02}"
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
      "title":"Homogeneous fluid density from net mass and occupied volume","reference":"Independently use net sample mass m=rho V and exact litre conversion; allow different samples/states across trials, not a mass-only change in a fixed incompressible sample."}}



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
