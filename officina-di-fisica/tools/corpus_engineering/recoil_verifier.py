"""Independent source-prompt-first impulse/momentum review; no authoring imports.
Literal signatures cover only fully read candidate, source/provenance and SVG editions.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import pint
import sympy as sp
from .pipeline import canonical, digest, git_bytes, sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json"
CANDIDATE_REF='cd382fb9fe47b07a6414475b1192400f0fde4be5'
REVIEWED_PACKAGE_SHA256='62484eda5be716ffb42ab4fc38655812c1049f918829bcf8ea6a79837cd34bd1'
REVIEWED_BINDINGS_SHA256='259c63c457b804630cbce6355bee24c271f70a18539789b886a867929736a6bd'
BATCH='recoil-059'
ASSET_NAME='recoil-steps.svg'
FALSE_PROOF='La velocità di emissione indicata nel laboratorio può essere sostituita senza cambiamenti dalla velocità relativa al dispositivo che rincula.'
SVG_MUTATION=(b'M320 1030H200', b'M320 1030H260')
EXPECTED_IDS={f"AR-u2-recoil-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-recoil-01": "2863f20556f5fbf0af65f1f3c6e677a4ac55b746a74d64da08025deee5ce7a70",
    "AR-u2-recoil-02": "70493ad7169ce7bc05f42a0bf65cb1659d68a68eaced868f3d7d69f943b32cb5",
    "AR-u2-recoil-03": "d08bd6539f44f262802d3db1284f55b9bf8758949e2ad27fea171e8f1f913ed4",
    "AR-u2-recoil-04": "63092dc516ccd161f7b4f1cf12553bf2839d4c6e1e47d74f8ed0cb300cc460fa",
    "AR-u2-recoil-05": "d06d914d49b590d9cfcbe46351954632612dc1a7ffa45566c4cf346642918e4f",
    "AR-u2-recoil-06": "65795d39f4f952177cb2d810f5f6e55efefc8922e5d85a0503042fa309db6015",
    "AR-u2-recoil-07": "0c09fedbc6849e203711faa17f917da64ad3c0eaaa75dec7afd1ecce1e218b58",
    "AR-u2-recoil-08": "23947d09a36f5d4ef22046567bff114746b87544e26e0bed091f55e9d95b10f7",
    "AR-u2-recoil-09": "1af3a3178163784dadd4e5c6720c9e563dfd9572362de90fffe91d110e16cac2",
    "AR-u2-recoil-10": "a4b201f746baf7080368c90d4b9c1d0141bc4e56c26bb40f3dc7471dcdfd110f",
    "AR-u2-recoil-11": "fc4b04d334feac1b95d622cb46232f67ff8f6127f33129c8cd948cea30b25ae8",
    "AR-u2-recoil-12": "923e126a7ad888d0f1bb93fdabd84b6b802a9a18764ee58f2b736ddab5689520",
    "AR-u2-recoil-13": "c2096f13761db6127ed9fe03b165c4a252c33626d967ff70fac45ce53cd5ee9b",
    "AR-u2-recoil-14": "58f86d07aefce0c52a8029c0ef936a39d5a0e55e7f7004801139250f763b0bfb",
    "AR-u2-recoil-15": "e9afeb6be37e820803b54b65b25135e9817a46f8492e917a28e6e55117bef780",
    "AR-u2-recoil-16": "222ad3e6aaa2e83deb7f62aa61be94a5a9d1f9b1dc7cc948b260880d71fb7593"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    m,M,v,U,a,b,q,z,c,w=sp.symbols("m M v U a b q z c w",positive=True)
    law=sp.solve(sp.Eq(m*v-M*U,0),U)[0];assert law==m*v/M
    invM=sp.solve(sp.Eq(U,law),m)[0];invV=sp.solve(sp.Eq(U,law),v)[0]
    ratio=sp.cancel(law.subs({m:a*m,v:b*v},simultaneous=True)/law);assert ratio==a*b
    relative=sp.solve(sp.Eq(U,m*(w-U)/M),U)[0];assert relative==m*w/(M+m)
    kinetic=sp.factor(m*v*v/2+M*law**2/2);assert kinetic==m*v*v*(M+m)/(2*M) and kinetic.is_positive
    first=law.subs({m:2,M:2,v:2});second=law.subs({m:4,M:2,v:4})
    quantity=(SI.Quantity(2,"kg")*SI.Quantity(2,"meter/second")/SI.Quantity(2,"kg")).to("meter/second");assert quantity.magnitude==2
    assert kinetic.subs({m:2,M:2,v:2})==8
    mean=(first+second)/2;assert mean==5 and law.subs({m:3,M:2,v:3})==sp.Rational(9,2)
    gain=(SI.Quantity(6,"")/quantity).to("second/meter")
    decoded=(SI.Quantity(24,"")/gain).to("meter/second").magnitude;assert gain.magnitude==3 and decoded==8
    cal=sp.solve([sp.Eq(q*first+z,5),sp.Eq(q*second+z,17)],(q,z));assert cal=={q:2,z:1}
    affine=(9-cal[z])/cal[q];assert affine==4
    real=sp.symbols("real",real=True);roots=sp.solve(sp.Eq(law.subs({m:c*v,M:2},simultaneous=True).subs({c:1,v:real}),2),real)
    assert roots==[-2,2];physical=[r for r in roots if r>0];assert physical==[2]
    square=(SI.Quantity(2,"meter/second")*SI.Quantity(2,"kg")/SI.Quantity(1,"kg*second/meter")).to("meter**2/second**2");assert square.magnitude==4
    return [first,"m/s","U=mv/M","Da 2 a 4 m/s",invM.subs({U:2,M:2,v:2}),invV.subs({U:2,M:2,m:2}),2,4-first,
      "m=MU/v","κ₁ κ₂",second/first,mean,invV.subs({U:4*first,M:2,m:4})/2,
      invM.subs({U:sp.Rational(decoded),M:2,v:4}),invM.subs({U:affine,M:2,v:2}),physical[0]]

MANUAL=['Initial total laboratory momentum0. After emission +mv−MU=0, so U=mv/M=2·2/2=2 m/s; device component−2 m/s.', '(kg·m/s)/kg=m/s for recoil speed;component has same unit with negative sign.', 'Balance initial0 with emitted +mv and residual device−MU gives U=mv/M. M already denotes the residual mass.', 'M fixed2 kg,v2 m/s;emitted m2→4 kg gives recoil speed2→4 m/s in opposite direction.', 'm=MU/v=2·2/2=2 kg.', 'v=MU/m=2·2/2=2 m/s in laboratory;relative emitted-device speed isv+U=4 m/s.', 'FixedM,v and doubled emittedm doublesU;ratio4/2=2.', 'Proposed4−correct2=+2 m/s.', 'U M=m v; m=M U/v forv>0. Mass times speed divided by speed has mass dimensions.', 'With residualMfixed, m_B=a m_A,v_B=b v_A givesU_B/U_A=a b.', 'U_A2 m/s;U_B4·4/2=8 m/s;ratio8/2=4.', 'Mean(2+8)/2=5 m/s;mean-inputsm3 kg,v3 m/s give9/2 m/s,difference1/2 m/s.', 'TargetU8 m/s at newm4 kg,M2 kg requiresv=2·8/4=4 m/s;ratio4/2=2.', 'q=6/(2 m/s)=3 s/m;S24→U8 m/s;v4 givesm=2·8/4=4 kg.', 'q=(17−5)/(8−2)=2 s/m,z1. S9→U4 m/s;v2 givesm=2·4/2=4 kg.', 'm=c v withc1 kg·s/m, fixedM2 kg;U=c v²/M=2 m/s givesv²4 m²/s². Algebraic±2,positivev2 m/s,m2 kg;devicecomponent−2. Negative branch gives negativecoupledmass.']
DISTRACTORS=['Finalsystemmomentum0doesnotmean eachbodyrest; equalopposite4 kg·m/s momenta cancel. Initialkinetic0→final8 J usesinternalenergysupply.', 'kg·m/s ismomentumbeforedivisionbyM;Nforce,Jenergy,mlengthare differentdimensions.', 'DenominatorM+m would require relativeejectionspeedinstead ofgivenlaboratoryv;M−m subtractsemittedmasstwiceandisherezero;positivecomponentforrecoilviolatessignedbalance.', 'Unchanged2ignoresgreateremittedmomentum;8squaresmasschange;decreasing orzeroUcannotbalancepositiveemission.', 'MU vhaswrongmassdimensions;v/(MU)inverse mass;usinginitialM+m ininverse changesdefinedresidualmass.', '4 m/sisrelativevelocity,notlaboratoryv;negative2isthedevicecomponent,notemittedspeed.', '1ignoreschange;1/2reverses;4countsadoubledmasstwice.', '−2reversesorder;+4copiesproposal;zeroacceptsit;+1halveserror.', 'MUvhasenergylikemass-speed-squaredunits;v/(MU)inverse mass;replacingspeedwithrelativeonesilentlychangesreference.', 'Ratiosreverseonemass/speeddependence;sumfailsidentity;doublingMwithoutinstructionchangesexperiment.', '2countsoneinputonly;8isdimensionalnewvalue,notratio;1/4reverses.', '10issum;5/2halvesmeanagain;9/2ismean-inputoutput;6isneitherequal-weightmean. Bilinearinputmapdoesnotcommutewithmean.', 'v4m/sisnotpureratio4;unchangedv2atnewm4wouldU4belowtarget8.', 'RawS24notU24m/s;dividegain3thenapplymomentum inverse. BothvelocitiesmustremaininoneLABframe.', 'Atv2,M2,masses2,3,5,8kggiveS5,7,11,17;onlym4gives9. Offsetmustberemovedbeforeratio.', 'Noenergyconservationconstraintmaybefabricated: internalenergycanprovidepositivefinalkineticenergy. Positivebranchselectedbyspeedandmassdomains,notbothsignedroots.']
ASSUMPTIONS=['Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. v is measured in laboratory, not relative to recoilingdevice.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. ResidualMunchanged across trials;initialtotalmasscanchange.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. Equal-weightaveragesofseparatepreparedtrials.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. Continuousdimensionlesszero-offsetdisplay.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. Two distinctrecoilspeedsidentifyaffinegainandoffset.', 'Classical inertial laboratory; complete device plus emitted body initially at rest. Residual device mass M=2 kg is already after emission; emittedm>0 haslaboratoryvelocity+v, device component−U withU>0. Negligibleexternalimpulseandexternalwork;internalenergymaypoweremission,kineticenergyisnotassumedconserved. m=c v relatestrialparameters, eachmassconstantwithintrial;positiveemittedmassandspeedrequired.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'kg', 6: 'meter/second', 7: 'dimensionless', 8: 'meter/second', 9: 'kg', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'kg', 15: 'kg', 16: 'meter/second'}
NUMERIC_UNITS={1: 'm/s', 5: 'kg', 6: 'm/s', 11: '1', 13: '1', 14: 'kg', 16: 'm/s'}
OPTION_SUFFIX={8: ' m/s', 12: ' m/s', 15: ' kg'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M460 545H560', 'M320 1030H200', 'M180 545H80', 'M320 935H440'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M460 545H560', 'M320 1030H200', 'M180 545H80', 'M320 935H440'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    return 'Residualvelocity−2 m/s andemitted+2 m/s each100 px atshared50 px/(m/s). Signedmomentum−4,+4 kg·m/s each120 px at30 px/(kg·m/s),canceltozero. Initialsystemmass4 kgrest;residual2+emitted2explicit. Finalkinetic4+4=8 Jfrominternalenergy. Geometryschematicnotmassscale;laboratoryreferenceandmarkerdefinitionsreadwithfullpreview.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-recoil-{n:02}"
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
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(wanted):errors.append("Independent primary physical exact result mismatch")
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
                    literals.append(sp.Rational(raw))
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
          "methods":["source_prompt_only_primary_impulse_momentum_and_signed_system_derivation","SymPy_exact_momentum_equation_inverse_scaling_calibration_and_positive_branch","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Recoil from initially resting system in one laboratory frame","reference":"Before keys solve zero total initial momentum with residual device mass and emitted laboratory velocity, not relative ejection speed; energy can come from internal storage."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-05","U2-01")
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
