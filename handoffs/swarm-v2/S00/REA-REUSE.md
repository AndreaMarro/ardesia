# S00 — decisione REA/riuso, 26 ottobre 2026

Il mandato comune REA-FIRST integra il batch corrente. Registro `registry/TARGETS.json`
letto integralmente come dati:139record, identificatori preservati; nessun edit concorrente.
S12/S15 consultati nel rendezvous306 e nella chat di acquisizione. Non sostituisce la regia S00.

| Candidato | Decisione e consumer | Risultato e limite |
| --- | --- | --- |
| TARGET-129 Vercel / Build Output API v3 | ADAPT pipeline già presente, stessa infrastruttura e progetto | Export Web+Studio sul medesimo host, scope privato esplicito; nessun nuovo hosting/DB/orchestratore. API autorizzata, non codice proprietario copiato. |
| TARGET-131 GitHub Actions | REUSE workflow e sette required checks già pinnati | Merge tree esatto, strict/enforceAdmins invariati, post-merge. Nessun nuovo servizio CI o bypass. |
| TARGET-095 Playwright / AST / rg | REUSE Playwright1.60.0 Apache-2.0 dal lock | Verifica asset, route, UI, Formula/CSP e screenshot; niente mock del backend o exit senza asserzioni. |
| TARGET-080 Excalidraw0.18.1 | ADAPT editor completo già adottato | Conservati canvas, WorkspaceStore e journal. Rimossi config Firebase dell'app upstream e fallback CDN dei font dall'editor embedded; font e notice distinti dalla licenza MIT del codice. |
| TARGET-081 MathLive0.111.1 + MathJax3.2.1 giàlocked | REUSE editor e browser renderer completo | MathJaxfull locale, Apache notice, caricamento lazy, retry e base path; entry CJS escluso, nessun renderer matematico riscritto. |

Netlify/Cloudflare e un nuovo orchestratore sono DEFER: non sostituiscono un consumer mancante
e introdurrebbero migrazione/configurazione aggiuntive senza beneficio misurato. Non vengono
presentati come donor analizzati con REA o benchmark eseguiti.

## Transfer ticket: ambiente dell'editor e packaging integrato

1. **Target/versione:** build Studio72b6bf2c, Excalidraw0.18.1 e MathJax3.2.1 dal lock;
   REA CLI6.7.0 pinned. MCP assente all'inizio, nuovamente esposto e verificato al
   checkpoint successivo; successiva disponibilità da rileggere, nessun setup globale.
2. **Comportamento:** editor completo nello stesso origin di Aula, Formula locale,
   font senza richieste a donor, metadata e asset di release verificati.
3. **Percorso osservato:** `/studio/`→Formula→inserisci sulla lavagna; FormulaSVG
   corretta ma fallback234font verso esm.sh bloccato dalla CSP. Correzione al
   bundle e al base path, poi ingresso `/studio` senza slash e reload.
4. **Evidence originale:** `ev_819561ab589108e446d7b3c27d23f12b781e1b0ad179f4b12978d21945b7a9c4`.
   JSON SHA256 `15cc2ba7fe085fc23d035c49925b1311071856648cd7132b734f19732249217e`,
   artefatto SHA256 `b1a70032937fda1120b53323e1e73870cffc91456348109793e940030d83f8ff`.
5. **Screenshot/prova:** output S00 `local-v2-failed/studio-formula.png`, runner
   committato `verify-preview.mjs`, successiva prova locale779PASS sulla fonte2026ec75.
   Non è una cattura REA UI: browser Playwright e analisi statica REA sono prove distinte.
6. **Limiti:** selezionato il solo `assets/excalidrawConfig-Jh_prU-H.js`; graph
   parziale, semantic graph troncato dal limite1500nodi. Nessuna analisi completa
   dell'app, comprensione semantica del docente o prova di efficacia umana.
7. **Diritti:** Excalidraw MIT, MathJax Apache-2.0, font con notice separati.
   Liberation1.05 resta legacy GPL con eccezioni; source preferito esatto non verificato,
   nessuna certificazione di distribuzione pubblica Studio. Preview interna protetta.
8. **Specifica Ardesia:** stessa origine per script/font/API, nessuna autorità
   parallela; backend assente503 e DRAFT editoriali non inclusi nel client.
9. **Riuso:** pipeline builder/checker/uploader, client Web, editor Studio,
   MathLive/MathJax, font locked, sessioni/store/journal esistenti.
10. **Codice:** modalità privata nei tool di release; snapshot immutabile upload;
    adapter ambiente Excalidraw, browser renderer MathJax e notice verificati per hash.
11. **Test:** RED flag mancante; RED URLCDN; RED rimozione markerDRAFT dopo snapshot;
    GREEN27pipeline,10miratiStudio al checkpoint dei notice;779browser prima degli
    ultimi notice e del mergeS09. Il candidato finale va ricontrollato, non eredita779.
12. **Confronto:** rimangono canvas/plugin/formati canonici, Formula produceSVG
    senza rete donor; non equivale a beta remota autenticata, ancora non configurata.
13. **Costo complessivo:** UNKNOWN. Runtime REA, debugging, review, licenze,
    interruzioni e lavoro parallelo non isolano un controfattuale diretto misurato;
    nessun fattore di accelerazione dichiarato.

**Errore corretto:** il primo comando REA usava un nome chunk non presente e ha
restituito invalid_request, non Evidence di successo. Ripetuto solo dopo `rg`
sull'artefatto, con il file reale. La review ha inoltre ritirato il falso finding
su dateLabel: ore/minuti erano presenti. La correzione storica rimane datata;
il miglioramento S09 anno/offset è una decisione dell'owner, non prova del falso bug.
