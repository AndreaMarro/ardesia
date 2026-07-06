# ARDESIA — PLUGIN-MARKETPLACE-CANON (23/06/2026)

> Sistema plugin + marketplace, as-built + da-costruire. Verificato firsthand su `~/maestro-studio/src/toolhost/`. Vedi [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md).

## 1. Stato sintetico
- **Plugin host = EXISTS, production-grade, EXCEEDS** il contratto di sicurezza del vision — **ma UNMOUNTED** (Roadmap B ~90% costruito, ~0% montato). 28 file, ~71 test.
- **Marketplace = MISSING (greenfield by-design v0):** solo kill-list + firma + install-da-file-locale. Nessun catalogo/publish/visibility/revenue. Il "70/30" vive solo nel README.

## 2. `ArdesiaPluginManifest` — as-built + da-aggiungere
**Base reale** = `ToolManifestSchema` (`toolhost-protocol/manifest.ts:28`, Zod strictObject): `id` (reverse-DNS), `version` (semver), `capabilities` (vocab chiuso, deny-by-default), `publisher{id,pubkey}` (ed25519), `pricing{free|one-time|subscription}`, `surfaces`, `privacy`, `i18n`, `integrity.bundleSha256` (opzionale; hash del bundle firmato dentro il manifest — vedi §4.2).
**DA AGGIUNGERE (gap #1 per la layering Core→Plugin→Pack→Workflow):**
```ts
kind: "tool" | "pack" | "manual" | "workflow" | "copilot"   // MANCA: tutto è "tool"
author        // MANCA (c'è solo publisher{id,pubkey})
visibility: "private" | "unlisted" | "public"               // MANCA
marketplace?: { pricing, category, tags }                    // MANCA (c'è solo pricing piatto)
```
**Senza `kind` la gerarchia del vision NON è esprimibile** → è la singola formalizzazione a più alta leva.

## 3. Kernel di sicurezza as-built (file-ref)
- **ed25519 install-time** verify sui byte ORIGINALI del manifest (`installer.ts:53-82`, `crypto.subtle`).
- **kill-switch duale** local+remote-signed, **fail-closed** su corruzione (`killList.ts`,`killFeed.ts`), enforced sul mount reale (`ToolFrame.tsx:50 refreshKillSwitch`).
- **capability deny-by-default** + guard escalation runtime.
- **isolamento per-tool origin** + **CSP capability-closed** (`originServer.ts`).
- **SES compartment** + watchdog.
→ Supera il contratto del vision sugli assi coperti.

## 4. Due item di sicurezza — uno CHIUSO, uno APERTO
1. **rehash-at-mount / TOCTOU**: **costruito** in `~/maestro-studio` (`host.ts:156 verifyBundleIntegrity()`, difesa TOCTOU `host.ts:138-171`) **MA assente dal subtree monorepo** e **non wired** in route di prodotto. → porta in canon la versione `maestro-studio` + wire. APERTO (difesa contro swap del bundle *già installato* fra install e mount).
2. **bundleHash nel manifest firmato — CHIUSO (2026-07-08, feat/plugin-bundle-integrity)**: `ToolManifestSchema` ha ora `integrity.bundleSha256` opzionale (`manifest.ts`), impegno crittografico sul payload perché dentro i byte firmati. `installTool` ricalcola SHA-256 del bundle e rifiuta la divergenza *prima di scrivere* (`installer.ts` step 4b). `scaffoldPlugin` lo emette sempre → ogni plugin di marketplace è protetto all'install; manifest legacy senza campo restano back-compat (solo il Reference first-party fidato). Il gap residuo #1 (TOCTOU install→mount) è indipendente: qui si chiude lo swap *at-install*, lì lo swap *post-install*.

## 5. Gap di wire-reachability (capability dichiarabili ma non instradate)
Solo `board.*` e `storage.*` hanno metodi-wire reali. `graph.query`/`graph.proposeClaims`/`llm.generate`/`net.fetch`/`ui.*` sono **dichiarabili + consentibili ma NON instradate** (`messages.ts:151`, gate `policy.ts:110`). → per far lavorare un Pack disciplinare servono questi canali (es. UNLIM=`llm.generate`, grafo=`graph.query`).

## 6. Marketplace — cosa vendi davvero (tipi)
Non solo "plugin" → **combinazioni**:
- **Plugin singolo** (Fasori, Bode, MATLAB Runner)
- **Pack disciplinare** (ELABTutor Circuit Pack, Fisica-1, Analisi-1, Segnali)
- **Manuale + plugin** (Circuiti Base + Simulation Pack)
- **Workflow** (LED Arduino Passo-Passo: manuale+sim+step+quiz+student-pack-template)

## 7. Kernel marketplace P0 (subito) vs dopo
**Subito (su kernel firma/kill già reale):** registry **locale** · manifest+`kind` · firma/hash · no-modify · plugin privati · plugin first-party · snapshot · versioni.
**Dopo:** pagamento · creator portal · recensioni · marketplace pubblico · revenue-share 70/30.
Strategia (da RESEARCH-SYNTHESIS): **piggyback** MCP/Moodle/GitHub; costruisci solo il pack-hub.

## 8. P0 ASSOLUTO = montare l'host in produzione
L'host è **costruito ma non consumato** da nessuna route spedita (unico mount = `ReferenceBlinkDemo` srcDoc che **bypassa** `installTool`/firma). **B non è "costruire i primitivi" — è (i) wire della pipeline install→sign→originServer→lifecycle in una route reale, (ii) aggiungere `kind`/visibility/author/marketplace al manifest, (iii) instradare le capability non-board.** Accoppiato a MOUNT-CANVAS (montare ELAB attraverso l'host). Vedi [ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md).
