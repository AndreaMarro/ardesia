"""Independent trajectory, exact arithmetic and unit oracle for sixteen read drafts.

No authoring imports. Frozen signatures were set after individual statement,
distractor, solution, pinned source and scientific-asset reading, including the
separate author's correction of the temporal-mean explanation in ID12.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-freefall-speed-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-freefall-speed-01": "406342d25d24bdbf82f6e7adaaa97942913f6c0447203147879b46d777682580",
    "AR-u2-freefall-speed-02": "83f4c05568b036a1bdc8d7849daaf4690ebb5779cf0b97d4986e517fffff3898",
    "AR-u2-freefall-speed-03": "dab6ef4207809702fa934d9fb0a747db8f6496b6dcc71632723b812aa9bd1f52",
    "AR-u2-freefall-speed-04": "792738bb708491c0a7525152841eb416502c5a77190f50a4c8c91f7258b32f32",
    "AR-u2-freefall-speed-05": "c8c05db00daf9cd142f776a238af4071a63ef49e8b0de935cdfd27565762fea7",
    "AR-u2-freefall-speed-06": "d8f19d98c7a704ea9a3fc4fb4e90412da4b3766c12f8e3eb4138e59cdd1fb86b",
    "AR-u2-freefall-speed-07": "5ff55c5a08cc9edaf0e74a59f986474e588d4b0ed789fcfaeb6a16128fdb2e14",
    "AR-u2-freefall-speed-08": "0851534d503610e172ef902d78dd1cd284c2e6bbac3cc0e8641b43f756edfabb",
    "AR-u2-freefall-speed-09": "55c6eab82a38953f626fc50a4610abcdf244e78482c8452328ec6cc8b0120f5f",
    "AR-u2-freefall-speed-10": "6fda172a4523fdb22d9d021f25cba0607dfbb02b142a28ed2cd0cf3039e1403a",
    "AR-u2-freefall-speed-11": "b7d5b9ea872879f8cd1b24f79ab8c9c5dd1e55a09e1173f3e30e9347e27e9703",
    "AR-u2-freefall-speed-12": "f69fd641405d850d9b057c57bfb25bb480a7e7bdb97197a94495244ad02ed175",
    "AR-u2-freefall-speed-13": "39a19643ad719895ef388663fd32694c10e17f807569b1b734cc8c1d91f58779",
    "AR-u2-freefall-speed-14": "d81ff58bbfa59051062ac0c476e6a4d1747a50010091a684ae4691a4290a5f5a",
    "AR-u2-freefall-speed-15": "3d672c0e0077d7061422ba75fe961f9339b3040eafd5ea266a1246069ff6b014",
    "AR-u2-freefall-speed-16": "06f62b0bd51e22ec78342117960f9d9b55efe4a11b5af232fa12248f4256e9f2",
}


def trajectory_model():
    tau = sp.Symbol("tau", nonnegative=True)
    g, h, H = sp.symbols("g h H", positive=True)
    # Integrate the downward component from zero velocity in an upward axis.
    velocity = sp.integrate(-g, (tau, 0, tau))
    position = H+sp.integrate(velocity, (tau, 0, tau))
    future_time = sp.sqrt(2*h/g)
    if (sp.simplify(position.subs(tau, future_time)-(H-h)) != 0
            or sp.diff(position, tau, 2) != -g):
        raise ValueError("Independent uniform-acceleration trajectory failed")
    modulus = sp.simplify(-velocity.subs(tau, future_time))
    if sp.simplify(modulus**2-2*g*h) != 0:
        raise ValueError("Time elimination failed")
    return g, h, modulus


def oracle():
    g, h, modulus = trajectory_model()
    V, k1, k2, coefficient = sp.symbols("V k1 k2 coefficient", positive=True)
    inverse_g = sp.solve(sp.Eq(V**2, modulus**2), g)[0]
    inverse_h = sp.solve(sp.Eq(V**2, modulus**2), h)[0]
    scaling = sp.simplify(modulus.subs({g: k1*g, h: k2*h}, simultaneous=True)/modulus)
    first = modulus.subs({g: 2, h: 1})
    larger_field = modulus.subs({g: 8, h: 1})
    second = modulus.subs({g: 8, h: 4})
    if sp.simplify(scaling-sp.sqrt(k1*k2)) != 0 or first != 2 or larger_field != 4 or second != 8:
        raise ValueError("Independent radical or scaling derivation failed")
    # Same positive g cancels exactly in the height ratio; no Earth g is assumed.
    H = sp.Symbol("H", positive=True)
    fallen = sp.solve(sp.Eq(modulus**2/(2*g*H), sp.Rational(1, 3)**2), h)[0]
    residual_height = (H-fallen).subs(H, 18)
    gain = SI.Quantity(6, "")/SI.Quantity(int(first), "m/s")
    calibrated_V = (SI.Quantity(24, "")/gain).to("m/s").magnitude
    calibrated_g = (SI.Quantity(calibrated_V, "m/s")**2/(2*SI.Quantity(4, "m"))).to("m/s**2").magnitude
    c, d = sp.symbols("c d", real=True)
    calibration = sp.solve([sp.Eq(c*first+d, 5), sp.Eq(c*second+d, 17)], (c, d))
    affine_V = (9-calibration[d])/calibration[c]
    affine_g = inverse_g.subs({V: affine_V, h: 1})
    # This relation selects a field for a trial; g is not a function of position.
    constrained_height = sp.solve(sp.Eq(V**2, modulus**2).subs(g, coefficient*h), h)[0]
    constrained_answer = constrained_height.subs({coefficient: 2, V: 2})
    constrained_units = (SI.Quantity(2, "m/s")**2/(2*SI.Quantity(2, "s**-2"))).to("m**2").magnitude
    if constrained_answer != sp.sqrt(sp.Rational(constrained_units)):
        raise ValueError("Across-trial dimensional constraint failed")
    speed_units = (2*SI.Quantity(2, "m/s**2")*SI.Quantity(1, "m")).to("m**2/s**2").magnitude
    if first != sp.sqrt(sp.Rational(speed_units)) or calibration[c] != 2 or calibration[d] != 1:
        raise ValueError("Calibration or SI check failed")
    # Distinguish equal-weight endpoint mean from each trajectory's temporal mean.
    tau = sp.Symbol("tau", nonnegative=True)
    temporal_means = [sp.integrate(field*tau, (tau, 0, sp.sqrt(2*height/field)))/sp.sqrt(2*height/field)
                      for field, height in [(sp.Integer(2), sp.Integer(1)), (sp.Integer(8), sp.Integer(4))]]
    if temporal_means != [1, 4] or modulus.subs({g: 5, h: sp.Rational(5, 2)}) != 5:
        raise ValueError("Endpoint/temporal means failed")
    if sp.simplify((modulus.subs({g: 2, h: 1})+modulus.subs({g: 2, h: 4}))/2) == modulus.subs({g: 2, h: sp.Rational(5, 2)}):
        raise ValueError("Nonlinear mean counterexample failed")
    required_height = inverse_h.subs({V: 4*first, g: 8})
    return [first, "m/s", "V=√(2gh)", "Raddoppia da 2 a 4 m/s",
            inverse_g.subs({V: 2, h: 1}), inverse_h.subs({V: 2, g: 2}),
            modulus.subs({g: 2, h: 4})/first, residual_height, "g=V²/(2h)", "√(κ₁κ₂)",
            second/first, (first+second)/2, required_height,
            sp.Rational(calibrated_g), affine_g, constrained_answer]


MANUAL = [
    "2*2*1=4 m2/s2; sqrt4=2m/s. Upward-axis component is-2m/s, not a negative modulus.",
    "(m/s2)*m=m2/s2; taking the positive square root yields m/s, with coefficient2 dimensionless.",
    "Integrate ay=-g from rest:vy=-g*t and drop=g*t2/2; eliminate t to get vy2=2gh and V=positive sqrt(2gh).",
    "Firstsqrt(2*2*1)=2; secondsqrt(2*8*1)=4m/s. Field factor4 becomes speed factor2.",
    "Square2 to4 and divide by2*1: g=2m/s2; never divide unsquared V by h.",
    "Square2 to4 and divide by2*2: h=1m; upward displacement is-1m while drop is positive.",
    "At sameg2: V1=2 and V2=sqrt16=4m/s, so4/2=2; not drop ratio4.",
    "Speed ratio1/3 squared gives drop ratio1/9;18/9=2m fallen;18-2=16m above ground. Sameg cancels.",
    "Positive-domain square gives V2=2gh; divide by nonzero2h to get g=V2/(2h), acceleration units.",
    "Squared-speed ratio=k1*k2; positive square root gives sqrt(k1*k2). Wrong universal laws fail e.g.k1=k2=4 or k1=1,k2=4.",
    "Firstsqrt4=2, secondsqrt64=8m/s;8/2=4, whereas squared-speed ratio is16.",
    "Endpoint arithmetic mean(2+8)/2=5m/s. Individual temporal means are2/2=1 and8/2=4m/s; not requested. Mean inputs5 and5/2 happen to give5 because proportional; with(2,1),(2,4) endpoint mean3 differs from sqrt10.",
    "Required speed factor4 means square factor16; field supplies4, so drop ratio16/4=4; h2=4m and V2=8m/s.",
    "ReferenceV2m/s givesc=6/2=3s/m;24/c=8m/s;g=8²/(2*4)=64/8=8m/s2. Counts are dimensionless.",
    "Reference speeds2,8m/s;gain(17-5)/(8-2)=12/6=2s/m;offset5-2*2=1;V=(9-1)/2=4m/s;g16/(2*1)=8m/s2.",
    "Selectedg=(2s^-2)h, fixed inside a trial; V2=(4s^-2)h2. V2=4m2/s2 givesh2=1m2 andh=1m in positive domain;g2m/s2. Not a field varying with instantaneous height.",
]
UNITS = {1: "m/s", 2: "m/s", 3: "m/s", 4: "m/s", 5: "m/s**2", 6: "m", 7: "1", 8: "m",
         9: "m/s**2", 10: "1", 11: "1", 12: "m/s", 13: "1", 14: "m/s**2", 15: "m/s**2", 16: "m"}
OPTION_SUFFIX = {8: " m", 12: " m/s", 15: " m/s²", 16: " m"}
NUMERIC_UNITS = {1: "m/s", 5: "m/s²", 6: "m", 11: "1", 13: "1", 14: "m/s²"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent free-fall conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent trajectory/exact-arithmetic result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-freefall-speed-{n:02}":
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
            "methods": ["independent_acceleration_and_position_integration", "time_elimination_positive_modulus",
                        "SymPy_exact_inversion_scaling_and_calibration", "Pint_exact_dimensions",
                        "separate_AI_all_statements_options_and_SVG_review"],
            "physicalAssumptions": ("Uniform positive assigned field during each trial; release from rest, no air resistance, positive drop; speed modulus distinct from negative component on upward axis. "
                + ("Across-trial dimensional relation selects g; it does not vary with current height. " if n == 16 else "")
                + ("Same positive field cancels; ground origin zero, initial height18m, remaining altitude versus fallen distance. " if n == 8 else "")
                + ("Equal statistical weights of final outputs, not temporal means; each individual temporal speed mean is Vfinal/2. " if n == 12 else "")
                + ("Display counts dimensionless; gain has units s/m and positive constant, offset dimensionless only15. " if n in {14, 15} else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent integration of uniform downward acceleration and exact manual endpoint speeds",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI mathematical/scientific reading, no human approval, student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"freefall-speed-021.json").read_text()),
                    json.loads((args.directory/"freefall-speed-021-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
