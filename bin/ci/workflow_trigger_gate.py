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

This gate reads the DOCUMENT, not the lines, because reading the lines was tried
first and lost three rounds of adversarial review. Five valid YAML spellings of
the banned filter walked past a line parser:

    pull_request: { branches: [main] }        flow mapping under the trigger
    "branches" : [main]                       space before the colon
    on: {pull_request: {branches: [main]}}    flow mapping under `on:` itself
    "pull_request":                      escape inside a quoted key
    push: &f {branches: [main]} / pull_request: *f    anchor and alias

A lexical parser compares CHARACTERS while YAML compares DECODED VALUES, so every
key has unlimited spellings and every patch invites the next one. `yaml.compose`
ends the game: it returns the node tree with scalars already decoded and with line
marks — the meaning and the line number, which is all this gate needs. Flow or
block, quoted or bare, escaped or aliased: none of it matters once characters stop
being the subject.

There is deliberately NO degraded mode. An earlier revision carried a lexical
fallback for a host without PyYAML; review then found that its self-test crashed
in exactly that mode and that it was blind to anchors. The fallback was insurance
against a risk already disproven by measurement — the CI runner does have PyYAML,
printed by this gate's own banner — and it produced two defects on its own. A gate
that cannot verify FAILS. It does not degrade, because a degraded gate that stays
silent is worse than an absent one: it looks like a gate that checked.

    python3 bin/ci/workflow_trigger_gate.py             # scan .github/workflows
    python3 bin/ci/workflow_trigger_gate.py --self-test # verify the parser
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

WORKFLOW_DIR = Path(".github/workflows")

# Triggers whose branch filter is evaluated against the PR base branch.
PR_TRIGGERS = {"pull_request", "pull_request_target"}
BANNED_FILTERS = {"branches", "branches-ignore"}


def unverifiable_reason(yaml_module: object | None) -> str | None:
    """Perche' questo gate non puo' pronunciarsi, o None se puo'.

    Pura di proposito: prende il modulo invece di leggere il globale, cosi' il
    ramo «non posso verificare» e' testabile senza giochi di import — che e'
    esattamente cio' che mancava alla versione con il fallback, il cui self-test
    andava in AttributeError proprio nel modo che dichiarava di supportare.
    """
    if yaml_module is None:
        return (
            "PyYAML assente. Questo gate verifica il SIGNIFICATO del workflow, non "
            "il suo testo, e senza un parser YAML non puo' farlo: `pip install pyyaml`. "
            "Un gate che non puo' verificare fallisce, non degrada."
        )
    return None


def offenders(text: str) -> list[tuple[int, str, str]]:
    """(riga, trigger, filtro) per ogni filtro di base su un trigger di PR."""
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
        # `on` in YAML 1.1 risolve a booleano: si confronta il VALORE della chiave,
        # non il suo tag, cosi' `on`, `"on"`, `On` e `ON` passano tutte da qui.
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


def main() -> int:
    # Prima di qualunque cosa, incluso il self-test: se il gate non puo'
    # verificare, non deve nemmeno sembrare di averlo fatto.
    reason = unverifiable_reason(yaml)
    if reason is not None:
        print(f"workflow trigger gate: {reason}", file=sys.stderr)
        return 1

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

    print(
        f"workflow trigger gate ok: {len(workflows)} workflow, nessun filtro di base "
        f"[modo: semantico (PyYAML {yaml.__version__})]"
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

    def test_comments_and_blank_lines_do_not_shift_the_reported_line(self) -> None:
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

    def test_ignores_scalar_and_flow_sequence_forms_of_on(self) -> None:
        self.assertEqual(offenders("on: pull_request\n"), [])
        self.assertEqual(offenders("on: [push, pull_request]\n"), [])
        self.assertEqual(offenders("on: [push, pull_request, workflow_dispatch]\n"), [])

    # --- Le cinque scritture che un parser a righe dichiarava pulite. Tutte
    # verificate con PyYAML: significano esattamente `pull_request -> branches`.
    # Le prime tre le ha trovate la revisione avversariale al primo giro, la
    # quarta al secondo, la quinta al terzo. Ognuna e' costata un round.

    def test_flags_flow_mapping_under_pull_request(self) -> None:
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
        self.assertEqual(
            offenders('on:\n  pull_request:\n    "branches" : [main]\n'),
            [(3, "pull_request", "branches")],
        )

    def test_flags_flow_mapping_directly_under_on(self) -> None:
        # Il commento di una revisione precedente affermava che un valore sulla
        # stessa riga di `on:` «non ha spazio per una mappa di filtri». Falso.
        self.assertEqual(
            offenders("on: {pull_request: {branches: [main]}}\n"),
            [(1, "pull_request", "branches")],
        )

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

    def test_flags_filter_reached_through_an_anchor_alias(self) -> None:
        # Quinto giro. La riga riportata e' quella dove il filtro e' DEFINITO, non
        # quella dell'alias: e' la riga da cambiare, quindi e' quella utile.
        # Questo test e' un LUCCHETTO, non un falsificatore: il parser semantico lo
        # passava gia' quando e' stato scritto, e serve a impedire la regressione.
        self.assertEqual(
            offenders(
                "on:\n"
                "  push: &filters\n"
                "    branches: [main]\n"
                "  pull_request: *filters\n"
            ),
            [(3, "pull_request", "branches")],
        )

    # --- Forme lecite: senza queste i test sopra sarebbero verdi per eccesso di zelo.

    def test_a_clean_flow_form_stays_clean(self) -> None:
        self.assertEqual(offenders("on:\n  pull_request: { types: [opened] }\n"), [])

    def test_push_filters_stay_allowed_even_in_flow_form(self) -> None:
        self.assertEqual(offenders("on: {push: {branches: [main]}}\n"), [])

    # --- Il gate parla anche quando non puo' giudicare.

    def test_speaks_up_on_invalid_yaml(self) -> None:
        self.assertEqual(
            offenders("on:\n  pull_request:\n   branches: [main]\n  bad\n"),
            [(1, "document", "unparseable-yaml")],
        )

    def test_refuses_to_run_without_a_yaml_parser(self) -> None:
        reason = unverifiable_reason(None)
        self.assertIsNotNone(reason)
        self.assertIn("PyYAML", reason)
        self.assertIn("fallisce, non degrada", reason)

    def test_runs_when_a_yaml_parser_is_present(self) -> None:
        self.assertIsNone(unverifiable_reason(yaml))


if __name__ == "__main__":
    raise SystemExit(main())
