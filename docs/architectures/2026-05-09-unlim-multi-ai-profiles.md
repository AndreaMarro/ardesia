# UNLIM multi-AI profiles

Data: 2026-05-09
Stato: implementato localmente, non deployato.

## Obiettivo

UNLIM non deve essere una sola chat generica. Deve avere una regia di profili AI:

- conoscitore totale software + volumi;
- general purpose rapido;
- controllo qualita/azioni;
- Pixtral totale per screenshot/foto/schermo;
- Pixtral essenziale per lettura visiva compressa;
- due profili per ogni modalita di lavagna: `*_total` e `*_compact`.

Tutti i profili devono parlare in stile ELAB: naturale, breve, operativo, con analogie/metafore solo quando servono.

## Implementazione

Fonte profili: `supabase/functions/_shared/unlim-ai-profiles.ts`.

Profili nominati:
- `knowledge_total`
- `general_purpose_compact`
- `control_total`
- `control_compact`
- `pixtral_total`
- `pixtral_essential`

Profili per modalita:
- `percorso_total` / `percorso_compact`
- `passopasso_total` / `passopasso_compact`
- `montato_total` / `montato_compact`
- `libero_total` / `libero_compact`

Ogni profilo definisce:
- modalita;
- profondita `total` o `compact`;
- budget parole;
- provider visivo preferito;
- possibilita screenshot;
- blocco prompt;
- contesto software full o compresso.

## Chat

`supabase/functions/unlim-chat/index.ts` seleziona il profilo con `selectUnlimAiProfile()` usando:
- testo utente;
- immagini presenti;
- profilo richiesto dal client;
- profondita richiesta;
- modalita lavagna;
- stato circuito.

Il profilo viene iniettato nel system prompt tramite `buildSystemPrompt(..., activeAiProfile)` e torna nella risposta come `aiProfile`.

## Visione

`supabase/functions/unlim-vision/index.ts` usa gli stessi profili:
- screenshot/foto di default vanno su `pixtral_total`;
- richieste con "essenziale", "breve", "rapido" vanno su `pixtral_essential`;
- il prompt visivo riceve anche la conoscenza software ELAB, cosi Pixtral legge lo schermo come parte del prodotto, non come immagine generica.

`src/components/lavagna/useGalileoChat.js` forza `pixtral_total` quando l'utente chiede di guardare lo schermo o quando usa screenshot dalla lavagna.

## Client

`src/services/api.js` aggiunge:
- `inferAiProfileHint()`;
- `normalizeUnlimMode()`;
- invio di `aiProfile`, `aiDepth`, `unlimMode` a `unlim-chat`;
- invio di `aiProfile`/`aiDepth` a `unlim-vision`.

## Verifica

Test aggiunto: `tests/unit/unlimAiProfiles.test.js`.

Copre:
- due profili per modalita;
- profili richiesti da Andrea;
- routing screenshot verso Pixtral totale/essenziale;
- injection di software knowledge + stile ELAB nel system prompt;
- wiring chat/vision/client.

Comando verificato:

`npx vitest run tests/unit/unlimAiProfiles.test.js tests/unit/unlimRagBypassSystemPrompt.test.js tests/unit/unlimResponseQualityRouter.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/lavagna/useGalileoChatFastPath.test.jsx tests/unit/unlimFastResponseBudget.test.js`

Esito: 6 file passati, 21 test passati.

## Limite aperto

Questo rende l'architettura pronta, ma non dimostra ancora che UNLIM conosca davvero "perfettamente" i volumi. Per quello serve generare un pack completo dai materiali locali e testarlo con domande difficili su capitoli/pagine/esperimenti non ovvi.
