"""Separate AI review and exact trajectory oracle for sixteen fall-duration drafts.

No authoring imports. Every statement, option, solution, pinned source and asset
was read before these content/source/asset signatures were frozen.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-freefall-time-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-freefall-time-01": "8282207e47b6abade7f55dc58142170658b2ef98448b845f1314f888d48d4d40",
    "AR-u2-freefall-time-02": "5772793f08ed115a0865de9a31adb9664c0fde45d76b10bac8bd376dfab111a7",
    "AR-u2-freefall-time-03": "c1e9e1728544b1b8aabc896cece3b637c38697e3c669983179bdbaef50cf79fe",
    "AR-u2-freefall-time-04": "3ee04470e61f4f5366861e27261ffb14c705dfd24afad633dc0fa160e43d8d23",
    "AR-u2-freefall-time-05": "7c3254b07b8e11f714acf2c4d4ae5a597dbe87e53f3cfb3ae751a9cab0a62d83",
    "AR-u2-freefall-time-06": "07c395464b8d6b909f2d323cfd794189f12a21eecdd8dfd0de30d52361751d40",
    "AR-u2-freefall-time-07": "73b9e75d6fc3aca240ec7a28074b00e43ab84bfd8da0da261ce1f6e1f4b5e8ed",
    "AR-u2-freefall-time-08": "158a01555fd0d31c6f26de7fc85a6418a7944835bf0a027d9325a4389f83a6e9",
    "AR-u2-freefall-time-09": "94db75c8badc7351d4b330272eb52a680d4da3fd8a17d6a416d0159c9082b501",
    "AR-u2-freefall-time-10": "846d4649fc939d3bae5b60b71f4689b7ae9466e0bfecdb9b2dfc5f38243606d4",
    "AR-u2-freefall-time-11": "a0e463b23c86ec282f0011005098b3514e682247756cb73f9646fc2b121e69f7",
    "AR-u2-freefall-time-12": "3a5dfb4b3b6d2f07bfb7fd00d89c0527dd1ad7b201bfd446744f58a0580a6c94",
    "AR-u2-freefall-time-13": "ab25bc0289d7579cc7087777362348ab8625dd1c2538a5bcf2d8aef97c7d0478",
    "AR-u2-freefall-time-14": "6333a2942818ac0465ed97fea871d4563c7757389c8fa718597832d9d535dd2d",
    "AR-u2-freefall-time-15": "0a07f783842f868ac62ead0df363d14e01f9e408359a0981c49985cea08b12c8",
    "AR-u2-freefall-time-16": "96dd23649f78fadec5db2aec049df5c5d42ce770799f2ff9ab52db40f1dcc64e",
}


def oracle():
    tau = sp.Symbol("tau", real=True)
    h, g, m, duration = sp.symbols("h g m duration", positive=True)
    acceleration = sp.Symbol("acceleration", real=True)
    # Downward scalar Newton equation; equal inertial/gravitational mass in model.
    a_m = sp.solve(sp.Eq(m*g, m*acceleration), acceleration)[0]
    a_3m = sp.solve(sp.Eq(3*m*g, 3*m*acceleration), acceleration)[0]
    if a_m != g or a_3m != g:
        raise ValueError("Mass-independent acceleration check failed")
    upward_velocity = sp.integrate(-g, (tau, 0, tau))
    coordinate = h+sp.integrate(upward_velocity, (tau, 0, tau))
    roots = sp.solve(sp.Eq(coordinate, 0), tau)
    future = [root for root in roots if root.is_positive is True]
    if len(future) != 1:
        raise ValueError("Expected exactly one positive arrival time")
    T = future[0]
    if sp.simplify(T**2-2*h/g) != 0 or sp.diff(coordinate, tau).subs(tau, 0) != 0:
        raise ValueError("Independent trajectory/time elimination failed")
    height_inverse = sp.solve(sp.Eq(coordinate.subs(tau, duration), 0), h)[0]
    gravity_inverse = sp.solve(sp.Eq(coordinate.subs(tau, duration), 0), g)[0]
    k1, k2 = sp.symbols("k1 k2", positive=True)
    scaling = sp.simplify(T.subs({h: k1*h, g: k2*g}, simultaneous=True)/T)
    if sp.simplify(scaling-sp.sqrt(k1/k2)) != 0:
        raise ValueError("Height/field ratio scaling failed")
    first, second = T.subs({h: 2, g: 1}), T.subs({h: 1, g: 2})
    mean_output = (first+second)/2
    mean_input_output = T.subs({h: sp.Rational(3, 2), g: sp.Rational(3, 2)})
    if mean_output != sp.Rational(3, 2) or mean_input_output != sp.sqrt(2) or mean_output**2 == mean_input_output**2:
        raise ValueError("Exact arithmetic mean/mean-input distinction failed")
    Q = SI.Quantity
    gain = Q(6, "")/Q(int(first), "s")
    calibrated_T = (Q(3, "")/gain).to("s").magnitude
    calibrated_h = (Q(Fraction(1, 2), "")*Q(2, "m/s**2")*Q(calibrated_T, "s")**2).to("m").magnitude
    c, d = sp.symbols("c d", real=True)
    calibration = sp.solve([sp.Eq(c*first+d, 5), sp.Eq(c*second+d, 3)], (c, d))
    unknown_duration = (9-calibration[d])/calibration[c]
    recovered_height = height_inverse.subs({g: 1, duration: unknown_duration})
    if calibration != {c: 2, d: 1} or unknown_duration != 4 or recovered_height != 8:
        raise ValueError("Affine calibration failed")
    time_units = (2*Q(2, "m")/Q(1, "m/s**2")).to("s**2").magnitude
    acceleration_units = (2*Q(2, "m")/Q(2, "s")**2).to("m/s**2").magnitude
    if first != sp.sqrt(sp.Rational(time_units)) or sp.Rational(acceleration_units) != 1:
        raise ValueError("Pint exact dimensions failed")
    # T=2 and h=(2s²)g describe the same ratio, not independent measurements.
    parameter = sp.Symbol("parameter", positive=True)
    constrained = sp.simplify(T.subs({h: 2*parameter, g: parameter}, simultaneous=True))
    constraints = sp.Matrix([h-2*g, 4-2*h/g])
    rank = constraints.jacobian([h, g]).subs(h, 2*g).rank()
    if constrained != 2 or rank != 1:
        raise ValueError("Positive one-parameter family/rank check failed")
    # Exact quadratic Bezier in asset: t=2u and y=2-2u², with labelled mid-point.
    u = sp.Symbol("u", real=True)
    pixel_x = (1-u)**2*100+2*(1-u)*u*200+u**2*300
    pixel_y = (1-u)**2*540+2*(1-u)*u*540+u**2*700
    mapped_t, mapped_y = (pixel_x-100)/100, (700-pixel_y)/80
    if sp.simplify(mapped_y-(2-mapped_t**2/2)) != 0 or mapped_y.subs(u, sp.Rational(1, 2)) != sp.Rational(3, 2):
        raise ValueError("Scientific SVG trajectory/scale failed")
    required_g = gravity_inverse.subs({h: 1, duration: first/2})
    return [first, "s", sp.simplify(T.subs(g, a_3m)/T.subs(g, a_m)), "Raddoppia da 2 a 4 s",
            height_inverse.subs({g: 1, duration: 2}), gravity_inverse.subs({h: 2, duration: 2}),
            T.subs({h: 2, g: 4})/first, 4-first, "h=gT²/2", "√(κ₁/κ₂)",
            second/first, mean_output, required_g, sp.Rational(calibrated_h), recovered_height, "Infinite coppie positive"]


MANUAL = [
    "2h/g=2*2/1=4s2, roots +/-2s; first future arrival is2s. y(0)=2m,vy(0)=0, y(1)=3/2m, y(2)=0.",
    "m divided bym/s2 iss2, then square root iss; coefficient2 is pure.",
    "Weight of3m is3mg, inertia3m; their ratio isg just asmg/m=g. Equal initial heights and rest imply identical T, ratio1.",
    "sqrt(2*2/1)=2s andsqrt(2*8/1)=4s; heightfactor4 gives timefactor2, not4.",
    "h=(1/2)*1*2²=2m; gT alone has velocity units.",
    "g=2*2/2²=4/4=1m/s2; upward-axis acceleration is-1m/s2.",
    "Sameh2: T1=2s,T2=sqrt(4/4)=1s;ratio1/2. Squared-time ratio1/4 is not requested.",
    "Correctsqrt4=2s; proposed4s minus correct2s=+2s. Algebraic continuation y(4)=2-8=-6m is not the first arrival.",
    "SquareT=sqrt(2h/g), multiplyg and divide2: h=gT²/2. For T>0, substitution gives sqrt(T²)=T.",
    "Squared ratio=(h2/h1)/(g2/g1)=k1/k2; positive root gives sqrt(k1/k2). Not product or inverse.",
    "Firstsqrt4=2s, secondsqrt(2*1/2)=1s;ratio1/2. Heightfactor1/2 divided by fieldfactor2 gives squared-time factor1/4.",
    "Mean(2+1)/2=3/2s; time onmean inputs is sqrt(2*(3/2)/(3/2))=sqrt2s. Distinct because9/4 !=2, no decimal needed.",
    "Desired timefactor1/2 gives squaredfactor1/4; heightfactor1/2 divided by unknownfieldfactor=1/4, so fieldfactor2.",
    "ReferenceT2s andcount6 givegain3s^-1; count3 givesT1s;h=(1/2)*2*1²=1m.",
    "ReferenceT2,1s andcounts5,3: gain2s^-1,offset1; (9-1)/2=4s;h=(1/2)*1*4²=8m.",
    "For anylambda>0 chooseg=lambda m/s2 andh=2lambda m. Then2h/g=4s2 andT=2s. Infinite positive pairs; rank1, not a second independent condition.",
]
UNITS = {1: "s", 2: "s", 3: "1", 4: "s", 5: "m", 6: "m/s**2", 7: "1", 8: "s",
         9: "m", 10: "1", 11: "1", 12: "s", 13: "1", 14: "m", 15: "m", 16: "1"}
OPTION_SUFFIX = {8: " s", 12: " s", 15: " m"}
NUMERIC_UNITS = {1: "s", 5: "m", 6: "m/s²", 13: "1", 14: "m"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent fall-duration conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent trajectory/exact-duration result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-freefall-time-{n:02}":
            errors.append("Not bound to the independently read pinned source")
        if n == 3 and "C1-L005" not in row.get("prerequisites", []):
            errors.append("Mass/inertia explanation requires the read Newton prerequisite")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != SOURCE_REF
                or provenance.get("sourcePath") != SOURCE_PATH):
            errors.append("Author provenance envelope changed or inconsistent")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {str(k): str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_uniform_acceleration_integration_and_future_root", "Newton_mass_cancellation",
                        "SymPy_exact_inverses_ratios_affine_calibration_and_rank", "Pint_exact_dimensions",
                        "separate_AI_all_statements_options_and_SVG_review"],
            "physicalAssumptions": ("Release from rest; assigned positive uniform field constant inside each trial; no air; positive height above fixed arrival level; elapsed first future arrival, no below-ground continuation. "
                + ("Same inertial/gravitational mass coupling; masses m and3m yield equal acceleration and time. " if n == 3 else "")
                + ("Equal statistical weights of independently computed durations, not time evaluated at mean inputs. " if n == 12 else "")
                + ("Display counts pure; gain positive constant s^-1, offset dimensionless only15. " if n in {14, 15} else "")
                + ("h=(2s²)g selects trial initial data; duration2s repeats their ratio and leaves a positive one-parameter family. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent integrated trajectory, positive future root and mass-independent Newton model",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI mathematical/scientific reading, no human approval, student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"freefall-time-022.json").read_text()),
                    json.loads((args.directory/"freefall-time-022-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
