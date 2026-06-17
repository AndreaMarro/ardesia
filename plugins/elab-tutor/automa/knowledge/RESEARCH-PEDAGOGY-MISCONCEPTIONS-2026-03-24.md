# Ricerca: Misconcezioni Elettricità Bambini + Strategie Galileo

**Data**: 24/03/2026
**Tipo**: RESEARCH con conseguenze dirette per prompt Galileo
**Fonti**: IOP Spark, Physics Classroom, ERIC, PhysRev PER, Springer, PhET

## 9 Misconcezioni Universali (8-14 anni)

| # | Misconcezione | Lo studente dice... | Realtà |
|---|--------------|--------------------|----|
| M1 | Corrente si consuma | "La lampadina consuma la corrente" | Corrente uguale in tutto il circuito serie |
| M2 | Basta un filo | Collega solo un filo alla batteria | Serve circuito chiuso (loop) |
| M3 | Batteria = sorgente cariche | "La batteria manda fuori l'elettricità" | Batteria dà energia, non crea cariche |
| M4 | Correnti che si scontrano | "La corrente esce da entrambi i poli" | Corrente scorre in UNA direzione |
| M5 | Ragionamento sequenziale | "La lampadina vicina è più luminosa" | In serie: corrente uguale ovunque |
| M6 | Tensione = corrente | Usa i termini intercambiabilmente | Tensione = spinta, corrente = flusso |
| M7 | Parallelo = più debole | "Più lampadine = tutte più deboli" | In parallelo: ogni lampadina ha piena tensione |
| M8 | Corrente fino al gap | "La corrente va fino al punto rotto" | Circuito aperto = zero corrente ovunque |
| M9 | Elettroni veloci come luce | "Gli elettroni corrono nel filo" | Drift lentissimo, campo elettrico veloce |

## Protocollo Risposta Galileo (5 step)

1. **RILEVA** la misconcezione dalle parole/azioni
2. **RICONOSCI** cosa lo studente ha detto di giusto (MAI iniziare con "no, sbagliato")
3. **SONDA** con domanda che crea conflitto cognitivo
4. **SCAFFOLD** con hint → analogia → spiegazione (escalation solo se serve)
5. **VERIFICA** chiedendo di riformulare o applicare a nuovo scenario

## Tabella Risposte Concrete per Galileo

| Misconcezione | Domanda Socratica (IT) | Scaffold |
|---|---|---|
| M1: Corrente si consuma | "Se la lampadina 'mangiasse' la corrente, cosa mostrerebbe un misuratore prima e dopo?" | POE: amperometri nel simulatore — leggono uguale |
| M2: Un filo basta | "Prova con un filo solo. Si accende? Perché serve un percorso completo?" | Analogia: acqua in tubi a cerchio |
| M3: Batteria crea cariche | "Le cariche c'erano già nel filo prima della batteria?" | Analogia: pompa che spinge acqua già nei tubi |
| M4: Correnti si scontrano | "Se esce da entrambi i lati, in che direzione scorre in mezzo?" | Animazione flusso nel simulatore |
| M5: Sequenziale | "In serie con due lampadine uguali, quale è più luminosa? Osserva..." | Costruisci nel simulatore — brillano uguale |
| M6: V = I | "Cos'è che 'spinge' e cos'è che 'scorre'?" | Analogia: cascata (altezza=tensione, acqua=corrente) |
| M7: Parallelo debole | "Succede sempre? Prova ad aggiungere in parallelo..." | Osserva: ogni lampadina ha piena tensione |
| M8: Corrente fino al gap | "Un amperometro prima del punto rotto mostrerebbe corrente?" | Amperometro legge zero ovunque |

## Pattern POE (Predict-Observe-Explain)

Galileo DEVE seguire SEMPRE:
1. "Cosa pensi che succederà?" (previsione)
2. "Proviamo nel simulatore" (osservazione)
3. "Cosa hai osservato? È diverso da quello che pensavi?" (spiegazione)

Questo è il pattern del gioco "Prevedi e Spiega" già in ELAB.

## Gulpease per Bambini Italiani

| Target | Età | Gulpease richiesto |
|--------|-----|-------------------|
| Licenza elementare | 6-10 | ≥80 |
| Licenza media | 11-13 | ≥60 |
| Diploma | 14-18 | ≥40 |

**Target ELAB: ≥70** (copre fascia 8-14)
Regole: frasi ≤20 parole, parole ≤3 sillabe, paragrafi ≤3 frasi.

## Strategie Didattiche Evidence-Based

1. **POE** — conflitto cognitivo (Springer, Taylor & Francis)
2. **Concept Cartoons** — esternalizza misconcezioni senza giudicare
3. **Simulazioni** — PhET produce guadagni significativi vs istruzione tradizionale
4. **Serious Games** — riduzione significativa misconcezioni
5. **Mai dare risposta diretta** — metodo Socratico crea comprensione duratura

## AI Tutor: Findings Specifici

- Dialogo personalizzato sulle misconcezioni → correzioni significativamente migliori vs testo generico (N=375, ScienceDirect)
- Umano + AI → >90% correzione vs 65% risposte statiche (The 74)
- Se misconcezione persiste dopo 3 tentativi → flag per insegnante umano
- Correzione singola non basta — rivisitare in esercizi successivi

## Task YAML Generati

- P1: Aggiungere 9 misconcezioni + risposte Socratiche nel system prompt tutor specialist
- P1: Implementare pattern POE nel flusso conversazionale
- P2: Test con 9 domande che attivano misconcezioni, valutare risposta Galileo
- P2: Tracking misconcezioni per studente (rivedere in esercizi futuri)
- P2: Flag per insegnante se misconcezione persiste dopo 3 tentativi
