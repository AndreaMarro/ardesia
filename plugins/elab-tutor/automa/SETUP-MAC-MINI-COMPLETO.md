# SETUP MAC MINI M4 — Guida Completa Passo per Passo

> Copia/incolla ogni comando nel Terminal del Mac Mini.
> Aspetta che finisca prima di andare avanti.
> Se qualcosa si frizza: Ctrl+C e vai avanti.

---

## FASE 0: Apri Terminal

Spotlight (Cmd+Spazio) → scrivi "Terminal" → Enter

---

## FASE 1: Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Quando chiede la password, scrivi la password del Mac e premi Enter.
NON vedrai i caratteri — e' normale.

Quando finisce, scrivi ESATTAMENTE queste 2 righe:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verifica:

```bash
brew --version
```

Deve dire "Homebrew 4.x.x". Se dice "command not found", chiudi Terminal e riaprilo, poi riprova.

---

## FASE 2: Installa tutto

```bash
brew install node git gh jq
```

Verifica:

```bash
node --version && git --version && gh --version && jq --version
```

Deve mostrare 4 versioni. Se qualcosa manca, riprova `brew install [quello che manca]`.

---

## FASE 3: GitHub CLI — Login

```bash
gh auth login
```

Rispondi cosi:
- Where do you use GitHub? → **GitHub.com**
- What is your preferred protocol? → **HTTPS**
- Authenticate Git with your GitHub credentials? → **Yes**
- How would you like to authenticate? → **Login with a web browser**

Si apre il browser. Login con account **progettibelli**.
Copia il codice dal Terminal e incollalo nel browser.

Verifica:

```bash
gh auth status
```

Deve dire "Logged in to github.com as progettibelli".

---

## FASE 4: Clona il repository ELAB

```bash
mkdir -p ~/ELAB
gh repo clone progettibelli/elab-tutor ~/ELAB/elab-builder
```

Se il repo si chiama diversamente, prova:

```bash
gh repo list progettibelli
```

E usa il nome corretto nel clone.

```bash
cd ~/ELAB/elab-builder
ls
```

Devi vedere i file del progetto (AUTOPILOT.md, src/, package.json, etc.)

---

## FASE 5: Installa dipendenze e testa

```bash
cd ~/ELAB/elab-builder
npm ci
```

Aspetta che finisca (puo' metterci 2-3 minuti).

```bash
npm test -- --run
```

Deve mostrare "X passed". Se qualche test fallisce, non importa per ora.

```bash
npm run build
```

Deve dire "built in Xs". Se fallisce, dimmi l'errore.

---

## FASE 6: Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code@latest
```

Se non funziona, prova:

```bash
npm install -g claude-code@latest
```

Verifica:

```bash
claude --version
```

Poi login:

```bash
claude login
```

Segui le istruzioni (si apre browser, login con lo STESSO account Claude Desktop).

---

## FASE 7: Configura macOS per 24/7

### Previeni sleep:

```bash
sudo pmset -a sleep 0 displaysleep 0 disksleep 0 autorestart 1 womp 1 powernap 0
```

### Disabilita auto-update:

```bash
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticCheckEnabled -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate CriticalUpdateInstall -bool false
```

### Abilita SSH (accesso remoto):

Vai in **System Settings → General → Sharing → Remote Login → ON**
(questo si fa dalla GUI, non dal Terminal)

### Abilita Screen Sharing:

Vai in **System Settings → General → Sharing → Screen Sharing → ON**

### Auto-login:

Vai in **System Settings → Users & Groups → Automatic Login → seleziona il tuo utente**
(se non si vede, devi prima disabilitare FileVault in System Settings → Privacy & Security → FileVault → Turn Off)

---

## FASE 8: Claude Desktop — Configurazione

1. Claude Desktop dovrebbe gia' essere aperto e loggato
2. Vai in **Settings** (icona ingranaggio)
3. **Model → Claude Opus 4.6** (seleziona come default)
4. **Desktop app → General → Keep computer awake → ON**

### Auto-avvio Claude Desktop al login:

**System Settings → General → Login Items → clicca + → seleziona Claude dall'elenco app**

---

## FASE 9: Scheduled Tasks in Claude Desktop

Apri Claude Desktop. Nel sidebar clicca **Schedule** → **+ New task**.

### TASK 1: Worker (ogni 3 ore)

```
Nome: elab-worker
Descrizione: Worker autonomo ELAB - fix, test, PR

Prompt:
Leggi AUTOPILOT.md nella root del progetto. Sei il worker autonomo ELAB.
Esegui il loop completo:
1. Corri bash automa/evaluate-v3.sh (score PRIMA)
2. Leggi handoff.md, ORDERS/, learned-lessons.md
3. Scegli il gap piu' grande e fixalo (max 5 file)
4. npm test -- --run && npm run build
5. Corri bash automa/evaluate-v3.sh (score DOPO)
6. Se score >= prima: git commit, push, gh pr create
7. Se score < prima: git checkout . (revert)
8. Aggiorna handoff.md e OUTBOX/
Max 4 cicli, max 60 minuti. Poi ferma.

Frequenza: Ogni 3 ore
Modello: Claude Opus 4.6
Cartella: ~/ELAB/elab-builder
Worktree: ON
Permessi: Auto
```

### TASK 2: Researcher (ogni 8 ore)

```
Nome: elab-researcher
Descrizione: Ricerca competitor, paper, mercato per ELAB

Prompt:
Leggi AUTOPILOT.md sezione RICERCA CONTINUA. Sei il ricercatore ELAB.
1. Scegli 1-2 topic dal pool di 20 in AUTOPILOT.md
2. Cerca sul web con query specifiche
3. Scrivi report in automa/knowledge/[YYYY-MM-DD]-[topic].md
4. Se trovi qualcosa di actionable, crea task in automa/ORDERS/
5. Aggiorna automa/STRATEGY/score-tracking.md con trend analysis
6. Aggiorna handoff.md

Frequenza: Ogni 8 ore
Modello: Claude Opus 4.6
Cartella: ~/ELAB/elab-builder
Worktree: ON
Permessi: Auto
```

### TASK 3: Auditor (ogni giorno alle 03:00)

```
Nome: elab-auditor
Descrizione: Audit browser del prodotto deployato

Prompt:
Sei l'auditor ELAB. Il tuo lavoro e' testare il prodotto REALE.
1. Naviga https://www.elabtutor.school con gli strumenti disponibili
2. Testa 5 esperimenti random (caricano? funzionano?)
3. Se Playwright e' disponibile, usalo per test automatici
4. Controlla console errors nel browser
5. Scrivi report in automa/reports/audit-[YYYY-MM-DD].md
6. Se trovi regressioni, crea P0 task in automa/ORDERS/
7. Aggiorna score-tracking.md con risultati oggettivi

Frequenza: Giornaliero alle 03:00
Modello: Claude Opus 4.6
Cartella: ~/ELAB/elab-builder
Worktree: ON
Permessi: Auto
```

**Dopo aver creato ogni task, clicca "Run now" per testarlo.**
Guarda se parte senza errori. Se chiede permessi, clicca "Always allow".

---

## FASE 10: Telegram Channel (opzionale)

Solo se vuoi comunicare via Telegram col Mac Mini.

1. Apri Telegram → cerca @BotFather → manda /newbot
2. Scegli nome (es: "ELAB Worker") e username (es: "elab_worker_bot")
3. Copia il token che BotFather ti da

4. Nel Terminal del Mac Mini:

```bash
cd ~/ELAB/elab-builder
claude --channels plugin:telegram@claude-plugins-official
```

5. In Claude Code scrivi:

```
/plugin install telegram@claude-plugins-official
/reload-plugins
/telegram:configure IL_TUO_TOKEN_QUI
```

6. Manda un messaggio al bot da Telegram
7. Copia il pairing code e scrivi in Claude Code:

```
/telegram:access pair IL_CODICE
/telegram:access policy allowlist
```

**NOTA**: Telegram Channels e' in research preview. Puo' avere problemi.
Se non funziona, usa Cowork da iPhone come canale primario.

---

## FASE 11: Verifica Finale

Checklist — metti una X per ogni punto:

```
[ ] Claude Desktop aperto e loggato
[ ] Model impostato su Claude Opus 4.6
[ ] Keep computer awake = ON
[ ] Claude Desktop nei Login Items (auto-avvio)
[ ] 3 scheduled tasks creati (worker, researcher, auditor)
[ ] SSH abilitato (System Settings → Sharing → Remote Login)
[ ] Screen Sharing abilitato
[ ] npm test passa
[ ] npm run build passa
[ ] gh auth status dice "progettibelli"
[ ] pmset -g mostra sleep=0 autorestart=1
```

---

## FASE 12: Stacca il Monitor

Se tutto OK:
1. Annota l'IP del Mac Mini: `ifconfig | grep "inet " | grep -v 127`
2. Verifica SSH dal tuo MacBook: `ssh TUO_UTENTE@IP_MAC_MINI`
3. Verifica Screen Sharing dal tuo MacBook: Finder → Go → Connect to Server → `vnc://IP_MAC_MINI`
4. Stacca il monitor
5. Il Mac Mini lavora da solo

---

## Comunicazione da Remoto

```
Da iPhone:
  - Cowork Claude: ordini + status + notifiche push
  - GitHub Mobile: review PR + approve
  - Telegram: status + comandi rapidi (se configurato)

Da MacBook:
  - SSH: ssh TUO_UTENTE@IP_MAC_MINI
  - Screen Sharing: vnc://IP_MAC_MINI
  - Claude Code: sessioni dirette sul tuo repo locale
  - GitHub: review PR + approve

Stop emergenza:
  ssh TUO_UTENTE@IP_MAC_MINI "touch ~/ELAB/elab-builder/automa/HALT"
```

---

## Se Qualcosa Va Male

```
Mac Mini non risponde:
  → Stacca e riattacca la corrente
  → Si riavvia da solo (autorestart=1)
  → Claude Desktop si riavvia (Login Items)
  → Scheduled tasks ripartono

Claude Desktop non parte:
  → SSH al Mac Mini
  → open -a Claude

Test falliscono:
  → Il worker non committera' (hook Stop lo blocca)
  → La prossima sessione riprovera'

Score cala:
  → Il worker reverta' automaticamente (pattern Karpathy)
  → Scrivera' in learned-lessons.md
```
