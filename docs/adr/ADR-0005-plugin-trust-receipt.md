# ADR-0005 — Receipt di fiducia e un solo runtime dei plugin

- **Stato**: PROPOSED (ratifica = Andrea; nessuna rimozione del percorso Founder eseguita qui)
- **Data**: 2026-07-24
- **Programma**: convergenza a dieci azioni — Action 5
- **Base misurata**: `4d697f5e`

## Contesto misurato firsthand (24-07)

ARDESIA ha **due percorsi di acquisizione** con garanzie realmente diverse, e il
sorgente lo dice già con onestà.

**`builtin-compiled`** — `apps/studio/src/toolhost/founderBetaPlugin.ts`:

> «Etichetta di provenienza, NON esito di una verifica crittografica a runtime.
> […] Non dichiara che una firma del manifest o un digest del bundle siano stati
> verificati al mount: quel confine non esiste ancora».

Quello che fa davvero: allowlist chiusa, asserzioni di confine sul manifest
(id, kind, `privacy.dataOut`, capability remote assenti, `board.write` limitata
a `own-embeds`, publisher first-party), review umana, e il legame con lo SHA del
build Studio.

**`installed-signed`** — `apps/studio/src/toolhost/installer.ts`: verifica la
firma ed25519 del manifest via WebCrypto e, quando il manifest firmato impegna
`integrity.bundleSha256`, confronta il digest del bundle consegnato **prima di
qualunque scrittura** (fail-closed: un bundle divergente non lascia traccia).

Il problema non è la disonestà del codice: è che la distinzione vive **solo nei
commenti**. Nulla impedisce che un domani il tier di un built-in venga promosso a
«verificato» senza che nessuna verifica venga introdotta.

## Decisione proposta

1. Separare **acquisizione** da **runtime**: dopo l'acquisizione, entrambi i
   percorsi convergono su un solo ciclo di vita, capability, audit, storage,
   eventi, sospensione e kill.
2. Ogni plugin montato ha un **receipt**: identità, publisher, versione, modo di
   acquisizione, tier, controlli effettivamente eseguiti, più `bundle_digest` o
   `source_sha` a seconda del percorso.
3. **Un receipt non può rivendicare un controllo che il suo percorso non
   esegue.** È la regola che porta tutto il peso.
4. L'assenza di un servizio host per una mutazione fondata diventa uno stato
   **bloccato e visibile**, non un fail-soft silenzioso.

## Come diventa esecutiva

`bin/convergence/plugin_trust.py` + `plugin_trust_registry.json` codificano, per
ciascun modo, l'insieme `provides` dei controlli onestamente disponibili, e
rifiutano ogni receipt che esca da quell'insieme.

In più un **invariante incrociato sul sorgente**: se
`FOUNDER_BETA_PLUGIN_TRUST_TIER` cambia valore senza che cambi il registro, il
gate fallisce dicendo «il tier è cambiato senza cambiare il modello di fiducia».
Verificato firsthand: sul repo reale l'invariante regge (exit 0); su una copia in
cui il tier diventa `"verified"`, esce 1.

Controlli negativi: 15 in `bin/convergence/test_plugin_trust.py`, tra cui un
built-in che rivendica firma o digest, la promozione di tier, il modo
sconosciuto, il receipt duplicato, e il digest base64 dell'installer reale (che
**deve** passare).

## Cosa questo ADR NON fa

- Non rimuove il percorso speciale Founder: rimuoverlo richiede prima che
  Simulation usi il runtime condiviso.
- Non introduce catalogo, marketplace, caricamento remoto o installazione di
  terze parti: restano gate umani.
- Non verifica firme a runtime. Il validatore è statico: controlla la *coerenza
  del modello*, non esegue crittografia.

## Cosa resta umano

- ratifica del modello di fiducia;
- caricamento remoto e installazione di terze parti;
- qualunque superficie di marketplace o pubblicazione.

## Conseguenze

- Positive: la differenza tra «revisionato» e «verificato» smette di essere una
  convenzione tra chi legge i commenti e diventa un fatto controllabile; la
  capacità di marketplace resta possibile senza costruirne ora catalogo,
  billing o distribuzione.
- Negative: finché non esiste un emettitore di receipt nel runtime, i receipt
  sono documenti validati fuori dal processo di mount. Il gate protegge il
  *modello*, non ancora il mount.
