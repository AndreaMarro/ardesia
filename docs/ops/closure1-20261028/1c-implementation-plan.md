# 1C — Laboratori Fluidi e termodinamica

Mandato esecutivo del proprietario, 28 ottobre 2026. Base `85963b1d7e8a8ec14ee3f7353f9c681b3ff208f7`.
Si estende il dispatch `simulationPluginRegistry`, con manifest SDK esistente; nessun secondo registry, grader o store. Il catalogo dei modelli è descrizione scientifica del plugin, non un nuovo loader.

- [x] Recuperare contratto 1A, science-library, PhysicsLab, JSXGraph e asset S16.
- [ ] Recuperare registro 139, envelope, S12–S16 e riferimenti; distinguere recupero, nuove indagini e assimilazioni.
- [ ] Implementare 16 modelli analitici SI, dominio finito e golden indipendenti; riusare formule/casi Core esistenti dove disponibili.
- [ ] Esporre configurazione docente, preset, snapshot validato e versionato, reset, import/export, eventi senza giudizi di mastery.
- [ ] Fornire renderer 2D specifici e scene 3D significative con caricamento a richiesta, gestione context loss e percorso 2D permanente.
- [ ] Registrare il plugin nel dispatch esistente e consegnare a 1A API e snapshot per consumer/risorse Core.
- [ ] Collegare lezioni/esercizi con 1B e 1A; il collegamento proposto non attesta pubblicazione.
- [ ] Misurare modello/controlli, browser desktop/tablet emulato, tastiera, errori e bundle; dispositivo fisico e remoto distinti.
- [ ] Consegnare una PR implementativa con registro `labs-and-donors.md`, prove e limiti. Solo 1A integra/rilascia.

## Confini e verifiche

Provenienza originale Ardesia e fonti primarie citate. Donor senza diritti verificati: solo comportamento osservato e ricostruzione originale. Nessuna acquisizione di asset proprietari. Lo stato scientifico è unico per scena, grafico, misure e formula; niente tempo casuale o pseudo-CFD. Importazioni malformate, versioni ignote e domini impossibili falliscono esplicitamente. Le prove numeriche confrontano invarianti fisiche e risultati indipendenti, non l'implementazione con se stessa.

Le superfici shell/player/authoring condivise e le autorità di persistenza restano di 1A. Le formule non certificano revisione umana o apprendimento. DONE richiede consumer pubblicato, ripresa Core e prove sui dispositivi; fino ad allora si riportano i singoli stati verificati.
