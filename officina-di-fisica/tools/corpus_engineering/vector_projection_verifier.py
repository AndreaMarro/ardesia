"""Independent exact Cartesian-projection review; separate reviewer, no authoring imports."""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u1-vector-projection-{n:02}" for n in range(1, 17)}
# Frozen only after individual reading of statements, all options, source bindings and SVG.
REVIEWED_CANDIDATES = {
    "AR-u1-vector-projection-01": "90466f127c6e2cb9f23de818542a63a26e1f9d84c41d9dec5f590bef5d95b4a0",
    "AR-u1-vector-projection-02": "a267f33a7918122549bfadaa6624cb7c9c1eb96d4af7c8d71c9046176acb490b",
    "AR-u1-vector-projection-03": "eb8cd67196ea5f7c496d29e8b7f109f9ed90521d1a86c2b896e3217741424e93",
    "AR-u1-vector-projection-04": "2315fae582deb24a7e954a6bc86ce3a61c636fb8023acb3c0bbf5995c1d52b7a",
    "AR-u1-vector-projection-05": "8db060fab903eacab9c1d259bf231f37c75edf70a41ab96facf43fe382c7f3cb",
    "AR-u1-vector-projection-06": "87ec5add7f67395a174a865f23798978db4298bda54b50e737f0106eef71d2b7",
    "AR-u1-vector-projection-07": "1c457c6b004ed3a0799f5bc84023ecbb64e3bbb793b4dd29ac756a38d6cd49c4",
    "AR-u1-vector-projection-08": "693c924079484bfbee59aced5a094b210b2013286ae0341780642ac0c62ac6d9",
    "AR-u1-vector-projection-09": "bedac840576dacd12222876080f96d6e1c46020ec2a46b718f9d1110a79e37d7",
    "AR-u1-vector-projection-10": "3e645e26af4efe29d34d918ca08b6240095aed4999ea3115eae1de4958967ef2",
    "AR-u1-vector-projection-11": "cfbabe60ad1fb18c50e47fdbf1a97f509ab6e8f07a7a5e3bd91cfda254e32368",
    "AR-u1-vector-projection-12": "7979ce83c8cad08df6075f233321429ebd6d0e335628c46c78589dde234c9d30",
    "AR-u1-vector-projection-13": "877a55da007b017394138489cd4998ae51c3d1181e480cdff5df9ddd94dfa5d8",
    "AR-u1-vector-projection-14": "44ed4d161736e3b46bbcb1276a99f960126a07144a45fc648ba75a0345ebac05",
    "AR-u1-vector-projection-15": "275596ea86ecd31f1b2c4c2e52f637eabdebe8a05c13ec597da2063785cc3510",
    "AR-u1-vector-projection-16": "61ce9fe9482036c272510aa6cb4001c80e7b58328dd77d6761d9f23c142e0134",
}


def component(radius, angle):
    vector = sp.Matrix([radius*sp.cos(angle), radius*sp.sin(angle), 0])
    return sp.simplify(vector.dot(sp.Matrix([1, 0, 0])))


def oracle():
    R, c, P, k1, k2 = sp.symbols("R c P k1 k2", positive=True)
    # Projection is a dot product with the fixed positive-axis unit vector.
    algebraic = sp.Matrix([R*c, R*sp.sqrt(1-c*c), 0]).dot(sp.Matrix([1, 0, 0]))
    inverse = sp.solve(sp.Eq(algebraic, P), R)[0]
    factor = sp.simplify(algebraic.subs({R: k1*R, c: k2*c}, simultaneous=True)/algebraic)
    if sp.simplify(inverse-P/c) != 0 or sp.simplify(factor-k1*k2) != 0:
        raise ValueError("Independent projection identities failed")
    first = component(4, sp.pi/3)
    negative = component(10, 2*sp.pi/3)
    second_cosine = sp.Matrix([3, sp.sqrt(7), 0]).dot(sp.Matrix([1, 0, 0]))/4
    second = 8*second_cosine
    required_cosine = sp.solve(sp.Eq(8*c, 3*first), c)[0]
    if not (0 < required_cosine < 1):
        raise ValueError("Requested acute-angle compensation is impossible")
    gain, offset = sp.symbols("gain offset")
    calibrated = sp.solve([sp.Eq(gain*first+offset, 5), sp.Eq(gain*second+offset, 13)], (gain, offset))
    unknown_component = (9-calibrated[offset])/calibrated[gain]
    dimensional_gain = SI.Quantity(6, "")/SI.Quantity(int(first), "meter")
    component_from_display = (SI.Quantity(18, "")/dimensional_gain).to("meter").magnitude
    constrained = sp.solve(sp.Eq(8*c*c, 2), c)[0]
    if not (0 < constrained < 1):
        raise ValueError("Constrained cosine outside the acute domain")
    return [first, "m", negative, "Raddoppia da 2 m a 4 m", inverse.subs({P: 2, c: sp.Rational(1, 2)}),
            first/4, (4*second_cosine)/first, 4-first, "R=P/c", "κ₁κ₂", second/first,
            (first+second)/2, required_cosine/sp.Rational(1, 2),
            component_from_display/Fraction(3, 4), unknown_component/sp.Rational(1, 2), constrained]


MANUAL = [
    "dot product with +x: 4·cos60°=4/2=2m",
    "metre times dimensionless cosine remains metre",
    "10·cos120°=10·(−1/2)=−5m; magnitude remains10m",
    "same angle: (8/2)/(4/2)=4/2=2, not4",
    "R=2m/(1/2)=4m; R must be at least |P|",
    "c=2m/4m=1/2, dimensionless and between0 and1",
    "P₂=4·3/4=3m, P₁=2m; ratio3/2",
    "proposed minus correct:4m−2m=+2m",
    "solve dot-product identity P=Rc for R: P/c with nonzero c",
    "substitute R₂=κ₁R,c₂=κ₂c: ratioκ₁κ₂; independently require0<κ₂c<1",
    "P₁=2m,P₂=6m;6/2=3",
    "(2m+6m)/2=4m; mean inputs give6m·5/8=15/4m instead",
    "3/2 cosine ratio gives c₂=3/4, physically admissible; factor3 would give3/2 and fail",
    "gain6/(2m)=3m⁻¹;18/gain=6m;6m/(3/4)=8m",
    "gain8/(4m)=2m⁻¹, offset1; (9−1)/gain=4m;4m/(1/2)=8m",
    "R=(8m)c yields2m=(8m)c²; c²=1/4 and0<c<1 selects1/2",
]
DIMENSIONLESS = {6, 7, 10, 11, 13, 16}
LENGTH_OPTIONS = {3, 12, 15}


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent projection conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in LENGTH_OPTIONS:
                    if not raw.endswith(" m"):
                        raise ValueError("Length unit missing")
                    raw = raw.removesuffix(" m")
                if sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent oriented-component/SI result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or unit answer")
        unit = "dimensionless" if n in DIMENSIONLESS else "meter"
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != ("1" if n in DIMENSIONLESS else "m"):
            errors.append("Numeric projection answer has wrong physical unit")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != binding["sourceRef"]):
            errors.append("Author provenance envelope changed or inconsistent")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {k: str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_Cartesian_axis_dot_product", "exact_cosines_and_symbolic_inverse",
                        "Pint_inverse_length_gain_and_exact_linear_system", "separate_AI_statement_options_and_scale_review"],
            "physicalAssumptions": "Fixed +x axis; oriented projection; positive displacement modulus; acute cosine domain except120-degree ID03; constant calibration only14/15; explicit8m coefficient in16",
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Cartesian projection as dot product, exact cosine identities and dimensional calibration",
                   "reference": "Independently derived from the sixteen read statements; not human approval"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"vector-projection-008.json").read_text()),
                    json.loads((args.directory/"vector-projection-008-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
