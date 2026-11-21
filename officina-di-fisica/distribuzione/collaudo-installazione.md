# Collaudo della distribuzione 1.0.0

Il 21 novembre 2026 lo ZIP di questa directory è stato estratto con l’utility di sistema macOS 15.6 e avviato con Python 3.15.2, in una directory temporanea su una porta dedicata. Il test ha chiuso soltanto i propri processi e ha ricontrollato l’integrità dell’archivio a fine prova. Il quaderno nasce senza ordini o studenti e conserva l’autore tecnico necessario all’avvio del banco.

```text
Pacchetto aperto su una copia isolata.
OK   Sorgenti ed eseguibilità — 790 record, 135 SVG richiamati, 6 corsi, 5 laboratori e 3 prove da 31
OK   Collegamenti Markdown relativi — 85 destinazioni esistenti, 2 con spazi codificati
OK   Integrità dei materiali PDF — 13 PDF leggibili, 411 pagine con il piè di pagina richiesto
OK   Primo avvio con l’area autore — 790 schede pubblicate, solo autore tecnico, zero attività o ordini
OK   Sessione autore e riuso dei materiali — 790 record nell’editor e 691 identificatori nel percorso completo
OK   Fascicoli distribuiti via HTTP — 13 download autenticati identici ai fascicoli distribuiti
OK   Lanciatori e collegamenti autore — entrambi i comandi da fermo e a servizio attivo, due ticket distinti e monouso
OK   Arresto e riservatezza — processi di prova arrestati e nessuna chiave o cookie nei log dei comandi
OK   Integrità della copia dopo l’avvio
OK   Rimozione dei dati temporanei
SHA-256 ZIP 9bf5a584603e7797926306dd109d5f918b3d94bcb16a6d8140207014e2877ca9
```

Il bundle è stato clonato in una directory vuota con `git clone`. La copia ha aperto il branch `main`, commit `e139d5307e15fcb410eb460f37c287ac1649cc61`, con il tag `v1.0.0`. Dal clone sono stati ripetuti il controllo dei 790 record, la composizione di 719 formule e i sette test JavaScript dei modelli e della lettura per passaggi.

[Script riproducibile](../tests/installazione_mac.py) · [Verbale scientifico e funzionale](../docs/collaudo.md) · [Riscontri sulla stampa](../docs/verifica-pdf.md) · [Impronte dei file](SHA256SUMS)

Le licenze SIL di Baskervville e Work Sans corrispondono byte per byte ai file distribuiti da Google Fonts. Entrambi gli originali hanno uno spazio a fine riga nella riga 21. Il controllo degli spazi ha verificato separatamente i file prodotti per l’Officina e l’identità binaria di questi due avvisi. [Baskervville](https://raw.githubusercontent.com/google/fonts/main/ofl/baskervville/OFL.txt) · [Work Sans](https://raw.githubusercontent.com/google/fonts/main/ofl/worksans/OFL.txt)
