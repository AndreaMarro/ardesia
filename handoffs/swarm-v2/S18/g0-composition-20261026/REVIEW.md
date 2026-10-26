# Review tecnica della composizione G0

## Raccordi tipizzati

S00 ha letto il delta `34eccf94350035cded2d8a317fbe4ead8e28a0ce` e non ha segnalato un blocco nei controlli di revisione, ACL, label o legame della ricevuta con l’aiuto. Ha rilevato un rischio concreto di perdita del draft: il link media ricaricava la stessa scheda dopo che l’apertura della fonte aveva marcato il percorso come modificato.

Il follow-up `4bf40ced2cad045fb6aa73f2d3354b3d622bf807` apre la scheda separata con dichiarazione visibile, `noopener` e `noreferrer`. La regressione passa da 1 FAIL/7 PASS a 8/8 PASS. Il golden finale verifica che il draft originale conservi previsione e aiuto attraverso apertura/chiusura di Materiali e player, poi controlla entrambi i riferimenti nella ricevuta reale.

## Composizione CSS

L’agente Architecture ha prima confermato in sola lettura la collisione fra il `.sidebar` generico di PDF.js e quello della shell. Ha suggerito il namespace della shell e breakpoint del reader riferiti al contenitore effettivo.

Ha quindi letto il delta di sei file `ec5f19076d07f5a71b6151d8cd89bf33c8713a64..6ecbdc4d78d675207056a63af38fccbd89ca5c5a`, il JSON della prova di layout e gli screenshot 1440/820.

**Esito comunicato: nessun finding bloccante nel delta.**

- Il token CSS `.sidebar` non rimane nei sorgenti app/E2E interessati; `sidebar-bottom` resta coerente.
- Tutti i selettori base e responsive sono rinominati; semantica ARIA invariata e due E2E riferiti al ruolo accessibile.
- `.living-sources` è l’antenato corretto del contenitore; le query agiscono sui discendenti. Il resize JavaScript del PDF è invariato.
- Desktop: sidebar fixed 252 px e main a x252. Tablet: sidebar 820 px prima e dopo. PDF annidato: 150→448 px sul desktop e 252→386 px sul tablet.
- Le misure 390/360 restano coerenti; le note sono collocate sotto il reader quando richiesto dalla larghezza del pannello.

Il controllo sulle miniature è condizionale: a viewport 1440 il contenitore è largo circa 623 px, quindi le miniature restano correttamente affiancate. Nei pannelli larghi al massimo 600 px vengono impilate. Non si dichiara che siano impilate a tutte le larghezze.

Questa è review tecnica indipendente del codice e delle evidenze lette, non una nuova esecuzione indipendente del golden, un audit completo delle authority, un’approvazione umana o scientifica. S00 verifica e integra il proprio tree congiunto.
