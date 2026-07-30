#!/usr/bin/env python3
"""Test dell'unita' F0-1: stato corrente generato a macchina.

Convenzione del repo: eseguibile diretto, exit 0 = verde, exit 1 = rosso.
Testa le funzioni PURE del generatore. La raccolta da git/gh e' I/O e viene
verificata da `project_state.py --verify`, non qui.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
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


# --- i tre finding della revisione avversariale del 2026-07-30 -----------
# Tutti e tre verificati sul codice reale prima di essere accettati, tutti e
# tre classificati `mechanical`: diventano controlli, non attenzione.

def test_finding1_la_scoperta_copre_ogni_config_playwright() -> None:
    """Il glob `apps/*/e2e/**` mancava `apps/studio/eval/replay-kill-test.spec.ts`,
    che una SUA config Playwright include esplicitamente: 21 spec riportate su
    22 reali. La scoperta deve seguire le config, non una convenzione di path."""
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        (root / "apps/studio/e2e").mkdir(parents=True)
        (root / "apps/studio/eval").mkdir(parents=True)
        (root / "apps/studio/e2e/a.spec.ts").write_text("//")
        (root / "apps/studio/eval/replay-kill-test.spec.ts").write_text("//")
        (root / "apps/studio/playwright.config.ts").write_text('testDir: "./e2e"')
        (root / "apps/studio/eval/playwright.config.ts").write_text(
            'testDir: ".",\n  testMatch: "replay-kill-test.spec.ts",')
        (root / "node_modules/pkg/e2e").mkdir(parents=True)
        (root / "node_modules/pkg/e2e/rumore.spec.ts").write_text("//")

        # e le spec .spec.js di un altro workspace, che il glob `.spec.ts`
        # ignorava: 79 file reali in plugins/elab-tutor, scoperti correggendo
        # questo stesso finding.
        (root / "plugins/elab-tutor/e2e").mkdir(parents=True)
        (root / "plugins/elab-tutor/e2e/01-homepage.spec.js").write_text("//")

        out = ps.collect_e2e(root)
        check("spec_count", out["spec_count"], 3)
        check_true("eval inclusa", "apps/studio/eval/replay-kill-test.spec.ts" in out["specs"])
        check_true("spec .js inclusa",
                   "plugins/elab-tutor/e2e/01-homepage.spec.js" in out["specs"])
        check_true("node_modules escluso",
                   not any("node_modules" in s for s in out["specs"]))
        check("config trovate", len(out["playwright_configs"]), 2)
        check("conta per workspace", out["spec_count_by_workspace"],
              {"apps/studio": 2, "plugins/elab-tutor": 1})


def test_finding2_in_ci_non_scatta_su_un_commento() -> None:
    """`"playwright" in testo` rendeva `in_ci: true` per un workflow che
    contiene solo `# TODO: add playwright later`. Un gate lessicale che scambia
    la PAROLA per l'ESECUZIONE e' un generatore di falso verde."""
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        wf = root / ".github/workflows"
        wf.mkdir(parents=True)
        (wf / "solo-commento.yml").write_text(
            "name: ci\n# TODO: add playwright later\njobs:\n  x:\n    steps:\n"
            "      - run: echo ciao\n")
        out = ps.collect_e2e(root)
        check("in_ci su commento", out["in_ci"], False)
        check("nessuna evidenza", out["in_ci_evidence"], [])

        (wf / "vera.yml").write_text(
            "jobs:\n  e2e:\n    steps:\n      - run: npx playwright test\n")
        out2 = ps.collect_e2e(root)
        check("in_ci su invocazione vera", out2["in_ci"], True)
        check_true("evidenza citata",
                   any("playwright test" in e for e in out2["in_ci_evidence"]))


def test_finding3_repo_dichiara_i_campi_non_misurati() -> None:
    """`collect_repo` riportava MEASURED con `origin_main_sha: null` e nessun
    motivo: viola il contratto che questa unita' esiste per imporre."""
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        for cmd in (["git", "init", "-q"],
                    ["git", "-c", "user.email=a@b", "-c", "user.name=a",
                     "commit", "-q", "--allow-empty", "-m", "x"]):
            subprocess.run(cmd, cwd=root, capture_output=True)
        out = ps.collect_repo(root)
        check_true("head misurato", out["head_sha_full"] != "")
        check_true("origin/main dichiarato non misurato",
                   "origin_main_sha" in out.get("unmeasured", {}))
        motivo = out.get("unmeasured", {}).get("origin_main_sha", "")
        check_true(f"con motivo (ottenuto {motivo!r})", "origin/main" in motivo)
        # e il motivo deve arrivare all'occhio umano, non restare nel JSON
        stato = ps.empty_state()
        stato["repo"] = out
        check_true("visibile in CURRENT.md",
                   "origin_main_sha" in ps.render_current_md(stato))


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
        test_finding1_la_scoperta_copre_ogni_config_playwright,
        test_finding2_in_ci_non_scatta_su_un_commento,
        test_finding3_repo_dichiara_i_campi_non_misurati,
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
