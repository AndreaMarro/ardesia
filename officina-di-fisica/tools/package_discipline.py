"""Compose the committed offline product and one private discipline for delivery to its owner."""
import argparse
import hashlib
from pathlib import Path
import shlex
import stat
import subprocess
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from server.adapters.discipline_pack import load_pack
from tools import package_release

START = """#!/bin/sh
set -eu
cd "$(dirname "$0")/officina-di-fisica"
python3 app.py install-discipline ../{catalog}
exec python3 app.py serve --host 127.0.0.1 --port 0 --open
"""


def put(z, name, data, mode=0o644):
    entry=ZipInfo(name,(1980,1,1,0,0,0))
    entry.create_system=3
    entry.external_attr=(stat.S_IFREG | mode) << 16
    z.writestr(entry,data,compress_type=ZIP_DEFLATED,compresslevel=6)


def build(catalog_file, target):
    catalog, units=load_pack(catalog_file)
    root=catalog_file.resolve().parent
    package_root="discipline/"+catalog["id"]
    catalog_name=package_root+"/catalog.json"
    import json
    raw=json.loads(catalog_file.read_text(encoding="utf-8"))
    files={c["file"] for c in raw["courses"]}
    commit=subprocess.check_output(["git","rev-parse","HEAD"],cwd=package_release.APP,text=True).strip()
    with tempfile.TemporaryDirectory(dir=target.resolve().parent) as tmp:
        tmp=Path(tmp)
        public=tmp/"app.zip"
        package_release.build(public)
        candidate=tmp/"candidate.zip"
        with ZipFile(public) as app, ZipFile(candidate,"w") as result:
            for item in app.infolist():
                put(result,item.filename,app.read(item),0o755 if (item.external_attr>>16) & 0o111 else 0o644)
            put(result,catalog_name,catalog_file.read_bytes(),0o600)
            for file in sorted(files):
                # Use canonical relative paths even when a caller supplies redundant path segments.
                path=(root/file).resolve()
                if path != root/file or Path(file).is_absolute():
                    raise ValueError("Usare percorsi relativi canonici per assemblare il pacchetto.")
                put(result,package_root+"/"+file,path.read_bytes(),0o600)
            put(result,"Avvia Cric.command",START.format(catalog=shlex.quote(catalog_name)).encode(),0o755)
            intro=(f"# Cric · {catalog['title']}\n\nEdizione privata {catalog['version']}. Commit applicativo {commit}.\n\n"
                   "Su macOS estrai l’intero ZIP e apri Avvia Cric.command. Il server sceglie una porta libera sul tuo computer. "
                   "Apri Materie, scegli un microcorso e apri il quaderno di prova. Il Terminale ospita il server e ne mostra l’indirizzo. "
                   "Per conservarne lo stato, conserva la directory officina-di-fisica/var dopo avere fermato il processo.\n\n"
                   "Su Linux o Windows, da un terminale nella cartella officina-di-fisica, esegui questi due comandi con Python 3.10 o successivo.\n\n"
                   f"`python3 app.py install-discipline ../{catalog_name}`\n\n`python3 app.py serve --port 0 --open`\n\n"
                   "Il codice e il pacchetto di esempio sono pubblici. Il materiale didattico di questa copia include soluzioni private. "
                   "Il registro scientifico separato documenta le verifiche effettuate.\n")
            put(result,"LEGGIMI.md",intro.encode())
        candidate.replace(target)
    return {"commit":commit,"edition":catalog["version"],"courses":len(catalog["courses"]),"units":len(units),
            "sha256":hashlib.sha256(target.read_bytes()).hexdigest()}


if __name__=="__main__":
    import json
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog",type=Path)
    parser.add_argument("output",type=Path)
    args=parser.parse_args()
    print(json.dumps(build(args.catalog,args.output),indent=2))
