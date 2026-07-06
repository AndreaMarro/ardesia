# CODEX security review ToolHost signing/hash post-#115

Data review: 2026-07-09 packet, eseguito da checkout sporco `codex/ardesia-ops-headroom-20260701`; codice analizzato direttamente su `origin/main` = `cec7f9be` con `git show origin/main:<path>` per non toccare lavoro parallelo.

## 1. Executive summary

Post-#115 chiude davvero il gap firma-payload *at install*: i byte firmati del manifest possono impegnare `integrity.bundleSha256`; `installTool` ricalcola il digest del bundle prima di ogni write; `scaffoldPlugin` emette sempre il digest per i nuovi plugin authoring.

Restano tre rischi principali:

1. **P1 - Store tamper post-install su `manifest.json` non riverificato**: dopo l'install, Tool Lab e catalogo parsano il manifest salvato senza verificare la firma registrata in `install.json`. Un write locale a `tools/<id>/manifest.json` puo cambiare id/capability e persino spostare il kill-switch su un id diverso.
2. **P1 - runtime isolation ancora debole nella route prodotto Tool Lab**: `srcDoc` + `allow-same-origin` + targetOrigin `window.location.origin` restano same-origin. Firma/hash autenticano chi ha prodotto i byte, ma non limitano DOM/rete quando quei byte sono malevoli o firmati con chiave dev.
3. **P1 futuro / P2 oggi - TOCTOU install -> mount non ancora attaccabile sul bundle installato perche il bundle salvato non viene montato oggi; diventa P1 appena una route costruira `ToolOriginServer.files` da `tools/<id>/bundle.maestrotool` senza rehash al mount.**

Non ho trovato un nuovo P0 immediato oltre ai gate gia noti ADR-0001/dev-key; prima del marketplace terzi, pero, P1.1 e P1.2 sono prerequisiti di sicurezza.

## 2. Stato post-#115: cosa e protetto davvero

Protetto:

- Manifest schema strict e `integrity.bundleSha256` dentro i byte firmati: `apps/studio/src/toolhost-protocol/manifest.ts:31`, `:72-76`.
- Firma ed25519 sui byte originali del manifest, non su JSON reserializzato: `apps/studio/src/toolhost/installer.ts:145-151`.
- Rehash del bundle prima di scrivere artefatti: `apps/studio/src/toolhost/installer.ts:157-170`.
- Scaffold authoring costruisce bundle deterministico e include il digest nel manifest firmato: `apps/studio/src/toolhost/authoring/scaffoldPlugin.ts:259-289`.
- Package v1 non bypassa l'installer: ricostruisce il bundle e chiama `PluginManager.install`: `apps/studio/src/toolhost/authoring/packageFile.ts:91-105`.
- Zip package reader fail-closed per method != store, CRC e ZipSlip: `apps/studio/src/toolhost/authoring/storeZip.ts:142-203`; test in `apps/studio/src/__tests__/PluginPackage.test.ts:51-107`.
- Kill-list blocca install e mount intent/runtime: `apps/studio/src/toolhost/killList.ts:102-106`, `apps/studio/src/toolhost/pluginManager.ts:144-153`, `apps/studio/src/toolhost/ToolFrame.tsx:48-55`.

Non protetto o solo parzialmente protetto:

- Manifest installato non viene riverificato contro `install.json.signature` prima di catalogo/mount: `apps/studio/src/toolhost/toolLab.ts:91-97`, `apps/studio/src/toolhost/marketplace/localCatalog.ts:55-57`.
- Bundle installato non viene riletto e rehashato prima del mount: unico digest runtime e in `installTool` (`apps/studio/src/toolhost/installer.ts:157-170`); `ToolFrame` riceve un `ToolOriginServer` gia costruito e non vede store/hash (`apps/studio/src/toolhost/ToolFrame.tsx:17-27`).
- Route prodotto Tool Lab monta ancora `srcDoc` same-origin: `apps/studio/src/design/ToolLab.tsx:22-23`, `:138-145`.
- Chiave privata dev checked-in e usata per firmare a runtime il Reference tool: `apps/studio/src/toolhost/toolLab.ts:6-13`, `:52-65`; generazione/salvataggio in `apps/studio/sim/bundle.ts:52-53`. Non riportare il valore della chiave nei log.

## 3. Findings

### P1.1 - Manifest installato trusted-on-first-install senza reverify post-install

- **file:line**: `apps/studio/src/toolhost/toolLab.ts:81-97`; `apps/studio/src/toolhost/installer.ts:181-193`, `:249-258`; `apps/studio/src/toolhost/pluginManager.ts:144-153`; `apps/studio/src/toolhost/marketplace/localCatalog.ts:55-57`.
- **Scenario attacco**: un attaccante con capacita di scrivere nello storage locale dopo un install legittimo modifica `tools/io.maestro.sim-reference-blink/manifest.json`. Alla chiamata successiva, Tool Lab salta l'install perche `isToolInstalled` guarda solo la presenza del manifest (`toolLab.ts:81-84`), poi parsa i byte alterati (`toolLab.ts:91-97`). La route costruisce grant e `ToolHost` dal manifest alterato (`design/ToolLab.tsx:73-85`). Se l'id nel manifest viene cambiato, `PluginManager.canMount` e stato calcolato sul toolId originale prima della lettura, ma `host.refreshKillSwitch()` controllera il nuovo `manifest.id`, quindi una kill-list sull'id originale puo essere bypassata.
- **Impatto**: runtime-integrity debole dello store installato; capability escalation futura quando il bundle montato diventa controllabile dallo store; bypass kill-list per id mismatch gia dimostrabile a livello di flusso.
- **Test falsificabile consigliato**: installare il Reference tool, poi sovrascrivere `manifestPath(TOOL_ID)` con un manifest schema-valido ma non firmato, con `id: "io.attacker.shifted"` e capability extra. Atteso oggi: `installAndGateReferenceTool(store)` ritorna `ok: true` con manifest alterato. Atteso fix: ritorna fail-closed per signature/id/install-record mismatch.
- **Fix minimo consigliato**: introdurre `verifyInstalledTool(store, toolId)` che legge `manifest.json` + `install.json`, verifica `installRecord.toolId === toolId`, `manifest.id === toolId`, firma ed25519 sui byte salvati con `installRecord.signature` e `manifest.publisher.pubkey`; usare questo helper in Tool Lab, local catalog e in qualunque futuro mount da store. Corrompere manifest/install record deve rendere il plugin `problem`/not-mountable, non trusted.
- **File ownership suggerita**: `installer.ts` per helper; `toolLab.ts` e `localCatalog.ts` per consumo; test in `ToolLabGate.test.ts` e `MarketplaceLocalCatalog.test.ts`.
- **Conflitto FABLE graph.query**: no; non tocca `messages.ts`, `router.ts`, `policy.ts`, `caps/graph.ts`.

### P1.2 - Route prodotto Tool Lab resta same-origin `srcDoc`; firma/hash non sono sandbox

- **file:line**: `apps/studio/src/design/ToolLab.tsx:1-7`, `:22-23`, `:85`, `:138-145`; `apps/studio/src/toolhost/authoring/authoringLint.ts:3-8`; ADR in `docs/adr/ADR-0001-toolhost-origin-binding.md:15-24`, `:73-78`.
- **Scenario attacco**: un entry firmato malevolo caricato in Tool Lab gira in `srcDoc` con `allow-same-origin`. Il codice puo raggiungere l'origin dello Studio, usare rete browser non mediata da `net.fetch`, e riceve hello con `targetOrigin = window.location.origin`. `authoringLint.ts` dichiara esplicitamente che oggi CSP/origin non bloccano risorse esterne/fetch.
- **Impatto**: capability model bypassabile dal runtime JS del tool nella route prodotto; `integrity.bundleSha256` prova che i byte sono quelli firmati, ma non limita quello che quei byte possono fare.
- **Test falsificabile consigliato**: Playwright e2e con entry che fa `window.parent.document.body.dataset.pwned = "1"` e `fetch("https://example.invalid")` in Tool Lab. Atteso oggi: DOM parent accessibile e fetch parte/arriva a livello browser; post-ADR-0001 deve fallire per origin/CSP.
- **Fix minimo consigliato**: fino ad ADR-0001, mantenere Tool Lab first-party only e bloccare import/install package terzi su questa superficie. Per chiudere: usare `ToolFrame` + `ToolOriginServer` con binding reale B/C, servire entry da origin distinta, targetOrigin per-tool, CSP reale su risposta.
- **File ownership suggerita**: `design/ToolLab.tsx`, `toolhost/originServer.ts`, eventuale shell/adapter; test Playwright dedicato.
- **Conflitto FABLE graph.query**: no, salvo eventuale test con router non necessario.

### P1.3 - Dev private key checked-in e runtime signing first-party

- **file:line**: `apps/studio/sim/keys.json:2-3` contiene pubkey + private key; `apps/studio/src/toolhost/toolLab.ts:6-13`, `:52-65`, `:81-83`; `apps/studio/sim/bundle.ts:52-53`; ADR note `docs/adr/ADR-0001-toolhost-origin-binding.md:76-78`.
- **Scenario attacco**: chiunque abbia accesso al repo o al bundle sorgente puo firmare un manifest che appare `publisher.id = maestro-sdk` per il Reference path. Con Tool Lab same-origin, una firma first-party dev diventa sufficiente a montare codice con poteri browser dello Studio.
- **Impatto**: identita publisher non affidabile per marketplace o plugin terzi; impossibile distinguere una build Reference legittima da una firmata con la chiave dev esposta.
- **Test falsificabile consigliato**: static guard che fallisce se `apps/studio/sim/keys.json` contiene campi `privateKey`/PKCS8; test runtime che Tool Lab accetta solo una firma fixture pre-generata o chiave fornita da env/dev-only non committata.
- **Fix minimo consigliato**: rimuovere la private key dal repo; tenere solo pubkey e fixture pre-firmata per test/demo, oppure generare chiave ephemera nei test. Per marketplace: publisher signing offline, trust store di pubkey/certificati, key id/revocation, nessuna signing key nel client.
- **File ownership suggerita**: `apps/studio/sim/keys.json`, `apps/studio/sim/bundle.ts`, `apps/studio/src/toolhost/toolLab.ts`, test `ToolLabGate.test.ts`.
- **Conflitto FABLE graph.query**: no.

### P1.4 futuro / P2 oggi - Nessun rehash al mount del bundle installato

- **file:line**: digest calcolato solo in `apps/studio/src/toolhost/installer.ts:157-170`; bundle salvato in `apps/studio/src/toolhost/installer.ts:191-193`; `ToolFrame` non conosce store/bundle/hash (`apps/studio/src/toolhost/ToolFrame.tsx:17-27`, `:53-55`); `ToolOriginServer` prende una `files` map gia pronta (`apps/studio/src/toolhost/originServer.ts:103-106`, `:140-150`); Tool Lab monta `entryHtml` importato dal source, non il bundle salvato (`apps/studio/src/toolhost/toolLab.ts:11-13`, `:97`; `apps/studio/src/design/ToolLab.tsx:143`).
- **Scenario attacco**: quando una route futura leggera `tools/<id>/bundle.maestrotool` dallo store per popolare `ToolOriginServer.files`, un attaccante che sostituisce quel blob dopo l'install ma prima del mount potra servire entry/asset diversi se il mount non ricalcola SHA-256 e non confronta `manifest.integrity.bundleSha256` o `installRecord.bundleHash`.
- **Impatto**: oggi il bundle salvato e un artefatto inerte per la route Tool Lab; domani, appena diventa fonte runtime, il vecchio TOCTOU ritorna.
- **Test falsificabile consigliato**: creare helper `mountInstalledToolFromStore`; installare package con integrity valido; sovrascrivere `bundlePath(toolId)`; tentare mount. Atteso fix: reject prima di costruire `ToolOriginServer`; nessun iframe/hello.
- **Fix minimo consigliato**: prima di estrarre file per `ToolOriginServer`, leggere bundle, calcolare SHA-256, confrontare con `manifest.integrity.bundleSha256` se presente e con `installRecord.bundleHash`; poi estrarre con `readStoreZip` e verificare `manifest.entry` presente. Per manifest legacy senza integrity, consentire solo allowlist first-party esplicita o reinstall/migration.
- **File ownership suggerita**: nuovo helper in `installer.ts` o `originServer` adapter; tests `ToolOriginServer.test.ts`/nuovo `ToolMountFromStore.test.ts`.
- **Conflitto FABLE graph.query**: no.

### P2.1 - Package preview segnala solo firma manifest, non integrita bundle

- **file:line**: `apps/studio/src/toolhost/marketplace/localCatalog.ts:78-86`, `:129-145`; install autoritativo in `apps/studio/src/toolhost/authoring/packageFile.ts:91-105`; test preview solo firma in `apps/studio/src/__tests__/MarketplaceLocalCatalog.test.ts:110-143`.
- **Scenario attacco**: un package con manifest firmato valido ma entry manomessa mantiene `signatureValid: true` nella preview; l'install verra rifiutato da #115 se il manifest include `integrity.bundleSha256`, ma la UI puo presentarlo come "firma valida" senza indicare payload mismatch.
- **Impatto**: non bypassa install, ma degrada la UX di sicurezza e puo indurre il docente a fidarsi di un package che poi fallisce o, su manifest legacy senza integrity, non ha payload binding.
- **Test falsificabile consigliato**: build package da scaffold, alterare solo `entry.html`, chiamare `previewPluginPackage`; atteso oggi `signatureValid === true`; atteso fix: `bundleIntegrityValid === false` e `installable === false`.
- **Fix minimo consigliato**: estendere preview con `bundleIntegrityValid`, `legacyIntegrityMissing`, `installable`; calcolare il bundle ricostruito come `installPluginPackage` e confrontare hash se presente.
- **File ownership suggerita**: `localCatalog.ts`, `MarketplaceLocalCatalog.test.ts`.
- **Conflitto FABLE graph.query**: no.

### P2.2 - Install write non transazionale; artefatti parziali possono creare stati ambigui

- **file:line**: sequenza write in `apps/studio/src/toolhost/installer.ts:191-193`; `isToolInstalled` guarda solo `manifest.json` in `apps/studio/src/toolhost/installer.ts:228-233`; `PluginManager.install` scrive lifecycle solo dopo `installTool` in `apps/studio/src/toolhost/pluginManager.ts:76-80`.
- **Scenario attacco/fault**: se `store.write(manifestPath)` riesce ma `bundlePath` o `installRecordPath` falliscono, `isToolInstalled` diventa true su un install incompleto. Oggi `PluginManager` senza lifecycle tende a disabled, ma catalog/migration/futuro mount possono incontrare stati parziali.
- **Impatto**: affidabilita e recovery; possibile base per bypass se futuro codice assume manifest presente = install valido.
- **Test falsificabile consigliato**: store che fallisce sulla seconda write; chiamare `installTool`; verificare che dopo il fix non resti nessun `manifest.json` orfano.
- **Fix minimo consigliato**: scrivere in path staging (`tools/<id>/.installing/...`) e commit finale atomico/marker, oppure rollback best-effort nel catch. Ridefinire `isToolInstalled` come manifest + bundle + installRecord + valid record.
- **File ownership suggerita**: `installer.ts`, `ToolInstaller.test.ts`, `PluginManager.test.ts`.
- **Conflitto FABLE graph.query**: no.

## 4. TOCTOU install -> mount: attaccabile oggi o solo futuro?

**Verdetto: sul bundle installato e solo futuro nel codice attuale di `origin/main`; sul manifest installato e gia attaccabile come P1.1.**

Dimostrazione bundle:

- Install salva `tools/<id>/bundle.maestrotool`: `apps/studio/src/toolhost/installer.ts:104-107`, `:191-193`.
- Nessun codice di mount legge `bundlePath(toolId)`; `git grep` su `origin/main` mostra usi runtime del bundle path solo in installer/test.
- Tool Lab monta `entryHtml` importato staticamente (`apps/studio/src/toolhost/toolLab.ts:11-13`) e restituito al componente (`:97`); il componente lo passa a `srcDoc` (`apps/studio/src/design/ToolLab.tsx:143`).
- ToolFrame riceve un `ToolOriginServer` gia costruito (`apps/studio/src/toolhost/ToolFrame.tsx:17-27`); `ToolOriginServer` riceve `files` da un chiamante esterno (`apps/studio/src/toolhost/originServer.ts:103-106`) e non puo sapere se arrivano dal bundle installato.

Quindi: sostituire oggi `tools/<id>/bundle.maestrotool` dopo install non cambia l'entry montata da Tool Lab. Pero il giorno in cui si monta il bundle dallo store, il rehash-at-mount deve essere nello stesso PR che collega `bundlePath` -> `readStoreZip` -> `ToolOriginServer`.

## 5. Dev-key / publisher offline signing: rischio e piano

Rischio:

- `keys.json` contiene anche materiale privato (`apps/studio/sim/keys.json:2-3`), e Tool Lab lo usa per firmare a runtime (`apps/studio/src/toolhost/toolLab.ts:52-65`).
- Il commento ammette che e solo dev/first-party (`apps/studio/src/toolhost/toolLab.ts:6-9`), ma ADR-0001 lo classifica come prerequisito critico prima dell'apertura (`docs/adr/ADR-0001-toolhost-origin-binding.md:76-78`).

Piano:

1. Rimuovere private key dal repo e dalla build client; mantenere solo pubkey e/o fixture prefirmata.
2. Introdurre trust store publisher: key id, publisher id, fingerprint, revocation locale/remota.
3. Tool Lab dev: firma solo in script locale fuori bundle o in test con chiave ephemera generata a runtime.
4. Marketplace: package arriva gia firmato offline; client non possiede mai signing key.

## 6. Kill-switch: copre install? mount? refresh? dove sono gap

Coperto:

- Install: `assertNotKilled` prima di scrivere (`apps/studio/src/toolhost/installer.ts:154-155`; `killList.ts:102-106`).
- Lifecycle/canMount: `PluginManager.getState` mette `revoked` prima di `enabled` (`apps/studio/src/toolhost/pluginManager.ts:144-153`).
- ToolFrame mount: `host.refreshKillSwitch()` prima dell'hello (`apps/studio/src/toolhost/ToolFrame.tsx:48-55`).
- Tool Lab route: refresh pre-hello anche li (`apps/studio/src/design/ToolLab.tsx:67-85`).
- Runtime host: `revoke()` chiude sessione e blocca mount futuri (`apps/studio/src/toolhost/host.ts:107-136`).

Gap:

- Nessun remote signed kill feed oggi; `killList.ts:1-4` dice remoto post-v0, mentre `docs/PLUGIN-MARKETPLACE-CANON.md:20-25` parla ancora di "duale local+remote-signed". Va corretto o implementato.
- Kill-list e indicizzata per `toolId`; se il manifest installato viene alterato post-install e l'id cambia, il refresh runtime guarda `host.manifest.id`, non necessariamente il path/id installato originale (P1.1).
- `syncKillSwitch` e pensato anche "quando la kill-list cambia" (`apps/studio/src/toolhost/host.ts:257-261`), ma non ho visto un watcher/pannello remoto wired: copre mount/refresh chiamato, non una revoca asincrona garantita su tutte le sessioni senza chiamante.

## 7. ADR-0001 relationship: rischi restanti dopo `bundleSha256`

`bundleSha256` chiude autenticita del payload consegnato all'installer, non:

- origin partition / CSP reale: ADR-0001 resta aperto (`docs/adr/ADR-0001-toolhost-origin-binding.md:15-24`, `:45-60`);
- dev-key checked-in: ADR-0001 lo chiama prerequisito critico (`:76-78`);
- trusted installed store: serve reverify manifest/install record e rehash bundle al mount;
- remote kill feed/revocation: locale only oggi (`killList.ts:1-4`);
- capability reachability/wire evolution: se `graph.query` e altre capability vengono instradate, aumenta il valore di manifest tamper e runtime isolation.

## 8. Raccomandazione PR successive ordinate

1. **PR-A: verify installed artifacts before mount/catalog**. Aggiungere `verifyInstalledTool(store, toolId)` con signature reverify, id match, install record match; usarlo in Tool Lab e local catalog. Include test tamper manifest/id/kill-list bypass.
2. **PR-B: remove checked-in dev private key**. Pre-signed fixture o key ephemera test-only; static guard anti private key in `apps/studio/sim/keys.json`.
3. **PR-C: preview package payload integrity**. `previewPluginPackage` espone bundle hash status oltre a firma manifest.
4. **PR-D: mount-from-store helper with rehash-at-mount**. Solo quando si collega bundle installato a `ToolOriginServer`; deve includere `readStoreZip`, SHA-256, entry-present, legacy allowlist.
5. **PR-E: ADR-0001 binding decision/implementation**. B shell loopback o C wildcard prima di plugin terzi; Tool Lab srcDoc resta first-party-only fino ad allora.
6. **PR-F: kill-switch remote/feed and async runtime sync**. Firmare feed, refresh periodico o event-driven su host vivi, test fail-closed.

## 9. COV / comandi eseguiti

Comandi principali:

- `git -C /Users/andreamarro/VOLUME\ 3/ardesia log -1 origin/main --oneline --decorate --stat`
- `git -C /Users/andreamarro/VOLUME\ 3/ardesia status --short --branch`
- `gh pr list -R AndreaMarro/ardesia --state open`
- `nl -ba /Users/andreamarro/VOLUME\ 3/PROMPT-NEXT-FABLE-2026-07-09-NOTTE7.md`
- `nl -ba AGENTS.md`
- `nl -ba apps/studio/AGENTS.md`
- `nl -ba docs/vault/ARDESIA-MAP.md`
- `git ls-tree -r --name-only origin/main | rg 'apps/studio/src/(toolhost|toolhost-protocol|__tests__)|apps/studio/sim/keys.json|docs/(ops|adr|PLUGIN)'`
- `git show origin/main:<file> | nl -ba` sui file richiesti: `manifest.ts`, `installer.ts`, `authoring/scaffoldPlugin.ts`, `authoring/packageFile.ts`, `authoring/storeZip.ts`, `pluginManager.ts`, `toolLab.ts`, `marketplace/localCatalog.ts`, `killList.ts`, `originServer.ts`, `ToolFrame.tsx`, `host.ts`, test `PluginPackage.test.ts`, `ToolInstaller.test.ts`, `PluginManager.test.ts`, `ToolLabGate.test.ts`, `MarketplaceLocalCatalog.test.ts`, `ToolOriginServer.test.ts`, docs ADR/dossier/canon.
- `git grep -n` su `origin/main` per `bundleSha256`, `bundlePath`, `installAndGateReferenceTool`, `srcDoc`, `keys.json`, `previewPluginPackage`, `ToolOriginServer`.

Path non trovato:

- `docs/ops/PARALLEL-WORK-PACKETS-FABLE-CODEX-2026-07-08.md` non esiste nella worktree corrente ne in `origin/main` per exact path. Ho usato il packet nel prompt utente e `PROMPT-NEXT-FABLE-2026-07-09-NOTTE7.md`.

Test:

- Non ho lanciato vitest: la worktree corrente non e `origin/main` (`HEAD=8d340de1`, `origin/main=cec7f9be`) ed e sporca con molte modifiche/untracked parallele. Per rispettare "read-only/docs-only" e non confondere risultati contro un checkout diverso, la review e statica su `origin/main`.

## 10. Handoff

HANDOFF CODEX PKT-CODEX-3

Prossimi passi concreti:

1. Implementare PR-A `verifyInstalledTool` + test tamper manifest/id mismatch prima di qualunque mount da store.
2. Rimuovere la private key dev dal repo e aggiungere guard statico anti signing-key checked-in.
3. Quando FABLE termina P0-D, pianificare PR-D rehash-at-mount separata, senza toccare `messages.ts/router.ts/policy.ts/caps/graph.ts`.
