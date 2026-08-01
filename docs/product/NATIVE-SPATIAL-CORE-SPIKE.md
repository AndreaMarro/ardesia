---
title: ARDESIA Native Spatial Core Spike
status: PROPOSED_EVIDENCE_ONLY
created_at: 2026-08-01T12:45:09+02:00
product_base_sha: 4218bc2e98774cbc7efa100223c913e7444e715b
knowledge_sha: 0d9ff5b10f54b9378c658753ab55f7e8a56f51ef
---

# ARDESIA Native Spatial Core — spike falsificabile

## Scopo

Scegliere l'architettura nativa con prove sullo stesso scenario, non con la
promessa *write once*. Lo spike e' evidence-only: puo' produrre prototipi,
misure, fixture e una decisione, ma non viene presentato come app pronta e non
autorizza una migrazione totale.

Target primario: iPadOS + macOS. Target di confronto: Android.

## Outcome unico

Sullo stesso documento, una persona deve poter:

1. creare o aprire un documento ARDESIA;
2. su iPad scrivere con Apple Pencil e navigare il canvas senza conflitti
   penna/touch;
3. su Mac navigare e manipolare con puntatore, trackpad e tastiera, senza
   fingere che Apple Pencil sia un input macOS;
4. inserire 20 oggetti vivi generici e collegarne almeno due;
5. portare tre istanze fra `compact`, `intermediate`, `expanded` senza remount
   o contaminazione di stato;
6. chiudere forzatamente e riaprire offline ritrovando scena, eventi, bounds,
   z-order e collegamenti con digest identico;
7. esportare, reimportare e ripetere il digest;
8. eseguire una fixture Simulation reale e confrontarne l'output con l'oracolo
   corrente.

Lo stesso documento e gli stessi vettori di conformita' devono poter essere
letti dal prototipo Android, anche se la UI Android completa viene dopo.

## Ipotesi da falsificare

### Apple

- SwiftUI per struttura condivisa iPad/macOS e scene documentali;
- PencilKit per ink e input Apple Pencil;
- bridge UIKit/AppKit soltanto dove la misura dimostra che SwiftUI non basta;
- SQLite append-only per LessonOS, checkpoint e replay.

### Android

- Jetpack Compose per UI e API stylus native;
- SQLite e lo stesso formato documentale/versionato;
- Kotlin Multiplatform soltanto come canary del dominio deterministico, non del
  canvas o della UI.

### Dominio condivisibile

Event Envelope, scene graph, validazione `.lesson`, digest e replay LessonOS
sono candidati. La promozione richiede output byte-identico, integrazione build
pulita e costo inferiore a due implementazioni native aderenti agli stessi
vettori.

## Separazione obbligatoria dei modelli

Il prototipo corrente mescola stato persistente ed effimero. Lo spike deve
separare:

- `PluginInstance`: identita', versione, dati, capability e binding;
- `PostitProjection`: bounds, z-order, stato visibile e relazioni;
- `InteractionState`: selection, hover, proximity e gesture correnti;
- `EventEnvelope`: attore/persona separato dai ruoli contestuali;
- `ArdesiaDocument`: scena renderer-independent e riferimenti agli asset.

`hidden` e' una proprieta' della proiezione/canvas, non un quarto stato visivo
del post-it.

### Digest canonico dello spike

Prima di implementare il reopen si congela `ArdesiaConformanceDigest/v0`:

1. oggetto con `schemaVersion`, `PluginInstance`, `PostitProjection`, relazioni,
   hash degli asset ed hash degli `EventEnvelope` persistiti;
2. nessun campo di `InteractionState`, timestamp di misura o dato effimero;
3. collezioni di entita' ordinate per ID stabile; eventi nell'ordine causale
   canonico, asset per path logico;
4. numeri e chiavi serializzati con JSON Canonicalization Scheme (RFC 8785);
5. digest finale `SHA-256` dei byte UTF-8 canonici.

Fixture, encoder di riferimento e almeno una mutazione che cambia il digest
devono essere congelati prima delle implementazioni Apple/Android. Se una
piattaforma non riproduce gli stessi byte, il gate e' rosso: non si confrontano
hash di serializzazioni diverse.

## Gate CoV

| Gate | Condizione di passaggio |
|---|---|
| hardware | prova su iPad e Mac fisici, non solo simulatori |
| ink iPad | p95 Pencil input-to-present ≤ 20 ms sul dispositivo dichiarato |
| frame | nessun frame >33 ms nella prova concordata di 30 secondi |
| gesture iPad | Pencil scrive; due dita navigano; drag oggetto non produce ink |
| input Mac | puntatore/trackpad/tastiera manipolano gli oggetti e il focus non resta intrappolato |
| oggetti | 20 vivi, 3 espansi, stato indipendente e collegamenti stabili |
| reopen | kill/reopen offline con digest identico |
| formato | import legacy, export nuovo, input corrotto fail-closed |
| LessonOS | replay produce la stessa proiezione e lo stesso digest |
| Simulation | golden fixture equivalente all'oracolo web |
| accessibilita' | move/resize senza drag, focus escape e tastiera Mac |
| Android | legge formato/vettori e prova almeno ink + 20 oggetti + reopen |
| store | ogni estensione classificata e policy-compatible |

Ogni numero e' `PROPOSED` finche' una receipt non nomina hardware, build SHA,
comando, artefatto e risultato. Il vecchio prototipo e il nuovo candidato
devono fallire in modo controllato almeno un vettore prima che il gate venga
creduto.

## Estensioni compatibili con gli store

Il marketplace non puo' equivalere a scaricare codice nativo arbitrario:

1. `compiled`: strumenti nativi inclusi nell'app e aggiornati tramite store;
2. `declarative`: pack, contenuti e workflow firmati e scaricabili;
3. `web-sandboxed`: eventuali mini-app HTML/JavaScript in adapter isolato,
   capability minime, consenso e nessun accesso nativo implicito.

Manifest, firme e capability correnti sono donor; `entry.html`, iframe e
MessageChannel non sono il nuovo Core.

## Mappa salvage / retire

| Patrimonio corrente | Decisione dello spike |
|---|---|
| Event Envelope, causalita', idempotenza | portare come contratto language-neutral |
| `.lesson`, hash, staging e import transazionale | preservare; aggiungere scena v2 renderer-independent |
| LessonOS materializer/event log | preservare semantica e test; backend SQLite |
| solver, scene, netlist e fixture | bridge temporaneo o port, sempre contro golden vectors |
| ToolManifest, capability, firme | preservare il modello, non il runtime browser |
| test TypeScript | trasformare in vettori multipiattaforma |
| React/DOM/CSS/router/viewport | non trasferire come shell |
| Excalidraw autoritativo | mantenere importer legacy, non formato v2 |
| localStorage/IndexedDB/File System Access | ritirare come autorita' persistente |
| PWA/Vercel | demo transitoria, non destinazione |

## Lane e ownership

1. Apple canvas/input;
2. documento/Core/LessonOS;
3. Simulation e vettori di conformita';
4. Android/KMP e verifica policy store.

Le lane leggono, prototipano e misurano in parallelo su worktree disgiunti.
Ogni stato mutabile ha un writer; formato e contratti condivisi cambiano in una
sola integrazione serializzata. Massimo cinque file per work unit/PR.

## Gate di governance AI

Il repository impone oggi `ZERO-LLM in prodotto`; la visione ratificata chiede
un assistente consultivo e indica ChatGPT come possibile provider per creare
materiali. Lo spike native **non risolve implicitamente questo conflitto**.

Prima di attivare un provider esterno serve una decisione dedicata che fissi:

- confine fra Core deterministico e adapter opzionale;
- consenso, egress, privacy, costi e modalita' offline;
- `draft → preview → commit`, provenance e rollback;
- comportamento reale quando il provider manca;
- test che impediscano scritture canoniche non approvate.

Fino a quella decisione, il percorso Materiali deve funzionare con export e
trasformazioni deterministiche; l'adapter AI resta una porta tipizzata e
disabilitata.

## Decisione di uscita

La proposta finale deve contenere:

- tabella affiancata delle misure Apple/Android;
- artefatti e receipt su exact SHA;
- lista del codice realmente salvato e di quello ritirato;
- rischi store/privacy/accessibilita';
- decisione `ADOPT`, `REVISE` o `REJECT` per ogni ipotesi;
- prima slice H1 in PR da massimo cinque file.

Nessun prototipo viene fuso in `main` soltanto perche' compila.

## Fonti tecniche primarie

Verificate il 1 agosto 2026 alle 12:45 (CEST):

- [Apple — configurare un target multipiattaforma](https://developer.apple.com/documentation/Xcode/configuring-a-multiplatform-app-target)
- [Apple — DocumentGroup](https://developer.apple.com/documentation/swiftui/documentgroup)
- [Apple — PencilKit](https://developer.apple.com/documentation/pencilkit)
- [Android — stylus input in Compose](https://developer.android.com/develop/ui/compose/touch-input/stylus-input)
- [Kotlin — condividere codice fra piattaforme](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html)
- [Apple — App Review Guidelines, in particolare 2.5.2 e 4.7](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play — Device and Network Abuse](https://support.google.com/googleplay/android-developer/answer/16559646)
- [Android — rischi del dynamic code loading](https://developer.android.com/privacy-and-security/risks/dynamic-code-loading)
