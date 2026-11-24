"""Separate-reviewer affine-coordinate oracle for sixteen individually read U2 tasks."""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-uniform-position-{n:02}" for n in range(1, 17)}
# ID07 frozen only after the author replaced equivalent distractors 2 and 8/4.
REVIEWED_CANDIDATES = {
    "AR-u2-uniform-position-01": "74c104f1097a46117769a7ffcb55364ec314bca025786a1d6c3f12ef9668adea",
    "AR-u2-uniform-position-02": "c8d7de482ff3c171d3887bb6e716848a61ecf63c349022620f342ca73e797ae7",
    "AR-u2-uniform-position-03": "e1ba9809ac74bf7b8de5fb6c886205eacdd3e40387f895ba15da9a758205ea43",
    "AR-u2-uniform-position-04": "ae28c54ecb2f0874854053621631c40e849bb530ad2e8fc10ea2634d59db6e5c",
    "AR-u2-uniform-position-05": "7a6ff12a89f8471fcd88d593fe504acd917c8af7c7a17e4268dadbeb5d13a3cc",
    "AR-u2-uniform-position-06": "e058557e1d25e868784b2912f5c70137fdf568067209edee60225224b490c61b",
    "AR-u2-uniform-position-07": "b599ef9694e98dc60a5f2064c6a4545551d52ebc400b9792bf90c24ce5bf447e",
    "AR-u2-uniform-position-08": "db56cbc179fe626bc6ccd978456eafcbaec0e9aa8a817c27d580def26ba6bb5a",
    "AR-u2-uniform-position-09": "36c600e3d562e5b255ff6226a045f7dba7066452cc69de43cb7192f51d9c443f",
    "AR-u2-uniform-position-10": "83be58041bedf24d38303bf81b2eff4757bd62aa443926f0fc75487ec80a0b86",
    "AR-u2-uniform-position-11": "c7ba85a81491421c3805b2c3270f05b3366102676ffbf69ec6e0576a0f06b106",
    "AR-u2-uniform-position-12": "754dafaa7acd883cb2d8bd2d3cdfdeea95cffade97d2eea5e81fd2fdb6de8aa8",
    "AR-u2-uniform-position-13": "338ec2c0f452f80d96dea3b3007d4912c8044ada78bf8460769e24bdc2f81022",
    "AR-u2-uniform-position-14": "f57072b9bd76211fc1be3d921ec58dd3e8d6aa96aca98e6af8486e09da9b8a68",
    "AR-u2-uniform-position-15": "af922aa6e902f6d75d1f4698e9d8f196ed347a21ecdd4eba6376422cc403118b",
    "AR-u2-uniform-position-16": "217343bd709d113f3ca719958f1f9730d7ad8113ed33fca98cb7d5a9faf01181",
}


def affine_position(initial, velocity, elapsed):
    duration = sp.Rational(elapsed)
    if duration < 0:
        raise ValueError("Time is measured from the start of the trial")
    return sp.Rational(initial)+sp.Rational(velocity)*duration


def oracle():
    tau = sp.Symbol("tau", real=True)
    t = sp.Symbol("t", nonnegative=True)
    x, x0 = sp.symbols("x x0", real=True)
    u, alpha, k1, k2 = sp.symbols("u alpha k1 k2", positive=True)
    trajectory = x0+u*tau
    endpoint = trajectory.subs(tau, t)
    inverse_origin = sp.solve(sp.Eq(x, endpoint), x0)[0]
    inverse_time = sp.solve(sp.Eq(x, endpoint), t)[0]
    changed = endpoint.subs({x0: k1*x0, t: k2*t}, simultaneous=True)
    if sp.simplify(inverse_origin-(x-u*t)) != 0 or sp.simplify(changed-(k1*x0+u*k2*t)) != 0:
        raise ValueError("Independent affine identities failed")
    intercept, slope = sp.symbols("intercept slope")
    graph = sp.solve([sp.Eq(intercept+slope*0, 3), sp.Eq(intercept+slope*2, 7)], (intercept, slope))
    first = affine_position(2, 2, 2)
    second = affine_position(4, 2, 4)
    ratio = affine_position(2, 2, 4)/first
    if ratio == (8/sp.Integer(4)):
        raise ValueError("Coordinate ratio was confused with displacement ratio")
    fixed_velocity = SI.Quantity(2, "meter/second")
    gain = SI.Quantity(18, "")/SI.Quantity(int(first), "meter")
    calibrated_origin = (SI.Quantity(36, "")/gain-fixed_velocity*SI.Quantity(4, "second")).to("meter").magnitude
    g, offset = sp.symbols("g offset")
    calibration = sp.solve([sp.Eq(g*first+offset, 13), sp.Eq(g*second+offset, 25)], (g, offset))
    recovered_coordinate = (17-calibration[offset])/calibration[g]
    required_time = sp.solve(sp.Eq(4+2*t, 2*first), t)[0]
    selected_trajectory = trajectory.subs(x0, alpha*t)
    if sp.diff(selected_trajectory, tau) != u:
        raise ValueError("Across-trial initial-position constraint changed physical velocity")
    constrained_endpoint = selected_trajectory.subs(tau, t)
    constrained_time = sp.solve(sp.Eq(constrained_endpoint.subs({alpha: 1, u: 2}), 6), t)[0]
    return [first, "m", (graph[intercept], graph[slope]), "Passa da 6 m a 8 m",
            inverse_origin.subs({x: 6, u: 2, t: 2}), inverse_time.subs({x: 6, x0: 2, u: 2}),
            ratio, 12-first, "x₀=x−ut", "(κ₁x₀+uκ₂t)/(x₀+ut)", second/first,
            (first+second)/2, required_time/2, calibrated_origin, recovered_coordinate-2*2, constrained_time]


MANUAL = [
    "initial 2 m plus displacement 2 m/s times 2 s gives coordinate 6 m, not displacement 4 m",
    "x0 and u t both have dimensions of length; homogeneous sum remains metres",
    "solve graph through (0s,3m),(2s,7m): intercept 3 m and slope (7-3)/(2-0)=2 m/s",
    "common origin and same displacement 4 m: 2+4=6 m then 4+4=8 m",
    "x0 = 6 m - (2 m/s)(2 s) = 2 m",
    "elapsed time = (6-2) m / (2 m/s) = 2 s, not final-coordinate/velocity = 3 s",
    "common fixed origin: coordinate ratio (2+8)/(2+4)=10/6=5/3; displacement ratio 8/4=2 differs",
    "proposed minus correct: 12 m - (2+4) m = +6 m",
    "solve affine coordinate for initial position: x-u t; valid also at t=0",
    "u fixed at 2 m/s; substitute into both addends, giving weighted factor ratio rather than product",
    "common origin: (4+8) m / (2+4) m = 12/6=2",
    "(6+12) m /2=9 m; mean initial 3 m plus 2 m/s times mean 3 s also gives9 m",
    "target coordinate12 m minus start4 m gives8 m; at2 m/s requires4 s, compared with2 s gives2",
    "gain18/(6m)=3m^-1;36/gain=12m; subtract 2m/s times4s to recover4m start",
    "gain12/(6m)=2m^-1, offset1; (17-1)/gain=8m coordinate, minus4m displacement gives4m start",
    "selected x0=(1m/s)T plus physical displacement(2m/s)T gives6m atT2s; derivative within trial remains2m/s, not3m/s",
]
UNITS = {1: "meter", 2: "meter", 4: "meter", 5: "meter", 6: "second", 7: "dimensionless",
         8: "meter", 9: "meter", 10: "dimensionless", 11: "dimensionless", 12: "meter",
         13: "dimensionless", 14: "meter", 15: "meter", 16: "second"}
NUMERIC_UNITS = {1: "m", 5: "m", 6: "s", 8: "m", 11: "1", 13: "1", 14: "m"}
OPTION_UNITS = {12: " m", 15: " m", 16: " s"}


def dimensionality(unit):
    return {k: str(v) for k, v in SI.Unit(unit).dimensionality.items()}


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent affine-coordinate conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if isinstance(wanted, tuple):
                    parts = raw.split(" e ")
                    if len(parts) != 2 or not parts[0].endswith(" m") or not parts[1].endswith(" m/s"):
                        raise ValueError("Coordinate/slope pair requires metres and metres per second")
                    got = (sp.Rational(parts[0].removesuffix(" m")), sp.Rational(parts[1].removesuffix(" m/s")))
                    if got != wanted:
                        errors.append("Independent intercept/slope pair mismatch")
                else:
                    if n in OPTION_UNITS:
                        suffix = OPTION_UNITS[n]
                        if not raw.endswith(suffix):
                            raise ValueError("Physical unit missing")
                        raw = raw.removesuffix(suffix)
                    if sp.Rational(raw) != sp.Rational(wanted):
                        errors.append("Independent affine-coordinate/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Invalid exact numeric or unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != binding["sourceRef"]):
            errors.append("Author provenance envelope changed or inconsistent")
        dimension = {"x0": dimensionality("meter"), "v": dimensionality("meter/second")} if n == 3 else dimensionality(UNITS[n])
        expected_text = str(wanted[0])+" m e "+str(wanted[1])+" m/s" if isinstance(wanted, tuple) else str(wanted)
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": expected_text, "dimension": dimension,
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_affine_coordinate_and_graph_linear_system", "exact_inverse_and_origin_sensitive_ratios",
                        "Pint_coordinate_gain_and_offset_calibration", "separate_AI_statement_options_and_figure_review"],
            "physicalAssumptions": "Same fixed spatial origin for coordinate comparisons; time measured from start; velocity fixed at+2m/s in symbolic comparison; selected initial-position constraint in16 holds across trials, not during a trial",
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Affine coordinates, graph intercept/slope and fixed-origin comparison",
                   "reference": "Independently derived from the sixteen read statements; not human approval"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"uniform-position-011.json").read_text()),
                    json.loads((args.directory/"uniform-position-011-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
