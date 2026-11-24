"""Separate reviewer: integrate constant acceleration, retaining initial velocity.

All sixteen candidate statements, choices and explanations were individually read
at159c3c79. No authoring imports or answer-key derivation from candidate fields.
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
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json"
CANDIDATE_REF="159c3c791029cd61c7f22fa6fd34559053edd235"
REVIEWED_PACKAGE_SHA256="c6fe1806cdd67af610e89ae69f79c8c04533eda458d690a76325582b4ba6efe3"
REVIEWED_BINDINGS_SHA256="560733ac76aa98c19794b04369ec63888cbe86a77ac2ab181526e7f17b10bc61"
EXPECTED_IDS={f"AR-u2-accelerated-final-speed-{n:02}"for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u2-accelerated-final-speed-01": "04f4a39e3a5825ac17ceea015004e65652d9fa3c407134a4b9934033f8fd5445",
    "AR-u2-accelerated-final-speed-02": "dcb68bfe8bec297c8bce67e1f7d27353d3a4f4d148617505890622a735f8f931",
    "AR-u2-accelerated-final-speed-03": "3c9456bae6844d56a9fe7fc2eae6c077206c00e87c8f26f7edbbc2ce3e720138",
    "AR-u2-accelerated-final-speed-04": "0a35881233bbb8e5841935cb482ee9aa705b48a5c3ec7376494e44b676ec928f",
    "AR-u2-accelerated-final-speed-05": "c046f33600db03b156f6d96a8c1ff54e8efaf5244876890879008f1236a83cc4",
    "AR-u2-accelerated-final-speed-06": "1fb502e91e68269bb655d718c30309cea5ec4ed7b056d0487bf97e1d7d0eaa23",
    "AR-u2-accelerated-final-speed-07": "18462a653a45d1f01c6e129785a6b176e30f1d18b594e633c65a5ba77e632672",
    "AR-u2-accelerated-final-speed-08": "5c94adcc6361dc44e622586ee409199b68aad9e0a9366e61a86cfcd2f7723ac4",
    "AR-u2-accelerated-final-speed-09": "739d64ef507c2701dc54aced410b058a2768c30fb5cfd24ca5e2923d7e733417",
    "AR-u2-accelerated-final-speed-10": "12103de299024fe40d3249252833d266c11efa8ddc6f860ae4d0b5f03ed77665",
    "AR-u2-accelerated-final-speed-11": "0cc005b8304817a6a7a4ec8bd3e7246e5c308e500e5e6202258a440344e87e1b",
    "AR-u2-accelerated-final-speed-12": "090ff3123ddd93e7683355afb85d4b12eb134dd0ee95e9e350f98b0a088a6389",
    "AR-u2-accelerated-final-speed-13": "0e7aa6af6290f8c6ec4771f00a810c4ab93b34bdba0d27ee33d2714c5bdb6629",
    "AR-u2-accelerated-final-speed-14": "2b6b77b06cc5cb74076f63b340d8fdcb16da64a07b69efdab65cb47e862a761c",
    "AR-u2-accelerated-final-speed-15": "705a4b5717016105a31f20591beb850c1a2e0e144240b2c126d8b3d733ff9417",
    "AR-u2-accelerated-final-speed-16": "a01567f9ac30b89461ad666c4978634192b0768e0090ca42b864c67d3b482495",
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}


def final_component(initial,acceleration,duration):
    tau=sp.Symbol("tau",real=True)
    return sp.sympify(initial)+sp.integrate(sp.sympify(acceleration),(tau,0,duration))


def oracle():
    v0,a,t,k1,k2,b=sp.symbols("v0 a t k1 k2 b",positive=True)
    V=sp.Symbol("V",real=True)
    tau=sp.Symbol("tau",real=True)
    law=final_component(v0,a,t)
    if sp.diff(law,t)!=a or law.subs(t,0)!=v0:
        raise ValueError("Independent constant-acceleration integration failed")
    inverse_initial=sp.solve(sp.Eq(V,law),v0)[0]
    inverse_time=sp.solve(sp.Eq(V,law),t)[0]
    scaling=sp.cancel(law.subs({v0:k1*v0,t:k2*t},simultaneous=True)/law)
    if sp.simplify(scaling-(k1*v0+a*k2*t)/(v0+a*t))!=0:
        raise ValueError("Independent additive scaling failed")
    first=final_component(2,2,2);second=final_component(4,2,4)
    units_final=SI.Quantity(2,"meter/second")+SI.Quantity(2,"meter/second**2")*SI.Quantity(2,"second")
    if units_final.to("meter/second").magnitude!=first:
        raise ValueError("Independent integrated velocity units failed")
    gain=SI.Quantity(18,"")/SI.Quantity(int(first),"meter/second")
    initial_calibrated=(SI.Quantity(36,"")/gain-SI.Quantity(2,"meter/second**2")*SI.Quantity(4,"second")).to("meter/second").magnitude
    g,offset=sp.symbols("g offset",real=True)
    calibration=sp.solve([sp.Eq(g*first+offset,13),sp.Eq(g*second+offset,25)],(g,offset))
    affine_final=(17-calibration[offset])/calibration[g]
    if gain.to("second/meter").magnitude!=3:
        raise ValueError("Independent display gain units failed")
    # Across-trial v0=b*T does not change the within-trial acceleration a.
    selected_profile=b*t+a*tau
    if sp.diff(selected_profile,tau)!=a:
        raise ValueError("Trial selection was confused with instantaneous acceleration")
    constrained=sp.solve(sp.Eq(selected_profile.subs(tau,t).subs({a:2,b:1}),6),t)[0]
    return [first,"m/s","V=v₀+at","Aumenta da 6 a 8 m/s",
            inverse_initial.subs({V:6,a:2,t:2}),inverse_time.subs({V:6,v0:2,a:2}),
            final_component(2,2,4)/first,12-first,"v₀=V−at","(κ₁v₀+aκ₂t)/(v₀+at)",
            second/first,(first+second)/2,sp.solve(sp.Eq(final_component(4,2,t),2*first),t)[0]/2,
            sp.Rational(initial_calibrated),affine_final-2*2,constrained]

MANUAL=[
 "initial2m/s plus integral of constant2m/s² over2s gives2+4=6m/s;endpoint height,not area",
 "(m/s²)s=m/s;only quantities with velocity dimension may be added",
 "integrate dv/dt=a constant withv(0)=v0;V=v0+at;at t0 initial velocity is retained",
 "same increment4m/s:2+4=6 and4+4=8;ratio4/3,not2",
 "initial=final6−increment4=2m/s;check2+4=6",
 "time=(6−2)m/s divided by2m/s²=2s;V≥v0 needed for future time whena>0",
 "final6m/s at2s,10m/s at4s;ratio10/6=5/3,not increment ratio2",
 "correct final6m/s;proposed12−correct6=+6m/s,not acceleration or dimensionless ratio",
 "subtract the sameat from both sides;initialV−at;requiresV>at forpositive initial",
 "new sumκ₁v0+aκ₂t overold sumv0+at;common factorκ gives ratioκ whenκ₁=κ₂=κ",
 "two addends both double:final6 then12m/s;ratio2,not product4",
 "mean final velocities(6+12)/2=9m/s;equal statistical weights;not within-trip mean velocity",
 "target12m/s frominitial4m/s needsincrement8;at2m/s² duration4s;ratio4/2=2",
 "gain18/(6m/s)=3s/m;36/gain=12m/s;initial12−2·4=4m/s",
 "gain12/(6m/s)=2s/m,offset1;final(17−1)/gain=8m/s;initial8−4=4m/s",
 "trial selectionv0=(1m/s²)T;endpoint=(1+2)m/s²·T=6m/s;T=2s,initial2m/s;within-trial acceleration remains2",
]
DISTRACTORS=[
 "at alone gives increment4,not final6;spatial displacement would be area under velocity,not endpoint",
 "m length;m/s² acceleration before time multiplication;kg mass;s duration",
 "a/t isL/T³ andundefined att0;at omits initial;half-sum is not endpoint;minus corresponds toopposite acceleration",
 "doubling one addend does not double sum;unchanged/decreasing/zero contradictpositive increment ofinitial",
 "adding4to6 givesinitial10,which predictsfinal14 rather than6",
 "V/a=3s ignoresinitial;negative future duration inadmissible iftarget belowinitial fora>0",
 "2 compares durations/increments;3/5 inverse;5/6 half ofcorrect;10/3 twicecorrect",
 "−6 reverses subtraction;12 repeats proposal;5and7 are not12−6;ratio2 is a differentdimensionless quantity",
 "plus adds increment twice;V/(at) dimensionless;half adds unsupported factor;at−V wrongsign",
 "product treats sum as product;sumκ₁+κ₂ fails atidentity;minus reverses acceleration;double denominator halvesratio",
 "4 multiplies two factors acting onaddends;12 is final second velocity,not ratio",
 "18 is sum;9/2 divides twice;8and10 are nothalf-sum;allnumeric optionsdistinct",
 "time fromtarget minusnew initial divided bya;scaling onlytime doesnot scale the whole final velocity",
 "counts notm/s;gain removal before subtracting physical increment;positive recoveredinitial checked",
 "8 is final notinitial;initial2 reusesreference;initial3and5 reconstructcounts15and19,not17",
 "T4,1,3 givefinal12,3,9;negativeT excluded;coefficient1m/s² selectsinitial,not an added instantaneous acceleration",
]
ASSUMPTIONS=["Fixed oriented axis in one inertial frame;constant positive acceleration+2m/s² throughout each trial;positive initial component;elapsed duration nonnegative"]*16
ASSUMPTIONS[9]="Same acceleration in both trials;positive initial velocity,time,and scale factors;initial final velocity is nonzero so ratio defined"
ASSUMPTIONS[11]="Two distinct trials,equal statistical weights and common acceleration;mean of final readings,not time average within a trial"
ASSUMPTIONS[15]="DurationT>0 selects initialv0=(1m/s²)T before trial;during trial initial datum fixed and acceleration+2m/s² constant"
UNITS={n:"meter/second"for n in range(1,17)}
UNITS.update({6:"second",7:"dimensionless",10:"dimensionless",11:"dimensionless",13:"dimensionless",16:"second"})
NUMERIC_UNITS={1:"m/s",5:"m/s",6:"s",11:"1",13:"1",14:"m/s"}
OPTION_SUFFIX={8:" m/s",12:" m/s",15:" m/s",16:" s"}


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
        source_id = f"u2-accelerated-final-speed-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent constant-acceleration conceptual key mismatch")
        else:
            try:
                raw = str(value).replace("−", "-")
                if n in OPTION_SUFFIX:
                    suffix = OPTION_SUFFIX[n]
                    if not raw.endswith(suffix):
                        raise ValueError("Missing physical unit in option")
                    raw = raw.removesuffix(suffix)
                if len(raw) > 80 or sp.Rational(raw) != sp.Rational(wanted):
                    errors.append("Independent integrated-velocity/SI result mismatch")
            except (ValueError, TypeError):
                errors.append("Independent exact answer or physical unit invalid")
        if row["answer"]["type"] == "numeric" and row["answer"].get("unit") != NUMERIC_UNITS.get(n):
            errors.append("Independent numeric physical unit mismatch")
        if row["answer"]["type"] == "choice" and n in (7, 8, 12, 15, 16):
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
            "methods": ["SymPy_integral_of_constant_acceleration_and_initial_condition",
                        "Pint_exact_velocity_and_display_gain_dimensions", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Final component from constant acceleration with initial velocity",
                   "reference": "Independently integrated constant acceleration from each read statement; selected initial condition separated from within-trial acceleration"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"accelerated-final-speed-014.json").read_text()),
                    json.loads((args.directory/"accelerated-final-speed-014-bindings.json").read_text()), args.asset_root)
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
        oracle_errors = [e for e in result["errors"] if "conceptual key" in e or "integrated-velocity/SI result" in e]
        if result["ok"] or not oracle_errors:
            raise AssertionError("Rebound, retokenized wrong key escaped independent oracle: "+row["id"])
        cases.append({"case": "wrong_key_rebound_and_all_edition_tokens_replaced", "id": row["id"], "rejectedBy": oracle_errors})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][0]["blocks"].append({"type": "text", "text": "La velocità iniziale non deve essere sommata: V=at è già la velocità finale."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false omission of initial velocity escaped frozen reading")
    cases.append({"case": "correct_key_but_false_omission_of_initial_velocity_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][7]["blocks"].append({"type": "text", "text": "Lo scarto proposto meno corretto coincide sempre con la proposta, indipendentemente dal valore corretto."})
    links[7]["candidateSha256"] = digest(changed["records"][7])
    result = verify(changed, links, asset_root)[7]
    if result["ok"]:
        raise AssertionError("Plausible false ID08 error rationale escaped frozen reading")
    cases.append({"case": "correct_key_but_false_error_rationale_rebound", "id": result["id"], "rejectedBy": result["errors"]})
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
