#!/usr/bin/env python3
"""Gate: la versione di Node dichiarata dal repository e quella che la CI
installa non possono divergere in silenzio.

PERCHE' ESISTE
--------------
Misurato il 2026-08-22, e costato un'ora e mezza: cinque file di test dello
studio erano rossi su questa macchina — 22 test, `TypeError: Cannot read
properties of undefined (reading 'clear')` su `window.localStorage` — e verdi
su un runner. La causa non era il codice:

    node -e "Object.getOwnPropertyDescriptor(globalThis,'localStorage')"
      node v26.5.1  -> get,set,enumerable,configurable   valore: undefined
      node v22.14.0 -> ASSENTE

Node >= 24 definisce di suo un globale `localStorage` che oscura quello di
jsdom. `ci.yml` fissava `node-version: 22`; questa macchina eseguiva 26.
**Il repository non lo diceva da nessuna parte**: nessun `.nvmrc`, `engines`
assente da ogni `package.json`. Due sviluppatori sullo stesso commit ottenevano
due verdetti, e niente nell'albero lo spiegava.

Il rimedio del difetto (`--no-experimental-webstorage`) rende la suite
indifferente alla versione. Questo gate ripara la CAUSA a monte: che la
versione attesa esista, sia scritta, e coincida con quella che la CI installa.

COSA MISURA
-----------
1. `.nvmrc` esiste alla radice e contiene una versione leggibile.
2. Ogni passo `actions/setup-node` di ogni workflow o dichiara
   `node-version-file: .nvmrc` — la forma che non puo' divergere — oppure
   dichiara un `node-version:` che **coincide** con `.nvmrc`.
3. Un passo `setup-node` senza ne' l'uno ne' l'altro e' un difetto: prende il
   default dell'azione, che cambia sotto di te senza un commit.

Il confronto e' fra VALORI DECODIFICATI, non fra caratteri: `22`, `"22"` e
`'22'` sono la stessa versione, e `yaml.compose` li porta gia' decodificati con
la riga accanto. Un parser lessicale perderebbe la prima virgolettatura che
qualcuno introduce.

NON confronta con il `node` in esecuzione: un gate che pretendesse la stessa
versione sulla macchina di chi committa fallirebbe per tutti tranne uno, e
questo file non e' il posto dove si decide chi ha ragione.

USO
    python3 bin/ci/node_version_gate.py              # giudica l'albero
    python3 bin/ci/node_version_gate.py --self-test  # verifica il parser

EXIT
  0  `.nvmrc` c'e' e nessun workflow diverge
  1  divergenza, dichiarazione assente, o il gate non puo' verificare
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover - assenza dichiarata, non degradata
    yaml = None  # type: ignore[assignment]

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
WORKFLOW_DIR = REPO_ROOT / ".github/workflows"
NVMRC = REPO_ROOT / ".nvmrc"

#: Il prefisso dell'azione. La versione dopo `@` non conta: cambia a ogni bump.
SETUP_NODE = "actions/setup-node"


def unverifiable_reason(parser) -> str | None:
    if parser is None:
        return (
            "PyYAML non e' importabile: senza un parser questo gate non puo' "
            "leggere i workflow, e fallisce, non degrada."
        )
    return None


def declared_version(text: str | None) -> str | None:
    """La versione dichiarata in `.nvmrc`, o None se il file manca o e' muto.

    `.nvmrc` ammette `v22`, `22`, `22.14.0`, con spazi e righe vuote intorno.
    La `v` iniziale si toglie: `v22` e `22` sono la stessa dichiarazione.
    """
    if text is None:
        return None
    for riga in text.splitlines():
        riga = riga.strip()
        if not riga or riga.startswith("#"):
            continue
        return riga[1:] if riga.startswith(("v", "V")) else riga
    return None


def _steps(node):
    """Ogni mapping del documento, in profondita', con la sua riga."""
    if isinstance(node, yaml.nodes.MappingNode):
        yield node
        for _, value in node.value:
            yield from _steps(value)
    elif isinstance(node, yaml.nodes.SequenceNode):
        for item in node.value:
            yield from _steps(item)


def _scalar(mapping, chiave):
    for k, v in mapping.value:
        if isinstance(k, yaml.nodes.ScalarNode) and k.value == chiave:
            return v
    return None


def offenders(workflow_text: str, nvmrc_text: str | None) -> list[tuple[int, str, str]]:
    """(riga, cosa dichiara il passo, motivo) per ogni `setup-node` divergente."""
    atteso = declared_version(nvmrc_text)
    if atteso is None:
        return [(1, "-", "nvmrc-assente")]
    try:
        root = yaml.compose(workflow_text)
    except yaml.YAMLError:
        return [(1, "document", "unparseable-yaml")]
    if root is None:
        return []

    trovati: list[tuple[int, str, str]] = []
    for mapping in _steps(root):
        uses = _scalar(mapping, "uses")
        if uses is None or not isinstance(uses, yaml.nodes.ScalarNode):
            continue
        if not uses.value.startswith(SETUP_NODE):
            continue
        riga = uses.start_mark.line + 1
        with_node = _scalar(mapping, "with")
        if with_node is None or not isinstance(with_node, yaml.nodes.MappingNode):
            trovati.append((riga, "-", "senza-versione"))
            continue
        file_node = _scalar(with_node, "node-version-file")
        if file_node is not None:
            # La forma che non puo' divergere: il workflow LEGGE la dichiarazione.
            continue
        ver_node = _scalar(with_node, "node-version")
        if ver_node is None:
            trovati.append((riga, "-", "senza-versione"))
            continue
        dichiarata = str(ver_node.value).strip()
        normalizzata = dichiarata[1:] if dichiarata.startswith(("v", "V")) else dichiarata
        if normalizzata != atteso:
            trovati.append((ver_node.start_mark.line + 1, dichiarata, "diverge"))
    return trovati


def main() -> int:
    reason = unverifiable_reason(yaml)
    if reason is not None:
        print(f"node version gate: {reason}", file=sys.stderr)
        return 1

    if "--self-test" in sys.argv:
        return 0 if unittest.main(argv=sys.argv[:1], exit=False).result.wasSuccessful() else 1

    if not WORKFLOW_DIR.is_dir():
        print(f"{WORKFLOW_DIR} assente: eseguire dalla radice del repo", file=sys.stderr)
        return 1

    nvmrc_text = NVMRC.read_text() if NVMRC.is_file() else None
    atteso = declared_version(nvmrc_text)
    if atteso is None:
        print(
            "node version gate: `.nvmrc` assente o vuoto alla radice del repo.\n"
            "  Il repository non dichiara quale Node vuole, e la CI ne installa uno.\n"
            "  Misurato il 2026-08-22: 22 test rossi su Node 26 e verdi su Node 22,\n"
            "  senza che nulla nell'albero spiegasse la differenza.",
            file=sys.stderr,
        )
        return 1

    workflows = sorted(p for p in WORKFLOW_DIR.iterdir() if p.suffix in {".yml", ".yaml"})
    failures = 0
    for path in workflows:
        for riga, dichiarata, motivo in offenders(path.read_text(), nvmrc_text):
            failures += 1
            if motivo == "diverge":
                print(
                    f"{path}:{riga}: `node-version: {dichiarata}` diverge da `.nvmrc` ({atteso}). "
                    f"Allineare, o meglio usare `node-version-file: .nvmrc`.",
                    file=sys.stderr,
                )
            elif motivo == "senza-versione":
                print(
                    f"{path}:{riga}: `{SETUP_NODE}` senza `node-version` ne' "
                    f"`node-version-file`: prende il default dell'azione, che cambia "
                    f"senza un commit di questo repo.",
                    file=sys.stderr,
                )
            else:
                print(f"{path}:{riga}: {motivo}", file=sys.stderr)

    if failures:
        print(f"\nnode version gate: {failures} divergenza/e", file=sys.stderr)
        return 1

    print(
        f"node version gate ok: `.nvmrc` = {atteso}, "
        f"{len(workflows)} workflow allineati [modo: semantico (PyYAML {yaml.__version__})]"
    )
    return 0


class NodeVersionGateTest(unittest.TestCase):
    NVMRC = "22\n"

    def test_flags_a_workflow_that_installs_another_version(self) -> None:
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n"
                "      - uses: actions/setup-node@v4\n"
                "        with:\n          node-version: 20\n",
                self.NVMRC,
            ),
            [(6, "20", "diverge")],
        )

    def test_accepts_the_declared_version(self) -> None:
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n"
                "      - uses: actions/setup-node@v4\n"
                "        with:\n          node-version: 22\n",
                self.NVMRC,
            ),
            [],
        )

    def test_quoting_is_not_a_difference(self) -> None:
        # Confronto fra valori decodificati: un parser lessicale perderebbe questa.
        self.assertEqual(
            offenders(
                "jobs: {a: {steps: [{uses: actions/setup-node@v4, with: {node-version: '22'}}]}}\n",
                self.NVMRC,
            ),
            [],
        )

    def test_the_leading_v_is_not_a_difference(self) -> None:
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n"
                "      - uses: actions/setup-node@v4\n"
                "        with:\n          node-version: v22\n",
                self.NVMRC,
            ),
            [],
        )
        self.assertEqual(declared_version("v22\n"), "22")

    def test_node_version_file_cannot_diverge_and_is_accepted(self) -> None:
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n"
                "      - uses: actions/setup-node@v4\n"
                "        with:\n          node-version-file: .nvmrc\n",
                self.NVMRC,
            ),
            [],
        )

    def test_setup_node_without_any_version_is_a_defect(self) -> None:
        # Il default dell'azione cambia senza un commit di questo repo: e' la
        # stessa deriva, solo senza un numero da confrontare.
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n      - uses: actions/setup-node@v4\n",
                self.NVMRC,
            ),
            [(4, "-", "senza-versione")],
        )

    def test_other_actions_are_not_the_subject(self) -> None:
        self.assertEqual(
            offenders(
                "jobs:\n  a:\n    steps:\n"
                "      - uses: actions/checkout@v4\n"
                "        with:\n          node-version: 20\n",
                self.NVMRC,
            ),
            [],
        )

    def test_a_missing_declaration_is_itself_the_defect(self) -> None:
        self.assertEqual(
            offenders("jobs: {}\n", None),
            [(1, "-", "nvmrc-assente")],
        )

    def test_speaks_up_on_invalid_yaml(self) -> None:
        self.assertEqual(
            offenders("jobs:\n  a:\n   steps: []\n  bad\n", self.NVMRC),
            [(1, "document", "unparseable-yaml")],
        )

    def test_refuses_to_run_without_a_yaml_parser(self) -> None:
        reason = unverifiable_reason(None)
        self.assertIsNotNone(reason)
        self.assertIn("PyYAML", reason)


if __name__ == "__main__":
    raise SystemExit(main())
