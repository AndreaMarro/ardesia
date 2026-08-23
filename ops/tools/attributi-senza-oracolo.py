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

⚠️ «NOMINATO» NON E' «ASSERITO», E LA DIFFERENZA NON SI MISURA BENE
-------------------------------------------------------------------
Un attributo citato in un selettore d'appoggio — per arrivare a un altro
elemento, o per contare — non e' sorvegliato. Separare i due insiemi sembra
facile e non lo e'. Provati due criteri, ed entrambi sbagliano, in versi opposti:

  * VICINANZA (l'attributo e un `expect(` entro N righe): ha un PARAMETRO, e un
    parametro si accorda finche' il numero non piace. Misurato: 51 non-asseriti
    a N=0, 36 a N=1, **31 da N=2 in poi**. Avevo scelto N=2 e ottenuto il
    numero piu' comodo.
  * PARENTESI (l'attributo dentro le parentesi di un `expect(...)`): niente
    parametri, e SOTTOSTIMA. Il caso che lo dimostra e' nel repository:

        const alert = view.querySelector("[data-led-state=missing]")
        expect(alert).not.toBeNull()

    `data-led-state` finisce fra i «solo citati» — eppure e' difeso davvero, e
    due mutazioni lo fanno rosso (`ElabLab.test.tsx`). Il legame passa per una
    variabile, e nessun criterio testuale lo segue.

Quindi questo comando NON stampa un numero solo: stampa **due limiti**, e dice
quale sovrastima e quale sottostima. Un numero unico qui sarebbe falsa
precisione, ed e' la ragione per cui questo file esiste in questa forma.

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


def _dentro_expect(testo: str) -> str:
    """Il testo che sta DENTRO una chiamata `expect(...)`, concatenato.

    Non una finestra di righe: le parentesi. Una finestra ha un parametro, e un
    parametro si puo' stringere finche' il numero non piace — misurato il
    2026-08-23, la stessa domanda dava 51 attributi non asseriti a finestra 0,
    36 a finestra 1, 31 da finestra 2 in poi. Contare le parentesi non ha
    parametri da scegliere.
    """
    pezzi: list[str] = []
    i = 0
    while True:
        i = testo.find("expect(", i)
        if i < 0:
            return " ".join(pezzi)
        j = i + len("expect(")
        livello = 1
        while j < len(testo) and livello > 0:
            if testo[j] == "(":
                livello += 1
            elif testo[j] == ")":
                livello -= 1
            j += 1
        pezzi.append(testo[i:j])
        i = j


def _senza_commenti(testo: str) -> str:
    return "\n".join(r for r in testo.splitlines() if not r.lstrip().startswith("//"))


def nominati(percorsi) -> tuple[set[str], set[str]]:
    """(nominati, asseriti). NOMINARE non e' ASSERIRE: un attributo citato in un
    selettore d'appoggio — per arrivare a un altro elemento, o per contare — non
    e' sorvegliato. Asserito = compare dentro le parentesi di un `expect(...)`."""
    visti: set[str] = set()
    asseriti: set[str] = set()
    for p in percorsi:
        testo = _senza_commenti(p.read_text(encoding="utf-8", errors="replace"))
        visti.update(CITAZIONE.findall(testo))
        asseriti.update(CITAZIONE.findall(_dentro_expect(testo)))
    return visti, asseriti


def main() -> int:
    if not SRC.is_dir() or not E2E.is_dir() or not TEST.is_dir():
        print("attributi-senza-oracolo: cartelle attese assenti, eseguire dalla radice", file=sys.stderr)
        return 1

    prodotti = emessi()
    da_e2e, asser_e2e = nominati(sorted(E2E.glob("*.spec.ts")))
    da_unit, asser_unit = nominati(sorted(TEST.rglob("*.ts*")))
    nominato = da_e2e | da_unit
    asserito = asser_e2e | asser_unit
    orfani = sorted(k for k in prodotti if k not in nominato)
    #: nominati ma mai dentro un `expect(`: sorvegliati solo in apparenza.
    solo_citati = sorted(k for k in prodotti if k in nominato and k not in asserito)

    print("emessi e nominati da NESSUN oracolo:")
    for k in orfani:
        print(f"  {k}   <- {sorted(prodotti[k])[0]}")
    print("")
    print("nominati ma MAI dentro un expect( — sospetti, NON un verdetto:")
    for k in solo_citati:
        print(f"  {k}   <- {sorted(prodotti[k])[0]}")

    # I conteggi IN FONDO: measure.sh incide le ultime 40 righe, e una somma
    # stampata per prima sparisce dal record.
    print("")
    print(f"data-* emessi dal prodotto: {len(prodotti)}")
    print(f"nominati da una spec e2e: {len(da_e2e & set(prodotti))}")
    print(f"nominati da un test unitario: {len(da_unit & set(prodotti))}")
    print(f"nominati da ALMENO UN oracolo: {len(prodotti) - len(orfani)}")
    print(f"nominati ma mai dentro un expect(): {len(solo_citati)}")
    print("")
    print(f"LIMITE INFERIORE dei non sorvegliati: {len(orfani)}  (nessun oracolo li nomina)")
    print(
        f"LIMITE SUPERIORE dei non sorvegliati: {len(orfani) + len(solo_citati)}"
        "  (piu' i citati fuori da expect: SOVRASTIMA, vedi data-led-state)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
