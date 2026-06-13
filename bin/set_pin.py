#!/usr/bin/env python3
"""Ardesia — set_pin.py <repo> <testo task...>
Imposta il pin attivo di un repo (ordine immediato di Andrea via Telegram = autorita supervisore).
Scrive la riga in ## PROSSIMA TASK, committa. ARDESIA_ROOT per canary isolato. Exit 0 = ok."""
import datetime, os, re, subprocess, sys
repo = sys.argv[1] if len(sys.argv) > 1 else ""
task = " ".join(sys.argv[2:]).strip()
if repo not in ("lessonos", "studio") or not task:
    print("uso: set_pin.py <lessonos|studio> <testo task>"); sys.exit(1)
ROOT = os.environ.get("ARDESIA_ROOT", os.path.expanduser("~/lessonos"))
COORD = os.path.join(ROOT, "COORDINATION.md")
s = open(COORD, encoding="utf-8").read()
m = re.search(rf"^(\|*\s*- \*\*{repo}\*\*:).*$", s, flags=re.M)
now = datetime.datetime.now().strftime("%d/%m %H:%M")
new_line = f"- **{repo}**: [ORDINE-ANDREA {now}] **{task}**"
if not m:
    print(f"riga pin {repo} non trovata"); sys.exit(1)
s2 = s[:m.start()] + new_line + s[m.end():]
open(COORD, "w", encoding="utf-8").write(s2)
subprocess.run(["git", "-C", ROOT, "add", "COORDINATION.md"], capture_output=True)
r = subprocess.run(["git", "-C", ROOT, "commit", "-q", "-m",
    f"coord: ORDINE ANDREA via Telegram — pin {repo} = {task[:60]}\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"],
    capture_output=True, text=True)
if r.returncode != 0:
    print(f"commit fallito: {r.stderr[-200:]}"); sys.exit(1)
print(f"pin {repo} impostato: {task[:80]}")
sys.exit(0)
