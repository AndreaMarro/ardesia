# Tre modi di studiare fisica

**Dossier di progettazione 1.0 · 23 novembre 2026**

Materiale per la scelta di prodotto di Andrea Marro. La baseline è Officina di Fisica 1.1.0, pubblicata con la PR #339. I prototipi in questa cartella lavorano su uno stesso caso e su dati locali della demo. [Versione esaminata](https://github.com/AndreaMarro/ardesia/releases/tag/officina-di-fisica-v1.1.0)

**Prova i tre concept.** Scarica lo ZIP, estrai `confronto.html` e aprilo nel browser. Puoi usare i pulsanti **Prova la sessione**, **Apri il banco** e **Apri il quaderno**. Il collegamento **Confronto** permette di passare da uno all’altro. Il file include interfaccia, grafici e caratteri e funziona offline. [Scarica i prototipi](prototipi-offline.zip?raw=true) · [HTML autonomo](confronto.html) · [Galleria desktop e mobile](verifica.md)

![Passo, Campo e Margine sullo stesso problema, nel rendering mobile](prove/tre-concept-mobile.webp)

| Direzione | Che cosa fa lo studente | Prova che la distingue |
| --- | --- | --- |
| **Passo** | Prevede dove si fermerà, chiede eventualmente un indizio e recupera l’errore. | Scegli «Più indietro» e osserva come si torna al significato dei due rettangoli. [Desktop](prove/passo-desktop.webp) |
| **Campo** | Cambia la durata del ritorno, fissa una previsione e controlla la posizione su pista, grafico e tabella. | A 5 s di ritorno finisce a +2 m. A 6 s torna alla partenza. Dopo la misura puoi aprire la pista in 3D e cambiare istante o vista. [Desktop](prove/campo-desktop.webp) |
| **Margine** | Scrive i contributi sul foglio o nei campi e rivede il primo passaggio incoerente. | Inserisci 12, 10 e 22 m. Il quaderno riporta il focus alla riga del ritorno. La scheda A4 reca l’ID e la revisione. [Desktop](prove/margine-desktop.webp) · [Scheda](prove/scheda-margine.pdf) |

### Raccomandazione

Sottoporre **Campo** alla prima prova con studenti. L’Officina ha già 181 laboratori. Nel test ospite di C1 «aree con segno» dà zero risultati e «grafici cinematici» ne dà uno. Rendere il fenomeno reperibile dal lessico e dall’errore dello studente è un’ipotesi concreta da verificare. Con i pesi dedicati al laboratorio, Campo ottiene **4,47/5**, Passo **4,39** e Margine **3,99**. Con i pesi dedicati al recupero vince Passo. Le voci didattiche e commerciali della matrice sono stime. [Matrice e sensibilità](decisione.md) · [Esiti della ricerca](prove/navigazione.json)

### Lettura del dossier

1. [Audit, product discovery e benchmark](scoperta.md) — percorsi reali, euristiche, jobs, alternative EdTech e AI-native.
2. [Tre sistemi di prodotto](sistemi-e-flussi.md) — architettura di marca, semantica dei token, componenti, compiti, stati e requisiti inclusivi.
3. [Modello didattico e multimodale](didattica-e-ai.md) — prerequisiti, evidenze, recupero, spaziatura, agenti editoriali e verificatori.
4. [Fattibilità e roadmap](fattibilita.md) — confini del monolite, contratti, impatto sul codice, rischi, unit economics e PR alternative.
5. [Decisione e protocollo con studenti](decisione.md) — criteri, soglie, pesi, controprove e condizioni per cambiare direzione.
6. [Collaudo e prove visive](verifica.md) — schermate misurate, Taste Skill, controlli WCAG automatici, riproduzione e limiti.

La scelta resta aperta. L’albero Git del prodotto coincide con quello della release. La consegna usa una PR di progettazione separata. Il test touch su un telefono fisico è rinviato secondo l’indicazione ricevuta.
