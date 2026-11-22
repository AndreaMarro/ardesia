"""Editorial invariants for published learning objects. The caller supplies the installation catalogue."""
from collections.abc import Callable, Mapping
from dataclasses import dataclass
import math

from .errors import require
from .identity import safe_key
from .method import validate_method


@dataclass(frozen=True)
class ContentPolicy:
    experiments: Mapping
    lab_spec: Mapping
    exam_profile: Callable[[dict], dict | None]
    check_engine: Callable[[dict], None]
    asset_exists: Callable[[str], bool]


KINDS = {"course", "section", "lesson", "example", "question", "lab", "method", "bench", "experiment"}
TYPES = {"text", "formula", "figure", "attachment", "example", "question", "lab"}
CATEGORIES = {"concetto", "calcolo", "algebra", "unità", "testo", "modello"}


def validate_record(r: dict, objects: dict, policy: ContentPolicy) -> bool:
    require(isinstance(r, dict) and safe_key(r.get("id")), "ID assente o non valido.")
    require(r.get("kind") in KINDS, "Tipo di materiale non valido.")
    require(
        isinstance(r.get("title"), str) and bool(r["title"].strip()),
        "Inserisci il titolo.",
    )
    require(
        isinstance(r.get("order"), (int, float)) and math.isfinite(r["order"]),
        "Posizione non valida.",
    )
    require(isinstance(r.get("section", ""), str), "Sezione non valida.")

    def ref(key, kinds):
        require(
            isinstance(key, str) and key in objects and objects[key]["kind"] in kinds,
            "Riferimento non disponibile: " + str(key),
        )

    kind = r["kind"]
    ref(r.get("course"), {"course"})
    if kind == "course":
        policy.exam_profile(r)
        require(
            r["course"] == r["id"],
            "L’ID del corso deve coincidere con il corso principale.",
        )
        for k in r.get("includes", []):
            ref(k, {"course"})

    for k in r.get("reuse", []):
        ref(k, {"course"})
    if r.get("skill"):
        ref(r["skill"], {"lesson"})
    for k in r.get("prerequisites", []):
        ref(k, {"lesson"})
    require(isinstance(r.get("blocks"), list), "Blocchi mancanti.")
    for b in r["blocks"] + r.get("promptBlocks", []):
        require(
            isinstance(b, dict)
            and b.get("type") in TYPES
            and isinstance(b.get("text", ""), str),
            "Blocco non valido.",
        )
        if b["type"] in ("figure", "attachment"):
            require(
                policy.asset_exists(b.get("src")),
                "File assente o percorso non valido: " + str(b.get("src")),
            )
        if b["type"] in ("example", "lab", "question"):
            ref(b.get("ref"), {b["type"]})
    if kind in ("example", "question"):
        require(
            r.get("prompt") and r.get("family") and r.get("skill") and r["blocks"],
            "Servono consegna, famiglia, competenza e svolgimento.",
        )
        require(r.get("difficulty") in (1, 2, 3), "Difficoltà da 1 a 3.")
    if "scaffold" in r:
        hint = r["scaffold"]
        require(kind == "lesson" and isinstance(hint, dict) and set(hint) == {"strategy", "citation"}
                and hint["strategy"] in ("confronta-le-misure", "richiama-prerequisito", "segui-un-esempio")
                and any(b["type"] == "text" and b["text"][:1600] == hint["citation"] for b in r["blocks"]),
                "L’aiuto deve citare un passaggio della versione corrente.")
    if kind == "method":
        validate_method(r)
    if kind == "experiment":
        ref(r.get("skill"), {"lesson"})
        lesson = objects[r["skill"]]
        require(
            lesson["course"] == r["course"] and r.get("topic") in lesson.get("coverage", ()),
            "Collega la simulazione a una voce della sua lezione.",
        )
        anchor = r.get("anchor")
        require(
            isinstance(anchor, str) and anchor.strip()
            and any(b["type"] == "text" and b["text"].startswith(anchor) for b in lesson["blocks"]),
            "Il paragrafo associato è assente.",
        )
        require(
            all(isinstance(r.get(k), str) and r[k].strip()
                for k in ("formula", "interpretation", "summary", "transferPrompt")),
            "Completa il percorso sperimentale.",
        )
        require(r["transferPrompt"].count("{x}") == 1,
                "Indica il dato del problema di trasferimento con {x}.")
        source = policy.experiments.get(r["id"])
        physics = ("skill", "topic", "apparatus", "control", "measure", "references", "substitution", "discrete")
        require("engineSpec" not in r, "Il descrittore proviene dall'installazione.")
        if source is None and "engine" in r:
            policy.check_engine(r)
        else:
            require(source is not None and "engine" not in r and all(r.get(k) == source.get(k) for k in physics),
                    "Misure e parametri devono corrispondere al modello fisico installato.")
    if kind == "bench":
        require(r.get("model") in ("piano", "volo", "stevino", "tubo", "gas", "calore",
                                   "campo", "circuito", "lente", "onde"), "Scena 3D sconosciuta.")
        def text(value):
            return isinstance(value, str) and bool(value.strip())

        related = r.get("related")
        require(text(r.get("summary")) and isinstance(related, list) and related,
                "Completa obiettivo e collegamenti.")
        for target in related:
            ref(target, {"lesson", "example", "question"})
        topics = r.get("topics")
        require(isinstance(topics, list), "Voci di lezione mancanti.")
        for topic in topics:
            require(isinstance(topic, dict) and all(text(topic.get(k)) for k in
                    ("lesson", "anchor", "topic", "question")), "Voce della lezione incompleta.")
            ref(topic["lesson"], {"lesson"})
            require(topic["lesson"] in related, "Collega anche la lezione della voce.")
        prediction = r.get("prediction")
        require(isinstance(prediction, dict), "Previsione del banco mancante.")
        options = prediction.get("options")
        require(text(prediction.get("question")) and text(prediction.get("why"))
                and isinstance(options, list) and 2 <= len(options) <= 8
                and all(text(o) for o in options) and len(set(options)) == len(options)
                and type(prediction.get("correct")) is int and 0 <= prediction["correct"] < len(options),
                "Completa la previsione del banco.")
        checks = r.get("assessment")
        require(isinstance(checks, list) and len(checks) == 2 and
                all(isinstance(a, dict) and all(text(a.get(k)) for k in ("prompt", "unit", "worked"))
                    and type(a.get("value")) in (float, int) and math.isfinite(a["value"]) for a in checks),
                "Completa verifica e problema di trasferimento.")
    if kind == "lab":
        model = r.get("model")
        require(model in policy.lab_spec["parameters"], "Modello di laboratorio sconosciuto.")
        defaults = r.get("defaults", {})
        require(
            isinstance(defaults, dict), "Configurazione iniziale del banco non valida."
        )
        bounds = {row[0]: row[3:6] for row in policy.lab_spec["parameters"][model]}
        for param, value in defaults.items():
            if param == "mode":
                require(
                    value in policy.lab_spec["modes"].get(model, []),
                    "Trasformazione o collegamento non valido.",
                )
                continue
            require(param in bounds, "Parametro non supportato dal modello: " + param)
            lo, hi, step = bounds[param]
            require(
                type(value) in (int, float)
                and math.isfinite(value)
                and lo <= value <= hi
                and abs((value - lo) / step - round((value - lo) / step)) < 1e-7,
                "Valore iniziale fuori intervallo o passo non valido: " + param,
            )
        for field in ("prediction", "observation", "interpretation"):
            require(
                isinstance(r.get(field), str) and r[field].strip(),
                "Completa previsione, osservazione e interpretazione.",
            )
    if kind == "question":
        a = r.get("answer", {})
        require(
            a.get("type") in ("choice", "numeric", "text"),
            "Tipo di risposta non valido.",
        )
        require("value" in a and str(a["value"]).strip(), "Risposta corretta mancante.")
        if a["type"] == "choice":
            ops = a.get("options", [])
            require(
                2 <= len(ops) <= 8
                and len(set(ops)) == len(ops)
                and a["value"] in ops
                and all(isinstance(x, str) and x.strip() for x in ops),
                "Controlla opzioni distinte e chiave.",
            )
        if a["type"] == "numeric":
            require(
                isinstance(a["value"], (int, float))
                and math.isfinite(a["value"])
                and isinstance(a.get("tolerance"), (float, int))
                and 0 <= a["tolerance"] < math.inf
                and isinstance(a.get("unit", ""), str),
                "Valore, unità e tolleranza assoluta richiesti.",
            )
        if r.get("exam"):
            policy = policy.exam_profile(objects[r["course"]])
            require(
                policy and type(r["exam"]) is int and 1 <= r["exam"] <= policy["papers"],
                "Fascicolo d’esame non valido.",
            )
            require(
                a["type"] != "choice" or len(a["options"]) == policy["options"],
                "Il numero di opzioni deve corrispondere al profilo d’esame.",
            )
        require(
            isinstance(a.get("aliases", []), list)
            and all(isinstance(v, str) for v in a.get("aliases", [])),
            "Sinonimi non validi.",
        )
        require(
            isinstance(r.get("hints"), list)
            and all(isinstance(v, str) and v.strip() for v in r["hints"]),
            "Suggerimenti non validi.",
        )
        er = r.get("error", {})
        require(
            r.get("hints") and er.get("message") and er.get("category") in CATEGORIES,
            "Inserisci suggerimento, categoria e feedback.",
        )
        target = er.get("target", "")
        if target.startswith("lab:"):
            require(
                any(
                    t.get("kind") == "lab" and t.get("course") == target[4:]
                    for t in objects.values()
                ),
                "Laboratorio di recupero non disponibile.",
            )
        else:
            ref(target, {"lesson", "lab"})
    return True
