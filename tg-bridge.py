#!/usr/bin/env python3
"""MAESTRO — ponte Telegram v4 (Mini, launchd KeepAlive).

- Comandi secchi e SICURI (deterministici): stato, stop, riprendi, critici, report,
  macbook, evoluzione, aiuto.
- Conversazione libera → CLAUDE in tempo reale, in un WORKER THREAD (il main loop
  non si blocca mai: il kill-switch `stop` scatta subito). Tiering:
    · default = sonnet-4.6 → haiku (protegge la quota Max condivisa col loop di build)
    · `opus <domanda>` = opus-4.8 esplicito (qualità quando serve)
    · `fable <domanda>` = fable-5 esplicito per visione/architettura (più lento, ack immediato)
  con MEMORIA PERSISTENTE della chat + CONOSCENZA progetto + stato live di ENTRAMBE
  le macchine (il MacBook pubblica ~/maestro-logs/macbook-status.txt via push).
- OGNI messaggio libero viene anche archiviato in ~/maestro-logs/tg-inbox.md (lo legge il supervisore a ogni ciclo).
- Risponde SOLO alla chat autorizzata (TG_CHAT). Azioni sul sistema: solo comandi deterministici.
- Sicurezza: il testo utente passa a Claude SOLO via env var (mai interpolato in shell).
"""
import json
import os
import queue
import subprocess
import threading
import time
import urllib.parse
import urllib.request

CONF = os.path.expanduser("~/.maestro-telegram")
cfg = dict(line.strip().split("=", 1) for line in open(CONF) if "=" in line)
TOKEN = cfg["TG_TOKEN"]
CHAT = str(cfg.get("TG_CHAT", ""))
API = f"https://api.telegram.org/bot{TOKEN}"
LOGS = os.path.expanduser("~/maestro-logs")
OFFSET_F = os.path.join(LOGS, ".tg-offset")
INBOX = os.path.join(LOGS, "tg-inbox.md")
HISTORY = os.path.join(LOGS, "tg-chat-history.jsonl")
DOCS = os.path.expanduser("~/maestro-docs")
os.makedirs(LOGS, exist_ok=True)

_LAST_POLL = [time.time()]  # heartbeat del main-loop per il watchdog anti-wedge


def api(method, **params):
    # retry una volta: invii droppati silenziosi (429/blip rete) erano una causa di "non risponde".
    data = urllib.parse.urlencode(params).encode()
    for _attempt in range(2):
        try:
            urllib.request.urlopen(f"{API}/{method}", data=data, timeout=20)
            return
        except Exception:
            time.sleep(1.5)


def send(text):
    """Invia spezzando in messaggi da ≤3800 char (Telegram cap 4096): nessun limite di lunghezza."""
    text = text.strip()
    while text:
        chunk = text[:3800]
        if len(text) > 3800:  # taglia su un confine di riga se possibile
            cut = chunk.rfind("\n")
            if cut > 2000:
                chunk = chunk[:cut]
        api("sendMessage", chat_id=CHAT, text=chunk)
        text = text[len(chunk):].lstrip("\n")


def typing():
    api("sendChatAction", chat_id=CHAT, action="typing")


INBOX_DIR = os.path.expanduser("~/maestro-data/inbox")


def _safe_name(name):
    """Niente path traversal nei nomi file ricevuti via Telegram."""
    name = os.path.basename(name or "").replace("\x00", "")
    name = "".join(c for c in name if c.isalnum() or c in " ._-()[]").strip()
    return name or "file"


def download_file(file_id, suggested_name):
    """Scarica un file inviato su Telegram in ~/maestro-data/inbox/ (gap P1:
    Andrea mandava audio/pdf veri e il bridge li perdeva). Ritorna il path o None."""
    try:
        os.makedirs(INBOX_DIR, exist_ok=True)
        with urllib.request.urlopen(f"{API}/getFile?file_id={urllib.parse.quote(file_id)}", timeout=30) as r:
            fp = json.load(r).get("result", {}).get("file_path")
        if not fp:
            return None
        ext = os.path.splitext(fp)[1] or os.path.splitext(suggested_name or "")[1]
        base = _safe_name(suggested_name) or _safe_name(os.path.basename(fp))
        if not os.path.splitext(base)[1] and ext:
            base += ext
        ts = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
        dest = os.path.join(INBOX_DIR, f"{ts}_{base}")
        url = f"https://api.telegram.org/file/bot{TOKEN}/{fp}"
        with urllib.request.urlopen(url, timeout=120) as resp, open(dest, "wb") as out:
            while True:
                buf = resp.read(65536)
                if not buf:
                    break
                out.write(buf)
        return dest
    except Exception:
        return None


def handle_file(msg):
    """Gestisce document/audio/voice/photo: scarica in inbox e conferma. Ritorna
    il testo di risposta, o None se il messaggio non contiene file."""
    spec = None
    if "document" in msg:
        d = msg["document"]; spec = (d.get("file_id"), d.get("file_name"))
    elif "audio" in msg:
        a = msg["audio"]; spec = (a.get("file_id"), a.get("file_name") or "audio.m4a")
    elif "voice" in msg:
        spec = (msg["voice"].get("file_id"), "nota_vocale.ogg")
    elif "video" in msg:
        spec = (msg["video"].get("file_id"), msg["video"].get("file_name") or "video.mp4")
    elif "photo" in msg:
        spec = (msg["photo"][-1].get("file_id"), "foto.jpg")
    if not spec or not spec[0]:
        return None
    dest = download_file(*spec)
    if dest:
        ts = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime())
        try:
            with open(INBOX, "a", encoding="utf-8") as f:
                f.write(f"- **{ts}** — [FILE ricevuto] {dest}\n")
        except Exception:
            pass
        sz = os.path.getsize(dest)
        return (f"📎 Ricevuto e salvato: {os.path.basename(dest)} ({sz} byte) in ~/maestro-data/inbox/. "
                f"Il supervisore lo trova e lo usa al prossimo giro.")
    return "⚠️ File ricevuto ma download fallito — riprova o dimmi dove metterlo sul Mac."


def sh(cmd):
    try:
        return subprocess.run(["bash", "-lc", cmd], capture_output=True, text=True, timeout=120).stdout.strip()
    except Exception as e:
        return f"(err: {e})"


def stato():
    lock = sh('[ -f ~/lessonos/.tick.lock ] && kill -0 "$(cat ~/lessonos/.tick.lock)" 2>/dev/null && echo "🔨 BUILDING" || echo "💤 idle (prossimo tick ≤20min)"')
    ar = sh("cat ~/.maestro_active_repo 2>/dev/null") or "?"
    last = sh("cat ~/.maestro_last_repo 2>/dev/null") or "?"
    stop = sh('[ -f ~/lessonos/STOP ] && echo "⛔ SÌ" || echo no')
    it = sh("sed -n 2p ~/lessonos/.iters_today 2>/dev/null") or "0"
    s = sh('grep "^|" ~/maestro-logs/RESEARCH-studio.md 2>/dev/null | tail -1 | cut -d"|" -f2,5,7 | cut -c1-90')
    l = sh('cat ~/lessonos/RESEARCH.md ~/maestro-logs/RESEARCH-lessonos.md 2>/dev/null | grep "^|" | tail -1 | cut -d"|" -f2,5,7 | cut -c1-90')
    return (f"{lock}\nrouting: {ar} (ultimo: {last}) · STOP: {stop} · iter oggi: {it}/96\n"
            f"STUDIO ultima: {s}\nLESSONOS ultima: {l}")


def critici():
    out = sh('grep -l "CRITICO:" ~/maestro-logs/adversarial/*.md 2>/dev/null | tail -3')
    return ("Report HERMES-2 con CRITICI:\n" + out) if out else "Nessun report HERMES-2 con CRITICI."


HELP = ("Ardesia - comandi.\n"
        "Immediati: stato | stop | riprendi | critici | report | macbook | evoluzione | coda | aiuto\n"
        "Routing modelli: scrivi 'modello' per vederlo; 'modello <ruolo> <nome>' per cambiarlo; 'modello reset' per il default.\n"
        "  ruoli: brain builder research review adversarial audit | nomi: opus sonnet fable haiku kimi deepseek codex gemini\n"
        "Ordini: 'pin <lessonos|studio> <descrizione>' assegna subito una task al loop.\n"
        "Cervello: 'fable <domanda>' (pianificatore) | 'opus <domanda>' (sviluppo/ricerca).\n"
        "Tutto il resto: scrivimi normalmente, risponde il modello di chat con memoria e stato. Audio/PDF/foto: salvati per il supervisore.")


def macbook_status():
    """Stato MacBook via push-file (il supervisor-tick del MacBook lo pubblica
    qui via scp ~ogni ora; niente ssh inverso = niente sshd sul MacBook)."""
    p = os.path.join(LOGS, "macbook-status.txt")
    if not os.path.exists(p):
        return "MacBook: nessuno status ricevuto ancora (il push parte col prossimo tick del supervisore)."
    age_min = int((time.time() - os.path.getmtime(p)) / 60)
    body = read_file(p, cap=1500).strip()
    note = "" if age_min <= 90 else f"\n⚠️ status vecchio di {age_min} min (MacBook spento/in sleep?)"
    return f"🖥 MacBook (aggiornato {age_min} min fa):\n{body}{note}"


def evoluzione():
    return sh("bash ~/maestro-tools/evolution-report.sh 2>/dev/null") or "Report evoluzione non disponibile."


def read_file(path, cap=14000):
    try:
        return open(path, encoding="utf-8", errors="replace").read()[:cap]
    except Exception:
        return ""


def load_history(max_chars=9000):
    """Ultimi turni di conversazione, dal fondo, entro il budget."""
    if not os.path.exists(HISTORY):
        return ""
    rows = []
    for line in open(HISTORY, encoding="utf-8", errors="replace"):
        try:
            rows.append(json.loads(line))
        except Exception:
            continue
    out, used = [], 0
    for r in reversed(rows):
        piece = f"{'Andrea' if r['role'] == 'user' else 'Tu'}: {r['text']}\n"
        if used + len(piece) > max_chars:
            break
        out.append(piece)
        used += len(piece)
    return "".join(reversed(out))


def save_turn(role, text):
    with open(HISTORY, "a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": time.strftime("%Y-%m-%dT%H:%MZ", time.gmtime()),
                            "role": role, "text": text[:6000]}, ensure_ascii=False) + "\n")


def ask_claude(question, prefer_opus=False):
    # Contesto ridotto (review #6): PROGETTO 14k→5k, history 9k→4k — la chat
    # condivide la quota Max col loop di build (strategos/deepreview/fable).
    progetto = read_file(os.path.join(DOCS, "MAESTRO-PROGETTO.md"), cap=5000)
    visione = read_file(os.path.join(DOCS, "MAESTRO-VISIONE.md"), cap=5000)
    coord = sh("head -c 7000 ~/lessonos/COORDINATION.md 2>/dev/null")
    live = stato() + "\n" + macbook_status()
    extra = sh('tail -3 ~/maestro-logs/RESEARCH-studio.md 2>/dev/null | cut -c1-150; '
               'grep "^|" ~/lessonos/RESEARCH.md 2>/dev/null | tail -2 | cut -c1-150; '
               'ls -t ~/maestro-logs/adversarial/ 2>/dev/null | head -3; '
               'ls -t ~/maestro-logs/research/*.md 2>/dev/null | head -3; '
               'ls ~/maestro-data/teoria-segnali-2021/derived/asr/ 2>/dev/null')
    history = load_history(max_chars=4000)
    prompt = (
        "Sei il supervisore del progetto MAESTRO e parli con Andrea (il proprietario) via Telegram, dal Mac Mini che "
        "esegue il loop di build autonomo (Hermes). REGOLE VINCOLANTI (ordini espliciti di Andrea):\n"
        "1. MAI COMPIACERE, MAI ADULARE: niente complimenti, niente entusiasmo di cortesia, niente 'ottima idea/domanda'. "
        "Se un'idea di Andrea ha problemi, dillo SUBITO e per primo, con le ragioni tecniche. Il disaccordo motivato è il tuo lavoro.\n"
        "2. OBIETTIVO E SCIENTIFICO: fatti, numeri e fonti dal contesto qui sotto; separa FATTI VERIFICATI da ATTESE e da OPINIONI "
        "(dichiara le opinioni come tali); se non sai, dillo esplicitamente — mai inventare.\n"
        "3. NON ABBREVIARE: spiegati PER BENE — contesto, passaggi, perché. La completezza vale più della brevità; "
        "la lunghezza è libera (i messaggi vengono spezzati automaticamente). Vai corto solo su domande puramente operative tipo sì/no.\n"
        "4. Italiano naturale e discorsivo. Ricorda la conversazione precedente e rispondi in continuità.\n"
        "5. Ogni messaggio di Andrea è già archiviato per il supervisore: se chiede AZIONI o esprime IDEE/decisioni, conferma che sono "
        "registrate e che il supervisore le prende al prossimo ciclo (~1h); i comandi immediati sono: stato, stop, riprendi, critici, report.\n\n"
        f"=== DOCUMENTO DI PROGETTO ===\n{progetto}\n\n"
        f"=== VISIONE ===\n{visione}\n\n"
        f"=== ORDINI E STATO OPERATIVO (COORDINATION, estratto) ===\n{coord}\n\n"
        f"=== STATO LIVE ADESSO ===\n{live}\n{extra}\n\n"
        f"=== CONVERSAZIONE PRECEDENTE ===\n{history or '(prima conversazione)'}\n\n"
        f"=== NUOVO MESSAGGIO DI ANDREA ===\n{question}"
    )
    # Tiering CORRETTO (review 11/06 #6, smoking gun: strategos 22:30 fallito
    # 'out of extra usage'): la chat condivide la quota Max col loop di build.
    # Default = sonnet→haiku (protegge la quota che fa da quality-gate alla
    # build); opus SOLO su richiesta esplicita `opus <domanda>`. Qualità-quando-
    # serve accessibile, costo di default ~5-10× più basso.
    models = ("claude-opus-4-8 claude-sonnet-4-6 claude-haiku-4-5" if prefer_opus
              else "claude-sonnet-4-6 claude-haiku-4-5")
    return _run_claude(prompt, models=models, per_model_timeout=170, total_timeout=400)


def ask_fable(question):
    """`fable <domanda>` — accesso esplicito al cervello fable-5 dal telefono.

    Per visione/architettura/decisioni (ordine Andrea: scrittura/revisione/
    codice/visione = fable). Singolo, NON ultracode: latenza da chat, il
    multi-agente resta a strategos/deepreview/research. Fallback opus.
    """
    progetto = read_file(os.path.join(DOCS, "MAESTRO-PROGETTO.md"))
    visione = read_file(os.path.join(DOCS, "MAESTRO-VISIONE.md"), cap=8000)
    coord = sh("head -c 9000 ~/lessonos/COORDINATION.md 2>/dev/null")
    history = load_history(max_chars=5000)
    prompt = (
        "Sei fable-5, il cervello strategico del progetto MAESTRO. Andrea (proprietario) ti interroga "
        "direttamente da Telegram su visione/architettura/decisioni. REGOLE: mai compiacere, obiettivo "
        "e scientifico, disaccordo motivato quando serve, separa fatti/attese/opinioni, italiano.\n\n"
        f"=== PROGETTO ===\n{progetto}\n\n=== VISIONE ===\n{visione}\n\n"
        f"=== COORDINATION (estratto) ===\n{coord}\n\n"
        f"=== CONVERSAZIONE RECENTE ===\n{history or '(nessuna)'}\n\n"
        f"=== DOMANDA DI ANDREA ===\n{question}"
    )
    return _run_claude(prompt, models="claude-fable-5 claude-opus-4-8",
                       per_model_timeout=540, total_timeout=1150)


def _run_claude(prompt, models, per_model_timeout, total_timeout):
    # SICUREZZA (review 11/06, 2 HIGH confermati+riprodotti): la chat è una
    # superficie alimentata da testo remoto. `--tools ""` DISARMA tutti i tool
    # (niente Bash/Write/WebFetch) → un messaggio ostile non può eseguire
    # comandi né esfiltrare il token: pura generazione di testo. `--max-turns 1`
    # vieta i loop agentici. NIENTE `--dangerously-skip-permissions`. Il prompt
    # è il primo arg posizionale (via env $PROMPT, mai interpolato) PRIMA del
    # flag variadico --tools. Tutto il contesto è già nel prompt: nessun tool serve.
    script = ('eval "$(grep -E \'^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=\' "$HOME/.zshenv" 2>/dev/null | tail -1)"; '
              'export PATH="/opt/homebrew/bin:$PATH"; '
              f'for m in {models}; do '
              f'out=$(timeout {per_model_timeout} env -u ANTHROPIC_API_KEY claude -p "$PROMPT" '
              '--tools "" --max-turns 1 --permission-mode default --model "$m" 2>&1) '
              '&& [ -n "$out" ] && ! printf "%s" "$out" | grep -qiE "not logged in|unauthorized|rate.?limit|overloaded|out of extra usage|session limit" '
              '&& { printf "[%s]\\n%s" "$m" "$out"; exit 0; }; done; exit 1')
    try:
        r = subprocess.run(["bash", "-lc", script], capture_output=True, text=True, timeout=total_timeout,
                           env={**os.environ, "PROMPT": prompt})
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout.strip()
    except Exception:
        pass
    return None


# --- Cervello chat: API dirette veloci (DeepSeek/Kimi/Gemini) -------------------
# Dal 15/06 il default chat NON usa piu `claude -p` (lento: fable ~19min/opus ~6min;
# metered Agent-SDK; downgrade silenzioso dei modelli 1M via token OAuth). Va su API
# dirette veloci. opus/fable restano su keyword esplicita (ask_claude/ask_fable).
# Sicurezza: il testo utente entra SOLO nel body JSON (json.dumps), mai in shell;
# le chiavi vengono lette da file e usate solo nell'header Authorization (mai loggate).
def _deepseek_key():
    for line in read_file(os.path.expanduser("~/lessonos/.env")).splitlines():
        if line.startswith("DEEPSEEK_API_KEY="):
            return line.split("=", 1)[1].strip().strip("\"'")
    return ""


def _kimi_key():
    import re
    m = re.search(r"api_key:\s*(\S+)", read_file(os.path.expanduser("~/.hermes/config.yaml")))
    return m.group(1).strip("\"'") if m else ""


def _gemini_key():
    return (os.environ.get("GEMINI_API_KEY", "").strip()
            or read_file(os.path.expanduser("~/.gemini-key")).strip())


def _openai_chat(url, key, model, prompt, timeout, max_tokens=4096):
    """Provider OpenAI-compatibile (DeepSeek, Kimi/Moonshot)."""
    if not key:
        return None
    req = urllib.request.Request(
        url,
        data=json.dumps({"model": model,
                         "messages": [{"role": "user", "content": prompt}],
                         "max_tokens": max_tokens}).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = json.load(r)
        return (body["choices"][0]["message"].get("content") or "").strip() or None
    except Exception:
        return None


def _gemini_chat(key, model, prompt, timeout):
    if not key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    req = urllib.request.Request(
        url,
        data=json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = json.load(r)
        return (body["candidates"][0]["content"]["parts"][0].get("text") or "").strip() or None
    except Exception:
        return None


def ask_chat(question, provider=None):
    """Cervello chat veloce. Ladder default DeepSeek->Kimi->Gemini (il primo che
    risponde vince). `provider` forza un singolo modello (kimi/deepseek/gemini)."""
    progetto = read_file(os.path.join(DOCS, "MAESTRO-PROGETTO.md"), cap=5000)
    visione = read_file(os.path.join(DOCS, "MAESTRO-VISIONE.md"), cap=5000)
    coord = sh("head -c 7000 ~/lessonos/COORDINATION.md 2>/dev/null")
    live = stato() + "\n" + macbook_status()
    history = load_history(max_chars=4000)
    prompt = (
        "Sei il supervisore del progetto ARDESIA (ex-MAESTRO) e parli con Andrea (il proprietario) via "
        "Telegram, dal Mac Mini che esegue il loop di build autonomo (Hermes). REGOLE VINCOLANTI: "
        "1. MAI compiacere/adulare; se un'idea ha problemi dillo SUBITO e per primo con ragioni tecniche. "
        "2. Obiettivo e scientifico: fatti/numeri/fonti dal contesto; separa FATTI da ATTESE/OPINIONI; se non sai, dillo. "
        "3. Italiano naturale, continuita con la conversazione; conciso sull'operativo, completo sul profondo.\n\n"
        f"=== PROGETTO ===\n{progetto}\n\n=== VISIONE ===\n{visione}\n\n"
        f"=== COORDINATION (estratto) ===\n{coord}\n\n"
        f"=== STATO LIVE ===\n{live}\n\n"
        f"=== CONVERSAZIONE PRECEDENTE ===\n{history or '(prima conversazione)'}\n\n"
        f"=== NUOVO MESSAGGIO DI ANDREA ===\n{question}"
    )
    ladder = [provider] if provider else ["gemini", "deepseek", "kimi"]
    for p in ladder:
        if p == "deepseek":
            # deepseek-v4-flash e' reasoning: serve max_tokens generoso o il content torna vuoto
            out = _openai_chat("https://api.deepseek.com/chat/completions", _deepseek_key(),
                               "deepseek-v4-flash", prompt, timeout=120, max_tokens=6144)
        elif p == "kimi":
            out = _openai_chat("https://api.moonshot.ai/v1/chat/completions", _kimi_key(),
                               "kimi-k2.6", prompt, timeout=180, max_tokens=8192)
        elif p == "gemini":
            out = _gemini_chat(_gemini_key(), "gemini-3.5-flash", prompt, timeout=60)
        else:
            out = None
        if out:
            return f"[{p}]\n{out}"
    return None


# Comandi deterministici: ISTANTANEI, gestiti SEMPRE nel main loop (mai dietro
# una chiamata LLM lenta). Il kill-switch `stop` deve poter scattare subito
# (review #3 CRITICAL: prima restava in coda fino a ~19 min).

ROUTE_OVERRIDE = os.path.expanduser("~/.ardesia-routes.override")
MODELMAP = {"opus":"claude-opus-4-8","sonnet":"claude-sonnet-4-6","fable":"claude-fable-5","haiku":"claude-haiku-4-5","kimi":"kimi","deepseek":"deepseek","gemini":"gemini","codex":"codex"}
ROLES = ["brain","builder","research","review","adversarial","audit"]

def route_cmd(text):
    parts = text.split()
    if len(parts) == 1:
        lines = []
        for r in ROLES:
            lad = sh("bash ~/lessonos/bin/route.sh %s 2>/dev/null" % r)
            lines.append("  %s: %s" % (r, lad or "(default)"))
        ov = "\n(nessun override attivo)"
        if os.path.exists(ROUTE_OVERRIDE):
            ovc = [l for l in open(ROUTE_OVERRIDE).read().splitlines() if l.strip() and not l.strip().startswith("#")]
            ov = ("\nOverride attivi:\n" + "\n".join("  "+x for x in ovc)) if ovc else "\n(nessun override attivo)"
        return "Routing modelli per ruolo (primo accessibile vince):\n" + "\n".join(lines) + ov + "\n\nCambia: modello <ruolo> <opus|sonnet|fable|kimi|deepseek|codex|gemini> | ripristina: modello reset"
    if parts[1].lower() in ("reset","auto","default"):
        open(ROUTE_OVERRIDE,"w").write("# Ardesia override (vuoto = default routes.env)\n")
        return "Override azzerato: tutti i ruoli tornano al routing di default. Attivo dal prossimo tick."
    if len(parts) >= 3:
        role = parts[1].lower()
        if role not in ROLES:
            return "Ruolo non valido: %s. Validi: %s" % (role, ", ".join(ROLES))
        bad = [x for x in parts[2:] if x.lower() not in MODELMAP]
        if bad:
            return "modelli non validi: %s. Validi: %s" % (", ".join(bad), ", ".join(sorted(MODELMAP)))
        names = [MODELMAP[x.lower()] for x in parts[2:]]
        ladder = " ".join(names)
        cur = []
        if os.path.exists(ROUTE_OVERRIDE):
            cur = [l for l in open(ROUTE_OVERRIDE).read().splitlines() if not l.strip().startswith("ROUTE_%s=" % role.upper())]
        cur = [l for l in cur if l.strip()]
        cur.append('ROUTE_%s="%s"' % (role.upper(), ladder))
        open(ROUTE_OVERRIDE,"w").write("\n".join(cur)+"\n")
        return "Routing aggiornato: %s -> %s\nAttivo dal prossimo tick (verifica: modello)." % (role, ladder)
    return "uso: modello | modello <ruolo> <modello> | modello reset"

def pin_cmd(text):
    parts = text.split(None, 2)
    if len(parts) < 3:
        return "uso: pin <lessonos|studio> <descrizione task>"
    repo = parts[1].lower()
    if repo not in ("lessonos","studio"):
        return "repo non valido: usa lessonos oppure studio"
    task = parts[2]
    r = subprocess.run(["python3", os.path.expanduser("~/lessonos/bin/set_pin.py"), repo, task],
                       capture_output=True, text=True, cwd=os.path.expanduser("~/lessonos"), timeout=30)
    out = (r.stdout or r.stderr or "").strip()
    return "Ordine registrato.\n" + (out or "(nessun output)") + "\nIl prossimo tick costruira questa task."

def coda_cmd():
    pins = sh("sed -n '/PROSSIMA TASK/,/ROADMAP/p' ~/lessonos/COORDINATION.md | grep -E '^- [*][*]'")
    queue = sh("grep -E 'AUTO-OK[]] ' ~/lessonos/COORDINATION.md | grep -v '^##' | sed -E 's/^- //'")
    return "Pin attivi:\n" + (pins or "(nessuno)") + "\n\nCoda ROADMAP-AUTO:\n" + (queue or "(vuota)")



def salute_cmd():
    tick = sh("grep '=== 2026' ~/lessonos/hourly.log 2>/dev/null | tail -1")
    jl = sh("tail -1 ~/maestro-logs/RESEARCH-lessonos.md 2>/dev/null | cut -c1-95")
    js = sh("tail -1 ~/maestro-logs/RESEARCH-studio.md 2>/dev/null | cut -c1-95")
    stop = sh("[ -f ~/lessonos/STOP ] && echo 'IN PAUSA (stop)' || echo attivo")
    fable = sh("[ -f ~/.fable5_down ] && echo 'inaccessibile (uso opus)' || echo ok")
    builder = sh("grep -E 'BUILDER=|builder su' ~/lessonos/hourly.log 2>/dev/null | tail -1 | sed -E 's/^\\[driver\\] //'")
    queue = sh("grep -c 'AUTO-OK] ' ~/lessonos/COORDINATION.md 2>/dev/null")
    routes = sh("for r in brain builder research review adversarial audit; do printf '  %s: %s\\n' $r \"$(bash ~/lessonos/bin/route.sh $r 2>/dev/null)\"; done")
    audit = sh("ls -t ~/maestro-logs/audit/*.md 2>/dev/null | head -1 | xargs -I{} basename {} 2>/dev/null")
    return ("Salute Ardesia\n"
            "Loop: %s\n"
            "Ultimo tick: %s\n"
            "Builder: %s\n"
            "lessonos: %s\n"
            "studio: %s\n"
            "fable-5: %s\n"
            "Coda: %s task pre-approvate\n"
            "Ultimo audit: %s\n\n"
            "Routing modelli:\n%s") % (stop, tick or "(n/d)", builder or "(n/d)", jl or "(n/d)", js or "(n/d)", fable, queue or "0", audit or "(nessuno)", routes or "(n/d)")


def deterministic(text):
    t = text.strip().lower()
    if t in ("stato", "status", "come va", "come va?"):
        return stato()
    if t == "stop":
        sh('printf "telegram: stop di Andrea %s\\n" "$(date -u +%FT%TZ)" > ~/lessonos/STOP')
        return "Loop in PAUSA (STOP). Riprendi con: riprendi"
    if t in ("riprendi", "resume", "go"):
        sh("rm -f ~/lessonos/STOP")
        return "Loop RIPRESO. Prossimo tick entro ~5 min."
    if t in ("critici", "critico"):
        return critici()
    if t in ("report", "digest"):
        return sh("head -25 ~/lessonos/DIGEST-latest.md 2>/dev/null") or "Nessun digest."
    if t in ("macbook", "mac"):
        return macbook_status()
    if t in ("evoluzione", "evolution", "metriche"):
        return evoluzione()
    if t in ("aiuto", "help", "?", "/start"):
        return HELP
    if t in ("salute", "sistema", "vivo", "health"):
        return salute_cmd()
    if t == "coda" or t == "queue":
        return coda_cmd()
    if t.startswith("modello") or t.startswith("modelli") or t.startswith("route"):
        return route_cmd(text.strip())
    if t.startswith("pin "):
        return pin_cmd(text.strip())
    return None  # non deterministico → va al worker LLM


def _archive(text, tag=""):
    ts = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime())
    try:
        with open(INBOX, "a", encoding="utf-8") as f:
            f.write(f"- **{ts}** — {tag}{text.strip()}\n")
        save_turn("user", text.strip())
    except Exception:
        pass


def llm_worker(jobs):
    """Thread dedicato alle chiamate LLM (review #3): il main loop resta SEMPRE
    libero per i comandi deterministici. Una sola chiamata LLM alla volta (serie),
    ma niente blocca il polling né il kill-switch."""
    while True:
        text = jobs.get()
        try:
            t = text.strip(); tl = t.lower()
            typing()  # indicatore subito (le risposte default ora sono veloci: DeepSeek/Kimi)
            if tl.startswith("fable ") and len(t) > 6:
                send("fable al lavoro (fino a ~10 min)...")
                answer = ask_fable(t[6:])
                fail = "fable-5/opus non raggiungibili ora (usage?) — domanda salvata per il supervisore."
            elif tl.startswith("opus ") and len(t) > 5:
                send("opus al lavoro...")
                answer = ask_claude(t[5:], prefer_opus=True)
                fail = "opus non raggiungibile ora (usage?) — messaggio salvato per il supervisore."
            elif tl.startswith("kimi ") and len(t) > 5:
                answer = ask_chat(t[5:], provider="kimi")
                fail = "kimi non raggiungibile ora — messaggio salvato per il supervisore."
            elif tl.startswith("deepseek ") and len(t) > 9:
                answer = ask_chat(t[9:], provider="deepseek")
                fail = "deepseek non raggiungibile ora — messaggio salvato per il supervisore."
            elif tl.startswith("gemini ") and len(t) > 7:
                answer = ask_chat(t[7:], provider="gemini")
                fail = "gemini non raggiungibile (chiave API impostata? il gemini OAuth muore il 18/06) — messaggio salvato."
            else:
                answer = ask_chat(t)
                fail = "Chat non raggiungibile ora (DeepSeek/Kimi giu?) — messaggio salvato per il supervisore."
            if answer:
                save_turn("assistant", answer)
                send(answer)
            else:
                send(fail)
        except Exception as e:
            send(f"⚠️ errore interno gestendo il messaggio (salvato per il supervisore): {e}")
        finally:
            jobs.task_done()


def _watchdog(stale=200):
    """Anti-wedge: il long-poll puo bloccarsi su una read TLS appesa che ignora il
    timeout (processo vivo ma sordo; KeepAlive non se ne accorge). Se il main-loop
    non gira da `stale`s -> esce, launchd KeepAlive riavvia fresco. (Fix wedge 15/06.)"""
    while True:
        time.sleep(30)
        if time.time() - _LAST_POLL[0] > stale:
            os._exit(1)


def main():
    offset = 0
    if os.path.exists(OFFSET_F):
        try:
            offset = int(open(OFFSET_F).read().strip())
        except ValueError:
            offset = 0
    jobs = queue.Queue()
    threading.Thread(target=llm_worker, args=(jobs,), daemon=True).start()
    threading.Thread(target=_watchdog, daemon=True).start()
    while True:
        _LAST_POLL[0] = time.time()  # heartbeat: il loop sta girando (visto dal watchdog)
        try:
            with urllib.request.urlopen(f"{API}/getUpdates?timeout=50&offset={offset + 1}", timeout=70) as r:
                updates = json.load(r).get("result", [])
        except Exception:
            time.sleep(10)
            continue
        for u in updates:
            try:
                msg = u.get("message") or {}
                if str(msg.get("chat", {}).get("id")) != CHAT:
                    continue
                # File (audio/pdf/voce/foto) → scarica in inbox (gap P1)
                file_ans = handle_file(msg)
                if file_ans is not None:
                    send(file_ans)
                    continue
                text = msg.get("text") or ""
                if not text:
                    continue
                ans = deterministic(text)
                if ans is not None:
                    send(ans)  # ISTANTANEO, mai dietro un LLM
                else:
                    # libero/fable/opus → archivia SUBITO, poi al worker (non blocca)
                    tag = "[fable] " if text.strip().lower().startswith("fable ") else ""
                    _archive(text, tag)
                    jobs.put(text)
            except Exception:
                pass  # un update malformato non deve uccidere il loop
            finally:
                # offset DOPO il dispatch (review #4 message-lost): at-least-once.
                offset = max(offset, u["update_id"])
                try:
                    open(OFFSET_F, "w").write(str(offset))
                except Exception:
                    pass


if __name__ == "__main__":
    main()
