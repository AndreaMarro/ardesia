#!/usr/bin/env python3
"""Test dell'unita' F0-1: stato corrente generato a macchina.

Convenzione del repo: eseguibile diretto, exit 0 = verde, exit 1 = rosso.
Testa le funzioni PURE del generatore. La raccolta da git/gh e' I/O e viene
verificata da `project_state.py --verify`, non qui.
"""
from __future__ import annotations

import json
import os
import re
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


def _marcato(sha: str) -> str:
    return "var ye=`" + ps.MARCATORE_BUILD + "`;return`" + sha + "`"


def test_produzione_irraggiungibile_e_UNAVAILABLE_non_falso_verde() -> None:
    def fetch_rotto(_url: str):
        raise OSError("getaddrinfo failed")

    got = ps.collect_served("https://esempio.invalid", fetch_rotto)
    check("status", got["status"], "UNAVAILABLE")
    check_true("motivo scritto", bool(got.get("reason")))
    check_true("nessuna sha inventata", got.get("served_commit_sha") is None)


def test_produzione_raggiungibile_dichiara_la_sha_e_la_sua_fonte() -> None:
    pagina = '<script type="module" src="/assets/index-nzwOe0RD.js"></script>'

    def fetch(url: str):
        return (_marcato("e" * 40), url) if url.endswith(".js") else (pagina, url)

    got = ps.collect_served("https://ardesia-lavagna.vercel.app", fetch)
    check("status", got["status"], "MEASURED")
    check("sha", got["served_commit_sha"], "e" * 40)
    check_true("dichiara da quale asset", "index-nzwOe0RD.js" in str(got.get("source")))


def test_pagina_servita_senza_marcatore_non_e_un_verde() -> None:
    """Un 200 non e' una misura: la pagina puo' essere un vecchio build."""
    def fetch(url: str):
        return ("var a=1", url) if url.endswith(".js") else ("<script src=/assets/v.js></script>", url)

    got = ps.collect_served("https://ardesia-lavagna.vercel.app", fetch)
    check("status", got["status"], "UNAVAILABLE")
    check_true("nessuna sha inventata", got.get("served_commit_sha") is None)


# --- riparazione della revisione avversariale su #233 -------------------
# LENTE A, quattro finding CONFERMATI e riprodotti dal revisore. Tutti e
# quattro erano la stessa forma: la misura pubblica un valore che SEMBRA la
# risposta giusta e non permette al chiamante di accorgersi che il referente
# era un altro.


def test_A1_asset_divergenti_non_pubblicano() -> None:
    """Fermarsi al PRIMO asset marcato rende la divergenza invisibile.

    `estrai_sha_servita` gia' rifiutava due marcatori discordi nello STESSO
    file; fra file diversi no, e l'esito dipendeva dall'ordine nell'HTML.
    """
    pagina = '<script src="/assets/a.js"></script><script src="/assets/b.js"></script>'

    def fetch(url: str):
        if url.endswith("a.js"):
            return (_marcato("a" * 40), url)
        if url.endswith("b.js"):
            return (_marcato("b" * 40), url)
        return (pagina, url)

    got = ps.collect_served("https://x.test", fetch)
    check("divergenza fra asset: non si pubblica", got["status"], "UNAVAILABLE")
    check_true("nessuna sha scelta a caso", got.get("served_commit_sha") is None)
    check_true(f"il motivo nomina entrambe (ottenuto {str(got.get('reason'))[:80]!r})",
               "a" * 40 in str(got.get("reason")) and "b" * 40 in str(got.get("reason")))


def test_A2_asset_su_un_altro_host_viene_letto_DOVE_STA() -> None:
    """Ricostruire `base + /assets/...` misura un file diverso da quello eseguito."""
    pagina = '<script src="https://cdn.test/assets/app.js"></script>'
    letti: list[str] = []

    def fetch(url: str):
        letti.append(url)
        return (_marcato("c" * 40), url) if url.endswith(".js") else (pagina, url)

    got = ps.collect_served("https://ardesia-lavagna.vercel.app", fetch)
    check("sha", got.get("served_commit_sha"), "c" * 40)
    check_true(f"letto sul CDN, non same-origin (letti: {letti})",
               "https://cdn.test/assets/app.js" in letti)
    check_true("source nomina il vero referente",
               "cdn.test" in str(got.get("source")))


def test_A5_source_dichiara_URL_FINALE_dopo_i_redirect() -> None:
    """`urlopen` segue i 302 in silenzio: `source` deve dire dove ha letto."""
    pagina = '<script src="/assets/app.js"></script>'

    def fetch(url: str):
        if url.endswith(".js"):
            return (_marcato("d" * 40), "https://altro.test/assets/app.js")
        return (pagina, url)

    got = ps.collect_served("https://x.test", fetch)
    check("sha", got.get("served_commit_sha"), "d" * 40)
    check("source e' l'URL finale", got.get("source"), "https://altro.test/assets/app.js")


def test_A6_prod_scarto_non_si_misura_su_un_ref_STANTIO() -> None:
    """Il falso verde piu' grave della tornata, riprodotto dal revisore.

    `collect_deploy` rifiuta esplicitamente il confronto quando
    `refs/remotes/origin/main` e' vecchio, perche' un ref di tracking senza
    fetch recente descrive il remoto di quando lo si e' guardato. I derivati
    nuovi usavano lo stesso ref SENZA quel cancello: con `origin/main` fermo
    due ore indietro pubblicavano `commits: 0` e `allineato: True`.
    """
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        env = ["-c", "user.email=a@b", "-c", "user.name=a"]
        subprocess.run(["git", "init", "-q"], cwd=root, capture_output=True)
        subprocess.run(["git", *env, "commit", "-q", "--allow-empty", "-m", "B"],
                       cwd=root, capture_output=True)
        b = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                           capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "update-ref", "refs/remotes/origin/main", b],
                       cwd=root, capture_output=True)
        subprocess.run(["git", *env, "commit", "-q", "--allow-empty", "-m", "A"],
                       cwd=root, capture_output=True)

        fresco = ps.misura_prod_scarto(root, b)
        check("precondizione: con ref fresco la misura ESISTE", fresco["status"], "MEASURED")

        vecchio = time.time() - 7200
        for rel in ("refs/remotes/origin/main", "FETCH_HEAD", "packed-refs"):
            f = root / ".git" / rel
            if f.exists():
                os.utime(f, (vecchio, vecchio))

        stantio = ps.misura_prod_scarto(root, b)
        check("ref stantio: NON si dichiara uno scarto", stantio["status"], "UNAVAILABLE")
        check_true(f"motivo dichiarato (ottenuto {str(stantio.get('reason'))[:70]!r})",
                   "non aggiornato da" in str(stantio.get("reason")))
        sha_usabile, motivo = ps.main_sha_utilizzabile(root)
        check_true("main non utilizzabile su ref stantio", sha_usabile is None)
        check_true("con un motivo", bool(motivo))


def test_allineamento_parla_SOLO_della_produzione() -> None:
    """Era una congiunzione con la ricevuta. La revisione l'ha smontata.

    Con `receipt=C, served=A, main=A` la congiunzione restituiva `False` e
    `CURRENT.md` stampava «pari a main in produzione: NO» mentre la produzione
    era pari a `main`: il nome del campo afferma qualcosa sulla produzione e il
    valore parlava della ricevuta. Il falso verde che la congiunzione doveva
    uccidere resta ucciso da `served == main`. La ricevuta e' un fatto
    separato e resta stampata come tale.
    """
    main = "a" * 40
    check("produzione pari a main: allineato, anche con ricevuta vecchia",
          ps.allineamento_produzione(main, main), True)
    check("produzione indietro: NON allineato",
          ps.allineamento_produzione("b" * 40, main), False)
    check("produzione non misurata: ne' vero ne' falso",
          ps.allineamento_produzione(None, main), None)
    check("main non utilizzabile: ne' vero ne' falso",
          ps.allineamento_produzione(main, None), None)


def test_B2_marcatore_discorde_non_viene_chiamato_marcatore_ASSENTE() -> None:
    """Stato giusto, causa sbagliata: nasconde il difetto vero."""
    pagina = '<script src="/assets/app.js"></script>'
    doppio = _marcato("a" * 40) + ";" + _marcato("b" * 40)

    def fetch(url: str):
        return (doppio, url) if url.endswith(".js") else (pagina, url)

    got = ps.collect_served("https://x.test", fetch)
    check("status", got["status"], "UNAVAILABLE")
    motivo = str(got.get("reason"))
    check_true(f"non incolpa l'assenza del marcatore (ottenuto {motivo[:70]!r})",
               "nessun `" not in motivo)
    check_true("nomina entrambe le SHA", "a" * 40 in motivo and "b" * 40 in motivo)


def test_B3_produzione_AVANTI_rispetto_a_main_non_e_scarto_zero() -> None:
    """`served..main` conta zero anche quando la produzione e' avanti.

    Due situazioni diverse — pari a `main`, e in servizio un commit mai fuso —
    producevano lo stesso `prod_scarto: 0`, cioe' lo stesso verde.
    """
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        env = ["-c", "user.email=a@b", "-c", "user.name=a"]
        subprocess.run(["git", "init", "-q"], cwd=root, capture_output=True)
        subprocess.run(["git", *env, "commit", "-q", "--allow-empty", "-m", "M"],
                       cwd=root, capture_output=True)
        m = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                           capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "update-ref", "refs/remotes/origin/main", m],
                       cwd=root, capture_output=True)
        subprocess.run(["git", *env, "commit", "-q", "--allow-empty", "-m", "avanti"],
                       cwd=root, capture_output=True)
        avanti = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                                capture_output=True, text=True).stdout.strip()

        pari = ps.misura_prod_scarto(root, m)
        check("precondizione: pari a main -> 0 indietro", pari["commits"], 0)
        check_true("e nessun `commits_avanti`", pari.get("commits_avanti") is None)

        got = ps.misura_prod_scarto(root, avanti)
        check("indietro resta 0", got["commits"], 0)
        check("ma l'avanti e' dichiarato", got.get("commits_avanti"), 1)
        check_true("con il motivo", "non sono su `main`" in str(got.get("reason")))
        check("e NON e' allineata", ps.allineamento_produzione(avanti, m), False)


def test_B6_la_misura_viva_sopravvive_all_assenza_della_ricevuta() -> None:
    """`_section_lines` cancellava il corpo intero a sezione UNAVAILABLE.

    Ricevuta e produzione sono due evidenze indipendenti: `docs/ops/deploys`
    vuota nascondeva una misura che era stata fatta davvero.
    """
    stato = ps.empty_state()
    stato["deploy"] = {
        "status": "UNAVAILABLE", "reason": "docs/ops/deploys assente",
        "served": {"status": "MEASURED", "served_commit_sha": "f" * 40,
                   "source": "https://x.test/assets/app.js"},
        "prod_scarto": {"status": "MEASURED", "commits": 0},
        "allineato_in_produzione": True,
    }
    md = ps.render_current_md_untruncated(stato)
    check_true("dichiara comunque la SHA servita", "f" * 40 in md)
    check_true("e l'allineamento in produzione", "pari a `main` in produzione: sì" in md)
    check_true("senza perdere il motivo della ricevuta assente", "docs/ops/deploys assente" in md)


def test_B7_svuotare_la_feature_deve_far_diventare_ROSSO() -> None:
    """Il verde e' guadagnato o comprato?

    La suite non toccava ne' il cablaggio in `build_state` ne' la resa umana:
    rimuovere i tre campi dallo stato, o le tre righe dal renderer, lasciava
    tutto verde mentre `project.json` e `CURRENT.md` perdevano la misura.
    """
    stato = ps.empty_state()
    stato["deploy"] = {
        "status": "MEASURED", "commit_sha": "a" * 40, "source": "x", "receipts_count": 1,
        "matches_main": True,
        "served": {"status": "MEASURED", "served_commit_sha": "a" * 40, "source": "u"},
        "prod_scarto": {"status": "MEASURED", "commits": 0},
        "allineato_in_produzione": True,
    }
    md = ps.render_current_md_untruncated(stato)
    for atteso in ("servito ADESSO dalla produzione", "`prod_scarto`",
                   "pari a `main` in produzione"):
        check_true(f"il renderer stampa {atteso!r}", atteso in md)

    # Il cablaggio: `build_state` deve produrre i tre campi, non solo le
    # funzioni saperli calcolare.
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        subprocess.run(["git", "init", "-q"], cwd=root, capture_output=True)
        s = ps.build_state(root, offline=True)
        for campo in ("served", "prod_scarto", "allineato_in_produzione"):
            check_true(f"build_state cabla `{campo}`", campo in s["deploy"])


#: Le sole funzioni autorizzate a leggere `origin/main` da git.
#: - `collect_repo` lo ESPONE e basta, non ne deriva alcun giudizio;
#: - `main_sha_utilizzabile` E' il cancello di freschezza.
#: Chiunque altro deve passare dal cancello. Se aggiungi una funzione qui,
#: scrivi perche' il confronto che fa non ha bisogno della freschezza.
PORTE_AUTORIZZATE_SU_ORIGIN_MAIN = {"collect_repo", "main_sha_utilizzabile"}


def test_flywheel_una_sola_porta_su_origin_main() -> None:
    """Il controllo meccanico nato dal finding A6/B4, nello stesso ciclo.

    A6 non era «una funzione sbagliata»: era una REGOLA gia' presente nel file
    e riscritta a mano altrove, quindi il derivato nuovo poteva ometterla senza
    che nulla protestasse. Riparare la funzione non impedisce alla prossima di
    rifarlo; questo assert si'.
    """
    sorgente = (Path(ps.__file__).read_text(encoding="utf-8"))
    corpi = re.split(r"^def ", sorgente, flags=re.MULTILINE)
    colpevoli = set()
    for corpo in corpi[1:]:
        nome = corpo.split("(", 1)[0].strip()
        if '"rev-parse", "origin/main"' in corpo:
            colpevoli.add(nome)
    check("le porte su origin/main sono solo quelle autorizzate",
          colpevoli, PORTE_AUTORIZZATE_SU_ORIGIN_MAIN)

    # Precondizione: se il pattern cercato non esistesse piu', l'assert sopra
    # sarebbe verde per assenza di materia — la sonda cieca di questo registro.
    check_true("precondizione: il pattern esiste davvero nel sorgente",
               len(colpevoli) > 0)


# --- terza fonte: il `Production` DERIVATO da GitHub --------------------
# Misurato il 2026-08-03: la ricevuta piu' recente era `3e170f83` del 31 luglio
# mentre GitHub dava `Production` = `751bcb30` dal 2 agosto, e nulla nello stato
# generato poteva dirlo — la ricevuta e' tenuta a mano e il probe vivo cadeva
# per certificato. Il referente derivato esiste e va usato.

def _stato_deploy(ricevuta: str, gh: dict) -> dict:
    stato = ps.empty_state()
    stato["deploy"] = {
        "status": "MEASURED", "source": "docs/ops/deploys/x.json",
        "commit_sha": ricevuta, "deployed_at": "2026-07-31T01:30:00Z",
        "alias": "https://esempio", "receipts_count": 6, "matches_main": None,
        "served": {"status": "UNAVAILABLE", "reason": "irraggiungibile",
                   "served_commit_sha": None},
        "github_production": gh,
    }
    return stato


def test_ricevuta_indietro_rispetto_a_github_viene_DETTO() -> None:
    """Il punto della terza fonte e' poter contraddire le altre due."""
    gh = {"status": "MEASURED", "sha": "751bcb30", "sha_full": "751bcb305e78",
          "created_at": "2026-08-02T18:27:27Z", "creator": "vercel[bot]"}
    testo = ps.render_current_md(_stato_deploy("3e170f838353", gh))
    check_true("dichiara il Production derivato", "751bcb30" in testo)
    check_true("dichiara la divergenza", "NON descrive quel deploy" in testo)
    check_true("nomina la causa: elenco tenuto a mano", "tenuta a mano" in testo)

    # CONTROLLO nello stesso test: se le due fonti concordano, l'allarme NON
    # deve comparire. Senza questa meta', l'assert sopra sarebbe soddisfatto
    # anche da una riga stampata sempre, che non misurerebbe niente.
    gh_uguale = dict(gh, sha="3e170f83", sha_full="3e170f838353")
    concorde = ps.render_current_md(_stato_deploy("3e170f838353", gh_uguale))
    check_true("nessun allarme quando concordano", "NON descrive quel deploy" not in concorde)


def test_github_production_non_misurato_non_diventa_un_verde() -> None:
    gh = {"status": "UNAVAILABLE", "reason": "`gh api deployments` exit 4"}
    testo = ps.render_current_md(_stato_deploy("3e170f838353", gh))
    check_true("dichiara il non misurato", "non misurato" in testo)
    check_true("riporta il motivo", "exit 4" in testo)
    check_true("non inventa una divergenza", "NON descrive quel deploy" not in testo)


def test_nessun_production_mai_registrato_non_e_un_errore() -> None:
    """«Non ne esiste nessuno» e «non sono riuscito a chiedere» sono diversi."""
    gh = {"status": "MEASURED", "sha": None, "sha_full": None,
          "created_at": None, "creator": None}
    testo = ps.render_current_md(_stato_deploy("3e170f838353", gh))
    check_true("lo dice con il suo nome", "nessun deploy `Production` mai registrato" in testo)
    check_true("non lo confonde con un fallimento", "non misurato —" not in testo.split("servito ADESSO")[0])
    check_true("non inventa una divergenza", "NON descrive quel deploy" not in testo)


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
        test_allineamento_parla_SOLO_della_produzione,
        test_A1_asset_divergenti_non_pubblicano,
        test_A2_asset_su_un_altro_host_viene_letto_DOVE_STA,
        test_A5_source_dichiara_URL_FINALE_dopo_i_redirect,
        test_A6_prod_scarto_non_si_misura_su_un_ref_STANTIO,
        test_B2_marcatore_discorde_non_viene_chiamato_marcatore_ASSENTE,
        test_B3_produzione_AVANTI_rispetto_a_main_non_e_scarto_zero,
        test_B6_la_misura_viva_sopravvive_all_assenza_della_ricevuta,
        test_B7_svuotare_la_feature_deve_far_diventare_ROSSO,
        test_flywheel_una_sola_porta_su_origin_main,
        test_ricevuta_indietro_rispetto_a_github_viene_DETTO,
        test_github_production_non_misurato_non_diventa_un_verde,
        test_nessun_production_mai_registrato_non_e_un_errore,
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
