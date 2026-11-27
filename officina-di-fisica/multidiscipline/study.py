"""Classify observable study evidence and recommend a concrete next activity."""
import json

from . import editions as ed
from .pack import PHYSICS, fields, student_unit
from server.domain.errors import Problem, require
from server.domain.identity import encode, need_author, need_user, safe_key
from server import store

# An explicit scheduling policy. Its intervals are editable product defaults.
REVIEW_DELAY = 2 * 24 * 60 * 60
RETAINED_DELAY = 7 * 24 * 60 * 60
KINDS = {"open", "complete", "hint", "answer"}
POLICY_VERSION = "cric-discipline-policy-2"


def practice_history(db, uid, discipline):
    rows = db.execute("SELECT * FROM discipline_skill_stats WHERE user=? AND discipline=?", (uid, discipline))
    return {r["skill"]: dict(r) for r in rows}


def family_evidence(db, uid, discipline, skill=None):
    """Read families from the immutable edition actually answered, never today's pack.

    Historical flags remain in the ledger. A flag is presented as verified transfer
    only when the stored items support a first success in a genuinely new family.
    Unclassified packs remain usable; absence of metadata is not evidence.
    """
    payloads = {}

    def item(row):
        items = payloads.get(row["payload"])
        if items is None:
            items = {a["id"]: a for a in json.loads(row["payload"])["activities"]}
            payloads[row["payload"]] = items
        return items[row["activity"]]

    args = [uid, discipline]
    skill_filter = " AND skill=?" if skill is not None else ""
    if skill is not None:
        args.append(skill)
    first_seen = db.execute(
        "WITH encounters AS (SELECT discipline,version,unit,activity,skill,MIN(seq) AS firstSeq "
        "FROM discipline_events INDEXED BY discipline_seen WHERE user=? AND discipline=? "
        "AND kind IN ('answer','hint')" + skill_filter + " GROUP BY discipline,version,unit,activity,skill) "
        "SELECT e.skill,e.activity,e.firstSeq,u.payload FROM encounters e JOIN discipline_units u "
        "ON u.discipline=e.discipline AND u.version=e.version AND u.unit=e.unit", args)
    encountered = {}
    for row in first_seen:
        family = item(row).get("familyId")
        if family:
            earliest = encountered.setdefault(row["skill"], {})
            earliest[family] = min(row["firstSeq"], earliest.get(family, row["firstSeq"]))
    query = ("SELECT e.seq,e.skill,e.activity,e.transfer,u.payload FROM discipline_events e "
             "JOIN discipline_units u ON u.discipline=e.discipline AND u.version=e.version AND u.unit=e.unit "
             "WHERE e.user=? AND e.discipline=? AND e.kind='answer' AND e.correct=1 AND e.assisted=0")
    if skill is not None:
        query += " AND e.skill=?"
    rows = db.execute(query + " ORDER BY e.seq", args)
    families, verified, legacy = {}, {}, {}
    for row in rows:
        activity = item(row)
        family = activity.get("familyId")
        seen = families.setdefault(row["skill"], set())
        novel = family and encountered[row["skill"]][family] == row["seq"]
        supported = bool(novel and seen and family not in seen and activity.get("assessmentRole") == "transfer")
        if row["transfer"]:
            target = verified if supported else legacy
            target[row["skill"]] = target.get(row["skill"], 0) + 1
        if family:
            seen.add(family)
    return families, encountered, verified, legacy


def selected_units(pack, units, scope):
    """Resolve a program/course and its prerequisite closure without granting access."""
    if not scope:
        return units, {u["skillId"] for u in units}, None
    kind, key = scope
    if kind == "syllabi":
        selected = next((s for s in pack["syllabi"] if s["id"] == key), None)
        require(selected, "Programma universitario non disponibile.", 404)
        target_units = [u for u in units if u["skillId"] in selected.get("skills", [])
                        or u["courseId"] in selected.get("courses", [])]
    else:
        selected = next((c for c in pack["courses"] if c["id"] == key), None)
        require(selected, "Microcorso non disponibile.", 404)
        target_units = [u for u in units if u["courseId"] == key]
    targets = {u["skillId"] for u in target_units}
    prerequisites = {s["id"]: s.get("prerequisites", []) for s in pack["skills"]}
    closure, pending = set(targets), list(targets)
    while pending:
        for dependency in prerequisites[pending.pop()]:
            if dependency not in closure:
                closure.add(dependency)
                pending.append(dependency)
    target_ids = {u["id"] for u in target_units}
    return [u for u in units if u["id"] in target_ids or u["skillId"] in closure - targets], targets, {
        "kind": kind, "id": key, "title": selected["title"]}


def notebook(db, user, pack, allowed, now, scope=None):
    uid, discipline = user["id"], pack["id"]
    history = practice_history(db, uid, discipline)
    units = [dict(u, courseId=c["id"]) for c in pack["courses"] if c["id"] in allowed for u in c["units"]]
    units, target_skills, scope_info = selected_units(pack, units, scope)
    by_id = {u["id"]: u for u in units}
    eligible_skills = {u["skillId"] for u in units}
    _, _, verified, legacy = family_evidence(db, uid, discipline)
    model = {}
    for skill in eligible_skills:
        h = history.get(skill, {})
        model[skill] = {k: int(h.get(k, 0)) for k in ("exposures", "completions", "assisted", "independent", "transfer", "retention", "errors")}
        model[skill]["transfer"] = verified.get(skill, 0)
        model[skill]["legacyTransfer"] = legacy.get(skill, 0)
        last = h.get("lastIndependent")
        model[skill]["dueAt"] = last + (RETAINED_DELAY if h.get("retention") else REVIEW_DELAY) if last is not None else None
    attempted = {r[0] for r in db.execute("SELECT DISTINCT activity FROM discipline_events INDEXED BY discipline_seen WHERE user=? AND discipline=? "
                                          "AND kind IN ('answer','hint')", (uid, discipline))}
    resume = None
    for r in db.execute("SELECT unit,activity FROM discipline_events INDEXED BY discipline_history WHERE user=? AND discipline=? ORDER BY seq DESC", (uid, discipline)):
        if r[0] in by_id:
            resume = {"unitId": r[0], "activityId": r[1] if r[1] in by_id[r[0]]["activityIds"] else None}
            break
    prerequisites = {s["id"]: s.get("prerequisites", []) for s in pack["skills"]}
    recovery_dependencies, pending = set(), []
    for skill in eligible_skills:
        h = history.get(skill, {})
        if (h.get("lastError") or 0) > (h.get("lastSuccess") or 0):
            pending.extend(prerequisites[skill])
    while pending:
        dependency = pending.pop()
        if dependency not in recovery_dependencies and not model.get(dependency, {}).get("independent"):
            recovery_dependencies.add(dependency)
            pending.extend(prerequisites[dependency])
    choices = []
    for unit in units:
        skill = unit["skillId"]
        fresh = next((a for a in unit["activityIds"] if a not in attempted), None)
        h, m = history.get(skill, {}), model[skill]
        missing = [dep for dep in prerequisites[skill] if not model.get(dep, {}).get("independent")]
        outside_scope = scope_info is not None and skill not in target_skills
        error = (h.get("lastError") or 0) > (h.get("lastSuccess") or 0)
        due = m["dueAt"] is not None and m["dueAt"] <= now
        if outside_scope and m["independent"] and not error and not due:
            continue
        if error:
            rank, code, why = 0, "recovery", "Riprendi il passaggio in cui hai avuto una difficoltà e prova un quesito diverso."
        elif due:
            rank, code, why = 1, "delayed-review", "È trascorso l’intervallo di ripasso. Prova un quesito nuovo senza indizi."
        elif not m["independent"] and not missing:
            rank, code, why = 2, "first-evidence", "Puoi affrontare questo obiettivo con i prerequisiti già documentati."
        elif not m["independent"]:
            rank, code, why = 3, "prerequisites", "Inizia dalla lezione e consulta i prerequisiti indicati."
        else:
            rank, code, why = 4, "practice", "Applica la stessa competenza a un nuovo quesito."
        if not h and not missing:
            code, why = "first-step", "Non hai ancora una prova autonoma su questo obiettivo. Parti da un quesito o apri la lezione."
        if outside_scope:
            why = "Questo prerequisito sostiene il programma scelto. " + why
        limitation = None
        if fresh is None:
            limitation = ("Hai già incontrato tutti i quesiti di questa unità. Puoi rivedere la spiegazione e riprovare con supporto; "
                          "per una nuova verifica autonoma serve un quesito non ancora visto.")
            if error:
                why = "Riprendi la spiegazione e confronta i passaggi dei tentativi da rivedere."
            elif due:
                why = "È il momento del ripasso. Ricostruisci il procedimento prima di riaprire la spiegazione."
            else:
                rank, code, why = 5, "pool-exhausted", "Rivedi il procedimento o scegli un altro obiettivo del programma."
            if outside_scope:
                why = "Questo prerequisito sostiene il programma scelto. " + why
        if skill in recovery_dependencies and not missing:
            rank, code = -1, "recover-prerequisite"
            why = "Riprendi questo prerequisito prima di tornare all’obiettivo in cui hai avuto una difficoltà."
            if outside_scope:
                why += " È collegato al programma scelto anche se ne precede gli argomenti."
        target = fresh if not missing else None
        choices.append((rank, target is None, {"unitId": unit["id"], "activityId": target, "reason": why,
                               "action": "practice" if target is not None else "review-lesson", "reasonCode": code,
                               "freshEvidenceAvailable": fresh is not None, "limitation": limitation,
                               "prerequisite": outside_scope, "missingPrerequisites": missing}))
    recommended = min(choices, key=lambda item: item[:2])[2] if choices else None
    return {"version": pack["version"], "skills": model, "resume": resume, "next": recommended,
            "policyVersion": POLICY_VERSION, "scope": scope_info}


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
        stat = db.execute("SELECT lastIndependent FROM discipline_skill_stats WHERE user=? AND discipline=? AND skill=?",
                          (user["id"], discipline, unit["skillId"])).fetchone()
        previous = stat[0] if stat else None
        independent = correct and not assisted
        successful, encountered, _, _ = family_evidence(db, user["id"], discipline, unit["skillId"])
        known_families = successful.get(unit["skillId"], set())
        family = activity.get("familyId")
        transfer = bool(independent and family and known_families and family not in encountered.get(unit["skillId"], {})
                        and activity.get("assessmentRole") == "transfer")
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
    if len(tail) == 5 and tail[0] == "units" and tail[2] == "activities" and tail[4] == "receipt" and not post:
        unit = ed.get_unit(db, discipline, pack["version"], tail[1])
        require(unit["courseId"] in allowed, "Accesso al microcorso richiesto.", 403)
        require(any(a["id"] == tail[3] for a in unit["activities"]), "Attività estranea all’unità.", 404)
        row = db.execute("SELECT * FROM discipline_events WHERE user=? AND discipline=? AND version=? AND unit=? AND activity=? "
                         "AND kind='answer' ORDER BY seq DESC LIMIT 1",
                         (user["id"], discipline, pack["version"], unit["id"], tail[3])).fetchone()
        if row:
            request = json.loads(row["request"])
            return {"receipt": dict(response_for(row, unit), requestId=row["request_id"], optionId=request["optionId"], stamp=row["stamp"]),
                    "previousEdition": False}
        previous = db.execute("SELECT 1 FROM discipline_events WHERE user=? AND discipline=? AND unit=? AND activity=? "
                              "AND kind='answer' LIMIT 1", (user["id"], discipline, unit["id"], tail[3])).fetchone()
        return {"receipt": None, "previousEdition": bool(previous)}
    if len(tail) == 3 and tail[0] == "courses" and tail[2] == "editorial-library" and not post:
        from server.editorial.service import editorial_library
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
    if len(tail) == 3 and tail[0] == "me" and tail[1] in ("syllabi", "courses") and not post:
        return notebook(db, user, pack, allowed, store.NOW(), (tail[1], tail[2]))
    if tail == ["events"] and post:
        return write_event(db, user, pack, allowed, data, store.NOW())
    raise Problem("Risorsa o metodo non disponibile.", 404)
