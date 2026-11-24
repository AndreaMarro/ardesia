"""Independent first-stop distance oracle: integrate positive pre-stop velocity."""
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
CANDIDATE_REF='4f40c6017d0193cd1ddd9a924a34df43361fc139'
REVIEWED_PACKAGE_SHA256='6268f5f1ecc45bc1213c337821a313f5d5c0f76f7c6d2631f285ad11378c6ef3'
REVIEWED_BINDINGS_SHA256='bb33d9232024deb6de391deaa21ada2ecb9b6016187c655e308a0a47a5b9275c'
EXPECTED_IDS={f'AR-u2-stopping-distance-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={'AR-u2-stopping-distance-01': '49f378c97081c139f843f9dc33b974c166e3eae5d75cc96896c011a36fd5ad1a', 'AR-u2-stopping-distance-02': 'e0594fdcc7a05fa4e4174174867406a0cd0be59909d524eca8e349c002672fea', 'AR-u2-stopping-distance-03': '14374ee7afa6338fa2f711a125bdc96fa36f85c738c8652441d5f43d3295a090', 'AR-u2-stopping-distance-04': '19a1842c45162ae4c6dafb49c6c0f25fd61a1ebecc9b3c3dfde6c113311c66d3', 'AR-u2-stopping-distance-05': '081a862c05e261d3de8f3e1a1678f1eea614f8ac46f6b40ac81d356f6499ad41', 'AR-u2-stopping-distance-06': '5793c6f5a89948477f90ff69ebaf20ed293767dfb15d861c7df01a390d64a2d0', 'AR-u2-stopping-distance-07': '76b7ab306133d360f1c68c81da5404e98c55a5ede36bd24441a1a9ac4ce22c51', 'AR-u2-stopping-distance-08': '4b1a0eeb710f4cb52a259fb49f87bfac3e1096987382d7c72f3d6995332a02fb', 'AR-u2-stopping-distance-09': '69a7b2a58d98a7641e48b0f7237078bc0439e47be57751db94748f35c1fc19b0', 'AR-u2-stopping-distance-10': 'd5d51614a717191a4e61988e8d0b29f3a3b36e2c946747c3711a82c5514d42a8', 'AR-u2-stopping-distance-11': 'ddbec33f8174ee8645553cb2a7da244e1602daae680309f1afb714f6dd5a5e4b', 'AR-u2-stopping-distance-12': 'aea1302f19157cda503f103da143981e8e2d7d9d22aab9a5314cc482190b6428', 'AR-u2-stopping-distance-13': 'cbc8676cff490999e39a1499791473e10ce1c93f70f017957e5002c569c02df7', 'AR-u2-stopping-distance-14': 'c9c3efb20045b0e16c1b6e3bfa519844bcff539212333af57461f4d37e169680', 'AR-u2-stopping-distance-15': 'a20397056fe9880963083851decc814d365039bc1a13b5faef7911a783e19dd9', 'AR-u2-stopping-distance-16': '0bf2deb53601bd73f579d6182f885c1a6a9b866f7507791ef74fa5d2433d356a'}

@lru_cache(maxsize=1)
def source_records():
    return {r['id']:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def braking_distance(v,b):
    return sp.Rational(v)**2/(2*sp.Rational(b))

def oracle():
    v,b,D,c,k1,k2,z=sp.symbols('v b D c k1 k2 z',positive=True)
    t=sp.symbols('t',nonnegative=True)
    u=v-b*t
    stop=sp.solve(sp.Eq(u,0),t)[0]
    before=sp.factor(u.subs(t,stop/(1+z)))
    assert before.is_positive
    model=sp.integrate(u,(t,0,stop))
    assert sp.simplify(model-v**2/(2*b))==0
    position=sp.integrate(u,(t,0,t))
    assert sp.simplify(u**2-v**2+2*b*position)==0
    assert sp.simplify(v*stop/2-model)==0
    inverse_b=sp.solve(sp.Eq(D,model),b)[0]
    w=sp.symbols('w',real=True)
    roots=sp.solve(sp.Eq(w*w,2*b*D),w)
    positive_root=next(root for root in roots if root.is_positive)
    assert len(roots)==2 and sp.simplify(positive_root-sp.sqrt(2*b*D))==0
    scale=sp.cancel(model.subs({v:k1*v,b:k2*b},simultaneous=True)/model)
    assert sp.simplify(scale-k1**2/k2)==0
    assert sp.simplify(model.subs({v:k1*v,b:k1*b},simultaneous=True)-k1*model)==0
    # Unit checks preserve the square before taking an exact positive root.
    initial=SI.Quantity(2,'m/s')**2/(2*SI.Quantity(2,'m/s**2'))
    assert initial.to('m').magnitude==1
    gain=SI.Quantity(3,'')/initial
    reconstructed=(SI.Quantity(6,'')/gain).to('m')
    radicand=(2*SI.Quantity(4,'m/s**2')*reconstructed).to('m**2/s**2').magnitude
    assert gain.to('1/m').magnitude==3 and radicand==16
    first,second=braking_distance(2,2),braking_distance(4,4)
    assert (braking_distance(2,2)+braking_distance(4,2))/2==sp.Rational(5,2)
    assert braking_distance(3,2)==sp.Rational(9,4)
    g,offset=sp.symbols('g offset',real=True)
    cal=sp.solve([sp.Eq(g*first+offset,3),sp.Eq(g*second+offset,5)],(g,offset))
    unknown_D=(9-cal[offset])/cal[g]
    constrained_model=sp.simplify(model.subs(v,c*b))
    constrained_b=sp.solve(sp.Eq(D,constrained_model),b)[0]
    assert sp.simplify(constrained_b-2*D/c**2)==0
    independent_jac=sp.Matrix([v-c*b,model-D]).jacobian([v,b])
    assert sp.simplify(independent_jac.det().subs(v,c*b)-c**2/2)==0
    constrained_unit_b=(2*SI.Quantity(1,'m')/SI.Quantity(1,'s')**2).to('m/s**2').magnitude
    return [first,'m','D=v²/(2b)','Quadruplica da 1 m a 4 m',
        positive_root.subs({b:2,D:1}),inverse_b.subs({v:2,D:1}),braking_distance(2,4)/first,
        2-first,'v=√(2bD)','κ₁²/κ₂',second/first,(first+second)/2,
        sp.solve(sp.Eq(braking_distance(2,2)*2,4**2/(2*b)),b)[0]/2,
        sp.sqrt(sp.Rational(radicand)),positive_root.subs({b:2,D:unknown_D}),sp.Rational(constrained_unit_b)]

MANUAL=[
 'FirststopT=2/2=1s. Positive velocity area triangle(2m/s)(1s)/2=1m,notrectangle2m.',
 '(m/s)²/(m/s²)=m;dimensionL. Coefficient2dimensionless.',
 'Integrateu=v−btfrom0toT=v/b,oruseaveragev/2timesT;bothgivev²/(2b).',
 'Speed2→4andb2fixed:baseT1→2s,height2→4m/s;trianglearea1→4m.',
 'v²=2bD=2·2·1=4m²/s²;positive rootv2m/s,negative rootexcluded.',
 'b=v²/(2D)=4/(2·1)=2m/s²;componenta_x=−2m/s².',
 'D1=1m,D2=4/(2·4)=1/2m;ratio1/2atfixedspeed.',
 'CorrectD1m,proposal2m;error+1m. RectanglevTistwicepropertriangle.',
 'v=positive√(2bD)fromv²=2bD;radicanddimensionL²/T².',
 'Newdistance/old=(k1v)²/(2k2b) dividedbyv²/(2b)=k1²/k2.',
 'D1=1m,D2=16/(2·4)=2m;ratio2. Bothstop times1s,butdifferentaveragevelocities.',
 'Outputmean(1+2)/2=3/2m. Meaninputsv3,b3alsogive3/2herebecauseproportionalpairs,notgeneral linearity.',
 'Targetdistance2m,newv4;newb=16/(2·2)=4m/s²;factor4/2=2.',
 'ReferenceD1,g3m⁻¹;S6givesD2m;radicand2·4·2=16m²/s²;v4m/s.',
 'ReferenceD1and2,g2m⁻¹,offset1;D=(9−1)/2=4m;radicand2·2·4=16;v4m/s.',
 'v=cb,c1s;D=c²b/2. Thusb=2D/c²=2m/s²,v2m/s,T1s. Distanceaddsindependentscale,unliketime-onlyconstraint.',
]
DISTRACTORS=[
 '2musesrectanglewithinitialspeedthroughout;reactiondistanceexcluded;no post-stopreturn added.',
 'm²failscancelone length;m/svelocity,stime,m/s²acceleration.',
 'v²/btwicecorrect;2v²/bfourtimescorrect;v/(2b)time;b/(2v²)inverse length.',
 'Doublingtimealone doesnotgivedoublingdistance;8maddsomittedtrianglefactor;unchanged/halfcontradictsquadratic speed.',
 '−2algebraicrootnotpositivespeed;rootisunapproximatedperfectsquare.',
 'Negativeaccelerationcomponentcannotreplacepositivebindenominatorwithoutchangingconvention.',
 '1/4squaresbincorrectly;2reversesdependence;1ignoreschange;negativerationotpositive distances.',
 '−1reverseserror;0assumesrectangleright;+2repeatsproposal;+3notdifference.',
 '2bDissquaredspeed;negative rootexcluded;√bDmisses2;√(2D/b)time,notvelocity.',
 'k1/k2is stopping-timefactor;productorpositivek2power reversesbrakingeffect;reciprocalinvertscomparison.',
 '4speed-squareonly;1/2brakeonly;sametime doesnotimplysamepathwhenspeedsdiffer.',
 '1and2singleoutputs;3sum;9/4mixesmeanv3withfirstb2. Nonproportionalcounterexampleoutputmean5/2versusmeaninput9/4.',
 'Brakingfactor4wouldkeepdistance1;unchangedbrakewouldgivedistance4;requiredfactor2.',
 'Raw6iscountnotmetres;onlyaftergaincorrectionradicand16givesexact4.',
 'v2givescount3;v3count11/2;v6count19;v8count33;onlyv4gives9.',
 'b1,4,8giveD1/2,2,4munderconstraint;negativebviolatesmodulus. FixedDrestoresuniquescale.',
]
ASSUMPTIONS=['Same axis,initialv>0;constantnegativecomponenta_x=−bwithb>0,onlyuntilfirststop;velocitynonnegativebeforestop,sopath equalspositive displacement. Reactionexcluded.']*16
ASSUMPTIONS[4]='D,bpositive,nonzero initialspeed;choosepositiverootofv²=2bD,notnegativecomponent.'
ASSUMPTIONS[8]='D,b>0;positive initial speed branch and rootunits.'
ASSUMPTIONS[11]='Equal trial weights;proportionalpairscoincidewithmeaninputevaluationonlyhere;lawgenerallynonlinear.'
ASSUMPTIONS[13]='Positivefixedgainwithdimensioninverse length,zerooffset;counttophysicaldistancebeforepositiveroot.'
ASSUMPTIONS[14]='Fixedpositivegainandoffset;subtractoffset,dividebygain,thenpositiveroot.'
ASSUMPTIONS[15]='v=(1s)bselectspositivetrials;D1maddsindependentconstraint,fullrank2;T1semergesafterbdetermined.'
UNITS={n:'meter' for n in range(1,17)}
UNITS.update({5:'meter/second',6:'meter/second**2',7:'dimensionless',9:'meter/second',10:'dimensionless',11:'dimensionless',13:'dimensionless',14:'meter/second',15:'meter/second',16:'meter/second**2'})
NUMERIC_UNITS={1:'m',5:'m/s',6:'m/s²',11:'1',13:'1',14:'m/s'}
OPTION_SUFFIX={8:' m',12:' m',15:' m/s',16:' m/s²'}


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
        source_id = f"u2-stopping-distance-{n:02}"
        if (binding.get("sourceId") != source_id or binding.get("sourceRef") != SOURCE_REF
                or binding.get("sourceSha256") != digest(originals[source_id])):
            errors.append("Independent pinned Git source binding mismatch")
        wanted, value = answers[n-1], row["answer"]["value"]
        if isinstance(wanted, str):
            if value != wanted:
                errors.append("Independent stopping-distance conceptual key mismatch")
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
            "methods": ["independent_integrated_pre_stop_velocity_and_triangle_area", "SymPy_positive_inverse_square_root_quadratic_scaling_and_full_rank_distance_constraint",
                        "Pint_squared_velocity_over_acceleration_and_inverse_length_gain", "separate_statement_assumption_and_distractor_review"],
            "humanApproval": "NOT_RUN", "publication": "DRAFT"})
    return results


def report(package, bindings, asset_root=None):
    return {"schemaVersion": "1.0.0", "records": verify(package, bindings, asset_root),
        "verifierSha256": sha(Path(__file__).read_bytes()), "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
        "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
        "reviewer": "separate_AI_reviewer_not_candidate_author", "humanApproval": "NOT_RUN", "publication": "DRAFT",
        "reviewedCandidateCommit": CANDIDATE_REF, "packageSha256": digest(package), "bindingsSha256": digest(bindings),
        "source": {"commit": SOURCE_REF, "path": SOURCE_PATH, "title": "Distance until first stop under constant negative acceleration",
                   "reference": "Independently derived from all sixteen read statements; integrate nonnegative velocity only up to first zero,exclude reaction distance"}}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = report(json.loads((args.directory/"stopping-distance-020.json").read_text()),
                    json.loads((args.directory/"stopping-distance-020-bindings.json").read_text()), args.asset_root)
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
    changed["records"][0]["blocks"].append({"type": "text", "text": "La distanza si calcola con il rettangolo vT perché la velocità iniziale vale v."})
    links[0]["candidateSha256"] = digest(changed["records"][0])
    result = verify(changed, links, asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Plausible false rectangle-area proof escaped frozen reading")
    cases.append({"case": "correct_key_but_false_rectangle_braking_distance_rebound", "id": result["id"], "rejectedBy": result["errors"]})
    changed, links = deepcopy(package), deepcopy(bindings)
    changed["records"][15]["blocks"].append({"type": "text", "text": "Il vincolo v=(1 s)b e la distanza1m lasciano infinite coppie positive."})
    links[15]["candidateSha256"] = digest(changed["records"][15])
    result = verify(changed, links, asset_root)[15]
    if result["ok"]:
        raise AssertionError("Plausible restored distance-constraint explanation error escaped frozen reading")
    cases.append({"case": "correct_key_but_false_nonunique_distance_constraint_rebound", "id": result["id"], "rejectedBy": result["errors"]})
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
