"""Search the published catalogue using only its public orientation metadata."""
import re
import unicodedata

from .catalog import in_course
from .errors import require


KINDS = ("course", "lesson", "example", "question", "experiment", "bench", "lab", "method")
PAGE_SIZE = 12


def words(text):
    folded = unicodedata.normalize("NFKD", text.casefold())
    return re.findall(r"[^\W_]+", "".join(c for c in folded if not unicodedata.combining(c)))


def search_catalog(rows, params):
    """Pure projection. The caller supplies a consistent snapshot of published versions."""
    require(set(params) <= {"q", "course", "kind", "page"}, "Parametro di ricerca sconosciuto.")
    query = params.get("q", "")
    course, kind = params.get("course", ""), params.get("kind", "")
    raw_page = params.get("page", "1")
    require(len(query) <= 96, "Usa al massimo 96 caratteri per la ricerca.")
    require(not kind or kind in KINDS, "Tipo di materiale sconosciuto.")
    require(re.fullmatch(r"[1-9][0-9]{0,3}", raw_page), "Numero di pagina non valido.")
    page = int(raw_page)
    courses = {r["id"]: r for r in rows if r["kind"] == "course"}
    require(not course or course in courses, "Percorso sconosciuto.")
    candidates = [courses[course], *in_course(rows, course)] if course else rows
    public = [r for r in candidates if r["kind"] in KINDS and not r.get("exam") and (not kind or r["kind"] == kind)]
    terms = words(query)
    lessons = {r["id"]: r["title"] for r in rows if r["kind"] == "lesson"}
    matches = []
    for row in public:
        rank = 0
        if query.strip():
            if not terms:
                break
            title = words(row["title"])
            identifier = words(row["id"])
            if terms == identifier:
                rank = 0
            elif terms == title:
                rank = 1
            elif all(any(w.startswith(t) for w in title) for t in terms):
                rank = 2
            else:
                # Deliberately exclude prompts, solutions, notes and assessment keys.
                topics = row.get("coverage", ()) if row["kind"] == "lesson" else ()
                context = " ".join((row.get("section", ""), lessons.get(row.get("skill"), ""), *topics))
                vocabulary = title + identifier + words(context)
                if not all(any(w.startswith(t) for w in vocabulary) for t in terms):
                    continue
                rank = 3
        matches.append(((rank, KINDS.index(row["kind"]), row["course"], row.get("order", 0), row["id"]), row))
    matches.sort(key=lambda pair: pair[0])
    start = (page - 1) * PAGE_SIZE
    fields = ("id", "kind", "course", "title", "version")
    items = [{k: row[k] for k in fields} for _, row in matches[start:start + PAGE_SIZE]]
    return {"total": len(matches), "page": page, "pageSize": PAGE_SIZE, "items": items}
