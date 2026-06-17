---
id: transistor-bjt
type: concept
title: "Transistor BJT (Bipolare a Giunzione)"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-session-2026-04-28
tags: [transistor, bjt, npn, pnp, interruttore, amplificatore, base, collettore, emettitore, arduino]
---

## Definizione

Il transistor BJT (Bipolar Junction Transistor) è un componente a tre terminali che può funzionare come **interruttore elettronico** o come **amplificatore di segnale**: una piccola corrente che entra nella base controlla una corrente molto più grande tra collettore ed emettitore. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

## Analogia per la classe

Ragazzi, immaginate un rubinetto dell'acqua con una valvola piccola e una grande. Con un solo dito (poca forza) sulla valvola piccola, potete aprire o chiudere il flusso di tanta acqua nel tubo grande. Il transistor funziona esattamente così: la **base** è la valvola piccola (il vostro dito = corrente di Arduino), il **collettore** e l'**emettitore** sono il tubo grande dove scorre la corrente del circuito più potente — un motore, un LED ad alta potenza, un buzzer.

## I tre terminali — da ricordare sempre

| Terminale | Sigla | Ruolo |
|-----------|-------|-------|
| **Base** | B | Ingresso di controllo (piccola corrente da Arduino) |
| **Collettore** | C | Ingresso della corrente principale (dal + della batteria) |
| **Emettitore** | E | Uscita (va a GND) |

**Tipo NPN** (il più usato nei kit Arduino — es. BC547, 2N2222, S8050):
- Base → alta → transistor ON (corrente scorre da C a E)
- Base → bassa → transistor OFF (circuito aperto)

**Tipo PNP** (es. BC557): funziona al contrario — base bassa = ON. Meno comune negli esperimenti base.

## Schema collegamento tipico NPN (interruttore LED / motore)

```
       +5V (o batteria)
         │
         ├── [carico: LED + R oppure motore]
         │
   Collettore (C)
         │
   [Transistor NPN es. BC547]
         │
   Emettitore (E)
         │
        GND

Base (B) ──── [Resistenza 1kΩ] ──── Pin digitale Arduino (D5 ecc.)
```

**Regola base (NPN)**: metti sempre una resistenza da 1kΩ tra il pin Arduino e la Base — protegge sia Arduino che il transistor.

## Cosa succede fisicamente

Il transistor BJT è formato da **tre strati di silicio** alternati N-P-N (o P-N-P). Quando la corrente di Base supera una soglia (~0.6–0.7V tra B e E), il transistor si "accende" e lascia passare la corrente da Collettore a Emettitore.

Il **guadagno di corrente** (chiamato h_FE o β — beta) dice quante volte la corrente del collettore è più grande di quella della base:

```
I_C = β × I_B
```

| Transistor | β tipico | I_C max | V_CE max |
|------------|---------|---------|---------|
| BC547 | 100–300 | 100 mA | 45 V |
| 2N2222 | 100–300 | 600 mA | 40 V |
| TIP120 (Darlington) | 1000+ | 5 A | 60 V |

**Esempio pratico**: Arduino eroga 5 mA dalla base → transistor 2N2222 (β=200) → I_C = 200 × 5mA = 1A (sufficiente per un piccolo motore DC).

## Modalità operative

1. **Interruttore (saturazione/interdizione)**: il transistor è completamente ON o completamente OFF — usato per controllare carichi digitali (motori, LED, relay).
2. **Amplificatore (regione attiva)**: la corrente di collettore varia proporzionalmente alla base — usato per amplificare segnali audio/sensori (avanzato, non nel kit base).

## Esperimenti correlati

- **LED ad alta potenza con transistor** — controllare LED o strip LED che superano i 40 mA limite pin Arduino (tipicamente Cap. avanzato Vol. 2-3, sezione attuatori)
- **Motore DC con transistor NPN** — sostituisce il driver L298N per motori piccoli (<200mA); diodo di protezione in parallelo al motore
- **Buzzer attivo con transistor** — il buzzer da 5V non eroga >40mA, ma il transistor rende il circuito più stabile
- **Relay driver** — transistor NPN pilota la bobina del relay; il relay controlla 230V (NON toccato in kit base per sicurezza)
- Vedi anche `mosfet.md` per l'alternativa MOSFET (più efficiente per correnti medie/alte)

## Errori comuni

1. **Transistor montato al contrario** — BC547 ha pin B-C-E da sinistra a destra (fila piatta verso di voi). Se invertito, non funziona o si surriscalda. Controllare sempre il datasheet o la marcatura del componente.
2. **Nessuna resistenza sulla Base** — corrente eccessiva brucia il transistor E il pin Arduino in pochi secondi. Usare sempre ≥1kΩ.
3. **Nessun diodo di protezione su motori/relay** — il motore genera un picco di tensione inversa (back-EMF) quando si spegne. Mettere un diodo 1N4007 in antiparallelo al carico induttivo.
4. **Confondere NPN con PNP** — visivamente identici. Verificare la sigla stampata sul componente (BC547=NPN, BC557=PNP).
5. **Carico troppo pesante** — un BC547 regge solo 100 mA. Per motori più grandi usare TIP120 o MOSFET IRL540.

## Domande tipiche degli studenti

**"Perché non collegare il motore direttamente ad Arduino?"**  
I pin digitali di Arduino Nano erogano massimo 40 mA. Un motorino DC anche piccolo richiede 200–600 mA. Il transistor è il "braccio forte" che fa il lavoro pesante, mentre Arduino dà solo l'ordine.

**"Cos'è il MOSFET e quando usarlo invece del BJT?"**  
Il MOSFET controlla la corrente con la **tensione** (non la corrente di base), non consuma quasi nulla dal pin Arduino, ed è più efficiente ad alte correnti. Per esperimenti semplici on/off entrambi vanno bene; per motori grandi o LED strip preferire MOSFET. Vedi `mosfet.md`.

**"Come capisco quale pin è Base, Collettore, Emettitore?"**  
Con il BC547 (piattina verso di voi, pin in basso): pin 1 = Collettore, pin 2 = Base, pin 3 = Emettitore. Oppure cercate "BC547 pinout" sul datasheet — sempre la fonte più affidabile.

**"Il transistor si rompe facilmente?"**  
Se rispettate le correnti massime e usate la resistenza di base, è molto robusto. I guasti tipici sono: base senza resistenza (brucia subito), corrente collettore oltre il limite (si surriscalda lentamente). Un transistor rotto di solito va in "cortocircuito" permanente — il carico rimane sempre acceso.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Sicurezza**: il transistor lavora a 5V/batteria bassa — nessun rischio di scossa. Attenzione solo al calore: se il transistor diventa molto caldo da toccare, significa che sta lavorando al limite o c'è un errore nel circuito. Spegnere subito e controllare.

> **Narrativa**: «Ragazzi, il transistor è uno dei componenti più importanti dell'elettronica moderna — ogni processore dentro il vostro smartphone contiene miliardi di transistor minuscoli! Quello che usate voi è la versione grande e "visibile" dello stesso principio. Con un segnale piccolo di Arduino, controllate carichi che Arduino da solo non potrebbe mai gestire.»

> **Aggancio concreto**: far toccare il transistor mentre pilota un motore (è tiepido, non brucia) — percepire fisicamente il calore = percepire la corrente che passa. Poi misurare con il multimetro la tensione base-emettitore (~0.7V) per "vedere" la soglia di attivazione.

> **Transizione al concetto avanzato**: una volta capito l'interruttore, mostrare che abbassando la resistenza di base (es. da 1kΩ a 10kΩ) il motore rallenta — introduzione intuitiva all'amplificazione in regione attiva, senza formule.

## Link L1 (raw RAG queries)

```
transistor NPN arduino kit
BC547 collettore base emettitore
interruttore elettronico motore arduino
transistor pilota motore DC
resistenza base transistor
```

Cercare in `src/data/rag-chunks.json` con le query sopra per trovare chunk L1 correlati se presenti.
