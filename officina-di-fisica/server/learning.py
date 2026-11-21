"""Assessment, immutable snapshots, retrieval practice and observable evidence."""

import json
import random
import secrets
import unicodedata
from collections import defaultdict
from decimal import Decimal, InvalidOperation

from .store import (
    NOW,
    Problem,
    digest,
    encode,
    entitled,
    in_course,
    need_user,
    published,
    record,
    require,
    safe_key,
)


def normalized(s):
    return " ".join(
        unicodedata.normalize("NFKC", str(s))
        .casefold()
        .replace("’", "'")
        .strip()
        .split()
    )


def matches(answer, value):
    if answer["type"] == "numeric":
        try:
            number = Decimal(str(value).strip().replace("−", "-").replace(",", "."))
            expected = Decimal(str(answer["value"]))
            tolerance = Decimal(str(answer.get("tolerance", 0)))
            return (
                number.is_finite()
                and expected - tolerance <= number <= expected + tolerance
            )
        except (InvalidOperation, ValueError, TypeError):
            return False
    return normalized(value) in {
        normalized(x) for x in [answer["value"], *answer.get("aliases", [])]
    }


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


def evidence(db, uid):
    history = db.execute(
        "SELECT * FROM attempts WHERE user=? ORDER BY stamp, rowid", (uid,)
    ).fetchall()
    groups = defaultdict(list)
    for a in history:
        groups[a["skill"]].append(a)
    result = {}
    for skill, attempts in groups.items():
        distinct = {}
        for a in attempts:
            # A later unaided attempt on a different family gives independent evidence.
            if a["aided"] == 0:
                distinct[a["family"]] = a
        recent = list(sorted(distinct.values(), key=lambda a: a["stamp"]))[-5:]
        good = sum(a["correct"] for a in recent)
        failures = len(recent) - good
        state = "da esplorare"
        if recent:
            state = "prima evidenza"
            if failures >= 2:
                state = "da consolidare"
            elif good >= 3 and good / len(recent) >= 0.75:
                state = "risultati stabili"
        last = max((a["stamp"] for a in recent), default=attempts[-1]["stamp"])
        days = 7 if state == "risultati stabili" else 3 if good and not failures else 1
        result[skill] = {
            "state": state,
            "families": len(recent),
            "good": good,
            "wrong": failures,
            "due": last + days * 86400,
            "last": last,
            "aided": sum(a["aided"] for a in attempts),
        }
    return result


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


def choose(db, user, rows, d):
    course = d.get("course")
    require(
        entitled(db, user, rows, course),
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
        require(course == "C6" and number in (1, 2, 3), "Fascicolo non valido.")
        qs = sorted(
            (q for q in qs if q.get("exam") == number), key=lambda q: q["order"]
        )
        require(
            len(qs) == 31
            and sum(
                q["answer"]["type"] == "choice" and len(q["answer"]["options"]) == 5
                for q in qs
            )
            == 21,
            "Il fascicolo deve contenere 21 scelte a cinque opzioni e 10 completamenti.",
            409,
        )
        return qs
    if mode in ("mid", "final"):
        require(d.get("part", 1) in (1, 2), "Verifica intermedia non valida.")
        return assessment(rows, course, mode, d.get("part", 1))
    qs = [q for q in qs if not q.get("exam")]
    if mode == "diagnosis" and course == "C6":
        qs = [q for q in qs if q["course"] != "C6"]
    if d.get("item"):
        qs = [q for q in qs if q["id"] == d["item"]]
    if d.get("skill"):
        qs = [q for q in qs if q["skill"] == d["skill"]]
    exclude = d.get("exclude")
    if exclude:
        prev = next((q for q in rows if q["id"] == exclude), None)
        if prev:
            qs = [q for q in qs if q["family"] != prev.get("family")]
    history = evidence(db, user["id"])
    seen = {
        x[0]
        for x in db.execute(
            "SELECT DISTINCT id FROM attempts WHERE user=?", (user["id"],)
        )
    }
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
            if 0 < h.get("due", 0) <= NOW()
            else 3
        )
        return (
            q["id"] in seen,
            need,
            missing,
            h.get("due", 0) > NOW(),
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
        due = {k for k, h in history.items() if h["due"] <= NOW()}
        return [q for q in qs if q["skill"] in due][:5]
    return qs[: 1 if mode == "retest" or d.get("item") else 5]


def start(db, user, rows, d):
    need_user(user)
    mode = d.get("mode", "practice")
    token = d.get("requestId", "")
    require(safe_key(token), "Identificativo della richiesta mancante.")
    signature = digest(user["id"] + ":" + token)
    old = db.execute(
        "SELECT id FROM runs WHERE user=? AND signature=?", (user["id"], signature)
    ).fetchone()
    if old:
        return {"id": old[0]}
    qs = choose(db, user, rows, d)
    require(qs, "Nessun quesito disponibile per questa selezione.", 409)
    uid = secrets.token_urlsafe(15)
    stamp = NOW()
    minutes = d.get("minutes", 50)
    require(minutes in (50, 65, 75), "Durata non supportata.")
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
    db.execute(
        "INSERT INTO runs VALUES(?,?,?,?,?,?,?,?,?)",
        (
            uid,
            user["id"],
            d["course"],
            mode,
            stamp,
            stamp + minutes * 60 if mode == "exam" else None,
            None,
            encode(items),
            signature,
        ),
    )
    return {"id": uid}


def mark_exposed(db, user, q, item):
    already = db.execute(
        "SELECT 1 FROM exposed WHERE user=? AND id=? AND v=?",
        (user["id"], q["id"], q["version"]),
    ).fetchone()
    if already:
        item["aided"] = True
    db.execute(
        "INSERT OR IGNORE INTO exposed VALUES(?,?,?)",
        (user["id"], q["id"], q["version"]),
    )


def note(db, user, run, idx, q, item):
    if item["answer"] is None:
        return
    ok = matches(q["answer"], item["answer"])
    db.execute(
        "INSERT OR IGNORE INTO attempts VALUES(?,?,?,?,?,?,?,?,?,?)",
        (
            run,
            idx,
            user["id"],
            q["id"],
            q["version"],
            q["skill"],
            q["family"],
            int(ok),
            int(item["aided"]),
            NOW(),
        ),
    )


def details(db, user, rows, rid, d=None):
    need_user(user)
    run = db.execute(
        "SELECT * FROM runs WHERE id=? AND user=?", (rid, user["id"])
    ).fetchone()
    require(run, "Sessione non trovata.", 404)
    require(
        entitled(db, user, rows, run["course"]), "Accesso al percorso richiesto.", 403
    )
    mode = run["mode"]
    sealed = mode in ("exam", "mid", "final", "diagnosis")
    items = json.loads(run["items"])
    qs = [record(db, k["id"], k["v"]) for k in items]
    finished = run["finished"]
    expired = bool(run["deadline"] and NOW() >= run["deadline"])
    if d and not finished and not expired:
        action = d.get("action")
        if action == "finish":
            finished = NOW()
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
                    mark_exposed(db, user, q, item)
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
                        mark_exposed(db, user, q, item)
                        note(db, user, rid, idx, q, item)
            else:
                raise Problem("Azione sconosciuta.")
    if expired and not finished:
        finished = run["deadline"]
    if finished and not run["finished"]:
        for i, (q, k) in enumerate(zip(qs, items)):
            if sealed or not k["sent"]:
                mark_exposed(db, user, q, k)
            if sealed:
                note(db, user, rid, i, q, k)
    if (d and not run["finished"]) or (finished and not run["finished"]):
        db.execute(
            "UPDATE runs SET items=?,finished=? WHERE id=?",
            (encode(items), finished, rid),
        )
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
        "serverTime": NOW(),
        "sealed": sealed,
        "items": result,
        "result": {
            "right": right,
            "wrong": wrong,
            "omitted": len(items) - right - wrong,
            "score": round(right - (0.1 if mode == "exam" else 0) * wrong, 1),
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


def recommendations(db, user, rows, observations):
    candidates = []
    for skill, h in observations.items():
        lesson = next(
            (r for r in rows if r["id"] == skill and r["kind"] == "lesson"), None
        )
        if not lesson or not entitled(db, user, rows, lesson["course"]):
            continue
        if h["wrong"] == 0 and h["due"] > NOW():
            continue
        uid = user["id"]
        last = db.execute(
            "SELECT id,v FROM attempts WHERE user=? AND skill=? AND aided=0 ORDER BY correct ASC,stamp DESC,rowid DESC LIMIT 1",
            (uid, skill),
        ).fetchone()
        if not last:
            continue
        previous = record(db, last["id"], last["v"])
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
        elif h["due"] <= NOW():
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


def stats(db, user, rows=None):
    if not user:
        return None
    uid = user["id"]
    learning_state = evidence(db, uid)
    notes = [
        {"lab": r["lab"], "stamp": r["stamp"], **json.loads(r["observation"])}
        for r in db.execute(
            "SELECT lab,stamp,observation FROM lab_events WHERE user=? ORDER BY stamp DESC,seq DESC LIMIT 8",
            (uid,),
        )
    ]
    return {
        "recommendations": recommendations(
            db, user, rows if rows is not None else published(db), learning_state
        ),
        "notes": notes,
        "reads": [
            dict(r)
            for r in db.execute(
                "SELECT id,v,stamp FROM reads WHERE user=? ORDER BY stamp DESC", (uid,)
            )
        ],
        "skills": learning_state,
        "lastRuns": [
            dict(r)
            for r in db.execute(
                "SELECT id,course,mode,start,deadline,finished FROM runs WHERE user=? ORDER BY start DESC,rowid DESC LIMIT 40",
                (uid,),
            )
        ],
        "labCount": db.execute(
            "SELECT count(*) FROM lab_events WHERE user=?", (uid,)
        ).fetchone()[0],
    }


def historical_asset(db, user, rows, src):
    """Old figures remain visible with the exact answers for which access was granted."""
    if not user:
        return False
    for run in db.execute(
        "SELECT course,mode,finished,items FROM runs WHERE user=?", (user["id"],)
    ):
        if not entitled(db, user, rows, run["course"]):
            continue
        sealed = run["mode"] in ("exam", "mid", "final", "diagnosis")
        for item in json.loads(run["items"]):
            q = record(db, item["id"], item["v"])
            visible = q.get("promptBlocks", [])
            if run["finished"] or (not sealed and item["sent"]):
                visible = visible + q["blocks"]
            if any(b.get("src") == src for b in visible):
                return True
    return False
