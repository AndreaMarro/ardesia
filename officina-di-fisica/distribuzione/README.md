# Scaricare la sola Officina

**Officina di Fisica 1.0.0** contiene i sei percorsi di Andrea Marro per il semestre aperto 2026/27. Il branch di Ardesia si chiama `officina-di-fisica`, la directory del prodotto porta lo stesso nome e il tag di questa edizione è `officina-di-fisica-v1.0.0`.

## Per studiare o modificare un corso

Apri il collegamento allo ZIP e scegli **Download raw file**. Estrai la cartella e apri **Avvia Officina.command** su Mac. Per il banco riservato usa **Area autore.command**. Da terminale puoi avviare l’app con `python3 app.py serve --open` dalla cartella estratta. La prima esecuzione crea un archivio locale privato. [ZIP della sola Officina](Officina-di-Fisica-1.0.0.zip) · [Manuale](../README.md) · [Guida all’area autore](../docs/guida-autore.md)

## Per avere il repository autonomo

Il bundle contiene il ramo `main` e il tag `v1.0.0` del repository del prodotto. Il rispettivo commit è `e139d5307e15fcb410eb460f37c287ac1649cc61`. Il commit del ramo Ardesia è identificato dal tag con il prefisso `officina-di-fisica-`. [Bundle Git](Officina-di-Fisica-1.0.0.bundle)

```sh
git clone Officina-di-Fisica-1.0.0.bundle Officina-di-Fisica
cd Officina-di-Fisica
git describe --exact-match --tags HEAD
python3 app.py serve --open
```

Per confrontare i byte ricevuti su Mac, salva nella stessa directory i due archivi e il file delle impronte, quindi esegui `shasum -a 256 -c SHA256SUMS`. Su Linux il comando corrispondente è `sha256sum -c SHA256SUMS`. [Impronte SHA-256](SHA256SUMS)

Il collaudo macOS estrae lo ZIP con `ditto`, apre i due lanciatori su una porta di prova e verifica ticket, archivio iniziale, catalogo e PDF protetti. Per ripeterlo, da una copia del prodotto esegui `python3 tests/installazione_mac.py /percorso/Officina-di-Fisica-1.0.0.zip`. Le condizioni e gli esiti del confezionamento sono nel verbale. [Collaudo del pacchetto](collaudo-installazione.md) · [Controlli del prodotto](../docs/collaudo.md)
