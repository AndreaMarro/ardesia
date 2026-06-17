#!/bin/bash
# ELAB Local Server — Teacher Setup Script
# Installs Ollama + models + arduino-cli + Python deps
# Works on macOS (Apple Silicon). Run: bash install.sh

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║  ELAB Local Server — Installazione Docente     ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }

# === 1. OLLAMA ===
echo "── Step 1/5: Ollama ──"
if command -v ollama &>/dev/null; then
    ok "Ollama gia' installato ($(ollama --version 2>/dev/null || echo 'unknown'))"
else
    warn "Ollama non trovato. Scarico..."
    if [[ "$(uname)" == "Darwin" ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    else
        fail "Supportato solo macOS. Installa Ollama manualmente: https://ollama.com"
        exit 1
    fi
    ok "Ollama installato"
fi

# Ensure Ollama is running
if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    warn "Ollama non in esecuzione. Avvio..."
    ollama serve &>/dev/null &
    sleep 3
fi
ok "Ollama in esecuzione"

# === 2. LLM MODEL ===
echo ""
echo "── Step 2/5: Modello LLM (qwen2.5:7b) ──"
if ollama list 2>/dev/null | grep -q "qwen2.5:7b"; then
    ok "qwen2.5:7b gia' presente"
else
    warn "Download qwen2.5:7b (~4.5 GB). Potrebbe richiedere qualche minuto..."
    ollama pull qwen2.5:7b
    ok "qwen2.5:7b scaricato"
fi

# === 3. BRAIN MODEL ===
echo ""
echo "── Step 3/5: Modello Brain (galileo-brain) ──"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if Brain GGUF exists in known locations
BRAIN_GGUF=""
for candidate in \
    "$SCRIPT_DIR/../models/galileo-brain"*.gguf \
    "$SCRIPT_DIR/../nanobot/models/galileo-brain"*.gguf \
    "$HOME/VOLUME 3/PRODOTTO/elab-builder/models/"*brain*.gguf; do
    if [ -f "$candidate" ]; then
        BRAIN_GGUF="$candidate"
        break
    fi
done

if ollama list 2>/dev/null | grep -q "galileo-brain"; then
    ok "galileo-brain gia' presente in Ollama"
elif [ -n "$BRAIN_GGUF" ]; then
    warn "Importo Brain GGUF: $BRAIN_GGUF"
    # Create Modelfile for Ollama
    MODELFILE=$(mktemp)
    cat > "$MODELFILE" <<EOF
FROM $BRAIN_GGUF
SYSTEM "Sei il cervello di Galileo. Rispondi SOLO in JSON."
PARAMETER temperature 0.1
PARAMETER top_p 0.95
PARAMETER num_predict 512
EOF
    ollama create galileo-brain -f "$MODELFILE"
    rm "$MODELFILE"
    ok "galileo-brain importato"
else
    warn "Brain GGUF non trovato. Uso qwen2.5:7b come fallback per il routing."
    warn "Per usare il Brain dedicato, posiziona il .gguf in elab-builder/models/"
fi

# === 4. ARDUINO-CLI ===
echo ""
echo "── Step 4/5: Arduino CLI ──"
if command -v arduino-cli &>/dev/null; then
    ok "arduino-cli gia' installato ($(arduino-cli version 2>/dev/null | head -1))"
else
    warn "arduino-cli non trovato. Installo via Homebrew..."
    if command -v brew &>/dev/null; then
        brew install arduino-cli
    else
        curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
        export PATH="$PATH:$HOME/bin"
    fi
    ok "arduino-cli installato"
fi

# Install Arduino AVR core
if arduino-cli core list 2>/dev/null | grep -q "arduino:avr"; then
    ok "Core arduino:avr gia' presente"
else
    warn "Installo core arduino:avr..."
    arduino-cli core update-index
    arduino-cli core install arduino:avr
    ok "Core arduino:avr installato"
fi

# === 5. PYTHON DEPS ===
echo ""
echo "── Step 5/5: Dipendenze Python ──"
if command -v python3 &>/dev/null; then
    ok "Python3 trovato ($(python3 --version))"
else
    fail "Python3 non trovato. Installa Python 3.11+."
    exit 1
fi

cd "$SCRIPT_DIR"
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet
    ok "Dipendenze Python installate"
fi

# === DONE ===
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  Installazione completata!                     ║"
echo "║                                                ║"
echo "║  Per avviare il server:                        ║"
echo "║    cd elab-local && python3 server.py          ║"
echo "║                                                ║"
echo "║  Il server sara' su http://localhost:8000      ║"
echo "║  ELAB Tutor lo rileva automaticamente.         ║"
echo "╚════════════════════════════════════════════════╝"
