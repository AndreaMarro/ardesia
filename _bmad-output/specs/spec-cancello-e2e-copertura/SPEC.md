---
id: SPEC-cancello-e2e-copertura
companions: [journey-ammessi.md]
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

- **CAP-4**
  - **intent:** la promessa di exactly-once e contiguità dell'event-log quando più tab scrivono insieme è sorvegliata da un cancello che blocca.
  - **success:** con `RecoveryReport.recovered` forzato a `0`, `lessonos-eventlog-multitab` esce **1** mentre `golden-path`, il journey #246 e il journey shell docente escono tutti **0**.

- **CAP-5**
  - **intent:** il percorso Materiali del docente — anteprima, commit, export, riapertura a freddo — è sorvegliato da un cancello che blocca, compresa la promessa che tutto resti locale.
  - **success:** con il ramo `no-snapshot` di `restoreMessage()` che smette di nominare la memoria mancante, `saved-lessons` esce **1** mentre golden-path e i tre journey già nel cancello escono **0**.

- **CAP-6**
  - **intent:** il verdetto elettrico onesto degli esperimenti del libro è sorvegliato da un cancello che blocca — un LED in sovracorrente non può essere mostrato acceso.
  - **success:** con `LED_STRESS_THRESHOLDS.pericoloMaxAmps` portata a `100`, `sim-esp2-senza-resistore` esce **1** mentre golden-path e i quattro journey già nel cancello escono **0**.

## Constraints

- **Una alla volta, e ognuna vista fallire prima di entrare.** Una spec verde che non è mai stata rossa non è un oracolo dimostrato: è un file che passa.
- **Verde in locale non è verde in CI.** Nessuna delle 22 è mai stata eseguita su `ubuntu-latest`/node 22: non esiste una sola osservazione del loro comportamento lì. La misura di oggi autorizza a far entrare una spec, non a dichiararla verde in CI.
- **La mutazione di controllo sta nel prodotto, non nel test.** Rompere il test per vederlo rosso dimostra che il test sa fallire, non che sorveglia qualcosa.
- **La mutazione deve DISCRIMINARE**: deve lasciare verdi i journey già nel cancello. Se la prendono tutti, la spec candidata non aggiunge copertura — e la cosa va scritta, non aggirata cambiando mutazione finché una funziona.
- **Il criterio d'ingresso non è «la spec è verde»: è «cosa si rompe se il prodotto peggiora».** Una spec che diventa rossa quando il prodotto **migliora** — la characterization di un difetto noto — va tenuta fuori: in un job che blocca sarebbe un cancello che difende il difetto.
- **Il cancello difende anche una verità fisica, non solo comportamenti software.** Un declassamento del verdetto elettrico è un difetto di prodotto più grave di un bottone rotto: insegna la cosa sbagliata a chi impara.
- **La promessa di località non è decorazione.** `saved-lessons` è l'unico journey che asserisce **zero richieste** verso host diversi da `localhost`. Il repository contiene i tre volumi e citazioni verbatim: una richiesta uscente lì è un incidente, non un dettaglio.
- Convergenza: **un solo job** che blocca, con una lista esplicita che cresce di una riga per volta. Non 22 job, non un glob — un glob farebbe entrare anche ciò che nessuno ha visto fallire.

- **Il nome di un job non e' un enforcement.** Misurato il 2026-08-22 dal
  repository e non dedotto da `ci.yml`: i required status checks su `main` sono
  **tre** — `studio (typecheck + test + build)`, `engine (pytest)`,
  `hygiene (NUL + secrets + boundary + whitespace)`. Il job **`e2e journey
  (blocca)` non e' fra loro**, e `required_approving_review_count` e' **0**.
  «Blocca» significa soltanto «senza `continue-on-error`»: il job diventa rosso e
  nessuno gli deve niente. E' la stessa forma del «tetto» di
  `ToolCanvasEmbeddable` — una dichiarazione che nessun comando fa rispettare.
- **Un cancello che non ha mai girato in CI e' un oggetto locale.** Misurato:
  `gh run list --branch fix/246-durabilita-eventi` -> **zero** corse; il remoto
  porta **270** rami e **nessuno** nomina `246`; il ramo locale traccia
  `origin/main`. I cinque journey ammessi uno per volta non sono mai usciti dal
  portatile su cui sono stati scritti.

## Non-goals

- Le altre 21 spec: entrano nei giri successivi, con la stessa cerimonia.
- La suite vitest locale rossa per deriva d'ambiente (node v26.5.1 contro node 22 in CI): fuori dalla fetta, e ripararla senza misurarla su node 22 sarebbe indovinare.
- La lane advisory del golden path: resta dov'è; questa fetta ne corregge la giustificazione, non la posizione.
- La branch protection: impostazione di repository, non un file di questo albero.

Il registro dei journey ammessi e di quelli respinti, con la misura che ha deciso ciascuno, sta in `journey-ammessi.md`.

## Success signal

Chi apre una PR che rompe il ritorno alla stessa lezione vede un check rosso con scritto quale journey si è rotto — invece di un `(advisory)` verde che non ha eseguito quel journey. E chi legge `ci.yml` trova un numero con la data accanto, non un ricordo.

## Assumptions

- Rinominare il job che blocca (da `e2e-durabilita-memoria` a un nome che regge più journey) non rompe niente: quel check non è ancora in nessuna lista di required status checks.
- Le 22 spec non eseguite in CI sono verdi lì almeno quanto lo sono in locale — **assunzione, non misura**: è precisamente ciò che l'ingresso una-alla-volta esiste per verificare senza scommettere.

## Open Questions

- Se una spec promossa risultasse rossa alla prima esecuzione in CI, il journey esce dal cancello o il cancello resta rosso finché non è riparato? La seconda risposta è più onesta e più costosa: va decisa prima che capiti, non dopo.
