#!/usr/bin/env python3
"""Stato corrente del progetto, GENERATO a macchina. Unita' F0-1.

Perche' esiste
--------------
Due difetti misurati il 2026-07-30, e un file solo li chiude entrambi:

1. Le letture sono il 76,1% del consumo di token di un ciclo del loop: ogni
   ciclo riscopre da zero SHA, PR, check richiesti e conteggi.
2. La SoT dichiarata canonica fotografa una topologia che non esiste piu'.

Perche' NON e' committato
-------------------------
Un file di stato committato diventa, entro pochi giorni, esattamente il
documento stale che questa unita' esiste per rimuovere. `artifacts/` e'
gitignorato: il file non puo' invecchiare perche' non esiste finche' non lo
rigeneri. La freschezza e' garantita dalla costruzione, non dalla disciplina.

Contratto di ogni campo
-----------------------
Ogni sezione porta `status` (`MEASURED` | `UNAVAILABLE`) e `source` (il comando
o il file che l'ha prodotta). Un campo non misurabile dice perche', e non viene
omesso: un buco dichiarato e' verificabile, un buco silenzioso no.

Uso
---
    python3 bin/state/project_state.py              # genera i due file
    python3 bin/state/project_state.py --self-test  # test delle funzioni pure
    python3 bin/state/project_state.py --verify     # asserzione per la CI
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = 1
GENERATOR = "bin/state/project_state.py"
CATALOG_PATH = "apps/studio/src/toolhost/elabExperimentCatalog.ts"
JSON_OUT = "artifacts/state/project.json"
MD_OUT = "docs/ops/CURRENT.md"
MD_MAX_LINES = 250

# Quante PR elencare per nome in CURRENT.md. Il resto e' un conteggio: il file
# ha un tetto di righe e un elenco senza tetto lo sfonderebbe in silenzio.
MD_PR_LIMIT = 40


# --------------------------------------------------------------------------
# funzioni pure (testate da --self-test e da test_project_state.py)
# --------------------------------------------------------------------------

def classify_pull_requests(prs: list[dict]) -> dict:
    """Partiziona le PR aperte in quattro classi disgiunte.

    `mergeStateStatus` NON entra nella classificazione, e la ragione e' una
    misura: il 2026-07-30, 21 PR su 34 riportavano `CLEAN` contro una base
    MORTA, fino a 104 commit dietro `main`. Con
    `delete_branch_on_merge=false` GitHub non ripunta e non marca stale, quindi
    `CLEAN` significa «pulita rispetto a una base morta», non «pronta».

    Classi, valutate in quest'ordine (la prima che scatta vince, cosi' la
    partizione resta disgiunta):

    - `superseded`  : esiste una PR aperta con lo STESSO titolo e numero maggiore
    - `stacked`     : base != main, e la base e' il ramo head di un'altra PR aperta
    - `orphan_base` : base != main, e nessuna PR aperta possiede quel ramo
    - `current`     : base == main e nessun omonimo piu' recente
    """
    open_heads = {p.get("headRefName") for p in prs}
    latest_by_title: dict[str, int] = {}
    for p in prs:
        t = p.get("title", "")
        n = int(p["number"])
        if t not in latest_by_title or n > latest_by_title[t]:
            latest_by_title[t] = n

    out: dict[str, list[int]] = {
        "current": [], "superseded": [], "stacked": [], "orphan_base": [],
    }
    detail: dict[str, dict] = {}
    for p in prs:
        n = int(p["number"])
        base = p.get("baseRefName", "")
        title = p.get("title", "")
        if latest_by_title.get(title, n) > n:
            cls = "superseded"
        elif base != "main":
            cls = "stacked" if base in open_heads else "orphan_base"
        else:
            cls = "current"
        out[cls].append(n)
        detail[str(n)] = {
            "title": title,
            "base": base,
            "class": cls,
            "draft": bool(p.get("isDraft", False)),
            "mergeStateStatus": p.get("mergeStateStatus", ""),
        }

    return {
        "open_count": len(prs),
        "detail": detail,
        **out,
    }


CATALOG_ARRAY = "ELAB_EXPERIMENT_CATALOG"


def parse_catalog(source: str) -> dict:
    """Conta gli esperimenti per `sceneStatus` dal catalogo TypeScript.

    Due difetti gia' pagati, entrambi entro questa funzione:

    1. La prima versione contava **5** candidati dove ce ne sono **4**: la
       quinta occorrenza era la riga di DICHIARAZIONE DI TIPO
       `sceneStatus: "candidate" | "verified"` dentro l'interfaccia. Una regex
       lessicale su un sorgente strutturato conta cio' che assomiglia al dato.
       Correzione: si guarda solo il testo DOPO la dichiarazione dell'array, e
       si scartano le occorrenze seguite da `|` (unioni di tipo).
    2. Il vocabolario dichiarato dal tipo e' `candidate | verified`: la parola
       «certified» dei documenti **non esiste nel codice**. Il campo
       `certified` resta a 0 ma porta con se' il vocabolario reale, cosi' il
       disallineamento e' leggibile invece che nascosto.

    Se il denominatore non e' nel sorgente, lo stato e' UNAVAILABLE e `total`
    resta None: un conteggio inventato e' peggiore di una lacuna dichiarata.
    """
    m = re.search(r"ELAB_CORPUS_TOTAL\s*=\s*(\d+)", source)

    # vocabolario dichiarato dal tipo, prima di tagliare l'intestazione
    vocab: list[str] = []
    decl = re.search(r"sceneStatus:\s*((?:[\"'][a-zA-Z_-]+[\"']\s*\|\s*)+[\"'][a-zA-Z_-]+[\"'])", source)
    if decl:
        vocab = re.findall(r"[\"']([a-zA-Z_-]+)[\"']", decl.group(1))

    # solo il corpo dell'array: l'interfaccia sopra non contiene esperimenti
    idx = source.find(CATALOG_ARRAY)
    body = source[idx:] if idx != -1 else source

    by_status: dict[str, int] = {}
    # `(?!\s*\|)` scarta le unioni di tipo che sopravvivessero al taglio
    for st in re.findall(r"sceneStatus:\s*[\"']([a-zA-Z_-]+)[\"'](?!\s*\|)", body):
        by_status[st] = by_status.get(st, 0) + 1

    entries = len(re.findall(r"experimentId:\s*[\"']", body))
    counted = sum(by_status.values())

    base = {
        "by_scene_status": by_status,
        "entries": entries,
        "declared_vocabulary": vocab,
        "certified": by_status.get("certified", 0),
        "source": CATALOG_PATH,
    }
    if counted != entries:
        # falsificatore: se le due letture indipendenti divergono, il parser sta
        # contando la cosa sbagliata e non deve pubblicare un numero.
        return {
            **base,
            "status": "UNAVAILABLE",
            "reason": (f"{entries} experimentId ma {counted} sceneStatus in "
                       f"{CATALOG_PATH}: il parser non sta contando le stesse entita'"),
            "total": None,
        }
    if m is None:
        return {
            **base,
            "status": "UNAVAILABLE",
            "reason": f"ELAB_CORPUS_TOTAL non trovato in {CATALOG_PATH}",
            "total": None,
        }
    return {**base, "status": "MEASURED", "total": int(m.group(1))}


def empty_state() -> dict:
    """Scheletro con ogni sezione a UNAVAILABLE. Il default e' «non misurato»."""
    unknown = {"status": "UNAVAILABLE", "reason": "non raccolto"}
    return {
        "schema": SCHEMA,
        "generator": GENERATOR,
        "generated_at": None,
        "repo": dict(unknown),
        "pull_requests": dict(unknown),
        "required_checks": dict(unknown),
        "deploy": dict(unknown),
        "certification": dict(unknown),
        "e2e": dict(unknown),
    }


def _section_lines(title: str, sec: dict, body) -> list[str]:
    lines = [f"## {title}", ""]
    if sec.get("status") != "MEASURED":
        lines.append(f"**{sec.get('status', 'UNAVAILABLE')}** — {sec.get('reason', 'motivo non registrato')}")
        lines.append("")
        return lines
    lines.extend(body(sec))
    lines.append("")
    lines.append(f"<sub>fonte: `{sec.get('source', 'non registrata')}`</sub>")
    lines.append("")
    return lines


def render_current_md(state: dict) -> str:
    """Vista umana, con un tetto duro di righe.

    Il tetto e' applicato troncando, non sperando: una sezione che itera una
    collezione senza limite sfonderebbe le 250 righe in silenzio quando il
    backlog cresce. Il taglio e' separato dalla resa (`render_current_md_
    untruncated`) proprio perche' un test possa stabilire la precondizione —
    «questo stato sfonderebbe» — invece di darla per scontata.
    """
    out = render_current_md_untruncated(state).splitlines()
    if len(out) > MD_MAX_LINES:
        out = out[: MD_MAX_LINES - 3] + [
            "",
            f"<sub>troncato a {MD_MAX_LINES} righe; il resto e' in `{JSON_OUT}`</sub>",
            "",
        ]
    return "\n".join(out) + "\n"


def render_current_md_untruncated(state: dict) -> str:
    """La resa completa, senza tetto. Usata dal tetto e dal suo test."""
    gen = state.get("generated_at") or "(non generato)"
    out: list[str] = [
        "# ARDESIA — stato corrente",
        "",
        f"> **GENERATO** da `{GENERATOR}` il {gen}.",
        "> Non modificarlo a mano: la prossima esecuzione lo sovrascrive.",
        f"> La forma leggibile a macchina e' `{JSON_OUT}` (non committato).",
        "",
        "Questo file e' l'unica dichiarazione di stato corrente del repo. Ogni",
        "altro documento in `docs/ops/` e' un **registro storico**: descrive",
        "l'istante in cui e' stato scritto, non l'istante in cui lo leggi.",
        "",
    ]

    def repo_body(s: dict) -> list[str]:
        righe = [
            f"- `main` (origin): **{s.get('origin_main_sha') or 'non misurato'}**",
            f"- HEAD locale: `{s.get('head_sha', '?')}` sul ramo `{s.get('head_branch') or 'non misurato'}`",
            f"- file non committati nel checkout: {s.get('dirty_count') if s.get('dirty_count') is not None else 'non misurato'}",
        ]
        for campo, motivo in sorted(s.get("unmeasured", {}).items()):
            righe.append(f"- ⚠️ `{campo}` **non misurato**: {motivo}")
        return righe

    def pr_body(s: dict) -> list[str]:
        b = [
            f"- aperte: **{s.get('open_count', '?')}**",
            f"- `current` (base `main`, nessun omonimo piu' recente): **{len(s.get('current', []))}**",
            f"- `superseded` (esiste un omonimo con numero maggiore): {len(s.get('superseded', []))}",
            f"- `stacked` (base = ramo di un'altra PR aperta): {len(s.get('stacked', []))}",
            f"- `orphan_base` (base non e' `main` e nessuna PR la possiede): {len(s.get('orphan_base', []))}",
            "",
            "`mergeStateStatus` non entra in questa classificazione: `CLEAN`",
            "contro una base morta non e' «pronta».",
            "",
            "| PR | classe | base | titolo |",
            "|---:|---|---|---|",
        ]
        detail = s.get("detail", {})
        numeri = sorted((int(k) for k in detail), reverse=True)
        for n in numeri[:MD_PR_LIMIT]:
            d = detail[str(n)]
            titolo = d.get("title", "")[:60]
            b.append(f"| {n} | {d.get('class', '?')} | `{d.get('base', '?')}` | {titolo} |")
        if len(numeri) > MD_PR_LIMIT:
            b.append(f"| … | | | altre {len(numeri) - MD_PR_LIMIT} in `{JSON_OUT}` |")
        return b

    def checks_body(s: dict) -> list[str]:
        ctx = s.get("contexts", [])
        return [f"- richiesti su `main`: {', '.join(f'`{c}`' for c in ctx) or '(nessuno)'}",
                f"- strict: {s.get('strict', '?')}"]

    def deploy_body(s: dict) -> list[str]:
        # I nomi dei campi sono quelli della RICEVUTA (`commit_sha`,
        # `deployed_at`). La prima versione leggeva `sha` e `at`: avevo cambiato
        # il collector e dimenticato il renderer, e `CURRENT.md` stampava
        # letteralmente «ultimo deploy: ? il ?» mentre il JSON era corretto.
        # Una vista umana che perde il dato e' peggio di una vista assente,
        # perche' sembra averlo guardato.
        allineato = s.get("matches_main")
        etichetta = {True: "sì", False: "**NO**", None: "non misurato"}.get(allineato, str(allineato))
        return [
            f"- ultimo deploy: `{s.get('commit_sha') or 'non registrato'}`",
            f"- quando: {s.get('deployed_at') or 'non registrato'}",
            f"- dove: {s.get('alias') or s.get('deployment_url') or 'non registrato'}",
            f"- **pari a `main`: {etichetta}**",
            f"- ricevute totali: {s.get('receipts_count', '?')}",
        ]

    def cert_body(s: dict) -> list[str]:
        tot = s.get("total")
        by = s.get("by_scene_status", {})
        righe = [f"- corpus: **{tot}** lesson path"]
        for k in sorted(by):
            righe.append(f"- `{k}`: {by[k]}/{tot}")
        righe.append(f"- **certificati: {s.get('certified', 0)}/{tot}**")
        return righe

    def e2e_body(s: dict) -> list[str]:
        return [f"- spec Playwright presenti: {s.get('spec_count', '?')}",
                f"- eseguite in CI: {s.get('in_ci', '?')}",
                f"- golden path (`{s.get('golden_path', '?')}`) esiste: {s.get('golden_path_exists', '?')}"]

    out += _section_lines("Repo", state["repo"], repo_body)
    out += _section_lines("Pull request aperte", state["pull_requests"], pr_body)
    out += _section_lines("Check richiesti", state["required_checks"], checks_body)
    out += _section_lines("Deploy", state["deploy"], deploy_body)
    out += _section_lines("Certificazione esperimenti", state["certification"], cert_body)
    out += _section_lines("Oracolo di prodotto (E2E)", state["e2e"], e2e_body)
    return "\n".join(out) + "\n"


# --------------------------------------------------------------------------
# raccolta (I/O). Ogni fallimento diventa UNAVAILABLE con il motivo.
# --------------------------------------------------------------------------

def _run(cmd: list[str], cwd: Path, timeout: int = 60) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except FileNotFoundError:
        return 127, f"comando assente: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, f"timeout dopo {timeout}s: {' '.join(cmd)}"


def repo_root() -> Path:
    rc, out = _run(["git", "rev-parse", "--show-toplevel"], Path.cwd())
    if rc != 0:
        print("non sono in un repo git", file=sys.stderr)
        raise SystemExit(2)
    return Path(out.strip())


def collect_repo(root: Path) -> dict:
    """Stato git, con i campi non misurati DICHIARATI uno per uno.

    Finding 3 della revisione avversariale del 2026-07-30, verificato su un
    repo temporaneo senza remote: la sezione usciva `MEASURED` con
    `origin_main_sha: null` e nessun motivo. Una sezione puo' essere misurata
    in parte — ma allora dice quale parte manca e perche', altrimenti viola
    esattamente il contratto che questa unita' esiste per imporre.
    """
    rc_h, head = _run(["git", "rev-parse", "HEAD"], root)
    if rc_h != 0:
        return {"status": "UNAVAILABLE", "reason": f"git rev-parse HEAD exit {rc_h}"}

    unmeasured: dict[str, str] = {}
    rc_b, branch = _run(["git", "rev-parse", "--abbrev-ref", "HEAD"], root)
    if rc_b != 0:
        unmeasured["head_branch"] = f"git rev-parse --abbrev-ref HEAD exit {rc_b}"
    rc_m, main = _run(["git", "rev-parse", "origin/main"], root)
    if rc_m != 0:
        unmeasured["origin_main_sha"] = (
            f"git rev-parse origin/main exit {rc_m}: il ref non esiste in questo "
            f"checkout (remote assente o fetch mai eseguito)")
    rc_s, status = _run(["git", "status", "--porcelain"], root)
    if rc_s != 0:
        unmeasured["dirty_count"] = f"git status --porcelain exit {rc_s}"

    return {
        "status": "MEASURED",
        "source": "git rev-parse HEAD | origin/main; git status --porcelain",
        "head_sha": head.strip()[:8],
        "head_sha_full": head.strip(),
        "head_branch": branch.strip() if rc_b == 0 else None,
        "origin_main_sha": main.strip()[:8] if rc_m == 0 else None,
        "dirty_count": len([x for x in status.splitlines() if x.strip()]) if rc_s == 0 else None,
        "unmeasured": unmeasured,
    }


def collect_pull_requests(root: Path) -> dict:
    cmd = ["gh", "pr", "list", "--state", "open", "--limit", "200", "--json",
           "number,title,baseRefName,headRefName,mergeStateStatus,isDraft"]
    rc, out = _run(cmd, root, timeout=120)
    if rc != 0:
        return {"status": "UNAVAILABLE",
                "reason": f"`gh pr list` exit {rc}: {out.strip()[:200]}",
                "source": " ".join(cmd)}
    try:
        prs = json.loads(out)
    except json.JSONDecodeError as exc:
        return {"status": "UNAVAILABLE", "reason": f"JSON illeggibile: {exc}",
                "source": " ".join(cmd)}
    res = classify_pull_requests(prs)
    res["status"] = "MEASURED"
    # `--limit 200` e' deliberato: senza limite `gh` tronca a 30 e il conteggio
    # risponde a «quante me ne mostri», non a «quante sono».
    res["source"] = " ".join(cmd)
    return res


def collect_required_checks(root: Path) -> dict:
    rc_r, repo = _run(["gh", "repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], root)
    if rc_r != 0:
        return {"status": "UNAVAILABLE", "reason": f"`gh repo view` exit {rc_r}"}
    slug = repo.strip()
    cmd = ["gh", "api", f"repos/{slug}/branches/main/protection"]
    rc, out = _run(cmd, root, timeout=60)
    if rc != 0:
        return {"status": "UNAVAILABLE", "reason": f"`gh api protection` exit {rc}",
                "source": " ".join(cmd)}
    try:
        data = json.loads(out)
        rsc = data.get("required_status_checks", {}) or {}
    except json.JSONDecodeError as exc:
        return {"status": "UNAVAILABLE", "reason": f"JSON illeggibile: {exc}"}
    return {"status": "MEASURED", "source": " ".join(cmd),
            "contexts": rsc.get("contexts", []), "strict": rsc.get("strict")}


def collect_certification(root: Path) -> dict:
    p = root / CATALOG_PATH
    if not p.exists():
        return {"status": "UNAVAILABLE", "reason": f"{CATALOG_PATH} assente"}
    return parse_catalog(p.read_text(encoding="utf-8"))


#: Un'INVOCAZIONE di Playwright, non la parola. `playwright test`, `npm run e2e`,
#: o una action ufficiale. Un commento non contiene nessuna di queste forme in
#: posizione di comando, perche' i commenti vengono tolti prima del confronto.
PLAYWRIGHT_INVOCATION_RE = re.compile(
    r"(?:npx\s+playwright\s+test"
    r"|playwright\s+test"
    r"|npm\s+run\s+e2e"
    r"|yarn\s+e2e"
    r"|pnpm\s+e2e"
    r"|uses:\s*microsoft/playwright)",
    re.I,
)


def _strip_yaml_comments(text: str) -> str:
    """Toglie i commenti `#` a inizio riga o dopo spazio.

    Approssimazione dichiarata: un `#` dentro una stringa quotata verrebbe
    trattato come commento. Per la domanda «questo workflow ESEGUE Playwright»
    l'errore va nella direzione sicura — al massimo perde un'invocazione
    esotica e riporta `false`, mai un `true` inventato.
    """
    out = []
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("#"):
            continue
        out.append(re.sub(r"\s+#.*$", "", line))
    return "\n".join(out)


def collect_e2e(root: Path) -> dict:
    """Misura l'oracolo di prodotto: spec scritte, spec eseguite, golden path.

    Due finding della revisione avversariale del 2026-07-30, verificati sul
    codice reale prima di essere accettati:

    - Finding 1: il glob `apps/*/e2e/**` mancava
      `apps/studio/eval/replay-kill-test.spec.ts`, che una SUA config Playwright
      include esplicitamente — 21 spec riportate su 22 reali. La scoperta ora
      segue le config e i file, non una convenzione di path.
    - Finding 2: `in_ci` era `"playwright" in testo`, quindi un workflow con il
      solo commento `# TODO: add playwright later` produceva `in_ci: true`. Un
      gate lessicale che scambia la PAROLA per l'ESECUZIONE e' un generatore di
      falso verde, e questa e' la classe di difetto che il loop paga di piu'.
      Ora si cerca un'invocazione, e si riporta la riga che l'ha provata.
    """
    # Estensioni al plurale, non `.spec.ts` soltanto: correggendo il finding 1
    # e' emerso che `plugins/elab-tutor` ha 79 spec `.spec.js` che il glob
    # precedente non vedeva. Stessa classe di difetto — una convenzione di path
    # ASSUNTA invece che misurata — con un errore dieci volte piu' grande.
    specs = sorted(
        str(p.relative_to(root))
        for ext in ("*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.mjs")
        for p in root.rglob(ext)
        if "node_modules" not in p.parts
    )
    configs = sorted(
        str(p.relative_to(root))
        for p in root.rglob("playwright.config.*")
        if "node_modules" not in p.parts
    )
    # Raggruppate per workspace: un totale unico confonde prodotti diversi, e
    # «22 dello studio» e «79 di elab-tutor» non sommano in niente di utile.
    by_workspace: dict[str, int] = {}
    for s in specs:
        parts = s.split("/")
        ws = "/".join(parts[:2]) if len(parts) > 2 else parts[0]
        by_workspace[ws] = by_workspace.get(ws, 0) + 1

    wf = root / ".github" / "workflows"
    evidence: list[str] = []
    if wf.is_dir():
        for f in sorted(list(wf.glob("*.yml")) + list(wf.glob("*.yaml"))):
            body = _strip_yaml_comments(f.read_text(encoding="utf-8", errors="replace"))
            for line in body.splitlines():
                if PLAYWRIGHT_INVOCATION_RE.search(line):
                    evidence.append(f"{f.relative_to(root)}: {line.strip()[:120]}")

    golden = "apps/studio/e2e/golden-path.spec.ts"
    return {
        "status": "MEASURED",
        "source": ("rglob *.spec.{ts,tsx,js,mjs} e playwright.config.* (escluso "
                   "node_modules); invocazione Playwright nei workflow, commenti rimossi"),
        "spec_count": len(specs),
        "spec_count_by_workspace": by_workspace,
        "specs": specs,
        "playwright_configs": configs,
        "in_ci": bool(evidence),
        "in_ci_evidence": evidence,
        "golden_path": golden,
        "golden_path_exists": (root / golden).exists(),
    }


DEPLOY_RECEIPTS = "docs/ops/deploys"

#: Oltre questa eta', il ref di tracking `origin/main` non e' una misura del
#: remoto: e' una fotografia di quando lo si e' guardato l'ultima volta.
FRESCHEZZA_REF_MAX_S = 600


def _eta_ref_origin_main(root: Path) -> float | None:
    """Secondi da quando `origin/main` e' stato aggiornato l'ultima volta.

    Guarda, in ordine: il ref sciolto, `FETCH_HEAD`, il `packed-refs`. `None`
    quando nessuno dei tre e' leggibile — e in quel caso l'allineamento NON va
    dichiarato, perche' non se ne conosce la freschezza.
    """
    basi: list[Path] = []
    rc_g, gitdir = _run(["git", "rev-parse", "--absolute-git-dir"], root)
    if rc_g == 0 and gitdir.strip():
        basi.append(Path(gitdir.strip()))
    rc_c, common = _run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"], root)
    if rc_c == 0 and common.strip():
        basi.append(Path(common.strip()))
    if not basi:
        return None

    # Due cose misurate sul repo reale, ed entrambe rendevano cieca la prima
    # versione di questa funzione:
    #
    # 1. In un worktree, `FETCH_HEAD` sta nel gitdir DEL WORKTREE
    #    (`.git/worktrees/<nome>/FETCH_HEAD`, 26 s dopo un fetch), mentre i ref
    #    remoti stanno nel repo comune. Guardare solo il comune leggeva un
    #    `FETCH_HEAD` di 38786 s e dichiarava stantio un fetch appena fatto.
    # 2. Il mtime di `refs/remotes/origin/main` cambia solo quando il ref SI
    #    MUOVE: se `main` non e' avanzato, resta vecchio anche dopo un fetch
    #    riuscito. Non e' una misura di freschezza del contatto col remoto.
    #
    # Quindi: si prende l'evidenza PIU' RECENTE di contatto col remoto fra
    # tutti i candidati, e `FETCH_HEAD` e' quello che conta davvero.
    candidati = [b / rel for b in basi
                 for rel in ("FETCH_HEAD", "refs/remotes/origin/main", "packed-refs")]
    eta: float | None = None
    for c in candidati:
        try:
            m = c.stat().st_mtime
        except OSError:
            continue
        e = max(0.0, time.time() - m)
        eta = e if eta is None else min(eta, e)
    return eta


def collect_deploy(root: Path) -> dict:
    """L'ultimo deploy, dalla sua ricevuta COMMITTATA.

    Perche' qui e non sotto `artifacts/`, che e' gitignorato: la prima versione
    cercava `artifacts/state/last-deploy.json`, e sarebbe stata una ricevuta che
    sparisce. La distinzione e' fra due cose diverse che sembrano una:

    - lo **stato corrente** e' derivato e non va committato, perche' un file non
      puo' contenere lo SHA del commit che lo contiene e invecchierebbe;
    - una **ricevuta di deploy** e' un fatto storico. Non invecchia: resta vera
      per sempre su quell'istante. Va committata, o non e' evidenza.

    `matches_main` e' ricalcolato a ogni lettura confrontando la SHA della
    ricevuta piu' recente con `origin/main`: e' quello il dato che dice se la
    produzione e' allineata, e va misurato adesso, non memorizzato allora.
    """
    d = root / DEPLOY_RECEIPTS
    if not d.is_dir():
        return {"status": "UNAVAILABLE",
                "reason": f"{DEPLOY_RECEIPTS}/ assente: nessun deploy mai registrato",
                "source": DEPLOY_RECEIPTS}
    ricevute = sorted(d.glob("*.json"))
    if not ricevute:
        return {"status": "UNAVAILABLE",
                "reason": f"{DEPLOY_RECEIPTS}/ e' vuota: nessun deploy mai registrato",
                "source": DEPLOY_RECEIPTS}
    ultima = ricevute[-1]
    try:
        data = json.loads(ultima.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return {"status": "UNAVAILABLE",
                "reason": f"ricevuta illeggibile ({ultima.name}): {exc}",
                "source": str(ultima.relative_to(root))}
    # JSON valido non significa forma valida: una radice `[]` passa da
    # `json.loads` e poi esplode su `.get`, portandosi via l'intera generazione
    # dello stato invece di degradare a UNAVAILABLE.
    if not isinstance(data, dict):
        return {"status": "UNAVAILABLE",
                "reason": (f"ricevuta con radice {type(data).__name__}, atteso un oggetto "
                           f"({ultima.name})"),
                "source": str(ultima.relative_to(root))}
    sha = str(data.get("commit_sha", "")).strip()
    if not sha:
        # Una ricevuta senza SHA non identifica alcun deploy. Prima usciva
        # MEASURED con `matches_main: false` e nessun motivo: falso, perche'
        # «non allineato» e «non so a cosa» sono cose diverse.
        return {**data, "status": "UNAVAILABLE",
                "reason": f"ricevuta senza `commit_sha` ({ultima.name}): non identifica alcun deploy",
                "source": str(ultima.relative_to(root)),
                "receipts_count": len(ricevute)}

    rc, main = _run(["git", "rev-parse", "origin/main"], root)
    motivo = None
    if rc != 0:
        allineato = None
        motivo = f"git rev-parse origin/main exit {rc}"
    else:
        # `origin/main` e' un ref LOCALE di tracking: senza un fetch recente
        # descrive il remoto di quando lo si e' guardato l'ultima volta, non
        # adesso. Il renderer scrive «pari a `main`», quindi un ref stantio
        # produrrebbe un `true` che risponde a un'altra domanda — la classe di
        # difetto piu' ricorrente di questo progetto.
        eta = _eta_ref_origin_main(root)
        if eta is None:
            allineato = None
            motivo = "eta' del ref `origin/main` non misurabile: allineamento non dichiarabile"
        elif eta > FRESCHEZZA_REF_MAX_S:
            allineato = None
            motivo = (f"ref locale `origin/main` non aggiornato da {int(eta // 60)} min "
                      f"(soglia {FRESCHEZZA_REF_MAX_S // 60} min): confronto non affidabile, "
                      f"esegui `git fetch origin`")
        else:
            allineato = sha == main.strip()
    # I metadati del COLLETTORE vanno DOPO lo spread, non prima.
    # Con `{**meta, **data}` una ricevuta poteva sovrascrivere `status`,
    # `source` e `receipts_count`, cioe' i campi che descrivono la MISURA e non
    # il fatto misurato: un file di dati poteva dichiarare com'era stato letto.
    # Il contenuto della ricevuta e' un'affermazione DEL DEPLOY; `status` e
    # `source` sono affermazioni DI QUESTO SCRIPT, e solo lui puo' farle.
    out = {
        **data,
        "status": "MEASURED",
        "source": str(ultima.relative_to(root)),
        "receipts_count": len(ricevute),
        "matches_main": allineato,
    }
    if motivo:
        out["unmeasured"] = {"matches_main": motivo}
    return out


def build_state(root: Path, offline: bool = False) -> dict:
    state = empty_state()
    state["generated_at"] = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    state["repo"] = collect_repo(root)
    state["certification"] = collect_certification(root)
    state["e2e"] = collect_e2e(root)
    state["deploy"] = collect_deploy(root)
    if offline:
        motivo = "--offline: nessuna chiamata di rete"
        state["pull_requests"] = {"status": "UNAVAILABLE", "reason": motivo}
        state["required_checks"] = {"status": "UNAVAILABLE", "reason": motivo}
    else:
        state["pull_requests"] = collect_pull_requests(root)
        state["required_checks"] = collect_required_checks(root)
    return state


def write_outputs(root: Path, state: dict) -> tuple[Path, Path]:
    jp = root / JSON_OUT
    jp.parent.mkdir(parents=True, exist_ok=True)
    jp.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    mp = root / MD_OUT
    mp.parent.mkdir(parents=True, exist_ok=True)
    mp.write_text(render_current_md(state), encoding="utf-8")
    return jp, mp


# --------------------------------------------------------------------------
# self-test: le funzioni pure, senza I/O
# --------------------------------------------------------------------------

def self_test() -> int:
    fails: list[str] = []

    def eq(label, got, want):
        if got != want:
            fails.append(f"{label}: atteso {want!r}, ottenuto {got!r}")

    prs = [
        {"number": 1, "title": "A", "baseRefName": "main", "headRefName": "h1",
         "mergeStateStatus": "CLEAN", "isDraft": False},
        {"number": 2, "title": "A", "baseRefName": "main", "headRefName": "h2",
         "mergeStateStatus": "CLEAN", "isDraft": False},
        {"number": 3, "title": "B", "baseRefName": "h2", "headRefName": "h3",
         "mergeStateStatus": "CLEAN", "isDraft": False},
        {"number": 4, "title": "C", "baseRefName": "morto", "headRefName": "h4",
         "mergeStateStatus": "CLEAN", "isDraft": False},
    ]
    c = classify_pull_requests(prs)
    eq("superseded", c["superseded"], [1])
    eq("current", c["current"], [2])
    eq("stacked", c["stacked"], [3])
    eq("orphan_base", c["orphan_base"], [4])
    eq("partizione", len(c["superseded"]) + len(c["current"]) + len(c["stacked"]) + len(c["orphan_base"]), 4)

    src = ('interface E { sceneStatus: "candidate" | "certified" }\n'
           'ELAB_CORPUS_TOTAL = 88\n'
           'ELAB_EXPERIMENT_CATALOG = [\n'
           '  { experimentId: "a", sceneStatus: "candidate" },\n'
           '  { experimentId: "b", sceneStatus: "certified" },\n'
           ']\n')
    cat = parse_catalog(src)
    eq("cat total", cat["total"], 88)
    eq("cat certified", cat["certified"], 1)
    # la riga di tipo NON e' un esperimento: contarla dava 2 candidate su 1
    eq("cat candidate", cat["by_scene_status"].get("candidate"), 1)
    eq("cat vocabolario", cat["declared_vocabulary"], ["candidate", "certified"])
    eq("cat status", cat["status"], "MEASURED")
    eq("cat senza totale", parse_catalog("niente")["status"], "UNAVAILABLE")
    eq("cat senza totale non inventa", parse_catalog("niente")["total"], None)

    s = empty_state()
    eq("default UNAVAILABLE", s["deploy"]["status"], "UNAVAILABLE")
    # Precondizione STABILITA: `by_scene_status` e' l'unica sezione senza tetto
    # proprio, quindi e' da li' che deve venire la pressione sul tetto globale.
    # Con le PR non funzionava: MD_PR_LIMIT tronca gia' a 40 e l'assert era
    # verde per inerzia (dimostrato da un control run per mutazione).
    s["certification"] = {
        "status": "MEASURED", "source": "x", "total": 88, "certified": 0,
        "by_scene_status": {f"s{i:04d}": 1 for i in range(400)},
    }
    grezzo = len(render_current_md_untruncated(s).splitlines())
    if grezzo <= MD_MAX_LINES:
        fails.append(f"precondizione assente: senza tetto sono {grezzo} righe, il test sarebbe vacuo")
    md = render_current_md(s)
    n = len(md.splitlines())
    if n > MD_MAX_LINES:
        fails.append(f"CURRENT.md {n} righe > {MD_MAX_LINES}")
    if "troncato" not in md:
        fails.append("troncamento non dichiarato nel file")
    if "GENERATO" not in md:
        fails.append("CURRENT.md non si dichiara generato")

    # un gate rotto fallisce APERTO: questo controllo verifica che il self-test
    # sappia ancora vedere il rosso.
    if classify_pull_requests([])["open_count"] != 0:
        fails.append("classify su lista vuota")

    if fails:
        for f in fails:
            print(f"ROSSO  {f}")
        print(f"\nself-test: {len(fails)} falliti")
        return 1
    print("self-test: 18 controlli, tutti verdi")
    return 0


def verify(root: Path) -> int:
    """Asserzione per la CI: il generatore legge il repo REALE.

    Falsificabile: se il generatore restituisse una costante o un valore
    memorizzato, questa asserzione fallirebbe al primo commit nuovo. E' la
    forma eseguibile di «il JSON cambia quando cambia main».
    """
    rc, head = _run(["git", "rev-parse", "HEAD"], root)
    if rc != 0:
        print(f"ROSSO  git rev-parse HEAD exit {rc}", file=sys.stderr)
        return 1
    state = build_state(root, offline=True)
    if state["repo"]["status"] != "MEASURED":
        print(f"ROSSO  repo non misurato: {state['repo'].get('reason')}", file=sys.stderr)
        return 1
    if state["repo"]["head_sha_full"] != head.strip():
        print(f"ROSSO  head_sha generato {state['repo']['head_sha_full']} != {head.strip()}", file=sys.stderr)
        return 1
    md = render_current_md(state)
    if len(md.splitlines()) > MD_MAX_LINES:
        print(f"ROSSO  CURRENT.md {len(md.splitlines())} righe > {MD_MAX_LINES}", file=sys.stderr)
        return 1
    print(f"verify: head_sha {state['repo']['head_sha']} letto dal repo reale; "
          f"CURRENT.md {len(md.splitlines())} righe")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--self-test", action="store_true", help="test delle funzioni pure")
    ap.add_argument("--verify", action="store_true", help="asserzione CI, offline")
    ap.add_argument("--offline", action="store_true", help="niente gh: PR e check restano UNAVAILABLE")
    ap.add_argument("--print", action="store_true", help="stampa il JSON invece di scriverlo")
    args = ap.parse_args(argv)

    if args.self_test:
        return self_test()

    root = repo_root()
    if args.verify:
        return verify(root)

    offline = args.offline or os.environ.get("ARDESIA_STATE_OFFLINE") == "1"
    state = build_state(root, offline=offline)
    if args.print:
        print(json.dumps(state, indent=2, ensure_ascii=False))
        return 0
    jp, mp = write_outputs(root, state)
    print(f"scritto {jp.relative_to(root)}")
    print(f"scritto {mp.relative_to(root)}")
    for sez in ("repo", "pull_requests", "required_checks", "deploy", "certification", "e2e"):
        print(f"  {sez}: {state[sez]['status']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
