"""Resource reuse: exact reopen, account boundaries, revocation and legacy data."""
import copy
import json
import sqlite3
import subprocess
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch
from urllib import error, request

from server import store
from server.domain.errors import Problem
from server.domain.identity import encode
from server.web import draft_scope
from multidiscipline import resource_cases as cases
from multidiscipline.web import Handler
from http.server import ThreadingHTTPServer


class ResourceCases(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        location = patch.object(store, "DATA", Path(self.tmp.name))
        location.start()
        self.addCleanup(location.stop)
        store.initialize()
        self.alice = {"id": "resource-alice", "role": "lettore"}
        self.bob = {"id": "resource-bob", "role": "lettore"}
        with store.connect() as db:
            for user in (self.alice, self.bob):
                db.execute("INSERT INTO users VALUES(?,?, '!', ?,1)", (user["id"], user["id"]+"@example.test", user["role"]))
        self.case = self.call(["spec", "LAB3D-04"])["initialCase"]

    def call(self, tail, data=None, user=None, readonly=False):
        with store.connect() as db:
            if readonly:
                db.execute("PRAGMA query_only=ON")
            db.execute("BEGIN IMMEDIATE" if data is not None else "BEGIN")
            return cases.route(db, user, tail, data or {}, data is not None)

    def save(self, key="save-1", user=None, **more):
        return self.call(["cases"], {"requestId": key, "title": "Pressione fissata", "case": self.case, **more}, user or self.alice)

    def collection(self, saved, **more):
        return self.call(["collections"], {"requestId": "collection-1", "title": "Il raggio e la portata",
                                          "caseIds": [s["id"] for s in saved], **more}, self.alice)

    def legacy(self):
        with store.connect() as db:
            return {table: [tuple(r) for r in db.execute("SELECT * FROM " + table + " ORDER BY 1,2")]
                    for table in ("heads", "versions", "reads", "attempts", "lab_events", "sessions")}

    def test_public_spec_readonly_validation_and_no_evidence_from_exploration(self):
        initial = self.legacy()
        self.assertEqual(self.call(["me"], user=self.alice, readonly=True)["cases"], [])
        with store.connect() as db:
            db.execute("PRAGMA query_only=ON")
            self.assertEqual(cases.validate(db, None, self.case)["case"], self.case)
            self.assertFalse(cases.installed(db))
        self.assertEqual(initial, self.legacy())
        with self.assertRaises(Problem) as problem:
            self.call(["cases"], {"requestId": "guest", "title": "Ospite", "case": self.case})
        self.assertEqual(problem.exception.status, 401)

    def test_concurrent_idempotency_reopen_and_legacy_preservation(self):
        with store.connect() as db:
            db.execute("INSERT INTO reads VALUES(?,?,?,?)", (self.alice["id"], "C1-L01", 1, 99))
            db.execute("INSERT INTO attempts VALUES(?,?,?,?,?,?,?,?,?,?)", ("historic", 0, self.alice["id"], "C1-Q01", 1, "C1-L01", "old", 1, 0, 9))
        before = self.legacy()
        self.case["parameters"].update(r=2.3, probe=.75, mode="flow", flow=1.7)
        self.case.update(time=.17, view="diagram")
        with ThreadPoolExecutor(4) as executor:
            receipts = list(executor.map(lambda _: self.save(), range(4)))
        self.assertTrue(all(r == receipts[0] for r in receipts))
        store.initialize()
        reopened = self.call(["cases", receipts[0]["id"]], user=self.alice, readonly=True)
        self.assertEqual(reopened["case"], self.case)
        self.assertEqual(self.call(["me"], user=self.alice)["totalCases"], 1)
        self.assertEqual(before, self.legacy())
        with store.connect() as db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 4)
        with self.assertRaises(Problem) as problem:
            self.save(title="Richiesta riutilizzata male")
        self.assertEqual(problem.exception.status, 409)
        with self.assertRaises(Problem) as problem:
            self.call(["cases", receipts[0]["id"]], user=self.bob)
        self.assertEqual(problem.exception.status, 404)
        self.assertEqual(self.call(["me"], user=self.bob)["cases"], [])

    def test_model_parameter_contract_and_clock_match_real_javascript(self):
        source = """
          import {params,solve} from './static/js/banchi/modelli/tubo.js';
          const inputs=JSON.parse(process.argv[1]);
          console.log(JSON.stringify({params,durations:inputs.map(p=>solve(p).duration)}));
        """
        inputs = [self.case["parameters"], dict(self.case["parameters"], mode="flow", flow=12, r=.5, mu=1),
                  dict(self.case["parameters"], r=.5, mu=12, length=50, dp=5)]
        result = subprocess.run(["node", "--input-type=module", "-e", source, json.dumps(inputs)],
                                cwd=cases.ROOT, check=True, capture_output=True, text=True)
        actual = json.loads(result.stdout)
        fields = ("key", "label", "unit", "min", "max", "step", "value", "options")
        for expected, observed in zip(cases.PARAMETERS, actual["params"]):
            self.assertEqual(expected, {key: observed[key] for key in fields if key in observed})
        self.assertEqual(len(cases.PARAMETERS), len(actual["params"]))
        for parameters, duration in zip(inputs, actual["durations"]):
            self.assertAlmostEqual(cases._duration(parameters), duration, places=9)
            candidate = dict(self.case, parameters=parameters, time=duration)
            self.assertEqual(self.call(["validate"], {"case": candidate})["case"], candidate)

    def test_untrusted_state_rejects_nonfinite_ranges_versions_and_extra_fields(self):
        modifications = [
            lambda c: c["parameters"].update(r=float("nan")),
            lambda c: c["parameters"].update(r=float("inf")),
            lambda c: c["parameters"].update(r=True),
            lambda c: c["parameters"].update(r=4.0001),
            lambda c: c["parameters"].update(r=1.55),
            lambda c: c["parameters"].update(probe=.333),
            lambda c: c["parameters"].update(r=10**1000),
            lambda c: c["parameters"].update(mode="script"),
            lambda c: c["parameters"].update(injected="x"),
            lambda c: c["parameters"].pop("flow"),
            lambda c: c.update(time=-1), lambda c: c.update(time=1e8),
            lambda c: c.update(time=True), lambda c: c.update(view="javascript:alert(1)"),
            lambda c: c.update(schema="cric.resource-case/2"),
            lambda c: c["resource"].update(version=True),
            lambda c: c["resource"].update(sha256="0"*64),
            lambda c: c["model"].update(sha256="0"*64),
            lambda c: c.update(studentEmail="private@example.test"),
            lambda c: c.update(camera={"code": "alert(1)"}),
        ]
        for change in modifications:
            candidate = copy.deepcopy(self.case)
            change(candidate)
            with self.subTest(candidate=repr(candidate)[-200:]), self.assertRaises(Problem):
                self.call(["validate"], {"case": candidate})
        with self.assertRaises(Problem):
            self.call(["spec", "../private"])
        with self.assertRaises(Problem):
            self.call(["spec", "LAB3D-01"])

    def test_slider_grid_accepts_binary_roundoff_but_not_unrepresentable_values(self):
        candidate = copy.deepcopy(self.case)
        candidate["parameters"].update(r=1.5+.1+.1+.1, probe=.1+.2, flow=.1+.1+.1)
        self.assertEqual(self.call(["validate"], {"case": candidate})["case"], candidate)
        candidate["parameters"]["r"] = 2.2
        self.assertEqual(self.call(["validate"], {"case": candidate})["case"], candidate)
        candidate["parameters"]["r"] = 2.2 + .1 * 2e-7
        with self.assertRaisesRegex(Problem, "rappresentabile"):
            self.call(["validate"], {"case": candidate})

    def test_collections_order_owner_revision_share_revoke_and_private_notes(self):
        first = self.save(note="Appunto personale: non va nella condivisione")
        self.case["parameters"]["r"] = 3
        second = self.save("save-2", title="Raggio doppio")
        collection = self.collection([first, second], note="Confronta i due raggi a pressione costante.")
        self.assertIsNone(collection["shareToken"])
        self.assertEqual(self.collection([first, second], note=collection["note"]), collection)
        with self.assertRaises(Problem) as problem:
            self.call(["collections", collection["id"]], user=self.bob)
        self.assertEqual(problem.exception.status, 404)
        foreign = self.save("bob", user=self.bob)
        with self.assertRaises(Problem):
            self.collection([foreign], requestId="foreign")
        changed = self.call(["collections", collection["id"]],
                            {"revision": 1, "title": collection["title"], "note": collection["note"], "caseIds": [second["id"], first["id"]]}, self.alice)
        self.assertEqual(changed["caseIds"], [second["id"], first["id"]])
        with self.assertRaises(Problem) as problem:
            self.call(["collections", collection["id"]], {"revision": 1, "title": "Collisione", "caseIds": [first["id"]]}, self.alice)
        self.assertEqual(problem.exception.status, 409)
        shared = self.call(["collections", collection["id"], "share"], {"revision": changed["revision"], "shared": True}, self.alice)
        self.assertRegex(shared["shareToken"], r"^[a-f0-9]{48}$")
        public = self.call(["shared", shared["shareToken"]], readonly=True)
        self.assertEqual(public["note"], collection["note"])
        self.assertEqual(public["cases"][0]["case"], second["case"])
        self.assertNotIn("note", public["cases"][1])
        self.assertNotIn("user", public)
        self.assertNotIn("shareToken", public)
        revoked = self.call(["collections", collection["id"], "share"], {"revision": shared["revision"], "shared": False}, self.alice)
        with self.assertRaises(Problem) as problem:
            self.call(["shared", shared["shareToken"]])
        self.assertEqual(problem.exception.status, 404)
        reshared = self.call(["collections", collection["id"], "share"], {"revision": revoked["revision"], "shared": True}, self.alice)
        self.assertNotEqual(reshared["shareToken"], shared["shareToken"])

    def test_empty_collection_first_then_add_and_share(self):
        empty = self.collection([])
        self.assertEqual(empty["cases"], [])
        self.assertFalse(empty["shared"])
        with self.assertRaisesRegex(Problem, "almeno un caso"):
            self.call(["collections", empty["id"], "share"], {"revision": 1, "shared": True}, self.alice)
        saved = self.save()
        filled = self.call(["collections", empty["id"]], {"revision": 1, "title": empty["title"], "caseIds": [saved["id"]]}, self.alice)
        shared = self.call(["collections", empty["id"], "share"], {"revision": filled["revision"], "shared": True}, self.alice)
        self.assertTrue(shared["shared"])
        with self.assertRaisesRegex(Problem, "Revoca"):
            self.call(["collections", empty["id"]], {"revision": shared["revision"], "title": empty["title"], "caseIds": []}, self.alice)
        private = self.call(["collections", empty["id"], "share"], {"revision": shared["revision"], "shared": False}, self.alice)
        cleared = self.call(["collections", empty["id"]], {"revision": private["revision"], "title": empty["title"], "caseIds": []}, self.alice)
        self.assertFalse(cleared["shared"])
        self.assertEqual(cleared["caseIds"], [])

    def test_notebook_authorization_snapshot_is_request_local(self):
        saved = self.save()
        self.collection([saved])
        with patch.object(store, "published", wraps=store.published) as published:
            notebook = self.call(["me"], user=self.alice)
            self.assertTrue(notebook["cases"][0]["available"])
            self.assertEqual(published.call_count, 1)
        with patch.object(store, "can_read", return_value=False):
            self.assertFalse(self.call(["me"], user=self.alice)["cases"][0]["available"])

    def test_draft_never_opens_and_changed_or_withdrawn_versions_do_not_silently_reopen(self):
        saved = self.save()
        collection = self.collection([saved])
        shared = self.call(["collections", collection["id"], "share"], {"revision": 1, "shared": True}, self.alice)
        with store.connect() as db:
            published = store.record(db, "LAB3D-04")
            updated = dict(published, version=published["version"]+1, title="Edizione diversa", review="bozza")
            db.execute("INSERT INTO versions VALUES(?,?,?,?,?)", ("LAB3D-04", updated["version"], encode(updated), "test", 12))
            db.execute("UPDATE heads SET draft=? WHERE id='LAB3D-04'", (updated["version"],))
        self.assertEqual(self.call(["spec", "LAB3D-04"])["initialCase"], self.case)
        with store.connect() as db:
            db.execute("UPDATE heads SET live=draft,draft=NULL WHERE id='LAB3D-04'")
        self.assertFalse(self.call(["cases", saved["id"]], user=self.alice)["available"])
        self.assertIsNone(self.call(["shared", shared["shareToken"]])["cases"][0]["case"])
        self.assertFalse(self.save()["available"], "A retry returns the original document, marked unavailable")
        self.assertEqual(self.collection([saved])["id"], collection["id"])
        with store.connect() as db:
            db.execute("UPDATE heads SET live=NULL WHERE id='LAB3D-04'")
        unavailable = self.call(["shared", shared["shareToken"]])["cases"][0]
        self.assertFalse(unavailable["available"])
        self.assertIn("ritirata", unavailable["reason"])
        with self.assertRaises(Problem):
            self.call(["spec", "LAB3D-04"])

    def test_shared_token_does_not_grant_resource_access(self):
        saved = self.save()
        collection = self.collection([saved])
        shared = self.call(["collections", collection["id"], "share"], {"revision": 1, "shared": True}, self.alice)
        with patch.object(store, "can_read", lambda db, user, rows, rec: bool(user and user["id"] == self.alice["id"])):
            public = self.call(["shared", shared["shareToken"]])
            self.assertFalse(public["cases"][0]["available"])
            self.assertIsNone(public["cases"][0]["case"])
            self.assertTrue(self.call(["shared", shared["shareToken"]], user=self.alice)["cases"][0]["available"])

    def test_wire_examples_match_published_json_schema(self):
        saved = self.save()
        collection = self.collection([saved])
        shared = self.call(["collections", collection["id"], "share"], {"revision": 1, "shared": True}, self.alice)
        examples = {
            "case": self.case,
            "specification": self.call(["spec", "LAB3D-04"]),
            "validation": self.call(["validate"], {"case": self.case}),
            "caseDocument": saved,
            "collection": self.call(["shared", shared["shareToken"]]),
            "notebook": self.call(["me"], user=self.alice),
        }
        source = """
          import Ajv from 'ajv/dist/2020.js';
          import {readFileSync} from 'node:fs';
          const schema=JSON.parse(readFileSync('multidiscipline/contracts/resource-cases-v1.schema.json'));
          const ajv=new Ajv(); ajv.addSchema(schema,'cases');
          for(const [name,value] of Object.entries(JSON.parse(process.argv[1]))) {
            const valid=ajv.getSchema('cases#/$defs/'+name);
            if(!valid(value)) throw Error(name+': '+JSON.stringify(valid.errors));
          }
        """
        subprocess.run(["node", "--input-type=module", "-e", source, json.dumps(examples)],
                       cwd=cases.ROOT, check=True, capture_output=True, text=True)

    def test_http_uses_existing_origin_session_and_bounded_transport(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        base = "http://127.0.0.1:" + str(server.server_port)
        def fetch(path, body=None, headers=None):
            req = request.Request(base + path, data=body, headers=headers or {})
            try:
                response = request.urlopen(req, timeout=5)
            except error.HTTPError as exc:
                response = exc
            with response:
                return response.status, response.read()
        try:
            self.assertEqual(fetch("/api/v1/resource-cases/spec/LAB3D-04")[0], 200)
            status, schema = fetch("/api/v1/schemas/resource-cases-v1.schema.json")
            self.assertEqual(status, 200)
            self.assertIn("case", json.loads(schema)["$defs"])
            status, openapi = fetch("/api/v1/openapi.json")
            self.assertEqual(status, 200)
            self.assertIn("/v1/resource-cases/shared/{token}", json.loads(openapi)["paths"])
            self.assertEqual(fetch("/api/v1/resource-cases/me")[0], 401)
            body = json.dumps({"case": self.case}).encode()
            headers = {"Content-Type": "application/json", "X-Astra-Request": "1"}
            self.assertEqual(fetch("/api/v1/resource-cases/validate", body, headers)[0], 200)
            self.assertEqual(fetch("/api/v1/resource-cases/validate", body, dict(headers, Origin="https://elsewhere.test"))[0], 403)
            self.assertEqual(fetch("/api/v1/resource-cases/validate", body, {"Content-Type": "application/json"})[0], 403)
            self.assertEqual(fetch("/api/v1/resource-cases/validate", b"x"*16385, headers)[0], 413)
            self.assertEqual(fetch("/api/v1/resource%2dcases/validate", b"x"*16385, headers)[0], 413)
            self.assertEqual(fetch("/multidiscipline/resource_cases.py")[0], 404)
            with store.connect() as db:
                db.execute("INSERT INTO sessions VALUES(?,?,?)", (store.digest("resource-test-session"), self.alice["id"], store.NOW()+60))
            signed = dict(headers, Cookie="astra_session=resource-test-session")
            payload = json.dumps({"requestId": "session-bound", "title": "Caso della sessione", "case": self.case}).encode()
            self.assertEqual(fetch("/api/v1/resource-cases/cases", payload,
                                   dict(signed, **{"X-Officina-Session": draft_scope("other-test-session")}))[0], 409)
            self.assertEqual(self.call(["me"], user=self.alice)["totalCases"], 0)
            self.assertEqual(fetch("/api/v1/resource-cases/cases", payload,
                                   dict(signed, **{"X-Officina-Session": draft_scope("resource-test-session")}))[0], 200)
            self.assertEqual(fetch("/api/v1/resource-cases/cases", payload, signed)[0], 200)
            self.assertEqual(self.call(["me"], user=self.alice)["totalCases"], 1)
        finally:
            server.shutdown()
            server.server_close()
            worker.join(timeout=5)


if __name__ == "__main__":
    unittest.main()
