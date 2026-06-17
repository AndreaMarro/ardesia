---
id: buzzer-passive
type: concept
title: "Buzzer passivo — fare suoni e melodie con Arduino"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-v2
tags: [buzzer, passivo, piezo, tone, suono, melodia, frequenza, audio]
---

## Definizione

Il buzzer passivo (o cicalino piezo passivo) è un trasduttore acustico che converte un segnale elettrico **alternato** in suono. A differenza del buzzer attivo — che emette un bip fisso con sola tensione DC — il buzzer passivo **richiede un segnale a frequenza variabile** (come quello prodotto da `tone()`) per vibrare e generare suoni. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`. Il cicalino piezo del kit Omaric è trattato in Vol.1 pag.93 nel contesto allarme; `tone()` e melodie in Vol.3 pag.50.)*

La formula che lega frequenza e altezza del suono percepito:

```
Periodo (ms) = 1000 / frequenza (Hz)
Esempio: 440 Hz → periodo = 2.27 ms (LA4, accordatura standard)
```

## Analogia per la classe

Ragazzi, immaginate di tenere in mano un foglio di carta e di agitarlo su e giù. Se lo agitate lentamente → suono grave (bassa frequenza). Se lo agitate velocemente → suono acuto (alta frequenza). Il buzzer passivo funziona esattamente così: la membrana piezo vibra alla velocità che Arduino le comanda tramite `tone()`. Più alta la frequenza, più acuto il suono!

## Cosa succede fisicamente

All'interno del buzzer passivo c'è un **disco piezoelettrico**: un materiale ceramico che si deforma leggermente quando riceve tensione. Un'onda quadra a 440 Hz fa deformare il disco 440 volte al secondo → l'aria intorno vibra → noi sentiamo il LA4.

### Schema collegamento

```
Pin Arduino (es. pin 8) → [BUZZER PASSIVO +] → [BUZZER PASSIVO -] → GND
```

Non serve resistenza: il buzzer piezo ha impedenza sufficientemente alta da proteggere il pin Arduino.

### Confronto attivo vs passivo

| Caratteristica | Buzzer ATTIVO | Buzzer PASSIVO |
|----------------|--------------|----------------|
| Segnale richiesto | Solo DC (HIGH/LOW) | Onda quadra a frequenza |
| Suoni producibili | 1 solo bip fisso | Qualsiasi frequenza (melodie!) |
| Arduino richiede | `digitalWrite()` | `tone(pin, Hz)` |
| Identificazione | 2 pad, marcatura "+" | 2 pad, spesso senza marcatura |
| Flessibilità | Bassa (solo allarme) | Alta (melodie, scale, sirene) |

## Codice base con tone()

```cpp
const int PIN_BUZZER = 8;

void setup() {
  // niente da inizializzare per il buzzer passivo
}

void loop() {
  tone(PIN_BUZZER, 440, 500);   // LA4 per 500 ms
  delay(600);                   // pausa 600 ms (100 ms silenziosi dopo tono)
  tone(PIN_BUZZER, 523, 500);   // DO5 per 500 ms
  delay(600);
  noTone(PIN_BUZZER);           // sicurezza: ferma il segnale
  delay(1000);
}
```

Vedi concetto correlato: `tone-notone.md` — frequenze note musicali e libreria `pitches.h`.

## Esperimenti correlati

- **Allarme con cicalino** — Vol.1 pag.93, Capitolo 11: buzzer come segnale di allarme (usato come buzzer attivo, ma il piezo passivo funziona con `tone()`)
- **Melodie e tone()** — Vol.3 pag.50: `tone()` genera onde quadre per suoni e melodie
- **Simon Says audio** — Vol.3 pag.55: ogni colore LED ha la sua frequenza, ragazzi associano suono a colore
- **Sirena sweep** — Vol.3 pag.60: frequenza che sale e scende in loop

## Errori comuni

1. **Silenzio assoluto con `digitalWrite()`** — Il buzzer passivo non suona con semplice HIGH/LOW. Serve `tone()`. Se sentite silenzio, probabilmente avete usato `digitalWrite` invece di `tone()`.

2. **Buzzer attivo collegato al posto del passivo** — Con un buzzer attivo, `tone()` può produrre suoni distorti o metallici (l'oscillatore interno interferisce). Verificate il tipo guardando l'etichetta o aprendo il guscio.

3. **`noTone()` dimenticato** — Senza `noTone()`, il buzzer continua a emettere l'ultima frequenza anche dopo che il codice è "finito" (il timer hardware continua). Sempre `noTone(pin)` alla fine della sequenza sonora.

4. **Frequenze troppo basse o troppo alte** — Sotto 100 Hz il suono diventa un clic meccanico. Sopra 5000 Hz è stridulo e fastidioso. Range consigliato per la classe: 200–2000 Hz.

5. **Polarità invertita** — Molti buzzer passivi non hanno polarità critica (il piezo funziona in entrambe le direzioni), ma alcuni modelli hanno il "+" marcato: collegatelo al pin Arduino per sicurezza.

## Domande tipiche degli studenti

**"Ma il cicalino del kit è attivo o passivo?"**  
Nel kit Omaric è solitamente un piezo passivo (come quello usato in Vol.1 pag.93 con allarme). Per scoprirlo: collegate solo 5V e GND senza `tone()` — se suona da solo è attivo, se è silenzioso è passivo.

**"Come faccio a suonare due note insieme?"**  
`tone()` usa il Timer 2 dell'ATmega328 e può suonare UN solo pin alla volta. Per due suoni simultanei serve un buzzer hardware esterno o una libreria avanzata. Con un solo Arduino, fate suonare le note in rapida alternanza (tecnica arpeggio).

**"Posso regolare il volume?"**  
Non direttamente con `tone()`. Il volume del piezo è fisso per costruzione. Per un volume leggermente più basso potete aggiungere una resistenza da 100Ω in serie; per più alto, niente da fare sul piezo — usate un altoparlante 8Ω con transistor amplificatore.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Narrativa docente**: «Ragazzi, il buzzer passivo è come una piccola voce che aspetta che Arduino la "diriga". Con `tone()` siamo noi a decidere quale nota suonerà — possiamo fare un allarme, una melodia, la sirena di un'ambulanza. È uno degli esperimenti più divertenti perché sentiamo subito il risultato!»

> **Demo consigliata**: fate sentire la differenza tra `tone(8, 262)` (DO grave) e `tone(8, 1047)` (DO tre ottave sopra). La differenza è immediata e i ragazzi capiscono visceralmente cosa sia la frequenza.

> **Sicurezza**: il buzzer passivo piezo è completamente sicuro. Niente scotta, niente correnti pericolose. L'unico "pericolo" è il rumore: frequenze 3000–5000 Hz prolungate sono fastidiose. Per esercizi lunghi, rimanete nell'intervallo 200–800 Hz.

> **Collegamento al kit fisico**: mostrate sempre il buzzer fisico del kit Omaric. I ragazzi devono toccare il componente prima di montarlo sulla breadboard — il tatto + il suono = doppio rinforzo sensoriale.

## Link L1 (raw RAG queries)

- `"buzzer passivo arduino tone"`
- `"cicalino piezo frequenza arduino"`
- `"tone noTone arduino melodia"`
- `"buzzer attivo passivo differenza"`
- `"piezo trasduttore suono frequenza"`
- `"allarme cicalino arduino schema"`
