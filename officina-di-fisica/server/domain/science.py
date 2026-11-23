"""Independent SI oracle for the scalar model interchange contract, version 1."""
import math
from dataclasses import dataclass
from .errors import require


@dataclass(frozen=True)
class Unit:
    scale: float
    dimension: tuple[int, ...]


# Exponents in SI order: length, mass, time, current, temperature, amount, luminous intensity.
def unit(scale=1, length=0, mass=0, time=0, current=0, temperature=0, amount=0, intensity=0):
    return Unit(scale, (length, mass, time, current, temperature, amount, intensity))


UNITS = {"1": unit(), "m": unit(length=1), "cm": unit(.01, length=1), "mm": unit(.001, length=1),
         "m²": unit(length=2), "cm²": unit(.0001, length=2), "m³": unit(length=3),
         "s": unit(time=1), "ms": unit(.001, time=1), "Hz": unit(time=-1),
         "m/s": unit(length=1, time=-1), "m/s²": unit(length=1, time=-2), "kg": unit(mass=1),
         "N": unit(length=1, mass=1, time=-2), "J": unit(length=2, mass=1, time=-2),
         "A": unit(current=1), "K": unit(temperature=1), "mol": unit(amount=1), "cd": unit(intensity=1)}


def number(value):
    try:
        return type(value) in (int, float) and math.isfinite(value)
    except OverflowError:
        return False


def evaluate(node, x, source, depth=0):
    require(depth < 10 and isinstance(node, dict), "Espressione scientifica non valida.")
    if node == {"input": True} and type(node["input"]) is bool:
        return x * source.scale, source.dimension
    if set(node) == {"value", "unit"}:
        require(number(node["value"]) and isinstance(node["unit"], str) and node["unit"] in UNITS, "Costante fisica non valida.")
        u = UNITS[node["unit"]]
        return node["value"] * u.scale, u.dimension
    require(set(node) == {"op", "left", "right"}, "Operazione scientifica sconosciuta.")
    a, da = evaluate(node["left"], x, source, depth + 1)
    b, db = evaluate(node["right"], x, source, depth + 1)
    op = node["op"]
    if op in ("add", "subtract"):
        require(da == db, "Somma di grandezze con dimensioni diverse.")
        return (a + b if op == "add" else a - b), da
    require(op in ("multiply", "divide") and (op != "divide" or b != 0), "Operazione fuori dominio.")
    sign = 1 if op == "multiply" else -1
    return (a * b if sign == 1 else a / b), tuple(i + sign*j for i, j in zip(da, db))


def measurement(engine, x):
    source, target = UNITS[engine["inputUnit"]], UNITS[engine["outputUnit"]]
    y, dimension = evaluate(engine["law"], x, source)
    require(dimension == target.dimension and number(y / target.scale), "Dimensione o misura incompatibile.")
    return y / target.scale
