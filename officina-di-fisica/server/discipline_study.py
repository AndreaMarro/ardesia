"""Classify observable study evidence and recommend a concrete next activity."""
import json

from .adapters import discipline_editions as ed
from .adapters.discipline_pack import PHYSICS, fields, student_unit
from .domain.errors import Problem, require
from .domain.identity import encode, need_author, need_user, safe_key
from . import store

# An explicit scheduling policy. Its intervals are editable product defaults.
REVIEW_DELAY = 2 * 24 * 60 * 60
RETAINED_DELAY = 7 * 24 * 60 * 60
KINDS = {"open", "complete", "hint", "answer"}


def practice_history(db, uid, discipline):
    rows = db.execute(
        """SELECT skill, SUM(kind='open') AS exposures, COUNT(DISTINCT CASE WHEN kind='complete' THEN unit END) AS completions,
        SUM(CASE WHEN correct=1 AND assisted=1 THEN 1 ELSE 0 END) AS assisted,
        SUM(CASE WHEN correct=1 AND assisted=0 THEN 1 ELSE 0 END) AS independent,
        COALESCE(SUM(transfer),0) AS transfer, COALESCE(SUM(retention),0) AS retention,
        SUM(CASE WHEN correct=0 THEN 1 ELSE 0 END) AS errors,
        MAX(CASE WHEN correct=1 AND assisted=0 THEN stamp END) AS lastIndependent,
        MAX(CASE WHEN correct=0 THEN seq END) AS lastError,
        MAX(CASE WHEN correct=1 AND assisted=0 THEN seq END) AS lastSuccess
        FROM discipline_events WHERE user=? AND discipline=? GROUP BY skill""", (uid, discipline))
    return {r["skill"]: dict(r) for r in rows}


def notebook(db, user, pack, allowed, now):
    uid, discipline = user["id"], pack["id"]
    history = practice_history(db, uid, discipline)
    units = [dict(u, courseId=c["id"]) for c in pack["courses"] if c["id"] in allowed for u in c["units"]]
    by_id = {u["id"]: u for u in units}
    eligible_skills = {u["skillId"] for u in units}
    model = {}
    for skill in eligible_skills:
        h = history.get(skill, {})
        model[skill] = {k: int(h.get(k, 0)) for k in ("exposures", "completions", "assisted", "independent", "transfer", "retention", "errors")}
        last = h.get("lastIndependent")
        model[skill]["dueAt"] = last + (RETAINED_DELAY if h.get("retention") else REVIEW_DELAY) if last is not None else None
    attempted = {r[0] for r in db.execute("SELECT DISTINCT activity FROM discipline_events WHERE user=? AND discipline=? "
                                          "AND kind IN ('answer','hint')", (uid, discipline))}
    resume = None
    for r in db.execute("SELECT unit,activity FROM discipline_events WHERE user=? AND discipline=? ORDER BY seq DESC", (uid, discipline)):
        if r[0] in by_id:
            resume = {"unitId": r[0], "activityId": r[1] if r[1] in by_id[r[0]]["activityIds"] else None}
            break
    prerequisites = {s["id"]: s.get("prerequisites", []) for s in pack["skills"]}
    choices = []
    for unit in units:
        skill = unit["skillId"]
        fresh = next((a for a in unit["activityIds"] if a not in attempted), None)
        if fresh is None:
            continue
        h, m = history.get(skill, {}), model[skill]
        if (h.get("lastError") or 0) > (h.get("lastSuccess") or 0):
            rank, why = 0, "Riprendi il passaggio in cui hai avuto una difficoltà e prova un quesito diverso."
        elif m["dueAt"] is not None and m["dueAt"] <= now:
            rank, why = 1, "È trascorso l’intervallo di ripasso. Prova un quesito nuovo senza indizi."
        elif not m["independent"] and all(model.get(dep, {}).get("independent") for dep in prerequisites[skill]):
            rank, why = 2, "Puoi affrontare questo obiettivo con i prerequisiti già documentati."
        elif not m["independent"]:
            rank, why = 3, "Inizia dalla lezione e consulta i prerequisiti indicati."
        else:
            rank, why = 4, "Applica la stessa competenza a un nuovo quesito."
        choices.append((rank, {"unitId": unit["id"], "activityId": fresh, "reason": why}))
    recommended = min(choices, key=lambda item: item[0])[1] if choices else None
    return {"version": pack["version"], "skills": model, "resume": resume, "next": recommended}


def response_for(row, unit):
    data = json.loads(row["request"])
    result = fields(data, "kind", "unitId", "activityId", "version")
    if data["kind"] not in ("hint", "answer"):
        return result
    activity = next(a for a in unit["activities"] if a["id"] == data["activityId"])
    if data["kind"] == "hint":
        return dict(result, hint=activity["hints"][data["hintIndex"]])
    return dict(result, correct=bool(row["correct"]), assisted=bool(row["assisted"]),
                evidence={"transfer": bool(row["transfer"]), "retention": bool(row["retention"])},
                **fields(activity, "correctOptionId", "solution", "feedback", "transfer"))


def write_event(db, user, pack, allowed, data, now):
    discipline = pack["id"]
    kind, key = data.get("kind"), data.get("requestId")
    require(isinstance(kind, str) and kind in KINDS and safe_key(key), "Tipo di evento o identificatore non valido.")
    require(safe_key(data.get("version")) and safe_key(data.get("unitId")), "Versione o unità non valida.")
    common = {"requestId", "version", "unitId", "kind"}
    optional = {"answer": {"activityId", "optionId"}, "hint": {"activityId", "hintIndex"},
                "open": {"activityId"}, "complete": set()}[kind]
    require(data.keys() <= common | optional, "Campo evento sconosciuto.")
    requested = encode(data)
    prior = db.execute("SELECT * FROM discipline_events WHERE user=? AND discipline=? AND request_id=?",
                       (user["id"], discipline, key)).fetchone()
    if prior:
        require(prior["request"] == requested, "Identificatore di richiesta già usato per un evento diverso.", 409)
    else:
        require(data["version"] == pack["version"], "L’edizione è cambiata. Riapri l’unità prima di rispondere.", 409)
    unit = ed.get_unit(db, discipline, data["version"], data["unitId"])
    require(unit["courseId"] in allowed, "Accesso al microcorso richiesto.", 403)
    if prior:
        return response_for(prior, unit)
    aid = data.get("activityId")
    activity = next((a for a in unit["activities"] if a["id"] == aid), None)
    if aid is not None or kind in ("answer", "hint"):
        require(activity, "Attività estranea all’unità.")
    correct = assisted = transfer = retention = None
    if kind == "hint":
        ix = data.get("hintIndex")
        require(type(ix) is int and 0 <= ix < len(activity["hints"]), "Indizio non disponibile.")
    if kind == "answer":
        option = data.get("optionId")
        require(option in [o["id"] for o in activity["options"]], "Alternativa non disponibile.")
        correct = option == activity["correctOptionId"]
        assisted = bool(db.execute("SELECT 1 FROM discipline_events WHERE user=? AND discipline=? AND activity=? "
                                   "AND kind IN ('answer','hint') LIMIT 1", (user["id"], discipline, aid)).fetchone())
        previous = db.execute("SELECT MAX(stamp) FROM discipline_events WHERE user=? AND discipline=? AND skill=? AND correct=1 AND assisted=0",
                              (user["id"], discipline, unit["skillId"])).fetchone()[0]
        independent = correct and not assisted
        transfer = bool(independent and previous is not None and activity.get("assessmentRole") == "transfer")
        retention = bool(independent and previous is not None and now - previous >= REVIEW_DELAY)
    db.execute("INSERT INTO discipline_events(user,request_id,discipline,version,unit,activity,skill,kind,request,correct,assisted,transfer,retention,stamp) "
               "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", (user["id"], key, discipline, data["version"], unit["id"], aid, unit["skillId"],
               kind, requested, correct, assisted, transfer, retention, now))
    return response_for({"request": requested, "correct": correct, "assisted": assisted, "transfer": transfer, "retention": retention}, unit)


def route(db, user, parts, data, post, local):
    mode = store.config(db).get("mode", "verifica")
    review_local = local and mode == "verifica"
    if not parts:
        require(not post, "Metodo non disponibile.", 405)
        legacy = ed.physics(db)
        cards = [fields(legacy, "id", "title", "summary", "route", "coursesCount")]
        cards.extend(dict(fields(p, "id", "title", "summary", "status"), route="disciplina/" + p["id"], coursesCount=len(p["courses"]))
                     for p in ed.editions(db) if ed.visible(p, user, review_local))
        return {"schemaVersion": 1, "disciplines": cards}
    discipline, *tail = parts
    if discipline == PHYSICS and not tail and not post:
        return ed.physics(db)
    pack = ed.current(db, discipline)
    require(pack and ed.visible(pack, user, review_local), "Disciplina non disponibile.", 404)
    grants = ed.access_keys(db, user, mode)
    allowed = {c["id"] for c in pack["courses"] if ed.can_study(pack, c["id"], user, mode, grants, review_local)}
    if not tail and not post:
        courses = []
        for course in pack["courses"]:
            entry = dict(course, accessible=course["id"] in allowed)
            if not entry["accessible"]:
                entry.pop("formulas", None)
            if pack["status"] == "published":
                entry["orderKey"] = ed.order_key(discipline, course["id"])
            courses.append(entry)
        available_ids = {aid for c in courses if c["accessible"] for u in c["units"] for aid in u["activityIds"]}
        return dict(pack, courses=courses, exams=[e for e in pack.get("exams", []) if available_ids.issuperset(e["activityIds"])])
    need_user(user)
    if len(tail) == 2 and tail[0] == "units" and not post:
        unit = ed.get_unit(db, discipline, pack["version"], tail[1])
        require(unit["courseId"] in allowed, "Accesso al microcorso richiesto.", 403)
        return student_unit(unit, pack["version"])
    if len(tail) == 3 and tail[0] == "courses" and tail[2] == "editorial-library" and not post:
        from .editorial.service import editorial_library
        need_author(user)
        require(pack["status"] == "published", "La biblioteca editoriale richiede un’edizione approvata.", 403)
        course = next((c for c in pack["courses"] if c["id"] == tail[1]), None)
        require(course, "Microcorso assente.", 404)
        edition = db.execute("SELECT revision FROM discipline_editions WHERE discipline=? AND version=?",
                             (discipline, pack["version"])).fetchone()[0]
        lessons = []
        for outline in course["units"]:
            unit = ed.get_unit(db, discipline, pack["version"], outline["id"])
            lessons.append(dict(id=unit["id"], kind="lesson", course=course["id"], title=unit["title"], version=edition,
                                coverage=[unit["objective"]], blocks=[{"type": "text", "text": p["body"]} for p in unit["lesson"]]))
        return editorial_library(lessons, course["id"])
    if tail == ["context"] and post:
        require(data.get("version") == pack["version"], "Riapri l’unità nell’edizione corrente.", 409)
        require(data.keys() == {"unitId","version","scopes"} and safe_key(data["unitId"]), "Richiesta di contesto non valida.")
        scopes = data["scopes"]
        require(isinstance(scopes, list) and 1 <= len(scopes) <= 3
                and all(s in ("objective","prerequisites","evidence") for s in scopes)
                and len(scopes) == len(set(scopes)), "Ambiti di lettura non validi.")
        unit = ed.get_unit(db, discipline, pack["version"], data["unitId"])
        require(unit["courseId"] in allowed, "Accesso al microcorso richiesto.", 403)
        result = {"schema": "cric/study-context/1", "discipline":discipline, "unitId":unit["id"], "version":pack["version"]}
        if "objective" in scopes:
            result["objective"] = unit["objective"]
        if "prerequisites" in scopes:
            skills = {s["id"]:s for s in pack["skills"]}
            result["prerequisites"] = [skills[k]["title"] for k in skills[unit["skillId"]].get("prerequisites", [])]
        if "evidence" in scopes:
            result["evidence"] = notebook(db, user, pack, allowed, store.NOW())["skills"][unit["skillId"]]
        return result
    if tail == ["me"] and not post:
        return notebook(db, user, pack, allowed, store.NOW())
    if tail == ["events"] and post:
        return write_event(db, user, pack, allowed, data, store.NOW())
    raise Problem("Risorsa o metodo non disponibile.", 404)
