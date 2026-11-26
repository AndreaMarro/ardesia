# Esercitazioni supplementari C6

Cinque nuovi esercizi di pratica aggiungono una terza famiglia alle competenze da `C6-L02` a `C6-L06`. Le famiglie coprono densità di flusso termico, accumulo energetico, trasmissione attraverso strati, lavoro da un grafico e confronto di segnali in presenza di fondo. I nuovi ID sono esterni ai 4.606 record sorgente e non assegnano credito al corpus. I 93 quesiti di esame restano esclusi dal pool di pratica.

Il lotto `astra/1` si importa con l’importatore canonico. La prova d’autore su SQLite temporaneo ha salvato cinque bozze e ha lasciato invariati tutti e cinque i record alla ripetizione. I 991 record pubblicati sono rimasti identici. Le fixture sintetiche del motore esistente distinguono ripetizione, risposta con aiuto, trasferimento autonomo e consolidamento differito in una terza famiglia per ciascuna delle cinque competenze. La prova non misura apprendimento reale.

La revisione indipendente deve risolvere le consegne in `prompt-only.json`, congelare le derivazioni e poi verificare chiavi, distrattori, ipotesi, fattibilità manuale e figure di `package.json`. Dopo la verifica distinta occorre collaudare questo pacchetto insieme al registro sorgente completo e registrare i cinque nuovi record separatamente. La coda di approvazione umana e la pubblicazione seguono i gate esistenti. Stato corrente `DRAFT`, approvazione umana `NOT_RUN`.

Dalla radice dell’applicazione:

```sh
python3 -B editorial/supplemental/c6-transfer-v1/assemble_author_draft.py
PYTHONPATH=. python3 -B editorial/supplemental/c6-transfer-v1/verify_author_integration.py
```
