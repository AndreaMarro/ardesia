#!/usr/bin/env python3
"""Test dell'unita' F0-1: stato corrente generato a macchina.

Convenzione del repo: eseguibile diretto, exit 0 = verde, exit 1 = rosso.
Testa le funzioni PURE del generatore. La raccolta da git/gh e' I/O e viene
verificata da `project_state.py --verify`, non qui.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
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


def test_deploy_ricevuta_storica_e_allineamento_ricalcolato() -> None:
    """La ricevuta di deploy e' un fatto STORICO e va committata; `matches_main`
    invece e' uno stato corrente e va RICALCOLATO a ogni lettura, non
    memorizzato. La prima versione cercava il file sotto `artifacts/`, che e'
    gitignorato: sarebbe stata una ricevuta che sparisce."""
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        for cmd in (["git", "init", "-q"],
                    ["git", "-c", "user.email=a@b", "-c", "user.name=a",
                     "commit", "-q", "--allow-empty", "-m", "x"]):
            subprocess.run(cmd, cwd=root, capture_output=True)
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                             capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "branch", "-f", "main"], cwd=root, capture_output=True)
        subprocess.run(["git", "remote", "add", "origin", "."], cwd=root, capture_output=True)
        subprocess.run(["git", "update-ref", "refs/remotes/origin/main", sha],
                       cwd=root, capture_output=True)

        # nessuna ricevuta: dichiarato, non silenzioso
        vuoto = ps.collect_deploy(root)
        check("senza ricevute", vuoto["status"], "UNAVAILABLE")

        dep = root / "docs/ops/deploys"
        dep.mkdir(parents=True)
        # due ricevute: vince la piu' recente per nome (i nomi portano la data)
        (dep / "2026-07-01T00-00Z-vecchia.json").write_text(
            '{"commit_sha": "0000000000000000000000000000000000000000"}')
        (dep / "2026-07-30T10-45Z-nuova.json").write_text(f'{{"commit_sha": "{sha}"}}')

        out = ps.collect_deploy(root)
        check("status", out["status"], "MEASURED")
        check("prende la piu' recente", out["commit_sha"], sha)
        check("conta le ricevute", out["receipts_count"], 2)
        check_true("allineato a main", out["matches_main"] is True)

        # il dato deve arrivare all'occhio umano, non restare nel JSON:
        # la prima versione del renderer leggeva `sha`/`at` invece di
        # `commit_sha`/`deployed_at` e stampava «ultimo deploy: ? il ?»
        stato = ps.empty_state()
        stato["deploy"] = out
        md = ps.render_current_md(stato)
        check_true("la SHA del deploy e' visibile in CURRENT.md", sha in md)
        check_true("nessun campo perso", "? il ?" not in md)

        # una ricevuta a una SHA diversa deve dire NON allineato
        (dep / "2026-07-31T00-00Z-disallineata.json").write_text(
            '{"commit_sha": "1111111111111111111111111111111111111111"}')
        out2 = ps.collect_deploy(root)
        check_true("disallineato rilevato", out2["matches_main"] is False)

        # una ricevuta NON puo' dichiarare come e' stata letta: `status`,
        # `source` e `receipts_count` sono affermazioni del collettore
        (dep / "2026-08-01T00-00Z-bugiarda.json").write_text(json.dumps({
            "commit_sha": "2222222222222222222222222222222222222222",
            "status": "UNAVAILABLE", "source": "forgiata", "receipts_count": 999,
        }))
        out3 = ps.collect_deploy(root)
        check("status non sovrascrivibile", out3["status"], "MEASURED")
        check("source non sovrascrivibile", out3["source"], "docs/ops/deploys/2026-08-01T00-00Z-bugiarda.json")
        check("receipts_count non sovrascrivibile", out3["receipts_count"], 4)

        # JSON valido ma di forma sbagliata: UNAVAILABLE, non un crash
        (dep / "2026-08-02T00-00Z-lista.json").write_text("[]")
        out4 = ps.collect_deploy(root)
        check("radice non-oggetto", out4["status"], "UNAVAILABLE")
        check_true("motivo dichiarato", "radice list" in out4.get("reason", ""))


def test_deploy_i_due_finding_avversariali_del_2026_07_30() -> None:
    """Entrambi riprodotti prima di essere accettati, entrambi meccanici."""
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        for cmd in (["git", "init", "-q"],
                    ["git", "-c", "user.email=a@b", "-c", "user.name=a",
                     "commit", "-q", "--allow-empty", "-m", "x"]):
            subprocess.run(cmd, cwd=root, capture_output=True)
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                             capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "update-ref", "refs/remotes/origin/main", sha],
                       cwd=root, capture_output=True)
        dep = root / "docs/ops/deploys"
        dep.mkdir(parents=True)

        # --- FINDING 2: ricevuta senza `commit_sha` --------------------------
        # Prima usciva MEASURED con `matches_main: false` e nessun motivo:
        # «non allineato» e «non so a cosa» sono cose diverse.
        (dep / "2026-07-30T00-00Z-senza-sha.json").write_text(
            '{"deployed_at": "2026-07-30T00:00:00Z"}')
        out = ps.collect_deploy(root)
        check("senza commit_sha", out["status"], "UNAVAILABLE")
        check_true("motivo dichiarato", "senza `commit_sha`" in out.get("reason", ""))

        # --- FINDING 1: ref di tracking STANTIO ------------------------------
        # `origin/main` e' un ref LOCALE: senza fetch recente descrive il remoto
        # di quando lo si e' guardato l'ultima volta. Il renderer scrive «pari a
        # main», quindi un ref stantio produrrebbe un `true` che risponde a
        # un'altra domanda.
        (dep / "2026-07-31T00-00Z-con-sha.json").write_text(
            json.dumps({"commit_sha": sha}))
        fresco = ps.collect_deploy(root)
        check_true("ref fresco: allineamento dichiarabile", fresco["matches_main"] is True)

        vecchio = time.time() - 3 * 3600
        for rel in ("refs/remotes/origin/main", "FETCH_HEAD", "packed-refs"):
            f = root / ".git" / rel
            if f.exists():
                os.utime(f, (vecchio, vecchio))
        stantio = ps.collect_deploy(root)
        check_true("ref stantio: NON si dichiara allineato",
                   stantio["matches_main"] is None)
        motivo = stantio.get("unmeasured", {}).get("matches_main", "")
        check_true(f"motivo dichiarato (ottenuto {motivo[:60]!r})",
                   "non aggiornato da" in motivo)


# --- F3-4: la produzione va INTERROGATA, non dedotta da una ricevuta ----
# Misurato il 2026-07-30T20:5x+02:00, a mano: la ricevuta piu' recente diceva
# `dbc8ad9a` (PR #229, 17:21) e `https://ardesia-lavagna.vercel.app` serviva
# `eff62705` (PR #230, 17:51). `collect_deploy` non contatta la produzione:
# gliela racconta un file, e quel file era indietro di un deploy.
#
# Questo verso dello sbaglio e' innocuo e persino voluto (assenza di PROVA).
# Il verso che fa danno e' il simmetrico: una ricevuta PARI a `main` mentre la
# produzione e' indietro — un deploy fallito dopo la ricevuta, o un rollback.
# Allora si stampa «pari a main: SI» e Andrea non ha niente da aprire.


def test_sha_servita_e_ancorata_al_marcatore_di_provenienza() -> None:
    """Forma REALE del bundle di produzione, copiata il 2026-07-30."""
    bundle = ("var ye=`__ARDESIA_BUILD__`;function be(){try{return"
              "`eff62705dd239f08f3272d2b90f046a62957bd3f`}catch{return null}}")
    check("sha servita", ps.estrai_sha_servita(bundle),
          "eff62705dd239f08f3272d2b90f046a62957bd3f")


def test_un_esadecimale_qualunque_non_e_una_sha_servita() -> None:
    """CoV #2: cosa mostrerebbe la misura se l'affermazione fosse falsa?

    Un `[0-9a-f]{40}` non ancorato accetta un hash di integrita' o una
    fixture: riporterebbe una SHA con la stessa faccia di quella vera. Il
    marcatore `__ARDESIA_BUILD__` e' cio' che `vite.config.ts` compila
    ACCANTO alla SHA, ed e' l'unica ancora che distingue le due.
    """
    check("nessun marcatore",
          ps.estrai_sha_servita('const sri="da39a3ee5e6b4b0d3255bfef95601890afd80709"'),
          None)


def test_sha_lontana_dal_marcatore_non_viene_raccolta() -> None:
    """Il riempimento va SEPARATO dalla SHA, o il test passa per il motivo sbagliato.

    Prima versione: `("x" * 4000) + sha`. Passava, ma non per la finestra —
    `_SHA40_RE` chiede `\\b` e fra una `x` e una `d` non c'e' alcun confine di
    parola, quindi non matchava mai. Il control run l'ha smascherata: con la
    regex NON ancorata questo test restava verde. Un criterio che resta verde
    quando la cosa che asserisce si rompe non e' un criterio.
    """
    lontano = "`" + ps.MARCATORE_BUILD + "`;" + ("x" * 4000) + ";da39a3ee5e6b4b0d3255bfef95601890afd80709"
    check("precondizione: la SHA lontana e' RAGGIUNGIBILE dalla regex",
          bool(ps._SHA40_RE.search(lontano)), True)
    check("fuori finestra", ps.estrai_sha_servita(lontano), None)


def test_produzione_irraggiungibile_e_UNAVAILABLE_non_falso_verde() -> None:
    def fetch_rotto(_url: str) -> str:
        raise OSError("getaddrinfo failed")

    got = ps.collect_served("https://esempio.invalid", fetch_rotto)
    check("status", got["status"], "UNAVAILABLE")
    check_true("motivo scritto", bool(got.get("reason")))
    check_true("nessuna sha inventata", got.get("served_commit_sha") is None)


def test_produzione_raggiungibile_dichiara_la_sha_e_la_sua_fonte() -> None:
    pagina = '<script type="module" src="/assets/index-nzwOe0RD.js"></script>'
    asset = "var ye=`__ARDESIA_BUILD__`;return`" + "e" * 40 + "`"

    def fetch(url: str) -> str:
        return asset if url.endswith(".js") else pagina

    got = ps.collect_served("https://ardesia-lavagna.vercel.app", fetch)
    check("status", got["status"], "MEASURED")
    check("sha", got["served_commit_sha"], "e" * 40)
    check_true("dichiara da quale asset", "index-nzwOe0RD.js" in str(got.get("source")))


def test_pagina_servita_senza_marcatore_non_e_un_verde() -> None:
    """Un 200 non e' una misura: la pagina puo' essere un vecchio build."""
    def fetch(url: str) -> str:
        return "<script src=/assets/v.js></script>" if not url.endswith(".js") else "var a=1"

    got = ps.collect_served("https://ardesia-lavagna.vercel.app", fetch)
    check("status", got["status"], "UNAVAILABLE")
    check_true("nessuna sha inventata", got.get("served_commit_sha") is None)


def test_allineamento_e_una_CONGIUNZIONE_ricevuta_E_produzione() -> None:
    main = "a" * 40
    check("ricevuta pari a main ma produzione indietro: NON allineato",
          ps.allineamento_produzione(main, "b" * 40, main), False)
    check("entrambe pari a main: allineato",
          ps.allineamento_produzione(main, main, main), True)
    check("produzione non misurata: ne' vero ne' falso",
          ps.allineamento_produzione(main, None, main), None)
    check("ricevuta indietro, produzione pari: NON allineato",
          ps.allineamento_produzione("c" * 40, main, main), False)


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
        test_deploy_ricevuta_storica_e_allineamento_ricalcolato,
        test_deploy_i_due_finding_avversariali_del_2026_07_30,
        test_sha_servita_e_ancorata_al_marcatore_di_provenienza,
        test_un_esadecimale_qualunque_non_e_una_sha_servita,
        test_sha_lontana_dal_marcatore_non_viene_raccolta,
        test_produzione_irraggiungibile_e_UNAVAILABLE_non_falso_verde,
        test_produzione_raggiungibile_dichiara_la_sha_e_la_sua_fonte,
        test_pagina_servita_senza_marcatore_non_e_un_verde,
        test_allineamento_e_una_CONGIUNZIONE_ricevuta_E_produzione,
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
