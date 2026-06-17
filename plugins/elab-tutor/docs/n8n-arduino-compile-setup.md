# ELAB Simulator — Setup Compilazione Arduino Reale

## Architettura

```
Browser (elab-builder.vercel.app)
  |
  | POST /webhook/elab-compile
  | { code: "void setup()...", board: "arduino:avr:nano:cpu=atmega328old" }
  |
  v
n8n (n8n.srv1022317.hstgr.cloud)
  |
  | Execute Command: arduino-cli compile
  |
  v
arduino-cli (installato sul VPS)
  |
  | Produce file .hex (Intel HEX)
  |
  v
n8n Respond to Webhook
  | { success: true, hex: "...", errors: null }
  |
  v
Browser (AVRBridge.loadHexFromString)
  |
  v
avr8js emulation (ATmega328p)
```

## Step 1: Installa arduino-cli sul VPS Hostinger

SSH al VPS:

```bash
# Installa arduino-cli
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh

# Verifica installazione
arduino-cli version

# Installa core AVR (Arduino Nano / UNO)
arduino-cli core update-index
arduino-cli core install arduino:avr

# Verifica che il core sia installato
arduino-cli core list
# Deve mostrare: arduino:avr  1.8.x  Arduino AVR Boards

# Crea directory di lavoro per le compilazioni
mkdir -p /tmp/elab_sketch /tmp/elab_output

# Test: compila un file di test
cat > /tmp/elab_sketch/elab_sketch.ino << 'EOF'
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
EOF

arduino-cli compile --fqbn arduino:avr:nano:cpu=atmega328old --output-dir /tmp/elab_output /tmp/elab_sketch

# Verifica che il hex sia stato prodotto
ls -la /tmp/elab_output/elab_sketch.ino.hex
# Se vedi il file, tutto funziona!
```

## Step 2: Crea il workflow n8n

### Opzione A: Importa il JSON (consigliata)

1. Apri n8n: `https://n8n.srv1022317.hstgr.cloud`
2. Clicca "Add workflow" (o Import from File)
3. Importa il file `n8n-elab-compile-workflow.json` (nella stessa cartella di questo file)
4. Attiva il workflow

### Opzione B: Crea manualmente

1. **Webhook Trigger**
   - Method: POST
   - Path: `elab-compile`
   - Response Mode: "Using 'Respond to Webhook' node"

2. **Code Node "Prepare Files"**
   ```javascript
   const code = $input.first().json.body.code;
   const board = $input.first().json.body.board || 'arduino:avr:nano:cpu=atmega328old';

   // Write sketch to temp file
   const fs = require('fs');
   const sketchDir = '/tmp/elab_sketch_' + Date.now();
   const outputDir = '/tmp/elab_output_' + Date.now();

   fs.mkdirSync(sketchDir, { recursive: true });
   fs.mkdirSync(outputDir, { recursive: true });

   const sketchPath = sketchDir + '/sketch.ino';
   fs.writeFileSync(sketchPath, code, 'utf-8');

   return [{
     json: {
       sketchDir,
       sketchPath,
       outputDir,
       board,
     }
   }];
   ```

3. **Execute Command Node "Compile"**
   - Command: `arduino-cli compile --fqbn {{ $json.board }} --output-dir {{ $json.outputDir }} {{ $json.sketchDir }} 2>&1`
   - Timeout: 60 seconds

4. **Code Node "Read Hex & Cleanup"**
   ```javascript
   const fs = require('fs');
   const sketchDir = $('Prepare Files').first().json.sketchDir;
   const outputDir = $('Prepare Files').first().json.outputDir;
   const exitCode = $input.first().json.exitCode;
   const stdout = $input.first().json.stdout || '';
   const stderr = $input.first().json.stderr || '';

   let hex = null;
   let success = false;
   let errors = null;

   if (exitCode === 0) {
     // Find the .hex file
     const files = fs.readdirSync(outputDir);
     const hexFile = files.find(f => f.endsWith('.hex'));
     if (hexFile) {
       hex = fs.readFileSync(outputDir + '/' + hexFile, 'utf-8');
       success = true;
     } else {
       errors = 'Hex file not produced';
     }
   } else {
     errors = stderr || stdout || 'Compilation failed';
   }

   // Cleanup temp files
   try {
     fs.rmSync(sketchDir, { recursive: true, force: true });
     fs.rmSync(outputDir, { recursive: true, force: true });
   } catch (e) { /* ignore cleanup errors */ }

   return [{
     json: {
       success,
       hex,
       errors,
       output: stdout,
     }
   }];
   ```

5. **Respond to Webhook Node**
   - Response Code: 200
   - Response Body: `{{ JSON.stringify($json) }}`
   - Content-Type: application/json

## Step 3: Test

```bash
# Test dal terminale
curl -X POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile \
  -H "Content-Type: application/json" \
  -d '{
    "code": "void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }",
    "board": "arduino:avr:nano:cpu=atmega328old"
  }'

# Risposta attesa:
# {"success":true,"hex":":100000000C945D0...","errors":null,"output":"..."}
```

## Step 4: CORS (importante!)

Se il browser blocca le richieste per CORS, aggiungi questo header nel nodo "Respond to Webhook":
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

In alternativa, in n8n vai nelle impostazioni del workflow e abilita "Respond to OPTIONS Requests".

## Troubleshooting

### "arduino-cli: command not found"
```bash
# Verifica il PATH
which arduino-cli
# Se non trovato, aggiungi al PATH
export PATH=$PATH:/usr/local/bin
# Oppure usa il path completo nel nodo Execute Command:
/usr/local/bin/arduino-cli compile ...
```

### "Platform not installed"
```bash
arduino-cli core update-index
arduino-cli core install arduino:avr
```

### "Permission denied"
```bash
chmod +x /usr/local/bin/arduino-cli
```

### Compilazione lenta (>30s)
La prima compilazione dopo il restart del VPS potrebbe essere lenta (50-60s) perché arduino-cli deve cachare i file. Le compilazioni successive sono molto piu veloci (3-8s).

---
Andrea Marro — 10/02/2026
