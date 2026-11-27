"""Compose the Cric entry points without copying or editing the signed physics client."""

from functools import lru_cache
from pathlib import Path
import re
from .resource_frontend import resource_bench_asset


_STATIC = Path(__file__).resolve().parent.parent / "static"
_EXTENSION = "/multidiscipline/js/"
_SHARED_IMPORT = re.compile(r"""(\bfrom\s+|\bimport\(\s*)(['"])\./([^'"]+)(\2)""")

_INDEX = (
    ("I sei percorsi di Fisica per Medicina di Andrea Marro. Lezioni, problemi guidati, laboratori e simulazioni del semestre aperto.",
     "Cric, l’officina di studio di Andrea Marro. Percorsi universitari, lezioni, problemi svolti e laboratori."),
    ("<title>Officina di Fisica ·", "<title>Cric ·"),
    ('    <script defer src="/vendor/katex.min.js">',
     '    <link rel="stylesheet" href="/multidiscipline/discipline.css" />\n'
     '    <link rel="stylesheet" href="/multidiscipline/risorse.css" />\n    <script defer src="/vendor/katex.min.js">'),
    ('type="module" src="/js/app.js"', 'type="module" src="/multidiscipline/js/app.js"'),
    ("<strong>Officina di Fisica</strong>", "<strong>Cric</strong>"),
    ('<a class="mast-search" href="#percorsi/cerca">Cerca</a>',
     '<div class="mast-tools"><a class="mast-search" href="#percorsi/cerca" title="Cerca nei percorsi di Fisica">Cerca</a></div>'),
    ('<a href="#percorsi">Percorsi</a><a href="#sprint">Esame rapido</a><a href="#laboratori">Simulazioni 3D</a\n          ><a href="#studio">Il mio studio</a>',
     '<a href="#studio">Il mio studio</a><a href="#discipline">Percorsi</a><a href="#risorse">Risorse</a>'),
    ("<span>Officina di Fisica <i>/", "<span>Cric <i>/"),
)
_APP = (
    ("    corso: 'percorsi', materiale: 'percorsi', acquisto: 'percorsi', allenamento: 'percorsi',",
     "    percorsi: 'discipline', corso: 'discipline', materiale: 'discipline', acquisto: 'discipline', allenamento: 'discipline', laboratori: 'risorse',"),
    ("    prova: 'studio', lab: 'laboratori', banco: 'laboratori',", "    disciplina: 'discipline', strumento: 'risorse', caso: 'risorse', raccolte: 'risorse', raccolta: 'risorse', condivisione: 'risorse', prova: 'studio', lab: 'risorse', banco: 'risorse',"),
    ("  for (const a of document.querySelectorAll('.mast nav a')) {",
     "  updateSearch(page, parts[0]);\n  for (const a of document.querySelectorAll('.mast nav a, .mast-tools a')) {"),
    ("    if (page === 'home') home();", """    if (page === 'home') {
      home();
      await updateCover();
    } else if (page === 'discipline') await (await import('/multidiscipline/js/discipline.js')).directoryPage();
    else if (page === 'disciplina') focusOnArrival = await (await import('/multidiscipline/js/discipline.js')).disciplinePage(...parts);
    else if (['risorse', 'strumento', 'caso', 'raccolte', 'raccolta', 'condivisione'].includes(page)) {
      closePage = await (await import('/multidiscipline/js/risorse.js')).resourcePage(page, ...parts);
    }"""),
    (r"^(?:materiale\/|prova\/|studio\/diario(?:\/|$))",
     r"^(?:disciplina\/|discipline$|materiale\/|prova\/|studio(?:\/|$)|caso\/|raccolte$|raccolta\/|strumento\/|condivisione\/)"),
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
FILES = ("discipline.css", "risorse.css", "js/discipline-ingresso.js", "js/discipline.js", "js/discipline-grafici.js",
         "js/discipline-pratica.js", "js/discipline-esame.js", "js/risorse.js", "js/risorse-stato.js")
PUBLIC_ASSETS = (*_CHANGES, *FILES, "js/risorse-banco.js")


def public_asset(name: str) -> bytes:
    if name == "js/risorse-banco.js":
        return resource_bench_asset()
    if name in _CHANGES:
        return compose_asset(name)
    if name in FILES:
        return (Path(__file__).resolve().parent / "static" / name).read_bytes()
    raise KeyError(name)
