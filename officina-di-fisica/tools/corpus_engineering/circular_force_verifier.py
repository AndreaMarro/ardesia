"""Independent circular trajectory, Newton resultant and exact manual draft review.

All sixteen statements, options, solutions, pinned sources and figure were read
by a reviewer separate from the candidate author before freezing these hashes.
No authoring imports, human approval or publication authority.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-circular-force-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-circular-force-01": "76c6c8b4db01baf92370d13f3d89ff26c1f96476f48f1fabe74dc942bf76788a",
    "AR-u2-circular-force-02": "d816c0833a39000fbf5288d32b30eca937922be9b7443dc12621f6662b061aea",
    "AR-u2-circular-force-03": "eb9119ebc29c7109fc504a4766565f32e70e4ea5c1b1e5231581be02b176212b",
    "AR-u2-circular-force-04": "a04d1503eb0ccdc565c639ed7d69055a0a679929353bc7ca164cb64bcd428177",
    "AR-u2-circular-force-05": "03987e7ceb2ed6de9fd4a189e8ad76ebfe406ea02cc61b3ec756f0a2af1a94d6",
    "AR-u2-circular-force-06": "00efe1b77f5d88ef38ed504984107422042770a9140bb2c84a97bef191d37176",
    "AR-u2-circular-force-07": "e2a596fc9ad940e5053f26d39f44d775f927d891fe50d6ae5c8f79d3c472b79a",
    "AR-u2-circular-force-08": "5b9bf445d3e3a4b2beadcc41b60499115933a1a9167eb4cd3d874a3adb39023b",
    "AR-u2-circular-force-09": "324051d1c61294feef3c986760d916117322c69d8e9ece721f6a33bbba81ac00",
    "AR-u2-circular-force-10": "9f77aac69dbde778e6b7bee68fbe09df23f72180fddfce5c5eac5fe584cb2ee7",
    "AR-u2-circular-force-11": "c4f27b0bb708f070d44aa7c5f82de7bc085967b0782d0043db8a1352294bafae",
    "AR-u2-circular-force-12": "4e1d4d9640139c671f51c6a3ceb09d75c291e7478e6e64aa2c07238835e8bce1",
    "AR-u2-circular-force-13": "bae8f2da17b7f0a35b30c3be3b36c4a78e3414e1e072ca7d7b5edff99b586391",
    "AR-u2-circular-force-14": "0d1ff86254f0f13f31ac4b6c5ab2e28775b56734d52f4775edf2a1c4b2c0188e",
    "AR-u2-circular-force-15": "657fdb2125053a8ce55f0916b213c2ed679122c622fc1fc8b3b02d3d51e3e36b",
    "AR-u2-circular-force-16": "5306f697f0ab8c20f4f4a9e5e9efbbd28f199e144f1cf89f6b55ab7b871eacec",
}


def oracle():
    tau = sp.Symbol("tau", real=True)
    radius, omega, speed, mass, force, k1, k2, coefficient = sp.symbols("radius omega speed mass force k1 k2 coefficient", positive=True)
    orbit = sp.Matrix([radius*sp.cos(omega*tau), radius*sp.sin(omega*tau)])
    acceleration = orbit.diff(tau, 2)
    resultant_vector = mass*acceleration
    law = sp.sqrt(sp.trigsimp(resultant_vector.dot(resultant_vector))).subs(omega, speed/radius)
    if (sp.simplify(law-mass*speed**2/radius) != 0
            or sp.trigsimp(resultant_vector.dot(orbit.diff(tau))) != 0
            or sp.simplify(resultant_vector+mass*omega**2*orbit) != sp.zeros(2, 1)):
        raise ValueError("Independent Newton radial resultant from orbit derivatives failed")
    inverse_mass = sp.solve(sp.Eq(law, force), mass)[0]
    inverse_speed = sp.solve(sp.Eq(law, force), speed)[0]
    scaling = sp.simplify(law.subs({mass: k1*mass, speed: k2*speed}, simultaneous=True)/law)
    fixed_radius = sp.Integer(2)
    law_fixed = law.subs(radius, fixed_radius)
    first, second = law_fixed.subs({mass: 2, speed: 2}), law_fixed.subs({mass: 4, speed: 4})
    mean_outputs = (first+second)/2
    mean_input_output = law_fixed.subs({mass: 3, speed: 3})
    if (sp.simplify(scaling-k1*k2**2) != 0 or first != 4 or second != 32
            or mean_outputs != 18 or mean_input_output != sp.Rational(27, 2)):
        raise ValueError("Mass/speed scaling or mean distinction failed")
    Q = SI.Quantity
    display_gain = Q(12, "")/Q(int(first), "N")
    recovered_force = (Q(96, "")/display_gain).to("N").magnitude
    calibrated_mass = (Q(recovered_force, "N")*Q(2, "m")/Q(4, "m/s")**2).to("kg").magnitude
    c, offset = sp.symbols("c offset", real=True)
    calibration = sp.solve([sp.Eq(c*first+offset, 9), sp.Eq(c*second+offset, 65)], (c, offset))
    affine_force = (17-calibration[offset])/calibration[c]
    affine_mass = inverse_mass.subs({force: affine_force, radius: fixed_radius, speed: 2})
    constrained_law = sp.simplify(law.subs(mass, coefficient*speed))
    cubic = sp.solve(sp.Eq(constrained_law, force), speed**3)[0]
    constrained_numeric = sp.solve(sp.Eq(constrained_law.subs({coefficient: 1, radius: fixed_radius}), 4), speed)
    cube_units = (Q(4, "N")*Q(2, "m")/Q(1, "kg*s/m")).to("m**3/s**3").magnitude
    if (sp.simplify(cubic-force*radius/coefficient) != 0 or constrained_numeric != [2]
            or sp.diff(constrained_law, speed).is_positive is not True or sp.Rational(cube_units) != 8):
        raise ValueError("Unique positive cube root and dimensional constraint failed")
    si_force = (Q(2, "kg")*Q(2, "m/s")**2/Q(2, "m")).to("N").magnitude
    si_speed2 = (Q(4, "N")*Q(2, "m")/Q(2, "kg")).to("m**2/s**2").magnitude
    if sp.Rational(si_force) != first or sp.Rational(si_speed2) != 4 or calibration != {c: 2, offset: 1}:
        raise ValueError("Exact Pint units or affine calibration failed")
    desired_speed = inverse_speed.subs({force: 8*first, mass: 4, radius: fixed_radius})
    return [first, "N", "F=mv²/r₀", "Da 4 a 8 N",
            inverse_mass.subs({force: 4, radius: fixed_radius, speed: 2}),
            inverse_speed.subs({force: 4, radius: fixed_radius, mass: 2}),
            law_fixed.subs({mass: 2, speed: 4})/first, 8-first, "m=Fr₀/v²", "κ₁κ₂²", second/first,
            mean_outputs, desired_speed/2, sp.Rational(calibrated_mass), affine_mass, constrained_numeric[0]]


MANUAL = [
    "At r0=2m: A=2²/2=2m/s²; mass2kg gives resultant4N. It is the sum of real forces, not an additional interaction.",
    "kg times m/s² is N; radial direction does not change the force unit.",
    "Differentiate uniform circle twice for A=v²/r0, then Newton F=mA=mv²/r0. Radius2m is dimensional, never a pure2 in a quantity equation.",
    "Same v2m/s,r0=2m: A2m/s²; masses2,4kg give4,8N respectively, hence linear doubling.",
    "m=Fr0/v²=4*2/4=2kg; force times radius divided by speed squared leaves mass.",
    "v²=Fr0/m=4*2/2=4m²/s²; positive root2m/s, rotation sense unspecified.",
    "Same mass2kg and radius2m: F1=2*4/2=4N, F2=2*16/2=16N; ratio4.",
    "Correct F4N; proposed8 minus4 gives +4N. The error sign is not a radial direction convention.",
    "Multiply radius, divide v²: m=Fr0/v². Adding an extra factor2 doubles the mass because r0 already equals2m.",
    "Mass factor k1 and speed factor k2 give force factor k1*k2²; mass stays constant inside each separate trial.",
    "First2*4/2=4N, second4*16/2=32N; ratio32/4=8=2*4.",
    "Mean outputs(4+32)/2=18N; mean inputs3kg,3m/s give27/2N, not18. Statistical weights are equal, not arc traversal times.",
    "Desired F2=8*4=32N, mass4kg: v2²=32*2/4=16m²/s², v2=4m/s; ratio4/2=2.",
    "Gain12/(4N)=3N^-1; count96 gives32N; m=32*2/16=4kg. Counts are dimensionless.",
    "References4,32N and counts9,65 give gain56/28=2N^-1, offset1; (17-1)/2=8N; mass8*2/4=4kg.",
    "m=(1kg*s/m)v across trials gives F=cv³/r0; v³=Fr0/c=8m³/s³. Positive root2m/s, mass2kg. Cube strictly increasing for v>0, unique positive solution.",
]
UNITS = {1: "N", 2: "N", 3: "N", 4: "N", 5: "kg", 6: "m/s", 7: "1", 8: "N", 9: "kg", 10: "1",
         11: "1", 12: "N", 13: "1", 14: "kg", 15: "kg", 16: "m/s"}
OPTION_SUFFIX = {8: " N", 12: " N", 15: " kg", 16: " m/s"}
NUMERIC_UNITS = {1: "N", 5: "kg", 6: "m/s", 11: "1", 13: "1", 14: "kg"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent circular-force conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent Newton-resultant/exact-arithmetic result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-circular-force-{n:02}":
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
            "methods": ["independent_orbit_second_derivative", "Newton_total_real_resultant",
                        "SymPy_exact_inverse_scaling_affine_and_positive_cube", "Pint_dimensional_radius_and_calibration",
                        "separate_AI_all_statements_options_asset_reading"],
            "physicalAssumptions": ("Inertial frame; constant positive mass and rapidity, fixed dimensional radius r0=2m in each uniform circle. F is inward total resultant of real forces, not another interaction; tangential resultant zero. "
                + ("Equal statistical weights of output forces; no averaging of inputs or arc-time weights. " if n == 12 else "")
                + ("Dimensionless display counts, positive gain N^-1, dimensionless offset only15. " if n in {14, 15} else "")
                + ("m=(1kg*s/m)v selects different bodies/trials; mass is not changing during any trajectory; unique positive cube root. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent circular orbit derivatives and Newton total radial resultant at dimensional radius",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI review only; no human approval, empirical student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"circular-force-026.json").read_text()),
                    json.loads((args.directory/"circular-force-026-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
