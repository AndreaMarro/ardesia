---
id: zener-fail
type: concept
title: "Zener bruciato — modi di guasto e diagnosi"
locale: it
volume_ref: 2
pagina_ref: 112
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [zener, diodo, fail, guasto, diagnosi, sicurezza, vol2]
---

## Definizione

Uno zener guasto può fallire in due modi opposti, entrambi pericolosi per il circuito a valle. Vol. 2 pag. 112 affronta la diagnostica: "uno zener bruciato non sempre si vede esternamente — il multimetro è l'unico modo affidabile".

I due modi di guasto:
1. **Cortocircuito** (più comune): zener conduce in entrambi i versi → tensione ai capi ≈ 0 V → carico riceve tutta la Vin via R serie
2. **Circuito aperto** (raro): zener non conduce nemmeno in inverso → carico riceve tutta la Vin senza limite

## Sintomi visibili

| Modo | Sintomo visivo | Effetto sul carico |
|------|----------------|--------------------|
| Cortocircuito | corpo annerito o spaccato (raro), R serie scotta | carico riceve sovratensione (tutta la Vin via R) |
| Aperto | nessuno (sembra normale) | carico riceve tutta la Vin senza limitazione |
| Drift Vz | corpo intatto, multimetro mostra Vz fuori specifica | carico riceve tensione sbagliata |

## Cause comuni

1. **Surriscaldamento** — Pd > Pd_max sustained. Zener da ½ W con 700 mW di lavoro continuo si brucia in minuti. Vol. 2 pag. 112 esempio: 5V1 zener con 200 mA inversi → 1.02 W → ben oltre limite.

2. **R serie troppo piccola** — Vin = 12V, Vz = 5V, R = 100Ω → Iz = (12-5)/100 = 70 mA. Pd = 5 × 0.07 = 350 mW. Per zener da 250 mW = guasto rapido.

3. **Inversione polarità + Vin > Vbreakdown_dir** — Polarizzato direttamente, lo zener è solo un diodo (Vd ≈ 0.7 V). Se Vin > 100V (rara), l'eccessiva corrente diretta lo distrugge come un normale diodo.

4. **Picco di tensione transient** — Sovratensione momentanea (es. apertura di carico induttivo) supera Vz e Pd istantanea molto alta → giunzione fonde.

5. **Hot-plug power supply** — Collegare batteria con zener già montato + Vin che oscilla → spike di corrente iniziali → guasto progressivo cortocircuito.

## Diagnostica con multimetro

**Test 1 — modalità diodo**:
```
Sonda rossa (+) su anodo, nera (−) su catodo:
- Zener sano: legge ~0.7 V (giunzione diretta normale)
- Zener cortocircuito: legge ~0 V (passa tutto in entrambi i versi)
- Zener aperto: legge "OL" / open circuit
```

**Test 2 — modalità diodo invertita**:
```
Sonda rossa (+) su catodo, nera (−) su anodo:
- Zener sano: legge "OL" (giunzione inversa blocca con multimetro che usa solo ~3V)
- Zener cortocircuito: legge ~0 V (cortocircuito conferma test 1)
- Zener aperto: legge "OL" (stesso del sano in questo verso, ma test 1 distingue)
```

**Test 3 — verifica Vz under load** (avanzato):
```
Montare schema regolatore con R serie protetta:
   Vin (15V) ──[1 kΩ]──┬── multimetro
                       │
                     ZENER
                       │
                      GND

Sano: multimetro legge Vz nominale (es. 5.1 V)
Drift: legge tensione diversa (es. 4.7 V o 5.5 V)
Cortocircuito: legge ~0 V
Aperto: legge ~Vin (15V) — DANGER per il carico !!
```

## Effetti del guasto sul circuito

**Caso 1 — zener cortocircuito (più comune):**
- Vout = 0 V (carico spento)
- R serie scotta (tutta la Vin cade su R, dissipa Vin² / R)
- Spesso R serie brucia subito dopo → circuito open + sicurezza

**Caso 2 — zener aperto (raro ma pericoloso):**
- Vout = Vin senza limite
- Carico riceve sovratensione → microcontroller a 5V riceve 12V → distrutto
- **No fusibile a valle = danno cascata**: zener → micro → LED → ...

**Vol. 2 pag. 112 raccomanda**: progettare con fusibile o auto-restoring fuse (PolySwitch) tra zener e carico per protezione cascata.

## Errori comuni

1. **Diagnosticare solo guardando** — Zener bruciato spesso è esternamente intatto. Multimetro obbligatorio.

2. **Sostituire zener identico senza analizzare causa** — Se R serie era sotto-dimensionata, il nuovo zener brucerà di nuovo. Calcolare Pd reale prima di sostituire.

3. **Confondere zener cortocircuitato con normalmente saturato** — Un BJT saturato ha Vce ~0.2V (è normale). Uno zener "cortocircuito" ha 0V (anomalo). Differenza di contesto.

4. **Misurare Vz con multimetro modalità "diodo" su zener installato** — Modalità diodo esce ~3V, non basta per polarizzare zener a Vz. Va estratto + alimentato esternamente per misura accurata.

5. **Riassemblare circuito senza ripulire pasta termica/breadboard** — Se la prima volta lo zener si è bruciato fondendosi sulla breadboard, residui plastici fusi possono creare cortocircuiti permanenti tra fori vicini.

## Esperimenti correlati

- **Vol. 2 pag. 105** — Introduzione zener (vedi `zener.md`)
- **Vol. 2 pag. 108** — Stabilizzatore zener corretto
- **Vol. 2 pag. 112** — Diagnostica guasti + sicurezza cascata
- **Vol. 2 pag. 115** — Sostituzione corretta + auto-restoring fuse

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 2 pag. 112):
> "Uno zener bruciato non sempre si vede esternamente — il multimetro è l'unico modo affidabile per saperlo."

**Cosa fare:**
- Mostrate uno zener intenzionalmente bruciato (R serie troppo piccola → 30 secondi alimentato → cortocircuito permanente). Ragazzi vedono che esternamente sembra normale ma il circuito non funziona più
- Insegnate i 2 test multimetro come check-list standard prima di sostituire un componente sospetto
- Vol. 2 pag. 112 raccomanda di tenere SEMPRE 5-10 zener di scorta per sostituzione rapida durante esperimenti
- Spiegate il "guasto a cascata": uno zener aperto può distruggere micro/LED/sensori a valle. Importanza del fusibile

**Sicurezza:**
- **Mai sostituire zener senza alimentazione SCOLLEGATA**: rischio cortocircuito accidentale + scintilla
- Dopo guasto sospetto: misurare R serie con multimetro Ω. Se R serie è bruciata → circuito open + zener integro probabile. Se R serie buona → zener probabilmente cortocircuito
- Verificare che pinout dello zener nuovo sia identico (catodo verso +). Inversione polarità → guasto immediato

**Cosa NON fare:**
- Non sostituire zener "a occhio" senza verificare con multimetro
- Non rimettere zener bruciato pensando "magari era solo intermittente" — risulta spesso cortocircuito permanente
- Non usate zener vecchi o sconosciuti (componenti decasualizzati): tolleranza Vz può essere >50% fuori spec → carico danneggiato

## Link L1 (raw RAG queries)

- `"zener bruciato cortocircuito"`
- `"diagnosi zener multimetro modalità diodo"`
- `"R serie zener calcolo dissipazione"`
- `"guasto cascata zener microcontroller"`
- `"PolySwitch fusibile auto-restoring"`
