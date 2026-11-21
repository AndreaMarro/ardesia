#!/usr/bin/env python3
"""Launch Officina di Fisica or manage the local installation."""

import argparse
import getpass
import json
import os
import secrets
import sys
import urllib.request
import webbrowser

from server.store import (
    DATA,
    NOW,
    ROOT,
    Problem,
    audit,
    catalog_seed,
    connect,
    digest,
    initialize,
    password_hash,
    published,
    require,
)
from server.web import Handler, ThreadingHTTPServer


def main():
    p = argparse.ArgumentParser(description="Officina di Fisica")
    p.add_argument(
        "action",
        nargs="?",
        default="serve",
        choices=["serve", "autore", "password-autore", "pdf"],
    )
    p.add_argument(
        "--port", type=int, default=int(os.environ.get("ASTRA_PORT", "8843"))
    )
    p.add_argument("--host", default=os.environ.get("ASTRA_HOST", "127.0.0.1"))
    p.add_argument("--open", action="store_true")
    p.add_argument("--course", default="")
    p.add_argument("--book", default="")
    p.add_argument(
        "--pack", action="store_true", help="Rigenera i PDF distribuibili dal seed"
    )
    args = p.parse_args()
    initialize()
    url = "http://127.0.0.1:" + str(args.port) + "/"
    if args.action == "autore":
        try:
            with urllib.request.urlopen(url + "api/health", timeout=3) as reply:
                require(
                    json.load(reply).get("product") == "officina-di-fisica",
                    "Il servizio sulla porta scelta appartiene a un’altra applicazione.",
                )
        except (OSError, ValueError):
            raise Problem(
                "Avvia prima il server di Officina di Fisica sulla stessa porta."
            )
        t = secrets.token_urlsafe(32)
        with connect() as db:
            db.execute("DELETE FROM tickets WHERE expires<?", (NOW(),))
            db.execute("INSERT INTO tickets VALUES(?,?)", (digest(t), NOW() + 150))
        webbrowser.open(url + "#autore-accesso/" + t)
        print("Aperto il collegamento locale monouso (150 secondi).")
        return
    if args.action == "password-autore":
        mail = input("Email autore: ").strip().casefold()
        pwd = getpass.getpass("Password (almeno 14 caratteri): ")
        require("@" in mail and len(pwd) >= 14, "Credenziali non valide.")
        with connect() as db:
            db.execute(
                "UPDATE users SET email=?,hash=? WHERE id='owner'",
                (mail, password_hash(pwd)),
            )
            db.execute("DELETE FROM sessions WHERE user='owner'")
            audit(db, "owner", "credenziali aggiornate", "account")
        return
    if args.action == "pdf":
        from concurrent.futures import ThreadPoolExecutor

        from server.printing import generate, titles

        with connect() as db:
            rows = list(catalog_seed()) if args.pack else published(db)
        jobs = [
            (r["id"], b)
            for r in rows
            if r["kind"] == "course" and (not args.course or args.course == r["id"])
            for b in titles(r["id"])
            if not args.book or b == args.book
        ]

        def job(z):
            c, b = z
            generate(rows, c, b, ROOT / "materials" if args.pack else DATA / "pdf")
            print(c, b, flush=True)

        with ThreadPoolExecutor(2) as workers:
            list(workers.map(job, jobs))
        return
    service = ThreadingHTTPServer((args.host, args.port), Handler)
    print("Officina di Fisica · " + url, flush=True)
    if args.open:
        webbrowser.open(url)
    try:
        service.serve_forever()
    except KeyboardInterrupt:
        print("Officina di Fisica chiusa.")
    finally:
        service.server_close()


if __name__ == "__main__":
    try:
        main()
    except (Problem, OSError) as e:
        sys.exit(str(e))
