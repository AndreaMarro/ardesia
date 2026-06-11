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
import urllib.error
import urllib.request
from datetime import datetime, timezone

repo = sys.argv[1] if len(sys.argv) > 1 else "lessonos"
DIR = os.path.expanduser("~/maestro-studio" if repo == "studio" else "~/lessonos")
OUTDIR = os.path.expanduser("~/maestro-logs/adversarial")
os.makedirs(OUTDIR, exist_ok=True)


def git(*args):
    return subprocess.run(["git", "-C", DIR, *args], capture_output=True, text=True).stdout


# Revisiona l'ultimo commit con CODICE, non l'ultimo in assoluto: un commit
# doc-only (STATUS/log/coord/digest/wiki) non ha nulla da rompere e fa revisionare
# kimi AL BUIO sulle descrizioni. Incidenti: 20260610-1811 (review STATUS invece
# di T2b) e 20260611 (review 311a739 doc invece del codice M1-1 in f814e18).
def _is_doc(f):
    # doc = qualunque .md, .jsonl (log/obs), o file sotto project-wiki/ — niente
    # codice da rompere. Il CODICE e' .py/.sh/.ts/.tsx/.sql ecc.
    return (f.endswith((".md", ".jsonl", ".txt"))
            or f.startswith("project-wiki/")
            or f in {"DIGEST-latest.md", ".builds_today"})


sha = ""
for back in range(6):
    cand = git("rev-parse", "--short", f"HEAD~{back}").strip()
    if not cand:
        break
    files = [f for f in git("diff", "--name-only", f"{cand}~1..{cand}").splitlines() if f]
    if files and all(_is_doc(f) for f in files):
        continue  # doc-only: nulla da rompere, guarda il parent
    sha = cand
    break
if not sha:
    sys.exit(f"repo {DIR} non leggibile (o solo commit doc-only)")
if any(f"-{repo}-{sha}.md" in f for f in os.listdir(OUTDIR)):
    print(f"già revisionato {repo}@{sha}")
    sys.exit(0)

subject = git("log", "-1", "--pretty=%s", sha).strip()
# diff vs primo parent: con `git show` un MERGE produce diff vuoto (bug scoperto al primo smoke)
stat = git("diff", "--stat", f"{sha}~1..{sha}") or git("show", sha, "--stat")
diff = (git("diff", f"{sha}~1..{sha}") or git("show", sha))[:40000]
if not diff.strip():
    print(f"HERMES-2 SALTATO: diff vuoto per {repo}@{sha}")
    sys.exit(0)

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

feedback = ""
fb_path = os.path.join(OUTDIR, "TRIAGE-FEEDBACK.md")
if os.path.exists(fb_path):
    feedback = "\n\n=== FEEDBACK DEL SUPERVISORE SUI TUOI REPORT PRECEDENTI (calibrati di conseguenza) ===\n" + open(fb_path).read()[:3000]

prompt = f"""Sei HERMES-2, red-team ADVERSARIALE del progetto MAESTRO (onestà brutale, zero compiacenza).
Un altro agente ha committato questo lavoro nel repo {repo} ed è passato dal gate. Il tuo compito è ROMPERLO.
Cerca SOLO problemi VERI, in ordine di gravità: (1) bug reali con input realistici; (2) test tautologici o che
non testano il comportamento dichiarato; (3) edge case mancanti che morderanno; (4) DEBITO TECNICO e manutenibilità
(duplicazione, accoppiamenti, nomi ingannevoli, codice morto); (5) violazioni degli invarianti MAESTRO
(formati aperti, model-agnostic, niente cloud non autorizzato, GDPR Mode A, niente ELAB/Numeria).
FORMATO: PRIMA riga = verdetto secco ("REGGE" oppure "N problemi, di cui M CRITICI"). Poi i problemi:
file:line + perché è vero + input reale che lo innesca + fix preciso.
SEVERITÀ (vincolante): "CRITICO:" SOLO se (perdita/corruzione di dati o lavoro) ∨ (violazione invariante di
prodotto: groundedness, replay deterministico, GDPR Mode A, local-first, raw immutabile) ∨ (sicurezza reale).
Se la garanzia appartiene a una dipendenza matura (SQLite, browser, OS), NON è critico: una riga come NOTA.
Se il lavoro regge davvero, scrivi "REGGE" e UNA debolezza residua. Max 350 parole, italiano.{feedback}

COMMIT: {subject}
{stat}
DIFF (troncato a 40k):
{diff}"""

# kimi-k2.6 = reasoning model: accetta SOLO temperature=1 (400 altrimenti); max_tokens copre reasoning+risposta.
payload = {
    "model": "kimi-k2.6",
    "messages": [{"role": "user", "content": prompt}],
    "temperature": 1,
    "max_tokens": 8192,  # k2.6 ragiona a lungo prima di scrivere: il budget copre reasoning+report
}
req = urllib.request.Request(
    "https://api.moonshot.ai/v1/chat/completions",
    data=json.dumps(payload).encode(),
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
)
try:
    with urllib.request.urlopen(req, timeout=360) as r:  # reasoning su diff grossi = lento, è un job batch
        body = json.load(r)
    msg = body["choices"][0]["message"]
    text = (msg.get("content") or "").strip()
    if not text:  # reasoning model: risposta finita nei token di reasoning → tieni il reasoning, segnala
        text = "(content vuoto — reasoning grezzo:)\n" + (msg.get("reasoning_content") or "").strip()
    if len(text) < 60:  # niente report vuoti/monchi: NIENTE file → il prossimo tick riprova
        print(f"HERMES-2 FALLITO: risposta vuota per {repo}@{sha} (finish={body['choices'][0].get('finish_reason')}) — riproverà")
        sys.exit(0)
except urllib.error.HTTPError as e:  # diagnostica vera nel log, mai bloccare il tick
    print(f"HERMES-2 SALTATO (kimi HTTP {e.code}: {e.read()[:300]!r})")
    sys.exit(0)
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
