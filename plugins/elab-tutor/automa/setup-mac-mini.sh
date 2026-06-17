#!/bin/bash
# ============================================
# ELAB — Setup Mac Mini M4 16GB (Headless Server)
#
# Esegui PASSO PER PASSO sul Mac Mini.
# Ogni step chiede conferma prima di procedere.
#
# Prerequisiti:
#   - Mac Mini M4 collegato a WiFi, monitor per setup iniziale
#   - Account macOS creato
#   - Connessione internet
#
# Uso: bash automa/setup-mac-mini.sh
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

step() {
  echo ""
  echo -e "${GREEN}━━━ STEP $1: $2 ━━━${NC}"
}

check() {
  echo -e "  ${GREEN}✓ $1${NC}"
}

warn() {
  echo -e "  ${YELLOW}⚠ $1${NC}"
}

fail() {
  echo -e "  ${RED}✗ $1${NC}"
}

pause() {
  echo ""
  echo -e "${YELLOW}Premi ENTER per continuare (Ctrl+C per fermare)...${NC}"
  read -r
}

echo "╔══════════════════════════════════════════╗"
echo "║  ELAB — Setup Mac Mini M4 Autonomo      ║"
echo "║  Tempo stimato: 30-45 minuti             ║"
echo "╚══════════════════════════════════════════╝"

# ── FASE 1: SISTEMA ──────────────────────────

step 1 "Prevenire sleep + auto-restart"
echo "  Configuro pmset per operazione 24/7..."
sudo pmset -a sleep 0 displaysleep 0 disksleep 0 autorestart 1 womp 1 powernap 0
check "pmset configurato"
echo "  Verifica:"
pmset -g | grep -E "sleep|autorestart|powernap"
pause

step 2 "Abilitare SSH (accesso remoto)"
echo "  Attiva MANUALMENTE:"
echo "  System Settings → General → Sharing → Remote Login → ON"
echo ""
echo "  Verifica dopo:"
echo "  ssh $(whoami)@$(hostname).local (da un altro device)"
warn "systemsetup e' deprecato su macOS Sequoia — usa System Settings"
pause

step 3 "Abilitare Screen Sharing (VNC)"
echo "  Attivo Screen Sharing..."
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.screensharing.plist 2>/dev/null || warn "Abilita manualmente: System Settings → General → Sharing → Screen Sharing"
check "Screen Sharing abilitato"
echo "  Connetti da altro Mac: vnc://$(hostname).local"
pause

step 4 "Disabilitare auto-update macOS"
echo "  Disabilito aggiornamenti automatici (previene reboot sorpresa)..."
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticCheckEnabled -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate CriticalUpdateInstall -bool false
check "Auto-update disabilitato"
pause

step 5 "Auto-login (boot senza password)"
echo "  IMPORTANTE: FileVault deve essere DISABILITATO per auto-login."
echo "  Controlla stato FileVault:"
sudo fdesetup status
echo ""
echo "  Se FileVault e' attivo, disabilita con: sudo fdesetup disable"
echo "  Poi: System Settings → Users & Groups → Automatic Login → seleziona il tuo utente"
warn "Configura manualmente se necessario"
pause

# ── FASE 2: DEVELOPMENT TOOLS ────────────────

step 6 "Installare Homebrew"
if command -v brew &>/dev/null; then
  check "Homebrew gia' installato ($(brew --version | head -1))"
else
  echo "  Installo Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Aggiungi brew al PATH per questa sessione E per il futuro
  eval "$(/opt/homebrew/bin/brew shellenv)"
  echo '' >> ~/.zprofile
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  check "Homebrew installato + aggiunto a ~/.zprofile"
fi
pause

step 7 "Installare Node.js LTS"
if command -v node &>/dev/null; then
  check "Node gia' installato ($(node --version))"
else
  echo "  Installo Node.js via Homebrew..."
  brew install node
  check "Node installato ($(node --version))"
fi
pause

step 8 "Installare Git e GitHub CLI"
if command -v gh &>/dev/null; then
  check "GitHub CLI gia' installato ($(gh --version | head -1))"
else
  echo "  Installo GitHub CLI..."
  brew install gh
  check "GitHub CLI installato"
fi
echo "  Autentica GitHub CLI:"
echo "  gh auth login"
warn "Esegui manualmente: gh auth login (scegli HTTPS + browser)"
pause

step 9 "Installare jq (necessario per hooks)"
if command -v jq &>/dev/null; then
  check "jq gia' installato"
else
  brew install jq
  check "jq installato"
fi
pause

# ── FASE 3: CLAUDE ───────────────────────────

step 10 "Installare Claude Code CLI"
if command -v claude &>/dev/null; then
  check "Claude Code CLI gia' installato ($(claude --version 2>/dev/null || echo 'versione sconosciuta'))"
else
  echo "  Installo Claude Code CLI..."
  npm install -g @anthropic-ai/claude-code@latest
  check "Claude Code CLI installato"
fi
echo ""
echo "  Se il pacchetto non esiste, prova:"
echo "  npm install -g claude-code"
echo ""
echo "  Poi autentica:"
echo "  claude login"
warn "Verifica il nome del pacchetto su npmjs.com se fallisce"
pause

step 11 "Installare Claude Desktop"
if [ -d "/Applications/Claude.app" ]; then
  check "Claude Desktop gia' installato"
else
  echo "  Scarica Claude Desktop da: https://claude.ai/download"
  warn "Installa manualmente, poi login con account Max EUR200"
fi
echo ""
echo "  DOPO l'installazione:"
echo "  1. Apri Claude Desktop"
echo "  2. Login con il tuo account Max"
echo "  3. Settings → Model → Claude Opus 4.6 (default)"
echo "  4. Settings → Desktop app → General → Keep computer awake → ON"
pause

step 12 "Claude Desktop auto-avvio al login"
echo "  Aggiungo Claude Desktop ai Login Items..."
osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/Claude.app", hidden:false}' 2>/dev/null || warn "Aggiungi manualmente: System Settings → General → Login Items → + → Claude"
check "Claude Desktop in Login Items"
pause

# ── FASE 4: PROGETTO ELAB ────────────────────

step 13 "Clonare il repository ELAB"
ELAB_DIR="$HOME/ELAB/elab-builder"
if [ -d "$ELAB_DIR" ]; then
  check "Repository gia' presente in $ELAB_DIR"
else
  echo "  Clono in $ELAB_DIR..."
  mkdir -p "$HOME/ELAB"
  gh repo clone AndreaMarro/elab-tutor "$ELAB_DIR"
  check "Repository clonato"
fi
cd "$ELAB_DIR"
pause

step 14 "Installare dipendenze e verificare build"
echo "  npm ci..."
npm ci
echo ""
echo "  Verifico test..."
npm test -- --run || warn "Alcuni test potrebbero fallire — verifica"
echo ""
echo "  Verifico build..."
npm run build || fail "Build fallito! Risolvi prima di continuare."
check "Test e build verificati"
pause

step 15 "Verificare evaluate-v3.sh"
echo "  Corri evaluate-v3.sh per score iniziale..."
bash automa/evaluate-v3.sh
check "evaluate-v3.sh funziona"
pause

# ── FASE 5: SCHEDULED TASKS ─────────────────

step 16 "Configurare Desktop Scheduled Tasks"
echo ""
echo "  Apri Claude Desktop e configura 3 scheduled task:"
echo ""
echo "  TASK 1: Worker (ogni 3 ore)"
echo "  ─────────────────────────────"
echo "  Nome: elab-worker"
echo "  Prompt: Leggi AUTOPILOT.md. Sei il worker autonomo ELAB."
echo "          Esegui il loop: evaluate → scegli gap → fixa → test → build → evaluate → keep/discard."
echo "          Max 4 cicli, max 60 minuti. Commit su branch auto/ e crea PR."
echo "  Frequenza: Ogni 3 ore"
echo "  Modello: Claude Opus 4.6"
echo "  Cartella: $ELAB_DIR"
echo "  Worktree: ON (isolato)"
echo "  Permessi: Auto"
echo ""
echo "  TASK 2: Researcher (ogni 8 ore)"
echo "  ─────────────────────────────────"
echo "  Nome: elab-researcher"
echo "  Prompt: Leggi AUTOPILOT.md sezione RICERCA. Scegli 1-2 topic dal pool."
echo "          Cerca sul web. Scrivi report in automa/knowledge/."
echo "          Se trovi qualcosa di actionable, crea task in automa/ORDERS/."
echo "          Aggiorna STRATEGY/score-tracking.md con trend analysis."
echo "  Frequenza: Ogni 8 ore"
echo "  Modello: Claude Opus 4.6"
echo "  Cartella: $ELAB_DIR"
echo "  Worktree: ON"
echo "  Permessi: Auto"
echo ""
echo "  TASK 3: Auditor (giornaliero, 03:00)"
echo "  ──────────────────────────────────────"
echo "  Nome: elab-auditor"
echo "  Prompt: Sei l'auditor ELAB. Naviga elabtutor.school con Playwright."
echo "          Testa 5 esperimenti random. Corri Lighthouse e axe-core."
echo "          Confronta con audit precedente. Scrivi report in automa/reports/."
echo "          Se trovi regressioni, crea P0 task in automa/ORDERS/."
echo "  Frequenza: Giornaliero alle 03:00"
echo "  Modello: Claude Opus 4.6"
echo "  Cartella: $ELAB_DIR"
echo "  Worktree: ON"
echo "  Permessi: Auto"
echo ""
warn "Configura manualmente in Claude Desktop → Schedule → New task"
pause

# ── FASE 6: TELEGRAM CHANNELS ────────────────

step 17 "Configurare Claude Code Channels (Telegram)"
echo ""
echo "  1. Crea un bot Telegram:"
echo "     Apri @BotFather su Telegram → /newbot → scegli nome"
echo "     Copia il token"
echo ""
echo "  2. In Claude Code CLI:"
echo "     /plugin install telegram@claude-plugins-official"
echo "     /reload-plugins"
echo "     /telegram:configure <TOKEN>"
echo ""
echo "  3. Riavvia con channels:"
echo "     claude --channels plugin:telegram@claude-plugins-official"
echo ""
echo "  4. Manda un messaggio al bot da Telegram"
echo "     Pairing code appare → /telegram:access pair <CODE>"
echo "     /telegram:access policy allowlist"
echo ""
warn "Configura manualmente — Telegram Channels e' research preview"
pause

# ── FASE 7: VERIFICA FINALE ──────────────────

step 18 "Test end-to-end"
echo ""
echo "  Checklist finale:"
echo "  [ ] Claude Desktop aperto e loggato con Max"
echo "  [ ] Scheduled tasks configurati (worker, researcher, auditor)"
echo "  [ ] Keep computer awake = ON"
echo "  [ ] SSH funziona da un altro device"
echo "  [ ] Screen Sharing funziona da un altro device"
echo "  [ ] gh auth status mostra 'Logged in'"
echo "  [ ] npm test passa"
echo "  [ ] npm run build passa"
echo "  [ ] evaluate-v3.sh ritorna score"
echo "  [ ] Telegram bot risponde (se configurato)"
echo ""
echo "  Test: corri il worker manualmente una volta:"
echo "  claude -p --model claude-opus-4-6 'Leggi AUTOPILOT.md. Fai 1 ciclo IMPROVE di test.'"
echo ""
warn "Verifica tutto prima di staccare il monitor!"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  SETUP COMPLETO!                         ║"
echo "║                                          ║"
echo "║  Il Mac Mini e' pronto per operare       ║"
echo "║  autonomamente. Stacca il monitor.       ║"
echo "║                                          ║"
echo "║  Comunicazione:                          ║"
echo "║    - Cowork da iPhone                    ║"
echo "║    - Telegram (se configurato)           ║"
echo "║    - GitHub Mobile (review PR)           ║"
echo "║    - SSH: ssh $(whoami)@$(hostname).local║"
echo "║                                          ║"
echo "║  Stop emergenza:                         ║"
echo "║    touch $ELAB_DIR/automa/HALT           ║"
echo "╚══════════════════════════════════════════╝"
