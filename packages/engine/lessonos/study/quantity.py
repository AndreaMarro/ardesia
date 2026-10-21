"""Unit-aware exact quantities for exam completion answers.

This module is deliberately bounded: it recognizes single SI-style units with
prefixes and multiplicative compounds (``m/s``, ``g/cm^3``, ``kg*m/s^2``). It
does not evaluate expressions and it does not perform affine temperature
conversion. Unknown units fail closed.
"""
from __future__ import annotations

from fractions import Fraction
import re
import unicodedata

MAX_QUANTITY_LENGTH = 200
_NUMBER = r'[+-]?(?:[0-9]+(?:[.,][0-9]*)?|[.,][0-9]+)(?:[eE][+-]?[0-9]{1,3})?'
_QUANTITY = re.compile(rf'^({_NUMBER})(?:\s*/\s*({_NUMBER}))?\s*(.*)$')
_FACTOR = re.compile(r'^([A-Za-zµμΩ°]+)(?:\^?([+-]?[0-9]+))?$')

_BASE = {
    'm': ((('m', 1),), Fraction(1)),
    's': ((('s', 1),), Fraction(1)),
    'kg': ((('kg', 1),), Fraction(1)),
    'g': ((('kg', 1),), Fraction(1, 1000)),
    'Pa': ((('Pa', 1),), Fraction(1)),
    'N': ((('N', 1),), Fraction(1)),
    'J': ((('J', 1),), Fraction(1)),
    'W': ((('W', 1),), Fraction(1)),
    'Hz': ((('Hz', 1),), Fraction(1)),
    'V': ((('V', 1),), Fraction(1)),
    'A': ((('A', 1),), Fraction(1)),
    'C': ((('C', 1),), Fraction(1)),
    'K': ((('K', 1),), Fraction(1)),
    'mol': ((('mol', 1),), Fraction(1)),
    'cd': ((('cd', 1),), Fraction(1)),
    'L': ((('m', 3),), Fraction(1, 1000)),
    'l': ((('m', 3),), Fraction(1, 1000)),
    'min': ((('s', 1),), Fraction(60)),
    'h': ((('s', 1),), Fraction(3600)),
    '1': ((), Fraction(1)),
}
_PREFIXES = (
    ('da', Fraction(10)),
    ('M', Fraction(10 ** 6)),
    ('G', Fraction(10 ** 9)),
    ('k', Fraction(10 ** 3)),
    ('h', Fraction(10 ** 2)),
    ('d', Fraction(1, 10)),
    ('c', Fraction(1, 100)),
    ('m', Fraction(1, 1000)),
    ('u', Fraction(1, 10 ** 6)),
    ('µ', Fraction(1, 10 ** 6)),
    ('μ', Fraction(1, 10 ** 6)),
    ('n', Fraction(1, 10 ** 9)),
    ('p', Fraction(1, 10 ** 12)),
    ('f', Fraction(1, 10 ** 15)),
)


def _normalize(value: str) -> str:
    text = unicodedata.normalize('NFKC', value).strip()
    text = text.replace('−', '-').replace('–', '-')
    text = text.replace('²', '^2').replace('³', '^3').replace('⁻¹', '^-1')
    text = text.replace('×', 'x').replace('·', '*').replace('⋅', '*')
    text = re.sub(r'\s*[x*]\s*10\s*\^?\s*([+-]?\d+)', r'e\1', text, flags=re.I)
    text = re.sub(r'(?<=[A-Za-zµμΩ°])\s+(?=[A-Za-zµμΩ°])', '*', text)
    return re.sub(r'\s+', '', text)


def _number(value: str) -> Fraction | None:
    try:
        return Fraction(value.replace(',', '.'))
    except (ValueError, ZeroDivisionError, OverflowError):
        return None


def _unit_factor(token: str) -> tuple[tuple[tuple[str, int], ...], Fraction] | None:
    if token in _BASE:
        return _BASE[token]
    for prefix, scale in _PREFIXES:
        if token.startswith(prefix) and len(token) > len(prefix):
            base = _BASE.get(token[len(prefix):])
            if base is not None:
                return base[0], base[1] * scale
    return None


def canonical_unit(unit: str) -> tuple[tuple[tuple[str, int], ...], Fraction] | None:
    """Return the canonical unit signature and its SI scale, or ``None``."""
    if not isinstance(unit, str) or len(unit) > MAX_QUANTITY_LENGTH:
        return None
    text = _normalize(unit)
    if not text or text in ('1', 'unita', 'unità'):
        return (), Fraction(1)
    parts = text.split('/')
    if len(parts) > 2 or not parts[0]:
        return None
    denominator = parts[1] if len(parts) == 2 else ''
    exponents: dict[str, int] = {}
    scale = Fraction(1)
    sides = [(parts[0], 1)]
    if len(parts) == 2:
        if not denominator:
            return None
        sides.append((denominator, -1))
    for side, sign in sides:
        for factor in side.split('*'):
            match = _FACTOR.fullmatch(factor)
            if match is None:
                return None
            token, raw_power = match.groups()
            power = int(raw_power) if raw_power is not None else 1
            if abs(power) > 12:
                return None
            resolved = _unit_factor(token)
            if resolved is None:
                return None
            base_signature, unit_scale = resolved
            signed = power * sign
            for base, base_power in base_signature:
                exponents[base] = exponents.get(base, 0) + base_power * signed
            scale *= unit_scale ** signed
    signature = tuple(sorted((key, value) for key, value in exponents.items() if value))
    return signature, scale


def parse_quantity(value: str, *, expected_unit: str | None = None) -> Fraction | None:
    """Parse a number with optional unit and return it in canonical SI base.

    When ``expected_unit`` is supplied the unit dimensions must match exactly.
    An omitted unit is accepted only for a dimensionless expected unit.
    """
    if not isinstance(value, str) or len(value) > MAX_QUANTITY_LENGTH:
        return None
    text = _normalize(value)
    match = _QUANTITY.fullmatch(text)
    if match is None:
        return None
    number = _number(match.group(1))
    if number is None:
        return None
    if match.group(2) is not None:
        divisor = _number(match.group(2))
        if divisor is None or divisor == 0:
            return None
        number /= divisor
    raw_unit = match.group(3).strip()
    if not raw_unit:
        # The prompt supplies the unit; a bare numeric answer is conventional.
        return number
    parsed = canonical_unit(raw_unit)
    if parsed is None:
        return None
    signature, scale = parsed
    if expected_unit is not None:
        expected = canonical_unit(expected_unit)
        if expected is None or expected[0] != signature:
            return None
    return number * scale


def expected_quantity(value: object, unit: str | None) -> Fraction | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, Fraction):
        number = value
    elif isinstance(value, int):
        number = Fraction(value)
    elif isinstance(value, float):
        number = Fraction(str(value))
    else:
        return None
    if unit is None:
        return number
    parsed = canonical_unit(unit)
    if parsed is None:
        return None
    return number * parsed[1]
