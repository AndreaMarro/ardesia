#!/bin/bash
# ELAB AUTOMA — Start everything
# Uso: bash automa/start.sh

DIR="$(cd "$(dirname "$0")" && pwd)"

# Ensure claude CLI is in PATH
export PATH="$HOME/.npm-global/bin:$PATH"

echo "╔════════════════════════════════════╗"
echo "║   ELAB AUTOMA — Avvio sistema     ║"
echo "╚════════════════════════════════════╝"

# Remove HALT if exists
rm -f "$DIR/HALT"

# Create directories
mkdir -p "$DIR/queue/pending" "$DIR/queue/active" "$DIR/queue/done" "$DIR/queue/failed"
mkdir -p "$DIR/logs" "$DIR/state" "$DIR/alerts" "$DIR/reports/nightly"

# Prevent Mac sleep
caffeinate -dims -t 86400 &
echo "Caffeinate attivo (24h)"

# Start orchestrator in background
echo "Avvio orchestrator..."
nohup python3 "$DIR/orchestrator.py" --loop >> "$DIR/logs/orchestrator-$(date +%Y%m%d).log" 2>&1 &
DISP_PID=$!
echo "Orchestrator avviato (PID: $DISP_PID)"

# Install watchdog launchd plist
PLIST="$HOME/Library/LaunchAgents/com.elab.automa.watchdog.plist"
cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.elab.automa.watchdog</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$DIR/watchdog.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>600</integer>
    <key>StandardOutPath</key>
    <string>$DIR/logs/watchdog-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$DIR/logs/watchdog-launchd-err.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null
launchctl load "$PLIST"
echo "Watchdog launchd installato (ogni 10 min)"

echo ""
echo "Sistema attivo!"
echo "  Dispatcher: PID $DISP_PID"
echo "  Watchdog: launchd ogni 10 min"
echo "  Log: $DIR/logs/"
echo "  Report: $DIR/reports/nightly/"
echo "  Stop: touch $DIR/HALT"
echo ""
echo "Il primo ciclo parte ora. Poi ogni 2 ore."
