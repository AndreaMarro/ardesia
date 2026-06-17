---
id: motor-dc
type: concept
title: "Motore DC — come funziona e come usarlo con Arduino"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: claude-sonnet-4-6
tags: [motore-dc, attuatore, rotazione, h-bridge, pwm, corrente, induttanza, back-emf]
---

## Definizione

Un **motore DC** (Direct Current) è un componente elettromeccanico che trasforma energia elettrica in **movimento rotatorio continuo**. Ha due soli terminali: quando scorre corrente continua attraverso le sue bobine interne, l'asse (albero) gira. Invertire i due fili = invertire il senso di rotazione.

*(Nota fonte: nessun match diretto nei volumi ELAB per questo concetto — contenuto basato su conoscenza generale. Per il riferimento stub originale vedi `motore-dc.md`.)*

## Analogia per la classe

Ragazzi, pensate a un frullatore: premete ON, la corrente fa girare le lame. Il motore DC funziona esattamente così — corrente entra, asse gira. Invertite i cavi? L'asse gira al contrario, come un frullatore in retromarcia! La velocità del frullatore dipende da quanto "energia" gli date: col PWM potete fare la stessa cosa con il motore, da lentissimo a tutto gas.

## Cosa succede fisicamente

Dentro ogni motore DC ci sono tre parti principali:

- **Statore**: magneti permanenti fissi → creano un campo magnetico statico
- **Rotore / armatura**: bobine di filo conduttore che girano nell'asse
- **Spazzole + collettore**: contatti striscianti che portano corrente alle bobine in rotazione

**Il principio**: corrente scorre nelle bobine → forza di Lorentz (interazione tra campo bobina e magneti) → il rotore gira. Più corrente = più coppia (forza). Più tensione = più velocità.

### Parametri chiave

| Parametro | Valore tipico kit ELAB | Note |
|-----------|------------------------|------|
| Tensione nominale | 5 – 9 V | Motori kit: spesso 6 V |
| Corrente a vuoto | 50 – 150 mA | Asse senza carico |
| Corrente di stallo | 500 mA – 2 A | Asse bloccato = corrente massima! |
| Velocità | 100 – 300 RPM | Dipende da V + carico |
| Back-EMF | ≈ k × RPM | Tensione inversa generata dal motore |

**Perché non si può collegare diretto ad Arduino**: un pin digitale Arduino fornisce **max 40 mA**. Un motore DC ne richiede 200–500 mA. Collegare senza driver brucia il pin o il chip ATmega328p. Serve sempre un **driver** (transistor NPN, MOSFET, oppure il modulo L298N — vedi `motor-driver-l298n.md`).

### Controllo velocità con PWM

Il segnale PWM (Pulse Width Modulation) regola la tensione media sulle bobine del motore:

```
Duty cycle 25%  → tensione eff. ~1.5 V  → motore lento
Duty cycle 75%  → tensione eff. ~4.5 V  → motore veloce
Duty cycle 100% → tensione eff. 6 V     → massima velocità
```

## Codice Arduino base (con driver L298N)

```cpp
const int ENA = 9;   // PWM velocità (pin PWM ~)
const int IN1 = 7;   // direzione A
const int IN2 = 8;   // direzione B

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void avanti(int vel) {         // vel: 0-255
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, vel);
}

void indietro(int vel) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, vel);
}

void fermati() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
}

void loop() {
  avanti(200);    delay(2000);   // 2 s avanti, velocità 200/255
  fermati();      delay(500);    // pausa breve
  indietro(150);  delay(2000);   // 2 s indietro, velocità ridotta
  fermati();      delay(1000);
}
```

### Tabella controllo direzione (L298N)

| IN1 | IN2 | Motore |
|-----|-----|--------|
| LOW | LOW | STOP (ruota libera) |
| HIGH | LOW | Avanti |
| LOW | HIGH | Indietro |
| HIGH | HIGH | FRENO (brake hard) |

**ENA**: `analogWrite(ENA, 0–255)` controlla la velocità.

## Esperimenti correlati

- **Motore DC avanti/indietro** — primo avvio con driver transistor o L298N (area Vol. 2, capitolo attuatori)
- **Velocità variabile PWM** — `analogWrite` + potenziometro per regolare velocità in tempo reale
- **RC car** — robot/macchina controllata via Bluetooth HC-05 (2 motori DC + L298N) — vedi `motor-driver-l298n.md`
- **Robot evita-ostacoli** — motori + sensore HC-SR04 per rilevare ostacoli e cambiare direzione automaticamente

## Errori comuni

1. **Collegare il motore direttamente al pin Arduino** — Pin Arduino max 40 mA, motore ne chiede 10× tanto. Risultato: pin bruciato o reset ATmega328p. **Soluzione**: sempre un driver (L298N, transistor NPN + diodo, MOSFET).

2. **Dimenticare il diodo flyback** — Motore = carico induttivo. Allo spegnimento genera un picco di tensione inversa (back-EMF, fino a 50 V) che danneggia transistor o Arduino. **Soluzione**: diodo 1N4007 in parallelo al motore (catodo su +, anodo su GND). L298N ha diodi interni, ma per carichi > 1 A aggiungere diodi schottky esterni.

3. **GND non comune tra Arduino e alimentazione motore** — La batteria del motore (9–12 V) deve condividere il GND con Arduino. Senza GND comune i segnali logici su IN1/IN2 fluttuano → comportamento imprevedibile.

4. **Cambiare direzione senza pausa** — Passare da avanti a indietro istantaneamente genera un picco di corrente che può resettare Arduino o danneggiare il driver. **Soluzione**: `fermati()` + `delay(100)` tra ogni cambio di direzione.

5. **Motore in stallo** — Asse meccanicamente bloccato → corrente di stallo (1–2 A) → driver e motore si scaldano rapidamente. **Soluzione**: verificate che l'asse ruoti liberamente prima di alimentare. Aggiungete un controllo corrente se il carico è variabile.

## Domande tipiche degli studenti

**"Perché il motore non parte?"**
→ Controllate: tensione alimentazione corretta? ENA in HIGH o `analogWrite > 50`? IN1 e IN2 in stati OPPOSTI (non entrambi LOW)?

**"Come lo faccio girare più piano?"**
→ `analogWrite(ENA, valore)` con valore tra 0 e 255. Circa 80–100 è lento, 200–255 è veloce. Valori sotto 60 potrebbero non avere abbastanza forza per far partire il motore.

**"Posso usare 2 motori insieme?"**
→ Sì! L298N ha 2 canali indipendenti. Motore A su OUT1/OUT2 controllato da IN1/IN2/ENA, motore B su OUT3/OUT4 controllato da IN3/IN4/ENB.

**"Perché il motore si scalda?"**
→ È normale durante l'uso prolungato: l'energia elettrica si converte in movimento + calore (resistenza delle bobine). Se si scalda molto in pochi secondi o fuma, verificate che l'asse non sia bloccato o che la corrente non superi i limiti del driver.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (linguaggio inclusivo, plurale obbligatorio):

> "Ragazzi, questo componente trasforma la corrente in movimento — è il muscolo della nostra macchina. Ogni volta che vedete una ruota che gira, un ventilatore, un robot che cammina, c'è quasi sempre un motore DC dentro."

**Sequenza didattica consigliata:**

1. Mostrate il motore da solo: toccate i due fili alla batteria → l'asse gira. Invertite i fili → gira al contrario. Effetto visivo immediato, nessun codice richiesto.
2. Mostrate il problema: tentate di collegare il motore direttamente a un pin Arduino (simulate o spiegate) → introduce il concetto di **driver come intermediario di potenza**.
3. Usate il simulatore ELAB per vedere il circuito L298N + motore prima di montarlo sul kit fisico.
4. Il kit fisico è PROTAGONISTA: costruite sulla breadboard, verificate che il motore giri, aggiungete il controllo PWM con `analogWrite`.

**Sicurezza:**
- Motori in stallo (asse bloccato) assorbono corrente elevata e si scaldano rapidamente → spegnere subito, verificare meccanica.
- Mai toccare l'asse in rotazione durante gli esperimenti.
- Se il driver o il motore diventano molto caldi, spegnere l'alimentazione e verificare le connessioni.
- Verificare sempre la polarità dell'alimentazione esterna: inversione può danneggiare il driver.

**Cosa NON fare:**
- Non collegare il motore direttamente ai pin Arduino senza driver.
- Non insegnare il motore DC prima di aver spiegato `analogWrite` PWM e il concetto di driver.
- Non cambiare direzione bruscamente senza `fermati()` + pausa breve.

## Link L1 (raw RAG queries)

- `"motore DC Arduino controllo direzione"`
- `"back-EMF diodo flyback motore induttivo"`
- `"L298N H-bridge bidirezionale velocità PWM"`
- `"stallo motore corrente massima Arduino"`
- `"GND comune alimentazione esterna motore Arduino"`
