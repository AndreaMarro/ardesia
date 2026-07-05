# ADR-0001 — Origin binding reale per ToolHost

- **Stato**: PROPOSED (decisione canon = Andrea; nessuna opzione implementata da questo ADR)
- **Data**: 2026-07-05
- **Contesto PR**: #58 (Tool Lab in route prodotto) ha dichiarato il limite; questo ADR lo mette a decisione.

## Contesto (firsthand, post-#58)

Il ToolHost monta oggi il tool con due superfici diverse:

1. **`ToolFrame.tsx`** (superficie canonica): `iframe src` + sandbox
   `allow-scripts allow-forms allow-same-origin`. È sicura SOLO se l'origin del
   tool è DISTINTA da quella dello Studio — guard terminale
   `isToolOriginIsolated()` (`originServer.ts`), collisione = rifiuto mount.
2. **`ToolLab.tsx:143`** (route prodotto `?vista=tool-lab`): `srcDoc={gate.entryHtml}`
   con `allow-scripts allow-same-origin` → il tool gira **nella stessa origin
   dello Studio**. Firma ed25519, kill-switch e capability-gate sono reali, ma
   la partizione browser (storage/cookie/DOM per-origin) NON esiste: un tool
   malevolo che evade il capability-layer JS ha i poteri dello Studio.

`originServer.ts` è già il **modello puro** richiesta→risposta (CSP iniettata,
nonce monouso, path-safety, origin per-tool `http://t-<toolId>.127-0-0-1.localhost:<port>`,
modello vscode-webview). Manca solo il **binding reale** del socket: in un
browser puro non è possibile — questa è l'unica rinuncia dichiarata di #58.

## Decisione richiesta

Come dare a ogni tool un'**origin reale distinta**, per superficie di deploy.

## Opzioni

### A. Service Worker, scope same-origin
Il SW intercetta `t-<toolId>/…` come sub-path della stessa origin Studio e serve
l'entry del tool con CSP iniettata dal modello `originServer.ts`.
- ✅ Funziona nel browser puro (web prod oggi), zero infra.
- ❌ **Non crea un'origin distinta**: la partizione resta debole (stesso
  storage/cookie space; l'isolamento resta affidato a CSP + sandbox senza
  `allow-same-origin`, quindi hello/MessageChannel vanno riprogettati o il
  sandbox resta same-origin com'è oggi). È un miglioramento di *contenimento*
  (CSP/nonce/path-safety reali), NON di *partizione*. Il commento hardening §3
  in `originServer.ts:19-25` resterebbe formalmente violato.
- Nota: registrare il SW aggiunge un singleton con potere di intercept su
  TUTTA l'origin Studio — superficie nuova da governare (update, kill, scope).

### B. Shell desktop (Tauri/Electron) con loopback per-tool
L'adapter di shell binda `127.0.0.1:<port>` e serve il modello `originServer.ts`
as-is; origin `http://t-<toolId>.127-0-0-1.localhost:<port>` per-tool.
- ✅ Partizione VERA per-origin, `allow-same-origin` torna sicuro (guard già
  scritta), zero riprogettazione del protocollo hello/MessageChannel.
- ✅ `originServer.ts` è stato scritto esattamente per questo seam: policy
  identica per qualunque binding.
- ❌ Non copre la web prod: richiede distribuzione shell (epica nuova,
  NUOVA DIP = GATE-Andrea su Tauri vs Electron).

### C. Sottodomini wildcard in web prod
`https://t-<toolId>.<dominio-studio>` servito da edge/CDN con lo stesso modello.
- ✅ Partizione vera per-origin ANCHE nel browser puro.
- ❌ Richiede infra DNS/TLS wildcard + un serving layer (decisione
  infra/costi = GATE-Andrea); il modello `toolOrigin()` va parametrizzato
  sullo schema https/host.

## Raccomandazione (non vincolante)

- **Ora**: tenere la superficie `srcDoc` del Tool Lab SOLO per tool first-party
  firmati (stato attuale: Reference tool). Nessun tool di terze parti su
  questa superficie — vincolo da scrivere nel marketplace canon.
- **Traiettoria**: B per la shell desktop/LIM (il seam esiste già), C quando il
  marketplace apre a terzi sul web. A solo come contenimento intermedio se
  serve qualcosa sul web prima dell'infra C, sapendo che NON è partizione.

## Conseguenze

- Finché la decisione non è presa, `PluginManager.canMount` + kill-list + firma
  restano l'unico confine reale sul web: il vocabolario capability deve restare
  deny-by-default e il Tool Lab non deve accettare bundle non first-party.
- La chiave privata dev `sim/keys.json` già nel bundle (debito noto #58)
  diventa CRITICA nel momento in cui la superficie si apre: la firma offline
  publisher è prerequisito di qualunque opzione.
