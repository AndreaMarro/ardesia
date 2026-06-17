# Sicurezza

Fonte: `~/ardesia-audit-2026-06-15/mini/tg-bridge.py` (linee citate), `ARDESIA-ALIGNMENT.md` sez. 5, audit:security. Regola del vault: si riportano le POSIZIONI dei segreti, mai i valori.

## Bridge Telegram (tg-bridge.py)
Il bridge e l unica interfaccia di controllo quando il MacBook e spento. Superficie alimentata da testo remoto, quindi disegnato fail-closed.
- Risponde SOLO alla chat autorizzata `TG_CHAT` (riga 29; fail-closed: senza match, niente azione).
- La chat LLM e DISARMATA: `claude -p "$PROMPT" --tools "" --max-turns 1 --permission-mode default` (linee 290-291). `--tools ""` toglie tutti i tool; `--max-turns 1` vieta i loop agentici; NIENTE `--dangerously-skip-permissions`. Pura generazione di testo: non esegue comandi ne esfiltra il token.
- Il testo utente passa via env `$PROMPT` (riga 296), mai interpolato nello shell (commento linee 285-286). Niente shell injection dalla chat.
- `env -u ANTHROPIC_API_KEY` (riga 290): la chiave API non entra nell ambiente del processo claude.
- Le AZIONI vere (stop/pin/modello) passano solo da comandi whitelisted con argv, non dallo shell.
- Upload file: `_safe_name` (riga 67) come guard contro path-traversal; il nome base e sanificato (linea 84).

## Token OAuth (posizione, non valore)
Il token OAuth del builder viene ricavato a runtime con grep di `~/.zshenv` (linea 287: legge la riga `export CLAUDE_CODE_OAUTH_TOKEN=...`). Quindi il token risiede a riposo in `~/.zshenv` e, durante l esecuzione, nell ambiente del processo claude (visibile in `ps`). Residuo noto: single-user Mini, basso rischio, da migrare a env-file (ARDESIA-ALIGNMENT.md sez. 5).

## GDPR by design (Mode A)
- Local-first: contenuti e lezioni sul PC del docente; il cloud ha solo la vetrina. Audio mai in cloud. Zero voci studenti by-design (la voce e dato biometrico).
- E il moat strutturale, non un costo. Vedi [[Visione#principi-non-negoziabili]].
- Mai contenuto del corpus nei commit (path si, contenuto no). Corpus dati reali (`~/maestro-data/`) intoccabile.

## Marketplace
Filtro/scan all ingresso dei plugin: sandbox iframe + caps + firma ed25519. Tool comprati immutabili (solo settings, mai fork). Niente censura eccessiva, ma niente "mostri" sulla lavagna.

## Residui noti (da chiudere)
- Token OAuth builder visibile in `ps` (da migrare a env-file).
- Race flock COORD (mitigato verify+retry, non completo).
- Chiave Kimi da ruotare.
Nessuno di questi e stato modificato da questo lavoro (read-only).

Vedi anche: [[Architettura-Sistema#il-bridge-telegram-interfaccia-unica-quando-il-macbook-e-spento]], [[Affidabilita-e-Runbook]].
