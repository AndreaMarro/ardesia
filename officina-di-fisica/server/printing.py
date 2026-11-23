"""Print published snapshots in a private temporary directory using Chromium."""

import base64
import hashlib
import html
import os
import re
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path

from .store import DATA, ROOT, Problem, connect, digest, encode, in_course, require

JOBS = {}
LOCK = threading.Lock()
BOOKS = {
    "dispensa": "Dispensa ragionata",
    "esercizi": "Esercizi e soluzioni",
    "simulazioni": "Tre simulazioni di Fisica",
}
BRAND_MARK = ROOT / "static" / "identita" / "segno.svg"
TYPE_DIR = ROOT / "static" / "type"
PRINT_ASSETS = (
    BRAND_MARK,
    TYPE_DIR / "worksans2.woff2",
    TYPE_DIR / "baskervville1.woff2",
    TYPE_DIR / "baskervville0.woff2",
)


def titles(course):
    return (
        ["dispensa", "esercizi", "simulazioni"]
        if course == "C6"
        else ["dispensa", "esercizi"]
    )


def selection(rows, c, book):
    require(book in titles(c), "Fascicolo non valido.")
    # C6 links the five sets. Only its additional materials are printed again.
    kinds = ("lesson", "example", "lab") if book == "dispensa" else ("question",)
    data = [
        r
        for r in in_course(rows, c)
        if r["kind"] in kinds
        and (c != "C6" or r["course"] == "C6")
        and bool(r.get("exam")) == (book == "simulazioni")
    ]
    return data


def fingerprint(rows, c, b):
    data = selection(rows, c, b)
    course = next((r for r in rows if r["id"] == c and r["kind"] == "course"), None)
    require(course, "Corso non disponibile.", 404)
    # Asset paths are content-addressed for author uploads. Built-in figures ship with the edition.
    by_id = {r["id"]: r for r in rows}
    dependencies = {r["id"]: r for r in data}
    for r in data:
        for block in r["blocks"] + r.get("promptBlocks", []):
            linked = by_id.get(block.get("ref"))
            if linked:
                dependencies[linked["id"]] = linked
    figs = sorted(
        {
            bl["src"]
            for r in dependencies.values()
            for bl in r["blocks"] + r.get("promptBlocks", [])
            if bl.get("src", "").startswith("/figures/")
        }
    )
    figures = [
        hashlib.sha256((ROOT / "static" / f[1:]).read_bytes()).hexdigest() for f in figs
    ]
    return digest(
        encode(
            [
                16,
                [
                    hashlib.sha256(f.read_bytes()).hexdigest() if f.is_file() else None
                    for f in PRINT_ASSETS
                ],
                short_course(course),
                [
                    (
                        r["id"],
                        r["version"],
                        digest(encode({k: v for k, v in r.items() if k != "review"})),
                    )
                    for r in dependencies.values()
                ],
                figures,
            ]
        )
    )[:24]


def short_course(c):
    return [c["id"], c["title"], c.get("summary", "")]


def locate(rows, c, b):
    stamp = fingerprint(rows, c, b)
    for root in (DATA / "pdf", ROOT / "materials"):
        f = root / (c + "-" + b + ".pdf")
        m = f.with_suffix(".stamp")
        if f.is_file() and m.is_file() and m.read_text().strip() == stamp:
            return f
    return None


def chrome():
    candidates = [
        os.environ.get("ASTRA_CHROME"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        shutil.which("chrome"),
    ]
    for p in candidates:
        if p and Path(p).is_file():
            return p
    raise Problem("Installa Chrome/Chromium o indica l’eseguibile con ASTRA_CHROME.")


esc = lambda s: html.escape(str(s), quote=True)


def prose(value):
    """Typeset conventional inline indices such as R_h while preserving editable text."""
    return re.sub(
        r"(?<![\w./-])([A-Za-zΑ-ω])_([A-Za-z0-9]{1,8})(?![\w/])",
        r"\1<sub>\2</sub>",
        esc(value),
    )


def blocks(blocks_, rows=(), level=0):
    out = []
    for b in blocks_:
        text = esc(b.get("text", ""))
        t = b["type"]
        if t == "formula":
            out.append('<div class="math">' + text + "</div>")
        elif t == "figure":
            src = b.get("src", "")
            file = (
                ROOT / "static" / src[1:]
                if src.startswith("/figures/")
                else DATA / "uploads" / Path(src).name
            )
            if file.is_file():
                if src.startswith("/asset/"):
                    with connect() as db:
                        mime = db.execute(
                            "SELECT mime FROM assets WHERE id=?", (Path(src).name,)
                        ).fetchone()[0]
                else:
                    mime = "image/svg+xml"
                url = (
                    "data:"
                    + mime
                    + ";base64,"
                    + base64.b64encode(file.read_bytes()).decode()
                )
                out.append(
                    '<figure><img src="'
                    + url
                    + '" alt="'
                    + text
                    + '"><figcaption>'
                    + text
                    + "</figcaption></figure>"
                )
        elif t == "attachment":
            out.append("<p><b>Allegato in piattaforma</b> · " + text + "</p>")
        elif t in ("lab", "example", "question"):
            ref = next((r for r in rows if r["id"] == b.get("ref")), None)
            if ref:
                out.append(
                    "<p><b>" + esc(ref["title"]) + "</b> · " + esc(ref["id"]) + "</p>"
                )
                if level == 0:
                    out.append(blocks(ref["blocks"], rows, 1))
        else:
            out.append("<p>" + prose(b.get("text", "")).replace("\n", "<br>") + "</p>")
    return "".join(out)


CSS = """
@font-face {
  font-family: Officina Work;
  src: url("__TYPE__/worksans2.woff2") format("woff2");
  font-weight: 100 900;
}
@font-face {
  font-family: Officina Baskervville;
  src: url("__TYPE__/baskervville1.woff2") format("woff2");
  font-weight: 400 700;
}
@font-face {
  font-family: Officina Baskervville;
  src: url("__TYPE__/baskervville0.woff2") format("woff2");
  font-weight: 400 700;
  font-style: italic;
}
@page {
  size: A4;
  margin: 16mm 18mm 18mm;
  @top-left {
    content: __RUNNING_COURSE__;
    font: 7.5pt "Officina Work", Arial, sans-serif;
    color: #594b65;
  }
  @top-right {
    content: __RUNNING_BOOK__;
    font: 7.3pt Menlo, "DejaVu Sans Mono", monospace;
    color: #594b65;
  }
  @bottom-left {
    content: "Andrea Marro 3461653930 se serve chiedi!";
    font: 8.5pt "Officina Work", Arial, sans-serif;
    color: #221c30;
  }
  @bottom-right {
    content: counter(page);
    font: 750 9pt "Officina Work", Arial, sans-serif;
    color: #5936ae;
  }
}
@page :first { @top-left { content: none; } @top-right { content: none; } }
* { box-sizing: border-box; }
:root {
  --ink: #221c30;
  --violet: #5936ae;
  --lime: #dced4d;
  --butter: #f8f5ea;
  --lavender: #e4dcfa;
  --rule: #b8adc9;
  --sans: "Officina Work", Arial, sans-serif;
  --serif: "Officina Baskervville", Georgia, serif;
  --mono: Menlo, "DejaVu Sans Mono", monospace;
}
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: var(--ink); font: 11.35pt/1.39 var(--serif); }
p { margin: 1.9mm 0; orphans: 3; widows: 3; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4 { margin: 0; line-height: 1.08; break-after: avoid; }
.start, .sheet-head, .index-entry { break-inside: avoid; }
.new-page { break-before: page; }
.mast {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2.2mm 0; border-top: 2.3pt solid var(--ink); border-bottom: .65pt solid var(--ink);
}
.mast-brand { display: flex; align-items: center; gap: 2.5mm; font: 800 12pt/1 var(--sans); letter-spacing: -.035em; }
.mast-brand img { width: 10mm; height: 8.5mm; object-fit: contain; }
.mast-author { font: 9pt/1.1 var(--mono); }
.title-lockup {
  display: grid; grid-template-columns: minmax(0,1fr) 27mm; gap: 6mm;
  align-items: start; padding: 6mm 0 4mm;
}
h1 { font: 850 35.5pt/.99 var(--sans); letter-spacing: -.035em; text-wrap: balance; }
.bookname { margin: 2.5mm 0 0; color: var(--violet); font: italic 20pt/1.05 var(--serif); }
.course-code {
  display: block; margin: 1mm 1mm 0 0; padding: 3.4mm 0 4.3mm;
  color: var(--ink); background: var(--lime); border: 1pt solid var(--ink);
  box-shadow: 1.4mm 1.4mm 0 var(--ink); text-align: center;
  font: 850 25pt/.94 var(--sans); letter-spacing: -.05em; transform: rotate(-3deg);
}
.description { max-width: 153mm; margin: 0 0 2.2mm; font: 11.4pt/1.3 var(--serif); }
.book-details { margin: 0; font: 600 8.4pt/1.4 var(--sans); }
.cross-note { margin: 1mm 0 0; font: 9.4pt/1.3 var(--sans); }
.contents { margin: 5mm 0 5mm; padding: 3mm 4mm 2.4mm; background: var(--butter); border: .65pt solid var(--ink); }
.index-title {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 2mm; padding-bottom: 1.2mm; border-bottom: 1.05pt solid var(--ink);
}
.index-title h2 { font: 780 16pt/1.08 var(--sans); letter-spacing: -.045em; }
.index-title span { font: 7.6pt/1.1 var(--mono); color: #49395b; }
.index-list { margin: 0; padding: 0; list-style: none; column-count: 2; column-gap: 6mm; }
.index-list.single { column-count: 1; }
.index-entry { margin: 0; padding: 0; }
.index-entry a {
  display: flex; justify-content: space-between; align-items: baseline; gap: 1.6mm;
  padding: 1.05mm 0 1.15mm; border-bottom: .45pt solid #d0c8ba;
  font: 9pt/1.15 var(--sans);
}
.folio { flex: 0 0 6mm; text-align: right; font: 650 8pt/1.15 var(--mono); color: var(--violet); }
.index-table { width: 100%; border-collapse: collapse; text-align: left; }
.index-table thead { font: 650 8pt/1.1 var(--sans); color: #49395b; }
.index-table th { font-weight: inherit; }
.index-table tbody { font: 9pt/1.15 var(--sans); }
.index-table td, .index-table th { padding: .9mm 0; border-bottom: .45pt solid #d0c8ba; }
.index-table :is(td, th):nth-child(n+2) { width: 19mm; text-align: right; }
.index-table .folio { display: block; min-height: 3mm; }
.chapter {
  display: flex; align-items: baseline; gap: 2.6mm; padding-top: 2.2mm;
  margin: 6.3mm 0 2.3mm; border-top: 1.65pt solid var(--ink);
  font: 790 20pt/1.05 var(--sans); letter-spacing: -.025em;
}
.chapter::before {
  content: ""; display: inline-block; flex: 0 0 4.4mm; height: 4.4mm;
  background: var(--violet); align-self: flex-start; margin-top: 1mm;
}
.chapter.solutions::before { background: var(--lime); border: .8pt solid var(--ink); }
h3 { margin: 4.4mm 0 1.2mm; color: var(--violet); font: 730 15.6pt/1.1 var(--sans); letter-spacing: -.02em; }
h4 { font: 740 11pt/1.1 var(--sans); letter-spacing: -.025em; }
.caption-id { display: flex; align-items: center; gap: 2.3mm; margin: 0 0 1.3mm; }
.qid { color: #594b65; font: 7.6pt/1.15 var(--mono); white-space: nowrap; }
.kind-label { color: var(--ink); background: var(--lavender); padding: .45mm 1.6mm; font: 660 7.3pt/1.15 var(--sans); }
.qhead {
  display: flex; align-items: center; gap: 2.3mm; margin: 3.2mm 0 1.3mm;
  padding: 1.1mm 0 1mm; border-top: .6pt solid var(--rule);
}
.qhead h4 { color: var(--ink); }
.qhead .qid { margin-left: auto; }
.lead { font: 575 10.8pt/1.32 var(--sans); text-wrap: pretty; break-after: avoid; }
.axis-note { margin: 1.1mm 0; font: 8.1pt/1.3 var(--sans); color: #4e435e; }
.response-field { display: flex; align-items: baseline; gap: 3mm; margin: 1.8mm 0 1.4mm; min-height: 4.5mm; }
.write-in { display: inline-block; flex: 0 0 40mm; height: 3.3mm; border-bottom: .65pt solid #695e75; }
.word-slot { color: #695e75; white-space: nowrap; font: 400 .9em var(--mono); letter-spacing: -.035em; }
sub { font-size: .74em; line-height: 0; vertical-align: -.22em; }
ol.options { list-style: upper-alpha; padding-left: 7.4mm; margin: 1.2mm 0 2mm; }
ol.options li { margin: .75mm 0; padding-left: .8mm; font-size: 10.75pt; line-height: 1.26; }
ol.options li::marker { color: var(--violet); font: 700 8.7pt var(--mono); }
.solution-title { color: var(--ink); }
.solution-title .solution-index { font: italic 1em var(--serif); color: var(--violet); }
.answer {
  margin: 2.2mm 0 2.8mm; padding: 1.5mm 2.4mm; border-left: 2pt solid var(--ink);
  background: #f3f5d8; font: 10.3pt/1.3 var(--sans);
}
.answer b { font-weight: 780; }
.math { break-inside: avoid; margin: 1.4mm 0; padding: .9mm 0; border-left: 1.4pt solid #c8b5e9; font-size: 11.15pt; }
.katex-display { margin: .25em 0 !important; white-space: normal !important; }
.katex-display > .katex { white-space: normal !important; }
figure { break-inside: avoid; margin: 3.4mm auto; max-width: 96%; text-align: center; }
figure img { display: block; max-width: 100%; max-height: 62mm; margin: 0 auto; }
figcaption {
  margin: 1.2mm auto 0; padding-top: 1mm; border-top: .55pt solid var(--rule);
  max-width: 142mm; text-align: left; font: 8.7pt/1.32 var(--sans); color: #3b3346;
}
.lab-step b { color: var(--violet); font: 720 10.1pt/1.25 var(--sans); }
"""


def document(rows, c, book, folios=None):
    data = selection(rows, c, book)
    course = next(r for r in rows if r["id"] == c)
    content = []
    toc = []

    def section(title, new_page=False, solutions=False):
        key = "s" + str(len(toc))
        toc.append((key, title))
        cls = (
            "chapter"
            + (" new-page" if new_page else "")
            + (" solutions" if solutions else "")
        )
        content.append(
            '<h2 class="' + cls + '" id="' + key + '">' + esc(title) + "</h2>"
        )

    def prompt(q):
        a = q.get("answer", {})
        wording = prose(q.get("prompt", ""))
        inline_slot = a.get("type") == "text" and bool(re.search(r"_{3,}", wording))
        if inline_slot:
            wording = re.sub(
                r"_{3,}", '<span class="word-slot">________________</span>', wording
            )
        s = (
            '<p class="lead">'
            + wording
            + "</p>"
            + blocks(q.get("promptBlocks", []), rows)
        )
        if a.get("type") == "choice":
            s += (
                '<ol class="options">'
                + "".join("<li>" + esc(opt) + "</li>" for opt in a["options"])
                + "</ol>"
            )
        if a.get("type") == "numeric":
            unit = a.get("unit", "")
            s += (
                '<div class="response-field"><span class="write-in" aria-hidden="true"></span><span class="axis-note">'
                + (
                    "Rispondi in " + esc(unit)
                    if unit and unit != "1"
                    else "Rispondi con un numero adimensionale"
                )
                + " · tolleranza assoluta ±"
                + esc(str(a.get("tolerance", 0)).replace(".", ","))
                + "</span></div>"
            )
        if a.get("type") == "text" and q["kind"] == "question" and not inline_slot:
            s += '<div class="response-field"><span class="axis-note">Risposta</span><span class="write-in" aria-hidden="true"></span></div>'
        return s

    def example(r, nested=True):
        title = "<h3>" + esc(r["title"]) + "</h3>" if nested else ""
        return (
            '<div class="start">'
            + title
            + '<div class="caption-id">'
            + '<span class="kind-label">Esempio guidato</span><span class="qid">'
            + esc(r["id"])
            + "</span></div>"
            + prompt(r)
            + "</div>"
            + blocks(r["blocks"], rows)
        )

    if book == "dispensa":
        lessons = [r for r in data if r["kind"] == "lesson"]
        lesson_ids = {r["id"] for r in lessons}
        for l in lessons:
            section(l["title"])
            content.append(blocks(l["blocks"], rows))
            for e in data:
                if e["kind"] == "example" and e["skill"] == l["id"]:
                    content.append(example(e))
        for r in data:
            if r["kind"] == "example" and r["skill"] not in lesson_ids:
                section(r["title"])
                content.append(example(r, nested=False))
            if r["kind"] == "lab":
                content.append('<div class="start">')
                section(r["title"])
                content.append(
                    blocks(r["blocks"], rows)
                    + '<div class="start">'
                    + "".join(
                        '<p class="lab-step"><b>'
                        + a
                        + "</b> · "
                        + esc(r.get(k, ""))
                        + "</p>"
                        for k, a in [
                            ("prediction", "Previsione"),
                            ("observation", "Osservazione"),
                            ("interpretation", "Interpretazione"),
                        ]
                    )
                    + "</div>"
                )
                content.append("</div>")
    else:
        groups = {}
        for q in data:
            groups.setdefault(
                "Simulazione " + str(q["exam"]) if q.get("exam") else q["section"], []
            ).append(q)
        for group_index, (title, qs) in enumerate(groups.items()):
            section(title, new_page=book == "simulazioni" and group_index > 0)
            if book == "simulazioni":
                content.append(
                    "<p>50 minuti · 21 scelte e 10 completamenti · +1 corretta, −0,1 errata, 0 omessa. Completa il fascicolo prima di consultare le soluzioni.</p>"
                )
            for i, q in enumerate(qs, 1):
                content.append(
                    '<div class="start"><div class="qhead"><h4>Quesito '
                    + str(i)
                    + '</h4><span class="qid">'
                    + esc(q["id"])
                    + "</span></div>"
                    + prompt(q)
                    + "</div>"
                )
        for group_index, (title, qs) in enumerate(groups.items()):
            section(
                "Soluzioni · " + title,
                new_page=book == "simulazioni" and group_index == 0,
                solutions=True,
            )
            for i, q in enumerate(qs, 1):
                last_solution = group_index == len(groups) - 1 and i == len(qs)
                answer = q["answer"]
                label = str(answer["value"])
                if answer["type"] == "numeric":
                    label = label.replace(".", ",")
                    if answer.get("unit") not in ("", "1", None):
                        label += " " + answer["unit"]
                content.append(
                    ('<article class="start">' if last_solution else "<article>")
                    + '<div class="start"><h3 class="solution-title"><span class="solution-index">'
                    + str(i)
                    + "</span> · "
                    + esc(q["title"])
                    + '</h3><div class="caption-id"><span class="qid">'
                    + esc(q["id"])
                    + "</span></div><p>"
                    + prose(q["prompt"])
                    + "</p></div>"
                    + blocks(q.get("promptBlocks", []), rows)
                    + blocks(q["blocks"][:-1], rows)
                    + '<div class="start">'
                    + blocks(q["blocks"][-1:], rows)
                    + '<p class="answer"><b>Risposta</b> · '
                    + esc(label)
                    + "</p></div></article>"
                )
    vendor = (ROOT / "static" / "vendor").as_uri()

    def counted(n, singular, plural):
        return str(n) + " " + (singular if n == 1 else plural)

    def folio(key):
        value = (folios or {}).get(key)
        return str(value) if value is not None else "Vai"

    if book == "dispensa":
        details = []
        for kind, singular, plural in [
            ("lesson", "lezione", "lezioni"),
            ("example", "esempio guidato", "esempi guidati"),
            ("lab", "laboratorio", "laboratori"),
        ]:
            n = sum(r["kind"] == kind for r in data)
            if n:
                details.append(counted(n, singular, plural))
        index = '<ol class="index-list' + (" single" if len(toc) < 2 else "") + '">'
        for key, title in toc:
            index += (
                f'<li class="index-entry"><a href="#{key}"><span>{esc(title)}</span>'
                f'<span class="folio">{folio(key)}</span></a></li>'
            )
        index += "</ol>"
    else:
        number_groups = len(groups)
        details = [
            counted(number_groups, "prova", "prove")
            if book == "simulazioni"
            else counted(number_groups, "sezione", "sezioni"),
            counted(len(data), "quesito con svolgimento", "quesiti con svolgimento"),
        ]
        index = (
            '<table class="index-table"><thead><tr><th scope="col">Argomento</th>'
            '<th scope="col">Quesiti</th><th scope="col">Soluzioni</th></tr></thead><tbody>'
        )
        for (questions, title), (solutions, _) in zip(
            toc[:number_groups], toc[number_groups:]
        ):
            label = esc(title)
            index += (
                f'<tr><th scope="row"><a href="#{questions}">{label}</a></th>'
                f'<td><a class="folio" href="#{questions}" aria-label="Quesiti · {label}">{folio(questions)}</a></td>'
                f'<td><a class="folio" href="#{solutions}" aria-label="Soluzioni · {label}">{folio(solutions)}</a></td></tr>'
            )
        index += "</tbody></table>"

    brand = (
        '<img src="' + esc(BRAND_MARK.as_uri()) + '" alt="">'
        if BRAND_MARK.is_file()
        else ""
    )
    first = (
        '<header class="sheet-head"><div class="mast"><div class="mast-brand">'
        + brand
        + 'Officina di Fisica</div><span class="mast-author">Andrea Marro</span></div>'
        '<div class="title-lockup"><div><h1>'
        + esc(course["title"])
        + '</h1><p class="bookname">'
        + esc(BOOKS[book])
        + '</p></div><span class="course-code">'
        + esc(c)
        + "</span></div>"
        '<p class="description">'
        + esc(course.get("summary", ""))
        + '</p><p class="book-details">'
        + " · ".join(details)
        + "</p>"
    )
    if c == "C6":
        first += '<p class="cross-note">Per i singoli moduli consulta le cinque dispense e i cinque eserciziari tematici.</p>'
    first += (
        '</header><nav class="contents" aria-label="Indice"><div class="index-title"><h2>Indice</h2>'
        + ("<span>pagina</span>" if folios else "")
        + "</div>"
        + index
        + "</nav>"
    )

    def css_string(value):
        # Hex escapes keep editable titles inside their CSS string and style element.
        return '"' + "".join("\\" + format(ord(ch), "x") + " " for ch in value) + '"'

    style = (
        CSS.replace("__TYPE__", TYPE_DIR.as_uri())
        .replace("__RUNNING_COURSE__", css_string(c + "  /  " + course["title"]))
        .replace("__RUNNING_BOOK__", css_string(BOOKS[book]))
    )
    return (
        '<!doctype html><html lang="it"><meta charset="utf-8"><title>'
        + esc(course["title"])
        + " · "
        + esc(BOOKS[book])
        + '</title><link rel="stylesheet" href="'
        + vendor
        + '/katex.min.css"><style>'
        + style
        + "</style><body>"
        + first
        + "".join(content)
        + '<script src="'
        + vendor
        + '/katex.min.js"></script><script>for(const el of document.querySelectorAll(".math")){katex.render(el.textContent,el,{displayMode:true,throwOnError:false,strict:false})}</script></body></html>'
    )


def destination_pages(pdf):
    """Read the page tree and the local section destinations written by Chromium/Skia."""
    data = pdf.read_bytes()
    root = re.search(rb"/Type\s*/Catalog\s*/Pages\s+(\d+) 0 R", data)
    if root:
        nodes = {}
        for obj, refs in re.findall(
            rb"(?m)^(\d+) 0 obj\s*<<\s*/Type /Pages\s*/Count \d+\s*/Kids\s*\[([^\]]+)\]",
            data,
        ):
            nodes[obj] = re.findall(rb"(\d+) 0 R", refs)
        pages = {}
        stack = [root[1]]
        while stack:
            obj = stack.pop()
            if obj in nodes:
                stack.extend(reversed(nodes[obj]))
            else:
                pages[obj] = len(pages) + 1
        anchors = re.findall(rb"/(s\d+)\s*\[\s*(\d+) 0 R\s*/XYZ", data)
        if anchors and all(obj in pages for _, obj in anchors):
            return {key.decode("ascii"): pages[obj] for key, obj in anchors}

    # Poppler also supports PDF layouts that future Chromium releases might emit.
    reader = shutil.which("pdfinfo")
    if reader:
        result = subprocess.run(
            [reader, "-dests", str(pdf)], capture_output=True, timeout=30
        )
        if result.returncode == 0:
            return {
                key.decode("ascii"): int(page)
                for page, key in re.findall(
                    rb'(?m)^\s*(\d+)\s+\[[^\]]+\]\s+"(s\d+)"', result.stdout
                )
            }
    return {}


def generate(rows, c, b, dest):
    stamp = fingerprint(rows, c, b)
    require(
        selection(rows, c, b), "Il fascicolo non contiene ancora materiali pubblicati."
    )
    dest.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=dest) as wd:
        w = Path(wd)
        source = w / "volume.html"
        out = w / "volume.pdf"
        command = [
            chrome(),
            "--headless=new",
            "--disable-gpu",
            "--disable-background-networking",
            "--disable-extensions",
            "--user-data-dir=" + str(w / "chrome"),
            "--allow-file-access-from-files",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=3500",
            "--print-to-pdf=" + str(out),
            source.as_uri(),
        ]

        def render(folios=None):
            source.write_text(document(rows, c, b, folios))
            out.unlink(missing_ok=True)
            subprocess.run(
                command,
                timeout=120,
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            require(
                out.exists() and out.stat().st_size > 3000,
                "Esportazione PDF interrotta.",
            )

        # A short handout often starts and ends on page one. Trust only the
        # destinations in the PDF just produced, including after repagination.
        folios = {"s0": 1}
        for _ in range(3):
            render(folios)
            measured = destination_pages(out)
            if measured == folios:
                break
            if not measured:
                render()
                break
            folios = measured
        else:
            # Keep the section links if the browser cannot produce stable numbers.
            render()
        out.replace(dest / (c + "-" + b + ".pdf"))
        marker = w / "stamp"
        marker.write_text(stamp)
        marker.replace(dest / (c + "-" + b + ".stamp"))
    return stamp


def queue(rows, c, b):
    fingerprint(rows, c, b)
    key = c + "-" + b
    with LOCK:
        if JOBS.get(key) == "in lavorazione":
            return {"state": JOBS[key]}
        JOBS[key] = "in lavorazione"

    def task():
        try:
            generate(rows, c, b, DATA / "pdf")
            JOBS[key] = "pronto"
        except Exception as e:
            JOBS[key] = "errore · " + str(e)

    threading.Thread(target=task, daemon=True).start()
    return {"state": "in lavorazione"}


def status(rows):
    return [
        {
            "course": r["id"],
            "book": b,
            "title": BOOKS[b],
            "ready": bool(locate(rows, r["id"], b)),
            "job": JOBS.get(r["id"] + "-" + b, ""),
        }
        for r in rows
        if r["kind"] == "course"
        for b in titles(r["id"])
    ]
