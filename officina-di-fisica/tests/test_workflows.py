"""Black-box workflows through the same HTTP routes used by the student and author.

Run from the repository: python3 -m unittest discover -s tests -p test_workflows.py
Every test starts a fresh loopback-only server and disposable SQLite installation.
No payment is requested, no message sent and no external service contacted.
"""

import base64
import hashlib
import http.cookiejar
import json
import os
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from pathlib import Path
import secrets
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from urllib import error, request

ROOT = Path(__file__).resolve().parents[1]
LAUNCH = """
from server.store import initialize
from server.web import Handler, ThreadingHTTPServer
initialize()
server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
print(server.server_port, flush=True)
server.serve_forever()
"""
SAMPLE_EMAIL = "studente@example.test"
SAMPLE_PASSWORD = "materiale-di-verifica-42"


class Client:
    def __init__(self, base):
        self.base = base
        self.jar = http.cookiejar.CookieJar()
        self.http = request.build_opener(request.HTTPCookieProcessor(self.jar))

    def fetch(self, route, body=None, expected=200):
        headers = {"Accept": "application/json"}
        binary = None
        if body is not None:
            binary = json.dumps(body).encode()
            headers.update({"Content-Type": "application/json", "X-Astra-Request": "1"})
        req = request.Request(self.base + route, data=binary, headers=headers)
        try:
            response = self.http.open(req, timeout=15)
        except error.HTTPError as exc:
            response = exc
        with response:
            data = response.read()
            if response.headers.get_content_type() == "application/json":
                data = json.loads(data)
            if response.status != expected:
                raise AssertionError(
                    f"{route}: expected {expected}, got {response.status}: {str(data)[:550]}"
                )
        return data

    def register(self, email=SAMPLE_EMAIL):
        self.fetch("/api/register", {"email": email, "password": SAMPLE_PASSWORD})
        return self

    def login(self, email=SAMPLE_EMAIL):
        self.fetch("/api/login", {"email": email, "password": SAMPLE_PASSWORD})
        return self


class NumericAnswers(unittest.TestCase):
    def test_decimal_boundaries_and_microscopic_quantities(self):
        from server.learning import matches

        charge = {"type": "numeric", "value": 1.6e-19, "tolerance": 1e-21}
        for value in ("1,59e-19", "1.60e-19", "1,61e-19"):
            self.assertTrue(matches(charge, value))
        for value in ("0", "1.5899e-19", "1.6101e-19", "Infinity", "NaN", "1 C"):
            self.assertFalse(matches(charge, value))
        exact = {"type": "numeric", "value": -0.1, "tolerance": 0}
        self.assertTrue(matches(exact, "−0,10"))
        self.assertFalse(matches(exact, "-0.1000000000001"))


class Workflows(unittest.TestCase):
    def setUp(self):
        staging = tempfile.TemporaryDirectory(prefix="officina-workflow-")
        self.addCleanup(staging.cleanup)
        self.data = Path(staging.name)
        self.process = None
        self.open_server()
        self.addCleanup(self.stop_server)
        self.admin = self.client()
        self.owner_login(self.admin)
        self.student = self.client().register()

    def open_server(self):
        self.process = subprocess.Popen(
            [sys.executable, "-u", "-c", LAUNCH],
            cwd=ROOT,
            env={**os.environ, "ASTRA_DATA": str(self.data), "ASTRA_HTTPS": "0"},
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        line = self.process.stdout.readline().strip()
        if not line.isdigit():
            _, stderr = self.process.communicate(timeout=5)
            self.fail(f"Server did not start: {line} {stderr}")
        self.base = f"http://127.0.0.1:{int(line)}"

    def stop_server(self):
        if self.process:
            self.process.terminate()
            self.process.communicate(timeout=10)
            self.process = None

    def client(self):
        return Client(self.base)

    def db(self):
        connection = sqlite3.connect(self.data / "officina.sqlite3")
        self.addCleanup(connection.close)
        return connection

    def owner_login(self, client):
        # Equivalent setup to app.py autore, without opening the machine's browser.
        ticket = secrets.token_urlsafe(32)
        conn = self.db()
        with conn:
            conn.execute(
                "INSERT INTO tickets VALUES(?,?)",
                (hashlib.sha256(ticket.encode()).hexdigest(), int(time.time()) + 100),
            )
        client.fetch("/api/owner", {"ticket": ticket})
        return ticket

    def order(self, student=None, course="C5", offer="digitale"):
        return (student or self.student).fetch(
            "/api/orders", {"course": course, "offer": offer, "accepted": True}
        )

    def grant(self, course="C5", student=None):
        order = self.order(student, course)
        self.admin.fetch(
            "/api/order/" + order["id"],
            {"action": "confirm", "verified": True, "amount": "1.00"},
        )
        return order

    def start_run(self, client=None, **kwargs):
        args = {
            "course": "C5",
            "mode": "practice",
            "requestId": secrets.token_hex(10),
            **kwargs,
        }
        return (client or self.student).fetch("/api/runs", args)["id"]

    def view(self, run, body=None, client=None, expected=200):
        return (client or self.student).fetch("/api/run/" + run, body, expected)

    def author_get(self, key):
        return self.admin.fetch("/api/author/item/" + key)

    def test_accounts_access_restart_and_other_device(self):
        self.assertEqual(
            self.client().fetch("/api/health")["product"], "officina-di-fisica"
        )
        a = self.student.fetch("/api/state")["user"]
        self.assertEqual(a["email"], SAMPLE_EMAIL)
        anon = self.client()
        anon.fetch("/api/studio", expected=401)
        for view in ("record", "copertura"):
            url = "/api/author/inventario/" + view
            anon.fetch(url, expected=401)
            self.student.fetch(url, expected=403)
        self.student.fetch("/api/author/list", expected=403)
        self.student.fetch("/api/item/C5-L02", expected=403)
        self.student.fetch("/api/read", {"id": "C5-L01"})
        self.assertEqual(self.student.fetch("/api/studio")["skills"], {})
        anon.fetch(
            "/api/register", {"email": SAMPLE_EMAIL, "password": SAMPLE_PASSWORD}, 409
        )
        anon.fetch(
            "/api/login",
            {"email": SAMPLE_EMAIL, "password": "altra-password-fittizia"},
            401,
        )
        self.stop_server()
        self.open_server()
        second = self.client().login()
        self.assertEqual(second.fetch("/api/state")["user"]["id"], a["id"])
        self.assertEqual(
            [r["id"] for r in second.fetch("/api/studio")["reads"]], ["C5-L01"]
        )
        other = self.client().register("altro@example.test")
        self.assertEqual(other.fetch("/api/studio")["reads"], [])
        second.fetch("/api/logout", {})
        second.fetch("/api/studio", expected=401)
        self.assertEqual(other.fetch("/api/studio")["skills"], {})

    def test_manual_payment_duplicates_mismatches_cancellation_and_audit(self):
        self.admin.fetch("/api/author/commerce", {"mode": "reale"}, 400)
        self.assertEqual(self.student.fetch("/api/state")["mode"], "verifica")
        self.student.fetch("/api/orders", {"course": "C5", "accepted": False}, 400)
        first = self.order()
        same = self.order()
        self.assertEqual(
            (first["id"], first["state"], first["snapshot"]["iban"]),
            (same["id"], "in attesa", ""),
        )
        self.assertEqual(first["cents"], 100)
        first_path = "/api/order/" + first["id"]
        other = self.client().register("vicino@example.test")
        other.fetch(first_path, {"action": "cancel"}, 404)
        self.student.fetch(
            first_path, {"action": "confirm", "verified": True, "amount": "1,00"}, 403
        )
        self.admin.fetch(
            first_path, {"action": "confirm", "verified": False, "amount": "1,00"}, 400
        )
        wrong = self.admin.fetch(
            first_path, {"action": "confirm", "verified": True, "amount": "0,75"}
        )
        self.assertFalse(wrong["ok"])
        self.student.fetch("/api/item/C5-L02", expected=403)
        self.student.fetch(first_path, {"action": "cancel"})
        self.admin.fetch(
            first_path, {"action": "confirm", "verified": True, "amount": "1,00"}, 409
        )
        second = self.order()
        self.assertNotEqual(second["id"], first["id"])
        path = "/api/order/" + second["id"]
        receipt = {"action": "confirm", "verified": True, "amount": "1,00"}
        self.admin.fetch(path, receipt)
        self.admin.fetch(path, receipt)
        self.admin.fetch(path, {**receipt, "amount": "2.00"}, 409)
        self.student.fetch("/api/orders", {"course": "C5", "accepted": True}, 409)
        self.student.fetch("/api/item/C5-L02")
        other.fetch("/api/item/C5-L02", expected=403)
        self.student.fetch("/api/item/C1-L002", expected=403)
        records = self.admin.fetch("/api/author/commerce")
        trace = [r["event"] for r in records["audit"] if r["target"] == second["id"]]
        self.assertEqual(trace.count("accredito confermato"), 1)
        self.assertTrue(
            any(
                r["event"] == "importo difforme" and r["target"] == first["id"]
                for r in records["audit"]
            )
        )
        self.assertEqual(len(self.student.fetch("/api/studio")["orders"]), 2)
        self.assertEqual(other.fetch("/api/studio")["orders"], [])

    def test_simultaneous_orders_and_separate_meeting_offer(self):
        # Two already logged-in clients can submit the same checkout at once.
        device_a = self.client().login()
        device_b = self.client().login()
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(
                pool.map(
                    lambda c: self.order(c, "C5", "incontri"), [device_a, device_b]
                )
            )
        self.assertEqual(results[0]["id"], results[1]["id"])
        self.admin.fetch(
            "/api/order/" + results[0]["id"],
            {"action": "confirm", "verified": True, "amount": "1"},
        )
        self.student.fetch("/api/item/C5-L02", expected=403)
        order = self.order(course="C5", offer="combinata")
        self.admin.fetch(
            "/api/order/" + order["id"],
            {"action": "confirm", "verified": True, "amount": "1"},
        )
        self.student.fetch("/api/item/C5-L02")

    def test_shared_progress_remediation_and_session_idempotence(self):
        self.grant()
        new_device = self.client().login()
        run = self.start_run(item="C5-Q001", requestId="uno-stesso-gesto")
        self.assertEqual(
            new_device.fetch(
                "/api/runs",
                {
                    "item": "C5-Q001",
                    "course": "C5",
                    "mode": "practice",
                    "requestId": "uno-stesso-gesto",
                },
            )["id"],
            run,
        )
        self.view(run, {"action": "answer", "idx": 0, "value": "9"})
        self.view(run, {"action": "answer", "idx": 0, "value": "9"}, new_device)
        self.assertEqual(
            self.student.fetch("/api/studio")["skills"]["C5-L01"]["state"],
            "prima evidenza",
        )
        r2 = self.start_run(item="C5-Q002")
        self.view(r2, {"action": "answer", "idx": 0, "value": "100"})
        state = self.student.fetch("/api/studio")["skills"]["C5-L01"]
        self.assertEqual(
            (state["state"], state["wrong"], state["families"]),
            ("da consolidare", 2, 2),
        )
        r3 = self.start_run(item="C5-Q003")
        hinted = self.view(r3, {"action": "hint", "idx": 0})
        self.assertTrue(hinted["items"][0]["hintTexts"])
        self.view(r3, {"action": "answer", "idx": 0, "value": "27,8"})
        self.assertEqual(
            self.student.fetch("/api/studio")["skills"]["C5-L01"]["families"], 2
        )
        excluded = self.start_run(mode="retest", skill="C5-L01", exclude="C5-Q001")
        ri = self.view(excluded)["items"][0]["id"]
        self.assertNotEqual(
            self.author_get(ri)["record"]["family"],
            self.author_get("C5-Q001")["record"]["family"],
        )
        self.grant("C6")
        reused = self.start_run(course="C6", item="C5-Q001")
        self.assertEqual(self.view(reused)["items"][0]["id"], "C5-Q001")
        self.assertEqual(
            new_device.fetch("/api/studio")["skills"]["C5-L01"]["wrong"], 2
        )
        q = self.author_get("C5-Q001")["record"]
        conn = self.db()
        with conn:
            conn.execute(
                "UPDATE attempts SET stamp=stamp-10*86400 WHERE skill=?", (q["skill"],)
            )
        due = self.view(self.start_run(mode="review"))["items"]
        self.assertGreater(len(due), 0)
        other = self.client().register("distinto@example.test")
        self.view(run, client=other, expected=404)
        other.fetch("/api/item/C5-L02", expected=403)
        self.assertEqual(other.fetch("/api/studio")["skills"], {})

    def test_recovery_collection_protects_exam_and_preserves_independent_evidence(self):
        request_body = {"course": "C2", "id": "C2-Q062"}
        self.client().fetch("/api/recupero", request_body, 401)
        self.student.fetch("/api/recupero", request_body, 403)
        self.grant("C2")
        sheet = self.student.fetch("/api/recupero", request_body)
        self.assertEqual(
            (sheet["target"]["id"], sheet["target"]["kind"]), ("LAB-C2", "lab")
        )
        self.assertTrue(sheet["solution"] and sheet["canRetest"])
        self.assertEqual(self.student.fetch("/api/studio")["skills"], {})
        opened = self.author_get("C2-Q062")["record"]
        same = self.start_run(course="C2", item=opened["id"])
        self.view(
            same, {"action": "answer", "idx": 0, "value": opened["answer"]["value"]}
        )
        self.assertEqual(
            self.student.fetch("/api/studio")["skills"][opened["skill"]]["families"], 0
        )
        fresh = self.start_run(
            course="C2", mode="retest", skill=opened["skill"], exclude=opened["id"]
        )
        other = self.author_get(self.view(fresh)["items"][0]["id"])["record"]
        self.assertNotEqual(other["family"], opened["family"])
        self.student.fetch("/api/recupero", {"course": "C2", "id": "C1-Q002"}, 404)
        self.grant("C6")
        self.student.fetch("/api/recupero", {"course": "C6", "id": "C6-Q095"}, 404)

    def test_lab_readings_and_revealed_solutions_are_separate(self):
        self.grant()
        self.student.fetch("/api/read", {"id": "C5-L10"})
        course = self.student.fetch("/api/course/C5")
        lab = next(r["id"] for r in course["items"] if r["kind"] == "lab")
        self.student.fetch(
            "/api/observation",
            {
                "id": lab,
                "prediction": "Attendo immagine invertita",
                "note": "",
                "parameters": "p=30",
            },
            400,
        )
        self.student.fetch(
            "/api/observation",
            {
                "id": lab,
                "prediction": "Attendo immagine invertita",
                "note": "I raggi si incrociano.",
                "parameters": "p=30",
            },
        )
        run = self.start_run(item="C5-Q094")
        revealed = self.view(run, {"action": "reveal", "idx": 0})
        self.assertTrue(revealed["items"][0]["solution"])
        self.view(run, {"action": "finish"})
        state = self.student.fetch("/api/studio")
        self.assertEqual(
            (len(state["reads"]), state["labCount"], state["skills"]), (1, 1, {})
        )
        # A later completion of the same published item is possible, but the
        # visible answer has already supplied its content to this account.
        retry = self.start_run(item="C5-Q094")
        item = self.view(retry, {"action": "answer", "idx": 0, "value": "15"})["items"][
            0
        ]
        self.assertTrue(item["correct"])
        self.assertTrue(item["aided"])
        evidence = self.student.fetch("/api/studio")["skills"]["C5-L10"]
        self.assertEqual(
            (evidence["good"], evidence["families"], evidence["aided"]), (0, 0, 1)
        )

    def test_import_in_draft_preview_publish_restore_and_snapshot(self):
        self.grant()
        original = self.author_get("C5-Q001")["record"]
        run = self.start_run(item="C5-Q001")
        proposed = deepcopy(original)
        proposed.update(
            prompt="Nel grafico gli estremi sono +8 e −8 mm. Quanto vale l’ampiezza in mm?",
            blocks=[
                {
                    "type": "text",
                    "text": "Fra i picchi ci sono 16 mm. Dal centro al picco ci sono 8 mm.",
                }
            ],
        )
        proposed["answer"]["value"] = 8
        v2 = self.admin.fetch("/api/author/save", {"record": proposed, "base": 1})["v"]
        self.admin.fetch("/api/author/save", {"record": proposed, "base": 1}, 409)
        self.assertEqual(
            self.author_get("C5-Q001")["record"]["prompt"], proposed["prompt"]
        )
        self.assertEqual(
            self.student.fetch("/api/item/C5-Q001")["prompt"], original["prompt"]
        )
        self.assertEqual(set(self.author_get("C5-Q001")["used"]), {"C5", "C6"})
        self.admin.fetch("/api/author/publish", {"targets": {"C5-Q001": v2}})
        self.assertEqual(
            self.student.fetch("/api/item/C5-Q001")["prompt"], proposed["prompt"]
        )
        old = self.view(run, {"action": "answer", "idx": 0, "value": "7"})["items"][0]
        self.assertEqual((old["version"], old["correct"], old["key"]), (1, True, 7))
        current = self.start_run(item="C5-Q001")
        new = self.view(current, {"action": "answer", "idx": 0, "value": "8"})["items"][
            0
        ]
        self.assertEqual((new["version"], new["correct"], new["key"]), (2, True, 8))
        v3 = self.admin.fetch(
            "/api/author/restore", {"id": "C5-Q001", "v": 1, "base": v2}
        )["v"]
        self.admin.fetch("/api/author/publish", {"targets": {"C5-Q001": v3}})
        self.assertEqual(
            self.student.fetch("/api/item/C5-Q001")["prompt"], original["prompt"]
        )
        self.assertEqual(self.view(current)["items"][0]["key"], 8)
        self.assertEqual(
            [h["v"] for h in self.author_get("C5-Q001")["history"]], [3, 2, 1]
        )
        self.admin.fetch("/api/author/withdraw", {"id": "C5-Q001", "live": 3})
        self.student.fetch("/api/item/C5-Q001", expected=404)
        self.assertTrue(self.view(run)["items"][0]["correct"])

    def test_lot_is_atomic_assets_and_shared_content(self):
        self.grant()
        art = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 22"><title>Asse</title><line x1="1" y1="10" x2="79" y2="10" stroke="black"/></svg>'
        hashkey = hashlib.sha256(art).hexdigest()
        asset = {
            "id": hashkey,
            "name": "asse.svg",
            "mime": "image/svg+xml",
            "data": base64.b64encode(art).decode(),
        }
        course = {
            "id": "Cprova",
            "course": "Cprova",
            "kind": "course",
            "title": "Misure sul banco",
            "section": "",
            "order": 8,
            "prerequisites": [],
            "blocks": [],
        }
        section = {
            **course,
            "id": "Cprova-S",
            "kind": "section",
            "title": "Una sezione",
            "section": "Una sezione",
            "order": 1,
        }
        sample = {
            **section,
            "id": "Cprova-L",
            "kind": "lesson",
            "title": "Segnare lo zero",
            "skill": "Cprova-L",
            "reuse": ["C5"],
            "blocks": [
                {"type": "text", "text": "Si sceglie uno zero."},
                {
                    "type": "figure",
                    "src": "/asset/" + hashkey,
                    "text": "L’asse delle misure.",
                },
                {"type": "formula", "text": "x=0"},
            ],
        }
        q = {
            **deepcopy(self.author_get("C5-Q001")["record"]),
            "id": "Cprova-Q",
            "course": "Cprova",
            "section": "Una sezione",
            "skill": "Cprova-L",
            "prerequisites": [],
            "order": 2,
        }
        q["error"]["target"] = "Cprova-L"
        records = [q, sample, section, course]
        package = {"schema": "astra/1", "assets": [asset], "records": records}
        bad = deepcopy(package)
        bad["records"][0]["skill"] = "lezione-assente"
        rejected = self.admin.fetch(
            "/api/author/import", {"package": bad, "commit": True}
        )
        self.assertTrue(rejected["errors"])
        self.assertFalse(rejected["saved"])
        self.admin.fetch("/api/author/item/Cprova-L", expected=404)
        self.admin.fetch("/asset/" + hashkey, expected=404)
        duplicate = deepcopy(package)
        duplicate["records"].append(deepcopy(q))
        self.assertTrue(
            self.admin.fetch(
                "/api/author/import", {"package": duplicate, "commit": True}
            )["errors"]
        )
        check = self.admin.fetch(
            "/api/author/import", {"package": package, "commit": False}
        )
        self.assertEqual(
            (check["errors"], check["saved"], check["count"]), ([], False, 4)
        )
        saved = self.admin.fetch(
            "/api/author/import", {"package": package, "commit": True}
        )
        self.assertTrue(saved["saved"])
        self.student.fetch("/api/item/Cprova-L", expected=404)
        self.assertEqual(self.admin.fetch("/asset/" + hashkey), art)
        self.assertTrue(
            self.admin.fetch(
                "/api/author/import", {"package": package, "commit": True}
            )["errors"]
        )
        self.admin.fetch(
            "/api/author/publish", {"targets": {r["id"]: 1 for r in records}}
        )
        published = self.student.fetch("/api/item/Cprova-L")
        self.assertEqual(published["blocks"], sample["blocks"])
        self.assertNotEqual(published.get("review"), "bozza")
        changed_kind = {
            **sample,
            "kind": "example",
            "prompt": "Una misura.",
            "difficulty": 1,
            "family": "esempio",
            "baseVersion": 1,
        }
        invalid_change = self.admin.fetch(
            "/api/author/import",
            {
                "package": {"schema": "astra/1", "records": [changed_kind]},
                "commit": True,
            },
        )
        self.assertFalse(invalid_change["saved"])
        self.assertTrue(invalid_change["errors"])
        self.assertEqual(self.author_get("Cprova-L")["base"], 1)
        self.assertEqual(self.student.fetch("/asset/" + hashkey), art)
        used = self.author_get("Cprova-L")["used"]
        self.assertEqual(set(used), {"Cprova", "C5", "C6"})
        c6 = self.student.fetch("/api/course/C6")["items"]
        self.assertEqual(sum(x["id"] == "Cprova-L" for x in c6), 1)
        xport = self.admin.fetch("/api/author/export")
        self.assertEqual(xport["schema"], "astra/1")
        self.assertTrue(any(r["id"] == "Cprova-Q" for r in xport["records"]))
        self.assertEqual(
            next(a for a in xport["assets"] if a["id"] == hashkey)["data"],
            asset["data"],
        )

    def test_new_figure_reordering_and_lab_activity_can_be_published_together(self):
        self.grant()
        course = self.student.fetch("/api/course/C5")
        lab_key = next(it["id"] for it in course["items"] if it["kind"] == "lab")
        laboratory = self.author_get(lab_key)
        lab = deepcopy(laboratory["record"])
        lab["prediction"] = (
            "Prevedi il segno di q per p minore di f e verifica il caso."
        )
        entry = self.author_get("C5-E001")
        edited = deepcopy(entry["record"])
        svg = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><title>Passaggio evidenziato</title><circle cx="30" cy="20" r="6"/></svg>'
        upload = self.admin.fetch(
            "/api/author/upload",
            {
                "name": "punto.svg",
                "mime": "image/svg+xml",
                "data": base64.b64encode(svg).decode(),
            },
        )
        edited["order"] = 60
        figure = next(b for b in edited["blocks"] if b["type"] == "figure")
        old_src = figure["src"]
        figure.update(src=upload["src"], text="Il punto indica l’istante osservato.")
        pre = self.admin.fetch(
            "/api/author/save", {"record": edited, "base": entry["base"]}
        )
        prelab = self.admin.fetch(
            "/api/author/save", {"record": lab, "base": laboratory["base"]}
        )
        old = self.student.fetch("/api/item/C5-E001")
        self.assertEqual(
            next(b["src"] for b in old["blocks"] if b["type"] == "figure"), old_src
        )
        self.admin.fetch(
            "/api/author/publish",
            {"targets": {"C5-E001": pre["v"], lab_key: prelab["v"]}},
        )
        new = self.student.fetch("/api/item/C5-E001")
        self.assertEqual(
            next(b["src"] for b in new["blocks"] if b["type"] == "figure"),
            upload["src"],
        )
        self.assertEqual(self.student.fetch(upload["src"]), svg)
        got = self.student.fetch("/api/item/" + lab_key)
        self.assertEqual(got["prediction"], lab["prediction"])
        self.assertEqual(got["model"], lab["model"])
        example_order = [
            it["id"]
            for it in self.student.fetch("/api/course/C5")["items"]
            if it["kind"] == "example"
        ]
        self.assertEqual(example_order[-1], "C5-E001")
        self.assertIn(
            "C5-E001",
            [it["id"] for it in self.student.fetch("/api/course/C6")["items"]],
        )

    def test_pdf_tracks_changed_external_example_after_publication(self):
        browsers = [
            os.environ.get("ASTRA_CHROME"),
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            shutil.which("google-chrome"),
            shutil.which("chromium"),
            shutil.which("chromium-browser"),
            shutil.which("chrome"),
        ]
        if not any(p and Path(p).is_file() for p in browsers):
            self.skipTest("Chrome/Chromium richiesto per la stampa effettiva")
        course = {
            "id": "Cdoc",
            "course": "Cdoc",
            "kind": "course",
            "title": "Quaderno del laboratorio",
            "section": "",
            "order": 8,
            "prerequisites": [],
            "blocks": [],
        }
        lesson = {
            **course,
            "id": "Cdoc-L",
            "kind": "lesson",
            "title": "Il primo esperimento",
            "skill": "Cdoc-L",
            "section": "Misure",
            "blocks": [
                {"type": "example", "ref": "C1-E001", "text": "Un esempio condiviso."}
            ],
        }
        seed = {"schema": "astra/1", "records": [course, lesson]}
        self.assertTrue(
            self.admin.fetch("/api/author/import", {"package": seed, "commit": True})[
                "saved"
            ]
        )
        self.admin.fetch("/api/author/publish", {"targets": {"Cdoc": 1, "Cdoc-L": 1}})

        def status():
            rows = self.admin.fetch("/api/author/pdf")
            return next(
                x for x in rows if x["course"] == "Cdoc" and x["book"] == "dispensa"
            )

        self.assertFalse(status()["ready"])
        self.admin.fetch("/api/author/pdf", {"course": "Cdoc", "book": "dispensa"})
        until = time.monotonic() + 25
        while time.monotonic() < until:
            progress = status()
            if progress["ready"] or progress["job"].startswith("errore"):
                break
            time.sleep(0.12)
        self.assertTrue(progress["ready"], progress)
        self.assertTrue(
            self.admin.fetch("/download/Cdoc/dispensa").startswith(b"%PDF-")
        )
        example = self.author_get("C1-E001")
        edited = deepcopy(example["record"])
        edited["blocks"].append(
            {
                "type": "text",
                "text": "Il controllo finale aggiunto appartiene alla nuova edizione.",
            }
        )
        saved = self.admin.fetch(
            "/api/author/save", {"base": example["base"], "record": edited}
        )
        self.assertTrue(status()["ready"])
        self.admin.fetch("/api/author/publish", {"targets": {"C1-E001": saved["v"]}})
        self.assertFalse(status()["ready"])
        self.admin.fetch("/download/Cdoc/dispensa", expected=409)

    def test_exam_format_grading_edits_expiry_and_no_early_solution(self):
        self.grant("C6")
        for n in (1, 2, 3):
            rid = self.start_run(course="C6", mode="exam", exam=n)
            state = self.view(rid)
            self.assertEqual(len(state["items"]), 31)
            self.assertIn(state["deadline"] - state["serverTime"], range(2996, 3001))
            self.assertTrue(
                all(
                    q["type"] == "choice" and len(q["options"]) == 5
                    for q in state["items"][:21]
                )
            )
            self.assertTrue(all(q["type"] == "text" for q in state["items"][21:]))
            self.assertTrue(
                all("solution" not in q and "key" not in q for q in state["items"])
            )
            self.view(rid, {"action": "hint", "idx": 0}, expected=400)
            self.view(rid, {"action": "reveal", "idx": 0}, expected=400)
            first = state["items"][0]
            key = self.author_get(first["id"])["record"]["answer"]["value"]
            alternatives = [o for o in first["options"] if o != key]
            self.view(rid, {"action": "answer", "idx": 0, "value": alternatives[0]})
            state = self.view(rid, {"action": "answer", "idx": 0, "value": key})
            self.assertEqual(state["items"][0]["changes"], 2)
            self.view(
                rid,
                {"action": "answer", "idx": 0, "value": alternatives[1]},
                expected=409,
            )
            self.view(rid, {"action": "blank", "idx": 1})
            self.view(
                rid,
                {
                    "action": "answer",
                    "idx": 1,
                    "value": state["items"][1]["options"][0],
                },
                expected=409,
            )
            self.view(
                rid, {"action": "answer", "idx": 21, "value": "RISPOSTA INESATTA"}
            )
            if n == 2:
                # Advance the deadline in this disposable fixture, without a real 50-minute wait.
                conn = self.db()
                with conn:
                    conn.execute(
                        "UPDATE runs SET deadline=? WHERE id=?",
                        (int(time.time()) - 1, rid),
                    )
                end = self.view(rid)
            else:
                end = self.view(rid, {"action": "finish"})
            self.assertTrue(end["finished"])
            self.assertEqual(
                end["result"], {"right": 1, "wrong": 1, "omitted": 29, "score": 0.9}
            )
            self.assertTrue(
                all(q["key"] is not None and q["solution"] for q in end["items"])
            )
            self.assertEqual(
                end["result"], self.view(rid, {"action": "finish"})["result"]
            )
            self.assertEqual(
                self.db()
                .execute("SELECT count(*) FROM attempts WHERE run=?", (rid,))
                .fetchone()[0],
                2,
            )

    def test_mid_final_and_diagnosis(self):
        self.grant("C6")
        for c in ("C1", "C2", "C3", "C4", "C5"):
            first = self.view(self.start_run(course=c, mode="mid", part=1))
            second = self.view(self.start_run(course=c, mode="mid", part=2))
            final = self.view(self.start_run(course=c, mode="final"))
            a = {r["id"] for r in first["items"]}
            b = {r["id"] for r in second["items"]}
            self.assertTrue(a and b and a.isdisjoint(b))
            self.assertTrue(
                all(run["sealed"] and run["items"] for run in (first, second, final))
            )
        diag = self.view(self.start_run(course="C6", mode="diagnosis"))
        assessed = {x["id"][:2] for x in diag["items"]}
        self.assertLessEqual({"C1", "C2", "C3", "C4", "C5"}, assessed)


if __name__ == "__main__":
    unittest.main()
