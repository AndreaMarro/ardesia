---
id: corrente-alternata
type: concept
title: "Corrente alternata (AC)"
locale: it
volume_ref: 1
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [corrente-alternata, AC, DC, tensione, frequenza, sicurezza, rete-elettrica, fondamenti]
---

## Definizione

La corrente alternata (in inglese AC, *Alternating Current*) è una corrente elettrica che **inverte periodicamente la propria direzione**: gli elettroni oscillano avanti e indietro invece di scorrere sempre nello stesso verso. Vol. 1 la introduce come contesto della rete elettrica domestica per spiegare perché nei kit ELAB si usano batterie a corrente continua (DC) — sicure per bambini e ragazzi.

## Analogia per la classe

Ragazzi, immaginate le onde del mare. Quando arriva l'onda, l'acqua si sposta verso riva — poi rifluisce verso il largo. Avanti e indietro, ritmicamente, 50 volte al secondo. Questa è la corrente alternata della presa di casa. La corrente delle nostre batterie invece è come il flusso di un fiume di montagna: l'acqua va sempre e solo in una direzione, da monte a valle, senza mai tornare indietro. Nel kit ELAB usiamo *sempre* la corrente del fiume (DC) — sicura, stabile e controllata.

## Cosa succede fisicamente

La corrente alternata oscilla seguendo una **forma d'onda sinusoidale** — una curva a S che sale, scende, torna a zero, scende sotto zero, e ripete:

```
V(t) = V_picco × sin(2π × f × t)
```

dove `f` è la frequenza in Hertz (Hz) e `t` è il tempo in secondi.

### Rete elettrica in Italia

| Parametro          | Valore                              |
|--------------------|-------------------------------------|
| Tensione nominale  | 230 V (RMS / valore efficace)       |
| Frequenza          | 50 Hz (50 inversioni al secondo)    |
| Tensione di picco  | ≈ 325 V (= 230 × √2)               |
| Periodo            | 20 ms (= 1 / 50 Hz)                 |

> **V_RMS** (Root Mean Square, valore efficace) è la tensione "utile" che si legge con il multimetro in modalità AC. Vale:
> ```
> V_RMS = V_picco / √2 ≈ V_picco × 0.707
> ```
> Quindi i 230 V che vediamo sulle prese sono il valore efficace: il picco reale arriva a ~325 V.

### Confronto AC vs DC

| Caratteristica      | AC (rete domestica)    | DC (batteria 9V ELAB)   |
|---------------------|------------------------|--------------------------|
| Direzione corrente  | Inverte (± alternato)  | Costante (→ un verso)    |
| Tensione tipica     | 230 V                  | 9 V                      |
| Frequenza           | 50 Hz                  | 0 Hz (corrente continua) |
| Forma d'onda        | Sinusoidale            | Piatta (costante)        |
| Pericolo per i ragazzi | LETALE (50–100 mA stop cuore) | Sicuro (formicolio lieve) |
| Uso in ELAB         | Mai direttamente       | Sempre                   |

## Esperimenti correlati

- **Vol. 1 — Introduzione all'elettricità**: la differenza AC/DC è presentata come motivazione per l'uso delle batterie nei kit; AC rimane sempre un concetto teorico/contestuale
- **Tutti gli esperimenti Vol. 1-3**: usano esclusivamente corrente continua (DC) — batteria 9 V oppure pin Arduino 5 V / 3.3 V
- **Concetto trasformatore (Vol. 3 avanzato)**: un trasformatore abbassa la tensione AC; poi un raddrizzatore la converte in DC — questo è ciò che fa ogni caricatore USB

## Errori comuni

1. **Confondere Hz con Volt**: "50 Hz = 50 V" è sbagliato. Hz è la frequenza (quante volte al secondo la corrente inverte), V è la tensione (la "forza"). Sono grandezze completamente diverse con unità diverse.
2. **Credere che 230 V sia il valore di picco**: 230 V è il valore efficace (RMS); il picco reale è ~325 V — ancora più pericoloso di quanto sembri a prima vista.
3. **Pensare che il LED funzioni uguale su AC**: il LED è un diodo, lascia passare corrente solo in un verso. Su AC a 50 Hz si accende e spegne 50 volte al secondo — invisibile all'occhio umano ma il LED riceve solo metà dell'energia e lavora in modo anomalo; a 230 V si brucia istantaneamente.
4. **Confondere "corrente che inverte" con "tensione che va a zero"**: nella sinusoide la tensione attraversa lo zero due volte per ciclo, ma la corrente scorre comunque (in verso opposto); non è un circuito aperto.
5. **Credere di poter alimentare il circuito ELAB direttamente dalla presa**: 230 V AC distruggerebbe ogni componente del kit e potrebbe essere letale. Si usa sempre un alimentatore (adattatore/caricatore) che trasforma in DC sicura.

## Domande tipiche degli studenti

**"Perché non usiamo la corrente della presa? Sarebbe più comoda."**
La presa di casa fornisce 230 V AC — abbastanza per fermare il cuore di un adulto con soli 50-100 mA. Le batterie da 9 V DC del kit sono sicure: anche a contatto diretto con la pelle, al massimo sentite un formicolio lieve. La regola fondamentale è: mai toccare prese o cavi della rete senza un adulto esperto presente.

**"Cos'è la frequenza 50 Hz? Perché proprio 50?"**
50 Hz vuol dire che la corrente inverte direzione 50 volte ogni secondo — cambia così in fretta che non si vede nemmeno. Il valore 50 Hz è una scelta storica europea: gli USA usano 60 Hz. La frequenza dipende dalla velocità a cui girano i generatori nelle centrali elettriche, che a sua volta dipende da scelte ingegneristiche fatte più di 100 anni fa.

**"Come fa Arduino a funzionare con il cavo USB se in casa abbiamo AC?"**
Il caricatore USB (o la porta USB del computer) contiene un piccolo trasformatore + raddrizzatore che converte 230 V AC in 5 V DC. Quello che arriva ad Arduino tramite il cavo USB è già corrente continua sicura. Arduino non "vede" mai la rete domestica.

**"Perché la corrente inverte direzione? Chi la obbliga?"**
Nei generatori elettrici delle centrali, un magnete ruota vicino a bobine di rame. Quando il magnete gira, spinge gli elettroni prima in un verso, poi nell'altro — come una pompa che aspira e poi spinge ritmicamente. L'alternanza è una conseguenza diretta del modo in cui viene prodotta l'elettricità.

## PRINCIPIO ZERO

### Sicurezza

**La corrente alternata a 230 V è potenzialmente letale.** Una corrente di soli 50–100 mA attraverso il torace può causare fibrillazione ventricolare. La presa domestica eroga abbondantemente quella quantità. Soglia di pericolo percettibile: già da 1 mA si sente scossa; da 10 mA il muscolo si contrae involontariamente; da 50 mA rischio vita.

Nel contesto ELAB:
- I ragazzi non toccano **mai** la rete elettrica — né prese, né cavi, né adattatori aperti
- Tutte le attività usano batterie 9 V DC o alimentazione USB 5 V DC
- Se qualcuno chiede "posso collegare il circuito alla presa?" la risposta è **no, categoricamente, sempre**
- Il kit ELAB è progettato esattamente per questo: permettere di sperimentare con l'elettricità in totale sicurezza

### Narrativa per il docente

La corrente alternata si insegna come *contesto* per motivare le scelte di sicurezza del kit — non come argomento pratico da sperimentare. L'obiettivo è che i ragazzi capiscano *perché* usiamo le batterie, non che sappiano calcolare la tensione RMS.

Usate questa sequenza narrativa:

> *"Da dove viene la corrente in casa vostra?"* → dalla presa → AC 230 V  
> *"È sicura da toccare?"* → no, è pericolosa  
> *"Allora perché le nostre batterie sì?"* → 9 V DC è la versione sicura, 25 volte meno tesa  
> *"Chi trasforma la corrente della presa in qualcosa di sicuro?"* → il caricatore / alimentatore

Questo costruisce il concetto di **sicurezza elettrica** che i ragazzi porteranno per tutta la vita — molto più utile di qualsiasi formula.

### Cosa dire ai ragazzi (cita il Volume)

Dal Vol. 1 (introduzione all'elettricità):

> *"Nei kit ELAB usiamo sempre la batteria da 9 V — è sicura, non fa male e vi permette di sperimentare liberamente."*

Poi aggiungete: *"Vediamo insieme la differenza tra la corrente che usiamo noi e quella che c'è nella presa di casa. La nostra è il fiume calmo, quella della presa è un torrente in piena — rispettosa ma da tenere a distanza."*

### Connessione con altri concetti

Insegnate sempre questo concetto in coppia con `corrente.md` (cos'è la corrente in generale) e `tensione.md` (perché 9 V vs 230 V fa tutta la differenza). Richiamate anche `polarita.md` per spiegare perché nei circuiti DC il verso dei collegamenti conta.

## Link L1 (raw RAG queries)

- Query `"corrente alternata"` in `src/data/rag-chunks.json` → chunk introduzione elettricità Vol. 1
- Query `"AC DC differenza corrente"` → chunk teoria base corrente continua/alternata
- Query `"batteria sicura presa pericolosa"` → chunk sicurezza elettrica Vol. 1
- Query `"rete elettrica 230V frequenza"` → chunk contesto rete domestica
- Query `"frequenza 50 Hz corrente"` → chunk teoria corrente alternata
- Query `"corrente continua batteria 9V"` → chunk DC introduzione + esperimenti Vol. 1
