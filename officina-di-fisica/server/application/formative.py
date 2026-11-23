"""Formative variants attached to an already authorized, edition-pinned run view."""
# This is the source of the variant's SI parameters. The browser consumes this descriptor.
SIGNED_RETURN = {
    "id": "ritorno-7s-v1",
    "origin": 0,
    "legs": [{"velocity": 3, "duration": 4}, {"velocity": -2, "duration": 7}],
}


def attach_formative_variant(run, session_scope):
    if run["mode"] != "practice" or run["course"] != "C1" or run["sealed"]:
        return
    for item in run["items"]:
        if (item["id"] == "C1-Q027" and item["version"] == 2
                and item["sent"] and item.get("correct") is False):
            item["formative"] = {"session": session_scope, "variant": SIGNED_RETURN}
