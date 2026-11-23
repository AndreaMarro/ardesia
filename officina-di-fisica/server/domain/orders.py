"""Monetary amounts and supported offers for purchase snapshots."""
import re
from decimal import Decimal, InvalidOperation

from .errors import Problem, require

OFFERS = {
    "digitale": "Materiali digitali",
    "incontri": "Incontri dal vivo",
    "combinata": "Materiali e incontri",
}


def cents(x):
    try:
        d = Decimal(str(x).replace(",", "."))
        require(
            d.is_finite() and 0 < d <= 1_000_000 and d == d.quantize(Decimal(".01")),
            "Importo positivo in euro, con al massimo due decimali.",
        )
        return int(d * 100)
    except (ValueError, InvalidOperation):
        raise Problem("Importo in euro non valido.")


def valid_iban(x):
    if not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]{11,30}", x):
        return False
    s = x[4:] + x[:4]
    return int("".join(str(ord(c) - 55) if c.isalpha() else c for c in s)) % 97 == 1
