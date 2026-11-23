"""Assembla un HTML autonomo, utilizzabile anche da file:// e senza installazione."""
from base64 import b64encode
from pathlib import Path
from io import BytesIO
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import argparse
import json

here = Path(__file__).resolve().parent
repo = here.parents[4]
types = repo / "officina-di-fisica/static/type"
out = here.parent / "confronto.html"
fonts = [("Work Sans", "worksans2.woff2", "worksans"), ("Baskervville", "baskervville1.woff2", "baskervville")]
markup = (here / "schermo.html").read_text()
declarations = []
licenses = []
for name, file, license_id in fonts:
    data = b64encode((types / file).read_bytes()).decode("ascii")
    declarations.append("@font-face{font-family:'" + name + "';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64," + data + ") format('woff2')}")
    licenses.append((types / (license_id + "-OFL.txt")).read_text())
for marker, value in {
    "FONT": "\n".join(declarations), "STYLE": (here / "schermo.css").read_text(),
    "MODEL": (here / "moto.js").read_text(), "VIEWS": (here / "viste.js").read_text(),
}.items():
    markup = markup.replace("/* " + marker + " */", value)
markup = markup.replace("</body>", '<script type="application/json" id="font-licenses">' + json.dumps(licenses, ensure_ascii=False) + "</script>\n</body>")
archive_path = here.parent / "prototipi-offline.zip"
archive_buffer = BytesIO()
with ZipFile(archive_buffer, "w") as archive:
    entry = ZipInfo("confronto.html", (1980, 1, 1, 0, 0, 0))
    entry.create_system = 3
    entry.external_attr = 0o100644 << 16
    archive.writestr(entry, markup.encode(), compress_type=ZIP_DEFLATED, compresslevel=9)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true")
if parser.parse_args().check:
    if not out.exists() or out.read_bytes() != markup.encode():
        raise SystemExit("Il file standalone richiede una nuova compilazione")
    with ZipFile(archive_path) as archive:
        if archive.namelist() != ["confronto.html"] or archive.read("confronto.html") != markup.encode():
            raise SystemExit("Lo ZIP richiede una nuova compilazione")
else:
    out.write_bytes(markup.encode())
    archive_path.write_bytes(archive_buffer.getvalue())
print(out.name, len(markup.encode()), "byte")
