"""Independent double-integration oracle for sixteen read starts-from-rest tasks.

Candidate edition6e2e8bf1 was individually read; no authoring module is imported.
Selected trial duration and within-trial time are separate in the constrained16.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import pint
import sympy as sp
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json"
CANDIDATE_REF="6e2e8bf1afb7f7c91d8060976f4f07c2348d4bbf"
REVIEWED_PACKAGE_SHA256="6801de9a6c557fa3699ed5a7eac87f03c68495c5c4482958a7ea1b434f32b7ae"
REVIEWED_BINDINGS_SHA256="8f1a9583132c054cba380d55f1b527f057c3894f2204314131771746c599cbd2"
EXPECTED_IDS={f"AR-u2-rest-accelerated-distance-{n:02}"for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-rest-accelerated-distance-01": "4c2a30e2496926047ff323f581c118a5cff7219daf5834cefd14cc2dce33564d",
    "AR-u2-rest-accelerated-distance-02": "b5390b7518f95adffdaccf778025384ec20bdddfd66ac7673dac6f7bd2e0fb4f",
    "AR-u2-rest-accelerated-distance-03": "24efcf0ac50305f5a48fe411f048b94bc3a73e91b33988b1a668c7f2759d67b1",
    "AR-u2-rest-accelerated-distance-04": "ceced1d5acc52df979b78f92790eed388c8aa3d2174ebff55b1fd7b27051b40d",
    "AR-u2-rest-accelerated-distance-05": "9651570ca40093b2c61d8b25d73b2e4c8c6d04b7352ba20d502235ac1a836318",
    "AR-u2-rest-accelerated-distance-06": "6177ce172d145b81588bef198391c4de24ef3f69f82f63d7af72e7c59c4b0016",
    "AR-u2-rest-accelerated-distance-07": "ea7924ce4012c4746768b75300d40d278d8c06fcab24cb49a0447083ef2b8bde",
    "AR-u2-rest-accelerated-distance-08": "ef755c6a538e72781fa4075e10dd6a9332096170ee641d6e2483885a162b7a7b",
    "AR-u2-rest-accelerated-distance-09": "679a7a86e14e2361b744ec8c4abef6f7d776e98549e4477aeb6ffc511b96eba6",
    "AR-u2-rest-accelerated-distance-10": "26a7209486b9ecd56da9ba87983e9e78f86771899b5924d82715a0e8ee62b4d7",
    "AR-u2-rest-accelerated-distance-11": "e42fb4c8041700c6c04d285a80ca1e6fdda7ae96b597cf3f0a109adfe68f72e3",
    "AR-u2-rest-accelerated-distance-12": "a2ffc9bed1211c70635e8d64efa6e9cee86d3c6b20f1779e376f74f991c53e5c",
    "AR-u2-rest-accelerated-distance-13": "eac7020ae9d0d540a5f3382a00fa148ebc0b4a8f3f8e8d95c423c8253d59bffc",
    "AR-u2-rest-accelerated-distance-14": "7012b4a1d57b5867b52f3906508b6883e5bb8da73550f416fb56b1975222d7d3",
    "AR-u2-rest-accelerated-distance-15": "03b03d81cce55bfadacf330549e0872d02c3b5a1c708cca0a571e572f71ae180",
    "AR-u2-rest-accelerated-distance-16": "00eb848cc6ccea510d72804c78ddea0a2a7d7d2458ed198bd590cfc55d1fc573",
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}


def rest_displacement(acceleration,duration):
    tau,inner=sp.symbols("tau inner",real=True)
    velocity=sp.integrate(sp.sympify(acceleration),(inner,0,tau))
    return sp.integrate(velocity,(tau,0,duration))


def oracle():
    a,t,D,k1,k2,kappa=sp.symbols("a t D k1 k2 kappa",positive=True)
    tau=sp.Symbol("tau",nonnegative=True)
    law=rest_displacement(a,t)
    if sp.diff(law,t,2)!=a or sp.diff(law,t).subs(t,0)!=0 or law.subs(t,0)!=0:
        raise ValueError("Independent rest initial conditions or double integration failed")
    inverse_a=sp.solve(sp.Eq(D,law),a)[0]
    inverse_t=sp.solve(sp.Eq(D,law),t)[0]
    scaling=sp.cancel(law.subs({a:k1*a,t:k2*t},simultaneous=True)/law)
    if sp.simplify(scaling-k1*k2**2)!=0:
        raise ValueError("Independent quadratic scaling failed")
    first=rest_displacement(2,2);second=rest_displacement(4,4)
    a_from_first_second=sp.solve(sp.Eq(rest_displacement(a,1),1),a)[0]
    only_second_second=sp.integrate(a_from_first_second*tau,(tau,1,2))
    x_graph=rest_displacement(4,t)
    if x_graph.subs(t,0)!=0 or sp.diff(x_graph,t).subs(t,0)!=0 or sp.diff(x_graph,t,2)!=4:
        raise ValueError("Independent position graph shape failed")
    unit_distance=SI.Quantity(Fraction(1,2),"")*SI.Quantity(2,"meter/second**2")*SI.Quantity(2,"second")**2
    if unit_distance.to("meter").magnitude!=first:
        raise ValueError("Independent quadratic position units failed")
    gain=SI.Quantity(12,"")/SI.Quantity(int(first),"meter")
    corrected_distance=SI.Quantity(96,"")/gain
    corrected_a=(2*corrected_distance/SI.Quantity(4,"second")**2).to("meter/second**2").magnitude
    if gain.to("1/meter").magnitude!=3:
        raise ValueError("Independent displacement display gain units failed")
    g,offset=sp.symbols("g offset",real=True)
    calibration=sp.solve([sp.Eq(g*first+offset,9),sp.Eq(g*second+offset,65)],(g,offset))
    recovered_distance=(17-calibration[offset])/calibration[g]
    # a=kappa*T is a constant in within-trial tau. Jerk is zero during the trial.
    selected_velocity=sp.integrate(kappa*t,(tau,0,tau))
    selected_distance=sp.integrate(selected_velocity,(tau,0,t))
    if sp.simplify(selected_distance-kappa*t**3/2)!=0 or sp.diff(kappa*t,tau)!=0:
        raise ValueError("Across-trial constraint confused with within-trial variable acceleration")
    # A different physical model a(tau)=kappa*tau would give kappa*T³/6.
    wrong_jerk_distance=sp.integrate(kappa*tau**2/2,(tau,0,t))
    if sp.simplify(wrong_jerk_distance-kappa*t**3/6)!=0:
        raise ValueError("Independent constant-jerk countermodel failed")
    selected_duration=sp.solve(sp.Eq(selected_distance.subs(kappa,1),4),t)[0]
    cubic_units=(2*SI.Quantity(4,"meter")/SI.Quantity(1,"meter/second**3")).to("second**3").magnitude
    if selected_duration**3!=sp.Rational(cubic_units):
        raise ValueError("Independent constrained duration dimensions failed")
    return [first,"m",only_second_second,"Raddoppia da 4 m a 8 m",
            inverse_a.subs({D:4,t:2}),inverse_t.subs({D:4,a:2}),rest_displacement(2,4)/first,
            "Parabola con concavità verso l’alto e tangente orizzontale all’origine","a=2D/t²","κ₁κ₂²",
            second/first,(first+second)/2,sp.solve(sp.Eq(rest_displacement(4,t),8*first),t)[0]/2,
            sp.Rational(corrected_a),2*recovered_distance/2**2,selected_duration]

MANUAL=[
 "v0=0;integrate constant2m/s² to v=2tau;integrate velocity0..2s gives4m;triangle half of8m rectangle",
 "(m/s²)s²=m;half isdimensionless;time unit must also be squared",
 "first-second1m fixes a=2m/s²;integral velocity2tau over1..2s gives3m,or total4minusfirst1",
 "same2s:half·2·4=4m thenhalf·4·4=8m;first power ofa givesfactor2",
 "solve integral lawD=at²/2 for a:2D/t²=8m/4s²=2m/s²",
 "positive root of2D/a=4s² gives2s;negative root−2s excluded;unique forpositivea and futuretime",
 "samea, durations2and4s give4and16m;ratio4 equals squared time ratio",
 "x(t)=2t² inSI;initialposition0,initialslope0,secondderivative+4;upwardparabola for t≥0,not spatialtrajectory",
 "a=2D/t²;no root needed because acceleration unknown appearslinearly",
 "double-integral scalingD₂/D₁=κ₁κ₂²;half cancels between trials",
 "first4m,second32m;ratio8=accelerationfactor2 timesdurationfactor2²",
 "equal-weight mean(4+32)/2=18m;mean inputs3and3 give27/2m,not18",
 "target32m witha4 gives t²=16s²;futuret4s;ratio4s/2s=2",
 "gain12/(4m)=3m⁻¹;96/gain=32m;acceleration2·32m/(4s)²=4m/s²",
 "gain(65−9)/(32−4)=2m⁻¹,offset1;distance(17−1)/gain=8m;acceleration2·8m/(2s)²=4m/s²",
 "selecteda=(1m/s³)T remainsconstant intau;D=(1m/s³)T³/2=4m;T³=8s³ soT2s and a2m/s²;not constantjerk modelT³/6",
]
DISTRACTORS=[
 "8m incorrectly uses finalvelocity throughout;positivea andrest ensure no reversal so distanceequalspositive displacement",
 "m/s omits one timefactor;m/s² isbareacceleration;s duration;m² area",
 "4m is totalfirst2seconds;1m assumesuniformvelocity;2m omitsquadraticgrowth;8m exceedsactualtotal",
 "factor4 belongs totime doubling;unchanged/halved/zero contradict directpositiveproportionality toa",
 "D/t happensnumerically2 but unitm/s givesmeanspeed,notacceleration;check physicalunit",
 "negative root excluded;D0wouldgivefuturet0;Dnegativeincompatible withpositivea fromrest",
 "2time/finalspeedratio;8needsa doubled;3relativeincrease notD₂/D₁;5unsupported",
 "risingline meansconstantvelocity;horizontalline stationary;downwardcurvature needsnegativea;hyperbola failsorigin andODE",
 "D/t² missesfactor2;2D/t isvelocity;rootchangesdimension;Dt²/2 multipliesratherthanremovesdurationfactor",
 "κ₁κ₂ missestimesquare;κ₁²κ₂ squareswronginput;κ₁/κ₂² usesopposite dependence;extra2failsidentity",
 "4treatsdurationlinearly;2onlychangesa;32isdisplacementnotratio",
 "36sumwithoutdivision;9dividestwice;17and19offby1;allnumeric choicesdistinct",
 "negative duration−4excluded;outputfactor8already includesaccelerationfactor2 so durationfactorispositive2",
 "unconvertedcounts give threefoldacceleration;inverseuses2D/t² aftercalibration,notbefore",
 "8copiesdistancewithoutinverse;2reusesreference;3and5 reconstructcounts13and21 instead17",
 "T1,3,4 giveD1/2,27/2,32m;−2 violatespositive duration andpositive selecteda;constantjerk isdifferentmodel",
]
ASSUMPTIONS=["Same inertial frame and fixed oriented line;starts fromrest;constantpositiveacceleration;elapsedtime nonnegative,strictlypositive when usedindenominator;displacementfrominitialpoint"]*16
ASSUMPTIONS[2]="Rest at t0,constantpositiveacceleration;only interval1..2s requested,not total0..2s;no direction reversal"
ASSUMPTIONS[7]="Position-time axes;t≥0;x0=0,v0=0,constant a+4m/s²;curvedgraph doesnot implycurved spatialtrajectory"
ASSUMPTIONS[11]="Two independenttrials,equalstatisticalweights;meanofdisplacements,not modelonmeaninputs"
ASSUMPTIONS[15]="DurationT>0 selectsconstant a=kappaT beforetrial;kappa1m/s³;withintrial accelerationconstant andjerkzero;uniquepositivecuberoot"
UNITS={n:"meter"for n in range(1,17)}
UNITS.update({5:"meter/second**2",6:"second",7:"dimensionless",9:"meter/second**2",10:"dimensionless",11:"dimensionless",13:"dimensionless",14:"meter/second**2",15:"meter/second**2",16:"second"})
NUMERIC_UNITS={1:"m",5:"m/s²",6:"s",11:"1",13:"1",14:"m/s²"}
OPTION_SUFFIX={3:" m",12:" m",15:" m/s²",16:" s"}


def verify(package, bindings, asset_root=None):
    if package.get("schema") != "astra/1":
        raise ValueError("Expected the reviewed astra/1 package")
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    originals = source_records()
    common = []
    if digest(package) != REVIEWED_PACKAGE_SHA256:
        common.append("Independent reviewed package edition mismatch")
    if digest(bindings) != REVIEWED_BINDINGS_SHA256:
        common.append("Independent reviewed binding edition mismatch")
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        errors.extend(common)
        n = int(row["id"].rsplit("-", 1)[1])
        source_id = f"u2-rest-accelerated-distance-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent rest-acceleration conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Missing physical unit in option")
                    raw = raw.removesuffix(suffix)
                if len(raw) > 80 or sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent double-integral/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Independent exact answer or physical unit invalid")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        if row["answer"]["type"] == "choice" and n in (3, 7, 12, 15, 16):
            try:
                numeric_options = [sp.Rational(str(o).removesuffix(OPTION_SUFFIX.get(n, "")).replace("−", "-")) for o in row["answer"]["options"]]
                if len(set(numeric_options)) != 5:
                    errors.append("Independent numerically equivalent distractors")
            except (ValueError, TypeError):
                errors.append("Independent malformed numeric distractor")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {str(k): str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "physicalAssumptions": ASSUMPTIONS[n-1], "distractors": DISTRACTORS[n-1],
            "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["SymPy_double_integral_rest_initial_condition_and_interval_difference",
                        "Pint_exact_displacement_acceleration_and_cubic_duration_dimensions", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Displacement from rest with constant acceleration",
                   "reference": "Independently double-integrated acceleration with rest initial condition; constant selected acceleration separated from different constant-jerk model"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"rest-accelerated-distance-015.json").read_text()),
                    json.loads((args.directory/"rest-accelerated-distance-015-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)


def mutation_audit(package, bindings, asset_root):
    """Reproducible adversarial tests; altered signatures exist only in patch contexts."""
    from copy import deepcopy
    import sys
    from unittest.mock import patch

    cases = []
    module = sys.modules[__name__]
    for i, original in enumerate(package["records"]):
        changed, links = deepcopy(package), deepcopy(bindings)
        row = changed["records"][i]
        answer = row["answer"]
        answer["value"] = (answer["value"]+1 if answer["type"] == "numeric" else
                           next(o for o in answer["options"] if o != answer["value"]))
        links[i]["candidateSha256"] = digest(row)
        token = next(s for r, b, s, a, e in reviewed_rows(changed, links, {}, EXPECTED_IDS, asset_root) if r["id"] == row["id"])
        # Deliberately bypass all edition signatures for this test only. The
        # independently derived answer must still reject a new, rebound bad key.
        with patch.dict(REVIEWED_CANDIDATES, {row["id"]: token}), patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed), REVIEWED_BINDINGS_SHA256=digest(links)):
            result = next(r for r in verify(changed, links, asset_root) if r["id"] == row["id"])
        oracle_errors = [e for e in result["errors"] if "conceptual key" in e or "double-integral/SI result" in e]
        if result["ok"] or not oracle_errors:
            raise AssertionError("Rebound, retokenized wrong key escaped independent oracle: "+row["id"])
        cases.append({"case": "wrong_key_rebound_and_all_edition_tokens_replaced", "id": row["id"], "rejectedBy": oracle_errors})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][0]["blocks"].append({"type": "text", "text": "La velocità finale è mantenuta per tutta la prova: lo spostamento è at², senza fattore un mezzo."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false rectangle-area proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_rectangle_area_proof_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][7]["blocks"].append({"type": "text", "text": "La curva nel grafico posizione-tempo dimostra che anche la traiettoria nello spazio è una parabola."})
    links[7]["candidateSha256"] = digest(changed["records"][7])
    result = verify(changed, links, asset_root)[7]
    if result["ok"]:
        raise AssertionError("Plausible false ID08 spatial-trajectory rationale escaped frozen reading")
    cases.append({"case": "correct_key_but_false_spatial_trajectory_rationale_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    for name, transform in [("empty", lambda p: p.update(records=[])),
                            ("partial", lambda p: p["records"].pop()),
                            ("duplicate", lambda p: p["records"].__setitem__(1, deepcopy(p["records"][0])))]:
        changed = deepcopy(package)
        transform(changed)
        try:
            verify(changed, bindings, asset_root)
        except ValueError:
            cases.append({"case": name+"_batch", "rejectedBy": "complete unique batch boundary"})
        else:
            raise AssertionError("Incomplete batch accepted: "+name)
    changed, links = deepcopy(package), deepcopy(bindings)
    links[0]["sourceSha256"] = "0"*64
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Changed original source hash escaped Git check")
    cases.append({"case": "source_hash_changed", "id": result["id"], "rejectedBy": result["errors"]})
    return {"scope": "mutation_tests_of_independent_review_boundary_and_oracle", "cases": cases, "caseCount": len(cases),
            "allRejected": True, "frozenSignaturesRestored": True, "humanApproval": "NOT_RUN", "publication": "DRAFT"}
