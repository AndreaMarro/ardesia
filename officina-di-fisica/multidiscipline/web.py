"""Mount the optional discipline runtime alongside the published Physics application."""
import hmac
import json
import mimetypes
import os
import posixpath
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

from server import commerce, store
from server.adapters.orders import SQLiteOrders
from server.application import orders
from server.web import Handler as PhysicsHandler
from server.web import draft_scope

from . import editions, resource_cases, study
from .rational import compare
from .frontend import public_asset

ROOT = Path(__file__).resolve().parent
CONTRACTS = ROOT / "contracts"


class DisciplineOrders(SQLiteOrders):
    def courses(self):
        return super().courses() + editions.sale_courses(self.db)

    def course_title(self, course):
        if course.startswith("D~"):
            row = next((c for c in editions.sale_courses(self.db) if c["id"] == course), None)
            store.require(row, "Percorso non disponibile.", 404)
            return row["title"]
        return super().course_title(course)


class Handler(PhysicsHandler):
    def dispatch_officina(self, write):
        path = unquote(urlparse(self.path).path)
        canonical = "/" + posixpath.normpath(path).lstrip("/")
        # The parent endpoint validates origins, JSON, sessions and access to protected assets.
        # Bound discipline request bodies before delegating their parsing to the shared transport.
        if write and canonical.lower().startswith(("/api/v1/mathematics/", "/api/v1/disciplines/", "/api/v1/resource-cases")):
            length = self.headers.get("Content-Length", "")
            limit = 16384 if canonical.lower().startswith("/api/v1/resource-cases") else 8192
            if not length.isascii() or not length.isdecimal() or len(length) > 5 or not 0 < int(length) <= limit:
                self.started = time.monotonic()
                self.close_connection = True
                return self.response({"error": "Richiesta troppo grande o vuota."}, 413)
        if not write and (path == "/" or path.startswith("/multidiscipline/")):
            self.started = time.monotonic()
            name = "index.html" if path == "/" else path.removeprefix("/multidiscipline/")
            try:
                data = public_asset(name)
            except KeyError:
                return self.response({"error": "Risorsa non trovata."}, 404)
            return self.response(data, mime=mimetypes.guess_type(name)[0] or "application/octet-stream")
        return super().dispatch_officina(write)

    def authorized_request(self, path, data, write, token, mutable):
        if write and path == "/api/v1/mathematics/compare":
            return compare(data)
        return super().authorized_request(path, data, write, token, mutable)

    def route(self, db, user, parts, data, post, token):
        personal_write = post and (
            (parts[:3] == ["api", "v1", "disciplines"] and parts[-1] in ("events", "context"))
            or (parts[:3] == ["api", "v1", "resource-cases"] and parts[3:] != ["validate"]))
        scope = self.headers.get("X-Officina-Session") if personal_write else None
        if scope is not None:
            store.need_user(user)
            store.require(hmac.compare_digest(scope.encode(), draft_scope(token).encode()),
                          "L’accesso è cambiato. Riapri la pagina prima di salvare.", 409)
        if parts[:3] == ["api", "v1", "resource-cases"]:
            return resource_cases.route(db, user, parts[3:], data, post)
        if parts[:3] == ["api", "v1", "disciplines"]:
            local = os.environ.get("ASTRA_HOSTED") != "1" and self.server.server_address[0] in ("127.0.0.1", "::1")
            return study.route(db, user, parts[3:], data, post, local)
        if not post and len(parts) == 4 and parts[:3] == ["api", "v1", "schemas"] and parts[3] in (
                "disciplines-v1.schema.json", "resource-cases-v1.schema.json"):
            return json.loads((CONTRACTS / parts[3]).read_bytes())
        if not post and parts == ["api", "v1", "openapi.json"]:
            result = super().route(db, user, parts, data, post, token)
            for name in ("paths.json", "resource-case-paths.json"):
                paths = json.loads((CONTRACTS / name).read_bytes())
                if result["paths"].keys() & paths.keys():
                    raise ValueError("Un percorso OpenAPI è già registrato dal runtime composto.")
                result["paths"].update(paths)
            return result
        if not post and len(parts) == 3 and parts[:2] == ["api", "course"] and parts[2].startswith("D~"):
            course = next((c for c in editions.sale_courses(db) if c["id"] == parts[2]), None)
            store.require(course, "Percorso non trovato.", 404)
            return {"course": course, "items": [], "preview": [], "activities": [],
                    "owned": store.entitled(db, user, [course], parts[2]), "offers": commerce.offers(db, parts[2]),
                    "terms": store.config(db).get("terms", "")}
        if post and parts == ["api", "orders"] and isinstance(data.get("course"), str) and data["course"].startswith("D~"):
            return orders.create(DisciplineOrders(db), user, editions.sale_courses(db), data)
        return super().route(db, user, parts, data, post, token)

    def author(self, db, user, parts, data, post):
        if parts == ["commerce"]:
            if post:
                return orders.update(DisciplineOrders(db), user, data)
            result = super().author(db, user, parts, data, post)
            result["disciplineCourses"] = editions.sale_courses(db)
            return result
        return super().author(db, user, parts, data, post)
