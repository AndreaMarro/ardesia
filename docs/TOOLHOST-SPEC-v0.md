# TOOLHOST-SPEC v0 — Contratto Tool MAESTRO

Data: 2026-06-11 · Stato: DRAFT per ratifica Andrea · Origine: 3 proposte + 2 giudici (vincitore WEB-STANDARDS-FIRST 33/40 e 31.5/40, unanime) + innesti da LOCAL-PROCESS-FIRST (supply-chain, audit) e MCP-FIRST (claim-provenance, deprecation policy) + risoluzione buchi segnalati dai giudici.

## 1) Decisione architetturale e perché

**Un tool MAESTRO = una web-app statica sandboxed in un `<iframe>` dentro lo Studio, servita su origin loopback dedicata per-tool. Mai un processo nativo. Tutto il privilegio passa per UNA porta: JSON-RPC 2.0 tipato Zod su MessageChannel, validato lato host.**

Perché vince (sintesi giudici, unanime):
- **Invariante di sicurezza che sopravvive agli errori di implementazione**: capability fs/shell/Node NON ESISTONO nel protocollo — non concedibili nemmeno per bug (anti-Obsidian: PhantomPulse RAT 2025-26 via plugin senza sandbox). MCP-FIRST spawnava un processo stdio per tool (= primitiva di code-execution, CVE Flowise, ammesso dalla proposta stessa); LOCAL-PROCESS-FIRST aveva la porta Tier-1 nel contratto. Qui la porta non c'è.
- **Adozione**: zero processi da spawnare, identico Windows/macOS/Linux (scuola italiana = Windows-dominante), barriera creatore minima ("web-app statica + SDK npm"), v0 costruibile da un solo dev.
- **Confine swappabile** (lezione Figma post-vulnerabilità realms-shim → QuickJS-WASM): l'iframe è il confine v0, l'upgrade-path WASM resta aperto senza toccare il contratto.

Componenti (repo MAESTRO, niente ELAB):
```
packages/toolhost/src/host/   ToolHost.ts (lifecycle) · ToolFrame.tsx (mount iframe)
                              origin-server.ts (origin loopback per-tool, bind 127.0.0.1)
                              router.ts (JSON-RPC dispatcher, check origin+source, Zod host-side)
                              policy.ts (grant deny-by-default + consenso) · meter.ts (metering)
                              audit.ts (log append-only per-tool, SQLite)        [innesto P3]
packages/toolhost/src/caps/   board.ts · graph.ts · storage.ts · llm.ts (Broker) · net.ts · ui.ts
packages/toolhost/src/registry/ manifest.ts (Zod .strict) · installer.ts (verifica firma) · killswitch.ts
packages/toolsdk/             SDK npm per autori: createTool(), proxy Comlink tipati
protocol/                     spec versionata + schemas Zod + conformance/ (golden suite in CI)
```
Requisito shell (buco #5 dei giudici): se lo Studio è impacchettato Electron, OBBLIGATORI `contextIsolation:true`, `sandbox:true`, `webSecurity:true`, niente `nodeIntegration`; preferenza Tauri o browser puro. Le garanzie iframe valgono solo con la shell configurata: check automatico in CI.

## 2) Contratto tool v0

**Pacchetto**: `.maestrotool` = zip { `maestro-tool.json` + `dist/index.html` + asset statici }. ZERO script d'installazione (lezione supply-chain Obsidian/npm). Manifest Zod `.strict()`, esempio completo col pilot breadboard (verificato su disco: `~/whiteboard-studio/sim`, Vite+TS statico, blockly 11.2, zod 3.24, @wokwi/elements 1.9.2, 11 test, zero deps server):

```json
{
  "manifestVersion": 1,
  "id": "com.elab.breadboard-sim",
  "name": "Breadboard Arduino",
  "version": "0.1.0",
  "protocol": ">=1.0 <2.0",
  "entry": "dist/index.html",
  "surfaces": ["board-embed", "panel", "fullscreen"],
  "capabilities": {
    "board.read": {},
    "board.write": { "scope": "own-embeds" },
    "storage": { "quotaMB": 200 },
    "llm.generate": { "maxTokensPerCall": 4000 }
  },
  "pricing": { "model": "one-time", "sku": "breadboard-sim-v1" },
  "publisher": { "id": "elab", "pubkey": "ed25519:..." },
  "privacy": { "dataOut": "none" },
  "i18n": { "it": { "name": "Breadboard Arduino", "consentBlurb": "Può leggere la selezione sulla lavagna, disegnare i propri circuiti e usare l'AI del tuo piano." } }
}
```

**Capabilities v0 (vocabolario chiuso, 7 namespace, deny-by-default, additivi-only dentro un major):**
`board.read` · `board.write{scope:"own-embeds"}` · `graph.query` (query NOMINATE read-only, mai SQL) · `graph.proposeClaims` (innesto P2: il tool propone claim col provenance `tool:<id>`, il motore LessonOS li tiene SEPARATI e marcati — le dispense possono citare "verificato dal simulatore") · `storage` (KV+file in `~/Maestro/tools/<toolId>/`, formati aperti, quota) · `llm.generate` (via Broker, §4) · `net.fetch{domains:[...]}` (SOLO via reverse-proxy host, §3) · `ui` (resize/toast/theme, implicita).

**Lifecycle**: install (verifica firma ed25519 + Zod parse + check kill-list) → grant (sheet permessi in italiano dal `consentBlurb`; update con DIFF capabilities ⇒ ri-consenso, innesto P2) → mount (handshake `host.hello{protocolVersion, grantedCaps, theme, locale, MessagePort, bearerToken}` ↔ `tool.ready`) → run → suspend (embed fuori vista ⇒ frame smontato; `saveState/restoreState` serializzabile obbligatorio) → uninstall (purge storage+token; audit log conservato).

**Wire**: JSON-RPC 2.0 su MessageChannel dedicato (port nell'handshake, mai postMessage broadcast); ogni request/response validata Zod LATO HOST (classe di bug Trail of Bits: mai fidarsi del tool).

**Versioning**: protocollo semver; host supporta major N e N-1 con deprecazione ≥12 mesi (policy MCP Active→Deprecated→Removed); conformance suite `protocol/conformance/` in CI su ogni release del toolsdk e localmente al primo avvio dopo upgrade host (innesto P3 `tool-cert`); superficie v0 volutamente minima — ogni metodo pubblicato è un vincolo di 12 mesi.

## 3) Sandbox e permessi

**Tier unico v0**: iframe `sandbox="allow-scripts allow-forms"` su origin loopback per-tool (`http://t-<toolId>.127-0-0-1.localhost:<porta>`) — `allow-same-origin` è sicuro perché l'origin è DISTINTA dallo Studio (modello vscode-webview): il browser partiziona IndexedDB/cookie/cache per tool gratis. No `allow-popups`, no `allow-top-navigation`.

**CSP iniettata dall'host** su ogni risposta dell'origin-server: `default-src 'self'; connect-src 'self'; object-src 'none'; frame-src 'none'` + (buco #4 dei giudici, canali laterali): direttiva `webrtc 'block'`, `Permissions-Policy` che nega camera/microphone/geolocation/usb/serial, `X-DNS-Prefetch-Control: off`, `Referrer-Policy: no-referrer`. Un tool con `privacy.dataOut:"none"` NON può esfiltrare nemmeno se compromesso — per costruzione, non per policy.

**Rete esterna** (risoluzione conflitto giudici proxy-vs-CSP-diretta): TUTTO il traffico verso i domini dichiarati nel manifest passa dal **reverse-proxy trasparente** dell'host (`/net/<dominio>/...` su origin propria ⇒ `connect-src 'self'` resta valido): allowlist enforced, auditabile riga-per-riga (il giudice security ha ragione: la CSP diretta renderebbe l'audit cieco proprio dove avverrebbe l'esfiltrazione), e sblocca comunque ELAB perché supabase-js accetta una base-URL custom (shim di 1 riga). WebSocket inoltrati dal proxy.

**Token** (fix richiesto dal giudice 1): il bearer per le API broker viaggia nell'handshake via MessagePort, MAI in URL. Il document-load dell'iframe usa un nonce monouso a scadenza immediata. Origin-server bind 127.0.0.1, rate-limit per capability in policy.ts. Onestà residua: un malware locale con accesso alla macchina resta fuori threat-model v0 (come per ogni app desktop) — dichiarato, non nascosto.

**Supply chain** (innesto P3 integrale, richiesto da entrambi i giudici): firma ed25519 del publisher verificata all'install (WebCrypto; Sigstore/TUF = upgrade-path post-v0, overkill per 10 docenti — giudizio adozione); **scan statico al publish** in vetrina stile ComfyUI Registry (ban eval/new Function/offuscamento, flag su pattern di rete sospetti); **kill-switch remoto**: l'host consulta una kill-list firmata a ogni start online e disabilita i tool bannati; **audit log append-only per-tool** (SQLite locale) di ogni chiamata broker, leggibile dal docente nelle impostazioni ("cosa ha letto questo tool?") — è anche feature di fiducia. Limite onesto (buco #3): la firma prova l'integrità, non la benignità; il gate sul comportamento è la review umana del registry — costo ricorrente dichiarato, mitigato dal fatto che `dataOut:none` + proxy limitano il danno massimo a "tool inutile", non "tool esfiltrante".

**Upgrade-path** (non v0): QuickJS-in-WASM per logica headless, tier WASM per sim pesanti (fisica/3D). ShadowRealm TC39 scartato (Stage 2.7, no Gecko/WebKit 2026).

## 4) Accesso a lavagna / grafo / LLM (local-first preservato)

- **Lavagna**: `board.read` = snapshot/selezione della scena Excalidraw; `board.write` SOLO su embed propri (`scope:"own-embeds"`). La lavagna-che-registra cattura lo STATO dell'embed (JSON), non pixel: la lezione registrata resta riproducibile e locale.
- **Grafo**: i tool NON parlano mai con LessonOS/SQLite. Il broker `graph.ts` espone query NOMINATE parametriche (`graph.query('concepts.byLesson', params)`) che ritornano solo contenuti del docente loggato, a livello argomento/claim. `graph.proposeClaims` scrive claim marcati provenance, mai testo sorgente. **Audio e trascrizioni grezze: NESSUN endpoint le espone** — GDPR Mode A intatto per assenza dell'API, non per policy (formula P3).
- **LLM**: i tool non vedono MAI una API key. `llm.generate` → **LLM Broker host** dietro interfaccia `LlmProvider` sostituibile (anthropic | gemini | llama.cpp locale) = letteralmente il vincolo "LLM dietro interfaccia sostituibile". Anti prompt-injection (buco #6): il contenuto fornito dal tool entra SEMPRE come messaggio utente delimitato e marcato untrusted sotto system-prompt dell'host; nessun tool-use/loop agentico in v0; l'output torna al tool come testo, mai eseguito dall'host.
- Tutto il dato didattico resta sul PC del docente. Nessuna chiamata cloud è necessaria per usare un tool installato e licenziato.

## 5) Billing / licensing hook vetrina (piani-a-potenza)

- **Entitlement**: la vetrina emette all'acquisto un token firmato ed25519 (claims: `sku, publisherId, teacherId pseudonimo, planTier, exp, graceDays`) verificabile OFFLINE con la sola chiave pubblica cablata nell'host. Abbonamenti: exp 30gg + grace offline 14gg, rinnovo opportunistico. Nessuna chiamata cloud per aprire un tool licenziato.
- **Piani-a-potenza — requisito di prima classe** (buco #1, promosso come chiesto dai giudici): il metering locale (`meter.ts`) è UX, non enforcement — un host locale è modificabile dall'utente. La quota VERA sta lato server: quando il provider è cloud, il Broker chiama il **gateway LLM MAESTRO** con chiave MAESTRO e quota per-piano enforced server-side (più paghi ⇒ più compute/modelli migliori). Quando il provider è llama.cpp locale, la quota non serve (compute del docente). Il compute brokered è il valore non copiabile del piano.
- **Metering**: contatori ANONIMI aggregati (toolId, token, ms — mai contenuti, mai PII) sincronizzati quando online ⇒ revenue share publisher.
- **Onestà DRM** (buco #2): enforcement client-side bypassabile da un tecnico determinato; ai publisher si comunica esplicitamente NO-DRM — il gate economico è distribuzione firmata in vetrina + compute brokered server-side. Pagamenti/payout (Stripe Connect) vivono solo lato vetrina, fuori dal perimetro ToolHost.
- **Lato offerta "i docenti creano tool"** (buco #3 giudice prodotto): v0 spedisce il template CLI `npm create maestro-tool` (scaffold Vite+toolsdk+manifest+firma, dal pilot); il percorso no-code/tool-builder è roadmap post-v0, dichiarato non risolto in v0.

## 6) ELAB-as-tool: percorso concreto repo-separati

ELAB Tutor resta nel SUO repo col SUO brand. L'integrazione è un ARTEFATTO, non un merge:
1. **Unica dipendenza incrociata**: ELAB npm-installa `@maestro/toolsdk` (pubblico, semver). MAESTRO core non importa MAI codice ELAB — vede uno zip firmato dal publisher "elab" come qualunque terzo: stessi permessi, stesso sandbox, stesso SKU in vetrina.
2. **Enforcement meccanico** (innesto P3): check CI nel repo MAESTRO che fallisce su qualunque import `elab-*` / `@elab/*` nel core.
3. **Sequenza**: (a) **pilot = breadboard-sim** (`~/whiteboard-studio/sim`): già web-app statica autosufficiente; servono ~3 cose — manifest, `storage.write` per progetto Blockly/IR, bottone `llm.generate` "spiega il circuito". Valida il contratto end-to-end PRIMA di ELAB. (b) **ELAB pieno**: nel repo elab-tutor nasce `tools/maestro-adapter/` (build target che impacchetta la web-app in `.maestrotool`); il backend Supabase resta affare ELAB ma DICHIARATO nel manifest (`net.fetch{domains:["euqpdueopmlllqjmqnyb.supabase.co"]}`) e mostrato al consenso; via proxy host = auditabile. Onestà sul costo (giudice 2): l'adapter ELAB non è solo packaging — serve lo shim base-URL supabase-js e la sostituzione delle persistenze dirette con `storage.*`; è un esercizio di giorni, non di architettura, SE il pilot ha validato il contratto. Dual-mode: embedded usa `llm.generate` del piano MAESTRO, standalone tiene il suo cloud — senza fork.

## 7) Verdetto AI-runtime (Hermes vs alternative)

Contesto dovuto: l'eval 04/06 rigettò Hermes come **orchestratore di SVILUPPO** ("è un agente, non un orchestratore"). Qui la domanda è DIVERSA — Hermes come **runtime di prodotto embedded** nei tool — ed è stata rivalutata onestamente. Verdetto: **REJECT per v0**, per ragioni nuove:
1. Imbarcare un framework agentico nel runtime significa metterlo NEL CONTRATTO: i tool dipenderebbero dal comportamento di un agente residente (shell/fs/browser built-in = esattamente ciò che il sandbox nega), non da una funzione tipata.
2. Il modello "la gente mette le proprie chiavi API" (BYOK) rompe DUE vincoli duri insieme: piani-a-potenza (impossibile misurare il compute su chiavi del docente) e GDPR Mode A (contenuti di lezione verso provider arbitrari senza punto di consenso).
3. Strutturalmente fuori posto: nella nostra architettura i tool hanno `connect-src 'self'` — non POSSONO chiamare provider direttamente.
4. hermes-agent è a v0.2.x a 4 mesi dalla nascita: churn incompatibile col vincolo compat 12 mesi.

**Vincitore: LLM Broker lato host** (§4), interfaccia `LlmProvider` sostituibile + metering nativo. Il Broker espone internamente le capability host **anche come MCP server**: quando serviranno feature agentiche (futuro `llm.runTask`), QUALUNQUE runtime MCP-speaking potrà implementarle — Claude Agent SDK, o sì, anche Hermes, valutato allora con un eval vero. Ruolo residuo legittimo oggi: un docente power può puntare il PROPRIO Hermes ai broker MCP dello Studio come client esterno, con gli stessi grant di un tool — mai dentro i bundle. Alternative scartate: MCP-Apps-come-contratto-UI (RC orientato a host chat, non a embed lavagna; monitorare ogni release — il framing JSON-RPC identico rende la migrazione meccanica se matura); plugin-web-puri con chiavi del docente (key sprawl, zero metering, GDPR); WASM-only (ucciderebbe "i docenti creano tool").

## 8) Cosa riusiamo (verificato)

- **In casa**: `~/whiteboard-studio/sim` (pilot, verificato su disco 11/06: Vite+TS, blockly ^11.2 Apache-2.0, zod ^3.24, @wokwi/elements ^1.9.2 MIT, 11 test, zero server) · pattern Zod `.strict` da `sim/src/ir/schema.ts` · avr8js (MIT, Wokwi) per fase-2 sim.
- **Standard web maturi**: iframe sandbox + CSP + origin partitioning (modello documentato VS Code webview + post-mortem Trail of Bits 2023) · JSON-RPC 2.0 (stesso framing di MCP/VS Code) · WebCrypto ed25519.
- **Librerie**: Comlink (GoogleChromeLabs, MIT, ~1.1kB) come layer proxy su MessagePort — non reinventarlo · Zod (già in casa, schema unico host+SDK).
- **Pattern presi pari-pari**: deprecation policy 12 mesi da MCP (spec 2025-11-25, RC 2026-07-28, Linux Foundation) · permission-model manifest da browser extensions · scan-at-publish + ban rapido da ComfyUI Registry · firma+kill-switch da Home Assistant add-ons · QuickJS-WASM upgrade-path da Figma ("How Plugins Run" + "An update on plugin security").
- **Anti-modelli citati a ragion veduta**: Obsidian plugin (PhantomPulse, Elastic Security Labs) ⇒ zero-fs-capability · stdio-MCP-as-RCE (Flowise) ⇒ zero processi nativi · ShadowRealm TC39 Stage 2.7 ⇒ tracciato, non usato.

## 9) Roadmap: 3 task pinnabili per il loop

Gate per tutti: `tsc --noEmit` + `vitest run` verdi + conformance suite; review fable-ladder come da loop M0.

- **T1 — `protocol/` + `packages/toolsdk/` + router minimo** (fondamenta): schemi Zod del manifest e dei 7 namespace, handshake `host.hello/tool.ready` su MessageChannel, validazione host-side, golden conformance suite (≥20 casi: manifest invalidi, capability negate, payload malformati). DoD: un tool finto "echo" monta in iframe e completa l'handshake; suite verde in CI.
- **T2 — ToolHost runtime nello Studio**: origin-server loopback (nonce monouso document-load, bearer da handshake), ToolFrame + CSP iniettata (incluse direttive anti-side-channel §3), policy.ts (grant deny-by-default + sheet consenso IT), caps `board.read/write own-embeds` + `storage` + audit.ts append-only. DoD: tool echo legge selezione, scrive un embed, lo stato sopravvive a suspend/restore; audit consultabile.
- **T3 — Pilot breadboard-sim as-tool + LLM Broker v0**: manifest per `~/whiteboard-studio/sim`, `storage.write` progetto Blockly/IR, `llm.generate` "spiega il circuito" via Broker (provider llama.cpp locale O gateway con quota server-side stub), installer con verifica ed25519 + kill-list check. DoD: il sim installato da zip firmato gira nella lavagna coi suoi 11 test ancora verdi nel suo repo; un circuito Blink viene spiegato via Broker senza che il tool veda chiavi.

Post-v0 (non pinnati ora): adapter ELAB · template `npm create maestro-tool` · entitlement vetrina end-to-end · tier WASM.

## 10) Rischi aperti

1. **Capability = superficie di privilegio**: ogni bug in una cap è un buco — tenerle poche (7), auditate (regola semgrep sul router in CI).
2. **Review umana del registry non scala con un solo dev**: la firma prova integrità, non intento; mitigato da scan automatico + `dataOut:none` + kill-switch, ma il collo di bottiglia resta e va prezzato nella vetrina.
3. **Origin loopback = superficie nuova**: nonce+bearer+bind 127.0.0.1 ok, ma va pentestata; malware locale resta fuori threat-model v0 (dichiarato).
4. **Licensing offline bypassabile**: accettato, NO-DRM comunicato ai publisher; valore = compute brokered + distribuzione.
5. **Permission fatigue**: default caps minime + registry curato; ri-consenso solo su diff.
6. **Convergenza MCP Apps**: se gli embed interattivi maturano, il protocollo bespoke rischia legacy — framing JSON-RPC identico = migrazione meccanica; monitorare ogni release MCP.
7. **Perf iframe per sim pesanti**: avr8js ok; fisica/3D potrebbero anticipare il tier WASM.
8. **Quota server-side richiede il gateway LLM cloud**: finché non esiste, i piani-a-potenza sono enforced solo localmente (onesto: UX, non sicurezza) — il gateway è prerequisito del lancio commerciale, non del v0 tecnico.
9. **"Docenti creano tool" non risolto in v0**: il template CLI abbassa la barriera per chi sa npm; il no-code è promessa di roadmap, non di v0.
10. **Shell Electron misconfigurata annulla il sandbox**: il check CI di §1 è obbligatorio prima di ogni release dello Studio.
