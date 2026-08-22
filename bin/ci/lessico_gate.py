#!/usr/bin/env python3
"""ARDESIA e' per tutti: le righe NUOVE non restringono il destinatario.

LA REGOLA. `CLAUDE.md` la scrive due volte, in rosso: ARDESIA serve
dall'autodidatta al professore universitario, dal bambino all'adulto, e non si
usa il sostantivo che questo file respinge — si scrive «chi impara o insegna».
La correzione allarga il DESTINATARIO, non l'obiettivo: il criterio resta
«usare ARDESIA a lezione».

QUESTO FILE NON SCRIVE MAI QUELLA PAROLA PER ESTESO, e non e' vezzo: girato
su se stesso, il cancello si respingeva in dieci righe. Esentarlo sarebbe
stata l'esclusione a mano che questo repo vieta; annegarlo di deroghe avrebbe
reso la deroga un rumore di fondo. Resta la terza via — applicarsi la propria
regola — e le prove qui sotto compongono il token da `_RADICE` invece di
citarlo. Il control run e' che `python3 bin/ci/lessico_gate.py` su questo
stesso ramo esce VERDE: un cancello che non passa se stesso non ha titolo per
respingere nessun altro.

PERCHE' UN CANCELLO E NON UNA FRASE. Il 2026-08-22 la regola era scritta due
volte e violata quattro volte dentro una sola PR aperta — #239, una in
`apps/studio/sim/solver/catalog.ts` e tre in
`apps/studio/src/__tests__/ElabVisibleExperimentsSolve.test.ts`. Una di quelle
quattro trascinava anche un pronome («Il messaggio non e' per lui»). Una regola
che nessuno script controlla e' una frase, e questo progetto conosce gia' la
differenza: la applica a se stesso ovunque tranne che qui.

PERCHE' IL DIFF E NON L'ALBERO. Misurato su `origin/main` lo stesso giorno:
9697 occorrenze in 1340 file, 8896 delle quali dentro `plugins/elab-tutor`. Un
ratchet su quel numero non sarebbe un cancello: nessun progresso realistico lo
muove, e chi lo alzasse per sbaglio non incontrerebbe resistenza. Il referente
giusto e' quello che la regola governa davvero — cio' che si SCRIVE, cioe' le
righe che una modifica AGGIUNGE. E' anche l'unico referente che `CLAUDE.md`
nomina per nome fra quelli leciti: «il diff, il set, il nome del token».

⚠️ IL LIMITE, DICHIARATO INVECE CHE SCOPERTO. Questo cancello non guarda le
9697 occorrenze che esistono gia', e non le guardera' mai. Non e' una svista,
e' la scelta — ma va detta, perche' «il repo passa il cancello lessicale» NON
significa «il repo non lo dice piu'». Significa «non ne ha aggiunti di nuovi».
Chi volesse chiudere anche l'esistente ha bisogno di un'unita' diversa, non di
un parametro diverso qui.

I TRE ESITI: 0 VERDE, 1 ROSSO, 2 MUTO. Se la base del confronto non si
risolve, questo script esce 2. Un cancello che non sa qual e' il proprio
referente non ha guardato niente, e «non ho guardato niente» non e' «e' tutto a
posto»: sono due affermazioni con rimedi opposti. Un exit code e'
un'affermazione su un PROCESSO, non su un test.

LA DEROGA VIVE SULLA RIGA CHE DEROGA. Una riga che deve contenere la parola —
un identificatore gia' persistito, una citazione dal libro, il nome di un campo
di dati — lo dichiara su se stessa con `lessico-ok: <ragione>`. Non esiste
nessuna lista centrale di esclusioni da mantenere, perche' una lista di
esclusioni e' esattamente l'enumerazione a mano che questo repo vieta: la
deroga si legge dove si legge il codice, e sparisce quando la riga sparisce.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys

VERDE, ROSSO, MUTO = 0, 1, 2

# La radice e le sue due flessioni, non una lista di frasi. Scritta cosi' anche
# perche' la classe di caratteri tiene il token spezzato: la regex descrive la
# parola senza contenerla, ed e' il motivo per cui questa riga passa il proprio
# cancello.
_RADICE = "docent"
VIETATO = re.compile(rf"\b{_RADICE}[ei]\b", re.IGNORECASE)

# La deroga, che deve stare sulla riga stessa.
DEROGA = re.compile(r"lessico-ok:\s*\S", re.IGNORECASE)

SUGGERIMENTO = "chi impara o insegna"


def _git(*argv: str) -> tuple[int, str]:
    """Esegue git senza pipe: l'exit code e' quello di git, non dell'ultimo
    comando di una catena. Ritorna (rc, stdout)."""
    p = subprocess.run(
        ["git", *argv], capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    return p.returncode, p.stdout


def risolvi_base(base_richiesta: str | None) -> str | None:
    """Il punto da cui contare le righe aggiunte, o None se non si determina.

    Ordine: argomento esplicito, poi il ramo di base della PR come lo espone
    GitHub, poi `origin/main`. Il valore restituito e' un merge-base REALE, non
    un nome: confrontare con la punta di main invece che col merge-base
    attribuirebbe a questa modifica ogni riga che main ha aggiunto nel
    frattempo, e su una PR di 92 commit di ritardo sarebbero migliaia.
    """
    candidati = []
    if base_richiesta:
        candidati.append(base_richiesta)
    ref_pr = os.environ.get("GITHUB_BASE_REF", "").strip()
    if ref_pr:
        candidati.append(f"origin/{ref_pr}")
    candidati.append("origin/main")

    for c in candidati:
        rc, out = _git("merge-base", c, "HEAD")
        if rc == 0 and out.strip():
            return out.strip()
    return None


def righe_aggiunte(base: str) -> list[tuple[str, str]] | None:
    """[(path, testo)] per ogni riga aggiunta fra `base` e HEAD, o None se git
    non risponde. `--unified=0` toglie il contesto: una riga di contesto non e'
    stata aggiunta da questa modifica, e contarla accuserebbe l'innocente."""
    rc, out = _git("diff", "--unified=0", "--no-color", f"{base}..HEAD")
    if rc != 0:
        return None

    fuori: list[tuple[str, str]] = []
    path = "?"
    for riga in out.splitlines():
        if riga.startswith("+++ b/"):
            path = riga[6:]
        elif riga.startswith("+") and not riga.startswith("+++"):
            fuori.append((path, riga[1:]))
    return fuori


def viola(testo: str) -> bool:
    """Vero se la riga usa il token e non deroga su se stessa."""
    if DEROGA.search(testo):
        return False
    return bool(VIETATO.search(testo))


def cerca(righe: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return [(p, t) for p, t in righe if viola(t)]


# ── control run ────────────────────────────────────────────────────────────
# Non «le funzioni girano»: un oracolo che resta verde sotto mutazione non
# misura niente. Ogni caso qui sotto e' una COPPIA — la riga che deve essere
# respinta e la sua mutazione minima che deve passare — cosi' un cancello che
# dicesse sempre «no» fallirebbe tanto quanto uno che dicesse sempre «si».
def _self_test() -> int:
    fallimenti: list[str] = []

    def coppia(respinta: str, ammessa: str, nome: str) -> None:
        if not viola(respinta):
            fallimenti.append(f"{nome}: doveva essere RESPINTA e non lo e' — {respinta!r}")
        if viola(ammessa):
            fallimenti.append(f"{nome}: doveva essere AMMESSA e non lo e' — {ammessa!r}")

    # Le prove compongono il token invece di citarlo: e' l'unico modo di
    # provare un cancello senza violarlo, e la composizione e' visibile qui
    # sotto invece che nascosta in una fixture altrove.
    sing = f"{_RADICE}e"
    plur = f"{_RADICE}i".upper()

    coppia(
        f"// il {sing} vede un disegno completo",
        f"// {SUGGERIMENTO} vede un disegno completo",
        "prosa",
    )
    coppia(
        f"<span>Cruscotto {sing}</span>",
        "<span>Cruscotto di chi insegna</span>",
        "stringa di interfaccia",
    )
    coppia(f"i {plur} aprono", "chi insegna apre", "maiuscole")
    coppia(f"un {sing}", f"un {sing}ria", "confine di parola")

    # La deroga: stessa riga, stesso token, esito opposto — e la deroga NUDA
    # non basta, perche' una deroga senza ragione e' un interruttore, non una
    # dichiarazione.
    coppia(
        f'teacherId: "{sing}-locale"',
        f'teacherId: "{sing}-locale"  # lessico-ok: id gia\' persistito',
        "deroga con ragione",
    )
    if not viola(f"il {sing}  # lessico-ok:"):
        fallimenti.append("deroga nuda: doveva essere RESPINTA, la ragione non e' opzionale")

    # Il terzo esito. Quando nessuna base si risolve, `risolvi_base` deve dire
    # None — cioe' MUTO — e non ripiegare su un verde. Si prova sostituendo
    # git, perche' l'unico modo onesto di provare «git non risponde» e' che
    # git non risponda.
    globale = globals()
    vero_git = globale["_git"]
    try:
        globale["_git"] = lambda *a: (128, "")
        if risolvi_base(None) is not None:
            fallimenti.append("MUTO: con git muto la base non doveva risolversi")
        if righe_aggiunte("qualunque") is not None:
            fallimenti.append("MUTO: con git muto le righe non dovevano risolversi")
    finally:
        globale["_git"] = vero_git

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
            print("lessico_gate: --base senza valore", file=sys.stderr)
            return MUTO
        base_richiesta = argv[i + 1]

    base = risolvi_base(base_richiesta)
    if base is None:
        print(
            "lessico_gate: MUTO — nessuna base di confronto si risolve.\n"
            "  Non ho guardato niente, e questo NON e' un verde. In CI serve\n"
            "  `fetch-depth: 0`; in locale, `git fetch origin main`.",
            file=sys.stderr,
        )
        return MUTO

    righe = righe_aggiunte(base)
    if righe is None:
        print(f"lessico_gate: MUTO — git diff non risponde su {base}..HEAD", file=sys.stderr)
        return MUTO

    colpevoli = cerca(righe)
    if not colpevoli:
        print(f"lessico_gate: verde — {len(righe)} righe aggiunte, 0 la nominano.")
        return VERDE

    print("lessico_gate: ROSSO — ARDESIA e' per tutti.", file=sys.stderr)
    print(f"  Si scrive «{SUGGERIMENTO}». Righe aggiunte da correggere:\n", file=sys.stderr)
    for path, testo in colpevoli:
        print(f"  {path}\n      {testo.strip()[:100]}", file=sys.stderr)
    print(
        "\n  Se la riga DEVE contenere la parola (un id gia' persistito, una\n"
        "  citazione), dichiaralo sulla riga stessa: `lessico-ok: <ragione>`.",
        file=sys.stderr,
    )
    return ROSSO


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
