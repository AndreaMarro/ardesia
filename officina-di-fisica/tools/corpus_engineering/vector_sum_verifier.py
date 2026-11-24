"""Independent coordinate-walk and vector-projection oracle; no authoring imports."""
from fractions import Fraction
from pathlib import Path
import json

import pint
import sympy as sp

from .pipeline import canonical,digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
REVIEWED_CANDIDATES={
    "AR-u1-vector-sum-01": "339461276cc342f16295ce94e114d1bb3116cf23650167cf8cb23b6f20d3edea",
    "AR-u1-vector-sum-02": "21694585089bf31274128ca7fe2faa02a22d4997d1a6545d5d28592e46ca7401",
    "AR-u1-vector-sum-03": "60f8bf5b3d38961b1d2b25ff0066bfc4a97baa6072a4f083c629f9f54ca141e4",
    "AR-u1-vector-sum-04": "5c97e404f91c1937448ff281d2e1ea2a2c85d6eaf85f94f2a440df859f3efb24",
    "AR-u1-vector-sum-05": "0b934c1c67b0dc07cee743ecca07b51fc7c7a29063ee0a4b66505b2dd9872b79",
    "AR-u1-vector-sum-06": "5a88f5df8dc6a06e7af896203a211ee88a80aea50499973a87d129671b3561fb",
    "AR-u1-vector-sum-07": "773d942c8640ddd0308fb65ac4b2a3f315e089100cbf7422227fcad05013a61d",
    "AR-u1-vector-sum-08": "1979dca67e7962ea6a747a3762932a63a35e45bdb4a640f21808099064c1c201",
    "AR-u1-vector-sum-09": "80b349b1df016b740247691d469390f8646c0e215ef952919314cfe1f8f9a932",
    "AR-u1-vector-sum-10": "b963dc31f037f63903e04966d3b0438735cb22e0962732928914bc9d6713d744",
    "AR-u1-vector-sum-11": "615174f42d2cec541ef3ef7bb26568aa135dc4528526edb0319b470f07158d37",
    "AR-u1-vector-sum-12": "d2828aea5fa53d9d3398413d1443de3d429ba6e81b4a148556e17b3d69bab08e",
    "AR-u1-vector-sum-13": "decf1d5d1684da70071fa78ecc8df4188fc207c41f6100914de552a58ccadc98",
    "AR-u1-vector-sum-14": "7eb6d3fa740943c1654e0b2a3446cc406c5d95d7d36c7730ada27abbfc71cdda",
    "AR-u1-vector-sum-15": "00369a6a8513e43be64a0d992ac13cdc4b662aa513a6fb238ed2053ee54af3b7",
    "AR-u1-vector-sum-16": "6b48961d3cca4d5a59c4d18c23eb337dddb3b55bbec093a1e768d5e8cfde93d8"
}
EXPECTED_IDS={f"AR-u1-vector-sum-{n:02}" for n in range(1,17)}


def walk(origin,*steps):
    position=Fraction(origin)
    for step in steps:
        if type(step) is not int or abs(step)>1000:raise ValueError("Bounded integer coordinate steps required")
        for _ in range(abs(step)):position+=1 if step>=0 else -1
    return position


def oracle():
    # Derive the law from vectors on a fixed east-oriented axis, not a source formula.
    a,b,D,alpha,beta=sp.symbols("a b D alpha beta",positive=True)
    east=sp.Matrix([1,0])
    magnitude=sp.simplify((a*east+b*east).norm())
    assert sp.simplify(magnitude-a-b)==0
    inverse=sp.solve(sp.Eq(D,magnitude),a)[0]
    assert sp.simplify(inverse-(D-b))==0
    factor=sp.simplify(magnitude.subs({a:alpha*a,b:beta*b},simultaneous=True)/magnitude)
    assert sp.simplify(factor-(alpha*a+beta*b)/(a+b))==0
    g,c=sp.symbols("g c")
    calibration=sp.solve([sp.Eq(4*g+c,9),sp.Eq(8*g+c,17)],(g,c))
    calibrated=(13-calibration[c])/calibration[g]-2
    # SI cancels display-count dimensions against a gain measured per metre.
    gain=SI.Quantity(Fraction(12,4),"1/meter")
    measured=(SI.Quantity(24,"")/gain).to("meter").magnitude
    return [walk(0,2,2),"m","D=a+b","Passa da 4 m a 6 m",walk(0,2),walk(-2,3,4),
            Fraction(walk(0,2,4),walk(0,2,2)),8-walk(0,2,2),"a=D−b","(κ₁a+κ₂b)/(a+b)",
            Fraction(walk(0,4,4),walk(0,2,2)),Fraction(walk(0,2,2)+walk(0,4,4),2),
            Fraction(2*walk(0,2,2)-4,2),measured-4,calibrated,sp.solve(sp.Eq(2*b,4),b)[0]]


MANUAL=["due avanzamenti di2m danno4m","lunghezza: unità metro","proiezioni +a e +b su un unico asse",
        "4+2=6, non8","4−2=2","−2+3=1, poi1+4=5; variazione7","6/4=3/2",
        "8−(2+2)=+4m","sottrarre b su entrambi i membri","rapporto di due somme, pesi a/(a+b),b/(a+b)",
        "8/4=2","(4+8)/2=6m; linearità confermata","nuovo totale8m;8−4=4m;4/2=2",
        "guadagno12/4=3m⁻¹;24/3−4=4m","guadagno8/4=2m⁻¹;offset1;(13−1)/2−2=4m","4m/2=2m"]


def verify(package,bindings,asset_root=None):
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        n=int(row['id'].rsplit('-',1)[1]);want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append("Independent vector/conceptual key mismatch")
        else:
            try:
                raw=str(value).replace('−','-')
                if n in (8,12):
                    if not raw.endswith(' m'):raise ValueError("Length unit missing in option")
                    raw=raw.removesuffix(' m')
                if sp.Rational(raw)!=sp.Rational(want):errors.append("Independent coordinate/SI result mismatch")
            except (ValueError,TypeError):errors.append("Invalid numeric or unit answer")
        unit="dimensionless" if n in (7,10,11,13) else "meter"
        results.append({"id":row['id'],"sourceSha256":binding['sourceSha256'],"candidateSha256":digest(row),
            "reviewedSignature":signature,"assetChecksums":assets,"ok":not errors,"errors":errors,
            "expectedExact":str(want),"dimension":{k:str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            "manualArithmetic":MANUAL[n-1],"verificationMode":"AI_CONCEPTUAL" if isinstance(want,str) else "EXACT_ORACLE",
            "methods":["independent_unit_step_coordinate_walk","symbolic_vector_projection_norm","SI_gain_conversion_and_linear_system","individual_AI_statement_and_distractor_review"],
            "physicalAssumptions":"Common fixed axis positive east; consecutive concordant positive displacements; coordinates distinguished from displacement; equal statistical weights only in12; gains/offsets constant only in14/15.",
            "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return results


def report(package,bindings):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings),"verifierSha256":sha(Path(__file__).read_bytes()),
        "contractSha256":sha(Path(__file__).with_name('review_contract.py').read_bytes()),"humanApproval":"NOT_RUN",
        "source":{"title":"Definition of displacement as change in position; explicit fixed-axis projection and SI metre","reference":"Independently derived coordinate identities for the read statements; not a human approval"}}


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--directory',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    args=p.parse_args();result=report(json.loads((args.directory/'vectors-003.json').read_text()),json.loads((args.directory/'vectors-003-bindings.json').read_text()))
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(canonical(result)+'\n')
    print(canonical({'count':len(result['records']),'passed':sum(r['ok'] for r in result['records'])}))
    raise SystemExit(0 if all(r['ok'] for r in result['records']) else 1)
