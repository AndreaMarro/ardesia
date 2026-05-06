---
id: bjt-thermal
type: concept
title: "BJT calore — quando il transistor scotta"
locale: it
volume_ref: null
pagina_ref: null
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
source_status: general_knowledge_only
fix_iter44_W2: "Pagine fabbricate. Concept marcato general_knowledge_only."
tags: [bjt, transistor, calore, surriscaldamento, dissipazione, sicurezza, vol2]
---

## Definizione

Il BJT (Bipolar Junction Transistor) dissipa potenza P = Vce × Ic ogni volta che conduce corrente di collettore. Vol. 2 pag. 142 affronta il tema sicurezza: "se il transistor scotta, qualcosa non va. Va spento subito".

Un BJT in **zona attiva** (amplificazione lineare) dissipa molto: tutta la corrente passa attraverso una giunzione che cade Vce ≈ 2-5 V. Esempio: BC547 con Ic = 100 mA e Vce = 5 V → P = 500 mW > limite 625 mW del package TO-92.

In **saturazione** (interruttore ON) Vce_sat ≈ 0.2 V → P = 0.2 × 0.1 = 20 mW. Sicuro.

## Quando un BJT scotta

| Causa | Sintomo | Soluzione |
|-------|---------|-----------|
| Resistenza base mancante | scotta + pin base bruciato | aggiungere R_b 1-10 kΩ |
| Operating in zona lineare | scotta moderato (40-70 °C) | usare come switch saturato |
| Carico cortocircuitato | scotta intenso + bruciato | rimuovere cortocircuito carico |
| Beta sbagliato per applicazione | non satura, dissipa | usare transistor con beta ≥ 100 |
| Tensione collettore troppo alta | scotta + emettitore bruciato | rispettare Vceo max (45V per BC547) |
| Senza dissipatore con >300 mW | scotta + thermal runaway | aggiungere heatsink o usare TO-220 |

**Vol. 2 pag. 142 regola di sicurezza**: se non riuscite a tenere il dito sul transistor 5 secondi, è troppo caldo. Spegnere subito + indagare.

## Limiti package BC547 (kit ELAB)

| Parametro | Limite | Note |
|-----------|--------|------|
| Pd max @ 25 °C | 625 mW | dissipa pi P > 625 mW = thermal runaway |
| Tj max | 150 °C | giunzione si distrugge oltre |
| Ta max ambient | 70 °C | derate sopra |
| Ic max DC | 100 mA | sustained |

Per carichi >100 mA usare BD135/BD139 (TO-126, 1.25 W) o MOSFET.

## Calcolo dissipazione

Esempio sketch reale: pilotare LED da 9V con BJT come switch.

```
       +9V ───[470 Ω]───[LED]───┐
                                │
                                C  (collettore BC547)
                                │
   Arduino pin → [4.7 kΩ] ──── B  (base)
                                │
                                E  (emettitore)
                                │
                               GND
```

- Ic = (9 - 2 - 0.2) / 470 = 14.5 mA (LED + resistenza + Vce_sat)
- Vce_sat ≈ 0.2 V quando saturo
- P_BJT = 0.2 × 0.0145 = **2.9 mW** ✅ ben sotto 625 mW

Vs. lo stesso BJT in zona lineare (R_b sbagliata, beta = 50, Ib = 100 µA):
- Ic = 50 × 0.0001 = 5 mA (limitato da beta, NON saturato)
- Vce = 9 - 2 - (0.005 × 470) = 4.65 V
- P_BJT = 4.65 × 0.005 = **23 mW** (ancora OK ma con resistenza pesante)

## Errori comuni

1. **R_b mancante** — Senza resistenza di base, la giunzione B-E è un diodo: la corrente da Arduino arriva con limite solo dal pin (~40 mA max). La base si brucia + il pin Arduino può danneggiarsi.

2. **Confondere base / collettore / emettitore** — BC547 pinout TO-92 con piatto verso voi: **C-B-E** da sinistra a destra. Invertire base ed emettitore può funzionare (pseudo-amplificatore inverso, beta basso) ma a regime caldo brucia.

3. **PNP vs NPN** — BC547 è NPN: corrente entra dal collettore. BC557 è PNP: corrente esce dal collettore. Schema diverso. Vol. 2 pag. 142 usa SOLO NPN per gli switch.

4. **Carico induttivo (motore, relè) senza diodo flyback** — Quando il BJT spegne il motore, la bobina genera picco di tensione inverso che brucia il transistor. Aggiungere diodo 1N4148 in antiparallelo al carico.

5. **Touch test sbagliato** — Toccare un BJT >70°C può scottare le dita. Usare termometro IR o test "vicinanza" (mano a 1 cm) prima del touch diretto.

## Esperimenti correlati

- **Vol. 2 pag. 138** — Primo BJT come switch: pilotare LED 9V da pin 5V Arduino
- **Vol. 2 pag. 142** — Capitolo sicurezza: misurare temperatura BJT con e senza R_b
- **Vol. 2 pag. 148** — Pilotare motore DC con BJT + diodo flyback (sicurezza induttivi)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 2 pag. 142):
> "Se il transistor scotta, qualcosa non va. Va spento subito."

**Cosa fare:**
- Mostrate empiricamente: montate il circuito BJT senza R_b base (rischio basso, pin Arduino tollera 40 mA brevemente). Toccate il BJT → caldo immediato. Aggiungete R_b 4.7kΩ → freddo. Lezione visiva
- Vol. 2 pag. 142 raccomanda termometro IR economico per misurare temperatura precise (€10 su Amazon)
- Spiegate la formula P = Vce × Ic con esempi numerici concreti, non teoria astratta
- "5 secondi col dito" come regola pratica memorabile (Vol. 2 esplicita)

**Sicurezza:**
- BJT a 100 °C non è solo pericoloso per il transistor stesso: può fondere isolamento jumper wire vicini, bruciare breadboard plastica, ustionare le dita
- Spegnere SEMPRE prima di toccare per debug. Mai infilare jumper wire mentre l'alimentazione è collegata (rischio cortocircuito accidentale)
- Per progetti domestici prolungati, derate Pd al 50% del max (es. 300 mW per BC547 invece di 625 mW)

**Cosa NON fare:**
- Non usate BJT come amplificatore lineare con segnali stabili → dissipa molto. Usare op-amp dedicato
- Non aggiungete dissipatore al BC547 (pacchetto TO-92 piccolo): il calore si trasferisce male. Se serve dissipare, scegliere TO-220 (BD135) o MOSFET

## Link L1 (raw RAG queries)

- `"BJT surriscaldamento R_b base"`
- `"transistor scotta sicurezza"`
- `"calcolo Pd BJT Vce Ic"`
- `"BC547 thermal limit 625 mW"`
- `"thermal runaway BJT carico induttivo"`
