#!/usr/bin/env python3
"""Ardesia — mark_pin_done.py <repo> [reason]
Marca il pin attivo [PIN-DONE auto] (auto-heal) + nota NEEDS-CLAUDE, commit con VERIFY+RETRY
(anti-race reset --hard). ARDESIA_ROOT per canary. Idempotente. Exit 0 = marcato o gia marcato."""
import datetime, os, re, subprocess, sys, time
repo = sys.argv[1] if len(sys.argv) > 1 else ""
reason = sys.argv[2] if len(sys.argv) > 2 else "NOOP ripetuti (auto-heal)"
if repo not in ("lessonos", "studio"):
    print("repo invalido"); sys.exit(1)
ROOT = os.environ.get("ARDESIA_ROOT", os.path.expanduser("~/lessonos"))
COORD = os.path.join(ROOT, "COORDINATION.md")
now = datetime.datetime.now().strftime("%d/%m %H:%M")

def attempt():
    s = open(COORD, encoding="utf-8").read()
    m = re.search(rf"^(\|*\s*- \*\*{repo}\*\*:)(.*)$", s, flags=re.M)
    if not m:
        return "no-pinline"
    body = m.group(2)
    if re.search(r"PIN ESAURITO|\[PIN-DONE", body, flags=re.I):
        return "already"
    new_line = f"{m.group(1)} [PIN-DONE auto {now}]{body}"
    s2 = s[:m.start()] + new_line + s[m.end():]
    note = (f"- **[AUTO-HEAL {now}] pin {repo} auto-marcato esaurito ({reason}).** "
            f"Task presumibilmente completata o bloccata; il driver promuove dalla coda o avvisa su Telegram. "
            f"Se era BLOCCATA non completata, ripinnala (Telegram: pin {repo} <task>).")
    mneeds = re.search(r"^## NEEDS-CLAUDE[^\n]*\n", s2, flags=re.M)
    if mneeds:
        i = mneeds.end(); s2 = s2[:i] + note + "\n" + s2[i:]
    open(COORD, "w", encoding="utf-8").write(s2)
    subprocess.run(["git", "-C", ROOT, "add", "COORDINATION.md"], capture_output=True)
    subprocess.run(["git", "-C", ROOT, "commit", "-q", "-m",
        f"autoheal: pin {repo} marcato esaurito ({reason}) — anti-gridlock\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"],
        capture_output=True, text=True)
    head = subprocess.run(["git", "-C", ROOT, "show", "HEAD:COORDINATION.md"], capture_output=True, text=True).stdout
    mh = re.search(rf"^\|*\s*- \*\*{repo}\*\*:(.*)$", head, flags=re.M)
    return "ok" if (mh and re.search(r"\[PIN-DONE", mh.group(1))) else "race"

for i in range(4):
    res = attempt()
    if res == "ok":
        print(f"pin {repo} marcato [PIN-DONE auto]"); sys.exit(0)
    if res == "already":
        print(f"pin {repo} gia esaurito"); sys.exit(0)
    if res == "no-pinline":
        print(f"riga pin {repo} non trovata"); sys.exit(1)
    time.sleep(0.3 * (i + 1))
print(f"pin {repo} NON confermato dopo retry"); sys.exit(1)
