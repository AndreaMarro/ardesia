#!/usr/bin/env python3
"""MAESTRO — promote_pin.py <repo> (W2/M18-light, 12/06).
Se il pin del repo e' esaurito e in ## ROADMAP-AUTO c'e' una riga `- [AUTO-OK] <repo>: ...`
(scritte SOLO dal supervisore), la promuove a pin attivo IN UN COMMIT ATOMICO:
pin sostituito + riga rimossa dalla roadmap + tag [AUTO-PINNED]. Cap 2/giorno/repo.
Verifica post-commit (fix giudice). Exit: 0=promosso, 1=niente da promuovere, 2=cap/errore.
"""
import datetime
import os
import re
import subprocess
import sys

repo = sys.argv[1] if len(sys.argv) > 1 else ""
assert repo in ("lessonos", "studio"), f"repo invalido: {repo}"

ROOT = os.path.expanduser("~/lessonos")
COORD = os.path.join(ROOT, "COORDINATION.md")
CAPF = os.path.expanduser(f"~/maestro-logs/.autopin_{repo}_{datetime.date.today().isoformat()}")

# cap 6/giorno/repo
n = 0
if os.path.exists(CAPF):
    n = int(open(CAPF).read().strip() or 0)
if n >= 6:
    print(f"[promote_pin] cap giornaliero raggiunto ({n}/6) per {repo}")
    sys.exit(2)

s = open(COORD, encoding="utf-8").read()

# il pin corrente e' esaurito? (testo PIN ESAURITO / PIN-DONE / vuoto)
mpin = re.search(rf"^\|*\s*- \*\*{repo}\*\*:(.*)$", s, flags=re.M)
if not mpin:
    print(f"[promote_pin] riga pin {repo} non trovata")
    sys.exit(2)
if not re.search(r"PIN ESAURITO|\[PIN-DONE|\[AUTO-PINNED-DONE\]|^\s*$", mpin.group(1), flags=re.I):
    print(f"[promote_pin] pin {repo} ancora attivo, niente da fare")
    sys.exit(1)

# prima riga AUTO-OK per questo repo nella sezione ROADMAP-AUTO
msec = re.search(r"^## ROADMAP-AUTO.*?$([\s\S]*?)(?=^## |\Z)", s, flags=re.M)
if not msec:
    print("[promote_pin] sezione ROADMAP-AUTO assente")
    sys.exit(1)
sec = msec.group(1)
mtask = re.search(rf"^- \[AUTO-OK\] {repo}: (.+)$", sec, flags=re.M)
if not mtask:
    print(f"[promote_pin] nessuna task AUTO-OK in coda per {repo}")
    sys.exit(1)

task_text = mtask.group(1).strip()
new_pin = f"- **{repo}**: [AUTO-PINNED {datetime.datetime.now():%d/%m %H:%M}] {task_text}"

# applica: sostituisci pin + rimuovi riga dalla roadmap
s2 = s[: mpin.start()] + new_pin + s[mpin.end():]
s2 = s2.replace(mtask.group(0) + "\n", "", 1)
open(COORD, "w", encoding="utf-8").write(s2)

r = subprocess.run(["git", "-C", ROOT, "add", "COORDINATION.md"], capture_output=True)
r = subprocess.run(
    ["git", "-C", ROOT, "commit", "-q", "-m",
     f"coord: AUTO-PIN {repo} — promossa task dalla ROADMAP-AUTO (M18-light)\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"],
    capture_output=True, text=True,
)
if r.returncode != 0:
    print(f"[promote_pin] commit FALLITO: {r.stderr[-300:]}")
    sys.exit(2)

# verifica post-commit (fix giudice)
chk = subprocess.run(["git", "-C", ROOT, "show", "HEAD:COORDINATION.md"], capture_output=True, text=True).stdout
if "[AUTO-PINNED" not in chk or task_text[:40] not in chk:
    print("[promote_pin] VERIFICA POST-COMMIT FALLITA")
    sys.exit(2)

open(CAPF, "w").write(str(n + 1))
print(f"[promote_pin] PROMOSSA per {repo}: {task_text[:80]}...")
sys.exit(0)
