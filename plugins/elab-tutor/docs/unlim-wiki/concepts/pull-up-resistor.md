---
id: pull-up-resistor
type: concept
title: "Resistenza Pull-Up — tenere un pin ancorato a HIGH"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [pull-up, resistenza, pulsante, input-pullup, pin-digitale, i2c, active-low]
---

## Definizione

Una **resistenza pull-up** è una resistenza collegata tra un pin digitale e la tensione di alimentazione (5 V o 3.3 V) il cui compito è mantenere quel pin a livello logico HIGH quando nessun altro componente lo sta pilotando attivamente.

> Concetto correlato con esempi da volume: vedi → [pull-up-pulldown.md](pull-up-pulldown.md) (Vol. 1 pag. 78 + Vol. 3 pag. 45).

## Analogia per la classe

Ragazzi, pensate a un pin come a una porta a molla: la molla (pull-up) la tiene sempre chiusa (HIGH). Per aprirla (LOW) serve premere attivamente — è il pulsante che schiacciamo. Quando lasciamo andare, la molla riporta tutto al posto (HIGH). Senza la molla, la porta sbatte a caso col vento.

## Come funziona fisicamente

```
    +5 V
      │
    [R_PU]   ← resistenza pull-up (tipico: 10 kΩ)
      │
      ├──────── pin Arduino (legge HIGH = 5 V a riposo)
      │
    [PULSANTE]
      │
     GND
```

Quando il pulsante **non è premuto**: la corrente scorre quasi zero attraverso R_PU, il pin legge HIGH (≈5 V).

Quando il pulsante **è premuto**: il pin viene cortocircuitato a GND. Corrente = 5 V / 10 kΩ = **0.5 mA** (sicura, non brucia nulla). Il pin legge LOW.

Questa è la logica **active-low**: pulsante premuto → segnale basso. La logica è invertita rispetto all'intuizione — questo sorprende spesso i ragazzi.

## Valori tipici della pull-up

| Applicazione | Valore R_PU | Nota |
|---|---|---|
| Pulsante tactile | 4.7 kΩ – 10 kΩ | Robusto vs rumore |
| Bus I2C (SDA/SCL) | 4.7 kΩ | Obbligatoria per I2C |
| Pin RESET Arduino | 10 kΩ | Resistenza di serie obbligatoria |
| INPUT_PULLUP interna | ~20–50 kΩ | Integrata nel chip ATmega328p |
| Ambienti rumorosi (motori) | 4.7 kΩ | Valore basso per resistere al rumore |

> **Regola pratica**: pull-up **troppo alta** (> 100 kΩ) è "debole" e il rumore la sovrasta. Pull-up **troppo bassa** (< 1 kΩ) spende troppa corrente quando il pulsante è premuto. Zona sicura: **4.7 kΩ – 47 kΩ**.

## Pull-up interna Arduino (INPUT_PULLUP)

Arduino Nano ha resistenze pull-up integrate nell'ATmega328p attivabili via software — nessun componente esterno necessario:

```cpp
// Abilita pull-up interna su pin 7
pinMode(7, INPUT_PULLUP);

// Lettura: LOW = premuto, HIGH = a riposo
if (digitalRead(7) == LOW) {
  Serial.println("Ragazzi, pulsante premuto!");
}
```

**Limiti INPUT_PULLUP**:
- Valore interno ~20–50 kΩ (variabile chip-by-chip) → non adatta per I2C o ambienti molto rumorosi
- Non disponibile su A6 e A7 della Nano (pin solo-ADC, senza circuito digitale pull-up)
- Per applicazioni critiche usare pull-up **esterna** di valore preciso

## Esperimenti correlati

- Capitolo pulsante + resistenza: `v1-cap8` (breadboard + pulsante + LED)
- Lettura INPUT_PULLUP: vedi sketch blink con pulsante nei capitoli input digitale
- Bus I2C (LCD display, sensori): pull-up 4.7 kΩ su SDA/SCL obbligatoria

## Errori comuni

1. **Logica invertita non gestita** — Con pull-up, premere il pulsante dà LOW. Codice che controlla `== HIGH` per rilevare pressione non funziona mai. Aggiungere commento `// active-low` per non dimenticare.

2. **Pull-up assente su I2C** — Bus I2C RICHIEDE pull-up esterna su SDA e SCL (4.7 kΩ). Senza di esse i dispositivi I2C (LCD, sensori) non comunicano affatto. Errore silenzioso difficile da diagnosticare.

3. **Pull-up esterna + INPUT_PULLUP contemporanee** — Doppia pull-up su stesso pin non rompe nulla, ma è ridondante. Risultante = resistenze in parallelo (es. 10 kΩ || 30 kΩ ≈ 7.5 kΩ). Usarne una sola.

4. **Resistenza troppo alta** — Pull-up da 470 kΩ è praticamente trasparente: qualsiasi filo lungo funge da antenna e il pin fluttua lo stesso. Restare sotto 47 kΩ.

5. **Confonderla con la resistenza limitatrice LED** — La pull-up serve a LEGGERE uno stato (INPUT), non a limitare corrente su un OUTPUT. Scopo e posizione nel circuito sono completamente diversi.

## Domande tipiche degli studenti

**"Perché non colleghiamo il pulsante direttamente a 5 V invece di usare questa resistenza?"**
Perché quando il pulsante è premuto, il pin è collegato sia a 5 V che a GND → cortocircuito diretto. La resistenza pull-up limita la corrente a 0.5 mA invece di bruciarla tutta.

**"Ma Arduino non ha già la pull-up dentro? Perché saldarne una esterna?"**
La pull-up interna (~30 kΩ) è comoda per i pulsanti, ma per I2C (4.7 kΩ obbligatoria) o ambienti con motori serve una pull-up esterna di valore preciso e più basso.

**"Valore preciso o posso usare quello che ho nel kit?"**
Per pulsanti: qualsiasi valore tra 4.7 kΩ e 47 kΩ funziona bene. Per I2C: usate 4.7 kΩ esatti (marrone-nero-rosso). Il kit Omaric include 10 kΩ (marrone-nero-arancio) ideali per pulsanti.

**"La pull-up consuma corrente anche quando non premo niente?"**
No! A riposo quasi zero corrente (il pin è a HIGH → nessuna differenza di potenziale effettiva verso il circuito). Solo quando il pulsante è premuto circola 0.5 mA (trascurabile).

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi (no parafasi — usa l'analogia della molla)**:

> "Ragazzi, il pin digitale senza pull-up è come una bilancia senza contrappesi — legge valori a caso. La resistenza pull-up è il contrappeso: tiene il pin fermo a HIGH finché voi non premete il pulsante e lo portate a GND."

**Sequenza didattica raccomandata**:
1. Mostrate il problema: sketch che stampa `digitalRead(pin)` in loop senza pull-up → sul Serial Monitor i valori ballano 0 e 1 casualmente
2. Aggiungete resistenza 10 kΩ a 5 V sul pin → valore stabile HIGH a riposo
3. Premete il pulsante → valore scende a LOW (active-low logica)
4. Mostrate che `INPUT_PULLUP` fa lo stesso lavoro senza resistenza esterna
5. Spiegate I2C come esempio dove la pull-up esterna è obbligatoria (Vol. 3 display LCD)

**Sicurezza**:
- Nessun rischio: corrente massima con pull-up 10 kΩ e pulsante premuto = 0.5 mA (limite sicuro Arduino 40 mA/pin)
- Non invertire GND e 5 V sulla pull-up: va collegata a 5 V (non GND, che sarebbe pull-down)

**Cosa NON fare**:
- Non lasciate mai pin configurati `INPUT` senza pull-up o pull-down — il "niente" non esiste in digitale
- Non fate vedere ai ragazzi un pin flottante senza prima spiegare PERCHÉ fluttua — sembrerebbe un bug di Arduino

## Link L1 (raw RAG queries)

- `"pull-up resistenza pulsante INPUT"`
- `"INPUT_PULLUP Arduino attiva-bassa"`
- `"resistenza pull-up valore 10k ohm"`
- `"I2C pull-up SDA SCL 4.7k"`
- `"pin flottante rumore digitale"`
- `"active-low logica pulsante premuto LOW"`
