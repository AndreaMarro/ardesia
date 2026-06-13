#!/usr/bin/env python3
"""Ardesia — set_pin.py <repo> <testo task...>
Imposta il pin attivo (ordine immediato Andrea via Telegram). ARDESIA_ROOT per canary.
Commit con VERIFY+RETRY (anti-race col reset --hard del driver: se la scrittura viene
revertita da una lane parallela, ritenta). Exit 0 = pin verificato in HEAD."""
import datetime, os, re, subprocess, sys, time
repo = sys.argv[1] if len(sys.argv) > 1 else ""
task = " ".join(sys.argv[2:]).strip()
if repo not in ("lessonos", "studio") or not task:
    print("uso: set_pin.py <lessonos|studio> <testo task>"); sys.exit(1)
ROOT = os.environ.get("ARDESIA_ROOT", os.path.expanduser("~/lessonos"))
COORD = os.path.join(ROOT, "COORDINATION.md")
now = datetime.datetime.now().strftime("%d/%m %H:%M")
new_line = f"- **{repo}**: [ORDINE-ANDREA {now}] **{task}**"

def attempt():
    s = open(COORD, encoding="utf-8").read()
    m = re.search(rf"^\|*\s*- \*\*{repo}\*\*:.*$", s, flags=re.M)
    if not m:
        return "no-pinline"
    s2 = s[:m.start()] + new_line + s[m.end():]
    open(COORD, "w", encoding="utf-8").write(s2)
    subprocess.run(["git", "-C", ROOT, "add", "COORDINATION.md"], capture_output=True)
    r = subprocess.run(["git", "-C", ROOT, "commit", "-q", "-m",
        f"coord: ORDINE ANDREA via Telegram — pin {repo} = {task[:60]}\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"],
        capture_output=True, text=True)
    # verify: la riga e' in HEAD?
    head = subprocess.run(["git", "-C", ROOT, "show", "HEAD:COORDINATION.md"], capture_output=True, text=True).stdout
    return "ok" if ("ORDINE-ANDREA" in head and task[:40] in head) else "race"

for i in range(4):
    res = attempt()
    if res == "ok":
        print(f"pin {repo} impostato: {task[:80]}"); sys.exit(0)
    if res == "no-pinline":
        print(f"riga pin {repo} non trovata"); sys.exit(1)
    time.sleep(0.3 * (i + 1))  # race: ritenta
print(f"pin {repo} NON confermato dopo retry (race persistente)"); sys.exit(1)
