---
id: encoder-quadrature
type: concept
title: "Encoder in quadratura — direzione e posizione"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [encoder, quadratura, posizione, vol-non-coperto]
---

## Definizione

Un **encoder in quadratura** ha due uscite (A e B) sfasate di 90 gradi. Leggendo l'ordine con cui i due segnali cambiano si capisce **direzione** (A prima di B = orario, B prima di A = antiorario) e **posizione** (contando i fronti). E' la base degli encoder rotativi (manopole come quella del Vol.3 vedi `encoder-rotativo.md`) e dei sensori di posizione su motori DC.

## Quattro stati possibili

| Stato | A | B |
|---|---|---|
| 1 | LOW | LOW |
| 2 | HIGH | LOW |
| 3 | HIGH | HIGH |
| 4 | LOW | HIGH |

Sequenza orario: 1->2->3->4->1. Sequenza antiorario: 1->4->3->2->1.

## Risoluzione

- **CPR** (Counts Per Revolution) -- numero di impulsi per giro
- **PPR** (Pulses Per Revolution) -- numero di transizioni per giro
- **Quadratura 4x** -- contando ogni fronte (rising + falling su A + B), si quadruplica la risoluzione

Encoder rotativi tipici: 20 PPR (manopola Arduino), 600-1024 PPR (motori industriali).

## Esempio Arduino con interrupt

```cpp
const int A = 2;
const int B = 3;
volatile long counter = 0;

void setup() {
  pinMode(A, INPUT_PULLUP);
  pinMode(B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(A), onA, RISING);
  Serial.begin(9600);
}

void onA() {
  if (digitalRead(B) == LOW) counter++;
  else counter--;
}

void loop() {
  Serial.println(counter);
  delay(100);
}
```

Su Arduino UNO/Nano, solo D2 e D3 supportano interrupt esterni -> usali per i due canali se vuoi 4x quadratura.

## Errori comuni

1. **Senza pull-up** -> i pin flottano e contano spuri
2. **Senza debounce hardware** (RC) sui rotativi meccanici -> letture doppie/triple
3. **Solo polling, no interrupt** -> ruotando veloce si perdono passi
4. **Confondere CPR e PPR** -> risoluzione effettiva sbagliata di un fattore 4

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, un encoder in quadratura ha due segnali "sfasati" come due gambe che camminano una dopo l'altra. Guardando quale gamba si muove prima si capisce se sto camminando avanti o indietro.

**Cosa fare:**
- Per il kit ELAB usate l'encoder rotativo `encoder-rotativo.md` (Vol. corrispondente)
- Mostrare con un oscilloscopio o due LED i due segnali A e B sfasati
- Spiegare che i motori delle stampanti 3D moderne usano encoder per posizione precisa

**Sicurezza:**
- Pull-up interni di Arduino sufficienti per encoder rotativi
- Encoder ottici industriali a volte richiedono 12-24 V -> opto-isolatore + livello logico

## Link L1 (raw RAG queries)

- "encoder quadratura A B sfasati"
- "interrupt encoder Arduino D2 D3"
- "CPR PPR quadrature 4x"
