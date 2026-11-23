"""Assessment, immutable snapshots, retrieval practice and observable evidence."""

import json
import random
import secrets
from collections import defaultdict

from ..domain.assessment import matches, trace
from ..domain.catalog import in_course
from ..domain.errors import Problem, require
from ..domain.identity import digest, need_user, safe_key
from .study_port import StudyRepository


def outline(q):
    a = q["answer"]
    return {
        "id": q["id"],
        "version": q["version"],
        "prompt": q["prompt"],
        "figures": q.get("promptBlocks", []),
        "type": a["type"],
        "options": a.get("options", []),
        "unit": a.get("unit", ""),
        "tolerance": a.get("tolerance", 0),
    }


def evidence(repo: StudyRepository, uid):
    return trace(repo.attempts(uid))


def assessment(rows, course, mode, part=1):
    qs = [r for r in in_course(rows, course, "question") if not r.get("exam")]
    ordered = []
    skills = list(dict.fromkeys(q["skill"] for q in qs))
    if mode == "mid":
        half = (len(skills) + 1) // 2
        skills = skills[:half] if part == 1 else skills[half:]
    for skill in skills:
        group = sorted(
            (q for q in qs if q["skill"] == skill),
            key=lambda q: (q.get("difficulty", 1), q["id"]),
        )
        # Midpoints and final use different items wherever the bank allows it.
        if mode == "mid":
            ordered.extend(group[1:3] or group[:1])
        else:
            ordered.extend(group[-2:])
    random.SystemRandom().shuffle(ordered)
    return ordered


def choose(repo: StudyRepository, user, rows, d):
    course = d.get("course")
    require(
        repo.entitled(user, rows, course),
        "Per questa attività serve l’accesso al percorso.",
        403,
    )
    mode = d.get("mode", "practice")
    allowed = {
        "practice",
        "diagnosis",
        "mid",
        "final",
        "mixed",
        "exam",
        "retest",
        "review",
    }
    require(mode in allowed, "Tipo di attività non valido.")
    qs = in_course(rows, course, "question")
    if mode == "exam":
        number = d.get("exam")
        policy = repo.exam_policy(rows, course)
        require(policy and type(number) is int and 1 <= number <= policy["papers"], "Fascicolo non valido.")
        qs = sorted(
            (q for q in qs if q.get("exam") == number), key=lambda q: q["order"]
        )
        require(
            len(qs) == policy["choices"] + policy["completions"]
            and sum(
                q["answer"]["type"] == "choice" and len(q["answer"]["options"]) == policy["options"]
                for q in qs
            )
            == policy["choices"] and sum(q["answer"]["type"] != "choice" for q in qs) == policy["completions"],
            "Il fascicolo non corrisponde alla struttura del corso.",
            409,
        )
        return qs
    if mode in ("mid", "final"):
        require(d.get("part", 1) in (1, 2), "Verifica intermedia non valida.")
        return assessment(rows, course, mode, d.get("part", 1))
    qs = [q for q in qs if not q.get("exam")]
    if mode == "diagnosis" and any(r["kind"] == "course" and r["id"] == course and r.get("includes") for r in rows):
        qs = [q for q in qs if q["course"] != course]
    if d.get("item"):
        qs = [q for q in qs if q["id"] == d["item"]]
    if d.get("skill"):
        qs = [q for q in qs if q["skill"] == d["skill"]]
    exclude = d.get("exclude")
    if exclude:
        prev = next((q for q in rows if q["id"] == exclude), None)
        if prev:
            qs = [q for q in qs if q["family"] != prev.get("family")]
    history = evidence(repo, user["id"])
    seen = repo.seen(user["id"])
    random.SystemRandom().shuffle(qs)
    recovery = set()
    for lesson in rows:
        if (
            lesson["kind"] == "lesson"
            and history.get(lesson["id"], {}).get("state") == "da consolidare"
        ):
            recovery.update(
                p
                for p in lesson["prerequisites"]
                if history.get(p, {}).get("state") != "risultati stabili"
            )

    def priority(q):
        h = history.get(q["skill"], {})
        missing = any(
            history.get(k, {}).get("state") == "da consolidare"
            for k in q["prerequisites"]
        )
        level = (
            1
            if h.get("wrong", 0) > 0
            else 3
            if h.get("state") == "risultati stabili"
            else 2
        )
        need = (
            0
            if q["skill"] in recovery
            else 1
            if h.get("state") == "da consolidare"
            else 2
            if 0 < h.get("due", 0) <= repo.now()
            else 3
        )
        return (
            q["id"] in seen,
            need,
            missing,
            h.get("due", 0) > repo.now(),
            abs(q["difficulty"] - level),
        )

    qs.sort(key=priority)
    if mode in ("mixed", "diagnosis"):
        by = defaultdict(list)
        for q in qs:
            by[q["course"]].append(q)
        # Round-robin sampling gives every included discipline a voice.
        result = []
        for i in range(2):
            for group in by.values():
                available = [
                    q
                    for q in group
                    if q not in result
                    and not any(q["skill"] == r["skill"] for r in result)
                ]
                if available:
                    result.append(available[0])
        return result[:10]
    if mode == "review":
        due = {k for k, h in history.items() if h["due"] <= repo.now()}
        return [q for q in qs if q["skill"] in due][:5]
    return qs[: 1 if mode == "retest" or d.get("item") else 5]


def start(repo: StudyRepository, user, rows, d):
    need_user(user)
    mode = d.get("mode", "practice")
    token = d.get("requestId", "")
    require(safe_key(token), "Identificativo della richiesta mancante.")
    signature = digest(user["id"] + ":" + token)
    old = repo.previous_run(user["id"], signature)
    if old:
        return {"id": old}
    qs = choose(repo, user, rows, d)
    require(qs, "Nessun quesito disponibile per questa selezione.", 409)
    uid = secrets.token_urlsafe(15)
    stamp = repo.now()
    policy = repo.exam_policy(rows, d["course"]) if mode == "exam" else None
    durations = policy["minutes"] if policy else [50, 65, 75]
    minutes = d.get("minutes", durations[0])
    require(minutes in durations, "Durata non supportata.")
    items = [
        {
            "id": q["id"],
            "v": q["version"],
            "answer": None,
            "sent": False,
            "hints": 0,
            "aided": False,
            "changes": 0,
            "blank": False,
        }
        for q in qs
    ]
    deadline = stamp + minutes * 60 if mode == "exam" else None
    repo.create_run(uid, user["id"], d["course"], mode, stamp, deadline, items, signature, policy)
    return {"id": uid}


def mark_exposed(repo: StudyRepository, user, q, item):
    if repo.expose(user["id"], q["id"], q["version"]):
        item["aided"] = True


def note(repo: StudyRepository, user, run, idx, q, item):
    if item["answer"] is None:
        return
    ok = matches(q["answer"], item["answer"])
    repo.add_attempt(run, idx, user["id"], q, ok, item["aided"], repo.now())


def details(repo: StudyRepository, user, rows, rid, d=None):
    need_user(user)
    run = repo.run(rid, user["id"])
    require(run, "Sessione non trovata.", 404)
    require(
        repo.entitled(user, rows, run["course"]), "Accesso al percorso richiesto.", 403
    )
    mode = run["mode"]
    policy = repo.run_policy(rid, run["course"]) if mode == "exam" else None
    sealed = mode in ("exam", "mid", "final", "diagnosis")
    items = json.loads(run["items"])
    qs = [repo.record(k["id"], k["v"]) for k in items]
    finished = run["finished"]
    expired = bool(run["deadline"] and repo.now() >= run["deadline"])
    if d and not finished and not expired:
        action = d.get("action")
        if action == "finish":
            finished = repo.now()
        else:
            idx = d.get("idx")
            require(
                isinstance(idx, int) and 0 <= idx < len(items),
                "Numero del quesito non valido.",
            )
            item, q = items[idx], qs[idx]
            if action == "hint":
                require(
                    not sealed and not item["sent"],
                    "Aiuti non disponibili in questa fase.",
                )
                item["aided"] = True
                item["hints"] = min(item["hints"] + 1, len(q.get("hints", [])))
            elif action == "reveal":
                require(not sealed, "Soluzione disponibile alla consegna.")
                if not item["sent"]:
                    item["aided"] = True
                    item["sent"] = True
                    mark_exposed(repo, user, q, item)
            elif action in ("answer", "blank"):
                val = None if action == "blank" else str(d.get("value", "")).strip()
                require(
                    action == "blank" or val and len(val) <= 600,
                    "Inserisci una risposta.",
                )
                if q["answer"]["type"] == "choice" and val is not None:
                    require(val in q["answer"]["options"], "Opzione non valida.")
                if item["answer"] != val or (action == "blank" and not item["blank"]):
                    if not sealed:
                        require(not item["sent"], "Risposta già registrata.", 409)
                    if mode == "exam":
                        require(
                            not item["blank"] and item["changes"] < 2,
                            "Il modulo non consente ulteriori correzioni.",
                            409,
                        )
                    item["changes"] += 1
                    item["answer"] = val
                    item["blank"] = action == "blank"
                    item["sent"] = True
                    if not sealed:
                        mark_exposed(repo, user, q, item)
                        note(repo, user, rid, idx, q, item)
            else:
                raise Problem("Azione sconosciuta.")
    if expired and not finished:
        finished = run["deadline"]
    if finished and not run["finished"]:
        for i, (q, k) in enumerate(zip(qs, items)):
            if sealed or not k["sent"]:
                mark_exposed(repo, user, q, k)
            if sealed:
                note(repo, user, rid, i, q, k)
    if (d and not run["finished"]) or (finished and not run["finished"]):
        repo.save_run(rid, items, finished)
    result = []
    right = wrong = 0
    for i, (q, k) in enumerate(zip(qs, items)):
        out = dict(
            outline(q),
            **{
                key: k[key]
                for key in ("answer", "sent", "hints", "changes", "blank", "aided")
            },
        )
        if not sealed:
            out["hintTexts"] = q.get("hints", [])[: k["hints"]]
            out["hasHint"] = k["hints"] < len(q.get("hints", []))
        if finished or (not sealed and k["sent"]):
            correct = None if k["answer"] is None else matches(q["answer"], k["answer"])
            right += int(correct is True)
            wrong += int(correct is False)
            out.update(
                correct=correct,
                solution=q["blocks"],
                key=q["answer"]["value"],
                skill=q["skill"],
                error=q.get("error", {}),
                prerequisites=q["prerequisites"],
            )
        result.append(out)
    return {
        "id": rid,
        "course": run["course"],
        "mode": mode,
        "finished": finished,
        "deadline": run["deadline"],
        "serverTime": repo.now(),
        **({"assessmentProfile": policy} if policy else {}),
        "sealed": sealed,
        "items": result,
        "result": {
            "right": right,
            "wrong": wrong,
            "omitted": len(items) - right - wrong,
            "score": round(right - (policy["wrongPenalty"] if policy else 0) * wrong, 10),
        }
        if finished
        else None,
    }


def recovery_resource(rows, question):
    target = question.get("error", {}).get("target", "")
    if target.startswith("lab:"):
        found = next(
            (r for r in rows if r["kind"] == "lab" and r["course"] == target[4:]), None
        )
    else:
        found = next((r for r in rows if r["id"] == target), None)
    return found or next((r for r in rows if r["id"] == question["skill"]), None)


def recommendations(repo: StudyRepository, user, rows, observations):
    candidates = []
    for skill, h in observations.items():
        lesson = next(
            (r for r in rows if r["id"] == skill and r["kind"] == "lesson"), None
        )
        if not lesson or not repo.entitled(user, rows, lesson["course"]):
            continue
        if h["wrong"] == 0 and h["due"] > repo.now():
            continue
        uid = user["id"]
        last = repo.recovery_attempt(uid, skill)
        if not last:
            continue
        previous = repo.record(last["id"], last["v"])
        rec = {
            "skill": skill,
            "title": lesson["title"],
            "course": lesson["course"],
            "exclude": previous["id"],
            "priority": 2,
        }
        if h["state"] == "da consolidare":
            resource = recovery_resource(rows, previous)
            target = resource["id"] if resource else skill
            prerequisite = next(
                (
                    key
                    for key in lesson["prerequisites"]
                    if observations.get(key, {}).get("state") == "da consolidare"
                ),
                None,
            )
            rec.update(
                priority=0,
                target=prerequisite or target,
                targetKind="lesson"
                if prerequisite or not resource
                else resource["kind"],
                reason="Sono emerse difficoltà in più famiglie. Riprendi il prerequisito."
                if prerequisite
                else "Sono emerse difficoltà in più famiglie. Ripercorri il passaggio e poi prova un altro problema.",
            )
        elif h["due"] <= repo.now():
            rec.update(
                priority=1,
                reason="È il momento di richiamare questa competenza con una situazione diversa.",
            )
        else:
            rec.update(
                reason="Una risposta merita un secondo riscontro. Prova una domanda breve sulla stessa competenza."
            )
        candidates.append(rec)
    return sorted(candidates, key=lambda c: (c["priority"], c["course"], c["skill"]))[
        :5
    ]


def stats(repo: StudyRepository, user, rows=None):
    if not user:
        return None
    uid = user["id"]
    learning_state = evidence(repo, uid)
    return {
        "recommendations": recommendations(repo, user, rows if rows is not None else repo.published(), learning_state),
        "notes": repo.observations(uid),
        "reads": repo.reads(uid),
        "skills": learning_state,
        "lastRuns": repo.recent_runs(uid),
        "labCount": repo.observation_count(uid),
    }


def historical_asset(repo: StudyRepository, user, rows, src):
    """Old figures remain visible with the exact answers for which access was granted."""
    if not user:
        return False
    for run in repo.historical_runs(user["id"]):
        if not repo.entitled(user, rows, run["course"]):
            continue
        sealed = run["mode"] in ("exam", "mid", "final", "diagnosis")
        for item in json.loads(run["items"]):
            q = repo.record(item["id"], item["v"])
            visible = q.get("promptBlocks", [])
            if run["finished"] or (not sealed and item["sent"]):
                visible = visible + q["blocks"]
            if any(b.get("src") == src for b in visible):
                return True
    return False
