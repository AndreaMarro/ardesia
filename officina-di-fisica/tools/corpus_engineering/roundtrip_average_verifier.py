"""Independent equal-distance roundtrip-speed oracle, separate from its author."""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json'
CANDIDATE_REF='50d18b604c9ba298864691430d1ed7e9dee60a50'
REVIEWED_PACKAGE_SHA256='0b42414ab6b8ceef8dc20248e0429457d29531d1df85d9d4cc5f82686aa67ea3'
REVIEWED_BINDINGS_SHA256='184741f51512ba155fad7ca672736c1defb376ec2b5fbfcc90b1442ddf6338cd'
EXPECTED_IDS={f'AR-u2-roundtrip-average-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={'AR-u2-roundtrip-average-01': '26310c521bf3cb98b8f9cf2935aa546603e277b261c42164cfed0c995900b041', 'AR-u2-roundtrip-average-02': '0b2dd06327ee8154b05e0d5252f814678ab61c9bf67ffc0f84db19f5b9d2daca', 'AR-u2-roundtrip-average-03': '38b33a23cbbfc957e16be92eba359db211b5ac194a49e9c5bc0552c655807ed7', 'AR-u2-roundtrip-average-04': '7eca86b31f439bfb690d873d7f212b61686d4d5230391ad9fe83f628fbe35fb7', 'AR-u2-roundtrip-average-05': 'b5db8c01a3e5be051f48a020098868c28c5af3da97345be42fabdc60961e5d05', 'AR-u2-roundtrip-average-06': '0710fd1815be85a859ccd7d3013dfd3cd7a8b9c96ba00550ef7f3ec8ba546989', 'AR-u2-roundtrip-average-07': '04d12a869a267c230644f0fe4d3624e1c76383dcb4dbd8849bcb2e6ee6b8a0d5', 'AR-u2-roundtrip-average-08': 'dfcfed09dddbaa5a7ace6921743833a785840be2763c7dd2de76c3e7286fa479', 'AR-u2-roundtrip-average-09': 'bbc4018caf702523e8283017a05b93f766c2fd103ba0d8377c3c4747936bd974', 'AR-u2-roundtrip-average-10': '96d568544599c4df3ab6781865def70f21c0376c178dfc38fb79b1794ef3dedf', 'AR-u2-roundtrip-average-11': 'c2b49fa57df42823f34adad13d680585c9885fc874454887f0b80087a74e12dc', 'AR-u2-roundtrip-average-12': '7452d633e06a87ca5aa734b6acf503a7f47d521e626ae7447c4f622c5a71aece', 'AR-u2-roundtrip-average-13': '807084b7b7c8ada1e11c81c095ed178a3ef8b5b502d1edc0a9ca0b9efcb21df5', 'AR-u2-roundtrip-average-14': 'ae24c01e06fd7f5d7a9e3ffe8dff8abd4456f608828a8b4400ae6d7bbe5c33ed', 'AR-u2-roundtrip-average-15': '4835eed102009fd07f1ad7d74eadbfc2433e9c856ac9790908a3f2bced6dd04a', 'AR-u2-roundtrip-average-16': 'e7995dd5cf6bf7cd31c9aed52af6620ac0dbad91b6e5eb4a0e2028454e2579db'}

@lru_cache(maxsize=1)
def source_records():
    return {r['id']:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def harmonic(a,b):
    a,b=sp.sympify(a),sp.sympify(b)
    return sp.cancel(2/(1/a+1/b))

def oracle():
    d,v1,v2,V,k1,k2=sp.symbols('d v1 v2 V k1 k2',positive=True)
    t1,t2=d/v1,d/v2
    path=d+d
    model=sp.cancel(path/(t1+t2))
    assert sp.simplify(model-harmonic(v1,v2))==0
    # Oriented return displacement is negative although its duration is positive.
    assert sp.simplify(v1*t1-v2*t2)==0
    inverse=sp.solve(sp.Eq(V,model),v1)[0]
    assert sp.simplify(inverse-V*v2/(2*v2-V))==0
    assert sp.limit(model,v1,sp.oo)==2*v2
    assert sp.simplify(sp.diff(model,v1)-2*v2**2/(v1+v2)**2)==0
    assert sp.simplify((v1+v2)/2-model-(v1-v2)**2/(2*(v1+v2)))==0
    scale=sp.cancel(model.subs({v1:k1*v1,v2:k2*v2},simultaneous=True)/model)
    assert sp.simplify(scale-k1*k2*(v1+v2)/(k1*v1+k2*v2))==0
    t_out=(SI.Quantity(6,'m')/SI.Quantity(3,'m/s')).to('s')
    t_back=(SI.Quantity(6,'m')/SI.Quantity(2,'m/s')).to('s')
    share=(t_back/(t_out+t_back)).to('').magnitude
    assert share==Fraction(3,5)
    gain=SI.Quantity(6,'')/SI.Quantity(2,'m/s')
    recovered=(SI.Quantity(12,'')/gain).to('m/s').magnitude
    assert gain.to('s/m').magnitude==3 and recovered==4
    g,c=sp.symbols('g c',real=True)
    cal=sp.solve([sp.Eq(g*harmonic(2,2)+c,5),sp.Eq(g*harmonic(4,4)+c,9)],(g,c))
    decoded=(sp.Rational(19,3)-cal[c])/cal[g]
    assert decoded==sp.Rational(8,3)
    # Nonproportional trials refute commutation with averaging inputs.
    assert (harmonic(2,4)+harmonic(4,2))/2==sp.Rational(8,3)
    assert harmonic(3,3)==3
    needed=sp.solve(sp.Eq(harmonic(4,v2),2*harmonic(2,2)),v2)[0]
    return [harmonic(2,2),'m/s','V=2v₁v₂/(v₁+v₂)','Da 2 a 8/3 m/s',
       inverse.subs({V:2,v2:2}),sp.Rational(share),harmonic(2,4)/harmonic(2,2),
       4-harmonic(2,2),'v₁=Vv₂/(2v₂−V)','κ₁κ₂(v₁+v₂)/(κ₁v₁+κ₂v₂)',
       harmonic(4,4)/harmonic(2,2),(harmonic(2,2)+harmonic(4,4))/2,
       needed/2,inverse.subs({V:sp.Rational(recovered),v2:4}),inverse.subs({V:decoded,v2:2}),
       sp.solve(sp.Eq(harmonic(v2,v2),2),v2)[0]]

MANUAL=[
 'Path2d,time d/2+d/2=d/(1m/s);mean2m/s;oriented displacementd−d=0,so vector average0.',
 'Path length over positive time isL/T,even when endpoint equals start.',
 'Elapsed d/v1+d/v2=d(v1+v2)/(v1v2);path2d gives2v1v2/(v1+v2).',
 'Oldmean2;new2·4·2/(4+2)=16/6=8/3m/s;strictlybetween2and3.',
 'V(v1+v2)=2v1v2;v1=Vv2/(2v2−V);2·2/(4−2)=2m/s.',
 '6/3=2s outward,6/2=3s back;back share3/(2+3)=3/5;path12m,mean12/5m/s,vector0.',
 'Newmean8/3m/s divided by old2m/s gives4/3.',
 'Correct mean2,proposal4;4−2=+2m/s,not4−vectoraverage0.',
 'Collectv1afterclearingpositive denominator;v1=Vv2/(2v2−V). Positivefinite inverse requires0<V<2v2.',
 'Numerator scalesk1k2while denominator changes;ratio k1k2(v1+v2)/(k1v1+k2v2). Commonfactork yieldsk,notk².',
 'Bothspeedsdouble,bothtimeshalve atfixedpath;mean4/2=2.',
 'Trialmeans2and4average3m/s. Currentproportionalpairscoincidewithmeaninputs;counterexample(2,4),(4,2)hasoutputmean8/3,inputmean3.',
 'Target4m/s,newoutward4m/s;return=(4·4)/(8−4)=4m/s;factor4/2=2.',
 'Gain6/(2m/s)=3s/m;S12givesV4m/s;inverse16/(8−4)=4m/s.',
 'Gain2s/m,offset1; (19/3−1)/2=8/3m/s. Denominator4−8/3=4/3;v1=(16/3)/(4/3)=4m/s.',
 'v1=v2>0 makes2v2²/(2v2)=v2;v2=2m/s. d remainsundeterminedandirrelevant.',
]
DISTRACTORS=[
 '4adds speedswithouttimes;vectoraverage0is a differentquantityfrompositive mean speed.',
 'm path,m/s² acceleration,s/m reciprocalvelocity,1cannotcarrymean-speed dimension.',
 'Arithmeticmeanrequires equaltimes;0confusesnetdisplacement;missing2halvespath;geometricmeannotderivedfromdurations.',
 '3is arithmeticmean,4ignores slowerreturn,unchangedorreduced contradictreducedtotaltime.',
 'Arithmeticinverse2V−v2onlycoincidesforv1=v2;generalinverseisrationalwithpositivedenominator.',
 '2/5outwardtimeshare;1/2distancefraction,2/3and3/2singlelegcomparedtootherinsteadtotal.',
 '3/2compareswrong arithmeticmeans;2changedspeedonly;3/4inverse;1/2contradictsdecreasingelapsedtime.',
 '−2reversesorder;0treatsproposalcorrect;+4repeatsproposalorusesvectorzero;+1nottherequesteddifference.',
 '2V−v2wrongmean;reverseddenominatorgivesnegative;missingv2givesdimensionless;v2−Vhaswrongcoefficientandmaybevanishesforvalidinput.',
 'Productaloneignoresdenominator;sumfailsidentity;arithmeticratioignoresdurationweight;crossedcoefficientsassignfactorstowronglegs.',
 'Factork²inproductiscancelledbyfactor k indenominatorsum;vector0/0isnotthisratioofpositivemeans.',
 '2and4singleoutputs,6sum,8/3belongstononproportionalcounterexamplenotgivenpairs.',
 'Changingonlyonelegcannotreachdoublemeanwithotherkept2;inverseissolvedatfinitepositivedenominator.',
 'Count12isnotvelocity;converttheninvert,domain0<V<2v2holds.',
 'v1=2givesS5;3gives29/5;6gives7;8gives37/5. Only4gives19/3.',
 '1and4misusefactor2;zeroandnegativeviolatespeedpositivity;freepathdoesnotdestroyuniquespeed.',
]
ASSUMPTIONS=['Equal positive distances;positive constant speeds within each leg,no stops;turnaroundduration neglected. Mean speed usespath,notsigned displacement.']*16
ASSUMPTIONS[5]='Bothpaths6m,outwardspeed3m/s,returnspeed2m/s;no pauses or turnaroundtime;timefractionnotdistancefraction.'
ASSUMPTIONS[8]='v2>0and0<V<2v2;inversefinitepositive. AtV=2v2onlyinfinitefirstspeedlimit,excluded.'
ASSUMPTIONS[9]='Positivelegsandfactors;common equaldistance structureineachtrial;denominatorsumspositive.'
ASSUMPTIONS[11]='Equal statisticalweightsbetweentrials;timeweightsinsideeachtripnotnecessarilyequal.'
ASSUMPTIONS[13]='Fixedpositivegain,zerooffsetfromS=gV;dimensionlesscount;mean-speedinverseusesknownpositivev2.'
ASSUMPTIONS[14]='Fixedgainandoffset;subtractoffsetfirst;decoded8/3<2v2=4,sofinitepositiveinverseexists.'
UNITS={n:'meter/second' for n in range(1,17)}
UNITS.update({n:'dimensionless' for n in(6,7,10,11,13)})
NUMERIC_UNITS={1:'m/s',5:'m/s',11:'1',13:'1',14:'m/s'}
OPTION_SUFFIX={8:' m/s',12:' m/s',15:' m/s',16:' m/s'}


def verify(package, bindings, asset_root=None):
    if package.get("schema") != "astra/1":
        raise ValueError("Expected the reviewed astra/1 package")
    asset_root = asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    answers = oracle()
    originals = source_records()
    common = []
    if digest(package) != REVIEWED_PACKAGE_SHA256:
        common.append("Independent reviewed package edition mismatch")
    if digest(bindings) != REVIEWED_BINDINGS_SHA256:
        common.append("Independent reviewed binding edition mismatch")
    results = []
    for row, binding, signature, assets, errors in reviewed_rows(package, bindings, REVIEWED_CANDIDATES, EXPECTED_IDS, asset_root):
        errors.extend(common)
        n = int(row["id"].rsplit("-", 1)[1])
        source_id = f"u2-roundtrip-average-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent roundtrip conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Missing physical unit in option")
                    raw = raw.removesuffix(suffix)
                if len(raw) > 80 or sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent weighted-displacement/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Independent exact answer or physical unit invalid")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        if row["answer"]["type"] == "choice" and n in (6, 7, 8, 12, 15, 16):
            try:
                numeric_options = [sp.Rational(str(o).removesuffix(OPTION_SUFFIX.get(n, "")).replace("−", "-")) for o in row["answer"]["options"]]
                if len(set(numeric_options)) != 5:
                    errors.append("Independent numerically equivalent distractors")
            except (ValueError, TypeError):
                errors.append("Independent malformed numeric distractor")
        results.append({"id": row["id"], "sourceSha256": binding["sourceSha256"], "candidateSha256": digest(row),
            "reviewedSignature": signature, "assetChecksums": assets, "ok": not errors, "errors": errors,
            "expectedExact": str(wanted), "dimension": {str(k): str(v) for k, v in SI.Unit(UNITS[n]).dimensionality.items()},
            "manualArithmetic": MANUAL[n-1], "physicalAssumptions": ASSUMPTIONS[n-1], "distractors": DISTRACTORS[n-1],
            "verificationMode": "AI_CONCEPTUAL" if isinstance(wanted, str) else "EXACT_ORACLE",
            "methods": ["independent_equal_path_lengths_and_total_elapsed_time", "SymPy_harmonic_mean_inverse_range_and_nonlinear_counterexample",
                        "Pint_two_leg_durations_and_inverse_velocity_gain", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Equal-distance roundtrip mean speed and unequal time weights",
                   "reference": "Independently derived from all sixteen read statements; positive path lengths, elapsed times and harmonic mean"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"roundtrip-average-018.json").read_text()),
                    json.loads((args.directory/"roundtrip-average-018-bindings.json").read_text()), args.asset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count": len(result["records"]), "passed": sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)


def mutation_audit(package, bindings, asset_root):
    """Reproducible adversarial tests; altered signatures exist only in patch contexts."""
    from copy import deepcopy
    import sys
    from unittest.mock import patch

    cases = []
    module = sys.modules[__name__]
    for i, original in enumerate(package["records"]):
        changed, links = deepcopy(package), deepcopy(bindings)
        row = changed["records"][i]
        answer = row["answer"]
        answer["value"] = (answer["value"]+1 if answer["type"] == "numeric" else
                           next(o for o in answer["options"] if o != answer["value"]))
        links[i]["candidateSha256"] = digest(row)
        token = next(s for r, b, s, a, e in reviewed_rows(changed, links, {}, EXPECTED_IDS, asset_root) if r["id"] == row["id"])
        # Deliberately bypass all edition signatures for this test only. The
        # independently derived answer must still reject a new, rebound bad key.
        with patch.dict(REVIEWED_CANDIDATES, {row["id"]: token}), patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed), REVIEWED_BINDINGS_SHA256=digest(links)):
            result = next(r for r in verify(changed, links, asset_root) if r["id"] == row["id"])
        oracle_errors = [e for e in result["errors"] if "conceptual key" in e or "weighted-displacement/SI result" in e]
        if result["ok"] or not oracle_errors:
            raise AssertionError("Rebound, retokenized wrong key escaped independent oracle: "+row["id"])
        cases.append({"case": "wrong_key_rebound_and_all_edition_tokens_replaced", "id": row["id"], "rejectedBy": oracle_errors})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][0]["blocks"].append({"type": "text", "text": "Distanze uguali impongono sempre tempi uguali anche con rapidità diverse."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false equal-time proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_equal_time_proof_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][2]["blocks"].append({"type": "text", "text": "La rapidità media di ogni andata e ritorno è zero perché si torna al punto iniziale."})
    links[2]["candidateSha256"] = digest(changed["records"][2])
    result = verify(changed, links, asset_root)[2]
    if result["ok"]:
        raise AssertionError("Plausible restored zero roundtrip-speed explanation error escaped frozen reading")
    cases.append({"case": "correct_key_but_false_zero_mean_speed_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    for name, transform in [("empty", lambda p: p.update(records=[])),
                            ("partial", lambda p: p["records"].pop()),
                            ("duplicate", lambda p: p["records"].__setitem__(1, deepcopy(p["records"][0])))]:
        changed = deepcopy(package)
        transform(changed)
        try:
            verify(changed, bindings, asset_root)
        except ValueError:
            cases.append({"case": name+"_batch", "rejectedBy": "complete unique batch boundary"})
        else:
            raise AssertionError("Incomplete batch accepted: "+name)
    changed, links = deepcopy(package), deepcopy(bindings)
    links[0]["sourceSha256"] = "0"*64
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Changed original source hash escaped Git check")
    cases.append({"case": "source_hash_changed", "id": result["id"], "rejectedBy": result["errors"]})
    return {"scope": "mutation_tests_of_independent_review_boundary_and_oracle", "cases": cases, "caseCount": len(cases),
            "allRejected": True, "frozenSignaturesRestored": True, "humanApproval": "NOT_RUN", "publication": "DRAFT"}
