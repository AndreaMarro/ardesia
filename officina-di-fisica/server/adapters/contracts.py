"""Runtime vocabulary of the shipped JSON schemas. Schemas are local, immutable documents."""
import json
import re
from functools import lru_cache
from pathlib import Path

from ..domain.errors import Problem, require
from ..domain.science import number

CONTRACTS = Path(__file__).resolve().parents[2] / "contracts"


@lru_cache
def schema(name):
    return json.loads((CONTRACTS / (name + ".schema.json")).read_text())


def _json_identity(value, depth=0):
    # JSON Schema core4.2.2: numeric1/1.0 compare equal, boolean true/number1 do not.
    require(depth <= 40, "Valore JSON troppo profondo.")
    if value is None:
        return ("null",)
    if type(value) is bool:
        return ("boolean", value)
    if type(value) in (int, float):
        require(number(value), "Numero JSON non valido.")
        return ("number", value)
    if isinstance(value, str):
        return ("string", value)
    if isinstance(value, list):
        return ("array", tuple(_json_identity(item, depth+1) for item in value))
    require(isinstance(value, dict) and all(isinstance(k, str) for k in value), "Valore JSON non valido.")
    return ("object", tuple((k, _json_identity(value[k], depth+1)) for k in sorted(value)))


def validate(value, rule, field="$", root=None, depth=0):
    root = rule if root is None else root
    require(depth <= 40, "Oggetto troppo profondo in " + field)
    if "$ref" in rule:
        ref = rule["$ref"]
        name = ref.removeprefix("#/$defs/")
        require(name != ref and name in root.get("$defs", {}), "Schema locale sconosciuto.")
        return validate(value, root["$defs"][name], field, root, depth + 1)
    if "oneOf" in rule:
        matches = 0
        for variant in rule["oneOf"]:
            try:
                validate(value, variant, field, root, depth + 1)
                matches += 1
            except Problem:
                pass
        require(matches == 1, "Espressione non valida in " + field)
    if "enum" in rule:
        require(value in rule["enum"], "Valore sconosciuto in " + field)
    if "const" in rule:
        require(value == rule["const"], "Versione o tipo sconosciuto in " + field)
    kind = rule.get("type")
    if kind == "object":
        require(isinstance(value, dict), "Oggetto richiesto in " + field)
        fields = rule.get("properties", {})
        require(set(rule.get("required", ())) <= value.keys(), "Campo obbligatorio assente in " + field)
        if rule.get("additionalProperties") is False:
            require(value.keys() <= fields.keys(), "Campo inatteso in " + field)
        for k in value.keys() & fields.keys():
            validate(value[k], fields[k], field + "." + k, root, depth + 1)
    elif kind == "array":
        require(isinstance(value, list) and rule.get("minItems", 0) <= len(value) <= rule.get("maxItems", float("inf")),
                "Elenco non valido in " + field)
        for item in value:
            validate(item, rule.get("items", {}), field + "[]", root, depth + 1)
        if rule.get("uniqueItems"):
            identities = [_json_identity(item) for item in value]
            require(len(set(identities)) == len(identities), "Valori ripetuti in " + field)
    elif kind == "string":
        require(isinstance(value, str) and rule.get("minLength", 0) <= len(value) <= rule.get("maxLength", float("inf")),
                "Testo non valido in " + field)
        if "pattern" in rule:
            require(re.search(rule["pattern"], value) is not None, "Formato non valido in " + field)
    elif kind in ("number", "integer"):
        require(number(value) and (kind != "integer" or type(value) is int), "Numero richiesto in " + field)
        require(rule.get("minimum", -float("inf")) <= value <= rule.get("maximum", float("inf")),
                "Numero fuori intervallo in " + field)
    elif kind == "boolean":
        require(type(value) is bool, "Valore booleano richiesto in " + field)
