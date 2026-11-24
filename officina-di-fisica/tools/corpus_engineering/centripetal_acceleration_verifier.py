"""Independent circle differentiation, exact arithmetic and AI reading of 16 drafts.

No authoring import. Content signatures bind individually read source/candidate
records and the actual local/uploaded scientific asset, never human approval.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-centripetal-acceleration-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-centripetal-acceleration-01": "55287437d7e2a5cedf99a4870eccd6429bb59852c1ce776bb88392f87f951034",
    "AR-u2-centripetal-acceleration-02": "1af83b37a5518cef28f2d38f7db8f5925554bc98fd18565e9122ee2a86a505ee",
    "AR-u2-centripetal-acceleration-03": "bfeb593d75d513d18ec22a73798b088a36de1faf2ba03899a190aededebf4b32",
    "AR-u2-centripetal-acceleration-04": "74cad108b4c4714dcb65ef5fa90af8cf23a7931ba86ef5e80ef3c33a38911f59",
    "AR-u2-centripetal-acceleration-05": "e537da38e04f64dd523f5278cfd9cf0791a856e5825357e60c166ad7f15ac81c",
    "AR-u2-centripetal-acceleration-06": "433af62ac61adfece5155e58fd05d2ce5eda05247fc23bef2cf74b3284d6ca65",
    "AR-u2-centripetal-acceleration-07": "246ada16c6d573b672ae653e56ef24067a551d6893f442b95212317f13e61a4c",
    "AR-u2-centripetal-acceleration-08": "38b152a6f4d0eb54f0657c415f2b49df8187117fdfc35f443dd975051a1e6ce5",
    "AR-u2-centripetal-acceleration-09": "e5fc617733886b035ff1e3fa88831db7cf27df20cb34d01fe1dc3b5724899e2f",
    "AR-u2-centripetal-acceleration-10": "84f86938beac10a623388a815c2655d16cd10ddf75202930948664acb303ca90",
    "AR-u2-centripetal-acceleration-11": "818b97540817470168fdcc352e412183ad12082dda07f8fcefee1af8a89c0410",
    "AR-u2-centripetal-acceleration-12": "7c3499e59995613237457d5517761cccab758fa7bd8c2886e976a8b2b2a12e36",
    "AR-u2-centripetal-acceleration-13": "3f13fef48353894e69a8f1fc498e25a371a8f67a76b3a673b7cbb9e6e14b5f72",
    "AR-u2-centripetal-acceleration-14": "60475fcda73c0cb635ebbefa44c61abb83647672b3f27c524fea3330840db251",
    "AR-u2-centripetal-acceleration-15": "d2dc835bbf1d2c3a0d99d5007531042c762ebe068e9927a131131c7ae127aea7",
    "AR-u2-centripetal-acceleration-16": "56b0dea0f6423a33310a5f3e6e668aaf1edf2a6d6cf3138c4e94a733859efd7e",
}


def oracle():
    tau = sp.Symbol("tau", real=True)
    r, omega, speed, target, k1, k2, k = sp.symbols("r omega speed target k1 k2 k", positive=True)
    position = sp.Matrix([r*sp.cos(omega*tau), r*sp.sin(omega*tau)])
    velocity, acceleration = position.diff(tau), position.diff(tau, 2)
    norm_speed = sp.sqrt(sp.trigsimp(velocity.dot(velocity)))
    A = sp.sqrt(sp.trigsimp(acceleration.dot(acceleration))).subs(omega, speed/r)
    if (sp.simplify(norm_speed-r*omega) != 0 or sp.simplify(A-speed**2/r) != 0
            or sp.trigsimp(velocity.dot(acceleration)) != 0
            or sp.simplify(acceleration+omega**2*position) != sp.zeros(2, 1)):
        raise ValueError("Independent circle derivatives, radial direction or perpendicularity failed")
    inverse_speed = sp.solve(sp.Eq(A, target), speed)[0]
    inverse_r = sp.solve(sp.Eq(A, target), r)[0]
    scaling = sp.simplify(A.subs({speed: k1*speed, r: k2*r}, simultaneous=True)/A)
    first, second = A.subs({speed: 2, r: 2}), A.subs({speed: 4, r: 4})
    mean_outputs = (first+second)/2
    if sp.simplify(scaling-k1**2/k2) != 0 or first != 2 or second != 4 or mean_outputs != 3:
        raise ValueError("Quadratic scaling or arithmetic mean failed")
    if (A.subs({speed: 2, r: 2})+A.subs({speed: 4, r: 2}))/2 != 5 or A.subs({speed: 3, r: 2}) != sp.Rational(9, 2):
        raise ValueError("Nonlinear mean counterexample failed")
    if A.subs({speed: 3, r: 3}) != mean_outputs:
        raise ValueError("Proportional-input mean coincidence failed")
    Q = SI.Quantity
    gain = Q(6, "")/Q(int(first), "m/s**2")
    calibrated_A = (Q(12, "")/gain).to("m/s**2").magnitude
    calibrated_v2 = (Q(calibrated_A, "m/s**2")*Q(4, "m")).to("m**2/s**2").magnitude
    c, offset = sp.symbols("c offset", real=True)
    calibration = sp.solve([sp.Eq(c*first+offset, 5), sp.Eq(c*second+offset, 9)], (c, offset))
    recovered_A = (17-calibration[offset])/calibration[c]
    recovered_speed = inverse_speed.subs({target: recovered_A, r: 2})
    constrained = sp.simplify(A.subs(speed, k*r))
    constrained_r = sp.solve(sp.Eq(constrained, target), r)[0]
    si_r = (Q(2, "m/s**2")/Q(1, "s**-1")**2).to("m").magnitude
    si_A = (Q(2, "m/s")**2/Q(2, "m")).to("m/s**2").magnitude
    if constrained_r != target/k**2 or sp.Rational(si_r) != 2 or sp.Rational(si_A) != first:
        raise ValueError("Constraint or Pint SI dimensions failed")
    if calibration != {c: 2, offset: 1} or recovered_A != 8 or recovered_speed != 4:
        raise ValueError("Affine calibration failed")
    return [first, "m/s²", "La rapidità è costante ma la velocità vettoriale cambia direzione", "Da 2 a 8 m/s²",
            inverse_speed.subs({target: 2, r: 2}), inverse_r.subs({speed: 2, target: 2}),
            A.subs({speed: 2, r: 4})/first, 4-first, "v=√(Ar)", "κ₁²/κ₂", second/first,
            mean_outputs, inverse_r.subs({speed: 4, target: 2*first})/2,
            sp.sqrt(sp.Rational(calibrated_v2)), recovered_speed, constrained_r.subs({target: 2, k: 1})]


MANUAL = [
    "2²/2=2 m/s². Tangential acceleration is zero but the inward vector acceleration is not.",
    "(m/s)² divided by m leaves m/s²; radial direction does not change dimensions.",
    "A rotating tangent with constant positive length has changing vector direction; r fixed, at=0 and inward A=v²/r>0.",
    "At r=2m: 2²/2=2 and 4²/2=8 m/s²; speed factor2 gives A factor4 in separate uniform trials.",
    "Ar=2*2=4 m²/s²; one positive square root gives 2m/s. Rotation sense remains unspecified.",
    "r=v²/A=4/2=2m; v/A would have time units.",
    "A1=4/2=2, A2=4/4=1 m/s²; second/first=1/2, not negative or squared-radius ratio.",
    "Correct A=2m/s²; proposed4 minus correct2 gives +2m/s², a signed error rather than a radial component.",
    "Multiply r to get v²=Ar; rapidity v>0 selects sqrt(Ar). Other roots have wrong domain or frequency/time units.",
    "(k1*v)²/(k2*r) divided by v²/r gives k1²/k2; the radius is not squared.",
    "A1=4/2=2, A2=16/4=4 m/s²; ratio4/2=2, tangential acceleration zero inside each trial.",
    "Equal output mean(2+4)/2=3m/s²; mean inputs3,3 also give3 for these proportional data. At fixed r2, outputs2,8 mean5 differ from mean-input9/2.",
    "Target A2=4m/s², imposed v2=4m/s; r2=16/4=4m; r2/r1=4/2=2.",
    "Reference A2m/s² and count6 give gain3s²/m. Count12 gives A4m/s²; Ar=4*4=16, v=4m/s.",
    "Reference A2,4 and counts5,9 give gain2s²/m, offset1. (17-1)/2=8m/s²; at r2m speed sqrt16=4m/s.",
    "With k=1s^-1, v=kr gives A=k²r. A2m/s² determines r2m and v2m/s uniquely, fixed within each trial.",
]
UNITS = {1: "m/s**2", 2: "m/s**2", 3: "m/s**2", 4: "m/s**2", 5: "m/s", 6: "m", 7: "1", 8: "m/s**2",
         9: "m/s", 10: "1", 11: "1", 12: "m/s**2", 13: "1", 14: "m/s", 15: "m/s", 16: "m"}
OPTION_SUFFIX = {8: " m/s²", 12: " m/s²", 15: " m/s", 16: " m"}
NUMERIC_UNITS = {1: "m/s²", 5: "m/s", 6: "m", 11: "1", 13: "1", 14: "m/s"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent centripetal conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent circle/exact-arithmetic result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-centripetal-acceleration-{n:02}":
            errors.append("Not bound to the independently read pinned source")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != SOURCE_REF
                or provenance.get("sourcePath") != SOURCE_PATH):
            errors.append("Author provenance envelope changed or inconsistent")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {str(k): str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_circle_position_first_and_second_derivatives", "radial_acceleration_perpendicularity",
                        "SymPy_exact_inversion_scaling_and_calibration", "Pint_exact_dimensions", "separate_AI_statement_option_asset_reading"],
            "physicalAssumptions": ("Inertial frame, fixed nondegenerate circle and constant positive rapidity inside each separate trial; radial acceleration inward and perpendicular to velocity, zero tangential acceleration. "
                + ("Equal statistical output weights; proportional-input coincidence is not a general linearity claim. " if n == 12 else "")
                + ("Dimensionless display counts, positive gain s²/m and dimensionless offset only15. " if n in {14, 15} else "")
                + ("v=(1s^-1)r selects constant angular speed across trial data, not changing radius inside a trial. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Circle position differentiated twice, radial direction and exact independent arithmetic",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI review only; no human approval, empirical student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"centripetal-acceleration-025.json").read_text()),
                    json.loads((args.directory/"centripetal-acceleration-025-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
