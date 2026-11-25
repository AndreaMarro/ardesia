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
CANDIDATE_REF='39fe6d280266b5fcedf4c94040207e910c839e6c'
REVIEWED_PACKAGE_SHA256='c38c1d8038e3189c9b3edd659001449c88e24114614ff01969b87f36cc711ac0'
REVIEWED_BINDINGS_SHA256='4fe094332c44d5cc99984629427f1d5c9b3889c3605b33e26c13460aae9f4fbe'
BATCH='circular-orbit-067'
ASSET_NAME='circular-orbit-steps.svg'
FALSE_PROOF='Alla gravità bisogna aggiungere una seconda forza centripeta uguale per mantenere l’orbita, quindi il bilancio radiale contiene due volte la gravità.'
SVG_MUTATION=(b'M100 1560H200', b'M100 1560H150')
EXPECTED_IDS={f"AR-u2-circular-orbit-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-circular-orbit-01": "43b1bc22971963caf4d975fcdd5552fb1b9983973b46de4a61472771a05a9a69",
    "AR-u2-circular-orbit-02": "1ea56087ca5d9cc61811332f2c051b3ef01490a1da8bf5511992cc395779677d",
    "AR-u2-circular-orbit-03": "0d4c0f1d6addf8c8aa0757d2fd0b6f92862010a5137ae44004867d4ca2523e8d",
    "AR-u2-circular-orbit-04": "1cec05c44d9aaa33ce2ba5b49fd6b8c04a70b3735ba12ecbfe8d717f6133ab50",
    "AR-u2-circular-orbit-05": "efbba707c697354364d043d4b0d7ba391fd6b8da34d1f520992e9f9af3a241f0",
    "AR-u2-circular-orbit-06": "fc499b481eb259ee7a3547e5649e8d0378250f55ef6895be740444647cdc9487",
    "AR-u2-circular-orbit-07": "b89c59611f2a0f8b345b1acce1692831c366259bc78885f39aa203e3d635c7b9",
    "AR-u2-circular-orbit-08": "7e3e81120299c7f921956177650f75bee8cd7c7129727580df192e529ddf7ea6",
    "AR-u2-circular-orbit-09": "72e97575eef17684c979dddce2899b9ad38dad0bffa4616ad96500d3d129bc7b",
    "AR-u2-circular-orbit-10": "e0436d6feb6ba18ba8ba5358f7e688e584d7eb1d3ae2bcb07f8464aaf14d8396",
    "AR-u2-circular-orbit-11": "8614cd65382092f537eba354cecc70b823e8fd18da6e3bdaabe51a539410b05f",
    "AR-u2-circular-orbit-12": "3e5be7ad44be94dbd840fae34fc775ac87c69457278f63189273aa3e0499958b",
    "AR-u2-circular-orbit-13": "c8f70eba59a586e5b6984107885a377ddcf89a501905d7bc9625e869c7458919",
    "AR-u2-circular-orbit-14": "1097c75a7c7cd0fb61033ee0907b8bb0aaa1191f07e3bb4060a675a70d4f127b",
    "AR-u2-circular-orbit-15": "abd5e4d1095bf906083b2d5d603c4cbcdc3bafa5d9d741fe90174c59cef5a6d5",
    "AR-u2-circular-orbit-16": "f6849f2be6c263324a7607cbda874c26b7a6f5b6b2168e49cc7d8d0dae51108a"
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
    m,mu,r,V,a,b,q,z,c=sp.symbols("m mu r V a b q z c",positive=True)
    law2=sp.solve(sp.Eq(m*V**2/r,m*mu/r**2),V**2)[0];assert law2==mu/r
    law=sp.sqrt(law2);inv=sp.solve(sp.Eq(V**2,law2),mu)[0];invr=sp.solve(sp.Eq(V**2,law2),r)[0]
    ratio=sp.simplify(law.subs({mu:a*mu,r:b*r},simultaneous=True)/law);assert sp.simplify(ratio-sp.sqrt(a/b))==0
    first=law.subs({mu:4,r:1});second=law.subs({mu:1,r:2})
    quantity=(SI.Quantity(4,"meter**3/second**2")/SI.Quantity(1,"meter")).to("meter**2/second**2");assert quantity.magnitude==4
    mean=(first+second)/2;assert sp.simplify(mean-(1+sp.sqrt(2)/4))==0
    assert sp.simplify(mean-law.subs({mu:sp.Rational(5,2),r:sp.Rational(3,2)}))!=0
    gain=(SI.Quantity(6,"")/SI.Quantity(2,"meter/second")).to("second/meter");assert gain.magnitude==3
    decoded=sp.simplify((3*sp.sqrt(2)/2)/sp.Rational(gain.magnitude));assert decoded==sp.sqrt(2)/2
    cal=sp.solve([sp.Eq(q*first+z,5),sp.Eq(q*second+z,1+sp.sqrt(2))],(q,z));assert cal=={q:2,z:1}
    affine=(9-cal[z])/cal[q];assert affine==4
    constrained=sp.simplify(law2.subs(mu,c*r));assert constrained==c and not constrained.has(r)
    assert (SI.Quantity(4,"meter**2/second**2")*SI.Quantity(2,"meter")).to("meter**3/second**2").magnitude==8
    return [first,"m/s","V=√(μ/r)","Da 2 a 4 m/s",inv.subs({V:2,r:1}),invr.subs({mu:4,V:2}),sp.Rational(1,2),4-first,
      "μ=V²r","√(κ₁/κ₂)",second/first,mean,invr.subs({mu:1,V:sp.sqrt(2)/2}),
      inv.subs({V:decoded,r:2}),inv.subs({V:affine,r:1}),"Infinite"]

MANUAL=['Gravitym mu/r² equalsrequiredcentripetalmV²/r. Cancelm,r>0:V²mu/r=4m²/s²,positiveV2m/s.', 'mu/r hasunits(m³/s²)/m=m²/s²;radicalm/s.', 'V=sqrt(mu/r)fromradialNewton,nosecondcentripetalforce. Speedmodconstant,velocityvectortangentchangesdirection.', 'mu4→16 atr1 makesV²4→16 andV2→4m/s;distinctestablishedcircularorbits.', 'mu=V²r=4m²/s²·1m=4m³/s²,notcentralmasskg.', 'r=mu/V²=4/4=1m fromcenter,notheightabovesurface.', 'mu4,r1→4m givesV2→1m/s;ratio1/2.', 'Proposal4−correct2=+2m/s. V4 at r1 wouldrequiremu16.', 'SquarepositiveVthenmultiplyr:mu=V²r.', 'RatioofV²=a/b,positiveVratio sqrt(a/b). Commonfactorsa=b leaveVunchanged.', 'V_A2,V_Bsqrt(1/2)=sqrt2/2m/s;ratio sqrt2/4.', 'Mean(2+sqrt2/2)/2=1+sqrt2/4=(4+sqrt2)/4m/s. Meaninputmu5/2,r3/2 gives sqrt(5/3),differentorbit.', 'Vtarget=(sqrt2/4)2=sqrt2/2m/s,square1/2. mu_B1 yieldsr_B2m;ratio2.', 'q6/(2m/s)=3s/m;S3sqrt2/2→Vsqrt2/2m/s;mu=V²r=(1/2)2=1m³/s².', 'ΔSsqrt2−4,ΔV(sqrt2−4)/2m/s,nonzerocommonfactor→q2s/m,z1. S9→V4m/s,r1→mu16m³/s².', 'mu=c r,c4m²/s²→V²=c for everyr>0. MeasurementV2 redundant;infinitepositivepairs(r1,mu4),(r2,mu8),andallpositiveradiiunderpointmodel.']
DISTRACTORS=['4isV²number;negative2notrapidity;escapespeedhasextra sqrt2,nothere. Tangentialdirectionnotfixedbyenergyorspeedalone.', 'mdistance,m²/s²radicand,Nforce,1pure;nonevelocityunit.', 'mu/r skipsroot;sqrt(2mu/r)escapeproblem;sqrt(mu r)andsqrt(r/mu)wrongunits. Noncircularorbitrequiresadditionalenergyinformation.', '8usesmu linearly;1 inverse;zeroexcludedpositivefinitefield. Changingcentralparameterduringoneorbitnotdescribed.', 'Vr missessquare;V²/r acceleration;massM wouldalso requireGnotneededforassignedmu.', 'mu/V wrongunit;surfaceheightcannotbedeterminedwithoutcentralradius. Extendedbodyrequiresoutsidecheck.', '1/4losesroot;2or4wrongrdependence;1ignoreschange. No spontaneousinterorbittransitionclaim.', '−2reverseorder;4proposal;1halveserror. Radialconditionatproposedspeedwouldneedfourtimesmu.', 'Vrunitm²/s;V²/racceleration;r/V²reciprocalfactor;extra2doesnotfollowNewtoncircle.', 'a/bisratioofsquares;productswrongrdependence;reciprocalreverses; a/sqrtb missesrootonmu.', 'sqrt2/2isV_Bnumbernotratio;1/4missingrootonmueffect;2sqrt2inverse;1/2onlyonechange. Exactradicalsneednodecimal.', '(4+sqrt2)/2sum;denominator8halvesagain;sqrt(5/3)mean-inputorbit;sqrt2/4ratioofspeeds,notmeanwithunit.', 'Dividingmu byVratherthanV²failsunits. Holdingr1wouldV1,notdesiredsqrt2/2.', 'Rawreadingasspeedwouldsquaregain3andgive mu9. Symbolicradicalcancelsexactlyinsquare.', 'At r1,mu4,8,32,64 giveS5,1+4sqrt2,1+8sqrt2,17,none9. ΔS andΔVbothnegativegivepositivegain;commonfactornonzero since2!=16.', 'Onepairnotidentifiablebecausemeasurementaddsnoindependentconstraint;zeroexcluded. Extendedsphericaldomainwouldrestrictrabovebodybutstillcontinuum,notadoptedhere.']
ASSUMPTIONS=['Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.', 'Newtonian classical circular orbit around central point body,mu=GM>0,r>0. Positive testmass with centralrecoilneglectedinexplicitapproximation;fixedcenterinertialmodel,onlygravity. Vpositivespeed,tangentvelocitychangesdirection. Extendedsphericallysymmetricbodyrequiresroutsideitsradiusineachtrial. Distinctorbitsnotinstantaneousparameterchange.']
UNITS={1: 'meter/second', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'meter**3/second**2', 6: 'meter', 7: 'dimensionless', 8: 'meter/second', 9: 'meter**3/second**2', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter/second', 13: 'dimensionless', 14: 'meter**3/second**2', 15: 'meter**3/second**2', 16: 'dimensionless'}
NUMERIC_UNITS={1: 'm/s', 5: 'm³/s²', 6: 'm', 8: 'm/s', 13: '1', 14: 'm³/s²'}
OPTION_SUFFIX={7: '', 11: '', 12: ' m/s', 15: ' m³/s²'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {'M390 1560H440', 'M400 300V200', 'M400 300H320', 'M140 1250H180M420 1250H580', 'M100 1560H200'}<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows={'M100 1560H200', 'M400 300H320', 'M390 1560H440', 'M400 300V200'}
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):raise ValueError("Reviewed vector arrowhead missing")
    circles={tuple(float(e.get(k,"nan")) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")}
    if not {(300, 300, 100), (420, 1250, 160), (140, 1250, 40)}<=circles:raise ValueError("Independently reviewed force scale or graph curve changed")
    return 'Firstorbitalradius100px=1m at100px/m; tangentV2m/s100px at50px/(m/s),radialacceleration4m/s²80px at20px/(m/s²),perpendicularvectors. Comparisonr1and4m usescommon40px/m (radii40,160px),separateVprojection100,50px at50px/(m/s). Bottomvectorsnowseparatepathswithmarker-endeach; geometricandspeedscalesdistinctandallcirclesread.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-circular-orbit-{n:02}"
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
      "title":"Circular orbital speed from radial Newton balance","reference":"Before keys identify gravity as centripetal resultant, not an added force, solve positive speed and central-radius inverse; preserve test-body and exterior-spherical domain."}}



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
