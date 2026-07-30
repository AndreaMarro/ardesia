#!/usr/bin/env python3
"""Gate: un documento non deve affermare cio' che il repo smentisce.

Ogni controllo qui nasce da un finding MISURATO di revisione avversariale, non da
una buona pratica. Il 2026-07-29/30, sei round di review su una singola PR di
documentazione hanno prodotto venti finding confermati. Classificati:

    16/20  meccanicamente controllabili   <- questo file
     1/20  parzialmente
     3/20  giudizio genuino               <- resta al revisore

Il revisore costa 20-40 minuti per round ed e' il consumo dominante del loop. Aver
speso l'80% di quel budget su cose che uno script trova in due secondi e' il difetto
che questo gate rimuove. La ripartizione e' quella raccomandata in letteratura: i
livelli deterministici prendono correttezza e conformita', i livelli AI prendono
intento e contesto.

E c'e' la prova che serve un MECCANISMO e non attenzione: il finding 3 del sesto
round e' la stessa classe del finding 12 del quinto — appiattire due esiti diversi in
uno — ricomparsa sessanta minuti dopo essere stata corretta a mano.

    python3 bin/ci/doc_claims_gate.py            # scan dei documenti tracciati
    python3 bin/ci/doc_claims_gate.py <file.md>  # un documento solo
    python3 bin/ci/doc_claims_gate.py --self-test
"""
from __future__ import annotations

import re
import subprocess
import sys
import unittest
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

#: Documenti sotto gate. Ristretto di proposito: allargarlo a tutto il vault-docs
#: farebbe fallire su materiale importato e il gate verrebbe aggirato.
SCAN_GLOBS = ("docs/ops/ARDESIA-LOOP-*.md", "docs/ops/CURRENT.md")

FENCED_YAML_RE = re.compile(r"```ya?ml\n(.*?)```", re.S)
FENCED_BASH_RE = re.compile(r"```(?:bash|sh)\n(.*?)```", re.S)
#: Un path citato fra backtick: `bin/ci/foo.py`, `.github/workflows/ci.yml`.
CITED_PATH_RE = re.compile(r"`([A-Za-z0-9_][A-Za-z0-9_./-]*\.(?:py|ya?ml|json|md|sh|ts|tsx))`")
#: Timestamp ISO dichiarato nella testa del documento.
STATED_TS_RE = re.compile(r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::\d{2})?")
#: Redirezione da file in un blocco di comandi: `< examples.yaml`.
REDIRECT_FROM_RE = re.compile(r"<\s*([A-Za-z0-9_][A-Za-z0-9_./-]*\.[A-Za-z0-9]+)")


def unverifiable_reason(yaml_module: object | None) -> str | None:
    """Perche' il gate non puo' pronunciarsi, o None."""
    if yaml_module is None:
        return (
            "PyYAML assente: questo gate valida i blocchi YAML dei documenti e senza "
            "un parser non puo' farlo. `pip install pyyaml`. Un gate che non puo' "
            "verificare fallisce, non degrada."
        )
    return None


def in_head(path: str) -> bool:
    """Il path esiste in HEAD **oppure** sul disco.

    Il disco conta perche' un path AGGIUNTO nella stessa modifica e' legittimamente
    citabile: al primo uso reale questo gate ha bocciato un documento che citava il
    gate stesso, non ancora committato. Un falso positivo — il terzo trovato usando
    un gate in questa sessione — e la risposta giusta a un falso positivo e' piu'
    precisione, non un blocco piu' largo: un gate che nega a caso viene disattivato.
    """
    if Path(path).exists():
        return True
    return subprocess.run(
        ["git", "cat-file", "-e", f"HEAD:{path}"], capture_output=True
    ).returncode == 0


def first_commit_iso(path: str) -> str | None:
    """Data ISO del commit che ha introdotto il file, o None se non tracciato."""
    out = subprocess.run(
        ["git", "log", "--diff-filter=A", "--follow", "--format=%aI", "--", path],
        capture_output=True,
        text=True,
    ).stdout.strip().splitlines()
    return out[-1] if out else None


def check_yaml_blocks(text: str) -> list[str]:
    """Ogni blocco ```yaml deve essere YAML valido.

    Da #223 round 1: un blocco presentato come «sei scritture confermate con un
    parser reale» che quel parser rifiutava con
    `ComposerError: found undefined alias 'base'`. Una claim smentita
    dall'esecuzione dello strumento che invoca.
    """
    problems = []
    for index, block in enumerate(FENCED_YAML_RE.findall(text), start=1):
        try:
            list(yaml.safe_load_all(block))
        except yaml.YAMLError as exc:
            first = str(exc).splitlines()[0]
            problems.append(f"blocco yaml #{index} non e' YAML valido: {first}")
    return problems


def check_cited_paths(text: str) -> list[str]:
    """Un path citato deve esistere in HEAD, o essere dichiarato di un altro repo.

    Da #223 round 2: `bin/receipt-measurements.py` citato come se stesse in questo
    repository — e citato nel paragrafo che spiega il difetto del referente
    adiacente. La qualificazione accettata e' una menzione esplicita di un altro
    repository sulla stessa riga o su quella successiva.
    """
    problems = []
    lines = text.splitlines()
    for lineno, line in enumerate(lines):
        for path in CITED_PATH_RE.findall(line):
            if in_head(path):
                continue
            window = " ".join(lines[lineno : lineno + 2]).lower()
            qualified = any(
                marker in window
                for marker in ("repository", "repo separato", "another repo", "non in questo")
            )
            if not qualified:
                problems.append(
                    f"riga {lineno + 1}: `{path}` non esiste in HEAD e non e' "
                    "dichiarato di un altro repository"
                )
    return problems


def check_stated_timestamp(text: str, path: str) -> list[str]:
    """Un timestamp dichiarato non puo' essere posteriore al commit che lo contiene.

    Da #223 round 6: il documento dichiarava «Written 04:40» in un file committato
    alle 04:22:44. Non si scrive un'ora futura in un file gia' committato.
    """
    match = STATED_TS_RE.search(text[:600])
    if match is None:
        return []
    introduced = first_commit_iso(path)
    if introduced is None:
        return []
    stated = match.group(1)
    if stated > introduced[: len(stated)]:
        return [
            f"timestamp dichiarato {stated} posteriore al commit che introduce il "
            f"file ({introduced[:16]}): un documento non puo' dichiarare un'ora futura"
        ]
    return []


def check_verify_commands(text: str) -> list[str]:
    """Un comando presentato come verifica deve funzionare da dove il lettore sta.

    Da #223 round 6: uno snapshot dichiarato «ricontabile» con un comando che dalla
    root del repository restituisce 0/0, perche' leggeva file in una scratch
    directory mai nominata. Il comando che doveva rendere la claim controllabile era
    esso stesso rotto.
    """
    problems = []
    for block in FENCED_BASH_RE.findall(text):
        for target in REDIRECT_FROM_RE.findall(block):
            if not in_head(target) and not Path(target).exists():
                problems.append(
                    f"comando di verifica legge `{target}`, che non esiste ne' in "
                    "HEAD ne' sul disco: dalla root del repo quel comando non "
                    "produce la misura che il documento promette"
                )
    return problems


CHECKS = (
    ("yaml", lambda t, p: check_yaml_blocks(t)),
    ("paths", lambda t, p: check_cited_paths(t)),
    ("timestamp", lambda t, p: check_stated_timestamp(t, p)),
    ("verify-cmd", lambda t, p: check_verify_commands(t)),
)


def check_document(path: str) -> list[str]:
    text = Path(path).read_text(errors="replace")
    problems = []
    for name, fn in CHECKS:
        problems += [f"{path}: [{name}] {p}" for p in fn(text, path)]
    return problems


def targets(argv: list[str]) -> list[str]:
    if len(argv) > 1:
        return [a for a in argv[1:] if not a.startswith("--")]
    found: list[str] = []
    for pattern in SCAN_GLOBS:
        found += [str(p) for p in sorted(Path().glob(pattern))]
    return found


def main() -> int:
    reason = unverifiable_reason(yaml)
    if reason is not None:
        print(f"doc claims gate: {reason}", file=sys.stderr)
        return 1

    if "--self-test" in sys.argv:
        return 0 if unittest.main(argv=sys.argv[:1], exit=False).result.wasSuccessful() else 1

    docs = targets(sys.argv)
    if not docs:
        print("doc claims gate: nessun documento sotto gate")
        return 0

    problems: list[str] = []
    for doc in docs:
        problems += check_document(doc)

    if problems:
        for problem in problems:
            print(f"doc claims gate: {problem}", file=sys.stderr)
        print(
            f"\ndoc claims gate: {len(problems)} claim che il repo smentisce", file=sys.stderr
        )
        return 1

    print(
        f"doc claims gate ok: {len(docs)} documento/i, {len(CHECKS)} controlli "
        f"[da 16 finding avversariali misurati il 2026-07-30]"
    )
    return 0


class DocClaimsGateTest(unittest.TestCase):
    def test_invalid_yaml_block_is_flagged(self) -> None:
        # Il caso reale: anchor `&f`, alias `*base`.
        text = "```yaml\non:\n  push: &f\n    branches: [main]\n  pull_request: *base\n```\n"
        found = check_yaml_blocks(text)
        self.assertEqual(len(found), 1)
        self.assertIn("non e' YAML valido", found[0])

    def test_valid_multidocument_yaml_block_passes(self) -> None:
        text = "```yaml\non:\n  pull_request: { branches: [main] }\n---\non: {push: {}}\n```\n"
        self.assertEqual(check_yaml_blocks(text), [])

    def test_absent_path_is_flagged(self) -> None:
        found = check_cited_paths("vedi `bin/zz-non-esiste-mai.py` per i dettagli\n")
        self.assertEqual(len(found), 1)
        self.assertIn("non esiste in HEAD", found[0])

    def test_absent_path_qualified_as_external_passes(self) -> None:
        text = "`bin/zz-non-esiste-mai.py` nel repository separato ardesia-knowledge\n"
        self.assertEqual(check_cited_paths(text), [])

    def test_present_path_passes(self) -> None:
        self.assertEqual(check_cited_paths("il gate `bin/ci/nul_scan.py` gira\n"), [])

    def test_broken_verify_command_is_flagged(self) -> None:
        text = "```bash\npython3 -c 'print(1)' < zz-mai-esistito.yaml\n```\n"
        found = check_verify_commands(text)
        self.assertEqual(len(found), 1)
        self.assertIn("non produce la misura", found[0])

    def test_command_without_redirect_passes(self) -> None:
        self.assertEqual(check_verify_commands("```bash\ngit log --oneline -3\n```\n"), [])

    def test_refuses_to_run_without_a_yaml_parser(self) -> None:
        reason = unverifiable_reason(None)
        self.assertIsNotNone(reason)
        self.assertIn("fallisce, non degrada", reason)


if __name__ == "__main__":
    raise SystemExit(main())
