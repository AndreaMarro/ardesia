"""Independent source-prompt-first physical review, no candidate authoring imports.
Exact edition signatures frozen only after every record and final SVG were read.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json"
CANDIDATE_REF='8db52bf4e892df9db22554cfe0bb521853c3c2eb'
REVIEWED_PACKAGE_SHA256='6c9795b444643c46696f5e3d5d4e36f7c7a891782d2e1aa472be301d7856bb4c'
REVIEWED_BINDINGS_SHA256='b9d25b671a27587e51b4f4b6107f761d80bacb0cf8c041879d3569ee8a2c6677'
BATCH='gravity-ratio-066'
ASSET_NAME='gravity-ratio-steps.svg'
FALSE_PROOF='Per una massa di prova immutata la forza gravitazionale varia inversamente con la distanza alla prima potenza, quindi il rapporto è alpha/beta.'
SVG_MUTATION=(b'M400 1300H380', b'M400 1300H360')
EXPECTED_IDS={f"AR-u2-gravity-ratio-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-gravity-ratio-01": "2abf79a01bce281d6125d44c562b8289271f2af80fdc0228b4f7c2b95b5dc149",
    "AR-u2-gravity-ratio-02": "726f99e92acae90e675e4852c4da1d7ebdf1a5a9a2a190db01e4106c67d8080d",
    "AR-u2-gravity-ratio-03": "0a0dc4274949e5e4b5a46e7f3b429b5906d1638d0089ea909551a710246ad4c5",
    "AR-u2-gravity-ratio-04": "43f9ab2249691b39e5bb6695972f45b33f16f634b103fd04913396e9636a6891",
    "AR-u2-gravity-ratio-05": "6e6199aa0bd725ae9b66a48260795dcb497e9d30081a68853500a9dad85245ac",
    "AR-u2-gravity-ratio-06": "d4e8651addfac1345633b4bf927591878378c3ff4df4eb46c0a13e064c267248",
    "AR-u2-gravity-ratio-07": "b105c6205d1c645d53ba5a6b454e04bcd6efd7938e6ed77f7aea2121d9c7cb37",
    "AR-u2-gravity-ratio-08": "ab40f9917d018db3d4f7d6ffeae896954f7fe635bb91c083babdfd6a46c522d9",
    "AR-u2-gravity-ratio-09": "7da04a4b9883dfbcb9ebf683a03513f5cb8142c91fa6f9c640ebecba05574c71",
    "AR-u2-gravity-ratio-10": "0f68f74eb6b4ac2e4b8b87890abb85fbfa01f67ebc1daf2525a61655324242d3",
    "AR-u2-gravity-ratio-11": "941c551747db11365d1d6870417edf1b79186b2cd9a303632c2695564213ac7e",
    "AR-u2-gravity-ratio-12": "e0583f3d5444efc2aad001857ec64c7ce318929168530809c46068434073f046",
    "AR-u2-gravity-ratio-13": "ec0d1757c7b856f9dc94fcd7404ee42fd62f9a8a1c92406b6ddd92094ad7dba8",
    "AR-u2-gravity-ratio-14": "69ae708544e62184e9e24cf8b9491c3961731bc3d6702694353a50cb3044e478",
    "AR-u2-gravity-ratio-15": "1cbb303b61128b69f62f2b77ddaf3138e7f8f71dd7e253bf7fad0ca36c9e0a55",
    "AR-u2-gravity-ratio-16": "de84f764a4563cf88dd8e3a604117a274c07cc2f480d69afeb3f6a8be304b34a"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

# Only exact, individually read literal radicals are recognized beyond rationals.
# This is not an evaluator for arbitrary candidate prose or symbolic formulas.
EXACT_LITERALS={"√2/4":sp.sqrt(2)/4,"√2/2":sp.sqrt(2)/2,"2√2":2*sp.sqrt(2),
 "(4+√2)/4":(4+sp.sqrt(2))/4,"(4+√2)/2":(4+sp.sqrt(2))/2,
 "(4+√2)/8":(4+sp.sqrt(2))/8,"√(5/3)":sp.sqrt(sp.Rational(5,3))}
def parse_literal(raw):
    if len(raw)>80:raise ValueError("Literal too long")
    if raw in EXACT_LITERALS:return EXACT_LITERALS[raw]
    return sp.Rational(raw)

def oracle():
    G,M,m,r,alpha,beta,R,a,b,q,z=sp.symbols("G M m r alpha beta R a b q z",positive=True)
    base=G*M*m/r**2;new=base.subs({M:alpha*M,r:beta*r},simultaneous=True)
    law=sp.cancel(new/base);assert law==alpha/beta**2
    inv=sp.solve(sp.Eq(R,law),alpha)[0];assert inv==R*beta**2
    ratio=sp.cancel(law.subs({alpha:a*alpha,beta:b*beta},simultaneous=True)/law);assert ratio==a/b**2
    first=law.subs({alpha:2,beta:2});second=law.subs({alpha:4,beta:4})
    gv=SI.Quantity(1,"newton*meter**2/kg**2");F0=(gv*SI.Quantity(1,"kg")**2/SI.Quantity(1,"meter")**2).to("newton")
    F1=(gv*SI.Quantity(2,"kg")*SI.Quantity(1,"kg")/SI.Quantity(2,"meter")**2).to("newton")
    assert (F1/F0).to("").magnitude==Fraction(1,2)
    assert (first+second)/2-law.subs({alpha:3,beta:3})==sp.Rational(1,24)
    gain=(SI.Quantity(Fraction(3,2),"")/SI.Quantity(Fraction(1,2),"")).to("")
    decoded=(SI.Quantity(Fraction(3,4),"")/gain).to("").magnitude;assert gain.magnitude==3 and decoded==Fraction(1,4)
    cal=sp.solve([sp.Eq(q*first+z,2),sp.Eq(q*second+z,sp.Rational(3,2))],(q,z));assert cal=={q:2,z:1}
    affine=(3-cal[z])/cal[q];assert affine==1
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq(2/real**2,sp.Rational(1,2)),real);assert roots==[-2,2]
    constrained=sp.solve(sp.Eq(law.subs(alpha,beta),sp.Rational(1,2)),beta);assert constrained==[2]
    return [first,"1","R=α/β²","Da 1/2 a 1",inv.subs({R:first,beta:2}),next(x for x in roots if x>0),sp.Rational(1,4),1-first,
      "α=Rβ²","κ₁ / κ₂²",second/first,(first+second)/2,sp.sqrt(4/(first/2))/2,
      inv.subs({R:sp.Rational(decoded),beta:4}),inv.subs({R:affine,beta:2}),constrained[0]]

MANUAL=['F/F0=(G alpha M0 m/(beta r0)²)/(G M0 m/r0²)=alpha/beta². alpha2,beta2→R2/4=1/2.', 'N/N cancels: R dimensionless unit1; F0>0 required.', 'Only attractive mass varies; testmass same. Distancebetween centers scalesbeta,entire beta squared atdenominator.', 'At beta2,alpha2→4 givesR1/2→1. SameF0 throughout.', 'alpha=R beta²=(1/2)4=2,puremassratio not2kg.', 'beta²=alpha/R=2/(1/2)=4; roots±2,positivebeta2 because distancespositive.', 'R_A1/2,R_B2/16=1/8;ratio(1/8)/(1/2)=1/4.', 'Proposed1−correct1/2=+1/2,pure.', 'alpha=R beta²;linearalpha no rootneeded.', 'R_B/R_A=(a alpha/(b beta)²)/(alpha/beta²)=a/b².', 'R_A1/2,R_B4/16=1/4;ratio1/2.', 'Mean(1/2+1/4)/2=3/8. Meaninputsalpha3,beta3 gives1/3; difference(9−8)/24=1/24.', 'TargetR_B=(1/2)(1/2)=1/4,alpha_B4:beta_B²16,beta_B4,ratio4/2=2.', 'q=(3/2)/(1/2)=3;S3/4→R1/4;beta4→alpha(1/4)16=4.', 'q=[3/2−2]/[1/4−1/2]=(−1/2)/(−1/4)=2,z1;S3→R1;beta2→alpha4.', 'alpha=beta>0→R1/beta. R1/2→beta2,alpha2. Zero excluded fromoriginaldenominator,notextraneoussolution.']
DISTRACTORS=['2 usesmassalone;1/4 distancealone;1 usesinversefirstpower;4 reversesdistanceeffect. R1/2 meanshalfF0,not0.5N withoutF0.', 'N force,kgmass,m distance,N/mstiffness;nonepure.', 'alpha/beta loses square;alpha beta² increaseswithseparation;beta²/alpha reciprocal;alpha² changesbothmassesalthoughonlysourcechanged.', '2 doublesoutputtwice;1/4inversemasseffect;zero impossiblepositivefiniteparameters;unchangedignoresalpha.', 'R/beta² gives1/8;R beta gives1;unitkgfalseforratio.', '4 confusessquarewithratio;1/2inverse;negativebeta notdistance eventhoughsquaresame.', '1/2 misses square;2,4 increaseforcewithdistance;1 ignoreschange. NewR1/8 notrequestedratio1/4.', '−1/2reverseorder;+1proposal;0accepts;+1/4halveserror. alpha/beta causesproposal1.', 'R/beta² wrongoperation;beta²/RinvertsR;Rbeta missessquare;extra2failssubstitution.', 'a/b missessquare;a b²wrongdistanceeffect;reciprocalreverses; a²wouldrequirealsochangedtestmass.', '1 frominversefirstpower;2massonly;1/4distanceonly;4bothdirectionswrong.', '3/4sum;3/16halvesagain;1/3meaninputtrial;1/4singleoutcome. Fractions3/8and1/3distinctbycrossmultiplication9vs8.', 'Unchangedbeta2at alpha4 givesR1,not1/4. Newbeta4 notrequiredratio4;negativebranchinvalid.', 'RawS3/4asR givesalpha12 instead4. Dimensionlessdisplaycanhavegain3.', 'Withbeta2,alpha2,3,5,8 giveS2,5/2,7/2,5;onlyalpha4 givesS3. Decreasingstandardsyieldpositivegainbecausebothdifferencesnegative.', 'Zero invalid;negativebeta wouldimplynegativealpha;1givesR1,4givesR1/4. Positiveconstraintremovesonefactor,notquadraticpair.']
ASSUMPTIONS=['Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.', 'Newtonian positive point masses and same positive test mass, center-to-center distances r0 and beta r0 positive, G constant. If replacingpointmodelbysphericallysymmetricextendedbodies, configurationsmustbeexternallyseparatedinbothtrials; interiorusingtotalmassinvalid. Alpha,beta,R purepositive ratios to unchangedreference.']
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'dimensionless', 6: 'dimensionless', 7: 'dimensionless', 8: 'dimensionless', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'dimensionless'}
NUMERIC_UNITS={5: '1', 6: '1', 13: '1', 14: '1', 16: '1'}
OPTION_SUFFIX={1: '', 7: '', 8: '', 11: '', 12: '', 15: ''}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M80 210H180', 'M80 1110H480', 'M400 400H240', 'M400 850H320', 'M80 660H280', 'M400 1300H380'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M400 1300H380', 'M400 400H240', 'M400 850H320'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    return 'Referencecentraldistance1m100px;otherdistances2m200pxand4m400px atshared100px/m. Schematicmasssymbolsnotareascalibration. Separateforceprojectionstowardsleftcenter have160,80,20px at160px/F0,thusF0,F0/2,F0/8. Allmarkerreferencesandfullnativepreviewread; scalesdimensionallydistinct.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-gravity-ratio-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent momentum conceptual key mismatch")
        else:
            try:
                raw=str(value).replace("−","-");suffix=OPTION_SUFFIX.get(n,"")
                if suffix and not raw.endswith(suffix):raise ValueError("Required unit absent")
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.simplify(parse_literal(raw)-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or unit invalid")
        # This family has literal N/m choices beyond the common unit table.
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
          "methods":["source_prompt_only_primary_vector_Newton_gravity_or_work_derivation","SymPy_exact_vector_or_constitutive_equation_inverse_scaling_calibration_and_physical_domain","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Gravitational force ratios with central separation and exterior domain","reference":"Before keys divide Newton force laws for the same test mass, preserve inverse-square central separation and point/exterior-spherical assumptions."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-06","U2-01")
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
                cases.append({"case":"wrong_SVG_force_length_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong force length escaped independent Newton-scale geometry")
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
