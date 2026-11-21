#!/usr/bin/env python3
"""Collauda una cartella o uno ZIP di Officina su macOS, su una copia temporanea."""

import argparse
from collections import Counter, defaultdict
from contextlib import closing
import hashlib
from http.client import HTTPConnection
from http.cookies import SimpleCookie
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import signal
import socket
import sqlite3
import stat
import subprocess
import sys
import tempfile
import time
from urllib.parse import unquote, urlsplit
import zipfile


COMMANDS = ("Area autore.command", "Avvia Officina.command")
COURSES = [f"C{i}" for i in range(1, 7)]
BOOKS = [(c, k) for c in COURSES for k in ("dispensa", "esercizi")] + [
    ("C6", "simulazioni")
]
LOCAL = {"var", "node_modules", "__pycache__", ".ruff_cache", ".pytest_cache", ".DS_Store"}
FOOTER = "Andrea Marro 3461653930 se serve chiedi!"


class CheckFailed(Exception):
    pass


def require(condition, message):
    if not condition:
        raise CheckFailed(message)


class Report:
    def __init__(self):
        self.errors = []

    def run(self, label, operation):
        try:
            detail = operation()
        except CheckFailed as exc:
            self.errors.append((label, str(exc)))
        except Exception as exc:
            # Le eccezioni di libreria possono contenere URL o valori di cookie.
            self.errors.append((label, "eccezione " + type(exc).__name__))
        else:
            print("OK   " + label + (f" — {detail}" if detail else ""), flush=True)
            return detail
        print("KO   " + label + " — " + self.errors[-1][1], flush=True)


def private_name(name):
    return (name in LOCAL or name in {".env", ".env.local", ".env.production"}
            or name.endswith((".pyc", ".db", ".db-wal", ".db-shm", ".sqlite",
                              ".sqlite3", ".sqlite3-wal", ".sqlite3-shm", ".sqlite3-journal", ".log")))


def ignored(_directory, names):
    return [name for name in names if name == ".git" or private_name(name)]


def product_root(container):
    def looks_like_app(path):
        return (path / "app.py").is_file() and all((path / name).is_file() for name in COMMANDS)
    if looks_like_app(container):
        return container
    found = []
    for directory, subdirs, _ in os.walk(container):
        subdirs[:] = [s for s in subdirs if not ignored(directory, [s]) and s != "__MACOSX"]
        location = Path(directory)
        if looks_like_app(location):
            found.append(location)
            subdirs.clear()
    require(len(found) == 1, "il pacchetto deve contenere un’unica cartella con app.py e i due comandi")
    return found[0]


def prepare(source, destination):
    if source.is_dir():
        root = product_root(source)
        require(not destination.is_relative_to(root), "la directory di lavoro è contenuta nella sorgente")
        shutil.copytree(root, destination, ignore=ignored)
        return destination
    require(zipfile.is_zipfile(source), "indicare una cartella o uno ZIP leggibile")
    destination.mkdir()
    seen = set()
    with zipfile.ZipFile(source) as archive:
        require(archive.testzip() is None, "CRC non valido nello ZIP")
        for item in archive.infolist():
            path = PurePosixPath(item.filename)
            require(path.parts and not path.is_absolute() and ".." not in path.parts
                    and "\\" not in item.filename, "percorso non valido nello ZIP")
            require(path not in seen, "percorso duplicato nello ZIP")
            seen.add(path)
            mode = item.external_attr >> 16
            require(stat.S_IFMT(mode) in (0, stat.S_IFREG, stat.S_IFDIR),
                    "tipo di file non distribuibile nello ZIP")
            if path.parts[0] == "__MACOSX":
                continue
            bad = next((s for s in path.parts if private_name(s)), None)
            require(bad is None, "lo ZIP contiene file operativi locali o dati di installazione")
            if path.name in COMMANDS:
                require(mode & stat.S_IXUSR, f"{path.name} non ha il bit eseguibile nello ZIP")
    # ditto è l'estrattore di sistema macOS e conserva i permessi distribuiti.
    unpack = subprocess.run(["/usr/bin/ditto", "-x", "-k", str(source), str(destination)],
                            capture_output=True, timeout=90)
    require(unpack.returncode == 0, "l’estrattore macOS non ha completato l’apertura dello ZIP")
    return product_root(destination)


def files_in(root):
    for directory, subdirs, files in os.walk(root):
        subdirs[:] = [d for d in subdirs if d != ".git"]
        yield from (Path(directory) / name for name in files)


def manifest(root):
    return {
        str(f.relative_to(root)): (stat.S_IMODE(f.stat().st_mode), hashlib.sha256(f.read_bytes()).digest())
        for f in files_in(root)
    }


def file_digest(path):
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        while block := stream.read(1024 * 1024):
            checksum.update(block)
    return checksum.hexdigest()


def sources(root, records):
    names = ("README.md", "app.py", "server/store.py", "server/web.py", "server/printing.py",
             "static/index.html", "docs/guida-autore.md", "docs/inventario-copertura.csv",
             "docs/inventario-record.csv", "docs/architettura-e-formati.md")
    require(all((root / n).is_file() for n in names), "mancano sorgenti, documentazione o inventari")
    for name in COMMANDS:
        f = root / name
        require(os.access(f, os.X_OK) and f.stat().st_mode & stat.S_IXUSR, f"{name} ha perso il bit eseguibile")
    expected_files = {"catalog.json", "labs.json", *(c + ".json" for c in COURSES)}
    seeds = sorted((root / "content").glob("*.json"))
    require(expected_files <= {f.name for f in seeds}, "mancano file JSON di corso o laboratorio")
    for f in seeds:
        for item in json.loads(f.read_text(encoding="utf-8")):
            key = item["id"]
            require(key not in records, "un ID ricorre più volte nei sorgenti")
            records[key] = item
    require(all(c in records for c in COURSES) and records["C6"].get("includes") == COURSES[:5],
            "catalogo dei sei corsi o riferimenti C6 incompleti")
    kinds = Counter((r.get("course"), r.get("kind")) for r in records.values())
    for c in COURSES[:5]:
        require(kinds[c, "question"] >= 100 and kinds[c, "example"] >= 20 and
                kinds[c, "lesson"] >= 1 and kinds[c, "lab"] >= 1, f"materiali incompleti in {c}")
    exams = defaultdict(list)
    for record in records.values():
        if record.get("exam"):
            exams[record["exam"]].append(record["answer"])
    require(set(exams) == {1, 2, 3}, "mancano simulazioni complete")
    for answers in exams.values():
        require(Counter(a["type"] for a in answers) == {"choice": 21, "text": 10}
                and all(len(set(a["options"])) == 5 and a["value"] in a["options"]
                        for a in answers if a["type"] == "choice"), "formato della simulazione incoerente")
    figures = {block["src"] for r in records.values()
               for block in r.get("blocks", []) + r.get("promptBlocks", [])
               if block.get("src", "").startswith("/figures/")}
    for src in figures:
        path = root / "static" / src.lstrip("/")
        require(path.is_file() and "<svg" in path.read_text(encoding="utf-8"),
                "manca una tavola SVG richiamata da un record")
    editable = [*seeds, *(root / "static" / src.lstrip("/") for src in figures)]
    require(all(os.access(path, os.W_OK) and path.stat().st_mode & stat.S_IWUSR for path in editable),
            "i file didattici estratti non sono scrivibili")
    require(figures and len(list((root / "docs" / "sources").glob("MUR-*.pdf"))) >= 4,
            "sorgenti delle figure o riferimenti ministeriali assenti")
    return f"{len(records)} record, {len(figures)} SVG richiamati, 6 corsi, 5 laboratori e 3 prove da 31"


def check_links(root):
    pattern = re.compile(r"""\]\(\s*(?:<([^>]+)>|((?:\\.|[^\s()]|\([^\s()]*\))+))(?:\s+["'][^"']*["'])?\s*\)""")
    refs = re.compile(r"^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))", re.M)
    missing, checked, encoded = [], 0, 0
    for f in files_in(root):
        if f.suffix.lower() != ".md":
            continue
        body = re.sub(r"^`{3,}[^\n]*\n.*?^`{3,}[^\n]*$|^~{3,}[^\n]*\n.*?^~{3,}[^\n]*$", "", f.read_text(encoding="utf-8"), flags=re.M | re.S)
        body = re.sub(r"`([^`\n]*)`", "", body)
        for link in [*pattern.finditer(body), *refs.finditer(body)]:
            href = str(link.group(1) or link.group(2))
            url = urlsplit(href)
            if url.scheme or url.netloc or not url.path or url.path.startswith("/"):
                continue
            path = unquote(url.path).replace("\\(", "(").replace("\\)", ")")
            local = (f.parent / path).resolve()
            checked += 1
            encoded += "%20" in url.path.lower()
            if not local.is_relative_to(root) or not local.exists():
                missing.append(f"{f.relative_to(root)} → {path}")
    require(checked > 0, "nessun riferimento relativo verificato")
    require(not missing, ", ".join(missing))
    return f"{checked} destinazioni esistenti, {encoded} con spazi codificati"


def pdf_pages(path):
    data = path.read_bytes()
    require(data.startswith(b"%PDF-") and data.rstrip().endswith(b"%%EOF"), "struttura PDF incompleta")
    env = dict(os.environ, LC_ALL="C")
    def inspect(cmd):
        result = subprocess.run(cmd, env=env, capture_output=True, timeout=45)
        require(result.returncode == 0, "Poppler ha segnalato un errore nel PDF")
        return result.stdout.decode("utf-8")
    info = inspect(["pdfinfo", str(path)])
    m = re.search(r"^Pages:\s+(\d+)\s*$", info, re.M)
    require(m and int(m[1]) > 0, "conteggio delle pagine non leggibile")
    pages = int(m[1])
    text = inspect(["pdftotext", "-enc", "UTF-8", "-layout", str(path), "-"]).split("\f")
    if text and not text[-1].strip():
        text.pop()
    require(len(text) == pages and all(FOOTER in " ".join(t.split()) for t in text),
            "paginazione o piè di pagina incompleto")
    return pages


def materials(root):
    expected = {f"{c}-{b}.pdf" for c, b in BOOKS}
    existing = {f.name for f in (root / "materials").glob("*.pdf")}
    require(expected == existing, "cartella materiali diversa dai tredici fascicoli attesi")
    total, problems = 0, []
    for c, b in BOOKS:
        path = root / "materials" / f"{c}-{b}.pdf"
        try:
            stamp = path.with_suffix(".stamp")
            require(stamp.is_file() and re.fullmatch(r"[a-f0-9]{24}", stamp.read_text().strip()),
                    "firma di edizione mancante")
            total += pdf_pages(path)
        except CheckFailed as exc:
            problems.append(f"{path.name} ({exc})")
    require(not problems, ", ".join(problems))
    return f"13 PDF leggibili, {total} pagine con il piè di pagina richiesto"


def request(port, path, payload=None, cookie=None):
    headers = {"Connection": "close"}
    if cookie:
        headers["Cookie"] = "astra_session=" + cookie
    body = None
    if payload is not None:
        headers.update({"Content-Type": "application/json", "X-Astra-Request": "1",
                        "Origin": f"http://127.0.0.1:{port}"})
        body = json.dumps(payload).encode()
    with closing(HTTPConnection("127.0.0.1", port, timeout=12)) as con:
        con.request("POST" if payload is not None else "GET", path, body, headers)
        response = con.getresponse()
        return response.status, {k.lower(): v for k, v in response.getheaders()}, response.read()


def get_json(port, path, cookie=None):
    status, _, raw = request(port, path, cookie=cookie)
    require(status == 200, f"{path} ha restituito HTTP {status}")
    return json.loads(raw)


def service_pid(port):
    result = subprocess.run(["/usr/sbin/lsof", "-nP", "-t", f"-iTCP:{port}", "-sTCP:LISTEN"],
                            capture_output=True, timeout=12)
    pids = set(result.stdout.split())
    require(result.returncode == 0 and len(pids) == 1, "il processo in ascolto non è univoco")
    return int(pids.pop())


def port_closed(port):
    with socket.socket() as sock:
        sock.settimeout(0.3)
        return sock.connect_ex(("127.0.0.1", port)) != 0


def shutdown(proc):
    # Ogni gruppo viene creato qui con start_new_session=True.
    if proc.poll() is None:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
    try:
        output, _ = proc.communicate(timeout=6)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        output, _ = proc.communicate(timeout=5)
    return output or b""


OBSERVER = """#!/usr/bin/env python3
import os, socket, sys
try:
    os.chdir(os.environ['OFFICINA_PROBE_DIR'])
    with socket.socket(socket.AF_UNIX) as conn:
        conn.settimeout(3)
        conn.connect('apertura.sock')
        conn.sendall(sys.argv[-1].encode())
except OSError:
    pass
"""


class Installation:
    def __init__(self, root, scratch):
        self.root, self.scratch = root, scratch
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            self.port = sock.getsockname()[1]
        self.procs, self.logs, self.secrets = [], [], []
        self.listener = socket.socket(socket.AF_UNIX)
        self.listener.settimeout(18)
        current = Path.cwd()
        try:
            os.chdir(scratch)
            self.listener.bind("apertura.sock")
            self.listener.listen(4)
        finally:
            os.chdir(current)
        temporary = scratch / "file temporanei"
        temporary.mkdir()
        tools = scratch / "osservatore"
        tools.mkdir()
        for name in ("astra-collaudo-browser", "open"):
            observer = tools / name
            observer.write_text(OBSERVER, encoding="utf-8")
            observer.chmod(0o700)
        self.data = scratch / "dati area autore"
        self.env = {k: v for k, v in os.environ.items()
                    if not k.startswith(("ASTRA_", "PYTHON", "DYLD_"))}
        self.env.update(ASTRA_DATA=str(self.data), ASTRA_HOST="127.0.0.1",
                        ASTRA_PORT=str(self.port), ASTRA_HTTPS="0", ASTRA_LOG="0",
                        OFFICINA_PROBE_DIR=str(scratch), PYTHONDONTWRITEBYTECODE="1",
                        BROWSER="astra-collaudo-browser %s", TMPDIR=str(temporary),
                        PATH=str(tools) + os.pathsep + os.environ["PATH"],
                        NO_PROXY="localhost,127.0.0.1", no_proxy="localhost,127.0.0.1")

    def event(self):
        try:
            conn, _ = self.listener.accept()
        except TimeoutError:
            raise CheckFailed("nessuna apertura del browser ricevuta entro 18 secondi")
        with conn:
            conn.settimeout(3)
            parts = bytearray()
            while chunk := conn.recv(1024):
                parts.extend(chunk)
                require(len(parts) < 2048, "segnalazione del browser troppo lunga")
        url = urlsplit(parts.decode("utf-8"))
        require(url.scheme == "http" and url.netloc == f"127.0.0.1:{self.port}",
                "il comando ha aperto un indirizzo diverso dal server isolato")
        return url

    def preflight(self):
        require(sys.platform == "darwin", "questo collaudo richiede macOS")
        require(all(shutil.which(k) for k in ("python3", "pdfinfo", "pdftotext", "curl")),
                "servono Python 3.10+, curl e Poppler")
        probe = ("import sys,webbrowser as w; "
                 "assert sys.version_info >= (3,10) and w.get().name=='astra-collaudo-browser'; "
                 f"assert w.get().open('http://127.0.0.1:{self.port}/osservatore')")
        pre = subprocess.run(["python3", "-c", probe], cwd=self.root, env=self.env,
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=8)
        require(pre.returncode == 0, "Python o redirezione locale del browser non disponibile")
        require(self.event().path == "/osservatore", "osservatore delle aperture indisponibile")
        require(not self.data.exists() and port_closed(self.port), "la prova richiede dati e porta liberi")

    def start(self, name):
        proc = subprocess.Popen([str(self.root / name)], cwd=self.scratch, env=self.env,
                                stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT, start_new_session=True)
        self.procs.append(proc)
        return proc

    def finish(self, proc):
        self.logs.append(shutdown(proc))
        self.procs.remove(proc)

    def verify_stop(self):
        for _ in range(30):
            if port_closed(self.port):
                return
            time.sleep(0.1)
        raise CheckFailed("la porta è ancora in ascolto dopo l’arresto del gruppo di prova")

    def ticket(self):
        url = self.event()
        require(url.path == "/" and not url.query and
                re.fullmatch(r"autore-accesso/[A-Za-z0-9_-]{32,}", url.fragment),
                "il lanciatore non ha prodotto il collegamento locale previsto")
        value = url.fragment.split("/", 1)[1]
        self.secrets.append(value)
        return value

    def check_ticket(self, ticket):
        with closing(sqlite3.connect((self.data / "officina.sqlite3").as_uri() + "?mode=ro", uri=True)) as db:
            rows = db.execute("SELECT hash,expires FROM tickets").fetchall()
        require(len(rows) == 1 and rows[0][0] == hashlib.sha256(ticket.encode()).hexdigest()
                and 0 < rows[0][1] - int(time.time()) <= 150,
                "la chiave temporanea non corrisponde a un’unica impronta con scadenza")

    def redeem(self, ticket):
        self.check_ticket(ticket)
        code, headers, _ = request(self.port, "/api/owner", {"ticket": ticket})
        require(code == 200, f"assegnazione della sessione autore con HTTP {code}")
        name = "astra_session"
        cookies = SimpleCookie(headers.get("set-cookie", ""))
        require(name in cookies and cookies[name]["httponly"] and cookies[name]["samesite"] == "Strict",
                "cookie della sessione autore assente o con attributi inattesi")
        cookie = cookies[name].value
        self.secrets.append(cookie)
        account = get_json(self.port, "/api/state", cookie).get("user") or {}
        require(account.get("id") == "owner" and account.get("role") == "autore",
                "la sessione non accede come autore")
        rejected, replay_headers, _ = request(self.port, "/api/owner", {"ticket": ticket})
        require(rejected == 403 and "set-cookie" not in replay_headers, "un ticket già usato è stato riaccettato")
        return cookie

    def private_state(self, records):
        with closing(sqlite3.connect((self.data / "officina.sqlite3").as_uri() + "?mode=ro", uri=True)) as db:
            require(db.execute("SELECT id,role,hash FROM users").fetchall() == [("owner", "autore", "!")],
                    "presenza di un profilo o di credenziali preinstallati")
            tables = ("orders", "runs", "attempts", "access", "reads", "lab_events", "exposed",
                      "assets", "sessions", "failures")
            require(all(db.execute(f"SELECT count(*) FROM {t}").fetchone()[0] == 0 for t in tables),
                    "il database iniziale contiene dati di lavoro, sessioni o attività")
            ids = {row[0] for row in db.execute("SELECT id FROM heads WHERE live IS NOT NULL")}
            require(ids == records.keys(), "i record pubblicati differiscono dai sorgenti")
        require(stat.S_IMODE(self.data.stat().st_mode) & 0o077 == 0 and
                all(not any((self.data / d).iterdir()) for d in ("uploads", "pdf")),
                "archivio dati non privato o con file precaricati")
        public = get_json(self.port, "/api/state")
        require(public.get("user") is None and public.get("mode") == "verifica" and
                [r["id"] for r in public["courses"]] == COURSES and
                all(not r["owned"] for r in public["courses"]) and len(public["labs"]) == 5,
                "lo stato pubblico iniziale non corrisponde all’edizione prevista")
        require(request(self.port, "/api/author/list")[0] in {401, 403} and
                request(self.port, "/download/C1/dispensa")[0] == 403,
                "la sessione anonima ottiene un’operazione riservata")
        return f"{len(ids)} schede pubblicate, solo autore tecnico, zero attività o ordini"

    def downloaded(self, cookie):
        problems = []
        for c, b in BOOKS:
            name = f"{c}-{b}.pdf"
            status, headers, body = request(self.port, f"/download/{c}/{b}", cookie=cookie)
            if status != 200:
                problems.append(f"{name} HTTP {status}")
            elif (headers.get("content-type") != "application/pdf" or
                  name not in headers.get("content-disposition", "") or
                  body != (self.root / "materials" / name).read_bytes()):
                problems.append(f"{name} non corrisponde a MIME, nome o file distribuito")
        require(not problems, ", ".join(problems))
        return "13 download autenticati identici ai fascicoli distribuiti"

    def author_catalog(self, cookie, records):
        live = get_json(self.port, "/api/author/list", cookie)
        require({r["id"] for r in live} == records.keys(), "inventario autore diverso dal seed")
        full = get_json(self.port, "/api/course/C6", cookie)
        identifiers = [i["id"] for i in full["items"]]
        require(full["owned"] and full["course"]["includes"] == COURSES[:5] and
                len(identifiers) == len(set(identifiers)) and
                set(identifiers) == {k for k, r in records.items() if k not in COURSES and not r.get("exam")},
                "C6 contiene duplicati o non riusa tutti i materiali dei cinque corsi")
        return f"{len(live)} record nell’editor e {len(identifiers)} identificatori nel percorso completo"

    def run(self, report, records):
        self.preflight()
        first = self.start(COMMANDS[0])
        t1 = self.ticket()
        pid = service_pid(self.port)
        require(os.getpgid(pid) == first.pid and get_json(self.port, "/api/health").get("product") ==
                "officina-di-fisica", "il server avviato non appartiene alla prova")
        report.run("Primo avvio con l’area autore", lambda: self.private_state(records))
        cookie = self.redeem(t1)
        report.run("Sessione autore e riuso dei materiali", lambda: self.author_catalog(cookie, records))
        report.run("Fascicoli distribuiti via HTTP", lambda: self.downloaded(cookie))
        second = self.start(COMMANDS[0])
        t2 = self.ticket()
        require(t2 != t1 and second.wait(timeout=8) == 0 and service_pid(self.port) == pid,
                "il secondo lancio non ha conservato il processo con una nuova chiave")
        self.finish(second)
        require(self.redeem(t2) != cookie, "il secondo accesso ha riutilizzato la precedente sessione")
        normal = self.start(COMMANDS[1])
        url = self.event()
        require(url.path == "/" and not url.fragment and normal.wait(timeout=8) == 0 and
                service_pid(self.port) == pid, "il comando pubblico non riapre il servizio esistente")
        self.finish(normal)
        self.finish(first)
        self.verify_stop()
        self.env["ASTRA_DATA"] = str(self.scratch / "dati avvio pubblico")
        normal = self.start(COMMANDS[1])
        url = self.event()
        require(url.path == "/" and not url.fragment and os.getpgid(service_pid(self.port)) == normal.pid
                and get_json(self.port, "/api/health").get("product") == "officina-di-fisica",
                "il lancio pubblico da fermo non apre il server atteso")
        self.finish(normal)
        self.verify_stop()
        return "entrambi i comandi da fermo e a servizio attivo, due ticket distinti e monouso"

    def close(self):
        try:
            for proc in list(self.procs):
                self.finish(proc)
            self.verify_stop()
        finally:
            self.listener.close()
        require(all(secret.encode() not in data for data in self.logs for secret in self.secrets),
                "un comando ha scritto una credenziale nel proprio output")
        return "processi di prova arrestati e nessuna chiave o cookie nei log dei comandi"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("distribuzione", type=Path, help="cartella sorgente oppure archivio ZIP")
    args = parser.parse_args()
    os.umask(0o077)
    report = Report()
    try:
        source = args.distribuzione.resolve()
        archive_hash = file_digest(source) if source.is_file() else None
        with tempfile.TemporaryDirectory(prefix="installazione-mac-") as workspace:
            scratch = Path(workspace).resolve()
            root = prepare(source, scratch / "Officina di Fisica estratta")
            before = manifest(root)
            records = {}
            print("Pacchetto aperto su una copia isolata.", flush=True)
            report.run("Sorgenti ed eseguibilità", lambda: sources(root, records))
            report.run("Collegamenti Markdown relativi", lambda: check_links(root))
            report.run("Integrità dei materiali PDF", lambda: materials(root))
            runtime = Installation(root, scratch)
            try:
                report.run("Lanciatori e collegamenti autore", lambda: runtime.run(report, records))
            finally:
                report.run("Arresto e riservatezza", runtime.close)
            report.run("Integrità della copia dopo l’avvio",
                       lambda: require(manifest(root) == before, "sono cambiati i file dell’applicazione"))
        report.run("Rimozione dei dati temporanei",
                   lambda: require(not scratch.exists(), "la directory temporanea esiste ancora"))
        if archive_hash:
            require(file_digest(source) == archive_hash, "lo ZIP è stato sostituito durante la prova")
            print("SHA-256 ZIP " + archive_hash, flush=True)
    except CheckFailed as exc:
        print("KO   " + str(exc), flush=True)
        return 1
    except Exception as exc:
        print("KO   Preparazione o pulizia interrotta — " + type(exc).__name__, flush=True)
        return 1
    return int(bool(report.errors))


if __name__ == "__main__":
    raise SystemExit(main())
