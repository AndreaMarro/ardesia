"""Independent exact review of sixteen cross-product statements.

Written by the separate reviewer agent after reading each candidate and option.
No authoring imports, stored source formulas, or stored source answer residuals.
The frozen edition includes the corrected, proportionate two-example figure.
AI review only: no human approval or publication authority.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI = pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS = {f"AR-u1-vector-product-{n:02}" for n in range(1, 17)}
# Reviewed after the author corrected figure scales and the four-stage caption.
# Updating a generated binding does not update these independent signatures.
REVIEWED_CANDIDATES = {
    "AR-u1-vector-product-01": "83adca2a942c4208b6e9c27ecaba8ea5a802f6ed38db1b05c611c9f26d387681",
    "AR-u1-vector-product-02": "37f121967442516c665dc7defed7e9aacc4b4c2b708c5ceab0c8043caa767dab",
    "AR-u1-vector-product-03": "c26439a418fb2571829b4bbf2274b73baf2ce504ca42781c16ddf67613865563",
    "AR-u1-vector-product-04": "cf74b913403c39428625c7484cbe1b797da1904e25791849280697c7dff0dbb1",
    "AR-u1-vector-product-05": "e6a4d44b0b4c654913ced36513a587df503d50629af4c00d5edf7510b5aa8140",
    "AR-u1-vector-product-06": "92e191184cbb1aa363a1bdad721155455c01c4a911b50d1340138f9bb4f7f3e9",
    "AR-u1-vector-product-07": "bb4c2f7f9192614cc77c131b3e1b06c2b12ef17737754120ab0a1e6cd7e71cc6",
    "AR-u1-vector-product-08": "d327cd01bc5ce83defcd36957315c677ba67ef1618c49cad92211b391cbcf5bc",
    "AR-u1-vector-product-09": "13b1a7e44d7bbcb40534023b976223f6f1b1aa3d95066fe3e5bf6df85e72665e",
    "AR-u1-vector-product-10": "ac8e315d1dc58db549c4d6aaab2ffc877b4ee514cbac0682e5a62266ab12e92c",
    "AR-u1-vector-product-11": "a6ae21f40ee07bf3bcc061eda9bf9790ebad46f5787c47aa65a3097db3dd2d68",
    "AR-u1-vector-product-12": "fdc82f3637e0c249ca1079aa8e4d03b065086677d9aee047282a61929e206b00",
    "AR-u1-vector-product-13": "b53eccee25e11c17defa0c359d1679babf2e891ea2b54a5e80e53f6d6eca951b",
    "AR-u1-vector-product-14": "82db08a670046cba69548a79941cd69dc035fd55e7249b54ec5d5670346eb137",
    "AR-u1-vector-product-15": "5267c3d3cd2645eeab601eaf2d3808c4392540b3bdb60c732d1e1a35dd07256d",
    "AR-u1-vector-product-16": "a52529cefece1d3ed6762fd44d520bf001ffd70a367f9e7d6bdc6b30971fce6a",
}


def cross(left, right):
    """Cartesian determinant in a right-handed basis, including orientation."""
    return sp.Matrix(left).cross(sp.Matrix(right))


def perpendicular_magnitude(first, second):
    return sp.simplify(cross((first, 0, 0), (0, second, 0)).norm())


def oracle():
    a, b, C, k1, k2 = sp.symbols("a b C k1 k2", positive=True)
    geometric = perpendicular_magnitude(a, b)
    if sp.simplify(geometric - a*b) != 0:
        raise ValueError("Independent determinant/norm identity failed")
    inverse = sp.solve(sp.Eq(geometric, C), a)[0]
    scaling = sp.simplify(perpendicular_magnitude(k1*a, k2*b) / geometric)
    if sp.simplify(inverse - C/b) != 0 or sp.simplify(scaling - k1*k2) != 0:
        raise ValueError("Independent symbolic inverse/scaling failed")
    small = perpendicular_magnitude(2, 2)
    large = perpendicular_magnitude(4, 4)
    oriented = cross((0, 3, 0), (2, 0, 0))[2]
    if oriented != -6 or cross((2, 0, 0), (0, 3, 0))[2] != 6:
        raise ValueError("Right-handed anticommutativity failed")
    gain, offset = sp.symbols("gain offset")
    calibration = sp.solve(
        [sp.Eq(gain*small + offset, 9), sp.Eq(gain*large + offset, 33)],
        (gain, offset),
    )
    unknown_product = (17-calibration[offset]) / calibration[gain]
    new_b = sp.solve(sp.Eq(perpendicular_magnitude(4, b), 4*small), b)[0]
    # All input vectors and display counts in these statements are dimensionless.
    reference = SI.Quantity(int(small), "dimensionless")
    pure_gain = SI.Quantity(12, "dimensionless") / reference
    calibrated_product = (SI.Quantity(48, "dimensionless") / pure_gain).to("").magnitude
    equal_b = sp.solve(sp.Eq(perpendicular_magnitude(b, b), 4), b)[0]
    return [
        small, "1", "C=ab", "Raddoppia da 4 a 8", inverse.subs({C: 4, b: 2}),
        oriented, perpendicular_magnitude(2, 4)/small, 8-small, "a=C/b", "κ₁κ₂",
        large/small, (small+large)/2, new_b/2, calibrated_product/4,
        unknown_product/2, equal_b,
    ]


MANUAL = [
    "2 righe per 2 colonne: 2·2=4; prodotto scalare perpendicolare invece zero",
    "[A][B]=1·1=1; geometria del parallelogramma non assegna metri quadrati",
    "determinante con A=(a,0,0), B=(0,b,0): componente z=ab; norma ab per a,b>0",
    "prima 2·2=4; poi 4·2=8; 8/4=2, secondo fattore e angolo invariati",
    "a=4/2=2; la sottrazione 4−2 coincide qui per caso, non è l'inversa generale",
    "(B×A)z=Bx·Ay−By·Ax=0−3·2=−6; norma 6, componente negativa",
    "(2·4)/(2·2)=8/4=2, non il nuovo valore 8",
    "proposto meno corretto: 8−(2·2)=+4; non è il verso del vettore",
    "ab=C, b>0: a=C/b; ricomposizione (C/b)b=C",
    "(κ₁a)(κ₂b)/(ab)=κ₁κ₂; fattori uno lasciano rapporto uno",
    "(4·4)/(2·2)=16/4=4, due raddoppi indipendenti",
    "(4+16)/2=2+8=10; prodotto delle medie 3·3=9, operazione diversa",
    "C₁=4, C₂=16, a₂=4: b₂=4 e b₂/b₁=4/2=2",
    "guadagno 12/4=3; C=48/3=16; a=16/4=4, tutti numeri puri",
    "guadagno (33−9)/(16−4)=2; offset 1; C=(17−1)/2=8; a=8/2=4",
    "a=b>0: b²=4, quindi b=2; −2 non è un modulo positivo",
]


def verify(package, bindings, asset_root=None):
    asset_root = asset_root or Path(__file__).resolve().parents[2] / "editorial/assets"
    answers = oracle()
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(
        package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root
    ):
        n = int(row["id"].rsplit("-", 1)[1])
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent conceptual/symbolic key mismatch")
        else:
            try:
                if sp.Rational(str(value).replace("−", "-")) != sp.Rational(wanted):
                    errors.append("Independent determinant/norm/calibration result mismatch")
            except (TypeError, ValueError):
                errors.append("Invalid exact numeric answer")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != "1":
            errors.append("Dimensionless answer must retain unit one")
        provenance = binding.get("provenance")
        if provenance is not None:
            if (digest(provenance) != binding.get("provenanceSha256")
                    or provenance.get("sourceId") != binding["sourceId"]
                    or provenance.get("sourceRef") != binding["sourceRef"]):
                errors.append("Author provenance envelope changed or inconsistent")
        results.append({
            "id": row["id"], "sourceSha256": binding["sourceSha256"],
            "candidateSha256": digest(row), "reviewedSignature": signature,
            "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted),
            "dimension": {k: str(v) for k, v in SI.Unit("dimensionless").dimensionality.items()},
            "manualArithmetic": MANUAL[n-1],
            "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_right_handed_3D_determinant_and_norm",
                        "exact_symbolic_inverse_scaling_and_calibration",
                        "Pint_dimensionless_display_conversion",
                        "separate_AI_reading_of_statement_options_and_corrected_figure"],
            "physicalAssumptions": (
                "Right-handed Cartesian frame: +x right, +y up, +z out; requested B cross A z component, not magnitude"
                if n == 6 else
                "Dimensionless nonzero vectors; perpendicular in all compared trials; positive norms; equal statistical weights only in12; constant gains/offsets only in14/15"
            ),
            "humanApproval": "NOT_RUN", "publication": "DRAFT",
        })
    return results


def report(package, bindings, asset_root=None):
    return {
        "schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()),
        "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN",
        "source": {"title": "Right-handed Cartesian determinant, Euclidean norm and exact calibration equations",
                   "reference": "Independently derived from the sixteen individually read statements; no human approval"},
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(
        json.loads((args.directory / "vector-product-007.json").read_text()),
        json.loads((args.directory / "vector-product-007-bindings.json").read_text()),
        args.asset_root,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result) + "\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
