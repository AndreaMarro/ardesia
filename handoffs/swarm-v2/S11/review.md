# Review avversariale S11

Secondo agente, sola lettura; nessuna suite pesante. Ha esaminato i file applicativi/test iniziali, Core auth/receipt/diary, sessioni browser, restore e traduttore SQL PostgreSQL. Non ha eseguito PostgreSQL o browser. La review non è firma scientifica umana o certificazione privacy.

- Riprodotto filtro mancante sul diario career-wide: suggerimenti della prima edizione apparivano nella seconda. Corretto filtro editionId, regressione RED→GREEN.
- Riprodotto evento con clock skew1000→1050 che rientrava dopo opt-out1001/re-opt-in1002. Corretto con consentId server per attivazione e fingerprint informativa; regressione RED→GREEN.
- Individuato stato VERIFIED_RESOLVED ancora visualizzato come azione aperta: ora distinto nei recuperi con verifica Core e fonti esatte; nessuna inferenza di padronanza.
- Individuato409 fonte cancellata che lasciava evidenze sullo schermo: ora invalida dati/export, test UI specifico.
- **Gap aperto S10:** riprodotto backup_data→withdrawal→restore_data corrente: live disabled/0, backup ripristinato enabled/1 anche dopo sweep scadenze. Fornito invalidate_after_restore conservativo e test del helper. Restore shared non modificato senza delega; serve test della composizione reale prima di abilitare raccolta.

Dopo la review iniziale sono state aggiunte proiezioni di confronto parent-receipt e recupero Core, testate nella regressione locale91 e UI7; controllo finale dell’autore su riferimenti, permessi e assenza di testi liberi. Il secondo agente non ha eseguito questi nuovi test.
