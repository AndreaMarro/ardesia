# CODE2 · delta pubblico del commit706316f0

Il commit `706316f0582f88366cd3cad6c5c1227537a6c419` aggiunge aggiornamento delle consegne nella UI privata e corregge il terzo binario della griglia dei percorsi marketing a `max-content`. Nessun edit prodotto da questo autore nel follow-up. Artifact servito su5416: `/private/tmp/ardesia-r1-marketing-release`,1596sorgenti,sourceTreeSha256 `a60670dfc5de974dbdd1b9b267260d50f77d68f49873570552bc8d54214a7f63`; candidate-manifest SHA `d34b3c364de8aff829a365a77e09a14f0f5e36fee2b2ffefbd74d193cbac80d1`, invariato al termine dei run.

| Nuova prova su706316f | Esito | Fonte |
|---|---|---|
| Landing360/390/820/1440, testo200%, reflow, tastiera, identità/errori/byte |25/25PASS; nessun overflow, etichette e frecce separate, selezione Fluidi da tastiera e collegamento conservato|delta-result.json,delta.log|
| Journey pubblico ordinario e rifiuti |6/6E2EPASS|e2e.log|
| Campioni leggeri, solo plain loopback |6contesti anonimi,3per390/1440;20/20checkPASS|performance-plain/|
| Nuovo video continuo |21,20s,1440×1000,VP8,1.924.366byte,SHA `d13eb39c332b3d6a720712a261629659583c8abcf030b234fc0aa664c5b878b2`|video/ardesia-r1-public.webm,ffprobe.json,video-metadata.json|
| Uguaglianza esperienza rispetto c762 |Tutti i4file sotto/esperienza byte-identici: HTML,JS,CSS,WAV|delta-result.json|

Il video mostra landing→Fluidi→previsione→16→grafico→recupero manuale→nuovo casoη/L→4→contatto, senza invio. È una registrazione visiva senza traccia audio; riproduzione media nativa verificata dalle E2E. Zero errori nel runner video. Le frecce del path-index non collidono a testo200%: a360 il gap minimo osservato tra testo e freccia è14,078px. Screenshot `path-index-text200-*.png` e `landing-first-*.png` a4larghezze;360ispezionato visivamente.

Queste sono prove nuove e mirate. I113check del journey avversariale e i38check/12campioni plain+CPU/rete precedenti restano attribuiti a `c762e30a`, non a706. Il byte-equivalente pubblico consente il confronto delle implementazioni, senza cambiare la cronologia dei run. Il nuovo set leggero non dichiara di aver ripetuto CPU4/rete limitata, zoom nativo, testo200 nell’esperienza o tutti i113check.

Esperienza iniziale: HTML580,JS249666,CSS60135byte,3richieste iniziali,0richieste dopo i due gesti misurati, nessuna API/audio/risorsa esterna. Mediane plain a390/1440: load18,1/18,4ms; snapshot font/2frame60,8/61,2ms; click→2rAF40,6/39,7ms; raggio→2rAF19,9/20,2ms. Sono misure leggere su host condiviso,n=3, senza throttle,OS/JIT non azzerati. Non confrontare causalmente i tempi con set precedenti, non chiamarli INP,fps o smartphone fisico. `configuredProfiles` e raw distinguono il profilo effettivo.

`public-tree.json` conserva tutti i20file pubblici con SHA/byte del pacchetto706. Il coordinatore sta correggendo un ulteriore finding di focus nella UI privata Review: il suo nuovo commit/artifact richiederà un confronto dei20byte pubblici prima di attribuire questo video al runtime pubblico equivalente. Non è stato eseguito un secondo giro di journey oltre a quelli richiesti. Approvazioni umane e pubblicazione restano separate.

## Equivalenza del pubblico finale9121948

Il successore privato è `91219486ddf270582bef1c2e0bda2a66796e6e78`, artifact `/private/tmp/ardesia-r1-marketing-9121948`,sourceTreeSha256 `8211844a37af1894dc104955f7389473e7556544f3980469d55be3c24f5a2d4b`,candidate-manifest SHA `a785a4a0dc151c2d859066f9f1016fdce501352a40778efca019ca212dacde5a`.

`final-equivalence.json` verifica20/20file pubblici identici a706, aggregato `97fd7ef89f86f675a8bea30a3e4793b4ebb166ccae478cda5b672b2dbb66a375`, e9nuove risposte HTTP finali HTML/JS/CSS/WAV esattamente uguali ai file. Manifest immutato prima/dopo queste letture. Il video21,20s e le prove CODE2 rimangono osservazioni del706; il runtime pubblico finale9121948 è byte-equivalente. Non si estende questa uguaglianza al comportamento privato di Review e non sono state ripetute suiteCore,journey,video o throttle sul912. La review/accettazione umana e l’autorizzazione di pubblicazione rimangono gate separati.
