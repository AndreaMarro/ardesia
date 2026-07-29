#!/usr/bin/env python3
"""Gate: gate coverage must not depend on a PR's base branch.

A `branches:` (or `branches-ignore:`) filter under `pull_request:` matches the
BASE of the pull request, not its content. A stacked PR — one whose base is
another topic branch instead of main — therefore never triggers the workflow
and arrives with fewer checks than a main-targeted PR carrying the same diff.

Observed 2026-07-29: studio-preview-readiness declared `pull_request:
branches: [main]`, so PR #218 (base wip/desktop-loop-continuity) reported 4
checks while PR #217 (base main) reported 5. The missing one was
no-deploy-check. The gap is invisible after the fact: when the parent PR
merges, GitHub retargets the child's base to main and the workflow finally
runs, erasing the evidence that it had been skipped.

Widening the filter to an allowlist of branch prefixes only postpones the
regression to the next prefix somebody invents. The only shape that cannot
silently regress is no filter at all: every PR, whatever its base. This gate
enforces that shape so the comment explaining it cannot be "simplified" away.

Push triggers are deliberately NOT checked: a push branch list restricts which
branches get pre-PR feedback, which never removes a check from a PR.

This gate reads the DOCUMENT, not the lines, and it does so because reading the
lines was tried first and lost. Adversarial review of this very file produced
four valid YAML spellings of the banned filter that a line parser called clean:

    pull_request: { branches: [main] }        flow mapping under the trigger
    "branches" : [main]                       space before the colon
    on: {pull_request: {branches: [main]}}    flow mapping under `on:` itself
    "pull_request":                      escape inside a quoted key

All four were confirmed with a real YAML parser to mean exactly
`pull_request -> branches`. The first three were patched lexically; the fourth
arrived immediately afterwards, which is the lesson: a lexical parser compares
CHARACTERS while YAML compares DECODED VALUES, so every key has unlimited
spellings and every patch invites the next one. A gate that valid YAML can bypass
does not make an invariant non-regressable, which is its only reason to exist.

`yaml.compose` hands over the node tree with scalars already decoded and with
line marks — the meaning and the line number, which is everything this gate
needs. Flow or block, quoted or bare, escaped or literal: none of it matters once
the characters stop being the subject.

`offenders_lexical` survives only for a host without PyYAML. It cannot normalise
flow forms or escapes, so it REFUSES them rather than calling them clean, and
`main()` prints which mode ran: a degraded gate that stays silent is worse than
an absent one, because it looks like a gate that checked.

    python3 bin/ci/workflow_trigger_gate.py             # scan .github/workflows
    python3 bin/ci/workflow_trigger_gate.py --self-test # verify the parser
"""
from __future__ import annotations

import re
import sys
import unittest
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover - misurato in CI, vedi banner di main()
    yaml = None

WORKFLOW_DIR = Path(".github/workflows")

# Chiave double-quoted che contiene un escape: `"pull_request":`. Un parser
# lessicale confronta i CARATTERI, YAML confronta il valore DECODIFICATO, quindi
# in modo degradato questa forma non e' normalizzabile e non va dichiarata pulita.
ESCAPED_KEY_RE = re.compile(r'"[^"]*\\[^"]*"[ ]*:')

# Triggers whose branch filter is evaluated against the PR base branch.
PR_TRIGGERS = {"pull_request", "pull_request_target"}
BANNED_FILTERS = {"branches", "branches-ignore"}

KEY_RE = re.compile(
    r"""^(?P<indent>[ ]*)                    # block indentation
         (?P<quote>["']?)(?P<key>[^"':\#]+)(?P=quote)  # key, optionally quoted
         [ ]*:(?P<rest>[ ].*|)$              # colon (YAML allows space before it)
    """,
    re.VERBOSE,
)

# Un filtro proibito NOMINATO dentro una forma flow. Serve solo a rendere il
# messaggio d'errore utile: la violazione e' la forma flow in se' (vedi
# `flow_offence`), non la presenza del token.
BANNED_IN_FLOW_RE = re.compile(r"\b(branches-ignore|branches)\b[ ]*[\"']?[ ]*:")


def flow_offence(value: str) -> str | None:
    """Nome del filtro proibito, `"flow-mapping"`, o None se la forma e' leggibile.

    Una SEQUENZA flow (`on: [push, pull_request]`) non puo' portare filtri: e'
    lecita. Una MAPPA flow puo', e un parser a righe non la decompone in modo
    affidabile — quindi non e' in grado di PROVARE che sia pulita, e il gate
    fallisce chiuso invece di dichiararla a posto.
    """
    if "{" not in value:
        return None
    match = BANNED_IN_FLOW_RE.search(value)
    return match.group(1) if match else "flow-mapping"


def significant(text: str) -> list[tuple[int, int, str | None, str]]:
    """(line number, indent, key or None, same-line value) for parseable lines.

    Blank lines and whole-line comments carry no structure, so they are
    dropped instead of being read as a dedent that would close a block early.
    """
    rows: list[tuple[int, int, str | None, str]] = []
    for lineno, raw in enumerate(text.splitlines(), start=1):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        match = KEY_RE.match(raw)
        if match:
            rows.append(
                (
                    lineno,
                    len(match.group("indent")),
                    match.group("key").strip(),
                    match.group("rest").strip(),
                )
            )
        else:
            rows.append((lineno, len(raw) - len(raw.lstrip()), None, ""))
    return rows


def block(rows: list[tuple[int, int, str | None, str]], start: int) -> list:
    """Rows nested strictly deeper than rows[start], up to the first dedent."""
    outer = rows[start][1]
    end = start + 1
    while end < len(rows) and rows[end][1] > outer:
        end += 1
    return rows[start + 1 : end]


def offenders_semantic(text: str) -> list[tuple[int, str, str]]:
    """Come sopra, ma sul DOCUMENTO invece che sulle righe.

    `yaml.compose` restituisce l'albero dei nodi con i valori scalari GIA'
    decodificati e con `start_mark`, cioe' esattamente le due cose che servono:
    il significato e il numero di riga. Forma flow o a blocchi, chiave quotata o
    nuda, escape o testo letterale: qui non fanno differenza, perche' non si
    guardano piu' i caratteri.
    """
    try:
        root = yaml.compose(text)
    except yaml.YAMLError:
        # Un workflow che non e' YAML valido non e' un file pulito: e' un file su
        # cui questo gate non ha nulla da dire, e lo dice invece di tacere.
        return [(1, "document", "unparseable-yaml")]
    if not isinstance(root, yaml.MappingNode):
        return []

    found: list[tuple[int, str, str]] = []
    for key_node, value_node in root.value:
        if not isinstance(key_node, yaml.ScalarNode) or key_node.value.lower() != "on":
            continue
        # Uno scalare (`on: push`) o una sequenza (`on: [push, pull_request]`) non
        # puo' portare filtri. Solo una mappa puo', in qualunque notazione.
        if not isinstance(value_node, yaml.MappingNode):
            continue
        for trigger_node, filters_node in value_node.value:
            if (
                not isinstance(trigger_node, yaml.ScalarNode)
                or trigger_node.value not in PR_TRIGGERS
                or not isinstance(filters_node, yaml.MappingNode)
            ):
                continue
            for filter_node, _ in filters_node.value:
                if (
                    isinstance(filter_node, yaml.ScalarNode)
                    and filter_node.value in BANNED_FILTERS
                ):
                    found.append(
                        (
                            filter_node.start_mark.line + 1,
                            trigger_node.value,
                            filter_node.value,
                        )
                    )
    return found


def offenders(text: str) -> list[tuple[int, str, str]]:
    """Il gate. Semantico quando si puo', lessicale e fail-closed quando no."""
    if yaml is not None:
        return offenders_semantic(text)
    return offenders_lexical(text)


def offenders_lexical(text: str) -> list[tuple[int, str, str]]:
    """(line, trigger, filter) leggendo le righe. Modo DEGRADATO, fail-closed.

    Sopravvive solo per il caso in cui PyYAML non ci sia. Non puo' normalizzare
    ne' le forme flow ne' gli escape, quindi le RIFIUTA invece di dichiararle
    pulite: un gate degradato che tace e' peggio di un gate assente, perche'
    somiglia a uno che ha guardato.
    """
    rows = significant(text)
    found: list[tuple[int, str, str]] = []

    for lineno, raw in enumerate(text.splitlines(), start=1):
        if ESCAPED_KEY_RE.search(raw):
            found.append((lineno, "document", "escaped-key"))

    for index, (lineno, indent, key, value) in enumerate(rows):
        # `on:` is the only top-level key that can carry triggers.
        if indent != 0 or key not in {"on", "On", "ON", "true"}:
            continue
        if value:
            # Un valore sulla stessa riga NON e' sempre innocuo: una mappa flow
            # `on: {pull_request: {branches: [main]}}` porta trigger E filtri su
            # una riga sola, ed e' esattamente cio' che questo gate deve vietare.
            # Il commento che stava qui affermava il contrario ed era falso.
            offence = flow_offence(value)
            if offence:
                found.append((lineno, "on", offence))
            continue
        for offset, (t_lineno, _t_indent, t_key, t_value) in enumerate(
            block(rows, index)
        ):
            if t_key not in PR_TRIGGERS:
                continue
            if t_value:
                offence = flow_offence(t_value)
                if offence:
                    found.append((t_lineno, t_key, offence))
                continue
            trigger_start = index + 1 + offset
            for f_lineno, _f_indent, f_key, _f_value in block(rows, trigger_start):
                if f_key in BANNED_FILTERS:
                    found.append((f_lineno, t_key, f_key))
    return found


def main() -> int:
    if "--self-test" in sys.argv:
        return 0 if unittest.main(argv=sys.argv[:1], exit=False).result.wasSuccessful() else 1

    if not WORKFLOW_DIR.is_dir():
        print(f"{WORKFLOW_DIR} assente: eseguire dalla radice del repo", file=sys.stderr)
        return 1

    workflows = sorted(
        p for p in WORKFLOW_DIR.iterdir() if p.suffix in {".yml", ".yaml"}
    )
    failures = 0
    for path in workflows:
        for lineno, trigger, filter_key in offenders(path.read_text()):
            failures += 1
            print(
                f"{path}:{lineno}: `{filter_key}:` sotto `{trigger}:` lega i check "
                f"alla base della PR -> una PR impilata resta sotto-controllata. "
                f"Rimuovere il filtro (vedi docstring di questo gate).",
                file=sys.stderr,
            )

    if failures:
        print(f"\nworkflow trigger gate: {failures} filtro/i da rimuovere", file=sys.stderr)
        return 1

    # Il modo va STAMPATO, non presunto: se PyYAML mancasse, il gate scenderebbe
    # al parser lessicale e un verde direbbe una cosa piu' debole di quella che
    # sembra. Un lettore della receipt deve poter distinguere i due verdi.
    mode = "semantico (PyYAML)" if yaml is not None else "LESSICALE DEGRADATO (PyYAML assente)"
    print(
        f"workflow trigger gate ok: {len(workflows)} workflow, nessun filtro di base "
        f"[modo: {mode}]"
    )
    return 0


class WorkflowTriggerGateTest(unittest.TestCase):
    def test_flags_branches_filter_on_pull_request(self) -> None:
        found = offenders(
            "on:\n"
            "  pull_request:\n"
            "    branches: [main]\n"
            "    paths:\n"
            "      - 'apps/**'\n"
        )
        self.assertEqual(found, [(3, "pull_request", "branches")])

    def test_flags_branches_ignore_and_pull_request_target(self) -> None:
        found = offenders(
            "on:\n"
            "  pull_request_target:\n"
            "    branches-ignore: [wip/**]\n"
        )
        self.assertEqual(found, [(3, "pull_request_target", "branches-ignore")])

    def test_allows_unfiltered_pull_request_with_paths(self) -> None:
        self.assertEqual(
            offenders("on:\n  pull_request:\n    paths:\n      - 'apps/**'\n"), []
        )

    def test_allows_branches_under_push(self) -> None:
        self.assertEqual(
            offenders("on:\n  pull_request:\n  push:\n    branches: [main]\n"), []
        )

    def test_ignores_comments_and_blank_lines_inside_the_block(self) -> None:
        found = offenders(
            "on:\n"
            "  # spiegazione\n"
            "\n"
            "  pull_request:\n"
            "    # nota\n"
            "    branches: [main]\n"
        )
        self.assertEqual(found, [(6, "pull_request", "branches")])

    def test_ignores_branches_belonging_to_a_job_not_to_a_trigger(self) -> None:
        self.assertEqual(
            offenders(
                "on:\n"
                "  pull_request:\n"
                "jobs:\n"
                "  build:\n"
                "    branches: [main]\n"
            ),
            [],
        )

    def test_ignores_scalar_and_flow_forms_of_on(self) -> None:
        self.assertEqual(offenders("on: pull_request\n"), [])
        self.assertEqual(offenders("on: [push, pull_request]\n"), [])

    # --- Forme YAML valide che un parser a righe non puo' decomporre. Tutte e tre
    # verificate con PyYAML: producono ESATTAMENTE `pull_request -> branches`,
    # cioe' il filtro proibito. Prima di questi test il gate le dichiarava pulite,
    # ed era il gate stesso — non il workflow — il buco: un gate aggirabile con
    # YAML valido non rende l'invariante non-regredibile, che e' il suo unico scopo.

    def test_flags_flow_mapping_under_pull_request(self) -> None:
        # trovato dalla revisione avversariale su questo ramo
        self.assertEqual(
            offenders("on:\n  pull_request: { branches: [main], paths: [apps/**] }\n"),
            [(2, "pull_request", "branches")],
        )

    def test_flags_flow_mapping_under_pull_request_target(self) -> None:
        self.assertEqual(
            offenders("on:\n  pull_request_target: {branches-ignore: [wip/**]}\n"),
            [(2, "pull_request_target", "branches-ignore")],
        )

    def test_flags_quoted_key_with_space_before_colon(self) -> None:
        # `"branches" : [main]` e' YAML valido: la chiave e' `branches`.
        self.assertEqual(
            offenders('on:\n  pull_request:\n    "branches" : [main]\n'),
            [(3, "pull_request", "branches")],
        )

    def test_flags_flow_mapping_directly_under_on(self) -> None:
        # NON trovato dalla revisione: il commento del gate affermava che un valore
        # sulla stessa riga di `on:` «non ha spazio per una mappa di filtri».
        # `on: {pull_request: {branches: [main]}}` lo smentisce.
        #
        # I due modi rispondono in modo DIVERSO, ed e' la differenza che conta:
        # leggendo il documento il gate sa a quale trigger appartiene il filtro,
        # leggendo le righe puo' solo dire «qualcosa sotto on:». Entrambi lo
        # rifiutano; solo uno sa cosa ha rifiutato.
        self.assertEqual(
            offenders_semantic("on: {pull_request: {branches: [main]}}\n"),
            [(1, "pull_request", "branches")],
        )
        self.assertEqual(
            offenders_lexical("on: {pull_request: {branches: [main]}}\n"),
            [(1, "on", "branches")],
        )

    def test_semantic_mode_leaves_push_filters_alone_even_in_flow_form(self) -> None:
        # Il modo lessicale rifiutava anche questo, non sapendo attribuirlo. Il
        # semantico no: i filtri su push non togliono check a una PR.
        self.assertEqual(offenders_semantic("on: {push: {branches: [main]}}\n"), [])
        self.assertEqual(
            offenders_lexical("on: {push: {branches: [main]}}\n"),
            [(1, "on", "branches")],
        )

    def test_semantic_mode_allows_a_clean_flow_form(self) -> None:
        # Leggendo il documento, una mappa flow SENZA filtro proibito e' pulita:
        # non serve piu' over-approssimare, perche' non si tira a indovinare.
        self.assertEqual(offenders("on:\n  pull_request: { types: [opened] }\n"), [])

    def test_lexical_fallback_fails_closed_on_forms_it_cannot_normalize(self) -> None:
        # Il modo degradato non sa decomporre una mappa flow ne' decodificare un
        # escape: li rifiuta. Testato sulla funzione ESPLICITA, non sul dispatch,
        # perche' altrimenti su una macchina con PyYAML questo test non misurerebbe
        # nulla e sarebbe verde per assenza del ramo che dovrebbe coprire.
        self.assertEqual(
            offenders_lexical("on:\n  pull_request: { types: [opened] }\n"),
            [(2, "pull_request", "flow-mapping")],
        )
        self.assertEqual(
            offenders_lexical('on:\n  "pull_requ\\u0065st":\n    branches: [main]\n'),
            [(2, "document", "escaped-key")],
        )

    def test_semantic_mode_speaks_up_on_invalid_yaml(self) -> None:
        if yaml is None:
            self.skipTest("PyYAML assente: il ramo semantico non esiste qui")
        self.assertEqual(
            offenders_semantic("on:\n  pull_request:\n   branches: [main]\n  bad\n"),
            [(1, "document", "unparseable-yaml")],
        )

    def test_flow_sequence_of_on_stays_allowed(self) -> None:
        # Una SEQUENZA flow non puo' portare filtri: resta lecita.
        self.assertEqual(offenders("on: [push, pull_request, workflow_dispatch]\n"), [])

    # --- Quarto bypass, secondo giro della revisione avversariale. Un parser
    # LESSICALE confronta la forma scritta; YAML confronta il valore DECODIFICATO.
    # Finche' il gate guarda i caratteri, ogni chiave ha infinite scritture e ogni
    # pezza ne invita un'altra: e' la ragione per cui questo gate ha smesso di
    # leggere righe e ha iniziato a leggere il documento.

    def test_flags_escaped_trigger_key(self) -> None:
        self.assertEqual(
            offenders('on:\n  "pull_requ\\u0065st":\n    branches: [main]\n'),
            [(3, "pull_request", "branches")],
        )

    def test_flags_escaped_filter_key(self) -> None:
        self.assertEqual(
            offenders('on:\n  pull_request:\n    "branch\\u0065s": [main]\n'),
            [(3, "pull_request", "branches")],
        )


if __name__ == "__main__":
    raise SystemExit(main())
