"""Read the learner's retained answers and reopen existing learning activities."""
import json
import re
from collections import Counter, defaultdict

from ..domain.assessment import trace
from ..domain.catalog import courses_for, in_course
from ..domain.error_diary import CATEGORIES, choose_retest, follow_up, recommendation
from ..domain.errors import require
from ..domain.identity import digest, need_user, safe_key
from .study import recovery_resource, start
from .study_port import StudyRepository

PAGE_SIZE = 12


def reference(row):
    return {"id": row["id"], "kind": row["kind"], "title": row["title"]} if row else None


class ErrorDiary:
    """Request-scoped snapshot. Access and current destinations are checked on every reopening."""
    def __init__(self, repo: StudyRepository, user, rows, course):
        need_user(user)
        require(repo.entitled(user, rows, course), "Apri il quaderno del percorso.", 403)
        self.repo, self.user, self.course, self.rows = repo, user, course, rows
        self.current = [r for r in in_course(rows, course) if not r.get("exam")]
        self.index = {r["id"]: r for r in self.current}
        self.resources = defaultdict(lambda: defaultdict(list))
        for row in self.current:
            self.resources[row.get("skill")][row["kind"]].append(row)
        allowed = {r["id"] for r in rows if r["kind"] == "course" and repo.entitled(user, rows, r["id"])}
        self.versions = {}
        scoped = {}
        self.history = defaultdict(list)
        self.errors = []
        self.repeated = Counter()
        for attempt in repo.diary_attempts(user["id"]):
            if attempt["run_course"] not in allowed:
                continue
            key = (attempt["id"], attempt["v"])
            if key not in self.versions:
                self.versions[key] = repo.record(*key)
                scoped[key] = course in courses_for(rows, self.versions[key])
            if not scoped[key]:
                continue
            self.history[attempt["skill"]].append(attempt)
            if not attempt["correct"]:
                self.errors.append(attempt)
                self.repeated[attempt["skill"]] += 1
        self.mastery = trace(a for group in self.history.values() for a in group)
        self.exposed = repo.exposures(user["id"])
        self.seen = {key for key, _ in self.exposed}
        self.seen.update(a["id"] for group in self.history.values() for a in group)
        self.now = repo.now()

    def original(self, error):
        return self.versions[error["id"], error["v"]]

    def alternate(self, error):
        skill = error["skill"]
        families = {a["family"] for a in self.history[skill]}
        return choose_retest(self.original(error), self.resources[skill]["question"], self.seen, families)

    def entry(self, error, minutes):
        original = self.original(error)
        skill = error["skill"]
        lesson = self.index.get(skill)
        protected = bool(original.get("exam") or error["mode"] == "exam")
        category = original.get("error", {}).get("category", "")
        observed = follow_up(error, self.history[skill])
        prior = [self.index[k] for k in dict.fromkeys(original.get("prerequisites", []) + (lesson or {}).get("prerequisites", []))
                 if k != skill and k in self.index and self.index[k]["kind"] == "lesson"]
        weak = next((r for r in prior if self.mastery.get(r["id"], {}).get("state") == "da consolidare"), None)
        target = lesson if protected else recovery_resource(self.current, original)
        figures = self.resources[skill]["experiment"]
        drawing = target if target and target["kind"] in ("experiment", "lab", "bench") else next(iter(figures), None)
        alternate = self.alternate(error)
        run = self.repo.run(error["run"], self.user["id"])
        submitted = json.loads(run["items"])[error["idx"]]
        question = None
        if not protected:
            question = {"id": original["id"], "version": error["v"], "title": original["title"],
                        "prompt": original["prompt"], "response": str(submitted["answer"]) if submitted.get("answer") is not None else "",
                        "unit": original.get("answer", {}).get("unit", "")}
        next_step = recommendation(observed, self.repeated[skill], bool(weak), minutes, self.now, bool(error["aided"]))
        available = {"prerequisite": weak or lesson, "explanation": target, "representation": drawing,
                     "retry": alternate, "review": True}
        if not available[next_step["step"]]:
            next_step = {"step": "explanation" if target else "review",
                         "reason": "Alcuni materiali sono stati ritirati. Il diario conserva l’errore e indica le attività ancora disponibili."}
        if next_step["step"] == "retry" and alternate:
            level = alternate["difficulty"]
            same_level = not protected and level == original.get("difficulty")
            level_note = f"Il livello è lo stesso del primo quesito ({level} su 3)." if same_level else f"Il nuovo quesito di studio è di livello {level} su 3."
            next_step["reason"] += " " + level_note
        return {"run": error["run"], "index": error["idx"], "at": error["stamp"], "skill": skill,
                "source": "esame consegnato" if protected else error["mode"],
                "question": question,
                "title": (lesson or {}).get("title", "Competenza della prova") if protected else original["title"],
                "category": CATEGORIES.get(category, "Passaggio da ricostruire"),
                "diagnosis": ("Ricostruisci il principio della lezione e applicalo a un nuovo caso."
                              if protected else original.get("error", {}).get("message", "Ricostruisci il passaggio.")),
                "assisted": bool(error["aided"]), "hints": submitted.get("hints", 0),
                "solutionAvailable": (error["id"], error["v"]) in self.exposed,
                "repetitions": self.repeated[skill], "observed": observed,
                "prerequisite": reference(weak or next(iter(prior), None) or lesson),
                "explanation": reference(target), "representation": reference(drawing),
                "retryAvailable": bool(alternate), "retryFresh": bool(alternate and alternate["id"] not in self.seen),
                "next": next_step}

    def page(self, params):
        require(set(params) <= {"page", "minutes"}, "Filtro del diario sconosciuto.")
        raw = params.get("page", "1")
        require(re.fullmatch(r"[1-9][0-9]{0,4}", raw), "Pagina del diario non valida.")
        minutes = params.get("minutes", "5")
        require(minutes in ("5", "15"), "Scegli 5 oppure 15 minuti.")
        page = int(raw)
        offset = (page - 1) * PAGE_SIZE
        latest = self.errors[::-1][offset:offset + PAGE_SIZE]
        return {"course": self.course, "total": len(self.errors), "page": page, "pageSize": PAGE_SIZE,
                "minutes": int(minutes), "now": self.now, "items": [self.entry(a, int(minutes)) for a in latest]}

    def retry(self, data):
        require(set(data) == {"run", "index", "requestId"} and isinstance(data["run"], str) and type(data["index"]) is int,
                "Seleziona un errore del tuo diario.")
        error = next((a for a in self.errors if a["run"] == data["run"] and a["idx"] == data["index"]), None)
        require(error, "Errore non presente nel diario di questo percorso.", 404)
        require(isinstance(data["requestId"], str) and safe_key(data["requestId"]), "Identificativo della richiesta non valido.")
        key = digest(json.dumps(["diario-v1", self.course, error["run"], error["idx"], data["requestId"]]))
        previous = self.repo.previous_run(self.user["id"], digest(self.user["id"] + ":" + key))
        if previous:
            return {"id": previous}
        next_question = self.alternate(error)
        require(next_question, "Per questa competenza non è pubblicata una famiglia diversa.", 409)
        return start(self.repo, self.user, self.rows, {"course": self.course, "mode": "retest",
                     "item": next_question["id"], "requestId": key})
