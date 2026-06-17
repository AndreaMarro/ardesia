---
id: capacitor
type: concept
title: "Capacitor (Condensatore)"
locale: it
volume_ref: 2
pagina_ref: 63
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-wiki-batch
tags: [condensatore, capacitor, farad, polarizzato, energia, filtro, carica-scarica]
---

## Definizione

Il condensatore — detto anche capacitore — è descritto nel Vol.2 pag.63 (Cap.7) come un componente che «funziona come una piccola batteria»: «capace di immagazzinare la tensione che gli viene applicata e liberare energia quando serve». L'unità di misura è il **Farad (F)**.

Esistono due famiglie principali (Vol.2 pag.63):

| Tipo | Polarità | Aspetto tipico |
|---|---|---|
| Non polarizzato (ceramico, film) | Indifferente | Dischetto giallo/marrone |
| Polarizzato (elettrolitico) | ＋ e − obbligatori | Cilindro con striscia bianca |

## Analogia per la classe

Ragazzi, avete mai staccato la spina di un dispositivo elettronico e visto qualche LED rimanere acceso per un attimo? Quel momento magico è spiegato nel Vol.2 pag.63: sono i condensatori che «tengono le cose accese fino a quando non si scaricano». Esattamente come le batterie, non possono tenere l'energia per sempre — ma la rilasciano subito quando serve, molto più in fretta di una batteria normale.

Immaginate un pallone da calcio che si gonfia: più aria ci soffiate dentro (tensione), più ne trattiene (carica). Quando lo bucate, l'aria esce tutta in un lampo — è la stessa cosa che fa il condensatore nel circuito.

## Cosa succede fisicamente

Un condensatore è formato da due **armature** conduttive separate da un materiale isolante (**dielettrico**). Quando si applica una tensione, cariche opposte si accumulano sulle due armature — il campo elettrico tra esse immagazzina energia.

**Formula fondamentale:**

```
Q = C × V
```

- `Q` = carica immagazzinata (Coulomb)
- `C` = capacità (Farad)
- `V` = tensione applicata (Volt)

**Costante di tempo RC** (quant'è veloce la carica/scarica):

```
τ = R × C      (tau, in secondi)
```

Un condensatore si considera completamente carico dopo ~5τ.

**Prefissi comuni (da Vol.2 pag.63 il Farad è grande — in pratica si usano sottomultipli):**

| Simbolo | Nome | Valore | Uso tipico |
|---|---|---|---|
| µF | microfarad | 10⁻⁶ F | Filtri alimentazione, serbatoi |
| nF | nanofarad | 10⁻⁹ F | Filtri audio, disaccoppiamento |
| pF | picofarad | 10⁻¹² F | Circuiti RF, oscillatori |

**Valori tipici nel kit ELAB:**

| Valore | Tipo | Esperimento tipico |
|---|---|---|
| 100 µF | Elettrolitico | Filtro alimentazione, buffer LED |
| 10 µF | Elettrolitico | Debounce RC, filtro bassa freq. |
| 100 nF (codice `104`) | Ceramico | Bypass alimentazione Arduino |
| 10 nF | Ceramico | Filtro antidisturbi segnale |

## Carica e scarica — curva esponenziale

Il condensatore non si carica istantaneamente: segue una **curva esponenziale**. Dopo 1τ è carico al 63%, dopo 5τ è praticamente al 100%.

```
Tensione durante la carica:   Vc(t) = V × (1 - e^(-t/τ))
Tensione durante la scarica:  Vc(t) = V × e^(-t/τ)
```

Questo comportamento è visibile con un LED + condensatore: il LED si spegne a poco a poco (scarica lenta) invece di spegnersi di colpo.

## Differenza fondamentale: polarizzato vs non polarizzato

**Elettrolitico (polarizzato):**
- La striscia bianca indica il piedino **negativo (−)**
- Il piedino più lungo è il **positivo (+)**
- Montarlo al contrario → si riscalda, può danneggiarsi, nei casi estremi esplode (gas interno)

**Ceramico (non polarizzato):**
- Nessuna indicazione di verso, va bene in entrambe le direzioni
- Approfondimento in `concepts/condensatore-ceramico.md`

## Esperimenti correlati

- **Vol.2 Cap.7** — Introduzione ai condensatori (primaria fonte, pag.63): polarizzati vs non polarizzati, carica e scarica
- **Filtro RC** — condensatore + resistenza per smorzare variazioni rapide di tensione (debounce → `concepts/debounce.md`)
- **PWM → tensione analogica** — filtro RC converte segnale PWM in tensione continua (`concepts/pwm.md`)
- Ogni esperimento con Arduino sul kit ELAB usa un ceramico 100 nF di bypass sulla scheda

## Errori comuni

1. **Invertire la polarità dell'elettrolitico** — la striscia bianca è il NEGATIVO. Molti principianti la leggono come "positivo" perché è vistosa. Conseguenza: il condensatore si scalda e può danneggiarsi o esplodere.
2. **Confondere µF con nF o pF** — 100 µF è 100.000 volte più grande di 100 nF. Controllare sempre il prefisso, non solo il numero.
3. **Leggere il codice `104` come 104 pF** — il codice a 3 cifre significa: prime 2 cifre + esponente base 10 in pF → `104` = 10 × 10⁴ pF = 100.000 pF = 100 nF.
4. **Usare il condensatore al posto della batteria** — il condensatore rilascia energia molto più in fretta e non si ricarica da solo tramite reazione chimica. Non è una batteria ricaricabile.
5. **Dimenticare di scaricarlo prima di toccare** — con tensioni di circuito (5–9 V kit ELAB) non è pericoloso, ma in circuiti professionali con tensioni alte può dare una scarica dolorosa.

## Domande tipiche degli studenti

**D: "Perché il LED rimane acceso per un po' quando stacco la batteria?"**
R: Esattamente come spiegato nel Vol.2 pag.63: il condensatore nel circuito aveva accumulato energia e la sta rilasciando piano piano per alimentare il LED fino a quando non si scarica.

**D: "Qual è la differenza tra condensatore e batteria?"**
R: Entrambi immagazzinano energia, ma la batteria lo fa tramite reazione chimica (lenta, molta energia) mentre il condensatore lo fa con un campo elettrico (velocissimo, poca energia). Un condensatore si carica in millisecondi, una batteria impiega ore.

**D: "Posso usare qualsiasi condensatore che trovo?"**
R: Controllate sempre due cose: la **capacità** (che sia il valore giusto per il circuito) e la **tensione di lavoro massima** (deve essere superiore alla tensione del circuito — se il kit usa 9 V, usate condensatori da almeno 16 V).

**D: "Come faccio a sapere se è rotto?"**
R: Con il multimetro in modalità resistenza vedrete la lettura salire velocemente verso infinito (si carica). Se rimane a 0 Ω è in cortocircuito; se non si muove affatto è aperto. In modalità capacità (se disponibile) mostra direttamente il valore in µF/nF.

## PRINCIPIO ZERO

Quando si introduce il condensatore alla classe — sempre partendo dal Vol.2 pag.63, Cap.7:

- **Plurale inclusivo** — «Ragazzi, oggi scopriamo un componente che si comporta come una piccola batteria…», «Guardate insieme la striscia sul cilindretto…», «Provate a costruire il circuito e osservate cosa succede al LED quando staccate l'alimentazione».
- **Sicurezza kit ELAB**: a 5–9 V il condensatore è completamente sicuro. Il LED che si spegne lentamente dopo aver staccato la batteria è un esperimento visivo perfetto e non presenta nessun rischio.
- **Narrativa suggerita** (parole vicine al libro): «Come spiega il Capitolo 7, i condensatori tengono le cose accese fino a quando non si scaricano — esattamente come una piccola batteria di riserva. Non durano per sempre, ma ci danno quel momento in più che a volte serve.»
- **Cosa mostrare sulla LIM**: i due tipi fisici (elettrolitico cilindro + ceramico dischetto), la striscia bianca del negativo, il circuito RC con LED che si spegne a poco a poco.
- **Collegamento morfismo**: il condensatore nel simulatore ELAB ha l'aspetto identico al componente del kit fisico (striscia bianca = negativo, piedino lungo = positivo per l'elettrolitico), così i ragazzi riconoscono subito cosa stanno costruendo sulla breadboard.
- **NO sostituire il kit con il simulatore** — il condensatore che si scarica lentamente è un'esperienza sensoriale (il LED che svanisce) che il simulatore mostra ma che il kit fisico fa *sentire* davvero.

## Link L1 (query RAG suggerite)

```
condensatore piccola batteria immagazzinare energia
farad microfarad unità di misura condensatore
condensatore polarizzato non polarizzato differenza
elettrolitico striscia negativo piedino lungo positivo
costante di tempo RC carica scarica
LED rimane acceso dopo staccare batteria condensatore
filtro condensatore resistenza circuito
condensatore Vol.2 Capitolo 7
```
