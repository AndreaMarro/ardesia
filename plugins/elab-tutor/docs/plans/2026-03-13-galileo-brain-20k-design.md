# Galileo Brain 20K — Dataset Design

> **Data**: 2026-03-13
> **Base**: PoC 500 esempi (S75) → Scalata 20,000
> **Focus**: Controllo onnipotente, onniscienza, persistenza memoria
> **Formato**: ChatML JSONL, single-turn + multi-turn

---

## 1. Obiettivo

Generare **20,000 esempi** diversificati per fine-tuning Qwen3-4B come Galileo Brain v2. Il modello deve:
- Controllare OGNI aspetto del simulatore (onnipotenza)
- Rispondere a QUALSIASI domanda su elettronica/Arduino (onniscienza)
- Mantenere contesto conversazionale multi-turno (persistenza)
- Gestire typo, slang, ambiguita', emozioni (robustezza)

## 2. Distribuzione

| Tier | Focus | Qty | % |
|------|-------|-----|---|
| T1 | Controllo Onnipotente | 8,000 | 40% |
| T2 | Onniscienza | 5,000 | 25% |
| T3 | Navigazione | 2,000 | 10% |
| T4 | Memoria & Persistenza (multi-turn) | 3,000 | 15% |
| T5 | Robustezza | 2,000 | 10% |

## 3. Categorie (33 totali)

### T1 — Controllo Onnipotente (8000)
- C1: Comandi simulazione (1500)
- C2: Piazzamento singolo 21 tipi (1500)
- C3: Multi-componente 2-8 (1500)
- C4: Wiring pin-to-pin/bus/wing (1000)
- C5: Rimozione/sostituzione/spostamento (800)
- C6: Interazioni highlight/interact/measure/diagnose/setvalue (800)
- C7: Multi-action chains (900)

### T2 — Onniscienza (5000)
- C8: Teoria elettronica (1200)
- C9: Codice Arduino (800)
- C10: Info esperimenti (600)
- C11: Domande comparative (400)
- C12: Debug/diagnosi (800)
- C13: Code generation (700)
- C14: Quiz/giochi (500)

### T3 — Navigazione (2000)
- C15: Load experiment 69 exp (800)
- C16: Tab switching 10 tab (400)
- C17: Volume navigation (300)
- C18: Editor switching scratch/arduino (300)
- C19: YouTube/notebook/risorse (200)

### T4 — Memoria & Persistenza (3000, MULTI-TURN)
- C20: Nome/eta' studente (300)
- C21: Contesto circuito (500)
- C22: Catene azioni sequenziali (600)
- C23: Correzioni post-errore (500)
- C24: Riferimenti anaforici (500)
- C25: Ripresa conversazione (300)
- C26: Preferenze apprese (300)

### T5 — Robustezza (2000)
- C27: Typo gravi (600)
- C28: Slang bambino (400)
- C29: Vaghi/ambigui (300)
- C30: Emotivi (200)
- C31: Negazioni (200)
- C32: Off-topic redirect (200)
- C33: Estremi lunghezza (100)

## 4. Formato

### Single-turn (T1/T2/T3/T5)
```jsonl
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"[CONTESTO]\n...\n[MESSAGGIO]\n..."},{"role":"assistant","content":"{JSON}"}]}
```

### Multi-turn (T4)
```jsonl
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"[CONTESTO]\n...\n[MESSAGGIO]\nMi chiamo Marco"},{"role":"assistant","content":"{JSON con response: Ciao Marco!}"},{"role":"user","content":"[CONTESTO]\n...\n[MESSAGGIO]\nMetti un LED"},{"role":"assistant","content":"{JSON con entities che ricordano Marco}"},{"role":"user","content":"[CONTESTO]\n...\n[MESSAGGIO]\nCome mi chiamo?"},{"role":"assistant","content":"{JSON: Ti chiami Marco!}"}]}
```

## 5. Typo Engine

Probabilita' typo per esempio: 30% (6000 su 20000)
Tipi di errore:
- Lettere invertite: "avvia" → "aviva"
- Lettere mancanti: "resistenza" → "resistnza"
- Lettere doppie: "costruisci" → "costrusci"
- Spazi mancanti: "metti un" → "mettiun"
- Autocorrect: "LED" → "led", "buzzer" → "bazza"
- Accenti errati: "perche" → "perchè" → "xke"

## 6. Metriche Target

| Metrica | Target |
|---------|--------|
| JSON valido | 100% |
| Action tag syntax | 100% |
| Duplicati esatti | 0 |
| Copertura 23 action tag | 23/23 |
| Copertura 21 componenti | 21/21 |
| Copertura 69 esperimenti | 69/69 |
| Copertura 10 tab | 10/10 |
| Multi-turn entries | 3,000 (15%) |
| Con typo | ~6,000 (30%) |
| needs_llm=true | ~35% (vs 12.6% PoC) |

---

**Approvato da**: Andrea Marro
**Stato**: Design approvato, generazione in corso
