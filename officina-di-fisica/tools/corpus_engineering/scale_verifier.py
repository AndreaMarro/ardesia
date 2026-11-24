"""Independent exact oracle for the sixteen read scale tasks; no authoring imports."""
from fractions import Fraction
from pathlib import Path
import json

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
# Filled only after independent AI reading of this exact edition and source bindings.
REVIEWED_CANDIDATES={
    "AR-u1-scientific-scale-01": "93cbb67633c47247315d5ef371d4380654e76ff8b86696677aeb2047068a414d",
    "AR-u1-scientific-scale-02": "c8a7bf43d7793094934984fca70dce8dc8093660ffcdf144450c27328e16ba82",
    "AR-u1-scientific-scale-03": "92bac8c0b68d70b9b6cd1eb3486b4f83caa25cb1992a66eb758c1e236dae595a",
    "AR-u1-scientific-scale-04": "12ba4e9ded57de0ab356a4cf7d28f64256e415fd99fef022fb28f8846010d9cc",
    "AR-u1-scientific-scale-05": "368f3cad4b5b0ba6405bb52f8fdfc4dab915b00b0d37f3baee03130549c5d4e9",
    "AR-u1-scientific-scale-06": "f59bea60b77987a75b8c273926c2b2d66ced486a2c13755b1cdb19b065728390",
    "AR-u1-scientific-scale-07": "d97e3858889f2c659c981656a1f9521d83cb21bd61a1b9c147cd1129bde4b3f4",
    "AR-u1-scientific-scale-08": "0fe515e39fe9781ec0ef7b9fc41f80922da9df89903697e1340fce9a77e0bc49",
    "AR-u1-scientific-scale-09": "ee023691364fc6012ad8538951e2fc83daf5f60c6b42ccbb26906e759bf0235a",
    "AR-u1-scientific-scale-10": "6779e50c1db96e9661bdcb06e4193efb942140e4ef2272ff5b9af576a0e5ed3b",
    "AR-u1-scientific-scale-11": "4a9ce0c998b28da88238b2bac86a9cd122f34a9e9388e731fdfacc38971dd54a",
    "AR-u1-scientific-scale-12": "aa3e8509b29dff3ae6c8fc230f4a46d8aa80607125480932ffcae432ae12ca55",
    "AR-u1-scientific-scale-13": "4b3cd799a8f247439d6bd93eeecf79e3af34f5fb6a5ccb54449cb2d4672bd268",
    "AR-u1-scientific-scale-14": "d694b3d79b589af79ccf4fbfe7edaf0b00b4c9793f55a4c1a50afd7f41d115bc",
    "AR-u1-scientific-scale-15": "df786d3fe0330e53922856e54a4c06a2a811d9de4ed1f9e2adfa58bd43fc5a96",
    "AR-u1-scientific-scale-16": "fb4a47b1110e9e32f341ad77f2816f1d60ea2330fffa27d05942c22a22b12fc7"
}
EXPECTED_IDS={f"AR-u1-scientific-scale-{n:02}" for n in range(1,17)}


def decimal_scale(a,n):
    if type(n) is not int or abs(n)>24:raise ValueError("Bounded integer exponent required")
    result=Fraction(a)
    factor=Fraction(10) if n>=0 else Fraction(1,10)
    for _ in range(abs(n)):result*=factor
    return result


def oracle():
    # Two separately expressed SI measurements, then a quantity ratio.
    t1=SI.Quantity(Fraction(4,1000),"second")
    t2=SI.Quantity(Fraction(2,10000),"second")
    ratio=(t1/t2).to("").magnitude
    nano=SI.Quantity(Fraction(4,100000000),"pascal").to("nanopascal").magnitude
    # Log-nearest convention is stipulated in the question; squared threshold is exact.
    order_exponent=5 if Fraction(3)**2<10 else 6
    g,b=sp.symbols("g b")
    calibration=sp.solve([sp.Eq(g*20+b,41),sp.Eq(g*400+b,801)],(g,b))
    coefficient=((81-calibration[b])/calibration[g])/10
    n=sp.symbols("n",integer=True,positive=True)
    power=sp.simplify((4*10**n)**2/(2*10**(n+3)))
    # Coefficient 8 cancels; injectivity of 10**n reduces to a linear equation.
    exponent=sp.solve(sp.Eq(n-3,4),n)[0]
    assert sp.simplify(power.subs(n,exponent)-8*10**4)==0
    return [decimal_scale(2,1),"1",ratio,"Raddoppia",Fraction(20,10),1,nano,
            f"10⁵ m" if order_exponent==5 else "10⁶ m","a=R/10ⁿ","κ₁·10^[n₁(κ₂−1)]",
            Fraction(decimal_scale(4,2),decimal_scale(2,1)),Fraction(20+400,2),2,
            Fraction(1200, Fraction(60,20))/100,coefficient,exponent]


MANUAL=["2·10=20","s/s=1","40/2=20","40/20=2","20/10=2","10¹=10",
        "4·10^(−8+9)=40","3²=9<10, nessuna approssimazione di √10",
        "dividere entrambi i membri per 10ⁿ","sottrarre κ₂n₁−n₁ negli esponenti",
        "(4/2)·10^(2−1)=20","20/2+400/2=210","togliere fattore 2, poi n₂−1=1",
        "60/20=3; 1200/3/100=4","760/380=2; b=1; (81−1)/2/10=4","16/2=8; 2n−(n+3)=n−3; n=7"]


def verify(package,bindings,asset_root=None):
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        n=int(row["id"].rsplit("-",1)[1]);want=expected[n-1];value=row["answer"]["value"]
        if isinstance(want,str):
            if value!=want:errors.append("Independent conceptual/symbolic key mismatch")
        else:
            try:
                if sp.Rational(str(value))!=sp.Rational(want):errors.append("Independent exact SI/algebra result mismatch")
            except (ValueError,TypeError):errors.append("Non-numeric answer")
        unit="nanopascal" if n==7 else "meter" if n==8 else "dimensionless"
        results.append({"id":row["id"],"sourceSha256":binding["sourceSha256"],"candidateSha256":digest(row),
            "reviewedSignature":signature,"assetChecksums":assets,"ok":not errors,"errors":errors,
            "expectedExact":str(want),"dimension":{k:str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            "manualArithmetic":MANUAL[n-1],"verificationMode":"AI_CONCEPTUAL" if isinstance(want,str) else "EXACT_ORACLE",
            "methods":["independent_fraction_decimal_scaling_and_SI","exact_sympy_calibration_and_substitution","individual_AI_statement_and_distractor_review"],
            "physicalAssumptions":"Dimensionless ratios unless pressure/length is explicitly requested; integer exponents; declared log-nearest convention only for ID08; constant calibration coefficients.",
            "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings),"verifierSha256":sha(Path(__file__).read_bytes()),
        "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),"humanApproval":"NOT_RUN",
        "source":{"title":"BIPM SI Brochure: prefixes, units and quantities with unit one","url":"https://www.bipm.org/en/si-brochure-9","verifiedOn":"2026-11-24"}}


if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument("--directory",type=Path,required=True);p.add_argument("--output",type=Path,required=True)
    args=p.parse_args();result=report(json.loads((args.directory/"scale-002.json").read_text()),json.loads((args.directory/"scale-002-bindings.json").read_text()))
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(canonical(result)+"\n")
    print(canonical({"count":len(result["records"]),"passed":sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
