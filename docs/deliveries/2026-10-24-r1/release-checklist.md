# R1 — rilascio predisposto, non autorizzato

Stato: **BLOCKED**. Questa checklist non ratifica contenuti e non autorizza deploy. Il candidato pubblico verificato deriva da9121948; [report](evidence/root/public-release-check-final.json) e [binding](evidence/root/final-build-binding.json) identificano byte e sorgenti. La revisione umana deve riguardare questi digest esatti, non il nome del ramo.

| Gate | Stato / prossimo controllo |
| --- | --- |
| Integrità20asset pubblici, policy media/font self, connect none, noindex, niente UI/API/private DB | PASS locale; byte public uguali al full e al preparato Vercel |
| Legge, due varianti, nuova prova, dimensioni e dominio | Oracoli e UI PASS; firma scientifica umana PENDING |
| Voce, trascrizione, ritmo, leggibilità, claim | Binding sintetico PASS; ascolto e autorizzazione editoriale umani PENDING |
| Quattro esempi editoriali DRAFT | Approvazioni esistenti vuote; approvare digest esatti nel registro esistente oppure escludere e ricostruire/riprovare |
| Target e autorizzazione specifica di pubblicazione | PENDING; nessun progetto Vercel collegato, lettura dettagli403 |
| HTTPS provider: header/CSP/noindex, audio/font, byte, routes e vero404, reload/back/forward/CTA | NOT_RUN; sola configurazione locale non basta |
| Contatto | Manifestazione d’interesse; apertura WhatsApp e invio non eseguiti |
| Beta remota | BLOCKED, separata dalla preview statica; Auth/DB/Storage/inviti/revoca/restore da provare |

Dopo autorizzazione e accesso al target: rileggere head/CI/concorrenza; rieseguire il checker sul pacchetto sigillato; pubblicare solo la proiezione pubblica su preview isolata secondo il perimetro autorizzato; confrontare HTTP byte/hash e policy, quattro viewport, keyboard/reduced motion, audio finale, ritorno al corso e404 effettivo. Non distribuire la directory beta completa, gli access file, i DB, i raw donor o i trace con sessioni. Eventuali modifiche ai DRAFT invalidano il digest e richiedono nuova build/review.

Rollback predisposto: registrare deployment immutabile precedente, mapping target e manifest prima di cambiare qualsiasi alias. Se i gate HTTPS falliscono, lasciare la preview privata o ritirarla secondo autorizzazione; ripristinare l’alias precedente e verificare i suoi byte/header. Nessun rollback cloud eseguito qui. Nel codice, revert dei commit R1 senza migrazioni inverse: ripristina però CSP errata, transfer precedente e assenza di refresh. I v1 storici restano invariati; nessuna cancellazione di ricevute o storage.

Scheda [scientifica/editoriale](human-scientific-review-pending.md): reviewer, authorizer, decisionReference e timestamp restano NULL/PENDING finché non esiste un verbale umano. Non usare un test automatico per compilarli.
