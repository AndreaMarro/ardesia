"""Audit A4 books against the editable edition with Poppler, without a student DB."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date
import hashlib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server.printing import BOOKS, fingerprint, selection, titles
from server.store import catalog_seed

FOOT = "Andrea Marro 3461653930 se serve chiedi!"
NS = {"p": "http://www.w3.org/1999/xhtml"}


def poppler(name, *args):
    return subprocess.run(
        [name, *map(str, args)], capture_output=True, check=True
    ).stdout


def words(text):
    norm = unicodedata.normalize("NFKC", text).casefold()
    norm = "".join(c for c in norm if unicodedata.category(c) != "Cf")
    # Poppler extracts a typeset subscript as an adjacent glyph, e.g. editable p_A → pA.
    norm = re.sub(r"\b([a-zα-ω])_([a-z0-9]{1,8})\b", r"\1\2", norm)
    return re.findall(r"[^\W_]+", norm)


def compact(text):
    norm = unicodedata.normalize("NFKC", text)
    return "".join(
        c for c in norm if not c.isspace() and unicodedata.category(c) != "Cf"
    )


def mark_pages(pages):
    if not pages:
        return "—"
    spans = []
    for v in sorted(set(pages)):
        if spans and v == spans[-1][1] + 1:
            spans[-1][1] = v
        else:
            spans.append([v, v])
    return ", ".join(str(i) if i == j else f"{i}–{j}" for i, j in spans)


def ink_extent(file, page):
    """Measure body ink including graphics on candidate sparse pages."""
    data = poppler(
        "pdftoppm",
        "-singlefile",
        "-gray",
        "-scale-to",
        "300",
        "-f",
        page,
        "-l",
        page,
        file,
    )
    m = re.match(rb"P5\s+(\d+)\s+(\d+)\s+255\s", data)
    if not m:
        raise RuntimeError("Raster PGM inatteso")
    w, h = map(int, m.groups())
    pix = data[m.end() :]
    if len(pix) != w * h:
        raise RuntimeError("Raster PGM incompleto")
    top, bot, left, right = int(h * 0.03), int(h * 0.935), int(w * 0.035), int(w * 0.97)
    rows = []
    for y in range(top, bot):
        if sum(v < 214 for v in pix[y * w + left : y * w + right]) >= 3:
            rows.append(y)
    return (rows[-1] - rows[0] + 1) / (bot - top) if rows else 0


def check_index(file, group, book):
    """Compare actual link annotations, visible folios and named destination pages."""
    dest_output = poppler("pdfinfo", "-dests", file).decode()
    destinations = {
        key: int(number)
        for number, key in re.findall(
            r'(?m)^\s*(\d+)\s+\[[^\]]+\]\s+"(s\d+)"', dest_output
        )
    }
    if book == "dispensa":
        lessons = {r["id"] for r in group if r["kind"] == "lesson"}
        count = len(lessons) + sum(
            r["kind"] == "lab" or (r["kind"] == "example" and r["skill"] not in lessons)
            for r in group
        )
        order = list(range(count))
    else:
        groups = len(
            {r["exam"] if book == "simulazioni" else r["section"] for r in group}
        )
        order = [key for i in range(groups) for key in (i, i + groups)]
    expected = [destinations.get(f"s{i}") for i in order]
    last = destinations.get("s0", 1)
    xml = ET.fromstring(
        poppler("pdftohtml", "-q", "-xml", "-i", "-stdout", "-f", 1, "-l", last, file)
    )
    printed = []
    for page in xml.findall("page"):
        ink = {f.get("id"): f.get("color", "") for f in page.findall("fontspec")}
        for item in page.findall("text"):
            # Named destinations can sit next to digits belonging to section titles.
            # Only linked numbers printed in the violet folio ink belong to the index.
            color = ink.get(item.get("font"), "")
            if (
                not re.fullmatch(r"#[0-9a-fA-F]{6}", color)
                or int(color[5:7], 16) - int(color[1:3], 16) < 40
            ):
                continue
            for link in item.iter("a"):
                label = "".join(link.itertext()).strip()
                target = link.get("href", "").rpartition("#")[2]
                if label.isdecimal() and target.isdecimal():
                    printed.append((int(label), int(target)))
    correct = sum(p == (n, n) for p, n in zip(printed, expected))
    valid = len(destinations) == len(expected) == len(printed) and correct == len(
        expected
    )
    return correct, len(expected), valid


def inspect(rows, course, book):
    f = ROOT / "materials" / f"{course}-{book}.pdf"
    group = selection(rows, course, book)
    R = {
        "file": f.name,
        "pages": 0,
        "items": 0,
        "solutions": 0,
        "ids": 0,
        "foot": 0,
        "a4": 0,
        "bad": [],
        "bounds": [],
        "sparse": [],
        "characters": [],
        "blank": [],
        "anchors": [],
        "orphans": [],
        "fontmap": True,
        "index": 0,
        "index_total": 0,
        "running": 0,
        "choice_pages": 0,
        "keys_with_prose": 0,
        "fresh": False,
    }
    if not f.exists():
        R["bad"].append("File assente.")
        return R
    marker = f.with_suffix(".stamp")
    R["fresh"] = marker.exists() and marker.read_text().strip() == fingerprint(
        rows, course, book
    )
    if not R["fresh"]:
        R["bad"].append("Impronta precedente o assente.")
    info = poppler("pdfinfo", f).decode()
    raw_fonts = poppler("pdffonts", f).decode().splitlines()[2:]
    for family in ("WorkSans", "Baskervville-Regular", "Baskervville-Italic"):
        if not any(family in line for line in raw_fonts):
            R["bad"].append(f"Carattere editoriale assente ({family}).")
    R["index"], R["index_total"], valid_index = check_index(f, group, book)
    if not valid_index:
        R["bad"].append(
            "Discordanza fra pagine visibili nell’indice, collegamenti e destinazioni delle sezioni."
        )
    for line in raw_fonts:
        fields = line.split()
        if len(fields) < 7 or fields[-5] != "yes" or fields[-3] != "yes":
            R["fontmap"] = False
            R["bad"].append(
                "Font privo di incorporazione o mappa Unicode ("
                + line[:34].strip()
                + ")."
            )
    expected_n = int(re.search(r"^Pages:\s+(\d+)", info, re.M)[1])
    doc = ET.fromstring(poppler("pdftotext", "-enc", "UTF-8", "-bbox-layout", f, "-"))
    pages = doc.findall(".//p:page", NS)
    if len(pages) != expected_n:
        R["bad"].append("Conteggi di pagina incoerenti fra i due lettori Poppler.")
    R["pages"] = len(pages)
    raw = poppler("pdftotext", "-enc", "UTF-8", "-raw", f, "-").decode().split("\f")
    # Crop running matter and use positioned words, including spaces represented by glyph advances.
    full = poppler(
        "pdftotext",
        "-enc",
        "UTF-8",
        "-layout",
        "-r",
        72,
        "-x",
        0,
        "-y",
        36,
        "-W",
        596,
        "-H",
        765,
        f,
        "-",
    ).decode()
    body_pages = full.split("\f")
    course_title = next(r["title"] for r in rows if r["id"] == course)
    running_header = words(course + " " + course_title + " " + BOOKS[book])
    clean = " " + " ".join(words(full)) + " "
    for n, page in enumerate(pages, 1):
        w, h = float(page.get("width")), float(page.get("height"))
        if abs(w - 595.276) <= 1 and abs(h - 841.89) <= 1:
            R["a4"] += 1
        else:
            R["bad"].append(f"p. {n}, formato {w:.1f} × {h:.1f} pt.")
        footer = []
        header = []
        body = []
        for e in page.findall(".//p:word", NS):
            x, y, x2, y2 = [float(e.get(k)) for k in ("xMin", "yMin", "xMax", "yMax")]
            t = "".join(e.itertext())
            if y >= h - 43:
                footer.append((x, t))
            elif n > 1 and y2 <= 36:
                header.append((x, t))
            else:
                body.append((x, y, x2, y2, t))
        if n > 1:
            if words(" ".join(t for _, t in sorted(header))) == running_header:
                R["running"] += 1
            else:
                R["bad"].append(f"p. {n}, testatina diversa da corso e volume attesi.")
        ft = " ".join(txt for x, txt in sorted(footer))
        if ft == f"{FOOT} {n}":
            R["foot"] += 1
        else:
            R["bad"].append(f"p. {n}, piè di pagina o numero diverso dal modello.")
        if re.search(
            r"KaTeX parse error|Undefined control sequence|\bnotdef\b",
            raw[n - 1],
            re.I,
        ):
            R["bad"].append(
                f"p. {n}, testo diagnostico al posto di una formula o di un glifo."
            )
        repl = [c for c in ("�", "□", "▯", "\ufffc") if c in raw[n - 1]]
        if repl:
            R["characters"].append((n, ",".join("U+%04X" % ord(c) for c in repl)))
        out = [
            z
            for z in body
            if z[0] < 43.5 or z[2] > w - 43.5 or z[1] < 27 or z[3] > h - 42
        ]
        if out:
            samples = ", ".join(t for _, _, _, _, t in out[:6])
            R["bounds"].append(
                (
                    n,
                    samples,
                    round(min(t[0] for t in out), 1),
                    round(max(t[2] for t in out), 1),
                )
            )
            if any(
                x < 2 or x2 > w - 2 or y < 2 or y2 > h - 2 for x, y, x2, y2, t in out
            ):
                R["bad"].append(f"p. {n}, testo al bordo fisico del foglio.")
        if n > 1 and (len(body) < 75 or max((t[3] for t in body), default=0) < 208):
            extent = ink_extent(f, n)
            if extent < 0.02 and not any(t[4].strip() for t in body):
                R["blank"].append(n)
            elif extent < 0.18:
                R["sparse"].append(n)
                printed = " ".join(w[4] for w in body)
                if re.match(r"Risposta\s*[·:]", printed) and len(body) < 15:
                    R["orphans"].append((n, "sola chiave di risposta"))
                elif re.match(r"[B-E]\.\s", printed):
                    R["orphans"].append(
                        (n, "opzioni senza l’enunciato nella stessa pagina")
                    )
    if R["blank"]:
        R["bad"].append(
            "Pagine prive di corpo stampato " + mark_pages(R["blank"]) + "."
        )
    if R["characters"]:
        R["bad"].append("Caratteri di sostituzione o quadratini estratti.")
    samples = [
        r
        for r in group
        if r["kind"] == ("example" if book == "dispensa" else "question")
    ]
    R["items"] = len(samples)
    if book == "dispensa":
        for r in group:
            if (
                r["kind"] in ("lesson", "lab")
                and (" " + " ".join(words(r["title"])) + " ") not in clean
            ):
                R["bad"].append(f"Titolo assente ({r['id']}).")
    else:
        R["solutions"] = len(re.findall(r"(?m)^[ \t]*Risposta[ \t]*[·:]", full))
        if R["solutions"] != R["items"]:
            R["bad"].append(
                f"Chiavi esplicite {R['solutions']} su {R['items']} attese."
            )
    tails = []
    for r in samples:
        key = r["id"]
        hits = list(re.finditer(r"(?<![\w-])" + re.escape(key) + r"(?![\w-])", full))
        if len(hits) == (1 if book == "dispensa" else 2):
            R["ids"] += 1
        else:
            R["bad"].append(
                f"Conteggio anomalo dell’identificatore {key} ({len(hits)})."
            )
        if hits:
            tails.append((hits[-1].start(), r))
            if book != "dispensa" and r["answer"]["type"] == "choice":
                page_index = full.count("\f", 0, hits[0].start())
                current = body_pages[page_index].partition(key)[2]
                current = re.split(
                    r"(?m)^[ \t]*(?:Quesito \d+\b|Soluzioni ·)", current, maxsplit=1
                )[0]
                options = r["answer"]["options"]
                labels = list(re.finditer(r"(?m)^[ \t]*([A-Z])\.[ \t]+", current))[
                    -len(options) :
                ]
                if len(labels) == len(options) and all(
                    label[1] == chr(65 + i)
                    and compact(current[label.end() :]).startswith(compact(option))
                    for i, (label, option) in enumerate(zip(labels, options))
                ):
                    R["choice_pages"] += 1
                else:
                    R["orphans"].append(
                        (page_index + 1, f"alternative distanti dall’enunciato {key}")
                    )
    tails.sort(key=lambda z: z[0])
    for j, (start, r) in enumerate(tails):
        end = tails[j + 1][0] if j + 1 < len(tails) else len(full)
        seg = full[start:end]
        if book != "dispensa":
            keys = list(re.finditer(r"(?m)^[ \t]*Risposta[ \t]*[·:]", seg))
            if len(keys) != 1:
                R["bad"].append(f"Chiavi esplicite per {r['id']}: {len(keys)}.")
            elif r["blocks"] and r["blocks"][-1]["type"] == "text":
                last = " ".join(words(r["blocks"][-1]["text"])[-5:])
                on_page = (
                    " "
                    + " ".join(words(seg[: keys[0].start()].rsplit("\f", 1)[-1]))
                    + " "
                )
                if " " + last + " " in on_page:
                    R["keys_with_prose"] += 1
                else:
                    page = 1 + full.count("\f", 0, start + keys[0].start())
                    R["orphans"].append(
                        (page, f"chiave separata dall’ultimo passaggio di {r['id']}")
                    )
        seg = " " + " ".join(words(seg)) + " "
        prose = [words(b["text"]) for b in r["blocks"] if b["type"] == "text"]
        prose = [x for x in prose if len(x) >= 4]
        if prose:
            anchors = [prose[0][:5], prose[-1][-5:]]
            if any(" " + " ".join(s) + " " not in seg for s in anchors):
                R["anchors"].append(r["id"])
    return R


def report(results, edition):
    out = [
        "# Verifica dei PDF stampabili",
        "",
        f"Edizione verificata il {edition}. Le misure confrontano i PDF distribuiti con i record editoriali e le relative figure.",
        "",
        "| PDF | Pagine A4 | Piè di pagina e numero | Testatine interne | Pagine dell’indice | Esempi o quesiti rintracciati | Chiavi stampate | Impronta corrente |",
        "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for r in results:
        n = r["pages"]
        sol = "—" if "dispensa" in r["file"] else r["solutions"]
        out.append(
            f"| {r['file']} | {r['a4']}/{n} | {r['foot']}/{n} | {r['running']}/{max(n - 1, 0)} | {r['index']}/{r['index_total']} | {r['ids']}/{r['items']} | {sol} | {'sì' if r['fresh'] else 'da rigenerare'} |"
        )
    out += ["", "## Riscontri", ""]
    for r in results:
        details = list(r["bad"])
        if r["characters"]:
            details.append(
                "Pagine e caratteri "
                + ", ".join(f"{n} ({cd})" for n, cd in r["characters"])
                + "."
            )
        if r["bounds"]:
            details.append(
                "Testo oltre la fascia attesa alle pp. "
                + mark_pages([b[0] for b in r["bounds"]])
                + "."
            )
        if r["sparse"]:
            details.append(
                "Corpo che occupa meno del 18% dell’altezza utile alle pp. "
                + mark_pages(r["sparse"])
                + "."
            )
        if r["orphans"]:
            details.append(
                "Frammenti rilevati "
                + ", ".join(f"p. {n} ({label})" for n, label in r["orphans"])
                + "."
            )
        if r["anchors"]:
            details.append(
                "Ancoraggi testuali da riesaminare per " + ", ".join(r["anchors"]) + "."
            )
        if details:
            out.append("- **" + r["file"] + "**. " + " ".join(details))
    if out[-1] == "":
        out.append("Tutti i controlli automatici previsti sono superati.")
    out += [
        "",
        "## Metodo",
        "",
        "Poppler misura il formato e gli ingombri del testo su ogni pagina. Il controllo confronta testatina, piè di pagina e numero progressivo con i valori attesi. Cerca Work Sans e Baskervville nei file, compreso il corsivo, e verifica l’incorporazione e la mappa Unicode di tutti i caratteri usati. Cerca anche marcatori di errore di composizione e glifi sostitutivi.",
        "",
        "Per ciascuna voce dell’indice, pdftohtml estrae separatamente il numero stampato e la pagina di arrivo del collegamento. Il controllo li confronta entrambi con la destinazione della sezione riportata da pdfinfo. Negli eserciziari e nelle simulazioni il confronto si ripete per entrambe le colonne.",
        "",
        "Il conteggio dei materiali richiede una copia di ogni identificatore di esempio e due occorrenze di ogni identificatore di quesito, una nella prova e una nelle soluzioni. Sono censiti i titoli delle lezioni e dei laboratori, le chiavi di risposta e l’inizio e la fine delle spiegazioni.",
        "",
        f"Per {sum(r['choice_pages'] for r in results)} quesiti a scelta, il controllo ritrova tutte le alternative sulla pagina dell’enunciato. Per {sum(r['keys_with_prose'] for r in results)} svolgimenti che terminano con un paragrafo di testo, ritrova le ultime parole sulla stessa pagina della chiave.",
        "",
        "Le pagine potenzialmente scarne vengono rasterizzate per misurare anche l’inchiostro delle figure. È segnalato un corpo con un’estensione verticale inferiore al 18% dello spazio utile. L’indice iniziale è escluso da questo indicatore. La presenza di quadratini o caratteri di sostituzione nell’estrazione richiede un controllo visivo. Resta distinta la verifica grafica della resa di formule e glifi complessi.",
        "",
        "Per ripetere il controllo, installare Poppler ed eseguire il comando seguente dalla cartella del repository. Con `--report` si aggiornano le misure nel verbale. Le osservazioni visive si conservano se i PDF hanno la stessa impronta binaria. Per registrare una nuova ispezione, aggiungere `--note-visive` seguito dal percorso di un file di testo.",
        "",
        "    python3 tools/verifica_pdf.py",
        "",
    ]
    return "\n".join(out)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--report", action="store_true")
    p.add_argument("--details", action="store_true")
    p.add_argument("--note-visive", type=Path, metavar="FILE")
    p.add_argument("--date", default=date.today().isoformat())
    args = p.parse_args()
    for cmd in ("pdfinfo", "pdftotext", "pdffonts", "pdftoppm", "pdftohtml"):
        if not shutil.which(cmd):
            p.error("Comando di Poppler richiesto: " + cmd)
    rows = list(catalog_seed())
    jobs = [
        (r["id"], b) for r in rows if r["kind"] == "course" for b in titles(r["id"])
    ]
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda job: inspect(rows, *job), jobs))
    body = report(results, args.date)
    target = ROOT / "docs/verifica-pdf.md"
    if args.note_visive or args.report:
        edition = hashlib.sha256()
        for r in results:
            file = ROOT / "materials" / r["file"]
            if file.exists():
                edition.update(hashlib.sha256(file.read_bytes()).digest())
        visual_title = "## Riscontro visivo su pagine rasterizzate\n\n"
        visual_title += f"<!-- PDF SHA-256: {edition.hexdigest()} -->\n\n"
        notes = args.note_visive.read_text() if args.note_visive else ""
        if not notes and target.exists():
            notes = target.read_text().partition(visual_title)[2]
        if notes.strip():
            body += "\n" + visual_title + notes.strip() + "\n"
    if args.report:
        target.write_text(body)
    print(body)
    if args.details:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    return int(
        any(
            r[k]
            for r in results
            for k in ("bad", "bounds", "sparse", "anchors", "orphans", "characters")
        )
    )


if __name__ == "__main__":
    sys.exit(main())
