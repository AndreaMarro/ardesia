"""Independent SI/counting oracle for 32 individually read conversion tasks.

No authoring import and no use of source formula, source answer or stored residual.
The selected symbolic labels and conceptual judgments were reviewed by AI, not a human.
"""
from fractions import Fraction
import itertools
from pathlib import Path
import json
import base64

import pint
import sympy as sp

from .pipeline import digest, sha, canonical

SI = pint.UnitRegistry(non_int_type=Fraction)

# Frozen by the independent AI review of this exact 32-ID editorial edition.
# Rebinding assembly outputs cannot renew this review. Changes require rereading
# the affected task/figure, counterexamples, and an explicit new reviewed signature.
REVIEWED_CANDIDATES = {
    "AR-u1-area-conversion-01": "a9f97b9f05bc9d612187f92dfdb61fc251d21fc3f8d55c0482ffcd0e2defe6ce",
    "AR-u1-area-conversion-02": "082d74c25e347ea940d99b731db452a0668c00d1e5c5e0c775afe46403e95f8b",
    "AR-u1-area-conversion-03": "76096889256a8ecb57b59ec1656be31a40e8fd9e62f3d80f5eb6e333b0be0dd0",
    "AR-u1-area-conversion-04": "f4e7571e1e095daec0b54919dea901f53cbb6f58f44860a000d3abbd0ec69e13",
    "AR-u1-area-conversion-05": "6239dea2ac5b7c013b3a9640548c49468248a265e7e31247356309315f20f47e",
    "AR-u1-area-conversion-06": "07523647b22a8e1b44116329bb88af7377cf1dc2f4bf95d652690d49249c0b37",
    "AR-u1-area-conversion-07": "36078d2312cd8f4010385be111af985c8cca90d9132bf9ea6e66c56db23cc0f7",
    "AR-u1-area-conversion-08": "c5c63d053ee098739f2933a5cf83f36d7c15a3cee041d63d3a7b12c36c739ad4",
    "AR-u1-area-conversion-09": "b8ae4694f0af3752c5bc7798aef556efa50a177ee6a005383ad70ffbafddb5c8",
    "AR-u1-area-conversion-10": "7c5be2d1483872e7d2e509721614a30e955c70bfcf511f8201e89a0ebaa4bd49",
    "AR-u1-area-conversion-11": "0a90d6cb778773b2696bd9a45dc47f454ec18466ab09fd1dc8a0e69fa6ac4781",
    "AR-u1-area-conversion-12": "2d479dede5642465a237fbcd47136ad2090cdf759b1f709a4495abec975737c9",
    "AR-u1-area-conversion-13": "d1d35b0d5591ac4aa459de527b2e124b265ddf95c490ab375290d7ac7aaa6084",
    "AR-u1-area-conversion-14": "ba350b23dc03938122f02c1a084b8d1ef3e2b61171fe250b661875899104b675",
    "AR-u1-area-conversion-15": "7178eee598131e77430bb0d7be83bd3768343f5b588fa46be0380357aa874708",
    "AR-u1-area-conversion-16": "4008d6968901dd661047441e3c9bf80c7d00d29911000c740a00b01a6681a7dd",
    "AR-u1-volume-conversion-01": "5ca92fa196517ef47d1a93711e2fcecb64a8a1808880d7c73d2a871d2f1ed055",
    "AR-u1-volume-conversion-02": "c95d5c991920a7f7d15b5e545a6ba03a265a1d1037edf71ab4724ab040810c4f",
    "AR-u1-volume-conversion-03": "ebf7115dbdd1910ad46c12379511c03285b5b1c6a961807700127251c85a6183",
    "AR-u1-volume-conversion-04": "e8dabb16bb41ca46a0c5e05440f767d5dfb89d94e9d1699533f79f9f3848ebfc",
    "AR-u1-volume-conversion-05": "b32f384dc32bdb9de4e67836e0dacfa8952cce4214b553b7d46189ab341eb675",
    "AR-u1-volume-conversion-06": "7ec03a1d56b9296069eca0fd52c362c221fe90f06b868208924b541c8288ab89",
    "AR-u1-volume-conversion-07": "2c162801361cc623f7d22cb6276f153a5feb93c2e6c63e0c44a2f2fe5e69ac38",
    "AR-u1-volume-conversion-08": "44d651aefe2f0c21325241046f0805690e41ebf5ef616f2e20c5661e123679a7",
    "AR-u1-volume-conversion-09": "7c3a88dee51280dca42f8feb44862368696754f825311d613295b2596487d11a",
    "AR-u1-volume-conversion-10": "4d9af44b579068a6e6e04b1af76090cc508371ea99b746f28f0d020c7be61f35",
    "AR-u1-volume-conversion-11": "4979f8f78e8417656b1621650d9055d943601aa2914f4c400b43c8532d40e04a",
    "AR-u1-volume-conversion-12": "abe6c3bc9841bbbd08ab9a9b8bd78ee0a6124a2ceaf316c9cff110050cb39661",
    "AR-u1-volume-conversion-13": "cc217b001e9310b8de99e9e48217945955bcb7e9926b2ccf6526e4f0a8dbeb74",
    "AR-u1-volume-conversion-14": "a8d8e1fc421018da67ecd61795df1b38c8968d06ec281aadca64129be4e758ee",
    "AR-u1-volume-conversion-15": "54a1790ca619fe84bf72076ee8a2043a0a966dee307f48a3326ad5965d30fc03",
    "AR-u1-volume-conversion-16": "755f0fa5647b0809de514eca14bca111b0e84c88545da90a646a885f11b4f09d"
}


def count_units(old_cells, subdivisions, dimension):
    # Enumerate cells in separate directions; do not reuse the authored power law.
    return sum(1 for _ in range(old_cells) for _cell in itertools.product(range(subdivisions), repeat=dimension))


def expected():
    a0, a1 = count_units(2, 2, 2), count_units(4, 4, 2)
    v0, v1 = count_units(2, 2, 3), count_units(4, 4, 3)
    concentration = (SI.Quantity(6, "gram") / SI.Quantity(2, "centimeter**3")).to("kg/m**3").magnitude
    capacity = SI.Quantity(Fraction(3, 4), "decimeter**3").to("milliliter").magnitude
    # Solve the two calibration systems independently as simultaneous equations.
    gain, offset = sp.symbols("gain offset")
    area_cal = sp.solve([sp.Eq(gain*a0+offset,17), sp.Eq(gain*a1+offset,129)], (gain,offset))
    volume_cal = sp.solve([sp.Eq(gain*v0+offset,33), sp.Eq(gain*v1+offset,513)], (gain,offset))
    return {
        "area": [a0, "1", "B=A c²", "Raddoppia", sp.Rational(8,count_units(1,2,2)), sp.sqrt(sp.Rational(8,2)),
                 sp.Rational(count_units(1,4,2),count_units(1,2,2)), concentration, "A=B/c²", "κ₁κ₂²",
                 sp.Rational(a1,a0), sp.Rational(a0+a1,2), sp.sqrt(sp.Rational(8,2)),
                 sp.Rational(192,sp.Rational(24,a0))/count_units(1,4,2),
                 ((33-area_cal[offset])/area_cal[gain])/count_units(1,2,2), sp.real_root(8,3)],
        "volume": [v0, "1", "Massa e volume; la densità resta uguale", "Raddoppia",
                   sp.Rational(16,count_units(1,2,3)), sp.real_root(8,3), sp.Rational(count_units(1,4,3),count_units(1,2,3)), capacity,
                   "V=W/c³", "κ₁κ₂³", sp.Rational(v1,v0), sp.Rational(v0+v1,2), sp.real_root(8,3),
                   sp.Rational(768,sp.Rational(48,v0))/count_units(1,4,3),
                   ((65-volume_cal[offset])/volume_cal[gain])/count_units(1,2,3), sp.real_root(16,4)]}


MANUAL = {
 "area": ["2 gruppi da 4", "S/u²: L²/L²=1", "due fattori c, uno per direzione", "16/8=2",
          "8/4=2", "√4=2", "(4/2)²=4", "(6/2)·10³=3000", "dividere entrambi i membri per c²",
          "cancellare A₁c₁²", "2·4=8", "(8+64)/2=36", "√(8/2)=2", "192/3=64; 64/16=4",
          "112/56=2; b=1; 32/2/4=4", "2·2·2=8"],
 "volume": ["2 strati da 4, in ciascuno di 2 cubi", "Q/u³: L³/L³=1", "2m/(2V)=m/V", "32/16=2",
            "16/8=2", "∛8=2", "(4/2)³=8", "1000/4·3=750", "dividere per c³", "cancellare V₁c₁³",
            "2·8=16", "16/2+256/2=136", "∛(16/2)=2", "768/3=256; 256/64=4",
            "480/240=2; b=1; 64/2/8=4", "(2²)²=16, radice positiva"]}


def verify(package, bindings, asset_root=None):
    expected_ids = {f"AR-u1-{kind}-conversion-{n:02}" for kind in ("area", "volume") for n in range(1,17)}
    ids = [r["id"] for r in package["records"]]
    if set(ids) != expected_ids or len(ids) != 32:
        raise ValueError("Expected exactly 32 unique reviewed IDs")
    if {b["id"] for b in bindings} != expected_ids or len(bindings) != 32:
        raise ValueError("Expected exactly 32 source bindings")
    asset_root = asset_root or Path(__file__).resolve().parents[2] / "editorial/assets"
    package_assets = {}
    for asset in package.get("assets", []):
        raw = base64.b64decode(asset["data"], validate=True)
        if sha(raw) != asset["id"]: raise ValueError("Package asset checksum mismatch")
        if asset["id"] in package_assets: raise ValueError("Duplicate package asset")
        package_assets[asset["id"]] = raw
    originals = {b["id"]: b for b in bindings}
    answers = expected()
    results = []
    for row in package["records"]:
        key = row["id"]
        family = "area" if "-area-" in key else "volume"
        n = int(key.rsplit("-", 1)[1])
        wanted = answers[family][n-1]
        errors = []
        binding = originals[key]
        if digest(row) != binding["candidateSha256"]: errors.append("Reviewed candidate hash changed")
        asset_checksums = {}
        for name, checksum in binding.get("assetChecksums", {}).items():
            if name not in {"corpus-area-units.svg", "corpus-volume-units.svg"}: raise ValueError("Unknown reviewed asset")
            file = asset_root / name
            actual = sha(file.read_bytes()) if file.is_file() else "MISSING"
            asset_checksums[name] = actual
            if actual != checksum or checksum not in package_assets: errors.append("Reviewed scientific asset changed or missing")
        signature = digest({"record": row, "assets": asset_checksums,
            "source": {"id": binding["sourceId"], "ref": binding["sourceRef"], "sha256": binding["sourceSha256"]}})
        if REVIEWED_CANDIDATES.get(key) != signature: errors.append("Independent reviewed signature mismatch")
        value = row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted: errors.append("Independent conceptual/symbolic key mismatch")
        else:
            try:
                if sp.Rational(str(value)) != sp.Rational(wanted): errors.append("Independent SI/counting result mismatch")
            except (ValueError, TypeError): errors.append("Non-numeric answer")
        if row["answer"]["type"] == "choice":
            options = row["answer"]["options"]
            if len(options) != 5 or len(set(options)) != 5 or options.count(value) != 1:
                errors.append("Distractors or unique key invalid")
        unit = "dimensionless"
        if n == 8: unit = "kg/m**3" if family == "area" else "milliliter"
        if family == "volume" and n == 3: unit = "kg/m**3"
        dimension = {name: str(power) for name, power in SI.Unit(unit).dimensionality.items()}
        results.append({"id": key, "sourceSha256": binding["sourceSha256"],
            "candidateSha256": digest(row), "ok": not errors, "errors": errors,
            "reviewedSignature": signature, "assetChecksums": asset_checksums,
            "expectedExact": str(wanted), "dimension": dimension,
            "manualArithmetic": MANUAL[family][n-1],
            "methods": ["independent_cell_enumeration_or_SI_or_simultaneous_equations",
                        "exact_sympy", "pint_dimensions", "individual_AI_reading_of_statement_and_distractors"],
            "physicalAssumptions": ("Final solution volume; concentration is not solution density" if family == "area" and n == 8
                 else "Homogeneous same substance, same temperature/pressure, additive volume" if family == "volume" and n == 3
                 else "Positive linear unit ratio; numerical indication distinguished from physical quantity"),
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    results = verify(json.loads((args.directory / "units-001.json").read_text()),
                     json.loads((args.directory / "units-001-bindings.json").read_text()))
    report = {"schemaVersion": "1.0.0", "records": results,
        "verifierSha256": sha(Path(__file__).read_bytes()), "humanApproval": "NOT_RUN",
        "source": {"title": "BIPM SI Brochure, chapter 3, powers of prefixed units",
                   "url": "https://www.bipm.org/en/si-brochure-9", "verifiedOn": "2026-11-24"}}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(report) + "\n")
    print(canonical({"count": len(results), "passed": sum(r["ok"] for r in results)}))
    raise SystemExit(0 if all(r["ok"] for r in results) else 1)
