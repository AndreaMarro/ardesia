#!/usr/bin/env python3
"""ARDESIA e' per tutti: le righe NUOVE non restringono il destinatario.

LA REGOLA. `CLAUDE.md` la scrive due volte, in rosso: ARDESIA serve
dall'autodidatta al professore universitario, dal bambino all'adulto, e non si
usa il sostantivo che questo file respinge — si scrive «chi impara o insegna».
La correzione allarga il DESTINATARIO, non l'obiettivo.

QUESTO FILE NON SCRIVE MAI QUELLA PAROLA PER ESTESO. Girato su se stesso, un
cancello che la cita si respinge. Esentare il file sarebbe l'esclusione a mano
che questo repo vieta; annegarlo di deroghe renderebbe la deroga rumore. Resta
la terza via: comporre il token dove serve.

⚠️ QUESTA E' LA SECONDA VERSIONE, e la prima e' istruttiva. `ci/lessico-cancello`
resta come registro: una review avversariale del 2026-08-23 le ha trovato tredici
difetti, e il piu' grave non era in cio' che il cancello leggeva ma nel suo
ORACOLO. Le prove derivavano dalla costante sotto test (`sing = f"{_RADICE}e"`),
quindi mutando `_RADICE` in `"zzzzzz"` il self-test restava VERDE; e restava
verde anche con `cerca()` che ritornava sempre `[]`, cioe' con il cancello
disattivato. Il commento scritto sopra quel codice diceva «un oracolo che resta
verde sotto mutazione non misura niente». Era la descrizione esatta del codice
sotto. Qui sotto le prove sono LETTERALI e indipendenti dalla radice, e ce n'e'
una capo a capo su un repo temporaneo, perche' il parser del diff — dove stavano
sei difetti su tredici — prima aveva copertura ZERO.

I TRE ESITI: 0 VERDE, 1 ROSSO, 2 MUTO. Un cancello che non sa qual e' il proprio
referente non ha guardato niente, e «non ho guardato» non e' «e' tutto a posto»:
sono due affermazioni con rimedi opposti.

IL REFERENTE E' IL DIFF, non l'albero. Sull'albero la parola e' immovibile —
fra le 7.799 e le 18.299 occorrenze secondo come si conta, la gran parte dentro
`plugins/elab-tutor` — e una soglia su quel numero non sarebbe un cancello.
(La prima versione scrisse «9697 in 1340 file»: non si riproduce sotto nessuna
delle sette definizioni provate, perche' `git grep -c` conta RIGHE con match e
l'etichetta diceva «occorrenze». Il numero e' uscito dal testo; resta il
comando, che e' la regola gia' scritta di questo progetto.)

⚠️ LIMITE DICHIARATO: non guarda cio' che esiste gia', e non lo guardera' mai.
«Passa il cancello lessicale» significa «non ne ha aggiunti di nuovi».
"""

from __future__ import annotations

import os
import re
import subprocess
import sys

VERDE, ROSSO, MUTO = 0, 1, 2

# La radice: la regex la descrive senza contenerla (la classe `[ei]` tiene il
# token spezzato), ed e' per questo che questa riga passa il proprio cancello.
_RADICE = "docent"

SUGGERIMENTO = "chi impara o insegna"

# D5 (prima versione): `docenti_attivi`, `DOCENTE_ROLE` e `listaDocenti`
# passavano, cioe' proprio gli identificatori che il commit diceva di voler
# prendere. `_` e' `\w`, quindi `\b` non vedeva confine; e il camelCase non ne
# ha nessuno. La riparazione non e' una regex piu' barocca: si NORMALIZZA la
# riga prima di guardarla, e poi il confine e' semplice.
_CAMEL = re.compile(r"(?<=[a-z0-9])(?=[A-Z])")
VIETATO = re.compile(rf"(?<![A-Za-z0-9]){_RADICE}[ei](?![A-Za-z0-9])", re.IGNORECASE)

# D6: la deroga era `lessico-ok:\s*\S` e matchava OVUNQUE nella riga, quindi
# `const msg = "vedi lessico-ok: nel manuale"; // pannello <parola>` passava, e
# ogni documento che spiegava il cancello si autoesentava. Ora deve stare dentro
# un commento e portare una ragione vera, non un carattere.
DEROGA = re.compile(r"(?:#|//|/\*|\*|<!--|;|--)\s*lessico-ok:\s*(?P<ragione>\S[^\n]{7,})")


def normalizza(testo: str) -> str:
    """Spezza gli identificatori dove un umano legge una parola.

    `listaDocenti` -> `lista Docenti` · `x_docenti` -> `x docenti`
    `<parola>ria` resta intero, quindi non matcha: e' un'altra parola.
    """
    return _CAMEL.sub(" ", testo).replace("_", " ")


def viola(testo: str) -> bool:
    if DEROGA.search(testo):
        return False
    return bool(VIETATO.search(normalizza(testo)))


# ── git, e le bandiere che sono tutte una riparazione ──────────────────────
#
# `--text`            D2: un `.gitattributes` con `*.md -diff` rendeva ogni file
#                     binario per git — zero righe `+`, exit 0 — e poteva stare
#                     NELLO STESSO COMMIT che violava. Il repo non ne ha nessuno
#                     oggi, quindi aggiungerne uno non desterebbe sospetti.
# `--no-ext-diff`     D10: `diff.external` nella config locale accecava tutto.
# `core.quotePath=0`  D10: col default `true` un path non-ASCII usciva escapato
#                     e il rapporto accusava il file sbagliato.
# `--find-renames`    D8: senza, uno spostamento con riscrittura contava come
#                     41 righe «aggiunte» mai scritte da nessuno.
# `-U0`               una riga di CONTESTO non e' stata aggiunta da questa
#                     modifica, e contarla accuserebbe l'innocente.
_BANDIERE = [
    "-c", "core.quotePath=false",
    "diff", "--no-ext-diff", "--text", "--find-renames=10%", "-U0", "--no-color",
]


def _git(*argv: str) -> tuple[int, str]:
    """git senza pipe: l'exit code e' di git, non dell'ultimo comando di una
    catena."""
    p = subprocess.run(
        ["git", *argv], capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    return p.returncode, p.stdout


def risolvi_base(base_richiesta: str | None) -> tuple[str | None, str]:
    """(merge-base, da-dove-viene). `None` significa MUTO, mai «va bene».

    D3: la prima versione, se `origin/$GITHUB_BASE_REF` non risolveva, scivolava
    IN SILENZIO su `origin/main`. Su una PR impilata la cui base era sparita,
    trentuno righe della PR genitrice finivano imputate alla figlia — falso
    ROSSO su un check RICHIESTO. Ora: se GitHub DICHIARA una base e quella base
    non si risolve, e' MUTO. Un ripiego che non si annuncia e' una bugia.
    """
    if base_richiesta:
        rc, out = _git("merge-base", base_richiesta, "HEAD")
        if rc == 0 and out.strip():
            return out.strip(), f"--base {base_richiesta}"
        return None, f"--base {base_richiesta} NON risolve"

    ref_pr = os.environ.get("GITHUB_BASE_REF", "").strip()
    if ref_pr:
        rc, out = _git("merge-base", f"origin/{ref_pr}", "HEAD")
        if rc == 0 and out.strip():
            return out.strip(), f"GITHUB_BASE_REF=origin/{ref_pr}"
        return None, f"GITHUB_BASE_REF=origin/{ref_pr} dichiarata ma NON risolve"

    rc, out = _git("merge-base", "origin/main", "HEAD")
    if rc == 0 and out.strip():
        return out.strip(), "origin/main"
    return None, "origin/main non risolve"


def righe_aggiunte(base: str) -> list[tuple[str, str]] | None:
    """[(path, testo)] per ogni riga aggiunta fra `base` e HEAD. `None` = MUTO.

    D1 e D11: la prima versione scartava ogni riga che iniziava per `+++`. Ma
    una riga AGGIUNTA il cui contenuto inizia per `++` diventa `+++...` nel
    diff, quindi spariva in silenzio — e una il cui contenuto era `++ b/x.md`
    diventava un'intestazione e DIROTTAVA il path del rapporto su un file
    inesistente. La riparazione non e' una guardia piu' furba: e' che `+++` e'
    un'intestazione SOLO fuori da un hunk. Dentro un hunk, il primo carattere e'
    il marcatore e tutto il resto e' contenuto, punto.
    """
    rc, out = _git(*_BANDIERE, f"{base}..HEAD")
    if rc != 0:
        return None

    fuori: list[tuple[str, str]] = []
    path = "?"
    dentro_hunk = False
    for riga in out.splitlines():
        if riga.startswith("diff --git "):
            dentro_hunk = False
            path = "?"
        elif riga.startswith("@@"):
            dentro_hunk = True
        elif not dentro_hunk and riga.startswith("+++ "):
            destinazione = riga[4:]
            path = destinazione[2:] if destinazione.startswith("b/") else destinazione
        elif dentro_hunk and riga.startswith("+"):
            fuori.append((path, riga[1:]))
    return fuori


def cerca(righe: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return [(p, t) for p, t in righe if viola(t)]


# ── l'oracolo ──────────────────────────────────────────────────────────────
#
# D4, il difetto piu' grave della prima versione: le prove derivavano dalla
# costante sotto test, quindi mutando quella costante l'oracolo mutava con lei e
# restava verde. Qui le prove sono LETTERALI — composte da frammenti adiacenti
# (`"docen" "te"`), che Python concatena a compilazione e che questo file quindi
# non contiene mai per esteso — e soprattutto NON dipendono da `_RADICE`.
#
# Il secondo buco era la copertura: sei difetti su tredici stavano nel parser
# del diff, che l'oracolo non toccava nemmeno. Ora c'e' una prova CAPO A CAPO su
# un repo temporaneo vero, che esercita git, le bandiere e la macchina a stati.
_P_SING = "docen" "te"
_P_PLUR = "docen" "ti"


def _self_test() -> int:
    import shutil
    import tempfile

    fallimenti: list[str] = []

    def coppia(respinta: str, ammessa: str, nome: str) -> None:
        if not viola(respinta):
            fallimenti.append(f"{nome}: doveva essere RESPINTA — {respinta!r}")
        if viola(ammessa):
            fallimenti.append(f"{nome}: doveva essere AMMESSA — {ammessa!r}")

    coppia(f"// il {_P_SING} vede un disegno",
           f"// {SUGGERIMENTO} vede un disegno", "prosa")
    coppia(f"<span>Cruscotto {_P_SING}</span>",
           "<span>Cruscotto di chi insegna</span>", "stringa di interfaccia")
    coppia(f"i {_P_PLUR.upper()} aprono", "chi insegna apre", "maiuscole")
    coppia(f"un {_P_SING}", f"un {_P_SING}ria", "confine di parola")

    # D5: gli identificatori, cioe' il caso che il primo commit aveva in mente e
    # che lasciava passare. Ognuno con la sua forma.
    coppia(f"{_P_PLUR}_attivi = []", "chi_insegna_attivi = []", "snake_case")
    coppia(f"const {_P_SING.upper()}_ROLE = 1", "const RUOLO_INSEGNA = 1", "SCREAMING_SNAKE")
    coppia(f"lista{_P_SING.capitalize()}.map(x => x)", "listaPersone.map(x => x)", "camelCase")

    # D6: la deroga sta dentro un commento, porta una ragione vera, e NON si
    # accontenta di comparire in mezzo a una stringa.
    coppia(f'teacherId: "{_P_SING}-locale"',
           f'teacherId: "{_P_SING}-locale"  # lessico-ok: id gia persistito in produzione',
           "deroga con ragione")
    if not viola(f"il {_P_SING}  # lessico-ok: x"):
        fallimenti.append("deroga corta: una ragione di un carattere e' un interruttore, non una ragione")
    if not viola(f'const m = "vedi lessico-ok: nel manuale"; // pannello {_P_SING}'):
        fallimenti.append("deroga dentro una stringa: non deve esentare il commento che segue")

    # MUTO. Con git muto la base non si risolve e le righe non si leggono; e se
    # GitHub DICHIARA una base che non risolve, e' MUTO, non ripiego.
    globale = globals()
    vero_git = globale["_git"]
    try:
        globale["_git"] = lambda *a: (128, "")
        if risolvi_base(None)[0] is not None:
            fallimenti.append("MUTO: con git muto la base non doveva risolversi")
        if righe_aggiunte("qualunque") is not None:
            fallimenti.append("MUTO: con git muto le righe non dovevano risolversi")
        os.environ["GITHUB_BASE_REF"] = "ramo-che-non-esiste"
        base, da_dove = risolvi_base(None)
        if base is not None or "NON risolve" not in da_dove:
            fallimenti.append("D3: una base DICHIARATA che non risolve deve dare MUTO, non ripiego")
    finally:
        globale["_git"] = vero_git
        os.environ.pop("GITHUB_BASE_REF", None)

    # ── capo a capo, su un repo vero ──────────────────────────────────────
    # Il parser aveva copertura zero. Questo esercita git, le bandiere e la
    # macchina a stati, e include D1: una riga aggiunta il cui CONTENUTO inizia
    # per `++` diventa `+++...` nel diff e nella prima versione spariva.
    tmp = tempfile.mkdtemp(prefix="lessico-e2e-")
    prima = os.getcwd()
    try:
        os.chdir(tmp)
        for cmd in (("init", "-q", "-b", "main"),
                    ("config", "user.email", "t@t"),
                    ("config", "user.name", "t")):
            _git(*cmd)
        with open("base.md", "w", encoding="utf-8") as f:
            f.write("riga innocua\n")
        _git("add", "-A"); _git("commit", "-q", "-m", "base")
        rc_base, sha = _git("rev-parse", "HEAD")
        radice = sha.strip()

        casi = [
            ("pulito", ["riga innocua", "un'altra riga"], False),
            ("violazione semplice", ["riga innocua", f"il {_P_SING} legge"], True),
            ("D1: contenuto che inizia per ++", ["riga innocua", f"++ i {_P_PLUR} aprono"], True),
            ("D11: contenuto che finge un header",
             ["riga innocua", "++ b/finto.md", f"il {_P_SING} qui"], True),
        ]
        for nome, righe, atteso_rosso in casi:
            _git("checkout", "-q", "-B", "prova", radice)
            with open("base.md", "w", encoding="utf-8") as f:
                f.write("\n".join(righe) + "\n")
            _git("add", "-A"); _git("commit", "-q", "-m", nome)
            agg = righe_aggiunte(radice)
            if agg is None:
                fallimenti.append(f"e2e «{nome}»: git muto")
                continue
            trovati = cerca(agg)
            if bool(trovati) != atteso_rosso:
                fallimenti.append(
                    f"e2e «{nome}»: atteso {'ROSSO' if atteso_rosso else 'verde'}, "
                    f"ottenuto {'ROSSO' if trovati else 'verde'} ({len(agg)} righe aggiunte)")
            if nome.startswith("D11") and trovati and trovati[0][0] != "base.md":
                fallimenti.append(f"D11: il path e' stato dirottato su {trovati[0][0]!r}")

        # D2: un `.gitattributes` che disattiva il diff, nello stesso commit.
        _git("checkout", "-q", "-B", "prova2", radice)
        with open(".gitattributes", "w", encoding="utf-8") as f:
            f.write("* -diff\n")
        with open("base.md", "w", encoding="utf-8") as f:
            f.write(f"riga innocua\nil {_P_SING} nascosto\n")
        _git("add", "-A"); _git("commit", "-q", "-m", "gitattributes")
        agg = righe_aggiunte(radice)
        if agg is None or not cerca(agg):
            fallimenti.append("D2: un `.gitattributes` con `-diff` non deve accecare il cancello")
    finally:
        os.chdir(prima)
        shutil.rmtree(tmp, ignore_errors=True)

    if fallimenti:
        print("lessico_gate --self-test: ROSSO", file=sys.stderr)
        for f in fallimenti:
            print(f"  · {f}", file=sys.stderr)
        return ROSSO
    print("lessico_gate --self-test: verde")
    return VERDE


def main(argv: list[str]) -> int:
    if "--self-test" in argv:
        return _self_test()

    base_richiesta = None
    if "--base" in argv:
        i = argv.index("--base")
        if i + 1 >= len(argv):
            print("lessico_gate: MUTO — `--base` senza valore", file=sys.stderr)
            return MUTO
        base_richiesta = argv[i + 1]

    base, da_dove = risolvi_base(base_richiesta)
    # D3: la base si STAMPA sempre. La prima versione non la diceva mai, quindi
    # un ripiego silenzioso era invisibile anche a chi leggeva il rosso.
    if base is None:
        print(f"lessico_gate: MUTO — base non risolta ({da_dove}).\n"
              "  Non ho guardato niente, e questo NON e' un verde. In CI serve\n"
              "  `fetch-depth: 0`; in locale, `git fetch origin main`.", file=sys.stderr)
        return MUTO

    righe = righe_aggiunte(base)
    if righe is None:
        print(f"lessico_gate: MUTO — git diff non risponde su {base[:8]}..HEAD", file=sys.stderr)
        return MUTO

    colpevoli = cerca(righe)
    if not colpevoli:
        print(f"lessico_gate: verde — base {base[:8]} ({da_dove}), "
              f"{len(righe)} righe aggiunte, 0 la nominano.")
        return VERDE

    print(f"lessico_gate: ROSSO — ARDESIA e' per tutti. "
          f"base {base[:8]} ({da_dove}).", file=sys.stderr)
    print(f"  Si scrive «{SUGGERIMENTO}». Righe aggiunte da correggere:\n", file=sys.stderr)
    for path, testo in colpevoli:
        print(f"  {path}\n      {testo.strip()[:100]}", file=sys.stderr)
    print("\n  Se la riga DEVE contenerla (un id gia' persistito, una citazione),\n"
          "  dichiaralo IN UN COMMENTO sulla riga stessa: `lessico-ok: <ragione>`,\n"
          "  con una ragione vera — otto caratteri almeno.", file=sys.stderr)
    return ROSSO


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
