"""Separate-reviewer exact 2D trajectories, endpoint range and the apex exception.

No authoring import. All sixteen source/candidate statements, choices, solutions
and the complete scientific SVG were read before these signatures were frozen.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-projectile-range-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-projectile-range-01": "d87308ea5467e4e508dc3e4b10357d41e954061c32d85fb908bf45ed3ff15f24",
    "AR-u2-projectile-range-02": "213dc1a2d75df63a0d1a5bc937dbd2605368531af0549e86048ceb0e9ef7676b",
    "AR-u2-projectile-range-03": "c4a20acd8b39068f004612d062cdea3ea4e4435037b67ea3d78571a10a2b7d46",
    "AR-u2-projectile-range-04": "2ec141d47f3df3bbab6e735437598591c8dc034827c6cd0ca1751ceec11c4649",
    "AR-u2-projectile-range-05": "2b317da0783252730336ddbf582af5a04bcc8502150fa6db6c547061e7b4b2f6",
    "AR-u2-projectile-range-06": "aafd1123e0dd7026464f3f2dd536aa16e100422432fc59fb36bd1b87efc2e44f",
    "AR-u2-projectile-range-07": "f971ed1d50bc8a1f4d4c87c2d203bbbf2b15a7499a48573e6f7d47838c40a930",
    "AR-u2-projectile-range-08": "4a1708aaa9d506db815a603e5ba9411266507b3b23f03aac24565898a8354b8c",
    "AR-u2-projectile-range-09": "f44335e3326eb12b6f8784afa25473fc37fcbfd3f45b85bcd4bfb09197cd77af",
    "AR-u2-projectile-range-10": "56bd4f942948fb61c74e69fe785e6243dd903a4b8c35f301c07124c437491416",
    "AR-u2-projectile-range-11": "d9ac776bae2c4f2124bb923de5ff667ee804abb69bcf3ddc4fb5b6e738823e45",
    "AR-u2-projectile-range-12": "f40c42d3ef8359aafe7fef3a18804bc234a6025bceff3e445a3399b0064453eb",
    "AR-u2-projectile-range-13": "344f79da5edbc8239837aed97941eba8a3d1a2cd6a3eea43a2ab0f82384831e0",
    "AR-u2-projectile-range-14": "2ee3cf871a64b7a78d645d83fc8e9ba315d30e55cfdd06e1f925328256c8de5f",
    "AR-u2-projectile-range-15": "c64157284245f058b64476c517bb5d5830067e5ee14ceff046071904900b778e",
    "AR-u2-projectile-range-16": "eb6b7535b48e76a13261963fd9cb3476dbde2895ca9e71d65c433fc2654b49e4",
}


def projectile_model():
    tau = sp.Symbol("tau", real=True)
    u, w, g = sp.symbols("u w g", positive=True)
    acceleration = sp.Matrix([0, -g])
    velocity = sp.Matrix([u, w])+acceleration*tau
    position = velocity.applyfunc(lambda component: sp.integrate(component, (tau, 0, tau)))
    roots = sp.solve(sp.Eq(position[1], 0), tau)
    future = [root for root in roots if root.is_positive is True]
    if 0 not in roots or len(future) != 1:
        raise ValueError("Expected launch zero and one future same-height return")
    duration = future[0]
    apex = sp.solve(sp.Eq(velocity[1], 0), tau)[0]
    full_range, apex_x = position[0].subs(tau, duration), position[0].subs(tau, apex)
    if (sp.simplify(full_range-2*u*w/g) != 0 or sp.simplify(full_range-2*apex_x) != 0
            or position.diff(tau, 2) != acceleration or velocity[0] != u
            or sp.simplify(position[1].subs(tau, apex)-w**2/(2*g)) != 0):
        raise ValueError("Independent component integration/apex/range identities failed")
    return u, w, g, full_range, duration, apex_x


def oracle():
    u, w, g, full_range, duration, apex_x = projectile_model()
    target, k1, k2 = sp.symbols("target k1 k2", positive=True)
    inverse_u = sp.solve(sp.Eq(full_range, target), u)[0]
    inverse_w = sp.solve(sp.Eq(full_range, target), w)[0]
    scaling = sp.simplify(full_range.subs({u: k1*u, w: k2*w}, simultaneous=True)/full_range)
    first = full_range.subs({u: 2, w: 2, g: 10})
    second = full_range.subs({u: 4, w: 4, g: 10})
    means = (first+second)/2
    if (first != sp.Rational(4, 5) or second != sp.Rational(16, 5) or means != 2
            or full_range.subs({u: 3, w: 3, g: 10}) != sp.Rational(9, 5)
            or sp.simplify(scaling-k1*k2) != 0):
        raise ValueError("Exact bilinear scaling/output mean failed")
    # Individually authored source exception06 stops at the apex, not at return.
    apex_distance = apex_x.subs({u: 4, w: 5, g: 10})
    if apex_distance != 2 or full_range.subs({u: 4, w: 5, g: 10}) != 4:
        raise ValueError("Apex-specific source task confused with full range")
    Q = SI.Quantity
    gain = Q(Fraction(12, 5), "")/Q(Fraction(4, 5), "m")
    calibrated_range = (Q(Fraction(48, 5), "")/gain).to("m").magnitude
    calibrated_u = (Q(10, "m/s**2")*Q(calibrated_range, "m")/(2*Q(4, "m/s"))).to("m/s").magnitude
    c, offset = sp.symbols("c offset", real=True)
    calibration = sp.solve([sp.Eq(c*first+offset, sp.Rational(13, 5)),
                            sp.Eq(c*second+offset, sp.Rational(37, 5))], (c, offset))
    decoded_range = (sp.Rational(21, 5)-calibration[offset])/calibration[c]
    affine_u = inverse_u.subs({target: decoded_range, w: 2, g: 10})
    constrained = sp.solve(sp.Eq(full_range.subs(u, w), target), w)[0]
    positive_component = constrained.subs({g: 10, target: sp.Rational(4, 5)})
    si_range = (2*Q(2, "m/s")*Q(2, "m/s")/Q(10, "m/s**2")).to("m").magnitude
    si_apex = (Q(4, "m/s")*Q(5, "m/s")/Q(10, "m/s**2")).to("m").magnitude
    if (sp.Rational(si_range) != first or sp.Rational(si_apex) != apex_distance
            or calibration != {c: 2, offset: 1} or decoded_range != sp.Rational(8, 5)
            or affine_u != 4 or positive_component != 2):
        raise ValueError("SI units, affine calibration or positive-root constraint failed")
    # Entire exact SVG parabola, common component scale and the labelled timeline.
    q = sp.Symbol("q", real=True)
    px = (1-q)**2*100+2*(1-q)*q*260+q**2*420
    py = (1-q)**2*550+2*(1-q)*q*350+q**2*550
    mapped_x, mapped_y = (px-100)/80, (550-py)/80
    if (sp.simplify(mapped_x-4*q) != 0 or sp.simplify(mapped_y-(5*q-5*q**2)) != 0
            or mapped_x.subs(q, sp.Rational(1, 2)) != 2 or mapped_y.subs(q, sp.Rational(1, 2)) != sp.Rational(5, 4)
            or sp.Rational(180-100, 20) != 4 or sp.Rational(220-120, 20) != 5
            or sp.Rational(280-80, 400) != sp.Rational(1, 2) or sp.Rational(480-80, 400) != 1):
        raise ValueError("Scientific SVG components, parabola or time scale failed")
    return [first, "m", "R=2uw/g", "Raddoppia da 4/5 a 8/5 m",
            inverse_u.subs({g: 10, target: first, w: 2}), apex_distance,
            full_range.subs({u: 2, w: 4, g: 10})/first, sp.Rational(8, 5)-first,
            "u=gR/(2w)", "κ₁κ₂", second/first, means,
            inverse_w.subs({g: 10, target: 4*first, u: 4})/2,
            sp.Rational(calibrated_u), affine_u, positive_component]


MANUAL = [
    "With u=w=2 and g10, future return time2w/g=4/10=2/5s; rangeuT=2*2/5=4/5m.",
    "Two velocity components multiply to L²/T²; dividing acceleration L/T² leaves length, SI metre.",
    "Integrate components with ax0,ay=-g; vertical future rootT=2w/g; constant horizontal component givesR=uT=2uw/g.",
    "w2 and g10 keep T2/5s; u2->4 gives range4/5->8/5m, factor2, not4.",
    "u=gR/(2w)=10*(4/5)/(2*2)=2m/s. No square root when vertical component is known.",
    "Exception06:u4,w5,g10. Apex when vy0 gives t=5/10=1/2s; horizontal advance4*(1/2)=2m. Return1s and full range4m are not requested; apex height25/20=5/4m.",
    "Sameu2 withw2->4 doubles time2/5->4/5s, range4/5->8/5m, ratio2.",
    "Proposed8/5 minus correct4/5=(8-4)/5=4/5m, positive overestimate.",
    "R=2uw/g implies gR=2uw; divide2w>0 to get u=gR/(2w), velocity units.",
    "Each initial component enters once: factor k1 on u and k2 on w gives range factor k1*k2 at common g.",
    "RangeA4/5m,rangeB2*4*4/10=16/5m; ratio4, dimensionless rather than4m.",
    "Outputmean(4/5+16/5)/2=(20/5)/2=2m; mean inputs3,3 give18/10=9/5m instead.",
    "Targetrange16/5m withu4: wB=10*(16/5)/(2*4)=4m/s; compared withwA2 gives ratio2.",
    "Reference(12/5 counts)/(4/5m)=3m^-1;48/5 counts decode16/5m; u=10*(16/5)/(2*4)=4m/s.",
    "Reference difference(37-13)/5 divided by(16-4)/5m givesgain2m^-1;offset1. C:(21/5-1)/2=8/5m;u=10*(8/5)/4=4m/s.",
    "u=w>0 reduces range2w²/g;w²=10*(4/5)/2=4m²/s²;positive root2m/s,also u2. Negative branch excluded by both initial component directions.",
]
UNITS = {1: "m", 2: "m", 3: "m", 4: "m", 5: "m/s", 6: "m", 7: "1", 8: "m", 9: "m/s", 10: "1",
         11: "1", 12: "m", 13: "1", 14: "m/s", 15: "m/s", 16: "m/s"}
OPTION_SUFFIX = {1: " m", 8: " m", 12: " m", 15: " m/s", 16: " m/s"}
NUMERIC_UNITS = {5: "m/s", 6: "m", 11: "1", 13: "1", 14: "m/s"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent projectile-range conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent component-trajectory/range result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-projectile-range-{n:02}":
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
            "methods": ["independent_2D_acceleration_integration_and_vertical_future_root", "apex_exception_separate_from_full_range",
                        "SymPy_exact_inversion_scaling_affine_positive_root", "Pint_exact_dimensions", "separate_AI_statement_option_asset_reading"],
            "physicalAssumptions": ("Positive initial components along+x and upward+y; uniform vertical field, no drag or horizontal acceleration; same launch/arrival height for full range, except06 explicitly stops at the apex. "
                + ("Equal output statistical weights, not input means or equal durations. " if n == 12 else "")
                + ("Pure display counts, positive gain m^-1, dimensionless offset only15. " if n in {14, 15} else "")
                + ("u=w>0 is a dimensionless across-data relation; unique positive component root, no angle calculation required. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent projectile components, apex versus same-height return, exact fractions",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI review only; no human approval, empirical student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"projectile-range-028.json").read_text()),
                    json.loads((args.directory/"projectile-range-028-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
