#!/usr/bin/env python3
"""D-LICENZA §2 diventa un comando: i volumi non devono essere scaricabili.

La decisione `20-Decisions/2026-07-25-D-LICENZA.md` e' RATIFICATA e
`normative: true`, e la sua clausola 2 dice:

    «volumi, testi estratti e lesson pack: tutti i diritti riservati,
     NON DISTRIBUIBILI finche' titolarita' e diritti di trasformazione
     non sono verificati»

Fino a oggi non esisteva nessun comando che la verificasse. Misurato il
2026-08-11 su un alias di preview: i tre PDF integrali rispondevano `200
application/pdf` con `content-length` byte-identico ai blob in git, e
`robots.txt` diceva `Allow: /`. La regola c'era, la violazione pure, e niente
le metteva a confronto.

Questo e' quel confronto. Non cambia il comportamento del prodotto: legge.

DUE SCELTE DI PROGETTO, ENTRAMBE PAGATE DA QUESTO REPO

1. IL REFERENTE SI DERIVA. Quali file siano «i volumi» non e' scritto qui: si
   chiede a git. Una lista di nomi dentro un criterio invecchia il giorno in cui
   qualcuno aggiunge `volume4.pdf`, e il cancello resterebbe verde proprio sul
   file nuovo. Gli host, invece, sono configurazione e arrivano da argv: non
   sono il referente del criterio, sono dove lo si applica.

2. FALLISCE CHIUSO. Una rete che non risponde NON e' un verde. Un errore di
   DNS, un timeout, un TLS rotto: sono `exit 2`, «non misurato», distinto sia
   dal verde sia dal rosso. La regola del progetto e' che uno stdout vuoto e'
   un errore e non uno zero; qui vale identica per una sonda che non ha sondato.

USO

    python3 bin/ci/volumi_non_pubblici.py https://host-di-produzione
    python3 bin/ci/volumi_non_pubblici.py https://a https://b   # piu' origini

    exit 0  nessun volume raggiungibile da nessuna origine
    exit 1  ALMENO UN VOLUME E' SCARICABILE -> D-LICENZA §2 e' violata adesso
    exit 2  non misurato (rete, git, o nessun volume trovato nel repo)
"""
from __future__ import annotations

import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

# DUE INSIEMI, NON UNO. La clausola dice «volumi, testi estratti e lesson
# pack», e i testi estratti non stanno dove stanno i volumi:
#
#   plugins/elab-tutor/public/volumes/*.pdf   i tre volumi integrali
#   apps/studio/public/elab/manuals/**/*.png  le pagine scansionate
#
# Misurato il 2026-08-11: i primi erano pubblici su un alias di preview, le
# seconde lo sono sulla produzione dello Studio. Un cancello che avesse
# guardato solo i PDF sarebbe stato verde sulla violazione viva.
#
# Quella che segue e' una mappa DOVE-VIVONO -> DOVE-SONO-SERVITI, cioe' la
# struttura del deploy, non l'elenco dei file: i nomi li porta git, sempre.
# `public/` viene copiata verbatim in `dist/`, quindi `public/X` -> `/X`.
PROTETTI = [
    ("plugins/elab-tutor/public/volumes", "*.pdf", "/volumes"),
    ("apps/studio/public/elab/manuals", "*.png", "/elab/manuals"),
]
TIMEOUT = 20


class NonMisurato(RuntimeError):
    """La sonda non ha sondato. Non e' un verde e non e' un rosso."""


def percorsi_protetti(radice: Path) -> list[str]:
    """I percorsi SERVITI, derivati da git e non scritti qui.

    Ritorna path relativi all'origine (`/volumes/volume1.pdf`,
    `/elab/manuals/vol1/page-030-....png`), preservando i sottolivelli:
    le pagine stanno in `vol1/` e `vol3/`, e appiattirle avrebbe prodotto
    URL che non esistono e quindi un verde per assenza.
    """
    serviti: list[str] = []
    for cartella, motivo, prefisso in PROTETTI:
        esito = subprocess.run(
            ["git", "-C", str(radice), "ls-files", f"{cartella}/**/{motivo}", f"{cartella}/{motivo}"],
            capture_output=True,
            text=True,
        )
        if esito.returncode != 0:
            raise NonMisurato(f"git ls-files non ha risposto: {esito.stderr.strip()}")
        for riga in esito.stdout.split("\n"):
            riga = riga.strip()
            if riga:
                serviti.append(f"{prefisso}/{riga[len(cartella) + 1:]}")
    if not serviti:
        # Nessun file tracciato: il cancello non ha oggetto. Dichiararlo verde
        # sarebbe dire «nessuno e' pubblico» senza aver guardato niente.
        raise NonMisurato("nessun file protetto tracciato — il criterio non ha referente")
    return sorted(set(serviti))


def sonda(url: str) -> tuple[int, str, str]:
    """HEAD, mai GET: si guardano gli header, non si scaricano i byte."""
    richiesta = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(richiesta, timeout=TIMEOUT) as risposta:
            return (
                risposta.status,
                risposta.headers.get("content-type", ""),
                risposta.headers.get("content-length", ""),
            )
    except urllib.error.HTTPError as errore:
        # 401/403/404 sono la risposta VOLUTA: il file non e' distribuito.
        return (errore.code, errore.headers.get("content-type", ""), "")
    except Exception as errore:  # rete, DNS, TLS, timeout
        raise NonMisurato(f"{url}: {type(errore).__name__}: {errore}") from errore


def main(argv: list[str]) -> int:
    origini = [a.rstrip("/") for a in argv[1:] if a.startswith("http")]
    if not origini:
        print(__doc__.split("USO")[1].strip(), file=sys.stderr)
        return 2

    radice = Path(__file__).resolve().parents[2]
    try:
        serviti = percorsi_protetti(radice)
    except NonMisurato as errore:
        print(f"volumi-non-pubblici: NON MISURATO — {errore}", file=sys.stderr)
        return 2

    print(f"volumi-non-pubblici: {len(serviti)} file protetti, {len(origini)} origine/i")
    esposti: list[str] = []
    non_misurati: list[str] = []

    for origine in origini:
        for servito in serviti:
            url = f"{origine}{servito}"
            try:
                stato, tipo, lunghezza = sonda(url)
            except NonMisurato as errore:
                non_misurati.append(str(errore))
                print(f"  ?  {url} -> non misurato")
                continue
            # La riscrittura SPA restituisce 200 con `text/html` per QUALUNQUE
            # path: guardare solo lo stato avrebbe dato un rosso su ogni file,
            # anche quelli non serviti. E' il tipo che distingue il documento
            # servito dalla pagina che dice «non c'e'».
            servito_davvero = stato == 200 and (
                "pdf" in tipo.lower() or "image" in tipo.lower()
            )
            if servito_davvero:
                esposti.append(f"{url} -> {stato} {tipo} {lunghezza} byte")
                print(f"  X  {url} -> {stato} {tipo} {lunghezza} byte")
            else:
                print(f"  ok {url} -> {stato} {tipo or '-'}")

    if esposti:
        print("", file=sys.stderr)
        print(
            "volumi-non-pubblici: FAIL — D-LICENZA §2 e' violata ADESSO. "
            f"{len(esposti)} file scaricabile/i senza autenticazione:",
            file=sys.stderr,
        )
        for riga in esposti:
            print(f"  {riga}", file=sys.stderr)
        print(
            "\n  La clausola: «volumi, testi estratti e lesson pack: tutti i "
            "diritti\n  riservati, non distribuibili finche' titolarita' e "
            "diritti di\n  trasformazione non sono verificati».",
            file=sys.stderr,
        )
        return 1

    if non_misurati:
        print("", file=sys.stderr)
        print(
            f"volumi-non-pubblici: NON MISURATO — {len(non_misurati)} sonda/e "
            "non ha risposto. Una rete muta non e' un verde.",
            file=sys.stderr,
        )
        for riga in non_misurati:
            print(f"  {riga}", file=sys.stderr)
        return 2

    print("volumi-non-pubblici: OK — nessun volume raggiungibile")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
