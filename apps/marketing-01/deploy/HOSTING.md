# Scelta hosting · verifica 23 ottobre 2026

Scelta operativa: **Render Static Site**, in un nuovo servizio riservato alla preview con autodeploy disattivato. Il connettore Render è disponibile; `wrangler whoami` ha restituito "You are not authenticated". Non sono state avviate lunghe integrazioni Cloudflare o modifiche al sito principale. Non si deduce che Cloudflare sia più lento: nessun confronto CDN fra artifact identici su più provider è stato eseguito.

| Criterio | Cloudflare Pages | Render Static Site | Netlify |
|---|---|---|---|
| Artifact | Directory HTML/CSS/JS, Git o Direct Upload | Git build Python e publish directory; skip install | Git o upload directory |
| CDN / HTTPS / dominio | Rete globale e TLS | CDN globale, TLS gestito, Brotli/HTTP2 | CDN globale e SSL |
| Preview PR | URL per PR del repository | Manuale o automatica, servizio isolato | Deploy Preview e branch deploy |
| Cache / header | `_headers`, invalidazione deploy | Headers Dashboard/Blueprint, invalidazione immediata | `_headers` e deploy atomici |
| Rollback | Precedente deploy di produzione riuscito; preview non target rollback | Artifact di deploy recente; header/rewrites/domino esclusi | Ripubblicazione deploy conservato |
| Evoluzione | Functions/Workers se serviranno | Frontend statico separato da eventuale API | Functions se serviranno |
| Stato accesso in questa sessione | Non autenticato | Connettore autorizzato disponibile | Non necessario per il fallback scelto |

**Cloudflare:** piano Pages Free $0, 500 build/mese, una build alla volta, 100 domini/progetto; richieste statiche e banda dichiarate illimitate. È un’alternativa adatta quando l’account è collegato. [Piano Pages](https://pages.cloudflare.com/) · [limiti](https://developers.cloudflare.com/pages/platform/limits/) · [preview](https://developers.cloudflare.com/pages/configuration/preview-deployments/) · [header](https://developers.cloudflare.com/pages/configuration/headers/) · [rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/).

**Render:** sito statico senza costo di compute, ma banda e minuti build consumano le quote condivise del workspace; eventuali eccedenze dipendono dal piano e dai limiti di spesa. Piano Hobby mostrato $0, 5GB banda; pipeline Starter include 500 minuti/mese. Le quote residue effettive dell’account non sono state certificate. Domini Hobby: due inclusi, ulteriori $0,25/mese ciascuno. Le preview del singolo servizio statico gratuito sono anch’esse gratuite; gli ambienti preview completi sono un prodotto distinto. [Static Sites](https://render.com/docs/static-sites) · [prezzi](https://render.com/pricing) · [pipeline](https://render.com/docs/build-pipeline) · [preview](https://render.com/docs/service-previews).

**Netlify:** nuovo modello Free con 300 crediti/mese e limite rigido, senza addebito automatico; include preview e CDN. Personal $9/mese e 1.000 crediti, Pro da $20/mese. Prezzi/crediti dipendono dal tipo di account, inclusi eventuali piani legacy. Non serve introdurre un terzo account per questa consegna. [Piani a crediti](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) · [prezzi e consumo](https://www.netlify.com/pricing/).

Isolamento: nuovo nome, sola branch GO-LIVE, nessun dominio, nessuna variabile o database copiato da altri servizi, nessuna modifica a `vercel.json`. Il build di default resta noindex anche con un URL stabile. Per produzione servirà una decisione esplicita; il nome del provider o la presenza di HTTPS non costituiscono autorizzazione al lancio.

Prestazioni: prima/dopo locale sullo stesso hardware e con la stessa emulazione; misura HTTPS finale sul provider separata. Il tunnel locale precedente non è una misura della CDN Cloudflare. Questi dati non giustificano una classifica fra CDN.

Nota rollback Render: il Dashboard disattiva autodeploy quando si torna a un artifact, l’API non lo fa automaticamente; header, rewrite e domini restano fuori dal rollback. [Comportamento e limiti del rollback](https://render.com/docs/rollbacks).
