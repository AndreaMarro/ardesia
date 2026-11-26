# Contesto riproducibile del negativo rete b2

Il negativo originale e i suoi 80 file restano immutati nel commit `0dfef45804609a63086f727879e6a1761ac8ac41`, manifest SHA `395816552f4dc9546d0ccb10313fdc408845f43b74a13981a45a6d5976585529`. Il wrapper lì archiviato è quello effettivamente eseguito dalla cartella superiore: non va rilanciato direttamente dopo avergli cambiato profondità nel filesystem.

Questo addendum conserva i quattro JSON esatti necessari all’import delle nove edizioni DRAFT e adatta soltanto il contesto del launcher esistente. La produzione viene sempre ricostruita dagli oggetti Git immutabili 16dc e verificata contro il fingerprint b2. Non viene importato alcun modulo autore o modificato ROOT/runtime. Gli output devono essere nuovi e sotto `var/` di questo checkout; nessun report storico viene sovrascritto. Il repository sorgente deve contenere 16dc; il lazy fetch è disabilitato e una mancanza fallisce.

Verifica leggera realmente eseguita, senza Node/browser:

```sh
python3 -B officina-di-fisica/editorial/reviews/independent-consumer-b2ab-20261126/network-negative-replay-support-20261126/replay-network-negative.py --verify-inputs-only
```

Un nuovo replay, esplicito e soggetto al mutex e a 2 GiB liberi, usa la stessa procedura del negativo:

```sh
python3 -B officina-di-fisica/editorial/reviews/independent-consumer-b2ab-20261126/network-negative-replay-support-20261126/replay-network-negative.py --output /ABS/CHECKOUT/officina-di-fisica/var/replay-network-negative-b2-new
```

Le dipendenze installate e Chrome devono corrispondere al contesto di prova dichiarato. “Portabile” significa qui che la radice del checkout e il nuovo output sono espliciti; non attesta sistemi operativi o ambienti browser non eseguiti. Il launcher adattato non è stato usato per un secondo replay UI: l’esecuzione reale di otto casi rimane quella originale congelata. Tre test nuovi controllano disponibilità dei byte, file mancanti/alterati/non elencati e candidati duplicati/base errata anche dopo repin privato della sola fixture. Non aggiungono credito scientifico o UI.
