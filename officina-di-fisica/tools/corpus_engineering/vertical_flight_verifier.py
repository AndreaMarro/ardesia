"""Separate AI review of sixteen same-level vertical returns, from trajectory roots.

No authoring imports. All statements, options, solutions, source bindings and
scientific graphic were read before freezing these independent signatures.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-vertical-flight-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-vertical-flight-01": "c28aef312129c23ffbf04aa8c2146fd289f76fa33d97d1621a8c8c3605ca9a87",
    "AR-u2-vertical-flight-02": "53a1ffaeeb5b2797c263f633399515bd1b9c33b0f8007f1cdabea54f7d55ea8d",
    "AR-u2-vertical-flight-03": "6aa73accadd96a8dfdbef0a497a5118720b377f1d33ee1530ccd2685267d4526",
    "AR-u2-vertical-flight-04": "9191da11be4372444b8cb913ca102d21f602aff806c096866d49da5d0314e1bf",
    "AR-u2-vertical-flight-05": "555a1fecfe9a142888a0cdcfe41aab6120afd60f90a80c465f3ac0ccbdb09151",
    "AR-u2-vertical-flight-06": "4d2afd08cd6b5ed98f2c079e5d885f5da44da2624516d0c77b116a052b6af1be",
    "AR-u2-vertical-flight-07": "5c1e436219e80001d79c222985d376623abdb6bdb503670111ff5d5efb72d2c3",
    "AR-u2-vertical-flight-08": "18497e5eebacd4a270ce0d0015e3d0273c94492698c9e8816b6b93610e463e1d",
    "AR-u2-vertical-flight-09": "303db61a8384240db0fdb22a687e9b0d7e06009f5d27100127eba36a6ce85296",
    "AR-u2-vertical-flight-10": "8874e42915505dd818d02d09fbbbff486f7c87e2f6956e2a237417355e1d6dfa",
    "AR-u2-vertical-flight-11": "da6ffc036d1da034692c9787740006556d902cee25d284320adac479d6b031e2",
    "AR-u2-vertical-flight-12": "1e1d4a6e73c79b4ccdaf50fe419ec9ef454409abe9e5e261032db0eb700ad168",
    "AR-u2-vertical-flight-13": "ed39534ddf0a54fed51c6fd3061e6d32a381065b25dc9a489c1366540dcbd7d7",
    "AR-u2-vertical-flight-14": "dcb063f42693ff041ddba41fa9c3c5476fd5b9b318fe7f6eb001edd1dbf05c80",
    "AR-u2-vertical-flight-15": "e597c5c2c1ff024144720fdfd06fcc5b18d2c115cad0817ac02c3bcbc82749af",
    "AR-u2-vertical-flight-16": "e32995676503c283533a471ab2bcad9ec88b3e38b024b4a4ab9918cc2968d88d",
}


def flight_model():
    tau = sp.Symbol("tau", real=True)
    v0, g = sp.symbols("v0 g", positive=True)
    velocity = v0+sp.integrate(-g, (tau, 0, tau))
    coordinate = sp.integrate(velocity, (tau, 0, tau))
    roots = sp.solve(sp.Eq(coordinate, 0), tau)
    future = [root for root in roots if root.is_positive is True]
    if 0 not in roots or len(future) != 1:
        raise ValueError("Expected launch zero and exactly one future return")
    T = future[0]
    apex = sp.solve(sp.Eq(velocity, 0), tau)[0]
    path = sp.integrate(velocity, (tau, 0, apex))-sp.integrate(velocity, (tau, apex, T))
    if (sp.simplify(T-2*v0/g) != 0 or sp.simplify(T-2*apex) != 0
            or sp.simplify(velocity.subs(tau, T)+v0) != 0
            or sp.simplify(path-v0**2/g) != 0):
        raise ValueError("Independent return/apex/velocity/path identities failed")
    return v0, g, T


def oracle():
    v0, g, T = flight_model()
    duration, k1, k2 = sp.symbols("duration k1 k2", positive=True)
    inverse_v = sp.solve(sp.Eq(T, duration), v0)[0]
    inverse_g = sp.solve(sp.Eq(T, duration), g)[0]
    scaling = sp.simplify(T.subs({v0: k1*v0, g: k2*g}, simultaneous=True)/T)
    first, second = T.subs({v0: 2, g: 2}), T.subs({v0: 6, g: 4})
    mean_outputs = (first+second)/2
    if (first != 2 or second != 3 or mean_outputs != sp.Rational(5, 2)
            or T.subs({v0: 4, g: 3}) != sp.Rational(8, 3) or sp.simplify(scaling-k1/k2) != 0):
        raise ValueError("Exact scaling and output/mean-input distinction failed")
    Q = SI.Quantity
    display_gain = Q(6, "")/Q(int(first), "s")
    recovered_T = (Q(9, "")/display_gain).to("s").magnitude
    calibrated_v = (Q(4, "m/s**2")*Q(recovered_T, "s")/2).to("m/s").magnitude
    c, offset = sp.symbols("c offset", real=True)
    calibration = sp.solve([sp.Eq(c*first+offset, 5), sp.Eq(c*second+offset, 7)], (c, offset))
    affine_T = (9-calibration[offset])/calibration[c]
    affine_v = inverse_v.subs({g: 2, duration: affine_T})
    parameter = sp.Symbol("parameter", positive=True)
    constrained = sp.simplify(T.subs({v0: parameter, g: parameter}, simultaneous=True))
    rank = sp.Matrix([v0-g, 2-2*v0/g]).jacobian([v0, g]).subs(v0, g).rank()
    selected_units = (Q(1, "s")*Q(2, "m/s**2")).to("m/s").magnitude
    if constrained != 2 or rank != 1 or sp.Rational(selected_units) != 2:
        raise ValueError("Positive one-parameter constraint or dimensions failed")
    if calibration != {c: 2, offset: 1} or affine_T != 4 or affine_v != 4:
        raise ValueError("Affine time calibration failed")
    si_time = (2*Q(2, "m/s")/Q(2, "m/s**2")).to("s").magnitude
    if sp.Rational(si_time) != first:
        raise ValueError("Exact SI time units failed")
    # Exact scientific figure: quadratic Bezier and signed velocity areas.
    u = sp.Symbol("u", real=True)
    px = (1-u)**2*100+2*(1-u)*u*220+u**2*340
    py = (1-u)**2*520+2*(1-u)*u*280+u**2*520
    mapped_t, mapped_y = (px-100)/120, (520-py)/120
    if sp.simplify(mapped_y-(2*mapped_t-mapped_t**2)) != 0:
        raise ValueError("SVG position curve or scales failed")
    positive_area = sp.Rational(1, 2)*120*100/(120*50)
    negative_area = -sp.Rational(1, 2)*120*100/(120*50)
    if positive_area != 1 or negative_area != -1 or abs(positive_area)+abs(negative_area) != 2:
        raise ValueError("SVG signed areas/path failed")
    return [first, "s", "T=2v₀/g", "Raddoppia da 2 a 4 s",
            inverse_v.subs({g: 2, duration: 2}), inverse_g.subs({v0: 2, duration: 2}),
            T.subs({v0: 2, g: 4})/first, 4-first, "v₀=gT/2", "κ₁/κ₂", second/first,
            mean_outputs, inverse_g.subs({v0: 6, duration: sp.Rational(3, 2)*first})/2,
            sp.Rational(calibrated_v), affine_v, "Infinite"]


MANUAL = [
    "y=2t-t²=t(2-t) gives roots0,2s; future return2s, apex1s. Final component-2m/s; at4s y=-8m, not first return.",
    "(m/s)/(m/s²) leaves seconds; coefficient2 is pure, no square root required.",
    "For T>0 divide y=T(v0-gT/2)=0 byT, then solve gT=2v0. Same arrival/launch height and no drag are essential.",
    "Same g2: T1=2*2/2=2s, T2=2*4/2=4s. Duration doubles while maximum height would quadruple.",
    "v0=gT/2=2*2/2=2m/s; the ascent lasts only T/2=1s.",
    "g=2v0/T=4/2=2m/s². Full velocity change is-4m/s in2s, not-2m/s.",
    "Same v0=2: T1=2s, T2=4/4=1s; second/first=1/2, positive duration not descending component.",
    "Correct return2s, proposed4s; proposed-correct=+2s, distinct from a duration despite same number here.",
    "T=2v0/g implies v0=gT/2; gT doubles the answer, dividing by g gives wrong dimensions, negative branch violates launch domain.",
    "T2/T1=(k1*v0)/(k2*g) divided byv0/g=k1/k2, no square on initial speed for the time.",
    "T1=4/2=2s and T2=12/4=3s; ratio3/2, not3,2,2/3 or6.",
    "Equal output mean(2+3)/2=5/2s; mean inputs4m/s,3m/s² would instead give8/3s.",
    "Target T2=(3/2)*2=3s; g2=2*6/3=4m/s²; ratio g2/g1=4/2=2.",
    "Reference2s,count6 gives gain3s^-1;count9 gives3s; newv0=4*3/2=6m/s.",
    "References2,3s and counts5,7 give gain2s^-1,offset1;count9 gives4s; v0=2*4/2=4m/s.",
    "For everylambda>0 chooseg=lambda m/s² andv0=lambda m/s, satisfyingv0=(1s)g; T=2s always. Rank1 gives infinite positive pairs, zero excluded.",
]
UNITS = {1: "s", 2: "s", 3: "s", 4: "s", 5: "m/s", 6: "m/s**2", 7: "1", 8: "s", 9: "m/s", 10: "1",
         11: "1", 12: "s", 13: "1", 14: "m/s", 15: "m/s", 16: "1"}
OPTION_SUFFIX = {12: " s", 15: " m/s"}
NUMERIC_UNITS = {1: "s", 5: "m/s", 6: "m/s²", 8: "s", 13: "1", 14: "m/s"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent vertical-flight conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent trajectory/return-time result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-vertical-flight-{n:02}":
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
            "methods": ["independent_integrated_position_roots_and_future_return", "signed_velocity_integral_and_path",
                        "SymPy_exact_inverse_scaling_affine_and_rank", "Pint_exact_dimensions", "separate_AI_statement_option_asset_reading"],
            "physicalAssumptions": ("Positive upward initial velocity, constant positive assigned g inside each trial, no air, first future return to exactly the launch level; t=0 excluded and no apex/return confusion. "
                + ("Equal statistical weights of output durations, not input means. " if n == 12 else "")
                + ("Dimensionless display counts, positive constant gain s^-1, dimensionless offset only15. " if n in {14, 15} else "")
                + ("v0=(1s)g selects initial data across trials; T repeats this ratio and leaves infinite positive pairs. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent vertical trajectory roots, future return and signed velocity integrals",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI review only; no human approval, empirical student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"vertical-flight-027.json").read_text()),
                    json.loads((args.directory/"vertical-flight-027-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
