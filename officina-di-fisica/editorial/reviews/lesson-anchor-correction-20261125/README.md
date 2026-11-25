# Correzione proposta degli anchor delle lezioni

Stato: proposta dell’autore ROOT, revisione distinta in corso, non ancora applicata ai pacchetti registrati. Il replay 5405 mantiene gli input congelati.

Il controllo di coesistenza fallisce importando SIM-C1-L002-04 dopo la bozza della lezione C1-L002. La regressione sull’intero catalogo originale trova quattro entry point persi in due lezioni DRAFT. Tutti i 181 esperimenti originali hanno invece il paragrafo previsto nell’edizione originale.

I JSON in questa cartella sono proposte di revisione dei due pacchetti esistenti, non un nuovo importatore né una nuova versione dell’applicazione. Il diff contiene soltanto tre paragrafi; formule, figure, risposte e gli altri record rimangono invariati. I pacchetti originari e i report precedenti restano nella cronologia Git. Non copiare firme scientifiche prima della review effettiva.

Dopo la review e la conclusione del replay congelato, applicare tramite i due generatori esistenti, ricalcolare i binding, far verificare i byte finali dal revisore, ripetere import e anteprime dei soli due pacchetti cambiati. Ripetere poi coesistenza e rigenerazione integrale del checkpoint. Il test negativo e il log di coesistenza sono conservati qui; nessun nuovo credito di completamento.
