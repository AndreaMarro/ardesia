"""Install a pinned, checksum-verified serverless Chromium for private PDF generation."""
import base64
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tarfile
import tempfile
import threading
import time
import urllib.request

VERSION = "153.0.0"
SHA512 = "jiGWqSvPMdu4+P9TilYqAR7yEGPEHINx+lCvE/NqNO/EHYzF/x1hUiI5T6ioVIt7dEy7n88byyT0vk+dnsgQwA=="
_LOCK = threading.Lock()


def executable():
    import brotli
    root = Path(tempfile.gettempdir()) / ("officina-chromium-" + VERSION)
    with _LOCK:
        if not root.exists():
            with tempfile.TemporaryDirectory(dir=root.parent) as work:
                work = Path(work)
                pack = work / "package.tgz"
                url = f"https://registry.npmjs.org/@sparticuz/chromium/-/chromium-{VERSION}.tgz"
                with urllib.request.urlopen(url, timeout=35) as response, pack.open("wb") as dest:
                    shutil.copyfileobj(response, dest)
                with pack.open("rb") as contents:
                    if hashlib.file_digest(contents, "sha512").digest() != base64.b64decode(SHA512):
                        raise RuntimeError("Firma del browser di stampa non valida.")
                install = work / "install"
                install.mkdir()
                with tarfile.open(pack) as archive:
                    for name, folder in (("chromium.br", ""), ("al2023.tar.br", "al2023"),
                                         ("fonts.tar.br", "fonts"), ("swiftshader.tar.br", ".")):
                        source = archive.extractfile("package/bin/" + name)
                        if source is None:
                            raise RuntimeError("Browser di stampa incompleto.")
                        payload = brotli.decompress(source.read())
                        if name == "chromium.br":
                            binary = install / "chromium"
                            binary.write_bytes(payload)
                            binary.chmod(0o700)
                        else:
                            with tarfile.open(fileobj=io.BytesIO(payload)) as inner:
                                inner.extractall(install / folder, filter="data")
                        del payload
                install.replace(root)
    return str(root / "chromium")


def environment(binary):
    root = Path(binary).parent
    return dict(os.environ, FONTCONFIG_PATH=str(root / "fonts"),
                LD_LIBRARY_PATH=os.pathsep.join([str(root / "al2023" / "lib"),
                                                 str(root), os.environ.get("LD_LIBRARY_PATH", "")]))


def print_pdf(binary, source, output, parent):
    """Drive the headless shell through its supported loopback DevTools protocol."""
    import websocket
    with tempfile.TemporaryDirectory(dir=parent) as profile:
        process = subprocess.Popen([binary, "--no-sandbox", "--no-zygote", "--single-process",
            "--disable-gpu", "--disable-dev-shm-usage", "--disable-background-networking",
            "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0",
            "--user-data-dir=" + profile, "about:blank"], env=environment(binary),
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        try:
            portfile = Path(profile) / "DevToolsActivePort"
            deadline = time.monotonic() + 12
            while not portfile.is_file():
                if process.poll() is not None or time.monotonic() >= deadline:
                    raise RuntimeError("Il browser di stampa non è diventato disponibile.")
                time.sleep(0.05)
            port = int(portfile.read_text().splitlines()[0])
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=3) as reply:
                page = next(item for item in json.load(reply) if item["type"] == "page")
            socket = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=30, suppress_origin=True)
            try:
                sequence, loaded = 0, False
                def receive():
                    nonlocal loaded
                    message = json.loads(socket.recv())
                    if message.get("method") == "Page.loadEventFired":
                        loaded = True
                    return message
                def command(method, **params):
                    nonlocal sequence
                    sequence += 1
                    socket.send(json.dumps({"id": sequence, "method": method, "params": params}))
                    while True:
                        message = receive()
                        if message.get("id") == sequence:
                            if "error" in message:
                                raise RuntimeError("Il browser ha interrotto " + method)
                            return message["result"]
                command("Page.enable")
                loaded = False
                navigation = command("Page.navigate", url=source.as_uri())
                if navigation.get("errorText"):
                    raise RuntimeError("Il browser non ha aperto il fascicolo.")
                while not loaded:
                    receive()
                command("Runtime.evaluate", expression="document.fonts.ready.then(() => true)", awaitPromise=True)
                document = command("Page.printToPDF", preferCSSPageSize=True, printBackground=True,
                                   displayHeaderFooter=False, generateTaggedPDF=True)
                output.write_bytes(base64.b64decode(document["data"], validate=True))
            finally:
                socket.close()
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=5)
