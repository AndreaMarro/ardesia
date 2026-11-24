"""Independent oracle for sixteen read equal-duration mean-velocity candidates.

No authoring import. Signatures are installed only after the separate author
corrects findings and the reviewer rereads the affected candidate bytes.
"""
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
CANDIDATE_REF='8b894b2ccf529020dc37c14ce5e9669e2c730af7'
REVIEWED_PACKAGE_SHA256='ead2127fb4338f8d0dd93c0859e9b70fb095118b6c87a770ff9ce3e99dc54175'
REVIEWED_BINDINGS_SHA256='beffb9ca1ccf6c8c2cd066d525c55a393d5398101e2bb48ea57701fd942c8e05'
EXPECTED_IDS={f'AR-u2-equal-time-average-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={'AR-u2-equal-time-average-01': '7844fe4029c456c1a774a66c56c121d49e6c684d8c65f0d0c1055b21bce21193', 'AR-u2-equal-time-average-02': '7fe7c6dc226b97afade09d5b2b6ad97dacadd4c86121a239b4a1ebd0f58f0547', 'AR-u2-equal-time-average-03': '4a8fb76afd56505a9e2bfa5ca94e51581a9022b2d8938b6a89b8fc6b659041b1', 'AR-u2-equal-time-average-04': 'edf33a4dd0cdfb1487ad2e27e7745d5bee643dcd9d4361a3b010ae59511609cf', 'AR-u2-equal-time-average-05': '9e958c4899d7852f538a78cb37990bb38ccab3a3f10b91d59da95514deca6a70', 'AR-u2-equal-time-average-06': '5a925bceea6069bfb77cdfca830db83b4b1b162bece7a3b99665f28cc8c82bd9', 'AR-u2-equal-time-average-07': '98c584160ba2d8f4e9f87acdb00a5b475e431150e2fbe75be4b42f1136e1286a', 'AR-u2-equal-time-average-08': '7089da190b574416a6889c6b513073546a8a45fb8edd937ad5cc63e2c50fce03', 'AR-u2-equal-time-average-09': '022106d9050d228156dbf4abcda275833e34d9ee4f58e3f19922b3c48a86f7c3', 'AR-u2-equal-time-average-10': '3ed153bfe1b03204b772674b9833290f3010c71d2406b5523f7df0af09b83ed6', 'AR-u2-equal-time-average-11': '3ee1f9bf600839d0f892a4824013cff2c21efa999bd324523c530ad2d6017edf', 'AR-u2-equal-time-average-12': '69fb449c651d201e074c936c0013ae19dd6934585178ee44f232aee8637466b9', 'AR-u2-equal-time-average-13': 'bafc9cbfa7e94fe38af572b9c4c40bf7b1399367f19186627e273fa53b2ca1b8', 'AR-u2-equal-time-average-14': '8a44b2297ac50641d532b8509eb038151dbacd6c34cd02abd683f7fe84386b05', 'AR-u2-equal-time-average-15': '321f2829a32905583173068c14942ecda7bcc55485d1324e4e9bbfe30e69a1cd', 'AR-u2-equal-time-average-16': '5c2e18cd054e362b7cfdf0a3b1f61bdba60888a716072ac878d03857a2a420b6'}

@lru_cache(maxsize=1)
def source_records():
    return {r['id']:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def mean(v1,v2):
    return sp.cancel((sp.Rational(v1)+sp.Rational(v2))/2)

def oracle():
    # Signed displacement is integrated separately on each time interval.
    v1,v2,V=sp.symbols('v1 v2 V',real=True)
    tau=sp.symbols('tau',positive=True)
    k1,k2=sp.symbols('k1 k2',positive=True)
    t=sp.symbols('t',real=True)
    displacement=sp.integrate(v1,(t,0,tau))+sp.integrate(v2,(t,tau,2*tau))
    model=sp.simplify(displacement/(2*tau))
    assert sp.simplify(model-(v1+v2)/2)==0
    inverse=sp.solve(sp.Eq(V,model),v1)[0]
    scaled=sp.cancel(model.subs({v1:k1*v1,v2:k2*v2},simultaneous=True)/model)
    assert sp.simplify(scaled-(k1*v1+k2*v2)/(v1+v2))==0
    # Counterexample: duration equality does not make distance equality.
    second_distance=SI.Quantity(6,'m/s')*SI.Quantity(1,'s')
    total_distance=SI.Quantity(2,'m/s')*SI.Quantity(1,'s')+second_distance
    distance_share=(second_distance/total_distance).to('').magnitude
    assert Fraction(distance_share)==Fraction(3,4)
    # ID08 uses subinterval means, so constant instantaneous velocities are
    # unnecessary. These continuous histories have means +2 and -2 and join.
    profile1=4*(1-t/tau)
    profile2=-4*(t-tau)/tau
    assert sp.integrate(profile1,(t,0,tau))/tau==2
    assert sp.integrate(profile2,(t,tau,2*tau))/tau==-2
    assert sp.simplify(profile1.subs(t,tau)-profile2.subs(t,tau))==0
    signed=(sp.integrate(profile1,(t,0,tau))+sp.integrate(profile2,(t,tau,2*tau)))/(2*tau)
    assert sp.simplify(signed)==0
    # Same opposite component data, nonzero path; all-zero components remain
    # the distinct limiting case with zero mean speed (the author finding).
    assert mean(2,-2)==0 and (abs(2)+abs(-2))/2==2
    assert mean(0,0)==0 and (abs(0)+abs(0))/2==0
    g,c=sp.symbols('g c',real=True)
    calibration=sp.solve([sp.Eq(g*mean(2,2)+c,5),sp.Eq(g*mean(4,4)+c,9)],(g,c))
    recovered=(7-calibration[c])/calibration[g]
    gain=SI.Quantity(6,'')/SI.Quantity(2,'m/s')
    recovered_units=(SI.Quantity(12,'')/gain).to('m/s').magnitude
    assert gain.to('s/m').magnitude==3 and recovered_units==4
    return [mean(2,2),'m/s','V=(v₁+v₂)/2','Passa da 2 a 3 m/s',
        inverse.subs({V:2,v2:2}),sp.Rational(distance_share),mean(2,4)/mean(2,2),
        2-mean(2,-2),'v₁=2V−v₂','(κ₁v₁+κ₂v₂)/(v₁+v₂)',
        mean(4,4)/mean(2,2),(mean(2,2)+mean(4,4))/2,
        sp.solve(sp.Eq(mean(2,2)*2,(4+v2)/2),v2)[0]/2,
        inverse.subs({V:sp.Rational(recovered_units),v2:4}),inverse.subs({V:recovered,v2:2}),
        sp.solve(sp.Eq(V,v2),v2)[0].subs(V,2)]

MANUAL=[
 'Displacements2τ and2τ, elapsed2τ:4τ/(2τ)=2m/s; denominator is total time.',
 'Each velocity hasL/T; division by the dimensionless count2 preservesL/T.',
 'Signed incrementsv1τ+v2τ divided by2τ give(v1+v2)/2; mean speed uses absolute path. For(2,−2) velocity0,speed2; for(0,0) both0.',
 '(2+2)/2=2 and(4+2)/2=3m/s; one addend increases2 and weighs1/2.',
 '2V=v1+v2;v1=2V−v2=4−2=2m/s; condition2V>v2.',
 'Second distance6τ,total8τ;6/8=3/4. Time share1/2 and distance share3/4 are different.',
 'Two mean velocities2 and3m/s; ratio3/2,not ratio of second velocities4/2.',
 'Equal durations and means+2,−2 give displacement2τ−2τ=0; proposal+2 minus0 gives+2m/s. No assumption of an instantaneous turn.',
 'Multiply the mean equation by2,then subtractv2: v1=2V−v2; reconstruct meanV.',
 'Common1/2 cancels: new/old=(k1v1+k2v2)/(v1+v2),positive denominator on the stated domain.',
 'Means2 and4m/s; ratio4/2=2. Two doubled addends do not produce factor4.',
 'Mean of trial means(2+4)/2=3m/s. Equal trial weights explicitly separate from equal within-trial durations.',
 'Target mean4requires sum8;newv2=8−4=4m/s;ratio4/2=2.',
 'Reference mean2,g=6/2=3s/m;S12 givesV4m/s;v1=2·4−4=4m/s.',
 'Reference means2and4;g=(9−5)/(4−2)=2s/m,c1;V=(7−1)/2=3m/s;v1=6−2=4m/s.',
 'v1=v2 makes meanv2;thereforev2=2m/s. Without equalityv1+v2=4 has many positive pairs.',
]
DISTRACTORS=[
 '4m/s omits the doubled elapsed duration; mean speed equals component mean here only because velocity stays positive.',
 'm length,s time,m/s² acceleration,1dimensionless; count2 is not2s.',
 'Absolute values compute speed,not oriented velocity; unhalved sum doubles weight; subtraction reverses second component;Pythagoras does not combine time intervals.',
 'Doubling only first addend gives3not4;6is unweighted sum;unchanged/half contradict input increase.',
 'Inverse must remove division before known addend; positive branch requires2V>v2.',
 '1/4 first share;1/2 time share;3 and1/3 compare the two distances instead of second/total.',
 '2 compares second speeds,2/3 reverses ratio,1/2 relative increase rather than final/initial,3is dimensioned new mean.',
 '−2 reverses error order;0 treats proposalasright;+4 and+1 do not equal2−0. Taking moduli of the means gives2but discards return.',
 'V−v2 misses2;2V+v2 adds known term;extra division wrong;Vv2 dimensionvelocitysquared.',
 'k1k2 failscommon doubling;k1+k2 failsidentity;minus changes physical second direction;unweighted factor mean only whenv1=v2.',
 'Product of factors4 is inappropriate for a sum;4m/s is new mean,not the dimensionless ratio2.',
 '2and4 are individual trialmeans;6misses division;3/2divides twice.',
 'Need solve the new sum; merely assigning output factor to one input is not generally valid.',
 'Counts need conversion by gain; do not combine raw12 with4m/s.',
 'Optionsv1=2,3,6,8 reconstructS5,6,9,11 respectively;only4gives7. V3is intermediate,notv1.',
 '1halves twice;4omits division;0and−2 violate positive means. Constraint eliminates prior nonuniqueness.',
]
ASSUMPTIONS=['Same axis; positive elapsed equal intervals. Constant components on each interval; no mixing spatial and temporal weights.']*16
ASSUMPTIONS[2]='Real signed components,possibly zero;common positive duration. Opposite nonzero velocities give positive speed,while all-zero gives zero speed.'
ASSUMPTIONS[5]='Positive constant2and6m/s on equal durationsτ>0;distance equals positive displacement,second distance divided by total.'
ASSUMPTIONS[7]='Subinterval oriented mean velocities+2and−2on equalτ>0;possibly variable internal motion. Proposal2minus correct0defines signed error.'
ASSUMPTIONS[8]='v1,v2positive and2V>v2;time equality,not distance equality.'
ASSUMPTIONS[9]='Positive constant components and factors;positive denominatorv1+v2;equal within-trial durations in each trial.'
ASSUMPTIONS[11]='Two levels of equal statistical weighting specified;mean of trial means.'
ASSUMPTIONS[13]='Constant positive displaygain,zerooffset,dimensionlesscounts;Vdefinedasmean;positiveconstantcomponentsonequalintervals.'
ASSUMPTIONS[14]='Fixed positivegain andconstantoffset;subtractoffsetbeforeconversion;Vdefinedasmean;positiveconstantcomponentsonequalintervals.'
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
        source_id = f"u2-equal-time-average-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent equal-time conceptual key mismatch")
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
            "methods": ["independent_signed_time_interval_displacements", "SymPy_equal_duration_integrals_and_continuous_opposite_mean_histories",
                        "Pint_equal_time_distance_share_and_inverse_velocity_gain", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Equal-duration oriented mean velocities and distance fractions",
                   "reference": "Independently derived from all sixteen read statements; equal elapsed durations, signed displacement and continuous opposite-mean histories"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"equal-time-average-017.json").read_text()),
                    json.loads((args.directory/"equal-time-average-017-bindings.json").read_text()), args.asset_root)
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
    changed["records"][0]["blocks"].append({"type": "text", "text": "Intervalli di uguale durata hanno sempre distanze uguali anche se le velocità sono diverse."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false equal-distance proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_equal_distance_proof_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][2]["blocks"].append({"type": "text", "text": "Se entrambe le componenti sono zero la rapidità media è strettamente positiva."})
    links[2]["candidateSha256"] = digest(changed["records"][2])
    result = verify(changed, links, asset_root)[2]
    if result["ok"]:
        raise AssertionError("Plausible restored zero-speed explanation error escaped frozen reading")
    cases.append({"case": "correct_key_but_false_positive_speed_at_zero_rebound", "id": result["id"], "rejectedBy": result["errors"]})
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
