"""Separate-reviewer exact integrated-trajectory oracle for sixteen vertical launches.

No authoring imports or publication authority. Signatures bind separately read
statements/options/solutions, pinned source identities and scientific asset bytes.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u2-vertical-maximum-{n:02}" for n in range(1, 17)}
SOURCE_REF = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json"
SOURCE_FILE_SHA256 = "542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f"
REVIEWED_CANDIDATES = {
    "AR-u2-vertical-maximum-01": "2cde5f9c03f8db27afcde626c09bae434942f3dd83f637fda530c7039150077f",
    "AR-u2-vertical-maximum-02": "f034c54907ded8c19c05d933b7331df93919a8d90c71ae63c2441ba6ffe19a9b",
    "AR-u2-vertical-maximum-03": "57cd899882dbf45aeec9d49a367073c8450e692c6963a1d5a3036c3bce27b980",
    "AR-u2-vertical-maximum-04": "186bfa040d8c677caaba74a2e5906180f20f868f9cc065097774782664c1b358",
    "AR-u2-vertical-maximum-05": "44fda29ff392079880aaedfb0232296b241fb6b6a866520efc8ee2aad8bd835d",
    "AR-u2-vertical-maximum-06": "d991b81e6e1a1fbec652434a1de774e76d7a595dcdb5aba9d30668a8b6f8378f",
    "AR-u2-vertical-maximum-07": "29825734d0d053a5652efb89eb42259fbe104ad789999761989248960c5eed21",
    "AR-u2-vertical-maximum-08": "00b55998582458f080ba59ab84eb601048b6ce9091912f4f16e9f32c5254b8f2",
    "AR-u2-vertical-maximum-09": "43fbef1c4ca87c48659581f9e37b72409d71b0f0ef30038bc6d3b18debb95ae7",
    "AR-u2-vertical-maximum-10": "572677e0e1202433c5b6686f011fa0d40ad3c6d17ff816fefa2f62f304a973c0",
    "AR-u2-vertical-maximum-11": "2d17a88188a7df1e2f252fd9ea2aaf64fe908ebdb7015d856de141f2eedba40c",
    "AR-u2-vertical-maximum-12": "d58e09d23b602680efa9ab8437e2f4b27e97b54ec2dcee8b0acbdc14c91fed04",
    "AR-u2-vertical-maximum-13": "64be17fd1ce6a7c71b43d12969e6b6164a0e671a55b0b27a29714333940860b1",
    "AR-u2-vertical-maximum-14": "4ccddb6897a6314ab37bd5967f094a0aacf2c9d5654004ec8871509d30562659",
    "AR-u2-vertical-maximum-15": "65637ef2157789465370438b85d978cb67e1bf2c285da224dd529e8464ed5656",
    "AR-u2-vertical-maximum-16": "524c990a27de6348d0284e8ce8971b8ff748e42a2748adbcdfb9ba0656f36c88",
}


def oracle():
    tau = sp.Symbol("tau", real=True)
    v0, g, target, coefficient = sp.symbols("v0 g target coefficient", positive=True)
    velocity = v0+sp.integrate(-g, (tau, 0, tau))
    gain = sp.integrate(velocity, (tau, 0, tau))
    apex_time = sp.solve(sp.Eq(velocity, 0), tau)[0]
    maximum = sp.simplify(gain.subs(tau, apex_time))
    if (apex_time != v0/g or sp.simplify(maximum-v0**2/(2*g)) != 0
            or sp.diff(gain, tau, 2).subs(tau, apex_time) != -g):
        raise ValueError("Independent apex, maximum or nonzero acceleration derivation failed")
    energy_benchmark = sp.Rational(1, 2)*v0**2/g
    if sp.simplify(maximum-energy_benchmark) != 0:
        raise ValueError("Independent energy benchmark failed")
    inverse_v = sp.solve(sp.Eq(maximum, target), v0)[0]
    inverse_g = sp.solve(sp.Eq(maximum, target), g)[0]
    k1, k2 = sp.symbols("k1 k2", positive=True)
    scaling = sp.simplify(maximum.subs({v0: k1*v0, g: k2*g}, simultaneous=True)/maximum)
    if sp.simplify(scaling-k1**2/k2) != 0:
        raise ValueError("Quadratic initial-speed scaling failed")
    first, second = maximum.subs({v0: 2, g: 2}), maximum.subs({v0: 4, g: 4})
    mean_output = (first+second)/2
    mean_input_output = maximum.subs({v0: 3, g: 3})
    if first != 1 or second != 2 or mean_output != sp.Rational(3, 2) or mean_input_output != mean_output:
        raise ValueError("Proportional-input mean check failed")
    # A nonproportional pair shows that averaging does not generally commute.
    if (maximum.subs({v0: 2, g: 2})+maximum.subs({v0: 4, g: 2}))/2 == maximum.subs({v0: 3, g: 2}):
        raise ValueError("Nonlinear mean counterexample failed")
    Q = SI.Quantity
    display_gain = Q(3, "")/Q(int(first), "m")
    calibrated_height = (Q(6, "")/display_gain).to("m").magnitude
    calibrated_v2 = (2*Q(4, "m/s**2")*Q(calibrated_height, "m")).to("m**2/s**2").magnitude
    c, d = sp.symbols("c d", real=True)
    calibration = sp.solve([sp.Eq(c*first+d, 3), sp.Eq(c*second+d, 5)], (c, d))
    affine_height = (9-calibration[d])/calibration[c]
    affine_v = inverse_v.subs({target: affine_height, g: 2})
    constrained_maximum = sp.simplify(maximum.subs(v0, coefficient*g))
    constrained_g = sp.solve(sp.Eq(constrained_maximum, target), g)[0]
    constraint_units = (2*Q(1, "m")/Q(1, "s")**2).to("m/s**2").magnitude
    if constrained_g != 2*target/coefficient**2 or constrained_g.subs({target: 1, coefficient: 1}) != sp.Rational(constraint_units):
        raise ValueError("Dimensional across-trial constraint failed")
    si_height = (Q(2, "m/s")**2/(2*Q(2, "m/s**2"))).to("m").magnitude
    if sp.Rational(si_height) != first or calibration != {c: 2, d: 1} or affine_height != 4:
        raise ValueError("Pint dimensions or affine calibration failed")
    # Exact graphic mappings: velocity triangle and the quadratic height Bezier.
    u = sp.Symbol("u", real=True)
    px = (1-u)**2*100+2*(1-u)*u*180+u**2*260
    py = (1-u)**2*1210+2*(1-u)*u*1050+u**2*1050
    mapped_t, mapped_height = (px-100)/160, (1210-py)/160
    if sp.simplify(mapped_height-(2*mapped_t-mapped_t**2)) != 0 or sp.diff(mapped_height, u).subs(u, 1) != 0:
        raise ValueError("SVG height curve or horizontal apex tangent failed")
    triangle_height = (sp.Rational(1, 2)*160*160)/(160*80)
    if triangle_height != first or apex_time.subs({v0: 2, g: 2}) != 1 or apex_time.subs({v0: 4, g: 4}) != 1:
        raise ValueError("SVG velocity area or equal apex times failed")
    return [first, "m", "H=v₀²/(2g)", "Quadruplica da 1 m a 4 m",
            inverse_v.subs({g: 2, target: 1}), inverse_g.subs({v0: 2, target: 1}),
            maximum.subs({v0: 2, g: 4})/first, 2-first, "v₀=√(2gH)", "κ₁²/κ₂",
            second/first, mean_output, inverse_g.subs({v0: 4, target: 2*first})/2,
            sp.sqrt(sp.Rational(calibrated_v2)), affine_v, constrained_g.subs({target: 1, coefficient: 1})]


MANUAL = [
    "u=2-2t m/s vanishes at1s; positive triangular area(1/2)*2m/s*1s=1m. At apexu0 but acceleration-2m/s2.",
    "(m/s)² divided bym/s² leavesm; H is gain from launch coordinate, not absolute altitude.",
    "Integrateu=v0-gt to apexT=v0/g: H=v0*T-g*T²/2=v0²/(2g). Equivalent zero-velocity relation0=v0²-2gH.",
    "Sameg2: firstH4/4=1m, second16/4=4m; speedfactor2 gives heightfactor4. Apex time and ascent mean velocity each double.",
    "v0²=2*2*1=4m2/s2, positive square root2m/s; negative component would launch downward and not reach a future higher apex.",
    "g=2²/(2*1)=2m/s2; remains nonzero at apex despite instantaneous velocity0.",
    "H1=4/(2*2)=1m, H2=4/(2*4)=1/2m; ratio1/2. Field appears once in denominator.",
    "CorrectH1m; proposed2m minus1m=+1m. Proposedrectangle2m/s*1s double-counts triangular area.",
    "Multiply2g:H givesv0²=2gH; positive branchv0=sqrt(2gH). sqrt(2H/g) is ascent time, not initial speed.",
    "(k1*v0)²/(2*k2*g) divided byv0²/(2g) leavesk1²/k2; positivity and constant field inside each trial.",
    "FirstH1m,T1s;secondH16/8=2m,T1s;ratio2. Same duration with double ascent mean velocity yields double gain.",
    "Mean(1+2)/2=3/2m. Meaninputs3m/s,3m/s2 also give9/6=3/2 only on this proportional family. With(2,2),(4,2), outputmean5/2 differs frommean-input9/4.",
    "Targetheightfactor2 withspeedfactor2:2=4/(g2/g1), hencefieldratio2;g2=4m/s2 andH2=2m.",
    "ReferenceH1m andcount3 givegain3m^-1;count6 givesH2m;v0²=2*4*2=16m2/s2, v0=4m/s.",
    "ReferenceH1,2m andcounts3,5:gain2m^-1,offset1;H=(9-1)/2=4m;v0=sqrt(2*2*4)=4m/s.",
    "v0=(1s)g selects trial initial data; H=(1s)²g/2. H1m givesg2m/s2,v0=2m/s andT1s. Field fixed within trajectory.",
]
UNITS = {1: "m", 2: "m", 3: "m", 4: "m", 5: "m/s", 6: "m/s**2", 7: "1", 8: "m",
         9: "m/s", 10: "1", 11: "1", 12: "m", 13: "1", 14: "m/s", 15: "m/s", 16: "m/s**2"}
OPTION_SUFFIX = {8: " m", 12: " m", 15: " m/s", 16: " m/s²"}
NUMERIC_UNITS = {1: "m", 5: "m/s", 6: "m/s²", 11: "1", 13: "1", 14: "m/s"}


def verify(package, bindings, asset_root=None):
    asset_root = Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent vertical-launch conceptual relation/key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Physical unit missing from option")
                    raw = raw.removesuffix(suffix)
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent trajectory/exact-height result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or physical-unit answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Numeric answer has wrong physical unit")
        if binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != f"u2-vertical-maximum-{n:02}":
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
            "methods": ["independent_acceleration_velocity_and_position_integration", "apex_derivative_and_energy_benchmark",
                        "SymPy_exact_inverse_scaling_affine_calibration", "Pint_exact_dimensions",
                        "separate_AI_all_statements_options_and_SVG_review"],
            "physicalAssumptions": ("Initial velocity upward and positive; assigned uniform positive field constant inside each trial; no air; H is gain relative to launch point. At apex velocity zero but acceleration remains-g; no equilibrium inferred. "
                + ("Equal statistical weights of output gains, not a general commutation of means with the quadratic law. " if n == 12 else "")
                + ("Dimensionless display counts, positive constant gain m^-1, offset dimensionless only15. " if n in {14, 15} else "")
                + ("v0=(1s)g selects initial data across trials, not field variation during ascent; positive domain. " if n == 16 else "")),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Independent apex from integrated velocity, triangular area and exact height gain",
                   "reference": SOURCE_REF+":"+SOURCE_PATH, "sourceFileSha256": SOURCE_FILE_SHA256,
                   "limitations": "AI mathematical/scientific reading, no human approval, student calibration or publication"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"vertical-maximum-023.json").read_text()),
                    json.loads((args.directory/"vertical-maximum-023-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
