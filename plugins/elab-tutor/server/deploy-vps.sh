#!/bin/bash
# ============================================
# ELAB Compile Server — Deploy su VPS Hostinger
# Esegui questo script via SSH sul VPS.
#
# Uso:
#   chmod +x deploy-vps.sh
#   ./deploy-vps.sh
#
# Andrea Marro — 10/02/2026
# ============================================

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  ELAB Compile Server — Deploy Script     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─── 1. Installa arduino-cli ───
echo "📦 Step 1: Installazione arduino-cli..."
if command -v arduino-cli &> /dev/null; then
    echo "  ✅ arduino-cli già installato: $(arduino-cli version)"
else
    echo "  ⬇️  Download arduino-cli..."
    curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh
    echo "  ✅ Installato: $(arduino-cli version)"
fi

# ─── 2. Installa core AVR ───
echo ""
echo "📦 Step 2: Installazione core Arduino AVR..."
if arduino-cli core list 2>/dev/null | grep -q "arduino:avr"; then
    echo "  ✅ arduino:avr già installato"
else
    echo "  ⬇️  Installazione arduino:avr (ci vorrà un minuto)..."
    arduino-cli core update-index
    arduino-cli core install arduino:avr
    echo "  ✅ arduino:avr installato"
fi

# ─── 2b. Installa librerie Arduino richieste ───
echo ""
echo "Step 2b: Installazione librerie Arduino (Servo, LiquidCrystal)..."
arduino-cli lib install Servo LiquidCrystal 2>/dev/null || true
echo "  Librerie installate"

# ─── 3. Test compilazione ───
echo ""
echo "🔧 Step 3: Test compilazione..."
TEMP_DIR=$(mktemp -d)
SKETCH_DIR="$TEMP_DIR/test_sketch"
OUTPUT_DIR="$TEMP_DIR/test_output"
mkdir -p "$SKETCH_DIR" "$OUTPUT_DIR"

cat > "$SKETCH_DIR/test_sketch.ino" << 'SKETCH_EOF'
void setup() { pinMode(13, OUTPUT); }
void loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }
SKETCH_EOF

if arduino-cli compile --fqbn arduino:avr:nano:cpu=atmega328old --output-dir "$OUTPUT_DIR" "$SKETCH_DIR" > /dev/null 2>&1; then
    HEX_SIZE=$(wc -c < "$OUTPUT_DIR/test_sketch.ino.hex" 2>/dev/null || echo "0")
    echo "  ✅ Compilazione test riuscita (hex: ${HEX_SIZE} bytes)"
else
    echo "  ❌ Compilazione test fallita!"
    echo "  Prova manualmente: arduino-cli compile --fqbn arduino:avr:nano:cpu=atmega328old $SKETCH_DIR"
    rm -rf "$TEMP_DIR"
    exit 1
fi
rm -rf "$TEMP_DIR"

# ─── 4. Setup directory server ───
echo ""
echo "📁 Step 4: Setup server..."
SERVER_DIR="/opt/elab-compile"
mkdir -p "$SERVER_DIR"

# Copia i file del server (se eseguito dalla cartella server/)
if [ -f "compile-server.js" ]; then
    cp compile-server.js "$SERVER_DIR/"
    cp package.json "$SERVER_DIR/"
    echo "  ✅ File copiati in $SERVER_DIR"
elif [ -f "server/compile-server.js" ]; then
    cp server/compile-server.js "$SERVER_DIR/"
    cp server/package.json "$SERVER_DIR/"
    echo "  ✅ File copiati in $SERVER_DIR"
else
    echo "  ⚠️  File server non trovati nella directory corrente."
    echo "  Copia manualmente compile-server.js e package.json in $SERVER_DIR"
fi

# ─── 5. Installa dipendenze Node ───
echo ""
echo "📦 Step 5: Installazione dipendenze npm..."
cd "$SERVER_DIR"
if command -v npm &> /dev/null; then
    npm install --production
    echo "  ✅ Dipendenze installate"
else
    echo "  ❌ npm non trovato. Installa Node.js >= 16"
    exit 1
fi

# ─── 6. Setup pm2 ───
echo ""
echo "🔄 Step 6: Setup pm2 (process manager)..."
if ! command -v pm2 &> /dev/null; then
    echo "  ⬇️  Installazione pm2..."
    npm install -g pm2
fi

# Stop vecchia istanza se esiste
pm2 delete elab-compile 2>/dev/null || true

# Avvia con pm2
pm2 start compile-server.js --name "elab-compile" --cwd "$SERVER_DIR"
pm2 save

echo "  ✅ Server avviato con pm2"

# ─── 7. Setup pm2 startup (auto-start dopo reboot) ───
echo ""
echo "🔄 Step 7: Auto-start dopo reboot..."
pm2 startup 2>/dev/null || echo "  ⚠️  Esegui il comando pm2 startup mostrato sopra come root"
pm2 save

# ─── 8. Verifica ───
echo ""
echo "🔍 Step 8: Verifica..."
sleep 2

if curl -s http://localhost:8000/health | grep -q '"status":"ok"'; then
    echo "  ✅ Server attivo e funzionante!"
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║  ✅ DEPLOY COMPLETATO!                           ║"
    echo "║                                                  ║"
    echo "║  Server: http://localhost:8000                   ║"
    echo "║  Health: http://localhost:8000/health             ║"
    echo "║                                                  ║"
    echo "║  Comandi pm2:                                    ║"
    echo "║    pm2 logs elab-compile    (vedi log)           ║"
    echo "║    pm2 restart elab-compile (riavvia)            ║"
    echo "║    pm2 stop elab-compile    (ferma)              ║"
    echo "╚══════════════════════════════════════════════════╝"
else
    echo "  ⚠️  Server avviato ma health check fallito."
    echo "  Controlla: pm2 logs elab-compile"
fi

echo ""
echo "📌 NOTA: Per rendere il server accessibile dall'esterno,"
echo "   aggiungi un reverse proxy nginx su porta 443 oppure"
echo "   apri la porta 8000 nel firewall del VPS."
echo ""
echo "   Esempio nginx (in /etc/nginx/sites-available/compile):"
echo "   server {"
echo "     listen 443 ssl;"
echo "     server_name compile.srv1022317.hstgr.cloud;"
echo "     ssl_certificate /etc/letsencrypt/live/...;"
echo "     location / { proxy_pass http://127.0.0.1:8000; }"
echo "   }"
