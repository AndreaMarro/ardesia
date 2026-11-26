# Revisione indipendente Cric C1-Q051…Q100

Cinquanta problemi distinti, con moduli espliciti da `cric_c1_l006_verifier` a `cric_c1_l010_verifier`. La primaria `227d4a08` e il modello `0a430e35` precedono tutte le candidate B: copie verbatim e commit completi sono dichiarati in `git-inputs.json`. Nessuna esposizione pre-key nota. Il modello originale resta invariato; le annotazioni nuove distinguono le derivazioni iniziali dalle condizioni effettivamente lette nelle candidate.

Letti tutti i cinquanta record completi e le cinque lezioni reali. Confrontati diciassette SVG storici in XML e cinque nuovi SVG in XML e immagini native intere. Finding risolti dopo rilettura: dieci categorie didattiche, dominio e sole forze del pendolo Q080, massa trascurabile della molla Q083, massa distinta da peso Q084, valori numerici e unità di Q089. Nel nuovo SVG L009 le frecce di velocità sono interamente fuori dai corpi; il negativo precedente resta conservato e non riceve approvazione positiva.

Diciassette test reali, exit 0 in 5,482 s: 152 chiavi sbagliate con binding e tutti i token rinnovati, 60 mutazioni dei metadati, 32 mutazioni di unità/tolleranze, 5 guasti costitutivi e 4 inverse errate; 882 guardie finite/exact e 240 configurazioni Hypothesis. Identità canoniche fresh e salvate su tutti i cinquanta record, con hash Git, versioni e famiglie originali. Decoder numerico con lessemi esatti, senza eval o ricostruzione di decimali da float; AST simbolico ristretto al compito delle due molle.

Riproduzione dalla radice applicativa, con dipendenze canoniche e oggetti Git dichiarati recuperati:

```sh
PYTHONPATH=. python -m unittest discover -s tests/corpus -p test_cross_review_cric_c1_l006_l010_a.py -v
```

I test usano copie byte-identiche delle candidate. Nessuna nuova ETL, browser prodotto o database degli studenti. L’integratore deve ancora confrontare i suoi pacchetti canonici ed eseguire importazione e protocollo UI. Tutte le schede restano DRAFT; approvazione umana NOT_RUN, pubblicazione NONE.
