"""Independent exact right-triangle/slope oracle, written by the separate reviewer."""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u1-vector-angle-ratio-{n:02}" for n in range(1, 17)}
# Exact edition read after the author made the centimetre units explicit in the SVG.
REVIEWED_CANDIDATES = {
    "AR-u1-vector-angle-ratio-01": "ab692c2c1c30b2ee817f8fac8a514285f753d9a5456d6b4b2d17d9124351fb14",
    "AR-u1-vector-angle-ratio-02": "c2229efc3ecebbf6630de697c2cfd900910da52b51ea27ec867bca1849af30a3",
    "AR-u1-vector-angle-ratio-03": "5a61075a46cf092a95cda875d2365ffce29d9f8d278ca52ac3e3f41449e85bf0",
    "AR-u1-vector-angle-ratio-04": "e9f88eb6cc647c966e4dcc130a5344c95d17a8e3543a2c894b39e09deb05ee19",
    "AR-u1-vector-angle-ratio-05": "a9f62b7a5995f0253524401f43ed8bbe8b9535b236131b741993e72b035951df",
    "AR-u1-vector-angle-ratio-06": "ee65cbb8127bb4e26542a8c0e44d1d7afd149ea45c5bfdaa7a574cea169792f1",
    "AR-u1-vector-angle-ratio-07": "0cc67dc234cc8ea6c93795b7db42b38d9a16577d945bc6dc1e2a762a4794a7df",
    "AR-u1-vector-angle-ratio-08": "f33e69c806e2c14f5a8c9f8caa38302987f83fd8f144c41a8336cd8803ea7326",
    "AR-u1-vector-angle-ratio-09": "5efebd1b1d5a3266496c37b8e890eb3f29107aa6a87f4cc61c7527a29acc384b",
    "AR-u1-vector-angle-ratio-10": "03c15cd7245211ebefedbc4c688828e0068ece5fa73641d9f70906f65e30650d",
    "AR-u1-vector-angle-ratio-11": "e133a738998c82404cbd9ed37550b094acea374a6dd8afa81ebe2e511339a460",
    "AR-u1-vector-angle-ratio-12": "df0f28341e0f610e70e339f1dfb46cf744e9db0687edb8d0796ad21e12639a4f",
    "AR-u1-vector-angle-ratio-13": "6fc82635617f00aec940e343069e007f2eff2c7fa0c61c4d30cebf1840e224f2",
    "AR-u1-vector-angle-ratio-14": "3d84a52baf0c6154db063151336444bd1f0736a5cfaab7202d9b8a3d58cb2c07",
    "AR-u1-vector-angle-ratio-15": "8ddbb89cb255a8161b264f8d1e02bb36f6e73b0a4cae611ed3896c02a86c6de6",
    "AR-u1-vector-angle-ratio-16": "a47118364089fb0a6d92581f028e3a4d6527d028d67cd2109312e286d5645f94",
}


def slope(horizontal, vertical):
    """Derive tan(theta) as normalized y divided by normalized x."""
    vector = sp.Matrix([horizontal, vertical])
    radius = vector.norm()
    return sp.simplify((vector.dot(sp.Matrix([0, 1]))/radius) /
                       (vector.dot(sp.Matrix([1, 0]))/radius))


def oracle():
    a, b, T, k1, k2, lam = sp.symbols("a b T k1 k2 lam", positive=True)
    geometric = slope(a, b)
    inverse_a = sp.solve(sp.Eq(geometric, T), a)[0]
    inverse_b = sp.solve(sp.Eq(geometric, T), b)[0]
    scaling = sp.simplify(slope(k1*a, k2*b)/geometric)
    if (sp.simplify(inverse_a-b/T) != 0 or sp.simplify(inverse_b-T*a) != 0
            or sp.simplify(scaling-k2/k1) != 0):
        raise ValueError("Independent normalized-coordinate identities failed")
    first, second = slope(2, 2), slope(6, 4)
    adjacent = sp.sqrt(sp.Integer(5)**2-sp.Integer(3)**2)
    sine = (SI.Quantity(3, "centimeter")/SI.Quantity(5, "centimeter")).to("").magnitude
    cosine = (SI.Quantity(int(adjacent), "centimeter")/SI.Quantity(5, "centimeter")).to("").magnitude
    if sp.Rational(sine)**2+sp.Rational(cosine)**2 != 1:
        raise ValueError("Exact right-triangle identity failed")
    required_b = sp.solve(sp.Eq(slope(6, b), sp.Rational(2, 3)*first), b)[0]
    gain = SI.Quantity(3, "")/SI.Quantity(int(first), "")
    unknown_slope = SI.Quantity(2, "")/gain
    calibrated_a = (SI.Quantity(4, "meter")/unknown_slope).to("meter").magnitude
    g, offset = sp.symbols("g offset")
    calibration = sp.solve([sp.Eq(g*first+offset, 3), sp.Eq(g*second+offset, sp.Rational(7, 3))], (g, offset))
    recovered_slope = (2-calibration[offset])/calibration[g]
    offset_a = 2/recovered_slope
    # Two stated constraints have rank one: one positive length parameter is free.
    constraints = sp.Matrix([a-b, sp.together(geometric-1).as_numer_denom()[0]])
    if constraints.jacobian([a, b]).rank() != 1 or sp.simplify(geometric.subs({a: lam, b: lam})-1) != 0:
        raise ValueError("Free positive scale was incorrectly constrained")
    return [first, "1", (sp.Rational(sine), sp.Rational(cosine)), "Si dimezza da 1 a 1/2",
            inverse_a.subs({b: 2, T: 1}), inverse_b.subs({a: 2, T: 1}), slope(2, 4)/first,
            2-first, "a=b/T", "κ₂/κ₁", second/first, (first+second)/2,
            required_b/2, calibrated_a, offset_a, "Infinite coppie positive con a=b"]


MANUAL = [
    "2m/2m=1; theta45 degrees is not the requested tangent value",
    "metre/metre=1; angle in degrees is a different quantity from its tangent",
    "adjacent=sqrt(5²−3²)cm=4cm; sine3/5, cosine4/5; squares sum to1",
    "fixed b:2/2=1 then2/4=1/2, denominator doubles",
    "a=b/T=2m/1=2m; positive nonzero slope permits inversion",
    "b=T·a=1·2m=2m; general check T2,a2m gives b4m rather than1m",
    "(4/2)/(2/2)=2; tangent may exceed1 in the first quadrant",
    "proposed minus correct:2−1=+1, dimensionless",
    "solve T=b/a:Ta=b then a=b/T; dimensional length divided by pure number",
    "(κ₂b)/(κ₁a) divided by b/a=κ₂/κ₁; common scaling preserves direction",
    "initial tangent1, new4/6=2/3; ratio2/3",
    "(1+2/3)/2=5/6; ratio of mean components3m/4m=3/4 differs",
    "a₂=6m,T₂=2/3 implies b₂=4m; b₂/b₁=4/2=2",
    "gain3; display2 gives T2/3; a=4m/(2/3)=6m",
    "gain(7/3−3)/(2/3−1)=(−2/3)/(−1/3)=2; offset1; T1/2; a4m",
    "a=b=lambda>0 leaves tangent1 for every positive lambda; examples1m and2m have distinct moduli",
]
LENGTH_RESULTS = {5, 6, 9, 14, 15}


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent slope/conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if isinstance(wanted, tuple):
                    pair = tuple(sp.Rational(part) for part in raw.split(" e "))
                    if pair != wanted:
                        errors.append("Independent exact sine/cosine pair mismatch")
                else:
                    if n == 15:
                        if not raw.endswith(" m"):
                            raise ValueError("Length unit missing")
                        raw = raw.removesuffix(" m")
                    if sp.Rational(raw) != sp.Rational(wanted):
                        errors.append("Independent exact slope/calibration result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric or unit answer")
        unit = "meter" if n in LENGTH_RESULTS else "dimensionless"
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != ("m" if n in LENGTH_RESULTS else "1"):
            errors.append("Numeric answer has wrong physical unit")
        provenance = binding.get("provenance")
        if provenance is not None and (digest(provenance) != binding.get("provenanceSha256")
                or provenance.get("sourceId") != binding["sourceId"] or provenance.get("sourceRef") != binding["sourceRef"]):
            errors.append("Author provenance envelope changed or inconsistent")
        expected_text = " e ".join(map(str, wanted)) if isinstance(wanted, tuple) else str(wanted)
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": expected_text, "dimension": {k: str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_normalized_Cartesian_components", "exact_Pythagoras_and_SI_ratio",
                        "symbolic_inverses_linear_calibration_and_constraint_rank", "separate_AI_statement_and_distractor_reading"],
            "physicalAssumptions": "Positive first-quadrant components; theta measured from+x; same units for component ratios; exact3-4-5 triangle only03; constant calibration only14/15; no length datum in16",
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Normalized Cartesian components, exact right triangle and independent positive-scale parameter",
                   "reference": "Independently derived from the sixteen read statements; no human approval"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"vector-angle-ratio-009.json").read_text()),
                    json.loads((args.directory/"vector-angle-ratio-009-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
