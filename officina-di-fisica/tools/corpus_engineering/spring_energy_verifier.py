"""Independent source-prompt-first spring review; no candidate authoring imports.
Edition signatures frozen only after full candidate, provenance and SVG reading.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json"
CANDIDATE_REF='7f7d0cb04e89593bd5bcb7165635a31b5d2e7e12'
REVIEWED_PACKAGE_SHA256='31b0f3e95da086b9692bb3ba62596a1360e35d23498c704ca67e836db62c9b98'
REVIEWED_BINDINGS_SHA256='36416b3b0f72c75dff75425adb2f724412da9b01f040a613be74e8e4745edc95'
BATCH='spring-energy-047'
ASSET_NAME='spring-energy-steps.svg'
FALSE_PROOF='L’energia immagazzinata è sempre la forza elastica finale per tutta la deformazione,quindi U=kell² senza il fattore un mezzo.'
SVG_MUTATION=(b'M100 1180Q260 1180 420 1020', b'M100 1180Q260 1140 420 1020')
EXPECTED_IDS={f"AR-u2-spring-energy-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-spring-energy-01": "5801e1be18859cee654bd5cc5b15ad298136ad4c32356bcc400e4d7e2b605f6b",
    "AR-u2-spring-energy-02": "c812d5966b8dd7210e79cb0c521abf7e415207b35b5e1903425c5a2c883270c7",
    "AR-u2-spring-energy-03": "738c541235b1b5e034de2011939446cda93a273fdf108252e4ac95395315ddb2",
    "AR-u2-spring-energy-04": "e10d57c3522c16c0837ef198227b0001534989f148c94a5f3a6ba48e21d4e982",
    "AR-u2-spring-energy-05": "161be77ebae0a79fe8734106bad925dcc5ebb7cc7bdd4dd10a2f8b5072707f33",
    "AR-u2-spring-energy-06": "ee78a3f72a0957054dc86ddb5555c5af69f934b54c8bf2a894c64023b833d7bf",
    "AR-u2-spring-energy-07": "2cfa53889c257c8bb75ac19b6e612e2a8b5d4c76ea6771924d18b4ac683a620f",
    "AR-u2-spring-energy-08": "12d301afe6c84290e1b41d1c3e15204039eff276d78233579a32b9697af81e94",
    "AR-u2-spring-energy-09": "1afcf9124d58684fc5cb31bd5daa149fc2864de16cd86091f1dd501975db6e11",
    "AR-u2-spring-energy-10": "8a2f861174d2fa5c66e2adaf6c329a42acbdf7bdc2f31cfd59b1b950d2a52d7d",
    "AR-u2-spring-energy-11": "edafd7bfe389a34c4e0266ef3a0bf87a4083fdcba5f50944565b3304844e82fc",
    "AR-u2-spring-energy-12": "e1c4e5c50104f70b42179473c72a5431ecf02cb3d0cde542428562f158e5c5a1",
    "AR-u2-spring-energy-13": "b986f94632f443146bf27e5a9ea809272aa2709ca9b251a3939ffffc3d9f3f4c",
    "AR-u2-spring-energy-14": "7db4e709f4e2b461bbfd9e3c1698475d5a12186ae7911a7f90ab85f10c2ce7d6",
    "AR-u2-spring-energy-15": "ced8b3bcb9b99fd10ede36a2441ecc62a2b22d5aeaa864b2d2391651cf34b93a",
    "AR-u2-spring-energy-16": "608dc77985404f1eadc8689433c0d7478e133e8ac09de14319a6a2263b68ddea"
}

@lru_cache(maxsize=1)
def source_records():
    repo=Path(__file__).resolve().parents[3]
    return {r["id"]:r for r in json.loads(git_bytes(repo,SOURCE_REF,SOURCE_PATH))}

def oracle():
    k,l,x,U,a,b,q,z,c=sp.symbols("k l x U a b q z c",positive=True)
    law=-sp.integrate(-k*x,(x,0,l));assert law==k*l*l/2
    inv=sp.solve(sp.Eq(U,law),k)[0];assert inv==2*U/l**2
    ratio=sp.cancel(law.subs({k:a*k,l:b*l},simultaneous=True)/law);assert ratio==a*b*b
    first=law.subs({k:2,l:2});second=law.subs({k:4,l:4});changed=law.subs({k:2,l:4})
    quantity=(SI.Quantity(2,"newton/meter")*SI.Quantity(2,"meter")**2/Fraction(2)).to("joule");assert quantity.magnitude==4
    mean_inputs=law.subs({k:3,l:3});assert mean_inputs==sp.Rational(27,2) and (first+second)/2-mean_inputs==sp.Rational(9,2)
    real=sp.symbols("real",real=True);quadratic=sp.solve(sp.Eq(law.subs({k:2,l:real}),4),real);assert quadratic==[-2,2]
    positive=[r for r in quadratic if r>0];assert positive==[2]
    gain=(SI.Quantity(12,"")/quantity).to("1/joule")
    decoded=(SI.Quantity(96,"")/gain).to("joule").magnitude;assert gain.magnitude==3 and decoded==32
    cal=sp.solve([sp.Eq(q*first+z,9),sp.Eq(q*second+z,65)],(q,z));assert cal=={q:2,z:1}
    affine=(17-cal[z])/cal[q];assert affine==8
    constrained=sp.factor(law.subs(k,c*l));assert constrained==c*l**3/2
    cubic=sp.solve(sp.Eq(constrained.subs({c:1,l:real}),4),real);assert cubic==[2]
    cube_units=(SI.Quantity(2,"")*SI.Quantity(4,"joule")/SI.Quantity(1,"newton/meter**2")).to("meter**3");assert cube_units.magnitude==8
    return [first,"J","U=kℓ²/2","Da 4 a 8 J",inv.subs({U:4,l:2}),positive[0],changed/first,8-first,
      "k=2U/ℓ²","κ₁ κ₂²",second/first,(first+second)/2,sp.sqrt(2*(8*first)/4)/2,
      inv.subs({U:sp.Rational(decoded),l:4}),inv.subs({U:affine,l:2}),cubic[0]]

MANUAL=['Restoring Fx=−kx gives U=−integral(Fx dx)=kell²/2 from the natural zero. k2 N/m and ell2 m give final force4 N and triangle area(1/2)·2 m·4 N=4 J.', '(N/m)·m²=N m=J. The coefficient one half is dimensionless.', 'The force-modulus graph triangle has base ell and height kell. U=kell²/2 is the same for opposite signed deformations of equal modulus.', 'At fixed ell2 m, stiffness2→4 N/m gives energy4→8 J. Linear in k, quadratic in ell.', 'k=2U/ell²=8 J/(4 m²)=2 N/m. Omitting inverse factor2 would give k1 N/m and only2 J.', 'ell²=2U/k=4 m². Algebraic roots±2 m give only one positive modulus2 m; coordinates x±2 m share it.', 'U_A4 J,U_B16 J; ratio4. Both triangle base and height double.', 'Proposed8−correct4=+4 J. The proposal uses the full final-force rectangle instead of the triangle.', '2U=kell²; divide positive ell²: k=2U/ell². J/m² equals N/m.', 'New U=(1/2)(a k)(b ell)²=ab²U, so the ratio is ab².', 'U_A4 J,U_B32 J; ratio32/4=8=2·2².', 'Mean(4+32)/2=18 J. Mean inputs3 N/m,3 m give27/2 J, smaller by9/2 J.', 'Target32 J at stiffness4 N/m gives ell_B²=64/4=16 m²; positive ell_B4 m and ratio4/2=2.', 'q=12/(4 J)=3 J^-1. Reading96 gives32 J; k=64 J/(16 m²)=4 N/m.', 'q=(65−9)/(32−4)=2 J^-1, offset1. Reading17 gives U8 J; k=16/(2²)=4 N/m.', 'k=c ell, c1 N/m², gives U=c ell³/2. Thus ell³=8 m³ and the unique real positive ell is2 m, k2 N/m. This is cubic; negative2 does not give positive4 J.']
DISTRACTORS=['8 J treats the final force as constant along the entire extension. Actual force grows from zero; elastic work is−4 J while potential increases+4 J.', 'N force,N/m stiffness,m length and1 pure differ from energy.', 'kell² is double the triangular area;kell is force; negative potential confuses restoring work with potential at the natural minimum; inverse ell² gives wrong dimensions.', '16 squares the stiffness change;2 assigns an inverse effect; negative violates positive k and natural-zero minimum; unchanged ignores greater work.', 'Missing factor2 gives k1 and only2 J. Dividing by ell instead of ell² gives force,not stiffness.', '4 m confuses ell² with ell and gives16 J. Negative ell is not a modulus; opposite x directions do not create two different positive moduli.', '2 is the final-force ratio;1/4 and1/2 reverse comparisons;8 requires also doubling stiffness.', '−4 reverses subtraction;+8 repeats proposal;zero accepts it;+2 halves discrepancy. Restoring-work sign does not alter the specified energy subtraction.', 'U/(2ell²) is one quarter of the correct inverse;2U/ell gives force;the reciprocal gives compliance;negative k is outside the model.', 'ab is the force ratio;a²b squares the wrong input;a/b² reverses deformation effect;sum fails identity.', '4 misses stiffness doubling or uses force ratio;2 changes stiffness alone;32 J is the output,not the pure ratio.', '36 is sum;9 divides twice;28 is difference;27/2 belongs to the mean-input configuration.', 'Ratio4 would give total energy factor2·4²=32 rather than8. Negative-root extension is not another physical modulus.', 'Using reading96 as joules would give k12 N/m,retaining gain3. Decode energy before the inverse.', 'At ell2 m,stiffnesses2,3,5,8 N/m give energies4,6,10,16 J and readings9,13,21,33. Only4 N/m gives17.', 'The between-trial substitution changes the square to a cube; applying an independent-k square-root inverse is invalid. The positive cubic is monotone and2U/c has unit m³.']
ASSUMPTIONS=['Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. Algebraicnegativebranchdoesnotcreateanegativemodulus;compressionhasnegativecoordinatebutpositiveell.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. Positivebetween-trialfactoronthesquareddeformationmustitselfbesquared.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. Equalstatisticalweights;nonlinearinputmappingdoesnotcommutewithmean.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. Continuousdimensionlesszero-offsetdisplay.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. Two distinct energy standards determinegainandoffset.', 'Ideal linear Hooke spring with k>0 constant within each trial,allconfigurations in declared elasticlinear regime. Signeddeformationx fromnaturallength and positive modulusell=|x|;potentialzeroatnaturalconfiguration. Onlyspringpotentialincluded,noextra kinetic/gravitationalenergies. Fx=−kx andU=kx²/2;quasistaticlosslessexternalworkfromnaturalzeroequalsU,whileelasticworkis−DeltaU. k=c ell linksdifferenttrials,notarigidityvaryingduringoneHookedeformation. Positivecubicbranchuniquelyselectsell2m,k2N/m.']
UNITS={1: 'joule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'newton/meter', 6: 'meter', 7: 'dimensionless', 8: 'joule', 9: 'newton/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'newton/meter', 15: 'newton/meter', 16: 'meter'}
NUMERIC_UNITS={1: 'J', 5: 'N/m', 6: 'm', 11: '1', 13: '1', 14: 'N/m', 16: 'm'}
OPTION_SUFFIX={8: ' J', 12: ' J', 15: ' N/m'}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    needed={'M100 1180Q260 1180 420 1020', 'M100 440H340V200Z', 'M100 440L340 200'}
    if not needed<=paths:raise ValueError("Independently reviewed force scale or graph curve changed")
    arrows=set()
    for e in root.iter():
        if e.get("d") in arrows and not e.get("marker-end"):
            raise ValueError("Reviewed vector arrowhead missing")
    t=sp.symbols("t",real=True)
    bx=(1-t)**2*100+2*(1-t)*t*260+t*t*420
    by=(1-t)**2*1180+2*(1-t)*t*1180+t*t*1020
    ell=(bx-100)/80;energy=(1180-by)/10
    if sp.simplify(energy-2*ell**2/2)!=0:raise ValueError("Independent energy Bezier scale derivation failed")
    return 'Forcegraphscales120px/m and60px/N:base240px=2m,height240px=4N,triangle4J. Energygraphscales80px/m and10px/J:quadraticBeziercontrols(100,1180),(260,1180),(420,1020) giveell4t andU16t² exactly,passing(2m,4J),(4m,16J). Graphaxesandnaturalpotentialzero explicit;scalesnotphysicallengthsofspring.'

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    results=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row["id"].rsplit("-",1)[1]);sid=f"u2-spring-energy-{n:02}"
        source=originals[sid];provenance=b.get("provenance",{})
        if b.get("sourceId")!=sid or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=sid
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"):
            errors.append("Independent pinned source provenance mismatch")
        wanted=answers[n-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent Newton conceptual key mismatch")
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
          "methods":["source_prompt_only_primary_Hooke_Newton_or_energy_derivation","SymPy_exact_spring_network_constraint_inverse_scaling_calibration_and_physical_branch","Pint_exact_physical_quantity_and_display_gain_units","separate_manual_assumption_distractor_and_scaled_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT","reviewedCandidateCommit":CANDIDATE_REF,
      "packageSha256":digest(package),"bindingsSha256":digest(bindings),"source":{"commit":SOURCE_REF,"path":SOURCE_PATH,
      "title":"Elastic potential energy from the integral of the restoring force","reference":"Before candidate keys integrate oriented Hooke force from natural zero; independently check energy inverse with squared deformation, means and positive cubic coupling. Final existing C1-L007 mapping separately reread."}}



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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U2-04","U2-01")
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
