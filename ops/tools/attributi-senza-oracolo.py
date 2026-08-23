#!/usr/bin/env python3
"""Quali `data-*` il prodotto emette e NESSUN oracolo nomina.

PERCHE' ESISTE, e la prima versione sbagliava
---------------------------------------------
Il 2026-08-23 ho censito i `data-*` guardando SOLO le spec e2e, e ho scritto
«88 emessi e mai nominati». Il numero era giusto per la domanda posta e
sbagliato per quella che sembrava rispondere: si legge come «88 non difesi», e
non lo e'. Un attributo di VISTA lo difende benissimo un test unitario — il
cartello «Verdetto non disponibile» (`data-led-state="missing"`) non compare in
nessuna spec e2e ed e' difeso da `ElabLab.test.tsx`, con due mutazioni che lo
fanno rosso.

Contando anche i test unitari, il numero e' **31**, non 88. Un terzo.

    127 emessi · 39 nominati da e2e · 91 da test unitari
     96 nominati da almeno un oracolo · 31 da nessuno

COSA CONTA COME «NOMINATO»
--------------------------
L'attributo compare in una riga NON di commento di una spec e2e o di un test
unitario. E' un criterio grossolano — nominare non e' asserire — ma il verso
dell'errore e' quello giusto: sovrastima la copertura, quindi i 31 che restano
sono un limite INFERIORE di cio' che nessuno guarda.

Le righe di commento sono escluse perche' due censimenti di questa serie hanno
contato le proprie note, e il secondo l'ha fatto due giri dopo che la regola era
stata scritta.

⚠️ NON e' una lista di difetti. Molti `data-*` sono agganci interni — un
`data-function-id` che serve al codice e non al docente non ha bisogno di un
oracolo. Questo comando produce il DENOMINATORE di una domanda, non il verdetto.

USO
    python3 ops/tools/attributi-senza-oracolo.py

EXIT
  0  censimento eseguito
  1  le cartelle attese non esistono — fallisce, non degrada
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent.parent
SRC = RADICE / "apps/studio/src"
E2E = RADICE / "apps/studio/e2e"
TEST = SRC / "__tests__"
#: `__tests__` non emette: cio' che scrive li' dentro e' un oracolo, non prodotto.
ESCLUDI = {"__tests__", "node_modules", "dist"}

ATTRIBUTO = re.compile(r"\bdata-([a-z0-9-]+)\s*=")
CITAZIONE = re.compile(r"data-[a-z0-9-]+")


def emessi() -> dict[str, set[str]]:
    trovati: dict[str, set[str]] = {}
    for p in SRC.rglob("*"):
        if p.suffix not in {".ts", ".tsx"} or any(x in p.parts for x in ESCLUDI):
            continue
        testo = p.read_text(encoding="utf-8", errors="replace")
        for m in ATTRIBUTO.finditer(testo):
            trovati.setdefault("data-" + m.group(1), set()).add(str(p.relative_to(RADICE)))
    return trovati


def nominati(percorsi) -> set[str]:
    visti: set[str] = set()
    for p in percorsi:
        for riga in p.read_text(encoding="utf-8", errors="replace").splitlines():
            if riga.lstrip().startswith("//"):
                continue
            visti.update(CITAZIONE.findall(riga))
    return visti


def main() -> int:
    if not SRC.is_dir() or not E2E.is_dir() or not TEST.is_dir():
        print("attributi-senza-oracolo: cartelle attese assenti, eseguire dalla radice", file=sys.stderr)
        return 1

    prodotti = emessi()
    da_e2e = nominati(sorted(E2E.glob("*.spec.ts")))
    da_unit = nominati(sorted(TEST.rglob("*.ts*")))
    orfani = sorted(k for k in prodotti if k not in da_e2e and k not in da_unit)

    for k in orfani:
        print(f"  {k}   <- {sorted(prodotti[k])[0]}")

    # I conteggi IN FONDO: measure.sh incide le ultime 40 righe, e una somma
    # stampata per prima sparisce dal record.
    print("")
    print(f"data-* emessi dal prodotto: {len(prodotti)}")
    print(f"nominati da una spec e2e: {len(da_e2e & set(prodotti))}")
    print(f"nominati da un test unitario: {len(da_unit & set(prodotti))}")
    print(f"nominati da ALMENO UN oracolo: {len(prodotti) - len(orfani)}")
    print(f"emessi e nominati da NESSUNO: {len(orfani)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
