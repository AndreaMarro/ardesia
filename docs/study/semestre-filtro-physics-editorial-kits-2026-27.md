# Semestre filtro 2026/27 — indice dei kit editoriali di Fisica

Stato: **DRAFT**, 24 ottobre 2026. Questa pagina è un indice di integrazione, **non** pubblica il materiale docente privato e non modifica il runtime.

## Quattro percorsi, sette unità

| ID percorso | Unità | Lezione originale pilota | ID kit privato |
|---|---|---|---|
| `strumenti-meccanica` | U1, U2 | Vettori, forze e moto | `ARD-SF26-01` |
| `fluidi-termodinamica` | U3, U5 | Pressione e galleggiamento | `ARD-SF26-02` |
| `elettricita-magnetismo` | U6 | Ohm, potenza e reti | `ARD-SF26-03` |
| `onde-ottica-radiazioni` | U4, U7 | Onde, frequenza e fotoni | `ARD-SF26-04` |

La mappa dei quattro percorsi è una **proiezione**, non un cambio delle sette unità curricolari. Le lezioni pilota non coprono da sole tutto il programma.

## Separazione dei dati

I contenuti didattici completi, compresi TeX, diagnostiche, flashcard, guide docenti e analisi, sono conservati nel repository **privato** `AndreaMarro/ardesia-knowledge`, PR DRAFT #20: https://github.com/AndreaMarro/ardesia-knowledge/pull/20 .

Non importare il contenuto testuale nel prodotto finché non supererà review editoriale e scientifica. La banca canonica resta `physics-semestre-2026`, versione 1, SHA-256 `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`. Questo hash è un riferimento versionato, **non** una richiesta di riscriverne il manifest.

I record privati sono un **sidecar**: `kitId`, `pathId`, `unitIds`, `contentStatus=DRAFT`, `bankRef`, `flashcards[]` e `diagnostic[]`; gli ID canonici sono collegamenti, non copie di quesiti. Eventuali future attività, suggerimenti, simulazioni e immagini devono passare dai contratti LessonOS/Study già esistenti. Non aggiungere un motore di quiz parallelo.

## Gate di pubblicazione

1. Provenienza e perimetro ministeriale 2026/27 controllati direttamente contro il testo ufficiale e le fonti universitarie.
2. Revisione scientifica indipendente di soluzioni e unicità semantica delle alternative.
3. Verifica/accessibilità PDF, mobile preview e gestione legittima dei diritti delle fonti.
4. Import sidecar con check del digest della banca e dei percorsi sulla branch finale di integrazione.
5. Autorizzazione esplicita del responsabile per la singola versione approvata.

**Non ancora verificati:** calibrazione su studenti, revisione umana, end-to-end LessonOS, reale fruizione studente. Nessun deploy/merge né pubblicazione agli studenti sono implicati in questa PR.

## Tracciabilità

La matrice dei **62 obiettivi 2025** è una classificazione derivata dal blueprint in repository, non una dichiarazione di consultazione diretta dei 62 quesiti ufficiali in questa esecuzione. Gli appelli del 20 novembre e 10 dicembre 2025 servono a progettare operazioni mentali di trasferimento, non a inferire le frequenze future.

La branch privata parallela `content/semestre-filtro-physics-kits-20261024` conserva un archivio diviso in parti: il suo indice richiede **16** parti, ma durante il controllo del 24 ottobre ne risultavano presenti soltanto **10**; non usarlo come dipendenza fino alla ricostruzione e checksum corretti.
