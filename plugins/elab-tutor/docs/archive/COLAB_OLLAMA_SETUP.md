# ELAB AI - Ollama su Google Colab con GPU

Questo notebook configura Ollama con GPU su Colab per velocizzare la generazione AI nell'editor ELAB.

## Istruzioni

1. **Runtime → Cambia tipo di runtime → T4 GPU**
2. Esegui tutte le celle in ordine
3. Copia l'URL ngrok finale nell'editor ELAB

---

## Cella 1: Installa Ollama

```python
# Installa Ollama
!curl -fsSL https://ollama.com/install.sh | sh

# Verifica installazione
!ollama --version
```

## Cella 2: Avvia Ollama Server

```python
import subprocess
import time

# Avvia Ollama in background
process = subprocess.Popen(['ollama', 'serve'], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE)
time.sleep(5)
print("✅ Ollama server avviato!")
```

## Cella 3: Scarica Modello

```python
# Scarica gemma2:2b (1.6GB, ottimo per function calling)
!ollama pull gemma2:2b

# Verifica modello
!ollama list
```

## Cella 4: Configura ngrok

```python
# Installa ngrok
!pip install pyngrok -q

from pyngrok import ngrok

# ⚠️ IMPORTANTE: Inserisci il tuo token ngrok
# Ottieni gratis su: https://dashboard.ngrok.com/get-started/your-authtoken
NGROK_TOKEN = "YOUR_NGROK_TOKEN_HERE"  # <-- CAMBIA QUESTO!

ngrok.set_auth_token(NGROK_TOKEN)
```

## Cella 5: Esponi Ollama

```python
# Espone Ollama su URL pubblico
public_url = ngrok.connect(11434)
print("="*60)
print("🚀 OLLAMA URL (copia nell'editor ELAB):")
print(f"   {public_url}")
print("="*60)
print("\nNell'editor, modifica useFunctionGemma.js:")
print(f"   baseUrl: '{public_url}'")
```

## Cella 6: Test (Opzionale)

```python
import requests

# Test la connessione
response = requests.post(f"{public_url}/api/generate", json={
    "model": "gemma2:2b",
    "prompt": "Rispondi SOLO con JSON: {\"test\": \"ok\"}",
    "stream": False,
    "options": {"num_predict": 50}
})

print("Test response:", response.json().get('response', 'ERROR'))
```

## Cella 7: Mantieni Attivo

```python
# Mantiene la sessione attiva mentre usi l'editor
import time
print("⏳ Sessione attiva. Premi STOP per terminare.")
while True:
    time.sleep(60)
```

---

## Note

- La GPU T4 gratuita di Colab è ~10x più veloce del Mac M1 per LLM
- gemma2:2b risponde in ~3-5 secondi su GPU vs 30-60s su CPU
- Sessione Colab dura ~12 ore, poi devi rieseguire
