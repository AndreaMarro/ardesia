"""Course inclusion and reusable learning objects, independent of storage."""

def courses_for(rows, r):
    if r["kind"] == "course":
        return {r["id"]}
    direct = {r["course"], *r.get("reuse", [])}
    while True:
        nested = {
            c["id"]
            for c in rows
            if c["kind"] == "course" and direct.intersection(c.get("includes", []))
        }
        if nested <= direct:
            return direct
        direct.update(nested)


def in_course(rows, key, kind=None):
    # Resolve included courses once, then test each material's primary and reused courses.
    courses = {r["id"]: r.get("includes", ()) for r in rows if r["kind"] == "course"}
    included = {key}
    pending = [key]
    while pending:
        children = set(courses.get(pending.pop(), ())) - included
        included.update(children)
        pending.extend(children)
    return sorted(
        (
            r
            for r in rows
            if r["kind"] != "course"
            and (not kind or r["kind"] == kind)
            and (r["course"] in included or not included.isdisjoint(r.get("reuse", ())))
        ),
        key=lambda r: (r["course"], r.get("order", 0), r["id"]),
    )
