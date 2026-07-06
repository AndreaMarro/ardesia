# Dossier per Andrea — enforcement toolhost reale vs dichiarato (ADR-0001)

Data: 2026-07-06 (sessione NOTTE-3). Questo dossier NON decide: fotografa lo
stato con evidenza file:line e test, per la decisione origin binding di
ADR-0001 (opzione B loopback vs C wildcard subdomain).

## Fatti (firsthand)

1. **`net.fetch` è DICHIARATIVO, non runtime.** `TOOL_METHODS`
   (`apps/studio/src/toolhost-protocol/messages.ts:147-154`) contiene solo
   `board.*` + `storage.*`; il commento :138-140 lo dichiara. Il router
   risponde `METHOD_NOT_FOUND` a qualunque metodo fuori registro
   (`router.ts:67`). Test che lo pinnano: `Toolhost.conformance.test.ts`
   (fs.read; net.fetch CON capability concessa, aggiunto in NOTTE-3).
2. **La "CSP chiusa" vive in un modello senza socket.**
   `originServer.ts:51-52` (`connect-src 'self'`) non è servita da nessun
   server reale: nessun iframe la riceve oggi.
3. **Bypass reale oggi:** `src/design/ToolLab.tsx:23` sandbox
   `allow-scripts allow-same-origin` + `:143` `srcDoc` SENZA CSP → l'entry
   può usare `fetch()` verso qualunque host E raggiungere il DOM dello
   Studio (same-origin ⇒ `window.parent.document` accessibile).
4. **Onestà ripristinata (NOTTE-3):** `authoringLint.ts` dichiarava "CSP
   chiusa … non arriverà / la chiamata fallirà" — falso. Corretto: i flag
   citano la policy dichiarata e ADR-0001; test-guard vieta i verbi di
   blocco inesistente (`AuthoringLint.test.ts`, test "onestà dichiarativa").

## Cosa compra l'enforcement (ADR-0001)

- Origin server reale (socket) → iframe `src=http://…` con header CSP vero:
  `connect-src` chiusa = rete bloccata dal browser, non dal galateo.
- Niente `allow-same-origin` sull'origin dello Studio → DOM Studio
  irraggiungibile per costruzione.
- **Opzione B (loopback, porta effimera per-tool):** origin reale senza DNS;
  richiede processo server locale accanto allo Studio.
- **Opzione C (wildcard subdomain):** più fedele al deploy web; richiede
  DNS/hosts e gestione certificati in dev.

## Rischio a NON decidere

Ogni tool firmato oggi gira con accesso completo a rete e DOM Studio: la
firma autentica il pacchetto ma non limita il runtime. Il gap
dichiarativo/reale cresce a ogni nuova capability.

## Prova di bypass (proposta, NON ancora implementata)

e2e Playwright: tool entry che legge `window.parent.document.title` da
srcDoc → oggi DEVE passare (bypass dimostrato); post-ADR-0001 DEVE fallire.
jsdom non vale come prova: non implementa la semantica sandbox/CSP.
