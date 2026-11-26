"""Exact comparison of bounded, univariate real rational expressions. Coefficients ascend in degree."""
import ast
import re
from dataclasses import dataclass
from fractions import Fraction


class Unsupported(ValueError):
    pass


ZERO, ONE, X = (Fraction(0),), (Fraction(1),), (Fraction(0), Fraction(1))


def poly(values):
    values = list(map(Fraction, values))
    while len(values) > 1 and not values[-1]:
        values.pop()
    if len(values) > 33 or any(max(v.numerator.bit_length(), v.denominator.bit_length()) > 256 for v in values):
        raise Unsupported("Il grado o la dimensione dei coefficienti supera il limite del verificatore.")
    return tuple(values) or ZERO


def add(a, b):
    size = max(len(a), len(b))
    return poly((a[i] if i < len(a) else 0) + (b[i] if i < len(b) else 0) for i in range(size))


def neg(a):
    return tuple(-v for v in a)


def mul(a, b):
    if a == ZERO or b == ZERO:
        return ZERO
    values = [0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            values[i+j] += x*y
    return poly(values)


def derivative(a):
    return poly(i * a[i] for i in range(1, len(a)))


def divrem(a, b):
    quotient = [0] * max(1, len(a) - len(b) + 1)
    while a != ZERO and len(a) >= len(b):
        shift = len(a) - len(b)
        factor = a[-1] / b[-1]
        quotient[shift] = factor
        a = add(a, poly([0] * shift + [-factor * k for k in b]))
    return poly(quotient), a


def monic(a):
    return poly(v / a[-1] for v in a) if a != ZERO else ZERO


def gcd(a, b):
    while b != ZERO:
        a, b = b, monic(divrem(a, b)[1])
    return monic(a)


def square_free(a):
    return monic(divrem(a, gcd(a, derivative(a)))[0])


def real_roots(a):
    """Sturm variations at minus and plus infinity, on a square-free polynomial."""
    if len(a) == 1:
        return 0
    chain = [a, derivative(a)]
    while True:
        remainder = neg(divrem(*chain[-2:])[1])
        if remainder == ZERO:
            break
        # Only a positive rescaling preserves the signs of a Sturm chain.
        chain.append(poly(v / abs(remainder[-1]) for v in remainder))
    def changes(left):
        signs = [(p[-1] > 0) ^ (left and (len(p) - 1) % 2 == 1) for p in chain]
        return sum(x != y for x, y in zip(signs, signs[1:]))
    return changes(True) - changes(False)


@dataclass(frozen=True)
class Rational:
    numerator: tuple
    denominator: tuple = ONE
    excluded: tuple = ONE

    def differentiated(self):
        n, d = self.numerator, self.denominator
        return Rational(add(mul(derivative(n), d), neg(mul(n, derivative(d)))), mul(d, d), self.excluded)


def combine(a, b, op):
    n, d, m, e = a.numerator, a.denominator, b.numerator, b.denominator
    # The domain keeps every restriction, including holes left by cancellation.
    excluded = square_free(mul(a.excluded, b.excluded))
    if op is ast.Div:
        if m == ZERO:
            raise Unsupported("Il divisore è identicamente nullo. L’espressione non ha un dominio reale non vuoto.")
        return Rational(mul(n, e), mul(d, m), square_free(mul(excluded, m)))
    if op is ast.Mult:
        return Rational(mul(n, m), mul(d, e), excluded)
    right = mul(m, d)
    return Rational(add(mul(n, e), right if op is ast.Add else neg(right)), mul(d, e), excluded)


def integer(node):
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        return (-1 if isinstance(node.op, ast.USub) else 1) * integer(node.operand)
    if not isinstance(node, ast.Constant) or type(node.value) is not int or abs(node.value) > 1_000_000:
        raise Unsupported("Servono coefficienti interi limitati o frazioni esplicite.")
    return node.value


def expression(text):
    if not isinstance(text, str) or not 0 < len(text) <= 220 or not re.fullmatch(r"[0-9x\s+*/^()−-]+", text):
        raise Unsupported("Scrivi una funzione razionale in x con interi, frazioni, parentesi e potenze intere.")
    try:
        root = ast.parse(text.strip().replace("−", "-").replace("^", "**"), mode="eval").body
    except (SyntaxError, ValueError, RecursionError):
        raise Unsupported("Controlla parentesi e operatori. Usa * per indicare la moltiplicazione.") from None
    if sum(1 for _ in ast.walk(root)) > 56:
        raise Unsupported("Troppi passaggi in una sola espressione.")
    def walk(node):
        if isinstance(node, ast.Name) and node.id == "x":
            return Rational(X)
        if isinstance(node, ast.Constant):
            return Rational(poly([integer(node)]))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
            a = walk(node.operand)
            return Rational(neg(a.numerator), a.denominator, a.excluded) if isinstance(node.op, ast.USub) else a
        if isinstance(node, ast.BinOp) and type(node.op) in (ast.Add, ast.Sub, ast.Mult, ast.Div):
            return combine(walk(node.left), walk(node.right), type(node.op))
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow):
            a, exponent = walk(node.left), integer(node.right)
            if not -8 <= exponent <= 8:
                raise Unsupported("Gli esponenti supportati sono compresi fra −8 e 8.")
            if exponent < 0:
                a = combine(Rational(ONE), a, ast.Div)
            if exponent == 0 and (a.numerator == ZERO or real_roots(square_free(a.numerator))):
                raise Unsupported("La base può annullarsi. Per una potenza di esponente zero occorre precisare la convenzione su 0^0.")
            result = Rational(ONE, ONE, a.excluded)
            for _ in range(abs(exponent)):
                result = combine(result, a, ast.Mult)
            return result
        raise Unsupported("Operazione fuori dal linguaggio razionale supportato.")
    return walk(root)


def compare(data):
    operation = data.get("operation")
    if operation not in ("equivalent", "derivative", "primitive"):
        return {"verdict": "undetermined", "explanation": "Scegli equivalenza, derivata o primitiva."}
    try:
        original, candidate = expression(data.get("expression")), expression(data.get("candidate"))
        if operation == "derivative":
            original = original.differentiated()
        if operation == "primitive":
            candidate = candidate.differentiated()
        if mul(original.numerator, candidate.denominator) != mul(candidate.numerator, original.denominator):
            return {"verdict": "different", "explanation": "I prodotti incrociati sono polinomi diversi. L’identità non vale su tutto il dominio comune."}
        a, b = original.excluded, candidate.excluded
        common = gcd(a, b)
        lost = real_roots(divrem(b, common)[0])
        gained = real_roots(divrem(a, common)[0])
        if lost or (gained and operation != "primitive"):
            details = []
            if lost:
                details.append("esclude un ulteriore punto reale" if lost == 1 else f"esclude altri {lost} punti reali")
            if gained:
                details.append("ammette un punto prima escluso" if gained == 1 else f"ammette {gained} punti prima esclusi")
            return {"verdict": "different-domain", "explanation": "I valori coincidono sul dominio comune. La proposta " + " e ".join(details) + "."}
        why = {"equivalent": "I prodotti incrociati coincidono e le esclusioni reali dei due domini sono le stesse.",
               "derivative": "La regola del quoziente dà la funzione proposta in ogni punto del dominio, con le medesime esclusioni.",
               "primitive": "La derivata della proposta coincide con l’integranda in ogni punto del suo dominio."}
        return {"verdict": "equivalent", "explanation": why[operation]}
    except Unsupported as exc:
        return {"verdict": "undetermined", "explanation": str(exc)}
