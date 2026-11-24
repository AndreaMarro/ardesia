"""Independent first-stop-time oracle; never extend a braking speed past stop."""
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
CANDIDATE_REF='d07af585ecff2498205335d755da70ced1444b09'
REVIEWED_PACKAGE_SHA256='a1b7ec01ea80c47e332d29bb3e4ba90fc667aea1c9919d609dd98a7448187aad'
REVIEWED_BINDINGS_SHA256='3b9037c9b80a0f6af0dde43dde9d83ac252cf563029fb8bbbc29d165e7d2f8bf'
EXPECTED_IDS={f'AR-u2-stopping-time-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={'AR-u2-stopping-time-01': '53dee5bb288fde64f25f38f05c9824187795032bd6e6a3702e5db61ace5b3be0', 'AR-u2-stopping-time-02': '978a991fb4c178960a8d8d7ed34f5c50e3c962f976902970cee113f8ae9cdacb', 'AR-u2-stopping-time-03': '986db77342b63ad5bdf4c3d0e3a8ffba7a1673164d95b44bef3e829bbe833e80', 'AR-u2-stopping-time-04': '9b28b185345cc5bb86c8c35f4bbd96dc7ec13658a3f4e46fd559000a714f4265', 'AR-u2-stopping-time-05': '2fe211c1cacc7b1aa6f0dd7abbbb3adf8312254bbd0aca493afb42e98b1b3f4f', 'AR-u2-stopping-time-06': 'fb5e6cf805bdd63a98a85ea720b91325e804880f6ed8b02d0a2c9ac72d8885fa', 'AR-u2-stopping-time-07': 'bfb39a95a22e487c3c74639ca76d97232c06caab23c93398127338fac8dbb523', 'AR-u2-stopping-time-08': '5ccdb21821b931475c57f0afbe42c4314d5e80c5918b357eb9df44ebb5d04aa9', 'AR-u2-stopping-time-09': 'a6ee0aaeb7e692ba1c177241d60001e3cd35732e5e637587b33f91bcac059bd2', 'AR-u2-stopping-time-10': '7f57a631d94ee6574396d793cca1ba09073922db64a6d8c5699eb28edbf8ae4f', 'AR-u2-stopping-time-11': 'dcd40d97bbc6b3b1fa021d193bdc75bc23e544a0f1688395e8f366f9fb33677b', 'AR-u2-stopping-time-12': 'a463bdbc6291c58957b13e393e8b7b93dc7df918c5067444fcb44d9536398c9b', 'AR-u2-stopping-time-13': 'a0857e7cbfd3303e71250ec81bf46c63bf8992f4b5df7e4bd3b4042237b9ce1d', 'AR-u2-stopping-time-14': 'e940a477f7d2526a7edd1e23831cef4e9c4950edc0c6fd73b74cb73a76f29364', 'AR-u2-stopping-time-15': 'f0a1ee9f7cdf91de135d4d56d97517ff000fad77705c01d78e942cf98264ae89', 'AR-u2-stopping-time-16': 'f5ee64cf562615da3781ffc3ca2aab6886921546e117ba6650c68fdbf9c144c6'}

@lru_cache(maxsize=1)
def source_records():
    return {r['id']:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def duration(v,b):
    return sp.Rational(v)/sp.Rational(b)

def oracle():
    v,b,T,k1,k2,z=sp.symbols('v b T k1 k2 z',positive=True)
    t=sp.symbols('t',nonnegative=True)
    u=v-b*t
    root=sp.solve(sp.Eq(u,0),t)[0]
    assert root==v/b and sp.diff(u,t)==-b
    # Every strict pre-stop time can be written T/(1+z),z>0.
    before=sp.factor(u.subs(t,root/(1+z)))
    assert sp.simplify(before-v*z/(1+z))==0 and before.is_positive
    assert sp.simplify(u.subs(t,2*root)+v)==0
    inverse_v=sp.solve(sp.Eq(T,root),v)[0]
    inverse_b=sp.solve(sp.Eq(T,root),b)[0]
    assert inverse_v==b*T and inverse_b==v/T
    assert sp.simplify(root.subs({v:k1*v,b:k2*b},simultaneous=True)/root-k1/k2)==0
    unit_time=(SI.Quantity(2,'m/s')/SI.Quantity(2,'m/s**2')).to('s')
    assert unit_time.magnitude==1
    gain=SI.Quantity(3,'')/unit_time
    recovered=(SI.Quantity(Fraction(9,2),'')/gain).to('s')
    recovered_v=(SI.Quantity(4,'m/s**2')*recovered).to('m/s').magnitude
    assert gain.to('1/s').magnitude==3 and recovered_v==6
    first,second=duration(2,2),duration(6,4)
    g,c=sp.symbols('g c',real=True)
    cal=sp.solve([sp.Eq(g*first+c,3),sp.Eq(g*second+c,4)],(g,c))
    t_unknown=(5-cal[c])/cal[g]
    # Redundant constraints in SI-valued coordinates leave one free positive scale.
    tau=sp.symbols('tau',positive=True)
    jac=sp.Matrix([v-tau*b,v-tau*b]).jacobian([v,b])
    assert jac.rank()==1
    assert sp.simplify(root.subs(v,tau*b)-tau)==0
    assert (SI.Quantity(1,'s')*SI.Quantity(2,'m/s**2')).to('m/s').magnitude==2
    return [first,'s','T=v/b','Raddoppia da 1 s a 2 s',inverse_v.subs({b:2,T:1}),
       inverse_b.subs({v:2,T:1}),duration(2,4)/first,2-first,'v=bT','κ₁/κ₂',
       second/first,(first+second)/2,sp.solve(sp.Eq(6/b,sp.Rational(3,2)*first),b)[0]/2,
       sp.Rational(recovered_v),2*t_unknown,'Infinite coppie positive']

MANUAL=[
 'u(t)=2m/s−(2m/s²)t; first zero atT=2/2=1s. BeforeT velocitypositive; beyondT extrapolationwouldreverse direction.',
 '(m/s)/(m/s²)=s; using positive deceleration magnitude preserves positive duration.',
 '0=v−bT implies bT=v andT=v/b,withb>0;orT=−v/a_x whena_x=−b.',
 'Initialspeed2→4atfixedb2 givesT1→2s,not4s; the squared dependence belongs to stopping distance.',
 'v=bT=2m/s²·1s=2m/s; subtractbT givesfirstzero.',
 'b=v/T=2m/s÷1s=2m/s²;oriented acceleration is−2m/s².',
 'Fixedv2;T1=1s,T2=1/2s;ratio1/2. Acceleration signs do not make durations negative.',
 'CorrectT1s;proposal2s;error2−1=+1s. Formalu(2s)=−2m/s liesafterfirststop.',
 'MultiplyT=v/bbyb;v=bT,unitL/T.',
 'Scaledtime(k1v)/(k2b) dividedbyv/b givesk1/k2;equalfactorscancel.',
 'Firstduration2/2=1s,second6/4=3/2s;ratio3/2.',
 'Equal-trialmean(1+3/2)/2=5/4s;mean-inputquotient4/3s isdifferent.',
 'Targettime3/2s,newb=6/(3/2)=4m/s²;ratio4/2=2.',
 'g=3s⁻¹;S9/2givesT(9/2)/3=3/2s;v=4·3/2=6m/s.',
 'g=(4−3)/(3/2−1)=2s⁻¹,c1;T=(5−1)/2=2s;v=2·2=4m/s.',
 'v=(1s)b alreadyforcesv/b=1s. Duration repeats the same equation;rank1fortwo unknowns. Anyb>0pairedwithv=(1s)bworks.',
]
DISTRACTORS=[
 'NegativeTduplicatesdeceleration sign;reaction timeexcluded;notextrapolatedtoreverse motion.',
 'm stoppingdistance,m/svelocity,m/s²acceleration,1notduration.',
 '−v/bnegative;b/vfrequency;vbwrongdimension;v²/(2b)distance,notduration.',
 'Quadruplicationisdistance;unchangedorhalfcontradictsinitialspeedincrease;negative timeoutsidefuturebranch.',
 '−bTisvelocitychange,notpositiveinitialspeed.',
 '−2isaccelerationcomponent,notrequestedpositiveb;bothcannotbeconfusedintheinverse.',
 '2reversesdependence,1ignoresbrakechange,1/4dividestwice,negative ratioviolatespositivedurations.',
 '−1reverseserror;0assumesproposalcorrect;+2repeatsproposal;+3doesnotfollowfrom2−1.',
 'T/bandb/Twrongdimensions;−bTnegative;unneededrootchangesdimension.',
 'Productandreciprocalignoredenominator;speedfactor²belongstodistance;sumfailsidentity.',
 '2/3inverse;3initialspeedonly;2brakingfactoronlyandwrongdirection;6multipliesfactorsinsteadofdividing.',
 '1and3/2individualtimes;5/2sum;4/3ratioofaveragedinputsnotmeanoutputs.',
 'Must solvebfromdesiredtime,notassignoutputfactorto input;resultb4ispositive,component−4.',
 'Rawcount9/2isnotduration;gainmustberemoved;nooffsetassumed.',
 'v2,3,6,8producecounts3,4,7,9;onlyv4produces5.',
 'One,two,threeorzero pairscontradictpositiveone-parameterfamily;dimensionalfactor1scannotbeomitted.',
]
ASSUMPTIONS=['Fixed inertial reference and same axis;initialv>0,deceleration magnitudeb>0 constant;componenta_x=−b. Time0isbrakingstart,firststoponly;no reactiontime.']*16
ASSUMPTIONS[11]='Equal statistical trial weights;compute each duration before averaging;do not averagev,bfirst.'
ASSUMPTIONS[13]='Positiveconstantgainwithdimension1/time,zerooffset;countdimensionless;calibrate before velocity reconstruction.'
ASSUMPTIONS[14]='Constantpositivegainandoffset;distinctreference durations1and3/2s;subtractoffsetfirst.'
ASSUMPTIONS[15]='Selectionconstraintv=(1s)bwithv,b>0;T1sredundant,not independent. Nounique numericalv,bclaimed.'
UNITS={n:'second' for n in range(1,17)}
UNITS.update({5:'meter/second',6:'meter/second**2',7:'dimensionless',9:'meter/second',10:'dimensionless',11:'dimensionless',13:'dimensionless',14:'meter/second',15:'meter/second',16:'dimensionless'})
NUMERIC_UNITS={1:'s',5:'m/s',6:'m/s²',13:'1',14:'m/s'}
OPTION_SUFFIX={8:' s',12:' s',15:' m/s'}


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
        source_id = f"u2-stopping-time-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent stopping-time conceptual key mismatch")
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
        if row["answer"]["type"] == "choice" and n in (7, 8, 11, 12, 15):
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
            "methods": ["independent_oriented_velocity_first_zero", "SymPy_unique_future_root_positive_pre_stop_velocity_and_redundant_constraint_rank",
                        "Pint_velocity_over_acceleration_and_inverse_time_gain", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "First stopping time under constant negative acceleration",
                   "reference": "Independently derived from all sixteen read statements; first zero of signed velocity,not post-stop extension"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"stopping-time-019.json").read_text()),
                    json.loads((args.directory/"stopping-time-019-bindings.json").read_text()), args.asset_root)
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
    changed["records"][0]["blocks"].append({"type": "text", "text": "Il tempo di arresto è negativo perché la componente di accelerazione è negativa."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false negative-duration proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_negative_stopping_time_proof_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][15]["blocks"].append({"type": "text", "text": "Il vincolo v=(1 s)b e il tempo1s determinano un’unica coppia positiva v=2,b=2."})
    links[15]["candidateSha256"] = digest(changed["records"][15])
    result = verify(changed, links, asset_root)[15]
    if result["ok"]:
        raise AssertionError("Plausible restored redundant-constraint explanation error escaped frozen reading")
    cases.append({"case": "correct_key_but_false_unique_redundant_constraint_rebound", "id": result["id"], "rejectedBy": result["errors"]})
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
