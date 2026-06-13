"""Sicurezza di bin/route.sh — H2 adversarial ee9c76c (CRITICO: source injection).

route.sh legge ~/lessonos/routes.env e ~/.ardesia-routes.override (quest'ultimo
Telegram-writable = NON fidato). Il bug originale faceva `. "$OV"`, eseguendo bash
arbitrario dal file. Questi test girano lo script REALE con HOME isolato e
asseriscono che:
  - una direttiva malevola nell'override NON viene eseguita (no side-effect);
  - il routing legittimo funziona e l'override vince sui valori, non sul codice;
  - un ROLE malformato e' rifiutato (no indirezione su nome variabile sporco).
Non tautologico: il test di iniezione FALLIREBBE sullo script pre-fix (`. "$OV"`).
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ROUTE = ROOT / "bin" / "route.sh"
ROUTES_ENV = ROOT / "routes.env"


def _sandbox(tmp_path: Path, override: str | None) -> dict[str, str]:
    """Crea un HOME isolato con lessonos/bin/route.sh + routes.env reali."""
    home = tmp_path / "home"
    (home / "lessonos" / "bin").mkdir(parents=True)
    shutil.copy(ROUTE, home / "lessonos" / "bin" / "route.sh")
    shutil.copy(ROUTES_ENV, home / "lessonos" / "routes.env")
    if override is not None:
        (home / ".ardesia-routes.override").write_text(override, encoding="utf-8")
    env = dict(os.environ)
    env["HOME"] = str(home)
    return env, home


def _run(env: dict[str, str], home: Path, role: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["bash", str(home / "lessonos" / "bin" / "route.sh"), role],
        env=env,
        capture_output=True,
        text=True,
    )


def test_malicious_override_is_not_executed(tmp_path):
    canary = tmp_path / "PWNED"
    payload = f'ROUTE_BRAIN="x"\ntouch "{canary}"\n'
    env, home = _sandbox(tmp_path, payload)
    res = _run(env, home, "brain")
    assert not canary.exists(), "CODE EXECUTION: l'override e' stato sourceato"
    # la riga-codice e' ignorata, ma l'assegnamento valido resta leggibile
    assert res.stdout.strip() == "x"
    assert res.returncode == 0


def test_command_substitution_in_override_not_executed(tmp_path):
    canary = tmp_path / "SUBST"
    payload = f'ROUTE_BUILDER="$(touch {canary})evil"\n'
    env, home = _sandbox(tmp_path, payload)
    res = _run(env, home, "builder")
    assert not canary.exists(), "command substitution eseguita dall'override"
    # valore non-whitelist ($, parentesi) -> riga rifiutata -> torna al valore di routes.env
    assert res.stdout.strip() == "claude-opus-4-8 claude-sonnet-4-6"


def test_override_value_wins_for_legit_assignment(tmp_path):
    payload = 'ROUTE_BUILDER="claude-fable-5 claude-opus-4-8"\n'
    env, home = _sandbox(tmp_path, payload)
    res = _run(env, home, "builder")
    assert res.stdout.strip() == "claude-fable-5 claude-opus-4-8"


def test_routes_env_value_without_override(tmp_path):
    env, home = _sandbox(tmp_path, None)
    res = _run(env, home, "adversarial")
    assert res.stdout.strip() == "kimi"


def test_malformed_role_rejected(tmp_path):
    env, home = _sandbox(tmp_path, None)
    res = _run(env, home, "brain; rm -rf /")
    assert res.returncode == 2
    assert res.stdout.strip() == ""


def test_unknown_role_empty_not_error(tmp_path):
    env, home = _sandbox(tmp_path, None)
    res = _run(env, home, "nope")
    assert res.returncode == 0
    assert res.stdout.strip() == ""
