"""Independent reviewer oracle for sixteen individually read acceleration-average tasks.

No authoring import. Signatures freeze the reread edition 5c55689a after the
reviewer found and the separate author corrected the ID08 distractor rationale.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, git_bytes, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json"
CANDIDATE_REF = "5c55689a8e30e13a400e118806d9986433586886"
REVIEWED_PACKAGE_SHA256 = "23387a5350c5f4e95fa439145b63bace79c47ad28cd422b9658ef8c4401ed13d"
REVIEWED_BINDINGS_SHA256 = "d364c5108e23dc660e11e8d467dd1149a615c4fc0b9bf4610b7b2cff50b35282"
EXPECTED_IDS = {f"AR-u2-mean-acceleration-{n:02}" for n in range(1, 17)}
# Frozen only after reading all sixteen statements, choices, solutions and bindings,
# then rereading the sole changed ID08 explanation in the author correction.
REVIEWED_CANDIDATES = {
    "AR-u2-mean-acceleration-01": "b5542e99c54b4ebefae9a5e3d6e209e3d7c6aced307eccaf2522fb8d8aa7dbf8",
    "AR-u2-mean-acceleration-02": "b244d01f42a5120f45f1ae7a0cfe39efd27dcf8d9691ee0ff43f0867967b6ae9",
    "AR-u2-mean-acceleration-03": "0b5c4e3ce7f4e27bceb2506e81af7051c0cc6e7b7321a674aed1b759a865d722",
    "AR-u2-mean-acceleration-04": "0cfba503bcf5408e3151b7ccf020336cc1d2a33dd8c87ec2baed60313e01fbba",
    "AR-u2-mean-acceleration-05": "a68c12831ef5e5cca9fe9a7047cac4b9063b8acdcbd2894e009089d56ce88d54",
    "AR-u2-mean-acceleration-06": "04b42ff696746d3bca71b31a19f647dee9f85eb2b1a381e2b386b40de7c73028",
    "AR-u2-mean-acceleration-07": "4a73b4718986c1e1a8d3c6860f7bfc447d213652e15f0dee6f8f155491fc1021",
    "AR-u2-mean-acceleration-08": "bc6874a42a3838e5348728ffaf298d73c86f5f54f982adcad8df82fad0e11efa",
    "AR-u2-mean-acceleration-09": "fbcf336fc1538a1f9a60e28efafd4a365c42909972c8ff7cee8d6ebb5c730dbf",
    "AR-u2-mean-acceleration-10": "50c7557c2d4885ecdc6fa7df89ff73cda8315bc09b96841cca2dbdc37d211053",
    "AR-u2-mean-acceleration-11": "726c3fbf2b0343c921050e8f812f97718095d81dbbcf3cc7d250728e3135ac06",
    "AR-u2-mean-acceleration-12": "2fe7e6ec0f8461b0c0ad9b8014debf482ed1e845a42190af0765f781ffeb9f7c",
    "AR-u2-mean-acceleration-13": "bf7e03cfd480de669c2b3b70ec2aae5ecac5023e116ec17ab28112e21513a1cb",
    "AR-u2-mean-acceleration-14": "0e23f0f8f1b51137fd0bc90f4ebd2e4bbcd144ffb3558eb0d3fa6b78ad6caa09",
    "AR-u2-mean-acceleration-15": "0d2ae71bf0891d1744922e4990c596ee1834cf5c72f862cfef371ab2be6038d2",
    "AR-u2-mean-acceleration-16": "c4b1ab79cad6b78433264505f32a38095190a2cfd2c375e6f309b562e307b7a9",
}


@lru_cache(maxsize=1)
def source_records():
    repo = Path(__file__).resolve().parents[3]
    return {r["id"]: r for r in json.loads(git_bytes(repo, SOURCE_REF, SOURCE_PATH))}


def average(vi, vf, duration):
    return sp.cancel((sp.sympify(vf)-sp.sympify(vi))/sp.sympify(duration))


def oracle():
    vi, vf, duration, k1, k2 = sp.symbols("vi vf duration k1 k2", positive=True)
    A = sp.Symbol("A", real=True)
    tau = sp.Symbol("tau", nonnegative=True)
    # Two distinct intermediate histories sharing endpoints. Their instantaneous
    # accelerations differ but their integral averages are the same.
    profile1 = vi+(vf-vi)*tau/duration
    profile2 = vi+(vf-vi)*(tau/duration)**2
    acceleration1 = sp.diff(profile1, tau)
    acceleration2 = sp.diff(profile2, tau)
    expected = average(vi, vf, duration)
    if sp.simplify(acceleration1-acceleration2) == 0:
        raise ValueError("Independent endpoint histories unexpectedly identical")
    for profile in (profile1, profile2):
        computed = sp.integrate(sp.diff(profile, tau), (tau, 0, duration))/duration
        if sp.simplify(computed-expected) != 0:
            raise ValueError("Independent mean-acceleration integral identity failed")
    final_inverse = sp.solve(sp.Eq(A, expected), vf)[0]
    initial_inverse = sp.solve(sp.Eq(A, expected), vi)[0]
    scale_ratio = sp.cancel(average(k2*vi, k1*vf, duration)/expected)
    if sp.simplify(scale_ratio-(k1*vf-k2*vi)/(vf-vi)) != 0:
        raise ValueError("Independent endpoint scaling failed")
    # Exact SI check: centimeter is first power; the unchanged second is squared.
    converted = SI.Quantity(250, "centimeter/second**2").to("meter/second**2").magnitude
    if sp.Rational(converted) != sp.Rational(5, 2):
        raise ValueError("Independent acceleration conversion failed")
    unit_acceleration = (SI.Quantity(6, "meter/second")-SI.Quantity(2, "meter/second"))/SI.Quantity(2, "second")
    if unit_acceleration.to("meter/second**2").magnitude != 2:
        raise ValueError("Independent endpoint units failed")
    first, second = average(2, 6, 2), average(4, 10, 2)
    required_initial = sp.solve(sp.Eq(average(vi, 10, 2), sp.Rational(3, 2)*first), vi)[0]
    g, offset = sp.symbols("g offset", real=True)
    calibration = sp.solve([sp.Eq(g*first+offset, 5), sp.Eq(g*second+offset, 7)], (g, offset))
    recovered_A = (9-calibration[offset])/calibration[g]
    gain = SI.Quantity(6, "")/SI.Quantity(int(first), "meter/second**2")
    recovered_with_units = SI.Quantity(9, "")/gain
    recovered_final = (SI.Quantity(4, "meter/second")+recovered_with_units*SI.Quantity(2, "second")).to("meter/second").magnitude
    if gain.to("second**2/meter").magnitude != 3:
        raise ValueError("Independent display-gain dimensions failed")
    constrained_initial = sp.solve(sp.Eq(average(vi, 3*vi, 2), 2), vi)[0]
    return [first, "m/s²", "A=(v_f−vᵢ)/(2 s)", "Raddoppia da +2 a +4 m/s²",
            final_inverse.subs({vi: 2, A: 2, duration: 2}),
            initial_inverse.subs({vf: 6, A: 2, duration: 2}),
            average(4, 6, 2)/first, sp.Rational(converted), "v_f=vᵢ+A(2 s)",
            "(κ₁v_f−κ₂vᵢ)/(v_f−vᵢ)", second/first, (first+second)/2,
            required_initial/2, sp.Rational(recovered_final), 2+recovered_A*2, constrained_initial]


MANUAL = [
    "6−2=4 m/s;4/2=+2 m/s²; no intermediate velocities inferred",
    "(m/s)/s=m/s²; time occurs twice in the denominator",
    "difference final minus initial, then divide by the full2s; no constant-acceleration assumption",
    "(6−2)/2=2 and(10−2)/2=4 m/s²; acceleration average doubles",
    "2m/s+(2m/s²)(2s)=6m/s; increment4 is not the final velocity",
    "6m/s−(2m/s²)(2s)=2m/s; adding instead yields a negative mean for the reversed interval",
    "first2m/s², second1m/s²; ratio1/2, not ratio of initial speeds",
    "250/100=5/2m/s²;250/100²=1/40 is the double-conversion distractor, reciprocal of250/100 is2/5",
    "multiply A=(vf−vi)/(2s) by2s then add vi; keep the second in the formula",
    "cancel only the common duration: ratio(κ₁vf−κ₂vi)/(vf−vi), not product of scale factors",
    "increments4 and6m/s; common2s cancels;6/4=3/2",
    "means2 and3m/s², equal-weight mean(2+3)/2=5/2m/s²",
    "target mean3m/s² gives increment6m/s; initial10−6=4m/s; ratio4/2=2",
    "gain6/(2m/s²)=3s²/m;9/gain=3m/s²;final4m/s+(3m/s²)(2s)=10m/s",
    "gain(7−5)/(3−2)=2s²/m,offset1;mean(9−1)/gain=4m/s²;final2+4·2=10m/s",
    "vf=3vi makes delta_v=2vi;vi=(2m/s²)(2s)/2=2m/s;vf=6m/s",
]
DISTRACTORS = [
    "Numeric task: final6/2=3 omits initial velocity; no averaging of endpoint speeds",
    "m/s remains speed;m is length;s time;1 requires homogeneous numerator/denominator",
    "sum is not change;vf alone omits vi;reversed difference reverses sign;change times time has dimensionL",
    "3m/s² corresponds to change6,not8;zero/negative/unchanged contradict measured endpoints",
    "increment4 is not final6;adding quantities of dimensionsL/T andL/T² is invalid",
    "adding4 to6 would imply vi10>vf6,so mean−2 rather than+2",
    "2 compares initial speeds;1 ignores changed increment;1/4 halves twice;negative ratio violates both positive changes",
    "25000 reverses the length conversion;25 uses10;250 omits conversion;1/40 squares100 erroneously",
    "subtracting produces deceleration;extra division by2 unsupported;omitting vi gives increment;A/(2s) isL/T³",
    "κ₁κ₂ fails under common doubling;κ₁−κ₂ fails atidentity;plus signs replace measured differences",
    "2/3 inverse;5/3 final speeds only;2 initial speeds only;1/2 relative increase not final/initial ratio",
    "5 misses mean division;5/4 divides twice;7/2 and3/2 outside interval[2,3]",
    "scaling vi itself by3/2 gives3,then mean7/2 rather than target3;must solve difference first",
    "display counts require gain removal;9 is not acceleration;increment6 must still be added to initial4",
    "for final9,5,11,20 the reconstructed counts are8,4,10,19 respectively;only final10 yields9",
    "vi1,3,4 give means1,3,4 respectively;negative vi excluded bydomain;duration has seconds,not a bare2",
]
ASSUMPTIONS = [
    "Oriented component in one fixed inertial frame; positive elapsed interval2s; endpoint data do not impose constant instantaneous acceleration",
]*16
ASSUMPTIONS[7] = "Positive acceleration component; only length unit changes from centimeter to meter; second squared unchanged"
ASSUMPTIONS[9] = "Common positive duration2s;0<vi<vf;positive scale factors withκ₁vf>κ₂vi,so denominator and both mean accelerations are positive"
ASSUMPTIONS[11] = "Two trials each lasting2s,equal statistical weight;arithmetic average of trial averages,not an instantaneous measurement"
ASSUMPTIONS[13] = "Common2s;fixed positive display gain,no offset;counts dimensionless;initial velocity known;instantaneous acceleration may vary"
ASSUMPTIONS[14] = "Common2s;fixed positive gain and constant offset;subtract offset before gain;positive final minus initial velocity"
ASSUMPTIONS[15] = "Positive initial velocity and same-axis relation vf=3vi;positive2s duration;measured mean fixes unique positive endpoint pair"
UNITS = {n: "meter/second**2" for n in range(1, 17)}
UNITS.update({5: "meter/second", 6: "meter/second", 7: "dimensionless", 9: "meter/second", 10: "dimensionless",
              11: "dimensionless", 13: "dimensionless", 14: "meter/second", 15: "meter/second", 16: "meter/second"})
NUMERIC_UNITS = {1: "m/s²", 5: "m/s", 6: "m/s", 13: "1", 14: "m/s"}
OPTION_SUFFIX = {12: " m/s²", 15: " m/s", 16: " m/s"}


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
        source_id = f"u2-mean-acceleration-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent acceleration-average conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Missing physical unit in option")
                    raw = raw.removesuffix(suffix)
                if len(raw) > 80 or sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent endpoint/integral/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Independent exact answer or physical unit invalid")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        if row["answer"]["type"] == "choice" and n in (7, 8, 11, 12, 15, 16):
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
            "methods": ["independent_endpoint_difference", "SymPy_two_distinct_endpoint_histories_and_integral_mean",
                        "Pint_exact_length_only_conversion_and_gain_dimensions", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Mean acceleration from endpoint velocity changes",
                   "reference": "Independently derived from all sixteen read statements; two unequal intermediate histories prove no constant acceleration is inferred"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"mean-acceleration-013.json").read_text()),
                    json.loads((args.directory/"mean-acceleration-013-bindings.json").read_text()), args.asset_root)
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
        oracle_errors = [e for e in result["errors"] if "conceptual key" in e or "endpoint/integral/SI result" in e]
        if result["ok"] or not oracle_errors:
            raise AssertionError("Rebound, retokenized wrong key escaped independent oracle: "+row["id"])
        cases.append({"case": "wrong_key_rebound_and_all_edition_tokens_replaced", "id": row["id"], "rejectedBy": oracle_errors})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][0]["blocks"].append({"type": "text", "text": "La media positiva dimostra che l’accelerazione è costante in ogni istante."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false constant-acceleration proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_constant_acceleration_proof_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][7]["blocks"].append({"type": "text", "text": "1/40 è il reciproco di250/100."})
    links[7]["candidateSha256"] = digest(changed["records"][7])
    result = verify(changed, links, asset_root)[7]
    if result["ok"]:
        raise AssertionError("Plausible restored ID08 distractor error escaped frozen reading")
    cases.append({"case": "correct_key_but_wrong_reciprocal_explanation_rebound", "id": result["id"], "rejectedBy": result["errors"]})
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
