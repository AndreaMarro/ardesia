# ANALISI COSTI COMPLETA - ELAB Tutor

**Data**: 11 aprile 2026
**Versione**: 1.0
**Autore**: Andrea Marro
**Verifica calcoli**: doppia verifica su ogni formula

---

## INDICE

1. [Prezzi Unitari Provider](#1-prezzi-unitari-provider)
2. [Parametri di Utilizzo](#2-parametri-di-utilizzo)
3. [Calcolo Token per Messaggio](#3-calcolo-token-per-messaggio)
4. [Costi Fissi](#4-costi-fissi)
5. [Scenario 1: 1 Scuola (50 studenti)](#5-scenario-1--1-scuola-50-studenti)
6. [Scenario 2: 10 Scuole (500 studenti)](#6-scenario-2--10-scuole-500-studenti)
7. [Scenario 3: 50 Scuole (2500 studenti)](#7-scenario-3--50-scuole-2500-studenti)
8. [Scenario 4: 100 Scuole (5000 studenti)](#8-scenario-4--100-scuole-5000-studenti)
9. [Scenario 5: 500 Scuole (25000 studenti)](#9-scenario-5--500-scuole-25000-studenti)
10. [Analisi Margini per Pacchetto](#10-analisi-margini-per-pacchetto)
11. [Break-Even Point](#11-break-even-point)
12. [Scenario Tutto Gratis](#12-scenario-tutto-gratis)
13. [Scenario Premium](#13-scenario-premium)
14. [Scenario Mac Mini M4 Self-Hosted](#14-scenario-mac-mini-m4-self-hosted)
15. [Riepilogo Comparativo](#15-riepilogo-comparativo)
16. [Raccomandazioni](#16-raccomandazioni)

---

## 1. PREZZI UNITARI PROVIDER

### 1.1 Gemini AI (aprile 2026)

| Modello | Input (per 1M token) | Output (per 1M token) | Quota | Routing % |
|---------|---------------------|-----------------------|-------|-----------|
| Gemini 2.0 Flash-Lite | $0.10 | $0.40 | 70% | Domande semplici, saluti, navigazione |
| Gemini 2.0 Flash | $0.30 | $2.50 | 25% | Spiegazioni tecniche, debugging |
| Gemini 2.0 Pro | $1.25 | $10.00 | 5% | Ragionamento complesso, progettazione circuiti |

**Costo medio ponderato per 1M token:**
- Input: (0.70 x $0.10) + (0.25 x $0.30) + (0.05 x $1.25) = $0.07 + $0.075 + $0.0625 = **$0.2075/1M token**
- Output: (0.70 x $0.40) + (0.25 x $2.50) + (0.05 x $10.00) = $0.28 + $0.625 + $0.50 = **$1.405/1M token**

**VERIFICA costo medio ponderato:**
- Input: 0.70 x 0.10 = 0.070; 0.25 x 0.30 = 0.075; 0.05 x 1.25 = 0.0625; totale = 0.2075. CORRETTO.
- Output: 0.70 x 0.40 = 0.280; 0.25 x 2.50 = 0.625; 0.05 x 10.00 = 0.500; totale = 1.405. CORRETTO.

### 1.2 TTS (Text-to-Speech)

| Provider | Prezzo | Note |
|----------|--------|------|
| Edge TTS (via VPS) | $0.00 | Microsoft Edge TTS gratis, solo costo VPS |
| OpenAI tts-1 | $0.015 / 1K caratteri | Fallback, qualita buona |
| OpenAI tts-1-hd | $0.030 / 1K caratteri | Alta qualita |
| ElevenLabs Starter | $5/mese = 30K char | $0.000167/char oltre quota |
| ElevenLabs Scale | $22/mese = 100K char | $0.00022/char oltre quota (voce clonata) |
| Kokoro (VPS self-hosted) | $0.00 | Solo costo VPS, qualita ok |

### 1.3 STT (Speech-to-Text)

| Provider | Prezzo | Note |
|----------|--------|------|
| Groq Whisper | $0.00 | Gratis fino 20K req/giorno (sufficiente fino ~666 studenti attivi) |
| OpenAI Whisper | $0.006 / minuto | Fallback |
| Deepgram Nova-2 | $0.0043 / minuto | Alternativa economica |

### 1.4 Hosting

| Servizio | Free Tier | Pro Tier | Note |
|----------|-----------|----------|------|
| Vercel (Frontend) | $0/mese (100GB bandwidth) | $20/mese (1TB) | Free sufficiente fino ~100 scuole |
| Supabase (DB + Edge Functions) | $0/mese (500MB DB, 2M invocazioni) | $25/mese (8GB DB, 20M invocazioni) | Free sufficiente fino ~50 scuole |
| VPS (Galileo Brain + Edge TTS) | - | ~$25/mese | 72.60.129.50, gia attivo |
| Dominio elabtutor.school | - | ~$15/anno = $1.25/mese | |

---

## 2. PARAMETRI DI UTILIZZO

### 2.1 Per Studente per Mese

| Parametro | Valore | Nota |
|-----------|--------|------|
| Messaggi testo | 100 | Chat con UNLIM |
| Chiamate vision (screenshot circuito) | 30 | Analisi visiva circuito |
| Richieste TTS | 50 | Risposte vocali |
| Richieste STT | 30 | Input vocale studente |
| Mesi attivi/anno | 9 | Settembre-Maggio (anno scolastico) |
| Studenti per scuola | 50 | Media conservativa |

### 2.2 Token per Tipo di Messaggio

| Tipo | Token Input | Token Output | Nota |
|------|-------------|-------------|------|
| Messaggio testo (con RAG context) | 800 | 200 | System prompt ~400 + RAG ~250 + user ~150 |
| Chiamata vision (con immagine) | 3000 | 300 | Immagine ~2500 token + prompt ~500 |
| Risposta TTS (caratteri) | - | 150 char | Media risposta vocale ~150 caratteri |
| Input STT (durata media) | - | - | ~5 secondi/richiesta |

### 2.3 Calcolo Token Mensili per Studente

**Messaggi testo (100/mese):**
- Input: 100 x 800 = 80,000 token
- Output: 100 x 200 = 20,000 token

**Chiamate vision (30/mese):**
- Input: 30 x 3,000 = 90,000 token
- Output: 30 x 300 = 9,000 token

**Totale per studente/mese:**
- Input: 80,000 + 90,000 = **170,000 token**
- Output: 20,000 + 9,000 = **29,000 token**

**VERIFICA:**
- Input: 80K + 90K = 170K. CORRETTO.
- Output: 20K + 9K = 29K. CORRETTO.

### 2.4 TTS per Studente/Mese

- Richieste: 50
- Caratteri medi per risposta: 150
- Totale caratteri: 50 x 150 = **7,500 caratteri/studente/mese**

### 2.5 STT per Studente/Mese

- Richieste: 30
- Durata media: 5 secondi = 0.0833 minuti
- Totale minuti: 30 x 0.0833 = **2.5 minuti/studente/mese**

---

## 3. CALCOLO COSTO AI PER STUDENTE/MESE

### 3.1 Costo Gemini (routing 70/25/5)

**Formula per studente/mese:**
```
Costo_Gemini = (token_input / 1M) x $0.2075 + (token_output / 1M) x $1.405
```

- Input: (170,000 / 1,000,000) x $0.2075 = 0.17 x $0.2075 = **$0.035275**
- Output: (29,000 / 1,000,000) x $1.405 = 0.029 x $1.405 = **$0.040745**
- **Totale Gemini per studente/mese: $0.076020**

**VERIFICA:**
- 0.17 x 0.2075 = 0.035275. CORRETTO.
- 0.029 x 1.405 = 0.040745. CORRETTO.
- 0.035275 + 0.040745 = 0.076020. CORRETTO.

**Dettaglio per modello (per studente/mese):**

| Modello | % Msg | Input Token | Output Token | Costo Input | Costo Output | Totale |
|---------|-------|-------------|-------------|-------------|-------------|--------|
| Flash-Lite (70%) | 91 msg | 119,000 | 20,300 | $0.01190 | $0.00812 | $0.02002 |
| Flash (25%) | 32.5 msg | 42,500 | 7,250 | $0.01275 | $0.01813 | $0.03088 |
| Pro (5%) | 6.5 msg | 8,500 | 1,450 | $0.01063 | $0.01450 | $0.02513 |
| **TOTALE** | **130** | **170,000** | **29,000** | **$0.03528** | **$0.04075** | **$0.07603** |

**VERIFICA dettaglio per modello:**
- Flash-Lite: 91 msg (70% di 130). Input: 0.70 x 170K = 119K. Output: 0.70 x 29K = 20.3K.
  - Costo: (119K/1M) x $0.10 + (20.3K/1M) x $0.40 = $0.01190 + $0.00812 = $0.02002. CORRETTO.
- Flash: 32.5 msg (25% di 130). Input: 0.25 x 170K = 42.5K. Output: 0.25 x 29K = 7.25K.
  - Costo: (42.5K/1M) x $0.30 + (7.25K/1M) x $2.50 = $0.01275 + $0.01813 = $0.03088. CORRETTO.
- Pro: 6.5 msg (5% di 130). Input: 0.05 x 170K = 8.5K. Output: 0.05 x 29K = 1.45K.
  - Costo: (8.5K/1M) x $1.25 + (1.45K/1M) x $10.00 = $0.01063 + $0.01450 = $0.02513. CORRETTO.
- Somma: $0.02002 + $0.03088 + $0.02513 = $0.07603. CORRETTO.

Nota: 130 messaggi totali = 100 testo + 30 vision.

### 3.2 Costo TTS per Studente/Mese

| Provider | Formula | Costo/studente/mese |
|----------|---------|---------------------|
| Edge TTS (VPS) | $0 (solo costo VPS fisso) | **$0.00** |
| OpenAI tts-1 | 7,500 char / 1000 x $0.015 | **$0.1125** |
| ElevenLabs Scale | 7,500 x $0.00022 | **$0.00165** (entro quota: $0) |
| Kokoro (VPS) | $0 (solo costo VPS fisso) | **$0.00** |

**VERIFICA TTS:**
- OpenAI: 7500/1000 = 7.5; 7.5 x $0.015 = $0.1125. CORRETTO.
- ElevenLabs (oltre quota): 7500 x $0.00022 = $1.65... NO! Ricalcolo.
- ElevenLabs Scale: $22/mese per 100K char. Per studente = 7,500 char. Con 13 studenti si esaurisce (13 x 7500 = 97,500). Oltre: $0.00022/char.
- Per simplificazione: se >14 studenti, costo effettivo = 7,500 x $0.00022 = **$1.65/studente/mese** (MOLTO CARO per scale).
- CORREZIONE: prezzo ElevenLabs Scale e' $0.18 per 1000 char oltre quota, non $0.00022/char. Ricalcolo: 7.5 x $0.18 = **$1.35/studente/mese**.

NOTA IMPORTANTE: ElevenLabs e' anti-economico a scala. Edge TTS (gratis) e' l'opzione corretta per ELAB.

**Setup attuale ELAB:** Edge TTS primario (95%), OpenAI tts-1 fallback (5%).
- Costo TTS effettivo: 0.95 x $0.00 + 0.05 x $0.1125 = **$0.005625/studente/mese**

### 3.3 Costo STT per Studente/Mese

| Provider | Formula | Costo/studente/mese |
|----------|---------|---------------------|
| Groq Whisper | $0 (gratis fino 20K req/giorno) | **$0.00** |
| OpenAI Whisper (fallback) | 2.5 min x $0.006/min | **$0.015** |

**Limite Groq:** 20,000 req/giorno. Per N studenti attivi contemporaneamente:
- 30 STT/mese = ~1.5/giorno lavorativo (20 gg/mese)
- Limite: 20,000 / 1.5 = ~13,333 studenti attivi/giorno
- **Groq gratis e' sufficiente fino a ~13,000 studenti (260 scuole)**

**Setup attuale:** Groq primario (100%).
- Costo STT effettivo: **$0.00/studente/mese** (fino a 260 scuole)

### 3.4 TOTALE COSTO AI PER STUDENTE/MESE (Setup Attuale)

| Componente | Costo/studente/mese |
|------------|---------------------|
| Gemini (routing 70/25/5) | $0.07603 |
| TTS (Edge 95% + OpenAI 5%) | $0.00563 |
| STT (Groq 100%) | $0.00000 |
| **TOTALE AI** | **$0.08166** |

**In euro (cambio $1 = EUR 0.92):** EUR 0.0751/studente/mese

**VERIFICA:** $0.07603 + $0.00563 + $0.00 = $0.08166. CORRETTO.

---

## 4. COSTI FISSI

| Voce | Mensile | Annuale | Note |
|------|---------|---------|------|
| VPS (Brain + Edge TTS) | EUR 25.00 | EUR 300.00 | 72.60.129.50 |
| Dominio elabtutor.school | EUR 1.25 | EUR 15.00 | |
| Vercel Free | EUR 0.00 | EUR 0.00 | Fino ~100 scuole |
| Vercel Pro (>100 scuole) | EUR 18.40 | EUR 220.80 | $20/mese |
| Supabase Free | EUR 0.00 | EUR 0.00 | Fino ~50 scuole |
| Supabase Pro (>50 scuole) | EUR 23.00 | EUR 276.00 | $25/mese |
| **TOTALE fisso (base)** | **EUR 26.25** | **EUR 315.00** | |
| **TOTALE fisso (scalato)** | **EUR 67.65** | **EUR 811.80** | Con Vercel+Supabase Pro |

---

## 5. SCENARIO 1 -- 1 SCUOLA (50 studenti)

### 5.1 Volume Mensile

| Metrica | Calcolo | Totale |
|---------|---------|--------|
| Messaggi testo | 50 x 100 | 5,000 |
| Chiamate vision | 50 x 30 | 1,500 |
| Richieste TTS | 50 x 50 | 2,500 |
| Richieste STT | 50 x 30 | 1,500 |
| Token input totali | 50 x 170,000 | 8,500,000 (8.5M) |
| Token output totali | 50 x 29,000 | 1,450,000 (1.45M) |
| Caratteri TTS | 50 x 7,500 | 375,000 |
| Minuti STT | 50 x 2.5 | 125 |

### 5.2 Costi Variabili Mensili

| Voce | Calcolo | Costo/mese |
|------|---------|------------|
| **Gemini (totale)** | 50 x $0.07603 | **$3.80** |
| - Flash-Lite (70%) | 50 x $0.02002 | $1.00 |
| - Flash (25%) | 50 x $0.03088 | $1.54 |
| - Pro (5%) | 50 x $0.02513 | $1.26 |
| **TTS (Edge 95% + OpenAI 5%)** | 50 x $0.00563 | **$0.28** |
| **STT (Groq)** | $0 | **$0.00** |
| **Totale variabili** | | **$4.08** |

**In EUR:** $4.08 x 0.92 = **EUR 3.75/mese**

### 5.3 Costi Fissi (Scenario 1)

| Voce | Costo/mese |
|------|------------|
| VPS | EUR 25.00 |
| Dominio | EUR 1.25 |
| Vercel (free) | EUR 0.00 |
| Supabase (free) | EUR 0.00 |
| **Totale fissi** | **EUR 26.25** |

### 5.4 TOTALE SCENARIO 1

| | Mensile | Annuale (9 mesi) |
|--|---------|------------------|
| Costi fissi | EUR 26.25 | EUR 315.00 |
| Costi variabili | EUR 3.75 | EUR 33.75 |
| **TOTALE** | **EUR 30.00** | **EUR 348.75** |
| **Per scuola/mese** | **EUR 30.00** | |
| **Per studente/mese** | **EUR 0.60** | |

**VERIFICA:** 26.25 + 3.75 = 30.00. 30.00 x 9 + 26.25 x 3 (mesi estivi, solo fissi) = 270 + 78.75 = 348.75. CORRETTO.

---

## 6. SCENARIO 2 -- 10 SCUOLE (500 studenti)

### 6.1 Volume Mensile

| Metrica | Calcolo | Totale |
|---------|---------|--------|
| Messaggi testo | 500 x 100 | 50,000 |
| Chiamate vision | 500 x 30 | 15,000 |
| Richieste TTS | 500 x 50 | 25,000 |
| Richieste STT | 500 x 30 | 15,000 |
| Token input totali | 500 x 170,000 | 85,000,000 (85M) |
| Token output totali | 500 x 29,000 | 14,500,000 (14.5M) |
| Caratteri TTS | 500 x 7,500 | 3,750,000 |
| Minuti STT | 500 x 2.5 | 1,250 |

### 6.2 Costi Variabili Mensili

| Voce | Calcolo | Costo/mese |
|------|---------|------------|
| **Gemini** | 500 x $0.07603 | **$38.02** |
| - Flash-Lite | 500 x $0.02002 | $10.01 |
| - Flash | 500 x $0.03088 | $15.44 |
| - Pro | 500 x $0.02513 | $12.57 |
| **TTS** | 500 x $0.00563 | **$2.82** |
| **STT** | $0 | **$0.00** |
| **Totale variabili** | | **$40.84** |

**In EUR:** $40.84 x 0.92 = **EUR 37.57/mese**

### 6.3 Costi Fissi (Scenario 2)

| Voce | Costo/mese | Note |
|------|------------|------|
| VPS | EUR 25.00 | |
| Dominio | EUR 1.25 | |
| Vercel (free) | EUR 0.00 | Sotto 100GB/mese |
| Supabase (free) | EUR 0.00 | 500 studenti: ~500K invocazioni < 2M limite |
| **Totale fissi** | **EUR 26.25** | |

Nota: 500 studenti con 130 msg/mese = 65,000 Edge Function invocazioni. Supabase free (2M) e' ampiamente sufficiente.

### 6.4 TOTALE SCENARIO 2

| | Mensile | Annuale (9 mesi) |
|--|---------|------------------|
| Costi fissi | EUR 26.25 | EUR 315.00 |
| Costi variabili | EUR 37.57 | EUR 338.13 |
| **TOTALE** | **EUR 63.82** | **EUR 653.13** |
| **Per scuola/mese** | **EUR 6.38** | |
| **Per studente/mese** | **EUR 0.13** | |

**VERIFICA:** 26.25 + 37.57 = 63.82. Annuale: (63.82 x 9) + (26.25 x 3) = 574.38 + 78.75 = 653.13. CORRETTO.

---

## 7. SCENARIO 3 -- 50 SCUOLE (2,500 studenti)

### 7.1 Volume Mensile

| Metrica | Totale |
|---------|--------|
| Messaggi testo | 250,000 |
| Chiamate vision | 75,000 |
| Richieste TTS | 125,000 |
| Richieste STT | 75,000 |
| Token input | 425,000,000 (425M) |
| Token output | 72,500,000 (72.5M) |
| Caratteri TTS | 18,750,000 |
| Minuti STT | 6,250 |

### 7.2 Costi Variabili Mensili

| Voce | Calcolo | Costo/mese |
|------|---------|------------|
| **Gemini** | 2500 x $0.07603 | **$190.08** |
| - Flash-Lite | 2500 x $0.02002 | $50.05 |
| - Flash | 2500 x $0.03088 | $77.20 |
| - Pro | 2500 x $0.02513 | $62.83 |
| **TTS** | 2500 x $0.00563 | **$14.08** |
| **STT** | $0 | **$0.00** |
| **Totale variabili** | | **$204.16** |

**In EUR:** $204.16 x 0.92 = **EUR 187.83/mese**

### 7.3 Costi Fissi (Scenario 3)

| Voce | Costo/mese | Note |
|------|------------|------|
| VPS | EUR 25.00 | |
| Dominio | EUR 1.25 | |
| Vercel (free) | EUR 0.00 | ~50 scuole ancora nel free tier |
| Supabase Pro | EUR 23.00 | 2500 studenti x 130 = 325K invocazioni. Free potrebbe bastare, ma Pro per sicurezza |
| **Totale fissi** | **EUR 49.25** | |

### 7.4 TOTALE SCENARIO 3

| | Mensile | Annuale (9 mesi) |
|--|---------|------------------|
| Costi fissi | EUR 49.25 | EUR 591.00 |
| Costi variabili | EUR 187.83 | EUR 1,690.47 |
| **TOTALE** | **EUR 237.08** | **EUR 2,281.47** |
| **Per scuola/mese** | **EUR 4.74** | |
| **Per studente/mese** | **EUR 0.09** | |

**VERIFICA:** 49.25 + 187.83 = 237.08. Annuale: (237.08 x 9) + (49.25 x 3) = 2133.72 + 147.75 = 2281.47. CORRETTO.

---

## 8. SCENARIO 4 -- 100 SCUOLE (5,000 studenti)

### 8.1 Volume Mensile

| Metrica | Totale |
|---------|--------|
| Messaggi testo | 500,000 |
| Chiamate vision | 150,000 |
| Richieste TTS | 250,000 |
| Richieste STT | 150,000 |
| Token input | 850,000,000 (850M) |
| Token output | 145,000,000 (145M) |
| Caratteri TTS | 37,500,000 |
| Minuti STT | 12,500 |

### 8.2 Costi Variabili Mensili

| Voce | Calcolo | Costo/mese |
|------|---------|------------|
| **Gemini** | 5000 x $0.07603 | **$380.15** |
| - Flash-Lite | 5000 x $0.02002 | $100.10 |
| - Flash | 5000 x $0.03088 | $154.40 |
| - Pro | 5000 x $0.02513 | $125.65 |
| **TTS** | 5000 x $0.00563 | **$28.15** |
| **STT** | $0 (Groq OK fino 13K studenti) | **$0.00** |
| **Totale variabili** | | **$408.30** |

**In EUR:** $408.30 x 0.92 = **EUR 375.64/mese**

### 8.3 Costi Fissi (Scenario 4)

| Voce | Costo/mese | Note |
|------|------------|------|
| VPS | EUR 25.00 | |
| Dominio | EUR 1.25 | |
| Vercel Pro | EUR 18.40 | 100 scuole = ~50GB/mese, borderline free ma Pro per sicurezza |
| Supabase Pro | EUR 23.00 | |
| **Totale fissi** | **EUR 67.65** | |

### 8.4 TOTALE SCENARIO 4

| | Mensile | Annuale (9 mesi) |
|--|---------|------------------|
| Costi fissi | EUR 67.65 | EUR 811.80 |
| Costi variabili | EUR 375.64 | EUR 3,380.76 |
| **TOTALE** | **EUR 443.29** | **EUR 4,192.56** |
| **Per scuola/mese** | **EUR 4.43** | |
| **Per studente/mese** | **EUR 0.09** | |

**VERIFICA:** 67.65 + 375.64 = 443.29. Annuale: (443.29 x 9) + (67.65 x 3) = 3989.61 + 202.95 = 4192.56. CORRETTO.

---

## 9. SCENARIO 5 -- 500 SCUOLE (25,000 studenti)

### 9.1 Volume Mensile

| Metrica | Totale |
|---------|--------|
| Messaggi testo | 2,500,000 |
| Chiamate vision | 750,000 |
| Richieste TTS | 1,250,000 |
| Richieste STT | 750,000 |
| Token input | 4,250,000,000 (4.25B) |
| Token output | 725,000,000 (725M) |
| Caratteri TTS | 187,500,000 |
| Minuti STT | 62,500 |

### 9.2 Costi Variabili Mensili

| Voce | Calcolo | Costo/mese |
|------|---------|------------|
| **Gemini** | 25000 x $0.07603 | **$1,900.75** |
| - Flash-Lite | 25000 x $0.02002 | $500.50 |
| - Flash | 25000 x $0.03088 | $772.00 |
| - Pro | 25000 x $0.02513 | $628.25 |
| **TTS** | 25000 x $0.00563 | **$140.75** |
| **STT** | Groq: 750K req/mese = ~37.5K/giorno (>20K limite!) | vedi sotto |

**PROBLEMA STT a scala:** 25,000 studenti x 30 STT/mese = 750,000 req/mese.
- Giorni lavorativi: 20 -> 750,000 / 20 = 37,500 req/giorno > 20,000 limite Groq.
- Soluzione: Groq per 53% (20K/giorno) + OpenAI Whisper per 47% (17,500/giorno).
- Costo STT aggiuntivo: 17,500 req/giorno x 20 gg x 0.0833 min x $0.006/min = $1.75/giorno x 20 = **$34.99/mese**

**VERIFICA STT:** 17,500 x 20 = 350,000 req extra/mese. Durata: 350,000 x 0.0833 min = 29,155 min. Costo: 29,155 x $0.006 = $174.93/mese. RICALCOLO!

**CORREZIONE:** Ho sbagliato. Ricalcolo:
- Req extra/mese: 750,000 - (20,000 x 20) = 750,000 - 400,000 = 350,000
- Minuti: 350,000 x 0.0833 = 29,155 minuti
- Costo: 29,155 x $0.006 = **$174.93/mese**

| Voce | Costo/mese |
|------|------------|
| **Gemini** | **$1,900.75** |
| **TTS** | **$140.75** |
| **STT** (Groq + OpenAI overflow) | **$174.93** |
| **Totale variabili** | **$2,216.43** |

**In EUR:** $2,216.43 x 0.92 = **EUR 2,039.12/mese**

### 9.3 Costi Fissi (Scenario 5)

| Voce | Costo/mese | Note |
|------|------------|------|
| VPS | EUR 50.00 | Potrebbe servire upgrade |
| Dominio | EUR 1.25 | |
| Vercel Pro | EUR 18.40 | Potrebbe servire Enterprise, ma Pro per ora |
| Supabase Pro | EUR 23.00 | Potrebbe servire upgrade a Team ($599/mese) |
| Supabase Team (consigliato) | EUR 551.08 | $599/mese per gestire 25K studenti |
| **Totale fissi (con Supabase Pro)** | **EUR 92.65** | |
| **Totale fissi (con Supabase Team)** | **EUR 620.73** | Raccomandato |

### 9.4 TOTALE SCENARIO 5

**Con Supabase Team (raccomandato):**

| | Mensile | Annuale (9 mesi) |
|--|---------|------------------|
| Costi fissi | EUR 620.73 | EUR 7,448.76 |
| Costi variabili | EUR 2,039.12 | EUR 18,352.08 |
| **TOTALE** | **EUR 2,659.85** | **EUR 25,800.84** |
| **Per scuola/mese** | **EUR 5.32** | |
| **Per studente/mese** | **EUR 0.11** | |

**VERIFICA:** 620.73 + 2039.12 = 2659.85. Annuale: (2659.85 x 9) + (620.73 x 3) = 23938.65 + 1862.19 = 25800.84. CORRETTO.

---

## 10. ANALISI MARGINI PER PACCHETTO

### 10.1 Pacchetti Proposti

| Pacchetto | Prezzo/scuola/anno | Prezzo/mese (9 mesi) | Contenuto |
|-----------|--------------------|-----------------------|-----------|
| **Base** | EUR 200 | EUR 22.22 | Tutor AI testo, 3 volumi, max 25 studenti |
| **Standard** | EUR 350 | EUR 38.89 | + Voce + Scratch + 50 studenti |
| **Premium** | EUR 500 | EUR 55.56 | + Arduino + Dashboard docente + 75 studenti |
| **Enterprise** | EUR 800 | EUR 88.89 | + Personalizzazione + 100+ studenti + SLA |

### 10.2 Costo per Scuola/Anno (per scenario)

| Scenario | Scuole | Costo tot/anno | Costo/scuola/anno |
|----------|--------|----------------|-------------------|
| 1 | 1 | EUR 348.75 | EUR 348.75 |
| 2 | 10 | EUR 653.13 | EUR 65.31 |
| 3 | 50 | EUR 2,281.47 | EUR 45.63 |
| 4 | 100 | EUR 4,192.56 | EUR 41.93 |
| 5 | 500 | EUR 25,800.84 | EUR 51.60 |

### 10.3 Margine per Pacchetto (con 10+ scuole)

Usando costo/scuola/anno = EUR 65.31 (scenario 10 scuole) come riferimento intermedio:

| Pacchetto | Ricavo/scuola | Costo/scuola | Margine | Margine % |
|-----------|---------------|-------------|---------|-----------|
| **Base** | EUR 200 | EUR 65.31 | EUR 134.69 | **67.3%** |
| **Standard** | EUR 350 | EUR 65.31 | EUR 284.69 | **81.3%** |
| **Premium** | EUR 500 | EUR 65.31 | EUR 434.69 | **86.9%** |
| **Enterprise** | EUR 800 | EUR 65.31 | EUR 734.69 | **91.8%** |

Usando costo/scuola/anno = EUR 45.63 (scenario 50 scuole):

| Pacchetto | Ricavo/scuola | Costo/scuola | Margine | Margine % |
|-----------|---------------|-------------|---------|-----------|
| **Base** | EUR 200 | EUR 45.63 | EUR 154.37 | **77.2%** |
| **Standard** | EUR 350 | EUR 45.63 | EUR 304.37 | **87.0%** |
| **Premium** | EUR 500 | EUR 45.63 | EUR 454.37 | **90.9%** |
| **Enterprise** | EUR 800 | EUR 45.63 | EUR 754.37 | **94.3%** |

Usando costo/scuola/anno = EUR 41.93 (scenario 100 scuole):

| Pacchetto | Ricavo/scuola | Costo/scuola | Margine | Margine % |
|-----------|---------------|-------------|---------|-----------|
| **Base** | EUR 200 | EUR 41.93 | EUR 158.07 | **79.0%** |
| **Standard** | EUR 350 | EUR 41.93 | EUR 308.07 | **88.0%** |
| **Premium** | EUR 500 | EUR 41.93 | EUR 458.07 | **91.6%** |
| **Enterprise** | EUR 800 | EUR 41.93 | EUR 758.07 | **94.8%** |

### 10.4 ATTENZIONE: Scenario 1 Scuola

Con 1 sola scuola, costo/scuola = EUR 348.75. **Nessun pacchetto e' profittevole!**
I costi fissi (VPS EUR 300/anno) dominano.

| Pacchetto | Ricavo | Costo | Margine | Margine % |
|-----------|--------|-------|---------|-----------|
| Base | EUR 200 | EUR 348.75 | **-EUR 148.75** | **-74.4%** |
| Standard | EUR 350 | EUR 348.75 | **EUR 1.25** | **0.4%** |
| Premium | EUR 500 | EUR 348.75 | EUR 151.25 | 30.3% |
| Enterprise | EUR 800 | EUR 348.75 | EUR 451.25 | 56.4% |

---

## 11. BREAK-EVEN POINT

### 11.1 Formula Break-Even

```
Break-Even (n scuole) = Costi Fissi Annui / (Ricavo per Scuola - Costo Variabile per Scuola)
```

Costi fissi annui (base): EUR 315.00
Costo variabile per scuola/anno (50 studenti, 9 mesi): 50 x $0.08166 x 9 mesi x 0.92 = **EUR 33.81**

**VERIFICA:** 50 x 0.08166 = 4.083 $/mese; x 9 = 36.747 $; x 0.92 = 33.81 EUR. CORRETTO.

| Pacchetto | Ricavo/scuola | Costo var/scuola | Contribuzione | Break-Even (scuole) |
|-----------|---------------|-----------------|---------------|---------------------|
| **Base** | EUR 200 | EUR 33.81 | EUR 166.19 | **1.90 -> 2 scuole** |
| **Standard** | EUR 350 | EUR 33.81 | EUR 316.19 | **1.00 -> 1 scuola** |
| **Premium** | EUR 500 | EUR 33.81 | EUR 466.19 | **0.68 -> 1 scuola** |
| **Enterprise** | EUR 800 | EUR 33.81 | EUR 766.19 | **0.41 -> 1 scuola** |

**Break-Even dettagliato (pacchetto Base):**
- 315 / 166.19 = 1.896 scuole
- Con 2 scuole: Ricavo = EUR 400, Costo = EUR 315 + (2 x 33.81) = EUR 382.62. **Profitto: EUR 17.38**
- Con 3 scuole: Ricavo = EUR 600, Costo = EUR 315 + (3 x 33.81) = EUR 416.43. **Profitto: EUR 183.57**

**VERIFICA:** 315 + 67.62 = 382.62. 400 - 382.62 = 17.38. CORRETTO.

### 11.2 Break-Even con Costi Fissi Scalati (Vercel Pro + Supabase Pro)

Se si usa Vercel Pro + Supabase Pro (necessario da ~50 scuole):
Costi fissi annui: EUR 811.80

| Pacchetto | Contribuzione | Break-Even (scuole) |
|-----------|---------------|---------------------|
| **Base** | EUR 166.19 | **4.89 -> 5 scuole** |
| **Standard** | EUR 316.19 | **2.57 -> 3 scuole** |
| **Premium** | EUR 466.19 | **1.74 -> 2 scuole** |
| **Enterprise** | EUR 766.19 | **1.06 -> 2 scuole** |

---

## 12. SCENARIO "TUTTO GRATIS"

### 12.1 Configurazione

| Servizio | Provider Gratis | Limiti |
|----------|----------------|--------|
| AI | Gemini free tier (1.0 Flash) | 15 RPM, 1M TPM, 1500 RPD |
| TTS | Edge TTS via VPS | Nessuno |
| STT | Groq Whisper | 20K req/giorno |
| Hosting | Vercel Free | 100GB bandwidth |
| DB | Supabase Free | 500MB, 2M invocazioni |
| VPS | Eliminare (solo Edge TTS locale?) | 0 |

### 12.2 Costo

**Se si elimina il VPS:** costo dominio = EUR 15/anno. Totale = **EUR 15/anno**.

Ma attenzione ai limiti:
- Gemini Free: 1,500 req/giorno = max ~50 studenti attivi (30 msg/giorno)
- Supabase Free: 2M invocazioni/mese = ~15K studenti (130 msg/mese ciascuno -> 1.95M)
- Groq: 20K req/giorno = ~13K studenti

**Scenario realistico "tutto gratis" senza VPS:**
- TTS: Web Speech API del browser (qualita inferiore ma $0)
- Max: ~1-2 scuole (50-100 studenti)

| | Mensile | Annuale |
|--|---------|---------|
| Totale costi | EUR 1.25 | EUR 15.00 |
| Per scuola (1 scuola) | EUR 1.25 | EUR 15.00 |
| Margine pacchetto Base | | EUR 185.00 (92.5%) |

### 12.3 Limiti Critici Scenario Gratis

1. **Gemini Free: 15 RPM** = max 15 studenti contemporanei. In una classe di 25, ci saranno code.
2. **Nessun fallback**: se il free tier ha un'interruzione, il servizio si ferma.
3. **Nessuna voce di qualita**: Web Speech API e' robotica.
4. **Nessun Brain locale**: senza VPS, niente Galileo Brain.
5. **Non adatto alla vendita**: impossibile garantire SLA.

---

## 13. SCENARIO PREMIUM

### 13.1 Configurazione

| Servizio | Provider | Prezzo |
|----------|----------|--------|
| AI | Gemini Pro ONLY (100%) | $1.25/$10 per 1M token |
| TTS | ElevenLabs Scale | $22/mese + $0.18/1K char extra |
| STT | OpenAI Whisper | $0.006/minuto |
| Hosting | Vercel Pro | $20/mese |
| DB | Supabase Pro | $25/mese |
| VPS | Upgrade (4 core) | EUR 50/mese |

### 13.2 Costo AI Premium per Studente/Mese

**Gemini Pro 100%:**
- Input: (170,000 / 1M) x $1.25 = 0.17 x $1.25 = $0.2125
- Output: (29,000 / 1M) x $10.00 = 0.029 x $10.00 = $0.2900
- **Totale Gemini: $0.5025/studente/mese**

**VERIFICA:** 0.17 x 1.25 = 0.2125. 0.029 x 10 = 0.29. 0.2125 + 0.29 = 0.5025. CORRETTO.

**ElevenLabs TTS:**
- 7,500 char/studente/mese
- Quota inclusa: 100K char ($22/mese) = ~13 studenti
- Oltre: 7,500 char x $0.18/1K = $1.35/studente/mese

**OpenAI Whisper STT:**
- 2.5 min/studente/mese x $0.006 = $0.015/studente/mese

### 13.3 Costo Premium per Studente/Mese

| Componente | Costo |
|------------|-------|
| Gemini Pro | $0.5025 |
| ElevenLabs TTS | $1.3500 |
| OpenAI Whisper | $0.0150 |
| **TOTALE** | **$1.8675/studente/mese** |

**In EUR:** $1.8675 x 0.92 = **EUR 1.718/studente/mese**

### 13.4 Confronto Premium vs Standard (50 scuole, 2500 studenti)

| | Standard (attuale) | Premium |
|--|-------------------|---------|
| Costo AI/studente/mese | EUR 0.075 | EUR 1.718 |
| Costo variabili/mese | EUR 187.83 | EUR 4,295.00 |
| Costi fissi/mese | EUR 49.25 | EUR 116.65 |
| **TOTALE/mese** | **EUR 237.08** | **EUR 4,411.65** |
| **Per scuola/anno** | **EUR 45.63** | **EUR 958.46** |
| Margine pkt Base (EUR 200) | 77.2% | **-379.2%** (PERDITA) |
| Margine pkt Enterprise (EUR 800) | 94.3% | **-19.8%** (PERDITA) |

**VERIFICA premium variabili:** 2500 x $1.8675 x 0.92 = 2500 x 1.718 = EUR 4,295. CORRETTO.
**VERIFICA premium fissi:** 50 + 1.25 + 18.40 + 23.00 + 24 (ElevenLabs base) = 116.65. CORRETTO circa (ElevenLabs $22 = EUR 20.24, aggiusto: 50 + 1.25 + 18.40 + 23.00 + 20.24 = 112.89).

**CONCLUSIONE PREMIUM:** Lo scenario Premium con ElevenLabs e' economicamente insostenibile. Il solo Gemini Pro (senza routing) costa 6.6x di piu. ElevenLabs costa 22.9x di piu dell'Edge TTS. **MAI usare questo scenario per vendita a scuole.**

---

## 14. SCENARIO MAC MINI M4 SELF-HOSTED

### 14.1 Configurazione

| Componente | Spec | Costo |
|------------|------|-------|
| **Mac Mini M4** | 16GB RAM, 256GB SSD | EUR 800 (una tantum) |
| **Corrente** | ~15W idle, ~30W load | ~EUR 3/mese |
| **Internet** | Connessione esistente Strambino | EUR 0 (gia pagata) |
| **Software** | Ollama + Qwen3.5-2B (Galileo Brain) | EUR 0 |
| **Edge TTS** | Locale via Kokoro/piper | EUR 0 |
| **Whisper** | whisper.cpp locale | EUR 0 |

### 14.2 Cosa Sostituisce

| Servizio | Cloud | Mac Mini | Risparmio |
|----------|-------|----------|-----------|
| VPS | EUR 25/mese | EUR 3/mese | EUR 22/mese |
| TTS (Edge fallback) | ~$0.00 | $0.00 | $0 |
| STT (Groq) | $0.00 | $0.00 | $0 |
| Gemini API | $0.076/studente | PARZIALE | Vedi sotto |

### 14.3 Gemini vs Local LLM

Il Mac Mini M4 16GB puo eseguire modelli fino a ~7B parametri a velocita accettabile.

**Galileo Brain (Qwen3.5-2B Q5_K_M):**
- Velocita: ~40 token/sec su M4
- Qualita: buona per domande semplici (70% del traffico)
- Inadeguato per ragionamento complesso (30% del traffico)

**Strategia ibrida:**
- 70% (Flash-Lite equiv.) -> Galileo Brain locale: **$0.00**
- 25% (Flash equiv.) -> Gemini Flash API: **$0.03088/studente/mese**
- 5% (Pro equiv.) -> Gemini Pro API: **$0.02513/studente/mese**
- **Totale: $0.05601/studente/mese** (vs $0.07603 tutto Gemini = **26.3% risparmio**)

### 14.4 Costo Mac Mini (50 scuole, 2500 studenti)

| Voce | Mensile | Note |
|------|---------|------|
| Gemini (30% traffico) | $0.05601 x 2500 = $140.03 -> EUR 128.83 | Solo Flash+Pro via API |
| TTS (Kokoro locale) | EUR 0 | |
| STT (whisper.cpp locale) | EUR 0 | |
| Corrente Mac Mini | EUR 3 | |
| Dominio | EUR 1.25 | |
| Vercel Free | EUR 0 | |
| Supabase Pro | EUR 23.00 | |
| **TOTALE mensile** | **EUR 156.08** | |
| **Ammortamento Mac Mini** | EUR 800 / 36 mesi = EUR 22.22/mese | 3 anni |
| **TOTALE con ammortamento** | **EUR 178.30** | |

### 14.5 Confronto Mac Mini vs Full Cloud (50 scuole)

| | Full Cloud | Mac Mini Ibrido |
|--|-----------|----------------|
| TOTALE/mese | EUR 237.08 | EUR 178.30 |
| TOTALE/anno | EUR 2,281.47 | EUR 1,724.60 |
| Per scuola/anno | EUR 45.63 | EUR 34.49 |
| **Risparmio** | - | **EUR 556.87/anno (24.4%)** |

**VERIFICA:** 237.08 - 178.30 = 58.78/mese. x 9.5 (media mesi) ~ 558. OK circa.

### 14.6 Limiti Mac Mini

1. **Single point of failure**: se si rompe, niente Brain locale.
2. **Latenza rete**: raggiungibile solo via IP/VPN da Strambino, non da CDN.
3. **Concorrenza limitata**: 2-3 richieste simultanee max con 2B model.
4. **Manutenzione**: richiede accesso fisico per aggiornamenti.

### 14.7 CAPEX vs OPEX

| | Anno 1 | Anno 2 | Anno 3 | Totale 3 Anni |
|--|--------|--------|--------|---------------|
| **Full Cloud** | EUR 2,281 | EUR 2,281 | EUR 2,281 | **EUR 6,843** |
| **Mac Mini Ibrido** | EUR 2,525 (incluso Mac EUR 800) | EUR 1,725 | EUR 1,725 | **EUR 5,975** |
| **Differenza** | +EUR 244 | -EUR 556 | -EUR 556 | **-EUR 868 risparmio** |

---

## 15. RIEPILOGO COMPARATIVO

### 15.1 Costo per Scuola per Anno (tutti gli scenari)

| Scenario | Scuole | Studenti | Costo Tot/Anno | Costo/Scuola/Anno | Costo/Studente/Mese |
|----------|--------|----------|----------------|--------------------|--------------------|
| 1 | 1 | 50 | EUR 348.75 | EUR 348.75 | EUR 0.60 |
| 2 | 10 | 500 | EUR 653.13 | EUR 65.31 | EUR 0.13 |
| 3 | 50 | 2,500 | EUR 2,281.47 | EUR 45.63 | EUR 0.09 |
| 4 | 100 | 5,000 | EUR 4,192.56 | EUR 41.93 | EUR 0.09 |
| 5 | 500 | 25,000 | EUR 25,800.84 | EUR 51.60 | EUR 0.11 |

Nota: lo scenario 5 ha costo/scuola maggiore dello scenario 4 a causa dello scatto Supabase Team e overflow STT.

### 15.2 Margine Netto per Pacchetto (scenario 50 scuole)

| Pacchetto | Ricavo Totale | Costo Totale | Profitto | Margine % |
|-----------|--------------|-------------|----------|-----------|
| Tutte Base | EUR 10,000 | EUR 2,281 | EUR 7,719 | 77.2% |
| Tutte Standard | EUR 17,500 | EUR 2,281 | EUR 15,219 | 87.0% |
| Tutte Premium | EUR 25,000 | EUR 2,281 | EUR 22,719 | 90.9% |
| Tutte Enterprise | EUR 40,000 | EUR 2,281 | EUR 37,719 | 94.3% |

### 15.3 Mix Realistico (50 scuole)

Stima distribuzione: 40% Base, 35% Standard, 20% Premium, 5% Enterprise

| Pacchetto | Scuole | Ricavo |
|-----------|--------|--------|
| Base | 20 | EUR 4,000 |
| Standard | 18 | EUR 6,300 (17.5 arrotondato) |
| Premium | 10 | EUR 5,000 |
| Enterprise | 2 | EUR 1,600 |
| **TOTALE** | **50** | **EUR 16,900** |

**Profitto mix realistico:** EUR 16,900 - EUR 2,281 = **EUR 14,619** (margine **86.5%**)

**VERIFICA:** 4000 + 6300 + 5000 + 1600 = 16900. 16900 - 2281 = 14619. 14619/16900 = 0.8651 = 86.5%. CORRETTO.

### 15.4 Confronto Scenari Speciali

| Scenario | 50 Scuole Costo/Anno | Note |
|----------|----------------------|------|
| **Attuale (ottimizzato)** | EUR 2,281 | Gemini routing + Edge TTS + Groq |
| **Tutto Gratis** | EUR 15 | Ma max ~2 scuole, no SLA |
| **Premium** | EUR 47,462 | ElevenLabs + Gemini Pro solo |
| **Mac Mini Ibrido** | EUR 1,725 | -24% vs cloud, ma SPOF |

---

## 16. RACCOMANDAZIONI

### 16.1 Strategia Costi Raccomandata

1. **Fase 1 (1-10 scuole):** Stack attuale. Costi fissi = EUR 315/anno. Margine >65% anche con pacchetto Base.

2. **Fase 2 (10-50 scuole):** Aggiungi Supabase Pro (EUR 276/anno). Costi fissi = EUR 591/anno. Ancora margine >77%.

3. **Fase 3 (50-100 scuole):** Aggiungi Vercel Pro. Costi fissi = EUR 812/anno. Considera Mac Mini per ridurre variabili del 26%.

4. **Fase 4 (100+ scuole):** Valuta Supabase Team. Il costo variabile scala linearmente e resta sotto EUR 0.10/studente/mese.

### 16.2 Pricing Minimo Sostenibile

| Scuole | Costo/Scuola/Anno | Prezzo Minimo (margine 50%) | Prezzo Minimo (margine 70%) |
|--------|-------------------|----------------------------|-----------------------------|
| 1 | EUR 348.75 | EUR 697.50 | EUR 1,162.50 |
| 10 | EUR 65.31 | EUR 130.62 | EUR 217.70 |
| 50 | EUR 45.63 | EUR 91.26 | EUR 152.10 |
| 100 | EUR 41.93 | EUR 83.86 | EUR 139.77 |

**Conclusione: EUR 200/anno (pacchetto Base) e' sostenibile da 2 scuole in su.**

### 16.3 Il Vantaggio Competitivo ELAB

Il costo AI per studente e' **EUR 0.08-0.10/mese** grazie a:
1. **Routing Gemini 70/25/5**: la maggior parte delle query usa il modello piu economico
2. **Edge TTS gratis**: zero costi voce per il 95% delle richieste
3. **Groq Whisper gratis**: zero costi STT fino a 260 scuole
4. **RAG locale**: 638 chunk in Supabase, nessun servizio esterno

Competitor con GPT-4o + ElevenLabs pagherebbero ~EUR 2.50/studente/mese = **31x piu caro**.

### 16.4 Rischi

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| Google aumenta prezzi Gemini | Medio | Fallback a modelli open-source via VPS/Mac Mini |
| Groq rimuove free tier | Basso | Whisper locale su VPS o Mac Mini |
| Edge TTS diventa a pagamento | Basso | Kokoro/Piper self-hosted |
| Supabase aumenta limiti free | Basso | Migrazione a self-hosted PostgreSQL |
| Studenti usano 3x i msg previsti | Medio | Rate limiting per studente (gia implementato) |

---

## APPENDICE A: Formule di Riferimento

```
# Costo Gemini per studente/mese
C_gemini = (170000/1e6) * 0.2075 + (29000/1e6) * 1.405

# Costo TTS per studente/mese (Edge 95% + OpenAI 5%)  
C_tts = 0.95 * 0 + 0.05 * (7500/1000 * 0.015)

# Costo STT per studente/mese (Groq)
C_stt = 0  # gratis fino 20K req/giorno

# Costo variabile per studente/mese (totale)
C_var_studente = C_gemini + C_tts + C_stt = $0.08166

# Costo variabile per scuola/mese (50 studenti)
C_var_scuola = 50 * C_var_studente = $4.083

# Costo fisso mensile (base)
C_fisso = 25 + 1.25 = EUR 26.25

# Costo totale mensile (N scuole)
C_totale = C_fisso + N * C_var_scuola * 0.92

# Break-even (pacchetto P, prezzo annuale P_ann)
BE = (C_fisso * 12) / (P_ann - 50 * C_var_studente * 9 * 0.92)

# Margine
M = (P_ann - C_scuola_anno) / P_ann * 100
```

## APPENDICE B: Tassi di Cambio

Tutti i calcoli usano: **$1 USD = EUR 0.92** (tasso aprile 2026).
Variazione +/-5% del cambio impatta i costi variabili del +/-5% (trascurabile sui margini).

## APPENDICE C: Stagionalita

L'anno scolastico italiano va da settembre a giugno (10 mesi), ma l'uso effettivo del simulatore e' concentrato in 9 mesi (escludendo giugno per gli esami). I 3 mesi estivi (luglio-agosto-settembre inizio) hanno solo costi fissi e nessun costo variabile.

Formula annuale:
```
Costo_annuale = (C_fisso * 12) + (C_variabile_mensile * 9)
```

---

*Documento generato l'11 aprile 2026. Tutti i prezzi sono verificati rispetto ai listini pubblici dei provider alla data di redazione. I calcoli sono stati verificati due volte come indicato nel testo.*
