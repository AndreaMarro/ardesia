"""Compose the Cric entry points without copying or editing the signed physics client."""

from functools import lru_cache
from pathlib import Path
import re


_STATIC = Path(__file__).resolve().parent.parent / "static"
_EXTENSION = "/multidiscipline/js/"
_SHARED_IMPORT = re.compile(r"""(\bfrom\s+|\bimport\(\s*)(['"])\./([^'"]+)(\2)""")

_INDEX = (
    ("I sei percorsi di Fisica per Medicina di Andrea Marro. Lezioni, problemi guidati, laboratori e simulazioni del semestre aperto.",
     "Cric, l’officina di studio di Andrea Marro. Percorsi universitari, lezioni, problemi svolti e laboratori."),
    ("<title>Officina di Fisica ·", "<title>Cric ·"),
    ('    <script defer src="/vendor/katex.min.js">',
     '    <link rel="stylesheet" href="/multidiscipline/discipline.css" />\n    <script defer src="/vendor/katex.min.js">'),
    ('type="module" src="/js/app.js"', 'type="module" src="/multidiscipline/js/app.js"'),
    ("<strong>Officina di Fisica</strong>", "<strong>Cric</strong>"),
    ('<a class="mast-search" href="#percorsi/cerca">Cerca</a>',
     '<div class="mast-tools"><a href="#discipline">Materie</a>'
     '<a class="mast-search" href="#percorsi/cerca" title="Cerca nei percorsi di Fisica">Cerca</a></div>'),
    ("<span>Officina di Fisica <i>/", "<span>Cric <i>/"),
)
_APP = (
    ("    prova: 'studio', lab:", "    disciplina: 'discipline', prova: 'studio', lab:"),
    ("  for (const a of document.querySelectorAll('.mast nav a')) {",
     "  updateSearch(page, parts[0]);\n  for (const a of document.querySelectorAll('.mast nav a, .mast-tools a')) {"),
    ("    if (page === 'home') home();", """    if (page === 'home') {
      home();
      await updateCover();
    } else if (page === 'discipline') await (await import('/multidiscipline/js/discipline.js')).directoryPage();
    else if (page === 'disciplina') focusOnArrival = await (await import('/multidiscipline/js/discipline.js')).disciplinePage(...parts);"""),
    (r"^(?:materiale\/|prova\/|studio\/diario(?:\/|$))", r"^(?:disciplina\/|discipline$|materiale\/|prova\/|studio(?:\/|$))"),
)
_ACCOUNT = (
    ("  const recent = s.lastRuns.filter((r) => !r.finished);",
     "  const recent = s.lastRuns.filter((r) => !r.finished);\n"
     "  const additional = await (await import('/multidiscipline/js/discipline.js')).disciplineNotebookLinks().catch(() => '');"),
    ("${link('Diario degli errori', 'studio/diario')}",
     "${link('Quaderno delle materie', 'discipline')}${link('Diario degli errori', 'studio/diario')}"),
    ("${owned.length ? owned.map(", "${owned.length || additional ? additional + owned.map("),
    ("crumb([['Percorsi', 'percorsi'], [c.title, 'corso/' + id], ['Accesso']])",
     "crumb([c.disciplineRoute ? ['Materie', 'discipline'] : ['Percorsi', 'percorsi'], "
     "[c.title, c.disciplineRoute || 'corso/' + id], ['Accesso']])"),
    ("data.owned ? link('Apri il percorso', 'corso/' + id)",
     "data.owned ? link('Apri il percorso', c.disciplineRoute || 'corso/' + id)"),
    ("</p>${state.courses\n      .map(\n        (course) =>",
     "</p>${state.courses.concat(a.disciplineCourses || [])\n      .map(\n        (course) =>"),
)
_CHANGES = {"index.html": _INDEX, "js/app.js": _APP, "js/account.js": _ACCOUNT}


def _resolve_import(match):
    prefix, quote, name, _ = match.groups()
    # A shared module has a single browser URL and therefore a single ES module instance.
    directory = _EXTENSION if name == "account.js" else "/js/"
    return prefix + quote + directory + name + quote


@lru_cache(maxsize=3)
def compose_asset(name: str) -> bytes:
    """Read the current legacy sources, apply each named hook exactly once, and leave the sources intact."""
    changes = _CHANGES[name]
    source = (_STATIC / name).read_text(encoding="utf-8")
    for anchor, replacement in changes:
        if source.count(anchor) != 1:
            raise ValueError(f"Frontend hook in {name} needs review: {anchor[:70]!r}")
        source = source.replace(anchor, replacement, 1)
    if name.endswith(".js"):
        source = _SHARED_IMPORT.sub(_resolve_import, source)
    if name == "js/app.js":
        source = "import { updateCover, updateSearch } from '/multidiscipline/js/discipline-ingresso.js';\n" + source
    return source.encode("utf-8")


# Only these browser assets are accessible on HTTP and included in the static hosting output.
FILES = ("discipline.css", "js/discipline-ingresso.js", "js/discipline.js", "js/discipline-grafici.js",
         "js/discipline-pratica.js", "js/discipline-esame.js")
PUBLIC_ASSETS = (*_CHANGES, *FILES)


def public_asset(name: str) -> bytes:
    if name in _CHANGES:
        return compose_asset(name)
    if name in FILES:
        return (Path(__file__).resolve().parent / "static" / name).read_bytes()
    raise KeyError(name)
