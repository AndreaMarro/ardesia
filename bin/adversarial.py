#!/usr/bin/env python3
"""MAESTRO — HERMES-2 v1: red-team decorrelato POST-KEEP (brain kimi-k2.6 ≠ builder deepseek ≠ reviewer claude).

Legge l'ultimo commit del repo indicato e prova a ROMPERLO: bug reali, test che non testano,
edge case mancanti, debito tecnico, violazioni ordini. Report in ~/maestro-logs/adversarial/.
NON tocca i repo (read-only). Idempotente per commit (skippa sha già revisionati).
Uso: python3 adversarial.py [studio|lessonos]
"""
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

repo = sys.argv[1] if len(sys.argv) > 1 else "lessonos"
DIR = os.path.expanduser("~/maestro-studio" if repo == "studio" else "~/lessonos")
OUTDIR = os.path.expanduser("~/maestro-logs/adversarial")
os.makedirs(OUTDIR, exist_ok=True)


def git(*args):
    return subprocess.run(["git", "-C", DIR, *args], capture_output=True, text=True).stdout


sha = git("rev-parse", "--short", "HEAD").strip()
if not sha:
    sys.exit(f"repo {DIR} non leggibile")
if any(f"-{repo}-{sha}.md" in f for f in os.listdir(OUTDIR)):
    print(f"già revisionato {repo}@{sha}")
    sys.exit(0)

subject = git("log", "-1", "--pretty=%s").strip()
stat = git("show", sha, "--stat")
diff = git("show", sha)[:60000]  # cap input

# Key kimi dalla config hermes (mai stamparla)
key = None
with open(os.path.expanduser("~/.hermes/config.yaml")) as f:
    for line in f:
        m = re.search(r"api_key:\s*(\S+)", line)
        if m:
            key = m.group(1)
            break
if not key:
    sys.exit("kimi key non trovata in config")

prompt = f"""Sei HERMES-2, red-team ADVERSARIALE del progetto MAESTRO (onestà brutale, zero compiacenza).
Un altro agente ha committato questo lavoro nel repo {repo} ed è passato dal gate. Il tuo compito è ROMPERLO.
Cerca SOLO problemi VERI, in ordine di gravità: (1) bug reali con input realistici; (2) test tautologici o che
non testano il comportamento dichiarato; (3) edge case mancanti che morderanno; (4) DEBITO TECNICO e manutenibilità
(duplicazione, accoppiamenti, nomi ingannevoli, codice morto); (5) violazioni degli invarianti MAESTRO
(formati aperti, model-agnostic, niente cloud non autorizzato, GDPR Mode A, niente ELAB/Numeria).
Per ogni problema: file:line + perché è vero + fix preciso. Se un problema è grave, inizia la riga con "CRITICO:".
Se il lavoro regge davvero, scrivi "REGGE" e UNA debolezza residua. Max 350 parole, italiano.

COMMIT: {subject}
{stat}
DIFF (troncato a 60k):
{diff}"""

payload = {
    "model": "kimi-k2.6",
    "messages": [{"role": "user", "content": prompt}],
    "temperature": 0.3,
    "max_tokens": 1200,
}
req = urllib.request.Request(
    "https://api.moonshot.ai/v1/chat/completions",
    data=json.dumps(payload).encode(),
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
)
try:
    with urllib.request.urlopen(req, timeout=180) as r:
        body = json.load(r)
    text = body["choices"][0]["message"]["content"]
except Exception as e:  # rete/quota: non bloccare mai il tick
    print(f"HERMES-2 SALTATO (kimi non raggiungibile: {e})")
    sys.exit(0)

ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
out = os.path.join(OUTDIR, f"{ts}-{repo}-{sha}.md")
with open(out, "w") as f:
    f.write(f"# HERMES-2 adversarial — {repo}@{sha} — {subject}\n\n{text}\n")

ncrit = len(re.findall(r"^CRITICO:", text, re.MULTILINE))
print(f"HERMES-2: report {out} — CRITICI: {ncrit}")
if ncrit:
    # segnala al canale (append-only, niente regen): voce NEEDS-CLAUDE per il supervisore
    coord = os.path.expanduser("~/lessonos/COORDINATION.md")
    with open(coord) as f:
        s = f.read()
    marker = "## NEEDS-CLAUDE  (Hermes scrive qui)\n"
    entry = (f"- **[HERMES-2 ADVERSARIAL {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}]** "
             f"{ncrit} problema/i CRITICO/i su `{repo}@{sha}` — report: `{out}` (supervisore: leggere e decidere)\n")
    if marker in s and entry not in s:
        with open(coord, "w") as f:
            f.write(s.replace(marker, marker + entry, 1))
        subprocess.run(["git", "-C", os.path.expanduser("~/lessonos"), "add", "COORDINATION.md"], capture_output=True)
        subprocess.run(["git", "-C", os.path.expanduser("~/lessonos"), "-c", "user.name=Hermes-2",
                        "-c", "user.email=hermes2@macmini.local", "commit", "-qm",
                        f"hermes2: {ncrit} CRITICI su {repo}@{sha}"], capture_output=True)
