#!/usr/bin/env python3
"""Test dell'unita' F0-1: stato corrente generato a macchina.

Convenzione del repo: eseguibile diretto, exit 0 = verde, exit 1 = rosso.
Testa le funzioni PURE del generatore. La raccolta da git/gh e' I/O e viene
verificata da `project_state.py --verify`, non qui.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import project_state as ps  # noqa: E402

FAILURES: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        FAILURES.append(f"{label}: atteso {want!r}, ottenuto {got!r}")


def check_true(label: str, cond: bool) -> None:
    if not cond:
        FAILURES.append(f"{label}: atteso vero")


# --- classificazione PR -------------------------------------------------
# La trappola misurata il 2026-07-30: 21 PR su 34 riportano CLEAN contro una
# base MORTA. `mergeStateStatus` da solo NON distingue i due casi, quindi la
# classificazione non puo' dipendere da lui.

PRS = [
    # base main, nessun omonimo piu' recente -> current
    {"number": 221, "title": "docs(ci): record why", "baseRefName": "main",
     "headRefName": "a", "mergeStateStatus": "BEHIND", "isDraft": False},
    # tre PR con lo STESSO titolo: solo la piu' alta e' current
    {"number": 194, "title": "bootstrap Storybook", "baseRefName": "main",
     "headRefName": "b1", "mergeStateStatus": "DIRTY", "isDraft": False},
    {"number": 195, "title": "bootstrap Storybook", "baseRefName": "main",
     "headRefName": "b2", "mergeStateStatus": "DIRTY", "isDraft": False},
    {"number": 197, "title": "bootstrap Storybook", "baseRefName": "main",
     "headRefName": "b3", "mergeStateStatus": "DIRTY", "isDraft": False},
    # base != main e la base NON e' fra i rami head aperti -> base orfana
    {"number": 189, "title": "docs(o1)", "baseRefName": "codex/ramo-morto",
     "headRefName": "c", "mergeStateStatus": "CLEAN", "isDraft": False},
    # base != main ma la base E' il ramo head di un'altra PR aperta -> stack
    {"number": 208, "title": "canary", "baseRefName": "agent/gate-runner",
     "headRefName": "d", "mergeStateStatus": "CLEAN", "isDraft": False},
    {"number": 206, "title": "gate runner", "baseRefName": "main",
     "headRefName": "agent/gate-runner", "mergeStateStatus": "CLEAN",
     "isDraft": False},
]


def test_classificazione() -> None:
    out = ps.classify_pull_requests(PRS)
    check("open_count", out["open_count"], 7)
    check("superseded", sorted(out["superseded"]), [194, 195])
    check("orphan_base", sorted(out["orphan_base"]), [189])
    check("stacked", sorted(out["stacked"]), [208])
    check("current", sorted(out["current"]), [197, 206, 221])
    # ogni PR sta in esattamente una classe
    tutte = out["superseded"] + out["orphan_base"] + out["stacked"] + out["current"]
    check("partizione totale", len(tutte), 7)
    check("partizione disgiunta", len(set(tutte)), 7)


def test_clean_contro_base_morta_non_e_pronta() -> None:
    """CLEAN non implica pronta: #189 e' CLEAN e ha base orfana."""
    out = ps.classify_pull_requests(PRS)
    check_true("189 CLEAN ma non current", 189 not in out["current"])


# --- catalogo esperimenti ----------------------------------------------

CATALOGO = """
export interface ElabCatalogEntry {
  experimentId: string
  sceneStatus: "candidate" | "certified"
}

export const ELAB_CORPUS_TOTAL = 88

export const ELAB_EXPERIMENT_CATALOG: readonly ElabCatalogEntry[] = [
  { experimentId: "v1-cap6-esp1", sceneStatus: "candidate" },
  { experimentId: "v1-cap6-esp2", sceneStatus: "candidate" },
  { experimentId: "v1-cap9-esp6", sceneStatus: "certified" },
]
"""


def test_catalogo() -> None:
    out = ps.parse_catalog(CATALOGO)
    check("total", out["total"], 88)
    check("status", out["status"], "MEASURED")
    # la DICHIARAZIONE DI TIPO non e' un esperimento: contarla dava 3 candidate
    # dove ce ne sono 2, ed e' il difetto reale trovato sul catalogo vero
    # (5 candidate riportati contro 4 reali).
    check("candidate senza la riga di tipo", out["by_scene_status"].get("candidate"), 2)
    check("certified", out["certified"], 1)
    check("entries", out["entries"], 3)
    check("vocabolario dichiarato", out["declared_vocabulary"], ["candidate", "certified"])


def test_catalogo_senza_totale_non_inventa() -> None:
    """Assenza di prova e' un esito legittimo: mai un numero inventato."""
    out = ps.parse_catalog("export const NIENTE = 1\n")
    check("status senza totale", out["status"], "UNAVAILABLE")
    check_true("nessun total inventato", out.get("total") is None)


def test_catalogo_letture_divergenti_non_pubblicano() -> None:
    """Due letture indipendenti che divergono = parser che conta altro."""
    rotto = ('export const ELAB_CORPUS_TOTAL = 88\n'
             'export const ELAB_EXPERIMENT_CATALOG = [\n'
             '  { experimentId: "a", sceneStatus: "candidate" },\n'
             '  { experimentId: "b" },\n'
             ']\n')
    out = ps.parse_catalog(rotto)
    check("status divergente", out["status"], "UNAVAILABLE")
    check_true("nessun total pubblicato", out.get("total") is None)
    check_true("motivo dichiarato", "non sta contando" in out.get("reason", ""))


# --- CURRENT.md ---------------------------------------------------------

def _stato_che_sfonda_il_tetto() -> dict:
    """Precondizione STABILITA, non sperata.

    Il control run per mutazione ha dimostrato che disabilitare il tetto NON
    faceva fallire la versione precedente di questo test: `MD_PR_LIMIT` tronca
    gia' la tabella PR a 40 righe, quindi trecento PR non sfondavano nulla e
    l'assert era verde per inerzia. La sezione `certification` invece itera
    `by_scene_status` senza limite: e' da li' che deve arrivare la pressione.
    """
    stato = ps.empty_state()
    stato["certification"] = {
        "status": "MEASURED",
        "source": "finto",
        "total": 88,
        "certified": 0,
        "by_scene_status": {f"stato-{i:04d}": 1 for i in range(400)},
    }
    return stato


def test_precondizione_il_tetto_serve_davvero() -> None:
    """Senza tetto, quello stato produrrebbe > 250 righe. Se questo assert
    fallisce, il test sotto e' vacuo e va riscritto, non ignorato."""
    grezzo = ps.render_current_md_untruncated(_stato_che_sfonda_il_tetto())
    n = len(grezzo.splitlines())
    check_true(f"senza tetto sfonda (ottenute {n} righe)", n > ps.MD_MAX_LINES)


def test_current_md_sotto_250_righe() -> None:
    testo = ps.render_current_md(_stato_che_sfonda_il_tetto())
    righe = testo.splitlines()
    check_true(f"<=250 righe (ottenute {len(righe)})", len(righe) <= ps.MD_MAX_LINES)
    check_true("dichiara di essere generato", "GENERATO" in testo)
    check_true("dichiara il troncamento", "troncato" in testo)

    # e la tabella PR ha un suo tetto, verificato separatamente
    stato = ps.empty_state()
    stato["pull_requests"] = {
        "status": "MEASURED", "source": "gh pr list", "open_count": 300,
        "current": list(range(300)), "superseded": [], "orphan_base": [], "stacked": [],
        "detail": {str(n): {"title": "x" * 90, "base": "main", "class": "current"}
                   for n in range(300)},
    }
    md = ps.render_current_md(stato)
    check_true("tabella PR troncata e dichiarata", "altre 260 in" in md)


def test_current_md_dichiara_i_campi_non_misurati() -> None:
    stato = ps.empty_state()
    stato["deploy"] = {"status": "UNAVAILABLE", "reason": "nessuna ricevuta di deploy leggibile a macchina"}
    testo = ps.render_current_md(stato)
    check_true("UNAVAILABLE visibile", "UNAVAILABLE" in testo)
    check_true("motivo visibile", "nessuna ricevuta" in testo)


def main() -> int:
    tests = (
        test_classificazione,
        test_clean_contro_base_morta_non_e_pronta,
        test_catalogo,
        test_catalogo_senza_totale_non_inventa,
        test_catalogo_letture_divergenti_non_pubblicano,
        test_precondizione_il_tetto_serve_davvero,
        test_current_md_sotto_250_righe,
        test_current_md_dichiara_i_campi_non_misurati,
    )
    for fn in tests:
        try:
            fn()
        except Exception as exc:  # noqa: BLE001
            FAILURES.append(f"{fn.__name__}: eccezione {exc!r}")
    if FAILURES:
        for f in FAILURES:
            print(f"ROSSO  {f}")
        print(f"\n{len(FAILURES)} test falliti")
        return 1
    print(f"VERDE  {len(tests)} test")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
