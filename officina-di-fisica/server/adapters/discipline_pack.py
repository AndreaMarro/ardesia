"""Read an operator-supplied curriculum. Only student-facing fields enter catalog projections."""
import json
from pathlib import Path

from ..domain.errors import Problem, require
from ..domain.identity import safe_key

SCHEMA_VERSION = 1
PHYSICS = "fisica"


def fields(value, *names):
    return {key: value[key] for key in names if key in value}


def identifier(value):
    require(safe_key(value), "Identificatore disciplinare non valido.")
    return value


def indexed(items, label):
    require(isinstance(items, list) and items, f"Elenco {label} vuoto o non valido.")
    result = {}
    for item in items:
        require(isinstance(item, dict), f"Voce {label} non valida.")
        key = identifier(item.get("id"))
        require(key not in result, f"Identificatore duplicato in {label}: {key}")
        result[key] = item
    return result


def prose(value):
    return isinstance(value, str) and bool(value.strip())


def paragraphs(value):
    return isinstance(value, list) and value and all(
        isinstance(step, dict) and prose(step.get("title")) and prose(step.get("body")) for step in value
    )


def check_graph(records):
    """Kahn's algorithm; finite even with a self-loop or a malformed long chain."""
    dependencies = {}
    dependents = {key: [] for key in records}
    for key, item in records.items():
        deps = item.get("prerequisites", [])
        require(isinstance(deps, list) and all(safe_key(dep) for dep in deps), "Prerequisiti non validi.")
        require(len(deps) == len(set(deps)) and set(deps) <= records.keys(), "Prerequisito assente o duplicato.")
        dependencies[key] = len(deps)
        for dep in deps:
            dependents[dep].append(key)
    ready = [key for key, count in dependencies.items() if not count]
    count = 0
    while ready:
        count += 1
        for child in dependents[ready.pop()]:
            dependencies[child] -= 1
            if not dependencies[child]:
                ready.append(child)
    require(count == len(records), "Ciclo nel grafo dei prerequisiti.")


def check_activity(activity, skill):
    require(activity.get("kind") == "quiz" and activity.get("skillId") == skill, "Quesito o competenza incompatibile.")
    require(prose(activity.get("prompt")) and paragraphs(activity.get("solution")), "Consegna o svolgimento incompleto.")
    options = indexed(activity.get("options"), "alternative")
    require(len(options) >= 2 and all(prose(o.get("text")) for o in options.values()), "Alternative insufficienti.")
    require(len({o["text"].strip().casefold() for o in options.values()}) == len(options), "Alternative duplicate.")
    require(activity.get("correctOptionId") in options, "Risposta valida assente.")
    feedback = activity.get("feedback")
    require(isinstance(feedback, dict) and feedback.keys() == options.keys()
            and all(prose(x) for x in feedback.values()), "Spiegare ogni alternativa.")
    hints = activity.get("hints")
    require(isinstance(hints, list) and all(prose(h) for h in hints), "Indizi non validi.")
    transfer = activity.get("transfer")
    require(isinstance(transfer, dict) and all(prose(transfer.get(k)) for k in ("prompt", "answer")),
            "Manca il problema di trasferimento svolto.")
    require(activity.get("assessmentRole", "practice") in ("practice", "transfer"), "Finalità non valida.")


def read_json(path):
    try:
        require(path.is_file() and path.stat().st_size <= 12_000_000, "File del corso assente o troppo grande.")
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValueError) as exc:
        raise Problem(f"File curriculare illeggibile: {path.name}") from exc


def load_pack(catalog_path):
    """Accept only files below this private pack root, including after symlink resolution."""
    catalog_path = Path(catalog_path).resolve()
    root = catalog_path.parent
    catalog = read_json(catalog_path)
    require(isinstance(catalog, dict) and catalog.get("schemaVersion") == SCHEMA_VERSION, "Formato del corso incompatibile.")
    discipline = identifier(catalog.get("id"))
    require(discipline != PHYSICS and prose(catalog.get("title")), "Disciplina riservata o titolo assente.")
    version = catalog.get("version")
    require(isinstance(version, (str, int)) and not isinstance(version, bool) and safe_key(str(version)),
            "Versione del corso non valida.")
    courses = indexed(catalog.get("courses"), "microcorsi")
    skills = indexed(catalog.get("skills"), "competenze")
    check_graph(skills)
    check_graph(courses)
    for skill in skills.values():
        require(prose(skill.get("title")), "Titolo della competenza mancante.")
    syllabi = catalog.get("syllabi", [])
    require(isinstance(syllabi, list), "Elenco programmi non valido.")
    if syllabi:
        indexed(syllabi, "programmi")
    result = fields(catalog, "id", "title", "summary", "schemaVersion")
    result.update(version=str(version), summary=catalog.get("summary", ""), courses=[], skills=[fields(s, "id", "title", "prerequisites") for s in skills.values()],
                  syllabi=[fields(s, "id", "title", "year", "url", "skills", "courses", "degree", "credits", "baseline", "accessed", "assessment", "coverage", "topics", "alignment") for s in syllabi])
    symbols = catalog.get("symbols", [])
    require(isinstance(symbols, list) and all(isinstance(s, dict) and all(prose(s.get(k)) for k in ("symbol", "reading", "meaning")) for s in symbols),
            "Glossario dei simboli non valido.")
    result["symbols"] = [fields(s, "symbol", "reading", "meaning") for s in symbols]
    units = {}
    activity_ids = set()
    course_skills = set()
    for course in courses.values():
        filename = course.get("file")
        require(isinstance(filename, str), "File del microcorso assente.")
        path = (root / filename).resolve()
        require(path.is_relative_to(root) and path.suffix == ".json" and path != catalog_path, "Percorso del microcorso non valido.")
        source = read_json(path)
        require(isinstance(source, dict) and source.get("id") == course["id"] and prose(course.get("title")), "Microcorso incoerente.")
        outline = fields(course, "id", "title", "summary", "skills", "prerequisites")
        covered = course.get("skills")
        require(isinstance(covered, list) and covered and all(safe_key(k) and k in skills for k in covered), "Competenze del microcorso non valide.")
        formulas = source.get("formulas", course.get("formulas", []))
        require(not formulas or paragraphs(formulas), "Formulario non valido.")
        outline.update(units=[], formulas=formulas)
        for key, unit in indexed(source.get("units"), "unità").items():
            skill = unit.get("skillId")
            require(key not in units and skill in covered, "Identità o competenza dell’unità incoerente.")
            require(prose(unit.get("title")) and prose(unit.get("objective")) and paragraphs(unit.get("lesson")), "Lezione incompleta.")
            oral = unit.get("oral")
            require(isinstance(oral, dict) and prose(oral.get("prompt")) and isinstance(oral.get("solution"), list)
                    and oral["solution"] and all(prose(s) for s in oral["solution"]), "Verifica orale incompleta.")
            activities = indexed(unit.get("activities"), "attività")
            require(activity_ids.isdisjoint(activities), "Identificatore di attività riutilizzato.")
            activity_ids.update(activities)
            for item in activities.values():
                check_activity(item, skill)
            units[key] = dict(unit, courseId=course["id"])
            outline["units"].append(dict(fields(unit, "id", "skillId", "title", "objective"), activityIds=list(activities)))
        unit_skills = {u["skillId"] for u in outline["units"]}
        require(unit_skills == set(covered), "Competenza del microcorso senza unità o valutazione.")
        course_skills.update(unit_skills)
        result["courses"].append(outline)
    require(course_skills == skills.keys(), "Competenza senza microcorso o valutazione.")
    exams = catalog.get("exams", [])
    require(isinstance(exams, list), "Simulazioni non valide.")
    result["exams"] = []
    syllabus_ids = {s["id"] for s in syllabi}
    for exam in (indexed(exams, "simulazioni").values() if exams else []):
        ids = exam.get("activityIds")
        require(exam.get("mode") == "practice" and prose(exam.get("title")) and isinstance(ids, list) and ids
                and all(isinstance(a, str) and a in activity_ids for a in ids) and len(set(ids)) == len(ids),
                "Simulazione con attività mancanti o duplicate.")
        require(not exam.get("syllabusId") or exam["syllabusId"] in syllabus_ids, "Programma della prova assente.")
        result["exams"].append(fields(exam, "id", "title", "syllabusId", "description", "activityIds", "suggestedMinutes", "mode"))
    return result, units


def student_unit(unit, version):
    result = fields(unit, "id", "skillId", "title", "objective", "courseId", "lesson", "oral", "representation")
    result["version"] = version
    result["activities"] = [dict(fields(a, "id", "kind", "skillId", "prompt"),
                                 options=[fields(o, "id", "text") for o in a["options"]],
                                 hintCount=len(a["hints"])) for a in unit["activities"]]
    return result
