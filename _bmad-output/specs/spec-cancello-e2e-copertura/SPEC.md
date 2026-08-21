---
id: SPEC-cancello-e2e-copertura
companions: []
sources: []
---

> **Contratto canonico.** Questo SPEC è il contratto completo di cosa costruire, testare e validare per la copertura del cancello e2e.

# Il cancello e2e: quali journey bloccano, e come una spec si guadagna il posto

## Why

**Una dichiarazione invecchiata che regge una scelta di oggi.** Sopra il job `e2e golden path (advisory)` di `.github/workflows/ci.yml` c'è scritto perché la CI carica una spec su 23: «le altre non sono mai state verdi in CI, e portarle dentro tutte insieme renderebbe questa lane rumore dal primo giorno». La frase porta la data **2026-07-30** e non è mai stata rimisurata.

Misurato il **2026-08-22**: `npx playwright test --workers=3` su `apps/studio` esce **0** — 24 file, 40 test attesi, **0 inattesi**, 0 flaky, 1 skipped, 25,3 s in totale. Tutte verdi, comprese le 22 che il gate non carica; e `product-flow-shell.spec.ts`, che quel commento cita esplicitamente come rossa, oggi passa.

È la stessa famiglia di difetto del «tetto» di `ToolCanvasEmbeddable`: **una dichiarazione che nessuno script misura**, che continua a decidere mentre il mondo sotto è cambiato. Il costo non è teorico: 22 journey scritti, verdi, e nessuno li esegue dove servirebbe.

## Capabilities

- **CAP-1**
  - **intent:** il cancello e2e porta una lista leggibile dei journey che bloccano, e ogni riga registra nel `git log` il giro in cui quella spec si è guadagnata il posto.
  - **success:** un job senza `continue-on-error` con uno step per journey, ognuno con il proprio nome; `git log -p .github/workflows/ci.yml` mostra una riga aggiunta per giro.

- **CAP-2**
  - **intent:** una spec entra nel cancello solo dopo essere stata vista fallire su una mutazione del **prodotto**, non del test.
  - **success:** per `product-flow-shell.spec.ts`, la mutazione di `ViewNav` che perde lo hash della stanza porta la spec a exit **1**; il ripristino la riporta a exit **0**. Entrambi gli exit registrati.

- **CAP-3**
  - **intent:** la giustificazione della corsia advisory smette di affermare un fatto invecchiato e porta la misura di oggi con la sua data.
  - **success:** il commento di `ci.yml` cita la misura del 2026-08-22 e distingue esplicitamente «verde in locale» da «verde in CI».

## Constraints

- **Una alla volta, e ognuna vista fallire prima di entrare.** Una spec verde che non è mai stata rossa non è un oracolo dimostrato: è un file che passa.
- **Verde in locale non è verde in CI.** Nessuna delle 22 è mai stata eseguita su `ubuntu-latest`/node 22: non esiste una sola osservazione del loro comportamento lì. La misura di oggi autorizza a far entrare una spec, non a dichiararla verde in CI.
- **La mutazione di controllo sta nel prodotto, non nel test.** Rompere il test per vederlo rosso dimostra che il test sa fallire, non che sorveglia qualcosa.
- Convergenza: **un solo job** che blocca, con una lista esplicita che cresce di una riga per volta. Non 22 job, non un glob — un glob farebbe entrare anche ciò che nessuno ha visto fallire.

## Non-goals

- Le altre 21 spec: entrano nei giri successivi, con la stessa cerimonia.
- La suite vitest locale rossa per deriva d'ambiente (node v26.5.1 contro node 22 in CI): fuori dalla fetta, e ripararla senza misurarla su node 22 sarebbe indovinare.
- La lane advisory del golden path: resta dov'è; questa fetta ne corregge la giustificazione, non la posizione.
- La branch protection: impostazione di repository, non un file di questo albero.

## Success signal

Chi apre una PR che rompe il ritorno alla stessa lezione vede un check rosso con scritto quale journey si è rotto — invece di un `(advisory)` verde che non ha eseguito quel journey. E chi legge `ci.yml` trova un numero con la data accanto, non un ricordo.

## Assumptions

- Rinominare il job che blocca (da `e2e-durabilita-memoria` a un nome che regge più journey) non rompe niente: quel check non è ancora in nessuna lista di required status checks.
- Le 22 spec non eseguite in CI sono verdi lì almeno quanto lo sono in locale — **assunzione, non misura**: è precisamente ciò che l'ingresso una-alla-volta esiste per verificare senza scommettere.

## Open Questions

- Se una spec promossa risultasse rossa alla prima esecuzione in CI, il journey esce dal cancello o il cancello resta rosso finché non è riparato? La seconda risposta è più onesta e più costosa: va decisa prima che capiti, non dopo.
