"""Independent endpoint, signed-path and exact-calibration review of sixteen U2 tasks."""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-mean-velocity-{n:02}" for n in range(1, 17)}
REVIEWED_CANDIDATES = {
    "AR-u2-mean-velocity-01": "b3be69bb3644c0751ab67d14ce4e61feb542549efed570401ea1fec0898e689f",
    "AR-u2-mean-velocity-02": "4e4881a5883da2ab0ccc6b7f371d69bae359962e289cbec323f2498f6eea11bb",
    "AR-u2-mean-velocity-03": "1656648c286b334ae1d34836d61d698023fd2e8fe00501d0b77c142758f3793b",
    "AR-u2-mean-velocity-04": "f12d2439f0e4fca91ad4ce5efd5c57c7adb3dd293c2497423ed818d2c00f9497",
    "AR-u2-mean-velocity-05": "70d6685766846bb1e865c3448691268f2dd9526b477486e0886f94b8b507cd21",
    "AR-u2-mean-velocity-06": "2cc6918bbcb460223985f2e0b5445b94090500262bca46f1fd1d2bbe631bd0eb",
    "AR-u2-mean-velocity-07": "c43c8c60e70a6d6c9a48928ef7a3a26f1acd962d619bbe5bac434812d5c62609",
    "AR-u2-mean-velocity-08": "0eb3a9cb68ea05efd1b1a88c5e971c3b20c3181901780f1cc238036590f5cf2c",
    "AR-u2-mean-velocity-09": "e7c58fef6639dbd36c85521f266e3c93972c8143284ca09b200e1cec9b08bde2",
    "AR-u2-mean-velocity-10": "8eb46790c05c4892a17da0cfdf1386585ad4a438367fbc2929e48302a6c8973f",
    "AR-u2-mean-velocity-11": "6bb2adb966b12fd603f144c9b8a36d3584c203caaaac3a227815dd0b31c2c176",
    "AR-u2-mean-velocity-12": "4cde7c9f24971d7219d477f6ded4a7814b1d136923dc0434c2939433da0e9b50",
    "AR-u2-mean-velocity-13": "90739bc74a1160db1506aea05cac121d3cb4da40d55903e49a602ff56a6624ed",
    "AR-u2-mean-velocity-14": "954964bd47c56573f712c6c46659dd828c14d3bd9da70438b4135027f6ed449b",
    "AR-u2-mean-velocity-15": "793a54968d982518ac419dded432a3f866cfd3dd471e1f76e825ac1e476b1098",
    "AR-u2-mean-velocity-16": "263580087283e1fa7cedb0f7a33c41f599e3ad51c5166f62ecc430518e9f457d",
}


def endpoint_mean(initial, final, elapsed):
    duration = sp.Rational(elapsed)
    if duration <= 0:
        raise ValueError("Elapsed time must be strictly positive")
    return (sp.Rational(final)-sp.Rational(initial))/duration


def oracle():
    dx = sp.Symbol("dx", real=True)
    t, k1, k2, u, lam = sp.symbols("t k1 k2 u lam", positive=True)
    V = sp.Symbol("V", real=True, nonzero=True)
    geometric = dx/t
    inverse_dx = sp.solve(sp.Eq(V, geometric), dx)[0]
    inverse_time = sp.solve(sp.Eq(V, geometric), t)[0]
    factor = sp.simplify(geometric.subs({dx: k1*dx, t: k2*t}, simultaneous=True)/geometric)
    if sp.simplify(inverse_dx-V*t) != 0 or sp.simplify(factor-k1/k2) != 0:
        raise ValueError("Independent endpoint identities failed")
    first = endpoint_mean(0, 2, 2)
    second = endpoint_mean(0, 6, 4)
    legs = [sp.Integer(6), sp.Integer(-6)]
    net_speed = abs(sum(legs))/4
    path_speed = sum(abs(leg) for leg in legs)/4
    arithmetic = (first+second)/2
    aggregate = sp.Rational(2+6, 2+4)
    if arithmetic != sp.Rational(5, 4) or aggregate != sp.Rational(4, 3) or arithmetic == aggregate:
        raise ValueError("Equal-record and duration-weighted means were confused")
    gain = SI.Quantity(3, "")/SI.Quantity(1, "meter/second")
    calibrated_displacement = ((SI.Quantity(Fraction(9, 2), "")/gain)*SI.Quantity(4, "second")).to("meter").magnitude
    g, offset = sp.symbols("g offset")
    calibration = sp.solve([sp.Eq(g*first+offset, 3), sp.Eq(g*second+offset, 4)], (g, offset))
    recovered = (5-calibration[offset])/calibration[g]
    constraints = sp.Matrix([dx-u*t, sp.together(geometric-u).as_numer_denom()[0]])
    if constraints.jacobian([dx, t]).rank() != 1 or sp.simplify(geometric.subs({dx: u*lam, t: lam})-u) != 0:
        raise ValueError("Redundant mean-velocity condition incorrectly fixed a scale")
    required_time = sp.solve(sp.Eq(6/t, sp.Rational(3, 2)*first), t)[0]
    return [first, "m/s", (net_speed, path_speed), "Raddoppia da +1 m/s a +2 m/s",
            inverse_dx.subs({V: 1, t: 2}), inverse_time.subs({dx: 2, V: 1}),
            endpoint_mean(0, 2, 4)/first, 0-endpoint_mean(2, 0, 2), "Δx=VΔt", "κ₁/κ₂",
            second/first, arithmetic, required_time/2, calibrated_displacement, recovered*2,
            "Infinite coppie positive"]


MANUAL = [
    "+2 m / 2 s = +1 m/s; endpoint data do not imply uniform instantaneous motion",
    "coordinate difference over time difference has dimensions L/T",
    "signed legs +6 m and -6 m give net zero; lengths sum to 12 m; divide both by 4 s: zero and 3 m/s",
    "same duration: 2/2 = 1 m/s then 4/2 = 2 m/s; no inference about every instantaneous velocity",
    "signed mean times its own duration: (+1 m/s)(2 s) = +2 m net displacement",
    "+2 m / (+1 m/s) = 2 s; negative displacement and negative mean also give positive time",
    "same net displacement: (2/4)/(2/2) = 1/2",
    "V = (0 m - 2 m)/2 s = -1 m/s; proposed minus correct: 0 - (-1) = +1 m/s",
    "solve V=dx/t for dx: Vt, whether or not instantaneous velocity varies",
    "scaled endpoint ratio (k1 dx)/(k2 t) divided by dx/t gives k1/k2",
    "(6/4)/(2/2) = 3/2",
    "equal-record mean (1+3/2)/2 = 5/4 m/s; consecutive-trip aggregate 8/6 = 4/3 m/s differs",
    "6 m / t2 = 3/2 m/s implies t2 = 4 s, ratio to 2 s is 2",
    "gain 3 s/m; (9/2)/gain = 3/2 m/s; multiply by 4 s gives 6 m",
    "gain (4-3)/(3/2-1) = 2 s/m, offset 1; (5-1)/gain = 2 m/s; times 2 s gives 4 m",
    "dx = (1 m/s) lambda for every lambda > 0 seconds; mean condition repeats that relation, leaving infinitely many pairs",
]
UNITS = {1: "meter/second", 2: "meter/second", 3: "meter/second", 4: "meter/second",
         5: "meter", 6: "second", 7: "dimensionless", 8: "meter/second", 9: "meter",
         10: "dimensionless", 11: "dimensionless", 12: "meter/second", 13: "dimensionless",
         14: "meter", 15: "meter", 16: "dimensionless"}
NUMERIC_UNITS = {1: "m/s", 5: "m", 6: "s", 8: "m/s", 13: "1", 14: "m"}
OPTION_UNITS = {12: " m/s", 15: " m"}


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent mean-velocity conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if isinstance(wanted, tuple):
                    parts = raw.split(" e ")
                    if len(parts) != 2 or any(not part.endswith(" m/s") for part in parts):
                        raise ValueError("Both speeds require units")
                    got = tuple(sp.Rational(part.removesuffix(" m/s")) for part in parts)
                    if got != wanted:
                        errors.append("Independent mean-vector/mean-speed pair mismatch")
                else:
                    if n in OPTION_UNITS:
                        suffix = OPTION_UNITS[n]
                        if not raw.endswith(suffix):
                            raise ValueError("Physical unit missing")
                        raw = raw.removesuffix(suffix)
                    if sp.Rational(raw) != sp.Rational(wanted):
                        errors.append("Independent signed-endpoint/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Invalid exact numeric or unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != binding["sourceRef"]):
            errors.append("Author provenance envelope changed or inconsistent")
        expected_text = " e ".join(str(v)+" m/s" for v in wanted) if isinstance(wanted, tuple) else str(wanted)
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": expected_text, "dimension": {k: str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_signed_endpoints_and_absolute_path_lengths", "exact_equal_vs_duration_weighted_means",
                        "Pint_time_per_length_gain_and_linear_system", "symbolic_inverse_and_redundant_constraint_rank",
                        "separate_AI_statement_and_distractor_review"],
            "physicalAssumptions": "Positive elapsed duration; signed coordinate differences; no uniform-motion assumption; equal statistical record weights only12; constant calibration only14/15; no independent interval datum in16",
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Endpoint definition of mean velocity, signed displacement and total path length",
                   "reference": "Independently derived from the sixteen read statements; not human approval"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"mean-velocity-012.json").read_text()),
                    json.loads((args.directory/"mean-velocity-012-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
