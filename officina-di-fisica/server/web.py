"""JSON HTTP interface; only public presentation files are served from static/."""

import hmac
import json
import mimetypes
import os
import re
import secrets
from http import cookies
from http.server import BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer as ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlparse

from . import commerce, editor, learning
from .store import (
    DATA,
    NOW,
    ROOT,
    Problem,
    audit,
    can_read,
    config,
    connect,
    courses_for,
    digest,
    encode,
    entitled,
    in_course,
    need_author,
    need_user,
    password_hash,
    published,
    record,
    require,
    safe_key,
)


def account(db, user):
    return (
        {
            "id": user["id"],
            "email": user["email"]
            if user["role"] != "lettore"
            else "Quaderno di prova",
            "role": user["role"],
        }
        if user
        else None
    )


def short(r):
    return {
        k: r[k]
        for k in (
            "id",
            "kind",
            "course",
            "title",
            "section",
            "order",
            "skill",
            "version",
            "summary",
            "includes",
            "reuse",
            "difficulty",
            "model",
            "related",
            "plate",
            "labTitle",
            "exam",
        )
        if k in r
    }


def auth_limit(db, key):
    row = db.execute("SELECT * FROM failures WHERE key=?", (key,)).fetchone()
    require(
        not row or NOW() - row["start"] > 600 or row["num"] < 18,
        "Troppi tentativi. Riprova fra dieci minuti.",
        429,
    )


def fail_login(db, key):
    row = db.execute("SELECT * FROM failures WHERE key=?", (key,)).fetchone()
    if not row or NOW() - row["start"] > 600:
        db.execute("INSERT OR REPLACE INTO failures VALUES(?,1,?)", (key, NOW()))
    else:
        db.execute("UPDATE failures SET num=num+1 WHERE key=?", (key,))
    db.commit()


class Handler(BaseHTTPRequestHandler):
    server_version = "Officina/1"

    def log_message(self, fmt, *args):
        if os.environ.get("ASTRA_LOG") == "1":
            super().log_message(fmt, *args)

    def response(
        self, body, status=200, mime="application/json; charset=utf-8", headers=None
    ):
        data = body if isinstance(body, bytes) else encode(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header(
            "Cache-Control",
            "no-store"
            if not self.path.startswith("/vendor/")
            else "public, max-age=604800",
        )
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; form-action 'self'",
        )
        if getattr(self, "cookie_header", None):
            self.send_header("Set-Cookie", self.cookie_header)
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def cookie(self, token, age):
        self.cookie_header = (
            f"astra_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={age}"
            + ("; Secure" if os.environ.get("ASTRA_HTTPS") == "1" else "")
        )

    def login(self, db, uid):
        token = secrets.token_urlsafe(32)
        age = 14 * 86400
        db.execute("DELETE FROM sessions WHERE expires<?", (NOW(),))
        db.execute(
            "INSERT INTO sessions VALUES(?,?,?)", (digest(token), uid, NOW() + age)
        )
        self.cookie(token, age)
        return {"ok": True}

    def do_GET(self):
        self.handle_request(False)

    def do_POST(self):
        self.handle_request(True)

    def handle_request(self, write):
        self.cookie_header = None
        try:
            path = unquote(urlparse(self.path).path)
            if not write and not (
                path.startswith("/api/")
                or path.startswith("/asset/")
                or path.startswith("/figures/")
                or path.startswith("/download/")
            ):
                require("\0" not in path, "Percorso non valido.")
                path = path.lstrip("/") or "index.html"
                f = (ROOT / "static" / path).resolve()
                require(
                    f.is_relative_to(ROOT / "static") and f.is_file(),
                    "Risorsa non trovata.",
                    404,
                )
                return self.response(
                    f.read_bytes(),
                    mime=mimetypes.guess_type(f.name)[0] or "application/octet-stream",
                )
            data = {}
            if write:
                require(
                    self.headers.get("X-Astra-Request") == "1"
                    and self.headers.get_content_type() == "application/json",
                    "Richiesta non valida.",
                    403,
                )
                origin = self.headers.get("Origin")
                require(
                    not origin or urlparse(origin).netloc == self.headers.get("Host"),
                    "Origine non valida.",
                    403,
                )
                size = int(self.headers.get("Content-Length", "0"))
                require(0 < size <= 40_000_000, "Richiesta troppo grande o vuota.", 413)
                data = json.loads(self.rfile.read(size))
                require(isinstance(data, dict), "Dati JSON non validi.")
            raw = cookies.SimpleCookie(self.headers.get("Cookie", ""))
            token = raw.get("astra_session")
            token = token.value if token else ""
            with connect() as db:
                if write or path.startswith("/api/run/"):
                    db.execute("BEGIN IMMEDIATE")
                user = db.execute(
                    "SELECT u.* FROM users u JOIN sessions s ON u.id=s.user WHERE token=? AND expires>?",
                    (digest(token), NOW()),
                ).fetchone()
                parts = path.strip("/").split("/")
                result = self.route(db, user, parts, data, write, token)
            if isinstance(result, tuple):
                self.response(result[0], mime=result[1], headers=result[2])
            else:
                self.response(result)
        except Problem as e:
            self.response({"error": str(e)}, e.status)
        except (ValueError, TypeError, KeyError, OverflowError) as e:
            self.response({"error": "Dati non validi. " + str(e)[:140]}, 400)
        except (ConnectionError, BrokenPipeError):
            pass
        except Exception:
            import traceback

            traceback.print_exc()
            self.response(
                {"error": "Operazione interrotta. I dati salvati sono al sicuro."}, 500
            )

    def route(self, db, u, p, d, post, token):
        path = "/".join(p)
        if not post and path == "api/health":
            return {"product": "officina-di-fisica", "edition": "1.0.0"}
        if post and path in (
            "api/register",
            "api/login",
            "api/demo",
            "api/owner",
            "api/logout",
        ):
            if path == "api/logout":
                db.execute("DELETE FROM sessions WHERE token=?", (digest(token),))
                self.cookie("", 0)
                return {"ok": True}
            if path == "api/demo":
                require(
                    config(db).get("mode", "verifica") == "verifica",
                    "Quaderno di prova chiuso.",
                    403,
                )
                uid = secrets.token_hex(12)
                db.execute(
                    "INSERT INTO users VALUES(?,?,?,'lettore',?)",
                    (uid, uid + "@prova.invalid", "!", NOW()),
                )
                return self.login(db, uid)
            if path == "api/owner":
                require(
                    self.client_address[0] in ("127.0.0.1", "::1"),
                    "Accesso locale richiesto.",
                    403,
                )
                key = digest(str(d.get("ticket", "")))
                require(
                    db.execute(
                        "DELETE FROM tickets WHERE hash=? AND expires>=?", (key, NOW())
                    ).rowcount,
                    "Collegamento scaduto. Riapri Area autore dal computer.",
                    403,
                )
                return self.login(db, "owner")
            mail = str(d.get("email", "")).strip().casefold()
            pwd = str(d.get("password", ""))
            require(0 < len(mail) <= 254 and len(pwd) <= 512, "Credenziali non valide.")
            limit = digest(self.client_address[0])
            auth_limit(db, limit)
            if path == "api/register":
                require(
                    re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", mail) and len(pwd) >= 10,
                    "Usa un’email valida e almeno 10 caratteri per la password.",
                )
                require(
                    not db.execute(
                        "SELECT id FROM users WHERE email=?", (mail,)
                    ).fetchone(),
                    "Indirizzo non disponibile. Accedi al tuo account.",
                    409,
                )
                uid = secrets.token_hex(12)
                db.execute(
                    "INSERT INTO users VALUES(?,?,?,'studente',?)",
                    (uid, mail, password_hash(pwd), NOW()),
                )
                return self.login(db, uid)
            candidate = db.execute(
                "SELECT * FROM users WHERE email=?", (mail,)
            ).fetchone()
            good = (
                candidate
                and "." in candidate["hash"]
                and hmac.compare_digest(
                    password_hash(pwd, candidate["hash"].split(".")[0]),
                    candidate["hash"],
                )
            )
            if not good:
                fail_login(db, limit)
                raise Problem("Email o password non corrette.", 401)
            return self.login(db, candidate["id"])
        if p[:2] == ["api", "author"]:
            need_author(u)
            return self.author(db, u, p[2:], d, post)
        rows = published(db)
        if not post and path == "api/state":
            courses = sorted(
                (r for r in rows if r["kind"] == "course"), key=lambda r: r["order"]
            )
            return {
                "user": account(db, u),
                "mode": config(db).get("mode", "verifica"),
                "courses": [
                    dict(
                        short(c),
                        owned=entitled(db, u, rows, c["id"]),
                        counts={
                            k: len(in_course(rows, c["id"], k))
                            for k in ("lesson", "example", "question", "lab", "bench")
                        },
                    )
                    for c in courses
                ],
                "benches": sorted((short(r) for r in rows if r["kind"] == "bench"), key=lambda r: r["order"]),
                "labs": [short(r) for r in rows if r["kind"] == "lab"],
            }
        if not post and p[:2] == ["api", "course"] and len(p) == 3:
            c = record(db, p[2])
            require(c["kind"] == "course", "Percorso non trovato.", 404)
            group = in_course(rows, c["id"])
            visible = entitled(db, u, rows, c["id"])
            previews = []
            for k in ("lesson", "example", "question"):
                r = next(
                    (
                        r
                        for r in group
                        if r["kind"] == k
                        and r["course"] == c["id"]
                        and not r.get("exam")
                    ),
                    None,
                )
                if r:
                    previews.append(r["id"])
            return {
                "course": short(c),
                "activities": [r for r in group if r["kind"] == "method" and r["course"] == c["id"]],
                "owned": visible,
                "items": [short(r) for r in group if not r.get("exam")],
                "preview": previews,
                "offers": commerce.offers(db, c["id"]),
                "terms": config(db).get("terms", ""),
            }
        if post and path == "api/recupero":
            need_user(u)
            course = d.get("course")
            require(
                entitled(db, u, rows, course),
                "Apri il percorso per consultare il recupero.",
                403,
            )
            group = [
                q for q in in_course(rows, course, "question") if not q.get("exam")
            ]
            r = next((q for q in group if q["id"] == d.get("id")), None)
            require(r, "Situazione non presente nella raccolta del percorso.", 404)
            learning.mark_exposed(db, u, r, {})
            target = learning.recovery_resource(rows, r)
            if target and not can_read(db, u, rows, target):
                target = None
            return {
                "prompt": r["prompt"],
                "figures": r.get("promptBlocks", []),
                "options": r["answer"].get("options", []),
                "solution": r["blocks"],
                "error": r["error"],
                "target": short(target) if target else None,
                "canRetest": any(
                    q["skill"] == r["skill"] and q["family"] != r["family"]
                    for q in group
                ),
            }
        if p[:2] == ["api", "item"] and len(p) == 3:
            r = next((r for r in rows if r["id"] == p[2]), None)
            require(r, "Materiale ritirato o non disponibile.", 404)
            require(
                can_read(db, u, rows, r),
                "Accedi al percorso per aprire il materiale.",
                403,
            )
            if r["kind"] == "question":
                if post:
                    require(
                        can_read(db, None, rows, r) and "value" in d,
                        "Apri un’esercitazione per rispondere.",
                        403,
                    )
                    if u:
                        learning.mark_exposed(db, u, r, {})
                    return {
                        "correct": learning.matches(r["answer"], d["value"]),
                        "key": r["answer"]["value"],
                        "solution": r["blocks"],
                        "error": r.get("error", {}),
                    }
                return dict(
                    learning.outline(r),
                    kind="question",
                    title=r["title"],
                    course=r["course"],
                )
            require(not post, "Operazione non disponibile.", 405)
            if r["kind"] == "lesson":
                topics = [
                    dict(t, bench=b["id"], index=i)
                    for b in rows if b["kind"] == "bench"
                    for i, t in enumerate(b.get("topics", [])) if t["lesson"] == r["id"]
                ]
                r = dict(r, benchTopics=topics)
            if u and r["kind"] in ("lesson", "example"):
                last = db.execute(
                    "SELECT v FROM reads WHERE user=? AND id=?", (u["id"], r["id"])
                ).fetchone()
                return dict(r, readVersion=last[0] if last else None)
            return r
        if post and path == "api/read":
            need_user(u)
            r = record(db, d["id"])
            require(
                any(q["id"] == r["id"] for q in rows)
                and r["kind"] in ("lesson", "example")
                and can_read(db, u, rows, r),
                "Lettura non disponibile.",
                403,
            )
            db.execute(
                "INSERT OR REPLACE INTO reads VALUES(?,?,?,?)",
                (u["id"], r["id"], r["version"], NOW()),
            )
            return {"ok": True}
        if post and path == "api/observation":
            need_user(u)
            r = record(db, d["id"])
            require(
                r["kind"] in ("bench", "lab") and can_read(db, u, rows, r),
                "Laboratorio non disponibile.",
                403,
            )
            require(
                str(d.get("prediction", "")).strip() and str(d.get("note", "")).strip(),
                "Scrivi previsione e osservazione.",
            )
            db.execute(
                "INSERT INTO lab_events(user,lab,observation,stamp) VALUES(?,?,?,?)",
                (
                    u["id"],
                    r["id"],
                    encode(
                        {
                            k: str(d.get(k, ""))[:2000]
                            for k in ("prediction", "note", "parameters")
                        }
                    ),
                    NOW(),
                ),
            )
            return {"ok": True}
        if not post and path == "api/studio":
            need_user(u)
            return dict(
                learning.stats(db, u, rows),
                orders=[
                    commerce.public(r)
                    for r in db.execute(
                        "SELECT * FROM orders WHERE user=? ORDER BY stamp DESC",
                        (u["id"],),
                    )
                ],
            )
        if post and path == "api/runs":
            return learning.start(db, u, rows, d)
        if p[:2] == ["api", "run"] and len(p) == 3:
            return learning.details(db, u, rows, p[2], d if post else None)
        if post and path == "api/orders":
            return commerce.create(db, u, rows, d)
        if post and p[:2] == ["api", "order"] and len(p) == 3:
            return commerce.operation(db, u, p[2], d)
        if not post and p[0] in ("asset", "figures") and len(p) == 2:
            src = "/" + path
            if p[0] == "figures":
                require(
                    re.fullmatch(r"[A-Za-z0-9_.-]+[.]svg", p[1]),
                    "Tavola non valida.",
                    404,
                )
                f = ROOT / "static" / "figures" / p[1]
                require(f.is_file(), "Tavola non trovata.", 404)
                mime = "image/svg+xml"
                name = f.name
            else:
                meta = db.execute("SELECT * FROM assets WHERE id=?", (p[1],)).fetchone()
                require(meta, "File non trovato.", 404)
                f = DATA / "uploads" / p[1]
                mime = meta["mime"]
                name = meta["name"]
            available = (u and u["role"] == "autore") or any(
                any(
                    b.get("src") == src for b in r["blocks"] + r.get("promptBlocks", [])
                )
                and can_read(db, u, rows, r)
                for r in rows
            )
            require(
                available or learning.historical_asset(db, u, rows, src),
                "Accesso al file richiesto.",
                403,
            )
            return (
                f.read_bytes(),
                mime,
                {
                    "Content-Disposition": (
                        "attachment" if mime == "application/pdf" else "inline"
                    )
                    + "; filename*=UTF-8''"
                    + quote(name, safe="")
                },
            )
        if not post and p[0] == "download" and len(p) == 3:
            from .printing import locate

            require(entitled(db, u, rows, p[1]), "Accesso al percorso richiesto.", 403)
            f = locate(rows, p[1], p[2])
            require(f, "Edizione PDF da rigenerare nell’area autore.", 409)
            return (
                f.read_bytes(),
                "application/pdf",
                {
                    "Content-Disposition": 'attachment; filename="'
                    + p[1]
                    + "-"
                    + p[2]
                    + '.pdf"'
                },
            )
        raise Problem("Risorsa non trovata.", 404)

    def author(self, db, u, p, d, post):
        route = "/".join(p)
        if not post and len(p) == 2 and p[0] == "inventario":
            import subprocess
            import sys
            import tempfile

            names = {
                "record": "inventario-record.csv",
                "copertura": "inventario-copertura.csv",
            }
            require(p[1] in names, "Inventario sconosciuto.", 404)
            with tempfile.TemporaryDirectory() as target:
                subprocess.run(
                    [
                        sys.executable,
                        str(ROOT / "tools" / "inventario.py"),
                        "--database",
                        str(DATA / "officina.sqlite3"),
                        "--out",
                        target,
                    ],
                    cwd=ROOT,
                    check=True,
                    timeout=45,
                    capture_output=True,
                )
                name = names[p[1]]
                return (
                    (Path(target) / name).read_bytes(),
                    "text/csv; charset=utf-8",
                    {"Content-Disposition": 'attachment; filename="' + name + '"'},
                )
        if not post and route == "list":
            obj, hs = editor.workspace(db)
            return [
                {
                    "id": k,
                    "title": r["title"],
                    "kind": r["kind"],
                    "course": r["course"],
                    "section": r["section"],
                    "skill": r.get("skill", ""),
                    "order": r["order"],
                    **hs[k],
                }
                for k, r in obj.items()
            ]
        if not post and len(p) == 2 and p[0] == "item":
            obj, hs = editor.workspace(db)
            k = p[1]
            require(k in obj, "Materiale non trovato.", 404)
            history = [
                dict(r)
                for r in db.execute(
                    "SELECT v,actor,stamp FROM versions WHERE id=? ORDER BY v DESC",
                    (k,),
                )
            ]
            return {
                "record": obj[k],
                "head": hs[k],
                "base": history[0]["v"],
                "history": history,
                "used": sorted(courses_for(list(obj.values()), obj[k])),
            }
        if not post and route == "export":
            return editor.export(db)
        if post and route == "save":
            rec = d["record"]
            require(
                safe_key(rec.get("id"))
                and rec.get("kind") in editor.KINDS
                and isinstance(rec.get("title"), str)
                and isinstance(rec.get("blocks"), list),
                "ID, tipo, titolo e blocchi richiesti per salvare.",
            )
            if next(
                (
                    r
                    for r in db.execute("SELECT id FROM heads WHERE id=?", (rec["id"],))
                ),
                None,
            ):
                old = db.execute(
                    "SELECT payload FROM versions WHERE id=? ORDER BY v DESC LIMIT 1",
                    (rec["id"],),
                ).fetchone()
                require(
                    json.loads(old[0])["kind"] == rec["kind"],
                    "Il tipo di un materiale esistente è stabile.",
                )
            return {"v": editor.write_draft(db, u, rec, d.get("base", 0))}
        if post and route == "publish":
            return editor.publish(db, u, d["targets"])
        if post and route == "restore":
            return {
                "v": editor.write_draft(
                    db, u, record(db, d["id"], int(d["v"])), d["base"]
                )
            }
        if post and route == "withdraw":
            h = db.execute("SELECT live FROM heads WHERE id=?", (d["id"],)).fetchone()
            require(h and h[0] == d.get("live"), "Versione pubblicata cambiata.", 409)
            db.execute("UPDATE heads SET live=NULL WHERE id=?", (d["id"],))
            audit(db, u["id"], "ritiro", d["id"])
            return {"ok": True}
        if post and route == "import":
            return editor.imported(db, u, d["package"], d.get("commit") is True)
        if post and route == "upload":
            return editor.save_asset(db, d)
        if not post and route == "commerce":
            return {
                "config": config(db),
                "orders": [
                    dict(commerce.public(r), email=r["email"])
                    for r in db.execute(
                        "SELECT o.*,u.email FROM orders o JOIN users u ON o.user=u.id ORDER BY o.stamp DESC"
                    )
                ],
                "audit": [
                    dict(r)
                    for r in db.execute(
                        "SELECT * FROM audit ORDER BY seq DESC LIMIT 80"
                    )
                ],
            }
        if post and route == "commerce":
            return commerce.update(db, u, d)
        if route == "pdf":
            from .printing import queue, status

            rows = published(db)
            return queue(rows, d["course"], d["book"]) if post else status(rows)
        raise Problem("Strumento non trovato.", 404)
