"""Operator-installed plugins. Author packages reference an exact version, never executable paths."""
import hashlib
import json
import math
import os
from functools import lru_cache
from pathlib import Path

from .contracts import schema, validate
from ..domain.errors import require
from ..domain.science import UNITS, measurement, number

DEFAULT = Path(__file__).resolve().parents[2] / "extensions"


@lru_cache
def load_registry(directory):
    directory = directory.resolve()
    engines = {}
    for manifest in sorted(directory.glob("*/*/manifest.json")):
        meta = json.loads(manifest.read_text())
        validate(meta, schema("engine-v1"))
        key = (meta["id"], meta["version"])
        require(key == (manifest.parent.parent.name, manifest.parent.name) and key not in engines,
                "Identità o versione duplicata del motore.")
        require(meta["inputUnit"] in UNITS and meta["outputUnit"] in UNITS, "Unità non supportata dal contratto.")
        script = manifest.with_name("engine.js")
        require(script.resolve().is_relative_to(directory) and manifest.resolve().is_relative_to(directory),
                "Il motore deve appartenere all'installazione.")
        code = script.read_bytes()
        require(len(code) <= 256_000 and hashlib.sha256(code).hexdigest() == meta["sha256"],
                "Impronta del modulo installato non valida.")
        for x, expected in meta["references"]:
            require(math.isclose(measurement(meta, x), expected, rel_tol=1e-9, abs_tol=1e-12),
                    "Riferimento indipendente del motore non verificato.")
        engines[key] = (meta, code)
    return engines


def registry():
    return load_registry(Path(os.environ.get("ASTRA_EXTENSIONS", DEFAULT)).resolve())


def installed(ref):
    validate(ref, schema("engine-ref-v1"))
    pair = registry().get((ref["id"], ref["version"]))
    require(pair, "Motore o versione assente in questa installazione.", 409)
    return pair


def checkpoints(meta, control):
    low, high, step = (control[k] for k in ("min", "max", "step"))
    return [[low + i * step, measurement(meta, low + i * step)]
            for i in range(round((high - low) / step) + 1)]


def validate_experiment(row):
    meta, _ = installed(row["engine"])
    control, measure = row.get("control"), row.get("measure")
    require(isinstance(control, dict) and isinstance(measure, dict)
            and control.get("unit") == meta["inputUnit"] and measure.get("unit") == meta["outputUnit"]
            and isinstance(control.get("label"), str) and control["label"].strip()
            and isinstance(measure.get("label"), str) and measure["label"].strip(),
            "Controllo o strumento incompatibile con il motore.")
    low, high, step = (control.get(k) for k in ("min", "max", "step"))
    require(all(number(n) for n in (low, high, step)) and step > 0 and high > low, "Dominio non valido.")
    ticks = (high - low) / step
    require(number(ticks) and 2 <= ticks <= 2000 and math.isclose(ticks, round(ticks)),
            "Griglia del controllo non valida.")
    checkpoints(meta, control)
    refs = row.get("references")
    require(isinstance(refs, list) and len(refs) == 2, "Servono due misure indipendenti.")
    for pair in refs:
        require(isinstance(pair, list) and len(pair) == 2 and all(number(v) for v in pair), "Misura non valida.")
        x, y = pair
        require(low <= x <= high and math.isclose((x-low)/step, round((x-low)/step), abs_tol=1e-9)
                and math.isclose(measurement(meta, x), y, rel_tol=1e-9, abs_tol=1e-12),
                "Riferimento incompatibile con la legge fisica.")
    require(refs[0][0] != refs[1][0] and row.get("apparatus") == meta["id"], "Le configurazioni devono essere distinte.")
    require(isinstance(row.get("substitution"), str) and "{x}" in row["substitution"],
            "La sostituzione numerica deve contenere {x}.")
    require(not control.get("choices") and not row.get("discrete"), "Il motore scalare richiede un intervallo numerico.")
