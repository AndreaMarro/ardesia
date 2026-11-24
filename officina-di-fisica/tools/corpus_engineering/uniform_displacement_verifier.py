"""Separate-reviewer exact oracle for sixteen individually read uniform-motion tasks."""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-uniform-displacement-{n:02}" for n in range(1, 17)}
# Frozen after the separate reviewer read every statement, option and the source bindings.
REVIEWED_CANDIDATES = {
    "AR-u2-uniform-displacement-01": "e7fd8b9ec2149591053f691f509de49cadb25a071e9f031697622d04486726c6",
    "AR-u2-uniform-displacement-02": "028ef435f15b74039153beb16504c7a883e17cb1bb14f20add1aedc9aac613df",
    "AR-u2-uniform-displacement-03": "0b6c2b9ff05bcf1aa461e092823407158d6c1a37aaea6d7bf1cec698b17bd207",
    "AR-u2-uniform-displacement-04": "9b864ad0c1afa4b7ee6eafc53c2e28b3a26c519c06a0e406258808ff734107a9",
    "AR-u2-uniform-displacement-05": "6fb1ae64267f28a3c7d09417e8a4e2c2d6f5f2c52a1b4344fce631bc70b0e47a",
    "AR-u2-uniform-displacement-06": "de450ae4b8dedd001276820c6dc5cfc856eff26347d62385c9ecf48125d2459e",
    "AR-u2-uniform-displacement-07": "f72b92f957b5dcc6c66a963d1685207d0dd656156a1c44fbc5678d71fed12b11",
    "AR-u2-uniform-displacement-08": "c8f10ab7bb4e779c8081a2a66ff429eb3c658bef6ab0d46236d0af5c992f7b96",
    "AR-u2-uniform-displacement-09": "c332830991e7cca12a09ce44a4a23348f4c1f9f5faa4c8dede5cd9cb5463e3fa",
    "AR-u2-uniform-displacement-10": "5a1d202deb81e8374f494707053ff258b3f32c750fadf02cef42c1f9506b3c0e",
    "AR-u2-uniform-displacement-11": "bf8644dbb8517f70e219586baaa9a08e7892f0c3ca48b1be15cfa2753dede720",
    "AR-u2-uniform-displacement-12": "f0ca12b4df8a1324c1ce4ae33794f18a7909c0d7f51e340625ca0b166932c7bb",
    "AR-u2-uniform-displacement-13": "081f0f0c46215f577061810b7c7a8d985457e248015daa6c2ca904577c9c9bf6",
    "AR-u2-uniform-displacement-14": "544574a55fb0d73beef25ba21d923afedfbcd29281b7683f1eacd47c9e0334aa",
    "AR-u2-uniform-displacement-15": "1d0e199fd5c9eaf3333e111d05ccb3bcf6bcb2af87edc463f8ac8cfc10ce1493",
    "AR-u2-uniform-displacement-16": "afd786177674f235cce26e9139be29211afcd4e156e5eaea57e9b36a1eb06870",
}


def distance_from_constant_velocity(velocity, duration):
    tau = sp.Symbol("tau", real=True)
    return sp.integrate(sp.sympify(velocity), (tau, 0, duration))


def oracle():
    tau = sp.Symbol("tau", real=True)
    t, m, gravity, k1, k2, kappa = sp.symbols("t m gravity k1 k2 kappa", positive=True)
    v = sp.Symbol("v", real=True, nonzero=True)
    x0, D = sp.symbols("x0 D", real=True)
    coordinate = x0+v*tau
    geometric = sp.simplify(coordinate.subs(tau, t)-coordinate.subs(tau, 0))
    acceleration = sp.diff(coordinate, tau, 2)
    resultant = sp.simplify(m*acceleration)
    if resultant != 0 or sp.simplify(m*gravity-m*gravity) != 0:
        raise ValueError("Independent constant-velocity force balance failed")
    inverse_v = sp.solve(sp.Eq(D, geometric), v)[0]
    inverse_t = sp.solve(sp.Eq(D, geometric), t)[0]
    scaling = sp.simplify(geometric.subs({v: k1*v, t: k2*t}, simultaneous=True)/geometric)
    if sp.simplify(inverse_v-D/t) != 0 or sp.simplify(scaling-k1*k2) != 0:
        raise ValueError("Independent displacement identities failed")
    first = distance_from_constant_velocity(2, 2)
    second = distance_from_constant_velocity(4, 4)
    converted = SI.Quantity(5, "meter/second").to("kilometer/hour").magnitude
    gain = SI.Quantity(12, "")/SI.Quantity(int(first), "meter")
    calibrated_speed = ((SI.Quantity(48, "")/gain)/SI.Quantity(4, "second")).to("meter/second").magnitude
    g, offset = sp.symbols("g offset")
    calibration = sp.solve([sp.Eq(g*first+offset, 9), sp.Eq(g*second+offset, 33)], (g, offset))
    recovered_displacement = (17-calibration[offset])/calibration[g]
    # The selected velocity is kappa*t, constant with respect to the within-trial tau.
    family_displacement = sp.integrate(kappa*t, (tau, 0, t))
    if sp.diff(kappa*t, tau) != 0 or sp.simplify(family_displacement-kappa*t*t) != 0:
        raise ValueError("Across-trial constraint was confused with within-trial acceleration")
    required_time = sp.solve(sp.Eq(family_displacement.subs(kappa, 1), 4), t)[0]
    unit_time_squared = (SI.Quantity(4, "meter")/SI.Quantity(1, "meter/second**2")).to("second**2").magnitude
    if required_time != sp.sqrt(sp.Rational(unit_time_squared)):
        raise ValueError("Constrained duration has inconsistent dimensions")
    return [first, "m", "È nulla", "Raddoppia da +4 m a +8 m",
            inverse_v.subs({D: 4, t: 2}), inverse_t.subs({D: 4, v: 2}),
            distance_from_constant_velocity(2, 4)/first, converted, "v=D/Δt", "κ₁κ₂",
            second/first, (first+second)/2, sp.solve(sp.Eq(4*t, 4*first), t)[0]/2,
            calibrated_speed, recovered_displacement/2, required_time]


MANUAL = [
    "2 m added in each of two seconds gives +4 m; initial coordinate cancels",
    "(m/s) times s = m, not m squared",
    "d²(x0+v tau)/d tau²=0; inertial frame and constant mass imply net force zero; weight/support can cancel",
    "same2s:2·2=4m then4·2=8m; one changed factor doubles displacement",
    "+4m/2s=+2m/s; signed displacement over positive duration",
    "+4m/(+2m/s)=2s; matching negative signs would also give positive duration",
    "same velocity:8m/4m=4s/2s=2",
    "5m/s times3600s/h divided by1000m/km=18km/h; cancel5 with3600/1000=18/5",
    "solve coordinate difference D=v delta_t for v: D/delta_t, with delta_t>0",
    "constant velocity inside each separate trial: ratio(κ₁v)(κ₂t)/(vt)=κ₁κ₂",
    "first4m, second16m;16/4=4, no within-trial acceleration",
    "(4m+16m)/2=10m; mean inputs would give3m/s times3s=9m instead",
    "desired16m at4m/s requires4s, compared with2s gives factor2",
    "gain12/(4m)=3m⁻¹;48/gain=16m;16m/4s=4m/s",
    "gain24/(12m)=2m⁻¹, offset1; (17−1)/gain=8m;8m/2s=4m/s",
    "selected constant v=(1m/s²)T; integrate that constant over0..T gives(1m/s²)T²=4m, so T=2s; not half that area",
]
UNITS = {1: "meter", 2: "meter", 3: "newton", 4: "meter", 5: "meter/second", 6: "second",
         7: "dimensionless", 8: "kilometer/hour", 9: "meter/second", 10: "dimensionless",
         11: "dimensionless", 12: "meter", 13: "dimensionless", 14: "meter/second",
         15: "meter/second", 16: "second"}
UNIT_OPTIONS = {8: " km/h", 12: " m", 15: " m/s", 16: " s"}
NUMERIC_UNITS = {1: "m", 5: "m/s", 6: "s", 11: "1", 13: "1", 14: "m/s"}


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent uniform-motion conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in UNIT_OPTIONS:
                    suffix = UNIT_OPTIONS[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent coordinate/integral/SI result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != binding["sourceRef"]):
            errors.append("Author provenance envelope changed or inconsistent")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {k: str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_coordinate_difference_and_constant_integral", "Newton_inertial_constant_mass_balance",
                        "Pint_exact_unit_conversion_and_calibration", "separate_AI_statement_and_distractor_review"],
            "physicalAssumptions": ("Inertial frame, constant positive mass, nonzero constant vector velocity; zero resultant does not require absence of individual forces"
                if n == 3 else "Selected velocity depends on trial duration across trials only; within each trial it is constant; duration strictly positive"
                if n == 16 else "Rectilinear velocity constant within each trial; signed displacement, positive elapsed duration; calibration constant only14/15; equal statistical weights only12"),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Coordinate differences, constant-velocity integration and inertial Newton balance",
                   "reference": "Independently derived from the sixteen individually read U2 statements; not human approval"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"uniform-displacement-010.json").read_text()),
                    json.loads((args.directory/"uniform-displacement-010-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
